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

## Project modules

| Module | Purpose |
|--------|---------|
| `assurer-hero-widget` | Hero banner: in-place editable headline/text, background image, buttons |
| `assurer-slideshow-widget` | Image slideshow with captions, autoplay, keyboard and dot navigation |
| `assurer-product-grid-widget` | Product section; cards are widgets in an area (add / reorder in place) |
| `assurer-product-card-widget` | Single product card |
| `assurer-demo` | `assurer-demo:seed` task for demonstration content |
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
