// Key figures (m1-015, CA-2), e.g. "1,700+ employees". Values are strings so
// "1,700+" and "$67 Mn" both work. Real figures need an owner-confirmed
// "as of" date (D-CONTENT-12); until then only demo figures are used.

import {
  anchorField, introField
} from '../../lib/listing.js';

export default {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'project:stats',
    description: 'project:statsDescription',
    icon: 'chart-box-outline-icon'
  },
  icons: {
    'chart-box-outline-icon': 'ChartBoxOutline'
  },
  fields: {
    add: {
      anchor: anchorField,
      intro: introField,
      items: {
        type: 'array',
        label: 'project:statsItems',
        help: 'project:statsItemsHelp',
        titleField: 'label',
        min: 1,
        max: 6,
        required: true,
        fields: {
          add: {
            value: {
              type: 'string',
              label: 'project:statValue',
              help: 'project:statValueHelp',
              required: true,
              max: 20
            },
            label: {
              type: 'string',
              label: 'project:statLabel',
              required: true,
              max: 80
            },
            note: {
              type: 'string',
              label: 'project:statNote',
              help: 'project:statNoteHelp',
              max: 120
            }
          }
        }
      }
    }
  }
};
