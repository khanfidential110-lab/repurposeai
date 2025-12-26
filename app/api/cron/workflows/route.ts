import { NextResponse } from 'next/server';
import { checkWorkflows } from '@/lib/workflows/engine';

export async function GET(request: Request) {
    // Basic security check (Cron secret)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const results = await checkWorkflows();
        return NextResponse.json({ success: true, results });
    } catch (error) {
        console.error('[Cron] Workflow trigger failed:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
