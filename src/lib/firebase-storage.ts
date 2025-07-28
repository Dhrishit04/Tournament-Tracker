// src/lib/firebase-storage.ts
"use client";

import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getApp } from "firebase/app";

// Initialize Firebase Storage
const storage = getStorage(getApp());

/**
 * Uploads a file to Firebase Storage and returns its public URL.
 * @param file The file to upload.
 * @param path The path in Firebase Storage where the file should be saved (e.g., "team-logos").
 * @returns The public URL of the uploaded file.
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  // Create a storage reference
  const storageRef = ref(storage, `${path}/${file.name}_${Date.now()}`);

  try {
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the public URL of the uploaded file
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file to Firebase Storage:", error);
    throw error;
  }
}
