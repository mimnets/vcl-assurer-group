# Safe git initialization and repository baseline

| | |
|---|---|
| **Task** | m0-004 |
| **Date** | 2026-10-19 |
| **Scope** | Recovery backup; removal of the legacy deploy/sync scripts; test-credential rotation; git safety verification; initial import and push to `github.com/mimnets/vcl-assurer-group`; branch-protection assessment; regression. |
| **Prompt** | [`2026-10-19-m0-004-safe-git-initialization.prompt.md`](../../../prompts/2026/10/2026-10-19-m0-004-safe-git-initialization.prompt.md) |
| **Branch / commit** | `main`. This report is part of the initial commit, so it cannot contain that commit's own SHA. The SHA, push result and remote verification are recorded in the follow-up section **"Post-push results"**, added by a second commit (see below). |
| **Related** | [ADR-0001](../../../../architecture/decisions/ADR-0001-cms-platform-and-starter.md) (accepted) · [ADR-0002](../../../../architecture/decisions/ADR-0002-database-strategy.md) (accepted) · [decision register](../../../decision-register.md) · [git-and-ci.md](../../../git-and-ci.md) · [m0-002 report](./2026-10-19-m0-002-engineering-governance.report.md) |

## Requirements

Tasks 1–8 of the prompt. Approved: ADR-0001, ADR-0002, AGENTS.md standards, the prompt/report
conventions, the initial import and first push (subject to the safety checks), and removal of
the legacy scripts. **Not approved:** production deployment, live database migration, WordPress
changes, mimPortal changes. Stop before pushing if any stop condition is met.

## Work completed

### Task 1 — Standards and state
- Read AGENTS.md, CLAUDE.md, README.md, the m0-002 and m0-003 reports, both ADRs and the
  decision register. No project file had changed since m0-002.
- Local folder: **not a git repository** (no `.git`).
- Remote: `git ls-remote https://github.com/mimnets/vcl-assurer-group.git` returned **no refs**,
  exit 0 (authenticated through the stored Git Credential Manager login, read-only).
- Git identity: the existing global config (`Monirul Islam`, the `mimnets` account e-mail) was
  used as-is, consistent with the repository owner `mimnets`.
- Server stopped before the backup.

