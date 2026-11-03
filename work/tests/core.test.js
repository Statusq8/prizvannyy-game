const test = require('node:test');
const assert = require('node:assert');
const load = require('./load');
const parity = require('./fixtures/python_parity.json');

const close = (a, b, rel = 1e-9) => assert.ok(Math.abs(a - b) <= rel * Math.max(1, Math.abs(b)), `${a} != ${b}`);

test('M1 формулы этажей: HP/золото, стык на 400, боссы', () => {
  const { B } = load();
  close(B.baseHp(1), 320); close(B.baseGold(1), B.floors.goldBase);
  assert.ok(isFinite(B.baseGold(5000)) && isFinite(B.enemyHp(5000)));
  close(B.baseHp(401) / B.baseHp(400), 1.05);
  close(B.baseGold(401) / B.baseGold(400), 1.054);
  assert.strictEqual(B.bossKind(10), 'boss10'); assert.strictEqual(B.bossKind(25), 'boss25');
  assert.strictEqual(B.bossKind(50), 'boss50'); assert.strictEqual(B.bossKind(100), 'boss50');
  assert.strictEqual(B.bossKind(75), 'boss25'); assert.strictEqual(B.bossKind(7), null);
  close(B.enemyHp(10), B.baseHp(10) * 3);
  assert.strictEqual(B.enemiesOnFloor(10), 1); assert.strictEqual(B.enemiesOnFloor(11), 5);
  assert.strictEqual(B.zoneName(1), 'Древний лес'); assert.strictEqual(B.zoneName(51), 'Пепельная пустыня');
});

test('M1 мастерство (У): 200→×1, 225→×1.25, 250→×1.5625, 300→×2.44', () => {
  const { B } = load();
  close(B.mastery(200), 1); close(B.mastery(224), 1); close(B.mastery(225), 1.25);
  close(B.mastery(250), 1.5625); close(B.mastery(300), 2.44140625);
});

test('M1 паритет с game_core.py: личный DPS, цена уровня, DPS армии (на старом каталоге)', () => {
  const PZ = load.useLegacyHeroes(load());
  for (const c of parity.personal) close(PZ.heroes.personalDps(c.id, c.lv, 1), c.dps);
  for (const c of parity.levelCost) assert.strictEqual(PZ.B.heroLevelCost(PZ.HERO_BY_ID[c.id].hire, c.lv), c.cost);
  for (const c of parity.army) {
    const s = PZ.state.newGame(0);
    s.run.hired = Object.assign({}, c.hired);
    // главный герой с DPS=123 как в эталоне
    PZ.B.main.baseDps = 123; PZ.B.main.dpsGrowth = 1;
    close(PZ.heroes.armyDps(s, c.target), c.army);
  }
});

test('M1 звёзды: множитель по тестовой формуле', () => {
  const { B } = load();
  close(B.starMult(1), 1); close(B.starMult(5), Math.pow(1.18, 4) * 1.15);
  close(B.starMult(15), Math.pow(1.18, 14) * 1.15 * 1.25 * 1.5);
});

test('M1 новая игра валидна; SS/БОГ не в коллекции', () => {
  const PZ = load();
  const s = PZ.state.newGame(0);
  assert.deepStrictEqual(PZ.state.validate(s), []);
  const ss = PZ.HEROES.filter(h => h.rarity === 'SS' || h.rarity === 'БОГ');
  assert.strictEqual(ss.length, 8);   // новый ростер: SS 4 + БОГ 4
  for (const h of ss) { assert.ok(!s.account.owned[h.id]); assert.ok(!PZ.heroes.canObtain(s, h.id)); }
});

test('M1 найм и уровни: списание золота атомарно', () => {
  const PZ = load();
  const s = PZ.state.newGame(0);
  assert.strictEqual(PZ.heroes.hire(s, 'lumi').ok, false);   // нет золота
  assert.strictEqual(s.run.gold, 0);
  PZ.state.addGold(s, 1000, 'test');
  assert.ok(PZ.heroes.hire(s, 'lumi').ok);
  assert.strictEqual(s.run.gold, 975);
  assert.strictEqual(PZ.heroes.hire(s, 'lumi').ok, false);   // повторный найм
  const before = s.run.gold;
  const r = PZ.heroes.levelUp(s, 'lumi', 'max');
  assert.ok(r.ok && r.levels > 1);
  close(before - s.run.gold, r.cost);
  assert.ok(s.run.gold < PZ.heroes.levelCost(s, 'lumi', s.run.hired.lumi));
  assert.strictEqual(PZ.heroes.hire(s, 'astrael').ok, false);    // гейт
  assert.throws(() => PZ.state.addGold(s, NaN, 'x'));
  assert.throws(() => PZ.state.addGold(s, -5, 'x'));
});

