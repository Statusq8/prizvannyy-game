/* M6 Портал и звёзды. Шансы, гарантии, фрагменты и цены звёзд — 1:1 с legacy/python/portal_v01.py и stars.py (Т).
   Решение автора 03.11.2026: герои E–D доступны сразу, C и выше — только из портала. SS/БОГ не выпадают до рекорда 1000/4000.
   Источники свитков и материалов не определены в GDD — временные награды за первое прохождение боссов в забеге (З). */
(function (PZ) {
  const B = PZ.B;
  const ORDER = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'БОГ'];
  const P = B.portal = {
    rates: { E: .45, D: .30, C: .15, B: .07, A: .025, S: .0045, SS: .00045, 'БОГ': .00005 },   // Т
    shards: { E: 1, D: 2, C: 5, B: 12, A: 30, S: 100, SS: 350, 'БОГ': 1000 },                 // Т
    pityA: 100, pityS: 500,                                                                     // Т
    startScrolls: 10,                                                                           // З
    rewards: { boss10: { scrolls: 2, essence: 3 }, boss25: { scrolls: 3, essence: 5 }, boss50: { scrolls: 8, essence: 5, core: 1 }, every200: { seal: 1 } }, // З
  };
  const S = B.stars = {
    max: 15,
    fragments: [20, 40, 80, 120, 180, 260, 360, 480, 650, 850, 1100, 1450, 1900, 2500],
    essence: [0, 0, 0, 5, 10, 20, 35, 50, 0, 0, 0, 0, 0, 0],
    core: [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 5, 8, 12],
    seal: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3],
  };
  const STARTING_RANKS = ['E', 'D'];

  function ensure(s) {
    const a = s.account;
    a.stars = a.stars || {}; a.fragments = a.fragments || {};
    a.materials = Object.assign({ essence: 0, core: 0, seal: 0 }, a.materials || {});
    if (!Number.isInteger(a.scrolls)) a.scrolls = 0;
    a.pity = Object.assign({ sinceA: 0, sinceS: 0, total: 0 }, a.pity || {});
    return a;
  }

  function availableRates(record) {
    const r = {}; let t = 0;
    for (const k of ORDER) if (record >= (B.heroes.gates[k] || 0)) { r[k] = P.rates[k]; t += P.rates[k]; }
    for (const k in r) r[k] /= t;
    return r;
  }
  function drawRarity(s) {
    const a = s.account, rates = availableRates(a.record);
    let choices = Object.keys(rates);
    if (a.pity.sinceS + 1 >= P.pityS) choices = choices.filter(k => ORDER.indexOf(k) >= ORDER.indexOf('S'));
    else if (a.pity.sinceA + 1 >= P.pityA) choices = choices.filter(k => ORDER.indexOf(k) >= ORDER.indexOf('A'));
    const tot = choices.reduce((x, k) => x + rates[k], 0);
    let x = PZ.bones.rand(s) * tot;
    for (const k of choices) { x -= rates[k]; if (x < 0) return k; }
    return choices[choices.length - 1];
  }

  // Призыв: всё проверяется до списания; гейт проверяется ДО выбора героя (GDD 7.1).
  function summon(s, count) {
    const a = ensure(s);
    if (!(count >= 1 && count <= 10)) return { ok: false, err: 'Можно 1–10 призывов' };
    if (a.scrolls < count) return { ok: false, err: 'Не хватает свитков (' + a.scrolls + ' из ' + count + ')' };
    const out = [];
    for (let i = 0; i < count; i++) {
      const rank = drawRarity(s);
      const pool = PZ.HEROES.filter(h => h.rarity === rank && PZ.heroes.canObtain(s, h.id));
      const hero = pool[Math.floor(PZ.bones.rand(s) * pool.length)];
      const dup = !!a.owned[hero.id];
      if (dup) a.fragments[hero.id] = (a.fragments[hero.id] || 0) + P.shards[rank];
      else { a.owned[hero.id] = true; a.stars[hero.id] = a.stars[hero.id] || 1; }
      a.scrolls -= 1; a.pity.total++;
      a.pity.sinceA = ORDER.indexOf(rank) >= ORDER.indexOf('A') ? 0 : a.pity.sinceA + 1;
      a.pity.sinceS = ORDER.indexOf(rank) >= ORDER.indexOf('S') ? 0 : a.pity.sinceS + 1;
      out.push({ id: hero.id, rarity: rank, duplicate: dup, fragments: dup ? P.shards[rank] : 0 });
    }
    return { ok: true, results: out };
  }

  // --- Звёзды 1–15 (постоянные) ---
  function starsOf(s, id) { return (s.account.stars && s.account.stars[id]) || 1; }
  function starCost(cur) { if (!(cur >= 1 && cur < S.max)) return null; const i = cur - 1; return { fragments: S.fragments[i], essence: S.essence[i], core: S.core[i], seal: S.seal[i] }; }
  function canAscend(s, id) {
    const a = ensure(s);
    if (!a.owned[id]) return { ok: false, err: 'Герой не получен' };
    const cur = starsOf(s, id), c = starCost(cur);
    if (!c) return { ok: false, err: 'Максимум звёзд' };
    if ((a.fragments[id] || 0) < c.fragments) return { ok: false, err: 'Не хватает фрагментов', cost: c };
    for (const k of ['essence', 'core', 'seal']) if (a.materials[k] < c[k]) return { ok: false, err: 'Не хватает: ' + MAT[k], cost: c };
    return { ok: true, cost: c };
  }
  const MAT = { essence: 'эссенция', core: 'ядро', seal: 'печать' };
  function ascend(s, id) {
    const c = canAscend(s, id); if (!c.ok) return c;
    const a = s.account;
    a.fragments[id] -= c.cost.fragments;
    for (const k of ['essence', 'core', 'seal']) a.materials[k] -= c.cost[k];
    a.stars[id] = starsOf(s, id) + 1;
    return { ok: true, stars: a.stars[id], mult: B.starMult(a.stars[id]) };
  }

  // Награды за первое прохождение этажа в забеге (вызывается из combat.onFloorCleared).
  function onFirstClear(s, f) {
    const a = ensure(s), k = B.bossKind(f), got = {};
    const add = (r) => { for (const [x, v] of Object.entries(r)) { if (x === 'scrolls') a.scrolls += v; else a.materials[x] += v; got[x] = (got[x] || 0) + v; } };
    if (k) add(P.rewards[k]);
    if (f % 200 === 0) add(P.rewards.every200);
    return Object.keys(got).length ? got : null;
  }

  function startingOwned(a) {
    for (const h of PZ.HEROES) if (STARTING_RANKS.includes(h.rarity)) { a.owned[h.id] = true; }
  }

  function validate(s, errs) {
    const a = s.account;
    if (a.scrolls !== undefined && !(Number.isInteger(a.scrolls) && a.scrolls >= 0)) errs.push('scrolls');
    for (const [id, n] of Object.entries(a.stars || {})) if (!PZ.HERO_BY_ID[id] || !(Number.isInteger(n) && n >= 1 && n <= 15)) errs.push('stars ' + id);
    for (const [id, n] of Object.entries(a.fragments || {})) if (!PZ.HERO_BY_ID[id] || !(Number.isInteger(n) && n >= 0)) errs.push('frag ' + id);
    for (const id of Object.keys(a.owned || {})) if (!PZ.heroes.canObtain(s, id)) errs.push('owned gated ' + id);
  }

  PZ.portal = { ORDER, availableRates, summon, starsOf, starCost, canAscend, ascend, onFirstClear, startingOwned, validate, ensure, MAT, STARTING_RANKS };
})(globalThis.PZ = globalThis.PZ || {});
