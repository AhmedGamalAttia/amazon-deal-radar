'use client';

import Link from 'next/link';
import { Radar, Zap, Flame, Search, Heart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { SearchBar } from './SearchBar';

const NAV = [
  { href: '/deals', label: 'All Deals', icon: Flame },
  { href: '/lightning', label: 'Lightning', icon: Zap },
  { href: '/wishlist', label: 'Wishlist', icon: Heart },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg discount-gradient text-white">
            <Radar className="h-5 w-5" />
          </span>
          <span className="text-lg tracking-tight">
            Deal<span className="text-brand-500">Radar</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:block w-72">
            <SearchBar size="sm" />
          </div>
          <ThemeToggle />
          <button
            type="button"
            className="md:hidden rounded-md p-2 hover:bg-muted"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container mx-auto flex flex-col gap-1 p-3">
            <SearchBar size="md" />
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
