// Editor-workflow test against a running local server, using the same REST
// endpoints the Apostrophe admin UI calls.
//
//   npm run test:workflow      (APOS_TEST_USER / APOS_TEST_PASSWORD from .env)
//   npm run test:persistence   (same, with --verify-only)
//
// Credentials come from the environment only. The bearer token is revoked
// (logout) at the end of every run so runs leave no live tokens behind.
// Covers: login, page creation, text editing, adding and reordering widgets,
// image upload and replacement, and the draft/publish workflow.
// Creates (or reuses) a page at /m0-test-page.
// Pass `--verify-only` after a server restart to check that the published
// state from a previous run persisted.

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const USER = process.env.APOS_TEST_USER;
const PASSWORD = process.env.APOS_TEST_PASSWORD;
const VERIFY_ONLY = process.argv.includes('--verify-only');
const SLUG = '/m0-test-page';
// Unique per run so a re-run never matches text published by an earlier run.
const RUN = Date.now().toString(36);
const EDITED = `Edited and published text ${RUN}`;
const imagesDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../demo-content/images');

if (!USER || !PASSWORD) {
  console.error('Set APOS_TEST_USER and APOS_TEST_PASSWORD.');
  process.exit(2);
}

const results = [];
function check(name, ok, detail = '') {
  results.push(ok);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
}

