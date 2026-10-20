# m1-014 — Corporate content model foundation (CA-1)

| | |
|---|---|
| **Task** | m1-014 |
| **Date** | 2026-10-20 |
| **Scope** | ADR-0003 and the content-model foundation: four piece types, two page types, Global Content fields, a two-level page-tree menu, footer from Global Content, a guarded fictional demo seed, and automated and agent-executed browser tests. |
| **Prompt** | [2026-10-20-m1-014-content-model-foundation.prompt.md](../../../prompts/2026/10/2026-10-20-m1-014-content-model-foundation.prompt.md) |
| **Branch / commit** | `feat/m1-014-content-model-foundation` from `origin/main` `15ef1a3`. The commit is the one that adds this report. |
| **Related** | [ADR-0003](../../../../architecture/decisions/ADR-0003-corporate-content-model.md) · [ADR-0001](../../../../architecture/decisions/ADR-0001-cms-platform-and-starter.md) · [ADR-0002](../../../../architecture/decisions/ADR-0002-database-strategy.md) · [m1-013 report](./2026-10-20-m1-013-corporate-content-architecture.report.md) · PR #15 · D-CONTENT-1, -2, -8 (closed), D-GIT-12 (closed), D-GIT-13 |

## Requirements

Summary of the prompt:

- **Start-of-session checks.** Verify PR #15 and both hosted CI runs. Use a new branch and the
  next free ID.
- **ADR-0003** covering the ten listed topics.
- **Piece types:** `assurer-product`, `assurer-organization`, `assurer-person` and
  `assurer-location`.
  - The person record must not expose personal contact details by default.
  - No invented facts.
- **Page types:** `assurer-division-page` and `assurer-product-category-page`, usable by
  ordinary editors.
- **Global Content fields** and a two-level, accessible, page-tree menu with hide-from-nav.
- **Demo seed:**
  - idempotent, fictional and labelled;
  - refused in production;
  - non-destructive;
  - never run against the owner's database automatically.
- **Automated tests** with negative cases on temporary databases and media.
- **Agent-executed browser checks** B1–B20 as a non-admin editor.
- **Documentation**, then a feature-branch push. No merge, no deployment, no SEO packages, no
  WordPress migration.

## Work completed

### Phase A — start-of-session verification

- Read every document the prompt lists.
- `git fetch`: **`origin/main` = `15ef1a32b3d87353c855d23d31429612acfd734d`**, "Merge pull request
  #15". Its parents are `ad5253b` and `42c4c98` (the reviewed m1-013 head).
- **PR #15**, read through the public GitHub REST API:
  - `closed`, `merged: true`, merged 2026-10-20T10:45:46Z;
  - merge commit `15ef1a3`, head `42c4c98`.
