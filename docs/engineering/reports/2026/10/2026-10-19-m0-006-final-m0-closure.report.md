# Final Milestone 0 closure verification and M1 readiness

| | |
|---|---|
| **Task** | m0-006 |
| **Date** | 2026-10-19 (execution from 18:24 +06:00, local date) |
| **Scope** | Verify the repository state after the m0-005 merge, re-run every check, verify governance and hygiene, add the session policy, and close Milestone 0 only if all gates pass. Plan Milestone 1. |
| **Prompt** | [`2026-10-19-m0-006-final-m0-closure.prompt.md`](../../../prompts/2026/10/2026-10-19-m0-006-final-m0-closure.prompt.md) |
| **Branch / commit** | Base `main` = `003aac3ea8a850bf897f09aef694485daf2e189f`. Work on `docs/m0-006-final-m0-closure`. This report is part of that branch's commit, so the commit SHA is the branch head shown in the PR. |
| **Related** | [PR #2](https://github.com/mimnets/vcl-assurer-group/pull/2) · [M0 closure report](../../../../milestones/m0-closure-report.md) · [editor checklist](../../../../milestones/m0-editor-acceptance-checklist.md) · [M1 plan](../../../../milestones/m1-execution-plan.md) · [M1 handoff](../../../../milestones/m1-handoff.md) · [m0-005 reconciliation report](./2026-10-19-m0-005-git-reconciliation-and-closure.report.md) |

## Requirements

Verify the Git state and the m0-005 merge; run or prepare the human editor walkthrough; verify
GitHub governance; check security hygiene; run the full regression suite; add a permanent
session policy to AGENTS.md; close Milestone 0 only if every gate passes; plan Milestone 1;
publish on a feature branch without merging.

## Work completed

### 1. Start-of-session verification

| Item | Result |
|---|---|
| Documents read | AGENTS.md, CLAUDE.md, README.md, ADR-0001, ADR-0002, decision register, INDEX, M0 closure report, editor checklist, STANDARDS, git-and-ci, m0-004 and m0-005 reports, M0 security review and feature verification |
| Local state at start | Branch `docs/m0-005-governance-closure` at `0ea6333`; clean working tree; no uncommitted work |
| `git fetch --prune origin` | `main 96039f8..003aac3` |
| **m0-005 merge** | `003aac3` = "Merge pull request #2 from mimnets/docs/m0-005-governance-closure", parents `96039f8` + `0ea6333`, author Monirul Islam. **The merged tree equals the reviewed PR head tree** (`cc7a3fb`). Confirmed. |
| Reconciliation | Local `main` fast-forwarded (`--ff-only`) to `003aac3`; branch `docs/m0-006-final-m0-closure` created from it. No reset, no force. |
| Remote refs | `main` = `003aac3`; `docs/m0-004-post-push-results` and `docs/m0-005-governance-closure` still exist on the remote (merged; the owner can delete them) |

### 2. Editor acceptance

**No human walkthrough was performed.** It requires a person; the agent cannot perform it or
stand in for one. The Chrome browser extension was **not connected** in this session, so no
automated UI run was possible either.

What was verified automatically (this is **not** a human walkthrough):

| Prompt item | Automated evidence (this run) | Human walkthrough |
|---|---|---|
| 1 Editor login | Admin API login; wrong password rejected (workflow 15/15). The test uses the **admin** account, not an editor. | Pending (row 1) |
| 2 New page creation | Draft page available via API | Pending (row 2) |
| 3 Direct text editing | Rich-text edited in draft via API | Pending (row 3) |
| 4–5 Add, rearrange, remove widgets | Widgets added and reordered via API | Pending (rows 4, 7) |
| 6 Image upload and replacement | Upload and replacement via API; the published page shows the new image | Pending (rows 5–6) |
| 7 Slideshow configuration and order | Smoke: 3 slides render. Configuration not tested. | Pending (row 21, new) |
| 8 Responsive previews | Not re-run (M0 headless run at 1440/768/375 px) | Pending (row 14) |
| 9 Styles Editor | Not re-run | Pending (rows 12–13; N/A if the editor role lacks access) |
| 10–12 Draft, publish, unpublished not public | Workflow: draft hidden from public, publish shows edits, later draft hidden | Pending (rows 8–10) |
| 13 Revert | Workflow: draft reverted to published | Pending (row 11) |
| 14–15 Form validation | Smoke: empty → 400 with 4 required errors; bad email → 400 | Pending (rows 15–16) |
| 16 Submission and persistence | Smoke: valid submission → 200. Storage was **not** independently re-checked in this run (M0 verified it). | Pending (rows 17, 22) |
| 17 Logout and unauthorized access | Workflow revokes its bearer token (logout) with no warning. Anonymous `GET /api/v1/@apostrophecms/page?aposMode=draft` → **403**; user, image, global and form-submission APIs → **404**; an invalid bearer token → **401**; `/login` → 200. | Pending (rows 20, 23) |

The checklist gained rows **21–23** (slideshow configuration and ordering, submission
persistence, access after logout) and a note that the Styles panel may be N/A for an editor
role, so it now covers all 17 prompt items. The owner's instructions (setup, use of a personal
**editor** account, pass criteria, results template) are in the
[checklist](../../../../milestones/m0-editor-acceptance-checklist.md).

