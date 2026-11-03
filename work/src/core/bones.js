/* Кости (MASTER 1.5, У): 6 слотов, у кости только слот и редкость. Герой поглощает 6 костей редкости следующего ранга,
   при полном комплекте повышает ранг, кости расходуются, слоты очищаются. Гейты: SS — рекорд 1000, БОГ — 4000.
   Ранг постоянен (account). Правила выпадения — 1:1 с legacy/python/monster_drops.py. */
(function (PZ) {
  const B = PZ.B;
  const RANKS = B.heroes.ranks;                                       // E D C B A S SS БОГ
  const SLOTS = ['head', 'back', 'left_arm', 'right_arm', 'left_leg', 'right_leg'];
  const SLOT_NAME = { head: 'Голова', back: 'Спина', left_arm: 'Левая рука', right_arm: 'Правая рука', left_leg: 'Левая нога', right_leg: 'Правая нога' };
  const QUALITY = ['обычная', 'необычная', 'редкая', 'эпическая', 'легендарная', 'мифическая', 'божественная'];
  const D = B.bones = {
    qualityFloors: { 1: 1, 2: 51, 3: 151, 4: 301, 5: 601, 6: 1000, 7: 4000 },   // Т (monster_drops.py)
    dropChance: { normal: 0.12, elite: 0.32, boss: 0.65, zone_boss: 1.0 },       // Т
    pityLimit: { normal: 20, elite: 9, boss: 5, zone_boss: 1 },                  // Т
    rankDpsMult: 3,                                                               // У (автор 03.11.2026): ×3 DPS за каждое повышение ранга
  };

  // --- детерминированный ГСЧ в сохранении (честно и тестируемо) ---
  function rand(s) {
    let t = (s.account.rng = ((s.account.rng >>> 0) + 0x6D2B79F5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function kindOf(floor) { return floor % 50 === 0 ? 'zone_boss' : floor % 10 === 0 ? 'boss' : floor % 25 === 0 ? 'elite' : 'normal'; }
  function slotOf(floor) { return SLOTS[Math.floor((floor - 1) / 5) % SLOTS.length]; }
  function maxQuality(floor) { let q = 1; for (const [k, f] of Object.entries(D.qualityFloors)) if (floor >= f) q = Math.max(q, +k); return q; }
  const key = (slot, q) => slot + '_' + q;

  function ensure(s) {
    const a = s.account;
    if (!a.bones) a.bones = {};            // инвентарь: 'head_1' -> кол-во
    if (!a.boneSets) a.boneSets = {};      // heroId -> { rank, slots: { head: 0|q } }
    if (!a.bonePity) a.bonePity = {};
    if (!Number.isInteger(a.rng)) a.rng = 12345;
    return a;
  }

  // Бросок за победу на этаже (обычный, фарм — без разницы; GDD: одна попытка на победу).
  function rollFloor(s, floor) {
    const a = ensure(s), kind = kindOf(floor);
    const miss = a.bonePity[kind] || 0;
    const dropped = miss + 1 >= D.pityLimit[kind] || rand(s) < Math.min(1, D.dropChance[kind] * (PZ.classes ? PZ.classes.mult(s, 'bones') : 1));
    if (!dropped) { a.bonePity[kind] = miss + 1; return null; }
    a.bonePity[kind] = 0;
    let q = maxQuality(floor);
    if ((kind === 'normal' || kind === 'elite') && q > 1) q -= 1;
    const slot = slotOf(floor), k = key(slot, q);
    a.bones[k] = (a.bones[k] || 0) + 1;
    return { slot, quality: q, kind, floor };
  }

  function set(s, heroId) {
    const a = ensure(s);
    if (!a.boneSets[heroId]) a.boneSets[heroId] = { rank: PZ.HERO_BY_ID[heroId].rarity, slots: Object.fromEntries(SLOTS.map(x => [x, 0])) };
    return a.boneSets[heroId];
  }
  function peekSet(s, heroId) { const a = s.account; return (a.boneSets && a.boneSets[heroId]) || { rank: PZ.HERO_BY_ID[heroId].rarity, slots: Object.fromEntries(SLOTS.map(x => [x, 0])) }; }
  function rankOf(s, heroId) { return peekSet(s, heroId).rank; }
  function nextRank(rank) { const i = RANKS.indexOf(rank); return i >= 0 && i < RANKS.length - 1 ? RANKS[i + 1] : null; }
  function requiredQuality(rank) { const i = RANKS.indexOf(rank); return i >= 0 && i < RANKS.length - 1 ? i + 1 : null; }
  function count(s, slot, q) { return (s.account.bones && s.account.bones[key(slot, q)]) || 0; }

  function absorb(s, heroId, slot) {
    if (!PZ.HERO_BY_ID[heroId]) return { ok: false, err: 'Нет такого героя' };
    if (!s.account.owned[heroId]) return { ok: false, err: 'Герой не получен' };
    if (!SLOTS.includes(slot)) return { ok: false, err: 'Нет такого слота' };
    const st = peekSet(s, heroId), q = requiredQuality(st.rank);
    if (!q) return { ok: false, err: 'Максимальный ранг' };
    if (st.slots[slot]) return { ok: false, err: 'Слот уже заполнен' };
    if (count(s, slot, q) < 1) return { ok: false, err: 'Нет кости: ' + SLOT_NAME[slot].toLowerCase() + ', ' + QUALITY[q - 1] };
    const real = set(s, heroId);
    s.account.bones[key(slot, q)] -= 1;
    real.slots[slot] = q;
    return { ok: true, slot, quality: q };
  }
  function absorbAll(s, heroId) {
    let n = 0; for (const sl of SLOTS) if (absorb(s, heroId, sl).ok) n++;
    return n;
  }
  function filled(s, heroId) { const st = peekSet(s, heroId), q = requiredQuality(st.rank); return SLOTS.filter(x => q && st.slots[x] === q).length; }

  function canPromote(s, heroId) {
    const st = peekSet(s, heroId), target = nextRank(st.rank);
    if (!target) return { ok: false, err: 'Максимальный ранг' };
    const gate = B.heroes.gates[target] || 0;
    if (s.account.record < gate) return { ok: false, err: 'Ранг ' + target + ' откроется при рекорде ' + gate, target, gate };
    if (filled(s, heroId) < 6) return { ok: false, err: 'Нужно 6 костей редкости «' + QUALITY[requiredQuality(st.rank) - 1] + '»', target };
    return { ok: true, target };
  }
  function promote(s, heroId) {
    const c = canPromote(s, heroId); if (!c.ok) return c;
    const st = set(s, heroId);
    st.rank = c.target;
    for (const x of SLOTS) st.slots[x] = 0;
    return { ok: true, rank: c.target };
  }

  // Множитель DPS от повышений ранга относительно исходной редкости героя.
  function rankMult(s, heroId) {
    const st = s.account.boneSets && s.account.boneSets[heroId];
    if (!st) return 1;
    const up = RANKS.indexOf(st.rank) - RANKS.indexOf(PZ.HERO_BY_ID[heroId].rarity);
    return up > 0 ? Math.pow(D.rankDpsMult, up) : 1;
  }

  function validate(s, errs) {
    const a = s.account;
    for (const [k, v] of Object.entries(a.bones || {})) {
      const m = /^(.+)_([1-7])$/.exec(k);
      if (!m || !SLOTS.includes(m[1]) || !Number.isInteger(v) || v < 0) errs.push('bone ' + k);
    }
    for (const [id, st] of Object.entries(a.boneSets || {})) {
      if (!PZ.HERO_BY_ID[id] || !RANKS.includes(st.rank)) { errs.push('boneset ' + id); continue; }
      const gate = B.heroes.gates[st.rank] || 0;
      if (RANKS.indexOf(st.rank) > RANKS.indexOf(PZ.HERO_BY_ID[id].rarity) && a.record < gate) errs.push('rank gate ' + id);
      const q = requiredQuality(st.rank);
      for (const x of SLOTS) { const v = st.slots[x]; if (!(v === 0 || v === q)) errs.push('slot ' + id + ' ' + x); }
    }
  }

  PZ.bones = { SLOTS, SLOT_NAME, QUALITY, kindOf, slotOf, maxQuality, rollFloor, absorb, absorbAll, filled, canPromote, promote,
    rankOf, nextRank, requiredQuality, count, peekSet, rankMult, validate, rand };
})(globalThis.PZ = globalThis.PZ || {});
