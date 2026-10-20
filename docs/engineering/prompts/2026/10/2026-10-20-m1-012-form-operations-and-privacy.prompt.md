# Prompt — m1-012: Form operations, privacy and reliability

| | |
|---|---|
| **Task** | m1-012 |
| **Date** | 2026-10-20 |
| **Source** | Repository owner, pasted into a new Claude Code session. Recorded as given; nothing redacted (the prompt contains no secrets). |

---

# VCL-ASSURER-GROUP — M1-012: Form Operations, Privacy and Reliability

## Role and project

Act as Principal Software Architect, Staff Engineer, Application Security Engineer, Privacy-by-Design Engineer, QA Automation Lead and Engineering Delivery Lead.

Project: VCL-ASSURER-GROUP
Repository: https://github.com/mimnets/vcl-assurer-group
Platform: ApostropheCMS Community Edition

This is a NEW Claude Code session. Read repository instructions and documented handoffs instead of relying on earlier chat context.

## Owner authorization

The repository owner confirms that M1-011 Pull Request #13 has been merged into main.

M1-011 is accepted for development. Production deployment remains unauthorized.

Implement M1-012 Form Operations, using free/open-source functionality and Apostrophe's supported extension interfaces.

Preserve all previously implemented security protections.

## Phase A — Initialization and GitHub CI gate

Read:

- AGENTS.md
- CLAUDE.md
- docs/engineering/STANDARDS.md
- docs/engineering/decision-register.md
- docs/engineering/INDEX.md
- docs/milestones/m1-handoff.md
- docs/milestones/m1-execution-plan.md
- docs/runbooks/security-configuration.md
- docs/runbooks/backup-protection-plan.md
- The M1-011 security-hardening report
- Relevant ADRs and form module documentation

Fetch origin/main safely.

Verify PR #13 is merged and record the actual merge SHA.

Inspect the GitHub Actions runs triggered by its PR and push to main.

Check all five jobs: lint, build, test, secrets and audit.

Record run URLs, commit SHAs, conclusions and actual test execution.

Do not mark hosted CI green without examining the results.

STOP implementation if hosted CI is failing. If CI cannot be inspected, report the verification blocker and do not claim full CI acceptance.

Preserve local uncommitted work. Verify that m1-012 is the next available task ID.

## Phase B — Investigate existing form architecture

Inspect the actual Apostrophe form and submission modules.

Determine:

1. How submissions are validated and stored.
2. Whether the installed Community modules provide supported email notification hooks.
3. How form submission failures are returned to the browser.
4. What authorized submission access and export capabilities exist.
5. Whether records contain sensitive user information.
6. Which existing permissions can safely restrict form submission management.
7. How the M1-011 rate limiter integrates with this form.
8. How retention and cleanup could be implemented without corrupting Apostrophe-managed records.

Do not invent database schemas or bypass existing form validation.

Document findings before implementation.

## Phase C — Reliable email notification

Implement configurable notifications to a designated company mailbox.

Requirements:

- Use an established, maintained email transport library or supported Apostrophe integration.
- Use SMTP or another provider-independent transport where practical.
- Read configuration exclusively from environment variables.
- Never hardcode SMTP credentials.
- Support local email testing using a disposable SMTP sink or test transport.
- Do not send test emails to real customers or external recipients.
- Render plain-text emails safely.
- Escape untrusted values in any HTML notification.
- Prevent email header injection.
- Do not allow a visitor to choose arbitrary notification recipients.
- Minimize personally identifiable information in notifications.
- Include a submission identifier and timestamp for reconciliation.
- Do not log complete contact messages or secrets.
- Never expose SMTP errors or credentials to visitors.

Explicitly define notification semantics.

A submission stored successfully must not be represented as rejected merely because a notification fails.

A notification failure should be logged safely and made visible to authorized operators through a supported mechanism.

Investigate a bounded retry or outbox strategy, but do not introduce complex asynchronous infrastructure without justification.

If an email provider or live credentials are unavailable, implement and test the integration using a local email sink and mark real delivery NOT VERIFIED.

## Phase D — Correct misleading form-success behavior

Investigate D-SEC-3.

The existing upstream form widget may display a success message after certain unsuccessful requests.

Provide a project-scoped, upgrade-safe mitigation for failed HTTP requests, including:

- 403 CSRF rejection
- 429 rate limiting
- 500 server error
- Network interruption or timeout

Requirements:

- Never display a successful-submission message unless the server confirms acceptance.
- Distinguish submission acceptance from email notification delivery.
- Keep entered values when safe.
- Show a useful non-sensitive error to the visitor.
- Prevent repeated submissions caused by uncertainty where feasible.
- Preserve Apostrophe's native form validation.
- Avoid modifying node_modules or introducing fragile monkey patches.

Test these cases through both HTTP checks and the actual browser.

If an upgrade-safe fix is not feasible, document the limitation and keep the relevant risk open.

## Phase E — Submission management and export

Design and implement a minimal, secure way for authorized staff to review submissions.

Prefer supported Apostrophe APIs and Community capabilities.

Requirements:

- No anonymous submission-listing endpoint.
- No access for unauthorized Editor accounts by default.
- Explicit authorization enforcement on every server-side operation.
- Server-side pagination and bounded export size.
- CSV export only if safe and authorized.
- Protect against spreadsheet formula injection.
- Avoid including credentials, session data or unnecessary personal information.
- Preserve auditability for administrative actions where feasible.
- Do not implement arbitrary database queries from the browser.
- Do not expose internal submission document structures unnecessarily.

