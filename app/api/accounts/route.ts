// API to manage connected accounts
import { NextRequest, NextResponse } from 'next/server';
import {
    getConnectedAccounts,
    getConnectedAccount,
    removeConnectedAccount
} from '@/lib/platforms/token-service';

// GET - List all connected accounts for current user
export async function GET() {
    try {
        // In production, get user ID from session
        const userId = 'demo-user';

        const accounts = getConnectedAccounts(userId);

        // Remove sensitive token data from response
        const safeAccounts = accounts.map(account => ({
            id: account.id,
            platform: account.platform,
            platformUsername: account.platformUsername,
            profileImageUrl: account.profileImageUrl,
            isActive: account.isActive,
            connectedAt: account.connectedAt,
            lastUsedAt: account.lastUsedAt,
            // Show token status without exposing actual tokens
            tokenStatus: {
                hasAccessToken: !!account.tokens.accessToken,
                hasRefreshToken: !!account.tokens.refreshToken,
                expiresAt: new Date(account.tokens.expiresAt).toISOString(),
                isExpired: Date.now() >= account.tokens.expiresAt,
            },
        }));

        return NextResponse.json({
            success: true,
            accounts: safeAccounts,
        });
    } catch (error) {
        console.error('Error fetching connected accounts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch connected accounts' },
            { status: 500 }
        );
    }
}

// DELETE - Disconnect an account
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const accountId = searchParams.get('id');

        if (!accountId) {
            return NextResponse.json(
                { error: 'Account ID is required' },
                { status: 400 }
            );
        }

        const account = getConnectedAccount(accountId);
        if (!account) {
            return NextResponse.json(
                { error: 'Account not found' },
                { status: 404 }
            );
        }

        // In production, verify user owns this account
        removeConnectedAccount(accountId);

        return NextResponse.json({
            success: true,
            message: `Disconnected ${account.platform} account: ${account.platformUsername}`,
        });
    } catch (error) {
        console.error('Error disconnecting account:', error);
        return NextResponse.json(
            { error: 'Failed to disconnect account' },
            { status: 500 }
        );
    }
}