test('M1/QA-05 все нанятые входят в DPS, видимых не больше мест на сцене', () => {
  const PZ = load();
  const s = PZ.state.newGame(0);
  const ids = ['lumi', 'kostik', 'shmyg', 'shorokh', 'morgul', 'zlatokryl', 'krag'];
  for (const id of ids) s.run.hired[id] = 10;
  const br = PZ.heroes.armyBreakdown(s, 'normal');
  assert.strictEqual(br.parts.length, 8);
  close(br.total, br.parts.reduce((a, p) => a + p.dps, 0));
  assert.strictEqual(PZ.heroes.visibleAllies(s).length, PZ.B.scene.allySlots);
  const six = PZ.heroes.armyDps(s, 'normal');
  delete s.run.hired.zlatokryl;
  assert.ok(PZ.heroes.armyDps(s, 'normal') < six);
});

test('M1 бой: убийства дают золото, этаж проходится, рекорд растёт', () => {
  const PZ = load();
  const s = PZ.state.newGame(0);
  PZ.combat.tick(s, 60);
  assert.ok(s.run.cleared >= 1, 'cleared=' + s.run.cleared);
  assert.ok(s.run.gold > 0);
  assert.strictEqual(s.account.record, s.run.cleared);
  assert.deepStrictEqual(PZ.state.validate(s), []);
});

test('M1 неудача на боссе: без потерь, откат на фарм последнего пройденного', () => {
  const PZ = load();
  const s = PZ.state.newGame(0);
  s.run.cleared = 9; s.account.record = 9; s.run.gold = 500;
  PZ.combat.goToRecord(s);
  assert.strictEqual(PZ.combat.currentFloor(s), 10);
  PZ.combat.tick(s, 31);              // голый Призванный не убьёт босса за 30 с
  assert.strictEqual(s.run.stats.bossFails, 1);
  assert.strictEqual(s.run.farmFloor, 9);
  assert.ok(s.run.gold >= 500);
  assert.strictEqual(s.account.record, 9);
});

test('QA-02/03/04 Башня: фарм 230 при рекорде 250, 252 закрыт, возврат к 251', () => {
  const PZ = load();
  const s = PZ.state.newGame(0);
  s.run.cleared = 250; s.account.record = 250;
  const g0 = s.run.gold;
  assert.strictEqual(PZ.combat.selectFloor(s, 252).ok, false);
  assert.strictEqual(s.run.gold, g0);
  assert.ok(PZ.combat.selectFloor(s, 230).ok);
  assert.strictEqual(PZ.combat.currentFloor(s), 230);
  s.run.hired = { vargos: 300 };   // сильная армия — фарм идёт быстро
  PZ.combat.tick(s, 120);
  assert.ok(s.run.gold > g0);
  assert.strictEqual(s.account.record, 250); assert.strictEqual(s.run.cleared, 250);
  assert.strictEqual(PZ.combat.currentFloor(s), 230);
  PZ.combat.goToRecord(s);
  assert.strictEqual(PZ.combat.currentFloor(s), 251);
  assert.strictEqual(PZ.combat.floorStatus(s, 230), 'cleared');
  assert.strictEqual(PZ.combat.floorStatus(s, 251), 'next');
  assert.strictEqual(PZ.combat.floorStatus(s, 252), 'locked');
});

test('QA-01 сохранение → загрузка даёт тот же стейт; битый основной → резерв', () => {
  const PZ = load(); const st = load.memStorage();
  const s = PZ.state.newGame(1000);
  PZ.state.addGold(s, 777, 't'); s.run.cleared = 12; s.account.record = 12; s.run.hired.lumi = 5;
  PZ.save.save(st, s);
  const r = PZ.save.load(st);
  assert.strictEqual(r.from, 'main');
  assert.deepStrictEqual(JSON.parse(JSON.stringify(r.state)), JSON.parse(JSON.stringify(s)));
  PZ.state.addGold(s, 1, 't'); PZ.save.save(st, s);    // теперь в резерве первая версия
  st.setItem(PZ.save.KEY, st.getItem(PZ.save.KEY).slice(0, 50));  // обрезанная запись
  const r2 = PZ.save.load(st);
  assert.strictEqual(r2.from, 'backup'); assert.strictEqual(r2.state.run.gold, 777);
  assert.ok(r2.problems.length === 1);
});

test('QA-13 импорт старого сейва прототипа: миграция и копия до миграции', () => {
  const PZ = load(); const st = load.memStorage();
  const old = JSON.stringify({ version: 4, gold: 5000, record_floor: 42 });
  st.setItem(PZ.save.KEY, old);
  const r = PZ.save.load(st);
  assert.ok(r.migrated); assert.strictEqual(r.state.account.record, 42); assert.strictEqual(r.state.run.gold, 5000);
  assert.strictEqual(st.getItem(PZ.save.PREMIG), old);
  assert.deepStrictEqual(PZ.state.validate(r.state), []);
});

test('Импорт: мусор отклоняется, текущий сейв не тронут; из будущей версии — отказ', () => {
  const PZ = load(); const st = load.memStorage();
  const s = PZ.state.newGame(0); PZ.save.save(st, s); const before = st.getItem(PZ.save.KEY);
  assert.throws(() => PZ.save.importText(st, 'not json'));
  assert.throws(() => PZ.save.importText(st, JSON.stringify({ meta: { saveVersion: 99 } })));
  const bad = PZ.state.newGame(0); bad.run.gold = -1;
  assert.throws(() => PZ.save.importText(st, PZ.save.exportText(bad)));
  assert.strictEqual(st.getItem(PZ.save.KEY), before);
  const good = PZ.state.newGame(0); good.run.gold = 99;
  PZ.save.importText(st, PZ.save.exportText(good));
  assert.strictEqual(PZ.save.load(st).state.run.gold, 99);
});