### Task 2 — Recovery point
- Location: `C:\Users\VCL-Admin\Documents\vcl-assurer-group-backups\2026-10-19-m0-004-pre-git\`,
  **outside** the repository and never committed or uploaded.
- Contents:
  - `project.tar.gz` (8.5 MB): the whole project including `.env`, `data/` (SQLite) and
    `public/uploads` (119 files). Excludes the regenerable `node_modules`, `apos-build` and
    `public/apos-frontend`.
  - `database.jsonl` (177 KB): a portable `apos-db-dump` export.
  - `SHA256SUMS`.
- Protection: inheritance removed; access limited to the Windows account `VCL-Admin` and
  `SYSTEM` (no Administrators or Users group).
  - First attempt: `icacls /inheritance:r /T` left the **files** with an empty ACL (unreadable,
    even by the owner).
  - Fixed by `icacls /reset` on the children so they inherit the restricted folder ACL.
  - Verified per file.
- **Recovery verified:**
  - `sha256sum -c` OK.
  - Extracted to a scratch directory: all 119 media files byte-identical (SHA-256 per file);
    `.env` identical; restored SQLite `integrity_check` = ok; row counts equal for `aposDocs`,
    `aposAttachments`, `aposUsersSafe`, `aposDocsVersions`, `aposFormSubmissions` and
    `aposMigrations`.
  - The restored copy **booted on port 3100**: `npm run test:smoke` **14/14**, and the
    `/m0-test-page` content was present.
  - The scratch copy was then deleted. Its `node_modules` junction was removed first with
    `rmdir`, and the real `node_modules` was checked intact.
- Not encrypted at rest beyond the NTFS ACL. Recommendation: BitLocker on the drive, or move the
  archive into an encrypted vault.

### Task 3 — Legacy scripts removed (none executed)

| Removed | Why |
|---|---|
| `scripts/sync-up` | `mongorestore --drop` on the **remote** and `rsync --delete` to remote uploads; MongoDB-only; targets the configured host (`staging.apos.dev`, Apostrophe's placeholder) |
| `scripts/sync-down` | `mongorestore --drop` on the **local** database and `rsync --delete` into local `public/uploads`; could wipe the working database and media |
| `deployment/settings`, `deployment/settings.staging` | Stagecoach config: placeholder project `a3-boilerplate`, server `staging.apos.dev`, user `nodeapps` |
| `deployment/dependencies`, `start`, `stop`, `migrate`, `rsync_exclude.txt`, `README` | Stagecoach lifecycle hooks (`forever`, server symlinks); unused |

- Useful principles are preserved in
  [`docs/runbooks/deployment-principles.md`](../../../../runbooks/deployment-principles.md)
  (marked reference only; no deployment approved).
- Reference search: before removal, only the decision register and the m0-002 report mentioned
  these files. The register is updated (D-GIT-2 closed). The m0-002 report is historical and
  left unchanged.

### Task 4 — Credentials and test state

| Item | Before | Action | After |
|---|---|---|---|
| Admin password | in plaintext `data/.local-admin-password` (git-ignored) | Rotated with the official `node app @apostrophecms/user:change-password admin` (random 32-char value, passed through stdin and never printed); file deleted | Value only in the git-ignored `.env` (`APOS_TEST_USER` / `APOS_TEST_PASSWORD`) |
| Bearer tokens | **12** | Core's `invalidatePriorLogins` removes all of the user's tokens on a password change | **0** |
| Sessions | 8 rows | Core sets `loginInvalidBefore` on the password change; older sessions are rejected and regenerated | 8 rows, none able to authenticate |
| Old password | — | Login attempt with it | **HTTP 400 (rejected)** |

- **An incident during rotation, resolved:** the first rotation ran successfully, but the new
  value never reached `.env`. A shell variable wasn't exported, and `.env` received the literal
  `undefined`. The account was locked with an unknown random password; nothing leaked. A second
  rotation was done in a single Node process (generate → `change-password` → write `.env` only
  on success). Verified by value length only.
- For the old-password rejection test, a temporary copy of the old password was kept in the
  session scratch directory and **deleted** right after the check.
- Reproducibility: new npm scripts `test:workflow` and `test:persistence` load credentials with
  `node --env-file=.env`. `scripts/editor-workflow-test.mjs` now **logs out** at the end of
  every run, so runs leave **0** tokens (verified).
- Not deleted: the development database, demo media, test page.

### Task 5 — Git safety verification (staged set, before commit)

| Check | Result |
|---|---|
| Not already a repository | ✅ no `.git` before `git init` |
| Remote identity | ✅ `github.com/mimnets/vcl-assurer-group`: owner `mimnets` matches the configured git account; unauthenticated API returns 404 and an authenticated `ls-remote` succeeds, i.e. **private** |
| Remote empty | ✅ zero refs (re-checked immediately before the push, see Post-push results) |
| Sensitive paths staged | ✅ none: no `.env`, `data/`, `public/uploads/`, build output, `node_modules`, `*.db`, `*.jsonl`, `*.sql`, backups or password files |
| `.gitignore` effective | ✅ `git check-ignore` reports ignored for `.env`, `data/vcl-assurer-group.db`, `public/uploads/attachments`, `node_modules`, `apos-build`, `public/apos-frontend` |
| License and attribution | ✅ `licenses/starter-kit-essentials-MIT-LICENSE.txt` staged; `package.json` `UNLICENSED` / private |
| Secrets in staged content | ✅ **0 hits** scanning the staged **blob contents** (`git show :<path>`) of all 84 files against 11 known secret values (session secret, test password, session IDs, password-hash prefix) plus patterns (AWS, GitHub PAT, Slack, OpenAI-style, private keys, credentialed DB URIs, `APOS_SESSION_SECRET=`, `APOS_TEST_PASSWORD=` with a value) |
| Repository metadata | ✅ `.git/config` contains no credentials. The remote URL is plain `https://github.com/mimnets/vcl-assurer-group.git`; authentication stays in Git Credential Manager. |

