# Editorial experience and design requirements (proposal)

| | |
|---|---|
| **Task** | m1-013 |
| **Date** | 2026-10-20 |
| **Status** | **Requirements and proposal; nothing implemented in m1-013.** "Today" columns describe the repository as verified on 2026-10-20 (code reading; editor UI behaviour as verified in m0-007 and m1-011 browser runs). Brand values are **not** defined here: they must come from the owner (§7). |
| **Related** | [Content model](./apostrophe-content-model.md) · [Information architecture](./corporate-information-architecture.md) · [Inventory](./wordpress-site-inventory.md) |

## 1. Editor journeys: today vs proposed

Role: a non-technical Assurer staff member with the core **editor** role (AGENTS.md browser rule 3).

| # | Task | Today (verified) | Gap | Proposed |
|---|---|---|---|---|
| 1 | Create a corporate page | Page tree → New page → title, type, parent; edit in context (m0-007) | Only "Default" and "Home" types; no SEO fields; no "hide from navigation" | Page types per [content model §3](./apostrophe-content-model.md#3-page-types); SEO tab with required description; `hideInNav` |
| 2 | Select an appropriate template | Type dropdown with 2 choices | Choices do not match Assurer page kinds | Types named for the job ("Product category", "Division / overview", "Standard page"), each with help text. Optional starter content (pre-filled sections) for standard pages, using core page-type defaults |
| 3 | Add and rearrange sections | Area "+" menu, drag handles and up/down arrows; widget set from `lib/area.js` (m0-007) | No widgets for features, figures, people, companies, locations, downloads or galleries | Eight new widgets ([content model §6](./apostrophe-content-model.md#6-widgets)); widget names and descriptions in plain words; icons |
| 4 | Edit product information | Product cards are inline widget content, so each card is edited where it appears | No product records; the same product can't appear in two places without copying | `assurer-product` pieces edited in one manager; the category page lists them in a chosen order |
| 5 | Replace images | Media library upload; image relationship fields; cropping and focal point (core) | Alt text optional; no size guidance | Alt text field required on informative images (in project widgets); help text with recommended ratio and minimum width (§5) |
| 6 | Create a group-company profile | Not possible (no type) | — | `assurer-organization` piece: fill the form, save draft, publish. Appears automatically on `/group` and the home teaser |
| 7 | Add news and updates | Not possible | — | Later: `assurer-article` piece and news page (D-CONTENT-6) |
| 8 | Save drafts and publish | Draft by default; Publish; Preview draft vs live; unpublished edits not public (m0-007, m1-011) | Editors can publish directly (core default; D-M0-11) | Keep, or restrict editors to "Submit for review" (contributor role) if the owner wants approval before publishing (D-CONTENT-11) |
| 9 | Preview responsive layouts | Core breakpoint preview (`@apostrophecms/asset` `breakpointPreviewMode`, enabled by default in 4.34). **Not checked in the UI in m1-013** | Must be verified with the project's CSS (it rewrites media queries) | Verify in the first implementation task; document in the editor guide |
| 10 | Maintain consistent branding | Global Styles sliders open to editors (fonts, sizes, widths) | Editors can change site-wide typography by accident (D-M0-11). No brand tokens | Brand tokens in project CSS (not editable). Global Styles limited to admins or reduced to safe options. Widgets expose content choices only (no colour pickers beyond named brand variants) |

**Training needed** (about two hours, plus a written one-page guide per task above): page tree
and page types; areas and widgets; pieces (products, companies, people, locations, documents)
and how widgets display them; images and alt text; drafts, preview, publish, versions; what not
to change (Global Styles).

### m1-014 update: editor behaviour as built

Verified by the agent as a non-admin editor (not human acceptance; see the [m1-014 report](../engineering/reports/2026/10/2026-10-20-m1-014-content-model-foundation.report.md#browser-acceptance)).

- **Page types:** "Division / overview" and "Product category" are in the page type list. Records
  (Products, Organizations, People, Locations) each have a manager in the admin bar.
- **Product placement:** a product's categories are set on the product (Placement tab). The
  category page lists them by display order.
- **Publish before linking:** relationship pickers only offer **published** pages. Publish a new
  category page before assigning products to it.
- **Privacy:** people have no phone or email fields. Location contact details appear only when
  "Show contact details" is on (default off).
- **Global Content** (gear icon) holds contact, footer and header-button settings. Editors can
  change and publish it (D-CONTENT-11).
- **Navigation:** the menu follows the page tree. Drag pages to reorder them, and use "Hide in
  Navigation" to leave a page out of the menu while it stays reachable.
- **Responsive preview (journey 9):** the core breakpoint preview works with the project's CSS.
  The Mobile and Tablet presets switch to the Menu button with no horizontal overflow. The
  Tablet preset is 1024 px wide, not 768 px.

## 2. Component inventory

| Component | Source | Used on | Status |
|---|---|---|---|
| Site header with two-level menu | `views/layout.jsx`, `modules/asset/ui/src/nav.js` | all | **Implemented (m1-014)**: page tree, two levels, core "Hide in Navigation", keyboard and touch, optional header button from Global Content |
| Footer from global settings | `views/layout.jsx` + global | all | **Implemented (m1-014)**: footer text, contact, locations, social links, copyright name; falls back to the old line when empty |
| Breadcrumbs | layout | all except home | **Planned** |
| Hero | `assurer-hero` | home, divisions, categories, corporate pages | Implemented |
| Slideshow | `assurer-slideshow` | home | Implemented |
| Rich text, image, video, columns | core | everywhere | Implemented |
| Card grid (manual) | `assurer-product-grid` / `-card` | home, `/products` | Implemented |
| Feature grid | `assurer-feature-grid` | home, services, about | Planned |
| Key figures | `assurer-stats` | home, about | Planned |
| Product list + gallery lightbox | `assurer-product-list`, `assurer-gallery` | categories, gallery | Planned |
| Organization cards | `assurer-organizations` | home, `/group` | Planned |
| People cards | `assurer-people` | leadership | Planned |
| Locations | `assurer-locations` | contact, footer | Planned |
| Downloads list | `assurer-downloads` | downloads, categories | Planned |
| Contact form | `@apostrophecms/form` | contact | Implemented (go-live decisions open: D-FORM-1…5) |
| CTA band | `assurer-hero` (no image) | any | Implemented (reuse) |

## 3. Reusable templates (page types and their default sections)

| Template | Default sections (editable) |
|---|---|
| Home | Hero or slideshow · intro text · product-division cards · key figures · services feature grid · organizations teaser · sustainability text · CTA band |
| Division / overview (`/products`, `/style`, `/health`) | Title (H1) · intro · category cards (from child pages) · optional extra sections |
| Product category | Hero image + title (H1) · summary · intro · product list with galleries · downloads for this category · inquiry CTA → contact |
| Standard page (About, Services, Leadership, Downloads, Contact, Privacy) | Title (H1) · free sections from the widget set |
| Group companies (`/group`) | Standard page with an organizations widget (anchors per company) |

## 4. Responsive design requirements

| Viewport | Width checked | Requirements |
|---|---|---|
| Mobile | 375 px (also 320 px) | Single column; menu button; cards stack; tap targets ≥ 44 × 44 px; body text ≥ 16 px; no horizontal scroll; tables scroll inside their container |
| Tablet | 768 px | Two-column grids; menu collapsed or condensed |
| Desktop | 1440 px | Content max width from a token (today 1200 px via Styles); up to 4 columns for cards |

Breakpoints: build mobile-first with min-width queries at 768 px and 1024 px (the current
Styles module already uses 767/768 and 1023/1024). Images use `srcset` renditions. Layout uses CSS
logical properties (`margin-inline`, `padding-block`) so RTL stays possible (IA §5).

## 5. Typography, spacing and images

**Typography principles** (the typeface is a brand decision; the live site renders Roboto, which
is **not** confirmed as the brand font):

- One family for text and at most one for headings. Self-host fonts (no Google Fonts requests,
  for privacy and the CSP).
- A modular scale (for example 1.25) as tokens: H1 to H4, body, small. Body 16–18 px, line
  height 1.5–1.6, line length 60–80 characters.
- Sentence case for headings. The live site's Title Case Every Word and ALL CAPS headings are
  not carried over unless the brand guide requires them.

**Spacing:** a 4 px base and an 8-step token scale (4, 8, 12, 16, 24, 32, 48, 64). Sections are
separated by fixed tokens, not editor-chosen pixel values.

**Image aspect ratios and minimum source sizes:**

| Use | Ratio | Minimum upload width |
|---|---|---|
| Hero / slideshow | 16:9 desktop, focal point respected on mobile crops | 2000 px |
| Category and product cards | 4:3 (or 1:1 if the brand guide prefers square) | 1200 px |
| Gallery thumbnails | 1:1 crop, full image in lightbox | 1600 px |
| People photos | 1:1 (portrait 4:5 acceptable) | 800 px |
| Organization logos | free ratio, displayed in a fixed box; SVG or transparent PNG | 400 px (PNG) |
| Social share image | 1.91:1 (1200 × 630) | 1200 px |

Product photos must be the owner's own or licensed. Many live images are camera snapshots; a
photography refresh is recommended (implementation plan, P2).

## 6. Accessibility requirements (WCAG 2.2 AA)

- One H1 per page; headings in order; landmarks (`header`, `nav`, `main`, `footer`); skip link.
- Alt text on informative images (required field), empty alt on decorative ones.
- Colour contrast ≥ 4.5:1 for text and ≥ 3:1 for large text and UI components, checked against
  the brand palette when supplied. Text over images always gets an overlay (hero already offers one).
- Full keyboard use: menus, lightbox (focus trap, Escape, arrows), slideshow (pause control;
  autoplay already stops under reduced motion), forms.
- Visible focus styles; no information by colour alone; links say where they go (no bare "MORE":
  use "More about knitted bottoms" or an accessible label).
- Forms: visible labels, error messages linked to fields, no CAPTCHA that blocks assistive tech.
- Motion: respect `prefers-reduced-motion`; no auto-moving text effects.
- Videos: captions or a transcript for the company profile video.
- Language set on `<html>` (`en`), and on inline passages in other languages.
- Checked with axe or Lighthouse plus a manual keyboard pass in each feature's browser checklist.

## 7. Brand assets the owner must supply or confirm

Nothing below is invented. The live site shows an orange and blue colour scheme and a raster logo,
but there is **no brand guide, vector logo or confirmed palette** in anything the agent saw.

| Asset | Needed for | Observed on the live site | Status |
|---|---|---|---|
| Logo, vector (SVG) master + horizontal and stacked variants, light and dark | header, footer, structured data, favicon | `assure-logo.png`, `assure-logo4.png` (raster only) | **Required** |
| Favicon / app icon source | browser tabs | `cropped-assure-center-*.png` | Required (or derived from the vector logo) |
| Brand colours (primary, secondary, accent, neutrals) with hex values | design tokens, contrast checks | orange and blue used visually; values unconfirmed | **Required** |
| Typography (licensed fonts or approved free fonts) | tokens, self-hosting | Roboto (Elementor default) | **Required** |
| Official company name forms ("Assurer World Wide", "AWW", "Assurer World") and tagline | titles, structured data | All three used | **Required** |
| Group company names, logos, relationships, websites | `/group`, structured data | 9 entities, inconsistent naming | **Required** |
| Key figures with an "as of" date and source | stats widget | 15+, 1700+, 108+, $67 Mn (counter targets) | **Required** before display |
| Certifications held (certificates, scope, validity) | sustainability, certifications | OEKO-TEX mention only | Required for a sustainability page |
| Product photography and approved product descriptions | category pages | ~300 snapshots, no alt text | Required (refresh recommended) |
| Leadership photos, titles and consent to publish | leadership | 17 profiles with contact details | **Required with consent** (D-CONTENT-4) |
| Current PDFs (profiles, presentations) and the profile video | downloads | 8 PDFs (2023 date codes), 1 MP4 | Confirm currency |
| Office addresses and what each location is | contact, locations | one Dhaka address; 16 names | Required |
| Social media account URLs | footer, `sameAs` | icons without links | Required (or omit) |
| Privacy notice text | `/privacy`, form | none | **Required** before the form goes live (DPO) |
