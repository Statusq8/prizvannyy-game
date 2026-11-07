// 0.132: титулы биомов, спец-моб (решения пользователя 07.11)
const test = require('node:test'), assert = require('node:assert');
const C = require('../src/core.js'), CFG = C.CONFIG;
CFG.maxTapsPerSec = Infinity; CFG.unlocks = {}; CFG.disabled = []; CFG.cage = null;
const NOCRIT = { rng: () => 1 };
const big = s => { s.enemy.hp = s.enemy.maxHp = 1e30; };

// ===== 0.156: криты, автоатака Клинка, «Поток силы» (задание v0.156) =====
const hits = (ev, src) => ev.filter(e => e.type === 'hit' && e.source === src).length;
const fresh = s => { delete s._pv; return s; };              // сброс кэша пассивок после правок состояния
const CRIT_KINDS = ['critChance', 'critMult'];

test('0.156 крит: шанс не выше 50% при сильных артефактах и временных эффектах', () => {
  assert.strictEqual(CFG.crit.baseChance, 0.05); assert.strictEqual(CFG.crit.maxChance, 0.5);
  const s = C.newState(NOCRIT); s.artifacts.eye = 70;
  const hunt = CFG.abilities.find(a => a.id === 'hunt'); s.maxFloor = hunt.unlockFloor; big(s);
  C.useAbility(s, 'hunt'); s.critBuff = { t: 5, ch: 1, dmg: 1 };
  assert.strictEqual(C.critChance(s), 0.5);
});

test('0.156 крит: пассивки героев и достижения не дают критов', () => {
  for (const [id, d] of Object.entries(CFG.passives.heroes)) assert.ok(!CRIT_KINDS.includes(d[0]), 'пассивка ' + id);
  assert.strictEqual(Object.keys(CFG.passives.heroes).length, 52);
  for (const a of CFG.achievements.list) {
    if (a.bonus) assert.ok(!CRIT_KINDS.includes(a.bonus.kind), 'достижение ' + a.id);
    if (a.title && a.title.bonus) assert.ok(!CRIT_KINDS.includes(a.title.bonus.kind), 'титул ' + a.id);
  }
  assert.deepStrictEqual(CFG.achievements.list.find(a => a.id === 'a_crit').bonus, { kind: 'bossDmg', per: 0.02 });
  assert.deepStrictEqual(CFG.achievements.list.find(a => a.id === 'a_tps').bonus, { kind: 'tapDmg', per: 0.02 });
  const s = C.newState(NOCRIT); s.bestFloor = s.maxFloor = 5000;          // все герои открыты, звёзды, достижения на максимуме
  for (const id in s.heroes) { s.heroes[id].unlocked = true; s.heroes[id].stars = 15; }
  for (const a of CFG.achievements.list) s.ach[a.id] = 99;
  fresh(s);
  assert.strictEqual(C.critChance(s), CFG.crit.baseChance); assert.strictEqual(C.critMult(s), CFG.crit.baseMult);
  // в других системах (дерево, классы, руны) постоянных крит-бонусов нет
  const all = JSON.stringify([CFG.tree || null, CFG.classes, CFG.runes || null]);
  assert.ok(!/"kind":"crit(Chance|Mult)"/.test(all), 'дерево/классы/руны');
});

test('0.156 крит: артефакты по-прежнему растят шанс и множитель', () => {
  const s = C.newState(NOCRIT);
  s.artifacts.eye = 10; assert.ok(Math.abs(C.critChance(s) - (CFG.crit.baseChance + C.artPower(s, 'critChance'))) < 1e-9);
  assert.ok(C.critChance(s) > CFG.crit.baseChance);
  s.artifacts.fang = 5; assert.ok(C.critMult(s) > CFG.crit.baseMult);
  assert.ok(Math.abs(C.critMult(s) - (CFG.crit.baseMult + C.artPower(s, 'critMult'))) < 1e-9);
});

test('0.156 Клинок: без него автоатаки нет', () => {
  const s = C.newState(NOCRIT); big(s);
  assert.strictEqual(C.heroAutoTps(s), 0);
  assert.strictEqual(hits(C.tick(s, 5), 'heroAuto'), 0);
});

