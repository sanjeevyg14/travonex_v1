

"use client";

import * as React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Ticket } from 'lucide-react';
import Link from 'next/link';

// DEV_COMMENT: FIX - Added `children` to props to render the trigger button.
export function SpotReservationDialog({ trip, batch, children }: { trip: any; batch: any; children: React.ReactNode }) {
    if (!trip.spotReservationEnabled || !trip.spotReservationDetails) return <>{children}</>; // Return children directly if not enabled

    const details = trip.spotReservationDetails;
    const remainingAmount = (batch.priceOverride ?? trip.price) - details.advanceAmount;

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Your Spot Reservation</DialogTitle>
                    <DialogDescription>
                        Pay a small advance now to reserve your spot for {trip.title}.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Card>
                        <CardContent className="pt-6 text-sm space-y-2">
                            <div className="flex justify-between font-bold text-lg">
                                <span>Payable Now:</span>
                                <span>₹{details.advanceAmount.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Remaining Balance:</span>
                                <span>₹{remainingAmount.toLocaleString('en-IN')}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Alert>
                        <Ticket className="h-4 w-4" />
                        <AlertTitle>Please Note</AlertTitle>
                        <AlertDescription>{details.description}</AlertDescription>
                    </Alert>
                     {details.termsAndConditions && (
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Terms &amp; Conditions</h4>
                            <div className="p-3 text-xs bg-muted/50 rounded-lg border max-h-24 overflow-y-auto">
                                <p className="whitespace-pre-wrap">{details.termsAndConditions}</p>
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Link href={`/book/${trip.id}?batch=${batch.id}&partial=true`} className="w-full">
                        <Button className="w-full">Confirm &amp; Proceed to Pay</Button>
                    </Link>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
