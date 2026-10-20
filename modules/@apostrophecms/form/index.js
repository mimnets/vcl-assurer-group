// Contact form configuration (@apostrophecms/form, MIT).
export default {
  options: {
    // CSS hook for project styles: `assurer-form__input`, etc.
    classPrefix: 'assurer-form',
    // Submissions are stored in the `aposFormSubmissions` collection.
    saveSubmissions: true,
    // Upstream per-form recipient lists stay off: notifications go only to
    // the operator-configured company mailbox (APOS_FORM_NOTIFY_TO), sent by
    // modules/assurer-forms (m1-012).
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
  },
  // Upstream can email a "confirmation" to whatever address the visitor
  // typed. Once an SMTP transport exists, that would let anyone use the site
  // to send mail to arbitrary people. Remove the option from the form editor
  // and replace the handler of the same name, so it cannot run (m1-012).
  fields: {
    remove: [ 'sendConfirmationEmail', 'emailConfirmationField' ]
  },
  handlers() {
    return {
      submission: {
        async emailConfirmation() {}
      }
    };
  }
};
