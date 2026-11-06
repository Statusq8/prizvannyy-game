  // ==== src/core/11_economy.js — Экономика: руны, тотемы, артефакты и витрина Кузницы ====
  // ---------- руны: создание, улучшение, слияние ----------
  function createRune(s) {
    const R = CONFIG.runes;
    if (s.materials.shard < R.createCost) return null;
    s.materials.shard -= R.createCost;
    const k = R.kinds[Math.min(R.kinds.length - 1, Math.floor(s.rng() * R.kinds.length))];
    const r = { id: s.runeSeq++, type: k.id, tier: 0, lvl: 0 };
    s.runes.push(r); cnt(s, 'rune');
    return r;
  }
  function runeById(s, id) { return s.runes.find(r => r.id === id); }
  function runeUpCost(r) {
    const R = CONFIG.runes;
    return r.lvl >= R.maxLevel ? null : Math.ceil(R.upCost * (r.tier + 1) * Math.pow(R.upGrowth, r.lvl));
  }
  function upgradeRune(s, id) {
    const r = runeById(s, id), c = r && runeUpCost(r);
    if (!c || s.materials.shard < c) return false;
    s.materials.shard -= c; r.lvl++;
    return true;
  }
  // Можно ли слить: есть mergeCount рун вида и редкости, и это не высшая редкость
  function mergeable(s, type, tier) {
    return tier < CONFIG.rarities.length - 1 && s.runes.filter(r => r.type === type && r.tier === tier).length >= CONFIG.runes.mergeCount;
  }
  // Слияние берёт руны с наименьшим уровнем; новая руна — следующей редкости, уровень 0
  function mergeRunes(s, type, tier) {
    if (!mergeable(s, type, tier)) return null;
    const use = s.runes.filter(r => r.type === type && r.tier === tier).sort((a, b) => a.lvl - b.lvl).slice(0, CONFIG.runes.mergeCount);
    s.runes = s.runes.filter(r => !use.includes(r));
    const r = { id: s.runeSeq++, type, tier: tier + 1, lvl: 0 };
    s.runes.push(r);
    return r;
  }
  // ---------- тотемы ----------
  function totemUpCost(s, id) {
    const T = CONFIG.totems, lv = s.totems[id];
    if (!lv || lv >= T.maxLevel) return null;
    return { shards: Math.ceil(T.upShards * Math.pow(T.upGrowth, lv - 1)) + heartShards((lv + 1) % T.heartEvery === 0 ? 1 : 0), hearts: 0 };
  }
  function upgradeTotem(s, id) {
    const c = totemUpCost(s, id);
    if (!c || s.materials.shard < c.shards || s.materials.heart < c.hearts) return false;
    s.materials.shard -= c.shards; s.materials.heart -= c.hearts; s.totems[id]++;
    return true;
  }

  // ---------- артефакты за души ----------
  function foundCount(s) { return CONFIG.artifacts.filter(a => !a.special && !a.blood && artLevel(s, a.id) > 0).length; }
  function findCost(s) {
    const f = CONFIG.artifactFind, n = CONFIG.artifacts.filter(a => !a.special && !a.blood).length;
    return foundCount(s) >= n ? null : Math.ceil(f.cost * Math.pow(f.growth, foundCount(s)));
  }
  // Найти случайный ещё не найденный артефакт
  function findArtifact(s) {
    const cost = findCost(s);
    if (cost == null || B.lt(s.souls, cost)) return null;
    const pool = CONFIG.artifacts.filter(a => !a.special && !a.blood && artLevel(s, a.id) === 0);
    const a = pool[Math.min(pool.length - 1, Math.floor(s.rng() * pool.length))];
    s.souls = B.sub(s.souls, cost);
    s.artifacts[a.id] = 1;
    return a.id;
  }
  // ---------- 0.102: Рынок (как в Idle Heroes) ----------
  function marketGood(id) { return CONFIG.market.goods.find(g => g.id === id); }
  function marketRoll(s) {
    const G = CONFIG.market.goods, tot = G.reduce((x, g) => x + g.w, 0), items = [];
    for (let i = 0; i < CONFIG.market.slots; i++) {
      let r = s.rng() * tot, g = G[0]; for (const x of G) { r -= x.w; if (r < 0) { g = x; break; } }
      let hero = null;
      if (g.kind === 'copy') { const pool = CONFIG.allies.filter(a => !a.hidden && !a.seasonal && g.ranks.includes(a.rarity)); hero = pool.length ? pool[Math.min(pool.length - 1, Math.floor(s.rng() * pool.length))].id : null; }
      items.push({ g: g.id, hero, sold: false });
    }
    s.market.items = items;
  }
  // Сам обновляется раз в refreshSec (now — время в мс из интерфейса); возвращает мс до следующего обновления
  function marketSync(s, now) {
    if (!s.market) s.market = { items: [], next: 0 };
    if (!s.market.items.length || now >= s.market.next) { marketRoll(s); s.market.next = now + CONFIG.market.refreshSec * 1000; }
    return Math.max(0, s.market.next - now);
  }
  function marketAmount(s, g) {
    const f = Math.max(1, s.bestFloor | 0);
    if (g.kind === 'shard') return g.bosses * shardsForBoss(f);
    if (g.kind === 'souls') { const M = CONFIG.megaSouls; return Math.max(1, Math.ceil(M.base * Math.pow(M.per50, Math.max(0, Math.floor(f / 50) - 1)))) * g.megas; }
    return g.n || 1;
  }
  function marketPrice(s, g) { return g.cur === 'gold' ? B.mul(killGold(Math.max(1, s.bestFloor | 0), false), g.price) : g.price; }
  function marketBuy(s, i) {
    const it = s.market && s.market.items[i]; if (!it || it.sold) return null;
    const g = marketGood(it.g), price = marketPrice(s, g);
    if (g.cur === 'gold') { if (B.gt(price, s.gold)) return null; s.gold = B.sub(s.gold, price); }
    else { if ((s.crystals | 0) < price) return null; s.crystals -= price; }
    const n = marketAmount(s, g);
    if (g.kind === 'tickets') s.tickets += n;
    else if (g.kind === 'shard') s.materials.shard += n;
    else if (g.kind === 'souls') { s.souls = B.add(s.souls, n); s.stats.soulsEarned = B.add(s.stats.soulsEarned, n); }
    let isNew = false;   // как призыв: новый герой открывается, известный даёт копию на звёзды
    if (g.kind === 'copy' && it.hero) { const h = s.heroes[it.hero]; isNew = !h.unlocked; if (isNew) h.unlocked = true; else h.copies++; }
    it.sold = true;
    return { g: g.id, n, hero: it.hero, isNew };
  }
  function marketRefresh(s) {
    const c = CONFIG.market.refreshCost;
    if ((s.crystals | 0) < c) return false;
    s.crystals -= c; marketRoll(s); return true;   // таймер сам не сдвигается — как в Idle Heroes
  }

  // ---------- 0.92: витрина артефактов (ветки 'soul' и 'blood') ----------
  function shopPool(s, br) { return CONFIG.artifacts.filter(a => !a.special && !!a.blood === (br === 'blood') && artLevel(s, a.id) === 0); }
  function shopFound(s, br) { return CONFIG.artifacts.filter(a => !a.special && !!a.blood === (br === 'blood') && artLevel(s, a.id) > 0).length; }
  function shopBuyCost(s, br) {
    if (!shopPool(s, br).length) return null;
    if (br !== 'blood') return findCost(s);
    const b = CONFIG.artShop.blood; return Math.ceil(b.cost * Math.pow(b.growth, shopFound(s, br)));
  }
  function shopRefreshCost(s, br) { const c = shopBuyCost(s, br); return c == null ? null : Math.max(1, Math.ceil(c / CONFIG.artShop.refreshDiv)); }
  function shopRoll(s, br) {
    const pool = shopPool(s, br).map(a => a.id), out = [];
    while (out.length < CONFIG.artShop.slots && pool.length) out.push(pool.splice(Math.min(pool.length - 1, Math.floor(s.rng() * pool.length)), 1)[0]);
    while (out.length < CONFIG.artShop.slots) out.push(null);
    s.artShop[br] = out;
  }
  // Текущие предложения; пустая (или устаревшая) витрина заполняется бесплатно
  function shopOffers(s, br) {
    if (!s.artShop) s.artShop = { soul: [], blood: [] };
    let o = (s.artShop[br] || []).map(id => (id && artLevel(s, id) === 0 ? id : null));
    if (!o.some(Boolean) && shopPool(s, br).length) { shopRoll(s, br); o = s.artShop[br]; } else s.artShop[br] = o;
    return o.slice();
  }
  function payShop(s, br, cost) {
    if (br === 'blood') { if (s.materials.shard < cost) return false; s.materials.shard -= cost; return true; }
    if (B.lt(s.souls, cost)) return false; s.souls = B.sub(s.souls, cost); return true;
  }
  function shopBuy(s, br, slot) {
    const o = shopOffers(s, br), id = o[slot], cost = shopBuyCost(s, br);
    if (!id || cost == null || !payShop(s, br, cost)) return null;
    s.artifacts[id] = 1; s.artShop[br][slot] = null;
    return id;
  }
  function shopRefresh(s, br) {
    const cost = shopRefreshCost(s, br);
    if (cost == null || !payShop(s, br, cost)) return false;
    shopRoll(s, br); return true;
  }
  function upgradeArtCost(s, id) {
    const a = artDef(id), lv = artLevel(s, id);
    if (!a || lv === 0 || (a.max && lv >= a.max)) return null;
    return Math.ceil(a.cost * Math.pow(a.growth, lv - 1));
  }
  function upgradeArtifact(s, id) {
    const cost = upgradeArtCost(s, id);
    if (cost == null) return false;
    if (artDef(id).blood) { if (s.materials.shard < cost) return false; s.materials.shard -= cost; s.artifacts[id]++; return true; }
    if (B.lt(s.souls, cost)) return false;
    s.souls = B.sub(s.souls, cost);
    s.artifacts[id]++;
    return true;
  }
  // Предпросмотр: ожидаемый DPS до и после траты душ (бонус неизрасходованных душ уменьшится)
  function previewSpend(s, action, id, tps) {
    const before = expectedDps(s, tps);
    const t = { ...s, souls: s.souls, artifacts: { ...s.artifacts }, tree: { ...s.tree } };
    if (action === 'upgrade') { const c = upgradeArtCost(s, id); if (c == null) return null; t.souls = B.sub(t.souls, c); t.artifacts[id]++; }
    if (action === 'tree') { const c = treeCost(s, id); if (c == null) return null; t.souls = B.sub(t.souls, c); t.tree[id] = treeLevel(s, id) + 1; }
    return { before, after: expectedDps(t, tps) };
  }

