// Тесты ядра: node --test tests/
const test = require('node:test');
const assert = require('node:assert');
const C = require('../src/core.js');
const CFG = C.CONFIG;
const TAP_CAP = CFG.maxTapsPerSec; CFG.maxTapsPerSec = Infinity;   // тесты бьют много раз за кадр; предел проверяется отдельно
CFG.passives.heroes = {};   // 0.134: пассивки героев проверяются в mechanics.test.js — здесь точные числа без них
const UNLOCKS = CFG.unlocks; CFG.unlocks = {}; CFG.disabled = []; CFG.allyUlts = true; const CAGE = CFG.cage; CFG.cage = null;   // 0.74: лесенка открытий — в тестах всё открыто, проверяется отдельно
const NOCRIT = { rng: () => 1 };   // без случайных критов, чтобы проверять точный урон

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
  const s = C.newState(NOCRIT);
  assert.strictEqual(s.floor, 1);
  assert.strictEqual(s.enemyIndex, 1);
  assert.strictEqual(s.enemy.hp, s.enemy.maxHp);
  assert.strictEqual(s.enemy.isBoss, false);
});

test('тап уменьшает HP на урон за тап', () => {
  const s = C.newState(NOCRIT);
  const hp = s.enemy.hp;
  C.tap(s);
  assert.strictEqual(s.enemy.hp, hp - C.tapDamage(s));
});

test('после смерти врага урон не наносится до появления нового', () => {
  const s = C.newState(NOCRIT);
  killCurrent(s);
  assert.deepStrictEqual(C.tap(s), []);
  respawn(s);
  assert.ok(s.enemy.alive);
});

test('убийство даёт золото и продвигает врага', () => {
  const s = C.newState(NOCRIT);
  const ev = killCurrent(s);
  assert.ok(ev.some(e => e.type === 'kill' && e.gold > 0));
  assert.strictEqual(s.gold, C.killGold(1, false));
  respawn(s);
  assert.strictEqual(s.enemyIndex, 2);
});

test('десятый враг — босс с таймером', () => {
  const s = C.newState(NOCRIT);
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
  const s = C.newState(NOCRIT);
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
  const s = C.newState(NOCRIT);
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
  const s = C.newState(NOCRIT);
  const ev = C.tick(s, 1000);
  assert.deepStrictEqual(ev, []);
  assert.strictEqual(s.enemyIndex, 1);
});

test('переход только на открытые этажи', () => {
  const s = C.newState(NOCRIT);
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
  const s = C.newState(NOCRIT);
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
  const s = C.newState(NOCRIT);
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
  const s = C.newState(NOCRIT);
  const bad = JSON.parse(C.serialize(s)); bad.gold = -5;
  assert.strictEqual(C.deserialize(JSON.stringify(bad)), null);
  const bad2 = JSON.parse(C.serialize(s)); bad2.floor = 9; bad2.maxFloor = 3;
  assert.strictEqual(C.deserialize(JSON.stringify(bad2)), null);
});

test('формат чисел: K, M, B, T, затем буквы aa, ab…', () => {
  assert.strictEqual(C.fmt(0), '0');
  assert.strictEqual(C.fmt(999.9), '999');
  assert.strictEqual(C.fmt(1000), '1K');
  assert.strictEqual(C.fmt(1500), '1.5K');
  assert.strictEqual(C.fmt(12345.9), '12.3K');
  assert.strictEqual(C.fmt(999999), '999K');                 // не округляем вверх
  assert.strictEqual(C.fmt(2.3e6), '2.3M');
  assert.strictEqual(C.fmt(4.1e9), '4.1B');
  assert.strictEqual(C.fmt(7.77e12), '7.77T');
  assert.strictEqual(C.fmt(1.2e15), '1.2aa');
  assert.strictEqual(C.fmt(3.4e18), '3.4ab');
  assert.strictEqual(C.fmt(9e90), '9az');
  assert.strictEqual(C.fmt(1e93), '1ba');
  assert.strictEqual(C.fmt(1.25e30), '1.25af');
});

test('формат чисел: суффикс не меняется внутри одного разряда', () => {
  const suf = x => x.replace(/^[\d.]+/, '');
  for (let e = 3; e < 300; e += 3) {
    const a = C.fmt(Math.pow(10, e)), b = C.fmt(Math.pow(10, e) * 999.9);
    assert.strictEqual(suf(a), suf(b), e + ': ' + a + ' / ' + b);
  }
});

// ---------- союзники (этап 3) ----------
test('союзник не нанят: не атакует', () => {
  const s = C.newState(NOCRIT);
  const hp = s.enemy.hp;
  C.tick(s, 5);
  assert.strictEqual(s.enemy.hp, hp);
  assert.strictEqual(C.autoDps(s), 0);
});

test('найм союзника за золото и рост уровня', () => {
  const s = C.newState(NOCRIT);
  const a = CFG.allies[0];
  assert.strictEqual(C.buyAlly(s, a.id, 1), false);    // нет золота
  s.gold = a.hireCost;
  assert.strictEqual(C.buyAlly(s, a.id, 1), true);
  assert.strictEqual(s.allies[a.id].level, 1);
  assert.strictEqual(s.gold, 0);
  assert.strictEqual(C.autoDps(s), C.allyDpsAt(a.id, 1));
  s.gold = 1e6;
  C.buyAlly(s, a.id, 'max');
  assert.ok(C.allyCost(s, a.id, 1) > s.gold);
  assert.strictEqual(C.buyAlly(s, 'нет-такого', 1), false);
});

test('союзник атакует сам с фиксированной частотой и наносит свой DPS', () => {
  const s = C.newState(NOCRIT);
  const a = CFG.allies[0];
  s.allies[a.id].level = 1;
  s.enemy.hp = s.enemy.maxHp = 1e9;                    // живучий враг
  const step = 1 / 30;
  let hits = 0, dmg = 0;
  for (let t = 0; t < 10; t += step) for (const e of C.tick(s, step)) if (e.type === 'hit') { hits++; dmg += e.dmg; assert.strictEqual(e.source, a.id); }
  assert.ok(Math.abs(hits - 10 / a.attackInterval) <= 1, 'частота атак ' + hits);
  assert.ok(Math.abs(dmg / 10 - a.baseDps) / a.baseDps < 0.1, 'DPS ' + dmg / 10);
});

test('союзник убивает врага без тапов, не бьёт мёртвого, проходит этаж', () => {
  const s = C.newState(NOCRIT);
  s.allies[CFG.allies[0].id].level = 500;
  const step = 1 / 30;
  for (let t = 0; t < 60 && s.floor === 1; t += step) {
    const ev = C.tick(s, step);
    if (!s.enemy.alive) assert.ok(!ev.slice(ev.findIndex(e => e.type === 'kill') + 1).some(e => e.type === 'hit'));
  }
  assert.strictEqual(s.floor, 2);
  assert.ok(s.gold > 0);
});

test('сохранение союзников и миграция сохранения версии 0.2', () => {
  const s = C.newState(NOCRIT);
  s.allies[CFG.allies[0].id].level = 7;
  const t = C.deserialize(C.serialize(s));
  assert.strictEqual(t.allies[CFG.allies[0].id].level, 7);

  const old = JSON.stringify({ v: 1, floor: 4, maxFloor: 5, highestCleared: 4, enemyIndex: 3, farming: false,
    gold: 50, tapLevel: 12, stats: { taps: 10, kills: 30, bossKills: 4 } });
  const m = C.deserialize(old);
  assert.ok(m, 'старое сохранение загружается');
  assert.strictEqual(m.floor, 4);
  assert.strictEqual(m.tapLevel, 12);
  assert.strictEqual(m.allies[CFG.allies[0].id].level, 0);

  const bad = JSON.parse(C.serialize(s)); bad.allies[CFG.allies[0].id] = -1;
  assert.strictEqual(C.deserialize(JSON.stringify(bad)), null);
});

// ---------- вехи уровней ----------
test('вехи уровней умножают урон удара и союзника', () => {
  const m = CFG.milestoneMult;
  assert.strictEqual(C.milestonesReached(9), 0);
  assert.strictEqual(C.milestonesReached(10), 1);
  assert.strictEqual(C.milestonesReached(100), CFG.milestones.length);
  assert.strictEqual(C.milestonesReached(100 + CFG.milestoneEvery), CFG.milestones.length + 1);
  assert.strictEqual(C.tapDamageAt(10), CFG.tapBaseDamage * 10 * m);
  assert.ok(C.tapDamageAt(10) > C.tapDamageAt(9) * 2);
  const a = CFG.allies[0];
  assert.strictEqual(C.allyDpsAt(a.id, 25), a.baseDps * 25 * m * m * C.perkMult(25));
  assert.strictEqual(C.nextMilestone(1), 10);
  assert.strictEqual(C.nextMilestone(10), 25);
  assert.strictEqual(C.nextMilestone(100), 100 + CFG.milestoneEvery);
});

test('урон не убывает с ростом уровня', () => {
  for (let l = 1; l < 400; l++) assert.ok(C.tapDamageAt(l + 1) > C.tapDamageAt(l), 'уровень ' + l);
});

// ---------- четыре союзника ----------
test('отряд из четырёх с разными частотами атак, атакуют независимо', () => {
  const s = C.newState(NOCRIT);
  assert.strictEqual(s.squad.length, CFG.squadSize);
  const squad = s.squad.map(id => CFG.allies.find(a => a.id === id));
  assert.strictEqual(new Set(squad.map(a => a.attackInterval)).size, 4);
  for (const a of squad) s.allies[a.id].level = 1;
  s.enemy.hp = s.enemy.maxHp = 1e15;
  const hits = {};
  const step = 1 / 30;
  for (let t = 0; t < 12; t += step) for (const e of C.tick(s, step)) if (e.type === 'hit') hits[e.source] = (hits[e.source] || 0) + 1;
  for (const a of squad) assert.ok(Math.abs(hits[a.id] - 12 / a.attackInterval) <= 1, a.id + ': ' + hits[a.id]);
  const total = squad.reduce((x, a) => x + C.allyDpsAt(a.id, 1), 0);
  assert.strictEqual(C.autoDps(s), total);
});

test('сохранение всех союзников', () => {
  const s = C.newState(NOCRIT);
  for (const a of CFG.allies) s.heroes[a.id].unlocked = true;
  CFG.allies.forEach((a, i) => { s.allies[a.id].level = i * 3 + 1; });
  const t = C.deserialize(C.serialize(s));
  CFG.allies.forEach((a, i) => assert.strictEqual(t.allies[a.id].level, i * 3 + 1));
});

// ---------- ультимейты союзников ----------
const ultOf = kind => CFG.allies.find(a => a.ult.kind === kind);
function runFor(s, sec) { const ev = []; const step = 1 / 30; for (let t = 0; t < sec; t += step) ev.push(...C.tick(s, step)); return ev; }
function tough(s) { s.enemy.hp = s.enemy.maxHp = 1e18; }

test('ультимейт не копится у ненанятого союзника', () => {
  const s = C.newState(NOCRIT); tough(s);
  const ev = runFor(s, 60);
  assert.ok(!ev.some(e => e.type === 'ult'));
});

test('ультимейт срабатывает автоматически по заряду', () => {
  const a = ultOf('nuke');
  const s = C.newState(NOCRIT); tough(s);
  s.allies[a.id].level = 10;
  const ev = runFor(s, a.ult.charge * 2 + 0.5);
  assert.strictEqual(ev.filter(e => e.type === 'ult' && e.id === a.id).length, 2);
});

test('Ливень стрел наносит прямой урон, кратный DPS союзника', () => {
  const a = ultOf('nuke');
  const s = C.newState(NOCRIT); tough(s);
  s.allies[a.id].level = 10;
  s.allies[a.id].ult = a.ult.charge;
  const ev = C.tick(s, 1 / 30);
  const hit = ev.find(e => e.type === 'hit' && e.source === 'ult:' + a.id);
  assert.ok(hit);
  assert.strictEqual(hit.dmg, C.allyDps(s, a.id) * a.ult.power);
});

test('Ярость умножает урон тапа и союзников на время действия', () => {
  const a = ultOf('teamBuff');
  const s = C.newState(NOCRIT); tough(s);
  s.allies[a.id].level = 1;
  s.allies[a.id].ult = a.ult.charge;
  C.tick(s, 1 / 30);
  assert.ok(s.buffs.team > 0);
  const hit = C.tap(s).find(e => e.type === 'hit');
  assert.strictEqual(hit.dmg, C.tapDamage(s) * a.ult.power);
  runFor(s, a.ult.duration + 0.1);
  assert.strictEqual(s.buffs.team, 0);
  assert.strictEqual(C.tap(s).find(e => e.type === 'hit').dmg, C.tapDamage(s));
});

test('Метка пламени усиливает урон по врагу и пропадает с новым врагом', () => {
  const a = ultOf('mark');
  const s = C.newState(NOCRIT);
  s.allies[a.id].level = 1;
  s.allies[a.id].ult = a.ult.charge;
  s.enemy.hp = s.enemy.maxHp = 1e9;
  C.tick(s, 1 / 30);
  assert.ok(s.enemy.mark > 0);
  assert.strictEqual(C.tap(s).find(e => e.type === 'hit').dmg, C.tapDamage(s) * a.ult.power);
  s.enemy.hp = 1; C.tap(s);                 // добиваем
  C.tick(s, CFG.respawnDelaySec + 0.01);    // новый враг
  assert.strictEqual(s.enemy.mark, 0);
});

test('Разрез бездны усиливает только тапы', () => {
  const a = ultOf('tapBuff');
  const s = C.newState(NOCRIT); tough(s);
  s.buffs.tap = a.ult.duration; s.buffs.tapPower = a.ult.power;
  assert.strictEqual(C.damageMult(s, 'tap'), a.ult.power);
  assert.strictEqual(C.damageMult(s, 'shorokh'), 1);
});

test('готовность ультимейта сохраняется между врагами: не тратится на мёртвого', () => {
  const a = ultOf('nuke');
  const s = C.newState(NOCRIT);
  s.allies[a.id].level = 1;
  while (s.enemy.alive) C.tap(s);           // враг мёртв, идёт пауза до нового
  s.allies[a.id].ult = a.ult.charge;
  const ev = C.tick(s, 0.01);
  assert.ok(!ev.some(e => e.type === 'ult'));
  assert.strictEqual(s.allies[a.id].ult, a.ult.charge);
  const ev2 = C.tick(s, CFG.respawnDelaySec);
  assert.ok(ev2.some(e => e.type === 'spawn'));
  const ev3 = C.tick(s, 1 / 30);
  assert.ok(ev3.some(e => e.type === 'ult' && e.id === a.id));
});

// ---------- криты ----------
test('крит умножает урон; прокачки критов за золото нет', () => {
  const s = C.newState({ rng: () => 0 });       // всегда крит
  const hit = C.tap(s).find(e => e.type === 'hit');
  assert.strictEqual(hit.crit, true);
  assert.strictEqual(hit.dmg, C.tapDamage(s) * CFG.crit.baseMult);
  const n = C.newState(NOCRIT);
  assert.strictEqual(C.tap(n).find(e => e.type === 'hit').crit, false);
  assert.strictEqual(C.critChance(s), CFG.crit.baseChance);
  assert.strictEqual(C.buyCrit, undefined);
});

test('криты срабатывают примерно с заданной вероятностью', () => {
  const s = C.newState();                        // настоящий Math.random
  s.enemy.hp = s.enemy.maxHp = 1e18;
  let crits = 0; const N = 20000;
  for (let i = 0; i < N; i++) if (C.tap(s).find(e => e.type === 'hit').crit) crits++;
  assert.ok(Math.abs(crits / N - CFG.crit.baseChance) < 0.01, 'доля ' + crits / N);
});

// ---------- способности главного героя ----------
test('способности закрыты до нужного этажа', () => {
  const s = C.newState(NOCRIT);
  for (const a of CFG.abilities) {
    s.maxFloor = a.unlockFloor - 1;
    assert.deepStrictEqual(C.useAbility(s, a.id), []);
    s.maxFloor = a.unlockFloor;
    assert.ok(C.useAbility(s, a.id).some(e => e.type === 'ability'));
  }
});

test('Шквал наносит удары тапом сам и уходит на перезарядку', () => {
  const def = CFG.abilities.find(a => a.id === 'flurry');
  const s = C.newState(NOCRIT); tough(s);
  s.maxFloor = def.unlockFloor;
  C.useAbility(s, 'flurry');
  assert.deepStrictEqual(C.useAbility(s, 'flurry'), []);     // на перезарядке
  const ev = runFor(s, def.duration + 1);
  const taps = ev.filter(e => e.type === 'hit' && e.source === 'tap').length;
  assert.ok(Math.abs(taps - def.duration * def.tapsPerSec) <= 2, 'ударов ' + taps);
  runFor(s, def.cooldown);
  assert.ok(C.abilityReady(s, 'flurry'));
});

test('Клеймо охотника временно повышает шанс крита', () => {
  const def = CFG.abilities.find(a => a.id === 'hunt');
  const s = C.newState(NOCRIT); tough(s);
  s.maxFloor = def.unlockFloor;
  const base = C.critChance(s);
  C.useAbility(s, 'hunt');
  assert.ok(Math.abs(C.critChance(s) - Math.min(CFG.crit.maxChance, base + def.critChanceBonus)) < 1e-9);
  const save = def.critChanceBonus; def.critChanceBonus = 5;        // даже огромный бонус упирается в потолок
  assert.strictEqual(C.critChance(s), CFG.crit.maxChance);
  def.critChanceBonus = save;
  runFor(s, def.duration + 0.1);
  assert.strictEqual(C.critChance(s), base);
});

test('по умолчанию способности ручные; автоиспользование включается отдельно для каждой', () => {
  const s = C.newState(NOCRIT); tough(s);
  s.maxFloor = 100;
  let ev = runFor(s, 2);
  assert.ok(!ev.some(e => e.type === 'ability'));
  C.setAbilityAuto(s, 'flurry', true);
  ev = runFor(s, 2);
  assert.ok(ev.some(e => e.type === 'ability' && e.id === 'flurry'));
  assert.ok(!ev.some(e => e.type === 'ability' && e.id === 'hunt'));
});

test('сохранение способностей, миграция с 0.5; золото за старую прокачку критов возвращается', () => {
  const s = C.newState(NOCRIT);
  s.maxFloor = 20;
  C.useAbility(s, 'hunt'); C.setAbilityAuto(s, 'flurry', true);
  const t = C.deserialize(C.serialize(s));
  assert.strictEqual(t.abilities.flurry.auto, true);
  assert.ok(t.abilities.hunt.cd > 0);

  const old = JSON.parse(C.serialize(s)); old.v = 2; delete old.abilities; delete old.heroes; delete old.squad;
  delete old.tickets; delete old.ticketFloor; delete old.pity;
  const m = C.deserialize(JSON.stringify(old));
  assert.ok(m);
  assert.strictEqual(m.abilities.flurry.auto, false);

  const v3 = JSON.parse(C.serialize(s)); v3.v = 3; v3.gold = 0; v3.critChanceLevel = 2; v3.critMultLevel = 1;
  delete v3.heroes; delete v3.squad; delete v3.tickets; delete v3.ticketFloor; delete v3.pity;
  const r = C.deserialize(JSON.stringify(v3));
  assert.strictEqual(r.gold, Math.ceil(100 + 100 * 1.22) + 150);
});


// ---------- коллекция, портал, звёзды, отряд (этап 4) ----------
const H = id => CFG.allies.find(a => a.id === id);
test('стартовый отряд открыт, остальные герои закрыты и не нанимаются', () => {
  const s = C.newState(NOCRIT);
  for (const a of CFG.allies) assert.strictEqual(s.heroes[a.id].unlocked, !!a.starter, a.id);
  s.gold = 1e30;
  const locked = CFG.allies.find(a => !a.starter);
  assert.strictEqual(C.buyAlly(s, locked.id, 1), false);
  assert.ok(C.buyAlly(s, s.squad[0], 1));
});

test('все редкости E → GOD представлены и все герои достижимы через портал', () => {
  for (const r of CFG.rarities) assert.ok(CFG.allies.some(a => a.rarity === r), r);
  for (const r of CFG.rarities) assert.ok(CFG.portal.odds[r] > 0, r);
});

test('билеты за первое в игре прохождение босса, каждый 10-й этаж — больше', () => {
  const s = C.newState(NOCRIT);
  s.tapLevel = 1e6;
  for (let f = 1; f <= 10; f++) clearFloor(s);
  let exp = 0; for (let f = 1; f <= 10; f++) exp += C.ticketsForFloor(f);
  assert.strictEqual(s.tickets, exp);
  assert.ok(C.ticketsForFloor(10) > C.ticketsForFloor(9));
  C.goToFloor(s, 5); clearFloor(s);
  assert.strictEqual(s.tickets, exp);                 // повтор не даёт билетов
});

test('портал тратит билеты, открывает героя навсегда, дубликаты копятся отдельно', () => {
  const s = C.newState({ rng: () => 0 });             // всегда первая редкость (E) и первый герой в ней
  assert.strictEqual(C.summon(s, 1), null);           // нет билетов
  s.tickets = 3;
  const r = C.summon(s, 3);
  assert.strictEqual(r.length, 3);
  assert.strictEqual(s.tickets, 0);
  assert.strictEqual(r[0].id, 'shorokh');               // стартовый → сразу дубликат
  assert.strictEqual(r[0].isNew, false);
  assert.strictEqual(s.heroes.shorokh.copies, 3);
});

test('новый герой из портала открывается', () => {
  let k = 0;
  const seq = [0.0, 0.99];                             // редкость E, второй герой E (Гаррет)
  const s = C.newState({ rng: () => seq[k++ % 2] });
  s.tickets = 1;
  const r = C.summon(s, 1);
  assert.strictEqual(r[0].id, 'irene');
  assert.strictEqual(r[0].isNew, true);
  assert.strictEqual(s.heroes.irene.unlocked, true);
});

test('гарантии: A+ не позже pityA призывов, S+ не позже pityS', () => {
  const s = C.newState({ rng: () => 0 });             // без гарантий всегда выпадала бы E
  s.tickets = CFG.portal.pityS;
  const r = C.summon(s, CFG.portal.pityS);
  const rank = x => CFG.rarities.indexOf(x);
  assert.ok(rank(r[CFG.portal.pityA - 1].rarity) >= rank('A'));
  assert.ok(r.slice(0, CFG.portal.pityA - 1).every(x => x.rarity === 'E'));
  assert.ok(rank(r[CFG.portal.pityS - 1].rarity) >= rank('S'));
});

test('шансы портала примерно соответствуют таблице', () => {
  const s = C.newState();
  s.tickets = 40000;
  const P = CFG.portal, pa = P.pityA, ps = P.pityS; P.pityA = P.pityS = 1e9;   // отключаем гарантии для замера
  const r = C.summon(s, 40000); P.pityA = pa; P.pityS = ps;
  const share = r.filter(x => x.rarity === 'E').length / r.length;
  const total = Object.values(CFG.portal.odds).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(share - CFG.portal.odds.E / total) < 0.02, 'E ' + share);
});

test('звёзды: за дубликаты, до 10, повышают только индивидуальный DPS', () => {
  const s = C.newState(NOCRIT);
  s.allies.shorokh.level = 10;
  const before = C.allyDps(s, 'shorokh');
  assert.strictEqual(C.starUp(s, 'shorokh'), false);   // нет копий
  s.heroes.shorokh.copies = 1000;
  assert.ok(C.starUp(s, 'shorokh'));
  assert.strictEqual(C.allyDps(s, 'shorokh'), before * (1 + CFG.starDpsBonus));
  assert.strictEqual(C.starUp(s, 'shorokh'), true);
  while (C.starUp(s, 'shorokh'));
  assert.strictEqual(s.heroes.shorokh.stars, 5);           // с 6★ нужен корм — его нет
  s.heroes.kostik.copies = 40; s.heroes.lumi.copies = 40;
  while (C.starUp(s, 'shorokh'));
  assert.strictEqual(s.heroes.shorokh.stars, CFG.maxStars);
  const spent = CFG.starCopies.reduce((a, b) => a + b, 0), fed = CFG.starFodder.reduce((a, b) => a + b, 0);
  assert.strictEqual(s.heroes.shorokh.copies, 1000 - spent);
  assert.strictEqual(s.heroes.kostik.copies + s.heroes.lumi.copies, 80 - fed);
  assert.strictEqual(C.starCost(s, 'shorokh'), null);
  assert.strictEqual(H('shorokh').ult.power, 20);       // ульт не меняется от звёзд
});

