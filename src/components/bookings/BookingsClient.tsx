

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
  CardFooter
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, MessageSquarePlus, Star, XCircle, Users, Calendar, Phone, Loader2, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Booking, Trip, Organizer } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// DEV_COMMENT: A dedicated component for the review dialog to manage its own state.
function ReviewDialog({ booking, tripTitle }: { booking: Booking, tripTitle?: string }) {
  const { toast } = useToast();
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleReviewSubmit = async () => {
    setIsSubmitting(true);
    // DEV_COMMENT: In a real app, this would call `POST /api/reviews` with the payload.
    // The backend would validate the user owns the booking and the trip is completed.
    const payload = {
      bookingId: booking.id,
      tripId: booking.tripId,
      rating,
      comment,
    };
    console.log("Review Submission Payload:", payload);
    
    // FRONTEND: Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    toast({
      title: "Review Submitted!",
      description: "Thank you for your feedback.",
    });
    setIsSubmitting(false);
    setOpen(false); // Close the dialog on submission
  };
  
  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={booking.reviewLeft} className="w-full">
                <MessageSquarePlus className="mr-2 h-4 w-4"/>
                {booking.reviewLeft ? 'View Review' : 'Leave Review'}
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
            <DialogTitle>Leave a Review for {tripTitle}</DialogTitle>
            <DialogDescription>
                Share your experience to help other travelers.
            </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label>Your Rating</Label>
                    <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                            <Star 
                                key={i} 
                                className={`h-6 w-6 cursor-pointer ${i < rating ? 'text-amber-400 fill-current' : 'text-muted-foreground'}`} 
                                onClick={() => setRating(i + 1)}
                            />
                        ))}
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="comment">Your Comment</Label>
                    <Textarea id="comment" placeholder="Tell us about your trip..." value={comment} onChange={(e) => setComment(e.target.value)} />
                </div>
            </div>
            <DialogFooter>
            <Button type="submit" onClick={handleReviewSubmit} disabled={rating === 0 || !comment || isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Review
            </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}

