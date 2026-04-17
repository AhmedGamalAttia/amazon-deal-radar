import { Flame, Zap, TrendingDown } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { timeAgo } from '@/lib/utils';

interface Props {
  totalDeals: number;
  lightningDeals: number;
  avgDiscount: number;
  lastUpdated: string;
}

export function HeroBanner({ totalDeals, lightningDeals, avgDiscount, lastUpdated }: Props) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-brand-500/10 via-rose-500/5 to-purple-500/10">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            Live · Updated {timeAgo(lastUpdated)}
          </div>
          <h1 className="text-balance text-3xl font-bold tracking-tight md:text-5xl">
            The hottest{' '}
            <span className="bg-gradient-to-r from-brand-500 to-rose-500 bg-clip-text text-transparent">
              Amazon US deals
            </span>
            , in one place.
          </h1>
          <p className="mt-3 text-balance text-base text-muted-foreground md:text-lg">
            Lightning offers, deal of the day, and the biggest discounts — refreshed every hour.
          </p>

          <div className="mx-auto mt-6 max-w-xl">
            <SearchBar size="lg" />
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 md:gap-6">
            <Stat icon={<Flame className="h-5 w-5" />} value={totalDeals} label="Live Deals" />
            <Stat icon={<Zap className="h-5 w-5" />} value={lightningDeals} label="Lightning" />
            <Stat icon={<TrendingDown className="h-5 w-5" />} value={`${avgDiscount}%`} label="Avg Discount" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-3 backdrop-blur md:p-4">
      <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600">
        {icon}
      </div>
      <div className="text-xl font-bold md:text-2xl">{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground md:text-xs">{label}</div>
    </div>
  );
}
