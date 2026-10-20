# WordPress site inventory — www.assurerworld.com

| | |
|---|---|
| **Task** | m1-013 ([report](../engineering/reports/2026/10/2026-10-20-m1-013-corporate-content-architecture.report.md)) |
| **Captured** | 2026-10-20, read-only |
| **Status** | Inventory of the live site as observed on the capture date. Not a statement of company facts: every business claim below is quoted or summarised **from the live site** and needs owner confirmation before it is reused. |
| **Related** | [Information architecture](./corporate-information-architecture.md) · [Content model](./apostrophe-content-model.md) · [SEO and migration plan](./seo-and-migration-plan.md) · [Editorial and design requirements](./editorial-and-design-requirements.md) · [Implementation plan and risks](./implementation-plan-and-risks.md) |

## 1. Method and limits

- **Sources:** `robots.txt`; the WordPress core XML sitemap (`/wp-sitemap.xml` and its four child
  sitemaps); one HTTP GET per listed URL, one second apart (29 HTML pages); a read-only review
  of the home page in Claude in Chrome (rendered text, menu DOM, counter values, desktop
  screenshot); `HEAD`/`GET` checks of host, scheme and trailing-slash redirects and one deliberate
  404.
- **robots.txt** disallows only `/wp-admin/` (allows `admin-ajax.php`) and names the sitemap. It was
  respected: no admin, login, `wp-json` user or AJAX endpoint was requested.
- **Not done (by design):** no login, no form submission, no vulnerability scanning, no media-library
  download. PDFs, the MP4 and gallery images were **not downloaded**; their names and sizes come
  from page markup.
- **Personal data:** the Leadership page publishes names, direct phone numbers and email addresses
  of individuals. This inventory records **counts and roles only**, and no phone numbers or
  personal email addresses, per AGENTS.md.
- **Raw captures** (HTML, extracted JSON) were kept in the session scratchpad only and are not in
  the repository.

### Classification used

| Label | Meaning |
|---|---|
| **V** — Verified live content | Fetched and read on 2026-10-20 |
| **D** — Discovered, not inspected | Linked or listed, but its contents were not opened (media files, popups, external sites) |
| **I** — Inferred architectural requirement | A requirement derived from what was observed; not a fact on the site |
| **M** — Missing or unavailable | Expected for a corporate site, or linked, but absent, empty or unreachable |

## 2. Platform observations (V)

| Item | Observation |
|---|---|
| CMS | WordPress (generator meta reports 7.1.3), theme **Hello Elementor** |
| Page builder and plugins seen in markup | Elementor 4.1.4, **Elementor Pro** (paid), ElementsKit Lite, Premium Addons for Elementor, **Slider Revolution** 6.6.18 (paid); image-optimisation and accessibility-plugin body classes (`eio-default`, `ally-default`) |
| Server | LiteSpeed, PHP 8.5 (`x-powered-by` header) |
| Language | `lang="en-US"` on every page. No `hreflang`, no language switcher in markup. A "translate" icon in the bottom bar opens an Elementor popup; clicking it showed nothing visible (**D**, not verified) |
| Canonical host | `https://www.assurerworld.com/`. `http://` → 301 → `https://www`; `https://assurerworld.com/` → 301 → `https://www`; `http://assurerworld.com/` → 301 → `https://assurerworld.com/` → 301 → `https://www` (two hops) |
| Trailing slash | WordPress serves `/page/`; `/leadership` and `/contact-us` 301 → `/leadership/`, `/contact-us/` |
| 404 | Unknown paths return HTTP 404 |
| Feed | `/feed/` returns 200 (RSS of the single default post) |
| **Defect: PHP notices in public HTML** | Every page prints repeated PHP "Deprecated" notices from an Elementor file into the visible page, **including the hosting account's absolute server path**. See §9 |
| Head metadata | No `meta description`, no Open Graph or Twitter tags, no JSON-LD on any page. `robots` meta is `max-image-preview:large` everywhere. Self-referencing `<link rel=canonical>` on pages and the post; **none** on the category and author archives |
| Headings | **No `<h1>` on 25 of 29 pages**, including the home page. Product pages split one title over three `<h2>`s ("Apparels", "&", "Textiles"). The Beauty & Herbs page has two `<h1>`s |
| Images | 408 `<img>` references across the 29 pages; **404 have no alt text** and the other 4 have the placeholder alt "Slide". Hero slider images are loaded by script (Slider Revolution) |

