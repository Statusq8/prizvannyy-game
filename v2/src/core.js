// Ядро игры: только логика, без интерфейса. Работает в браузере и в Node (тесты).
(function (root) {
  'use strict';

  // ВРЕМЕННЫЕ значения для испытаний. По GDD (раздел 16) это TBD — не окончательный баланс.
  const CONFIG = {
    saveVersion: 2,
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
    // Союзники: автоатака с фиксированной собственной частотой (GDD §3). Уровень 0 = не нанят.
    allies: [
      { id: 'irene', name: 'Ирэн', role: 'Лучница теней', baseDps: 4, attackInterval: 0.8,
        hireCost: 25, costGrowth: 1.07 },
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
  function allyDps(s, id) { return allyDpsAt(id, s.allies[id].level); }
  function autoDps(s) { return CONFIG.allies.reduce((sum, a) => sum + allyDps(s, a.id), 0); }
  // Уровень 0 → первая покупка = найм по hireCost
  function allyCost(s, id, n) { const a = allyDef(id); return seriesCost(a.hireCost, a.costGrowth, s.allies[id].level, n); }
  function allyMax(s, id) { const a = allyDef(id); return seriesMax(a.hireCost, a.costGrowth, s.allies[id].level, s.gold); }

  // ---------- состояние ----------
  function newState() {
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
      // не сохраняется:
      enemy: null,
      bossTimeLeft: 0,
      respawn: 0,
    };
    spawn(s);
    return s;
  }

  function newAllies() {
    const o = {};
    for (const a of CONFIG.allies) o[a.id] = { level: 0, cd: a.attackInterval };   // cd не сохраняется
    return o;
  }

  function spawn(s) {
    const isBoss = s.enemyIndex === CONFIG.enemiesPerFloor;
    const hp = enemyMaxHp(s.floor, isBoss);
    s.enemy = { hp, maxHp: hp, isBoss, alive: true, name: enemyName(s.floor, s.enemyIndex, isBoss) };
    s.bossTimeLeft = isBoss ? CONFIG.bossTimeSec : 0;
    s.respawn = 0;
  }

  // ---------- действия ----------
  function dealDamage(s, dmg, source, events) {
    s.enemy.hp = Math.max(0, s.enemy.hp - dmg);
    events.push({ type: 'hit', dmg, source });
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
    if (!s.enemy.alive) {
      s.respawn -= dt;
      if (s.respawn <= 0) { spawn(s); events.push({ type: 'spawn' }); }
      return events;
    }
    // Автоатаки союзников: перезарядка идёт только пока враг жив
    for (const a of CONFIG.allies) {
      const st = s.allies[a.id];
      if (st.level <= 0) continue;
      st.cd -= dt;
      if (st.cd <= 0 && s.enemy.alive) {
        st.cd += a.attackInterval;
        dealDamage(s, allyDps(s, a.id) * a.attackInterval, a.id, events);
      }
      if (!s.enemy.alive) { for (const b of CONFIG.allies) s.allies[b.id].cd = Math.max(s.allies[b.id].cd, 0); return events; }
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

  function buyAlly(s, id, n) {
    if (!allyDef(id)) return false;
    const count = n === 'max' ? allyMax(s, id) : n;
    if (!Number.isInteger(count) || count <= 0) return false;
    const cost = allyCost(s, id, count);
    if (cost > s.gold) return false;
    s.gold -= cost;
    s.allies[id].level += count;
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
      savedAt: Date.now(),
    });
  }

  function deserialize(str) {
    let d;
    try { d = JSON.parse(str); } catch (e) { return null; }
    if (!d || typeof d !== 'object') return null;
    if (d.v === 1) { d.v = 2; d.allies = {}; }          // миграция 0.2 → 0.3: союзников ещё не было
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
    spawn(s);                                     // враг появляется с полным HP
    return s;
  }

  // ---------- форматирование чисел ----------
  function fmt(n) {
    n = Math.floor(n);
    if (Math.abs(n) < 1e6) return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return n.toExponential(2).replace('e+', 'e');
  }

  const Core = {
    CONFIG, newState, tap, tick, challengeBoss, goToFloor, buyTap,
    buyAlly, allyDps, allyDpsAt, autoDps, allyCost, allyMax,
    tapDamageAt, milestoneMultAt, milestonesReached, nextMilestone,
    tapDamage, upgradeCost, maxAffordable, enemyMaxHp, killGold, firstClearGold,
    serialize, deserialize, fmt,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = Core;
  else root.Core = Core;
})(this);
