// Safety check for `assurer-demo:seed-corporate` (m1-014).
//
// The corporate demo seed only adds fictional records, but it must never run
// in production and must not change a developer's own database by accident.
// It runs on a temporary SQLite database (as in `npm run test:ci`), or on
// another non-production database only when `--dev-database` is passed to
// confirm it is a disposable development copy.
import { temporarySqliteReason } from '../../assurer-test/lib/guard.js';

export const CONFIRM_FLAG = '--dev-database';

export function seedRefuseReason(env, argv = [], options) {
  if (env.NODE_ENV === 'production') {
    return 'NODE_ENV is production';
  }
  if (!temporarySqliteReason(env, options)) {
    return null;
  }
  if (argv.includes(CONFIRM_FLAG)) {
    return null;
  }
  return `the database is not a temporary SQLite file; pass ${CONFIRM_FLAG} to confirm it is a disposable development database`;
}
