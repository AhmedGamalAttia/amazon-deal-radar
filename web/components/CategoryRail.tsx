import Link from 'next/link';
import {
  Smartphone, Laptop, Home, Shirt, Sparkles, Gamepad2, Dumbbell, BookOpen,
  type LucideIcon,
} from 'lucide-react';
import type { Category } from '@/lib/types';

const ICONS: Record<string, LucideIcon> = {
  Smartphone, Laptop, Home, Shirt, Sparkles, Gamepad2, Dumbbell, BookOpen,
};

export function CategoryRail({ categories }: { categories: Category[] }) {
  return (
    <div className="scrollbar-hide -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
      <div className="flex gap-3 md:grid md:grid-cols-4 md:gap-4 lg:grid-cols-8">
        {categories.map((c) => {
          const Icon = ICONS[c.icon] ?? Smartphone;
          return (
            <Link
              key={c.id}
              href={`/category/${c.id}`}
              className="group flex min-w-[110px] flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:border-brand-500/50 hover:shadow-md md:min-w-0"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 transition group-hover:bg-brand-500 group-hover:text-white">
                <Icon className="h-6 w-6" />
              </span>
              <span className="text-center text-xs font-medium leading-tight">{c.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
