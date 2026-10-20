// Site-wide settings (ADR-0003): public company contact, footer and header
// call-to-action, edited once in "Global Content" and used by
// views/layout.jsx. Every field is empty by default and the layout shows
// only fields that have a value, so nothing unverified appears unless an
// editor enters and publishes it.
import { linkFields } from '../../../lib/link.js';
import { rejectNonWebUrls, webUrlField } from '../../../lib/web-url.js';
import { PHONE_PATTERN } from '../../../lib/contact.js';

export default {
  fields: {
    add: {
      contactEmail: {
        type: 'email',
        label: 'Public contact email',
        help: 'A shared business mailbox, shown in the footer.'
      },
      contactPhone: {
        type: 'string',
        label: 'Public contact phone',
        help: 'International format, e.g. +1 555 0100.',
        pattern: PHONE_PATTERN,
        max: 30
      },
      contactAddress: {
        type: 'string',
        textarea: true,
        label: 'Public postal address',
        max: 300
      },
      footerText: {
        type: 'string',
        textarea: true,
        label: 'Footer text',
        help: 'A short line about the company. Up to 300 characters. Only confirmed statements.',
        max: 300
      },
      copyrightName: {
        type: 'string',
        label: 'Copyright name',
        help: 'Shown after the © sign and the current year. Leave empty to show the default line.',
        max: 120
      },
      _footerLocations: {
        type: 'relationship',
        label: 'Locations listed in the footer',
        help: 'Optional, in the order shown. Only published locations appear.',
        withType: 'assurer-location',
        max: 12,
        builders: {
          project: {
            title: 1,
            city: 1,
            country: 1
          }
        }
      },
      socialLinks: {
        type: 'array',
        label: 'Social media links',
        help: 'Add only accounts that exist and are run by the company.',
        titleField: 'network',
        max: 8,
        fields: {
          add: {
            network: {
              type: 'select',
              label: 'Network',
              required: true,
              choices: [
                {
                  label: 'LinkedIn',
                  value: 'linkedin'
                },
                {
                  label: 'Facebook',
                  value: 'facebook'
                },
                {
                  label: 'Instagram',
                  value: 'instagram'
                },
                {
                  label: 'YouTube',
                  value: 'youtube'
                },
                {
                  label: 'X (Twitter)',
                  value: 'x'
                }
              ]
            },
            url: webUrlField('Profile URL', { required: true })
          }
        }
      },
      showHeaderCta: {
        type: 'boolean',
        label: 'Show a button at the end of the main menu',
        help: 'For example "Contact" linking to the contact page.',
        def: false
      },
      ...linkFields({ showHeaderCta: true })
    },
    group: {
      contact: {
        label: 'Contact',
        fields: [ 'contactEmail', 'contactPhone', 'contactAddress' ]
      },
      footer: {
        label: 'Footer',
        fields: [ 'footerText', 'copyrightName', '_footerLocations', 'socialLinks' ]
      },
      navigation: {
        label: 'Navigation',
        fields: [ 'showHeaderCta', 'linkText', 'linkType', '_linkPage', 'linkUrl' ]
      }
    }
  },
  handlers(self) {
    return {
      beforeSave: {
        rejectNonWebUrls: rejectNonWebUrls(self, [ 'socialLinks.url', 'linkUrl' ])
      }
    };
  }
};
