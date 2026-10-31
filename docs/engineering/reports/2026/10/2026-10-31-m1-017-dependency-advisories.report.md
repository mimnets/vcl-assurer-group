# m1-017 — Dependency advisories (D-SEC-4)

| | |
|---|---|
| **Task** | m1-017 |
| **Date** | 2026-10-31 |
| **Scope** | Lockfile update for the two high advisories that failed `npm run audit:check` (D-SEC-4); audit baseline clean-up. `package.json` unchanged. |
| **Prompt** | [2026-10-31-m1-017-dependency-advisories.prompt.md](../../../prompts/2026/10/2026-10-31-m1-017-dependency-advisories.prompt.md) |
| **Handoff** | [m1-017 start handoff](../../../../milestones/m1-017-handoff.md) |
| **Branch / commit** | `fix/m1-017-dependency-advisories`. Started at `42a7c12` (the handoff, merged as PR #18). `origin/main` moved to `04c4cfb` during the session (PR #19: m1-015 and m1-016); the branch was fast-forwarded to it with the owner's agreement, and every suite was re-run on the new base. The commit is the one that adds this report. |
| **Related** | D-SEC-4 · D-GIT-14 · D-GIT-15 · [m1-015 report](./2026-10-29-m1-015-listing-and-section-widgets.report.md) · [ADR-0002 § media storage](../../../../architecture/decisions/ADR-0002-database-strategy.md) |

## Approvals (owner, in session, 2026-10-31)

- **Dependency gate:** "i approve" for the lockfile update. The owner did not name an option; the
  agent applied option B, the one it had recommended (below).
- **Branch base:** fast-forward to `origin/main` and re-test (agent recommendation, chosen).
- **Remaining warnings:** leave as warnings, no baseline entries (agent recommendation, chosen).

## Options considered

Computed in scratch copies with `--package-lock-only`; the repository lockfile was not touched
before approval.

| Option | Changes | `audit:check` |
|---|---|---|
| A. `npm update body-parser multer` | the two packages | PASS; `vite` and `fast-uri` warnings remain |
| **B. `npm update body-parser multer vite fast-uri`** (applied) | the four packages | PASS; 3 warnings remain |
| C. `npm audit fix` (no `--force`) | B plus non-security dev-tool bumps (`typescript-eslint` 8.71.2 → 8.72.1, 10 packages; `eslint-plugin-vue` 10.11.1 → 10.12.0; `ignore` 7.0.12 → 7.0.14) | same as B |

`npm audit fix --force` was not run. It would install `apostrophe@0.5.393`.

## Changed packages (from the lockfile diff)

| Package | Old → new | Bump | License | Advisory check | Change |
|---|---|---|---|---|---|
| `body-parser` | 1.20.8 → 1.20.9 | patch | MIT | none affect 1.20.9; first patched version for GHSA-27r3-jxmh-p828 | HISTORY.md: security fix for GHSA-27r3-jxmh-p828 only |
| `multer` | 2.4.0 → 2.5.0 | minor | MIT | none affect 2.5.0; first patched version for GHSA-q7qp-rjg7-q26m | 8 commits: swallow a late busboy error after teardown (the advisory fix); don't add a failed upload to the abort clean-up list; allow a field value exactly at the `fieldSize` limit; docs and CI. Same dependencies as 2.4.0 |
| `vite` | 6.4.4 → 6.4.5 | patch | MIT | none affect 6.4.5; first patched version for GHSA-8g5g-mxqh-grgj | 2 commits: check `server.fs` after stripping the query string; release |
| `fast-uri` | 3.1.8 → 3.1.9 | patch | BSD-3-Clause | none affect 3.1.9; first patched version for GHSA-w74x-v6f9-j3xg, -xhq7-xmqj-769h, -wjr9-j795-jxcr, -333x-w4r6-6crp | 12 commits: the four security fixes, tests, docs |
| `gcp-metadata` 5.3.0 and 7 nested packages, `is-stream` 2.0.1 | removed | — | — | — | npm pruned lockfile entries marked `extraneous`. Nothing installed depends on them; the tree resolves `gcp-metadata@9.2.1` |

Licenses from `npm view <pkg>@<ver> license`. Advisories from the GitHub advisory API
(`/advisories?ecosystem=npm&affects=<pkg>@<ver>`), queried 2026-10-31. Changes from the upstream
compare views and `HISTORY.md`. No major bump. `package.json` unchanged.

## Audit baseline

- Removed GHSA-vfj7-8cjw-p6xm (`braces`) and GHSA-hp3w-g68c-fv3c (`sprintf-js`). GitHub
  **withdrew** both advisories (2026-10-23 and 2026-10-22), which is why `audit:check` reported
  them as no longer applying; the installed versions (`braces` 3.0.3, `sprintf-js` 1.1.3) did not
  change. Noted in the baseline `$comment`.
- GHSA-cp6q-959q-f8rh (Tiptap) kept unchanged; review by 2027-01-18.
- Remaining warnings, left as warnings (owner): GHSA-g3hv-75wg-m249 (`minimatch` < 11.0.1; fix
  needs a major bump, npm's only route is downgrading `nodemon` to 1.x), GHSA-3g3m-2fjr-6pw4
  (`glob` 13.0.6; patched in 14.0.2, a major bump; npm's only route is `apostrophe@0.5.393`),
  GHSA-gcqx-w48m-w2h4 (low, `deepmerge` 4.3.1; no patched release). Re-check at the next
  apostrophe release.

`npm audit` after the update: 65 findings (critical 0, high 0, moderate 63, low 2), down from 69
(high 2).

## Verification

Node 24.21.0, local SQLite database, Windows 11. Agent-executed.

| Check | On `42a7c12` base | On `04c4cfb` base (final) |
|---|---|---|
| `npm ci` from the new lockfile | PASS (installed versions match) | not repeated: no dependency change in the fast-forward |
| `npm run lint` | PASS | PASS |
| `npm run test:unit` | PASS (61/61) | PASS (70/70) |
| `npm run audit:check` | PASS (was FAIL (2) before the update) | PASS |
| `npm run build` | PASS | PASS |
| `npm run test:ci` | PASS (17/17 steps) | PASS (17/17 steps; content model 102/102, 7/7 after restart) |
| `npm run test:smoke` | PASS (14/14) | PASS (14/14) |
| `npm run test:workflow` | PASS (15/15) | PASS (15/15) |
| `npm run test:persistence` | PASS (7/7) | PASS (7/7) |
| Hosted CI `audit` job | NOT VERIFIED: no PR yet | NOT VERIFIED |

The live suites ran against a dev server (`npm run dev`) that was already listening on
`127.0.0.1:3000`. It was not started by the agent (it appeared at 12:48 during the first
`test:ci` run); it served this working tree with the updated `node_modules`. The agent left it
running.

### Browser checks (Claude in Chrome, agent-executed; not human approval)

Run twice: once on each base, each time with a new disposable editor (`editor` role, created with
`node app @apostrophecms/user:add <name> editor`). Desktop width only; no layout change in this
task.

| # | Check | Result |
|---|---|---|
| E1 | Public home page renders logged out | PASS |
| E2 | Log in as the disposable editor through `/login` | PASS; admin bar shows the editor account. On the first run the page showed briefly unstyled while dev assets loaded; no console errors |
| E3 | Upload an image in the Images manager (the `multer` path) | PASS both runs: 22.28 KB and 24 KB images uploaded, thumbnail and dimensions shown, "Successfully uploaded a file" |
| E4 | Title it ("Demo m1-017 upload check", "… 2") and save, which publishes | PASS: "Your changes have been published"; the published image is recorded as updated by the editor |
| E5 | Log out through the user menu | PASS: "Log in" button shown, no admin bar |
| E6 | Logged out: uploaded file served | PASS: 200 `image/jpeg`, displayed in the browser |
| E7 | Logged out: no draft or user data | PASS: draft image and page APIs 403, user API 404, home page has no admin markup or username |

## Clean-up

- Both images archived through the REST API by the editor that created them (`archived: true`;
  the published copy then returns 404).
- Both disposable editors (`m1017-browser-editor`, `m1017-browser-editor2`) archived and disabled
  through the REST API by the test admin; their logins now fail (400). Passwords were kept in a
  scratch file outside the repository and deleted afterwards.
- **Left over:** the two archived image documents, two archived user documents, and their files in
  `public/uploads/attachments/` (local, git-ignored). Nothing was hard-deleted.

## Observation (not changed)

After archiving, the uploaded files are still served (200). With local storage and no
`disabledFileKey`, uploadfs "disables" a file with `chmod 0000`; on Windows this only sets the
read-only attribute (mode 444), so the file stays readable. The `one-sixth` size kept mode 666.
Not caused by this task. ADR-0002 already recommends `APOS_UPLOADFS_DISABLED_FILE_KEY` for
production; this should be checked on the staging platform, where it matters.

## Open decisions

- **D-SEC-4:** resolved by this branch; it closes when the PR merges with the hosted `audit` job
  green.
- **D-GIT-14:** closed from the Git history (m1-015 merged in PR #19).
- **D-GIT-15 (new):** commit, push and PR for this branch need owner approval.

## Recommended next step

Merge the m1-017 PR once the five CI checks are green. Next task `m1-018` in a new Claude Code
session: CA-3 (SEO), once D-CONTENT-10 is decided.
