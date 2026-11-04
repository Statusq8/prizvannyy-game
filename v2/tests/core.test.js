// Тесты ядра: node --test tests/
const test = require('node:test');
const assert = require('node:assert');
const C = require('../src/core.js');
const CFG = C.CONFIG;
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
  assert.strictEqual(C.allyDpsAt(a.id, 25), a.baseDps * 25 * m * m);
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
  assert.strictEqual(C.damageMult(s, 'irene'), 1);
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
  assert.strictEqual(r[0].id, 'irene');               // стартовый → сразу дубликат
  assert.strictEqual(r[0].isNew, false);
  assert.strictEqual(s.heroes.irene.copies, 3);
});

test('новый герой из портала открывается', () => {
  let k = 0;
  const seq = [0.0, 0.99];                             // редкость E, второй герой E (Гаррет)
  const s = C.newState({ rng: () => seq[k++ % 2] });
  s.tickets = 1;
  const r = C.summon(s, 1);
  assert.strictEqual(r[0].id, 'garret');
  assert.strictEqual(r[0].isNew, true);
  assert.strictEqual(s.heroes.garret.unlocked, true);
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
  s.pity = { a: -1e9, s: -1e9 };                       // отключаем гарантии для замера
  const r = C.summon(s, 40000);
  const share = r.filter(x => x.rarity === 'E').length / r.length;
  const total = Object.values(CFG.portal.odds).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(share - CFG.portal.odds.E / total) < 0.02, 'E ' + share);
});

test('звёзды: за дубликаты, до 10, повышают только индивидуальный DPS', () => {
  const s = C.newState(NOCRIT);
  s.allies.irene.level = 10;
  const before = C.allyDps(s, 'irene');
  assert.strictEqual(C.starUp(s, 'irene'), false);   // нет копий
  s.heroes.irene.copies = 1000;
  assert.ok(C.starUp(s, 'irene'));
  assert.strictEqual(C.allyDps(s, 'irene'), before * (1 + CFG.starDpsBonus));
  while (C.starUp(s, 'irene'));
  assert.strictEqual(s.heroes.irene.stars, CFG.maxStars);
  const spent = CFG.starCopies.reduce((a, b) => a + b, 0);
  assert.strictEqual(s.heroes.irene.copies, 1000 - spent);
  assert.strictEqual(C.starCost(s, 'irene'), null);
  assert.strictEqual(H('irene').ult.power, 20);       // ульт не меняется от звёзд
});

test('отряд: максимум четыре, резерв даёт долю DPS, ненанятые — ничего', () => {
  const s = C.newState(NOCRIT);
  s.heroes.garret.unlocked = true;
  assert.strictEqual(C.squadAdd(s, 'garret'), false);  // отряд полон
  s.allies.garret.level = 10;
  assert.strictEqual(C.contribDps(s, 'garret'), C.allyDps(s, 'garret') * CFG.reserveShare);
  assert.ok(C.squadRemove(s, 'irene'));
  assert.ok(C.squadAdd(s, 'garret'));
  assert.strictEqual(C.contribDps(s, 'garret'), C.allyDps(s, 'garret'));
  assert.strictEqual(C.contribDps(s, 'irene'), 0);     // Ирэн не нанята
  s.allies.irene.level = 5;
  assert.strictEqual(C.reserveDps(s), C.allyDps(s, 'irene') * CFG.reserveShare);
});

test('резерв наносит урон сам, ульты и атаки — только у отряда', () => {
  const s = C.newState(NOCRIT); tough(s);
  s.heroes.garret.unlocked = true;
  s.allies.garret.level = 10;                          // в резерве
  const ev = runFor(s, 20);
  const res = ev.filter(e => e.type === 'hit' && e.source === 'reserve');
  assert.ok(Math.abs(res.length - 20) <= 1);
  assert.ok(!ev.some(e => e.source === 'garret' || (e.type === 'ult' && e.id === 'garret')));
});

