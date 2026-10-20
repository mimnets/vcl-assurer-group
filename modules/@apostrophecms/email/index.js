// Core email transport (nodemailer, shipped with apostrophe), configured
// from environment variables only (m1-012). Without APOS_SMTP_HOST no
// transport is configured and nothing can be sent. Settings and their
// validation: modules/assurer-forms/lib/config.js.
//
// Do not set APOS_LOG_EMAIL in shared environments: core then writes whole
// messages, including submitted content, to the log.
import { readNotificationEnv } from '../../assurer-forms/lib/config.js';

const settings = readNotificationEnv();

export default {
  options: {
    ...settings && {
      nodemailer: settings.transport,
      from: settings.from
    }
  }
};
