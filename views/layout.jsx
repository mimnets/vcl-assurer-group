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
import { linkHref } from '../lib/link.js';
import { pageTitle } from '../lib/seo-title.js';

// Milestone 0: every page carries this notice so nobody mistakes the proof
// of concept for the production site.
function DemoNotice() {
  return (
    <div className="assurer-demo-notice" role="note">
      Demonstration site — Milestone 0 proof of concept. Content is placeholder only.
    </div>
  );
}

const SOCIAL_LABELS = {
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  instagram: 'Instagram',
  youtube: 'YouTube',
  x: 'X (Twitter)'
};

// Main menu: the home page's children and grandchildren from the page tree
// (two levels, see modules/@apostrophecms/page/index.js). Pages marked "Hide
// in Navigation" and, for visitors, unpublished pages are already excluded
// by core. A parent keeps its own link; a separate button opens its submenu,
// so the parent stays reachable on touch screens. Behaviour:
// modules/asset/ui/src/nav.js. Without JavaScript the submenus stay visible.
function NavLink({
  item, page, className
}) {
  const current = page && page.aposDocId === item.aposDocId;
  const inBranch = !current && page?.path?.startsWith(`${item.path}/`);
  return (
    <a
      className={`${className}${inBranch ? ' is-current-branch' : ''}`}
      href={item._url}
      aria-current={current ? 'page' : undefined}
    >
      {item.title}
    </a>
  );
}

function Nav({
  home, page, global
}) {
  const items = home?._children || [];
  const ctaHref = global?.showHeaderCta ? linkHref(global) : null;
  if (!items.length && !ctaHref) {
    return null;
  }
  return (
    <nav className="assurer-nav" aria-label="Main" data-assurer-nav>
      <button
        className="assurer-nav__toggle"
        type="button"
        aria-expanded="false"
        aria-controls="assurer-nav-menu"
        data-assurer-nav-toggle
        hidden
      >
        <span className="assurer-nav__toggle-icon" aria-hidden="true" />
        Menu
      </button>
      <ul className="assurer-nav__menu" id="assurer-nav-menu">
        {items.map(item => {
          const children = item._children || [];
          const submenuId = `assurer-submenu-${item.aposDocId}`;
          return (
            <li className={`assurer-nav__item${children.length ? ' assurer-nav__item--parent' : ''}`}>
              <NavLink item={item} page={page} className="assurer-nav__link" />
              {children.length > 0 && (
                <>
                  <button
                    className="assurer-nav__expand"
                    type="button"
                    aria-expanded="false"
                    aria-controls={submenuId}
                    data-assurer-submenu-toggle
                    hidden
                  >
                    <span className="assurer-visually-hidden">{`${item.title} submenu`}</span>
                  </button>
                  <ul className="assurer-nav__submenu" id={submenuId}>
                    {children.map(child => (
                      <li><NavLink item={child} page={page} className="assurer-nav__sublink" /></li>
                    ))}
                  </ul>
                </>
              )}
            </li>
          );
        })}
        {ctaHref && (
          <li className="assurer-nav__item assurer-nav__item--cta">
            <a className="assurer-button assurer-button--primary" href={ctaHref}>{global.linkText}</a>
          </li>
        )}
      </ul>
    </nav>
  );
}

function Header({
  user, home, page, global
}) {
  return (
    <header className="assurer-header">
      <a className="assurer-header__brand" href="/">
        Assurer <span>World</span>
      </a>
      <Nav home={home} page={page} global={global} />
      {!user && (
        <a className="assurer-button assurer-button--outline assurer-header__login" href="/login">Log in</a>
      )}
    </header>
  );
}

// Footer from Global Content. Each part appears only when it has a value,
// so nothing is shown that an editor has not entered and published.
function Footer({ global = {} }) {
  const locations = global._footerLocations || [];
  const social = (global.socialLinks || []).filter(link => link.url);
  const hasContact = global.contactEmail || global.contactPhone || global.contactAddress;
  // Only a published page is joined for visitors (m1-019).
  const privacyPage = global._privacyPage?.[0];
  return (
    <footer className="assurer-footer">
      {global.footerText && <p className="assurer-footer__text">{global.footerText}</p>}
      {hasContact && (
        <address className="assurer-footer__contact">
          {global.contactAddress && <span className="assurer-footer__address">{global.contactAddress}</span>}
          {global.contactPhone && (
            <a href={`tel:${global.contactPhone.replace(/[^+0-9]/g, '')}`}>{global.contactPhone}</a>
          )}
          {global.contactEmail && <a href={`mailto:${global.contactEmail}`}>{global.contactEmail}</a>}
        </address>
      )}
      {locations.length > 0 && (
        <ul className="assurer-footer__locations" aria-label="Locations">
          {locations.map(location => (
            <li>{location.city ? `${location.city}, ${location.country}` : location.title}</li>
          ))}
        </ul>
      )}
      {social.length > 0 && (
        <ul className="assurer-footer__social" aria-label="Social media">
          {social.map(link => (
            <li><a href={link.url} rel="noopener">{SOCIAL_LABELS[link.network] || link.network}</a></li>
          ))}
        </ul>
      )}
      {privacyPage?._url && (
        <p className="assurer-footer__privacy">
          <a href={privacyPage._url}>Privacy notice</a>
        </p>
      )}
      <p className="assurer-footer__legal">
        {global.copyrightName
          ? `© ${new Date().getFullYear()} ${global.copyrightName}`
          : '© Assurer World — demonstration content. Built with ApostropheCMS Community Edition.'}
      </p>
    </footer>
  );
}

export default function (data, { Extend, apos }) {
  // `data.title` is how a page template overrides the title — the JSX
  // equivalent of Nunjucks `{% block title %}`. Templates without a page or
  // piece in context (notFound.jsx) rely on it. lib/seo-title.js adds the SEO
  // title and the Global Content suffix (m1-018).
  const title = pageTitle(data);

  if (!title) {
    apos.util.log('Looks like you forgot to override the title block in a template that does not have access to an Apostrophe page or piece.');
  }

  return (
    <Extend
      templateName={data.outerLayout}
      title={title}
      main={
        <div className="assurer-wrapper">
          <a className="assurer-skip-link" href="#main-content">Skip to content</a>
          <DemoNotice />
          <Header user={data.user} home={data.home} page={data.page} global={data.global} />
          <main className="assurer-main" id="main-content" tabindex="-1">
            {data.main}
          </main>
          <Footer global={data.global} />
        </div>
      }
    />
  );
}
