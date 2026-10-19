// Hero banner. `widget` holds the fields defined in ../index.js.
import { linkHref } from '../../../lib/link.js';

export default function ({ widget }, { Area, apos }) {
  const image = widget._backgroundImage?.[0];
  const attachment = image && apos.image.first(image);
  const style = attachment
    ? `background-image: url("${apos.attachment.url(attachment, { size: 'max' })}");` +
      (apos.attachment.hasFocalPoint(attachment)
        ? ` background-position: ${apos.attachment.focalPointToObjectPosition(attachment)};`
        : '')
    : '';
  const buttons = (widget.buttons || [])
    .map(item => ({
      ...item,
      href: linkHref(item)
    }))
    .filter(item => item.href);

  return (
    <section
      className={`assurer-hero assurer-hero--overlay-${widget.overlay || 'dark'}${attachment ? ' assurer-hero--has-image' : ''}`}
      style={style}
      aria-label={attachment?._alt || 'Hero'}
    >
      <div className="assurer-hero__inner">
        {widget.eyebrow && (
          <p className="assurer-hero__eyebrow">{widget.eyebrow}</p>
        )}
        <div className="assurer-hero__content">
          <Area doc={widget} name="content" />
        </div>
        {buttons.length > 0 && (
          <div className="assurer-hero__buttons">
            {buttons.map(item => (
              <a
                className={`assurer-button assurer-button--${item.style || 'primary'}`}
                href={item.href}
              >
                {item.linkText}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
