import fs from 'fs';
import path from 'path';
import { Workflow, DEFAULT_WORKFLOW_TEMPLATES, WorkflowTrigger, WorkflowAction } from './types';

// Persistence configuration
const DB_PATH = path.join(process.cwd(), 'workflows.json');

// Helper to read DB
function readDb(): Map<string, Workflow> {
    try {
        if (!fs.existsSync(DB_PATH)) {
            return new Map();
        }
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        const workflows = JSON.parse(data);
        return new Map(workflows);
    } catch (error) {
        console.error('Failed to read workflow DB', error);
        return new Map();
    }
}

// Helper to write DB
function writeDb(workflows: Map<string, Workflow>) {
    try {
        const data = JSON.stringify(Array.from(workflows.entries()), null, 2);
        fs.writeFileSync(DB_PATH, data, 'utf-8');
    } catch (error) {
        console.error('Failed to write workflow DB', error);
    }
}

/**
 * Get triggers to check for polling
 */
export function getActiveWorkflowTriggers(): Workflow[] {
    const workflows = readDb();
    return Array.from(workflows.values()).filter(w => w.isActive);
}

/**
 * Get all workflows for a user
 */
export function getUserWorkflows(userId: string): Workflow[] {
    const workflows = readDb();
    return Array.from(workflows.values()).filter(w => w.userId === userId);
}

/**
 * Create a new workflow
 */
export function createWorkflow(
    userId: string,
    data: { name: string; trigger: WorkflowTrigger; actions: WorkflowAction[] }
): Workflow {
    const workflows = readDb();
    const id = `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newWorkflow: Workflow = {
        id,
        userId,
        name: data.name,
        isActive: true, // Default to active
        trigger: data.trigger,
        actions: data.actions,
        createdAt: new Date().toISOString(),
        stats: {
            processedCount: 0,
            failureCount: 0
        }
    };

    workflows.set(id, newWorkflow);
    writeDb(workflows);
    return newWorkflow;
}

/**
 * Toggle workflow status
 */
export function toggleWorkflow(id: string): Workflow | null {
    const workflows = readDb();
    const workflow = workflows.get(id);
    if (!workflow) return null;

    workflow.isActive = !workflow.isActive;
    workflows.set(id, workflow);
    writeDb(workflows);
    return workflow;
}

/**
 * Delete workflow
 */
export function deleteWorkflow(id: string): boolean {
    const workflows = readDb();
    const deleted = workflows.delete(id);
    if (deleted) writeDb(workflows);
    return deleted;
}

/**
 * Log a run (success/failure)
 */
export function logWorkflowRun(id: string, success: boolean): void {
    const workflows = readDb();
    const workflow = workflows.get(id);
    if (!workflow) return;

    workflow.lastRunAt = new Date().toISOString();
    if (success) workflow.stats.processedCount++;
    else workflow.stats.failureCount++;

    workflows.set(id, workflow);
    writeDb(workflows);
}
