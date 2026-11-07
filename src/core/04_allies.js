  // ==== src/core/04_allies.js — Герои: DPS союзников, найм, уровни ====
  // ---------- союзники ----------
  function allyDef(id) { return CONFIG.allies.find(a => a.id === id); }
  // Множитель навыков героя на этом уровне
  function perkMult(level) {
    let own = 1, m = 1;
    for (const p of CONFIG.perks) {
      if (level < p.lvl) continue;
      if (p.kind === 'own') own += p.value;
      else if (p.kind === 'every') m = B.mul(m, B.fromLog10(Math.floor(level / p.every) * Math.log10(p.value)));
    }
    return B.mul(own, m);
  }
  function allyDpsAt(id, level) { return B.mul(withMilestones(allyDef(id).baseDps, level), perkMult(level)); }
  function starMult(s, id) { return 1 + CONFIG.starDpsBonus * s.heroes[id].stars; }
  // Эволюция: произведение множителей пройденных ступеней
  function evoMult(s, id) {
    let m = 1;
    for (let i = 0; i < s.heroes[id].evo; i++) m *= CONFIG.evolution.stages[i].mult;
    return m;
  }
  // Постоянная сила самого героя: звёзды × эволюция
  // 0.135: возвышение
  function heroRarity(s, id) { const R = CONFIG.rarities, a = allyDef(id), h = s.heroes[id]; return R[Math.min(R.length - 1, R.indexOf(a.rarity) + ((h && h.asc) | 0))]; }
  function ascMult(s, id) { const h = s.heroes[id]; return Math.pow(CONFIG.ascend.dpsMult, (h && h.asc) | 0); }
  function ascendCost(s, id) {
    const R = CONFIG.rarities, h = s.heroes[id], cur = heroRarity(s, id), k = (h.asc | 0), A = CONFIG.ascend;
    if (cur === R[R.length - 1]) return null;
    return { copies: A.copies + k, shards: Math.ceil(A.shards * Math.pow(A.growth, k) * (CONFIG.evolution.rarityCost[cur] || 1)), stars: CONFIG.maxStars, to: R[R.indexOf(cur) + 1] };
  }
  function canAscend(s, id) { const h = s.heroes[id], c = h && h.unlocked && ascendCost(s, id); return !!c && h.stars >= c.stars && h.copies >= c.copies && s.materials.shard >= c.shards; }
  function ascend(s, id) {
    if (!canAscend(s, id)) return false;
    const h = s.heroes[id], c = ascendCost(s, id);
    h.copies -= c.copies; s.materials.shard -= c.shards; h.asc = (h.asc | 0) + 1; s._pv = null; cnt(s, 'ascend');
    return true;
  }
  function heroMult(s, id) { return ascMult(s, id) * starMult(s, id) * evoMult(s, id) * boosterMult(s, id) * boneMult(s, id); }
  // Индивидуальный DPS героя (со звёздами и эволюцией), как если бы он был в отряде
  function allyDps(s, id) { return B.mul(allyDpsAt(id, s.allies[id].level), heroMult(s, id)); }
  // 0.74 (ответы 63–65): в бою только ГГ, бьют ВСЕ нанятые союзники — «отряд» = все нанятые и открытые
  function inSquad(s, id) { return !!(s.heroes[id] && s.heroes[id].unlocked && s.allies[id] && s.allies[id].level > 0); }
  function unlockedAt(s, key) { if (CONFIG.disabled && CONFIG.disabled.includes(key)) return false; if (CONFIG.unlockRituals && CONFIG.unlockRituals[key] != null) return (s.rituals | 0) >= CONFIG.unlockRituals[key]; const f = CONFIG.unlocks[key]; return f == null || Math.max(s.bestFloor | 0, s.maxFloor | 0) >= f; }
  // Вклад в общий DPS: отряд — полностью, нанятые резервные — долю, ненанятые — ничего
  function contribDps(s, id) { return B.mul(allyDps(s, id), inSquad(s, id) ? 1 : CONFIG.reserveShare); }
  // Авто-урон в секунду с постоянными множителями (для показа): союзники + автоатака героя
  function autoDps(s) {
    const allies = B.mul(CONFIG.allies.reduce((sum, a) => B.add(sum, contribDps(s, a.id)), 0), permMult(s, 'ally'));
    const hero = hasHeroAuto(s) ? B.mul(B.mul(tapDamage(s), permMult(s, 'heroAuto')), heroAutoTps(s)) : 0;
    return B.add(B.add(allies, hero), petDps(s));
  }
  // Урон тапа с постоянными множителями (для показа)
  function tapHit(s) { return B.mul(tapDamage(s), permMult(s, 'tap')); }
  // Ожидаемый DPS при заданной частоте тапов с учётом критов — для сравнения «до / после» трат душ
  function expectedDps(s, tps) {
    const critF = 1 + critChance(s) * (critMult(s) - 1);
    return B.mul(B.add(autoDps(s), B.mul(tapHit(s), tps)), critF);
  }
  function reserveDps(s) { return CONFIG.allies.reduce((sum, a) => (inSquad(s, a.id) ? sum : B.add(sum, contribDps(s, a.id))), 0); }
  function squadDefs(s) { return CONFIG.allies.filter(a => inSquad(s, a.id)); }
  // Уровень 0 → первая покупка = найм по hireCost
  function allyCost(s, id, n) { const a = allyDef(id); return seriesCost(a.hireCost, a.costGrowth, s.allies[id].level, n); }
  function allyMax(s, id) { const a = allyDef(id); return seriesMax(a.hireCost, a.costGrowth, s.allies[id].level, s.gold); }