test('0.74: бьют все нанятые союзники в полную силу, ненанятые — ничего', () => {
  const s = C.newState(NOCRIT);
  s.heroes.irene.unlocked = true;
  assert.strictEqual(C.contribDps(s, 'irene'), 0);                    // открыта, но не нанята
  s.allies.irene.level = 10;
  assert.ok(C.inSquad(s, 'irene'));
  assert.strictEqual(C.contribDps(s, 'irene'), C.allyDps(s, 'irene'));
  assert.strictEqual(C.reserveDps(s), 0);
});

test('0.74: нанятый союзник бьёт сам и копит ульту', () => {
  const s = C.newState(NOCRIT); tough(s);
  s.heroes.irene.unlocked = true;
  s.allies.irene.level = 10;
  const ev = runFor(s, 20);
  assert.ok(ev.some(e => e.type === 'hit' && e.source === 'irene'));
  assert.ok(!ev.some(e => e.source === 'reserve'));
});


test('сохранение коллекции и миграция с версии 0.6 (билеты за пройденных боссов)', () => {
  const s = C.newState(NOCRIT);
  s.heroes.saya.unlocked = true; s.heroes.saya.copies = 3; s.heroes.shorokh.stars = 2;
  C.squadRemove(s, 'lumi'); C.squadAdd(s, 'saya');
  s.tickets = 7; s.ticketFloor = 12; s.pity = { a: 5, s: 40 };
  const t = C.deserialize(C.serialize(s));
  assert.ok(t);
  assert.strictEqual(t.heroes.saya.unlocked, true);
  assert.strictEqual(t.heroes.saya.copies, 3);
  assert.strictEqual(t.heroes.shorokh.stars, 2);
  assert.strictEqual(t.heroes.velma.unlocked, false);
  assert.deepStrictEqual(t.squad, s.squad);
  assert.strictEqual(t.tickets, 7);
  assert.deepStrictEqual(t.pity, { a: 5, s: 40 });

  const old = JSON.parse(C.serialize(s));
  old.v = 3; old.highestCleared = 20; delete old.heroes; delete old.squad; delete old.tickets; delete old.ticketFloor; delete old.pity;
  old.allies = { shorokh: 50, kostik: 20 };
  const m = C.deserialize(JSON.stringify(old));
  assert.ok(m);
  let exp = 0; for (let f = 1; f <= 20; f++) exp += C.ticketsForFloor(f);
  assert.strictEqual(m.tickets, exp);
  assert.strictEqual(m.allies.shorokh.level, 50);
  assert.deepStrictEqual(m.squad, ['shorokh', 'kostik', 'shmyg', 'lumi']);
});

// ---------- Алтарь (этап 4, шаг 2) ----------
test('пожертвование: копии исчезают навсегда, эссенция по редкости', () => {
  const s = C.newState(NOCRIT);
  s.heroes.veil.unlocked = true; s.heroes.shorokh.copies = 5; s.heroes.veil.copies = 2;
  const r = C.sacrifice(s, { shorokh: 3, veil: 1 });
  assert.ok(r);
  assert.strictEqual(r.essence, 3 * CFG.altar.essence.E + 1 * CFG.altar.essence.B);
  assert.strictEqual(s.essence, r.essence);
  assert.strictEqual(s.heroes.shorokh.copies, 2);
  assert.strictEqual(s.heroes.veil.copies, 1);
  assert.strictEqual(s.heroes.shorokh.unlocked, true);    // сам герой остаётся открытым
});

test('нельзя пожертвовать больше копий, чем есть, и заблокированные', () => {
  const s = C.newState(NOCRIT);
  s.heroes.shorokh.copies = 2;
  assert.strictEqual(C.sacrifice(s, { shorokh: 3 }), null);
  C.setLock(s, 'shorokh', true);
  assert.strictEqual(C.sacrifice(s, { shorokh: 1 }), null);
  assert.strictEqual(s.heroes.shorokh.copies, 2);
  C.setLock(s, 'shorokh', false);
  assert.ok(C.sacrifice(s, { shorokh: 1 }));
  assert.strictEqual(C.sacrifice(s, {}), null);
});

test('массовый выбор берёт все незаблокированные копии', () => {
  const s = C.newState(NOCRIT);
  s.heroes.shorokh.copies = 4; s.heroes.kostik.copies = 2; s.heroes.shmyg.copies = 1;
  C.setLock(s, 'kostik', true);
  assert.deepStrictEqual(C.selectAllUnlocked(s), { shorokh: 4, shmyg: 1 });
});

test('редкие герои требуют дополнительного подтверждения', () => {
  assert.strictEqual(C.needsRareConfirm({ shorokh: 3, lumi: 1 }), false);
  assert.strictEqual(C.needsRareConfirm({ velma: 1 }), true);
  assert.strictEqual(C.needsRareConfirm({ azrael: 1 }), true);
});

test('рецепты: Слеза портала (эссенция → билет) и След героя (копия выбранного)', () => {
  const s = C.newState(NOCRIT);
  assert.strictEqual(C.tearOfPortal(s, 1), false);
  s.essence = CFG.altar.ticketCost * 2;
  assert.ok(C.tearOfPortal(s, 2));
  assert.strictEqual(s.tickets, 2);
  assert.strictEqual(s.essence, 0);
  s.essence = 1000;
  assert.ok(C.heroTrace(s, 'shmyg'));
  assert.strictEqual(s.heroes.shmyg.copies, 1);
  assert.strictEqual(s.essence, 1000 - C.traceCost('shmyg'));
  assert.strictEqual(C.heroTrace(s, 'velma'), false);   // закрытого героя нельзя
});

test('0.147: скрытых рецептов нет — все герои выпадают в Портале, жертва даёт только эссенцию', () => {
  assert.strictEqual(CFG.allies.filter(a => a.hidden).length, 0);
  const s = C.newState(NOCRIT); s.heroes.shorokh.copies = 3;
  const r = C.sacrifice(s, { shorokh: 3 });
  assert.ok(r && r.essence > 0); assert.deepStrictEqual(r.found, []);
});

test('сохранение Алтаря и миграция с 0.7', () => {
  const s = C.newState(NOCRIT);
  s.essence = 42; C.setLock(s, 'lumi', true); s.discovered.morra = true; s.heroes.morra.unlocked = true;
  const t = C.deserialize(C.serialize(s));
  assert.strictEqual(t.essence, 42);
  assert.strictEqual(t.locks.lumi, true);
  assert.strictEqual(t.discovered.morra, true);
  assert.strictEqual(t.heroes.morra.unlocked, true);
  const old = JSON.parse(C.serialize(s)); old.v = 4; delete old.essence; delete old.locks; delete old.discovered;
  const m = C.deserialize(JSON.stringify(old));
  assert.ok(m);
  assert.strictEqual(m.essence, 0);
});

// ---------- души, артефакты, ритуал (этап 4, шаг 3) ----------
function reach(s, floor) { s.floor = floor; s.maxFloor = Math.max(s.maxFloor, floor); s.bestFloor = Math.max(s.bestFloor, s.maxFloor); s.enemyIndex = 1; }

test('бонус DPS линеен по неизрасходованным душам', () => {
  const s = C.newState(NOCRIT); tough(s);
  const base = C.tap(s).find(e => e.type === 'hit').dmg;
  s.souls = 10;
  assert.strictEqual(C.soulMult(s), 1 + 10 * CFG.souls.dpsPerSoul);
  assert.ok(Math.abs(C.tap(s).find(e => e.type === 'hit').dmg - base * C.soulMult(s)) < 1e-9);
  s.souls = 20;
  assert.ok(Math.abs((C.soulMult(s) - 1) - 2 * (1 + 10 * CFG.souls.dpsPerSoul - 1)) < 1e-9);
});

test('ритуал доступен только с этажа ритуала (0.111: 150)', () => {
  const s = C.newState(NOCRIT);
  assert.strictEqual(CFG.ritual.floor, 150);
  reach(s, CFG.ritual.floor - 1);
  assert.strictEqual(C.canRitual(s), false);
  assert.strictEqual(C.ritual(s), null);
  reach(s, 400);
  assert.strictEqual(C.canRitual(s), true);
});

test('ритуал: сбрасывает забег, сохраняет постоянное, даёт души и старт ниже 400', () => {
  const s = C.newState(NOCRIT);
  reach(s, 420);
  s.gold = 1e9; s.tapLevel = 300; s.allies.shorokh.level = 200; s.highestCleared = 419;
  s.heroes.shorokh.stars = 3; s.heroes.shorokh.copies = 5; s.tickets = 7; s.essence = 11; s.artifacts.grail = 2;
  const squad = s.squad.slice(), ticketFloor = s.ticketFloor = 419;
  const expSouls = C.ritualSouls(s);
  assert.ok(expSouls > 0);
  const r = C.ritual(s);
  assert.strictEqual(r.souls, expSouls);
  assert.strictEqual(s.souls, expSouls);
  assert.strictEqual(s.rituals, 1);
  // сброс
  assert.strictEqual(s.gold, 0); assert.strictEqual(s.tapLevel, 1); assert.strictEqual(s.allies.shorokh.level, 0);
  assert.strictEqual(s.floor, 1); assert.strictEqual(s.maxFloor, s.floor);   // без «Врат восхождения» — с 1-го
  // сохранение
  assert.strictEqual(s.heroes.shorokh.stars, 3); assert.strictEqual(s.heroes.shorokh.copies, 5);
  assert.strictEqual(s.tickets, 7); assert.strictEqual(s.essence, 11); assert.strictEqual(s.artifacts.grail, 2);
  assert.deepStrictEqual(s.squad, squad); assert.strictEqual(s.ticketFloor, ticketFloor);
  assert.strictEqual(s.bestFloor, 420);
  // следующий ритуал — снова нужен этаж 400
  assert.strictEqual(C.canRitual(s), false);
});

test('Врата восхождения: старт после ритуала растёт с уровнем, всегда строго ниже 400', () => {
  const s = C.newState(NOCRIT);
  assert.strictEqual(C.ritualStartFloor(s), 1);
  s.rituals = 50; assert.strictEqual(C.ritualStartFloor(s), 1);       // число ритуалов больше не влияет
  const gate = CFG.artifacts.find(a => a.id === 'gate');
  let prev = 0;
  assert.strictEqual(1 + gate.max, CFG.ritual.floor - 1);            // на максимуме — старт с 399
  for (let lv = 1; lv <= gate.max; lv++) {
    s.artifacts.gate = lv;
    const f = C.ritualStartFloor(s);
    assert.ok(f > prev && f < CFG.ritual.floor);
    prev = f;
  }
  assert.strictEqual(C.upgradeArtCost(s, 'gate'), null);              // дальше не качается
  s.artifacts.gate = 3; reach(s, 400);
  assert.strictEqual(C.ritual(s).start, 4);
  assert.strictEqual(s.floor, 4); assert.strictEqual(s.maxFloor, 4);
});

test('души за ритуал растут с этажом и дают бонус за новый рекорд', () => {
  const a = C.newState(NOCRIT); reach(a, 400);
  const b = C.newState(NOCRIT); reach(b, 450);
  assert.ok(C.ritualSouls(b) > C.ritualSouls(a));
  const c = C.newState(NOCRIT); reach(c, 450); c.bestRecordAtRunStart = 450;   // рекорд не побит
  assert.ok(C.ritualSouls(b) > C.ritualSouls(c));
});

test('артефакты находятся и улучшаются только за души, все действуют одновременно', () => {
  const s = C.newState({ rng: () => 0 });
  assert.strictEqual(C.findArtifact(s), null);
  s.souls = 1e6;
  const ids = [];
  const nSoul = CFG.artifacts.filter(a => !a.special && !a.blood).length;
  for (let i = 0; i < nSoul; i++) ids.push(C.findArtifact(s));
  assert.strictEqual(new Set(ids).size, nSoul);
  assert.ok(ids.every(id => !CFG.artifacts.find(a => a.id === id).blood));
  assert.strictEqual(C.findCost(s), null);                 // всё найдено
  assert.strictEqual(C.findArtifact(s), null);
  const before = s.souls, cost = C.upgradeArtCost(s, 'grail');
  assert.ok(C.upgradeArtifact(s, 'grail'));
  assert.strictEqual(s.artifacts.grail, 2);
  assert.strictEqual(s.souls, before - cost);
  s.gold = 1e30;
  assert.strictEqual(C.buyTap(s, 1), true);                // золото на артефакты не тратится — у них свои функции
});

test('артефакты — единственный рост критов; шанс не выше 50%', () => {
  const s = C.newState(NOCRIT);
  assert.strictEqual(C.critChance(s), CFG.crit.baseChance);
  s.artifacts.eye = 10; s.artifacts.fang = 5;
  assert.ok(Math.abs(C.critChance(s) - (CFG.crit.baseChance + 0.1)) < 1e-9);
  assert.ok(Math.abs(C.critMult(s) - (CFG.crit.baseMult + 1)) < 1e-9);
  s.artifacts.eye = 45; s.maxFloor = 100; C.useAbility(s, 'hunt');
  assert.strictEqual(C.critChance(s), CFG.crit.maxChance);
  const eye = CFG.artifacts.find(a => a.id === 'eye');
  assert.strictEqual(C.upgradeArtCost(s, 'eye'), eye.max && s.artifacts.eye >= eye.max ? null : C.upgradeArtCost(s, 'eye'));
});

test('артефакты действуют на героя и союзников; золото и таймер босса', () => {
  const s = C.newState(NOCRIT); tough(s);
  const tap0 = C.tap(s).find(e => e.type === 'hit').dmg;
  s.artifacts.gaunt = 1;
  assert.ok(Math.abs(C.tap(s).find(e => e.type === 'hit').dmg - tap0 * 1.4) < 1e-9);
  s.allies.shorokh.level = 1;
  const ally0 = C.allyDps(s, 'shorokh');
  s.artifacts.banner = 1;
  assert.ok(Math.abs(C.autoDps(s) - ally0 * 1.4) < 1e-9);
  s.artifacts.sand = 3;
  assert.strictEqual(C.bossTime(s), CFG.bossTimeSec + 3);
  s.artifacts.feather = 1;
  assert.strictEqual(C.goldMult(s), 1.2);
});

test('Клинок первого призыва: герой атакует сам с фиксированной частотой, тапы остаются', () => {
  const s = C.newState(NOCRIT); tough(s);
  let ev = runFor(s, 5);
  assert.ok(!ev.some(e => e.source === 'heroAuto'));
  s.artifacts.blade = 1;
  ev = runFor(s, 10);
  const n = ev.filter(e => e.type === 'hit' && e.source === 'heroAuto').length;
  assert.ok(Math.abs(n - 10 / CFG.heroAutoInterval) <= 1, 'атак ' + n);
  assert.ok(C.tap(s).some(e => e.type === 'hit' && e.source === 'tap'));
});

test('трата душ уменьшает бонус — предпросмотр показывает DPS до и после', () => {
  const s = C.newState(NOCRIT);
  s.souls = 3; s.artifacts.feather = 1;                     // золото не даёт DPS → после траты DPS ниже
  s.allies.shorokh.level = 10;
  const p = C.previewSpend(s, 'upgrade', 'feather', 5);
  assert.ok(p.after < p.before);
  assert.strictEqual(s.souls, 3);                           // предпросмотр ничего не меняет
});

test('сохранение душ, артефактов, ритуалов и миграция с 0.8', () => {
  const s = C.newState(NOCRIT);
  s.souls = 12; s.artifacts = { grail: 3, blade: 1 }; s.rituals = 2; s.bestFloor = 512; s.bestRecordAtRunStart = 480;
  const t = C.deserialize(C.serialize(s));
  assert.strictEqual(t.souls, 12); assert.deepStrictEqual(t.artifacts, { grail: 3, blade: 1 });
  assert.strictEqual(t.rituals, 2); assert.strictEqual(t.bestFloor, 512);
  const old = JSON.parse(C.serialize(s)); old.v = 5;
  for (const k of ['souls', 'artifacts', 'rituals', 'bestFloor', 'bestRecordAtRunStart']) delete old[k];
  const m = C.deserialize(JSON.stringify(old));
  assert.ok(m); assert.strictEqual(m.souls, 0); assert.strictEqual(m.rituals, 0);
  const bad = JSON.parse(C.serialize(s)); bad.artifacts.eye = 999;
  assert.strictEqual(C.deserialize(JSON.stringify(bad)), null);
});

// ---------- материалы и эволюция (0.10) ----------
function killBoss(s) { s.enemyIndex = CFG.enemiesPerFloor; C.challengeBoss(s); killCurrent(s); return respawn(s); }

test('материалы: осколки за каждого босса (и повторно), сердце — за первое в игре прохождение 50-го', () => {
  const s = C.newState(NOCRIT); s.tapLevel = 1e12;
  reach(s, 49);
  const ev = [];
  s.enemyIndex = CFG.enemiesPerFloor; C.challengeBoss(s); ev.push(...killCurrent(s));
  const m = ev.find(e => e.type === 'materials');
  assert.deepStrictEqual(m, { type: 'materials', shard: C.shardsForBoss(49), heart: 0 });
  assert.strictEqual(s.materials.shard, C.shardsForBoss(49));
  respawn(s); killBoss(s);                                   // босс 50-го: «сердце» начисляется осколками (0.51)
  assert.strictEqual(s.materials.heart, 0);
  assert.strictEqual(s.materials.shard, C.shardsForBoss(49) + C.shardsForBoss(50) + CFG.materials.heartRecipe);
  C.goToFloor(s, 50); killBoss(s);                           // повтор: осколки есть, бонуса сердца нет
  assert.strictEqual(s.materials.shard, C.shardsForBoss(49) + 2 * C.shardsForBoss(50) + CFG.materials.heartRecipe);
});

test('материалы и эволюция переживают ритуал; сердца после ритуала не повторяются', () => {
  const s = C.newState(NOCRIT);
  s.materials = { shard: 77, heart: 4, dust: 0 }; s.heartFloor = 400; s.heroes.shorokh.evo = 2;
  reach(s, 400); C.ritual(s);
  assert.deepStrictEqual(s.materials, { shard: 77, heart: 4, dust: 0 });
  assert.strictEqual(s.heroes.shorokh.evo, 2);
  assert.strictEqual(C.bossMaterials(s, 50).firstHeart, false);
  assert.strictEqual(C.bossMaterials(s, 450).firstHeart, true);
});

test('эволюция: нужны звёзды и материалы, цена растёт с редкостью, даёт только индивидуальный DPS', () => {
  const s = C.newState(NOCRIT);
  s.allies.shorokh.level = 10;
  const st = CFG.evolution.stages[0];
  assert.strictEqual(C.evolve(s, 'shorokh'), false);           // нет звёзд и материалов
  s.heroes.shorokh.stars = st.stars;
  const c = C.evoCost(s, 'shorokh');
  s.materials.shard = c.shards - 1;
  assert.strictEqual(C.evolve(s, 'shorokh'), false);           // не хватает осколков
  s.materials.shard = c.shards;
  const dps = C.allyDps(s, 'shorokh'), crit = C.critChance(s), mult = C.critMult(s);
  assert.strictEqual(C.evolve(s, 'shorokh'), true);
  assert.strictEqual(s.heroes.shorokh.evo, 1); assert.strictEqual(s.materials.shard, 0);
  assert.strictEqual(C.allyDps(s, 'shorokh'), dps * st.mult);
  assert.strictEqual(C.critChance(s), crit); assert.strictEqual(C.critMult(s), mult);   // без критов
  s.heroes.veil.unlocked = true; assert.ok(C.evoCost(s, 'veil').shards > C.evoCost(C.newState(), 'shorokh').shards);   // B дороже E
  // вторая ступень: прежние сердца входят в цену осколками (0.51)
  s.heroes.shorokh.stars = CFG.evolution.stages[1].stars;
  const c2 = C.evoCost(s, 'shorokh'); assert.strictEqual(c2.hearts, 0);
  assert.strictEqual(c2.shards, Math.ceil(CFG.evolution.stages[1].shards * CFG.evolution.rarityCost.E) + CFG.evolution.stages[1].hearts * CFG.materials.heartRecipe);
  s.materials.shard = c2.shards - 1; assert.strictEqual(C.evolve(s, 'shorokh'), false);
  s.materials.shard = c2.shards; assert.strictEqual(C.evolve(s, 'shorokh'), true);
  // после последней ступени — дальше некуда
  s.heroes.shorokh.evo = CFG.evolution.stages.length;
  assert.strictEqual(C.evoCost(s, 'shorokh'), null);
  assert.strictEqual(C.evolve(s, 'shorokh'), false);
  // закрытого героя эволюционировать нельзя
  s.heroes.azrael.stars = 10; s.materials.heart = 99;
  assert.strictEqual(C.evolve(s, 'azrael'), false);
});

test('сердца слиты в осколки (0.51): ковать нельзя, старые сердца при загрузке становятся осколками', () => {
  const s = C.newState(NOCRIT); s.materials.shard = 1000;
  assert.strictEqual(C.forgeHeart(s, 1), false);
  s.materials = { shard: 15, heart: 2, dust: 0 };
  const t = C.deserialize(C.serialize(s));
  assert.deepStrictEqual(t.materials, { shard: 15 + 2 * CFG.materials.heartRecipe, heart: 0, dust: 0 });
});

test('сохранение эволюции и материалов, миграция с 0.9 начисляет материалы за пройденных боссов', () => {
  const s = C.newState(NOCRIT);
  s.materials = { shard: 15, heart: 2 }; s.heartFloor = 100; s.heroes.shorokh.evo = 1;
  const t = C.deserialize(C.serialize(s));
  assert.deepStrictEqual(t.materials, { shard: 15 + 2 * CFG.materials.heartRecipe, heart: 0, dust: 0 });
  assert.strictEqual(t.heartFloor, 100); assert.strictEqual(t.heroes.shorokh.evo, 1);
  const old = JSON.parse(C.serialize(s)); old.v = 6; delete old.materials; delete old.heartFloor; old.ticketFloor = 100;
  for (const id in old.heroes) delete old.heroes[id].evo;
  const m = C.deserialize(JSON.stringify(old));
  let sh = 0; for (let f = 1; f <= 100; f++) sh += C.shardsForBoss(f);
  assert.deepStrictEqual(m.materials, { shard: sh + 2 * CFG.materials.heartRecipe, heart: 0, dust: 0 });
  assert.strictEqual(m.heartFloor, 100); assert.strictEqual(m.heroes.shorokh.evo, 0);
  const bad = JSON.parse(C.serialize(s)); bad.heroes.shorokh.evo = 9;
  assert.strictEqual(C.deserialize(JSON.stringify(bad)), null);
});

// ---------- офлайн (0.11) ----------
test('офлайн: короче минуты — ничего; без авто-урона — только время', () => {
  const s = C.newState(NOCRIT);
  assert.strictEqual(C.offlineProgress(s, 30), null);
  const r = C.offlineProgress(s, 3600);
  assert.strictEqual(r.gold, 0); assert.strictEqual(r.toFloor, 1);
});

test('офлайн: отряд проходит этажи до стены, затем фармит этаж ниже', () => {
  const s = C.newState(NOCRIT);
  s.allies.shorokh.level = 50;
  const dps = C.offlineDps(s);
  const r = C.offlineProgress(s, 12 * 3600);
  assert.ok(r.floorsCleared > 0 && r.wallFloor > 1);
  // на стене босс не успевает умереть, на этаже ниже — успевал
  assert.ok(C.enemyMaxHp(r.wallFloor, true) / dps > C.bossTime(s));
  assert.ok(C.enemyMaxHp(r.wallFloor - 1, true) / dps <= C.bossTime(s));
  assert.strictEqual(r.farmFloor, r.wallFloor - 1);
  assert.strictEqual(s.floor, r.wallFloor - 1); assert.ok(s.farming);
  assert.strictEqual(s.maxFloor, r.wallFloor);
  assert.ok(r.gold > 0 && r.shard > 0 && r.kills > 0);
  assert.strictEqual(s.enemy.hp, s.enemy.maxHp);
});

