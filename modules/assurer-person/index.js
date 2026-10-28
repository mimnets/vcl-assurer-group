// Person record (ADR-0003), for leadership and contact profiles.
//
// Privacy by design (D-CONTENT-4): the schema has NO personal phone or email
// fields, so personal contact details cannot be published by accident.
// Adding them needs the owner's and DPO's explicit approval and an update to
// ADR-0003. Real leadership profiles are entered only after owner review;
// none are imported from the old site.
import { displayOrderField, displayOrderSort } from '../../lib/display-order.js';

export default {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Person',
    // Core derives "G,<first letter>", which would clash with Pages,
    // People, Products, Forms and Organizations.
    shortcut: 'G,E',
    pluralLabel: 'People',
    sort: displayOrderSort
  },
  fields: {
    add: {
      title: {
        type: 'string',
        label: 'Full name',
        required: true,
        sortify: true,
        max: 120
      },
      jobTitle: {
        type: 'string',
        label: 'Position',
        max: 120
      },
      _organization: {
        type: 'relationship',
        label: 'Organization',
        withType: 'assurer-organization',
        max: 1,
        builders: {
          project: {
            title: 1
          }
        }
      },
      _photo: {
        type: 'relationship',
        label: 'Profile photo',
        help: 'Square (1:1), at least 800 px wide. Publish only with the person\'s consent.',
        withType: '@apostrophecms/image',
        max: 1
      },
      bio: {
        type: 'string',
        textarea: true,
        label: 'Short biography',
        help: 'Optional, up to 600 characters. Publish only text the person has approved.',
        max: 600
      },
      displayOrder: displayOrderField
    },
    group: {
      basics: {
        label: 'Basics',
        fields: [ 'title', 'jobTitle', '_organization', '_photo', 'bio', 'displayOrder' ]
      }
    }
  }
};
