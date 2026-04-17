import { promises as fs } from 'fs';
import path from 'path';
import type { DealsFile, Meta, Product, SortKey } from './types';

const DATA_DIR = path.join(process.cwd(), '..', 'data');

async function readJson<T>(file: string): Promise<T> {
  const full = path.join(DATA_DIR, file);
  const raw = await fs.readFile(full, 'utf-8');
  return JSON.parse(raw) as T;
}

export async function getDealsFile(): Promise<DealsFile> {
  return readJson<DealsFile>('deals.json');
}

export async function getMeta(): Promise<Meta> {
  return readJson<Meta>('meta.json');
}

export async function getAllProducts(): Promise<Product[]> {
  const data = await getDealsFile();
  return data.products;
}

export async function getProductByAsin(asin: string): Promise<Product | null> {
  const products = await getAllProducts();
  return products.find((p) => p.asin === asin) ?? null;
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const products = await getAllProducts();
  return products.filter((p) => p.category === category);
}

export async function getRelatedProducts(
  asin: string,
  category: string,
  limit = 4,
): Promise<Product[]> {
  const products = await getProductsByCategory(category);
  return products.filter((p) => p.asin !== asin).slice(0, limit);
}

export interface FilterOptions {
  category?: string;
  minDiscount?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  primeOnly?: boolean;
  dealType?: 'all' | 'lightning' | 'deal_of_day' | 'regular';
  query?: string;
  sort?: SortKey;
}

export function filterAndSort(products: Product[], opts: FilterOptions): Product[] {
  let filtered = [...products];

  if (opts.category && opts.category !== 'all') {
    filtered = filtered.filter((p) => p.category === opts.category);
  }
  if (opts.minDiscount !== undefined) {
    filtered = filtered.filter((p) => p.discount_percent >= opts.minDiscount!);
  }
  if (opts.minPrice !== undefined) {
    filtered = filtered.filter((p) => p.current_price >= opts.minPrice!);
  }
  if (opts.maxPrice !== undefined) {
    filtered = filtered.filter((p) => p.current_price <= opts.maxPrice!);
  }
  if (opts.minRating !== undefined) {
    filtered = filtered.filter((p) => (p.rating ?? 0) >= opts.minRating!);
  }
  if (opts.primeOnly) {
    filtered = filtered.filter((p) => p.is_prime);
  }
  if (opts.dealType && opts.dealType !== 'all') {
    filtered = filtered.filter((p) => p.deal_type === opts.dealType);
  }
  if (opts.query) {
    const q = opts.query.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.brand?.toLowerCase().includes(q) ?? false) ||
        p.category.toLowerCase().includes(q),
    );
  }

  const sort: SortKey = opts.sort ?? 'discount';
  filtered.sort((a, b) => {
    switch (sort) {
      case 'discount':
        return b.discount_percent - a.discount_percent;
      case 'price-asc':
        return a.current_price - b.current_price;
      case 'price-desc':
        return b.current_price - a.current_price;
      case 'rating':
        return (b.rating ?? 0) - (a.rating ?? 0);
      case 'reviews':
        return parseInt(b.reviews_count || '0') - parseInt(a.reviews_count || '0');
      default:
        return 0;
    }
  });

  return filtered;
}

export function dealScore(p: Product): number {
  const discount = p.discount_percent;
  const rating = (p.rating ?? 4) * 10;
  const reviewBoost = Math.min(parseInt(p.reviews_count || '0') / 1000, 50);
  const lightningBoost = p.deal_type === 'lightning' ? 25 : 0;
  const dodBoost = p.deal_type === 'deal_of_day' ? 15 : 0;
  return discount + rating + reviewBoost + lightningBoost + dodBoost;
}

export async function getHotDeals(limit = 8): Promise<Product[]> {
  const products = await getAllProducts();
  return [...products].sort((a, b) => dealScore(b) - dealScore(a)).slice(0, limit);
}

export async function getLightningDeals(limit = 8): Promise<Product[]> {
  const products = await getAllProducts();
  return products.filter((p) => p.deal_type === 'lightning').slice(0, limit);
}

export async function getDealOfDay(limit = 8): Promise<Product[]> {
  const products = await getAllProducts();
  return products.filter((p) => p.deal_type === 'deal_of_day').slice(0, limit);
}
