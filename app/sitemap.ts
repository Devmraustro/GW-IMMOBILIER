import type { MetadataRoute } from 'next';
import { properties } from '@/data/properties';
import { vehicles } from '@/data/vehicles';
import { services } from '@/data/services';
import { AREAS } from '@/data/areas';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gw-immobilier-platform.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/properties`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/cars`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/map`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/services`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ];

  const areaRoutes = AREAS.map((area) => ({
    url: `${BASE_URL}/properties?area=${area.id}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const serviceRoutes = services.map((service) => ({
    url: `${BASE_URL}${service.href}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [
    ...staticRoutes,
    ...areaRoutes,
    ...serviceRoutes,
    ...properties.map((property) => ({
      url: `${BASE_URL}/properties/${property.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...vehicles.map((vehicle) => ({
      url: `${BASE_URL}/cars/${vehicle.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ];
}
