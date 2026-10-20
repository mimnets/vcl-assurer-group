// Unit tests for the m1-014 content-model helpers: website URL validation,
// display ordering, the corporate demo seed guard, the test-editor guard and
// the demo data itself (fictional, labelled, no personal contact details).
// Run: npm run test:unit
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';
import { byDisplayOrder } from '../lib/display-order.js';
import { PHONE_PATTERN } from '../lib/contact.js';
import { invalidWebUrls, isWebUrl } from '../lib/web-url.js';
import { DEMO } from '../modules/assurer-demo/lib/corporate.js';
import { CONFIRM_FLAG, seedRefuseReason } from '../modules/assurer-demo/lib/guard.js';
import { editorRefuseReason } from '../modules/assurer-test/lib/guard.js';

const tmp = mkdtempSync(path.join(os.tmpdir(), 'content-model-test-'));
const opts = { tmpDirs: [ tmp ] };
after(() => rmSync(tmp, {
  recursive: true,
  force: true
}));
const tempDb = `sqlite://${path.join(tmp, 'ci.sqlite')}`;

test('isWebUrl accepts absolute http and https URLs only', () => {
  for (const ok of [ 'https://example.com', 'http://example.com/path?q=1', 'https://sub.example.org:8443/' ]) {
    assert.equal(isWebUrl(ok), true, ok);
  }
  for (const bad of [
    '', null, undefined, 'javascript:alert(1)', 'JAVASCRIPT:alert(1)', 'data:text/html,x',
    'mailto:a@example.com', 'tel:+15550100', 'ftp://example.com', '/relative/path',
    '//example.com', 'example.com', 'https://'
  ]) {
    assert.equal(isWebUrl(bad), false, String(bad));
  }
});

test('invalidWebUrls reports top-level and array item paths, ignores empty values', () => {
  const doc = {
    websiteUrl: 'mailto:x@example.com',
    linkUrl: '',
    socialLinks: [
      { url: 'https://example.com/a' },
      { url: 'ftp://example.com' },
      { url: '' }
    ]
  };
  assert.deepEqual(invalidWebUrls(doc, [ 'websiteUrl', 'linkUrl', 'socialLinks.url' ]), [ 'websiteUrl', 'socialLinks.1.url' ]);
  assert.deepEqual(invalidWebUrls({}, [ 'websiteUrl', 'socialLinks.url' ]), []);
});

test('byDisplayOrder sorts by number, then title', () => {
  const sorted = [
    {
      title: 'b',
      displayOrder: 10
    },
    {
      title: 'c',
      displayOrder: 5
    },
    {
      title: 'a',
      displayOrder: 10
    },
    { title: 'd' }
  ].sort(byDisplayOrder).map(d => d.title);
  assert.deepEqual(sorted, [ 'c', 'a', 'b', 'd' ]);
});

test('phone pattern accepts empty and international numbers, rejects text', () => {
  const re = new RegExp(PHONE_PATTERN);
  for (const ok of [ '', '+1 555 0100', '+880 (2) 123-4567', '0123456' ]) {
    assert.equal(re.test(ok), true, ok);
  }
  for (const bad of [ 'call me', '+', '12', '<script>', '+1 555 0100 ext. 4' ]) {
    assert.equal(re.test(bad), false, bad);
  }
});

test('corporate seed: always refused in production, even with the flag', () => {
  assert.match(seedRefuseReason({
    NODE_ENV: 'production',
    APOS_DB_URI: tempDb
  }, [ CONFIRM_FLAG ], opts), /production/);
});

test('corporate seed: allowed on a temporary SQLite database', () => {
  assert.equal(seedRefuseReason({ APOS_DB_URI: tempDb }, [], opts), null);
});

test('corporate seed: other databases need the confirmation flag', () => {
  for (const uri of [ 'sqlite://./data/vcl-assurer-group.db', 'postgres://localhost/x', '' ]) {
    assert.match(seedRefuseReason({ APOS_DB_URI: uri }, [], opts), /--dev-database/, uri);
    const confirmed = seedRefuseReason({ APOS_DB_URI: uri }, [ CONFIRM_FLAG ], opts);
    assert.equal(confirmed, null, uri);
  }
});

test('test editor guard: temp database and editor credentials required', () => {
  const env = {
    APOS_DB_URI: tempDb,
    APOS_TEST_EDITOR_USER: 'ci-editor',
    APOS_TEST_EDITOR_PASSWORD: 'x'.repeat(32)
  };
  assert.equal(editorRefuseReason(env, opts), null);
  assert.match(editorRefuseReason({
    ...env,
    APOS_TEST_EDITOR_PASSWORD: 'short'
  }, opts), /APOS_TEST_EDITOR_PASSWORD/);
  assert.match(editorRefuseReason({
    ...env,
    APOS_TEST_EDITOR_USER: ''
  }, opts), /APOS_TEST_EDITOR_USER/);
  assert.match(editorRefuseReason({
    ...env,
    APOS_DB_URI: 'sqlite://./data/vcl-assurer-group.db'
  }, opts), /temporary SQLite|absolute path/);
  assert.match(editorRefuseReason({
    ...env,
    NODE_ENV: 'production'
  }, opts), /production/);
});

test('demo data is labelled and fictional, with no personal contact details', () => {
  const titled = [
    ...DEMO.organizations, ...DEMO.locations, ...DEMO.people,
    DEMO.division, ...DEMO.categories, ...DEMO.products
  ];
  for (const item of titled) {
    assert.match(item.title, /Demo|fictional/i, item.title);
  }
  for (const person of DEMO.people) {
    assert.equal('publicEmail' in person || 'publicPhone' in person || 'email' in person, false);
  }
  const urls = DEMO.organizations.map(o => o.websiteUrl).filter(Boolean);
  assert.ok(urls.every(u => /^https:\/\/example\.(com|org)\//.test(u)), 'demo websites use reserved example domains');
  const emails = [ ...DEMO.locations.map(l => l.publicEmail), DEMO.global.contactEmail ]
    .filter(Boolean);
  assert.ok(emails.every(e => e.endsWith('@example.com')), 'demo emails use example.com');
  assert.ok(DEMO.products.some(p => p.publish === false), 'one demo product stays unpublished');
});
