// «Бот-год» (ответ 147): средний игрок — 1 ч активной игры в день + 12 ч офлайна, 365 дней.
// Цель (ответ 1): за год ≈ ⅓ этажей, около 33 000. Запуск: node tools/yearsim.js [дней] [тапов/с] [зерно]
// Активный час — покадровая симуляция (шаг 1/15 с), офлайн — Core.offlineProgress (12 ч, 100% силы).
// Ритуал: когда рекорд забега за последние 2 дня вырос меньше чем на 3% (или забег стоит на месте).
// Ежедневные подземелья, задания, события и пропуск не моделируются — оценка снизу.
const Core = require('../src/core.js');
const DAYS = +(process.argv[2] || 365), TPS = +(process.argv[3] || 6), SEED = +(process.argv[4] || 7);
let seed = SEED; const rng = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
if (process.env.SIM_CFG) { const mrg = (a, b) => { for (const k in b) (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k])) ? mrg(a[k], b[k]) : (a[k] = b[k]); }; mrg(Core.CONFIG, JSON.parse(process.env.SIM_CFG)); }
const B = Core.B, num = x => B.toNum(x);
let s = Core.newState({ rng });
// контрольная точка: CKPT=файл — состояние сохраняется каждые 7 дней и продолжается с места после обрыва
const fs = require('fs'), CK = process.env.CKPT; let startDay = 1;
if (CK && fs.existsSync(CK)) { const c = JSON.parse(fs.readFileSync(CK, 'utf8')); s = Core.deserialize(c.save); s.rng = rng; seed = c.seed; startDay = c.day + 1; }
for (const ab of Core.CONFIG.abilities) Core.setAbilityAuto(s, ab.id, true);
const dt = 1 / +(process.env.FPS || 15);   // FPS=5 — в 3 раза быстрее, точность близкая

// прирост за золото сравниваем в логарифмах: числа могут быть Big
const ratio = (gain, cost) => B.log10(B.max(gain, 1e-300)) - B.log10(cost);
function buyBest() {
  for (let guard = 0; guard < 2000; guard++) {
    const opts = [];
    if (s.tapLevel < Core.tapCap(s)) opts.push({ kind: 'tap', cost: Core.upgradeCost(s.tapLevel, 1), gain: B.mul(B.sub(Core.tapDamageAt(s.tapLevel + 1), Core.tapDamageAt(s.tapLevel)), TPS) });
    for (const a of Core.CONFIG.allies.filter(a => s.heroes[a.id].unlocked && s.allies[a.id].level < Core.allyCap(s, a.id))) {
      const lv = s.allies[a.id].level;
      opts.push({ kind: a.id, cost: Core.allyCost(s, a.id, 1), gain: B.sub(Core.allyDpsAt(a.id, lv + 1), Core.allyDpsAt(a.id, lv)) });
    }
    if (!opts.length) return;
    opts.sort((x, y) => ratio(y.gain, y.cost) - ratio(x.gain, x.cost));
    let o = opts[0];
    if (B.gt(o.cost, s.gold)) {
      o = opts.find(x => B.lte(x.cost, s.gold) && B.log10(x.cost) < B.log10(opts[0].cost) - 1);
      if (!o) return;
    }
    if (o.kind === 'tap') Core.buyTap(s, 1); else Core.buyAlly(s, o.kind, 1);
  }
}
function manageHeroes() {
  if (s.tickets > 0) Core.summon(s, s.tickets);
  for (const a of Core.CONFIG.allies) while (Core.starUp(s, a.id));
  for (const a of Core.CONFIG.allies) while (Core.evolve(s, a.id));
  for (const who of ['hero', ...s.squad]) while (Core.rankUp(s, who));
  for (const p of Core.CONFIG.pets.list) while (Core.evolvePet(s, p.id));
  const own = Core.CONFIG.pets.list.filter(p => Core.petForm(s, p.id));
  if (own.length) { own.sort((x, y) => Core.petPower(y, Core.petForm(s, y.id)).bonus * (y.type === 'squad' ? 2 : 1) - Core.petPower(x, Core.petForm(s, x.id)).bonus * (x.type === 'squad' ? 2 : 1)); Core.setPet(s, own[0].id); }
  const dps = id => B.log10(B.max(Core.allyDps(s, id), 1e-300));
  const best = Core.CONFIG.allies.filter(a => s.heroes[a.id].unlocked).sort((x, y) => dps(y.id) - dps(x.id)).slice(0, Core.CONFIG.squadSize).map(a => a.id);
  for (const id of [...s.squad]) if (!best.includes(id)) Core.squadRemove(s, id);
  for (const id of best) Core.squadAdd(s, id);
}
function spendSouls() {
  for (let guard = 0; guard < 5000; guard++) {
    const fc = Core.findCost(s);
    if (fc != null && B.gte(s.souls, fc)) { Core.findArtifact(s); continue; }
    const opts = ['grail', 'gaunt', 'banner', 'eye', 'fang', 'blade', 'gate', 'feather', 'sand']
      .map(id => ({ id, c: Core.upgradeArtCost(s, id) })).filter(o => o.c != null && B.lte(o.c, s.souls));
    if (!opts.length) return;
    opts.sort((x, y) => B.cmp(x.c, y.c));
    Core.upgradeArtifact(s, opts[0].id);
  }
}

