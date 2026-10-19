(function () {

  const nav = document.getElementById('mainNav');
  if (!nav) return;
  let ticking = false;
  const rgb = s => (s.match(/[\d.]+/g) || []).map(Number);
  const lin = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); };
  const lum = c => .2126 * lin(c[0]) + .7152 * lin(c[1]) + .0722 * lin(c[2]);
  const COVER = [20, 21, 19];
  function navState() {
    ticking = false;
    nav.classList.toggle('is-scrolled', window.scrollY > 8);
    const h = nav.offsetHeight, x = Math.round(window.innerWidth / 2);

    const stack = document.elementsFromPoint(x, Math.max(1, Math.round(h * .75)));
    const under = stack.find(el => !nav.contains(el) && !el.closest('#mobileMenu'));
    const hero = under && under.closest('.hero');
    nav.classList.toggle('in-hero', !!hero);
    const scrolled = window.scrollY > 8;
    nav.classList.toggle('is-glass', scrolled);
    if (hero) {

      const dark = hero.dataset.navTone !== 'light';
      nav.style.backgroundColor = !scrolled ? 'transparent' : dark ? 'rgba(32,33,31,.45)' : 'rgba(246,244,239,.6)';
      nav.classList.toggle('on-dark', dark);
      return;
    }

    let el = under && under.closest('.pj-stage, .more, .about, .ft, main') || under, bg = null;
    while (el && el !== document.documentElement) {
      const c = getComputedStyle(el).backgroundColor, v = rgb(c);
      if (v.length >= 3 && (v.length < 4 || v[3] > .9)) { bg = v.slice(0, 3); break; }
      el = el.parentElement;
    }
    if (!bg) bg = rgb(getComputedStyle(document.body).backgroundColor).slice(0, 3);

    const stage = under && under.closest('.pj-stage');
    const cv = stage ? (parseFloat(stage.style.getPropertyValue('--cv')) || 0) * .05 : 0;
    if (cv) bg = bg.map((v, i) => Math.round(v * (1 - cv) + COVER[i] * cv));

    nav.style.backgroundColor = `rgba(${bg.join(',')},.88)`;
    nav.classList.toggle('on-dark', lum(bg) < .3);
  }
  const schedule = () => { if (!ticking) { ticking = true; requestAnimationFrame(navState); } };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('navtone', schedule);
  window.addEventListener('v3render', navState);
  window.addEventListener('load', schedule);
  navState();
})();

(function () {
  const data = [
    { src: 'img/taitra-intensive.jpg', caption: '國際企業特訓班（第46期）' },
    { src: 'img/taitra-inservice.jpg', caption: '國際企業在職班（第35期）' },
    { src: 'img/taitra-southbound.jpg', caption: '109年新南向人才儲備專班' }
  ];
  const lb = document.getElementById('taitraLightbox');
  if (!lb) return;
  const stage = document.getElementById('taitraLightboxStage');
  const cap = document.getElementById('taitraLightboxCaption');
  const closeBtn = document.getElementById('taitraLightboxClose');
  const count = document.getElementById('taitraLightboxCount');
  let idx = 0, last = null;
  const render = () => { stage.innerHTML = `<img src="${data[idx].src}" alt="外貿協會課程網站截圖：${data[idx].caption}">`; count.textContent = `${idx + 1}／${data.length}`; cap.textContent = data[idx].caption; };
  const inertBg = on => [...document.body.children].forEach(el => { if (el === lb || el.tagName === 'SCRIPT') return; on ? el.setAttribute('inert', '') : el.removeAttribute('inert'); });
  const open = i => { last = document.activeElement; idx = i; render(); lb.hidden = false; requestAnimationFrame(() => lb.classList.add('open')); document.body.style.overflow = 'hidden'; inertBg(true); closeBtn.focus(); };
  const close = () => { lb.classList.remove('open'); document.body.style.overflow = ''; inertBg(false); lb.hidden = true; stage.innerHTML = ''; if (last) last.focus(); };
  const step = d => { idx = (idx + d + data.length) % data.length; render(); };
  document.querySelectorAll('.taitra-view-btn').forEach(b => b.addEventListener('click', () => open(Number(b.dataset.taitra))));
  closeBtn.addEventListener('click', close);
  document.getElementById('taitraLightboxPrev').addEventListener('click', () => step(-1));
  document.getElementById('taitraLightboxNext').addEventListener('click', () => step(1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  window.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'Tab') {
      const f = [...lb.querySelectorAll('button')]; const first = f[0], lastB = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastB.focus(); }
      else if (!e.shiftKey && document.activeElement === lastB) { e.preventDefault(); first.focus(); }
    }
  });
})();

