# m1-010 — Hosted CI verification and PostgreSQL compatibility acceptance

| | |
|---|---|
| **Task** | m1-010 |
| **Date** | 2026-10-20 |
| **Scope** | Verify the m1-009 GitHub-hosted CI and close D-CI-1. Then run the ADR-0002 §6 PostgreSQL acceptance test in a disposable local environment and recommend an outcome. |
| **Prompt** | [2026-10-20-m1-010-postgresql-compatibility-acceptance.prompt.md](../../prompts/2026/10/2026-10-20-m1-010-postgresql-compatibility-acceptance.prompt.md) |
| **Branch / commit** | `test/m1-010-postgresql-acceptance` from `origin/main` `d0f4a05`. The commit is the one that adds this report (documentation only). |
| **Related** | [ADR-0002 §9](../../../architecture/decisions/ADR-0002-database-strategy.md#9-acceptance-test-result-m1-010) · [m1-009 report](./2026-10-20-m1-009-ci-and-security-scanning.report.md) · D-CI-1, D-GIT-9, D-M0-2, D-DB-5 (new), D-DB-6 (new) · PR #11 |

## Requirements

- **Phase A (stop gate).** Prove from GitHub, not from local runs, that all five m1-009 jobs are
  green on the merged commit and on the push to `main`.
- **Phases B–E.** Assess the PostgreSQL adapter and set up a disposable, local-only PostgreSQL
  with generated test credentials. Test 15 feature areas on a fresh database, and test migration
  separately on copies. Run browser checks as a non-admin.
- **Rules.** Never touch the owner's SQLite database or media, and never patch Apostrophe core.
- **Phase F.** Recommend A, B or C.
- **Phases G–H.** Write the records and push a feature branch. No merge or deploy.

## Work completed

### Phase A — m1-009 hosted CI: PASS

- `git fetch`: `origin/main` = **`d0f4a05`**, "Merge pull request #11 from
  mimnets/ci/m1-009-github-actions". Its second parent is `f865005`, the m1-009 head. The local
  tree was clean.
- **Access method.** `gh` is not installed. The repository's Actions API is publicly readable,
  so the runs were read **unauthenticated and read-only** through the GitHub REST API
  (`/actions/runs`, `/runs/{id}/jobs`, `/jobs/{id}`). No token was used and no setting was
  changed.

| Job | PR run [39371036394](https://github.com/mimnets/vcl-assurer-group/actions/runs/39371036394) (`pull_request`, `f865005`) | Push-to-`main` run [39371047122](https://github.com/mimnets/vcl-assurer-group/actions/runs/39371047122) (`push`, `d0f4a05`) |
|---|---|---|
| lint | completed / success, [job](https://github.com/mimnets/vcl-assurer-group/actions/runs/39371036394/job/118458726105) | completed / success, [job](https://github.com/mimnets/vcl-assurer-group/actions/runs/39371047122/job/118458760049) |
| build | completed / success, [job](https://github.com/mimnets/vcl-assurer-group/actions/runs/39371036394/job/118458726128) | completed / success, [job](https://github.com/mimnets/vcl-assurer-group/actions/runs/39371047122/job/118458759921) |
| test | completed / success, [job](https://github.com/mimnets/vcl-assurer-group/actions/runs/39371036394/job/118458726156) | completed / success, [job](https://github.com/mimnets/vcl-assurer-group/actions/runs/39371047122/job/118458760060) |
| secrets | completed / success, [job](https://github.com/mimnets/vcl-assurer-group/actions/runs/39371036394/job/118458726079) | completed / success, [job](https://github.com/mimnets/vcl-assurer-group/actions/runs/39371047122/job/118458759800) |
| audit | completed / success, [job](https://github.com/mimnets/vcl-assurer-group/actions/runs/39371036394/job/118458726199) | completed / success, [job](https://github.com/mimnets/vcl-assurer-group/actions/runs/39371047122/job/118458759941) |

- Step level (main run): both suite steps of `test` ran ("Unit tests…" and "Smoke, editor
  workflow and persistence on a throwaway database"); none was skipped. `secrets` ran the
  checksum-verified gitleaks install and the full-history scan. `audit` ran the baseline gate.
  `test` took 47 s.
- **Closed:** D-CI-1 (hosted CI verified) and D-GIT-9 (PR #11 merged). The GitHub-side
  negative tests G1–G4 from m1-009 are still **NOT TESTED**. They were optional and need the
  owner's approval.

### Phase B — adapter assessment

- `apostrophe` **4.34.0** and `@apostrophecms/db-connect` **1.1.0** are the latest published
  versions (npm registry, 2026-10-20). `pg` is 8.23.1. The GitHub advisory database lists no
  advisories against `@apostrophecms/db-connect`; GHSA-j5rq-xfvr-p969 is fixed in 1.1.0.
- **Supported schemes** (`adapters/postgres.js`): `postgres://`, `postgresql://`, and
  `multipostgres://` (not used, ADR-0002 Decision 4).
  - Single-database mode stores every collection as a table `(_id TEXT, _order SERIAL, data
    JSONB)` in `public`.
  - Text search uses `to_tsvector('simple')`, a GIN index and `ts_rank`.
- **Database creation.** If the database is missing, the adapter connects to `/postgres` and
  issues `CREATE DATABASE`. With a role that lacks `CREATEDB`, that fails, which is the intended
  production behaviour (ADR-0002 §1). Here the databases were pre-created.
- **Repository configuration.** `app.js` selects the database only through `APOS_DB_URI`.
  Nothing else in the project is engine-specific. The `assurer-test:ensure-admin` guard
  deliberately refuses any non-SQLite URI, so the PostgreSQL accounts were created with core
  `@apostrophecms/user:add`, with the password piped on stdin.
- **Documented constraints** (atomicity, aggregation, array indexes, no stemming) are unchanged
  from ADR-0002 §1 and §7. Phase D found **one undocumented defect**: there is no pool `error`
  handler (see D15b).
- No patch was made to Apostrophe core or to any `node_modules` package.

### Phase C — disposable environment

| Item | Value |
|---|---|
| Runtime choice | No Docker, Podman, WSL distribution or PostgreSQL was present. **Owner chose** the official portable binaries (prompt record, decision 1). |
| Binaries | PostgreSQL **16.15** Windows x64 binaries zip from `get.enterprisedb.com` over HTTPS (the download postgresql.org links to). 332,441,502 bytes, SHA-256 `25E6FCDFB8CAEC38691BF461125E7564508760666F7B8E5DC6A5F0818F58F81E`. Only `bin/`, `lib/` and `share/` were extracted. |
| Supply-chain caveat | **72 of 73 executables and DLLs are not Authenticode-signed** (EDB signs its installer, not the zip). EDB publishes no checksum for the zip. Windows Defender scan: no threats. The **owner accepted the risk** for this test (decision 2). Test use only. |
| Install footprint | Session scratch directory only. Run as the user. No installer, service, admin rights, PATH or registry change. Everything was deleted at the end. |
| Network | `listen_addresses = '127.0.0.1'`, port 55432. `pg_hba`: SCRAM-SHA-256 for every connection, including local. |
| Credentials | A superuser (cluster admin only) and the application role `apos_app` (`LOGIN`, no `CREATEDB`, `CREATEROLE` or `SUPERUSER`). Passwords were generated with `crypto.randomBytes`, kept in a scratch file outside the repository and never printed. Test CMS users: `m1-010-pg-admin` (admin), `m1-010-pg-editor` (editor) and `m1-010-browser-editor` (editor, browser only). |
| Databases | `vcl_pg_fresh` (fresh initialisation), `vcl_pg_migrated` (migration of a copy), `vcl_pg_restored` (`pg_restore` target), and `vcl_pg_partial` (failure test, dropped). All were pre-created, owned by `apos_app`, with `PUBLIC` connect revoked. |
| App isolation | As `test:ci` does: an empty dotenv file, so `.env` is not read; a generated session secret; uploads in scratch (`APOS_TEST_UPLOADS_PATH`); `127.0.0.1` on ports 3200–3204. The owner's dev server on `:3000` was never contacted. |
| Owner data | The source for the migration test was a **read-only online backup** (SQLite backup API, source opened `readonly`) taken into scratch. Afterwards the owner's `data/vcl-assurer-group.db` SHA-256 prefix (`2cdfe879…`), its `-wal` and `-shm` mtimes, and `public/uploads` (238 files) were all unchanged. |

### Phase D — test dataset

- **Fresh database:**
  - Core parked pages, plus the demo seed (`assurer-demo:seed`).
  - The existing suites' `/m0-test-page` and two images.
  - The m1-010 dataset, created by `pg-acceptance.mjs` through the REST API only:
    - two image pieces;
    - a parent page with 12 children;
    - `/m1-010-nested`, a hero widget with an image relationship and a page link in an array
      field, plus a layout (2 columns) holding a nested layout holding a nested column holding
      rich text: 4 area levels;
    - an unpublished draft edit;
    - a Global Styles change (`lineHeight` 1.9) made by the editor;
    - two pages for concurrent edits;
    - a crash page.
- **Migration source:** a copy of the M0 SQLite data, with 85 docs, 34 attachments, 69
  versions, 15 form submissions, 33 migrations and 11 sessions.
- The harness scripts lived in the session scratch directory and are not tracked. Their
  behaviour is described here, so the test can be rebuilt.

## Files changed

- A `docs/engineering/prompts/2026/10/2026-10-20-m1-010-postgresql-compatibility-acceptance.prompt.md`
- A `docs/engineering/reports/2026/10/2026-10-20-m1-010-postgresql-compatibility-acceptance.report.md` (this report)
- M `docs/architecture/decisions/ADR-0002-database-strategy.md` (status line; new §9)
- M `docs/engineering/decision-register.md` (D-CI-1, D-GIT-9 closed; D-M0-2 updated; D-DB-5, D-DB-6 added)
- M `docs/engineering/INDEX.md`
- M `docs/milestones/m1-handoff.md`
- M `docs/milestones/m1-execution-plan.md`

No code, dependency or configuration change.

## Tests executed and actual results

Environment key: **PG-F** = `vcl_pg_fresh`; **PG-M** = migrated copy; **PG-R** = `pg_restore`
copy; **SQ-C** = SQLite copy in scratch. All are local-only, PostgreSQL 16.15, Windows 11,
Node 24.21.0.

### Test matrix

| # | Check | Env | Expected | Actual | Status | Evidence | Implication |
|---|---|---|---|---|---|---|---|
| D1 | Fresh initialisation (`migration:migrate` on an empty DB) | PG-F | Tables, parked docs, indexes | Exit 0. 12 tables; home, archive, global and styles docs (draft + published); 33 migrations; 17 indexes on `aposDocs` incl. the GIN `to_tsvector` index. 2 m 29 s, mostly the first asset build. | PASS | psql counts (this report) | Works with a pre-created DB and a role without `CREATEDB` |
| D2 | Administrator authentication | PG-F | Wrong password rejected; login works | `user:add` (stdin password) exit 0. Hash stored only in `aposUsersSafe`. Wrong password → 400; login → token; whoami = admin | PASS | `editor-workflow-test.mjs` 15/15 | — |
| D3 | Editor role and permissions | PG-F | Editor edits and publishes; cannot manage users | Workflow suite 15/15 as editor. User list → 200 with **0 results**. Creating an admin user → 400. Editor changed and published Global Styles (core default, D-M0-11) | PASS | `pg-acceptance.mjs` | Same behaviour as SQLite |
| D4 | Page create, edit, publish | PG-F | Suites pass | Smoke 14/14; workflow 15/15 (admin) and 15/15 (editor) | PASS | suite output | — |
| D5 | Draft/published separation | PG-F | Drafts never public | New page 404 before publish. Unpublished edit hidden from public, kept in draft. Anonymous REST draft read → 403; anonymous user list → 404 | PASS | `pg-acceptance.mjs`; DB rows `:draft` contain the marker, `:published` do not | — |
| D6 | Pieces and widgets | PG-F | Pieces stored; widgets render | Image pieces created and published. Hero, slideshow, product cards, form, rich-text, image and layout widgets render (smoke + nested page) | PASS | smoke; `/m1-010-nested` | — |
| D7 | Nested areas (4 levels) | PG-F | Deep content stored and rendered | Level-4 text rendered publicly and kept after restart. The stored JSONB tree matches the REST read | PASS | `e1-nested-columns-1440.jpg` | — |
| D8 | Relationships | PG-F | Joins resolve; reverse ids kept | `_backgroundImage` (widget) and `_linkPage` (inside an array field) join after publish and after restart. Image `relatedReverseIds` contains the page. Published HTML links the related page | PASS | `pg-acceptance.mjs` | — |
| D9 | Image and media metadata | PG-F, PG-M | Metadata matches files | Attachment 1600×900, png, group images. 13 attachments → **91 files** (original + 6 sizes), 0 missing. Migrated copy: 34/34 originals present | PASS | file and row cross-check | Media and DB must be backed up as a pair (ADR-0002 §3) |
| D10 | Form submission persistence | PG-F | Valid submission stored, invalid ones rejected | Smoke: CSRF missing 403, empty 400, bad email 400, oversized 400, valid 200. `aposFormSubmissions` = 1 row with `formId`, `createdAt` and data | PASS | smoke + psql | — |
| D11 | Global Styles persistence | PG-F | Value stored, published, served, kept after restart | `lineHeight` 1.9 in the draft and published rows. Served in the versioned stylesheet `/api/v1/@apostrophecms/styles/stylesheet/…` as `line-height: 1.9`; kept after restart | PASS | `pg-acceptance.mjs` verify | First run's check was wrong (looked for inline CSS). Fixed and re-run; see Known limitations |
| D12 | Restart durability | PG-F | All state persists | Persistence 7/7 and m1-010 verify **10/10** after a restart. The editor's browser session also survived a restart (sessions are in PostgreSQL) | PASS | suite output; browser E5 | — |
| D13 | Search and indexing | PG-F, PG-M vs SQ-C | Matches as on SQLite | PG-F: title word found, case-insensitive, no false match, no stemming. 10 queries on the same data: **identical result sets** on PostgreSQL and SQLite. Index survives restart | PASS (matching) | `search-cmp.mjs` | Relevance **ordering** (`ts_rank` vs BM25) was not compared |
| D13b | Page order with 12 siblings | PG-F | Child 10–12 after 9 | Ranks 0–11 in order (REST and admin Pages UI) | PASS | E2 | 1.1.0 sort fix confirmed |
| D13c | Concurrent edits (2 users, 2 pages) | PG-F | No error, no lost update | 10 interleaved saves each; both pages published their last revision | PASS | `pg-acceptance.mjs` | Same-page concurrency not tested (the UI uses an advisory editing lock) |
| D13d | Connection-pool soak, 15 min | PG-F (2 app instances) | No errors; connections stable | 907 s, 56,359 requests (~62/s), **0 errors**. PG connections 8–13 (31 samples), no growth; app alive at the end | PASS | `soak.mjs` | 1.1.0 leak fix confirmed under this load |
| D14a | `pg_dump -Fc` (live) → `pg_restore` into a new DB | PG-F → PG-R | Identical data; app works | Exit 0, 80 KB. Counts identical (60 docs, 13 att., 40 versions, 2 safe, 1 form, 33 migrations, 41 indexes); `aposDocs` md5 identical. On PG-R: smoke 14/14, persistence 7/7, verify 10/10 | PASS | psql, suites | Native backup is consistent without stopping the app |
| D14b | JSONL round trip PG → SQLite | PG-F → SQ | Identical | `apos-db-dump` → `apos-db-restore` into a new SQLite file → re-dump: 6/6 collections, **0 differing docs** | PASS | `cmp-jsonl.cjs` | Engine exit path back to SQLite works |
| M1 | **Migration:** SQLite copy → JSONL → empty PG | SQ-C → PG-M | Full fidelity | 262 lines restored in 1.5 s. All 8 collections identical (85 docs, 34 att., 11 sessions, 1 job, 2 safe, 69 versions, 15 forms, 33 migrations). Text index absent → rebuilt by `migrate`; no migration re-run | PASS | `cmp-jsonl.cjs` | The supported path (ADR-0002 §1) works on this project's data |
| M2 | Migrated site works | PG-M | Pages, login, media | `/`, `/m0-test-page`, `/acceptance-test` 200; unknown 404. Persistence 7/7 with the `.env` test admin | PASS | suite output | — |
| M3 | Secrets carried by migration | PG-M | Known | 11 **sessions** and 2 password hashes were copied | Observed | psql | Needs the "sanitize after restore" task before any copy between environments (D-DB-6) |
| D15a | App hard-killed during a write stream | PG-F | Last acknowledged write kept; no stuck lock | Writer got ECONNRESET after rev 55; draft = rev 55. Stale `page:tree` lock taken over after restart; page create 200 | PASS | psql | — |
| D15b | **PostgreSQL crash** (`pg_ctl stop -m immediate`) with the app running | PG-F | App reports errors and recovers when PG returns | **The app process exited** with an unhandled `'error'` event: `read ECONNRESET` from `pg-pool` `idleListener`. db-connect 1.1.0 attaches no pool `error` listener | **FAIL** | app log (stack only, no data) | **Blocker for shared/production use (D-DB-5)**: any DB restart, failover or idle drop kills the app. Mitigate with a restart supervisor; report upstream |
| D15c | PostgreSQL crash recovery | PG-F | WAL redo; data consistent | "automatic recovery in progress … redo done", ready in ~5 s. Rev 55 intact; persistence 7/7; verify 10/10 after the app restarted | PASS | pg log | — |
| D15d | Failed restore (truncated JSONL) | new DB | Fails safely | Exit 1, but **partial**: 9 tables, 85 docs, 0 versions, no `aposMigrations` or forms. DB dropped | PASS (as documented) | psql | Always restore into a new DB and discard it on failure (ADR-0002 §2) |
| R1 | Repository checks | local | Clean | `npm run lint` 0 problems · `test:unit` **24/24** · `test:ci` (isolated SQLite) all 7 steps PASS | PASS | — | — |
| R2 | Dev-server suites (`test:smoke`/`test:workflow`/`test:persistence` on `:3000`) | — | — | Not run: `test:workflow` writes to the owner's SQLite DB, which this task forbade. `test:ci` covers the same suites on a throwaway DB | NOT TESTED | — | Deviation from the AGENTS.md default, by design |

### Browser acceptance

Claude in Chrome, the owner's Chrome, a dedicated MCP tab group (closed afterwards). App
instance `:3204` on **PostgreSQL** `vcl_pg_fresh` (a second process on the same database as the
soak instance). Account `m1-010-browser-editor` (**editor**, not admin). **Agent-executed; not
human acceptance.** The checklist was written from this task's goal before running: UI editing,
draft isolation, publish, persistence after restart, logged-out access, three viewports.

| # | Check | Role / viewport | Steps | Expected | Actual | Status | Evidence |
|---|---|---|---|---|---|---|---|
| E1 | Log in through the UI | editor / 1440 | `/login`, type username and password, click Login | Admin bar; no Users menu | Logged in; admin bar with Pages, Images, Files, Forms; no Users | PASS | screenshots viewed (not saved) |
| E2 | Page tree order | editor / 1440 | Pages manager | Child 1…11 in order | Child 1–11 in numeric order, Draft badges | PASS | viewed |
| E3 | Create page and save draft | editor / 1440 | New Page → title → Add Content → Rich Text → type → Save Draft | "Draft saved"; not public | Toast "Draft saved". Logged-out `curl` → **404** on both instances | PASS | — |
| E4 | Edit in place and publish | editor / 1440 | Open page → Edit → type → Publish | Public shows the edit | "Your changes have been published". Public HTML contains the edit | PASS | — |
| E5 | Unpublished edit, restart, persistence | editor / 1440 | Type a marker (autosave) → restart `:3204` → reload | Draft keeps the marker; public does not; still logged in | DB: `:draft` has the marker, `:published` does not. After restart: public without the marker; editor still logged in and sees it in the draft | PASS | — |
| E6 | Log out; logged-out view | logged out / 1440 | User menu → Log Out → `/m1-010-nested` | No admin bar; nested content | No admin bar, level-4 text, hero link, no unpublished text, overflow 0 px | PASS | `e1-nested-logged-out-1440.jpg`, `e1-nested-columns-1440.jpg` |
| E7 | Tablet and mobile layout | logged out / 768, 375 | Window resize did not apply (`innerWidth` stayed 1440). The pages were loaded in same-origin iframes of exactly 768 and 375 px (real CSS viewports) | No overflow; content visible | Home, browser page and nested page: overflow **0 px**; columns stack (328 px); content visible | PASS (iframe method) | `e4-home-iframe-768.jpg` |
| E8 | Image upload in the UI | — | — | — | Not run. Files uploaded under `APOS_TEST_UPLOADS_PATH` are not served over HTTP, so previews would be broken. Upload metadata is covered by D9 through the REST API | NOT TESTED | — |
| E9 | Global Styles through the UI | — | — | — | Not run in the browser. Covered by D11 (REST, as editor) and by m0-007 on SQLite | NOT TESTED | — |

Note on E7: at first the nested columns were hidden at 768 and 375 px. The cause was the test
data: columns created through REST without `showTablet` and `showMobile` were stored as
`false`, whereas the UI applies `def: true`. They were set to `true` through REST (as editor)
and re-measured. That publish also published the deliberate unpublished edit on that page
(D5 had already passed).

## Data integrity findings

- No data loss or corruption in any test. Every comparison (counts, md5, per-document JSON)
  was identical. No acknowledged write was lost after an app kill or a database crash.
- Non-atomic restores leave partial databases (D15d), and dumps carry sessions and hashes (M3).
  Both were already documented, and both are now confirmed on this project's data.

## Security observations

- No secret, password, token or personal data is in any tracked file. Generated credentials
  lived only in the session scratch directory, which was deleted (cluster, dumps, the copy of
  the owner's DB with its hashes and sessions, and the secrets file).
- The browser-only editor's password had to be typed into the local login form, so it appears
  in the agent's session transcript. It existed only in the disposable database, which is
  deleted.
- Unsigned PostgreSQL binaries (owner-accepted, test only). They must never be used for staging
  or production; use a managed service or signed or distribution packages.
- D-DB-5 is an availability risk, not a confidentiality risk.
- Secret check before commit: gitleaks is **not installed locally** in this session. The staged diff was checked with a pattern search (long hex/base64 strings, connection URIs with credentials, token prefixes, private keys) and for the one password typed in the browser: **no secrets**; the only long hex string is the public SHA-256 of the PostgreSQL zip. The CI `secrets` job (gitleaks, full history) runs on the PR.

## Known limitations

- Windows, not Linux. Production will run Linux and a managed PostgreSQL. Repeat the test there
  (D-DB-6).
- PostgreSQL 16 only. ADR-0002 says 14 or later; the managed-service version is not chosen yet
  (D-DB-2). 17 and 18 are current.
- Search relevance *ordering* was not compared. Same-page concurrent editing and TLS
  (`sslmode`) connections were not tested.
- The soak is light load (≈62 req/s, 8 workers), not a performance test.
- E8 and E9 were not tested in the browser; window resizing failed and iframes were used for E7.
- Test-script defects found and fixed during the run, so they are not product results:
  - The Global Styles check first looked for inline CSS.
  - A CRLF bug in a file check.
  - Missing layout breakpoint fields in the REST test data.
- The pre-crash md5 for D15c was not printed. Consistency rests on the persistence suites and
  the last-write check instead.
- The harness is not tracked, so a re-run needs rebuilding from this report. Adding a
  PostgreSQL CI job is a candidate follow-up.

## Phase F — architecture comparison and recommendation

| Criterion | PostgreSQL (verified here) | MongoDB fallback (not tested here) |
|---|---|---|
| Compatibility | Every project feature and the existing suites pass; documented operator limits (ADR §7) do not affect current code | Core's original engine; widest use |
| Data integrity | Identical round trips; WAL crash recovery; no lost acknowledged write | Mature; not measured for this project |
| Migration feasibility | **Proven** on a copy of the M0 data with the supported tools | The same supported JSONL tools apply; not tested |
| Operational complexity | One familiar engine; managed services common; **needs a restart supervisor until D-DB-5 is fixed** | Adds a database family the team does not run (ADR-0002) |
| Backup and restore | `pg_dump`/`pg_restore` consistent while running; PITR available on managed services | `mongodump`/managed snapshots; not tested |
| Deployment suitability | Good once D-DB-5 is mitigated | Good; the driver reconnects automatically |
| Maintainability | JSONB tables, no schema to maintain; adapter about 2 months old | Thin wrapper over the official driver |
| Long-term support | PostgreSQL 16 supported to 2028-11; adapter young; one defect found in 15 areas | Longest track record in Apostrophe |

**Recommendation: B — PostgreSQL provisionally accepted with defined blockers** (D-DB-6). Use it
for further development and CI now. Before staging:

1. Resolve or mitigate D-DB-5: report it upstream, run under a supervisor with restart and
   health checks, and re-run D15b on each db-connect release.
2. Repeat the acceptance test on Linux with the chosen managed version, including TLS.
3. Build and review the "sanitize after restore" task.
4. Decide D-DB-2, D-DB-3 and D-DB-4.

Rejecting PostgreSQL (C) is not justified. The single failure is an upstream error-handling
defect with a standard operational mitigation, not a data-integrity problem. ADR-0002 is **not**
changed to a final production commitment.

## Unresolved decisions

- **D-DB-6 (new):** owner's decision on the recommendation (architectural review).
- **D-DB-5 (new):** the connection-loss crash. Upstream report and mitigation.
- D-M0-2: executed; closes with D-DB-6.
- D-DB-2, D-DB-3 and D-DB-4: unchanged.
- D-M0-5: unchanged; the audit baseline is reviewed in m1-011.
- Closed in this task: D-CI-1, D-GIT-9.

## Rollback guidance

Documentation only. Before merge, close the PR and delete the branch. After merge, revert the
commit. No data, code or settings were changed, and nothing outside the repository needs undoing:
the scratch environment has been deleted.

## Recommended next step

1. The owner reviews this report and decides D-DB-6 (architectural review), and files or
   approves the upstream report for D-DB-5.
2. Merge the m1-010 PR after review.
3. Start the next task (`m1-011`, security hardening, or a PostgreSQL CI job if the owner wants
   one first) in a **new Claude Code session**.
