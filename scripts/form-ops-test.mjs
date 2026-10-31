// Form operations end-to-end tests for a running server (m1-012).
//
//   npm run test:forms       (dev server; .env supplies the test admin)
//   npm run test:ci          (isolated run with an SMTP sink; all checks)
//
// Covers valid and invalid submissions, repeated submissions, notification
// email content (no submitted values by default, no header injection),
// notification failure (rejected credentials, unreachable server) without
// rejecting the visitor, the retry task, administrator access and the CSV
// export (formula neutralisation, escaping), refusal for anonymous users and
// editors, 403 and 500 answers, SMTP credential secrecy, and the retention
// task (dry run; deletion only on a disposable database).
//
// Environment:
//   BASE_URL                         server (default http://localhost:3000)
//   APOS_TEST_USER / APOS_TEST_PASSWORD  an admin account
//   FORM_OPS_SMTP_PORT               the server's APOS_SMTP_PORT. When set, the
//                                    test runs an SMTP sink there and checks
//                                    email; otherwise email checks are SKIPPED.
//   APOS_SMTP_PASSWORD, APOS_EMAIL_FROM, APOS_FORM_NOTIFY_TO
//                                    the server's values, to check secrecy and
//                                    addressing
//   SERVER_LOG                       server log file, scanned for leaks
//   FORM_OPS_DISPOSABLE=1            also test retention deletion (refused by
//                                    the task unless the database is a
//                                    temporary SQLite file)
//
// Creates one disposable editor account and archives it at the end. Clears
// the form rate-limit counters before and after, because this suite submits
// more often than the per-IP limit allows. Uses Node built-ins only.

import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startSmtpSink } from './smtp-sink.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const SUBMIT = '/api/v1/@apostrophecms/form/submit';
const PAGE = '/assurer/form-submissions';
const EXPORT = '/assurer/form-submissions/export.csv';
const SMTP_PORT = process.env.FORM_OPS_SMTP_PORT
  ? Number(process.env.FORM_OPS_SMTP_PORT)
  : null;
const CANARY = process.env.APOS_SMTP_PASSWORD || null;
const DISPOSABLE = process.env.FORM_OPS_DISPOSABLE === '1';
const results = [];
const bodies = [];
const run = randomBytes(4).toString('hex');

function check(name, ok, detail = '') {
  results.push({
    name,
    ok
  });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
}

function skip(name, reason) {
  results.push({
    name,
    ok: true,
    skipped: true
  });
  console.log(`SKIP  ${name}  (${reason})`);
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function waitFor(fn, ms = 15000) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    const value = await fn();
    if (value) {
      return value;
    }
    await sleep(250);
  }
  return null;
}

function task(args, extraEnv = {}) {
  return new Promise(resolve => {
    const child = spawn(process.execPath, [ 'app', ...args ], {
      cwd: root,
      env: {
        ...process.env,
        ...extraEnv
      },
      stdio: [ 'ignore', 'pipe', 'pipe' ]
    });
    let output = '';
    child.stdout.on('data', d => (output += d));
    child.stderr.on('data', d => (output += d));
    child.on('exit', code => resolve({
      code,
      output
    }));
  });
}

async function record(res) {
  const text = await res.text();
  bodies.push(text);
  return text;
}

function cookiesOf(res, jar = {}) {
  for (const c of res.headers.getSetCookie?.() || []) {
    const [ pair ] = c.split(';');
    const index = pair.indexOf('=');
    jar[pair.slice(0, index)] = pair.slice(index + 1);
  }
  return jar;
}

const cookieHeader = jar => Object.entries(jar).map(([ k, v ]) => `${k}=${v}`).join('; ');

// Minimal CSV reader for the export format (every cell quoted).
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  const input = text.replace(/^\ufeff/, '');
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (quoted) {
      if (ch === '"' && input[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else if (ch !== '\r') {
      cell += ch;
    }
  }
  return rows;
}

// ---- setup -------------------------------------------------------------

let sink = null;
if (SMTP_PORT) {
  sink = await startSmtpSink({ port: SMTP_PORT });
}
await task([ 'assurer-security:clear-form-rate-limit' ]);

const home = await fetch(`${BASE}/`);
const homeHtml = await home.text();
const visitor = cookiesOf(home);
const formId = homeHtml.match(/data-apos-form-form="([^"]+)"/)?.[1];
check('home page renders the contact form', home.status === 200 && Boolean(formId));
// Spam guard (m1-019, modules/assurer-forms/lib/guard.js): every submission
// carries the page's fill token, sent after the minimum fill time.
const fillToken = homeHtml.match(/value="([^"]+)" data-assurer-form-fill/)?.[1];
check('form carries a fill token', Boolean(fillToken));

