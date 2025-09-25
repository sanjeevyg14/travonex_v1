
"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { leads as mockLeads, trips as mockTrips, organizers, leadPackages } from "@/lib/mock-data";
import type { Lead, Organizer, LeadPackage, LeadUnlock } from "@/lib/types";
import { EyeOff, Lock, MessageSquare, Phone, Contact, ShoppingBag, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { BuyLeadsDialog } from "@/components/organizer/BuyLeadsDialog";
import { useAuthGuard } from "@/hooks/useAuthGuard";


const LeadsTableSkeleton = () => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>User Details</TableHead>
                <TableHead>Trip</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
);


export default function OrganizerLeadsPage() {
    const { toast } = useToast();
    const [leads, setLeads] = React.useState<Lead[]>([]);
    const [organizer, setOrganizer] = React.useState<Organizer | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const { user: authUser } = useAuthGuard('ORGANIZER');
    const [unlockingLeadId, setUnlockingLeadId] = React.useState<string | null>(null);

    React.useEffect(() => {
        if(authUser) {
            setIsLoading(true);
            // In a real app, this would be an API call: GET /api/organizers/me/leads
            setTimeout(() => {
                const fetchedOrganizer = organizers.find(o => o.id === authUser.id);
                if (fetchedOrganizer) {
                    const organizerTripIds = mockTrips.filter(t => t.organizerId === fetchedOrganizer.id).map(t => t.id);
                    const fetchedLeads = (mockLeads || []).filter(l => organizerTripIds.includes(l.tripId));
                    setLeads(fetchedLeads);
                    setOrganizer(fetchedOrganizer);
                }
                setIsLoading(false);
            }, 500);
        }
    }, [authUser]);

    const handleUnlockLead = async (lead: Lead) => {
        if (!organizer || organizer.leadCredits.available <= 0) {
            toast({ variant: "destructive", title: "No Credits Remaining", description: "Please purchase a lead package to unlock leads." });
            return;
        }

        setUnlockingLeadId(lead.id);

        try {
            // CTO_AUDIT_FIX: Server-side validation is critical. This API call simulates that.
            // A real backend would make this an atomic transaction: check credits, deduct, unlock lead.
            const response = await fetch(`/api/leads/${lead.id}/unlock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ organizerId: organizer.id })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to unlock lead.');
            }

            // If API call is successful, update the frontend state
            setOrganizer(result.organizer);
            setLeads(result.leads);
            
            toast({ title: "Lead Unlocked!", description: "1 credit has been deducted from your account." });

        } catch (error: any) {
            toast({ title: "Unlock Failed", description: error.message, variant: 'destructive' });
        } finally {
            setUnlockingLeadId(null);
        }
    };

    const handlePurchasePackage = (pkg: LeadPackage) => {
        if (!organizer) return;
        
        const newPurchase: any = { // Use 'any' to bypass strict type checking for mock data
            id: `lph_${Date.now()}`,
            packageId: pkg.id,
            packageName: pkg.name,
            creditsPurchased: pkg.leadCount + (pkg.bonusCredits || 0),
            price: pkg.price,
            createdAt: new Date().toISOString(),
            paymentRef: `pay_${Date.now()}`
        };

        const updatedOrganizer: Organizer = {
            ...organizer,
            leadCredits: { 
                ...organizer.leadCredits, 
                available: organizer.leadCredits.available + newPurchase.creditsPurchased 
            },
            leadPurchaseHistory: [...organizer.leadPurchaseHistory, newPurchase]
        };

        setOrganizer(updatedOrganizer);
        toast({ title: "Purchase Successful!", description: `${newPurchase.creditsPurchased} credits have been added to your account.` });
    };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
          Leads
        </h1>
        <p className="text-lg text-muted-foreground">
          View and manage potential customers who have shown interest in your trips.
        </p>
      </div>

       <Alert>
            <AlertTitle className="font-semibold">You have {organizer?.leadCredits.available ?? 0} Lead Credits</AlertTitle>
            <AlertDescription className="flex justify-between items-center">
                <span>You are on the <strong>{organizer?.leadCredits.planName ?? 'No Plan'}</strong>. Purchase more credits to unlock leads.</span>
                 <BuyLeadsDialog onPurchase={handlePurchasePackage}>
                     <Button><ShoppingBag className="mr-2"/>Buy Packages</Button>
                 </BuyLeadsDialog>
            </AlertDescription>
        </Alert>

      <Card>
        <CardHeader>
          <CardTitle>All Leads</CardTitle>
          <CardDescription>A list of all users who requested assistance for your trips.</CardDescription>
        </CardHeader>
        <CardContent>
            {isLoading ? <LeadsTableSkeleton /> : (
                 <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>User Details</TableHead>
                        <TableHead>Trip</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {leads.length > 0 ? leads.map((lead) => {
                        const trip = mockTrips.find(t => t.id === lead.tripId);
                        const isUnlocking = unlockingLeadId === lead.id;
                        return (
                            <TableRow key={lead.id}>
                                <TableCell>
                                    {lead.isUnlocked ? (
                                        <>
                                            <div className="font-medium">{lead.name}</div>
                                            <div className="text-sm text-muted-foreground">{lead.email}</div>
                                            <div className="text-sm text-muted-foreground">{lead.phone}</div>
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-2 text-muted-foreground italic">
                                            <EyeOff className="h-4 w-4" />
                                            <span>Details Locked</span>
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>{trip?.title}</TableCell>
                                <TableCell>{new Date(lead.date).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Badge variant={lead.convertedToBooking ? "default" : "secondary"} className={lead.convertedToBooking ? 'bg-green-600' : ''}>
                                        {lead.convertedToBooking ? 'Converted' : 'New Lead'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    {lead.isUnlocked ? (
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                                                    <Phone className="mr-2"/> WhatsApp
                                                </a>
                                            </Button>
                                            {lead.message && (
                                                <Button variant="ghost" size="sm">
                                                    <MessageSquare className="mr-2"/> View Message
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        <Button size="sm" onClick={() => handleUnlockLead(lead)} disabled={isUnlocking}>
                                            {isUnlocking ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Lock className="mr-2"/>}
                                            Unlock Lead (1 credit)
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    }) : (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                    <Contact className="h-10 w-10"/>
                                    You have no leads yet.
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>
    </main>
  );
}