test('офлайн: повторный уход не опускает ниже — снова пробует рубеж и фармит под ним', () => {
  const s = C.newState(NOCRIT);
  s.allies.shorokh.level = 50;
  s.megaSoulsFloor = 1e9;                                             // души мега-боссов меняли бы силу между уходами
  const a = C.offlineProgress(s, 12 * 3600);
  const b = C.offlineProgress(s, 12 * 3600);
  assert.strictEqual(b.wallFloor, a.wallFloor); assert.strictEqual(s.floor, a.wallFloor - 1);
  assert.strictEqual(b.floorsCleared, 0);
});

test('офлайн: не больше 12 часов, фарм приносит золото пропорционально времени', () => {
  const s1 = C.newState(NOCRIT); s1.allies.shorokh.level = 50;
  const s2 = C.newState(NOCRIT); s2.allies.shorokh.level = 50;
  const r1 = C.offlineProgress(s1, 12 * 3600), r2 = C.offlineProgress(s2, 48 * 3600);
  assert.ok(r2.capped); assert.strictEqual(r2.seconds, CFG.offline.maxSec);
  assert.strictEqual(r1.gold, r2.gold);
  const s3 = C.newState(NOCRIT); s3.allies.shorokh.level = 50;
  const r3 = C.offlineProgress(s3, 6 * 3600);
  assert.ok(r3.gold < r1.gold);
});

test('офлайн: сильный отряд за короткое время просто продвигается без стены', () => {
  const s = C.newState(NOCRIT);
  s.allies.lumi.level = 100;
  const r = C.offlineProgress(s, 120);
  assert.strictEqual(r.wallFloor, null);
  assert.ok(s.floor > 1 && !s.farming);
});

test('время сохранения читается из сохранения', () => {
  const s = C.newState(NOCRIT);
  const t = C.deserialize(C.serialize(s));
  assert.ok(Math.abs(t.savedAt - Date.now()) < 5000);
});

// ---------- полная Башня (0.12) ----------
test('биомы: по 50 этажей, по кругу после 400, свои враги и финальный босс', () => {
  assert.strictEqual(C.biomeOf(1).id, 'crypt'); assert.strictEqual(C.biomeOf(50).id, 'crypt');
  assert.strictEqual(C.biomeOf(51).id, 'ash'); assert.strictEqual(C.biomeOf(400).id, 'throne');
  assert.strictEqual(CFG.biomes.length, 20); assert.strictEqual(C.biomeOf(1000).id, 'heart');
  assert.strictEqual(C.biomeOf(1001).id, 'crypt'); assert.strictEqual(C.biomeName(1001), 'Зал призыва II');
  assert.strictEqual(C.hallOf(1), CFG.halls[0]); assert.strictEqual(C.hallOf(10), CFG.halls[0]);
  assert.strictEqual(C.hallOf(11), CFG.halls[1]); assert.strictEqual(C.hallOf(50), CFG.halls[4]);
  assert.strictEqual(C.hallOf(51), CFG.halls[0]); assert.strictEqual(C.hallOf(1000), CFG.halls[4]);
  for (const b of CFG.biomes) assert.ok(b.bg.length === 3 && b.enemies.length >= 4 && b.bosses.length === 2 && b.final);
  assert.strictEqual(C.biomeName(1), 'Зал призыва');
  assert.ok(C.isFinalBoss(50) && !C.isFinalBoss(49));
  const s = C.newState(NOCRIT);
  s.floor = s.maxFloor = 50; s.enemyIndex = CFG.enemiesPerFloor; C.challengeBoss(s);
  assert.strictEqual(s.enemy.name, CFG.biomes[0].final); assert.ok(s.enemy.final);
  // финальный босс крепче обычного (с поправкой на рост этажа)
  const ratio = C.enemyMaxHp(50, true) / C.enemyMaxHp(49, true);
  assert.ok(ratio > CFG.enemyHpGrowth * 1.3);
});

test('биомы меняют сложность и золото', () => {
  const b = CFG.biomes[5];   // Кровавая арена: 251–300
  const f = 255;
  const plain = CFG.enemyBaseHp * Math.pow(CFG.enemyHpGrowth, C.floorSteps(f));
  assert.ok(Math.abs(B.toNum(C.enemyMaxHp(f, false)) / (plain * b.hp) - 1) < 1e-9);
  assert.ok(Math.abs(B.toNum(C.killGold(f, false)) / (CFG.goldBase * Math.pow(CFG.goldGrowth, C.floorSteps(f)) * b.gold) - 1) < 1e-6);
});

test('переход в новый биом даёт событие', () => {
  const s = C.newState(NOCRIT); s.tapLevel = 1e12;
  s.floor = s.maxFloor = 50; s.enemyIndex = CFG.enemiesPerFloor; C.challengeBoss(s);
  const ev = killCurrent(s);
  assert.ok(ev.some(e => e.type === 'biome' && e.floor === 51 && e.name === 'Пепельные шахты'));
});

test('редкие враги: не раньше 10 этажа, не боссы, крепче и дают больше', () => {
  const s = C.newState(NOCRIT);
  for (let k = 0; k < 2000; k++) { s.stats.kills = k; assert.strictEqual(C.rollRare(s, 5, 3), null); assert.strictEqual(C.rollRare(s, 20, 10), null); }
  let found = {}, n = 0;
  for (let k = 0; k < 5000; k++) { s.stats.kills = k; const r = C.rollRare(s, 20, 3); if (r) { found[r.id] = 1; n++; } }
  assert.ok(found.gold && found.crystal);
  assert.ok(n > 5000 * 0.01 && n < 5000 * 0.08);        // около шанса биома (3%)
  // находим ход, где появится золотой гоблин, и проверяем награду
  let k = 0; do { s.stats.kills = k++; } while (!(C.rollRare(s, 20, 3) || {}).id || C.rollRare(s, 20, 3).id !== 'gold');
  const t = C.newState(NOCRIT); Object.assign(t, { floor: 20, maxFloor: 20, enemyIndex: 3, tapLevel: 1e12 }); t.stats.kills = k - 1;
  C.tick(t, 0); t.enemy.alive = false; t.respawn = 0; C.tick(t, 0.001);
  assert.strictEqual(t.enemy.rare, 'gold');
  assert.strictEqual(t.enemy.maxHp, Math.ceil(C.enemyMaxHp(20, false) * C.rareDef('gold').hp));
  const ev = killCurrent(t);
  assert.strictEqual(ev.find(e => e.type === 'kill').gold, C.killGold(20, false) * C.rareDef('gold').gold);
});

test('кристальный ёж даёт осколки', () => {
  const s = C.newState(NOCRIT); s.tapLevel = 1e12;
  Object.assign(s, { floor: 30, maxFloor: 30, enemyIndex: 4 });
  let k = 0; do { s.stats.kills = k++; } while (((C.rollRare(s, 30, 4) || {}).id) !== 'crystal');
  s.enemy.alive = false; s.respawn = 0; C.tick(s, 0.001);
  assert.strictEqual(s.enemy.rare, 'crystal');
  const ev = killCurrent(s);
  assert.strictEqual(s.materials.shard, C.shardsForBoss(30));
  assert.ok(ev.some(e => e.type === 'materials' && e.rare));
});

test('фазы босса: обычный — 2 фазы, финальный — 3; на смене фазы короткая уязвимость', () => {
  const s = C.newState(NOCRIT);
  s.floor = s.maxFloor = 12; s.enemyIndex = CFG.enemiesPerFloor; C.challengeBoss(s);
  const e = s.enemy;
  e.hp = e.maxHp * 0.6; C.tap(s);
  assert.strictEqual(e.phase, 1); assert.strictEqual(e.vuln, 0);
  e.hp = e.maxHp * 0.5 + C.tapDamage(s) * 0.5;
  const ev = C.tap(s);
  assert.ok(ev.some(x => x.type === 'phase' && x.phase === 2 && x.of === 2));
  assert.strictEqual(e.vuln, CFG.bossPhases.vulnSec);
  const before = e.hp; C.tap(s);
  assert.ok(Math.abs((before - e.hp) - C.tapDamage(s) * CFG.bossPhases.vulnMult) < 1e-6);
  C.tick(s, CFG.bossPhases.vulnSec + 0.1);
  assert.strictEqual(e.vuln, 0);
  // финальный: две смены фаз, можно обе за один удар
  s.floor = s.maxFloor = 50; C.challengeBoss(s);
  s.enemy.hp = s.enemy.maxHp * 0.2; C.tap(s);
  assert.strictEqual(s.enemy.phase, 3);
});

// ---------- дерево душ (0.14) ----------
test('дерево душ: ветви открываются числом ритуалов, узлы — по порядку', () => {
  const s = C.newState(NOCRIT); s.souls = 1e6;
  assert.strictEqual(C.buyTreeNode(s, 'fury'), false);            // 0 ритуалов
  s.rituals = 1;
  assert.strictEqual(C.treeNodeOpen(s, 'spirit'), false);         // сначала предыдущий узел
  assert.strictEqual(C.buyTreeNode(s, 'fury'), true);
  assert.strictEqual(C.buyTreeNode(s, 'spirit'), true);
  assert.strictEqual(C.buyTreeNode(s, 'greed'), false);           // экономика — со 2-го ритуала
  s.rituals = 2; assert.strictEqual(C.buyTreeNode(s, 'greed'), true);
  assert.strictEqual(C.buyTreeNode(s, 'echo'), false);
  s.rituals = 3; assert.strictEqual(C.buyTreeNode(s, 'echo'), true);
});

test('дерево душ: цена растёт, есть предел уровня, трата уменьшает души', () => {
  const s = C.newState(NOCRIT); s.rituals = 1; s.souls = 1e9;
  const c1 = C.treeCost(s, 'fury'); C.buyTreeNode(s, 'fury');
  assert.ok(C.treeCost(s, 'fury') > c1);
  assert.strictEqual(s.souls, 1e9 - c1);
  const max = C.treeDef('fury').max;
  while (C.buyTreeNode(s, 'fury'));
  assert.strictEqual(C.treeLevel(s, 'fury'), max);
  assert.strictEqual(C.treeCost(s, 'fury'), null);
  s.souls = 0; assert.strictEqual(C.buyTreeNode(s, 'spirit'), false);
});

test('дерево душ без критов', () => {
  for (const b of CFG.soulTree) for (const n of b.nodes) assert.ok(!/crit/i.test(n.kind));
  const s = C.newState(NOCRIT); s.rituals = 3;
  for (const b of CFG.soulTree) for (const n of b.nodes) s.tree[n.id] = n.max;
  const t = C.newState(NOCRIT);
  assert.strictEqual(C.critChance(s), C.critChance(t)); assert.strictEqual(C.critMult(s), C.critMult(t));
});

test('эффекты дерева: урон героя, союзников, боссы, золото, осколки, время на босса, перезарядка', () => {
  const s = C.newState(NOCRIT), t = C.newState(NOCRIT);
  s.tree = { fury: 2, spirit: 1, heads: 2, greed: 4, shards: 5, grip: 2, haste: 4 };
  assert.ok(Math.abs(C.permMult(s, 'tap') / C.permMult(t, 'tap') - 1.6) < 1e-9);
  assert.ok(Math.abs(C.permMult(s, 'ally') / C.permMult(t, 'ally') - 1.3) < 1e-9);
  assert.ok(Math.abs(C.goldMult(s) / C.goldMult(t) - 2) < 1e-9);
  assert.strictEqual(C.bossMaterials(s, 101).shard, Math.ceil(C.shardsForBoss(101) * 2));
  // урон по боссу +100%
  for (const x of [s, t]) { x.floor = x.maxFloor = 12; C.challengeBoss(x); x.enemy.hp = x.enemy.maxHp = 1e15; }
  const ds = C.tap(s).find(e => e.type === 'hit').dmg, dt = C.tap(t).find(e => e.type === 'hit').dmg;
  assert.ok(Math.abs(ds / dt - 1.6 * 2) < 1e-9);
  // 0.145: «Хватка» — +1 с на босса за уровень
  assert.strictEqual(C.bossTime(s) - C.bossTime(t), 2);
  // перезарядка способности короче
  s.maxFloor = 20; C.useAbility(s, 'flurry');
  assert.ok(Math.abs(s.abilities.flurry.cd - CFG.abilities[0].cooldown * 0.8) < 1e-9);
});

test('эффекты дерева: души за ритуал, наследие золота, офлайн, редкие враги', () => {
  const a = C.newState(NOCRIT), b = C.newState(NOCRIT);
  for (const x of [a, b]) { x.floor = x.maxFloor = 450; x.bestFloor = 450; }
  b.tree = { echo: 5, legacy: 2, dream: 3, luck: 5 };
  assert.strictEqual(C.ritualSouls(b), Math.floor(C.ritualSouls(a) * 1.5));
  b.allies.shorokh.level = 10; a.allies.shorokh.level = 10;
  assert.ok(Math.abs(C.offlineDps(b) / C.offlineDps(a) - 1.6) < 1e-9);
  const r = C.ritual(b);
  assert.strictEqual(b.gold, Math.ceil(100 * C.killGold(r.start, true)));
  let na = 0, nb = 0;
  for (let k = 0; k < 4000; k++) { a.stats.kills = b.stats.kills = k; if (C.rollRare(a, 20, 3)) na++; if (C.rollRare(b, 20, 3)) nb++; }
  assert.ok(nb > na * 1.6);
});

test('сохранение дерева душ и миграция с 0.13', () => {
  const s = C.newState(NOCRIT); s.tree = { fury: 3, greed: 1 };
  const t = C.deserialize(C.serialize(s));
  assert.deepStrictEqual(t.tree, { fury: 3, greed: 1 });
  const old = JSON.parse(C.serialize(s)); old.v = 7; delete old.tree;
  assert.deepStrictEqual(C.deserialize(JSON.stringify(old)).tree, {});
  const bad = JSON.parse(C.serialize(s)); bad.tree.fury = 999;
  assert.strictEqual(C.deserialize(JSON.stringify(bad)), null);
});

// ---------- руны и тотемы (0.15) ----------
test('руны: создание за осколки, улучшение, действует лучшая руна вида', () => {
  const s = C.newState({ rng: () => 0 });                    // всегда первый вид — Руна мощи
  const R = CFG.runes;
  assert.strictEqual(C.createRune(s), null);
  s.materials.shard = 10000;
  const a = C.createRune(s), b = C.createRune(s);
  assert.strictEqual(a.type, 'might'); assert.strictEqual(a.tier, 0);
  assert.strictEqual(s.materials.shard, 10000 - 2 * R.createCost);
  const base = C.permMult(C.newState(), 'tap');
  assert.ok(Math.abs(C.permMult(s, 'tap') / base - (1 + R.kinds[0].base)) < 1e-9);   // две руны — действует одна
  assert.strictEqual(C.upgradeRune(s, a.id), true);
  assert.strictEqual(C.bestRune(s, 'might'), a);
  assert.ok(Math.abs(C.runePower(s, 'allDmg') - R.kinds[0].base * (1 + R.perLevel)) < 1e-9);
  a.lvl = R.maxLevel; assert.strictEqual(C.runeUpCost(a), null); assert.strictEqual(C.upgradeRune(s, a.id), false);
});

test('руны: слияние 3 → 1 следующей редкости, берёт слабейшие', () => {
  const s = C.newState({ rng: () => 0 }); s.materials.shard = 1e6;
  const r = [C.createRune(s), C.createRune(s), C.createRune(s), C.createRune(s)];
  r[0].lvl = 5;
  assert.strictEqual(C.mergeable(s, 'might', 1), false);
  const m = C.mergeRunes(s, 'might', 0);
  assert.strictEqual(m.tier, 1); assert.strictEqual(m.lvl, 0);
  assert.strictEqual(s.runes.length, 2);
  assert.ok(s.runes.includes(r[0]));                          // прокачанная осталась
  assert.strictEqual(C.mergeRunes(s, 'might', 0), null);
  assert.ok(C.runeValue(m) === CFG.runes.kinds[0].base * CFG.runes.tierPower);
  // высшую редкость дальше не слить
  s.runes = [0, 1, 2].map(i => ({ id: 100 + i, type: 'might', tier: CFG.rarities.length - 1, lvl: 0 }));
  assert.strictEqual(C.mergeable(s, 'might', CFG.rarities.length - 1), false);
});

test('руны без критов; руны золота, осколков и боссов работают', () => {
  for (const k of CFG.runes.kinds) assert.ok(!/crit/i.test(k.kind));
  const s = C.newState(NOCRIT), t = C.newState(NOCRIT);
  s.runes = [{ id: 1, type: 'wealth', tier: 1, lvl: 0 }, { id: 2, type: 'stone', tier: 2, lvl: 0 }, { id: 3, type: 'hunt', tier: 0, lvl: 0 }];
  assert.strictEqual(C.critChance(s), C.critChance(t));
  assert.ok(Math.abs(C.goldMult(s) - 1.2) < 1e-9);
  assert.ok(Math.abs(C.shardMult(s) - 1.2) < 1e-9);
  assert.ok(Math.abs(C.bossDmgMult(s) - 1.15) < 1e-9);
});

test('тотемы: за первое прохождение финального босса биома, общий DPS и бонус коллекции', () => {
  const s = C.newState(NOCRIT); s.tapLevel = 1e12;
  s.floor = s.maxFloor = 50; s.enemyIndex = CFG.enemiesPerFloor; C.challengeBoss(s);
  const ev = killCurrent(s);
  assert.ok(ev.some(e => e.type === 'totem' && e.id === 'crypt'));
  assert.strictEqual(s.totems.crypt, 1);
  assert.ok(Math.abs(C.totemMult(s) - 1.1) < 1e-9);
  // повтор не даёт второй тотем
  respawn(s); C.goToFloor(s, 50); s.enemyIndex = CFG.enemiesPerFloor; C.challengeBoss(s); killCurrent(s);
  assert.strictEqual(C.totemCount(s), 1);
  // коллекция: 5 тотемов — ×1.25
  for (const b of CFG.biomes.slice(0, 5)) s.totems[b.id] = 1;
  assert.ok(Math.abs(C.totemMult(s) - 1.5 * 1.25) < 1e-9);
});

test('тотемы: улучшение за осколки, каждый 5-й уровень — ещё сердце', () => {
  const s = C.newState(NOCRIT); s.totems = { crypt: 1 }; s.materials = { shard: 1e6, heart: 0 };
  assert.strictEqual(C.upgradeTotem(s, 'ash'), false);        // нет тотема
  for (let i = 0; i < 3; i++) assert.ok(C.upgradeTotem(s, 'crypt'));
  assert.strictEqual(s.totems.crypt, 4);
  const tc = C.totemUpCost(s, 'crypt');                           // 5-й уровень: прежнее сердце — осколками (0.51)
  assert.strictEqual(tc.hearts, 0);
  assert.strictEqual(tc.shards, Math.ceil(CFG.totems.upShards * Math.pow(CFG.totems.upGrowth, 3)) + CFG.materials.heartRecipe);
  s.materials.shard = tc.shards - 1; assert.strictEqual(C.upgradeTotem(s, 'crypt'), false);
  s.materials.shard = tc.shards; assert.ok(C.upgradeTotem(s, 'crypt'));
  s.totems.crypt = CFG.totems.maxLevel; assert.strictEqual(C.totemUpCost(s, 'crypt'), null);
});

test('сохранение рун и тотемов, миграция с 0.14 выдаёт тотемы за пройденных финальных боссов', () => {
  const s = C.newState(NOCRIT);
  s.runes = [{ id: 4, type: 'host', tier: 2, lvl: 3 }]; s.runeSeq = 5; s.totems = { crypt: 3 };
  const t = C.deserialize(C.serialize(s));
  assert.deepStrictEqual(t.runes, s.runes); assert.strictEqual(t.runeSeq, 5); assert.deepStrictEqual(t.totems, { crypt: 3 });
  const old = JSON.parse(C.serialize(s)); old.v = 8; delete old.runes; delete old.runeSeq; delete old.totems; old.heartFloor = 160;
  const m = C.deserialize(JSON.stringify(old));
  assert.deepStrictEqual(m.totems, { crypt: 1, ash: 1, shade: 1 });
  assert.deepStrictEqual(m.runes, []);
  const bad = JSON.parse(C.serialize(s)); bad.runes[0].tier = 99;
  assert.strictEqual(C.deserialize(JSON.stringify(bad)), null);
});

// ---------- доп. PvE (0.16) ----------
function strong(s) { s.tapLevel = 1e15; }
function clearMode(s) {
  let ev = [];
  for (let i = 0; i < 1000 && s.mode; i++) { if (s.enemy.alive) ev = ev.concat(C.tap(s)); else ev = ev.concat(respawn(s)); }
  return ev;
}

test('ежедневные подземелья: попытки в день, уровень до рекорда/10, фиксированная награда', () => {
  const s = C.newState(NOCRIT); s.bestFloor = s.maxFloor = 120; strong(s);
  assert.strictEqual(C.maxDungeonTier(s), 12);
  assert.strictEqual(C.enterMode(s, 'dungeon', { id: 'vault', tier: 13 }, '2026-11-04'), null);
  const gold0 = s.gold, exp = C.dungeonReward(s, 'vault', 12).gold;
  assert.ok(C.enterMode(s, 'dungeon', { id: 'vault', tier: 12 }, '2026-11-04'));
  assert.strictEqual(s.floor, 1);                              // Башня не трогается
  const ev = clearMode(s);
  const end = ev.find(e => e.type === 'modeEnd');
  assert.ok(end.win); assert.strictEqual(end.reward.gold, exp);
  assert.strictEqual(s.gold, gold0 + exp);
  assert.strictEqual(s.mode, null); assert.strictEqual(s.floor, 1);
  assert.ok(C.enterMode(s, 'dungeon', { id: 'vault', tier: 1 }, '2026-11-04')); clearMode(s);
  assert.strictEqual(C.attemptsLeft(s, 'vault'), 0);
  assert.strictEqual(C.enterMode(s, 'dungeon', { id: 'vault', tier: 1 }, '2026-11-04'), null);
  assert.ok(C.enterMode(s, 'dungeon', { id: 'vault', tier: 1 }, '2026-11-05'));   // новый день
});

test('подземелье: время вышло — без награды, попытка потрачена', () => {
  const s = C.newState(NOCRIT); s.bestFloor = 100;
  C.enterMode(s, 'dungeon', { id: 'mine', tier: 10 }, 'd');
  const ev = C.tick(s, CFG.pve.dungeonTime + 1);
  const end = ev.find(e => e.type === 'modeEnd');
  assert.strictEqual(end.win, false); assert.strictEqual(s.materials.shard, 0);
  assert.strictEqual(C.attemptsLeft(s, 'mine'), CFG.pve.dailyAttempts - 1);
});

test('рунная кузня и шахта: руна редкости по уровню, осколки', () => {
  const s = C.newState({ rng: () => 0 }); s.bestFloor = 400; strong(s);
  C.enterMode(s, 'dungeon', { id: 'forge', tier: 25 }, 'd'); clearMode(s);
  assert.strictEqual(s.runes.length, 1); assert.strictEqual(s.runes[0].tier, 2);
  C.enterMode(s, 'dungeon', { id: 'mine', tier: 5 }, 'd'); clearMode(s);
  assert.strictEqual(s.materials.shard, C.shardsForBoss(50) * CFG.pve.mineShards);
});

