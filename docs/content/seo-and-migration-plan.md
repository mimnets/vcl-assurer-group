# SEO and migration plan (proposal)

| | |
|---|---|
| **Task** | m1-013 |
| **Date** | 2026-10-20 |
| **Status** | **Plan only.** No live URL was changed and no sitemap was submitted. Each item is marked **Implemented** (works in the repository today), **Core** (available in installed Apostrophe without new code), or **Planned** (needs work or approval). |
| **Status note (m1-018, 2026-10-31)** | §2–§6 are now implemented except the `/wp-content/uploads/` file redirects and Product/sub-organization/Person data (CA-5, owner facts) and H1 templates (CA-4). The "Planned" markers below are kept as written in m1-013; see the [m1-018 report](../engineering/reports/2026/10/2026-10-31-m1-018-seo-plumbing.report.md) and the [SEO runbook](../runbooks/seo.md) |
| **Related** | [Inventory](./wordpress-site-inventory.md) · [Information architecture](./corporate-information-architecture.md) · [Content model](./apostrophe-content-model.md) |

## 1. Starting point

From the inventory: 29 sitemap URLs. None has a meta description, Open Graph tags or structured
data. 25 have no H1, and 404 of 408 images have no alt text. Canonicals exist on pages but not on
archives. The host and scheme already redirect to `https://www.assurerworld.com/`. The new site
can only improve these signals; the main migration risk is **broken URLs**, not lost on-page SEO.

## 2. URL mapping

Target URLs follow Apostrophe's slash-less form. "Kept" means the same path, so the only redirect is
the trailing slash.

| # | Current URL | Target URL | Action | Status |
|---|---|---|---|---|
| W01 | `/` | `/` | Kept | — |
| W02 | `/style/` | `/style` | Kept (slash) | Planned |
| W03 | `/style/apparels-textiles/` | `/style/apparels-textiles` | Kept (slash) | Planned |
| W04 | `/style/activewear-accessories/` | `/style/activewear-accessories` | Kept (slash) | Planned |
| W05 | `/style/home-tex-decor/` | `/style/home-tex-decor` | Kept (slash) | Planned |
| W06 | `/health/` | `/health` | Kept (slash) | Planned |
| W07 | `/health/beauty-herbs/` | `/health/beauty-herbs` | Kept (slash) | Planned |
| W08 | `/health/food-minerals/` | `/health/food-minerals` | Kept (slash); content required | Planned |
| W09 | `/health/health-tex-medi-care/` | `/health/health-tex-medi-care` | Kept (slash) | Planned |
| W10 | `/leadership/` | `/leadership` | Kept (slash) | Planned |
| W11 | `/contact-us/` | `/contact-us` | Kept (slash) | Planned |
| W12 | `/downloads/` | `/downloads` | Kept (slash) | Planned |
| W13 | `/downloads/corporate-profiles/` | `/downloads` | **301** (merge) — D-CONTENT-3 | Planned |
| W14 | `/downloads/apparels-textiles/` | `/style/apparels-textiles` | **301** (documents shown on the category page) — D-CONTENT-3 | Planned |
| W15 | `/downloads/active-wear-accessories/` | `/style/activewear-accessories` | **301** — D-CONTENT-3 | Planned |
| W16 | `/downloads/home-tex-decor/` | `/style/home-tex-decor` | **301** — D-CONTENT-3 | Planned |
| W17 | `/downloads/beauty-herbs/` | `/health/beauty-herbs` | **301** — D-CONTENT-3 | Planned |
| W18 | `/downloads/food-minerals/` | `/health/food-minerals` | **301** — D-CONTENT-3 | Planned |
| W19 | `/downloads/health-tex-medi-care/` | `/health/health-tex-medi-care` | **301** — D-CONTENT-3 | Planned |
| W20 | `/gallery/` | `/gallery/images` | **301** (or a hub page) | Planned |
| W21 | `/gallery/images/` | `/gallery/images` | Kept (slash), P2 | Planned |
| W22 | `/gallery/videos/` | `/gallery/images` (or a video page when content exists) | **301** | Planned |
| W23 | `/gallery/downloads/` | `/downloads` | **301** | Planned |
| W24 | `/presentation/` | `/downloads` | **301** | Planned |
| W25 | `/sitemap/` | `/sitemap` | Kept if an HTML sitemap is built; otherwise **301** to `/` | Planned |
| W26 | `/website-under-maintenance/` | `/` | **301** | Planned |
| W27 | `/hello-world/` | `/` | **301** (or 410 Gone) | Planned |
| W28 | `/category/uncategorized/` | `/` (or `/news` if built) | **301** | Planned |
| W29 | `/author/admin/` | `/` | **301** | Planned |
| — | `/feed/` | `/` | **301** (or 410) | Planned |
| — | `/?p=1` and other `?p=`/`?page_id=` | matching target, else `/` | **301** for the known ID (`?p=1`, W01 page id 357); others fall through to 404 | Planned |
| — | `/download.php` | `/downloads` | **301** | Planned |
| — | `/wp-content/uploads/2023/0[23]/*.pdf` (8 PDFs), `…/Aww-motion-profile.mp4` | new attachment URLs (`/uploads/attachments/…`) | **301 per file**; these are the most likely URLs to be shared directly | Planned |
| — | Other `/wp-content/uploads/*` images | — | Not redirected (images are rarely linked directly); 404 is acceptable. Review Search Console image traffic first | Planned |

