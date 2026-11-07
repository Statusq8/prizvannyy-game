  // ==== src/core/13b_expedition.js — 0.142: экспедиции (решение 07.11) ====
  // s.exp = { offers: [{ uid, name, len, req: [...] }], runs: [{ uid, name, len, req, heroes, start, end }], day, seq }
  // Время — реальное (мс), передаётся параметром now (тесты подставляют своё). Герой может быть только в одном походе.
  // Условия: { k: 'side', side, n } — n героев фракции; { k: 'maxRank', r } — все не выше ранга r; { k: 'stars', n } — сумма звёзд ≥ n;
  //          { k: 'sides', n } — героев n разных фракций.
  const EXP_SIDES = ['Свет', 'Тьма', 'Дикие', 'Тени'];
  function expNew(s) { return { offers: [], runs: [], day: '', seq: 0 }; }
  function expRoll(s) {
    const E = CONFIG.expeditions, r = () => s.rng();
    const len = Math.min(E.lengths.length - 1, Math.floor(r() * E.lengths.length)), L = E.lengths[len];
    const pick = a => a[Math.floor(r() * a.length)];
    const kinds = ['side', 'maxRank', 'stars', 'sides'], req = [];
    const nReq = len >= 2 ? 2 : 1;
    while (req.length < nReq) {
      const k = pick(kinds); if (req.some(q => q.k === k)) continue;
      if (k === 'side') req.push({ k, side: pick(EXP_SIDES), n: Math.min(L.team, 1 + Math.floor(r() * 2) + (len >= 2 ? 1 : 0)) });
      else if (k === 'maxRank') req.push({ k, r: pick(['E', 'D', 'C', 'B']) });
      else if (k === 'stars') req.push({ k, n: Math.max(2, Math.round(L.team * (len + 1) / 2)) });
      else req.push({ k, n: Math.min(4, Math.max(2, L.team - 1)) });
    }
    return { uid: ++s.exp.seq, name: pick(E.names), len, req };
  }
  function expRefresh(s, day) {
    const E = CONFIG.expeditions;
    if (day && s.exp.day !== day) { s.exp.day = day; s.exp.offers = []; }   // раз в сутки — новая доска
    while (s.exp.offers.length < E.board) s.exp.offers.push(expRoll(s));
    return s.exp.offers;
  }
  // смена предложения — за билеты (бесплатно раз в сутки обновляется вся доска)
  function expReroll(s, uid) {
    const i = s.exp.offers.findIndex(x => x.uid === uid), c = CONFIG.expeditions.rerollTickets;
    if (i < 0 || s.tickets < c) return false;
    s.tickets -= c; s.exp.offers[i] = expRoll(s); return true;
  }
  function expBusy(s, id) { return s.exp.runs.some(x => x.heroes.includes(id)); }
  function expReqOk(s, q, heroes) {
    const A = heroes.map(id => CONFIG.allies.find(a => a.id === id)).filter(Boolean), R = CONFIG.rarities;
    if (q.k === 'side') return A.filter(a => a.side === q.side).length >= q.n;
    if (q.k === 'maxRank') return A.every(a => R.indexOf(heroRarity(s, a.id)) <= R.indexOf(q.r));
    if (q.k === 'stars') return A.reduce((t, a) => t + (s.heroes[a.id].stars | 0), 0) >= q.n;
    if (q.k === 'sides') return new Set(A.map(a => a.side)).size >= q.n;
    return false;
  }
  function expCheck(s, uid, heroes) {
    const o = s.exp.offers.find(x => x.uid === uid); if (!o) return { ok: false, why: 'нет похода' };
    const L = CONFIG.expeditions.lengths[o.len];
    if (s.exp.runs.length >= CONFIG.expeditions.slots) return { ok: false, why: 'все отряды в пути' };
    if (heroes.length !== L.team) return { ok: false, why: 'нужно героев: ' + L.team };
    if (new Set(heroes).size !== heroes.length) return { ok: false, why: 'герой выбран дважды' };
    for (const id of heroes) { const h = s.heroes[id]; if (!h || !h.unlocked) return { ok: false, why: 'герой не открыт' }; if (expBusy(s, id)) return { ok: false, why: 'герой уже в походе' }; }
    const bad = o.req.filter(q => !expReqOk(s, q, heroes));
    return bad.length ? { ok: false, why: 'условия не выполнены', bad } : { ok: true };
  }
  function expStart(s, uid, heroes, now) {
    if (!unlockedAt(s, 'expedition') || !expCheck(s, uid, heroes).ok) return false;
    const i = s.exp.offers.findIndex(x => x.uid === uid), o = s.exp.offers[i], L = CONFIG.expeditions.lengths[o.len];
    s.exp.offers.splice(i, 1); s.exp.offers.push(expRoll(s));
    s.exp.runs.push({ uid: o.uid, name: o.name, len: o.len, req: o.req, heroes: heroes.slice(), start: now, end: now + L.h * 3600e3 });
    cnt(s, 'expStart');
    return true;
  }
  function expReward(s, run) {
    const L = CONFIG.expeditions.lengths[run.len], m = 1 + Math.max(s.bestFloor | 0, s.maxFloor | 0) / CONFIG.expeditions.floorScale;
    return { shard: Math.round(L.shard * m), tickets: L.tickets, crystals: L.crystals, copies: L.copies };
  }
  function expClaim(s, uid, now) {
    const i = s.exp.runs.findIndex(x => x.uid === uid); if (i < 0) return null;
    const run = s.exp.runs[i]; if (now < run.end) return null;
    const r = expReward(s, run), got = [];
    grant(s, { shard: r.shard, tickets: r.tickets, crystals: r.crystals });
    for (let k = 0; k < r.copies; k++) { const id = run.heroes[Math.floor(s.rng() * run.heroes.length)]; s.heroes[id].copies++; got.push(id); }
    s.exp.runs.splice(i, 1); cnt(s, 'expedition');
    return { shard: r.shard, tickets: r.tickets, crystals: r.crystals, copies: got };
  }
  function expReadyCount(s, now) { return s.exp.runs.filter(x => now >= x.end).length; }
  function expLoad(d) {
    const e = expNew(), num = v => typeof v === 'number' && isFinite(v) && v >= 0;
    if (!d || typeof d !== 'object') return e;
    const okReq = q => q && typeof q === 'object' && ['side', 'maxRank', 'stars', 'sides'].includes(q.k);
    const okO = o => o && num(o.uid) && typeof o.name === 'string' && CONFIG.expeditions.lengths[o.len] && Array.isArray(o.req) && o.req.every(okReq);
    if (Array.isArray(d.offers)) e.offers = d.offers.filter(okO).slice(0, CONFIG.expeditions.board).map(o => ({ uid: o.uid, name: o.name, len: o.len, req: o.req.map(q => ({ ...q })) }));
    if (Array.isArray(d.runs)) e.runs = d.runs.filter(o => okO(o) && Array.isArray(o.heroes) && o.heroes.every(id => CONFIG.allies.some(a => a.id === id)) && num(o.start) && num(o.end))
      .slice(0, CONFIG.expeditions.slots).map(o => ({ uid: o.uid, name: o.name, len: o.len, req: o.req.map(q => ({ ...q })), heroes: o.heroes.slice(), start: o.start, end: o.end }));
    e.day = typeof d.day === 'string' ? d.day : ''; e.seq = num(d.seq) ? d.seq : 0;
    for (const o of [...e.offers, ...e.runs]) e.seq = Math.max(e.seq, o.uid);
    return e;
  }
