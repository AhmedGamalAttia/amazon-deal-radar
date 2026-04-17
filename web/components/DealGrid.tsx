import { DealCard } from './DealCard';
import type { Product } from '@/lib/types';

interface Props {
  products: Product[];
  emptyMessage?: string;
}

export function DealGrid({ products, emptyMessage = 'No deals found.' }: Props) {
  if (!products.length) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((p) => (
        <DealCard key={p.asin} product={p} />
      ))}
    </div>
  );
}
