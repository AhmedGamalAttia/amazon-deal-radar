# Deal Radar — Scraper

Standalone Python scraper. Pulls deals from `amazon.com` and writes:

- `data/deals.json` — main feed consumed by the Next.js site
- `data/meta.json` — categories + aggregate stats
- `data/history/<asin>.json` — daily price history (last 90 days)

## Run locally

```bash
cd scraper
pip install -r requirements.txt
python scraper.py
```

The script is designed for a scheduled run (GitHub Actions hourly). If the
fetch returns 0 products (e.g. Amazon blocks the runner IP), the existing
`data/*.json` files are left untouched so the site keeps showing the last
good snapshot.
