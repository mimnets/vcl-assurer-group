// Locations (m1-015, CA-2): all published locations, those of one
// organization, or hand-picked ones. The location schema has no `kind`
// field (ADR-0003), so there is no "by kind" mode. Contact details appear
// only for locations whose "Show contact details" is on (default off).
import {
  anchorField, columnsField, docIds, introField, limitField, loadListed, modeField
} from '../../lib/listing.js';

export default {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'project:locationsWidget',
    description: 'project:locationsWidgetDescription',
    icon: 'map-marker-multiple-icon'
  },
  icons: {
    'map-marker-multiple-icon': 'MapMarkerMultiple'
  },
  fields: {
    add: {
      anchor: anchorField,
      intro: introField,
      mode: modeField([
        [ 'all', 'project:modeAll' ],
        [ 'organization', 'project:modeOrganization' ],
        [ 'pick', 'project:modePick' ]
      ]),
      _locations: {
        type: 'relationship',
        label: 'project:locations',
        help: 'project:pickHelp',
        withType: 'assurer-location',
        max: 24,
        withRelationships: [ '_organization' ],
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
      limit: limitField({
        $or: [
          { mode: 'all' },
          { mode: 'organization' }
        ]
      }),
      showAddress: {
        type: 'boolean',
        label: 'project:showAddress',
        help: 'project:showAddressHelp',
        def: true
      },
      columns: columnsField('3')
    }
  },
  extendMethods(self) {
    return {
      async load(_super, req, widgets) {
        await _super(req, widgets);
        await loadListed(widgets, {
          pickField: '_locations',
          query: (widget) => {
            const manager = self.apos.modules['assurer-location'];
            if (widget.mode === 'organization') {
              const ids = docIds(widget._organization);
              return ids.length
                ? manager.find(req, { organizationIds: { $in: ids } })
                  .areas(false)
                  .relationships([ '_organization' ])
                : null;
            }
            return manager.find(req)
              .areas(false)
              .relationships([ '_organization' ]);
          }
        });
      }
    };
  }
};
