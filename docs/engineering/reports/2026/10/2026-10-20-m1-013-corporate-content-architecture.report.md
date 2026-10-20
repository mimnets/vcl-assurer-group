# m1-013 — WordPress inventory and corporate content architecture

| | |
|---|---|
| **Task** | m1-013 |
| **Date** | 2026-10-20 |
| **Scope** | Read-only inventory of www.assurerworld.com and a proposed information architecture, Apostrophe content model, SEO and migration plan, editorial and design requirements, and implementation plan (WS-5 planning). Documentation only. |
| **Prompt** | [2026-10-20-m1-013-corporate-content-architecture.prompt.md](../../../prompts/2026/10/2026-10-20-m1-013-corporate-content-architecture.prompt.md) |
| **Branch / commit** | `docs/m1-013-corporate-content-architecture` from `origin/main` `ad5253b`. The commit is the one that adds this report. |
| **Related** | [ADR-0001](../../../../architecture/decisions/ADR-0001-cms-platform-and-starter.md) · [ADR-0002](../../../../architecture/decisions/ADR-0002-database-strategy.md) · [m1-012 report](./2026-10-20-m1-012-form-operations-and-privacy.report.md) · PR #14 · D-GIT-11 (closed), D-GIT-12, D-CONTENT-1…12 |

## Requirements

Summary of the prompt:

- Start-of-session checks: read the governing documents, fetch `origin/main`, verify the PR #14
  merge and its five hosted CI jobs, confirm `m1-013` is the next ID.
- A read-only inventory of the live WordPress site: respect robots.txt and request rates; no
  login, form submission, scanning or bulk media download; classify findings V / D / I / M; never
  invent company facts.
- A URL inventory with the listed columns, review candidates, and canonical and redirect needs.
- A recommended sitemap and navigation, decided from the inventory.
- A content model built on existing modules and Community Edition features, database-neutral.
- Editorial journeys, a component inventory, design and accessibility requirements, and the
  brand assets to be supplied (none invented).
- An SEO and migration plan that separates implemented from planned features.
- A design for future AI-assisted drafting (no implementation).
- Risks, gaps and a prioritised plan (launch vs later).
- Verification, records, a feature branch, push and a compare URL. No merge or deploy.

## Work completed

### Phase A — start-of-session verification

- Read AGENTS.md, CLAUDE.md, STANDARDS.md, the decision register, INDEX, the M1 handoff and plan,
  ADR-0001, ADR-0002, the m1-012 report and every project module definition.
- Working tree clean on `feat/m1-012-form-operations`. `git fetch` brought `origin/main` to
  **`ad5253b0534147f618a3477b9401f13aaa023fbc`** ("Merge pull request #14 …"). Local `main`
  fast-forwarded; the branch `docs/m1-013-corporate-content-architecture` was cut from it.
- **PR #14** (GitHub REST API, read-only): `closed`, `merged: true`, merged
  2026-10-20T09:54:46Z, merge commit `ad5253b`, head `c2a29b5`. The merge parents are `1978449`
  and `c2a29b5`, and `git diff c2a29b5 ad5253b` is empty, so the merged tree equals the reviewed head.
