'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { Category, SortKey } from '@/lib/types';

interface Props {
  categories: Category[];
}

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'discount', label: 'Biggest Discount' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'reviews', label: 'Most Reviewed' },
];

const DISCOUNTS = [0, 10, 25, 40, 60];

export function Filters({ categories }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const set = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value === null || value === '') next.delete(key);
      else next.set(key, value);
      router.push(`?${next.toString()}`, { scroll: false });
    },
    [router, params],
  );

  const cat = params.get('category') ?? 'all';
  const minDiscount = parseInt(params.get('discount') ?? '0', 10);
  const sort = (params.get('sort') ?? 'discount') as SortKey;
  const primeOnly = params.get('prime') === '1';

  return (
    <div className="space-y-6 rounded-xl border border-border bg-card p-4">
      <div>
        <h3 className="mb-2 text-sm font-semibold">Sort By</h3>
        <select
          value={sort}
          onChange={(e) => set('sort', e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Category</h3>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => set('category', null)}
            className={cn(
              'block w-full rounded-md px-3 py-2 text-left text-sm transition',
              cat === 'all' ? 'bg-brand-500 text-white' : 'hover:bg-muted',
            )}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => set('category', c.id)}
              className={cn(
                'block w-full rounded-md px-3 py-2 text-left text-sm transition',
                cat === c.id ? 'bg-brand-500 text-white' : 'hover:bg-muted',
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Min Discount</h3>
        <div className="flex flex-wrap gap-1.5">
          {DISCOUNTS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => set('discount', d === 0 ? null : String(d))}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition',
                minDiscount === d
                  ? 'border-brand-500 bg-brand-500 text-white'
                  : 'border-border hover:border-brand-500/50',
              )}
            >
              {d === 0 ? 'Any' : `${d}%+`}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={primeOnly}
            onChange={(e) => set('prime', e.target.checked ? '1' : null)}
            className="h-4 w-4 accent-brand-500"
          />
          Prime only
        </label>
      </div>

      <button
        type="button"
        onClick={() => router.push(window.location.pathname)}
        className="w-full rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
      >
        Reset Filters
      </button>
    </div>
  );
}
