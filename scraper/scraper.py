#!/usr/bin/env python3
"""
Amazon US Deals Scraper for Deal Radar.

Outputs:
  data/deals.json           - Full product list (consumed by the Next.js site)
  data/meta.json            - Aggregate stats + categories list
  data/history/<asin>.json  - Lightweight price history per ASIN

Designed to run on a schedule (GitHub Actions hourly).
Uses requests + BeautifulSoup with rotating User-Agents, session warm-up,
and gentle delays. No paid APIs, no Playwright, no headless browser.
"""

from __future__ import annotations

import json
import random
import re
import sys
import time
from dataclasses import dataclass, asdict, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable
from urllib.parse import urljoin, quote

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
HISTORY_DIR = DATA_DIR / "history"
DOMAIN = "amazon.com"
BASE = f"https://www.{DOMAIN}"

# Per-category configuration. `queries` are searched on /s. `bestseller` paths
# are scraped from /gp/bestsellers as fallbacks.
CATEGORIES = [
    {
        "id": "electronics",
        "name": "Electronics",
        "icon": "Smartphone",
        "queries": ["wireless earbuds", "smart tv", "bluetooth speaker", "smart watch"],
        "bestseller": "/gp/bestsellers/electronics",
    },
    {
        "id": "computers",
        "name": "Computers",
        "icon": "Laptop",
        "queries": ["laptop", "ssd 1tb", "wireless mouse", "mechanical keyboard"],
        "bestseller": "/gp/bestsellers/computers",
    },
    {
        "id": "home",
        "name": "Home & Kitchen",
        "icon": "Home",
        "queries": ["air fryer", "coffee maker", "vacuum cleaner", "blender"],
        "bestseller": "/gp/bestsellers/kitchen",
    },
    {
        "id": "fashion",
        "name": "Fashion",
        "icon": "Shirt",
        "queries": ["mens watch", "running shoes", "sunglasses", "backpack"],
        "bestseller": "/gp/bestsellers/fashion",
    },
    {
        "id": "beauty",
        "name": "Beauty",
        "icon": "Sparkles",
        "queries": ["face moisturizer", "shampoo", "perfume", "hair dryer"],
        "bestseller": "/gp/bestsellers/beauty",
    },
    {
        "id": "toys",
        "name": "Toys & Games",
        "icon": "Gamepad2",
        "queries": ["lego set", "board game", "puzzle 1000", "rc car"],
        "bestseller": "/gp/bestsellers/toys-and-games",
    },
    {
        "id": "sports",
        "name": "Sports & Outdoors",
        "icon": "Dumbbell",
        "queries": ["dumbbells", "yoga mat", "fitness tracker", "tent camping"],
        "bestseller": "/gp/bestsellers/sporting-goods",
    },
    {
        "id": "books",
        "name": "Books",
        "icon": "BookOpen",
        "queries": ["bestseller fiction", "self help books", "cookbook"],
        "bestseller": "/gp/bestsellers/books",
    },
]

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7; rv:123.0) Gecko/20100101 Firefox/123.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.2420.81",
]

# Strict: must begin with "$" so we never accidentally read a non-USD price.
PRICE_RE = re.compile(r"\$\s?([\d,]+(?:\.\d{1,2})?)")


def log(msg: str) -> None:
    print(f"[scraper] {msg}", flush=True)


@dataclass
class Product:
    asin: str
    title: str
    current_price: float
    original_price: float | None
    discount_percent: int
    discount_amount: float
    url: str
    image: str
    rating: float | None
    reviews_count: str
    is_prime: bool
    deal_type: str
    category: str
    brand: str = ""
    time_remaining: str = ""
    claimed_percent: str = ""
    scraped_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


def make_session(ua: str | None = None) -> requests.Session:
    s = requests.Session()
    user_agent = ua or random.choice(USER_AGENTS)
    s.headers.update({
        "User-Agent": user_agent,
        "Accept": (
            "text/html,application/xhtml+xml,application/xml;q=0.9,"
            "image/avif,image/webp,image/apng,*/*;q=0.8"
        ),
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "max-age=0",
        "DNT": "1",
        "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "Connection": "keep-alive",
    })
    return s