test('QA-15 офлайн: лимит 8 ч, 50%, рекорд не растёт, <60 с не начисляется', () => {
  const PZ = load();
  const s = PZ.state.newGame(0);
  s.run.cleared = 20; s.account.record = 20; s.run.hired.zlatokryl = 50;
  const r1 = PZ.offline.apply(s, 30 * 1000);
  assert.strictEqual(r1.gold, 0);
  const e8 = PZ.offline.estimate(s, 8 * 3600), e20 = PZ.offline.estimate(s, 20 * 3600);
  assert.strictEqual(e8.gold, e20.gold);
  const g0 = s.run.gold;
  PZ.offline.apply(s, 30 * 1000 + 3600 * 1000);
  assert.ok(s.run.gold > g0); assert.strictEqual(s.account.record, 20);
});

test('M1 критерий: 1 час игры ботом без ошибок, стейт валиден, прогресс есть', () => {
  const PZ = load();
  const s = PZ.state.newGame(0);
  const ids = PZ.HEROES.filter(h => s.account.owned[h.id]).map(h => h.id);
  for (let t = 0; t < 3600; t++) {
    PZ.combat.tick(s, 1);
    if (t % 5 === 0) {           // простая стратегия: нанять следующего, качать дешевле всего
      for (const id of ids) if (!s.run.hired[id] && s.run.gold >= PZ.heroes.hireCost(s, id)) PZ.heroes.hire(s, id);
      PZ.heroes.mainLevelUp(s, 'max');
      let best = null, bc = Infinity;
      for (const id of Object.keys(s.run.hired)) { const c = PZ.heroes.levelCost(s, id, s.run.hired[id]); if (c < bc) { bc = c; best = id; } }
      if (best) PZ.heroes.levelUp(s, best, 'max');
      if (!s.run.autoAdvance && t % 60 === 0) PZ.combat.goToRecord(s);
    }
  }
  assert.deepStrictEqual(PZ.state.validate(s), []);
  assert.ok(s.account.record >= 30, 'рекорд за час: ' + s.account.record);
  console.log('    1 час бота: рекорд', s.account.record, 'нанято', Object.keys(s.run.hired).length, 'ур. главного', s.run.mainLevel);
});

test('Сброс: загружается новая игра, старая остаётся в резерве', () => {
  const PZ = load(); const st = load.memStorage();
  const s = PZ.state.newGame(0); s.run.cleared = 50; s.account.record = 50; PZ.save.save(st, s);
  PZ.save.wipe(st);
  const r = PZ.save.load(st);
  assert.strictEqual(r.from, 'main'); assert.strictEqual(r.state.account.record, 0);
  assert.strictEqual(PZ.save.deserialize(st.getItem(PZ.save.BACKUP)).state.account.record, 50);
});

test('Зоны: 12 зон, по 3 моба и босс; фон меняется каждые 50 этажей', () => {
  const PZ = load();
  assert.strictEqual(PZ.ZONES.length, 12);
  for (const z of PZ.ZONES) { assert.strictEqual(z.mobs.length, 3); assert.ok(z.boss); }
  assert.strictEqual(PZ.enemyOf(1, 0, null).zone, 1); assert.strictEqual(PZ.enemyOf(51, 0, null).zone, 2);
  assert.strictEqual(PZ.enemyOf(600, 0, 'boss50').zone, 12); assert.strictEqual(PZ.enemyOf(601, 0, null).zone, 1);
  assert.strictEqual(PZ.enemyOf(50, 0, 'boss50').mob, 4); assert.strictEqual(PZ.enemyOf(400, 0, 'boss50').name, 'Хранитель Цикла');
  assert.ok(PZ.enemyOf(10, 0, 'boss10').boss);
});

// ===== M5 Кости =====
const pyBones = require('./fixtures/python_bones.json');
function giveBones(PZ, s, q, n) { for (const sl of PZ.bones.SLOTS) s.account.bones[sl + '_' + q] = (s.account.bones[sl + '_' + q] || 0) + (n || 1); }

test('M5 паритет выпадения с monster_drops.py: тип монстра, слот, редкость по этажу', () => {
  const PZ = load();
  for (const c of pyBones) {
    assert.strictEqual(PZ.bones.kindOf(c.f), c.kind, 'kind ' + c.f);
    assert.strictEqual(PZ.bones.slotOf(c.f), c.slot, 'slot ' + c.f);
    assert.strictEqual(PZ.bones.maxQuality(c.f), c.q, 'q ' + c.f);
  }
});

