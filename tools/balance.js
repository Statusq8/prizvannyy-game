// Тесты баланса (0.97): бот-игрок по текущим правилам → docs/BALANCE_REPORT.md
//   node tools/balance.js            — все три горизонта: 30 минут, 4 часа, 30 дней
//   node tools/balance.js short      — только первые 30 минут (быстро)
// Бот: тапает TPS раз в секунду, раз в секунду покупает самое выгодное (прирост DPS / цена),
// при провале босса фармит FARM секунд и пробует снова; призывает на все билеты, звёзды, ранги;
// артефакты — покупает с витрины и качает самый дешёвый; ритуал — когда открыт и забег встал.
// Числа — только из CONFIG; выключенные функции (CONFIG.disabled) бот не видит, как и игрок.
const Core = require('../src/core.js'), B = Core.B, CFG = Core.CONFIG, num = x => B.toNum(x);
const fs = require('fs'), path = require('path');

function bot({ tps = 5, seed = 7, fps = 10, farm = 60 } = {}) {
  let sd = seed; const rng = () => { sd = (sd * 1664525 + 1013904223) % 4294967296; return sd / 4294967296; };
  const s = Core.newState({ rng });
  for (const ab of CFG.abilities) Core.setAbilityAuto(s, ab.id, true);
  const st = { t: 0, active: 0, buys: 0, fails: 0, farmUntil: 0, lastRecordAt: 0, record: 1, stalls: [], unlocks: {}, events: [], rituals: [] };
  const ratio = (g, c) => B.log10(B.max(g, 1e-300)) - B.log10(B.max(c, 1e-300));
  const heroes = () => CFG.allies.filter(a => s.heroes[a.id] && s.heroes[a.id].unlocked);
  function buyBest() {
    for (let g = 0; g < 400; g++) {
      const opts = [];
      if (s.tapLevel < Core.tapCap(s)) opts.push({ k: 'tap', c: Core.upgradeCost(s.tapLevel, 1), g: B.mul(B.sub(Core.tapDamageAt(s.tapLevel + 1), Core.tapDamageAt(s.tapLevel)), tps) });
      const nx = Core.chainNext(s);   // 0.99: следующий герой цепочки за золото
      if (nx) opts.push({ k: 'chain', c: CFG.allies.find(a => a.id === nx).hireCost, g: Core.allyDpsAt(nx, 1) });
      for (const a of heroes()) { const lv = s.allies[a.id].level; if (lv < Core.allyCap(s, a.id)) opts.push({ k: a.id, c: Core.allyCost(s, a.id, 1), g: B.sub(Core.allyDpsAt(a.id, lv + 1), Core.allyDpsAt(a.id, lv)) }); }
      if (!opts.length) return;
      opts.sort((x, y) => ratio(y.g, y.c) - ratio(x.g, x.c));
      let o = opts[0];
      if (B.gt(o.c, s.gold)) { o = opts.find(x => B.lte(x.c, s.gold) && B.lt(x.c, B.mul(opts[0].c, 0.1))); if (!o) return; }
      const ok = o.k === 'tap' ? Core.buyTap(s, 1) : o.k === 'chain' ? Core.buyChainHero(s) : Core.buyAlly(s, o.k, 1);
      if (!ok) return; st.buys++;
    }
  }
  function manage() {
    if (Core.unlockedAt(s, 'portal')) for (const b of ['normal']) { let n = 0; while (Core.canSummon(s, b, 1) && n++ < 200) Core.summon(s, 1, b); }
    for (const a of CFG.allies) { let n = 0; while (n++ < 30 && Core.starUp(s, a.id)); }
    for (const who of ['hero', ...heroes().map(a => a.id)]) { let n = 0; while (n++ < 50 && Core.rankUp(s, who)); }
    if (Core.unlockedAt(s, 'artifacts')) for (const br of ['soul', 'blood']) {
      for (let n = 0; n < 20; n++) { const off = Core.shopOffers(s, br); const i = off.findIndex(Boolean); if (i < 0 || !Core.shopBuy(s, br, i)) break; }
      for (let n = 0; n < 200; n++) {
        const own = CFG.artifacts.filter(a => !!a.blood === (br === 'blood') && Core.artLevel(s, a.id) > 0).map(a => ({ id: a.id, c: Core.upgradeArtCost(s, a.id) })).filter(x => x.c != null).sort((x, y) => x.c - y.c);
        if (!own.length || !Core.upgradeArtifact(s, own[0].id)) break;
      }
    }
    // ритуал: открыт и рекорд забега не рос 10 активных минут
    if (Core.unlockedAt(s, 'ritual') && Core.canRitual(s) && st.active - st.lastRecordAt > 600) {
      const r = Core.ritual(s); st.rituals.push({ t: st.t, souls: num(r.souls), start: r.start }); st.lastRecordAt = st.active; st.record = s.maxFloor;
    }
  }
  function note() {
    for (const [k, f] of Object.entries(CFG.unlocks)) if (!(k in st.unlocks) && Core.unlockedAt(s, k)) st.unlocks[k] = st.t;
    if (!('ally' in st.unlocks) && heroes().some(a => s.allies[a.id].level > 0)) st.unlocks.ally = st.t;
    if (s.maxFloor > st.record) { if (st.active - st.lastRecordAt > 60) st.stalls.push({ floor: st.record, sec: st.active - st.lastRecordAt }); st.record = s.maxFloor; st.lastRecordAt = st.active; }
  }
  const dt = 1 / fps;
  // активная игра: sec секунд
  function play(sec) {
    let nextTap = 0, nextBuy = 0, nextMan = 0; const end = st.t + sec;
    while (st.t < end) {
      st.t += dt; st.active += dt; nextTap -= dt; nextBuy -= dt; nextMan -= dt;
      for (const e of Core.tick(s, dt)) if (e.type === 'bossFail') { st.fails++; st.farmUntil = st.t + farm; }
      while (nextTap <= 0) { Core.tap(s); nextTap += 1 / tps; }
      if (nextBuy <= 0) { buyBest(); nextBuy += 1; }
      if (nextMan <= 0) { manage(); nextMan += 10; }
      if (s.farming && st.t > st.farmUntil) Core.challengeBoss(s);
      note();
    }
  }
  // офлайн: sec секунд (награда как в игре)
  function away(sec) { const r = Core.offlineProgress(s, sec); st.t += sec; manage(); buyBest(); note(); return r; }
  return { s, st, play, away, heroes };
}

