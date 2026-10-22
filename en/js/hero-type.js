(function () {
  const el = document.querySelector('.hero-title .ix');
  if (!el) return;
  const text = el.textContent;
  el.textContent = '';
  const chars = [...text].map(ch => { const s = document.createElement('span'); s.className = 'ix-ch'; s.textContent = ch; el.appendChild(s); return s; });
  const caret = document.createElement('span');
  caret.className = 'ix-caret'; caret.setAttribute('aria-hidden', 'true');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  el.classList.add('is-typing');
  const TYPE = 95, ERASE = 45, HOLD = 2800, GAP = 600, START = 500, ROUNDS = 3;
  let n = 0;
  const show = k => { chars.forEach((c, i) => c.classList.toggle('is-on', i < k)); (chars[k - 1] || null) ? chars[k - 1].after(caret) : el.prepend(caret); };
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  (async function run() {
    show(0); await sleep(START);
    for (let round = 1; ; round++) {
      el.classList.remove('is-hold');
      for (n = 1; n <= chars.length; n++) { show(n); await sleep(TYPE + Math.random() * 50); }
      el.classList.add('is-hold'); await sleep(HOLD);
      if (round >= ROUNDS) { el.classList.remove('is-hold', 'is-typing'); caret.remove(); return; }
      el.classList.remove('is-hold');
      for (n = chars.length - 1; n >= 0; n--) { show(n); await sleep(ERASE); }
      el.classList.add('is-hold'); await sleep(GAP);
    }
  })();
})();