test('M5 выпадение: босс зоны всегда, гарантия на обычных за 20 побед, редкость −1 у обычных', () => {
  const PZ = load(); const s = PZ.state.newGame(0);
  const d = PZ.bones.rollFloor(s, 50); assert.ok(d && d.kind === 'zone_boss' && d.quality === 1);
  let got = 0; for (let i = 0; i < 20; i++) if (PZ.bones.rollFloor(s, 3)) got++;
  assert.ok(got >= 1);
  s.account.bonePity = {}; let q2 = null; for (let i = 0; i < 40 && !q2; i++) q2 = PZ.bones.rollFloor(s, 161);
  assert.strictEqual(q2.quality, 2);                 // этаж 161: макс 3, обычный −1
  assert.deepStrictEqual(PZ.state.validate(s), []);
});

test('M5 бой выдаёт кости за пройденные этажи', () => {
  const PZ = load(); const s = PZ.state.newGame(0);
  s.run.hired = { vargos: 200 };
  const ev = PZ.combat.events; ev.length = 0;
  PZ.combat.tick(s, 600);
  const total = Object.values(s.account.bones).reduce((a, b) => a + b, 0);
  assert.ok(total > 0, 'костей ' + total);
  assert.ok(ev.some(e => e.t === 'bone') || total > 0);
});

test('QA-07 6 костей нужной редкости: ранг повышен, кости потрачены, слоты очищены', () => {
  const PZ = load(); const s = PZ.state.newGame(0); const id = 'lumi';
  giveBones(PZ, s, 2, 1);                                 // не та редкость
  assert.strictEqual(PZ.bones.absorb(s, id, 'head').ok, false);
  giveBones(PZ, s, 1, 1);
  assert.strictEqual(PZ.bones.promote(s, id).ok, false);  // пусто
  for (const sl of PZ.bones.SLOTS.slice(0, 5)) assert.ok(PZ.bones.absorb(s, id, sl).ok);
  assert.strictEqual(PZ.bones.absorb(s, id, 'head').ok, false);  // слот занят
  assert.strictEqual(PZ.bones.promote(s, id).ok, false);  // 5/6
  assert.strictEqual(PZ.bones.rankOf(s, id), 'E');
  const dps0 = PZ.heroes.armyDps(Object.assign(s, { run: Object.assign(s.run, { hired: { [id]: 10 } }) }), 'normal');
  assert.ok(PZ.bones.absorb(s, id, 'right_leg').ok);
  assert.ok(PZ.bones.promote(s, id).ok);
  assert.strictEqual(PZ.bones.rankOf(s, id), 'D');
  assert.strictEqual(PZ.bones.filled(s, id), 0);
  assert.strictEqual(PZ.bones.requiredQuality('D'), 2);
  for (const sl of PZ.bones.SLOTS) assert.strictEqual(PZ.bones.count(s, sl, 1), 0);
  assert.ok(PZ.heroes.armyDps(s, 'normal') > dps0);
  assert.deepStrictEqual(PZ.state.validate(s), []);
});

test('QA-08/09 SS до рекорда 1000 и БОГ до 4000 — блокировка', () => {
  const PZ = load(); const s = PZ.state.newGame(0); const id = 'valtar';
  s.account.owned[id] = true;
  giveBones(PZ, s, 6, 1);
  assert.strictEqual(PZ.bones.absorbAll(s, id), 6);
  s.account.record = 999;
  const r = PZ.bones.promote(s, id); assert.strictEqual(r.ok, false); assert.match(r.err, /1000/);
  assert.strictEqual(PZ.bones.rankOf(s, id), 'S');
  s.account.record = 1000; assert.ok(PZ.bones.promote(s, id).ok); assert.strictEqual(PZ.bones.rankOf(s, id), 'SS');
  giveBones(PZ, s, 7, 1); PZ.bones.absorbAll(s, id);
  s.account.record = 3999; assert.strictEqual(PZ.bones.promote(s, id).ok, false);
  s.account.record = 4000; assert.ok(PZ.bones.promote(s, id).ok); assert.strictEqual(PZ.bones.rankOf(s, id), 'БОГ');
  assert.strictEqual(PZ.bones.promote(s, id).ok, false);   // максимум
  // подделанное сохранение с рангом SS без рекорда не проходит проверку
  const bad = PZ.state.newGame(0); bad.account.boneSets.valtar = { rank: 'SS', slots: { head: 0, back: 0, left_arm: 0, right_arm: 0, left_leg: 0, right_leg: 0 } };
  assert.ok(PZ.state.validate(bad).some(e => e.startsWith('rank gate')));
});

test('M5 ранг и кости хранятся в аккаунте и переживают сохранение', () => {
  const PZ = load(); const st = load.memStorage(); const s = PZ.state.newGame(0);
  giveBones(PZ, s, 1, 2); PZ.bones.absorbAll(s, 'lumi'); PZ.bones.promote(s, 'lumi');
  PZ.save.save(st, s);
  const r = PZ.save.load(st).state;
  assert.strictEqual(PZ.bones.rankOf(r, 'lumi'), 'D');
  assert.strictEqual(PZ.bones.count(r, 'head', 1), 1);
});

// ===== M6 Портал и звёзды =====
const pyPortal = require('./fixtures/python_portal.json');

test('M6 стартовая коллекция: 8 героев E и D, 10 свитков', () => {
  const PZ = load(); const s = PZ.state.newGame(0);
  const owned = Object.keys(s.account.owned).map(id => PZ.HERO_BY_ID[id].rarity);
  assert.strictEqual(owned.length, 8); assert.ok(owned.every(r => r === 'E' || r === 'D'));
  assert.strictEqual(s.account.scrolls, 10);
  assert.strictEqual(PZ.heroes.hire(s, 'auron').ok, false);
});

