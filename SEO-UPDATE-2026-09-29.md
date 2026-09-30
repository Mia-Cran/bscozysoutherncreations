# B's Cozy Southern Creations: Search Console fix + $45 blanket (Sep 29, 2026)

Work done in Claude (Cowork) while Cursor usage was out. Pick up from here in Cursor.

## Paste into a new Cursor chat

```
B's Cozy Southern Creations only (not FlashTrack). Read SEO-UPDATE-2026-09-29.md in the repo root.
Repo: github.com/Mia-Cran/bssoutherncreations. Vercel production deploys from main.
On Sep 29, 2026 we fixed a Search Console "Product snippets" error and added the real
pink-and-periwinkle blanket as a $45 product. Confirm these changes are on main and live, then continue.
```

## What Search Console showed (Sep 29)
- Homepage **is indexed**. HTTPS OK.
- Sitemap `https://bscozysoutherncreations.com/sitemap.xml`: read successfully, 10 pages found.
- Page indexing report: "Processing data, please check again in a day or so" (new property, which is normal).
- **Only error: Product snippets, 1 invalid item.** Message: *Either "offers", "review", or "aggregateRating" should be specified.*
- Cause: the JSON-LD `@graph` on every page had `makesOffer → itemOffered: Product "Custom handmade knits and resin gifts"` with no price.

## Changes made (11 files)
1. **Removed** the priceless `makesOffer` Product from the JSON-LD on all 10 public pages
   (`index.html`, `resin/`, all 8 `seasons/*/index.html`). Organization, WebSite, WebPage and Breadcrumb entries were not changed.
2. **Added a real Product** to the `index.html` JSON-LD `@graph`:
   - Name: Pink and Periwinkle Chenille Throw Blanket
   - Image: `assets/products/featured-blanket.jpg` (the **only real photo**; the other product photos are stock)
   - Price: `45.00 USD`, `InStock`, `NewCondition`, url `/#featured`, brand B's Cozy Southern Creations
3. **Price shown on the page:** `index.html` `<p class="price" data-price="featured">$45</p>` (no longer hidden),
   and `content.json` → `featured.price = "$45"`. Google needs the visible price to match the JSON-LD.

## Rules going forward
- Only add Product JSON-LD for items with a **real photo AND a real price**. No stock-photo products.
- If the blanket's price changes, update **both** `content.json` and the JSON-LD `"price"` in `index.html`.
  (The admin page only edits `content.json`, not the JSON-LD.)
- If the blanket is made to order, change `availability` to `https://schema.org/PreOrder` or `BackOrder`.
- The "Blankets & throws" category card stays unpriced (generic category).

## Still to do
- [ ] Commit + push to `main` (Vercel auto-deploys). From Terminal:
      `git add -A && git commit -m "Fix Product snippet error and add featured blanket at \$45" && git pull --no-rebase --no-edit origin main && git push origin HEAD:main`
- [ ] Search Console → URL Inspection → homepage → **Request indexing**
- [ ] Recheck Page indexing report in a few days
- [ ] Replace stock photos (blanket.jpg, hat.jpg, scarf.jpg, set.jpg) with real ones when available, then add those as priced products
- [ ] Local branch is `cursor/cozy-strong-seo-12ba`. Its SEO work is already merged to `main` (PR #2), so switch to `main` after pushing
- [ ] `HANDOFF.md` is outdated (it still says GitHub Pages / FlashTrack repo / no admin). Site is now on Vercel in its own repo.
