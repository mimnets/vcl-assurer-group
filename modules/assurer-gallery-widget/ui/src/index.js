// Lightbox for the Assurer gallery (m1-015). Project code, no package.
//
// The thumbnails are ordinary links to the full image. With JavaScript, a
// click opens a modal <dialog> instead: the rest of the page is inert while
// it is open, Tab and Shift+Tab stay inside it, the arrow keys (and Home and
// End) move between images, Escape or the visible close button closes it,
// and focus returns to the thumbnail that opened it.

export default () => {
  apos.util.widgetPlayers['assurer-gallery'] = {
    selector: '[data-assurer-gallery]',
    player(el) {
      const links = [ ...el.querySelectorAll('[data-gallery-link]') ];
      if (!links.length || typeof HTMLDialogElement !== 'function') {
        // Older browsers keep the plain links.
        return;
      }
      const text = (name, fallback) => el.dataset[name] || fallback;
      let current = 0;
      let opener = null;

      const dialog = document.createElement('dialog');
      dialog.className = 'assurer-lightbox';
      dialog.setAttribute('aria-label', text('label', 'Image gallery'));
      dialog.innerHTML = `
        <div class="assurer-lightbox__frame">
          <figure class="assurer-lightbox__figure">
            <img class="assurer-lightbox__image" alt="">
            <figcaption class="assurer-lightbox__caption"></figcaption>
          </figure>
          <p class="assurer-lightbox__counter" aria-live="polite"></p>
          <div class="assurer-lightbox__controls">
            <button type="button" class="assurer-lightbox__prev" data-prev>‹</button>
            <button type="button" class="assurer-lightbox__next" data-next>›</button>
            <button type="button" class="assurer-lightbox__close" data-close>×</button>
          </div>
        </div>`;
      const image = dialog.querySelector('img');
      const captionEl = dialog.querySelector('figcaption');
      const counter = dialog.querySelector('.assurer-lightbox__counter');
      const prev = dialog.querySelector('[data-prev]');
      const next = dialog.querySelector('[data-next]');
      const close = dialog.querySelector('[data-close]');
      prev.setAttribute('aria-label', text('prevLabel', 'Previous image'));
      next.setAttribute('aria-label', text('nextLabel', 'Next image'));
      close.setAttribute('aria-label', text('closeLabel', 'Close'));
      if (links.length < 2) {
        prev.hidden = true;
        next.hidden = true;
      }
      el.after(dialog);

      const show = (index) => {
        current = (index + links.length) % links.length;
        const link = links[current];
        const thumb = link.querySelector('img');
        image.src = link.href;
        image.alt = thumb?.alt || '';
        const caption = link.dataset.caption || '';
        captionEl.textContent = caption;
        captionEl.hidden = !caption;
        counter.textContent = text('counterLabel', '{current} of {total}')
          .replace('{current}', String(current + 1))
          .replace('{total}', String(links.length));
      };

      const open = (index, from) => {
        opener = from;
        show(index);
        dialog.showModal();
        close.focus();
      };

      links.forEach((link, i) => {
        link.addEventListener('click', (e) => {
          // Let modified clicks (new tab, download) behave as links.
          if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
            return;
          }
          e.preventDefault();
          open(i, link);
        });
      });
      prev.addEventListener('click', () => show(current - 1));
      next.addEventListener('click', () => show(current + 1));
      close.addEventListener('click', () => dialog.close());
      // A click on the backdrop (outside the frame) closes too.
      dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
          dialog.close();
        }
      });
      dialog.addEventListener('close', () => {
        image.removeAttribute('src');
        if (opener?.isConnected) {
          opener.focus();
        }
        opener = null;
      });
      dialog.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          show(current - 1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          show(current + 1);
        } else if (e.key === 'Home') {
          e.preventDefault();
          show(0);
        } else if (e.key === 'End') {
          e.preventDefault();
          show(links.length - 1);
        } else if (e.key === 'Tab') {
          // Keep focus on the dialog's own buttons.
          const buttons = [ prev, next, close ].filter(b => !b.hidden);
          const at = buttons.indexOf(document.activeElement);
          const to = e.shiftKey
            ? (at <= 0 ? buttons.length - 1 : at - 1)
            : (at === buttons.length - 1 ? 0 : at + 1);
          e.preventDefault();
          buttons[to].focus();
        }
      });
    }
  };
};
