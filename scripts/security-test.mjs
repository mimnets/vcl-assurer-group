// HTTP security regression and negative tests for a running server (m1-011).
//
//   npm run test:security          (server must already be running)
//   BASE_URL=http://localhost:3001 npm run test:security
//
// Anonymous requests only; nothing is stored (the form attempts are
// deliberately invalid). Checks the security headers, cookie flags, that
// internal files and admin APIs are not exposed, that errors carry no stack
// traces, and the contact-form rate limit, including attempts to bypass it.
//
// The rate-limit checks use up the form quota of this machine's IP address
// for the current window (APOS_FORM_RATE_LIMIT_WINDOW_MINUTES, default 15),
// so run this suite after the smoke test, not before. Uses Node built-ins only.
//
//   node scripts/security-test.mjs --proxy
//
// Proxy mode, for a server started with APOS_HTTPS=1, APOS_TRUST_PROXY=loopback
// and APOS_HSTS_MAX_AGE (npm run test:ci does this). The test plays the part
// of a TLS-terminating proxy on the same host by sending X-Forwarded-Proto and
// X-Forwarded-For. It checks HSTS, Secure session and CSRF cookies on a real
// login (APOS_TEST_USER / APOS_TEST_PASSWORD), and that the form limit follows
// the client address the trusted proxy reports, not one the client invents.

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const MAX = Number(process.env.APOS_FORM_RATE_LIMIT_MAX || 10);
const SUBMIT = '/api/v1/@apostrophecms/form/submit';
const PROXY = process.argv.includes('--proxy');
const results = [];

function check(name, ok, detail = '') {
  results.push({
    name,
    ok
  });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
}

function checkHeaders(label, res) {
  const h = res.headers;
  check(`${label}: X-Content-Type-Options nosniff`, h.get('x-content-type-options') === 'nosniff');
  check(`${label}: X-Frame-Options SAMEORIGIN`, h.get('x-frame-options') === 'SAMEORIGIN');
  check(`${label}: Referrer-Policy same-origin`, h.get('referrer-policy') === 'same-origin');
  check(
    `${label}: CSP frame-ancestors 'self'`,
    /frame-ancestors 'self'/.test(h.get('content-security-policy') || ''),
    h.get('content-security-policy') || 'missing'
  );
  check(`${label}: no X-Powered-By`, !h.has('x-powered-by'), h.get('x-powered-by') || '');
  if (BASE.startsWith('http:') && !PROXY) {
    check(`${label}: no HSTS over plain HTTP`, !h.has('strict-transport-security'));
  }
}

