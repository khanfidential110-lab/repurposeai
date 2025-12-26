import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    serverTimestamp,
    DocumentData,
    QueryDocumentSnapshot,
    Timestamp,
    onSnapshot,
    Firestore,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';

// Helper to check if Firestore is ready
function getFirestore(): Firestore {
    if (!isFirebaseConfigured || !db) {
        throw new Error('Firebase is not configured. Please add your Firebase credentials to .env.local');
    }
    return db;
}

// Job status type
export type JobStatus = 'pending' | 'processing' | 'done' | 'failed';
export type InputType = 'video' | 'audio' | 'text';
export type OutputType = 'clip' | 'caption' | 'thread' | 'thumbnail' | 'subtitle';
export type Platform = 'youtube' | 'twitter' | 'instagram' | 'linkedin' | 'tiktok';

// Output item in a job
export interface JobOutput {
    type: OutputType;
    platform: Platform;
    content: string;
    metadata?: {
        title?: string;
        description?: string;
        hashtags?: string[];
        duration?: number;
    };
}

// Job document type
export interface Job {
    id: string;
    userId: string;
    status: JobStatus;
    inputType: InputType;
    inputFileUrl: string;
    inputFileName: string;
    inputFileSize: number;
    outputs: JobOutput[];
    transcription?: string;
    errorMessage?: string;
    retryCount: number;
    createdAt: Date;
    completedAt?: Date;
}

// Scheduled post type
export interface ScheduledPost {
    id: string;
    userId: string;
    jobId: string;
    platform: Platform;
    content: string;
    mediaUrl?: string;
    scheduledTime: Date;
    timezone: string;
    status: 'scheduled' | 'posted' | 'failed';
    platformPostId?: string;
    createdAt: Date;
}

// Create a new job
export async function createJob(
    userId: string,
    inputType: InputType,
    inputFileUrl: string,
    inputFileName: string,
    inputFileSize: number
): Promise<string> {
    const firestore = getFirestore();
    const jobsRef = collection(firestore, 'jobs');
    const jobDoc = await addDoc(jobsRef, {
        userId,
        status: 'pending' as JobStatus,
        inputType,
        inputFileUrl,
        inputFileName,
        inputFileSize,
        outputs: [],
        retryCount: 0,
        createdAt: serverTimestamp(),
    });
    return jobDoc.id;
}

// Get a single job
export async function getJob(jobId: string): Promise<Job | null> {
    const firestore = getFirestore();
    const jobRef = doc(firestore, 'jobs', jobId);
    const jobSnap = await getDoc(jobRef);

    if (jobSnap.exists()) {
        const data = jobSnap.data();
        return {
            id: jobSnap.id,
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
            completedAt: (data.completedAt as Timestamp)?.toDate(),
        } as Job;
    }

    return null;
}

// Get jobs for a user (paginated)
export async function getUserJobs(
    userId: string,
    pageSize: number = 10,
    lastDoc?: QueryDocumentSnapshot<DocumentData>
): Promise<{ jobs: Job[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
    const firestore = getFirestore();
    const jobsRef = collection(firestore, 'jobs');
    let q = query(
        jobsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
    );

    if (lastDoc) {
        q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const jobs = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
            completedAt: (data.completedAt as Timestamp)?.toDate(),
        } as Job;
    });

    const newLastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

    return { jobs, lastDoc: newLastDoc };
}

// Update job status
export async function updateJobStatus(
    jobId: string,
    status: JobStatus,
    updates?: Partial<Pick<Job, 'outputs' | 'transcription' | 'errorMessage'>>
): Promise<void> {
    const firestore = getFirestore();
    const jobRef = doc(firestore, 'jobs', jobId);
    const updateData: DocumentData = {
        status,
        ...updates,
    };

    if (status === 'done' || status === 'failed') {
        updateData.completedAt = serverTimestamp();
    }

    await updateDoc(jobRef, updateData);
}

// Delete a job
export async function deleteJob(jobId: string): Promise<void> {
    const firestore = getFirestore();
    const jobRef = doc(firestore, 'jobs', jobId);
    await deleteDoc(jobRef);
}

// Subscribe to job updates (real-time)
export function subscribeToJob(
    jobId: string,
    callback: (job: Job | null) => void
): () => void {
    const firestore = getFirestore();
    const jobRef = doc(firestore, 'jobs', jobId);
    return onSnapshot(jobRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.data();
            callback({
                id: snapshot.id,
                ...data,
                createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
                completedAt: (data.completedAt as Timestamp)?.toDate(),
            } as Job);
        } else {
            callback(null);
        }
    });
}

// Create a scheduled post
export async function createScheduledPost(post: Omit<ScheduledPost, 'id'>): Promise<string> {
    const firestore = getFirestore();
    const postsRef = collection(firestore, 'scheduledPosts');
    const postDoc = await addDoc(postsRef, {
        ...post,
        createdAt: serverTimestamp(),
    });
    return postDoc.id;
}

// Get scheduled posts for a user
export async function getScheduledPosts(userId: string): Promise<ScheduledPost[]> {
    const firestore = getFirestore();
    const postsRef = collection(firestore, 'scheduledPosts');
    const q = query(
        postsRef,
        where('userId', '==', userId),
        where('status', '==', 'scheduled'),
        orderBy('scheduledTime', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            scheduledTime: (data.scheduledTime as Timestamp)?.toDate(),
            createdAt: (data.createdAt as Timestamp)?.toDate(),
        } as ScheduledPost;
    });
}

// Update usage count for a user
export async function incrementUsageCount(userId: string): Promise<void> {
    const firestore = getFirestore();
    const userRef = doc(firestore, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const userData = userSnap.data();
        const now = new Date();
        const resetDate = (userData.usageResetDate as Timestamp)?.toDate();

        // Reset if new month
        if (resetDate && now.getMonth() !== resetDate.getMonth()) {
            await updateDoc(userRef, {
                usageCount: 1,
                usageResetDate: serverTimestamp(),
            });
        } else {
            await updateDoc(userRef, {
                usageCount: (userData.usageCount || 0) + 1,
            });
        }
    }
}

// Check if user has reached usage limit
export async function checkUsageLimit(userId: string): Promise<boolean> {
    const firestore = getFirestore();
    const userRef = doc(firestore, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const userData = userSnap.data();
        const plan = userData.plan || 'free';
        const usageCount = userData.usageCount || 0;

        // Free tier: 5 repurposes/month
        if (plan === 'free' && usageCount >= 5) {
            return true;
        }

        // Pro and Team: unlimited
        return false;
    }

    return true; // Default to limited if user not found
}
