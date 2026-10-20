// Unit tests for the refusal rules of `assurer-test:ensure-admin` (m1-009).
// Run: npm run test:unit
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { refuseReason } from '../modules/assurer-test/lib/guard.js';

const tmp = mkdtempSync(path.join(os.tmpdir(), 'guard-test-'));
const runnerTemp = mkdtempSync(path.join(os.tmpdir(), 'guard-runner-'));
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Only `tmp` counts as a temp root unless RUNNER_TEMP is set.
const opts = { tmpDirs: [ tmp ] };
after(() => {
  rmSync(tmp, {
    recursive: true,
    force: true
  });
  rmSync(runnerTemp, {
    recursive: true,
    force: true
  });
});

const safe = (overrides = {}) => ({
  APOS_DB_URI: `sqlite://${path.join(tmp, 'ci.sqlite')}`,
  APOS_TEST_USER: 'ci-admin',
  APOS_TEST_PASSWORD: 'x'.repeat(32),
  ...overrides
});

test('allows a SQLite file under the temp directory', () => {
  assert.equal(refuseReason(safe(), opts), null);
});

test('allows a SQLite file under RUNNER_TEMP', () => {
  const env = safe({
    RUNNER_TEMP: runnerTemp,
    APOS_DB_URI: `sqlite://${path.join(runnerTemp, 'ci.sqlite')}`
  });
  assert.equal(refuseReason(env, opts), null);
});

test('allows the sqlite:///C:/... form on Windows', { skip: process.platform !== 'win32' }, () => {
  const file = path.join(tmp, 'ci.sqlite').replace(/\\/g, '/');
  assert.equal(refuseReason(safe({ APOS_DB_URI: `sqlite:///${file}` }), opts), null);
});

test('refuses when NODE_ENV is production', () => {
  assert.match(refuseReason(safe({ NODE_ENV: 'production' }), opts), /production/);
});

test('refuses a missing database URI', () => {
  assert.match(refuseReason(safe({ APOS_DB_URI: '' }), opts), /not a sqlite/);
});

test('refuses non-SQLite databases', () => {
  for (const uri of [ 'mongodb://localhost:27017/site', 'postgres://u:p@localhost:5432/site' ]) {
    assert.match(refuseReason(safe({ APOS_DB_URI: uri }), opts), /not a sqlite/);
  }
});

test('refuses a relative SQLite path (the developer database)', () => {
  assert.match(
    refuseReason(safe({ APOS_DB_URI: 'sqlite://./data/vcl-assurer-group.db' }), opts),
    /absolute path/
  );
});

test('refuses an absolute SQLite path outside the temp directory', () => {
  const dev = path.join(projectRoot, 'data', 'vcl-assurer-group.db');
  assert.match(refuseReason(safe({ APOS_DB_URI: `sqlite://${dev}` }), opts), /not under/);
});

test('refuses a path that escapes the temp directory with ..', () => {
  const escape = `${tmp}${path.sep}..${path.sep}..${path.sep}escape.sqlite`;
  assert.match(refuseReason(safe({ APOS_DB_URI: `sqlite://${escape}` }), opts), /not under/);
});

test('refuses the temp directory itself', () => {
  assert.match(refuseReason(safe({ APOS_DB_URI: `sqlite://${tmp}` }), opts), /not under/);
});

test('refuses in-memory SQLite', () => {
  assert.match(refuseReason(safe({ APOS_DB_URI: 'sqlite://:memory:' }), opts), /absolute path/);
});

test('refuses without a test username', () => {
  assert.match(refuseReason(safe({ APOS_TEST_USER: '' }), opts), /APOS_TEST_USER/);
});

test('refuses a missing or short password, without echoing it', () => {
  assert.match(refuseReason(safe({ APOS_TEST_PASSWORD: '' }), opts), /APOS_TEST_PASSWORD/);
  const reason = refuseReason(safe({ APOS_TEST_PASSWORD: 'short-secret' }), opts);
  assert.match(reason, /shorter than 16/);
  assert.ok(!reason.includes('short-secret'));
});