function finish() {
  const failed = results.filter(x => !x.ok).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed`);
  process.exit(failed ? 1 : 0);
}

if (PROXY) {
  const viaProxy = (client, headers = {}) => ({
    'x-forwarded-proto': 'https',
    'x-forwarded-for': client,
    ...headers
  });
  const page = await fetch(`${BASE}/`, { headers: viaProxy('198.51.100.10') });
  const pageHtml = await page.text();
  check('proxied GET / returns 200', page.status === 200, String(page.status));
  checkHeaders('proxied home page', page);
  check(
    'HSTS sent when HTTPS is declared',
    /^max-age=\d+$/.test(page.headers.get('strict-transport-security') || ''),
    page.headers.get('strict-transport-security') || 'missing'
  );
  const csrf = (page.headers.getSetCookie?.() || []).find(c => /\.csrf=/.test(c)) || '';
  check('CSRF cookie is Secure, HttpOnly, SameSite=Lax', /;\s*Secure/i.test(csrf) && /;\s*HttpOnly/i.test(csrf) && /;\s*SameSite=Lax/i.test(csrf));
  const csrfPair = csrf.split(';')[0];

  if (process.env.APOS_TEST_USER && process.env.APOS_TEST_PASSWORD) {
    const res = await fetch(`${BASE}/api/v1/@apostrophecms/login/login`, {
      method: 'POST',
      headers: viaProxy('198.51.100.10', {
        'content-type': 'application/json',
        cookie: csrfPair
      }),
      body: JSON.stringify({
        username: process.env.APOS_TEST_USER,
        password: process.env.APOS_TEST_PASSWORD,
        session: true
      })
    });
    const sid = (res.headers.getSetCookie?.() || []).find(c => /\.sid=/.test(c)) || '';
    check('login over the HTTPS proxy succeeds', res.status === 200, String(res.status));
    check('session cookie is Secure, HttpOnly, SameSite=Lax', /;\s*Secure/i.test(sid) && /;\s*HttpOnly/i.test(sid) && /;\s*SameSite=Lax/i.test(sid));
    const sessionCookie = [ csrfPair, sid.split(';')[0] ].join('; ');
    const me = await fetch(`${BASE}/api/v1/@apostrophecms/login/whoami`, {
      headers: viaProxy('198.51.100.10', { cookie: sessionCookie })
    });
    const who = await me.json().catch(() => null);
    check(
      'session works on the next HTTPS request',
      me.status === 200 && who?.username === process.env.APOS_TEST_USER,
      String(me.status)
    );
    const out = await fetch(`${BASE}/api/v1/@apostrophecms/login/logout`, {
      method: 'POST',
      headers: viaProxy('198.51.100.10', { cookie: sessionCookie })
    });
    check('logout succeeds', out.status === 200, String(out.status));
  } else {
    check('APOS_TEST_USER and APOS_TEST_PASSWORD set for the login check', false);
  }

  const proxiedFormId = pageHtml.match(/data-apos-form-form="([^"]+)"/)?.[1];
  const proxiedSubmit = (forwardedFor) => {
    const body = new FormData();
    body.append('data', JSON.stringify({ _id: proxiedFormId }));
    return fetch(`${BASE}${SUBMIT}`, {
      method: 'POST',
      headers: viaProxy(forwardedFor, { cookie: csrfPair }),
      body
    });
  };
  const statuses = [];
  for (let i = 0; i <= MAX; i++) {
    statuses.push((await proxiedSubmit('198.51.100.1')).status);
  }
  check(`client A limited after ${MAX} attempts`, statuses.at(-1) === 429 && statuses.slice(0, -1).every(s => s === 400), statuses.join(','));
  const other = await proxiedSubmit('198.51.100.2');
  check('client B (other address) keeps its own quota', other.status === 400, String(other.status));
  // A client puts a fake address first; the proxy appends the real one.
  const forged = await proxiedSubmit('198.51.100.2, 198.51.100.1');
  check('client A cannot escape by prepending a forged X-Forwarded-For', forged.status === 429, String(forged.status));
  finish();
}

// --- Headers --------------------------------------------------------------
const home = await fetch(`${BASE}/`);
const html = await home.text();
check('GET / returns 200', home.status === 200, String(home.status));
checkHeaders('home page', home);

const login = await fetch(`${BASE}/login`);
check('GET /login returns 200', login.status === 200, String(login.status));
checkHeaders('login page', login);

const notFound = await fetch(`${BASE}/m1-011-no-such-page`);
check('unknown page returns 404', notFound.status === 404, String(notFound.status));
checkHeaders('404 page', notFound);

// A tracked file under public/, always served by core's static server.
const logo = await fetch(`${BASE}/images/logo.png`);
check('static file returns 200', logo.status === 200, String(logo.status));
checkHeaders('static file', logo);

// Uploaded media share that server. `npm run test:ci` keeps uploads in a
// directory that is not served, so the check is skipped there.
const upload = html.match(/(?:src|href)="(\/uploads\/[^"?]+)/)?.[1];
const uploadRes = upload ? await fetch(`${BASE}${upload}`) : null;
if (uploadRes?.status === 200) {
  checkHeaders('uploaded file', uploadRes);
} else {
  console.log(`SKIP  uploaded file headers (${upload ? `${uploadRes.status} for ${upload}` : 'no upload linked'})`);
}

// --- Cookies --------------------------------------------------------------
const setCookies = home.headers.getSetCookie?.() || [];
const csrfCookie = setCookies.find(c => /\.csrf=/.test(c));
check('CSRF cookie is set on page views', Boolean(csrfCookie));
check('CSRF cookie is HttpOnly', /;\s*HttpOnly/i.test(csrfCookie || ''));
check('CSRF cookie is SameSite=Lax', /;\s*SameSite=Lax/i.test(csrfCookie || ''));
if (BASE.startsWith('http:')) {
  // Secure cookies are only set when APOS_HTTPS=1 (behind an HTTPS proxy).
  check('CSRF cookie not marked Secure over plain HTTP', !/;\s*Secure/i.test(csrfCookie || ''));
}
const cookie = setCookies.map(c => c.split(';')[0]).join('; ');

// --- Internal files and admin APIs ---------------------------------------
const hidden = [
  '/.env',
  '/.env.example',
  '/.git/config',
  '/package.json',
  '/package-lock.json',
  '/app.js',
  '/data/vcl-assurer-group.db',
  '/modules/@apostrophecms/express/index.js',
  '/node_modules/apostrophe/package.json',
  '/security/audit-baseline.json',
  '/backups/'
];
for (const path of hidden) {
  // Follows core's trailing-slash redirect; the final answer must be 404.
  const res = await fetch(`${BASE}${path}`);
  check(`not served: ${path}`, res.status === 404, `${res.status} ${new URL(res.url).pathname}`);
}

const anonymousApi = [
  [ '/api/v1/@apostrophecms/user', [ 404 ] ],
  [ '/api/v1/@apostrophecms/global', [ 404 ] ],
  [ '/api/v1/@apostrophecms/page?aposMode=draft', [ 403 ] ]
];
for (const [ path, allowed ] of anonymousApi) {
  const res = await fetch(`${BASE}${path}`);
  check(`anonymous API refused: ${path}`, allowed.includes(res.status), String(res.status));
}

const bad = await fetch(`${BASE}/api/v1/@apostrophecms/login/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: '{bad'
});
const badBody = await bad.text();
check('malformed JSON rejected with 400', bad.status === 400, String(bad.status));
check(
  'error response has no stack trace or file paths',
  !/\bat .+:\d+:\d+|node_modules|[A-Z]:\\|"stack"/.test(badBody),
  badBody.slice(0, 80)
);

