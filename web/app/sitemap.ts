import type { MetadataRoute } from 'next';
import { getAllProducts, getMeta } from '@/lib/data';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const [products, meta] = await Promise.all([getAllProducts(), getMeta()]);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'hourly', priority: 1 },
    { url: `${base}/deals`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${base}/lightning`, changeFrequency: 'hourly', priority: 0.8 },
  ];

  const cats = meta.categories.map((c) => ({
    url: `${base}/category/${c.id}`,
    changeFrequency: 'hourly' as const,
    priority: 0.7,
  }));

  const productEntries = products.map((p) => ({
    url: `${base}/product/${p.asin}`,
    lastModified: p.scraped_at,
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...cats, ...productEntries];
}
