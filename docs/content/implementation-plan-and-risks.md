# Implementation plan, risks and gaps (proposal)

| | |
|---|---|
| **Task** | m1-013 |
| **Date** | 2026-10-20 |
| **Status** | **Proposal.** Task IDs are assigned when each task starts (STANDARDS.md); the labels below (CA-1 …) are placeholders. Every task waits for the owner decisions it lists. |
| **Related** | [Inventory](./wordpress-site-inventory.md) · [IA](./corporate-information-architecture.md) · [Content model](./apostrophe-content-model.md) · [SEO plan](./seo-and-migration-plan.md) · [Editorial and design](./editorial-and-design-requirements.md) · [Decision register](../engineering/decision-register.md) |

## 1. Gap and risk analysis

| Area | Finding | Impact | Mitigation | Owner |
|---|---|---|---|---|
| Missing business content | No About, Services or Sustainability pages; no careers, news, office details or certificates; Food & Minerals is empty and its home teaser describes cotton | New pages can't launch with real text | Content brief per page (D-CONTENT-12); launch only filled sections | Business owner |
| Unverified claims | Key figures, "debt free", "in-house laboratory", "HQ Dubai", group relationships, OEKO-TEX | Legal and reputational risk if republished unchanged | Owner confirms each claim and date before migration; stats widget carries an "as of" note | Business owner |
| Brand assets | No vector logo, palette, fonts or guide | Design tokens and templates blocked | §7 of the editorial requirements; placeholder theme stays until supplied | Business owner |
| Photography | ~300 camera snapshots, inconsistent ratios, no alt text | Quality and accessibility | Re-shoot or curate; write alt text during migration | Business owner + content lead |
| Documents | 8 PDFs with 2023 date codes; 44 MB self-hosted MP4 | Out-of-date material; heavy video | Confirm currency; host video on a platform or as a file (D-CONTENT-9) | Business owner |
| Component limits | One-level nav; hard-coded footer; no listing, stats, gallery or downloads widgets; no SEO fields | Blocks the proposed IA | CA-1 and CA-2 | Engineering |
| Duplication | 7 near-duplicate downloads pages; leadership cards duplicated in markup; entity names inconsistent | Editor confusion, thin pages | One record per thing (pieces); 301 duplicates (D-CONTENT-3) | Engineering + owner |
| SEO | Low baseline, so low risk of loss; main risk is broken old URLs and PDF links; core trailing-slash redirect is 302 | Lost links | 301 map, single-hop trailing slash, automated redirect test, Search Console follow-up | Engineering + owner |
| Migration complexity | Elementor and Slider Revolution layouts can't be exported; content must be re-entered | Effort, not risk | ~30 pages and ~45 products: manual entry through the UI plus a scripted image import through the REST API; no WordPress database access needed | Engineering + content lead |
| Accessibility | No H1 on most pages, no alt text, unlabelled icon bar, "MORE" links, text animations | WCAG failures on the old site | Requirements §6 enforced in widgets and browser checklists | Engineering |
| Privacy | Personal phones and emails on Leadership; Google Maps and Google Fonts without consent; contact form without a privacy notice | GDPR or local-law exposure | Contact details off by default (D-CONTENT-4); link-out map or consented embed; self-hosted fonts; `/privacy` before form go-live | Owner + DPO |
| Security (old site) | PHP notices expose server paths; `admin` username published; PHP version header | Risk to the live site (not this project) | Reported to the owner (inventory §9); the project must not touch the WordPress site | Owner / site host |
| Security (new site) | New widgets and relationships widen the input surface | XSS, unsafe links | Only typed fields; `url` fields; no HTML widget; sanitised rich text; per-feature negative tests | Engineering |
| Editor permissions | Editors can publish and change Global Styles (D-M0-11) | Brand drift, unreviewed publishing | D-CONTENT-11 and a role decision before staff rollout | Owner |
| Training | New concepts (pieces vs pages) | Slow adoption | Two-hour session + one-page guides (editorial requirements §1) | Content lead |
| Dependencies | SEO, sitemap and redirect packages need approval; the core AI module is new | Supply-chain and API churn | Approval + audit per package (D-CONTENT-10); AI deferred to its own ADR | Owner + architect |
| Hosting | No staging or production environment, database or media store chosen (D-DB-2, D-DB-3) | Launch date | Out of M1 scope; plan in M2 | Owner + ops |

## 2. Prioritised implementation plan

Each task is a separate branch and PR with the full test set and an agent browser checklist
(non-admin editor, draft and published isolation, logged-out access, three viewports).

### Essential for launch

| # | Task | Contents | Depends on | Size |
|---|---|---|---|---|
| CA-1 | **Content model foundation** | ADR-0003; global settings; two-level page-tree navigation with `hideInNav`; footer from global; page types `assurer-division-page` and `assurer-product-category-page`; piece types `assurer-product`, `assurer-organization`, `assurer-person`, `assurer-location`; `@apostrophecms/file` fields; demo seed updated (labelled "Demo") | D-CONTENT-1, -2, -8 | L |
| CA-2 | **Listing and section widgets** | `assurer-feature-grid`, `assurer-stats`, `assurer-product-list`, `assurer-gallery` (accessible lightbox), `assurer-organizations`, `assurer-people`, `assurer-locations`, `assurer-downloads` | CA-1 | L |
| CA-3 | **SEO plumbing** | SEO fields, canonical, OG, robots meta, environment `noindex`; XML sitemap and robots.txt; 301 trailing slash; soft-redirect 301; legacy redirect map + automated redirect test; Organization and Breadcrumb JSON-LD | D-CONTENT-3, -10 | M |
| CA-4 | **Brand theme and templates** | Tokens (colour, type, spacing) from supplied assets; header, footer, breadcrumbs; responsive layouts; accessibility pass; remove the demo notice on real-content builds | Brand assets (D-CONTENT-12), CA-1 | M–L |
| CA-5 | **Content migration** | Owner-approved copy entered as drafts; images curated, renamed and given alt text; PDFs re-uploaded; owner review and publish; redirect test green | CA-1…CA-4, content supplied, D-CONTENT-4 | L (mostly content work) |
| CA-6 | **Privacy and form go-live items** | `/privacy`; form notice; D-FORM decisions applied; map and font privacy | D-FORM-1…5, DPO | S |
| CA-7 | **Launch readiness** (M2, with hosting) | Staging; link check; Lighthouse and axe; Search Console baseline and post-launch checks | D-DB-2, D-DB-3, hosting | M |

### Desirable later

| Task | Trigger |
|---|---|
| Per-company pages (`/group/<slug>`) | Each company has more than one paragraph (D-CONTENT-2) |
| News section | At least 3 articles ready (D-CONTENT-6) |
| Sustainability page and certifications | Verified evidence (D-CONTENT-5) |
| Careers page | Recruiting content |
| Additional languages | D-CONTENT-7 |
| Product structured data and product show pages | Accurate product data |
| Editor-managed redirects (`@apostrophecms/redirect`) | Editors need to manage redirects |
| AI-assisted drafting | Its own ADR ([content model §8](./apostrophe-content-model.md#8-future-ai-assisted-page-composition-design-only-nothing-implemented)) |
| Photography refresh | Budget |

## 3. Recommended next engineering task

**CA-1, content model foundation**, as the next free task ID (expected `m1-014`), in a **new
Claude Code session**, once the owner has decided D-CONTENT-1, D-CONTENT-2 and D-CONTENT-8 (and
approved ADR-0003). CA-1 does not need brand assets or final copy: it uses demo content labelled
"Demo".