def warm_up(session: requests.Session) -> bool:
    """Prime the session with cookies that force the US marketplace and USD."""
    # Force English US + USD regardless of where the scraper is running from.
    session.cookies.set("lc-main", "en_US", domain=".amazon.com")
    session.cookies.set("i18n-prefs", "USD", domain=".amazon.com")
    session.cookies.set("sp-cdn", "L5Z9:US", domain=".amazon.com")
    log("warm-up: GET homepage")
    try:
        r = session.get(BASE + "/?language=en_US&currency=USD", timeout=20)
        if r.status_code == 200:
            log(f"  -> homepage OK, cookies={len(session.cookies)}")
            return True
        log(f"  ! homepage status={r.status_code}")
    except requests.RequestException as e:
        log(f"  ! homepage failed: {e!r}")
    return False


def fetch(session: requests.Session, url: str, retries: int = 3, referer: str | None = None) -> str | None:
    for attempt in range(retries):
        try:
            time.sleep(random.uniform(2.0, 4.5))
            headers = {"User-Agent": random.choice(USER_AGENTS)}
            if referer:
                headers["Referer"] = referer
                headers["Sec-Fetch-Site"] = "same-origin"
            r = session.get(url, headers=headers, timeout=25)
            body_lower = r.text[:5000].lower()
            looks_blocked = (
                "captcha" in body_lower
                or "robot check" in body_lower
                or "to discuss automated access" in body_lower
            )
            if r.status_code == 200 and not looks_blocked:
                return r.text
            log(f"  ! status={r.status_code} blocked={looks_blocked} attempt={attempt + 1}")
            time.sleep((2 ** attempt) * 1.5 + random.random() * 2)
        except requests.RequestException as e:
            log(f"  ! err={e!r} attempt={attempt + 1}")
            time.sleep(2 ** attempt)
    return None


def parse_price(text: str | None) -> float | None:
    """Parse a USD price. Requires an explicit `$` prefix; returns None otherwise."""
    if not text:
        return None
    m = PRICE_RE.search(text)
    if not m:
        return None
    try:
        return float(m.group(1).replace(",", ""))
    except ValueError:
        return None


def extract_asin(href: str) -> str | None:
    m = re.search(r"/dp/([A-Z0-9]{10})", href)
    return m.group(1) if m else None


def parse_search_item(item, category: str) -> Product | None:
    """Parse a single result from /s search results."""
    try:
        link = item.select_one("h2 a") or item.select_one("a.a-link-normal[href*='/dp/']")
        if not link:
            return None
        href = link.get("href", "")
        asin = extract_asin(href) or item.get("data-asin", "") or ""
        if not asin or len(asin) != 10:
            return None

        title_span = (
            item.select_one("h2 a span")
            or item.select_one("h2 span")
            or item.select_one("[class*='s-line-clamp'] span")
        )
        title = title_span.get_text(strip=True) if title_span else ""
        if not title or len(title) < 4:
            return None

        # Scope to the dedicated price block when Amazon exposes it (newer layout).
        price_block = item.select_one('[data-cy="price-recipe"]') or item

        # Current price = first .a-price that is NOT the strikethrough list price.
        cur_el = None
        for span in price_block.select("span.a-price"):
            classes = span.get("class", []) or []
            if "a-text-price" in classes:
                continue
            offscreen = span.select_one(".a-offscreen")
            if offscreen:
                cur_el = offscreen
                break
        current_price = parse_price(cur_el.get_text(strip=True) if cur_el else None)
        if not current_price or current_price <= 0 or current_price > 5000:
            return None

        # Original / list price = the strikethrough one
        old_el = price_block.select_one("span.a-price.a-text-price .a-offscreen")
        original_price = parse_price(old_el.get_text(strip=True) if old_el else None)

        # Discount badge fallback ("Save 20%" / "20% off")
        badge_text = ""
        for sel in [
            "span.savingsPercentage",
            "span[class*='savingPriceOverride']",
            "span[data-a-strike='true']",
        ]:
            badge = price_block.select_one(sel)
            if badge:
                badge_text = badge.get_text(" ", strip=True)
                break
        discount_percent = 0
        if badge_text:
            m = re.search(r"(\d+)\s*%", badge_text)
            if m:
                discount_percent = int(m.group(1))

        # Strict sanity: original must be > current and within 3x (real Amazon discounts rarely exceed 70%)
        if original_price is not None:
            if (
                original_price <= current_price
                or original_price > current_price * 3
                or original_price > 5000
            ):
                original_price = None

        discount_amount = 0.0
        if original_price and original_price > current_price:
            discount_amount = round(original_price - current_price, 2)
            calc_pct = round(discount_amount / original_price * 100)
            discount_percent = max(discount_percent, calc_pct)
        elif discount_percent and not original_price:
            original_price = round(current_price / (1 - discount_percent / 100), 2)
            discount_amount = round(original_price - current_price, 2)

        # Cap suspiciously high discounts (Amazon rarely shows true >70% off on physical items)
        if discount_percent > 75:
            original_price = None
            discount_amount = 0
            discount_percent = 0

        img_el = item.select_one("img.s-image") or item.select_one("img")
        image = (img_el.get("src") or img_el.get("data-src") or "") if img_el else ""

        rating = None
        rating_el = (
            item.select_one("i.a-icon-star-small span.a-icon-alt")
            or item.select_one("i.a-icon-star span.a-icon-alt")
            or item.select_one("span.a-icon-alt")
        )
        if rating_el:
            m = re.search(r"([\d.]+)\s*out of\s*5", rating_el.get_text(strip=True))
            if m:
                try:
                    rating = float(m.group(1))
                except ValueError:
                    pass

        reviews_count = ""
        reviews_el = item.select_one('span[aria-label$="ratings"], a[aria-label*="ratings"] span, .s-link-style .s-underline-text')
        if reviews_el:
            txt = reviews_el.get_text(strip=True).replace(",", "")
            m = re.search(r"\d+", txt)
            reviews_count = m.group() if m else ""

        is_prime = bool(item.select_one("i.a-icon-prime, .s-prime, [aria-label='Amazon Prime']"))

        return Product(
            asin=asin,
            title=title,
            current_price=current_price,
            original_price=original_price,
            discount_percent=discount_percent,
            discount_amount=discount_amount,
            url=f"{BASE}/dp/{asin}",
            image=image,
            rating=rating,
            reviews_count=reviews_count,
            is_prime=is_prime,
            deal_type="regular",
            category=category,
        )
    except Exception:
        return None