test('бесконечное подземелье: волны, контрольный босс с таймером, эссенция, рекорд и билет за новый рубеж', () => {
  const s = C.newState(NOCRIT); strong(s);
  assert.ok(C.enterMode(s, 'endless', {}, 'd'));
  for (let i = 0; i < 25; i++) { killCurrent(s); respawn(s); }
  assert.strictEqual(s.mode.step, 26);
  assert.strictEqual(s.pve.endlessBest, 25);
  assert.ok(s.essence > 0); assert.strictEqual(s.tickets, 2);
  s.tapLevel = 1;
  for (let i = 0; i < 4; i++) { killCurrent(s); respawn(s); }    // до 30-й волны
  // слабый удар: контрольный босс 30 не умирает, таймер
  const ev = C.tick(s, CFG.pve.endless.bossTime + 1);
  const end = ev.find(e => e.type === 'modeEnd');
  assert.ok(end); assert.strictEqual(end.reward.best, s.pve.endlessBest);
  assert.strictEqual(s.mode, null);
  // повторный забег не даёт билеты за старые рубежи
  strong(s); C.enterMode(s, 'endless', {}, 'd');
  const t0 = s.tickets;
  for (let i = 0; i < 20; i++) { killCurrent(s); respawn(s); }
  assert.strictEqual(s.tickets, t0);
});

test('личные боссы: только с полученным тотемом, сложность, награда — сердца и осколки', () => {
  const s = C.newState(NOCRIT); strong(s);
  assert.strictEqual(C.enterMode(s, 'personal', { id: 'crypt', diff: 'normal' }, 'd'), null);
  s.totems.crypt = 1;
  assert.deepStrictEqual(C.personalBosses(s).map(b => b.id), ['crypt']);
  C.enterMode(s, 'personal', { id: 'crypt', diff: 'night' }, 'd');
  assert.strictEqual(s.enemy.maxHp, Math.ceil(C.enemyMaxHp(50, true) * 25));
  assert.ok(s.enemy.final);
  const exp = C.personalReward(s, 50, 'night');
  clearMode(s);
  assert.strictEqual(s.materials.heart, exp.heart); assert.strictEqual(s.materials.shard, exp.shard);
  assert.strictEqual(C.attemptsLeft(s, 'personal'), CFG.pve.personal.attempts - 1);
});

test('в режиме нельзя менять этаж и звать босса; выход и офлайн возвращают в Башню', () => {
  const s = C.newState(NOCRIT); s.bestFloor = 50; s.maxFloor = 5; s.floor = 3;
  C.enterMode(s, 'dungeon', { id: 'vault', tier: 2 }, 'd');
  assert.deepStrictEqual(C.goToFloor(s, 4), []); assert.deepStrictEqual(C.challengeBoss(s), []);
  assert.strictEqual(C.enterMode(s, 'endless', {}, 'd'), null);   // уже в режиме
  C.leaveMode(s); assert.strictEqual(s.mode, null); assert.strictEqual(s.floor, 3);
  C.enterMode(s, 'endless', {}, 'd'); C.offlineProgress(s, 3600); assert.strictEqual(s.mode, null);
});

test('сохранение PvE и миграция с 0.15', () => {
  const s = C.newState(NOCRIT); s.pve = { day: '2026-11-04', used: { vault: 1, endless: 2 }, endlessBest: 33 };
  const t = C.deserialize(C.serialize(s));
  assert.deepStrictEqual(t.pve, s.pve);
  const old = JSON.parse(C.serialize(s)); old.v = 9; delete old.pve;
  assert.deepStrictEqual(C.deserialize(JSON.stringify(old)).pve, { day: '', used: {}, endlessBest: 0 });
});

// ---------- задания (0.17) ----------
test('ежедневные задания: прогресс с начала дня, награда один раз, сброс в новый день', () => {
  const s = C.newState(NOCRIT); s.tapLevel = 1e9;
  for (let i = 0; i < 5; i++) { killCurrent(s); respawn(s); }       // до начала дня — не считается
  C.questsReset(s, '2026-11-04', '2026-W45');
  assert.strictEqual(C.questProgress(s, 'd_kill'), 0);
  s.counters.kill += 499; assert.strictEqual(C.questClaimable(s, 'd_kill'), false);
  killCurrent(s);
  assert.strictEqual(C.questClaimable(s, 'd_kill'), true);
  const t0 = s.tickets;
  assert.deepStrictEqual(C.claimQuest(s, 'd_kill'), { tickets: 1 });
  assert.strictEqual(s.tickets, t0 + 1);
  assert.strictEqual(C.claimQuest(s, 'd_kill'), null);              // второй раз нельзя
  C.questsReset(s, '2026-11-04', '2026-W45');                        // тот же день — ничего
  assert.strictEqual(C.claimQuest(s, 'd_kill'), null);
  C.questsReset(s, '2026-11-05', '2026-W45');
  assert.strictEqual(C.questProgress(s, 'd_kill'), 0);
  assert.strictEqual(C.questProgress(s, 'w_kill') > 0, true);       // неделя продолжается
});

test('задание «все задания дня» и «Забрать всё»', () => {
  const s = C.newState(NOCRIT); C.questsReset(s, 'd1', 'w1');
  for (const q of CFG.quests.daily) if (q.key !== 'allDaily') s.counters[q.key] = (s.counters[q.key] || 0) + q.goal;
  assert.strictEqual(C.questDone(s, 'd_all'), true);
  const r = C.claimAll(s);
  assert.ok(r.count >= CFG.quests.daily.length);
  assert.ok(!r.reward.shard && !r.reward.essence && !r.reward.heart, '0.116: только билеты и 💎'); assert.ok(r.reward.tickets > 0 && r.reward.crystals > 0);
  assert.strictEqual(C.claimAll(s), null);
});

test('счётчики: призыв, звезда, руна, подземелье, ритуал', () => {
  const s = C.newState({ rng: () => 0 }); s.tickets = 3; s.materials.shard = 100;
  C.summon(s, 3); assert.strictEqual(s.counters.summon, 3);
  s.heroes.shorokh.copies = 5; C.starUp(s, 'shorokh'); assert.strictEqual(s.counters.star, 1);
  C.createRune(s); assert.strictEqual(s.counters.rune, 1);
  s.bestFloor = 20; s.tapLevel = 1e15; C.enterMode(s, 'dungeon', { id: 'vault', tier: 1 }, 'd');
  for (let i = 0; i < 100 && s.mode; i++) { if (s.enemy.alive) C.tap(s); else respawn(s); }
  assert.strictEqual(s.counters.dungeon, 1);
  s.floor = s.maxFloor = 400; C.ritual(s); assert.strictEqual(s.counters.ritual, 1);
});

test('вводные задания: по значению (этаж, отряд) и по счётчикам за всю игру', () => {
  const s = C.newState(NOCRIT);
  assert.strictEqual(C.questDone(s, 'i_f10'), false);
  s.bestFloor = 12; assert.strictEqual(C.questDone(s, 'i_f10'), true);
  for (const id of s.squad) s.allies[id].level = 1;
  assert.strictEqual(C.questDone(s, 'i_hire'), true);
  C.claimQuest(s, 'i_f10');
  C.questsReset(s, 'другой день', 'другая неделя');
  assert.strictEqual(C.questClaimable(s, 'i_f10'), false);           // вводные не сбрасываются
});

test('сохранение заданий и миграция с 0.16', () => {
  const s = C.newState(NOCRIT); s.counters = { kill: 10, summon: 2 };
  C.questsReset(s, 'd', 'w'); s.counters.kill = 600; C.claimQuest(s, 'd_kill');
  const t = C.deserialize(C.serialize(s));
  assert.deepStrictEqual(t.counters, s.counters);
  assert.strictEqual(t.quests.claimed.d_kill, true); assert.strictEqual(C.questProgress(t, 'd_kill'), C.questProgress(s, 'd_kill'));
  const old = JSON.parse(C.serialize(s)); old.v = 10; delete old.counters; delete old.quests; old.stats.kills = 77;
  const m = C.deserialize(JSON.stringify(old));
  assert.strictEqual(m.counters.kill, 77); assert.deepStrictEqual(m.quests.claimed, {});
});

// ---------- ранги и потолки (0.19) ----------
test('потолок: 1000 на старте (0.50), 15000 на пределе, растёт с каждой ступенью', () => {
  assert.strictEqual(C.capAt(0), CFG.ranks.capMin); assert.strictEqual(CFG.ranks.capMin, 1000); assert.strictEqual(C.capAt(C.maxSteps()), 15000);
  assert.strictEqual(C.maxSteps(), 100);
  for (let k = 1; k <= 100; k++) assert.ok(C.capAt(k) > C.capAt(k - 1));
  assert.deepStrictEqual(C.rankLabel(0), { rank: 1, sub: 0, max: false });
  assert.deepStrictEqual(C.rankLabel(37), { rank: 4, sub: 7, max: false });
  assert.deepStrictEqual(C.rankLabel(100), { rank: 10, sub: 10, max: true });
});

test('покупка уровней упирается в потолок, MAX и ×100 тоже', () => {
  const s = C.newState(NOCRIT); s.gold = 1e300;
  s.tapLevel = CFG.ranks.capMin - 10;
  assert.ok(C.buyTap(s, 100)); assert.strictEqual(s.tapLevel, CFG.ranks.capMin);
  assert.strictEqual(C.buyTap(s, 1), false); assert.strictEqual(C.buyTap(s, 'max'), false);
  s.allies.shorokh.level = 0;
  assert.ok(C.buyAlly(s, 'shorokh', 'max')); assert.strictEqual(s.allies.shorokh.level, CFG.ranks.capMin);
});

test('ранг героя: подранг за осколки, новый ранг — ещё сердца, потолок растёт', () => {
  const s = C.newState(NOCRIT);
  assert.strictEqual(C.rankUp(s, 'hero'), false);
  s.materials = { shard: 1e9, heart: 0 };
  for (let i = 0; i < 9; i++) assert.ok(C.rankUp(s, 'hero'));
  assert.strictEqual(C.tapCap(s), C.capAt(9));
  const c = C.rankCost(s, 'hero');
  assert.strictEqual(c.newRank, 2); assert.strictEqual(c.hearts, 0);
  assert.strictEqual(c.shards, Math.ceil(CFG.ranks.shards * Math.pow(CFG.ranks.growth, 9)) + 2 * CFG.materials.heartRecipe);   // новый ранг: +2 «сердца» осколками
  s.materials.shard = c.shards - 1; assert.strictEqual(C.rankUp(s, 'hero'), false);
  s.materials.shard = c.shards; assert.ok(C.rankUp(s, 'hero'));
  assert.deepStrictEqual(C.rankLabel(s.heroRank), { rank: 2, sub: 0, max: false });
  s.heroRank = 100; assert.strictEqual(C.rankCost(s, 'hero'), null);
});

test('ранг союзника: цена по редкости, ранги IV, VII, X требуют эволюцию I, II, III', () => {
  const s = C.newState(NOCRIT); s.materials = { shard: 1e12, heart: 1e6 };
  s.heroes.veil.unlocked = true; assert.ok(C.rankCost(s, 'veil').shards > C.rankCost(s, 'shorokh').shards);
  s.heroes.shorokh.rank = 29;
  assert.strictEqual(C.rankCost(s, 'shorokh').needEvo, 1);
  assert.strictEqual(C.rankUp(s, 'shorokh'), false);
  s.heroes.shorokh.evo = 1; assert.ok(C.rankUp(s, 'shorokh'));
  assert.strictEqual(C.allyCap(s, 'shorokh'), C.capAt(30));
  s.heroes.shorokh.rank = 59; assert.strictEqual(C.rankUp(s, 'shorokh'), false);
  s.heroes.shorokh.evo = 2; assert.ok(C.rankUp(s, 'shorokh'));
  s.heroes.shorokh.rank = 89; assert.strictEqual(C.rankUp(s, 'shorokh'), false);
  s.heroes.shorokh.evo = 3; assert.ok(C.rankUp(s, 'shorokh'));
  assert.strictEqual(C.rankUp(s, 'azrael'), false);                // не открыт
});

test('ранги переживают ритуал и сохраняются; миграция с 0.18', () => {
  const s = C.newState(NOCRIT); s.heroRank = 12; s.heroes.shorokh.rank = 7;
  s.floor = s.maxFloor = 400; C.ritual(s);
  assert.strictEqual(s.heroRank, 12); assert.strictEqual(s.heroes.shorokh.rank, 7);
  const t = C.deserialize(C.serialize(s));
  assert.strictEqual(t.heroRank, 12); assert.strictEqual(t.heroes.shorokh.rank, 7);
  const old = JSON.parse(C.serialize(s)); old.v = 11; delete old.heroRank; for (const id in old.heroes) delete old.heroes[id].rank;
  const m = C.deserialize(JSON.stringify(old));
  assert.strictEqual(m.heroRank, 0); assert.strictEqual(m.heroes.shorokh.rank, 0);
});

// ---------- сезон и боевой пропуск (0.21) ----------
test('сезон: 28 дней по дате, герой и название чередуются', () => {
  const a = C.seasonInfo('2026-11-02'), b = C.seasonInfo('2026-11-29'), c2 = C.seasonInfo('2026-11-30');
  assert.deepStrictEqual([a.n, a.day, a.daysLeft], [1, 1, 27]);
  assert.deepStrictEqual([b.n, b.day], [1, 28]);
  assert.strictEqual(c2.n, 2); assert.notStrictEqual(c2.hero, a.hero); assert.notStrictEqual(c2.name, a.name);
  assert.strictEqual(C.seasonInfo('2026-12-28').hero, a.hero);   // герой возвращается
});

test('сезонные герои не выпадают в портале', () => {
  const s = C.newState({ rng: () => 0.999 }); s.tickets = 500; s.pity = { a: 0, s: 89 };
  C.summon(s, 500);
  assert.strictEqual(s.heroes.carna.unlocked, false); assert.strictEqual(s.heroes.yuki.unlocked, false);
});

test('пропуск: опыт за задания, уровни, бесплатная и премиум дорожки', () => {
  const s = C.newState(NOCRIT); const day = '2026-11-04';
  C.seasonReset(s, day); C.questsReset(s, day, 'w');
  s.counters.kill = (s.counters.kill || 0) + 600;
  C.claimQuest(s, 'd_kill');
  assert.strictEqual(s.season.xp, CFG.season.questXp.daily);
  s.season.xp = 5 * CFG.season.xpPerLevel;
  assert.strictEqual(C.passLevel(s), 5);
  const t0 = s.tickets;
  const r = C.claimPass(s, 5, 'free');
  assert.strictEqual(r.heart, CFG.season.milestoneFree.heart);    // 5-й уровень — веха
  assert.strictEqual(s.tickets, t0 + r.tickets);
  assert.strictEqual(C.claimPass(s, 5, 'free'), null);
  assert.strictEqual(C.claimPass(s, 6, 'free'), null);            // уровень не достигнут
  assert.strictEqual(C.claimPass(s, 1, 'paid'), null);            // без премиума
  C.setPremium(s, true);
  assert.ok(C.claimPass(s, 1, 'paid').tickets > CFG.season.free.tickets);
  const all = C.claimPassAll(s);
  assert.strictEqual(all.count, 4 + 4);                           // free 1–4, paid 2–5
});

test('догон: раз в день и только при отставании', () => {
  const s = C.newState(NOCRIT);
  C.seasonReset(s, '2026-11-02');
  s.season.xp = 5 * CFG.season.xpPerLevel;                           // впереди графика — догона нет
  assert.strictEqual(C.catchupAvailable(s, '2026-11-02'), false);
  s.season.xp = 0;
  C.seasonReset(s, '2026-11-20');
  assert.ok(C.expectedPassLevel('2026-11-20') > 0);
  assert.ok(C.useCatchup(s, '2026-11-20'));
  assert.strictEqual(s.season.xp, CFG.season.catchupXp);
  assert.strictEqual(C.useCatchup(s, '2026-11-20'), false);
  assert.ok(C.useCatchup(s, '2026-11-21'));
});

test('тропа сезона: линейные задания, жетоны, финал открывает сезонного героя', () => {
  const s = C.newState(NOCRIT); const day = '2026-11-04';
  const info = C.seasonReset(s, day);
  for (let i = 0; i < CFG.season.trail.length; i++) {
    const t = C.trailStep(s);
    assert.strictEqual(C.claimTrail(s, day), null);
    s.counters[t.key] = (s.counters[t.key] || 0) + t.goal;
    const r = C.claimTrail(s, day);
    assert.strictEqual(r.tokens, CFG.season.trailTokens);
    if (i === CFG.season.trail.length - 1) assert.strictEqual(r.hero, info.hero);
  }
  assert.strictEqual(C.trailStep(s), null);
  assert.ok(s.heroes[info.hero].unlocked);
  assert.strictEqual(s.season.tokens, CFG.season.trailTokens * CFG.season.trail.length);
});

test('обмен жетонов на сезонного героя, потом на копии; новый сезон сбрасывает пропуск, герой остаётся', () => {
  const s = C.newState(NOCRIT); const day = '2026-11-04';
  const info = C.seasonReset(s, day);
  s.season.tokens = CFG.season.heroCost - 1;
  assert.strictEqual(C.buySeasonHero(s, day), null);
  s.season.tokens = CFG.season.heroCost + CFG.season.copyCost;
  assert.strictEqual(C.buySeasonHero(s, day), info.hero);
  assert.strictEqual(C.seasonHeroCost(s, day), CFG.season.copyCost);
  C.buySeasonHero(s, day); assert.strictEqual(s.heroes[info.hero].copies, 1);
  s.season.xp = 9999;
  C.seasonReset(s, '2026-12-01');
  assert.strictEqual(s.season.xp, 0); assert.strictEqual(s.season.tokens, 0);
  assert.ok(s.heroes[info.hero].unlocked);
});

test('сохранение сезона и миграция с 0.20', () => {
  const s = C.newState(NOCRIT); C.seasonReset(s, '2026-11-04');
  s.season.xp = 3200; s.season.tokens = 77; s.season.premium = true; s.season.free = { 1: true, 2: true }; s.season.trail = 3;
  const t = C.deserialize(C.serialize(s));
  assert.strictEqual(t.season.xp, 3200); assert.strictEqual(t.season.tokens, 77); assert.ok(t.season.premium);
  assert.deepStrictEqual(t.season.free, { 1: true, 2: true }); assert.strictEqual(t.season.trail, 3);
  const old = JSON.parse(C.serialize(s)); old.v = 12; delete old.season;
  assert.strictEqual(C.deserialize(JSON.stringify(old)).season.n, 0);
});

test('Башня бесконечна: после этажа 100000 идёт 100001, HP растёт', () => {
  const s = C.newState(NOCRIT);
  assert.strictEqual(CFG.maxFloor, Infinity);
  s.floor = s.maxFloor = s.bestFloor = 100000; s.enemyIndex = CFG.enemiesPerFloor; C.challengeBoss(s);
  s.enemy.hp = 1;
  const ev = C.tap(s);
  assert.ok(!ev.some(e => e.type === 'top'));
  assert.strictEqual(s.floor, 100001); assert.strictEqual(s.maxFloor, 100001);
  assert.ok(C.B.gt(C.enemyMaxHp(1e6, false), C.enemyMaxHp(100001, false)));
});

// ---------- события и центр наград (0.23) ----------
test('событие недели: меняется по неделям по кругу, бонус действует', () => {
  const ids = ['w2026-11-02', 'w2026-11-09', 'w2026-11-16', 'w2026-11-23', 'w2026-11-30'].map(w => C.eventFor(w).id);
  assert.deepStrictEqual(ids, ['gold', 'rare', 'boss', 'moon', 'gold']);
  const s = C.newState(NOCRIT), t = C.newState(NOCRIT);
  C.eventReset(s, 'w2026-11-02');
  assert.ok(Math.abs(C.goldMult(s) / C.goldMult(t) - 2) < 1e-9);
  C.eventReset(s, 'w2026-11-30'); assert.strictEqual(s.event.points, 0);
  C.eventReset(s, 'w2026-11-16');
  assert.ok(Math.abs(C.bossDmgMult(s) - 1.5) < 1e-9);
});

test('очки события за врагов и боссов; вехи автоматически уходят в «Награды»', () => {
  const s = C.newState(NOCRIT); s.tapLevel = 1e12;
  C.eventReset(s, 'w2026-11-02');
  killCurrent(s);
  assert.strictEqual(s.event.points, CFG.events.pointsKill);
  s.event.points = CFG.events.milestones[0].at - 1; respawn(s); killCurrent(s);
  assert.strictEqual(s.inbox.length, 1);
  const t0 = s.tickets;
  const r = C.claimInbox(s, s.inbox[0].id);
  assert.strictEqual(s.tickets, t0 + r.tickets); assert.strictEqual(s.inbox.length, 0);
});

test('тематическое подземелье: условие «только тапы» — союзники не бьют; награда — фонари', () => {
  const s = C.newState(NOCRIT); s.bestFloor = 100; s.allies.shorokh.level = 500;
  C.eventReset(s, 'w2026-11-02');                       // Логово жадности: tapOnly
  assert.ok(C.enterMode(s, 'event', { tier: 5 }, 'd'));
  const hp = s.enemy.hp;
  C.tick(s, 2);
  assert.strictEqual(s.enemy.hp, hp);                   // союзник не нанёс урона
  s.tapLevel = 1e15;
  for (let i = 0; i < 100 && s.mode; i++) { if (s.enemy.alive) C.tap(s); else respawn(s); }
  assert.strictEqual(s.event.lanterns, C.eventDungeonReward(5));
  assert.strictEqual(C.attemptsLeft(s, 'event'), CFG.events.attempts - 1);
});

test('условие «только отряд» — тапы не наносят урона', () => {
  const s = C.newState(NOCRIT); s.bestFloor = 100; s.tapLevel = 1e9;
  C.eventReset(s, 'w2026-11-09');                       // Гнездо редкостей: alliesOnly
  C.enterMode(s, 'event', { tier: 3 }, 'd');
  const hp = s.enemy.hp; C.tap(s);
  assert.strictEqual(s.enemy.hp, hp);
});

test('магазин события: фонари, лимит в неделю', () => {
  const s = C.newState(NOCRIT); C.eventReset(s, 'w2026-11-02');
  const it = CFG.events.shop[0];
  s.event.lanterns = it.cost * (it.limit + 1);
  for (let i = 0; i < it.limit; i++) assert.ok(C.buyEventItem(s, it.id));
  assert.strictEqual(C.buyEventItem(s, it.id), null);
  assert.strictEqual(s.tickets, it.reward.tickets * it.limit);
});

test('центр наград: ежедневный подарок, незабранное по итогам сезона, «Забрать всё»', () => {
  const s = C.newState(NOCRIT);
  C.questsReset(s, '2026-11-04', 'w'); C.questsReset(s, '2026-11-05', 'w');
  assert.strictEqual(s.inbox.filter(x => x.title === 'Ежедневный подарок').length, 2);
  C.seasonReset(s, '2026-11-04'); s.season.xp = 3 * CFG.season.xpPerLevel; C.claimPass(s, 1, 'free');
  C.seasonReset(s, '2026-12-01');
  const left = s.inbox.find(x => x.title.startsWith('Незабранное'));
  assert.ok(left && left.reward.tickets === 2 * CFG.season.free.tickets);
  const r = C.claimInboxAll(s);
  assert.strictEqual(r.count, 3); assert.strictEqual(s.inbox.length, 0);
});

test('сохранение события и наград, миграция с 0.22', () => {
  const s = C.newState(NOCRIT); C.eventReset(s, 'w2026-11-02'); s.event.points = 300; s.event.lanterns = 40; s.event.ms = { 0: true };
  C.inboxAdd(s, 'тест', { heart: 1 });
  const t = C.deserialize(C.serialize(s));
  assert.strictEqual(t.event.id, 'gold'); assert.strictEqual(t.event.points, 300); assert.deepStrictEqual(t.event.ms, { 0: true });
  assert.deepStrictEqual(t.inbox.map(x => x.title), ['тест']);
  const old = JSON.parse(C.serialize(s)); old.v = 13; delete old.event; delete old.inbox; delete old.inboxSeq;
  const m = C.deserialize(JSON.stringify(old));
  assert.strictEqual(m.event.id, null); assert.deepStrictEqual(m.inbox, []);
});

