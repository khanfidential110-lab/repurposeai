import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    sendPasswordResetEmail,
    sendEmailVerification,
    User,
    UserCredential,
    onAuthStateChanged,
    Auth,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, Firestore } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './config';

const googleProvider = new GoogleAuthProvider();

// User type for Firestore
export interface UserData {
    id: string;
    email: string;
    displayName: string;
    photoURL?: string;
    plan: 'free' | 'pro' | 'team';
    usageCount: number;
    usageResetDate: Date;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    connectedPlatforms: {
        youtube?: { connected: boolean; tokenExpiry?: Date };
        twitter?: { connected: boolean; tokenExpiry?: Date };
        instagram?: { connected: boolean; tokenExpiry?: Date };
        linkedin?: { connected: boolean; tokenExpiry?: Date };
    };
    role: 'user' | 'admin';
    teamId?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Helper to check if Firebase is ready
function checkFirebaseReady(): { auth: Auth; db: Firestore } {
    if (!isFirebaseConfigured || !auth || !db) {
        throw new Error('Firebase is not configured. Please add your Firebase credentials to .env.local');
    }
    return { auth, db };
}

// Create user document in Firestore
export async function createUserDocument(user: User): Promise<void> {
    const { db: firestore } = checkFirebaseReady();
    const userRef = doc(firestore, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        const userData: Omit<UserData, 'id'> = {
            email: user.email || '',
            displayName: user.displayName || user.email?.split('@')[0] || 'User',
            photoURL: user.photoURL || undefined,
            plan: 'free',
            usageCount: 0,
            usageResetDate: new Date(),
            connectedPlatforms: {},
            role: 'user',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await setDoc(userRef, {
            ...userData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    }
}

// Get user data from Firestore
export async function getUserData(userId: string): Promise<UserData | null> {
    if (!isFirebaseConfigured || !db) {
        return null;
    }
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() } as UserData;
    }

    return null;
}

// Sign up with email and password
export async function signUp(email: string, password: string): Promise<UserCredential> {
    const { auth: firebaseAuth } = checkFirebaseReady();
    const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);

    // Try to create user document, but don't block signup if Firestore fails
    try {
        await createUserDocument(credential.user);
    } catch (error) {
        console.warn('Failed to create user document in Firestore:', error);
        // Signup still succeeds - user doc can be created later
    }

    await sendEmailVerification(credential.user);
    return credential;
}

// Sign in with email and password
export async function signIn(email: string, password: string): Promise<UserCredential> {
    const { auth: firebaseAuth } = checkFirebaseReady();
    return signInWithEmailAndPassword(firebaseAuth, email, password);
}

// Sign in with Google (uses redirect to avoid popup COOP issues)
export async function signInWithGoogle(): Promise<void> {
    const { auth: firebaseAuth } = checkFirebaseReady();
    // Use redirect instead of popup to avoid Cross-Origin-Opener-Policy issues
    await signInWithRedirect(firebaseAuth, googleProvider);
}

// Check for Google redirect result (call this on app init)
export async function checkGoogleRedirectResult(): Promise<UserCredential | null> {
    const { auth: firebaseAuth } = checkFirebaseReady();
    try {
        const result = await getRedirectResult(firebaseAuth);
        if (result) {
            await createUserDocument(result.user);
            return result;
        }
        return null;
    } catch (error) {
        console.error('Google redirect result error:', error);
        throw error;
    }
}

// Sign out
export async function signOut(): Promise<void> {
    const { auth: firebaseAuth } = checkFirebaseReady();
    return firebaseSignOut(firebaseAuth);
}

// Reset password
export async function resetPassword(email: string): Promise<void> {
    const { auth: firebaseAuth } = checkFirebaseReady();
    return sendPasswordResetEmail(firebaseAuth, email);
}

// Auth state listener
export function onAuthChange(callback: (user: User | null) => void): () => void {
    if (!isFirebaseConfigured || !auth) {
        // Return a no-op unsubscribe for when Firebase is not configured
        callback(null);
        return () => { };
    }
    return onAuthStateChanged(auth, callback);
}