const valid = (marker, extra = {}) => ({
  fullname: 'Form Ops Test (demo)',
  email: 'form.ops@example.com',
  company: 'Example Ltd',
  interest: 'home',
  message: `Automated form-operations test ${marker}`,
  consent: true,
  ...extra
});

async function submit(data, {
  key, withCookie = true, raw
} = {}) {
  const body = new FormData();
  body.append('data', raw ?? JSON.stringify({
    _id: formId,
    _assurerFill: fillToken,
    ...data
  }));
  const headers = withCookie ? { cookie: cookieHeader(visitor) } : {};
  if (key) {
    headers['x-assurer-submission-key'] = key;
  }
  const res = await fetch(`${BASE}${SUBMIT}`, {
    method: 'POST',
    headers,
    body
  });
  const text = await record(res);
  let json = null;
  try {
    json = JSON.parse(text);
  } catch (e) {
    // not JSON
  }
  return {
    status: res.status,
    stored: res.headers.get('x-assurer-submission') === 'stored',
    json,
    text
  };
}

// Unfolds a header and decodes RFC 2047 encoded words (UTF-8, Q or B).
function headerValue(head, name) {
  const unfolded = head.replace(/\r\n[ \t]+/g, ' ');
  const line = unfolded.split('\r\n').find(l => l.toLowerCase().startsWith(`${name.toLowerCase()}:`));
  if (!line) {
    return null;
  }
  return line.slice(name.length + 1).trim()
    .replace(/\?=\s+=\?/g, '?==?')
    .replace(/=\?UTF-8\?([QB])\?([^?]*)\?=/gi, (all, kind, text) => (kind.toUpperCase() === 'B'
      ? Buffer.from(text, 'base64').toString('utf8')
      : Buffer.from(text.replace(/_/g, ' ').replace(/=([0-9A-F]{2})/gi, (m, h) => String.fromCharCode(parseInt(h, 16))), 'latin1').toString('utf8')));
}

// ---- anonymous access ----------------------------------------------------

for (const url of [ PAGE, EXPORT, `${PAGE}?page=2` ]) {
  const res = await fetch(`${BASE}${url}`);
  await record(res);
  check(`anonymous GET ${url} → 404`, res.status === 404, String(res.status));
  check(`anonymous GET ${url} is not cacheable`, res.headers.get('cache-control') === 'no-store');
}

// ---- admin session -------------------------------------------------------

async function sessionLogin(username, password) {
  const start = await fetch(`${BASE}/login`);
  const jar = cookiesOf(start);
  const res = await fetch(`${BASE}/api/v1/@apostrophecms/login/login`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      cookie: cookieHeader(jar)
    },
    body: JSON.stringify({
      username,
      password,
      session: true
    })
  });
  cookiesOf(res, jar);
  return res.status === 200 ? jar : null;
}

const admin = await sessionLogin(
  process.env.APOS_TEST_USER,
  process.env.APOS_TEST_PASSWORD
);
check('admin session login', Boolean(admin));

async function exportCsv(jar = admin, query = '') {
  const res = await fetch(`${BASE}${EXPORT}${query}`, { headers: { cookie: cookieHeader(jar) } });
  const text = await record(res);
  return {
    res,
    text,
    rows: res.status === 200 ? parseCsv(text) : []
  };
}

async function findRow(marker) {
  const { rows } = await exportCsv();
  const [ header ] = rows;
  const row = rows.slice(1).find(r => r.some(cell => cell.includes(marker)));
  return row ? Object.fromEntries(header.map((h, i) => [ h, row[i] ])) : null;
}

const mailFor = id => id && sink.messages.find(m => m.raw.includes(id));

const countRows = async () => (await exportCsv()).rows.length - 1;

