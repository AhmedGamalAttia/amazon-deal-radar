import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Deal Radar — Hot Amazon Deals, Lightning Offers & Best Prices',
    template: '%s · Deal Radar',
  },
  description:
    'Live Amazon US deals, lightning offers, and the biggest discounts of the day, updated hourly. Track price drops, set alerts, and never miss a deal.',
  keywords: [
    'amazon deals',
    'lightning deals',
    'best price',
    'hot deals',
    'amazon offers',
    'discount tracker',
  ],
  openGraph: {
    title: 'Deal Radar — Live Amazon Deals',
    description: 'Hottest Amazon US deals, updated hourly.',
    type: 'website',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
