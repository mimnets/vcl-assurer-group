---
task: m0-006
date: 2026-10-19
source: Prompt pasted by the project owner into a Claude Code session. Recorded verbatim below; nothing redacted (it contains no secrets).
produces:
  - docs/engineering/reports/2026/10/2026-10-19-m0-006-final-m0-closure.report.md
  - docs/milestones/m1-execution-plan.md
  - docs/milestones/m1-handoff.md
---

# VCL-ASSURER-GROUP — M0-006: Final Milestone 0 Closure & M1 Readiness

**Role:** Principal Software Architect, Staff Engineer, Security Advisor, Technical Product Owner, and Engineering Delivery Lead.

**Project:** VCL-ASSURER-GROUP

**Repository:** https://github.com/mimnets/vcl-assurer-group

## Project context

We are rebuilding Assurer World using ApostropheCMS Community Edition with a modern, reusable, self-hosted architecture.

Milestone 0 established:
- ApostropheCMS Community Edition foundation.
- SQLite local development database.
- Visual editor, slideshow, product cards and contact form.
- GitHub repository and engineering governance.
- Accepted ADR-0001 and ADR-0002.
- Date-based prompt/report management.
- Safe database backup and restore procedures.

The repository owner confirms that the M0-005 documentation pull request has been merged into main.

Your assignment is to verify the current state, complete all safe outstanding Milestone 0 activities, and formally close Milestone 0 only if its acceptance requirements pass.

## Task 1 — Start-of-session verification

Read:

- AGENTS.md
- CLAUDE.md
- README.md
- ADR-0001 and ADR-0002
- docs/engineering/decision-register.md
- docs/engineering/INDEX.md
- docs/milestones/m0-closure-report.md
- docs/milestones/m0-editor-acceptance-checklist.md
- Previous milestone reports

Inspect:
- Current Git branch.
- Uncommitted changes.
- Remote repository and latest main commit.
- M0-005 pull request merge status.

Fetch safely and reconcile the local working tree with origin/main.

Never overwrite uncommitted work, force-push, or rewrite Git history.

## Task 2 — Human editor acceptance walkthrough

Launch the local Apostrophe application.

Use a dedicated editor account with the minimum necessary permissions.

Verify through the actual browser interface:

1. Editor login.
2. New page creation.
3. Direct text editing.
4. Adding widgets.
5. Rearranging and removing widgets.
6. Image upload and replacement.
7. Slideshow configuration and image ordering.
8. Responsive desktop/tablet/mobile previews.
9. Styles Editor controls, if accessible to that role.
10. Draft creation and preview.
11. Publishing changes.
12. Confirming unpublished content is not visible publicly.
13. Restoring or reverting a previous state.
14. Contact form required-field validation.
15. Contact form invalid-email rejection.
16. Successful form submission and persistence.
17. Logout and unauthorized-access checks.

Automated browser testing is permitted, but do not label it a human walkthrough.

If a real human walkthrough cannot be completed, prepare exact instructions and record the human acceptance gate as pending.

Do not declare a failed or unverified check as passed.

## Task 3 — GitHub governance verification

Check the actual status of:

- Main branch protection.
- Repository rulesets.
- Force-push restrictions.
- Branch deletion restrictions.
- Pull-request requirements.
- Dependabot alerts.
- Secret scanning availability.

Use only authorized access.

If repository settings cannot be inspected, report them as unverified and give the owner exact UI steps.

Do not extract stored GitHub credentials or attempt destructive actions to test protection.

If explicitly permitted by existing repository policy and supported by authorized access, configure non-destructive protections. Otherwise prepare the configuration for owner approval.

Do not weaken existing repository protections.

## Task 4 — Security and project hygiene

Verify:

- No secrets are tracked by Git.
- Environment variables remain private.
- Local test credentials are protected.
- No active test bearer tokens remain.
- Legacy destructive deployment scripts remain removed.
- Database and media backups are available.
- Backup restoration has previously been verified.
- No unexpected dependencies or commercial Apostrophe modules were added.

Do not modify production systems.

Do not perform a destructive database restore.

