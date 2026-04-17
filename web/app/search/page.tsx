import { Search } from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';
import { DealGrid } from '@/components/DealGrid';
import { filterAndSort, getAllProducts } from '@/lib/data';

export const revalidate = 1800;

export const metadata = {
  title: 'Search',
  description: 'Search Amazon US deals by keyword, brand, or category.',
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; sort?: string };
}) {
  const q = searchParams.q ?? '';
  const products = await getAllProducts();
  const results = q
    ? filterAndSort(products, { query: q, sort: (searchParams.sort as any) || 'discount' })
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="mb-3 flex items-center gap-2 text-2xl font-bold tracking-tight md:text-3xl">
          <Search className="h-6 w-6" />
          Search Deals
        </h1>
        <SearchBar size="md" initialQuery={q} />
        {q && (
          <p className="mt-3 text-sm text-muted-foreground">
            Found {results.length} results for <span className="font-semibold text-foreground">&ldquo;{q}&rdquo;</span>
          </p>
        )}
      </header>

      {!q ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
          Type a keyword above to search deals.
        </div>
      ) : (
        <DealGrid products={results} emptyMessage={`No deals found for “${q}”.`} />
      )}
    </div>
  );
}
