// Полный бот (0.156): обычный игрок 3 сессии × 20 мин + офлайн, пользуется ВСЕМИ включёнными функциями.
//   node tools/fullbot.js [дней=30] [donor]  → docs/BALANCE_FULL.md (или вывод в консоль)
// donor — донатер: +CRYSTALS_PER_DAY 💎 в день, тратит на светлую регрессию, премиум пропуска, личных боссов, рынок.
// Каждая сессия: сбросы дня/недели, «Забрать всё», экспедиции, руны, тотемы, древо, зелья, кости, питомцы, сезон,
// подземелья/личные боссы/бесконечное/Эхо (по попытке), затем 20 минут боя (покупки — как в tools/balance.js).
const Core = require('../src/core.js'), B = Core.B, CFG = Core.CONFIG, num = x => B.toNum(x);
const { bot } = require('./balance.js');
const CRYSTALS_PER_DAY = 300;
const EPOCH = Date.UTC(2026, 10, 2);   // понедельник
const dayKey = t => { const d = new Date(EPOCH + Math.floor(t / 86400) * 864e5); return d.toISOString().slice(0, 10); };
const weekKey = t => { const d = new Date(EPOCH + Math.floor(t / 86400 / 7) * 7 * 864e5); return 'w' + d.toISOString().slice(0, 10); };
const LIST = ['quests', 'login', 'portal', 'forge', 'artifacts', 'map', 'expedition', 'shop', 'pve', 'runes', 'ritual', 'tree', 'events', 'season', 'altar', 'alchemy', 'echo', 'curse', 'secret', 'totems', 'pets', 'bones', 'mail'];

function fullBot({ donor = false, seed = 7 } = {}) {
  let b;
  const ritualKind = s => donor && (s.crystals | 0) >= CFG.ritual.light.crystals ? 'light' : 'dark';
  b = bot({ tps: 5, fps: 5, seed, ritualKind, onManage: (s) => light(s) });
  const s = b.s, st = b.st; st.unl = {};
  // лёгкое — каждые 10 с боя
  function light(s) {
    try { Core.equipBestAll && Core.equipBestAll(s); } catch (e) {}
    for (const p of CFG.pets.list) { let n = 0; while (n++ < 5 && Core.canEvolvePet(s, p.id)) Core.evolvePet(s, p.id); }
    // лучший питомец: самый высокий ранг × форма
    let best = null, bv = -1; for (const p of CFG.pets.list) { const f = Core.petForm(s, p.id); if (!f) continue; const v = CFG.rarities.indexOf(p.rank) * 3 + f; if (v > bv) { bv = v; best = p.id; } }
    if (best && s.pets.active !== best) Core.setPet(s, best);
  }
  function runMode(kind, opts) {
    if (!Core.enterMode(s, kind, opts, dayKey(st.t))) return false;
    let guard = 0; while (s.mode && guard++ < 40) b.play(5);
    if (s.mode) Core.leaveMode && Core.leaveMode(s);
    return true;
  }
  function session() {
    const dk = dayKey(st.t), wk = weekKey(st.t);
    Core.dailyReset(s, dk); Core.seasonReset(s, dk); Core.eventReset(s, wk); Core.questsReset(s, dk, wk);
    if (donor) { if (!s._dday || s._dday !== dk) { s._dday = dk; s.crystals = (s.crystals | 0) + CRYSTALS_PER_DAY; st.donated = (st.donated || 0) + CRYSTALS_PER_DAY; } }
    Core.claimEverything(s, dk);
    // экспедиции
    if (Core.unlockedAt(s, 'expedition')) {
      const now = st.t * 1000; Core.expRefresh(s, dk);
      for (const r of s.exp.runs.slice()) Core.expClaim(s, r.uid, now);
      const ids = CFG.allies.filter(a => s.heroes[a.id].unlocked).map(a => a.id);
      for (const o of s.exp.offers.slice()) {
        if (s.exp.runs.length >= CFG.expeditions.slots) break;
        const L = CFG.expeditions.lengths[o.len];
        for (let t = 0; t < 150; t++) { const free = ids.filter(id => !Core.expBusy(s, id)).sort(() => s.rng() - 0.5).slice(0, L.team); if (free.length < L.team) break; if (Core.expStart(s, o.uid, free, now)) break; }
      }
    }
    // руны: создать на излишек осколков (оставляем запас на ранги), слить
    if (Core.unlockedAt(s, 'runes')) { let n = 0; while (n++ < 30 && s.materials.shard > CFG.runes.createCost * 4) Core.createRune(s);
      for (const k of CFG.runes.kinds) for (let t = 0; t < 9; t++) while (Core.mergeable(s, k.id, t)) Core.mergeRunes(s, k.id, t); }
    if (Core.unlockedAt(s, 'totems')) for (let n = 0; n < 40; n++) { const L = Object.keys(s.totems).map(id => ({ id, c: Core.totemUpCost(s, id) })).filter(x => x.c && s.materials.shard >= x.c.shards).sort((a, b) => a.c.shards - b.c.shards); if (!L.length || !Core.upgradeTotem(s, L[0].id)) break; }
    if (Core.unlockedAt(s, 'tree')) for (let n = 0; n < 60; n++) { const L = CFG.soulTree.flatMap(br => br.nodes).map(x => ({ id: x.id, c: Core.treeCost(s, x.id) })).filter(x => x.c != null && Core.treeNodeOpen(s, x.id) && B.gte(s.souls, x.c)).sort((a, b) => a.c - b.c); if (!L.length || !Core.buyTreeNode(s, L[0].id)) break; }
    if (Core.unlockedAt(s, 'alchemy')) for (const p of CFG.alchemy.potions) Core.brewPotion(s, p.id);
    if (Core.unlockedAt(s, 'season')) { Core.claimTrail(s, dk); Core.buySeasonHero(s, dk); if (donor) Core.buyPremium(s); }
    if (Core.unlockedAt(s, 'market') || Core.unlockedAt(s, 'shop')) { try { Core.marketSync(s, st.t * 1000); if (s.market) for (let i = 0; i < s.market.items.length; i++) { const it = s.market.items[i]; if (!it.sold && (donor || Core.marketGood(it.g).cur === 'souls')) Core.marketBuy(s, i); } } catch (e) {} }
    // режимы
    if (Core.unlockedAt(s, 'pve')) {
      for (const d of CFG.pve.dungeons) while (Core.attemptsLeft(s, d.id) > 0) if (!runMode('dungeon', { id: d.id, tier: Core.maxDungeonTier(s) })) break;
      if (Core.attemptsLeft(s, 'endless') > 0) runMode('endless', {});
      const pb = Core.personalBosses(s); if (pb.length) { if (donor) while (Core.buyPersonal(s)); let n = 0; while (Core.attemptsLeft(s, 'personal') > 0 && n++ < 10) if (!runMode('personal', { id: pb[pb.length - 1].id, diff: 'normal' })) break; }
      if (Core.unlockedAt(s, 'echo')) { const ex = Core.echoInfo(s); if (ex && ex.left) runMode('echo', {}); }
      for (const x of s.secrets.filter(x => !x.done)) runMode('secret', { floor: x.floor });
    }
    if (s.curse && !s.curse.on && s.curse.floor === s.floor) Core.acceptCurse(s);
    Core.claimEverything(s, dk);
  }
  function note() { for (const k of LIST) if (!(k in st.unl) && Core.unlockedAt(s, k)) st.unl[k] = st.t; }
  function day() {
    for (const gap of [8 * 3600, 4 * 3600, 4 * 3600]) { b.away(gap); session(); note(); b.play(20 * 60); note(); }
    b.away(24 * 3600 - 16 * 3600 - 3600); note();
  }
  return { b, s, st, day };
}

