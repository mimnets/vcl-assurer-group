# M0 — Installation Report

**Date:** 2026-10-19 · **Machine:** Windows 11 Pro 10.0.26200 · **Node** 24.21.0 · **npm** 11.19.0 · **git** 2.56.0
**Project location:** `C:\Users\VCL-Admin\Documents\vcl-assurer-group` (project name VCL-ASSURER-GROUP, npm name `vcl-assurer-group`)

No remote repository was created; nothing was committed or pushed (the folder is not yet a git repository).

## 1. Preconditions found

- Working directory was empty.
- No MongoDB, PostgreSQL or Docker installed, so SQLite was chosen (no server needed).
- Node 24.21.0 satisfies core's `>=22.12.0` and the starter's "24 LTS+" recommendation.

## 2. Commands executed (in order)

Upstream inspection (outside the project, in a temporary scratch directory):

```sh
git clone --depth 1 https://github.com/apostrophecms/apostrophe.git
git clone --depth 1 https://github.com/apostrophecms/starter-kit-essentials.git
git clone --depth 1 https://github.com/apostrophecms/public-demo.git
npm view <pkg> version license engines.node        # for each direct dependency
curl https://api.github.com/repos/apostrophecms/apostrophe/security-advisories
```

Project setup:

```sh
# copy starter-kit-essentials @ adbcab7 (without .git) into the project folder
npm install                                   # 998 packages added, ~5 min
cp .env.example .env                          # then set APOS_SESSION_SECRET (random 48 bytes, hex)
node app @apostrophecms/migration:migrate     # creates the SQLite DB
node app @apostrophecms/user:add admin admin  # local test admin; password random, stored in data/ (git-ignored)
node app assurer-demo:seed                    # demo content (images, form, home page) — published
node app                                      # dev server; admin UI built by Vite in ~14 s on first start
```

Verification and housekeeping:

```sh
npm run test:smoke
node scripts/editor-workflow-test.mjs [--verify-only]
npx eslint app.js lib modules scripts views
npm audit --json
APOS_RELEASE_ID=m0-local npm run build        # production asset build — OK
APOS_RELEASE_ID=m0-local NODE_ENV=production node app   # production boot — OK, smoke 14/14
```

Relocation (requested mid-milestone): the project was first built in `vcl-assurer-group/assurer-web/`.
After verification, the server was stopped, the SQLite WAL checkpointed (`integrity_check: ok`),
regenerable build output (`apos-build/`, `public/apos-frontend/`) deleted, and all files moved up
into `vcl-assurer-group/`. The project was then renamed (`package.json` name, `shortName`, DB file
`data/vcl-assurer-group.db`), restarted, and **all test suites re-run at the new location** (results in
the feature verification report).

## 3. Resolved versions

| Package | Requested | Installed |
|---|---|---|
| apostrophe | ^4.34.0 | 4.34.0 |
| @apostrophecms/form | ^1.5.6 | 1.5.6 |
| @apostrophecms/vite | ^1.2.0 | 1.2.0 |
| @apostrophecms/db-connect (via core) | — | 1.1.0 |
| better-sqlite3 (via db-connect) | — | 12.11.1 (SQLite 3.53.2) |
| sanitize-html (via core) | — | 2.18.1 |
| uploadfs / sharp (via core) | — | 1.28.1 / 0.35.5 |
| express / passport (via core) | — | 4.22.3 / 0.6.0 |
| vite (admin build) / vue | — | 6.4.4 / 3.5.44 |
| dotenv / cross-env / normalize.css | — | 17.4.2 / 10.1.0 / 8.0.1 |
| nodemon / eslint-config-apostrophe (dev) | — | 3.1.14 / 6.1.0 |

`package-lock.json` is kept. The starter's `.gitignore` excluded it; that line was removed so installs stay reproducible.

## 4. Environment variables (`.env.example`)

| Variable | Required | Value in this install |
|---|---|---|
| `APOS_DB_URI` | yes (for SQLite) | `sqlite://./data/vcl-assurer-group.db` |
| `APOS_SESSION_SECRET` | **yes** — app refuses to start if missing or < 32 chars | random 96-hex-char value in `.env` only |
| `PORT` | no | default 3000 |
| `ADDRESS` | no | default `127.0.0.1` (loopback only) |
| `APOS_RELEASE_ID` | for production builds | not set for dev |

## 5. Project structure