test('0.156 Клинок: на уровнях 1, 5, 10, 25 — ровно 1 удар в секунду', () => {
  assert.strictEqual(CFG.heroAutoInterval, 1);
  for (const lv of [1, 5, 10, 25]) {
    const s = C.newState(NOCRIT); s.artifacts.blade = lv; big(s);
    assert.strictEqual(C.heroAutoTps(s), 1, 'частота, уровень ' + lv);
    let n = 0; for (let i = 0; i < 100; i++) n += hits(C.tick(s, 0.1), 'heroAuto');
    n += hits(C.tick(s, 1e-6), 'heroAuto');                       // погрешность суммы 100 × 0.1
    assert.strictEqual(n, 10, 'ударов за 10 с, уровень ' + lv);
  }
});

test('0.156 Клинок: уровень растит урон (+10% за уровень, один раз)', () => {
  const dmg = lv => { const s = C.newState(NOCRIT); s.artifacts.blade = lv; big(s);
    const e = C.tick(s, 1.0001).find(x => x.type === 'hit' && x.source === 'heroAuto'); return +e.dmg; };
  const d1 = dmg(1), d10 = dmg(10);
  assert.ok(Math.abs(d10 / d1 - 2 / 1.1) < 1e-6, 'отношение ' + d10 / d1);   // (1+1.0)/(1+0.1)
});

test('0.156 Клинок: ручные тапы работают при автоатаке, автоатака не считается тапом', () => {
  const s = C.newState(NOCRIT); s.artifacts.blade = 3; big(s);
  const taps0 = s.stats.taps;
  const ev = C.tick(s, 3.0001);
  assert.strictEqual(hits(ev, 'heroAuto'), 3);
  assert.strictEqual(s.stats.taps, taps0, 'автоатака не идёт в счёт тапов');
  assert.strictEqual(hits(C.tap(s), 'tap'), 1, 'ручной тап');
  assert.strictEqual(s.stats.taps, taps0 + 1);
});

test('0.156 Клинок: автоатаки не заряжают ульту', () => {
  // Ульта героя заряжается только ручными нажатиями (интерфейс, pointerdown); в ядре автоатака не трогает счётчики тапов
  // и не заряжает ульты отряда.
  const s = C.newState(NOCRIT); s.artifacts.blade = 10; big(s);
  const tps0 = s.tpsWin.n, ult0 = JSON.stringify(Object.values(s.allies).map(a => a.ult));
  const ev = C.tick(s, 5.0001);
  assert.strictEqual(hits(ev, 'heroAuto'), 5);
  assert.strictEqual(s.tpsWin.n, tps0);
  if (!CFG.allyUlts) assert.strictEqual(JSON.stringify(Object.values(s.allies).map(a => a.ult)), ult0);
  assert.ok(!ev.some(e => e.type === 'ult'), 'ульта не срабатывает');
});

const huntCd = (s) => { const h = CFG.abilities.find(a => a.id === 'hunt'); s.maxFloor = Math.max(s.maxFloor, h.unlockFloor); big(s);
  s.abilities.hunt.cd = 0; s.abilities.hunt.active = 0; C.useAbility(s, 'hunt'); return s.abilities.hunt.cd / h.cooldown; };

test('0.156 «Поток силы»: уровни 0, 5, 10 сокращают перезарядку на 0/20/40%', () => {
  const c2 = CFG.classes.list.find(k => k.id === 'caller').nodes.find(n => n.id === 'c2');
  assert.strictEqual(c2.kind, 'heroAbilityCd'); assert.strictEqual(c2.per, 0.04); assert.strictEqual(c2.max, 10);
  for (const [lv, want] of [[0, 1], [5, 0.8], [10, 0.6]]) {
    const s = C.newState(NOCRIT); s.bestFloor = 5000;
    assert.ok(C.chooseClass(s, 'caller', 'd1'));
    for (let i = 0; i < lv; i++) assert.ok(C.buyClassNode(s, 'c2'), 'покупка ' + i);
    assert.strictEqual(s.cls.spent.c2 | 0, lv);
    assert.ok(Math.abs(huntCd(s) - want) < 1e-9, 'уровень ' + lv + ': ' + huntCd(s));
  }
});