const log = [], hist = [];
let rituals = [];
const t0 = Date.now();
for (let day = startDay; day <= DAYS; day++) {
  // начало дня: решение о ритуале
  hist.push(s.maxFloor);
  const back = hist.length >= 3 ? hist[hist.length - 3] : 0;
  if (Core.canRitual(s) && hist.length >= 3 && s.maxFloor < back * 1.03) {
    const r = Core.ritual(s); rituals.push({ day, floor: back, souls: num(r.souls) }); hist.length = 0;
  }
  spendSouls(); manageHeroes(); buyBest();
  // активный час
  let t = 0, nextTap = 0, nextManage = 0, farmUntil = 0;
  while (t < 3600) {
    t += dt;
    for (const e of Core.tick(s, dt)) if (e.type === 'bossFail') farmUntil = t + 60;
    while (t >= nextTap) { Core.tap(s); nextTap += 1 / TPS; }
    if (t >= nextManage) { buyBest(); manageHeroes(); spendSouls(); nextManage += 10; }
    if (s.farming && t > farmUntil) Core.challengeBoss(s);
  }
  // офлайн 12 ч
  Core.offlineProgress(s, 12 * 3600);
  buyBest();
  if (day % 7 === 0 || day === 1 || day === DAYS) {
    const line = `день ${day}: рекорд ${s.bestFloor}, забег ${s.maxFloor}, ритуалов ${s.rituals}, артефактов ${Core.foundCount(s)} (${((Date.now() - t0) / 1000).toFixed(0)} с счёта)`;
    log.push(line); console.log(line);
    if (CK) fs.writeFileSync(CK, JSON.stringify({ day, seed, save: Core.serialize(s) }));
  }
}
console.log(`ИТОГ за ${DAYS} дн.: рекорд ${s.bestFloor}, ритуалов ${s.rituals}`);
console.log('ритуалы: ' + rituals.map(r => `д${r.day}@${r.floor}`).join(', '));
if (process.env.DUMP) console.log(JSON.stringify({ floor: s.floor, idx: s.enemyIndex, farming: s.farming, mode: s.mode, auto: s.autoAdvance, alive: s.enemy.alive, hp: String(s.enemy.hp), max: String(s.enemy.maxHp), gold: String(s.gold), tap: s.tapLevel, tapCap: Core.tapCap(s), squad: s.squad.map(id => [id, s.allies[id].level, Core.allyCap(s, id)]), dps: String(Core.autoDps(s)), boss: s.bossTimer }));
if (process.env.DUMP) { for (const who of ['hero', ...s.squad]) console.log(who, JSON.stringify(Core.rankCost(s, who)), who === 'hero' ? s.heroRank : s.heroes[who].rank, who !== 'hero' ? 'evo ' + s.heroes[who].evo + ' stars ' + s.heroes[who].stars : ''); console.log('mat', JSON.stringify(s.materials), 'earned shards stat?', s.stats.shards); }
