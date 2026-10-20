# Corporate information architecture (proposal)

| | |
|---|---|
| **Task** | m1-013 |
| **Date** | 2026-10-20 |
| **Status** | **Proposal, awaiting architectural review and owner decisions** (D-CONTENT-1, D-CONTENT-2, D-CONTENT-3, D-CONTENT-7 in the [decision register](../engineering/decision-register.md)). Nothing here is implemented. |
| **Inputs** | [WordPress inventory](./wordpress-site-inventory.md) (row IDs W01–W29) |
| **Related** | [Content model](./apostrophe-content-model.md) · [SEO and migration plan](./seo-and-migration-plan.md) · [Editorial and design requirements](./editorial-and-design-requirements.md) |

## 1. Principles

1. **Keep every live URL that has content** (W01, W03–W05, W07–W12, W21). Search equity is small
   (no descriptions, no structured data, few pages), but existing links in PDFs, emails and
   messaging should keep working.
2. **Move content out of the one long home page** into pages a visitor can link to: About, Group
   companies, Services. The home page keeps short teasers that link to them.
3. **Only build sections the business can fill.** The prompt's planning categories are checked
   against the inventory below. Empty sections are not launched.
4. **Structured, reusable records** for things that repeat or will grow (products, group companies,
   people, locations, documents), so one edit updates every page that shows them.
5. **Shallow hierarchy:** at most two levels below the home page, so menus work on phones.

## 2. Planning categories against the inventory

| Planning category | Evidence on the live site | Proposal |
|---|---|---|
| Home | W01 | Keep, slimmed to teasers |
| About Assurer | Text on W01 only (since 2012, positioning, goal, vision, mission, values) | **New page** `/about` (D-CONTENT-1) |
| Group businesses | 9 entity cards on W01; menu "Organizations"; 2 external sites | **New page** `/group` listing organization records; per-company pages later, when each has more than one paragraph (D-CONTENT-2) |
| Products | `/style/*`, `/health/*` (6 categories, ~45 product lines) | Keep the URLs. `/style` and `/health` become real division pages. New hub `/products` |
| Services | 6 cards on W01, menu anchors | **New page** `/services`, one section per service with an anchor |
| Industries | Not presented | **Not built.** No content supports it. Revisit if the owner supplies sector content |
| Sustainability | One paragraph on W01 | **New page** `/sustainability` **only** with verified content and evidence (certificates, scope); until then it stays a home-page section (D-CONTENT-5) |
| News and insights | None | **Deferred** (P3). The model supports it; the section is launched only with at least 3 real articles (D-CONTENT-6) |
| Careers | None | **Deferred.** No content. A simple page can be added later with the default page type |
| Contact | W11 | Keep `/contact-us` |
| Leadership | W10 | Keep `/leadership` |
| Downloads | W12 (+ 7 near-duplicate sub-pages) | Keep `/downloads` as the single library; 301 the sub-pages (D-CONTENT-3) |
| Gallery | W21 (images); W20, W22, W23 empty | Keep `/gallery/images` if the owner wants it (P2); others not migrated |
| Privacy notice | None (the contact form collects personal data) | **New page** `/privacy` (required by D-M0-4 / D-FORM-2 before the form goes live) |

## 3. Recommended sitemap

```
/                                   Home                         (W01, kept)
├── /about                          About Assurer                NEW
├── /group                          Group companies              NEW  (anchors /group#<company>)
│     └── /group/<company>          Company profile              LATER (piece show pages, D-CONTENT-2)
├── /products                       Products overview            NEW  (hub; lists both divisions)
├── /style                          Style division               (W02, kept URL, real content)
│     ├── /style/apparels-textiles                               (W03, kept)
│     ├── /style/activewear-accessories                          (W04, kept)
│     └── /style/home-tex-decor                                  (W05, kept)
├── /health                         Health division              (W06, kept URL, real content)
│     ├── /health/beauty-herbs                                   (W07, kept)
│     ├── /health/food-minerals                                  (W08, kept; needs content)
│     └── /health/health-tex-medi-care                           (W09, kept)
├── /services                       Services                     NEW  (anchors per service)
├── /sustainability                 Sustainability               NEW, conditional (D-CONTENT-5)
├── /leadership                     Leadership                   (W10, kept)
├── /downloads                      Downloads library            (W12, kept)
├── /gallery/images                 Image gallery                (W21, kept, P2)
├── /news                           News and updates             LATER (D-CONTENT-6)
├── /contact-us                     Contact                      (W11, kept)
├── /privacy                        Privacy notice               NEW
└── /sitemap                        HTML sitemap                 optional (W25)
```