test('M6 шансы 1:1 с portal_v01.py; SS/БОГ исключены до рекорда', () => {
  const PZ = load();
  for (const [rec, key] of [[400, 'r400'], [1000, 'r1000'], [4000, 'r4000']]) {
    const r = PZ.portal.availableRates(rec);
    assert.deepStrictEqual(Object.keys(r), Object.keys(pyPortal[key]));
    for (const k in r) close(r[k], pyPortal[key][k]);
  }
  assert.ok(!('SS' in PZ.portal.availableRates(999)));
});

test('QA-06 дубликат → фрагменты, без второй копии; свитки списываются атомарно', () => {
  const PZ = load(); const s = PZ.state.newGame(0);
  s.account.scrolls = 5;
  assert.strictEqual(PZ.portal.summon(s, 10).ok, false); assert.strictEqual(s.account.scrolls, 5);
  s.account.scrolls = 400;
  const all = [];
  for (let i = 0; i < 40; i++) all.push(...PZ.portal.summon(s, 10).results);
  const dups = all.filter(r => r.duplicate);
  assert.ok(dups.length > 0);
  const fr = Object.values(s.account.fragments).reduce((a, b) => a + b, 0);
  assert.strictEqual(fr, dups.reduce((a, r) => a + r.fragments, 0));
  assert.ok(all.every(r => r.rarity !== 'SS' && r.rarity !== 'БОГ'));
  assert.strictEqual(s.account.scrolls, 0);
  assert.deepStrictEqual(PZ.state.validate(s), []);
});

test('M6 гарантия: A+ не позже 100-го, S+ не позже 500-го призыва', () => {
  const PZ = load(); const s = PZ.state.newGame(0);
  s.account.pity.sinceA = 99; s.account.scrolls = 1;
  const r = PZ.portal.summon(s, 1).results[0];
  assert.ok(['A', 'S'].includes(r.rarity));
  s.account.pity.sinceS = 499; s.account.scrolls = 1;
  assert.strictEqual(PZ.portal.summon(s, 1).results[0].rarity, 'S');
});

test('M6 звёзды: полная цена 1→15 как в stars.py; повышение атомарно; множитель в DPS', () => {
  const PZ = load(); const s = PZ.state.newGame(0); const id = 'lumi';
  const sum = { fragments: 0, essence: 0, core: 0, seal: 0 };
  for (let c = 1; c < 15; c++) { const k = PZ.portal.starCost(c); for (const x in sum) sum[x] += k[x]; }
  assert.deepStrictEqual(sum, pyPortal.cum);
  s.account.fragments[id] = 19;
  const before = JSON.stringify(s.account);
  assert.strictEqual(PZ.portal.ascend(s, id).ok, false); assert.strictEqual(JSON.stringify(s.account), before);
  s.run.hired[id] = 10; const d1 = PZ.heroes.armyDps(s, 'normal');
  s.account.fragments[id] = 20; assert.ok(PZ.portal.ascend(s, id).ok);
  assert.strictEqual(PZ.portal.starsOf(s, id), 2); assert.strictEqual(s.account.fragments[id], 0);
  assert.ok(PZ.heroes.armyDps(s, 'normal') > d1);
  // 4★→5★ требует эссенции
  s.account.stars[id] = 4; s.account.fragments[id] = 999;
  assert.strictEqual(PZ.portal.ascend(s, id).ok, false);
  s.account.materials.essence = 5; assert.ok(PZ.portal.ascend(s, id).ok);
  s.account.stars[id] = 15; assert.strictEqual(PZ.portal.ascend(s, id).ok, false);
});

test('M6 награды за первое прохождение боссов в забеге: свитки и материалы', () => {
  const PZ = load(); const s = PZ.state.newGame(0);
  const sc = s.account.scrolls;
  PZ.portal.onFirstClear(s, 10); PZ.portal.onFirstClear(s, 50); PZ.portal.onFirstClear(s, 200);
  assert.strictEqual(s.account.scrolls, sc + 2 + 8 + 8);
  assert.strictEqual(s.account.materials.core, 2); assert.strictEqual(s.account.materials.seal, 1);
  s.run.hired = { nokt: 300 }; s.account.owned.nokt = true;
  PZ.combat.tick(s, 300);
  assert.ok(s.run.cleared >= 10 && s.account.scrolls > sc + 18);
});

// Старое сохранение строим вручную со СТАРЫМИ id героев (как оно лежит у игрока в телефоне).
function oldSave(PZ, ver) {
  const g = PZ.state.newGame(0);
  g.meta.saveVersion = ver; g.account.owned = {}; g.account.stars = {}; g.account.fragments = {}; g.account.boneSets = {}; g.account.visible = [];
  return g;
}