test('сохранение коллекции и миграция с версии 0.6 (билеты за пройденных боссов)', () => {
  const s = C.newState(NOCRIT);
  s.heroes.saya.unlocked = true; s.heroes.saya.copies = 3; s.heroes.irene.stars = 2;
  C.squadRemove(s, 'kael'); C.squadAdd(s, 'saya');
  s.tickets = 7; s.ticketFloor = 12; s.pity = { a: 5, s: 40 };
  const t = C.deserialize(C.serialize(s));
  assert.ok(t);
  assert.strictEqual(t.heroes.saya.unlocked, true);
  assert.strictEqual(t.heroes.saya.copies, 3);
  assert.strictEqual(t.heroes.irene.stars, 2);
  assert.strictEqual(t.heroes.velma.unlocked, false);
  assert.deepStrictEqual(t.squad, s.squad);
  assert.strictEqual(t.tickets, 7);
  assert.deepStrictEqual(t.pity, { a: 5, s: 40 });

  const old = JSON.parse(C.serialize(s));
  old.v = 3; old.highestCleared = 20; delete old.heroes; delete old.squad; delete old.tickets; delete old.ticketFloor; delete old.pity;
  old.allies = { irene: 50, borg: 20 };
  const m = C.deserialize(JSON.stringify(old));
  assert.ok(m);
  let exp = 0; for (let f = 1; f <= 20; f++) exp += C.ticketsForFloor(f);
  assert.strictEqual(m.tickets, exp);
  assert.strictEqual(m.allies.irene.level, 50);
  assert.deepStrictEqual(m.squad, ['irene', 'borg', 'lia', 'kael']);
});

// ---------- Алтарь (этап 4, шаг 2) ----------
test('пожертвование: копии исчезают навсегда, эссенция по редкости', () => {
  const s = C.newState(NOCRIT);
  s.heroes.irene.copies = 5; s.heroes.kael.copies = 2;
  const r = C.sacrifice(s, { irene: 3, kael: 1 });
  assert.ok(r);
  assert.strictEqual(r.essence, 3 * CFG.altar.essence.E + 1 * CFG.altar.essence.B);
  assert.strictEqual(s.essence, r.essence);
  assert.strictEqual(s.heroes.irene.copies, 2);
  assert.strictEqual(s.heroes.kael.copies, 1);
  assert.strictEqual(s.heroes.irene.unlocked, true);    // сам герой остаётся открытым
});

test('нельзя пожертвовать больше копий, чем есть, и заблокированные', () => {
  const s = C.newState(NOCRIT);
  s.heroes.irene.copies = 2;
  assert.strictEqual(C.sacrifice(s, { irene: 3 }), null);
  C.setLock(s, 'irene', true);
  assert.strictEqual(C.sacrifice(s, { irene: 1 }), null);
  assert.strictEqual(s.heroes.irene.copies, 2);
  C.setLock(s, 'irene', false);
  assert.ok(C.sacrifice(s, { irene: 1 }));
  assert.strictEqual(C.sacrifice(s, {}), null);
});

test('массовый выбор берёт все незаблокированные копии', () => {
  const s = C.newState(NOCRIT);
  s.heroes.irene.copies = 4; s.heroes.borg.copies = 2; s.heroes.lia.copies = 1;
  C.setLock(s, 'borg', true);
  assert.deepStrictEqual(C.selectAllUnlocked(s), { irene: 4, lia: 1 });
});

test('редкие герои требуют дополнительного подтверждения', () => {
  assert.strictEqual(C.needsRareConfirm({ irene: 3, kael: 1 }), false);
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
  assert.ok(C.heroTrace(s, 'lia'));
  assert.strictEqual(s.heroes.lia.copies, 1);
  assert.strictEqual(s.essence, 1000 - C.traceCost('lia'));
  assert.strictEqual(C.heroTrace(s, 'velma'), false);   // закрытого героя нельзя
});

