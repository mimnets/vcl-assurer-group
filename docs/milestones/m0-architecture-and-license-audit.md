# M0 — Architecture and License Audit

**Project:** VCL-ASSURER-GROUP (Assurer World corporate website)
**Date:** 2026-10-19
**Scope:** Milestone 0 only — foundation and proof of concept. No production systems touched.

## 1. Sources inspected

Shallow clones of the official repositories (inspected outside the project directory):

| Repository | Commit | Commit date |
|---|---|---|
| `apostrophecms/apostrophe` (monorepo) | `761ada7909b528241620d5f158bf2eb5f3618b7c` | 2026-10-15 |
| `apostrophecms/starter-kit-essentials` | `adbcab765f7fb0654d18d388e7f6b9be9b8e647c` | 2026-10-14 |
| `apostrophecms/public-demo` | `576bab027d10d7e393f9cdd1b7bdf7457dc7579a` | 2026-10-15 |

Also checked: npm registry metadata for every direct dependency, and the GitHub security
advisory feed for `apostrophecms/apostrophe` (all advisories published up to 2026-10-14).

## 2. Platform facts (verified, not assumed)

| Item | Finding | Evidence |
|---|---|---|
| Core version | `apostrophe` **4.34.0** (latest on npm) | `npm view apostrophe version`; monorepo `packages/apostrophe/package.json` |
| Core license | **MIT** | package.json, LICENSE |
| Node.js requirement | core `>=22.12.0`; starter README recommends **24 LTS+** | `engines` field; starter README |
| Local runtime | Node **24.21.0**, npm **11.19.0**, Windows 11 Pro | `node -v`, `npm -v` |
| Database adapters | MongoDB, PostgreSQL, **SQLite**, multi-schema PostgreSQL via `@apostrophecms/db-connect` 1.1.0 (MIT) | `packages/db-connect/README.md`; monorepo test matrix runs core tests against all four |
| SQLite engine | `better-sqlite3` 12.11.1 (MIT), SQLite **3.53.2**; prebuilt Windows binary loads | runtime check |
| SQLite URI on Windows | `sqlite://` + filesystem path, relative paths allowed | db-connect README |
| Templates | Server-side **JSX** (rendered by core, no React runtime); Nunjucks still supported | starter `AGENTS.md`, `ARCHITECTURE.md` |
| Asset pipeline | `@apostrophecms/vite` 1.2.0 (MIT), Vite 6.4.4 | `npm ls` |
| Admin UI | Vue 3.5, Tiptap 2.27 rich-text editor | `npm ls` |

## 3. Starter comparison: Essentials vs Public Demo

| Criterion | Essentials | Public Demo |
|---|---|---|
| License | MIT | MIT |
| Purpose | "Official minimal starting point" | "Feature-rich reference project built on the essentials starter kit" |
| Direct deps | `apostrophe`, `@apostrophecms/vite`, `dotenv`, `cross-env`, `normalize.css` | + `blog`, `favicon`, `import-export`, `open-graph`, `seo`, `dayjs`, `klona` |
| Paid modules | None | None (all free `@apostrophecms/*`) |
| Content model | Home + default page, layout widgets | Articles, authors, categories, i18n, design tokens, ~10 widgets |
| Opinions to undo | Few (welcome page, purple brand) | Many (blog model, demo widgets, GitHub-PRs widget, Dockerfile) |
| Security surface | Smaller | Includes `@apostrophecms/import-export`, which had **8 advisories** in Oct 2026 alone (fixed in 3.7.0/3.7.1), plus a critical Zip Slip in Mar 2026 |

**Decision: Essentials.** There is no documented technical reason to prefer the Public Demo. It is
itself built on Essentials, adds content models that Assurer has not specified, and carries
extra attack surface (import-export). Useful Demo patterns (hero/card widget shape, link
helper) were studied and reimplemented minimally rather than copied wholesale.

## 4. Edition check — no Pro / Assembly

- No `@apostrophecms-pro/*` package or Assembly/multisite module is installed
  (`node_modules/@apostrophecms` contains only `db-connect`, `emulate-mongo-3-driver`, `form`,
  `vite`, `vue-material-design-icons`).