## 3. Global chrome (on every page) (V)

**Header menu** (desktop, captured from the menu DOM):

| Top level | Target | Sub-items → target |
|---|---|---|
| Home | `/` | — |
| Products | `#products` (home anchor) | Apparels & Textiles → `/style/apparels-textiles/` · Activewear & Accessories → `/style/activewear-accessories/` · Home Tex & Decor → `/style/home-tex-decor/` · Beauty & Herbs → `/health/beauty-herbs/` · Food & Minerals → `/health/food-minerals/` · Health Tex & Medi Care → `/health/health-tex-medi-care/` |
| Organizations | `#organizations` | Versatile Creations, Dhaka → `https://www.vclbd.net` (external) · Pure Naturals, New Delhi → `https://purenaturals.co.in` (external) · Assurer World Wide, Dubai · Assurer Trends, Sao Paulo · Assurers At Work, Hongkong · Assurer Cairo, Egypt → all `#organizations` |
| Services | `#services` | Brand Supplies Consolidation · Financial Stability · Manufacturing Management · Quality Assurance · Supply Chain · Vendor Development → all `#services` |
| Leadership | `/leadership` (301 to `/leadership/`) | Sourcing Leaders → `/leadership` · Buying Facilitators, Finance Keepers, Quality Implementors, Supply Monitors, Trend Adapters → `#leadership` |
| Contact Us | `/contact-us` (301 to `/contact-us/`) | — |

The logo sits in the middle of the menu. Anchor links (`#products`, `#services`, …) only work on the
home page; on other pages they go nowhere useful (**I**: replace with real pages or `/#anchor`).

**Bottom bar (fixed):** five icons without accessible names: chat popup, translate popup, locations
popup, `/downloads`, and an Instagram icon popup (**D**, popups not opened except translate).

**Footer:** "Assurer World Wide" blurb; "Know More" links to `assurer.world` (**M**: connection
failed on 2026-10-20), `vclbd.net` and `/sitemap`; "Assurer World-BD" block with the Dhaka office
address of Versatile Creation Ltd, a phone number and a company email address; "Gallery" links to
`/gallery/images/`, `/gallery/videos/` and `/gallery/downloads/`; "Chat With Us At" lists WhatsApp,
WhatsApp Business, WeChat and Botim numbers (Indian and Bangladeshi numbers); a "Locations" list of
16 city or country names (New York, Montreal, Mexico, Bogota, Lima, Sao Paulo, Dubai, Delhi NCR,
Sojat, Panipat, Chile, Dhaka, Chittagong, Hong Kong, Guangzhou, Ho Chi Minh). What each location
represents (office, partner, sourcing base) is **not stated** (**M**). Social icons (Facebook,
Twitter, YouTube, Instagram) are images **with no link target** in the markup (**M**).
Copyright line "© 2012-2026 Assurer World".

## 4. URL inventory

Legend: **Nav** H = header menu, F = footer, B = bottom bar, S = HTML sitemap page only, X = WP
sitemap only (not linked from the menu). **Media** counts content images, excluding the 7 shared
header and footer images. **SEO**: none of the 29 URLs has a meta description, Open Graph tags or
structured data, so the column shows only the title and canonical. **Priority**: P1 = launch,
P2 = launch if content is supplied, P3 = after launch, R = review candidate (owner decides; no
deletion is recommended without approval). Proposed types are defined in the
[content model](./apostrophe-content-model.md).

