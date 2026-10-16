(function () {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  root.classList.add('has-cursor');
  const css = document.createElement('style');
  css.textContent = `
  .cur{position:fixed;left:0;top:0;z-index:10000;pointer-events:none;will-change:transform;}
  .cur-bead{width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;opacity:.85;transition:width .3s,height .3s,margin .3s,opacity .3s,background-color .3s;}
  .cur-bead.is-link{width:34px;height:34px;margin:-17px 0 0 -17px;}
  html.on-dark-cursor .cur-bead.is-gray{background:rgba(213,210,202,.6) !important;}`;
  document.head.appendChild(css);
  const COLORS = ['rgba(220,233,135,.95)', 'rgba(185,201,74,.85)', 'rgba(220,233,135,.75)', 'rgba(142,139,132,.7)', 'rgba(142,139,132,.5)'];
  const LAG = [.55, .32, .22, .16, .12];
  const beads = COLORS.map((c, i) => {
    const el = document.createElement('div');
    el.className = 'cur cur-bead' + (i >= 3 ? ' is-gray' : ''); el.setAttribute('aria-hidden', 'true');
    el.style.background = c; el.style.zIndex = 10000 - i; el.style.opacity = '0';
    document.body.appendChild(el);
    return { el, x: 0, y: 0, k: reduce ? 1 : LAG[i] };
  });
  const LINK = 'a, button, [role="button"], .hero-tag, .strip, summary, label, video';
  const m = { x: 0, y: 0, seen: false };
  let target = null;
  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    m.x = e.clientX; m.y = e.clientY;
    if (!m.seen) { m.seen = true; beads.forEach(b => { b.x = m.x; b.y = m.y; b.el.style.opacity = ''; }); }
    const hit = e.target instanceof Element ? e.target.closest(LINK) : null;
    if (hit !== target) { target = hit; beads.forEach((b, i) => { b.el.classList.toggle('is-link', !!hit && i === 0); b.el.style.opacity = hit && i ? '0' : ''; }); }
    root.classList.toggle('on-dark-cursor', !!(e.target instanceof Element && e.target.closest('.ft')));
  }, { passive: true });
  document.addEventListener('pointerleave', () => beads.forEach(b => { b.el.style.opacity = '0'; }));
  document.addEventListener('pointerenter', () => { if (m.seen) beads.forEach((b, i) => { b.el.style.opacity = target && i ? '0' : ''; }); });
  let last = performance.now();
  (function loop(t) {
    const dt = Math.min(.05, (t - last) / 1000) || .016; last = t;
    beads.forEach((b, i) => {
      const tx = i ? beads[i - 1].x : m.x, ty = i ? beads[i - 1].y : m.y;
      const k = 1 - Math.pow(1 - b.k, dt * 60);
      b.x += (tx - b.x) * k; b.y += (ty - b.y) * k;
      b.el.style.transform = `translate3d(${b.x}px,${b.y}px,0)`;
    });
    requestAnimationFrame(loop);
  })(last);
})();
