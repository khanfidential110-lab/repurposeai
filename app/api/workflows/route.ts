// API to manage workflows
import { NextRequest, NextResponse } from 'next/server';
import { getUserWorkflows, createWorkflow, deleteWorkflow, toggleWorkflow } from '@/lib/workflows/store';

// GET - List Workflows
export async function GET() {
    // Mock user ID
    const userId = 'demo-user';
    const workflows = getUserWorkflows(userId);

    return NextResponse.json({ workflows });
}

// POST - Create Workflow
export async function POST(request: NextRequest) {
    try {
        const userId = 'demo-user';
        const body = await request.json();

        // Basic validation
        if (!body.name || !body.trigger || !body.actions) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const workflow = createWorkflow(userId, body);
        return NextResponse.json({ workflow });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create workflow' }, { status: 500 });
    }
}

// DELETE/PUT - Manage single workflow
// (For simplicity in MVP, we might add these handlers later if needed for granular control)
