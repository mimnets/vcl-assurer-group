// Product card section: an intro area plus a responsive grid whose items are
// `assurer-product-card` widgets. Because the cards are widgets in an area,
// editors add, remove and drag-reorder them directly on the page.

export default {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'Assurer Product Cards',
    description: 'Section heading with a grid of product cards.',
    icon: 'view-grid-icon'
  },
  icons: {
    'view-grid-icon': 'ViewGrid'
  },
  fields: {
    add: {
      anchor: {
        type: 'slug',
        label: 'Anchor ID',
        help: 'Optional. Lets buttons link to this section, e.g. "products" for #products.'
      },
      intro: {
        type: 'area',
        label: 'Section heading and intro',
        options: {
          max: 1,
          widgets: {
            '@apostrophecms/rich-text': {
              toolbar: [ 'styles', 'bold', 'italic', 'link' ],
              styles: [
                {
                  tag: 'h2',
                  label: 'Heading (H2)'
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
      columns: {
        type: 'select',
        label: 'Columns on wide screens',
        def: '3',
        choices: [
          {
            label: '2',
            value: '2'
          },
          {
            label: '3',
            value: '3'
          },
          {
            label: '4',
            value: '4'
          }
        ]
      },
      cards: {
        type: 'area',
        label: 'Cards',
        options: {
          widgets: {
            'assurer-product-card': {}
          }
        }
      }
    }
  }
};
