import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Zap, Crown, ExternalLink, Clock, ShoppingCart, TrendingDown, Tag } from 'lucide-react';
import {
  getAllProducts,
  getProductByAsin,
  getRelatedProducts,
} from '@/lib/data';
import { affiliateUrl, formatNumber, formatPrice } from '@/lib/utils';
import { DealGrid } from '@/components/DealGrid';
import { SectionHeader } from '@/components/SectionHeader';
import { WishlistButton } from '@/components/WishlistButton';

export const revalidate = 1800;

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ asin: p.asin }));
}

export async function generateMetadata({ params }: { params: { asin: string } }) {
  const p = await getProductByAsin(params.asin);
  if (!p) return { title: 'Product' };
  return {
    title: `${p.title} — ${p.discount_percent}% off`,
    description: `Buy ${p.title} on Amazon for ${formatPrice(p.current_price)} (was ${
      p.original_price ? formatPrice(p.original_price) : 'N/A'
    }). Save ${p.discount_percent}%.`,
    openGraph: { images: [p.image] },
  };
}

export default async function ProductPage({ params }: { params: { asin: string } }) {
  const product = await getProductByAsin(params.asin);
  if (!product) notFound();

  const related = await getRelatedProducts(product.asin, product.category, 5);
  const buyUrl = affiliateUrl(product.url);

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-4 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/category/${product.category}`} className="hover:text-foreground capitalize">
          {product.category}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.title.slice(0, 50)}…</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted">
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
          {product.discount_percent > 0 && (
            <div className="absolute left-3 top-3 rounded-lg discount-gradient px-3 py-1.5 text-sm font-bold text-white shadow-lg">
              -{product.discount_percent}% OFF
            </div>
          )}
          {product.deal_type === 'lightning' && (
            <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-semibold text-white lightning-glow">
              <Zap className="h-4 w-4" />
              Lightning Deal
            </div>
          )}
          {product.deal_type === 'deal_of_day' && (
            <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-sm font-semibold text-white">
              <Crown className="h-4 w-4" />
              Deal of the Day
            </div>
          )}
        </div>

        <div className="flex flex-col">
          {product.brand && (
            <div className="mb-2 inline-flex w-fit items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Tag className="h-3 w-3" />
              {product.brand}
            </div>
          )}
          <h1 className="text-2xl font-bold leading-tight md:text-3xl">{product.title}</h1>

          <div className="mt-3 flex items-center gap-4 text-sm">
            {product.rating !== null && (
              <div className="flex items-center gap-1">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(product.rating ?? 0)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium">{product.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">
                  ({formatNumber(product.reviews_count)} reviews)
                </span>
              </div>
            )}
            {product.is_prime && (
              <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                ✓ PRIME
              </span>
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-baseline gap-3">
              <div className="text-4xl font-bold text-brand-600">
                {formatPrice(product.current_price)}
              </div>
              {product.original_price && product.original_price > product.current_price && (
                <div className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.original_price)}
                </div>
              )}
            </div>
            {product.discount_amount > 0 && (
              <div className="mt-1 flex items-center gap-1 text-sm font-medium text-emerald-600">
                <TrendingDown className="h-4 w-4" />
                You save {formatPrice(product.discount_amount)} ({product.discount_percent}%)
              </div>
            )}

            {product.deal_type === 'lightning' && (
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                {product.time_remaining && (
                  <div className="rounded-lg bg-amber-500/10 p-3">
                    <div className="flex items-center gap-1 text-xs uppercase tracking-wide text-amber-700 dark:text-amber-400">
                      <Clock className="h-3.5 w-3.5" /> Time left
                    </div>
                    <div className="mt-0.5 text-lg font-bold">{product.time_remaining}</div>
                  </div>
                )}
                {product.claimed_percent && (
                  <div className="rounded-lg bg-rose-500/10 p-3">
                    <div className="text-xs uppercase tracking-wide text-rose-700 dark:text-rose-400">
                      Claimed
                    </div>
                    <div className="mt-0.5 text-lg font-bold">{product.claimed_percent}</div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-rose-500/20">
                      <div className="h-full bg-rose-500" style={{ width: product.claimed_percent }} />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <a
                href={buyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3 font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-600"
              >
                <ShoppingCart className="h-5 w-5" />
                Buy on Amazon
                <ExternalLink className="h-4 w-4 opacity-70" />
              </a>
              <WishlistButton asin={product.asin} />
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Price last checked: {new Date(product.scraped_at).toLocaleString('en-US')}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-border p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Category</div>
              <Link
                href={`/category/${product.category}`}
                className="mt-0.5 block font-medium capitalize hover:text-brand-600"
              >
                {product.category}
              </Link>
            </div>
            <div className="rounded-lg border border-border p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">ASIN</div>
              <div className="mt-0.5 font-mono text-sm">{product.asin}</div>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <SectionHeader
            title="Related Deals"
            subtitle={`More deals in ${product.category}`}
            href={`/category/${product.category}`}
          />
          <DealGrid products={related} />
        </section>
      )}
    </div>
  );
}
