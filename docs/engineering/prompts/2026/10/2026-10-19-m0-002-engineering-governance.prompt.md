---
task: m0-002
date: 2026-10-19
source: Prompt pasted by the project owner into a Claude Code session. Recorded verbatim below; nothing redacted (it contains no secrets).
produces:
  - docs/engineering/reports/2026/10/2026-10-19-m0-002-engineering-governance.report.md (Tasks 1, 3, 4, 5, 6)
  - docs/engineering/reports/2026/10/2026-10-19-m0-003-database-strategy.report.md (Task 2, task ID m0-003)
---

# VCL-ASSURER-GROUP — Engineering Governance and Database Strategy

Role: Principal Software Architect, Staff Engineer, Security Advisor, Technical Product Owner, and Engineering Delivery Lead.

Project: VCL-ASSURER-GROUP
Repository: https://github.com/mimnets/vcl-assurer-group
Date: 2026-10-19

## Objective

Standardize the existing ApostropheCMS project for professional, secure, maintainable development.

This is a documentation, governance, and verification task. Do not implement new website features or perform database migrations.

## Task 1 — Inspect existing work

Read:

- AGENTS.md
- README.md
- All five Milestone 0 reports
- app.js
- Existing module definitions
- Existing environment configuration
- package.json and package-lock.json
- Current Git status and remotes

Do not assume the remote GitHub repository is empty. Inspect its branch and history before proposing any push.

## Task 2 — Database architecture decision

Document the following preferred architecture:

- SQLite for local POC development and automated tests.
- PostgreSQL for staging and production, subject to compatibility verification.
- ApostropheCMS native Pages, Pieces, Widgets, schema, query and migration APIs.
- No custom parallel CMS database or ORM.
- No raw SQL for normal content-management operations.
- Independent database and media storage for every future company website.
- Portable database export and restore using supported Apostrophe tools.

Investigate and document:

1. SQLite-to-PostgreSQL migration.
2. Portable JSONL database export/restore.
3. Media backup and migration.
4. Permissions and content version preservation.
5. Adapter limitations.
6. Production backup and recovery procedures.
7. How to initialize a new client website with clean data.

Do not execute the migration yet.

Create:

docs/architecture/decisions/ADR-0002-database-strategy.md

## Task 3 — Engineering documentation standards

Establish:

docs/engineering/prompts/YYYY/MM/
docs/engineering/reports/YYYY/MM/
docs/engineering/INDEX.md
docs/architecture/decisions/
docs/runbooks/

Naming pattern:

YYYY-MM-DD-mN-NNN-descriptive-task.prompt.md
YYYY-MM-DD-mN-NNN-descriptive-task.report.md

Use the same task identifier to associate prompts and reports.

Reports must contain:

- Task identifier
- Date and scope
- Git branch and commit, if available
- Requirements
- Work completed
- Files changed
- Tests executed and actual results
- Security observations
- Known limitations
- Unresolved decisions
- Rollback guidance
- Recommended next step

Maintain an index linking related prompts, reports, ADRs and pull requests.

Preserve the existing Milestone 0 reports. Do not delete or overwrite historical records.

## Task 4 — Claude Code rules

Create or update CLAUDE.md and AGENTS.md without conflicting or duplicating instructions.

Define:

- Minimal-change implementation policy
- Official Apostrophe APIs first
- No unapproved dependencies
- No commercial Apostrophe modules
- Database migration safety
- Security-by-default
- No secrets in source or reports
- Test-before-completion requirements
- Descriptive dated prompt/report naming
- Git branch and pull-request workflow
- No unauthorized commits, pushes or deployments
- Explicit human approval at architecture gates

Never include credentials or sensitive session transcripts in Git-tracked documentation.

## Task 5 — Git and CI readiness

Inspect the local and remote repositories.

Recommend:

- Protected main branch
- Short-lived feature branches
- Pull-request review
- Automated lint/build/tests
- Dependency vulnerability monitoring
- Secret scanning
- Gitignore verification
- Conventional Commits for commit messages

Do not rewrite Git history or push automatically.

## Task 6 — Milestone 0 outstanding decisions

Prepare a short decision register covering:

- Human editor walkthrough
- PostgreSQL acceptance test
- Form email notifications
- Form submission access and retention
- Outstanding security findings
- Local test credentials
- Project licensing and third-party notices

## Required final reports

Create:

docs/engineering/reports/2026/10/2026-10-19-m0-002-engineering-governance.report.md

docs/engineering/reports/2026/10/2026-10-19-m0-003-database-strategy.report.md

Record this task prompt as:

docs/engineering/prompts/2026/10/2026-10-19-m0-002-engineering-governance.prompt.md

Keep the database decision and its report cross-referenced by their identifiers.

Do not fabricate previous prompts or execution history.

## Constraints

- Do not change application behavior.
- Do not modify production systems.
- Do not migrate any database.
- Do not expose credentials.
- Do not introduce a new ORM.
- Do not push or commit without approval.
- Do not modify mimPortal.

At completion, summarize the decisions, generated files, remaining risks, and whether the project is ready for Milestone 1.

Stop for human approval.
