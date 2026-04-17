'use client';

import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DealGrid } from '@/components/DealGrid';
import type { Product } from '@/lib/types';

const WL_KEY = 'dealradar_wishlist_v1';

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const ids: string[] = JSON.parse(localStorage.getItem(WL_KEY) ?? '[]');
      if (!ids.length) {
        if (!cancelled) setProducts([]);
        return;
      }
      const res = await fetch('/api/products?asins=' + ids.join(','));
      const data = await res.json();
      if (!cancelled) setProducts(data.products);
    };
    load();
    const onChange = () => load();
    window.addEventListener('wishlist:change', onChange);
    return () => {
      cancelled = true;
      window.removeEventListener('wishlist:change', onChange);
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-6 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500 text-white">
          <Heart className="h-6 w-6 fill-current" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">My Wishlist</h1>
          <p className="text-sm text-muted-foreground">Saved deals you want to track</p>
        </div>
      </header>

      {products === null ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
          Loading…
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">
            Your wishlist is empty. Tap the heart on any deal to save it here.
          </p>
        </div>
      ) : (
        <DealGrid products={products} />
      )}
    </div>
  );
}
