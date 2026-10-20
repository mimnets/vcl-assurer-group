// Safety checks for `assurer-test:ensure-admin` (m1-009).
//
// The task creates an admin account from environment variables, so it must
// only ever run against a throwaway database. `refuseReason` returns a
// human-readable reason to refuse, or null when the environment is safe.
// It never includes credential values in its messages.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const MIN_PASSWORD_LENGTH = 16;

export function refuseReason(env, { tmpDirs = [ os.tmpdir() ] } = {}) {
  if (env.NODE_ENV === 'production') {
    return 'NODE_ENV is production';
  }
  const uri = env.APOS_DB_URI || '';
  if (!/^sqlite:\/\//i.test(uri)) {
    return 'APOS_DB_URI is not a sqlite:// database';
  }
  let file = uri.replace(/^sqlite:\/\//i, '');
  // `sqlite:///C:/dir/db.sqlite` is the empty-authority form of a Windows path.
  if (/^\/[A-Za-z]:[\\/]/.test(file)) {
    file = file.slice(1);
  }
  if (!path.isAbsolute(file)) {
    return 'APOS_DB_URI must be an absolute path to a temporary SQLite file';
  }
  const dbPath = realpath(path.resolve(file));
  const roots = [ ...tmpDirs, env.RUNNER_TEMP ]
    .filter(Boolean)
    .map(dir => realpath(path.resolve(dir)));
  if (!roots.some(root => isInside(root, dbPath))) {
    return 'the database is not under the OS temp directory or RUNNER_TEMP';
  }
  if (!env.APOS_TEST_USER) {
    return 'APOS_TEST_USER is not set';
  }
  if (!env.APOS_TEST_PASSWORD || env.APOS_TEST_PASSWORD.length < MIN_PASSWORD_LENGTH) {
    return `APOS_TEST_PASSWORD is missing or shorter than ${MIN_PASSWORD_LENGTH} characters`;
  }
  return null;
}

function isInside(root, target) {
  const rel = path.relative(root, target);
  return Boolean(rel) && !rel.startsWith('..') && !path.isAbsolute(rel);
}

// Resolve symlinks (and Windows 8.3 short names) on the longest existing
// prefix, so the comparison is made on real locations. The database file
// itself usually does not exist yet.
function realpath(p) {
  const rest = [];
  let current = p;
  while (!fs.existsSync(current)) {
    const parent = path.dirname(current);
    if (parent === current) {
      return p;
    }
    rest.unshift(path.basename(current));
    current = parent;
  }
  return path.join(fs.realpathSync.native(current), ...rest);
}
