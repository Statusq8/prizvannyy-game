/* Герои: доступность, найм, уровни, DPS. Формулы 1:1 с legacy/python/game_core.py (паритет проверяется тестом). */
(function (PZ) {
  const B = PZ.B;

  function gateFor(rarity) { return B.heroes.gates[rarity] || 0; }
  // Единый валидатор (GDD 7.1): ни один источник не выдаёт SS до 1000 и БОГ до 4000.
  function canObtain(s, heroId) { const h = PZ.HERO_BY_ID[heroId]; return !!h && s.account.record >= gateFor(h.rarity); }

  // В M1–M3 стартовая коллекция: все герои E–S считаются «доступными к найму за золото»
  // до появления портала (M6). Получение = owned. Решение временное (см. журнал).
  function isHireable(s, heroId) { return canObtain(s, heroId) && !!s.account.owned[heroId]; }

  function personalDps(heroId, level, stars) {
    if (!(level >= 1)) return 0;
    const h = PZ.HERO_BY_ID[heroId];
    let d = h.dps * Math.pow(B.heroes.dpsGrowth, level - 1);
    for (const p of h.passives) if (p.type === 'personal_dps_multiplier' && level >= p.lv) d *= p.value;
    d *= B.mastery(level);
    if (level >= 1000) d *= B.heroes.level1000Mult;
    return d * B.starMult(stars || 1);
  }

  function heroStars(s, id) { return (s.account.stars && s.account.stars[id]) || 1; }
  function rankMult(s, id) { return (PZ.bones && PZ.bones.rankMult) ? PZ.bones.rankMult(s, id) : 1; }

  // Бонусы: внутри категории складываются, категории перемножаются (GDD 5.4, У).
  function collectEffects(s) {
    const eff = [];
    for (const [id, lv] of Object.entries(s.run.hired))
      for (const p of PZ.HERO_BY_ID[id].passives)
        if (p.type !== 'personal_dps_multiplier' && lv >= p.lv) eff.push(p);
    const bonus = (type, target) => eff.reduce((a, e) => a + (e.type === type && e.target === target ? e.value : 0), 0);
    return { eff, bonus };
  }

  function mainDps(s) {
    const M = B.main;
    let d = B.mainDps(s.run.mainLevel);
    const CL = PZ.classes;
    return d * (CL ? CL.mult(s, 'main') : 1) * (PZ.relics ? PZ.relics.mult(s, 'main') : 1);
  }

  // Разложение DPS по вкладу каждого источника; target: 'normal' | 'boss'.
  function armyBreakdown(s, target) {
    const { bonus } = collectEffects(s);
    const army = 1 + bonus('army', 'all');
    const relicArmy = PZ.relics ? PZ.relics.mult(s, 'army') : 1;
    const CL = PZ.classes, cm = k => (CL ? CL.mult(s, k) : 1);
    const tgt = (target === 'boss' ? (1 + bonus('target', 'boss')) * cm('boss') : target === 'normal' ? (1 + bonus('target', 'normal')) * cm('normal') : 1);
    const relicTgt = PZ.relics && target === 'boss' ? PZ.relics.mult(s, 'boss') : 1;
    const parts = [];
    parts.push({ id: 'main', dps: mainDps(s) * army * (1 + bonus('summoned', 'main')) * tgt * relicArmy * relicTgt });
    for (const [id, lv] of Object.entries(s.run.hired)) {
      const h = PZ.HERO_BY_ID[id];
      let f = army * (1 + bonus('faction', h.faction)) * (1 + bonus('all_factions', 'all'));
      for (const t of h.tags) f *= 1 + bonus('tag', t);
      f *= cm('heroes') * (h.faction === 'wild' ? cm('wild') : 1) * (h.tags.includes('undead') ? cm('undead') : 1);
      const relicHero = PZ.relics ? PZ.relics.mult(s, 'heroes') * (lv >= 200 ? PZ.relics.mult(s, 'heroes200') : 1) : 1;
      parts.push({ id, dps: personalDps(id, lv, heroStars(s, id)) * rankMult(s, id) * relicHero * f * tgt * relicArmy * relicTgt });
    }
    const total = parts.reduce((a, p) => a + p.dps, 0);
    return { total, parts };
  }
  function armyDps(s, target) { return armyBreakdown(s, target).total; }
  function goldMult(s, boss) {
    const { bonus } = collectEffects(s);
    const R = PZ.relics;
    return (1 + bonus('economy', 'gold')) * (PZ.classes ? PZ.classes.mult(s, 'gold') : 1) * (R ? R.mult(s, 'gold') * (boss === undefined ? 1 : boss ? R.mult(s, 'goldBoss') : R.mult(s, 'goldNormal')) : 1);
  }

  function levelCost(s, heroId, level) {
    const disc = PZ.relics ? PZ.relics.discount(s, 'level') : 0;
    return Math.ceil(B.heroLevelCost(PZ.HERO_BY_ID[heroId].hire, level) * (1 - disc));
  }
  function hireCost(s, heroId) {
    const disc = PZ.relics ? PZ.relics.discount(s, 'hire') : 0;
    return Math.ceil(PZ.HERO_BY_ID[heroId].hire * (1 - disc));
  }
  // Стоимость n уровней с текущего и сколько можно купить на gold (max до limit).
  function batch(s, heroId, n, gold) {
    let lv = s.run.hired[heroId], cost = 0, k = 0;
    const lim = n === 'max' ? 100000 : n;
    while (k < lim) {
      const c = levelCost(s, heroId, lv + k);
      if (n === 'max' && cost + c > gold) break;
      cost += c; k++;
    }
    return { levels: k, cost };
  }

  function hire(s, heroId) {
    const h = PZ.HERO_BY_ID[heroId];
    if (!h) return { ok: false, err: 'Нет такого героя' };
    if (!canObtain(s, heroId)) return { ok: false, err: 'Ранг закрыт рекордом' };
    if (!s.account.owned[heroId]) return { ok: false, err: 'Герой не получен' };
    if (s.run.hired[heroId]) return { ok: false, err: 'Уже нанят' };
    const c = hireCost(s, heroId);
    if (!PZ.state.spendGold(s, c)) return { ok: false, err: 'Мало золота' };
    s.run.hired[heroId] = 1;
    return { ok: true, cost: c };
  }
  function levelUp(s, heroId, n) {
    if (!s.run.hired[heroId]) return { ok: false, err: 'Не нанят' };
    const b = batch(s, heroId, n, s.run.gold);
    if (b.levels === 0 || b.cost > s.run.gold) return { ok: false, err: 'Мало золота' };
    PZ.state.spendGold(s, b.cost);
    s.run.hired[heroId] += b.levels;
    return { ok: true, levels: b.levels, cost: b.cost };
  }
  function mainBatch(s, n, gold) {
    let cost = 0, k = 0; const lim = n === 'max' ? 100000 : n;
    while (k < lim) { const c = B.mainLevelCost(s.run.mainLevel + k); if (n === 'max' && cost + c > gold) break; cost += c; k++; }
    return { levels: k, cost };
  }
  function mainLevelUp(s, n) {
    const b = mainBatch(s, n, s.run.gold);
    if (b.levels === 0 || b.cost > s.run.gold) return { ok: false, err: 'Мало золота' };
    PZ.state.spendGold(s, b.cost);
    s.run.mainLevel += b.levels;
    return { ok: true, levels: b.levels, cost: b.cost };
  }

  // Видимые союзники (B.scene.allySlots): выбор игрока, иначе сильнейшие нанятые. Все нанятые входят в DPS.
  function visibleAllies(s) {
    const hired = Object.keys(s.run.hired);
    const n = B.scene.allySlots;
    const chosen = (s.account.visible || []).filter(id => s.run.hired[id]).slice(0, n);
    if (chosen.length) return chosen;
    return hired.sort((a, b) => personalDps(b, s.run.hired[b], heroStars(s, b)) - personalDps(a, s.run.hired[a], heroStars(s, a))).slice(0, n);
  }

  PZ.heroes = { gateFor, canObtain, isHireable, personalDps, mainDps, armyBreakdown, armyDps, goldMult,
    levelCost, hireCost, batch, hire, levelUp, mainBatch, mainLevelUp, visibleAllies, heroStars };
})(globalThis.PZ = globalThis.PZ || {});
