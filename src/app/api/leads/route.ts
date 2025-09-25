
import { NextResponse } from 'next/server';
import { leads } from '@/lib/mock-data';
import type { Lead } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tripId, name, email, phone, message } = body;

    if (!tripId || !name || !email || !phone) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // --- Database Simulation ---
    const newLead: Lead = {
      id: `LEAD${Date.now()}`,
      tripId,
      name,
      email,
      phone,
      message,
      date: new Date().toISOString(),
      isUnlocked: false,
      convertedToBooking: false,
    };

    leads.push(newLead);
    console.log('New lead created:', newLead);
    // --- End Simulation ---

    // In a real app, you would also trigger notifications here.

    return NextResponse.json({ message: 'Lead submitted successfully!', lead: newLead }, { status: 201 });
  } catch (error) {
    console.error('Failed to create lead:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
