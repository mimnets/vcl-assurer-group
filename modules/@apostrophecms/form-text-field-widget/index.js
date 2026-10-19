// Project-level extension of @apostrophecms/form's text field.
//
// Upstream only enforces `required` on the server; the `email` input type is
// checked by the browser alone, so a scripted submission can store any
// string. Reject malformed addresses server-side as well. The error is
// reported against the field, the same way upstream reports `required`.

// Deliberately simple: one "@", no whitespace, a dot in the domain part.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default {
  extendMethods(self) {
    return {
      sanitizeFormField(_super, widget, input, output) {
        _super(widget, input, output);
        const value = output[widget.fieldName];
        if (widget.inputType === 'email' && value) {
          if (value.length > 254 || !EMAIL.test(value)) {
            throw self.apos.error('invalid', {
              fieldError: {
                field: widget.fieldName,
                error: 'invalid',
                message: 'Please enter a valid email address.'
              }
            });
          }
        }
      }
    };
  }
};
