# Browser-based editor acceptance verification (agent-executed)

| | |
|---|---|
| **Task** | m0-007 |
| **Date** | 2026-10-19 (execution 18:35–19:10 +06:00) |
| **Scope** | Run the 23-row editor checklist through the real admin UI in a browser as a disposable Editor-role account, collect local evidence, clean up, re-run regression checks, and check GitHub protection read-only. Milestone 0 is not closed. |
| **Prompt** | [`2026-10-19-m0-007-browser-editor-acceptance.prompt.md`](../../../prompts/2026/10/2026-10-19-m0-007-browser-editor-acceptance.prompt.md) |
| **Branch / commit** | Base `main` = `ef7bbc8` (merge of PR #3, m0-006). Work on `test/m0-007-browser-editor-acceptance`; committed and pushed after owner approval (see Finalization). |
| **Related** | [editor checklist](../../../../milestones/m0-editor-acceptance-checklist.md) · [human usability checklist](../../../../milestones/m0-human-usability-checklist.md) · [M0 closure report](../../../../milestones/m0-closure-report.md) · [m0-006 report](./2026-10-19-m0-006-final-m0-closure.report.md) |

> **This is an agent-executed browser run, not a human walkthrough.** It verifies function. It
> does not replace the owner's usability acceptance (D-M0-1).

## Requirements

Use the real UI in a browser as a least-privilege Editor; record every checklist row with
steps, expected and actual results, status and evidence; keep evidence local and out of git;
clean up; re-run regression; check GitHub protection read-only; keep M0 PENDING.

## Work completed

### 1. State

- m0-006 is merged: PR #3 → `ef7bbc8`; the merged tree equals the reviewed head `c188758`
  (`c5718ac`). Local `main` fast-forwarded; branch `test/m0-007-browser-editor-acceptance` created.
  No uncommitted work existed.

### 2. Browser method

- **Claude in Chrome** (browser extension), driving the owner's Chrome in a dedicated tab group,
  visiting only `http://localhost:3000` (and, for §5, the GitHub settings pages read-only).
- The extension was **not connected** at first. As the prompt permits, a fallback started
  (Puppeteer-driven headless Edge, throwaway profile, one login step). The owner then said
  in chat to use **only the Chrome extension**. The fallback was stopped, and its Edge profile,
  screenshots and tool copy were deleted. **No result below comes from the fallback.**
- **Deviation:** the extension uses the owner's real Chrome profile, so the "fresh profile"
  requirement could not be met. Mitigations: dedicated tab, local site only, no other sites or
  accounts touched. That Chrome was signed in to the local site as `admin`; the agent **logged
  that admin session out** in order to test as the Editor.
- Anonymous checks during editing (rows 8–10) used a cookie-less HTTP request, because the
  extension cannot open an incognito window. Rows 15–18 and 23 ran in the browser itself after
  logout.

### 3. Editor account

- `m0-007-demo-editor`, role **editor**, created with the supported
  `node app @apostrophecms/user:add <name> editor` task. The random password was kept only in a
  session scratch file outside the repository, and never shown in reports or screenshots.
- The editor has no **Users** menu (least privilege confirmed). It **can** publish, archive,
  and open and change site-wide **Global Styles** (see finding F1).
- Cleanup: the password was set to a random, discarded value via
  `@apostrophecms/user:change-password` (the old password now fails with 400), and the credential
  file was deleted. Apostrophe has no CLI task to remove a user, so **archiving the account is
  left to the owner** in the admin Users screen.

### 4. Results (all 23 rows)

Evidence files are in `evidence/m0-007/` (git-ignored, local only). Test content was named
"M0-007 Agent Test (Demo)", and the images "DEMO TEST A/B/C".

| # | Requirement | Browser steps (summary) | Expected | Actual | Status | Evidence |
|---|---|---|---|---|---|---|
| 1 | Editor login | `/login`, editor credentials, Login | Admin bar; Published | Admin bar as `m0-007-demo-editor`; "Home — Published"; no Users menu | **PASS** | `01a-login-page`, `01b-editor-logged-in` |
| 2 | New page as draft | Pages → New Page; title; Publish ▾ → Save Draft and Preview | Opens as Draft | "Draft saved"; status **Draft**; slug `/m0-007-agent-test-demo` | **PASS** | `02a-page-tree`, `02b-…menu`, `02c-page-created-draft` |
| 3 | Rich text, typed in place | Edit → Add Content → Rich Text → type | Editable in place; saved | Typed on the page; "DOCUMENT SAVED." | **PASS** | `03-inline-text-edit` |
| 4 | Add Hero and Image | "+" below a widget → Assurer Hero (eyebrow set) → "+" → Image | Both appear; menu lists Assurer widgets and Form | Menu: Assurer Hero, Slideshow, Product Cards, Form, Layout, Rich Text, Image, Video; both added | **PASS** | `04a-add-content-menu` |
| 5 | Upload image | Image widget → "your device" file input → `DEMO TEST A` | Image shows | Uploaded; shown in widget | **PASS** | `05-image-uploaded` |
| 6 | Replace image | Widget Edit → remove A → Browse → upload B → Select → Save | New image; old gone | Shows B; A no longer in the widget | **PASS** | `06-image-replaced` |
| 7 | Reorder (image above text) | Image widget → **Nudge Up** ×2 | Order changes | Order image › text › hero; up-arrow disabled at top. **No drag handle on page-level widgets**; the up/down arrows are the reorder mechanism, which the checklist allows ("drag, or … up/down arrows"). | **PASS** | `07a/07b-reordered-image-first` |
| — | Remove widget (prompt item) | Hero → Remove (trash) | Widget removed | Hero removed; saved | **PASS** | (on page in `09-published`) |
| 8 | Draft not public | Anonymous request to `/m0-007-agent-test-demo` | 404 | 404; not in public nav | **PASS** (anonymous check by HTTP) | report §2 |
| 9 | Publish | Publish button; anonymous reload | Visible, same content and order | "Your changes have been published"; anonymous 200, image B before text, no A, no hero, no admin UI | **PASS** (anonymous by HTTP) | `09-published` |
| 10 | Unpublished edit hidden | Append "EDITED-UNPUBLISHED"; do not publish | Public shows old text | Draft shows the marker and an "Update" button; anonymous view has no marker | **PASS** (anonymous by HTTP) | `10-draft-edit-unpublished` |
| 11 | Revert | ⋮ → Discard Draft → confirm | Returns to published | "Draft Discarded"; marker gone; status Published. Menu also offers **Document Versions**. | **PASS** | `11-draft-discarded` |
| 12 | Styles: change width, preview | Palette → Layout → Container → Content Max Width slider 1200 → 950 | Width changes in preview | Live preview: CSS variable 950px; content narrowed | **PASS** (editor has access) | `12-styles-preview-950px` |
| 13 | Styles: cancel | Cancel | Width back to normal | Back to 1200px; nothing saved | **PASS** | — |
| 14 | Desktop / Tablet / Mobile | Home → Tablet, then Mobile preview buttons | Layout adapts; no horizontal scroll | Tablet and mobile frames render; the nav wraps on mobile; 0 px horizontal overflow at 404 px | **PASS** | `14a-tablet-preview`, `14b-mobile-preview` |
| 15 | Empty form submit | Anonymous browser: Send message with empty form | Required errors; nothing sent | Browser blocked submit: fullname, email, message, consent flagged | **PASS** | `15-form-required-errors` |
| 16 | Invalid email | All fields filled; email `not-an-email` | Email error | "Please include an '@'…"; no thank-you shown | **PASS** (browser layer; server layer covered by smoke) | `16-form-invalid-email` |
| 17 | Valid submission | Email `m0-007-demo@example.com`, demo text | Thank-you | "Thank you (demo)" shown | **PASS** | `17-form-thank-you` |
| 18 | Slideshow navigation | Next → dot 3 → Previous | Slides change | Active slide 1 → 2 → 3 → 2 | **PASS** | `18-slideshow-navigation` |
| 19 | Archive test page | Pages → ⋮ → Archive → confirm | Gone from nav and anonymous view | "Content Archived"; gone from tree and nav; anonymous 404 | **PASS** | `19-page-archived`, `20-logged-out` |
| 20 | Log out | User menu → Log Out | Public site; no admin bar | Public home; "Log in" button; no admin bar | **PASS** | `20-logged-out` |
| 21 | Slideshow configuration (home draft) | Edit → slideshow Edit → Edit Slides: change caption, + slide with image C (uploaded), **drag** new slide to the top, Save; Preview; ⋮ → Discard Draft | Draft shows new order; published unchanged | Draft: 4 slides, C first, edited caption second; anonymous home stayed at 3 slides throughout; after discard, 3 slides and nothing pending. Drag-and-drop **works** in the slides list. | **PASS** | `21a`–`21d` |
| 22 | Submission stored | Developer check: supported `apos-db-dump` export (read-only, deleted afterwards), searched for the row-17 email | Submission present | 1 matching record in `aposFormSubmissions` (12 records in total) | **PASS** | report §4 |
| 23 | Access after logout | Logged-out browser: test page; draft page API; user API | No content | Page 404; `{"name":"forbidden"}`; user API `notfound` | **PASS** | `23-draft-api-forbidden` |

**Totals: 23/23 PASS.** None FAIL, none BLOCKED, none NOT TESTED. Rows 8–10 used an anonymous HTTP
request for the visitor view (the editor actions were in the browser).

### 5. GitHub protection (read-only, in the owner's signed-in Chrome; nothing changed)

| Item | Observed (2026-10-19 ~19:05) |
|---|---|
| Rulesets | **None.** GitHub states rulesets "won't be enforced on this private repository until you move to GitHub Team organization account". |
| Classic branch protection | **Not configured** |
| Force-push and deletion restrictions on `main` | **None** (no rule exists) |
| PR requirement | **None enforced** (PR-only is a convention, not a control) |
| Dependency graph, Dependabot alerts, Dependabot security updates | **Off** |
| Secret scanning / push protection | **Not offered** on the Advanced Security page for this repository and plan |

**D-GIT-3 is now verified: `main` is not protected.** On the current plan, rulesets cannot be
enforced on this private repository. That needs an owner decision (see Unresolved decisions).

### 6. Cleanup

| Item | Done |
|---|---|
| Test page "M0-007 Agent Test (Demo)" | Archived through the UI (404 publicly) |
| Test images A, B, C | Archived through the Images manager ("Archived 3 Images") |
| Home page | Slideshow draft discarded; published home unchanged (3 slides, no broken images) |
| Global Styles | Change cancelled, not saved |
| Editor sessions | Logged out; password rotated to an unknown value (the old one is rejected) |
| Editor account | Still exists (role editor, unusable password). **Owner: archive it** in Users. |
| Credentials | Scratch credential file deleted; none in git, reports or screenshots |
| Fallback tooling | Edge profile, screenshots and Puppeteer copy deleted |
| Owner's own content | "Acceptance Test" page and "M0 Test Page" **not touched** |
| Demo form submission | One demo record (example.com address, demo text) kept as evidence for row 22 |

### 7. Regression after the browser run

`npm run lint` clean · `npm run test:smoke` **14/14** · `npm run test:workflow` **15/15** ·
`npm run test:persistence` **7/7**. Browser and automated results agree; there are no
discrepancies. Differences in coverage: the automated suites run as **admin** through the API,
while this run used the **editor** role through the UI. Drag-and-drop exists in the slides list but
not for page-level widgets, where the arrows are used.

## Findings (for approval; nothing changed in code)

| ID | Finding | Severity | Suggested handling |
|---|---|---|---|
| F1 | The Editor role can change **site-wide Global Styles**, and can publish and archive pages | Governance (by design in core) | Decide in M1 whether editors should have Styles access. A contributor role or custom permissions could narrow it. |
| F2 | GitHub `main` has no protection, and rulesets cannot be enforced on this private repository on the current plan; Dependabot is off; secret scanning is unavailable | **High** (process) | Owner decision D-GIT-3 (options in the register). At minimum turn on Dependency graph and Dependabot alerts (free). |
| F3 | The media library holds many duplicate demo images; repeated `test:workflow` runs keep adding them | Low (hygiene) | M1 CI should use a fresh database per run; optionally clean up local test media |
| F4 | `aposFormSubmissions` holds 12 records (demo and smoke data) with no retention policy | Known (S4) | M1 form operations (D-M0-4) |
| F5 | Image search returns loose matches (SQL adapter; no stemming) | Known (ADR-0002 §7) | PostgreSQL acceptance test |
| F6 | A newly added slide shows "#1" in the slides list instead of its caption until saved | Cosmetic (core) | None |

## Files changed

| Status | Path |
|---|---|
| M | `.gitignore` (adds `/evidence`) |
| A | `docs/engineering/prompts/2026/10/2026-10-19-m0-007-browser-editor-acceptance.prompt.md` |
| A | `docs/engineering/reports/2026/10/2026-10-19-m0-007-browser-editor-acceptance.report.md` |
| A | `docs/milestones/m0-human-usability-checklist.md` |
| A | `docs/engineering/prompts/2026/10/2026-10-19-m0-007-finalization-authorization.prompt.md` (finalization) |
| M | `docs/milestones/m0-editor-acceptance-checklist.md` |
| M | `docs/milestones/m0-closure-report.md` |
| M | `docs/engineering/decision-register.md` |
| M | `docs/engineering/INDEX.md` |
| M | `docs/milestones/m1-execution-plan.md`, `docs/milestones/m1-handoff.md`: planned M1 task IDs shifted by one (`m1-008`…`m1-012`), because `m0-007` used number 007 (STANDARDS: numbers are never reused); handoff status updated |

Not in git: `evidence/m0-007/` (28 screenshots and 3 generated test images). Local database
changes: the editor account, an archived test page, 3 archived images, 1 demo form submission.

## Tests executed and actual results

§4 (23/23 browser rows), §7 (lint, 14/14, 15/15, 7/7), §5 (read-only GitHub observation).

## Security observations

- No credentials in git, reports or screenshots. The editor password appeared only in this
  session's tool calls, and the password has since been rotated away.
- The agent logged the owner's local `admin` session out of the local site (local only).
- GitHub was viewed read-only through the owner's signed-in browser; no setting was changed.

## Known limitations

- Not a human usability assessment.
- Anonymous checks during editing used HTTP, not a second browser profile.
- Only Chromium (Chrome) was tested; Safari, Firefox and real devices were not.

## Unresolved decisions

- **D-M0-1:** human usability acceptance. Pending; short checklist prepared.
- **D-GIT-3:** now verified as **unprotected**. The owner chooses: upgrade (GitHub Team or a
  public repository) to get enforced rules, or formally accept the risk for M0 with
  compensating controls (single maintainer, PR-only convention, no force push).
- **D-M0-10 (new):** archive the `m0-007-demo-editor` account.
- **F1:** Editor access to Global Styles.

## Finalization (approved 2026-10-19)

[Finalization prompt](../../../prompts/2026/10/2026-10-19-m0-007-finalization-authorization.prompt.md).
The Principal Software Architect approved these results for documentation, and authorized a
commit and a normal push of this branch (no merge, no push to `main`). Decisions recorded:

| Decision | Recorded in |
|---|---|
| Lack of enforceable `main` protection **accepted** as a temporary risk; the repository stays private; no GitHub upgrade or visibility change; compensating controls (feature branches, PR workflow, no force push, CI and security scanning in m1-008); **review before any added maintainer or production deployment** | D-GIT-3 (closed: risk accepted) |
| Editor access to site-wide Global Styles is a known authorization/design decision; **review before staff rollout** | D-M0-11 |
| Dependabot alerts **not enabled by the agent** (changing repository security settings is outside the agent's authorized actions); owner steps recorded | D-GIT-3 |
| Commit and push approved; the owner opens and merges the PR | D-GIT-7 |

The closure report, M1 plan and handoff were aligned with these decisions. Milestone 0 stays
**PENDING** until the owner records human usability acceptance. After that and the PR merge are
verified, a documentation-only closure update follows under the next unused task ID (`m0-008`).

**Publication:** one Conventional Commit on `test/m0-007-browser-editor-acceptance`, based on
`ef7bbc8`. At publication `origin/main` was `0bba2c5`, whose tree is identical to `ef7bbc8`
(PRs #6 and #7 only synchronized old branches). The commit SHA cannot appear in the commit that
contains this report. It is the branch head shown in the PR, and is reported in the session
summary to the owner.

## Rollback guidance

Docs and `.gitignore` only, uncommitted. To discard: `git restore` the five modified files and
delete the three added files listed above. Database: restore an archived page or image from its manager's archive filter
if needed.

## Recommended next step

1. Owner reviews the evidence in `evidence/m0-007/`.
2. Owner runs the [human usability checklist](../../../../milestones/m0-human-usability-checklist.md) (~10 min).
3. Owner decides D-GIT-3.
4. Owner approves committing this branch.
