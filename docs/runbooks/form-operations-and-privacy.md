# Contact-form operations, notifications and privacy

| | |
|---|---|
| **Status** | Draft. Verified locally with a disposable SMTP sink (m1-012). Real mail delivery is **NOT VERIFIED**: no provider or credentials exist yet (D-M0-3). Retention deletion is implemented, but **not enabled**: no period is approved (D-FORM-2). |
| **Code** | `modules/assurer-forms/` (notifications, staff page, export, tasks) · `modules/@apostrophecms/email/` (transport from env) · `modules/@apostrophecms/form/` (confirmation email removed) · `modules/@apostrophecms/form-widget/ui/src/index.js` (browser error handling, D-SEC-3) · `modules/@apostrophecms/form-widget/views/widget.jsx` and `modules/assurer-forms/lib/guard.js` (spam guard, privacy notice; m1-019) |
| **Tests** | `npm run test:unit` (`scripts/form-ops.test.mjs`) · `npm run test:ci` (form-operations suite with SMTP sink) · `npm run test:forms` (against a running server) |
| **Related** | [security configuration](./security-configuration.md) (rate limit, headers) · [backup and restore](./database-backup-and-restore.md) · [m1-012 report](../engineering/reports/2026/10/2026-10-20-m1-012-form-operations-and-privacy.report.md) |

**This runbook is not legal advice.** The retention period, privacy notice and legal basis are
for the business owner and the DPO or legal counsel to set, for every country where Assurer
collects contact requests.

## 1. What happens when a visitor submits the form

1. Core checks the CSRF cookie (403 without it). The project's per-IP limit runs next (429).
   A retry of an already stored submission is answered before the limit (see step 6).
2. `@apostrophecms/form` validates the fields (unchanged upstream validation and the project's
   server-side email check). Invalid input → 400 with field errors, and nothing is stored.
3. The form module stores the submission in `aposFormSubmissions`. Before the insert, the project
   gives it an ID and a notification status (`modules/assurer-forms`, `beforeSaveSubmission`).
4. **The submission is now accepted.** The response is 200 and carries
   `X-Assurer-Submission: stored`. The browser shows the thank-you message **only** when it sees
   that header.
5. **The notification is a separate step.** It is attempted after storage, without making the
   visitor wait. Its outcome is recorded on the submission as `notification.status`:

   | Status | Meaning |
   |---|---|
   | `disabled` | No SMTP configured (`APOS_SMTP_HOST` unset). Nothing was attempted |
   | `pending` | Being sent. If it stays `pending` (for example after a restart), the retry task picks it up after 5 minutes |
   | `sent` | The SMTP server accepted the message. This is not proof that it reached the mailbox |
   | `failed` | The attempt failed. `lastError` holds a code only (for example `EAUTH 535`, `ESOCKET`) |

   A failed notification **never** turns an accepted submission into an error for the visitor.
6. The browser sends a random `X-Assurer-Submission-Key` per form fill. Once a submission is
   stored, its key is kept for 24 hours. If the visitor retries after a timeout or a lost
   connection, a retry with the same key gets "stored" without a second copy being stored.

### What the visitor sees

| Server outcome | Message (after the upstream "An error occurred submitting the form. Please try again.") | Form values |
|---|---|---|
| Stored (200 + header) | Thank-you heading and text from the form | Form hidden |
| 400 with field errors | Errors next to each field (upstream) | Kept |
| 403 | "Your message was not sent: your session has expired or a security cookie is missing. Please reload the page and try again." | Kept |
| 404 | "…this form is no longer available…" | Kept |
| 429 | "Too many submissions. Please try again later." (server text) | Kept |
| Other 4xx | "…it could not be accepted. Please check your entries and try again." | Kept |
| 5xx | "Your message was not sent because of a problem on our side. Please try again later." | Kept |
| No answer, or no answer in 30 s | "We could not confirm that your message was received. Please check your connection and try again; your message will not be stored twice." | Kept. A late success still shows the thank-you message |

The messages are English constants in the widget override, and are not translated yet.

## 2. Configuration (environment only)

All settings are optional. Without `APOS_SMTP_HOST`, no email is sent. Values go in `.env`
locally, or in the platform secret store in shared environments. They **never** go in Git,
reports or tickets. Invalid or unsafe combinations stop the app at startup with a
`Form configuration:` message. That message never contains the password.

