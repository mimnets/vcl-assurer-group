# m1-019 — Privacy and form go-live items (CA-6)

| | |
|---|---|
| **Task** | m1-019 |
| **Date** | 2026-10-31 |
| **Scope** | CA-6 from the [implementation plan](../../../../content/implementation-plan-and-risks.md#2-prioritised-implementation-plan), as narrowed by the owner in session: privacy page link and form notice, reCAPTCHA removed, honeypot and fill-time check (D-FORM-3), font/map/video audit |
| **Prompt** | [2026-10-31-m1-019-privacy-and-forms.prompt.md](../../../prompts/2026/10/2026-10-31-m1-019-privacy-and-forms.prompt.md) |
| **Handoff** | [m1-019 start handoff](../../../../milestones/m1-019-handoff.md) |
| **Branch / commit** | `feat/m1-019-privacy-and-forms` from `origin/main` `9a0dc6d` (m1-018 merged as PR #21). Not committed: commit, push and PR await the owner (D-GIT-17) |
| **Runbook** | [Contact-form operations and privacy](../../../../runbooks/form-operations-and-privacy.md) §7, §10 |
| **Related** | D-FORM-3 · D-CONTENT-12 · D-CONTENT-14 (new) · D-GIT-16 (closed) · D-GIT-17 (new) |

## Approvals used

- Owner, in session: CA-6 rather than CA-4, and the four scope items above.
- No dependency was added, removed or upgraded. `package.json` and the lockfile are unchanged.

## Start state

- The handoff said m1-018 was not committed. In fact it had been committed and merged (PR #21,
  `9a0dc6d` on `origin/main`). D-GIT-16 is closed on that basis. The hosted CI result was not
  re-checked: `gh` is not installed on the agent's machine.
- Dev servers from m1-018 were still listening on `:3000`, `:3001` and `:3002`. The agent's attempt
  to stop them was refused by the session's permission check. This task used its own server on
  `:3003`. All four servers had exited by the end of the session (not stopped by the agent).

## What was built

| Item | Implementation |
|---|---|
| Privacy page choice | Global Content, new **Privacy** tab: `_privacyPage` (one page, any type) and `formPrivacyText` (optional, up to 300 characters). Both empty by default |
| Footer link | `views/layout.jsx`: "Privacy notice" link when a page is chosen. For visitors core joins only a published page, so a draft or archived page shows no link |
| Form notice | New `modules/@apostrophecms/form-widget/views/widget.jsx` extends upstream `widgetBase.html` and overrides only `submitBlock`: the optional text and a "Privacy notice" link above the submit button, under the same conditions |
| reCAPTCHA removed | `enableRecaptcha` removed from the form schema; the Global reCAPTCHA fields are not added (the same-named `apostrophe:modulesRegistered` handler is replaced); `checkRecaptcha` is a no-op, so the server never contacts Google; the widget no longer renders reCAPTCHA markup and the browser player no longer imports upstream `recaptcha.js` (which loads Google's script) |
| Spam guard | `modules/assurer-forms/lib/guard.js`. The template renders a fill token `<time>.<HMAC-SHA256>` keyed from `APOS_SESSION_SECRET`, and an off-screen honeypot input (`aria-hidden`, `tabindex="-1"`, `autocomplete="off"`). The player sends both. A `beforeSaveSubmission` handler in `assurer-forms` runs **after** field validation and rejects with 400 and a visible message if the honeypot has any value, the token is missing, forged or from the future, or less than 3 s old. Nothing is stored; the log gets the reason code only |
| Font/map/video audit | Recorded as D-CONTENT-14 (below). No code |
| Tests | Unit: 5 new tests in `scripts/form-ops.test.mjs` (token, honeypot, forgery, field names, no `recaptcha.js` import). `scripts/smoke-test.mjs`: no reCAPTCHA in the page, guard rendered, too-fast and honeypot rejected, valid accepted after the wait. `scripts/form-ops-test.mjs`: too-fast, missing token, forged token, honeypot (all 400, nothing stored), field errors before the guard. Both HTTP suites now wait about 3 s once |

### Decisions taken in the task

1. **The guard runs after field validation.** A person who submits too fast with a field missing
   sees the field errors, not the spam message, and the existing empty-submission tests keep
   their 400 field errors. Throwing in `beforeSaveSubmission` stops the insert (upstream awaits the
   handlers before `insertOne`).
2. **Honest rejection, not a fake success.** Since m1-012 the visitor is told "sent" only when the
   submission is stored. The guard keeps that rule: a rejected visitor sees "Your message was not
   sent…" and can send again; their entries are kept.
3. **No maximum token age.** A page left open, or served from a cache, still works. A bot that
   waits 3 s and leaves the honeypot empty gets through; the per-IP limit (m1-011) still applies.
4. **No new environment variable.** The HMAC key is derived from the existing required
   `APOS_SESSION_SECRET`. Rotating that secret invalidates open forms (visitors reload).
5. **Plain English labels.** "Privacy notice" and the Global field labels follow the existing
   layout and Global fields; they are not translated yet, like the form messages (m1-012).

### Font, map and video audit (D-CONTENT-14)

| Item | Finding |
|---|---|
| Fonts | System font stack only (`_layout.scss`). No web font, no request to Google Fonts or any font CDN |
| Maps | None. No map widget, iframe or map script. `assurer-location` has no map field |
| Public pages | `/`, `/m0-test-page`, `/acceptance-test`, `/test`: no script, image or iframe from a host other than the site itself |
| Video | The core video widget is allowed in every `main` area (`lib/area.js`) and in nested columns. When an editor adds one, the **server** queries the provider's oEmbed endpoint, and the **visitor's browser** loads the provider's iframe (for example YouTube or Vimeo) on page view, without consent. No page uses one today |

## Verification (agent-executed)

Server: `node app` on `:3003` (development database), `BASE_URL=http://localhost:3003`.

| Command | Result |
|---|---|
| `npm run lint` | PASS (0 problems) |
| `npm run test:unit` | PASS, 89/89 |
| `npm run test:smoke` | PASS, 18/18 |
| `npm run test:workflow` | PASS, 15/15 |
| `npm run test:persistence` | PASS, 7/7 |
| `npm run test:forms` | PASS, 56/56, 4 skipped (no SMTP sink, no disposable database) |
| `npm run test:security` | PASS, 65/65 |
| `npm run test:ci` (isolated SQLite, SMTP sink) | PASS: smoke 18, workflow 15, content model 102, SEO 37, persistence 7 + 7, redirects 52, forms 84/84 (0 skipped), security 65, HTTPS-proxy security 15 |

Found and fixed during verification: `prependIfPrefix` is a Nunjucks helper, not a module method,
so the first render of the new widget template failed. The template now reads the form module's
`classPrefix` option.

### Browser checks (Claude in Chrome, agent-executed; not human approval)

Account: disposable `m1019editor`, role **editor**, created with
`node app @apostrophecms/user:add m1019editor editor`. Chrome already held the owner's admin
session on `localhost`, so visitor and editor checks ran on `http://127.0.0.1:3003` (a separate
cookie host). Logged-out page checks: browser tab without a session, and `curl`. Evidence:
screenshots viewed in session, not saved.

| # | Check | Result |
|---|---|---|
| B1 | Honeypot hidden: off screen (`left: -10000px`), `aria-hidden`, skipped by Tab (focus goes from the consent box to "Send message") | PASS |
| B2 | Visitor fills the form by typing and clicks "Send message" | PASS: thank-you message |
| B3 | Submit within 3 s of page load (fields set by script: no person types that fast) | PASS: "Your message was not sent. Please wait a few seconds…", no thank-you, entries kept |
| B4 | Click "Send message" again after the wait (same entries) | PASS: thank-you message |
| B5 | Page source: no reCAPTCHA markup or script; no third-party host | PASS |
| B6 | Editor: Global Content has a **Privacy** tab with both fields and help text; no form/reCAPTCHA group | PASS |
| B7 | Editor: create "Demo privacy notice (m1-019 test)" (hidden from navigation), **Save Draft**; choose it in Global Content → Privacy (Browse Pages), enter "Demo text (m1-019 test)."; Update | PASS: published. The relationship search showed the draft-only page greyed out and did not select it; Browse Pages did |
| B8 | Logged out, privacy page still a draft | PASS: no link, no notice text, page 404 |
| B9 | Editor publishes the page from the admin bar | PASS |
| B10 | Logged out, page published | PASS: notice "Demo text (m1-019 test). Privacy notice" above the button, footer link, page 200 |
| B11 | Editor: form editor **Advanced** tab | PASS: submit label and query-parameter fields only; no reCAPTCHA switch |
| B12 | Layouts at 375, 768 and 1440 px (same-origin iframes of those widths; the window could not be resized because it is maximized) | PASS: no horizontal overflow; notice inside the viewport and above the button; honeypot off screen |
| B13 | Note | The first attempt (B2) on `localhost:3003` showed "Too many submissions": the agent's own suite runs had used the per-IP quota. Cleared with `node app assurer-security:clear-form-rate-limit` |

## Clean-up

- Global Content → Privacy cleared and published by the editor (both fields empty; the Global
  document has new revisions).
- Demo page archived by the editor in the Pages manager (now 404).
- Disposable editor `m1019editor` archived by the test admin through the REST API.
- Left over: the browser and suite test submissions in the development database (labelled
  "demo" / "test"), as in earlier tasks; retention deletion is not enabled (D-FORM-2).
- Dev servers on `:3000`–`:3003`: all had exited by the end of the session; none left running.

## Limitations and follow-ups

- **Privacy notice text:** still needed from the owner and the DPO (D-CONTENT-12). Until a page is
  chosen and published, the site shows no privacy link.
- **Consent/purpose wording on the form:** the demo form's consent box says "I understand this is
  a demonstration form". The real wording is content work (CA-5) with the DPO.
- **Spam guard strength:** stops simple bots only. ALTCHA remains the next step if spam appears
  (dependency approval).
- **Video embeds:** D-CONTENT-14.
- **Stored reCAPTCHA values:** a Global document or form saved with reCAPTCHA settings before
  m1-019 would keep them in the database. They are now unused (no field, no script, no server
  call). None exist in the development database.
- D-FORM-1, -2, -4, -5 unchanged.

## Open decisions

- **D-CONTENT-14** (new): third-party video embeds.
- **D-FORM-3:** the honeypot and fill-time step is implemented; ALTCHA and the proxy limit remain.
- **D-GIT-17** (new): commit, push and PR for m1-019.

## Recommended next step

The owner reviews and approves D-GIT-17. Next task `m1-020`: CA-4 once the brand assets
(D-CONTENT-12) are supplied, in a new session ([m1-020 handoff](../../../../milestones/m1-020-handoff.md)).
