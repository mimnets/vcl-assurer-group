// Environment-driven HTTPS, reverse-proxy and rate-limit settings (m1-011).
//
// Every setting is off or conservative by default, so local development over
// plain HTTP behaves as before. Invalid or unsafe combinations throw at
// startup instead of silently weakening security:
//
//   APOS_HTTPS=1              The site is served to browsers over HTTPS (TLS
//                             ends at a reverse proxy). Session and CSRF
//                             cookies get the `Secure` flag. Requires
//                             APOS_TRUST_PROXY, because the app itself only
//                             speaks HTTP.
//   APOS_TRUST_PROXY=<list>   Which proxies may set X-Forwarded-For/-Proto.
//                             Express "trust proxy" values, restricted to a
//                             hop count (1-10), the names loopback, linklocal
//                             and uniquelocal, and IP addresses or CIDR
//                             ranges. `true`, `*` and anything else are
//                             rejected: trusting every hop lets any client
//                             forge its IP address. Unset: no proxy trusted.
//   APOS_HSTS_MAX_AGE=<secs>  Send Strict-Transport-Security. Requires
//                             APOS_HTTPS=1, so it is never sent for plain
//                             HTTP. Unset: no HSTS header.
//   APOS_FORM_RATE_LIMIT_MAX, APOS_FORM_RATE_LIMIT_WINDOW_MINUTES
//                             Contact-form submissions allowed per client IP
//                             per window (defaults 10 per 15 minutes).

import net from 'node:net';

const NAMED_RANGES = [ 'loopback', 'linklocal', 'uniquelocal' ];
const MAX_HSTS_SECONDS = 2 * 365 * 24 * 60 * 60;

export const FORM_RATE_LIMIT_DEFAULTS = {
  max: 10,
  windowMinutes: 15
};

function fail(message) {
  throw new Error(`Security configuration: ${message}`);
}

function isSet(value) {
  return value !== undefined && String(value).trim() !== '';
}

function parseInteger(name, value, min, max) {
  const text = String(value).trim();
  const number = Number(text);
  if (!/^\d+$/.test(text) || number < min || number > max) {
    fail(`${name} must be a whole number from ${min} to ${max}.`);
  }
  return number;
}

// Returns a value for Express's "trust proxy" setting: `false` (trust no
// proxy), a hop count, or a comma-separated list of addresses and ranges.
export function parseTrustProxy(value) {
  if (!isSet(value)) {
    return false;
  }
  const text = String(value).trim();
  if (/^\d+$/.test(text)) {
    return parseInteger('APOS_TRUST_PROXY (hop count)', text, 1, 10);
  }
  const parts = text.split(',').map(part => part.trim()).filter(Boolean);
  for (const part of parts) {
    if (NAMED_RANGES.includes(part)) {
      continue;
    }
    const [ address, bits, ...rest ] = part.split('/');
    const family = net.isIP(address);
    const maxBits = family === 4 ? 32 : 128;
    const badBits = bits !== undefined && (!/^\d+$/.test(bits) || Number(bits) > maxBits);
    if (!family || rest.length || badBits) {
      fail(
        `APOS_TRUST_PROXY entry "${part}" is not allowed. Use a hop count, ` +
        `${NAMED_RANGES.join(', ')}, or IP addresses / CIDR ranges of your own proxies.`
      );
    }
  }
  return parts.join(', ');
}

function parseFlag(name, value) {
  if (!isSet(value) || String(value).trim() === '0') {
    return false;
  }
  if (String(value).trim() === '1') {
    return true;
  }
  return fail(`${name} must be 1 or 0.`);
}

export function readSecurityEnv(env = process.env) {
  const https = parseFlag('APOS_HTTPS', env.APOS_HTTPS);
  const trustProxy = parseTrustProxy(env.APOS_TRUST_PROXY);
  if (https && trustProxy === false) {
    fail('APOS_HTTPS=1 needs APOS_TRUST_PROXY (for example "loopback") so the app ' +
      'can tell that the proxy received the request over HTTPS.');
  }
  let hstsMaxAge = null;
  if (isSet(env.APOS_HSTS_MAX_AGE)) {
    if (!https) {
      fail('APOS_HSTS_MAX_AGE needs APOS_HTTPS=1. HSTS must never be sent for plain HTTP.');
    }
    hstsMaxAge = parseInteger('APOS_HSTS_MAX_AGE', env.APOS_HSTS_MAX_AGE, 0, MAX_HSTS_SECONDS);
  }
  const formRateLimit = {
    max: isSet(env.APOS_FORM_RATE_LIMIT_MAX)
      ? parseInteger('APOS_FORM_RATE_LIMIT_MAX', env.APOS_FORM_RATE_LIMIT_MAX, 1, 1000)
      : FORM_RATE_LIMIT_DEFAULTS.max,
    windowMinutes: isSet(env.APOS_FORM_RATE_LIMIT_WINDOW_MINUTES)
      ? parseInteger('APOS_FORM_RATE_LIMIT_WINDOW_MINUTES', env.APOS_FORM_RATE_LIMIT_WINDOW_MINUTES, 1, 1440)
      : FORM_RATE_LIMIT_DEFAULTS.windowMinutes
  };
  return {
    https,
    trustProxy,
    hstsMaxAge,
    formRateLimit
  };
}

// Options for @apostrophecms/security-headers, also applied to static files
// (see modules/@apostrophecms/asset). `false` means "do not send".
// - HSTS only when APOS_HTTPS=1 and APOS_HSTS_MAX_AGE are set.
// - Content-Security-Policy: a baseline that restricts framing, <base> and
//   plugins only. The module's default resource policy (script-src with
//   nonces, default-src) is not used yet: core templates and the Vite dev
//   server emit scripts without nonces, so it would break editing. A full
//   policy needs its own browser-tested rollout, starting in Report-Only.
export function securityHeaderOptions({ hstsMaxAge }) {
  return {
    'Strict-Transport-Security': hstsMaxAge === null ? false : `max-age=${hstsMaxAge}`,
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'same-origin',
    'Content-Security-Policy': 'frame-ancestors \'self\'; base-uri \'self\'; object-src \'none\''
  };
}

// Rate-limit key for a client address. IPv6 clients usually control a whole
// /64, so they are grouped by that prefix; IPv4 and IPv4-mapped addresses are
// used as they are.
export function clientKey(ip) {
  if (!ip) {
    return 'unknown';
  }
  const mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (mapped) {
    return mapped[1];
  }
  if (net.isIP(ip) !== 6) {
    return ip;
  }
  const [ head, tail = '' ] = ip.toLowerCase().split('::');
  const headParts = head ? head.split(':') : [];
  const tailParts = tail ? tail.split(':') : [];
  const fill = new Array(8 - headParts.length - tailParts.length).fill('0');
  const groups = ip.includes('::') ? [ ...headParts, ...fill, ...tailParts ] : headParts;
  return `${groups.slice(0, 4).map(g => g.replace(/^0+(?=.)/, '')).join(':')}::/64`;
}