**Gate status: PENDING (D-M0-1).**

### 3. GitHub governance

**Not verified.** Nothing in this session could read the repository settings:

- No GitHub CLI is installed, and the browser extension was not connected.
- The anonymous REST API returns **404** for the repository, `branches/main` and
  `rules/branches/main`: the repository is private.
- Stored git credentials were **not** extracted, and protection was **not** tested by push,
  force push or deletion.

So the status of the items below is **unknown**: `main` branch protection, rulesets, force-push
and deletion restrictions, PR requirements, Dependabot alerts, secret scanning. Nothing was
configured or weakened.

History is consistent with PR-only work: all post-import changes reached `main` through PRs #1
and #2. That is not evidence of protection.

**Owner steps (about 10 minutes), github.com → `mimnets/vcl-assurer-group` → Settings:**

1. **Rules → Rulesets → New ruleset → New branch ruleset.** Name `main`; Enforcement **Active**;
   Target branches → **Include default branch**. Enable:
   - **Restrict deletions**
   - **Block force pushes**
   - **Require a pull request before merging.** For a single maintainer, set *Required approvals*
     to **0**: GitHub does not let authors approve their own PRs, so 1 would block every merge.
     Raise it to 1 (2 for ADR or security changes, per `git-and-ci.md`) when a second reviewer
     joins.
   - *(After `m1-007`)* **Require status checks to pass** → the CI job.
   - Leave the bypass list **empty**. Save.
2. If **Rulesets** is not offered, or shows "not enforced": rulesets and branch protection on
   **private** repositories need GitHub Pro, Team or Enterprise. Either upgrade, or record
   "not available on the current plan" as the actual status, and decide on D-GIT-3.
3. **Code security** (Settings → Code security): enable **Dependabot alerts** and **Dependabot
   security updates**. Check whether **Secret scanning** and **Push protection** are offered
   for this private repository on your plan, and enable them if so.
4. Record the actual result for every item above in a dated report or in D-GIT-3. A screenshot
   of the ruleset page is fine; it contains no secrets.

**Gate status: OPEN (D-GIT-3).**

### 4. Security and project hygiene

| Check | Result |
|---|---|
| Secrets tracked by Git | None. Only `.env.example` is tracked. A pattern scan of tracked files (session secret, test password, bearer tokens, GitHub and AWS tokens, private keys) found only a `…` placeholder in `docs/milestones/m0-feature-verification.md`. |
| `.env` private | Git-ignored (`.gitignore:1`); ACL: SYSTEM, Administrators and the local user only. Its values were not printed. |
| `data/`, `public/uploads/`, `public/apos-frontend/` | Git-ignored |
| Test credentials | Only in `.env`. The plaintext `data/.local-admin-password` (S8) is gone. |
| Active test bearer tokens | The workflow suite logs out (revokes its token) at the end of each run; no logout warning appeared in either run this session. The token store itself was not inspected (no raw database access, per ADR-0002). |
| Legacy destructive scripts | `deployment/` absent; no `scripts/sync-*`; `scripts/` holds only the two test scripts |
| Commercial modules | No `@apostrophecms-pro/*` installed. Direct dependencies unchanged since M0 (`npm ls --depth=0`); `gcp-metadata` and `is-stream` extraneous, as documented in the M0 installation report. |
| Backups | m0-004 recovery backup (`../vcl-assurer-group-backups/2026-10-19-m0-004-pre-git/`): `sha256sum -c` **OK** for both files. **New in m0-006:** `../vcl-assurer-group-backups/2026-10-19-m0-006/` with `database.jsonl` (`apos-db-dump`, 201 lines) and `uploads.tgz` (`public/uploads`, 10.5 MB), plus `SHA256SUMS`; `sha256sum -c` **OK**. Outside the repository. |
| Restore verified | Previously, in m0-003 (portable JSONL export and restore on SQLite, ADR-0002 §2). The new dump was **not** restore-tested: `apos-db-restore` needs explicit approval. |
| `npm audit --omit=dev` | 42 findings (38 moderate, **4 high**: `apostrophe` ← `nunjucks` ← `chokidar` ← `braces`, plus the TipTap and `underscore.string` chains). Down from 43/5 at M0. The fix offered is a core downgrade, so it was not applied. |

