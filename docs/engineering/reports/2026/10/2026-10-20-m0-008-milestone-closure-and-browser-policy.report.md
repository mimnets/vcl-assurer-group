# Milestone 0 reconciliation and permanent browser-testing policy

| | |
|---|---|
| **Task** | m0-008 |
| **Date** | 2026-10-20 |
| **Scope** | Verify the m0-007 merge, make browser acceptance testing a permanent rule, reconcile the Milestone 0 gates (archive the test editor, re-run regression), update the milestone documents, and specify the first M1 task (CI). No CI implemented; Milestone 0 not closed. |
| **Prompt** | [`2026-10-20-m0-008-milestone-closure-and-browser-policy.prompt.md`](../../../prompts/2026/10/2026-10-20-m0-008-milestone-closure-and-browser-policy.prompt.md) |
| **Branch / commit** | Base `origin/main` = `80bc50c`. Branch `docs/m0-008-milestone-closure-and-browser-policy`; one commit (its SHA is the branch head in the PR; a commit can't contain its own SHA). |
| **Related** | [m0-007 report](./2026-10-19-m0-007-browser-editor-acceptance.report.md) · [M0 closure report](../../../../milestones/m0-closure-report.md) · [M1 handoff](../../../../milestones/m1-handoff.md) · [m1-009 CI spec](../../../../milestones/m1-009-ci-and-security-scanning-spec.md) · ADR-0001, ADR-0002 |

> Browser results in this report are **agent-executed** (Claude in Chrome). They are not a human
> usability walkthrough and do not close D-M0-1.

## Requirements

Tasks 1–6 of the prompt: verify state and the m0-007 merge; add the 12 browser-testing rules to
AGENTS.md and a per-task checklist rule to STANDARDS.md; reconcile M0 (merge, 23/23, regression,
D-GIT-3, editor account, security risks, human approval); update the five milestone and
engineering documents; specify the CI task; commit and push a short-lived branch without merging.

## Work completed

### 1. State verification

- At session start: local branch `test/m0-007-browser-editor-acceptance`, clean, at `a3324ea`.
  No uncommitted changes to preserve.
- The first `git fetch` returned `origin/main` = `66e3fbc` (PR #8), which did **not** contain
  `a3324ea`. PRs #5–#8 only merged `main` back into old branches and changed no content: the tree
  equalled `ef7bbc8`. A `git ls-remote` moments later showed `main` = `80bc50c`, and a second
  fetch confirmed it: **PR #9 (m0-007) merged as `80bc50c`** (2026-10-20 09:24 +05:30).
  `a3324ea` is an ancestor, and `git diff a3324ea 80bc50c` is empty.
- `m0-008` was unused as a task file ID (it appeared only as the planned next ID). This task
  takes it. Branch `docs/m0-008-milestone-closure-and-browser-policy` was created from
  `origin/main`.
- `gh` CLI is not installed; the private repository's API is not reachable without
  authentication. The merge was verified with git (`ls-remote` pull refs and fetch).

### 2. Browser-testing policy

- **AGENTS.md:** new section "Browser acceptance testing (added m0-008)" with the 12 rules from
  the prompt, written as binding rules.
- **STANDARDS.md:** new section "Browser acceptance checklist (every task)": a per-task table
  (check, role/viewport, steps, expected, actual, status, evidence) and minimum coverage for
  features versus docs-only tasks.
- **CLAUDE.md:** unchanged. It still only imports AGENTS.md.
- Recorded as decision **D-QA-1** (adopted by the owner's prompt).

### 3. Milestone 0 reconciliation

| Item | Verified result |
|---|---|
| m0-007 merge | ✅ PR #9 → `80bc50c`; tree equals `a3324ea` |
| 23/23 browser results | ✅ Recorded in the merged m0-007 report and editor checklist (agent-executed). Not re-run in full; this task changed no application code. |
| Regression | ✅ See Tests |
| D-GIT-3 branch-protection risk | ✅ Closed as risk accepted (m0-007 finalization), re-confirmed by the owner in this prompt. Not re-inspected in GitHub (no settings access was needed). |
| Editor account | ✅ **Archived** (D-M0-10 closed); see §4 |
| Security risks | Open, none critical: D-M0-5 (S1–S9), `npm audit` **43 findings (38 moderate, 5 high, 0 critical)**, up from 42 (4 high) in M0, where the new high is dev-only `nodemon` → `chokidar` → `braces` (GHSA-vfj7-8cjw-p6xm); D-M0-9 (backup archives hold secrets); D-M0-11 (editor Global Styles access) |
| Human usability approval | ❌ **Not recorded.** No report or register entry exists. **Gate left open, not waived.** An owner sign-off section was added as closure report §7. |

### 4. Editor account cleanup

- Users via the core REST API (authenticated as the local test admin from `.env`; credentials
  never printed; bearer token revoked after each call): `admin` (admin, active) and
  `m0-007-demo-editor` (editor, active, password already unknown).
- Archived **only** `m0-007-demo-editor` with `PATCH /api/v1/@apostrophecms/user/:id`
  `{archived: true}` (HTTP 200). The script refused to act on any admin-role account. On
  archive, core prefixed the username with `deduplicate-…`, which is standard behaviour for
  unique fields. The account was **not deleted** and can be restored from the Users archive.
- Re-checked after a server restart: still archived; `admin` untouched.
- The REST API was used instead of the admin UI so the admin password did not have to be typed
  through the browser tool.

### 5. Documentation

Closure report (status PENDING with reasons, new gates for the m0-007 merge and account cleanup,
§7 owner sign-off), M1 handoff (rewritten for a fresh session: start checklist, verified state,
commands, risks, git state), M1 plan (IDs shifted to `m1-009`…`m1-013`, WS-2 linked to the spec),
decision register (D-M0-1 re-checked, D-M0-10 closed, D-GIT-7 closed, D-GIT-8 and D-QA-1 added,
D-CI-1 and D-M1-0 updated), INDEX (m0-007 merged, m0-008 row, next ID), human usability checklist
(cleanup done, records go to §7).

### 6. Next task specification

[m1-009-ci-and-security-scanning-spec.md](../../../../milestones/m1-009-ci-and-security-scanning-spec.md):
jobs, an isolated per-run SQLite database, a non-interactive admin bootstrap (core `user:add`
prompts through `prompts`, so a guarded project task using `apos.user.insert` is recommended),
gitleaks CLI (MIT, pinned and checksum-verified), an audit baseline script, PR checks,
generated secrets only, approval gates, and a definition of done with negative tests.

## Files changed

| Status | Path |
|---|---|
| M | `AGENTS.md` |
| M | `docs/engineering/STANDARDS.md` |
| M | `docs/engineering/decision-register.md` |
| M | `docs/engineering/INDEX.md` |
| M | `docs/milestones/m0-closure-report.md` |
| M | `docs/milestones/m0-human-usability-checklist.md` |
| M | `docs/milestones/m1-execution-plan.md` |
| M | `docs/milestones/m1-handoff.md` |
| A | `docs/milestones/m1-009-ci-and-security-scanning-spec.md` |
| A | `docs/engineering/prompts/2026/10/2026-10-20-m0-008-milestone-closure-and-browser-policy.prompt.md` |
| A | `docs/engineering/reports/2026/10/2026-10-20-m0-008-milestone-closure-and-browser-policy.report.md` |

No historical report was changed. Not in git: local database change (editor archived), no new
evidence files.

## Tests executed and actual results

| Command | Result |
|---|---|
| `npm run lint` | clean (no output) |
| `npm run test:smoke` | **14/14** (run twice: before and after restart) |
| `npm run test:workflow` | **15/15** |
| `npm run test:persistence` | **7/7** before restart; **7/7** after stop, build and restart |
| `npm run build` | exit 0 (server stopped during the build) |
| `npm audit --json` | 43: 0 low, 38 moderate, 5 high, 0 critical (report only) |

### Browser acceptance (agent-executed)

Claude in Chrome, owner's Chrome ("Browser 2", chosen by the owner when two were connected), a
dedicated tab group, `http://localhost:3000` only, **logged out** (no admin bar, "Log in" shown).
This is a docs-only task, so the STANDARDS smoke scope applies: no editor UI rows and no content
changes. Tab closed afterwards. No screenshots saved.

| # | Check | Role / viewport | Steps | Expected | Actual | Status | Evidence |
|---|---|---|---|---|---|---|---|
| B1 | Home page renders | anonymous / 1440 | Open `/` | Hero, nav, form; no admin UI | Rendered; h1 "Protection you can rely on"; no admin bar; overflow none | PASS | screenshot viewed, not saved |
| B2 | Slideshow navigation | anonymous / 1440 | Click Next → dot 3 → Previous | Active slide 1→2→3→2 | 2, 3, 2 | PASS | DOM active dot after each click |
| B3 | Empty form submit | anonymous / 1440 | Click Send message | Blocked; required fields flagged; no thank-you | fullname, email, message, consent invalid; no thank-you | PASS | `:invalid` list |
| B4 | Invalid email | anonymous / 1440 | Type a name and `not-an-email`; Send | Email error; not sent | "Please include an '@'…"; no thank-you | PASS | validation message |
| B5 | Tablet layout | anonymous / 768 | Home in a same-origin 768 px iframe | Adapts; no horizontal scroll | overflow 0; form 640 px | PASS | screenshot viewed |
| B6 | Mobile layout | anonymous / 375 | Home in a 375 px iframe | Nav wraps; no horizontal scroll | Nav and Log in wrap below the logo; overflow 0; form 328 px | PASS | screenshot viewed |
| B7 | Draft API blocked | anonymous | Open `/api/v1/@apostrophecms/page?aposMode=draft` | forbidden | `{"name":"forbidden"}` | PASS | page text |
| B8 | User API hidden | anonymous | Open `/api/v1/@apostrophecms/user` | not found | `notfound` | PASS | page text |
| B9 | Archived m0-007 page | anonymous | Open `/m0-007-agent-test-demo` | 404 | "404 - Page not found" | PASS | page title |
| B10 | Login page loads | anonymous | Open `/login` | Login form | Form shown | PASS | screenshot viewed |
| — | Valid form submission | — | — | — | Not done, to avoid another stored record; covered by smoke | NOT TESTED | — |
| — | Editor-role UI rows | — | — | — | No UI or content change in this task; the m0-007 23/23 stands | NOT TESTED | — |

**Deviation:** `resize_window` did not change the viewport (it stayed 1440 px, probably because
the window is maximized). Tablet and mobile were checked by loading the page in same-origin
iframes at 768 and 375 px. That triggers the real CSS media queries, but it is not a device
emulator.

## Security observations

- No credentials, tokens or personal data in any file, report or screenshot. The test admin
  credentials were read from `.env` by a scratch script outside the repository and never printed.
- The secret scan of the diff before commit is recorded in the session summary. gitleaks is not
  installed locally, so a pattern scan was used.
- `npm audit` high count rose by one (dev-only `nodemon`). It is not exploitable in production
  (dev dependency), but it is recorded for the m1-009 baseline and the m1-011 re-decision.

## Known limitations

- Human usability acceptance not done (cannot be done by an agent).
- GitHub settings were not re-inspected; D-GIT-3 relies on the m0-007 observation and the
  owner's confirmation.
- Tablet and mobile checks used iframes, not window resizing or real devices; Chrome only.
- `test:workflow` adds test pages and images to the local database on each run (F3, known).

## Unresolved decisions

D-M0-1 (human usability, **M0 gate**) · D-GIT-8 (merge this PR) · D-M1-0 (start M1) · D-CI-1 ·
D-M0-2/3/4/5/7/9/11 · D-DB-2/3/4. See the [decision register](../../../decision-register.md).

## Rollback guidance

Docs only: revert the commit (`git revert <sha>`), or close the PR without merging. To restore
the editor account: Users → archive filter → restore (as admin), or `PATCH {archived: false}`.

## Recommended next step

1. Owner reviews and merges the m0-008 PR.
2. Owner completes the usability checklist and signs closure report §7. On Accept, M0 becomes
   **CLOSED**.
3. Owner approves D-M1-0. Then start **`m1-009`** in a **new Claude Code session**, following the
   [spec](../../../../milestones/m1-009-ci-and-security-scanning-spec.md).
