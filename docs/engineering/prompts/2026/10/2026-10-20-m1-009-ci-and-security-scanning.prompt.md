# Prompt — m1-009: Milestone 0 closure and GitHub Actions CI

| | |
|---|---|
| **Task** | m1-009 |
| **Date** | 2026-10-20 |
| **Source** | Repository owner, conveyed through ChatGPT and pasted into a new Claude Code session. Recorded as given; nothing redacted (the prompt contains no secrets). |

---

# VCL-ASSURER-GROUP — M1-009: Milestone 0 Closure & GitHub Actions CI Implementation

## Role and authority

Act as Principal Software Architect, Staff Engineer, DevOps/CI Engineer, Security Advisor, QA Automation Lead, Technical Product Owner, and Engineering Delivery Lead.

Project: VCL-ASSURER-GROUP

Repository: https://github.com/mimnets/vcl-assurer-group

Platform: ApostropheCMS Community Edition.

The repository owner explicitly confirms:

**"My VCL-ASSURER-GROUP Milestone 0 usability decision is: ACCEPT — authorize closure. No additional comments."**

The owner also authorizes starting Milestone 1, beginning with CI and automated security scanning.

Do not request a repeat of the completed Milestone 0 editor walkthrough.

## Part A — Session initialization

This is a NEW Claude Code session.

First read:

- AGENTS.md
- CLAUDE.md
- docs/engineering/STANDARDS.md
- docs/engineering/decision-register.md
- docs/engineering/INDEX.md
- docs/milestones/m0-closure-report.md
- docs/milestones/m1-handoff.md
- docs/milestones/m1-execution-plan.md
- docs/milestones/m1-009-ci-and-security-scanning-spec.md
- ADR-0001 and ADR-0002

Inspect the repository before modifying anything.

Verify:

1. Latest origin/main commit.
2. That M0-008 has been merged.
3. No uncommitted work will be overwritten.
4. The global sequential task ID m1-009 is available.

Fetch safely.

Never use a force push, destructive reset, or history rewrite.

## Part B — Finalize Milestone 0 closure

Record the owner's explicit human usability approval in:

- docs/milestones/m0-closure-report.md
- docs/milestones/m0-human-usability-checklist.md
- docs/engineering/decision-register.md

Mark D-M0-1 CLOSED — accepted by owner.

Verify all previously required M0 closure gates, including:

- Editor acceptance tests.
- Regression results.
- M0-008 documentation merge.
- Branch-protection decision and its accepted exception.
- Cleanup of temporary test accounts.
- No unresolved critical blocker.

If those conditions remain satisfied, mark Milestone 0 CLOSED.

Record the human acceptance as an owner decision conveyed through ChatGPT on 2026-10-20. Do not invent a handwritten signature, claim the owner performed tests not personally performed, or misrepresent automated browser tests as human testing.

Treat the accepted branch-protection exception as a documented risk, not a technical protection.

Do not modify historical execution reports.

Include the formal M0 closure changes in a clearly identifiable documentation-only commit, separate from the M1 implementation commit.

## Part C — Implement M1-009 CI and security scanning

Implement the existing approved specification:

docs/milestones/m1-009-ci-and-security-scanning-spec.md

Use that file as the detailed acceptance contract.

### 1. GitHub Actions

Introduce a maintainable GitHub Actions workflow that runs on pull requests targeting main and appropriate pushes to main.

Use least-privilege workflow permissions.

Prefer official maintained actions pinned to immutable commit SHAs where practical.

Prevent unnecessary duplication and concurrent interference.

Do not introduce paid GitHub services.

### 2. Reproducible installation and build

Use:

- npm ci
- npm run lint
- npm run build

Respect the project's supported Node.js version.

Use dependency caching where safe.

Do not modify production dependencies unless required and separately justified.

### 3. Isolated automated testing

Run:

- npm run test:smoke
- npm run test:workflow
- npm run test:persistence

Tests must use a temporary isolated database and generated test-only secrets.

Provide a supported, noninteractive test-admin bootstrap using Apostrophe's official APIs.

Do not require stored production credentials in GitHub Actions.

