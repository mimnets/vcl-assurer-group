// @apostrophecms/sitemap (MIT, D-CONTENT-10): /sitemap.xml lists published
// pages (pieces have no show pages yet). Needs core `baseUrl` (app.js).
// Documents marked "noindex" are left out by modules/assurer-seo. Files are
// left out: the sitemap lists pages. The sitemap is cached for an hour
// (module default), so changes appear within the hour.
export default {
  options: {
    excludeTypes: [ '@apostrophecms/file' ]
  }
};
