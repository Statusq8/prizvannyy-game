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

// ---------- офлайн (0.11) ----------
test('офлайн: короче минуты — ничего; без авто-урона — только время', () => {
  const s = C.newState(NOCRIT);
  assert.strictEqual(C.offlineProgress(s, 30), null);
  const r = C.offlineProgress(s, 3600);
  assert.strictEqual(r.gold, 0); assert.strictEqual(r.toFloor, 1);
});

test('офлайн: отряд проходит этажи до стены, затем фармит этаж ниже', () => {
  const s = C.newState(NOCRIT);
  s.allies.irene.level = 50;
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
  s.allies.irene.level = 50;
  const a = C.offlineProgress(s, 12 * 3600);
  const b = C.offlineProgress(s, 12 * 3600);
  assert.strictEqual(b.wallFloor, a.wallFloor); assert.strictEqual(s.floor, a.wallFloor - 1);
  assert.strictEqual(b.floorsCleared, 0);
});

test('офлайн: не больше 12 часов, фарм приносит золото пропорционально времени', () => {
  const s1 = C.newState(NOCRIT); s1.allies.irene.level = 50;
  const s2 = C.newState(NOCRIT); s2.allies.irene.level = 50;
  const r1 = C.offlineProgress(s1, 12 * 3600), r2 = C.offlineProgress(s2, 48 * 3600);
  assert.ok(r2.capped); assert.strictEqual(r2.seconds, CFG.offline.maxSec);
  assert.strictEqual(r1.gold, r2.gold);
  const s3 = C.newState(NOCRIT); s3.allies.irene.level = 50;
  const r3 = C.offlineProgress(s3, 6 * 3600);
  assert.ok(r3.gold < r1.gold);
});

