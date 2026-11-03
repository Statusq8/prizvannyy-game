/* Экран «Бой» по эталонному скриншоту 03.11.2026: сцена на весь экран, враг по центру, Призванный со спины внизу,
   4 места отряда (фланги и передний ряд) — силуэты, пока у героя нет арта. Прокачка — в шторке. */
(function (PZ) {
  const { $, fmt, h, img, heroArt, setBtn, player } = PZ.ui;
  const A = PZ.A, B = PZ.B;
  const ROLES = ['УБИЙЦА', 'МАГ', 'ТАНК', 'ПОДДЕРЖКА'];   // 4 места (решение автора 03.11.2026, MASTER 1.2)
  const fr = (en, k) => A['z' + en.zone + '_m' + en.mob + '_' + k];

  let mainP = null, fxs = [], lastNow = 0, el = {}, shown = { key: '', en: null, dyingUntil: 0 }, slotKey = '', units = [], lastHp = null, dmgAcc = 0, dmgT = 0, lastDps = -1, zoneShown = 0, mAtkT = 2;

  function init() {
    el = {
      scene: $('#scene'), bg: $('#bg'), enemy: $('#enemy'), espr: $('#enemy img'), main: $('#main'), mspr: $('#main img'),
      floorlbl: $('#floorlbl'), floortag: $('#floortag'), ename: $('#enemyname'), hpfill: $('#hpfill'), hplag: $('#hplag'),
      hptext: $('#hptext'), waves: $('#waves'), timer: $('#timer'), dps: $('#dps'), tap: $('#tapdmg'),
      speed: $('#btn-speed'), auto: $('#btn-auto'), up: $('#btn-up'), drawer: $('#drawer'), quick: $('#quick'),
      slots: [...document.querySelectorAll('#scene .slot')],
    };
    $('#hpframe').src = A.bar_hp;
    const mart = heroArt('main');
    if (mart.anim) mainP = player(el.mspr, mart.anim.idle, 5); else el.mspr.src = mart.back;
    el.main.classList.toggle('framed', !!mart.anim);
    $('#ico-speed').src = A.ico_speed; $('#ico-auto').src = A.ico_time; $('#ico-up').src = A.ico_upgrade;
    for (const [i, n] of el.slots.entries()) { n.append(img(heroArt(null, i).back, 'spr'), h('div', { class: 'en' }, h('i')), h('span', { class: 'nm' }, ROLES[i])); n.className = 'slot sil empty'; }
    el.scene.addEventListener('pointerdown', onTap);
    el.speed.addEventListener('click', () => {
      const s = PZ.game.s, order = s.account.settings.tester ? PZ.tester.SPEEDS : [1, 2, 4];
      s.account.settings.speed = order[(Math.max(0, order.indexOf(s.account.settings.speed)) + 1) % order.length]; render(0);
    });
    el.auto.addEventListener('click', () => {
      const s = PZ.game.s;
      if (PZ.combat.isFarming(s)) { PZ.combat.goToRecord(s); PZ.ui.toast('Вперёд к рекорду'); }
      else { s.run.autoAdvance = !s.run.autoAdvance; PZ.ui.toast(s.run.autoAdvance ? 'Автоподъём включён' : 'Автоподъём выключен: фарм этажа'); }
      render(0);
    });
    el.up.addEventListener('click', () => toggleDrawer());
    $('#drawer-handle').addEventListener('click', () => toggleDrawer(false));
    units = [{ id: 'main', cd: 0.6 }];
    buildQuick();
  }
  const full = () => (PZ.game.s.account.settings.effects || 'full') === 'full';
  const au = (k, a) => PZ.audio && PZ.audio[k] && PZ.audio[k](a);
  function sparks(x, y, color) {
    if (!full()) return;
    for (let i = 0; i < 7; i++) { const p = h('div', { class: 'fx spark' }); const a = Math.random() * Math.PI * 2, r = 20 + Math.random() * 40;
      Object.assign(p.style, { left: x + 'px', top: y + 'px', background: color || '#ffe7b0', '--dx': Math.cos(a) * r + 'px', '--dy': Math.sin(a) * r + 'px' }); el.scene.append(p); setTimeout(() => p.remove(), 420); }
  }
  function shake() { if (!full()) return; el.scene.classList.remove('shake'); void el.scene.offsetWidth; el.scene.classList.add('shake'); }
  function toggleDrawer(v) { const open = v === undefined ? !el.drawer.classList.contains('open') : v; el.drawer.classList.toggle('open', open); if (open) renderQuick(true); }

  // --- тап: удар Призванного (урон + анимация) ---
  function onTap(e) {
    if (e.target.closest('button') || e.target.closest('#drawer')) return;
    const s = PZ.game.s;
    const dealt = PZ.combat.tap(s);
    strike(); au('hit');
    if (dealt > 0) {
      const r = el.scene.getBoundingClientRect();
      fxText(fmt(dealt), 'tap', e.clientX - r.left, e.clientY - r.top - 10);
      const c = enemyCenter(); sparks(c.x + (Math.random() - .5) * c.w * .3, c.y, '#ffe08a');
      lastHp = s.run.battle ? s.run.battle.hp : null;
      hurt();
    }
  }
  // Удар Призванного: кадры замаха/удара + вспышка удара прямо на враге (без летящих снарядов — концепт).
  function strike(big) {
    au('slash');
    const an = heroArt('main').anim;
    if (mainP && an) mainP.play(an.attack, 34);
    else { el.main.classList.remove('strike'); void el.main.offsetWidth; el.main.classList.add('strike'); }
    setTimeout(() => hitFx(an && (big ? an.crit : an.hit), big ? 1.0 : 0.75), 170);
  }
  // VFX-кадры поверх врага (листы на чёрном → режим наложения screen).
  function vfx(seq, x, y, size, fps, filter) {
    if (!seq || !seq.length || !full()) return;
    const n = img(seq[0], 'fx vfx'); Object.assign(n.style, { left: x + 'px', top: y + 'px', width: size + 'px', height: size + 'px' });
    if (filter) n.style.filter = filter;
    el.scene.append(n);
    const p = player(n, null, fps); p.play(seq, fps, () => n.remove()); fxs.push(p);
  }
  function hitFx(seq, scale, filter) {
    const c = enemyCenter();
    if (seq) vfx(seq, c.x + (Math.random() - .5) * c.w * .25, c.y + (Math.random() - .5) * c.h * .2, Math.max(c.w, c.h) * (scale || .75), 40, filter);
    else { const sl = h('div', { class: 'fx slash' }); Object.assign(sl.style, { left: c.x + 'px', top: c.y + 'px', width: c.w * 0.6 + 'px', height: c.h * 0.4 + 'px' }); el.scene.append(sl); setTimeout(() => sl.remove(), 300); }
  }

  function fxText(t, cls, x, y) {
    const d = h('div', { class: 'fx dmg ' + (cls || '') }, t);
    d.style.left = x + 'px'; d.style.top = y + 'px';
    el.scene.append(d); setTimeout(() => d.remove(), 950);
  }
  function enemyCenter() {
    const sr = el.scene.getBoundingClientRect(), er = el.espr.getBoundingClientRect();
    return { x: er.left - sr.left + er.width / 2, y: er.top - sr.top + er.height * 0.5, w: er.width || 200, h: er.height || 150 };
  }
  let hurtT = 0;
  function hurt() {
    if (!shown.en || el.enemy.classList.contains('dead')) return;
    el.enemy.classList.remove('hurt'); void el.enemy.offsetWidth; el.enemy.classList.add('hurt');
    el.espr.src = fr(shown.en, 'hurt');
    clearTimeout(hurtT); hurtT = setTimeout(() => { el.enemy.classList.remove('hurt'); if (shown.en && !el.enemy.classList.contains('dead')) el.espr.src = fr(shown.en, 'idle'); }, 170);
  }
  function enemyAttack() {
    if (!shown.en || el.enemy.classList.contains('dead')) return;
    el.enemy.classList.remove('atk'); void el.enemy.offsetWidth; el.enemy.classList.add('atk');
    el.espr.src = fr(shown.en, 'attack');
    setTimeout(() => { el.enemy.classList.remove('atk'); if (shown.en && !el.enemy.classList.contains('dead')) el.espr.src = fr(shown.en, 'idle'); }, 430);
  }

  // --- отряд: 5 мест, герои занимают их по силе; без арта — силуэт ---
  function setSlots(s) {
    const vis = PZ.heroes.visibleAllies(s);
    const key = vis.join(',');
    if (key === slotKey) return;
    slotKey = key;
    units = units.filter(u => u.id === 'main');
    el.slots.forEach((n, i) => {
      const id = vis[i], art = heroArt(id || null, i);
      n.className = 'slot ' + (id ? 'busy' : 'empty') + (id && art.real ? '' : ' sil');
      const spr = n.querySelector('.spr');
      spr.src = art.back;
      n.querySelector('.nm').textContent = id ? PZ.HERO_BY_ID[id].name.toUpperCase() : ROLES[i];
      n.title = id ? PZ.HERO_BY_ID[id].name : '';
      n.classList.toggle('framed', !!(id && art.anim));
      if (id) units.push({ id, slot: i, node: n, art, bar: n.querySelector('.en i'), lastE: (PZ.game.s.run.energy || {})[id] || 0,
        p: art.anim ? player(spr, art.anim.idle, 6) : null });
    });
  }
  // Тон вспышки для героев без своих VFX: общий удар Призванного, перекрашенный под роль места.
  const TINT = ['hue-rotate(-60deg) saturate(1.4)', 'none', 'hue-rotate(160deg)', 'hue-rotate(90deg)'];
  const genericFx = () => heroArt('main').anim || {};
  function allyAttack(u) {
    const an = u.art.anim;
    if (u.p && an) u.p.play(an.attack, 12);
    else { u.node.classList.remove('lunge'); void u.node.offsetWidth; u.node.classList.add('lunge'); }
    if (!full()) return;
    au('slash');
    setTimeout(() => hitFx(an ? an.hit : genericFx().hit, .55, an ? null : TINT[u.slot]), 160);
  }
  // Ульта: кадры ульты у героя, большая вспышка на враге, крупная цифра урона.
  let ultT = 0;
  function allyUlt(id, dmg) {
    const u = units.find(x => x.id === id), hero = PZ.HERO_BY_ID[id], now = performance.now();
    // на ×10/×50 ульт много — показываем не чаще раза в 0,45 с, иначе экран превращается в кашу
    if (!u && now - ultT < 450) return;
    if (u && now - ultT < 200) return;
    ultT = now;
    const an = u ? u.art.anim : heroArt(id).anim, c = enemyCenter();
    if (u && u.p && an) u.p.play(an.ult, 12);
    if (u) { u.node.classList.remove('ultflash'); void u.node.offsetWidth; u.node.classList.add('ultflash'); }
    au('kill', true);
    setTimeout(() => {
      hitFx(an ? an.ultFx : genericFx().crit, 1.25, an ? null : TINT[u ? u.slot : 1]);
      fxText(fmt(dmg), 'ult', c.x, c.y - c.h * 0.1);
      if (full() && PZ.game.s.account.settings.speed <= 4) shake();
    }, an ? 380 : 120);
    const sw = el.scene.clientWidth || 390;
    if (hero) fxText('УЛЬТА · ' + hero.name, 'ultname', Math.min(sw * 0.7, Math.max(sw * 0.3, c.x)), c.y - c.h * 0.42);
  }

  function showEnemy(b, now) {
    const key = b.floor + ':' + b.idx;
    if (now < shown.dyingUntil || b.spawnWait > 0 || shown.key === key) return;
    const en = PZ.enemyOf(b.floor, b.idx, b.boss);
    shown.key = key; shown.en = en;
    el.enemy.className = 'unit spawn' + (en.boss ? ' boss' : '') + (en.mini ? ' miniboss' : '');
    el.espr.src = fr(en, 'idle');
    el.ename.textContent = en.name;
    lastHp = b.hp; mAtkT = 1.5 + Math.random();
    if (en.boss && b.idx === 0) { au('bossStart'); if (full()) { el.scene.classList.remove('bossflash'); void el.scene.offsetWidth; el.scene.classList.add('bossflash'); } }
    setTimeout(() => el.enemy.classList.remove('spawn'), 460);
  }
  function setZone(f) {
    const z = Math.floor((f - 1) / 50) % 12 + 1;
    if (z !== zoneShown) { zoneShown = z; el.bg.style.backgroundImage = `url(${A['z' + z + '_bg']})`; if (PZ.audio) PZ.audio.setZone(z); }
  }

  function onEvent(e, now) {
    const s = PZ.game.s;
    if (e.t === 'kill') {
      const en = PZ.enemyOf(e.floor, e.idx, e.boss);
      el.enemy.className = 'unit dead' + (en.boss ? ' boss' : '');
      el.espr.src = fr(en, 'death');
      shown.dyingUntil = now + 700; shown.key = ''; shown.en = null;
      const c = enemyCenter();
      fxText('+' + fmt(e.gold), 'gold', c.x, c.y - c.h * 0.25);
      au('kill', !!e.boss); au('coin'); if (e.boss) { shake(); sparks(c.x, c.y, '#ff8aa0'); sparks(c.x, c.y, '#c58bff'); }
    } else if (e.t === 'floor' && e.isNew && e.boss) banner('Босс повержен!');
    else if (e.t === 'floor' && e.isNew && e.floor === PZ.B.meta.rebirthFloor) banner('Доступно перерождение!');
    else if (e.t === 'floor' && e.isNew && e.floor % 50 === 0) banner('Новая зона!');
    else if (e.t === 'bone') {
      const c = enemyCenter(), d = h('div', { class: 'dropfx' }, img(PZ.bonesUi.qGem(e.quality)), 'Кость: ' + PZ.bones.SLOT_NAME[e.slot].toLowerCase() + ' · ' + PZ.bones.QUALITY[e.quality - 1]);
      d.style.left = c.x + 'px'; d.style.top = (c.y + c.h * 0.15) + 'px'; el.scene.append(d); setTimeout(() => d.remove(), 1850); au('bone');
    }
    else if (e.t === 'reward') {
      const parts = []; const N = { scrolls: 'свит.', essence: 'эссенц.', core: 'ядро', seal: 'печать' };
      for (const [k, v] of Object.entries(e.got)) parts.push('+' + v + ' ' + N[k]);
      const d = h('div', { class: 'rewardfx' }, img(A.ico_crystal), parts.join(' · ')); el.scene.append(d); setTimeout(() => d.remove(), 2300); au('reward');
    }
    else if (e.t === 'ult') allyUlt(e.id, e.dmg);
    else if (e.t === 'rebirth') { banner('Перерождение! +' + e.shards + ' осколков'); au('fanfare'); }
    else if (e.t === 'bossFail') { banner('Босс устоял — фарм этажа ' + (s.run.farmFloor || 1), 'bad'); au('fail'); }
  }
  function banner(t, cls) { const b = h('div', { class: 'banner ' + (cls || '') }, t); el.scene.append(b); setTimeout(() => b.remove(), 1700); }

  function render(dt) {
    const s = PZ.game.s, b = PZ.combat.ensureBattle(s), now = performance.now();
    const rdt = lastNow ? Math.min(0.1, (now - lastNow) / 1000) : 0; lastNow = now;   // реальное время для кадров (не зависит от ×скорости)
    if (mainP) mainP.tick(rdt);
    for (const u of units) if (u.p) u.p.tick(rdt);
    for (let i = fxs.length - 1; i >= 0; i--) { fxs[i].tick(rdt); if (!fxs[i].img.isConnected) fxs.splice(i, 1); }
    const ev = PZ.combat.events; while (ev.length) onEvent(ev.shift(), now);
    setZone(b.floor); setSlots(s); showEnemy(b, now);

    const farming = PZ.combat.isFarming(s);
    el.floorlbl.textContent = 'ЭТАЖ ' + b.floor;
    const tag = b.boss ? (b.floor === 400 ? 'ХРАНИТЕЛЬ' : b.boss === 'boss50' ? 'БОСС ЗОНЫ' : b.boss === 'boss25' ? 'ПОЛУБОСС' : 'БОСС') : farming ? 'ФАРМ' : '';
    el.floortag.hidden = !tag; el.floortag.textContent = tag; el.floortag.className = 'tag ' + (b.boss ? 'boss' : farming ? 'farm' : '');
    const frac = b.spawnWait > 0 ? 0 : Math.max(0, b.hp / b.maxHp);
    el.hpfill.style.transform = `scaleX(${frac})`; el.hplag.style.transform = `scaleX(${frac})`;
    el.hptext.textContent = b.spawnWait > 0 ? '' : fmt(Math.ceil(b.hp)) + ' / ' + fmt(b.maxHp);
    if (el.waves.childElementCount !== b.count) { el.waves.innerHTML = ''; for (let i = 0; i < b.count; i++) el.waves.append(h('i')); }
    [...el.waves.children].forEach((w, i) => { w.className = i < b.idx ? 'done' : i === b.idx ? 'cur' : ''; });
    el.waves.hidden = b.count < 2;
    el.timer.hidden = b.timer === null;
    if (b.timer !== null) { el.timer.textContent = '⏳ ' + b.timer.toFixed(1) + ' с'; el.timer.classList.toggle('low', b.timer < 8); }
    const dps = PZ.heroes.armyDps(s, b.boss ? 'boss' : 'normal');
    if (dps !== lastDps) { el.dps.textContent = fmt(dps); lastDps = dps; }
    el.tap.textContent = fmt(PZ.heroes.mainDps(s) * B.main.tapFactor);
    el.speed.lastChild.textContent = '×' + s.account.settings.speed;
    el.auto.classList.toggle('off', !s.run.autoAdvance && !farming);
    el.auto.lastChild.textContent = farming ? 'К РЕКОРДУ' : s.run.autoAdvance ? 'АВТО' : 'СТОП';

    const live = dt > 0 && b.spawnWait <= 0 && now >= shown.dyingUntil && shown.key === b.floor + ':' + b.idx;
    if (live && lastHp !== null) {
      const lost = lastHp - b.hp; if (lost > 0) dmgAcc += lost;
      dmgT += dt;
      if (dmgT > 0.45 && dmgAcc > 0 && !full()) { dmgAcc = 0; dmgT = 0; hurt(); }
      if (dmgT > 0.45 && dmgAcc > 0) { const c = enemyCenter(); fxText(fmt(dmgAcc), '', c.x + (Math.random() - .5) * c.w * .5, c.y + (Math.random() - .5) * c.h * .3); dmgAcc = 0; dmgT = 0; hurt(); }
    }
    lastHp = b.hp;
    if (live) {
      const sp = s.account.settings.speed;
      for (const u of units) {
        if (u.id === 'main') { u.cd -= dt * sp; if (u.cd <= 0) { u.cd = 1.3 + Math.random() * 0.5; strike(); } continue; }
        // удар союзника = прирост энергии на одну атаку (+10): анимация совпадает с полоской
        const e = (s.run.energy || {})[u.id] || 0, per = (PZ.HERO_BY_ID[u.id].ult || B.ult.default).perAttack;
        if (e > u.lastE && Math.floor(e / per) > Math.floor(u.lastE / per)) allyAttack(u);
        u.lastE = e;
      }
      mAtkT -= dt * sp; if (mAtkT <= 0) { mAtkT = 2.2 + Math.random() * 1.2; enemyAttack(); }
    }
    for (const u of units) if (u.bar) {
      const e = (s.run.energy || {})[u.id] || 0, max = (PZ.HERO_BY_ID[u.id].ult || B.ult.default).energy, f = Math.min(1, e / max);
      if (u.bf !== f) { u.bar.style.transform = `scaleX(${f})`; u.bf = f; u.node.classList.toggle('charged', f >= 0.9); }
    }
    renderQuick();
  }

  // --- шторка «Усиление» ---
  let q = {};
  function buildQuick() {
    const mode = h('div', { class: 'mode' });
    for (const [m, t] of [[1, '×1'], [10, '×10'], ['max', 'Макс']]) mode.append(h('button', { 'data-m': m, onclick: () => { PZ.game.mode = m; renderQuick(true); } }, t));
    q.mainBtn = h('button', { class: 'btn', onclick: () => { const r = PZ.heroes.mainLevelUp(PZ.game.s, PZ.game.mode); if (!r.ok) PZ.ui.toast(r.err); renderQuick(true); } });
    q.mainInfo = h('div', { class: 'info' });
    q.heroBtn = h('button', { class: 'btn gold' });
    q.heroInfo = h('div', { class: 'info' });
    q.heroPic = h('div', { class: 'pic sil' });
    q.mode = mode;
    el.quick.append(
      h('div', { class: 'row', style: 'margin-bottom:6px' }, h('b', { style: 'flex:1' }, 'Усиление'), mode),
      h('div', { class: 'card', style: 'margin-bottom:6px' }, h('div', { class: 'pic' }, img(heroArt('main').pic)), q.mainInfo, q.mainBtn),
      h('div', { class: 'card' }, q.heroPic, q.heroInfo, q.heroBtn));
  }
  let qT = 0;
  function renderQuick(force) {
    const now = performance.now(); if (!force && now - qT < 200) return; qT = now;
    const s = PZ.game.s, m = PZ.game.mode;
    const mb = PZ.heroes.mainBatch(s, m, s.run.gold);
    const mcost = mb.levels ? mb.cost : PZ.B.mainLevelCost(s.run.mainLevel);
    const sug = PZ.heroesUi.suggestion(s, m);
    $('#up-dot').hidden = !(s.run.gold >= mcost || (sug && s.run.gold >= sug.cost));
    if (!el.drawer.classList.contains('open') && !force) return;
    [...q.mode.children].forEach(b => b.classList.toggle('on', String(m) === b.dataset.m));
    q.mainInfo.innerHTML = '';
    q.mainInfo.append(h('div', { class: 't' }, 'Призванный · ур. ' + s.run.mainLevel), h('div', { class: 's' }, (s.account.mainClass ? PZ.classes.title(s) + ' · ' : '') + 'урон ' + fmt(PZ.heroes.mainDps(s)) + '/с'));
    setBtn(q.mainBtn, 'Ур. +' + (mb.levels || 1), '🪙 ' + fmt(mcost), s.run.gold < mcost);
    const sugKey = sug ? sug.id + (sug.hire ? 'h' : 'l') : '';
    const infoText = sug ? (sug.hire ? 'Найм · ' + fmt(PZ.HERO_BY_ID[sug.id].dps) + '/с' : 'Ур. ' + s.run.hired[sug.id] + ' · ' + fmt(PZ.heroes.personalDps(sug.id, s.run.hired[sug.id], PZ.heroes.heroStars(s, sug.id))) + '/с') : '';
    if (q.sugKey === sugKey) {
      if (q.infoS && q.infoS.textContent !== infoText) q.infoS.textContent = infoText;
      if (sug) { setBtn(q.heroBtn, sug.hire ? 'Нанять' : 'Ур. +' + sug.levels, '🪙 ' + fmt(sug.cost), s.run.gold < sug.cost); q.sug = sug; }
      return;
    }
    q.sugKey = sugKey;
    q.heroPic.innerHTML = ''; q.heroInfo.innerHTML = '';
    if (!sug) { q.heroInfo.append(h('div', { class: 't' }, 'Все герои наняты')); q.heroBtn.hidden = true; return; }
    q.heroBtn.hidden = false;
    const hero = PZ.HERO_BY_ID[sug.id], art = heroArt(sug.id);
    q.heroPic.className = 'pic' + (art.real ? '' : ' sil');
    q.heroPic.append(img(art.pic), img(PZ.ui.gem(hero.rarity), 'gem'));
    q.infoS = h('div', { class: 's' }, infoText);
    q.heroInfo.append(h('div', { class: 't' }, hero.name), q.infoS);
    setBtn(q.heroBtn, sug.hire ? 'Нанять' : 'Ур. +' + sug.levels, '🪙 ' + fmt(sug.cost), s.run.gold < sug.cost);
    q.sug = sug;
    q.heroBtn.onclick = e => { e.stopPropagation(); const g = q.sug, mm = PZ.game.mode; const r = g.hire ? PZ.heroes.hire(s, g.id) : PZ.heroes.levelUp(s, g.id, mm); if (!r.ok) PZ.ui.toast(r.err); renderQuick(true); };
  }

  PZ.battleUi = { init, render, renderQuick, toggleDrawer, strike };
})(globalThis.PZ);
