  // ==== src/core/00c_config_modes.js — CONFIG: PvE, задания, достижения, фракции, связи, пресеты, проклятия, алхимия ====
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
      // 0.58 (ответ 173): «Эхо Башни» — раз в неделю пройденный биом с модификатором недели. Сила врагов — как на этаже
      // floorPct · рекорд; 9 врагов + финальный босс биома за time с. Первая победа недели — большая награда, дальше — осколки.
      echo: { attempts: 3, enemies: 10, time: 60, floorPct: 0.85, minFloor: 50,
        mods: [
          { id: 'noTap',  name: 'Без тапов',          rule: 'alliesOnly', text: 'тапы не наносят урона — бьёт только отряд' },
          { id: 'tapOnly', name: 'Только тапы',       rule: 'tapOnly',    text: 'отряд не атакует — только удары героя' },
          { id: 'noUlt',  name: 'Тишина',             rule: 'noUlts',     text: 'ультимейты отряда не срабатывают' },
          { id: 'hp2',    name: 'Двойная плоть',      hp: 2,              text: 'у врагов ×2 HP' },
          { id: 'fast',   name: 'Спешка',             time: 30,           text: 'всего 30 секунд на всех' },
        ],
        first: { tickets: 5, essence: 60, shardMult: 20 }, repeat: { shardMult: 5 } },
      endless: { attempts: 3, bossEvery: 10, hpMult: 3, bossTime: 30, essenceBase: 1, essenceStep: 20 },
      // Испытательная башня (GDD §10): равные условия для всех — только тапы фиксированной силы, без прокачки, критов,
      // союзников, питомца, способностей и бонусов. 15 с на стража; рекорд недели и за всё время. Числа TBD.
      trial: { attempts: 3, tapDmg: 1, hpBase: 20, hpStep: 6, time: 15, essencePer: 2 },
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
    // Задания (GDD §11): ежедневные, еженедельные, вводные. Прогресс — по счётчикам действий (key) или по значению (value).
    // go — куда ведёт кнопка «Перейти». Награды: tickets 🎟, essence ✦, shard 🔹, heart 🔥. Числа TBD.
    quests: {
      daily: [
        { id: 'd_kill',   key: 'kill',    goal: 500,  name: 'Победить врагов',        reward: { tickets: 1 },  go: 'arena' },
        { id: 'd_boss',   key: 'boss',    goal: 15,   name: 'Победить боссов Башни',  reward: { shard: 20 },   go: 'arena' },
        { id: 'd_tap',    key: 'tap',     goal: 1500, name: 'Нанести удары тапом',    reward: { essence: 10 }, go: 'arena' },
        { id: 'd_dun',    key: 'dungeon', goal: 2,    name: 'Пройти подземелья',      reward: { tickets: 1 },  go: 'pve' },
        { id: 'd_summon', key: 'summon',  goal: 3,    name: 'Призвать героев',        reward: { essence: 15 }, go: 'portal' },
        { id: 'd_all',    key: 'allDaily', goal: 5,   name: 'Выполнить все задания дня', reward: { heart: 1 } },
      ],
      weekly: [
        { id: 'w_kill',   key: 'kill',     goal: 5000, name: 'Победить врагов',        reward: { tickets: 5 },   go: 'arena' },
        { id: 'w_boss',   key: 'boss',     goal: 150,  name: 'Победить боссов Башни',  reward: { shard: 200 },   go: 'arena' },
        { id: 'w_dun',    key: 'dungeon',  goal: 10,   name: 'Пройти подземелья',      reward: { tickets: 3 },   go: 'pve' },
        { id: 'w_pers',   key: 'personal', goal: 5,    name: 'Победить личных боссов', reward: { heart: 2 },     go: 'pve' },
        { id: 'w_wave',   key: 'wave',     goal: 100,  name: 'Волны бесконечного подземелья', reward: { essence: 80 }, go: 'pve' },
        { id: 'w_evo',    key: 'evolve',   goal: 1,    name: 'Эволюционировать героя', reward: { shard: 150 },   go: 'heroes' },
      ],
      intro: [
        { id: 'i_f10',    value: 'floor', goal: 10,  name: 'Дойти до 10-го этажа',      reward: { tickets: 2 },  go: 'arena' },
        { id: 'i_hire',   value: 'hired', goal: 4,   name: 'Нанять весь отряд',         reward: { tickets: 1 },  go: 'up' },
        { id: 'i_summon', key: 'summon',  goal: 1,   name: 'Призвать героя в портале',   reward: { essence: 10 }, go: 'portal' },
        { id: 'i_f50',    value: 'floor', goal: 50,  name: 'Победить первого финального босса', reward: { shard: 50 }, go: 'arena' },
        { id: 'i_star',   key: 'star',    goal: 1,   name: 'Поднять звезду героя',       reward: { tickets: 2 },  go: 'heroes' },
        { id: 'i_dun',    key: 'dungeon', goal: 1,   name: 'Пройти ежедневное подземелье', reward: { tickets: 1 }, go: 'pve' },
        { id: 'i_rune',   key: 'rune',    goal: 1,   name: 'Создать руну',               reward: { shard: 30 },   go: 'runes' },
        { id: 'i_evo',    key: 'evolve',  goal: 1,   name: 'Эволюционировать героя',     reward: { shard: 100 },  go: 'heroes' },
        { id: 'i_f400',   value: 'floor', goal: 400, name: 'Дойти до 400-го этажа',      reward: { tickets: 10 }, go: 'arena' },
        { id: 'i_ritual', key: 'ritual',  goal: 1,   name: 'Провести первую регрессию',     reward: { heart: 3 },    go: 'souls' },
      ],
      // Регрессияьные (GDD §11): считаются с начала текущего забега, обновляются после каждого регрессии
      ritual: [
        { id: 'r_f100',  value: 'runFloor', goal: 100, name: 'Забег: дойти до 100-го этажа',  reward: { shard: 60 },   go: 'arena' },
        { id: 'r_f250',  value: 'runFloor', goal: 250, name: 'Забег: дойти до 250-го этажа',  reward: { tickets: 3 },  go: 'arena' },
        { id: 'r_f400',  value: 'runFloor', goal: 400, name: 'Забег: дойти до 400-го этажа',  reward: { souls: 5 },    go: 'arena' },
        { id: 'r_boss',  key: 'boss',       goal: 150, name: 'Забег: победить боссов',         reward: { heart: 1 },    go: 'arena' },
        { id: 'r_rare',  key: 'rare',       goal: 15,  name: 'Забег: победить редких врагов',  reward: { essence: 25 }, go: 'arena' },
        { id: 'r_hire',  value: 'runHire',  goal: 8,   name: 'Забег: нанять 8 героев',         reward: { souls: 3 },    go: 'up' },
      ],
    },
    // Достижения (GDD §7, §12): ступени по счётчикам и рекордам. Каждая ступень — награда и очко достижений;
    // очки — постоянный бонус всего урона (отдельная категория, без критов). Числа TBD.
    // 0.53 (ответ 103 + решение пользователя): последняя ступень каждого достижения даёт титул с небольшим постоянным бонусом
    achievements: {
      dmgPerPoint: 0.01,
      list: [
        { id: 'a_kill',   name: 'Истребитель',      icon: '⚔', metric: 'kill',    goals: [100, 1000, 10000, 100000, 1e6],  reward: { tickets: 2 },
          title: { name: 'Истребитель тысяч', bonus: { kind: 'allDmg', per: 0.03 } } },
        { id: 'a_boss',   name: 'Гроза боссов',     icon: '👹', metric: 'boss',    goals: [10, 100, 1000, 10000],           reward: { heart: 1 },
          title: { name: 'Гроза боссов', bonus: { kind: 'allDmg', per: 0.03 } } },
        { id: 'a_floor',  name: 'Восхождение',      icon: '🗼', metric: 'floor',   goals: [50, 100, 400, 1000, 5000, 20000, 100000], reward: { tickets: 3 },
          title: { name: 'Покоритель Башни', bonus: { kind: 'allDmg', per: 0.05 } } },
        { id: 'a_ritual', name: 'Жрец регрессии',     icon: '👻', metric: 'ritual',  goals: [1, 5, 20, 100],                  reward: { souls: 5 },
          title: { name: 'Верховный жрец', bonus: { kind: 'gold', per: 0.05 } } },
        { id: 'a_summon', name: 'Призыватель',      icon: '🌀', metric: 'summon',  goals: [10, 100, 1000],                  reward: { essence: 30 },
          title: { name: 'Повелитель портала', bonus: { kind: 'gold', per: 0.03 } } },
        { id: 'a_heroes', name: 'Коллекционер',     icon: '🪖', metric: 'heroes',  goals: [6, 10, 15],                      reward: { tickets: 5 },
          title: { name: 'Собиратель героев', bonus: { kind: 'allDmg', per: 0.03 } } },
        { id: 'a_evo',    name: 'Эволюция',         icon: '⬆', metric: 'evolve',  goals: [1, 10, 30],                      reward: { shard: 200 },
          title: { name: 'Мастер эволюции', bonus: { kind: 'allDmg', per: 0.03 } } },
        { id: 'a_bone',   name: 'Костеправ',        icon: '🦴', metric: 'bone',    goals: [1, 50, 500],                     reward: { shard: 150 },
          title: { name: 'Костяной мастер', bonus: { kind: 'gold', per: 0.03 } } },
        { id: 'a_dun',    name: 'Покоритель глубин', icon: '🧭', metric: 'dungeon', goals: [10, 100, 1000],                 reward: { tickets: 2 },
          title: { name: 'Покоритель глубин', bonus: { kind: 'gold', per: 0.03 } } },
        { id: 'a_wave',   name: 'Бесконечность',    icon: '∞', metric: 'endless', goals: [50, 200, 1000],                   reward: { essence: 50 },
          title: { name: 'Бесконечный', bonus: { kind: 'allDmg', per: 0.03 } } },
        { id: 'a_totem',  name: 'Хранитель тотемов', icon: '🗿', metric: 'totems', goals: [5, 10, 20],                      reward: { heart: 2 },
          title: { name: 'Хранитель тотемов', bonus: { kind: 'gold', per: 0.03 } } },
      ],
    },
    // Ранги (решение пользователя): 10 рангов × 10 подрангов = 100 ступеней у главного героя и у каждого союзника.
    // Каждая ступень поднимает потолок уровня: от 600 до 15 000 (плавно, кратно 10). Подранг — за осколки,
    // переход на новый ранг — ещё сердца (по номеру ранга); союзнику для рангов IV, VII, X нужна эволюция I, II, III.
    // Цена у союзников умножается на редкость (как у эволюции). Числа TBD.
    // 0.54 (ответы 28, 29, 137): 10 фракций — пока только метка (для фильтров), без игровых функций;
    // роль героя = тип его ультимейта. Фракции героев — в FACTION_OF ниже (временное распределение по описанию).
    factions: ['Свет', 'Буря', 'Лёд', 'Нежить', 'Кровь', 'Пламя', 'Война', 'Дикий лес', 'Тени', 'Бездна'],   // 10 народов
    sides: { 'Свет': ['Свет', 'Буря', 'Лёд'], 'Тьма': ['Нежить', 'Кровь', 'Пламя'], 'Дикие': ['Война', 'Дикий лес'], 'Тени': ['Тени', 'Бездна'] },   // 0.67: 4 стороны
    roles: { nuke: 'Удар', teamBuff: 'Усиление отряда', mark: 'Метка', tapBuff: 'Усиление героя', critBuff: 'Криты' },
    presets: 3,                                    // 0.54 (ответ 186): пресеты отряда
    // 0.57 (ответ 197): трофеи — с каждого уникального босса биома один раз навсегда; выставлены в Зале трофеев.
    // Босс биома: +0,5% всего урона; финальный босс биома: +1% золота (босс на каждом этаже — трофеи идут быстро;
    // при 1% / 2% этаж 400 ускорялся до 2–4 ч, симуляция). Числа временные.
    // 0.59 (ответ 175): проклятые этажи — редко (chance) на впервые достигнутом этаже предлагается проклятие; по желанию.
    // Принято — условие на весь этаж; победа над боссом этого этажа — награда; провал босса или уход — проклятие снято.
    curse: { chance: 0.03, minFloor: 30,
      mods: [
        { id: 'noTap', name: 'Немота',        rule: 'alliesOnly', text: 'тапы не наносят урона' },
        { id: 'hp2',   name: 'Двойная плоть', hp: 2,              text: 'у врагов ×2 HP' },
        { id: 'hp3',   name: 'Каменная кожа', hp: 3,              text: 'у врагов ×3 HP' },
        { id: 'noUlt', name: 'Тишина',        rule: 'noUlts',     text: 'ультимейты отряда не срабатывают' },
      ],
      reward: { tickets: 3, essence: 30, shardMult: 10 } },
    // 0.60 (ответ 181): алхимия — временные зелья из лишних осколков и эссенции. Цена в осколках растёт с рекордом
    // (shardsPer × осколки за босса рекордного этажа). Повторное зелье продлевает действие, не дольше maxSec. Время идёт и офлайн.
    alchemy: { maxSec: 7200, potions: [
      { id: 'gold',  name: 'Зелье алчности', icon: '🧪', kind: 'gold',   mult: 2, sec: 1800, shardsPer: 15, essence: 0,  desc: '×2 золота' },
      { id: 'dmg',   name: 'Зелье ярости',   icon: '⚗', kind: 'allDmg', mult: 2, sec: 900,  shardsPer: 25, essence: 20, desc: '×2 всего урона' },
      { id: 'shard', name: 'Зелье жатвы',    icon: '🫙', kind: 'shards', mult: 2, sec: 1800, shardsPer: 0,  essence: 40, desc: '×2 осколков' },
    ] },
    // 0.61 (ответ 182): вехи Башни — большие разовые награды за рекорд этажа (навсегда, регрессию не сбрасывает).
    // hero — открыть героя (если уже есть — copies копий), pet — питомец (если есть — frags фрагментов), art — уровни особого
    // артефакта; reward — в центр наград. Дальше последней — каждые every этажей награда after. Числа временные.
    towerMs: { list: [
      { at: 1000,   hero: 'seiren',  copies: 5, reward: { tickets: 20 } },
      { at: 2500,   pet: 'griffin',  frags: 60, reward: { essence: 100 } },
      { at: 5000,   art: 'crown',    levels: 1, reward: { tickets: 30 } },
      { at: 10000,  hero: 'kassian', copies: 5, reward: { tickets: 50 } },
      { at: 20000,  pet: 'world_eater', frags: 120, reward: { essence: 300 } },
      { at: 33000,  art: 'crown',    levels: 10, reward: { tickets: 60 } },
      { at: 50000,  hero: 'azrael',  copies: 5, reward: { tickets: 100 } },
      { at: 100000, art: 'crown',    levels: 20, reward: { tickets: 200, essence: 1000 } },
    ], every: 50000, after: { tickets: 100, essence: 500 } },
    // 0.62 (ответ 174): «Дневник призванного» — бестиарий (каждый вид врага: первая встреча, 100 и 1000 побед) и лор героев
    // (история открывается звёздами). Маленькие награды: за страницу биома (все враги и боссы встречены) и за знатока вида.
    diary: { page: { tickets: 2, essence: 20 }, master: 1000, masterReward: { essence: 5 }, loreStars: [0, 3, 8] },
    // 0.63 (ответ 183): скрытые комнаты — в каждом отрезке every этажей один тайный этаж (по номеру отрезка).
    // Первая победа над боссом этого этажа открывает комнату; в ней Страж тайника (hp × босса этажа, time с), попыток сколько угодно,
    // победа — один раз: награда. Найденные комнаты ждут в PvE.
    secret: { every: 2500, hp: 3, time: 40, reward: { tickets: 15, essence: 150, shardMult: 50 } },
    // 0.64 (ответ 188): престиж аккаунта — уровень игрока за всё сделанное (считается из прогресса, регрессию не сбрасывает).
    // Опыт: xp — очки за единицу. Уровень L нужен base·L^power опыта всего. За каждый уровень — reward; каждые frameEvery — рамка.
    prestige: { base: 500, power: 1.5,
      xp: { floor: 1, ritual: 200, hero: 100, star: 20, ach: 50, trophy: 30, page: 150, title: 300, secret: 500 },
      reward: { tickets: 2, essence: 10 }, frameEvery: 10,
      frames: ['Бронзовая', 'Серебряная', 'Золотая', 'Платиновая', 'Изумрудная', 'Алмазная', 'Кровавая', 'Теневая', 'Звёздная', 'Божественная'] },
    // 0.65 (ответ 191): перенос прокачки — звёзды и ранг одного героя частично переходят другому (той же редкости или выше).
    // Цель получает не меньше keep доли (не суммируется — берётся большее), источник теряет звёзды и ранг (копии, эволюция и уровни остаются).
    // Ранг цели не выше того, что позволяет её эволюция. Цена — эссенция × (номер редкости цели + 1).
    transfer: { keep: 0.7, essence: 50 },
    trophies: { boss: { kind: 'allDmg', per: 0.005 }, final: { kind: 'gold', per: 0.01 } },
    // 0.56 (ответы 48, 195): связи героев — пары и тройки по лору; если все в отряде, бонус действует на весь урон
    // (или золото). Помимо фракций. Герой может входить в несколько связей. Числа временные.
    bonds: [   // 0.67: связи из docs/HEROES.md
      { id: 'legion', name: 'Мёртвый легион',   heroes: ['velma', 'rotgar'],             bonus: { kind: 'allDmg', per: 0.10 }, lore: 'Она подняла его — и он остался служить.' },
      { id: 'blood',  name: 'Брат по крови',    heroes: ['borg', 'urgash'],              bonus: { kind: 'allDmg', per: 0.10 }, lore: 'Соперники, которые зовут друг друга братьями.' },
      { id: 'night',  name: 'Клинки в ночи',    heroes: ['irene', 'saya', 'nokt'],       bonus: { kind: 'allDmg', per: 0.15 }, lore: 'Теневые охотники — стрела и нож.' },
      { id: 'sky',    name: 'Небо и пламя',     heroes: ['zlatokryl', 'solarion'],       bonus: { kind: 'allDmg', per: 0.10 }, lore: 'Звери Престола.' },
      { id: 'pact',   name: 'Договор',          heroes: ['vorgat', 'kassian'],           bonus: { kind: 'gold',   per: 0.10 }, lore: 'Договоры, подписанные кровью.' },
      { id: 'dragon', name: 'Дракон и тень',    heroes: ['ignisar', 'umbragor'],         bonus: { kind: 'allDmg', per: 0.10 }, lore: 'Убийца и убитый.' },
      { id: 'pack',   name: 'Стая',             heroes: ['fenra', 'gnar', 'morrak'],     bonus: { kind: 'allDmg', per: 0.15 }, lore: 'Волки — живые и мёртвые.' },
      { id: 'guard',  name: 'Стража Эльдраса',  heroes: ['kaeron', 'azragor'],           bonus: { kind: 'allDmg', per: 0.10 }, lore: 'Капитан стражи и его король.' },
      { id: 'throne', name: 'Престол',          heroes: ['eliria', 'valtar', 'astrael'], bonus: { kind: 'allDmg', per: 0.15 }, lore: 'Закон Света.' },
      { id: 'frost',  name: 'Лёд и пламя',      heroes: ['yuki', 'eon'],                 bonus: { kind: 'gold',   per: 0.10 }, lore: 'Вечный спор.' },
      { id: 'altar',  name: 'Хранители Алтаря', heroes: ['morra', 'kassian'],            bonus: { kind: 'gold',   per: 0.10 }, lore: 'Хранительница доверяет только паладину крови.' },
      { id: 'cycle',  name: 'Конец и начало',   heroes: ['eon', 'erebor'],               bonus: { kind: 'allDmg', per: 0.10 }, lore: 'Обе Башни.' },
    ],
    ranks: { count: 10, subs: 10, capMin: 1000, capMax: 15000, shards: 50, growth: 1.07, evoFor: { 3: 1, 6: 2, 9: 3 },
      // 0.51 (ответ 155): ранги добавляются ступенями с обновлениями — каждое число здесь = новый ранг (10 подрангов)
      // с этим потолком уровня; потолок между рангами растёт плавно (геометрически). Пока пусто: на старте 10 рангов, 15 000.
      extra: [] },
    // Сезоны и боевой пропуск (GDD §11). Сезон — 28 дней, считается по дате устройства от epoch (понедельник).
    // Сезонный герой чередуется по номеру сезона. Тропа сезона — линейные задания. Числа TBD.
