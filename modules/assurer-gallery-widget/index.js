// Image gallery (m1-015, CA-2): ordered images from the media library as
// square thumbnails. Each thumbnail links to the full image, so the gallery
// works without JavaScript; the player in ui/src/index.js opens the links in
// an accessible lightbox instead (no lightbox package). Every image needs
// alt text, because gallery images are informative.
import { requireAltText } from '../../lib/alt-text.js';
import {
  anchorField, columnsField, introField
} from '../../lib/listing.js';

export default {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'project:galleryWidget',
    description: 'project:galleryWidgetDescription',
    icon: 'image-multiple-icon'
  },
  icons: {
    'image-multiple-icon': 'ImageMultiple'
  },
  fields: {
    add: {
      anchor: anchorField,
      intro: introField,
      _images: {
        type: 'relationship',
        label: 'project:galleryImages',
        help: 'project:galleryImagesHelp',
        withType: '@apostrophecms/image',
        min: 1,
        max: 48,
        required: true
      },
      captionSource: {
        type: 'select',
        label: 'project:captionSource',
        def: 'none',
        choices: [
          {
            label: 'project:captionNone',
            value: 'none'
          },
          {
            label: 'project:captionTitle',
            value: 'title'
          },
          {
            label: 'project:captionCredit',
            value: 'credit'
          }
        ]
      },
      columns: columnsField('4')
    }
  },
  extendMethods(self) {
    return {
      sanitize: requireAltText(self, '_images', widget => widget._images || [])
    };
  }
};
