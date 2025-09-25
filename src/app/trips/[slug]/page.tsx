

/**
 * @fileoverview Public Trip Details Page (Complete UI/UX Overhaul V2)
 * 
 * @description
 * This page displays all public details of a single trip, redesigned for a modern, clean, and action-oriented user experience.
 * It uses a two-column layout on desktop with a sticky action sidebar and a single-column, scrollable layout with a sticky bottom CTA bar on mobile.
 * 
 * @developer_notes
 * - **VISIBILITY LOGIC**: This page should only be accessible for trips with a status of 'Published'. The `getTripData` function enforces this.
 * - **DATA MASKING**: The API (`GET /api/trips/slug/{slug}`) must only return public-safe information. The `getTripData` function simulates this.
 * - **PERFORMANCE**: This is an async Server Component. Data is fetched on the server for fast initial load times and better SEO.
 * - **SEO**: `generateMetadata` function dynamically creates page-specific metadata (title, description, keywords, structured data) for search engine optimization.
 * - **RESPONSIVE CTAs**: A sticky bottom bar (`MobileCtaBar`) appears on mobile, while a sticky sidebar card (`<aside>`) appears on desktop to ensure booking actions are always visible.
 * - **OPERATIONAL INFO**: Key logistics (pickup, time, travel mode) are presented in their own dedicated card for clarity.
 */
import * as React from "react";
import Link from "next/link";

// Mock data and Next.js utilities
import { trips, users, organizers } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import type { Metadata } from 'next';

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Calendar, CheckCircle, Share2, Check, X, Users as UsersIcon, HandHelping, Ticket, MessageSquareQuestion, FileText, Bus, Clock, UserCheck, ShoppingCart, AlertTriangle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Custom Components
import { LeadFormDialog } from "@/components/common/LeadFormDialog";
import { TripImageGallery } from "@/components/trips/TripImageGallery";
import { MobileCtaBar } from "@/components/trips/MobileCtaBar";
import { SpotReservationDialog } from "@/components/trips/SpotReservationDialog";


// SERVER-SIDE DATA FETCHING
// In a real application, this function would fetch data from a database or a headless CMS.
// It's marked `async` to be used in a Server Component.
async function getTripData(slug: string) {
    // Fetches the trip from mock data, ensuring it's 'Published' to prevent access to drafts or unlisted trips.
    const trip = trips.find(t => t.slug === slug && t.status === 'Published');
    if (!trip) {
        return { trip: null, organizer: null };
    }
    // Fetches the associated organizer's public information.
    const organizer = organizers.find(o => o.id === trip.organizerId) || null;
    return { trip, organizer };
}

// DEV_COMMENT: Added dynamic metadata generation for SEO.
// This Next.js function runs at build time (for static pages) or request time (for dynamic pages)
// to create page-specific metadata, which is crucial for SEO.
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { trip } = await getTripData(params.slug);

  // If no trip is found, return a generic "Not Found" title.
  if (!trip) {
    return {
      title: 'Trip Not Found | Travonex',
      description: 'The trip you are looking for could not be found.',
    };
  }

  const siteUrl = 'https://travonex.com';
  const pageUrl = `${siteUrl}/trips/${trip.slug}`;
  const seoDescription = `Book the "${trip.title}" trip. ${trip.description.substring(0, 120)}... Explore trekking, camping, and adventure travel with Travonex.`;

  // Structured Data (JSON-LD) for Rich Results in Google Search.
  // This helps search engines understand the content of the page better.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: trip.title,
    description: trip.description,
    image: trip.image,
    provider: {
      '@type': 'Organization',
      name: 'Travonex',
      url: siteUrl,
    },
    offers: {
      '@type': 'Offer',
      price: trip.price.toString(),
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock', // Indicates the trip is bookable
      url: pageUrl,
    },
  };

  return {
    title: `Travonex | ${trip.title}`,
    description: seoDescription,
    keywords: `Travonex, ${trip.title}, ${trip.location}, ${trip.tripType}, ${trip.interests?.join(', ')}, weekend trips, trekking, adventure travel`,
    // Open Graph meta tags for social media sharing (Facebook, LinkedIn, etc.)
    openGraph: {
      title: `Travonex | ${trip.title}`,
      description: seoDescription,
      url: pageUrl,
      type: 'article',
      images: [
        {
          url: trip.image,
          width: 1200,
          height: 630,
          alt: trip.title,
        },
      ],
    },
    // Twitter-specific meta tags
    twitter: {
      card: 'summary_large_image',
      title: `Travonex | ${trip.title}`,
      description: seoDescription,
      images: [trip.image],
    },
    // Canonical URL to prevent duplicate content issues
    alternates: {
      canonical: pageUrl,
    },
    // Embedding the JSON-LD structured data into the page
    other: {
      'application/ld+json': JSON.stringify(jsonLd),
    },
  };
}


