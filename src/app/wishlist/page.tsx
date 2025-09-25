
"use client";

import * as React from "react";
import { TripCard, TripCardSkeleton } from "@/components/common/TripCard";
import { trips } from "@/lib/mock-data";
import type { Trip } from "@/lib/types";
import { Heart } from "lucide-react";

// Mock wishlisted trips by filtering from the main data source
const wishlistedTripIds = ['1', '3', '6'];

export default function WishlistPage() {
    const [wishlistedTrips, setWishlistedTrips] = React.useState<Trip[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        // FRONTEND: Simulate fetching wishlist data
        // BACKEND: GET /api/users/me/wishlist
        setIsLoading(true);
        setTimeout(() => {
            const fetchedTrips = trips.filter(trip => wishlistedTripIds.includes(trip.id));
            setWishlistedTrips(fetchedTrips);
            setIsLoading(false);
        }, 500); // Simulate network delay
    }, []);

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <main className="flex flex-1 flex-col gap-4 py-4 md:gap-8 md:py-8">
        <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
            Your Wishlist
            </h1>
            <p className="text-lg text-muted-foreground">
            The adventures you're dreaming of.
            </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <TripCardSkeleton key={i} />)
            ) : wishlistedTrips.length > 0 ? (
                wishlistedTrips.map(trip => (
                <TripCard key={trip.id} trip={trip} />
                ))
            ) : (
                <div className="col-span-full flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-8">
                    <div className="flex flex-col items-center gap-2 text-center p-8">
                        <Heart className="h-12 w-12 text-muted-foreground" />
                        <h3 className="text-2xl font-bold tracking-tight">
                            Your wishlist is empty
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Click the heart icon on any trip to save it here for later.
                        </p>
                    </div>
                </div>
            )}
        </div>
        </main>
    </div>
  );
}
