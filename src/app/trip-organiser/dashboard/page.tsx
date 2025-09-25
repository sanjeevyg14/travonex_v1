

'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Briefcase, ShieldCheck } from "lucide-react";
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { organizers, trips, bookings, users as mockUsers } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import type { Organizer, Trip, Booking } from '@/lib/types';


function OrganizerDashboardSkeleton() {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
    );
}

export default function OrganizerDashboardPage() {
    const { loading, isAuthorized, user } = useAuthGuard('ORGANIZER');
    const [dashboardData, setDashboardData] = React.useState<any>(null);

    React.useEffect(() => {
        if (isAuthorized && user) {
            // In a real app, this would be a single API call: GET /api/organizers/me/dashboard
            const organizerId = user.id;
            const organizer = organizers.find(o => o.id === organizerId);
            const organizerTrips = trips.filter(t => t.organizerId === organizerId);
            const organizerTripIds = organizerTrips.map(t => t.id);
            const organizerBookings = bookings.filter(b => organizerTripIds.includes(b.tripId) && b.status !== 'Cancelled');
            
            const data = {
                totalRevenue: organizerBookings.reduce((acc, b) => acc + b.amount, 0),
                totalParticipants: organizerBookings.reduce((acc, b) => acc + b.travelers.length, 0),
                activeTrips: organizerTrips.filter(t => t.status === 'Published').length,
                kycStatus: organizer?.kycStatus || 'Incomplete',
                recentBookings: organizerBookings.slice(0, 5).map(b => {
                    const customer = mockUsers.find(u => u.id === b.userId);
                    const trip = trips.find(t => t.id === b.tripId);
                    return {
                        id: b.id,
                        customerName: customer?.name,
                        customerEmail: customer?.email,
                        tripTitle: trip?.title,
                        status: b.status,
                        amount: b.amount,
                    }
                }),
            };
            setDashboardData(data);
        }
    }, [isAuthorized, user]);
    
    if (loading || !dashboardData) {
        return (
             <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <OrganizerDashboardSkeleton />
             </main>
        );
    }
    

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
        Organizer Dashboard
      </h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <span className="text-muted-foreground">₹</span>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">₹{dashboardData.totalRevenue.toLocaleString('en-IN')}</div>
                <p className="text-xs text-muted-foreground">
                All-time gross revenue
                </p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">+{dashboardData.totalParticipants}</div>
                <p className="text-xs text-muted-foreground">
                in all trips
                </p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Trips</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{dashboardData.activeTrips}</div>
                <p className="text-xs text-muted-foreground">
                currently listed
                </p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">KYC Status</CardTitle>
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${dashboardData.kycStatus === 'Verified' ? 'text-green-600' : 'text-amber-500'}`}>{dashboardData.kycStatus}</div>
                <p className="text-xs text-muted-foreground">
                Verification status
                </p>
            </CardContent>
            </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>A list of recent bookings for your trips.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Trip</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {dashboardData.recentBookings.map((booking: any) => (
                    <TableRow key={booking.id}>
                    <TableCell>
                        <div className="font-medium">{booking.customerName}</div>
                        <div className="text-sm text-muted-foreground">{booking.customerEmail}</div>
                    </TableCell>
                    <TableCell>{booking.tripTitle}</TableCell>
                    <TableCell>
                        <Badge variant={booking.status === 'Confirmed' ? 'default' : 'secondary'}>{booking.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">₹{booking.amount.toLocaleString('en-IN')}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </main>
  );
}
