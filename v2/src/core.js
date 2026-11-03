// Ядро игры: только логика, без интерфейса. Работает в браузере и в Node (тесты).
(function (root) {
  'use strict';

  // ВРЕМЕННЫЕ значения для испытаний. По GDD (раздел 16) это TBD — не окончательный баланс.
  const CONFIG = {
    saveVersion: 4,
    enemiesPerFloor: 10,          // утверждено GDD: 1–9 обычные, 10-й босс
    enemyBaseHp: 10,
    enemyHpGrowth: 1.18,          // экспоненциальный рост HP по этажам
    bossHpMult: 6,
    bossTimeSec: 30,              // таймер босса (TBD)
    goldBase: 1,
    goldGrowth: 1.15,
    bossGoldMult: 8,
    firstClearGoldMult: 20,       // разовая награда за первое прохождение этажа
    tapBaseDamage: 1,
    tapUpgradeBaseCost: 5,
    tapUpgradeCostGrowth: 1.08,
    respawnDelaySec: 0.35,
    // Вехи уровней: на уровнях из списка, а дальше каждые milestoneEvery уровней,
    // урон удара/союзника умножается на milestoneMult. Временные числа для испытаний.
    milestones: [10, 25, 50, 75, 100],
    milestoneEvery: 25,
    milestoneMult: 3,
    // Криты — единственные вторичные боевые статы (GDD §3). Действуют на любой урон.
    // Прокачиваются ТОЛЬКО артефактами (решение пользователя: нет отдельных веток критов за золото,
    // в дереве душ, рунах, костях и эволюции). Артефакты появятся на этапе 4.
    // Потолок шанса крита 50% для всех источников вместе (обычные удары остаются всегда). Одинаков для героя,
    // союзников и питомца; каждый удар проверяется отдельно. Крит-урон растёт отдельно, тоже только от артефактов.
    crit: { baseChance: 0.05, maxChance: 0.5, baseMult: 2 },
    // Цены старой прокачки критов (0.6) — только для возврата золота при переносе сохранения
    legacyCritRefund: { chanceCost: 100, chanceGrowth: 1.22, multCost: 150, multGrowth: 1.16 },
    // Активные способности главного героя: по умолчанию ручные, у каждой свой переключатель автоиспользования (GDD §3)
    abilities: [
      { id: 'flurry', name: 'Шквал ударов', unlockFloor: 5, cooldown: 60, duration: 5, tapsPerSec: 10 },
      { id: 'hunt', name: 'Клеймо охотника', unlockFloor: 15, cooldown: 90, duration: 10, critChanceBonus: 0.25 },
    ],
    // Герои (GDD §4): редкость E → GOD, портал открывает навсегда, в бою отряд из squadSize,
    // нанятые резервные дают долю reserveShare, ненанятые — ничего. Звёзды повышают только индивидуальный DPS.
    rarities: ['E', 'D', 'C', 'B', 'A', 'S', 'GOD'],
    squadSize: 4,
    reserveShare: 0.25,                       // TBD
    maxStars: 10,
    starDpsBonus: 0.5,                        // +50% индивидуального DPS за звезду (TBD)
    starCopies: [1, 1, 2, 2, 3, 3, 4, 4, 5, 5], // копий на 1-ю … 10-ю звезду (TBD)
    // Портал: обычный баннер. Шансы в %, гарантии (pity) раздельные: A+ и S+ (TBD)
    portal: {
      odds: { E: 40, D: 28, C: 17, B: 9, A: 4.5, S: 1.2, GOD: 0.3 },
      pityA: 30, pityS: 90,
      ticketsPerFifth: 1, ticketsPerTenth: 3, // за первое в игре прохождение босса каждого 5-го / 10-го этажа
    },
    // Каталог героев. Уровень 0 = не нанят в этом забеге. starter — открыт с начала игры.
    allies: [
      { id: 'irene', name: 'Ирэн', role: 'Лучница теней', rarity: 'E', starter: true, baseDps: 4, attackInterval: 0.8,
        hireCost: 25, costGrowth: 1.05,
        ult: { name: 'Ливень стрел', kind: 'nuke', charge: 12, power: 20 } },
      { id: 'borg', name: 'Борг', role: 'Берсерк', rarity: 'D', starter: true, baseDps: 120, attackInterval: 1.6,
        hireCost: 400, costGrowth: 1.05,
        ult: { name: 'Ярость', kind: 'teamBuff', charge: 20, power: 2, duration: 6 } },
      { id: 'lia', name: 'Лиа', role: 'Пиромантка', rarity: 'C', starter: true, baseDps: 4000, attackInterval: 1.1,
        hireCost: 7000, costGrowth: 1.05,
        ult: { name: 'Метка пламени', kind: 'mark', charge: 18, power: 1.5, duration: 8 } },
      { id: 'kael', name: 'Каэль', role: 'Клинок бездны', rarity: 'B', starter: true, baseDps: 150000, attackInterval: 0.45,
        hireCost: 120000, costGrowth: 1.05,
        ult: { name: 'Разрез бездны', kind: 'tapBuff', charge: 25, power: 3, duration: 8 } },
      // открываются порталом
      { id: 'garret', name: 'Гаррет', role: 'Ополченец', rarity: 'E', baseDps: 18, attackInterval: 1.0,
        hireCost: 100, costGrowth: 1.05, ult: { name: 'Удар щитом', kind: 'nuke', charge: 15, power: 15 } },
      { id: 'saya', name: 'Сая', role: 'Метательница ножей', rarity: 'D', baseDps: 900, attackInterval: 0.6,
        hireCost: 2000, costGrowth: 1.05, ult: { name: 'Ядовитые клинки', kind: 'mark', charge: 16, power: 1.4, duration: 6 } },
      { id: 'drake', name: 'Дрейк', role: 'Копейщик', rarity: 'C', baseDps: 40000, attackInterval: 1.2,
        hireCost: 40000, costGrowth: 1.05, ult: { name: 'Боевой клич', kind: 'teamBuff', charge: 22, power: 1.8, duration: 6 } },
      { id: 'noa', name: 'Ноа', role: 'Громовой маг', rarity: 'B', baseDps: 4e6, attackInterval: 1.4,
        hireCost: 2e6, costGrowth: 1.05, ult: { name: 'Цепная молния', kind: 'nuke', charge: 14, power: 25 } },
      { id: 'velma', name: 'Вельма', role: 'Некромантка', rarity: 'A', baseDps: 2e8, attackInterval: 1.0,
        hireCost: 5e7, costGrowth: 1.05, ult: { name: 'Проклятие плоти', kind: 'mark', charge: 18, power: 2, duration: 8 } },
      { id: 'ragnar', name: 'Рагнар', role: 'Рыцарь смерти', rarity: 'A', baseDps: 6e9, attackInterval: 1.5,
        hireCost: 1e9, costGrowth: 1.05, ult: { name: 'Знамя мёртвых', kind: 'teamBuff', charge: 20, power: 2.5, duration: 6 } },
      { id: 'seiren', name: 'Сэйрен', role: 'Повелительница бурь', rarity: 'S', baseDps: 3e11, attackInterval: 0.7,
        hireCost: 3e10, costGrowth: 1.05, ult: { name: 'Око бури', kind: 'tapBuff', charge: 22, power: 4, duration: 8 } },
      { id: 'azrael', name: 'Азраэль', role: 'Ангел пепла', rarity: 'GOD', baseDps: 2e13, attackInterval: 0.9,
        hireCost: 1e12, costGrowth: 1.05, ult: { name: 'Суд пепла', kind: 'nuke', charge: 15, power: 40 } },
    ],
  };

  const ENEMY_NAMES = [
    'Гоблин-падальщик', 'Костяной страж', 'Тень Башни', 'Пустотный бес',
    'Каменный голем', 'Кровавый слизень', 'Призрачный рыцарь', 'Пепельный волк',
    'Слепой культист', 'Ржавый механоид', 'Болотный упырь', 'Кристальный паук',
  ];
  const BOSS_NAMES = [
    'Хранитель Врат', 'Владыка Пепла', 'Королева Теней', 'Пожиратель Душ',
    'Железный Тиран', 'Око Бездны',
  ];

  // ---------- формулы ----------
  function enemyMaxHp(floor, isBoss) {
    const hp = CONFIG.enemyBaseHp * Math.pow(CONFIG.enemyHpGrowth, floor - 1);
    return Math.ceil(isBoss ? hp * CONFIG.bossHpMult : hp);
  }
  function killGold(floor, isBoss) {
    const g = CONFIG.goldBase * Math.pow(CONFIG.goldGrowth, floor - 1);
    return Math.ceil(isBoss ? g * CONFIG.bossGoldMult : g);
  }
  function firstClearGold(floor) {
    return Math.ceil(CONFIG.goldBase * Math.pow(CONFIG.goldGrowth, floor - 1) * CONFIG.firstClearGoldMult);
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
  function tapDamageAt(level) { return CONFIG.tapBaseDamage * level * milestoneMultAt(level); }
  function tapDamage(s) { return tapDamageAt(s.tapLevel); }

  // ---------- криты ----------
  function abilityDef(id) { return CONFIG.abilities.find(a => a.id === id); }
  // Сюда же добавятся бонусы артефактов (этап 4); временный бонус даёт способность «Клеймо охотника»
  function critChance(s) {
    let ch = CONFIG.crit.baseChance;
    if (s.abilities.hunt.active > 0) ch += abilityDef('hunt').critChanceBonus;
    return Math.min(CONFIG.crit.maxChance, ch);
  }
  function critMult(s) { return CONFIG.crit.baseMult; }
  function enemyName(floor, index, isBoss) {
    if (isBoss) return BOSS_NAMES[(floor - 1) % BOSS_NAMES.length];
    return ENEMY_NAMES[(floor * 7 + index * 3) % ENEMY_NAMES.length];
  }

  // Стоимость n покупок, если уже куплено k (геометрическая сумма): base·g^k·(g^n−1)/(g−1)
  function seriesCost(base, g, k, n) {
    if (n <= 0) return 0;
    return Math.ceil(base * Math.pow(g, k) * (Math.pow(g, n) - 1) / (g - 1));
  }
  function seriesMax(base, g, k, gold) {
    const first = base * Math.pow(g, k);
    let n = Math.floor(Math.log(gold * (g - 1) / first + 1) / Math.log(g));
    if (!isFinite(n) || n < 0) n = 0;
    while (n > 0 && seriesCost(base, g, k, n) > gold) n--;   // защита от округления
    while (seriesCost(base, g, k, n + 1) <= gold) n++;
    return n;
  }
  // Удар: уровень 1 — бесплатный стартовый, поэтому куплено (level − 1)
  function upgradeCost(level, n) {
    return seriesCost(CONFIG.tapUpgradeBaseCost, CONFIG.tapUpgradeCostGrowth, level - 1, n);
  }
  function maxAffordable(level, gold) {
    return seriesMax(CONFIG.tapUpgradeBaseCost, CONFIG.tapUpgradeCostGrowth, level - 1, gold);
  }

  // ---------- союзники ----------
  function allyDef(id) { return CONFIG.allies.find(a => a.id === id); }
  function allyDpsAt(id, level) { return allyDef(id).baseDps * level * milestoneMultAt(level); }
  function starMult(s, id) { return 1 + CONFIG.starDpsBonus * s.heroes[id].stars; }
  // Индивидуальный DPS героя (со звёздами), как если бы он был в отряде
  function allyDps(s, id) { return allyDpsAt(id, s.allies[id].level) * starMult(s, id); }
  function inSquad(s, id) { return s.squad.includes(id); }
  // Вклад в общий DPS: отряд — полностью, нанятые резервные — долю, ненанятые — ничего
  function contribDps(s, id) { return allyDps(s, id) * (inSquad(s, id) ? 1 : CONFIG.reserveShare); }
  function autoDps(s) { return CONFIG.allies.reduce((sum, a) => sum + contribDps(s, a.id), 0); }
  function reserveDps(s) { return CONFIG.allies.reduce((sum, a) => sum + (inSquad(s, a.id) ? 0 : contribDps(s, a.id)), 0); }
  function squadDefs(s) { return s.squad.map(allyDef); }
  // Уровень 0 → первая покупка = найм по hireCost
  function allyCost(s, id, n) { const a = allyDef(id); return seriesCost(a.hireCost, a.costGrowth, s.allies[id].level, n); }
  function allyMax(s, id) { const a = allyDef(id); return seriesMax(a.hireCost, a.costGrowth, s.allies[id].level, s.gold); }

  // ---------- состояние ----------
  function newState(opts) {
    const s = {
      floor: 1,            // текущий этаж
      maxFloor: 1,         // самый высокий открытый этаж
      highestCleared: 0,   // самый высокий этаж, где побеждён босс (для разовых наград)
      enemyIndex: 1,
      farming: false,
      gold: 0,
      tapLevel: 1,
      stats: { taps: 0, kills: 0, bossKills: 0 },
      allies: newAllies(),
      buffs: { team: 0, tap: 0, teamPower: 1, tapPower: 1 },  // время и сила баффов (не сохраняется)
      abilities: newAbilities(),
      // постоянное (переживёт ритуал): коллекция, билеты, гарантии, отряд
      heroes: newHeroes(),
      squad: CONFIG.allies.filter(a => a.starter).map(a => a.id).slice(0, CONFIG.squadSize),
      tickets: 0,
      ticketFloor: 0,                            // до какого этажа уже выданы билеты за боссов
      pity: { a: 0, s: 0 },
      reserveAcc: 0,                             // накопитель урона резерва (не сохраняется)
      rng: (opts && opts.rng) || Math.random,   // источник случайности (в тестах подменяется)
      // не сохраняется:
      enemy: null,
      bossTimeLeft: 0,
      respawn: 0,
    };
    spawn(s);
    return s;
  }

  function newAbilities() {
    const o = {};
    // cd — перезарядка, active — сколько ещё действует, auto — автоиспользование, acc — накопитель шквала
    for (const a of CONFIG.abilities) o[a.id] = { cd: 0, active: 0, auto: false, acc: 0 };
    return o;
  }
  function newHeroes() {
    const o = {};
    for (const a of CONFIG.allies) o[a.id] = { unlocked: !!a.starter, copies: 0, stars: 0 };
    return o;
  }
  function newAllies() {
    const o = {};
    // cd — перезарядка атаки, ult — накопленный заряд ультимейта, с (оба не сохраняются)
    for (const a of CONFIG.allies) o[a.id] = { level: 0, cd: a.attackInterval, ult: 0 };
    return o;
  }

  function spawn(s) {
    const isBoss = s.enemyIndex === CONFIG.enemiesPerFloor;
    const hp = enemyMaxHp(s.floor, isBoss);
    s.enemy = { hp, maxHp: hp, isBoss, alive: true, mark: 0, markPower: 1, name: enemyName(s.floor, s.enemyIndex, isBoss) };
    s.bossTimeLeft = isBoss ? CONFIG.bossTimeSec : 0;
    s.respawn = 0;
  }

  // ---------- действия ----------
  // Множители от ультимейтов: Ярость — весь урон отряда, Разрез — тапы, Метка — урон по врагу
  function damageMult(s, source) {
    let m = 1;
    if (s.buffs.team > 0) m *= s.buffs.teamPower;
    if (source === 'tap' && s.buffs.tap > 0) m *= s.buffs.tapPower;
    if (s.enemy.mark > 0) m *= s.enemy.markPower;
    return m;
  }

  function dealDamage(s, dmg, source, events) {
    dmg *= damageMult(s, source);
    const crit = s.rng() < critChance(s);
    if (crit) dmg *= critMult(s);
    s.enemy.hp = Math.max(0, s.enemy.hp - dmg);
    events.push({ type: 'hit', dmg, source, crit });
    if (s.enemy.hp <= 0) kill(s, events);
  }

  function tap(s) {
    const events = [];
    if (!s.enemy.alive) return events;           // нельзя бить мёртвого
    s.stats.taps++;
    dealDamage(s, tapDamage(s), 'tap', events);
    return events;
  }

  function kill(s, events) {
    const isBoss = s.enemy.isBoss;
    s.enemy.alive = false;
    s.respawn = CONFIG.respawnDelaySec;
    const gold = killGold(s.floor, isBoss);
    s.gold += gold;
    s.stats.kills++;
    events.push({ type: 'kill', gold, boss: isBoss });

    if (isBoss) {
      s.stats.bossKills++;
      if (s.floor > s.highestCleared) {
        s.highestCleared = s.floor;
        const bonus = firstClearGold(s.floor);
        s.gold += bonus;
        events.push({ type: 'firstClear', floor: s.floor, gold: bonus });
      }
      if (s.floor > s.ticketFloor) {
        s.ticketFloor = s.floor;
        const n = ticketsForFloor(s.floor);
        s.tickets += n;
        if (n) events.push({ type: 'tickets', n, floor: s.floor });
      }
      s.maxFloor = Math.max(s.maxFloor, s.floor + 1);
      s.floor += 1;
      s.enemyIndex = 1;
      events.push({ type: 'floor', floor: s.floor });
    } else if (s.farming && s.enemyIndex === CONFIG.enemiesPerFloor - 1) {
      s.enemyIndex = 1;                          // фарм: крутим обычных врагов без босса
    } else {
      s.enemyIndex += 1;
    }
  }

  // Фиксированный шаг симуляции
  function tick(s, dt) {
    const events = [];
    s.buffs.team = Math.max(0, s.buffs.team - dt);
    s.buffs.tap = Math.max(0, s.buffs.tap - dt);
    if (s.enemy.alive) s.enemy.mark = Math.max(0, s.enemy.mark - dt);
    for (const a of squadDefs(s)) {
      const st = s.allies[a.id];
      if (st.level > 0) st.ult = Math.min(a.ult.charge, st.ult + dt);   // готовность копится и сохраняется между врагами
    }
    tickAbilities(s, dt, events);   // перезарядка идёт всегда; шквал и автоиспользование — только по живому врагу
    if (!s.enemy.alive) {
      s.respawn -= dt;
      if (s.respawn <= 0) { spawn(s); events.push({ type: 'spawn' }); }
      return events;
    }
    // Ультимейты срабатывают автоматически, как только заряжены и враг жив
    for (const a of squadDefs(s)) {
      const st = s.allies[a.id];
      if (st.level <= 0 || st.ult < a.ult.charge || !s.enemy.alive) continue;
      st.ult = 0;
      fireUlt(s, a, events);
    }
    if (!s.enemy.alive) return events;
    // Автоатаки отряда: перезарядка идёт только пока враг жив
    for (const a of squadDefs(s)) {
      const st = s.allies[a.id];
      if (st.level <= 0) continue;
      st.cd -= dt;
      if (st.cd <= 0 && s.enemy.alive) {
        st.cd += a.attackInterval;
        dealDamage(s, allyDps(s, a.id) * a.attackInterval, a.id, events);
      }
      if (!s.enemy.alive) { for (const b of CONFIG.allies) s.allies[b.id].cd = Math.max(s.allies[b.id].cd, 0); return events; }
    }
    // Резерв: доля DPS нанятых вне отряда, порциями раз в секунду
    const rd = reserveDps(s);
    if (rd > 0) {
      s.reserveAcc += dt;
      if (s.reserveAcc >= 1) { s.reserveAcc -= 1; dealDamage(s, rd, 'reserve', events); if (!s.enemy.alive) return events; }
    }
    if (s.enemy.isBoss) {
      s.bossTimeLeft -= dt;
      if (s.bossTimeLeft <= 0) {
        s.farming = true;
        s.enemyIndex = 1;
        spawn(s);
        events.push({ type: 'bossFail' }, { type: 'spawn' });
      }
    }
    return events;
  }

  function fireUlt(s, a, events) {
    const u = a.ult;
    events.push({ type: 'ult', id: a.id, name: u.name, kind: u.kind });
    if (u.kind === 'nuke') dealDamage(s, allyDps(s, a.id) * u.power, 'ult:' + a.id, events);
    else if (u.kind === 'teamBuff') { s.buffs.team = u.duration; s.buffs.teamPower = u.power; }
    else if (u.kind === 'tapBuff') { s.buffs.tap = u.duration; s.buffs.tapPower = u.power; }
    else if (u.kind === 'mark') { s.enemy.mark = u.duration; s.enemy.markPower = u.power; }
  }

  function challengeBoss(s) {
    s.farming = false;
    s.enemyIndex = CONFIG.enemiesPerFloor;
    spawn(s);
    return [{ type: 'spawn' }];
  }

  function goToFloor(s, floor) {
    if (!Number.isInteger(floor) || floor < 1 || floor > s.maxFloor || floor === s.floor) return [];
    s.floor = floor;
    s.enemyIndex = 1;
    s.farming = floor < s.maxFloor ? s.farming : false;
    spawn(s);
    return [{ type: 'floor', floor }, { type: 'spawn' }];
  }

  // n: число уровней или 'max'
  function buyTap(s, n) {
    const count = n === 'max' ? maxAffordable(s.tapLevel, s.gold) : n;
    if (!Number.isInteger(count) || count <= 0) return false;
    const cost = upgradeCost(s.tapLevel, count);
    if (cost > s.gold) return false;
    s.gold -= cost;
    s.tapLevel += count;
    return true;
  }

  // ---------- способности главного героя ----------
  function abilityUnlocked(s, id) { return s.maxFloor >= abilityDef(id).unlockFloor; }
  function abilityReady(s, id) { return abilityUnlocked(s, id) && s.abilities[id].cd <= 0; }
  function useAbility(s, id) {
    const def = abilityDef(id);
    if (!def || !abilityReady(s, id)) return [];
    const st = s.abilities[id];
    st.cd = def.cooldown; st.active = def.duration; st.acc = 0;
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
          while (st.acc >= 1 && s.enemy.alive) { st.acc -= 1; dealDamage(s, tapDamage(s), 'tap', events); }
        }
        st.active = Math.max(0, st.active - dt);
      }
      if (st.auto && s.enemy.alive && abilityReady(s, def.id)) events.push(...useAbility(s, def.id));
    }
  }

  function buyAlly(s, id, n) {
    if (!allyDef(id) || !s.heroes[id].unlocked) return false;
    const count = n === 'max' ? allyMax(s, id) : n;
    if (!Number.isInteger(count) || count <= 0) return false;
    const cost = allyCost(s, id, count);
    if (cost > s.gold) return false;
    s.gold -= cost;
    s.allies[id].level += count;
    return true;
  }

  // ---------- портал, звёзды, отряд ----------
  function ticketsForFloor(f) {
    const p = CONFIG.portal;
    return f % 10 === 0 ? p.ticketsPerTenth : f % 5 === 0 ? p.ticketsPerFifth : 0;
  }
  const RANK = r => CONFIG.rarities.indexOf(r);
  function rollRarity(s, minRank) {
    const odds = CONFIG.portal.odds;
    const pool = CONFIG.rarities.filter(r => RANK(r) >= minRank);
    const total = pool.reduce((x, r) => x + odds[r], 0);
    let roll = s.rng() * total;
    for (const r of pool) { roll -= odds[r]; if (roll < 0) return r; }
    return pool[pool.length - 1];
  }
  // n призывов за n билетов. Гарантии: S+ каждые pityS, A+ каждые pityA призывов без них.
  function summon(s, n) {
    const p = CONFIG.portal;
    if (!Number.isInteger(n) || n <= 0 || s.tickets < n) return null;
    s.tickets -= n;
    const out = [];
    for (let i = 0; i < n; i++) {
      s.pity.a++; s.pity.s++;
      const min = s.pity.s >= p.pityS ? RANK('S') : s.pity.a >= p.pityA ? RANK('A') : 0;
      const rarity = rollRarity(s, min);
      if (RANK(rarity) >= RANK('A')) s.pity.a = 0;
      if (RANK(rarity) >= RANK('S')) s.pity.s = 0;
      const pool = CONFIG.allies.filter(a => a.rarity === rarity);
      const hero = pool[Math.min(pool.length - 1, Math.floor(s.rng() * pool.length))];
      const h = s.heroes[hero.id];
      const isNew = !h.unlocked;
      if (isNew) h.unlocked = true; else h.copies++;
      out.push({ id: hero.id, rarity, isNew });
    }
    return out;
  }
  function starCost(s, id) {
    const st = s.heroes[id].stars;
    return st >= CONFIG.maxStars ? null : CONFIG.starCopies[st];
  }
  function starUp(s, id) {
    const h = s.heroes[id], need = h && starCost(s, id);
    if (!h || !h.unlocked || need == null || h.copies < need) return false;
    h.copies -= need; h.stars++;
    return true;
  }
  function squadAdd(s, id) {
    if (!allyDef(id) || !s.heroes[id].unlocked || inSquad(s, id) || s.squad.length >= CONFIG.squadSize) return false;
    s.squad.push(id);
    const a = s.allies[id]; a.cd = allyDef(id).attackInterval;
    return true;
  }
  function squadRemove(s, id) {
    const i = s.squad.indexOf(id);
    if (i < 0) return false;
    s.squad.splice(i, 1);
    return true;
  }

  // ---------- сохранение ----------
  function serialize(s) {
    return JSON.stringify({
      v: CONFIG.saveVersion,
      floor: s.floor, maxFloor: s.maxFloor, highestCleared: s.highestCleared,
      enemyIndex: s.enemyIndex, farming: s.farming,
      gold: s.gold, tapLevel: s.tapLevel, stats: s.stats,
      allies: Object.fromEntries(CONFIG.allies.map(a => [a.id, s.allies[a.id].level])),
      abilities: Object.fromEntries(CONFIG.abilities.map(a => [a.id, { cd: s.abilities[a.id].cd, auto: s.abilities[a.id].auto }])),
      heroes: Object.fromEntries(CONFIG.allies.filter(a => s.heroes[a.id].unlocked).map(a => [a.id, { copies: s.heroes[a.id].copies, stars: s.heroes[a.id].stars }])),
      squad: s.squad.slice(), tickets: s.tickets, ticketFloor: s.ticketFloor, pity: { a: s.pity.a, s: s.pity.s },
      savedAt: Date.now(),
    });
  }

  function deserialize(str) {
    let d;
    try { d = JSON.parse(str); } catch (e) { return null; }
    if (!d || typeof d !== 'object') return null;
    if (d.v === 1) { d.v = 2; d.allies = {}; }          // миграция 0.2 → 0.3: союзников ещё не было
    if (d.v === 2) { d.v = 3; d.critChanceLevel = 0; d.critMultLevel = 0; d.abilities = {}; }   // 0.5 → 0.6
    if (d.v === 3) {                                       // 0.6 → 0.7: коллекция героев и портал
      d.v = 4;
      d.heroes = Object.fromEntries(CONFIG.allies.filter(a => a.starter).map(a => [a.id, { copies: 0, stars: 0 }]));
      d.squad = CONFIG.allies.filter(a => a.starter).map(a => a.id).slice(0, CONFIG.squadSize);
      let t = 0; for (let f = 1; f <= (d.highestCleared | 0); f++) t += ticketsForFloor(f);   // билеты за уже пройденных боссов
      d.tickets = t; d.ticketFloor = d.highestCleared | 0; d.pity = { a: 0, s: 0 };
    }
    if (d.v !== CONFIG.saveVersion) return null;
    const int = (x, min) => Number.isInteger(x) && x >= min;
    if (!int(d.floor, 1) || !int(d.maxFloor, 1) || !int(d.highestCleared, 0) ||
        !int(d.enemyIndex, 1) || d.enemyIndex > CONFIG.enemiesPerFloor ||
        !int(d.tapLevel, 1) || typeof d.gold !== 'number' || !isFinite(d.gold) || d.gold < 0 ||
        d.floor > d.maxFloor) return null;
    const s = newState();
    s.floor = d.floor; s.maxFloor = d.maxFloor; s.highestCleared = d.highestCleared;
    s.enemyIndex = d.enemyIndex; s.farming = !!d.farming;
    s.gold = d.gold; s.tapLevel = d.tapLevel;
    if (d.stats) s.stats = {
      taps: d.stats.taps | 0, kills: d.stats.kills | 0, bossKills: d.stats.bossKills | 0,
    };
    const al = d.allies && typeof d.allies === 'object' ? d.allies : {};
    for (const a of CONFIG.allies) {
      const lv = al[a.id];
      if (lv === undefined) continue;
      if (!int(lv, 0)) return null;
      s.allies[a.id].level = lv;
    }
    // Прокачка критов за золото убрана: возвращаем потраченное золото (сохранения 0.6)
    const rf = CONFIG.legacyCritRefund;
    if (int(d.critChanceLevel, 1)) s.gold += seriesCost(rf.chanceCost, rf.chanceGrowth, 0, d.critChanceLevel);
    if (int(d.critMultLevel, 1)) s.gold += seriesCost(rf.multCost, rf.multGrowth, 0, d.critMultLevel);
    const ab = d.abilities && typeof d.abilities === 'object' ? d.abilities : {};
    for (const a of CONFIG.abilities) {
      const x = ab[a.id];
      if (!x) continue;
      const cd = Number(x.cd);
      s.abilities[a.id].cd = isFinite(cd) ? Math.min(Math.max(0, cd), a.cooldown) : 0;
      s.abilities[a.id].auto = !!x.auto;
    }
    // коллекция
    if (!d.heroes || typeof d.heroes !== 'object') return null;
    for (const a of CONFIG.allies) {
      const h = d.heroes[a.id];
      s.heroes[a.id] = { unlocked: !!h || !!a.starter, copies: 0, stars: 0 };
      if (!h) continue;
      if (!int(h.copies, 0) || !int(h.stars, 0) || h.stars > CONFIG.maxStars) return null;
      s.heroes[a.id].copies = h.copies; s.heroes[a.id].stars = h.stars;
    }
    if (!Array.isArray(d.squad) || d.squad.length > CONFIG.squadSize) return null;
    s.squad = [];
    for (const id of d.squad) if (allyDef(id) && s.heroes[id].unlocked && !s.squad.includes(id)) s.squad.push(id);
    if (!int(d.tickets, 0) || !int(d.ticketFloor, 0)) return null;
    s.tickets = d.tickets; s.ticketFloor = d.ticketFloor;
    s.pity = { a: (d.pity && d.pity.a) | 0, s: (d.pity && d.pity.s) | 0 };
    for (const a of CONFIG.allies) if (!s.heroes[a.id].unlocked) s.allies[a.id].level = 0;   // нанять можно только открытых
    spawn(s);                                     // враг появляется с полным HP
    return s;
  }

  // ---------- форматирование чисел ----------
  // Большие числа: K, M, B, T, дальше буквы aa, ab … az, ba … (решение пользователя).
  // Три значащие цифры, отбрасываем лишнее вниз, чтобы не показывать больше, чем есть.
  const SHORT = ['', 'K', 'M', 'B', 'T'];
  function suffix(tier) {
    if (tier < SHORT.length) return SHORT[tier];
    const i = tier - SHORT.length;
    return String.fromCharCode(97 + Math.floor(i / 26) % 26) + String.fromCharCode(97 + i % 26);
  }
  function fmt(n) {
    if (!isFinite(n)) return '∞';
    const neg = n < 0; n = Math.abs(n);
    if (n < 1000) return (neg ? '-' : '') + Math.floor(n);
    let tier = Math.floor(Math.log10(n) / 3);
    let v = n / Math.pow(10, tier * 3);
    if (v >= 1000) { tier++; v /= 1000; }          // защита от погрешности log10
    if (v < 1) { tier--; v *= 1000; }
    const dec = v < 10 ? 2 : v < 100 ? 1 : 0;
    const k = Math.pow(10, dec);
    let txt = (Math.floor(v * k + 1e-9) / k).toFixed(dec);
    if (dec) txt = txt.replace(/\.?0+$/, '');
    return (neg ? '-' : '') + txt + suffix(tier);
  }


  const Core = {
    CONFIG, newState, tap, tick, challengeBoss, goToFloor, buyTap,
    buyAlly, allyDps, allyDpsAt, autoDps, allyCost, allyMax,
    tapDamageAt, milestoneMultAt, milestonesReached, nextMilestone,
    damageMult, critChance, critMult,
    useAbility, setAbilityAuto, abilityUnlocked, abilityReady,
    summon, starUp, starCost, starMult, squadAdd, squadRemove, inSquad, contribDps, reserveDps, ticketsForFloor,
    tapDamage, upgradeCost, maxAffordable, enemyMaxHp, killGold, firstClearGold,
    serialize, deserialize, fmt,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = Core;
  else root.Core = Core;
})(this);
