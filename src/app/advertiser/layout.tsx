
"use client";

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Globe,
  Bell,
  LogOut,
  Building,
  BarChart2,
  PlusCircle,
  UserCircle,
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { useAuth } from '@/context/AuthContext';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// DEV_COMMENT: A dedicated navigation structure for the Advertiser Portal.
const menuGroups = [
    {
        title: "Advertiser Portal",
        items: [
             { href: '/advertiser/offers', label: 'My Offers', icon: Building },
             { href: '/advertiser/offers/new', label: 'Create New Offer', icon: PlusCircle },
             { href: '/advertiser/analytics', label: 'Analytics', icon: BarChart2 },
        ]
    },
    {
        title: "Account",
        items: [
            { href: '/trip-organiser/profile', label: 'Profile & KYC', icon: UserCircle },
            { href: '/trip-organiser/notifications', label: 'Notifications', icon: Bell },
        ]
    }
]

const AdvertiserSidebar = () => {
  const pathname = usePathname();
  const { logout } = useAuth();

  const isLinkActive = (href: string) => {
    if (href === '/advertiser/offers') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-background border-r border-border fixed top-0 left-0 h-full flex flex-col">
       <div className="p-4 border-b">
        <Link href="/advertiser/offers">
          <Logo />
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {menuGroups.map((group, index) => (
            <div key={group.title}>
                 {index > 0 && <hr className="my-2 border-border" />}
                 <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase">{group.title}</h3>
                 {group.items.map((item) => {
                    const IconComponent = item.icon;
                    return (
                    <Link key={item.href} href={item.href}>
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-start gap-2",
                                isLinkActive(item.href) && "bg-accent text-accent-foreground"
                            )}
                        >
                            <IconComponent className="h-4 w-4" />
                            <span>{item.label}</span>
                        </Button>
                    </Link>
                    )
                })}
            </div>
          ))}
      </nav>
      <div className="p-2 border-t">
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => logout()}>
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
        </Button>
        <Link href="/">
            <Button variant="ghost" className="w-full justify-start gap-2">
                <Globe className="h-4 w-4" />
                <span>Switch to User View</span>
            </Button>
        </Link>
      </div>
    </aside>
  );
};


export default function AdvertiserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, isAuthorized } = useAuthGuard('ORGANIZER'); // Advertisers share the 'ORGANIZER' role

  if (loading) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      <AdvertiserSidebar />
      <div className="flex-1 md:ml-64">
        <main className="min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
            </div>
        </main>
      </div>
    </div>
  );
}
