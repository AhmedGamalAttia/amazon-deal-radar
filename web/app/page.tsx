import { Flame, Zap, Crown, Sparkles } from 'lucide-react';
import { CategoryRail } from '@/components/CategoryRail';
import { DealCard } from '@/components/DealCard';
import { DealGrid } from '@/components/DealGrid';
import { HeroBanner } from '@/components/HeroBanner';
import { SectionHeader } from '@/components/SectionHeader';
import {
  getAllProducts,
  getDealOfDay,
  getHotDeals,
  getLightningDeals,
  getMeta,
} from '@/lib/data';

export const revalidate = 1800;

export default async function HomePage() {
  const [meta, hot, lightning, dod, all] = await Promise.all([
    getMeta(),
    getHotDeals(8),
    getLightningDeals(8),
    getDealOfDay(8),
    getAllProducts(),
  ]);

  const featured = hot[0];
  const recent = all.slice(0, 10);

  return (
    <>
      <HeroBanner
        totalDeals={meta.stats.total_deals}
        lightningDeals={meta.stats.lightning_deals}
        avgDiscount={meta.stats.avg_discount}
        lastUpdated={meta.last_updated}
      />

      <div className="container mx-auto space-y-12 px-4 py-10">
        <section>
          <SectionHeader
            title="Browse Categories"
            subtitle="Find deals in your favorite category"
          />
          <CategoryRail categories={meta.categories} />
        </section>

        {featured && (
          <section>
            <SectionHeader
              title="Featured Deal"
              icon={<Sparkles className="h-5 w-5 text-brand-500" />}
            />
            <DealCard product={featured} variant="featured" />
          </section>
        )}

        <section>
          <SectionHeader
            title="Hot Deals"
            subtitle="Top-rated deals with the biggest savings"
            icon={<Flame className="h-5 w-5 text-rose-500" />}
            href="/deals?sort=discount"
          />
          <DealGrid products={hot} />
        </section>

        {lightning.length > 0 && (
          <section>
            <SectionHeader
              title="Lightning Deals"
              subtitle="Limited time — grab them before they're gone"
              icon={<Zap className="h-5 w-5 text-amber-500" />}
              href="/lightning"
            />
            <DealGrid products={lightning} />
          </section>
        )}

        {dod.length > 0 && (
          <section>
            <SectionHeader
              title="Deals of the Day"
              icon={<Crown className="h-5 w-5 text-purple-500" />}
              href="/deals?type=deal_of_day"
            />
            <DealGrid products={dod} />
          </section>
        )}

        <section>
          <SectionHeader
            title="Recently Added"
            href="/deals"
          />
          <DealGrid products={recent} />
        </section>
      </div>
    </>
  );
}