New URLs with no predecessor: `/about`, `/group`, `/products`, `/services`, `/privacy`, and
later `/sustainability`, `/news`, `/group/<slug>`.

## 3. Redirects

| Mechanism | What it covers | Status |
|---|---|---|
| Trailing slash `/x/` → `/x` | All kept URLs | **Core, but 302.** Verified locally on 2026-10-20: `GET /m0-test-page/` → 302 → `/m0-test-page`. Core uses `req.statusCode` when set (`node_modules/apostrophe/modules/@apostrophecms/page/index.js`, `serveDeliver`). **Planned:** make it a 301, either with a small project middleware that issues 301 for trailing-slash paths before page routing, or through `@apostrophecms/redirect`. Must be a **single hop** |
| Slug changes made by editors after launch | Old Apostrophe URLs | **Core:** `@apostrophecms/soft-redirect` (on by default) redirects historic URLs. **Planned:** set its `statusCode: 301` |
| The fixed legacy map (table above) | ~20 WordPress paths | **Planned:** a static map in a small `assurer-redirects` module (tested, editors cannot change it), or `@apostrophecms/redirect` if editors must manage redirects (D-CONTENT-10) |
| Host and scheme (`http`, apex → `https://www`) | Whole site | **Planned at hosting level** (reverse proxy), kept the same as today. Removes today's two-hop apex chain. Depends on the deployment decisions (not in M1) |

Rules: every redirect is one hop to a 200 page; no redirect chains or loops; the redirect map is
tested automatically (a script that requests every old URL and checks status and `Location`).

## 4. Titles, descriptions, canonicals, social tags

| Item | Rule | Status |
|---|---|---|
| `<title>` | `<page title> | Assurer World Wide` (suffix from global settings); home uses a dedicated title field | Partly implemented: `layout.jsx` sets the page title; suffix **planned** |
| Meta description | A required SEO field on page types, ≤ 160 characters; category pages fall back to their `summary` | **Planned** (`@apostrophecms/seo` or project fields) |
| Canonical | Absolute, self-referencing, `https://www.assurerworld.com` + slash-less path; set the base URL with Apostrophe's `baseUrl` option per environment | **Planned** |
| Open Graph / Twitter | `og:title`, `og:description`, `og:image` (page image or global default), `og:url` | **Planned** |
| Robots meta | Pages default to `index,follow`; per-page `noindex` option; the whole site `noindex` on non-production hosts (global switch or env) | **Planned** |
| Headings | Exactly one H1 per page. The hero widget already offers H1; templates for category pages render the title as H1 | Hero: **Implemented**; templates: **Planned** |

The current WordPress titles are carried over as the starting point and improved per page (for
example "SIteMap" typo; generic titles such as "Images").

## 5. XML sitemap and robots.txt

