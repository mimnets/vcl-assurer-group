// HTTP smoke test for a running local server (default http://localhost:3000).
//
//   npm run test:smoke            (server must already be running)
//   BASE_URL=http://localhost:3001 npm run test:smoke
//
// Checks public rendering, CSRF enforcement and contact-form validation
// against the real submit route. Uses only Node built-ins. Valid submissions
// are stored in the local database; nothing leaves this machine.

const BASE = process.env.BASE_URL || 'http://localhost:3000';
// Must exceed MIN_FILL_MS in modules/assurer-forms/lib/guard.js (m1-019).
const FILL_WAIT_MS = 3200;
const results = [];

function check(name, ok, detail = '') {
  results.push({
    name,
    ok
  });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
}

const home = await fetch(`${BASE}/`);
const html = await home.text();
check('GET / returns 200', home.status === 200, String(home.status));
check('demo notice rendered', html.includes('assurer-demo-notice'));
check('hero rendered', html.includes('assurer-hero'));
check('slideshow rendered with 3 slides', (html.match(/data-slide(?=[\s>])/g) || []).length === 3);
check('product cards rendered', (html.match(/class="assurer-card"/g) || []).length >= 3);
check('contact form rendered', html.includes('data-apos-form-form'));
check('no admin UI bundle for anonymous visitor', !html.includes('apos-build.js'));
// m1-019: reCAPTCHA is not offered, and the spam guard is in the form.
check('no reCAPTCHA in the page', !/recaptcha/i.test(html));
check('form spam guard rendered (fill token and hidden honeypot)',
  /data-assurer-form-fill/.test(html) && /class="assurer-form__trap" aria-hidden="true"/.test(html));

const notFound = await fetch(`${BASE}/this-page-does-not-exist`);
check('unknown URL returns 404', notFound.status === 404, String(notFound.status));

const formId = html.match(/data-apos-form-form="([^"]+)"/)?.[1];
check('form id found in markup', Boolean(formId));
const fillToken = html.match(/value="([^"]+)" data-assurer-form-fill/)?.[1];
const fillIssuedAt = Date.now();

// Apostrophe sets a CSRF cookie on page views; same-origin requests send it.
const cookie = (home.headers.getSetCookie?.() || [])
  .map(c => c.split(';')[0])
  .join('; ');

async function submit(data, { withCookie = true } = {}) {
  const body = new FormData();
  body.append('data', JSON.stringify({
    _id: formId,
    _assurerFill: fillToken,
    ...data
  }));
  const res = await fetch(`${BASE}/api/v1/@apostrophecms/form/submit`, {
    method: 'POST',
    headers: withCookie ? { cookie } : {},
    body
  });
  let json = null;
  try {
    json = await res.json();
  } catch (e) {
    // Non-JSON error body
  }
  return {
    status: res.status,
    json
  };
}

const errorFields = (r) => (r.json?.data?.formErrors || []).map(e => `${e.field}:${e.error}`);

const valid = {
  fullname: 'Smoke Test (demo)',
  email: 'smoke.test@example.com',
  company: 'Example Ltd',
  interest: 'home',
  message: 'Automated smoke test submission.',
  consent: true
};

let r = await submit(valid, { withCookie: false });
check('submission without CSRF cookie is rejected', r.status === 403, String(r.status));

// Spam guard (m1-019). These run within the minimum fill time.
r = await submit(valid);
check('submission faster than the minimum fill time rejected', r.status === 400, String(r.status));

const waitMs = Math.max(0, FILL_WAIT_MS - (Date.now() - fillIssuedAt));
await new Promise(resolve => setTimeout(resolve, waitMs));

r = await submit({
  ...valid,
  _assurerWebsite: 'https://spam.example'
});
check('submission with the honeypot filled rejected', r.status === 400, String(r.status));

r = await submit(valid);
check('valid submission accepted', r.status === 200, String(r.status));

r = await submit({});
const missing = errorFields(r);
check(
  'empty submission rejected with required-field errors',
  r.status === 400 && [ 'fullname', 'email', 'message', 'consent' ].every(f => missing.includes(`${f}:required`)),
  `${r.status} ${missing.join(',')}`
);

r = await submit({
  ...valid,
  email: 'not-an-email'
});
check(
  'malformed email rejected server-side',
  r.status === 400 && errorFields(r).includes('email:invalid'),
  `${r.status} ${errorFields(r).join(',')}`
);

r = await submit({
  ...valid,
  message: 'x'.repeat(30 * 1024)
});
check('oversized field (30KB > 20KB limit) rejected', r.status >= 400, String(r.status));

const failed = results.filter(x => !x.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
