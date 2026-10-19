# Database strategy — investigation and ADR

| | |
|---|---|
| **Task** | m0-003 |
| **Date** | 2026-10-19 |
| **Scope** | Investigate and document the database and media strategy (Task 2 of the m0-002 prompt). Documentation and non-destructive verification only; no migration. |
| **Prompt** | [`2026-10-19-m0-002-engineering-governance.prompt.md`](../../../prompts/2026/10/2026-10-19-m0-002-engineering-governance.prompt.md), Task 2 |
| **Branch / commit** | Not a git repository (no branch, no commit). See the m0-002 report. |
| **Decision** | [ADR-0002 — Database and media storage strategy](../../../../architecture/decisions/ADR-0002-database-strategy.md) (Proposed) |
| **Related** | [m0-002 report](./2026-10-19-m0-002-engineering-governance.report.md) · [backup/restore runbook](../../../../runbooks/database-backup-and-restore.md) · [new-site runbook](../../../../runbooks/new-site-initialization.md) |

## Requirements

Document the preferred architecture: SQLite locally and for tests; PostgreSQL for staging and
production subject to verification; Apostrophe-native APIs only, with no ORM, parallel database
or raw SQL for content; independent database and media per site; portable export and restore. Then
investigate the seven topics: migration, JSONL export/restore, media, permissions and versions,
adapter limitations, production backup and recovery, and new-site initialisation. Do not execute
the migration.

## Work completed

1. Read `@apostrophecms/db-connect` 1.1.0 as installed: README, `docs/*.md`, `lib/dump.js`,
   `lib/restore.js`, `adapters/postgres.js` (connection, auto-create, table DDL), the SQLite
   adapter (pragmas) and the CHANGELOG. Read the core `@apostrophecms/uploadfs` and
   `@apostrophecms/attachment` modules (storage backends, tasks, file-disable behaviour) and
   `doc-type` (`revertPublishedToPrevious`).
2. Inspected the M0 database read-only: modes, user/role storage, version records, migration
   records, attachment metadata.
3. **Non-destructive JSONL round trip** (server stopped): dumped the M0 SQLite database to a
   temporary scratch directory, restored it into a **new scratch SQLite file**, compared, ran
   `migrate` against the scratch copy, then **deleted both** (they contained password hashes and
   live tokens). The project database was never a restore target.
4. Wrote ADR-0002 and two runbooks.

PostgreSQL was **not** installed or connected. No migration was executed.

## Files changed

| Status | Path |
|---|---|
| A | `docs/architecture/decisions/ADR-0002-database-strategy.md` |
| A | `docs/runbooks/database-backup-and-restore.md` |
| A | `docs/runbooks/new-site-initialization.md` |
| A | `docs/runbooks/README.md` |
| A | `docs/engineering/reports/2026/10/2026-10-19-m0-003-database-strategy.report.md` (this file) |

(Governance files are listed in the m0-002 report.)

## Tests executed and actual results

| # | Command / check | Result |
|---|---|---|
| 1 | `npx apos-db-dump "sqlite://./data/vcl-assurer-group.db" --output=<scratch>/dump.jsonl` | OK. 163 lines; 12 collection headers; 43 `aposDocs`, 15 `aposAttachments`, 34 `aposDocsVersions`, 33 `aposMigrations`, 6 `aposFormSubmissions`, 7 `sessions`, 10 `aposBearerTokens`, 1 `aposUsersSafe`, 2 `aposNotifications`, 0 `aposCache`/`aposJobs`/`aposLocks` |
| 2 | `sha256sum` of the source database before and after the dump | **Changed.** `integrity_check` = ok, row counts unchanged. Cause: the SQLite adapter opens the database read-write with `journal_mode=WAL` (`adapters/sqlite.js:2450`). |
| 3 | `npx apos-db-restore "sqlite://<scratch>/restored.db" --input=<scratch>/dump.jsonl` | OK |
| 4 | Row counts, source vs restored, for all 12 collections | **All equal** |
| 5 | JSON comparison of all `aposDocs` documents | **43/43 identical** |
| 6 | FTS tables in the restored file | **Missing** (`no such table: aposDocs_fts`). Text index not in the dump. |
| 7 | `APOS_DB_URI=sqlite://<scratch>/restored.db node app @apostrophecms/migration:migrate`, then FTS check | FTS rebuilt: 43 rows; test search "protection" → 2 hits |
| 8 | Project database `integrity_check` and `aposDocs` count after the investigation | ok; 43 |
| 9 | Regression after documentation changes: lint, `npm run test:smoke`, `editor-workflow-test.mjs`, `--verify-only` | clean, 14/14, 15/15, 7/7 |

Not executed: any PostgreSQL step, the `tar` media backup commands, `pg_dump`, cloud storage.

## Security observations

- **Dumps are credential-bearing.** They contain password hashes, session IDs, API bearer
  tokens and form-submission personal data. `.gitignore` now excludes `*.jsonl`, `*.dump`,
  `*.sql`, `*.db*`, `*.sqlite` and `/backups`. The runbook requires encryption and restricted
  storage.
- **Restore is destructive** (`deleteMany({})` per collection) and non-atomic. The runbook forbids
  restoring over a live database.
- The PostgreSQL adapter will `CREATE DATABASE` if the target is missing. The ADR requires a
  pre-created database and an application role without `CREATEDB` in production.
- Archived media is hidden with `chmod 0000` on local disk. Use
  `APOS_UPLOADFS_DISABLED_FILE_KEY` in production so backups can read it.
- The scratch dump and restored copy were deleted after the test.

## Known limitations

- PostgreSQL compatibility is **documented but unverified**. The acceptance test (ADR-0002 §6)
  is the gate.
- The SQL adapters are young (1.0 in Aug–Sep 2026; PostgreSQL fixes in 1.1.0). Maturity risk
  remains until the acceptance test and some staging time.
- The JSONL dump is not snapshot-consistent; it needs a write freeze.
- Search relevance will differ between SQLite (BM25) and PostgreSQL (`ts_rank`, `simple`).
- No "sanitize after restore" task exists yet for copying production into lower environments.
- Documentation discrepancy upstream: the README's JSONL header keys differ from the code's.

## Unresolved decisions

See [decision register](../../../decision-register.md): **D-DB-1** (accept ADR-0002),
**D-M0-2 / D-DB-1** (PostgreSQL acceptance test), **D-DB-2** (provider), **D-DB-3** (media
storage), **D-DB-4** (RPO/RTO).

## Rollback guidance

Documentation only. To roll back, delete the files listed under "Files changed". The
`.gitignore` additions are covered in the m0-002 report. No database, media or application change
needs reverting.

## Recommended next step

Approve or revise ADR-0002. Then schedule the PostgreSQL acceptance test (ADR-0002 §6) as the
first Milestone 1 task, in an isolated environment, with its own task ID and report.