| # | Current URL | Title (as served) | WP type | Nav | Primary heading | Content summary | Media | SEO | Proposed Apostrophe type | Pri. | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| W01 | `/` | Assurer World Wide | Page (Elementor, id 357) | H (logo, Home) | none (no H1); first H2 "Apparels & Textiles" | Script-driven hero slider (4 slides, placeholder alts); six category cards; "Since 2012" about block; four animated key-figure counters (target values in the markup: World Wide Offices 15+, Employees 1700+, Export Countries 108+, USD Turn Over $67 Mn; owner must confirm they are current); six service cards; "AWW - Entities" with 9 group-company cards; six "AWW Serves" role cards; Goal / Vision / Mission / Values; Sustainability (mentions OEKO-TEX labelled supply); contacts blurb | 18 images (8 slider placeholders, 6 category, about, logo, brands graphic, world map) | Title only; canonical self | `@apostrophecms/home-page` with hero/slideshow, product-category cards, stats, feature cards, organization list, rich text | P1 | V |
| W02 | `/style/` | Style | Page | S, X | none | **Empty parent page** (chrome only) | 0 | Title, canonical | `assurer-division-page` (new division landing page) | P1 (needs content) | V — thin |
| W03 | `/style/apparels-textiles/` | Apparels & Textiles | Page | H, home card | H2s "Apparels" "&" "Textiles" | Two groups (Apparels: knit products, tank tops, knitted bottoms, knitted kids wear, sweater, kids sweater; Textiles: woven tops, woven bottoms, denim jackets, padded jacket, …). Each line: thumbnail, one sentence, "MORE" opening an image lightbox | 13 thumbnails; 113 lightbox image links | Title, canonical | `assurer-product-category-page` + `assurer-product` pieces + `assurer-gallery` | P1 | V |
| W04 | `/style/activewear-accessories/` | Activewear & Accessories | Page | H, home card | H2s "Activewear" "&" "Accessories" | Sportswear, activewear tops, activewear bottoms, bags, caps; sports accessories. Same card + lightbox pattern | 6 thumbnails; 49 lightbox links | Title, canonical | as W03 | P1 | V |
| W05 | `/style/home-tex-decor/` | Home Tex & Decor | Page | H, home card | H2s "Home Tex" "&" "Home Decor" | Bedding (spelled "BEDING"), towels, furnishing, almirah, sofa, home decor. Card + lightbox | 6 thumbnails; 26 lightbox links | Title, canonical | as W03 | P1 | V |
| W06 | `/health/` | Health | Page | S, X | none | **Empty parent page** | 0 | Title, canonical | `assurer-division-page` | P1 (needs content) | V — thin |
| W07 | `/health/beauty-herbs/` | Beauty & Herbs | Page | H, home card | Two H1s: "Beauty & Herbs", "Herbal Beauty Products Export for Skin, Hair & Wellness" | 16 herbs, each an image with common and botanical name (Amla … Triphala); inquiry prompt | 16 images | Title, canonical | as W03 | P1 | V |
| W08 | `/health/food-minerals/` | Food & Minerals | Page | H, home card | H1 "Food & Minerals" | **Heading only, no content.** The home card for this category describes raw cotton and cotton yarns, which does not match the label (owner to confirm) | 0 | Title, canonical | as W03 | P1 (needs content) | V — thin, inconsistent |
| W09 | `/health/health-tex-medi-care/` | Health-Tex & Medi-Care | Page | H, home card | H2s "Health-Tex" "&" "Medi-Care" | Physician, surgeon and nursing scrubs; hospital and pediatric linen; disposables. Card + lightbox | 6 thumbnails; 6 lightbox links | Title, canonical | as W03 | P1 | V |
| W10 | `/leadership/` | Leadership | Page | H | H2 "Leadership" | Three groups of profile cards: Business Management (3), Business Partners (10), Business Leaders (4). 17 profiles: photo, name, role and, for some, a direct phone and email. Each name appears twice in the markup (front and back of a flip card) | 38 images (photos) | Title, canonical | `default-page` + `assurer-person` pieces + `assurer-people` widget | P1 (privacy review first) | V |
| W11 | `/contact-us/` | Contact Us | Page | H | H2 "Contact Us" | Dhaka office address (Versatile Creation Ltd), messaging numbers, company email, an **Elementor Pro form** (Name, Mobile, Email, Message, "Send"), embedded **Google Maps** iframe | 0 + map iframe | Title, canonical | `default-page` + `@apostrophecms/form` widget + `assurer-locations` widget + global contact settings | P1 | V (form not submitted) |
| W12 | `/downloads/` | Downloads | Page | B, S | H2 "Title" (placeholder) | **Placeholder card** "Title / Lorem ipsum …" with a fake download counter; cards for "AWW Style Products Presentation" (PDF, 5.7 MB), "AWW Motion Profile" (MP4, 43.9 MB), "AWW VCL Profile" (PDF, 5.24 MB), each with download and view counters; category thumbnails linking to the sub-pages | 11 thumbnails | Title, canonical | `default-page` + `assurer-downloads` widget over `@apostrophecms/file` pieces | P1 | V |
| W13 | `/downloads/corporate-profiles/` | Corporate Profiles | Page | S, links | H2 "Title" | Same three cards as W12 | as W12 | Title, canonical | Filtered view of W12 (file tag "corporate") | R (merge) | V — duplicate |
| W14 | `/downloads/apparels-textiles/` | Apparels & Textiles | Page | S, links | H2 "Title" | Category PDF "AWW Style Apparels 03-23 Presentation Top-10 Pages" + the shared cards | as W12 | Title, canonical | Downloads block on W03, or a filtered downloads view | R (merge) | V — near duplicate |
| W15 | `/downloads/active-wear-accessories/` | Active Wear & Accessories | Page | S, links | H2 "Title" | Category PDF "AWW Activewear Accessories 04-23 …" + shared cards | as W12 | Title, canonical | as W14 | R (merge) | V — near duplicate |
| W16 | `/downloads/home-tex-decor/` | Home Tex & Decor | Page | S, links | H2 "Title" | Category PDF "AWW Home & Decor 06-23 …" + shared cards | as W12 | Title, canonical | as W14 | R (merge) | V — near duplicate |
| W17 | `/downloads/beauty-herbs/` | Beauty & Herbs | Page | S, links | H2 "Title" | Category PDF "AWW Beauty Herbs 04-23 …" + shared cards | as W12 | Title, canonical | as W14 | R (merge) | V — near duplicate |
| W18 | `/downloads/food-minerals/` | Food & Minerals | Page | S, links | H2 "Title" | Category PDF "AWW Food Minerals All 6 Pages" + shared cards | as W12 | Title, canonical | as W14 | R (merge) | V — near duplicate |
| W19 | `/downloads/health-tex-medi-care/` | Health Tex & Medi Care | Page | S, links | H2 "Title" | Category PDF "AWW Health Medicare 04-23 …" + shared cards | as W12 | Title, canonical | as W14 | R (merge) | V — near duplicate |
| W20 | `/gallery/` | Gallery | Page | S, X | none | **Empty parent page** | 0 | Title, canonical | `default-page` (gallery hub) or redirect to W21 | R | V — thin |
| W21 | `/gallery/images/` | Images | Page | F | H2 "Gallery Images" | Image gallery (24 full-size image links, lightbox) | 24 links | Title, canonical | `default-page` + `assurer-gallery` | P2 | V |
| W22 | `/gallery/videos/` | Videos | Page | F | H2 "Gallery Videos" | "CAPTURING SOON" placeholder | 0 | Title, canonical | `default-page` + `@apostrophecms/video` (when content exists) | R | V — placeholder |
| W23 | `/gallery/downloads/` | Downloads | Page | F | H2 "Downloads" | "UPLOADING SOON" placeholder; duplicates the purpose of W12 | 0 | Title, canonical | Redirect to W12 (owner decision) | R | V — placeholder, duplicate |
| W24 | `/presentation/` | Presentation | Page | S, X | none | **Empty page** | 0 | Title, canonical | Redirect to W12 (owner decision) | R | V — thin |
| W25 | `/sitemap/` | SIteMap (typo as served) | Page | F | H2 "Sitemap" | HTML list of pages and categories | 0 | Title, canonical | Optional HTML sitemap page; XML sitemap replaces its SEO role | P3 | V |
| W26 | `/website-under-maintenance/` | Website Under Maintenance | Page | X | none | Maintenance notice with countdown; publicly indexable | 0 | Title, canonical | Not migrated (owner decision); 301 to `/` | R | V — obsolete |
| W27 | `/hello-world/` | Hello world! | Post (default) | X | none | WordPress default "Hello world!" post | 0 | Title, canonical | Not migrated (owner decision); 301 to `/` or 410 | R | V — obsolete |
| W28 | `/category/uncategorized/` | Uncategorized | Category archive | X | H1 "Category: Uncategorized" | Archive listing W27 | 0 | Title; **no canonical** | Not migrated; 301 to `/` (or to the news index if one is built) | R | V — obsolete |
| W29 | `/author/admin/` | admin | Author archive | X | H1 "Author: admin" | Archive listing W27; **publishes the WordPress username "admin"** | 0 | Title; **no canonical** | Not migrated; 301 to `/` | R | V — obsolete, security |

