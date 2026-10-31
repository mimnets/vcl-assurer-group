// Unit tests for the form-operations settings and formatting (m1-012).
// Run with `npm run test:unit`.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  isValidAddress, parseRetentionDays, readNotificationEnv, readRetentionEnv
} from '../modules/assurer-forms/lib/config.js';
import {
  buildNotification, csvCell, csvRow, headerText
} from '../modules/assurer-forms/lib/format.js';
import {
  HONEYPOT_FIELD, MIN_FILL_MS, TOKEN_FIELD, checkSubmission, issueFillToken
} from '../modules/assurer-forms/lib/guard.js';

const SMTP = {
  APOS_SMTP_HOST: 'smtp.example.com',
  APOS_EMAIL_FROM: 'website@example.com',
  APOS_FORM_NOTIFY_TO: 'sales@example.com'
};

test('notifications are off without APOS_SMTP_HOST', () => {
  assert.equal(readNotificationEnv({}), null);
});

test('stray SMTP settings without a host are refused', () => {
  assert.throws(() => readNotificationEnv({ APOS_SMTP_PASSWORD: 'x' }), /without APOS_SMTP_HOST/);
});

test('a complete configuration defaults to port 587 with required STARTTLS', () => {
  const config = readNotificationEnv(SMTP);
  assert.equal(config.transport.port, 587);
  assert.equal(config.transport.secure, false);
  assert.equal(config.transport.requireTLS, true);
  assert.equal(config.transport.ignoreTLS, false);
  assert.equal(config.transport.auth, undefined);
  assert.deepEqual(config.to, [ 'sales@example.com' ]);
  assert.equal(config.includeValues, false);
});

test('implicit TLS defaults to port 465', () => {
  const config = readNotificationEnv({
    ...SMTP,
    APOS_SMTP_SECURE: '1'
  });
  assert.equal(config.transport.port, 465);
  assert.equal(config.transport.secure, true);
});

test('plain SMTP is refused for a non-loopback host', () => {
  assert.throws(() => readNotificationEnv({
    ...SMTP,
    APOS_SMTP_REQUIRE_TLS: '0'
  }), /only allowed for a loopback host/);
});

test('plain SMTP is allowed for a loopback test sink', () => {
  const config = readNotificationEnv({
    ...SMTP,
    APOS_SMTP_HOST: '127.0.0.1',
    APOS_SMTP_PORT: '2525',
    APOS_SMTP_REQUIRE_TLS: '0'
  });
  assert.equal(config.transport.ignoreTLS, true);
  assert.equal(config.transport.requireTLS, false);
});

test('user and password must be set together', () => {
  assert.throws(() => readNotificationEnv({
    ...SMTP,
    APOS_SMTP_USER: 'u'
  }), /both APOS_SMTP_USER and APOS_SMTP_PASSWORD/);
});

test('configuration errors never contain the password', () => {
  const secret = 'canary-Password-1234567890';
  for (const env of [
    {
      ...SMTP,
      APOS_SMTP_PASSWORD: secret
    },
    {
      ...SMTP,
      APOS_SMTP_USER: 'u',
      APOS_SMTP_PASSWORD: secret,
      APOS_SMTP_PORT: 'x'
    },
    {
      APOS_SMTP_PASSWORD: secret
    }
  ]) {
    assert.throws(() => readNotificationEnv(env), e => !e.message.includes(secret));
  }
});

test('missing sender or recipient is refused', () => {
  assert.throws(() => readNotificationEnv({
    ...SMTP,
    APOS_EMAIL_FROM: ''
  }), /APOS_EMAIL_FROM is required/);
  assert.throws(() => readNotificationEnv({
    ...SMTP,
    APOS_FORM_NOTIFY_TO: ''
  }), /APOS_FORM_NOTIFY_TO is required/);
});

test('header-injection and display-name addresses are refused', () => {
  for (const bad of [
    'sales@example.com\r\nBcc: x@evil.test',
    'Sales <sales@example.com>',
    '"a,b"@example.com',
    'sales@example',
    'sales@@example.com',
    'sales@example.com;x@evil.test'
  ]) {
    assert.equal(isValidAddress(bad), false, bad);
    assert.throws(() => readNotificationEnv({
      ...SMTP,
      APOS_FORM_NOTIFY_TO: bad
    }), /plain email address|at most/);
  }
});

test('up to five recipients', () => {
  const five = [ 1, 2, 3, 4, 5 ].map(n => `r${n}@example.com`).join(', ');
  assert.equal(readNotificationEnv({
    ...SMTP,
    APOS_FORM_NOTIFY_TO: five
  }).to.length, 5);
  assert.throws(() => readNotificationEnv({
    ...SMTP,
    APOS_FORM_NOTIFY_TO: `${five},r6@example.com`
  }), /at most 5/);
});

test('invalid port and flags are refused', () => {
  assert.throws(() => readNotificationEnv({
    ...SMTP,
    APOS_SMTP_PORT: '0'
  }), /APOS_SMTP_PORT/);
  assert.throws(() => readNotificationEnv({
    ...SMTP,
    APOS_SMTP_SECURE: 'yes'
  }), /1 or 0/);
});

test('retention period: unset, valid, below the floor', () => {
  assert.equal(readRetentionEnv({}), null);
  assert.equal(readRetentionEnv({ APOS_FORM_RETENTION_DAYS: '180' }), 180);
  assert.throws(() => readRetentionEnv({ APOS_FORM_RETENTION_DAYS: '7' }), /30 to 3650/);
  assert.throws(() => parseRetentionDays('0'), /30 to 3650/);
  assert.throws(() => parseRetentionDays('abc'), /30 to 3650/);
});

