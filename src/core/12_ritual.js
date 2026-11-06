  // ==== src/core/12_ritual.js — Ритуал: души, сброс забега ====
  // ---------- ритуал ----------
  function canRitual(s) { return s.maxFloor >= CONFIG.ritual.floor; }
  // Стартовый этаж следующего забега зависит только от артефакта «Врата восхождения»
  function ritualStartFloor(s) { return Math.min(CONFIG.ritual.floor - 1, 1 + Math.floor(artPower(s, 'startFloor'))); }
  function ritualSouls(s) {
    if (!canRitual(s)) return 0;
    const R = CONFIG.ritual;
    const F = s.maxFloor, K = R.soulsKnee;
    const lb = Math.log10(R.soulsBase) + (Math.min(F, K) - R.floor) * Math.log10(R.soulsGrowth)
      + (F > K ? K * Math.log(R.soulsGrowth) * Math.log10(F / K) : 0);
    const base = lb >= LOGLIM ? B.fromLog10(lb) : Math.floor(Math.pow(10, lb) + 1e-9);
    // бонус только за этажи выше прежнего рекорда (и выше этажа ритуала)
    const record = Math.max(0, s.maxFloor - Math.max(s.bestRecordAtRunStart, R.floor)) * R.recordBonus;
    return B.floor(B.mul(B.add(base, record), 1 + treePower(s, 'ritualSouls')));
  }
  // «Наследие»: стартовый запас золота = per·уровень × золото за босса стартового этажа
  // 0.51: этажи, пропущенные «Вратами», считаются пройденными — их разовое золото выдаётся на старте
  // (иначе высокий стартовый этаж с нулём золота и уровнями 0 мог запереть забег навсегда)
  function gateStartGold(s) { let g = 0; for (let f = 1; f < ritualStartFloor(s); f++) g = B.add(g, firstClearGold(f)); return g; }
  function ritualStartGold(s) { return B.ceil(B.add(B.mul(treePower(s, 'startGold'), killGold(ritualStartFloor(s), true)), gateStartGold(s))); }
  // kind: 'dark' — бесплатно; 'light' — за 💎 (CONFIG.ritual.light), души ×mult (как в «Крушителях»)
  function ritual(s, kind) {
    if (!canRitual(s)) return null;
    const L = CONFIG.ritual.light, light = kind === 'light';
    if (light && (s.crystals | 0) < L.crystals) return null;
    if (s.mode) exitMode(s);
    if (light) s.crystals -= L.crystals;
    const souls = light ? B.floor(B.mul(ritualSouls(s), L.mult)) : ritualSouls(s);
    s.souls = B.add(s.souls, souls); s.stats.soulsEarned = B.add(s.stats.soulsEarned, souls);
    s.rituals++; cnt(s, 'ritual');
    const ms = ritualMilestone(s, s.rituals);
    // ритуальные задания начинаются заново
    s.quests.runBase = { ...s.counters };
    for (const q of CONFIG.quests.ritual) delete s.quests.claimed[q.id];
    s.bestFloor = Math.max(s.bestFloor, s.maxFloor);
    s.bestRecordAtRunStart = s.bestFloor;
    const start = ritualStartFloor(s);
    // сбрасывается: золото, временные уровни, найм, прогресс забега
    s.gold = ritualStartGold(s); s.tapLevel = 1;
    for (const a of CONFIG.allies) { const st = s.allies[a.id]; st.level = 0; st.ult = 0; st.cd = a.attackInterval; }
    s.buffs = { team: 0, tap: 0, teamPower: 1, tapPower: 1 };
    s.floor = start; s.maxFloor = start; s.highestCleared = start - 1;
    s.enemyIndex = 1; s.farming = false; s.reserveAcc = 0; s.heroAutoAcc = 0;
    spawn(s);
    // сохраняется: дерево душ, герои, звёзды, эволюции, материалы, копии, отряд, билеты, гарантии, эссенция, артефакты, души, способности, рекорды
    return { souls, start, milestone: ms, light };
  }
  // Награда за n-й ритуал (1/10/100): титул (и облик) сразу, ценности — в центр наград
  function ritualMilestone(s, n) {
    const m = CONFIG.ritual.milestones.find(x => x.n === n);
    if (!m) return null;
    if (!s.titles.includes(m.title)) s.titles.push(m.title);
    if (!s.title) s.title = m.title;
    if (m.skin && !s.skins.includes(m.skin)) s.skins.push(m.skin);
    inboxAdd(s, 'Ритуал №' + n + ': титул «' + m.title + '»', m.reward);
    return m;
  }
