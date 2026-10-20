// Unit tests for the HTTPS, proxy, header and rate-limit settings (m1-011).
// Run: npm run test:unit
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  clientKey,
  FORM_RATE_LIMIT_DEFAULTS,
  parseTrustProxy,
  readSecurityEnv,
  securityHeaderOptions
} from '../modules/assurer-security/lib/config.js';

test('defaults: plain HTTP, no proxy trusted, no HSTS, default form limit', () => {
  assert.deepEqual(readSecurityEnv({}), {
    https: false,
    trustProxy: false,
    hstsMaxAge: null,
    formRateLimit: FORM_RATE_LIMIT_DEFAULTS
  });
  assert.equal(readSecurityEnv({ APOS_HTTPS: '0' }).https, false);
});

test('HTTPS behind a named proxy', () => {
  const config = readSecurityEnv({
    APOS_HTTPS: '1',
    APOS_TRUST_PROXY: 'loopback',
    APOS_HSTS_MAX_AGE: '31536000'
  });
  assert.equal(config.https, true);
  assert.equal(config.trustProxy, 'loopback');
  assert.equal(config.hstsMaxAge, 31536000);
});

test('APOS_HTTPS=1 without a trusted proxy is refused', () => {
  assert.throws(() => readSecurityEnv({ APOS_HTTPS: '1' }), /needs APOS_TRUST_PROXY/);
});

test('HSTS is refused unless HTTPS is declared', () => {
  assert.throws(() => readSecurityEnv({ APOS_HSTS_MAX_AGE: '300' }), /HSTS must never be sent for plain HTTP/);
  assert.throws(() => readSecurityEnv({
    APOS_HTTPS: '1',
    APOS_TRUST_PROXY: '1',
    APOS_HSTS_MAX_AGE: 'forever'
  }), /APOS_HSTS_MAX_AGE/);
});

test('APOS_HTTPS accepts only 1 or 0', () => {
  assert.throws(() => readSecurityEnv({ APOS_HTTPS: 'true' }), /must be 1 or 0/);
});

test('trust proxy: hop counts, named ranges, addresses and CIDR ranges', () => {
  assert.equal(parseTrustProxy(undefined), false);
  assert.equal(parseTrustProxy(' '), false);
  assert.equal(parseTrustProxy('1'), 1);
  assert.equal(parseTrustProxy('loopback, 10.0.0.0/8'), 'loopback, 10.0.0.0/8');
  assert.equal(parseTrustProxy('192.0.2.10,fd00::/8'), '192.0.2.10, fd00::/8');
});

test('trust proxy: trusting every hop or malformed entries is refused', () => {
  for (const value of [ 'true', '*', 'all', '0', '11', '10.0.0.0/33', 'example.com', '10.0.0.1/8/1' ]) {
    assert.throws(() => parseTrustProxy(value), /APOS_TRUST_PROXY/, value);
  }
});

test('form rate limit overrides are bounded whole numbers', () => {
  const config = readSecurityEnv({
    APOS_FORM_RATE_LIMIT_MAX: '5',
    APOS_FORM_RATE_LIMIT_WINDOW_MINUTES: '60'
  });
  assert.deepEqual(config.formRateLimit, {
    max: 5,
    windowMinutes: 60
  });
  for (const value of [ '0', '-1', '1.5', 'many', '1001' ]) {
    assert.throws(() => readSecurityEnv({ APOS_FORM_RATE_LIMIT_MAX: value }), /APOS_FORM_RATE_LIMIT_MAX/, value);
  }
  assert.throws(() => readSecurityEnv({ APOS_FORM_RATE_LIMIT_WINDOW_MINUTES: '0' }), /WINDOW_MINUTES/);
});

test('header options: no HSTS by default, baseline CSP without script restrictions', () => {
  const headers = securityHeaderOptions({ hstsMaxAge: null });
  assert.equal(headers['Strict-Transport-Security'], false);
  assert.equal(headers['X-Content-Type-Options'], 'nosniff');
  assert.equal(headers['X-Frame-Options'], 'SAMEORIGIN');
  assert.match(headers['Content-Security-Policy'], /frame-ancestors 'self'/);
  assert.doesNotMatch(headers['Content-Security-Policy'], /script-src|default-src/);
  assert.equal(securityHeaderOptions({ hstsMaxAge: 600 })['Strict-Transport-Security'], 'max-age=600');
});

test('client key: IPv4 as is, IPv4-mapped unwrapped, IPv6 grouped by /64', () => {
  assert.equal(clientKey('203.0.113.7'), '203.0.113.7');
  assert.equal(clientKey('::ffff:127.0.0.1'), '127.0.0.1');
  assert.equal(clientKey('2001:db8:1:2:aaaa:bbbb:cccc:dddd'), '2001:db8:1:2::/64');
  assert.equal(clientKey('2001:db8:1:2::1'), '2001:db8:1:2::/64');
  assert.equal(clientKey('2001:db8::1'), '2001:db8:0:0::/64');
  assert.equal(clientKey('::1'), '0:0:0:0::/64');
  assert.equal(clientKey(undefined), 'unknown');
});