test('header text cannot contain line breaks', () => {
  const text = headerText('Contact\r\nBcc: victim@example.com\u2028X: y');
  assert.doesNotMatch(text, /[\r\n\u2028]/);
  assert.equal(headerText('x'.repeat(300)).length, 150);
});

const submission = {
  _id: 'abc123',
  createdAt: new Date('2026-10-20T10:00:00Z'),
  formId: 'form1:en:published',
  data: {
    fullname: 'Jane Visitor',
    email: 'jane@example.com',
    message: 'Line one\r\nLine two',
    company: ''
  }
};

test('default notification carries the ID and time, but no submitted values', () => {
  const { subject, text } = buildNotification({
    submission,
    formTitle: 'Contact\r\nBcc: x@evil.test',
    includeValues: false,
    reviewUrl: '/assurer/form-submissions?form=form1'
  });
  assert.doesNotMatch(subject, /[\r\n]/);
  assert.match(text, /Submission ID: abc123/);
  assert.match(text, /Received \(UTC\): 2026-10-20T10:00:00.000Z/);
  assert.match(text, /Fields completed: fullname, email, message$/m);
  assert.doesNotMatch(text, /Jane|jane@example\.com|Line one/);
  assert.doesNotMatch(text, /<[a-z]/i);
});

test('notification with values is plain text and keeps lines indented', () => {
  const { text } = buildNotification({
    submission,
    formTitle: 'Contact',
    includeValues: true
  });
  assert.match(text, /email: jane@example\.com/);
  assert.match(text, /message: Line one\n {4}Line two/);
  assert.doesNotMatch(text, /\r/);
});

test('CSV cells are quoted and formulas neutralised', () => {
  assert.equal(csvCell('plain'), '"plain"');
  assert.equal(csvCell('say "hi"'), '"say ""hi"""');
  for (const formula of [ '=1+1', '+1', '-1', '@SUM(A1)', '\t=1', '\r=1' ]) {
    assert.ok(csvCell(formula).startsWith('"\''), formula);
  }
  assert.equal(csvCell('=HYPERLINK("http://x")'), '"\'=HYPERLINK(""http://x"")"');
  assert.equal(csvCell([ 'a', 'b' ]), '"a, b"');
  assert.equal(csvCell(null), '""');
  assert.equal(csvRow([ 'a', 1, true ]), '"a","1","true"');
});

// The project replaces upstream's form widget player (D-SEC-3). When an
// upgrade changes the upstream file, this fails: compare the new upstream
// player with modules/@apostrophecms/form-widget/ui/src/index.js, port any
// changes, then update the hash.
test('upstream form widget player is the version the override is based on', async () => {
  const file = new URL('../node_modules/@apostrophecms/form/modules/@apostrophecms/form-widget/ui/src/index.js', import.meta.url);
  const hash = createHash('sha256').update(await readFile(file)).digest('hex');
  assert.equal(hash, '80b698d8d876a99da4fb41527e4de8fcf448cc37f752e0ca6109125e0a81bf7b');
});

// ---- spam guard (m1-019) -------------------------------------------------

const SECRET = 'x'.repeat(32);
const T0 = 1798700000000;
const filled = (extra = {}) => ({
  [TOKEN_FIELD]: issueFillToken(SECRET, T0),
  ...extra
});

test('a signed token older than the minimum fill time passes', () => {
  assert.equal(checkSubmission(filled(), SECRET, T0 + MIN_FILL_MS), null);
  assert.equal(checkSubmission(filled({ [HONEYPOT_FIELD]: '' }), SECRET, T0 + 86400000), null);
});

test('a submission within the minimum fill time is rejected', () => {
  assert.equal(checkSubmission(filled(), SECRET, T0 + MIN_FILL_MS - 1), 'too-fast');
});

test('a filled honeypot is rejected, whatever its type', () => {
  for (const value of [ 'x', ' ', 0, false, [] ]) {
    assert.equal(checkSubmission(filled({ [HONEYPOT_FIELD]: value }), SECRET, T0 + 5000), 'honeypot');
  }
});

test('missing, malformed, forged and future tokens are rejected', () => {
  const now = T0 + 5000;
  assert.equal(checkSubmission({}, SECRET, now), 'token-missing');
  assert.equal(checkSubmission(null, SECRET, now), 'token-missing');
  assert.equal(checkSubmission({ [TOKEN_FIELD]: 12345 }, SECRET, now), 'token-missing');
  assert.equal(checkSubmission({ [TOKEN_FIELD]: `${T0}.short` }, SECRET, now), 'token-missing');
  const [ , signature ] = issueFillToken(SECRET, T0).split('.');
  // An older time with the signature of another time.
  assert.equal(checkSubmission({ [TOKEN_FIELD]: `${T0 - 60000}.${signature}` }, SECRET, now), 'token-invalid');
  assert.equal(checkSubmission(filled(), 'y'.repeat(32), now), 'token-invalid');
  const future = issueFillToken(SECRET, now + 120000);
  assert.equal(checkSubmission({ [TOKEN_FIELD]: future }, SECRET, now), 'token-invalid');
});

test('the browser player sends the same field names as the guard', async () => {
  const player = await readFile(new URL('../modules/@apostrophecms/form-widget/ui/src/index.js', import.meta.url), 'utf8');
  const template = await readFile(new URL('../modules/@apostrophecms/form-widget/views/widget.jsx', import.meta.url), 'utf8');
  for (const source of [ player, template ]) {
    assert.ok(source.includes(`'${HONEYPOT_FIELD}'`) && source.includes(`'${TOKEN_FIELD}'`));
  }
  assert.ok(!/from '[^']*recaptcha/.test(player), 'upstream recaptcha.js must not be imported');
});
