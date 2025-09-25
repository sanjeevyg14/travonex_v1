
/**
 * @fileoverview API Route for an organizer to submit their profile for verification.
 * @description This is a protected endpoint for organizers only. It marks their status as 'Pending'
 * and notifies admins.
 *
 * @method POST
 * @endpoint /api/organizers/{organizerId}/submit-for-verification
 *
 * @returns
 * - 200 OK: { message: "Profile submitted for verification." }
 * - 400 Bad Request: If profile is incomplete.
 * - 401 Unauthorized / 403 Forbidden
 * - 500 Internal Server Error
 */
import { NextResponse } from 'next/server';
import { organizers, adminNotifications } from '@/lib/mock-data';
import { getSession } from '@/lib/session';
import { ShieldCheck } from 'lucide-react';

export async function POST(
  request: Request,
  { params }: { params: { organizerId: string } }
) {
  // --- Authentication & Authorization Check ---
  const { user } = await getSession();

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { organizerId } = params;

  // An organizer can only submit their own profile for verification.
  if (user.role !== 'ORGANIZER' || user.id !== organizerId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }
  
  try {
    const organizerIndex = organizers.findIndex(o => o.id === organizerId);
    if (organizerIndex === -1) {
      return NextResponse.json({ message: 'Organizer not found' }, { status: 404 });
    }

    const organizer = organizers[organizerIndex];

    // --- Business Logic Validation ---
    // The backend MUST re-validate that all documents are uploaded before allowing this status change.
    const allDocsUploaded = organizer.documents.every(doc => doc.status === 'Uploaded' || doc.status === 'Verified');
    const isAgreementUploaded = organizer.vendorAgreementStatus === 'Submitted' || organizer.vendorAgreementStatus === 'Verified';

    if (!allDocsUploaded || !isAgreementUploaded) {
        return NextResponse.json({ message: 'Cannot submit for verification. Please upload all required documents and the signed agreement first.' }, { status: 400 });
    }
    // --- End Validation ---

    // Update organizer status to 'Pending'
    organizers[organizerIndex].kycStatus = 'Pending';
    
    // --- Notification for Admins ---
    // In a real app, this would be a more robust notification system (e.g., database entry, push notification).
    const newNotification = {
        id: `notif_${Date.now()}`,
        type: 'KYC' as const,
        title: `KYC Submitted for ${organizer.name}`,
        description: `${organizer.name} has submitted documents for verification.`,
        timestamp: new Date().toISOString(),
        isRead: false,
        link: `/admin/trip-organisers/${organizer.id}`,
        icon: ShieldCheck,
        iconColor: 'text-blue-500'
    };
    adminNotifications.unshift(newNotification);
    console.log("Admin notification created:", newNotification);
    // --- End Notification ---

    return NextResponse.json({ message: 'Profile submitted for verification successfully.' });

  } catch (error) {
    console.error(`Failed to submit profile for organizer ${organizerId}:`, error);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}
