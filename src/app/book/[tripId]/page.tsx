/**
 * @fileoverview Booking Confirmation Page
 * @description This page is the final step before payment. It allows users to:
 * - Confirm the number of travelers and provide their details.
 * - Select specific pickup and drop-off points.
 * - Apply discounts via coupon codes or wallet credits.
 * - View a detailed, real-time breakdown of the total fare.
 * 
 * @developer_notes
 * - **GATING LOGIC**: This page is now protected by `useAuthGuard`. It also checks if the logged-in user's profile is complete.
 *   If the profile is incomplete, the user is redirected to `/profile`.
 * - **State Management**: This is a client component that heavily uses `useState` and `useMemo` to manage the complex, interactive state of the booking form.
 * - **Backend-Ready Payload**: The "Proceed to Payment" action constructs a comprehensive JSON object for the backend.
 * - **Security**: All pricing calculations MUST be re-validated on the backend.
 */
"use client";

// React Hooks for state and side-effect management
import { useState, useMemo, useEffect } from "react";

// Mock data is used for this prototype. In a real app, this would come from a database.
import { trips, users } from "@/lib/mock-data";

// Next.js hooks for routing and data fetching
import { notFound, useParams, useRouter, useSearchParams } from "next/navigation";

// UI Components from ShadCN
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2, User, Users as UsersIcon, ShieldCheck, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

// Custom hooks and types
import { useToast } from "@/hooks/use-toast";
import type { PromoCode } from "@/lib/types";
import { useAuthGuard } from "@/hooks/useAuthGuard";

// Skeleton component for loading state to improve perceived performance
function BookingPageSkeleton() {
  return (
    <main className="flex-1 p-4 md:p-8 bg-muted/40">
      <div className="max-w-6xl mx-auto">
        <Skeleton className="h-10 w-1/2 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-4 w-2/3 mt-1" />
                    </CardHeader>
                    <CardContent>
                       <Skeleton className="h-40 w-full" />
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1">
                <Card className="sticky top-24">
                     <CardHeader>
                        <Skeleton className="h-40 w-full mb-4" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2 mt-1" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-48 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </main>
  );
}


