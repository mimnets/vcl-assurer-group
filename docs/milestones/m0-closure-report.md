# Milestone 0 — Closure report

| | |
|---|---|
| **Status** | **PENDING** (re-assessed in `m0-007`, 2026-10-19). The agent-executed browser run passed all 23 checklist rows, and branch protection is now checked: **`main` is unprotected**. D-GIT-3 has since been decided: the risk is **accepted** as a temporary exception with compensating controls (m0-007 finalization). **Remaining:** the owner completes and records the human usability checklist (D-M0-1); after that and the PR merge are verified, a documentation-only closure update follows under the next unused task ID. |
| **Prepared** | 2026-10-19 (`m0-005`); updated 2026-10-19 after the PR #1 merge (m0-005 reconciliation) in the final closure check (`m0-006`) and after the browser acceptance run (`m0-007`) |
| **Milestone tasks** | m0-001 · m0-002 · m0-003 · m0-004 · m0-005 · m0-006 · m0-007 (see [INDEX](../engineering/INDEX.md)) |
| **Repository** | `github.com/mimnets/vcl-assurer-group` (private). `main` = `ef7bbc8` (merge of PR #3, m0-006), verified 2026-10-19 (`m0-007`). |
| **Closed by** | *(name, date, once human usability acceptance is recorded)* |

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
| New page creation | ✅ | Browser UI as Editor (m0-007, rows 1–2) |
| Editing text directly on the page | ✅ | UI (headless) |
| Adding and rearranging widgets | ✅ | Browser UI (m0-007, rows 4, 7; arrows on the page, drag in the slides list) |
| Uploading and replacing images | ✅ | Browser UI (m0-007, rows 5–6) |
| Responsive rendering | ✅ | UI at 1440/768/375 px |
| Contact form validation | ✅ | HTTP + UI |
| Draft and publish workflow | ✅ | UI + API |
| Restart persistence | ✅ | Restart, plus relocation, plus restored backup |
| No paid-license requirement | ✅ | Dependency audit |
| Styles Editor | ✅ | Browser UI (m0-007, rows 12–13; available to editors, finding F1) |

Latest runs (2026-10-19, `m0-007`): agent-executed browser checklist **23/23 PASS**; lint clean,
smoke 14/14, editor workflow 15/15, persistence 7/7 (production build passed in m0-006). The
browser run is **agent-executed**; human usability acceptance is still required.

## 4. Closure gates

| Gate | Blocking? | Status |
|---|---|---|
| Human editor walkthrough passes ([checklist](./m0-editor-acceptance-checklist.md)), recorded in a dated report | **Yes** | **Partly done.** Agent-executed browser run: 23/23 PASS ([m0-007 report](../engineering/reports/2026/10/2026-10-19-m0-007-browser-editor-acceptance.report.md)). **Open:** the owner reviews the evidence and records human usability acceptance ([short checklist](./m0-human-usability-checklist.md)) (D-M0-1). |
| M0-004 post-push-results PR merged | **Yes** | ✅ **Done:** PR #1 merged by the owner as `96039f8`; the merged tree equals the reviewed head `9f9fe12` (verified) |
| M0-005 documentation PR (this closure report, checklist, register, index, m0-005 records) merged | **Yes** | ✅ **Done:** PR #2 merged as `003aac3`; merged tree equals the reviewed head `0ea6333` (verified in m0-006) |
| GitHub branch protection checked by the owner and its **actual** status documented | **Yes** | **Checked (m0-007): `main` is NOT protected.** No rulesets; no classic protection; GitHub states rulesets are not enforced on this private repository without GitHub Team; Dependabot off; secret scanning not offered. ✅ **Documented and decided:** risk accepted as a temporary exception; compensating controls and a review trigger are recorded in D-GIT-3. |
| Required application tests pass | **Yes** | ✅ lint, 14/14, 15/15, 7/7 (m0-007); build (m0-006) |
| No unresolved critical blocking issue | **Yes** | ✅ none in the application (m0-007). The unprotected `main` is an accepted, documented process risk (D-GIT-3). |

## 5. Carried into Milestone 1 (not M0 blockers)

D-M0-2 (PostgreSQL acceptance test) · D-M0-3/4 (form email, submission access and retention) ·
D-M0-5 (security findings S1–S9) · D-M0-7 (licensing sign-off) · D-DB-2/3/4 (provider, media
storage, RPO/RTO) · D-CI-1 (CI workflow) · D-M0-9 (backup archives hold secrets). See the
[decision register](../engineering/decision-register.md), the
[M1 execution plan](./m1-execution-plan.md) and the [M1 handoff](./m1-handoff.md).

## 6. Recommendation

Close Milestone 0 once the owner has recorded human usability acceptance (D-GIT-3 is decided).
Then fill in **Closed by** above, set the status to **CLOSED**, and start Milestone 1 in a new
session with `m1-008` (CI), then the PostgreSQL acceptance test (`m1-009`), each on a feature
branch through a PR.
