import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { initializeFirebase } from '@/firebase';

const { storage } = initializeFirebase();

/**
 * Uploads an image to Firebase Storage and returns the download URL
 */
export const uploadManagementImage = async (file: File): Promise<string> => {
    if (!storage) throw new Error("Firebase storage is not initialized.");

    // Create a unique filename
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const storageRef = ref(storage, `management-slider/${filename}`);

    const uploadResult = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(uploadResult.ref);
    return downloadURL;
};

/**
 * Deletes an image from Firebase Storage using its full URL
 */
export const deleteManagementImage = async (url: string): Promise<void> => {
    if (!storage || !url) return;
    try {
        // Extract path from the firebase storage URL
        // https://firebasestorage.googleapis.com/v0/b/YOUR_PROJECT/o/management-slider%2Ffilename?alt=media
        const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/';
        if (url.startsWith(baseUrl)) {
            let pathInfo = url.split('/o/')[1];
            if (pathInfo) {
                const pathEnd = pathInfo.indexOf('?');
                if (pathEnd !== -1) {
                    pathInfo = pathInfo.substring(0, pathEnd);
                }
                const actualPath = decodeURIComponent(pathInfo);
                const fileRef = ref(storage, actualPath);
                await deleteObject(fileRef);
            }
        }
    } catch (error) {
        console.error("Failed to delete image from storage:", error);
    }
};
