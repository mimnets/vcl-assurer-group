# m1-016 — README repository layout section

| | |
|---|---|
| **Task** | m1-016 |
| **Date** | 2026-10-31 |
| **Scope** | Documentation only: a "Layout" section in `README.md` listing the top-level folders. |
| **Prompt** | [2026-10-31-m1-016-readme-repo-layout.prompt.md](../../../prompts/2026/10/2026-10-31-m1-016-readme-repo-layout.prompt.md) |
| **Branch / commit** | `docs/m1-016-repo-layout`, from `feat/m1-015-listing-and-section-widgets` at `cb2ceb5` (stacked: m1-015 is not yet merged, and both tasks edit the same INDEX lines). The commit is the one that adds this report. |
| **Related** | [m1-015 report](./2026-10-29-m1-015-listing-and-section-widgets.report.md) · D-GIT-14 · [STANDARDS.md § Layout](../../STANDARDS.md#layout) |

## Requirements

A third-party "vibecode explorer" plugin reported no planned folder layout. The owner chose a
"Layout" section in `README.md` (one of the files the plugin reads), without changing
`AGENTS.md` or `CLAUDE.md`.

## Work completed

- `README.md`: new "Layout" section before "Project modules". A folder tree with one line per
  top-level folder, the git-ignored folders listed separately, and links to the `docs/` tree in
  STANDARDS.md and to ARCHITECTURE.md / AGENTS.md instead of repeating them.
- Each folder in the tree was checked against the working tree and `git ls-files`.
- INDEX: m1-016 row added; next free task ID moved to `m1-017`.
- Follow-up: the plugin reads a tree line as a folder only when the line ends in `/`, or has a
  `#` comment after it. The first version used plain-text descriptions, so only backticked prose
  paths counted, and 7 folders showed as unplanned. The tree now uses `#` comments, and
  git-ignored folders are named without a trailing slash, so they no longer count as "planned
  but missing".

No code, configuration, dependency or rule changed.

## Verification

| Check | Result |
|---|---|
| `npm run lint` | PASS |
| `npm run test:unit` | PASS (70/70) |
| `test:smoke`, `test:workflow`, `test:persistence` | NOT RUN: documentation-only change, no code touched |
| Browser smoke check of the public site | NOT TESTED: the change does not affect the site; README is not served |
| Plugin re-run (first version, `c100788`) | FAIL, run by the owner: plugin issue "7 folders are not the plan" |
| Plugin parser on the follow-up version | PASS, agent-executed: the plugin's own `plannedFolders()` / `structureDrift()` against `git ls-files` give no unplanned and no missing folders |

## Open decisions

- Commit, push and PR need owner approval. Merge m1-015 (D-GIT-14) first; this branch then
  shows only its own commit.
- D-SEC-4 unchanged.

## Recommended next step

Merge m1-015, then this PR. Next task `m1-017` in a new Claude Code session: the D-SEC-4
lockfile update, then CA-3 (SEO) once D-CONTENT-10 is decided.
