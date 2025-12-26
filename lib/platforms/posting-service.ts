// Platform posting service - Post content to connected platforms
import { getValidAccessToken, getConnectedAccountByPlatform } from './token-service';

export interface PostContent {
    text: string;
    mediaUrl?: string;
    title?: string;
    description?: string;
    tags?: string[];
}

export interface PostResult {
    success: boolean;
    platform: string;
    postId?: string;
    postUrl?: string;
    error?: string;
}

/**
 * Post content to YouTube
 */
export async function postToYouTube(
    userId: string,
    content: PostContent
): Promise<PostResult> {
    const account = getConnectedAccountByPlatform(userId, 'youtube');

    if (!account) {
        return {
            success: false,
            platform: 'youtube',
            error: 'No YouTube account connected',
        };
    }

    const accessToken = await getValidAccessToken(account.id);

    if (!accessToken) {
        return {
            success: false,
            platform: 'youtube',
            error: 'Failed to get valid access token. Please reconnect your YouTube account.',
        };
    }

    try {
        // YouTube requires video upload via resumable upload
        // This is a simplified example - real implementation needs chunked upload
        console.log('Posting to YouTube with token:', accessToken.substring(0, 10) + '...');

        // For now, return simulated success
        // Real implementation would use YouTube Data API v3
        return {
            success: true,
            platform: 'youtube',
            postId: `yt_${Date.now()}`,
            postUrl: 'https://youtube.com/watch?v=example',
        };
    } catch (error: any) {
        console.error('YouTube post error:', error);
        return {
            success: false,
            platform: 'youtube',
            error: error.message || 'Failed to post to YouTube',
        };
    }
}

/**
 * Post content to Twitter/X
 */
export async function postToTwitter(
    userId: string,
    content: PostContent
): Promise<PostResult> {
    const account = getConnectedAccountByPlatform(userId, 'twitter');

    if (!account) {
        return {
            success: false,
            platform: 'twitter',
            error: 'No Twitter account connected',
        };
    }

    const accessToken = await getValidAccessToken(account.id);

    if (!accessToken) {
        return {
            success: false,
            platform: 'twitter',
            error: 'Failed to get valid access token. Please reconnect your Twitter account.',
        };
    }

    try {
        // Twitter API v2 - Post a tweet
        const response = await fetch('https://api.twitter.com/2/tweets', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: content.text.substring(0, 280), // Twitter limit
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || error.title || 'Twitter API error');
        }

        const data = await response.json();

        return {
            success: true,
            platform: 'twitter',
            postId: data.data.id,
            postUrl: `https://twitter.com/i/web/status/${data.data.id}`,
        };
    } catch (error: any) {
        console.error('Twitter post error:', error);
        return {
            success: false,
            platform: 'twitter',
            error: error.message || 'Failed to post to Twitter',
        };
    }
}

/**
 * Post content to TikTok
 */
export async function postToTikTok(userId: string, content: PostContent): Promise<PostResult> {
    const account = getConnectedAccountByPlatform(userId, 'tiktok');
    if (!account) return { success: false, platform: 'tiktok', error: 'No TikTok account connected' };

    const accessToken = await getValidAccessToken(account.id);
    if (!accessToken) return { success: false, platform: 'tiktok', error: 'Token expired' };

    try {
        console.log('Posting to TikTok...');
        // TikTok Direct Post API flow (simplified)
        // 1. Init upload
        // 2. Upload video
        // 3. Publish

        return {
            success: true,
            platform: 'tiktok',
            postId: `tk_${Date.now()}`,
            postUrl: 'https://www.tiktok.com/@user/video/example',
        };
    } catch (e: any) {
        return { success: false, platform: 'tiktok', error: e.message };
    }
}

/**
 * Post to LinkedIn
 */
export async function postToLinkedIn(userId: string, content: PostContent): Promise<PostResult> {
    const account = getConnectedAccountByPlatform(userId, 'linkedin');
    if (!account) return { success: false, platform: 'linkedin', error: 'No LinkedIn account connected' };

    const accessToken = await getValidAccessToken(account.id);

    try {
        const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                author: `urn:li:person:${account.platformUserId}`,
                lifecycleState: 'PUBLISHED',
                specificContent: {
                    'com.linkedin.ugc.ShareContent': {
                        shareCommentary: { text: content.text },
                        shareMediaCategory: 'NONE', // or IMAGE/VIDEO
                    },
                },
                visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
            }),
        });

        if (!response.ok) throw new Error('LinkedIn API Error');
        const data = await response.json();

        return {
            success: true,
            platform: 'linkedin',
            postId: data.id,
        };
    } catch (e: any) {
        return { success: false, platform: 'linkedin', error: e.message };
    }
}

/**
 * Post content to multiple platforms
 */
export async function postToMultiplePlatforms(
    userId: string,
    content: Record<string, PostContent>,
    platforms: string[]
): Promise<PostResult[]> {
    const results: PostResult[] = [];

    for (const platform of platforms) {
        const platformContent = content[platform] || content.default;

        if (!platformContent) {
            results.push({
                success: false,
                platform,
                error: 'No content provided for this platform',
            });
            continue;
        }

        switch (platform) {
            case 'youtube':
                results.push(await postToYouTube(userId, platformContent));
                break;
            case 'twitter':
                results.push(await postToTwitter(userId, platformContent));
                break;
            case 'tiktok':
                results.push(await postToTikTok(userId, platformContent));
                break;
            case 'linkedin':
                results.push(await postToLinkedIn(userId, platformContent));
                break;
            default:
                results.push({
                    success: false,
                    platform,
                    error: `Platform ${platform} not supported yet`,
                });
        }
    }

    return results;
}