Do not reuse the owner's local SQLite database or media folder.

Ensure test resources are isolated between runs and cleaned up afterward.

### 4. Secret scanning

Add an open-source scanner such as Gitleaks.

Pin scanner versions and verify downloaded binaries where practical.

Scan committed source and relevant Git history without exposing secrets.

Fail CI on newly introduced real secrets.

Use carefully reviewed exclusions to avoid false positives from documentation and test fixtures.

Never print secret values in CI logs.

### 5. Dependency vulnerability reporting

The existing npm audit baseline reports approximately 43 findings, including 5 high-severity entries and no critical vulnerabilities.

Do not silently ignore these.

Build a documented baseline mechanism distinguishing previously acknowledged findings from newly introduced vulnerabilities.

New critical issues or unapproved high-severity regressions should fail CI according to the approved specification.

Never run npm audit fix --force.

Do not downgrade ApostropheCMS merely to make audit output green.

Record advisories and remediation ownership.

### 6. Negative tests

Demonstrate where practical that CI correctly rejects:

- A simulated lint failure.
- A controlled synthetic secret.
- A deliberately failing test.
- An unapproved new high/critical vulnerability.

Use disposable fixtures or temporary branches and clean up afterward.

Never inject real credentials.

Do not alter production or public GitHub history for negative tests.

### 7. Local execution and browser verification

Run all existing local regression checks.

Because this task primarily changes CI and supporting scripts, follow AGENTS.md and STANDARDS.md for the appropriate browser smoke checklist.

Use the authorized Claude in Chrome extension to verify the local website where applicable.

Do not claim Chrome tests passed if the extension is unavailable.

For each relevant verification record the actual result, environment and evidence.

## Part D — Security and operational safeguards

Do not:

- Deploy to production.
- Modify Assurer's existing WordPress website.
- Modify mimPortal.
- Migrate the production database.
- Introduce paid Apostrophe components.
- Upload local backup archives to Git.
- Commit .env values, tokens, session cookies, database files or media archives.
- Turn the private repository public.
- Change GitHub repository security settings without an explicitly authorized settings task.
- Weaken existing security rules.

Keep all work within the M1-009 scope.

## Part E — Documentation

Use the actual execution date and established sequential numbering.

Create:

docs/engineering/prompts/YYYY/MM/YYYY-MM-DD-m1-009-ci-and-security-scanning.prompt.md

docs/engineering/reports/YYYY/MM/YYYY-MM-DD-m1-009-ci-and-security-scanning.report.md

Update:

- docs/engineering/decision-register.md
- docs/engineering/INDEX.md
- docs/milestones/m1-execution-plan.md
- docs/milestones/m1-handoff.md
- docs/milestones/m0-closure-report.md

Add or update developer CI instructions if necessary.

Document the browser acceptance checklist required by STANDARDS.md.

## Part F — Git workflow

Create a short-lived feature branch from verified main.

Make separate commits for:

1. Formal M0 closure documentation.
2. M1-009 CI implementation, tests and related documentation.

Before committing, review the complete diff and scan for secrets.

Push the feature branch normally after local checks pass.

Provide a compare URL for the owner to open a PR.

Do not push directly to main or automatically merge.

## Completion and acceptance

Report:

1. Verified current main commit.
2. Formal Milestone 0 closure status.
3. Owner acceptance entry and closed decisions.
4. CI workflow files and jobs implemented.
5. Isolated test environment and credential strategy.
6. Local lint, build and test results.
7. Secret scanner findings.
8. Dependency audit baseline and outstanding risks.
9. Negative test results.
10. Chrome browser smoke-test results.
11. Git branch, commit SHAs and PR compare URL.
12. Exact report path.
13. Remaining approval requirements.

IMPORTANT: Local CI testing does not prove that GitHub-hosted CI has passed. Mark GitHub-hosted CI PENDING until actual GitHub Actions runs have completed and been inspected.

Do not declare M1-009 completed merely because workflow files were committed.

STOP after reporting. Await owner review and architectural approval.

At the conclusion of this task, recommend a fresh Claude Code session before the next substantially different task to save context and tokens.
