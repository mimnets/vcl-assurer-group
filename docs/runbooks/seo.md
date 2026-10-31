# SEO operations runbook

| | |
|---|---|
| **Created** | 2026-10-31 (`m1-018`, CA-3) |
| **Code** | `modules/assurer-seo/`, `modules/@apostrophecms/{seo,sitemap,redirect,soft-redirect,global}/`, `lib/seo-title.js` |
| **Plan** | [SEO and migration plan](../content/seo-and-migration-plan.md) |
| **Status** | §1–§4 verified locally on 2026-10-31 (`m1-018`: `test:ci`, dev server, agent browser checks). §5 (launch) not yet executed |
| **Packages** | `@apostrophecms/seo`, `@apostrophecms/sitemap`, `@apostrophecms/redirect` (MIT, D-CONTENT-10) |

## 1. Environment

| Variable | Default | Production | Staging, test, development |
|---|---|---|---|
| `APOS_BASE_URL` | `http://localhost:<PORT>` | `https://www.assurerworld.com` (origin only, no trailing slash) | The address people use for that site |
| `APOS_ALLOW_INDEXING` | `0` | `1` | **Never set** |

- With `APOS_ALLOW_INDEXING` unset or `0`, every response has `X-Robots-Tag: noindex, nofollow`,
  every page has `<meta name="robots" content="noindex,nofollow">`, and `/robots.txt` is
  `Disallow: /`. This is the safe default.
- `APOS_ALLOW_INDEXING=1` needs an `https` `APOS_BASE_URL`; otherwise the app does not start.
  `/robots.txt` then allows crawling except `/login`, `/api/` and `/assurer/`, and names
  `/sitemap.xml`.
- `APOS_BASE_URL` makes page links, canonicals, the sitemap and JSON-LD absolute. Open the site at
  exactly that address. Locally, use `http://localhost:3000`: links and post-login redirects go
  to the base URL, so a site opened at `http://127.0.0.1:3000` sends you to `localhost` (another
  cookie host, so you appear logged out).

## 2. What editors control

| Where | Fields |
|---|---|
| Page or piece, **SEO/AEO** tab | SEO title (used in `<title>` exactly as entered, without the suffix), meta description, robots (`noindex`, `nofollow`), canonical page, structured-data type |
| Global Content, **SEO/AEO** tab | Title suffix (`<page title> \| <suffix>`), default sharing image, site name, organization information (JSON-LD), social profiles, `llms.txt` |
| **Redirects** (admin bar) | Old URL → page or external URL, 301 by default. Live as soon as saved; no publish step. Editors and administrators |

- Pages without their own description use their summary (product category pages), never another
  page's description.
- Only enter facts the owner has confirmed (organization name, address, phone; D-CONTENT-2,
  D-CONTENT-12). Without an organization name no Organization JSON-LD is output.
- The structured-data types Article and BlogPosting fall back to the last editor's name as
  author. Do not use them until the news section is decided (D-CONTENT-6).
- Analytics, tag manager and verification fields are not enabled (out of scope).

## 3. Redirects

- **Trailing slash:** `/x/` → `/x`, one 301, query string kept. No records needed.
- **Changed slugs:** core soft redirects, 301, from URLs that visitors have opened before.
- **Legacy WordPress URLs** (SEO plan §2): `node app assurer-seo:seed-redirects`.
  - Adds a redirect record only when its target page is published; run it again after content
    migration (CA-5) publishes more pages. `--strict` fails while any is missing.
  - Never changes or removes records. Editors may edit or archive seeded redirects; the task then
    reports them as "changed" and leaves them alone.
  - `/gallery` and `/sitemap` redirect away. If a real page is later published at one of those
    URLs, archive the redirect first: redirects run before pages. The task refuses to add a
    redirect over an existing published page.
  - The 8 `/wp-content/uploads/` PDFs and the video are not covered yet: they move with their files
    in CA-5.
- Test: `npm run test:ci` requests every legacy URL (one 301, then 200).

## 4. Sitemap

- `/sitemap.xml`: published pages that visitors can see, absolute URLs. Pieces have no show pages,
  so none are listed. Files and pages marked `noindex` are left out.
- Cached for an hour. To refresh now: `node app @apostrophecms/sitemap:clear`.

## 5. Launch checks (CA-7)

1. Production: `APOS_ALLOW_INDEXING=1`, `APOS_BASE_URL=https://www.assurerworld.com`.
2. `curl -sI https://www.assurerworld.com/` has no `X-Robots-Tag`; `/robots.txt` has no
   `Disallow: /`.
3. Staging still sends `noindex` and `Disallow: /`.
4. `node app assurer-seo:seed-redirects --strict` succeeds on production content.
5. Submit the sitemap in Search Console (owner, after launch only).
