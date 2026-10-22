(function () {
  const btn = document.querySelector('.ft-copy');
  if (!btn) return;

  const legacy = t => {
    const ta = document.createElement('textarea');
    ta.value = t; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px;';
    document.body.appendChild(ta); ta.focus(); ta.select(); ta.setSelectionRange(0, t.length);
    let ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
    ta.remove(); return ok;
  };
  btn.addEventListener('click', async () => {
    const t = btn.dataset.copy, old = btn.textContent;
    let ok = false;
    if (navigator.clipboard && window.isSecureContext) { try { await navigator.clipboard.writeText(t); ok = true; } catch (e) {} }
    if (!ok) ok = legacy(t);
    btn.textContent = ok ? 'Copied' : 'Press and hold the email to copy';
    setTimeout(() => { btn.textContent = old; }, 1600);
  });
})();

(function () {
  const nav = document.getElementById('mainNav'), ft = document.querySelector('.ft');
  if (!nav || !ft || nav.classList.contains('hn')) return;
  let ticking = false;
  const update = () => { ticking = false; nav.classList.toggle('ft-under', ft.getBoundingClientRect().top <= nav.offsetHeight * .75); nav.classList.toggle('nav-top', scrollY <= 8); };
  const schedule = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  update();
})();

(function () {
  const ft = document.querySelector('.ft');
  if (!ft || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const NS = 'http://www.w3.org/2000/svg', H = 90;
  const svg = document.createElementNS(NS, 'svg'), path = document.createElementNS(NS, 'path');
  svg.setAttribute('class', 'ft-bounce'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
  svg.setAttribute('preserveAspectRatio', 'none'); svg.setAttribute('viewBox', `0 0 1000 ${H * 2}`);
  svg.appendChild(path); ft.prepend(svg);

  const opaque = el => { while (el && el !== document.documentElement) { const c = getComputedStyle(el).backgroundColor, v = c.match(/[\d.]+/g) || []; if (v.length >= 3 && (v.length < 4 || +v[3] > .9)) return c; el = el.parentElement; } return getComputedStyle(document.body).backgroundColor; };
  const dark = getComputedStyle(ft).backgroundColor;
  let above = null;
  const draw = b => {
    path.setAttribute('d', `M0 ${H} Q500 ${(H - 2 * b).toFixed(2)} 1000 ${H} Z`);
    path.setAttribute('fill', b >= 0 ? dark : (above || (above = opaque(ft.previousElementSibling))));
  };
  let x = 0, v = 0, target = 0, lastY = scrollY, lastT = performance.now(), raf = 0, near = false;
  function tick(now) {
    raf = 0;
    const dt = Math.min(.05, (now - lastT) / 1000) || .016; lastT = now;
    const y = scrollY, vel = (y - lastY) / dt; lastY = y;
    target += ((Math.max(-H * .9, Math.min(H * .9, vel * .02))) - target) * Math.min(1, dt * 12);
    v += (180 * (target - x) - 9 * v) * dt;
    x += v * dt;
    draw(x);
    if (near || Math.abs(x) > .2 || Math.abs(v) > .2) raf = requestAnimationFrame(tick);
    else { x = v = target = 0; draw(0); }
  }
  const wake = () => { if (!raf) { lastT = performance.now(); lastY = scrollY; raf = requestAnimationFrame(tick); } };
  new IntersectionObserver(es => { near = es[0].isIntersecting; if (near) wake(); }, { rootMargin: '0px 0px 20% 0px' }).observe(ft);
  addEventListener('scroll', () => { if (near) wake(); }, { passive: true });
  draw(0);
})();

(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href*="#"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
    const id = decodeURIComponent(url.hash.slice(1));
    const target = id === 'top' ? document.body : document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const y = id === 'top' ? 0 : target.getBoundingClientRect().top + scrollY;

    requestAnimationFrame(() => {
      // scrollIntoView honors each section's scroll-margin-top, so headings are not hidden under the nav
      if (target === document.body) window.scrollTo({ top: y, behavior: 'smooth' });
      else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', url.hash);
      if (target !== document.body) target.focus({ preventScroll: true });
    });
  });
})();

(function () {
  if (!document.body.classList.contains('v4') || matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const SEL = '.case-section .case-head, .case-section > p, .case-section .case-figure, .case-section figure, .case-section .v4-q, .case-section ul:not([class*="toc"]), .case-section .gm-frame, .v4-show';
  const els = [...document.querySelectorAll(SEL)].filter((el, i, a) => !a.some(o => o !== el && o.contains(el)) && el.getBoundingClientRect().top > innerHeight * .92);
  els.forEach(el => el.classList.add('rv'));
  const io = new IntersectionObserver(es => {
    let n = 0;
    es.forEach(e => { if (!e.isIntersecting) return; const el = e.target; el.style.transitionDelay = (n++ * 70) + 'ms'; el.classList.add('rv-in'); io.unobserve(el); });
  }, { rootMargin: '0px 0px -8% 0px' });
  els.forEach(el => io.observe(el));

  let tk = false;
  addEventListener('scroll', () => { if (tk) return; tk = true; requestAnimationFrame(() => {
    tk = false;
    document.querySelectorAll('.rv:not(.rv-in)').forEach(el => { if (el.getBoundingClientRect().top < innerHeight) { el.classList.add('rv-in'); io.unobserve(el); } });
  }); }, { passive: true });
})();
