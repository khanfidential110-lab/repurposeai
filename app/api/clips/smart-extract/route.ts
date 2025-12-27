// Unified Video Clip Extraction Pipeline
// Uses FREE Groq API for transcription + LLM clip selection + FFmpeg extraction
import { NextRequest, NextResponse } from 'next/server';
import { getGroqClient } from '@/lib/ai/groq';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import * as Sentry from "@sentry/nextjs";
import rateLimit from '@/lib/rate-limit';

const execAsync = promisify(exec);

const limiter = rateLimit({
    uniqueTokenPerInterval: 500,
    interval: 60000,
});

interface TranscriptSegment {
    id: number;
    start: number;
    end: number;
    text: string;
}

interface ClipSuggestion {
    start: number;
    end: number;
    text: string;
    reason: string;
}

// Aspect ratio presets for social media platforms
const ASPECT_RATIOS = {
    original: { width: 0, height: 0, label: 'Original' },
    '9:16': { width: 1080, height: 1920, label: 'TikTok / Reels / Shorts' },
    '1:1': { width: 1080, height: 1080, label: 'Instagram Square' },
    '16:9': { width: 1920, height: 1080, label: 'YouTube / Landscape' },
    '4:5': { width: 1080, height: 1350, label: 'Instagram Portrait' },
} as const;

type AspectRatioKey = keyof typeof ASPECT_RATIOS;

/**
 * Generate FFmpeg filter for aspect ratio conversion
 * Uses center crop then scale to maintain quality
 */
function getAspectRatioFilter(aspectRatio: AspectRatioKey): string {
    if (aspectRatio === 'original') return '';

    const { width, height } = ASPECT_RATIOS[aspectRatio];

    // Calculate crop to center the video at the target aspect ratio
    // Then scale to the exact dimensions
    return `-vf "scale=w='if(gt(a,${width}/${height}),${width},-2)':h='if(gt(a,${width}/${height}),-2,${height})',crop=${width}:${height},setsar=1"`;
}

/**
 * POST /api/clips/smart-extract
 * 
 * Complete pipeline:
 * 1. Receive video URL (from Firebase Storage)
 * 2. Download and transcribe with Groq Whisper (FREE)
 * 3. AI identifies best clips using Groq LLM (FREE)
 * 4. Extract clips with FFmpeg (FREE)
 * 5. Convert to target aspect ratio (FREE)
 */
