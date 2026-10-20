// Pure formatting helpers for form notifications and exports (m1-012).
// No I/O, so they can be unit-tested directly (scripts/form-ops.test.mjs).

// Control characters, including CR and LF, plus Unicode line and paragraph
// separators. Removed from anything that ends up in an email header, so no
// value can start a new header line.
// eslint-disable-next-line no-control-regex
const HEADER_UNSAFE = /[\u0000-\u001f\u007f\u2028\u2029]/g;
// The same set without TAB and LF, for multi-line plain-text bodies.
// eslint-disable-next-line no-control-regex
const BODY_UNSAFE = /[\u0000-\u0008\u000b-\u001f\u007f\u2028\u2029]/g;

export function headerText(value, maxLength = 150) {
  const text = String(value ?? '').replace(HEADER_UNSAFE, ' ').replace(/\s+/g, ' ').trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function bodyText(value) {
  if (Array.isArray(value)) {
    return value.map(bodyText).join(', ');
  }
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value).replace(/\r\n?/g, '\n').replace(BODY_UNSAFE, ' ');
}

// Builds the notification as plain text only. There is no HTML part, so no
// submitted value can be interpreted as markup by a mail client.
export function buildNotification({
  submission, formTitle, includeValues, reviewUrl
}) {
  const title = headerText(formTitle || 'Untitled form', 80);
  const data = submission.data || {};
  const names = Object.keys(data).filter(name => !isEmpty(data[name]));
  const lines = [
    `A new submission was received through the website form "${title}".`,
    '',
    `Submission ID: ${submission._id}`,
    `Received (UTC): ${new Date(submission.createdAt).toISOString()}`,
    `Form: ${title}`,
    ''
  ];
  if (includeValues) {
    lines.push('Submitted values:', '');
    for (const name of names) {
      const value = bodyText(data[name]).split('\n').join('\n    ');
      lines.push(`  ${headerText(name, 60)}: ${value}`);
    }
    lines.push('');
  } else {
    lines.push(
      `Fields completed: ${names.map(name => headerText(name, 60)).join(', ') || '(none)'}`,
      '',
      'The submitted content is not included in this email. Read it on the',
      'form submissions page, signed in as an administrator:'
    );
  }
  if (reviewUrl) {
    lines.push(reviewUrl);
  }
  lines.push(
    '',
    'This message was sent automatically. Do not forward it outside the company:',
    'it may concern personal data.'
  );
  return {
    subject: headerText(`New website form submission: ${title}`),
    text: lines.join('\n')
  };
}

function isEmpty(value) {
  return value === null || value === undefined || value === '' ||
    (Array.isArray(value) && value.length === 0);
}

// A spreadsheet treats a cell starting with = + - @ (or a tab or line break
// before them) as a formula. Such cells, and any cell starting with
// whitespace followed by one of them, get a leading apostrophe, so they are
// shown as text and never evaluated (OWASP "CSV injection").
const FORMULA_START = /^(\s*[=+\-@]|[\t\r\n])/;

export function csvCell(value) {
  let text = bodyText(value);
  if (FORMULA_START.test(text)) {
    text = `'${text}`;
  }
  return `"${text.replace(/"/g, '""')}"`;
}

export function csvRow(values) {
  return values.map(csvCell).join(',');
}