// ---------- большие числа (0.24) ----------
const B = C.B;
test('большие числа: арифметика и сравнение за пределами 1e308', () => {
  const a = B.fromLog10(5000), b = B.fromLog10(4999);
  assert.ok(B.isBig(a)); assert.ok(B.gt(a, b)); assert.ok(B.lt(b, a));
  assert.ok(Math.abs(B.log10(B.add(a, b)) - Math.log10(1.1) - 5000) < 1e-9);
  assert.ok(Math.abs(B.log10(B.mul(a, b)) - 9999) < 1e-9);
  assert.ok(Math.abs(B.toNum(B.div(a, b)) - 10) < 1e-9);
  assert.ok(Math.abs(B.log10(B.sub(a, b)) - (5000 + Math.log10(0.9))) < 1e-9);
  assert.strictEqual(B.add(1, 2), 3);                       // малые числа остаются обычными
  assert.strictEqual(B.mul(B.fromLog10(400), B.fromLog10(-200)), 1e200);
  assert.strictEqual(B.cmp(B.fromLog10(400), 1e300), 1); assert.strictEqual(B.cmp(-5, B.fromLog10(400)), -1);
  assert.ok(B.gt(B.fromLog10(400), 0));
});

test('формат: K, M … aa … zz, затем три буквы', () => {
  assert.strictEqual(C.fmt(1.25e6), '1.25M');
  assert.strictEqual(C.fmt(B.fromLog10(300)), C.fmt(1e300));
  assert.strictEqual(C.fmt(B.fromLog10(2040)), '1zz');
  assert.strictEqual(C.fmt(B.fromLog10(2043)), '1aaa');
  assert.strictEqual(C.fmt(B.fromLog10(5000)), '100blx');
});

test('сохранение больших чисел: строкой «m·e», обратно — то же значение', () => {
  const s = C.newState(NOCRIT);
  s.gold = B.fromLog10(4321.5); s.souls = B.fromLog10(1234.2);
  const t = C.deserialize(C.serialize(s));
  assert.ok(Math.abs(B.log10(t.gold) - 4321.5) < 1e-9);
  assert.ok(Math.abs(B.log10(t.souls) - 1234.2) < 1e-9);
  const bad = JSON.parse(C.serialize(s)); bad.gold = 'abc';
  assert.strictEqual(C.deserialize(JSON.stringify(bad)), null);
});

test('Башня на этаже 50 000: HP и золото конечны, бой и награды работают', () => {
  const s = C.newState(NOCRIT);
  s.floor = s.maxFloor = s.bestFloor = 50000; C.goToFloor(s, 49999); C.goToFloor(s, 50000);
  assert.ok(isFinite(B.log10(s.enemy.maxHp)));
  assert.ok(Math.abs(B.log10(C.enemyMaxHp(50000, false)) - (Math.log10(CFG.enemyBaseHp * C.biomeOf(50000).hp) + C.floorSteps(50000) * Math.log10(CFG.enemyHpGrowth))) < 1e-6);
  s.tapLevel = 15000; s.souls = B.fromLog10(3600);
  let i = 0; while (s.enemy.alive && i++ < 1000) C.tap(s);
  assert.ok(!s.enemy.alive, 'враг убит');
  assert.ok(B.gt(s.gold, 0));
  assert.strictEqual(C.fmt(s.gold).includes('∞'), false);
  assert.ok(B.isBig(C.enemyMaxHp(100000, true)));                    // вершина — большие числа
});

test('покупки с огромным золотом: MAX упирается в потолок, цена конечна', () => {
  const s = C.newState(NOCRIT); s.gold = B.fromLog10(2000);
  assert.ok(C.buyTap(s, 'max')); assert.strictEqual(s.tapLevel, C.tapCap(s));
  s.heroRank = 100; s.gold = B.fromLog10(1200);
  assert.ok(C.buyTap(s, 'max'));
  assert.ok(s.tapLevel > 15000 * 0.5 && s.tapLevel <= 15000);
  assert.ok(B.gte(s.gold, 0));
  const cost = C.upgradeCost(s.tapLevel, 1);
  assert.ok(B.isBig(cost) && B.gt(cost, s.gold) === B.gt(cost, s.gold));
});

test('ритуал на высоком этаже даёт огромное число душ, бонус урона растёт; выше 1000 — степенной рост', () => {
  const s = C.newState(NOCRIT); s.floor = s.maxFloor = s.bestFloor = 20000;
  const souls = C.ritualSouls(s);
  assert.ok(B.log10(souls) > 60);
  const t = C.newState(NOCRIT); t.floor = t.maxFloor = t.bestFloor = 40000; t.bestRecordAtRunStart = 1e9; s.bestRecordAtRunStart = 1e9;
  const r = B.log10(C.ritualSouls(t)) - B.log10(C.ritualSouls(s));
  assert.ok(Math.abs(r - CFG.ritual.soulsKnee * Math.log(CFG.ritual.soulsGrowth) * Math.log10(2)) < 1e-6);   // ×2 этажа → ×2^k душ
  const p0 = C.permMult(s, 'tap'); C.ritual(s);
  assert.ok(B.gt(C.permMult(s, 'tap'), p0));
});

test('офлайн на огромных этажах не ломается', () => {
  const s = C.newState(NOCRIT); s.floor = s.maxFloor = s.bestFloor = 30000;
  s.allies.shorokh.level = 15000; s.heroes.shorokh.rank = 100; s.souls = B.fromLog10(5100);
  const r = C.offlineProgress(s, 3600);
  assert.ok(r && B.gte(r.gold, 0));
});

// ---------- классы героя и «Печать силы» (0.25) ----------
test('класс открывается на этаже 100; очки за рекорд и ритуалы', () => {
  const s = C.newState(NOCRIT);
  assert.strictEqual(C.chooseClass(s, 'blade', 'd1'), false);
  s.bestFloor = 120; s.rituals = 2;
  assert.strictEqual(C.classPoints(s), Math.floor(120 / 25) + 2 * 3);
  assert.ok(C.chooseClass(s, 'blade', 'd1'));
  assert.strictEqual(C.classFree(s), C.classPoints(s));
});

test('узлы класса: эффект, предел, очки кончаются; без критов', () => {
  const s = C.newState(NOCRIT), t = C.newState(NOCRIT); s.bestFloor = 1000; s.rituals = 10;
  C.chooseClass(s, 'blade', 'd');
  for (let i = 0; i < 4; i++) assert.ok(C.buyClassNode(s, 'b1'));
  assert.ok(Math.abs(C.permMult(s, 'tap') / C.permMult(t, 'tap') - 2) < 1e-9);
  assert.strictEqual(C.critChance(s), C.critChance(t)); assert.strictEqual(C.critMult(s), C.critMult(t));
  while (C.buyClassNode(s, 'b1'));
  assert.strictEqual(s.cls.spent.b1, 10);
  for (const k of CFG.classes.list) for (const n of k.nodes) assert.ok(!/crit/i.test(n.kind));
  assert.strictEqual(C.buyClassNode(s, 'c1'), false);        // узел другого класса
});

test('смена класса раз в день, очки возвращаются; эффекты охотника и призывателя', () => {
  const s = C.newState(NOCRIT); s.bestFloor = 500;
  C.chooseClass(s, 'hunter', 'd1'); C.buyClassNode(s, 'h2'); C.buyClassNode(s, 'h2');
  assert.strictEqual(C.bossTime(s), CFG.bossTimeSec + 2);
  assert.ok(C.chooseClass(s, 'caller', 'd1'));               // первая смена в этот день
  assert.strictEqual(C.chooseClass(s, 'alch', 'd1'), false);  // вторая — нельзя
  assert.strictEqual(C.bossTime(s), CFG.bossTimeSec);
  assert.strictEqual(C.classFree(s), C.classPoints(s));
  C.buyClassNode(s, 'c2');
  s.allies.shorokh.level = 1; s.allies.shorokh.ult = 0;
  C.tick(s, 1);
  assert.ok(Math.abs(s.allies.shorokh.ult - 1.04) < 1e-9);
  assert.ok(C.chooseClass(s, 'alch', 'd2'));
});

test('«Печать силы» убрана (0.51): не открывается и не даёт урона', () => {
  const s = C.newState(NOCRIT); s.bestFloor = 5000; s.allies.shorokh.level = 10;
  const before = C.allyDps(s, 'shorokh');
  assert.strictEqual(C.moveBooster(s, 'shorokh', 1e12), false);
  s.booster.owner = 'shorokh';                                   // старое сохранение с печатью
  assert.strictEqual(C.allyDps(s, 'shorokh'), before);
});

test('предел 15 тапов в секунду', () => {
  assert.strictEqual(TAP_CAP, 15); CFG.maxTapsPerSec = TAP_CAP;
  const s = C.newState(NOCRIT); C.challengeBoss(s);
  s.enemy.hp = 1e12; s.enemy.maxHp = 1e12;
  for (let i = 0; i < 40; i++) C.tap(s);
  assert.strictEqual(s.stats.taps, 15);
  C.tick(s, 1); C.tap(s);
  assert.strictEqual(s.stats.taps, 16);
  CFG.maxTapsPerSec = Infinity;
});

test('сохранение класса и печати, миграция с 0.24', () => {
  const s = C.newState(NOCRIT); s.bestFloor = 300; C.chooseClass(s, 'alch', 'd'); C.buyClassNode(s, 'a1');
  s.booster = { owner: 'hero', movedAt: 5 };
  const t = C.deserialize(C.serialize(s));
  assert.strictEqual(t.cls.id, 'alch'); assert.deepStrictEqual(t.cls.spent, { a1: 1 });
  assert.deepStrictEqual(t.booster, { owner: 'hero', movedAt: 5 });
  const old = JSON.parse(C.serialize(s)); old.v = 14; delete old.cls; delete old.booster;
  const m = C.deserialize(JSON.stringify(old));
  assert.strictEqual(m.cls.id, null); assert.strictEqual(m.booster.owner, null);
});

// ---------- кости монстров (0.26) ----------
function mkBone(s, slot, tier, extra) { const b = { id: s.boneSeq++, slot, tier, lvl: 0, grade: 1, on: null, lock: false, ...(extra || {}) }; s.bones.push(b); return b; }

test('кости: ровно 6 слотов — голова, 2 руки, 2 ноги, нагрудник; без критов', () => {
  assert.strictEqual(CFG.bones.slots.length, 6);
  const names = CFG.bones.slots.map(x => x.name);
  assert.deepStrictEqual(names, ['Голова', 'Нагрудник', 'Правая рука', 'Левая рука', 'Правая нога', 'Левая нога']);
  for (const x of CFG.bones.slots) assert.ok(!/crit/i.test(x.kind));
  const s = C.newState(NOCRIT), t = C.newState(NOCRIT);
  for (const x of CFG.bones.slots) C.equipBone(s, mkBone(s, x.id, 6).id, 'hero');
  assert.strictEqual(C.critChance(s), C.critChance(t)); assert.strictEqual(C.critMult(s), C.critMult(t));
});

test('рёбра и позвоночник усиливают носителя; в слоте одна кость', () => {
  const s = C.newState(NOCRIT); s.allies.shorokh.level = 10;
  const base = C.allyDps(s, 'shorokh');
  const r = mkBone(s, 'armR', 1);
  assert.ok(C.equipBone(s, r.id, 'shorokh'));
  assert.ok(Math.abs(C.allyDps(s, 'shorokh') / base - (1 + C.boneValue(r))) < 1e-9);
  const r2 = mkBone(s, 'armR', 2); C.equipBone(s, r2.id, 'shorokh');
  assert.strictEqual(r.on, null); assert.strictEqual(C.equippedOn(s, 'shorokh').length, 1);
  const sp = mkBone(s, 'chest', 0); C.equipBone(s, sp.id, 'shorokh');
  assert.ok(Math.abs(C.allyDps(s, 'shorokh') / base - (1 + C.boneValue(r2)) * (1 + C.boneValue(sp))) < 1e-9);
  assert.strictEqual(C.equipBone(s, r.id, 'azrael'), false);     // не открыт
});

test('череп — по боссам, когти — по обычным; таз и конечности — для всех', () => {
  const s = C.newState(NOCRIT); s.enemy.hp = s.enemy.maxHp = 1e18;
  const cl = mkBone(s, 'armL', 0); C.equipBone(s, cl.id, 'hero');
  const d1 = C.tap(s).find(e => e.type === 'hit').dmg;
  assert.ok(Math.abs(d1 / C.tapHit(s) - (1 + C.boneValue(cl))) < 1e-9);
  const pv = mkBone(s, 'legL', 2); C.equipBone(s, pv.id, 'shorokh');
  assert.ok(Math.abs(C.goldMult(s) - (1 + C.boneValue(pv))) < 1e-9);
  const lm = mkBone(s, 'legR', 0); C.equipBone(s, lm.id, 'kostik');
  assert.ok(Math.abs(C.shardMult(s) - (1 + C.boneValue(lm))) < 1e-9);
  s.floor = s.maxFloor = 12; C.challengeBoss(s); s.enemy.hp = s.enemy.maxHp = 1e18;
  const sk = mkBone(s, 'head', 1); C.equipBone(s, sk.id, 'hero');
  const d2 = C.tap(s).find(e => e.type === 'hit').dmg;
  assert.ok(Math.abs(d2 / C.tapHit(s) - C.damageMult(s, 'tap')) < 1e-9);
  assert.ok(C.damageMult(s, 'tap') >= 1 + C.boneValue(sk) - 1e-9);
});

test('уровень за пыль до 10, грейд без предела (пыль и осколки), сила растёт', () => {
  const s = C.newState(NOCRIT); s.materials = { shard: 1e6, heart: 0, dust: 1e9 };
  const b = mkBone(s, 'armR', 3);
  assert.strictEqual(C.gradeUpBone(s, b.id), false);              // уровень ещё не полный
  const v0 = C.boneValue(b);
  for (let i = 0; i < 10; i++) assert.ok(C.upgradeBone(s, b.id));
  assert.strictEqual(C.upgradeBone(s, b.id), false);
  assert.ok(C.boneValue(b) > v0);
  for (let g = 1; g <= 7; g++) {
    if (b.lvl < 10) for (let i = 0; i < 10; i++) C.upgradeBone(s, b.id);
    const before = C.boneValue(b);
    assert.ok(C.gradeUpBone(s, b.id)); assert.strictEqual(b.lvl, 0);
    assert.ok(C.boneValue(b) > before * 0.7);
  }
  assert.strictEqual(b.grade, 8);
});

test('переработка: пыль, защищённые и надетые не трогаются', () => {
  const s = C.newState(NOCRIT);
  const a = mkBone(s, 'armL', 0), b = mkBone(s, 'armL', 2, { grade: 3 }), l = mkBone(s, 'head', 5, { lock: true }), w = mkBone(s, 'armR', 1);
  C.equipBone(s, w.id, 'hero');
  const r = C.recycleBones(s, [a.id, b.id, l.id, w.id]);
  assert.strictEqual(r.count, 2);
  assert.strictEqual(s.materials.dust, C.recycleValue(a) + C.recycleValue(b));
  assert.ok(s.bones.includes(l) && s.bones.includes(w));
});

test('выпадение: финальный босс — всегда, A+ сразу защищены; кости переживают ритуал', () => {
  const s = C.newState(NOCRIT); s.tapLevel = 1e12;
  s.floor = s.maxFloor = 50; s.enemyIndex = CFG.enemiesPerFloor; C.challengeBoss(s);
  const ev = killCurrent(s);
  assert.ok(ev.some(e => e.type === 'bone'));
  assert.strictEqual(s.bones.length, 1);
  for (let i = 0; i < 300; i++) C.rollBone(s, 1, i);
  assert.ok(s.bones.every(b => b.lock === (b.tier >= 4)));
  assert.ok(new Set(s.bones.map(b => b.slot)).size === 6);
  C.equipBone(s, s.bones[0].id, 'hero');
  s.floor = s.maxFloor = 400; C.ritual(s);
  assert.strictEqual(s.bones.length, 301); assert.strictEqual(s.bones[0].on, 'hero');
});

test('сохранение костей и пыли, миграция с 0.25', () => {
  const s = C.newState(NOCRIT); mkBone(s, 'chest', 4, { lvl: 3, grade: 5, on: 'hero', lock: true }); s.materials.dust = 77;
  const t = C.deserialize(C.serialize(s));
  assert.deepStrictEqual(t.bones, s.bones); assert.strictEqual(t.materials.dust, 77);
  const old = JSON.parse(C.serialize(s)); old.v = 15; delete old.bones; delete old.boneSeq; delete old.materials.dust;
  const m = C.deserialize(JSON.stringify(old));
  assert.deepStrictEqual(m.bones, []); assert.strictEqual(m.materials.dust, 0);
});

test('кости со старыми названиями слотов (0.26) переносятся в новые', () => {
  const s = C.newState(NOCRIT);
  const d = JSON.parse(C.serialize(s));
  d.bones = [{ id: 1, slot: 'ribs', tier: 2, lvl: 3, grade: 1, on: 'hero', lock: false }, { id: 2, slot: 'pelvis', tier: 0, lvl: 0, grade: 1, on: null, lock: false }];
  d.boneSeq = 3;
  const t = C.deserialize(JSON.stringify(d));
  assert.deepStrictEqual(t.bones.map(b => b.slot), ['armR', 'legL']);
  assert.strictEqual(t.bones[0].on, 'hero');
});

// ---------- питомцы 2.0 (0.43) ----------
test('питомцы 2.0: 27 шт., по 3 на ранг; 2 за этажи, 3-й — событие; типы бонуса по кругу', () => {
  const P = CFG.pets;
  assert.strictEqual(P.list.length, 27);
  for (const r of CFG.rarities) {
    const l = P.list.filter(p => p.rank === r);
    assert.strictEqual(l.length, 3);
    assert.deepStrictEqual(l.map(p => p.floor), [...P.floors[r], null]);
    assert.ok(l[2].event); assert.strictEqual(new Set(l.map(p => p.type)).size, 3);
  }
  assert.strictEqual(new Set(P.list.map(p => p.id)).size, 27);
});

test('питомец выдаётся за первую победу над боссом своего этажа, один активный; бьёт долей DPS отряда', () => {
  const s = C.newState(NOCRIT);
  s.floor = s.maxFloor = 150; C.challengeBoss(s); s.enemy.hp = B.toNum ? 1 : 1;
  let ev = []; for (let i = 0; i < 200 && !ev.some(e => e.type === 'pet'); i++) ev = ev.concat(C.tap(s), C.tick(s, 0.5));
  assert.ok(ev.some(e => e.type === 'pet' && e.id === 'ash_rat'));
  assert.strictEqual(C.petForm(s, 'ash_rat'), 1); assert.strictEqual(s.pets.active, 'ash_rat');
  assert.strictEqual(C.petForm(s, 'bog_toad'), 0);
  // задним числом: рекорд 300 → оба E и не D
  const t = C.newState(NOCRIT); t.bestCleared = 300; C.petsCatchUp(t);
  assert.ok(C.petForm(t, 'ash_rat') && C.petForm(t, 'bog_toad') && !C.petForm(t, 'cave_bat') && !C.petForm(t, 'shadow_wolf'));
  // удар: доля × интервал
  t.allies.shorokh.level = 10; const p = C.petDef('ash_rat');
  assert.ok(Math.abs(C.petHit(t) - C.squadRawDps(t) * CFG.pets.power.E[0] * p.interval) < 1e-9 * Math.max(1, C.petHit(t)));
  assert.ok(C.setPet(t, 'bog_toad')); assert.strictEqual(t.pets.active, 'bog_toad');
  assert.strictEqual(C.setPet(t, 'cave_bat'), false); C.recallPet(t); assert.strictEqual(t.pets.active, null);
});

test('бонус активного питомца по типу: урон отряда, по боссу, золото, урон тапа', () => {
  const s = C.newState(NOCRIT);
  const byType = ty => CFG.pets.list.find(p => p.type === ty && p.rank === 'E') || CFG.pets.list.find(p => p.type === ty);
  for (const ty of ['squad', 'boss', 'gold', 'tap']) {
    const p = byType(ty); s.pets.forms = { [p.id]: 1 }; s.pets.active = p.id;
    assert.ok(C.petBonus(s, ty) > 0);
    for (const o of ['squad', 'boss', 'gold', 'tap']) if (o !== ty) assert.strictEqual(C.petBonus(s, o), 0);
  }
  const g = byType('gold'); s.pets.forms = { [g.id]: 1 }; s.pets.active = g.id;
  const m1 = C.goldMult(s); s.pets.active = null; assert.ok(m1 > C.goldMult(s));
  const t = byType('tap'); s.pets.forms = { [t.id]: 1 }; s.pets.active = t.id;
  const p1 = C.permMult(s, 'tap'); s.pets.active = null; assert.ok(C.B.gt(p1, C.permMult(s, 'tap')));
});

test('эволюция питомца за фрагменты: 3 формы, бонус ×2 и ×4; стоимость растёт с рангом', () => {
  const s = C.newState(NOCRIT); s.pets.forms = { ash_rat: 1 };
  const b1 = C.petPower(C.petDef('ash_rat'), 1).bonus;
  assert.strictEqual(C.petEvoCost(s, 'ash_rat'), 40); assert.strictEqual(C.evolvePet(s, 'ash_rat'), false);
  s.pets.frags.ash_rat = 40; assert.ok(C.evolvePet(s, 'ash_rat')); assert.strictEqual(C.petForm(s, 'ash_rat'), 2);
  assert.strictEqual(C.petFrags(s, 'ash_rat'), 0); assert.strictEqual(C.petEvoCost(s, 'ash_rat'), 150);
  s.pets.frags.ash_rat = 150; assert.ok(C.evolvePet(s, 'ash_rat')); assert.strictEqual(C.petEvoCost(s, 'ash_rat'), null);
  assert.ok(Math.abs(C.petPower(C.petDef('ash_rat'), 3).bonus - b1 * 4) < 1e-9);
  s.pets.forms.world_eater = 1; assert.strictEqual(C.petEvoCost(s, 'world_eater'), Math.ceil(40 * Math.pow(1.5, 8)));
});

test('Хранители роняют фрагменты в своём биоме, в офлайне — нет; «Логово» даёт ×3 и питомца события', () => {
  const p = C.petDef('ash_rat');
  const t = C.newState(NOCRIT); t.floor = t.maxFloor = 170;
  assert.strictEqual(C.biomeOf(170).id, p.biome);
  let ev = [];
  for (let k = 0; k < 3000; k++) { t.stats.kills = k; C.keeperRoll(t, ev); }
  const n = ev.filter(e => e.type === 'petFrag').length;
  assert.ok(n > 30 && n < 100, 'примерно 1 из 50: ' + n);
  assert.ok(ev.every(e => e.type !== 'petFrag' || C.petDef(e.id).biome === p.biome));
  const low = C.newState(NOCRIT); low.floor = 120; ev = [];
  for (let k = 0; k < 3000; k++) { low.stats.kills = k; C.keeperRoll(low, ev); }
  assert.ok(!ev.some(e => e.type === 'petFrag' && e.id === 'ash_rat'), 'ниже этажа питомца Хранителя нет');
  const o = C.newState(NOCRIT); o.floor = o.maxFloor = 170; o.allies.shorokh.level = 300;
  C.offlineProgress(o, 3600);
  assert.strictEqual(Object.keys(o.pets.frags).length, 0, 'офлайн фрагменты не падают');
  // Логово: ранг недели по кругу; Хранители этого ранга дают ×3, 10 штук — питомец события
  const l = C.newState(NOCRIT); C.eventReset(l, 'w2026-11-02'); const r1 = C.lairRank(l); C.eventReset(l, 'w2026-11-09');
  assert.notStrictEqual(C.lairRank(l), r1); assert.ok(C.lairPet(l).event);
});

