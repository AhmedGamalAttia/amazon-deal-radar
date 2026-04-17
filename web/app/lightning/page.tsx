import { Zap } from 'lucide-react';
import { DealGrid } from '@/components/DealGrid';
import { getLightningDeals } from '@/lib/data';

export const revalidate = 600;

export const metadata = {
  title: 'Lightning Deals',
  description: 'Limited-time Amazon lightning deals. Grab them before they sell out.',
};

export default async function LightningPage() {
  const deals = await getLightningDeals(50);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-6 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-white lightning-glow">
          <Zap className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Lightning Deals</h1>
          <p className="text-sm text-muted-foreground">
            {deals.length} live deals · Limited time, limited stock
          </p>
        </div>
      </header>

      <DealGrid products={deals} emptyMessage="No lightning deals are live right now." />
    </div>
  );
}
