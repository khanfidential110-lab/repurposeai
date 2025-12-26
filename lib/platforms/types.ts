// Platform OAuth Token Types

export interface OAuthToken {
    accessToken: string;
    refreshToken?: string;
    expiresAt: number; // Unix timestamp in milliseconds
    tokenType: string;
    scope?: string;
}

export interface ConnectedAccount {
    id: string;
    platform: 'youtube' | 'twitter' | 'instagram' | 'linkedin' | 'tiktok';
    userId: string;
    platformUserId: string;
    platformUsername: string;
    profileImageUrl?: string;
    tokens: OAuthToken;
    isActive: boolean;
    connectedAt: string;
    lastUsedAt?: string;
}

export interface PlatformConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    authUrl: string;
    tokenUrl: string;
    scopes: string[];
}

// Platform configurations
export const PLATFORM_CONFIGS: Record<string, Partial<PlatformConfig>> = {
    // ... existing configs
    youtube: {
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        scopes: [
            'https://www.googleapis.com/auth/youtube.upload',
            'https://www.googleapis.com/auth/youtube.readonly',
            'https://www.googleapis.com/auth/userinfo.profile',
        ],
    },
    twitter: {
        authUrl: 'https://twitter.com/i/oauth2/authorize',
        tokenUrl: 'https://api.twitter.com/2/oauth2/token',
        scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    },
    // NEW: TikTok
    tiktok: {
        authUrl: 'https://www.tiktok.com/v2/auth/authorize/',
        tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token/',
        scopes: ['user.info.basic', 'video.upload', 'video.publish'],
    },
    // NEW: Facebook/Instagram
    facebook: {
        authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
        tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
        scopes: ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts', 'instagram_basic', 'instagram_content_publish'],
    },
    // NEW: Pinterest
    pinterest: {
        authUrl: 'https://www.pinterest.com/oauth/',
        tokenUrl: 'https://api.pinterest.com/v5/oauth/token',
        scopes: ['boards:read', 'pins:read', 'pins:write'],
    },
    linkedin: {
        authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
        tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
        scopes: ['r_liteprofile', 'w_member_social'],
    },
};
