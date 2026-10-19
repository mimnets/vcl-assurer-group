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
| m0-006 | 2026-10-19 | Final Milestone 0 closure verification; M1 readiness | [prompt](./prompts/2026/10/2026-10-19-m0-006-final-m0-closure.prompt.md) | [report](./reports/2026/10/2026-10-19-m0-006-final-m0-closure.report.md) · [M1 execution plan](../milestones/m1-execution-plan.md) · [M1 handoff](../milestones/m1-handoff.md) · [M0 closure report](../milestones/m0-closure-report.md) (**pending**) | — | Branch `docs/m0-006-final-m0-closure`; PR to be opened by the owner (D-GIT-6) | Awaiting PR review. M0 **pending** D-M0-1 and D-GIT-3 |

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

`m0-007` (or `m1-007` once Milestone 1 starts; the sequence continues across milestones). The
[M1 plan](../milestones/m1-execution-plan.md) expects `m1-007`…`m1-011` for its five workstreams.
