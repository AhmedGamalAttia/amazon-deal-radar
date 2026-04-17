export type DealType = 'regular' | 'lightning' | 'deal_of_day';

export interface Product {
  asin: string;
  title: string;
  current_price: number;
  original_price: number | null;
  discount_percent: number;
  discount_amount: number;
  url: string;
  image: string;
  rating: number | null;
  reviews_count: string;
  is_prime: boolean;
  deal_type: DealType;
  time_remaining?: string;
  claimed_percent?: string;
  category: string;
  brand?: string;
  scraped_at: string;
}

export interface DealsFile {
  scraped_at: string;
  domain: string;
  currency: string;
  total_products: number;
  products: Product[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Meta {
  last_updated: string;
  next_update: string;
  domain: string;
  currency: string;
  categories: Category[];
  stats: {
    total_deals: number;
    lightning_deals: number;
    deal_of_day: number;
    avg_discount: number;
  };
}

export type SortKey = 'discount' | 'price-asc' | 'price-desc' | 'rating' | 'reviews';