Start with a minimal functionality set rather than constructing a separate CMS or administrative framework.

If a full submission dashboard is disproportionate to the current milestone, implement a smaller supported solution and record the deferred functionality.

## Phase F — Retention and privacy

Prepare a configurable submission-retention policy.

Recommended design considerations:

- A documented default retention period requiring owner approval.
- Clear separation of test and real submissions.
- Defined authorized data access.
- Export and deletion procedures.
- Backup retention implications.
- Safe handling of access and erasure requests.
- Retention cleanup that supports dry-run and reports affected record counts.
- Protection against accidental removal of unrelated CMS documents.

Do not permanently delete any existing submissions or archives in this task.

Do not activate automatic deletion until the owner approves the actual retention period and deletion policy.

Use disposable databases for deletion tests.

Assess applicable privacy requirements without claiming that a single retention duration is legally sufficient for all countries.

## Phase G — Spam protection and CAPTCHA decision

Review whether the existing rate limit and honeypot/anti-bot measures are sufficient for initial deployment.

Evaluate maintained, Community-compatible CAPTCHA alternatives and their licensing, privacy implications, accessibility and costs.

Prefer privacy-preserving, low-friction protection.

Do not introduce a paid service, external CAPTCHA provider or third-party tracking without separate approval.

Document the recommended solution and configuration requirements.

Keep the existing M1-011 rate limiter functioning.

## Phase H — PostgreSQL upstream issues

The architect approves preparing public reports for:

- D-DB-5: PostgreSQL adapter pool error causing process exit.
- D-SEC-3: Form widget reporting success after failed submission.

Check for duplicates first.

Review and sanitize the complete issue text.

If an authorized GitHub integration is available, prepare the issue for owner review before posting.

Otherwise provide ready-to-paste issue descriptions and official issue links.

Do not publish private source code, credentials, session logs, local paths containing identities or customer information.

Do not spend this task implementing a PostgreSQL production deployment.

## Phase I — Testing

Run the established checks:

- npm run lint
- npm run test:unit
- npm run test:ci
- npm run build
- npm run audit:check
- Approved Gitleaks scan

Add targeted tests for:

1. Valid form submission.
2. Invalid form submission.
3. Notification success.
4. Notification transport failure.
5. Unauthorized submission access.
6. Export authorization and CSV safety.
7. Retention dry-run.
8. Retention deletion against disposable data, only if implemented.
9. CSRF rejection.
10. Rate limit.
11. HTTP 500 error response.
12. Network failure behavior.
13. SMTP credential secrecy.
14. Existing security-header and cookie behavior.

Do not modify the owner's production data.

Do not invent test results or hide intentionally skipped cases.

## Phase J — Browser acceptance

Use the authorized Claude in Chrome extension at the end of implementation.

Create an explicit browser test matrix as required by STANDARDS.md.

Use only the local development application and disposable accounts.

Check:

- Public form validation.
- Successful submission feedback.
- Rejection and error feedback.
- Rate-limit messaging.
- Responsive layouts.
- Administrator submission access, if implemented.
- Editor authorization restrictions.
- Notifications via local test transport.
- Login/logout.
- No regression to page editing and publishing.

Use actual browser interactions for UI checks.

Mark browser-inaccessible features NOT TESTED.

Clearly distinguish agent-executed tests from human business acceptance.

Archive disposable test accounts and pages using supported APIs.

## Phase K — Documentation

Create dated prompt and report files:

docs/engineering/prompts/YYYY/MM/YYYY-MM-DD-m1-012-form-operations-and-privacy.prompt.md

docs/engineering/reports/YYYY/MM/YYYY-MM-DD-m1-012-form-operations-and-privacy.report.md

Update as appropriate:

- docs/engineering/decision-register.md
- docs/engineering/INDEX.md
- docs/milestones/m1-execution-plan.md
- docs/milestones/m1-handoff.md
- Relevant form operations and privacy runbooks
- .env.example with placeholder names only

Record unresolved external-service, privacy and authorization decisions explicitly.

Preserve historical reports.

## Phase L — Git workflow

Create a short-lived feature branch from verified main.

Use Conventional Commits.

Review the changed files, security impact and any dependencies.

Ensure no .env values, passwords, database dumps, private messages, screenshots or tokens are included.

Commit and push only after applicable local checks pass.

Provide a compare URL for owner review.

Do not push to main directly, force-push, merge automatically or deploy.

## Final report

Report:

1. Main SHA and PR #13 merge verification.
2. M1-011 hosted CI verification with URLs.
3. Existing form architecture assessment.
4. Email notification implementation and local delivery results.
5. Failure-handling results for 403/429/500/network errors.
6. Staff submission access and export functionality.
7. Retention policy proposal and approvals still needed.
8. CAPTCHA/anti-spam recommendation.
9. Upstream issue preparation status.
10. Unit, integration, negative and Chrome browser results.
11. Security/privacy findings and remaining risks.
12. Exact files changed.
13. Feature branch, commit SHAs and PR compare URL.
14. Recommended next task and outstanding architectural decisions.

STOP after reporting.

Await architectural approval before merging, enabling destructive retention cleanup, using production email credentials or deploying.

Recommend a NEW Claude Code session before the next major task to save context and tokens.
