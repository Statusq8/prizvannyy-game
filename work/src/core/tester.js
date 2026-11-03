/* Режим тестировщика (решение автора 03.11.2026: «чтобы нормально тестировать играя»).
   Выдаёт ресурсы, прыгает по этажам, ускоряет время. Сейв помечается account.tester = true,
   чтобы тестовый прогресс не путать с честным. Включается в «Ещё» → «Тестирование». */
(function (PZ) {
  const mark = s => { s.account.tester = true; s.account.testerUsed = (s.account.testerUsed || 0) + 1; };
  const SPEEDS = [1, 2, 4, 10, 50];

  function gold(s, mult) {          // золото «на N уровней вперёд»: от цены следующего уровня Призванного, минимум 1e4
    mark(s);
    const g = Math.max(1e4, PZ.B.mainLevelCost(s.run.mainLevel) * (mult || 1000));
    PZ.state.addGold(s, g, 'tester'); return g;
  }
  function scrolls(s, n) { mark(s); s.account.scrolls = (s.account.scrolls || 0) + n; return n; }
  function shards(s, n) { mark(s); s.account.shards = (s.account.shards || 0) + n; return n; }
  function materials(s, n) { mark(s); const m = s.account.materials; for (const k of Object.keys(m)) m[k] += n; return n; }
  function bones(s, q, n) {           // по n костей каждого слота нужного качества
    mark(s); PZ.bones.ensure && PZ.bones.ensure(s);
    const a = s.account; if (!a.bones) a.bones = {};
    for (const sl of PZ.bones.SLOTS) a.bones[sl + '_' + q] = (a.bones[sl + '_' + q] || 0) + n;
    return n * PZ.bones.SLOTS.length;
  }
  function mainLevels(s, n) { mark(s); s.run.mainLevel += n; return s.run.mainLevel; }
  // Прыжок: этажи до f−1 считаются пройденными, бой — на этаже f. Рекорд не уменьшается.
  function jump(s, f) {
    f = Math.max(1, Math.min(5000, Math.floor(f)));
    mark(s);
    s.run.cleared = f - 1; s.account.record = Math.max(s.account.record, s.run.cleared);
    PZ.combat.goToRecord(s);
    return f;
  }
  function allHeroes(s) {             // все герои, кроме закрытых рекордом (SS/БОГ откроются после нужного этажа)
    mark(s); let n = 0;
    for (const h of PZ.HEROES) {
      const gate = PZ.B.heroes.gates[h.rarity] || 0;
      if (s.account.record < gate || s.account.owned[h.id]) continue;
      s.account.owned[h.id] = true; s.account.stars[h.id] = s.account.stars[h.id] || 1; n++;
    }
    return n;
  }
  function hireAll(s) {               // нанять всех из коллекции бесплатно
    mark(s); let n = 0;
    for (const id of Object.keys(s.account.owned)) if (!s.run.hired[id]) { s.run.hired[id] = 1; n++; }
    return n;
  }
  function fillEnergy(s) { mark(s); s.run.energy = s.run.energy || {}; for (const id of Object.keys(s.run.hired)) s.run.energy[id] = 99.9; }

  PZ.tester = { SPEEDS, gold, scrolls, shards, materials, bones, mainLevels, jump, allHeroes, hireAll, fillEnergy };
})(globalThis.PZ = globalThis.PZ || {});
