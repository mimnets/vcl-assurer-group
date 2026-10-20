---
task: m0-007
date: 2026-10-19
source: Prompt pasted by the project owner into a Claude Code session. Recorded verbatim below; nothing redacted (it contains no secrets). During the session the owner added, in chat, that only the Claude in Chrome extension may be used for browser automation.
produces:
  - docs/engineering/reports/2026/10/2026-10-19-m0-007-browser-editor-acceptance.report.md
  - docs/milestones/m0-human-usability-checklist.md
---

# VCL-ASSURER-GROUP — M0-007: Browser-Based Editor Acceptance Verification

**Role:** Principal Software Architect, Staff Engineer, QA Automation Lead, Security Advisor and Engineering Delivery Lead.

**Repository:** https://github.com/mimnets/vcl-assurer-group

## Objective

Complete the remaining ApostropheCMS Milestone 0 editor acceptance verification using real browser interactions.

Milestone 0 is currently PENDING.

Do not close Milestone 0 automatically. The repository owner will perform final human usability acceptance.

## Task 1 — Inspect existing state

Read:

- AGENTS.md
- CLAUDE.md
- docs/milestones/m0-editor-acceptance-checklist.md
- docs/milestones/m0-closure-report.md
- docs/engineering/decision-register.md
- docs/milestones/m1-handoff.md

Inspect Git status and verify the current repository state safely.

Check whether M0-006 has been merged. Do not overwrite local or remote changes.

## Task 2 — Browser capability

Check whether Claude in Chrome is connected.

Preferred: Claude Code browser integration.

Fallback: existing Playwright/Puppeteer-compatible browser automation with Microsoft Edge or Chrome.

Use a fresh browser profile with no unrelated accounts or sensitive data.

Access only the local VCL-ASSURER-GROUP development site.

If browser access is unavailable, report the blocker and stop the UI verification rather than substituting API-only checks.

## Task 3 — Dedicated Editor account

Create or use a disposable ApostropheCMS Editor account with minimum necessary permissions.

Do not use the Administrator account for editor-role acceptance testing.

Use only supported Apostrophe user-management methods.

Store test credentials outside Git. Never display passwords, tokens, cookies or session secrets in screenshots or reports.

## Task 4 — Execute the complete UI checklist

Use the existing 23-row checklist as the authoritative test specification.

Perform every applicable test through actual browser UI interactions.

Verify:

- Login/logout
- New page creation
- Direct content editing
- Adding widgets
- Reordering and removing widgets
- Image upload and replacement
- Slideshow management
- Responsive previews
- Styles Editor controls and role access
- Draft/published content separation
- Publishing and reverting edits
- Contact form validation and submission
- Unauthorized access protection

Use clearly marked disposable test content.

For each checklist row record:

- Test number
- Requirement
- Browser steps
- Expected result
- Actual observed result
- PASS / FAIL / BLOCKED / NOT TESTED
- Evidence reference

Do not mark a test PASS solely because the API works or the UI control is visible.

If a widget cannot be dragged but supports another intended reorder mechanism, document the actual behavior and evaluate it against the checklist's required workflow.

## Task 5 — Evidence

Capture appropriate screenshots of:

1. Editor login
2. Page tree and page creation
3. Visual content editing
4. Widget insertion and reordering
5. Image replacement
6. Slideshow configuration
7. Mobile preview
8. Draft and published-state verification
9. Form validation

Store sanitized test screenshots under a dedicated ignored local evidence directory.

Do not commit screenshots that contain credentials, tokens, private information or test form personal data.

Avoid retaining unnecessary session recordings or browser profiles.

## Task 6 — Security and cleanup

Use disposable local pages and media.

Do not modify the real Assurer WordPress website.

Do not connect to production systems.

Do not use real customer or personal data.

Do not publish content outside the local development environment.

After testing, remove or archive test pages using supported Apostrophe APIs.

Invalidate disposable sessions and remove the temporary editor account if appropriate.

Preserve the original M0 demonstration content.

## Task 7 — Independent verification

Run the existing regression checks.

Compare browser results with the existing automated test results.

Document discrepancies without concealing failures.

Do not change application code or silently fix defects. Report defects for approval.

## Task 8 — GitHub protection status

Check whether active GitHub branch protection or repository rulesets apply to main, using only authorized read-only access.

If access is unavailable, keep D-GIT-3 UNVERIFIED and provide the repository owner the exact UI checks.

Do not attempt a force push, delete a branch, extract GitHub credentials or change repository settings.

## Task 9 — Report

Follow existing dated documentation conventions.

Use task ID m0-007 unless the repository already uses it; if so, select the next unused ID.

Save the prompt and report in the established date-based directories.

Update the editor checklist with automated browser results, clearly marked as agent-executed.

Prepare a short final human usability checklist for the repository owner.

Keep Milestone 0 PENDING until:
- Browser test evidence is reviewed.
- Human usability acceptance is recorded.
- The GitHub branch protection status is documented.
- All other closure gates are verified.

## Git policy

Use a feature branch.

Do not commit or push automatically unless explicitly permitted by the current repository governance rules.

Do not merge any pull request.

Do not deploy.

## Final deliverable

Report:

1. Browser automation method.
2. Editor account and permission level.
3. Results for all 23 tests.
4. Screenshots and evidence locations.
5. Failed or blocked requirements.
6. Security findings.
7. Human acceptance tasks remaining.
8. GitHub protection status.
9. Milestone 0 closure recommendation.

Stop after reporting.

Start a NEW Claude Code session before beginning Milestone 1 to reduce context and token usage.
