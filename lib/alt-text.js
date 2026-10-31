// Required alt text for images placed in project widgets (m1-015, ADR-0003
// §7). Core image pieces keep alt text optional, because some images are
// decorative. A widget whose images are informative refuses to save while
// any of its chosen images has no alt text, so the editor sees an error and
// fixes the image in the media library.
//
// Usage, in a widget module:
//
//   extendMethods(self) {
//     return {
//       sanitize: requireAltText(self, '_images', widget => widget._images || [])
//     };
//   }
//
// The error is thrown the way core's schema validation throws field errors
// (an array of errors with a `path`), so the widget editor marks the field
// and core's area handling reports it as a 400, not a server error.

// The image ids a relationship value holds, whether loaded or not.
export function relatedIds(related) {
  return (related || []).map(item => item?._id).filter(Boolean);
}

// Titles of the images that have no alt text, in the order given.
export function missingAlt(images) {
  return images
    .filter(image => !String(image.alt || '').trim())
    .map(image => image.title || image._id);
}

// `field` names the widget field to mark; `collect(widget)` returns the
// relationship entries (or ids) to check.
export function requireAltText(self, field, collect) {
  return async function (_super, req, input, options, convertOptions = {}) {
    const output = await _super(req, input, options, convertOptions);
    // Internal conversions that skip relationship loading (core passes
    // `fetchRelationships: false`) are not editor saves; leave them alone.
    if (convertOptions.fetchRelationships === false) {
      return output;
    }
    const ids = collect(output)
      .map(item => (typeof item === 'string' ? item : item?._id))
      .filter(Boolean);
    if (!ids.length) {
      return output;
    }
    const images = await self.apos.image.find(req, { _id: { $in: ids } })
      .relationships(false)
      .areas(false)
      .project({
        _id: 1,
        title: 1,
        alt: 1
      })
      .toArray();
    const missing = missingAlt(images);
    if (missing.length) {
      const error = self.apos.error('invalid', req.t('project:altTextRequired', {
        titles: missing.join(', ')
      }));
      error.path = field;
      throw [ error ];
    }
    return output;
  };
}
