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
  const FACTION = { light: 'Свет', dark: 'Тьма', wild: 'Дикие', shadow: 'Тени' };

  // Визуал героев. Арт добавляется по одному герою (решение 03.11.2026): PZ.ART[id] = { back, big, pic, fx, melee }.
  // Пока арта нет — силуэт (чёрная заливка эталона Призванного), как на утверждённом скриншоте.
  PZ.ART = PZ.ART || {};
  const ROLE_FX = ['#ff5a6e', '#c58bff', '#9fc4ff', '#7dffd0'];
  // Покадровый арт (листы 4×4 → 16 кадров, см. tools/cut_sheets.py). PZ.HF[id][вид] = число кадров.
  const HF = PZ.HF || {};
  const frames = (id, kind) => { const n = (HF[id] || {})[kind] || 0, o = []; for (let i = 0; i < n; i++) o.push(A['h_' + id + '_' + kind + '_' + String(i).padStart(2, '0')]); return o; };
  const range = (a, b) => { const o = []; for (let i = a; i <= b; i++) o.push(i); return o; };
  // Раскладка листов (из промтов): какие кадры — стойка, удар, ульта; какие VFX — обычный удар и ульта.
  const CLIPS = {
    summoned: { idle: [0, 1, 2, 1], attack: range(3, 15), hit: { kind: 'hit', f: range(0, 15) }, crit: { kind: 'crit', f: range(0, 15) } },
    kaeron: { idle: range(0, 3), attack: range(4, 7), ult: range(8, 15), hit: { kind: 'vfx', f: range(0, 7) }, ultFx: { kind: 'vfx', f: range(8, 15) } },
  };
  const DEF_CLIP = { idle: range(0, 3), attack: range(4, 7), ult: range(8, 15), hit: { kind: 'vfx', f: range(0, 7) }, ultFx: { kind: 'vfx', f: range(8, 15) } };
  const SUMMONED = 'summoned';
  function anim(id) {
    const key = id === 'main' ? SUMMONED : id, bat = frames(key, 'battle');
    if (!bat.length) return null;
    const c = CLIPS[key] || DEF_CLIP, pick = l => (l || []).map(i => bat[i]).filter(Boolean);
    const fx = d => { if (!d) return null; const f = frames(key, d.kind); const o = d.f.map(i => f[i]).filter(Boolean); return o.length ? o : null; };
    return { idle: pick(c.idle), attack: pick(c.attack), ult: pick(c.ult).length ? pick(c.ult) : pick(c.attack), menu: frames(key, 'menu'),
      hit: fx(c.hit), crit: fx(c.crit), ultFx: fx(c.ultFx) || fx(c.crit) || fx(c.hit) };
  }
  // Проигрыватель кадров для <img>: клип с fps, по кругу или один раз (потом — возврат к idle).
  function player(imgEl, idle, fps) {
    const p = { img: imgEl, idle, fps: fps || 6, seq: idle, i: 0, t: 0, loop: true, done: null };
    p.play = (seq, f, done) => { if (!seq || !seq.length) { done && done(); return; } p.seq = seq; p.fps = f; p.i = 0; p.t = 0; p.loop = false; p.done = done || null; imgEl.src = seq[0]; };
    p.setIdle = (seq, f) => { p.idle = seq; p.seq = seq; p.fps = f || 6; p.i = 0; p.t = 0; p.loop = true; if (seq && seq[0]) imgEl.src = seq[0]; };
    p.tick = dt => {
      if (!p.seq || !p.seq.length) return;
      p.t += dt; const step = 1 / p.fps;
      if (p.t < step) return;
      const adv = Math.floor(p.t / step); p.t -= adv * step; p.i += adv;
      if (p.i >= p.seq.length) {
        if (p.loop) p.i %= p.seq.length;
        else { const d = p.done; p.done = null; p.seq = p.idle; p.fps = 6; p.loop = true; p.i = 0; d && d(); if (!p.seq || !p.seq.length) return; }
      }
      const src = p.seq[p.i]; if (src && imgEl.src !== src) imgEl.src = src;
    };
    if (idle && idle[0]) imgEl.src = idle[0];
    return p;
  }
  const SIL = () => (frames(SUMMONED, 'battle')[0]) || A.hero_main_front;
  function heroArt(id, slot) {
    const an = anim(id);
    if (id === 'main') {
      const av = A.h_summoned_avatar || A.hero_main_portrait, m = an ? an.menu : [];
      return { back: an ? an.idle[0] : A.hero_main_front, big: m[0] || A.hero_main_front, pic: av, fx: '#c58bff', melee: true, real: true, anim: an };
    }
    if (an) return { back: an.idle[0], big: an.menu[0] || an.idle[0], pic: A['h_' + id + '_avatar'] || an.menu[0] || an.idle[0], fx: ROLE_FX[slot || 0], melee: true, real: true, anim: an };
    const art = PZ.ART[id];
    if (art) return Object.assign({ real: true }, art);
    return { back: SIL(), big: SIL(), pic: SIL(), fx: ROLE_FX[slot || 0], melee: slot === 0 || slot === 2, real: false, anim: null };
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
  PZ.ui = { setBtn, $, fmt, h, img, toast, starSign, modal, gem, FACTION, heroArt, RANK_CLASS, anim, player, frames };
})(globalThis.PZ);
