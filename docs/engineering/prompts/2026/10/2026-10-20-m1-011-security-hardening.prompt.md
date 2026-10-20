# Prompt — m1-011: Security hardening and PostgreSQL incident follow-up

| | |
|---|---|
| **Task** | m1-011 |
| **Date** | 2026-10-20 |
| **Source** | Repository owner, pasted into a new Claude Code session. Recorded as given; nothing redacted (the prompt contains no secrets). One runtime decision the owner made during the session is recorded at the end. |

---

# VCL-ASSURER-GROUP — M1-011: Security Hardening and PostgreSQL Incident Follow-up

## Role

Act as Principal Software Architect, Staff Engineer, Application Security Engineer, Database Reliability Advisor, QA Automation Lead and Engineering Delivery Lead.

Repository: https://github.com/mimnets/vcl-assurer-group

## Owner authorization

The owner confirms that the M1-010 documentation PR #12 has been merged into main.

The architectural decision is:

**D-DB-6 — Option B: PostgreSQL provisionally accepted for development and further testing, but NOT approved for staging or production.**

The PostgreSQL connection-loss crash D-DB-5 remains unresolved.

The owner authorizes M1-011 security hardening and investigation of D-DB-5. Do not implement unrelated database infrastructure or production deployment.

## Phase 1 — Fresh-session initialization

Read and follow:

- AGENTS.md
- CLAUDE.md
- docs/engineering/STANDARDS.md
- docs/engineering/decision-register.md
- docs/engineering/INDEX.md
- docs/milestones/m1-handoff.md
- docs/milestones/m1-execution-plan.md
- ADR-0001 and ADR-0002
- The M1-009 CI specification and latest report
- The M1-010 PostgreSQL acceptance report

Verify origin/main and confirm the M1-010 merge.

Use a short-lived feature branch from verified main.

Preserve all uncommitted work.

Use task ID m1-011 only if it remains available.

## Phase 2 — Security assessment

Inspect the actual application and deployment configuration.

Assess:

1. HTTP security headers, including CSP feasibility, Referrer-Policy, X-Content-Type-Options and clickjacking protection.
2. Secure session-cookie settings for HTTPS and reverse-proxy operation.
3. Contact form abuse protections and rate limiting.
4. CSRF protection.
5. Authentication and session handling.
6. Editor permissions for site-wide Global Styles.
7. Contact-form submission retention and access permissions.
8. Dependency vulnerability baseline and upstream fixes.
9. Local backup archives containing environment files, password hashes and sessions.
10. Accidental exposure of internal files, stack traces or administrative endpoints.

First document what protection already exists. Do not duplicate Apostrophe's native security mechanisms.

Distinguish observed vulnerabilities, configuration gaps and potential risks.

## Phase 3 — Implement safe, scoped hardening

Implement only changes that can be justified, locally tested and safely rolled back.

Priorities:

- Appropriate HTTP response headers.
- Secure cookie and proxy configuration for future HTTPS deployment.
- Contact form rate limiting using a well-defined threat model.
- Reducing accidental sensitive-information exposure.
- Regression tests for those controls.

Requirements:

- Do not enable HSTS for plain HTTP localhost.
- Do not introduce a strict CSP that breaks Apostrophe editing, image uploads or Styles controls.
- Do not trust arbitrary forwarded IP headers.
- Prefer maintained open-source solutions.
- Do not change or weaken existing authentication or CSRF enforcement.
- Avoid irreversible changes to legitimate content or user accounts.

If a change cannot be safely validated, document a proposed implementation and its blocker instead of guessing.

## Phase 4 — Backup security

Review the existing local backup procedure and unencrypted backup archives.

Propose encryption and access-control requirements for development and production backups.

Do not delete, upload, overwrite, relocate or encrypt existing backups without separate owner approval.

Do not open or display sensitive backup contents unnecessarily.

Prepare a reversible backup-protection plan, including encryption, recovery-key custody and restore verification.

## Phase 5 — Dependency vulnerability review

