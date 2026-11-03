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
    s.run.stats.bossFails++;
    emit({ t: 'bossFail', floor: b.floor });
    s.run.autoAdvance = false;
    s.run.farmFloor = s.run.cleared >= 1 ? s.run.cleared : null;
    s.run.battle = makeBattle(s);
    if (s.run.farmFloor === null) { s.run.autoAdvance = true; }  // на 1-м этаже некуда отступать: просто повтор
  }

  // dt в секундах игрового времени (скорость ×1/×2/×4 умножает dt снаружи).
  function tick(s, dt) {
    if (!(dt > 0)) return;
    s.run.stats.playSeconds += dt;
    let left = dt;
    let guard = 0;
    while (left > 1e-9 && guard++ < 10000) {
      const b = ensureBattle(s);
      if (b.spawnWait > 0) {
        const w = Math.min(b.spawnWait, left); b.spawnWait -= w; left -= w; continue;
      }
      const dps = H().armyDps(s, b.boss ? 'boss' : 'normal');
      if (!(dps > 0)) { left = 0; break; }
      const toKill = b.hp / dps;
      const limit = b.timer !== null ? Math.min(left, b.timer) : left;
      if (toKill <= limit) {
        left -= toKill; if (b.timer !== null) b.timer -= toKill;
        b.hp = 0; onKill(s, b);
      } else {
        b.hp -= dps * limit; left -= limit;
        if (b.timer !== null) { b.timer -= limit; if (b.timer <= 1e-9) onBossFail(s, b); }
      }
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
    s.run.farmFloor = f; s.run.autoAdvance = false; s.run.battle = makeBattle(s);
    return { ok: true, floor: f };
  }
  function goToRecord(s) {
    s.run.farmFloor = null; s.run.autoAdvance = true; s.run.battle = makeBattle(s);
    return { ok: true, floor: currentFloor(s) };
  }
  function floorStatus(s, f) {
    if (f <= s.run.cleared) return 'cleared';
    if (f === s.run.cleared + 1) return 'next';
    return 'locked';
  }

  PZ.combat = { currentFloor, isFarming, ensureBattle, tick, tap, damage, selectFloor, goToRecord, floorStatus, events, makeBattle };
})(globalThis.PZ = globalThis.PZ || {});
