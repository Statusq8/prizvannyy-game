/* Экран «Башня»: вертикальная карта этажей с виртуализацией (рисуем только видимые строки). */
(function (PZ) {
  const { $, fmt, h, img } = PZ.ui;
  const A = PZ.A, B = PZ.B;
  const ROW = 60, ZH = 34;     // высота строки и заголовка зоны
  let root, sc, inner, pool = [], layout = [], built = 0;

  function init() {
    root = $('#scr-tower');
    sc = h('div', { class: 'scroll' }); inner = h('div', { id: 'tower-list' }); sc.append(inner);
    const bar = h('div', { id: 'tower-bar' },
      h('button', { class: 'btn gold', style: 'flex:1', onclick: () => { PZ.combat.goToRecord(PZ.game.s); PZ.app.go('battle'); } }, 'К рекорду', h('small', { id: 'tw-next' })),
      h('button', { class: 'btn ghost', onclick: () => scrollToFloor(PZ.combat.currentFloor(PZ.game.s)) }, 'Текущий', h('small', { id: 'tw-cur' })));
    root.append(h('div', { class: 'hdr', style: 'padding-bottom:8px' }, h('div', null, h('h2', null, 'Башня'), h('div', { class: 'sub' }, 'Выберите пройденный этаж для фарма золота. Рекорд при этом не теряется.'))), sc, bar);
    sc.addEventListener('scroll', draw, { passive: true });
  }

  // Строки сверху вниз: самый высокий видимый этаж (рекорд + 15) наверху, этаж 1 внизу. Заголовок зоны над её 50-м... (над первым этажом зоны, т.е. ниже в списке)
  function buildLayout() {
    const s = PZ.game.s, top = s.run.cleared + 15;
    layout = []; let y = 8;
    for (let f = top; f >= 1; f--) {
      if (f % B.floors.zoneSize === 0 || f === top) { layout.push({ zone: true, f, y }); y += ZH; }
      layout.push({ f, y }); y += ROW;
    }
    inner.style.height = (y + 8) + 'px';
    built = top;
  }

  function rowNode() {
    const n = h('div', { class: 'trow' }); n._n = h('div', { class: 'n' }); n._ic = img('', 'ic'); n._mid = h('div', { class: 'mid' }); n._st = h('div', { style: 'font-size:12px;font-weight:800' });
    n.append(n._n, n._ic, n._mid, n._st);
    n.addEventListener('click', () => {
      const s = PZ.game.s, f = n._f;
      const r = PZ.combat.selectFloor(s, f);
      if (!r.ok) { PZ.ui.toast(r.err); return; }
      PZ.ui.toast(f <= s.run.cleared ? 'Фарм этажа ' + f : 'Вперёд к этажу ' + f);
      PZ.app.go('battle');
    });
    return n;
  }

  function draw() {
    const s = PZ.game.s;
    if (built !== s.run.cleared + 15) { const keep = sc.scrollHeight - sc.scrollTop; buildLayout(); sc.scrollTop = sc.scrollHeight - keep; }
    const t0 = sc.scrollTop - 200, t1 = sc.scrollTop + sc.clientHeight + 200;
    const vis = layout.filter(r => r.y + ROW >= t0 && r.y <= t1);
    inner.innerHTML = '';
    const cur = PZ.combat.currentFloor(s);
    let i = 0;
    for (const r of vis) {
      if (r.zone) {
        const z = h('div', { class: 'zonehdr' }, 'Зона ' + (B.zoneIndex(r.f) + 1) + ' · ' + B.zoneName(r.f));
        z.style.top = r.y + 'px'; inner.append(z); continue;
      }
      const n = pool[i] || (pool[i] = rowNode()); i++;
      const st = PZ.combat.floorStatus(s, r.f), boss = B.bossKind(r.f);
      n._f = r.f; n.style.top = r.y + 'px';
      n.className = 'trow ' + st + (boss ? ' boss' : '') + (r.f === cur ? ' cur' : '');
      n._n.textContent = r.f;
      n._ic.src = boss ? A.boss_emblem : st === 'locked' ? A.ico_close : A.ico_battle;
      n._mid.innerHTML = '';
      n._mid.append(h('b', null, r.f === 400 ? 'Хранитель Цикла' : boss === 'boss50' ? 'Босс зоны' : boss === 'boss25' ? 'Полубосс' : boss ? 'Босс' : 'Обычный этаж'),
        '🪙 ' + fmt(B.enemyGold(r.f)) + ' за врага · ❤ ' + fmt(B.enemyHp(r.f)));
      n._st.textContent = r.f === cur ? (PZ.combat.isFarming(s) ? 'ФАРМ' : 'БОЙ') : st === 'cleared' ? '✓' : st === 'next' ? 'НОВЫЙ' : '🔒';
      n._st.style.color = st === 'cleared' ? 'var(--good)' : st === 'next' ? 'var(--accent)' : 'var(--dim)';
      inner.append(n);
    }
    $('#tw-next').textContent = 'этаж ' + (s.run.cleared + 1);
    $('#tw-cur').textContent = 'этаж ' + cur;
  }

  function scrollToFloor(f) {
    const r = layout.find(x => !x.zone && x.f === f);
    if (r) sc.scrollTop = Math.max(0, r.y - sc.clientHeight / 2 + ROW / 2);
    draw();
  }
  function show() { buildLayout(); scrollToFloor(PZ.combat.currentFloor(PZ.game.s)); }

  PZ.towerUi = { init, show, draw, scrollToFloor };
})(globalThis.PZ);
