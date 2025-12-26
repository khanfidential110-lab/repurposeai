import { NextRequest, NextResponse } from 'next/server';

// Mock job storage (in production, use Firestore)
const jobs = new Map<string, Job>();

interface Job {
    id: string;
    userId: string;
    status: 'pending' | 'processing' | 'done' | 'failed';
    inputType: 'video' | 'audio' | 'text';
    inputFileName: string;
    inputFileSize: number;
    outputs: Output[];
    transcription?: string;
    errorMessage?: string;
    createdAt: string;
    completedAt?: string;
}

interface Output {
    type: string;
    platform: string;
    content: string;
    metadata?: Record<string, unknown>;
}

// GET - List jobs or get single job
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const jobId = searchParams.get('id');
        const userId = searchParams.get('userId') || 'demo-user';

        if (jobId) {
            const job = jobs.get(jobId);
            if (!job) {
                return NextResponse.json({ error: 'Job not found' }, { status: 404 });
            }
            return NextResponse.json({ job });
        }

        // Return all jobs for user
        const userJobs = Array.from(jobs.values())
            .filter((job) => job.userId === userId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({ jobs: userJobs });
    } catch (error) {
        console.error('Get jobs error:', error);
        return NextResponse.json({ error: 'Failed to get jobs' }, { status: 500 });
    }
}

// POST - Create new job
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId = 'demo-user', inputType, inputFileName, inputFileSize } = body;

        const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const job: Job = {
            id: jobId,
            userId,
            status: 'pending',
            inputType,
            inputFileName,
            inputFileSize,
            outputs: [],
            createdAt: new Date().toISOString(),
        };

        jobs.set(jobId, job);

        return NextResponse.json({ job, message: 'Job created successfully' });
    } catch (error) {
        console.error('Create job error:', error);
        return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
    }
}

// PATCH - Update job status/outputs
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { jobId, status, outputs, transcription, errorMessage } = body;

        const job = jobs.get(jobId);
        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        if (status) job.status = status;
        if (outputs) job.outputs = outputs;
        if (transcription) job.transcription = transcription;
        if (errorMessage) job.errorMessage = errorMessage;
        if (status === 'done' || status === 'failed') {
            job.completedAt = new Date().toISOString();
        }

        jobs.set(jobId, job);

        return NextResponse.json({ job, message: 'Job updated successfully' });
    } catch (error) {
        console.error('Update job error:', error);
        return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
    }
}

// DELETE - Delete a job
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const jobId = searchParams.get('id');

        if (!jobId) {
            return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
        }

        if (!jobs.has(jobId)) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        jobs.delete(jobId);

        return NextResponse.json({ message: 'Job deleted successfully' });
    } catch (error) {
        console.error('Delete job error:', error);
        return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
    }
}
