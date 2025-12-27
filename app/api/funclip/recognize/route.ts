// FunClip Integration API - Video transcription and AI clipping
import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from "@sentry/nextjs";
import rateLimit from '@/lib/rate-limit';

// Initialize rate limiter (5 requests per minute - these are expensive GPU operations)
const limiter = rateLimit({
    uniqueTokenPerInterval: 500,
    interval: 60000,
});

// FunClip service URL (Modal.com or self-hosted)
const FUNCLIP_API_URL = process.env.FUNCLIP_API_URL || 'http://localhost:8000';

interface TranscriptSegment {
    start: number;
    end: number;
    text: string;
}

interface RecognizeResponse {
    text: string;
    segments: TranscriptSegment[];
}

/**
 * POST /api/funclip/recognize
 * Transcribe a video and return text with timestamps
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
        const { videoUrl } = body;

        if (!videoUrl) {
            return NextResponse.json(
                { error: 'videoUrl is required' },
                { status: 400 }
            );
        }

        console.log('[FunClip] Starting transcription for:', videoUrl);

        // Call FunClip service
        const response = await fetch(`${FUNCLIP_API_URL}/recognize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ video_url: videoUrl }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('[FunClip] Recognition failed:', error);
            throw new Error(`FunClip recognition failed: ${error}`);
        }

        const result: RecognizeResponse = await response.json();

        console.log('[FunClip] Transcription complete:', {
            textLength: result.text?.length,
            segments: result.segments?.length
        });

        return NextResponse.json({
            success: true,
            transcript: result.text,
            segments: result.segments,
        });

    } catch (error) {
        console.error('[FunClip] Error:', error);
        Sentry.captureException(error);

        // Check if it's a connection error (service not available)
        if (error instanceof TypeError && error.message.includes('fetch')) {
            return NextResponse.json(
                {
                    error: 'FunClip service unavailable. Please try again later.',
                    details: 'The video processing service is temporarily offline.'
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to transcribe video' },
            { status: 500 }
        );
    }
}