// ---- spam guard (m1-019) --------------------------------------------------

const guardCount = await countRows();
let r = await submit(valid(`fast-${run}`));
check('submission within the minimum fill time → 400, not stored', r.status === 400 && !r.stored, String(r.status));
await sleep(3200);
r = await submit(valid(`notoken-${run}`, { _assurerFill: undefined }));
check('submission without a fill token → 400', r.status === 400 && !r.stored, String(r.status));
r = await submit(valid(`forged-${run}`, { _assurerFill: `${Date.now() - 60000}.${'A'.repeat(43)}` }));
check('submission with a forged fill token → 400', r.status === 400 && !r.stored, String(r.status));
r = await submit(valid(`trap-${run}`, { _assurerWebsite: 'https://spam.example' }));
check('submission with the honeypot filled → 400 with a visible message', r.status === 400 &&
  r.json?.data?.formErrors?.[0]?.global === true, String(r.status));
check('guard rejections stored nothing', await countRows() === guardCount);
r = await submit({ _assurerWebsite: 'x' });
check('missing fields are reported before the spam guard', r.status === 400 &&
  r.json?.data?.formErrors?.some(e => e.field === 'email'), String(r.status));
await task([ 'assurer-security:clear-form-rate-limit' ]);

// ---- valid submission and notification -----------------------------------

const before = await countRows();
const key1 = `test-${randomBytes(12).toString('hex')}`;
const marker1 = `m1-${run}`;
r = await submit(valid(marker1), { key: key1 });
check('valid submission accepted (200 with X-Assurer-Submission: stored)', r.status === 200 && r.stored, String(r.status));
check('valid submission stored once', await countRows() === before + 1);
const row1 = await findRow(marker1);
check('stored submission has an ID and UTC time in the export', Boolean(row1?.submission_id) && /Z$/.test(row1?.received_utc || ''));

if (sink) {
  const mail = await waitFor(() => mailFor(row1?.submission_id));
  check('notification email delivered to the local sink', Boolean(mail));
  if (mail) {
    const [ head, ...rest ] = mail.raw.split('\r\n\r\n');
    const text = rest.join('\r\n\r\n');
    const expectedTo = (process.env.APOS_FORM_NOTIFY_TO || '').split(',').map(s => `<${s.trim()}>`);
    check('envelope recipients are exactly APOS_FORM_NOTIFY_TO', JSON.stringify(mail.to) === JSON.stringify(expectedTo), mail.to.join(','));
    check('envelope sender is APOS_EMAIL_FROM', mail.from === `<${process.env.APOS_EMAIL_FROM}>`, mail.from);
    const subject = headerValue(head, 'Subject');
    check('subject names the form, on one header line', subject === 'New website form submission: DEMO – Contact Assurer', subject);
    check('body has submission ID and UTC timestamp', text.includes(`Submission ID: ${row1.submission_id}`) && text.includes(`Received (UTC): ${row1.received_utc}`));
    check('body has no submitted values by default', !text.includes(marker1) && !text.includes('form.ops@example.com') && !text.includes('Form Ops Test'));
    check('plain text only (no HTML part)', /^Content-Type: text\/plain/mi.test(head) && !/text\/html/i.test(mail.raw));
  }
  const status = await waitFor(async () => (await findRow(marker1))?.notification_status === 'sent');
  check('notification status recorded as sent', Boolean(status));
} else {
  skip('notification email delivered to the local sink', 'FORM_OPS_SMTP_PORT not set');
  check('notification status recorded as disabled when SMTP is not configured', row1?.notification_status === 'disabled', row1?.notification_status);
}

// ---- repeated submission ------------------------------------------------

const messagesBefore = sink?.messages.length;
r = await submit(valid(marker1), { key: key1 });
check('retry with the same submission key answered as accepted', r.status === 200 && r.stored, String(r.status));
check('retry did not store a second copy', await countRows() === before + 1);
if (sink) {
  await sleep(2000);
  check('retry sent no second notification', sink.messages.length === messagesBefore);
}
r = await submit(valid(`badkey-${run}`), { key: 'short' });
check('malformed submission key is ignored (normal processing)', r.status === 200, String(r.status));

