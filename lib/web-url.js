// Website URL fields restricted to http and https (m1-014).
//
// Core's `url` field type already drops unsafe schemes such as `javascript:`
// and `data:` (launder), but still accepts `mailto:`, `tel:`, `sms:` and
// `ftp:`. A field from `webUrlField()` is a plain core `url` field; the
// `rejectNonWebUrls()` handler then refuses to save a document whose
// listed fields hold anything other than an absolute http(s) URL, so the
// editor sees an error instead of a silently changed value.

export function webUrlField(label, extra = {}) {
  return {
    type: 'url',
    label,
    help: 'Full address starting with https:// (or http://).',
    ...extra
  };
}

export function isWebUrl(value) {
  if (typeof value !== 'string' || !value.length) {
    return false;
  }
  let url;
  try {
    url = new URL(value);
  } catch (e) {
    return false;
  }
  return (url.protocol === 'https:' || url.protocol === 'http:') && Boolean(url.hostname);
}

// Returns the dotted paths of the offending values, e.g. `socialLinks.1.url`.
// `paths` entries are field names, or `arrayField.subField` for array items.
export function invalidWebUrls(doc, paths) {
  const bad = [];
  for (const p of paths) {
    const [ name, sub ] = p.split('.');
    if (sub) {
      (doc[name] || []).forEach((item, i) => {
        if (item?.[sub] && !isWebUrl(item[sub])) {
          bad.push(`${name}.${i}.${sub}`);
        }
      });
    } else if (doc[name] && !isWebUrl(doc[name])) {
      bad.push(name);
    }
  }
  return bad;
}

// `beforeSave` handler factory for a module's `handlers(self)`.
export function rejectNonWebUrls(self, paths) {
  return async function (req, doc) {
    const bad = invalidWebUrls(doc, paths);
    if (bad.length) {
      throw self.apos.error('invalid', `Website addresses must start with https:// or http:// (${bad.join(', ')}).`);
    }
  };
}
