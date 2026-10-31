// SEO plumbing (m1-018, CA-3; SEO plan §3–§5). Works with the official
// @apostrophecms/seo, sitemap and redirect modules (D-CONTENT-10):
//
// - Non-production sites (APOS_ALLOW_INDEXING unset, lib/config.js) send
//   `X-Robots-Tag: noindex, nofollow` on every response, and the seo module
//   adds a robots meta tag (lib/head.js).
// - /robots.txt is served here, from the environment (lib/robots.js), in
//   place of the seo module's Global Content setting.
// - Trailing slash: `/x/` gets a single 301. The slash-less URL is handed to
//   the redirect module first, so a legacy redirect record for `/x` answers
//   `/x/` directly; otherwise the `noMatch` handler sends 301 to `/x`, query
//   string kept. Core alone would send 302 and drop the query string.
// - The sitemap leaves out documents marked "noindex" in their SEO tab.
// - `node app assurer-seo:seed-redirects` adds the legacy WordPress
//   redirects (lib/legacy-redirects.js) as ordinary redirect records.
import { readSeoEnv } from './lib/config.js';
import { LEGACY_REDIRECTS, REDIRECT_SLUG_PATTERN } from './lib/legacy-redirects.js';
import { robotsTxt } from './lib/robots.js';
import { withoutTrailingSlash } from './lib/trailing-slash.js';

const seoEnv = readSeoEnv(process.env);

export default {
  options: {
    indexing: seoEnv.indexing
  },
  middleware(self) {
    return {
      noindexHeader: {
        middleware(req, res, next) {
          if (!self.options.indexing) {
            res.set('X-Robots-Tag', 'noindex, nofollow');
          }
          return next();
        }
      },
      robotsTxt: {
        url: '/robots.txt',
        middleware(req, res, next) {
          if (![ 'GET', 'HEAD' ].includes(req.method)) {
            return next();
          }
          res.type('text/plain');
          return res.send(robotsTxt({
            indexing: self.options.indexing,
            baseUrl: self.apos.baseUrl
          }));
        }
      },
      trailingSlash: {
        before: '@apostrophecms/redirect',
        middleware(req, res, next) {
          if ([ 'GET', 'HEAD' ].includes(req.method)) {
            const target = withoutTrailingSlash(req.originalUrl);
            if (target) {
              // The redirect module matches on `req.originalUrl`. Nothing
              // else reads it before the request ends in a redirect.
              req.assurerTrailingSlash = target;
              req.originalUrl = target;
            }
          }
          return next();
        }
      }
    };
  },
  handlers(self) {
    return {
      '@apostrophecms/redirect:noMatch': {
        trailingSlash(req, result) {
          if (req.assurerTrailingSlash) {
            result.status = 301;
            result.rawRedirect = req.assurerTrailingSlash;
          }
        }
      },
      '@apostrophecms/url:getAllUrlMetadata': {
        async dropNoindex(req, results) {
          const ids = results.filter(entry => entry._id).map(entry => entry._id);
          if (!ids.length) {
            return;
          }
          const noindex = await self.apos.doc.find(req, {
            _id: { $in: ids },
            seoRobots: { $in: [ 'noindex' ] }
          }).project({ _id: 1 }).toArray();
          const drop = new Set(noindex.map(doc => doc._id));
          for (let i = results.length - 1; i >= 0; i--) {
            if (drop.has(results[i]._id)) {
              results.splice(i, 1);
            }
          }
        }
      }
    };
  },
  tasks(self) {
    return {
      'seed-redirects': {
        usage: 'Add the legacy WordPress redirects (SEO plan §2) as redirect records.\n' +
          'Adds missing records only; never changes or removes existing ones, so\n' +
          'editors may change or delete them in the Redirects manager. A redirect\n' +
          'is added only when its published target page exists; run again after\n' +
          'new pages are published.\n' +
          'Usage: node app assurer-seo:seed-redirects [--strict]\n' +
          '  --strict  fail if any redirect could not be added',
        task: (argv) => self.seedRedirects(argv)
      }
    };
  },
  methods(self) {
    return {
      async seedRedirects(argv = {}) {
        const redirects = self.apos.modules['@apostrophecms/redirect'];
        const req = self.apos.task.getReq();
        const published = self.apos.task.getReq({ mode: 'published' });
        const report = {
          added: [],
          present: [],
          changed: [],
          skipped: []
        };
        for (const entry of LEGACY_REDIRECTS) {
          const label = `${entry.id} ${entry.from} -> ${entry.to}`;
          if (!REDIRECT_SLUG_PATTERN.test(entry.from)) {
            throw new Error(`Invalid redirect slug: ${entry.from}`);
          }
          const target = await self.apos.page
            .find(published, { slug: entry.to }).toObject();
          const existing = await redirects
            .find(req, { redirectSlug: entry.from }).toObject();
          if (existing) {
            const same = existing.urlType === 'internal' &&
              String(existing.statusCode) === '301' &&
              target && existing.newPageIds?.[0] === target.aposDocId;
            (same ? report.present : report.changed).push(label);
            continue;
          }
          if (!target) {
            report.skipped.push(`${label} (target page not published)`);
            continue;
          }
          // A redirect runs before page routing and would hide a real page.
          if (!entry.from.includes('?') &&
            await self.apos.page.find(published, { slug: entry.from }).toObject()) {
            report.skipped.push(`${label} (a published page uses ${entry.from})`);
            continue;
          }
          await redirects.insert(req, {
            ...redirects.newInstance(),
            title: `Legacy ${entry.id}: ${entry.from}`,
            redirectSlug: entry.from,
            urlType: 'internal',
            _newPage: [ target ],
            statusCode: '301',
            ignoreQueryString: false,
            forwardQueryString: false
          });
          report.added.push(label);
        }
        const section = (title, list) => list.length
          ? `\n${title}: ${list.length}\n  ${list.join('\n  ')}`
          : '';
        self.apos.util.log('Legacy redirects:' +
          section('added', report.added) +
          section('already present', report.present) +
          section('changed in the Redirects manager (left as is)', report.changed) +
          section('not added', report.skipped) +
          (report.added.length ? '' : '\nNothing added.'));
        if (argv.strict && report.skipped.length) {
          throw new Error(`${report.skipped.length} legacy redirect(s) not added (--strict).`);
        }
        return report;
      }
    };
  }
};
