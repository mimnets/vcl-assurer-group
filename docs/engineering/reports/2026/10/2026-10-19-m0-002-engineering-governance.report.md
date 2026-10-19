# Engineering governance

| | |
|---|---|
| **Task** | m0-002 |
| **Date** | 2026-10-19 |
| **Scope** | Inspect the existing project, local git and the GitHub remote; establish documentation standards, agent rules, git/CI policy and an M0 decision register. Documentation, governance and verification only. |
| **Prompt** | [`2026-10-19-m0-002-engineering-governance.prompt.md`](../../../prompts/2026/10/2026-10-19-m0-002-engineering-governance.prompt.md) (Tasks 1, 3, 4, 5, 6) |
| **Branch / commit** | **Not a git repository.** No branch, no commit. Nothing was committed or pushed. |
| **Related** | [m0-003 database strategy report](./2026-10-19-m0-003-database-strategy.report.md) · [ADR-0001](../../../../architecture/decisions/ADR-0001-cms-platform-and-starter.md) · [ADR-0002](../../../../architecture/decisions/ADR-0002-database-strategy.md) · [decision register](../../../decision-register.md) · Milestone 0 reports in `docs/milestones/` |

## Requirements

Tasks 1, 3, 4, 5 and 6 of the prompt. Task 2 is reported separately as m0-003. Constraints: no
application behaviour change, no migration, no production access, no credentials exposed, no
commit or push, mimPortal untouched.

## Work completed

**Task 1 — Inspection**
- Read AGENTS.md, CLAUDE.md, README.md, the five M0 reports, `app.js`, every project module,
  `.env.example`, `.env` (key names only), `package.json` and `package-lock.json`.
- No project file had changed since M0 was completed.
- Local git: **not a repository**.
- Remote `github.com/mimnets/vcl-assurer-group`: **exists, private, empty**. `git ls-remote`
  succeeded through the already-stored Git Credential Manager login and returned **zero refs**.
  The unauthenticated GitHub API returned 404, as expected for a private repository. A control
  probe of a non-existent repository returned "Repository not found", which confirms the empty
  result is real and not an auth artefact. Read-only; nothing was pushed.
- Lockfile: v3; all 1,111 packages resolve from `registry.npmjs.org`, each with an integrity hash.
- Found starter-kit `deployment/` and `scripts/sync-*` files (Stagecoach, MongoDB) that point at
  Apostrophe's placeholder host and include destructive remote commands (`mongorestore --drop`,
  `rsync --delete`). Flagged as D-GIT-2; not changed.

**Task 3 — Standards.** Created the documentation tree, naming convention, required report
sections, prompt-recording rules (verbatim, no transcripts or secrets), the index, ADR lifecycle
and template, and the runbook status convention. **Milestone 0 reports are preserved unchanged**
in `docs/milestones/`. The M0 task (`m0-001`) is indexed with its prompt marked "not archived"
rather than reconstructed.

**Task 4 — Agent rules.** AGENTS.md is the single source of truth and CLAUDE.md imports it
(the starter's existing design). Replaced the short M0 "Project rules" section with a full
"Engineering rules" section covering all 12 required topics. CLAUDE.md now contains only the
import and a note not to duplicate rules. Starter-kit conventions are unchanged below the rules.
No conflicting instruction was found.

**Task 5 — Git and CI readiness.** Wrote `docs/engineering/git-and-ci.md`: the current state, a
first-push procedure that **needs approval**, protected `main`, short-lived branches, PR review,
Conventional Commits, a proposed CI job list (not created), Dependabot, secret scanning with push
protection (or gitleaks), and CODEOWNERS. `.gitignore` was verified by dry run and hardened.

**Task 6 — Decision register.** `docs/engineering/decision-register.md` has 13 open
decisions: the 7 requested M0 items plus database (D-DB-1…4) and git (D-GIT-1…2).

Also recorded the M0 platform decision as **ADR-0001 (Proposed)**, sourced from the M0 audit,
because ADR-0002 depends on it. It contains no new analysis.

## Files changed

| Status | Path | Note |
|---|---|---|
| M | `AGENTS.md` | "Project rules" replaced by "Engineering rules"; starter conventions untouched |
| M | `CLAUDE.md` | import-only; no rules |
| M | `.gitignore` | + `*.jsonl`, `*.dump`, `*.sql`, `*.sqlite`, `*.db`, `*.db-shm`, `*.db-wal`, `/backups`, `release-id`, `.claude/settings.local.json` |
| M | `README.md` | added a "Documentation and governance" pointer section |
| M | `.env.example` | PostgreSQL example now `postgres://<user>:<password>@…` (placeholder form; avoids false positives from secret scanners). Comment line only. |
| A | `docs/engineering/INDEX.md` | |
| A | `docs/engineering/STANDARDS.md` | |
| A | `docs/engineering/git-and-ci.md` | |
| A | `docs/engineering/decision-register.md` | |
| A | `docs/engineering/prompts/2026/10/2026-10-19-m0-002-engineering-governance.prompt.md` | verbatim prompt |
| A | `docs/engineering/reports/2026/10/2026-10-19-m0-002-engineering-governance.report.md` | this file |
| A | `docs/architecture/decisions/README.md` | ADR index, lifecycle, template |
| A | `docs/architecture/decisions/ADR-0001-cms-platform-and-starter.md` | Proposed; from the M0 audit |

ADR-0002, the runbooks and the m0-003 report are listed in the m0-003 report. **No file under
`app.js`, `modules/`, `lib/`, `views/`, `scripts/` or `package*.json` changed.**

## Tests executed and actual results

| Check | Result |
|---|---|
| `npx eslint app.js lib modules scripts views` | clean |
| `npm run test:smoke` (server on 127.0.0.1:3000) | **14/14** |
| `scripts/editor-workflow-test.mjs` | **15/15** |
| `scripts/editor-workflow-test.mjs --verify-only` | **7/7** |
| Listen address (`netstat`) | `127.0.0.1:3000` only |
| `.gitignore` dry run (`git check-ignore --no-index` in a throwaway scratch repo, 601 files) | 78 tracked before the new docs; none sensitive; no legitimate file newly ignored by the added patterns; synthetic paths (`backups/x.jsonl`, `data/x.db`, `foo.sql`, `release-id`, `.claude/settings.local.json`) all ignored. Final count with this task's docs is in "Final verification" below. |
| Secret scan of the would-be-tracked set (exact values of the session secret, admin password, 10 bearer tokens, 7 session IDs and the password-hash prefix, plus AWS/GitHub/Slack/OpenAI/private-key/credentialed-URI patterns) | 0 real hits. 1 false positive (`.env.example` placeholder), fixed. Re-run on the final set: see below. |

## Final verification

Run after all files in this report and in m0-003 were written:

| Check | Result |
|---|---|
| Relative links in all `docs/**/*.md`, README, AGENTS, CLAUDE | 51 checked, **0 broken** |
| Milestone 0 reports in `docs/milestones/` | **Unchanged.** All last modified 16:56–16:58, before this task. |
| `.gitignore` dry run | 628 files → **91 tracked**; no `.env`, `data/`, uploads, build output, databases or dumps |
| Secret scan of the 91 tracked files | 22 known secret values plus patterns: **0 hits** |
| Application regression (lint / smoke / workflow / persistence) | clean / 14/14 / 15/15 / 7/7 (see "Tests executed") |

## Security observations

- No secrets were found in files that would be tracked. Local secrets (`.env`, `data/`) are ignored.
- **Database dumps are credential-bearing.** They are now git-ignored (details in m0-003).
- **D-GIT-2:** the starter's Stagecoach scripts are a latent hazard (destructive remote commands,
  third-party host name). Recommend removal before any deployment work.
