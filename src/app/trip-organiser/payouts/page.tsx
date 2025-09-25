
/**
 * @fileoverview Trip Organizer Earnings & Payouts Page
 * @description This page provides Trip Organizers with a comprehensive dashboard to track their earnings, request payouts, and view their payout history.
 * 
 * @developer_notes
 * - **Data Fetching**: The component simulates fetching two key sets of data:
 *   1. `eligibleForPayout`: Batches that are completed and can be requested for payout. The backend should provide this list based on trip completion status.
 *   2. `payoutHistory`: A list of all previously requested or processed payouts.
 * - **State Management**: The component uses `useState` to manage these two lists, providing an interactive experience where requesting a payout moves an item from the "eligible" list to the "history" list.
 * - **API Integration**:
 *   - **Request Payout**: The "Request Payout" action in the `RequestPayoutDialog` should trigger `POST /api/organizers/me/request-payout`. The payload should include the `tripId`, `batchId`, and any `notes`. The backend would then create a new Payout record with `status: 'Pending'`, notifying admins.
 *   - **Invoice Generation API**:
 *     - **Endpoint**: `GET /api/invoices/:payoutId` (secured for the specific organizer).
 *     - **Action**: Triggers on-the-fly generation of a PDF invoice. The backend should use a library like Puppeteer to convert a styled HTML template into a PDF.
 *     - **Invoice Content**: Must include company header, invoice metadata, organizer details (Name, PAN, GSTIN), trip details, a full payout breakdown (gross revenue, commission, net payout), and payment information (UTR, mode, date).
 */
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, Send, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Payout, Trip, TripBatch, Booking } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trips, bookings } from "@/lib/mock-data";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthGuard } from "@/hooks/useAuthGuard";

type EligibleBatch = {
    tripId: string;
    batchId: string;
    tripTitle: string;
    batchDates: string;
    participants: number;
    grossRevenue: number;
    commission: number;
    netPayout: number;
};

// Represents payouts that have been requested or paid.
// Fetched from `GET /api/organizers/me/payout-history`.
const initialPayoutHistory: Payout[] = [
    { id: 'PAY004', tripId: '6', batchId: 'batch-6-1', organizerId: 'VND001', requestDate: '2024-08-01', totalRevenue: 150000, platformCommission: 15000, netPayout: 135000, status: 'Paid', utrNumber: 'upi-ref-29834u', invoiceUrl: '/invoices/invoice.pdf', paidDate: '2024-08-02' },
    { id: 'PAY002', tripId: '3', batchId: 'batch-3-1', organizerId: 'VND001', totalRevenue: 1600000, platformCommission: 160000, netPayout: 1440000, status: 'Pending', requestDate: '2024-07-18', notes: 'Awaiting organizer confirmation' }
];

// A dedicated dialog component for the payout request confirmation.
function RequestPayoutDialog({ batch, onConfirm, disabled, disabledReason }: { batch: EligibleBatch, onConfirm: (batch: EligibleBatch, notes: string) => void, disabled: boolean, disabledReason: string }) {
    const [open, setOpen] = React.useState(false);
    const [notes, setNotes] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleConfirm = async () => {
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 300));
        onConfirm(batch, notes);
        setIsSubmitting(false);
        setOpen(false);
    }

    const triggerButton = (
        <Button size="sm" disabled={disabled || isSubmitting} onClick={() => !disabled && setOpen(true)}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4"/>}
            Request Payout
        </Button>
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="inline-block">{triggerButton}</div>
                    </TooltipTrigger>
                    {disabled && <TooltipContent><p>{disabledReason}</p></TooltipContent>}
                </Tooltip>
            </TooltipProvider>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Payout Request</DialogTitle>
                    <DialogDescription>Review the details below and confirm your request.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <Card className="bg-muted/50">
                        <CardContent className="pt-6 space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">Trip:</span> <strong>{batch.tripTitle}</strong></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Batch:</span> <strong>{batch.batchDates}</strong></div>
                            <div className="flex justify-between font-bold text-lg"><span>Net Payout:</span> <strong>₹{batch.netPayout.toLocaleString('en-IN')}</strong></div>
                        </CardContent>
                    </Card>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes to Admin (Optional)</Label>
                        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g., Please process this urgently." />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleConfirm} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Request
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

const TableSkeleton = ({ columns }: { columns: number }) => (
    <>
        {Array.from({ length: 3 }).map((_, i) => (
            <TableRow key={i}>
                {Array.from({ length: columns }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                ))}
            </TableRow>
        ))}
    </>
);