Apostrophe URLs have no trailing slash (`/style/apparels-textiles`). Core already redirects
`/style/apparels-textiles/` to the slash-less URL, but with **302**. The migration plan
changes that to a single 301 ([SEO plan §3](./seo-and-migration-plan.md#3-redirects)).

`/style` and `/health` stay as the division parents because they are already in every product
URL. Division names "Style" and "Health" are the owner's existing naming; the menu can still
label the group "Products".

## 4. Navigation

### Header (desktop ≥ 1024 px)

| Item | Type | Children |
|---|---|---|
| Logo → `/` | link | — |
| About | link `/about` | — |
| Group companies | link `/group` | optional dropdown of companies (`/group#…`, external sites marked ↗) |
| Products | link `/products` + dropdown | **Style**: Apparels & Textiles · Activewear & Accessories · Home Tex & Decor. **Health**: Beauty & Herbs · Food & Minerals · Health-Tex & Medi-Care |
| Services | link `/services` | — (anchors are listed on the page, not in the menu) |
| Leadership | link `/leadership` | — |
| Downloads | link `/downloads` | — |
| Contact | button `/contact-us` | — |

Changes from today that **need owner approval** (D-CONTENT-1):

- "Organizations" is renamed "Group companies" and points to a real page instead of an anchor.
- The Services and Leadership sub-menus (anchors to home sections and role names) are removed.
  The "AWW Serves" roles move to the About or Leadership page.
- Downloads moves from the bottom bar into the header.
- The fixed bottom bar (five unlabelled icons) is not carried over. Messaging channels move to
  the Contact page and the footer.

### Footer

Company blurb · quick links (About, Products, Services, Leadership, Downloads, Contact) · group
companies (external links marked) · contact block (from global settings) · locations list ·
social links (only those with real URLs) · Privacy · © line.

### Behaviour requirements

- Navigation comes from the **page tree** (top-level pages and their children), so editors add a
  page and it appears in the menu. A per-page "Hide from navigation" option controls exceptions.
  External items (group company websites) come from global settings.
- Parents with children have **both** a link and a separate expand button, so the parent page
  stays reachable on touch screens.
- Keyboard: Tab reaches every item; Enter or Space opens a submenu; Escape closes it and returns
  focus; the current page carries `aria-current="page"`.
- Mobile (< 1024 px): a menu button (≥ 44 × 44 px) opens a full-height panel with accordion
  submenus; the page behind does not scroll; Contact stays visible as a button.
- No hover-only behaviour.

## 5. International and multilingual design

- **Launch:** one locale, English (`en`), with no URL prefix, matching today's URLs.
- **Later:** Apostrophe Community Edition supports multiple locales natively (the
  `@apostrophecms/i18n` `locales` option, per-locale drafts, a locale switcher). Automated machine
  translation is a Pro feature and is out of scope (ADR-0001). Additional locales would use
  prefixes (`/es/…`, `/pt/…`, `/ar/…`) while English keeps the root, so **no English URL changes**
  when languages are added. `hreflang` links then become required ([SEO plan §8](./seo-and-migration-plan.md#8-multilingual)).
- Candidate languages are suggested by the footer locations (Latin America, Brazil, MENA, China),
  but **no language is confirmed**. This is owner decision D-CONTENT-7.
- Arabic would need right-to-left layout support in the CSS (logical properties, `dir="rtl"`).
  The design requirements already ask for logical properties so this stays possible.
- Country-specific content (offices, phone numbers) belongs in **location records**, not
  hard-coded text, so it can be shown per page or per locale.

## 6. URL rules for new content

- Lowercase, hyphenated, English words, no dates, no IDs: `/group/assurer-trends`,
  `/news/<headline-slug>`.
- Keep slugs short; a slug changes only with a redirect (Apostrophe records the old URL and
  soft-redirects automatically; see SEO plan).
- No `.html`, no query strings for content.
