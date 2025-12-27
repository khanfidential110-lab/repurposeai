// FunClip AI Clipping API - Automatic intelligent video clipping
import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from "@sentry/nextjs";
import rateLimit from '@/lib/rate-limit';

// Initialize rate limiter (3 requests per minute - very expensive operations)
const limiter = rateLimit({
    uniqueTokenPerInterval: 500,
    interval: 60000,
});

const FUNCLIP_API_URL = process.env.FUNCLIP_API_URL || 'http://localhost:8000';

interface ClipResult {
    index: number;
    start: number;
    end: number;
    text: string;
    path?: string;
    url?: string;
}

/**
 * POST /api/funclip/ai-clip
 * Use AI to automatically identify and extract the best clips from a video
 */
export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const ip = request.headers.get('x-forwarded-for') || 'anonymous';
        try {
            await limiter.check(NextResponse.next(), 3, ip);
        } catch {
            return NextResponse.json(
                { error: 'Rate limit exceeded. AI clipping is resource-intensive.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { videoUrl, prompt, numClips = 3 } = body;

        if (!videoUrl) {
            return NextResponse.json(
                { error: 'videoUrl is required' },
                { status: 400 }
            );
        }

        if (numClips < 1 || numClips > 10) {
            return NextResponse.json(
                { error: 'numClips must be between 1 and 10' },
                { status: 400 }
            );
        }

        console.log('[FunClip] Starting AI clipping:', { videoUrl, prompt, numClips });

        // Call FunClip AI clipping service
        const response = await fetch(`${FUNCLIP_API_URL}/ai-clip`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                video_url: videoUrl,
                prompt: prompt || null,
                num_clips: numClips,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('[FunClip] AI clipping failed:', error);
            throw new Error(`FunClip AI clipping failed: ${error}`);
        }

        const clips: ClipResult[] = await response.json();

        console.log('[FunClip] AI clipping complete:', {
            numClips: clips.length,
            totalDuration: clips.reduce((sum, c) => sum + (c.end - c.start), 0)
        });

        return NextResponse.json({
            success: true,
            clips: clips.map(clip => ({
                index: clip.index,
                start: clip.start,
                end: clip.end,
                duration: clip.end - clip.start,
                text: clip.text,
                url: clip.url || clip.path,
            })),
        });

    } catch (error) {
        console.error('[FunClip] AI Clip Error:', error);
        Sentry.captureException(error);

        if (error instanceof TypeError && error.message.includes('fetch')) {
            return NextResponse.json(
                {
                    error: 'FunClip service unavailable',
                    details: 'The AI clipping service is temporarily offline.'
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to generate AI clips' },
            { status: 500 }
        );
    }
}
