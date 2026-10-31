// Unit tests for the SEO helpers (m1-018, CA-3).
// Run: npm run test:unit
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { pageTitle } from '../lib/seo-title.js';
import { defaultBaseUrl, readSeoEnv } from '../modules/assurer-seo/lib/config.js';
import { adjustHead } from '../modules/assurer-seo/lib/head.js';
import { LEGACY_REDIRECTS, REDIRECT_SLUG_PATTERN } from '../modules/assurer-seo/lib/legacy-redirects.js';
import { robotsTxt } from '../modules/assurer-seo/lib/robots.js';
import { withoutTrailingSlash } from '../modules/assurer-seo/lib/trailing-slash.js';

test('config: indexing off by default; base URL optional', () => {
  assert.deepEqual(readSeoEnv({}), {
    indexing: false,
    baseUrl: null
  });
  assert.equal(readSeoEnv({ APOS_ALLOW_INDEXING: '0' }).indexing, false);
  assert.equal(readSeoEnv({ APOS_BASE_URL: 'http://localhost:3000' }).baseUrl, 'http://localhost:3000');
  assert.equal(defaultBaseUrl({}), 'http://localhost:3000');
  assert.equal(defaultBaseUrl({ PORT: '3100' }), 'http://localhost:3100');
});

test('config: indexing needs an https base URL', () => {
  assert.equal(readSeoEnv({
    APOS_ALLOW_INDEXING: '1',
    APOS_BASE_URL: 'https://www.example.com'
  }).indexing, true);
  assert.throws(() => readSeoEnv({ APOS_ALLOW_INDEXING: '1' }), /https APOS_BASE_URL/);
  assert.throws(() => readSeoEnv({
    APOS_ALLOW_INDEXING: '1',
    APOS_BASE_URL: 'http://www.example.com'
  }), /https APOS_BASE_URL/);
  assert.throws(() => readSeoEnv({ APOS_ALLOW_INDEXING: 'yes' }), /must be 1/);
});

test('config: base URL must be a bare origin', () => {
  for (const bad of [ 'www.example.com', 'ftp://example.com', 'https://example.com/',
    'https://example.com/site', 'https://example.com?x=1', 'https://user:pw@example.com' ]) {
    assert.throws(() => readSeoEnv({ APOS_BASE_URL: bad }), /APOS_BASE_URL/, bad);
  }
});

test('robots.txt: non-production blocks everything', () => {
  assert.equal(robotsTxt({
    indexing: false,
    baseUrl: 'https://www.example.com'
  }), 'User-agent: *\nDisallow: /\n');
});

test('robots.txt: production allows crawling and names the sitemap', () => {
  const text = robotsTxt({
    indexing: true,
    baseUrl: 'https://www.example.com'
  });
  assert.match(text, /^User-agent: \*$/m);
  assert.doesNotMatch(text, /^Disallow: \/$/m);
  for (const path of [ '/login', '/api/', '/assurer/' ]) {
    assert.match(text, new RegExp(`^Disallow: ${path}$`, 'm'));
  }
  assert.match(text, /^Sitemap: https:\/\/www\.example\.com\/sitemap\.xml$/m);
});

test('trailing slash: stripped, query kept', () => {
  assert.equal(withoutTrailingSlash('/style/'), '/style');
  assert.equal(withoutTrailingSlash('/style/apparels-textiles/'), '/style/apparels-textiles');
  assert.equal(withoutTrailingSlash('/x///'), '/x');
  assert.equal(withoutTrailingSlash('/x/?a=1&b=2'), '/x?a=1&b=2');
});

test('trailing slash: left alone or refused', () => {
  for (const url of [ '/', '/?p=1', '/style', '/style?x=/', '//evil.example/', '/\\evil.example/',
    '/a\\b/', '/api/v1/@apostrophecms/page/' ]) {
    assert.equal(withoutTrailingSlash(url), null, url);
  }
});

test('legacy redirects: valid, unique, one hop, no slash forms', () => {
  const froms = LEGACY_REDIRECTS.map(r => r.from);
  assert.equal(new Set(froms).size, froms.length);
  for (const { from, to } of LEGACY_REDIRECTS) {
    assert.match(from, REDIRECT_SLUG_PATTERN, from);
    assert.ok(!from.endsWith('/'), from);
    assert.ok(!froms.includes(to), `${from} -> ${to} would chain`);
  }
});

const seoNodes = () => [
  {
    name: 'meta',
    attrs: {
      name: 'title',
      content: 'Home SEO title'
    }
  },
  {
    name: 'meta',
    attrs: {
      name: 'description',
      content: 'Home description'
    }
  },
  {
    name: 'meta',
    attrs: {
      name: 'robots',
      content: 'noindex'
    }
  },
  {
    name: 'script',
    attrs: { type: 'application/ld+json' },
    body: [ {
      json: {
        '@graph': [ {
          '@type': 'WebSite',
          potentialAction: { '@type': 'SearchAction' }
        } ]
      }
    } ]
  }
];
const find = (nodes, key) => nodes
  .find(n => [ n.attrs?.name, n.attrs?.property, n.attrs?.rel ].includes(key));
