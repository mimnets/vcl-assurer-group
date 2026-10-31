# m1-018 start handoff: SEO plumbing (CA-3)

| | |
|---|---|
| **Prepared** | 2026-10-31, by the agent at the end of m1-017 (agent-executed check; not a human approval) |
| **Task** | `m1-018`: CA-3, SEO plumbing ([plan](../content/implementation-plan-and-risks.md#2-prioritised-implementation-plan), [SEO and migration plan](../content/seo-and-migration-plan.md)) |
| **Branch** | Create `feat/m1-018-seo-plumbing` from `origin/main` after this handoff is merged |
| **Session** | Start a **new Claude Code session** for this task (AGENTS.md, Sessions and context) |
| **Read first** | [AGENTS.md](../../AGENTS.md) (No unapproved dependencies; Git and approvals; Browser acceptance testing) · [INDEX](../engineering/INDEX.md) · [decision register](../engineering/decision-register.md) (D-CONTENT-3, D-CONTENT-10) · [SEO and migration plan](../content/seo-and-migration-plan.md) §2–§6 · [ADR-0003](../architecture/decisions/ADR-0003-corporate-content-model.md) · [m1-017 report](../engineering/reports/2026/10/2026-10-31-m1-017-dependency-advisories.report.md) · `lib/link.js`, `views/layout.jsx` |

## 1. State checked on 2026-10-31

| Check | Result |
|---|---|
| `origin/main` | `83c6990`, the merge of PR #20 (m1-017). Hosted CI: all five jobs `success` on the PR run [41182614887](https://github.com/mimnets/vcl-assurer-group/actions/runs/41182614887) and the push-to-`main` run [41182627573](https://github.com/mimnets/vcl-assurer-group/actions/runs/41182627573) |
| `npm run audit:check` | PASS (0 high, 0 critical); 3 moderate/low warnings left as warnings (m1-017) |
| Owner decisions (in session, 2026-10-31) | **D-CONTENT-10:** approved `@apostrophecms/seo`, `@apostrophecms/sitemap` **and** `@apostrophecms/redirect`. **D-CONTENT-3:** legacy page plan approved as proposed |
| Candidate versions (npm, 2026-10-31) | `@apostrophecms/seo` 1.7.1 (MIT; depends on `lodash` ^4.18.1, already in the tree at 4.18.1, MIT) · `@apostrophecms/sitemap` 1.5.1 (MIT; depends on `common-tags` ^1.8.2, already in the tree at 1.8.2, MIT) · `@apostrophecms/redirect` 1.7.1 (MIT; no dependencies) |
| Advisories (GitHub API, 2026-10-31) | `seo`: GHSA-wf43-fpp3-cf65 (high), affects ≤ 1.4.2, fixed in 1.5.0, so 1.7.1 is not affected. `sitemap`, `redirect`: none listed |
| Not done | Nothing installed. `package.json` and `package-lock.json` unchanged |

The owner's approval covers these three packages only. The install still needs the checks in
Phase B; a new advisory, a non-permissive license or any extra package is a stop.

## 2. Scope

In scope (SEO plan §3–§6):
- Install the three approved packages; enable them in `app.js`.
- Titles with a global suffix, meta description, canonical (absolute, from `baseUrl`), Open Graph,
  robots meta with per-page `noindex` and a site-wide `noindex` on non-production hosts.
- `/sitemap.xml` (published pages; excludes `noindex`) and `/robots.txt` (production rules and a
  non-production `Disallow: /`).
- Redirects, one hop each: trailing slash `/x/` → `/x` as a **301** (today core sends 302); soft
  redirects as 301; the legacy WordPress map from SEO plan §2 (D-CONTENT-3), seeded idempotently
  as `@apostrophecms/redirect` records, plus an automated test that requests every old URL and
  checks status and `Location`.
- JSON-LD: `Organization` (global), `WebSite` (home), `BreadcrumbList` (page tree). Product,
  sub-organization and Person data only where the owner has confirmed facts; nothing invented.
- Tests in `test:ci`; `project:` i18n keys; demo content stays labelled "Demo".

Out of scope: search-console submission, host/scheme redirects (hosting level), analytics fields
(leave the `seo` module's analytics options unused), content migration (CA-5), Pro modules.

Decide in the session, from the installed source, and record in the report: whether trailing-slash
301 comes from `@apostrophecms/redirect` or a small project middleware (it must be a single hop),
and how editors may change seeded legacy redirects.

## 3. Gates

- **Dependency install** (Phase B) is approved by D-CONTENT-10 for the three named packages,
  subject to the checks. Any other package needs a new approval.
- A **schema change on existing documents** (new SEO fields) ships as an idempotent
  `@apostrophecms/migration` migration, tested on a copy first (ADR-0002).
- Commit, push and PR need owner approval.

## 4. Phases

| Phase | Work | Stop for |
|---|---|---|
| A | Start-of-session checks: AGENTS.md, this handoff, Git state, baseline `lint`, `test:unit`, `audit:check`. Archive the prompt | — |
| B | `npm install` the three packages (exact versions above or the latest patch). Record every lockfile change; license and advisory check for each new package; `audit:check` must pass | Any extra package, a non-permissive license, a new advisory or a failing gate |
| C | Implement §2. Read the module source in `node_modules/@apostrophecms/{seo,sitemap,redirect}` before configuring | Anything that needs a Pro module or a design outside the plan |
| D | `npm run lint`, `test:unit`, `audit:check`, `build`, `test:ci`; with the dev server, `test:smoke`, `test:workflow`, `test:persistence`; the redirect-map test | Any failure |
| E | Browser checks as a disposable editor (AGENTS.md): edit SEO fields and publish; check `<head>`, sitemap, robots, a legacy redirect and a trailing-slash redirect logged out; draft SEO changes stay hidden; desktop, tablet and mobile if templates change. PASS/FAIL/BLOCKED | — |
| F | Report, INDEX row, decision register (D-CONTENT-3 and -10 implemented), next free ID, handoff for the next task | Owner approval of commit, push and PR |

## 5. Completion checklist

- [ ] Only the three approved packages added; each with version, license and advisory result
- [ ] `audit:check` PASS locally and in hosted CI
- [ ] Every legacy URL in SEO plan §2 tested: one hop, 301, correct `Location`
- [ ] Non-production hosts send `noindex` and `Disallow: /`
- [ ] All suites run and reported with actual results
- [ ] Browser checks recorded (agent-executed)
- [ ] Prompt, report, INDEX and decision register updated; no secrets in any of them
- [ ] Commit, push and PR only after owner approval

## 6. Prompt for the new session

> Start m1-018: CA-3 SEO plumbing. Read AGENTS.md and docs/milestones/m1-018-handoff.md first,
> follow its phases and gates, and stop for approval before any commit or push.
