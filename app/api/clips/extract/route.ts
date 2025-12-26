import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import * as Sentry from "@sentry/nextjs";
import rateLimit from '@/lib/rate-limit';
import { extractClipSchema } from '@/lib/validations/schemas';

const execAsync = promisify(exec);

// Initialize rate limiter (10 requests per minute)
const limiter = rateLimit({
    uniqueTokenPerInterval: 500,
    interval: 60000,
});

// POST - Extract a clip from video
export async function POST(request: NextRequest) {
    try {
        // 1. Rate Limiting
        const ip = request.headers.get('x-forwarded-for') || 'anonymous';
        try {
            await limiter.check(NextResponse.next(), 10, ip); // 10 requests per minute
        } catch {
            return NextResponse.json(
                { error: 'Rate limit exceeded. Please try again later.' },
                { status: 429 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        // 2. Input Validation (Zod)
        const rawData = {
            startTime: formData.get('startTime'),
            endTime: formData.get('endTime'),
            clipTitle: formData.get('clipTitle') || 'clip',
        };

        const validation = extractClipSchema.safeParse(rawData);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validation.error.format() },
                { status: 400 }
            );
        }

        if (!file) {
            return NextResponse.json({ error: 'Video file is required' }, { status: 400 });
        }

        const { startTime, endTime, clipTitle } = validation.data;

        // Create temp directory for processing
        const tempDir = path.join(os.tmpdir(), 'repurpose-clips');
        await fs.mkdir(tempDir, { recursive: true });

        // Save uploaded file temporarily
        const inputPath = path.join(tempDir, `input_${Date.now()}_${file.name}`);
        const outputFileName = `${clipTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.mp4`;
        const outputPath = path.join(tempDir, outputFileName);

        // Write file to disk
        const fileBuffer = await file.arrayBuffer();
        await fs.writeFile(inputPath, Buffer.from(fileBuffer));

        // Calculate duration from start and end times
        const startSeconds = parseTimeToSeconds(startTime);
        const endSeconds = parseTimeToSeconds(endTime);
        const duration = endSeconds - startSeconds;

        if (duration <= 0) {
            await fs.unlink(inputPath).catch(() => { });
            return NextResponse.json(
                { error: 'End time must be after start time' },
                { status: 400 }
            );
        }

        // Run FFmpeg to extract clip
        const ffmpegCmd = `ffmpeg -i "${inputPath}" -ss ${startSeconds} -t ${duration} -c:v libx264 -c:a aac -strict experimental -y "${outputPath}"`;

        console.log('Running FFmpeg command:', ffmpegCmd);

        try {
            await execAsync(ffmpegCmd);
        } catch (ffmpegError: any) {
            console.error('FFmpeg error:', ffmpegError);
            Sentry.captureException(ffmpegError); // Report to Sentry
            await fs.unlink(inputPath).catch(() => { });
            return NextResponse.json(
                { error: 'Failed to extract clip. FFmpeg error.' },
                { status: 500 }
            );
        }

        // Read the output file
        const clipBuffer = await fs.readFile(outputPath);

        // Cleanup temp files
        await fs.unlink(inputPath).catch(() => { });
        await fs.unlink(outputPath).catch(() => { });

        // Return the clip as a download
        return new NextResponse(clipBuffer, {
            headers: {
                'Content-Type': 'video/mp4',
                'Content-Disposition': `attachment; filename="${outputFileName}"`,
            },
        });
    } catch (error) {
        console.error('Clip extraction error:', error);
        Sentry.captureException(error); // Report to Sentry
        return NextResponse.json(
            { error: 'Failed to extract clip' },
            { status: 500 }
        );
    }
}

// Helper to parse time string to seconds
function parseTimeToSeconds(timeStr: string): number {
    // Handle formats like "0:30", "1:30", "00:30", "1:30:45"
    if (!timeStr.includes(':')) return parseFloat(timeStr) || 0;

    const parts = timeStr.split(':').map(Number);

    if (parts.length === 2) {
        // MM:SS format
        return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
        // HH:MM:SS format
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }

    return 0;
}
