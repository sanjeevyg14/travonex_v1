
/**
 * @fileoverview API Route for an organizer to unlock a lead.
 * @description This is a protected endpoint. It verifies the organizer has enough credits,
 * deducts one credit, and returns the unlocked lead details. This must be an atomic server operation.
 */
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { organizers, leads as mockLeads, trips as mockTrips } from '@/lib/mock-data';

export async function POST(
  request: Request,
  { params }: { params: { leadId: string } }
) {
  const { user } = await getSession();
  if (!user || user.role !== 'ORGANIZER') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const { leadId } = params;
  const organizerId = user.id;

  try {
    const organizerIndex = organizers.findIndex(o => o.id === organizerId);
    const leadIndex = mockLeads.findIndex(l => l.id === leadId);

    if (organizerIndex === -1 || leadIndex === -1) {
      return NextResponse.json({ message: 'Organizer or Lead not found.' }, { status: 404 });
    }

    const organizer = organizers[organizerIndex];
    const lead = mockLeads[leadIndex];

    // Business Logic Validation
    if (organizer.leadCredits.available <= 0) {
      return NextResponse.json({ message: 'Insufficient lead credits.' }, { status: 400 });
    }
    if (lead.isUnlocked) {
      return NextResponse.json({ message: 'Lead is already unlocked.' }, { status: 400 });
    }

    // --- Start Atomic Operation Simulation ---
    // In a real database, this would be a transaction.
    
    // 1. Deduct credit
    organizers[organizerIndex].leadCredits.available -= 1;
    
    // 2. Mark lead as unlocked
    mockLeads[leadIndex].isUnlocked = true;
    
    // 3. Create an unlock history record
    const trip = mockTrips.find(t => t.id === lead.tripId);
    const newUnlockRecord = {
        id: `luh_${Date.now()}`,
        leadId: lead.id,
        leadName: lead.name,
        tripTitle: trip?.title || 'Unknown Trip',
        cost: 1,
        createdAt: new Date().toISOString(),
    };
    organizers[organizerIndex].leadUnlockHistory.push(newUnlockRecord);

    // --- End Atomic Operation Simulation ---

    // Return the updated organizer and leads list for the frontend to update its state
    const updatedOrganizerLeads = mockLeads.filter(l => 
        mockTrips.some(t => t.organizerId === organizerId && t.id === l.tripId)
    );

    return NextResponse.json({
        message: 'Lead unlocked successfully!',
        organizer: organizers[organizerIndex],
        leads: updatedOrganizerLeads,
    });

  } catch (error) {
    console.error('Failed to unlock lead:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
