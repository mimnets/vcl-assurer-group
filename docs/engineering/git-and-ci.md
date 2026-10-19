# Git, review and CI policy

| | |
|---|---|
| **Status** | Proposed (`m0-002`). Nothing in this file has been applied to GitHub yet. |
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

## CI (proposed GitHub Actions — not created yet)

Run on every PR and on push to `main`. Node 24, `npm ci`.

| Job | Command | Blocks merge |
|---|---|---|
| Lint | `npm run lint` | yes |
| Build | `APOS_RELEASE_ID=$GITHUB_SHA npm run build` | yes |
| Smoke + editor workflow | start the app on a throwaway SQLite database with a generated session secret; create a test admin with a generated password through a non-interactive script; run `npm run test:smoke` and `scripts/editor-workflow-test.mjs` | yes |
| Dependency audit | `npm audit --audit-level=high`, with documented exceptions (the M0 security review §3) | yes, for new high/critical |
| License check | script that fails on licenses outside the approved list (MIT, ISC, BSD, Apache-2.0, BlueOak, 0BSD, CC0, …) plus documented exceptions | yes |

Gap: the test admin is currently created interactively (`user:add` prompts for a password). CI
needs a non-interactive way to do this, without a password in the workflow file. That is an M1
task.

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
