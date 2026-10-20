# m1-011 — Security hardening and PostgreSQL incident follow-up

| | |
|---|---|
| **Task** | m1-011 |
| **Date** | 2026-10-20 |
| **Scope** | Assess and harden HTTP security, cookies, proxy trust and form abuse controls. Re-decide the audit baseline. Plan backup protection. Investigate D-DB-5. Record the owner's D-DB-6 decision. |
| **Prompt** | [2026-10-20-m1-011-security-hardening.prompt.md](../../prompts/2026/10/2026-10-20-m1-011-security-hardening.prompt.md) |
| **Branch / commit** | `feat/m1-011-security-hardening` from `origin/main` `dd2ec15`. The commit is the one that adds this report. |
| **Related** | ADR-0002 (status line) · [m1-010 report](./2026-10-20-m1-010-postgresql-compatibility-acceptance.report.md) · [m0 security review](../../../milestones/m0-security-review.md) · [security configuration runbook](../../../runbooks/security-configuration.md) · [backup protection plan](../../../runbooks/backup-protection-plan.md) · [D-DB-5 proposal](../../../milestones/m1-d-db-5-postgresql-connection-loss-proposal.md) · D-M0-2, D-M0-4, D-M0-5, D-M0-9, D-M0-11, D-DB-5, D-DB-6, D-SEC-1/2/3, D-GIT-10 |

## Requirements

Summary of the prompt:

- Start fresh from verified `main`.
- Assess ten security areas: what exists first, then classify the rest.
- Implement only scoped, tested and reversible hardening:
  - no HSTS on plain HTTP;
  - no CSP that breaks editing;
  - no trust in arbitrary forwarded headers;
  - no change to authentication or CSRF.
- Backups: plan only, with no action on the archives.
- Dependency audit: evidence-based re-decision, no `audit fix --force`.
- D-DB-5: investigate, prepare an upstream issue, propose mitigation. Keep it OPEN; no patching of
  `node_modules` and no global exception handlers.
- Testing: automated, negative and Chrome browser tests.
- Records: write them, record D-DB-6 = Option B, push a feature branch, no merge or deploy.

## Work completed

### Phase 1 — initialisation

- `git fetch`: `origin/main` = **`dd2ec15`**, "Merge pull request #12 from
  mimnets/test/m1-010-postgresql-acceptance". Its second parent is `750bdd7`, the m1-010 head.
  The working tree was clean, with nothing to preserve.
- Task ID `m1-011` was still free (INDEX "Next free task ID").
- The branch `feat/m1-011-security-hardening` was created from `origin/main`.
- Read: AGENTS.md (via CLAUDE.md), STANDARDS, the decision register, INDEX, the M1 handoff and
  plan, ADR-0001, ADR-0002, the m1-009 spec and git-and-ci, the m1-010 report, and the M0 security
  review.

### Phase 2 — assessment

**Existing protections, verified and kept unchanged:**

| Area | Protection | How verified |
|---|---|---|
| CSRF (4) | Core CSRF cookie check on state-changing requests; `SameSite=Lax` cookies | Form POST without the cookie → 403 (smoke and security suites) |
| Sessions (5) | `HttpOnly`, `SameSite=Lax`; `APOS_SESSION_SECRET` required (≥32 characters); sessions stored in the database | Cookie attributes checked in the security suite |
| Login (5) | Core per-**username** throttle: 3 attempts per minute, 1-minute lockout (`@apostrophecms/login` `throttle`) | Source read (`login/index.js`) |
| Network | Bound to `127.0.0.1` | M0 measure, unchanged |
| Form input (3) | 20 KB per field, 30 fields, 0 files; server-side email check; required fields | Smoke suite |
| Anonymous API (10) | User list 404; global 404; draft mode 403; anonymous PATCH 403 | `curl` and the security suite |
| Errors (10) | API errors return `{name, data, message}`; 500 → "An error occurred."; stacks only in server logs (`routeSendError`) | Source read; malformed-JSON probe (no stack) |
| Internal files (10) | Only `public/` is served; `.env`, `.git`, `package*.json`, `data/`, `modules/`, `node_modules/` → 404 | Security suite (11 paths) |
| Form submissions (7) | No REST or UI route (`/api/v1/@apostrophecms/form-submission` → 404) | `curl` |

**Findings** (for severity, assume an internet-facing deployment; the current exposure is
loopback-only):

