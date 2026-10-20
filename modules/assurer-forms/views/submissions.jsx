// Administrator-only list of contact-form submissions (m1-012). Rendered by
// the assurer-forms route as a standalone document, outside the public site
// layout. JSX escapes every value, so submitted text is shown, never run.

const STYLE = `
  body { font: 15px/1.5 system-ui, sans-serif; margin: 0; padding: 16px; color: #1d2433; background: #fff; }
  main { max-width: 1100px; margin: 0 auto; }
  h1 { font-size: 1.4rem; margin: 0 0 4px; }
  .note { color: #5b6475; margin: 0 0 16px; }
  form.filter { display: flex; flex-wrap: wrap; gap: 8px; align-items: end; margin: 0 0 16px; }
  label { display: grid; gap: 2px; font-size: .85rem; }
  select, input, button, .button { font: inherit; padding: 6px 10px; }
  .button { display: inline-block; border: 1px solid #1d2433; color: #1d2433; text-decoration: none; }
  article { border: 1px solid #d5d9e0; border-radius: 6px; padding: 12px; margin: 0 0 12px; overflow-wrap: anywhere; }
  article header { display: flex; flex-wrap: wrap; gap: 4px 16px; font-size: .85rem; color: #5b6475; margin-bottom: 8px; }
  dl { display: grid; grid-template-columns: minmax(90px, 180px) 1fr; gap: 4px 12px; margin: 0; }
  dt { font-weight: 600; }
  dd { margin: 0; white-space: pre-wrap; }
  .status-failed { color: #a4161a; font-weight: 600; }
  nav.pages { display: flex; gap: 12px; align-items: center; }
  @media (max-width: 600px) { dl { grid-template-columns: 1fr; } dd { margin-bottom: 6px; } }
`;

function value(item) {
  if (Array.isArray(item)) {
    return item.join(', ');
  }
  if (item === true) {
    return 'yes';
  }
  if (item === false) {
    return 'no';
  }
  return item === null || item === undefined ? '' : String(item);
}

function pageLink(pageUrl, formId, page) {
  const query = new URLSearchParams({
    ...formId && { form: formId },
    page: String(page)
  });
  return `${pageUrl}?${query}`;
}

export default function ({
  forms, formId, titles, submissions, page, pages, total, pageUrl, exportUrl, notificationsEnabled
}) {
  const exportHref = formId ? `${exportUrl}?form=${encodeURIComponent(formId)}` : exportUrl;
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
        <title>Form submissions</title>
        <style>{STYLE}</style>
      </head>
      <body>
        <main>
          <h1>Form submissions</h1>
          <p className="note">
            Administrators only. Contains personal data: do not copy it outside approved systems.
            {notificationsEnabled ? '' : ' Email notifications are not configured.'}
          </p>
          <form className="filter" method="get" action={pageUrl}>
            <label>
              Form
              <select name="form">
                <option value="">All forms</option>
                {forms.map(form => (
                  <option value={form._id} selected={form._id === formId}>
                    {`${form.title} (${form.count})`}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit">Show</button>
            <a className="button" href={exportHref}>Download CSV</a>
            <a className="button" href="/">Back to site</a>
          </form>
          <p>{`${total} submission${total === 1 ? '' : 's'}. Page ${page} of ${pages}, newest first.`}</p>
          {submissions.map(item => (
            <article>
              <header>
                <span>{`Received ${item.receivedAt.replace('T', ' ').replace(/\.\d+Z$/, ' UTC')}`}</span>
                <span>{`Form: ${titles[item.formId] || item.formId}`}</span>
                <span className={item.notificationStatus === 'failed' ? 'status-failed' : ''}>
                  {`Notification: ${item.notificationStatus}${item.notificationError ? ` (${item.notificationError})` : ''}`}
                </span>
                <span>{`ID ${item._id}`}</span>
              </header>
              <dl>
                {Object.keys(item.data).map(name => (
                  <>
                    <dt>{name}</dt>
                    <dd>{value(item.data[name])}</dd>
                  </>
                ))}
              </dl>
            </article>
          ))}
          <nav className="pages" aria-label="Pages">
            {page > 1 ? <a href={pageLink(pageUrl, formId, page - 1)}>Previous</a> : null}
            {page < pages ? <a href={pageLink(pageUrl, formId, page + 1)}>Next</a> : null}
          </nav>
        </main>
      </body>
    </html>
  );
}