- **Hosted CI.** `gh` is not installed, so the public REST API was used:

  | Run | Event | SHA | Jobs (lint, build, test, secrets, audit) |
  |---|---|---|---|
  | [39404115526](https://github.com/mimnets/vcl-assurer-group/actions/runs/39404115526) | pull_request | `c2a29b5` | all `completed / success` |
  | [39404134529](https://github.com/mimnets/vcl-assurer-group/actions/runs/39404134529) | push to `main` | `ad5253b` | all `completed / success` |

  Job logs were not read (they need authentication).
- `m1-013` was confirmed as the next free ID (INDEX "Next free task ID").

### Phase B and C — WordPress inventory

[docs/content/wordpress-site-inventory.md](../../../../content/wordpress-site-inventory.md).

- **Method:** robots.txt (disallows only `/wp-admin/`); the core XML sitemap and its 4 child
  sitemaps; one GET per URL at one-second intervals; a Claude in Chrome read of the home page
  (rendered text, menu DOM, counter targets, a desktop screenshot); 9 redirect and 404 probes. No
  admin, login, `wp-json` user or AJAX endpoints were requested. Nothing was submitted and no
  media was downloaded.
- **Coverage:** **29 of 29 sitemap URLs** fetched and read (26 pages, 1 post, 1 category archive,
  1 author archive), **100 %** of what WordPress publishes in its sitemap. Also recorded: 3
  non-sitemap URLs (`/feed/`, `/?p=1`, `/download.php` (linked, not requested)), 8 PDFs and 1 MP4
  (named, not downloaded), about 300 image URLs, 2 external group sites (not inspected) and one
  unreachable domain (`assurer.world`). Partly inspected: Elementor popups and the script-loaded
  hero slides.
- **Key findings:**
  - A small site. Most corporate content sits on one long home page: about text, six service
    cards, nine group-company cards, key figures, goal, vision, mission, values, sustainability.
  - Six product categories under `/style/` and `/health/` with about 45 product lines.
  - Leadership: 17 profiles. Contact page: one Dhaka address and an Elementor Pro form.
  - Downloads: 1 page plus 7 near-duplicates, and a "Lorem ipsum" placeholder card.
  - 10 thin, placeholder or default pages (empty parents, "coming soon" pages, the maintenance
    page, "Hello world!" and its archives).
  - **SEO baseline is low:** no meta descriptions, Open Graph or JSON-LD anywhere; no H1 on 25 of
    29 pages; 404 of 408 images without alt text; no canonical on the archives. English only, no
    hreflang.
  - Content gaps: no About, Services, Sustainability-evidence, careers, news or office-detail pages.
  - The Food & Minerals page is empty, and its home teaser describes cotton.
  - Business claims are recorded as "on the live site" and need owner confirmation: figures
    (15+ offices, 1700+ employees, 108+ export countries, USD 67 Mn), HQ in Dubai, "debt free",
    an in-house laboratory, OEKO-TEX.
  - **Live-site security and privacy observations for the owner:**
    - PHP "Deprecated" notices in every public page expose the hosting account's server path
      (not reproduced).
    - The WordPress username `admin` is published.
    - Individuals' direct phone numbers and emails are published.
    - Google Maps and Google Fonts load without consent.

  The project did not and must not modify the WordPress site.

### Phase D — information architecture

[docs/content/corporate-information-architecture.md](../../../../content/corporate-information-architecture.md).

- **Sitemap and URLs:**
  - Every content URL is kept.
  - `/style` and `/health` become real division pages.
  - New pages: `/about`, `/group`, `/products` (hub), `/services` and `/privacy`.
  - `/sustainability`, `/news`, per-company pages and careers are conditional or later.
  - "Industries" is **not** proposed, because no content supports it.
- **Header:** About · Group companies · Products ▾ (Style / Health groups) · Services ·
  Leadership · Downloads · Contact (button). Navigation comes from the page tree, with
  "hide from navigation". Keyboard and touch behaviour are specified.
- **Languages:** English at launch without a URL prefix. Community Edition locales with prefixes
  can be added later without changing English URLs. RTL stays possible.
- Changes that need owner approval are listed (D-CONTENT-1).

### Phase E — content model

[docs/content/apostrophe-content-model.md](../../../../content/apostrophe-content-model.md).

- **Today (verified in code):**
  - Two page types and the hero, slideshow and product grid/card widgets.
  - Core rich text, image, video, layout and form widgets.
  - One-level navigation; hard-coded footer.
  - No global fields, piece types, SEO fields, sitemap or redirect control.
- **Proposed:**
  - Page types: `assurer-division-page`, `assurer-product-category-page`.
  - Piece types: `assurer-product`, `assurer-organization`, `assurer-person`, `assurer-location`.
  - Field additions to core `@apostrophecms/file`, and global settings.
  - 8 widgets: feature grid, stats, product list, gallery, organizations, people, locations,
    downloads.
  - Later: certifications, news and per-company pages.
- **Reused as is:** hero (also as the CTA band), slideshow, product cards, the form and the core
  widgets. The HTML widget stays disabled.
- Everything uses ordinary Apostrophe documents and relationships, so it is database-neutral.
  PostgreSQL stays development and testing only (D-DB-6). No production database is selected.
- **Candidate dependencies:** `@apostrophecms/seo` 1.7.1, `@apostrophecms/sitemap` 1.5.1 and
  `@apostrophecms/redirect` 1.7.1, all MIT. GHSA-wf43-fpp3-cf65 affects seo ≤ 1.4.2 only. None
  were added (D-CONTENT-10).
- Recommended to record the approved model as **ADR-0003** (D-CONTENT-8).

### Phase F — editorial experience and design

[docs/content/editorial-and-design-requirements.md](../../../../content/editorial-and-design-requirements.md).

- The ten editor journeys are compared, today vs proposed, with the actual gaps:
  - only two page types;
  - no records for products, companies or people;
  - alt text is optional;
  - editors can change Global Styles (D-M0-11);
  - core breakpoint preview is enabled by default but was not checked in the UI here.
- Also covered:
  - the component inventory (implemented vs planned) and template defaults;
  - responsive rules for 375, 768 and 1440 px;
  - typography and spacing principles (no brand values invented);
  - image ratios and minimum sizes;
  - WCAG 2.2 AA requirements;
  - a 14-row table of brand assets and business content the owner must supply or confirm.

### Phase G — SEO and migration

[docs/content/seo-and-migration-plan.md](../../../../content/seo-and-migration-plan.md).

- A full old-to-new URL map:
  - 13 content URLs kept, needing only a trailing-slash redirect;
  - 17 page-level 301s (downloads sub-pages, placeholders, WordPress defaults, the feed,
    `/download.php`), plus one 301 for each of the 9 document and video files.
- Plans for titles, descriptions, canonicals, OG tags, robots, the XML sitemap and JSON-LD
  (Organization, WebSite, BreadcrumbList; Product only with accurate data).
- Also: image renaming and alt text, multilingual rules, internal links, pagination, and a
  launch-validation schedule with Search Console checks.
- Each item is marked Implemented, Core or Planned.
- **Verified locally:** core turns `/x/` into `/x` with a **302**. Core honours `req.statusCode`
  in `serveDeliver`, so a single 301 is feasible. `@apostrophecms/soft-redirect` defaults to 302.
- No live URL was changed and no sitemap was submitted.

### Phase H — future AI drafting (design only)

Content model §8.

- **Verified in the installed core:** `@apostrophecms/ai` and its Anthropic, OpenAI, Google and
  OpenAI-compatible adapters ship inside `apostrophe` 4.34 (MIT). The engine:
  - is inactive until a provider is configured, and reads keys from the environment;
  - validates output against a JSON Schema and caps agent loops;
  - has a permission seam that may only be stricter than `apos.permission.can`;
  - denies AI tool access to user documents;
  - emits a `usage` event per provider response;
  - has a mock mode for tests;
  - is not used by any core feature yet.
- **Design:**
  - the schema is the contract;
  - AI output is saved through normal APIs as the editor, to the **draft only**;
  - the AI places existing records and does not invent facts;
  - a dedicated permission; keys stay server-side;
  - limits and an audit record from the `usage` events;
  - no HTML widget or code fields exist to receive code;
  - no paid builder.
- Nothing was implemented.

### Phase I — risks, gaps and plan

[docs/content/implementation-plan-and-risks.md](../../../../content/implementation-plan-and-risks.md):

- A 17-row risk and gap table.
- **Launch tasks:** CA-1 content model foundation, CA-2 widgets, CA-3 SEO plumbing, CA-4 brand
  theme, CA-5 content migration, CA-6 privacy items, CA-7 launch readiness (M2, with hosting).
- **Later items** have triggers.

### Records

- Prompt archived as given.
- INDEX, decision register, M1 plan and handoff updated.
- `docs/content/` added to the STANDARDS.md layout.
- D-GIT-11 closed. D-CONTENT-1…12 and D-GIT-12 opened.

## Files changed

| Status | Path |
|---|---|
| A | `docs/content/wordpress-site-inventory.md` |
| A | `docs/content/corporate-information-architecture.md` |
| A | `docs/content/apostrophe-content-model.md` |
| A | `docs/content/seo-and-migration-plan.md` |
| A | `docs/content/editorial-and-design-requirements.md` |
| A | `docs/content/implementation-plan-and-risks.md` |
| A | `docs/engineering/prompts/2026/10/2026-10-20-m1-013-corporate-content-architecture.prompt.md` |
| A | `docs/engineering/reports/2026/10/2026-10-20-m1-013-corporate-content-architecture.report.md` |
| M | `docs/engineering/INDEX.md` |
| M | `docs/engineering/STANDARDS.md` (layout: `content/`) |
| M | `docs/engineering/decision-register.md` |
| M | `docs/milestones/m1-execution-plan.md` |
| M | `docs/milestones/m1-handoff.md` |

No code, configuration, dependency or lockfile changes. No historical report was edited.

## Tests executed and actual results

Local, on the branch, server running at `127.0.0.1:3000` (local SQLite):

| Command | Result |
|---|---|
| `npm run lint` | clean (no output from ESLint) |
| `npm run test:smoke` | **14/14** passed |
| `npm run test:workflow` | **15/15** passed |
| `npm run test:persistence` | **7/7** passed |
| `npm run test:unit` | **52/52** passed |
| `npm run build` | not run (no code or asset changes) |
| Link and anchor check over the 6 new docs, INDEX, decision register, handoff, M1 plan and STANDARDS (scratch script, GitHub-style anchors) | **0 broken** in the m1-013 files (after fixing this report's own relative depth). Note: the same check finds **40 pre-existing broken relative links in earlier reports** under `docs/engineering/reports/` (for example the m1-012 report's `../../../milestones/…`, one level too shallow). Historical reports are not rewritten (STANDARDS.md); a correction note is left to the owner |
| Secret and PII scan of the diff (pattern search for keys, tokens, phone numbers, emails, server paths and the leadership names) | No findings. The only pattern hits were GitHub run IDs. gitleaks is not installed locally; the CI `secrets` job runs it on the PR |

### Browser acceptance

Claude in Chrome, the owner's Chrome, a dedicated MCP tab group (one tab, closed at the end).
**Agent-executed**, not human approval. **Logged out** throughout (live site: public only; local
CMS: no session). No editor account was used: m1-013 changed no UI. Per STANDARDS.md a docs-only task
needs a public-site smoke check. The live-site review is read-only.

| # | Check | Role / viewport | Steps | Expected | Actual | Status | Evidence |
|---|---|---|---|---|---|---|---|
| 1 | Live home page renders and its text is readable | Anonymous / 1440 | Open `https://www.assurerworld.com/`, read the page text | Content readable | Read in full. PHP "Deprecated" notices visible in the page body | PASS | none saved (read-only review) |
| 2 | Live menu and submenus captured | Anonymous / 1440 | Read the menu links through the DOM | All items and targets | 6 top-level items and 4 submenus captured (inventory §3) | PASS | inventory §3 |
| 3 | Live key-figure counters | Anonymous / 1440 | Read the counter targets and titles through the DOM | Values identified | 15, 1700, 108, 67 with their titles | PASS | inventory W01 |
| 4 | Live desktop layout | Anonymous / 1440 | Screenshot | Page renders; no horizontal overflow | Renders; `scrollWidth` = `clientWidth` | PASS | none saved |
| 5 | Live "translate" bottom-bar icon | Anonymous / 1440 | Click the icon | A language option appears | Nothing visible appeared; content not determined | NOT TESTED | Reason: inconclusive. Recorded as "D" in the inventory |
| 6 | Live tablet and mobile layouts | Anonymous / 768, 375 | Resize the window | Layouts checked | Resizing had no effect (the viewport stayed 1440 px, likely a maximised window) | NOT TESTED | Reason: the tool could not set the viewport. Not needed for an inventory |
| 7 | Local CMS home renders, logged out | Anonymous / 1440 | Open `http://127.0.0.1:3000/` | Home renders, demo notice shown | Title "Home", H1 present, demo notice shown | PASS | — |
| 8 | Local: no admin UI or user data when logged out | Anonymous | Check for the admin bar and the login link | No admin bar; login link shown | No admin bar; "Log in" link present | PASS | — |
| 9 | Local: drafts not public (HTTP, not browser) | Anonymous | `GET /api/v1/@apostrophecms/page?aposMode=draft`; `GET /api/v1/@apostrophecms/user` | Refused | 403 and 404 | PASS | curl |
| 10 | Local SEO gaps confirmed (HTTP) | Anonymous | `GET /robots.txt`, `/sitemap.xml`; read head tags in Chrome | Gaps as documented | 404, 404; no meta description or canonical on the home page | PASS (confirms the documented gap) | — |
| 11 | Local trailing-slash behaviour (HTTP) | Anonymous | `GET /m0-test-page/` | Redirect documented | 302 → `/m0-test-page`; the slash-less URL returns 200 | PASS (confirms the documented 302) | curl |
| 12 | Cleanup | — | Close the tab; check nothing was created | No test content or accounts | Tab closed; no content, accounts or submissions created; no screenshots saved | PASS | — |

Not verified: core breakpoint preview in the editor UI; live-site popups other than translate; the
external group sites; the PDFs, MP4 and gallery images (not downloaded).

## Security observations

- **Live WordPress site (not this project):**
  - PHP notices disclose an absolute server path in public HTML.
  - The author archive publishes the `admin` username.
  - The `x-powered-by` header shows the PHP version.
  - Individuals' contact details are published.
  - Google Maps and Google Fonts load without consent.

  These were reported in inventory §9 for the owner. No further probing was done.
- **New site (design):**
  - New inputs are typed schema fields only: `url` fields with scheme checks, sanitised rich text,
    no HTML widget.
  - Leadership contact fields are off by default.
  - Self-hosted fonts and link-out maps are recommended.
  - `@apostrophecms/seo` must be ≥ 1.5.0 (GHSA-wf43-fpp3-cf65), with its analytics fields unused.
- **AI drafting (later):** keys stay server-side; draft only; a dedicated permission; an audit
  record per call.
- No secrets, personal data or raw captures were added to the repository. Raw HTML stayed in the
  session scratchpad.

## Known limitations

- The inventory reflects 2026-10-20. Popups and script-rendered slides were only partly inspected.
- Documents and media were catalogued by name, not opened, so their content and currency are
  unverified.
- No Search Console or analytics data was available, so the traffic and backlink value of old URLs
  is unknown. The plan asks the owner for a baseline.
- Live-site mobile and tablet layouts were not checked (row 6).
- Business facts (figures, entities, certifications, locations) are recorded as published on the live
  site and are **not verified**.
- 40 relative links in earlier reports are broken (pre-existing; see the link-check row). Not fixed, because historical reports are never rewritten.
- Everything under "proposed" is a design. Nothing in the content model, IA or SEO plan is
  implemented.

## Unresolved decisions

See the [decision register](../../../decision-register.md):

- D-CONTENT-1: sitemap and navigation.
- D-CONTENT-2: group pages and entity facts.
- D-CONTENT-3: legacy pages and the 301 map.
- D-CONTENT-4: leadership privacy.
- D-CONTENT-5: sustainability evidence.
- D-CONTENT-6: news.
- D-CONTENT-7: languages.
- D-CONTENT-8: content model as ADR-0003 (architecture gate).
- D-CONTENT-9: profile video.
- D-CONTENT-10: SEO dependencies (dependency gate).
- D-CONTENT-11: publishing workflow.
- D-CONTENT-12: brand assets and content supply.
- D-GIT-12: merge this PR.

Still open from earlier tasks and relevant here: D-M0-11 (Global Styles), D-FORM-1…5 (form go-live)
and D-DB-2/D-DB-3 (hosting).

## Rollback guidance

Documentation only. Revert the commit, or close the PR unmerged. No data, configuration or
dependency changed. The local database was only touched by the existing test suites, as in every
task.

## Recommended next step

1. The owner reviews `docs/content/`, opens and merges the PR (D-GIT-12), and decides D-CONTENT-1, -2
   and -8 (plus -10 before SEO work).
2. Then **`m1-014` — CA-1, the content model foundation** (ADR-0003, global settings, two-level
   navigation, the two page types, four piece types, demo seed). Start it in a **new Claude Code
   session**. Page-by-page implementation waits for the architectural review.
