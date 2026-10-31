// The <title> text (SEO plan §4), used by views/layout.jsx.
//
// - A template's explicit `title` (e.g. the 404 page) or the document title,
//   followed by " | <suffix>" from Global Content (SEO tab).
// - A document's "SEO title", when set, is used exactly as entered, without
//   the suffix (e.g. a dedicated home page title).
export function pageTitle(data) {
  const doc = data.piece || data.page;
  if (!data.title && doc?.seoTitle?.trim()) {
    return doc.seoTitle.trim();
  }
  const base = (data.title || doc?.title || '').trim();
  const suffix = data.global?.seoTitleSuffix?.trim();
  if (!suffix) {
    return base;
  }
  if (!base) {
    return suffix;
  }
  if (base === suffix || base.endsWith(` | ${suffix}`)) {
    return base;
  }
  return `${base} | ${suffix}`;
}
