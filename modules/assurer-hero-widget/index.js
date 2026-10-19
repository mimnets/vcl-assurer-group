// Full-width hero: editable rich-text content over an optional background
// image, with up to two call-to-action buttons.
//
// The heading and body live in an area so editors change them in place on
// the page; image and buttons are edited through the widget's modal.
import { linkFields } from '../../lib/link.js';

export default {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Assurer Hero',
    description: 'Large banner with headline, text, background image and buttons.',
    icon: 'image-area-icon'
  },
  icons: {
    'image-area-icon': 'ImageArea'
  },
  fields: {
    add: {
      eyebrow: {
        type: 'string',
        label: 'Eyebrow text',
        help: 'Short label shown above the headline.'
      },
      content: {
        type: 'area',
        label: 'Headline and text',
        options: {
          max: 1,
          widgets: {
            '@apostrophecms/rich-text': {
              toolbar: [ 'styles', 'bold', 'italic', 'link' ],
              styles: [
                {
                  tag: 'h1',
                  label: 'Headline (H1)'
                },
                {
                  tag: 'h2',
                  label: 'Headline (H2)'
                },
                {
                  tag: 'p',
                  label: 'Paragraph'
                }
              ]
            }
          }
        }
      },
      _backgroundImage: {
        type: 'relationship',
        label: 'Background image',
        withType: '@apostrophecms/image',
        max: 1
      },
      overlay: {
        type: 'select',
        label: 'Text contrast overlay',
        def: 'dark',
        choices: [
          {
            label: 'Dark',
            value: 'dark'
          },
          {
            label: 'Light',
            value: 'light'
          },
          {
            label: 'None',
            value: 'none'
          }
        ]
      },
      buttons: {
        type: 'array',
        label: 'Buttons',
        titleField: 'linkText',
        max: 2,
        fields: {
          add: {
            ...linkFields(),
            style: {
              type: 'select',
              label: 'Style',
              def: 'primary',
              choices: [
                {
                  label: 'Primary',
                  value: 'primary'
                },
                {
                  label: 'Outline',
                  value: 'outline'
                }
              ]
            }
          }
        }
      }
    }
  }
};
