# m1-012 — Form operations, privacy and reliability

| | |
|---|---|
| **Task** | m1-012 |
| **Date** | 2026-10-20 |
| **Scope** | Notification email, a fix for misleading form success (D-SEC-3), administrator review and export, a retention policy and task, an anti-spam decision, and upstream issue drafts, for the contact form. |
| **Prompt** | [2026-10-20-m1-012-form-operations-and-privacy.prompt.md](../../prompts/2026/10/2026-10-20-m1-012-form-operations-and-privacy.prompt.md) |
| **Branch / commit** | `feat/m1-012-form-operations` from `origin/main` `1978449`. The commit is the one that adds this report. |
| **Related** | [form operations runbook](../../../runbooks/form-operations-and-privacy.md) · [upstream issue drafts](../../../milestones/m1-012-upstream-issue-drafts.md) · [m1-011 report](./2026-10-20-m1-011-security-hardening.report.md) · D-M0-3, D-M0-4, D-M0-5, D-SEC-3, D-DB-5, D-GIT-10, D-GIT-11, D-FORM-1…5 |

## Requirements

Summary of the prompt:

- Verify the PR #13 merge and its hosted CI before implementing.
- Investigate the form architecture, and document the findings first.
- Notification email:
  - env-only configuration and a local sink;
  - plain text, no header injection, fixed recipients, minimal PII, an ID and timestamp;
  - safe logging and defined failure semantics.
- An upgrade-safe fix for false success on 403, 429, 500 and network errors, tested over HTTP
  and in the browser.
- Minimal authorized submission access, with a formula-safe CSV export.
- Retention: a proposal plus a dry-run task. No deletion of existing data, nothing enabled,
  deletion tested only on disposable data.
- A CAPTCHA evaluation, with no new external service.
- Upstream issue texts: duplicate check and sanitization.
- The full test set and Chrome acceptance.
- Records, a feature branch, push, and a compare URL. No merge or deploy.

## Work completed

### Phase A — initialisation and the CI gate

- `git fetch`: `origin/main` = **`19784499d3ed76e164cfd05eff0386c11ad8347f`** (`1978449`),
  "Merge pull request #13 from mimnets/feat/m1-011-security-hardening". Parents: `dd2ec15`
  (previous `main`) and `5e47d67` (the m1-011 head).
- The GitHub API for PR #13 reports `merged: true`, `merged_at` 2026-10-20T08:12:42Z, and the
  same merge SHA.
- The working tree was clean (on the old m1-011 branch), with nothing to preserve. `m1-012` was
  the INDEX's next free ID. The branch `feat/m1-012-form-operations` was created from
  `origin/main`.
