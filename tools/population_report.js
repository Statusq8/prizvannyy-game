// Сводка теста «запуск, 1000 игроков» → docs/POPULATION_REPORT.md
//   node tools/population_report.js <файл1.jsonl> [файл2.jsonl …]
const fs = require('fs'), path = require('path');
const { ACT, PAY, RUB_PER_CRYSTAL } = require('./population.js');
const files = process.argv.slice(2);
const P = files.flatMap(f => fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)));
const D = Math.max(...P.map(p => p.daily.length));
const at = (p, d) => p.daily[Math.min(d, p.daily.length) - 1];
const q = (arr, x) => { const a = arr.slice().sort((m, n) => m - n); return a.length ? a[Math.min(a.length - 1, Math.floor(x * a.length))] : 0; };
const med = a => q(a, 0.5), pct = (n, t) => t ? Math.round(100 * n / t) + '%' : '—';
const DAYS = [1, 3, 7, 14, 30].filter(d => d <= D);
const FEAT = [['портал', 25], ['кузница', 50], ['рынок', 100], ['ритуал', 200]];
const actName = id => ACT.find(a => a.id === id).name, payName = id => PAY.find(a => a.id === id).name;
const tbl = (head, rows) => '| ' + head.join(' | ') + ' |\n|' + head.map(() => '---').join('|') + '|\n' + rows.map(r => '| ' + r.join(' | ') + ' |').join('\n') + '\n\n';

let md = '# Тест запуска: ' + P.length + ' игроков, ' + D + ' дней\n\nСгенерировано `node tools/population_report.js` из результатов `tools/population.js` (версия игры ' + require('../package.json').version + '). ' +
  'Каждый игрок — отдельный покадровый бот со своими тапами в секунду, сессиями, пропусками дней и тратами.\n\n';
md += '## Кто пришёл\n' + tbl(['тип', ...PAY.map(p => p.name), 'всего'], ACT.map(a => [a.name, ...PAY.map(p => P.filter(x => x.act === a.id && x.pay === p.id).length), P.filter(x => x.act === a.id).length]));

md += '## Рекорд этажа (медиана, в скобках — 10% слабейших … 10% сильнейших)\n';
md += tbl(['тип', ...DAYS.map(d => 'день ' + d)], ACT.map(a => { const g = P.filter(x => x.act === a.id && x.pay === 'free');
  return [a.name + ' (без доната)', ...DAYS.map(d => { const v = g.map(p => at(p, d).best); return med(v) + ' (' + q(v, 0.1) + '…' + q(v, 0.9) + ')'; })]; }));

md += '## Сколько открыли функций к концу недели (без доната)\n';
md += tbl(['тип', ...FEAT.map(f => f[0] + ' (' + f[1] + ')'), 'ритуалов (медиана)'], ACT.map(a => { const g = P.filter(x => x.act === a.id && x.pay === 'free');
  return [a.name, ...FEAT.map(([, f]) => pct(g.filter(p => at(p, Math.min(7, D)).best >= f).length, g.length)), med(g.map(p => at(p, D).rit))]; }));

md += '## Когда открывается (медиана по тем, кто открыл, без доната)\n';
const tm = s => s == null ? '—' : s < 3600 ? Math.round(s / 60) + ' мин' : s < 86400 ? (s / 3600).toFixed(1) + ' ч' : (s / 86400).toFixed(1) + ' дн';
md += tbl(['тип', 'портал', 'кузница', 'рынок', 'ритуал'], ACT.map(a => { const g = P.filter(x => x.act === a.id && x.pay === 'free');
  return [a.name, ...['portal', 'forge', 'shop', 'ritual'].map(k => { const v = g.map(p => p.unlocks[k]).filter(x => x != null); return v.length ? tm(med(v)) + ' (' + pct(v.length, g.length) + ')' : '—'; })]; }));

md += '## Герои к концу (медиана)\n' + tbl(['тип', 'открыто героев', 'из них A и выше', 'артефактов'], ACT.map(a => { const g = P.filter(x => x.act === a.id && x.pay === 'free');
  return [a.name, med(g.map(p => at(p, D).heroes)), med(g.map(p => at(p, D).aPlus)), med(g.map(p => at(p, D).arts))]; }));

md += '## Донат против бесплатных (тот же тип активности, день ' + D + ')\n';
md += tbl(['тип', 'без доната', 'минимальный', 'жёсткий', 'жёсткий / без доната'], ACT.map(a => {
  const m = id => { const g = P.filter(x => x.act === a.id && x.pay === id); return g.length ? med(g.map(p => at(p, D).best)) : null; };
  const f = m('free'), w = m('whale'); return [a.name, f, m('min') ?? '—', w ?? '—', f && w ? (w / f).toFixed(2) + '×' : '—']; }));

const payers = P.filter(p => p.pay !== 'free'), cr = payers.reduce((n, p) => n + at(p, D).bought, 0), rub = cr * RUB_PER_CRYSTAL;
md += '## Деньги (допущение: 1 💎 ≈ ' + RUB_PER_CRYSTAL + ' ₽)\n';
md += tbl(['показатель', 'за ' + D + ' дн.'], [['платящих', payers.length + ' из ' + P.length + ' (' + pct(payers.length, P.length) + ')'], ['куплено 💎', cr.toLocaleString('ru')],
  ['выручка', Math.round(rub).toLocaleString('ru') + ' ₽'], ['на одного игрока (ARPU)', (rub / P.length).toFixed(0) + ' ₽'], ['на платящего (ARPPU)', (rub / Math.max(1, payers.length)).toFixed(0) + ' ₽'],
  ...PAY.filter(p => p.id !== 'free').map(p => { const g = P.filter(x => x.pay === p.id); return [payName(p.id) + ': потрачено 💎 / светлых ритуалов (медиана)', med(g.map(x => at(x, D).spentCr)) + ' / ' + med(g.map(x => at(x, D).light))]; })]);

if (D >= 3) {
  const last = Math.min(D, 7), prev = last - 2;
  md += '## Застряли (рекорд не вырос за дни ' + (prev + 1) + '–' + last + ') — риск, что игрок уйдёт\n';
  md += tbl(['тип', 'застряли', 'где (медиана этажа)'], ACT.map(a => { const g = P.filter(x => x.act === a.id), st = g.filter(p => at(p, last).best <= at(p, prev).best);
    return [a.name, pct(st.length, g.length), st.length ? med(st.map(p => at(p, last).best)) : '—']; }));
}
fs.writeFileSync(path.join(__dirname, '../docs/POPULATION_REPORT.md'), md);
console.log(md);