| Variable | Default | Notes |
|---|---|---|
| `APOS_SMTP_HOST` | — | Turns notifications on |
| `APOS_SMTP_PORT` | 587, or 465 with `APOS_SMTP_SECURE=1` | |
| `APOS_SMTP_SECURE` | 0 | 1 = implicit TLS (port 465) |
| `APOS_SMTP_REQUIRE_TLS` | 1 | STARTTLS is required. 0 is accepted **only** for a loopback host (the local sink) |
| `APOS_SMTP_USER` / `APOS_SMTP_PASSWORD` | — | Both or neither. **Secret** |
| `APOS_EMAIL_FROM` | — | Required with a host. A plain address on a domain covered by SPF and DKIM (D-FORM-4) |
| `APOS_FORM_NOTIFY_TO` | — | Required with a host. The company mailbox(es): up to 5 plain addresses, comma-separated |
| `APOS_FORM_NOTIFY_INCLUDE_VALUES` | 0 | 1 = put the submitted values in the email (D-FORM-1) |
| `APOS_BASE_URL` | — | Core setting. When set, the email links to `<base>/assurer/form-submissions?form=…`; otherwise the link is a relative path |
| `APOS_FORM_RETENTION_DAYS` | — | The approved retention period. Needed before the retention task may delete (section 5) |

Do **not** set `APOS_LOG_EMAIL` in shared environments: core then logs whole messages.

Recipients are fixed by the operator. Upstream per-form recipient lists (`emailSubmissions`) stay
off. Upstream "confirmation email to the visitor" is removed from the form editor, and its
handler is replaced, because it would mail whatever address a visitor typed.

### Sender domain (before go-live)

- Use a dedicated sender, such as `website@<company domain>`, through the company's SMTP relay or
  transactional provider (D-M0-3, D-FORM-4). The provider needs a data processing agreement,
  because notifications carry personal data when D-FORM-1 is on.
- Publish SPF (the provider's include), DKIM (the provider's key) and DMARC (`p=quarantine` or
  stricter after monitoring) for that domain. Without them, notifications may be junked or
  rejected.
- Use port 587 with STARTTLS or 465 with TLS. Plain SMTP is refused for non-local hosts.

### Local testing with the sink

```
node scripts/smtp-sink.mjs --port 2525 --out <scratch directory outside the repository>
APOS_SMTP_HOST=127.0.0.1 APOS_SMTP_PORT=2525 APOS_SMTP_REQUIRE_TLS=0 \
APOS_EMAIL_FROM=website@example.test APOS_FORM_NOTIFY_TO=forms-inbox@example.test npm run dev
```

The sink accepts mail on 127.0.0.1 and writes `.eml` files. It never relays anything. Use
`example.test` addresses only. Never point a test at a real customer or external address.

## 3. Notification content

Plain text only (no HTML part, so no submitted value can be rendered as markup). The subject
is "New website form submission: <form title>", with line breaks and control characters
removed. There is no visitor data in any header and no Reply-To. Default body (D-FORM-1 off):

- submission ID and time received (UTC), for reconciliation with the staff page;
- form title and the **names** of the completed fields;
- the link to the staff page;
- a "do not forward" notice.

With `APOS_FORM_NOTIFY_INCLUDE_VALUES=1`, the values are added as plain text. This is
convenient, but it copies personal data into mailboxes, which then fall under the same
retention and access rules (D-FORM-1).

**Logging.** A failure is logged as `notification-failed` with the submission ID, attempt number
and error code only. Message content, SMTP server responses and credentials are never logged
or stored.

## 4. Staff access and export

| What | Where | Who |
|---|---|---|
| List (50 per page, newest first, filter by form) | `/assurer/form-submissions` | Users who may manage user accounts (**admin role**). Everyone else, including editors and anonymous visitors, gets 404 |
| CSV export (all forms or one form, optional `since`/`until` as `YYYY-MM-DD`) | "Download CSV" on that page, or `/assurer/form-submissions/export.csv?form=…&since=…&until=…` | Same |
| Retry failed notifications | `node app assurer-forms:retry-notifications` | Server operators |
| Retention report or deletion | `node app assurer-forms:retention` (section 5) | Server operators |

- Sign in at `/login` first. There is no admin-bar link yet (deferred).
- The responses are `Cache-Control: no-store` and `X-Robots-Tag: noindex`, and keep the site's
  security headers.
