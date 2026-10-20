# Prompt — m1-014: Corporate content model foundation

| | |
|---|---|
| **Task** | m1-014 |
| **Date** | 2026-10-20 |
| **Source** | Repository owner, pasted into a new Claude Code session. Recorded as given; nothing redacted (the prompt contains no secrets). |

---

# VCL-ASSURER-GROUP — M1-014: Corporate Content Model Foundation

## Role

Act as Principal Software Architect, Staff Engineer, Enterprise CMS Architect, QA Automation Lead, Security Advisor and Engineering Delivery Lead.

Project: VCL-ASSURER-GROUP

Repository: https://github.com/mimnets/vcl-assurer-group

Platform: ApostropheCMS Community Edition v4.

## Owner architectural authorization

The repository owner confirms that M1-013 PR #15 was merged into main.

The following architecture decisions are approved for implementation:

- D-CONTENT-1: The proposed information architecture and two-level menu are accepted as the working structure.
- D-CONTENT-2: Reusable Organization records are approved, but company identities, figures and factual claims remain unverified until confirmed by the owner.
- D-CONTENT-8: The proposed content-model foundation is approved. Create ADR-0003.
- English is the initial site language, with future localization compatibility.
- Do not invent brand colours, official company facts, certifications, leadership details or locations.
- SEO packages are not yet authorized for installation.
- Production WordPress migration remains unauthorized.

Build the foundation, not the entire corporate website.

## Phase A — Fresh session and repository checks

Read:

- AGENTS.md
- CLAUDE.md
- docs/engineering/STANDARDS.md
- docs/engineering/decision-register.md
- docs/engineering/INDEX.md
- docs/milestones/m1-handoff.md
- docs/milestones/m1-execution-plan.md
- docs/content/wordpress-site-inventory.md
- docs/content/corporate-information-architecture.md
- docs/content/apostrophe-content-model.md
- docs/content/editorial-and-design-requirements.md
- docs/content/implementation-plan-and-risks.md
- ADR-0001 and ADR-0002
- M1-013 execution report

Verify the latest origin/main and the merge of PR #15.

Inspect the five GitHub Actions job results for both the M1-013 PR run and the merged main commit.

If hosted CI is failing, stop implementation and investigate.

Confirm m1-014 is the next available global task ID.

Safely preserve local changes. Create a short-lived branch from verified main.

## Phase B — ADR-0003

Create an architecture decision record for the approved corporate content model.

Define:

1. Native Apostrophe Pages, Pieces, Widgets and relationships.
2. Page types versus piece types.
3. Content ownership and reuse.
4. Relationship and localization strategy.
5. Permissions and publishing.
6. Database portability.
7. Media and accessibility requirements.
8. Future AI-assisted draft compatibility.
9. Migration constraints.
10. Explicit exclusions and deferred decisions.

Do not duplicate Apostrophe's internal database, document lifecycle or authentication systems.

## Phase C — Four reusable piece types

Implement the following using supported Apostrophe APIs and project naming conventions:

### 1. Assurer Product

Fields appropriate for a minimal reusable product model:

- Internal name/title
- Public display title, if different
- Short description
- Rich description
- Product category/division relationship
- Image relationship
- Optional gallery
- Display order
- Publication state

Avoid unsupported commercial specifications or invented certifications.

### 2. Assurer Organization

Fields:

- Name
- Short description
- Logo/image
- Relationship to other group entities where needed
- Website URL with safe scheme validation
- Optional associated locations
- Display order
- Publication state

Do not automatically publish unverified group-company facts.

### 3. Assurer Person

Fields:

- Name
- Position/title
- Optional Organization relationship
- Profile image
- Optional biography
- Display order
- Publication state

Privacy requirements:

- No default public personal phone number.
- No default public personal email address.
- No import of real leadership profiles without owner review.
- Explicit approval required before publishing personal contact details.

### 4. Assurer Location

Fields:

- Location name
- Country and city
- Optional structured address
- Related Organization
- Public contact fields only where authorized
- Display order
- Publication state

Avoid unnecessary geolocation or third-party map integrations.

## Phase D — Corporate page types

Implement:

- assurer-division-page
- assurer-product-category-page

Use native editable Areas and approved existing widgets.

Allow sensible relationships to the relevant records.

Ensure ordinary Editors can create, draft, publish and edit the intended content without Administrator privileges.

Avoid hardcoded page-specific business content.

Preserve existing pages and their URL behavior.

## Phase E — Global settings and navigation

Implement editable global fields for:

- Public company contact information
- Footer information
- Social links, if provided
- Shared footer text
- Navigation-related settings where appropriate

Implement a usable two-level menu driven by the page tree.

Requirements:

- Desktop hover/click behavior where appropriate.
- Keyboard-accessible navigation.
- Touch-friendly mobile controls.
- Proper focus states.
- No horizontal overflow.
- Accessible semantics.
- Hide-from-navigation support.
- Reasonable handling of empty or unpublished pages.

