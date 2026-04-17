import { notFound } from 'next/navigation';
import { Filters } from '@/components/Filters';
import { DealGrid } from '@/components/DealGrid';
import {
  filterAndSort,
  getAllProducts,
  getMeta,
  getProductsByCategory,
} from '@/lib/data';
import type { SortKey } from '@/lib/types';

export const revalidate = 1800;

export async function generateStaticParams() {
  const meta = await getMeta();
  return meta.categories.map((c) => ({ slug: c.id }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const meta = await getMeta();
  const cat = meta.categories.find((c) => c.id === params.slug);
  if (!cat) return { title: 'Category' };
  return {
    title: `${cat.name} Deals`,
    description: `The hottest Amazon US deals in ${cat.name}, updated hourly.`,
  };
}

interface SearchParams {
  discount?: string;
  sort?: string;
  prime?: string;
  type?: string;
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: SearchParams;
}) {
  const meta = await getMeta();
  const cat = meta.categories.find((c) => c.id === params.slug);
  if (!cat) notFound();

  const products = await getProductsByCategory(params.slug);
  const filtered = filterAndSort(products, {
    minDiscount: searchParams.discount ? parseInt(searchParams.discount, 10) : undefined,
    sort: (searchParams.sort as SortKey) || 'discount',
    primeOnly: searchParams.prime === '1',
    dealType: (searchParams.type as 'lightning' | 'deal_of_day' | 'regular' | 'all') || 'all',
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-6">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Category</div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{cat.name} Deals</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {filtered.length} of {products.length} deals
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        <aside>
          <Filters categories={meta.categories.filter((c) => c.id !== params.slug)} />
        </aside>
        <DealGrid products={filtered} />
      </div>
    </div>
  );
}
