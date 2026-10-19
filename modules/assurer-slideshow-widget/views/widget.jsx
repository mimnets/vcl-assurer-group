// Slideshow markup. Renders every slide server-side so the content is
// usable without JavaScript; the player in ../ui/src/index.js adds
// navigation and autoplay.

export default function ({ widget }, { apos }) {
  const slides = (widget.slides || [])
    .map(slide => ({
      caption: slide.caption,
      attachment: apos.image.first(slide._image?.[0])
    }))
    .filter(slide => slide.attachment);

  if (!slides.length) {
    return <div className="assurer-slideshow assurer-slideshow--empty">No slides yet.</div>;
  }

  return (
    <section
      className="assurer-slideshow"
      aria-roledescription="carousel"
      aria-label="Image slideshow"
      data-assurer-slideshow
      data-autoplay={widget.autoplay ? 'true' : 'false'}
      data-interval={String((widget.interval || 6) * 1000)}
    >
      <div className="assurer-slideshow__track">
        {slides.map(({ caption, attachment }, i) => (
          <figure
            className={`assurer-slideshow__slide${i === 0 ? ' is-active' : ''}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
            data-slide
          >
            <img
              src={apos.attachment.url(attachment, { size: 'full' })}
              srcset={apos.image.srcset(attachment)}
              sizes="100vw"
              alt={attachment._alt || ''}
              loading={i === 0 ? 'eager' : 'lazy'}
              style={apos.attachment.hasFocalPoint(attachment)
                ? `object-position: ${apos.attachment.focalPointToObjectPosition(attachment)}`
                : undefined}
            />
            {caption && (
              <figcaption className="assurer-slideshow__caption">{caption}</figcaption>
            )}
          </figure>
        ))}
      </div>
      {slides.length > 1 && (
        <div className="assurer-slideshow__controls">
          <button type="button" className="assurer-slideshow__prev" data-prev aria-label="Previous slide">‹</button>
          <div className="assurer-slideshow__dots">
            {slides.map((s, i) => (
              <button
                type="button"
                className={`assurer-slideshow__dot${i === 0 ? ' is-active' : ''}`}
                data-dot={String(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          <button type="button" className="assurer-slideshow__next" data-next aria-label="Next slide">›</button>
        </div>
      )}
    </section>
  );
}
