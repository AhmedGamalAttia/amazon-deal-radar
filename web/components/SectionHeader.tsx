import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface Props {
  title: string;
  subtitle?: string;
  href?: string;
  icon?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, href, icon }: Props) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight md:text-2xl">
          {icon}
          {title}
        </h2>
        {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          See all
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
