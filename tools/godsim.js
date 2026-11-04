// «Бог-бот»: всё прокачано до потолков («бесконечные ресурсы»), идёт по Башне до 100 000 этажа.
// Запуск: node tools/godsim.js [тапов/с] [артефакты без потолка, ур.] [души в запасе]
// Считает время аналитически (без покадровой симуляции 100 000 этажей): на каждого врага —
// max(HP / урон, 1 кадр) + задержка появления; босс — если не успеть за таймер, этаж считается непройденным.
const C = require('../src/core.js'), CFG = C.CONFIG, B = C.B;
const TPS = +(process.argv[2] || 10), ART = +(process.argv[3] || 200), SOULS = +(process.argv[4] || 10000);

function godState() {
  const s = C.newState({ rng: Math.random });
  s.bestFloor = s.maxFloor = CFG.maxFloor; s.bestCleared = CFG.maxFloor; s.rituals = 50;
  s.heroRank = C.maxSteps();
  for (const a of CFG.allies) {
    const h = s.heroes[a.id];
    h.unlocked = true; h.stars = CFG.maxStars; h.evo = CFG.evolution.stages.length; h.rank = C.maxSteps();
  }
  for (const a of CFG.allies) s.allies[a.id].level = C.allyCap(s, a.id);
  s.tapLevel = C.tapCap(s);
  // отряд — 4 сильнейших
  const best = CFG.allies.slice().sort((x, y) => B.toNum(B.div(C.allyDps(s, y.id), C.allyDps(s, x.id) || 1)) > 1 ? 1 : -1).slice(0, CFG.squadSize).map(a => a.id);
  s.squad = best;
  for (const a of CFG.artifacts) s.artifacts[a.id] = a.max || ART;
  for (const b of CFG.soulTree) for (const n of b.nodes) s.tree[n.id] = n.max;
  for (const b of CFG.biomes) s.totems[b.id] = CFG.totems.maxLevel;
  const G = CFG.rarities.length - 1;
  s.runes = CFG.runes.kinds.map((k, i) => ({ id: i + 1, type: k.id, tier: G, lvl: CFG.runes.maxLevel })); s.runeSeq = 99;
  for (const p of CFG.pets.list) s.pets.forms[p.id] = CFG.pets.forms.length;
  s.pets.active = CFG.pets.list.find(p => p.rank === 'GOD' && p.type === 'squad').id;
  s.souls = SOULS;
  return s;
}

const s = godState();
const tap = C.tapHit(s);                              // удар тапа с постоянными множителями
const auto = C.autoDps(s);                            // союзники + резерв + питомец + автоатака героя
const critAvg = 1 + C.critChance(s) * (C.critMult(s) - 1);
const dps = B.mul(B.add(B.mul(tap, TPS), auto), critAvg);
const dpsBoss = B.mul(dps, C.bossDmgMult(s));
const time = C.bossTime(s), dt = 1 / 30, resp = CFG.respawnDelaySec;
const lg = x => typeof x === 'number' ? Math.log10(x) : B.log10 ? B.log10(x) : Math.log10(B.toNum(x));

let t = 0, wall = null, slowest = { f: 0, k: 0 };
const marks = [100, 400, 1000, 2500, 4000, 10000, 25000, 50000, 75000, 100000], out = [];
for (let f = 1; f <= CFG.maxFloor; f++) {
  const hpL = lg(C.enemyMaxHp(f, false)), bL = lg(C.enemyMaxHp(f, true));
  const kill = Math.max(dt, Math.pow(10, hpL - lg(dps)));
  const bk = Math.max(dt, Math.pow(10, bL - lg(dpsBoss)));
  if (bk > time) { wall = { f, need: bk, time }; break; }
  if (bk > slowest.k) slowest = { f, k: bk };
  t += 9 * (kill + resp) + bk + resp;
  if (marks.includes(f)) out.push(`этаж ${f}: ${(t / 3600).toFixed(1)} ч, босс за ${bk < 0.05 ? '<0,05' : bk.toFixed(2)} с, HP босса 1e${bL.toFixed(0)}`);
}
console.log(`Урон: тап 1e${lg(tap).toFixed(1)} × ${TPS}/с, авто 1e${lg(auto).toFixed(1)}, крит ×${critAvg.toFixed(2)}, по боссу ×${C.bossDmgMult(s).toFixed(2)} → 1e${lg(dpsBoss).toFixed(1)} в с; таймер босса ${time} с`);
console.log(out.join('\n'));
if (wall) console.log(`СТЕНА: этаж ${wall.f} — босса не убить за ${wall.time} с (нужно ${wall.need.toExponential(2)} с). Пройдено за ${(t / 3600).toFixed(1)} ч.`);
else console.log(`Вершина 100 000 пройдена за ${(t / 3600).toFixed(1)} ч (${(t / 86400).toFixed(1)} сут.) непрерывной игры. Самый долгий босс: этаж ${slowest.f}, ${slowest.k.toFixed(1)} с.`);
