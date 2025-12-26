// OAuth Callback for Twitter/X
import { NextRequest, NextResponse } from 'next/server';
import { storeConnectedAccount } from '@/lib/platforms/token-service';
import { ConnectedAccount, PLATFORM_CONFIGS } from '@/lib/platforms/types';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=${encodeURIComponent(error)}`
        );
    }

    if (!code) {
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=no_code`
        );
    }

    const clientId = process.env.TWITTER_CLIENT_ID;
    const clientSecret = process.env.TWITTER_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'}/api/oauth/callback/twitter`;

    if (!clientId || !clientSecret) {
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=not_configured`
        );
    }

    try {
        // Exchange code for tokens
        const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

        const tokenResponse = await fetch(PLATFORM_CONFIGS.twitter.tokenUrl!, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${basicAuth}`,
            },
            body: new URLSearchParams({
                code,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
                code_verifier: 'challenge', // Must match PKCE challenge
            }).toString(),
        });

        if (!tokenResponse.ok) {
            const error = await tokenResponse.text();
            console.error('Twitter token exchange failed:', error);
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=token_exchange_failed`
            );
        }

        const tokens = await tokenResponse.json();

        // Get user info from Twitter
        const userResponse = await fetch(
            'https://api.twitter.com/2/users/me?user.fields=profile_image_url',
            {
                headers: {
                    Authorization: `Bearer ${tokens.access_token}`,
                },
            }
        );

        const userData = await userResponse.json();
        const userInfo = userData.data;

        // Get userId from state parameter (passed during OAuth initiation)
        const state = searchParams.get('state');
        const userId = state ? JSON.parse(atob(state)).userId : 'anonymous';

        // Store the connected account
        const account: ConnectedAccount = {
            id: `twitter_${userInfo.id}_${Date.now()}`,
            platform: 'twitter',
            userId: userId, // Real user ID from state
            platformUserId: userInfo.id,
            platformUsername: `@${userInfo.username}`,
            profileImageUrl: userInfo.profile_image_url,
            tokens: {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiresAt: Date.now() + (tokens.expires_in * 1000),
                tokenType: tokens.token_type || 'Bearer',
                scope: tokens.scope,
            },
            isActive: true,
            connectedAt: new Date().toISOString(),
        };

        storeConnectedAccount(account);

        console.log('Twitter account connected:', account.platformUsername);

        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=twitter_connected`
        );
    } catch (error) {
        console.error('Twitter OAuth callback error:', error);
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=connection_failed`
        );
    }
}
