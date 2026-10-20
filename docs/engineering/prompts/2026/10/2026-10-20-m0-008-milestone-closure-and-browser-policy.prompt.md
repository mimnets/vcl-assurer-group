---
task: m0-008
date: 2026-10-20
source: Prompt pasted by the project owner into a Claude Code session. Recorded verbatim below; nothing redacted (it contains no secrets).
produces:
  - docs/engineering/reports/2026/10/2026-10-20-m0-008-milestone-closure-and-browser-policy.report.md
---

# VCL-ASSURER-GROUP — M0-008: Milestone Closure and Browser Testing Policy

Act as Principal Software Architect, Staff Engineer, Security Advisor, QA Automation Lead, Technical Product Owner, and Engineering Delivery Lead.

## Project

Name: VCL-ASSURER-GROUP

Repository: https://github.com/mimnets/vcl-assurer-group

Platform: ApostropheCMS Community Edition

Development environment: VS Code + Claude Code + Claude in Chrome.

## Confirmed information

The repository owner confirms:

- The M0-007 pull request has been merged into main.
- Claude Code has access to Google Chrome through its browser extension.
- Claude is authorized to test the local application through real browser UI interactions.
- Browser-based usability and functional testing should be performed at the conclusion of every completed task or phase.
- New major milestones should begin in fresh Claude Code sessions to reduce context and token consumption.
- The owner has accepted the temporary lack of enforceable branch protection for the private, single-maintainer repository, with documented compensating controls.

Do not interpret agent-executed browser testing as a human walkthrough.

## Task 1 — Verify current state

Read AGENTS.md, CLAUDE.md, the decision register, M0 closure report, M1 handoff, existing test documentation and relevant ADRs.

Inspect Git status and fetch origin/main safely.

Verify that M0-007 has been merged.

Preserve all uncommitted local changes.

Follow the global sequential task-numbering convention. Use m0-008 only if unused.

## Task 2 — Establish permanent browser-testing standards

Update AGENTS.md with the following requirements:

1. Claude Code must use its authorized Chrome extension for end-to-end UI verification where appropriate.
2. Run relevant browser acceptance checks at the end of each completed feature or development phase.
3. Use a non-administrator test account when testing normal editor capabilities.
4. Verify real UI interactions, not merely HTTP responses or visible controls.
5. Test relevant desktop, tablet and mobile layouts.
6. Verify draft/published isolation and access permissions for content changes.
7. Capture sanitized evidence when useful.
8. Keep browser credentials, sessions and screenshots containing sensitive data out of Git.
9. Record PASS, FAIL, BLOCKED or NOT TESTED with actual evidence.
10. Distinguish agent-executed acceptance tests from human business/usability approval.
11. Clean up disposable test content and accounts safely.
12. Stop and report if Chrome is unavailable; do not pretend browser tests were completed.

Add a task-specific browser checklist requirement to engineering standards.

Keep CLAUDE.md as an import of AGENTS.md.

## Task 3 — Milestone 0 reconciliation

Verify:

- M0-007 merge.
- Existing 23/23 browser test results.
- Latest regression test results.
- Accepted branch-protection risk decision.
- Editor account cleanup status.
- Outstanding security risks.
- Outstanding human usability approval.

Attempt safe cleanup of the disposable M0-007 Editor account only through supported Apostrophe administration methods and authorized local access.

Do not delete legitimate user accounts or content.

Run relevant final regression checks.

If no human usability acceptance has been recorded, leave that gate pending and prepare a concise owner sign-off section.

Do not close Milestone 0 by silently waiving the existing human acceptance requirement.

## Task 4 — Documentation and handoff

Update:

- docs/milestones/m0-closure-report.md
- docs/milestones/m1-handoff.md
- docs/milestones/m1-execution-plan.md
- docs/engineering/decision-register.md
- docs/engineering/INDEX.md

Preserve historical reports unchanged unless correcting a demonstrable error through an appropriately documented amendment.

Record whether M0 is CLOSED or PENDING, with supporting evidence.

## Task 5 — Prepare the next implementation task

Confirm the next available task identifier.

Prepare a detailed specification for the first Milestone 1 task:

GitHub Actions CI, reproducible tests and automated security scanning.

Scope:

- npm ci
- ESLint
- Production build
- HTTP smoke tests
- Editor workflow tests
- Persistence tests
- Isolated test database
- Gitleaks or equivalent open-source secret scanning
- Dependency audit with a documented baseline for known upstream findings
- Pull-request checks
- No production secrets in CI
- No paid GitHub security services required

Do not implement CI in this closure task.

## Task 6 — Git workflow

Work on a short-lived branch.

After checks pass, review the complete diff, perform a secret scan, commit using Conventional Commits, and push normally.

Provide the GitHub compare URL.

Do not automatically merge.

Do not force-push or push directly to main.

## Required report files

Save the task prompt and execution report using the verified task identifier and current execution date.

Suggested report name:

YYYY-MM-DD-m0-008-milestone-closure-and-browser-policy.report.md

Also ensure the M1 handoff contains enough verified project context for a fresh Claude Code session.

## Completion

Report:

1. Verified latest main commit.
2. M0-007 merge status.
3. Browser-testing policy changes.
4. Regression results.
5. Temporary Editor account status.
6. Human acceptance status.
7. Milestone 0 status with explicit reasons.
8. Next available task identifier.
9. Files changed and commit SHA.
10. PR compare URL.

STOP after reporting.

At the end, explicitly recommend starting a NEW Claude Code session for Milestone 1 once the closure gate and documentation merge are complete.
