
import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import { Poppins } from 'next/font/google';
import Script from 'next/script';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/context/AuthContext';
import { CityProvider } from '@/context/CityContext';
import { ClientLayout } from '@/components/common/ClientLayout';

const poppins = Poppins({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-headline',
});

const defaultUrl = process.env.VERCEL_URL
  ? `https://travonex.com`
  : 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Travonex | Curated Weekend Trips & Adventure Travel',
  description: 'Plan Less. Travel More. Discover curated weekend trips, trekking, camping, adventure travel getaways, and local offers with verified organizers on Travonex.',
  keywords: 'Travonex, travel, trips, offers, hotel deals, weekend trips, trekking, camping, adventure travel, bike trips, hiking, group travel, India holidays, trip organizers, Karnataka weekend getaways, budget travel, luxury travel, tours in India',
  openGraph: {
    title: 'Travonex | Curated Weekend Trips & Adventure Travel',
    description: 'Plan Less. Travel More. Discover curated getaways, offers, and local deals with verified organizers.',
    url: defaultUrl,
    siteName: 'Travonex',
    images: [
      {
        url: '/og-image.png', // Fallback social sharing image
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Travonex | Curated Weekend Trips & Adventure Travel',
    description: 'Plan Less. Travel More. Discover curated getaways, offers, and local deals with verified organizers.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="canonical" href={new URL(defaultUrl).toString()} />
      </head>
      <body className={cn("antialiased", poppins.variable)}>
        <AuthProvider>
          <CityProvider>
            <ClientLayout>{children}</ClientLayout>
            <Toaster />
          </CityProvider>
        </AuthProvider>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-C6KSX10G84"
        />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-C6KSX10G84');
          `}
        </Script>
      </body>
    </html>
  );
}
