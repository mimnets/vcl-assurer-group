// Top-level project layout. Extends Apostrophe's outerLayout — a Nunjucks
// template — through the bridge in `jsxRender.js`: each prop below becomes a
// {% block %} override on that template.
//
// Accepts these named props from page templates:
//
//   title  string used as the <title>, overriding the piece/page title
//   main   JSX node providing the page's content
//
// `data` is deliberately not destructured here. Props passed by a page
// template arrive as this template's data, so `data.main` is the `main` prop
// rather than anything belonging to the page document.

// Milestone 0: every page carries this notice so nobody mistakes the proof
// of concept for the production site.
function DemoNotice() {
  return (
    <div className="assurer-demo-notice" role="note">
      Demonstration site — Milestone 0 proof of concept. Content is placeholder only.
    </div>
  );
}

function Header({ user, home }) {
  const links = home?._children || [];
  return (
    <header className="assurer-header">
      <a className="assurer-header__brand" href="/">
        Assurer <span>World</span>
      </a>
      <nav className="assurer-nav" aria-label="Main">
        <ul>
          {links.map(link => (
            <li><a href={link._url}>{link.title}</a></li>
          ))}
        </ul>
      </nav>
      {!user && (
        <a className="assurer-button assurer-button--outline assurer-header__login" href="/login">Log in</a>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="assurer-footer">
      <p>© Assurer World — demonstration content. Built with ApostropheCMS Community Edition.</p>
    </footer>
  );
}

export default function (data, { Extend, apos }) {
  // `data.title` is how a page template overrides the title — the JSX
  // equivalent of Nunjucks `{% block title %}`. Templates without a page or
  // piece in context (notFound.jsx) rely on it.
  const title = data.title ||
    (data.piece && data.piece.title) ||
    (data.page && data.page.title);

  if (!title) {
    apos.util.log('Looks like you forgot to override the title block in a template that does not have access to an Apostrophe page or piece.');
  }

  return (
    <Extend
      templateName={data.outerLayout}
      title={title}
      main={
        <div className="assurer-wrapper">
          <DemoNotice />
          <Header user={data.user} home={data.home} />
          <main className="assurer-main">
            {data.main}
          </main>
          <Footer />
        </div>
      }
    />
  );
}
