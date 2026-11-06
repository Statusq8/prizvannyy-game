// 0.132: меч-автотап, титулы биомов, спец-моб (решения пользователя 07.11)
const test = require('node:test'), assert = require('node:assert');
const C = require('../src/core.js'), CFG = C.CONFIG;
CFG.maxTapsPerSec = Infinity; CFG.unlocks = {}; CFG.disabled = []; CFG.cage = null;
const NOCRIT = { rng: () => 1 };
const big = s => { s.enemy.hp = s.enemy.maxHp = 1e30; };

test('меч: уровень = автотапов в секунду, не больше 10', () => {
  for (const [lv, want] of [[1, 1], [5, 5], [10, 10], [25, 10]]) {
    const s = C.newState(NOCRIT); s.artifacts.blade = lv; big(s);
    const n = C.tick(s, 1.0001).filter(e => e.type === 'hit' && e.source === 'heroAuto').length;
    assert.strictEqual(n, want, 'уровень ' + lv);
  }
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