// This is an async Server Component.
export default async function TripDetailsPage({ params }: { params: { slug: string } }) {
  // Fetch data on the server before rendering.
  const { trip, organizer } = await getTripData(params.slug);

  // If no trip is found, render the 404 page.
  if (!trip || !organizer) {
    notFound();
  }

  // Calculate average rating and review count.
  const tripAverageRating = (trip.reviews?.length || 0) > 0 ? (trip.reviews.reduce((acc, r) => acc + r.rating, 0) / trip.reviews.length) : 0;
  const tripReviewCount = trip.reviews?.length || 0;
  
  // Filter for only active batches to display to the user.
  const activeBatches = trip.batches.filter(b => b.status === 'Active');
  const nextBatch = activeBatches.length > 0 ? activeBatches[0] : null;
  const primaryPickup = trip.pickupPoints.length > 0 ? trip.pickupPoints[0] : null;

  return (
    <main className="flex-1 bg-muted/20 pb-20 md:pb-8">

      {/* Renders the full-width image gallery/carousel at the top of the page. */}
      <TripImageGallery images={trip.gallery} coverImage={trip.image} title={trip.title} />

      <div className="container max-w-7xl mx-auto p-4 lg:p-8">
        
        {/* Main content grid for desktop layout. */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column (Main Details) */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* --- HEADER --- */}
                <div className="space-y-2">
                    <h1 className="text-2xl lg:text-4xl font-bold tracking-tight">{trip.title}</h1>
                    <div className="flex items-center gap-x-4 gap-y-1 text-sm text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1"><MapPin className="h-4 w-4" /><span>{trip.location}</span></div>
                        <div className="flex items-center gap-1"><Star className="h-4 w-4 text-amber-400 fill-current" /><span>{tripAverageRating > 0 ? `${tripAverageRating.toFixed(1)} (${tripReviewCount} reviews)` : 'No reviews yet'}</span></div>
                        <Button variant="ghost" size="sm" className="flex items-center gap-1 -ml-2"><Share2 className="h-4 w-4" /><span>Share</span></Button>
                    </div>
                </div>

                {/* Organizer Info Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Avatar className="h-12 w-12"><AvatarImage src={organizer.logo || `https://placehold.co/64x64.png?text=${organizer?.name.charAt(0)}`} data-ai-hint="company logo"/><AvatarFallback>{organizer?.name.charAt(0)}</AvatarFallback></Avatar>
                        <div>
                            <p className="text-sm text-muted-foreground">Organized By</p>
                            <p className="font-bold">{organizer?.name}</p>
                            {/* The "Verified Organizer" badge is a key trust signal for users. */}
                            {organizer?.kycStatus === 'Verified' && <div className="flex items-center text-green-600 font-medium text-xs mt-1"><CheckCircle className="h-4 w-4 mr-1" />Verified Organizer</div>}
                        </div>
                    </CardHeader>
                </Card>

                 {/* About this trip Card */}
                <Card>
                    <CardHeader><CardTitle className="text-xl">About this trip</CardTitle></CardHeader>
                    <CardContent><p className="text-sm text-muted-foreground leading-relaxed">{trip.description}</p></CardContent>
                </Card>

                {/* Inclusions & Exclusions Card */}
                <Card>
                    <CardHeader><CardTitle className="text-xl">What's Included</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2"><h3 className="font-semibold text-green-600 flex items-center gap-2"><Check /> Inclusions</h3><ul className="space-y-2 text-muted-foreground text-sm">{trip.inclusions.map((item, index) => (<li key={index} className="flex items-start gap-2"><Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" /><span>{item}</span></li>))}</ul></div>
                        <div className="space-y-2"><h3 className="font-semibold text-red-600 flex items-center gap-2"><X /> Exclusions</h3><ul className="space-y-2 text-muted-foreground text-sm">{trip.exclusions.map((item, index) => (<li key={index} className="flex items-start gap-2"><X className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" /><span>{item}</span></li>))}</ul></div>
                    </CardContent>
                </Card>

                {/* Itinerary Card */}
                <Card>
                    <CardHeader><CardTitle className="text-xl">Itinerary</CardTitle></CardHeader>
                    <CardContent>
                        {trip.itinerary.map(item => (
                            <div key={item.day} className="relative flex gap-4 pb-6 last:pb-0">
                                {/* Vertical timeline bar */}
                                <div className="absolute left-4 top-4 -bottom-2 w-px bg-border"></div>
                                <div className="z-10 flex flex-col items-center"><div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">{item.day}</div></div>
                                <div className="flex-grow"><h3 className="font-bold text-base mt-1">{item.title}</h3><p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p></div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                
                 {/* Logistics Card */}
                 <Card>
                    <CardHeader><CardTitle className="text-xl flex items-center gap-2"><Bus/> Trip Logistics</CardTitle></CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-muted-foreground" /><span><strong>Pickup from:</strong> {primaryPickup?.label || 'N/A'}</span></div>
                        <div className="flex items-center gap-3"><Clock className="h-4 w-4 text-muted-foreground" /><span><strong>Reporting Time:</strong> {primaryPickup?.time || 'N/A'}</span></div>
                        <div className="flex items-center gap-3"><Bus className="h-4 w-4 text-muted-foreground" /><span><strong>Travel by:</strong> AC Tempo Traveller</span></div>
                    </CardContent>
                 </Card>

                {/* Policies & FAQs Section */}
                <div className="space-y-6">
                     {trip.cancellationPolicy && (<Card><CardHeader><CardTitle className="text-xl flex items-center gap-2"><FileText /> Cancellation Policy</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground leading-relaxed">{trip.cancellationPolicy}</p></CardContent></Card>)}
                    {trip.faqs && trip.faqs.length > 0 && (<Card><CardHeader><CardTitle className="text-xl flex items-center gap-2"><MessageSquareQuestion /> FAQs</CardTitle></CardHeader><CardContent><Accordion type="single" collapsible className="w-full">{trip.faqs.map((faq, index) => (<AccordionItem key={index} value={`item-${index}`}><AccordionTrigger className="text-sm text-left">{faq.question}</AccordionTrigger><AccordionContent className="text-sm leading-relaxed">{faq.answer}</AccordionContent></AccordionItem>))}</Accordion></CardContent></Card>)}
                </div>

                {/* Reviews Section */}
                <Card>
                    <CardHeader><CardTitle className="text-xl flex items-center gap-2"><Star /> Reviews</CardTitle></CardHeader>
                    <CardContent>
                        {tripReviewCount === 0 ? (<p className="text-muted-foreground text-sm text-center py-4">No reviews yet. Be the first to leave one!</p>) : (
                          <div className="space-y-4">
                            {trip.reviews?.map(review => {
                                const user = users.find(u => u.id === review.userId);
                                return (
                                    <div key={review.id} className="flex gap-4 border-t pt-4 first:border-t-0 first:pt-0">
                                        <Avatar><AvatarImage src={user?.avatar} data-ai-hint="person avatar" /><AvatarFallback>{user?.name.charAt(0)}</AvatarFallback></Avatar>
                                        <div>
                                            <div className="flex items-center gap-2"><h4 className="font-semibold">{user?.name}</h4><div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-amber-400 fill-current' : 'text-muted-foreground'}`} />)}</div></div>
                                            <p className="text-muted-foreground text-sm leading-relaxed">{review.comment}</p>
                                        </div>
                                    </div>
                                )
                            })}
                          </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Right Column (Sticky Action Sidebar for Desktop) */}
            <aside className="hidden lg:block lg:col-span-1 space-y-6 lg:sticky top-24">
                {/* Renders the booking card only if there's an active, upcoming batch. */}
                {nextBatch ? (
                    <Card className="shadow-lg">
                        <CardHeader className="space-y-4">
                             <div className="text-2xl font-bold">₹{(nextBatch.priceOverride ?? trip.price).toLocaleString('en-IN')} <span className="text-sm font-normal text-muted-foreground">/ person</span></div>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-muted-foreground" /><span>{new Date(nextBatch.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {new Date(nextBatch.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></div>
                                <div className="flex items-center gap-3"><UsersIcon className="h-4 w-4 text-muted-foreground" /><span>{nextBatch.availableSlots} slots left</span></div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="flex flex-col gap-2 w-full">
                                {/* The main call-to-action, leading to the booking confirmation page. */}
                                <Link href={`/book/${trip.id}?batch=${nextBatch.id}`} className="w-full"><Button className="w-full" size="lg"><ShoppingCart className="mr-2 h-4 w-4" />Book Now</Button></Link>
                                {/* Conditionally renders the "Reserve Spot" option if enabled for the trip. */}
                                {trip.spotReservationEnabled && trip.spotReservationDetails && (
                                    <SpotReservationDialog trip={trip} batch={nextBatch}>
                                        <Button variant="outline" className="w-full">
                                            <Ticket className="mr-2 h-4 w-4" />
                                            Reserve Spot - Pay ₹{trip.spotReservationDetails?.advanceAmount.toLocaleString('en-IN')}
                                        </Button>
                                    </SpotReservationDialog>
                                )}
                                {/* The "Need Assistance" button opens a dialog to generate a lead for the organizer. */}
                                <LeadFormDialog tripId={trip.id} tripTitle={trip.title}><Button variant="ghost" className="w-full text-primary hover:text-primary"><HandHelping className="mr-2 h-4 w-4" />Need Assistance?</Button></LeadFormDialog>
                            </div>
                        </CardContent>
                    </Card>
                 ) : (
                  // If no active batches are available, show an informative alert.
                  <Alert><AlertTriangle className="h-4 w-4" /><AlertDescription>No upcoming batches available for this trip.</AlertDescription></Alert>
                 )}
            </aside>
        </div>
      </div>
      
      {/* Renders the sticky bottom bar with booking CTAs, visible only on mobile. */}
      <MobileCtaBar trip={trip} batch={nextBatch} />
    </main>
  );
}
