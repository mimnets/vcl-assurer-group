// Unit tests for scripts/audit-check.mjs (m1-009). Run: npm run test:unit
// Reports are small synthetic copies of `npm audit --json` output; nothing
// is installed and no network is used.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { evaluate } from './audit-check.mjs';

const TODAY = new Date('2026-10-20T12:00:00Z');

const advisory = (name, id, severity, title = `${name} issue`) => ({
  source: 1,
  name,
  dependency: name,
  title,
  url: `https://github.com/advisories/${id}`,
  severity,
  range: '<=1.0.0'
});

// Mirrors the shape of the real 2026-10-20 report: braces (high) reached
// through chokidar from apostrophe, nunjucks and nodemon.
function report(extra = {}) {
  return {
    auditReportVersion: 2,
    vulnerabilities: {
      braces: {
        name: 'braces',
        severity: 'high',
        via: [ advisory('braces', 'GHSA-high-1111-aaaa', 'high') ]
      },
      chokidar: {
        name: 'chokidar',
        severity: 'high',
        via: [ 'braces' ]
      },
      apostrophe: {
        name: 'apostrophe',
        severity: 'high',
        via: [ 'chokidar', 'sprintf-js' ]
      },
      'sprintf-js': {
        name: 'sprintf-js',
        severity: 'moderate',
        via: [ advisory('sprintf-js', 'GHSA-mod-2222-bbbb', 'moderate') ]
      },
      ...extra
    },
    metadata: { vulnerabilities: {} }
  };
}

function baseline(overrides = {}) {
  const entry = (id, pkg, severity, affects) => ({
    id,
    package: pkg,
    severity,
    scope: 'prod',
    reason: 'test',
    owner: 'test',
    accepted: '2026-10-20',
    reviewBy: '2027-01-18',
    ...(affects ? { affects } : {})
  });
  return {
    maxReviewDays: 90,
    advisories: [
      entry('GHSA-high-1111-aaaa', 'braces', 'high', [ 'apostrophe', 'braces', 'chokidar' ]),
      entry('GHSA-mod-2222-bbbb', 'sprintf-js', 'moderate')
    ].map(e => ({
      ...e,
      ...(overrides[e.id] || {})
    }))
  };
}

test('passes when every finding is baselined', () => {
  const result = evaluate(report(), baseline(), TODAY);
  assert.deepEqual(result.failures, []);
  assert.equal(result.warnings.length, 0);
});

test('fails on a new high advisory', () => {
  const result = evaluate(report({
    lodash: {
      name: 'lodash',
      severity: 'high',
      via: [ advisory('lodash', 'GHSA-new-3333-cccc', 'high') ]
    }
  }), baseline(), TODAY);
  assert.equal(result.failures.length, 1);
  assert.match(result.failures[0], /NEW GHSA-new-3333-cccc \(high/);
});

test('fails on a new critical advisory', () => {
  const result = evaluate(report({
    minimist: {
      name: 'minimist',
      severity: 'critical',
      via: [ advisory('minimist', 'GHSA-crit-4444-dddd', 'critical') ]
    }
  }), baseline(), TODAY);
  assert.equal(result.failures.length, 1);
  assert.match(result.failures[0], /NEW GHSA-crit-4444-dddd \(critical/);
});

test('reports a new moderate advisory without failing', () => {
  const result = evaluate(report({
    qs: {
      name: 'qs',
      severity: 'moderate',
      via: [ advisory('qs', 'GHSA-mod-5555-eeee', 'moderate') ]
    }
  }), baseline(), TODAY);
  assert.deepEqual(result.failures, []);
  assert.equal(result.warnings.length, 1);
  assert.match(result.warnings[0], /GHSA-mod-5555-eeee/);
});

test('fails when a baselined high advisory reaches a new package', () => {
  const result = evaluate(report({
    'new-dep': {
      name: 'new-dep',
      severity: 'high',
      via: [ 'braces' ]
    }
  }), baseline(), TODAY);
  assert.equal(result.failures.length, 1);
  assert.match(result.failures[0], /now also affects new-dep/);
});

test('fails when a baselined advisory becomes more severe', () => {
  const r = report();
  r.vulnerabilities['sprintf-js'].via[0].severity = 'high';
  const result = evaluate(r, baseline(), TODAY);
  assert.equal(result.failures.length, 1);
  assert.match(result.failures[0], /accepted as moderate; severity has increased/);
});

test('fails on an expired baseline entry', () => {
  const result = evaluate(report(), baseline(), new Date('2027-01-19T00:00:00Z'));
  assert.equal(result.failures.length, 2);
  assert.match(result.failures[0], /expired on 2027-01-18/);
});

test('fails on a review window longer than maxReviewDays', () => {
  const result = evaluate(report(), baseline({ 'GHSA-mod-2222-bbbb': { reviewBy: '2027-06-01' } }), TODAY);
  assert.equal(result.failures.length, 1);
  assert.match(result.failures[0], /review window of 224 days/);
});

test('fails on an incomplete baseline entry', () => {
  const result = evaluate(report(), baseline({ 'GHSA-mod-2222-bbbb': { owner: '' } }), TODAY);
  assert.equal(result.failures.length, 1);
  assert.match(result.failures[0], /missing: owner/);
});

test('notes baseline entries that no longer apply', () => {
  const r = report();
  delete r.vulnerabilities['sprintf-js'];
  r.vulnerabilities.apostrophe.via = [ 'chokidar' ];
  const result = evaluate(r, baseline(), TODAY);
  assert.deepEqual(result.failures, []);
  assert.ok(result.notes.some(n => /GHSA-mod-2222-bbbb no longer applies/.test(n)));
});

test('fails when npm audit returns an error', () => {
  const result = evaluate({ error: { summary: 'network down' } }, baseline(), TODAY);
  assert.equal(result.failures.length, 1);
  assert.match(result.failures[0], /network down/);
});
