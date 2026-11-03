/* M4: классы Призванного (У: класс на ур. 100, подкласс на 250; сохраняются после перерождения).
   Бонусы классов в GDD не определены (Н) — ниже тестовые значения (З), их можно менять здесь.
   Смена класса не ловушка (GDD 4.2): переобучение за свитки. */
(function (PZ) {
  const B = PZ.B;
  const CLASSES = {
    warrior: { name: 'Воин', idea: 'размашистые удары', fx: { main: 2 }, subs: {
      berserk: { name: 'Берсерк', fx: { main: 2, tap: 1.5 } },
      abyss_knight: { name: 'Рыцарь Бездны', fx: { boss: 1.5, bossTimer: 10 } } } },
    mage: { name: 'Маг', idea: 'взрывы магии', fx: { heroes: 1.15 }, subs: {
      archmage: { name: 'Архимаг', fx: { heroes: 1.2 } },
      elements: { name: 'Повелитель Стихий', fx: { heroes: 1.1, spawn: 0.3 } } } },
    assassin: { name: 'Убийца', idea: 'серии ударов', fx: { tap: 3 }, subs: {
      shadow_blade: { name: 'Теневой клинок', fx: { tap: 3 } },
      reaper: { name: 'Жнец', fx: { boss: 1.6 } } } },
    archer: { name: 'Лучник', idea: 'точные выстрелы', fx: { normal: 1.5 }, subs: {
      sniper: { name: 'Снайпер', fx: { normal: 1.6 } },
      beastmaster: { name: 'Повелитель Зверей', fx: { wild: 2 } } } },
    necro: { name: 'Некромант', idea: 'призраки и проклятия', fx: { gold: 1.4 }, subs: {
      lord_dead: { name: 'Повелитель Мёртвых', fx: { undead: 2.5, gold: 1.2 } },
      lich: { name: 'Лич', fx: { gold: 1.5, bones: 1.5 } } } },
  };
  const C = B.classes = { classLevel: 100, subclassLevel: 250, respecScrolls: 10 };   // З
  const ADD = { bossTimer: true, spawn: true };   // эти эффекты складываются (секунды / доля), остальные — множители

  function fxList(s) {
    const a = s.account, out = [];
    const c = a.mainClass && CLASSES[a.mainClass];
    if (c) { out.push(c.fx); const sc = a.mainSubclass && c.subs[a.mainSubclass]; if (sc) out.push(sc.fx); }
    return out;
  }
  function mult(s, key) { let m = 1; for (const f of fxList(s)) if (f[key] && !ADD[key]) m *= f[key]; return m; }
  function add(s, key) { let v = 0; for (const f of fxList(s)) if (f[key] && ADD[key]) v += f[key]; return v; }

  function canChooseClass(s) { return !s.account.mainClass && s.run.mainLevel >= C.classLevel; }
  function canChooseSub(s) { return !!s.account.mainClass && !s.account.mainSubclass && s.run.mainLevel >= C.subclassLevel; }
  function chooseClass(s, id) {
    if (!CLASSES[id]) return { ok: false, err: 'Нет такого класса' };
    if (s.account.mainClass) return { ok: false, err: 'Класс уже выбран' };
    if (s.run.mainLevel < C.classLevel) return { ok: false, err: 'Класс — с уровня ' + C.classLevel };
    s.account.mainClass = id; return { ok: true };
  }
  function chooseSub(s, id) {
    const c = CLASSES[s.account.mainClass];
    if (!c) return { ok: false, err: 'Сначала выберите класс' };
    if (!c.subs[id]) return { ok: false, err: 'Нет такого подкласса у класса ' + c.name };
    if (s.account.mainSubclass) return { ok: false, err: 'Подкласс уже выбран' };
    if (s.run.mainLevel < C.subclassLevel) return { ok: false, err: 'Подкласс — с уровня ' + C.subclassLevel };
    s.account.mainSubclass = id; return { ok: true };
  }
  // Переобучение: класс и подкласс сбрасываются, выбрать заново можно сразу (если уровень позволяет).
  function respec(s) {
    if (!s.account.mainClass) return { ok: false, err: 'Класс ещё не выбран' };
    if ((s.account.scrolls || 0) < C.respecScrolls) return { ok: false, err: 'Нужно ' + C.respecScrolls + ' свитков' };
    s.account.scrolls -= C.respecScrolls;
    s.account.mainClass = null; s.account.mainSubclass = null;
    return { ok: true };
  }
  function describe(fx) {
    const T = { main: 'урон Призванного', heroes: 'урон героев', tap: 'урон тапа', boss: 'урон по боссам', normal: 'урон по обычным', gold: 'золото', wild: 'урон Диких', undead: 'урон нежити', bones: 'шанс костей' };
    return Object.entries(fx).map(([k, v]) => k === 'bossTimer' ? 'таймер босса +' + v + ' с' : k === 'spawn' ? 'пауза между врагами −' + Math.round(v * 100) + '%' : T[k] + ' ×' + v).join(', ');
  }
  function title(s) {
    const c = CLASSES[s.account.mainClass]; if (!c) return 'без класса';
    const sc = s.account.mainSubclass && c.subs[s.account.mainSubclass];
    return c.name + (sc ? ' · ' + sc.name : '');
  }
  function validate(s, errs) {
    const a = s.account;
    if (a.mainClass && !CLASSES[a.mainClass]) errs.push('class');
    if (a.mainSubclass && (!CLASSES[a.mainClass] || !CLASSES[a.mainClass].subs[a.mainSubclass])) errs.push('subclass');
    for (const id of a.visible || []) if (!PZ.HERO_BY_ID[id]) errs.push('visible ' + id);
  }

  // Выбор видимых героев на сцене (до B.scene.allySlots). Порядок = места: Убийца, Маг, Танк, Поддержка.
  function toggleVisible(s, id) {
    const a = s.account; a.visible = (a.visible || []).filter(x => s.run.hired[x] || s.account.owned[x]);
    const i = a.visible.indexOf(id);
    if (i >= 0) { a.visible.splice(i, 1); return { ok: true, on: false }; }
    if (a.visible.length >= B.scene.allySlots) return { ok: false, err: 'На сцене максимум ' + B.scene.allySlots + ' героя — сначала уберите одного' };
    a.visible.push(id); return { ok: true, on: true };
  }

  PZ.classes = { CLASSES, mult, add, canChooseClass, canChooseSub, chooseClass, chooseSub, respec, describe, title, validate, toggleVisible };
})(globalThis.PZ = globalThis.PZ || {});