**Other discovered URLs (D):**

| URL | How found | Note |
|---|---|---|
| `/feed/` | Probed (WordPress default) | 200, RSS of W27. Redirect to `/` or 410 at cut-over |
| `/?p=1` | Probed | 301 → `/hello-world/` |
| `/download.php` | Linked once from W12 | Not requested (likely a download-manager endpoint). Treat as legacy; redirect to `/downloads` |
| `/wp-content/uploads/…` | Media links | ~300 distinct image URLs, 8 PDFs, 1 MP4; see §6 |
| `https://www.vclbd.net`, `https://purenaturals.co.in` | Menu and footer | External group-company sites, not inspected |
| `https://assurer.world` | Footer "Know More"; email domain | **Connection failed** on 2026-10-20 (**M**) |
| WhatsApp `api.whatsapp.com/send?phone=…` | Bottom bar | Click-to-chat link |

**Totals:** 29 HTML URLs in the WordPress sitemap (26 pages, 1 post, 1 category archive, 1
author archive), all fetched and read (**100 % of sitemap URLs**). Plus 3 discovered non-sitemap
URLs, 9 documents and videos, about 300 image files, 2 external group sites and 1 unreachable
domain. The XML sitemap is complete for WordPress pages; content outside it (popups, the
script-loaded hero slides) was only partly inspected.

