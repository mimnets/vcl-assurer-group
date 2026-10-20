import 'dotenv/config';
import apostrophe from 'apostrophe';

apostrophe({
  root: import.meta,
  // Used as the default database name and for session cookie naming.
  // The actual database is selected by APOS_DB_URI (see .env.example).
  shortName: 'vcl-assurer-group',
  modules: {
    // Apostrophe module configuration
    // *******************************
    //
    // NOTE: most configuration occurs in the respective modules' directories.
    // See modules/@apostrophecms/page/index.js for an example.
    //
    // Any modules that are not present by default in Apostrophe must at least
    // have a minimal configuration here to turn them on: `moduleName: {}`
    // ***********************************************************************
    // `className` options set custom CSS classes for Apostrophe core widgets.
    // NOTE: Changing this className will break global style selectors
    // configured in modules/@apostrophecms/styles/index.js
    '@apostrophecms/rich-text-widget': {
      options: {
        className: 'bp-rich-text'
      }
    },
    '@apostrophecms/image-widget': {
      options: {
        className: 'bp-image-widget'
      }
    },
    '@apostrophecms/video-widget': {
      options: {
        className: 'bp-video-widget'
      }
    },
    // `asset` supports the project's build for client-side assets.
    asset: {},
    // use vite for asset bundling and hot module reloading
    '@apostrophecms/vite': {},
    'default-page': {},
    'nested-layout-widget': {},
    'nested-column-widget': {},

    // Contact forms: @apostrophecms/form (MIT, Community Edition).
    // `@apostrophecms/form` must be registered before its widgets.
    // The file-upload field is deliberately NOT enabled (anonymous uploads).
    '@apostrophecms/form': {},
    '@apostrophecms/form-widget': {},
    '@apostrophecms/form-text-field-widget': {},
    '@apostrophecms/form-textarea-field-widget': {},
    '@apostrophecms/form-select-field-widget': {},
    '@apostrophecms/form-boolean-field-widget': {},

    // Assurer project modules. All project-specific modules use the
    // `assurer-` prefix so they are distinguishable from core and starter
    // modules at a glance.
    'assurer-hero-widget': {},
    'assurer-slideshow-widget': {},
    'assurer-product-grid-widget': {},
    'assurer-product-card-widget': {},
    'assurer-demo': {},
    // Test-only tasks (CI admin bootstrap); refuse to run outside a
    // temporary SQLite database.
    'assurer-test': {}
  }
});
