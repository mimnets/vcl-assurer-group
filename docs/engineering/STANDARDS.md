# Engineering documentation standards

Established by task `m0-002` (2026-10-19). The index of all records is [INDEX.md](./INDEX.md).

## Layout

```
docs/
├── architecture/decisions/   ADR-NNNN-*.md — decisions (see its README for lifecycle)
├── content/                  site content planning: inventory, IA, content model, SEO (added m1-013)
├── engineering/
│   ├── INDEX.md              links tasks ↔ prompts ↔ reports ↔ ADRs ↔ PRs
│   ├── STANDARDS.md          this file
│   ├── decision-register.md  open decisions awaiting a human
│   ├── git-and-ci.md         branch, PR, commit and CI policy
│   ├── prompts/YYYY/MM/      task prompts as given
│   └── reports/YYYY/MM/      task completion reports
├── runbooks/                 operational procedures
└── milestones/               Milestone 0 reports (historical, preserved as written)
```

## Task identifiers and file names

- Task ID: `mN-NNN`. `N` is the milestone number; `NNN` is a three-digit sequence that runs
  across the whole project and is never reused. Example: `m0-003`.
- Prompt: `prompts/YYYY/MM/YYYY-MM-DD-mN-NNN-descriptive-task.prompt.md`
- Report: `reports/YYYY/MM/YYYY-MM-DD-mN-NNN-descriptive-task.report.md`
- A prompt and its report share the task ID. The date is the date the task started.
- One prompt may produce several reports, for example when it bundles tasks. Each report then
  gets its own task ID and names the prompt it came from; the index records the relationship.
- `descriptive-task`: lowercase kebab-case, 2–5 words.

## Prompts

- Record the prompt text **as given**, with a short header: task ID, date, source.
- **Never** record session transcripts, tool output, credentials, tokens, personal data or
  internal hostnames. If a prompt itself contains a secret, redact it as `<redacted>` and say so
  in the header.
- Do not reconstruct prompts that were not recorded at the time. Mark them "not archived" in the
  index instead.

## Reports — required sections

```markdown
# <Title>

| | |
|---|---|
| **Task** | mN-NNN |
| **Date** | YYYY-MM-DD |
| **Scope** | one sentence |
| **Prompt** | link |
| **Branch / commit** | name / SHA — or "not a git repository" |
| **Related** | ADRs, PRs, other reports |

## Requirements
## Work completed
## Files changed          (exact paths, A/M/D/R)
## Tests executed and actual results   (commands, counts, failures; never "should pass")
## Security observations
## Known limitations
## Unresolved decisions   (link to decision-register.md entries)
## Rollback guidance
## Recommended next step
```

## Browser acceptance checklist (every task; added m0-008)

Every report has a **Browser acceptance** subsection under "Tests executed and actual results",
following the AGENTS.md browser-testing rules. Write the checklist for the task itself, before
running it, from what the task changed. A generic list doesn't count.

| # | Check (what a user does) | Role / viewport | Steps | Expected | Actual | Status | Evidence |
|---|---|---|---|---|---|---|---|

- **Status** is exactly one of PASS, FAIL, BLOCKED or NOT TESTED. Give a reason for each BLOCKED
  or NOT TESTED item.
- The header states the browser and method (for example "Claude in Chrome, owner's Chrome,
  dedicated tab group"), the account role used, and that the run is **agent-executed**.
- For features and content changes, include at least: the main user path as a non-admin editor;
  draft/published isolation; logged-out access; desktop, tablet and mobile layouts if the
  rendering changed; and cleanup.
- For docs-only and governance tasks, a public-site smoke check is enough: home page renders,
  key interactions work, and logged-out access controls hold.
- Evidence stays in `evidence/<task-id>/` (git-ignored). Reports cite file names only.

Rules: report actual results only. Say what was not done or not verified. No secrets, tokens,
passwords or session data, even redacted fragments. Historical reports are never rewritten. A
correction is a new dated report that links to the old one.
