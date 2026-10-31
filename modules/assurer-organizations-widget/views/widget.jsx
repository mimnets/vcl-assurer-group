// Organizations as cards (logo, name, description, website) or a compact
// list (name and website). Website URLs are http(s) only (ADR-0003).
import { isWebUrl } from '../../../lib/web-url.js';
import EmptyHint from '../../../lib/views/EmptyHint.jsx';

function Website({ organization, __t }) {
  if (!isWebUrl(organization.websiteUrl)) {
    return null;
  }
  return (
    <a className="assurer-org__website" href={organization.websiteUrl} rel="noopener">
      {__t('project:website')}
      <span className="assurer-visually-hidden"> {__t('project:websiteOf', { name: organization.title })}</span>
    </a>
  );
}

function Card({
  organization, apos, __t
}) {
  const logo = apos.image.first(organization._logo);
  return (
    <li className="assurer-org">
      {logo && (
        <img
          className="assurer-org__logo"
          src={apos.attachment.url(logo, { size: 'one-sixth' })}
          alt=""
          loading="lazy"
        />
      )}
      <div>
        <h3 className="assurer-org__name">{organization.title}</h3>
        {organization.shortDescription && <p>{organization.shortDescription}</p>}
        <Website organization={organization} __t={__t} />
      </div>
    </li>
  );
}

export default function ({ widget, user }, {
  Area, apos, __t
}) {
  const organizations = widget._listed || [];
  const compact = widget.layout === 'list';
  // Nothing to list: editors get a hint, visitors get no section at all.
  if (!organizations.length && !user) {
    return null;
  }
  return (
    <section className="assurer-section assurer-organizations" id={widget.anchor || undefined}>
      <div className="assurer-section__intro">
        <Area doc={widget} name="intro" />
      </div>
      {organizations.length === 0 && <EmptyHint user={user} text={__t(widget.mode === 'pick' ? 'project:emptyPick' : 'project:emptyListing')} />}
      {organizations.length > 0 && compact && (
        <ul className="assurer-compact-list">
          {organizations.map(organization => (
            <li>
              <span className="assurer-compact-list__name">{organization.title}</span>
              <Website organization={organization} __t={__t} />
            </li>
          ))}
        </ul>
      )}
      {organizations.length > 0 && !compact && (
        <ul className="assurer-org-list">
          {organizations.map(organization => <Card organization={organization} apos={apos} __t={__t} />)}
        </ul>
      )}
    </section>
  );
}
