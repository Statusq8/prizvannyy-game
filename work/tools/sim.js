// Симулятор баланса M8 на настоящем ядре игры. node tools/sim.js [часов] [--json out.json] [--set path=value ...]
// Стратегии: «типичный» (без тапов, заходит раз в 60 с), «активный» (4 тапа/с, решения каждые 10 с), «ленивый» (раз в 10 мин).
const load = require('../tests/load');
const args = process.argv.slice(2);
const HOURS = +(args.find(a => /^\d+(\.\d+)?$/.test(a)) || 14);
const sets = []; for (let i = 0; i < args.length; i++) if (args[i] === '--set') sets.push(args[++i]);
const jsonOut = args.includes('--json') ? args[args.indexOf('--json') + 1] : null;

function applySets(PZ) {
  for (const kv of sets) {
    const [p, v] = kv.split('='); const keys = p.split('.'); let o = PZ.B;
    for (const k of keys.slice(0, -1)) o = o[k];
    o[keys.at(-1)] = +v;
  }
}

function decide(PZ, s, stalledSec, t) {
  const H = PZ.heroes;
  // застрял больше 10 минут — сначала покупает свитки из накопленного золота
  const wantScrolls = stalledSec > 600 && t - (s._lastBuy || -1e9) >= 600;
  if (wantScrolls && s.run.gold >= PZ.meta.scrollPrice(s, 10)) { PZ.meta.buyScrolls(s, 10); s._lastBuy = t; s._bought = (s._bought || 0) + 10; }
  const reserve = 0;
  for (const h of PZ.HEROES) if (s.account.owned[h.id] && !s.run.hired[h.id] && H.canObtain(s, h.id) && s.run.gold >= H.hireCost(s, h.id)) H.hire(s, h.id);
  for (let k = 0; k < 200; k++) {
    const base = H.armyDps(s, 'normal'); let best = null;
    const tryOpt = (cost, apply, undo) => { if (cost > s.run.gold || (reserve && s.run.gold - cost < reserve)) return; apply(); const g = H.armyDps(s, 'normal') - base; undo(); const e = g / cost; if (!best || e > best.e) best = { e, cost, apply }; };
    tryOpt(PZ.B.mainLevelCost(s.run.mainLevel), () => s.run.mainLevel++, () => s.run.mainLevel--);
    for (const id of Object.keys(s.run.hired)) { const c = H.levelCost(s, id, s.run.hired[id]); tryOpt(c, () => s.run.hired[id]++, () => s.run.hired[id]--); }
    if (!best) break;
    // копить на найм, если следующий герой выгоднее лучшего уровня
    const cand = PZ.HEROES.filter(h => s.account.owned[h.id] && !s.run.hired[h.id] && H.canObtain(s, h.id)).map(h => ({ h, c: H.hireCost(s, h.id) })).sort((a, b) => a.c - b.c)[0];
    if (cand) { s.run.hired[cand.h.id] = 1; const g = H.armyDps(s, 'normal') - base; delete s.run.hired[cand.h.id]; if (g / cand.c > best.e && s.run.gold - best.cost < cand.c) break; }
    PZ.state.spendGold(s, best.cost); best.apply();
  }
  if (process.env.SIM_CLASS) { const [c, sc] = process.env.SIM_CLASS.split(':'); if (PZ.classes.canChooseClass(s)) PZ.classes.chooseClass(s, c); if (PZ.classes.canChooseSub(s)) PZ.classes.chooseSub(s, sc); }
  finishMeta(PZ, s);
  // к боссу/рекорду возвращается не чаще раза в 3 минуты
  if ((!s.run.autoAdvance || s.run.farmFloor !== null) && t - (s._lastTry || -1e9) >= 180) { PZ.combat.goToRecord(s); s._lastTry = t; }
}
function finishMeta(PZ, s) {
  while (s.account.scrolls >= 10) PZ.portal.summon(s, 10);
  for (const id of Object.keys(s.account.owned)) { PZ.bones.absorbAll(s, id); if (PZ.bones.canPromote(s, id).ok) PZ.bones.promote(s, id); while (PZ.portal.canAscend(s, id).ok) PZ.portal.ascend(s, id); }
}

function run(name, opt) {
  const PZ = load(); applySets(PZ);
  const s = PZ.state.newGame(0); s.account.rng = opt.seed || 777;
  const marks = {}, stepMarks = [50, 100, 150, 200, 250, 300, 350, 400];
  let next = 0, fails = 0, maxStall = 0, lastRec = 0, lastRecT = 0;
  for (let t = 0; t < HOURS * 3600; t++) {
    PZ.combat.tick(s, 1);
    if (opt.taps) for (let i = 0; i < opt.taps; i++) PZ.combat.tap(s);
    if (t % opt.every === 0) decide(PZ, s, t - lastRecT, t);
    if (s.account.record > lastRec) { maxStall = Math.max(maxStall, t - lastRecT); lastRec = s.account.record; lastRecT = t; }
    while (next < stepMarks.length && s.account.record >= stepMarks[next]) { marks[stepMarks[next]] = +(t / 3600).toFixed(2); next++; }
    if (s.account.record >= 400 && t > 600) break;
  }
  PZ.combat.events.length = 0;
  maxStall = Math.max(maxStall, (s.account.record >= 400 ? 0 : HOURS * 3600 - lastRecT));
  const errs = PZ.state.validate(s);
  return { name, bought: s._bought || 0, summons: s.account.pity.total, record: s.account.record, hours: marks, maxStallMin: Math.round(maxStall / 60), bossFails: s.run.stats.bossFails, hired: Object.keys(s.run.hired).length,
    owned: Object.keys(s.account.owned).length, mainLevel: s.run.mainLevel, errors: errs.length };
}

const seeds = [777, 4242, 9001];
const res = [];
for (const [nm, o] of [['активный', { taps: 4, every: 10 }], ['типичный', { taps: 0, every: 60 }], ['ленивый', { taps: 0, every: 600 }]])
  for (const seed of seeds) res.push(run(nm + '#' + seed, Object.assign({ seed }, o)));
for (const r of res) console.log(r.name.padEnd(9), 'рекорд', String(r.record).padStart(4), '| часы до', JSON.stringify(r.hours), '| макс. застой', r.maxStallMin, 'мин | герои', r.hired, '/', r.owned, '| Призв.', r.mainLevel, r.errors ? '| ОШИБКИ ' + r.errors : '');
if (jsonOut) require('fs').writeFileSync(jsonOut, JSON.stringify({ balance: 'B-001', sets, hours: HOURS, results: res }, null, 1));
