// OAuth Initiation API - Start the OAuth flow for a platform
import { NextRequest, NextResponse } from 'next/server';
import { PLATFORM_CONFIGS } from '@/lib/platforms/types';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');

    if (!platform || !PLATFORM_CONFIGS[platform]) {
        return NextResponse.json(
            { error: 'Invalid platform' },
            { status: 400 }
        );
    }

    const config = PLATFORM_CONFIGS[platform];
    const clientId = process.env[`${platform.toUpperCase()}_CLIENT_ID`];

    if (!clientId) {
        return NextResponse.json(
            { error: `${platform} integration not configured. Please add ${platform.toUpperCase()}_CLIENT_ID to environment.` },
            { status: 500 }
        );
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005'}/api/oauth/callback/${platform}`;

    // Build authorization URL
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: config.scopes?.join(' ') || '',
        access_type: 'offline', // Request refresh token (Google)
        prompt: 'consent', // Force consent to get refresh token
    });

    // Platform-specific params
    if (platform === 'twitter') {
        params.set('code_challenge', 'challenge'); // Twitter requires PKCE
        params.set('code_challenge_method', 'plain');
    }

    const authUrl = `${config.authUrl}?${params.toString()}`;

    return NextResponse.redirect(authUrl);
}
