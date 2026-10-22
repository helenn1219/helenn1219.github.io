(function () {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const wide = window.matchMedia('(min-width: 1024px) and (min-height: 600px)');
  const clamp = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

  const hero = document.querySelector('.hero');
  const heroStage = hero.querySelector('.hero-stage');
  const heroText = hero.querySelector('.hero-inner');
  const nav = document.getElementById('mainNav');
  const padL = () => nav ? parseFloat(getComputedStyle(nav).paddingLeft) || 0 : 0;
  const blocks = [...document.querySelectorAll('.pj')];
  const covers = [...blocks, document.querySelector('.more')];
  let live = false, g = null, ticking = false;

  function fits() {
    return blocks.every(b => {

      const st = b.querySelector('.pj-stage'), top = b.querySelector('.pj-top'), bottom = b.querySelector('.pj-bottom');
      const need = parseFloat(getComputedStyle(st).paddingTop) + top.offsetHeight + 32 + bottom.offsetHeight + 36;
      return need <= window.innerHeight;
    });
  }
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  const tagList = hero.querySelector('.hero-tags');
  let heroTl = null, moreTweens = [];
  function evaluate() {
    root.classList.remove('cv-live'); live = false;
    clearVars();
    if (!hasGsap || !wide.matches || reduce.matches) return;
    if (!fits()) return;
    root.classList.add('cv-live'); live = true;
    buildHero(); buildMore(); render();
  }
  function clearVars() {
    if (heroTl) { heroTl.scrollTrigger && heroTl.scrollTrigger.kill(); heroTl.kill(); heroTl = null; }
    moreTweens.forEach(t => { t.scrollTrigger && t.scrollTrigger.kill(); t.kill(); }); moreTweens = [];
    if (hasGsap) gsap.set(['.more .strip-track', '.more .more-head'], { clearProps: 'transform,opacity' });
    if (hasGsap) gsap.set([heroText, tagList, hero.querySelector('.hero-title .ix')], { clearProps: 'opacity,visibility,transform' });
    [heroStage, ...blocks.map(b => b.querySelector('.pj-stage'))].forEach(s => s.style.removeProperty('--cv'));
    document.querySelectorAll('.comp').forEach(c => c.style.removeProperty('--e'));
  }

  const ix = hero.querySelector('.hero-title .ix');
  function buildHero() {
    if (!ix) return;
    heroTl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
      trigger: hero, start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
    heroTl.fromTo(ix, { scaleY: 1 }, { scaleY: 1.6, duration: 1 }, 0);
  }

  function buildMore() {
    const more = document.getElementById('more'); if (!more) return;
    const st = { trigger: more, start: 'top bottom', end: 'top top', scrub: true, invalidateOnRefresh: true };
    moreTweens.push(gsap.fromTo(more.querySelector('.strip-track'), { x: () => window.innerWidth * .35 }, { x: 0, ease: 'power2.out', scrollTrigger: { ...st } }));
    moreTweens.push(gsap.fromTo(more.querySelector('.more-head'), { y: 60, opacity: 0 }, { y: 0, opacity: 1, ease: 'power2.out', scrollTrigger: { ...st, start: 'top 85%', end: 'top 20%' } }));
  }

  function render() {
    ticking = false;
    if (!live) return;
    const vh = window.innerHeight;
    covers.forEach((b, i) => {
      const r = b.getBoundingClientRect();
      const enter = clamp(r.top / vh);

      if (i === 0) return;
      const prevStage = covers[i - 1].querySelector('.pj-stage');
      if (prevStage) prevStage.style.setProperty('--cv', (1 - enter).toFixed(3));
      const comp = b.querySelector('.comp');
      if (!comp) return;
      comp.style.setProperty('--e', ease(enter).toFixed(3));
    });

    window.dispatchEvent(new Event('v3render'));
  }
  const onScroll = () => { if (live && !ticking) { ticking = true; requestAnimationFrame(render); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  let rt = 0; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(evaluate, 150); });
  [wide, reduce].forEach(m => m.addEventListener ? m.addEventListener('change', evaluate) : m.addListener(evaluate));
  window.addEventListener('load', evaluate);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(evaluate);
  evaluate();

  if (hasGsap && window.Draggable && tagList) {
    gsap.registerPlugin(Draggable);
    const freeMq = window.matchMedia('(min-width: 1024px) and (min-height: 600px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    const tags = [...tagList.querySelectorAll('.hero-tag')];
    let drags = [];
    const onClick = e => { const a = e.target.closest('.hero-tag'); if (a && a.dataset.dragged) { e.preventDefault(); e.stopPropagation(); } };

    const titleEl = hero.querySelector('.hero-title'), inner = tagList.parentElement, hint = inner.querySelector('.hero-hint');
    const rowEl = inner.querySelector('.hero-row');
    const textBox = el => { const g = document.createRange(); g.selectNodeContents(el); const rs = [...g.getClientRects()]; return { l: Math.min(...rs.map(r => r.left)), r: Math.max(...rs.map(r => r.right)), t: Math.min(...rs.map(r => r.top)), b: Math.max(...rs.map(r => r.bottom)) }; };
    function plan() {
      const ir = inner.getBoundingClientRect(), [l1, l2] = [...titleEl.querySelectorAll(':scope > .ph')].map(textBox);
      const rowTop = rowEl.getBoundingClientRect().top, tb = titleEl.getBoundingClientRect().bottom;

      const had = root.classList.contains('tags-free'); root.classList.add('tags-free');
      const w = [...tagList.children].map(li => li.firstElementChild.offsetWidth), H = 40, pad = 24;
      if (!had) root.classList.remove('tags-free');
      const cy2 = (l2.t + l2.b) / 2 - ir.top;
      const TOP_GAP = 34;
      const metaEl = inner.querySelector('.hero-meta span'), mr = metaEl ? textBox(metaEl) : { r: ir.left };
      const metaR = mr.r - ir.left, uxX = l1.l - ir.left + (l1.r - l1.l) * .7;
      const dsX = metaR + (uxX - metaR - w[3]) / 2;
      const spots = [

        { x: 0, y: cy2 - H / 2, ok: l2.l - ir.left - pad >= w[0] },

        { x: l1.l - ir.left + (l1.r - l1.l) * .7, y: Math.max(0, l1.t - ir.top - H * .35 - TOP_GAP), ok: l1.t - ir.top >= H * .2 },

        { x: Math.max(0, l2.r - ir.left - w[2]), y: l2.b - ir.top + 10, ok: rowTop - l2.b >= H + 20 },

        { x: Math.max(metaR + pad, Math.min(dsX, uxX - w[3] - pad)), y: Math.max(0, l1.t - ir.top - H * .35 - TOP_GAP), ok: true },

        { x: l2.l - ir.left, y: l2.b - ir.top + 10, ok: l2.l - ir.left + w[4] + pad <= Math.max(0, l2.r - ir.left - w[2]) && rowTop - l2.b >= H + 20 }
      ];
      return spots;
    }
    function layout() {
      const spots = plan();
      [...tagList.children].forEach((li, i) => { li.style.left = Math.round(spots[i].x) + 'px'; li.style.top = Math.round(spots[i].y) + 'px'; });

      const ROT = [10, 10, 6.1, -7, -6];
      // 依 Helen 2026-10-21 拖曳定稿的排法（1440 寬時的位置）換算成以主標題字級為單位，各種桌機尺寸比例一致
      const ir = inner.getBoundingClientRect(), iw = ir.width, cs = getComputedStyle(titleEl), fs = parseFloat(cs.fontSize);
      const cx = document.createElement('canvas').getContext('2d'); cx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const asc = cx.measureText('H').fontBoundingBoxAscent, cap = cx.measureText('H').actualBoundingBoxAscent;
      const baseline = ph => { const w = document.createTreeWalker(ph, NodeFilter.SHOW_TEXT, { acceptNode: n => n.textContent.trim() ? 1 : 3 }); const g = document.createRange(); g.selectNodeContents(w.nextNode()); return g.getBoundingClientRect().top + asc - ir.top; };
      const [ph1, ph2] = titleEl.querySelectorAll(':scope > .ph'), t1 = textBox(ph1), t2 = textBox(ph2);
      const shiftY = el => { const t = getComputedStyle(el).transform; return t && t !== 'none' ? new DOMMatrixReadOnly(t).m42 : 0; }; // 進場動畫還在位移時，扣掉位移，用最終位置計算
      const capTop = baseline(ph1) - shiftY(ph1) - cap, b2 = baseline(ph2) - shiftY(ph2);
      const L1 = t1.l - ir.left, R1 = t1.r - ir.left, L2 = t2.l - ir.left, R2 = t2.r - ir.left;
      [...tagList.children].forEach((li, i) => {
        const w = li.firstElementChild.offsetWidth, h = li.firstElementChild.offsetHeight;
        const [x, y] = [
          [L2 - .259 * fs - w, b2 - .554 * fs - h / 2],   // UI Design：右緣在「to」左側，垂直置中於 to
          [R1 - 1.43 * fs, capTop - h],        // UX Flow：底緣略高於大寫頂端
          [R2 - 2.545 * fs, b2 + .215 * fs],              // Cross-device：在 Interaction 下方
          [L1 + 3.282 * fs, capTop - .132 * fs - h],      // Design System：在 Information 上方
          [L2 + .547 * fs, b2 - .037 * fs]                // HTML / CSS：微微壓到 to 的底部
        ][i];
        li.style.left = Math.round(Math.max(0, Math.min(iw - w, x))) + 'px';
        li.style.top = Math.round(Math.max(0, y)) + 'px';
        li.style.setProperty('--rot', ROT[i] + 'deg');
      });
      if (hint) { hint.style.left = Math.round(spots[2].x) + 'px'; hint.style.top = Math.round(spots[2].y + 52) + 'px'; }
    }
    const roomy = () => plan().every(p => p.ok);
    let state = null;
    const setup = () => {

      const scatter = freeMq.matches && roomy(), drag = scatter, key = drag + '|' + scatter;
      if (key === state) { if (scatter) layout(); root.classList.remove('tags-pending'); return; }
      state = key;
      drags.forEach(d => d.kill()); drags = [];
      tags.forEach(t => { gsap.set(t, { clearProps: 'x,y' }); t.classList.remove('is-dragging'); delete t.dataset.dragged; });
      [...tagList.children].forEach(li => { li.style.left = li.style.top = ''; });
      if (hint) hint.style.left = hint.style.top = '';
      root.classList.toggle('tags-free', scatter);
      root.classList.toggle('tags-drag', drag);
      requestAnimationFrame(() => root.classList.remove('tags-pending'));
      if (!drag) return;
      if (scatter) layout();
      drags = tags.map(t => Draggable.create(t, {
        type: 'x,y', bounds: inner, dragClickables: true, minimumMovement: 6, zIndexBoost: false,
        onPress() { delete t.dataset.dragged; },
        onDragStart() { t.dataset.dragged = '1'; t.classList.add('is-dragging'); },
        onRelease() { t.classList.remove('is-dragging'); setTimeout(() => delete t.dataset.dragged, 0); },
        onClick() { if (!t.dataset.dragged) window.location.href = t.href; }
      })[0]);
    };
    tagList.addEventListener('click', onClick, true);
    freeMq.addEventListener ? freeMq.addEventListener('change', setup) : freeMq.addListener(setup);

    window.addEventListener('load', setup);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(setup);
    setTimeout(setup, 1250); // 標題進場動畫結束後再定位一次（按鈕在這之後才出現，不會看到跳動）
    let tr = 0; window.addEventListener('resize', () => { clearTimeout(tr); tr = setTimeout(setup, 150); });
    setup();
  }

  document.querySelectorAll('.c-video').forEach(box => {
    const v = box.querySelector('video'), btn = box.querySelector('.vid-btn');
    let userPaused = reduce.matches, inView = false;
    const sync = () => {
      btn.setAttribute('aria-pressed', String(v.paused));
      btn.setAttribute('aria-label', v.paused ? '播放影片' : '暫停影片');
    };
    const tryPlay = () => { if (inView && !userPaused && !document.hidden) { const p = v.play(); if (p) p.catch(() => {}); } else v.pause(); };
    btn.addEventListener('click', () => { userPaused = !v.paused; if (userPaused) v.pause(); else { userPaused = false; if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } });
    v.addEventListener('play', sync); v.addEventListener('pause', sync); sync();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(es => { if (es[0].isIntersecting && !v.getAttribute('src')) { v.src = v.dataset.src; v.preload = 'auto'; } }, { rootMargin: '100% 0px' }).observe(box);
      new IntersectionObserver(es => { inView = es[0].intersectionRatio >= .5; tryPlay(); }, { threshold: [0, .5, 1] }).observe(box);
    }
    document.addEventListener('visibilitychange', tryPlay);
  });

  const strip = document.querySelector('.strip');
  if (strip) {
    const track = strip.querySelector('.strip-track');
    const btns = [...document.querySelectorAll('.strip-btn[data-dir]')];
    const now = document.querySelector('.strip-now');
    const originals = [...track.children], N = originals.length;
    const FOCUSABLE = 'a[href], button, summary';
    originals.forEach((li, i) => { li.dataset.of = i; li.querySelectorAll(FOCUSABLE).forEach((el, k) => { el.dataset.k = k; }); });
    const makeClone = li => {
      const c = li.cloneNode(true);
      c.classList.add('mw-clone'); c.setAttribute('aria-hidden', 'true');
      c.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
      c.querySelectorAll(FOCUSABLE).forEach(el => el.setAttribute('tabindex', '-1'));
      c.querySelectorAll('img').forEach(img => { img.alt = ''; });
      return c;
    };
    const before = originals.map(makeClone), after = originals.map(makeClone);

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => { if (!es[0].isIntersecting) return; io.disconnect();
        [...before, ...after].forEach(c => c.querySelectorAll('img').forEach(img => { img.loading = 'eager'; })); }, { rootMargin: '600px 0px' });
      io.observe(strip);
    } else [...before, ...after].forEach(c => c.querySelectorAll('img').forEach(img => { img.loading = 'eager'; }));
    before.forEach(c => track.insertBefore(c, originals[0]));
    after.forEach(c => track.appendChild(c));

    const copies = i => [before[i], originals[i], after[i]];
    track.addEventListener('toggle', e => {
      const d = e.target; if (!d.matches || !d.matches('details')) return;
      const li = d.closest('.mw'), i = +li.dataset.of;
      copies(i).forEach(x => { const o = x.querySelector('details'); if (o && o !== d && o.open !== d.open) o.open = d.open; });
    }, true);

    let setW = 0, stepW = 0;
    const measure = () => { setW = originals[0].offsetLeft - before[0].offsetLeft; stepW = originals[1].offsetLeft - originals[0].offsetLeft; };
    const index = () => (((Math.round((strip.scrollLeft - setW) / stepW)) % N) + N) % N;
    const update = () => { if (now) now.textContent = String(index() + 1); };

    let dragging = false, target = null;
    const normalize = () => {
      if (dragging || !setW) return;
      target = null;
      const s = strip.scrollLeft, lo = setW - stepW / 2, hi = 2 * setW - stepW / 2;
      if (s < lo) strip.scrollLeft = s + setW; else if (s >= hi) strip.scrollLeft = s - setW;
      update();
    };
    const init = () => { const i = setW ? index() : 0; measure(); strip.scrollLeft = setW + i * stepW; update(); };

    let st = 0;
    strip.addEventListener('scroll', () => { update(); clearTimeout(st); st = setTimeout(normalize, 150); }, { passive: true });
    if ('onscrollend' in window) strip.addEventListener('scrollend', () => { clearTimeout(st); normalize(); });

    btns.forEach(b => b.addEventListener('click', () => {
      if (target === null) { normalize(); target = Math.round((strip.scrollLeft - setW) / stepW); }
      target = Math.max(-N + 1, Math.min(2 * N - 2, target + +b.dataset.dir));
      strip.scrollTo({ left: setW + target * stepW, behavior: reduce.matches ? 'auto' : 'smooth' });
      if (reduce.matches) { target = null; normalize(); }
    }));
    let rt = 0; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { init(); reserve(); setRun(); }, 150); });

    strip.addEventListener('focusin', e => {
      const li = e.target.closest('.mw'); if (!li || li.classList.contains('mw-clone')) return;
      requestAnimationFrame(() => { strip.scrollLeft = setW + (+li.dataset.of) * stepW; update(); });
    });

    function reserve() {
      let h = 0;
      originals.forEach(li => {
        const d = li.querySelector('details'); if (!d) return;
        const was = d.open; d.open = true; h = Math.max(h, d.querySelector('.mw-sub').offsetHeight); d.open = was;
      });
      strip.style.setProperty('--sub-h', Math.ceil(h + 12) + 'px');
    }

    let drag = null, moved = false;
    strip.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      if (e.target.closest('summary, button, details[open] a')) return;
      drag = { x: e.clientX, l: strip.scrollLeft }; moved = false;
    });
    window.addEventListener('pointermove', e => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!moved && Math.abs(dx) > 6) { moved = true; dragging = true; strip.classList.add('is-dragging'); }
      if (moved) strip.scrollLeft = drag.l - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!drag) return; drag = null; dragging = false; strip.classList.remove('is-dragging');
      clearTimeout(st); st = setTimeout(normalize, 150);
    });

    strip.addEventListener('click', e => {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; return; }
      const el = e.target.closest(FOCUSABLE), li = e.target.closest('.mw-clone');
      if (!el || !li || el.tagName === 'SUMMARY') return;
      const orig = originals[+li.dataset.of].querySelector(`[data-k="${el.dataset.k}"]`);

      if (orig) { e.preventDefault(); e.stopPropagation(); if (orig.tagName === 'BUTTON') orig.focus({ preventScroll: true }); orig.click(); }
    }, true);
    strip.addEventListener('dragstart', e => e.preventDefault());

    const moreSec = document.getElementById('more');
    let lastP = null, dt = false;
    const RUN = .6;
    function setRun() {
      if (root.classList.contains('cv-live') && stepW) moreSec.style.setProperty('--more-run', Math.round(stepW * (N - 1) * RUN) + 'px');
      else moreSec.style.removeProperty('--more-run');
      lastP = null;
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }
    function drive() {
      dt = false;
      if (!root.classList.contains('cv-live') || !stepW) { lastP = null; return; }
      const run = stepW * (N - 1), p = clamp(-moreSec.getBoundingClientRect().top / (run * RUN));
      moreSec.style.setProperty('--more-p', p.toFixed(3)); moreSec.classList.toggle('is-end', p > .97);

      if (!dragging && p !== lastP) { target = null; strip.scrollLeft = setW + p * run; }
      lastP = p;
    }
    window.addEventListener('scroll', () => { if (!dt) { dt = true; requestAnimationFrame(drive); } }, { passive: true });
    new MutationObserver(setRun).observe(root, { attributes: true, attributeFilter: ['class'] });

    reserve(); init(); setRun();
    window.addEventListener('load', () => { reserve(); init(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { reserve(); init(); });
  }
})();