export default function BookingPage() {
  const { loading, isAuthorized, user: authUser } = useAuthGuard('USER');
  const params = useParams<{ tripId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const trip = useMemo(() => trips.find(t => t.id === params.tripId), [params.tripId]);
  const batchId = searchParams.get('batch');
  const isPartialPayment = searchParams.get('partial') === 'true'; 
  const batch = useMemo(() => trip?.batches.find(b => b.id === batchId), [trip, batchId]);

  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [travelers, setTravelers] = useState([
    { name: '', email: '', phone: '', emergencyName: '', emergencyPhone: '', gstNumber: '' }
  ]);
  const [selectedPickup, setSelectedPickup] = useState<string>('');
  const [selectedDropoff, setSelectedDropoff] = useState<string>('');
  
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<PromoCode | null>(null);

  const [useWallet, setUseWallet] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isAuthorized && authUser) {
        // Find the full user object from mock data once the authUser is available.
        const fullUser = users.find(u => u.id === authUser.id);
        if (fullUser) {
             setCurrentUser(fullUser);
             // Pre-fill the first traveler with the authenticated user's details.
             setTravelers([{ name: fullUser.name, email: fullUser.email, phone: fullUser.phone, emergencyName: '', emergencyPhone: '', gstNumber: '' }]);
             // Gate for profile completion.
             if (!fullUser.isProfileComplete) {
                toast({
                    title: "Profile Incomplete",
                    description: "Please complete your profile before making a booking.",
                    variant: "destructive",
                });
                router.push('/profile');
            }
        }
    }
  }, [isAuthorized, authUser, router, toast]);

  const fareDetails = useMemo(() => {
    if (!trip || !batch || !currentUser) {
      return { basePrice: 0, subtotal: 0, couponDiscount: 0, walletDiscount: 0, tax: 0, totalPayable: 0, finalPayable: 0 };
    }
    const basePrice = batch.priceOverride ?? trip.price;
    const subtotal = basePrice * travelers.length;
    
    let couponDiscount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.type === 'Fixed') {
        couponDiscount = appliedCoupon.value;
      } else if (appliedCoupon.type === 'Percentage') {
        couponDiscount = subtotal * (appliedCoupon.value / 100);
      }
    }
    
    const walletDiscount = useWallet ? Math.min(currentUser.walletBalance, subtotal - couponDiscount) : 0;
    const totalDiscount = couponDiscount + walletDiscount;
    
    const taxableAmount = subtotal - couponDiscount;
    const tax = trip.taxIncluded ? 0 : taxableAmount * (trip.taxPercentage || 0) / 100;
    
    const totalPayable = subtotal - totalDiscount + tax;

    const finalPayable = isPartialPayment ? trip.spotReservationDetails?.advanceAmount || 0 : Math.max(0, totalPayable);

    return { basePrice, subtotal, couponDiscount, walletDiscount, tax, totalPayable: Math.max(0, totalPayable), finalPayable };
  }, [travelers.length, appliedCoupon, useWallet, trip, batch, currentUser, isPartialPayment]);

  if (loading || !isAuthorized || !currentUser) {
    return <BookingPageSkeleton />;
  }
  
  if (!trip || !batch) {
    notFound();
  }

  const handleTravelerCountChange = (newCount: number) => {
    if (newCount > 0 && newCount <= batch.availableSlots) {
        const currentCount = travelers.length;
        if (newCount > currentCount) {
            const newTravelers = Array.from({ length: newCount - currentCount }, () => ({ name: '', email: '', phone: '', emergencyName: '', emergencyPhone: '', gstNumber: '' }));
            setTravelers([...travelers, ...newTravelers]);
        } else if (newCount < currentCount) {
            setTravelers(travelers.slice(0, newCount));
        }
    }
  };
  
  const handleTravelerInfoChange = (index: number, field: string, value: string) => {
    const updatedTravelers = [...travelers];
    updatedTravelers[index] = { ...updatedTravelers[index], [field]: value };
    setTravelers(updatedTravelers);
  };
  
  const handleApplyCoupon = async () => {
    setCouponLoading(true);
    try {
        const res = await fetch('/api/coupons/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: couponCode }),
        });
        const data = await res.json();
        if (res.ok) {
            setAppliedCoupon(data);
            toast({ title: "Coupon Applied!", description: data.message });
        } else {
            throw new Error(data.message);
        }
    } catch (error: any) {
        setAppliedCoupon(null);
        toast({ variant: 'destructive', title: "Invalid Coupon", description: error.message || "The entered coupon code is not valid." });
    } finally {
        setCouponLoading(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (!selectedPickup || !selectedDropoff) {
      toast({ variant: 'destructive', title: 'Missing Information', description: 'Please select a pickup and drop-off point.' });
      return;
    }

    setIsProcessing(true);

    const finalPayload = {
      tripId: trip.id,
      batchId: batch.id,
      bookingSource: 'Organic',
      pickup: trip.pickupPoints.find(p => p.label === selectedPickup),
      dropoff: trip.dropoffPoints.find(p => p.label === selectedDropoff),
      travelers: travelers,
      walletUsedAmount: fareDetails.walletDiscount,
      couponUsed: appliedCoupon?.code || null,
      couponDiscount: fareDetails.couponDiscount,
      subtotal: fareDetails.subtotal,
      tax: fareDetails.tax,
      totalAmount: fareDetails.totalPayable,
      bookingStatus: 'Pending',
      paymentStatus: 'Pending',
      isPartialBooking: isPartialPayment,
      advancePaid: isPartialPayment ? fareDetails.finalPayable : undefined,
      remainingAmount: isPartialPayment ? fareDetails.totalPayable - fareDetails.finalPayable : undefined,
    };
    
    console.log("BACKEND BOOKING PAYLOAD:", JSON.stringify(finalPayload, null, 2));
    
    toast({
      title: "Redirecting to Payment...",
      description: "Preparing your booking summary to proceed with payment.",
    });

    await new Promise(resolve => setTimeout(resolve, 300));
    router.push('/booking/success');
    setIsProcessing(false);
  };

  return (
    <main className="flex-1 p-4 md:p-8 bg-muted/40">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-headline font-bold mb-6">Confirm Your Booking</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><UsersIcon /> Traveler Information</CardTitle>
                        <CardDescription>Enter details for each person traveling. The first traveler is pre-filled from your profile.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6">
                            <Label htmlFor="traveler-count" className="font-semibold">Number of Travelers</Label>
                            <div className="flex items-center gap-2 mt-2">
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleTravelerCountChange(travelers.length - 1)} disabled={travelers.length <= 1}><Minus className="h-4 w-4" /></Button>
                                <Input id="traveler-count" className="w-16 h-8 text-center" value={travelers.length} readOnly />
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleTravelerCountChange(travelers.length + 1)} disabled={travelers.length >= batch.availableSlots}><Plus className="h-4 w-4" /></Button>
                                <span className="text-sm text-muted-foreground">({batch.availableSlots} slots left)</span>
                            </div>
                        </div>
                        <div className="space-y-6">
                           {travelers.map((traveler, index) => (
                             <div key={index} className="space-y-4 p-4 border rounded-lg bg-background/50">
                                <h3 className="font-semibold flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Traveler {index + 1}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label htmlFor={`name-${index}`}>Full Name</Label><Input id={`name-${index}`} value={traveler.name} onChange={(e) => handleTravelerInfoChange(index, 'name', e.target.value)} /></div>
                                    <div className="space-y-2"><Label htmlFor={`email-${index}`}>Email</Label><Input id={`email-${index}`} type="email" value={traveler.email} onChange={(e) => handleTravelerInfoChange(index, 'email', e.target.value)} /></div>
                                    <div className="space-y-2"><Label htmlFor={`phone-${index}`}>Phone</Label><Input id={`phone-${index}`} type="tel" value={traveler.phone} onChange={(e) => handleTravelerInfoChange(index, 'phone', e.target.value)} /></div>
                                    <div className="space-y-2"><Label htmlFor={`emergencyName-${index}`}>Emergency Contact Name</Label><Input id={`emergencyName-${index}`} value={traveler.emergencyName} onChange={(e) => handleTravelerInfoChange(index, 'emergencyName', e.target.value)} placeholder="Required" /></div>
                                    <div className="space-y-2"><Label htmlFor={`gstNumber-${index}`}>GST Number (Optional)</Label><Input id={`gstNumber-${index}`} value={traveler.gstNumber} onChange={(e) => handleTravelerInfoChange(index, 'gstNumber', e.target.value)} /></div>
                                    <div className="space-y-2"><Label htmlFor={`emergencyPhone-${index}`}>Emergency Contact Phone</Label><Input id={`emergencyPhone-${index}`} type="tel" value={traveler.emergencyPhone} onChange={(e) => handleTravelerInfoChange(index, 'emergencyPhone', e.target.value)} placeholder="Required"/></div>
                                </div>
                             </div>
                           ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Trip Logistics</CardTitle>
                        <CardDescription>Select your preferred pickup and drop-off points for {trip.pickupCity}.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <Label htmlFor="pickup-point">Pickup Point</Label>
                           <Select value={selectedPickup} onValueChange={setSelectedPickup}>
                                <SelectTrigger id="pickup-point"><SelectValue placeholder="Select a pickup point" /></SelectTrigger>
                                <SelectContent>
                                    {trip.pickupPoints.map(p => <SelectItem key={p.label} value={p.label}>{p.label} - {p.time}</SelectItem>)}
                                </SelectContent>
                           </Select>
                        </div>
                         <div className="space-y-2">
                           <Label htmlFor="dropoff-point">Drop-off Point</Label>
                           <Select value={selectedDropoff} onValueChange={setSelectedDropoff}>
                                <SelectTrigger id="dropoff-point"><SelectValue placeholder="Select a drop-off point" /></SelectTrigger>
                                <SelectContent>
                                    {trip.dropoffPoints.map(p => <SelectItem key={p.label} value={p.label}>{p.label} - {p.time}</SelectItem>)}
                                </SelectContent>
                           </Select>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1">
                <Card className="sticky top-24">
                    <CardHeader>
                        <div className="relative h-40 mb-4">
                            <Image src={trip.image} alt={trip.title} layout="fill" objectFit="cover" className="rounded-lg" data-ai-hint={trip.imageHint} />
                        </div>
                        <CardTitle className="text-lg">{trip.title}</CardTitle>
                        <CardDescription>{new Date(batch.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {new Date(batch.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Base Price</span>
                                <span>₹{fareDetails.basePrice.toLocaleString('en-IN')} x {travelers.length}</span>
                            </div>
                             <div className="flex justify-between font-medium">
                                <span>Subtotal</span>
                                <span>₹{fareDetails.subtotal.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                           <Label htmlFor="coupon-code">Have a coupon?</Label>
                           <div className="flex gap-2">
                             <Input id="coupon-code" placeholder="Enter Coupon Code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} disabled={isPartialPayment || couponLoading} />
                             <Button variant="outline" onClick={handleApplyCoupon} disabled={isPartialPayment || couponLoading}>
                                {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                             </Button>
                           </div>
                        </div>
                         {currentUser.walletBalance > 0 && (
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                    <Label htmlFor="wallet-toggle">Use Wallet Balance</Label>
                                    <p className="text-xs text-muted-foreground">Available: ₹{currentUser.walletBalance.toLocaleString('en-IN')}</p>
                                </div>
                                <Switch id="wallet-toggle" checked={useWallet} onCheckedChange={setUseWallet} disabled={isPartialPayment} />
                            </div>
                         )}
                         <Separator />
                         <div className="space-y-2 text-sm">
                            {fareDetails.couponDiscount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span className="font-medium">Coupon Discount ({appliedCoupon?.code})</span>
                                    <span>- ₹{fareDetails.couponDiscount.toLocaleString('en-IN')}</span>
                                </div>
                            )}
                            {fareDetails.walletDiscount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span className="font-medium">Wallet Credit Used</span>
                                    <span>- ₹{fareDetails.walletDiscount.toLocaleString('en-IN')}</span>
                                </div>
                            )}
                            {fareDetails.tax > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Taxes & Fees ({trip.taxPercentage}%)</span>
                                    <span>+ ₹{fareDetails.tax.toLocaleString('en-IN')}</span>
                                </div>
                            )}
                         </div>
                         <Separator />
                         <div className="flex justify-between font-bold text-lg">
                            <span>Total Payable</span>
                            <span>₹{fareDetails.finalPayable.toLocaleString('en-IN')}</span>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-4">
                        <Alert className="text-center">
                            <ShieldCheck className="h-4 w-4" />
                            <AlertDescription>
                                Your payment is protected by Travenox. After payment, your booking is instantly confirmed.
                            </AlertDescription>
                        </Alert>
                        <Button className="w-full" size="lg" onClick={handleProceedToPayment} disabled={isProcessing}>
                            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Proceed to Payment
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
      </div>
    </main>
  );
}
