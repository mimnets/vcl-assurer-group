// Legacy WordPress URLs that move (SEO plan §2, D-CONTENT-3). Seeded as
// @apostrophecms/redirect records by `node app assurer-seo:seed-redirects`.
// `from` is stored without a trailing slash; the trailing-slash middleware
// lets `/x/` match the same record, so both forms redirect in one hop.
// `to` is the slug of the target page, linked as a page relationship so the
// redirect follows later slug changes.
//
// Kept URLs (W01–W12, W21) need no record: the trailing-slash 301 covers
// them. The `/wp-content/uploads/` PDFs and video move with their files in
// CA-5 (content migration).
export const LEGACY_REDIRECTS = [
  {
    id: 'W13',
    from: '/downloads/corporate-profiles',
    to: '/downloads'
  },
  {
    id: 'W14',
    from: '/downloads/apparels-textiles',
    to: '/style/apparels-textiles'
  },
  {
    id: 'W15',
    from: '/downloads/active-wear-accessories',
    to: '/style/activewear-accessories'
  },
  {
    id: 'W16',
    from: '/downloads/home-tex-decor',
    to: '/style/home-tex-decor'
  },
  {
    id: 'W17',
    from: '/downloads/beauty-herbs',
    to: '/health/beauty-herbs'
  },
  {
    id: 'W18',
    from: '/downloads/food-minerals',
    to: '/health/food-minerals'
  },
  {
    id: 'W19',
    from: '/downloads/health-tex-medi-care',
    to: '/health/health-tex-medi-care'
  },
  {
    id: 'W20',
    from: '/gallery',
    to: '/gallery/images'
  },
  {
    id: 'W22',
    from: '/gallery/videos',
    to: '/gallery/images'
  },
  {
    id: 'W23',
    from: '/gallery/downloads',
    to: '/downloads'
  },
  {
    id: 'W24',
    from: '/presentation',
    to: '/downloads'
  },
  {
    id: 'W25',
    from: '/sitemap',
    to: '/'
  },
  {
    id: 'W26',
    from: '/website-under-maintenance',
    to: '/'
  },
  {
    id: 'W27',
    from: '/hello-world',
    to: '/'
  },
  {
    id: 'W28',
    from: '/category/uncategorized',
    to: '/'
  },
  {
    id: 'W29',
    from: '/author/admin',
    to: '/'
  },
  {
    id: 'feed',
    from: '/feed',
    to: '/'
  },
  {
    id: 'p1',
    from: '/?p=1',
    to: '/'
  },
  {
    id: 'page357',
    from: '/?page_id=357',
    to: '/'
  },
  {
    id: 'download-php',
    from: '/download.php',
    to: '/downloads'
  }
];

// The pattern core's redirect schema applies to `redirectSlug` in the UI.
// `insert()` skips schema validation, so the seed task checks it itself.
export const REDIRECT_SLUG_PATTERN = /^(\/[^*/]+)+(\/\*)?(\/[^*/]+)*$/;
