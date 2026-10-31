// Feature grid (m1-015, CA-2): a section of short titled items, e.g.
// services, goals and values, or roles. Items are inline, because they are
// not reused elsewhere. A new widget rather than a generalised product card
// (D-CONTENT-8): product cards stay a product-specific pattern, and a fixed
// item schema keeps titles and text short and typed.
import { requireAltText } from '../../lib/alt-text.js';
import { linkFields } from '../../lib/link.js';
import {
  anchorField, columnsField, introField
} from '../../lib/listing.js';

export default {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'project:featureGrid',
    description: 'project:featureGridDescription',
    icon: 'view-module-icon'
  },
  icons: {
    'view-module-icon': 'ViewModule'
  },
  fields: {
    add: {
      anchor: anchorField,
      intro: introField,
      columns: columnsField('3'),
      items: {
        type: 'array',
        label: 'project:featureItems',
        titleField: 'title',
        min: 1,
        max: 12,
        required: true,
        fields: {
          add: {
            title: {
              type: 'string',
              label: 'project:itemTitle',
              required: true,
              max: 120
            },
            text: {
              type: 'string',
              textarea: true,
              label: 'project:itemText',
              help: 'project:itemTextHelp',
              max: 300
            },
            _image: {
              type: 'relationship',
              label: 'project:itemImage',
              help: 'project:itemImageHelp',
              withType: '@apostrophecms/image',
              max: 1
            },
            anchor: {
              type: 'slug',
              label: 'project:itemAnchor',
              help: 'project:itemAnchorHelp'
            },
            hasLink: {
              type: 'boolean',
              label: 'project:showLink',
              def: false
            },
            ...linkFields({ hasLink: true })
          }
        }
      }
    }
  },
  extendMethods(self) {
    return {
      sanitize: requireAltText(self, 'items', widget =>
        (widget.items || []).flatMap(item => item._image || []))
    };
  }
};