- 10 API bearer tokens and 7 sessions from test runs are stored in the local database
  (local-only; D-M0-6).
- The remote is private and empty. Branch protection should be applied **immediately after** the
  first push (D-GIT-1).

## Known limitations

- CI is proposed, not implemented. It also needs a non-interactive way to create a test admin
  (currently `user:add` prompts for the password).
- Secret scanning and push protection availability on a private repository depends on the
  GitHub plan; not verified.
- Each run of `editor-workflow-test.mjs` adds two test images and a bearer token to the local
  database. Harmless locally, but CI should use a throwaway database.
- The M0 task prompt (`m0-001`) is not archived in the repository. Per the prompt, it was not
  reconstructed.

## Unresolved decisions

All in the [decision register](../../../decision-register.md): D-M0-1 … D-M0-7, D-DB-1 … D-DB-4,
D-GIT-1, D-GIT-2.

## Rollback guidance

- Delete the files marked **A** above.
- For files marked **M**:
  - There is no git history yet, so the replaced text is preserved in **Appendix A**.
  - AGENTS.md: put the Appendix A section back in place of "Engineering rules".
  - CLAUDE.md: restore Appendix A's CLAUDE.md text.
  - `.gitignore`: remove the block that starts with the "Database dumps and backups" comment.
  - `.env.example`: change `<user>:<password>` back to `USER:PASSWORD` (comment only).
- No application, database or media rollback is needed.

## Recommended next step

1. Human review of ADR-0001, ADR-0002 and the decision register.
2. If approved, carry out D-GIT-1 (first import plus branch protection) as its own task, after
   re-checking that the remote is still empty.
3. Then start Milestone 1 with the PostgreSQL acceptance test and the editor walkthrough.

## Appendix A — text replaced by this task (for rollback)

AGENTS.md, section replaced by "Engineering rules":

```markdown
## Project rules (Assurer)

- **Community Edition only.** Never add `@apostrophecms-pro/*` or Assembly
  modules. Check the license of every new dependency before adding it.
- **Module naming.** Project modules use the `assurer-` prefix
  (`modules/assurer-*`). Overrides of core modules live under
  `modules/@apostrophecms/<module>/`.
- **Links.** Use `linkFields()` / `linkHref()` from `lib/link.js` for any
  page-or-URL link; do not hand-roll link fields.
- **Page areas.** Page-level `main` areas use `lib/area.js`.
- **Secrets.** Only in `.env` (git-ignored). `APOS_SESSION_SECRET` is
  required; the app refuses to start without it.
- **Demo content.** Seeded by `node app assurer-demo:seed`; every demo item is
  labelled "Demo"/"DEMO".
- **Checks.** `npm run lint`, `npm run test:smoke` and
  `scripts/editor-workflow-test.mjs` must pass before handing work over.
```

CLAUDE.md before this task (the starter kit's version, unchanged in M0):

```markdown
# CLAUDE.md

This project's agent brief lives in AGENTS.md, imported below so Claude Code
loads it automatically.

@AGENTS.md

That import is the single source of truth for project conventions. Don't
copy content here — two copies drift, and a stale brief is worse than none.
```