// DEV_COMMENT: A dedicated component for the dispute dialog.
function DisputeDialog({ booking, tripTitle }: { booking: Booking, tripTitle?: string }) {
  const { toast } = useToast();
  const [issue, setIssue] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleDisputeSubmit = async () => {
    setIsSubmitting(true);
    // DEV_COMMENT: This would call a backend endpoint like `POST /api/disputes`.
    // The backend would create a dispute record for admin review.
    const payload = {
        bookingId: booking.id,
        tripId: booking.tripId,
        reason: issue,
    };
    console.log("Dispute Submission Payload:", payload);
    
    // FRONTEND: Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));

     toast({
      title: "Issue Reported",
      description: "Our team will review your report and get back to you shortly.",
    });
    setIsSubmitting(false);
    setOpen(false); // Close dialog
  }

  return (
     <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-center">
                <AlertTriangle className="mr-2 h-4 w-4"/>
                Report Issue
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
            <DialogTitle>Report an Issue</DialogTitle>
            <DialogDescription>
                Please describe the issue you faced with the booking for {tripTitle}.
            </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="issue">Describe the Issue</Label>
                    <Textarea id="issue" placeholder="Please provide as much detail as possible..." value={issue} onChange={(e) => setIssue(e.target.value)} />
                </div>
            </div>
            <DialogFooter>
            <Button type="submit" onClick={handleDisputeSubmit} disabled={!issue || isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Report
            </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}


// DEV_COMMENT: START - User-Side Cancellation Dialog Component
// This component encapsulates the logic for cancelling a booking and requesting a refund.
function CancelBookingDialog({ booking, trip, onCancel, children }: { booking: Booking, trip: Trip | undefined, onCancel: (bookingId: string, reason: string) => void, children: React.ReactNode }) {
    const { toast } = useToast();
    const [open, setOpen] = React.useState(false);
    const [reason, setReason] = React.useState('');
    const [isCancelling, setIsCancelling] = React.useState(false);

    if (!trip) return null;

    const batch = trip.batches.find(b => b.id === booking.batchId);
    if (!batch) return null; // Should not happen

    // --- Business Logic: Cancellation Window & Refund Calculation ---
    // DEV_COMMENT: The backend must re-validate this logic to prevent manipulation.
    const tripStartDate = new Date(batch.startDate);
    const cancellationCutoff = new Date(tripStartDate.getTime() - (24 * 60 * 60 * 1000)); // 24-hour buffer
    const canCancel = new Date() < cancellationCutoff;

    const daysBeforeDeparture = (tripStartDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24);
    const sortedRules = [...trip.cancellationRules].sort((a, b) => b.days - a.days);
    const applicableRule = sortedRules.find(rule => daysBeforeDeparture >= rule.days);
    const refundPercentage = applicableRule ? applicableRule.refundPercentage : 0;
    const refundAmount = (booking.amount * refundPercentage) / 100;
    // --- End Business Logic ---

    const handleConfirmCancellation = async () => {
        setIsCancelling(true);
        // FRONTEND: Simulate API call for cancellation
        await new Promise(resolve => setTimeout(resolve, 300));
        
        onCancel(booking.id, reason);
        toast({
            title: "Booking Cancelled",
            description: "Your refund request has been submitted for processing.",
        });
        
        setIsCancelling(false);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild disabled={!canCancel}>
                         <div onClick={() => canCancel && setOpen(true)} className="w-full">
                            {children}
                        </div>
                    </TooltipTrigger>
                    {!canCancel && (
                        <TooltipContent>
                            <p>Cancellation is not allowed within 24 hours of the trip start date.</p>
                        </TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cancel Booking: {trip.title}</DialogTitle>
                    <DialogDescription>Please review the details below before confirming cancellation.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                     <div className="p-4 rounded-lg bg-muted/50 border">
                        <h4 className="font-semibold mb-2">Cancellation Policy & Refund Estimate</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                           {trip.cancellationPolicy}
                        </p>
                        {applicableRule ? (
                             <p className="text-sm font-medium">
                                According to the policy, cancelling ~{Math.floor(daysBeforeDeparture)} days before departure qualifies for a <span className="text-primary">{applicableRule.refundPercentage}%</span> refund.
                            </p>
                        ) : (
                             <p className="text-sm font-medium text-destructive">
                                Your booking is not eligible for a refund at this time.
                            </p>
                        )}
                        <div className="mt-2 pt-2 border-t font-bold flex justify-between">
                            <span>Estimated Refund:</span>
                            <span>₹{refundAmount.toLocaleString('en-IN')}</span>
                        </div>
                         <p className="text-xs text-muted-foreground mt-3">
                            Refunds are processed securely through the Travonex platform. We cannot assist with refunds for bookings made directly with the organizer.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cancellation-reason">Reason for Cancellation (Optional)</Label>
                        <Textarea id="cancellation-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Please let us know why you're cancelling..." />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Go Back</Button>
                    <Button variant="destructive" onClick={handleConfirmCancellation} disabled={isCancelling}>
                        {isCancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm Cancellation
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
// DEV_COMMENT: END - User-Side Cancellation Dialog Component

// DEV_COMMENT: START - Booking Details Dialog Component
// This component provides a summary of the booking details.
function BookingDetailsDialog({ booking, trip, organizer, isOpen, onOpenChange }: { booking: Booking | null; trip: Trip | null; organizer: Organizer | null; isOpen: boolean; onOpenChange: (open: boolean) => void }) {
    if (!booking || !trip || !organizer) return null;

    const batch = trip.batches.find(b => b.id === booking.batchId);
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Booking Details: {booking.id}</DialogTitle>
                    <DialogDescription>{trip.title}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span>Status:</span> <Badge>{booking.status}</Badge></div>
                        <div className="flex justify-between"><span>Booking Date:</span> <span>{booking.bookingDate}</span></div>
                         <div className="flex justify-between"><span>Trip Dates:</span> <span>{batch ? `${new Date(batch.startDate).toLocaleDateString()} - ${new Date(batch.endDate).toLocaleDateString()}` : 'N/A'}</span></div>
                        <div className="flex justify-between"><span>Total Amount Paid:</span> <span className="font-bold">₹{booking.amount.toLocaleString('en-IN')}</span></div>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2">Organizer Information</h4>
                        <div className="space-y-1 text-sm rounded-lg border p-3">
                            <p><strong>Name:</strong> {organizer.name}</p>
                            <p className="flex items-center gap-2"><strong>Contact:</strong> <Phone className="h-3 w-3"/> {organizer.phone}</p>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><Users className="h-4 w-4"/> Travelers ({booking.travelers.length})</h4>
                        <div className="space-y-2 rounded-lg border p-3 text-sm">
                        {booking.travelers.map((traveler, index) => (
                            <div key={index} className="flex justify-between">
                                <span>{traveler.name}</span>
                                <span className="text-muted-foreground">{traveler.phone}</span>
                            </div>
                        ))}
                        </div>
                    </div>
                     {booking.status === 'Cancelled' && (
                        <div>
                            <h4 className="font-semibold mb-2">Refund Status</h4>
                            <p className="text-sm p-3 rounded-lg bg-muted/50">Status: <Badge variant={booking.refundStatus === 'Pending' ? 'secondary' : booking.refundStatus === 'Processed' ? 'default' : 'outline'}>{booking.refundStatus}</Badge></p>
                        </div>
                     )}
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface BookingsClientProps {
  initialBookings: Booking[];
  allTrips: Trip[];
  allOrganizers: Organizer[];
}

export function BookingsClient({ initialBookings, allTrips, allOrganizers }: BookingsClientProps) {
  const [userBookings, setUserBookings] = React.useState<Booking[]>(initialBookings);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [selectedBooking, setSelectedBooking] = React.useState<{booking: Booking, trip: Trip, organizer: Organizer} | null>(null);

  const handleBookingCancellation = (bookingId: string, reason: string) => {
    // BACKEND: Call `POST /api/bookings/{bookingId}/cancel`
    setUserBookings(currentBookings =>
        currentBookings.map(b =>
            b.id === bookingId
            ? { ...b, status: 'Cancelled', refundStatus: 'Pending', cancellationReason: reason }
            : b
        )
    );
  };
  
  const handleViewDetails = (booking: Booking) => {
    const trip = allTrips.find(t => t.id === booking.tripId);
    const organizer = trip ? allOrganizers.find(o => o.id === trip.organizerId) : null;
    if(trip && organizer) {
        setSelectedBooking({booking, trip, organizer});
        setIsDetailsOpen(true);
    }
  }

  const upcomingBookings = userBookings.filter(b => b.status === 'Confirmed' || b.status === 'Pending Confirmation');
  const completedBookings = userBookings.filter(b => b.status === 'Completed');
  const cancelledBookings = userBookings.filter(b => b.status === 'Cancelled');

  const renderBookingCard = (booking: Booking, type: 'upcoming' | 'completed' | 'cancelled') => {
    const trip = allTrips.find(t => t.id === booking.tripId);
    const batch = trip?.batches.find(b => b.id === booking.batchId);
    const tripDate = batch ? `${new Date(batch.startDate).toLocaleDateString()} - ${new Date(batch.endDate).toLocaleDateString()}` : 'N/A';
    const canCancel = new Date() < new Date(batch ? batch.startDate : 0);

    return (
        <Card key={booking.id} className="w-full">
            <CardHeader>
                <CardTitle className="text-base">{trip?.title}</CardTitle>
                <CardDescription className="text-xs">{tripDate}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={booking.status === 'Confirmed' ? 'secondary' : 'default'} className={booking.status === 'Completed' ? 'bg-green-600' : ''}>
                        {booking.status}
                    </Badge>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span className="font-bold">₹{booking.amount.toLocaleString('en-IN')}</span>
                </div>
                 {booking.isPartialBooking && booking.status !== 'Completed' && (
                    <div className="flex justify-between items-center text-primary font-semibold">
                        <span>Remaining Balance</span>
                        <span>₹{booking.remainingAmount?.toLocaleString('en-IN')}</span>
                    </div>
                 )}
                 {type === 'cancelled' && (
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Refund Status</span>
                         <Badge variant={booking.refundStatus === 'Pending' ? 'secondary' : booking.refundStatus === 'Processed' ? 'default' : 'outline'}>
                            {booking.refundStatus}
                        </Badge>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                 <Button variant="outline" size="sm" onClick={() => handleViewDetails(booking)} className="w-full">View Details</Button>
                  {booking.isPartialBooking && type === 'upcoming' && booking.status !== 'Completed' && (
                     <Button size="sm" className="w-full">Pay Remaining <ArrowRight className="ml-2 h-4 w-4"/></Button>
                  )}
                  {type === 'upcoming' && !booking.isPartialBooking && (
                      <CancelBookingDialog booking={booking} trip={trip} onCancel={handleBookingCancellation}>
                         <Button variant="destructive" size="sm" disabled={!canCancel} className="w-full">
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Booking
                        </Button>
                      </CancelBookingDialog>
                  )}
                  {(type === 'upcoming' || type === 'completed') && (
                    <DisputeDialog booking={booking} tripTitle={trip?.title} />
                  )}
                  {type === 'completed' && (
                      <ReviewDialog booking={booking} tripTitle={trip?.title} />
                  )}
            </CardFooter>
        </Card>
    );
  }

  const renderTable = (bookingList: Booking[], type: 'upcoming' | 'completed' | 'cancelled') => {
    if (bookingList.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8 space-y-4">
            <p>No {type} trips found.</p>
            <p className="text-xs max-w-md mx-auto p-3 bg-muted/50 rounded-lg border">
                All your trips booked via Travonex are protected by our secure payment and support systems. For your safety, please avoid direct bookings with the organizer.
            </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Mobile View: Cards */}
        <div className="grid grid-cols-1 md:hidden gap-4">
          {bookingList.map(booking => renderBookingCard(booking, type))}
        </div>
        
        {/* Desktop View: Table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trip</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount Paid</TableHead>
                {type === 'cancelled' && <TableHead>Refund Status</TableHead>}
                 {type === 'upcoming' && <TableHead>Payment Status</TableHead>}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookingList.map((booking) => {
                const trip = allTrips.find(t => t.id === booking.tripId);
                const batch = trip?.batches.find(b => b.id === booking.batchId);
                const tripDate = batch ? `${new Date(batch.startDate).toLocaleDateString()} - ${new Date(batch.endDate).toLocaleDateString()}` : 'N/A';
                const canCancel = new Date() < new Date(batch ? batch.startDate : 0);

                return (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{trip?.title}</TableCell>
                      <TableCell>{tripDate}</TableCell>
                      <TableCell>₹{booking.amount.toLocaleString('en-IN')}</TableCell>
                       {type === 'cancelled' && (
                        <TableCell>
                            <Badge variant={booking.refundStatus === 'Pending' ? 'secondary' : booking.refundStatus === 'Processed' ? 'default' : 'outline'}>
                                {booking.refundStatus}
                            </Badge>
                        </TableCell>
                      )}
                       {type === 'upcoming' && (
                        <TableCell>
                            <Badge variant={booking.isPartialBooking ? 'outline' : 'default'}>
                                {booking.isPartialBooking ? `Partial (${booking.status})` : 'Full'}
                            </Badge>
                        </TableCell>
                      )}
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(booking)}>View Details</Button>
                        {type === 'upcoming' && booking.isPartialBooking && booking.status !== 'Completed' && (
                            <Button size="sm">Pay Remaining</Button>
                        )}
                        {type === 'upcoming' && !booking.isPartialBooking && (
                             <CancelBookingDialog booking={booking} trip={trip} onCancel={handleBookingCancellation}>
                                <Button variant="destructive" size="sm" disabled={!canCancel}>Cancel</Button>
                             </CancelBookingDialog>
                        )}
                        {(type === 'upcoming' || type === 'completed') && (
                          <DisputeDialog booking={booking} tripTitle={trip?.title} />
                        )}
                        {type === 'completed' && (
                            <ReviewDialog booking={booking} tripTitle={trip?.title} />
                        )}
                      </TableCell>
                    </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <>
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Trips</CardTitle>
              <CardDescription>
                Your next adventures are just around the corner.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderTable(upcomingBookings, 'upcoming')}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="completed">
           <Card>
            <CardHeader>
              <CardTitle>Completed Trips</CardTitle>
              <CardDescription>
                A look back at your memorable journeys.
              </CardDescription>
            </CardHeader>
            <CardContent>
               {renderTable(completedBookings, 'completed')}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="cancelled">
           <Card>
            <CardHeader>
              <CardTitle>Cancelled Trips</CardTitle>
              <CardDescription>
                Bookings that have been cancelled.
              </CardDescription>
            </CardHeader>
            <CardContent>
               {renderTable(cancelledBookings, 'cancelled')}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <BookingDetailsDialog 
          booking={selectedBooking?.booking || null} 
          trip={selectedBooking?.trip || null}
          organizer={selectedBooking?.organizer || null}
          isOpen={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
      />
    </>
  );
}
