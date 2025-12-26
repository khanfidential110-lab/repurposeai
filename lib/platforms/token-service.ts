// In-memory token storage (replace with database in production)
// This provides the core token management functionality

import { ConnectedAccount, OAuthToken, PLATFORM_CONFIGS } from './types';

// In-memory storage for development
const connectedAccounts = new Map<string, ConnectedAccount>();

// Token buffer time - refresh 5 minutes before expiry
const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutes in ms

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
    refreshToken: string
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
            refresh_token: refreshToken,
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
            refreshToken: data.refresh_token || refreshToken, // Some platforms don't return new refresh token
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
 * Get a valid access token for a connected account
 * Automatically refreshes if expired
 */
export async function getValidAccessToken(accountId: string): Promise<string | null> {
    const account = connectedAccounts.get(accountId);

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
        connectedAccounts.set(accountId, account);
        return null;
    }

    // Update stored tokens
    account.tokens = newToken;
    account.lastUsedAt = new Date().toISOString();
    connectedAccounts.set(accountId, account);

    console.log(`Token refreshed successfully for ${account.platform}`);
    return newToken.accessToken;
}

/**
 * Store a connected account
 */
export function storeConnectedAccount(account: ConnectedAccount): void {
    connectedAccounts.set(account.id, account);
}

/**
 * Get all connected accounts for a user
 */
export function getConnectedAccounts(userId: string): ConnectedAccount[] {
    return Array.from(connectedAccounts.values()).filter(
        (account) => account.userId === userId
    );
}

/**
 * Get a specific connected account
 */
export function getConnectedAccount(accountId: string): ConnectedAccount | undefined {
    return connectedAccounts.get(accountId);
}

/**
 * Get connected account by platform for a user
 */
export function getConnectedAccountByPlatform(
    userId: string,
    platform: string
): ConnectedAccount | undefined {
    return Array.from(connectedAccounts.values()).find(
        (account) => account.userId === userId && account.platform === platform
    );
}

/**
 * Remove a connected account
 */
export function removeConnectedAccount(accountId: string): boolean {
    return connectedAccounts.delete(accountId);
}

/**
 * Update token for an existing account
 */
export function updateAccountTokens(accountId: string, tokens: OAuthToken): boolean {
    const account = connectedAccounts.get(accountId);
    if (!account) return false;

    account.tokens = tokens;
    account.lastUsedAt = new Date().toISOString();
    connectedAccounts.set(accountId, account);
    return true;
}
