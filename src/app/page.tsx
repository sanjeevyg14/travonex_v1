

/**
 * @fileoverview Homepage for the Travenox platform.
 * @description This page serves as the main entry point for users, displaying featured trips, categories, and AI-powered suggestions.
 * 
 * @developer_notes
 * - **Data Fetching**: The component simulates API calls to fetch various data sets. In a real app, this should be optimized.
 *   - `GET /api/trips?isBanner=true&limit=5`: Fetches trips marked by an admin to appear in the main banner.
 *   - `GET /api/trips?isFeatured=true&city={selectedCity}&limit=4`: Fetches featured trips, respecting the user's city selection.
 *   - `GET /api/categories?status=Active`: Fetches active categories for the "Explore by Interest" section.
 * - **Loading States**: Uses `useState` and `useEffect` to manage a loading state, displaying skeleton loaders to improve perceived performance.
 */
"use client";

import Link from "next/link";
import * as React from "react";
import { TripCard, TripCardSkeleton } from "@/components/common/TripCard";
import { DestinationSuggestionForm } from "@/components/ai/DestinationSuggestionForm";
import { trips, categories as mockCategories } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users } from "lucide-react";
import { useCity } from "@/context/CityContext";
import { TripBannerSlider } from "@/components/common/TripBannerSlider";
import { WhyBookBanner } from "@/components/common/WhyBookBanner";
import type { Trip, Category } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/common/Logo";

// DEV_COMMENT: Skeleton loader for the category exploration section.
const CategorySkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
             <div key={i} className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border bg-card">
                 <Skeleton className="h-8 w-8 rounded-full" />
                 <Skeleton className="h-5 w-24" />
             </div>
        ))}
    </div>
)


export default function HomePage() {
  const { selectedCity } = useCity();
  const [isLoading, setIsLoading] = React.useState(true);
  const [bannerTrips, setBannerTrips] = React.useState<Trip[]>([]);
  const [featuredTrips, setFeaturedTrips] = React.useState<Trip[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);


  React.useEffect(() => {
    setIsLoading(true);
    // FRONTEND: Simulate fetching data from the backend.
    const timer = setTimeout(() => {
        // BACKEND: Fetch trips marked for the banner. The API should limit this to 5. `GET /api/trips?isBanner=true`
        const fetchedBannerTrips = trips.filter(trip => trip.isBannerTrip && trip.status === 'Published');
        setBannerTrips(fetchedBannerTrips);
        
        // BACKEND: This logic should be a single API call: GET /api/trips?isFeatured=true&city={selectedCity}&limit=4
        // The `isFeatured` flag is set by an Admin in the Admin Panel.
        const fetchedFeaturedTrips = trips
            .filter(trip => trip.isFeatured && trip.status === 'Published')
            .filter(trip => selectedCity === 'all' || trip.city === selectedCity)
            .slice(0, 4);
        setFeaturedTrips(fetchedFeaturedTrips);

        // BACKEND: Fetch active categories from `GET /api/categories?status=Active`
        const activeCategories = mockCategories.filter(c => c.status === 'Active');
        setCategories(activeCategories);

        setIsLoading(false);
    }, 500); // Simulate network delay
    
    return () => clearTimeout(timer);
  }, [selectedCity]);
  

  return (
    <main className="flex-1 space-y-12 md:space-y-20 font-headline">
      
      <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center text-center p-4 bg-background">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
        <div className="relative z-10 space-y-4">
           <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 text-transparent bg-clip-text">
            Plan Less. Travel More.
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Curated getaways, verified organizers, zero stress. Your next adventure starts here.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
             <Link href="/search">
                <Button size="lg" className="w-full sm:w-auto">Explore Trips <ArrowRight className="ml-2 h-5 w-5" /></Button>
            </Link>
             <Link href="/contact">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">Join Community <Users className="ml-2 h-5 w-5" /></Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="container max-w-7xl mx-auto px-4 space-y-12 md:space-y-20">
        <section>
          {isLoading ? <Skeleton className="h-[200px] md:h-[28rem] w-full rounded-2xl" /> : <TripBannerSlider bannerTrips={bannerTrips} />}
        </section>

        <section>
          <h2 className="text-xl md:text-3xl font-bold tracking-tight mb-6 text-center">
            Explore by Interest
          </h2>
          {isLoading ? <CategorySkeleton /> : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                  // DEV_COMMENT: Clicking a category navigates to the search page with the category filter pre-applied.
                  <Link href={`/search?category=${category.name}`} key={category.name}>
                      <div className="flex flex-col items-center justify-center gap-2 p-4 md:p-6 rounded-2xl border bg-card hover:bg-accent hover:text-accent-foreground transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg hover:-translate-y-1">
                      <IconComponent className={`h-8 w-8 text-primary`} />
                      <span className="font-semibold text-sm md:text-base text-center">{category.name}</span>
                      </div>
                  </Link>
                  )
              })}
              </div>
          )}
        </section>

        <section>
          <WhyBookBanner />
        </section>

        <section>
          <DestinationSuggestionForm />
        </section>

        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-3xl font-bold tracking-tight">
              Featured Trips
            </h2>
            <Link href="/search">
              <Button variant="link">View All <ArrowRight className="ml-1 h-4 w-4" /></Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => <TripCardSkeleton key={i} />)
              ) : featuredTrips.length > 0 ? (
                  featuredTrips.map(trip => <TripCard key={trip.id} trip={trip} />)
              ) : (
                <p className="text-muted-foreground col-span-full text-center py-8">No featured trips available for the selected city.</p>
              )}
          </div>
        </section>
      </div>
    </main>
  );
}
