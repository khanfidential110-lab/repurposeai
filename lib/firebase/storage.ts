import { ref, uploadBytesResumable, getDownloadURL, deleteObject, UploadTask, FirebaseStorage } from 'firebase/storage';
import { storage, isFirebaseConfigured } from './config';

// Helper to check if Storage is ready
function getStorage(): FirebaseStorage {
    if (!isFirebaseConfigured || !storage) {
        throw new Error('Firebase is not configured. Please add your Firebase credentials to .env.local');
    }
    return storage;
}

// Upload a file to Firebase Storage
export async function uploadFile(
    userId: string,
    file: File,
    onProgress?: (progress: number) => void
): Promise<{ url: string; path: string }> {
    const storageInstance = getStorage();
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `uploads/${userId}/${timestamp}_${safeName}`;
    const storageRef = ref(storageInstance, path);

    return new Promise((resolve, reject) => {
        const uploadTask: UploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) {
                    onProgress(progress);
                }
            },
            (error) => {
                console.error('Upload error:', error);
                reject(error);
            },
            async () => {
                try {
                    const url = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve({ url, path });
                } catch (error) {
                    reject(error);
                }
            }
        );
    });
}

// Delete a file from Firebase Storage
export async function deleteFile(path: string): Promise<void> {
    const storageInstance = getStorage();
    const storageRef = ref(storageInstance, path);
    await deleteObject(storageRef);
}

// Get download URL for a file
export async function getFileUrl(path: string): Promise<string> {
    const storageInstance = getStorage();
    const storageRef = ref(storageInstance, path);
    return getDownloadURL(storageRef);
}

// Upload generated output (clips, thumbnails, etc.)
export async function uploadGeneratedContent(
    userId: string,
    jobId: string,
    content: Blob,
    filename: string
): Promise<string> {
    const storageInstance = getStorage();
    const path = `outputs/${userId}/${jobId}/${filename}`;
    const storageRef = ref(storageInstance, path);

    const uploadTask = uploadBytesResumable(storageRef, content);

    return new Promise((resolve, reject) => {
        uploadTask.on(
            'state_changed',
            null,
            (error) => reject(error),
            async () => {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(url);
            }
        );
    });
}