test('0.156 перезарядка: общий предел сокращения 80%', () => {
  const s = C.newState(NOCRIT); s.bestFloor = 5000;
  C.chooseClass(s, 'caller', 'd1'); s.cls.spent.c2 = 10;          // −40%
  s.tree = s.tree || {}; s.tree.haste = 10;                       // «Порыв» дерева душ −50%
  assert.ok(C.treePower(s, 'abilityCd') >= 0.5, 'дерево душ даёт −50%');
  assert.ok(Math.abs(huntCd(s) - 0.2) < 1e-9, 'предел: ' + huntCd(s));
});

test('0.156 пассивки открытых, но не нанятых героев действуют', () => {
  const s = C.newState(NOCRIT);
  const id = 'kassian'; s.heroes[id].unlocked = true; s.allies[id].level = 0; fresh(s);
  const p = C.heroPassive(s, id);
  assert.strictEqual(p.kind, 'allDmg'); assert.ok(p.tier > 0 && p.value > 0);
  assert.ok(Math.abs(C.passivePower(s, 'allDmg') - p.value) < 1e-12 || C.passivePower(s, 'allDmg') >= p.value);
});

test('0.156 ритуал (этаж 150) сохраняет героев, звёзды, эволюции, артефакты, класс', () => {
  assert.strictEqual(CFG.ritual.floor, 150);
  const s = C.newState(NOCRIT); s.floor = s.maxFloor = s.bestFloor = 160; C.spawn(s);
  s.heroes.kassian.unlocked = true; s.heroes.kassian.stars = 4; s.heroes.kassian.evo = 1;
  s.artifacts.blade = 7; s.artifacts.eye = 3;
  C.chooseClass(s, 'caller', 'd1'); C.buyClassNode(s, 'c2');
  assert.ok(C.ritual(s, 'dark'), 'ритуал');
  assert.ok(s.heroes.kassian.unlocked); assert.strictEqual(s.heroes.kassian.stars, 4); assert.strictEqual(s.heroes.kassian.evo, 1);
  assert.strictEqual(s.artifacts.blade, 7); assert.strictEqual(s.artifacts.eye, 3);
  assert.strictEqual(s.cls.spent.c2, 1);
  assert.strictEqual(C.heroAutoTps(s), 1);
});

test('0.156 старое сохранение загружается: прогресс на месте, новые правила действуют', () => {
  const s = C.newState(NOCRIT);
  s.artifacts.blade = 10; s.artifacts.eye = 5; s.ach.a_crit = 4; s.ach.a_tps = 3;
  s.heroes.nyx.unlocked = true; s.heroes.nyx.stars = 2; s.bestFloor = 5000; C.chooseClass(s, 'caller', 'd1'); s.cls.spent.c2 = 3;
  const d = JSON.parse(C.serialize(s));
  const t = C.deserialize(JSON.stringify(d));
  assert.ok(t, 'загрузилось');
  assert.strictEqual(t.artifacts.blade, 10); assert.strictEqual(t.ach.a_crit, 4); assert.strictEqual(t.ach.a_tps, 3);
  assert.strictEqual(t.heroes.nyx.stars, 2); assert.strictEqual(t.cls.spent.c2, 3);
  assert.strictEqual(C.heroAutoTps(t), 1);
  assert.ok(Math.abs(C.critChance(t) - (CFG.crit.baseChance + C.artPower(t, 'critChance'))) < 1e-9, 'криты только от артефактов');
  assert.strictEqual(C.critMult(t), CFG.crit.baseMult);
});

test('титул биома: за финального босса, урон и золото только в своём биоме, сохраняется', () => {
  const s = C.newState(NOCRIT);
  s.floor = s.maxFloor = CFG.biomeFloors; s.enemyIndex = CFG.enemiesPerFloor; C.spawn(s);
  assert.ok(s.enemy.isBoss && s.enemy.final, 'финальный босс');
  const id = C.biomeOf(CFG.biomeFloors).id;
  s.enemy.hp = 1;
  let ev = []; while (s.enemy.alive) ev = ev.concat(C.tap(s));
  assert.ok(ev.some(e => e.type === 'biomeTitle' && e.id === id), 'событие титула');
  assert.strictEqual(s.biomeTitles[id], 1);
  s.floor = CFG.biomeFloors;
  const gWith = C.goldMult(s); delete s.biomeTitles[id]; const gNo = C.goldMult(s); s.biomeTitles[id] = 1;
  assert.ok(Math.abs(gWith / gNo - (1 + CFG.biomeTitles.gold)) < 1e-9, 'золото в своём биоме');
  assert.strictEqual(C.biomeTitlePower(s, 'dmg'), CFG.biomeTitles.dmg);
  s.floor = CFG.biomeFloors + 1;
  assert.strictEqual(C.biomeTitlePower(s, 'dmg'), 0, 'в другом биоме не действует');
  const t = C.deserialize(C.serialize(s));
  assert.strictEqual(t.biomeTitles[id], 1, 'переживает сохранение');
});

