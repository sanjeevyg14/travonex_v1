/**
 * @fileoverview Admin page for reviewing and approving pending offers.
 * @description Allows admins to see a list of offers submitted by advertisers,
 * review their details, and either approve them to go live or reject them with feedback.
 * An advertiser's verification status is now displayed.
 */
"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { offers as mockOffers, organizers } from "@/lib/mock-data";
import type { Offer } from "@/lib/types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { CheckCircle, Eye, ShieldCheck, ShieldAlert, XCircle } from "lucide-react";
import Link from 'next/link';

// Component for the rejection dialog
function RejectionDialog({ offer, onReject }: { offer: Offer; onReject: (id: string, reason: string) => void }) {
    const [reason, setReason] = React.useState("");
    const [open, setOpen] = React.useState(false);

    const handleReject = () => {
        if (!reason) {
            alert("Please provide a reason for rejection.");
            return;
        }
        onReject(offer.id, reason);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" size="sm"><XCircle className="mr-2 h-4 w-4"/> Reject</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reject Offer: {offer.title}</DialogTitle>
                    <DialogDescription>
                        Please provide a clear reason for rejection. This will be sent to the advertiser.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <Label htmlFor="rejection-reason">Rejection Reason</Label>
                    <Textarea
                        id="rejection-reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g., The offer description is unclear, or the discount value is not competitive."
                    />
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleReject}>Confirm Rejection</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


export default function AdminOffersPendingPage() {
    const [pendingOffers, setPendingOffers] = React.useState<Offer[]>([]);
    const { toast } = useToast();

    React.useEffect(() => {
        // BACKEND: API call to GET /api/admin/offers?status=Pending
        setPendingOffers(mockOffers.filter(o => o.status === 'Pending'));
    }, []);

    const handleApprove = (offerId: string) => {
        // BACKEND: API call to POST /api/admin/offers/{offerId}/approve
        setPendingOffers(prev => prev.filter(o => o.id !== offerId));
        toast({ title: "Offer Approved", description: "The offer is now live on the platform." });
    };

    const handleReject = (offerId: string, reason: string) => {
        // BACKEND: API call to POST /api/admin/offers/{offerId}/reject with { reason }
        const rejectedOffer = pendingOffers.find(o => o.id === offerId);
        if (rejectedOffer) {
            rejectedOffer.rejectionReason = reason;
        }
        setPendingOffers(prev => prev.filter(o => o.id !== offerId));
        toast({ variant: "destructive", title: "Offer Rejected", description: "The advertiser has been notified." });
        console.log(`Offer ${offerId} rejected for reason: ${reason}`);
    };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
          Pending Offer Approvals
        </h1>
        <p className="text-lg text-muted-foreground">
          Review and approve new offers submitted by advertisers.
        </p>
      </div>

       <Card>
            <CardHeader>
                <CardTitle>Approval Queue</CardTitle>
                <CardDescription>A list of all offers waiting for administrative review.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Advertiser</TableHead>
                            <TableHead>Offer Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Submitted On</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pendingOffers.length > 0 ? pendingOffers.map(offer => {
                             const advertiser = organizers.find(o => o.id === offer.advertiserId);
                             const isAdvertiserVerified = advertiser?.kycStatus === 'Verified';
                             return (
                                <TableRow key={offer.id}>
                                    <TableCell>
                                        <div className="font-medium">{advertiser?.name || offer.advertiserId}</div>
                                        <div className={`flex items-center text-xs gap-1 ${isAdvertiserVerified ? 'text-green-600' : 'text-amber-600'}`}>
                                            {isAdvertiserVerified ? <ShieldCheck className="h-3 w-3"/> : <ShieldAlert className="h-3 w-3"/>}
                                            <span>{advertiser?.kycStatus}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{offer.title}</TableCell>
                                    <TableCell><Badge variant="outline">{offer.category}</Badge></TableCell>
                                    <TableCell>{new Date(offer.createdAt || Date.now()).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Link href={`/offers/${offer.slug}`} target="_blank"><Button variant="ghost" size="sm"><Eye className="mr-2 h-4 w-4" /> Preview</Button></Link>
                                        <Button 
                                            variant="default" 
                                            size="sm" 
                                            className="bg-green-600 hover:bg-green-700" 
                                            onClick={() => handleApprove(offer.id)}
                                            disabled={!isAdvertiserVerified}
                                            title={!isAdvertiserVerified ? "Cannot approve offer from unverified advertiser." : "Approve Offer"}
                                        >
                                            <CheckCircle className="mr-2 h-4 w-4"/> Approve
                                        </Button>
                                        <RejectionDialog offer={offer} onReject={handleReject} />
                                    </TableCell>
                                </TableRow>
                            )
                        }) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No pending offers. The queue is clear!
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
