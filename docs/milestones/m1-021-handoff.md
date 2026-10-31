# m1-021 start handoff: next task after CA-4 scaffolding

| | |
|---|---|
| **Prepared** | 2026-10-31, by the agent at the end of m1-020 (agent-executed; not a human approval) |
| **Task** | `m1-021`. **The rest of CA-4** (brand colours, fonts, vector logo, favicon) once the owner has supplied the brand assets (D-CONTENT-12). If they are still missing, the owner picks another item: for example the privacy page content with the DPO (D-CONTENT-12, D-CONTENT-14), a decision on Global Styles access (D-M0-11), or CA-5 preparation ([plan](../content/implementation-plan-and-risks.md#2-prioritised-implementation-plan)) |
| **Precondition** | The m1-020 PR is merged (D-GIT-18) and its five hosted CI checks are green |
| **Branch** | `feat/m1-021-<short-name>` from `origin/main` after that merge |
| **Session** | Start a **new Claude Code session** (AGENTS.md, Sessions and context) |
| **Read first** | [AGENTS.md](../../AGENTS.md) · [INDEX](../engineering/INDEX.md) · [decision register](../engineering/decision-register.md) · [m1-020 report](../engineering/reports/2026/10/2026-10-31-m1-020-brand-theme-scaffolding.report.md) · [design tokens and brand swap guide](../content/design-tokens.md) · [editorial and design requirements](../content/editorial-and-design-requirements.md) |

## 1. State at the end of m1-020

- `feat/m1-020-brand-theme-scaffolding` is **not committed**. It holds the CA-4 scaffolding and
  this handoff. Commit, push and PR wait for the owner (D-GIT-18).
- All local suites pass (see the report). Hosted CI has not run on this branch.
- The agent's dev server on `:3004` is stopped at the end of the task. A server on `:3000` that
  the agent did not start was left alone.

## 2. Carry-over

- **Brand swap:** follow [design tokens §2](../content/design-tokens.md#2-swapping-in-the-brand-when-d-content-12-is-supplied)
  and re-run the contrast table (§3). Fonts must be self-hosted.
- **Global Styles** still sets the body font, sizes and widths, and editors can change them
  (D-M0-11). A brand font needs either a Global Styles value or that control removed.
- **Still literal:** most paddings, and the 640 px card-grid breakpoint (the requirements name
  768 px). Favicon not scaffolded. The demo notice stays until real content is built (CA-5).

## 3. Gates

- No new dependency without approval (a font package counts).
- Commit, push and PR need owner approval.

## 4. Prompt for the new session

> Start m1-021. Read AGENTS.md and docs/milestones/m1-021-handoff.md first, confirm the task with
> me, follow the gates, and stop for approval before any commit or push.
