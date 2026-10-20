// Dependency audit against a documented baseline (m1-009).
//
//   npm run audit:check                       (runs `npm audit --json`)
//   node scripts/audit-check.mjs --input=report.json
//
// Fails (exit 1) when:
//   - a high or critical advisory is not in security/audit-baseline.json;
//   - a baselined advisory is now more severe than recorded;
//   - a baselined high or critical advisory affects a package it did not
//     affect when it was accepted (a new dependency path);
//   - a baseline entry is past its review date, is incomplete, or has a
//     review window longer than the baseline's maxReviewDays;
//   - npm audit fails or its output can't be read.
// Reports, without failing: new moderate/low advisories, and baseline
// entries that no longer apply (remove them). Uses Node built-ins only.

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RANK = {
  info: 0,
  low: 1,
  moderate: 2,
  high: 3,
  critical: 4
};
const DAY = 24 * 60 * 60 * 1000;
const REQUIRED = [ 'id', 'package', 'severity', 'scope', 'reason', 'owner', 'accepted', 'reviewBy' ];

// Collapse npm's per-package report into one record per advisory, with every
// package whose finding traces back to it.
export function advisoriesFrom(report) {
  const vulns = report.vulnerabilities || {};
  const advisories = new Map();
  const memo = new Map();

  function idsFor(name, seen = new Set()) {
    if (memo.has(name)) {
      return memo.get(name);
    }
    const ids = new Set();
    if (seen.has(name) || !vulns[name]) {
      return ids;
    }
    seen.add(name);
    for (const via of vulns[name].via || []) {
      if (typeof via === 'string') {
        idsFor(via, seen).forEach(id => ids.add(id));
      } else {
        const id = String(via.url || via.source).split('/').pop();
        ids.add(id);
        if (!advisories.has(id)) {
          advisories.set(id, {
            id,
            package: via.name,
            severity: via.severity,
            title: via.title,
            url: via.url,
            affects: new Set()
          });
        }
      }
    }
    memo.set(name, ids);
    return ids;
  }

  for (const name of Object.keys(vulns)) {
    for (const id of idsFor(name)) {
      advisories.get(id).affects.add(name);
    }
  }
  return [ ...advisories.values() ];
}

export function evaluate(report, baseline, today = new Date()) {
  const failures = [];
  const warnings = [];
  const notes = [];

  if (!report || typeof report !== 'object' || report.error || !report.vulnerabilities) {
    failures.push(`npm audit did not return a usable report${report?.error?.summary ? `: ${report.error.summary}` : ''}`);
    return {
      failures,
      warnings,
      notes
    };
  }

  const entries = baseline.advisories || [];
  const maxDays = baseline.maxReviewDays || 90;
  const day = today.toISOString().slice(0, 10);
  for (const entry of entries) {
    const missing = REQUIRED.filter(key => !entry[key]);
    if (missing.length) {
      failures.push(`baseline entry ${entry.id || '(no id)'} is missing: ${missing.join(', ')}`);
      continue;
    }
    if (entry.reviewBy < day) {
      failures.push(`baseline entry ${entry.id} expired on ${entry.reviewBy}; re-decide it`);
    }
    const window = (Date.parse(entry.reviewBy) - Date.parse(entry.accepted)) / DAY;
    if (!(window >= 0 && window <= maxDays)) {
      failures.push(`baseline entry ${entry.id} has a review window of ${window} days ` +
        `(max ${maxDays})`);
    }
  }

  const found = advisoriesFrom(report);
  for (const advisory of found) {
    const entry = entries.find(e => e.id === advisory.id);
    const label = `${advisory.id} (${advisory.severity}, ${advisory.package}: ${advisory.title})`;
    const serious = RANK[advisory.severity] >= RANK.high;
    if (!entry) {
      if (serious) {
        failures.push(`NEW ${label} is not in the baseline`);
      } else {
        warnings.push(`new ${label} is not in the baseline (not failing: below high)`);
      }
      continue;
    }
    if (RANK[advisory.severity] > RANK[entry.severity]) {
      failures.push(`${label} was accepted as ${entry.severity}; severity has increased`);
      continue;
    }
    if (serious) {
      const accepted = entry.affects || [];
      const added = [ ...advisory.affects ].filter(name => !accepted.includes(name));
      if (added.length) {
        failures.push(`${label} now also affects ${added.join(', ')}; not covered by the baseline`);
        continue;
      }
    }
    notes.push(`baselined ${label}; review by ${entry.reviewBy}`);
  }

  for (const entry of entries) {
    if (!found.some(a => a.id === entry.id)) {
      notes.push(`baseline entry ${entry.id} no longer applies; remove it from the baseline`);
    }
  }

  return {
    failures,
    warnings,
    notes,
    metadata: report.metadata?.vulnerabilities
  };
}

function runNpmAudit() {
  // Under `npm run`, npm_execpath points at npm's CLI script; running it with
  // this Node binary avoids needing a shell to start npm on Windows.
  const execPath = process.env.npm_execpath;
  const [ cmd, args, shell ] = execPath && execPath.endsWith('.js')
    ? [ process.execPath, [ execPath, 'audit', '--json' ], false ]
    : [ 'npm', [ 'audit', '--json' ], process.platform === 'win32' ];
  const result = spawnSync(cmd, args, {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    shell
  });
  try {
    return JSON.parse(result.stdout);
  } catch (e) {
    return { error: { summary: `could not parse npm audit output (exit ${result.status})` } };
  }
}

function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const baseline = JSON.parse(readFileSync(path.join(root, 'security/audit-baseline.json'), 'utf8'));
  const input = process.argv.find(arg => arg.startsWith('--input='))?.slice('--input='.length);
  const report = input ? JSON.parse(readFileSync(input, 'utf8')) : runNpmAudit();
  const result = evaluate(report, baseline);

  if (result.metadata) {
    const m = result.metadata;
    console.log(`npm audit: ${m.total} findings (critical ${m.critical}, high ${m.high}, moderate ${m.moderate}, low ${m.low})`);
  }
  result.notes.forEach(line => console.log(`OK    ${line}`));
  result.warnings.forEach(line => console.log(`WARN  ${line}`));
  result.failures.forEach(line => console.log(`FAIL  ${line}`));
  console.log(result.failures.length
    ? `\nAudit check FAILED (${result.failures.length})`
    : '\nAudit check passed');
  process.exit(result.failures.length ? 1 : 0);
}

if (import.meta.main) {
  main();
}
