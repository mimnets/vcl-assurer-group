// Product list (m1-015, CA-2): products of a category page, or hand-picked
// products. "Category" mode lists the published products assigned to the
// chosen category page, or to the current page when none is chosen and the
// widget sits on a product category page.
import {
  anchorField, columnsField, docIds, introField, limitField, loadListed, modeField
} from '../../lib/listing.js';

const CATEGORY_TYPE = 'assurer-product-category-page';

export default {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'project:productList',
    description: 'project:productListDescription',
    icon: 'package-variant-icon'
  },
  icons: {
    'package-variant-icon': 'PackageVariant'
  },
  fields: {
    add: {
      anchor: anchorField,
      intro: introField,
      mode: modeField([
        [ 'category', 'project:modeCategory' ],
        [ 'pick', 'project:modePick' ]
      ]),
      _category: {
        type: 'relationship',
        label: 'project:productCategory',
        help: 'project:productCategoryHelp',
        withType: CATEGORY_TYPE,
        max: 1,
        if: { mode: 'category' },
        builders: {
          project: {
            title: 1,
            aposDocId: 1
          }
        }
      },
      _products: {
        type: 'relationship',
        label: 'project:products',
        help: 'project:pickHelp',
        withType: 'assurer-product',
        max: 24,
        withRelationships: [ '_image' ],
        if: { mode: 'pick' }
      },
      limit: limitField({ mode: 'category' }),
      columns: columnsField('3')
    }
  },
  extendMethods(self) {
    return {
      async load(_super, req, widgets) {
        await _super(req, widgets);
        await loadListed(widgets, {
          pickField: '_products',
          query: async (widget) => {
            const categoryIds = docIds(widget._category);
            if (!categoryIds.length) {
              const current = await self.currentCategory(req, widget);
              if (current) {
                categoryIds.push(current);
              }
            }
            if (!categoryIds.length) {
              return null;
            }
            return self.apos.modules['assurer-product']
              .find(req, { categoriesIds: { $in: categoryIds } })
              .areas(false)
              .relationships([ '_image' ]);
          }
        });
      }
    };
  },
  methods(self) {
    return {
      // aposDocId of the category page this widget is on, if any. On a page
      // view the page is `req.data.page`; when the editor re-renders the
      // widget, core passes the containing document's id as `_docId`.
      async currentCategory(req, widget) {
        const page = req.data.page;
        if (page) {
          return page.type === CATEGORY_TYPE ? page.aposDocId : null;
        }
        if (!widget._docId) {
          return null;
        }
        const doc = await self.apos.page.find(req, { _id: widget._docId })
          .areas(false)
          .relationships(false)
          .project({
            type: 1,
            aposDocId: 1
          })
          .toObject();
        return doc?.type === CATEGORY_TYPE ? doc.aposDocId : null;
      }
    };
  }
};
