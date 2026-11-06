  // ==== src/core/07_meta.js — Прогрессия: перенос прокачки, престиж, тайные комнаты, дневник, вехи, проклятия, доп. PvE ====
  // ---------- перенос прокачки (0.65) ----------
  function rankCapForEvo(evo) {
    const R = CONFIG.ranks; let cap = maxSteps();
    for (const k of Object.keys(R.evoFor).map(Number).sort((a, b) => a - b)) if (R.evoFor[k] > evo) { cap = k * R.subs - 1; break; }
    return cap;
  }
  function transferPreview(s, from, to) {
    const A = allyDef(from), T = allyDef(to), X = CONFIG.transfer;
    if (!A || !T || from === to) return null;
    const hf = s.heroes[from], ht = s.heroes[to];
    if (!hf.unlocked || !ht.unlocked) return null;
    if (CONFIG.rarities.indexOf(T.rarity) < CONFIG.rarities.indexOf(A.rarity)) return null;
    const stars = Math.max(ht.stars, Math.min(CONFIG.maxStars, Math.floor(hf.stars * X.keep)));
    const rank = Math.max(ht.rank, Math.min(rankCapForEvo(ht.evo), Math.floor(hf.rank * X.keep)));
    if (stars === ht.stars && rank === ht.rank) return null;      // нечего переносить
    return { stars, rank, cost: X.essence * (CONFIG.rarities.indexOf(T.rarity) + 1) };
  }
  function transferProgress(s, from, to) {
    const p = transferPreview(s, from, to);
    if (!p || s.essence < p.cost) return null;
    s.essence -= p.cost;
    const hf = s.heroes[from], ht = s.heroes[to];
    ht.stars = p.stars; ht.rank = p.rank;
    hf.stars = 0; hf.rank = 0;
    if (s.allies[from].level > allyCap(s, from)) s.allies[from].level = allyCap(s, from);
    cnt(s, 'transfer');
    return p;
  }
  // ---------- престиж аккаунта (0.64) ----------
  function prestigeXp(s) {
    const X = CONFIG.prestige.xp, heroes = CONFIG.allies.filter(a => s.heroes[a.id].unlocked);
    return s.bestFloor * X.floor + s.rituals * X.ritual + heroes.length * X.hero + heroes.reduce((t, a) => t + s.heroes[a.id].stars, 0) * X.star +
      achPoints(s) * X.ach + s.trophies.length * X.trophy + s.diaryPages.length * X.page + s.titles.length * X.title + s.secrets.filter(x => x.done).length * X.secret;
  }
  function prestigeNeed(L) { const P = CONFIG.prestige; return Math.ceil(P.base * Math.pow(L, P.power)); }
  function prestigeLevel(s) { const xp = prestigeXp(s); let L = Math.floor(Math.pow(xp / CONFIG.prestige.base, 1 / CONFIG.prestige.power)); while (prestigeNeed(L + 1) <= xp) L++; while (L > 0 && prestigeNeed(L) > xp) L--; return L; }
  function prestigeFrames(s) { const P = CONFIG.prestige, n = Math.min(P.frames.length, Math.floor(prestigeLevel(s) / P.frameEvery)); return P.frames.slice(0, n); }
  function claimPrestige(s) {
    const L = prestigeLevel(s), n = L - s.prestigeClaimed;
    if (n <= 0) return null;
    const R = CONFIG.prestige.reward, r = {}; for (const k in R) r[k] = R[k] * n;
    grant(s, r); s.prestigeClaimed = L;
    const fr = prestigeFrames(s); if (!s.frame && fr.length) s.frame = fr[fr.length - 1];
    return { levels: n, reward: r };
  }
  function setFrame(s, f) { if (f !== null && !prestigeFrames(s).includes(f)) return false; s.frame = f; return true; }
  // ---------- скрытые комнаты (0.63) ----------
  function secretFloor(block) { const E = CONFIG.secret.every; return block * E + 1 + Math.floor(hash01(block + 1, 4219, 77) * (E - 1)); }
  function isSecretFloor(f) { return secretFloor(Math.floor((f - 1) / CONFIG.secret.every)) === f; }
  function secretFind(s, f, events) {
    if (!unlockedAt(s, 'secret')) return null;
    if (!isSecretFloor(f) || s.secrets.some(x => x.floor === f)) return null;
    const x = { floor: f, done: false }; s.secrets.push(x);
    if (events) events.push({ type: 'secretFound', floor: f });
    return x;
  }
  function secretReward(s, f) { const R = CONFIG.secret.reward; return { tickets: R.tickets, essence: R.essence, shard: Math.ceil(shardsForBoss(f) * R.shardMult * shardMult(s)) }; }
  // ---------- дневник призванного (0.62) ----------
  function diaryNames(b) { return [...b.enemies, ...b.bosses, b.final]; }
  function diaryKill(s, name, floor, events) {
    const n = (s.bestiary[name] | 0) + 1, D = CONFIG.diary;
    s.bestiary[name] = n;
    if (n === 1 && events) events.push({ type: 'diaryNew', name });
    if (n === D.master) { grant(s, D.masterReward); if (events) events.push({ type: 'diaryMaster', name }); }
    const b = biomeOf(floor);
    if (n === 1 && !s.diaryPages.includes(b.id) && diaryNames(b).every(x => s.bestiary[x])) {
      s.diaryPages.push(b.id);
      inboxAdd(s, 'Дневник: страница «' + b.name + '» заполнена', D.page);
      if (events) events.push({ type: 'diaryPage', name: b.name });
    }
  }
  // Лор героя открывается по звёздам: 0 — раса и класс, loreStars[1] — цитата, loreStars[2] — история
  function loreLevel(s, id) { const h = s.heroes[id]; if (!h || !h.unlocked) return -1; return CONFIG.diary.loreStars.filter(x => h.stars >= x).length - 1; }
  // ---------- вехи Башни (0.61) ----------
  function towerMsList(s, upTo) {           // вехи (at) в промежутке (s.towerMs, upTo]
    const T = CONFIG.towerMs, last = T.list[T.list.length - 1].at, out = T.list.filter(m => m.at > s.towerMs && m.at <= upTo);
    for (let at = last + T.every; at <= upTo; at += T.every) if (at > s.towerMs) out.push({ at, reward: T.after });
    return out;
  }
  function nextTowerMs(s) { const T = CONFIG.towerMs, m = T.list.find(x => x.at > s.towerMs); if (m) return m; const last = T.list[T.list.length - 1].at; return { at: last + T.every * (Math.floor(Math.max(0, s.towerMs - last) / T.every) + 1), reward: T.after }; }
  function towerMilestones(s, events) {
    const best = Math.max(s.bestFloor, s.maxFloor), got = [];
    for (const m of towerMsList(s, best)) {
      const what = [];
      if (m.hero) { const h = s.heroes[m.hero]; if (h.unlocked) { h.copies += m.copies; what.push('копии ' + allyDef(m.hero).name + ' ×' + m.copies); } else { h.unlocked = true; what.push('герой ' + allyDef(m.hero).name); } }
      if (m.pet) { if (petForm(s, m.pet)) { s.pets.frags[m.pet] = petFrags(s, m.pet) + m.frags; what.push('фрагменты ×' + m.frags); } else { grantPet(s, m.pet, events); what.push('питомец ' + petDef(m.pet).name); } }
      if (m.art) { s.artifacts[m.art] = artLevel(s, m.art) + m.levels; what.push(artDef(m.art).name + ' +' + m.levels + ' ур.'); }
      inboxAdd(s, 'Веха Башни: этаж ' + m.at + (what.length ? ' — ' + what.join(', ') : ''), m.reward);
      s.towerMs = m.at; got.push(m.at);
      if (events) events.push({ type: 'towerMs', at: m.at, what: what.join(', ') });
    }
    return got;
  }
  // ---------- проклятые этажи (0.59) ----------
  function curseMod(s) { const c = s.curse; return c && c.on && c.floor === s.floor && !s.mode ? CONFIG.curse.mods.find(m => m.id === c.mod) : null; }
  function curseOffer(s, events, offline) {
    const K = CONFIG.curse, f = s.floor;
    if (offline || s.mode || !unlockedAt(s, 'curse') || f < K.minFloor || f <= (s.bestCleared | 0) || hash01(f, 977, 31) >= K.chance) return null;
    const mod = K.mods[Math.floor(hash01(f, 131, 7) * K.mods.length) % K.mods.length];
    s.curse = { floor: f, mod: mod.id, on: false };
    if (events) events.push({ type: 'curseOffer', floor: f, mod });
    return s.curse;
  }
  function acceptCurse(s) {
    const c = s.curse;
    if (!c || c.on || c.floor !== s.floor || s.mode) return false;
    c.on = true; s.enemyIndex = 1; spawn(s);                         // этаж начинается заново под проклятием
    return true;
  }
  function declineCurse(s) { if (!s.curse || s.curse.on) return false; s.curse = null; return true; }
  // ---------- доп. PvE ----------
  // Сброс ежедневных попыток: dayKey — дата устройства 'ГГГГ-ММ-ДД' (передаёт интерфейс)
  function dailyReset(s, dayKey) {
    if (s.pve.day !== dayKey) { s.pve.day = dayKey; s.pve.used = {}; }
  }
  function attemptsLeft(s, key) {
    const P = CONFIG.pve, max = key === 'endless' ? P.endless.attempts : key === 'trial' ? P.trial.attempts : key === 'personal' ? P.personal.attempts : key === 'event' ? CONFIG.events.attempts : P.dailyAttempts;
    return Math.max(0, max - (s.pve.used[key] | 0));
  }
  function maxDungeonTier(s) { return Math.max(1, Math.floor(s.bestFloor / CONFIG.pve.tierFloors)); }
  function dungeonDef(id) { return CONFIG.pve.dungeons.find(d => d.id === id); }
  // Фиксированная награда подземелья на уровне tier
  function dungeonReward(s, id, tier) {
    const P = CONFIG.pve, f = tier * P.tierFloors, d = dungeonDef(id);
    if (d.reward === 'gold') return { gold: B.ceil(B.mul(killGold(f, true), P.vaultGold * goldMult(s))) };
    if (d.reward === 'shard') return { shard: Math.ceil(shardsForBoss(f) * P.mineShards * shardMult(s)) };
    let rt = Math.min(CONFIG.rarities.length - 1, Math.floor(tier / P.forgeTierEvery));
    while (rt > 0 && !tierOpen(s, rt)) rt--;               // SS/SSS/GOD — только после порогов этажей
    return { runeTier: rt };
  }
  // Личные боссы — финальные боссы биомов, чей тотем уже получен
  function personalBosses(s) {
    const out = [];
    CONFIG.biomes.forEach((b, i) => { if (s.totems[b.id]) out.push({ id: b.id, name: b.final, floor: (i + 1) * CONFIG.biomeFloors, biome: b.name }); });
    return out;
  }
  function personalReward(s, floor, diff) {
    const D = CONFIG.pve.personal.diffs.find(x => x.id === diff);
    return { heart: 0, shard: Math.ceil(shardsForBoss(floor) * D.shards * shardMult(s)) + heartShards(D.hearts) };
  }
  // Вход в режим: тратит попытку, тот же бой, своя очередь врагов
  function enterMode(s, kind, opts, dayKey) {
    if (s.mode) return null;
    if (dayKey) dailyReset(s, dayKey);
    const P = CONFIG.pve;
    let m;
    if (kind === 'dungeon') {
      const d = dungeonDef(opts.id), tier = opts.tier | 0;
      if (!d || tier < 1 || tier > maxDungeonTier(s) || !attemptsLeft(s, d.id)) return null;
      m = { kind, id: d.id, name: d.name, tier, step: 1, total: P.dungeonEnemies, timeLeft: P.dungeonTime, timeMax: P.dungeonTime };
      s.pve.used[d.id] = (s.pve.used[d.id] | 0) + 1;
    } else if (kind === 'event') {
      const e = currentEvent(s), tier = opts.tier | 0;
      if (!e || tier < 1 || tier > maxDungeonTier(s) || !attemptsLeft(s, 'event')) return null;
      const t = e.dungeon.rule === 'fast' ? CONFIG.events.fastTime : P.dungeonTime;
      m = { kind, id: 'event', name: e.dungeon.name, rule: e.dungeon.rule, tier, step: 1, total: P.dungeonEnemies, timeLeft: t, timeMax: t };
      s.pve.used.event = (s.pve.used.event | 0) + 1;
    } else if (kind === 'endless') {
      if (!attemptsLeft(s, 'endless')) return null;
      m = { kind, id: 'endless', name: 'Бесконечное подземелье', step: 1, timeLeft: 0, timeMax: P.endless.bossTime, essence: 0, tickets: 0 };
      s.pve.used.endless = (s.pve.used.endless | 0) + 1;
    } else if (kind === 'trial') {
      if (!attemptsLeft(s, 'trial')) return null;
      m = { kind, id: 'trial', name: 'Испытательная башня', rule: 'trial', step: 1, timeLeft: P.trial.time, timeMax: P.trial.time };
      s.pve.used.trial = (s.pve.used.trial | 0) + 1;
    } else if (kind === 'echo') {
      const x = echoInfo(s);
      if (!x || x.left <= 0) return null;
      m = { kind, id: 'echo', name: 'Эхо: ' + x.biome.name + ' · ' + x.mod.name, rule: x.mod.rule || null, hpMult: x.mod.hp || 1,
            floor: x.floor, biome: x.biome.id, step: 1, total: P.echo.enemies, timeLeft: x.time, timeMax: x.time };
      s.echo.used++;
    } else if (kind === 'secret') {
      const x = s.secrets.find(y => y.floor === opts.floor && !y.done);
      if (!x) return null;
      const T = CONFIG.secret.time;
      m = { kind, id: 'secret', name: 'Скрытая комната · этаж ' + x.floor, floor: x.floor, step: 1, total: 1, timeLeft: T, timeMax: T };
    } else if (kind === 'personal') {
      const b = personalBosses(s).find(x => x.id === opts.id), D = P.personal.diffs.find(x => x.id === opts.diff);
      if (!b || !D || !attemptsLeft(s, 'personal')) return null;
      m = { kind, id: b.id, name: b.name, floor: b.floor, diff: D.id, diffName: D.name, step: 1, total: 1, timeLeft: P.personal.time, timeMax: P.personal.time };
      s.pve.used.personal = (s.pve.used.personal | 0) + 1;
    } else return null;
    s.mode = m;
    s.buffs = { team: 0, tap: 0, teamPower: 1, tapPower: 1 };
    spawn(s);
    return [{ type: 'modeStart', kind, name: m.name }, { type: 'spawn' }];
  }
  function spawnMode(s) {
    const m = s.mode, P = CONFIG.pve;
    let hp, isBoss, name;
    if (m.kind === 'dungeon' || m.kind === 'event') {
      const f = m.tier * P.tierFloors;
      isBoss = m.step === m.total;
      hp = enemyMaxHp(f, isBoss);
      name = isBoss ? 'Страж: ' + m.name : enemyName(f, m.step, false);
    } else if (m.kind === 'secret') {
      isBoss = true;
      hp = B.ceil(B.mul(enemyMaxHp(m.floor, true), CONFIG.secret.hp));
      name = 'Страж тайника';
    } else if (m.kind === 'echo') {
      const b = CONFIG.biomes.find(x => x.id === m.biome);
      isBoss = m.step === m.total;
      hp = B.ceil(B.mul(enemyMaxHp(m.floor, isBoss), m.hpMult));
      name = isBoss ? 'Эхо: ' + b.final : 'Эхо: ' + b.enemies[(m.step * 3) % b.enemies.length];
    } else if (m.kind === 'endless') {
      isBoss = m.step % P.endless.bossEvery === 0;
      hp = B.ceil(B.mul(enemyMaxHp(m.step, isBoss), P.endless.hpMult));
      name = (isBoss ? 'Контрольный босс · ' : '') + enemyName(m.step, m.step % 9 + 1, isBoss);
      if (isBoss) m.timeLeft = P.endless.bossTime;
    } else if (m.kind === 'trial') {
      isBoss = true;
      hp = P.trial.hpBase + P.trial.hpStep * (m.step - 1);
      name = 'Страж испытания ' + m.step;
      m.timeLeft = P.trial.time;
    } else {
      isBoss = true;
      hp = B.ceil(B.mul(enemyMaxHp(m.floor, true), P.personal.diffs.find(x => x.id === m.diff).hp));
      name = m.name + ' · ' + m.diffName;
    }
    const final = m.kind === 'personal';
    s.enemy = { hp, maxHp: hp, isBoss, final, alive: true, mark: 0, markPower: 1, rare: null, phase: 1, vuln: 0, name };
    s.bossTimeLeft = m.timeLeft;
    s.respawn = 0;
  }
  function modeKill(s, events) {
    const m = s.mode, P = CONFIG.pve;
    s.stats.kills++; cnt(s, 'kill');
    if (m.kind === 'endless') cnt(s, 'wave');
    events.push({ type: 'kill', gold: 0, boss: s.enemy.isBoss, mode: true });
    if (m.kind === 'trial') {                               // каждый страж — новые 15 с; рекорд считается по ходу
      trialRecord(s, m.step);
      m.step++;
      return;
    }
    if (m.kind === 'endless') {
      if (s.enemy.isBoss) {
        const e = P.endless.essenceBase + Math.floor(m.step / P.endless.essenceStep);
        m.essence += e; s.essence += e;
        if (m.step > s.pve.endlessBest) { m.tickets++; s.tickets++; }   // новый рекордный рубеж — билет
        const bone = rollBone(s, CONFIG.bones.dropEndless, m.step);
        if (bone) events.push({ type: 'bone', bone });
      }
      s.pve.endlessBest = Math.max(s.pve.endlessBest, m.step);
      m.step++;
      return;
    }
    if (m.step < m.total) { m.step++; return; }
    finishMode(s, true, events);
  }
  // Рекорды испытательной башни: неделя (по ключу недели события) и всё время
  function trialSync(s) { const wk = (s.event && s.event.week) || ''; if (s.trial.week !== wk) { s.trial.week = wk; s.trial.weekBest = 0; } }
  function trialRecord(s, n) { trialSync(s); s.trial.weekBest = Math.max(s.trial.weekBest, n); s.trial.best = Math.max(s.trial.best, n); }
  function modeTimer(s, dt, events) {
    const m = s.mode;
    if (m.kind === 'endless' && !s.enemy.isBoss) return;     // таймер только у контрольного босса
    m.timeLeft -= dt; s.bossTimeLeft = m.timeLeft;
    if (m.timeLeft <= 0) finishMode(s, m.kind === 'endless' || m.kind === 'trial', events);
  }
  // Итог режима: награда при победе (в бесконечном — уже начислена по ходу), возврат в Башню
  function finishMode(s, win, events) {
    s.critBuff = null;
    const m = s.mode, P = CONFIG.pve, res = { type: 'modeEnd', kind: m.kind, name: m.name, win, reward: {} };
    if (win && (m.kind === 'dungeon' || m.kind === 'event')) cnt(s, 'dungeon');
    if (win && m.kind === 'personal') cnt(s, 'personal');
    if (m.kind === 'dungeon' && win) {
      const r = dungeonReward(s, m.id, m.tier);
      if (r.gold) { s.gold = B.add(s.gold, r.gold); earnGold(s, r.gold); }
      if (r.shard) s.materials.shard += r.shard;
      if (r.runeTier != null) {
        const R = CONFIG.runes, k = R.kinds[Math.min(R.kinds.length - 1, Math.floor(s.rng() * R.kinds.length))];
        s.runes.push({ id: s.runeSeq++, type: k.id, tier: r.runeTier, lvl: 0 }); r.runeType = k.id;
      }
      res.reward = r;
    } else if (m.kind === 'event' && win) {
      const r = { lanterns: eventDungeonReward(m.tier) };
      s.event.lanterns += r.lanterns; addEventPoints(s, r.lanterns);
      res.reward = r;
    } else if (m.kind === 'personal' && win) {
      const r = personalReward(s, m.floor, m.diff);
      const bone = rollBone(s, CONFIG.bones.dropPersonal, m.floor);
      if (bone) r.bone = bone;
      s.materials.shard += r.shard + heartShards(r.heart || 0);
      res.reward = r;
    } else if (m.kind === 'secret' && win) {
      const x = s.secrets.find(y => y.floor === m.floor), r = secretReward(s, m.floor);
      const bone = rollBone(s, 1, m.floor); if (bone) r.bone = bone;
      grant(s, r); x.done = true; cnt(s, 'secret');
      res.reward = r;
    } else if (m.kind === 'echo' && win) {
      const E = P.echo, first = !s.echo.won, sh = Math.ceil(shardsForBoss(m.floor) * (first ? E.first.shardMult : E.repeat.shardMult) * shardMult(s));
      const r = first ? { tickets: E.first.tickets, essence: E.first.essence, shard: sh, first: true } : { shard: sh };
      s.echo.won = true; grant(s, r); cnt(s, 'echo');
      res.reward = r;
    } else if (m.kind === 'trial') {
      const n = m.step - 1, e = n * P.trial.essencePer;
      s.essence += e;
      res.reward = { guards: n, essence: e, week: s.trial.weekBest, best: s.trial.best };
    } else if (m.kind === 'endless') {
      res.reward = { waves: m.step - 1, essence: m.essence, tickets: m.tickets, best: s.pve.endlessBest };
    }
    exitMode(s);
    events.push(res, { type: 'spawn' });
    return res;
  }
  // Сдаться / выйти: попытка уже потрачена
  function leaveMode(s) {
    if (!s.mode) return [];
    const ev = [];
    finishMode(s, s.mode.kind === 'endless' || s.mode.kind === 'trial', ev);
    return ev;
  }
  function exitMode(s) {
    s.mode = null;
    s.buffs = { team: 0, tap: 0, teamPower: 1, tapPower: 1 };
    s.enemyIndex = Math.min(s.enemyIndex, CONFIG.enemiesPerFloor);
    spawn(s);
  }

