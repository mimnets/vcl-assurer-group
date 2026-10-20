# Prompt — m1-013: WordPress inventory and corporate content architecture

| | |
|---|---|
| **Task** | m1-013 |
| **Date** | 2026-10-20 |
| **Source** | Repository owner, pasted into a new Claude Code session. Recorded as given; nothing redacted (the prompt contains no secrets). |

---

# VCL-ASSURER-GROUP — M1-013: WordPress Inventory and Corporate Content Architecture

## Role

Act as Principal Software Architect, Staff Engineer, Enterprise CMS Architect, Senior UX/UI Strategist, Technical SEO Architect, Content Migration Lead, Security Advisor and Engineering Delivery Lead.

## Project

Project: VCL-ASSURER-GROUP

Repository: https://github.com/mimnets/vcl-assurer-group

Existing public website: https://www.assurerworld.com

Target platform: ApostropheCMS Community Edition v4.

## Owner authorization

The owner confirms that M1-012 PR #14 has been merged into main.

M1-012 is accepted for development.

Proceed with **M1-013 — Corporate Website Content Architecture and WordPress Inventory**.

This phase is research, architectural design, specification and safe local prototyping only where genuinely needed to validate feasibility.

Do not migrate or rewrite the live WordPress website yet.

Do not deploy.

Do not implement a large collection of new page templates before architectural review.

## Phase A — Start-of-session verification

This is a NEW Claude Code session.

Read:

- AGENTS.md
- CLAUDE.md
- docs/engineering/STANDARDS.md
- docs/engineering/decision-register.md
- docs/engineering/INDEX.md
- docs/milestones/m1-handoff.md
- docs/milestones/m1-execution-plan.md
- ADR-0001 and ADR-0002
- The M1-012 execution report
- Existing Apostrophe widget and page specifications

Fetch origin/main safely.

Verify the merge of PR #14.

Inspect the current project structure and existing application modules.

Verify that m1-013 is the next available task identifier.

Check the five GitHub-hosted CI jobs for PR #14 and its merge into main.

Record actual results and run URLs.

If CI is failing, investigate and report the blocker before undertaking unrelated implementation.

Do not overwrite uncommitted work.

## Phase B — Existing WordPress website inventory

Conduct a read-only inventory of:

https://www.assurerworld.com

Use authorized public browsing and read-only inspection.

Respect robots.txt, website availability and reasonable request rates.

Do not:

- Log into WordPress without explicit authorization.
- Modify WordPress content, plugins or settings.
- Export private customer information.
- Run vulnerability scanners against the public website.
- Crawl private or administrative endpoints.
- Trigger contact-form submissions.
- Download the entire media library indiscriminately.

Inventory:

1. Homepage.
2. Main navigation and submenus.
3. About/company pages.
4. Group companies and business units.
5. Product categories and product pages.
6. Services.
7. Industries or sectors served.
8. Manufacturing and operational capabilities.
9. Sustainability and compliance information.
10. Leadership, teams and careers, where publicly available.
11. News, updates and publications.
12. Contact pages and offices.
13. Forms and calls to action.
14. Languages and country-specific content.
15. Publicly accessible images, documents and video references.
16. Metadata, headings, internal links and canonical URLs.

Classify findings as:

- Verified live content
- Discovered but not inspected
- Inferred architectural requirement
- Missing or unavailable

Never invent company facts, certifications, facilities, locations, customers or product claims.

## Phase C — Inventory documentation

Create a comprehensive URL inventory with:

- Current WordPress URL
- Page title
- Page type
- Navigation location
- Primary heading
- Content summary
- Media dependencies
- SEO metadata availability
- Internal-link dependencies
- Proposed Apostrophe content type
- Migration priority
- Verification status

Identify duplicate, obsolete or thin pages as review candidates.

Do not recommend deleting live pages without owner approval.

Document canonical URL and redirect requirements.

Preserve existing search-engine equity wherever practical.

## Phase D — Corporate information architecture

Prepare a recommended sitemap and navigation hierarchy.

Consider:

- Home
- About Assurer
- Group businesses
- Products
- Services
- Industries
- Sustainability
- News and insights
- Careers
- Contact

These are planning categories, not confirmed facts about the live website.

Use the verified WordPress inventory to decide the actual structure.

Design for:

- Clear business-unit relationships.
- International audiences.
- Potential multilingual expansion.
- Mobile usability.
- SEO-friendly URLs.
- Nontechnical staff editing.
- Future addition of products, locations, news and corporate pages.

Identify navigation and URL changes that need owner approval.

## Phase E — ApostropheCMS content model

Inspect the existing application before proposing additional modules.

Follow ADR-0001 and official Community capabilities.

Recommend where to use:

- Page types
- Piece types
- Widgets
- Areas
- Relationships
- Global settings
- Reusable content blocks

Consider reusable structures for:

- Corporate hero sections
- Slideshows
- Text and image layouts
- Product/category cards
- Service descriptions
- Company/group profiles
- Leadership profiles
- Office/location details
- Statistics and key figures
- Certifications
- News and announcements
- Image galleries
- Downloads and documents
- Calls to action
- Contact forms