function run(days, donor) {
  const f = fullBot({ donor }), rows = [];
  let prev = 0;
  for (let d = 1; d <= days; d++) {
    f.day();
    const s = f.s;
    rows.push({ d, rec: Math.max(s.bestFloor | 0, s.maxFloor | 0), grow: Math.max(s.bestFloor | 0, s.maxFloor | 0) - prev, rit: s.rituals, heroes: CFG.allies.filter(a => s.heroes[a.id].unlocked).length,
      tk: s.tickets, cr: s.crystals | 0, sh: Math.round(s.materials.shard), ach: Core.achPoints(s), pets: Object.keys(s.pets.forms).length, tot: Core.totemCount(s), dmg: Core.fmt(Core.tapHit ? Core.tapHit(s) : 0) });
    prev = rows[rows.length - 1].rec;
  }
  return { f, rows };
}
const hh = t => (t / 86400 < 1 ? (t / 3600).toFixed(1) + ' ч' : 'д' + (t / 86400 + 1).toFixed(1));
function report(days) {
  const free = run(days, false), don = run(days, true);
  let md = '# Полный бот (`node tools/fullbot.js`) — все включённые функции\n\nВерсия ' + require('../package.json').version + '. 3 сессии × 20 мин в день + офлайн, 5 тапов/с. Донатер: +' + CRYSTALS_PER_DAY + ' 💎/день.\n\n';
  md += '| день | рекорд | +за день | рекорд донатера | ×донат | регрессий | героев | 🎟 | 💎 | 🔹 | ступ. дост. | питомцев | тотемов |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|\n';
  free.rows.forEach((r, i) => { const d = don.rows[i]; md += '| ' + [r.d, r.rec, r.grow, d.rec, (d.rec / Math.max(1, r.rec)).toFixed(2), r.rit, r.heroes, r.tk, r.cr, r.sh, r.ach, r.pets, r.tot].join(' | ') + ' |\n'; });
  md += '\nОткрытия (обычный игрок): ' + LIST.map(k => k + ' ' + (k in free.f.st.unl ? hh(free.f.st.unl[k]) : '—')).join(' · ') + '\n';
  md += '\nДней без роста рекорда подряд (максимум): ' + (() => { let m = 0, c = 0; for (const r of free.rows) { c = r.grow > 0 ? 0 : c + 1; m = Math.max(m, c); } return m; })() + '\n';
  return { md, free, don };
}
if (require.main === module) {
  const days = +process.argv[2] || 30;
  const { md } = report(days);
  require('fs').writeFileSync(require('path').join(__dirname, '../docs/BALANCE_FULL.md'), md);
  console.log(md);
}
module.exports = { fullBot, run, report };
