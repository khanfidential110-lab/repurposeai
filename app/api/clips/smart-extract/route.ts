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

/**
 * POST /api/clips/smart-extract
 * 
 * Complete pipeline:
 * 1. Upload video
 * 2. Transcribe with Groq Whisper (FREE)
 * 3. AI identifies best clips using Groq LLM (FREE)
 * 4. Extract clips with FFmpeg (FREE)
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

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const numClips = parseInt(formData.get('numClips') as string) || 3;
        const style = (formData.get('style') as string) || 'viral';
        const autoExtract = formData.get('autoExtract') === 'true';

        if (!file) {
            return NextResponse.json({ error: 'Video file is required' }, { status: 400 });
        }

        // Validate file size (max 25MB for Groq)
        if (file.size > 25 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 25MB for transcription.' },
                { status: 400 }
            );
        }

        console.log('[SmartClip] Starting pipeline:', {
            fileName: file.name,
            size: file.size,
            numClips,
            style,
            autoExtract
        });

        // Create temp directory
        const tempDir = path.join(os.tmpdir(), 'repurpose-smart-clips');
        await fs.mkdir(tempDir, { recursive: true });

        // Save uploaded file
        const inputPath = path.join(tempDir, `input_${Date.now()}_${file.name}`);
        const fileBuffer = await file.arrayBuffer();
        await fs.writeFile(inputPath, Buffer.from(fileBuffer));
        tempFiles.push(inputPath);

        // Step 1: Transcribe with timestamps using Groq
        console.log('[SmartClip] Step 1: Transcribing with Groq...');
        const groq = getGroqClient();

        const transcription = await groq.transcribeWithTimestamps(file);

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

                    // Use FFmpeg to extract clip
                    await execAsync(
                        `ffmpeg -i "${inputPath}" -ss ${clip.start} -t ${duration} -c:v libx264 -c:a aac -y "${outputPath}"`
                    );

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
