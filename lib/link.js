// Shared link fields: an internal page or an external URL.
//
// `linkFields()` returns the fields to spread into a schema's `fields.add`.
// Pass a condition (e.g. `{ hasLink: true }`) to show the fields only when it
// holds; hidden fields are not validated, so `required` only applies when
// they are shown. Resolve the saved values with `linkHref()`.

export function linkFields(condition = {}) {
  // Only emit `if` when there is something to test.
  const when = (extra = {}) => {
    const test = {
      ...condition,
      ...extra
    };
    return Object.keys(test).length ? { if: test } : {};
  };
  return {
    linkText: {
      type: 'string',
      label: 'Link text',
      required: true,
      ...when()
    },
    linkType: {
      type: 'select',
      label: 'Link to',
      def: 'page',
      choices: [
        {
          label: 'A page on this site',
          value: 'page'
        },
        {
          label: 'An external URL',
          value: 'url'
        }
      ],
      ...when()
    },
    _linkPage: {
      type: 'relationship',
      label: 'Page',
      withType: '@apostrophecms/any-page-type',
      max: 1,
      ...when({ linkType: 'page' })
    },
    // `url` fields are sanitized by core, which rejects unsafe schemes such
    // as `javascript:`.
    linkUrl: {
      type: 'url',
      label: 'URL',
      ...when({ linkType: 'url' })
    }
  };
}

// Resolve a set of the fields above to an href, or null when unset.
export function linkHref(item) {
  if (item.linkType === 'url') {
    return item.linkUrl || null;
  }
  return item._linkPage?.[0]?._url || null;
}
