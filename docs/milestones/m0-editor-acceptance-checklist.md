# M0 — Human editor acceptance checklist

| | |
|---|---|
| **Purpose** | Close decision **D-M0-1**: confirm, by a person using the real admin UI, the editing paths that M0 verified only through the API or a headless browser |
| **Prepared** | 2026-10-19 (`m0-005`); rows 21–23 added 2026-10-19 (`m0-006`) |
| **Time** | about 20–30 minutes |
| **Environment** | Local only: `npm run dev`, then http://localhost:3000. Not on any shared or production system. |
| **Result goes to** | a dated report `docs/engineering/reports/YYYY/MM/YYYY-MM-DD-m0-NNN-editor-acceptance.report.md`. Attach screenshots only if they contain no credentials or personal data. |

## Setup for the repository owner

**On the machine that already has the project** (`C:\Users\VCL-Admin\Documents\vcl-assurer-group`):
`.env`, the database and the demo content already exist. Skip to "Before you start".

**On a different machine** (fresh clone; local only, nothing shared):

```sh
git clone https://github.com/mimnets/vcl-assurer-group.git
cd vcl-assurer-group
npm ci
cp .env.example .env
# Set APOS_SESSION_SECRET in .env to the output of:
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
# (.env.example already selects SQLite: APOS_DB_URI=sqlite://./data/vcl-assurer-group.db)
node app @apostrophecms/migration:migrate
npm run seed:demo        # loads the demo home page (hero, slideshow, product cards, form)
```

## Before you start

1. `npm run dev` and wait for "apos-listening".
2. Use **your own** editor account, not the automated-test admin:
   `node app @apostrophecms/user:add <your-name> editor` (choose a password at the prompt; never
   write it in the report).
3. Keep a second, **private/incognito** window open on http://localhost:3000 as the anonymous
   visitor.

## Checklist

Mark each row **Pass**, **Fail** (with a one-line note) or **N/A**.

| # | Step | Expected result | Result |
|---|---|---|---|
| 1 | Log in at `/login` with your editor account | Admin bar appears; the page shows **Published** | |
| 2 | **Pages → New Page**: title "Acceptance Test", type Default, parent Home; save | Page opens as a **Draft** | |
| 3 | Click **Edit**, add a **Rich Text** widget, type a sentence directly on the page | Text editable in place; "Saving…" then saved | |
| 4 | Add an **Assurer Hero**, then an **Image** widget, using the **+** / "Add Content" menu | Both appear; the menu lists the Assurer widgets and Form | |
| 5 | **Upload an image** through the Image widget (media manager → upload a JPG/PNG from your computer) | Image shows in the widget | |
| 6 | **Replace** that image with a different one (edit widget → choose another image) | The new image shows; the old one is gone from the widget | |
| 7 | **Reorder** widgets: drag, or use the up/down arrows, to move the image above the text | Order changes on the page | |
| 8 | In the anonymous window, open `/acceptance-test` | **Not visible** (404), because the page is still a draft | |
| 9 | Click **Publish**, reload the anonymous window | Page visible with the same content and order | |
| 10 | Edit the text again **without** publishing; reload the anonymous window | Anonymous view still shows the **old** text | |
| 11 | Context menu (⋮) → **discard draft** / revert to published | Editor view returns to the published text | |
| 12 | Open the **Styles** (palette) panel; change *Layout → Content Max Width*; preview | Page width changes in preview | |
| 13 | **Cancel** the styles change, or set it back to 1200 and save | Width returns to normal | |
| 14 | Use the **Desktop / Tablet / Mobile** preview buttons on the home page | Layout adapts; no horizontal scrolling on Mobile | |
| 15 | Anonymous window, home page contact form: submit **empty** | Required-field errors shown; nothing sent | |
| 16 | Submit with email `not-an-email` and the other fields filled | Rejected with an email error | |
| 17 | Submit valid demo data (no real personal data) | Thank-you message shown | |
| 18 | Slideshow: click next / previous / a dot | Slides change | |
| 19 | Archive the "Acceptance Test" page (Pages manager → archive) | It disappears from navigation and the anonymous view | |
| 20 | Log out | Returned to the public site; admin bar gone | |
| 21 | *(before row 20)* Home page → **Edit** → open the slideshow widget: change a caption, add an image, drag a slide to a new position; save, preview, then ⋮ → **discard draft** | Slides show in the new order in the draft; after discarding, the published slideshow is unchanged | |
| 22 | Ask the developer to confirm that the row-17 submission was stored (`aposFormSubmissions`). Community Edition has no screen for browsing submissions (D-M0-4) | Submission present with the demo values | |
| 23 | *(after row 20)* Logged out, open `/acceptance-test` and http://localhost:3000/api/v1/@apostrophecms/page?aposMode=draft | Page not found; the API returns an error (401/403/404), no draft content | |

Added in m0-006 (rows 21–23) to cover slideshow configuration, submission persistence and
access after logout. If your account is an **editor**, the Styles panel (rows 12–13) may not be
available to that role. Mark it **N/A (role)**, not Fail.

## Agent-executed browser results (m0-007, 2026-10-19)

> **Agent-executed, not a human walkthrough.** Run through the real admin UI with the Claude in
> Chrome extension as a disposable **Editor** (`m0-007-demo-editor`), on a test page "M0-007
> Agent Test (Demo)". Details and evidence:
> [m0-007 report](../engineering/reports/2026/10/2026-10-19-m0-007-browser-editor-acceptance.report.md).

| Rows | Result |
|---|---|
| 1–7, 11–21, 23 | **PASS** in the browser |
| 8–10 | **PASS**. Editor actions in the browser; anonymous view checked by a cookie-less HTTP request. |
| 22 | **PASS** (developer check of the stored submission) |
| 12–13 | The Styles panel **is** available to the editor role |
| 7 | Page widgets have no drag handle; reordered with the **up/down arrows** (allowed by the row). Slides can be dragged in the slideshow's slides list (row 21). |

The human usability check that remains is in
[`m0-human-usability-checklist.md`](./m0-human-usability-checklist.md).

## Pass criteria

- **Rows 1–11 and 15–17 must pass.** They are the M0 editing and validation requirements.
- Rows 12–14 and 18–23 should pass. A failure there is recorded and triaged, and doesn't block
  closure on its own unless it is a security or data-loss issue.
- Any **data loss, crash, or content visible to the anonymous visitor before publishing** is an
  automatic fail.

## After the walkthrough

- Record the results in the dated report (rows, notes, tester role, date). No passwords.
  Minimal template:

  ```markdown
  # M0 editor acceptance walkthrough
  | Task | m0-NNN | Date | YYYY-MM-DD | Tester role | e.g. content lead | Commit tested | <git rev-parse --short HEAD> |
  | # | Result | Note |
  |---|---|---|
  | 1 | Pass | |
  | … | … | … |
  **Outcome:** Pass / Fail — rows 1–11 and 15–17 all Pass?
  ```
- If you created a personal editor account only for this test, remove it or keep it according to
  your access policy.
- Update **D-M0-1** in the decision register. If it passed, the Milestone 0 closure report can
  move from *Pending* to *Closed*.