test('спец-моб: после 30 этажа, 30 секунд, сбегает или даёт сундук', () => {
  const SP = CFG.special;
  const s = C.newState({ rng: () => 0 });
  s.floor = s.maxFloor = SP.minFloor - 1; s.enemyIndex = 1; C.spawn(s);
  assert.ok(!s.enemy.special, 'до ' + SP.minFloor + ' этажа нет');
  s.floor = s.maxFloor = SP.minFloor; C.spawn(s);
  assert.ok(s.enemy.special, 'появился');
  assert.strictEqual(s.bossTimeLeft, SP.timeSec);
  const ev = C.tick(s, SP.timeSec + 0.01);
  assert.ok(ev.some(e => e.type === 'specialEscape'), 'сбежал');
  assert.ok(!s.enemy.special && s.specialCd > 0, 'следующий — обычный, пауза');
  s.specialCd = 0; C.spawn(s); assert.ok(s.enemy.special);
  const shard0 = s.materials.shard; s.enemy.hp = 1; let out = [];
  while (s.enemy.alive) out = out.concat(C.tap(s));
  const ch = out.find(e => e.type === 'specialChest');
  assert.ok(ch && ch.reward.shard > 0 && ch.reward.gold, 'сундук');
  assert.ok(s.materials.shard > shard0);
});

test('пассивки: каждый герой даёт бонус всей команде, растёт от звёзд и уровня', () => {
  const P = CFG.passives;
  assert.strictEqual(Object.keys(P.heroes).length, CFG.allies.length, 'у каждого героя есть пассивка');
  const s = C.newState(NOCRIT); const id = 'irene', kind = P.heroes[id][0];
  for (const k in s.heroes) s.heroes[k].unlocked = false;
  s._pv = null; assert.strictEqual(C.passivePower(s, kind), 0, 'закрытый герой не даёт');
  s.heroes[id].unlocked = true; s.allies[id].level = 0; s._pv = null;
  const p1 = C.passivePower(s, kind); assert.ok(p1 > 0, 'открытый даёт даже без найма');
  s.heroes[id].stars = 5; s._pv = null; const p2 = C.passivePower(s, kind);
  assert.ok(Math.abs(p2 / p1 - 6) < 1e-9, 'звёзды: ×(1+звёзды)');
  s.allies[id].level = P.levelStep * 2; s._pv = null;
  assert.ok(Math.abs(C.passivePower(s, kind) / p2 - 3) < 1e-9, 'уровень: ×(1+⌊ур/шаг⌋)');
});

test('возвышение: E растёт до GOD за копии и осколки, нужна макс. звезда, DPS ×dpsMult', () => {
  const A = CFG.ascend, R = CFG.rarities;
  const s = C.newState(NOCRIT), id = 'irene', h = s.heroes[id];
  h.unlocked = true; s.allies[id].level = 1;
  h.copies = 1000; s.materials.shard = 1e15;
  assert.ok(!C.canAscend(s, id), 'без макс. звезды нельзя');
  h.stars = CFG.maxStars;
  const d0 = C.allyDps(s, id);
  assert.ok(C.ascend(s, id)); assert.strictEqual(C.heroRarity(s, id), 'D');
  assert.ok(Math.abs(C.allyDps(s, id) / d0 - A.dpsMult) < 1e-6);
  while (C.ascend(s, id));
  assert.strictEqual(C.heroRarity(s, id), 'GOD'); assert.strictEqual(C.ascendCost(s, id), null, 'выше GOD нельзя');
  assert.strictEqual(h.asc, R.length - 1);
  const t = C.deserialize(C.serialize(s)); assert.strictEqual(t.heroes[id].asc, R.length - 1, 'сохраняется');
});
