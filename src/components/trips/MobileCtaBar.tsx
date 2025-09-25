
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HandHelping, ShoppingCart, Ticket } from 'lucide-react';
import type { Trip, TripBatch } from '@/lib/types';
import { SpotReservationDialog } from './SpotReservationDialog';
import { LeadFormDialog } from '../common/LeadFormDialog';

interface MobileCtaBarProps {
  trip: Trip;
  batch: TripBatch | null;
}

export function MobileCtaBar({ trip, batch }: MobileCtaBarProps) {
  if (!batch) {
    return null;
  }

  const showReserveSpot = trip.spotReservationEnabled && trip.spotReservationDetails;

  return (
    <div className="fixed bottom-0 left-0 z-40 w-full lg:hidden bg-background/95 backdrop-blur-sm border-t p-2 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]" style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex-shrink-0 pl-2">
          <p className="font-bold text-lg">₹{(batch.priceOverride ?? trip.price).toLocaleString('en-IN')}</p>
          <p className="text-xs text-muted-foreground">per person</p>
        </div>
        <div className="flex items-center gap-2">
           <LeadFormDialog tripId={trip.id} tripTitle={trip.title}>
              <Button variant="outline" className="h-12 px-3">
                <HandHelping className="h-5 w-5 mr-1" />
                Help
              </Button>
            </LeadFormDialog>
            {showReserveSpot && (
               <SpotReservationDialog trip={trip} batch={batch}>
                    <Button variant="outline" className="h-12 text-xs px-2 leading-tight min-w-[44px]">
                        Reserve Spot
                    </Button>
                </SpotReservationDialog>
            )}
           <Link href={`/book/${trip.id}?batch=${batch.id}`}>
                <Button className="h-12 flex-grow min-w-[44px]">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Book Now
                </Button>
           </Link>
        </div>
      </div>
    </div>
  );
}
