# Deployment principles (reference only)

| | |
|---|---|
| **Status** | Reference notes, **not a procedure**. No deployment is approved (`m0-004`). |
| **Origin** | Kept from the starter kit's Stagecoach `deployment/` hooks and `scripts/sync-*`, which were removed in `m0-004` (see that report for why). |

The removed scripts targeted MongoDB, a placeholder third-party host and the Stagecoach/`forever`
toolchain. None of that applies to this project. The general principles below still do, and should
shape any future deployment design. That design needs its own ADR and approval.

1. **Persistent state lives outside the release directory.** `data/` and `public/uploads` (or the
   media bucket) must survive deployments. Each release is replaceable code only.
2. **Never ship state with code.** Exclude `data/`, `public/uploads`, `public/apos-frontend`,
   `node_modules`, `.env` and `.git` from any release artefact.
3. **Install dependencies on the target** (`npm ci`), because native modules (`better-sqlite3`,
   `sharp`) are platform-specific.
4. **Build, migrate, then switch.** `npm run build` with `APOS_RELEASE_ID`, then
   `node app @apostrophecms/migration:migrate`, then restart. Back up first (ADR-0002, backup
   runbook).
5. **Production mode** (`NODE_ENV=production`) behind a reverse proxy that provides TLS and
   security headers (M0 security review S1–S3).
6. **No data synchronisation scripts that drop or delete.** Moving data between environments
   follows the backup/restore runbook (restore into a new, empty target; sanitise lower
   environments).
