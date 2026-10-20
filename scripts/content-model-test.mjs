// Corporate content model suite (m1-014, ADR-0003), against a running
// server on a DISPOSABLE database, through the same REST endpoints the admin
// UI calls. Run by `npm run test:ci` only: it creates and archives records,
// so it refuses to run unless CONTENT_TEST_DISPOSABLE=1.
//
//   node scripts/content-model-test.mjs                (main run)
//   node scripts/content-model-test.mjs --verify-only  (after a restart)
//
// Credentials come from the environment: APOS_TEST_USER / APOS_TEST_PASSWORD
// (admin) and APOS_TEST_EDITOR_USER / APOS_TEST_EDITOR_PASSWORD (editor).
// Bearer tokens are revoked at the end. Covers: anonymous and editor
// authorization, field validation (URLs, email, phone, lengths, integers,
// rich-text sanitization), relationships, draft/published isolation,
// navigation hiding and ordering, archive and restore, Global Content and
// duplicate-free demo seeding.

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const VERIFY_ONLY = process.argv.includes('--verify-only');
const imagesDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../demo-content/images');
const P = 'm1-014 test';
const SLUGS = {
  division: '/m1-014-test-division',
  categoryA: '/m1-014-test-division/category-a',
  categoryB: '/m1-014-test-division/category-b',
  draftPage: '/m1-014-test-division/draft-only'
};

if (process.env.CONTENT_TEST_DISPOSABLE !== '1') {
  console.error('Refusing to run: this suite writes test records. It runs from `npm run test:ci` ' +
    '(CONTENT_TEST_DISPOSABLE=1) on a throwaway database only.');
  process.exit(2);
}
for (const name of [ 'APOS_TEST_USER', 'APOS_TEST_PASSWORD', 'APOS_TEST_EDITOR_USER', 'APOS_TEST_EDITOR_PASSWORD' ]) {
  if (!process.env[name]) {
    console.error(`Set ${name}.`);
    process.exit(2);
  }
}

const results = [];
function check(name, ok, detail = '') {
  results.push(ok);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
}

