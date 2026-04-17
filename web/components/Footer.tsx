import Link from 'next/link';
import { Radar } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 mt-16">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg discount-gradient text-white">
                <Radar className="h-4 w-4" />
              </span>
              <span>
                Deal<span className="text-brand-500">Radar</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Track the hottest Amazon US deals, lightning offers, and best prices — updated hourly.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Browse</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/deals" className="hover:text-foreground">All Deals</Link></li>
              <li><Link href="/lightning" className="hover:text-foreground">Lightning Deals</Link></li>
              <li><Link href="/category/electronics" className="hover:text-foreground">Electronics</Link></li>
              <li><Link href="/category/home" className="hover:text-foreground">Home & Kitchen</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Categories</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/category/computers" className="hover:text-foreground">Computers</Link></li>
              <li><Link href="/category/fashion" className="hover:text-foreground">Fashion</Link></li>
              <li><Link href="/category/beauty" className="hover:text-foreground">Beauty</Link></li>
              <li><Link href="/category/toys" className="hover:text-foreground">Toys & Games</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">About</h3>
            <p className="text-sm text-muted-foreground">
              We are not affiliated with Amazon. All product names, logos, and brands are property of their
              respective owners. Prices and availability change frequently.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Deal Radar. Built with Next.js. Deployed on Vercel.
        </div>
      </div>
    </footer>
  );
}
