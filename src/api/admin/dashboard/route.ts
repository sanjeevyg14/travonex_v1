/**
 * @fileoverview API Route for fetching dashboard data for an authenticated admin.
 * @description This is a protected endpoint for admins only.
 *
 * @method GET
 * @endpoint /api/admin/dashboard
 *
 * @returns
 * - 200 OK: { totalRevenue: number, ...etc }
 * - 401 Unauthorized / 403 Forbidden
 * - 500 Internal Server Error
 */
import { NextResponse } from 'next/server';
import { users, organizers, trips, bookings, payouts } from '@/lib/mock-data';
import { getSession } from '@/lib/session';

export async function GET(request: Request) {
  // --- Authentication & Authorization ---
  const { user } = await getSession();

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const isAdmin = user.role === 'ADMIN';

    if (!isAdmin) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    // --- End of Authentication ---

    // --- Database Query Simulation ---
    // These would be efficient aggregate queries in a real database.
    const totalRevenue = bookings.filter(b => b.status !== 'Cancelled').reduce((acc, b) => acc + b.amount, 0);
    const pendingKycs = organizers.filter(o => o.kycStatus === 'Pending' || o.vendorAgreementStatus === 'Submitted').length;
    const pendingTrips = trips.filter(t => t.status === 'Pending Approval').length;
    const pendingPayouts = payouts.filter(p => p.status === 'Pending').length;
    const recentBookings = bookings.slice(0, 5).map(booking => {
        const user = users.find(u => u.id === booking.userId);
        const trip = trips.find(t => t.id === booking.tripId);
        return {
            id: booking.id,
            userName: user?.name,
            tripTitle: trip?.title,
            bookingDate: booking.bookingDate,
            amount: booking.amount,
        }
    });

    const dashboardData = {
        totalRevenue,
        totalUsers: users.length,
        totalOrganizers: organizers.length,
        totalBookings: bookings.length,
        pendingKycs,
        pendingTrips,
        pendingPayouts,
        totalPending: pendingKycs + pendingTrips + pendingPayouts,
        recentBookings,
    };
    // --- End of Database Query Simulation ---

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Failed to fetch admin dashboard data:', error);
    return NextResponse.json({ message: 'An error occurred.' }, { status: 500 });
  }
}
