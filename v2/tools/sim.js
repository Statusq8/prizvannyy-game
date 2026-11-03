// Симуляция игрока: N тапов/сек, покупает MAX, при провале босса фармит и возвращается.
const Core = require('../src/core.js');
const TPS = +(process.argv[2] || 6), MIN = +(process.argv[3] || 20);
const s = Core.newState(); const dt = 1 / 30; let t = 0, nextTap = 0, farmUntil = 0, fails = 0;
const marks = new Set([1, 2, 5, 10, 15, 20, 30, 60].map(m => m * 60));
while (t < MIN * 60) {
  t += dt;
  for (const e of Core.tick(s, dt)) if (e.type === 'bossFail') { fails++; farmUntil = t + 60; }
  if (t >= nextTap) { Core.tap(s); nextTap += 1 / TPS; Core.buyTap(s, 'max'); }
  if (s.farming && t > farmUntil) Core.challengeBoss(s);
  for (const m of marks) if (t >= m && t - dt < m) console.log(`${m / 60} мин: этаж ${s.floor}, удар ур.${s.tapLevel}, провалов босса ${fails}`);
}