def scrape_search(session: requests.Session, keyword: str, category: str, pages: int = 2) -> list[Product]:
    """Scrape Amazon search results for a category keyword across multiple pages."""
    products: list[Product] = []
    for page in range(1, pages + 1):
        # Sort by featured (default) returns deals more often than price-asc
        url = f"{BASE}/s?k={quote(keyword)}&page={page}&ref=sr_pg_{page}"
        log(f"search: {keyword!r} page {page}")
        html = fetch(session, url, referer=f"{BASE}/")
        if not html:
            break
        soup = BeautifulSoup(html, "lxml")
        items = soup.select('[data-component-type="s-search-result"]')
        if not items:
            items = soup.select("div[data-asin][data-uuid]")
        page_count = 0
        for item in items[:30]:
            p = parse_search_item(item, category)
            if p:
                products.append(p)
                page_count += 1
        log(f"  -> +{page_count} items")
        if page_count == 0:
            break
    return products


def scrape_bestsellers(session: requests.Session, path: str, category: str) -> list[Product]:
    """Scrape /gp/bestsellers/<category>. No discount data — used for cards-without-deal fallback."""
    url = BASE + path
    log(f"bestsellers: {path}")
    html = fetch(session, url, referer=f"{BASE}/")
    if not html:
        return []
    soup = BeautifulSoup(html, "lxml")
    products: list[Product] = []
    seen: set[str] = set()
    for link in soup.select('a[href*="/dp/"]')[:80]:
        href = link.get("href", "")
        asin = extract_asin(href)
        if not asin or asin in seen:
            continue
        seen.add(asin)
        title_el = (
            link.select_one("[class*='_p13n-zg-list'] div")
            or link.select_one("div[class*='zg-grid-general-faceout']")
            or link
        )
        title = (title_el.get_text(" ", strip=True) or "")[:280]
        if len(title) < 6:
            continue
        img_el = link.select_one("img")
        image = (img_el.get("src") or "") if img_el else ""
        # Find price within the parent card
        card = link.find_parent(["div", "li"]) or link
        cur_el = card.select_one("span.a-offscreen, span._cDEzb_p13n-sc-price_3mJ9Z")
        current_price = parse_price(cur_el.get_text(strip=True) if cur_el else None)
        if not current_price:
            continue
        rating = None
        rating_el = card.select_one("span.a-icon-alt")
        if rating_el:
            m = re.search(r"([\d.]+)", rating_el.get_text())
            if m:
                try:
                    rating = float(m.group(1))
                except ValueError:
                    pass
        products.append(Product(
            asin=asin,
            title=title,
            current_price=current_price,
            original_price=None,
            discount_percent=0,
            discount_amount=0,
            url=f"{BASE}/dp/{asin}",
            image=image,
            rating=rating,
            reviews_count="",
            is_prime=False,
            deal_type="regular",
            category=category,
        ))
    log(f"  -> {len(products)} bestseller items")
    return products