test('офлайн: сильный отряд за короткое время просто продвигается без стены', () => {
  const s = C.newState(NOCRIT);
  s.allies.kael.level = 100;
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
  assert.strictEqual(C.biomeOf(1001).id, 'crypt'); assert.strictEqual(C.biomeName(1001), 'Гнилые катакомбы II');
  assert.strictEqual(C.hallOf(1), CFG.halls[0]); assert.strictEqual(C.hallOf(10), CFG.halls[0]);
  assert.strictEqual(C.hallOf(11), CFG.halls[1]); assert.strictEqual(C.hallOf(50), CFG.halls[4]);
  assert.strictEqual(C.hallOf(51), CFG.halls[0]); assert.strictEqual(C.hallOf(1000), CFG.halls[4]);
  for (const b of CFG.biomes) assert.ok(b.bg.length === 3 && b.enemies.length === 4 && b.bosses.length === 2 && b.final);
  assert.strictEqual(C.biomeName(1), 'Гнилые катакомбы');
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
  const plain = CFG.enemyBaseHp * Math.pow(CFG.enemyHpGrowth, f - 1);
  assert.strictEqual(C.enemyMaxHp(f, false), Math.ceil(plain * b.hp));
  assert.strictEqual(C.killGold(f, false), Math.ceil(CFG.goldBase * Math.pow(CFG.goldGrowth, f - 1) * b.gold));
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

test('эффекты дерева: урон героя, союзников, боссы, золото, осколки, уязвимость, перезарядка', () => {
  const s = C.newState(NOCRIT), t = C.newState(NOCRIT);
  s.tree = { fury: 2, spirit: 1, heads: 2, greed: 4, shards: 5, crack: 2, haste: 4 };
  assert.ok(Math.abs(C.permMult(s, 'tap') / C.permMult(t, 'tap') - 1.6) < 1e-9);
  assert.ok(Math.abs(C.permMult(s, 'ally') / C.permMult(t, 'ally') - 1.3) < 1e-9);
  assert.ok(Math.abs(C.goldMult(s) / C.goldMult(t) - 2) < 1e-9);
  assert.strictEqual(C.bossMaterials(s, 100).shard, Math.ceil(C.shardsForBoss(100) * 2));
  // урон по боссу +100%
  for (const x of [s, t]) { x.floor = x.maxFloor = 12; C.challengeBoss(x); x.enemy.hp = x.enemy.maxHp = 1e15; }
  const ds = C.tap(s).find(e => e.type === 'hit').dmg, dt = C.tap(t).find(e => e.type === 'hit').dmg;
  assert.ok(Math.abs(ds / dt - 1.6 * 2) < 1e-9);
  // уязвимость дольше
  s.enemy.hp = s.enemy.maxHp * 0.4; C.tap(s);
  assert.strictEqual(s.enemy.vuln, CFG.bossPhases.vulnSec + 2);
  // перезарядка способности короче
  s.maxFloor = 20; C.useAbility(s, 'flurry');
  assert.ok(Math.abs(s.abilities.flurry.cd - CFG.abilities[0].cooldown * 0.8) < 1e-9);
});

test('эффекты дерева: души за ритуал, наследие золота, офлайн, редкие враги', () => {
  const a = C.newState(NOCRIT), b = C.newState(NOCRIT);
  for (const x of [a, b]) { x.floor = x.maxFloor = 450; x.bestFloor = 450; }
  b.tree = { echo: 5, legacy: 2, dream: 3, luck: 5 };
  assert.strictEqual(C.ritualSouls(b), Math.floor(C.ritualSouls(a) * 1.5));
  b.allies.irene.level = 10; a.allies.irene.level = 10;
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
  assert.strictEqual(C.totemUpCost(s, 'crypt').hearts, 1);
  assert.strictEqual(C.upgradeTotem(s, 'crypt'), false);
  s.materials.heart = 1; assert.ok(C.upgradeTotem(s, 'crypt'));
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
  assert.strictEqual(r.reward.heart >= 1, true);
  assert.strictEqual(C.claimAll(s), null);
});

test('счётчики: призыв, звезда, руна, подземелье, ритуал', () => {
  const s = C.newState({ rng: () => 0 }); s.tickets = 3; s.materials.shard = 100;
  C.summon(s, 3); assert.strictEqual(s.counters.summon, 3);
  s.heroes.irene.copies = 5; C.starUp(s, 'irene'); assert.strictEqual(s.counters.star, 1);
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
test('потолок: 600 на старте, 15000 на пределе, растёт с каждой ступенью', () => {
  assert.strictEqual(C.capAt(0), 600); assert.strictEqual(C.capAt(C.maxSteps()), 15000);
  assert.strictEqual(C.maxSteps(), 100);
  for (let k = 1; k <= 100; k++) assert.ok(C.capAt(k) > C.capAt(k - 1));
  assert.deepStrictEqual(C.rankLabel(0), { rank: 1, sub: 0, max: false });
  assert.deepStrictEqual(C.rankLabel(37), { rank: 4, sub: 7, max: false });
  assert.deepStrictEqual(C.rankLabel(100), { rank: 10, sub: 10, max: true });
});

test('покупка уровней упирается в потолок, MAX и ×100 тоже', () => {
  const s = C.newState(NOCRIT); s.gold = 1e300;
  s.tapLevel = 590;
  assert.ok(C.buyTap(s, 100)); assert.strictEqual(s.tapLevel, 600);
  assert.strictEqual(C.buyTap(s, 1), false); assert.strictEqual(C.buyTap(s, 'max'), false);
  s.allies.irene.level = 0;
  assert.ok(C.buyAlly(s, 'irene', 'max')); assert.strictEqual(s.allies.irene.level, 600);
});

test('ранг героя: подранг за осколки, новый ранг — ещё сердца, потолок растёт', () => {
  const s = C.newState(NOCRIT);
  assert.strictEqual(C.rankUp(s, 'hero'), false);
  s.materials = { shard: 1e9, heart: 0 };
  for (let i = 0; i < 9; i++) assert.ok(C.rankUp(s, 'hero'));
  assert.strictEqual(C.tapCap(s), C.capAt(9));
  const c = C.rankCost(s, 'hero');
  assert.strictEqual(c.newRank, 2); assert.strictEqual(c.hearts, 2);
  assert.strictEqual(C.rankUp(s, 'hero'), false);                 // нужны сердца
  s.materials.heart = 2; assert.ok(C.rankUp(s, 'hero'));
  assert.deepStrictEqual(C.rankLabel(s.heroRank), { rank: 2, sub: 0, max: false });
  s.heroRank = 100; assert.strictEqual(C.rankCost(s, 'hero'), null);
});

test('ранг союзника: цена по редкости, ранги IV, VII, X требуют эволюцию I, II, III', () => {
  const s = C.newState(NOCRIT); s.materials = { shard: 1e12, heart: 1e6 };
  assert.ok(C.rankCost(s, 'kael').shards > C.rankCost(s, 'irene').shards);
  s.heroes.irene.rank = 29;
  assert.strictEqual(C.rankCost(s, 'irene').needEvo, 1);
  assert.strictEqual(C.rankUp(s, 'irene'), false);
  s.heroes.irene.evo = 1; assert.ok(C.rankUp(s, 'irene'));
  assert.strictEqual(C.allyCap(s, 'irene'), C.capAt(30));
  s.heroes.irene.rank = 59; assert.strictEqual(C.rankUp(s, 'irene'), false);
  s.heroes.irene.evo = 2; assert.ok(C.rankUp(s, 'irene'));
  s.heroes.irene.rank = 89; assert.strictEqual(C.rankUp(s, 'irene'), false);
  s.heroes.irene.evo = 3; assert.ok(C.rankUp(s, 'irene'));
  assert.strictEqual(C.rankUp(s, 'azrael'), false);                // не открыт
});

test('ранги переживают ритуал и сохраняются; миграция с 0.18', () => {
  const s = C.newState(NOCRIT); s.heroRank = 12; s.heroes.irene.rank = 7;
  s.floor = s.maxFloor = 400; C.ritual(s);
  assert.strictEqual(s.heroRank, 12); assert.strictEqual(s.heroes.irene.rank, 7);
  const t = C.deserialize(C.serialize(s));
  assert.strictEqual(t.heroRank, 12); assert.strictEqual(t.heroes.irene.rank, 7);
  const old = JSON.parse(C.serialize(s)); old.v = 11; delete old.heroRank; for (const id in old.heroes) delete old.heroes[id].rank;
  const m = C.deserialize(JSON.stringify(old));
  assert.strictEqual(m.heroRank, 0); assert.strictEqual(m.heroes.irene.rank, 0);
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
