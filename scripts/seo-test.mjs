// SEO suite (m1-018, CA-3), against a running NON-PRODUCTION server on a
// DISPOSABLE database. Run by `npm run test:ci` only: it creates pages and
// changes Global Content, so it refuses to run unless SEO_TEST_DISPOSABLE=1.
//
//   node scripts/seo-test.mjs              (main run, as the test editor)
//   node scripts/seo-test.mjs --redirects  (after assurer-seo:seed-redirects)
//
// Main run: robots.txt and X-Robots-Tag outside production; SEO fields edited
// by an editor and published; <title> suffix; description, absolute
// canonical, Open Graph and JSON-LD in <head>; draft SEO changes hidden;
// /sitemap.xml (published pages only, no noindex pages, no drafts); the
// trailing-slash 301; soft redirects as 301. It also publishes the target
// pages of the legacy map so the seed task can link them.
//
// --redirects: every URL of SEO plan §2 is requested anonymously, with and
// without the trailing slash: exactly one 301 to the expected page, which
// answers 200. The expected map is written out here from the plan, not
// imported from the implementation.

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const REDIRECTS_ONLY = process.argv.includes('--redirects');
const P = 'm1-018 test';

if (process.env.SEO_TEST_DISPOSABLE !== '1') {
  console.error('Refusing to run: this suite writes test records. It runs from `npm run test:ci` ' +
    '(SEO_TEST_DISPOSABLE=1) on a throwaway database only.');
  process.exit(2);
}
for (const name of [ 'APOS_TEST_USER', 'APOS_TEST_PASSWORD', 'APOS_TEST_EDITOR_USER', 'APOS_TEST_EDITOR_PASSWORD' ]) {
  if (!process.env[name]) {
    console.error(`Set ${name}.`);
    process.exit(2);
  }
}

// SEO plan §2. Kept URLs: only the trailing slash changes.
const KEPT = [
  '/style', '/style/apparels-textiles', '/style/activewear-accessories', '/style/home-tex-decor',
  '/health', '/health/beauty-herbs', '/health/food-minerals', '/health/health-tex-medi-care',
  '/leadership', '/contact-us', '/downloads', '/gallery/images'
];
// Moved URLs, as they appear on the WordPress site.
const MOVED = {
  '/downloads/corporate-profiles/': '/downloads',
  '/downloads/apparels-textiles/': '/style/apparels-textiles',
  '/downloads/active-wear-accessories/': '/style/activewear-accessories',
  '/downloads/home-tex-decor/': '/style/home-tex-decor',
  '/downloads/beauty-herbs/': '/health/beauty-herbs',
  '/downloads/food-minerals/': '/health/food-minerals',
  '/downloads/health-tex-medi-care/': '/health/health-tex-medi-care',
  '/gallery/': '/gallery/images',
  '/gallery/videos/': '/gallery/images',
  '/gallery/downloads/': '/downloads',
  '/presentation/': '/downloads',
  '/sitemap/': '/',
  '/website-under-maintenance/': '/',
  '/hello-world/': '/',
  '/category/uncategorized/': '/',
  '/author/admin/': '/',
  '/feed/': '/',
  '/?p=1': '/',
  '/?page_id=357': '/',
  '/download.php': '/downloads'
};

const results = [];
function check(name, ok, detail = '') {
  results.push(ok);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
}

