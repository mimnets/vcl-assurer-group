// Contact form configuration (@apostrophecms/form, MIT).
export default {
  options: {
    // CSS hook for project styles: `assurer-form__input`, etc.
    classPrefix: 'assurer-form',
    // Submissions are stored in the `aposFormSubmissions` collection.
    saveSubmissions: true,
    // Email delivery needs @apostrophecms/email + an SMTP transport, which is
    // out of scope for Milestone 0. Hide the fields so editors aren't misled.
    emailSubmissions: false,
    // Text fields carry up to 1MB by default; a contact form needs far less.
    uploadLimits: {
      fieldSize: 20 * 1024,
      fields: 30,
      files: 0
    },
    formWidgets: {
      '@apostrophecms/form-text-field': {},
      '@apostrophecms/form-textarea-field': {},
      '@apostrophecms/form-select-field': {},
      '@apostrophecms/form-boolean-field': {},
      '@apostrophecms/rich-text': {
        toolbar: [ 'styles', 'bold', 'italic', 'link', 'bulletList' ]
      }
    }
  }
};
