// A single product card: image, title, editable description and an optional
// link. Intended for use inside `assurer-product-grid`.
import { linkFields } from '../../lib/link.js';

export default {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Assurer Product Card',
    icon: 'card-text-icon'
  },
  icons: {
    'card-text-icon': 'CardText'
  },
  fields: {
    add: {
      _image: {
        type: 'relationship',
        label: 'Image',
        withType: '@apostrophecms/image',
        max: 1
      },
      badge: {
        type: 'string',
        label: 'Badge',
        help: 'Optional short label, e.g. "New".'
      },
      title: {
        type: 'string',
        label: 'Product name',
        required: true
      },
      body: {
        type: 'area',
        label: 'Description',
        options: {
          max: 1,
          widgets: {
            '@apostrophecms/rich-text': {
              toolbar: [ 'bold', 'italic', 'link', 'bulletList' ]
            }
          }
        }
      },
      hasLink: {
        type: 'boolean',
        label: 'Show a link',
        def: false
      },
      ...linkFields({ hasLink: true })
    }
  }
};