async function call(token, method, url, body, { draft = true } = {}) {
  const sep = url.includes('?') ? '&' : '?';
  const res = await fetch(`${BASE}/api/v1/${url}${draft ? `${sep}aposMode=draft` : ''}`, {
    method,
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'content-type': 'application/json' } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    json = text;
  }
  return {
    status: res.status,
    json
  };
}
async function api(token, method, url, body, opts) {
  const r = await call(token, method, url, body, opts);
  if (r.status < 200 || r.status > 299) {
    throw new Error(`${method} ${url} -> ${r.status} ${JSON.stringify(r.json).slice(0, 300)}`);
  }
  return r.json;
}
async function login(username, password) {
  return (await api(null, 'POST', '@apostrophecms/login/login', {
    username,
    password
  }, { draft: false })).token;
}
// Anonymous request that does not follow redirects.
const get = async (path) => {
  const res = await fetch(`${BASE}${path}`, { redirect: 'manual' });
  return {
    status: res.status,
    location: res.headers.get('location'),
    headers: res.headers,
    text: await res.text()
  };
};
const head = html => html.match(/<head>[\s\S]*?<\/head>/)?.[0] || '';
const attr = (html, re) => html.match(re)?.[1];
const metaContent = (html, key) => attr(html, new RegExp(`<meta (?:name|property)="${key}" content="([^"]*)"`));
const resolve = location => (location ? new URL(location, BASE).href : null);
const abs = path => new URL(path, BASE).href;

const tokens = {
  admin: await login(process.env.APOS_TEST_USER, process.env.APOS_TEST_PASSWORD),
  editor: await login(
    process.env.APOS_TEST_EDITOR_USER,
    process.env.APOS_TEST_EDITOR_PASSWORD
  )
};
check('admin and editor log in', Boolean(tokens.admin && tokens.editor));

if (REDIRECTS_ONLY) {
  await redirectMap();
} else {
  await mainRun();
}
await finish();

async function pageBySlug(slug) {
  const all = (await api(tokens.editor, 'GET', '@apostrophecms/page?all=1&flat=1&archived=any')).results || [];
  return all.find(p => p.slug === slug);
}
async function ensurePublishedPage(title, slug, extra = {}) {
  let doc = await pageBySlug(slug);
  if (!doc) {
    doc = await api(tokens.editor, 'POST', '@apostrophecms/page', {
      title,
      type: 'default-page',
      slug,
      _targetId: '_home',
      _position: 'lastChild',
      ...extra
    });
  }
  await api(tokens.editor, 'POST', `@apostrophecms/page/${doc._id}/publish`, {});
  return doc;
}