- **Export limits:** at most 5,000 rows per file. Larger requests are refused with a message to
  narrow the dates. Columns: `submission_id`, `received_utc`, `form`, `notification_status`,
  then the form's fields. No internal or session data.
- **Spreadsheet safety:** every cell is quoted. Cells that start with `=`, `+`, `-` or `@`
  (including after leading whitespace), or with a tab or line break, get a leading `'`, so a
  spreadsheet shows them as text. Open exports in a spreadsheet program only on managed
  company devices, and delete them when the task is done. An export is personal data.
- **Audit:** each page view and export is logged (`submissions-viewed`,
  `submissions-exported`) with the user ID, form filter, row count, request ID and client IP.
  Keep the logs as long as the security log policy says.
- Deferred (not built): an admin-bar entry, search, per-record deletion and a per-form access
  role. Granting access to non-admin staff needs a decision (D-FORM-5).

## 5. Retention (proposal; not active)

**Proposal for the owner and the DPO (D-FORM-2):** keep contact-form submissions for **180 days**
from receipt, then delete them. Notifications in mailboxes follow the same period. No single
period is right for every country. The DPO confirms the period, or sets different periods, for
each jurisdiction and purpose. If a submission becomes a customer or claims record, it is
copied into that system and governed by its rules.

The task always reports first:

```
node app assurer-forms:retention --days=180            # dry run: counts per form, oldest date; deletes nothing
node app assurer-forms:retention --days=180 --form=<form id>
```

Deletion needs **both** the approved period in the environment and an explicit flag:

```
APOS_FORM_RETENTION_DAYS=<approved> node app assurer-forms:retention --execute
```

Safety rules built into the task:

- It refuses without `APOS_FORM_RETENTION_DAYS`, and if `--days` differs from it.
- The minimum is 30 days and the maximum 3650.
- It touches only the form module's `aposFormSubmissions` collection, with the filter
  `createdAt < cutoff` (plus `formId` when given). Pages, pieces, users, forms and media are
  never queried for deletion.
- It logs `retention-deleted` with the count.

**Not enabled anywhere.** Once D-FORM-2 is approved: back up first (database **and** media), run
a dry run and keep its output, run `--execute`, and record the counts. Only then schedule it, for
example daily from the host's scheduler, and only with separate approval. Deletion was tested
only on disposable databases in m1-012.

**Backups.** A deleted submission survives in backups until they expire. Keep the backup
retention short enough that "retention period + longest backup age" is acceptable to the DPO,
and say so in the privacy notice. Do not restore an old backup into production to recover one
record. Restore into a new database and copy only what is needed ([ADR-0002](../architecture/decisions/ADR-0002-database-strategy.md)).

**Test and real data.** Each environment has its own database (ADR-0002). Automated suites run
on throwaway databases (`npm run test:ci`), or against the developer database. They must
**never** run against staging with real data, or against production: `test:smoke` and
`test:forms` store submissions. The local development database holds only demo and test
submissions (20 on 2026-10-20). The demo form is titled "DEMO – Contact Assurer".

## 6. Requests from individuals (access, correction, erasure)

Until a dedicated tool exists (D-FORM-5), as an administrator:

1. Verify the requester's identity outside the website (reply to the address on file).
2. **Access:** export the relevant date range (or the whole form, up to 5,000 rows), keep only
   the requester's rows, and send them through an approved secure channel. Delete the working
   files afterwards.
3. **Erasure or correction:** there is **no** supported per-record deletion or edit tool yet,
   and records must not be edited in the database by hand. Record the request, then raise it
   with the architect so the deletion can be done with a reviewed task (deferred, D-FORM-5)
   within the legal deadline.
4. Also delete the related notification emails from the company mailbox, and note that backups
   expire on their normal schedule (section 5).

## 7. Spam and abuse (D-FORM-3)

**In place:**

- CSRF cookie check (core);
- per-IP limit of 10 attempts per 15 minutes (m1-011);
- server-side validation and size limits;
- no file uploads;
- the replay key (section 1) stops accidental duplicates, but not deliberate ones;
- **spam guard (m1-019):** a hidden honeypot field and a minimum fill time of 3 seconds, checked
  on the server after field validation (`modules/assurer-forms/lib/guard.js`). The page carries a
  signed fill token (HMAC keyed from `APOS_SESSION_SECRET`). A rejected request gets 400 and
  "Your message was not sent. Please wait a few seconds…"; nothing is stored, and the log records
  `submission-rejected` with a reason code only (`honeypot`, `token-missing`, `token-invalid`,
  `too-fast`). Rotating the session secret invalidates forms already open: visitors reload;
