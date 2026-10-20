# m1-009 — Milestone 0 closure; GitHub Actions CI and security scanning

| | |
|---|---|
| **Task** | m1-009 |
| **Date** | 2026-10-20 |
| **Scope** | Record the owner's Milestone 0 acceptance and close M0. Implement the m1-009 CI specification: lint, build, isolated tests, gitleaks and an audit baseline. |
| **Prompt** | [2026-10-20-m1-009-ci-and-security-scanning.prompt.md](../../prompts/2026/10/2026-10-20-m1-009-ci-and-security-scanning.prompt.md) |
| **Branch / commit** | `ci/m1-009-github-actions` from `origin/main` `1ed5f54`. Commit 1 `38fbc99` (M0 closure, docs only). Commit 2: the commit that adds this report (CI implementation). |
| **Related** | [m1-009 spec](../../../milestones/m1-009-ci-and-security-scanning-spec.md) · [M0 closure report](../../../milestones/m0-closure-report.md) · [git-and-ci.md](../../git-and-ci.md) · D-M0-1, D-M1-0, D-GIT-8, D-CI-1, D-M0-5, D-GIT-3 · ADR-0001, ADR-0002 |

## Requirements

From the prompt: close Milestone 0 on the owner's recorded decision without overstating it, and
implement the m1-009 spec as the acceptance contract. That covers least-privilege, SHA-pinned
actions, `npm ci`/lint/build on Node 24, and the smoke, workflow and persistence suites on a
throwaway database with generated secrets and a non-interactive admin bootstrap. It also covers
gitleaks with a pinned, checksum-verified binary, an `npm audit` baseline that fails on new
high/critical advisories, negative tests, local regression, a browser smoke check, and two
separate commits pushed to a feature branch. GitHub-hosted CI stays **PENDING** until real runs
have been inspected.

## Work completed

### Session start (Part A)