Record existing security risks for Milestone 1 rather than implementing unrelated security features in this task.

## Task 5 — Full regression verification

Run the existing project checks:

- npm run lint
- npm run test:smoke
- npm run test:workflow
- npm run test:persistence
- Production build verification where supported

Record actual results.

Investigate failures, but do not make broad unrelated code changes.

## Task 6 — Permanent Claude Code session policy

Update AGENTS.md with the following governance standards:

- Start a new Claude Code session at every new milestone.
- Start a new session for materially different tasks when prior context is no longer useful.
- Read project instructions, relevant ADRs, latest reports and Git state at the start of a session.
- Use repository documents rather than relying on previous Claude conversation context.
- Archive task prompts and sanitized reports using existing ISO-date naming conventions.
- Do not archive raw transcripts containing secrets.
- Finish each milestone with an explicit handoff and instruction to start a fresh Claude Code session.

Keep CLAUDE.md as a lightweight import of AGENTS.md without duplicating rules.

## Task 7 — Milestone 0 closure

Update:

- docs/milestones/m0-closure-report.md
- docs/engineering/decision-register.md
- docs/engineering/INDEX.md

Close Milestone 0 only when:

1. Required application tests pass.
2. Required editor acceptance checks pass, including a genuine human walkthrough.
3. M0-005 documentation is confirmed merged.
4. GitHub branch-protection status is checked and accurately documented.
5. No unresolved critical blocking issue remains.

If any mandatory gate is incomplete, keep Milestone 0 marked PENDING and explain exactly what remains.

Do not automatically waive acceptance criteria.

## Task 8 — Milestone 1 planning

Prepare a prioritized Milestone 1 execution plan.

Recommended workstreams:

**M1-001 — PostgreSQL acceptance testing**
- Disposable PostgreSQL instance.
- Apostrophe database adapter compatibility.
- SQLite-to-PostgreSQL migration test.
- Content and relationship integrity.
- Search indexing.
- Authentication and sessions.
- Media metadata.
- Backup and restore.

**M1-002 — GitHub CI and security scanning**
- Automated lint, build and tests.
- Isolated test database.
- Dependency scanning.
- Dedicated secret scanning.

**M1-003 — Security hardening**
- HTTPS and secure cookies.
- Security headers.
- Rate limiting.
- Form abuse protection.
- Vulnerability review.

**M1-004 — Form operations**
- Email notifications.
- Submission access/export.
- Data retention.
- Privacy controls.

**M1-005 — Assurer content architecture**
- Existing WordPress page inventory.
- Navigation and sitemap.
- Products, services, organizations and leadership content types.
- Reusable widgets and templates.

Do not implement Milestone 1 features under this prompt.

## Task 9 — Documentation and report

Follow the repository's established naming conventions and choose the execution date from the actual local date.

Save the prompt in:

docs/engineering/prompts/YYYY/MM/YYYY-MM-DD-m0-006-final-m0-closure.prompt.md

Create:

docs/engineering/reports/YYYY/MM/YYYY-MM-DD-m0-006-final-m0-closure.report.md

Also prepare a concise M1 handoff file describing:

- Verified application state.
- Architecture decisions.
- Current dependencies.
- Outstanding technical risks.
- Git state.
- Required next action.
- The exact first M1 task.

## Task 10 — Git workflow

Work on a short-lived feature branch.

After successful verification:

1. Review the complete diff.
2. Verify no secrets or unrelated changes are included.
3. Commit using Conventional Commits.
4. Push the feature branch normally.
5. Provide a GitHub compare URL for a pull request.

Do not push directly to main.

Do not automatically merge.

Do not deploy.

## Completion report

Provide:

1. Current GitHub main commit.
2. M0-005 merge verification.
3. Editor acceptance results.
4. Branch protection status.
5. Regression test results.
6. Security findings.
7. Whether Milestone 0 is CLOSED or PENDING.
8. Exact generated documents.
9. Feature branch and PR compare URL.
10. Milestone 1 readiness.

Finally state:

**"Start a NEW Claude Code session before Milestone 1 to save context and tokens."**

STOP after reporting and await architectural approval.
