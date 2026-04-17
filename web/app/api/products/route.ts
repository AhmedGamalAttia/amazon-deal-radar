import { NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/data';

export const revalidate = 1800;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const asins = (searchParams.get('asins') ?? '').split(',').filter(Boolean);
  const all = await getAllProducts();
  const products = asins.length
    ? all.filter((p) => asins.includes(p.asin))
    : all;
  return NextResponse.json({ products, count: products.length });
}
