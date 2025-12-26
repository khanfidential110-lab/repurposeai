// Firestore-based workflow storage
import { db, isFirebaseConfigured } from '@/lib/firebase/config';
import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    Firestore
} from 'firebase/firestore';
import { Workflow, WorkflowTrigger, WorkflowAction } from './types';

const WORKFLOWS_COLLECTION = 'workflows';

// Fallback to file-based storage if Firestore is not configured
import fs from 'fs';
import path from 'path';
const DB_PATH = path.join(process.cwd(), 'workflows.json');

// File-based helpers (fallback)
function readFileDb(): Map<string, Workflow> {
    try {
        if (!fs.existsSync(DB_PATH)) return new Map();
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return new Map(JSON.parse(data));
    } catch { return new Map(); }
}

function writeFileDb(workflows: Map<string, Workflow>) {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(Array.from(workflows.entries()), null, 2), 'utf-8');
    } catch (e) { console.error('Failed to write workflow DB', e); }
}

// Check if we should use Firestore
function useFirestore(): boolean {
    return !!isFirebaseConfigured && db !== null;
}

/**
 * Get all active workflows for polling
 */
export async function getActiveWorkflowTriggers(): Promise<Workflow[]> {
    if (useFirestore()) {
        const q = query(collection(db!, WORKFLOWS_COLLECTION), where('isActive', '==', true));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workflow));
    }
    // Fallback
    const workflows = readFileDb();
    return Array.from(workflows.values()).filter(w => w.isActive);
}

/**
 * Get all workflows for a user
 */
export async function getUserWorkflows(userId: string): Promise<Workflow[]> {
    if (useFirestore()) {
        const q = query(collection(db!, WORKFLOWS_COLLECTION), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workflow));
    }
    // Fallback
    const workflows = readFileDb();
    return Array.from(workflows.values()).filter(w => w.userId === userId);
}

/**
 * Create a new workflow
 */
export async function createWorkflow(
    userId: string,
    data: { name: string; trigger: WorkflowTrigger; actions: WorkflowAction[] }
): Promise<Workflow> {
    const id = `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newWorkflow: Workflow = {
        id,
        userId,
        name: data.name,
        isActive: true,
        trigger: data.trigger,
        actions: data.actions,
        createdAt: new Date().toISOString(),
        stats: { processedCount: 0, failureCount: 0 }
    };

    if (useFirestore()) {
        await setDoc(doc(db!, WORKFLOWS_COLLECTION, id), newWorkflow);
    } else {
        const workflows = readFileDb();
        workflows.set(id, newWorkflow);
        writeFileDb(workflows);
    }

    return newWorkflow;
}

/**
 * Toggle workflow status
 */
export async function toggleWorkflow(id: string): Promise<Workflow | null> {
    if (useFirestore()) {
        const docRef = doc(db!, WORKFLOWS_COLLECTION, id);
        const snapshot = await getDoc(docRef);
        if (!snapshot.exists()) return null;
        const workflow = { id: snapshot.id, ...snapshot.data() } as Workflow;
        workflow.isActive = !workflow.isActive;
        await updateDoc(docRef, { isActive: workflow.isActive });
        return workflow;
    }
    // Fallback
    const workflows = readFileDb();
    const workflow = workflows.get(id);
    if (!workflow) return null;
    workflow.isActive = !workflow.isActive;
    workflows.set(id, workflow);
    writeFileDb(workflows);
    return workflow;
}

/**
 * Delete workflow
 */
export async function deleteWorkflow(id: string): Promise<boolean> {
    if (useFirestore()) {
        await deleteDoc(doc(db!, WORKFLOWS_COLLECTION, id));
        return true;
    }
    const workflows = readFileDb();
    const deleted = workflows.delete(id);
    if (deleted) writeFileDb(workflows);
    return deleted;
}

/**
 * Log a workflow run (success/failure)
 */
export async function logWorkflowRun(id: string, success: boolean): Promise<void> {
    if (useFirestore()) {
        const docRef = doc(db!, WORKFLOWS_COLLECTION, id);
        const snapshot = await getDoc(docRef);
        if (!snapshot.exists()) return;
        const workflow = snapshot.data() as Workflow;
        const stats = workflow.stats || { processedCount: 0, failureCount: 0 };
        if (success) stats.processedCount++;
        else stats.failureCount++;
        await updateDoc(docRef, { lastRunAt: new Date().toISOString(), stats });
        return;
    }
    // Fallback
    const workflows = readFileDb();
    const workflow = workflows.get(id);
    if (!workflow) return;
    workflow.lastRunAt = new Date().toISOString();
    if (success) workflow.stats.processedCount++;
    else workflow.stats.failureCount++;
    workflows.set(id, workflow);
    writeFileDb(workflows);
}