test('скрытый герой не выпадает в портале и открывается скрытым рецептом, рецепт повторяемый', () => {
  const morra = CFG.allies.find(a => a.hidden);
  assert.ok(morra);
  const s = C.newState(); s.tickets = 5000; s.pity = { a: -1e9, s: -1e9 };
  assert.ok(!C.summon(s, 5000).some(x => x.id === morra.id));

  const t = C.newState(NOCRIT);
  for (const id of morra.recipe) t.heroes[id].copies = 2;
  const sel = Object.fromEntries(morra.recipe.map(id => [id, 1]));
  const r1 = C.sacrifice(t, sel);
  assert.deepStrictEqual(r1.found, [{ id: morra.id, sets: 1, isNew: true }]);
  assert.strictEqual(t.heroes[morra.id].unlocked, true);
  assert.strictEqual(t.discovered[morra.id], true);
  const r2 = C.sacrifice(t, sel);                         // повтор — копия скрытой героини
  assert.strictEqual(r2.found[0].isNew, false);
  assert.strictEqual(t.heroes[morra.id].copies, 1);
  // неполный набор ничего скрытого не даёт
  for (const id of morra.recipe) t.heroes[id].copies = 1;
  assert.deepStrictEqual(C.sacrifice(t, { irene: 1, borg: 1 }).found, []);
});