// --- Contact-form rate limit ---------------------------------------------
const formId = html.match(/data-apos-form-form="([^"]+)"/)?.[1];
check('form id found in markup', Boolean(formId));

function submit({
  path = SUBMIT, headers = {}, withCookie = true
} = {}) {
  const body = new FormData();
  // Empty submission: fails validation (400), so nothing is stored.
  body.append('data', JSON.stringify({ _id: formId }));
  return fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      ...(withCookie ? { cookie } : {}),
      ...headers
    },
    body
  });
}

const noCsrf = await submit({ withCookie: false });
check('CSRF still enforced before the rate limit (403)', noCsrf.status === 403, String(noCsrf.status));

const statuses = [];
let limited = null;
for (let i = 0; i <= MAX; i++) {
  const res = await submit();
  statuses.push(res.status);
  if (res.status === 429) {
    limited = res;
    break;
  }
}
check(
  `form submissions limited within ${MAX + 1} attempts`,
  Boolean(limited),
  statuses.join(',')
);
check(
  'attempts before the limit were processed (400, nothing stored)',
  statuses.slice(0, -1).every(s => s === 400),
  statuses.join(',')
);
if (limited) {
  const retryAfter = Number(limited.headers.get('retry-after'));
  check('429 carries Retry-After in seconds', retryAfter >= 1, String(retryAfter));
  const json = await limited.json().catch(() => null);
  check('429 body is an Apostrophe-style error', json?.name === 'too-many-requests', JSON.stringify(json));
  // The form's browser code shows "thank you" unless formErrors is present.
  check(
    '429 body carries a global form error the form UI displays',
    json?.data?.formErrors?.[0]?.global === true &&
      Boolean(json.data.formErrors[0].message)
  );
  checkHeaders('429 response', limited);

  const spoofed = await submit({ headers: { 'x-forwarded-for': '203.0.113.7' } });
  check('X-Forwarded-For from an untrusted client does not reset the limit', spoofed.status === 429, String(spoofed.status));
  const slash = await submit({ path: `${SUBMIT}/` });
  check('trailing-slash path does not bypass the limit', [ 404, 429 ].includes(slash.status), String(slash.status));
  const upper = await submit({ path: SUBMIT.toUpperCase().replace('@APOSTROPHECMS', '@apostrophecms') });
  check('upper-case path does not bypass the limit', [ 404, 429 ].includes(upper.status), String(upper.status));
  const after = await fetch(`${BASE}/`);
  check('pages still served while the form is limited', after.status === 200, String(after.status));
}

finish();
