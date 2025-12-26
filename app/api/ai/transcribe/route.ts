import { NextRequest, NextResponse } from 'next/server';
import { getGroqClient } from '@/lib/ai/groq';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'File is required' },
                { status: 400 }
            );
        }

        const groq = getGroqClient();
        const text = await groq.transcribe(file);

        return NextResponse.json({ text });
    } catch (error) {
        console.error('Transcription error:', error);
        return NextResponse.json(
            { error: 'Failed to transcribe file' },
            { status: 500 }
        );
    }
}