test('питомцы 2.0 переживают ритуал и сохранение; миграция со старых питомцев возвращает осколки', () => {
  const s = C.newState(NOCRIT); s.pets.forms = { ash_rat: 2 }; s.pets.frags = { ash_rat: 7 }; s.pets.active = 'ash_rat'; s.bestCleared = 150;
  s.floor = s.maxFloor = 400; s.bestFloor = 400; C.ritual(s);
  assert.strictEqual(C.petForm(s, 'ash_rat'), 2); assert.strictEqual(s.pets.active, 'ash_rat');
  const t = C.deserialize(C.serialize(s)); assert.deepStrictEqual(t.pets, s.pets); assert.strictEqual(t.bestCleared, 150);
  const old = JSON.parse(C.serialize(C.newState(NOCRIT))); old.v = 21; old.pets = { active: 'golem', levels: { wolf: 3, golem: 1 } };
  const shard0 = old.materials.shard;
  const m = C.deserialize(JSON.stringify(old));
  assert.ok(m); assert.strictEqual(m.pets.active, 'bog_toad'); assert.strictEqual(C.petForm(m, 'ash_rat'), 1);
  assert.strictEqual(m.materials.shard - shard0, 30 + Math.ceil(30 * 1.22));
});

// ---------- ритуальные задания и достижения (0.28) ----------
test('ритуальные задания: прогресс с начала забега, обновляются после ритуала', () => {
  const s = C.newState(NOCRIT);
  s.counters.boss = 200; s.maxFloor = s.floor = s.bestFloor = 400;
  assert.ok(C.questClaimable(s, 'r_boss')); assert.ok(C.questClaimable(s, 'r_f400'));
  const cr0 = s.crystals | 0; C.claimQuest(s, 'r_f400');
  assert.strictEqual(s.crystals, cr0 + CFG.quests.ritual.find(q => q.id === 'r_f400').reward.crystals);
  assert.strictEqual(s.season.xp, CFG.season.questXp.ritual);
  C.ritual(s);
  assert.strictEqual(C.questProgress(s, 'r_boss'), 0);
  assert.strictEqual(C.questClaimable(s, 'r_f400'), false);
  assert.strictEqual(s.quests.claimed.r_f400, undefined);
  s.counters.boss += 150; assert.ok(C.questClaimable(s, 'r_boss'));
});

test('счётчик редких врагов для ритуального задания', () => {
  const s = C.newState(NOCRIT); s.tapLevel = 1e12;
  Object.assign(s, { floor: 30, maxFloor: 30, enemyIndex: 4 });
  let k = 0; do { s.stats.kills = k++; } while (!C.rollRare(s, 30, 4));
  s.enemy.alive = false; s.respawn = 0; C.tick(s, 0.001);
  killCurrent(s);
  assert.strictEqual(s.counters.rare, 1);
});

test('достижения: ступени, награды, у каждого свой бонус за ступень (0.141)', () => {
  const s = C.newState(NOCRIT), t = C.newState(NOCRIT);
  const kill = CFG.achievements.list.find(x => x.id === 'a_kill');
  assert.strictEqual(C.claimAch(s, 'a_kill'), null);
  s.counters.kill = kill.goals[1] + 1;
  assert.ok(C.claimAch(s, 'a_kill')); assert.ok(C.claimAch(s, 'a_kill'));
  assert.strictEqual(C.claimAch(s, 'a_kill'), null);              // третьей ступени ещё нет
  assert.strictEqual(C.achPoints(s), 2);
  assert.ok(Math.abs(C.achPower(s, 'allDmg') - 2 * kill.bonus.per) < 1e-9);
  assert.ok(Math.abs(C.permMult(s, 'tap') / C.permMult(t, 'tap') - (1 + 2 * kill.bonus.per)) < 1e-9);
  assert.strictEqual(C.critChance(s), C.critChance(t));
  // бонус золота
  s.counters.rare = 3; assert.ok(C.claimAch(s, 'a_rare'));
  assert.ok(C.goldMult(s) > C.goldMult(t));
  // биомы: пройти 1–2 биома; коллекция ранга E — цели 1…число героев E
  s.bestFloor = 100; assert.ok(C.claimAch(s, 'a_b1')); assert.ok(C.claimAch(s, 'a_b2')); assert.strictEqual(C.claimAch(s, 'a_b3'), null);
  const rE = CFG.achievements.list.find(x => x.id === 'a_rE');
  assert.strictEqual(rE.goals.length, CFG.allies.filter(a => a.rarity === 'E' && !a.seasonal).length);
  // скрыты, пока функция выключена
  assert.strictEqual(C.achVisible(CFG.achievements.list.find(x => x.id === 'a_pet')), !CFG.disabled.includes('pets'));
});

test('сохранение достижений и базы забега; миграция с 0.27', () => {
  const s = C.newState(NOCRIT); s.counters.kill = 200; C.claimAch(s, 'a_kill'); s.quests.runBase = { kill: 50 };
  const t = C.deserialize(C.serialize(s));
  assert.deepStrictEqual(t.ach, { a_kill: 1 }); assert.deepStrictEqual(t.quests.runBase, { kill: 50 });
  const old = JSON.parse(C.serialize(s)); old.v = 17; delete old.ach; delete old.quests.runBase;
  const m = C.deserialize(JSON.stringify(old));
  assert.deepStrictEqual(m.ach, {}); assert.strictEqual(m.quests.runBase.kill, 200);
});

// ---------- баннеры портала (0.29) ----------
function seqRng(vals) { let i = 0; return () => vals[i++ % vals.length]; }
test('баннеры: цена, редкий — только C+, событийный — за фонари', () => {
  const s = C.newState({ rng: () => 0 });                  // всегда самая частая редкость
  s.tickets = 5;
  assert.strictEqual(C.summon(s, 2, 'rare'), null);         // 6 билетов нужно
  const r = C.summon(s, 1, 'rare');
  assert.strictEqual(r[0].rarity, 'C'); assert.strictEqual(s.tickets, 2);
  assert.strictEqual(C.summon(s, 1, 'event'), null);       // нет события
  C.eventReset(s, 'w2026-11-02'); s.event.lanterns = 50;
  const e = C.summon(s, 2, 'event');
  assert.ok(e.every(x => ['B', 'A', 'S', 'GOD'].includes(x.rarity)));
  assert.strictEqual(s.event.lanterns, 0); assert.strictEqual(s.tickets, 2);
});

test('гарантии баннеров раздельные', () => {
  const s = C.newState({ rng: () => 0 }); s.tickets = 1000;
  C.summon(s, 5, 'normal');
  assert.strictEqual(s.pity.a, 5);
  C.summon(s, 5, 'rare');
  assert.strictEqual(s.pity.a, 5); assert.strictEqual(C.bannerPity(s, 'rare').a, 5);
  const r = C.summon(s, 10, 'rare');                         // 15-й на редком — A+
  assert.ok(['A', 'S', 'GOD'].includes(r[9].rarity));
  assert.strictEqual(C.bannerPity(s, 'rare').a, 0);
});

test('возрастающие шансы: после 70 призывов без S шанс S растёт', () => {
  const lowS = C.newState({ rng: () => 0.98 }), hi = C.newState({ rng: () => 0.98 });
  lowS.tickets = hi.tickets = 1; hi.pity.s = 85;
  const a = C.summon(lowS, 1)[0], b = C.summon(hi, 1)[0];
  assert.strictEqual(a.rarity, 'A');                         // при обычных шансах 0.98 — A
  assert.strictEqual(b.rarity, 'S');                         // при pity 86 шанс S заметно выше
});

test('тематический баннер: два героя недели, их выпадение чаще', () => {
  const s = C.newState(NOCRIT); C.eventReset(s, 'w2026-11-02');
  const f = C.featuredHeroes(s);
  assert.strictEqual(f.length, 2); assert.notStrictEqual(f[0], f[1]);
  C.eventReset(s, 'w2026-11-09'); assert.notDeepStrictEqual(C.featuredHeroes(s), f);
  const fa = CFG.allies.find(a => a.id === C.featuredHeroes(s)[0]);
  // редкость героя недели; второй бросок < 0.5 → герой недели
  // пул — только открытые по рекорду этажа редкости, у которых есть герои портала (GDD 1.2)
  const odds = CFG.portal.odds, R = CFG.rarities.filter(r => C.rarityOpen(s, r) && CFG.allies.some(a => a.rarity === r && !a.hidden && !a.seasonal)), tot = R.reduce((x, r) => x + odds[r], 0);
  let acc = 0; for (const r of R) { if (r === fa.rarity) break; acc += odds[r]; }
  const t = C.newState({ rng: seqRng([(acc + 0.01) / tot, 0.1, 0]) }); t.event = s.event; t.tickets = 2;
  assert.strictEqual(C.summon(t, 1, 'theme')[0].id, fa.id);
});

test('сохранение гарантий баннеров; миграция с 0.28', () => {
  const s = C.newState(NOCRIT); s.bpity = { rare: { a: 3, s: 7 } };
  assert.deepStrictEqual(C.deserialize(C.serialize(s)).bpity, { rare: { a: 3, s: 7 } });
  const old = JSON.parse(C.serialize(s)); old.v = 18; delete old.bpity;
  assert.deepStrictEqual(C.deserialize(JSON.stringify(old)).bpity, {});
});

// ---------- коллекция героев (0.30) ----------
test('коллекция: каждый открытый герой и звезда дают урон, полная редкость — урон союзников', () => {
  const s = C.newState(NOCRIT), t = C.newState(NOCRIT);
  assert.strictEqual(C.collectionMult(s), 1);                    // стартовый отряд — без бонуса
  s.heroes.irene.unlocked = true;                               // второй E — сет E собран
  assert.ok(Math.abs(C.collectionMult(s) - 1.01) < 1e-9);
  assert.deepStrictEqual(C.collectionSets(s), ['E']);
  assert.ok(Math.abs(C.collectionAllyMult(s) - 1.1) < 1e-9);
  s.heroes.shorokh.stars = 5;
  assert.ok(Math.abs(C.collectionMult(s) - 1.06) < 1e-9);
  assert.ok(Math.abs(C.permMult(s, 'tap') / C.permMult(t, 'tap') - 1.06) < 1e-9);
  assert.ok(Math.abs(C.permMult(s, 'ally') / C.permMult(t, 'ally') - 1.06 * 1.1) < 1e-9);
  assert.strictEqual(C.critChance(s), C.critChance(t));
});

// ---------- навыки героя по уровням, автопереход (0.32) ----------
test('навыки героя: +% на 10/25/50/75/200, ×10 каждый 1000-й, благословение удара с 100-го', () => {
  assert.strictEqual(C.perkMult(9), 1);
  assert.strictEqual(C.perkMult(10), 2); assert.strictEqual(C.perkMult(25), 3);
  assert.strictEqual(C.perkMult(75), 5.5); assert.strictEqual(C.perkMult(200), 7.5);
  assert.strictEqual(C.perkMult(1000), 75); assert.strictEqual(C.perkMult(2999), 750);
  const s = C.newState(NOCRIT), base = C.tapDamage(s);
  s.allies.shorokh.level = 99; assert.strictEqual(C.tapDamage(s), base);
  s.allies.shorokh.level = 100;
  assert.ok(Math.abs(C.tapDamage(s) - (base + C.allyDpsAt('shorokh', 100) * 0.005)) < 1e-6);
});

test('автопереход выключен: босс открывает этаж, но игрок остаётся фармить', () => {
  const s = C.newState(NOCRIT); s.tapLevel = 1e9; s.autoAdvance = false;
  s.enemyIndex = CFG.enemiesPerFloor; C.challengeBoss(s);
  const ev = killCurrent(s);
  assert.ok(ev.some(e => e.type === 'stay'));
  assert.strictEqual(s.floor, 1); assert.strictEqual(s.maxFloor, 2); assert.ok(s.farming);
  const t = C.deserialize(C.serialize(s)); assert.strictEqual(t.autoAdvance, false);
});

test('статистика: макс. тапов/с, заработанное золото, время игры — сохраняются', () => {
  const s = C.newState(NOCRIT);
  for (let i = 0; i < 7; i++) C.tap(s);
  C.tick(s, 1);
  assert.strictEqual(s.stats.maxTps, 7);
  killCurrent(s);
  assert.ok(C.B.gt(s.stats.goldEarned, 0));
  assert.ok(s.stats.playTime >= 1);
  const t = C.deserialize(C.serialize(s));
  assert.strictEqual(t.stats.maxTps, 7);
  assert.strictEqual(C.B.str(t.stats.goldEarned), C.B.str(s.stats.goldEarned));
  assert.ok(t.stats.playTime >= 1);
});

test('экран героя: описание ульта, раса и навыки с замком', () => {
  const a = CFG.allies.find(x => x.id === 'kostik');
  assert.ok(a.race && a.cls && a.quote);
  assert.ok(/×2/.test(C.ultDesc(a)));
  const p = C.perkList(30);
  assert.strictEqual(p.length, CFG.perks.length);
  assert.ok(p[0].open && p[1].open && !p[2].open);
  assert.ok(CFG.allies.every(x => x.race && C.ultDesc(x)));
});

// ---------- 0.33: бонус за вход, путешествие во времени, сундуки ----------
test('бонус за вход: раз в день, пропуск не сбрасывает, после 30-го — по кругу', () => {
  const s = C.newState(NOCRIT);
  const r1 = C.claimLogin(s, '2026-11-04');
  assert.strictEqual(r1.day, 1); assert.strictEqual(s.tickets, CFG.login.days[0].tickets);
  assert.strictEqual(C.claimLogin(s, '2026-11-04'), null);
  assert.strictEqual(C.claimLogin(s, '2026-11-09').day, 2);     // пропустили дни — просто следующий
  s.login.n = 29; assert.strictEqual(C.claimLogin(s, '2026-11-10').day, 30);
  assert.strictEqual(C.claimLogin(s, '2026-11-11').day, 1);
  const t = C.deserialize(C.serialize(s)); assert.strictEqual(t.login.n, 31); assert.strictEqual(t.login.day, '2026-11-11');
});

test('путешествие во времени: 1 бесплатно, потом за билеты, лимит в день', () => {
  const s = C.newState(NOCRIT); s.allies.shorokh.level = 50;
  assert.strictEqual(C.travelCost(s, 'd1'), 0);
  const r = C.timeTravel(s, 'd1');
  assert.ok(r && r.seconds === CFG.timeTravel.hours * 3600 && C.B.gt(r.gold, 0));
  assert.strictEqual(C.travelCost(s, 'd1'), CFG.timeTravel.ticketCost);
  s.tickets = 0; assert.strictEqual(C.timeTravel(s, 'd1'), null);   // нет билетов
  s.tickets = 100;
  for (let i = 0; i < CFG.timeTravel.paidPerDay; i++) assert.ok(C.timeTravel(s, 'd1'));
  assert.strictEqual(C.travelCost(s, 'd1'), null);
  assert.strictEqual(C.travelCost(s, 'd2'), 0);                 // новый день
});

test('сундуки заданий: открываются по числу забранных ежедневных, сбрасываются с днём', () => {
  const s = C.newState(NOCRIT);
  C.questsReset(s, 'd1', 'w1');
  assert.strictEqual(C.questChestReady(s, 0), false);
  s.quests.claimed.d_kill = true;
  assert.ok(C.openQuestChest(s, 0)); assert.strictEqual(C.openQuestChest(s, 0), null);
  assert.strictEqual(C.questChestReady(s, 1), false);
  const t = C.deserialize(C.serialize(s)); assert.ok(t.quests.chests[0]);
  C.questsReset(s, 'd2', 'w1'); assert.ok(!s.quests.chests[0]);
});

test('сундук-враг: редкий враг с большим золотом', () => {
  const k = CFG.rare.kinds.find(x => x.id === 'chest');
  assert.ok(k && k.gold > 10);
});

test('перенос сохранения 0.32 → 0.33', () => {
  const s = C.newState(NOCRIT), d = JSON.parse(C.serialize(s));
  d.v = 19; delete d.login; delete d.travel; delete d.quests.chests;
  const t = C.deserialize(JSON.stringify(d));
  assert.ok(t); assert.strictEqual(t.login.n, 0);
});

test('путешествие во времени без авто-урона не тратит попытку', () => {
  const s = C.newState(NOCRIT);
  assert.strictEqual(C.timeTravel(s, 'd1'), null);
  assert.strictEqual(C.travelCost(s, 'd1'), 0);
});

test('GDD 1.2: SS/SSS/GOD — только после этажей 1000 / 2500 / 4000; 15 звёзд', () => {
  assert.deepStrictEqual(CFG.rarities, ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'GOD']);
  assert.strictEqual(CFG.maxStars, 15); assert.strictEqual(CFG.starCopies.length, 15);
  assert.ok(CFG.allies.some(a => a.rarity === 'SS') && CFG.allies.some(a => a.rarity === 'SSS'));
  const s = C.newState(NOCRIT);
  s.bestFloor = 999; assert.ok(!C.rarityOpen(s, 'SS')); assert.ok(C.rarityOpen(s, 'S'));
  s.bestFloor = 1000; assert.ok(C.rarityOpen(s, 'SS')); assert.ok(!C.rarityOpen(s, 'SSS'));
  s.bestFloor = 2500; assert.ok(C.rarityOpen(s, 'SSS')); assert.ok(!C.rarityOpen(s, 'GOD'));
  s.bestFloor = 4000; assert.ok(C.rarityOpen(s, 'GOD'));
  // ранний игрок: 2000 призывов без SS, SSS и GOD
  const t = C.newState(); t.tickets = 2000; t.bestFloor = 1;
  const r = C.summon(t, 2000, 'normal');
  assert.ok(r.every(x => !['SS', 'SSS', 'GOD'].includes(x.rarity)));
  assert.ok(r.some(x => x.rarity === 'S'));            // гарантия S+ остаётся — даёт S
  // после этажа 4000 все редкости доступны
  const u = C.newState(); u.tickets = 5000; u.bestFloor = 4000;
  const r2 = C.summon(u, 5000, 'normal');
  assert.ok(['SS', 'SSS', 'GOD'].every(x => r2.some(y => y.rarity === x)));
});

test('миграция 21: руны и кости GOD (ступень 6) → ступень 8', () => {
  const s = C.newState(NOCRIT);
  s.runes = [{ id: 1, type: 'might', tier: 8, lvl: 0 }]; s.runeSeq = 2;
  const d = JSON.parse(C.serialize(s)); d.v = 20; d.runes[0].tier = 6;
  const back = C.deserialize(JSON.stringify(d));
  assert.ok(back); assert.strictEqual(back.runes[0].tier, 8);
});

// ---------- испытательная башня (0.44) ----------
test('испытательная башня: равные условия — урон тапа фиксирован, без критов, союзников, питомца и бонусов', () => {
  const s = C.newState({ rng: () => 0 });                       // rng 0 — крит сработал бы всегда
  s.tapLevel = 500; s.allies.shorokh.level = 300; s.pets.forms = { ash_rat: 3 }; s.pets.active = 'ash_rat'; s.artifacts = { blade: 10 };
  assert.ok(C.enterMode(s, 'trial', {}, 'd1'));
  assert.strictEqual(s.enemy.hp, CFG.pve.trial.hpBase);
  const ev = C.tap(s);
  assert.strictEqual(ev[0].dmg, CFG.pve.trial.tapDmg); assert.strictEqual(ev[0].crit, false);
  const hp = s.enemy.hp;
  const tk = C.tick(s, 3);
  assert.ok(!tk.some(e => e.type === 'hit'), 'никто, кроме тапов, не бьёт');
  assert.strictEqual(s.enemy.hp, hp);
});

test('испытательная башня: 15 с на стража, HP растёт, рекорды недели и за всё время, 3 попытки в день', () => {
  const s = C.newState(NOCRIT); C.eventReset(s, 'w2026-11-02');
  C.enterMode(s, 'trial', {}, 'd1');
  for (let g = 0; g < 3; g++) {                                 // три стража
    const need = CFG.pve.trial.hpBase + CFG.pve.trial.hpStep * g;
    for (let i = 0; i < need; i++) C.tap(s);
    C.tick(s, 1);                                               // появление следующего
    assert.ok(Math.abs(s.bossTimeLeft - CFG.pve.trial.time) < 1.01);
  }
  assert.strictEqual(s.enemy.maxHp, CFG.pve.trial.hpBase + CFG.pve.trial.hpStep * 3);
  let ev = []; for (let i = 0; i < 20 && s.mode; i++) ev = ev.concat(C.tick(s, 1));
  const end = ev.find(e => e.type === 'modeEnd');
  assert.ok(end && end.kind === 'trial'); assert.strictEqual(end.reward.guards, 3);
  assert.strictEqual(s.trial.weekBest, 3); assert.strictEqual(s.trial.best, 3);
  assert.strictEqual(s.essence, 3 * CFG.pve.trial.essencePer);
  C.eventReset(s, 'w2026-11-09'); C.trialSync(s);
  assert.strictEqual(s.trial.weekBest, 0); assert.strictEqual(s.trial.best, 3);
  assert.ok(C.enterMode(s, 'trial', {}, 'd1')); C.leaveMode(s);
  assert.ok(C.enterMode(s, 'trial', {}, 'd1')); C.leaveMode(s);
  assert.strictEqual(C.enterMode(s, 'trial', {}, 'd1'), null);
  const t = C.deserialize(C.serialize(s)); assert.deepStrictEqual(t.trial, s.trial);
});

// ---------- 0.47: временные криты от ультимейтов, защита от неконтролируемого роста ----------
test('ульта «критов» даёт временный шанс и урон крита; общий предел 75% сохраняется', () => {
  const s = C.newState(NOCRIT);
  const a = CFG.allies.find(x => x.id === 'kassian');
  assert.strictEqual(a.ult.kind, 'critBuff'); assert.ok(/крита/.test(C.ultDesc(a)));
  const ch0 = C.critChance(s), m0 = C.critMult(s);
  s.critBuff = { t: 5, ch: a.ult.chance, dmg: a.ult.dmg };
  assert.ok(Math.abs(C.critChance(s) - Math.min(0.75, ch0 + a.ult.chance)) < 1e-9);
  assert.ok(Math.abs(C.critMult(s) - (m0 + a.ult.dmg)) < 1e-9);
  s.critBuff.ch = 5; assert.strictEqual(C.critChance(s), 0.75);          // предел
  C.tick(s, 6); assert.strictEqual(C.critChance(s), ch0);               // кончилось
});

test('мягкий предел произведения бонусов: до порога без изменений, выше — корень', () => {
  const P = CFG.softcap;
  assert.strictEqual(C.softcap(10, P.start), 10);
  assert.strictEqual(C.softcap(P.start, P.start), P.start);
  assert.ok(Math.abs(C.softcap(P.start * 100, P.start) - P.start * 10) < 1e-6);
  assert.ok(C.softcap(P.start * 4, P.start) > C.softcap(P.start * 2, P.start));   // рост остаётся
});

// ---------- 0.48: стена по осколкам (по итогам долгой симуляции) ----------
test('провал босса: отряд спускается на этаж ниже и фармит его босса (не просто мобов)', () => {
  const s = C.newState(NOCRIT); s.floor = s.maxFloor = 20; s.highestCleared = 19;
  C.challengeBoss(s); s.enemy.hp = s.enemy.maxHp = 1e30;
  let ev = []; for (let i = 0; i < 40 && !ev.some(e => e.type === 'bossFail'); i++) ev = ev.concat(C.tick(s, 1));
  assert.ok(ev.some(e => e.type === 'bossFail'));
  assert.strictEqual(s.floor, 19); assert.strictEqual(s.farming, false);   // этаж ниже, с боссом в конце
  const t = C.newState(NOCRIT); t.autoAdvance = false; t.floor = t.maxFloor = 20; C.challengeBoss(t); t.enemy.hp = t.enemy.maxHp = 1e30;
  for (let i = 0; i < 40; i++) C.tick(t, 1);
  assert.strictEqual(t.floor, 20); assert.strictEqual(t.farming, true);   // автопереход выключен — прежний фарм
});

test('обычные мобы иногда роняют осколки (≈8%, 30% от осколков босса этажа)', () => {
  let n = 0, got = 0;
  // настоящий бой: слабый враг, тап убивает
  const t = C.newState(NOCRIT); t.floor = t.maxFloor = 100; t.highestCleared = 100;
  for (let i = 0; i < 1500; i++) {
    if (t.enemy.isBoss) { t.enemyIndex = 1; t.floor = 100; C.goToFloor(t, 99); C.goToFloor(t, 100); }
    t.enemy.hp = 1; const e = C.tap(t); C.tick(t, 1);
    for (const x of e) if (x.type === 'mobShard') { n++; got += x.n; }
  }
  assert.ok(n > 40 && n < 220, 'дропов: ' + n);
  assert.ok(got >= n);
});

