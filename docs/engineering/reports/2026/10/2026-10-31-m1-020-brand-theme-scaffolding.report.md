# m1-020 — Brand theme scaffolding (CA-4, without brand assets)

| | |
|---|---|
| **Task** | m1-020 |
| **Date** | 2026-10-31 |
| **Scope** | CA-4 from the [implementation plan](../../../../content/implementation-plan-and-risks.md#2-prioritised-implementation-plan), narrowed by the owner in session to scaffolding only: D-CONTENT-12 (brand assets) is still open |
| **Prompt** | [2026-10-31-m1-020-brand-theme-scaffolding.prompt.md](../../../prompts/2026/10/2026-10-31-m1-020-brand-theme-scaffolding.prompt.md) |
| **Handoff** | [m1-020 start handoff](../../../../milestones/m1-020-handoff.md) · next: [m1-021 handoff](../../../../milestones/m1-021-handoff.md) |
| **Branch / commit** | `feat/m1-020-brand-theme-scaffolding` from `origin/main` `d225a3f` (m1-019 merged as PR #22). Commit, push and PR approved by the owner in session (D-GIT-18) |
| **Related** | D-CONTENT-12 · D-M0-11 · D-GIT-17 (closed) · D-GIT-18 (new) |

## Approvals used

- Owner, in session: CA-4 scaffolding only, with neutral placeholder values.
- No dependency was added, removed or upgraded. `package.json` and the lockfile are unchanged.

## Start state

- m1-019 was merged (PR #22, `d225a3f` on `origin/main`). D-GIT-17 is closed on that basis. The
  hosted CI result was not checked: `gh` is not installed on the agent's machine.
- A server the agent did not start was listening on `127.0.0.1:3000`. It was left alone. This
  task used its own server on `:3004`.

## What was built

| Item | Implementation |
|---|---|
| Design tokens | New `modules/asset/ui/src/scss/_tokens.scss`: colour slots (primary, accent, on-colours, neutrals, borders, links, focus, danger, notice, selection), overlays and shadow, font stacks, a 1.25 modular type scale in `em`, a 4 px spacing scale with a section gap, radii, and Sass breakpoints (768, 1024). All values are placeholders |
| Styles use tokens | Every hard-coded colour in `_assurer.scss`, `_corporate.scss`, `_sections.scss`, `_type.scss` and `_layout.scss` now reads a token, except the gallery lightbox and the slideshow caption gradient (media over dark backgrounds). Section gaps (48 px) use `--assurer-space-section`. The old `--assurer-navy/blue/accent/light/text` properties are gone (`--assurer-blue` was unused) |
| Headings | H1–H4 follow the type scale; a `--assurer-font-heading` slot applies when defined. Visible change: H2 and H3 are larger than the browser defaults they used before |
| Accessibility fixes in the placeholder palette | Accent `#1f7a8c` → `#1c7080` (card badge was 4.45:1); visited link `#8264f1` → `#6a3fd8` (4.16:1); form-field border `#b8c2cc` → `#6b7785` (1.81:1, needs 3:1); Menu button border and slideshow dots `#c3cdd6` → `#6b7785`; footer uses the muted text colour instead of `opacity: 0.8`. Table in [design tokens §3](../../../../content/design-tokens.md#3-contrast-of-the-placeholder-palette-wcag-22-aa) |
| Breadcrumbs | `lib/breadcrumbs.js` builds the same items as the BreadcrumbList JSON-LD of `@apostrophecms/seo` (ancestors, then the current page; none on home, the 404 page or pieces). `views/layout.jsx` renders `<nav aria-label="Breadcrumb">` with an ordered list and `aria-current="page"`, between the header and `<main>`, so "Skip to content" passes it. The separator is CSS with empty alternative text |
| Brand mark | The header's text wordmark is now `BrandMark` in `views/layout.jsx`, the single place to put the vector logo |
| Docs | New [design tokens and brand swap guide](../../../../content/design-tokens.md); the breadcrumb row in the [editorial requirements](../../../../content/editorial-and-design-requirements.md) component inventory now says Implemented |
| Tests | `scripts/breadcrumbs.test.mjs`: 3 unit tests (none on home/without page/on piece; order and current page; incomplete ancestors skipped) |

Not done (no brand assets): real colours, fonts, logo, favicon. Global Styles is unchanged
(D-M0-11). The demo notice stays.

## Verification (agent-executed)

Server: `node app` on `:3004` (development database), `BASE_URL=http://localhost:3004`.

| Command | Result |
|---|---|
| `npm run lint` | PASS (0 problems) |
| `npm run test:unit` | PASS, 92/92 |
| `npm run test:smoke` | PASS, 18/18 |
| `npm run test:workflow` | PASS, 15/15 |
| `npm run test:persistence` | PASS, 7/7 |
| `npm run test:security` | PASS, 65/65 |
| `npm run test:ci` (isolated SQLite, SMTP sink) | PASS: smoke 18, workflow 15, content model 102, SEO 37, persistence 7 + 7, redirects 52, forms 84/84 (0 skipped), security 65, HTTPS-proxy security 15 |
| `sass` compile of `index.scss` | PASS (no errors) |

`npm run test:forms` was not run on its own; its checks ran inside `test:ci`.

### Browser checks (Claude in Chrome, agent-executed; not human approval)

The agent's Chrome tab already had an administrator session on `localhost:3004`. No content,
account or setting was changed, so no editor account was created: this task has no editor-facing
change (no schema, widget or permission change). Logged-out markup was checked with HTTP requests.

| # | Check | Result |
|---|---|---|
| B1 | `/test` at 1440 px: header, breadcrumbs "Home / Test", H1, content | PASS: breadcrumbs under the header, current page bold, Home underlined |
| B2 | Layouts at 375, 768 and 1440 px for `/test`, `/` and a 404 URL (same-origin iframes of those widths; the window is maximized) | PASS: no horizontal overflow at any width; Menu button shown below 1024 px; breadcrumbs only on `/test` |
| B3 | Keyboard: Tab from the current menu link | PASS: focus moves to the breadcrumb "Home" link; computed outline 3 px solid `#1c7080`. The zoomed screenshot did not show the ring (focus may have moved when the screenshot was taken), so the evidence is the computed style |
| B4 | Token values applied (home, 1440 px) | PASS: form-field border `#6b7785`, submit `#1c7080`, footer text `#4a525c` at full opacity, H2 35.2 px on an 18 px body |
| B5 | Logged-out HTML (curl) | PASS: `/test` has the breadcrumb `nav` with `aria-current="page"`; `/` has none; the 404 URL returns 404 |
| B6 | Draft/published isolation | NOT TESTED: no content change in this task |
| B7 | Editor (non-admin) journey | NOT TESTED: no editor-facing change |

Dev-mode note: Vite injects the CSS after first paint, so a screenshot taken straight after
navigation shows the page unstyled. The styles were present and applied (checked with computed
styles); the second screenshot shows them.

## Clean-up

- No content, account or setting was created or changed.
- The dev server on `:3004` was stopped and the agent's browser tab closed. The `:3000` server
  (not the agent's) was left running.

## Limitations and follow-ups

- All colours and fonts are placeholders. Contrast was checked by calculation for the pairs listed
  in the token guide, not with axe or Lighthouse.
- Global Styles still sets the body font, sizes and content width, and editors can change them
  (D-M0-11). Its saved body font wins over `--assurer-font-body`.
- Most paddings are still literal pixels. The card grids switch to two columns at 640 px; the
  requirements name 768 px. Left as is (no design basis to change it yet).
- Starter `$color-*` variables and the unused `.bp-button` class remain.
- H1 is about 39 px on phones (2.441 × 16 px). Review with the brand type scale.

## Open decisions

- D-CONTENT-12 (brand assets): still open; blocks the rest of CA-4.
- D-M0-11 (editor access to Global Styles): affects the brand font.
- D-GIT-18 (new): commit, push and PR for this branch.

## Recommended next step

The owner reviews this branch and approves D-GIT-18. Then start m1-021 in a new Claude Code
session from the [m1-021 handoff](../../../../milestones/m1-021-handoff.md).