def dedupe(products: Iterable[Product]) -> list[Product]:
    seen: dict[str, Product] = {}
    for p in products:
        prev = seen.get(p.asin)
        # Prefer the entry with more info: discount > rating > image
        if prev is None:
            seen[p.asin] = p
        else:
            score_new = (p.discount_percent, 1 if p.rating else 0, 1 if p.image else 0)
            score_old = (prev.discount_percent, 1 if prev.rating else 0, 1 if prev.image else 0)
            if score_new > score_old:
                seen[p.asin] = p
    return list(seen.values())


def update_history(products: list[Product]) -> None:
    HISTORY_DIR.mkdir(parents=True, exist_ok=True)
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    for p in products:
        f = HISTORY_DIR / f"{p.asin}.json"
        history = []
        if f.exists():
            try:
                history = json.loads(f.read_text("utf-8"))
            except json.JSONDecodeError:
                history = []
        history = [h for h in history if h.get("date") != today]
        history.append({"date": today, "price": p.current_price, "discount": p.discount_percent})
        history = history[-90:]
        f.write_text(json.dumps(history, indent=2), "utf-8")


def write_outputs(products: list[Product]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    products = sorted(products, key=lambda p: (p.discount_percent, parse_int(p.reviews_count)), reverse=True)
    now = datetime.now(timezone.utc).isoformat()

    deals_payload = {
        "scraped_at": now,
        "domain": DOMAIN,
        "currency": "USD",
        "total_products": len(products),
        "products": [asdict(p) for p in products],
    }

    lightning = sum(1 for p in products if p.deal_type == "lightning")
    dod = sum(1 for p in products if p.deal_type == "deal_of_day")
    discounted = [p for p in products if p.discount_percent > 0]
    avg_discount = round(sum(p.discount_percent for p in discounted) / len(discounted)) if discounted else 0

    meta_payload = {
        "last_updated": now,
        "next_update": now,
        "domain": DOMAIN,
        "currency": "USD",
        "categories": [{"id": c["id"], "name": c["name"], "icon": c["icon"]} for c in CATEGORIES],
        "stats": {
            "total_deals": len(products),
            "lightning_deals": lightning,
            "deal_of_day": dod,
            "avg_discount": avg_discount,
        },
    }

    (DATA_DIR / "deals.json").write_text(
        json.dumps(deals_payload, indent=2, ensure_ascii=False), "utf-8"
    )
    (DATA_DIR / "meta.json").write_text(
        json.dumps(meta_payload, indent=2, ensure_ascii=False), "utf-8"
    )
    log(f"wrote {len(products)} products to data/deals.json")


def parse_int(s: str) -> int:
    try:
        return int(s)
    except (TypeError, ValueError):
        return 0


def main() -> int:
    log(f"starting Amazon US scrape :: {datetime.now(timezone.utc).isoformat()}")
    session = make_session()

    if not warm_up(session):
        log("warm-up failed, but continuing anyway…")

    all_products: list[Product] = []

    for cat in CATEGORIES:
        log(f"--- category: {cat['name']} ---")
        try:
            for q in cat["queries"]:
                products = scrape_search(session, q, cat["id"], pages=2)
                all_products.extend(products)
        except Exception as e:
            log(f"  ! search for {cat['id']} failed: {e!r}")

        # Bestseller fallback (only if we got fewer than 5 search products for this category)
        cat_count = sum(1 for p in all_products if p.category == cat["id"])
        if cat_count < 5:
            try:
                all_products.extend(scrape_bestsellers(session, cat["bestseller"], cat["id"]))
            except Exception as e:
                log(f"  ! bestsellers for {cat['id']} failed: {e!r}")

    products = dedupe(all_products)
    log(f"total unique products: {len(products)}")

    discounted = sum(1 for p in products if p.discount_percent > 0)
    log(f"products with discount > 0: {discounted}")

    if len(products) < 10:
        log("WARNING: scrape returned <10 products. Keeping existing data files.")
        return 1

    write_outputs(products)
    update_history(products)
    log("done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
