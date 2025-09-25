# Travonex Platform: Firebase Integration Guide

This document provides a comprehensive, step-by-step guide for migrating the Travonex platform from its current mock data system to a production-ready Firebase backend.

**Author:** Your AI Mentor
**Version:** 1.0.0

---

## Table of Contents

1.  [**Prerequisites**](#1-prerequisites)
2.  [**Part 1: Firebase Project Setup**](#2-part-1-firebase-project-setup)
    -   Creating the Firebase Project
    -   Getting Firebase Config for Your App
    -   Initializing Firebase in the Next.js App
3.  [**Part 2: Authentication**](#3-part-2-authentication)
    -   Enabling Auth Providers
    -   Updating the Auth Context
    -   Implementing Login & Logout
    -   Implementing Signup & Custom Roles
4.  [**Part 3: Firestore Database Setup**](#4-part-3-firestore-database-setup)
    -   Data Modeling
    -   Firestore Security Rules
5.  [**Part 4: Migrating from Mock Data to Firestore**](#5-part-4-migrating-from-mock-data-to-firestore)
    -   Fetching Trips for the Homepage
    -   Fetching a Single Trip
    -   Updating Admin Actions
6.  [**Part 5: Firebase Storage for Image Uploads**](#6-part-5-firebase-storage-for-image-uploads)
    -   Setting up Storage
    -   Implementing the Upload Function
7.  [**Part 6: Deployment**](#7-part-6-deployment)
    -   Vercel (Recommended)
    -   Firebase Hosting
8.  [**Incremental Migration Plan**](#8-incremental-migration-plan)

---

## 1. Prerequisites

-   A Google Account.
-   Node.js and npm installed.
-   The Travonex project code on your local machine.

---

## 2. Part 1: Firebase Project Setup

### Creating the Firebase Project

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **"Add project"** and give your project a name (e.g., "Travonex-Live").
3.  Disable Google Analytics for this project for now (you can add it later).
4.  Click **"Create project"**.

### Getting Firebase Config for Your App

1.  Once your project is ready, click the Web icon (`</>`) to add a web app.
2.  Give your app a nickname (e.g., "Travonex Web App").
3.  Click **"Register app"**.
4.  Firebase will provide you with a `firebaseConfig` object. **Copy this object.**

### Initializing Firebase in the Next.js App

1.  **Install Firebase SDK:**
    ```bash
    npm install firebase
    ```

2.  **Create a Firebase Initialization File:** Create a new file at `src/lib/firebase.ts`.

    ```typescript
    // src/lib/firebase.ts
    import { initializeApp, getApps } from 'firebase/app';
    import { getAuth }s from 'firebase/auth';
    import { getFirestore } from 'firebase/firestore';
    import { getStorage } from 'firebase/storage';

    // Paste your copied firebaseConfig object here
    const firebaseConfig = {
      apiKey: "AIza...",
      authDomain: "your-project-id.firebaseapp.com",
      projectId: "your-project-id",
      storageBucket: "your-project-id.appspot.com",
      messagingSenderId: "...",
      appId: "...",
    };

    // Initialize Firebase
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

    export const auth = getAuth(app);
    export const db = getFirestore(app);
    export const storage = getStorage(app);
    ```

---

## 3. Part 2: Authentication

### Enabling Auth Providers

1.  In the Firebase Console, go to **Authentication**.
2.  Click the **"Sign-in method"** tab.
3.  Enable **Email/Password** and **Phone Number**.

### Updating the Auth Context

Modify `src/context/AuthContext.tsx` to use Firebase's `onAuthStateChanged` listener. This provides real-time auth state.

```tsx
// src/context/AuthContext.tsx (Updated Snippet)
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase'; // Import from your new firebase file
import { doc, getDoc } from 'firebase/firestore';

// ...

useEffect(() => {
  console.log("[AuthContext] Setting up Firebase auth listener...");
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      // User is signed in, get their custom role from Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const sessionUser: SessionUser = {
          id: firebaseUser.uid,
          name: userData.name,
          email: userData.email,
          role: userData.role, // This is our custom role!
          avatar: userData.avatar,
        };
        setUser(sessionUser);
        setSessionStatus("authenticated");
        console.log("[AuthContext] 🎉 Authenticated via Firebase:", sessionUser);
      } else {
         // This case handles if a user exists in Firebase Auth but not in Firestore DB.
         // A robust app might create the user doc here or log them out.
         logout();
      }
    } else {
      // User is signed out
      setUser(null);
      setSessionStatus("unauthenticated");
      console.log("[AuthContext] 🚫 No user in session (Firebase).");
    }
  });

  return () => unsubscribe(); // Cleanup subscription on unmount
}, []);

// ... update logout function
const logout = async (preventRedirect = false) => {
    console.log("[AuthContext] 🚪 Logging out from Firebase");
    await signOut(auth); // Use Firebase's signOut
    // The onAuthStateChanged listener will automatically update the state.
    if (!preventRedirect) {
        router.push('/auth/login');
    }
};

```

### Implementing Login & Logout

The `/api/auth/login` route is now obsolete. You'll call Firebase directly from the client.

```tsx
// src/app/auth/login/page.tsx (Updated handleLogin)
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// ...

const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // This example is for Admin (Email/Password)
    try {
        if (loginRole === 'ADMIN') {
            await signInWithEmailAndPassword(auth, email, password);
            // The onAuthStateChanged listener in AuthContext will handle the redirect.
            toast({ title: "Login Successful" });
        } else {
            // TODO: Implement Phone Auth flow using Firebase
        }
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: "Login Failed",
            description: "Invalid credentials. Please try again.",
        });
    } finally {
        setIsLoading(false);
    }
};
```

### Implementing Signup & Custom Roles

When a user signs up, you must perform two actions:
1.  Create the user in Firebase Authentication.
2.  Create a corresponding user document in Firestore to store their custom role (`USER`, `ORGANIZER`, `ADMIN`).

```tsx
// src/app/auth/signup/page.tsx (Updated handleSignup)
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

// ...

const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // Now, create the user document in Firestore with their role
        await setDoc(doc(db, "users", firebaseUser.uid), {
            name: fullName,
            email: firebaseUser.email,
            role: "USER", // Assign the default role
            joinDate: new Date().toISOString(),
            avatar: `https://placehold.co/128x128.png?text=${fullName.charAt(0)}`,
            // ... other initial fields
        });

        // The onAuthStateChanged listener will handle login state and redirect.
        toast({ title: "Account Created!", description: "Welcome to Travonex." });
    } catch (error: any) {
        // ... error handling
    } finally {
        setIsLoading(false);
    }
};
```

---

## 4. Part 3: Firestore Database Setup

### Data Modeling

Your Firestore database should mirror the types in `src/lib/types.ts`. Use top-level collections for each major data type.

-   **`users`**: Stores all users (Travelers, Organizers, Admins). The `role` field is critical.
-   **`trips`**: Stores all trip listings.
-   **`organizers`**: This could be a sub-collection under a user or a separate collection storing business-specific details for users with the `ORGANIZER` role.
-   **`bookings`**: Stores all booking records.
-   **`offers`**: Stores all advertiser offers.

**Example `users` document (`/users/{userId}`):**
```json
{
  "name": "Rohan Sharma",
  "email": "rohan@example.com",
  "role": "USER",
  "joinDate": "2023-10-21T...",
  "avatar": "...",
  "walletBalance": 4000
}
```

### Firestore Security Rules

This is the most critical part of your backend. Security rules on Firestore prevent unauthorized data access.

Go to **Firestore Database -> Rules** in the Firebase console and paste these rules.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check for admin role
    function isAdmin() {
      return getUserRole() == 'Super Admin' || getUserRole() == 'Operations Manager';
    }

    // Helper function to get user's role from the 'users' collection
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }

    // Users can only read their own document, but any authenticated user can create one (for signup).
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
      allow update: if request.auth != null && request.auth.uid == userId;
    }

    // Trips can be read by anyone, but only created/updated by verified organizers or admins.
    match /trips/{tripId} {
      allow read: if true;
      allow create: if request.auth != null && (getUserRole() == 'ORGANIZER' || isAdmin());
      allow update: if request.auth != null && (get(/databases/$(database)/documents/trips/$(tripId)).data.organizerId == request.auth.uid || isAdmin());
    }

    // Admins can read/write everything (catch-all for admin-only collections)
    match /admin/{document=**} {
      allow read, write: if isAdmin();
    }
  }
}
```

---

## 5. Part 4: Migrating from Mock Data to Firestore

Now, you will replace the mock data imports with live Firestore queries.

### Fetching Trips for the Homepage

Update `src/app/page.tsx` to fetch data using Firebase.

```tsx
// src/app/page.tsx (Updated Snippet)
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ... inside the HomePage component
React.useEffect(() => {
    const fetchTrips = async () => {
        setIsLoading(true);

        // Fetch Featured Trips
        const tripsRef = collection(db, 'trips');
        const featuredQuery = query(
            tripsRef,
            where('isFeatured', '==', true),
            where('status', '==', 'Published'),
            limit(4)
        );
        const querySnapshot = await getDocs(featuredQuery);
        const fetchedTrips = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trip));
        
        setFeaturedTrips(fetchedTrips);
        setIsLoading(false);
    };
    fetchTrips();
}, [selectedCity]); // Re-fetch if city changes
```

### Fetching a Single Trip

The `getTripData` function in `src/app/trips/[slug]/page.tsx` needs to be updated.

```typescript
// src/app/trips/[slug]/page.tsx (Updated getTripData)
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

async function getTripData(slug: string) {
    const tripsRef = collection(db, 'trips');
    const q = query(tripsRef, where("slug", "==", slug), where("status", "==", "Published"), limit(1));
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return { trip: null, organizer: null };
    }

    const tripDoc = querySnapshot.docs[0];
    const tripData = { id: tripDoc.id, ...tripDoc.data() } as Trip;

    // Fetch organizer details
    const organizerDoc = await getDoc(doc(db, 'organizers', tripData.organizerId));
    const organizer = organizerDoc.exists() ? { id: organizerDoc.id, ...organizerDoc.data() } : null;

    return { trip: tripData, organizer };
}
```

### Updating Admin Actions

Admin actions should now trigger Firestore updates.

```tsx
// src/app/admin/trip-organisers/[organizerId]/page.tsx (Updated handleMainStatusChange)
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const handleMainStatusChange = async (status: Organizer['kycStatus']) => {
    setIsUpdating(true);
    try {
        const organizerRef = doc(db, 'organizers', organizerId);
        await updateDoc(organizerRef, {
            kycStatus: status
        });
        
        setOrganizer(prev => ({...prev, kycStatus: status}));
        toast({ title: `Organizer ${status}` });
    } catch (error: any) {
         toast({ title: "Update Failed", variant: 'destructive' });
    } finally {
        setIsUpdating(false);
    }
};
```

---

## 6. Part 5: Firebase Storage for Image Uploads

### Setting up Storage

1.  In the Firebase Console, go to **Storage**.
2.  Click **"Get started"**.
3.  Follow the prompts to set up your storage bucket.
4.  Go to the **Rules** tab and set them up for development. **For production, you need stricter rules.**
    ```
    rules_version = '2';
    service firebase.storage {
      match /b/{bucket}/o {
        // Allow reads by anyone, but writes only by authenticated users.
        match /{allPaths=**} {
          allow read;
          allow write: if request.auth != null;
        }
      }
    }
    ```

### Implementing the Upload Function

Create a helper function to handle uploads.

```typescript
// src/lib/storage-helpers.ts
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export const uploadFile = async (file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};
```

Use this helper in your forms.

```tsx
// src/components/trips/TripForm.tsx (Example usage)
const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const path = `trip-images/${trip?.id || 'new'}/cover_${Date.now()}`;
        const imageUrl = await uploadFile(file, path);
        // Now you can save this imageUrl to Firestore
        form.setValue('image', imageUrl);
        setCoverImageName(file.name);
    }
};
```

---

## 7. Part 6: Deployment

### Vercel (Recommended)

1.  Push your code to a Git provider (GitHub, GitLab).
2.  Go to [Vercel](https://vercel.com/) and create a new project.
3.  Import your Git repository.
4.  Add your Firebase config keys as **Environment Variables** in the Vercel project settings. **This is very important for security.**
5.  Deploy.

### Firebase Hosting

Firebase Hosting is excellent for static sites but requires more configuration for a Next.js app. It's generally simpler to use Vercel, which is built by the creators of Next.js.

---

## 8. Incremental Migration Plan

Don't try to migrate everything at once. Follow this order:

1.  **Phase 1 (Authentication):** Implement the Firebase setup and migrate the entire authentication flow first (`AuthContext`, signup, login). This is the foundation.
2.  **Phase 2 (Read-Only Migration):** Update all pages that *read* data (homepage, trip details, search) to fetch from Firestore instead of `mock-data.ts`. The app will now display live data.
3.  **Phase 3 (Write/Update Migration):** One by one, migrate all forms and actions that *write* or *update* data (booking, profile updates, admin actions). Start with the most critical flows like booking and organizer profile updates.
4.  **Phase 4 (Storage):** Once data flows are stable, implement Firebase Storage for all image and file uploads.

By following this guide, you can methodically and safely transition the Travonex prototype into a fully functional, scalable, and secure application powered by Firebase.