`.gitattributes` was added (`* text=auto eol=lf`, PNG/JPG/ICO binary) so the repository stores LF
regardless of each contributor's `core.autocrlf`.

### Task 6 — Initialize and publish
- `git init -b main`; staged as above; initial commit message (Conventional Commits):
  `chore: import milestone 0 foundation and engineering governance`, with a `Refs: m0-001,
  m0-002, m0-003, m0-004` footer.
- Normal `git push -u origin main`; no force. Results: **Post-push results** below.

### Task 7 — Repository protection

**Not enabled by the agent. Not claimed as enabled.**

- No GitHub CLI is installed, and no admin-scoped API token is available to the session. The
  stored git credential was used only for ordinary git transport. It was not extracted to call
  the settings API.
- Branch protection and rulesets on a **private** repository owned by a personal account
  require a paid GitHub plan (Pro or Team). On GitHub Free they apply only to public
  repositories. The account's plan was not verified.
- Secret scanning and push protection on private repositories require GitHub Advanced Security
  / Secret Protection. Availability was not verified.

**Owner action (D-GIT-3).** GitHub → repository **Settings → Rules → Rulesets → New branch
ruleset**:

| Setting | Value |
|---|---|
| Target | `main` (Default branch) |
| Enforcement | Active |
| Restrict deletions | on |
| Block force pushes | on |
| Require a pull request before merging | 1 approval; dismiss stale approvals; require conversation resolution |
| Require status checks | add once CI exists (D-CI-1) |

Then **Settings → Code security**: enable Dependabot alerts and security updates, and secret
scanning plus push protection if the plan offers them. Otherwise rely on the gitleaks CI job
proposed in `git-and-ci.md`. If the plan does not allow rulesets on a private repository, the
choice is: upgrade, make the repository public (not recommended), or rely on process until
then.

### Task 8 — Regression (before commit; repeated after push, see Post-push results)

| Check | Command | Result |
|---|---|---|
| Lint | `npm run lint` | clean |
| HTTP smoke | `npm run test:smoke` | **14/14** |
| Editor workflow | `npm run test:workflow` | **15/15** |
| Persistence | `npm run test:persistence` | **7/7** |
| Tokens left after runs | DB count | **0** |
| Listen address | `netstat` | `127.0.0.1:3000` only |
| Secret scan | staged-blob scan | **0 hits** |

## Files changed

| Status | Path |
|---|---|
| D | `deployment/README`, `deployment/dependencies`, `deployment/migrate`, `deployment/rsync_exclude.txt`, `deployment/settings`, `deployment/settings.staging`, `deployment/start`, `deployment/stop` |
| D | `scripts/sync-up`, `scripts/sync-down` |
| A | `.gitattributes` |
| A | `docs/runbooks/deployment-principles.md` |
| A | `docs/engineering/prompts/2026/10/2026-10-19-m0-004-safe-git-initialization.prompt.md` |
| A | `docs/engineering/reports/2026/10/2026-10-19-m0-004-safe-git-initialization.report.md` |
| M | `scripts/editor-workflow-test.mjs` (logout at end; header comment) |
| M | `package.json` (scripts `test:workflow`, `test:persistence`) |
| M | `.env.example` (documented `APOS_TEST_USER` / `APOS_TEST_PASSWORD`, no values) |
| M | `README.md` (test scripts; setup note) · `AGENTS.md` (test commands in "Testing before completion") |
| M | `docs/architecture/decisions/ADR-0001-…`, `ADR-0002-…`, `README.md` (status Accepted, approver recorded) |
| M | `docs/engineering/decision-register.md` (D-M0-6, D-M0-8, D-DB-1, D-GIT-1, D-GIT-2 closed or approved; D-GIT-3, D-CI-1 added) |
| M | `docs/engineering/INDEX.md` (m0-004 row; ADR statuses; next ID) · `docs/runbooks/README.md` |
| Local only (git-ignored) | `.env` (test credentials added), `data/.local-admin-password` **deleted**, database: password hash rotated, tokens removed |