- **Hosted CI (public GitHub REST API, read-only):**

  | Run | Event | Head | Jobs (lint, build, test, secrets, audit) |
  |---|---|---|---|
  | [39391730457](https://github.com/mimnets/vcl-assurer-group/actions/runs/39391730457) | pull_request | `5e47d67` | all `completed / success` |
  | [39391765260](https://github.com/mimnets/vcl-assurer-group/actions/runs/39391765260) | push to `main` | `1978449` | all `completed / success` |

  Every step's conclusion was read. In the `test` job, "Unit tests" ran in 1 s and "Smoke,
  editor workflow and persistence on a throwaway database" in 25 s and 27 s. The steps were
  not skipped.
  **Limitation:** the job logs need authentication (HTTP 403 without a token), so the
  per-suite check counts inside the logs were not read. The CI gate is passed on step
  conclusions and timings.

### Phase B — form architecture findings (documented before implementation)

1. **Validation and storage.** `POST /api/v1/@apostrophecms/form/submit` (multipart, a `data`
   JSON field) → `submitForm`. Each field widget's `checkRequired` and `sanitizeFormField` run
   (plus the project's server-side email check), and errors are collected as `formErrors`
   (400). Valid input → `emit('submission')`. Its handlers run in order: `saveSubmission`
   (emits `beforeSaveSubmission`, then `insertOne` into `aposFormSubmissions`: `{_id,
   createdAt, formId, data}`), `emailSubmission`, `emailConfirmation`. The route returns an
   **empty 200**. The adapters honour a provided `_id` (verified in the SQLite and PostgreSQL
   `insertOne`).
2. **Email hooks.** Core ships `@apostrophecms/email` (nodemailer 10.1.7, MIT-0;
   html-to-text). Upstream's per-form `emailSubmissions` sends editor-chosen recipients an HTML
   dump of all fields, and swallows errors with only a log. `emailConfirmation` mails the
   **address the visitor typed** (an abuse vector once SMTP exists). Supported hooks:
   `beforeSaveSubmission`, the `submission` event and `getTransport()`.
3. **Failure reporting.** Errors are `{name, data, message}`. The widget reads only
   `error.body.data.formErrors`, and anything else shows the thank-you message (D-SEC-3).
   Network errors reject with a ProgressEvent (no status). A busy form re-queues a second
   submit every 100 ms, so a double-click can store the message twice.
4. **Access and export.** There is none: no REST, admin UI or export route for submissions.
   The data is readable only with database access.
5. **Sensitive data.** Yes: name, email, company and free-text message (personal data). The
   local dev DB held 19 rows, all demo or test.
6. **Permissions.** Core roles are guest, contributor, editor and admin.
   `permission.can(req, 'edit', '@apostrophecms/user')` is true only for admins, because users
   have `editRole: admin`. Chosen as the gate.
7. **Rate limiter.** The m1-011 middleware on the submit URL runs after core CSRF and before the
   route. Middleware `before` ordering is supported; the known issue #4060 does not apply here.
8. **Retention.** Submissions live only in `aposFormSubmissions` (`formId`, `createdAt` indexed).
   Deletion through the form module's own collection handle, filtered on `createdAt`, cannot
   touch `aposDocs` (pages, pieces, users, forms) or attachments. File fields are disabled, so
   no attachments hang off submissions.

### Phase C — notification email

- `modules/@apostrophecms/email/index.js` configures core's transport from env
  (`modules/assurer-forms/lib/config.js`). The startup validation:
  - TLS is required except for a loopback sink;
  - user and password both or neither;
  - plain-address `APOS_EMAIL_FROM` and 1–5 `APOS_FORM_NOTIFY_TO` (header-injection-proof regex);
  - bounded timeouts (10/10/20 s);
  - errors never include the password.
- `modules/assurer-forms` builds a **plain-text** message. It holds the submission ID, the UTC
  time, the form title and the completed field names; values only with
  `APOS_FORM_NOTIFY_INCLUDE_VALUES=1` (D-FORM-1). The subject is stripped of CR/LF, control
  and Unicode separator characters. There is no visitor data in headers.
  `disableFileAccess` and `disableUrlAccess` are set.
- **Semantics** (runbook §1): accepted = stored. The notification runs after storage without
  delaying the response, and its status is stored on the submission (`pending`, `sent`,
  `failed` + error code, or `disabled`). Failures are logged as `notification-failed` with
  ID, attempt and code only.
- **Bounded retry/outbox:** the submission record *is* the outbox.
  `assurer-forms:retry-notifications` retries `failed`, and `pending` older than 5 minutes,
  up to 5 attempts per submission and 100 per run. It is manual or scheduler-driven, with no
  background workers.
- Upstream `emailSubmissions` stays off. The visitor confirmation email is removed from the
  schema, and its handler is replaced with a no-op.
- `scripts/smtp-sink.mjs`: a dependency-free local SMTP sink (accept, or 535 on AUTH) that
  never relays.
- **Real delivery: NOT VERIFIED.** There is no provider or credentials (D-M0-3, D-FORM-4).

### Phase D — false success (D-SEC-3)

- `modules/@apostrophecms/form-widget/ui/src/index.js` is Apostrophe's supported `ui/src`
  override. The build replaces upstream's `index.js` for that module, and only one player is
  bundled (verified in the production bundle). It imports upstream's
  `errors`/`fields`/`recaptcha` through the documented `Modules/` alias. A relative import
  failed the production build, and was fixed.
- **Success** only on a 2xx carrying `X-Assurer-Submission: stored`. The server sets it after
  storage, or on a replay. Upstream's empty 200 could otherwise be imitated by a proxy or
  captive portal.
- **Errors:** field errors as upstream, plus specific global messages for 403, 404, 429, other
  4xx, 5xx and no response. A 30 s timeout gives "could not confirm", and a late success still
  shows the thank-you message. Values are kept. Double submits are ignored.
- **Duplicates:** a random `X-Assurer-Submission-Key` per form fill. The replay middleware
  answers known keys (24 h) as stored without storing again. It runs before the rate limit,
  which is proven by a test.
- **Upgrade safety:** `scripts/form-ops.test.mjs` pins the SHA-256 of upstream's player. An
  upgrade that changes it fails the unit tests, which forces a review. No `node_modules`
  change, no monkey patch.
- The upstream defect itself remains (D-SEC-3, to be filed).

### Phase E — staff access and export

- `/assurer/form-submissions`: admins only. 404 for editors and anonymous visitors, so the
  page's existence is not revealed. 50 per page, form filter, strict parameter validation
  (400). A standalone page outside the site layout, with JSX-escaped output (an XSS probe
  rendered as text). `Cache-Control: no-store`, `X-Robots-Tag: noindex`, and the site's
  security headers.
- `/assurer/form-submissions/export.csv`: the same check. Optional `form`/`since`/`until`. At
  most 5,000 rows (larger requests are refused). Explicit columns only. Every cell quoted.
  Formula prefixes (`= + - @`, after whitespace, or tab/CR/LF) get `'`. UTF-8 BOM, attachment
  disposition.
- Audit log events `submissions-viewed` and `submissions-exported` (user ID, filter, count;
  core adds request ID and IP).
- Deferred (D-FORM-5): an admin-bar link, search, per-record deletion and a non-admin staff role.

### Phase F — retention and privacy

- `assurer-forms:retention`:
  - dry run by default: total, per-form counts, oldest date;
  - `--execute` needs `APOS_FORM_RETENTION_DAYS`, and `--days` must match it;
  - 30–3650 days; only `aposFormSubmissions` with `createdAt < cutoff` (and `formId`).
- **Proposal:** 180 days, pending the owner and DPO (D-FORM-2). **Not enabled; no existing
  submission was deleted.** Deletion was tested only on throwaway databases, through a guarded
  test-only task (`assurer-test:backdate-submissions`, refused unless the database is a
  temporary SQLite file).
- The runbook covers the defined access, the export and deletion procedures, backup
  implications, the test/real separation and access/erasure requests. There is no erasure
  tool yet (D-FORM-5). It also gives a privacy assessment that does not claim a single period
  fits all countries.

### Phase G — spam / CAPTCHA

The existing controls (CSRF, per-IP limit, validation, no uploads) are verified. **No
honeypot exists** upstream. The evaluation table is in runbook §7.

**Recommendation:** a project-code honeypot plus minimum fill time (a small follow-up task), a
per-IP limit at the proxy, and self-hosted ALTCHA (MIT; dependency approval) only if spam
appears. No reCAPTCHA, hCaptcha or Turnstile without separate approval (D-FORM-3). Nothing was
added. The rate limiter is unchanged, and its suite passes.

### Phase H — upstream issues

- Duplicate search: none for either issue. The related but not duplicate #4060 is noted.
- Sanitization: both texts reviewed (no paths, identities, credentials or customer data).
- The D-SEC-3 text was updated (network errors, the double-submit queue, the empty 200) in
  [m1-012-upstream-issue-drafts.md](../../../milestones/m1-012-upstream-issue-drafts.md). The
  D-DB-5 text is unchanged in its proposal.
- **Not filed:** no authorized integration. The owner files them at
  <https://github.com/apostrophecms/apostrophe/issues/new>.

## Files changed

- A `modules/assurer-forms/index.js` · A `modules/assurer-forms/lib/config.js` · A `modules/assurer-forms/lib/format.js` · A `modules/assurer-forms/views/submissions.jsx`
- A `modules/@apostrophecms/email/index.js`
- A `modules/@apostrophecms/form-widget/ui/src/index.js`
- M `modules/@apostrophecms/form/index.js` (confirmation email removed; comment)
- M `modules/assurer-test/index.js` (test-only `backdate-submissions`, same guard)
- M `app.js` (registers `assurer-forms`)
- M `package.json` (`test:forms` script; **no dependency change**; `package-lock.json` unchanged)
- A `scripts/form-ops.test.mjs` · A `scripts/form-ops-test.mjs` · A `scripts/smtp-sink.mjs` · M `scripts/run-ci-tests.mjs` (forms phase with sink and per-run SMTP canary)
- M `.env.example` (placeholder names only)
- A `docs/runbooks/form-operations-and-privacy.md` · A `docs/milestones/m1-012-upstream-issue-drafts.md`
- A `docs/engineering/prompts/2026/10/2026-10-20-m1-012-form-operations-and-privacy.prompt.md`
- A `docs/engineering/reports/2026/10/2026-10-20-m1-012-form-operations-and-privacy.report.md` (this report)
- M `docs/engineering/decision-register.md` · M `docs/engineering/INDEX.md` · M `docs/engineering/git-and-ci.md`
- M `docs/milestones/m1-handoff.md` · M `docs/milestones/m1-execution-plan.md`

## Tests executed and actual results

Windows 11, Node 24.21.0, local only.

| # | Check | Command / method | Result | Status |
|---|---|---|---|---|
| T1 | Lint | `npm run lint` | 0 problems (2 errors and 13 warnings found mid-task were fixed) | PASS |
| T2 | Unit | `npm run test:unit` | 52/52 (34 existing + 18 new: config, header text, PII-free body, CSV, upstream hash) | PASS |
| T3 | Isolated CI suite | `npm run test:ci` (throwaway SQLite, port 3100, SMTP sink on a free port, random SMTP password) | smoke 14/14, workflow 15/15, persistence 7/7, **forms 77/77 (0 skipped)**, security 65/65 (the existing uploaded-file skip from m1-011), proxy 15/15 | PASS |
| T4 | Dev-server suites (AGENTS.md) | `test:smoke`, `test:workflow`, `test:persistence`, `test:security` against `:3000` with the final server code; counters cleared afterwards | 14/14, 15/15, 7/7, 71/71 | PASS |
| T5 | Production build | `npm run build` (NODE_ENV=production, empty dotenv, throwaway DB) | First run **FAIL** (relative import in the override); after the `Modules/` alias fix, exit 0. The public bundle holds one form player (ours), no upstream re-queue code | PASS (after fix) |
| T6 | Audit gate | `npm run audit:check` | 43 findings (5 high, 38 moderate), all 3 baselined; passed. Unchanged (no dependency change) | PASS |
| T7 | Secret scan | gitleaks **8.30.1** Windows, SHA-256 `d29144de…afc4e` matches the release checksums (whose Linux entry equals the hash pinned in `ci.yml`). `git` over 10 commits, plus `dir` over all 15 changed and new files | "no leaks found" (all) | PASS |
| T8 | Notification failure doesn't reject | Forms suite: SMTP 535 and SMTP down | 200 stored; status `failed (EAUTH 535)` / `failed`; the retry task then sent both | PASS |
| T9 | SMTP credential secrecy | Forms suite: random password, searched in every HTTP body, the CSV, task output and the server log | absent everywhere | PASS |
| T10 | Retention | Forms suite: dry run; refusals (no env, `--days` mismatch, < 30); disposable delete of 2 backdated rows | counts correct; refused runs deleted nothing; exactly 2 deleted, the rest and the pages intact | PASS |

The prompt's targeted cases map to the forms suite (`scripts/form-ops-test.mjs`) as follows:

1. Valid submission;
2. Invalid submission (400, nothing stored);
3. Notification success (envelope, subject, body, no values, plain text);
4. Transport failure (T8);
5. Unauthorized access (anonymous and editor → 404);
6. Export authz and CSV safety (formula, quoting, headers, no internal fields);
7. Retention dry run;
8. Disposable deletion (T10);
9. CSRF 403;
10. Rate limit (429, replay before the limit; the full limit suite in `test:security`);
11. HTTP 500 (no stack, no confirmation);
12. Network failure: browser only (B9), since HTTP cannot represent it;
13. Credential secrecy (T9);
14. Security headers and cookies: `test:security` and proxy mode unchanged, plus the admin page
    keeps the headers.

Not run: a real SMTP provider (none available).

### Browser acceptance

**Method.**

- Claude in Chrome, the owner's Chrome, a dedicated MCP tab group (closed afterwards).
- **Agent-executed; not human acceptance.**
- Notifications need SMTP settings the owner's dev server does not have, and changing the
  owner's `.env` or database was avoided. So B1–B16 ran on a **disposable instance**:
  - `http://127.0.0.1:3002`, a production build of this branch;
  - a temporary SQLite database with the demo seed;
  - the SMTP sink on `127.0.0.1:2525`;
  - accounts `m1-012-browser-admin` (admin, `ensure-admin`) and `m1-012-browser-editor`
    (editor, `@apostrophecms/user:add`), with generated passwords in the session scratch
    directory (deleted).
- B17 is a read-only smoke check of the owner's dev server (`:3000`, Vite dev mode).

The checklist was written before running, from what the task changed. Evidence: screenshots
viewed in-session, not saved.

| # | Check | Role / viewport | Steps | Expected | Actual | Status | Evidence |
|---|---|---|---|---|---|---|---|
| B1 | Form renders | logged out / 1440 | Open `/` | Form and fields present | Present | PASS | — |
| B2 | Native validation | logged out / 1440 | Click Send on the empty form | Browser required-field message | "Please fill out this field" | PASS | — |
| B3 | Successful submission | logged out / 1440 | Type name, email, message; tick consent; click Send | Thank-you; 1 row; email in sink | "Thank you (demo)"; 1 row `sent`; one plain-text email with ID and UTC time and no values | PASS | `.eml` read (deleted) |
| B4 | Double submit | logged out / 1440 | **Double-click** Send in B3 | One submission | 1 row, 1 email | PASS | — |
| B5 | Server-side field validation | — | — | — | `type=email` blocks malformed input in the browser; the server check is covered by smoke and forms | NOT TESTED (not reachable through the UI) | — |
| B6 | Real 500 | logged out / 1440 | Fill the form; page script corrupts the `data` part (real server 500); click Send | Error, values kept, nothing stored | "…Your message was not sent because of a problem on our side…"; values kept; no row | PASS | — |
| B7 | Real 403 (CSRF) | logged out / 1440 | Page script points `apos.sitePrefix` at `localhost:3002`, so the browser omits the HttpOnly CSRF cookie; click Send | 403, specific error, no thank-you | Network 403; "…session has expired or a security cookie is missing…"; values kept | PASS | — |
| B8 | Rate limit | logged out / 1440 | Quota used up by `curl` (8×404 then 429); click Send | 429 message | "Too many submissions. Please try again later."; values kept | PASS | — |
| B9 | Network failure, then retry | logged out / 1440 | Stop the server; edit the message; click Send; restart the server; click Send again | "Could not confirm", then thank-you; one row | Both messages as expected; exactly 1 row for B9 | PASS | — |
| B10 | Notification failure | logged out → admin | SMTP sink stopped during B9's retry | Accepted; status failed | Thank-you shown; status `failed (ESOCKET)` | PASS | — |
| B11 | Admin review page | admin / 1440 | Log in (type username and password); open `/assurer/form-submissions` | List with statuses | 2 submissions; failed status in red. The first navigation (before login completed) showed 404 | PASS | — |
| B12 | Retry and export | admin / 1440 | Restart the sink; `retry-notifications`; reload; choose the form; click Show; fetch the Download CSV link | Status sent; filter works; CSV 200 | Retried 1, sent 1; both `sent`; filter URL applied; CSV 200, header + 2 rows | PASS | — |
| B13 | Layouts | 768, 375 | Same-origin iframes of exactly those widths (as in m1-010/011), home with the long error shown, and the admin page | No overflow | Overflow ≤ 0 everywhere; error text wraps (333 px at 375) | PASS (iframe method) | — |
| B14 | Logout, editor restriction | admin → editor | User menu → Log Out; check; log in as editor; open the page and the CSV | Logged-out 404; editor 404 | Logged-out whoami 404, page 404; editor whoami OK, page and CSV **404** | PASS | — |
| B15 | No visitor-confirmation option | editor / 1440 | Forms → DEMO form → After submission | Only thank-you fields | Only the thank-you title and content | PASS | — |
| B16 | Edit and publish regression | editor → logged out | Change the thank-you title; Update | Published; visible publicly | "Your changes have been published"; anonymous HTML shows the new title | PASS | — |
| B17 | Dev-server smoke | logged out / 1440, `:3000` | Open `/`; inspect the player | Renders; override active; no errors | Form present; override active in Vite dev; no console errors; no overflow | PASS | — |
| B18 | Timeout with late success | — | — | — | Needs a server that answers after 30 s; not reproducible without fault injection | NOT TESTED | — |
| B19 | Cleanup | — | Close the tab; stop the instance and sink; delete the temporary directory (DB, media, mail, credentials) and the build output | Nothing left | Done; ports 3002/2525 closed. The disposable accounts went with the deleted temporary database. On the owner's dev DB, only the `test:smoke` submission was added (20 rows) | PASS | — |

## Security observations

- No secret, password, token or personal data is in any tracked file (gitleaks history and
  tree: no leaks). `.env.example` has placeholder names only.
- The disposable accounts' generated passwords were typed into the local login form, so they
  appear in the agent's session transcript (as in m1-010/011). Both accounts and their
  database are deleted.
- New attack surface:
  - two admin-only GET routes, authorization-checked server-side on every request, 404
    otherwise;
  - one request header (`X-Assurer-Submission-Key`, validated pattern; a replay can only
    suppress a duplicate of an already stored submission);
  - outbound SMTP, off by default and TLS-enforced.
- Removed attack surface: the visitor-addressed confirmation email (open-relay risk once SMTP
  exists).
- **No dependency change.** nodemailer was already present through apostrophe.

## Known limitations

- Real email delivery, SPF/DKIM/DMARC and provider behaviour are NOT VERIFIED.
- `sent` means the SMTP server accepted the message, not that it was delivered. A notification
  attempt interrupted by a restart stays `pending` until the retry task runs. Nothing schedules
  the retry task yet.
- The replay key lives in `apos.cache` for 24 h. Two concurrent identical requests can both
  store, which is rare: double clicks are already blocked in the browser.
- The widget override must be compared with upstream on every `@apostrophecms/form` upgrade
  (enforced by the hash test). The visitor messages are English constants, not translated.
- Staff access is admins only. There is no admin-bar link, search or per-record erasure
  (D-FORM-5).
- Retention is not enabled. Backups keep deleted data until they expire.
- No honeypot or CAPTCHA yet (D-FORM-3).
- Hosted CI logs were not read (they need authentication). The m1-012 branch's own hosted
  run happens on the owner's PR.
- On the owner's dev database, 20 demo/test submissions remain (none deleted).

## Unresolved decisions

- **D-M0-3 / D-FORM-4** (provider, mailbox, sender domain).
- **D-FORM-1** (values in email).
- **D-M0-4 / D-FORM-2** (retention period and enabling deletion).
- **D-FORM-3** (anti-spam).
- **D-FORM-5** (staff roles, erasure tool).
- **D-SEC-3 / D-DB-5** (file the upstream issues).
- **D-GIT-11** (review and merge).
- Still open from before: D-SEC-2, D-M0-5 (S3 login limit, S9), D-M0-9, D-M0-11.
- Closed in this task: **D-GIT-10** (PR #13 merged, CI verified).

## Rollback guidance

- Before merge: close the PR and delete the branch.
- After merge: revert the commit (no dependency or lockfile change, so no `npm ci` needed).
  Stored submissions keep a `notification` field that upstream ignores. No migration.
- Without a code change: unset the `APOS_SMTP_*` variables to stop email. Storage and the
  widget fix are unaffected.

## Recommended next step

1. **Owner / architectural review** of this report. Open the PR from
   `feat/m1-012-form-operations`, check the five CI checks, and merge (D-GIT-11).
2. With the DPO and IT, decide D-FORM-1 to D-FORM-5 and D-M0-3/D-M0-4. File the two upstream
   issues.
3. Next engineering task, in a **new Claude Code session**: either `m1-013` (WS-5 content
   architecture), or first a small approved follow-up (the D-FORM-3 honeypot, or D-FORM-4
   real delivery verification once a provider exists).
