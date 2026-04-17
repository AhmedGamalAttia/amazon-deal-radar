'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, Zap, Crown, Heart, ExternalLink } from 'lucide-react';
import { cn, formatPrice, formatNumber } from '@/lib/utils';
import type { Product } from '@/lib/types';
import { useEffect, useState } from 'react';

interface Props {
  product: Product;
  variant?: 'default' | 'compact' | 'featured';
}

const WL_KEY = 'dealradar_wishlist_v1';

function readWishlist(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(WL_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function writeWishlist(asins: string[]) {
  localStorage.setItem(WL_KEY, JSON.stringify(asins));
  window.dispatchEvent(new Event('wishlist:change'));
}

export function DealCard({ product, variant = 'default' }: Props) {
  const [wished, setWished] = useState(false);

  useEffect(() => {
    setWished(readWishlist().includes(product.asin));
    const onChange = () => setWished(readWishlist().includes(product.asin));
    window.addEventListener('wishlist:change', onChange);
    return () => window.removeEventListener('wishlist:change', onChange);
  }, [product.asin]);

  const toggleWish = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const list = readWishlist();
    const next = list.includes(product.asin)
      ? list.filter((a) => a !== product.asin)
      : [...list, product.asin];
    writeWishlist(next);
  };

  const isLightning = product.deal_type === 'lightning';
  const isDOD = product.deal_type === 'deal_of_day';

  return (
    <Link
      href={`/product/${product.asin}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-brand-500/40',
        variant === 'featured' && 'md:flex-row',
      )}
    >
      <div className={cn('relative aspect-square overflow-hidden bg-muted', variant === 'featured' && 'md:w-1/2 md:aspect-auto')}>
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, 320px"
          className="object-cover transition-transform group-hover:scale-105"
        />

        {product.discount_percent > 0 && (
          <div className="absolute left-2 top-2 rounded-md discount-gradient px-2 py-1 text-xs font-bold text-white shadow-lg">
            -{product.discount_percent}%
          </div>
        )}

        {isLightning && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-amber-500 px-2 py-1 text-xs font-semibold text-white lightning-glow">
            <Zap className="h-3 w-3" />
            Lightning
          </div>
        )}
        {isDOD && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-purple-600 px-2 py-1 text-xs font-semibold text-white">
            <Crown className="h-3 w-3" />
            Deal of Day
          </div>
        )}

        <button
          type="button"
          onClick={toggleWish}
          className={cn(
            'absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/90 backdrop-blur transition hover:scale-110',
            wished && 'border-rose-500 bg-rose-500 text-white',
          )}
          aria-label="Toggle wishlist"
        >
          <Heart className={cn('h-4 w-4', wished && 'fill-current')} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-3">
        {product.brand && (
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{product.brand}</div>
        )}
        <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-snug">{product.title}</h3>

        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          {product.rating !== null && (
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium text-foreground">{product.rating.toFixed(1)}</span>
              <span>({formatNumber(product.reviews_count || '0')})</span>
            </div>
          )}
          {product.is_prime && (
            <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
              PRIME
            </span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <div className="text-xl font-bold text-foreground">
              {formatPrice(product.current_price)}
            </div>
            {product.original_price && product.original_price > product.current_price && (
              <div className="text-xs text-muted-foreground line-through">
                {formatPrice(product.original_price)}
              </div>
            )}
          </div>
          {isLightning && product.claimed_percent && (
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Claimed</div>
              <div className="text-xs font-semibold text-amber-600">{product.claimed_percent}</div>
            </div>
          )}
        </div>

        {isLightning && product.claimed_percent && (
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-amber-500"
              style={{ width: product.claimed_percent }}
            />
          </div>
        )}
      </div>
    </Link>
  );
}
