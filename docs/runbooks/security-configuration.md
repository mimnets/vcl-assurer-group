# Runbook: HTTP security, HTTPS proxy and form abuse limits

| | |
|---|---|
| **Status** | Draft. Verified locally on 2026-10-20 (`m1-011`): plain HTTP on `127.0.0.1`, and a simulated same-host TLS proxy (`npm run test:ci`, proxy mode). **Not executed** behind a real TLS proxy; that happens in the first staging environment. |
| **Task** | [m1-011 report](../engineering/reports/2026/10/2026-10-20-m1-011-security-hardening.report.md) |
| **Code** | `modules/assurer-security/` (settings, form rate limit, CLI task) · `modules/@apostrophecms/security-headers/` · `modules/@apostrophecms/express/` · `modules/@apostrophecms/asset/` |

## What is always on

| Control | Where | Value |
|---|---|---|
| `X-Content-Type-Options` | every response, including `/uploads` and built assets | `nosniff` |
| `X-Frame-Options` | same | `SAMEORIGIN` |
| `Content-Security-Policy` | same | `frame-ancestors 'self'; base-uri 'self'; object-src 'none'` (baseline only; see "CSP" below) |
| `Referrer-Policy` | same | `same-origin` |
| `X-Powered-By` | — | removed |
| Contact-form rate limit | `POST /api/v1/@apostrophecms/form/submit` | 10 attempts per client IP per 15 minutes, then `429` with `Retry-After` |

Unchanged from core and M0: CSRF cookie check (403 without it), `HttpOnly` and `SameSite=Lax`
session and CSRF cookies, the per-username login throttle (3 attempts per minute, 1-minute
lockout), form field size limits, no anonymous uploads, and the `127.0.0.1` bind address.

## Environment variables

| Variable | Default | Effect | Refused when |
|---|---|---|---|
| `APOS_HTTPS` | off | `Secure` flag on the session and CSRF cookies | not `1` or `0`; `1` without `APOS_TRUST_PROXY` |
| `APOS_TRUST_PROXY` | none trusted | Express `trust proxy`: which proxies may set `X-Forwarded-For` / `-Proto` | `true`, `*`, a hop count outside 1–10, or anything that is not `loopback`, `linklocal`, `uniquelocal`, an IP address or a CIDR range |
| `APOS_HSTS_MAX_AGE` | no HSTS | `Strict-Transport-Security: max-age=<n>` (no `includeSubDomains`) | set without `APOS_HTTPS=1`; not 0–63072000 |
| `APOS_FORM_RATE_LIMIT_MAX` | 10 | attempts per client per window | not 1–1000 |
| `APOS_FORM_RATE_LIMIT_WINDOW_MINUTES` | 15 | window length | not 1–1440 |

A refused value stops the app at startup with a message starting `Security configuration:`.

## Behind an HTTPS reverse proxy (staging and production)

Same host (nginx or Caddy on the same machine, app on `127.0.0.1`):

```sh
APOS_HTTPS=1
APOS_TRUST_PROXY=loopback
# Only after HTTPS works on every hostname of the site. HSTS is cached by browsers:
APOS_HSTS_MAX_AGE=300        # start short, raise to 31536000 once confirmed
```

The proxy must:

- set `X-Forwarded-Proto: https`;
- **overwrite or append** `X-Forwarded-For` with the client address (nginx:
  `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`). The app takes the
  right-most address that is not a trusted proxy, so a client-supplied left part is ignored;
- also rate-limit `/api/v1/@apostrophecms/login/login` and the form route per IP. The
  in-app form limit is a backstop, not volumetric protection.

Proxy on another host: list its address or subnet instead of `loopback`, for example
`APOS_TRUST_PROXY=10.0.0.0/8`. Do not use a hop count unless every request is guaranteed to pass
through exactly that many proxies.

**Check after deployment:**

1. `curl -sI https://<host>/` shows the headers above and `Strict-Transport-Security` (if set).
2. Log in through the browser. The `vcl-assurer-group.sid` cookie is marked `Secure`. If login
   seems to work but you are logged out on the next page, the proxy is not sending
   `X-Forwarded-Proto` or `APOS_TRUST_PROXY` does not match the proxy's address.
3. `npm run test:security` against an isolated copy (`BASE_URL=…`) passes.

## Contact-form rate limit

- **Threat model.** One source scripting bulk submissions, filling the submission store
  (personal data) and, later, a notification inbox. Distributed spam needs a CAPTCHA (decision
  D-M0-5). Floods need proxy limits.
- **Counted:** every POST to the submit route that passes the CSRF check, valid or not. Over
  the limit: `429`, nothing parsed or stored. The visitor sees "An error occurred submitting the
  form. Please try again. Too many submissions. Please try again later."
- **Client key:** `req.ip`, so only trusted proxies can change it. IPv6 addresses are grouped by
  /64. Visitors behind one shared address (an office NAT) share one quota.
- **Store:** core `apos.cache` (collection `aposCache`, namespace `assurer-form-rate-limit`), so
  every app process on the same database shares it. Entries expire on their own.
- **Fails open:** if the cache errors, the submission proceeds and the error is logged.
- **Unblock everyone** (for example a legitimate office, or before re-running the HTTP test suites
  locally): `node app assurer-security:clear-form-rate-limit`. Command line only.

Local note: `npm run test:security` deliberately uses up the quota of the machine running it.
Run it after `npm run test:smoke`, or clear the counters first.

## CSP (not yet a resource policy)

The baseline CSP only stops other sites from framing the site, `<base>` hijacking and plugins.
A resource policy (`default-src`, `script-src` with nonces) is not enabled. Core templates and
the Vite dev server emit scripts without nonces, so the official module's default policy would
break editing. Proposed rollout (decision D-SEC-2):

1. Send the module's computed policy as `Content-Security-Policy-Report-Only` with a report
   endpoint, in staging.
2. Exercise every editor path (pages, widgets, image upload and crop, Styles, forms) and the
   public site. Fix or allow each violation.
3. Enforce only after a clean report period, starting with production builds (not Vite dev).

## Rollback

Each control can be turned off without a code change, except the headers and the form limit:

- Unset `APOS_HTTPS`, `APOS_TRUST_PROXY` or `APOS_HSTS_MAX_AGE`. HSTS already cached by browsers
  remains until `max-age` runs out; to withdraw it, send `APOS_HSTS_MAX_AGE=0` for at least the
  old `max-age`.
- Raise `APOS_FORM_RATE_LIMIT_MAX`, or remove `'assurer-security': {}` from `app.js`.
- Headers: remove `'@apostrophecms/security-headers': {}` from `app.js` and the `static` option in
  `modules/@apostrophecms/asset/index.js`, or revert the m1-011 commit.
