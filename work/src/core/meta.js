/* M7: перерождение, осколки, постоянные реликвии; магазин свитков за золото (решение автора 03.11.2026).
   Перерождение — добровольно с этажа 400 (У). Сбрасывается забег; коллекция, ранги, звёзды, кости, реликвии, рекорд, свитки остаются (У).
   Осколки — формула tower_balance_v58.reward() (Т). Реликвии — GDD 9.3, цена Base×2^(n−1), до 10 уровней (П/Т). */
(function (PZ) {
  const B = PZ.B;
  // kind: mult — множитель v^уровень; add — +v за уровень; disc — скидка v за уровень (потолок 40%).
  const RELICS = [
    { id: 'heart', branch: 'Разрушение', name: 'Сердце разрушения', kind: 'mult', target: 'army', v: 1.25, base: 15, st: 'Т' },
    { id: 'seal', branch: 'Разрушение', name: 'Печать восхождения', kind: 'mult', target: 'army', v: 1.25, base: 20, st: 'Т' },
    { id: 'spark', branch: 'Разрушение', name: 'Искра Бездны', kind: 'mult', target: 'army', v: 1.20, base: 20, st: 'Т' },
    { id: 'blade', branch: 'Разрушение', name: 'Клинок вечности', kind: 'mult', target: 'boss', v: 1.10, base: 25, st: 'П' },
    { id: 'gold', branch: 'Богатство', name: 'Золотая печать', kind: 'mult', target: 'gold', v: 1.35, base: 10, st: 'Т' },
    { id: 'treasure', branch: 'Богатство', name: 'Сокровище Башни', kind: 'mult', target: 'goldBoss', v: 1.10, base: 15, st: 'П' },
    { id: 'merchant', branch: 'Богатство', name: 'Печать торговца', kind: 'disc', target: 'hire', v: 0.05, base: 20, st: 'П' },
    { id: 'alchemy', branch: 'Богатство', name: 'Алхимия золота', kind: 'mult', target: 'goldNormal', v: 1.10, base: 20, st: 'П' },
    { id: 'knowledge', branch: 'Мастерство', name: 'Древнее знание', kind: 'disc', target: 'level', v: 0.08, base: 15, st: 'Т' },
    { id: 'memory', branch: 'Мастерство', name: 'Память героев', kind: 'mult', target: 'heroes', v: 1.05, base: 20, st: 'П' },
    { id: 'exp', branch: 'Мастерство', name: 'Печать опыта', kind: 'mult', target: 'main', v: 1.05, base: 15, st: 'П' },
    { id: 'awaken', branch: 'Мастерство', name: 'Пробуждение силы', kind: 'mult', target: 'heroes200', v: 1.05, base: 25, st: 'П' },
    { id: 'hunter', branch: 'Восхождение', name: 'Охотник на хранителей', kind: 'mult', target: 'boss', v: 1.20, base: 20, st: 'Т' },
    { id: 'spirit', branch: 'Восхождение', name: 'Дух Башни', kind: 'disc', target: 'spawn', v: 0.05, base: 15, st: 'П' },
    { id: 'legacy', branch: 'Восхождение', name: 'Наследие цикла', kind: 'add', target: 'recordShards', v: 0.05, base: 25, st: 'П' },
    { id: 'ghosts', branch: 'Восхождение', name: 'Зов призраков', kind: 'add', target: 'ghost', v: 0.05, base: 20, st: 'П' },
  ];
  const BY = Object.fromEntries(RELICS.map(r => [r.id, r]));
  const M = B.meta = { rebirthFloor: 400, maxRelicLevel: 10, discountCap: 0.4, spawnCap: 0.5,
    scrollShop: { goldFloorsMult: 4, growth: 1.02 } };   // З, B-002: свиток = 4 × золото врага этажа × 1.02^(куплено в забеге)

  function lvl(s, id) { return (s.account.relics && s.account.relics[id]) || 0; }
  function mult(s, target) {
    let m = 1;
    for (const r of RELICS) if (r.kind === 'mult' && r.target === target) m *= Math.pow(r.v, lvl(s, r.id));
    return m;
  }
  function discount(s, target) {
    let d = 0;
    for (const r of RELICS) if (r.kind === 'disc' && r.target === target) d += r.v * lvl(s, r.id);
    return Math.min(target === 'spawn' ? M.spawnCap : M.discountCap, d);
  }
  function add(s, target) { let a = 0; for (const r of RELICS) if (r.kind === 'add' && r.target === target) a += r.v * lvl(s, r.id); return a; }
  function relicCost(id, level) { return BY[id].base * Math.pow(2, level); }   // цена следующего уровня (level = текущий)
  function buyRelic(s, id) {
    const r = BY[id]; if (!r) return { ok: false, err: 'Нет такой реликвии' };
    const l = lvl(s, id);
    if (l >= M.maxRelicLevel) return { ok: false, err: 'Максимальный уровень' };
    const c = relicCost(id, l);
    if (s.account.shards < c) return { ok: false, err: 'Не хватает осколков (' + s.account.shards + ' из ' + c + ')' };
    s.account.shards -= c;
    s.account.relics = s.account.relics || {};
    s.account.relics[id] = l + 1;
    return { ok: true, level: l + 1, cost: c };
  }
  function effectText(r, level) {
    const n = Math.max(1, level);
    const pct = x => '+' + Math.round(x * 100) + '%';
    const T = { army: 'урон армии', boss: 'урон по боссам', gold: 'золото', goldBoss: 'золото с боссов', goldNormal: 'золото с обычных', heroes: 'базовый урон героев', main: 'урон Призванного', heroes200: 'урон героев 200+ ур.', hire: 'цена найма', level: 'цена уровней', spawn: 'пауза между врагами', recordShards: 'осколки за новые рекорды', ghost: 'призрачные награды (механики пока нет)' };
    if (r.kind === 'mult') return T[r.target] + ' ×' + Math.pow(r.v, n).toFixed(2);
    if (r.kind === 'disc') return T[r.target] + ' −' + Math.round(Math.min(r.v * n, r.target === 'spawn' ? M.spawnCap : M.discountCap) * 100) + '%';
    return T[r.target] + ' ' + pct(r.v * n);
  }

  // --- Перерождение ---
  function canRebirth(s) { return s.run.cleared >= M.rebirthFloor; }
  function shardsPreview(s) {
    const old = s.run.startRecord || 0, reached = s.run.cleared;
    const base = B.rebirthShards(old, reached);
    if (!base) return 0;
    const repeat = 35, record = base - repeat;                 // часть «за рекорды» усиливает Наследие цикла
    return repeat + Math.round(record * (1 + add(s, 'recordShards')));
  }
  function rebirth(s) {
    if (!canRebirth(s)) return { ok: false, err: 'Перерождение доступно с этажа ' + M.rebirthFloor + ' (пройдено ' + s.run.cleared + ')' };
    const shards = shardsPreview(s);
    const a = s.account;
    a.shards = (a.shards || 0) + shards;
    a.rebirths = (a.rebirths || 0) + 1;
    a.rebirthLog = (a.rebirthLog || []).concat([{ n: a.rebirths, floor: s.run.cleared, shards, at: Date.now() }]).slice(-50);
    const speed = a.settings.speed;
    s.run = PZ.state.newRun();
    s.run.startRecord = a.record;
    a.settings.speed = speed;
    PZ.combat.events.push({ t: 'rebirth', shards });
    return { ok: true, shards };
  }

  // --- Магазин свитков за золото ---
  function scrollPrice(s, n) {
    const S = M.scrollShop, f = Math.max(1, s.run.cleared + 1);
    let total = 0, k = s.run.scrollsBought || 0;
    for (let i = 0; i < n; i++) total += Math.ceil(S.goldFloorsMult * B.enemyGold(f) * Math.pow(S.growth, k + i));
    return total;
  }
  function buyScrolls(s, n) {
    if (!(n >= 1 && n <= 10)) return { ok: false, err: 'Можно 1–10' };
    const c = scrollPrice(s, n);
    if (!PZ.state.spendGold(s, c)) return { ok: false, err: 'Мало золота' };
    PZ.portal.ensure(s);
    s.account.scrolls += n;
    s.run.scrollsBought = (s.run.scrollsBought || 0) + n;
    return { ok: true, cost: c };
  }

  function validate(s, errs) {
    for (const [id, l] of Object.entries(s.account.relics || {})) if (!BY[id] || !(Number.isInteger(l) && l >= 0 && l <= M.maxRelicLevel)) errs.push('relic ' + id);
    if (!(Number.isInteger(s.account.shards) && s.account.shards >= 0)) errs.push('shards');
  }

  PZ.relics = { RELICS, BY, lvl, mult, discount, add, relicCost, buyRelic, effectText };
  PZ.meta = { canRebirth, shardsPreview, rebirth, scrollPrice, buyScrolls, validate };
})(globalThis.PZ = globalThis.PZ || {});
