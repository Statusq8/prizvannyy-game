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
