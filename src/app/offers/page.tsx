/**
 * @fileoverview Public Offers Listing Page.
 * @description This page displays a filterable grid of all active offers available on the platform.
 */
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { offers as mockOffers } from "@/lib/mock-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useCity } from "@/context/CityContext";
import { CitySelector } from "@/components/common/CitySelector";

// A dedicated component for the offer card for reusability.
function OfferCard({ offer }: { offer: typeof mockOffers[0] }) {
    return (
        <Card className="overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
            <CardHeader className="p-0 relative">
                <Link href={`/offers/${offer.slug}`}>
                    <Image src={offer.imageUrl} alt={offer.title} width={400} height={225} className="aspect-video object-cover" data-ai-hint={offer.imageHint} />
                </Link>
                 <Badge className="absolute top-2 right-2 text-base" variant="destructive">
                    {offer.discountType === 'Percentage' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`}
                </Badge>
            </CardHeader>
            <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{offer.category} in {offer.city}</p>
                <h3 className="font-semibold truncate">{offer.title}</h3>
                <p className="text-sm text-muted-foreground">by {offer.advertiserName}</p>
            </CardContent>
        </Card>
    );
}

export default function OffersPage() {
  const { selectedCity } = useCity();

  // BACKEND: This should be a paginated API call with filters: GET /api/offers?city=...&category=...
  const activeOffers = React.useMemo(() => {
    return mockOffers.filter(o => {
        const isActive = o.status === 'Active';
        const matchesCity = selectedCity === 'all' || o.city === selectedCity;
        return isActive && matchesCity;
    });
  }, [selectedCity]);

  const renderOfferGrid = (offers: typeof mockOffers) => {
    if (offers.length === 0) {
        return (
            <div className="text-center py-16 text-muted-foreground col-span-full">
                <p>No offers found for the selected criteria.</p>
            </div>
        )
    }
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {offers.map(offer => <OfferCard key={offer.id} offer={offer} />)}
        </div>
    )
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <main className="flex flex-1 flex-col items-center gap-8 py-4 md:py-8 font-headline">
            <div className="space-y-2 text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                Offers & Deals
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover exclusive city-based offers from our trusted partners.
                </p>
            </div>
            
            <div className="w-full max-w-sm">
                <CitySelector />
            </div>

            <Tabs defaultValue="all" className="w-full">
                <div className="flex justify-center">
                    <TabsList>
                        <TabsTrigger value="all">All Offers</TabsTrigger>
                        <TabsTrigger value="Hotel">Hotels</TabsTrigger>
                        <TabsTrigger value="Food">Food</TabsTrigger>
                        <TabsTrigger value="Rental">Rentals</TabsTrigger>
                        <TabsTrigger value="Activity">Activities</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="all" className="mt-6">
                   {renderOfferGrid(activeOffers)}
                </TabsContent>
                 <TabsContent value="Hotel" className="mt-6">{renderOfferGrid(activeOffers.filter(o => o.category === 'Hotel'))}</TabsContent>
                 <TabsContent value="Food" className="mt-6">{renderOfferGrid(activeOffers.filter(o => o.category === 'Food'))}</TabsContent>
                 <TabsContent value="Rental" className="mt-6">{renderOfferGrid(activeOffers.filter(o => o.category === 'Rental'))}</TabsContent>
                 <TabsContent value="Activity" className="mt-6">{renderOfferGrid(activeOffers.filter(o => o.category === 'Activity'))}</TabsContent>
            </Tabs>
        </main>
    </div>
  );
}
