# Engineering documentation standards

Established by task `m0-002` (2026-10-19). The index of all records is [INDEX.md](./INDEX.md).

## Layout

```
docs/
├── architecture/decisions/   ADR-NNNN-*.md — decisions (see its README for lifecycle)
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

Rules: report actual results only. Say what was not done or not verified. No secrets, tokens,
passwords or session data, even redacted fragments. Historical reports are never rewritten. A
correction is a new dated report that links to the old one.
