// Location record (ADR-0003): an office or site of a group organization.
// No coordinates and no map integration (privacy, CSP); a later widget may
// link out to a map instead.
//
// Contact details here are for a business location, never a person, and are
// shown only when "Show contact details" is on (default off), so an editor
// must decide to publish them.
import { displayOrderField, displayOrderSort } from '../../lib/display-order.js';
import { PHONE_PATTERN } from '../../lib/contact.js';

export default {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Location',
    // Core derives "G,<first letter>", which would clash with Pages,
    // People, Products, Forms and Organizations.
    shortcut: 'G,L',
    pluralLabel: 'Locations',
    sort: displayOrderSort
  },
  fields: {
    add: {
      title: {
        type: 'string',
        label: 'Location name',
        required: true,
        sortify: true,
        max: 120
      },
      city: {
        type: 'string',
        label: 'City',
        required: true,
        max: 80
      },
      country: {
        type: 'string',
        label: 'Country',
        required: true,
        max: 80
      },
      address: {
        type: 'object',
        label: 'Postal address (optional)',
        fields: {
          add: {
            line1: {
              type: 'string',
              label: 'Address line 1',
              max: 120
            },
            line2: {
              type: 'string',
              label: 'Address line 2',
              max: 120
            },
            postalCode: {
              type: 'string',
              label: 'Postal code',
              max: 20
            },
            region: {
              type: 'string',
              label: 'State or region',
              max: 80
            }
          }
        }
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
      showContact: {
        type: 'boolean',
        label: 'Show contact details on the website',
        help: 'Off by default. Turn on only for approved business contact details.',
        def: false
      },
      publicPhone: {
        type: 'string',
        label: 'Business phone',
        help: 'International format, e.g. +1 555 0100. Never a personal number.',
        pattern: PHONE_PATTERN,
        max: 30
      },
      publicEmail: {
        type: 'email',
        label: 'Business email',
        help: 'A shared business mailbox. Never a personal address.'
      },
      displayOrder: displayOrderField
    },
    group: {
      basics: {
        label: 'Basics',
        fields: [ 'title', 'city', 'country', 'address', '_organization', 'displayOrder' ]
      },
      contact: {
        label: 'Public contact',
        fields: [ 'showContact', 'publicPhone', 'publicEmail' ]
      }
    }
  }
};
