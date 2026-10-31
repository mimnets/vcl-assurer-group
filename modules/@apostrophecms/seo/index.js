// @apostrophecms/seo (MIT, D-CONTENT-10). The module's head tags are
// adjusted by modules/assurer-seo/lib/head.js: own-page descriptions only,
// self-canonicals, Open Graph, site-wide noindex outside production, and no
// search action in JSON-LD. Analytics options are left unset (out of scope).
import { adjustHead } from '../../assurer-seo/lib/head.js';

export default {
  extendMethods(self) {
    return {
      metaHead(_super, req) {
        const data = req.data || {};
        const doc = data.piece || data.page;
        const imageDoc = doc?._heroImage?.[0] || data.global?._seoDefaultImage?.[0];
        const absoluteUrl = url => (/^https?:\/\//.test(url) ? url : `${self.apos.url.getBaseUrl(req)}${url}`);
        const image = imageDoc?.attachment
          ? {
            url: absoluteUrl(self.apos.attachment.url(imageDoc.attachment, { size: 'full' })),
            alt: imageDoc.alt || ''
          }
          : null;
        return adjustHead(_super(req), data, {
          indexing: self.apos.modules['assurer-seo'].options.indexing,
          notFound: Boolean(req.notFound),
          absoluteUrl,
          image
        });
      }
    };
  }
};
