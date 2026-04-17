'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  initialQuery?: string;
}

export function SearchBar({ size = 'md', initialQuery = '' }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  const heights = {
    sm: 'h-9 text-sm',
    md: 'h-11 text-sm',
    lg: 'h-14 text-base',
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <form onSubmit={onSubmit} className="relative w-full">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search for deals, brands, or products…"
        className={cn(
          'w-full rounded-full border border-border bg-card pl-10 pr-4 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
          heights[size],
        )}
      />
    </form>
  );
}
