# Milestone 0 → Milestone 1 handoff

| | |
|---|---|
| **Prepared** | 2026-10-19 (`m0-006`) |
| **Milestone 0** | **PENDING.** Two owner gates remain (see "Required next action"). Do not start Milestone 1 until they are closed. Updated in `m0-007`: the agent browser run passed 23/23, and branch protection is verified **absent**, with the risk accepted (D-GIT-3). |
| **Read first** | [AGENTS.md](../../AGENTS.md) · [INDEX](../engineering/INDEX.md) · [m0-006 report](../engineering/reports/2026/10/2026-10-19-m0-006-final-m0-closure.report.md) · [M1 plan](./m1-execution-plan.md) |

## Verified application state (2026-10-19, `m0-006`)

- ApostropheCMS **4.34.0** Community Edition, ESM, JSX templates; local SQLite database; server
  bound to `127.0.0.1:3000`; `APOS_SESSION_SECRET` required.
- Demo home page (hero, slideshow, product cards, contact form), all labelled as demo.
- Automated checks: lint clean · smoke **14/14** · editor workflow **15/15** · persistence
  **7/7** · production asset build **succeeds**.
- Editor UI: **agent-executed browser run 23/23 PASS** (m0-007). Human usability acceptance is still open ([checklist](./m0-human-usability-checklist.md)).

## Architecture decisions

| ADR | Decision | Status |
|---|---|---|
| [ADR-0001](../architecture/decisions/ADR-0001-cms-platform-and-starter.md) | ApostropheCMS Community Edition on the Essentials starter; no Pro modules | Accepted |
| [ADR-0002](../architecture/decisions/ADR-0002-database-strategy.md) | SQLite locally and in tests; PostgreSQL for staging and production **only after** the §6 acceptance test; native APIs only; one database and media store per site | Accepted (PostgreSQL conditional) |

Open decisions: [decision register](../engineering/decision-register.md).

## Current dependencies (direct)

`apostrophe` 4.34.0 · `@apostrophecms/form` 1.5.6 · `@apostrophecms/vite` 1.2.0 · `cross-env`
10.1.0 · `dotenv` 17.4.2 · `normalize.css` 8.0.1. Dev: `eslint-config-apostrophe` 6.1.0,
`nodemon` 3.1.14, `autoprefixer` 10.6.1. No `@apostrophecms-pro/*`. Unchanged since M0.

## Outstanding technical risks

| Risk | Ref | Where it is handled |
|---|---|---|
| `main` is **not protected** (verified in m0-007); rulesets cannot be enforced on this private repository on the current plan; Dependabot is off; secret scanning is unavailable | D-GIT-3 | **Accepted** as a temporary risk (m0-007 finalization). Review before any added maintainer or production deployment; CI in m1-008 |
| No CI; checks are run by hand | D-CI-1 | `m1-008` |
| PostgreSQL adapter unproven for this site | D-M0-2 | `m1-009` |
| No security headers, `Secure` cookies or rate limiting | S1–S3, D-M0-5 | `m1-010` |
| `npm audit`: 42 findings (38 moderate, 4 high), all transitive via `apostrophe` | S5 | `m1-010`; `audit fix --force` would downgrade core, so it is not used |
| Form submissions kept indefinitely; no email or export | S4, D-M0-3/4 | `m1-011` |
| The local backup archives hold secrets (`.env`; the m0-004 archive also has the old, rotated password file) and are not encrypted | — | Owner: encrypt or delete when no longer needed |
| SQLite: single writer, no replication | S7 | Local only, by design |

## Git state

- `origin/main` = `003aac3` (merge of PR #2, m0-005).
- m0-006 work is on `docs/m0-006-final-m0-closure` and will be merged by PR (owner).

## Required next action (owner)

1. Review and merge the m0-007 PR.
2. **Complete the [human usability checklist](./m0-human-usability-checklist.md)** and record a
   dated report (D-M0-1). The functional checklist already passed 23/23 in the agent browser run (m0-007).
3. Optional, free: turn on Dependency graph and Dependabot alerts (steps in D-GIT-3).
4. A documentation-only closure update (next unused task ID) closes Milestone 0. Then approve
   the start of Milestone 1. Branch protection is an accepted risk (D-GIT-3), not a blocker.

## Exact first Milestone 1 task

**`m1-008` — GitHub CI and security scanning** (WS-2 of the [plan](./m1-execution-plan.md)), on
the branch `ci/m1-008-github-actions`: add a GitHub Actions workflow running `npm ci`, lint, the
production build and the smoke, workflow and persistence suites against a fresh per-run SQLite
database, plus `npm audit` reporting. (A required-check ruleset cannot be enforced on the current
plan; see D-GIT-3.)
Start it in a **new Claude Code session**.
