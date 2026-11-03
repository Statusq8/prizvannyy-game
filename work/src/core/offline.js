/* Офлайн-прогресс (З: 8 ч, 50%). Считается как фарм текущего этажа без продвижения:
   золото = (кол-во убийств за время) × золото этажа × эффективность. Рекорд офлайн не растёт. */
(function (PZ) {
  const B = PZ.B;

  function estimate(s, seconds) {
    const O = B.offline;
    const sec = Math.min(Math.max(0, seconds), O.maxHours * 3600);
    if (sec < O.minSeconds) return { seconds: 0, gold: 0, kills: 0 };
    const f = s.run.farmFloor !== null ? s.run.farmFloor : Math.max(1, s.run.cleared);
    const target = B.bossKind(f) ? 'boss' : 'normal';
    const dps = PZ.heroes.armyDps(s, target);
    if (!(dps > 0)) return { seconds: sec, gold: 0, kills: 0 };
    const perKill = B.enemyHp(f) / dps + B.floors.spawnDelay;
    const kills = Math.floor(sec / perKill * O.efficiency);
    const gold = kills * B.enemyGold(f) * PZ.heroes.goldMult(s);
    return { seconds: sec, gold, kills, floor: f };
  }

  function apply(s, now) {
    const away = (now - s.meta.lastTick) / 1000;
    s.meta.lastTick = now;
    const r = estimate(s, away);
    if (r.gold > 0) PZ.state.addGold(s, r.gold, 'offline');
    return r;
  }

  PZ.offline = { estimate, apply };
})(globalThis.PZ = globalThis.PZ || {});
