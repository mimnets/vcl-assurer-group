// Downloads (m1-015, CA-2): core `@apostrophecms/file` pieces, either those
// with chosen file tags or hand-picked ones. Covers single files too, so the
// core file widget is not added to page areas. The type and size shown come
// from the stored attachment. Upload limits and allowed file types stay
// core's, enforced server-side by `@apostrophecms/attachment`.
import {
  anchorField, docIds, introField, limitField, loadListed, modeField
} from '../../lib/listing.js';

export default {
  extend: '@apostrophecms/widget-type',
  options: {
    label: 'project:downloadsWidget',
    description: 'project:downloadsWidgetDescription',
    icon: 'file-download-icon'
  },
  icons: {
    'file-download-icon': 'FileDownload'
  },
  fields: {
    add: {
      anchor: anchorField,
      intro: introField,
      mode: modeField([
        [ 'tag', 'project:modeTag' ],
        [ 'pick', 'project:modePick' ]
      ]),
      _tags: {
        type: 'relationship',
        label: 'project:fileTags',
        help: 'project:fileTagsHelp',
        withType: '@apostrophecms/file-tag',
        max: 5,
        required: true,
        if: { mode: 'tag' },
        builders: {
          project: {
            title: 1,
            aposDocId: 1
          }
        }
      },
      _files: {
        type: 'relationship',
        label: 'project:files',
        help: 'project:pickHelp',
        withType: '@apostrophecms/file',
        max: 48,
        if: { mode: 'pick' }
      },
      limit: limitField({ mode: 'tag' })
    }
  },
  extendMethods(self) {
    return {
      async load(_super, req, widgets) {
        await _super(req, widgets);
        await loadListed(widgets, {
          pickField: '_files',
          query: (widget) => {
            const ids = docIds(widget._tags);
            return ids.length
              ? self.apos.file.find(req, { tagsIds: { $in: ids } })
                .areas(false)
                .relationships(false)
                .sort({ titleSortified: 1 })
              : null;
          }
        });
      }
    };
  }
};
