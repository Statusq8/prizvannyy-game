// Ядро игры: только логика, без интерфейса. Работает в браузере и в Node (тесты).
(function (root) {
  'use strict';

  // ВРЕМЕННЫЕ значения для испытаний. По GDD (раздел 16) это TBD — не окончательный баланс.
  const CONFIG = {
    saveVersion: 7,
    enemiesPerFloor: 10,          // утверждено GDD: 1–9 обычные, 10-й босс
    enemyBaseHp: 10,
    enemyHpGrowth: 1.18,          // экспоненциальный рост HP по этажам
    bossHpMult: 6,
    bossTimeSec: 30,              // таймер босса (TBD)
    goldBase: 1,
    goldGrowth: 1.16,
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
    // Герои (GDD §4): редкость E → GOD, портал открывает навсегда, в бою отряд из squadSize.
    // Нанятые резервные бьют на полный урон (решение пользователя), ненанятые — ничего.
    // Отряд определяет, чьи фигуры на арене и чьи ультимейты срабатывают. Звёзды повышают только индивидуальный DPS.
    rarities: ['E', 'D', 'C', 'B', 'A', 'S', 'GOD'],
    squadSize: 4,
    reserveShare: 1,                          // резерв — 100% (решение пользователя)
    maxStars: 10,
    starDpsBonus: 0.5,                        // +50% индивидуального DPS за звезду (TBD)
    starCopies: [1, 1, 2, 2, 3, 3, 4, 4, 5, 5], // копий на 1-ю … 10-ю звезду (TBD)
    // Портал: обычный баннер. Шансы в %, гарантии (pity) раздельные: A+ и S+ (TBD)
    portal: {
      odds: { E: 40, D: 28, C: 17, B: 9, A: 4.5, S: 1.2, GOD: 0.3 },
      pityA: 30, pityS: 90,
      ticketsPerFifth: 1, ticketsPerTenth: 3, // за первое в игре прохождение босса каждого 5-го / 10-го этажа
    },
    // Алтарь (GDD §5): пожертвованные копии исчезают навсегда и дают эссенцию по редкости (TBD)
    // Души (GDD §6–7): постоянный ресурс. Бонус DPS строго линеен по НЕИЗРАСХОДОВАННЫМ душам.
    // Все числа временные (TBD по GDD §16).
    souls: { dpsPerSoul: 0.1 },
    // Ритуал (GDD §7): на этаже 400; каждый следующий — снова достичь 400.
    ritual: {
      floor: 400,
      // старт нового забега: этаж 1 + бонус артефакта «Врата восхождения», строго ниже 400
      // (решение пользователя: заменяет прежнее правило 1 + 20·число ритуалов)
      soulsBase: 50, soulsGrowth: 1.04,  // души за забег: 50 · 1.04^(этаж − 400)
      recordBonus: 1,                    // + душа за каждый новый рекордный этаж
    },
    // Артефакты (GDD §8): все найденные активны одновременно, без слотов; находятся и улучшаются ТОЛЬКО за души,
    // уровни переживают ритуал. Действуют на главного героя, союзников и питомца.
    // Единственный источник постоянного роста критов (шанс не выше 50% от всех источников вместе).
    artifactFind: { cost: 3, growth: 1.7 },
    artifacts: [
      { id: 'blade',  name: 'Клинок первого призыва', icon: '🗡', kind: 'heroAuto', per: 0.1, cost: 2, growth: 1.25,
        desc: 'Главный герой сам атакует раз в секунду. +10% урона героя за уровень' },
      { id: 'eye',    name: 'Око охотника',      icon: '👁', kind: 'critChance', per: 0.01, cost: 2, growth: 1.3, max: 45,
        desc: '+1% шанса крита за уровень' },
      { id: 'fang',   name: 'Клык бездны',       icon: '🦷', kind: 'critMult', per: 0.2, cost: 2, growth: 1.25,
        desc: '+0,2 к крит-урону за уровень' },
      { id: 'grail',  name: 'Кровавый грааль',   icon: '🏆', kind: 'allDmg', per: 0.25, cost: 3, growth: 1.25,
        desc: '+25% всего урона за уровень' },
      { id: 'banner', name: 'Знамя отряда',      icon: '🚩', kind: 'allyDmg', per: 0.4, cost: 2, growth: 1.25,
        desc: '+40% урона союзников за уровень' },
      { id: 'gaunt',  name: 'Перчатка титана',   icon: '🧤', kind: 'tapDmg', per: 0.4, cost: 2, growth: 1.25,
        desc: '+40% урона главного героя за уровень' },
      { id: 'feather',name: 'Перо феникса',      icon: '🪶', kind: 'gold', per: 0.2, cost: 2, growth: 1.25,
        desc: '+20% золота за уровень' },
      { id: 'sand',   name: 'Песочные часы',     icon: '⏳', kind: 'bossTime', per: 1, cost: 2, growth: 1.35, max: 15,
        desc: '+1 с к таймеру босса за уровень' },
      { id: 'gate',   name: 'Врата восхождения', icon: '🌀', kind: 'startFloor', per: 1, cost: 1, growth: 1.06, max: 398,
        desc: 'После ритуала новый забег начинается на 1 этаж выше за уровень (всегда ниже 400)' },
    ],
    // Материалы (GDD §6): от боссов, переживают ритуал. Гарантированная альтернатива — рецепт Алтаря (TBD)
    materials: {
      shard: { name: 'Осколок Башни', icon: '🔹' },   // за каждого побеждённого босса, в т. ч. повторно (фарм)
      heart: { name: 'Сердце стража', icon: '🔥' },   // за первое в игре прохождение босса каждого heartEvery-го этажа
      shardsPerBoss: 1, shardsFloorStep: 25,          // осколков за босса: 1 + floor(этаж / 25)
      heartEvery: 50,
      heartRecipe: 40,                                // Алтарь: 40 осколков → 1 сердце
    },
    // Эволюция (GDD §4): постоянная, ступенчатая, требует звёзды и материалы, открывает новый облик.
    // Даёт только индивидуальный DPS — никаких критов. Все пороги и цены TBD.
    evolution: {
      stages: [
        { name: 'Пробуждение',    stars: 3,  shards: 30,  hearts: 0, mult: 2 },
        { name: 'Возвышение',     stars: 6,  shards: 150, hearts: 1, mult: 2 },
        { name: 'Истинный облик', stars: 10, shards: 600, hearts: 3, mult: 2 },
      ],
      rarityCost: { E: 1, D: 1.5, C: 2, B: 3, A: 4, S: 6, GOD: 10 },   // множитель цены в осколках
    },
    // Офлайн (решение пользователя, заменяет GDD §6 «по выбранному этажу»): отряд сам проходит этажи
    // авто-DPS без тапов и ультимейтов, пока не упрётся в босса, затем фармит этаж ниже. Не дольше 12 ч.
    offline: { maxSec: 12 * 3600, minSec: 60, minKillSec: 0.5 },
    // Полная Башня (GDD §2). Биомы по 50 этажей, после 400-го идут по кругу (II, III …).
    // У биома свои враги, фон, сложность, награды и финальный босс на последнем этаже. Числа TBD.
    biomeFloors: 50,
    biomes: [
      { id: 'crypt',  name: 'Гнилые катакомбы',  hp: 1.00, gold: 1.0, rare: 0.03, sky: ['#1e1329', '#0d0a12'], hue: 0,
        enemies: ['Костяной страж', 'Гоблин-падальщик', 'Слепой культист', 'Болотный упырь'],
        bosses: ['Могильщик', 'Королева червей'], final: 'Хранитель Врат' },
      { id: 'ash',    name: 'Пепельные шахты',   hp: 1.05, gold: 1.1, rare: 0.03, sky: ['#2e1a14', '#120a08'], hue: 330,
        enemies: ['Пепельный волк', 'Ржавый механоид', 'Каменный голем', 'Угольный бес'],
        bosses: ['Мастер плавильни', 'Железный Тиран'], final: 'Владыка Пепла' },
      { id: 'shade',  name: 'Лес теней',         hp: 0.95, gold: 1.0, rare: 0.05, sky: ['#122418', '#080f0a'], hue: 100,
        enemies: ['Тень Башни', 'Шепчущий энт', 'Призрачная рысь', 'Ведьмина кукла'],
        bosses: ['Старейшина рощи', 'Безликий охотник'], final: 'Королева Теней' },
      { id: 'frost',  name: 'Ледяная цитадель',  hp: 1.10, gold: 1.2, rare: 0.03, sky: ['#14223a', '#080c16'], hue: 190,
        enemies: ['Ледяной рыцарь', 'Кристальный паук', 'Снежный голем', 'Морозный дух'],
        bosses: ['Комендант стужи', 'Белый дракончик'], final: 'Король Вечной Зимы' },
      { id: 'tide',   name: 'Затопленный храм',  hp: 1.00, gold: 1.1, rare: 0.04, sky: ['#0f2630', '#060f14'], hue: 160,
        enemies: ['Утопленник', 'Кровавый слизень', 'Жрец глубин', 'Морской змей'],
        bosses: ['Голос прилива', 'Хозяйка раковин'], final: 'Левиафан' },
      { id: 'blood',  name: 'Кровавая арена',    hp: 1.15, gold: 1.3, rare: 0.03, sky: ['#2e1018', '#12060a'], hue: 300,
        enemies: ['Гладиатор', 'Арена-берсерк', 'Кровавый пёс', 'Призрачный рыцарь'],
        bosses: ['Чемпион арены', 'Палач'], final: 'Пожиратель Душ' },
      { id: 'void',   name: 'Пустотные врата',   hp: 1.05, gold: 1.2, rare: 0.05, sky: ['#1a1036', '#08061a'], hue: 230,
        enemies: ['Пустотный бес', 'Звёздный глаз', 'Искажённый маг', 'Пожиратель света'],
        bosses: ['Привратник', 'Сшитый из звёзд'], final: 'Око Бездны' },
      { id: 'throne', name: 'Престол Башни',     hp: 1.20, gold: 1.5, rare: 0.04, sky: ['#2a2210', '#100c04'], hue: 30,
        enemies: ['Золотой страж', 'Падший ангел', 'Хранитель свитков', 'Лик Башни'],
        bosses: ['Правая рука трона', 'Левая рука трона'], final: 'Первый Призыватель' },
    ],
    finalBossHpMult: 1.5,                // финальный босс биома крепче обычного
    // Редкие враги случайно заменяют обычных (не боссов) с этажа minFloor. Шанс — у биома.
    rare: {
      minFloor: 10,
      kinds: [
        { id: 'gold',    name: 'Золотой гоблин',   hp: 2, gold: 15, shards: 0, weight: 3 },
        { id: 'crystal', name: 'Кристальный ёж',   hp: 4, gold: 2,  shards: 1, weight: 1 },   // осколки как за босса этажа
      ],
    },
    // Фазы боссов: при падении HP ниже порога — новая фаза и короткая уязвимость (урон по боссу ×vulnMult).
    // Урона по героям нет (GDD §2).
    bossPhases: { normal: [0.5], final: [0.66, 0.33], vulnSec: 3, vulnMult: 1.5 },
    heroAutoInterval: 1,                 // фиксированная частота автоатаки героя (GDD §3)
    altar: {
      essence: { E: 1, D: 2, C: 4, B: 8, A: 16, S: 40, GOD: 100 },
      ticketCost: 30,                                              // «Слеза портала»: эссенция → 1 билет
      traceCost: { E: 10, D: 20, C: 40, B: 80, A: 160, S: 400, GOD: 1000 },   // «След героя»: копия выбранного открытого
      rareConfirmFrom: 'A',                                        // для A, S, GOD — дополнительное подтверждение
    },
    // Каталог героев. Уровень 0 = не нанят в этом забеге. starter — открыт с начала игры.
    // hidden — не выпадает в портале, открывается скрытым рецептом Алтаря (повторяемый бесплатный путь).
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
      // скрытая: рецепт — пожертвовать за раз по копии всех четырёх героев стартового отряда
      { id: 'morra', name: 'Морра', role: 'Хранительница Алтаря', rarity: 'A', hidden: true, baseDps: 1e8, attackInterval: 1.2,
        hireCost: 2e7, costGrowth: 1.05, ult: { name: 'Печать жертвы', kind: 'teamBuff', charge: 20, power: 2.2, duration: 7 },
        recipe: ['irene', 'borg', 'lia', 'kael'] },
    ],
  };

  // ---------- биомы ----------
  const ROMAN = ['', '', ' II', ' III', ' IV', ' V', ' VI', ' VII', ' VIII', ' IX', ' X'];
  function biomeIndex(floor) { return Math.floor((floor - 1) / CONFIG.biomeFloors); }
  function biomeOf(floor) { const B = CONFIG.biomes; return B[biomeIndex(floor) % B.length]; }
  function biomeCycle(floor) { return Math.floor(biomeIndex(floor) / CONFIG.biomes.length) + 1; }
  function biomeName(floor) { const n = biomeCycle(floor); return biomeOf(floor).name + (ROMAN[n] !== undefined ? ROMAN[n] : ' ' + n); }
  function isFinalBoss(floor) { return floor % CONFIG.biomeFloors === 0; }
  function isBiomeStart(floor) { return (floor - 1) % CONFIG.biomeFloors === 0; }

  // ---------- формулы ----------
  function enemyMaxHp(floor, isBoss) {
    const hp = CONFIG.enemyBaseHp * Math.pow(CONFIG.enemyHpGrowth, floor - 1) * biomeOf(floor).hp;
    return Math.ceil(isBoss ? hp * CONFIG.bossHpMult * (isFinalBoss(floor) ? CONFIG.finalBossHpMult : 1) : hp);
  }
  // ---------- души и артефакты ----------
  function artDef(id) { return CONFIG.artifacts.find(a => a.id === id); }
  function artLevel(s, id) { return s.artifacts[id] | 0; }
  // Суммарная сила эффекта данного вида от всех найденных артефактов
  function artPower(s, kind) {
    let x = 0;
    for (const a of CONFIG.artifacts) if (a.kind === kind) x += a.per * artLevel(s, a.id);
    return x;
  }
  function soulMult(s) { return 1 + CONFIG.souls.dpsPerSoul * s.souls; }
  function goldMult(s) { return 1 + artPower(s, 'gold'); }
  function bossTime(s) { return CONFIG.bossTimeSec + artPower(s, 'bossTime'); }
  function hasHeroAuto(s) { return artLevel(s, 'blade') > 0; }
  // Постоянный множитель урона по источнику: души × грааль × (герой или союзники)
  function permMult(s, source) {
    let m = soulMult(s) * (1 + artPower(s, 'allDmg'));
    if (source === 'tap' || source === 'heroAuto') m *= (1 + artPower(s, 'tapDmg')) * (1 + artPower(s, 'heroAuto'));
    else m *= 1 + artPower(s, 'allyDmg');
    return m;
  }

  function killGold(floor, isBoss) {
    const g = CONFIG.goldBase * Math.pow(CONFIG.goldGrowth, floor - 1) * biomeOf(floor).gold;
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
    let ch = CONFIG.crit.baseChance + artPower(s, 'critChance');
    if (s.abilities.hunt.active > 0) ch += abilityDef('hunt').critChanceBonus;
    return Math.min(CONFIG.crit.maxChance, ch);
  }
  function critMult(s) { return CONFIG.crit.baseMult + artPower(s, 'critMult'); }
  function enemyName(floor, index, isBoss) {
    const b = biomeOf(floor);
    if (isBoss) return isFinalBoss(floor) ? b.final : b.bosses[(floor - 1) % b.bosses.length];
    return b.enemies[(floor * 7 + index * 3) % b.enemies.length];
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
    if (x >= biomeOf(floor).rare) return null;
    const total = R.kinds.reduce((t, k) => t + k.weight, 0);
    let y = x / biomeOf(floor).rare * total;
    for (const k of R.kinds) { y -= k.weight; if (y < 0) return k; }
    return R.kinds[R.kinds.length - 1];
  }
  function rareDef(id) { return CONFIG.rare.kinds.find(k => k.id === id); }

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
  // Эволюция: произведение множителей пройденных ступеней
  function evoMult(s, id) {
    let m = 1;
    for (let i = 0; i < s.heroes[id].evo; i++) m *= CONFIG.evolution.stages[i].mult;
    return m;
  }
  // Постоянная сила самого героя: звёзды × эволюция
  function heroMult(s, id) { return starMult(s, id) * evoMult(s, id); }
  // Индивидуальный DPS героя (со звёздами и эволюцией), как если бы он был в отряде
  function allyDps(s, id) { return allyDpsAt(id, s.allies[id].level) * heroMult(s, id); }
  function inSquad(s, id) { return s.squad.includes(id); }
  // Вклад в общий DPS: отряд — полностью, нанятые резервные — долю, ненанятые — ничего
  function contribDps(s, id) { return allyDps(s, id) * (inSquad(s, id) ? 1 : CONFIG.reserveShare); }
  // Авто-урон в секунду с постоянными множителями (для показа): союзники + автоатака героя
  function autoDps(s) {
    const allies = CONFIG.allies.reduce((sum, a) => sum + contribDps(s, a.id), 0) * permMult(s, 'ally');
    const hero = hasHeroAuto(s) ? tapDamage(s) * permMult(s, 'heroAuto') / CONFIG.heroAutoInterval : 0;
    return allies + hero;
  }
  // Урон тапа с постоянными множителями (для показа)
  function tapHit(s) { return tapDamage(s) * permMult(s, 'tap'); }
  // Ожидаемый DPS при заданной частоте тапов с учётом критов — для сравнения «до / после» трат душ
  function expectedDps(s, tps) {
    const critF = 1 + critChance(s) * (critMult(s) - 1);
    return (autoDps(s) + tapHit(s) * tps) * critF;
  }
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
      materials: { shard: 0, heart: 0 },
      heartFloor: 0,                             // до какого этажа уже выданы сердца за боссов
      ticketFloor: 0,                            // до какого этажа уже выданы билеты за боссов
      pity: { a: 0, s: 0 },
      essence: 0,
      locks: {},                                 // id → true: копии защищены от пожертвования
      discovered: {},                            // id скрытого героя → рецепт найден
      souls: 0,
      artifacts: {},                             // id → уровень (≥1 — найден)
      rituals: 0,
      bestFloor: 1,                              // рекорд за всю игру
      bestRecordAtRunStart: 1,                   // рекорд на момент начала забега (для бонуса за новый рекорд)
      heroAutoAcc: 0,                            // накопитель автоатаки героя (не сохраняется)
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
    for (const a of CONFIG.allies) o[a.id] = { unlocked: !!a.starter, copies: 0, stars: 0, evo: 0 };
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
    const rare = rollRare(s, s.floor, s.enemyIndex);
    const hp = Math.ceil(enemyMaxHp(s.floor, isBoss) * (rare ? rare.hp : 1));
    const final = isBoss && isFinalBoss(s.floor);
    s.enemy = { hp, maxHp: hp, isBoss, final, alive: true, mark: 0, markPower: 1, rare: rare ? rare.id : null,
                phase: 1, vuln: 0, name: rare ? rare.name : enemyName(s.floor, s.enemyIndex, isBoss) };
    s.bossTimeLeft = isBoss ? bossTime(s) : 0;
    s.respawn = 0;
  }

  // ---------- действия ----------
  // Множители от ультимейтов: Ярость — весь урон отряда, Разрез — тапы, Метка — урон по врагу
  function damageMult(s, source) {
    let m = 1;
    if (s.buffs.team > 0) m *= s.buffs.teamPower;
    if (source === 'tap' && s.buffs.tap > 0) m *= s.buffs.tapPower;
    if (s.enemy.mark > 0) m *= s.enemy.markPower;
    if (s.enemy.vuln > 0) m *= CONFIG.bossPhases.vulnMult;
    return m;
  }

  function dealDamage(s, dmg, source, events) {
    dmg *= permMult(s, source) * damageMult(s, source);
    const crit = s.rng() < critChance(s);
    if (crit) dmg *= critMult(s);
    s.enemy.hp = Math.max(0, s.enemy.hp - dmg);
    events.push({ type: 'hit', dmg, source, crit });
    if (s.enemy.hp <= 0) kill(s, events);
    else if (s.enemy.isBoss) checkPhase(s, events);
  }
  // Фазы босса: пороги HP, на каждом — короткая уязвимость
  function phaseThresholds(e) { const P = CONFIG.bossPhases; return e.final ? P.final : P.normal; }
  function checkPhase(s, events) {
    const e = s.enemy, th = phaseThresholds(e);
    while (e.phase <= th.length && e.hp / e.maxHp <= th[e.phase - 1]) {
      e.phase++; e.vuln = CONFIG.bossPhases.vulnSec;
      events.push({ type: 'phase', phase: e.phase, of: th.length + 1, name: e.name });
    }
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
    rewardKill(s, isBoss, events, s.enemy.rare);
  }
  // Награды и переход к следующему врагу — общие для боя и офлайна
  function rewardKill(s, isBoss, events, rareId) {
    const rare = rareId ? rareDef(rareId) : null;
    const gold = Math.ceil(killGold(s.floor, isBoss) * goldMult(s) * (rare ? rare.gold : 1));
    s.gold += gold;
    s.stats.kills++;
    events.push({ type: 'kill', gold, boss: isBoss, rare: rareId || null });
    if (rare && rare.shards) {
      const n = rare.shards * shardsForBoss(s.floor);
      s.materials.shard += n;
      events.push({ type: 'materials', shard: n, heart: 0, rare: true });
    }

    if (isBoss) {
      s.stats.bossKills++;
      if (s.floor > s.highestCleared) {
        s.highestCleared = s.floor;
        const bonus = Math.ceil(firstClearGold(s.floor) * goldMult(s));
        s.gold += bonus;
        events.push({ type: 'firstClear', floor: s.floor, gold: bonus });
      }
      if (s.floor > s.ticketFloor) {
        s.ticketFloor = s.floor;
        const n = ticketsForFloor(s.floor);
        s.tickets += n;
        if (n) events.push({ type: 'tickets', n, floor: s.floor });
      }
      const mat = bossMaterials(s, s.floor);
      s.materials.shard += mat.shard; s.materials.heart += mat.heart;
      if (mat.heart) s.heartFloor = s.floor;
      events.push({ type: 'materials', shard: mat.shard, heart: mat.heart });
      s.maxFloor = Math.max(s.maxFloor, s.floor + 1);
      s.bestFloor = Math.max(s.bestFloor, s.maxFloor);
      s.floor += 1;
      s.enemyIndex = 1;
      events.push({ type: 'floor', floor: s.floor });
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
    s.buffs.team = Math.max(0, s.buffs.team - dt);
    s.buffs.tap = Math.max(0, s.buffs.tap - dt);
    if (s.enemy.alive) { s.enemy.mark = Math.max(0, s.enemy.mark - dt); s.enemy.vuln = Math.max(0, s.enemy.vuln - dt); }
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
    // Автоатака главного героя (артефакт «Клинок первого призыва»): фиксированная частота, тапы остаются
    if (hasHeroAuto(s)) {
      s.heroAutoAcc += dt;
      if (s.heroAutoAcc >= CONFIG.heroAutoInterval) {
        s.heroAutoAcc -= CONFIG.heroAutoInterval;
        dealDamage(s, tapDamage(s), 'heroAuto', events);
        if (!s.enemy.alive) return events;
      }
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

  // ---------- офлайн ----------
  // Средний авто-урон без тапов, ультимейтов и способностей, с учётом критов
  function offlineDps(s) { return autoDps(s) * (1 + critChance({ ...s, abilities: newAbilities() }) * (critMult(s) - 1)); }
  function killTime(hp, dps) { return Math.max(hp / dps, CONFIG.offline.minKillSec) + CONFIG.respawnDelaySec; }
  // Проиграть отсутствие: продвижение до стены (босс не успевает умереть за таймер), потом фарм этажа ниже.
  // Возвращает сводку или null, если отсутствие короче minSec.
  function offlineProgress(s, seconds) {
    const O = CONFIG.offline;
    if (!(seconds >= O.minSec)) return null;
    const secs = Math.min(seconds, O.maxSec);
    const r = { seconds: secs, capped: seconds > O.maxSec, fromFloor: s.floor, gold: 0, kills: 0,
                floorsCleared: 0, wallFloor: null, farmFloor: null, shard: 0, heart: 0, tickets: 0 };
    const gold0 = s.gold, kills0 = s.stats.kills, sh0 = s.materials.shard, he0 = s.materials.heart, t0 = s.tickets;
    for (const a of CONFIG.abilities) s.abilities[a.id].cd = Math.max(0, s.abilities[a.id].cd - secs);
    const dps = offlineDps(s);
    let t = 0;
    if (dps > 0) {
      // Был в фарме после проигрыша — снова пробуем рубеж (самый высокий открытый этаж)
      if (s.farming) { s.floor = s.maxFloor; s.enemyIndex = CONFIG.enemiesPerFloor; s.farming = false; }
      const events = [];
      while (!s.farming) {
        const isBoss = s.enemyIndex === CONFIG.enemiesPerFloor;
        const hp = enemyMaxHp(s.floor, isBoss);
        if (isBoss && hp / dps > bossTime(s)) {             // стена: босс не умирает за таймер
          r.wallFloor = s.floor;
          s.floor = Math.max(1, s.floor - 1); s.enemyIndex = 1; s.farming = true;
          break;
        }
        const kt = killTime(hp, dps);
        if (t + kt > secs) break;
        t += kt;
        const f = s.floor;
        rewardKill(s, isBoss, events);
        if (isBoss) r.floorsCleared++;
        if (s.floor !== f) events.length = 0;               // события не копим
      }
      if (s.farming) {
        // Фарм обычных врагов 1–9 этажа ниже стены — сразу за всё оставшееся время
        r.farmFloor = s.floor;
        const kt = killTime(enemyMaxHp(s.floor, false), dps);
        const n = Math.floor((secs - t) / kt);
        const per = CONFIG.enemiesPerFloor - 1;
        s.gold += n * Math.ceil(killGold(s.floor, false) * goldMult(s));
        s.stats.kills += n;
        s.enemyIndex = 1 + (s.enemyIndex - 1 + n) % per;
      }
    }
    r.toFloor = s.floor;
    r.gold = s.gold - gold0; r.kills = s.stats.kills - kills0;
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
  function abilityUnlocked(s, id) { return Math.max(s.maxFloor, s.bestFloor) >= abilityDef(id).unlockFloor; }
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
      const pool = CONFIG.allies.filter(a => a.rarity === rarity && !a.hidden);
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

  // ---------- материалы и эволюция ----------
  function shardsForBoss(f) { const M = CONFIG.materials; return M.shardsPerBoss + Math.floor(f / M.shardsFloorStep); }
  function heartsForFloor(f) { return f % CONFIG.materials.heartEvery === 0 ? 1 : 0; }
  // Осколки — за любого босса; сердце — только за первое в игре прохождение (не повторяется после ритуала)
  function bossMaterials(s, f) {
    return { shard: shardsForBoss(f), heart: f > s.heartFloor ? heartsForFloor(f) : 0 };
  }
  // Требования следующей ступени или null, если эволюция завершена
  function evoCost(s, id) {
    const a = allyDef(id), E = CONFIG.evolution, st = a && E.stages[s.heroes[id].evo];
    if (!st) return null;
    return { stage: s.heroes[id].evo + 1, name: st.name, stars: st.stars, mult: st.mult,
             shards: Math.ceil(st.shards * E.rarityCost[a.rarity]), hearts: st.hearts };
  }
  function canEvolve(s, id) {
    const c = evoCost(s, id), h = s.heroes[id];
    return !!c && h.unlocked && h.stars >= c.stars && s.materials.shard >= c.shards && s.materials.heart >= c.hearts;
  }
  function evolve(s, id) {
    if (!canEvolve(s, id)) return false;
    const c = evoCost(s, id);
    s.materials.shard -= c.shards; s.materials.heart -= c.hearts;
    s.heroes[id].evo++;
    return true;
  }
  // Алтарь: гарантированная альтернатива — осколки в сердце
  function forgeHeart(s, n) {
    const cost = CONFIG.materials.heartRecipe * n;
    if (!Number.isInteger(n) || n <= 0 || s.materials.shard < cost) return false;
    s.materials.shard -= cost; s.materials.heart += n;
    return true;
  }

  // ---------- артефакты за души ----------
  function foundCount(s) { return CONFIG.artifacts.filter(a => artLevel(s, a.id) > 0).length; }
  function findCost(s) {
    const f = CONFIG.artifactFind;
    return foundCount(s) >= CONFIG.artifacts.length ? null : Math.ceil(f.cost * Math.pow(f.growth, foundCount(s)));
  }
  // Найти случайный ещё не найденный артефакт
  function findArtifact(s) {
    const cost = findCost(s);
    if (cost == null || s.souls < cost) return null;
    const pool = CONFIG.artifacts.filter(a => artLevel(s, a.id) === 0);
    const a = pool[Math.min(pool.length - 1, Math.floor(s.rng() * pool.length))];
    s.souls -= cost;
    s.artifacts[a.id] = 1;
    return a.id;
  }
  function upgradeArtCost(s, id) {
    const a = artDef(id), lv = artLevel(s, id);
    if (!a || lv === 0 || (a.max && lv >= a.max)) return null;
    return Math.ceil(a.cost * Math.pow(a.growth, lv - 1));
  }
  function upgradeArtifact(s, id) {
    const cost = upgradeArtCost(s, id);
    if (cost == null || s.souls < cost) return false;
    s.souls -= cost;
    s.artifacts[id]++;
    return true;
  }
  // Предпросмотр: ожидаемый DPS до и после траты душ (бонус неизрасходованных душ уменьшится)
  function previewSpend(s, action, id, tps) {
    const before = expectedDps(s, tps);
    const t = { ...s, souls: s.souls, artifacts: { ...s.artifacts } };
    if (action === 'upgrade') { const c = upgradeArtCost(s, id); if (c == null) return null; t.souls -= c; t.artifacts[id]++; }
    return { before, after: expectedDps(t, tps) };
  }

  // ---------- ритуал ----------
  function canRitual(s) { return s.maxFloor >= CONFIG.ritual.floor; }
  // Стартовый этаж следующего забега зависит только от артефакта «Врата восхождения»
  function ritualStartFloor(s) { return Math.min(CONFIG.ritual.floor - 1, 1 + Math.floor(artPower(s, 'startFloor'))); }
  function ritualSouls(s) {
    if (!canRitual(s)) return 0;
    const R = CONFIG.ritual;
    const base = Math.floor(R.soulsBase * Math.pow(R.soulsGrowth, s.maxFloor - R.floor));
    // бонус только за этажи выше прежнего рекорда (и выше этажа ритуала)
    const record = Math.max(0, s.maxFloor - Math.max(s.bestRecordAtRunStart, R.floor)) * R.recordBonus;
    return base + record;
  }
  function ritual(s) {
    if (!canRitual(s)) return null;
    const souls = ritualSouls(s);
    s.souls += souls;
    s.rituals++;
    s.bestFloor = Math.max(s.bestFloor, s.maxFloor);
    s.bestRecordAtRunStart = s.bestFloor;
    const start = ritualStartFloor(s);
    // сбрасывается: золото, временные уровни, найм, прогресс забега
    s.gold = 0; s.tapLevel = 1;
    for (const a of CONFIG.allies) { const st = s.allies[a.id]; st.level = 0; st.ult = 0; st.cd = a.attackInterval; }
    s.buffs = { team: 0, tap: 0, teamPower: 1, tapPower: 1 };
    s.floor = start; s.maxFloor = start; s.highestCleared = start - 1;
    s.enemyIndex = 1; s.farming = false; s.reserveAcc = 0; s.heroAutoAcc = 0;
    spawn(s);
    // сохраняется: герои, звёзды, эволюции, материалы, копии, отряд, билеты, гарантии, эссенция, артефакты, души, способности, рекорды
    return { souls, start };
  }

  // ---------- Алтарь ----------
  function setLock(s, id, on) {
    if (!allyDef(id)) return false;
    if (on) s.locks[id] = true; else delete s.locks[id];
    return true;
  }
  // Эссенция за выбор {id: копий}
  function sacrificeValue(sel) {
    let e = 0;
    for (const id in sel) e += CONFIG.altar.essence[allyDef(id).rarity] * sel[id];
    return e;
  }
  function needsRareConfirm(sel) {
    const min = RANK(CONFIG.altar.rareConfirmFrom);
    return Object.keys(sel).some(id => sel[id] > 0 && RANK(allyDef(id).rarity) >= min);
  }
  // Все незаблокированные копии (массовый выбор)
  function selectAllUnlocked(s) {
    const sel = {};
    for (const a of CONFIG.allies) if (!s.locks[a.id] && s.heroes[a.id].copies > 0) sel[a.id] = s.heroes[a.id].copies;
    return sel;
  }
  // Пожертвовать копии. Скрытые рецепты: если в одной жертве есть копии всех героев рецепта —
  // за каждый полный набор выдаётся скрытый герой (первый раз — открытие).
  function sacrifice(s, sel) {
    if (!sel || typeof sel !== 'object') return null;
    const clean = {};
    for (const id in sel) {
      const n = sel[id];
      if (!allyDef(id) || !Number.isInteger(n) || n < 0) return null;
      if (n === 0) continue;
      if (s.locks[id] || n > s.heroes[id].copies) return null;   // заблокированные и несуществующие копии нельзя
      clean[id] = n;
    }
    if (!Object.keys(clean).length) return null;
    const essence = sacrificeValue(clean);
    for (const id in clean) s.heroes[id].copies -= clean[id];   // исчезают навсегда
    s.essence += essence;
    const found = [];
    for (const h of CONFIG.allies.filter(a => a.hidden && a.recipe)) {
      const sets = Math.min(...h.recipe.map(id => clean[id] || 0));
      if (sets <= 0) continue;
      const st = s.heroes[h.id];
      const isNew = !st.unlocked;
      if (isNew) st.unlocked = true; else st.copies++;
      if (sets > 1) st.copies += sets - 1;
      s.discovered[h.id] = true;
      found.push({ id: h.id, sets, isNew });
    }
    return { essence, found };
  }
  function tearOfPortal(s, n) {
    const cost = CONFIG.altar.ticketCost * n;
    if (!Number.isInteger(n) || n <= 0 || s.essence < cost) return false;
    s.essence -= cost; s.tickets += n;
    return true;
  }
  function traceCost(id) { const a = allyDef(id); return a && CONFIG.altar.traceCost[a.rarity]; }
  function heroTrace(s, id) {
    const a = allyDef(id);
    if (!a || !s.heroes[id].unlocked) return false;
    const cost = traceCost(id);
    if (s.essence < cost) return false;
    s.essence -= cost; s.heroes[id].copies++;
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
      heroes: Object.fromEntries(CONFIG.allies.filter(a => s.heroes[a.id].unlocked).map(a => [a.id, { copies: s.heroes[a.id].copies, stars: s.heroes[a.id].stars, evo: s.heroes[a.id].evo }])),
      materials: { shard: s.materials.shard, heart: s.materials.heart }, heartFloor: s.heartFloor,
      squad: s.squad.slice(), tickets: s.tickets, ticketFloor: s.ticketFloor, pity: { a: s.pity.a, s: s.pity.s },
      essence: s.essence, locks: Object.keys(s.locks), discovered: Object.keys(s.discovered),
      souls: s.souls, artifacts: { ...s.artifacts }, rituals: s.rituals, bestFloor: s.bestFloor, bestRecordAtRunStart: s.bestRecordAtRunStart,
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
    if (d.v === 4) { d.v = 5; d.essence = 0; d.locks = []; d.discovered = []; }   // 0.7 → 0.8: Алтарь
    if (d.v === 5) { d.v = 6; d.souls = 0; d.artifacts = {}; d.rituals = 0; d.bestFloor = d.maxFloor; d.bestRecordAtRunStart = 1; }   // 0.8 → 0.9
    if (d.v === 6) {                                       // 0.9 → 0.10: материалы за уже пройденных боссов
      d.v = 7;
      let sh = 0, he = 0;
      for (let f = 1; f <= (d.ticketFloor | 0); f++) { sh += shardsForBoss(f); he += heartsForFloor(f); }
      d.materials = { shard: sh, heart: he }; d.heartFloor = d.ticketFloor | 0;
      for (const id in (d.heroes || {})) if (d.heroes[id]) d.heroes[id].evo = 0;
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
      s.heroes[a.id] = { unlocked: !!h || !!a.starter, copies: 0, stars: 0, evo: 0 };
      if (!h) continue;
      if (!int(h.copies, 0) || !int(h.stars, 0) || h.stars > CONFIG.maxStars ||
          !int(h.evo, 0) || h.evo > CONFIG.evolution.stages.length) return null;
      s.heroes[a.id].copies = h.copies; s.heroes[a.id].stars = h.stars; s.heroes[a.id].evo = h.evo;
    }
    if (!Array.isArray(d.squad) || d.squad.length > CONFIG.squadSize) return null;
    s.squad = [];
    for (const id of d.squad) if (allyDef(id) && s.heroes[id].unlocked && !s.squad.includes(id)) s.squad.push(id);
    if (!int(d.tickets, 0) || !int(d.ticketFloor, 0)) return null;
    s.tickets = d.tickets; s.ticketFloor = d.ticketFloor;
    const m = d.materials;
    if (!m || typeof m !== 'object' || !int(m.shard, 0) || !int(m.heart, 0) || !int(d.heartFloor, 0)) return null;
    s.materials = { shard: m.shard, heart: m.heart }; s.heartFloor = d.heartFloor;
    s.pity = { a: (d.pity && d.pity.a) | 0, s: (d.pity && d.pity.s) | 0 };
    if (!int(d.essence, 0) || !Array.isArray(d.locks) || !Array.isArray(d.discovered)) return null;
    s.essence = d.essence;
    if (!int(d.souls, 0) || !int(d.rituals, 0) || !int(d.bestFloor, 1) || !int(d.bestRecordAtRunStart, 1) ||
        !d.artifacts || typeof d.artifacts !== 'object') return null;
    s.souls = d.souls; s.rituals = d.rituals;
    s.bestFloor = Math.max(d.bestFloor, d.maxFloor); s.bestRecordAtRunStart = d.bestRecordAtRunStart;
    for (const a of CONFIG.artifacts) {
      const lv = d.artifacts[a.id];
      if (lv === undefined) continue;
      if (!int(lv, 1) || (a.max && lv > a.max)) return null;
      s.artifacts[a.id] = lv;
    }
    for (const id of d.locks) if (allyDef(id)) s.locks[id] = true;
    for (const id of d.discovered) if (allyDef(id)) s.discovered[id] = true;
    for (const a of CONFIG.allies) if (!s.heroes[a.id].unlocked) s.allies[a.id].level = 0;   // нанять можно только открытых
    s.savedAt = typeof d.savedAt === 'number' && isFinite(d.savedAt) ? d.savedAt : null;
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
    soulMult, permMult, goldMult, bossTime, hasHeroAuto, artLevel, artPower, tapHit, expectedDps,
    findCost, findArtifact, upgradeArtCost, upgradeArtifact, foundCount, previewSpend,
    canRitual, ritualStartFloor, ritualSouls, ritual,
    setLock, sacrifice, sacrificeValue, needsRareConfirm, selectAllUnlocked, tearOfPortal, heroTrace, traceCost,
    summon, starUp, starCost, starMult, evoMult, heroMult, evoCost, canEvolve, evolve, forgeHeart, shardsForBoss, heartsForFloor, bossMaterials, squadAdd, squadRemove, inSquad, contribDps, reserveDps, ticketsForFloor,
    tapDamage, upgradeCost, maxAffordable, enemyMaxHp, killGold, firstClearGold,
    offlineDps, offlineProgress,
    biomeOf, biomeName, biomeCycle, isFinalBoss, isBiomeStart, rollRare, rareDef,
    serialize, deserialize, fmt,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = Core;
  else root.Core = Core;
})(this);
