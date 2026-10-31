# m1-017 start handoff: dependency advisories (D-SEC-4)

| | |
|---|---|
| **Prepared** | 2026-10-31, by the agent (agent-executed check; not a human approval) |
| **Task** | `m1-017`: resolve D-SEC-4, the two high advisories that fail `npm run audit:check` |
| **Branch** | `fix/m1-017-dependency-advisories`, created from `origin/main` (`75cd32a`); its first commit is this handoff. Continue on it; do not recreate it |
| **Session** | Start a **new Claude Code session** for this task (AGENTS.md, Sessions and context) |
| **Read first** | [AGENTS.md](../../AGENTS.md) (No unapproved dependencies; Git and approvals) · [INDEX](../engineering/INDEX.md) · [decision register](../engineering/decision-register.md) (D-SEC-4, D-GIT-14) · [m1-015 report](../engineering/reports/2026/10/2026-10-29-m1-015-listing-and-section-widgets.report.md) · [git-and-ci.md § CI](../engineering/git-and-ci.md#ci-github-actions) · `security/audit-baseline.json` · `scripts/audit-check.mjs` |

## 1. State checked on 2026-10-31

| Check | Result |
|---|---|
| `origin/main` | `75cd32a`, the merge of PR #17 (the m1-015 handoff only) |
| Unmerged branches | `feat/m1-015-listing-and-section-widgets` (`cb2ceb5`, CA-2 widgets) and `docs/m1-016-repo-layout` (`8d98b66`, stacked on m1-015). Both pushed; PRs to be opened by the owner, m1-015 first |
| Node | 24.21.0 |
| Installed versions | `body-parser` 1.20.8, `multer` 2.4.0 |
| `npm run audit:check` | **FAIL (2)**: GHSA-27r3-jxmh-p828 (high, `body-parser` < 1.20.9) and GHSA-q7qp-rjg7-q26m (high, `multer` 2.0.0–2.4.0). Both denial of service; `npm audit` reports a fix for each **without** `--force` |
| Warnings (not failing) | New moderate/low, not in the baseline: `minimatch` GHSA-g3hv-75wg-m249, `glob` GHSA-3g3m-2fjr-6pw4, `vite` GHSA-8g5g-mxqh-grgj, `deepmerge` GHSA-gcqx-w48m-w2h4, `fast-uri` GHSA-w74x-v6f9-j3xg, -xhq7-xmqj-769h, -wjr9-j795-jxcr, -333x-w4r6-6crp |
| Stale baseline entries | GHSA-vfj7-8cjw-p6xm and GHSA-hp3w-g68c-fv3c "no longer apply" |
| `npm audit fix --force` | **Forbidden.** It would install `apostrophe@0.5.393` (a breaking downgrade) to clear `minimatch`/`glob` |
| Lockfile changes | None made. Only `npm audit` and `npm audit fix --dry-run --package-lock-only` were run |

## 2. Scope

In scope:
- Update `package-lock.json` to patched `body-parser` (≥ 1.20.9) and `multer` (≥ 2.4.1, or the
  version `npm audit` names) **within the ranges the current dependents already allow**.
  `package.json` does not change.
- Accept other patch updates that the same `npm audit fix` (no `--force`) makes, such as
  `vite` or `fast-uri`, only if each one is reviewed (license, advisory, changelog) and the suites
  pass. Otherwise narrow the update to the two packages.
- Remove the two stale baseline entries.
- Decide per warning: leave as a warning (the gate passes), or baseline with a review date.

Out of scope: `--force`, major upgrades, new packages, changes to `apostrophe` or
`@apostrophecms/*` versions in `package.json`, and any change to the audit gate's thresholds.

## 3. Gate before any change

The lockfile update is a **dependency change** (AGENTS.md: needs explicit human approval, a
license check and an advisory check). Phase B starts only after the owner approves it in the
session. The owner already gave a recommendation in D-SEC-4: lockfile update, baseline only if
the update breaks something.

## 4. Phases

| Phase | Work | Stop for |
|---|---|---|
| A | Start-of-session checks: AGENTS.md, this handoff, Git state (`git fetch`; whether m1-015/m1-016 have merged, and rebase this branch on `origin/main` only if they have and the owner agrees), baseline `lint`, `test:unit`, `audit:check`. Archive the prompt | Owner approval of the lockfile update |
| B | `npm audit fix` **without** `--force`, or a narrower `npm update body-parser multer`. Record the old → new version of every changed package from the lockfile diff. License check (`npm view <pkg>@<ver> license`) and advisory check for each changed package | Any changed package with a non-permissive license, a new advisory, or a major bump |
| C | `npm ci` from the new lockfile; `npm run lint`, `test:unit`, `audit:check` (must pass), `build`, `test:ci`; with the dev server, `test:smoke`, `test:workflow`, `test:persistence` | Any failure: baseline instead (D-SEC-4 alternative) only with owner approval |
| D | Baseline clean-up: remove the two stale entries; decide on the warnings | — |
| E | Browser smoke check of the public site and one upload (the `multer` path): log in as a disposable editor, upload an image, publish, log out, check the public page. PASS/FAIL/BLOCKED per AGENTS.md | — |
| F | Report, INDEX row, decision register (D-SEC-4 closed or updated), next free ID | Owner approval of commit, push and PR |

## 5. Completion checklist

- [ ] `audit:check` PASS locally; hosted `audit` job green on the PR
- [ ] Every changed package listed with old and new versions, license and advisory result
- [ ] `package.json` unchanged; no `--force`
- [ ] All suites run and reported with actual results
- [ ] Browser smoke and upload check recorded (agent-executed)
- [ ] Prompt, report, INDEX and decision register updated; no secrets in any of them
- [ ] Commit, push and PR only after owner approval

## 6. Prompt for the new session

> Start m1-017: resolve D-SEC-4 (the body-parser and multer high advisories). Read AGENTS.md and
> docs/milestones/m1-017-handoff.md first, follow its phases and gates, and stop for approval
> before any lockfile change, commit or push.
