// Visible breadcrumb trail (m1-020, CA-4), used by views/layout.jsx.
//
// Same items as the BreadcrumbList JSON-LD of @apostrophecms/seo
// (lib/jsonld-schemas.js, getBreadcrumbListSchema): the page's ancestors from
// the home page down, then the page itself. Pages only (pieces have no
// ancestors), and nothing on the home page or when the trail would hold only
// the current page.
export function breadcrumbItems(data) {
  const { page, piece } = data;
  if (!page || piece || !page._url) {
    return [];
  }
  const items = (page._ancestors || [])
    .filter(ancestor => ancestor._url && ancestor.title)
    .map(ancestor => ({
      title: ancestor.title,
      url: ancestor._url
    }));
  if (!items.length) {
    return [];
  }
  items.push({
    title: page.title,
    url: page._url,
    current: true
  });
  return items;
}
