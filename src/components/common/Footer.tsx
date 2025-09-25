
"use client";

import Link from 'next/link';
import { Logo } from './Logo';
import { useAuth } from '@/context/AuthContext';
import { Button } from '../ui/button';
import { Mail, Phone, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Footer() {
  const { user } = useAuth();
  const router = useRouter();
  
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
    <footer className="hidden sm:block border-t bg-card">
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-3 space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground max-w-xs">
              Plan Less. Travel More. Curated getaways, verified organizers, zero stress.
            </p>
             <div className="space-y-2 text-sm">
                <a href="tel:+919008114928" className="flex items-center gap-2 hover:text-primary"><Phone className="h-4 w-4" />+91 9008114928</a>
                <a href="mailto:contact@travonex.com" className="flex items-center gap-2 hover:text-primary"><Mail className="h-4 w-4" />contact@travonex.com</a>
            </div>
          </div>
          <div className="md:col-span-2 space-y-4">
            <h4 className="font-semibold">Discover</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/search" className="hover:text-primary transition-colors">Trips</Link></li>
              <li><Link href="/offers" className="hover:text-primary transition-colors">Offers</Link></li>
            </ul>
          </div>
          <div className="md:col-span-2 space-y-4">
            <h4 className="font-semibold">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/contact" className="hover:text-primary transition-colors">Help & Contact</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">FAQs</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
          <div className="md:col-span-2 space-y-4">
            <h4 className="font-semibold">Business</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><button onClick={handlePartnerClick} className="hover:text-primary transition-colors text-left">Become a Partner</button></li>
            </ul>
          </div>
          <div className="md:col-span-3 space-y-4">
             <Button asChild className="w-full md:w-auto">
                <a href="https://wa.me/919008114928" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2" /> Join WhatsApp Community
                </a>
            </Button>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Wanderlynx Labs LLP. All Rights Reserved. Travonex is a product of Wanderlynx Labs.</p>
        </div>
      </div>
    </footer>
  );
}
