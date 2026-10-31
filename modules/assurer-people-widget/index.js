// People (m1-015, CA-2): hand-picked people, or the published people of one
// organization. The person schema has no `group` field (ADR-0003), so there
// is no group filter.
//
// Privacy (D-CONTENT-4): the person record holds no contact details, and
// this widget never renders any. Photos sit next to the name, so they use
// empty alt text.
import {
  anchorField, columnsField, docIds, introField, limitField, loadListed, modeField
} from '../../lib/listing.js';

export default {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'project:peopleWidget',
    description: 'project:peopleWidgetDescription',
    icon: 'account-group-icon'
  },
  icons: {
    'account-group-icon': 'AccountGroup'
  },
  fields: {
    add: {
      anchor: anchorField,
      intro: introField,
      mode: modeField([
        [ 'pick', 'project:modePick' ],
        [ 'organization', 'project:modeOrganization' ]
      ]),
      _people: {
        type: 'relationship',
        label: 'project:people',
        help: 'project:pickHelp',
        withType: 'assurer-person',
        max: 24,
        withRelationships: [ '_photo', '_organization' ],
        if: { mode: 'pick' }
      },
      _organization: {
        type: 'relationship',
        label: 'project:organization',
        withType: 'assurer-organization',
        max: 1,
        required: true,
        if: { mode: 'organization' },
        builders: {
          project: {
            title: 1,
            aposDocId: 1
          }
        }
      },
      limit: limitField({ mode: 'organization' }),
      columns: columnsField('3')
    }
  },
  extendMethods(self) {
    return {
      async load(_super, req, widgets) {
        await _super(req, widgets);
        await loadListed(widgets, {
          pickField: '_people',
          query: (widget) => {
            const ids = docIds(widget._organization);
            return ids.length
              ? self.apos.modules['assurer-person']
                .find(req, { organizationIds: { $in: ids } })
                .areas(false)
                .relationships([ '_photo', '_organization' ])
              : null;
          }
        });
      }
    };
  }
};