test('Миграция v1 → v3: временная коллекция убрана, нанятые сохранены и перенесены на новых героев', () => {
  const PZ = load(); const st = load.memStorage();
  const old = oldSave(PZ, 1);
  old.account.ownAllTemp = true;
  for (const r of ['E', 'D', 'C', 'B', 'A', 'S']) for (const id of ['e_ash_recruit', 'd_lane', 'c_shadow_raven', 'a_ariel', 's_sion']) old.account.owned[id] = true;
  old.run.hired = { c_shadow_raven: 12, e_ash_recruit: 3 };
  delete old.account.scrolls;
  st.setItem(PZ.save.KEY, JSON.stringify(old));
  const r = PZ.save.load(st);
  assert.ok(r.migrated); assert.strictEqual(r.state.meta.saveVersion, 3);
  assert.ok(r.state.account.owned.auron, 'нанятый C-герой перенесён');
  assert.strictEqual(r.state.run.hired.auron, 12); assert.strictEqual(r.state.run.hired.lumi, 3);
  assert.ok(!r.state.account.owned.eliriya, 'не нанятый A-герой из временной коллекции убран');
  assert.ok(r.state.account.owned.zlatokryl); assert.strictEqual(r.state.account.scrolls, 10);
  assert.ok(st.getItem(PZ.save.PREMIG));
  assert.deepStrictEqual(PZ.state.validate(r.state), []);
});

test('Миграция v2 → v3: звёзды, фрагменты, ранги, уровни переходят к новым героям; двое старых → лучшее', () => {
  const PZ = load(); const st = load.memStorage();
  const old = oldSave(PZ, 2);
  old.account.record = 500; old.run.cleared = 500;
  Object.assign(old.account.owned, { e_forest_hunter: true, e_swamp_thief: true, a_chain_lord: true, d_lane: true });
  Object.assign(old.account.stars, { e_forest_hunter: 3, e_swamp_thief: 7, a_chain_lord: 4 });
  Object.assign(old.account.fragments, { e_forest_hunter: 10, e_swamp_thief: 5 });
  const slots = { head: 0, back: 0, left_arm: 0, right_arm: 0, left_leg: 0, right_leg: 0 };
  old.account.boneSets = { e_forest_hunter: { rank: 'D', slots }, e_swamp_thief: { rank: 'C', slots } };
  old.run.hired = { e_forest_hunter: 40, e_swamp_thief: 25, a_chain_lord: 120 };
  old.account.visible = ['e_forest_hunter', 'e_swamp_thief', 'a_chain_lord'];
  st.setItem(PZ.save.KEY, JSON.stringify(old));
  const r = PZ.save.load(st), a = r.state.account;
  // e_forest_hunter и e_swamp_thief → оба в Шмыга (3-й по цене E)
  assert.strictEqual(PZ.save.newIdFor('e_forest_hunter'), 'shmyg'); assert.strictEqual(PZ.save.newIdFor('e_swamp_thief'), 'shmyg');
  assert.strictEqual(a.stars.shmyg, 7); assert.strictEqual(a.fragments.shmyg, 15); assert.strictEqual(a.boneSets.shmyg.rank, 'C');
  assert.strictEqual(r.state.run.hired.shmyg, 40);
  const aNew = PZ.save.newIdFor('a_chain_lord');
  assert.strictEqual(PZ.HERO_BY_ID[aNew].rarity, 'A'); assert.strictEqual(a.stars[aNew], 4); assert.strictEqual(r.state.run.hired[aNew], 120);
  assert.deepStrictEqual(a.visible, ['shmyg', aNew]);
  for (const h of PZ.HEROES) if (h.rarity === 'E' || h.rarity === 'D') assert.ok(a.owned[h.id], 'стартовый ' + h.id);
  assert.deepStrictEqual(PZ.state.validate(r.state), []);
});

// ===== M7 Перерождение и реликвии =====
const pyShards = require('./fixtures/python_shards.json');

test('M7 осколки 1:1 с tower_balance_v58.reward()', () => {
  const { B } = load();
  for (const c of pyShards) assert.strictEqual(B.rebirthShards(c.old, c.reached), c.shards, JSON.stringify(c));
});

test('QA-11 перерождение до 400 недоступно, ничего не меняется', () => {
  const PZ = load(); const s = PZ.state.newGame(0);
  s.run.cleared = 399; s.account.record = 399; s.run.gold = 1e9;
  const before = JSON.stringify(s);
  const r = PZ.meta.rebirth(s); assert.strictEqual(r.ok, false);
  assert.strictEqual(JSON.stringify(s), before);
});

