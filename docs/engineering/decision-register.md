# Decision register

Decisions that need a named human. Created 2026-10-19 (`m0-002`); updated 2026-10-19
(`m0-004`). When a decision is made, record the decider, date and outcome here. Don't delete
rows; mark them closed.

| ID | Decision | Options | Recommendation | Blocks | Owner | Status |
|---|---|---|---|---|---|---|
| D-M0-1 | **Human editor walkthrough** of the admin UI (page creation, media upload, drag-reorder, Styles sliders, publish) | do before M1 · waive | Do it: about 20 minutes, following the README. These UI paths were verified only via API or headless browser. | M0 closure | Architect / content lead | Open |
| D-M0-2 | **PostgreSQL acceptance test** (ADR-0002 §6) | run now · run at start of M1 · choose MongoDB instead | Run at the start of M1 in an isolated environment, before any staging work | PostgreSQL use in staging | Architect + ops | Open |
| D-M0-3 | **Form email notifications** | corporate SMTP relay · transactional email service · none (store only) | SMTP relay via `@apostrophecms/email` (MIT). Needs credentials in the secret store and SPF/DKIM for the sender domain. | Contact form go-live | Business owner + IT | Open |
| D-M0-4 | **Form submission access and retention** | email only · CSV export task · custom admin view; retention 90 / 180 / 365 days | Email delivery plus a reviewed export task; **180-day** retention with scheduled deletion; privacy notice on the form | Contact form go-live; privacy compliance | Business owner + DPO/legal | Open |
| D-M0-5 | **Outstanding security findings** (M0 security review S1–S9: headers, Secure cookies, rate limiting, CAPTCHA, retention, unpatched transitive advisories) | fix in M1 · accept with dates | Schedule S1–S4 into M1 platform work; accept S5–S6 with a quarterly re-check | Any shared or internet-facing environment | Architect / security | Open |
| D-M0-6 | **Local test credentials** | keep · rotate · delete | — | — | Developer | **Closed 2026-10-19 (m0-004):** password rotated via `user:change-password`; plaintext password file deleted; all bearer tokens revoked and prior sessions invalidated by core; test credentials now only in the git-ignored `.env` |
| D-M0-7 | **Project licensing and third-party notices** | `UNLICENSED` proprietary (current) · other | Confirm proprietary. Keep `licenses/` for the starter kit's MIT notice. Get legal sign-off on LGPL libvips (`sharp`) and the three license-less transitive packages. | First external distribution | Business owner + legal | Open |
| D-M0-8 | Accept ADR-0001 (CMS platform) | accept · revise | — | — | Project owner | **Closed 2026-10-19:** approved by the project owner (m0-004 prompt) |
| D-DB-1 | Accept ADR-0002 (database strategy) | accept · revise | — | — | Project owner | **Closed 2026-10-19:** approved by the project owner (m0-004 prompt). PostgreSQL use remains conditional on D-M0-2. |
| D-DB-2 | Managed PostgreSQL provider and region | — | Choose one with PITR, TLS, and data residency acceptable to Assurer | Staging | Architect + ops | Open |
| D-DB-3 | Media storage for staging/production | S3-compatible bucket per site · local disk | One bucket per site, with versioning | Staging | Architect + ops | Open |
| D-DB-4 | Backup RPO/RTO targets | — | RPO ≤ 24 h (≤ 15 min with PITR), RTO ≤ 4 h, quarterly restore drill | Production | Business owner | Open |
| D-GIT-1 | First import and push to `github.com/mimnets/vcl-assurer-group` | approve · defer | — | — | Repository owner | **Approved 2026-10-19** by the project owner (m0-004 prompt); executed in m0-004 (see that report for the result) |
| D-GIT-2 | Starter-kit `deployment/` and `scripts/sync-*` (Stagecoach, MongoDB, placeholder third-party host, `mongorestore --drop` / `rsync --delete`) | remove · keep | — | — | Project owner | **Closed 2026-10-19:** removal approved and done in m0-004; useful principles kept in `docs/runbooks/deployment-principles.md` |
| D-GIT-3 | **Branch protection / rulesets on `main`** (no force push, no deletion, PR review, required checks once CI exists, secret scanning) | GitHub web UI · `gh` CLI with an admin-scoped login · plan upgrade if the plan doesn't allow it on a private repository | Repository owner applies them in the GitHub UI (steps in the m0-004 report) | Collaborative work | Repository owner | Open |
| D-CI-1 | CI workflow (lint, build, smoke, workflow tests, audit, license check) per `git-and-ci.md` | implement in M1 · defer | Implement early in M1 on a feature branch via PR; needs a non-interactive test-admin bootstrap | Required status checks (D-GIT-3) | Architect | Open |
