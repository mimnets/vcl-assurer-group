# m1-020 start handoff: next CA task after CA-6

| | |
|---|---|
| **Prepared** | 2026-10-31, by the agent at the end of m1-019 (agent-executed; not a human approval) |
| **Task** | `m1-020`. **CA-4, brand theme and templates**, once the owner has supplied the brand assets (D-CONTENT-12). If they are still missing, the owner picks another item: for example the privacy page content with the DPO (D-CONTENT-12, D-CONTENT-14) or CA-5 preparation ([plan](../content/implementation-plan-and-risks.md#2-prioritised-implementation-plan)) |
| **Precondition** | The m1-019 PR is merged (D-GIT-17) and its five hosted CI checks are green |
| **Branch** | `feat/m1-020-<short-name>` from `origin/main` after that merge |
| **Session** | Start a **new Claude Code session** (AGENTS.md, Sessions and context) |
| **Read first** | [AGENTS.md](../../AGENTS.md) · [INDEX](../engineering/INDEX.md) · [decision register](../engineering/decision-register.md) · [m1-019 report](../engineering/reports/2026/10/2026-10-31-m1-019-privacy-and-forms.report.md) · [form runbook](../runbooks/form-operations-and-privacy.md) §7, §10 · [editorial and design requirements](../content/editorial-and-design-requirements.md) (CA-4) |

## 1. State at the end of m1-019

- `feat/m1-019-privacy-and-forms` is **not committed**. It holds CA-6 and this handoff. Commit,
  push and PR wait for the owner (D-GIT-17).
- All local suites and `test:ci` pass (see the report). Hosted CI has not run on this branch.
- New open decision: D-CONTENT-14 (third-party video embeds), due before launch.
- On the agent's machine: no dev server is left running (`:3000`–`:3003` had all exited by the
  end of m1-019).

## 2. Carry-over for later tasks

- **CA-4:** the form now has a submit block from
  `modules/@apostrophecms/form-widget/views/widget.jsx` (fill token, off-screen honeypot
  `.assurer-form__trap`, privacy notice `.assurer-form__privacy`). Keep the honeypot off screen
  and out of the tab order when restyling; do not use `display: none`. The footer has a
  `.assurer-footer__privacy` line. Fonts stay self-hosted (D-CONTENT-14 records the current
  system-font state).
- **CA-5:** create the privacy page with the DPO-approved text and choose it in Global Content →
  Privacy (runbook §10). Replace the demo consent wording on the form.
- **CA-7:** launch checks; D-CONTENT-13 and D-CONTENT-14 decided; proxy per-IP limit (D-FORM-3).

## 3. Gates

- No new dependency without approval.
- Commit, push and PR need owner approval.

## 4. Prompt for the new session

> Start m1-020. Read AGENTS.md and docs/milestones/m1-020-handoff.md first, confirm the task with
> me, follow the gates, and stop for approval before any commit or push.
