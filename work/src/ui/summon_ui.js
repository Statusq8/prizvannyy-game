/* Экран «Призыв» (портал) и вкладка «Звёзды» в карточке героя. */
(function (PZ) {
  const { $, fmt, h, img, gem, heroArt, starSign, modal, toast, setBtn } = PZ.ui;
  const A = PZ.A;
  const RNAME = { E: 'E', D: 'D', C: 'C', B: 'B', A: 'A', S: 'S', SS: 'SS', 'БОГ': 'БОГ' };
  let root, el = {};

  function init() {
    root = $('#scr-summon'); root.innerHTML = '';
    el.scrolls = h('b'); el.pityA = h('span'); el.pityS = h('span'); el.rates = h('div', { class: 'rates' });
    el.b1 = h('button', { class: 'btn', onclick: e => { e.stopPropagation(); pull(1); } });
    el.b10 = h('button', { class: 'btn gold', onclick: e => { e.stopPropagation(); pull(10); } });
    root.append(h('div', { class: 'scroll' },
      h('div', { class: 'hdr' }, h('div', { style: 'flex:1' }, h('h2', null, 'Портал призыва'), h('div', { class: 'sub' }, 'Новые герои и фрагменты для звёзд')),
        h('div', { class: 'res' }, img(A.ico_crystal), el.scrolls)),
      h('div', { class: 'portal' }, h('div', { class: 'swirl' }, img(A.ico_portal)), h('div', { class: 'ptitle' }, 'Врата Башни')),
      h('div', { class: 'btnrow', style: 'justify-content:center;margin:4px 10px 10px' }, el.b1, el.b10),
      (el.shop = PZ.metaUi.shopBlock()),
      h('div', { class: 'section' }, h('h3', null, 'Гарантия'),
        h('div', { class: 'kv' }, h('span', null, 'Герой ранга A или выше'), el.pityA),
        h('div', { class: 'kv' }, h('span', null, 'Герой ранга S или выше'), el.pityS)),
      h('div', { class: 'section' }, h('h3', null, 'Шансы (честная таблица)'), el.rates,
        h('div', { class: 'sub', style: 'margin-top:6px' }, 'SS появятся в портале после рекорда 1000, БОГ — после 4000. Шансы остальных рангов при этом не меняются в их пользу.')),
      h('div', { class: 'section' }, h('h3', null, 'Как получить свитки'),
        h('div', { class: 'sub' }, 'За золото (выше) и за первое прохождение в забеге: босс 10-го этажа — 2 свитка, полубосс 25-го — 3, босс зоны 50-го — 8. Повторный герой даёт фрагменты: E 1, D 2, C 5, B 12, A 30, S 100.'))));
  }

  function render() {
    const s = PZ.game.s, a = PZ.portal.ensure(s), P = PZ.B.portal;
    el.scrolls.textContent = a.scrolls;
    el.shop.update();
    el.pityA.textContent = 'через ' + (P.pityA - a.pity.sinceA) + ' призывов';
    el.pityS.textContent = 'через ' + (P.pityS - a.pity.sinceS) + ' призывов';
    setBtn(el.b1, 'Призыв ×1', '1 свиток', a.scrolls < 1);
    setBtn(el.b10, 'Призыв ×10', '10 свитков', a.scrolls < 10);
    const r = PZ.portal.availableRates(s.account.record);
    el.rates.innerHTML = '';
    for (const k of PZ.portal.ORDER) {
      const on = k in r;
      el.rates.append(h('div', { class: 'rate' + (on ? '' : ' off') }, img(gem(k), 'rg'), h('b', null, k),
        h('span', null, on ? (r[k] * 100).toFixed(r[k] < 0.01 ? 3 : 1) + '%' : '🔒 ' + PZ.B.heroes.gates[k])));
    }
  }

  function pull(n) {
    const s = PZ.game.s;
    const res = PZ.portal.summon(s, n);
    if (!res.ok) return toast(res.err);
    PZ.app.saveNow();
    render();
    const box = h('div', { class: 'pulls' });
    res.results.forEach((r, i) => {
      const hero = PZ.HERO_BY_ID[r.id], art = heroArt(r.id);
      const c = h('div', { class: 'pull r-' + PZ.ui.RANK_CLASS[r.rarity] + (r.duplicate ? '' : ' new'), style: `animation-delay:${i * 0.08}s` },
        h('div', { class: 'pic' + (art.real ? '' : ' sil') }, img(art.pic)), img(gem(r.rarity), 'rg'),
        h('div', { class: 'pn' }, hero.name),
        h('div', { class: 'pt' }, r.duplicate ? '+' + r.fragments + ' фрагм.' : 'НОВЫЙ'));
      c.addEventListener('click', () => PZ.heroesUi.openHero(r.id));
      box.append(c);
    });
    const best0 = res.results.reduce((b, r) => PZ.portal.ORDER.indexOf(r.rarity) > PZ.portal.ORDER.indexOf(b.rarity) ? r : b);
    if (PZ.audio) PZ.audio.summon(best0.rarity);
    const best = res.results.reduce((b, r) => PZ.portal.ORDER.indexOf(r.rarity) > PZ.portal.ORDER.indexOf(b.rarity) ? r : b);
    modal.open('Призыв ×' + n, h('div', null, box,
      h('div', { class: 'sub', style: 'text-align:center;margin-top:8px' }, 'Лучший: ' + PZ.HERO_BY_ID[best.id].name + ' (' + best.rarity + '). Новых героев можно сразу нанять во вкладке «Герои».'),
      h('div', { class: 'btnrow', style: 'justify-content:center;margin-top:10px' },
        h('button', { class: 'btn', disabled: s.account.scrolls < 1, onclick: () => { modal.close(); pull(1); } }, 'Ещё ×1'),
        h('button', { class: 'btn gold', disabled: s.account.scrolls < 10, onclick: () => { modal.close(); pull(10); } }, 'Ещё ×10'))));
  }

  // --- вкладка «Звёзды» ---
  function stars(id) {
    const s = PZ.game.s, wrap = h('div');
    const draw = () => {
      wrap.innerHTML = '';
      const a = PZ.portal.ensure(s), cur = PZ.portal.starsOf(s, id), cost = PZ.portal.starCost(cur), B = PZ.B;
      const owned = !!a.owned[id];
      wrap.append(h('div', { class: 'starbig' }, starSign(cur)),
        h('div', { class: 'stats' },
          h('div', { class: 'stat' }, h('div', { class: 'k' }, 'Звёзд'), h('div', { class: 'v' }, cur + ' / 15')),
          h('div', { class: 'stat' }, h('div', { class: 'k' }, 'Множитель урона'), h('div', { class: 'v' }, '×' + B.starMult(cur).toFixed(2) + (cost ? ' → ×' + B.starMult(cur + 1).toFixed(2) : '')))));
      if (!owned) { wrap.append(h('div', { class: 'note' }, 'Герой ещё не получен — призовите его в портале.')); return; }
      if (!cost) { wrap.append(h('div', { class: 'note' }, 'Максимум: 15 звёзд.')); return; }
      const have = { fragments: a.fragments[id] || 0, essence: a.materials.essence, core: a.materials.core, seal: a.materials.seal };
      const row = (k, name) => cost[k] ? h('div', { class: 'kv' + (have[k] < cost[k] ? ' lack' : '') }, h('span', null, name), h('span', null, fmt(have[k]) + ' / ' + fmt(cost[k]))) : null;
      wrap.append(h('div', { class: 'section', style: 'margin:10px 0' }, h('h3', null, 'Цена ' + cur + '★ → ' + (cur + 1) + '★'),
        row('fragments', 'Фрагменты героя'), row('essence', 'Эссенция'), row('core', 'Ядро'), row('seal', 'Печать')));
      const c = PZ.portal.canAscend(s, id);
      wrap.append(h('div', { style: 'text-align:center' }, h('button', { class: 'btn gold', disabled: !c.ok, onclick: () => {
        const r = PZ.portal.ascend(s, id); if (!r.ok) return toast(r.err);
        toast('Звёзд: ' + r.stars + '! Урон ×' + r.mult.toFixed(2)); if (PZ.audio) PZ.audio.fanfare(); PZ.app.saveNow(); draw();
      } }, 'Повысить звезду', h('small', null, c.ok ? 'хватает' : c.err))));
      wrap.append(h('div', { class: 'note' }, 'Звёзды постоянные: сохраняются после перерождения. 1–5 — золотые, 6–10 — фиолетовые, 11–15 — одна крылатая звезда с числом. Цены и множители — тестовые (баланс B-001).'));
    };
    draw();
    return wrap;
  }

  PZ.summonUi = { init, render };
  PZ.starsUi = { render: stars };
})(globalThis.PZ);