- **Hosted CI** (public REST API; `gh` is not installed):

  | Run | Event | SHA | lint | build | test | secrets | audit |
  |---|---|---|---|---|---|---|---|
  | [39410207143](https://github.com/mimnets/vcl-assurer-group/actions/runs/39410207143) | pull_request | `42c4c98` | success | success | success | success | success |
  | [39410225089](https://github.com/mimnets/vcl-assurer-group/actions/runs/39410225089) | push to `main` | `15ef1a3` | success | success | success | success | success |

  Job logs were not read (they need authentication).
- `m1-014` was confirmed free (INDEX "Next free task ID").
- The working tree was clean on `docs/m1-013-corporate-content-architecture`.
- Local `main` was fast-forwarded to `15ef1a3`, and `feat/m1-014-content-model-foundation` was
  created from it.

### Phase B — ADR-0003

[ADR-0003](../../../../architecture/decisions/ADR-0003-corporate-content-model.md) is
**Accepted**, on the owner's approval of D-CONTENT-8 in the prompt. It records the model as
built, the ten requested topics, the differences from the m1-013 proposal, and the rejected
alternatives.

### Phase C — piece types

All four piece types:

- extend `@apostrophecms/piece-type`;
- sort by `displayOrder` (0–9999, default 100), then title;
- have distinct admin-bar shortcuts (G,R · G,Z · G,E · G,L);
- have no piece pages and no public API projection, so the REST API answers anonymous
  visitors with 404.

"Publication state" is core's draft/publish, not a field.

| Module | Fields | Relationships | Validation and privacy |
|---|---|---|---|
| `assurer-product` | `displayTitle`, `summary` (≤ 300), `description` (area: rich text only, limited toolbar) | `_categories` → `assurer-product-category-page`; `_image` (1); `_gallery` (≤ 12) | No price, specification or certification fields |
| `assurer-organization` | `shortDescription` (≤ 300), `websiteUrl` | `_logo` (1); `_parentOrganization` (1); `_locations` (`relationshipReverse` of the location's `_organization`) | `websiteUrl` must be absolute http/https (`lib/web-url.js`, `beforeSave`); core's launder already drops `javascript:`/`data:`. An organization cannot be its own parent |
| `assurer-person` | `title` labelled "Full name", `jobTitle`, `bio` (≤ 600) | `_organization` (1); `_photo` (1) | **No phone or email fields at all** (D-CONTENT-4). Help texts ask for consent |
| `assurer-location` | `city`, `country` (required), `address` object (line1, line2, postalCode, region), `showContact` (default off), `publicPhone` (pattern), `publicEmail` (email type) | `_organization` (1) | No coordinates and no map integration. Contact details are business-only and shown only when switched on |

### Phase D — page types

- **`assurer-division-page`** ("Division / overview"):
  - `intro` area, `_organizations` and a `main` area (`lib/area.js`);
  - a `@apostrophecms/page:beforeSend` handler loads the child category pages in tree order,
    using the request's own mode, so visitors get only published pages.
- **`assurer-product-category-page`** ("Product category"):
  - `summary`, `_heroImage`, `intro` and `main` areas;
  - `_products` is a reverse relationship, sorted by display order and then title.
- Registered in `modules/@apostrophecms/page/index.js` beside "Default" and "Home". Existing
  pages and URLs are unchanged.

### Phase E — Global Content and navigation

- **`modules/@apostrophecms/global/index.js`** groups the fields into three tabs:
  - **Contact:** email, phone, postal address.
  - **Footer:** footer text, copyright name, `_footerLocations`, social links (network +
    http/https URL).
  - **Navigation:** an optional header button built from `linkFields()`.
  - Every field is empty by default, and the layout shows only filled fields. The existing
    footer line stays as the fallback.
- **Page-tree builders:** `ancestors: { children: { depth: 2 } }`. Core's `children` query
  already leaves out pages marked "Hide in Navigation" (`orphan`, a core field) and, for
  visitors, anything unpublished or archived.
- **`views/layout.jsx`:**
  - two-level `<nav aria-label="Main">` with `aria-current="page"` and a current-branch style;
  - each parent has a separate expand button with `aria-expanded`/`aria-controls`;
  - a Menu button for widths below 1024 px;
  - a skip link and `main#main-content`;
  - the footer from Global Content, with `tel:`/`mailto:` links.
- **`modules/asset/ui/src/nav.js`** (disclosure pattern):
  - Enter/Space/click toggle a submenu, and only one is open at a time;
  - Escape closes it and returns focus;
  - an outside click closes it;
  - on desktop, focus leaving a submenu closes it.
  - Without JavaScript, all links stay visible.
- **`_corporate.scss`:**
  - hover opens submenus only with a real pointer (`hover: hover`) at ≥ 1024 px;
  - 44 px tap targets;
  - visible `:focus-visible` outlines;
  - the mobile panel is absolutely positioned inside the header, so there is no horizontal
    overflow.

  The old flat `.assurer-nav ul` rule was moved into it.

### Phase F — demo seed

`node app assurer-demo:seed-corporate` (`modules/assurer-demo/lib/corporate.js`, `lib/guard.js`):

- **Refuses** under `NODE_ENV=production`, even with the flag. It checks before Apostrophe
  connects to the database.
- **Runs** on a temporary SQLite database (OS temp or `RUNNER_TEMP`). On any other database it
  runs only with `--dev-database`.
- **Creates only missing records.** Pieces are matched by title and pages by slug, archived ones
  included. It never edits, overwrites or restores anything.
- **Global Content** is filled only while its contact and footer fields are all empty and it has
  no unpublished edits.
- **Contents**, all fictional and labelled:
  - 2 organizations, 2 locations and 1 person;
  - `/demo-style` with 2 category pages;
  - 4 products, one deliberately left unpublished;
  - demo footer text and an `example.com` email.
- The m0 `assurer-demo:seed` task is unchanged.
- The owner's database was **not** touched. Every run in this task used temporary databases.

### Phase G/H — tests

- **New `scripts/content-model-test.mjs`.** It runs only from `test:ci`
  (`CONTENT_TEST_DISPOSABLE=1`), with an admin and an editor, before and after a restart:
  **74 checks** in the main run and **6** after the restart.
- **New `assurer-test:ensure-editor`.** Same guard as `ensure-admin`; the password is generated
  per CI run and masked.
- **New `scripts/content-model.test.mjs`.** Unit tests for the URL rule, ordering, phone
  pattern, seed guard, editor guard and the demo data's labels.
- **`run-ci-tests.mjs`** gains:
  - the editor step;
  - the corporate seed, run **twice** (the second run must add nothing);
  - the content suite and its post-restart check.

## Files changed

| Status | Path |
|---|---|
| M | `app.js` (registers the six new modules) |
| A | `lib/web-url.js`, `lib/display-order.js`, `lib/contact.js` |
| A | `modules/assurer-product/index.js`, `modules/assurer-organization/index.js`, `modules/assurer-person/index.js`, `modules/assurer-location/index.js` |
| A | `modules/assurer-division-page/index.js`, `modules/assurer-division-page/views/page.jsx` |
| A | `modules/assurer-product-category-page/index.js`, `modules/assurer-product-category-page/views/page.jsx` |
| A | `modules/@apostrophecms/global/index.js` |
| M | `modules/@apostrophecms/page/index.js` (types, page-tree builders) |
| M | `views/layout.jsx` (two-level menu, skip link, footer from Global Content) |
| A | `modules/asset/ui/src/nav.js`, `modules/asset/ui/src/scss/_corporate.scss` |
| M | `modules/asset/ui/src/index.js`, `modules/asset/ui/src/index.scss`, `modules/asset/ui/src/scss/_assurer.scss` (old one-level nav rule removed) |
| M | `modules/assurer-demo/index.js`; A `modules/assurer-demo/lib/corporate.js`, `modules/assurer-demo/lib/guard.js` |
| M | `modules/assurer-test/index.js`, `modules/assurer-test/lib/guard.js` (`temporarySqliteReason`, `editorRefuseReason`; `refuseReason` behaviour unchanged) |
| M | `scripts/run-ci-tests.mjs`; A `scripts/content-model-test.mjs`, `scripts/content-model.test.mjs` |
| A | `docs/architecture/decisions/ADR-0003-corporate-content-model.md`; M `docs/architecture/decisions/README.md` |
| A | this report; `docs/engineering/prompts/2026/10/2026-10-20-m1-014-content-model-foundation.prompt.md` |
| M | `docs/engineering/INDEX.md`, `docs/engineering/decision-register.md`, `docs/milestones/m1-execution-plan.md`, `docs/milestones/m1-handoff.md`, `docs/content/apostrophe-content-model.md`, `docs/content/editorial-and-design-requirements.md` |

No dependency, lockfile, CI workflow, `.env.example` or audit-baseline change.

## Tests executed and actual results

All runs are local (Windows 11, Node 24.21.0) on 2026-10-20, **after** the last code change.
The line-ending normalization at the very end changed no content.

| # | Command | Result | Status |
|---|---|---|---|
| T1 | `npm run lint` | exit 0, no warnings | PASS |
| T2 | `npm run test:unit` | 61/61 (52 existing + 9 new) | PASS |
| T3 | `npm run test:ci` (throwaway SQLite and media, port 3100) | ensure-admin · ensure-editor · m0 seed · corporate seed (13 created) · corporate seed again ("already present; nothing changed") · smoke **14/14** · workflow **15/15** · **content model 74/74** · restart · persistence **7/7** · **content persistence 6/6** · forms **77/77** · security **65/65** · HTTPS proxy mode **15/15**; "CI test run passed" | PASS |
| T4 | `npm run build` | exit 0 | PASS |
| T5 | `npm run audit:check` | 43 findings (0 critical, 5 high, 38 moderate), all covered by the baseline; "Audit check passed". Unchanged, because no dependency changed | PASS |
| T6 | gitleaks **8.30.1** Windows (SHA-256 `d29144de…afc4e`, checked against the release checksums; the Linux entry equals the hash pinned in `ci.yml`), `dir --redact` on each of the 28 changed and new code files | 28/28 "no leaks found". A scan of whole directories also reported the git-ignored local `.env`, which is not tracked and not part of the change | PASS |
| T7 | Seed refusal (manual) | `APOS_DB_URI=sqlite://./data/x.db … seed-corporate` → refused before connecting (no file created). `NODE_ENV=production … --dev-database` → refused | PASS |
| T8 | Hosted CI on this branch | Runs on `pull_request` only, so it starts when the owner opens the PR | NOT TESTED (pending PR) |

**Negative and integrity cases in the content suite (T3), as asserted:**

- **Anonymous visitors:**
  - REST list of all four piece types → 404;
  - product create → 403;
  - Global Content change → 403;
  - attachment upload → 403.
- **Editor:**
  - user list → empty result;
  - creating an admin user → 403.
- **Field validation:**
  - `javascript:` website never stored;
  - `mailto:`, `ftp:` and `tel:` websites → 400;
  - organization as its own parent → 400;
  - missing city, invalid email and invalid phone → 400;
  - missing title → 400;
  - non-numeric display order → 400, and 99999 clamped to 9999;
  - over-long text capped at `max` (core truncates server-side, and the UI blocks it first);
  - `<script>` and `javascript:` links stripped from rich text and absent from the page;
  - a relationship to a missing ID is not stored.
- **Draft and published:**
  - a draft page → 404;
  - a draft-only product, an unpublished organization and an unpublished page are hidden from
    visitors;
  - an unpublished edit stays hidden.
- **Navigation:** reorder changes the menu; "Hide in Navigation" removes the page but keeps its
  URL; `aria-current` is present.
- **Archive:**
  - an archived product disappears, and the page still renders;
  - after restore and publish, it reappears;
  - archiving an organization in use leaves the person loading with no link and the division
    page rendering;
  - restore brings the organization back.
- **Global Content:** non-web social link → 400; invalid phone → 400; a draft is not public;
  after publishing it is in the footer; it can be restored.
- **Demo seed:** no duplicates after two runs, and the demo draft product is hidden.
- **Existing content:** M0 home widgets still render.

### Browser acceptance

- **Browser and method:** Claude in Chrome in the owner's Chrome, in a dedicated MCP tab group
  (closed afterwards). **Agent-executed; this is not human acceptance.**
- **Account:** `m1-014-browser-editor`, role **editor**, created with the supported
  `node app @apostrophecms/user:add <name> editor` task. A test admin was created with
  `ensure-admin` but was used only by a diagnostic API read (see B4).
- **Instance:** disposable, at `http://127.0.0.1:3002`:
  - a copy of this branch in the session scratch directory, with its own temporary SQLite
    database and its own `public/uploads`, so the owner's database and media were never touched;
  - development mode;
  - seeded with `assurer-demo:seed` and `seed-corporate`.
  - The whole instance (database, media, copy, generated passwords) was deleted afterwards.
- **Checklist:** written before running, from what the task changed. Evidence: screenshots
  viewed in-session, not saved.

| # | Check (what a user does) | Role / viewport | Steps | Expected | Actual | Status | Evidence |
|---|---|---|---|---|---|---|---|
| B1 | Editor login | editor / 1440 | Type username and password, click Login | Admin bar with the new managers; no Users | Products, Organizations, People and Locations in the admin bar; no Users item | PASS | — |
| B2 | Create a division page | editor / 1440 | Pages → New Page → Type "Division / overview" → title → Save Draft | Draft page with the division fields | Fields: Introduction, Group organizations, More sections; saved as Draft | PASS | — |
| B3 | Create a product category page | editor / 1440 | New Page → Type "Product category" → title, summary → Save Draft → drag it under the division | Draft category page under the division | Created and moved. The slug became `/b2-test-division/b3-test-category`. Core showed a "notfound" toast after the drag, because its UI requests the never-published version (404 in the server log); the move persisted | PASS (observation O1) | — |
| B4 | Add a Product | editor / 1440 | Products → New → title, summary; Placement → category; Images → upload; Save Draft | Draft product linked to the category | First try: the category was **not stored**. The picker greys out unpublished pages (core), and the click on the greyed entry did nothing, which an admin API read confirmed. After B3 was published, the category was selectable and stored | PASS (observation O2) | — |
| B5 | Add an Organization | editor / 1440 | Organizations → New → name, description, website `mailto:…` → Publish; then `https://…` → Publish | `mailto:` refused with a message; `https` saved | "Website addresses must start with https:// or http:// (websiteUrl)." Then published | PASS | — |
| B6 | Add a Person | editor / 1440 | People → New → name, position, organization, bio → Publish | No phone or email fields; published | The form has name, position, organization, photo, bio and display order only; published | PASS | — |
| B7 | Add a Location | editor / 1440 | Locations → New → name, city, country, organization; Public contact: phone "call us" → Publish; fix → Publish | "Show contact details" off by default; invalid phone blocked | Default "No"; inline "INVALID" and "1 error"; published with `+1 555 0177` | PASS | — |
| B8 | Create and edit relationships | editor / 1440 | Product→category, person→org, location→org, division→org (page settings), Global→footer location and header button→page; later change the product's image | Links saved and shown | All saved. Division page showed the organization; the reverse location link was asserted by the API suite | PASS | — |
| B9 | Upload and replace an image | editor / 1440 | Media library → file input → title + alt text → Save → select; later remove it and pick "DEMO – Business Cover" → Update | New image stored with alt; replacement published | Upload stored with alt "B9 uploaded alt text". The public page later showed the replacement with its alt "Placeholder product image: business cover". The upload used the extension's file-input upload, not a native file picker | PASS | — |
| B10 | Preview drafts | editor / 1440 | Open the draft division and category pages while logged in | Drafts render for the editor | Draft division with its category card; draft product with its image on the category page; draft header button in the preview | PASS | — |
| B11 | Publish records and pages | editor / 1440 | Publish division (in context), category (in context), product (manager), Global (Update) | Public after publishing | All published ("Your changes have been published") | PASS | — |
| B12 | Unpublished records stay hidden | logged out / 1440 | Log out; open the category page while the product, Global changes and later a product summary edit were unpublished | None visible | Draft product absent; draft footer text, footer location and header button absent; later "UNPUBLISHED summary edit" absent while the published summary showed | PASS | — |
| B13 | Change an allowed Global field | editor / 1440 | Global Content → Footer text, footer location; Navigation → header button "Contact" → Save Draft, later Update | Editor can change and publish | Saved as a draft, then published; visible after logout | PASS (finding F2 fixed) | — |
| B14 | Edit and reorder navigation | editor + logged out / 1440 | Drag the division above "Demo Style Division"; set "Hide in Navigation" on B3 and publish; hover; keyboard Tab → Enter → Tab → Escape | Order changes; hidden page leaves the menu; menu usable by keyboard and hover | New order shown publicly; B3 left the menu but stayed reachable; hover opened the submenu; Enter set `aria-expanded="true"` with a visible focus ring; Escape closed it (`display: none`) and returned focus to the toggle | PASS | — |
| B15 | Open and use the mobile menu | editor / Apostrophe "Mobile" preview | Click Menu, then the submenu chevron | Panel opens; accordion opens | Opened; the submenu expanded inline; the toggle is 93×44 px, the expand button 44×44 px, sublinks 356×44 px | PASS | — |
| B16 | Tablet and mobile layouts | editor / Apostrophe preview | Breakpoint preview "Tablet" and "Mobile" on the home and division pages; measure overflow | No horizontal overflow; one or two columns; Menu button below 1024 px | Mobile container 404 px: no element outside it, one column. Tablet preset 1014 px wide: two columns, Menu button, no overflow. `resize_window` did not change the 1440 px viewport (maximized window), so exact 768 px and 375 px widths were **not** run. Apostrophe's preview rewrites media queries, so it approximates real devices | PASS for the preview widths; 768/375 px NOT TESTED | — |
| B17 | No unauthorized Users access | editor / 1440 | Look for Users in the admin bar; open `/api/v1/@apostrophecms/user` in the browser | No user data | No Users item; the API returned `{"pages":0,"currentPage":1,"results":[]}` | PASS | — |
| B18 | Log out | editor / 1440 | User menu → Log Out | Logged out | Login button shown, no admin bar | PASS | — |
| B19 | Public content after logout | logged out / 1440 | Open the division and category pages and the home page | Published content only | Intro, category card, organization, product with the replaced image, footer and Contact button; no drafts | PASS | — |
| B20 | Archive test records and verify cleanup | editor → logged out / 1440 | Archive B4, B5, B6, B7, B2 (with B3) and the B9 image through the managers; log out; reload pages | Gone from the public site, nothing broken | Archived pages → 404; the menu and footer no longer list them; the header button hid itself (its page was archived); the demo division still renders. Archiving B4 dropped its own pending unpublished test edit (core warns about this). Leftovers: none; the whole disposable instance was deleted | PASS | — |

**Defects found during the browser run and fixed in this task:**

- **F1.** The new managers' default admin-bar shortcuts clashed with Pages and Forms
  (`Shortcut conflicts detected` in the server log). Fixed with explicit shortcuts; the warning
  no longer appeared after a restart.
- **F2.** The Copyright help text showed `"© ".` because `<year> <name>` was read as HTML.
  Reworded and re-checked in the UI.
- **F3.** Category-card headings took the browser's purple `:visited` colour, and organization
  names were centred. Fixed in CSS and re-checked.

**Observations (core behaviour, not changed):**

- **O1.** Moving a never-published page shows a "notfound" toast; the move succeeds. The
  editor modal for a never-published product also logs a harmless 404 for its published
  version.
- **O2.** Relationship pickers only offer published pages, so editors publish a category page
  before assigning products to it. This is noted in the editorial requirements.

**Accessibility not covered:** axe or Lighthouse were not run (no approved tool installed), and
there was no screen-reader pass. The keyboard path was checked for the menu only.

## Security observations

- **No new public routes.** The division page's extra query runs in the visitor's own mode, so
  visitors only ever get published documents.
- **Input surface is typed fields only:**
  - website and social URLs are restricted to http/https;
  - phone numbers use a pattern;
  - emails use the email type;
  - rich text is sanitized by core;
  - there is no HTML widget and no free CSS.
- **Pieces are not exposed publicly** through the REST API (no `publicApiProjection`).
- **Personal data:** no personal contact fields exist. Location contact details are off by
  default. Every demo record is fictional and uses reserved `example.com` / `example.org`
  domains.
- **Test credentials:** generated per run and masked in Actions. The browser-run passwords were
  kept in the scratch directory and deleted afterwards. Nothing is in tracked files (gitleaks
  T6).
- **Editors can change Global Content**, including the footer and header button (core default,
  same class as D-M0-11). Recorded under D-CONTENT-11.

## Known limitations

- **Not built:** listing widgets (CA-2), SEO fields (CA-3), the downloads library and
  file-piece fields, and brand styling (placeholder theme).
- **Relationship picker:** cannot target unpublished pages (O2).
- **Long text:** over-long input is truncated server-side when it bypasses the UI, not
  rejected.
- **Labels:** plain English, not yet in the `project:` i18n namespace.
- **Not verified:**
  - layouts at exact 768 px and 375 px widths (B16);
  - axe or Lighthouse results;
  - hosted CI for this branch (pending the PR).

## Unresolved decisions

See the [decision register](../../../decision-register.md):

- **D-GIT-13**: review and merge this PR.
- **D-CONTENT-4**: person contact fields stay excluded.
- **D-CONTENT-11**: editor publishing and Global access.
- **D-CONTENT-10**: SEO packages.
- **D-CONTENT-12**: brand and content.
- **D-CONTENT-3, -5, -6, -7, -9**: unchanged.

## Rollback guidance

Revert the commit, or do not merge the PR. There is no migration, and no existing document
changes shape. Documents created with the new types would stay in the database without a
manager. Archive them through the UI before reverting if they matter. The page-tree builders
fall back to core defaults.

## Recommended next step

1. The owner reviews this report, opens the PR from `feat/m1-014-content-model-foundation`,
   checks the five CI jobs, and merges it (D-GIT-13).
2. A human runs a usability pass of the editor journeys.
3. Start **CA-2** (listing and section widgets, next free ID `m1-015`) in a **new Claude Code
   session**. Decide D-CONTENT-10 (SEO packages) before CA-3.
