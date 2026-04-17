import { Filters } from '@/components/Filters';
import { DealGrid } from '@/components/DealGrid';
import { filterAndSort, getAllProducts, getMeta } from '@/lib/data';
import type { SortKey } from '@/lib/types';

export const revalidate = 1800;

export const metadata = {
  title: 'All Deals',
  description: 'Browse every live Amazon US deal, sorted by discount, price, or rating.',
};

interface SearchParams {
  category?: string;
  discount?: string;
  sort?: string;
  prime?: string;
  type?: string;
}

export default async function DealsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [products, meta] = await Promise.all([getAllProducts(), getMeta()]);

  const filtered = filterAndSort(products, {
    category: searchParams.category,
    minDiscount: searchParams.discount ? parseInt(searchParams.discount, 10) : undefined,
    sort: (searchParams.sort as SortKey) || 'discount',
    primeOnly: searchParams.prime === '1',
    dealType: (searchParams.type as 'lightning' | 'deal_of_day' | 'regular' | 'all') || 'all',
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">All Deals</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {filtered.length} of {products.length} deals match your filters
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        <aside>
          <Filters categories={meta.categories} />
        </aside>
        <div>
          <DealGrid
            products={filtered}
            emptyMessage="No deals match your filters. Try loosening them."
          />
        </div>
      </div>
    </div>
  );
}