test('кривая дальних этажей: до колена — ×enemyHpGrowth, выше — медленнее, но растёт всегда', () => {
  const K = CFG.floorCurve.knee, st = f => C.floorSteps(f + 1) - C.floorSteps(f);
  assert.ok(Math.abs(st(Math.floor(K / 2)) - 1) < 1e-9, 'до колена — полный шаг');
  assert.ok(st(K + 5) < 1 && st(2 * K) < 1, 'после колена — мягче');
  assert.ok(st(100000) <= st(2000) + 1e-9, 'дальше не круче');
  const l = f => B.log10(C.enemyMaxHp(f, false));
  assert.ok(l(1e7) > l(1e6) && l(1e6) > l(100000) && l(100000) > l(2000), 'растёт всегда');
});

// ---------- 0.51: ранги из обновлений, награды ритуалов ----------
test('ранги из обновлений: новый ранг в CONFIG.ranks.extra поднимает потолок выше 15 000', () => {
  const R = CFG.ranks, base = R.count * R.subs;
  assert.strictEqual(C.maxSteps(), base); assert.strictEqual(C.capAt(base), R.capMax);
  R.extra.push(20000);
  try {
    assert.strictEqual(C.rankCount(), R.count + 1); assert.strictEqual(C.maxSteps(), base + R.subs);
    assert.ok(C.capAt(base + 1) > R.capMax && C.capAt(base + 5) < 20000);
    assert.strictEqual(C.capAt(base + R.subs), 20000);
    const s = C.newState(NOCRIT); s.heroRank = base;
    assert.ok(C.rankCost(s, 'hero'));                                  // с 15 000 снова можно расти
  } finally { R.extra.pop(); }
});

test('награды 1-го, 10-го и 100-го ритуала: титул, облик, ценности в центр наград; переносится и мигрирует', () => {
  const s = C.newState(NOCRIT);
  reach(s, 400); const r = C.ritual(s);
  assert.strictEqual(r.milestone.n, 1);
  assert.deepStrictEqual(s.titles, ['Пробуждённый']); assert.strictEqual(s.title, 'Пробуждённый');
  assert.ok(s.inbox.some(x => /Регрессия №1/.test(x.title)));
  s.rituals = 99; assert.strictEqual(C.ritualMilestone(s, 100).skin, 'eternal');
  assert.ok(s.skins.includes('eternal'));
  assert.strictEqual(C.setTitle(s, 'Нет такого'), false); assert.ok(C.setTitle(s, 'Вечный призванный'));
  const t = C.deserialize(C.serialize(s));
  assert.strictEqual(t.title, 'Вечный призванный'); assert.deepStrictEqual(t.skins, ['eternal']);
  const old = JSON.parse(C.serialize(s)); old.v = 23; old.rituals = 12; delete old.titles; delete old.title; delete old.skins;
  const m = C.deserialize(JSON.stringify(old));
  assert.deepStrictEqual(m.titles, ['Пробуждённый', 'Жрец Башни']); assert.deepStrictEqual(m.skins, []);
});

test('титулы дают небольшие постоянные бонусы: +5% урона, +5% золота, +10% урона (складываются)', () => {
  const s = C.newState(NOCRIT), t = C.newState(NOCRIT);
  s.titles = ['Пробуждённый'];
  assert.ok(Math.abs(C.permMult(s, 'tap') / C.permMult(t, 'tap') - 1.05) < 1e-9);
  assert.strictEqual(C.goldMult(s), C.goldMult(t));
  s.titles.push('Жрец Башни');
  assert.ok(Math.abs(C.goldMult(s) / C.goldMult(t) - 1.05) < 1e-9);
  s.titles.push('Вечный призванный');
  assert.ok(Math.abs(C.permMult(s, 'ally') / C.permMult(t, 'ally') - 1.15) < 1e-9);
});

test('последняя ступень достижения даёт титул с бонусом; старые сохранения получают титулы закрытых достижений', () => {
  const s = C.newState(NOCRIT), t = C.newState(NOCRIT), a = CFG.achievements.list.find(x => x.id === 'a_floor');
  s.ach.a_floor = a.goals.length - 1; s.bestFloor = s.maxFloor = a.goals[a.goals.length - 1];
  assert.ok(C.claimAch(s, 'a_floor'));
  assert.ok(s.titles.includes(a.title.name));
  assert.ok(Math.abs(C.titlePower(s, 'allDmg') - a.title.bonus.per) < 1e-9);
  const old = JSON.parse(C.serialize(s)); old.titles = []; old.title = null;
  const m = C.deserialize(JSON.stringify(old));
  assert.ok(m.titles.includes(a.title.name)); assert.strictEqual(m.title, a.title.name);
  assert.strictEqual(C.titlePower(t, 'gold'), 0);
});

// ---------- 0.54: удобство ----------
test('у каждого героя народ из 10 внутри одной из 4 сторон и роль по ульте; избранные и фильтры списка героев', () => {
  for (const a of CFG.allies) { assert.ok(CFG.factions.includes(a.faction), a.id); assert.ok(C.roleOf(a)); }
  const s = C.newState(NOCRIT);
  s.heroes.veil.unlocked = true;
  const all = C.heroList(s, {});
  assert.ok(all.indexOf('veil') < all.indexOf('shorokh'));                        // нанятые, редкость выше — выше
  assert.ok(all.indexOf('shorokh') < all.indexOf('kaeron'));                      // открытые выше закрытых
  for (const a of CFG.allies) assert.ok(CFG.sides[a.side] && CFG.sides[a.side].includes(a.faction), a.id);   // народ внутри своей стороны
  assert.ok(C.toggleFav(s, 'shorokh')); assert.strictEqual(C.heroList(s, {})[0], 'shorokh');  // избранный — первым
  assert.deepStrictEqual(C.heroList(s, { fav: true }), ['shorokh']);
  assert.ok(C.heroList(s, { faction: 'Тени' }).every(id => CFG.allies.find(a => a.id === id).faction === 'Тени'));
  assert.ok(C.heroList(s, { rarity: 'E', owned: true }).every(id => s.heroes[id].unlocked));
  assert.ok(C.heroList(s, { role: 'Удар' }).includes('shorokh'));
  s.allies.shorokh.level = 500; C.toggleFav(s, 'shorokh');
  assert.strictEqual(C.heroList(s, { sort: 'power', owned: true })[0], 'shorokh');
});

test('пресеты отряда: сохранить и загрузить состав и питомца; сохраняется в файле', () => {
  const s = C.newState(NOCRIT);
  const first = [...s.squad];
  assert.ok(C.savePreset(s, 0));
  C.squadRemove(s, first[0]); C.squadRemove(s, first[1]);
  assert.ok(C.savePreset(s, 1));
  assert.ok(C.loadPreset(s, 0)); assert.deepStrictEqual(s.squad, first);
  assert.strictEqual(C.loadPreset(s, 2), false); assert.strictEqual(C.savePreset(s, 3), false);
  const t = C.deserialize(C.serialize(s));
  assert.deepStrictEqual(t.presets[0].squad, first); assert.strictEqual(t.presets[1].squad.length, first.length - 2);
  C.toggleFav(s, 'lumi'); assert.deepStrictEqual(C.deserialize(C.serialize(s)).favs, ['lumi']);
});

test('«Забрать всё»: вход, задания, достижения и почта одной кнопкой', () => {
  const s = C.newState(NOCRIT); C.questsReset(s, 'd1', 'w1');
  for (const q of CFG.quests.daily) s.counters[q.key] = (s.counters[q.key] || 0) + q.goal;
  C.inboxAdd(s, 'тест', { tickets: 7 });
  const t0 = s.tickets;
  const r = C.claimEverything(s, '2026-11-05');
  assert.ok(r.count >= 3);
  assert.strictEqual(s.inbox.length, 0); assert.strictEqual(C.loginAvailable(s, '2026-11-05'), false);
  assert.ok(s.tickets >= t0 + 7);
  assert.strictEqual(r.reward.day, undefined); assert.strictEqual(r.reward.reward, undefined);
  assert.strictEqual(C.claimEverything(s, '2026-11-05'), null);
});

// ---------- 0.55: удобство-2 ----------
test('«надеть лучшие»: лучшая кость слота — герою, следующие — отряду и резерву', () => {
  const s = C.newState(NOCRIT);
  const lo = mkBone(s, 'armR', 1), hi = mkBone(s, 'armR', 4), mid = mkBone(s, 'armR', 2);
  assert.ok(C.equipBestAll(s));
  assert.strictEqual(hi.on, 'hero'); assert.strictEqual(mid.on, s.squad[0]); assert.strictEqual(lo.on, s.squad[1]);
  assert.strictEqual(C.equipBestAll(s), false);                      // уже лучшее — без изменений
});

test('«качать лучшего»: всё золото — в уровни самого сильного героя отряда', () => {
  const s = C.newState(NOCRIT);
  for (const id of s.squad) s.allies[id].level = 1;
  s.gold = 1e9;
  const r = C.levelBest(s);
  assert.strictEqual(r.id, 'lumi'); assert.ok(r.levels > 0);
  assert.ok(s.gold < C.allyCost(s, 'lumi', 1));
});

test('умный офлайн-отчёт: что можно купить; запись чисел — короткая или научная', () => {
  const s = C.newState(NOCRIT); s.gold = 1e6; s.materials.shard = 1e6;
  const a = C.nowAffordable(s);
  assert.ok(a.tap > 0 && a.allies.length > 0 && a.ranks.includes('hero'));
  assert.strictEqual(a.ritual, false);
  C.setNumMode('sci'); assert.strictEqual(C.fmt(1234567), '1.23e6'); assert.strictEqual(C.fmt(999), '999');
  C.setNumMode('short'); assert.strictEqual(C.fmt(1234567), '1.23M');
});

// ---------- 0.56: связи героев ----------
test('связи героев: все участники наняты — бонус урона или золота; герои в связях существуют', () => {
  for (const b of CFG.bonds) for (const id of b.heroes) assert.ok(CFG.allies.find(a => a.id === id), b.id + ':' + id);
  const s = C.newState(NOCRIT), t = C.newState(NOCRIT);
  assert.deepStrictEqual(C.activeBonds(s).map(b => b.id), []);
  for (const x of [s, t]) { x.heroes.velma.unlocked = true; x.heroes.rotgar.unlocked = true; x.allies.velma.level = 1; }
  s.allies.rotgar.level = 1; t.allies.shmyg.level = 1;               // 0.74: связи — по всем нанятым
  assert.deepStrictEqual(C.activeBonds(s).map(b => b.id), ['legion']);
  assert.ok(Math.abs(C.bondPower(s, 'allDmg') - 0.10) < 1e-9);
  assert.ok(Math.abs(C.permMult(s, 'tap') / C.permMult(t, 'tap') - 1.10) < 1e-9);   // одинаковые наборы героев, кроме связи
  assert.ok(C.bondsOf('kassian').length >= 2);
});

// ---------- 0.57: трофеи боссов ----------
test('трофеи: первый босс-убийца даёт трофей один раз; босс +0,5% урона, финальный +1% золота; миграция по рекорду', () => {
  const s = C.newState(NOCRIT), t = C.newState(NOCRIT); s.tapLevel = 1e12;
  assert.strictEqual(C.allTrophies().length, CFG.biomes.length * 3);
  reach(s, 10); killBoss(s);
  assert.deepStrictEqual(s.trophies, [C.trophyKey(10)]);
  assert.ok(Math.abs(C.permMult(s, 'tap') / C.permMult(t, 'tap') - 1.005) < 1e-9);
  C.goToFloor(s, 10); killBoss(s); assert.strictEqual(s.trophies.length, 1);         // повторно — нет
  assert.ok(C.grantTrophy(s, CFG.biomeFloors));                                      // финальный
  assert.ok(Math.abs(C.goldMult(s) / C.goldMult(t) - 1.01) < 1e-9);
  const old = JSON.parse(C.serialize(s)); old.v = 25; delete old.trophies; old.bestFloor = 120;
  const m = C.deserialize(JSON.stringify(old));
  assert.strictEqual(m.trophies.length, 3 + 3 + 2);                                  // 2 полных биома (по 3) + 2 босса третьего
});

// ---------- 0.58: «Эхо Башни» ----------
test('«Эхо Башни»: с этажа 50, биом из пройденных и модификатор недели, 3 попытки, первая победа недели — большая награда', () => {
  const s = C.newState(NOCRIT); s.tapLevel = 1e12;
  assert.strictEqual(C.echoInfo(s), null);
  s.bestFloor = s.maxFloor = 400; s.event.week = 'w2026-11-02';
  const x = C.echoInfo(s);
  assert.ok(x.biome && x.mod && x.left === CFG.pve.echo.attempts);
  assert.ok(CFG.biomes.indexOf(x.biome) < 8);                      // только пройденные биомы (400 / 50)
  assert.strictEqual(x.floor, Math.floor(400 * CFG.pve.echo.floorPct));
  assert.ok(C.enterMode(s, 'echo', {}));
  assert.strictEqual(s.mode.rule, x.mod.rule || null);
  assert.strictEqual(C.echoInfo(s).left, CFG.pve.echo.attempts - 1);
  s.mode.rule = null; s.mode.step = s.mode.total; s.enemy.hp = 1;   // последний враг — добить тапом
  const before = s.tickets;
  C.tap(s);
  assert.strictEqual(s.mode, null); assert.strictEqual(s.echo.won, true);
  assert.strictEqual(s.tickets, before + CFG.pve.echo.first.tickets);
  assert.ok(C.enterMode(s, 'echo', {})); s.mode.rule = null; s.mode.step = s.mode.total; s.enemy.hp = 1;
  const t1 = s.tickets; C.tap(s);
  assert.strictEqual(s.tickets, t1);                              // повторная победа — только осколки
  const t = C.deserialize(C.serialize(s)); assert.strictEqual(t.echo.used, 2); assert.strictEqual(t.echo.won, true);
  s.event.week = 'w2026-11-09'; assert.strictEqual(C.echoInfo(s).left, CFG.pve.echo.attempts);   // новая неделя
});

// ---------- 0.59: проклятые этажи ----------
test('проклятые этажи: редкое предложение на новом этаже, по желанию; принято — условие и награда за босса; провал — снято', () => {
  const K = CFG.curse;
  let f = K.minFloor; const s = C.newState(NOCRIT); s.tapLevel = 1e12;
  for (;; f++) { s.floor = f; s.bestCleared = f - 1; s.curse = null; if (C.curseOffer(s, [], false)) break; }
  assert.ok(f < 2000);                                               // встречается
  let n = 0; for (let g = K.minFloor; g < K.minFloor + 3000; g++) { s.floor = g; s.bestCleared = g - 1; s.curse = null; if (C.curseOffer(s, null, false)) n++; }
  assert.ok(n > 3000 * K.chance * 0.5 && n < 3000 * K.chance * 1.6, 'частота ' + n);
  s.floor = f; s.bestCleared = f - 1; s.curse = null; C.curseOffer(s, [], false);
  s.maxFloor = s.bestFloor = f;
  assert.strictEqual(C.curseMod(s), null);                            // пока не принято — обычный этаж
  assert.ok(C.acceptCurse(s)); assert.ok(C.curseMod(s));
  const mod = C.curseMod(s);
  if (mod.hp) assert.ok(C.B.gt(s.enemy.maxHp, C.enemyMaxHp(f, false)));
  s.curse.mod = 'hp2';                                                // дальше — без запрета тапов
  const t0 = s.tickets; killBoss(s);
  assert.strictEqual(s.tickets - t0 >= K.reward.tickets, true); assert.strictEqual(s.curse, null);
  // провал босса снимает проклятие
  s.floor = f; s.curse = { floor: f, mod: 'hp2', on: true }; s.enemyIndex = CFG.enemiesPerFloor; C.challengeBoss(s);
  const ev = C.tick(s, 999); assert.ok(ev.some(e => e.type === 'curseLost')); assert.strictEqual(s.curse, null);
  // повторно на уже пройденном этаже — не предлагается; сохранение
  s.floor = f; s.bestCleared = f; assert.strictEqual(C.curseOffer(s, [], false), null);
  s.curse = { floor: f, mod: 'noTap', on: false };
  assert.deepStrictEqual(C.deserialize(C.serialize(s)).curse, { floor: f, mod: 'noTap', on: false });
});

// ---------- 0.60: алхимия ----------
test('алхимия: зелья за осколки и эссенцию, ×2 на время, продление до предела, тратятся и офлайн, сохраняются', () => {
  const s = C.newState(NOCRIT), t = C.newState(NOCRIT); s.bestFloor = 100;
  const c = C.potionCost(s, 'gold');
  assert.strictEqual(c.shard, C.shardsForBoss(100) * 15);
  assert.strictEqual(C.brewPotion(s, 'gold'), false);                // не хватает
  s.materials.shard = 1e6; s.essence = 1000;
  assert.ok(C.brewPotion(s, 'gold'));
  assert.strictEqual(C.goldMult(s), C.goldMult(t) * 2);
  assert.ok(C.brewPotion(s, 'dmg')); assert.ok(Math.abs(C.permMult(s, 'tap') / C.permMult(t, 'tap') - 2) < 1e-9);
  assert.ok(C.brewPotion(s, 'shard')); assert.strictEqual(C.shardMult(s), C.shardMult(t) * 2);
  for (let i = 0; i < 3; i++) C.brewPotion(s, 'gold');
  assert.strictEqual(C.brewPotion(s, 'gold'), false);                // 4×30 мин = 2 ч — предел
  assert.strictEqual(s.potions.gold, 7200);
  C.tick(s, 900); assert.strictEqual(s.potions.dmg, undefined);     // 15 минут прошло
  assert.strictEqual(C.deserialize(C.serialize(s)).potions.gold, s.potions.gold);
  C.offlineProgress(s, 8 * 3600); assert.strictEqual(s.potions.gold, undefined);
});

// ---------- 0.61: вехи Башни ----------
test('вехи Башни: 1000 — герой, 2500 — питомец, 5000 — особый артефакт; повтор — копии; дальше каждые 50 000; поиск за души без «Венца»', () => {
  const s = C.newState(NOCRIT);
  s.bestFloor = s.maxFloor = 5000;
  const got = C.towerMilestones(s, []);
  assert.deepStrictEqual(got, [1000, 2500, 5000]);
  assert.ok(s.heroes.seiren.unlocked); assert.ok(C.petForm(s, 'griffin')); assert.strictEqual(C.artLevel(s, 'crown'), 1);
  assert.strictEqual(s.inbox.length, 3);
  assert.deepStrictEqual(C.towerMilestones(s, []), []);              // второй раз не выдаётся
  assert.strictEqual(C.nextTowerMs(s).at, 10000);
  const t = C.newState(NOCRIT); t.heroes.seiren.unlocked = true; t.bestFloor = 1000;
  C.towerMilestones(t, []); assert.strictEqual(t.heroes.seiren.copies, 5);
  const u = C.newState(NOCRIT); u.towerMs = 100000; u.bestFloor = 200000;
  assert.deepStrictEqual(C.towerMilestones(u, []), [150000, 200000]);
  assert.strictEqual(C.nextTowerMs(u).at, 250000);
  // «Венец» не находится поиском и не мешает «все найдены»
  const v = C.newState(NOCRIT); v.souls = 1e30;
  while (C.findCost(v) != null) assert.notStrictEqual(C.findArtifact(v), 'crown');
  assert.strictEqual(C.artLevel(v, 'crown'), 0);
  assert.strictEqual(C.deserialize(C.serialize(s)).towerMs, 5000);
});

// ---------- 0.62: дневник призванного ----------
test('дневник: победы по видам, страница биома — награда, знаток вида; лор по звёздам; сохраняется', () => {
  const s = C.newState(NOCRIT); s.tapLevel = 1e12;
  const b = CFG.biomes[0], names = C.diaryNames(b);
  for (const n of names.slice(0, -1)) s.bestiary[n] = 1;
  const ev = [];
  for (let f = 1; f <= 50 && !s.diaryPages.length; f++) { reach(s, f); s.enemyIndex = CFG.enemiesPerFloor; C.challengeBoss(s); ev.push(...killCurrent(s)); respawn(s); }
  assert.deepStrictEqual(s.diaryPages, [b.id]);
  assert.ok(ev.some(e => e.type === 'diaryPage'));
  s.bestiary[b.final] = CFG.diary.master - 1; const e0 = s.crystals | 0;        // тысячная победа над видом — 💎 (0.126)
  reach(s, 50); killBoss(s);
  assert.strictEqual(s.bestiary[b.final], CFG.diary.master);
  assert.strictEqual(s.crystals | 0, e0 + CFG.diary.masterReward.crystals);
  assert.strictEqual(C.loreLevel(s, 'shorokh'), 0); s.heroes.shorokh.stars = 3; assert.strictEqual(C.loreLevel(s, 'shorokh'), 1);
  s.heroes.shorokh.stars = 8; assert.strictEqual(C.loreLevel(s, 'shorokh'), 2); assert.strictEqual(C.loreLevel(s, 'azrael'), -1);
  assert.ok(CFG.allies.every(a => a.story && a.quote));
  const t = C.deserialize(C.serialize(s)); assert.deepStrictEqual(t.diaryPages, [b.id]); assert.strictEqual(t.bestiary[b.final], CFG.diary.master);
});

// ---------- 0.63: скрытые комнаты ----------
test('скрытые комнаты: одна на каждые CONFIG.secret.every этажей, открывается первой победой над боссом, Страж тайника — награда один раз', () => {
  const E = CFG.secret.every;
  for (let k = 0; k < 20; k++) { const f = C.secretFloor(k); assert.ok(f > k * E && f <= (k + 1) * E); assert.ok(C.isSecretFloor(f)); }
  const f = C.secretFloor(0), s = C.newState(NOCRIT); s.tapLevel = 1e12;
  reach(s, f); s.bestCleared = f - 1; const ev = killBoss(s);
  assert.deepStrictEqual(s.secrets, [{ floor: f, done: false }]);
  assert.ok(C.enterMode(s, 'secret', { floor: f }));
  assert.ok(C.B.gt(s.enemy.maxHp, C.enemyMaxHp(f, true)));
  const t0 = s.tickets; s.enemy.hp = 1; C.tap(s);
  assert.strictEqual(s.mode, null); assert.strictEqual(s.secrets[0].done, true);
  assert.strictEqual(s.tickets, t0 + CFG.secret.reward.tickets);
  assert.strictEqual(C.enterMode(s, 'secret', { floor: f }), null);   // второй раз нельзя
  assert.deepStrictEqual(C.deserialize(C.serialize(s)).secrets, [{ floor: f, done: true }]);
  const old = JSON.parse(C.serialize(s)); old.v = 31; delete old.secrets; old.bestFloor = 8000;
  assert.strictEqual(C.deserialize(JSON.stringify(old)).secrets.length, Array.from({ length: Math.ceil(8000 / E) + 1 }, (_, k) => k).filter(k => C.secretFloor(k) <= 7999).length);
});

// ---------- 0.64: престиж аккаунта ----------
test('престиж аккаунта: уровень из всего прогресса, награда за каждый уровень, рамки каждые 10 уровней; переносится', () => {
  const s = C.newState(NOCRIT);
  const x0 = C.prestigeXp(s);
  s.bestFloor = 5000; s.rituals = 10; s.trophies = ['crypt:0', 'crypt:1'];
  assert.strictEqual(C.prestigeXp(s), x0 + 5000 - 1 + 10 * 200 + 2 * 30 + 0);
  const L = C.prestigeLevel(s);
  assert.ok(C.prestigeNeed(L) <= C.prestigeXp(s) && C.prestigeNeed(L + 1) > C.prestigeXp(s));
  const t0 = s.tickets, r = C.claimPrestige(s);
  assert.strictEqual(r.levels, L); assert.strictEqual(s.tickets, t0 + L * CFG.prestige.reward.tickets);
  assert.strictEqual(C.claimPrestige(s), null);
  s.bestFloor = 200000; C.claimPrestige(s);
  assert.ok(C.prestigeFrames(s).length >= 1 && s.frame);
  assert.ok(C.setFrame(s, CFG.prestige.frames[0])); assert.strictEqual(C.setFrame(s, 'Нет такой'), false);
  const t = C.deserialize(C.serialize(s)); assert.strictEqual(t.prestigeClaimed, s.prestigeClaimed); assert.strictEqual(t.frame, CFG.prestige.frames[0]);
  const old = JSON.parse(C.serialize(s)); old.v = 32; delete old.prestigeClaimed; delete old.frame;
  assert.strictEqual(C.deserialize(JSON.stringify(old)).prestigeClaimed, 0);
});

