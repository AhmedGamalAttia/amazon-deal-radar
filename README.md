# 🔥 Deal Radar — Hot Amazon US Deals

A fully **free**, **open-source** deal radar for Amazon US.
A Python scraper feeds JSON files committed to this repo every hour, and a
Next.js site reads those files and renders blazing-fast static pages on Vercel.

No paid APIs. No databases. No servers running 24/7.

```
┌─────────────────────┐    cron     ┌──────────────────┐   git push   ┌─────────────────┐
│  GitHub Actions     │────────────▶│  Python scraper  │──────────────▶│  data/*.json    │
│  (free hourly run)  │             │  (requests + BS) │               │  in this repo   │
└─────────────────────┘             └──────────────────┘               └────────┬────────┘
                                                                                │ webhook
                                                                                ▼
                                                                       ┌─────────────────┐
                                                                       │  Vercel rebuild │
                                                                       │  Next.js (SSG)  │
                                                                       └─────────────────┘
```

## ✨ Features

- **Live Amazon US deals** — Today's Deals, Lightning Deals, Deal of the Day
- **Powerful filtering** — by category, min discount %, price range, rating, Prime
- **Smart sorting** — biggest discount, top-rated, most reviewed, price asc/desc
- **Search** across title, brand, category
- **Wishlist** with localStorage (no signup, no DB)
- **Price history** — every product gets a 90-day price log in `data/history/`
- **Hot Deals algorithm** — discount + rating + reviews + lightning boost
- **Dark mode**, fully responsive, PWA-friendly
- **SEO optimized** — sitemap, robots, OG tags, structured metadata
- **Affiliate-ready** — set `NEXT_PUBLIC_AFFILIATE_TAG` to inject your tag in every Amazon link

## 🗂 Repo layout

```
amazon-deal-radar/
├── web/                     # Next.js 14 App Router (deploy this to Vercel)
│   ├── app/                 # Routes: /, /deals, /lightning, /category/[slug], /search, /product/[asin], /wishlist
│   ├── components/          # DealCard, Filters, Header, Footer, Hero, …
│   ├── lib/                 # data.ts (reads ../data/*.json), types.ts, utils.ts
│   └── package.json
├── scraper/                 # Python scraper (US-focused)
│   ├── scraper.py
│   └── requirements.txt
├── data/                    # JSON output (consumed by /web)
│   ├── deals.json
│   ├── meta.json
│   └── history/<asin>.json  # daily price snapshots, last 90 days
├── .github/workflows/scrape.yml   # hourly cron that runs the scraper + commits
├── vercel.json              # tells Vercel to build /web
└── README.md
```

## 🏃 Run locally

### 1. Run the website

```bash
cd web
npm install
npm run dev
```

Open <http://localhost:3000>. The site will read the seed data shipped in
`data/deals.json`, so you'll see real-looking deals immediately.

### 2. Run the scraper (optional)

```bash
cd scraper
pip install -r requirements.txt
python scraper.py
```

This refreshes `data/deals.json`, `data/meta.json`, and the per-ASIN history
files. Restart `npm run dev` (or wait for ISR) to pick up the new data.

> **Note:** Amazon may block requests from your IP. If the scraper returns
> 0 products, the existing JSON files are preserved.

## 🚀 Deploy to Vercel

1. **Push the repo to GitHub** (private or public — GitHub Actions is free for both, with private repos getting 2,000 minutes/month).
2. Go to <https://vercel.com/new> and import the repo.
3. Vercel will auto-detect `vercel.json`. Confirm:
   - **Build command:** `cd web && npm install && npm run build`
   - **Output directory:** `web/.next`
   - **Framework:** Next.js
4. (Optional) Set environment variables:
   - `NEXT_PUBLIC_SITE_URL` → e.g. `https://your-domain.vercel.app`
   - `NEXT_PUBLIC_AFFILIATE_TAG` → your Amazon Associates tag (e.g. `mytag-20`)
5. Click **Deploy**. Done.

Every time the GitHub Action commits new `data/*.json`, Vercel will redeploy
automatically — your site stays fresh without you doing anything.

## ⏰ How the hourly refresh works

`.github/workflows/scrape.yml` runs the Python scraper at minute `:17` every
hour. After each run it `git add data/`, commits, and pushes. Vercel sees the
push and rebuilds the static site. Total moving parts: zero.

To test the workflow manually:

1. Go to the **Actions** tab in GitHub
2. Pick **Scrape Amazon Deals**
3. Click **Run workflow**

## 🔧 Customization

- **Categories** — edit `CATEGORIES` in `scraper/scraper.py` and the
  `categories` list in `data/meta.json`.
- **Anti-block tactics** — `scraper.py` rotates User-Agents, sleeps 1.5–3.5s
  between requests, and retries with backoff. If you still hit blocks, add
  HTTP proxies via `requests.Session.proxies`.
- **Affiliate links** — every outbound link routes through `affiliateUrl()`
  in `web/lib/utils.ts`. It appends your `tag=` query parameter automatically.

## 🆚 What sets this apart

| Feature                       | Deal Radar | Generic Amazon scraper sites |
| ----------------------------- | :--------: | :--------------------------: |
| Free hosting (Vercel)         | ✅         | ❌ usually paid              |
| Free scheduling (GH Actions)  | ✅         | ❌ needs VPS                 |
| Price history per product     | ✅         | ❌                           |
| Dark mode + PWA-ready         | ✅         | ❌                           |
| Filters / sorts / search      | ✅         | ⚠️ basic                     |
| Wishlist (no account needed)  | ✅         | ❌                           |
| Affiliate-link ready          | ✅         | ⚠️ manual                    |
| Hourly auto-refresh           | ✅         | ⚠️ manual                    |
| SEO sitemap + structured tags | ✅         | ❌                           |

## ⚖️ Legal note

This project is a personal/learning tool. We are not affiliated with Amazon.
Scrape responsibly: respect `robots.txt`, keep request rates low, and use the
data only for informational purposes. If you monetize via affiliate links,
follow the Amazon Associates Operating Agreement.

## 📜 License

MIT — do whatever you want, just don't blame us.
