// Ядро игры: только логика, без интерфейса. Работает в браузере и в Node (тесты).
(function (root) {
  'use strict';

  // ВРЕМЕННЫЕ значения для испытаний. По GDD (раздел 16) это TBD — не окончательный баланс.
  const CONFIG = {
    saveVersion: 1,
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
  function tapDamage(s) { return CONFIG.tapBaseDamage * s.tapLevel; }
  function enemyName(floor, index, isBoss) {
    if (isBoss) return BOSS_NAMES[(floor - 1) % BOSS_NAMES.length];
    return ENEMY_NAMES[(floor * 7 + index * 3) % ENEMY_NAMES.length];
  }

  // Стоимость n уровней начиная с текущего уровня (геометрическая сумма)
  function upgradeCost(level, n) {
    if (n <= 0) return 0;
    const b = CONFIG.tapUpgradeBaseCost, g = CONFIG.tapUpgradeCostGrowth;
    return Math.ceil(b * Math.pow(g, level - 1) * (Math.pow(g, n) - 1) / (g - 1));
  }
  function maxAffordable(level, gold) {
    const b = CONFIG.tapUpgradeBaseCost, g = CONFIG.tapUpgradeCostGrowth;
    const first = b * Math.pow(g, level - 1);
    let n = Math.floor(Math.log(gold * (g - 1) / first + 1) / Math.log(g));
    if (!isFinite(n) || n < 0) n = 0;
    while (n > 0 && upgradeCost(level, n) > gold) n--;      // защита от округления
    while (upgradeCost(level, n + 1) <= gold) n++;
    return n;
  }

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
      // не сохраняется:
      enemy: null,
      bossTimeLeft: 0,
      respawn: 0,
    };
    spawn(s);
    return s;
  }

  function spawn(s) {
    const isBoss = s.enemyIndex === CONFIG.enemiesPerFloor;
    const hp = enemyMaxHp(s.floor, isBoss);
    s.enemy = { hp, maxHp: hp, isBoss, alive: true, name: enemyName(s.floor, s.enemyIndex, isBoss) };
    s.bossTimeLeft = isBoss ? CONFIG.bossTimeSec : 0;
    s.respawn = 0;
  }

  // ---------- действия ----------
  function tap(s) {
    const events = [];
    if (!s.enemy.alive) return events;           // нельзя бить мёртвого
    const dmg = tapDamage(s);
    s.stats.taps++;
    s.enemy.hp = Math.max(0, s.enemy.hp - dmg);
    events.push({ type: 'hit', dmg });
    if (s.enemy.hp <= 0) kill(s, events);
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

  // ---------- сохранение ----------
  function serialize(s) {
    return JSON.stringify({
      v: CONFIG.saveVersion,
      floor: s.floor, maxFloor: s.maxFloor, highestCleared: s.highestCleared,
      enemyIndex: s.enemyIndex, farming: s.farming,
      gold: s.gold, tapLevel: s.tapLevel, stats: s.stats,
      savedAt: Date.now(),
    });
  }

  function deserialize(str) {
    let d;
    try { d = JSON.parse(str); } catch (e) { return null; }
    if (!d || d.v !== CONFIG.saveVersion) return null;
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
    tapDamage, upgradeCost, maxAffordable, enemyMaxHp, killGold, firstClearGold,
    serialize, deserialize, fmt,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = Core;
  else root.Core = Core;
})(this);