Because this is the initial import, git sees every file as new. The table lists changes
relative to the m0-002/m0-003 state.

## Security observations

- Pushing makes the source available to every collaborator on the repository. The scans above
  show no secrets, data or media.
- Branch protection is **not active** (Task 7). Until the owner applies it, anyone with write
  access can push directly or force-push to `main`.
- The backup contains `.env` (session secret and the *old*, now invalid, test password), the
  database with password hashes, and form submissions. It is ACL-restricted, not encrypted.
- `.env` now holds the local test password in plaintext (git-ignored, local development only).

## Known limitations

- Secret scanning was done with a project-specific script (known values plus common patterns),
  not a dedicated scanner such as gitleaks or GitHub push protection.
- The GitHub plan and capabilities were not verified (no API access).
- The 8 invalidated session rows stay in the database until they expire.

## Unresolved decisions

Open in the [decision register](../../../decision-register.md): D-M0-1 (walkthrough), D-M0-2
(PostgreSQL test), D-M0-3/4 (form email and retention), D-M0-5 (security findings), D-M0-7
(licensing), D-DB-2/3/4, **D-GIT-3 (branch protection)**, D-CI-1 (CI).

## Rollback and recovery

- **Undo the publication** (owner only; destructive): delete the repository in GitHub settings,
  or remove `main` once no protection exists. Never force-push over it without a new approval.
- **Local git:** delete the `.git` directory. The working tree is unaffected.
- **Restore the pre-m0-004 project** (scripts, old password file, old database state):

  ```sh
  cd C:\Users\VCL-Admin\Documents
  # verify first
  (cd vcl-assurer-group-backups/2026-10-19-m0-004-pre-git && sha256sum -c SHA256SUMS)
  # extract to a NEW folder, never over the live project
  mkdir restore && tar -xzf vcl-assurer-group-backups/2026-10-19-m0-004-pre-git/project.tar.gz -C restore
  cd restore/vcl-assurer-group && npm ci && node app @apostrophecms/migration:migrate && npm run dev
  ```

  The database alone can also be restored from `database.jsonl` per the backup runbook (into a
  new, empty database, then migrate).
- Restoring the pre-rotation database brings back the old password, tokens and sessions. Rotate
  again afterwards.

## Milestone 0 closure recommendations

1. **D-GIT-3:** the owner applies the `main` ruleset and code-security settings (about 10 minutes).
2. **D-M0-1:** the 20-minute human editor walkthrough. This is the last verification gap in M0.
3. Close M0 after that. Open Milestone 1 with the PostgreSQL acceptance test (D-M0-2), the CI
   workflow (D-CI-1) and the platform security items (D-M0-5), each through a feature branch and
   PR.

## Post-push results

Added in a follow-up commit on branch `docs/m0-004-post-push-results` (not on `main`). It is
proposed for merge by pull request; the initial commit cannot contain its own SHA.

| Item | Result |
|---|---|
| Remote re-checked immediately before the push | `git ls-remote` exit 0, **zero refs** |
| Remote URL | `https://github.com/mimnets/vcl-assurer-group.git` (no embedded credentials) |
| Initial commit | `9b977236b54ba9ee2b2bf58b3e0d6110526c7869`, "chore: import milestone 0 foundation and engineering governance", 85 files, author Monirul Islam |
| Push | `git push -u origin main` (normal, no force): `* [new branch] main -> main`, exit 0 |
| Remote refs after the push | `HEAD` and `refs/heads/main` → `9b97723…`; no other refs |
| Remote matches source | after `git fetch`: `origin/main` = local `HEAD`; tree `618c6b00db9d04bde6bb24f95c8cf5cb086fa360` identical; `git diff HEAD origin/main` empty; 85 files; no `.env`, data, uploads, databases, dumps or backups |
| Branch protection | **Not enabled.** Owner action D-GIT-3 (Task 7) |
| Post-push regression | `npm run lint` clean · `test:smoke` **14/14** · `test:workflow` **15/15** · `test:persistence` **7/7** · bearer tokens **0** · `git status` clean, `main...origin/main` in sync |
