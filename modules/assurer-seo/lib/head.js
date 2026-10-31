// Adjusts the <head> nodes that @apostrophecms/seo builds (SEO plan §4, §6).
// Pure, so it can be unit-tested; modules/@apostrophecms/seo/index.js calls
// it from the module's `metaHead` method.
//
// - Description: the document's own SEO description, else its summary
//   (product category pages). The module's fallback to the home page's
//   values is dropped, so pages never repeat the home description.
// - `<meta name="title">` is dropped: the SEO title goes into <title>
//   (views/layout.jsx).
// - Canonical: the module only emits one when an editor picks a page; every
//   other page gets an absolute self-canonical.
// - Robots: non-production sites send `noindex,nofollow` on every page,
//   replacing any per-page value.
// - Open Graph and Twitter card tags, which the module does not emit.
// - JSON-LD: the WebSite SearchAction is removed (the site has no search).

const meta = (name, content) => ({
  name: 'meta',
  attrs: {
    name,
    content
  }
});
const property = (key, content) => ({
  name: 'meta',
  attrs: {
    property: key,
    content
  }
});
const isMeta = (node, key) => node.name === 'meta' && node.attrs?.name === key;
const isCanonical = node => node.name === 'link' && node.attrs?.rel === 'canonical';

export function seoDescription(doc) {
  const text = (doc?.seoDescription || doc?.summary || '').trim();
  return text || null;
}

// `options`: { indexing, notFound, absoluteUrl(url), image: { url, alt } | null }
export function adjustHead(nodes, data, options) {
  const doc = options.notFound ? null : (data.piece || data.page || null);
  const out = nodes.filter(node => !isMeta(node, 'title') &&
    !isMeta(node, 'description') &&
    !(isMeta(node, 'robots') && !options.indexing) &&
    !(isCanonical(node) && !doc));

  for (const node of out) {
    if (node.name === 'script' && node.attrs?.type === 'application/ld+json') {
      for (const schema of node.body?.[0]?.json?.['@graph'] || []) {
        if (schema['@type'] === 'WebSite') {
          delete schema.potentialAction;
        }
      }
    }
  }

  const added = [];
  if (!options.indexing) {
    added.push(meta('robots', 'noindex,nofollow'));
  }
  if (!doc) {
    return [ ...added, ...out ];
  }

  const description = seoDescription(doc);
  if (description) {
    added.push(meta('description', description));
  }
  let canonical = out.find(isCanonical);
  if (canonical) {
    canonical.attrs.href = options.absoluteUrl(canonical.attrs.href);
  } else if (doc._url) {
    canonical = {
      name: 'link',
      attrs: {
        rel: 'canonical',
        href: options.absoluteUrl(doc._url)
      }
    };
    added.push(canonical);
  }

  added.push(property('og:type', 'website'));
  added.push(property('og:title', doc.seoTitle || doc.title));
  if (description) {
    added.push(property('og:description', description));
  }
  if (canonical) {
    added.push(property('og:url', canonical.attrs.href));
  }
  if (data.global?.seoSiteName) {
    added.push(property('og:site_name', data.global.seoSiteName));
  }
  if (options.image?.url) {
    added.push(property('og:image', options.image.url));
    if (options.image.alt) {
      added.push(property('og:image:alt', options.image.alt));
    }
  }
  added.push(meta('twitter:card', options.image?.url ? 'summary_large_image' : 'summary'));

  return [ ...added, ...out ];
}
