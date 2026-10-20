# Milestone 0 → Milestone 1 handoff

| | |
|---|---|
| **Prepared** | 2026-10-19 (`m0-006`); updated in `m0-007`; rewritten 2026-10-20 (`m0-008`); updated 2026-10-20 (`m1-009`); **updated 2026-10-20 (`m1-010`)** |
| **Milestone 0** | **CLOSED 2026-10-20.** The owner accepted human usability (D-M0-1), and Milestone 1 is approved (D-M1-0). See [closure report §7](./m0-closure-report.md#7-owner-sign-off-human-usability-acceptance-d-m0-1). |
| **Milestone 1** | In progress. `m1-009` (CI) merged as PR #11 (`d0f4a05`); hosted CI **verified green** in m1-010 (D-CI-1 closed). `m1-010` (PostgreSQL acceptance) done: recommendation **B, provisionally accepted with blockers**, awaiting the owner (D-DB-6). [m1-010 report](../engineering/reports/2026/10/2026-10-20-m1-010-postgresql-compatibility-acceptance.report.md). |
| **Read first** | [AGENTS.md](../../AGENTS.md) (rules, incl. browser testing) · [INDEX](../engineering/INDEX.md) · [m1-010 report](../engineering/reports/2026/10/2026-10-20-m1-010-postgresql-compatibility-acceptance.report.md) · [m1-009 report](../engineering/reports/2026/10/2026-10-20-m1-009-ci-and-security-scanning.report.md) · [m0-008 report](../engineering/reports/2026/10/2026-10-20-m0-008-milestone-closure-and-browser-policy.report.md) · [decision register](../engineering/decision-register.md) · [M1 plan](./m1-execution-plan.md) · [m1-009 spec](./m1-009-ci-and-security-scanning-spec.md) |

## Start-of-session checklist (new Claude Code session)

1. Read the documents above. Don't rely on earlier conversations; the repository is the source of truth.
2. `git fetch origin`, then check the branch, uncommitted changes, and that `origin/main` contains
   the m0-008 merge and the owner's §7 sign-off.
3. Confirm the closure report says **CLOSED** and D-M1-0 is approved. If not, stop and ask.
4. Use the next free task ID (`m1-009` unless something else started first), and archive the
   prompt under `docs/engineering/prompts/YYYY/MM/`.
5. Create the branch `ci/m1-009-github-actions` from `origin/main`.

## Verified application state (2026-10-20, `m0-008`)

- ApostropheCMS **4.34.0** Community Edition, ESM, **JSX** templates, `@apostrophecms/vite`.
  Local SQLite database (`APOS_DB_URI` in `.env`). Server bound to `127.0.0.1:3000`.
  `APOS_SESSION_SECRET` is required (the app refuses to start without it). Node **24.21.0** locally
  (`engines: >=24`).
- Project modules: `modules/assurer-*` (hero, slideshow, product card and product grid widgets;
  `assurer-demo` seed task);
  core overrides under `modules/@apostrophecms/`. Demo content via `node app assurer-demo:seed`,
  always labelled "Demo".
- Commands: `npm run dev` · `npm start` · `npm run build` · `npm run lint` ·
  `npm run test:smoke` (HTTP, anonymous) · `npm run test:workflow` and `npm run test:persistence`
  (REST API as the test admin; credentials `APOS_TEST_USER`/`APOS_TEST_PASSWORD` from the
  git-ignored `.env`; the server must be running).
- Results on 2026-10-20: lint clean · smoke **14/14** · workflow **15/15** · persistence **7/7**
  (also after a restart) · production build passes. Browser: agent-executed editor checklist
  **23/23** (m0-007); public-site smoke check PASS (m0-008).
- CMS users: `admin` (owner, active), `m0-007-demo-editor` (archived in m0-008). Owner content
  "Acceptance Test" and "M0 Test Page" exist and must not be touched.
- Local-only, git-ignored: `.env`, `data/`, `public/uploads/`, `evidence/` (browser screenshots),
  and `../vcl-assurer-group-backups/` (holds secrets; D-M0-9).

## Architecture decisions

| ADR | Decision | Status |
|---|---|---|
| [ADR-0001](../architecture/decisions/ADR-0001-cms-platform-and-starter.md) | ApostropheCMS Community Edition on the Essentials starter; no Pro modules | Accepted |
| [ADR-0002](../architecture/decisions/ADR-0002-database-strategy.md) | SQLite locally and in tests; PostgreSQL for staging and production **only after** the §6 acceptance test; native APIs only; one database and media store per site | Accepted (PostgreSQL conditional) |

## Current dependencies (direct)

`apostrophe` 4.34.0 · `@apostrophecms/form` 1.5.6 · `@apostrophecms/vite` 1.2.0 · `cross-env`
10.1.0 · `dotenv` 17.4.2 · `normalize.css` 8.0.1. Dev: `eslint-config-apostrophe` 6.1.0,
`nodemon` 3.1.14, `autoprefixer` 10.6.1. No `@apostrophecms-pro/*`. Unchanged since M0. Any
addition (including GitHub Actions and gitleaks) needs approval.

## Outstanding technical risks

| Risk | Ref | Where it is handled |
|---|---|---|
| `main` is **not protected**; rulesets cannot be enforced on this private repository on the current plan; Dependabot is off; secret scanning is unavailable | D-GIT-3 | **Accepted** as a temporary risk. Review before any added maintainer or production deployment; CI in `m1-009` |
| No CI; checks are run by hand | D-CI-1 | `m1-009` ([spec](./m1-009-ci-and-security-scanning-spec.md)) |
| PostgreSQL: the app process exits when the database drops an idle connection (db-connect 1.1.0 has no pool `error` listener) | D-DB-5 | Upstream report; restart supervisor in any shared environment; re-test on each db-connect release |
| PostgreSQL provisional only: untested on Linux and managed versions; dumps carry sessions (no sanitize task yet) | D-DB-6 | Owner decision; before staging |
| No security headers, `Secure` cookies or rate limiting | S1–S3, D-M0-5 | `m1-011` |
| `npm audit`: **43** findings (38 moderate, **5 high**, 0 critical) on 2026-10-20, all upstream (`apostrophe` transitive dependencies; dev-only `nodemon` via `braces`) | S5, D-M0-5 | Baseline in `m1-009`; re-decided in `m1-011`. `audit fix --force` would downgrade core, so it is not used |
| Form submissions kept indefinitely; no email or export | S4, D-M0-3/4 | `m1-012` |
| Editors can change site-wide Global Styles, and can publish and archive | D-M0-11 | Review before staff rollout (M1 role design) |
| The local backup archives hold secrets and are not encrypted | D-M0-9 | Owner |
| SQLite: single writer, no replication | S7 | Local only, by design |

## m1-010 status (2026-10-20)

- Hosted CI for m1-009: all five jobs green on the PR run and on the push-to-`main` run
  (links in the [m1-010 report](../engineering/reports/2026/10/2026-10-20-m1-010-postgresql-compatibility-acceptance.report.md)). D-CI-1 and D-GIT-9 are closed.
- The PostgreSQL 16.15 acceptance test was run in a disposable local environment, which was
  deleted afterwards:
  - fresh initialisation, the existing suites (admin and editor), 15 feature areas;
  - migration of a *copy* of the M0 data (identical);
  - `pg_dump`/`pg_restore` and JSONL round trips (identical);
  - a 15-minute soak (0 errors, no connection growth);
  - crash recovery and agent browser checks.
  - **One FAIL:** the app exits when PostgreSQL drops a connection (D-DB-5).
- ADR-0002 has a new §9. It is **not** changed to a production commitment.
- The owner's SQLite database and media were verified unchanged.
- Branch `test/m1-010-postgresql-acceptance` (docs only); the owner opens the PR.

## m1-009 status (2026-10-20)

- Added: `.github/workflows/ci.yml` (`lint`, `build`, `test`, `secrets`, `audit`),
  `npm run test:ci` (isolated run on a throwaway database), `npm run test:unit`,
  `npm run audit:check` with `security/audit-baseline.json`, `.gitleaks.toml`, and the
  test-only `assurer-test:ensure-admin` task. Details are in [git-and-ci.md](../engineering/git-and-ci.md#ci-github-actions).
- Local results: lint clean, unit 24/24, `test:ci` 14/14 · 15/15 · 7/7, build passes, audit
  gate passes, gitleaks history 0 findings. Local negative tests pass.
- **Pending:** the hosted runs on the PR, inspection of the Checks tab, and optionally the
  GitHub-side negative tests (owner approval needed).

## Git state (2026-10-20)

**Updated in m1-009:** `origin/main` = `1ed5f54` (merge of PR #10, m0-008). m1-009 is on
`ci/m1-009-github-actions`, pushed for the owner to open a PR. The notes below are from m0-008.


- `origin/main` = `80bc50c` (merge of PR #9, m0-007).
- m0-008 is on `docs/m0-008-milestone-closure-and-browser-policy`; the owner opens and merges the PR.
- Stale remote branches from M0 (`docs/m0-004…`, `docs/m0-005…`, `docs/m0-006…`,
  `test/m0-007…`) are merged. The owner may delete them; the agent does not.

## Required next action (owner), updated in m1-010

1. Review the m1-010 report and decide **D-DB-6** (A, B or C; the agent recommends B).
2. Approve or file the upstream report for **D-DB-5**.
3. Open and merge the m1-010 PR from `test/m1-010-postgresql-acceptance`.
4. Start the next task (`m1-011`, security hardening) in a **new Claude Code session**.

### Earlier list (m1-009, done except the optional items)

1. Open the m1-009 PR from `ci/m1-009-github-actions`, check that all five checks pass, and
   inspect their logs. Then merge (D-GIT-9). This closes D-CI-1.
2. Optional: approve the GitHub-side negative tests (throwaway PRs, closed unmerged).
3. Optional and free: turn on Dependency graph and Dependabot alerts (D-GIT-3).
4. Start the next task (`m1-010`, PostgreSQL acceptance) in a **new Claude Code session**.

### Earlier list (m0-008, done)

1. Review and merge the m0-008 PR.
2. Complete the [human usability checklist](./m0-human-usability-checklist.md) and sign
   [closure report §7](./m0-closure-report.md#7-owner-sign-off-human-usability-acceptance-d-m0-1). On Accept, set M0 to **CLOSED** and close D-M0-1.
3. Approve the start of Milestone 1 (D-M1-0).
4. Optional, free: turn on Dependency graph and Dependabot alerts (steps in D-GIT-3).

## Exact first Milestone 1 task

**`m1-009` — GitHub Actions CI, reproducible tests and security scanning.** The full
specification is in [m1-009-ci-and-security-scanning-spec.md](./m1-009-ci-and-security-scanning-spec.md).
Start it in a **new Claude Code session**, on `ci/m1-009-github-actions`, and stop at each
approval gate the spec lists. Finish with the browser acceptance step that AGENTS.md requires.
