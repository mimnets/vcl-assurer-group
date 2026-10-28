// Main menu behaviour (m1-014), a disclosure pattern rather than an ARIA
// menu: links stay ordinary links in the Tab order.
//
// - Below 1024 px a "Menu" button opens and closes the whole menu.
// - Each parent has its own link and a separate button that opens its
//   submenu (click, tap, Enter or Space). Only one submenu is open at a time.
// - On desktops with a mouse, hovering a parent also shows its submenu (CSS).
// - Escape closes the open submenu (or the mobile menu) and returns focus to
//   the button that opened it; clicking outside closes everything.
// Without JavaScript the buttons stay hidden and every link is visible.

const DESKTOP = '(min-width: 1024px)';

function setExpanded(button, open) {
  button.setAttribute('aria-expanded', open ? 'true' : 'false');
  button.closest('li')?.classList.toggle('is-open', open);
}

function enhance(nav) {
  if (nav.dataset.assurerNavReady) {
    return;
  }
  nav.dataset.assurerNavReady = 'true';
  nav.classList.add('assurer-nav--enhanced');

  const toggle = nav.querySelector('[data-assurer-nav-toggle]');
  const expanders = [ ...nav.querySelectorAll('[data-assurer-submenu-toggle]') ];
  toggle.hidden = false;
  expanders.forEach(button => {
    button.hidden = false;
  });

  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    nav.classList.toggle('is-open', open);
  };
  const closeSubmenus = (except) => {
    expanders.filter(b => b !== except).forEach(b => setExpanded(b, false));
  };

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    setMenu(open);
    if (!open) {
      closeSubmenus();
    }
  });

  expanders.forEach(button => {
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      closeSubmenus(button);
      setExpanded(button, open);
    });
  });

  nav.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') {
      return;
    }
    const openButton = expanders.find(b => b.getAttribute('aria-expanded') === 'true');
    if (openButton) {
      setExpanded(openButton, false);
      openButton.focus();
    } else if (toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      toggle.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target)) {
      closeSubmenus();
      if (!window.matchMedia(DESKTOP).matches) {
        setMenu(false);
      }
    }
  });

  // Keyboard users tabbing out of an open desktop submenu close it.
  nav.addEventListener('focusout', (event) => {
    if (!window.matchMedia(DESKTOP).matches) {
      return;
    }
    const item = event.target.closest('.assurer-nav__item--parent');
    if (item && !item.contains(event.relatedTarget)) {
      const button = item.querySelector('[data-assurer-submenu-toggle]');
      if (button) {
        setExpanded(button, false);
      }
    }
  });

  // Switching between the mobile and desktop layouts starts closed.
  window.matchMedia(DESKTOP).addEventListener('change', () => {
    setMenu(false);
    closeSubmenus();
  });
}

export default () => {
  apos.util.onReady(() => {
    document.querySelectorAll('[data-assurer-nav]').forEach(enhance);
  });
};
