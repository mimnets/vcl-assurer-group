# m1-015 — Listing and section widgets (CA-2)

| | |
|---|---|
| **Task** | m1-015 |
| **Date** | 2026-10-29 |
| **Scope** | The eight CA-2 widgets, required alt text in project widgets, the `project:` i18n namespace, demo seed additions, tests, and agent-executed browser acceptance. |
| **Prompt** | [2026-10-29-m1-015-listing-and-section-widgets.prompt.md](../../../prompts/2026/10/2026-10-29-m1-015-listing-and-section-widgets.prompt.md) |
| **Handoff** | [m1-015-handoff.md](../../../../milestones/m1-015-handoff.md) |
| **Branch / commit** | `feat/m1-015-listing-and-section-widgets` (from `origin/main` `4dc8855`; first commit `fa5dc99` is the handoff). **Nothing committed yet:** commit, push and PR wait for the owner (D-GIT-14). |
| **Related** | [ADR-0003 status note](../../../../architecture/decisions/ADR-0003-corporate-content-model.md#status-note-m1-015-2026-10-29-ca-2-widgets-built) · [content model](../../../../content/apostrophe-content-model.md) · [m1-014 report](./2026-10-20-m1-014-content-model-foundation.report.md) · D-CONTENT-8 · D-SEC-4 (new) · D-GIT-13 (closed) · D-GIT-14 (new) |

## Requirements

From the handoff (§3–§6): eight widgets as `modules/assurer-*-widget` with JSX templates, added
to `lib/area.js`; typed fields, `linkFields()` links, no HTML widget; listings never show draft,
unpublished or archived records to visitors; people never show contact details; locations respect
`showContact`; downloads show type and size from the attachment; an accessible lightbox without a
package; alt text required in project widgets; new labels in the `project:` namespace where
practical; "Demo"-labelled seed content only; no new dependency; stop for commit approval.

## Work completed

### Phase A — start-of-session verification and records

- Read AGENTS.md, the handoff, ADR-0003, content model §0/§6, editorial requirements §5–6, the
  m1-014 report and the decision register. Branch `feat/m1-015-listing-and-section-widgets`, clean,
  level with its remote. Node 24.21.0. Baseline: lint PASS, unit 61/61.
- Prompt archived. Stale records fixed with status notes (no history rewritten):
  D-GIT-13 closed (PR #16, `4dc8855`); `m1-handoff.md` gained an m1-015 status section and pointers
  from its historical m1-009 sections; INDEX updated (end of task).
- Hosted CI on PR #16 was **not re-checked** (no `gh`; not needed for the work).

### Phases B–E — the eight widgets

Shared code: `lib/listing.js` (anchor, intro area, columns, mode, limit fields; `loadListed()`),
`lib/alt-text.js` (`requireAltText()`), `lib/file-meta.js` (type and size), `lib/views/EmptyHint.jsx`.

| Widget | Fields | Behaviour |
|---|---|---|
| `assurer-feature-grid` | anchor, intro, columns 2/3/4, items 1–12: title (≤ 120), text (≤ 300), image, item anchor, optional link (`linkFields()`) | Item images need alt text. **New widget, not a generalised product card** (D-CONTENT-8 widget part) |
| `assurer-stats` | anchor, intro, items 1–6: value (string ≤ 20), label (≤ 80), note (≤ 120) | Help text asks for owner-confirmed figures with an "as of" note |
| `assurer-product-list` | mode: category page · hand-picked (≤ 24); category page (optional); limit; columns | Category mode uses the chosen category, or the current page when it is a category page (also in the editor's live re-render, via core's `_docId`) |
| `assurer-organizations` | mode: all · hand-picked (≤ 24); limit; layout cards · compact list | Logos have empty alt; website links rendered only if http(s) |
| `assurer-people` | mode: hand-picked (≤ 24) · of one organization; limit; columns | **Differs from §6:** no `group` field exists. No contact details rendered |
| `assurer-locations` | mode: all · of one organization · hand-picked; limit; show postal addresses; columns | **Differs from §6:** no "by kind" mode. Phone and email only when the location's `showContact` is on |
| `assurer-downloads` | mode: by core file tag (≤ 5) · hand-picked (≤ 48); limit | Title, description, type and size from the attachment. Core upload rules unchanged |
| `assurer-gallery` | anchor, intro, images 1–48 (ordered), captions none · image title · image credit, columns | Thumbnails are links to the full image; `ui/src/index.js` opens a native modal `<dialog>`: Tab trapped, arrows/Home/End, Escape or visible Close, focus returns |

Rule-based modes query through `self.apos.modules[type].find(req, …)`, so visitors get only
published, non-archived records; hand-picked lists use ordinary relationships with the same
guarantee. Limits are clamped to 1–48. Empty listings render nothing for visitors and a hint for
logged-in users.

**Alt text required** (ADR-0003 §7): gallery, feature-grid items, and also the existing product
card and slideshow, whose images are informative. The widget's `sanitize` refuses to save while a
chosen image has no alt text, naming the image. The error is thrown as a field error, the way core
does, so the widget editor marks the field. Logos, people photos and the hero background stay
decorative (empty alt).

**i18n:** `modules/@apostrophecms/i18n` registers the `project:` namespace (`browser: true`);
`i18n/project/en.json` holds the 80 new strings. Older labels stay plain English, as the handoff
asked.

### Phase F — area config, seed, records

- `lib/area.js`: the eight widgets added for page-level `main` areas (home, default, division and
  category pages). Nested areas unchanged.
- `assurer-demo:seed-corporate` adds, when missing: file tag "Demo downloads", file "Demo brochure
  (fictional)" (`demo-content/files/demo-brochure.pdf`, 754 bytes, generated text-only PDF), and
  the page `/demo-widgets` "Demo Section Widgets" with one of each widget. Stats are labelled "Demo
  figure, not a real statistic". Tags and files are core `autopublish` types, so the seed no longer
  calls `publish` for them. Guard unchanged.
- ADR-0003 status note, content-model §0 note, decision register (D-CONTENT-8 note, D-SEC-4,
  D-GIT-14).

### Phase G — tests

- `scripts/content-model-test.mjs` (in `test:ci`): +28 checks: item limits (13 features, 7 figures),
  missing alt text refused for gallery, feature grid, product card and slideshow, listing limit
  clamped, figure length capped, `javascript:` link never stored or rendered, all eight widgets on
  one page, draft page not public, category and picked product lists without drafts, unpublished
  organization hidden, no visitor hint, no person contact details, location contact and address
  rules, file type and size, gallery order/alt/captions, unpublished widget edit hidden,
  anonymous `?aposMode=draft` gets nothing, archived location and file drop out and come back,
  and persistence after restart.
- `scripts/section-widgets.test.mjs` (unit, 9 tests): limits, pick/rule loading, alt-text helper
  (incl. the skip for internal conversions), file type and size, demo labelling, and every
  `project:` key used in code exists in `en.json`.

## Files changed

New: `lib/listing.js`, `lib/alt-text.js`, `lib/file-meta.js`, `lib/views/EmptyHint.jsx`,
`modules/assurer-{feature-grid,stats,product-list,organizations,people,locations,downloads,gallery}-widget/`
(index.js, views/widget.jsx; gallery also ui/src/index.js), `modules/@apostrophecms/i18n/`
(index.js, i18n/project/en.json), `modules/asset/ui/src/scss/_sections.scss`,
`demo-content/files/demo-brochure.pdf`, `scripts/section-widgets.test.mjs`, the prompt and this
report.

Changed: `app.js` (module registration), `lib/area.js`, `modules/asset/ui/src/index.scss`,
`modules/assurer-product-card-widget/index.js` and `modules/assurer-slideshow-widget/index.js`
(alt text), `modules/assurer-demo/index.js` and `lib/corporate.js` (seed),
`scripts/content-model-test.mjs`, ADR-0003, `apostrophe-content-model.md`, `decision-register.md`,
`m1-handoff.md`, `INDEX.md`.

No dependency, lockfile, CI workflow, `.env.example`, audit-baseline or migration change. The
owner's development database and `public/uploads` were not touched.

## Tests executed and actual results

| # | Command | Result | Status |
|---|---|---|---|
| T1 | `npm run lint` | exit 0, no warnings | PASS |
| T2 | `npm run test:unit` | 70/70 (61 existing + 9 new) | PASS |
| T3 | `npm run test:ci` (throwaway SQLite and media) — final run after the browser fixes | ensure-admin · ensure-editor · m0 seed · corporate seed (16 created) · again ("already present; nothing changed") · smoke **14/14** · workflow **15/15** · **content model 102/102** · restart · persistence **7/7** · **content persistence 7/7** · forms **77/77** · security **65/65** · HTTPS proxy **15/15**; "CI test run passed" | PASS |
| T4 | `npm run build` | exit 0 | PASS |
| T5 | `npm run audit:check` | **FAILED (2):** new high GHSA-27r3-jxmh-p828 (`body-parser` 1.20.8) and GHSA-q7qp-rjg7-q26m (`multer` 2.4.0), not in the baseline; 4 new low/moderate `fast-uri` advisories warn. No dependency changed in this task; `npm audit` reports a fix within existing ranges. Needs the owner (D-SEC-4) | **FAIL** (upstream, pre-existing on `main`) |
| T6 | `test:smoke`, `test:workflow`, `test:persistence` against the developer server and `.env` | Not run separately: they ran inside T3 on a throwaway database, as in m1-014, so the owner's development database stays unchanged (handoff §5) | Covered by T3 |
| T7 | Secret check | gitleaks is not installed here. Changed and new files searched for the browser-test password and session-secret values: none found | PASS (limited) |

Two failures found and fixed during T3 runs: (1) alt-text refusals returned 500, because core's
area code cannot handle a plain error from a widget's `sanitize` (it crashed on a numeric path);
now thrown as a field-error array like core's own validation → 400. (2) A test expected an empty
gallery to be refused; core intentionally does not enforce `required`/`min` on relationships
server-side, so the expectation was removed and the behaviour recorded.

### Browser acceptance

- **Agent-executed with Claude in Chrome; this is not human acceptance.**
- **Account:** `m1-015-browser-editor`, role **editor**, created with
  `node app @apostrophecms/user:add <name> editor`. No admin account existed or was used.
- **Instance:** disposable, `http://127.0.0.1:3002`: a copy of the working tree in the session
  scratch directory with its own SQLite database and `public/uploads`, development mode, seeded with
  `assurer-demo:seed` and `seed-corporate --dev-database` (the copy's own throwaway database).
  The whole instance and the scratch password file were deleted afterwards.
- **Viewport note:** resizing the window did not change the 1440 px viewport (as in m1-014), so
  768 and 375 px were tested by loading pages in same-origin iframes of exactly that width (real
  viewport media queries), checked by script and one visual check at 375 px.
- Evidence: screenshots viewed in-session, not saved.

| # | Check | Role / width | Actual result | Status |
|---|---|---|---|---|
| B1 | `/demo-widgets` renders all eight widgets for a visitor | anonymous / 1440 | All sections render; alt texts, website links, file "(PDF, 754 B)", contact only where allowed | PASS |
| B2 | Section intro alignment | anonymous / 1440 | **Defect found:** heading centred, intro text left. Fixed (intro centred like the product grid); re-checked | PASS after fix |
| B3 | Gallery lightbox by keyboard only | anonymous / 1440 | Tab to thumbnail (focus ring visible) → Enter opens dialog, focus on Close; → shows "Image 2 of 3" with the right alt; 4 × Tab stays inside the dialog; End then → wraps to "Image 1 of 3"; Escape closes; focus back on the opening thumbnail | PASS |
| B4 | Without JavaScript: thumbnails and download are plain links | anonymous | The 3 thumbnail hrefs return 200 `image/png`; the PDF link returns 200 `application/pdf` | PASS |
| B5 | 768 px and 375 px, no horizontal overflow | anonymous / iframe 768, 375 | `/demo-widgets`, `/demo-style/demo-apparel` and `/`: no overflow, no element past the viewport. Columns: feature/people/orgs 2 at 768 and 1 at 375; gallery 3 and 2 | PASS |
| B6 | Location name alignment on phones | anonymous / 375 | **Defect found:** location name centred over left-aligned card. Fixed; re-checked | PASS after fix |
| B7 | All eight widgets in the add-content menu with readable labels | editor / 1440 | Listed with the `project:` labels; widget editor shows help, MIN/MAX | PASS |
| B8 | Upload an image without alt text through the media manager and use it in a new gallery | editor | Upload succeeded; saving the gallery was **refused** with the message under the Images field naming "slide 2 office" | PASS |
| B9 | Fix alt text in the library and save | editor | Alt text added in the image panel; gallery saved ("Document saved") | PASS |
| B10 | Draft isolation | anonymous vs editor | Logged-out (also with `?aposMode=draft`) did not see the new gallery; editor's draft did; no username in public HTML | PASS |
| B11 | Reorder with arrow controls | editor | "Nudge up" moved the new gallery above the old one | PASS |
| B12 | Edit a listing: Organizations → hand-picked, nothing picked, compact list | editor | **Defects found:** visitors would still see the section heading over an empty list, and the hint was the generic one. Fixed: empty listings render nothing for visitors; pick mode shows "No published records picked yet…" | PASS after fix |
| B13 | Publish (Update) and check as visitor | anonymous | New gallery public in its new position; empty Organizations section absent; no editor hint | PASS |
| B14 | Upload a PDF through New File in a new Downloads widget (hand-picked) | editor | File saved and selected; draft shows "(PDF, 754 B)"; visitor does not see it until Update; after Update the visitor does. No console errors | PASS |
| B15 | Product list on a category page without a chosen category | editor / anonymous | Live re-render and full page list the page's products. Editor's draft view includes the unpublished demo product (expected in draft mode); after Update the visitor sees only the two published products | PASS |
| B16 | Clean-up | — | Tab closed; server stopped; instance (database, media, copy) and scratch password deleted. Leftovers: none | PASS |

Not tested in the browser: feature-grid and stats editing through the modal (covered by the API
suite), the slideshow and product-card alt-text refusal (API suite only), locations and people
edits, touch devices, screen readers and an axe/Lighthouse pass.

## Security observations

- No new endpoints, routes or upload paths; all input goes through core schema `convert`. Links use
  `linkFields()` (core `url` laundering drops `javascript:`); website links are additionally
  rendered only if http(s).
- Listings use the request-aware query builder; no raw collection access. Visitors cannot obtain
  drafts or archived records through the widgets (T3, B10, B13–B15).
- The person widget cannot render contact data (none exists in the schema, and the template
  outputs none).
- The lightbox builds its markup from a static string; captions and alt are set with
  `textContent`/attributes.
- D-SEC-4: two new high advisories in transitive dependencies (see T5).

## Known limitations

- Core keeps the alt-text message only in the widget editor; a REST page save gets a 400 with the
  field path but a generic nested error.
- The alt-text check runs on every save of a widget, so if someone later clears an image's alt text,
  the next save of any page area holding that widget is refused until it is fixed.
- `required`/`min` on relationships are enforced by the editor UI only (core behaviour).
- Lightbox focus: the trap cycles its own three buttons; the native modal makes the rest of the
  page inert.
- Exact window resizing remains unavailable in this Chrome setup; iframes were used instead.

## Unresolved decisions

- **D-SEC-4** (new): update the lockfile for `body-parser` and `multer`, or baseline them. The
  hosted `audit` job will fail on the m1-015 PR until then.
- **D-GIT-14** (new): commit, push and PR for this branch.
- **D-CONTENT-4, -9, -10, -11, -12**: unchanged.

## Rollback guidance

Revert the commit, or do not merge. No migration and no existing document changes shape. Pages
holding the new widgets would show "widget type not configured" warnings in the log; remove those
widgets through the UI first if they matter. The demo records are ordinary fictional content.

## Recommended next step

1. Owner reviews this report and decides D-SEC-4 (recommended: a short lockfile-update branch).
2. Owner approves the commit, push and PR (D-GIT-14); check the five CI jobs.
3. Optional: a human pass of the widget editing journeys.
4. Next task `m1-016` in a **new Claude Code session**: CA-3 (SEO) after D-CONTENT-10, or the
   D-SEC-4 lockfile update first.
