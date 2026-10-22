(function () {
  const links = [...document.querySelectorAll('a[data-preview]')];
  if (!links.length) return;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const GAP = 24, EDGE = 16;

  const box = document.createElement('div');
  box.className = 'lp'; box.setAttribute('aria-hidden', 'true');
  box.innerHTML = '<div class="lp-card"><img alt="" decoding="async"></div>';
  document.body.appendChild(box);
  const img = box.querySelector('img');

  let on = false, raf = 0, tx = 0, ty = 0, x = 0, y = 0;

  function target(cx, cy) {
    const w = box.offsetWidth, h = box.offsetHeight, vw = window.innerWidth, vh = window.innerHeight;
    let left = cx + GAP, right = true;
    if (left + w > vw - EDGE) { left = cx - GAP - w; right = false; }
    tx = Math.max(EDGE, left);
    ty = Math.min(Math.max(EDGE, cy - h / 2), vh - h - EDGE);
    box.style.setProperty('--ox', right ? '0%' : '100%');
  }
  const place = () => { box.style.transform = `translate3d(${x}px,${y}px,0)`; };
  function loop() {
    x += (tx - x) * .22; y += (ty - y) * .22; place();
    raf = (Math.abs(tx - x) > .3 || Math.abs(ty - y) > .3) ? requestAnimationFrame(loop) : 0;
  }
  function show(a, cx, cy) {
    if (img.getAttribute('src') !== a.dataset.preview) img.src = a.dataset.preview;
    target(cx, cy);
    if (!on) { x = tx; y = ty; place(); }
    on = true; box.classList.add('is-on');
  }
  function move(cx, cy) {
    if (!on) return;
    target(cx, cy);
    if (reduce.matches) { x = tx; y = ty; place(); }
    else if (!raf) raf = requestAnimationFrame(loop);
  }
  function hide() { on = false; box.classList.remove('is-on'); cancelAnimationFrame(raf); raf = 0; }

  links.forEach(a => {
    a.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && fine.matches) show(a, e.clientX, e.clientY); });
    a.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') move(e.clientX, e.clientY); });
    a.addEventListener('pointerleave', hide);

    a.addEventListener('focus', () => {
      if (!fine.matches || !a.matches(':focus-visible')) return;
      const r = a.getBoundingClientRect(); show(a, r.right, r.top + r.height / 2);
    });
    a.addEventListener('blur', hide);
  });

  window.addEventListener('scroll', () => { if (on) hide(); }, { passive: true });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && on) hide(); });
})();
