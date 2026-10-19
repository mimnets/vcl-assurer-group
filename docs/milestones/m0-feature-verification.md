# M0 — Feature Verification

**Date:** 2026-10-19 · **Build:** apostrophe 4.34.0 on SQLite · **Location:** `vcl-assurer-group/` (final)

## 1. How features were verified

Three complementary methods. Each result below states which one was used.

| Method | What it is | Re-run with |
|---|---|---|
| **UI** | Headless Microsoft Edge (via `puppeteer-core`, throwaway profile) driving the real admin UI: clicks, typing, screenshots | scratch script, not part of the project; steps listed in §4 |
| **API** | `scripts/editor-workflow-test.mjs`: the same REST endpoints the admin UI calls, as the admin user | `APOS_TEST_USER=… APOS_TEST_PASSWORD=… node scripts/editor-workflow-test.mjs` |
| **HTTP** | `scripts/smoke-test.mjs`: anonymous visitor rendering, CSRF and form-submission checks | `npm run test:smoke` |

The interactive Chrome extension was **not available** in this session, so there was **no
hands-on human walkthrough**. One is recommended before sign-off (§5).

## 2. Results summary (final run, after relocation and rename)

| Suite | Result |
|---|---|
| HTTP smoke test | **14 / 14 pass** |
| API editor workflow | **15 / 15 pass** |
| API persistence check after restart (`--verify-only`) | **7 / 7 pass** |
| UI headless suite | **16 / 16 pass** |
| ESLint | clean |
| Production build + production boot | pass (smoke 14/14 in `NODE_ENV=production`) |

## 3. Requirement-by-requirement

| # | Requirement | Status | Method | Evidence / notes |
|---|---|---|---|---|
| 1 | Administrator login | ✅ Verified | UI + API | Login form → admin bar appears. API login returns a token. Wrong password rejected (HTTP 400). |
| 2 | New page creation | ✅ Verified (API) · ⚠️ UI not exercised | API | Page `M0 Test Page` (`/m0-test-page`, type Default) created as a draft child of Home. The UI "New page" modal was not clicked through. |
| 3 | Editing text directly on the page | ✅ Verified | UI | In edit mode, clicking hero text makes it `contenteditable` (breadcrumb "ASSURER HERO › RICH TEXT"). Typed text autosaves ("Saving document…") to the **draft** only. |
| 4a | Adding widgets | ✅ Verified (API) · ✅ menu (UI) | API + UI | "Add Content" menu lists Assurer Hero, Assurer Slideshow, Assurer Product Cards, Form, Layout, Rich Text, Image, Video. Insertion completed via API (rich-text + image). |
| 4b | Rearranging widgets | ✅ Verified (API) · ⚠️ UI controls seen, not clicked | API + UI | Reordered widgets published in the new order (image before text in public HTML). Per-widget move up / move down / edit / delete controls render in edit mode. Product cards are widgets in an area, so they reorder the same way. |
| 5 | Uploading and replacing images | ✅ Verified (API) · ⚠️ media-manager UI not exercised | API | Upload via `/api/v1/@apostrophecms/attachment/upload`, then an image piece is created. The image widget's image was replaced; the public page shows the new file and not the old one. |
| 6 | Responsive rendering | ✅ Verified | UI | 1440 / 768 / 375 px: no horizontal overflow; product grid 3 / 2 / 1 columns; slideshow and form readable on mobile. The admin bar includes Desktop/Tablet/Mobile preview. |
| 7 | Contact form validation | ✅ Verified | HTTP + UI | Browser: empty submit blocked (4 required fields invalid). Server: empty submission → 400 with `required` on `fullname`, `email`, `message`, `consent`; malformed email → 400 `email:invalid` (**project addition**, upstream checks email only in the browser); 30 KB field → 400 "Field value too long"; no CSRF cookie → 403; valid submission → 200 and stored. Only valid submissions are stored (2 rows = 2 valid runs). |
| 8 | Draft and publish workflow | ✅ Verified | UI + API | Draft edits invisible to anonymous visitors until published. **UI "Update" button** published the inline edit. Later draft changes stay hidden; "revert draft to published" works. |
| 9 | Restart persistence | ✅ Verified (twice) | API + HTTP | (a) Server killed and restarted: test page, edited text, replacement image and home demo content all served. (b) Whole project moved to a new folder, DB file renamed, server restarted: same checks pass. |
| 10 | No paid-license requirement | ✅ Verified | Inspection | No `@apostrophecms-pro/*` or Assembly packages; no license key or online activation; works offline. See the license audit. |
| — | Styles Editor | ✅ Opens (UI) · ✅ applies (API) · ⚠️ UI sliders not exercised | UI + API | The palette button opens the "Global Styles Editor" (Typography / Layout / Widget Defaults). Setting `contentMaxWidth` = 1000 and publishing changed `--content-max-width: 1000px` in the served stylesheet. Restored to 1200. |
| — | Visual editing controls | ✅ Verified | UI | Admin bar (Pages, Users, Images, Files, Forms, Styles, recent docs), undo/redo, breakpoint preview, Edit/Preview, Draft/Published indicator, Update button. |
| — | Slideshow behaviour | ✅ Verified | UI | Next / dot / previous navigation (0→1→2→1). Autoplay pauses on hover and focus, and is disabled under `prefers-reduced-motion`. Arrow keys work. |