async function mainRun() {
  // --- Non-production defaults -----------------------------------------
  let r = await get('/robots.txt');
  check('robots.txt served as text', r.status === 200 && /text\/plain/.test(r.headers.get('content-type')),
    `${r.status} ${r.headers.get('content-type')}`);
  check('robots.txt blocks all crawling outside production', r.text === 'User-agent: *\nDisallow: /\n');
  r = await get('/');
  check('X-Robots-Tag noindex on pages outside production', r.headers.get('x-robots-tag') === 'noindex, nofollow');
  check('robots meta noindex outside production', metaContent(head(r.text), 'robots') === 'noindex,nofollow');
  check('no SEO title meta tag (title goes into <title>)', !head(r.text).includes('<meta name="title"'));
  check('no analytics or tag manager scripts', !/googletagmanager|gtag\(/.test(r.text));
  check('llms.txt answers (package default)', (await get('/llms.txt')).status === 200);

  // --- Global SEO settings, edited by the editor ------------------------
  const gd = await api(tokens.editor, 'GET', '@apostrophecms/global');
  const g = gd._id ? gd : gd.results[0];
  r = await call(tokens.editor, 'PATCH', `@apostrophecms/global/${g._id}`, { footerText: `${P} footer` });
  check('Global Content saves without an organization name', r.status === 200, String(r.status));
  r = await call(tokens.editor, 'PATCH', `@apostrophecms/global/${g._id}`, {
    seoTitleSuffix: 'Demo Site (m1-018 test)',
    seoSiteName: 'Demo Site (m1-018 test)',
    seoJsonLdOrganization: { name: 'Demo Organization (m1-018 test)' }
  });
  check('editor edits the Global SEO tab (draft)', r.status === 200, String(r.status));
  check('Global SEO draft not public', !(await get('/')).text.includes('Demo Site (m1-018 test)'));
  await api(tokens.editor, 'POST', `@apostrophecms/global/${g._id}/publish`, {});

  // --- Page SEO fields --------------------------------------------------
  const slug = '/m1-018-seo-page';
  const doc = await ensurePublishedPage(`${P} page`, slug);
  r = await call(tokens.editor, 'PATCH', `@apostrophecms/page/${doc._id}`, {
    seoTitle: `${P} SEO title`,
    seoDescription: `${P} description.`
  });
  check('editor sets SEO title and description (draft)', r.status === 200, String(r.status));
  let html = (await get(slug)).text;
  check('draft SEO description not public', !html.includes(`${P} description.`));
  await api(tokens.editor, 'POST', `@apostrophecms/page/${doc._id}/publish`, {});
  html = head((await get(slug)).text);
  check('<title> is the SEO title as entered', html.includes(`<title>${P} SEO title</title>`), attr(html, /<title>([^<]*)/));
  check('meta description from the SEO tab', metaContent(html, 'description') === `${P} description.`);
  check('absolute self-canonical', attr(html, /<link rel="canonical" href="([^"]*)"/) === abs(slug));
  check('Open Graph title, description, url, site name', metaContent(html, 'og:title') === `${P} SEO title` &&
    metaContent(html, 'og:description') === `${P} description.` && metaContent(html, 'og:url') === abs(slug) &&
    metaContent(html, 'og:site_name') === 'Demo Site (m1-018 test)');
  check('Twitter card', metaContent(html, 'twitter:card') === 'summary');
  const jsonLd = JSON.parse(attr(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/) || '{}');
  const graph = jsonLd['@graph'] || [];
  const byType = type => graph.find(s => s['@type'] === type);
  check('JSON-LD Organization from Global Content', byType('Organization')?.name === 'Demo Organization (m1-018 test)');
  check('JSON-LD WebSite without a search action', byType('WebSite')?.name === 'Demo Site (m1-018 test)' &&
    !byType('WebSite').potentialAction);
  check('JSON-LD BreadcrumbList from the page tree', (byType('BreadcrumbList')?.itemListElement || []).length === 2);

  r = await call(tokens.editor, 'PATCH', `@apostrophecms/page/${doc._id}`, { seoDescription: `${P} unpublished edit.` });
  html = (await get(slug)).text;
  check('unpublished SEO edit stays hidden', r.status === 200 && !html.includes('unpublished edit') &&
    html.includes(`${P} description.`));
  await api(tokens.editor, 'POST', `@apostrophecms/page/${doc._id}/revert-draft-to-published`, {});

  const plainSlug = '/m1-018-seo-plain';
  await ensurePublishedPage(`${P} plain`, plainSlug);
  html = head((await get(plainSlug)).text);
  check('title suffix from Global Content', html.includes(`<title>${P} plain | Demo Site (m1-018 test)</title>`),
    attr(html, /<title>([^<]*)/));
  check('no description borrowed from another page', !metaContent(html, 'description'));
  const notFound = await get('/m1-018-no-such-page');
  check('404 has no canonical', notFound.status === 404 && !head(notFound.text).includes('rel="canonical"'));

  // --- Sitemap ----------------------------------------------------------
  const noindexSlug = '/m1-018-seo-noindex';
  const noindex = await ensurePublishedPage(`${P} noindex`, noindexSlug);
  await api(tokens.editor, 'PATCH', `@apostrophecms/page/${noindex._id}`, { seoRobots: [ 'noindex' ] });
  await api(tokens.editor, 'POST', `@apostrophecms/page/${noindex._id}/publish`, {});
  const draftSlug = '/m1-018-seo-draft';
  if (!await pageBySlug(draftSlug)) {
    await api(tokens.editor, 'POST', '@apostrophecms/page', {
      title: `${P} draft`,
      type: 'default-page',
      slug: draftSlug,
      _targetId: '_home',
      _position: 'lastChild'
    });
  }
  for (const path of KEPT) {
    await ensurePublishedPage(`${P} target ${path}`, path);
  }
  r = await get('/sitemap.xml');
  const locs = [ ...r.text.matchAll(/<loc>([^<]*)<\/loc>/g) ].map(m => m[1]);
  check('sitemap.xml served as XML', r.status === 200 && /xml/.test(r.headers.get('content-type')),
    `${r.status} ${r.headers.get('content-type')}`);
  check('sitemap lists published pages with absolute URLs', locs.includes(abs(slug)) && locs.includes(abs('/')) &&
    locs.includes(abs('/style/apparels-textiles')));
  check('sitemap leaves out noindex pages', !locs.includes(abs(noindexSlug)));
  check('sitemap leaves out drafts', !locs.includes(abs(draftSlug)));
  check('sitemap leaves out files and API URLs', !locs.some(l => /\/uploads\/|\/api\//.test(l)));

  // --- Trailing slash and soft redirects ---------------------------------
  r = await get(`${slug}/`);
  check('trailing slash: one 301 to the slash-less URL', r.status === 301 && resolve(r.location) === abs(slug),
    `${r.status} ${r.location}`);
  r = await get(`${slug}/?utm_source=x`);
  check('trailing slash keeps the query string', r.status === 301 && resolve(r.location) === abs(`${slug}?utm_source=x`),
    `${r.status} ${r.location}`);
  r = await get('//example.com/');
  check('trailing slash never redirects off the site', !r.location || new URL(r.location, BASE).origin === new URL(BASE).origin,
    `${r.status} ${r.location}`);
  r = await call(null, 'GET', '@apostrophecms/page/', null, { draft: false });
  check('REST API paths are not redirected', r.status !== 301, String(r.status));

  const moving = await ensurePublishedPage(`${P} moving`, '/m1-018-seo-old');
  await get('/m1-018-seo-old');
  await api(tokens.editor, 'PATCH', `@apostrophecms/page/${moving._id}`, { slug: '/m1-018-seo-new' });
  await api(tokens.editor, 'POST', `@apostrophecms/page/${moving._id}/publish`, {});
  r = await get('/m1-018-seo-old');
  check('changed slug: old URL answers 301 to the new one', r.status === 301 && resolve(r.location) === abs('/m1-018-seo-new'),
    `${r.status} ${r.location}`);

  // --- Redirect manager access --------------------------------------------
  r = await call(null, 'GET', '@apostrophecms/redirect', null, { draft: false });
  check('anonymous cannot list redirects', [ 401, 403 ].includes(r.status) || (r.json.results || []).length === 0,
    String(r.status));
  r = await call(tokens.editor, 'GET', '@apostrophecms/redirect', null, { draft: false });
  check('editor can open the redirect manager', r.status === 200, String(r.status));
}

async function redirectMap() {
  const records = (await api(tokens.editor, 'GET', '@apostrophecms/redirect?perPage=100', null, { draft: false })).results || [];
  const unique = new Set(records.map(d => d.redirectSlug)).size === records.length;
  check('seeding twice added each legacy redirect once',
    records.length === Object.keys(MOVED).length && unique, String(records.length));
  check('seeded redirects are permanent', records.every(d => String(d.statusCode) === '301'));

  const urls = [];
  for (const path of KEPT) {
    urls.push([ `${path}/`, path ]);
  }
  for (const [ from, to ] of Object.entries(MOVED)) {
    urls.push([ from, to ]);
    if (from.endsWith('/')) {
      urls.push([ from.replace(/\/$/, ''), to ]);
    }
  }
  for (const [ from, to ] of urls) {
    const r = await get(from);
    const target = resolve(r.location);
    const ok = r.status === 301 && target === abs(to);
    let final = null;
    if (ok) {
      final = await get(new URL(target).pathname + new URL(target).search);
    }
    check(`${from} -> ${to}: one 301, then 200`, ok && final.status === 200,
      `${r.status} ${r.location}${final ? ` -> ${final.status}` : ''}`);
  }
}

async function finish() {
  for (const token of Object.values(tokens)) {
    await call(token, 'POST', '@apostrophecms/login/logout', {}, { draft: false })
      .catch(e => console.log(`WARN  logout failed: ${e.message}`));
  }
  const failed = results.filter(ok => !ok).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed`);
  process.exit(failed ? 1 : 0);
}
