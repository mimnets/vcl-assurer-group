# Runbook: Database and media backup and restore

| | |
|---|---|
| **Status** | Draft. **Verified 2026-10-19 (`m0-003`):** SQLite `apos-db-dump`, `apos-db-restore` into a fresh file, and `migrate` rebuilding search. **Not executed:** the `tar` media steps and all PostgreSQL steps (pending the acceptance test in ADR-0002 §6). |
| **Decision** | [ADR-0002](../architecture/decisions/ADR-0002-database-strategy.md) |
| **Audience** | Operators with access to the target environment's secrets |

> **Safety rules**
> - A restore **deletes** the target's data, collection by collection. Never restore over a live
>   database. Restore into a new, empty one, verify it, then switch.
> - Dumps contain password hashes, session and API tokens, and personal data. Store them
>   encrypted, in `backups/` locally (git-ignored) or a restricted bucket. Never attach them to
>   tickets or chat.
> - Database and media are a pair. Back them up from the same quiet point and restore both.

## A. Local (SQLite) backup

```sh
# 1. Stop the app (dumps are not snapshot-consistent while writes happen)
# 2. Portable dump
npx apos-db-dump "sqlite://./data/vcl-assurer-group.db" --output="backups/$(date +%F)-local.jsonl"
# 3. Media
tar -czf "backups/$(date +%F)-uploads.tgz" public/uploads
```

Expected: the dump has one header line per collection (12 in M0) followed by one line per document.

## B. Restore into a fresh local database

```sh
npx apos-db-restore "sqlite://./data/restore-test.db" --input=backups/<date>-local.jsonl
APOS_DB_URI="sqlite://./data/restore-test.db" node app @apostrophecms/migration:migrate   # rebuilds search index
tar -xzf backups/<date>-uploads.tgz          # only into a matching checkout
```

**Verify:**
- `npm run test:smoke` passes against the restored database.
- Site search returns results. It will not until step 2 (migrate) has run.

## C. Production (PostgreSQL) — primary backup (not yet executed)

- Preferred: the managed provider's point-in-time recovery (WAL archiving) with ≥ 14-day retention.
- Otherwise run a nightly consistent snapshot:
  `pg_dump -Fc -d "$DATABASE_URL" -f backups/<date>.pgdump`, then copy it to the backup bucket.
- Media: bucket object versioning plus replication; or a nightly `rsync` of `public/uploads` when
  storage is local.

## D. Production — portable export (not yet executed)

At each release, and before any migration:
1. Enable maintenance mode or stop the app.
2. `npx apos-db-dump "$APOS_DB_URI" --output=backups/<date>-release-<id>.jsonl`
3. Snapshot the media.
4. Resume the app.

## E. Recovery procedure (not yet executed)

1. Declare the incident and record the target recovery time.
2. Create a **new** database, from PITR, `pg_restore`, or `apos-db-restore` of the JSONL export.
3. Restore media from the same point.
4. Run `node app @apostrophecms/migration:migrate` against the new database.
5. Run the smoke test and the editor workflow test against an isolated URL.
6. Switch `APOS_DB_URI`, restart, and monitor.
7. Write an incident report under `docs/engineering/reports/`.

## F. Copying production data into a lower environment

Not allowed without approval. If approved:
- Restore into the lower environment.
- Invalidate all sessions and bearer tokens.
- Rotate `APOS_SESSION_SECRET`.
- Assess the form submissions (personal data) before restoring them.

A reviewed Apostrophe task for this sanitisation is a Milestone 1 proposal; it does not exist yet.

## G. Drill schedule

Quarterly restore drill into an isolated environment. Record the result as a dated report.
