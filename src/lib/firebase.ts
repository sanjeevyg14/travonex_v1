/**
 * @fileoverview Firebase SDK Initialization
 * @description This file initializes the Firebase app and exports the necessary service instances
 * (Authentication, Firestore, Storage). It's the central point for all Firebase interactions.
 * 
 * @developer_notes
 * - This configuration uses environment variables for Firebase credentials.
 * - Next.js automatically loads variables prefixed with NEXT_PUBLIC_ from `.env.local` or `.env`
 *   into the browser and server environments.
 * - Example `.env` file:
 *   NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
 *   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
 *   NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
 *   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
 *   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
 *   NEXT_PUBLIC_FIREBASE_APP_ID="..."
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only once (important for Next.js hot-reloading).
// `getApps().length` checks if any Firebase app has already been initialized.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Export the initialized services for use throughout the application.
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
