# Engineering index

Links every task to its prompt, report(s), decisions and pull requests. Conventions:
[STANDARDS.md](./STANDARDS.md). Open decisions: [decision-register.md](./decision-register.md).
Git policy: [git-and-ci.md](./git-and-ci.md).

## Tasks

| Task | Date | Title | Prompt | Report(s) | ADRs | PR | Status |
|---|---|---|---|---|---|---|---|
| m0-001 | 2026-10-19 | Milestone 0: ApostropheCMS foundation and proof of concept | *Not archived.* The prompt was given before this convention existed and is not reconstructed. | [Architecture & license audit](../milestones/m0-architecture-and-license-audit.md) · [Installation](../milestones/m0-installation-report.md) · [Feature verification](../milestones/m0-feature-verification.md) · [Security review](../milestones/m0-security-review.md) · [Next steps](../milestones/m0-next-steps.md) | [ADR-0001](../architecture/decisions/ADR-0001-cms-platform-and-starter.md) | — (pre-repository) | ADR accepted; closure pending D-M0-1 |
| m0-002 | 2026-10-19 | Engineering governance | [prompt](./prompts/2026/10/2026-10-19-m0-002-engineering-governance.prompt.md) | [report](./reports/2026/10/2026-10-19-m0-002-engineering-governance.report.md) | — | — (pre-repository) | Approved (m0-004 prompt) |
| m0-003 | 2026-10-19 | Database strategy | [prompt](./prompts/2026/10/2026-10-19-m0-002-engineering-governance.prompt.md) (Task 2 of m0-002) | [report](./reports/2026/10/2026-10-19-m0-003-database-strategy.report.md) | [ADR-0002](../architecture/decisions/ADR-0002-database-strategy.md) | — (pre-repository) | Approved (m0-004 prompt) |
| m0-004 | 2026-10-19 | Safe git initialization and repository baseline | [prompt](./prompts/2026/10/2026-10-19-m0-004-safe-git-initialization.prompt.md) | [report](./reports/2026/10/2026-10-19-m0-004-safe-git-initialization.report.md) | — | Initial import `9b97723` on `main` (approved bootstrap; no PR). Follow-up `9f9fe12` merged via [PR #1](https://github.com/mimnets/vcl-assurer-group/pull/1) → `96039f8` | Done; import accepted (m0-005) |
| m0-005 | 2026-10-19 | Governance closure preparation; git reconciliation | [preparation prompt](./prompts/2026/10/2026-10-19-m0-005-governance-closure-preparation.prompt.md) · [reconciliation prompt](./prompts/2026/10/2026-10-19-m0-005-git-reconciliation-and-closure.prompt.md) | [preparation report](./reports/2026/10/2026-10-19-m0-005-governance-closure-preparation.report.md) · [reconciliation report](./reports/2026/10/2026-10-19-m0-005-git-reconciliation-and-closure.report.md) · [editor checklist](../milestones/m0-editor-acceptance-checklist.md) · [M0 closure report](../milestones/m0-closure-report.md) (pending) | — | [PR #2](https://github.com/mimnets/vcl-assurer-group/pull/2) → `003aac3` | Done; merged (verified in m0-006) |
| m0-006 | 2026-10-19 | Final Milestone 0 closure verification; M1 readiness | [prompt](./prompts/2026/10/2026-10-19-m0-006-final-m0-closure.prompt.md) | [report](./reports/2026/10/2026-10-19-m0-006-final-m0-closure.report.md) · [M1 execution plan](../milestones/m1-execution-plan.md) · [M1 handoff](../milestones/m1-handoff.md) · [M0 closure report](../milestones/m0-closure-report.md) (**pending**) | — | [PR #3](https://github.com/mimnets/vcl-assurer-group/pull/3) → `ef7bbc8` | Done; merged (verified in m0-007) |
| m0-007 | 2026-10-19 | Browser-based editor acceptance (agent-executed) | [prompt](./prompts/2026/10/2026-10-19-m0-007-browser-editor-acceptance.prompt.md) · [finalization prompt](./prompts/2026/10/2026-10-19-m0-007-finalization-authorization.prompt.md) | [report](./reports/2026/10/2026-10-19-m0-007-browser-editor-acceptance.report.md) · [human usability checklist](../milestones/m0-human-usability-checklist.md) · [editor checklist](../milestones/m0-editor-acceptance-checklist.md) (agent results) | — | [PR #9](https://github.com/mimnets/vcl-assurer-group/pull/9) → `80bc50c` | Done; merged (verified in m0-008). 23/23 PASS (agent); D-GIT-3 risk accepted |
| m0-008 | 2026-10-20 | Milestone 0 reconciliation; permanent browser-testing policy; m1-009 CI spec | [prompt](./prompts/2026/10/2026-10-20-m0-008-milestone-closure-and-browser-policy.prompt.md) | [report](./reports/2026/10/2026-10-20-m0-008-milestone-closure-and-browser-policy.report.md) · [m1-009 CI spec](../milestones/m1-009-ci-and-security-scanning-spec.md) · [M0 closure report](../milestones/m0-closure-report.md) (**pending** D-M0-1) | — | Branch `docs/m0-008-milestone-closure-and-browser-policy`; PR to be opened by the owner (D-GIT-8) | Regression and browser smoke PASS; editor account archived. M0 **pending** human usability (D-M0-1) |

m0-005 has two prompt/report pairs: the owner issued the reconciliation prompt under the same task ID, to finish the same task once PR #1 was merged. Both pairs share the ID by design.

The Milestone 0 reports keep their original names and location (`docs/milestones/`). They predate
this convention and are preserved unchanged.

## Architecture decisions

| ADR | Title | Status | Task |
|---|---|---|---|
| [ADR-0001](../architecture/decisions/ADR-0001-cms-platform-and-starter.md) | CMS platform and starting point | Accepted | m0-001 |
| [ADR-0002](../architecture/decisions/ADR-0002-database-strategy.md) | Database and media storage strategy | Accepted (PostgreSQL conditional) | m0-003 |

## Runbooks

| Runbook | Status | Task |
|---|---|---|
| [Database and media backup and restore](../runbooks/database-backup-and-restore.md) | Draft (SQLite verified) | m0-003 |
| [New site initialization](../runbooks/new-site-initialization.md) | Draft | m0-003 |
| [Deployment principles](../runbooks/deployment-principles.md) | Reference only | m0-004 |

## Next free task ID

`m1-009`, the first Milestone 1 task (CI, [specification](../milestones/m1-009-ci-and-security-scanning-spec.md)).
It assumes M0 closes through the owner sign-off in the closure report (§7), which needs no
task ID. The sequence runs across milestones (`m0-008` took 008). If any other task starts
first, it takes 009 and the planned M1 IDs (`m1-009`…`m1-013`) shift.
