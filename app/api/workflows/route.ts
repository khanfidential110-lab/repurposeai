// API to manage workflows
import { NextRequest, NextResponse } from 'next/server';
import { getUserWorkflows, createWorkflow, deleteWorkflow, toggleWorkflow } from '@/lib/workflows/store';

// Helper to get userId from request (passed from client via headers)
function getUserIdFromRequest(request: NextRequest): string {
    return request.headers.get('x-user-id') || 'anonymous';
}

// GET - List Workflows
export async function GET(request: NextRequest) {
    const userId = getUserIdFromRequest(request);
    const workflows = await getUserWorkflows(userId);

    return NextResponse.json({ workflows });
}

// POST - Create Workflow
export async function POST(request: NextRequest) {
    try {
        const userId = getUserIdFromRequest(request);
        const body = await request.json();

        // Basic validation
        if (!body.name || !body.trigger || !body.actions) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const workflow = await createWorkflow(userId, body);
        return NextResponse.json({ workflow });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create workflow' }, { status: 500 });
    }
}

// DELETE/PUT - Manage single workflow
// (For simplicity in MVP, we might add these handlers later if needed for granular control)

