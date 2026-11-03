/* Общие функции интерфейса: формат чисел, DOM, тосты, модалка, знак звёзд. */
(function (PZ) {
  const $ = (q, r) => (r || document).querySelector(q);
  const SUF = ['', 'К', 'М', 'Млрд', 'Трлн'];
  function fmt(n) {
    if (!isFinite(n)) return '∞';
    if (n < 0) return '-' + fmt(-n);
    if (n < 1000) return n < 10 && n % 1 ? n.toFixed(1) : String(Math.floor(n));
    let i = 0; while (n >= 1000 && i < 400) { n /= 1000; i++; }
    let s;
    if (i < SUF.length) s = SUF[i];
    else { const k = i - SUF.length; s = String.fromCharCode(97 + Math.floor(k / 26) % 26) + String.fromCharCode(97 + k % 26); }
    return (n < 10 ? n.toFixed(2) : n < 100 ? n.toFixed(1) : Math.floor(n)) + ' ' + s;
  }
  function h(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') e.className = v; else if (k === 'html') e.innerHTML = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat()) if (c !== null && c !== undefined && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c)));
    return e;
  }
  function img(src, cls) { const i = new Image(); i.src = src || ''; i.alt = ''; if (cls) i.className = cls; i.draggable = false; return i; }
  function toast(msg) { const t = h('div', { class: 'toast' }, msg); $('#app').append(t); setTimeout(() => t.remove(), 2300); }

  // Звёзды (МASTER 1.4): 1–5 золотые, 6–10 фиолетовые, 11–15 одна крылатая с числом. Пустые не показываем.
  function starSign(n) {
    n = Math.max(1, Math.min(15, n | 0));
    const w = h('span', { class: 'starsign', title: n + '★' });
    if (n <= 5) for (let i = 0; i < n; i++) w.append(h('i', { class: 'g' }, '★'));
    else if (n <= 10) for (let i = 0; i < n - 5; i++) w.append(h('i', { class: 'p' }, '★'));
    else w.append(h('i', { class: 'w' }, String(n)));
    return w;
  }

  const modal = {
    open(title, body, tabs) {
      $('#mtitle').textContent = title;
      const mt = $('#mtabs'); mt.innerHTML = ''; if (tabs) mt.append(tabs);
      const mb = $('#mbody'); mb.innerHTML = ''; mb.append(body);
      $('#modal').classList.add('on'); modal.isOpen = true;
    },
    close() { $('#modal').classList.remove('on'); modal.isOpen = false; modal.onClose && modal.onClose(); modal.onClose = null; },
    isOpen: false, onClose: null,
  };

  const RANK_CLASS = { E: 'E', D: 'D', C: 'C', B: 'B', A: 'A', S: 'S', SS: 'SS', 'БОГ': 'GOD' };
  const A = PZ.A;
  const GEM = { E: A.gem_E, D: A.gem_D, C: A.gem_C, B: A.gem_B, A: A.gem_A, S: A.gem_S, SS: A.gem_SS, GOD: A.gem_GOD };
  const gem = r => GEM[RANK_CLASS[r]];
  const FACTION = { light: 'Свет', shadow: 'Тень', wild: 'Дикие' };

  // Визуал героев. Арт добавляется по одному герою (решение 03.11.2026): PZ.ART[id] = { back, big, pic, fx, melee }.
  // Пока арта нет — силуэт (чёрная заливка эталона Призванного), как на утверждённом скриншоте.
  PZ.ART = PZ.ART || {};
  const ROLE_FX = ['#ff5a6e', '#c58bff', '#9fc4ff', '#7dffd0'];
  function heroArt(id, slot) {
    if (id === 'main') return { back: A.hero_main_front, big: A.hero_main_front, pic: A.hero_main_portrait, fx: '#c58bff', melee: true, real: true };
    const art = PZ.ART[id];
    if (art) return Object.assign({ real: true }, art);
    return { back: A.hero_main_front, big: A.hero_main_front, pic: A.hero_main_front, fx: ROLE_FX[slot || 0], melee: slot === 0 || slot === 2, real: false };
  }
  // Кнопка с постоянными узлами: текст меняется только при изменении (пересоздание узлов «съедает» нажатия).
  function setBtn(b, main, small, disabled) {
    if (!b._t) { b.textContent = ''; b._t = document.createTextNode(''); b._s = document.createElement('small'); b.append(b._t, b._s); }
    if (b._t.data !== main) b._t.data = main;
    const sm = small || '';
    if (b._s.textContent !== sm) b._s.textContent = sm;
    b._s.hidden = !sm;
    if (disabled !== undefined && b.disabled !== !!disabled) b.disabled = !!disabled;
  }
  PZ.ui = { setBtn, $, fmt, h, img, toast, starSign, modal, gem, FACTION, heroArt, RANK_CLASS };
})(globalThis.PZ);