- Fetched `origin`. `origin/main` = **`1ed5f54`** (merge of PR #10, m0-008). Its tree
  (`723f08e…`) equals the reviewed m0-008 head `aa53a17`, so m0-008 is merged.
- The working tree was clean on `docs/m0-008-…` before branching. Nothing was overwritten.
- `m1-009` was free: INDEX listed it as the next ID, and no `m1-009` prompt, report or branch
  existed.
- Branch `ci/m1-009-github-actions` was created from `origin/main`. Its upstream was unset so a
  plain `git push` can never target `main`.

### Milestone 0 closure (Part B), commit `38fbc99` (docs only)

- Gates re-verified on 2026-10-20 before any m1-009 change:
  - Local regression: lint clean · smoke 14/14 · workflow 15/15 · persistence 7/7.
  - m0-008 merged (PR #10).
  - D-GIT-3 still an accepted, documented risk. It is not a technical protection.
  - Test accounts: a read-only REST query, as the local test admin, with the token revoked
    afterwards, showed `admin` as the only active user. `m0-007-demo-editor` is archived.
  - No critical blocker. `npm audit` shows 0 critical.
- Recorded the owner's decision (verbatim, conveyed through ChatGPT on 2026-10-20) in closure
  report §7, the human usability checklist (new Outcome section) and the decision register.
  - The per-question answers, Question 9 and "evidence reviewed" are recorded as **not given**.
    The agent filled in nothing on the owner's behalf.
  - There is no signature. The m0-007 run stays labelled agent-executed.
- Closed **D-M0-1** (accepted by the owner), **D-GIT-8** (PR #10 merged) and **D-M1-0** (M1
  start approved).
- Milestone 0 status: **CLOSED (2026-10-20)**. Historical reports were not modified.

### CI implementation (Part C)

| Piece | What it does |
|---|---|
| `.github/workflows/ci.yml` | Jobs `lint`, `build`, `test`, `secrets`, `audit`. Triggers: `pull_request` (all branches, so PRs into `main` are included), `push` to `main`, `workflow_dispatch`. `permissions: contents: read` only. Concurrency is one group per PR or ref, and superseded PR runs are cancelled. `timeout-minutes` on every job. Node 24 with the npm cache keyed on `package-lock.json`. `persist-credentials: false` on checkout. No `secrets.*` references. |
| `modules/assurer-test` (+ `lib/guard.js`) | `node app assurer-test:ensure-admin` creates the test admin with `apos.user.insert` (official API, `apos.task.getReq()`), reading the username and password from the environment. It never logs them and is idempotent. It **refuses** unless `APOS_DB_URI` is an absolute `sqlite://` file under the OS temp directory or `RUNNER_TEMP`, `NODE_ENV` is not `production`, and the password has at least 16 characters. The check runs at module load, **before** Apostrophe opens the database (verified: a probe path under `data/` was refused, exit 1, and no file was created). It runs again inside the task. |
| `modules/@apostrophecms/uploadfs/index.js` | When `APOS_TEST_UPLOADS_PATH` is set (and `NODE_ENV` is not `production`), uploads go to that directory instead of `public/uploads`. When unset, which is the normal case, core defaults apply unchanged. This was needed so a local `test:ci` run never writes into the developer's media folder. |
| `scripts/run-ci-tests.mjs` (`npm run test:ci`) | One command for CI and for local reproduction. See the next section. |
| `scripts/audit-check.mjs` (`npm run audit:check`) + `security/audit-baseline.json` | Baseline gate (see "Dependency audit"). |
| `scripts/*.test.mjs` (`npm run test:unit`) | 24 `node:test` unit tests: 11 for the audit gate and 13 for the guard's refusal and acceptance paths. |
| `.gitleaks.toml` | Extends the default rules. **No allowlist entries** (none were needed). |
| Docs | `git-and-ci.md` CI section rewritten with the real jobs; README script table; this report, the prompt, INDEX, register, M1 plan and handoff. |

No npm dependency was added, removed or upgraded. `package.json` gained three scripts only.

### Isolated test environment and credential strategy

`npm run test:ci` works as follows:

1. It creates a new directory under `RUNNER_TEMP` (CI) or the OS temp directory (local).
2. It generates a session secret (32 bytes) and a test-admin password (24 bytes) with
   `crypto.randomBytes`. Under GitHub Actions it masks both with `::add-mask::`. Neither is
   ever printed.
3. It strips any inherited `APOS_*`, `DOTENV_*`, `NODE_ENV`, `PORT`, `ADDRESS` and `BASE_URL`
   variables and points dotenv at an empty file, so `.env` is **not read**.
4. It uses `APOS_DB_URI=sqlite://<tmp>/ci.sqlite` and `APOS_TEST_UPLOADS_PATH=<tmp>/media`.
5. It runs, in order: ensure-admin → demo seed → start server (`127.0.0.1:3100`, 180 s timeout)
   → smoke → workflow → restart → persistence.
6. On failure it prints the last 60 lines of the server log.
7. It always stops the server and deletes the directory.

No GitHub repository secrets, stored credentials or production values are used. The build job
generates and masks its own throwaway secret with `openssl rand -hex 32`.

### Approvals and dependency records

The prompt is the owner's approval for these items. The spec's approval gates for actions,
the scanner, and commit plus push are covered by "Add an open-source scanner such as Gitleaks",
"Prefer official maintained actions pinned to immutable commit SHAs" and "Push the feature
branch normally".

| Component | Publisher / license | Pin | Advisory check (2026-10-20) |
|---|---|---|---|
| `actions/checkout` v7.0.1 | GitHub, MIT, not archived | `3d3c42e5aac5ba805825da76410c181273ba90b1` (released 2026-07-20) | GitHub advisory DB (`ecosystem=actions`): none; repository advisories: none |
| `actions/setup-node` v7.1.0 | GitHub, MIT, not archived | `949feb2413d6458794dcd2491c4babbbce0c15c1` (released 2026-10-08) | none; none |
| gitleaks CLI 8.30.1 | gitleaks, MIT | Release binary, SHA-256 `551f6fc8…f2470eb` (linux x64, from the release checksums file, hard-coded in the workflow) | repository advisories: none |

The gitleaks CLI is used instead of `gitleaks-action`, which needs a license key for
organization accounts. `actions/upload-artifact` was **not** used: the runner prints the server
log tail instead, so there is one fewer third-party action.

## Files changed

Commit 1 (`38fbc99`, docs only): M `docs/milestones/m0-closure-report.md` ·
M `docs/milestones/m0-human-usability-checklist.md` · M `docs/engineering/decision-register.md` ·
M `docs/engineering/INDEX.md`

Commit 2 (CI):

- A `.github/workflows/ci.yml`
- A `.gitleaks.toml`
- A `modules/assurer-test/index.js`
- A `modules/assurer-test/lib/guard.js`
- A `modules/@apostrophecms/uploadfs/index.js`
- A `scripts/run-ci-tests.mjs`
- A `scripts/audit-check.mjs`
- A `scripts/audit-check.test.mjs`
- A `scripts/ensure-admin-guard.test.mjs`
- A `security/audit-baseline.json`
- M `app.js` (registers `assurer-test`)
- M `package.json` (scripts `test:unit`, `test:ci`, `audit:check`)
- M `README.md`
- M `docs/engineering/git-and-ci.md`
- M `docs/engineering/INDEX.md`
- M `docs/engineering/decision-register.md`
- M `docs/milestones/m1-execution-plan.md`
- M `docs/milestones/m1-handoff.md`
- A `docs/engineering/prompts/2026/10/2026-10-20-m1-009-ci-and-security-scanning.prompt.md`
- A this report

## Tests executed and actual results

Environment: Windows 11, Node 24.21.0, npm 11.19.0. The owner's dev server was running on
`127.0.0.1:3000` against the local SQLite database.

| Check | Command | Result |
|---|---|---|
| Lint | `npm run lint` | **PASS**: 0 errors, 0 warnings (3 warnings in the new scripts were fixed) |
| Unit tests | `npm run test:unit` | **PASS 24/24** |
| Regression (dev server, before any change) | `test:smoke` / `test:workflow` / `test:persistence` | **14/14 · 15/15 · 7/7** |
| Isolated CI run (local) | `npm run test:ci` | **PASS**, all 7 steps: ensure-admin, seed, start, smoke **14/14**, workflow **15/15**, restart, persistence **7/7** (37 s; assets were already built locally) |
| Isolation after `test:ci` | file counts, `ls` diff, temp listing | `public/uploads/attachments` 238 → 238 files; `data/` listing unchanged; no `vcl-ci-*` directory left; no 48+ character hex string in the run output |
| Bootstrap idempotency | `ensure-admin` twice on a temp DB | run 1 "Test admin created.", run 2 "already exists; nothing changed.", both exit 0 |
| Bootstrap refusal (end to end) | `ensure-admin` with `APOS_DB_URI` under `data/` | exit 1, "Refusing to run … not under the OS temp directory or RUNNER_TEMP"; **no database file created** |
| Production build, CI-style | `npm run build` with no `.env`, a temp DB and a generated secret | **PASS** (exit 0) |
| Audit gate (live) | `npm run audit:check` | **PASS**: 43 findings (0 critical, 5 high, 38 moderate), all 3 advisories baselined |
| Secret scan (full history) | gitleaks 8.30.1 (Windows build, checksum verified), `git --redact`, with and without `.gitleaks.toml` | **0 findings** in 6 non-merge commits (16 commits in all refs). See "Secret scanner findings". |
| Workflow file | parsed with `js-yaml`; grep for `secrets.` | parses; 5 jobs, permissions `contents: read`; no `secrets.*` |
| **GitHub-hosted CI** | GitHub Actions | **PENDING**: no PR exists yet. Local runs do not prove the hosted runs pass. |

### Negative tests (local, disposable fixtures)

| # | Case | Method | Actual result | Status |
|---|---|---|---|---|
| N1 | Lint failure | Temporary `scripts/zz-negative-lint.mjs` (unused variable, `var`, missing semicolon); `npx eslint .`; file deleted | 4 errors, exit 1; file removed (verified) | PASS (rejected) |
| N2 | Synthetic secret | Throwaway git repo in the session scratch directory; one commit with a **randomly generated, never-issued** `ghp_` string labelled SYNTHETIC; gitleaks `git` with the project's `.gitleaks.toml`; repo deleted | exit 1, rule `github-pat`, `Secret: REDACTED`; the token pattern appears **0** times in the output | PASS (rejected, redacted) |
| N3 | Failing test | Changed one smoke assertion (3 → 4 slides); `npm run test:ci`; restored with `git checkout` | exit 1, "FAIL slideshow rendered with 3 slides", 13/14, server log tail printed, temp dir cleaned; file restored (verified). A first attempt did not apply the edit (bad `sed` pattern) and passed. That attempt is **not** counted. | PASS (rejected) |
| N4a | New high advisory | Real audit JSON + a synthetic high advisory; `audit-check --input` | exit 1, "NEW GHSA-test-0000-high … not in the baseline" | PASS (rejected) |
| N4b | New critical advisory | same, critical | exit 1 | PASS (rejected) |
| N4c | Known high advisory reaching a new package | real JSON + `new-dep` via `braces` | exit 1, "GHSA-vfj7-8cjw-p6xm … now also affects new-dep" | PASS (rejected) |
| N4d | Unit-level cases | `npm run test:unit`: new high, new critical, new moderate (warn only), new path, severity raised, expired entry, window over 90 days, incomplete entry, stale entry, audit error | all pass | PASS |
| G1–G4 | The same cases **on GitHub** (throwaway branch or PR) | not run | Needs PRs on GitHub, which leave closed-PR history, so it needs the owner's approval. `workflow_dispatch` works only once the workflow is on `main`. | **NOT TESTED / PENDING** |

### Browser acceptance

Claude in Chrome, the owner's Chrome, a dedicated MCP tab group (closed afterwards). Logged out,
about 1440 px wide. **Agent-executed**, not human approval. The checklist was written from this
task's changes before running it:
- The new uploadfs override must be inert when unset, so media must still be served from
  `/uploads`.
- The new module must not affect the public site.
- STANDARDS asks for a public smoke check for a mainly non-UI task.

| # | Check | Role / viewport | Steps | Expected | Actual | Status | Evidence |
|---|---|---|---|---|---|---|---|
| B1 | Home page renders | logged out / 1440 | open `http://localhost:3000/` | demo banner, hero, no admin bar, no overflow | rendered; no admin bar; horizontal overflow 0 px | PASS | `evidence/m1-009/b1-home-logged-out-1440.jpg` |
| B2 | Media served from `/uploads` (uploadfs override inert) | logged out / 1440 | read the page's `/uploads/` images after decode | images load | 6 images, 0 broken | PASS | DOM check (recorded here) |
| B3 | Slideshow navigation | logged out / 1440 | click "Next slide" | active slide changes | slide 1 → slide 2 active | PASS | DOM before and after |
| B4 | Contact-form validation | logged out / 1440 | click "Send message" on the empty form | submission blocked with a message | "Please fill out this field" on Full name; nothing sent | PASS | `evidence/m1-009/b3-form-validation.jpg` |
| B5 | Logged-out access controls | logged out | anonymous `fetch` of the user API, the draft page API and `/login` | no user or draft data | user API 404, draft API 403, `/login` 200 | PASS | statuses recorded here |
| B6 | PR Checks tab shows each job and its logs (spec §5 #9) | owner's GitHub | open the PR's Checks tab | 5 green checks | not possible yet: no PR exists | NOT TESTED (PENDING) | — |
| — | Tablet and mobile layouts | — | — | — | rendering and templates are unchanged in this task | NOT TESTED (not required) | — |

No test accounts were created in this task, so there is nothing to clean up. The CI admin
exists only in temporary databases, which were deleted.

## Secret scanner findings

- **Git history: 0 findings** (gitleaks 8.30.1, default rules, `--redact`, all refs). No
  allowlist entries were needed.
- **Working tree** (`gitleaks dir`, informational): 2 `generic-api-key` hits, both in the
  local, **git-ignored** `.env` (lines 19 and 31). These are the expected local secrets and were
  never tracked (`git check-ignore` confirms). No action is needed. The CI job scans git
  history, not the working directory.

## Dependency audit baseline

`npm audit` on 2026-10-20 reports 43 package findings: 38 moderate, **5 high**, **0 critical**.
In production only (`--omit=dev`) it reports 42 findings, 4 high. They come from **3
advisories**:

| Advisory | Severity | Vulnerable package | Path | Owner / remediation | Review by |
|---|---|---|---|---|---|
| GHSA-vfj7-8cjw-p6xm | high | braces ≤3.0.3 | apostrophe → chokidar → braces; nodemon (dev) → chokidar → braces. The 5 "high" packages (apostrophe, braces, chokidar, nunjucks, nodemon) all trace to this one advisory. | Architect / security (D-M0-5); m1-011 | 2027-01-18 |
| GHSA-cp6q-959q-f8rh | moderate | @tiptap/core <3.30.4 | apostrophe's Tiptap 2.x rich-text editor (37 packages) | same; m1-011 | 2027-01-18 |
| GHSA-hp3w-g68c-fv3c | moderate | sprintf-js ≤1.1.3 | apostrophe → underscore.string → sprintf-js | same; m1-011 | 2027-01-18 |

npm's only offered fix is a semver-major **downgrade** (apostrophe to 3.44.0, nodemon to
1.14.10). It was not applied. The spec's note said apostrophe 2.x; the current `npm audit`
output says 3.44.0. `npm audit fix --force` was never run.

## Security observations

- Workflow: read-only token, `persist-credentials: false`, no secrets, pinned SHAs, a
  checksum-verified scanner, and no `pull_request_target`. A fork PR runs with the same
  read-only token.
- The test-admin task is test-only and cannot touch a non-temporary or non-SQLite database. Its
  refusal path is unit-tested and was checked end to end.
- The uploadfs override is ignored in production and is inert unless its variable is set.
- No generated secret appeared in any local run output.
- No `.env`, database, upload, evidence or backup file is staged. The staged diff was scanned
  with gitleaks before each commit.

## Known limitations

- **GitHub-hosted CI has not run.** All five jobs, and the GitHub-side negative tests G1–G4,
  are PENDING.
- The `npm ci` behaviour on Linux runners was not reproduced locally: native modules
  (`better-sqlite3`, `sharp`) and the npm 11 `allowScripts` field. The first hosted run will
  show it.
- The checks cannot be made **required** on the current plan (D-GIT-3). They report only.
- `audit` depends on the npm registry being reachable. A registry outage fails the job (by
  design: it fails closed).
- Uploads made during `test:ci` are not served over HTTP during that run. The suites check
  markup only.
- A local `test:ci` run rebuilds the development assets in `apos-build/`, which is shared with
  a running dev server. This was harmless here.
- Deviations from the spec, all minor:
  - The audit job skips `npm ci`, because `npm audit` reads the lockfile.
  - The test port is 3100 instead of 3000, so it can run next to a dev server.
  - Secrets for `test:ci` are generated in Node, not with `openssl`.
  - No `upload-artifact` (the log tail is printed instead).
  - No PR template: the spec marks it optional, ask first.
  - No license check: a follow-up, per the spec.
  - No scheduled run: expiry and new advisories are noticed only on PRs or pushes. A weekly
    `schedule` trigger is a suggested follow-up.

## Unresolved decisions

- **D-CI-1**: implemented; closes when the hosted runs are green and inspected.
- **D-GIT-9 (new)**: review and merge the m1-009 PR.
- **D-M0-5**: the audit baseline is re-decided in m1-011, review by 2027-01-18.
- D-GIT-3 (accepted risk) is unchanged. Dependabot is still off; turning it on is an owner
  setting.

See the [decision register](../../decision-register.md).

## Rollback guidance

Before merge: close the PR and delete the branch. After merge: revert the CI commit. It is
self-contained: the workflow, the new files, two small module additions, `app.js` registration
and npm scripts. Reverting it removes CI and does not affect content or data. The M0 closure
commit is documentation only and should not be reverted unless the owner withdraws acceptance.

## Recommended next step

1. The owner opens the PR from the compare URL. GitHub then runs the five jobs. Inspect them in
   the Checks tab (B6).
2. Optionally, the owner approves the GitHub-side negative tests (G1–G4) on throwaway PRs that
   are closed unmerged.
3. Merge only when all checks are green. Then start a **fresh Claude Code session** for
   `m1-010` (PostgreSQL acceptance test) or a follow-up that records the hosted CI results.
