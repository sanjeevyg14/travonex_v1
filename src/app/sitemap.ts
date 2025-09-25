
import { MetadataRoute } from 'next';
import { trips, offers } from '@/lib/mock-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travonex.com';

  // Static pages
  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/search',
    '/offers',
    '/terms',
    '/privacy',
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Dynamic trip pages
  const tripRoutes = trips
    .filter(trip => trip.status === 'Published')
    .map((trip) => ({
      url: `${siteUrl}/trips/${trip.slug}`,
      lastModified: new Date().toISOString(), // In a real app, this would be trip.updatedAt
      changeFrequency: 'weekly' as const,
      priority: 0.9,
  }));
  
  // Dynamic offer pages
  const offerRoutes: MetadataRoute.Sitemap = offers
    .filter(offer => offer.status === 'Active')
    .map((offer) => ({
        url: `${siteUrl}/offers/${offer.slug}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

  return [...staticRoutes, ...tripRoutes, ...offerRoutes];
}
