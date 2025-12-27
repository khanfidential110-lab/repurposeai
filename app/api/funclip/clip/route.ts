// FunClip Manual Clipping API - Extract specific segments
import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from "@sentry/nextjs";
import rateLimit from '@/lib/rate-limit';

const limiter = rateLimit({
    uniqueTokenPerInterval: 500,
    interval: 60000,
});

const FUNCLIP_API_URL = process.env.FUNCLIP_API_URL || 'http://localhost:8000';

interface ClipSegment {
    start: number;
    end: number;
    text?: string;
}

/**
 * POST /api/funclip/clip
 * Extract specific segments from a video based on timestamps
 */
export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const ip = request.headers.get('x-forwarded-for') || 'anonymous';
        try {
            await limiter.check(NextResponse.next(), 5, ip);
        } catch {
            return NextResponse.json(
                { error: 'Rate limit exceeded. Please try again later.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { videoUrl, segments, addSubtitles = false } = body;

        if (!videoUrl) {
            return NextResponse.json({ error: 'videoUrl is required' }, { status: 400 });
        }

        if (!segments || !Array.isArray(segments) || segments.length === 0) {
            return NextResponse.json(
                { error: 'segments array is required with at least one segment' },
                { status: 400 }
            );
        }

        // Validate segments
        for (const seg of segments as ClipSegment[]) {
            if (typeof seg.start !== 'number' || typeof seg.end !== 'number') {
                return NextResponse.json(
                    { error: 'Each segment must have numeric start and end times' },
                    { status: 400 }
                );
            }
            if (seg.end <= seg.start) {
                return NextResponse.json(
                    { error: 'Segment end time must be after start time' },
                    { status: 400 }
                );
            }
        }

        console.log('[FunClip] Clipping:', {
            videoUrl,
            numSegments: segments.length,
            addSubtitles
        });

        // Call FunClip clipping service
        const response = await fetch(`${FUNCLIP_API_URL}/clip`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                video_url: videoUrl,
                segments,
                add_subtitles: addSubtitles,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('[FunClip] Clipping failed:', error);
            throw new Error(`FunClip clipping failed: ${error}`);
        }

        const clips = await response.json();

        console.log('[FunClip] Clipping complete:', { numClips: clips.length });

        return NextResponse.json({
            success: true,
            clips,
        });

    } catch (error) {
        console.error('[FunClip] Clip Error:', error);
        Sentry.captureException(error);

        if (error instanceof TypeError && error.message.includes('fetch')) {
            return NextResponse.json(
                { error: 'FunClip service unavailable' },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to clip video' },
            { status: 500 }
        );
    }
}
