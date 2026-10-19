# Milestone 0 — Closure report

| | |
|---|---|
| **Status** | **PENDING** (re-assessed in `m0-006`, 2026-10-19). Two gates remain: (1) the human editor walkthrough must pass, and (2) the GitHub branch-protection status must be checked and its actual status documented. The M0-005 PR is merged and all automated checks pass. |
| **Prepared** | 2026-10-19 (`m0-005`); updated 2026-10-19 after the PR #1 merge (m0-005 reconciliation) and in the final closure check (`m0-006`) |
| **Milestone tasks** | m0-001 · m0-002 · m0-003 · m0-004 · m0-005 · m0-006 (see [INDEX](../engineering/INDEX.md)) |
| **Repository** | `github.com/mimnets/vcl-assurer-group` (private). `main` = `003aac3ea8a850bf897f09aef694485daf2e189f` (merge of PR #2), verified 2026-10-19 18:24 +06:00 (`m0-006`). |
| **Closed by** | *(name, date, once the walkthrough passes)* |

## 1. Objective

Establish a clean, maintainable, self-hosted ApostropheCMS Community Edition foundation for the
Assurer World site, with a minimal proof of concept and a governance baseline. No full site
rebuild.

## 2. Delivered

| Area | Outcome | Evidence |
|---|---|---|
| Platform | ApostropheCMS 4.34.0 Community Edition on the Essentials starter; no paid modules | [ADR-0001](../architecture/decisions/ADR-0001-cms-platform-and-starter.md) (accepted), [license audit](./m0-architecture-and-license-audit.md) |
| Proof of concept | Demo home page: hero, slideshow, product cards, contact form, all labelled as demo | [feature verification](./m0-feature-verification.md) |
| Data strategy | SQLite local and tests; PostgreSQL for staging/production after an acceptance test; native APIs only; per-site isolation; portable export verified on SQLite | [ADR-0002](../architecture/decisions/ADR-0002-database-strategy.md) (accepted), [m0-003 report](../engineering/reports/2026/10/2026-10-19-m0-003-database-strategy.report.md) |
| Security baseline | Patched versions; session secret required; loopback binding; form limits and server-side validation; test credentials rotated; no secrets in git | [security review](./m0-security-review.md), [m0-004 report](../engineering/reports/2026/10/2026-10-19-m0-004-safe-git-initialization.report.md) |
| Governance | AGENTS.md rules; dated prompt/report convention; ADRs; runbooks; decision register | [m0-002 report](../engineering/reports/2026/10/2026-10-19-m0-002-engineering-governance.report.md) |
| Repository | Initial import pushed after safety checks; legacy destructive scripts removed; verified recovery backup | [m0-004 report](../engineering/reports/2026/10/2026-10-19-m0-004-safe-git-initialization.report.md) |

## 3. Acceptance criteria (from the M0 brief)

| Criterion | Status | How verified |
|---|---|---|
| Administrator login | ✅ | UI (headless) + API |
| New page creation | ⚠️ API only | **Walkthrough rows 1–2** |
| Editing text directly on the page | ✅ | UI (headless) |
| Adding and rearranging widgets | ⚠️ add/reorder via API; add menu via UI | **Walkthrough rows 4, 7** |
| Uploading and replacing images | ⚠️ API only | **Walkthrough rows 5–6** |
| Responsive rendering | ✅ | UI at 1440/768/375 px |
| Contact form validation | ✅ | HTTP + UI |
| Draft and publish workflow | ✅ | UI + API |
| Restart persistence | ✅ | Restart, plus relocation, plus restored backup |
| No paid-license requirement | ✅ | Dependency audit |
| Styles Editor | ⚠️ opens in UI; change applied via API | **Walkthrough rows 12–13** |

All automated suites passed on the latest run (2026-10-19, `m0-006`): lint clean, smoke 14/14,
editor workflow 15/15, persistence 7/7, production asset build succeeds. The ⚠️ rows still
need the human walkthrough; automated checks don't replace it.

## 4. Closure gates

| Gate | Blocking? | Status |
|---|---|---|
| Human editor walkthrough passes ([checklist](./m0-editor-acceptance-checklist.md)), recorded in a dated report | **Yes** | Open (D-M0-1): not performed as of m0-006. The checklist now covers all items in the m0-006 prompt (rows 1–23). |
| M0-004 post-push-results PR merged | **Yes** | ✅ **Done:** PR #1 merged by the owner as `96039f8`; the merged tree equals the reviewed head `9f9fe12` (verified) |
| M0-005 documentation PR (this closure report, checklist, register, index, m0-005 records) merged | **Yes** | ✅ **Done:** PR #2 merged as `003aac3`; merged tree equals the reviewed head `0ea6333` (verified in m0-006) |
| GitHub branch protection checked by the owner and its **actual** status documented | **Yes** | Open: still not verified in m0-006 (D-GIT-3). Private repository; no CLI, browser or API access to settings. Owner steps: [m0-006 report §3](../engineering/reports/2026/10/2026-10-19-m0-006-final-m0-closure.report.md#3-github-governance). |
| Required application tests pass | **Yes** | ✅ lint, 14/14, 15/15, 7/7, build (m0-006) |
| No unresolved critical blocking issue | **Yes** | ✅ none found (m0-006) |

## 5. Carried into Milestone 1 (not M0 blockers)

D-M0-2 (PostgreSQL acceptance test) · D-M0-3/4 (form email, submission access and retention) ·
D-M0-5 (security findings S1–S9) · D-M0-7 (licensing sign-off) · D-DB-2/3/4 (provider, media
storage, RPO/RTO) · D-CI-1 (CI workflow) · D-M0-9 (backup archives hold secrets). See the
[decision register](../engineering/decision-register.md), the
[M1 execution plan](./m1-execution-plan.md) and the [M1 handoff](./m1-handoff.md).

## 6. Recommendation

Close Milestone 0 once the walkthrough passes and the branch-protection status has been checked
and recorded. Then fill in **Closed by** above, set the status to **CLOSED**, and start
Milestone 1 in a new session with `m1-007` (CI), then the PostgreSQL acceptance test (`m1-008`),
each on a feature branch through a PR.
