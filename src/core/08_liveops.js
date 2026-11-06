  // ==== src/core/08_liveops.js — Лайв: эхо, события, центр наград, задания, вход, путешествие во времени, сезон, достижения, коллекция ====
  // ---------- «Эхо Башни» (0.58) ----------
  // Неделя — по ключу недели события (s.event.week). Биом — один из пройденных, модификатор — по номеру недели.
  function echoSync(s) { const wk = (s.event && s.event.week) || ''; if (s.echo.week !== wk) s.echo = { week: wk, used: 0, won: false }; }
  function echoInfo(s) {
    const E = CONFIG.pve.echo;
    if (s.bestFloor < E.minFloor || !unlockedAt(s, 'echo')) return null;
    echoSync(s);
    const n = s.echo.week ? Math.max(0, weekNum(s.echo.week)) : 0;
    const cleared = Math.min(CONFIG.biomes.length, Math.floor(s.bestFloor / CONFIG.biomeFloors));
    const biome = CONFIG.biomes[n % cleared], mod = E.mods[n % E.mods.length];
    return { biome, mod, floor: Math.max(1, Math.floor(s.bestFloor * E.floorPct)), time: mod.time || E.time,
             left: Math.max(0, E.attempts - s.echo.used), won: s.echo.won };
  }
  // ---------- еженедельные события ----------
  function weekNum(weekKey) { return Math.floor((dayNum(weekKey.replace(/^w/, '')) - dayNum(CONFIG.season.epoch)) / 7); }
  function eventFor(weekKey) { const L = CONFIG.events.list, n = weekNum(weekKey); return L[((n % L.length) + L.length) % L.length]; }
  function currentEvent(s) { return s.event && CONFIG.events.list.find(x => x.id === s.event.id) || null; }
  function newEventState(week, id) { return { week, id, points: 0, lanterns: 0, ms: {}, bought: {} }; }
  // Новая неделя — новое событие. Незабранные вехи уже лежат в «Наградах», фонари сгорают
  function eventReset(s, weekKey) {
    if (s.event.week !== weekKey) s.event = newEventState(weekKey, eventFor(weekKey).id);
    return currentEvent(s);
  }
  function addEventPoints(s, n) {
    if (!s.event || !s.event.id || !n) return;
    s.event.points += n;
    CONFIG.events.milestones.forEach((m, i) => {
      if (s.event.points >= m.at && !s.event.ms[i]) {
        s.event.ms[i] = true;
        inboxAdd(s, 'Событие «' + currentEvent(s).name + '»: ' + m.at + ' очков', m.reward);
      }
    });
  }
  function eventDungeonReward(tier) { const E = CONFIG.events; return E.dungeonLanterns + E.lanternsPerTier * tier; }
  function shopLeft(s, id) { const it = CONFIG.events.shop.find(x => x.id === id); return it ? it.limit - (s.event.bought[id] | 0) : 0; }
  function buyEventItem(s, id) {
    const it = CONFIG.events.shop.find(x => x.id === id);
    if (!it || !currentEvent(s) || shopLeft(s, id) <= 0 || s.event.lanterns < it.cost) return null;
    s.event.lanterns -= it.cost; s.event.bought[id] = (s.event.bought[id] | 0) + 1;
    grant(s, it.reward);
    return it.reward;
  }
  function modeRule(s) { if (s.mode) return s.mode.rule || null; const cm = curseMod(s); return cm && cm.rule || null; }

  // ---------- центр наград ----------
  function inboxAdd(s, title, reward) { s.inbox.push({ id: s.inboxSeq++, title, reward: { ...reward } }); }
  function claimInbox(s, id) {
    const i = s.inbox.findIndex(x => x.id === id);
    if (i < 0) return null;
    const it = s.inbox.splice(i, 1)[0];
    grantSeason(s, it.reward);
    return it.reward;
  }
  function claimInboxAll(s) {
    if (!s.inbox.length) return null;
    const sum = {}, n = s.inbox.length;
    for (const it of s.inbox) { grantSeason(s, it.reward); for (const k in it.reward) sum[k] = (sum[k] || 0) + it.reward[k]; }
    s.inbox = [];
    return { count: n, reward: sum };
  }

  // ---------- задания ----------
  function allQuests() { const Q = CONFIG.quests; return [...Q.daily.map(q => ({ ...q, period: 'daily' })), ...Q.weekly.map(q => ({ ...q, period: 'weekly' })), ...Q.intro.map(q => ({ ...q, period: 'intro' })), ...Q.ritual.map(q => ({ ...q, period: 'ritual' }))]; }
  const QUESTS = allQuests();
  function questDef(id) { return QUESTS.find(q => q.id === id); }
  // Новый день / неделя: запоминаем счётчики на начало периода, отметки «забрано» сбрасываются
  function questsReset(s, day, week) {
    const Q = s.quests;
    if (day && Q.day !== day) {
      Q.day = day; Q.dayBase = { ...s.counters }; for (const q of CONFIG.quests.daily) delete Q.claimed[q.id]; Q.chests = {};
      if (!(CONFIG.disabled || []).includes('dailyGift')) inboxAdd(s, 'Ежедневный подарок', CONFIG.dailyGift);
    }
    if (week && Q.week !== week) { Q.week = week; Q.weekBase = { ...s.counters }; for (const q of CONFIG.quests.weekly) delete Q.claimed[q.id]; }
  }
  function questProgress(s, id) {
    const q = questDef(id), Q = s.quests;
    let v;
    if (q.key === 'allDaily') v = CONFIG.quests.daily.filter(x => x.id !== q.id && questDone(s, x.id)).length;
    else if (q.value === 'floor') v = s.bestFloor;
    else if (q.value === 'hired') v = CONFIG.allies.filter(a => inSquad(s, a.id)).length;
    else if (q.value === 'runFloor') v = s.maxFloor;
    else if (q.value === 'runHire') v = CONFIG.allies.filter(a => s.allies[a.id].level > 0).length;
    else {
      const total = s.counters[q.key] || 0;
      v = q.period === 'daily' ? total - (Q.dayBase[q.key] || 0) : q.period === 'weekly' ? total - (Q.weekBase[q.key] || 0)
        : q.period === 'ritual' ? total - (Q.runBase[q.key] || 0) : total;
    }
    return Math.min(q.goal, Math.max(0, v));
  }
  function questDone(s, id) { return questProgress(s, id) >= questDef(id).goal; }
  function questClaimable(s, id) { return questDone(s, id) && !s.quests.claimed[id]; }
  function grant(s, r) {
    if (r.souls) { s.souls = B.add(s.souls, r.souls); s.stats.soulsEarned = B.add(s.stats.soulsEarned, r.souls); }
    if (r.tickets) s.tickets += r.tickets;
    if (r.crystals) s.crystals = (s.crystals | 0) + r.crystals;   // 0.116: 💎 из заданий, входа, достижений
    if (r.essence) s.essence += r.essence;
    if (r.shard) s.materials.shard += r.shard;
    if (r.heart) s.materials.shard += heartShards(r.heart);   // 0.51: сердца слиты в осколки
  }
  function claimQuest(s, id) {
    if (!questDef(id) || !questClaimable(s, id)) return null;
    s.quests.claimed[id] = true;
    const r = questDef(id).reward;
    grant(s, r);
    s.season.xp += CONFIG.season.questXp[questDef(id).period] || 0;
    return r;
  }
  // «Забрать всё»: суммарная награда; «все задания дня» проверяется последним
  function claimAll(s) {
    const sum = {};
    let n = 0;
    for (const pass of [0, 1]) for (const q of QUESTS) {
      if ((q.key === 'allDaily') !== !!pass) continue;
      const r = claimQuest(s, q.id);
      if (r) { n++; for (const k in r) sum[k] = (sum[k] || 0) + r[k]; }
    }
    return n ? { count: n, reward: sum } : null;
  }
  // ---------- сундуки заданий ----------
  function dailyClaimedCount(s) { return CONFIG.quests.daily.filter(q => s.quests.claimed[q.id]).length; }
  function questChestReady(s, i) { const c = CONFIG.questChests[i]; return !!c && !s.quests.chests[i] && dailyClaimedCount(s) >= c.need; }
  function openQuestChest(s, i) {
    if (!questChestReady(s, i)) return null;
    s.quests.chests[i] = true;
    const r = CONFIG.questChests[i].reward; grant(s, r); return r;
  }
  function questChestsReady(s) { return CONFIG.questChests.filter((c, i) => questChestReady(s, i)).length; }

  // ---------- бонус за вход ----------
  // Номер дня (1…30), который можно забрать сейчас, или 0 — сегодня уже забрано
  function loginDayIndex(s) { return s.login.n % CONFIG.login.days.length; }
  function loginAvailable(s, dayKey) { return s.login.day !== dayKey; }
  function claimLogin(s, dayKey) {
    if (!loginAvailable(s, dayKey)) return null;
    const i = loginDayIndex(s), r = CONFIG.login.days[i];
    s.login.day = dayKey; s.login.n++;
    grant(s, r);
    return { day: i + 1, reward: r };
  }

  // ---------- путешествие во времени ----------
  function travelReset(s, dayKey) { if (s.travel.day !== dayKey) { s.travel.day = dayKey; s.travel.used = 0; } }
  // Цена следующего путешествия: 0 — бесплатно, N — билетов, null — на сегодня всё
  function travelCost(s, dayKey) {
    travelReset(s, dayKey);
    const T = CONFIG.timeTravel;
    if (s.travel.used < T.freePerDay) return 0;
    if (s.travel.used < T.freePerDay + T.paidPerDay) return T.ticketCost;
    return null;
  }
  function timeTravel(s, dayKey) {
    const cost = travelCost(s, dayKey);
    if (cost == null || s.tickets < cost || !B.gt(offlineDps(s), 0)) return null;   // без авто-урона путешествие бесполезно — попытку не тратим
    s.tickets -= cost; s.travel.used++;
    return offlineProgress(s, CONFIG.timeTravel.hours * 3600);
  }

  // ---------- сезон и боевой пропуск ----------
  function dayNum(dayKey) { const [y, m, d] = dayKey.split('-').map(Number); return Math.round(Date.UTC(y, m - 1, d) / 864e5); }
  function seasonInfo(dayKey) {
    const S = CONFIG.season, d = dayNum(dayKey) - dayNum(S.epoch);
    const n = Math.floor(d / S.days) + 1, day = ((d % S.days) + S.days) % S.days + 1;
    const i = ((n - 1) % S.names.length + S.names.length) % S.names.length;
    return { n, day, daysLeft: S.days - day, name: S.names[i], hero: S.heroes[((n - 1) % S.heroes.length + S.heroes.length) % S.heroes.length] };
  }
  function newSeason(n) { return { n, xp: 0, tokens: 0, premium: false, free: {}, paid: {}, trail: 0, trailBase: null, catchupDay: '' }; }
  // Новый сезон: пропуск, тропа и жетоны начинаются заново; герои и их копии остаются навсегда
  function seasonReset(s, dayKey) {
    const info = seasonInfo(dayKey);
    if (s.season.n !== info.n) {
      // незабранные награды пропуска прошлого сезона — автоматически в «Награды»
      if (s.season.n > 0) {
        const sum = {}; let n = 0;
        for (let l = 1; l <= passLevel(s); l++) for (const t of ['free', 'paid']) {
          if ((t === 'paid' && !s.season.premium) || (t === 'paid' ? s.season.paid[l] : s.season.free[l])) continue;
          const r = passReward(l, t); delete r.tokens; n++;
          for (const k in r) sum[k] = (sum[k] || 0) + r[k];
        }
        if (n) inboxAdd(s, 'Незабранное за сезон ' + s.season.n + ' (' + n + ' наград)', sum);
      }
      s.season = newSeason(info.n);
    }
    if (!s.season.trailBase) s.season.trailBase = { ...s.counters };
    return info;
  }
  function passLevel(s) { const S = CONFIG.season; return Math.min(S.passLevels, Math.floor(s.season.xp / S.xpPerLevel)); }
  function passReward(level, track) {
    const S = CONFIG.season, ms = level % S.milestoneEvery === 0;
    const base = track === 'paid' ? S.paid : S.free, extra = ms ? (track === 'paid' ? S.milestonePaid : S.milestoneFree) : {};
    const r = { ...base };
    for (const k in extra) r[k] = (r[k] || 0) + extra[k];
    return r;
  }
  function grantSeason(s, r) { grant(s, r); if (r.tokens) s.season.tokens += r.tokens; }
  function claimPass(s, level, track) {
    const ss = s.season;
    if (!Number.isInteger(level) || level < 1 || level > passLevel(s)) return null;
    if (track === 'paid' && !ss.premium) return null;
    const box = track === 'paid' ? ss.paid : ss.free;
    if (box[level]) return null;
    box[level] = true;
    const r = passReward(level, track);
    grantSeason(s, r);
    return r;
  }
  function claimPassAll(s) {
    const sum = {}; let n = 0;
    for (let l = 1; l <= passLevel(s); l++) for (const t of ['free', 'paid']) {
      const r = claimPass(s, l, t);
      if (r) { n++; for (const k in r) sum[k] = (sum[k] || 0) + r[k]; }
    }
    return n ? { count: n, reward: sum } : null;
  }
  // Премиум-дорожка: в прототипе включается бесплатно, для проверки (оплаты нет)
  function setPremium(s, on) { s.season.premium = !!on; }
  // Догон: ожидаемый уровень = доля прошедших дней сезона × все уровни
  function expectedPassLevel(dayKey) { const S = CONFIG.season, i = seasonInfo(dayKey); return Math.floor(S.passLevels * i.day / S.days); }
  function catchupAvailable(s, dayKey) { return s.season.catchupDay !== dayKey && passLevel(s) < expectedPassLevel(dayKey) && passLevel(s) < CONFIG.season.passLevels; }
  function useCatchup(s, dayKey) {
    if (!catchupAvailable(s, dayKey)) return false;
    s.season.catchupDay = dayKey; s.season.xp += CONFIG.season.catchupXp;
    return true;
  }
  // Тропа сезона: одно текущее задание, прогресс с момента, когда оно стало текущим
  function trailStep(s) { return CONFIG.season.trail[s.season.trail] || null; }
  function trailProgress(s) {
    const t = trailStep(s);
    if (!t) return 0;
    return Math.min(t.goal, Math.max(0, (s.counters[t.key] || 0) - ((s.season.trailBase || {})[t.key] || 0)));
  }
  function claimTrail(s, dayKey) {
    const S = CONFIG.season, t = trailStep(s);
    if (!t || trailProgress(s) < t.goal) return null;
    s.season.trail++; s.season.trailBase = { ...s.counters };
    s.season.tokens += S.trailTokens; s.season.xp += S.trailXp;
    const r = { tokens: S.trailTokens, xp: S.trailXp };
    if (s.season.trail === S.trail.length) {             // финал тропы — сезонный герой бесплатно
      const id = seasonInfo(dayKey).hero, h = s.heroes[id];
      if (h.unlocked) h.copies++; else h.unlocked = true;
      r.hero = id;
    }
    return r;
  }
  // Гарантированный обмен жетонов на сезонного героя (или его копию)
  function seasonHeroCost(s, dayKey) { const id = seasonInfo(dayKey).hero; return s.heroes[id].unlocked ? CONFIG.season.copyCost : CONFIG.season.heroCost; }
  function buySeasonHero(s, dayKey) {
    const id = seasonInfo(dayKey).hero, cost = seasonHeroCost(s, dayKey);
    if (s.season.tokens < cost) return null;
    s.season.tokens -= cost;
    const h = s.heroes[id];
    if (h.unlocked) h.copies++; else h.unlocked = true;
    return id;
  }

  // ---------- достижения ----------
  function achDef(id) { return CONFIG.achievements.list.find(a => a.id === id); }
  function achValue(s, a) {
    switch (a.metric) {
      case 'floor': return s.bestFloor;
      case 'heroes': return CONFIG.allies.filter(x => s.heroes[x.id].unlocked).length;
      case 'endless': return s.pve.endlessBest;
      case 'totems': return totemCount(s);
      case 'ritual': return s.rituals;
      default: return s.counters[a.metric] || 0;
    }
  }
  function achTier(s, id) { return s.ach[id] | 0; }                  // сколько ступеней уже забрано
  function achClaimable(s, id) { const a = achDef(id), t = achTier(s, id); return t < a.goals.length && achValue(s, a) >= a.goals[t]; }
  function achPoints(s) { let n = 0; for (const id in s.ach) n += s.ach[id]; return n; }
  // ---------- коллекция героев ----------
  function collectionSets(s) {
    return CONFIG.rarities.filter(r => {
      const pool = CONFIG.allies.filter(a => a.rarity === r && !a.seasonal);
      return pool.length && pool.every(a => s.heroes[a.id].unlocked);
    });
  }
  function collectionMult(s) {
    const K = CONFIG.collection;
    let n = 0, stars = 0;
    for (const a of CONFIG.allies) if (s.heroes[a.id].unlocked) { if (!a.starter) n++; stars += s.heroes[a.id].stars; }   // стартовый отряд дан даром
    return 1 + K.perHero * n + K.perStar * stars;
  }
  function collectionAllyMult(s) { return 1 + collectionSets(s).reduce((t, r) => t + CONFIG.collection.setAlly * (CONFIG.rarities.indexOf(r) + 1), 0); }
  function achMult(s) { return 1 + CONFIG.achievements.dmgPerPoint * achPoints(s); }
  function claimAch(s, id) {
    const a = achDef(id);
    if (!a || !achClaimable(s, id)) return null;
    s.ach[id] = achTier(s, id) + 1;
    grant(s, a.reward);
    if (a.title && s.ach[id] === a.goals.length && !s.titles.includes(a.title.name)) { s.titles.push(a.title.name); if (!s.title) s.title = a.title.name; }
    return a.reward;
  }
  function claimAllAch(s) {
    const sum = {}; let n = 0;
    for (const a of CONFIG.achievements.list) for (;;) { const r = claimAch(s, a.id); if (!r) break; n++; for (const k in r) sum[k] = B.add(sum[k] || 0, r[k]); }
    return n ? { count: n, reward: sum } : null;
  }
  function achClaimableCount(s) { return CONFIG.achievements.list.filter(a => achClaimable(s, a.id)).length; }

  function claimableCount(s) { return QUESTS.filter(q => questClaimable(s, q.id)).length; }

