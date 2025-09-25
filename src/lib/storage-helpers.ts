/**
 * @fileoverview Firebase Storage Helper Functions
 * @description This file contains reusable functions for uploading and deleting files
 * from Firebase Cloud Storage.
 */
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Uploads a file to a specified path in Firebase Storage.
 * @param file - The File object to upload.
 * @param path - The desired path in the storage bucket (e.g., 'trip-images/trip123/cover.jpg').
 * @returns A promise that resolves to the public download URL of the uploaded file.
 */
export const uploadFile = async (file: File, path: string): Promise<string> => {
  if (!file) {
    throw new Error("No file provided for upload.");
  }
  
  // Create a reference to the full path of the file.
  const storageRef = ref(storage, path);
  
  // 'uploadBytes' is the primary method for uploading files.
  const snapshot = await uploadBytes(storageRef, file);
  console.log('Uploaded a blob or file!', snapshot);
  
  // After upload, get the public URL to store in Firestore.
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};

/**
 * Deletes a file from Firebase Storage.
 * @param path - The full path of the file to delete.
 */
export const deleteFile = async (path: string): Promise<void> => {
  // Create a reference to the file to delete.
  const storageRef = ref(storage, path);

  // Delete the file.
  await deleteObject(storageRef);
  console.log(`File deleted from ${path}`);
};
