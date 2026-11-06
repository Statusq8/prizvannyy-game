// «Запуск игры: пришло 1000 человек» (0.110). Каждый игрок — свой покадровый бот (tools/balance.js) со случайными
// настройками внутри своего типа. Результат — по строке JSON на игрока в файл; сводка — tools/population_report.js.
//   node tools/population.js <файл.jsonl> <дней> <с_игрока> <по_игрока> [всего=1000]
// Можно запускать кусками и в несколько процессов: уже посчитанные игроки в файле пропускаются.
const Core = require('../src/core.js'), B = Core.B, CFG = Core.CONFIG, num = x => B.toNum(x);
const { bot } = require('./balance.js');
const fs = require('fs');

// ---------- типы игроков ----------
// Активность (доля среди пришедших): хардкор 3–5 ч/день, средний ~1 ч, казуал 1–2 захода по 15–30 мин.
const ACT = [
  { id: 'hard', name: 'Хардкор 3–5 ч/день', share: 0.15 },
  { id: 'mid', name: 'Средний ~1 ч/день', share: 0.35 },
  { id: 'casual', name: 'Казуал 1–2 захода по 15–30 мин', share: 0.50 },
];
// Донат (доля): без доната, минимальный, жёсткий. 💎 в день — сколько покупает (в среднем).
const PAY = [
  { id: 'free', name: 'Без доната', share: 0.90, perDay: 0 },
  { id: 'min', name: 'Минимальный донат', share: 0.08, perDay: 0, weekly: 300 },     // пак 300 💎 раз в неделю (с 1-го дня)
  { id: 'whale', name: 'Жёсткий донатер', share: 0.02, perDay: 2000 },              // 2000 💎 каждый день
];
const RUB_PER_CRYSTAL = 1;   // допущение: 💎 продаются примерно по 1 ₽ (пак 300 💎 ≈ 299 ₽)

// детерминированный генератор по номеру игрока
function rngFor(id) { let x = (id * 2654435761) % 4294967296; return () => { x = (x * 1664525 + 1013904223) % 4294967296; return x / 4294967296; }; }
function pick(list, r) { let a = 0; for (const o of list) { a += o.share; if (r < a) return o; } return list[list.length - 1]; }

// Состав строго по долям (на 1000: хардкор 150, средних 350, казуалов 500; без доната 90%, минимальный 8%, жёсткий 2% —
// в каждом типе активности), порядок перемешан детерминированно.
let SLOTS = null;
function slots(total) {
  if (SLOTS && SLOTS.length === total) return SLOTS;
  const out = [];
  for (const a of ACT) { const na = Math.round(total * a.share); let used = 0;
    PAY.forEach((p, i) => { const n = i === PAY.length - 1 ? na - used : Math.round(na * p.share); used += n; for (let k = 0; k < n; k++) out.push([a, p]); }); }
  const r = rngFor(424242); for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return (SLOTS = out);
}
function profile(id, total = 1000) {
  const r = rngFor(id + 1);
  const [act, pay] = slots(total)[id % total];
  const tps = 3 + r() * 4;                          // 3–7 тапов/с
  let sessions;                                      // минуты по сессиям в день
  if (act.id === 'hard') { const total = 180 + r() * 120, n = 3 + Math.floor(r() * 3); sessions = Array.from({ length: n }, () => total / n); }
  else if (act.id === 'mid') { const n = 2 + Math.floor(r() * 2), total = 45 + r() * 45; sessions = Array.from({ length: n }, () => total / n); }
  else { const n = 1 + Math.floor(r() * 2); sessions = Array.from({ length: n }, () => 15 + r() * 15); }
  return { id, act: act.id, pay: pay.id, tps: +tps.toFixed(2), sessions: sessions.map(m => +m.toFixed(1)), skip: act.id === 'casual' ? 0.2 : act.id === 'mid' ? 0.1 : 0.03 };
}

function simulate(p, days) {
  const r = rngFor(p.id + 777);
  const pay = PAY.find(x => x.id === p.pay);
  let bought = 0, spentCr = 0, lights = 0, marketBuys = 0;
  const T0 = Date.UTC(2026, 10, 10);
  const onManage = (s, st) => {
    const now = T0 + st.t * 1000;
    // Рынок: души — на билеты/копии/зелья, если души есть с запасом (артефакты — важнее); 💎 — донатеры
    if (Core.unlockedAt(s, 'shop')) {
      Core.marketSync(s, now);
      s.market.items.forEach((it, i) => {
        if (it.sold) return;
        const g = Core.marketGood(it.g), price = Core.marketPrice(s, g);
        if (g.cur === 'souls' && num(s.souls) >= price * 4 && Core.marketBuy(s, i)) marketBuys++;
        if (g.cur === 'crystal' && p.pay !== 'free' && (s.crystals | 0) - price >= CFG.ritual.light.crystals && Core.marketBuy(s, i)) { marketBuys++; spentCr += price; }
      });
      if (p.pay === 'whale' && (s.crystals | 0) > 1500 && s.market.items.every(x => x.sold || Core.marketGood(x.g).cur !== 'crystal') && Core.marketRefresh(s)) spentCr += CFG.market.refreshCost;
    }
  };
  const ritualKind = s => ((s.crystals | 0) >= CFG.ritual.light.crystals && p.pay !== 'free') ? (lights++, spentCr += CFG.ritual.light.crystals, 'light') : 'dark';
  const b = bot({ tps: p.tps, seed: p.id * 31 + 7, fps: 2, onManage, ritualKind });
  const s = b.s, daily = [];
  for (let d = 1; d <= days; d++) {
    // покупка 💎
    let add = pay.perDay || 0; if (pay.weekly && (d - 1) % 7 === 0) add += pay.weekly;
    if (add) { s.crystals = (s.crystals | 0) + add; bought += add; }
    const dayStart = b.st.t;
    if (r() >= p.skip) {   // иногда игрок пропускает день
      const n = p.sessions.length, gap = (16 * 3600) / n;
      for (const m of p.sessions) { b.play(m * 60); const pause = Math.max(0, gap - m * 60); if (pause > 0) b.away(pause); }
    }
    const rest = dayStart + 86400 - b.st.t; if (rest > 0) b.away(rest);
    const heroes = CFG.allies.filter(a => s.heroes[a.id].unlocked);
    daily.push({ d, best: s.bestFloor, run: s.maxFloor, rit: s.rituals, light: lights, heroes: heroes.length,
      aPlus: heroes.filter(a => CFG.rarities.indexOf(a.rarity) >= CFG.rarities.indexOf('A')).length,
      souls: Math.round(Math.min(num(s.souls), 1e15)), arts: Core.foundCount(s) + Core.shopFound(s, 'blood'),
      tickets: s.tickets, cr: s.crystals | 0, bought, spentCr, mk: marketBuys });
  }
  return { ...p, daily, unlocks: Object.fromEntries(Object.entries(b.st.unlocks).map(([k, v]) => [k, Math.round(v)])) };
}

module.exports = { ACT, PAY, RUB_PER_CRYSTAL, profile, simulate };

if (require.main === module) {
  const [out, days, from, to] = process.argv.slice(2); const D = +days || 7;
  const done = new Set(fs.existsSync(out) ? fs.readFileSync(out, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l).id) : []);
  for (let id = +from; id < +to; id++) {
    if (done.has(id)) continue;
    const res = simulate(profile(id), D);
    fs.appendFileSync(out, JSON.stringify(res) + '\n');
  }
}
