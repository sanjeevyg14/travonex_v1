/**
 * @fileoverview Admin Panel Layout
 * @description Provides the main sidebar and content structure for the entire admin section.
 * It is now protected by the `useAuthGuard` hook to ensure only admins can access it.
 */
"use client";

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AlertTriangle,
  Bell,
  Briefcase,
  Building2,
  DollarSign,
  FileClock,
  FileText,
  Globe,
  LayoutGrid,
  LayoutTemplate,
  LineChart,
  ListChecks,
  Paintbrush,
  RotateCcw,
  Settings,
  ShieldCheck,
  Tags,
  TicketPercent,
  UserCircle,
  Users,
  UsersCog,
  LogOut,
  Contact,
  Ticket,
  CheckSquare,
  Gift,
  AreaChart,
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { useAuth } from '@/context/AuthContext';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const CoreIcons = {
  Dashboard: LayoutGrid,
  Notifications: Bell,
  Reports: LineChart,
};

const OperationsIcons = {
  Bookings: Briefcase,
  Trips: ListChecks,
  TripOrganisers: ShieldCheck,
  Advertisers: Building2, // Using Building2 for advertisers
  Users: Users,
  Cities: Building2,
  Tags: Tags,
};

const FinanceIcons = {
  Revenue: DollarSign,
  Payouts: DollarSign,
  Refunds: RotateCcw,
  Disputes: AlertTriangle,
  LeadsReports: Contact,
};

const GrowthIcons = {
  Promotions: TicketPercent,
  BannerManager: LayoutTemplate,
  HelpCenter: FileText,
  Branding: Paintbrush,
};

const OffersIcons = {
    PendingApprovals: CheckSquare,
    ActiveOffers: Gift,
    SponsoredOffers: Ticket,
    Analytics: AreaChart,
}

const PlatformIcons = {
  Settings: Settings,
  AdminRoles: UsersCog,
  AuditLog: FileClock,
  Profile: UserCircle,
};


const menuGroups = [
  {
    title: 'Core',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: CoreIcons.Dashboard },
      { href: '/admin/notifications', label: 'Notifications', icon: CoreIcons.Notifications },
      { href: '/admin/reports', label: 'Booking Analytics', icon: CoreIcons.Reports },
    ]
  },
  {
    title: 'Operations',
    items: [
      { href: '/admin/bookings', label: 'Bookings', icon: OperationsIcons.Bookings },
      { href: '/admin/trips', label: 'Trips', icon: OperationsIcons.Trips },
      { href: '/admin/trip-organisers', label: 'Trip Organisers', icon: OperationsIcons.TripOrganisers },
      { href: '/admin/advertiser-management', label: 'Advertisers', icon: OperationsIcons.Advertisers },
      { href: '/admin/users', label: 'Users', icon: OperationsIcons.Users },
      { href: '/admin/cities', label: 'Cities', icon: OperationsIcons.Cities },
      { href: '/admin/categories', label: 'Categories & Tags', icon: OperationsIcons.Tags },
    ]
  },
  {
    title: 'Offers Management',
    items: [
      { href: '/admin/offers/pending', label: 'Pending Approvals', icon: OffersIcons.PendingApprovals },
      { href: '/admin/offers/active', label: 'Active Offers', icon: OffersIcons.ActiveOffers },
      { href: '/admin/offers/sponsored', label: 'Sponsored Offers', icon: OffersIcons.SponsoredOffers },
      { href: '/admin/offers/analytics', label: 'Analytics & Revenue', icon: OffersIcons.Analytics },
    ]
  },
  {
    title: 'Finance',
    items: [
      { href: '/admin/revenue', label: 'Revenue', icon: FinanceIcons.Revenue },
      { href: '/admin/payouts', label: 'Payouts', icon: FinanceIcons.Payouts },
      { href: '/admin/refunds', label: 'Refunds', icon: FinanceIcons.Refunds },
      { href: '/admin/leads-reports', label: 'Lead Reports', icon: FinanceIcons.LeadsReports },
      { href: '/admin/disputes', label: 'Disputes', icon: FinanceIcons.Disputes },
    ]
  },
  {
    title: 'Growth & Content',
    items: [
      { href: '/admin/promotions', label: 'Promotions', icon: GrowthIcons.Promotions },
      { href: '/admin/banner-manager', label: 'Banner Manager', icon: GrowthIcons.BannerManager },
      { href: '/admin/cms', label: 'Help Center (CMS)', icon: GrowthIcons.HelpCenter },
      { href: '/admin/branding', label: 'Branding Sheet', icon: GrowthIcons.Branding },
    ]
  },
  {
    title: 'Platform Control',
    items: [
      { href: '/admin/settings', label: 'Settings', icon: PlatformIcons.Settings },
      { href: '/admin/admin-roles', label: 'Admin Roles', icon: PlatformIcons.AdminRoles },
      { href: '/admin/audit-log', label: 'Audit Log', icon: PlatformIcons.AuditLog },
      { href: '/admin/profile', label: 'My Profile', icon: PlatformIcons.Profile },
    ]
  }
];

const AdminSidebar = () => {
  const pathname = usePathname();
  const { logout } = useAuth();

  const isLinkActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-background border-r border-border fixed top-0 left-0 h-full flex flex-col">
      <div className="p-4 border-b">
        <Link href="/admin/dashboard">
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
                    {IconComponent && <IconComponent className="h-4 w-4" />}
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
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
            <span>View Site</span>
          </Button>
        </Link>
      </div>
    </aside>
  );
};


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, isAuthorized } = useAuthGuard('ADMIN');

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
      <AdminSidebar />
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
