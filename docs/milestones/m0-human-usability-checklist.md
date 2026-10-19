# M0 — Final human usability checklist (owner)

| | |
|---|---|
| **Purpose** | Close **D-M0-1**. Function was already verified by an agent in a browser ([m0-007 report](../engineering/reports/2026/10/2026-10-19-m0-007-browser-editor-acceptance.report.md), 23/23). This checklist asks only what a person can judge: is it usable? |
| **Prepared** | 2026-10-19 (`m0-007`) |
| **Time** | about 10 minutes, local only (`npm run dev`, http://localhost:3000) |

## Before you start

- Look through the agent's screenshots in `evidence/m0-007/` (local, not in git).
- Use **your own editor account**: `node app @apostrophecms/user:add <your-name> editor`.
- While logged in as admin, archive the agent's test account **m0-007-demo-editor** (Users →
  ⋮ → Archive).

## Checklist

Answer **Yes / No**, with a note for any No.

| # | Question | Yes / No | Note |
|---|---|---|---|
| 1 | Could you log in and find **Pages → New Page** without help? | | |
| 2 | Is typing directly on the page natural, and is it clear when the change is saved? | | |
| 3 | Is the **+ / Add Content** menu easy to find, with clear widget names? | | |
| 4 | Is uploading and **replacing** an image straightforward? | | |
| 5 | Are the **up/down arrows** an acceptable way to reorder page widgets? (Page widgets have no drag handle; slides inside the slideshow can be dragged.) | | |
| 6 | Is editing the **slideshow** (captions, adding a slide, dragging slide order) understandable? | | |
| 7 | Is the difference between **Draft**, **Publish/Update** and **Discard Draft** clear? | | |
| 8 | Do the **Desktop / Tablet / Mobile** previews look acceptable? | | |
| 9 | Should editors be able to change **site-wide Global Styles**? (They can today: finding F1.) | | |
| 10 | Is the contact form clear for a visitor, including its error messages? | | |

## Result

- **Accept** if 1–8 and 10 are Yes, or any No is a minor note you accept. Question 9 is a
  policy decision, not a pass/fail item.
- Record it in a short dated report
  (`docs/engineering/reports/YYYY/MM/YYYY-MM-DD-m0-NNN-human-usability-acceptance.report.md`):
  date, your role, Accept or Reject, and your notes. No passwords.
- Then update D-M0-1 in the [decision register](../engineering/decision-register.md).