// The replay middleware must run before the rate limit (middleware `before`,
// see upstream issue #4060), so a visitor retrying an accepted submission is
// not told "too many submissions".
const max = Number(process.env.APOS_FORM_RATE_LIMIT_MAX || 10);
let limited = null;
for (let i = 0; i <= max && limited?.status !== 429; i++) {
  limited = await submit({});
}
check('rate limit reached for this client', limited.status === 429, String(limited.status));
r = await submit(valid(marker1), { key: key1 });
check('accepted submission replays as stored while rate-limited', r.status === 200 && r.stored, String(r.status));
await task([ 'assurer-security:clear-form-rate-limit' ]);

// ---- invalid, CSRF, 500 --------------------------------------------------

let count = await countRows();
r = await submit({});
check('invalid submission → 400 with field errors, no stored confirmation', r.status === 400 && Array.isArray(r.json?.data?.formErrors) && !r.stored, String(r.status));
r = await submit(valid(`csrf-${run}`), { withCookie: false });
check('submission without the CSRF cookie → 403 without stored confirmation', r.status === 403 && !r.stored, String(r.status));
r = await submit(null, { raw: '{not json' });
check('malformed request → 500', r.status === 500, String(r.status));
check('500 carries no stored confirmation', !r.stored);
check('500 body has no stack trace or file path', !/\bat \S+ \(|\.m?js:\d+/.test(r.text), r.text.slice(0, 120));
check('500 body carries no formErrors (client must not treat it as success)', !r.json?.data?.formErrors);
check('rejected requests stored nothing', await countRows() === count);

// ---- injection, escaping and CSV safety ---------------------------------

const marker2 = `m2-${run}`;
r = await submit(valid(marker2, {
  fullname: '<img src=x onerror=alert(1)>',
  company: '=HYPERLINK("http://evil.test","x")',
  interest: 'motor',
  message: `${marker2}\r\nBcc: injected@evil.test\r\nSubject: spoofed`
}));
check('submission with markup, formula and CRLF values accepted', r.status === 200, String(r.status));
const row2 = await findRow(marker2);
const csv = await exportCsv();
check('export is CSV, attachment, not cacheable',
  csv.res.status === 200 &&
  /^text\/csv/.test(csv.res.headers.get('content-type') || '') &&
  /^attachment; filename="form-submissions-\d{8}\.csv"$/.test(csv.res.headers.get('content-disposition') || '') &&
  csv.res.headers.get('cache-control') === 'no-store');
check('export header row', csv.rows[0]?.slice(0, 4).join(',') === 'submission_id,received_utc,form,notification_status', csv.rows[0]?.join(','));
check('formula cell neutralised with a leading apostrophe', row2?.company === '\'=HYPERLINK("http://evil.test","x")', row2?.company);
check('raw CSV quotes the formula cell', csv.text.includes('"\'=HYPERLINK(""http://evil.test"",""x"")"'));
check('export has no internal fields', !/aposMode|aposLocale|"data"|createdAt/.test(csv.rows[0].join(',')));
if (sink) {
  const mail = await waitFor(() => mailFor(row2?.submission_id));
  check('injected Bcc did not add a recipient', Boolean(mail) && !mail.to.some(t => t.includes('evil.test')), mail?.to.join(','));
  check('no injected header in the message', Boolean(mail) && !/^(Bcc|Subject: spoofed)/mi.test(mail.raw));
} else {
  skip('injected Bcc did not add a recipient', 'FORM_OPS_SMTP_PORT not set');
}

const page = await fetch(`${BASE}${PAGE}`, { headers: { cookie: cookieHeader(admin) } });
const pageHtml = await record(page);
check('admin page 200, HTML, not cacheable, noindex',
  page.status === 200 && /^text\/html/.test(page.headers.get('content-type') || '') &&
  page.headers.get('cache-control') === 'no-store' && /noindex/.test(page.headers.get('x-robots-tag') || ''));
check('admin page lists the submission', pageHtml.includes(row1?.submission_id));
check('admin page escapes submitted markup', pageHtml.includes('&lt;img src=x') && !pageHtml.includes('<img src=x'));
check('admin page keeps the security headers', page.headers.get('x-frame-options') === 'SAMEORIGIN' && page.headers.get('x-content-type-options') === 'nosniff');
for (const [ query, label ] of [ [ '?page=0', 'page 0' ], [ '?page=abc', 'non-numeric page' ], [ '?form=%3Cx%3E', 'invalid form id' ] ]) {
  const res = await fetch(`${BASE}${PAGE}${query}`, { headers: { cookie: cookieHeader(admin) } });
  await record(res);
  check(`admin page rejects ${label} (400)`, res.status === 400, String(res.status));
}
const badDate = await exportCsv(admin, '?since=2026-13-45');
check('export rejects an invalid date (400)', badDate.res.status === 400, String(badDate.res.status));
const narrow = await exportCsv(admin, '?since=2000-01-01&until=2000-01-02');
check('export date filter works (header only)', narrow.res.status === 200 && narrow.rows.length === 1, String(narrow.rows.length));

// ---- editor is refused ---------------------------------------------------

async function bearerLogin() {
  const res = await fetch(`${BASE}/api/v1/@apostrophecms/login/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      username: process.env.APOS_TEST_USER,
      password: process.env.APOS_TEST_PASSWORD
    })
  });
  return (await res.json()).token;
}
const token = await bearerLogin();
const api = (method, url, body) => fetch(`${BASE}/api/v1/${url}`, {
  method,
  headers: {
    authorization: `Bearer ${token}`,
    'content-type': 'application/json'
  },
  body: body && JSON.stringify(body)
});
const editorName = `m1-012-forms-editor-${run}`;
const editorPassword = randomBytes(18).toString('hex');
const created = await api('POST', '@apostrophecms/user', {
  username: editorName,
  title: editorName,
  password: editorPassword,
  role: 'editor'
});
const editorDoc = await created.json();
check('disposable editor created (admin REST API)', created.status === 200 && editorDoc.role === 'editor', String(created.status));
const editor = await sessionLogin(editorName, editorPassword);
check('editor session login', Boolean(editor));
for (const url of [ PAGE, EXPORT ]) {
  const res = await fetch(`${BASE}${url}`, { headers: { cookie: cookieHeader(editor || {}) } });
  await record(res);
  check(`editor GET ${url} → 404`, res.status === 404, String(res.status));
}
const archived = await api('PATCH', `@apostrophecms/user/${editorDoc._id}`, { archived: true });
check('disposable editor archived', archived.status === 200, String(archived.status));

// ---- notification failure, secrecy and retry ------------------------------

if (sink) {
  sink.mode = 'reject-auth';
  const marker3 = `m3-${run}`;
  r = await submit(valid(marker3));
  check('submission accepted although SMTP rejects the credentials', r.status === 200, String(r.status));
  const failedAuth = await waitFor(async () => {
    const row = await findRow(marker3);
    return row?.notification_status === 'failed' ? row : null;
  });
  check('notification recorded as failed after an SMTP auth error', Boolean(failedAuth));
  const pageAfter = await record(await fetch(`${BASE}${PAGE}`, { headers: { cookie: cookieHeader(admin) } }));
  check('admin page shows the failure with a code only', /Notification: failed \(EAUTH 535\)/.test(pageAfter));

  await sink.close();
  const marker4 = `m4-${run}`;
  r = await submit(valid(marker4));
  check('submission accepted although the SMTP server is unreachable', r.status === 200, String(r.status));
  const failedConnection = await waitFor(async () => {
    const row = await findRow(marker4);
    return row?.notification_status === 'failed' ? row : null;
  }, 40000);
  check('notification recorded as failed when the server is unreachable', Boolean(failedConnection));

  sink = await startSmtpSink({ port: SMTP_PORT });
  const retry = await task([ 'assurer-forms:retry-notifications' ]);
  check('retry task succeeds', retry.code === 0 && /Notifications retried: \d+; sent: \d+/.test(retry.output), retry.output.trim().split('\n').at(-1));
  const resent = await waitFor(async () => {
    const a = await findRow(marker3);
    const b = await findRow(marker4);
    return a?.notification_status === 'sent' && b?.notification_status === 'sent';
  });
  check('failed notifications sent on retry', Boolean(resent));

  const exported = (await exportCsv()).text;
  const logText = process.env.SERVER_LOG ? await readFile(process.env.SERVER_LOG, 'utf8').catch(() => '') : '';
  if (CANARY) {
    check('SMTP password absent from every HTTP response', !bodies.some(b => b.includes(CANARY)));
    check('SMTP password absent from the export and task output', !exported.includes(CANARY) && !retry.output.includes(CANARY));
    if (logText) {
      check('SMTP password absent from the server log', !logText.includes(CANARY));
    } else {
      skip('SMTP password absent from the server log', 'SERVER_LOG not set');
    }
  } else {
    skip('SMTP password secrecy', 'APOS_SMTP_PASSWORD not set for the server');
  }
  if (logText) {
    check('server log records notification failures', /notification-failed/.test(logText));
    check('server log holds no submitted content', !logText.includes(marker3) && !logText.includes('form.ops@example.com'));
  }
} else {
  skip('notification failure, retry and secrecy checks', 'FORM_OPS_SMTP_PORT not set');
}

// ---- retention -------------------------------------------------------------

count = await countRows();
let ret = await task([ 'assurer-forms:retention', '--days=30' ], { APOS_FORM_RETENTION_DAYS: '' });
check('retention dry run reports counts', ret.code === 0 && /Dry run: .*retention 30 days/.test(ret.output) && /Matching: \d+ of \d+ stored submissions/.test(ret.output),
  (ret.output.match(/Matching: .*/) || [ ret.output.trim().split('\n').at(-1) ])[0]);
check('dry run deleted nothing', await countRows() === count);
ret = await task([ 'assurer-forms:retention', '--execute' ], { APOS_FORM_RETENTION_DAYS: '' });
check('deletion refused without the approved APOS_FORM_RETENTION_DAYS', ret.code !== 0 && /APOS_FORM_RETENTION_DAYS/.test(ret.output));
ret = await task([ 'assurer-forms:retention', '--days=7' ], { APOS_FORM_RETENTION_DAYS: '' });
check('retention below 30 days refused', ret.code !== 0 && /30 to 3650/.test(ret.output));
check('refused runs deleted nothing', await countRows() === count);

if (DISPOSABLE) {
  const back = await task([ 'assurer-test:backdate-submissions', '--days=400', '--count=2' ]);
  check('test task backdated two submissions', back.code === 0 && /Backdated 2 submissions/.test(back.output));
  ret = await task([ 'assurer-forms:retention', '--days=365' ], { APOS_FORM_RETENTION_DAYS: '' });
  check('dry run finds exactly the two old submissions', /Matching: 2 of /.test(ret.output), (ret.output.match(/Matching: .*/) || [ '' ])[0]);
  ret = await task([ 'assurer-forms:retention', '--execute', '--days=200' ], { APOS_FORM_RETENTION_DAYS: '365' });
  check('deletion refused when --days differs from the approved period', ret.code !== 0 && /differs/.test(ret.output));
  ret = await task([ 'assurer-forms:retention', '--execute' ], { APOS_FORM_RETENTION_DAYS: '365' });
  check('deletion with the approved period removes the two old submissions', ret.code === 0 && /Deleted: 2\./.test(ret.output), (ret.output.match(/Deleted: .*/) || [ '' ])[0]);
  check('newer submissions kept', await countRows() === count - 2);
  const after = await fetch(`${BASE}/`);
  const afterHtml = await after.text();
  check('pages and the form itself are untouched', after.status === 200 && afterHtml.includes(`data-apos-form-form="${formId}"`));
} else {
  skip('retention deletion', 'FORM_OPS_DISPOSABLE not set (deletion runs only on a disposable database)');
}

// ---- cleanup ---------------------------------------------------------------

await api('POST', '@apostrophecms/login/logout', {});
await fetch(`${BASE}/api/v1/@apostrophecms/login/logout`, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    cookie: cookieHeader(admin || {})
  },
  body: '{}'
});
await sink?.close();
await task([ 'assurer-security:clear-form-rate-limit' ]);

const failed = results.filter(x => !x.ok).length;
const skipped = results.filter(x => x.skipped).length;
console.log(`\n${results.length - failed - skipped}/${results.length - skipped} checks passed, ${skipped} skipped`);
process.exit(failed ? 1 : 0);
