
"use client";

import * as React from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import Autoplay from "embla-carousel-autoplay";
import { Skeleton } from '../ui/skeleton';

interface TripImageGalleryProps {
  coverImage: string;
  images: { url: string; hint: string }[];
  title: string;
}

export function TripImageGallery({ coverImage, images, title }: TripImageGalleryProps) {
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);

  const allImages = [{ url: coverImage, hint: 'cover photo' }, ...images];

  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  const handleImageClick = (index: number) => {
    setActiveIndex(index);
    setOpen(true);
  };
  
  // Simulate loading
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Skeleton className="w-full aspect-[16/9] rounded-lg bg-muted" />;
  }
  
  return (
    <>
      <div className="w-full aspect-[3/2] md:aspect-[16/9] relative">
        <Carousel
          plugins={[plugin.current]}
          className="w-full h-full"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent>
            {allImages.map((img, index) => (
              <CarouselItem key={index} onClick={() => handleImageClick(index)}>
                <div className="relative h-full w-full cursor-pointer">
                  <Image 
                    src={img.url} 
                    alt={`${title} gallery image ${index + 1}`} 
                    fill 
                    priority={index === 0} 
                    className="object-cover" 
                    loading={index > 0 ? "lazy" : "eager"}
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI8wNPvd7POQAAAABJRU5ErkJggg=="
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:inline-flex bg-background/50 hover:bg-background" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:inline-flex bg-background/50 hover:bg-background" />
        </Carousel>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl p-0 border-0">
          <Carousel opts={{ startIndex: activeIndex, loop: true }} className="w-full">
            <CarouselContent>
              {allImages.map((img, index) => (
                <CarouselItem key={index}>
                  <div className="relative h-[80vh] w-full">
                    <Image src={img.url} alt={`${title} gallery image ${index + 1}`} fill className="object-contain" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
          </Carousel>
        </DialogContent>
      </Dialog>
    </>
  );
}
