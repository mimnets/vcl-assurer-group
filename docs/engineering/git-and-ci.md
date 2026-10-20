# Git, review and CI policy

| | |
|---|---|
| **Status** | Proposed (`m0-002`). Branch protection is **not** applied (D-GIT-3, accepted risk). The CI section was implemented in `m1-009` (2026-10-20). |
| **Repository** | `github.com/mimnets/vcl-assurer-group` |

## Current state (inspected 2026-10-19)

| Item | Finding |
|---|---|
| Local | **Not a git repository** (no `.git`, no commits, no remotes) |
| Remote | **Exists, private, empty.** `git ls-remote` succeeded through the stored Git Credential Manager login and returned **no refs**: no branches, no history. Unauthenticated API access returns 404. |
| Consequence | The first push will be an initial import. There is no remote history to reconcile, rewrite or overwrite. Re-check with `git ls-remote` immediately before the first push in case someone pushes first. |
| First-commit content | 91 files once `.gitignore` is applied; a dry run found no secrets (see the `m0-002` report) |

## Proposed first push (requires explicit approval — not done)

```sh
git init -b main
git add .
git status                      # human reviews the list (expect ~91 files; no .env, data/, uploads)
git commit -m "chore: import milestone 0 foundation"
git remote add origin https://github.com/mimnets/vcl-assurer-group.git
git ls-remote origin            # must still be empty
git push -u origin main
```

Then apply branch protection (below) **before** any further work lands.

## Branching and review

- `main` is protected: no direct pushes, no force pushes, no deletion. Changes arrive through
  pull requests that need **1 approving review** (2 for ADR or security changes) and passing
  checks. Branches must be up to date before merge; use squash merge.
- Short-lived feature branches cut from `main`: `<type>/mN-NNN-short-description` (for example
  `feat/m1-004-product-pieces`, `docs/m0-002-governance`). Delete them after merge.
- Each PR description links its task ID, prompt, report and any ADR, and includes test output.
- Architecture gates (ADR acceptance, database engine change, new dependency, production
  deployment) need **explicit human approval** recorded in the PR.

## Commit messages — Conventional Commits

`<type>(<optional scope>): <imperative summary>`. Types: `feat`, `fix`, `docs`, `chore`,
`refactor`, `test`, `ci`, `build`, `perf`, `security`. Breaking changes use `!` or a
`BREAKING CHANGE:` footer. Add a `Refs: mN-NNN` footer for traceability.

## CI (GitHub Actions)

Implemented in `m1-009` ([spec](../milestones/m1-009-ci-and-security-scanning-spec.md)) as
`.github/workflows/ci.yml`. It runs on every pull request, on push to `main`, and on manual
dispatch (`workflow_dispatch` works once the file is on `main`). Node 24, `npm ci` from the
lockfile, `permissions: contents: read`, no repository secrets, and one run per PR or ref
(superseded PR runs are cancelled).

| Check (job) | What it runs | Fails when |
|---|---|---|
| `lint` | `npm run lint` | any ESLint error |
| `build` | `npm run build` with `APOS_RELEASE_ID=$GITHUB_SHA`, a generated, masked session secret and a throwaway SQLite path | the build exits non-zero |
| `test` | `npm run test:unit`, then `npm run test:ci` | a unit test, the smoke (14), workflow (15), persistence (7), form-operations (77), security (65) or HTTPS-proxy security (15) suite fails, or the server does not start (security suites added in m1-011; form-operations suite with a local SMTP sink in m1-012) |
| `secrets` | gitleaks 8.30.1 (pinned, SHA-256 verified) over the full git history, `--redact` | any finding not allowed by `.gitleaks.toml` (no allowlist entries today) |
| `audit` | `npm run audit:check` against `security/audit-baseline.json` | a high or critical advisory not in the baseline, a baselined advisory that got worse or reaches a new package, or an expired or invalid baseline entry |

**These checks are not enforceable as required checks** on the current plan (D-GIT-3). They
report on the PR, and the owner merges only green PRs.

### Reproducing CI locally

- `npm run test:ci` runs the `test` job's steps: a new temp directory (`RUNNER_TEMP` in CI,
  otherwise the OS temp directory) with a fresh SQLite database and uploads folder, a generated
  session secret and test-admin password (never printed), `.env` ignored. It creates the admin
  with `node app assurer-test:ensure-admin`, seeds the demo, starts the server on port 3100
  (`CI_TEST_PORT` overrides), runs smoke and workflow, restarts, runs persistence, restarts with
  notifications pointed at a local SMTP sink and runs the form-operations suite (m1-012), then
  the security suites (m1-011), then deletes
  the temp directory (`-- --keep` keeps it). Your dev server can keep running on port 3000. The
  first run builds the development assets, as `npm start` does.
- `assurer-test:ensure-admin` refuses to run unless `APOS_DB_URI` is a `sqlite://` file under
  the temp directory or `RUNNER_TEMP`, `NODE_ENV` is not `production`, and
  `APOS_TEST_PASSWORD` has at least 16 characters. It refuses before Apostrophe opens the
  database.
- Files uploaded during `test:ci` go to the temp directory (`APOS_TEST_UPLOADS_PATH`), not
  `public/uploads`, and are not served over HTTP during that run.

### Changing the audit baseline

Add or renew an entry in `security/audit-baseline.json` only with an owner decision (D-M0-5):
GHSA ID, package, severity, scope, reason, owner, `accepted` date and a `reviewBy` date no
more than 90 days later. For high and critical entries, list the affected packages in
`affects`. Never run `npm audit fix --force`.

License checking (previously listed here) is not implemented; it is a follow-up.

## Repository security settings (GitHub, free for private repositories with limits — confirm the plan)

- **Dependabot** alerts and security updates (npm), weekly version-update PRs grouped by ecosystem.
- **Secret scanning** and **push protection**. Availability on private repositories depends on
  the GitHub plan. If unavailable, add a `gitleaks` CI job.
- **CODEOWNERS** for `docs/architecture/`, `.github/`, `package*.json` and `modules/@apostrophecms/express/`.
- Restrict Actions to required, pinned actions only. Use least-privilege `permissions:` in
  workflows.

## .gitignore — verified

Dry run against all 628 non-`node_modules` files (2026-10-19, after this task's docs): 91 tracked. `.env`, `data/`
(database, local password file), `public/uploads`, build output, `*.db`/`*.sqlite`, dumps
(`*.jsonl`, `*.dump`, `*.sql`), `/backups`, `release-id` and `.claude/settings.local.json` are
all ignored. `package-lock.json` **is** tracked, intentionally.
