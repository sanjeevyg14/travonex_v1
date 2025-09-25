
"use client";

import * as React from "react";
import { BookingsClient } from "@/components/bookings/BookingsClient";
import { bookings as mockBookings, trips, organizers } from "@/lib/mock-data";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Briefcase, Loader2 } from "lucide-react";
import type { Booking } from "@/lib/types";

function BookingsPageSkeleton() {
    return (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-8">
            <div className="flex flex-col items-center gap-2 text-center p-8">
                <Briefcase className="h-12 w-12 text-muted-foreground animate-pulse" />
                <h3 className="text-2xl font-bold tracking-tight">
                    Loading Your Bookings
                </h3>
                <p className="text-sm text-muted-foreground">
                    Please wait a moment...
                </p>
            </div>
        </div>
    )
}

export default function BookingsPage() {
  const { loading: authLoading, isAuthorized, user } = useAuthGuard('USER');
  const [userBookings, setUserBookings] = React.useState<Booking[] | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // This logic runs only after the guard has confirmed the user is authorized.
    if (isAuthorized && user) {
        setIsLoading(true);
        // In a real app, this would be an API call: GET /api/users/me/bookings
        setTimeout(() => { // Simulate network delay
            const fetchedBookings = mockBookings.filter(b => b.userId === user.id);
            setUserBookings(fetchedBookings);
            setIsLoading(false);
        }, 500);
    }
  }, [isAuthorized, user]);

  if (authLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <main className="flex flex-1 flex-col gap-4 py-4 md:gap-8 md:py-8">
        <div className="space-y-1 px-2 md:px-0">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Your Bookings
            </h1>
            <p className="text-base text-muted-foreground">
            Manage your upcoming and view details of past adventures.
            </p>
        </div>
        
        {isLoading ? <BookingsPageSkeleton /> : (
            <BookingsClient 
                initialBookings={userBookings || []} 
                allTrips={trips} 
                allOrganizers={organizers} 
            />
        )}
        </main>
    </div>
  );
}