test('сохранение Алтаря и миграция с 0.7', () => {
  const s = C.newState(NOCRIT);
  s.essence = 42; C.setLock(s, 'kael', true); s.discovered.morra = true; s.heroes.morra.unlocked = true;
  const t = C.deserialize(C.serialize(s));
  assert.strictEqual(t.essence, 42);
  assert.strictEqual(t.locks.kael, true);
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

test('ритуал доступен только с этажа 400', () => {
  const s = C.newState(NOCRIT);
  reach(s, 399);
  assert.strictEqual(C.canRitual(s), false);
  assert.strictEqual(C.ritual(s), null);
  reach(s, 400);
  assert.strictEqual(C.canRitual(s), true);
});

test('ритуал: сбрасывает забег, сохраняет постоянное, даёт души и старт ниже 400', () => {
  const s = C.newState(NOCRIT);
  reach(s, 420);
  s.gold = 1e9; s.tapLevel = 300; s.allies.irene.level = 200; s.highestCleared = 419;
  s.heroes.irene.stars = 3; s.heroes.irene.copies = 5; s.tickets = 7; s.essence = 11; s.artifacts.grail = 2;
  const squad = s.squad.slice(), ticketFloor = s.ticketFloor = 419;
  const expSouls = C.ritualSouls(s);
  assert.ok(expSouls > 0);
  const r = C.ritual(s);
  assert.strictEqual(r.souls, expSouls);
  assert.strictEqual(s.souls, expSouls);
  assert.strictEqual(s.rituals, 1);
  // сброс
  assert.strictEqual(s.gold, 0); assert.strictEqual(s.tapLevel, 1); assert.strictEqual(s.allies.irene.level, 0);
  assert.strictEqual(s.floor, 1); assert.strictEqual(s.maxFloor, s.floor);   // без «Врат восхождения» — с 1-го
  // сохранение
  assert.strictEqual(s.heroes.irene.stars, 3); assert.strictEqual(s.heroes.irene.copies, 5);
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
  for (let i = 0; i < CFG.artifacts.length; i++) ids.push(C.findArtifact(s));
  assert.strictEqual(new Set(ids).size, CFG.artifacts.length);
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
  s.allies.irene.level = 1;
  const ally0 = C.allyDps(s, 'irene');
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
  s.allies.irene.level = 10;
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
  respawn(s); killBoss(s);                                   // босс 50-го
  assert.strictEqual(s.materials.heart, 1);
  C.goToFloor(s, 50); killBoss(s);                           // повтор: осколки есть, сердца нет
  assert.strictEqual(s.materials.heart, 1);
  assert.strictEqual(s.materials.shard, C.shardsForBoss(49) + 2 * C.shardsForBoss(50));
});

test('материалы и эволюция переживают ритуал; сердца после ритуала не повторяются', () => {
  const s = C.newState(NOCRIT);
  s.materials = { shard: 77, heart: 4 }; s.heartFloor = 400; s.heroes.irene.evo = 2;
  reach(s, 400); C.ritual(s);
  assert.deepStrictEqual(s.materials, { shard: 77, heart: 4 });
  assert.strictEqual(s.heroes.irene.evo, 2);
  assert.strictEqual(C.bossMaterials(s, 50).heart, 0);
  assert.strictEqual(C.bossMaterials(s, 450).heart, 1);
});

test('эволюция: нужны звёзды и материалы, цена растёт с редкостью, даёт только индивидуальный DPS', () => {
  const s = C.newState(NOCRIT);
  s.allies.irene.level = 10;
  const st = CFG.evolution.stages[0];
  assert.strictEqual(C.evolve(s, 'irene'), false);           // нет звёзд и материалов
  s.heroes.irene.stars = st.stars;
  const c = C.evoCost(s, 'irene');
  s.materials.shard = c.shards - 1;
  assert.strictEqual(C.evolve(s, 'irene'), false);           // не хватает осколков
  s.materials.shard = c.shards;
  const dps = C.allyDps(s, 'irene'), crit = C.critChance(s), mult = C.critMult(s);
  assert.strictEqual(C.evolve(s, 'irene'), true);
  assert.strictEqual(s.heroes.irene.evo, 1); assert.strictEqual(s.materials.shard, 0);
  assert.strictEqual(C.allyDps(s, 'irene'), dps * st.mult);
  assert.strictEqual(C.critChance(s), crit); assert.strictEqual(C.critMult(s), mult);   // без критов
  assert.ok(C.evoCost(s, 'kael').shards > C.evoCost(C.newState(), 'irene').shards);   // B дороже E
  // вторая ступень требует сердца
  s.heroes.irene.stars = CFG.evolution.stages[1].stars; s.materials.shard = 1e6;
  assert.strictEqual(C.evolve(s, 'irene'), false);
  s.materials.heart = CFG.evolution.stages[1].hearts;
  assert.strictEqual(C.evolve(s, 'irene'), true);
  // после последней ступени — дальше некуда
  s.heroes.irene.evo = CFG.evolution.stages.length;
  assert.strictEqual(C.evoCost(s, 'irene'), null);
  assert.strictEqual(C.evolve(s, 'irene'), false);
  // закрытого героя эволюционировать нельзя
  s.heroes.azrael.stars = 10; s.materials.heart = 99;
  assert.strictEqual(C.evolve(s, 'azrael'), false);
});

test('Алтарь: осколки в сердце — гарантированная альтернатива', () => {
  const s = C.newState(NOCRIT);
  const r = CFG.materials.heartRecipe;
  s.materials.shard = r * 2 - 1;
  assert.strictEqual(C.forgeHeart(s, 2), false);
  assert.strictEqual(C.forgeHeart(s, 1), true);
  assert.deepStrictEqual(s.materials, { shard: r - 1, heart: 1 });
});

test('сохранение эволюции и материалов, миграция с 0.9 начисляет материалы за пройденных боссов', () => {
  const s = C.newState(NOCRIT);
  s.materials = { shard: 15, heart: 2 }; s.heartFloor = 100; s.heroes.irene.evo = 1;
  const t = C.deserialize(C.serialize(s));
  assert.deepStrictEqual(t.materials, { shard: 15, heart: 2 });
  assert.strictEqual(t.heartFloor, 100); assert.strictEqual(t.heroes.irene.evo, 1);
  const old = JSON.parse(C.serialize(s)); old.v = 6; delete old.materials; delete old.heartFloor; old.ticketFloor = 100;
  for (const id in old.heroes) delete old.heroes[id].evo;
  const m = C.deserialize(JSON.stringify(old));
  let sh = 0; for (let f = 1; f <= 100; f++) sh += C.shardsForBoss(f);
  assert.deepStrictEqual(m.materials, { shard: sh, heart: 2 });
  assert.strictEqual(m.heartFloor, 100); assert.strictEqual(m.heroes.irene.evo, 0);
  const bad = JSON.parse(C.serialize(s)); bad.heroes.irene.evo = 9;
  assert.strictEqual(C.deserialize(JSON.stringify(bad)), null);
});