export async function POST(request: NextRequest) {
    const tempFiles: string[] = [];

    try {
        // Rate limiting
        const ip = request.headers.get('x-forwarded-for') || 'anonymous';
        try {
            await limiter.check(NextResponse.next(), 3, ip); // 3 per minute (expensive)
        } catch {
            return NextResponse.json(
                { error: 'Rate limit exceeded. This feature is resource-intensive.' },
                { status: 429 }
            );
        }

        // Accept JSON body with videoUrl (from Firebase Storage)
        const body = await request.json();
        const { videoUrl, numClips = 3, style = 'viral', autoExtract = true, aspectRatio = 'original' } = body;

        if (!videoUrl) {
            return NextResponse.json({ error: 'videoUrl is required' }, { status: 400 });
        }

        console.log('[SmartClip] Starting pipeline:', {
            videoUrl: videoUrl.substring(0, 50) + '...',
            numClips,
            style,
            autoExtract,
            aspectRatio
        });

        // Create temp directory
        const tempDir = path.join(os.tmpdir(), 'repurpose-smart-clips');
        await fs.mkdir(tempDir, { recursive: true });

        // Download video from Firebase Storage URL
        console.log('[SmartClip] Downloading video from Firebase...');
        const videoResponse = await fetch(videoUrl);
        if (!videoResponse.ok) {
            throw new Error('Failed to download video from storage');
        }

        const videoBuffer = await videoResponse.arrayBuffer();
        const inputPath = path.join(tempDir, `input_${Date.now()}.mp4`);
        await fs.writeFile(inputPath, Buffer.from(videoBuffer));
        tempFiles.push(inputPath);

        console.log('[SmartClip] Video downloaded:', { size: videoBuffer.byteLength });

        // Extract audio for transcription (Groq needs audio file)
        const audioPath = path.join(tempDir, `audio_${Date.now()}.mp3`);
        try {
            await execAsync(`ffmpeg -i "${inputPath}" -vn -acodec libmp3lame -y "${audioPath}"`);
            tempFiles.push(audioPath);
        } catch (ffmpegError) {
            console.error('[SmartClip] Failed to extract audio:', ffmpegError);
            throw new Error('Failed to extract audio from video');
        }

        // Read audio file for Groq transcription
        const audioBuffer = await fs.readFile(audioPath);
        const audioFile = new File([audioBuffer], 'audio.mp3', { type: 'audio/mpeg' });

        // Step 1: Transcribe with timestamps using Groq
        console.log('[SmartClip] Step 1: Transcribing with Groq...');
        const groq = getGroqClient();

        const transcription = await groq.transcribeWithTimestamps(audioFile);

        console.log('[SmartClip] Transcription complete:', {
            textLength: transcription.text.length,
            segments: transcription.segments.length,
            duration: transcription.duration
        });

        if (!transcription.segments.length) {
            return NextResponse.json({
                success: true,
                transcript: transcription.text,
                segments: [],
                suggestedClips: [],
                message: 'Transcription complete but no segments detected. Try a video with clearer speech.'
            });
        }

        // Step 2: Use LLM to identify best clips
        console.log('[SmartClip] Step 2: AI analyzing for best clips...');
        const suggestedClips = await groq.identifyBestClips(
            transcription.text,
            transcription.segments,
            { numClips, style }
        );

        console.log('[SmartClip] AI identified clips:', suggestedClips.length);

        // Step 3: Extract clips (if autoExtract is true)
        let extractedClips: Array<{
            index: number;
            start: number;
            end: number;
            text: string;
            reason: string;
            downloadUrl?: string;
        }> = [];

        if (autoExtract && suggestedClips.length > 0) {
            console.log('[SmartClip] Step 3: Extracting clips with FFmpeg...');

            for (let i = 0; i < suggestedClips.length; i++) {
                const clip = suggestedClips[i];
                const outputFileName = `clip_${i + 1}_${Date.now()}.mp4`;
                const outputPath = path.join(tempDir, outputFileName);

                try {
                    const duration = clip.end - clip.start;
                    const aspectFilter = getAspectRatioFilter(aspectRatio);

                    // Use FFmpeg to extract clip with optional aspect ratio conversion
                    const ffmpegCmd = aspectFilter
                        ? `ffmpeg -i "${inputPath}" -ss ${clip.start} -t ${duration} ${aspectFilter} -c:v libx264 -preset fast -c:a aac -y "${outputPath}"`
                        : `ffmpeg -i "${inputPath}" -ss ${clip.start} -t ${duration} -c:v libx264 -c:a aac -y "${outputPath}"`;

                    await execAsync(ffmpegCmd);

                    tempFiles.push(outputPath);

                    // Read clip and create base64 data URL (for small clips)
                    const clipBuffer = await fs.readFile(outputPath);
                    const base64 = clipBuffer.toString('base64');

                    extractedClips.push({
                        index: i,
                        start: clip.start,
                        end: clip.end,
                        text: clip.text,
                        reason: clip.reason,
                        downloadUrl: `data:video/mp4;base64,${base64}`
                    });

                    console.log(`[SmartClip] Extracted clip ${i + 1}: ${clip.start}s - ${clip.end}s`);
                } catch (ffmpegError) {
                    console.error(`[SmartClip] Failed to extract clip ${i + 1}:`, ffmpegError);
                    // Continue with other clips even if one fails
                }
            }
        }

        // Cleanup temp files
        for (const tempFile of tempFiles) {
            await fs.unlink(tempFile).catch(() => { });
        }

        return NextResponse.json({
            success: true,
            transcript: transcription.text,
            duration: transcription.duration,
            segments: transcription.segments,
            suggestedClips: suggestedClips.map((clip, i) => ({
                ...clip,
                index: i,
                duration: clip.end - clip.start,
                downloadUrl: extractedClips[i]?.downloadUrl
            })),
            extractedCount: extractedClips.length,
            message: autoExtract
                ? `Transcribed and extracted ${extractedClips.length} clips`
                : `Transcribed video and identified ${suggestedClips.length} potential clips`
        });

    } catch (error) {
        console.error('[SmartClip] Error:', error);
        Sentry.captureException(error);

        // Cleanup on error
        for (const tempFile of tempFiles) {
            await fs.unlink(tempFile).catch(() => { });
        }

        if (error instanceof Error && error.message.includes('GROQ_API_KEY')) {
            return NextResponse.json(
                { error: 'AI service not configured. Please set GROQ_API_KEY.' },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to process video. Please try again.' },
            { status: 500 }
        );
    }
}
