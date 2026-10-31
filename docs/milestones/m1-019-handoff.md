# m1-019 start handoff: next CA task after SEO

| | |
|---|---|
| **Prepared** | 2026-10-31, by the agent at the end of m1-018 (agent-executed; not a human approval) |
| **Task** | `m1-019`. **CA-4, brand theme and templates**, if the owner has supplied the brand assets (D-CONTENT-12); otherwise **CA-6, privacy and form go-live items** ([plan](../content/implementation-plan-and-risks.md#2-prioritised-implementation-plan)). The owner picks one at the start |
| **Precondition** | The m1-018 PR is merged (D-GIT-16) and its five hosted CI checks are green |
| **Branch** | `feat/m1-019-<short-name>` from `origin/main` after that merge |
| **Session** | Start a **new Claude Code session** (AGENTS.md, Sessions and context) |
| **Read first** | [AGENTS.md](../../AGENTS.md) · [INDEX](../engineering/INDEX.md) · [decision register](../engineering/decision-register.md) · [m1-018 report](../engineering/reports/2026/10/2026-10-31-m1-018-seo-plumbing.report.md) · [SEO runbook](../runbooks/seo.md) · [editorial and design requirements](../content/editorial-and-design-requirements.md) (CA-4) or the D-FORM rows (CA-6) |

## 1. State at the end of m1-018

- `feat/m1-018-seo-plumbing` is **not committed**. It holds CA-3 and the m1-018 handoff. Commit,
  push and PR wait for the owner (D-GIT-16).
- All local suites pass (see the report). Hosted CI has not run on this branch.
- New open decision: D-CONTENT-13 (AI crawlers and `llms.txt`), due before launch.
- On the agent's machine: dev servers on `:3000`, `:3001` and `:3002` were left running. The
  agent could not stop them; stop them before starting new work.

## 2. Carry-over for later tasks

- **CA-4:** one H1 per page in the page templates (SEO plan §4). The layout title now comes from
  `lib/seo-title.js`; keep it. Page links are absolute (`baseUrl`); use `_url` as before. Check the
  tablet and mobile layouts.
- **CA-5:** publish the legacy target pages, add the `/wp-content/uploads/` file redirects, and run
  `node app assurer-seo:seed-redirects --strict` (runbook §3).
- **CA-7:** launch checks in runbook §5.

## 3. Gates

- No new dependency without approval. CA-4 fonts must be self-hosted or approved (privacy, CA-6).
- Commit, push and PR need owner approval.

## 4. Prompt for the new session

> Start m1-019. Read AGENTS.md and docs/milestones/m1-019-handoff.md first, confirm with me
> whether it is CA-4 or CA-6, follow the gates, and stop for approval before any commit or push.