```
vcl-assurer-group/
├── app.js                         module registration (shortName: vcl-assurer-group)
├── .env.example                   documented variables, no secrets
├── lib/area.js · lib/link.js      shared area config; page-or-URL link fields
├── views/layout.jsx               site chrome + "Demonstration site" notice
├── modules/
│   ├── assurer-hero-widget/       hero (+ views/widget.jsx)
│   ├── assurer-slideshow-widget/  slideshow (+ ui/src/index.js player)
│   ├── assurer-product-grid-widget/  product section (cards area)
│   ├── assurer-product-card-widget/  product card
│   ├── assurer-demo/              seed task
│   ├── @apostrophecms/express/    session secret from env, loopback bind
│   ├── @apostrophecms/form/       form options (limits, classPrefix)
│   ├── @apostrophecms/form-text-field-widget/  server-side email validation
│   ├── @apostrophecms/home-page/  home template + shared area
│   └── asset/ui/src/scss/_assurer.scss   project styles
├── demo-content/images/           7 labelled placeholder PNGs (generated)
├── scripts/smoke-test.mjs · scripts/editor-workflow-test.mjs
├── licenses/                      starter kit MIT notice
├── docs/milestones/               these reports
└── data/ · public/uploads/        runtime state (git-ignored)
```

## 6. Exact changed files relative to the starter (`starter-kit-essentials@adbcab7`)

Produced with `git diff --no-index --name-status <upstream> <project>`, excluding `node_modules`,
runtime data, build output and `.env`:

| Status | File |
|---|---|
| M | `.env.example` |
| M | `.gitignore` (stop ignoring `package-lock.json`) |
| M | `AGENTS.md` (Assurer project rules prepended; `lib/link.js` documented) |
| M | `README.md` (rewritten for this project) |
| M | `app.js` |
| M | `eslint.config.js` |
| M | `lib/area.js` |
| A | `lib/link.js` |
| R | `LICENSE` → `licenses/starter-kit-essentials-MIT-LICENSE.txt` |
| M | `modules/@apostrophecms/express/index.js` |
| A | `modules/@apostrophecms/form/index.js` |
| A | `modules/@apostrophecms/form-text-field-widget/index.js` |
| M | `modules/@apostrophecms/home-page/index.js` |
| M | `modules/@apostrophecms/home-page/views/page.jsx` |
| M | `modules/asset/ui/src/index.js` |
| M | `modules/asset/ui/src/index.scss` |
| A | `modules/asset/ui/src/scss/_assurer.scss` |
| M | `modules/asset/ui/src/scss/_type.scss` |
| D | `modules/asset/ui/src/scss/_welcome.scss` |
| A | `modules/assurer-demo/index.js` |
| A | `modules/assurer-hero-widget/index.js`, `views/widget.jsx` |
| A | `modules/assurer-product-card-widget/index.js`, `views/widget.jsx` |
| A | `modules/assurer-product-grid-widget/index.js`, `views/widget.jsx` |
| A | `modules/assurer-slideshow-widget/index.js`, `views/widget.jsx`, `ui/src/index.js` |
| M | `modules/default-page/index.js` |
| M | `package.json` |
| A | `package-lock.json` |
| A | `scripts/smoke-test.mjs`, `scripts/editor-workflow-test.mjs` |
| M | `views/layout.jsx` |
| A | `demo-content/images/*.png` (7 files) |
| A | `docs/milestones/m0-*.md` (5 files) |

Local-only, git-ignored: `.env`, `data/` (SQLite DB, local admin password file), `public/uploads/`.

## 7. Problems hit during installation (and resolution)

| Problem | Resolution |
|---|---|
| Starter pins `apostrophe ^4.32.1`, below the security fixes | Floor raised to `^4.34.0` |
| Session secret `undefined` in starter | Read from `APOS_SESSION_SECRET`; startup fails without it |
| `npm run build` fails: "must set APOS_RELEASE_ID" | Expected production guard; documented in `.env.example` |
| Dev server bound to `0.0.0.0` (LAN-reachable) | `address: '127.0.0.1'` default (`ADDRESS` env overrides) |
| `@apostrophecms/page` has no `convert()` (seed task) | Use the home page type's manager |
| Form `fieldName` is a slug field, so it is lowercased | Seed and tests use `fullname` |
| ESLint config flags the starter's own JSX (double quotes, `key` props) | JSX override matching the starter's documented conventions |
| `npm audit`: 43 findings | Analysed in the security review; no safe fix exists |
| `npm ls` reports `gcp-metadata`, `is-stream` as extraneous | Optional peers of the bundled MongoDB driver; inert under SQLite; no action |
