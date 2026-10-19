# M0 — Next Steps

**Date:** 2026-10-19 · **Status:** Milestone 0 complete pending human architectural approval.
Work has **stopped** here. Nothing below has been started.

## 1. Decisions needed from the architect

| # | Decision | Options | Recommendation |
|---|---|---|---|
| D1 | Approve Community Edition + Essentials starter as the foundation | approve / revise | Approve. All M0 editing requirements are met without paid modules. |
| D2 | Database beyond local PoC | SQLite (PoC only) · **PostgreSQL** · MongoDB | PostgreSQL for staging/production: managed hosting is common, backups are standard, and db-connect supports it. Migrate with `apos-db-dump` / `apos-db-restore`. |
| D3 | Version control | Initialise a local git repo; choose remote host | Initialise git and make a first commit once approved (needs your explicit go-ahead) |
| D4 | Form submission handling | email only · CSV export task · small custom admin view | Email via a corporate SMTP relay, plus a retention policy. The free module has no submissions browser. |
| D5 | Project license | `UNLICENSED` (proprietary) as set | Confirm with the business owner |
| D6 | Module prefix | keep `assurer-` · rename to `vcl-` | Keep `assurer-` (it names the site brand; the repo is VCL-ASSURER-GROUP) |

## 2. Before starting Milestone 1 (short)

1. Human walkthrough of the admin UI using the README (~20 min): create a page, upload an
   image through the media manager, drag-reorder widgets, change a Styles Editor slider,
   publish. This closes the UI-only gaps in the feature verification report.
2. Delete or rotate the local test admin password (`data/.local-admin-password`).
3. Archive `/m0-test-page` if it is no longer needed.

## 3. Proposed Milestone 1 scope (for discussion, not started)

**Content model and design**
- Information architecture from the existing Assurer World site: page types, navigation, footer
  and global settings (`@apostrophecms/global`).
- Brand tokens (colours, fonts, logo) wired into the Styles Editor; favicon.
- Product pieces (a `product` piece type with list and detail pages) instead of free-form cards,
  if products need to be reused across pages.
- Accessibility pass (WCAG 2.2 AA) on all widgets.

**Content migration (read-only, planned separately)**
- Inventory WordPress content via an export file, **not** a live DB connection.
- Mapping and a scripted import into a staging environment; never into production.

**Platform and security**
- PostgreSQL staging instance; backups; `APOS_RELEASE_ID` from CI.
- Reverse proxy with HTTPS, security headers (CSP, HSTS, frame-ancestors), rate limiting (security review S1–S3).
- Email transport (`@apostrophecms/email`, MIT) for form notifications; reCAPTCHA or hCaptcha.
- Data-retention policy for form submissions; privacy notice.
- CI: `npm ci`, lint, `npm audit` gate (with documented exceptions), smoke + workflow tests
  against an ephemeral SQLite instance.

**Editorial**
- Roles: decide whether core roles (admin / editor / contributor / guest) are sufficient.
  Fine-grained per-group permissions are **Pro** (`advanced-permission`) and must be avoided or
  replaced by process.
- Localisation needs (core i18n is Community; automated translation is Pro).

## 4. Watch items

- Re-run `npm audit` and the advisory feed check at the start of every milestone. Upstream
  published 59 advisories in Mar–Oct 2026, so stay on the latest 4.x.
- Tiptap 3 migration in core would clear GHSA-cp6q-959q-f8rh.
- Any feature request that maps to a Pro module must be flagged before design work starts.

## 5. Readiness for Milestone 1

**Ready, subject to approval of D1–D3 and the walkthrough in §2.** The foundation installs
cleanly, runs offline on SQLite, passes all automated checks, and needs no paid license.
