import type { MetadataRoute } from 'next';
import { SECTORS } from '@/lib/sectors';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://revynai.es';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/login`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/signup`, changeFrequency: 'yearly', priority: 0.5 },
  ];

  const sectorRoutes: MetadataRoute.Sitemap = SECTORS.map((s) => ({
    url: `${SITE_URL}/sectores/${s.slug}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...sectorRoutes];
}
