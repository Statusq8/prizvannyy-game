  // ==== src/core/09_progression.js — Прогрессия: офлайн, ранги и потолки уровней, способности главного героя ====
  // ---------- офлайн ----------
  // Средний авто-урон без тапов, ультимейтов и способностей, с учётом критов
  function offlineDps(s) { return B.mul(autoDps(s), (1 + critChance({ ...s, abilities: newAbilities() }) * (critMult(s) - 1)) * (1 + treePower(s, 'offlineDmg'))); }
  function killTime(hp, dps) { return Math.max(B.toNum(B.div(hp, dps)), CONFIG.offline.minKillSec) + CONFIG.respawnDelaySec; }
  // Проиграть отсутствие: продвижение до стены (босс не успевает умереть за таймер), потом фарм этажа ниже.
  // Возвращает сводку или null, если отсутствие короче minSec.
  function offlineProgress(s, seconds) {
    if (s.curse) s.curse = null;                     // 0.59: проклятие этажа не переживает уход из игры
    const O = CONFIG.offline;
    if (!(seconds >= O.minSec)) return null;
    if (s.mode) exitMode(s);                                // ушёл из подземелья — вернулся в Башню
    const secs = Math.min(seconds, O.maxSec);
    const r = { seconds: secs, capped: seconds > O.maxSec, fromFloor: s.floor, gold: 0, kills: 0,
                floorsCleared: 0, wallFloor: null, farmFloor: null, shard: 0, heart: 0, tickets: 0 };
    const gold0 = s.gold, kills0 = s.stats.kills, sh0 = s.materials.shard, he0 = s.materials.heart, t0 = s.tickets;
    for (const a of CONFIG.abilities) s.abilities[a.id].cd = Math.max(0, s.abilities[a.id].cd - secs);
    const dps = offlineDps(s);
    let t = 0;
    if (B.gt(dps, 0)) {
      // Был в фарме после проигрыша — снова пробуем рубеж (самый высокий открытый этаж)
      if (s.farming) { s.floor = s.maxFloor; s.enemyIndex = CONFIG.enemiesPerFloor; s.farming = false; }
      const events = [];
      while (!s.farming) {
        const isBoss = s.enemyIndex === CONFIG.enemiesPerFloor;
        const hp = enemyMaxHp(s.floor, isBoss);
        if (isBoss && B.toNum(B.div(hp, B.mul(dps, bossDmgMult(s)))) > bossTime(s)) {             // стена: босс не умирает за таймер
          r.wallFloor = s.floor;
          s.floor = Math.max(1, s.floor - 1); s.enemyIndex = 1; s.farming = true;
          break;
        }
        const kt = killTime(hp, dps);
        if (t + kt > secs) break;
        t += kt; tickPotions(s, kt);                        // зелья тратятся и офлайн
        const f = s.floor;
        rewardKill(s, isBoss, events, null, true);
        if (isBoss) r.floorsCleared++;
        if (s.floor !== f) events.length = 0;               // события не копим
      }
      if (s.farming) {
        // Фарм обычных врагов 1–9 этажа ниже стены — сразу за всё оставшееся время
        r.farmFloor = s.floor;
        const kt = killTime(enemyMaxHp(s.floor, false), dps);
        const n = Math.floor((secs - t) / kt);
        const per = CONFIG.enemiesPerFloor - 1;
        const fg = B.mul(n, B.ceil(B.mul(killGold(s.floor, false), goldMult(s))));
        s.gold = B.add(s.gold, fg); earnGold(s, fg);
        s.stats.kills += n; cnt(s, 'kill', n); addEventPoints(s, n * CONFIG.events.pointsKill);
        s.enemyIndex = 1 + (s.enemyIndex - 1 + n) % per;
      }
    }
    tickPotions(s, Math.max(0, secs - t));
    r.toFloor = s.floor;
    r.gold = B.sub(s.gold, gold0); r.kills = s.stats.kills - kills0;
    r.shard = s.materials.shard - sh0; r.heart = s.materials.heart - he0; r.tickets = s.tickets - t0;
    spawn(s);
    return r;
  }

  function fireUlt(s, a, events) {
    const u = a.ult;
    events.push({ type: 'ult', id: a.id, name: u.name, kind: u.kind });
    if (u.kind === 'nuke') dealDamage(s, allyDps(s, a.id) * u.power, 'ult:' + a.id, events);
    else if (u.kind === 'teamBuff') { s.buffs.team = u.duration; s.buffs.teamPower = u.power; }
    else if (u.kind === 'tapBuff') { s.buffs.tap = u.duration; s.buffs.tapPower = u.power; }
    else if (u.kind === 'mark') { s.enemy.mark = u.duration; s.enemy.markPower = u.power; }
    else if (u.kind === 'critBuff') s.critBuff = { t: u.duration, ch: u.chance, dmg: u.dmg };
  }

  function challengeBoss(s) {
    if (s.mode) return [];
    s.farming = false;
    s.enemyIndex = CONFIG.enemiesPerFloor;
    spawn(s);
    return [{ type: 'spawn' }];
  }

  function goToFloor(s, floor) {
    if (s.mode || !Number.isInteger(floor) || floor < 1 || floor > s.maxFloor || floor === s.floor) return [];
    s.floor = floor;
    s.enemyIndex = 1;
    s.farming = floor < s.maxFloor ? s.farming : false;
    spawn(s);
    return [{ type: 'floor', floor }, { type: 'spawn' }];
  }

  // n: число уровней или 'max'
  // ---------- ранги и потолки уровней ----------
  // k — число пройденных ступеней (0…100). Ранг = ⌊k/10⌋+1 (до 10), подранг = k mod 10.
  function rankCount() { const R = CONFIG.ranks; return R.count + (R.extra ? R.extra.length : 0); }
  function maxSteps() { return rankCount() * CONFIG.ranks.subs; }
  function capAt(k) {
    const R = CONFIG.ranks, base = R.count * R.subs;
    k = Math.min(k, maxSteps());
    if (k <= base) return Math.round(R.capMin * Math.pow(R.capMax / R.capMin, k / base) / 10) * 10;
    // ранги из обновлений: между потолком предыдущего ранга и потолком нового — геометрически по подрангам
    const i = Math.floor((k - base - 1) / R.subs), from = i ? R.extra[i - 1] : R.capMax, to = R.extra[i];
    const t = (k - base - i * R.subs) / R.subs;
    return Math.round(from * Math.pow(to / from, t) / 10) * 10;
  }
  function rankLabel(k) {
    const R = CONFIG.ranks;
    if (k >= maxSteps()) return { rank: rankCount(), sub: R.subs, max: true };
    return { rank: Math.floor(k / R.subs) + 1, sub: k % R.subs, max: false };
  }
  function tapCap(s) { return capAt(s.heroRank); }
  function allyCap(s, id) { return capAt(s.heroes[id].rank); }
  // Цена следующей ступени: who = 'hero' или id союзника. null — предел.
  function rankCost(s, who) {
    const R = CONFIG.ranks, hero = who === 'hero', a = !hero && allyDef(who);
    if (!hero && !a) return null;
    const k = hero ? s.heroRank : s.heroes[who].rank;
    if (k >= maxSteps()) return null;
    const next = k + 1, newRank = next % R.subs === 0 && next < maxSteps() ? next / R.subs : 0;   // переход на ранг newRank+1
    const mult = hero ? 1 : CONFIG.evolution.rarityCost[a.rarity];
    const needEvo = !hero && newRank ? R.evoFor[newRank] || 0 : 0;
    return { step: next, cap: capAt(next), shards: Math.ceil(R.shards * Math.pow(R.growth, k) * mult) + heartShards(newRank ? newRank + 1 : 0),
             hearts: 0, needEvo, newRank: newRank ? newRank + 1 : 0 };
  }
  function canRankUp(s, who) {
    const c = rankCost(s, who);
    if (!c || s.materials.shard < c.shards || s.materials.heart < c.hearts) return false;
    if (who !== 'hero' && (!s.heroes[who].unlocked || s.heroes[who].evo < c.needEvo)) return false;
    return true;
  }
  function rankUp(s, who) {
    if (!canRankUp(s, who)) return false;
    const c = rankCost(s, who);
    s.materials.shard -= c.shards; s.materials.heart -= c.hearts;
    if (who === 'hero') s.heroRank++; else s.heroes[who].rank++;
    cnt(s, 'rank');
    return true;
  }
  function buyTap(s, n) {
    let count = n === 'max' ? maxAffordable(s.tapLevel, s.gold) : n;
    if (Number.isInteger(count)) count = Math.min(count, tapCap(s) - s.tapLevel);
    if (!Number.isInteger(count) || count <= 0) return false;
    const cost = upgradeCost(s.tapLevel, count);
    if (B.gt(cost, s.gold)) return false;
    s.gold = B.sub(s.gold, cost);
    s.tapLevel += count;
    return true;
  }

  // ---------- способности главного героя ----------
  function abilityUnlocked(s, id) { return Math.max(s.maxFloor, s.bestFloor) >= abilityDef(id).unlockFloor; }
  function abilityReady(s, id) { return abilityUnlocked(s, id) && s.abilities[id].cd <= 0; }
  function useAbility(s, id) {
    const def = abilityDef(id);
    if (!def || !abilityReady(s, id) || modeRule(s) === 'trial') return [];
    const st = s.abilities[id];
    st.cd = def.cooldown * Math.max(0.2, 1 - treePower(s, 'abilityCd')); st.active = def.duration; st.acc = 0;
    return [{ type: 'ability', id, name: def.name }];
  }
  function setAbilityAuto(s, id, on) { if (abilityDef(id)) s.abilities[id].auto = !!on; }

  function tickAbilities(s, dt, events) {
    for (const def of CONFIG.abilities) {
      const st = s.abilities[def.id];
      st.cd = Math.max(0, st.cd - dt);
      if (st.active > 0) {
        if (def.id === 'flurry' && s.enemy.alive) {
          st.acc += dt * def.tapsPerSec;
          while (st.acc >= 1 && s.enemy.alive) { st.acc -= 1; if (modeRule(s) !== 'alliesOnly') dealDamage(s, tapDamage(s), 'tap', events); }
        }
        st.active = Math.max(0, st.active - dt);
      }
      if (st.auto && s.enemy.alive && abilityReady(s, def.id)) events.push(...useAbility(s, def.id));
    }
  }

  // ---------- 0.99: цепочка героев за золото (как в «Крушителях») ----------
  function chainList() {
    const R = CONFIG.rarities, top = R.indexOf(CONFIG.goldHire.maxRarity), cage = CONFIG.cage && CONFIG.cage.ally;
    return CONFIG.allies.filter(a => !a.hidden && !a.seasonal && a.id !== cage && R.indexOf(a.rarity) <= top)
      .map((a, i) => ({ a, i })).sort((x, y) => x.a.hireCost - y.a.hireCost || x.i - y.i).map(x => x.a);
  }
  // Герой уже получен: куплен за золото, пришёл из Портала (копии) или открыт не как стартовый
  function chainOwned(s, id) {
    const h = s.heroes[id], a = allyDef(id);
    return (s.goldHired || []).includes(id) || h.copies > 0 || (h.unlocked && !a.starter) || s.allies[id].level > 0 ||
      (!!CONFIG.cage && CONFIG.cage.ally === id && !!s.cageFreed);   // герой из клетки остаётся и после ритуала
  }
  function chainNext(s) { const a = chainList().find(x => !chainOwned(s, x.id)); return a ? a.id : null; }
  function buyChainHero(s) {
    const id = chainNext(s); if (!id) return null;
    const cost = allyDef(id).hireCost;
    if (B.gt(cost, s.gold)) return null;
    s.gold = B.sub(s.gold, cost);
    s.heroes[id].unlocked = true; s.allies[id].level = Math.max(1, s.allies[id].level);
    if (!s.goldHired) s.goldHired = [];
    if (!s.goldHired.includes(id)) s.goldHired.push(id);
    return id;
  }
  function buyAlly(s, id, n) {
    if (!allyDef(id) || !s.heroes[id].unlocked) return false;
    let count = n === 'max' ? allyMax(s, id) : n;
    if (Number.isInteger(count)) count = Math.min(count, allyCap(s, id) - s.allies[id].level);
    if (!Number.isInteger(count) || count <= 0) return false;
    const cost = allyCost(s, id, count);
    if (B.gt(cost, s.gold)) return false;
    s.gold = B.sub(s.gold, cost);
    s.allies[id].level += count;
    return true;
  }

