# Milestone 1 — Execution plan (proposed)

| | |
|---|---|
| **Status** | **Approved and started 2026-10-20** (D-M1-0, owner, m1-009 prompt). WS-2 (`m1-009`) is merged and its hosted CI verified (m1-010). WS-1 (`m1-010`) is done; the owner decided D-DB-6 = Option B (development and testing only). WS-3 (`m1-011`) is merged (PR #13, `1978449`). WS-4 (`m1-012`) is done by the agent and awaits review. WS-5 is not started. |
| **Prepared** | 2026-10-19 (`m0-006`); IDs and WS-2 updated 2026-10-20 (`m0-008`); status updated 2026-10-20 (`m1-009`, `m1-010`, `m1-011`, `m1-012`) |
| **Precondition** | Milestone 0 closed: met 2026-10-20 ([closure report](./m0-closure-report.md)). |
| **Handoff** | [m1-handoff.md](./m1-handoff.md) |

## Task IDs

The m0-006 prompt names five workstreams "M1-001" to "M1-005". Under
[STANDARDS.md](../engineering/STANDARDS.md), task numbers run across the whole project and are
never reused (`m0-001`…`m0-008` are taken; IDs shifted by one in m0-007 and again in m0-008). So the workstreams keep their labels (WS-1 to
WS-5), and each task gets the next free ID when it starts. The IDs below are the expected
allocation if the tasks start in this order.

## Priority order

| # | Task ID | Workstream | Why this position | Depends on | Approval gates |
|---|---|---|---|---|---|
| 1 | `m1-009` | **WS-2 CI and security scanning** | Every later change is checked automatically. It is also the main compensating control while `main` cannot be protected on the current plan (D-GIT-3). Small, and has no external dependency. | None | Adding any action or tool counts as a dependency decision |
| 2 | `m1-010` | **WS-1 PostgreSQL acceptance test** | Gates every staging decision (ADR-0002 §6, D-M0-2). Running it under CI catches adapter regressions. | m1-009 (recommended, not required) | Disposable database only; D-DB-2 provider choice comes after a pass |
| 3 | `m1-011` | **WS-3 Security hardening** | Required before any shared or internet-facing environment (D-M0-5, S1–S3, S9) | m1-009 | New middleware or package = dependency approval |
| 4 | `m1-012` | **WS-4 Form operations** | Needed before the contact form goes live (D-M0-3, D-M0-4, S4) | Business decisions D-M0-3 and D-M0-4 | SMTP credentials go in the secret store only |
| 5 | `m1-013` | **WS-5 Assurer content architecture** | Largest workstream. The **WordPress inventory part is read-only and can start in parallel** with #1–#2. | Inventory: none. Content types: m1-010 result recommended. | Read-only access to the existing WordPress site; never modify it |

## Workstream scope and exit criteria

### WS-2 — GitHub CI and security scanning (`m1-009`)
- **Status (2026-10-20, m1-010):** merged (PR #11, `d0f4a05`); all five jobs green on GitHub; exit criterion met except the optional GitHub-side negative tests.
- **Earlier status (2026-10-20):** implemented on `ci/m1-009-github-actions` ([report](../engineering/reports/2026/10/2026-10-20-m1-009-ci-and-security-scanning.report.md)). Local checks and local negative tests pass. **GitHub-hosted runs are PENDING**, so the exit criterion is not yet met.
- **Detailed specification: [m1-009-ci-and-security-scanning-spec.md](./m1-009-ci-and-security-scanning-spec.md)**
  (prepared in m0-008). Summary: a GitHub Actions workflow with `npm ci`, ESLint, the production
  build, and the smoke, workflow and persistence suites on a fresh per-run SQLite database;
  a non-interactive test-admin bootstrap with generated credentials; gitleaks (MIT) secret
  scanning over the full history; `npm audit` against a documented baseline (43 findings, 5 high,
  on 2026-10-20); PR checks; no repository secrets; no paid GitHub features.
- **Exit:** every job is green on the m1-009 PR, and the negative tests (lint, test, fake secret,
  new advisory) are shown to fail. A required-check ruleset cannot be enforced on the current
  plan (D-GIT-3).
- **Browser acceptance** (AGENTS.md): read-only check of the PR's Checks tab in Chrome, plus a
  public-site smoke check.

### WS-1 — PostgreSQL acceptance test (`m1-010`)
- **Status (2026-10-20): done** ([m1-010 report](../engineering/reports/2026/10/2026-10-20-m1-010-postgresql-compatibility-acceptance.report.md)). Every ADR-0002 §6 item passes. One failure: the app exits on database connection loss (D-DB-5). Recommendation B (provisional), awaiting the owner (D-DB-6).
- A disposable PostgreSQL 16 instance (local container or throwaway managed instance). No shared
  database.
- Run ADR-0002 §6 in full: restore the M0 JSONL dump into an empty database, run migrations,
  run the smoke, workflow and persistence suites, page order with 10+ siblings, search
  relevance, concurrent editing, connection-pool soak, and `pg_dump`/`pg_restore` plus an
  `apos-db-dump`/`apos-db-restore` round trip.
- Also check: relationship integrity (`_` fields), sessions and login, and media metadata
  (attachment records match files).
- **Exit:** a dated report with a pass or fail per item, and a recommendation on D-M0-2.

### WS-3 — Security hardening (`m1-011`)
- **Status (2026-10-20): done by the agent; awaiting architectural review** ([m1-011 report](../engineering/reports/2026/10/2026-10-20-m1-011-security-hardening.report.md)).
  - Implemented: security headers via the official module, with a baseline CSP and HSTS only behind HTTPS; X-Powered-By removed; Secure cookies and a restricted `trust proxy` (env-driven); per-IP contact-form rate limit.
  - Re-decided: the audit baseline. Proposed: a backup protection plan and D-DB-5 follow-up.
  - Open: a resource CSP (D-SEC-2), a per-IP login limit and CAPTCHA (D-M0-5, S3), and S9 (password policy, 2FA, lockout).
- HTTPS and `Secure` session cookies behind a proxy (`trust proxy`) (S2).
- Security headers: CSP tuned for the admin UI, HSTS, `frame-ancestors`, `Referrer-Policy`,
  remove `X-Powered-By` (S1).
- Rate limiting on `/login` and form submission (S3).
- Form abuse protection: CAPTCHA or an equivalent, with the Community Edition option confirmed (S3).
- Password policy, lockout and 2FA options, checked for edition (S9).
- Vulnerability review: re-run `npm audit` (42 findings, 4 high, on 2026-10-19; 43 findings,
  5 high, on 2026-10-20, where the new high is dev-only `nodemon` through `braces`); re-decide S5
  and S6, and the m1-009 audit baseline.
- **Exit:** findings S1–S3 and S9 closed or accepted with dates in the decision register.

### WS-4 — Form operations (`m1-012`)
- **Status (2026-10-20): done by the agent; awaiting architectural review** ([m1-012 report](../engineering/reports/2026/10/2026-10-20-m1-012-form-operations-and-privacy.report.md), [runbook](../runbooks/form-operations-and-privacy.md)).
  - Built: env-configured notifications (core email module, no new dependency), the D-SEC-3 widget fix, an admin-only review page and CSV export, and a retention task (dry run plus guarded delete).
  - Not yet verified or enabled: real delivery, pending a provider (D-M0-3, D-FORM-4); retention, pending the period (D-FORM-2); anti-spam choice (D-FORM-3).
  - Exit criterion not met: the business owner and DPO have not signed off.
- Email notifications via `@apostrophecms/email` (D-M0-3), with SPF/DKIM for the sender.
- Submission access: an export task or an admin view (D-M0-4).
- Retention: scheduled deletion (recommended 180 days) and a privacy notice on the form (S4).
- **Exit:** the business owner and DPO sign off; tests cover export and deletion.

### WS-5 — Assurer content architecture (`m1-013`)
- Read-only inventory of the existing WordPress site: pages, URLs, media, menus, forms.
- Navigation, sitemap and redirect map from the old URLs.
- Content types: products, services, organizations, leadership (pieces, plus page types where
  needed).
- Reusable widgets and templates (JSX), following AGENTS.md conventions.
- **Exit:** an approved content model (ADR if it is structural) and an inventory report.

## Not in Milestone 1 unless approved

Production deployment, the managed database provider (D-DB-2), media buckets (D-DB-3), and any
Pro or Assembly module.