| Item | Plan | Status |
|---|---|---|
| `/sitemap.xml` | Published pages and (when they have show pages) pieces; excludes `noindex` pages; `lastmod` from `updatedAt` | **Planned** (`@apostrophecms/sitemap` or project route). 404 locally today |
| `/robots.txt` | Production: allow all, disallow `/login`, `/api/`, `/assurer/` admin routes; `Sitemap:` line. Non-production: `Disallow: /` | **Planned.** 404 locally today |
| Submission | Submit the new sitemap in Google Search Console and Bing Webmaster Tools **after** launch, by the owner | **Not done** (out of scope; never before launch) |

## 6. Structured data (JSON-LD)

| Type | Where | Source fields | Status |
|---|---|---|---|
| `Organization` | Site-wide | global: legal name, logo, URL, contact point, `sameAs` (social URLs) | Planned |
| `WebSite` | Home | global | Planned |
| `BreadcrumbList` | All pages below home | page tree | Planned |
| `ItemList` of `Product` (or `ProductGroup`) | Category pages | `assurer-product` records | Planned, **only** with accurate data; no prices or reviews invented |
| `Organization` with `parentOrganization` / `subOrganization` | `/group` | `assurer-organization` | Planned; relationships must be confirmed by the owner first |
| `Person` | Leadership | `assurer-person` | Optional; privacy review first |
| `NewsArticle` | News (later) | `assurer-article` | Later |

Validated with Google's Rich Results Test and the Schema.org validator before launch.

## 7. Images and alt text

- Migrate only the images actually used on migrated pages (about 300 files, from the inventory);
  the media library is not copied wholesale.
- Rename on import to descriptive, lowercase, hyphenated names (`knitted-kids-wear-01.jpg`, not
  `IMG_9013.jpg`); Apostrophe keeps the attachment name editable.
- **Alt text is written for every informative image** during migration (the WordPress site has
  none to copy). Decorative images get empty alt. The owner's team supplies or approves product
  descriptions where the image content is not obvious.
- Apostrophe generates resized renditions and `srcset` automatically (core image sizes). Upload
  originals at least 2000 px wide for heroes.

## 8. Multilingual

Launch is English-only, without a prefix ([IA §5](./corporate-information-architecture.md#5-international-and-multilingual-design)).
If locales are added: one URL per locale, `hreflang` alternates including `x-default`, a
canonical per locale, translated slugs optional, and a sitemap with `xhtml:link` alternates. No
automatic language redirects based on IP or browser language.

## 9. Internal links, pagination and archives

- Header and footer links point straight at final URLs (no redirect hops; today's menu links
  `/leadership` and `/contact-us` hop once).
- Rich-text links inside migrated content are rewritten to the new URLs during migration (a
  checklist item per page). Links to pages use the page relationship (`linkFields()`) so they
  survive later slug changes.
- No WordPress pagination or date archives exist to preserve. Future news listings use
  Apostrophe's `?page=N` with self-canonical pages. Category or tag archives are not indexed unless
  they have unique content.

## 10. Broken-link and launch validation

| When | Check | Tool |
|---|---|---|
| Before launch (staging) | Every old URL in §2 returns 301 → 200 in one hop | Project script (to be written in the implementation task) |
| Before launch | No internal 404s; no links to `/wp-content/` | Link checker over the staging site |
| Before launch | One H1 per page, titles and descriptions present, canonical correct, sitemap valid, robots correct for the environment | Lighthouse SEO audit + project checks |
| Launch day | Production robots allows crawling; staging stays `noindex` | Manual check |
| Launch + 1 day, + 1 week, + 4 weeks | Search Console: coverage and page indexing, 404 report, redirect errors; submit sitemap; URL Inspection for key pages | Search Console (owner account) |
| Launch + 4 weeks | Compare clicks and impressions for the kept URLs with the pre-launch baseline | Search Console |

**Pre-launch baseline needed from the owner:** Search Console access (or an export of the top
pages and queries for the last 12 months), plus any analytics, so the plan can confirm which old
URLs actually receive traffic or backlinks. Not available to the agent (**M**).
