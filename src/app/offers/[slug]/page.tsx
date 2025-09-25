/**
 * @fileoverview Public Offer Details Page.
 * @description Displays all public details for a single offer, with a clear call-to-action for users to claim it.
 */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { offers, organizers } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import Image from 'next/image';
import { Calendar, CheckCircle, MapPin, Tag, Ticket, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// In a real app, this would be an API call.
async function getOfferData(slug: string) {
    const offer = offers.find(o => o.slug === slug);
    if (!offer) return { offer: null, advertiser: null };
    const advertiser = organizers.find(o => o.id === offer.advertiserId);
    return { offer, advertiser };
}

export default async function OfferDetailsPage({ params }: { params: { slug: string } }) {
  const { offer, advertiser } = await getOfferData(params.slug);

  if (!offer || !advertiser) {
    notFound();
  }

  const discountValue = offer.discountType === 'Percentage' 
    ? `${offer.discountValue}% OFF` 
    : `₹${offer.discountValue} OFF`;

  return (
    <div className="bg-muted/40">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="p-0">
                           <div className="relative w-full aspect-video">
                                <Image src={offer.imageUrl} alt={offer.title} fill className="object-cover rounded-t-lg" data-ai-hint={offer.imageHint} />
                           </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <Badge variant="secondary" className="mb-2">{offer.category}</Badge>
                            <h1 className="text-3xl font-bold font-headline">{offer.title}</h1>
                            <p className="text-lg text-muted-foreground">Offered by {advertiser.name}</p>
                            <p className="mt-4">{offer.description}</p>
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><FileText /> Terms & Conditions</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {offer.termsAndConditions}
                        </CardContent>
                    </Card>
                </div>

                <aside className="md:col-span-1 space-y-6 sticky top-24">
                     <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-primary"><Tag /> The Offer</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center bg-primary/10 text-primary font-bold text-2xl p-4 rounded-lg">
                                {discountValue}
                            </div>
                             <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /> <span>Valid until {new Date(offer.validityEndDate).toLocaleDateString()}</span></div>
                                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> <span>{offer.city}</span></div>
                            </div>
                            <Button className="w-full" size="lg"><Ticket className="mr-2"/> Claim Offer</Button>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2"><CheckCircle/> How to Redeem</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            {offer.redemptionInstructions}
                        </CardContent>
                    </Card>
                </aside>
            </main>
        </div>
    </div>
  );
}
