/* Сохранения: saveVersion + миграции, контрольная сумма, основной и резервный слот, экспорт/импорт.
   Хранилище передаётся снаружи (localStorage в браузере, объект-заглушка в тестах). */
(function (PZ) {
  const KEY = 'prizvannyy.save', BACKUP = 'prizvannyy.save.backup', PREMIG = 'prizvannyy.save.premigration';

  function checksum(str) {             // FNV-1a 32 бит — защита от обрезанных/битых записей, не от читов
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return ('00000000' + h.toString(16)).slice(-8);
  }

  // Миграции: migrations[v] переводит сейв версии v в v+1. Каждая новая версия добавляет сюда шаг.
  const migrations = {
    // 0: прототипы до v0.2 (нет meta.saveVersion) — переносим что можно
    0(d) {
      const g = PZ.state.newGame();
      if (d && typeof d === 'object') {
        if (isFinite(d.gold)) g.run.gold = Math.max(0, +d.gold);
        const rec = +(d.record_floor || d.recordFloor || d.record || 0);
        if (isFinite(rec)) { g.account.record = Math.max(0, rec | 0); g.run.cleared = g.account.record; }
      }
      return g;
    },
    // 1 → 2 (v0.6.0): портал. Временная «вся коллекция E–S» убрана: остаются E–D и герои, нанятые в текущем забеге.
    // Работает со СТАРЫМИ id героев (heroes_v02), поэтому ранг берётся из OLD_IDS, а не из текущего каталога.
    1(d) {
      const a = d.account || {};
      if (a.ownAllTemp) {
        const keep = {};
        for (const id of Object.keys(a.owned || {})) {
          const r = oldRank(id);
          if (r && (['E', 'D'].includes(r) || (d.run && d.run.hired && d.run.hired[id]))) keep[id] = true;
        }
        a.owned = keep; delete a.ownAllTemp;
      }
      a.stars = a.stars || {}; for (const id of Object.keys(a.owned || {})) a.stars[id] = a.stars[id] || 1;
      if (!Number.isInteger(a.scrolls)) a.scrolls = PZ.B.portal.startScrolls;
      d.account = a;
      return d;
    },
    // 2 → 3 (v0.12.0): новый ростер концепта (4 фракции по 10). Каждый старый герой переходит к новому того же ранга
    // на той же позиции ценовой кривой. Если двое старых попали в одного нового — берём лучшее (звёзды, ранг, уровень),
    // фрагменты и кости складываются. Ничего из прогресса не теряется.
    2(d) {
      const a = d.account || {}, run = d.run || {};
      const map = id => newIdFor(id) || id;
      const remap = (obj, merge) => { const o = {}; for (const [k, v] of Object.entries(obj || {})) { const n = map(k); o[n] = n in o ? merge(o[n], v) : v; } return o; };
      a.owned = remap(a.owned, () => true);
      a.stars = remap(a.stars, Math.max);
      a.fragments = remap(a.fragments, (x, y) => x + y);
      const R = PZ.B.heroes.ranks;
      a.boneSets = remap(a.boneSets, (x, y) => R.indexOf(y.rank) > R.indexOf(x.rank) ? y : x);
      a.visible = [...new Set((a.visible || []).map(map))];
      run.hired = remap(run.hired, Math.max);
      // новые стартовые герои E–D тоже в коллекции
      for (const h of PZ.HEROES) if (['E', 'D'].includes(h.rarity)) { a.owned[h.id] = true; a.stars[h.id] = a.stars[h.id] || 1; }
      // недоступные по рекорду (SS/БОГ) не могли быть получены — на всякий случай убираем
      for (const id of Object.keys(a.owned)) if (!PZ.HERO_BY_ID[id] || (a.record || 0) < (PZ.B.heroes.gates[PZ.HERO_BY_ID[id].rarity] || 0)) delete a.owned[id];
      for (const id of Object.keys(run.hired)) if (!a.owned[id]) delete run.hired[id];
      run.battle = null;
      d.account = a; d.run = run;
      return d;
    },
  };

  // Старые id героев (heroes_v02) по рангам в порядке цены — для миграций 1→2 и 2→3.
  const OLD_IDS = {
    E: ['e_ash_recruit', 'e_bone_servant', 'e_forest_hunter', 'e_swamp_thief', 'e_light_acolyte'],
    D: ['d_lane', 'd_sand_wanderer', 'd_dark_acolyte', 'd_ruins_guard', 'd_spirit_huntress'],
    C: ['c_shadow_raven', 'c_ice_witch', 'c_beast_tamer', 'c_grove_keeper', 'c_sun_spearman'],
    B: ['b_steel_shield', 'b_fire_inquisitor', 'b_venom_fang', 'b_ash_necromancer', 'b_thunder_archer'],
    A: ['a_ariel', 'a_white_paladin', 'a_thorn_queen', 'a_chain_lord', 'a_moon_huntress'],
    S: ['s_sion', 's_blood_reaper', 's_ancient_druid', 's_thunderlord', 's_bone_lord'],
    SS: ['ss_void_king', 'ss_dawn_archangel', 'ss_primal_beast', 'ss_ice_empress', 'ss_faceless_assassin'],
    'БОГ': ['god_fallen_creator', 'god_astral_valkyrie', 'god_world_tree_heart', 'god_eternal_judge', 'god_fate_devourer'],
  };
  function oldRank(id) { for (const [r, l] of Object.entries(OLD_IDS)) if (l.includes(id)) return r; return null; }
  function newIdFor(oldId) {
    const r = oldRank(oldId); if (!r) return null;
    const i = OLD_IDS[r].indexOf(oldId), neu = PZ.HEROES.filter(h => h.rarity === r);   // PZ.HEROES отсортирован по цене
    return neu[Math.round(i * (neu.length - 1) / (OLD_IDS[r].length - 1))].id;
  }

  function migrate(d) {
    let v = d && d.meta && Number.isInteger(d.meta.saveVersion) ? d.meta.saveVersion : 0;
    if (v > PZ.SAVE_VERSION) throw new Error('Сохранение из более новой версии игры (' + v + ')');
    let migrated = false;
    while (v < PZ.SAVE_VERSION) {
      if (!migrations[v]) throw new Error('Нет миграции с версии ' + v);
      d = migrations[v](d); v++; migrated = true;
      if (d.meta) d.meta.saveVersion = v;
    }
    return { data: d, migrated };
  }

  // Дополняет отсутствующие поля значениями по умолчанию (новые поля внутри одной версии).
  function fillDefaults(d) {
    const g = PZ.state.newGame(d.meta && d.meta.created);
    const deep = (dst, src) => { for (const k in src) { if (dst[k] === undefined) dst[k] = src[k]; else if (src[k] && typeof src[k] === 'object' && !Array.isArray(src[k]) && dst[k] && typeof dst[k] === 'object') deep(dst[k], src[k]); } };
    deep(d, g);
    return d;
  }

  function serialize(s) {
    const body = JSON.stringify(s);
    return JSON.stringify({ v: PZ.SAVE_VERSION, sum: checksum(body), body });
  }
  function deserialize(text) {
    let wrap;
    try { wrap = JSON.parse(text); } catch (e) { throw new Error('Файл сохранения повреждён (не JSON)'); }
    let d;
    if (wrap && typeof wrap.body === 'string') {
      if (checksum(wrap.body) !== wrap.sum) throw new Error('Контрольная сумма не совпала');
      d = JSON.parse(wrap.body);
    } else d = wrap;                  // «голый» JSON старых прототипов
    const m = migrate(d);
    const s = fillDefaults(m.data);
    const errs = PZ.state.validate(s);
    if (errs.length) throw new Error('Сохранение не прошло проверку: ' + errs.slice(0, 3).join(', '));
    return { state: s, migrated: m.migrated };
  }

  function save(storage, s) {
    s.meta.seq++;
    const text = serialize(s);
    const prev = storage.getItem(KEY);
    if (prev) storage.setItem(BACKUP, prev);
    storage.setItem(KEY, text);
    return text.length;
  }

  // Загрузка: основной → резервный → новая игра. Перед миграцией кладём копию в PREMIG.
  function load(storage) {
    const tries = [[KEY, 'main'], [BACKUP, 'backup']];
    const problems = [];
    for (const [k, name] of tries) {
      const text = storage.getItem(k);
      if (!text) continue;
      try {
        const r = deserialize(text);
        if (r.migrated) storage.setItem(PREMIG, text);
        return { state: r.state, from: name, migrated: r.migrated, problems };
      } catch (e) { problems.push(name + ': ' + e.message); }
    }
    return { state: PZ.state.newGame(), from: 'new', migrated: false, problems };
  }

  function exportText(s) { return serialize(s); }
  function importText(storage, text) {
    const r = deserialize(text);                 // бросит ошибку, текущий сейв не тронут
    const cur = storage.getItem(KEY);
    if (cur) storage.setItem(BACKUP, cur);
    storage.setItem(KEY, serialize(r.state));
    return r;
  }
  function wipe(storage) {
    const cur = storage.getItem(KEY);
    if (cur) storage.setItem(BACKUP, cur);       // даже сброс можно откатить из резерва
    // Пишем новую игру, а не удаляем ключ: иначе load() поднимет резерв и сброс «не сработает».
    storage.setItem(KEY, serialize(PZ.state.newGame()));
  }

  PZ.save = { newIdFor, oldRank, KEY, BACKUP, PREMIG, checksum, serialize, deserialize, migrate, save, load, exportText, importText, wipe, migrations };
})(globalThis.PZ = globalThis.PZ || {});
