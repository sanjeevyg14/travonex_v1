
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Home, Briefcase, User, Search, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { SearchModal } from './SearchModal';
import * as React from 'react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/search', label: 'Trips', icon: Compass },
  { href: '/offers', label: 'Offers', icon: Ticket },
  { href: '/bookings', label: 'Bookings', icon: Briefcase, protected: true },
  { href: '/profile', label: 'Profile', icon: User, protected: true },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  const handleSearchClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsSearchOpen(true);
  }
  
  const visibleItems = navItems.filter(item => !(item.protected && !user));

  return (
    <>
    <nav className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border sm:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className={cn("grid h-full max-w-lg grid-flow-col mx-auto font-medium",
        `grid-cols-5` // Keep grid at 5 for consistent layout
      )}>
        {navItems.map((item) => {
          if (item.protected && !user) return null; // Don't render protected items if not logged in

          const isActive = (item.href === '/' && pathname === '/') || 
                           (pathname.startsWith('/search') && item.href === '/search') || 
                           (pathname.startsWith('/offers') && item.href === '/offers') ||
                           (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} className="inline-flex flex-col items-center justify-center px-5 hover:bg-muted group">
                <>
                  <Icon className={cn(
                      "w-5 h-5 mb-1 text-muted-foreground group-hover:text-primary",
                      isActive && "text-primary"
                  )} />
                  <span className={cn(
                      "text-xs text-muted-foreground group-hover:text-primary",
                      isActive && "text-primary"
                  )}>
                      {item.label}
                  </span>
                </>
            </Link>
          );
        })}
      </div>
    </nav>
    <SearchModal isOpen={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
}
