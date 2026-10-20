// Environment-driven form notification and retention settings (m1-012).
//
// Everything is off by default. Without APOS_SMTP_HOST no email is sent, and
// submissions are recorded with notification status "disabled". Invalid or
// unsafe combinations throw at startup, as lib/config.js in assurer-security
// does, instead of silently sending mail somewhere unexpected.
//
//   APOS_SMTP_HOST            SMTP server. Setting it turns notifications on.
//   APOS_SMTP_PORT            Default 587 (STARTTLS), or 465 with APOS_SMTP_SECURE=1.
//   APOS_SMTP_SECURE=1        Implicit TLS from the first byte (usually port 465).
//   APOS_SMTP_REQUIRE_TLS=0   Allow a plain connection. Only accepted for a
//                             loopback host (a local test sink); every other
//                             host must use TLS, so credentials and message
//                             content never cross a network in clear text.
//   APOS_SMTP_USER, APOS_SMTP_PASSWORD
//                             Both or neither. Secret store / .env only.
//   APOS_EMAIL_FROM           Sender address (an address of the company's own
//                             domain, covered by its SPF/DKIM records).
//   APOS_FORM_NOTIFY_TO       Company mailbox(es) that receive notifications:
//                             up to 5 addresses, comma-separated. Fixed by the
//                             operator: neither visitors nor editors can
//                             choose recipients.
//   APOS_FORM_NOTIFY_INCLUDE_VALUES=1
//                             Put the submitted field values in the email.
//                             Off by default: the email then carries only the
//                             submission ID, time, form and field names, and
//                             staff read the content in the admin page.
//   APOS_FORM_RETENTION_DAYS  The owner-approved retention period. Required
//                             before the retention task may delete anything
//                             (see the retention task). Unset: nothing can be
//                             deleted.

import net from 'node:net';

// Deliberately strict: a plain address, no display name, no quotes, no
// whitespace, no characters that could end or extend an email header.
const ADDRESS = /^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,63}$/;
const MAX_RECIPIENTS = 5;
export const MIN_RETENTION_DAYS = 30;
const MAX_RETENTION_DAYS = 3650;

function fail(message) {
  throw new Error(`Form configuration: ${message}`);
}

function isSet(value) {
  return value !== undefined && String(value).trim() !== '';
}

function parseFlag(name, value, fallback) {
  if (!isSet(value)) {
    return fallback;
  }
  const text = String(value).trim();
  if (text === '1') {
    return true;
  }
  if (text === '0') {
    return false;
  }
  return fail(`${name} must be 1 or 0.`);
}

function parseInteger(name, value, min, max) {
  const text = String(value).trim();
  const number = Number(text);
  if (!/^\d+$/.test(text) || number < min || number > max) {
    fail(`${name} must be a whole number from ${min} to ${max}.`);
  }
  return number;
}

export function isValidAddress(value) {
  return typeof value === 'string' && value.length <= 254 && ADDRESS.test(value);
}

function parseAddress(name, value) {
  const text = String(value).trim();
  if (!isValidAddress(text)) {
    fail(`${name} must be a plain email address such as forms@example.com.`);
  }
  return text;
}

function isLoopbackHost(host) {
  if (host === 'localhost') {
    return true;
  }
  if (net.isIP(host) === 4) {
    return host.startsWith('127.');
  }
  return host === '::1';
}

// Returns null when notifications are off, otherwise the settings needed to
// build a nodemailer transport and address the message.
export function readNotificationEnv(env = process.env) {
  if (!isSet(env.APOS_SMTP_HOST)) {
    const stray = [ 'APOS_SMTP_USER', 'APOS_SMTP_PASSWORD', 'APOS_FORM_NOTIFY_TO', 'APOS_EMAIL_FROM' ]
      .filter(name => isSet(env[name]));
    if (stray.length) {
      fail(`${stray.join(', ')} set without APOS_SMTP_HOST. Set APOS_SMTP_HOST to send ` +
        'notifications, or remove these variables.');
    }
    return null;
  }
  const host = String(env.APOS_SMTP_HOST).trim();
  if (!/^[A-Za-z0-9.:-]{1,253}$/.test(host)) {
    fail('APOS_SMTP_HOST must be a host name or IP address.');
  }
  const secure = parseFlag('APOS_SMTP_SECURE', env.APOS_SMTP_SECURE, false);
  const port = isSet(env.APOS_SMTP_PORT)
    ? parseInteger('APOS_SMTP_PORT', env.APOS_SMTP_PORT, 1, 65535)
    : (secure ? 465 : 587);
  const requireTls = parseFlag('APOS_SMTP_REQUIRE_TLS', env.APOS_SMTP_REQUIRE_TLS, true);
  if (!requireTls && !secure && !isLoopbackHost(host)) {
    fail('APOS_SMTP_REQUIRE_TLS=0 is only allowed for a loopback host (a local test sink).');
  }
  if (isSet(env.APOS_SMTP_USER) !== isSet(env.APOS_SMTP_PASSWORD)) {
    fail('Set both APOS_SMTP_USER and APOS_SMTP_PASSWORD, or neither.');
  }
  if (!isSet(env.APOS_EMAIL_FROM)) {
    fail('APOS_EMAIL_FROM is required when APOS_SMTP_HOST is set.');
  }
  if (!isSet(env.APOS_FORM_NOTIFY_TO)) {
    fail('APOS_FORM_NOTIFY_TO is required when APOS_SMTP_HOST is set.');
  }
  const to = String(env.APOS_FORM_NOTIFY_TO).split(',').map(part => part.trim()).filter(Boolean);
  if (to.length > MAX_RECIPIENTS) {
    fail(`APOS_FORM_NOTIFY_TO accepts at most ${MAX_RECIPIENTS} addresses.`);
  }
  return {
    transport: {
      host,
      port,
      secure,
      requireTLS: requireTls && !secure,
      ignoreTLS: !requireTls && !secure,
      auth: isSet(env.APOS_SMTP_USER)
        ? {
          user: String(env.APOS_SMTP_USER),
          pass: String(env.APOS_SMTP_PASSWORD)
        }
        : undefined,
      // Bounded, so a stalled server cannot hold a send open for minutes.
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 20000
    },
    from: parseAddress('APOS_EMAIL_FROM', env.APOS_EMAIL_FROM),
    to: to.map(address => parseAddress('APOS_FORM_NOTIFY_TO', address)),
    includeValues: parseFlag('APOS_FORM_NOTIFY_INCLUDE_VALUES', env.APOS_FORM_NOTIFY_INCLUDE_VALUES, false)
  };
}

// The owner-approved retention period in days, or null when none is set.
export function readRetentionEnv(env = process.env) {
  if (!isSet(env.APOS_FORM_RETENTION_DAYS)) {
    return null;
  }
  return parseInteger('APOS_FORM_RETENTION_DAYS', env.APOS_FORM_RETENTION_DAYS,
    MIN_RETENTION_DAYS, MAX_RETENTION_DAYS);
}

export function parseRetentionDays(value) {
  return parseInteger('--days', value, MIN_RETENTION_DAYS, MAX_RETENTION_DAYS);
}
