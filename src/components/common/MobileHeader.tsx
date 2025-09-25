
"use client";

import * as React from 'react';
import { Logo } from "./Logo";
import { CitySelector } from "./CitySelector";
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { SearchModal } from './SearchModal';

export function MobileHeader() {
    const [isSearchOpen, setIsSearchOpen] = React.useState(false);

    return (
        <>
            <div className={cn("fixed top-0 left-0 right-0 z-40 flex sm:hidden w-full h-14 items-center justify-between bg-background/95 backdrop-blur-sm shadow-sm px-4 border-b")}>
                <Logo />
                <div className="flex items-center gap-2">
                    <div className="w-28">
                        <CitySelector className="h-9 text-xs truncate" />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
                        <Search className="h-5 w-5" />
                        <span className="sr-only">Search</span>
                    </Button>
                </div>
            </div>
            <SearchModal isOpen={isSearchOpen} onOpenChange={setIsSearchOpen} />
        </>
    );
}
