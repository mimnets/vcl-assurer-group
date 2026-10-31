// /robots.txt body (SEO plan §5). Non-production sites block all crawling;
// production allows everything except login, the REST API and project admin
// pages, and names the sitemap.
export function robotsTxt({ indexing, baseUrl }) {
  if (!indexing) {
    return 'User-agent: *\nDisallow: /\n';
  }
  return [
    'User-agent: *',
    'Disallow: /login',
    'Disallow: /api/',
    'Disallow: /assurer/',
    '',
    `Sitemap: ${baseUrl}/sitemap.xml`,
    ''
  ].join('\n');
}
