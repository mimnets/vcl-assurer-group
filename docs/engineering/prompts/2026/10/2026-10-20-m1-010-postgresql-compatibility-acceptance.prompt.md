# Prompt — m1-010: Hosted CI verification and PostgreSQL acceptance

| | |
|---|---|
| **Task** | m1-010 |
| **Date** | 2026-10-20 |
| **Source** | Repository owner, pasted into a new Claude Code session. Recorded as given; nothing redacted (the prompt contains no secrets). Two runtime decisions the owner made during the session are recorded at the end. |

---

# VCL-ASSURER-GROUP — M1-010: Hosted CI Verification & PostgreSQL Acceptance

## Role

Act as Principal Software Architect, Staff Engineer, Database Architect, Security Advisor, QA Automation Lead and Engineering Delivery Lead.

Project: VCL-ASSURER-GROUP

Repository: https://github.com/mimnets/vcl-assurer-group

## Confirmed context

- Milestone 0 is formally CLOSED.
- M1-009 introduced GitHub Actions CI with five jobs: lint, build, test, secrets and audit.
- The repository owner confirms that the M1-009 pull request has been merged into main.
- The project uses ApostropheCMS Community Edition.
- SQLite remains the local development database.
- PostgreSQL is the preferred production database candidate, subject to a successful compatibility POC.
- MongoDB remains the fallback.
- Production deployment and live content migration are not authorized.

This is a new Claude Code session. Do not assume that previous conversational context is available.

## PHASE A — Verify M1-009 hosted CI

Read:

- AGENTS.md
- CLAUDE.md
- docs/engineering/STANDARDS.md
- docs/engineering/decision-register.md
- docs/milestones/m1-handoff.md
- docs/milestones/m1-execution-plan.md
- docs/milestones/m1-009-ci-and-security-scanning-spec.md
- The latest M1-009 execution report
- ADR-0001 and ADR-0002

Inspect current Git state and fetch origin/main safely.

Verify that M1-009 was merged.

Using authorized access, inspect the GitHub Actions runs associated with the merged commit and the corresponding push to main.

Verify all five jobs:

1. lint
2. build
3. test
4. secrets
5. audit

For each job, record its actual GitHub status, conclusion, run URL and commit SHA.

If Github Actions has not run, investigate workflow triggers and repository Actions settings using authorized read-only access.

If direct access is unavailable, provide exact GitHub UI instructions to the owner. Do not guess that CI passed.

**STOP GATE:** Do not start PostgreSQL implementation or mark M1-009 complete until hosted CI has been confirmed successful. If unavailable or failing, report the blocker and stop.

Once all five hosted checks are verified green, close D-CI-1 and the relevant M1-009 completion decisions.

## PHASE B — PostgreSQL compatibility assessment

Proceed only after Phase A passes.

Confirm current ApostropheCMS version, supported database drivers/adapters and applicable documentation.

Review the actual database configuration in the repository.

Do not assume that all ApostropheCMS features work identically across database backends.

Identify PostgreSQL compatibility constraints and the current state of the official adapter.

Do not introduce undocumented patches to Apostrophe core.

## PHASE C — Disposable PostgreSQL environment

Set up an isolated development PostgreSQL instance using free, open-source tooling.

Prefer a disposable Docker environment if Docker is available and authorized. If not, identify an equivalent safe local method.

Requirements:

- Local-only network access.
- Dedicated temporary PostgreSQL database.
- Generated test-only credentials.
- No production secrets.
- No external cloud database.
- No access to the owner's existing application data.
- No alteration of local SQLite or media files.

Do not install system-wide software without authorization.

If the necessary runtime is unavailable, document the precise blocker rather than substituting SQLite results for PostgreSQL tests.

## PHASE D — Acceptance testing

Using the actual Apostrophe PostgreSQL integration, test:

