// Симуляция игрока: N тапов/сек, покупает самое выгодное (прирост DPS за золото),
// при провале босса фармит 60 с и возвращается. Запуск: node tools/sim.js [тапов/с] [минут]
const Core = require('../src/core.js');
const TPS = +(process.argv[2] || 6), MIN = +(process.argv[3] || 30), SEED = process.argv[4];
// воспроизводимая «удача»: 4-й аргумент — зерно генератора (без него — Math.random)
let seed = +SEED || 0; const rng = SEED ? () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; } : Math.random;
const QUIET = process.env.SIM_QUIET === '1';
// подбор баланса: SIM_CFG='{"enemyHpGrowth":1.2,"ranks":{"shards":40}}' — поверх CONFIG
if (process.env.SIM_CFG) { const mrg = (a, b) => { for (const k in b) (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k])) ? mrg(a[k], b[k]) : (a[k] = b[k]); }; mrg(Core.CONFIG, JSON.parse(process.env.SIM_CFG)); }
const s = Core.newState({ rng });
let reached400 = null;
for (const ab of Core.CONFIG.abilities) Core.setAbilityAuto(s, ab.id, true); const dt = 1 / 30;
let t = 0, nextTap = 0, farmUntil = 0, fails = 0;
const marks = new Set([10, 30, 60, 90, 120, 180, 240, 360, 480, 600, 720].map(m => m * 60));

function buyBest() {
  for (;;) {
    const opts = [];
    if (s.tapLevel < Core.tapCap(s)) opts.push({ kind: 'tap', cost: Core.upgradeCost(s.tapLevel, 1), gain: (Core.tapDamageAt(s.tapLevel + 1) - Core.tapDamageAt(s.tapLevel)) * TPS });
    for (const a of Core.CONFIG.allies.filter(a => s.heroes[a.id].unlocked && s.allies[a.id].level < Core.allyCap(s, a.id))) { const lv = s.allies[a.id].level; opts.push({ kind: a.id, cost: Core.allyCost(s, a.id, 1), gain: Core.allyDpsAt(a.id, lv + 1) - Core.allyDpsAt(a.id, lv) }); }
    opts.sort((x, y) => y.gain / y.cost - x.gain / x.cost);
    if (!opts.length) return;
    let o = opts[0];
    if (o.cost > s.gold) {
      // копим на лучшее, но берём дешёвое (<10% цены лучшего), если оно доступно
      o = opts.find(x => x.cost <= s.gold && x.cost < opts[0].cost * 0.1);
      if (!o) return;
    }
    if (o.kind === 'tap') Core.buyTap(s, 1); else Core.buyAlly(s, o.kind, 1);
  }
}

// Призыв на все билеты, звёзды, отряд из самых сильных нанятых
function manageHeroes() {
  if (s.tickets > 0) Core.summon(s, s.tickets);
  for (const a of Core.CONFIG.allies) while (Core.starUp(s, a.id));
  for (const a of Core.CONFIG.allies) while (Core.evolve(s, a.id));
  for (const who of ['hero', ...s.squad]) while (Core.rankUp(s, who));
  // питомцы 2.0: эволюция за фрагменты, в бой — с бонусом «урон отряда» или сильнейший
  for (const p of Core.CONFIG.pets.list) while (Core.evolvePet(s, p.id));
  const own = Core.CONFIG.pets.list.filter(p => Core.petForm(s, p.id));
  if (own.length) { own.sort((x, y) => Core.petPower(y, Core.petForm(s, y.id)).bonus * (y.type === 'squad' ? 2 : 1) - Core.petPower(x, Core.petForm(s, x.id)).bonus * (x.type === 'squad' ? 2 : 1)); Core.setPet(s, own[0].id); }
  const best = Core.CONFIG.allies.filter(a => s.heroes[a.id].unlocked)
    .sort((x, y) => (Core.allyDps(s, y.id) || y.baseDps * 1e-9) - (Core.allyDps(s, x.id) || x.baseDps * 1e-9))
    .slice(0, Core.CONFIG.squadSize).map(a => a.id);
  for (const id of [...s.squad]) if (!best.includes(id)) Core.squadRemove(s, id);
  for (const id of best) Core.squadAdd(s, id);
}
let nextManage = 0, ritualLog = [];
// Ритуал сразу на 400-м; души — сначала на поиск артефактов, потом на самые дешёвые улучшения урона
function manageSouls() {
  if (Core.canRitual(s)) { const r = Core.ritual(s); ritualLog.push(`${Math.round(t / 60)} мин: ритуал №${s.rituals}, +${r.souls} душ, старт с ${r.start}`); }
  for (;;) {
    const fc = Core.findCost(s);
    if (fc != null && s.souls >= fc) { Core.findArtifact(s); continue; }
    const opts = ['grail', 'gaunt', 'banner', 'eye', 'fang', 'blade', 'gate'].map(id => ({ id, c: Core.upgradeArtCost(s, id) })).filter(o => o.c != null && o.c <= s.souls);
    if (!opts.length) return;
    opts.sort((x, y) => x.c - y.c);
    Core.upgradeArtifact(s, opts[0].id);
  }
}
while (t < MIN * 60) {
  t += dt;
  for (const e of Core.tick(s, dt)) if (e.type === 'bossFail') { fails++; farmUntil = t + 60; }
  if (t >= nextTap) { Core.tap(s); nextTap += 1 / TPS; buyBest(); }
  if (t >= nextManage) { manageHeroes(); manageSouls(); nextManage += 10; }
  if (s.farming && t > farmUntil) Core.challengeBoss(s);
  if (!reached400 && s.bestFloor >= 400) { reached400 = t; if (QUIET) break; }
  if (!QUIET && [...marks].some(m => t >= m && t - dt < m)) {
    const al = 'отряд: ' + s.squad.map(id => { const a = Core.CONFIG.allies.find(x => x.id === id); return `${a.name}(${a.rarity}${s.heroes[id].stars ? '★' + s.heroes[id].stars : ''}) ур.${s.allies[id].level}`; }).join(', ') + `, открыто ${Core.CONFIG.allies.filter(a => s.heroes[a.id].unlocked).length}`;
    console.log(`${Math.round(t / 60)} мин: этаж ${s.floor}, удар ур.${s.tapLevel}, ${al}, рекорд ${s.bestFloor}, питомцы ${Core.CONFIG.pets.list.filter(p => Core.petForm(s, p.id)).length}, крит ${Math.round(Core.critChance(s) * 100)}%×${Core.critMult(s).toFixed(1)}, провалов ${fails}`);
  }
}

if (QUIET) { console.log(reached400 ? (reached400 / 3600).toFixed(2) : '>' + MIN / 60, s.bestFloor); process.exit(0); }
console.log('этаж 400: ' + (reached400 ? (reached400 / 3600).toFixed(2) + ' ч' : 'не достигнут'));
console.log(ritualLog.join('\n'));
console.log(`материалы: 🔹${s.materials.shard} 🔥${s.materials.heart}, эволюций ${Core.CONFIG.allies.reduce((n, a) => n + s.heroes[a.id].evo, 0)}`);
console.log(`итог: ритуалов ${s.rituals}, душ ${s.souls}, рекорд ${s.bestFloor}, артефактов ${Core.foundCount(s)}`);
