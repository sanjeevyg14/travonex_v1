/**
 * @fileoverview Advertiser's main dashboard to view and manage their offers.
 * @description This page lists all offers created by the advertiser, showing their status.
 * It is now a protected route and dynamically fetches data for the logged-in advertiser.
 */
"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { offers as mockOffers, organizers } from "@/lib/mock-data";
import type { Offer, Organizer } from "@/lib/types";
import { PlusCircle, Edit, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuthGuard } from "@/hooks/useAuthGuard";

const getStatusBadgeClass = (status: Offer['status']) => {
    switch (status) {
        case 'Active': return 'bg-green-600';
        case 'Pending': return 'bg-amber-500';
        case 'Rejected': return 'bg-red-600';
        case 'Expired': return 'bg-slate-500';
        default: return 'bg-gray-500';
    }
}

export default function AdvertiserOffersPage() {
    // DEV_COMMENT: Protect the route and get the currently authenticated user.
    const { user } = useAuthGuard('ORGANIZER'); 
    
    // In a real app, these would be fetched via API calls using the user's ID.
    const advertiser: Organizer | undefined = React.useMemo(() => 
        user ? organizers.find(o => o.id === user.id) : undefined, 
    [user]);
    
    const advertiserOffers: Offer[] = React.useMemo(() => 
        user ? mockOffers.filter(o => o.advertiserId === user.id) : [],
    [user]);

    if (!user || !advertiser) {
        // The auth guard will handle redirection, this is a fallback.
        return null; 
    }

    const isVerified = advertiser.kycStatus === 'Verified';

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
            My Offers
            </h1>
            <p className="text-lg text-muted-foreground">
            Manage your advertised offers and track their performance.
            </p>
        </div>
        <Link href="/advertiser/offers/new">
            <Button size="lg" disabled={!isVerified} title={!isVerified ? "Complete your profile verification to create offers" : "Create a new offer"}>
                <PlusCircle className="mr-2 h-5 w-5" />
                Create Offer
            </Button>
        </Link>
      </div>
      
      {!isVerified && (
        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Verification Required</AlertTitle>
            <AlertDescription>
                Your profile is not yet verified. Please complete your profile and KYC in the <Link href="/trip-organiser/profile" className="font-bold underline">Profile & KYC section</Link> to be able to create and publish offers.
            </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
            <CardTitle>Your Offer Listings</CardTitle>
            <CardDescription>A list of all offers you have created.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Offer Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Validity</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {advertiserOffers.length > 0 ? advertiserOffers.map(offer => (
                        <TableRow key={offer.id}>
                            <TableCell className="font-medium">{offer.title}</TableCell>
                            <TableCell>{offer.category}</TableCell>
                            <TableCell>
                                <Badge className={getStatusBadgeClass(offer.status)}>{offer.status}</Badge>
                                {offer.status === 'Rejected' && offer.rejectionReason && <p className="text-xs text-red-500 mt-1">{offer.rejectionReason}</p>}
                            </TableCell>
                            <TableCell>{new Date(offer.validityEndDate).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="outline" size="icon"><Edit className="h-4 w-4"/></Button>
                            </TableCell>
                        </TableRow>
                    )) : (
                         <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                You haven't created any offers yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </main>
  );
}