## 4. Proof-of-concept content delivered

Seeded by `node app assurer-demo:seed`; every item is labelled **Demo/DEMO**. A site-wide yellow
banner reads "Demonstration site — Milestone 0 proof of concept. Content is placeholder only."

| Section | Implementation | Editable how |
|---|---|---|
| Hero | `assurer-hero` widget: eyebrow, rich-text headline and body (in place), background image, overlay, ≤2 buttons (page or URL) | text in place; image and buttons in the widget modal |
| Image slideshow | `assurer-slideshow`: 1–12 slides (image + caption), autoplay, interval | widget modal; slides drag-reorder in the array editor |
| Product cards | `assurer-product-grid` (intro, columns, anchor) containing `assurer-product-card` widgets (image, badge, title, rich-text description, optional link) | cards added and reordered in place; description in place |
| Contact form | `@apostrophecms/form` piece "DEMO – Contact Assurer": name, email, company, interest (select), message, consent | Forms manager in the admin bar |

UI test steps (headless Edge): load home at 3 widths → slideshow navigation → empty form submit →
`/login` → admin bar → open Styles Editor → Edit → click hero text, type → leave editor (autosave)
→ check anonymous page unchanged → open Add Content menu → click Update → check anonymous page
changed. Demo content was then re-seeded to remove the test text.

## 5. Missing, incomplete or untested — flagged, not claimed

| Item | State | Recommendation |
|---|---|---|
| Hands-on human walkthrough of the admin UI | **Not done** (browser extension unavailable) | Have the architect or an editor walk through the README steps before approval (~20 min) |
| Page creation, media upload, drag-reorder and Styles sliders **through the UI** | Not clicked through; the same server endpoints are verified by API | Covered by the walkthrough above |
| Form **email notifications** | **Not configured.** Needs `@apostrophecms/email` plus an SMTP transport; the email fields are hidden in M0 | Milestone 1, with a real mail relay |
| Spam protection | reCAPTCHA (supported by the free module) **not enabled**; no rate limiting on submissions | Milestone 1 |
| Viewing form submissions | Stored in the `aposFormSubmissions` table, but the Community form module has **no admin screen for browsing them** | Decide in M1: a CSV export task, a small custom admin view, or email-only delivery |
| Real-device / cross-browser testing | Headless Edge (Chromium) only | Test Safari/iOS and Firefox in M1 |
| Favicon | Missing; `/favicon.ico` returns 404 (only browser console error seen) | Add with branding (`@apostrophecms/favicon` is free) |
| Placeholder hero image | Has text baked in, which overlaps the copy on narrow screens | Replace with real photography |
| Accessibility audit | Basic ARIA on the slideshow only; no formal WCAG audit | M1 |
| Test page `/m0-test-page` | Left in place as persistence evidence; appears in the nav | Archive or delete when no longer needed |