| # | Type | Finding | Severity | Status after m1-011 |
|---|---|---|---|---|
| F1 | **Observed defect** | PostgreSQL connection loss exits the app (D-DB-5) | Medium (availability; dev/test only under D-DB-6 B) | Open: upstream issue prepared, mitigation proposed |
| F2 | **Observed defect** (found by the browser test) | The `@apostrophecms/form` widget shows "Thank you" for any failed submit without `data.formErrors`. Seen with 429: the visitor was told the message was stored, but it was not. Upstream code `form-widget/ui/src/index.js` does the same for 403 and 500 | Medium (integrity / user trust) | Fixed for this project's 429; 403/500 remain upstream (D-SEC-3) |
| G1 | Configuration gap | No `X-Content-Type-Options`, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy` or CSP (S1); clickjacking possible | Medium | **Fixed** (baseline) |
| G2 | Configuration gap | Cookies never `Secure`; core `trustProxy` can only trust **every** hop, which lets clients forge `req.ip` (S2) | Medium | **Fixed in code** (env-driven); not yet verified behind real TLS |
| G3 | Configuration gap | No rate limit on contact-form submissions (S3) | Medium | **Fixed** (per IP) |
| G4 | Configuration gap | `X-Powered-By: Express` | Low | **Fixed** |
| G5 | Configuration gap | No resource CSP (`script-src` etc.) | Medium | Open (D-SEC-2); a strict policy breaks editing today |
| G6 | Configuration gap | No per-IP login limit (credential stuffing across many usernames bypasses the per-username throttle) | Medium | Open: proxy-level limit before launch (D-M0-5) |
| G7 | Configuration gap | No CAPTCHA (distributed form spam) | Medium | Open (D-M0-5). Community options exist (`@apostrophecms/form` reCAPTCHA; `login-hcaptcha`, `login-recaptcha`, MIT) |
| G8 | Configuration gap | Form submissions kept indefinitely (S4) | Medium (privacy) | Open (D-M0-4, m1-012) |
| G9 | Configuration gap | Unencrypted local backups with secrets (D-M0-9) | Low today / Medium as a pattern | Plan written; no action |
| G10 | Design decision | Editors can change site-wide Global Styles (D-M0-11) | Low | Unchanged; review before staff rollout |
| G11 | Configuration gap | Password policy, 2FA, account lockout (S9) | Medium | Not started. `@apostrophecms/login-totp` 1.3.3 (MIT) is a candidate; it would need dependency approval |
| P1 | Potential risk | Three baselined advisories | High (dev/build-time) / Moderate | Re-accepted with evidence (Phase 5) |
| P2 | Potential risk | Core enables CORS `*` on `/api/v1` | Low: wildcard origins cannot send cookies with credentials; bearer tokens need an explicit header | Noted, unchanged (core) |
| P3 | Informational | Body-parser messages are echoed on malformed JSON (no stack or path) | Info | Unchanged |

### Phase 3 — hardening implemented

1. **Security headers** with the official `@apostrophecms/security-headers` 1.0.2. Adding it was
   approved by the owner during the session (D-SEC-1). Checks: MIT, no runtime dependencies, no
   GitHub advisories; the lockfile adds only that package. Extraneous entries that npm wanted to
   prune were left alone.
   - Values: `nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: same-origin`.
   - CSP: `frame-ancestors 'self'; base-uri 'self'; object-src 'none'` only. The module's default
     resource CSP (nonce-based `script-src`) was **not** used, because core templates and the Vite
     dev server emit scripts without nonces.
   - The module does not cover files served by core's static server, so the same headers are set
     through core's `static` option (`express.static` `setHeaders`) for `/uploads` and built assets.
   - `X-Powered-By` removed.
2. **HTTPS and proxy settings**, all off by default, with startup refusal of unsafe combinations
   (`modules/assurer-security/lib/config.js`):
   - `APOS_HTTPS=1` → `Secure` session and CSRF cookies. Requires `APOS_TRUST_PROXY`.
   - `APOS_TRUST_PROXY` replaces core's all-or-nothing `trustProxy` method with Express's
     restricted forms: hop count 1–10, `loopback`/`linklocal`/`uniquelocal`, IPs or CIDRs.
     `true` and `*` are refused.
   - `APOS_HSTS_MAX_AGE` sends HSTS only together with `APOS_HTTPS=1`.
3. **Contact-form rate limit** (`modules/assurer-security`):
   - Limit: 10 attempts per client IP per 15 minutes (configurable). Over the limit: 429 with
     `Retry-After`, and nothing is parsed or stored.
   - Counters live in core `apos.cache`, so they are shared across processes and expire on their
     own. IPv6 clients are grouped by /64. The limiter fails open, and errors are logged.
   - The 429 body carries a global `formErrors` entry, so the form UI shows an error instead of
     "Thank you" (F2).
   - Operator task: `node app assurer-security:clear-form-rate-limit`.
   - Threat model and limits: [runbook](../../../runbooks/security-configuration.md#contact-form-rate-limit).
4. **Tests**:
   - `scripts/security-config.test.mjs`: 10 unit tests.
   - `scripts/security-test.mjs` (`npm run test:security`): headers on pages, 404, the 429
     response and static files; cookie flags; internal files; anonymous API; error bodies; the
     rate limit and bypass attempts. A `--proxy` mode covers HSTS, `Secure` cookies on a real
     login, and the trusted-proxy client key.
   - Both are wired into `npm run test:ci`, so the GitHub `test` job runs them.

Not changed: authentication, CSRF, session store, login throttle, form validation, content, and
user accounts (apart from the disposable test editor).

### Phase 4 — backups

Only metadata was read; the archives were not opened.

- Two folders hold `.env`, password hashes and sessions per the earlier records.
- The ACL grants `SYSTEM` and the owner's account only.
- The folder is not under OneDrive.
- BitLocker status was **not verified**, because it needs elevation.

The plan is [backup-protection-plan.md](../../../runbooks/backup-protection-plan.md). It covers
requirements for development and production, `age` (or 7-Zip AES-256) encryption of *copies*,
key custody (password manager plus an offline copy; two custodians in production), checksum
and restore verification into a new database, and plaintext removal only with separate approval.
Nothing was encrypted, moved, uploaded or deleted.

### Phase 5 — dependency audit

| | All | Production only (`--omit=dev`) |
|---|---|---|
| Findings | 43 (38 moderate, **5 high**, 0 critical) | 42 (38 moderate, **4 high**) |
| Advisories | GHSA-vfj7-8cjw-p6xm (high), GHSA-cp6q-959q-f8rh (moderate), GHSA-hp3w-g68c-fv3c (moderate) | same three |

Identical to the m1-009 baseline. `npm run audit:check` passes. Evidence for each advisory:

- **braces (high).** No patched release exists: the GitHub advisory API reports
  `first_patched_version: null`, and the latest braces is 3.0.3. The path is
  apostrophe/nunjucks/nodemon → chokidar 3.6.0 → braces. chokidar 4+ drops braces, but core
  requires `^3.6.0` and uses glob watching, so an override would be a semver-major change to core
  internals: **rejected**. The use is development-time file watching of application-controlled
  paths. The production-only count includes it because `apostrophe` declares chokidar as a normal
  dependency, not because production traffic reaches it.
- **Tiptap (moderate).** Fixed only in 3.30.4+. Core 4.34.0 ships 2.27.3, and the editor is
  used by logged-in users only.
- **sprintf-js (moderate).** No patched release (`null`). Reached through underscore.string with
  code-supplied format strings.
- `apostrophe` 4.34.0, `@apostrophecms/form` 1.5.6, `@apostrophecms/db-connect` 1.1.0 and
  `@apostrophecms/vite` 1.2.0 are the latest releases. No apostrophe advisory affects 4.34.0;
  the newest affect ≤4.32.0.

**Decision recorded (D-M0-5, S5):** all three are re-accepted, with `reviewBy` 2027-01-18
unchanged (the baseline allows at most 90 days). Their `remediation` fields are updated with
this evidence, and a `reviewed` block is added to `security/audit-baseline.json`.

### Phase 6 — D-DB-5

Details are in the [D-DB-5 proposal](../../../milestones/m1-d-db-5-postgresql-connection-loss-proposal.md).

1. **Adapter.** db-connect 1.1.0 calls `new Pool()` three times in `connect()` with no
   `'error'` listener, and the cursor's checked-out client has no listener either. Upstream
   `main` (`apostrophecms/apostrophe/packages/db-connect`) is still 1.1.0; `connect()` is
   byte-identical.
2. **Upstream search.** No matching issue exists; #5024 is unrelated.
3. **pg contract.** In the installed `pg-pool`, an idle client error goes through
   `pool.emit('error')`, and the README requires a listener.
4. **Upstream issue.** The ready-to-paste text and minimal reproduction are in the proposal.
   **Not filed:** there is no authorized integration (`gh` absent, no token) and no
   owner-approved public text.
5. **Mitigation.** Required for any shared PostgreSQL environment: a supervisor with restart, plus
   health checks. A project-level listener on the private `_pool` is not recommended. Global
   handlers and patches are rejected. A validation test is proposed as a separate task.
6. **No fix is claimed.** No PostgreSQL disconnect test ran in m1-011, so D-DB-5 stays **OPEN**.

### D-DB-6 recorded

The owner's decision is recorded verbatim as **Option B**: PostgreSQL is provisionally accepted for
development and further testing, but **not** for staging or production. It is recorded in the
decision register (closed), on ADR-0002's status line and in the INDEX. SQLite stays the local
default and MongoDB the fallback. No production database is selected.

## Files changed

- A `modules/assurer-security/index.js`
- A `modules/assurer-security/lib/config.js`
- A `modules/@apostrophecms/security-headers/index.js`
- M `modules/@apostrophecms/express/index.js` (cookie `secure`, `trustProxy` method)
- M `modules/@apostrophecms/asset/index.js` (`static.setHeaders`)
- M `app.js` (two modules registered)
- M `package.json` (dependency, `test:security`) · M `package-lock.json` (+1 package)
- A `scripts/security-test.mjs` · A `scripts/security-config.test.mjs` · M `scripts/run-ci-tests.mjs`
- M `.env.example`
- M `security/audit-baseline.json` (remediation, `reviewed`; dates unchanged)
- A `docs/runbooks/security-configuration.md` · A `docs/runbooks/backup-protection-plan.md` · M `docs/runbooks/database-backup-and-restore.md` (pointer)
- A `docs/milestones/m1-d-db-5-postgresql-connection-loss-proposal.md`
- A `docs/engineering/prompts/2026/10/2026-10-20-m1-011-security-hardening.prompt.md`
- A `docs/engineering/reports/2026/10/2026-10-20-m1-011-security-hardening.report.md` (this report)
- M `docs/engineering/decision-register.md` · M `docs/engineering/INDEX.md` · M `docs/engineering/git-and-ci.md`
- M `docs/milestones/m1-handoff.md` · M `docs/milestones/m1-execution-plan.md`
- M `docs/architecture/decisions/ADR-0002-database-strategy.md` (status line only)

## Tests executed and actual results

Windows 11, Node 24.21.0, local only.

| # | Check | Command / method | Result | Status |
|---|---|---|---|---|
| T1 | Lint | `npm run lint` | 0 problems (two style warnings found mid-task and fixed) | PASS |
| T2 | Unit | `npm run test:unit` | 34/34 (24 existing + 10 new) | PASS |
| T3 | Isolated CI suite | `npm run test:ci` (throwaway SQLite, port 3100) | ensure-admin, seed, smoke 14/14, workflow 15/15, restart, persistence 7/7, **security 65/65** (the uploaded-file check is skipped because test uploads are not served), restart with `APOS_HTTPS=1`/`APOS_TRUST_PROXY=loopback`/HSTS, **proxy mode 15/15** | PASS |
| T4 | Dev-server suites (AGENTS.md) | `test:smoke`, `test:workflow`, `test:persistence`, `test:security` against `:3000` with the final code | 14/14, 15/15, 7/7, 71/71 | PASS |
| T5 | Production build | `npm run build` (NODE_ENV=production, empty dotenv, throwaway DB) | exit 0 | PASS |
| T6 | Audit gate | `npm run audit:check` | passed (3 baselined, none new) | PASS |
| T7 | Secret scan | gitleaks **8.30.1** (the approved version), Windows build; SHA-256 `d29144de…afc4e` matches the release checksums file, whose Linux entry matches the hash pinned in `ci.yml`. Run `git` over the full history and `dir` over all changed and new files | "no leaks found" (both) | PASS |
| N1 | Unsafe config refused at startup | `APOS_HTTPS=1` alone; `APOS_TRUST_PROXY=true` and `*`; `APOS_HSTS_MAX_AGE` without HTTPS; `APOS_FORM_RATE_LIMIT_MAX=0` | Each exits with a `Security configuration:` error before any database is created | PASS |
| N2 | CSRF unchanged | POST without the CSRF cookie | 403 (before the limiter) | PASS |
| N3 | Rate limit and bypasses | 11th attempt; forged `X-Forwarded-For` (untrusted); `/submit/`; upper-case path | 429 with `Retry-After`; all bypasses → 429 | PASS |
| N4 | Trusted-proxy keying | proxy mode: client A limited, B separate, A with a prepended forged XFF still limited | as expected | PASS |
| N5 | Exposure | 11 internal paths → 404; anonymous user/global/draft API refused; malformed JSON → 400 without a stack | as expected | PASS |
| N6 | No HSTS / not `Secure` on plain HTTP | security suite (plain mode) | absent / absent | PASS |
| — | First run of the dev `test:smoke` after a `test:security` run | — | 11/14: three form checks got 429, because the earlier security run had used up the quota for `127.0.0.1`. This is the limiter working, not a regression. The clear task was added; after clearing, 14/14 | Noted |

Baseline evidence before the change (same dev server): the response had `X-Powered-By: Express`
and none of the security headers.

### Browser acceptance

Claude in Chrome, the owner's Chrome, a dedicated MCP tab group (closed afterwards), dev server
`http://127.0.0.1:3000` (SQLite, with the m1-011 code). Account: `m1-011-browser-editor`
(**editor**, created with `@apostrophecms/user:add`; password generated into a scratch file
outside the repository). **Agent-executed; not human acceptance.** The checklist was written
before running, from what this task changed: headers must not break the public site, editing,
uploads or Styles; form validation and abuse UX; clickjacking; draft isolation; authorization
boundary; layouts.

