# Milestone 0 — Closure report

| | |
|---|---|
| **Status** | **CLOSED — 2026-10-20.** The owner accepted human usability (D-M0-1) on 2026-10-20 (§7). Every other gate was re-verified the same day in `m1-009` (§4). *History:* PENDING in `m0-008` (2026-10-20) with D-M0-1 as the only open gate. |
| **Prepared** | 2026-10-19 (`m0-005`); updated 2026-10-19 after the PR #1 merge (m0-005 reconciliation) in the final closure check (`m0-006`) and after the browser acceptance run (`m0-007`); reconciled 2026-10-20 (`m0-008`); closure recorded 2026-10-20 (`m1-009`, documentation-only commit) |
| **Milestone tasks** | m0-001 · m0-002 · m0-003 · m0-004 · m0-005 · m0-006 · m0-007 · m0-008 (see [INDEX](../engineering/INDEX.md)) |
| **Repository** | `github.com/mimnets/vcl-assurer-group` (private). `main` = `1ed5f54` (merge of PR #10, m0-008), verified by fetch 2026-10-20 (`m1-009`). Its tree equals the reviewed m0-008 head `aa53a17`. (Earlier: `80bc50c`, PR #9, m0-007.) |
| **Closed by** | Project owner (repository owner), decision **Accept** conveyed through ChatGPT on 2026-10-20 and recorded by the agent in `m1-009`. See §7. Not a handwritten signature. |

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
The 23/23 editor checklist run is from m0-007. All browser runs are **agent-executed**. Human
usability acceptance was given by the owner on 2026-10-20 (§7).

Re-run at closure (2026-10-20, `m1-009`, before any m1-009 change, against the local server):
lint clean · smoke **14/14** · editor workflow **15/15** · persistence **7/7**.

## 4. Closure gates

| Gate | Blocking? | Status |
|---|---|---|
| Human editor walkthrough passes ([checklist](./m0-editor-acceptance-checklist.md)), recorded in the repository | **Yes** | ✅ **Accepted by the owner, 2026-10-20** (§7, D-M0-1 closed). Basis: the agent-executed browser run, 23/23 PASS ([m0-007 report](../engineering/reports/2026/10/2026-10-19-m0-007-browser-editor-acceptance.report.md)), plus the owner's own usability decision. The repository does not record which checklist steps the owner personally performed. |
| M0-004 post-push-results PR merged | **Yes** | ✅ **Done:** PR #1 merged by the owner as `96039f8`; the merged tree equals the reviewed head `9f9fe12` (verified) |
| M0-005 documentation PR (this closure report, checklist, register, index, m0-005 records) merged | **Yes** | ✅ **Done:** PR #2 merged as `003aac3`; merged tree equals the reviewed head `0ea6333` (verified in m0-006) |
| M0-007 PR merged | **Yes** | ✅ **Done:** PR #9 merged as `80bc50c`; merged tree equals the reviewed head `a3324ea` (verified in m0-008) |
| M0-008 PR merged | **Yes** | ✅ **Done:** PR #10 merged as `1ed5f54`; merged tree equals the reviewed head `aa53a17` (verified by fetch in m1-009) |
| GitHub branch protection checked by the owner and its **actual** status documented | **Yes** | **Checked (m0-007): `main` is NOT protected.** No rulesets; no classic protection; GitHub states rulesets are not enforced on this private repository without GitHub Team; Dependabot off; secret scanning not offered. ✅ **Documented and decided:** risk accepted as a temporary exception; compensating controls and a review trigger are recorded in D-GIT-3. |
| Required application tests pass | **Yes** | ✅ lint, 14/14, 15/15, 7/7 and build (m0-008, 2026-10-20); lint, 14/14, 15/15, 7/7 re-run 2026-10-20 (m1-009) |
| No unresolved critical blocking issue | **Yes** | ✅ none (m0-008; re-checked in m1-009). The unprotected `main` is an accepted, documented process risk (D-GIT-3), **not** a technical protection. `npm audit` shows 0 critical findings (43 in total, 5 high, all upstream; carried as D-M0-5). |
| Disposable test accounts cleaned up | No (hygiene) | ✅ `m0-007-demo-editor` **archived** through the core REST API by the local admin (m0-008, D-M0-10). Not deleted. Its password was already unknown. Re-checked 2026-10-20 (m1-009, read-only REST query): the only active user is `admin`; the test editor is archived. |

## 5. Carried into Milestone 1 (not M0 blockers)

D-M0-2 (PostgreSQL acceptance test) · D-M0-3/4 (form email, submission access and retention) ·
D-M0-5 (security findings S1–S9) · D-M0-7 (licensing sign-off) · D-DB-2/3/4 (provider, media
storage, RPO/RTO) · D-CI-1 (CI workflow, specified in [m1-009 spec](./m1-009-ci-and-security-scanning-spec.md)) · D-M0-9 (backup archives hold secrets) ·
D-M0-11 (editor access to Global Styles, review before staff rollout). See the
[decision register](../engineering/decision-register.md), the
[M1 execution plan](./m1-execution-plan.md) and the [M1 handoff](./m1-handoff.md).

## 6. Recommendation

Done. Milestone 0 is **CLOSED** (2026-10-20). The owner also approved the start of Milestone 1
(D-M1-0), beginning with `m1-009` (CI, [specification](./m1-009-ci-and-security-scanning-spec.md)),
on a feature branch through a PR.

## 7. Owner sign-off (human usability acceptance, D-M0-1)

To be completed **by the project owner**, not by an agent. About 10 minutes: run
`npm run dev`, use your own editor account, and answer the 10 questions in the
[human usability checklist](./m0-human-usability-checklist.md). Record the result below in a
pull request. No passwords. Filling this in replaces the separate dated report the checklist
mentions, so the task-ID sequence is unaffected.

| Field | Entry |
|---|---|
| Reviewer name and role | Project owner (repository owner). No name was given with the decision. |
| Date | 2026-10-20 |
| Checklist questions 1–8 and 10 | Not recorded individually. The owner gave an overall decision with no per-question answers. |
| Question 9 (editors and Global Styles) | Not answered. D-M0-11 stays as recorded: core default kept, review before staff rollout. |
| Evidence reviewed (`evidence/m0-007/`, local) | Not stated |
| **Decision** | **Accept** |
| Notes | Owner's words, verbatim: "My VCL-ASSURER-GROUP Milestone 0 usability decision is: ACCEPT — authorize closure. No additional comments." Conveyed to the agent through ChatGPT (the `m1-009` prompt) on 2026-10-20 and recorded by the agent. This is an owner decision, not a signature. The agent did not observe the owner test anything. The m0-007 and m0-008 browser runs were agent-executed and are not human tests. |

On **Accept**: set the Status above to **CLOSED**, fill in **Closed by**, and close D-M0-1 in the
[decision register](../engineering/decision-register.md). On **Reject**: list the issues; they
become M0 fix tasks under the next free task ID.
