// @apostrophecms/redirect (MIT, D-CONTENT-10): redirects managed by editors
// in "Redirects". New redirects default to permanent (301). The legacy
// WordPress map is seeded by `node app assurer-seo:seed-redirects`.
export default {
  options: {
    statusCode: 301
  }
};
