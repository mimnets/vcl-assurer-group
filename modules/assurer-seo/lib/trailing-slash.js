// The slash-less form of a request URL (path and query string), or null
// when the path has no trailing slash or must not be redirected. Paths that
// a browser could read as another host (`//x/`, `/\x/`) are refused, so the
// redirect can never leave the site; the REST API is left alone, as the
// redirect module does.
export function withoutTrailingSlash(originalUrl) {
  const index = originalUrl.indexOf('?');
  const path = index === -1 ? originalUrl : originalUrl.slice(0, index);
  const query = index === -1 ? '' : originalUrl.slice(index);
  if (path.length < 2 || !path.endsWith('/')) {
    return null;
  }
  if (!/^\/[^/\\]/.test(path) || path.includes('\\') || path.startsWith('/api/')) {
    return null;
  }
  return path.replace(/\/+$/, '') + query;
}
