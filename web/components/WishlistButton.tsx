'use client';

import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const WL_KEY = 'dealradar_wishlist_v1';

function read(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(WL_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function WishlistButton({ asin }: { asin: string }) {
  const [wished, setWished] = useState(false);

  useEffect(() => {
    setWished(read().includes(asin));
    const onChange = () => setWished(read().includes(asin));
    window.addEventListener('wishlist:change', onChange);
    return () => window.removeEventListener('wishlist:change', onChange);
  }, [asin]);

  const toggle = () => {
    const list = read();
    const next = list.includes(asin) ? list.filter((a) => a !== asin) : [...list, asin];
    localStorage.setItem(WL_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event('wishlist:change'));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 font-semibold transition',
        wished
          ? 'border-rose-500 bg-rose-500 text-white hover:bg-rose-600'
          : 'border-border hover:bg-muted',
      )}
    >
      <Heart className={cn('h-5 w-5', wished && 'fill-current')} />
      {wished ? 'In Wishlist' : 'Wishlist'}
    </button>
  );
}
