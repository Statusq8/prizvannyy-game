// Тесты ядра: node --test tests/
const test = require('node:test');
const assert = require('node:assert');
const C = require('../src/core.js');
const CFG = C.CONFIG;

function killCurrent(s) {
  let ev = [];
  while (s.enemy.alive) ev = ev.concat(C.tap(s));
  return ev;
}
function respawn(s) { return C.tick(s, CFG.respawnDelaySec + 0.01); }
function clearFloor(s) {
  for (let i = 0; i < CFG.enemiesPerFloor; i++) { killCurrent(s); respawn(s); }
}

test('новая игра: этаж 1, враг 1 из 10, полное HP', () => {
  const s = C.newState();
  assert.strictEqual(s.floor, 1);
  assert.strictEqual(s.enemyIndex, 1);
  assert.strictEqual(s.enemy.hp, s.enemy.maxHp);
  assert.strictEqual(s.enemy.isBoss, false);
});

test('тап уменьшает HP на урон за тап', () => {
  const s = C.newState();
  const hp = s.enemy.hp;
  C.tap(s);
  assert.strictEqual(s.enemy.hp, hp - C.tapDamage(s));
});

test('после смерти врага урон не наносится до появления нового', () => {
  const s = C.newState();
  killCurrent(s);
  assert.deepStrictEqual(C.tap(s), []);
  respawn(s);
  assert.ok(s.enemy.alive);
});

test('убийство даёт золото и продвигает врага', () => {
  const s = C.newState();
  const ev = killCurrent(s);
  assert.ok(ev.some(e => e.type === 'kill' && e.gold > 0));
  assert.strictEqual(s.gold, C.killGold(1, false));
  respawn(s);
  assert.strictEqual(s.enemyIndex, 2);
});

test('десятый враг — босс с таймером', () => {
  const s = C.newState();
  for (let i = 0; i < 9; i++) { killCurrent(s); respawn(s); }
  assert.strictEqual(s.enemy.isBoss, true);
  assert.strictEqual(s.bossTimeLeft, CFG.bossTimeSec);
  assert.strictEqual(s.enemy.maxHp, C.enemyMaxHp(1, true));
});

test('HP врагов растёт экспоненциально по этажам', () => {
  const a = C.enemyMaxHp(1, false), b = C.enemyMaxHp(11, false), c = C.enemyMaxHp(21, false);
  assert.ok(b > a && c > b);
  assert.ok(Math.abs(c / b - b / a) / (b / a) < 0.05);
});

test('победа над боссом: следующий этаж и разовая награда первого прохождения', () => {
  const s = C.newState();
  s.tapLevel = 1000;
  for (let i = 0; i < 9; i++) { killCurrent(s); respawn(s); }
  const ev = killCurrent(s);
  assert.ok(ev.some(e => e.type === 'firstClear' && e.floor === 1));
  respawn(s);
  assert.strictEqual(s.floor, 2);
  assert.strictEqual(s.maxFloor, 2);

  // повторное прохождение этажа 1 — без разовой награды
  C.goToFloor(s, 1);
  for (let i = 0; i < 9; i++) { killCurrent(s); respawn(s); }
  const ev2 = killCurrent(s);
  assert.ok(!ev2.some(e => e.type === 'firstClear'));
});

test('провал по таймеру: фарм без босса, затем можно вызвать босса', () => {
  const s = C.newState();
  for (let i = 0; i < 9; i++) { killCurrent(s); respawn(s); }
  const ev = C.tick(s, CFG.bossTimeSec + 0.1);
  assert.ok(ev.some(e => e.type === 'bossFail'));
  assert.strictEqual(s.farming, true);
  assert.strictEqual(s.enemy.isBoss, false);
  assert.strictEqual(s.floor, 1);

  // фарм крутит врагов 1–9, босс не появляется
  for (let i = 0; i < 20; i++) { killCurrent(s); respawn(s); assert.strictEqual(s.enemy.isBoss, false); }

  C.challengeBoss(s);
  assert.strictEqual(s.farming, false);
  assert.strictEqual(s.enemy.isBoss, true);
});

test('таймер босса не идёт у обычных врагов', () => {
  const s = C.newState();
  const ev = C.tick(s, 1000);
  assert.deepStrictEqual(ev, []);
  assert.strictEqual(s.enemyIndex, 1);
});

test('переход только на открытые этажи', () => {
  const s = C.newState();
  assert.deepStrictEqual(C.goToFloor(s, 2), []);
  assert.deepStrictEqual(C.goToFloor(s, 0), []);
  s.tapLevel = 1000;
  clearFloor(s); clearFloor(s);
  assert.strictEqual(s.maxFloor, 3);
  assert.ok(C.goToFloor(s, 1).length > 0);
  assert.strictEqual(s.floor, 1);
  assert.strictEqual(s.enemyIndex, 1);
});

test('покупка улучшения: ×1, ×10, MAX, нехватка золота', () => {
  const s = C.newState();
  assert.strictEqual(C.buyTap(s, 1), false);           // нет золота
  s.gold = C.upgradeCost(1, 10);
  assert.strictEqual(C.buyTap(s, 10), true);
  assert.strictEqual(s.tapLevel, 11);
  assert.strictEqual(s.gold, 0);

  s.gold = 1e6;
  const n = C.maxAffordable(s.tapLevel, s.gold);
  const before = s.gold;
  assert.strictEqual(C.buyTap(s, 'max'), true);
  assert.strictEqual(s.tapLevel, 11 + n);
  assert.ok(s.gold >= 0);
  assert.ok(C.upgradeCost(s.tapLevel, 1) > s.gold);   // MAX действительно максимум
  assert.strictEqual(before - s.gold, C.upgradeCost(11, n));
});

test('сумма стоимости ×N равна сумме N покупок ×1 (±округление)', () => {
  let level = 1, sum = 0;
  for (let i = 0; i < 50; i++) { sum += C.upgradeCost(level, 1); level++; }
  const bulk = C.upgradeCost(1, 50);
  assert.ok(Math.abs(bulk - sum) <= 50);
});

test('сохранение и загрузка восстанавливают прогресс', () => {
  const s = C.newState();
  s.tapLevel = 1000;
  clearFloor(s); clearFloor(s);
  s.gold = 1234.5;
  const t = C.deserialize(C.serialize(s));
  assert.ok(t);
  for (const k of ['floor', 'maxFloor', 'highestCleared', 'enemyIndex', 'gold', 'tapLevel', 'farming'])
    assert.deepStrictEqual(t[k], s[k], k);
  assert.strictEqual(t.enemy.hp, t.enemy.maxHp);
});

test('повреждённое сохранение не загружается', () => {
  assert.strictEqual(C.deserialize('не json'), null);
  assert.strictEqual(C.deserialize('{}'), null);
  const s = C.newState();
  const bad = JSON.parse(C.serialize(s)); bad.gold = -5;
  assert.strictEqual(C.deserialize(JSON.stringify(bad)), null);
  const bad2 = JSON.parse(C.serialize(s)); bad2.floor = 9; bad2.maxFloor = 3;
  assert.strictEqual(C.deserialize(JSON.stringify(bad2)), null);
});

test('формат чисел: обычные и научная нотация', () => {
  assert.strictEqual(C.fmt(999), '999');
  assert.strictEqual(C.fmt(12345.9), '12 345');
  assert.strictEqual(C.fmt(1.25e30), '1.25e30');
});
