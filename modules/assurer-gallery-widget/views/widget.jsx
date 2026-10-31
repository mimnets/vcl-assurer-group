// Gallery markup. Thumbnails are plain links to the full image, so the
// gallery is usable without JavaScript; ../ui/src/index.js turns them into
// a lightbox.

function caption(image, source) {
  if (source === 'title') {
    return image.title || '';
  }
  if (source === 'credit') {
    return image.credit || '';
  }
  return '';
}

export default function ({ widget }, {
  Area, apos, __t
}) {
  const images = (widget._images || [])
    .map(image => ({
      attachment: apos.image.first(image),
      caption: caption(image, widget.captionSource)
    }))
    .filter(image => image.attachment);
  const label = __t('project:galleryLabel');
  return (
    <section className="assurer-section assurer-gallery" id={widget.anchor || undefined}>
      <div className="assurer-section__intro">
        <Area doc={widget} name="intro" />
      </div>
      {images.length > 0 && (
        <ul
          className={`assurer-gallery__grid assurer-gallery__grid--cols-${widget.columns || '4'}`}
          data-assurer-gallery
          data-label={label}
          data-close-label={__t('project:lightboxClose')}
          data-prev-label={__t('project:lightboxPrevious')}
          data-next-label={__t('project:lightboxNext')}
          data-counter-label={__t('project:lightboxCounter', {
            current: '{current}',
            total: '{total}'
          })}
        >
          {images.map(({ attachment, caption: text }) => (
            <li className="assurer-gallery__item">
              <figure className="assurer-gallery__figure">
                <a
                  className="assurer-gallery__link"
                  href={apos.attachment.url(attachment, { size: 'max' })}
                  data-gallery-link
                  data-caption={text || undefined}
                >
                  <img
                    src={apos.attachment.url(attachment, { size: 'one-third' })}
                    alt={attachment._alt || ''}
                    loading="lazy"
                  />
                </a>
                {text && <figcaption className="assurer-gallery__caption">{text}</figcaption>}
              </figure>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
