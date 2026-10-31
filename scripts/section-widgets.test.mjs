// Unit tests for the m1-015 (CA-2) widget helpers: listing modes and limits,
// required alt text, file type and size, the demo widget data and the
// `project:` translation keys.
// Run: npm run test:unit
import assert from 'node:assert/strict';
import {
  readFileSync, readdirSync, statSync
} from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  missingAlt, relatedIds, requireAltText
} from '../lib/alt-text.js';
import { fileSize, fileType } from '../lib/file-meta.js';
import {
  LIMIT_MAX, docIds, listLimit, loadListed, modeField
} from '../lib/listing.js';
import { DEMO } from '../modules/assurer-demo/lib/corporate.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('listLimit clamps to 1..48 and defaults to 12', () => {
  assert.equal(listLimit({ limit: 5 }), 5);
  assert.equal(listLimit({ limit: 0 }), 1);
  assert.equal(listLimit({ limit: 5000 }), LIMIT_MAX);
  assert.equal(listLimit({ limit: 'abc' }), 12);
  assert.equal(listLimit({}), 12);
});

test('modeField defaults to the first choice and is required', () => {
  const field = modeField([ [ 'all', 'All' ], [ 'pick', 'Pick' ] ]);
  assert.equal(field.def, 'all');
  assert.equal(field.required, true);
  assert.deepEqual(field.choices.map(c => c.value), [ 'all', 'pick' ]);
});

test('loadListed: pick mode keeps the picked order, other modes run a limited query', async () => {
  const limits = [];
  const fakeQuery = results => ({
    limit(n) {
      limits.push(n);
      return this;
    },
    toArray: async () => results
  });
  const widgets = [
    {
      mode: 'pick',
      _items: [ { title: 'b' }, { title: 'a' } ]
    },
    {
      mode: 'all',
      limit: 3
    },
    { mode: 'organization' },
    { mode: 'pick' }
  ];
  await loadListed(widgets, {
    pickField: '_items',
    query: widget => (widget.mode === 'all' ? fakeQuery([ { title: 'x' } ]) : null)
  });
  assert.deepEqual(widgets[0]._listed.map(d => d.title), [ 'b', 'a' ]);
  assert.deepEqual(widgets[1]._listed.map(d => d.title), [ 'x' ]);
  assert.deepEqual(limits, [ 3 ]);
  assert.deepEqual(widgets[2]._listed, []);
  assert.deepEqual(widgets[3]._listed, []);
});

test('docIds returns aposDocIds of loaded relationships only', () => {
  assert.deepEqual(docIds([ { aposDocId: 'a' }, {}, { aposDocId: 'b' } ]), [ 'a', 'b' ]);
  assert.deepEqual(docIds(undefined), []);
});

test('missingAlt reports images with empty or blank alt text', () => {
  assert.deepEqual(missingAlt([
    {
      title: 'ok',
      alt: 'A description'
    },
    {
      title: 'blank',
      alt: '   '
    },
    { title: 'none' },
    { _id: 'id-only' }
  ]), [ 'blank', 'none', 'id-only' ]);
  assert.deepEqual(relatedIds([ { _id: 'a' }, null, { _id: 'b' } ]), [ 'a', 'b' ]);
});

// A stand-in for the widget module: `self.apos.image.find` answers from a
// fixed list, and `self.apos.error` builds a recognisable error.
function fakeSelf(images) {
  const query = (criteria) => {
    const ids = criteria._id.$in;
    const chain = {
      relationships: () => chain,
      areas: () => chain,
      project: () => chain,
      toArray: async () => images.filter(image => ids.includes(image._id))
    };
    return chain;
  };
  return {
    apos: {
      image: { find: (req, criteria) => query(criteria) },
      error: (name, message) => Object.assign(new Error(message), { name })
    }
  };
}
const req = { t: (key, vars) => `${key} ${vars.titles}` };

test('requireAltText refuses a widget whose images lack alt text', async () => {
  const self = fakeSelf([
    {
      _id: 'i1',
      title: 'Has alt',
      alt: 'Text'
    },
    {
      _id: 'i2',
      title: 'No alt'
    }
  ]);
  const sanitize = requireAltText(self, '_images', widget => widget._images || []);
  const _super = async (r, input) => ({ ...input });
  await assert.rejects(
    sanitize(_super, req, { _images: [ { _id: 'i1' }, { _id: 'i2' } ] }, {}),
    errors => Array.isArray(errors) && errors[0].name === 'invalid' && errors[0].path === '_images' &&
      errors[0].message.includes('No alt') && !errors[0].message.includes('Has alt')
  );
  const ok = await sanitize(_super, req, { _images: [ { _id: 'i1' } ] }, {});
  assert.deepEqual(ok._images, [ { _id: 'i1' } ]);
  assert.deepEqual(await sanitize(_super, req, {}, {}), {});
  // Internal conversions without relationship loading are left alone.
  const skipped = await sanitize(_super, req, { _images: [ { _id: 'i2' } ] }, {}, { fetchRelationships: false });
  assert.deepEqual(skipped._images, [ { _id: 'i2' } ]);
});

test('fileType and fileSize describe the attachment', () => {
  assert.equal(fileType({ extension: 'pdf' }), 'PDF');
  assert.equal(fileType({ extension: 'do<c>x' }), 'DOCX');
  assert.equal(fileType({}), '');
  assert.equal(fileSize(754), '754 B');
  assert.equal(fileSize(1536), '1.5 KB');
  assert.equal(fileSize(20 * 1024), '20 KB');
  assert.equal(fileSize(1.25 * 1024 * 1024), '1.3 MB');
  assert.equal(fileSize(3 * 1024 ** 3), '3 GB');
  assert.equal(fileSize(undefined), '');
  assert.equal(fileSize(-1), '');
});

test('demo widget data is fictional and labelled as demo', () => {
  const {
    widgetsPage, files, fileTag
  } = DEMO;
  assert.match(widgetsPage.title, /Demo/);
  assert.match(fileTag, /Demo/);
  for (const [ title, text ] of widgetsPage.features) {
    assert.match(`${title} ${text}`, /demo/i, title);
  }
  for (const [ value, label, note ] of widgetsPage.stats) {
    assert.match(label, /Demo/, value);
    assert.match(note, /not a real statistic/, value);
  }
  for (const file of files) {
    assert.match(file.title, /fictional/);
    assert.ok(statSync(path.join(root, 'demo-content/files', file.file)).size < 10 * 1024, file.file);
  }
});

test('every project: translation key used in code exists in en.json', () => {
  const phrases = JSON.parse(readFileSync(
    path.join(root, 'modules/@apostrophecms/i18n/i18n/project/en.json'),
    'utf8'
  ));
  const used = new Set();
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = path.join(dir, name);
      if (statSync(full).isDirectory()) {
        walk(full);
      } else if (/\.(js|jsx)$/.test(name)) {
        for (const [ , key ] of readFileSync(full, 'utf8').matchAll(/['"]project:([A-Za-z0-9]+)['"]/g)) {
          used.add(key);
        }
      }
    }
  };
  walk(path.join(root, 'lib'));
  walk(path.join(root, 'modules'));
  assert.ok(used.size > 20);
  const missing = [ ...used ].filter(key => !(key in phrases));
  assert.deepEqual(missing, []);
});