| # | Check | Role / viewport | Steps | Expected | Actual | Status | Evidence |
|---|---|---|---|---|---|---|---|
| B1 | Public home page and media | logged out / 1440 | Open `/` | Renders; images load; no CSP errors; no overflow | Rendered; 6 images, 0 broken; overflow −15 px (none); no console CSP or error messages | PASS | screenshots viewed (not saved) |
| B2 | Form submission | logged out / 1440 | Type name, email and message, tick consent, click Send | Thank-you shown; stored | "Thank you (demo)"; 1 row stored (read-only DB check) | PASS | — |
| B3 | Form validation | logged out / 1440 | Click Send on the empty form | Field errors | Browser "Please fill out this field"; server-side checks covered by smoke | PASS | — |
| B4 | Form abuse control | logged out / 1440 | Quota for `127.0.0.1` used up by script; then fill in and send the form through the UI | Visible error; nothing stored | **First run: FAIL.** The UI showed "Thank you" although the server returned 429 and stored nothing (F2). Fixed in-task (global `formErrors` in the 429 body). **Re-run:** "An error occurred submitting the form. Please try again. Too many submissions. Please try again later."; the form keeps its input; DB still 1 row | PASS (after fix) | — |
| B5 | Login | editor / 1440 | `/login`, type username and password, click Login | Admin bar; no Users menu | Logged in; Pages, Images, Image Tags, Files, File Tags, Forms; no Users | PASS | — |
| B6 | Create page, save draft, publish | editor / 1440 | Pages → New Page → title → Add Content → Rich Text → type → Save Draft and Preview; Edit → Publish | Draft not public; published is | "Draft saved"; logged-out `curl` → 404; "Your changes have been published"; public HTML contains the text | PASS | — |
| B7 | Image upload | editor / 1440 | Images → upload `public/images/logo.png` → set title → Save | Upload works and the preview shows (nosniff) | "Successfully uploaded a file"; preview rendered; saved | PASS | — |
| B8 | Global Styles controls | editor / 1440 | Styles → Typography → Base → drag Line Height → Cancel | Live preview works; nothing saved | Slider 2.3; body line-height 41.4 px live; after Cancel, the published stylesheet still has `line-height: 1.5` | PASS | — |
| B9 | Authorization boundary | editor | Admin bar; `GET /api/v1/@apostrophecms/user` from the session | No user management | No Users menu; API 200 with 0 results (core behaviour, same as m1-010) | PASS | — |
| B10 | Unpublished edit isolation | editor → logged out | Type a marker in the published page (autosave), do not publish; fetch logged out | Marker hidden | Public HTML: text present, marker absent, no admin bundle | PASS | — |
| B11 | Tablet and mobile layout | logged out / 768, 375 | Window resize did not apply (`innerWidth` stayed 1440), so same-origin iframes of exactly 768 and 375 px were used, as in m1-010 | No overflow | Home and test page: overflow 0, 0 broken images, at both widths | PASS (iframe method) | — |
| B12 | Clickjacking | — / 1440 | From a `127.0.0.1` page, embed `127.0.0.1/login` and `localhost/login` (different origin) | Same-origin allowed; cross-origin blocked | Same-origin rendered; cross-origin showed Chrome's blocked-frame page | PASS | — |
| B13 | Logout | editor → logged out | User menu → Log Out → reload the page | No admin bar; no drafts | No admin bar; marker hidden; `whoami` 404 | PASS | — |
| B14 | Cleanup | admin (REST) | Archive the page (move to archive), the image and the user via the REST API; revoke the token | Archived, not deleted | Page → 404 publicly; image archived; user archived (core renamed it `deduplicate-…`); token revoked | PASS | — |