1. Fresh CMS initialization.
2. Administrator authentication.
3. Editor role and permissions.
4. Page creation, editing and publishing.
5. Draft/published separation.
6. Pieces and widgets.
7. Nested Areas.
8. Content relationships.
9. Image and media metadata.
10. Form submission persistence.
11. Global Styles persistence.
12. Restart durability.
13. Search behavior and indexing.
14. Backup and restore in a disposable target.
15. Failure recovery and consistency.

Use a defined test dataset and compare expected versus observed outcomes.

Test migration separately from fresh initialization.

If an official, supported migration path exists, evaluate it on disposable copies only.

Do not invent a SQLite-to-PostgreSQL migration procedure.

If no safe migration tool exists, classify migration as an unresolved blocker and propose a supported export/import approach for a separate task.

Do not modify the owner's existing SQLite database or media.

## PHASE E — Browser validation

Use the authorized Claude in Chrome extension.

Test the local PostgreSQL-backed application through actual UI interactions when safely possible.

Use test-only user accounts.

Include relevant desktop, tablet and mobile checks.

Verify editing, publishing and persistence after restart.

Distinguish agent-executed browser checks from human acceptance.

Do not report blocked tests as passed.

## PHASE F — Architecture decision

Compare PostgreSQL with the MongoDB fallback using verified project-specific evidence.

Evaluate:

- Compatibility
- Data integrity
- Migration feasibility
- Operational complexity
- Backup and restore
- Deployment suitability
- Maintainability
- Long-term support

Provide one of these recommendations:

A. PostgreSQL accepted for the next development stage.

B. PostgreSQL provisionally accepted with defined blockers.

C. PostgreSQL rejected; recommend MongoDB fallback.

Do not change ADR-0002 to a final PostgreSQL production commitment unless the applicable acceptance gates genuinely pass.

## PHASE G — Documentation

Use the next verified global task identifier, expected m1-010.

Create:

docs/engineering/prompts/YYYY/MM/YYYY-MM-DD-m1-010-postgresql-compatibility-acceptance.prompt.md

docs/engineering/reports/YYYY/MM/YYYY-MM-DD-m1-010-postgresql-compatibility-acceptance.report.md

Update relevant architecture decisions, the engineering decision register, INDEX and M1 handoff.

Include a detailed test matrix showing:

- Check
- Environment
- Expected result
- Actual result
- PASS / FAIL / BLOCKED
- Evidence
- Implication

Do not alter historical engineering reports.

## PHASE H — Git workflow

Use a short-lived feature branch created from verified main.

Protect all existing uncommitted work.

Review the complete diff and scan for secrets before committing.

Commit only reviewed, scoped changes.

Push normally and provide the GitHub compare link.

Do not push directly to main, merge automatically, force-push or deploy.

## Final report

Report:

1. M1-009 GitHub-hosted CI status, with run URL.
2. Verified database adapter support.
3. PostgreSQL environment details.
4. PostgreSQL test results.
5. Migration feasibility.
6. Browser test results.
7. Data integrity findings.
8. Security and operational risks.
9. Architecture recommendation.
10. Decision register changes.
11. Git branch, commit SHA and PR link.
12. Exact report filename and location.
13. Remaining blockers and required approvals.

If Phase A blocks, provide a CI verification report only and do not claim the PostgreSQL POC was performed.

STOP after reporting. Await architectural review before any production database selection or migration.

Recommend a NEW Claude Code session before the next substantially different engineering phase to save context and tokens.

---

## Owner decisions during the session (recorded by the agent)

1. **PostgreSQL runtime.** No Docker, Podman, WSL distribution or PostgreSQL was installed. Asked how
   to provide one, the owner chose: "Portable PG 16 zip (Recommended)". That is the official
   PostgreSQL 16.15 Windows binaries zip from get.enterprisedb.com, extracted into the session
   scratch directory and run as the user, with no installer, service, admin rights, or PATH or
   registry change.
2. **Unsigned binaries.** The agent found that the zip's executables are not Authenticode-signed.
   A Windows Defender scan found no threats. Asked whether to proceed, the owner chose
   "Proceed, record risk (Recommended)".