- **no reCAPTCHA (m1-019):** Google reCAPTCHA is removed from the form editor, Global Content,
  the widget and the server check.

**Gaps:** there is no bot challenge; a bot that waits 3 seconds and ignores the honeypot gets
through. Distributed spam
from many IP addresses is not stopped.

| Option | License / cost | Privacy | Accessibility | Fit |
|---|---|---|---|---|
| Keep current controls only | — | Best | Best | Enough for a low-traffic launch, with monitoring of submission volume |
| **Honeypot field + minimum fill time** (project code, no dependency) | Free | No third party, no tracking | Invisible to people; must be hidden correctly from screen readers | **Recommended next step.** A small project task: server-side check in `assurer-forms` and a hidden field in the widget |
| **ALTCHA** (self-hosted proof-of-work; `altcha` widget and `altcha-lib`) | Open source, MIT per its repositories (re-verify at approval), free self-hosted | No third party, no cookies | No puzzle; a short automatic computation. Needs a check with assistive technology | **Recommended if spam appears.** Needs dependency approval and an integration task |
| Google reCAPTCHA v3 (built into `@apostrophecms/form`) | Free tier with limits | Sends visitor data to Google; usually needs consent | Score-based, no puzzle | Not recommended (third-party tracking, consent) |
| hCaptcha / Cloudflare Turnstile | Free tiers; external services | Third-party processing | Challenges can be hard for some users (hCaptcha) | Only with separate approval, if self-hosted options fail |
| Friendly Captcha | Paid for commercial use | EU-hosted service | No puzzle | Paid: needs separate approval |

**Recommendation** (m1-012; the honeypot and fill-time step was done in m1-019)**:** for the initial deployment, keep the m1-011 rate limit, add the honeypot
and fill-time check as a small follow-up task, and add a per-IP limit at the reverse proxy
(security-configuration runbook). Watch the volume. If spam gets through, propose ALTCHA. Do
not add any external CAPTCHA provider without separate approval.

## 8. Troubleshooting

| Symptom | Check |
|---|---|
| Visitors report "Please wait a few seconds…" | Spam guard (§7). Log `submission-rejected`: `too-fast` (autofill and instant submit; sending again works), `token-missing` (cached page from before m1-019, or a script posting directly), `honeypot` (a browser extension filling hidden fields) |
| App will not start: `Form configuration: …` | The message names the variable. Fix it in `.env` or the secret store |
| Status `failed (EAUTH 535)` | Wrong SMTP credentials. Rotate them in the secret store, restart, then run the retry task |
| Status `failed (ESOCKET)` / `ECONNECTION` / `ETIMEDOUT` | Network, port or TLS problem to the SMTP host |
| Status `sent`, but no email in the mailbox | Check the provider's logs, spam folders, and SPF/DKIM/DMARC alignment |
| Many `pending` | The process restarted during a send. Run the retry task |
| Visitors report "could not confirm" | Check the proxy timeouts (must exceed the app response time) and the server logs for 5xx |

## 9. Rollback

Unset the `APOS_SMTP_*` variables to stop notifications; storage is unaffected. Reverting the
m1-012 commit removes the module, the widget override and the email configuration. Stored
submissions keep the extra `notification` field, which upstream ignores. No migration is
involved.

Reverting the m1-019 commit removes the spam guard, the privacy fields and links, and the
reCAPTCHA removal. The `_privacyPage` and `formPrivacyText` values stay in the Global document,
unused. No migration is involved.

## 10. Privacy notice link (m1-019)

The privacy notice is an ordinary page. Its text comes from the business owner and the DPO; the
code supplies only the links.

1. Create the page (for example `/privacy`) with the approved text, and publish it.
2. Global Content → **Privacy** → "Privacy notice page": choose it with **Browse Pages** (the
   search box does not offer a draft-only page). Optionally add one or two DPO-approved sentences
   in "Text before the privacy link on forms". Update.
3. Visitors then see a "Privacy notice" link in the footer and, under every contact form, the text
   and the link above the submit button.

Nothing is shown while no page is chosen, or while the chosen page is unpublished or archived.
