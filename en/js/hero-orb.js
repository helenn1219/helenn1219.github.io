(function () {
  const me = document.currentScript;
  const host = document.querySelector((me && me.dataset.host) || '.hero-stage');
  if (!host) return;
  const cv = document.createElement('canvas');
  cv.className = me.dataset.page !== undefined ? 'grain-orbs-page' : 'grain-bg grain-orbs'; cv.setAttribute('aria-hidden', 'true');
  host.prepend(cv);
  const COL = (me.dataset.colors || '220,233,135|185,201,74|236,242,190').split('|');
  const SHIFT = parseFloat(me.dataset.shiftY || 0), FADE = parseFloat(me.dataset.alpha || 1);
  const ctx = cv.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const GRAIN = .85;
  let W = 0, H = 0, dpr = 1, noise = null, blobs = [];
  const mouse = { x: -1e4, y: -1e4 }, mv = { vx: 0, vy: 0, lx: -1e4, ly: -1e4 };

  function makeNoise() {
    noise = document.createElement('canvas'); noise.width = noise.height = 256;
    const g = noise.getContext('2d'), d = g.createImageData(256, 256);
    for (let i = 0; i < d.data.length; i += 4) { const v = Math.random(); d.data[i + 3] = v < .5 ? 255 * Math.pow(v * 2, 1.4) : 0; }
    g.putImageData(d, 0, 0);
  }
  function resize() {
    const b = cv.getBoundingClientRect();
    dpr = Math.min(2, devicePixelRatio || 1);
    W = b.width; H = b.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    if (!noise) makeNoise();
    const m = Math.min(W, H), B = o => Object.assign({ vs: 0, st: 0, px: 0, py: 0, ang: 0 }, o);
    blobs = [
      B({ x: W * .92, y: H * (.3 + SHIFT), r: m * .55, ax: m * .06, ay: m * .06, sx: 1, sy: 1.3, c: COL[0], a: .95 }),
      B({ x: W * .8, y: H * (.47 + SHIFT), r: m * .42, ax: m * .07, ay: m * .08, sx: 1.4, sy: .9, c: COL[1], a: .55 }),
      B({ x: W * 1.02, y: H * (.62 + SHIFT), r: m * .36, ax: m * .05, ay: m * .1, sx: .8, sy: 1.6, c: COL[2], a: .8 }),
    ];
  }
  function draw(t, dt) {
    if (mv.lx > -1e3 && mouse.x > -1e3) { mv.vx += ((mouse.x - mv.lx) / Math.max(dt, .001) - mv.vx) * .25; mv.vy += ((mouse.y - mv.ly) / Math.max(dt, .001) - mv.vy) * .25; }
    else { mv.vx *= .8; mv.vy *= .8; }
    mv.lx = mouse.x; mv.ly = mouse.y;
    const s = reduce ? 0 : t * .00025;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0, 0, W, H);
    blobs.forEach((b, i) => {
      let x = b.x + Math.sin(s * b.sx + i) * b.ax, y = b.y + Math.cos(s * b.sy + i * 2) * b.ay;
      const dx = mouse.x - x, dy = mouse.y - y, dist = Math.hypot(dx, dy), near = Math.max(0, 1 - dist / (b.r * .9));
      const want = Math.min(.45, Math.hypot(mv.vx, mv.vy) * .00035) * near;
      if (want > b.st) b.ang = Math.atan2(mv.vy, mv.vx);
      b.vs += ((want - b.st) * 60 - b.vs * 5.5) * dt; b.st += b.vs * dt;
      b.px += ((-dx / (dist || 1) * near * b.r * .12) - b.px) * Math.min(1, dt * 6);
      b.py += ((-dy / (dist || 1) * near * b.r * .12) - b.py) * Math.min(1, dt * 6);
      x += b.px; y += b.py;
      ctx.save(); ctx.translate(x, y); ctx.rotate(b.ang); ctx.scale(1 + b.st, 1 / (1 + b.st));
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, b.r);
      g.addColorStop(0, `rgba(${b.c},${b.a * FADE})`); g.addColorStop(.55, `rgba(${b.c},${b.a * .55 * FADE})`); g.addColorStop(1, `rgba(${b.c},0)`);
      ctx.fillStyle = g; ctx.fillRect(-b.r, -b.r, b.r * 2, b.r * 2);
      ctx.restore();
    });
    ctx.globalCompositeOperation = 'destination-out';
    const ox = reduce ? 0 : (Math.random() * 256) | 0, oy = reduce ? 0 : (Math.random() * 256) | 0;
    ctx.save(); ctx.translate(-ox, -oy); ctx.fillStyle = ctx.createPattern(noise, 'repeat'); ctx.globalAlpha = GRAIN; ctx.fillRect(ox, oy, W, H); ctx.restore();
    ctx.globalCompositeOperation = 'source-over';
  }
  let raf = 0, last = performance.now(), visible = true;
  function loop(t) {
    raf = 0;
    const dt = Math.min(.05, (t - last) / 1000); last = t;
    draw(t, dt);
    if (visible && !reduce) raf = requestAnimationFrame(loop);
  }
  addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; }, { passive: true });
  document.addEventListener('pointerleave', () => { mouse.x = mouse.y = -1e4; });
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(loop); } }).observe(cv);
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { resize(); if (reduce) loop(performance.now()); }, 150); });
  resize(); raf = requestAnimationFrame(loop);
})();
