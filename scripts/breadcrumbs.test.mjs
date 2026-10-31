// Unit tests for the breadcrumb trail (m1-020, CA-4).
// Run: npm run test:unit
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { breadcrumbItems } from '../lib/breadcrumbs.js';

const home = {
  title: 'Home',
  _url: '/'
};

test('breadcrumbs: none on the home page, without a page, or on a piece', () => {
  assert.deepEqual(breadcrumbItems({
    page: {
      ...home,
      _ancestors: []
    }
  }), []);
  assert.deepEqual(breadcrumbItems({}), []);
  assert.deepEqual(breadcrumbItems({
    page: {
      title: 'Products',
      _url: '/products',
      _ancestors: [ home ]
    },
    piece: { title: 'A product' }
  }), []);
});

test('breadcrumbs: ancestors in order, then the current page', () => {
  assert.deepEqual(breadcrumbItems({
    page: {
      title: 'Knitted bottoms',
      _url: '/products/knitted-bottoms',
      _ancestors: [ home, {
        title: 'Products',
        _url: '/products'
      } ]
    }
  }), [
    {
      title: 'Home',
      url: '/'
    },
    {
      title: 'Products',
      url: '/products'
    },
    {
      title: 'Knitted bottoms',
      url: '/products/knitted-bottoms',
      current: true
    }
  ]);
});

test('breadcrumbs: ancestors without a URL or title are skipped', () => {
  assert.deepEqual(breadcrumbItems({
    page: {
      title: 'About',
      _url: '/about',
      _ancestors: [ { title: 'No URL' }, { _url: '/x' } ]
    }
  }), []);
});
