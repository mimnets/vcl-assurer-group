// Contact-form operations (m1-012): notifications, staff access, retention.
//
// Builds on @apostrophecms/form's supported extension points only: the
// `beforeSaveSubmission` and `submission` events, its `aposFormSubmissions`
// collection handle (`apos.modules['@apostrophecms/form'].db`, the one the
// form module itself writes with), and core's `@apostrophecms/email`
// transport. Upstream validation and storage are unchanged.
//
// Semantics. A submission is accepted when the form module has stored it;
// that is what the visitor is told. The response then carries
// `X-Assurer-Submission: stored`, and the browser shows the thank-you message
// only when it sees that header (modules/@apostrophecms/form-widget). The
// notification email is a separate step: it is attempted after storage,
// without making the visitor wait, and its outcome is recorded on the
// submission (`notification.status`: pending,
// sent, failed or disabled). A failed notification never turns an accepted
// submission into an error. Failures are logged without message content or
// SMTP details, are shown to administrators on the submissions page and in
// the CSV export, and can be retried a bounded number of times with
// `node app assurer-forms:retry-notifications`.
//
// Repeated submissions. The browser sends a random key per form fill
// (X-Assurer-Submission-Key). Once a submission is stored, its key is kept
// for 24 hours; a retry with the same key (after a timeout or a lost
// connection) is answered as accepted without storing a second copy.
//
// Staff access: /assurer/form-submissions (paginated) and its CSV export, for
// users who may manage user accounts (the admin role) only. Everyone else,
// including editors and anonymous visitors, gets 404.

import {
  parseRetentionDays, readNotificationEnv, readRetentionEnv
} from './lib/config.js';
import { buildNotification, csvRow } from './lib/format.js';

const SUBMIT_URL = '/api/v1/@apostrophecms/form/submit';
const PAGE_URL = '/assurer/form-submissions';
const EXPORT_URL = '/assurer/form-submissions/export.csv';
const KEY_NAMESPACE = 'assurer-form-submission-key';
const KEY_HEADER = 'x-assurer-submission-key';
const STORED_HEADER = 'X-Assurer-Submission';
const KEY_PATTERN = /^[A-Za-z0-9-]{16,64}$/;
const KEY_TTL_SECONDS = 24 * 60 * 60;
const PAGE_SIZE = 50;
const MAX_PAGE = 10000;
const EXPORT_LIMIT = 5000;
const MAX_ATTEMPTS = 5;
const RETRY_BATCH = 100;
// A "pending" notification older than this was interrupted (for example by
// a restart) and may be retried.
const PENDING_GRACE_MS = 5 * 60 * 1000;
const FORM_ID = /^[A-Za-z0-9:_-]{1,100}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const notification = readNotificationEnv();
const approvedRetentionDays = readRetentionEnv();

function submissionKey(req) {
  const key = req.get(KEY_HEADER);
  return key && KEY_PATTERN.test(key) ? key : null;
}

// Only a fixed error code and SMTP status number are kept. Nodemailer's
// messages can quote server responses, so they are never logged or stored.
function errorCode(e) {
  const code = (typeof e?.code === 'string' && /^[A-Z][A-Z0-9_]{1,30}$/.test(e.code))
    ? e.code
    : 'UNKNOWN';
  return Number.isInteger(e?.responseCode) ? `${code} ${e.responseCode}` : code;
}

