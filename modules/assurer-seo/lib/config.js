// Environment-driven SEO settings (m1-018, CA-3).
//
// Indexing is off unless it is switched on explicitly, so a development,
// test or staging site can never be indexed by mistake:
//
//   APOS_BASE_URL=<origin>    Public site address, e.g. https://www.example.com
//                             (no path, no trailing slash). Read by core as
//                             the `baseUrl` option: page URLs, canonicals,
//                             the sitemap and JSON-LD become absolute.
//                             Unset: app.js uses http://localhost:<PORT>.
//   APOS_ALLOW_INDEXING=1     The production site. Search engines may index
//                             it: no site-wide noindex, and /robots.txt
//                             allows crawling. Requires an https
//                             APOS_BASE_URL. Unset or 0: every response
//                             carries noindex, and /robots.txt is
//                             `Disallow: /`.
//
// Invalid values throw at startup instead of silently changing what search
// engines see.

function fail(message) {
  throw new Error(`SEO configuration: ${message}`);
}

function isSet(value) {
  return value !== undefined && String(value).trim() !== '';
}

export function defaultBaseUrl(env) {
  return `http://localhost:${env.PORT || 3000}`;
}

export function parseBaseUrl(value) {
  const text = String(value).trim();
  let url;
  try {
    url = new URL(text);
  } catch (e) {
    fail('APOS_BASE_URL must be an absolute http or https URL.');
  }
  if (![ 'http:', 'https:' ].includes(url.protocol)) {
    fail('APOS_BASE_URL must use http or https.');
  }
  if (url.username || url.password || url.search || url.hash || text !== url.origin) {
    fail('APOS_BASE_URL must be an origin only, e.g. https://www.example.com (no path, query or trailing slash).');
  }
  return url.origin;
}

export function readSeoEnv(env) {
  const baseUrl = isSet(env.APOS_BASE_URL) ? parseBaseUrl(env.APOS_BASE_URL) : null;
  const flag = isSet(env.APOS_ALLOW_INDEXING) ? String(env.APOS_ALLOW_INDEXING).trim() : '0';
  if (![ '0', '1' ].includes(flag)) {
    fail('APOS_ALLOW_INDEXING must be 1 (production) or 0.');
  }
  const indexing = flag === '1';
  if (indexing && !baseUrl?.startsWith('https://')) {
    fail('APOS_ALLOW_INDEXING=1 requires an https APOS_BASE_URL.');
  }
  return {
    indexing,
    baseUrl
  };
}
