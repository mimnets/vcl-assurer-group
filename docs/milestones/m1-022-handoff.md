# m1-022 start handoff: admin-side tidy-up (Global Styles access, admin bar menus)

| | |
|---|---|
| **Prepared** | 2026-10-31, by the agent at the end of m1-021 (agent-executed; not a human approval) |
| **Task** | `m1-022`. (1) **Restrict Global Styles to admins** (D-M0-11, decided by the owner in m1-021). (2) **Group the admin bar** into menus so editors do not face one long row (owner request in m1-021: plan now, implement later). Other owner-approved items follow as their own tasks: privacy page content (needs the notice text from the owner or DPO), CA-5 preparation |
| **Precondition** | The m1-021 PR is merged (D-GIT-19) and its five hosted CI checks are green |
| **Branch** | `feat/m1-022-<short-name>` from `origin/main` after that merge |
| **Session** | Start a **new Claude Code session** (AGENTS.md, Sessions and context) |
| **Read first** | [AGENTS.md](../../AGENTS.md) · [INDEX](../engineering/INDEX.md) · [decision register](../engineering/decision-register.md) (D-M0-11, D-CONTENT-11) · [m1-021 report](../engineering/reports/2026/10/2026-10-31-m1-021-brand-swap.report.md) · [design tokens](../content/design-tokens.md) |

## 1. State at the end of m1-021

- `feat/m1-021-brand-swap` holds the brand swap and this handoff. Commit, push and PR were
  approved by the owner (D-GIT-19); merge pending.
- All local suites pass (see the report). Hosted CI has not run on this branch.
- The Global Styles body font control is removed (brand font fixed by token). Editors can still
  open Global Styles and change line height, letter spacing, sizes and widths.

## 2. Plan

### 2.1 Global Styles: admins only (D-M0-11)

- Find how core gates the Global Styles panel and its save route (`@apostrophecms/styles`, look
  in `node_modules/apostrophe`) and use the supported permission option or `can` check to limit
  it to admins. No custom role system; Community Edition only.
- Server-side check, not only a hidden button: an editor's direct API write must be refused.
- Tests: an editor gets 403 on the styles write; admin still saves. Browser: editor sees no
  palette icon; admin does.

### 2.2 Admin bar menus (owner request)

Today the admin bar shows one flat row: Pages, Users, Images, Image Tags, Files, File Tags, Forms,
Products, Organizations, People, Locations, Redirects. Core supports grouping through the
`groups` option of `@apostrophecms/admin-bar` (`modules/@apostrophecms/admin-bar/index.js`, no
new dependency). Proposed layout, for the owner to confirm before implementation:

| Menu | Items | Notes |
|---|---|---|
| Pages | Pages | Stays first and on its own: the most used item |
| Content | Products, Organizations, People, Locations | The corporate content pieces |
| Media | Images, Image Tags, Files, File Tags | Library and its tags together |
| Forms | Forms | Alone unless more form items appear |
| Site admin | Users, Redirects | Admin-only items; editors see only what their role allows |

Check in the browser as an editor and as an admin: each menu opens, items open their managers,
and an editor does not see admin-only entries. Record before/after screenshots under
`evidence/m1-022/`.

## 3. Carry-over from m1-021

- Owner to confirm the brand values (D-CONTENT-12) and supply a vector (SVG) logo master when
  one exists. Point `LOGO` in `views/layout.jsx` at it.
- At 56 px the logo's "ASSURER.WORLD" wordmark is very small; review the header logo size with
  the owner.
- Still literal: most paddings; card grids switch at 640 px (requirements say 768 px).
- No `/favicon.ico` file (the PNG link tags cover current browsers).

## 4. Gates

- No new dependency without approval.
- Commit, push and PR need owner approval.

## 5. Prompt for the new session

> Start m1-022. Read AGENTS.md and docs/milestones/m1-022-handoff.md first, confirm the task with
> me, follow the gates, and stop for approval before any commit or push.