## 5. Content topics against the prompt's checklist

| # | Topic | Finding | Class |
|---|---|---|---|
| 1 | Homepage | W01, a long single page that holds most of the corporate content | V |
| 2 | Navigation | §3. Three of six menus point to home-page anchors | V |
| 3 | About / company | No About page. The about text ("Since 2012", global sourcing and supply solutions provider, goal, vision, mission, values) lives on W01 | V; About page **M** |
| 4 | Group companies | Nine entity cards on W01: Versatile Creations (Dhaka), Assurer Trends (Sao Paulo), Assurer World Wide (Dubai, described as HQ), Assurer Cairo (Egypt), Pure Naturals (New Delhi), Assurer At Work (Hong Kong), Assurer At Work (USA), Assurer At Work (China), plus a "Versatile Creations … main group company of Assurer at Work Ltd (AAW)" statement. Menu names differ slightly ("Assurers At Work, Hongkong"). Legal names and relationships need owner confirmation | V (claims unverified) |
| 5 | Products | Two divisions by URL (`/style/`, `/health/`) with three categories each; about 45 product lines as cards; no individual product pages | V |
| 6 | Services | Six service cards on W01, no service pages | V; pages **M** |
| 7 | Industries / sectors | Not presented as such. Implied by categories (apparel, home textiles, healthcare textiles, herbal) and by "healthcare providers" and "retailers" mentions | I |
| 8 | Manufacturing / operations | Claims on W01 (factory-based supply management, in-house laboratory, quality systems, logistics partners). No facility pages, photos or specifics | V (claims unverified); facility content **M** |
| 9 | Sustainability / compliance | One Sustainability paragraph on W01 mentioning OEKO-TEX labelled supply. **No certificates, scope, numbers or documents** | V; evidence **M** |
| 10 | Leadership / careers | W10 (17 profiles). **No careers page or job content** | V; careers **M** |
| 11 | News / publications | None besides the default post. Publications = the PDFs in §6 | **M** |
| 12 | Contact / offices | W11 (one Dhaka office address). Footer list of 16 locations without addresses. Dubai is called HQ on W01, but no Dubai address is published | V; office details **M** |
| 13 | Forms / CTAs | One Elementor Pro contact form (W11). CTAs: "MORE" links, download buttons, messaging links, "Please Call to Meet us!" | V (form not submitted) |
| 14 | Languages | English only. Translate popup not verified. No country-specific content | V / D |
| 15 | Images, documents, video | §6 | V / D |
| 16 | Metadata, headings, links, canonicals | §2, §4 | V |

## 6. Media and documents

**Documents** (all under `/wp-content/uploads/`; **D**: not downloaded; sizes as shown on W12):