// ---------- 0.65: перенос прокачки ----------
test('перенос прокачки: 70% звёзд и ранга новому герою той же редкости или выше, источник теряет; ранг не выше эволюции цели', () => {
  const s = C.newState(NOCRIT); s.essence = 1000;
  s.heroes.shorokh.stars = 10; s.heroes.shorokh.rank = 50; s.allies.shorokh.level = 3000;
  s.heroes.veil.unlocked = true; s.heroes.veil.stars = 5; s.heroes.borg.unlocked = true;
  assert.strictEqual(C.transferPreview(s, 'veil', 'shorokh'), null);   // B → E нельзя (редкость ниже)
  const p = C.transferPreview(s, 'shorokh', 'borg');
  assert.strictEqual(p.stars, 7);
  assert.strictEqual(p.rank, C.rankCapForEvo(0));                     // 35 упирается в потолок без эволюции (29)
  assert.ok(C.transferProgress(s, 'shorokh', 'borg'));
  assert.strictEqual(s.heroes.borg.stars, 7); assert.strictEqual(s.heroes.shorokh.stars, 0); assert.strictEqual(s.heroes.shorokh.rank, 0);
  assert.strictEqual(s.allies.shorokh.level, C.allyCap(s, 'shorokh'));    // уровень обрезан до нового потолка
  assert.strictEqual(s.essence, 1000 - CFG.transfer.essence * 2);      // D — номер 1
  assert.strictEqual(C.transferPreview(s, 'shorokh', 'borg'), null);    // переносить больше нечего
  s.heroes.saya.unlocked = true; s.heroes.saya.evo = 1; s.heroes.borg.rank = 40;
  assert.strictEqual(C.transferPreview(s, 'borg', 'saya').rank, 28);   // 40·0,7, эволюция I позволяет до 59
});

// ---------- 0.67: новый ростер ----------
test('ростер 52 героя: 13 на сторону, стартовые 4 героя E, у всех лор; миграция v33 переносит прогресс по слотам', () => {
  assert.strictEqual(CFG.allies.length, 52);
  for (const sd in CFG.sides) assert.strictEqual(CFG.allies.filter(a => a.side === sd).length, 13, sd);
  assert.deepStrictEqual(CFG.allies.filter(a => a.starter).map(a => a.id), ['shorokh', 'kostik', 'shmyg', 'lumi']);
  assert.ok(CFG.allies.every(a => a.race && a.quote && a.story));
  const s = C.newState(NOCRIT), old = JSON.parse(C.serialize(s));
  old.v = 33;
  old.heroes = { irene: { copies: 3, stars: 2, evo: 1, rank: 5 }, borg: { copies: 1, stars: 0, evo: 0, rank: 0 }, lia: { copies: 0, stars: 0, evo: 0, rank: 0 },
                 kael: { copies: 9, stars: 4, evo: 0, rank: 12 }, garret: { copies: 2, stars: 1, evo: 0, rank: 0 }, noa: { copies: 0, stars: 3, evo: 0, rank: 0 } };
  old.allies = { irene: 77, kael: 12 };
  old.squad = ['irene', 'borg', 'lia', 'kael']; old.favs = ['kael', 'garret'];
  const m = C.deserialize(JSON.stringify(old));
  assert.ok(m);
  assert.strictEqual(m.heroes.shorokh.stars, 2); assert.strictEqual(m.heroes.shorokh.rank, 5); assert.strictEqual(m.allies.shorokh.level, 77);
  assert.strictEqual(m.heroes.lumi.copies, 9); assert.strictEqual(m.heroes.lumi.rank, 12);
  assert.strictEqual(m.heroes.irene.unlocked, true); assert.strictEqual(m.heroes.irene.stars, 1);   // Гаррет → Ирэн
  assert.strictEqual(m.heroes.veil.stars, 3);                                                        // Ноа → Вейл
  assert.strictEqual(m.heroes.borg.unlocked, true);                                                  // Борг остаётся открытым
  assert.deepStrictEqual(m.squad, ['shorokh', 'kostik', 'shmyg', 'lumi']);
  assert.deepStrictEqual(m.favs, ['lumi', 'irene']);
});

test('фильтр списка героев по стороне', () => {
  const s = C.newState(NOCRIT);
  const t = C.heroList(s, { side: 'Тени' });
  assert.strictEqual(t.length, 13); assert.ok(t.every(id => CFG.allies.find(a => a.id === id).side === 'Тени'));
});

test('0.74: лесенка открытий — системы закрыты до своего этажа', () => {
  const U = UNLOCKS, s = C.newState(NOCRIT);
  CFG.unlocks = U;
  try {
    assert.strictEqual(U.portal, 25); assert.strictEqual(U.artifacts, 50); assert.strictEqual(U.ritual, 150); assert.strictEqual(U.pets, 1250); assert.strictEqual(U.bones, 2000);
    assert.strictEqual(C.unlockedAt(s, 'portal'), false);
    s.bestFloor = 25; assert.strictEqual(C.unlockedAt(s, 'portal'), true); assert.strictEqual(C.unlockedAt(s, 'pets'), false);
    s.floor = 600; s.bestCleared = 599; assert.strictEqual(C.secretFind(s, 750, []), null);   // скрытые комнаты — с 750
  } finally { CFG.unlocks = {}; }
});

test('0.74: мега-босс даёт души и первый артефакт даром', () => {
  const s = C.newState(NOCRIT); s.tapLevel = 1e9;
  reach(s, 50); s.floor = 50; s.enemyIndex = CFG.enemiesPerFloor; C.challengeBoss(s);
  const souls0 = C.B.toNum(s.souls);
  const ev = killCurrent(s);
  assert.ok(ev.some(e => e.type === 'megaSouls'));
  assert.ok(C.B.toNum(s.souls) > souls0);
  assert.ok(CFG.artifacts.some(a => !a.special && C.artLevel(s, a.id) === 1));
});

test('клетка с Шорохом: 3 этаж, 1-я волна, тапами — союзник свободен и в отряде', () => {
  CFG.cage = CAGE;
  try {
    const s = C.newState(() => 0.5);
    s.floor = 3; s.maxFloor = 3; s.enemyIndex = 1; s.heroes.shorokh.unlocked = false; s.allies.shorokh.level = 0;
    s.enemy.alive = false; s.respawn = 0; C.tick(s, 0.05);
    assert.strictEqual(s.enemy.name, CAGE.name); assert.ok(s.enemy.cage);
    let ev = [], n = 0;
    while (s.enemy.alive && n++ < 100) { s.tpsWin.n = 0; ev = ev.concat(C.tap(s)); }
    assert.ok(n <= CAGE.taps + 1);
    assert.ok(ev.some(e => e.type === 'freed' && e.id === 'shorokh'));
    assert.ok(s.cageFreed && s.heroes.shorokh.unlocked && s.allies.shorokh.level >= 1);
    s.respawn = 0; C.tick(s, 0.05);
    assert.notStrictEqual(s.enemy.name, CAGE.name);   // второй раз клетки нет
    assert.strictEqual(C.deserialize(C.serialize(s)).cageFreed, true);
  } finally { CFG.cage = null; }
});

test('0.92 витрина артефактов: покупка пустит слот, обновление за треть цены, кровавые — за осколки', () => {
  let r = 0; const s = C.newState({ rng: () => (r = (r * 9301 + 49297) % 233280) / 233280 });
  const o = C.shopOffers(s, 'soul');
  assert.strictEqual(o.length, CFG.artShop.slots); assert.ok(o.every(id => id && !CFG.artifacts.find(a => a.id === id).blood));
  assert.strictEqual(C.shopBuy(s, 'soul', 0), null);                     // нет душ
  s.souls = 1000;
  const cost = C.shopBuyCost(s, 'soul'), id = C.shopBuy(s, 'soul', 0);
  assert.strictEqual(id, o[0]); assert.strictEqual(s.artifacts[id], 1); assert.strictEqual(s.souls, 1000 - cost);
  assert.strictEqual(C.shopOffers(s, 'soul')[0], null);                  // слот пуст до обновления
  const rc = C.shopRefreshCost(s, 'soul'); assert.strictEqual(rc, Math.ceil(C.shopBuyCost(s, 'soul') / CFG.artShop.refreshDiv));
  const before = s.souls; assert.ok(C.shopRefresh(s, 'soul')); assert.strictEqual(s.souls, before - rc);
  assert.ok(C.shopOffers(s, 'soul').every(x => x && x !== id));
  // кровавая ветка
  const b = C.shopOffers(s, 'blood'); assert.ok(b.every(x => CFG.artifacts.find(a => a.id === x).blood));
  const sb = s.souls; s.materials.shard = 100;
  const bid = C.shopBuy(s, 'blood', 1); assert.ok(bid); assert.strictEqual(s.materials.shard, 100 - CFG.artShop.blood.cost); assert.strictEqual(s.souls, sb);
  s.materials.shard = 1000; const uc = C.upgradeArtCost(s, bid); assert.ok(C.upgradeArtifact(s, bid)); assert.strictEqual(s.materials.shard, 1000 - uc);
  // сохранение
  const t2 = C.deserialize(C.serialize(s)); assert.deepStrictEqual(t2.artShop, s.artShop);
  // всё куплено — витрина пуста, цен нет
  s.souls = 1e9; for (let k = 0; k < 20; k++) { const off = C.shopOffers(s, 'soul'); const i = off.findIndex(Boolean); if (i < 0) break; C.shopBuy(s, 'soul', i); }
  assert.strictEqual(C.shopBuyCost(s, 'soul'), null); assert.strictEqual(C.shopRefreshCost(s, 'soul'), null);
});

// ---------- 0.99: герои E–B за золото цепочкой (как в «Крушителях») ----------
test('цепочка за золото: виден следующий по цене, покупка открывает и нанимает, A+ — только портал', () => {
  const s = C.newState({ rng: () => 0 });
  const L = C.chainList();
  assert.ok(L.length > 10);
  assert.ok(L.every(a => CFG.rarities.indexOf(a.rarity) <= CFG.rarities.indexOf(CFG.goldHire.maxRarity)), 'только до ранга goldHire.maxRarity');
  if (CFG.cage) assert.ok(!L.some(a => a.id === CFG.cage.ally), 'герой из клетки — не в цепочке');
  for (let i = 1; i < L.length; i++) assert.ok(L[i].hireCost >= L[i - 1].hireCost, 'по возрастанию цены');
  const first = C.chainNext(s); assert.strictEqual(first, L[0].id);
  s.gold = 0; assert.strictEqual(C.buyChainHero(s), null);
  s.gold = L[0].hireCost; assert.strictEqual(C.buyChainHero(s), first);
  assert.strictEqual(s.gold, 0); assert.ok(s.heroes[first].unlocked); assert.strictEqual(s.allies[first].level, 1);
  assert.strictEqual(C.chainNext(s), L[1].id);
  // герой из портала (копии) пропускается
  s.heroes[L[1].id].copies = 1; s.heroes[L[1].id].unlocked = true;
  assert.strictEqual(C.chainNext(s), L[2].id);
  // покупка переживает сохранение; после сброса уровней (ритуал) цепочка не откатывается
  const t = C.deserialize(C.serialize(s)); assert.deepStrictEqual(t.goldHired, [first]);
  t.allies[first].level = 0; assert.strictEqual(C.chainNext(t), L[2].id);
  // вся цепочка куплена → null
  s.gold = 1e30; let n = 0; while (C.buyChainHero(s) && n++ < 100); assert.strictEqual(C.chainNext(s), null);
});

test('0.100: после ритуала все открытые герои остаются — их можно снова нанять за золото', () => {
  const s = C.newState({ rng: () => 0 }); s.gold = 1e12; s.cageFreed = true;
  if (CFG.cage) { s.heroes[CFG.cage.ally].unlocked = true; s.allies[CFG.cage.ally].level = 5; }
  let n = 0; while (C.buyChainHero(s) && n++ < 6);
  const got = [...s.goldHired];
  s.maxFloor = s.bestFloor = s.floor = CFG.ritual.floor; C.ritual(s);
  for (const id of got) { assert.ok(s.heroes[id].unlocked, id); assert.strictEqual(s.allies[id].level, 0); assert.ok(C.chainOwned(s, id)); }
  if (CFG.cage) assert.ok(C.chainOwned(s, CFG.cage.ally), 'герой из клетки не пропадает после ритуала');
  s.gold = 1e12; assert.ok(C.buyAlly(s, got[got.length - 1], 1), 'нанимается сразу любой, не по порядку');
});

// ---------- 0.102: Рынок (как в Idle Heroes) и кристаллы ----------
test('Рынок: slots товаров, сам обновляется раз в 3 часа, обновление за 💎, цены в душах растут с рекордом, зелья', () => {
  let r = 0; const s = C.newState({ rng: () => (r = (r * 9301 + 49297) % 233280) / 233280 });
  const M = CFG.market, t0 = 1e12;
  const left = C.marketSync(s, t0);
  assert.strictEqual(s.market.items.length, M.slots); assert.strictEqual(left, M.refreshSec * 1000);
  assert.ok(!M.goods.some(g => g.cur === 'gold'), 'золота на Рынке нет — души и 💎 (0.107)');
  const before = JSON.stringify(s.market.items);
  C.marketSync(s, t0 + 1000); assert.strictEqual(JSON.stringify(s.market.items), before, 'до таймера не меняется');
  C.marketSync(s, t0 + M.refreshSec * 1000); assert.strictEqual(s.market.next, t0 + 2 * M.refreshSec * 1000, 'по таймеру — новые товары');
  // покупка за души
  s.market.items[0] = { g: 'ticket1', hero: null, sold: false };
  const g = C.marketGood('ticket1'), price = C.marketPrice(s, g);
  assert.ok(price >= 1);
  s.souls = 0; assert.strictEqual(C.marketBuy(s, 0), null);
  s.souls = 1000; const tk = s.tickets; assert.ok(C.marketBuy(s, 0)); assert.strictEqual(s.tickets, tk + 1); assert.strictEqual(B.toNum(s.souls), 1000 - price);
  assert.strictEqual(C.marketBuy(s, 0), null, 'купленное второй раз не купить');
  s.bestFloor = 500; assert.ok(C.marketPrice(s, g) > price, 'цена в душах растёт с рекордом');
  // зелье
  const pd = CFG.alchemy.potions[0]; s.market.items[1] = { g: 'potion', hero: null, p: pd.id, sold: false }; s.souls = 1e6;
  assert.ok(C.marketBuy(s, 1)); assert.strictEqual(s.potions[pd.id], pd.sec);
  s.potions[pd.id] = CFG.alchemy.maxSec; s.market.items[2] = { g: 'potion', hero: null, p: pd.id, sold: false };
  assert.strictEqual(C.marketBuy(s, 2), null, 'зелье сверх предела времени не купить');
  // кристаллы: обновление и товар
  assert.strictEqual(C.marketRefresh(s), false);
  s.crystals = M.refreshCost; assert.ok(C.marketRefresh(s)); assert.strictEqual(s.crystals, 0);
  s.market.items[0] = { g: 'ticket5', hero: null, sold: false }; s.crystals = 1000; const tk2 = s.tickets;
  assert.ok(C.marketBuy(s, 0)); assert.strictEqual(s.tickets, tk2 + 5); assert.strictEqual(s.crystals, 1000 - C.marketGood('ticket5').price);
  // копия героя: новый открывается, известный даёт копию
  const a = CFG.allies.find(x => x.rarity === 'C'); s.market.items[1] = { g: 'copyLow', hero: a.id, sold: false };
  assert.strictEqual(C.marketBuy(s, 1).isNew, true); assert.ok(s.heroes[a.id].unlocked);
  s.market.items[1] = { g: 'copyLow', hero: a.id, sold: false }; C.marketBuy(s, 1); assert.strictEqual(s.heroes[a.id].copies, 1);
  // сохранение
  s.market.items[3] = { g: 'potion', hero: null, p: pd.id, sold: false };
  const t = C.deserialize(C.serialize(s)); assert.deepStrictEqual(t.market, s.market); assert.strictEqual(t.crystals, s.crystals);
});
test('кристаллы: бесплатно немного — за первое прохождение мега-босса', () => {
  const s = C.newState({ rng: () => 0.5 });
  assert.strictEqual(s.crystals, 0); assert.ok(CFG.crystals.megaFirst > 0);
});

test('0.109: светлый ритуал — за 💎, души ×mult; тёмный — бесплатно', () => {
  const mk = () => { const s = C.newState({ rng: () => 0.5 }); s.maxFloor = s.bestFloor = s.floor = CFG.ritual.floor + 20; return s; };
  const a = mk(), base = B.toNum(C.ritualSouls(a)); const ra = C.ritual(a, 'dark'); assert.strictEqual(B.toNum(ra.souls), base); assert.strictEqual(ra.light, false);
  const b = mk(); b.crystals = 0; assert.strictEqual(C.ritual(b, 'light'), null, 'без 💎 светлый не провести');
  b.crystals = CFG.ritual.light.crystals; const rb = C.ritual(b, 'light');
  assert.strictEqual(B.toNum(rb.souls), Math.floor(base * CFG.ritual.light.mult)); assert.strictEqual(b.crystals, 0);
});

test('экспедиции: доска, условия, герой в одном походе, награда по времени, сохранение (0.142)', () => {
  let x = 0.37; const s = C.newState({ ...NOCRIT, rng: () => (x = (x * 9301 + 49297) % 233280 / 233280) });
  s.bestFloor = s.maxFloor = 100;
  const E = CFG.expeditions, offers = C.expRefresh(s, '2026-11-07');
  assert.strictEqual(offers.length, E.board);
  CFG.allies.forEach(a => { s.heroes[a.id].unlocked = true; });
  // подберём героев под условия перебором
  const pickFor = o => { const L = E.lengths[o.len], ids = CFG.allies.map(a => a.id);
    for (let t = 0; t < 4000; t++) { const team = []; while (team.length < L.team) { const id = ids[Math.floor(Math.random() * ids.length)]; if (!team.includes(id) && !C.expBusy(s, id)) team.push(id); }
      if (C.expCheck(s, o.uid, team).ok) return team; } return null; };
  const o = offers.find(q => !q.req.some(r => r.k === 'stars')) || offers[0];
  const team = pickFor(o); assert.ok(team, 'нашлась команда');
  assert.strictEqual(C.expCheck(s, o.uid, team.slice(1)).ok, false);           // мало героев
  assert.ok(C.expStart(s, o.uid, team, 1000));
  assert.strictEqual(s.exp.offers.length, E.board);                              // предложение заменено
  assert.ok(C.expBusy(s, team[0]));
  const o2 = s.exp.offers[0]; const t2 = [team[0], ...CFG.allies.map(a => a.id).filter(id => !team.includes(id)).slice(0, E.lengths[o2.len].team - 1)];
  assert.strictEqual(C.expCheck(s, o2.uid, t2).ok, false);                       // герой уже в походе
  const run = s.exp.runs[0];
  assert.strictEqual(C.expClaim(s, run.uid, run.end - 1), null);                 // ещё в пути
  const save = JSON.parse(C.serialize(s)); const m = C.deserialize(JSON.stringify(save));
  assert.strictEqual(m.exp.runs.length, 1); assert.deepStrictEqual(m.exp.runs[0].heroes, run.heroes);
  const sh = s.materials.shard, tk = s.tickets, cp = team.reduce((n, id) => n + s.heroes[id].copies, 0);
  const r = C.expClaim(s, run.uid, run.end);
  assert.ok(r && r.shard > 0);
  assert.strictEqual(s.materials.shard, sh + r.shard); assert.strictEqual(s.tickets, tk + r.tickets);
  assert.strictEqual(team.reduce((n, id) => n + s.heroes[id].copies, 0), cp + r.copies.length);
  assert.strictEqual(s.exp.runs.length, 0); assert.ok(!C.expBusy(s, team[0]));
  // условие «ранг не выше»
  const e = CFG.allies.find(a => a.rarity === 'E'), g = CFG.allies.find(a => a.rarity === 'GOD');
  assert.ok(C.expReqOk(s, { k: 'maxRank', r: 'C' }, [e.id])); assert.ok(!C.expReqOk(s, { k: 'maxRank', r: 'C' }, [e.id, g.id]));
});

test('личные боссы: 3 бесплатно + до 7 за 💎 в день (0.143)', () => {
  const s = C.newState(NOCRIT), P = CFG.pve.personal;
  s.pve.used.personal = P.attempts; assert.strictEqual(C.attemptsLeft(s, 'personal'), 0);
  s.crystals = 0; assert.strictEqual(C.buyPersonal(s), false);
  s.crystals = 10000;
  for (let i = 0; i < P.buyMax; i++) { const c = C.personalBuyCost(s); assert.ok(C.buyPersonal(s)); assert.strictEqual(C.attemptsLeft(s, 'personal'), 1); s.pve.used.personal++; assert.ok(c > 0); }
  assert.strictEqual(C.personalBuyCost(s), null); assert.strictEqual(C.buyPersonal(s), false);
  assert.strictEqual(s.crystals, 10000 - P.buyCost.reduce((a, b) => a + b, 0));
  C.dailyReset(s, 'другой-день'); assert.strictEqual(C.attemptsLeft(s, 'personal'), P.attempts);
});

test('тотемы (0.144): открываются на этаже unlocks.totems, пройденные биомы дают тотемы задним числом; личные боссы — по рекорду', () => {
  const keep = CFG.unlocks; CFG.unlocks = { totems: UNLOCKS.totems };
  const s = C.newState(NOCRIT);
  s.bestFloor = s.maxFloor = 200;
  assert.strictEqual(C.personalBosses(s).length, 3);           // биомы 1–3 пройдены (рекорд > 50, 100, 150)
  C.tick(s, 0.01); assert.strictEqual(C.totemCount(s), 0);       // тотемы ещё закрыты
  s.bestFloor = s.maxFloor = CFG.unlocks.totems + 1;
  C.tick(s, 0.01);
  assert.strictEqual(C.totemCount(s), Math.floor(CFG.unlocks.totems / CFG.biomeFloors));
  assert.ok(C.permMult(s, 'tap') > C.permMult(C.newState(NOCRIT), 'tap'));
  CFG.unlocks = keep;
});

test('древо «Искры Башни» открывается после первой регрессии; старое «crack» → «grip» (0.145)', () => {
  const s = C.newState(NOCRIT);
  assert.strictEqual(C.unlockedAt(s, 'tree'), false);
  s.rituals = 1; assert.strictEqual(C.unlockedAt(s, 'tree'), true);
  const d = JSON.parse(C.serialize(s)); d.tree = { crack: 3 };
  assert.strictEqual(C.deserialize(JSON.stringify(d)).tree.grip, 3);
});

test('сезон: премиум-дорожка за 💎 (0.146)', () => {
  const s = C.newState(NOCRIT);
  s.crystals = CFG.season.premiumCost - 1; assert.strictEqual(C.buyPremium(s), false);
  s.crystals = CFG.season.premiumCost; assert.ok(C.buyPremium(s)); assert.strictEqual(s.crystals, 0); assert.ok(s.season.premium);
  assert.strictEqual(C.buyPremium(s), false);
});

test('Эхо: «Тишина» блокирует ульту героя (0.149)', () => {
  const s = C.newState(NOCRIT); s.maxFloor = s.bestFloor = 100;
  s.mode = { kind: 'echo', rule: 'noUlts' };
  const id = CFG.abilities[0].id; s.abilities[id].cd = 0;
  assert.deepStrictEqual(C.useAbility(s, id), []);
  s.mode = null; assert.ok(C.useAbility(s, id).length || !C.abilityReady(s, id));
});
