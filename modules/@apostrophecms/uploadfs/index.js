// Test isolation (m1-009): when APOS_TEST_UPLOADS_PATH is set, uploaded
// files go to that directory instead of public/uploads, so `npm run test:ci`
// never writes into the developer's media folder. Files stored there are not
// served over HTTP; the automated suites only check markup. Ignored when
// NODE_ENV is production. Unset (the normal case), core defaults apply.
import path from 'node:path';

const testPath = process.env.NODE_ENV !== 'production' &&
  process.env.APOS_TEST_UPLOADS_PATH;

export default {
  options: testPath
    ? {
      uploadfs: {
        uploadsPath: path.resolve(testPath, 'uploads'),
        tempPath: path.resolve(testPath, 'temp')
      }
    }
    : {}
};
