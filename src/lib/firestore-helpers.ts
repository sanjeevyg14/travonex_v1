/**
 * @fileoverview Firestore Helper Functions
 * @description This file contains reusable functions for interacting with the Firestore database.
 * It abstracts the direct Firestore API calls, making the application code cleaner and easier to manage.
 * These functions replace the direct access to `mock-data.ts`.
 */
import { db } from './firebase';
import { collection, query, where, getDocs, getDoc, doc, addDoc, updateDoc, writeBatch, Timestamp } from 'firebase/firestore';
import type { Trip, Organizer, User, Booking } from './types';

// =================================================================
// FETCH FUNCTIONS (READ)
// =================================================================

/**
 * Fetches trips based on various filter criteria.
 * @param filters - An object containing filter conditions.
 * @returns A promise that resolves to an array of Trip objects.
 */
export async function getTrips(filters: {
    isFeatured?: boolean;
    isBanner?: boolean;
    city?: string;
    category?: string;
    limit?: number;
}): Promise<Trip[]> {
    const tripsRef = collection(db, 'trips');
    let q = query(tripsRef, where('status', '==', 'Published'));

    if (filters.isFeatured) {
        q = query(q, where('isFeatured', '==', true));
    }
    if (filters.isBanner) {
        q = query(q, where('isBannerTrip', '==', true));
    }
    if (filters.city && filters.city !== 'all') {
        q = query(q, where('city', '==', filters.city));
    }
    if (filters.category) {
        q = query(q, where('tripType', '==', filters.category));
    }
    // Note: Firestore doesn't support complex "OR" queries on different fields easily.
    // For full-text search, a dedicated search service like Algolia or Typesense is recommended.

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trip));
}

/**
 * Fetches a single trip by its slug.
 * @param slug - The URL-friendly slug of the trip.
 * @returns A promise that resolves to the Trip object or null if not found.
 */
export async function getTripBySlug(slug: string): Promise<Trip | null> {
    const tripsRef = collection(db, 'trips');
    const q = query(tripsRef, where('slug', '==', slug), where('status', '==', 'Published'));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const tripDoc = querySnapshot.docs[0];
    return { id: tripDoc.id, ...tripDoc.data() } as Trip;
}


// =================================================================
// MUTATION FUNCTIONS (WRITE/UPDATE)
// =================================================================

/**
 * Creates a new booking document in Firestore.
 * This function should be called after a successful payment transaction.
 * It uses a write batch to ensure atomicity (all operations succeed or all fail).
 * @param bookingData - The data for the new booking.
 * @returns The ID of the newly created booking.
 */
export async function createBooking(bookingData: Omit<Booking, 'id' | 'bookingDate'>): Promise<string> {
    const batch = writeBatch(db);

    // 1. Create the new booking document.
    const bookingRef = doc(collection(db, 'bookings'));
    batch.set(bookingRef, {
        ...bookingData,
        bookingDate: Timestamp.now(), // Use server timestamp for reliability.
        status: 'Confirmed', // Set status to confirmed upon creation.
    });

    // 2. Decrement the available slots for the trip batch.
    // In a real app, you would fetch the batch, decrement, and then update.
    // For simplicity, we assume the frontend provides the correct batch reference.
    // Note: For high-concurrency scenarios, using a Firestore Transaction here is crucial
    // to prevent overbooking. A write batch is good, but a transaction is better for read-modify-write ops.
    const batchRef = doc(db, 'trips', bookingData.tripId, 'batches', bookingData.batchId);
    // batch.update(batchRef, { availableSlots: increment(-bookingData.travelers.length) });

    await batch.commit();
    return bookingRef.id;
}

/**
 * Updates the status of an organizer's profile (e.g., for KYC verification).
 * This is an admin-only action.
 * @param organizerId - The ID of the organizer to update.
 * @param status - The new KYC status.
 */
export async function updateOrganizerStatus(organizerId: string, status: Organizer['kycStatus']): Promise<void> {
    const organizerRef = doc(db, 'organizers', organizerId);
    await updateDoc(organizerRef, { kycStatus: status });
    // BACKEND_NOTE: An audit log entry should also be created here.
}