Avoid excessive custom development where existing Apostrophe widgets already meet the requirement.

Do not duplicate data across pages unnecessarily.

Preserve compatibility with the current database abstraction.

Do not select PostgreSQL for production.

## Phase F — Editorial experience and design specification

Define how a nontechnical Assurer staff member will:

1. Create a corporate page.
2. Select an appropriate template.
3. Add and rearrange sections.
4. Edit product information.
5. Replace images.
6. Create a new group-company profile.
7. Add news and updates.
8. Save drafts and publish.
9. Preview responsive layouts.
10. Maintain consistent branding.

Assess existing editor capabilities and identify actual gaps.

Prepare:

- Component inventory.
- Reusable template recommendations.
- Desktop/tablet/mobile design requirements.
- Typography and spacing principles.
- Image aspect-ratio guidance.
- Accessibility requirements.
- Navigation behavior.
- Brand asset requirements.

Do not invent official brand colors or logos. Identify what must be supplied or verified.

## Phase G — SEO and migration architecture

Prepare a migration plan covering:

- Current-to-target URL mapping.
- 301 redirects where URLs change.
- Titles and descriptions.
- Canonical links.
- XML sitemap.
- Robots directives.
- Structured-data opportunities.
- Image filenames and alt text.
- Internal links.
- Pagination and archive URLs.
- Multilingual requirements, if applicable.
- Broken-link detection.
- Search Console validation after launch.

Distinguish implemented features from planned features.

Do not change live URLs or submit any sitemap.

## Phase H — Future AI page-building compatibility

Consider our future goal of integrating Claude, OpenAI or Gemini APIs into an editor-assisted page composition workflow.

Design the content model so an AI assistant could eventually produce structured, validated, editable drafts using approved Apostrophe widgets.

Requirements:

- Native editable content.
- Schema validation.
- Draft-only AI output.
- Human review before publication.
- Server-side API keys.
- Explicit permissions.
- No arbitrary executable code generation within pages.
- Usage limits and audit records.

Do not implement AI integration during M1-013.

Do not introduce paid page-builder dependencies.

## Phase I — Risk and gap analysis

Identify:

- Information missing from WordPress.
- Required business content.
- Required brand assets.
- Missing photography or documents.
- Existing component limitations.
- Content duplication.
- SEO risks.
- Migration complexity.
- Accessibility issues.
- Potential security or privacy concerns.
- Editorial training requirements.

Provide a prioritized implementation plan.

Separate essential launch requirements from desirable later improvements.

## Phase J — Verification

This task is mainly research and architecture.

Validate all referenced internal project files and documentation links.

Run relevant existing lint, build and tests if any code or configuration changes.

Use Claude in Chrome for read-only review of the live website and local CMS, where available.

For any local UI prototype, follow the mandatory browser acceptance checklist and use disposable content.

Do not claim a feature is implemented merely because it appears in the design specification.

Record verified versus proposed behavior.

## Phase K — Deliverables

Create descriptive, dated prompt and execution report files.

Suggested:

docs/engineering/prompts/YYYY/MM/YYYY-MM-DD-m1-013-corporate-content-architecture.prompt.md

docs/engineering/reports/YYYY/MM/YYYY-MM-DD-m1-013-corporate-content-architecture.report.md

Create appropriate planning documents such as:

- docs/content/wordpress-site-inventory.md
- docs/content/corporate-information-architecture.md
- docs/content/apostrophe-content-model.md
- docs/content/seo-and-migration-plan.md
- docs/content/editorial-and-design-requirements.md

Create docs/content/ only if consistent with repository standards.

Update:

- docs/engineering/decision-register.md
- docs/engineering/INDEX.md
- docs/milestones/m1-execution-plan.md
- docs/milestones/m1-handoff.md

Include owner decisions required before page implementation.

Do not alter historical execution reports.

## Phase L — Git workflow

Create a short-lived feature branch from verified main.

Keep changes documentation-only unless a small, isolated prototype is specifically required and clearly justified.

Review the diff.

Scan for secrets.

Commit using Conventional Commits.

Push the feature branch normally.

Provide a compare URL for the owner.

Do not push directly to main.

Do not merge automatically.

Do not deploy.

## Required final report

Report:

1. Verified main SHA and PR #14 merge.
2. PR #14 hosted CI status with URLs.
3. Live website discovery findings.
4. Number of pages/URLs inventoried and inventory completeness.
5. Proposed sitemap and navigation.
6. Apostrophe content architecture.
7. Reusable widgets and templates.
8. Editorial UX requirements.
9. SEO migration strategy.
10. Missing content and design assets.
11. Implementation priorities.
12. Unresolved architectural and business decisions.
13. Exact documentation paths.
14. Tests and browser verification performed.
15. Feature branch, commit SHA and PR compare URL.
16. Recommended next engineering task.

STOP after reporting.

Await architectural review before beginning page-by-page implementation.

Recommend starting a NEW Claude Code session for the next major implementation phase to reduce context and token usage.
