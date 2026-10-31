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
      ...linkFields({ showHeaderCta: true }),
      // SEO (m1-018). These join the "SEO" tab of @apostrophecms/seo.
      seoTitleSuffix: {
        type: 'string',
        label: 'project:seoTitleSuffix',
        help: 'project:seoTitleSuffixHelp',
        max: 60
      },
      _seoDefaultImage: {
        type: 'relationship',
        label: 'project:seoDefaultImage',
        help: 'project:seoDefaultImageHelp',
        withType: '@apostrophecms/image',
        max: 1
      }
    },
    // robots.txt comes from the environment (modules/assurer-seo), and the
    // site has no search page, so these seo module settings would have no
    // effect.
    remove: [ 'robotsTxtSelection', 'robotsAISelective', 'robotsCustomText', 'seoSearchQueryParam' ],
    group: {
      seo: {
        fields: [ 'seoTitleSuffix', '_seoDefaultImage' ]
      },
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
  extendMethods(self) {
    return {
      // The seo module makes "Organization Name" required, which blocks
      // saving any Global Content until the company's details are entered.
      // They are not confirmed yet (D-CONTENT-2, D-CONTENT-12), so the name
      // is optional; without it no Organization JSON-LD is emitted (m1-018).
      composeSchema(_super) {
        _super();
        const org = self.schema.find(field => field.name === 'seoJsonLdOrganization');
        if (org?.fields?.add?.name) {
          org.fields.add.name.required = false;
        }
        const name = org?.schema?.find(field => field.name === 'name');
        if (name) {
          name.required = false;
        }
      }
    };
  },
  handlers(self) {
    return {
      beforeSave: {
        rejectNonWebUrls: rejectNonWebUrls(self, [ 'socialLinks.url', 'linkUrl' ])
      }
    };
  }
};
