# VCL-ASSURER-GROUP

Assurer World corporate website, built on **ApostropheCMS Community Edition** (MIT).
Started from the official
[Essentials starter kit](https://github.com/apostrophecms/starter-kit-essentials)
(commit `adbcab7`, MIT — see `licenses/`).

> **Status: Milestone 0 proof of concept.** All content is placeholder demonstration
> content. Not for deployment. See [`docs/milestones/`](./docs/milestones/).

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 24 LTS (verified on 24.21.0) |
| npm | 11 (verified on 11.19.0) |
| Database | SQLite via `@apostrophecms/db-connect` — no server needed |

## Local setup

```sh
npm install
cp .env.example .env
# Set APOS_SESSION_SECRET in .env (the app refuses to start without it):
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

node app @apostrophecms/user:add <username> admin   # prompts for a password
# For the editor workflow tests, put that login in .env as APOS_TEST_USER / APOS_TEST_PASSWORD
npm run seed:demo                                    # optional sample home page
npm run dev                                          # http://localhost:3000
```

Log in at `/login`. The server binds to `127.0.0.1` only (override with `ADDRESS`).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server with restart-on-change |
| `npm start` | Development server without watching |
| `npm run seed:demo` | Load demo content onto the home page (`-- --force` to replace) |
| `npm run test:smoke` | HTTP checks: rendering, CSRF, contact-form validation (server must be running) |
| `npm run test:workflow` | Editor workflow via REST API (reads `APOS_TEST_USER` / `APOS_TEST_PASSWORD` from `.env`) |
| `npm run test:persistence` | Re-checks published state, e.g. after a restart |
| `npm run lint` | ESLint |
| `npm run build` | Production asset build (needs `APOS_RELEASE_ID`) |
| `npm run test:ci` | Same isolated run as CI: throwaway SQLite database and uploads in the temp directory, generated secrets, no `.env`; smoke, workflow and persistence (port 3100) |
| `npm run test:unit` | Unit tests for the audit gate and the test-admin guard |
| `npm run audit:check` | `npm audit` against `security/audit-baseline.json` |

CI (GitHub Actions, `.github/workflows/ci.yml`) runs lint, build, tests, gitleaks and the
audit check on every pull request. See [git-and-ci.md](./docs/engineering/git-and-ci.md#ci-github-actions).

## Project modules

| Module | Purpose |
|--------|---------|
| `assurer-hero-widget` | Hero banner: in-place editable headline/text, background image, buttons |
| `assurer-slideshow-widget` | Image slideshow with captions, autoplay, keyboard and dot navigation |
| `assurer-product-grid-widget` | Product section; cards are widgets in an area (add / reorder in place) |
| `assurer-product-card-widget` | Single product card |
| `assurer-demo` | `assurer-demo:seed` task for demonstration content |
| `assurer-test` | `assurer-test:ensure-admin`: creates the CI test admin; refuses anything but a temporary SQLite database |
| `@apostrophecms/form` (+ field widgets) | Contact forms (Community, MIT) |

See [AGENTS.md](./AGENTS.md) for template and code conventions.

## Documentation and governance

| Where | What |
|---|---|
| [AGENTS.md](./AGENTS.md) | Binding engineering rules for contributors and AI agents |
| [docs/engineering/INDEX.md](./docs/engineering/INDEX.md) | Tasks, prompts, reports, ADRs and PRs |
| [docs/architecture/decisions/](./docs/architecture/decisions/) | Architecture decision records |
| [docs/runbooks/](./docs/runbooks/) | Operational procedures (backup and restore, new site) |
| [docs/engineering/decision-register.md](./docs/engineering/decision-register.md) | Open decisions awaiting approval |
