// OAuth Callback for TikTok
import { NextRequest, NextResponse } from 'next/server';
import { storeConnectedAccount } from '@/lib/platforms/token-service';
import { ConnectedAccount, PLATFORM_CONFIGS } from '@/lib/platforms/types';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=${error}`);
    }

    if (!code) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=no_code`);
    }

    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'}/api/oauth/callback/tiktok`;

    if (!clientKey || !clientSecret) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=not_configured`);
    }

    try {
        const tokenResponse = await fetch(PLATFORM_CONFIGS.tiktok.tokenUrl!, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cache-Control': 'no-cache',
            },
            body: new URLSearchParams({
                client_key: clientKey,
                client_secret: clientSecret,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri,
            }),
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('TikTok token failed:', errorText);
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=token_failed`);
        }

        const tokens = await tokenResponse.json();

        // Fetch user info
        const userResponse = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=display_name,avatar_url', {
            headers: {
                'Authorization': `Bearer ${tokens.access_token}`,
            },
        });

        const userData = await userResponse.json();
        const userInfo = userData.data.user;

        // Get userId from state parameter (passed during OAuth initiation)
        const state = searchParams.get('state');
        const userId = state ? JSON.parse(atob(state)).userId : 'anonymous';

        const account: ConnectedAccount = {
            id: `tiktok_${userData.data.open_id}_${Date.now()}`,
            platform: 'tiktok',
            userId: userId,
            platformUserId: userData.data.open_id,
            platformUsername: userInfo.display_name,
            profileImageUrl: userInfo.avatar_url,
            tokens: {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiresAt: Date.now() + (tokens.expires_in * 1000),
                tokenType: 'Bearer',
                scope: tokens.scope,
            },
            isActive: true,
            connectedAt: new Date().toISOString(),
        };

        await storeConnectedAccount(account);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?success=tiktok_connected`);
    } catch (e) {
        console.error('TikTok OAuth error:', e);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=connection_failed`);
    }
}
