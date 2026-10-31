// Project override of the @apostrophecms/form widget template (m1-019).
//
// Extends upstream's Nunjucks `widgetBase.html` and replaces only its
// `submitBlock`, inside the <form>. The block adds:
// - the spam guard's fill token and honeypot field (modules/assurer-forms,
//   D-FORM-3). The honeypot is off screen, hidden from assistive technology
//   and out of the tab order; people never see it;
// - the privacy notice line, linked to the page chosen in Global Content.
//   Nothing appears until a privacy page is chosen and published.
// The submit button is the same as upstream's, without the reCAPTCHA
// `disabled` state: reCAPTCHA is not offered (modules/@apostrophecms/form).

const HONEYPOT_FIELD = '_assurerWebsite';
const TOKEN_FIELD = '_assurerFill';

function PrivacyNotice({ global, className }) {
  const page = global?._privacyPage?.[0];
  if (!page?._url) {
    return null;
  }
  return (
    <p className={className}>
      {global.formPrivacyText && `${global.formPrivacyText} `}
      <a href={page._url}>Privacy notice</a>
    </p>
  );
}

export default function ({ widget, global }, {
  Extend, apos, __t
}) {
  const form = widget?._form?.[0];
  // Same as upstream's `prependIfPrefix` helper (a Nunjucks helper only).
  const { classPrefix } = apos.modules['@apostrophecms/form'].options;
  const prefix = suffix => (classPrefix ? `${classPrefix}${suffix}` : '');
  return (
    <Extend
      templateName="widgetBase.html"
      submitBlock={form && (
        <>
          <input
            type="hidden"
            name={TOKEN_FIELD}
            value={apos.modules['assurer-forms'].fillToken()}
            data-assurer-form-fill
          />
          <div className="assurer-form__trap" aria-hidden="true">
            <label>
              Leave this field empty
              <input
                type="text"
                name={HONEYPOT_FIELD}
                tabindex="-1"
                autocomplete="off"
                data-assurer-form-trap
              />
            </label>
          </div>
          <PrivacyNotice global={global} className={prefix('__privacy')} />
          <button type="submit" className={prefix('__submit')} data-apos-form-submit>
            {form.submitLabel || __t('aposForm:widgetSubmit')}
          </button>
        </>
      )}
    />
  );
}
