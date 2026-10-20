# Upstream issue drafts: D-SEC-3 and D-DB-5 (m1-012)

| | |
|---|---|
| **Status** | Ready for owner review. **Not filed.** No authorized GitHub integration was available (`gh` is not installed; no token was used), and public text needs the owner's approval. |
| **Where to file** | Both in the ApostropheCMS monorepo: <https://github.com/apostrophecms/apostrophe/issues/new>. `@apostrophecms/form` and `@apostrophecms/db-connect` are published from that repository. |
| **Prepared** | 2026-10-20, m1-012. Approved for preparation by the architect (m1-012 prompt, Phase H). |

## Duplicate check (2026-10-20, GitHub search API, read-only)

| Query | Results | Duplicate? |
|---|---|---|
| `repo:apostrophecms/apostrophe "form" thank you error` | 0 | No |
| `repo:apostrophecms/apostrophe formErrors` | 0 | No |
| `org:apostrophecms form submit error "thank you"` | 6, all unrelated (#4060 middleware `before` ordering, sanitize-html, older PRs) | No |
| `repo:apostrophecms/apostrophe pool error postgres` | 1, unrelated (PR #5604 document versions) | No |
| `repo:apostrophecms/apostrophe ECONNRESET` | 0 | No |
| `repo:apostrophecms/apostrophe db-connect postgres connection` | 2, unrelated PRs (#5633, #5604) | No |

Related, but not a duplicate: **#4060** (open). Core orders middleware wrongly when a `before`
target itself has `before`. The project's replay middleware uses `before: 'assurer-security'`,
whose middleware has no `before`, so it is unaffected. An end-to-end check proves the order
(`scripts/form-ops-test.mjs`, "replays as stored while rate-limited").

## Sanitization review

Both texts were checked. They contain no project source beyond the description of the upstream
defect, and no credentials, hostnames, local paths, user names, session data or customer
data. Version numbers and generic reproduction steps only. The PostgreSQL DSN is a generic
placeholder.

## Issue 1: D-SEC-3 (form widget shows "Thank you" after a failed submit)

> **Title:** form-widget shows the thank-you message when the submit request fails without `formErrors` (403, 429, 5xx, network error)
>
> **Versions:** @apostrophecms/form 1.5.6, apostrophe 4.34.0.
>
> **What happens.** In `modules/@apostrophecms/form-widget/ui/src/index.js`, `submit()` catches the `apos.http.post` rejection and reads only `error.body?.data?.formErrors`. When a submission fails for any other reason, `formErrors` is `undefined`, so the widget runs the success branch: it shows `[data-apos-form-thank-you]` and hides the form. Failures that take this path:
>
> - 403 from the CSRF check (for example, an expired or blocked cookie);
> - 429 from rate-limiting middleware;
> - 500, for example a malformed `data` field, or any exception in a `submission` handler;
> - 404 when the form was deleted;
> - a network error or aborted request (the rejection is a ProgressEvent with no body).
>
> The visitor is told that their message was sent, although nothing was stored.
>
> **Also:** when the form is busy, a second submit is queued with `setTimeout(..., 100)` and runs after the first completes, so a double-click can store the same message twice. The success response of `/api/v1/@apostrophecms/form/submit` is an empty 200, so the client has no positive confirmation to check.
>
> **Reproduction.**
> 1. Put a form widget on a page and open it logged out.
> 2. Make the request fail: for example, stop the server before clicking Submit, or send a malformed `data` field so the route returns 500.
> 3. The thank-you message appears.
>
> **Expected.** Show the thank-you message only for a successful response. For every other outcome, show `[data-apos-form-submit-error]` with a suitable global message, and keep the form and its values. Ignore (do not queue) submits while a request is in flight.
>
> **Suggested fix.** In the catch block, treat any rejection as a failure. Use `formErrors` when present, otherwise a generic global error (optionally by status: 403 / 429 / 5xx / no response). Optionally return a small JSON body (for example `{ "ok": true }`) from the submit route, so the client can confirm success positively.
>
> **Impact.** Integrity and trust: visitors believe failed messages were delivered and do not retry. No security impact on the server.

## Issue 2: D-DB-5 (PostgreSQL connection loss exits the process)

The final text is in the [D-DB-5 proposal, section 2](./m1-d-db-5-postgresql-connection-loss-proposal.md#2-upstream-issue-ready-to-paste-not-filed),
unchanged from m1-011. It was re-reviewed for sanitization in m1-012 and no change is needed.
m1-012 did not re-test PostgreSQL.

## To file (owner)

1. Read both texts. Edit them if needed.
2. Open <https://github.com/apostrophecms/apostrophe/issues/new> and file each one separately,
   signed in as the account that should own the report.
3. Record the issue URLs in the decision register (D-SEC-3, D-DB-5).
