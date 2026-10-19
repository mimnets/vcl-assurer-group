// Image slideshow. Each slide is an image from the media library plus an
// optional caption. Slides are reordered by dragging them in the widget
// editor. Client behaviour lives in ui/src/index.js.

export default {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Assurer Slideshow',
    description: 'Rotating set of images with captions.',
    icon: 'view-carousel-icon'
  },
  icons: {
    'view-carousel-icon': 'ViewCarousel'
  },
  fields: {
    add: {
      slides: {
        type: 'array',
        label: 'Slides',
        titleField: 'caption',
        min: 1,
        max: 12,
        required: true,
        fields: {
          add: {
            _image: {
              type: 'relationship',
              label: 'Image',
              withType: '@apostrophecms/image',
              max: 1,
              required: true
            },
            caption: {
              type: 'string',
              label: 'Caption'
            }
          }
        }
      },
      autoplay: {
        type: 'boolean',
        label: 'Advance automatically',
        help: 'Automatic advance is disabled for visitors who prefer reduced motion.',
        def: true
      },
      interval: {
        type: 'integer',
        label: 'Seconds per slide',
        def: 6,
        min: 3,
        max: 30,
        if: {
          autoplay: true
        }
      }
    }
  }
};