// Returns { status, json } and never throws on HTTP errors.
async function call(token, method, url, body, { draft = true } = {}) {
  const sep = url.includes('?') ? '&' : '?';
  const res = await fetch(`${BASE}/api/v1/${url}${draft ? `${sep}aposMode=draft` : ''}`, {
    method,
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(body && !(body instanceof FormData) ? { 'content-type': 'application/json' } : {})
    },
    body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined)
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
// Like call(), but throws unless 2xx.
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
const page = async (p) => {
  const res = await fetch(`${BASE}${p}`);
  return {
    status: res.status,
    html: await res.text()
  };
};
const nav = (html) => html.match(/<nav class="assurer-nav"[\s\S]*?<\/nav>/)?.[0] || '';
const footer = (html) => html.match(/<footer[\s\S]*?<\/footer>/)?.[0] || '';
const findOne = async (token, type, title) => (await api(token, 'GET',
  `${type}?title=${encodeURIComponent(title)}&archived=any`)).results?.find(d => d.title === title);
const pagesFlat = async (token, draft = true) => (await api(token, 'GET', '@apostrophecms/page?all=1&flat=1&archived=any', null, { draft })).results || [];
const pageBySlug = async (token, slug, draft = true) =>
  (await pagesFlat(token, draft)).find(p => p.slug === slug);

const tokens = {};
tokens.admin = await login(process.env.APOS_TEST_USER, process.env.APOS_TEST_PASSWORD);
tokens.editor = await login(
  process.env.APOS_TEST_EDITOR_USER,
  process.env.APOS_TEST_EDITOR_PASSWORD
);
check('admin and editor log in', Boolean(tokens.admin && tokens.editor));
const editorMe = await api(tokens.editor, 'POST', '@apostrophecms/login/whoami', {}, { draft: false }).catch(() => null);
check('editor session identifies the editor account', editorMe?.username === process.env.APOS_TEST_EDITOR_USER);

if (VERIFY_ONLY) {
  await verifyAfterRestart();
  await finish();
}

// --- Demo seed ran twice without duplicates ------------------------------
for (const [ type, title ] of [
  [ 'assurer-product', 'Demo Knitted Top' ],
  [ 'assurer-organization', 'Demo Holding Group (fictional)' ],
  [ 'assurer-person', 'Alex Example (Demo)' ],
  [ 'assurer-location', 'Demo Head Office' ]
]) {
  const list = (await api(tokens.admin, 'GET', `${type}?archived=any&perPage=100`)).results || [];
  check(`demo seed is duplicate-free: ${title}`, list.filter(d => d.title === title).length === 1);
}
check('demo seed is duplicate-free: /demo-style page',
  (await pagesFlat(tokens.admin)).filter(p => p.slug === '/demo-style').length === 1);
{
  const demoCategory = await page('/demo-style/demo-apparel');
  check('demo category page public; draft demo product hidden',
    demoCategory.status === 200 && demoCategory.html.includes('Demo Knitted Top') &&
    !demoCategory.html.includes('Demo Draft Product'));
}

// --- Anonymous and editor authorization ----------------------------------
for (const type of [ 'assurer-product', 'assurer-organization', 'assurer-person', 'assurer-location' ]) {
  const r = await call(null, 'GET', type, null, { draft: false });
  check(`anonymous cannot list ${type} through the REST API`, r.status !== 200, String(r.status));
}
{
  const r = await call(null, 'POST', 'assurer-product', { title: `${P} anonymous` });
  check('anonymous cannot create a product', [ 401, 403 ].includes(r.status), String(r.status));
  const g = await api(tokens.admin, 'GET', '@apostrophecms/global');
  const globalId = g._id || g.results?.[0]?._id;
  const p = await call(null, 'PATCH', `@apostrophecms/global/${globalId}`, { footerText: 'anonymous' });
  check('anonymous cannot change Global Content', [ 401, 403, 404 ].includes(p.status), String(p.status));
  const users = await call(tokens.editor, 'GET', '@apostrophecms/user', null, { draft: false });
  // Core answers editors with an empty list rather than an error.
  check('editor cannot read user accounts', users.status !== 200 || (users.json.results || []).length === 0,
    `${users.status}, ${(users.json?.results || []).length} users`);
  const newAdmin = await call(tokens.editor, 'POST', '@apostrophecms/user', {
    username: 'm1-014-escalation',
    title: 'escalation',
    role: 'admin',
    password: 'escalation-attempt-password'
  }, { draft: false });
  check('editor cannot create an admin user', [ 401, 403, 404 ].includes(newAdmin.status), String(newAdmin.status));
  const fd = new FormData();
  fd.append('file', new Blob([ await readFile(path.join(imagesDir, 'product-home.png')) ], { type: 'image/png' }), 'anon.png');
  const anonUpload = await call(null, 'POST', '@apostrophecms/attachment/upload', fd, { draft: false });
  check('anonymous cannot upload an attachment', [ 401, 403 ].includes(anonUpload.status), String(anonUpload.status));
}

// --- Editor: images --------------------------------------------------------
async function upload(token, file, title) {
  const fd = new FormData();
  fd.append('file', new Blob([ await readFile(path.join(imagesDir, file)) ], { type: 'image/png' }), file);
  const attachment = await api(token, 'POST', '@apostrophecms/attachment/upload', fd, { draft: false });
  return api(token, 'POST', '@apostrophecms/image', {
    title,
    alt: `${title} alt text`,
    attachment
  });
}
const imgA = await upload(tokens.editor, 'product-motor.png', `${P} image A`);
const imgB = await upload(tokens.editor, 'product-business.png', `${P} image B`);
check('editor uploads images with alt text', Boolean(imgA?.attachment?._id && imgB?.alt?.includes('alt text')));

// --- Editor: organizations and URL validation -----------------------------
const ed = (method, url, body) => call(tokens.editor, method, url, body);
let r = await ed('POST', 'assurer-organization', {
  title: `${P} org`,
  shortDescription: 'Test organization.',
  websiteUrl: 'https://example.com/test',
  _logo: [ imgA ]
});
check('editor creates an organization (https website, logo)', r.status === 200 && r.json.websiteUrl === 'https://example.com/test', String(r.status));
const org = r.json;
r = await ed('POST', 'assurer-organization', {
  title: `${P} org js`,
  websiteUrl: 'javascript:alert(1)'
});
check('javascript: website is never stored', r.status >= 400 || !String(r.json.websiteUrl || '').toLowerCase().includes('javascript'),
  `${r.status} ${r.json?.websiteUrl ?? ''}`);
for (const bad of [ 'mailto:info@example.com', 'ftp://example.com/file', 'tel:+15550100' ]) {
  r = await ed('POST', 'assurer-organization', {
    title: `${P} org bad url`,
    websiteUrl: bad
  });
  check(`non-web website rejected: ${bad.split(':')[0]}`, r.status === 400, String(r.status));
}
r = await ed('PATCH', `assurer-organization/${org._id}`, { _parentOrganization: [ org ] });
check('organization cannot be part of itself', r.status === 400, String(r.status));
// Core enforces `max` on text fields by truncating server-side (the editor
// UI blocks longer input before saving).
const capped = (res, field, max) => res.status === 400 ||
  (res.status === 200 && res.json[field].length === max);
r = await ed('POST', 'assurer-organization', {
  title: `${P} org long`,
  shortDescription: 'x'.repeat(5000)
});
check('organization description capped at 300 characters', capped(r, 'shortDescription', 300), `${r.status} ${r.json?.shortDescription?.length}`);
r = await ed('POST', 'assurer-organization', {
  title: `${P} org draft`,
  shortDescription: 'Unpublished organization.'
});
const draftOrg = r.json;

// --- Editor: locations ------------------------------------------------------
const location = {
  title: `${P} location`,
  city: 'Test City',
  country: 'Testland',
  address: {
    line1: '1 Test Street',
    postalCode: '00000'
  },
  _organization: [ org ],
  showContact: true,
  publicPhone: '+1 555 0100',
  publicEmail: 'office@example.com'
};
r = await ed('POST', 'assurer-location', {
  ...location,
  city: ''
});
check('location without a city rejected', r.status === 400, String(r.status));
r = await ed('POST', 'assurer-location', {
  ...location,
  publicEmail: 'not-an-email'
});
check('location with an invalid email rejected', r.status === 400, String(r.status));
r = await ed('POST', 'assurer-location', {
  ...location,
  publicPhone: 'call me <script>'
});
check('location with an invalid phone rejected', r.status === 400, String(r.status));
r = await ed('POST', 'assurer-location', location);
check('editor creates a location linked to an organization',
  r.status === 200 && r.json.organizationIds?.includes(org.aposDocId) && r.json.address?.line1 === '1 Test Street', String(r.status));
const loc = r.json;
{
  const fresh = await api(tokens.editor, 'GET', `assurer-organization/${org._id}`);
  check('organization shows its locations (reverse relationship)', (fresh._locations || []).some(l => l.aposDocId === loc.aposDocId));
}

// --- Editor: people (privacy) ----------------------------------------------
r = await ed('POST', 'assurer-person', {
  title: `${P} person long`,
  bio: 'x'.repeat(5000)
});
check('person biography capped at 600 characters', capped(r, 'bio', 600), `${r.status} ${r.json?.bio?.length}`);
r = await ed('POST', 'assurer-person', {
  title: `${P} person`,
  jobTitle: 'Test position',
  bio: 'Test biography.',
  _organization: [ org ],
  _photo: [ imgB ],
  publicEmail: 'person@example.com',
  publicPhone: '+1 555 0199',
  email: 'person@example.com'
});
check('editor creates a person linked to an organization', r.status === 200 && r.json.organizationIds?.includes(org.aposDocId), String(r.status));
check('person schema stores no personal email or phone', r.json && !('publicEmail' in r.json) && !('publicPhone' in r.json) && !('email' in r.json));
const person = r.json;

// --- Editor: pages -----------------------------------------------------------
async function ensurePage(type, title, slug, parentId) {
  const existing = await pageBySlug(tokens.editor, slug);
  if (existing) {
    return existing;
  }
  return api(tokens.editor, 'POST', '@apostrophecms/page', {
    title,
    type,
    slug,
    _targetId: parentId,
    _position: 'lastChild'
  });
}
const division = await ensurePage('assurer-division-page', `${P} division`, SLUGS.division, '_home');
check('editor creates a division page (draft)', division?.type === 'assurer-division-page');
const catA = await ensurePage('assurer-product-category-page', `${P} category A`, SLUGS.categoryA, division._id);
const catB = await ensurePage('assurer-product-category-page', `${P} category B`, SLUGS.categoryB, division._id);
check('editor creates product category pages (draft)', catA?.type === 'assurer-product-category-page' && catB?.type === 'assurer-product-category-page');
r = await ed('PATCH', `@apostrophecms/page/${catA._id}`, {
  summary: 'Category A summary.',
  _heroImage: [ imgA ]
});
check('category page summary and header image saved', r.status === 200 && r.json.heroImageIds?.length === 1, String(r.status));
r = await ed('PATCH', `@apostrophecms/page/${division._id}`, { _organizations: [ org, draftOrg ] });
check('division page links organizations', r.status === 200 && r.json.organizationsIds?.length === 2, String(r.status));
check('draft pages are not public', (await page(SLUGS.categoryA)).status === 404);

// --- Editor: products --------------------------------------------------------
const product = {
  title: `${P} product`,
  displayTitle: `${P} product public name`,
  summary: 'Published test product.',
  _categories: [ catA ],
  _image: [ imgA ],
  _gallery: [ imgA, imgB ],
  displayOrder: 20,
  description: {
    metaType: 'area',
    items: [
      {
        metaType: 'widget',
        type: '@apostrophecms/rich-text',
        content: '<p>Safe text</p><script>alert(1)</script><p><a href="javascript:alert(2)">bad link</a></p>'
      }
    ]
  }
};
r = await ed('POST', 'assurer-product', {
  ...product,
  title: ''
});
check('product without a title rejected', r.status === 400, String(r.status));
r = await ed('POST', 'assurer-product', {
  title: `${P} product long`,
  summary: 'x'.repeat(5000)
});
check('product summary capped at 300 characters', capped(r, 'summary', 300), `${r.status} ${r.json?.summary?.length}`);
r = await ed('POST', 'assurer-product', {
  ...product,
  displayOrder: 'abc'
});
check('non-numeric display order rejected', r.status === 400, String(r.status));
r = await ed('POST', 'assurer-product', product);
check('editor creates a product with category, image and gallery',
  r.status === 200 && r.json.categoriesIds?.length === 1 &&
  r.json.galleryIds?.length === 2,
  String(r.status));
const prod = r.json;
const html0 = JSON.stringify(prod.description || {});
check('rich text is sanitized (no script, no javascript: link)', html0.includes('Safe text') && !html0.includes('<script') && !html0.includes('javascript:'));
r = await ed('POST', 'assurer-product', {
  ...product,
  title: `${P} product second`,
  displayTitle: '',
  summary: 'Second test product.',
  displayOrder: 99999
});
check('display order is limited to 9999', r.status === 200 && r.json.displayOrder === 9999, `${r.status} ${r.json?.displayOrder}`);
const prod2 = r.json;
r = await ed('POST', 'assurer-product', {
  ...product,
  title: `${P} product draft only`,
  displayTitle: '',
  summary: 'Draft-only test product.',
  displayOrder: 1
});
r = await ed('POST', 'assurer-product', {
  title: `${P} product broken relationship`,
  _categories: [ { _id: 'doesnotexist:en:draft' } ]
});
check('relationship to a missing record is not stored', r.status >= 400 || !(r.json.categoriesIds || []).includes('doesnotexist'),
  `${r.status} ${JSON.stringify(r.json?.categoriesIds)}`);

// --- Publish (editor) ---------------------------------------------------------
const publish = (type, doc) => api(tokens.editor, 'POST', `${type}/${doc._id}/publish`, {});
for (const p of [ division, catA, catB ]) {
  await publish('@apostrophecms/page', p);
}
for (const doc of [ org, loc, person ]) {
  await publish(doc.type, doc);
}
await publish('assurer-product', prod);
await publish('assurer-product', prod2);
check('editor publishes pages and records', true);

let pub = await page(SLUGS.categoryA);
check('published category page renders', pub.status === 200 && pub.html.includes(`${P} category A`) && pub.html.includes('Category A summary.'));
check('published product shown with its public name and image alt text',
  pub.html.includes(`${P} product public name`) && pub.html.includes(`${P} image A alt text`));
check('unpublished product hidden from the public page', !pub.html.includes('Draft-only test product'));
check('products listed by display order', pub.html.indexOf(`${P} product public name`) < pub.html.indexOf('Second test product.'));
check('stored script never reaches the page', !pub.html.includes('alert(1)') && !pub.html.includes('javascript:alert'));
let div = await page(SLUGS.division);
check('division page lists its category pages', div.status === 200 && div.html.includes(`${P} category A`) && div.html.includes(`${P} category B`));
check('division page shows the published organization only', div.html.includes(`${P} org`) && !div.html.includes(`${P} org draft`));
check('organization website link rendered', div.html.includes('href="https://example.com/test"'));

// --- Unpublished edits stay private ---------------------------------------------
await api(tokens.editor, 'PATCH', `assurer-product/${prod._id}`, { summary: 'Unpublished summary change.' });
pub = await page(SLUGS.categoryA);
check('unpublished product edit hidden; published version still shown',
  !pub.html.includes('Unpublished summary change.') && pub.html.includes('Published test product.'));
await api(tokens.editor, 'POST', `assurer-product/${prod._id}/revert-draft-to-published`, {});

// --- Navigation ------------------------------------------------------------------
let home = await page('/');
let menu = nav(home.html);
check('menu shows the division with a submenu of its categories',
  menu.includes(`href="${SLUGS.division}"`) && menu.includes(`href="${SLUGS.categoryA}"`) && menu.includes('assurer-nav__submenu'));
const draftPage = await ensurePage('default-page', `${P} draft-only page`, SLUGS.draftPage, division._id);
home = await page('/');
check('unpublished page not in the public menu', Boolean(draftPage) && !nav(home.html).includes(SLUGS.draftPage));
await api(tokens.editor, 'PATCH', `@apostrophecms/page/${catB._id}`, {
  _targetId: catA._id,
  _position: 'before'
});
await publish('@apostrophecms/page', catB);
menu = nav((await page('/')).html);
check('reordering pages reorders the menu', menu.indexOf(SLUGS.categoryB) > -1 && menu.indexOf(SLUGS.categoryB) < menu.indexOf(SLUGS.categoryA));
await api(tokens.editor, 'PATCH', `@apostrophecms/page/${catB._id}`, { orphan: true });
await publish('@apostrophecms/page', catB);
menu = nav((await page('/')).html);
check('"Hide in Navigation" removes the page from the menu', !menu.includes(SLUGS.categoryB) && menu.includes(SLUGS.categoryA));
check('hidden page still reachable by URL', (await page(SLUGS.categoryB)).status === 200);
check('aria-current marks the current page', nav((await page(SLUGS.categoryA)).html).includes('aria-current="page"'));

// --- Archive and restore ------------------------------------------------------------
r = await ed('PATCH', `assurer-product/${prod2._id}`, { archived: true });
pub = await page(SLUGS.categoryA);
check('archived product disappears from the public page', r.status === 200 && pub.status === 200 && !pub.html.includes('Second test product.'), String(r.status));
r = await ed('PATCH', `assurer-product/${prod2._id}`, { archived: false });
await publish('assurer-product', r.json);
pub = await page(SLUGS.categoryA);
check('restored and republished product reappears', pub.html.includes('Second test product.'));
r = await ed('PATCH', `assurer-organization/${org._id}`, { archived: true });
check('editor archives an organization in use', r.status === 200, String(r.status));
const personAfter = await call(tokens.editor, 'GET', `assurer-person/${person._id}`);
check('person still loads after its organization is archived; link not shown',
  personAfter.status === 200 && !(personAfter.json._organization || []).length,
  String(personAfter.status));
div = await page(SLUGS.division);
check('division page still renders without the archived organization', div.status === 200 && !div.html.includes(`${P} org<`));
r = await ed('PATCH', `assurer-organization/${org._id}`, { archived: false });
await publish('assurer-organization', r.json);
check('archived organization restored and republished', (await page(SLUGS.division)).html.includes(`${P} org`));

// --- Global Content -----------------------------------------------------------------
const globalDraft = await api(tokens.editor, 'GET', '@apostrophecms/global');
const g = globalDraft._id ? globalDraft : globalDraft.results[0];
const originalFooter = g.footerText || '';
r = await ed('PATCH', `@apostrophecms/global/${g._id}`, {
  socialLinks: [ {
    network: 'linkedin',
    url: 'mailto:someone@example.com'
  } ]
});
check('Global: non-web social link rejected', r.status === 400, String(r.status));
r = await ed('PATCH', `@apostrophecms/global/${g._id}`, { contactPhone: 'not a phone' });
check('Global: invalid phone rejected', r.status === 400, String(r.status));
const FOOTER = `${P} footer text`;
r = await ed('PATCH', `@apostrophecms/global/${g._id}`, {
  footerText: FOOTER,
  contactPhone: '+1 555 0123',
  socialLinks: [ {
    network: 'linkedin',
    url: 'https://www.example.com/company-page'
  } ]
});
check('editor edits Global Content (draft)', r.status === 200, String(r.status));
check('Global draft not public before publishing', !footer((await page('/')).html).includes(FOOTER));
await api(tokens.editor, 'POST', `@apostrophecms/global/${g._id}/publish`, {});
let foot = footer((await page('/')).html);
check('published Global Content appears in the footer',
  foot.includes(FOOTER) && foot.includes('href="tel:+15550123"') && foot.includes('https://www.example.com/company-page'));
await api(tokens.editor, 'PATCH', `@apostrophecms/global/${g._id}`, {
  footerText: originalFooter,
  contactPhone: '',
  socialLinks: []
});
await api(tokens.editor, 'POST', `@apostrophecms/global/${g._id}/publish`, {});
foot = footer((await page('/')).html);
check('Global Content restored', !foot.includes(FOOTER) && (!originalFooter || foot.includes(originalFooter)));

// --- Existing content unaffected ---------------------------------------------
home = await page('/');
check('home page still renders the M0 widgets', home.status === 200 && home.html.includes('assurer-hero') && home.html.includes('data-apos-form-form'));

await finish();

async function verifyAfterRestart() {
  const cat = await page(SLUGS.categoryA);
  check('after restart: category page and published product persisted',
    cat.status === 200 && cat.html.includes(`${P} product public name`) && cat.html.includes('Second test product.'));
  check('after restart: draft-only product still hidden', !cat.html.includes('Draft-only test product'));
  const menu = nav((await page('/')).html);
  check('after restart: menu order and hidden page persisted', menu.includes(SLUGS.categoryA) && !menu.includes(SLUGS.categoryB));
  const loc = await findOne(tokens.editor, 'assurer-location', `${P} location`);
  check('after restart: location keeps its organization link', (loc?.organizationIds || []).length === 1);
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
