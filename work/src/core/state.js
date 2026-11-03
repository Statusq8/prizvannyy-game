/* GameState: единственный источник правды. meta — служебное, run — сбрасывается перерождением,
   account — постоянное. Экраны только читают state и вызывают действия ядра. */
(function (PZ) {
  const SAVE_VERSION = 3;   // 2: портал/звёзды; 3: новый ростер 40 героев (концепт 03.11.2026)

  function newRun() {
    return {
      gold: 0,
      mainLevel: 1,
      hired: {},              // heroId -> уровень (>=1)
      cleared: 0,             // максимальный пройденный этаж в этом забеге
      farmFloor: null,        // выбранный пройденный этаж для фарма (null = идём к рекорду)
      autoAdvance: true,
      battle: null,           // текущий бой, создаётся combat.ensureBattle
      stats: { kills: 0, goldEarned: 0, bossFails: 0, taps: 0, playSeconds: 0 },
      startRecord: 0,         // рекорд аккаунта на старте забега (для осколков за новые рекорды)
      scrollsBought: 0,       // свитков куплено за золото в этом забеге (цена растёт)
      energy: {}, ultCarry: 0,             // heroId -> энергия ульты (0..100)
    };
  }

  function newAccount() {
    return {
      record: 0,              // глобальный рекорд: максимум пройденного этажа за все забеги
      owned: {},              // heroId -> true (коллекция, постоянно)
      visible: [],            // до 4 героев на сцене (выбор игрока), пусто = авто
      rebirths: 0,
      shards: 0,
      settings: { speed: 1, sound: true, effects: 'full' },
      relics: {}, mainClass: null, mainSubclass: null,
      bones: {}, boneSets: {}, bonePity: {},
      scrolls: 0, stars: {}, fragments: {}, materials: { essence: 0, core: 0, seal: 0 }, pity: { sinceA: 0, sinceS: 0, total: 0 },      // M5: инвентарь костей, ранги героев, гарантия выпадения
      rng: (Date.now() % 2147483647) >>> 0,       // зерно ГСЧ выпадений (хранится в сохранении)
    };
  }

  function newGame(now) {
    return {
      meta: { saveVersion: SAVE_VERSION, balance: PZ.B.id, created: now || Date.now(), lastTick: now || Date.now(), seq: 0 },
      run: newRun(),
      account: startingAccount(),
    };
  }

  // Стартовая коллекция (решение автора 03.11.2026): герои E и D; остальные — из портала.
  function startingAccount() {
    const a = newAccount();
    PZ.portal.startingOwned(a);
    for (const id of Object.keys(a.owned)) a.stars[id] = 1;
    a.scrolls = PZ.B.portal.startScrolls;
    return a;
  }

  // Все начисления золота — только здесь (MASTER M1: централизованное начисление).
  function addGold(s, amount, reason) {
    if (!(amount >= 0) || !isFinite(amount)) throw new Error('bad gold amount: ' + amount + ' ' + reason);
    s.run.gold += amount;
    s.run.stats.goldEarned += amount;
  }
  function spendGold(s, amount) {
    if (!(amount >= 0) || !isFinite(amount)) throw new Error('bad spend');
    if (s.run.gold < amount) return false;
    s.run.gold -= amount;
    return true;
  }

  // Защита от порчи: всё числовое конечно и неотрицательно.
  function validate(s) {
    const errs = [];
    const num = (v, n) => { if (typeof v !== 'number' || !isFinite(v) || v < 0) errs.push(n + '=' + v); };
    if (!s || !s.meta || !s.run || !s.account) return ['structure'];
    num(s.run.gold, 'gold'); num(s.run.mainLevel, 'mainLevel'); num(s.run.cleared, 'cleared'); num(s.account.record, 'record');
    if (s.run.mainLevel < 1) errs.push('mainLevel<1');
    if (s.account.record < s.run.cleared) errs.push('record<cleared');
    if (s.run.farmFloor !== null && !(s.run.farmFloor >= 1 && s.run.farmFloor <= s.run.cleared)) errs.push('farmFloor');
    for (const [id, lv] of Object.entries(s.run.hired)) {
      if (!PZ.HERO_BY_ID[id]) errs.push('unknown hero ' + id);
      num(lv, 'lv ' + id); if (lv < 1) errs.push('lv<1 ' + id);
      if (!s.account.owned[id]) errs.push('hired not owned ' + id);
    }
    if (PZ.bones) PZ.bones.validate(s, errs);
    if (PZ.portal) PZ.portal.validate(s, errs);
    if (PZ.meta) PZ.meta.validate(s, errs);
    if (PZ.classes) PZ.classes.validate(s, errs);
    return errs;
  }

  PZ.SAVE_VERSION = SAVE_VERSION;
  PZ.state = { newGame, newRun, newAccount, addGold, spendGold, validate };
})(globalThis.PZ = globalThis.PZ || {});