const mm = sec => sec == null ? '—' : sec < 3600 ? (sec / 60).toFixed(1) + ' мин' : (sec / 3600).toFixed(1) + ' ч';
const unl = st => ['ally', 'ult', 'portal', 'artifacts', 'forge', 'shop', 'pve', 'ritual'].map(k => k + ': ' + (k in st.unlocks ? mm(st.unlocks[k]) : 'нет')).join(' · ');

function short(tps) {
  const b = bot({ tps, fps: 15 }); const rows = [];
  for (const m of [1, 2, 3, 5, 10, 15, 20, 30]) { b.play(m * 60 - b.st.t); rows.push([m, b.s.maxFloor, b.st.buys, b.st.fails, b.heroes().filter(a => b.s.allies[a.id].level > 0).length]); }
  return { b, rows };
}
function long(hours, tps) {
  const b = bot({ tps, fps: 10 }); const rows = [];
  for (const h of [0.5, 1, 2, 3, 4].filter(x => x <= hours)) { b.play(h * 3600 - b.st.t); rows.push([h, b.s.maxFloor, b.s.bestFloor, b.s.rituals, Core.foundCount(b.s), b.heroes().length, b.st.fails]); }
  return { b, rows };
}
// 30 дней: 3 сессии по 20 минут, между ними офлайн (в игре копится до CONFIG.offline.maxSec)
function days(n, tps) {
  const b = bot({ tps, fps: 5 }); const rows = [];
  for (let d = 1; d <= n; d++) {
    for (const gap of [8 * 3600, 4 * 3600, 4 * 3600]) { b.away(gap); b.play(20 * 60); }
    b.away(24 * 3600 - 16 * 3600 - 3600);   // остаток суток
    if ([1, 2, 3, 5, 7, 10, 14, 21, 30].includes(d)) rows.push([d, b.s.bestFloor, b.s.rituals, num(b.s.souls), Core.foundCount(b.s) + Core.shopFound(b.s, 'blood'), b.heroes().length, b.s.tickets]);
  }
  return { b, rows };
}

function table(head, rows) { return '| ' + head.join(' | ') + ' |\n|' + head.map(() => '---').join('|') + '|\n' + rows.map(r => '| ' + r.join(' | ') + ' |').join('\n') + '\n'; }
const stallTop = st => st.stalls.sort((a, b) => b.sec - a.sec).slice(0, 5).map(x => 'этаж ' + x.floor + ' — ' + mm(x.sec)).join(', ') || 'нет';

if (require.main === module) {
  const mode = process.argv[2] || 'all';
  let md = '# Отчёт по балансу (генерируется `node tools/balance.js`)\n\nВерсия игры ' + require('../package.json').version + '. Бот покупает самое выгодное, фармит 60 с при провале босса. Выключенные функции (`CONFIG.disabled`) не участвуют.\n\n';
  for (const tps of [3, 6]) {
    const { b, rows } = short(tps);
    md += '## Первые 30 минут — ' + tps + ' тапа/с\n' + table(['мин', 'рекорд этажа', 'покупок', 'провалов босса', 'союзников нанято'], rows);
    md += '\nОткрытия: ' + unl(b.st) + '\n\nДольше всего стоял: ' + stallTop(b.st) + '\n\n';
    console.error('30 мин, ' + tps + ' т/с: этаж ' + b.s.maxFloor);
  }
  if (mode !== 'short') {
    const { b, rows } = long(4, 5);
    md += '## Несколько часов подряд — 5 тапов/с\n' + table(['часов', 'этаж', 'рекорд', 'ритуалов', 'артефактов душ', 'героев', 'провалов'], rows);
    md += '\nОткрытия: ' + unl(b.st) + '\n\nДольше всего стоял: ' + stallTop(b.st) + '\n\n';
    console.error('4 ч: рекорд ' + b.s.bestFloor);
    const d = days(30, 5);
    md += '## 30 дней — 3 сессии по 20 минут в день + офлайн, 5 тапов/с\n' + table(['день', 'рекорд', 'ритуалов', 'души', 'артефактов', 'героев', 'билетов'], d.rows);
    md += '\nРитуалы: ' + (d.b.st.rituals.slice(0, 8).map(r => mm(r.t) + ' (+' + Core.fmt(r.souls) + ' душ, старт ' + r.start + ')').join(', ') || 'нет') + '\n';
    console.error('30 дней: рекорд ' + d.b.s.bestFloor + ', ритуалов ' + d.b.s.rituals);
  }
  fs.writeFileSync(path.join(__dirname, '../docs/BALANCE_REPORT.md'), md);
  console.log(md);
}
module.exports = { bot, short, long, days };
