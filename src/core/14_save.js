  // ==== src/core/14_save.js — Сохранения: serialize / deserialize, проверка и миграции ====
  // ---------- сохранение ----------
  function serialize(s) {
    return JSON.stringify({
      v: CONFIG.saveVersion,
      floor: s.floor, maxFloor: s.maxFloor, highestCleared: s.highestCleared,
      enemyIndex: s.enemyIndex, farming: s.farming,
      gold: B.str(s.gold), tapLevel: s.tapLevel, stats: { ...s.stats, goldEarned: B.str(s.stats.goldEarned), soulsEarned: B.str(s.stats.soulsEarned) }, autoAdvance: s.autoAdvance,
      allies: Object.fromEntries(CONFIG.allies.map(a => [a.id, s.allies[a.id].level])),
      abilities: Object.fromEntries(CONFIG.abilities.map(a => [a.id, { cd: s.abilities[a.id].cd, auto: s.abilities[a.id].auto }])),
      heroes: Object.fromEntries(CONFIG.allies.filter(a => s.heroes[a.id].unlocked).map(a => [a.id, { copies: s.heroes[a.id].copies, stars: s.heroes[a.id].stars, evo: s.heroes[a.id].evo, rank: s.heroes[a.id].rank, asc: s.heroes[a.id].asc | 0 }])),
      materials: { shard: s.materials.shard, heart: s.materials.heart, dust: s.materials.dust | 0 }, heartFloor: s.heartFloor, heroRank: s.heroRank,
      bones: s.bones.map(b => ({ ...b })), boneSeq: s.boneSeq,
      pets: { active: s.pets.active, forms: { ...s.pets.forms }, frags: { ...s.pets.frags }, lair: { ...s.pets.lair } }, bestCleared: s.bestCleared | 0,
      squad: s.squad.slice(), tickets: s.tickets, crystals: s.crystals | 0, crystalFloor: s.crystalFloor | 0, market: { items: (s.market ? s.market.items : []).map(x => ({ ...x })), next: s.market ? s.market.next : 0 }, ticketFloor: s.ticketFloor, pity: { a: s.pity.a, s: s.pity.s },
      bpity: JSON.parse(JSON.stringify(s.bpity)),
      essence: s.essence, locks: Object.keys(s.locks), discovered: Object.keys(s.discovered),
      souls: B.str(s.souls), artifacts: { ...s.artifacts }, tree: { ...s.tree },
      runes: s.runes.map(r => ({ ...r })), runeSeq: s.runeSeq, totems: { ...s.totems }, biomeTitles: { ...(s.biomeTitles || {}) },
      pve: { day: s.pve.day, used: { ...s.pve.used }, endlessBest: s.pve.endlessBest }, trial: { ...s.trial },
      counters: { ...s.counters },
      event: { week: s.event.week, id: s.event.id, points: s.event.points, lanterns: s.event.lanterns, ms: Object.keys(s.event.ms).map(Number), bought: { ...s.event.bought } },
      inbox: s.inbox.map(x => ({ id: x.id, title: x.title, reward: { ...x.reward } })), inboxSeq: s.inboxSeq,
      titles: [...s.titles], title: s.title, skins: [...s.skins], favs: [...s.favs], trophies: [...s.trophies], echo: { ...s.echo }, curse: s.curse ? { ...s.curse } : null, potions: { ...s.potions }, towerMs: s.towerMs, bestiary: { ...s.bestiary }, diaryPages: [...s.diaryPages], secrets: s.secrets.map(x => ({ ...x })), prestigeClaimed: s.prestigeClaimed, frame: s.frame, megaSoulsFloor: s.megaSoulsFloor, cageFreed: s.cageFreed, goldHired: [...(s.goldHired || [])], artShop: { soul: [...(s.artShop ? s.artShop.soul : [])], blood: [...(s.artShop ? s.artShop.blood : [])] },
      presets: s.presets.map(p => p ? { squad: [...p.squad], pet: p.pet } : null),
      cls: { id: s.cls.id, spent: { ...s.cls.spent }, changeDay: s.cls.changeDay }, booster: { ...s.booster },
      season: { ...s.season, free: Object.keys(s.season.free).map(Number), paid: Object.keys(s.season.paid).map(Number),
                trailBase: s.season.trailBase ? { ...s.season.trailBase } : null },
      quests: { day: s.quests.day, week: s.quests.week, dayBase: { ...s.quests.dayBase }, weekBase: { ...s.quests.weekBase }, runBase: { ...s.quests.runBase }, claimed: Object.keys(s.quests.claimed), chests: Object.keys(s.quests.chests).map(Number) },
      login: { ...s.login }, travel: { ...s.travel }, exp: JSON.parse(JSON.stringify(s.exp)),
      ach: { ...s.ach }, rituals: s.rituals, bestFloor: s.bestFloor, bestRecordAtRunStart: s.bestRecordAtRunStart,
      savedAt: Date.now(),
    });
  }

  function deserialize(str) {
    let d;
    try { d = JSON.parse(str); } catch (e) { return null; }
    if (!d || typeof d !== 'object') return null;
    if (d.v === 1) { d.v = 2; d.allies = {}; }          // миграция 0.2 → 0.3: союзников ещё не было
    if (d.v === 2) { d.v = 3; d.critChanceLevel = 0; d.critMultLevel = 0; d.abilities = {}; }   // 0.5 → 0.6
    if (d.v === 3) {                                       // 0.6 → 0.7: коллекция героев и портал
      d.v = 4;
      d.heroes = Object.fromEntries(CONFIG.allies.filter(a => a.starter).map(a => [a.id, { copies: 0, stars: 0 }]));
      d.squad = CONFIG.allies.filter(a => a.starter).map(a => a.id).slice(0, CONFIG.squadSize);
      let t = 0; for (let f = 1; f <= (d.highestCleared | 0); f++) t += ticketsForFloor(f);   // билеты за уже пройденных боссов
      d.tickets = t; d.ticketFloor = d.highestCleared | 0; d.pity = { a: 0, s: 0 };
    }
    if (d.v === 4) { d.v = 5; d.essence = 0; d.locks = []; d.discovered = []; }   // 0.7 → 0.8: Алтарь
    if (d.v === 5) { d.v = 6; d.souls = 0; d.artifacts = {}; d.rituals = 0; d.bestFloor = d.maxFloor; d.bestRecordAtRunStart = 1; }   // 0.8 → 0.9
    if (d.v === 6) {                                       // 0.9 → 0.10: материалы за уже пройденных боссов
      d.v = 7;
      let sh = 0, he = 0;
      for (let f = 1; f <= (d.ticketFloor | 0); f++) { sh += shardsForBoss(f); he += heartsForFloor(f); }
      d.materials = { shard: sh, heart: he }; d.heartFloor = d.ticketFloor | 0;
      for (const id in (d.heroes || {})) if (d.heroes[id]) d.heroes[id].evo = 0;
    }
    if (d.v === 7) { d.v = 8; d.tree = {}; }               // 0.13 → 0.14: дерево душ
    if (d.v === 8) {                                       // 0.14 → 0.15: руны и тотемы за уже пройденных финальных боссов
      d.v = 9; d.runes = []; d.runeSeq = 1; d.totems = {};
      for (let f = CONFIG.biomeFloors; f <= (d.heartFloor | 0); f += CONFIG.biomeFloors) d.totems[biomeOf(f).id] = 1;
    }
    if (d.v === 9) { d.v = 10; d.pve = { day: '', used: {}, endlessBest: 0 }; }   // 0.15 → 0.16: доп. PvE
    if (d.v === 10) {                                      // 0.16 → 0.17: задания; счётчики из статистики
      d.v = 11;
      const st = d.stats || {};
      d.counters = { kill: st.kills | 0, boss: st.bossKills | 0, tap: st.taps | 0, ritual: d.rituals | 0 };
      d.quests = { day: '', week: '', dayBase: {}, weekBase: {}, claimed: [] };
    }
    if (d.v === 11) {                                      // 0.18 → 0.19: ранги и потолки уровней
      d.v = 12; d.heroRank = 0;
      for (const id in (d.heroes || {})) if (d.heroes[id]) d.heroes[id].rank = 0;
    }
    if (d.v === 12) { d.v = 13; d.season = { n: 0, xp: 0, tokens: 0, premium: false, free: [], paid: [], trail: 0, trailBase: null, catchupDay: '' }; }   // 0.20 → 0.21
    if (d.v === 13) { d.v = 14; d.event = { week: '', id: null, points: 0, lanterns: 0, ms: [], bought: {} }; d.inbox = []; d.inboxSeq = 1; }   // 0.22 → 0.23
    if (d.v === 14) { d.v = 15; d.cls = { id: null, spent: {}, changeDay: '' }; d.booster = { owner: null, movedAt: 0 }; }   // 0.24 → 0.25
    if (d.v === 15) { d.v = 16; d.bones = []; d.boneSeq = 1; if (d.materials) d.materials.dust = 0; }   // 0.25 → 0.26: кости монстров
    if (d.v === 16) { d.v = 17; d.pets = { active: null, levels: {} }; }   // (уровни переводятся в формы в миграции 22)   // 0.26 → 0.27: питомцы
    if (d.v === 17) { d.v = 18; d.ach = {}; if (d.quests) d.quests.runBase = { ...(d.counters || {}) }; }   // 0.27 → 0.28
    if (d.v === 18) { d.v = 19; d.bpity = {}; }               // 0.28 → 0.29: баннеры
    if (d.v === 19) { d.v = 20; d.login = { day: '', n: 0 }; d.travel = { day: '', used: 0 }; if (d.quests) d.quests.chests = []; }   // 0.32 → 0.33
    if (d.v === 20) {                                      // 0.40 → 0.41: редкости SS и SSS между S и GOD — GOD теперь ступень 8
      d.v = 21;
      for (const r of d.runes || []) if (r && r.tier === 6) r.tier = 8;
      for (const b of d.bones || []) if (b && b.tier === 6) b.tier = 8;
    }
    if (d.v === 21) {                                      // 0.42 → 0.43: питомцы 2.0
      d.v = 22;
      const old = (d.pets && d.pets.levels) || {}, map = { wolf: 'ash_rat', golem: 'bog_toad', phoenix: 'shadow_wolf', drake: 'stone_beetle' };
      let refund = 0;                                      // осколки, потраченные на уровни старых питомцев, возвращаются
      for (const id in old) { const lv = old[id] | 0; for (let l = 1; l < lv; l++) refund += Math.ceil(30 * Math.pow(1.22, l - 1)); }
      const forms = {}; for (const id in map) if ((old[id] | 0) > 0) forms[map[id]] = 1;
      d.pets = { active: map[d.pets && d.pets.active] && forms[map[d.pets.active]] ? map[d.pets.active] : null, forms, frags: {}, lair: { week: '', kills: 0 } };
      if (d.materials) d.materials.shard = (d.materials.shard | 0) + refund;
      d.bestCleared = Math.max(d.highestCleared | 0, (d.bestFloor | 0) - 1, 0);
    }
    if (d.v === 22) { d.v = 23; d.trial = { week: '', weekBest: 0, best: 0 }; }   // 0.43 → 0.44: испытательная башня
    if (d.v === 23) {                                      // 0.50 → 0.51: титулы за уже проведённые регрессии (без повторной выдачи ценностей)
      d.v = 24; d.titles = []; d.skins = [];
      for (const m of CONFIG.ritual.milestones) if ((d.rituals | 0) >= m.n) { d.titles.push(m.title); if (m.skin) d.skins.push(m.skin); }
      d.title = d.titles[0] || null;
    }
    if (d.v === 24) { d.v = 25; d.favs = []; d.presets = [null, null, null]; }   // 0.53 → 0.54: избранные и пресеты
    if (d.v === 25) {                                      // 0.56 → 0.57: трофеи за всех боссов до рекорда
      d.v = 26; const t = new Set();
      for (let f = 1; f <= Math.min(d.bestFloor | 0, CONFIG.biomeFloors * CONFIG.biomes.length); f++) t.add(trophyKey(f));
      d.trophies = [...t];
    }
    if (d.v === 26) { d.v = 27; d.echo = { week: '', used: 0, won: false }; }   // 0.57 → 0.58: «Эхо Башни»
    if (d.v === 27) { d.v = 28; d.curse = null; }                                // 0.58 → 0.59: проклятые этажи
    if (d.v === 28) { d.v = 29; d.potions = {}; }                                // 0.59 → 0.60: алхимия
    if (d.v === 29) { d.v = 30; d.towerMs = 0; }                                 // 0.60 → 0.61: вехи Башни (выдадутся на следующем этаже)
    if (d.v === 30) { d.v = 31; d.bestiary = {}; d.diaryPages = []; }            // 0.61 → 0.62: дневник (заполняется с новых побед)
    if (d.v === 31) {                                      // 0.62 → 0.63: скрытые комнаты ниже рекорда — сразу найдены
      d.v = 32; d.secrets = [];
      for (let k = 0; secretFloor(k) <= (d.bestFloor | 0) - 1; k++) d.secrets.push({ floor: secretFloor(k), done: false });
    }
    if (d.v === 32) { d.v = 33; d.prestigeClaimed = 0; d.frame = null; }       // 0.63 → 0.64: престиж аккаунта
    if (d.v === 33) {                                      // 0.66 → 0.67: новый ростер (52 героя) — прогресс по прежним слотам
      d.v = 34;
      const M = HERO_MIGRATE, ren = id => M[id] || id;
      const mapObj = o => { if (!o || typeof o !== 'object') return o; const r = {}; for (const k in o) if (allyDef(ren(k))) r[ren(k)] = o[k]; return r; };
      const kept = !!(d.heroes && d.heroes.borg);              // Борг был в стартовом отряде — остаётся открытым
      d.heroes = mapObj(d.heroes); d.allies = mapObj(d.allies);
      if (kept && !d.heroes.borg) d.heroes.borg = { copies: 0, stars: 0, evo: 0, rank: 0 };
      if (Array.isArray(d.squad)) d.squad = d.squad.map(ren).filter(id => allyDef(id));
      if (Array.isArray(d.bones)) for (const b of d.bones) if (b && b.on && b.on !== 'hero') b.on = allyDef(ren(b.on)) ? ren(b.on) : null;
      for (const k of ['locks', 'discovered', 'favs']) if (Array.isArray(d[k])) d[k] = d[k].map(ren).filter(id => allyDef(id));
      if (Array.isArray(d.presets)) d.presets = d.presets.map(p => p && Array.isArray(p.squad) ? { ...p, squad: p.squad.map(ren).filter(id => allyDef(id)) } : p);
    }
    if (d.v !== CONFIG.saveVersion) return null;
    const int = (x, min) => Number.isInteger(x) && x >= min;
    if (!int(d.floor, 1) || !int(d.maxFloor, 1) || !int(d.highestCleared, 0) ||
        !int(d.enemyIndex, 1) || d.enemyIndex > CONFIG.enemiesPerFloor ||
        !int(d.tapLevel, 1) || B.parse(d.gold) == null || B.lt(B.parse(d.gold), 0) ||
        d.floor > d.maxFloor) return null;
    const s = newState();
    s.floor = d.floor; s.maxFloor = d.maxFloor; s.highestCleared = d.highestCleared;
    s.enemyIndex = d.enemyIndex; s.farming = !!d.farming;
    s.gold = B.parse(d.gold); s.tapLevel = d.tapLevel; s.autoAdvance = d.autoAdvance !== false;
    if (d.stats) s.stats = {
      taps: d.stats.taps | 0, kills: d.stats.kills | 0, bossKills: d.stats.bossKills | 0, crits: d.stats.crits | 0, maxTps: d.stats.maxTps | 0,
      goldEarned: d.stats.goldEarned ? B.parse(d.stats.goldEarned) : 0, soulsEarned: d.stats.soulsEarned ? B.parse(d.stats.soulsEarned) : 0,
      playTime: +d.stats.playTime > 0 ? +d.stats.playTime : 0,
    };
    const al = d.allies && typeof d.allies === 'object' ? d.allies : {};
    for (const a of CONFIG.allies) {
      const lv = al[a.id];
      if (lv === undefined) continue;
      if (!int(lv, 0)) return null;
      s.allies[a.id].level = lv;
    }
    // Прокачка критов за золото убрана: возвращаем потраченное золото (сохранения 0.6)
    const rf = CONFIG.legacyCritRefund;
    if (int(d.critChanceLevel, 1)) s.gold = B.add(s.gold, seriesCost(rf.chanceCost, rf.chanceGrowth, 0, d.critChanceLevel));
    if (int(d.critMultLevel, 1)) s.gold = B.add(s.gold, seriesCost(rf.multCost, rf.multGrowth, 0, d.critMultLevel));
    const ab = d.abilities && typeof d.abilities === 'object' ? d.abilities : {};
    for (const a of CONFIG.abilities) {
      const x = ab[a.id];
      if (!x) continue;
      const cd = Number(x.cd);
      s.abilities[a.id].cd = isFinite(cd) ? Math.min(Math.max(0, cd), a.cooldown) : 0;
      s.abilities[a.id].auto = !!x.auto;
    }
    // коллекция
    if (!d.heroes || typeof d.heroes !== 'object') return null;
    for (const a of CONFIG.allies) {
      const h = d.heroes[a.id];
      s.heroes[a.id] = { unlocked: !!h || !!a.starter, copies: 0, stars: 0, evo: 0, rank: 0 };
      if (!h) continue;
      if (!int(h.copies, 0) || !int(h.stars, 0) || h.stars > CONFIG.maxStars ||
          !int(h.evo, 0) || h.evo > CONFIG.evolution.stages.length || !int(h.rank, 0) || h.rank > maxSteps()) return null;
      s.heroes[a.id].copies = h.copies; s.heroes[a.id].stars = h.stars; s.heroes[a.id].evo = h.evo; s.heroes[a.id].rank = h.rank;
      s.heroes[a.id].asc = Math.max(0, Math.min(CONFIG.rarities.length - 1, +h.asc | 0));
    }
    if (!Array.isArray(d.squad) || d.squad.length > CONFIG.squadSize) return null;
    s.squad = [];
    for (const id of d.squad) if (allyDef(id) && s.heroes[id].unlocked && !s.squad.includes(id)) s.squad.push(id);
    if (!int(d.tickets, 0) || !int(d.ticketFloor, 0)) return null;
    s.tickets = d.tickets; s.ticketFloor = d.ticketFloor;
    s.biomeTitles = {};
    if (d.biomeTitles && typeof d.biomeTitles === 'object') { for (const b of CONFIG.biomes) if (d.biomeTitles[b.id]) s.biomeTitles[b.id] = 1; }
    else for (let f = CONFIG.biomeFloors; f <= (+d.bestCleared | 0); f += CONFIG.biomeFloors) s.biomeTitles[biomeOf(f).id] = 1;   // старые сохранения: титулы за пройденных финальных боссов
    s.crystals = Math.max(0, +d.crystals | 0); s.crystalFloor = Math.max(0, +d.crystalFloor | 0);
    { const M = d.market || {}, ok = x => x && CONFIG.market.goods.some(g => g.id === x.g) && (!x.hero || allyDef(x.hero));
      s.market = { items: Array.isArray(M.items) ? M.items.filter(ok).filter(x => x.g !== 'potion' || potionDef(x.p)).slice(0, CONFIG.market.slots)
        .map(x => (x.p ? { g: x.g, hero: x.hero || null, p: x.p, sold: !!x.sold } : { g: x.g, hero: x.hero || null, sold: !!x.sold })) : [], next: +M.next > 0 ? +M.next : 0 }; }
    const m = d.materials;
    if (!m || typeof m !== 'object' || !int(m.shard, 0) || !int(m.heart, 0) || !int(m.dust, 0) || !int(d.heartFloor, 0)) return null;
    s.materials = { shard: m.shard + heartShards(m.heart), heart: 0, dust: m.dust }; s.heartFloor = d.heartFloor;   // 0.51: сердца → осколки
    if (!Array.isArray(d.bones) || !int(d.boneSeq, 1)) return null;
    for (const b of d.bones) {
      if (b && CONFIG.bones.legacySlots[b.slot]) b.slot = CONFIG.bones.legacySlots[b.slot];
      if (!b || !int(b.id, 1) || !boneSlot(b.slot) || !int(b.tier, 0) || b.tier >= CONFIG.rarities.length ||
          !int(b.lvl, 0) || b.lvl > CONFIG.bones.maxLevel || !int(b.grade, 1)) return null;
      s.bones.push({ id: b.id, slot: b.slot, tier: b.tier, lvl: b.lvl, grade: b.grade, lock: !!b.lock,
                     on: b.on === 'hero' || allyDef(b.on) ? b.on : null });
    }
    s.boneSeq = Math.max(d.boneSeq, ...s.bones.map(b => b.id + 1));
    const pt = d.pets;
    if (!pt || typeof pt !== 'object' || !pt.forms || typeof pt.forms !== 'object' || !pt.frags || typeof pt.frags !== 'object') return null;
    for (const p of CONFIG.pets.list) {
      const f = pt.forms[p.id], n = pt.frags[p.id];
      if (int(f, 1) && f <= CONFIG.pets.forms.length) s.pets.forms[p.id] = f;
      if (int(n, 1)) s.pets.frags[p.id] = n;
    }
    s.pets.active = s.pets.forms[pt.active] ? pt.active : null;
    if (pt.lair && typeof pt.lair.week === 'string' && int(pt.lair.kills, 0)) s.pets.lair = { week: pt.lair.week, kills: pt.lair.kills };
    s.bestCleared = int(d.bestCleared, 0) ? d.bestCleared : 0;
    if (!int(d.heroRank, 0) || d.heroRank > maxSteps()) return null;
    s.heroRank = d.heroRank;
    s.pity = { a: (d.pity && d.pity.a) | 0, s: (d.pity && d.pity.s) | 0 };
    s.bpity = {};
    for (const b of CONFIG.portal.banners) { const x = d.bpity && d.bpity[b.id]; if (x && b.id !== 'normal') s.bpity[b.id] = { a: x.a | 0, s: x.s | 0 }; }
    if (!int(d.essence, 0) || !Array.isArray(d.locks) || !Array.isArray(d.discovered)) return null;
    s.essence = d.essence;
    const souls = B.parse(d.souls);
    if (souls == null || B.lt(souls, 0) || (typeof souls === 'number' && !Number.isInteger(souls)) || !int(d.rituals, 0) || !int(d.bestFloor, 1) || !int(d.bestRecordAtRunStart, 1) ||
        !d.artifacts || typeof d.artifacts !== 'object') return null;
    s.souls = souls; s.rituals = d.rituals;
    s.bestFloor = Math.max(d.bestFloor, d.maxFloor); s.bestRecordAtRunStart = d.bestRecordAtRunStart;
    for (const a of CONFIG.artifacts) {
      const lv = d.artifacts[a.id];
      if (lv === undefined) continue;
      if (!int(lv, 1) || (a.max && lv > a.max)) return null;
      s.artifacts[a.id] = lv;
    }
    if (!Array.isArray(d.runes) || !int(d.runeSeq, 1) || !d.totems || typeof d.totems !== 'object') return null;
    for (const r of d.runes) {
      if (!r || !runeKind(r.type) || !int(r.id, 1) || !int(r.tier, 0) || r.tier >= CONFIG.rarities.length ||
          !int(r.lvl, 0) || r.lvl > CONFIG.runes.maxLevel) return null;
      s.runes.push({ id: r.id, type: r.type, tier: r.tier, lvl: r.lvl });
    }
    s.runeSeq = Math.max(d.runeSeq, ...s.runes.map(r => r.id + 1));
    for (const b of CONFIG.biomes) {
      const lv = d.totems[b.id];
      if (lv === undefined) continue;
      if (!int(lv, 1) || lv > CONFIG.totems.maxLevel) return null;
      s.totems[b.id] = lv;
    }
    const nums = o => { const r = {}; if (o && typeof o === 'object') for (const k in o) if (typeof o[k] === 'number' && isFinite(o[k]) && o[k] >= 0) r[k] = o[k]; return r; };
    const qd = d.quests;
    if (!d.counters || typeof d.counters !== 'object' || !qd || typeof qd !== 'object' || !Array.isArray(qd.claimed) ||
        typeof qd.day !== 'string' || typeof qd.week !== 'string') return null;
    s.counters = nums(d.counters);
    s.quests = { day: qd.day, week: qd.week, dayBase: nums(qd.dayBase), weekBase: nums(qd.weekBase), runBase: nums(qd.runBase), claimed: {} };
    s.exp = expLoad(d.exp);   // 0.142
    for (const a of CONFIG.achievements.list) { const t = d.ach && d.ach[a.id]; if (int(t, 1) && t <= a.goals.length) s.ach[a.id] = t; }
    for (const id of qd.claimed) if (questDef(id)) s.quests.claimed[id] = true;
    s.quests.chests = {};
    if (Array.isArray(qd.chests)) for (const i of qd.chests) if (CONFIG.questChests[i]) s.quests.chests[i] = true;
    const lg = d.login, tr = d.travel;
    if (!lg || typeof lg.day !== 'string' || !int(lg.n, 0) || !tr || typeof tr.day !== 'string' || !int(tr.used, 0)) return null;
    s.login = { day: lg.day, n: lg.n }; s.travel = { day: tr.day, used: tr.used };
    const cl = d.cls, bo = d.booster;
    if (!cl || typeof cl !== 'object' || !bo || typeof bo !== 'object' || typeof bo.movedAt !== 'number') return null;
    s.cls = { id: classDef(cl.id) ? cl.id : null, spent: {}, changeDay: typeof cl.changeDay === 'string' ? cl.changeDay : '' };
    if (s.cls.id) for (const n of classDef(s.cls.id).nodes) { const v = cl.spent && cl.spent[n.id]; if (int(v, 1) && v <= n.max) s.cls.spent[n.id] = v; }
    s.booster = { owner: bo.owner === 'hero' || allyDef(bo.owner) ? bo.owner : null, movedAt: bo.movedAt };
    const ev = d.event;
    if (!ev || typeof ev !== 'object' || typeof ev.week !== 'string' || !int(ev.points, 0) || !int(ev.lanterns, 0) || !Array.isArray(ev.ms) ||
        !Array.isArray(d.inbox) || !int(d.inboxSeq, 1)) return null;
    s.event = newEventState(ev.week, CONFIG.events.list.some(x => x.id === ev.id) ? ev.id : null);
    s.event.points = ev.points; s.event.lanterns = ev.lanterns;
    for (const i of ev.ms) if (int(i, 0)) s.event.ms[i] = true;
    s.event.bought = nums(ev.bought);
    for (const it of d.inbox) if (it && int(it.id, 1) && typeof it.title === 'string') s.inbox.push({ id: it.id, title: it.title, reward: nums(it.reward) });
    const TT = CONFIG.ritual.milestones, AT = allTitles();
    if (!Array.isArray(d.titles) || !Array.isArray(d.skins)) return null;
    s.titles = d.titles.filter(t => AT.some(m => m.title === t)); s.skins = d.skins.filter(k => TT.some(m => m.skin === k));
    // титулы за уже закрытые достижения (сохранения до 0.53)
    for (const a of CONFIG.achievements.list) if (a.title && s.ach[a.id] === a.goals.length && !s.titles.includes(a.title.name)) s.titles.push(a.title.name);
    s.title = s.titles.includes(d.title) ? d.title : (s.titles[0] || null);
    if (!Array.isArray(d.favs) || !Array.isArray(d.presets) || !Array.isArray(d.trophies)) return null;
    { const all = allTrophies(); s.trophies = [...new Set(d.trophies.filter(k => all.includes(k)))]; }
    if (!d.echo || typeof d.echo.week !== 'string' || !int(d.echo.used, 0)) return null;
    s.echo = { week: d.echo.week, used: d.echo.used, won: !!d.echo.won };
    const cu = d.curse;
    s.curse = cu && int(cu.floor, 1) && CONFIG.curse.mods.some(m => m.id === cu.mod) ? { floor: cu.floor, mod: cu.mod, on: !!cu.on } : null;
    if (!d.potions || typeof d.potions !== 'object') return null;
    if (!int(d.towerMs, 0)) return null; s.towerMs = d.towerMs;
    if (!d.bestiary || typeof d.bestiary !== 'object' || !Array.isArray(d.diaryPages)) return null;
    s.bestiary = {}; for (const k in d.bestiary) { const v = d.bestiary[k]; if (int(v, 1)) s.bestiary[k] = v; }
    s.diaryPages = d.diaryPages.filter(id => CONFIG.biomes.some(b => b.id === id));
    if (!Array.isArray(d.secrets)) return null;
    s.secrets = d.secrets.filter(x => x && int(x.floor, 1) && isSecretFloor(x.floor)).map(x => ({ floor: x.floor, done: !!x.done }));
    if (!int(d.prestigeClaimed, 0)) return null;
    s.megaSoulsFloor = +d.megaSoulsFloor > 0 ? +d.megaSoulsFloor : 0;
    { const ok = id => id === null || !!(artDef(id) && !artDef(id).special); const sh = d.artShop || {};
      s.artShop = { soul: Array.isArray(sh.soul) ? sh.soul.filter(ok).slice(0, CONFIG.artShop.slots) : [], blood: Array.isArray(sh.blood) ? sh.blood.filter(ok).slice(0, CONFIG.artShop.slots) : [] }; }
    s.goldHired = Array.isArray(d.goldHired) ? d.goldHired.filter(id => allyDef(id)) : [];
    s.cageFreed = d.cageFreed != null ? !!d.cageFreed : Math.max(+d.maxFloor || 0, +d.bestFloor || 0) > (CONFIG.cage ? CONFIG.cage.floor : 0);   // старые сохранения дальше 3 этажа — уже свободен
    s.prestigeClaimed = d.prestigeClaimed; s.frame = CONFIG.prestige.frames.includes(d.frame) ? d.frame : null;
    s.potions = {}; for (const p of CONFIG.alchemy.potions) { const v = +d.potions[p.id]; if (v > 0 && isFinite(v)) s.potions[p.id] = Math.min(v, CONFIG.alchemy.maxSec); }
    s.favs = d.favs.filter(id => allyDef(id));
    s.presets = [0, 1, 2].map(i => { const p = d.presets[i]; return p && Array.isArray(p.squad) ? { squad: p.squad.filter(id => allyDef(id)).slice(0, CONFIG.squadSize), pet: typeof p.pet === 'string' ? p.pet : null } : null; });
    s.inboxSeq = Math.max(d.inboxSeq, ...s.inbox.map(x => x.id + 1));
    const se = d.season;
    if (!se || typeof se !== 'object' || !Number.isInteger(se.n) || !int(se.xp, 0) || !int(se.tokens, 0) || !int(se.trail, 0) ||
        se.trail > CONFIG.season.trail.length || !Array.isArray(se.free) || !Array.isArray(se.paid)) return null;
    s.season = newSeason(se.n);
    Object.assign(s.season, { xp: se.xp, tokens: se.tokens, premium: !!se.premium, trail: se.trail,
      trailBase: se.trailBase ? nums(se.trailBase) : null, catchupDay: typeof se.catchupDay === 'string' ? se.catchupDay : '' });
    for (const l of se.free) if (int(l, 1)) s.season.free[l] = true;
    for (const l of se.paid) if (int(l, 1)) s.season.paid[l] = true;
    const pv = d.pve;
    if (!pv || typeof pv !== 'object' || typeof pv.day !== 'string' || !pv.used || typeof pv.used !== 'object' || !int(pv.endlessBest, 0)) return null;
    s.pve = { day: pv.day, used: {}, endlessBest: pv.endlessBest };
    const tri = d.trial;
    if (!tri || typeof tri.week !== 'string' || !int(tri.weekBest, 0) || !int(tri.best, 0)) return null;
    s.trial = { week: tri.week, weekBest: tri.weekBest, best: tri.best };
    for (const k in pv.used) if (int(pv.used[k], 0)) s.pve.used[k] = pv.used[k];
    if (!d.tree || typeof d.tree !== 'object') return null;
    if (d.tree.crack != null && d.tree.grip == null) { d.tree.grip = d.tree.crack; delete d.tree.crack; }   // 0.145
    for (const n of TREE) {
      const lv = d.tree[n.id];
      if (lv === undefined) continue;
      if (!int(lv, 1) || lv > n.max) return null;
      s.tree[n.id] = lv;
    }
    for (const id of d.locks) if (allyDef(id)) s.locks[id] = true;
    for (const id of d.discovered) if (allyDef(id)) s.discovered[id] = true;
    for (const a of CONFIG.allies) if (!s.heroes[a.id].unlocked) s.allies[a.id].level = 0;   // нанять можно только открытых
    s.savedAt = typeof d.savedAt === 'number' && isFinite(d.savedAt) ? d.savedAt : null;
    if ((CONFIG.disabled || []).includes('mail') && s.inbox.length) { for (const it of s.inbox) grant(s, it.reward); s.inbox = []; }   // 0.121: застрявшая почта — сразу игроку
    spawn(s);                                     // враг появляется с полным HP
    return s;
  }

