// OAuth Callback for YouTube (Google)
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

    const clientId = process.env.YOUTUBE_CLIENT_ID;
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'}/api/oauth/callback/youtube`;

    if (!clientId || !clientSecret) {
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=not_configured`
        );
    }

    try {
        // Exchange code for tokens
        const tokenResponse = await fetch(PLATFORM_CONFIGS.youtube.tokenUrl!, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }).toString(),
        });

        if (!tokenResponse.ok) {
            const error = await tokenResponse.text();
            console.error('YouTube token exchange failed:', error);
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=token_exchange_failed`
            );
        }

        const tokens = await tokenResponse.json();

        // Get user info from YouTube
        const userResponse = await fetch(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            {
                headers: {
                    Authorization: `Bearer ${tokens.access_token}`,
                },
            }
        );

        const userInfo = await userResponse.json();

        // Get userId from state parameter (passed during OAuth initiation)
        const state = searchParams.get('state');
        const userId = state ? JSON.parse(atob(state)).userId : 'anonymous';

        // Store the connected account
        const account: ConnectedAccount = {
            id: `youtube_${userInfo.id}_${Date.now()}`,
            platform: 'youtube',
            userId: userId, // Real user ID from state
            platformUserId: userInfo.id,
            platformUsername: userInfo.name || userInfo.email,
            profileImageUrl: userInfo.picture,
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

        console.log('YouTube account connected:', account.platformUsername);

        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=youtube_connected`
        );
    } catch (error) {
        console.error('YouTube OAuth callback error:', error);
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/settings?error=connection_failed`
        );
    }
}
