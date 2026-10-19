# M0 — Security Review

**Date:** 2026-10-19 · **Scope:** local proof of concept only. Not a production readiness assessment.

## 1. Constraint compliance

| Constraint | Status |
|---|---|
| No credentials exposed or committed | ✅ Secrets live only in `.env` and `data/` (both git-ignored). A scan of all other project files for the session secret and admin password found no matches. Nothing has been committed. |
| No production websites modified | ✅ Only `localhost` was contacted (plus read-only GitHub/npm metadata) |
| No commercial modules | ✅ None installed (see license audit) |
| No public deployment | ✅ Server bound to `127.0.0.1` only (verified with `netstat`) |
| mimPortal untouched | ✅ Not accessed |
| No production user import | ✅ The only account is a local test `admin` with a random password |
| No connection to the WordPress database | ✅ None configured |
| Local project isolated | ✅ Self-contained folder; SQLite file DB; no external services |
| No commit or push without approval | ✅ Not a git repository yet; nothing committed or pushed |
| Dependency licenses validated | ✅ See license audit §6 |

## 2. Upstream advisories considered

The GitHub advisory feed lists **59** ApostropheCMS advisories published Mar–Oct 2026
(4 critical, 10 high, 37 medium, 8 low). Every affected version range is below the installed
versions, or the advisory is for a package that is not installed. Examples:

| Package | Installed | Advisories fixed at or below installed version (examples) |
|---|---|---|
| apostrophe | 4.34.0 | MFA/TOTP bypass (GHSA-v9xm, critical, ≤4.27.1), prototype-pollution DoS / authz bypass (GHSA-6h5j, GHSA-vmg4), stored XSS (GHSA-7jg5, GHSA-vmgj, GHSA-hvx2), page REST authz bypass (GHSA-2j32, GHSA-vh56), unauthenticated CSV temp-file leak (GHSA-qhcq), password-change throttling (GHSA-653j) |
| @apostrophecms/form | 1.5.6 | Unbounded multipart upload DoS (GHSA-89mh), files stored before CAPTCHA (GHSA-rgg4), CAPTCHA token encoding (GHSA-44qr) |
| @apostrophecms/db-connect | 1.1.0 | Projection prototype-member deletion DoS (GHSA-j5rq) |
| sanitize-html | 2.18.1 | Recursion and nested-iframe issue (GHSA-c9rx), plus earlier XSS bypasses |
| uploadfs | 1.28.1 | Path traversal (GHSA-gmfx) |
| import-export, seo, ai-helper | **not installed** | Their advisories do not apply |

**Key action taken:** the starter kit pins `apostrophe ^4.32.1`, which permits vulnerable 4.32.x
releases. The floor was raised to `^4.34.0`. The form module floor is `^1.5.6`.

## 3. `npm audit` (43 findings: 38 moderate, 5 high)

All 43 entries trace back to **three** advisories in transitive dependencies of core:

| Advisory | Severity | Path | Exposure here | Fix available? |
|---|---|---|---|---|
| GHSA-cp6q-959q-f8rh: Tiptap `mergeAttributes()` `__proto__` | moderate | `apostrophe` → `@tiptap/*` 2.27.3 (rich-text editor) | Runs in the **admin's browser** while editing; needs crafted editor content | Only in Tiptap ≥3.30.4; core is on Tiptap 2. **No compatible fix.** |
| GHSA-vfj7-8cjw-p6xm: `braces` stack exhaustion | high | `chokidar` / `nodemon` (file watching) | Dev-time file watching of local paths; no user input | `braces` 3.0.3 is the latest release. **No fix.** |
| GHSA-hp3w-g68c-fv3c: `sprintf-js` unbounded precision | moderate | `underscore.string` → `sprintf-js` 1.1.3 | Server-side formatting, not fed format strings from users | 1.1.3 is the latest release. **No fix.** |

`npm audit fix --force` proposes **downgrading to apostrophe 4.4.3**. That would re-introduce dozens
of fixed vulnerabilities, so it was **not applied**. Decision: accept for M0, track upstream, and
re-run `npm audit` at every milestone.

## 4. Hardening applied in M0

| Area | Measure |
|---|---|
| Session secret | Read from `APOS_SESSION_SECRET`; **startup fails** if missing or < 32 chars (starter shipped `undefined`) |
| Network exposure | Bind address `127.0.0.1` by default (starter listened on all interfaces) |
| CSRF | Core CSRF cookie check active; verified a submission without it gets **403** |
| Form input limits | Per-field 20 KB (default 1 MB), 30 fields, **0 files** (multer rejects any file); verified 30 KB is rejected |
| Form validation | Server-side email-format validation added (upstream relies on the browser `type=email` alone) |
| File-upload form field | Deliberately **not enabled** (anonymous uploads) |
| Email submission fields | Hidden (`emailSubmissions: false`) until a mail transport is set up, avoiding silent non-delivery |
| Link fields | `url` type; core strips `javascript:` / `data:` schemes, case-insensitive (tested) |
| Output escaping | JSX templates escape interpolated text and attributes; rich text is sanitised by core `sanitize-html` |
| Lockfile | `package-lock.json` no longer git-ignored, so installs are pinned and reproducible |
| Seed task | Writes via core `convert` (same sanitisation as the editor UI), never raw DB writes; never touches users |

## 5. Findings and open risks

| # | Finding | Severity (prod) | M0 impact | Recommendation |
|---|---|---|---|---|
| S1 | No `Content-Security-Policy`, `X-Frame-Options`/`frame-ancestors`, `Strict-Transport-Security` or `Referrer-Policy` headers; `X-Powered-By: Express` exposed | Medium | None (loopback only) | Set at the reverse proxy (nginx/Caddy) or with a small `helmet`-style middleware; CSP needs tuning for the admin UI |
| S2 | Session cookie not marked `Secure` (HTTP dev) | Medium | None | Run behind HTTPS in any shared environment; enable `secure` cookies and `trust proxy` |
| S3 | No rate limiting on `/login` or the form submit route; reCAPTCHA not enabled | Medium | None | Rate-limit at the proxy; enable reCAPTCHA v3 or hCaptcha (free) on public forms |
| S4 | Form submissions (personal data) stored indefinitely in SQLite, with no retention policy and no admin view | Medium (privacy) | Demo data only | Define retention and deletion; decide on the delivery/export mechanism; privacy notice on the form |
| S5 | Three unpatched transitive advisories (§3) | Low–Moderate | Low | Track upstream; re-audit each milestone |
| S6 | Licence-less transitive packages (`pause`, `regexp-quote`, `urls`) | Legal, low | None | Raise with upstream |
| S7 | SQLite: single-writer, no built-in replication or backup | Operational | Fine for PoC | Use PostgreSQL or MongoDB for staging and production; `apos-db-dump` / `apos-db-restore` exist for migration |
| S8 | Local test admin password stored in plaintext at `data/.local-admin-password` (git-ignored) | Low (local) | Convenience for re-running tests | Delete it, or change the password, when M0 review ends |
| S9 | Password policy, 2FA and account lockout | Medium | None | Review core options; 2FA/SSO modules exist but check their edition (some are Pro) before planning |

## 6. Not performed

No penetration test, DAST scan, dependency SBOM export or threat model was done. These are
appropriate before any internet-facing deployment, not at M0.
