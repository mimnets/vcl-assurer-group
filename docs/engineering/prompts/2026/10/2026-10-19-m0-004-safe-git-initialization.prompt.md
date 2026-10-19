---
task: m0-004
date: 2026-10-19
source: Prompt pasted by the project owner into a Claude Code session. Recorded verbatim below; nothing redacted (it contains no secrets).
produces:
  - docs/engineering/reports/2026/10/2026-10-19-m0-004-safe-git-initialization.report.md
---

# VCL-ASSURER-GROUP — M0-004: Safe Git Initialization & Repository Baseline

Role: Principal Software Architect, Staff Engineer, Security Advisor, Engineering Delivery Lead.

Project: VCL-ASSURER-GROUP

Repository:
https://github.com/mimnets/vcl-assurer-group

## Architecture decisions

Approved:
- ADR-0001 — ApostropheCMS Community Edition.
- ADR-0002 — Native database strategy, with PostgreSQL requiring acceptance testing.
- Centralized engineering standards in AGENTS.md.
- Date-based prompt and report conventions.
- Initial Git import and first push, subject to all safety requirements below.
- Removal of unused destructive legacy deployment scripts.

Not approved:
- Production deployment.
- Live database migration.
- Modification of the existing WordPress website.
- Changes to mimPortal.

## Task 1 — Read current project standards

Read AGENTS.md, CLAUDE.md, README.md, both governance reports, both ADRs, and the decision register.

Inspect actual repository and remote status before making changes.

## Task 2 — Create a safe recovery point

Create a local backup of the current working project, including local database and media, outside the Git repository.

Exclude unnecessary regenerable dependencies and build artifacts where appropriate.

Protect the backup as sensitive data.

Confirm that recovery is possible before proceeding.

Do not commit or upload the backup.

## Task 3 — Remove dangerous legacy scripts

Inspect the inherited deployment/ directory and scripts/sync-*.

Identify scripts containing destructive remote database or file operations.

Remove unused starter deployment and sync infrastructure that is not required by VCL-ASSURER-GROUP.

Preserve any genuinely useful, non-sensitive instructions in project documentation.

Do not execute any deployment or synchronization script.

Search for remaining references and update them appropriately.

## Task 4 — Local credentials and test-state security

Identify remaining M0 test credentials, sessions and bearer tokens.

Invalidate or rotate the test credentials safely.

Ensure the existing automated tests remain reproducible.

Do not reveal credential values in logs or reports.

Do not delete the working development database or legitimate media.

## Task 5 — Git safety verification

Verify:
- The local project is not already initialized as a Git repository.
- The intended GitHub remote is the correct private repository.
- The remote has no commits or branches.
- No environment secrets, databases, uploads, dumps or backups would be tracked.
- Third-party license and attribution notices are preserved.
- The .gitignore rules are effective.
- Repository metadata and application configuration contain no unintended secret values.

If any condition fails, STOP without pushing.

Never force-push or overwrite unrelated remote history.

## Task 6 — Initialize and publish

Only after all safety checks pass:

1. Initialize Git on main.
2. Configure the verified GitHub remote.
3. Create the initial commit using a Conventional Commit message.
4. Push main normally.
5. Record the commit SHA and remote URL.
6. Verify that the remote matches the intended source state.

Do not publish local databases, media uploads, user credentials or backup files.

## Task 7 — Repository protection

Configure appropriate main-branch protection or repository rulesets if permissions and plan capabilities allow.

Target protections:
- No force pushes.
- No branch deletion.
- Pull-request review for future changes.
- Required automated checks once CI exists.
- Secret scanning where available.

If GitHub prevents a setting or requires an additional approval, document it. Do not falsely mark the protection as enabled.

For the initial import only, allow the approved bootstrap push before enforcement.

## Task 8 — Regression verification

Run:
- Lint
- HTTP smoke tests
- Editor workflow tests
- Persistence verification
- Secret scan
- Git status and remote verification

Do not claim tests passed unless executed.

## Required documentation

Record this prompt at:

docs/engineering/prompts/2026/10/2026-10-19-m0-004-safe-git-initialization.prompt.md

Create the report:

docs/engineering/reports/2026/10/2026-10-19-m0-004-safe-git-initialization.report.md

Follow the established engineering report template.

Include:
- Exact files removed or changed
- Git initialization result
- Commit SHA
- Remote push result
- Branch protection status
- Tests and results
- Credential cleanup status
- Outstanding risks
- Rollback/recovery procedure
- Milestone 0 closure recommendations

Ensure the report itself is included in the initial commit, or transparently document any follow-up commit needed to record final post-push results.

## Stop conditions

STOP before any push if:
- The remote has unexpected history.
- Secret scanning fails.
- The local recovery backup fails.
- A destructive action is required.
- The repository identity is uncertain.

Do not proceed to PostgreSQL testing or Milestone 1 implementation under this prompt.

## Completion

Report actual results and stop for architectural review.
