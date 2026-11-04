// Ядро игры: только логика, без интерфейса. Работает в браузере и в Node (тесты).
(function (root) {
  'use strict';

  // ВРЕМЕННЫЕ значения для испытаний. По GDD (раздел 16) это TBD — не окончательный баланс.
  const CONFIG = {
    saveVersion: 10,
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
    // Полная Башня (GDD §2). 20 биомов по 50 этажей — до 1000-го, дальше по кругу (II, III …) — решение пользователя.
    // У биома свои враги, оттенок фона-зала (bg: поворот оттенка°, насыщенность, яркость), сложность, награды
    // и финальный босс на последнем этаже. Числа TBD.
    biomeFloors: 50,
    biomes: [
      { id: 'crypt',  name: 'Гнилые катакомбы',  bg: [0, 1, 1], hp: 1.00, gold: 1.0, rare: 0.03, sky: ['#1e1329', '#0d0a12'], hue: 0,
        enemies: ['Костяной страж', 'Гоблин-падальщик', 'Слепой культист', 'Болотный упырь'],
        bosses: ['Могильщик', 'Королева червей'], final: 'Хранитель Врат' },
      { id: 'ash',    name: 'Пепельные шахты',   bg: [105, 1.1, 0.95], hp: 1.05, gold: 1.1, rare: 0.03, sky: ['#2e1a14', '#120a08'], hue: 330,
        enemies: ['Пепельный волк', 'Ржавый механоид', 'Каменный голем', 'Угольный бес'],
        bosses: ['Мастер плавильни', 'Железный Тиран'], final: 'Владыка Пепла' },
      { id: 'shade',  name: 'Лес теней',         bg: [200, 0.9, 0.85], hp: 0.95, gold: 1.0, rare: 0.05, sky: ['#122418', '#080f0a'], hue: 100,
        enemies: ['Тень Башни', 'Шепчущий энт', 'Призрачная рысь', 'Ведьмина кукла'],
        bosses: ['Старейшина рощи', 'Безликий охотник'], final: 'Королева Теней' },
      { id: 'frost',  name: 'Ледяная цитадель',  bg: [-70, 0.7, 1.1], hp: 1.10, gold: 1.2, rare: 0.03, sky: ['#14223a', '#080c16'], hue: 190,
        enemies: ['Ледяной рыцарь', 'Кристальный паук', 'Снежный голем', 'Морозный дух'],
        bosses: ['Комендант стужи', 'Белый дракончик'], final: 'Король Вечной Зимы' },
      { id: 'tide',   name: 'Затопленный храм',  bg: [-110, 0.9, 0.95], hp: 1.00, gold: 1.1, rare: 0.04, sky: ['#0f2630', '#060f14'], hue: 160,
        enemies: ['Утопленник', 'Кровавый слизень', 'Жрец глубин', 'Морской змей'],
        bosses: ['Голос прилива', 'Хозяйка раковин'], final: 'Левиафан' },
      { id: 'blood',  name: 'Кровавая арена',    bg: [85, 1.4, 0.9], hp: 1.15, gold: 1.3, rare: 0.03, sky: ['#2e1018', '#12060a'], hue: 300,
        enemies: ['Гладиатор', 'Арена-берсерк', 'Кровавый пёс', 'Призрачный рыцарь'],
        bosses: ['Чемпион арены', 'Палач'], final: 'Пожиратель Душ' },
      { id: 'void',   name: 'Пустотные врата',   bg: [-30, 1.2, 0.9], hp: 1.05, gold: 1.2, rare: 0.05, sky: ['#1a1036', '#08061a'], hue: 230,
        enemies: ['Пустотный бес', 'Звёздный глаз', 'Искажённый маг', 'Пожиратель света'],
        bosses: ['Привратник', 'Сшитый из звёзд'], final: 'Око Бездны' },
      { id: 'throne', name: 'Престол Башни',     bg: [140, 1.3, 1.1], hp: 1.20, gold: 1.5, rare: 0.04, sky: ['#2a2210', '#100c04'], hue: 30,
        enemies: ['Золотой страж', 'Падший ангел', 'Хранитель свитков', 'Лик Башни'],
        bosses: ['Правая рука трона', 'Левая рука трона'], final: 'Первый Призыватель' },
      { id: 'rust',   name: 'Ржавые механизмы',  bg: [125, 0.6, 0.9],  hp: 1.05, gold: 1.2, rare: 0.04, sky: ['#2a1e14', '#0f0a06'], hue: 20,
        enemies: ['Шестерённый пёс', 'Паровой страж', 'Заводной солдат', 'Масляный слизень'],
        bosses: ['Главный инженер', 'Котёл-великан'], final: 'Часовщик Башни' },
      { id: 'garden', name: 'Небесный сад',      bg: [170, 0.9, 1.15], hp: 0.95, gold: 1.2, rare: 0.06, sky: ['#1a2e1e', '#08120a'], hue: 90,
        enemies: ['Цветочная фея', 'Лиана-душитель', 'Садовый голем', 'Пыльцевой рой'],
        bosses: ['Хранительница бутонов', 'Терновый рыцарь'], final: 'Древо Вершины' },
      { id: 'kings',  name: 'Склеп королей',     bg: [150, 0.8, 1.0],  hp: 1.15, gold: 1.4, rare: 0.03, sky: ['#2a2414', '#0f0c06'], hue: 40,
        enemies: ['Королевский мертвец', 'Позолоченный скелет', 'Стражник гробницы', 'Скарабей'],
        bosses: ['Безглавый принц', 'Королева-мумия'], final: 'Король под Курганом' },
      { id: 'fungus', name: 'Грибные гроты',     bg: [-150, 1.3, 1.0], hp: 1.00, gold: 1.2, rare: 0.05, sky: ['#14262a', '#060e10'], hue: 140,
        enemies: ['Спорник', 'Грибной тролль', 'Светящийся слизень', 'Мицелиевый дух'],
        bosses: ['Матка спор', 'Шляпочный великан'], final: 'Великая Грибница' },
      { id: 'forge',  name: 'Обсидиановая кузня', bg: [95, 1.5, 0.8], hp: 1.20, gold: 1.4, rare: 0.03, sky: ['#2e140c', '#100604'], hue: 340,
        enemies: ['Лавовый элементаль', 'Молотобоец', 'Обсидиановый голем', 'Искровой бес'],
        bosses: ['Мастер наковальни', 'Огненный кузнец'], final: 'Повелитель Горнила' },
      { id: 'mirror', name: 'Зеркальный лабиринт', bg: [-90, 0.4, 1.2], hp: 1.05, gold: 1.3, rare: 0.06, sky: ['#1e2230', '#0a0c12'], hue: 200,
        enemies: ['Отражение', 'Осколочный рыцарь', 'Двойник', 'Зеркальная моль'],
        bosses: ['Кривое зеркало', 'Тысячеликий'], final: 'Тот, Кто Смотрит Назад' },
      { id: 'plague', name: 'Чумные палаты',     bg: [40, 1.1, 0.85],  hp: 1.10, gold: 1.3, rare: 0.04, sky: ['#1e2a12', '#0a1006'], hue: 70,
        enemies: ['Чумной доктор', 'Гнилая крыса', 'Заражённый', 'Мушиный рой'],
        bosses: ['Главный лекарь', 'Чумная матрона'], final: 'Отец Мора' },
      { id: 'sand',   name: 'Песчаный некрополь', bg: [120, 0.9, 1.15], hp: 1.10, gold: 1.4, rare: 0.04, sky: ['#2e2414', '#120e06'], hue: 30,
        enemies: ['Песчаный скорпион', 'Пустынный мертвец', 'Жрец солнца', 'Барханный червь'],
        bosses: ['Фараон-призрак', 'Сфинкс'], final: 'Царь Пустых Песков' },
      { id: 'storm',  name: 'Грозовой шпиль',    bg: [-60, 1.0, 1.05], hp: 1.15, gold: 1.4, rare: 0.04, sky: ['#141e36', '#060a18'], hue: 210,
        enemies: ['Грозовой орёл', 'Громовой голем', 'Вихревой дух', 'Искра-бродяга'],
        bosses: ['Повелитель туч', 'Молниеносный рыцарь'], final: 'Око Шторма' },
      { id: 'flesh',  name: 'Сады плоти',        bg: [60, 1.4, 0.85],  hp: 1.20, gold: 1.5, rare: 0.04, sky: ['#2e1020', '#12060c'], hue: 310,
        enemies: ['Пульсирующий нарост', 'Сшитый пёс', 'Мясной голем', 'Кровавый цветок'],
        bosses: ['Садовник плоти', 'Многорукая'], final: 'Мать Опухоли' },
      { id: 'stars',  name: 'Звёздная обсерватория', bg: [-45, 1.1, 1.0], hp: 1.15, gold: 1.6, rare: 0.06, sky: ['#141036', '#06041a'], hue: 240,
        enemies: ['Астролог', 'Метеорный голем', 'Созвездие-зверь', 'Кометный дух'],
        bosses: ['Звездочёт', 'Падшая звезда'], final: 'Пожиратель Созвездий' },
      { id: 'heart',  name: 'Сердце Башни',      bg: [75, 1.6, 1.0],   hp: 1.25, gold: 2.0, rare: 0.05, sky: ['#30101a', '#140408'], hue: 350,
        enemies: ['Страж сердца', 'Живая кладка', 'Кровь Башни', 'Пульс'],
        bosses: ['Левое предсердие', 'Правое предсердие'], final: 'Сердце Башни' },
    ],
    // Залы: в каждом биоме 5 разных залов, смена каждые 10 этажей (решение пользователя).
    // Пока картинка одна — залы различаются ракурсом: x — сдвиг (%), zoom — приближение, flip — отражение,
    // hue/bri — поправка к оттенку и яркости биома. Свои картинки залов подставим позже.
    hallFloors: 10,
    halls: [
      { name: 'Преддверие',     x: 0,   zoom: 1.00, flip: false, hue: 0,   bri: 1.00 },
      { name: 'Галерея',        x: -8,  zoom: 1.18, flip: true,  hue: 12,  bri: 0.95 },
      { name: 'Залы стражи',    x: 9,   zoom: 1.30, flip: false, hue: -12, bri: 0.90 },
      { name: 'Святилище',      x: -5,  zoom: 1.45, flip: true,  hue: 20,  bri: 1.05 },
      { name: 'Чертог владыки', x: 0,   zoom: 1.12, flip: false, hue: -20, bri: 0.80 },
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
    // Дерево душ (GDD §8): боевая, экономическая и особая ветви, открываются числом ритуалов. Без критов.
    // Узел ветви открывается, когда у предыдущего есть хотя бы 1 уровень. Покупка за души уменьшает бонус душ. Числа TBD.
    soulTree: [
      { id: 'war', name: 'Боевая ветвь', rituals: 1, nodes: [
        { id: 'fury',   name: 'Ярость призванного', icon: '⚔', kind: 'heroDmg',  per: 0.3, cost: 2, growth: 1.3, max: 20, desc: '+30% урона главного героя' },
        { id: 'spirit', name: 'Боевой дух',         icon: '🛡', kind: 'allyDmg',  per: 0.3, cost: 3, growth: 1.3, max: 20, desc: '+30% урона союзников' },
        { id: 'heads',  name: 'Палач',              icon: '🪓', kind: 'bossDmg',  per: 0.5, cost: 5, growth: 1.4, max: 10, desc: '+50% урона по боссам' },
        { id: 'crack',  name: 'Разлом фаз',         icon: '💥', kind: 'vulnSec',  per: 1,   cost: 8, growth: 1.6, max: 5,  desc: '+1 с уязвимости босса на смене фазы' },
      ] },
      { id: 'eco', name: 'Ветвь достатка', rituals: 2, nodes: [
        { id: 'greed',  name: 'Жадность',           icon: '◆', kind: 'gold',     per: 0.25, cost: 3, growth: 1.3, max: 20, desc: '+25% золота' },
        { id: 'shards', name: 'Сборщик осколков',   icon: '🔹', kind: 'shards',   per: 0.2,  cost: 4, growth: 1.35, max: 10, desc: '+20% осколков' },
        { id: 'luck',   name: 'Чутьё охотника',     icon: '✦', kind: 'rareChance', per: 0.2, cost: 5, growth: 1.4, max: 10, desc: '+20% к шансу редких врагов' },
        { id: 'legacy', name: 'Наследие',           icon: '💰', kind: 'startGold', per: 50,  cost: 6, growth: 1.4, max: 10, desc: 'Новый забег начинается с запасом золота' },
      ] },
      { id: 'mystic', name: 'Тайная ветвь', rituals: 3, nodes: [
        { id: 'echo',   name: 'Отголосок ритуала',  icon: '👻', kind: 'ritualSouls', per: 0.1, cost: 6, growth: 1.4, max: 20, desc: '+10% душ за ритуал' },
        { id: 'dream',  name: 'Сон наяву',          icon: '🌙', kind: 'offlineDmg',  per: 0.2, cost: 5, growth: 1.35, max: 10, desc: '+20% урона отряда офлайн' },
        { id: 'haste',  name: 'Порыв',              icon: '⏱', kind: 'abilityCd',   per: 0.05, cost: 6, growth: 1.4, max: 10, desc: '−5% перезарядки способностей героя' },
      ] },
    ],
    // Руны (GDD §8): глобальные бонусы команде — урон и экономика, без критов. Коллекция, создание, слияние, улучшение.
    // В каждом виде действует лучшая руна. Слияние: 3 руны одного вида и редкости → 1 следующей редкости. Числа TBD.
    runes: {
      kinds: [
        { id: 'might',  name: 'Руна мощи',     icon: 'ᚦ', kind: 'allDmg',  base: 0.10, desc: 'всего урона' },
        { id: 'host',   name: 'Руна отряда',   icon: 'ᚱ', kind: 'allyDmg', base: 0.15, desc: 'урона союзников' },
        { id: 'strike', name: 'Руна удара',    icon: 'ᛏ', kind: 'heroDmg', base: 0.15, desc: 'урона героя' },
        { id: 'hunt',   name: 'Руна охоты',    icon: 'ᛒ', kind: 'bossDmg', base: 0.15, desc: 'урона по боссам' },
        { id: 'wealth', name: 'Руна богатства', icon: 'ᚠ', kind: 'gold',   base: 0.10, desc: 'золота' },
        { id: 'stone',  name: 'Руна камня',    icon: 'ᛃ', kind: 'shards',  base: 0.05, desc: 'осколков' },
      ],
      createCost: 25,                 // осколков за новую руну редкости E
      tierPower: 2,                   // каждая редкость ×2 к силе
      perLevel: 0.15,                 // +15% силы за уровень
      maxLevel: 10,
      upCost: 10, upGrowth: 1.3,      // улучшение: 10 · ×(редкость+1) · 1.3^ур осколков
      mergeCount: 3,
    },
    // Тотемы (GDD §8): постоянный общий DPS и коллекция, без критов. Тотем биома — за первое в игре
    // прохождение его финального босса. Уровень — за осколки и сердца. Числа TBD.
    totems: { dpsPerLevel: 0.1, collection: [5, 10, 15, 20], collectionMult: 1.25, maxLevel: 20,
              upShards: 50, upGrowth: 1.4, heartEvery: 5 },   // каждый 5-й уровень требует ещё 1 сердце
    // Доп. PvE (GDD §10). Режимы используют тот же бой (тапы, союзники, ульты, способности), но свои враги и таймеры.
    // Попытка тратится при входе. Ежедневные попытки обновляются в полночь по времени устройства. Числа TBD.
    pve: {
      // Ежедневные подземелья: 5 врагов + страж за общий таймер, фиксированная награда по уровню сложности
      dungeons: [
        { id: 'vault', name: 'Сокровищница', icon: '◆', reward: 'gold',  desc: 'Много золота для текущего забега' },
        { id: 'mine',  name: 'Шахта осколков', icon: '🔹', reward: 'shard', desc: 'Осколки для эволюции, рун и тотемов' },
        { id: 'forge', name: 'Рунная кузня', icon: 'ᚦ', reward: 'rune',  desc: 'Руна; на высоком уровне — сразу редкая' },
      ],
      dailyAttempts: 2, dungeonEnemies: 6, dungeonTime: 45, tierFloors: 10,   // уровень N ≈ этаж 10·N; открыт до рекорда/10
      vaultGold: 30, mineShards: 5, forgeTierEvery: 10,                        // кузня: редкость руны = уровень / 10
      // Бесконечное подземелье: волны по одному врагу, каждые 10 — контрольный босс с таймером; рекорд волн
      endless: { attempts: 3, bossEvery: 10, hpMult: 3, bossTime: 30, essenceBase: 1, essenceStep: 20 },
      // Личные боссы: финальные боссы пройденных биомов, выбор сложности, ручные попытки
      personal: {
        attempts: 3, time: 40,
        diffs: [
          { id: 'normal', name: 'Обычный', hp: 1,  hearts: 1, shards: 2 },
          { id: 'hard',   name: 'Сложный', hp: 5,  hearts: 2, shards: 5 },
          { id: 'night',  name: 'Кошмар',  hp: 25, hearts: 4, shards: 12 },
        ],
      },
    },
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
  function hallOf(floor) { const H = CONFIG.halls; return H[Math.floor(((floor - 1) % CONFIG.biomeFloors) / CONFIG.hallFloors) % H.length]; }
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
  // ---------- дерево душ ----------
  function treeNodes() { const o = []; for (const b of CONFIG.soulTree) b.nodes.forEach((n, i) => o.push({ ...n, branch: b, index: i })); return o; }
  const TREE = treeNodes();
  function treeDef(id) { return TREE.find(n => n.id === id); }
  function treeLevel(s, id) { return (s.tree && s.tree[id]) | 0; }
  function bossDmgMult(s) { return (1 + treePower(s, 'bossDmg')) * (1 + runePower(s, 'bossDmg')); }
  function shardMult(s) { return (1 + treePower(s, 'shards')) * (1 + runePower(s, 'shards')); }
  function treePower(s, kind) { let x = 0; for (const n of TREE) if (n.kind === kind) x += n.per * treeLevel(s, n.id); return x; }
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
    if (cost == null || !treeNodeOpen(s, id) || s.souls < cost) return false;
    s.souls -= cost;
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
  function goldMult(s) { return (1 + artPower(s, 'gold')) * (1 + treePower(s, 'gold')) * (1 + runePower(s, 'gold')); }
  function bossTime(s) { return CONFIG.bossTimeSec + artPower(s, 'bossTime'); }
  function hasHeroAuto(s) { return artLevel(s, 'blade') > 0; }
  // Постоянный множитель урона по источнику: души × грааль × (герой или союзники)
  function permMult(s, source) {
    let m = soulMult(s) * (1 + artPower(s, 'allDmg')) * (1 + runePower(s, 'allDmg')) * totemMult(s);
    if (source === 'tap' || source === 'heroAuto') m *= (1 + artPower(s, 'tapDmg')) * (1 + artPower(s, 'heroAuto')) * (1 + treePower(s, 'heroDmg')) * (1 + runePower(s, 'heroDmg'));
    else m *= (1 + artPower(s, 'allyDmg')) * (1 + treePower(s, 'allyDmg')) * (1 + runePower(s, 'allyDmg'));
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
    const chance = biomeOf(floor).rare * (1 + treePower(s, 'rareChance'));
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
      tree: {},                                  // дерево душ: id узла → уровень
      runes: [], runeSeq: 1,                     // руны: { id, type, tier (0 = E … 6 = GOD), lvl }
      totems: {},                                // id биома → уровень тотема
      pve: { day: '', used: {}, endlessBest: 0 },  // ежедневные попытки и рекорд бесконечного подземелья
      mode: null,                                // текущий PvE-режим (не сохраняется)
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
    if (s.mode) return spawnMode(s);
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
    if (s.enemy.isBoss) m *= bossDmgMult(s);
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
      e.phase++; e.vuln = CONFIG.bossPhases.vulnSec + treePower(s, 'vulnSec');
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
    if (s.mode) return modeKill(s, events);
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
      const n = Math.ceil(rare.shards * shardsForBoss(s.floor) * shardMult(s));
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
      if (mat.heart) {
        s.heartFloor = s.floor;
        const b = biomeOf(s.floor);
        if (isFinalBoss(s.floor) && !s.totems[b.id]) { s.totems[b.id] = 1; events.push({ type: 'totem', id: b.id, name: b.name }); }
      }
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
    if (s.mode) { modeTimer(s, dt, events); return events; }
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

  // ---------- доп. PvE ----------
  // Сброс ежедневных попыток: dayKey — дата устройства 'ГГГГ-ММ-ДД' (передаёт интерфейс)
  function dailyReset(s, dayKey) {
    if (s.pve.day !== dayKey) { s.pve.day = dayKey; s.pve.used = {}; }
  }
  function attemptsLeft(s, key) {
    const P = CONFIG.pve, max = key === 'endless' ? P.endless.attempts : key === 'personal' ? P.personal.attempts : P.dailyAttempts;
    return Math.max(0, max - (s.pve.used[key] | 0));
  }
  function maxDungeonTier(s) { return Math.max(1, Math.floor(s.bestFloor / CONFIG.pve.tierFloors)); }
  function dungeonDef(id) { return CONFIG.pve.dungeons.find(d => d.id === id); }
  // Фиксированная награда подземелья на уровне tier
  function dungeonReward(s, id, tier) {
    const P = CONFIG.pve, f = tier * P.tierFloors, d = dungeonDef(id);
    if (d.reward === 'gold') return { gold: Math.ceil(killGold(f, true) * P.vaultGold * goldMult(s)) };
    if (d.reward === 'shard') return { shard: Math.ceil(shardsForBoss(f) * P.mineShards * shardMult(s)) };
    return { runeTier: Math.min(CONFIG.rarities.length - 1, Math.floor(tier / P.forgeTierEvery)) };
  }
  // Личные боссы — финальные боссы биомов, чей тотем уже получен
  function personalBosses(s) {
    const out = [];
    CONFIG.biomes.forEach((b, i) => { if (s.totems[b.id]) out.push({ id: b.id, name: b.final, floor: (i + 1) * CONFIG.biomeFloors, biome: b.name }); });
    return out;
  }
  function personalReward(s, floor, diff) {
    const D = CONFIG.pve.personal.diffs.find(x => x.id === diff);
    return { heart: D.hearts, shard: Math.ceil(shardsForBoss(floor) * D.shards * shardMult(s)) };
  }
  // Вход в режим: тратит попытку, тот же бой, своя очередь врагов
  function enterMode(s, kind, opts, dayKey) {
    if (s.mode) return null;
    if (dayKey) dailyReset(s, dayKey);
    const P = CONFIG.pve;
    let m;
    if (kind === 'dungeon') {
      const d = dungeonDef(opts.id), tier = opts.tier | 0;
      if (!d || tier < 1 || tier > maxDungeonTier(s) || !attemptsLeft(s, d.id)) return null;
      m = { kind, id: d.id, name: d.name, tier, step: 1, total: P.dungeonEnemies, timeLeft: P.dungeonTime, timeMax: P.dungeonTime };
      s.pve.used[d.id] = (s.pve.used[d.id] | 0) + 1;
    } else if (kind === 'endless') {
      if (!attemptsLeft(s, 'endless')) return null;
      m = { kind, id: 'endless', name: 'Бесконечное подземелье', step: 1, timeLeft: 0, timeMax: P.endless.bossTime, essence: 0, tickets: 0 };
      s.pve.used.endless = (s.pve.used.endless | 0) + 1;
    } else if (kind === 'personal') {
      const b = personalBosses(s).find(x => x.id === opts.id), D = P.personal.diffs.find(x => x.id === opts.diff);
      if (!b || !D || !attemptsLeft(s, 'personal')) return null;
      m = { kind, id: b.id, name: b.name, floor: b.floor, diff: D.id, diffName: D.name, step: 1, total: 1, timeLeft: P.personal.time, timeMax: P.personal.time };
      s.pve.used.personal = (s.pve.used.personal | 0) + 1;
    } else return null;
    s.mode = m;
    s.buffs = { team: 0, tap: 0, teamPower: 1, tapPower: 1 };
    spawn(s);
    return [{ type: 'modeStart', kind, name: m.name }, { type: 'spawn' }];
  }
  function spawnMode(s) {
    const m = s.mode, P = CONFIG.pve;
    let hp, isBoss, name;
    if (m.kind === 'dungeon') {
      const f = m.tier * P.tierFloors;
      isBoss = m.step === m.total;
      hp = enemyMaxHp(f, isBoss);
      name = isBoss ? 'Страж: ' + m.name : enemyName(f, m.step, false);
    } else if (m.kind === 'endless') {
      isBoss = m.step % P.endless.bossEvery === 0;
      hp = Math.ceil(enemyMaxHp(m.step, isBoss) * P.endless.hpMult);
      name = (isBoss ? 'Контрольный босс · ' : '') + enemyName(m.step, m.step % 9 + 1, isBoss);
      if (isBoss) m.timeLeft = P.endless.bossTime;
    } else {
      isBoss = true;
      hp = Math.ceil(enemyMaxHp(m.floor, true) * P.personal.diffs.find(x => x.id === m.diff).hp);
      name = m.name + ' · ' + m.diffName;
    }
    const final = m.kind === 'personal';
    s.enemy = { hp, maxHp: hp, isBoss, final, alive: true, mark: 0, markPower: 1, rare: null, phase: 1, vuln: 0, name };
    s.bossTimeLeft = m.timeLeft;
    s.respawn = 0;
  }
  function modeKill(s, events) {
    const m = s.mode, P = CONFIG.pve;
    s.stats.kills++;
    events.push({ type: 'kill', gold: 0, boss: s.enemy.isBoss, mode: true });
    if (m.kind === 'endless') {
      if (s.enemy.isBoss) {
        const e = P.endless.essenceBase + Math.floor(m.step / P.endless.essenceStep);
        m.essence += e; s.essence += e;
        if (m.step > s.pve.endlessBest) { m.tickets++; s.tickets++; }   // новый рекордный рубеж — билет
      }
      s.pve.endlessBest = Math.max(s.pve.endlessBest, m.step);
      m.step++;
      return;
    }
    if (m.step < m.total) { m.step++; return; }
    finishMode(s, true, events);
  }
  function modeTimer(s, dt, events) {
    const m = s.mode;
    if (m.kind === 'endless' && !s.enemy.isBoss) return;     // таймер только у контрольного босса
    m.timeLeft -= dt; s.bossTimeLeft = m.timeLeft;
    if (m.timeLeft <= 0) finishMode(s, m.kind === 'endless', events);
  }
  // Итог режима: награда при победе (в бесконечном — уже начислена по ходу), возврат в Башню
  function finishMode(s, win, events) {
    const m = s.mode, res = { type: 'modeEnd', kind: m.kind, name: m.name, win, reward: {} };
    if (m.kind === 'dungeon' && win) {
      const r = dungeonReward(s, m.id, m.tier);
      if (r.gold) s.gold += r.gold;
      if (r.shard) s.materials.shard += r.shard;
      if (r.runeTier != null) {
        const R = CONFIG.runes, k = R.kinds[Math.min(R.kinds.length - 1, Math.floor(s.rng() * R.kinds.length))];
        s.runes.push({ id: s.runeSeq++, type: k.id, tier: r.runeTier, lvl: 0 }); r.runeType = k.id;
      }
      res.reward = r;
    } else if (m.kind === 'personal' && win) {
      const r = personalReward(s, m.floor, m.diff);
      s.materials.heart += r.heart; s.materials.shard += r.shard;
      res.reward = r;
    } else if (m.kind === 'endless') {
      res.reward = { waves: m.step - 1, essence: m.essence, tickets: m.tickets, best: s.pve.endlessBest };
    }
    exitMode(s);
    events.push(res, { type: 'spawn' });
    return res;
  }
  // Сдаться / выйти: попытка уже потрачена
  function leaveMode(s) {
    if (!s.mode) return [];
    const ev = [];
    finishMode(s, s.mode.kind === 'endless', ev);
    return ev;
  }
  function exitMode(s) {
    s.mode = null;
    s.buffs = { team: 0, tap: 0, teamPower: 1, tapPower: 1 };
    s.enemyIndex = Math.min(s.enemyIndex, CONFIG.enemiesPerFloor);
    spawn(s);
  }

  // ---------- офлайн ----------
  // Средний авто-урон без тапов, ультимейтов и способностей, с учётом критов
  function offlineDps(s) { return autoDps(s) * (1 + critChance({ ...s, abilities: newAbilities() }) * (critMult(s) - 1)) * (1 + treePower(s, 'offlineDmg')); }
  function killTime(hp, dps) { return Math.max(hp / dps, CONFIG.offline.minKillSec) + CONFIG.respawnDelaySec; }
  // Проиграть отсутствие: продвижение до стены (босс не успевает умереть за таймер), потом фарм этажа ниже.
  // Возвращает сводку или null, если отсутствие короче minSec.
  function offlineProgress(s, seconds) {
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
    if (dps > 0) {
      // Был в фарме после проигрыша — снова пробуем рубеж (самый высокий открытый этаж)
      if (s.farming) { s.floor = s.maxFloor; s.enemyIndex = CONFIG.enemiesPerFloor; s.farming = false; }
      const events = [];
      while (!s.farming) {
        const isBoss = s.enemyIndex === CONFIG.enemiesPerFloor;
        const hp = enemyMaxHp(s.floor, isBoss);
        if (isBoss && hp / (dps * bossDmgMult(s)) > bossTime(s)) {             // стена: босс не умирает за таймер
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
    return { shard: Math.ceil(shardsForBoss(f) * shardMult(s)), heart: f > s.heartFloor ? heartsForFloor(f) : 0 };
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

  // ---------- руны: создание, улучшение, слияние ----------
  function createRune(s) {
    const R = CONFIG.runes;
    if (s.materials.shard < R.createCost) return null;
    s.materials.shard -= R.createCost;
    const k = R.kinds[Math.min(R.kinds.length - 1, Math.floor(s.rng() * R.kinds.length))];
    const r = { id: s.runeSeq++, type: k.id, tier: 0, lvl: 0 };
    s.runes.push(r);
    return r;
  }
  function runeById(s, id) { return s.runes.find(r => r.id === id); }
  function runeUpCost(r) {
    const R = CONFIG.runes;
    return r.lvl >= R.maxLevel ? null : Math.ceil(R.upCost * (r.tier + 1) * Math.pow(R.upGrowth, r.lvl));
  }
  function upgradeRune(s, id) {
    const r = runeById(s, id), c = r && runeUpCost(r);
    if (!c || s.materials.shard < c) return false;
    s.materials.shard -= c; r.lvl++;
    return true;
  }
  // Можно ли слить: есть mergeCount рун вида и редкости, и это не высшая редкость
  function mergeable(s, type, tier) {
    return tier < CONFIG.rarities.length - 1 && s.runes.filter(r => r.type === type && r.tier === tier).length >= CONFIG.runes.mergeCount;
  }
  // Слияние берёт руны с наименьшим уровнем; новая руна — следующей редкости, уровень 0
  function mergeRunes(s, type, tier) {
    if (!mergeable(s, type, tier)) return null;
    const use = s.runes.filter(r => r.type === type && r.tier === tier).sort((a, b) => a.lvl - b.lvl).slice(0, CONFIG.runes.mergeCount);
    s.runes = s.runes.filter(r => !use.includes(r));
    const r = { id: s.runeSeq++, type, tier: tier + 1, lvl: 0 };
    s.runes.push(r);
    return r;
  }
  // ---------- тотемы ----------
  function totemUpCost(s, id) {
    const T = CONFIG.totems, lv = s.totems[id];
    if (!lv || lv >= T.maxLevel) return null;
    return { shards: Math.ceil(T.upShards * Math.pow(T.upGrowth, lv - 1)), hearts: (lv + 1) % T.heartEvery === 0 ? 1 : 0 };
  }
  function upgradeTotem(s, id) {
    const c = totemUpCost(s, id);
    if (!c || s.materials.shard < c.shards || s.materials.heart < c.hearts) return false;
    s.materials.shard -= c.shards; s.materials.heart -= c.hearts; s.totems[id]++;
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
    const t = { ...s, souls: s.souls, artifacts: { ...s.artifacts }, tree: { ...s.tree } };
    if (action === 'upgrade') { const c = upgradeArtCost(s, id); if (c == null) return null; t.souls -= c; t.artifacts[id]++; }
    if (action === 'tree') { const c = treeCost(s, id); if (c == null) return null; t.souls -= c; t.tree[id] = treeLevel(s, id) + 1; }
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
    return Math.floor((base + record) * (1 + treePower(s, 'ritualSouls')));
  }
  // «Наследие»: стартовый запас золота = per·уровень × золото за босса стартового этажа
  function ritualStartGold(s) { return Math.ceil(treePower(s, 'startGold') * killGold(ritualStartFloor(s), true)); }
  function ritual(s) {
    if (!canRitual(s)) return null;
    if (s.mode) exitMode(s);
    const souls = ritualSouls(s);
    s.souls += souls;
    s.rituals++;
    s.bestFloor = Math.max(s.bestFloor, s.maxFloor);
    s.bestRecordAtRunStart = s.bestFloor;
    const start = ritualStartFloor(s);
    // сбрасывается: золото, временные уровни, найм, прогресс забега
    s.gold = ritualStartGold(s); s.tapLevel = 1;
    for (const a of CONFIG.allies) { const st = s.allies[a.id]; st.level = 0; st.ult = 0; st.cd = a.attackInterval; }
    s.buffs = { team: 0, tap: 0, teamPower: 1, tapPower: 1 };
    s.floor = start; s.maxFloor = start; s.highestCleared = start - 1;
    s.enemyIndex = 1; s.farming = false; s.reserveAcc = 0; s.heroAutoAcc = 0;
    spawn(s);
    // сохраняется: дерево душ, герои, звёзды, эволюции, материалы, копии, отряд, билеты, гарантии, эссенция, артефакты, души, способности, рекорды
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
      souls: s.souls, artifacts: { ...s.artifacts }, tree: { ...s.tree },
      runes: s.runes.map(r => ({ ...r })), runeSeq: s.runeSeq, totems: { ...s.totems },
      pve: { day: s.pve.day, used: { ...s.pve.used }, endlessBest: s.pve.endlessBest }, rituals: s.rituals, bestFloor: s.bestFloor, bestRecordAtRunStart: s.bestRecordAtRunStart,
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
    if (d.v === 7) { d.v = 8; d.tree = {}; }               // 0.13 → 0.14: дерево душ
    if (d.v === 8) {                                       // 0.14 → 0.15: руны и тотемы за уже пройденных финальных боссов
      d.v = 9; d.runes = []; d.runeSeq = 1; d.totems = {};
      for (let f = CONFIG.biomeFloors; f <= (d.heartFloor | 0); f += CONFIG.biomeFloors) d.totems[biomeOf(f).id] = 1;
    }
    if (d.v === 9) { d.v = 10; d.pve = { day: '', used: {}, endlessBest: 0 }; }   // 0.15 → 0.16: доп. PvE
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
    if (!Array.isArray(d.runes) || !int(d.runeSeq, 1) || !d.totems || typeof d.totems !== 'object') return null;
    for (const r of d.runes) {
      if (!r || !runeKind(r.type) || !int(r.id, 1) || !int(r.tier, 0) || r.tier >= CONFIG.rarities.length ||
          !int(r.lvl, 0) || r.lvl > CONFIG.runes.maxLevel) return null;
      s.runes.push({ id: r.id, type: r.type, tier: r.tier, lvl: r.lvl });
    }
    s.runeSeq = Math.max(d.runeSeq, ...s.runes.map(r => r.id + 1));
    for (const b of CONFIG.biomes) {
      const lv = d.totems[b.id];
      if (lv === undefined) continue;
      if (!int(lv, 1) || lv > CONFIG.totems.maxLevel) return null;
      s.totems[b.id] = lv;
    }
    const pv = d.pve;
    if (!pv || typeof pv !== 'object' || typeof pv.day !== 'string' || !pv.used || typeof pv.used !== 'object' || !int(pv.endlessBest, 0)) return null;
    s.pve = { day: pv.day, used: {}, endlessBest: pv.endlessBest };
    for (const k in pv.used) if (int(pv.used[k], 0)) s.pve.used[k] = pv.used[k];
    if (!d.tree || typeof d.tree !== 'object') return null;
    for (const n of TREE) {
      const lv = d.tree[n.id];
      if (lv === undefined) continue;
      if (!int(lv, 1) || lv > n.max) return null;
      s.tree[n.id] = lv;
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
    canRitual, ritualStartFloor, ritualSouls, ritual, ritualStartGold,
    runeKind, runeValue, bestRune, runePower, createRune, runeUpCost, upgradeRune, mergeable, mergeRunes,
    totemCount, totemMult, totemUpCost, upgradeTotem, bossDmgMult, shardMult,
    treeDef, treeLevel, treePower, branchOpen, treeNodeOpen, treeCost, buyTreeNode,
    setLock, sacrifice, sacrificeValue, needsRareConfirm, selectAllUnlocked, tearOfPortal, heroTrace, traceCost,
    summon, starUp, starCost, starMult, evoMult, heroMult, evoCost, canEvolve, evolve, forgeHeart, shardsForBoss, heartsForFloor, bossMaterials, squadAdd, squadRemove, inSquad, contribDps, reserveDps, ticketsForFloor,
    tapDamage, upgradeCost, maxAffordable, enemyMaxHp, killGold, firstClearGold,
    offlineDps, offlineProgress,
    dailyReset, attemptsLeft, maxDungeonTier, dungeonReward, personalBosses, personalReward, enterMode, leaveMode,
    biomeOf, biomeName, hallOf, biomeCycle, isFinalBoss, isBiomeStart, rollRare, rareDef,
    serialize, deserialize, fmt,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = Core;
  else root.Core = Core;
})(this);
