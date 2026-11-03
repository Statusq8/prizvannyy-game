// Симуляция игрока: N тапов/сек, покупает самое выгодное (прирост DPS за золото),
// при провале босса фармит 60 с и возвращается. Запуск: node tools/sim.js [тапов/с] [минут]
const Core = require('../src/core.js');
const TPS = +(process.argv[2] || 6), MIN = +(process.argv[3] || 30);
const s = Core.newState(); const dt = 1 / 30;
let t = 0, nextTap = 0, farmUntil = 0, fails = 0;
const marks = new Set([1, 2, 5, 10, 15, 20, 30, 60].map(m => m * 60));

function buyBest() {
  for (;;) {
    const opts = [{ kind: 'tap', cost: Core.upgradeCost(s.tapLevel, 1), gain: (Core.tapDamageAt(s.tapLevel + 1) - Core.tapDamageAt(s.tapLevel)) * TPS }];
    for (const a of Core.CONFIG.allies) { const lv = s.allies[a.id].level; opts.push({ kind: a.id, cost: Core.allyCost(s, a.id, 1), gain: Core.allyDpsAt(a.id, lv + 1) - Core.allyDpsAt(a.id, lv) }); }
    opts.sort((x, y) => y.gain / y.cost - x.gain / x.cost);
    let o = opts[0];
    if (o.cost > s.gold) {
      // копим на лучшее, но берём дешёвое (<10% цены лучшего), если оно доступно
      o = opts.find(x => x.cost <= s.gold && x.cost < opts[0].cost * 0.1);
      if (!o) return;
    }
    if (o.kind === 'tap') Core.buyTap(s, 1); else Core.buyAlly(s, o.kind, 1);
  }
}

while (t < MIN * 60) {
  t += dt;
  for (const e of Core.tick(s, dt)) if (e.type === 'bossFail') { fails++; farmUntil = t + 60; }
  if (t >= nextTap) { Core.tap(s); nextTap += 1 / TPS; buyBest(); }
  if (s.farming && t > farmUntil) Core.challengeBoss(s);
  if ([...marks].some(m => t >= m && t - dt < m)) {
    const al = Core.CONFIG.allies.map(a => `${a.name} ур.${s.allies[a.id].level}`).join(', ');
    console.log(`${Math.round(t / 60)} мин: этаж ${s.floor}, удар ур.${s.tapLevel}, ${al}, авто DPS ${Core.fmt(Core.autoDps(s))}, провалов ${fails}`);
  }
}