const options = extra => ({
  indexing: true,
  notFound: false,
  absoluteUrl: url => (url.startsWith('http') ? url : `https://www.example.com${url}`),
  image: null,
  ...extra
});

test('head: own description or summary only, never the home page values', () => {
  const page = {
    title: 'Category',
    _url: '/style/a',
    summary: 'Category summary.'
  };
  let nodes = adjustHead(seoNodes(), {
    page,
    home: { seoDescription: 'Home description' }
  }, options());
  assert.equal(find(nodes, 'description').attrs.content, 'Category summary.');
  assert.equal(find(nodes, 'title'), undefined);
  nodes = adjustHead(seoNodes(), {
    page: {
      title: 'Plain',
      _url: '/plain'
    }
  }, options());
  assert.equal(find(nodes, 'description'), undefined);
  assert.equal(find(nodes, 'og:description'), undefined);
  nodes = adjustHead(seoNodes(), {
    page: {
      ...page,
      seoDescription: 'Own description.'
    }
  }, options());
  assert.equal(find(nodes, 'description').attrs.content, 'Own description.');
});

test('head: absolute self-canonical, Open Graph and Twitter card', () => {
  const nodes = adjustHead(seoNodes(), {
    page: {
      title: 'Contact',
      seoTitle: 'Contact Assurer',
      _url: '/contact-us'
    },
    global: { seoSiteName: 'Assurer World Wide' }
  }, options({
    image: {
      url: 'https://www.example.com/uploads/a.jpg',
      alt: 'Alt'
    }
  }));
  assert.equal(find(nodes, 'canonical').attrs.href, 'https://www.example.com/contact-us');
  assert.equal(find(nodes, 'og:url').attrs.content, 'https://www.example.com/contact-us');
  assert.equal(find(nodes, 'og:title').attrs.content, 'Contact Assurer');
  assert.equal(find(nodes, 'og:site_name').attrs.content, 'Assurer World Wide');
  assert.equal(find(nodes, 'og:image').attrs.content, 'https://www.example.com/uploads/a.jpg');
  assert.equal(find(nodes, 'og:image:alt').attrs.content, 'Alt');
  assert.equal(find(nodes, 'twitter:card').attrs.content, 'summary_large_image');
  assert.equal(nodes.filter(n => n.attrs?.rel === 'canonical').length, 1);
});

test('head: an editor-chosen canonical is kept and made absolute', () => {
  const nodes = adjustHead([ ...seoNodes(), {
    name: 'link',
    attrs: {
      rel: 'canonical',
      href: '/other'
    }
  } ], {
    page: {
      title: 'Copy',
      _url: '/copy'
    }
  }, options());
  assert.equal(nodes.filter(n => n.attrs?.rel === 'canonical').length, 1);
  assert.equal(find(nodes, 'canonical').attrs.href, 'https://www.example.com/other');
});

test('head: robots per page in production; noindex everywhere otherwise', () => {
  let nodes = adjustHead(seoNodes(), {
    page: {
      title: 'A',
      _url: '/a'
    }
  }, options());
  assert.deepEqual(nodes.filter(n => n.attrs?.name === 'robots').map(n => n.attrs.content), [ 'noindex' ]);
  nodes = adjustHead(seoNodes(), {
    page: {
      title: 'A',
      _url: '/a'
    }
  }, options({ indexing: false }));
  assert.deepEqual(nodes.filter(n => n.attrs?.name === 'robots').map(n => n.attrs.content), [ 'noindex,nofollow' ]);
});

test('head: 404 gets no canonical or Open Graph; no SearchAction', () => {
  const nodes = adjustHead(seoNodes(), {
    page: {
      title: 'Home',
      _url: '/'
    }
  }, options({
    notFound: true,
    indexing: false
  }));
  assert.equal(find(nodes, 'canonical'), undefined);
  assert.equal(find(nodes, 'og:title'), undefined);
  assert.equal(find(nodes, 'robots').attrs.content, 'noindex,nofollow');
  const graph = nodes.find(n => n.name === 'script').body[0].json['@graph'];
  assert.equal(graph[0].potentialAction, undefined);
});

test('title: suffix, SEO title as entered, template override', () => {
  const global = { seoTitleSuffix: 'Assurer World Wide' };
  assert.equal(pageTitle({ page: { title: 'Contact' } }), 'Contact');
  assert.equal(pageTitle({
    page: { title: 'Contact' },
    global
  }), 'Contact | Assurer World Wide');
  assert.equal(pageTitle({
    page: {
      title: 'Home',
      seoTitle: 'Assurer World Wide — textiles and health'
    },
    global
  }), 'Assurer World Wide — textiles and health');
  assert.equal(pageTitle({
    title: '404 - Page not found',
    global
  }), '404 - Page not found | Assurer World Wide');
  assert.equal(pageTitle({
    page: { title: 'Assurer World Wide' },
    global
  }), 'Assurer World Wide');
});