function parseDate(value, endOfDay) {
  if (value === undefined || value === '') {
    return null;
  }
  if (typeof value !== 'string' || !DATE.test(value)) {
    return false;
  }
  const date = new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}Z`);
  return Number.isNaN(date.getTime()) ? false : date;
}

export default {
  options: {
    notificationsEnabled: Boolean(notification)
  },
  handlers(self) {
    return {
      '@apostrophecms/form:beforeSaveSubmission': {
        // Give the submission a known ID before it is inserted, so it can be
        // referenced in the notification and updated afterwards.
        prepareSubmission(req, { submission }) {
          submission._id = self.apos.util.generateId();
          submission.notification = {
            status: notification ? 'pending' : 'disabled',
            attempts: 0
          };
          req.assurerSubmission = submission;
        }
      },
      '@apostrophecms/form:submission': {
        // Runs after the form module's own `saveSubmission` handler, so the
        // submission is stored. Must never throw: the visitor's submission
        // has been accepted at this point.
        async afterSubmissionStored(req, form) {
          const submission = req.assurerSubmission;
          if (!submission) {
            return;
          }
          // Positive confirmation for the browser: upstream answers success
          // with an empty 200, which a proxy or captive portal could imitate.
          req.res?.set(STORED_HEADER, 'stored');
          const key = submissionKey(req);
          if (key) {
            try {
              await self.apos.cache.set(
                KEY_NAMESPACE, key, submission._id, KEY_TTL_SECONDS
              );
            } catch (e) {
              self.logError('submission-key-not-saved', { submissionId: submission._id });
            }
          }
          if (notification) {
            // Not awaited: delivery is recorded on the submission instead.
            self.sendNotification(submission, form.title).catch(() => {});
          }
        }
      }
    };
  },
  middleware(self) {
    return {
      // Before the rate limit, so a retry of an accepted submission does
      // not count against the visitor's quota. Core's CSRF check still runs
      // first.
      replayAcceptedSubmission: {
        url: SUBMIT_URL,
        before: 'assurer-security',
        async middleware(req, res, next) {
          const key = req.method === 'POST' && submissionKey(req);
          if (!key) {
            return next();
          }
          try {
            if (await self.apos.cache.get(KEY_NAMESPACE, key)) {
              res.set(STORED_HEADER, 'stored');
              return res.send({});
            }
          } catch (e) {
            self.logError('submission-key-check-failed', {});
          }
          return next();
        }
      }
    };
  },
  routes(self) {
    return {
      get: {
        [PAGE_URL]: async (req, res) => {
          if (!self.canManageSubmissions(req)) {
            return self.notFound(res);
          }
          const formId = self.formFilter(req.query.form);
          const page = Number.parseInt(req.query.page, 10);
          const badPage = req.query.page !== undefined &&
            !(/^\d+$/.test(req.query.page) && page >= 1 && page <= MAX_PAGE);
          if (formId === false || badPage) {
            return self.badRequest(res, 'Invalid form or page.');
          }
          const current = page || 1;
          const query = formId ? { formId } : {};
          const total = await self.collection().countDocuments(query);
          const rows = await self.collection().find(query)
            .sort({ createdAt: -1 })
            .skip((current - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .toArray();
          const forms = await self.formSummaries(req);
          self.logInfo(req, 'submissions-viewed', {
            userId: req.user._id,
            formId: formId || 'all',
            page: current,
            count: rows.length
          });
          const html = await self.render(req, 'submissions', {
            forms,
            formId,
            titles: Object.fromEntries(forms.map(form => [ form._id, form.title ])),
            submissions: rows.map(self.presentSubmission),
            page: current,
            pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
            total,
            pageUrl: PAGE_URL,
            exportUrl: EXPORT_URL,
            notificationsEnabled: Boolean(notification)
          });
          self.privateHeaders(res);
          return res.type('html').send(`<!DOCTYPE html>\n${html}`);
        },
        [EXPORT_URL]: async (req, res) => {
          if (!self.canManageSubmissions(req)) {
            return self.notFound(res);
          }
          const formId = self.formFilter(req.query.form);
          const since = parseDate(req.query.since, false);
          const until = parseDate(req.query.until, true);
          if (formId === false || since === false || until === false) {
            return self.badRequest(res, 'Invalid form, since or until (use YYYY-MM-DD).');
          }
          const query = formId ? { formId } : {};
          if (since || until) {
            query.createdAt = {
              ...since && { $gte: since },
              ...until && { $lte: until }
            };
          }
          const total = await self.collection().countDocuments(query);
          if (total > EXPORT_LIMIT) {
            return self.badRequest(res, `The export would contain ${total} rows; the limit is ` +
              `${EXPORT_LIMIT}. Narrow it with since and until (YYYY-MM-DD).`);
          }
          const rows = await self.collection().find(query)
            .sort({ createdAt: 1 })
            .toArray();
          const forms = await self.formSummaries(req);
          const titles = Object.fromEntries(forms.map(form => [ form._id, form.title ]));
          const fields = [ ...new Set(rows.flatMap(row => Object.keys(row.data || {}))) ]
            .sort();
          const lines = [
            csvRow([ 'submission_id', 'received_utc', 'form', 'notification_status', ...fields ]),
            ...rows.map(row => {
              const item = self.presentSubmission(row);
              return csvRow([
                item._id,
                item.receivedAt,
                titles[item.formId] || item.formId,
                item.notificationStatus,
                ...fields.map(field => item.data[field])
              ]);
            })
          ];
          self.logInfo(req, 'submissions-exported', {
            userId: req.user._id,
            formId: formId || 'all',
            count: rows.length
          });
          const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
          self.privateHeaders(res);
          res.set('Content-Disposition', `attachment; filename="form-submissions-${stamp}.csv"`);
          // The byte-order mark lets spreadsheet programs detect UTF-8.
          return res.type('text/csv; charset=utf-8').send(`\ufeff${lines.join('\r\n')}\r\n`);
        }
      }
    };
  },
  tasks(self) {
    return {
      'retry-notifications': {
        usage: 'Retry failed or interrupted form notification emails.\n' +
          `Each submission is tried at most ${MAX_ATTEMPTS} times in total; up to ` +
          `${RETRY_BATCH} submissions per run, oldest first.\n` +
          'Usage: node app assurer-forms:retry-notifications',
        async task() {
          if (!notification) {
            throw new Error('Notifications are not configured (APOS_SMTP_HOST is not set).');
          }
          const rows = await self.collection().find({
            'notification.status': { $in: [ 'failed', 'pending' ] },
            'notification.attempts': { $lt: MAX_ATTEMPTS }
          }).sort({ createdAt: 1 }).limit(RETRY_BATCH).toArray();
          const due = rows.filter(row => row.notification.status === 'failed' ||
            Date.now() - new Date(row.createdAt).getTime() > PENDING_GRACE_MS);
          const req = self.apos.task.getReq();
          const titles = Object.fromEntries((await self.formSummaries(req))
            .map(form => [ form._id, form.title ]));
          let sent = 0;
          for (const row of due) {
            if (await self.sendNotification(row, titles[row.formId])) {
              sent++;
            }
          }
          self.apos.util.log(`Notifications retried: ${due.length}; sent: ${sent}; ` +
            `still failing: ${due.length - sent}.`);
        }
      },
      retention: {
        usage: 'Report, or delete, form submissions older than a retention period.\n' +
          'Dry run (default; changes nothing):\n' +
          '  node app assurer-forms:retention --days=180 [--form=<form id>]\n' +
          'Delete (needs the owner-approved APOS_FORM_RETENTION_DAYS; --days, if given, must match):\n' +
          '  node app assurer-forms:retention --execute [--form=<form id>]',
        async task(argv) {
          const days = argv.days !== undefined
            ? parseRetentionDays(argv.days)
            : approvedRetentionDays;
          if (!days) {
            throw new Error('Pass --days=<n> for a dry run, or set APOS_FORM_RETENTION_DAYS.');
          }
          const execute = argv.execute === true;
          if (execute && approvedRetentionDays === null) {
            throw new Error('Deletion needs APOS_FORM_RETENTION_DAYS (the owner-approved period).');
          }
          if (execute && days !== approvedRetentionDays) {
            throw new Error(`--days=${days} differs from APOS_FORM_RETENTION_DAYS=${approvedRetentionDays}.`);
          }
          const formId = argv.form === undefined
            ? null
            : self.formFilter(String(argv.form));
          if (formId === false) {
            throw new Error('Invalid --form.');
          }
          const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
          const query = {
            createdAt: { $lt: cutoff },
            ...formId && { formId }
          };
          const report = await self.retentionReport(query);
          const lines = [
            `${execute ? 'DELETE' : 'Dry run'}: submissions received before ${cutoff.toISOString()} ` +
              `(retention ${days} days)${formId ? ` for form ${formId}` : ''}.`,
            `Matching: ${report.total} of ${report.all} stored submissions.`,
            ...report.byForm.map(item => `  ${item.formId}: ${item.count}`)
          ];
          if (report.oldest) {
            lines.push(`Oldest matching: ${report.oldest.toISOString()}`);
          }
          if (execute && report.total > 0) {
            const result = await self.collection().deleteMany(query);
            lines.push(`Deleted: ${result.deletedCount}.`);
            self.logInfo('retention-deleted', {
              days,
              formId: formId || 'all',
              count: result.deletedCount
            });
          }
          self.apos.util.log(lines.join('\n'));
          return report;
        }
      }
    };
  },
  methods(self) {
    return {
      collection() {
        return self.apos.modules['@apostrophecms/form'].db;
      },
      // Admin role only: core grants `edit` on user accounts to admins alone.
      canManageSubmissions(req) {
        return Boolean(req.user) && self.apos.permission.can(req, 'edit', '@apostrophecms/user');
      },
      formFilter(value) {
        if (value === undefined || value === '') {
          return null;
        }
        return (typeof value === 'string' && FORM_ID.test(value)) ? value : false;
      },
      async formSummaries(req) {
        const forms = await self.apos.modules['@apostrophecms/form']
          .find(req, {})
          .project({
            _id: 1,
            title: 1
          })
          .toArray();
        for (const form of forms) {
          form.count = await self.collection().countDocuments({ formId: form._id });
        }
        return forms;
      },
      // Only these properties leave the module; internal fields of the
      // stored document are not exposed.
      presentSubmission(row) {
        return {
          _id: row._id,
          formId: row.formId,
          receivedAt: new Date(row.createdAt).toISOString(),
          notificationStatus: row.notification?.status || 'not recorded',
          notificationError: row.notification?.lastError || '',
          data: row.data || {}
        };
      },
      async retentionReport(query) {
        const all = await self.collection().countDocuments({});
        const total = await self.collection().countDocuments(query);
        const byForm = [];
        for (const formId of await self.collection().distinct('formId', query)) {
          byForm.push({
            formId,
            count: await self.collection().countDocuments({
              ...query,
              formId
            })
          });
        }
        const [ oldest ] = await self.collection().find(query)
          .sort({ createdAt: 1 }).limit(1).toArray();
        return {
          all,
          total,
          byForm,
          oldest: oldest ? new Date(oldest.createdAt) : null
        };
      },
      reviewUrl(formId) {
        const base = self.apos.baseUrl || '';
        return `${base}${PAGE_URL}?form=${encodeURIComponent(formId)}`;
      },
      // Sends one notification and records the outcome. Returns true when
      // the SMTP server accepted the message. Never throws.
      async sendNotification(submission, formTitle) {
        const attempts = (submission.notification?.attempts || 0) + 1;
        const lastAttemptAt = new Date();
        try {
          const message = buildNotification({
            submission,
            formTitle,
            includeValues: notification.includeValues,
            reviewUrl: self.reviewUrl(submission.formId)
          });
          await self.apos.modules['@apostrophecms/email'].getTransport().sendMail({
            from: notification.from,
            to: notification.to,
            subject: message.subject,
            text: message.text,
            // The message is built from text only; never let a value make
            // nodemailer read a local file or fetch a URL.
            disableFileAccess: true,
            disableUrlAccess: true
          });
          await self.setNotification(submission._id, {
            status: 'sent',
            attempts,
            lastAttemptAt,
            sentAt: new Date()
          });
          return true;
        } catch (e) {
          const lastError = errorCode(e);
          self.logError('notification-failed', {
            submissionId: submission._id,
            attempt: attempts,
            error: lastError
          });
          await self.setNotification(submission._id, {
            status: 'failed',
            attempts,
            lastAttemptAt,
            lastError
          });
          return false;
        }
      },
      async setNotification(_id, value) {
        try {
          await self.collection().updateOne({ _id }, { $set: { notification: value } });
        } catch (e) {
          self.logError('notification-status-not-saved', { submissionId: _id });
        }
      },
      privateHeaders(res) {
        res.set('Cache-Control', 'no-store');
        res.set('X-Robots-Tag', 'noindex, nofollow');
      },
      notFound(res) {
        self.privateHeaders(res);
        return res.status(404).type('text/plain').send('Not found');
      },
      badRequest(res, message) {
        self.privateHeaders(res);
        return res.status(400).type('text/plain').send(message);
      }
    };
  }
};
