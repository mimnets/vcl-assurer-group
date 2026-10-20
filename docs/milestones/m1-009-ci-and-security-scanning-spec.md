# m1-009 — GitHub Actions CI, reproducible tests and security scanning (specification)

| | |
|---|---|
| **Status** | **Specification only** (prepared in `m0-008`, 2026-10-20). Nothing here is implemented. |
| **Task ID** | `m1-009`, the next free number after `m0-008`. If another task starts first, this task takes the next free number when it starts (STANDARDS). |
| **Workstream** | WS-2 of the [M1 execution plan](./m1-execution-plan.md) |
| **Branch** | `ci/m1-009-github-actions` from the latest `origin/main` |
| **Preconditions** | Milestone 0 **CLOSED** ([closure report](./m0-closure-report.md)) and the start of M1 approved (D-M1-0) |
| **Session** | A **new** Claude Code session. Read [m1-handoff.md](./m1-handoff.md) first. |
| **Closes** | D-CI-1; carries part of D-M0-5 (S5/S6 audit tracking) |

## 1. Goal

Every pull request and every push to `main` runs the same checks a developer runs by hand, on a
fresh throwaway database, plus secret and dependency scanning. Everything uses free,
open-source tools and generated, per-run secrets. No paid GitHub security service is required.

This is the main compensating control for the unprotected `main` branch (D-GIT-3). It cannot
be made a *required* check on the current plan. Checks report on the PR, and the owner merges
only green PRs.

## 2. Approval gates (stop and ask before each)

| Gate | Why | What to present |
|---|---|---|
| Each third-party GitHub Action | Counts as a dependency (AGENTS.md) | Name, publisher, license, the full commit SHA to pin, advisory check |
| Secret scanner (gitleaks or equivalent) | New tool | License (gitleaks: MIT), how it is fetched (pinned release and SHA-256 checksum), why not the paid alternatives |
| Any new npm package | Dependency policy | Prefer none. Every script below uses Node built-ins only. |
| Creating `.github/` files and pushing them | Commits and pushes need approval | The full diff |
| Any repository settings change (Actions permissions, Dependabot) | GitHub setting change | Owner does it, or explicitly approves it |

Recommended actions, all from GitHub (MIT licensed): `actions/checkout`, `actions/setup-node`,
and optionally `actions/upload-artifact` for logs. Pin each one to a full commit SHA, with the
version in a comment.

## 3. Scope

### 3.1 Workflow `.github/workflows/ci.yml`

- **Triggers:** `pull_request` (all branches), `push` to `main`, `workflow_dispatch`.
- **Permissions:** `permissions: contents: read` at the top level; nothing else.
- **Concurrency:** one run per ref; cancel superseded PR runs.
- **Runner:** `ubuntu-latest`, Node **24** (`engines` in `package.json`), npm cache keyed on
  `package-lock.json`. `timeout-minutes` on every job.
- **Secrets:** none from the repository. The session secret and test-admin password are
  generated per run (`openssl rand -hex 32`) and masked with `::add-mask::`. No production, staging
  or `.env` values exist in CI.

| Job | Steps | Fails the check when |
|---|---|---|
| `lint` | `npm ci` → `npm run lint` | any ESLint error |
| `build` | `npm ci` → `APOS_RELEASE_ID=$GITHUB_SHA npm run build` | build exits non-zero |
| `test` | see 3.2 | any smoke, workflow or persistence check fails, or the server does not start |
| `secrets` | gitleaks over the **full history** (`fetch-depth: 0`) plus the PR range | any finding not in `.gitleaks.toml` allowlist |
| `audit` | `npm ci` → `node scripts/audit-check.mjs` (3.4) | a **new** high or critical advisory not in the baseline, or an expired baseline entry |

### 3.2 Isolated, reproducible test run (`test` job)

1. `npm ci`.
2. Environment: `APOS_DB_URI=sqlite://$RUNNER_TEMP/ci-<run_id>.sqlite` (fresh file every run;
   never the developer database). `APOS_SESSION_SECRET` and `APOS_TEST_PASSWORD` are generated,
   and `APOS_TEST_USER=ci-admin`.
3. **Non-interactive admin bootstrap** (the gap noted in `git-and-ci.md`). Core
   `@apostrophecms/user:add` asks for the password through the `prompts` library, so it cannot be
   scripted reliably. Option A: confirm whether it accepts piped stdin; if it is fragile, do not
   use it. Option B (recommended): a project task `node app assurer-test:ensure-admin` that:
   - uses the official API (`apos.user.insert` with `req = apos.task.getReq()`), with no raw
     database access;
   - reads the username and password from the environment only, and never logs them;
   - **refuses to run** unless `APOS_DB_URI` is a `sqlite://` path under the OS temp directory
     or `RUNNER_TEMP`, and `NODE_ENV` is not `production`;
   - is idempotent (exits 0 if the user exists).
   It is reviewed as new code (authorization and refusal paths covered by a test).
