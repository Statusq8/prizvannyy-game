  // ==== src/core/05_state.js — Сохранения/состояние: newState — структура состояния игры ====
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
      stats: { taps: 0, kills: 0, bossKills: 0, crits: 0, maxTps: 0, goldEarned: 0, soulsEarned: 0, playTime: 0 },
      tpsWin: { t: 0, n: 0 },                    // окно 1 с для «макс. тапов в секунду» (не сохраняется)
      autoAdvance: true,                         // «Автопереход» на следующий этаж после босса
      allies: newAllies(),
      buffs: { team: 0, tap: 0, teamPower: 1, tapPower: 1 },  // время и сила баффов (не сохраняется)
      abilities: newAbilities(),
      // постоянное (переживёт регрессию): коллекция, билеты, гарантии, отряд
      heroes: newHeroes(),
      squad: CONFIG.allies.filter(a => a.starter).map(a => a.id).slice(0, CONFIG.squadSize),
      tickets: 0, crystals: 0, crystalFloor: 0, market: { items: [], next: 0 },
      heroRank: 0,                               // ступень ранга главного героя (0…100) — поднимает потолок удара
      materials: { shard: 0, heart: 0, dust: 0 },   // dust — костяная пыль
      bones: [], boneSeq: 1,                     // кости: { id, slot, tier, lvl, grade, on (кто носит), lock }
      heartFloor: 0,                             // до какого этажа уже выданы сердца за боссов
      ticketFloor: 0,                            // до какого этажа уже выданы билеты за боссов
      pity: { a: 0, s: 0 },
      bpity: {},                                 // гарантии особых баннеров (раздельные с базовой)
      essence: 0,
      locks: {},                                 // id → true: копии защищены от пожертвования
      discovered: {},                            // id скрытого героя → рецепт найден
      souls: 0,
      artifacts: {},                             // id → уровень (≥1 — найден)
      tree: {},                                  // дерево душ: id узла → уровень
      runes: [], runeSeq: 1,                     // руны: { id, type, tier (0 = E … 6 = GOD), lvl }
      totems: {},                                // id биома → уровень тотема
      pve: { day: '', used: {}, endlessBest: 0 },
      echo: { week: '', used: 0, won: false },   // 0.58: «Эхо Башни» — попытки недели и первая победа  // ежедневные попытки и рекорд бесконечного подземелья
      trial: { week: '', weekBest: 0, best: 0 },  // испытательная башня: рекорды недели и за всё время
      mode: null,                                // текущий PvE-режим (не сохраняется)
      counters: {},                              // счётчики действий за всю игру (для заданий)
      quests: { day: '', week: '', dayBase: {}, weekBase: {}, runBase: {}, claimed: {}, chests: {} },
      login: { day: '', n: 0 },                  // последний день, за который забран бонус входа, и сколько дней забрано всего
      travel: { day: '', used: 0 },              // путешествия во времени за день
      ach: {},                                   // достижения: id → забранных ступеней
      season: newSeason(0),                      // текущий сезон (0 — ещё не начат)
      event: newEventState('', null),            // событие недели
      inbox: [], inboxSeq: 1,                    // центр наград
      titles: [], title: null, skins: [],        // 0.51: титулы и облики (награды регрессий и достижений)
      favs: [],                                  // 0.54: избранные герои (ответ 199)
      trophies: [],                              // 0.57: ключи трофеев 'biome:0' | 'biome:1' | 'biome:f'
      curse: null,                               // 0.59: { floor, mod, on } — предложенное/принятое проклятие этажа
      potions: {},                               // 0.60: id зелья → осталось секунд
      towerMs: 0,                                // 0.61: до какого этажа выданы вехи Башни
      bestiary: {}, diaryPages: [],              // 0.62: имя врага → побед; биомы с полной страницей
      secrets: [],                               // 0.63: найденные скрытые комнаты { floor, done }
      prestigeClaimed: 0, frame: null, megaSoulsFloor: 0, cageFreed: false, goldHired: [], artShop: { soul: [], blood: [] },           // 0.64: до какого уровня престижа забраны награды; выбранная рамка
      presets: [null, null, null],               // 0.54: пресеты отряда { squad, pet } (ответ 186)
      cls: { id: null, spent: {}, changeDay: '' }, // класс главного героя
      booster: { owner: null, movedAt: 0 },      // «Печать силы»: владелец и время последнего переноса
      rituals: 0,
      bestFloor: 1,                              // рекорд за всю игру
      bestRecordAtRunStart: 1,                   // рекорд на момент начала забега (для бонуса за новый рекорд)
      heroAutoAcc: 0,                            // накопитель автоатаки героя (не сохраняется)
      reserveAcc: 0,                             // накопитель урона резерва (не сохраняется)
      pets: { active: null, forms: {}, frags: {}, lair: { week: '', kills: 0 } },   // питомцы 2.0: формы 1…3, фрагменты, «Логово»
      bestCleared: 0,                            // рекорд пройденных боссов за всю игру (для выдачи питомцев)
      petAcc: 0,                                 // накопитель атаки питомца (не сохраняется)
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
    for (const a of CONFIG.allies) o[a.id] = { unlocked: !!a.starter, copies: 0, stars: 0, evo: 0, rank: 0 };
    return o;
  }
  function newAllies() {
    const o = {};
    // cd — перезарядка атаки, ult — накопленный заряд ультимейта, с (оба не сохраняются)
    for (const a of CONFIG.allies) o[a.id] = { level: 0, cd: a.attackInterval, ult: 0 };
    return o;
  }

  function spawn(s) {
    if (s.mode) return spawnMode(s);
    const K = CONFIG.cage;
    if (K && !s.cageFreed && s.floor === K.floor && s.enemyIndex === 1) {
      const hp = B.ceil(B.mul(tapHit(s), K.taps));
      s.enemy = { hp, maxHp: hp, isBoss: false, final: false, alive: true, mark: 0, markPower: 1, rare: null, phase: 1, vuln: 0, name: K.name, cage: true };
      s.bossTimeLeft = 0; s.respawn = 0; return;
    }
    const isBoss = s.enemyIndex === CONFIG.enemiesPerFloor;
    const rare = rollRare(s, s.floor, s.enemyIndex);
    const cm = curseMod(s), hp = B.ceil(B.mul(enemyMaxHp(s.floor, isBoss), (rare ? rare.hp : 1) * (cm && cm.hp || 1)));
    const final = isBoss && isFinalBoss(s.floor);
    s.enemy = { hp, maxHp: hp, isBoss, final, alive: true, mark: 0, markPower: 1, rare: rare ? rare.id : null,
                phase: 1, vuln: 0, name: rare ? rare.name : enemyName(s.floor, s.enemyIndex, isBoss) };
    s.bossTimeLeft = isBoss ? bossTime(s) : 0;
    s.respawn = 0;
  }

