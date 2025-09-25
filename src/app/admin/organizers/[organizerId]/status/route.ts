
/**
 * @fileoverview API Route for updating an organizer's KYC status.
 * @description This is a protected endpoint for admins only.
 *
 * @method PATCH
 * @endpoint /api/admin/organizers/{organizerId}/status
 *
 * @body
 * {
 *   "kycStatus": "'Verified' | 'Rejected' | 'Suspended' | 'Pending'"
 * }
 *
 * @returns
 * - 200 OK: { message: "Status updated" }
 * - 400 Bad Request
 * - 401 Unauthorized / 403 Forbidden
 * - 500 Internal Server Error
 */
import { NextResponse } from 'next/server';
import { organizers } from '@/lib/mock-data';
import { getSession } from '@/lib/session';
import { auditLogs } from '@/lib/mock-data';

export async function PATCH(
  request: Request,
  { params }: { params: { organizerId: string } }
) {
  // --- Authentication & Authorization Check ---
  const { user } = await getSession();

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // CTO_AUDIT_FIX: Corrected role check. Previously allowed any authenticated user.
    // Now, it correctly verifies that the user is an administrator.
    const isAdmin = user.role !== 'USER' && user.role !== 'ORGANIZER';

    if (!isAdmin) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    // --- End Check ---

    const { organizerId } = params;
    const { kycStatus } = await request.json();

    if (!kycStatus || !['Verified', 'Rejected', 'Suspended', 'Pending'].includes(kycStatus)) {
      return NextResponse.json({ message: 'Invalid status provided' }, { status: 400 });
    }

    // --- Database Update Simulation ---
    const organizerIndex = organizers.findIndex(o => o.id === organizerId);
    if (organizerIndex === -1) {
      return NextResponse.json({ message: 'Organizer not found' }, { status: 404 });
    }

    // This is where you would update the record in your database.
    // e.g., db.organizers.update({ where: { id: organizerId }, data: { kycStatus } });
    organizers[organizerIndex].kycStatus = kycStatus;

    // CTO_AUDIT_FIX: Create an audit log entry for this critical action.
    const logEntry = {
      id: `log_${Date.now()}`,
      adminId: user.id,
      adminName: user.name,
      action: 'Update' as const,
      module: 'Trip Organisers',
      details: `Changed status for ${organizers[organizerIndex].name} (ID: ${organizerId}) to ${kycStatus}.`,
      timestamp: new Date().toISOString()
    };
    auditLogs.push(logEntry);
    console.log("Audit Log created:", logEntry);
    // --- End of Database Update Simulation ---

    return NextResponse.json({ message: 'Organizer status updated successfully' });

  } catch (error)
 {
    console.error(`Failed to update organizer status for ${params.organizerId}:`, error);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}