(function () {
  const trigger = document.getElementById('ybsOpen');
  const dlg = document.getElementById('ybsDialog');
  if (!trigger || !dlg) return;
  const frame = document.getElementById('ybsFrame');
  const closeBtn = document.getElementById('ybsClose');
  const info = dlg.querySelector('.ybs-info');
  const root = document.documentElement;
  const W = 399, H = 744, MIN_SCALE = .6;
  let scrollY = 0, last = null;

  function layout() {
    const cs = getComputedStyle(dlg);
    const padX = parseFloat(cs.paddingLeft) || 0, padY = 32;

    const side = window.innerWidth >= 960, infoW = side ? 340 : 0, gap = side ? 56 : 0;
    const avH = window.innerHeight - (side ? padY * 2 : 60 + 24 + padY);
    const s = Math.min(1, avH / H, (window.innerWidth - padX * 2 - infoW - gap) / W);
    const compact = window.innerWidth < 600 || s < MIN_SCALE;
    dlg.classList.toggle('is-narrow', !side);
    dlg.classList.toggle('is-compact', compact);
    if (compact) dlg.style.removeProperty('--ys'); else dlg.style.setProperty('--ys', s.toFixed(4));
  }
  const inertBg = on => [...document.body.children].forEach(el => {
    if (el === dlg || el.tagName === 'SCRIPT') return;
    on ? el.setAttribute('inert', '') : el.removeAttribute('inert');
  });

  const focusables = () => [...(dlg.classList.contains('is-compact') ? [] : [...info.querySelectorAll('a[href]')]), frame, closeBtn];

  frame.addEventListener('load', () => {
    try { frame.contentWindow.document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); }); } catch (err) {}
  });

  function open() {
    last = document.activeElement;
    scrollY = window.scrollY;
    if (!frame.getAttribute('src')) frame.setAttribute('src', frame.dataset.src);
    root.style.setProperty('--ybs-sbw', (window.innerWidth - root.clientWidth) + 'px');
    root.classList.add('ybs-lock');
    dlg.hidden = false;
    layout();
    requestAnimationFrame(() => dlg.classList.add('open'));
    inertBg(true);
    closeBtn.focus();
  }
  function close() {
    if (dlg.hidden) return;
    dlg.classList.remove('open');
    dlg.hidden = true;
    inertBg(false);
    root.classList.remove('ybs-lock');
    window.scrollTo(0, scrollY);
    if (last) last.focus({ preventScroll: true });
  }

  trigger.addEventListener('click', e => {
    e.preventDefault();
    open();
  });
  closeBtn.addEventListener('click', close);
  window.addEventListener('resize', () => { if (!dlg.hidden) layout(); });
  window.addEventListener('keydown', e => {
    if (dlg.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'Tab') {
      const f = focusables(), first = f[0], lastF = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastF.focus(); }
      else if (!e.shiftKey && document.activeElement === lastF) { e.preventDefault(); first.focus(); }
    }
  });
})();

// About 人像：滑鼠移動時人像與紙片往相反方向微幅位移（只在有滑鼠、未開啟減少動態時）
(function () {
  const p = document.querySelector('.ab-portrait');
  if (!p || !matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const set = (x, y) => {
    p.style.setProperty('--x', x * 10 + 'px'); p.style.setProperty('--y', y * 8 + 'px');
    p.style.setProperty('--bx', -x * 16 + 'px'); p.style.setProperty('--by', -y * 12 + 'px');
  };
  p.addEventListener('pointermove', e => { const r = p.getBoundingClientRect(); set((e.clientX - r.left) / r.width - .5, (e.clientY - r.top) / r.height - .5); });
  p.addEventListener('pointerleave', () => set(0, 0));
})();