test('QA-12 после 400: временное сброшено, постоянное сохранено', () => {
  const PZ = load(); const s = PZ.state.newGame(0);
  s.run.cleared = 420; s.account.record = 420; s.run.gold = 1e12; s.run.mainLevel = 300; s.run.hired = { lumi: 250, zlatokryl: 100 };
  s.run.farmFloor = 300; s.account.owned.auron = true; s.account.stars.lumi = 5; s.account.fragments.lumi = 7;
  s.account.boneSets.lumi = { rank: 'C', slots: { head: 3, back: 0, left_arm: 0, right_arm: 0, left_leg: 0, right_leg: 0 } };
  s.account.bones.head_2 = 4; s.account.scrolls = 33; s.account.relics.heart = 2; s.account.materials.core = 3;
  const r = PZ.meta.rebirth(s);
  assert.ok(r.ok); assert.strictEqual(r.shards, PZ.B.rebirthShards(0, 420));
  // сброшено
  assert.strictEqual(s.run.gold, 0); assert.strictEqual(s.run.mainLevel, 1); assert.deepStrictEqual(s.run.hired, {});
  assert.strictEqual(s.run.cleared, 0); assert.strictEqual(s.run.farmFloor, null);
  // сохранено
  assert.strictEqual(s.account.record, 420); assert.ok(s.account.owned.auron);
  assert.strictEqual(s.account.stars.lumi, 5); assert.strictEqual(s.account.fragments.lumi, 7);
  assert.strictEqual(s.account.boneSets.lumi.rank, 'C'); assert.strictEqual(s.account.bones.head_2, 4);
  assert.strictEqual(s.account.scrolls, 33); assert.strictEqual(s.account.relics.heart, 2); assert.strictEqual(s.account.materials.core, 3);
  assert.strictEqual(s.account.shards, r.shards); assert.strictEqual(s.account.rebirths, 1); assert.strictEqual(s.run.startRecord, 420);
  assert.deepStrictEqual(PZ.state.validate(s), []);
  // второй цикл до того же этажа: только 35 (рекорды уже взяты)
  s.run.cleared = 420; assert.strictEqual(PZ.meta.shardsPreview(s), 35);
});

test('M7 реликвии: цена Base×2^(n−1), до 10 ур., эффекты в DPS/золоте, скидки с потолком 40%', () => {
  const PZ = load(); const s = PZ.state.newGame(0);
  assert.strictEqual(PZ.relics.buyRelic(s, 'heart').ok, false);
  s.account.shards = 15 + 30 + 60;
  assert.ok(PZ.relics.buyRelic(s, 'heart').ok); assert.ok(PZ.relics.buyRelic(s, 'heart').ok); assert.ok(PZ.relics.buyRelic(s, 'heart').ok);
  assert.strictEqual(s.account.shards, 0); assert.strictEqual(PZ.relics.lvl(s, 'heart'), 3);
  s.run.hired = { lumi: 10 };
  const d = PZ.heroes.armyDps(s, 'normal'); s.account.relics.heart = 0; close(d / PZ.heroes.armyDps(s, 'normal'), Math.pow(1.25, 3));
  s.account.relics.knowledge = 10; close(PZ.relics.discount(s, 'level'), 0.4);
  const full = PZ.B.heroLevelCost(25, 10); assert.strictEqual(PZ.heroes.levelCost(s, 'lumi', 10), Math.ceil(full * 0.6));
  s.account.relics.gold = 1; close(PZ.heroes.goldMult(s, false), 1.35);
  s.account.relics.heart = 10; s.account.shards = 1e9; assert.strictEqual(PZ.relics.buyRelic(s, 'heart').ok, false);
  assert.deepStrictEqual(PZ.state.validate(s), []);
});

test('M7 магазин свитков за золото: цена растёт, списание атомарно', () => {
  const PZ = load(); const s = PZ.state.newGame(0);
  const p1 = PZ.meta.scrollPrice(s, 1);
  assert.strictEqual(PZ.meta.buyScrolls(s, 1).ok, false); assert.strictEqual(s.account.scrolls, 10);
  s.run.gold = 1e6;
  assert.ok(PZ.meta.buyScrolls(s, 1).ok); assert.strictEqual(s.account.scrolls, 11);
  assert.ok(PZ.meta.scrollPrice(s, 1) > p1);
  const g = s.run.gold, p10 = PZ.meta.scrollPrice(s, 10);
  assert.ok(PZ.meta.buyScrolls(s, 10).ok); close(g - s.run.gold, p10); assert.strictEqual(s.account.scrolls, 21);
  PZ.meta.rebirth(Object.assign(s, { run: Object.assign(s.run, { cleared: 400 }) }));
  assert.strictEqual(s.account.scrolls, 21); assert.strictEqual(PZ.meta.scrollPrice(s, 1), p1);
});

// ===== M4 Классы Призванного и видимые герои =====
test('M4 класс с ур. 100, подкласс с 250; один раз; переобучение за свитки', () => {
  const PZ = load(); const s = PZ.state.newGame(0);
  assert.strictEqual(PZ.classes.chooseClass(s, 'warrior').ok, false);
  s.run.mainLevel = 100;
  assert.strictEqual(PZ.classes.chooseSub(s, 'berserk').ok, false);
  assert.ok(PZ.classes.chooseClass(s, 'warrior').ok);
  assert.strictEqual(PZ.classes.chooseClass(s, 'mage').ok, false);
  assert.strictEqual(PZ.classes.chooseSub(s, 'berserk').ok, false);       // уровень < 250
  s.run.mainLevel = 250;
  assert.strictEqual(PZ.classes.chooseSub(s, 'archmage').ok, false);      // чужой подкласс
  assert.ok(PZ.classes.chooseSub(s, 'berserk').ok);
  assert.strictEqual(PZ.classes.title(s), 'Воин · Берсерк');
  s.account.scrolls = 5; assert.strictEqual(PZ.classes.respec(s).ok, false);
  s.account.scrolls = 12; assert.ok(PZ.classes.respec(s).ok); assert.strictEqual(s.account.scrolls, 2);
  assert.strictEqual(s.account.mainClass, null); assert.ok(PZ.classes.chooseClass(s, 'mage').ok);
  assert.deepStrictEqual(PZ.state.validate(s), []);
});

