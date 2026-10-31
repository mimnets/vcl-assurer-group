// Contact-form spam guard (m1-019, D-FORM-3): a honeypot field and a minimum
// fill time. No third party, no cookie, no dependency.
//
// The page renders a fill token, `<issued ms>.<signature>`, into the form.
// The signature is an HMAC of the time, keyed from APOS_SESSION_SECRET, so a
// client cannot make up an older time to skip the wait. The browser sends the
// token and the honeypot value with the submission; the server checks both
// after field validation, before the submission is stored.
//
// There is no maximum age: a page that stayed open, or was served from a
// cache, still works. A bot that waits the minimum time and leaves the
// honeypot empty gets through; the per-IP rate limit (m1-011) still applies.

import { createHmac, timingSafeEqual } from 'node:crypto';

export const MIN_FILL_MS = 3000;
// Names inside the submitted JSON. Upstream stores only the form's own
// fields, so these never reach the stored submission.
export const HONEYPOT_FIELD = '_assurerWebsite';
export const TOKEN_FIELD = '_assurerFill';

const TOKEN = /^(\d{13})\.([A-Za-z0-9_-]{43})$/;
// Allow for a small clock difference between application servers.
const CLOCK_SKEW_MS = 60 * 1000;

function sign(secret, issuedAt) {
  return createHmac('sha256', `assurer-form-fill:${secret}`)
    .update(String(issuedAt))
    .digest('base64url');
}

export function issueFillToken(secret, now = Date.now()) {
  return `${now}.${sign(secret, now)}`;
}

// Returns null when the submission passes, otherwise a reason code (never
// the submitted values) for the log.
export function checkSubmission(input, secret, now = Date.now()) {
  const honeypot = input?.[HONEYPOT_FIELD];
  if (honeypot !== undefined && honeypot !== '') {
    return 'honeypot';
  }
  const token = input?.[TOKEN_FIELD];
  const match = typeof token === 'string' && TOKEN.exec(token);
  if (!match) {
    return 'token-missing';
  }
  const issuedAt = Number(match[1]);
  const expected = Buffer.from(sign(secret, issuedAt));
  const given = Buffer.from(match[2]);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return 'token-invalid';
  }
  if (issuedAt > now + CLOCK_SKEW_MS) {
    return 'token-invalid';
  }
  if (now - issuedAt < MIN_FILL_MS) {
    return 'too-fast';
  }
  return null;
}
