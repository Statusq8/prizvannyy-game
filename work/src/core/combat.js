/* Бой и Башня. Детерминированный tick(s, dt): без DOM и случайностей, поэтому тестируется в Node.
   Правила (MASTER 1.3): фарм любого пройденного этажа текущего забега; рекорд не уменьшается;
   неудача на боссе не отнимает ресурсы — возврат на фарм последнего пройденного этажа. */
(function (PZ) {
  const B = PZ.B, H = () => PZ.heroes;

  function spawnDelay(s) { return B.floors.spawnDelay * (1 - Math.min(0.6, (PZ.relics ? PZ.relics.discount(s, 'spawn') : 0) + (PZ.classes ? PZ.classes.add(s, 'spawn') : 0))); }
  function currentFloor(s) { return s.run.farmFloor !== null ? s.run.farmFloor : s.run.cleared + 1; }
  function isFarming(s) { return s.run.farmFloor !== null; }

  function makeBattle(s) {
    const f = currentFloor(s);
    const boss = B.bossKind(f);
    return {
      floor: f, boss, idx: 0, count: B.enemiesOnFloor(f),
      hp: B.enemyHp(f), maxHp: B.enemyHp(f),
      timer: boss ? B.floors.bossTimer + (PZ.classes ? PZ.classes.add(s, 'bossTimer') : 0) : null,
      spawnWait: 0, seed: (f * 7919 + s.meta.seq) % 1000,
    };
  }
  function ensureBattle(s) {
    const b = s.run.battle;
    if (!b || b.floor !== currentFloor(s)) s.run.battle = makeBattle(s);
    return s.run.battle;
  }

  const events = [];   // журнал событий для интерфейса (очищает UI)
  function emit(e) { events.push(e); if (events.length > 200) events.shift(); }

  function damage(s, amount, source) {
    const b = ensureBattle(s);
    if (b.spawnWait > 0 || b.hp <= 0) return 0;
    const dealt = Math.min(b.hp, amount);
    b.hp -= dealt;
    if (b.hp <= 1e-9) onKill(s, b);
    return dealt;
  }

  function onKill(s, b) {
    const gold = B.enemyGold(b.floor) * H().goldMult(s, !!b.boss);
    PZ.state.addGold(s, gold, 'kill');
    s.run.stats.kills++;
    emit({ t: 'kill', floor: b.floor, gold, boss: b.boss, idx: b.idx });
    if (PZ.drops) PZ.drops.onKill(s, b);
    b.idx++;
    if (b.idx >= b.count) return onFloorCleared(s, b);
    b.hp = b.maxHp; b.spawnWait = spawnDelay(s);
  }

  function onFloorCleared(s, b) {
    const f = b.floor, wasNew = f > s.run.cleared;
    if (wasNew) {
      s.run.cleared = f;
      if (f > s.account.record) { s.account.record = f; emit({ t: 'record', floor: f }); }
      if (PZ.portal) { const g = PZ.portal.onFirstClear(s, f); if (g) emit({ t: 'reward', floor: f, got: g }); }
    }
    emit({ t: 'floor', floor: f, isNew: wasNew, boss: b.boss });
    if (PZ.bones) { const d = PZ.bones.rollFloor(s, f); if (d) emit(Object.assign({ t: 'bone' }, d)); }
    // Куда дальше: фарм остаётся на выбранном этаже; иначе — вперёд (авто) или повтор последнего.
    if (!isFarming(s) && !s.run.autoAdvance) s.run.farmFloor = s.run.cleared;
    s.run.battle = makeBattle(s);
    s.run.battle.spawnWait = spawnDelay(s);
  }

  function onBossFail(s, b) {
    s.run.stats.bossFails++; s.run.ultCarry = 0;
    emit({ t: 'bossFail', floor: b.floor });
    s.run.autoAdvance = false;
    s.run.farmFloor = s.run.cleared >= 1 ? s.run.cleared : null;
    s.run.battle = makeBattle(s);
    if (s.run.farmFloor === null) { s.run.autoAdvance = true; }  // на 1-м этаже некуда отступать: просто повтор
  }

  // --- Энергия и авто-ульта (концепт 03.11.2026): каждая атака героя даёт энергию; при полной шкале — ульта.
  // Средний урон героя не меняется (баланс B-002 сохраняется): часть урона идёт обычными ударами,
  // часть копится и выходит всплеском. d = D·n/(n+mult), ульта = mult·d, где n — атак до ульты.
  function heroFlows(s, target) {
    const br = H().armyBreakdown(s, target), T = B.ult.attackPeriod;
    let rate = 0; const ults = [];
    for (const p of br.parts) {
      if (p.id === 'main' || !(p.dps > 0)) { rate += p.dps; continue; }
      const u = PZ.HERO_BY_ID[p.id].ult || B.ult.default, n = u.energy / u.perAttack;
      const d = p.dps * T * n / (n + u.mult);
      rate += d / T;
      ults.push({ id: p.id, energyRate: u.perAttack / T, max: u.energy, burst: d * u.mult });
    }
    return { rate, ults, total: br.total };
  }

  // dt в секундах игрового времени (скорость ×1/×2/×4 умножает dt снаружи).
  function tick(s, dt) {
    if (!(dt > 0)) return;
    s.run.stats.playSeconds += dt;
    if (!s.run.energy) s.run.energy = {};
    const E = s.run.energy;
    let left = dt;
    let guard = 0;
    while (left > 1e-9 && guard++ < 20000) {
      const b = ensureBattle(s);
      if (b.spawnWait > 0) {
        const w = Math.min(b.spawnWait, left); b.spawnWait -= w; left -= w; continue;
      }
      // Перелёт ульты: урон сверх добивания переходит на следующего врага (иначе ульта на слабых волнах
      // сгорала бы впустую и средний DPS падал; проверено симулятором B-002).
      if (s.run.ultCarry > 0) {
        const c = Math.min(b.hp, s.run.ultCarry); s.run.ultCarry -= c; b.hp -= c;
        if (s.run.ultCarry < 1e-9 * c) s.run.ultCarry = 0;
        if (b.hp <= 1e-9) { b.hp = 0; onKill(s, b); continue; }
      }
      const fl = heroFlows(s, b.boss ? 'boss' : 'normal');
      if (!(fl.total > 0)) { left = 0; break; }
      let next = Infinity, who = null;
      for (const u of fl.ults) { const t = Math.max(0, (u.max - (E[u.id] || 0)) / u.energyRate); if (t < next) { next = t; who = u; } }
      const toKill = fl.rate > 0 ? b.hp / fl.rate : Infinity;
      const limit = b.timer !== null ? Math.min(left, b.timer) : left;
      const step = Math.min(toKill, next, limit);
      b.hp -= fl.rate * step; left -= step;
      if (b.timer !== null) b.timer -= step;
      for (const u of fl.ults) E[u.id] = Math.min(u.max, (E[u.id] || 0) + u.energyRate * step);
      if (step === toKill || b.hp <= 1e-9) { b.hp = 0; onKill(s, b); continue; }
      if (step === next && who) {
        E[who.id] = 0;
        const dealt = Math.min(b.hp, who.burst);
        emit({ t: 'ult', id: who.id, dmg: who.burst });
        b.hp -= dealt;
        if (who.burst > dealt) s.run.ultCarry = (s.run.ultCarry || 0) + (who.burst - dealt);
        if (b.hp <= 1e-9) { b.hp = 0; onKill(s, b); }
        continue;
      }
      if (b.timer !== null && b.timer <= 1e-9) onBossFail(s, b);
    }
  }

  function tap(s) {
    s.run.stats.taps++;
    const b = ensureBattle(s);
    const amt = H().mainDps(s) * B.main.tapFactor * (PZ.classes ? PZ.classes.mult(s, 'tap') : 1) * (b.boss && PZ.relics ? PZ.relics.mult(s, 'boss') : 1);
    return damage(s, amt, 'tap');
  }

  // --- Башня ---
  function selectFloor(s, f) {
    f = Math.floor(f);
    if (!(f >= 1)) return { ok: false, err: 'Нет такого этажа' };
    if (f > s.run.cleared + 1) return { ok: false, err: 'Этаж ещё закрыт' };
    if (f === s.run.cleared + 1) return goToRecord(s);
    s.run.farmFloor = f; s.run.autoAdvance = false; s.run.ultCarry = 0; s.run.battle = makeBattle(s);
    return { ok: true, floor: f };
  }
  function goToRecord(s) {
    s.run.farmFloor = null; s.run.autoAdvance = true; s.run.ultCarry = 0; s.run.battle = makeBattle(s);
    return { ok: true, floor: currentFloor(s) };
  }
  function floorStatus(s, f) {
    if (f <= s.run.cleared) return 'cleared';
    if (f === s.run.cleared + 1) return 'next';
    return 'locked';
  }

  PZ.combat = { heroFlows, currentFloor, isFarming, ensureBattle, tick, tap, damage, selectFloor, goToRecord, floorStatus, events, makeBattle };
})(globalThis.PZ = globalThis.PZ || {});
