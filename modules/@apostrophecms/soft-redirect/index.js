// Core soft redirects (old URLs of pages whose slug changed) are permanent:
// 301 instead of core's default 302 (SEO plan §3).
export default {
  options: {
    statusCode: 301
  }
};
