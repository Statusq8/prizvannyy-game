/* Экран «Герои»: каталог 40 героев, найм и прокачка, карточка героя с вкладками Герой / Кости / Звёзды. */
(function (PZ) {
  const { $, fmt, h, img, gem, FACTION, heroArt, starSign, modal, setBtn, toast } = PZ.ui;
  const A = PZ.A;
  let root, listEl, filter = 'all', rows = {};

  // Лучшее действие для панели боя: дешёвый найм, иначе самое дешёвое улучшение.
  function suggestion(s, mode) {
    let next = null;
    for (const hero of PZ.HEROES) {
      if (s.run.hired[hero.id] || !PZ.heroes.isHireable(s, hero.id)) continue;
      const c = PZ.heroes.hireCost(s, hero.id);
      if (!next || c < next.cost) next = { id: hero.id, hire: true, cost: c, levels: 1 };
    }
    let up = null;
    for (const id of Object.keys(s.run.hired)) {
      const b = PZ.heroes.batch(s, id, mode, s.run.gold);
      const lv = b.levels || 1, cost = b.levels ? b.cost : PZ.heroes.levelCost(s, id, s.run.hired[id]);
      const gain = PZ.heroes.personalDps(id, s.run.hired[id] + lv, 1) - PZ.heroes.personalDps(id, s.run.hired[id], 1);
      const eff = gain / cost;
      if (!up || eff > up.eff) up = { id, hire: false, cost, levels: lv, eff };
    }
    if (next && (!up || next.cost <= s.run.gold || next.cost < up.cost * 3)) return next;
    return up || next;
  }

  function init() {
    root = $('#scr-heroes');
    const chips = h('div', { class: 'chips' });
    for (const [k, t] of [['all', 'Все'], ['hired', 'Нанятые'], ['E', 'E'], ['D', 'D'], ['C', 'C'], ['B', 'B'], ['A', 'A'], ['S', 'S'], ['SS', 'SS'], ['БОГ', 'БОГ']])
      chips.append(h('button', { 'data-f': k, onclick: () => { filter = k; build(); } }, t));
    const mode = h('div', { class: 'mode' });
    for (const [m, t] of [[1, '×1'], [10, '×10'], ['max', 'Макс']]) mode.append(h('button', { 'data-m': m, onclick: () => { PZ.game.mode = m; update(true); } }, t));
    root.append(
      h('div', { class: 'hdr' }, h('div', { style: 'flex:1' }, h('h2', null, 'Герои'), h('div', { class: 'sub', id: 'armytotal' })), mode),
      chips, (listEl = h('div', { class: 'list scroll' })));
    root._mode = mode; root._chips = chips;
  }

  function build() {
    const s = PZ.game.s;
    listEl.innerHTML = ''; rows = {};
    [...root._chips.children].forEach(b => b.classList.toggle('on', b.dataset.f === filter));
    // главный герой — первым
    if (filter === 'all' || filter === 'hired') listEl.append(mainRow());
    for (const hero of PZ.HEROES) {
      if (filter === 'hired' && !s.run.hired[hero.id]) continue;
      if (!['all', 'hired'].includes(filter) && hero.rarity !== filter) continue;
      const r = heroRow(hero); rows[hero.id] = r; listEl.append(r.node);
    }
    update(true);
  }

  function mainRow() {
    const n = h('div', { class: 'card' },
      h('div', { class: 'pic', onclick: openMain }, img(A.hero_main_portrait)),
      h('div', { class: 'info', onclick: openMain }, h('div', { class: 't' }, 'Призванный'), h('div', { class: 's', id: 'mainrow-s' })),
      h('button', { class: 'btn', id: 'mainrow-b', onclick: e => { e.stopPropagation(); const r = PZ.heroes.mainLevelUp(PZ.game.s, PZ.game.mode); if (!r.ok) PZ.ui.toast(r.err); update(true); } }));
    return n;
  }

  function heroRow(hero) {
    const art = heroArt(hero.id);
    const s = h('div', { class: 's' }), t = h('div', { class: 't' }), btn = h('button', { class: 'btn' });
    const open = () => openHero(hero.id);
    const node = h('div', { class: 'card' },
      h('div', { class: 'pic' + (art.real ? '' : ' sil'), style: `border-color:var(--r-${PZ.ui.RANK_CLASS[hero.rarity]})`, onclick: open }, img(art.pic), img(gem(hero.rarity), 'gem')),
      h('div', { class: 'info', onclick: open }, t, s), btn);
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const st = PZ.game.s;
      if (btn.dataset.act === 'portal') return PZ.app.go('summon');
      const r = st.run.hired[hero.id] ? PZ.heroes.levelUp(st, hero.id, PZ.game.mode) : PZ.heroes.hire(st, hero.id);
      if (!r.ok) PZ.ui.toast(r.err); update(true);
    });
    const gemImg = node.querySelector('.pic .gem');
    return { node, s, t, btn, hero, gemImg, gemRank: hero.rarity };
  }

  let uT = 0;
  function update(force) {
    const now = performance.now(); if (!force && now - uT < 250) return; uT = now;
    const s = PZ.game.s, m = PZ.game.mode;
    [...root._mode.children].forEach(b => b.classList.toggle('on', String(m) === b.dataset.m));
    const br = PZ.heroes.armyBreakdown(s, 'normal');
    const share = Object.fromEntries(br.parts.map(p => [p.id, br.total ? p.dps / br.total : 0]));
    $('#armytotal').textContent = 'Общий урон ' + fmt(br.total) + '/с · нанято ' + Object.keys(s.run.hired).length + ' из 40';
    const ms = $('#mainrow-s');
    if (ms) {
      ms.textContent = 'Ур. ' + s.run.mainLevel + ' · ' + fmt(PZ.heroes.mainDps(s)) + '/с · ' + (share.main * 100).toFixed(1) + '%';
      const mb = PZ.heroes.mainBatch(s, m, s.run.gold), cost = mb.levels ? mb.cost : PZ.B.mainLevelCost(s.run.mainLevel);
      setBtn($('#mainrow-b'), 'Ур. +' + (mb.levels || 1), '🪙 ' + fmt(cost), s.run.gold < cost);
    }
    for (const r of Object.values(rows)) {
      const id = r.hero.id, lv = s.run.hired[id], ok = PZ.heroes.canObtain(s, id), owned = s.account.owned[id];
      r.node.classList.toggle('locked', !ok);
      const rk = PZ.bones.rankOf(s, id);
      const st = PZ.portal.starsOf(s, id);
      const tt = ((s.account.visible || []).includes(id) && lv ? '👁 ' : '') + r.hero.name + (rk !== r.hero.rarity ? ' · ' + rk : '') + (owned && st > 1 ? ' · ' + st + '★' : '') + (PZ.bones.canPromote(s, id).ok || (owned && PZ.portal.canAscend(s, id).ok) ? ' ⬆' : '');
      if (r.t.textContent !== tt) r.t.textContent = tt;
      if (r.gemImg && r.gemRank !== rk) { r.gemImg.src = gem(rk); r.gemRank = rk; }
      const setT = (el, v) => { if (el.textContent !== v) el.textContent = v; };
      const setC = c => { if (r.btn.className !== c) r.btn.className = c; };
      if (!ok) { setT(r.s, r.hero.rarity + ' · откроется при рекорде ' + PZ.heroes.gateFor(r.hero.rarity)); setC('btn'); setBtn(r.btn, '🔒', '', true); continue; }
      if (!owned) { setT(r.s, r.hero.rarity + ' · не получен'); setC('btn ghost'); setBtn(r.btn, 'Портал', 'призыв', false); r.btn.dataset.act = 'portal'; continue; }
      if (!lv) {
        const c = PZ.heroes.hireCost(s, id);
        setT(r.s, rk + ' · ' + FACTION[r.hero.faction] + ' · ' + fmt(r.hero.dps) + '/с');
        setC('btn gold'); setBtn(r.btn, 'Нанять', '🪙 ' + fmt(c), s.run.gold < c); r.btn.dataset.act = 'hire';
      } else {
        const b = PZ.heroes.batch(s, id, m, s.run.gold), cost = b.levels ? b.cost : PZ.heroes.levelCost(s, id, lv);
        setT(r.s, 'Ур. ' + lv + ' · ' + fmt(PZ.heroes.personalDps(id, lv, PZ.heroes.heroStars(s, id)) * PZ.bones.rankMult(s, id)) + '/с · ' + ((share[id] || 0) * 100).toFixed(1) + '%');
        setC('btn'); setBtn(r.btn, 'Ур. +' + (b.levels || 1), '🪙 ' + fmt(cost), s.run.gold < cost); r.btn.dataset.act = 'level';
      }
    }
  }

  // --- Карточка героя: вкладки сохраняют выбранного героя (MASTER 1.4) ---
  function effectText(p) {
    const pct = v => '+' + +(v * 100).toFixed(1) + '%';
    switch (p.type) {
      case 'personal_dps_multiplier': return 'Личный урон ×' + p.value;
      case 'army': return 'Армия ' + pct(p.value);
      case 'faction': return 'Фракция «' + FACTION[p.target] + '» ' + pct(p.value);
      case 'all_factions': return 'Все фракции ' + pct(p.value);
      case 'tag': return 'Нежить ' + pct(p.value);
      case 'target': return (p.target === 'boss' ? 'Урон по боссам ' : 'Урон по обычным ') + pct(p.value);
      case 'economy': return p.target === 'gold' ? 'Золото ' + pct(p.value) : 'Призрачные награды ' + pct(p.value) + ' (механики пока нет)';
      case 'summoned': return 'Урон Призванного ' + pct(p.value);
      default: return p.type;
    }
  }

  function openHero(id, tab) {
    const s = PZ.game.s, hero = PZ.HERO_BY_ID[id], art = heroArt(id);
    tab = tab || 'hero';
    const tabs = h('div', { class: 'tabs' });
    for (const [k, t] of [['hero', 'Герой'], ['bones', 'Кости'], ['stars', 'Звёзды']]) tabs.append(h('button', { class: k === tab ? 'on' : '', onclick: () => openHero(id, k) }, t));
    const body = h('div');
    const lv = s.run.hired[id] || 0, stars = PZ.heroes.heroStars(s, id);
    if (tab === 'hero') {
      const br = PZ.heroes.armyBreakdown(s, 'normal'); const part = br.parts.find(p => p.id === id);
      const a = h('div', { class: 'heroart' + (art.real ? '' : ' sil') }, img(A.ring_purple, 'ring'), img(art.big, 'big'));
      body.append(a,
        h('div', { style: 'text-align:center;margin-top:6px' }, h('img', { src: gem(PZ.bones.rankOf(s, id)), style: 'width:26px;vertical-align:middle' }), ' ', h('b', { style: 'font-size:18px' }, hero.name), ' ', starSign(stars)),
        h('div', { class: 'sub', style: 'text-align:center' }, 'Ранг ' + PZ.bones.rankOf(s, id) + (PZ.bones.rankOf(s, id) !== hero.rarity ? ' (изначально ' + hero.rarity + ')' : '') + ' · ' + FACTION[hero.faction] + (hero.tags.includes('undead') ? ' · нежить' : '')),
        h('div', { class: 'stats' },
          h('div', { class: 'stat' }, h('div', { class: 'k' }, 'Уровень'), h('div', { class: 'v' }, lv || '—')),
          h('div', { class: 'stat' }, h('div', { class: 'k' }, 'Урон в бою (вклад)'), h('div', { class: 'v' }, part ? fmt(part.dps) + ' · ' + (part.dps / br.total * 100).toFixed(1) + '%' : 'не нанят'))),
        h('h3', { style: 'margin:14px 0 4px;font-size:14px' }, 'Пассивки'),
        ...hero.passives.map(p => h('div', { class: 'pass' + (lv >= p.lv ? ' got' : '') }, h('span', { class: 'lv' }, 'ур.' + p.lv), h('span', { class: 'd' }, p.name, h('div', { class: 'e' }, effectText(p))), lv >= p.lv ? '✓' : '')));
      if (s.run.hired[id]) {
        const vis = (s.account.visible || []).includes(id);
        body.append(h('div', { style: 'text-align:center;margin-top:10px' }, h('button', { class: 'btn ' + (vis ? 'ghost' : 'gold'), onclick: () => { const r = PZ.classes.toggleVisible(s, id); if (!r.ok) return toast(r.err); toast(r.on ? 'Герой на сцене' : 'Герой убран со сцены'); openHero(id, 'hero'); } },
          vis ? 'Убрать со сцены' : 'Показывать на сцене', h('small', null, 'на сцене ' + (s.account.visible || []).filter(x => s.run.hired[x]).length + ' из 4 · урон дают все нанятые'))));
      }
      if (!art.real) body.append(h('div', { class: 'note' }, 'Арт героя ещё не добавлен — показан силуэт. Героев добавляем по одному.'));
    } else if (tab === 'bones') {
      body.append(PZ.bonesUi ? PZ.bonesUi.render(id) : h('div', { class: 'note' }, 'Поглощение костей — этап M5. Шесть слотов: голова, спина, руки, ноги; шесть костей нужной редкости повышают ранг.'));
    } else {
      body.append(PZ.starsUi ? PZ.starsUi.render(id) : h('div', null, h('div', { style: 'text-align:center;font-size:22px;margin:16px 0' }, starSign(stars)),
        h('div', { class: 'note' }, 'Звёзды 1–15 — этап M6: дубликаты из портала превращаются во фрагменты этого героя.')));
    }
    modal.open(hero.name, body, tabs);
  }

  function classBlock(s, redraw) {
    const CL = PZ.classes, C = PZ.B.classes, a = s.account, box = h('div', { class: 'section', style: 'margin:10px 0' });
    const pick = (list, onPick) => h('div', { class: 'classes' }, ...Object.entries(list).map(([id, c]) =>
      h('button', { class: 'clsbtn', onclick: () => { const r = onPick(id); if (!r.ok) return toast(r.err); PZ.app.saveNow(); toast('Выбрано: ' + c.name); redraw(); } },
        h('b', null, c.name), h('span', null, CL.describe(c.fx)))));
    if (!a.mainClass) {
      box.append(h('h3', null, 'Класс'), h('div', { class: 'sub' }, s.run.mainLevel >= C.classLevel ? 'Выберите класс — он сохранится после перерождения.' : 'Откроется на уровне ' + C.classLevel + ' (сейчас ' + s.run.mainLevel + ').'));
      if (CL.canChooseClass(s)) box.append(pick(CL.CLASSES, id => CL.chooseClass(s, id)));
    } else {
      const c = CL.CLASSES[a.mainClass];
      box.append(h('h3', null, 'Класс: ' + CL.title(s)), h('div', { class: 'sub' }, c.name + ': ' + CL.describe(c.fx) + (a.mainSubclass ? ' · ' + c.subs[a.mainSubclass].name + ': ' + CL.describe(c.subs[a.mainSubclass].fx) : '')));
      if (!a.mainSubclass) {
        box.append(h('div', { class: 'sub', style: 'margin-top:6px' }, s.run.mainLevel >= C.subclassLevel ? 'Выберите подкласс:' : 'Подкласс — на уровне ' + C.subclassLevel + ' (сейчас ' + s.run.mainLevel + ').'));
        if (CL.canChooseSub(s)) box.append(pick(c.subs, id => CL.chooseSub(s, id)));
      }
      box.append(h('button', { class: 'btn ghost', style: 'margin-top:8px', onclick: () => PZ.moreUi.confirm2('Сменить класс?', 'Класс и подкласс сбросятся, выбрать заново можно сразу. Цена: ' + C.respecScrolls + ' свитков.', () => { const r = CL.respec(s); if (!r.ok) return toast(r.err); PZ.app.saveNow(); openMain(); }) }, 'Сменить класс', h('small', null, C.respecScrolls + ' свитков')));
    }
    box.append(h('div', { class: 'sub', style: 'margin-top:6px;font-size:11px' }, 'Бонусы классов — тестовые (в GDD не определены).'));
    return box;
  }

  function openMain() {
    const s = PZ.game.s;
    const body = h('div');
    const draw = () => {
      body.innerHTML = '';
      body.append(
        h('div', { class: 'heroart' }, img(A.ring_purple, 'ring'), img(A.hero_main_front, 'big')),
        h('div', { style: 'text-align:center;margin-top:4px' }, h('b', { style: 'font-size:18px' }, 'Призванный'), h('div', { class: 'sub' }, PZ.classes.title(s))),
        h('div', { class: 'stats' },
          h('div', { class: 'stat' }, h('div', { class: 'k' }, 'Уровень'), h('div', { class: 'v' }, s.run.mainLevel)),
          h('div', { class: 'stat' }, h('div', { class: 'k' }, 'Урон/с'), h('div', { class: 'v' }, fmt(PZ.heroes.mainDps(s))))),
        classBlock(s, draw),
        h('div', { class: 'note' }, 'Уровень Призванного сбрасывается при перерождении, класс и подкласс сохраняются. Визуальные формы на 500/1000/2000 — вместе с артом (этап M9).'));
    };
    draw();
    modal.open('Призванный', body);
  }

  // Подсказка выбора класса, когда он становится доступен (один раз за сессию на каждый порог)
  let prompted = {};
  function checkClassPrompt() {
    const s = PZ.game.s;
    if (modal.isOpen) return;
    if (PZ.classes.canChooseClass(s) && !prompted.c) { prompted.c = true; openMain(); toast('Доступен выбор класса!'); }
    else if (PZ.classes.canChooseSub(s) && !prompted.s) { prompted.s = true; openMain(); toast('Доступен выбор подкласса!'); }
  }

  PZ.heroesUi = { init, build, update, suggestion, openHero, openMain, checkClassPrompt };
})(globalThis.PZ);
