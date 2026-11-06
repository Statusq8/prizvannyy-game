  // ==== src/core/06_combat.js — Бой: урон, криты, тап, тик, смерть врага, боссы, награды за убийство ====
  // ---------- действия ----------
  // Множители от ультимейтов: Ярость — весь урон отряда, Разрез — тапы, Метка — урон по врагу
  function damageMult(s, source) {
    let m = 1;
    if (s.buffs.team > 0) m *= s.buffs.teamPower;
    if (source === 'tap' && s.buffs.tap > 0) m *= s.buffs.tapPower;
    if (s.enemy.mark > 0) m *= s.enemy.markPower;
    if (s.enemy.vuln > 0) m *= CONFIG.bossPhases.vulnMult;
    if (s.enemy.isBoss) m *= bossDmgMult(s);
    m *= boneEnemyMult(s, source);
    return m;
  }

  function dealDamage(s, dmg, source, events) {
    dmg = B.mul(B.mul(dmg, permMult(s, source)), damageMult(s, source));
    const crit = s.rng() < critChance(s);
    if (crit) { dmg = B.mul(dmg, critMult(s)); s.stats.crits = (s.stats.crits | 0) + 1; }
    s.enemy.hp = B.max(0, B.sub(s.enemy.hp, dmg));
    events.push({ type: 'hit', dmg, source, crit });
    if (B.lte(s.enemy.hp, 0)) { s.enemy.hp = 0; kill(s, events); }
    else if (s.enemy.isBoss) checkPhase(s, events);
  }
  // Фазы босса: пороги HP, на каждом — короткая уязвимость
  function phaseThresholds(e) { const P = CONFIG.bossPhases; return e.final ? P.final : P.normal; }
  function checkPhase(s, events) {
    const e = s.enemy, th = phaseThresholds(e);
    while (e.phase <= th.length && B.toNum(B.div(e.hp, e.maxHp)) <= th[e.phase - 1]) {
      e.phase++; e.vuln = CONFIG.bossPhases.vulnSec + treePower(s, 'vulnSec');
      events.push({ type: 'phase', phase: e.phase, of: th.length + 1, name: e.name });
    }
  }

  function earnGold(s, g) { s.stats.goldEarned = B.add(s.stats.goldEarned, g); }
  function tap(s) {
    const events = [];
    if (!s.enemy.alive) return events;           // нельзя бить мёртвого
    if (s.tpsWin.n >= CONFIG.maxTapsPerSec) return events;   // предел тапов в секунду (ответ 14)
    s.stats.taps++; cnt(s, 'tap'); s.tpsWin.n++;
    if (modeRule(s) === 'alliesOnly') { events.push({ type: 'hit', dmg: 0, source: 'tap', crit: false, blocked: true }); return events; }
    if (modeRule(s) === 'trial') {                         // равные условия: фиксированный урон, без критов и бонусов
      const dmg = CONFIG.pve.trial.tapDmg;
      s.enemy.hp = B.max(0, B.sub(s.enemy.hp, dmg));
      events.push({ type: 'hit', dmg, source: 'tap', crit: false });
      if (B.lte(s.enemy.hp, 0)) { s.enemy.hp = 0; kill(s, events); }
      return events;
    }
    dealDamage(s, tapDamage(s), 'tap', events);
    return events;
  }

  function kill(s, events) {
    const isBoss = s.enemy.isBoss;
    s.enemy.alive = false;
    s.respawn = CONFIG.respawnDelaySec;
    if (s.mode) return modeKill(s, events);
    if (s.enemy.cage) {                          // клетка разбита — союзник свободен и сразу в отряде
      const id = CONFIG.cage.ally;
      s.cageFreed = true; s.heroes[id].unlocked = true;
      if (s.allies[id].level < 1) s.allies[id].level = 1;
      events.push({ type: 'freed', id });
    }
    rewardKill(s, isBoss, events, s.enemy.rare);
  }
  // Награды и переход к следующему врагу — общие для боя и офлайна
  function rewardKill(s, isBoss, events, rareId, offline) {
    const rare = rareId ? rareDef(rareId) : null;
    const gold = B.ceil(B.mul(killGold(s.floor, isBoss), goldMult(s) * (rare ? rare.gold : 1)));
    diaryKill(s, rare ? rare.name : enemyName(s.floor, s.enemyIndex, isBoss), s.floor, offline ? null : events);
    s.gold = B.add(s.gold, gold); earnGold(s, gold);
    s.stats.kills++; cnt(s, 'kill');
    addEventPoints(s, isBoss ? CONFIG.events.pointsBoss : CONFIG.events.pointsKill);
    events.push({ type: 'kill', gold, boss: isBoss, rare: rareId || null });
    if (rare) cnt(s, 'rare');
    if (!offline && !isBoss) keeperRoll(s, events);
    if (!offline && !isBoss && !rare) {
      const M = CONFIG.materials;
      if (hash01(s.stats.kills, s.floor, 83) < M.mobShardChance) {
        const n = Math.max(1, Math.ceil(shardsForBoss(s.floor) * M.mobShardShare * shardMult(s)));
        s.materials.shard += n; events.push({ type: 'mobShard', n });
      }
    }
    if (rare && rare.shards) {
      const n = Math.ceil(rare.shards * shardsForBoss(s.floor) * shardMult(s));
      s.materials.shard += n;
      events.push({ type: 'materials', shard: n, heart: 0, rare: true });
    }

    if (isBoss) {
      s.stats.bossKills++; cnt(s, 'boss');
      if (s.floor > (s.bestCleared | 0)) { s.bestCleared = s.floor; petsCatchUp(s, events); }
      if (s.floor > s.highestCleared) {
        s.highestCleared = s.floor;
        const bonus = B.ceil(B.mul(firstClearGold(s.floor), goldMult(s)));
        s.gold = B.add(s.gold, bonus); earnGold(s, bonus);
        events.push({ type: 'firstClear', floor: s.floor, gold: bonus });
      }
      if (!s.mode) grantTrophy(s, s.floor, events);
      if (!s.mode) secretFind(s, s.floor, events);
      if (!s.mode && !offline && curseMod(s)) {                      // проклятый этаж пройден (не офлайн)
        const R = CONFIG.curse.reward, rw = { tickets: R.tickets, essence: R.essence, shard: Math.ceil(shardsForBoss(s.floor) * R.shardMult * shardMult(s)) };
        grant(s, rw); cnt(s, 'curse'); events.push({ type: 'curseWin', floor: s.floor, reward: rw });
        s.curse = null;
      }
      if (s.floor > s.ticketFloor) {
        s.ticketFloor = s.floor;
        const n = ticketsForFloor(s.floor);
        s.tickets += n;
        if (n) events.push({ type: 'tickets', n, floor: s.floor });
      }
      const mat = bossMaterials(s, s.floor);
      s.materials.shard += mat.shard;
      if (mat.firstHeart) {
        s.heartFloor = s.floor;
        const b = biomeOf(s.floor);
        if (isFinalBoss(s.floor) && unlockedAt(s, 'totems') && !s.totems[b.id]) { s.totems[b.id] = 1; events.push({ type: 'totem', id: b.id, name: b.name }); }
      }
      events.push({ type: 'materials', shard: mat.shard, heart: mat.heart });
      const bone = unlockedAt(s, 'bones') ? rollBone(s, isFinalBoss(s.floor) ? CONFIG.bones.dropFinal : CONFIG.bones.dropBoss, s.floor) : null;
      // 0.74 (ответы 8, 57): мега-босс даёт души и без регрессии; первый мега-босс (этаж 50) — первый артефакт даром
      if (isFinalBoss(s.floor) && !s.mode && s.floor >= (s.megaSoulsFloor | 0) + 1) {
        s.megaSoulsFloor = s.floor;
        const M = CONFIG.megaSouls, n = Math.ceil(M.base * Math.pow(M.per50, s.floor / 50 - 1));
        s.souls = B.add(s.souls, n); s.stats.soulsEarned = B.add(s.stats.soulsEarned, n);
        events.push({ type: 'megaSouls', n });
        if (CONFIG.crystals.megaFirst && s.floor > (s.crystalFloor | 0)) { s.crystalFloor = s.floor; s.crystals = (s.crystals | 0) + CONFIG.crystals.megaFirst; events.push({ type: 'crystals', n: CONFIG.crystals.megaFirst }); }
        if (!foundCount(s) && unlockedAt(s, 'artifacts')) {
          const pool = CONFIG.artifacts.filter(a => !a.special && !a.blood && artLevel(s, a.id) === 0);
          if (pool.length) { const a = pool[Math.floor(s.rng() * pool.length) % pool.length]; s.artifacts[a.id] = 1; events.push({ type: 'freeArtifact', id: a.id, name: a.name }); }
        }
      }
      if (bone) events.push({ type: 'bone', bone });
      // «Автопереход» выключен: этаж открыт, но остаёмся и фармим текущий
      if (!s.autoAdvance && s.floor < CONFIG.maxFloor) {
        s.maxFloor = Math.max(s.maxFloor, s.floor + 1); s.bestFloor = Math.max(s.bestFloor, s.maxFloor);
        s.enemyIndex = 1; s.farming = true;
        events.push({ type: 'stay', floor: s.floor });
        return;
      }
      if (s.floor >= CONFIG.maxFloor) {                 // вершина: этаж не растёт, босса можно бить снова
        s.enemyIndex = 1;
        events.push({ type: 'top', floor: s.floor });
        return;
      }
      s.maxFloor = Math.max(s.maxFloor, s.floor + 1);
      s.bestFloor = Math.max(s.bestFloor, s.maxFloor);
      s.floor += 1;
      s.enemyIndex = 1;
      events.push({ type: 'floor', floor: s.floor });
      if (s.curse && s.curse.floor !== s.floor) s.curse = null;
      towerMilestones(s, events);
      curseOffer(s, events, offline);
      if (isBiomeStart(s.floor) && s.floor >= s.maxFloor) events.push({ type: 'biome', floor: s.floor, name: biomeName(s.floor) });
    } else if (s.farming && s.enemyIndex === CONFIG.enemiesPerFloor - 1) {
      s.enemyIndex = 1;                          // фарм: крутим обычных врагов без босса
    } else {
      s.enemyIndex += 1;
    }
  }

  // Фиксированный шаг симуляции
  function tick(s, dt) {
    const events = [];
    s.stats.playTime += dt;
    const w = s.tpsWin; w.t += dt;
    if (w.t >= 1) { s.stats.maxTps = Math.max(s.stats.maxTps, Math.round(w.n / w.t)); w.t = 0; w.n = 0; }
    s.buffs.team = Math.max(0, s.buffs.team - dt);
    s.buffs.tap = Math.max(0, s.buffs.tap - dt);
    tickPotions(s, dt);
    if (s.critBuff) s.critBuff.t = Math.max(0, s.critBuff.t - dt);
    if (s.enemy.alive) { s.enemy.mark = Math.max(0, s.enemy.mark - dt); s.enemy.vuln = Math.max(0, s.enemy.vuln - dt); }
    if (CONFIG.allyUlts) for (const a of squadDefs(s)) {
      const st = s.allies[a.id];
      if (st.level > 0) st.ult = Math.min(a.ult.charge, st.ult + dt * (1 + treePower(s, 'ultCharge')) * (1 + petBonus(s, 'ult')));   // готовность копится и сохраняется между врагами
    }
    tickAbilities(s, dt, events);   // перезарядка идёт всегда; шквал и автоиспользование — только по живому врагу
    if (!s.enemy.alive) {
      s.respawn -= dt;
      if (s.respawn <= 0) { spawn(s); events.push({ type: 'spawn' }); }
      return events;
    }
    const rule = modeRule(s);
    // Ультимейты срабатывают автоматически, как только заряжены и враг жив
    if (CONFIG.allyUlts) for (const a of squadDefs(s)) {
      const st = s.allies[a.id];
      if (rule === 'noUlts' || rule === 'tapOnly' || rule === 'trial') break;
      if (st.level <= 0 || st.ult < a.ult.charge || !s.enemy.alive) continue;
      st.ult = 0;
      fireUlt(s, a, events);
    }
    if (!s.enemy.alive) return events;
    // Автоатаки отряда: перезарядка идёт только пока враг жив
    for (const a of squadDefs(s)) {
      const st = s.allies[a.id];
      if (st.level <= 0 || rule === 'tapOnly' || rule === 'trial') continue;
      st.cd -= dt;
      if (st.cd <= 0 && s.enemy.alive) {
        st.cd += a.attackInterval;
        dealDamage(s, allyDps(s, a.id) * a.attackInterval, a.id, events);
      }
      if (!s.enemy.alive) { for (const b of CONFIG.allies) s.allies[b.id].cd = Math.max(s.allies[b.id].cd, 0); return events; }
    }
    // Автоатака главного героя (артефакт «Клинок первого призыва»): фиксированная частота, тапы остаются
    if (hasHeroAuto(s) && rule !== 'alliesOnly' && rule !== 'trial') {
      s.heroAutoAcc += dt;
      if (s.heroAutoAcc >= CONFIG.heroAutoInterval) {
        s.heroAutoAcc -= CONFIG.heroAutoInterval;
        dealDamage(s, tapDamage(s), 'heroAuto', events);
        if (!s.enemy.alive) return events;
      }
    }
    // Резерв: доля DPS нанятых вне отряда, порциями раз в секунду
    const rd = rule === 'tapOnly' || rule === 'trial' ? 0 : reserveDps(s);
    if (B.gt(rd, 0)) {
      s.reserveAcc += dt;
      if (s.reserveAcc >= 1) { s.reserveAcc -= 1; dealDamage(s, rd, 'reserve', events); if (!s.enemy.alive) return events; }
    }
    // Питомец: своя частота атаки
    const pet = s.pets.active && petDef(s.pets.active);
    if (pet && rule !== 'tapOnly' && rule !== 'trial') {
      s.petAcc += dt;
      if (s.petAcc >= pet.interval) {
        s.petAcc -= pet.interval;
        const hit = petHit(s);
        if (B.gt(hit, 0)) { dealDamage(s, hit, 'pet', events); if (!s.enemy.alive) return events; }
      }
    }
    if (s.mode) { modeTimer(s, dt, events); return events; }
    if (s.enemy.isBoss) {
      s.bossTimeLeft -= dt;
      if (s.bossTimeLeft <= 0) {
        // Решение пользователя (0.48): после провала отряд сам спускается на этаж ниже и фармит его босса — за осколки;
        // победа над ним снова ведёт к стене. На этаже 1 и при выключенном автопереходе — прежний фарм без босса.
        if (curseMod(s)) { s.curse = null; events.push({ type: 'curseLost' }); }   // проклятие снято
        if (s.floor > 1 && s.autoAdvance) { s.floor -= 1; s.farming = false; }
        else s.farming = true;
        s.enemyIndex = 1;
        spawn(s);
        events.push({ type: 'bossFail', floor: s.floor }, { type: 'spawn' });
      }
    }
    return events;
  }

