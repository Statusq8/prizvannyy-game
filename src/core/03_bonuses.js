  // ==== src/core/03_bonuses.js — Бонусы: души, дерево, алхимия, классы, кости, питомцы, усилитель, руны, тотемы, криты ====
  // ---------- души и артефакты ----------
  function artDef(id) { return CONFIG.artifacts.find(a => a.id === id); }
  function artLevel(s, id) { return s.artifacts[id] | 0; }
  // Суммарная сила эффекта данного вида от всех найденных артефактов
  function artPower(s, kind) {
    let x = 0;
    for (const a of CONFIG.artifacts) if (a.kind === kind) x += a.per * artLevel(s, a.id);
    return x;
  }
  function soulMult(s) { return B.add(1, B.mul(CONFIG.souls.dpsPerSoul, s.souls)); }
  // ---------- дерево душ ----------
  function treeNodes() { const o = []; for (const b of CONFIG.soulTree) b.nodes.forEach((n, i) => o.push({ ...n, branch: b, index: i })); return o; }
  const TREE = treeNodes();
  function treeDef(id) { return TREE.find(n => n.id === id); }
  function treeLevel(s, id) { return (s.tree && s.tree[id]) | 0; }
  function eventBuff(s, kind) { const e = s.event && CONFIG.events.list.find(x => x.id === s.event.id); return (e && e.buff[kind]) || 0; }
  function bossDmgMult(s) { return (1 + treePower(s, 'bossDmg')) * (1 + passivePower(s, 'bossDmg')) * (1 + runePower(s, 'bossDmg')) * (1 + eventBuff(s, 'bossDmg')) * (1 + petBonus(s, 'boss')); }
  function shardMult(s) { return (1 + treePower(s, 'shards')) * (1 + passivePower(s, 'shards')) * (1 + runePower(s, 'shards')) * (1 + eventBuff(s, 'shards')) * (1 + bonePower(s, 'shards')) * potionMult(s, 'shards'); }
  // ---------- алхимия (0.60) ----------
  function potionDef(id) { return CONFIG.alchemy.potions.find(p => p.id === id); }
  function potionMult(s, kind) { let m = 1; for (const p of CONFIG.alchemy.potions) if (p.kind === kind && (s.potions[p.id] || 0) > 0) m *= p.mult; return m; }
  function potionCost(s, id) { const p = potionDef(id); return p ? { shard: Math.ceil(shardsForBoss(Math.max(1, s.bestFloor)) * p.shardsPer), essence: p.essence } : null; }
  function brewPotion(s, id) {
    const p = potionDef(id), c = potionCost(s, id), A = CONFIG.alchemy;
    if (!p || s.materials.shard < c.shard || s.essence < c.essence || (s.potions[id] || 0) + p.sec > A.maxSec) return false;
    s.materials.shard -= c.shard; s.essence -= c.essence;
    s.potions[id] = (s.potions[id] || 0) + p.sec; cnt(s, 'potion');
    return true;
  }
  function tickPotions(s, dt) { for (const id in s.potions) { s.potions[id] -= dt; if (s.potions[id] <= 0) delete s.potions[id]; } }
  // Бонусы дерева душ и класса героя одного вида складываются
  function treePower(s, kind) { let x = classPower(s, kind); for (const n of TREE) if (n.kind === kind) x += n.per * treeLevel(s, n.id); return x; }
  // ---------- классы главного героя ----------
  function classDef(id) { return CONFIG.classes.list.find(c => c.id === id); }
  function classPower(s, kind) {
    const k = s.cls && classDef(s.cls.id);
    if (!k) return 0;
    let x = 0; for (const n of k.nodes) if (n.kind === kind) x += n.per * (s.cls.spent[n.id] | 0);
    return x;
  }
  function classUnlocked(s) { return s.bestFloor >= CONFIG.classes.unlockFloor; }
  function classPoints(s) { const K = CONFIG.classes; return classUnlocked(s) ? Math.floor(s.bestFloor / K.pointsPerFloors) + K.pointsPerRitual * s.rituals : 0; }
  function classSpent(s) { let n = 0; for (const id in s.cls.spent) n += s.cls.spent[id]; return n; }
  function classFree(s) { return classPoints(s) - classSpent(s); }
  // Выбор/смена класса: раз в день (dayKey); вложенные очки возвращаются
  function canChangeClass(s, dayKey) { return classUnlocked(s) && (!s.cls.id || s.cls.changeDay !== dayKey); }
  function chooseClass(s, id, dayKey) {
    if (!classDef(id) || s.cls.id === id || !canChangeClass(s, dayKey)) return false;
    if (s.cls.id) s.cls.changeDay = dayKey;      // первый выбор бесплатный и не тратит смену дня
    s.cls.id = id; s.cls.spent = {};
    return true;
  }
  // 2-й ярус открыт, когда навык над ним (req) на максимуме
  function classNodeOpen(s, nid) { const n = classNode(s, nid); if (!n) return false; if (!n.req) return true; const p = classNode(s, n.req); return !!p && (s.cls.spent[p.id] | 0) >= p.max; }
  function classNode(s, nid) { const k = classDef(s.cls.id); return k && k.nodes.find(n => n.id === nid); }
  function buyClassNode(s, nid) {
    const n = classNode(s, nid);
    if (!n || classFree(s) < 1 || (s.cls.spent[nid] | 0) >= n.max || !classNodeOpen(s, nid)) return false;
    s.cls.spent[nid] = (s.cls.spent[nid] | 0) + 1;
    return true;
  }
  // ---------- кости монстров ----------
  function boneSlot(id) { return CONFIG.bones.slots.find(x => x.id === id); }
  function boneValue(b) {
    const X = CONFIG.bones;
    return boneSlot(b.slot).base * Math.pow(X.tierPower, b.tier) * (1 + X.perLevel * b.lvl) * Math.pow(X.gradePower, b.grade - 1);
  }
  function equippedOn(s, who) { return s.bones.filter(b => b.on === who); }
  // Бонус костей вида kind у героя who (или у всех — для золота и осколков)
  function bonePower(s, kind, who) {
    let x = 0;
    for (const b of s.bones) if (b.on && (who === undefined || b.on === who) && boneSlot(b.slot).kind === kind) x += boneValue(b);
    return x;
  }
  // Личный множитель героя от костей: рёбра (+%) × позвоночник (множитель)
  function boneMult(s, who) { return (1 + bonePower(s, 'selfDps', who)) * (1 + bonePower(s, 'selfMult', who)); }
  // Чей это урон: главный герой или союзник
  function damageOwner(source) {
    if (source === 'tap' || source === 'heroAuto') return 'hero';
    if (source.startsWith('ult:')) return source.slice(4);
    return source === 'reserve' ? null : source;
  }
  function boneEnemyMult(s, source) {
    const who = damageOwner(source);
    if (!who) return 1;
    return 1 + bonePower(s, s.enemy.isBoss ? 'bossDmg' : 'mobDmg', who);
  }
  // Выпадение кости: детерминированный бросок (не тратит s.rng) — шанс, редкость, слот
  function rollBone(s, chance, salt) {
    const X = CONFIG.bones, k = s.stats.kills + (s.counters.boneRoll || 0) * 7919;
    s.counters.boneRoll = (s.counters.boneRoll || 0) + 1;
    if (hash01(k, salt, 17) >= chance) return null;
    const minT = Math.min(4, Math.floor(s.bestFloor / X.rarityFloorStep));
    const w = X.rarityWeights.map((v, i) => (i < minT || !tierOpen(s, i) ? 0 : v)), tot = w.reduce((a, b) => a + b, 0);
    let y = hash01(k, salt, 29) * tot, tier = w.length - 1;
    for (let i = 0; i < w.length; i++) { y -= w[i]; if (y < 0) { tier = i; break; } }
    const slot = X.slots[Math.floor(hash01(k, salt, 41) * X.slots.length) % X.slots.length].id;
    const b = { id: s.boneSeq++, slot, tier, lvl: 0, grade: 1, on: null, lock: tier >= 4 };   // A+ сразу под защитой
    s.bones.push(b); cnt(s, 'bone');
    return b;
  }
  function boneById(s, id) { return s.bones.find(b => b.id === id); }
  function equipBone(s, id, who) {
    const b = boneById(s, id);
    if (!b || (who !== 'hero' && (!allyDef(who) || !s.heroes[who].unlocked))) return false;
    for (const o of s.bones) if (o.on === who && o.slot === b.slot) o.on = null;   // в слоте одна кость
    b.on = who;
    return true;
  }
  function unequipBone(s, id) { const b = boneById(s, id); if (!b || !b.on) return false; b.on = null; return true; }
  function boneUpCost(b) { const X = CONFIG.bones; return b.lvl >= X.maxLevel ? null : Math.ceil(X.upDust * (b.tier + 1) * Math.pow(X.upGrowth, b.lvl)); }
  function upgradeBone(s, id) {
    const b = boneById(s, id), c = b && boneUpCost(b);
    if (!c || s.materials.dust < c) return false;
    s.materials.dust -= c; b.lvl++;
    return true;
  }
  // Грейд — следующий этап силы, без предела (GDD §9); нужен полный уровень
  function gradeCost(b) {
    const X = CONFIG.bones;
    if (b.lvl < X.maxLevel) return null;
    return { dust: Math.ceil(X.gradeDust * (b.tier + 1) * Math.pow(X.gradeGrowth, b.grade - 1)), shards: heartShards(X.gradeHearts * b.grade), hearts: 0 };
  }
  function gradeUpBone(s, id) {
    const b = boneById(s, id), c = b && gradeCost(b);
    if (!c || s.materials.dust < c.dust || s.materials.shard < c.shards) return false;
    s.materials.dust -= c.dust; s.materials.shard -= c.shards; b.grade++; b.lvl = 0;
    return true;
  }
  function setBoneLock(s, id, on) { const b = boneById(s, id); if (!b) return false; b.lock = !!on; return true; }
  function recycleValue(b) { return CONFIG.bones.recycleDust * Math.pow(2, b.tier) * b.grade; }
  // Переработка: исчезает навсегда, даёт пыль. Защищённые и надетые — нельзя
  function recycleBones(s, ids) {
    let dust = 0, n = 0;
    for (const id of ids) {
      const b = boneById(s, id);
      if (!b || b.lock || b.on) continue;
      dust += recycleValue(b); n++;
      s.bones = s.bones.filter(x => x !== b);
    }
    s.materials.dust += dust;
    return n ? { count: n, dust } : null;
  }

  // ---------- питомцы 2.0 ----------
  (function buildPets() {
    const P = CONFIG.pets;
    CONFIG.rarities.forEach((r, ri) => {
      P.names[r].forEach(([id, name, icon], j) => {
        const type = P.types[(ri + j) % P.types.length];
        const floor = j < 2 ? P.floors[r][j] : null;                          // 3-й — только событие «Логово»
        const home = (floor || P.floors[r][1] + 50) + 1;                     // биом сразу после этажа выдачи
        P.list.push({ id, name, icon, rank: r, type, floor, event: !floor, biome: biomeOf(home).id, interval: P.interval[type] });
      });
    });
  })();
  function petDef(id) { return CONFIG.pets.list.find(p => p.id === id); }
  function petForm(s, id) { return s.pets.forms[id] | 0; }                     // 0 — не получен, 1…3 — форма
  function petLevel(s, id) { return petForm(s, id); }                          // совместимость: «получен» = форма ≥ 1
  function petRankIdx(p) { return CONFIG.rarities.indexOf(p.rank); }
  function petPower(p, form) {
    const P = CONFIG.pets, w = P.power[p.rank], f = Math.max(1, form) - 1;
    const bonus = p.type === 'ult' ? w[3] * P.formUlt[f] : (p.type === 'boss' ? w[2] : w[1]) * P.formMult[f];
    return { share: w[0] * P.formMult[f], bonus };
  }
  function petShare(s, id) { return petPower(petDef(id), petForm(s, id)).share; }
  // бонус активного питомца нужного типа (0, если питомца нет или тип другой)
  function petBonus(s, type) {
    const p = s.pets && s.pets.active && petDef(s.pets.active);
    return p && p.type === type ? petPower(p, petForm(s, p.id)).bonus : 0;
  }
  function petEvoCost(s, id) {
    const p = petDef(id), f = petForm(s, id), P = CONFIG.pets;
    return !p || !f || f >= P.forms.length ? null : Math.ceil(P.evoCost[f - 1] * Math.pow(P.rankGrowth, petRankIdx(p)));
  }
  function petFrags(s, id) { return s.pets.frags[id] | 0; }
  function canEvolvePet(s, id) { const c = petEvoCost(s, id); return c != null && petFrags(s, id) >= c; }
  function evolvePet(s, id) {
    if (!canEvolvePet(s, id)) return false;
    s.pets.frags[id] -= petEvoCost(s, id); s.pets.forms[id]++; cnt(s, 'petEvo');
    return true;
  }
  function grantPet(s, id, events) {
    if (petForm(s, id)) return false;
    s.pets.forms[id] = 1;
    if (!s.pets.active) s.pets.active = id;
    if (events) events.push({ type: 'pet', id });
    return true;
  }
  // башенные питомцы — за первую победу над боссом своего этажа (рекорд за всю игру; выдаются и задним числом)
  function petsCatchUp(s, events) {
    if (!unlockedAt(s, 'pets')) return;
    for (const p of CONFIG.pets.list) if (p.floor && (s.bestCleared | 0) >= p.floor) grantPet(s, p.id, events);
  }
  // «Логово»: ранг недели по кругу E → GOD
  function lairRank(s) { const w = s.event && s.event.week ? weekNum(s.event.week) : 0; const R = CONFIG.rarities; return R[((w % R.length) + R.length) % R.length]; }
  function lairPet(s) { return CONFIG.pets.list.find(p => p.event && p.rank === lairRank(s)); }
  function lairSync(s) { const wk = (s.event && s.event.week) || ''; if (s.pets.lair.week !== wk) s.pets.lair = { week: wk, kills: 0 }; }
  // Хранитель: моб питомца в его биоме, на этажах не ниже этажа питомца; ≈1 из 50 врагов; в офлайне не появляется
  function keeperRoll(s, events) {
    if (!unlockedAt(s, 'pets')) return;
    const P = CONFIG.pets, bio = biomeOf(s.floor).id;
    const pool = P.list.filter(p => p.biome === bio && s.floor >= (p.floor || P.floors[p.rank][1]) && petForm(s, p.id) < P.forms.length);
    if (!pool.length) return;
    const k = s.stats.kills;
    if (hash01(k, s.floor, 61) >= P.keeperChance) return;
    const p = pool[Math.floor(hash01(k, s.floor, 67) * pool.length) % pool.length];
    lairSync(s);
    const lair = p.rank === lairRank(s);
    let n = P.keeperDrop[0] + Math.floor(hash01(k, s.floor, 71) * (P.keeperDrop[1] - P.keeperDrop[0] + 1));
    if (lair) { n *= P.lairFrags; s.pets.lair.kills++; }
    s.pets.frags[p.id] = petFrags(s, p.id) + n;
    events.push({ type: 'petFrag', id: p.id, n });
    const lp = lairPet(s);
    if (lair && lp && s.pets.lair.kills >= P.lairKeepers) grantPet(s, lp.id, events);
  }
  function setPet(s, id) { if (!petForm(s, id)) return false; s.pets.active = id; s.petAcc = 0; return true; }
  function recallPet(s) { s.pets.active = null; s.petAcc = 0; return true; }
  // Сырой DPS отряда (без постоянных множителей — их питомец получает сам через permMult)
  function squadRawDps(s) { return CONFIG.allies.reduce((sum, a) => B.add(sum, contribDps(s, a.id)), 0); }
  function petHit(s) { const p = s.pets.active && petDef(s.pets.active); return p && petForm(s, p.id) ? B.mul(squadRawDps(s), petShare(s, p.id) * p.interval) : 0; }
  // Средний DPS питомца с постоянными множителями (для показа и офлайна)
  function petDps(s) { const p = s.pets.active && petDef(s.pets.active); return p ? B.mul(B.div(petHit(s), p.interval), permMult(s, 'pet')) : 0; }

  // ---------- переносимый усилитель ----------
  // «Печать силы» убрана в 0.51 (ответ 162): не открывается, множитель всегда 1; поле сохранения оставлено для совместимости
  function boosterUnlocked(s) { return false; }
  function boosterMult(s, who) { return 1; }
  // Сколько мс ждать до следующего переноса (0 — можно)
  function boosterWait(s, now) { return s.booster.owner == null ? 0 : Math.max(0, s.booster.movedAt + CONFIG.booster.cooldownH * 3600e3 - now); }
  function moveBooster(s, who, now) {
    if (!boosterUnlocked(s) || s.booster.owner === who || boosterWait(s, now) > 0) return false;
    if (who !== 'hero' && (!allyDef(who) || !s.heroes[who].unlocked)) return false;
    s.booster.owner = who; s.booster.movedAt = now;
    return true;
  }
  function branchOpen(s, b) { return s.rituals >= b.rituals; }
  function treeNodeOpen(s, id) {
    const n = treeDef(id);
    return !!n && branchOpen(s, n.branch) && (n.index === 0 || treeLevel(s, n.branch.nodes[n.index - 1].id) > 0);
  }
  function treeCost(s, id) {
    const n = treeDef(id), lv = treeLevel(s, id);
    if (!n || lv >= n.max) return null;
    return Math.ceil(n.cost * Math.pow(n.growth, lv));
  }
  function buyTreeNode(s, id) {
    const cost = treeCost(s, id);
    if (cost == null || !treeNodeOpen(s, id) || B.lt(s.souls, cost)) return false;
    s.souls = B.sub(s.souls, cost);
    s.tree[id] = treeLevel(s, id) + 1;
    return true;
  }
  // ---------- руны ----------
  function runeKind(id) { return CONFIG.runes.kinds.find(k => k.id === id); }
  function runeValue(r) { const R = CONFIG.runes; return runeKind(r.type).base * Math.pow(R.tierPower, r.tier) * (1 + R.perLevel * r.lvl); }
  // Лучшая руна вида (действует только она)
  function bestRune(s, type) { let b = null; for (const r of s.runes) if (r.type === type && (!b || runeValue(r) > runeValue(b))) b = r; return b; }
  function runePower(s, kind) {
    let x = 0;
    for (const k of CONFIG.runes.kinds) if (k.kind === kind) { const b = bestRune(s, k.id); if (b) x += runeValue(b); }
    return x;
  }
  // ---------- тотемы ----------
  function totemCount(s) { return Object.keys(s.totems).length; }
  function totemMult(s) {
    const T = CONFIG.totems;
    let lv = 0; for (const id in s.totems) lv += s.totems[id];
    const sets = T.collection.filter(n => totemCount(s) >= n).length;
    return (1 + T.dpsPerLevel * lv) * Math.pow(T.collectionMult, sets);
  }
  function goldMult(s) { return softcap((1 + artPower(s, 'gold')) * (1 + treePower(s, 'gold')) * (1 + runePower(s, 'gold')) * (1 + eventBuff(s, 'gold')) * (1 + bonePower(s, 'gold')) * (1 + petBonus(s, 'gold')) * (1 + titlePower(s, 'gold')) * (1 + passivePower(s, 'gold')) * (1 + bondPower(s, 'gold')) * (1 + trophyPower(s, 'gold')), CONFIG.softcap.goldStart) * potionMult(s, 'gold') * (1 + biomeTitlePower(s, 'gold')); }
  // 0.132: титул биома действует только на этажах своего биома (вне режимов)
  function biomeTitlePower(s, kind) { return !s.mode && s.biomeTitles && s.biomeTitles[biomeOf(s.floor).id] ? CONFIG.biomeTitles[kind] || 0 : 0; }
  // 0.134: пассивки героев (кэш на тик: s._pv сбрасывает tick)
  function passiveTier(s, id) { const h = s.heroes[id], a = s.allies[id]; if (!h || !h.unlocked) return 0; return (1 + (h.stars | 0) + (h.evo | 0)) * (1 + Math.floor(((a && a.level) | 0) / CONFIG.passives.levelStep)); }
  function heroPassive(s, id) {
    const P = CONFIG.passives, d = P.heroes[id], a = allyDef(id); if (!d || !a) return null;
    const tier = passiveTier(s, id); return { kind: d[0], name: d[1], tier, value: P.base[d[0]] * (P.rarity[heroRarity(s, id)] || 1) * tier };
  }
  function passivePower(s, kind) {
    if (!s._pv) { s._pv = {}; for (const id in CONFIG.passives.heroes) { const p = heroPassive(s, id); if (p && p.tier) s._pv[p.kind] = (s._pv[p.kind] || 0) + p.value; }
      for (const k in CONFIG.passives.base) { const v = achPower(s, k); if (v) s._pv[k] = (s._pv[k] || 0) + v; } }   // 0.141: + бонусы достижений

    return s._pv[kind] || 0;
  }
  function heroAutoTps(s) { return Math.min(CONFIG.heroAutoMaxTps, artLevel(s, 'blade')); }
  function bossTime(s) { return CONFIG.bossTimeSec + artPower(s, 'bossTime') + classPower(s, 'bossTime') + passivePower(s, 'bossTime'); }
  function hasHeroAuto(s) { return artLevel(s, 'blade') > 0; }
  // Постоянный множитель урона по источнику: души × грааль × (герой или союзники)
  function permMult(s, source) {
    let m = (1 + artPower(s, 'allDmg')) * (1 + runePower(s, 'allDmg')) * (1 + titlePower(s, 'allDmg')) * (1 + passivePower(s, 'allDmg')) * (1 + bondPower(s, 'allDmg')) * (1 + trophyPower(s, 'allDmg')) * potionMult(s, 'allDmg') * totemMult(s) * achMult(s) * collectionMult(s) * (1 + petBonus(s, 'squad'));
    if (source === 'tap' || source === 'heroAuto') m *= (1 + artPower(s, 'tapDmg')) * (1 + passivePower(s, 'tapDmg')) * (1 + artPower(s, 'heroAuto')) * (1 + treePower(s, 'heroDmg')) * (1 + runePower(s, 'heroDmg')) * boosterMult(s, 'hero') * boneMult(s, 'hero');
    else m *= (1 + artPower(s, 'allyDmg')) * (1 + passivePower(s, 'allyDmg')) * (1 + treePower(s, 'allyDmg')) * (1 + runePower(s, 'allyDmg')) * (1 + eventBuff(s, 'allyDmg')) * collectionAllyMult(s);
    return B.mul(soulMult(s), softcap(m, CONFIG.softcap.start));
  }

  function killGold(floor, isBoss) {
    const l = Math.log10(CONFIG.goldBase * biomeOf(floor).gold * (isBoss ? CONFIG.bossGoldMult : 1)) + floorSteps(floor) * Math.log10(CONFIG.goldGrowth);
    if (l >= LOGLIM) return B.fromLog10(l);
    const g = CONFIG.goldBase * Math.pow(CONFIG.goldGrowth, floorSteps(floor)) * biomeOf(floor).gold;
    return Math.ceil(isBoss ? g * CONFIG.bossGoldMult : g);
  }
  function firstClearGold(floor) {
    const l = Math.log10(CONFIG.goldBase * CONFIG.firstClearGoldMult) + floorSteps(floor) * Math.log10(CONFIG.goldGrowth);
    if (l >= LOGLIM) return B.fromLog10(l);
    return Math.ceil(CONFIG.goldBase * Math.pow(CONFIG.goldGrowth, floorSteps(floor)) * CONFIG.firstClearGoldMult);
  }
  // Сколько вех пройдено на этом уровне
  function milestonesReached(level) {
    const list = CONFIG.milestones, last = list[list.length - 1];
    let n = 0;
    for (const m of list) if (level >= m) n++;
    if (level > last) n += Math.floor((level - last) / CONFIG.milestoneEvery);
    return n;
  }
  function milestoneMultAt(level) { return Math.pow(CONFIG.milestoneMult, milestonesReached(level)); }
  function nextMilestone(level) {
    for (const m of CONFIG.milestones) if (level < m) return m;
    const last = CONFIG.milestones[CONFIG.milestones.length - 1];
    return last + (Math.floor((level - last) / CONFIG.milestoneEvery) + 1) * CONFIG.milestoneEvery;
  }
  // Урон с вехами: level · 3^вех — при большом числе вех считаем через логарифм
  function withMilestones(base, level) {
    if (level <= 0) return 0;
    const l = Math.log10(base * level) + milestonesReached(level) * Math.log10(CONFIG.milestoneMult);
    return l >= LOGLIM ? B.fromLog10(l) : base * level * milestoneMultAt(level);
  }
  function tapDamageAt(level) { return withMilestones(CONFIG.tapBaseDamage, level); }
  // Удар героя + «Благословение» союзников 100+ уровня (доля их DPS)
  function tapDamage(s) {
    let d = tapDamageAt(s.tapLevel);
    const bl = CONFIG.perks.find(p => p.kind === 'bless');
    for (const a of CONFIG.allies) if (s.allies[a.id].level >= bl.lvl) d = B.add(d, B.mul(allyDpsAt(a.id, s.allies[a.id].level), bl.value));
    return d;
  }

  // ---------- криты ----------
  function abilityDef(id) { return CONFIG.abilities.find(a => a.id === id); }
  // Сюда же добавятся бонусы артефактов (этап 4); временный бонус даёт способность «Клеймо охотника»
  // Временный бонус критов от ультимейта (GDD §3: допустим) — не прокачивается, общий предел шанса 50% остаётся
  function critBuffOn(s) { return s.critBuff && s.critBuff.t > 0 ? s.critBuff : null; }
  function critChance(s) {
    let ch = CONFIG.crit.baseChance + artPower(s, 'critChance') + passivePower(s, 'critChance');
    if (s.abilities.hunt.active > 0) ch += abilityDef('hunt').critChanceBonus;
    const cb = critBuffOn(s); if (cb) ch += cb.ch;
    return Math.min(CONFIG.crit.maxChance, ch);
  }
  function critMult(s) { const cb = critBuffOn(s); return CONFIG.crit.baseMult + artPower(s, 'critMult') + passivePower(s, 'critMult') + (cb ? cb.dmg : 0); }
  function softcap(m, start) { const P = CONFIG.softcap; return m <= start ? m : start * Math.pow(m / start, P.power); }
  function enemyName(floor, index, isBoss) {
    const b = biomeOf(floor);
    if (isBoss) return isFinalBoss(floor) ? b.final : b.bosses[(floor - 1) % b.bosses.length];
    const pool = b.early && (floor - 1) % CONFIG.biomeFloors < 10 ? b.enemies.slice(0, b.early) : b.enemies;
    return pool[(floor * 7 + index * 3) % pool.length];
  }
  // Детерминированный «случайный» выбор редкого врага: не тратит s.rng (тесты и гача не сбиваются)
  function hash01(a, b, c) {
    let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  function rollRare(s, floor, index) {
    const R = CONFIG.rare;
    if (floor < R.minFloor || index === CONFIG.enemiesPerFloor) return null;
    const x = hash01(floor, index, s.stats.kills);
    const chance = biomeOf(floor).rare * (1 + treePower(s, 'rareChance')) * (1 + eventBuff(s, 'rareChance'));
    if (x >= chance) return null;
    const total = R.kinds.reduce((t, k) => t + k.weight, 0);
    let y = x / chance * total;
    for (const k of R.kinds) { y -= k.weight; if (y < 0) return k; }
    return R.kinds[R.kinds.length - 1];
  }
  function rareDef(id) { return CONFIG.rare.kinds.find(k => k.id === id); }

  // Стоимость n покупок, если уже куплено k (геометрическая сумма): base·g^k·(g^n−1)/(g−1)
  function seriesCost(base, g, k, n) {
    if (n <= 0) return 0;
    const lg = Math.log10(g), lf = Math.log10(base) + k * lg;
    if (lf + n * lg < LOGLIM) return Math.ceil(base * Math.pow(g, k) * (Math.pow(g, n) - 1) / (g - 1));
    const ls = n * lg > 15 ? n * lg - Math.log10(g - 1) : Math.log10((Math.pow(g, n) - 1) / (g - 1));
    return B.fromLog10(lf + ls);
  }
  function seriesMax(base, g, k, gold) {
    if (B.lte(gold, 0)) return 0;
    const lg = Math.log10(g), lf = Math.log10(base) + k * lg;
    const x = B.log10(gold) + Math.log10(g - 1) - lf;          // log10(gold·(g−1)/first)
    let n = Math.floor((x > 15 ? x : Math.log10(Math.pow(10, x) + 1)) / lg);
    if (!isFinite(n) || n < 0) n = 0;
    while (n > 0 && B.gt(seriesCost(base, g, k, n), gold)) n--;   // защита от округления
    while (B.lte(seriesCost(base, g, k, n + 1), gold)) n++;
    return n;
  }
  // Удар: уровень 1 — бесплатный стартовый, поэтому куплено (level − 1)
  function upgradeCost(level, n) {
    return seriesCost(CONFIG.tapUpgradeBaseCost, CONFIG.tapUpgradeCostGrowth, level - 1, n);
  }
  function maxAffordable(level, gold) {
    return seriesMax(CONFIG.tapUpgradeBaseCost, CONFIG.tapUpgradeCostGrowth, level - 1, gold);
  }