**New risk (for M1):** both backup folders hold secrets and are not encrypted. The m0-004
`project.tar.gz` contains `.env` and the old, rotated password file; the m0-006 dump contains
user records (password hashes). Encrypt them or delete them when no longer needed. This does not
block M0: they are local, outside git, and the password in the old archive has been rotated.

Existing findings S1–S7 and S9 remain open for M1 (D-M0-5). Nothing was implemented here.

### 5. Regression verification

Run against the local server (`node app.js`, PID owned by this project, `127.0.0.1:3000`).

| Command | Result |
|---|---|
| `npm run lint` | **Pass** (exit 0, no findings) |
| `npm run test:smoke` | **14/14** |
| `npm run test:workflow` | **15/15** |
| `npm run test:persistence` | **7/7** |
| `APOS_RELEASE_ID=m0-006-verify npm run build` | **Pass** (exit 0; output in the git-ignored `public/apos-frontend/releases/m0-006-verify/`) |

No failures, and no code was changed. The workflow suite adds or updates its own test page and
media in the local database, as in earlier runs.

### 6. Session policy

AGENTS.md gained a section, **"Sessions and context (Claude Code and other agents)"**, with all
seven standards from the prompt. CLAUDE.md is unchanged: it still only imports AGENTS.md.

### 7. Milestone 0 closure

| Gate | Status |
|---|---|
| 1. Required application tests pass | ✅ (§5) |
| 2. Editor acceptance, including a genuine human walkthrough | ❌ **Open**: not performed (D-M0-1) |
| 3. M0-005 documentation merged | ✅ PR #2 → `003aac3`; tree verified (§1) |
| 4. Branch protection checked and accurately documented | ❌ **Open**: could not be checked; documented as unverified (D-GIT-3) |
| 5. No unresolved critical blocking issue | ✅ None found. The open items are gates 2 and 4. |

**Milestone 0 remains PENDING.** No criterion was waived.

### 8. Milestone 1 plan and handoff

[`m1-execution-plan.md`](../../../../milestones/m1-execution-plan.md): five workstreams in
priority order (CI → PostgreSQL → hardening → form operations → content architecture, with the
WordPress inventory able to run in parallel). The prompt's labels "M1-001…005" would reuse task
numbers, which STANDARDS forbids, so they are WS-1…WS-5 with expected IDs `m1-007`…`m1-011`.
[`m1-handoff.md`](../../../../milestones/m1-handoff.md) has the state, risks, the next action
and the first task (`m1-007`).

## Files changed (branch `docs/m0-006-final-m0-closure` vs `main` `003aac3`)

| Status | Path |
|---|---|
| M | `AGENTS.md` |
| A | `docs/engineering/prompts/2026/10/2026-10-19-m0-006-final-m0-closure.prompt.md` |
| A | `docs/engineering/reports/2026/10/2026-10-19-m0-006-final-m0-closure.report.md` |
| M | `docs/engineering/INDEX.md` |
| M | `docs/engineering/decision-register.md` |
| M | `docs/milestones/m0-closure-report.md` |
| M | `docs/milestones/m0-editor-acceptance-checklist.md` |
| A | `docs/milestones/m1-execution-plan.md` |
| A | `docs/milestones/m1-handoff.md` |

No application, configuration, dependency, database or media changes in git. Outside git: the
new backup folder (§4) and the build output (§5).

## Tests executed and actual results

See §5 (lint, 14/14, 15/15, 7/7, build passes), §1 (merge tree equality), §4 (backup checksums;
anonymous API status codes). Not run: a human walkthrough, an automated browser walkthrough
(extension not connected), any GitHub settings check, and a restore of the new dump.

## Security observations

See §4. No credentials were read, printed or extracted. Git transport used the existing
credential manager only.

## Known limitations

- Without settings access the agent cannot verify GitHub protection or code-security features.
- The automated workflow suite runs as **admin**, so it says nothing about the editor role's
  permissions. Only the human walkthrough covers that.

## Unresolved decisions

D-M0-1 (walkthrough) and D-GIT-3 (protection) block closure. Carried to M1: D-M0-2/3/4/5/7,
D-DB-2/3/4, D-CI-1. New: D-M0-9 (backup archive handling), D-GIT-6 (merge this PR), D-M1-0 (start M1). See the
[decision register](../../../decision-register.md).

## Rollback guidance

Docs-only branch. If unmerged, close the PR and delete the branch. After a merge, revert the
merge commit through a PR. The new backup folder can be deleted without affecting the project.

## Recommended next step

The owner merges this PR, runs the walkthrough, and checks and applies branch protection (§3). Then
close M0 in the closure report and approve M1, starting with `m1-007` in a **new Claude Code
session**.