test('M4 эффекты классов в уроне, золоте, тапе и таймере босса; класс переживает перерождение', () => {
  const PZ = load(); const s = PZ.state.newGame(0); s.run.mainLevel = 300; s.run.hired = { shmyg: 50 };
  const m0 = PZ.heroes.mainDps(s), g0 = PZ.heroes.goldMult(s, false);
  s.account.mainClass = 'warrior'; close(PZ.heroes.mainDps(s) / m0, 2);
  s.account.mainSubclass = 'berserk'; close(PZ.heroes.mainDps(s) / m0, 4);
  s.account.mainClass = 'necro'; s.account.mainSubclass = 'lich'; close(PZ.heroes.goldMult(s, false) / g0, 1.4 * 1.5);
  s.account.mainClass = 'archer'; s.account.mainSubclass = 'beastmaster';
  const p = PZ.heroes.armyBreakdown(s, 'normal').parts.find(x => x.id === 'shmyg').dps;
  s.account.mainClass = null; s.account.mainSubclass = null;
  close(p / PZ.heroes.armyBreakdown(s, 'normal').parts.find(x => x.id === 'shmyg').dps, 1.5 * 2);
  s.account.mainClass = 'warrior'; s.account.mainSubclass = 'abyss_knight';
  s.run.cleared = 9; s.account.record = 9; PZ.combat.goToRecord(s);
  assert.strictEqual(PZ.combat.ensureBattle(s).timer, PZ.B.floors.bossTimer + 10);
  s.run.cleared = 400; s.account.record = 400; PZ.meta.rebirth(s);
  assert.strictEqual(s.account.mainClass, 'warrior'); assert.strictEqual(s.account.mainSubclass, 'abyss_knight');
});

test('M4 видимые герои: выбор до 4, остальные всё равно в DPS', () => {
  const PZ = load(); const s = PZ.state.newGame(0);
  const ids = ['lumi', 'kostik', 'shmyg', 'shorokh', 'morgul', 'zlatokryl'];
  for (const id of ids) s.run.hired[id] = 5;
  for (const id of ids.slice(0, 4)) assert.ok(PZ.classes.toggleVisible(s, id).ok);
  assert.strictEqual(PZ.classes.toggleVisible(s, 'zlatokryl').ok, false);
  assert.deepStrictEqual(PZ.heroes.visibleAllies(s), ids.slice(0, 4));
  assert.strictEqual(PZ.heroes.armyBreakdown(s, 'normal').parts.length, 7);
  assert.ok(PZ.classes.toggleVisible(s, 'lumi').ok && PZ.classes.toggleVisible(s, 'zlatokryl').ok);
  assert.deepStrictEqual(PZ.heroes.visibleAllies(s), ['kostik', 'shmyg', 'shorokh', 'zlatokryl']);
});

// ===== Энергия и авто-ульта (концепт 03.11.2026) =====
test('Ульта: 10 атак → ульта ×8; средний урон героя не меняется', () => {
  const PZ = load(); const s = PZ.state.newGame(0);
  s.run.mainLevel = 1; PZ.B.main.baseDps = 0;             // только герой
  s.run.hired = { kaeron: 50 }; s.account.owned.kaeron = true;
  const D = PZ.heroes.armyDps(s, 'normal');
  const fl = PZ.combat.heroFlows(s, 'normal');
  close(fl.rate + fl.ults[0].burst / 10, D);               // обычные удары + ульта раз в 10 с = средний урон
  close(fl.ults[0].burst / (fl.rate * 1), 8);              // ульта = ×8 обычного удара
  // бой: огромный HP, 25 секунд → 2 ульты
  PZ.combat.ensureBattle(s); s.run.battle.hp = s.run.battle.maxHp = 1e12;
  const ev = PZ.combat.events; ev.length = 0;
  PZ.combat.tick(s, 25);
  const ults = ev.filter(e => e.t === 'ult');
  assert.strictEqual(ults.length, 2); assert.strictEqual(ults[0].id, 'kaeron');
  close(1e12 - s.run.battle.hp, fl.rate * 25 + 2 * fl.ults[0].burst, 1e-6);
  close(s.run.energy.kaeron, 50, 1e-6);
});

test('Ульта: энергия не копится в паузе между врагами и сохраняется между врагами', () => {
  const PZ = load(); const s = PZ.state.newGame(0);
  s.run.hired = { lumi: 10 };
  PZ.combat.ensureBattle(s); s.run.battle.spawnWait = 5;
  PZ.combat.tick(s, 4);
  assert.strictEqual(s.run.energy.lumi || 0, 0);
  s.run.battle.hp = s.run.battle.maxHp = 1e30; s.run.battle.spawnWait = 0;
  PZ.combat.tick(s, 3); close(s.run.energy.lumi, 30, 1e-6);
});