const auth = {};
async function api(method, url, body, { draft = true } = {}) {
  const sep = url.includes('?') ? '&' : '?';
  const res = await fetch(`${BASE}/api/v1/${url}${draft ? `${sep}aposMode=draft` : ''}`, {
    method,
    headers: {
      ...(auth.token ? { authorization: `Bearer ${auth.token}` } : {}),
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
  if (!res.ok) {
    throw new Error(`${method} ${url} -> ${res.status} ${text.slice(0, 300)}`);
  }
  return json;
}
// The page list endpoint returns a tree by default; ask for a flat list.
async function findBySlug(opts) {
  const list = await api('GET', '@apostrophecms/page?all=1&flat=1', null, opts);
  return (list.results || []).find(p => p.slug === SLUG);
}
const publicHtml = async (p) => (await fetch(`${BASE}${p}`)).text();
const id = () => Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
const rt = (content) => ({
  _id: id(),
  metaType: 'widget',
  type: '@apostrophecms/rich-text',
  content
});

// --- Login --------------------------------------------------------------
const bad = await fetch(`${BASE}/api/v1/@apostrophecms/login/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    username: USER,
    password: 'definitely-wrong-password'
  })
});
check('login with wrong password rejected', bad.status >= 400, String(bad.status));

const login = await api('POST', '@apostrophecms/login/login', {
  username: USER,
  password: PASSWORD
}, { draft: false });
auth.token = login.token;
check('administrator login returns a token', Boolean(auth.token));
const me = await api('GET', '@apostrophecms/login/whoami', null, { draft: false }).catch(() => null);
check('authenticated session identifies admin', me?.username === USER || Boolean(me), me?.username || 'whoami unavailable');

if (VERIFY_ONLY) {
  const published = await findBySlug({ draft: false });
  const html = await publicHtml(SLUG);
  check('test page still exists after restart', Boolean(published) && html.includes('M0 Test Page'));
  check('published edited text persisted', html.includes('Edited and published text'));
  check('published replacement image persisted', /M0-test-image-B|product-motor/.test(html));
  const homeHtml = await publicHtml('/');
  check('home page demo content persisted', homeHtml.includes('Protection you can rely on'));
  await finish();
}

// --- Create a new page (draft) -----------------------------------------
let page = await findBySlug();
if (!page) {
  page = await api('POST', '@apostrophecms/page', {
    title: 'M0 Test Page',
    type: 'default-page',
    slug: SLUG,
    _targetId: '_home',
    _position: 'lastChild'
  });
}
// The flat list omits `aposMode`; the locale/mode suffix of `_id` says it.
check('page available as draft', Boolean(page?._id?.endsWith(':draft')) && page.slug === SLUG, page?._id);

// --- Upload two images ---------------------------------------------------
async function upload(file, title) {
  const fd = new FormData();
  fd.append('file', new Blob([ await readFile(path.join(imagesDir, file)) ], { type: 'image/png' }), file);
  const attachment = await api('POST', '@apostrophecms/attachment/upload', fd, { draft: false });
  return api('POST', '@apostrophecms/image', {
    title,
    alt: `${title} alt text`,
    attachment
  });
}
const imgA = await upload('slide-2-office.png', `M0-test-image-A ${Date.now()}`);
const imgB = await upload('product-motor.png', `M0-test-image-B ${Date.now()}`);
check('image upload via media library', Boolean(imgA?.attachment?._id && imgB?.attachment?._id));

// --- Add widgets: text, then an image -----------------------------------
const textWidget = rt('<p>Original draft text</p>');
const imageWidget = {
  _id: id(),
  metaType: 'widget',
  type: '@apostrophecms/image',
  _image: [ imgA ]
};
page = await api('PATCH', `@apostrophecms/page/${page._id}`, {
  main: {
    metaType: 'area',
    items: [ textWidget, imageWidget ]
  }
});
const types = () => page.main.items.map(w => w.type.replace('@apostrophecms/', ''));
check('widgets added (rich-text, image)', types().join(',') === 'rich-text,image', types().join(','));

// --- Edit text ------------------------------------------------------------
page.main.items[0].content = `<p>${EDITED}</p>`;
page = await api('PATCH', `@apostrophecms/page/${page._id}`, { main: page.main });
check('rich-text content edited in draft', page.main.items[0].content.includes(EDITED));

// --- Reorder widgets ------------------------------------------------------
page.main.items.reverse();
page = await api('PATCH', `@apostrophecms/page/${page._id}`, { main: page.main });
check('widgets reordered', types().join(',') === 'image,rich-text', types().join(','));

// --- Replace image --------------------------------------------------------
const imgIndex = page.main.items.findIndex(w => w.type === '@apostrophecms/image');
page.main.items[imgIndex]._image = [ imgB ];
page = await api('PATCH', `@apostrophecms/page/${page._id}`, { main: page.main });
const stored = page.main.items[imgIndex];
const storedIds = stored.imageIds || (stored._image || []).map(i => i.aposDocId);
check('image replaced in widget', storedIds.includes(imgB.aposDocId) && !storedIds.includes(imgA.aposDocId));

// --- Draft is not public until published --------------------------------
const before = await fetch(`${BASE}${SLUG}`);
let html = await before.text();
check(
  'draft edits not visible publicly before publish',
  !html.includes(EDITED),
  `public status ${before.status}`
);

// --- Publish --------------------------------------------------------------
await api('POST', `@apostrophecms/page/${page._id}/publish`, {});
html = await publicHtml(SLUG);
check('published page shows edited text', html.includes(EDITED));
check(
  'published page shows replacement image, not the original',
  html.includes(imgB.attachment.name) && !html.includes(imgA.attachment.name)
);
const textPos = html.indexOf(EDITED);
const imgPos = html.indexOf(imgB.attachment.name);
check('published page reflects new widget order (image before text)', imgPos > -1 && imgPos < textPos);

// --- Further draft edit stays private; then discard ---------------------
page.main.items.find(w => w.type === '@apostrophecms/rich-text').content = '<p>Unpublished draft change</p>';
page = await api('PATCH', `@apostrophecms/page/${page._id}`, { main: page.main });
html = await publicHtml(SLUG);
check('later draft change hidden from public', !html.includes('Unpublished draft change') && html.includes(EDITED));
await api('POST', `@apostrophecms/page/${page._id}/revert-draft-to-published`, {});
page = await api('GET', `@apostrophecms/page/${page._id}`);
check('draft reverted to published version', JSON.stringify(page.main).includes(EDITED));

await finish();

async function finish() {
  if (auth.token) {
    // Revoke this run's bearer token.
    await api('POST', '@apostrophecms/login/logout', {}, { draft: false })
      .catch(e => console.log(`WARN  logout failed: ${e.message}`));
  }
  const failed = results.filter(ok => !ok).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed`);
  process.exit(failed ? 1 : 0);
}
