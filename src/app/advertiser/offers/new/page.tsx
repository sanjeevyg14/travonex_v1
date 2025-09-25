
/**
 * @fileoverview Page for advertisers to create a new offer.
 * @description This form allows verified advertisers to submit a new promotional offer for admin approval.
 */
"use client";

import { OfferForm } from "@/components/advertiser/OfferForm";

export default function NewAdvertiserOfferPage() {

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
                    Create New Offer
                </h1>
                <p className="text-lg text-muted-foreground">
                    Fill out the details below to create and submit your new offer for approval.
                </p>
            </div>
            <OfferForm />
        </main>
    );
}
