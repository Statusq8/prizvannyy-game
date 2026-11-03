/* Баланс B-001 — все числа игры здесь. Источник: GDD 3.3/5.4/5.5/9.2/9.3, MASTER_PLAN 1.6, game_core.py.
   status: 'У' утверждено, 'Т' тестовое, 'З' заглушка (решения нет, см. план, раздел 8). */
(function (PZ) {
  const B = {
    id: 'B-002',   // M8: подобран симулятором tools/sim.js (отчёт docs/balance/B-002.json)
    // --- Башня ---
    floors: {
      hpBase: 320, hpGrowth: 1.055, hpGrowthAfter400: 1.050,        // Т (GDD 3.3)
      goldBase: 10, goldGrowth: 1.052, goldGrowthAfter400: 1.054,   // Т (GDD 3.3); B-002: база золота 42→10
      enemiesPerFloor: 5,                                           // Т (GDD 3.2)
      boss10: { hp: 3, gold: 5 },                                   // Т (GDD 3.3)
      boss25: { hp: 4, gold: 8 },                                   // З, B-002: HP ×5→×4
      boss50: { hp: 5, gold: 12 },                                  // З, B-002: HP ×8→×5
      bossTimer: 30,                                                // З, секунд
      spawnDelay: 0.6,                                              // З, секунд между врагами
      zoneSize: 50,                                                 // У
    },
    zones: ['Древний лес', 'Пепельная пустыня', 'Ледяные залы', 'Огненная кузница',
            'Грозовой пик', 'Ядовитое болото', 'Затопленный храм', 'Царство смерти',
            'Кристальные пещеры', 'Священная цитадель', 'Теневая крепость', 'Бездна'],
    // --- Герои ---
    heroes: {
      dpsGrowth: 1.05,                 // Т (GDD 5.4)
      levelCostK: 0.07,                // Т (GDD 5.5)
      levelCostGrowth: 0.079,          // Т (game_core.py)
      masteryStart: 200, masteryStep: 25, masteryMult: 1.25,  // У
      level1000Mult: 10,               // П (game_core.py)
      gates: { SS: 1000, 'БОГ': 4000 },// У
      ranks: ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'БОГ'],
    },
    // --- Призванный (главный герой) --- всё З: GDD 4.3 «не утверждено»
    main: {
      baseDps: 40, dpsGrowth: 1.05, costBase: 8, costGrowth: 1.079,   // B-002: рост как у героев (было 1.07 / 1.074 — Призванный тянул весь урон)
      tapFactor: 0.6,                  // урон тапа = DPS главного × tapFactor
    },
    // --- Сцена --- У: Призванный + 4 союзника (MASTER 1.2, подтверждено автором 03.11.2026)
    scene: { allySlots: 4 },
    // --- Офлайн --- З
    offline: { maxHours: 8, efficiency: 0.5, minSeconds: 60 },
    // --- Звёзды --- Т (MASTER 1.6)
    starMult(s) {
      s = Math.max(1, Math.min(15, s | 0));
      return Math.pow(1.18, s - 1) * (s >= 5 ? 1.15 : 1) * (s >= 10 ? 1.25 : 1) * (s === 15 ? 1.5 : 1);
    },
  };

  function bossKind(f) {           // приоритет 50 > 25 > 10 (MASTER 1.3: «уточнить в коде»)
    if (f % 50 === 0) return 'boss50';
    if (f % 25 === 0) return 'boss25';
    if (f % 10 === 0) return 'boss10';
    return null;
  }
  function baseHp(f) {
    const F = B.floors;
    if (f <= 400) return F.hpBase * Math.pow(F.hpGrowth, f - 1);
    return F.hpBase * Math.pow(F.hpGrowth, 399) * Math.pow(F.hpGrowthAfter400, f - 400);
  }
  function baseGold(f) {
    const F = B.floors;
    if (f <= 400) return F.goldBase * Math.pow(F.goldGrowth, f - 1);
    return F.goldBase * Math.pow(F.goldGrowth, 399) * Math.pow(F.goldGrowthAfter400, f - 400);
  }
  function enemyHp(f) { const k = bossKind(f); return baseHp(f) * (k ? B.floors[k].hp : 1); }
  function enemyGold(f) { const k = bossKind(f); return baseGold(f) * (k ? B.floors[k].gold : 1); }
  function enemiesOnFloor(f) { return bossKind(f) ? 1 : B.floors.enemiesPerFloor; }
  function zoneIndex(f) { return Math.floor((f - 1) / B.floors.zoneSize); }
  function zoneName(f) { const i = zoneIndex(f); return B.zones[i] || ('Измерение ' + (i + 1)); }

  function heroLevelCost(hire, level) {   // цена L -> L+1
    const H = B.heroes;
    return Math.max(1, Math.ceil(H.levelCostK * hire * Math.pow(1 + H.levelCostGrowth, level)));
  }
  function mastery(level) {
    const H = B.heroes;
    return Math.pow(H.masteryMult, Math.max(0, Math.floor((level - H.masteryStart) / H.masteryStep)));
  }
  function mainDps(level) { const M = B.main; return level < 1 ? 0 : M.baseDps * Math.pow(M.dpsGrowth, level - 1); }
  function mainLevelCost(level) { const M = B.main; return Math.ceil(M.costBase * Math.pow(M.costGrowth, level)); }

  // Осколки за перерождение — tower_balance_v58.reward()
  function rebirthShards(oldRecord, reached) {
    if (reached < 400) return 0;
    let s = 35;
    if (oldRecord < 400 && reached >= 400) s += 20;
    for (let f = 100; f <= Math.min(reached, 1000); f += 50)
      if (f > oldRecord && (f > 400 || f % 100 === 0)) s += f <= 400 ? 5 : 10;
    return s;
  }

  Object.assign(B, { bossKind, baseHp, baseGold, enemyHp, enemyGold, enemiesOnFloor, zoneIndex, zoneName,
    heroLevelCost, mastery, mainDps, mainLevelCost, rebirthShards });
  PZ.B = B;
})(typeof globalThis !== 'undefined' ? (globalThis.PZ = globalThis.PZ || {}) : {});
