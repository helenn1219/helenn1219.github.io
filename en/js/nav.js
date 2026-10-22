(function () {
  const navToggle  = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!navToggle || !mobileMenu) return;
  const nav = navToggle.closest('nav');

  function focusables() {
    const els = [...(nav ? nav.querySelectorAll('a, button') : []), ...mobileMenu.querySelectorAll('a')];
    return els.filter(el => el.offsetParent !== null || el === navToggle);
  }

  function setBackgroundInert(on) {
    [...document.body.children].forEach(el => {
      if (el === nav || el === mobileMenu || el.tagName === 'SCRIPT') return;
      if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert');
    });
  }

  function openMobileMenu() {
    mobileMenu.classList.add('open');
    document.body.classList.add('menu-open');
    if (nav) nav.classList.remove('hidden');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
    setBackgroundInert(true);
  }

  function closeMobileMenu(returnFocus) {
    if (!mobileMenu.classList.contains('open')) return;
    mobileMenu.classList.remove('open');
    document.body.classList.remove('menu-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
    setBackgroundInert(false);
    if (returnFocus) navToggle.focus();
  }

  navToggle.addEventListener('click', () => {
    if (mobileMenu.classList.contains('open')) closeMobileMenu(false); else openMobileMenu();
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => closeMobileMenu(false)));

  const desktopMQ = window.matchMedia('(min-width: 769px)');
  const onBreakpoint = e => { if (e.matches) closeMobileMenu(false); };
  if (desktopMQ.addEventListener) desktopMQ.addEventListener('change', onBreakpoint);
  else if (desktopMQ.addListener) desktopMQ.addListener(onBreakpoint);

  window.addEventListener('keydown', e => {
    if (!mobileMenu.classList.contains('open')) return;
    if (e.key === 'Escape') { closeMobileMenu(true); return; }
    if (e.key !== 'Tab') return;
    const els = focusables();
    if (!els.length) return;
    const first = els[0], last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
})();
