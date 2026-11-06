  // ==== src/core/10_summon.js — Призыв: портал, баннеры, гарантии, звёзды, материалы и эволюция ====
  // ---------- портал, звёзды, отряд ----------
  function ticketsForFloor(f) {
    const p = CONFIG.portal;
    return f % 10 === 0 ? p.ticketsPerTenth : f % 5 === 0 ? p.ticketsPerFifth : 0;
  }
  const RANK = r => CONFIG.rarities.indexOf(r);
  // Редкость открыта по рекорду этажа (GDD 1.2): SS ≥ 1000, SSS ≥ 2500, GOD ≥ 4000
  function rarityOpen(s, r) { const g = CONFIG.rarityGates[r]; return !g || (s.bestFloor | 0) >= g; }
  function tierOpen(s, i) { return rarityOpen(s, CONFIG.rarities[i]); }
  function rollRarity(s, minRank, sPity) {
    const P = CONFIG.portal, odds = { ...P.odds };
    if (sPity != null && sPity > P.softS) odds.S += (sPity - P.softS) * P.softStep;   // возрастающие шансы
    let pool = CONFIG.rarities.filter(r => RANK(r) >= minRank && rarityOpen(s, r) && CONFIG.allies.some(a => a.rarity === r && !a.hidden && !a.seasonal));
    if (!pool.length) pool = ['S'];
    const total = pool.reduce((x, r) => x + odds[r], 0);
    let roll = s.rng() * total;
    for (const r of pool) { roll -= odds[r]; if (roll < 0) return r; }
    return pool[pool.length - 1];
  }
  function bannerDef(id) { return CONFIG.portal.banners.find(b => b.id === id); }
  // Герои недели тематического баннера (A и S из портала, по кругу по номеру недели)
  function featuredHeroes(s) {
    const pool = CONFIG.allies.filter(a => !a.hidden && !a.seasonal && RANK(a.rarity) >= RANK('A'));
    const w = s.event && s.event.week ? weekNum(s.event.week) : 0, n = bannerDef('theme').featured, out = [];
    for (let i = 0; i < n; i++) out.push(pool[(((w * n + i) % pool.length) + pool.length) % pool.length].id);
    return out;
  }
  function bannerPity(s, id) { return id === 'normal' ? s.pity : (s.bpity[id] = s.bpity[id] || { a: 0, s: 0 }); }
  function bannerCost(id, n) { const c = bannerDef(id).cost; return { tickets: (c.tickets || 0) * n, lanterns: (c.lanterns || 0) * n }; }
  function canSummon(s, id, n) {
    const b = bannerDef(id); if (!b || !Number.isInteger(n) || n <= 0) return false;
    if (id === 'event' && !currentEvent(s)) return false;
    const c = bannerCost(id, n);
    return s.tickets >= c.tickets && s.event.lanterns >= c.lanterns;
  }
  // n призывов на баннере. Гарантии: S+ каждые pityS, A+ каждые pityA призывов без них; перед S — возрастающие шансы.
  function summon(s, n, bannerId) {
    const id = bannerId || 'normal', b = bannerDef(id), P = CONFIG.portal;
    if (!canSummon(s, id, n)) return null;
    const c = bannerCost(id, n);
    s.tickets -= c.tickets; s.event.lanterns -= c.lanterns; cnt(s, 'summon', n);
    const pity = bannerPity(s, id), pA = b.pityA || P.pityA, pS = b.pityS || P.pityS, base = b.minRarity ? RANK(b.minRarity) : 0;
    const feat = b.featured ? featuredHeroes(s) : [];
    const out = [];
    for (let i = 0; i < n; i++) {
      pity.a++; pity.s++;
      const min = pity.s >= pS ? RANK('S') : pity.a >= pA ? Math.max(base, RANK('A')) : base;
      const rarity = rollRarity(s, min, pity.s);
      if (RANK(rarity) >= RANK('A')) pity.a = 0;
      if (RANK(rarity) >= RANK('S')) pity.s = 0;
      const pool = CONFIG.allies.filter(a => a.rarity === rarity && !a.hidden && !a.seasonal);
      const fp = pool.filter(a => feat.includes(a.id));
      const hero = fp.length && s.rng() < b.featuredRate ? fp[Math.floor(s.rng() * fp.length) % fp.length]
        : pool[Math.min(pool.length - 1, Math.floor(s.rng() * pool.length))];
      const h = s.heroes[hero.id];
      const isNew = !h.unlocked;
      if (isNew) h.unlocked = true; else h.copies++;
      out.push({ id: hero.id, rarity, isNew });
    }
    return out;
  }
  function starCost(s, id) {
    const st = s.heroes[id].stars;
    return st >= CONFIG.maxStars ? null : CONFIG.starCopies[st];
  }
  // корм для звезды: сколько нужно и какие копии съедим (сначала низкая редкость, потом у кого копий больше; закреплённых не трогаем)
  function starFodder(s, id) { const st = s.heroes[id].stars; return st >= CONFIG.maxStars ? 0 : (CONFIG.starFodder[st] || 0); }
  function fodderPool(s, id) {
    return CONFIG.allies.filter(a => a.id !== id && !(s.locks && s.locks[a.id]) && s.heroes[a.id].copies > 0)
      .sort((a, b) => CONFIG.rarities.indexOf(a.rarity) - CONFIG.rarities.indexOf(b.rarity) || s.heroes[b.id].copies - s.heroes[a.id].copies);
  }
  function fodderHave(s, id) { return fodderPool(s, id).reduce((n, a) => n + s.heroes[a.id].copies, 0); }
  function canStar(s, id) {
    const h = s.heroes[id], need = h && starCost(s, id);
    return !!(h && h.unlocked && need != null && h.copies >= need && fodderHave(s, id) >= starFodder(s, id));
  }
  function starUp(s, id) {
    if (!canStar(s, id)) return false;
    const h = s.heroes[id];
    let f = starFodder(s, id);
    for (const a of fodderPool(s, id)) { if (!f) break; const k = Math.min(f, s.heroes[a.id].copies); s.heroes[a.id].copies -= k; f -= k; }
    h.copies -= starCost(s, id); h.stars++; cnt(s, 'star');
    return true;
  }
  function squadAdd(s, id) {
    if (!allyDef(id) || !s.heroes[id].unlocked || inSquad(s, id) || s.squad.length >= CONFIG.squadSize) return false;
    s.squad.push(id);
    const a = s.allies[id]; a.cd = allyDef(id).attackInterval;
    return true;
  }
  function squadRemove(s, id) {
    const i = s.squad.indexOf(id);
    if (i < 0) return false;
    s.squad.splice(i, 1);
    return true;
  }

  // ---------- материалы и эволюция ----------
  function shardsForBoss(f) { const M = CONFIG.materials; return M.shardsPerBoss + Math.floor(f / M.shardsFloorStep); }
  function heartsForFloor(f) { return f % CONFIG.materials.heartEvery === 0 ? 1 : 0; }
  // Осколки — за любого босса; сердце — только за первое в игре прохождение (не повторяется после регрессии)
  function bossMaterials(s, f) {
    return { shard: Math.ceil(shardsForBoss(f) * shardMult(s)) + heartShards(f > s.heartFloor ? heartsForFloor(f) : 0), heart: 0, firstHeart: f > s.heartFloor && heartsForFloor(f) > 0 };
  }
  // Требования следующей ступени или null, если эволюция завершена
  function evoCost(s, id) {
    const a = allyDef(id), E = CONFIG.evolution, st = a && E.stages[s.heroes[id].evo];
    if (!st) return null;
    return { stage: s.heroes[id].evo + 1, name: st.name, stars: st.stars, mult: st.mult,
             shards: Math.ceil(st.shards * E.rarityCost[a.rarity]) + heartShards(st.hearts), hearts: 0 };
  }
  function canEvolve(s, id) {
    const c = evoCost(s, id), h = s.heroes[id];
    return !!c && h.unlocked && h.stars >= c.stars && s.materials.shard >= c.shards && s.materials.heart >= c.hearts;
  }
  function evolve(s, id) {
    if (!canEvolve(s, id)) return false;
    const c = evoCost(s, id);
    s.materials.shard -= c.shards; s.materials.heart -= c.hearts;
    s.heroes[id].evo++; cnt(s, 'evolve');
    return true;
  }
  // Алтарь: гарантированная альтернатива — осколки в сердце
  // 0.51 (ответ 20): «Сердца стража» слиты в осколки — каждое прежнее сердце = heartRecipe осколков; ковать нечего
  function heartShards(n) { return n * CONFIG.materials.heartRecipe; }
  function forgeHeart(s, n) {
    return false;
    const cost = CONFIG.materials.heartRecipe * n;
    if (!Number.isInteger(n) || n <= 0 || s.materials.shard < cost) return false;
    s.materials.shard -= cost; s.materials.heart += n;
    return true;
  }