## Security observations

- No secret, password, token or personal data is in any tracked file (gitleaks history and
  tree: no leaks).
- The disposable editor's generated password had to be typed into the local login form, so it
  appears in the agent's session transcript (as in m1-010). The account is archived, and the
  scratch password file is deleted.
- The admin bearer token used for cleanup came from the git-ignored `.env` and was revoked by
  logout.
- The new dependency is first-party (MIT, zero dependencies). gitleaks was fetched with checksum
  verification and lives in the session scratch directory only.
- Behaviour change for operators: the new startup refusals turn a misconfiguration into a failed
  start instead of a silent weakness.

## Known limitations

- `APOS_HTTPS`, `APOS_TRUST_PROXY` and HSTS were verified with a **simulated** same-host proxy
  (loopback with forwarded headers), not behind real TLS. Verify again in the first staging
  environment.
- The rate limit is per IP: offices behind shared NAT share a quota, distributed spam is not
  stopped, and counting is approximate under concurrent bursts (get-then-increment, the same
  pattern core's login throttle uses).
- CSP is baseline-only (D-SEC-2). There is no per-IP login limit, CAPTCHA, or S9 work.
- `localhost` and `127.0.0.1` produced the same client key on this machine. Local test runs share
  one quota; run `test:security` last, or clear the counters with the task.
- Leftover: one demo form submission from B2 ("m1-011 browser test (demo)") stays in the local
  `aposFormSubmissions`. There is no supported deletion API, and hard deletion is not allowed.
  The archived page, image and user remain restorable.
- BitLocker status unknown. D-DB-5 was not re-tested, because no PostgreSQL was available or
  approved in this task.

## Unresolved decisions

- **D-DB-5** (open): file the upstream issue, approve the validation task.
- **D-SEC-2** (new): resource CSP rollout.
- **D-SEC-3** (new): file the upstream reports. Text for the form defect:

  > **Title:** form-widget shows "Thank you" when the submit request fails without `formErrors` (403, 429, 500)
  >
  > `modules/@apostrophecms/form-widget/ui/src/index.js` catches the `apos.http.post` error and reads only `error.body?.data?.formErrors`. When a submit fails for any other reason (CSRF 403, a 500, a rate-limiting 429 from middleware, a network error), `formErrors` is `undefined`, so the widget shows the thank-you message and hides the form. The visitor believes the message was sent, but nothing was stored. Expected: show `[data-apos-form-submit-error]` (and the global error text) for any failed request. Versions: @apostrophecms/form 1.5.6, apostrophe 4.34.0.

- **D-M0-5** (S3 login per-IP limit and CAPTCHA, S9) · **D-M0-9** (backup plan approvals) ·
  **D-M0-4** (retention) · **D-M0-11** (unchanged).
- **D-GIT-10**: review and merge the PR.
- Closed in this task: **D-DB-6** (owner, Option B), **D-M0-2** (with D-DB-6), **D-SEC-1**
  (dependency approved).

## Rollback guidance

- Before merge: close the PR and delete the branch.
- After merge: revert the commit. That removes the dependency, both modules, the tests and the
  docs; then run `npm ci`.
- Partial rollback without code changes: unset the env variables, or raise
  `APOS_FORM_RATE_LIMIT_MAX` ([runbook](../../../runbooks/security-configuration.md#rollback)).
- Data: the form-limit counters are in `aposCache` and expire on their own; the clear task
  removes them. No content or schema changed, so no migration is involved.
- Test artefacts: restore the archived page, image or user from the admin UI archive if wanted.

## Recommended next step

1. **Owner / architectural review** of this report. Open the PR from
   `feat/m1-011-security-hardening`, check the five CI checks, and merge (D-GIT-10). The
   `test` job now runs the security suites.
2. Approve and file the upstream issues (D-DB-5, D-SEC-3).
3. Next engineering task, in a **new Claude Code session**: **`m1-012` — WS-4 form operations**
   (D-M0-3 email notifications, D-M0-4 retention and export, CAPTCHA decision). It continues
   the form hardening done here. Run the D-DB-5 validation as a separate task when the owner
   approves a disposable PostgreSQL.
