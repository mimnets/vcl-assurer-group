# Milestone 0 — Closure report

| | |
|---|---|
| **Status** | **PENDING.** Closure requires (1) the human editor walkthrough to pass, (2) the M0-005 documentation PR to be merged, and (3) GitHub branch protection to be checked with its actual status documented. |
| **Prepared** | 2026-10-19 (`m0-005`); updated 2026-10-19 after the PR #1 merge (m0-005 reconciliation) |
| **Milestone tasks** | m0-001 · m0-002 · m0-003 · m0-004 · m0-005 (see [INDEX](../engineering/INDEX.md)) |
| **Repository** | `github.com/mimnets/vcl-assurer-group` (private). `main` = `96039f8d7160cb01bdc9f9604f6d47d0e068f660` (merge of PR #1), verified 2026-10-19 18:15 +06:00. |
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

All automated suites passed on the latest run (2026-10-19, after the push): lint clean, smoke
14/14, editor workflow 15/15, persistence 7/7.

## 4. Closure gates

| Gate | Blocking? | Status |
|---|---|---|
| Human editor walkthrough passes ([checklist](./m0-editor-acceptance-checklist.md)), recorded in a dated report | **Yes** | Open (D-M0-1) |
| M0-004 post-push-results PR merged | **Yes** | ✅ **Done:** PR #1 merged by the owner as `96039f8`; the merged tree equals the reviewed head `9f9fe12` (verified) |
| M0-005 documentation PR (this closure report, checklist, register, index, m0-005 records) merged | **Yes** | Open: branch `docs/m0-005-governance-closure` pushed; PR awaiting the owner (D-GIT-5) |
| GitHub branch protection checked by the owner and its **actual** status documented | **Yes** | Open: not verified (D-GIT-3). The agent cannot read repository settings. |

## 5. Carried into Milestone 1 (not M0 blockers)

D-M0-2 (PostgreSQL acceptance test) · D-M0-3/4 (form email, submission access and retention) ·
D-M0-5 (security findings S1–S9) · D-M0-7 (licensing sign-off) · D-DB-2/3/4 (provider, media
storage, RPO/RTO) · D-CI-1 (CI workflow). See the [decision register](../engineering/decision-register.md).

## 6. Recommendation

Close Milestone 0 once the walkthrough passes, the M0-005 documentation PR is merged, and the branch-protection status has been checked and recorded. Start
Milestone 1 with the `main` ruleset in place, then CI (D-CI-1) and the PostgreSQL acceptance
test (D-M0-2), each on a feature branch through a PR.
