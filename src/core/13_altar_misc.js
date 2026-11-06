  // ==== src/core/13_altar_misc.js — Разное: трофеи, связи, удобство, Алтарь ====
  // ---------- трофеи боссов (0.57) ----------
  function trophyKey(floor) { const b = biomeOf(floor); return b.id + ':' + (isFinalBoss(floor) ? 'f' : (floor - 1) % b.bosses.length); }
  function trophyName(key) { const [id, k] = key.split(':'), b = CONFIG.biomes.find(x => x.id === id); return k === 'f' ? b.final : b.bosses[+k]; }
  function allTrophies() { const out = []; for (const b of CONFIG.biomes) { b.bosses.forEach((n, i) => out.push(b.id + ':' + i)); out.push(b.id + ':f'); } return out; }
  function trophyBonus(key) { return CONFIG.trophies[key.endsWith(':f') ? 'final' : 'boss']; }
  function trophyPower(s, kind) { return s.trophies.reduce((t, k) => { const x = trophyBonus(k); return t + (x.kind === kind ? x.per : 0); }, 0); }
  function grantTrophy(s, floor, events) {
    const k = trophyKey(floor);
    if (s.trophies.includes(k)) return null;
    s.trophies.push(k);
    if (events) events.push({ type: 'trophy', key: k, name: trophyName(k) });
    return k;
  }
  // ---------- связи героев (0.56) ----------
  function bondActive(s, b) { return b.heroes.every(id => inSquad(s, id)); }   // 0.74: связи — по всем нанятым (ответ 67)
  function activeBonds(s) { return CONFIG.bonds.filter(b => bondActive(s, b)); }
  function bondPower(s, kind) { return activeBonds(s).reduce((t, b) => t + (b.bonus.kind === kind ? b.bonus.per : 0), 0); }
  function bondsOf(id) { return CONFIG.bonds.filter(b => b.heroes.includes(id)); }
  // ---------- удобство (0.54) ----------
  function roleOf(a) { return CONFIG.roles[a.ult.kind] || 'Особая'; }
  function isFav(s, id) { return s.favs.includes(id); }
  function toggleFav(s, id) { if (!allyDef(id)) return false; const i = s.favs.indexOf(id); if (i < 0) s.favs.push(id); else s.favs.splice(i, 1); return true; }
  // Список героев для экрана: фильтры { faction, rarity, role, fav, owned } и сортировка 'power' | 'rarity'
  function heroList(s, f) {
    f = f || {};
    const pow = id => s.heroes[id].unlocked ? B.log10(B.max(allyDpsAt(id, Math.max(1, s.allies[id].level)), 1e-300)) + Math.log10(heroMult(s, id)) : -Infinity;
    return CONFIG.allies.filter(a => !a.hidden || s.heroes[a.id].unlocked)
      .filter(a => (!f.side || a.side === f.side) && (!f.faction || a.faction === f.faction) && (!f.rarity || a.rarity === f.rarity) && (!f.role || roleOf(a) === f.role)
                && (!f.fav || isFav(s, a.id)) && (!f.owned || s.heroes[a.id].unlocked))
      .sort((a, b) => (isFav(s, b.id) - isFav(s, a.id)) || (s.heroes[b.id].unlocked - s.heroes[a.id].unlocked)
        || (f.sort === 'power' ? pow(b.id) - pow(a.id) : CONFIG.rarities.indexOf(b.rarity) - CONFIG.rarities.indexOf(a.rarity)))
      .map(a => a.id);
  }
  function savePreset(s, i) {
    if (!Number.isInteger(i) || i < 0 || i >= CONFIG.presets || !s.squad.length) return false;
    s.presets[i] = { squad: [...s.squad], pet: s.pets.active }; return true;
  }
  function loadPreset(s, i) {
    const p = s.presets[i]; if (!p) return false;
    for (const id of [...s.squad]) squadRemove(s, id);
    for (const id of p.squad) squadAdd(s, id);
    if (p.pet && petForm(s, p.pet)) setPet(s, p.pet);
    return true;
  }
  // «Надеть лучшие» (ответ 168): все кости снимаются и раздаются заново — лучшие в каждом слоте главному герою,
  // затем отряду, затем резерву по силе (резерв бьёт в полную силу, у всех свои слоты)
  function equipBestAll(s) {
    const pow = id => B.log10(B.max(allyDpsAt(id, Math.max(1, s.allies[id].level)), 1e-300)) + Math.log10(heroMult(s, id));
    const reserve = CONFIG.allies.filter(a => s.heroes[a.id].unlocked && !s.squad.includes(a.id)).map(a => a.id).sort((a, b) => pow(b) - pow(a));
    const holders = ['hero', ...s.squad, ...reserve];
    const before = s.bones.map(b => b.on).join();
    for (const b of s.bones) b.on = null;
    for (const sl of CONFIG.bones.slots) {
      const list = s.bones.filter(b => b.slot === sl.id).sort((a, b) => boneValue(b) - boneValue(a));
      list.slice(0, holders.length).forEach((b, i) => { b.on = holders[i]; });
    }
    return s.bones.map(b => b.on).join() !== before;
  }
  // «Качать лучшего» (ответ 169): все уровни, на какие хватает золота, — самому сильному герою отряда
  function levelBest(s) {
    const can = s.squad.filter(id => s.allies[id].level < allyCap(s, id));
    if (!can.length) return null;
    const pow = id => B.log10(B.max(allyDps(s, id), 1e-300));
    const id = can.sort((a, b) => pow(b) - pow(a))[0], lv = s.allies[id].level;
    if (!buyAlly(s, id, 'max')) return null;
    return { id, levels: s.allies[id].level - lv };
  }
  // Умный офлайн-отчёт (ответ 189): что теперь можно купить или сделать
  function nowAffordable(s) {
    const out = { tap: 0, allies: [], ranks: [], stars: [], evolve: [], pets: [], find: false, ritual: canRitual(s) };
    out.tap = Math.min(maxAffordable(s.tapLevel, s.gold), tapCap(s) - s.tapLevel);
    for (const a of CONFIG.allies) {
      if (!s.heroes[a.id].unlocked) continue;
      const n = Math.min(allyMax(s, a.id), allyCap(s, a.id) - s.allies[a.id].level);
      if (n > 0 && s.squad.includes(a.id)) out.allies.push({ id: a.id, n });
      if (canRankUp(s, a.id)) out.ranks.push(a.id);
      if (canStar(s, a.id)) out.stars.push(a.id);
      if (canEvolve(s, a.id)) out.evolve.push(a.id);
    }
    if (canRankUp(s, 'hero')) out.ranks.unshift('hero');
    for (const p of CONFIG.pets.list) if (canEvolvePet(s, p.id)) out.pets.push(p.id);
    const fc = findCost(s); out.find = fc != null && B.gte(s.souls, fc);
    return out;
  }
  // «Забрать всё» (ответ 180): вход дня, задания и сундуки, достижения, почта, пропуск — одной кнопкой
  function claimEverything(s, dayKey) {
    const sum = {}; let n = 0;
    const add = x => { if (!x) return; n += x.count || 1; for (const k in (x.reward || x)) if (k !== 'count') sum[k] = B.add(sum[k] || 0, (x.reward || x)[k]); };
    if (dayKey) { const L = claimLogin(s, dayKey); if (L) add({ count: 1, reward: L.reward }); }
    add(claimAll(s));
    for (let i = 0; i < CONFIG.questChests.length; i++) { const r = openQuestChest(s, i); if (r) add({ count: 1, reward: r }); }
    add(claimAllAch(s));
    add(claimPassAll(s));
    add(claimInboxAll(s));
    { const P = claimPrestige(s); if (P) add({ count: P.levels, reward: P.reward }); }
    return n ? { count: n, reward: sum } : null;
  }
  // Все титулы игры: за регрессии и за последнюю ступень достижений. { title, bonus, src, n | ach }
  function allTitles() {
    return [...CONFIG.ritual.milestones.map(m => ({ title: m.title, bonus: m.bonus, src: 'ritual', n: m.n })),
            ...CONFIG.achievements.list.filter(a => a.title).map(a => ({ title: a.title.name, bonus: a.title.bonus, src: 'ach', ach: a }))];
  }
  // Бонус полученных титулов вида kind: 'allDmg' (весь урон) или 'gold'; бонусы всех полученных складываются
  function titlePower(s, kind) { return allTitles().reduce((t, m) => t + (m.bonus && m.bonus.kind === kind && s.titles.includes(m.title) ? m.bonus.per : 0), 0); }
  function setTitle(s, t) { if (t !== null && !s.titles.includes(t)) return false; s.title = t; return true; }

  // ---------- Алтарь ----------
  function setLock(s, id, on) {
    if (!allyDef(id)) return false;
    if (on) s.locks[id] = true; else delete s.locks[id];
    return true;
  }
  // Эссенция за выбор {id: копий}
  function sacrificeValue(sel) {
    let e = 0;
    for (const id in sel) e += CONFIG.altar.essence[allyDef(id).rarity] * sel[id];
    return e;
  }
  function needsRareConfirm(sel) {
    const min = RANK(CONFIG.altar.rareConfirmFrom);
    return Object.keys(sel).some(id => sel[id] > 0 && RANK(allyDef(id).rarity) >= min);
  }
  // Все незаблокированные копии (массовый выбор)
  function selectAllUnlocked(s) {
    const sel = {};
    for (const a of CONFIG.allies) if (!s.locks[a.id] && s.heroes[a.id].copies > 0) sel[a.id] = s.heroes[a.id].copies;
    return sel;
  }
  // Пожертвовать копии. Скрытые рецепты: если в одной жертве есть копии всех героев рецепта —
  // за каждый полный набор выдаётся скрытый герой (первый раз — открытие).
  function sacrifice(s, sel) {
    if (!sel || typeof sel !== 'object') return null;
    const clean = {};
    for (const id in sel) {
      const n = sel[id];
      if (!allyDef(id) || !Number.isInteger(n) || n < 0) return null;
      if (n === 0) continue;
      if (s.locks[id] || n > s.heroes[id].copies) return null;   // заблокированные и несуществующие копии нельзя
      clean[id] = n;
    }
    if (!Object.keys(clean).length) return null;
    const essence = sacrificeValue(clean);
    for (const id in clean) s.heroes[id].copies -= clean[id];   // исчезают навсегда
    s.essence += essence;
    const found = [];
    for (const h of CONFIG.allies.filter(a => a.hidden && a.recipe)) {
      const sets = Math.min(...h.recipe.map(id => clean[id] || 0));
      if (sets <= 0) continue;
      const st = s.heroes[h.id];
      const isNew = !st.unlocked;
      if (isNew) st.unlocked = true; else st.copies++;
      if (sets > 1) st.copies += sets - 1;
      s.discovered[h.id] = true;
      found.push({ id: h.id, sets, isNew });
    }
    return { essence, found };
  }
  function tearOfPortal(s, n) {
    const cost = CONFIG.altar.ticketCost * n;
    if (!Number.isInteger(n) || n <= 0 || s.essence < cost) return false;
    s.essence -= cost; s.tickets += n;
    return true;
  }
  function traceCost(id) { const a = allyDef(id); return a && CONFIG.altar.traceCost[a.rarity]; }
  function heroTrace(s, id) {
    const a = allyDef(id);
    if (!a || !s.heroes[id].unlocked) return false;
    const cost = traceCost(id);
    if (s.essence < cost) return false;
    s.essence -= cost; s.heroes[id].copies++;
    return true;
  }