- Features used are all Community: pages, widgets, areas, draft/publish, media library,
  Styles Editor (`@apostrophecms/styles`), breakpoint preview, undo/redo, `@apostrophecms/form`.
- Noted (not used): the form module's README points to `@apostrophecms-pro/advanced-permission`
  for per-group form permissions. That is a Pro feature and was **not** installed.
- No license key, account, or network licensing call is required. The app runs fully offline after `npm install`.

## 5. Dependencies added beyond the starter

| Package | Version | License | Why | Notes |
|---|---|---|---|---|
| `@apostrophecms/form` | 1.5.6 | MIT | Contact form (Community-compatible) | ≥1.5.5 required: GHSA-89mh-mm8c-mv7f, GHSA-44qr-rrjg-2cqq fixed there |
| `apostrophe` (bumped) | ^4.32.1 → **^4.34.0** | MIT | Security floor | 4.33.0/4.34.0 fix 20+ advisories (see security review) |
| `@apostrophecms/vite` (bumped) | ^1.1.2 → ^1.2.0 | MIT | Current release | — |

Verification-only tooling (`puppeteer-core` 25.14.0, Apache-2.0) was installed in a temporary
scratch directory, **not** in the project.

## 6. Full dependency license scan

Scanned all 1,111 packages in `package-lock.json` (licence field, falling back to each package's `package.json`):

| License | Count |
|---|---|
| MIT | 900 |
| Apache-2.0 | 81 |
| ISC | 48 |
| BSD-2-Clause | 30 |
| BSD-3-Clause | 13 |
| BlueOak-1.0.0 | 11 |
| LGPL-3.0-or-later (alone or combined) | 14 |
| Other permissive (0BSD, CC0-1.0, MIT-0, Python-2.0, CC-BY-4.0, dual MIT/Apache/MPL) | 10 |
| No license declared | 4 |

**Items needing legal attention (none block M0):**

1. **LGPL-3.0 — `@img/sharp-*` (libvips binaries).** Pulled in by core's image processing via `sharp`.
   These are optional, platform-specific packages; only `@img/sharp-win32-x64` is installed here.
   libvips is dynamically loaded and unmodified. That is the standard, widely accepted use, but confirm with legal before production.
2. **No declared license:** `pause@0.0.1`, `regexp-quote@0.0.0`, `urls@0.0.4` (tiny legacy transitive
   deps of `apostrophe` core), plus `gzipme@0.1.2` (README states MIT). Recommend asking
   Apostrophe upstream to replace or clarify them; the risk is low.
3. `dompurify` is dual-licensed MPL-2.0 **or** Apache-2.0. Apache-2.0 can be elected.

## 7. Project licensing

- The starter kit's MIT `LICENSE` (copyright Apostrophe Technologies) was moved to
  `licenses/starter-kit-essentials-MIT-LICENSE.txt` to keep the required notice without
  presenting it as the license of this project.
- `package.json` is marked `"private": true, "license": "UNLICENSED"` (proprietary). Confirm the intended licensing with the business owner.

## 8. Architecture as built

```
Browser ── HTTP ──▶ Express (apostrophe core, 127.0.0.1:3000)
                     ├─ @apostrophecms/page → page types (home, default-page)
                     │     └─ main area (lib/area.js) ── widgets:
                     │           assurer-hero · assurer-slideshow · assurer-product-grid
                     │           (→ assurer-product-card) · @apostrophecms/form · core widgets
                     ├─ server-side JSX templates (views/layout.jsx, modules/*/views/*.jsx)
                     ├─ @apostrophecms/form → aposFormSubmissions collection
                     └─ @apostrophecms/db-connect ──▶ SQLite file data/vcl-assurer-group.db
Uploads: public/uploads (local filesystem via uploadfs)
```

Conventions: project modules use the `assurer-` prefix in a flat `modules/` folder. The
`nestedModuleSubdirs` option was considered and rejected. Its module lookup matches
`'/'`-separated paths, which is a portability risk on Windows, and it adds no capability.
