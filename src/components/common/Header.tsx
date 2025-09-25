
"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from 'react';
import { UserNav } from "@/components/common/UserNav";
import { cn } from "@/lib/utils";
import { CitySelector } from "./CitySelector";
import { Logo } from "./Logo";
import { Input } from "@/components/ui/input";
import { Search, Ticket } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "@/context/AuthContext";


type HeaderProps = {
  className?: string;
  homePath?: string;
};

export function Header({ className, homePath = '/' }: HeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const defaultSearchTerm = searchParams.get('q') || '';
  
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const searchTerm = e.currentTarget.value.trim();
      if(searchTerm) {
        router.push(`/search?q=${searchTerm}`);
      } else {
         router.push(`/search`);
      }
    }
  };
  
  const handlePartnerClick = () => {
    // If user is already an organizer, redirect to their dashboard.
    // Otherwise, direct them to the unified partner signup page.
    if (user && user.role === 'ORGANIZER') {
      router.push('/trip-organiser/dashboard');
    } else {
      router.push('/auth/organizer-signup');
    }
  };

  return (
    <header className={cn("fixed top-0 left-0 right-0 z-50 hidden h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6 sm:flex", className)}>
      <div className="flex items-center gap-4">
        <Link href={homePath}>
            <Logo />
        </Link>
      </div>
      
      <div className="flex-1 flex justify-center px-4 items-center gap-4">
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild><Link href="/search">Trips</Link></Button>
            <Button variant="ghost" asChild><Link href="/offers">Offers</Link></Button>
             <Button variant="ghost" onClick={handlePartnerClick}>Become a Partner</Button>
          </nav>
          <div className="w-full max-w-sm">
              <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                      key={defaultSearchTerm} // Force re-render if query param changes to ensure sync
                      placeholder="Search by destination or interest..."
                      className="pl-10 w-full rounded-full"
                      defaultValue={defaultSearchTerm}
                      onKeyDown={handleSearch}
                  />
              </div>
          </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex">
          <CitySelector />
        </div>
        <UserNav />
      </div>
    </header>
  );
}
