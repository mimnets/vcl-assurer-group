// Shared fields and loading for the section and listing widgets (m1-015,
// CA-2). Each listing widget has a `mode` select: hand-picked records, or a
// rule ("all", "of an organization", "with a tag"...). Hand-picked records
// come from an ordinary relationship field; the rule-based modes run a query
// in the widget's `load` method. Both use the request-aware query builder,
// so visitors only ever get published, non-archived records.

// Section anchor, as on `assurer-product-grid`.
export const anchorField = {
  type: 'slug',
  label: 'project:anchorId',
  help: 'project:anchorIdHelp'
};

// Section heading (H2) and a short introduction.
export const introField = {
  type: 'area',
  label: 'project:sectionIntro',
  options: {
    max: 1,
    widgets: {
      '@apostrophecms/rich-text': {
        toolbar: [ 'styles', 'bold', 'italic', 'link' ],
        styles: [
          {
            tag: 'h2',
            label: 'project:headingH2'
          },
          {
            tag: 'p',
            label: 'project:paragraph'
          }
        ]
      }
    }
  }
};

export function columnsField(def = '3') {
  return {
    type: 'select',
    label: 'project:columns',
    def,
    choices: [ '2', '3', '4' ].map(value => ({
      label: value,
      value
    }))
  };
}

// `choices` are `[ value, label ]` pairs; the first is the default.
export function modeField(choices) {
  return {
    type: 'select',
    label: 'project:listMode',
    def: choices[0][0],
    required: true,
    choices: choices.map(([ value, label ]) => ({
      label,
      value
    }))
  };
}

// Upper bound for the rule-based modes. Hand-picked lists are bounded by the
// relationship's own `max`.
export const LIMIT_MAX = 48;

export function limitField(condition) {
  return {
    type: 'integer',
    label: 'project:listLimit',
    help: 'project:listLimitHelp',
    def: 12,
    min: 1,
    max: LIMIT_MAX,
    if: condition
  };
}

// Clamp a stored limit; older or hand-made widgets may lack one.
export function listLimit(widget) {
  const n = Number.parseInt(widget.limit, 10);
  return Number.isFinite(n) ? Math.min(Math.max(n, 1), LIMIT_MAX) : 12;
}

// Sets `widget._listed` on every widget. `pickField` names the relationship
// used in "pick" mode; `query(widget)` returns a query for the other modes,
// or null when there is nothing to list.
export async function loadListed(widgets, { pickField, query }) {
  for (const widget of widgets) {
    if (widget.mode === 'pick') {
      widget._listed = widget[pickField] || [];
      continue;
    }
    const q = await query(widget);
    widget._listed = q ? await q.limit(listLimit(widget)).toArray() : [];
  }
}

// The aposDocIds of a loaded relationship, for `<field>Ids`-style criteria.
export function docIds(related) {
  return (related || []).map(doc => doc.aposDocId).filter(Boolean);
}
