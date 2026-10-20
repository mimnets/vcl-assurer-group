# Milestone 0 — Closure report

| | |
|---|---|
| **Status** | **PENDING** (re-assessed in `m0-008`, 2026-10-20). Every technical and process gate is met: m0-007 is merged (PR #9), the regression suite and production build pass, the agent browser run passed 23/23 (m0-007) and a public-site smoke check passed (m0-008), the branch-protection risk is accepted (D-GIT-3), and the test editor account is archived (D-M0-10). **One gate is still open: human usability acceptance (D-M0-1).** No human acceptance is recorded in the repository. That gate is **not waived**. The owner signs off in §7. |
| **Prepared** | 2026-10-19 (`m0-005`); updated 2026-10-19 after the PR #1 merge (m0-005 reconciliation) in the final closure check (`m0-006`) and after the browser acceptance run (`m0-007`); reconciled 2026-10-20 (`m0-008`) |
| **Milestone tasks** | m0-001 · m0-002 · m0-003 · m0-004 · m0-005 · m0-006 · m0-007 · m0-008 (see [INDEX](../engineering/INDEX.md)) |
| **Repository** | `github.com/mimnets/vcl-assurer-group` (private). `main` = `80bc50c` (merge of PR #9, m0-007), verified by fetch 2026-10-20 (`m0-008`). Its tree equals the reviewed m0-007 head `a3324ea`. |
| **Closed by** | *(open: the owner fills in §7)* |

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

Latest runs (2026-10-20, `m0-008`): lint clean · smoke **14/14** · editor workflow **15/15** ·
persistence **7/7**, both before and after a server restart · production build **passes**.
Public-site browser smoke check (Claude in Chrome, logged out): home page, slideshow navigation,
form validation, tablet and mobile layouts (0 px overflow) and logged-out access controls all
PASS ([m0-008 report](../engineering/reports/2026/10/2026-10-20-m0-008-milestone-closure-and-browser-policy.report.md)).
The 23/23 editor checklist run is from m0-007. All browser runs are **agent-executed**, and human
usability acceptance is still required.

## 4. Closure gates

| Gate | Blocking? | Status |
|---|---|---|
| Human editor walkthrough passes ([checklist](./m0-editor-acceptance-checklist.md)), recorded in the repository | **Yes** | **OPEN (not waived).** Agent-executed browser run: 23/23 PASS ([m0-007 report](../engineering/reports/2026/10/2026-10-19-m0-007-browser-editor-acceptance.report.md)). No human acceptance was recorded by 2026-10-20 (checked in m0-008). **Owner:** complete the [short checklist](./m0-human-usability-checklist.md) and sign §7 (D-M0-1). |
| M0-004 post-push-results PR merged | **Yes** | ✅ **Done:** PR #1 merged by the owner as `96039f8`; the merged tree equals the reviewed head `9f9fe12` (verified) |
| M0-005 documentation PR (this closure report, checklist, register, index, m0-005 records) merged | **Yes** | ✅ **Done:** PR #2 merged as `003aac3`; merged tree equals the reviewed head `0ea6333` (verified in m0-006) |
| M0-007 PR merged | **Yes** | ✅ **Done:** PR #9 merged as `80bc50c`; merged tree equals the reviewed head `a3324ea` (verified in m0-008) |
| GitHub branch protection checked by the owner and its **actual** status documented | **Yes** | **Checked (m0-007): `main` is NOT protected.** No rulesets; no classic protection; GitHub states rulesets are not enforced on this private repository without GitHub Team; Dependabot off; secret scanning not offered. ✅ **Documented and decided:** risk accepted as a temporary exception; compensating controls and a review trigger are recorded in D-GIT-3. |
| Required application tests pass | **Yes** | ✅ lint, 14/14, 15/15, 7/7 and build (m0-008, 2026-10-20) |
| No unresolved critical blocking issue | **Yes** | ✅ none (m0-008). The unprotected `main` is an accepted, documented process risk (D-GIT-3). `npm audit` shows 0 critical findings (43 in total, 5 high, all upstream; carried as D-M0-5). |
| Disposable test accounts cleaned up | No (hygiene) | ✅ `m0-007-demo-editor` **archived** through the core REST API by the local admin (m0-008, D-M0-10). Not deleted. Its password was already unknown. |

## 5. Carried into Milestone 1 (not M0 blockers)

D-M0-2 (PostgreSQL acceptance test) · D-M0-3/4 (form email, submission access and retention) ·
D-M0-5 (security findings S1–S9) · D-M0-7 (licensing sign-off) · D-DB-2/3/4 (provider, media
storage, RPO/RTO) · D-CI-1 (CI workflow, specified in [m1-009 spec](./m1-009-ci-and-security-scanning-spec.md)) · D-M0-9 (backup archives hold secrets) ·
D-M0-11 (editor access to Global Styles, review before staff rollout). See the
[decision register](../engineering/decision-register.md), the
[M1 execution plan](./m1-execution-plan.md) and the [M1 handoff](./m1-handoff.md).

## 6. Recommendation

Close Milestone 0 once the owner has signed §7. Nothing else blocks closure. Then, in a
**new Claude Code session**, approve the start of Milestone 1 (D-M1-0) and begin with `m1-009`
(CI, [specification](./m1-009-ci-and-security-scanning-spec.md)), on a feature branch through a PR.

## 7. Owner sign-off (human usability acceptance, D-M0-1)

To be completed **by the project owner**, not by an agent. About 10 minutes: run
`npm run dev`, use your own editor account, and answer the 10 questions in the
[human usability checklist](./m0-human-usability-checklist.md). Record the result below in a
pull request. No passwords. Filling this in replaces the separate dated report the checklist
mentions, so the task-ID sequence is unaffected.

| Field | Entry |
|---|---|
| Reviewer name and role | |
| Date | |
| Checklist questions 1–8 and 10 | Yes / No (notes for any No) |
| Question 9 (editors and Global Styles) | Keep core default / restrict in M1 (updates D-M0-11) |
| Evidence reviewed (`evidence/m0-007/`, local) | Yes / No |
| **Decision** | **Accept** / **Reject** |
| Notes | |

On **Accept**: set the Status above to **CLOSED**, fill in **Closed by**, and close D-M0-1 in the
[decision register](../engineering/decision-register.md). On **Reject**: list the issues; they
become M0 fix tasks under the next free task ID.