| File | Linked from | Shown size |
|---|---|---|
| `2023/02/AWW-Style-Products-Presentation.pdf` | W12–W14, W17–W19 | 5.7 MB |
| `2023/02/AWW-VCL-Profile.pdf` | W12–W19 | 5.24 MB |
| `2023/02/Aww-motion-profile.mp4` | W13–W19 | 43.9 MB (video, self-hosted) |
| `2023/03/AWW-Style-Apparels-03-23-Presentation-Top-10-Pages.pdf` | W14 | — |
| `2023/03/AWW-Activewear-Accessories-04-23-Presentation-Top-10-Pages.pdf` | W15 | — |
| `2023/03/AWW-Home-Decor-06-23-Presentation-Top-10-Pages-PDF.pdf` | W16 | — |
| `2023/03/AWW-Beauty-Herbs-04-23-Presentation-Top-10-Pages.pdf` | W17 | — |
| `2023/03/AWW-Food-Minerals-All-6-Pages.pdf` | W18 | — |
| `2023/03/AWW-Health-Medicare-04-23-Presentation-Top-10-Pages.pdf` | W19 | — |

The date codes in the names (03-23 … 06-23) suggest the material is from 2023 (**I**: owner to
confirm whether it is current).

**Images:** about 300 distinct files, mostly product photos with camera or generic names
(`IMG_9013.jpg`, `Picture12.jpg`, `dummy.png`) and no alt text. Brand assets seen: `assure-logo.png`
(2022, 2023 copies), `assure-logo4.png`, favicon `cropped-assure-center-*.png`, a brands graphic
`Assurer-Website-Brands-v1.2.png` (uploaded 2026-07) and `Assurer_World_map_marked-blue_dots`.
**No vector (SVG) logo and no brand guide were found** (**M**).

**Video:** the self-hosted MP4 above. No YouTube or Vimeo embeds. The Videos gallery is a
placeholder.

## 7. Internal link dependencies

- **Linked from every page** (header, footer, bottom bar): `/`, the six category URLs, `/leadership`,
  `/contact-us`, `/downloads`, `/sitemap`, the three `/gallery/*` children, and the 12 shared footer
  images. Note that the menu links `/leadership` and `/contact-us` **without** the trailing slash
  (one 301 hop on every click).
- `/downloads/*` sub-pages link to each other (8–9 inbound links each, from the downloads family only).
- `/style/`, `/health/`, `/gallery/`, `/presentation/` are linked only from the HTML sitemap page.
- `/hello-world/`, `/category/uncategorized/`, `/author/admin/` are linked only from each other and
  from the HTML sitemap.
- Home page anchors `#products`, `#organizations`, `#services`, `#leadership` are menu targets.

## 8. Review candidates (owner decision; none deleted)

| Group | URLs | Why | Suggested handling |
|---|---|---|---|
| Empty parents | W02, W06, W20 | No content | W02 and W06: become real division pages (keeps URLs). W20: gallery hub or 301 to W21 |
| Placeholders | W22, W23, W24 | "Coming soon" or empty | Do not migrate until content exists; 301 to the nearest live page |
| Duplicates | W13–W19 vs W12 | Same cards repeated; placeholder card | One downloads page plus downloads on each category page; 301 the sub-pages |
| Thin | W08 | Heading only, inconsistent home teaser | Owner supplies content, or the category is hidden until it exists |
| WordPress defaults | W26–W29, `/feed/` | Not business content; W29 leaks a username | Not migrated; 301 to `/` |
| Placeholder text on live pages | W12 "Lorem ipsum" card; W01 slider "dummy.png" | Visible placeholders | Not carried over |

## 9. Security and privacy observations (read-only; for the owner)

These are about the **existing WordPress site**, which this project must not modify. They are
recorded so the owner can act on them separately.

1. **PHP deprecation notices are printed into public pages**, exposing the server's absolute file
   path and hosting account directory. (The path is not reproduced here.) Display of errors should be
   turned off on the production host.
2. **Username disclosure:** the author archive and sitemap publish the WordPress login name
   "admin". This is a common brute-force target.
3. **Personal contact details** of individuals (direct mobile numbers, personal email addresses) are
   published on W10. Whether to keep them on the new site is a privacy decision (see D-CONTENT-4).
4. **Third-party embeds** without a consent notice: Google Maps iframe (W11), Google Fonts
   (`google_font-enabled` in the Elementor generator meta).
5. The `x-powered-by` header discloses the PHP version.
6. Paid plugins (Elementor Pro, Slider Revolution) do not transfer to the new platform. Their
   layouts must be rebuilt, not exported.