Prefer reusing existing navigation and styling rather than replacing the entire frontend.

Global settings must not accidentally expose unverified business claims.

## Phase F — Demo content

Create a safe, repeatable demo-seed procedure with fictional placeholder records.

The seed must be:

- Idempotent.
- Clearly labelled as demo content.
- Safe to execute only in an isolated development/test environment.
- Refused in production.
- Non-destructive to existing owner-created content.

Do not automatically modify the owner's existing SQLite database.

Use a disposable database for tests.

Do not scrape and seed actual WordPress leadership identities or private information.

## Phase G — Authorization and data integrity

Test:

- Administrator access.
- Editor access.
- Unauthorized access.
- Draft/published separation.
- Relationships between records.
- Image metadata and permissions.
- Navigation hiding and ordering.
- Record deletion/archive behavior.
- Relationship integrity after archive.
- Persistence after restart.
- Global settings changes and permissions.
- Compatibility with existing content and widgets.

Avoid privileged operations in public routes.

No raw HTML field or arbitrary executable page components.

Maintain database-neutral Apostrophe APIs.

## Phase H — Automated tests

Extend automated suites for the new models.

Run:

- npm run lint
- npm run test:unit
- npm run test:ci
- npm run build
- npm run audit:check
- Approved Gitleaks scan

Add targeted negative tests for:

- Invalid field inputs.
- Unpublished related records.
- Unauthorized changes.
- Broken relationships.
- Invalid external URLs.
- Duplicate demo seeding.
- Archive and restore operations.

Verify the original M0 functionality has not regressed.

Use temporary databases and media directories.

## Phase I — Chrome browser acceptance

Claude has the owner's permission to use its connected Google Chrome extension.

At the end of this phase, perform a genuine browser-based editor walkthrough using disposable content and a non-admin Editor account.

Required checks:

1. Editor login.
2. Create a division page.
3. Create a product category page.
4. Add a Product record.
5. Add an Organization record.
6. Add a Person record.
7. Add a Location record.
8. Create and edit relationships.
9. Upload and replace an image.
10. Preview drafts.
11. Publish records and pages.
12. Verify unpublished records stay hidden.
13. Change an allowed global field.
14. Edit and reorder navigation items.
15. Open and use the mobile menu.
16. Verify tablet and mobile layouts.
17. Confirm no unauthorized Users access.
18. Log out.
19. Verify public content after logout.
20. Archive test records and verify cleanup.

Use the test-specific checklist format required by STANDARDS.md.

Record PASS, FAIL, BLOCKED or NOT TESTED.

Use actual UI interactions for UI acceptance. Do not substitute successful API calls for browser tests.

Where Chrome cannot resize the browser viewport, record the alternative method and its limitations.

Preserve the owner's original demo content.

## Phase J — Scope boundaries

Do not:

- Deploy to production.
- Modify the existing WordPress website.
- Modify mimPortal.
- Install unapproved paid or premium modules.
- Install the three proposed SEO packages.
- Migrate WordPress content.
- Change production database configuration.
- Claim PostgreSQL is production-approved.
- Implement AI page generation.
- Build all eight proposed widgets.
- Add real company or leadership data without factual approval.
- Delete existing content, databases, backups or media.
- Push directly to main.
- Merge a PR automatically.

Keep the implementation modest and maintainable.

## Phase K — Documentation

Use the actual execution date.

Create:

docs/architecture/decisions/ADR-0003-corporate-content-model.md

docs/engineering/prompts/YYYY/MM/YYYY-MM-DD-m1-014-content-model-foundation.prompt.md

docs/engineering/reports/YYYY/MM/YYYY-MM-DD-m1-014-content-model-foundation.report.md

Update:

- docs/engineering/decision-register.md
- docs/engineering/INDEX.md
- docs/milestones/m1-execution-plan.md
- docs/milestones/m1-handoff.md
- Relevant content model and editorial documentation

Document the real model schemas, permissions, editorial behavior and limitations.

Preserve historical reports.

## Phase L — Git and completion

Review the complete diff.

Ensure no secrets, personal information or local databases are included.

Commit using Conventional Commits.

Push a short-lived feature branch normally.

Provide the GitHub compare URL.

Do not merge.

Do not deploy.

## Final report

Provide:

1. Verified origin/main SHA and PR #15 merge.
2. Hosted CI status with actual run URLs.
3. ADR-0003 summary.
4. Piece types implemented.
5. Page types implemented.
6. Global settings and navigation implementation.
7. Schema and relationships.
8. Permissions and publishing.
9. Demo-seed behavior.
10. Automated test results.
11. Chrome editor acceptance results.
12. Accessibility and responsive results.
13. Known issues and blockers.
14. Exact files changed.
15. Git branch and commit SHAs.
16. Pull request compare link.
17. Recommended next task and owner decisions.

STOP after reporting. Await architectural approval before merging.

At the next major task boundary, recommend starting a NEW Claude Code session to conserve context and tokens.
