# m1-015 start handoff: CA-2 listing and section widgets

| | |
|---|---|
| **Prepared** | 2026-10-28, by the agent (agent-executed check; not a human approval) |
| **Task** | `m1-015`: CA-2, listing and section widgets ([plan §2](../content/implementation-plan-and-risks.md#2-prioritised-implementation-plan)) |
| **Branch** | `feat/m1-015-listing-and-section-widgets`, created from `origin/main` (`4dc8855`); its first commit is this handoff. Continue on it; do not recreate it |
| **Session** | Start a **new Claude Code session** for this task (AGENTS.md, Sessions and context) |
| **Read first** | [AGENTS.md](../../AGENTS.md) · [INDEX](../engineering/INDEX.md) · [ADR-0003](../architecture/decisions/ADR-0003-corporate-content-model.md) · [content model §0 and §6](../content/apostrophe-content-model.md#6-widgets) · [editorial and design requirements](../content/editorial-and-design-requirements.md) · [m1-014 report](../engineering/reports/2026/10/2026-10-20-m1-014-content-model-foundation.report.md) · [decision register](../engineering/decision-register.md) · [m1-handoff](./m1-handoff.md) |

## 1. State checked on 2026-10-28

| Check | Result |
|---|---|
| Branch and working tree | `main`, clean, level with `origin/main` after `git fetch` |
| `origin/main` | `4dc8855`, the merge of PR #16 (m1-014, CA-1, ADR-0003) |
| CA-1 dependency | **Met.** m1-014 is merged, so CA-2 can start |
| Hosted CI on PR #16 | NOT VERIFIED here (`gh` is not installed in this environment). The owner confirms it, or the next session checks it in the browser |
| Node | 24.21.0; `.env` present (contents not read) |
| `npm run lint` | PASS (exit 0) |
| `npm run test:unit` | PASS, 61/61 |
| `npm run test:ci` (throwaway SQLite and media) | PASS, "CI test run passed" (includes smoke, workflow, content model, persistence, forms, security and HTTPS proxy suites) |
| Browser smoke check | NOT TESTED in this handoff. Run it in m1-015 Phase A |
| Core modules available | `apostrophe` 4.34.0 ships `@apostrophecms/file`, `@apostrophecms/file-tag` and `@apostrophecms/file-widget`; no new package is needed for downloads |

## 2. Stale records to correct in m1-015 Phase A

These are records, not history. Add status notes; do not rewrite earlier reports.

1. **Decision register, D-GIT-13** still says "Open". PR #16 was merged as `4dc8855`. Close it
   with that reference.
2. **`m1-handoff.md`** still says m1-014 "awaits architectural review", and its
   "Start-of-session checklist" and "Exact first Milestone 1 task" sections still describe
   m1-009. Add an m1-015 status section and point those sections here.
3. **INDEX.md**: add this handoff and, when the task ends, the m1-015 prompt and report. Next
   free ID becomes `m1-016`.

## 3. Scope of CA-2

Eight new widgets, as listed in [content model §6](../content/apostrophe-content-model.md#new-minimal-set-each-replaces-a-wordpress-pattern),
each a `modules/assurer-*-widget` module with a `.jsx` template, added to `lib/area.js` for
page-level `main` areas. Nested areas keep their own narrow lists.

| Widget | Data | Notes for the implementer |
|---|---|---|
| `assurer-feature-grid` | inline items (≤ 12) | D-CONTENT-8 left "new widget vs generalised product card" to CA-2. The recommendation is a new widget. Record the choice in the report and ADR-0003 status note |
| `assurer-stats` | inline items (≤ 6) | `value` is a string. Demo figures only, labelled "Demo"; real figures need an owner-confirmed date (D-CONTENT-12) |
| `assurer-product-list` | `assurer-product` | Modes: products of the current category page · hand-picked. The category's `_products` is a reverse relationship (m1-014) |
| `assurer-organizations` | `assurer-organization` | Modes: all · hand-picked. Logos next to names use empty alt text |
| `assurer-people` | `assurer-person` | **Spec differs from the model as built:** the person has no `group` field, so offer hand-picked (and, if useful, by organization). **Never render contact details**: none exist, by design (D-CONTENT-4) |
| `assurer-locations` | `assurer-location` | **Spec differs:** the location has no `kind` field. Offer all · hand-picked (and, if useful, by organization). Respect `showContact` (off by default) |
| `assurer-downloads` | core `@apostrophecms/file` | Modes: by file tag (core `@apostrophecms/file-tag`) · hand-picked. Show title, description, type and size computed from the attachment. Upload limits and allowed types stay server-side |
| `assurer-gallery` | core `@apostrophecms/image` | Ordered `_images`, caption source, columns. Accessible lightbox written in project code under `modules/asset/ui/src/`: focus trap, Escape, arrow keys, visible close, works without JavaScript as plain links. **No lightbox package** |

Cross-cutting requirements (ADR-0003, editorial requirements §5–6):

- Alt text: making it required in project widgets is part of CA-2.
- Typed fields only; links through `linkFields()` / `linkHref()`; `url` fields http(s) only; no
  HTML widget.
- Draft isolation: a listing never shows draft, unpublished or archived records to visitors.
  Use the request-aware query builder, not raw collection access.
- Labels in the `project:` i18n namespace for new strings, where practical (m1-014 left plain
  English; do not convert old labels in this task).
- Demo content through `node app assurer-demo:seed-corporate` (and the existing seed), always
  labelled "Demo". Nothing invented as real business content.

Out of scope: SEO fields, sitemap and redirects (CA-3, waits for D-CONTENT-10), brand theme
(CA-4), real content (CA-5), new piece types (news, certifications), any new dependency.

## 4. Suggested phases

The plan sizes CA-2 as **L**. If the session runs long, stop after Phase D with a partial report
and continue as `m1-016`, rather than rushing the rest.

| Phase | Content |
|---|---|
| A | Start-of-session verification (AGENTS.md); archive the prompt; check out the branch; fix the stale records in §2; browser smoke check |
| B | Inline widgets: `assurer-feature-grid`, `assurer-stats` |
| C | Piece listings: `assurer-product-list`, `assurer-organizations`, `assurer-people`, `assurer-locations` (one shared pick-mode pattern) |
| D | `assurer-downloads` (file pieces and tags) |
| E | `assurer-gallery` with the accessible lightbox |
| F | `lib/area.js`, demo seed, ADR-0003 and content-model status notes |
| G | Tests: extend `scripts/content-model-test.mjs` (in `test:ci`) and unit tests. Negative cases: anonymous access, draft and archived records hidden, `javascript:` links stripped, limits enforced, missing alt text rejected |
| H | Full test set and the browser checklist below; report; INDEX; stop for commit approval |

## 5. Approval gates in this task

- **No new dependency** is expected. If one seems needed (for example a lightbox library), stop
  and ask; it needs approval, a license check and an advisory check.
- Commit, push and PR each need the owner's explicit approval.
- The owner's development database is not changed. Seeds run on the throwaway database unless
  the owner asks for `--dev-database`.

## 6. Completion checklist (from AGENTS.md)

- `npm run lint`, `npm run test:smoke`, `npm run test:workflow`, `npm run test:persistence`
  (server running), plus `npm run test:unit`, `npm run test:ci`, `npm run build` and
  `npm run audit:check`. Report actual results.
- Browser acceptance with Claude in Chrome, local host only, as a disposable **editor**
  (`node app @apostrophecms/user:add <name> editor`):
  - add, edit and reorder each new widget through the UI; upload images and a file;
  - draft vs published isolation, an unpublished edit stays hidden, logged-out visitors see no
    draft data;
  - gallery lightbox by keyboard only (Tab, Enter, arrows, Escape) and with focus returned;
  - 1440, 768 and 375 px, no horizontal overflow (m1-014 left 768 and 375 px unverified, B16).
- Record each check as PASS, FAIL, BLOCKED or NOT TESTED, labelled agent-executed. Evidence under
  `evidence/m1-015/` (git-ignored). Archive the disposable account and test content afterwards.

## 7. Open owner decisions that affect CA-2

| Decision | Effect on CA-2 |
|---|---|
| D-CONTENT-4 (leadership privacy) | People widget shows no contact details |
| D-CONTENT-12 (brand and content) | Stats and all records stay demo-only |
| D-CONTENT-9 (profile video) | Not part of the downloads widget until decided |
| D-CONTENT-11 (publishing workflow) | Unchanged; editors publish under core defaults |
| D-CONTENT-10 (SEO packages) | None for CA-2; blocks CA-3 |

## 8. Prompt to start the next session

> Start m1-015: CA-2 listing and section widgets per
> docs/content/implementation-plan-and-risks.md. Read AGENTS.md and
> docs/milestones/m1-015-handoff.md first, follow its phases and gates, and stop for approval
> before any commit, push or new dependency.