export default function OrganizerPayoutsPage() {
    const { toast } = useToast();
    const { user } = useAuthGuard('ORGANIZER');
    const [eligible, setEligible] = React.useState<EligibleBatch[]>([]);
    const [history, setHistory] = React.useState<Payout[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        if (user) {
            setIsLoading(true);
            setTimeout(() => {
                const organizerId = user.id;

                // CTO_AUDIT_FIX: Correctly calculate eligible payouts based on completed batches.
                const organizerTrips = trips.filter(t => t.organizerId === organizerId);
                const eligibleBatches: EligibleBatch[] = [];

                organizerTrips.forEach(trip => {
                    trip.batches.forEach(batch => {
                        const isCompleted = new Date(batch.endDate) < new Date();
                        const isAlreadyRequested = initialPayoutHistory.some(p => p.batchId === batch.id);

                        if (isCompleted && !isAlreadyRequested) {
                            const batchBookings = bookings.filter(b => b.batchId === batch.id && b.status !== 'Cancelled');
                            const grossRevenue = batchBookings.reduce((acc, booking) => acc + booking.amount, 0);
                            const commission = grossRevenue * 0.10; // Assuming 10%
                            const netPayout = grossRevenue - commission;

                            if (grossRevenue > 0) {
                                eligibleBatches.push({
                                    tripId: trip.id,
                                    batchId: batch.id,
                                    tripTitle: trip.title,
                                    batchDates: `${new Date(batch.startDate).toLocaleDateString()} - ${new Date(batch.endDate).toLocaleDateString()}`,
                                    participants: batchBookings.reduce((acc, b) => acc + b.travelers.length, 0),
                                    grossRevenue,
                                    commission,
                                    netPayout,
                                });
                            }
                        }
                    });
                });
                
                setEligible(eligibleBatches);
                setHistory(initialPayoutHistory.filter(p => p.organizerId === organizerId));
                setIsLoading(false);
            }, 300);
        }
    }, [user]);

    const availableForPayout = eligible.reduce((acc, batch) => acc + batch.netPayout, 0);
    const totalPaid = history.filter(p => p.status === 'Paid').reduce((acc, p) => acc + p.netPayout, 0);
    
    const handleRequestConfirm = (batch: EligibleBatch, notes: string) => {
        const newPayout: Payout = {
            id: `PAY${Math.floor(Math.random() * 9000) + 1000}`,
            tripId: batch.tripId,
            batchId: batch.batchId,
            organizerId: user!.id,
            totalRevenue: batch.grossRevenue,
            platformCommission: batch.commission,
            netPayout: batch.netPayout,
            status: 'Pending',
            requestDate: new Date().toISOString(),
            notes: notes,
        };
        
        setHistory(prev => [newPayout, ...prev]);
        setEligible(prev => prev.filter(b => b.batchId !== batch.batchId));

        toast({
            title: "Payout Requested!",
            description: `Your request for ₹${batch.netPayout.toLocaleString('en-IN')} has been submitted.`,
        });
    };
  
    const getStatusBadge = (status: Payout['status']) => {
        switch (status) {
            case 'Paid': return 'bg-green-600';
            case 'Pending': return 'bg-amber-500';
            case 'Failed': return 'bg-red-600';
            default: return 'bg-gray-500';
        }
    }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">Earnings & Payouts</h1>
            <p className="text-lg text-muted-foreground">Track your earnings and manage payout requests.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Available for Payout</CardTitle>
                    <span className="text-muted-foreground">₹</span>
                </CardHeader>
                <CardContent>
                    {isLoading ? <Skeleton className="h-8 w-1/2" /> : <p className="text-3xl font-bold">₹{availableForPayout.toLocaleString('en-IN')}</p>}
                    {isLoading ? <Skeleton className="h-4 w-1/3 mt-1" /> : <p className="text-xs text-muted-foreground">From {eligible.length} completed trip(s).</p>}
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Paid Out</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {isLoading ? <Skeleton className="h-8 w-1/2" /> : <p className="text-3xl font-bold">₹{totalPaid.toLocaleString('en-IN')}</p>}
                    {isLoading ? <Skeleton className="h-4 w-1/3 mt-1" /> : <p className="text-xs text-muted-foreground">Across all processed payouts.</p>}
                </CardContent>
            </Card>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Eligible for Payout</CardTitle>
                <CardDescription>These are completed trips for which you can request a payout.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Trip / Batch</TableHead>
                            <TableHead className="text-center">Participants</TableHead>
                            <TableHead className="text-right">Net Payout</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? <TableSkeleton columns={4} /> : eligible.length > 0 ? eligible.map((batch) => {
                            const isPending = history.some(p => p.batchId === batch.batchId && p.status === 'Pending');
                            return (
                                <TableRow key={batch.batchId}>
                                    <TableCell>
                                        <div className="font-medium">{batch.tripTitle}</div>
                                        <div className="text-xs text-muted-foreground">{batch.batchDates}</div>
                                    </TableCell>
                                    <TableCell className="text-center">{batch.participants}</TableCell>
                                    <TableCell className="text-right">₹{batch.netPayout.toLocaleString('en-IN')}</TableCell>
                                    <TableCell className="text-right">
                                        <RequestPayoutDialog 
                                            batch={batch} 
                                            onConfirm={handleRequestConfirm}
                                            disabled={isPending}
                                            disabledReason="A payout for this batch is already pending."
                                        />
                                    </TableCell>
                                </TableRow>
                            );
                        }) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                                    No new earnings available for payout.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Payout History</CardTitle>
                <CardDescription>A list of all your past and pending payouts.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Request Date</TableHead>
                            <TableHead>Trip</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>UTR / Reference</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? <TableSkeleton columns={6} /> : history.length > 0 ? history.map((payout) => {
                            const trip = trips.find(b => b.id === payout.tripId);
                            return (
                            <TableRow key={payout.id}>
                                <TableCell>{new Date(payout.requestDate).toLocaleDateString()}</TableCell>
                                <TableCell>{trip?.title || 'Aggregated Payout'}</TableCell>
                                <TableCell><Badge variant={'default'} className={getStatusBadge(payout.status)}>{payout.status}</Badge></TableCell>
                                <TableCell className="font-mono text-xs">{payout.utrNumber || 'N/A'}</TableCell>
                                <TableCell className="text-right">₹{payout.netPayout.toLocaleString('en-IN')}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="icon" disabled={payout.status !== 'Paid' || !payout.invoiceUrl} asChild>
                                        <a href={payout.invoiceUrl || '#'} download={`invoice_${payout.id}.pdf`}>
                                            <Download className="h-4 w-4" />
                                            <span className="sr-only">Download Invoice</span>
                                        </a>
                                    </Button>
                                </TableCell>
                            </TableRow>
                            )
                        }) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                                    No payout history found.
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
