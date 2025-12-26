// OAuth token storage with Firestore persistence
// Falls back to in-memory storage if Firestore is unavailable

import { db, isFirebaseConfigured } from '@/lib/firebase/config';
import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    Firestore
} from 'firebase/firestore';
import { ConnectedAccount, OAuthToken, PLATFORM_CONFIGS } from './types';

const ACCOUNTS_COLLECTION = 'connected_accounts';

// In-memory fallback storage
const memoryAccounts = new Map<string, ConnectedAccount>();

// Token buffer time - refresh 5 minutes before expiry
const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000;

// Check if we should use Firestore
function useFirestore(): boolean {
    return !!isFirebaseConfigured && db !== null;
}

/**
 * Check if a token is expired or about to expire
 */
export function isTokenExpired(token: OAuthToken): boolean {
    return Date.now() >= (token.expiresAt - TOKEN_REFRESH_BUFFER);
}

/**
 * Refresh an OAuth token using the refresh token
 */
async function refreshToken(
    platform: string,
    refreshTokenValue: string
): Promise<OAuthToken | null> {
    const config = PLATFORM_CONFIGS[platform];
    if (!config?.tokenUrl) {
        console.error(`No token URL configured for platform: ${platform}`);
        return null;
    }

    const clientId = process.env[`${platform.toUpperCase()}_CLIENT_ID`];
    const clientSecret = process.env[`${platform.toUpperCase()}_CLIENT_SECRET`];

    if (!clientId || !clientSecret) {
        console.error(`Missing OAuth credentials for ${platform}`);
        return null;
    }

    try {
        const params = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshTokenValue,
            client_id: clientId,
            client_secret: clientSecret,
        });

        const response = await fetch(config.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error(`Token refresh failed for ${platform}:`, error);
            return null;
        }

        const data = await response.json();

        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token || refreshTokenValue,
            expiresAt: Date.now() + (data.expires_in * 1000),
            tokenType: data.token_type || 'Bearer',
            scope: data.scope,
        };
    } catch (error) {
        console.error(`Error refreshing token for ${platform}:`, error);
        return null;
    }
}

/**
 * Store a connected account
 */
export async function storeConnectedAccount(account: ConnectedAccount): Promise<void> {
    if (useFirestore()) {
        try {
            await setDoc(doc(db as Firestore, ACCOUNTS_COLLECTION, account.id), account);
            return;
        } catch (error) {
            console.warn('Failed to store account in Firestore, using memory:', error);
        }
    }
    memoryAccounts.set(account.id, account);
}

/**
 * Get all connected accounts for a user
 */
export async function getConnectedAccounts(userId: string): Promise<ConnectedAccount[]> {
    if (useFirestore()) {
        try {
            const q = query(
                collection(db as Firestore, ACCOUNTS_COLLECTION),
                where('userId', '==', userId)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ConnectedAccount));
        } catch (error) {
            console.warn('Failed to get accounts from Firestore:', error);
        }
    }
    return Array.from(memoryAccounts.values()).filter(a => a.userId === userId);
}

/**
 * Get a specific connected account
 */
export async function getConnectedAccount(accountId: string): Promise<ConnectedAccount | undefined> {
    if (useFirestore()) {
        try {
            const docRef = doc(db as Firestore, ACCOUNTS_COLLECTION, accountId);
            const snapshot = await getDoc(docRef);
            if (snapshot.exists()) {
                return { id: snapshot.id, ...snapshot.data() } as ConnectedAccount;
            }
            return undefined;
        } catch (error) {
            console.warn('Failed to get account from Firestore:', error);
        }
    }
    return memoryAccounts.get(accountId);
}

/**
 * Get connected account by platform for a user
 */
export async function getConnectedAccountByPlatform(
    userId: string,
    platform: string
): Promise<ConnectedAccount | undefined> {
    if (useFirestore()) {
        try {
            const q = query(
                collection(db as Firestore, ACCOUNTS_COLLECTION),
                where('userId', '==', userId),
                where('platform', '==', platform)
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                return { id: doc.id, ...doc.data() } as ConnectedAccount;
            }
            return undefined;
        } catch (error) {
            console.warn('Failed to get account by platform from Firestore:', error);
        }
    }
    return Array.from(memoryAccounts.values()).find(
        a => a.userId === userId && a.platform === platform
    );
}

/**
 * Remove a connected account
 */
export async function removeConnectedAccount(accountId: string): Promise<boolean> {
    if (useFirestore()) {
        try {
            await deleteDoc(doc(db as Firestore, ACCOUNTS_COLLECTION, accountId));
            return true;
        } catch (error) {
            console.warn('Failed to delete account from Firestore:', error);
        }
    }
    return memoryAccounts.delete(accountId);
}

/**
 * Update token for an existing account
 */
export async function updateAccountTokens(accountId: string, tokens: OAuthToken): Promise<boolean> {
    if (useFirestore()) {
        try {
            const docRef = doc(db as Firestore, ACCOUNTS_COLLECTION, accountId);
            await updateDoc(docRef, {
                tokens,
                lastUsedAt: new Date().toISOString()
            });
            return true;
        } catch (error) {
            console.warn('Failed to update tokens in Firestore:', error);
        }
    }
    const account = memoryAccounts.get(accountId);
    if (!account) return false;
    account.tokens = tokens;
    account.lastUsedAt = new Date().toISOString();
    memoryAccounts.set(accountId, account);
    return true;
}

/**
 * Get a valid access token for a connected account
 * Automatically refreshes if expired
 */
export async function getValidAccessToken(accountId: string): Promise<string | null> {
    const account = await getConnectedAccount(accountId);

    if (!account) {
        console.error(`Connected account not found: ${accountId}`);
        return null;
    }

    // Check if token is still valid
    if (!isTokenExpired(account.tokens)) {
        return account.tokens.accessToken;
    }

    // Token expired - attempt refresh
    if (!account.tokens.refreshToken) {
        console.error(`No refresh token available for account: ${accountId}`);
        return null;
    }

    console.log(`Refreshing token for ${account.platform} account: ${account.platformUsername}`);

    const newToken = await refreshToken(account.platform, account.tokens.refreshToken);

    if (!newToken) {
        // Mark account as needing reconnection
        account.isActive = false;
        await storeConnectedAccount(account);
        return null;
    }

    // Update stored tokens
    await updateAccountTokens(accountId, newToken);

    console.log(`Token refreshed successfully for ${account.platform}`);
    return newToken.accessToken;
}