4. `node app assurer-demo:seed` (the smoke suite expects the demo home page and form).
5. Start the server in the background (`npm start`); wait for `http://127.0.0.1:3000/` to return
   200, for up to 120 s.
6. `npm run test:smoke` → `node scripts/editor-workflow-test.mjs` (the `test:workflow` script
   uses `--env-file=.env`, which doesn't exist in CI; call the script directly with the
   environment set, or make `--env-file` optional, in a minimal change).
7. Stop the server, **restart it**, wait for 200, then run `--verify-only` (persistence across
   restart).
8. Always stop the server; upload the server log as an artifact on failure. No database file or
   uploads are uploaded (they hold test password hashes).

Reproducibility: `npm ci` from the lockfile; a fresh database and uploads per run; no network
calls in tests except to `127.0.0.1`. The same steps must run locally through one documented
command (for example `npm run test:ci`, a small Node script with no new dependency) so a
developer can reproduce a CI failure.

### 3.3 Secret scanning

- **gitleaks** (MIT), the CLI binary, downloaded from the official GitHub release at a pinned
  version and checked against the published SHA-256 checksum. It runs `gitleaks git` over the
  full history, with `--redact` so findings never print the secret.
  - The CLI is preferred over `gitleaks-action`, which needs a license key for organization
    accounts.
- `.gitleaks.toml` extends the default rules. Allowlist entries are narrow (path plus rule) and
  each one is commented with a reason. `.env.example` placeholders are the expected candidates.
- Before enabling the job, run gitleaks once locally over the full history and record the result
  (findings redacted) in the task report. Any real secret found in history is a security
  incident. Stop, rotate it, and ask the owner. **Never rewrite published history** without an
  explicit decision.
- Not required: GitHub secret scanning or push protection (not available on this plan; D-GIT-3).

### 3.4 Dependency audit with a documented baseline

Current state (2026-10-20, `m0-008`, `npm audit`): **43 findings: 38 moderate, 5 high,
0 critical.** The high findings are `apostrophe` (through its `chokidar` → `braces`,
`nunjucks` and tiptap dependencies), `braces` (GHSA-vfj7-8cjw-p6xm), `chokidar`, `nunjucks`
and `nodemon` (dev-only, through `chokidar`). `npm audit fix --force` would *downgrade*
`apostrophe` to 2.x and `nodemon` to 1.x, so it is not an option. In M0 the count was 42 (4
high); the new high is `nodemon` through the same `braces` advisory.

- `security/audit-baseline.json`: one entry per accepted advisory (GHSA ID, package, severity,
  dev or prod, reason, owner, **review-by date ≤ 90 days**). It is re-decided under D-M0-5
  (S5/S6) in `m1-011` (security hardening).
- `scripts/audit-check.mjs` (Node built-ins only) runs `npm audit --json`. It **fails** on any
  high or critical advisory not in the baseline, and on any baseline entry past its review date.
  It **reports** moderates without failing, and prints baseline entries that no longer apply so
  they can be removed.
- Optional and free: the owner turns on Dependabot alerts (steps in D-GIT-3). The CI job does
  not depend on it.

### 3.5 Pull-request checks

- Each job shows as a separate check on the PR. Update `git-and-ci.md` with the actual job
  names, and note that they are **not enforceable as required** on the current plan (D-GIT-3).
- A PR template (`.github/pull_request_template.md`) with the task ID, prompt and report links,
  test results and the browser acceptance table. Optional; ask first.

## 4. Out of scope

Deployment, staging, the PostgreSQL job (that is `m1-010` WS-1, which can add a matrix entry
later), license checking (keep it as a follow-up unless the owner adds it), CodeQL or other paid
or "Advanced Security" features, and any change to application behaviour.

## 5. Verification (definition of done)

| # | Check | How |
|---|---|---|
| 1 | All jobs green on the `m1-009` PR | GitHub checks |
| 2 | The local equivalent passes | `npm run lint`, `test:smoke`, `test:workflow`, `test:persistence`, `build`; `npm run test:ci` (or equivalent) |
| 3 | Lint failure is caught | Throwaway branch with a deliberate lint error; PR or `workflow_dispatch` shows red; branch deleted, never merged |
| 4 | Test failure is caught | Same, with a broken assertion |
| 5 | Secret is caught | Throwaway branch with a **fake**, obviously non-real token in a gitleaks test format; job red with redacted output; branch deleted |
| 6 | New high advisory is caught | Run `audit-check.mjs` against a doctored copy of the audit JSON (unit-style), not a real vulnerable install |
| 7 | No secrets in CI | Workflow has no `secrets.*` references; logs show masked values only |
| 8 | Isolation | Logs show the `RUNNER_TEMP` SQLite path; the developer database is untouched |
| 9 | Browser acceptance (AGENTS.md) | Claude in Chrome, read-only: the PR's Checks tab shows each job and its logs; local public-site smoke check after the change. Agent-executed. |

## 6. Records

Prompt and report under `docs/engineering/{prompts,reports}/YYYY/MM/` with ID `m1-009`; update
INDEX, the decision register (close D-CI-1; record each dependency approval) and the M1 plan.
