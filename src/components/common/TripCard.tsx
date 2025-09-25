
'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MapPin } from 'lucide-react';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Trip } from '@/lib/types';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';

type TripCardProps = {
  trip: Trip;
  className?: string;
};

export function TripCard({ trip, className }: TripCardProps) {
  const [isFavorite, setIsFavorite] = React.useState(false);

  return (
    <Card className={cn('overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 w-full flex flex-col group', className)}>
      <CardHeader className="p-0">
        <div className="relative overflow-hidden aspect-[4/3]">
          <Link href={`/trips/${trip.slug}`}>
            <Image
              src={trip.image}
              alt={trip.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              data-ai-hint={trip.imageHint}
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI8wNPvd7POQAAAABJRU5ErkJggg=="
            />
          </Link>
          <Badge variant="secondary" className="absolute top-3 left-3">{trip.tripType}</Badge>
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-3 right-3 rounded-full bg-background/70 hover:bg-background h-8 w-8"
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <Heart className={cn('h-5 w-5', isFavorite ? 'text-primary fill-current' : 'text-foreground')} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-base font-bold leading-snug">
          <Link href={`/trips/${trip.slug}`} className="line-clamp-2 hover:text-primary transition-colors">{trip.title}</Link>
        </CardTitle>
        <div className="flex items-center text-muted-foreground text-sm mt-1">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span>{trip.location}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <p className="text-lg font-bold text-primary flex items-baseline">
            <span>₹</span>
            <span>{trip.price.toLocaleString('en-IN')}</span>
        </p>
        <Link href={`/trips/${trip.slug}`}>
          <Button size="sm">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export function TripCardSkeleton({ className }: { className?: string }) {
    return (
        <Card className={cn('overflow-hidden rounded-2xl w-full flex flex-col animate-pulse', className)}>
            <CardHeader className="p-0">
                <Skeleton className="w-full aspect-[4/3] bg-muted" />
            </CardHeader>
            <CardContent className="p-4 flex-grow space-y-2">
                <Skeleton className="h-6 w-3/4 bg-muted" />
                <Skeleton className="h-4 w-1/2 bg-muted" />
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between items-center">
                <Skeleton className="h-8 w-24 bg-muted" />
                <Skeleton className="h-10 w-28 bg-muted" />
            </CardFooter>
        </Card>
    );
}
