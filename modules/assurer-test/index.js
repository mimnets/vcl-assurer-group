// Test-only support tasks (m1-009).
//
//   node app assurer-test:ensure-admin
//
// Creates the admin account used by the automated editor-workflow tests,
// without an interactive prompt, so CI can run on a throwaway database.
// The username and password come from APOS_TEST_USER and APOS_TEST_PASSWORD
// and are never logged. Uses the official user API (`apos.user.insert`).
//
// Refuses to run unless APOS_DB_URI is a sqlite:// file under the OS temp
// directory or RUNNER_TEMP, NODE_ENV is not production, and a password of at
// least 16 characters is set (see lib/guard.js). Idempotent: an existing
// account with that username is left unchanged.
import { refuseReason } from './lib/guard.js';

const TASK = 'assurer-test:ensure-admin';

// Refuse before Apostrophe connects to the database or runs migrations.
// `.env` has already been loaded by app.js at this point.
if (process.argv.includes(TASK)) {
  assertSafe();
}

function assertSafe() {
  const reason = refuseReason(process.env);
  if (reason) {
    throw new Error(`Refusing to run ${TASK}: ${reason}.`);
  }
}

export default {
  tasks(self) {
    return {
      'ensure-admin': {
        usage: 'Create the CI test admin from APOS_TEST_USER / APOS_TEST_PASSWORD ' +
          'on a temporary SQLite database.\nUsage: node app assurer-test:ensure-admin',
        task: () => self.ensureAdmin()
      }
    };
  },
  methods(self) {
    return {
      async ensureAdmin() {
        assertSafe();
        const req = self.apos.task.getReq();
        const username = process.env.APOS_TEST_USER;
        const existing = await self.apos.user.find(req, { username })
          .archived(null)
          .toObject();
        if (existing) {
          self.apos.util.log('Test admin already exists; nothing changed.');
          return;
        }
        await self.apos.user.insert(req, {
          username,
          title: username,
          role: 'admin',
          password: process.env.APOS_TEST_PASSWORD
        });
        self.apos.util.log('Test admin created.');
      }
    };
  }
};