Run the actual dependency audit.

Reconcile findings with security/audit-baseline.json.

Investigate available non-breaking upstream fixes.

Do not automatically downgrade ApostropheCMS or run npm audit fix --force.

Identify vulnerabilities affecting production versus development-only dependencies.

Update remediation recommendations and review dates based on verified evidence.

## Phase 6 — PostgreSQL D-DB-5 follow-up

Investigate the connection-loss crash identified in M1-010.

1. Inspect the actual @apostrophecms/db-connect PostgreSQL adapter version and relevant code.
2. Search the official upstream repository for an existing matching issue.
3. Confirm the expected node-postgres pool error-handling contract.
4. Prepare a minimal, sanitized reproduction and an accurate upstream issue description.
5. File the upstream issue only through an authorized integration/account with owner-approved public content; otherwise provide a ready-to-paste issue and link.
6. Evaluate supported mitigation options, including application health checks and process supervision.
7. Do not patch node_modules or add global uncaught-exception handlers.
8. Do not claim the availability defect is fixed without a successful deliberate database-disconnect and recovery test.

If the required remediation exceeds the security-hardening scope, create a separate numbered follow-up proposal.

Keep D-DB-5 OPEN until validated.

## Phase 7 — Tests and browser verification

Run applicable checks:

- Lint
- Unit tests
- CI-isolated regression suite
- Production build
- Audit baseline check
- Secret scanning
- Security-specific negative tests

Use Claude in Chrome, as authorized by the owner, to verify application behavior.

At the end of this phase, test:

- Public homepage and media
- Login/logout
- Editor workflows
- Draft/published content isolation
- Form validation and abuse controls
- Desktop/tablet/mobile layout
- Admin/editor authorization boundaries

Use the real browser UI for applicable workflows. Do not represent API-only checks as browser tests.

Record PASS, FAIL, BLOCKED and NOT TESTED accurately.

## Phase 8 — Documentation and decisions

Create the dated prompt and report:

docs/engineering/prompts/YYYY/MM/YYYY-MM-DD-m1-011-security-hardening.prompt.md

docs/engineering/reports/YYYY/MM/YYYY-MM-DD-m1-011-security-hardening.report.md

Update as appropriate:

- Engineering decision register
- Engineering INDEX
- M1 execution plan
- M1 handoff
- Security documentation
- Relevant ADRs, only when the architectural decision actually changes

Record the owner's D-DB-6 decision as PostgreSQL Option B.

Preserve the MongoDB fallback and SQLite local development support.

Do not declare the production database selected.

## Phase 9 — Git and delivery

Review the diff, scope and security impact.

Use Conventional Commits.

Run the repository's approved secret scan before pushing.

Push only to a feature branch.

Provide a GitHub compare link.

Do not merge automatically.

Do not deploy.

Do not change the Assurer WordPress site or mimPortal.

## Required final report

Provide:

1. Verified main SHA and M1-010 merge.
2. D-DB-6 decision recorded.
3. Security findings, classified by severity.
4. Actual changes implemented.
5. Existing protections preserved.
6. Backup encryption recommendations.
7. Dependency audit findings.
8. D-DB-5 upstream issue status and mitigation proposal.
9. Automated and negative test results.
10. Chrome acceptance checklist and results.
11. Remaining security risks and blockers.
12. Git branch, commit and PR URL.
13. Exact report path.
14. Recommended next engineering task.

Do not claim M1-011 complete until the applicable checks pass.

STOP after reporting. Await architectural review before merging or deploying.

At the next major task or phase boundary, recommend starting a NEW Claude Code session to reduce context and token usage.

---

## Owner decision during the session

1. **New dependency (AGENTS.md gate).** The agent asked whether it could add the official
   `@apostrophecms/security-headers` 1.0.2 (MIT, no runtime dependencies, no GitHub advisories),
   or use a project module with no new dependency, or defer the headers. **Owner answer: "Approve
   official module (Recommended)".**
