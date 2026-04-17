import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(price);
}

export function formatNumber(value: string | number) {
  const num = typeof value === 'string' ? parseInt(value, 10) : value;
  if (isNaN(num)) return '0';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const DEFAULT_AFFILIATE_TAG = 'gemyi-20';

export function affiliateUrl(url: string, tag?: string) {
  const affTag = tag ?? process.env.NEXT_PUBLIC_AFFILIATE_TAG ?? DEFAULT_AFFILIATE_TAG;
  if (!affTag) return url;
  try {
    const u = new URL(url);
    u.searchParams.set('tag', affTag);
    return u.toString();
  } catch {
    return url;
  }
}
