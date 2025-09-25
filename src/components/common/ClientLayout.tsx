
"use client";

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { useAuth } from '@/context/AuthContext';
import { GlobalAlertBanner } from '@/components/common/GlobalAlertBanner';
import { BottomNav } from '@/components/common/BottomNav';
import { MobileHeader } from './MobileHeader';

function GlobalSpinner() {
  const { sessionStatus } = useAuth();
  if (sessionStatus !== 'loading') return null;

  return (
    <div className="fixed inset-0 bg-background/80 z-[9999] flex items-center justify-center backdrop-blur-sm">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const isAuthPage = pathname.startsWith('/auth');
  const isAdminPage = pathname.startsWith('/admin');
  const isOrganizerPage = pathname.startsWith('/trip-organiser');
  const isBookingSuccessPage = pathname.startsWith('/booking/success');


  const showMainLayout = !isAuthPage && !isAdminPage && !isOrganizerPage && !isBookingSuccessPage;

  return (
    <>
      <GlobalSpinner />
      {showMainLayout ? (
        <div className="font-headline flex flex-col min-h-screen">
          <Header />
          <MobileHeader />
          <div className="flex-grow pt-16 sm:pt-16">
            <div className="hidden sm:block">
              <GlobalAlertBanner />
            </div>
            {children}
          </div>
          <Footer />
          <BottomNav />
        </div>
      ) : (
        <div className="font-headline">{children}</div>
      )}
    </>
  );
}
