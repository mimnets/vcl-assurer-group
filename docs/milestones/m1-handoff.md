# Milestone 0 → Milestone 1 handoff

| | |
|---|---|
| **Prepared** | 2026-10-19 (`m0-006`); updated in `m0-007`; rewritten 2026-10-20 (`m0-008`); updated 2026-10-20 (`m1-009`, `m1-010`); updated 2026-10-20 (`m1-011`); updated 2026-10-20 (`m1-012`); updated 2026-10-20 (`m1-013`); updated 2026-10-20 (`m1-014`); **status note 2026-10-29 (`m1-015`)** |
| **Milestone 0** | **CLOSED 2026-10-20.** The owner accepted human usability (D-M0-1), and Milestone 1 is approved (D-M1-0). See [closure report §7](./m0-closure-report.md#7-owner-sign-off-human-usability-acceptance-d-m0-1). |
| **Milestone 1** | In progress. `m1-009` (CI) merged as PR #11 (`d0f4a05`); hosted CI **verified green** in m1-010 (D-CI-1 closed). `m1-010` (PostgreSQL acceptance) done: recommendation B; the owner decided **D-DB-6 = Option B**: PostgreSQL for development and testing only, not staging or production. `m1-011` (security hardening) is merged (PR #13, `1978449`; hosted CI green). `m1-012` (form operations) is merged (PR #14, `ad5253b`; hosted CI green). `m1-013` (WS-5 inventory and content architecture) is merged (PR #15, `15ef1a3`; hosted CI green). `m1-014` (CA-1, content model foundation, ADR-0003) is done by the agent and awaits architectural review (D-GIT-13). **Update (m1-015):** m1-014 is merged (PR #16, `4dc8855`; D-GIT-13 closed). `m1-015` (CA-2) is in progress; see the [m1-015 handoff](./m1-015-handoff.md). [m1-010 report](../engineering/reports/2026/10/2026-10-20-m1-010-postgresql-compatibility-acceptance.report.md). |
| **Read first** | [AGENTS.md](../../AGENTS.md) (rules, incl. browser testing) · [INDEX](../engineering/INDEX.md) · [m1-014 report](../engineering/reports/2026/10/2026-10-20-m1-014-content-model-foundation.report.md) · [ADR-0003](../architecture/decisions/ADR-0003-corporate-content-model.md) · [m1-013 report](../engineering/reports/2026/10/2026-10-20-m1-013-corporate-content-architecture.report.md) · [content model](../content/apostrophe-content-model.md) · [implementation plan and risks](../content/implementation-plan-and-risks.md) · [m1-012 report](../engineering/reports/2026/10/2026-10-20-m1-012-form-operations-and-privacy.report.md) · [form operations runbook](../runbooks/form-operations-and-privacy.md) · [m1-011 report](../engineering/reports/2026/10/2026-10-20-m1-011-security-hardening.report.md) · [security configuration](../runbooks/security-configuration.md) · [m1-010 report](../engineering/reports/2026/10/2026-10-20-m1-010-postgresql-compatibility-acceptance.report.md) · [m1-009 report](../engineering/reports/2026/10/2026-10-20-m1-009-ci-and-security-scanning.report.md) · [m0-008 report](../engineering/reports/2026/10/2026-10-20-m0-008-milestone-closure-and-browser-policy.report.md) · [decision register](../engineering/decision-register.md) · [M1 plan](./m1-execution-plan.md) · [m1-009 spec](./m1-009-ci-and-security-scanning-spec.md) |

## Start-of-session checklist (new Claude Code session)

> **m1-015 note:** the checklist below and the "Exact first Milestone 1 task" section describe
> m1-009 and are kept as history. For the current task use the
> [m1-015 handoff](./m1-015-handoff.md) (§1 state, §4 phases, §5 gates).

1. Read the documents above. Don't rely on earlier conversations; the repository is the source of truth.
2. `git fetch origin`, then check the branch, uncommitted changes, and that `origin/main` contains
   the m0-008 merge and the owner's §7 sign-off.
3. Confirm the closure report says **CLOSED** and D-M1-0 is approved. If not, stop and ask.
4. Use the next free task ID (`m1-009` unless something else started first), and archive the
   prompt under `docs/engineering/prompts/YYYY/MM/`.
5. Create the branch `ci/m1-009-github-actions` from `origin/main`.

## Verified application state (2026-10-20, `m0-008`)

- ApostropheCMS **4.34.0** Community Edition, ESM, **JSX** templates, `@apostrophecms/vite`.
  Local SQLite database (`APOS_DB_URI` in `.env`). Server bound to `127.0.0.1:3000`.
  `APOS_SESSION_SECRET` is required (the app refuses to start without it). Node **24.21.0** locally
  (`engines: >=24`).
- Project modules: `modules/assurer-*` (hero, slideshow, product card and product grid widgets;
  `assurer-demo` seed task);
  core overrides under `modules/@apostrophecms/`. Demo content via `node app assurer-demo:seed`,
  always labelled "Demo".
- Commands: `npm run dev` · `npm start` · `npm run build` · `npm run lint` ·
  `npm run test:smoke` (HTTP, anonymous) · `npm run test:workflow` and `npm run test:persistence`
  (REST API as the test admin; credentials `APOS_TEST_USER`/`APOS_TEST_PASSWORD` from the
  git-ignored `.env`; the server must be running).
- Results on 2026-10-20: lint clean · smoke **14/14** · workflow **15/15** · persistence **7/7**
  (also after a restart) · production build passes. Browser: agent-executed editor checklist
  **23/23** (m0-007); public-site smoke check PASS (m0-008).
- CMS users: `admin` (owner, active), `m0-007-demo-editor` (archived in m0-008). Owner content
  "Acceptance Test" and "M0 Test Page" exist and must not be touched.
- Local-only, git-ignored: `.env`, `data/`, `public/uploads/`, `evidence/` (browser screenshots),
  and `../vcl-assurer-group-backups/` (holds secrets; D-M0-9).

## Architecture decisions

| ADR | Decision | Status |
|---|---|---|
| [ADR-0001](../architecture/decisions/ADR-0001-cms-platform-and-starter.md) | ApostropheCMS Community Edition on the Essentials starter; no Pro modules | Accepted |
| [ADR-0002](../architecture/decisions/ADR-0002-database-strategy.md) | SQLite locally and in tests; PostgreSQL for staging and production **only after** the §6 acceptance test; native APIs only; one database and media store per site | Accepted (PostgreSQL conditional) |

## Current dependencies (direct)

`apostrophe` 4.34.0 · `@apostrophecms/form` 1.5.6 · `@apostrophecms/vite` 1.2.0 · `cross-env`
10.1.0 · `dotenv` 17.4.2 · `normalize.css` 8.0.1. Dev: `eslint-config-apostrophe` 6.1.0,
`nodemon` 3.1.14, `autoprefixer` 10.6.1. No `@apostrophecms-pro/*`. Unchanged since M0. Any
addition (including GitHub Actions and gitleaks) needs approval.

## Outstanding technical risks

| Risk | Ref | Where it is handled |
|---|---|---|
| `main` is **not protected**; rulesets cannot be enforced on this private repository on the current plan; Dependabot is off; secret scanning is unavailable | D-GIT-3 | **Accepted** as a temporary risk. Review before any added maintainer or production deployment; CI in `m1-009` |
| No CI; checks are run by hand | D-CI-1 | `m1-009` ([spec](./m1-009-ci-and-security-scanning-spec.md)) |
| PostgreSQL: the app process exits when the database drops an idle connection (db-connect 1.1.0 has no pool `error` listener) | D-DB-5 | Upstream report; restart supervisor in any shared environment; re-test on each db-connect release |
| PostgreSQL provisional only: untested on Linux and managed versions; dumps carry sessions (no sanitize task yet) | D-DB-6 | Owner decision; before staging |
| ~~No security headers, `Secure` cookies or rate limiting~~ Mitigated in m1-011: headers with a baseline CSP, env-driven Secure cookies and trusted proxies, per-IP form limit. Open: resource CSP, per-IP login limit, CAPTCHA, real-TLS verification | S1–S3, D-M0-5, D-SEC-2 | `m1-011` done; rest before internet-facing launch |
| `npm audit`: **43** findings (38 moderate, **5 high**, 0 critical) on 2026-10-20, all upstream (`apostrophe` transitive dependencies; dev-only `nodemon` via `braces`) | S5, D-M0-5 | Baseline in `m1-009`; re-decided in `m1-011`. `audit fix --force` would downgrade core, so it is not used |
| ~~Form submissions kept indefinitely; no email or export~~ Built in m1-012: notifications (sink-verified only), admin review page and CSV export, and a retention task. Open: provider, sender domain, retention period, anti-spam choice | S4, D-M0-3/4, D-FORM-1…5 | Owner/DPO decisions; retention not enabled |
| Editors can change site-wide Global Styles, and can publish and archive | D-M0-11 | Review before staff rollout (M1 role design) |
| The local backup archives hold secrets and are not encrypted | D-M0-9 | Owner |
| SQLite: single writer, no replication | S7 | Local only, by design |

## m1-015 status (2026-10-29)

- m1-014 merged as PR #16 (`4dc8855`); D-GIT-13 closed.
- m1-015 (CA-2, the eight listing and section widgets) runs on
  `feat/m1-015-listing-and-section-widgets`, from the [m1-015 handoff](./m1-015-handoff.md).
  Progress and results are in its report (see [INDEX](../engineering/INDEX.md)).

## m1-014 status (2026-10-20)

- **ADR-0003 accepted** on the owner's approval of D-CONTENT-1, D-CONTENT-8 and, in part,
  D-CONTENT-2 (m1-014 prompt). No new dependency, no SEO package, no migration.
- **New modules:**
  - piece types `assurer-product`, `assurer-organization`, `assurer-person` (no contact
    fields), `assurer-location`;
  - page types `assurer-division-page`, `assurer-product-category-page`;
  - `modules/@apostrophecms/global` (contact, footer, header button).
- **Changed behaviour:**
  - the two-level page-tree menu with core "Hide in Navigation" (`views/layout.jsx`,
    `modules/asset/ui/src/nav.js`);
  - the footer now comes from Global Content, with the old line as the fallback.
- **New tasks:**
  - `node app assurer-demo:seed-corporate`: fictional records. It refuses to run in
    production, runs on a temporary SQLite database, and needs `--dev-database` for any
    other database. It adds missing records only.
  - `assurer-test:ensure-editor`: CI only.
- **New tests:** `scripts/content-model-test.mjs` (in `test:ci`) and
  `scripts/content-model.test.mjs` (unit).
- **The owner's development database was not changed.** On its next start it simply gains the
  new (empty) types. The corporate demo records are not in it unless the owner runs the seed
  with `--dev-database`.
- **Editor note:** relationship pickers only offer published pages. Publish a category page
  before assigning products to it.

## m1-013 status (2026-10-20)

- **Documentation only. No code, configuration or dependency changed.** New folder `docs/content/`
  (added to the STANDARDS.md layout).
- Read-only inventory of `https://www.assurerworld.com`: all 29 WordPress sitemap URLs fetched
  once (26 pages, 1 post, 2 archives), plus redirects, media and document references. No login,
  no form submission, no scanning, no media download. Findings for the owner about the live site
  (PHP notices exposing a server path, the published `admin` username, personal contact details)
  are in [inventory §9](../content/wordpress-site-inventory.md#9-security-and-privacy-observations-read-only-for-the-owner).
- Proposed: [information architecture](../content/corporate-information-architecture.md) (all content
  URLs kept; new `/about`, `/group`, `/products`, `/services`, `/privacy`),
  [content model](../content/apostrophe-content-model.md) (2 page types, 4 piece types, global settings,
  8 widgets; ADR-0003 candidate), [SEO and migration plan](../content/seo-and-migration-plan.md),
  [editorial and design requirements](../content/editorial-and-design-requirements.md), and
  [implementation plan and risks](../content/implementation-plan-and-risks.md) (tasks CA-1 to CA-7).
- Verified in the installed core: the trailing-slash redirect is **302** (locally `/x/` → `/x`);
  `@apostrophecms/soft-redirect` defaults to 302; core ships an inactive provider-agnostic AI engine
  (`@apostrophecms/ai`) that a later AI-drafting phase could build on.
- Open owner decisions: D-CONTENT-1 to D-CONTENT-12 (sitemap, group pages, legacy pages, leadership
  privacy, sustainability evidence, news, languages, content model / ADR-0003, video, SEO
  dependencies, publishing workflow, brand and content supply).

## m1-012 status (2026-10-20)

- **No new dependency.** Email uses core's `@apostrophecms/email` (nodemailer, shipped with
  apostrophe), configured from `APOS_SMTP_*` env only.
- **New module:** `modules/assurer-forms/`:
  - notification status on each submission;
  - replay key against duplicates;
  - `/assurer/form-submissions` and its CSV export (admins only);
  - `assurer-forms:retry-notifications`, and `assurer-forms:retention` (dry run by default).
- **Overrides:**
  - `modules/@apostrophecms/form-widget/ui/src/index.js` (D-SEC-3 browser fix; upstream hash
    pinned in a unit test);
  - `modules/@apostrophecms/email/index.js`;
  - visitor confirmation email removed in `modules/@apostrophecms/form/index.js`.
- **New tests and tools:** `scripts/form-ops.test.mjs` (unit), `scripts/form-ops-test.mjs`
  (`npm run test:forms`, and part of `test:ci` with a local SMTP sink), `scripts/smtp-sink.mjs`,
  and the test-only `assurer-test:backdate-submissions`.
- **Not done (owner decisions):**
  - real mail delivery (D-M0-3, D-FORM-4);
  - the retention period (D-FORM-2; nothing deleted);
  - mailbox content (D-FORM-1);
  - anti-spam (D-FORM-3);
  - staff roles and erasure (D-FORM-5);
  - filing the upstream issues (D-SEC-3, D-DB-5;
    [drafts](./m1-012-upstream-issue-drafts.md)).
- The local dev database now holds 20 demo/test submissions (one more from `test:smoke`). The
  browser run used a disposable instance (temporary SQLite), which was deleted afterwards.

## m1-011 status (2026-10-20)

- **New dependency (approved, D-SEC-1):** `@apostrophecms/security-headers` 1.0.2. **New module:**
  `modules/assurer-security/` (env-driven settings, form rate limit, `assurer-security:clear-form-rate-limit`).
  **New tests:** `npm run test:security` and `scripts/security-config.test.mjs`. `npm run test:ci` now also runs
  the security suite and an HTTPS-proxy mode.
- **Note for local testing:** `npm run test:security` uses up this machine's form quota for 15 minutes.
  Run it after `test:smoke`, or clear the counters with the task.
- Upstream reports are ready but not filed: D-DB-5, and the form widget showing "Thank you" on errors (D-SEC-3).
- The disposable editor `m1-011-browser-editor` and its test page and image are archived. One demo form
  submission from the browser test remains in the local database.

## m1-010 status (2026-10-20)

- Hosted CI for m1-009: all five jobs green on the PR run and on the push-to-`main` run
  (links in the [m1-010 report](../engineering/reports/2026/10/2026-10-20-m1-010-postgresql-compatibility-acceptance.report.md)). D-CI-1 and D-GIT-9 are closed.
- The PostgreSQL 16.15 acceptance test was run in a disposable local environment, which was
  deleted afterwards:
  - fresh initialisation, the existing suites (admin and editor), 15 feature areas;
  - migration of a *copy* of the M0 data (identical);
  - `pg_dump`/`pg_restore` and JSONL round trips (identical);
  - a 15-minute soak (0 errors, no connection growth);
  - crash recovery and agent browser checks.
  - **One FAIL:** the app exits when PostgreSQL drops a connection (D-DB-5).
- ADR-0002 has a new §9. It is **not** changed to a production commitment.
- The owner's SQLite database and media were verified unchanged.
- Branch `test/m1-010-postgresql-acceptance` (docs only); the owner opens the PR.

## m1-009 status (2026-10-20)

- Added: `.github/workflows/ci.yml` (`lint`, `build`, `test`, `secrets`, `audit`),
  `npm run test:ci` (isolated run on a throwaway database), `npm run test:unit`,
  `npm run audit:check` with `security/audit-baseline.json`, `.gitleaks.toml`, and the
  test-only `assurer-test:ensure-admin` task. Details are in [git-and-ci.md](../engineering/git-and-ci.md#ci-github-actions).
- Local results: lint clean, unit 24/24, `test:ci` 14/14 · 15/15 · 7/7, build passes, audit
  gate passes, gitleaks history 0 findings. Local negative tests pass.
- **Pending:** the hosted runs on the PR, inspection of the Checks tab, and optionally the
  GitHub-side negative tests (owner approval needed).

## Git state (2026-10-20)

**Updated in m1-009:** `origin/main` = `1ed5f54` (merge of PR #10, m0-008). m1-009 is on
`ci/m1-009-github-actions`, pushed for the owner to open a PR. The notes below are from m0-008.


- `origin/main` = `80bc50c` (merge of PR #9, m0-007).
- m0-008 is on `docs/m0-008-milestone-closure-and-browser-policy`; the owner opens and merges the PR.
- Stale remote branches from M0 (`docs/m0-004…`, `docs/m0-005…`, `docs/m0-006…`,
  `test/m0-007…`) are merged. The owner may delete them; the agent does not.

## Required next action (owner), updated in m1-014

1. Review the m1-014 report and ADR-0003. Open the PR from `feat/m1-014-content-model-foundation`,
   check the five CI checks, and merge (D-GIT-13).
2. Optional: a human pass of the editor journeys (pieces, division and category pages, Global
   Content, menu) on a disposable copy.
3. Decide D-CONTENT-10 (SEO packages) before CA-3; continue D-CONTENT-12 (brand and confirmed
   content) and D-CONTENT-4 (leadership privacy) with the DPO; confirm the group entities
   (D-CONTENT-2).
4. Start `m1-015` (CA-2, listing and section widgets) in a **new Claude Code session**.

### Earlier list (m1-013; item 1 done as PR #15, item 2 decided in the m1-014 prompt, item 5 done as m1-014)

1. Review the m1-013 report and the `docs/content/` documents (architectural review). Open the PR
   from `docs/m1-013-corporate-content-architecture`, check the five CI checks, and merge (D-GIT-12).
2. Decide D-CONTENT-1 (sitemap and navigation), D-CONTENT-2 (group pages and entity facts) and
   D-CONTENT-8 (content model, ADR-0003). These unblock CA-1. Decide D-CONTENT-10 (SEO dependencies)
   before CA-3.
3. Start supplying brand assets and confirmed business content (D-CONTENT-12), and decide leadership
   privacy (D-CONTENT-4) with the DPO.
4. Pass the live-site observations (inventory §9) to whoever runs the WordPress host. The project does
   not touch the WordPress site.
5. Start `m1-014` (CA-1, content model foundation) in a **new Claude Code session**.

### Earlier list (m1-012; item 1 done as PR #14, item 4 done as m1-013)

1. Review the m1-012 report. Open the PR from `feat/m1-012-form-operations`, check the five CI
   checks (the `test` job now runs the form-operations suite), and merge (D-GIT-11).
2. Decide D-FORM-1 to D-FORM-5 and D-M0-3/D-M0-4 with the DPO/IT: provider, mailbox, sender
   domain, mailbox content, retention period, anti-spam and staff access.
3. File the upstream issues (D-SEC-3, D-DB-5) from the
   [drafts](./m1-012-upstream-issue-drafts.md).
4. Start the next task in a **new Claude Code session**:
   - `m1-013` (WS-5 content architecture); or
   - a small D-FORM-3 honeypot task, once approved; or
   - the D-DB-5 validation.

### Earlier list (m1-011; item 1 done, item 2 prepared but not filed, item 4 done as m1-012)

1. Review the m1-011 report (architectural review). Open the PR from `feat/m1-011-security-hardening`, check the five CI checks, and merge (D-GIT-10).
2. Approve and file the upstream issues (D-DB-5, D-SEC-3), or ask the agent to file them through an approved integration.
3. Decide the backup plan steps (D-M0-9) and the CSP rollout (D-SEC-2).
4. Start the next task (`m1-012`: WS-4 form operations, or the D-DB-5 validation) in a **new Claude Code session**.

### Earlier list (m1-010; items 1 and 3 done, item 2 prepared but not filed, item 4 is m1-011)

1. Review the m1-010 report and decide **D-DB-6** (A, B or C; the agent recommends B).
2. Approve or file the upstream report for **D-DB-5**.
3. Open and merge the m1-010 PR from `test/m1-010-postgresql-acceptance`.
4. Start the next task (`m1-011`, security hardening) in a **new Claude Code session**.

### Earlier list (m1-009, done except the optional items)

1. Open the m1-009 PR from `ci/m1-009-github-actions`, check that all five checks pass, and
   inspect their logs. Then merge (D-GIT-9). This closes D-CI-1.
2. Optional: approve the GitHub-side negative tests (throwaway PRs, closed unmerged).
3. Optional and free: turn on Dependency graph and Dependabot alerts (D-GIT-3).
4. Start the next task (`m1-010`, PostgreSQL acceptance) in a **new Claude Code session**.

### Earlier list (m0-008, done)

1. Review and merge the m0-008 PR.
2. Complete the [human usability checklist](./m0-human-usability-checklist.md) and sign
   [closure report §7](./m0-closure-report.md#7-owner-sign-off-human-usability-acceptance-d-m0-1). On Accept, set M0 to **CLOSED** and close D-M0-1.
3. Approve the start of Milestone 1 (D-M1-0).
4. Optional, free: turn on Dependency graph and Dependabot alerts (steps in D-GIT-3).

## Exact first Milestone 1 task

> Historical (m1-009). The current task is m1-015: [m1-015 handoff](./m1-015-handoff.md).

**`m1-009` — GitHub Actions CI, reproducible tests and security scanning.** The full
specification is in [m1-009-ci-and-security-scanning-spec.md](./m1-009-ci-and-security-scanning-spec.md).
Start it in a **new Claude Code session**, on `ci/m1-009-github-actions`, and stop at each
approval gate the spec lists. Finish with the browser acceptance step that AGENTS.md requires.
