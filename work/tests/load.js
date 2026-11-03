// Загружает ядро в порядке сборки (тот же список, что build.js) и возвращает PZ.
const path = require('path');
const ORDER = require('../src/order.json');
module.exports = function load() {
  globalThis.PZ = {};
  for (const f of ORDER.core) {
    const p = path.join(__dirname, '..', 'src', f);
    delete require.cache[require.resolve(p)];
    require(p);
  }
  return globalThis.PZ;
};
module.exports.memStorage = function () {
  const m = new Map();
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), _m: m };
};

// Для теста паритета формул с Python: подменить каталог на старый heroes_v02.json (формулы те же, ростер другой).
module.exports.useLegacyHeroes = function (PZ) {
  const d = require('../../legacy/python/heroes_v02.json');
  PZ.HEROES = d.heroes.map(h => ({ id: h.id, name: h.name, rarity: h.rarity, faction: h.faction, tags: h.tags, hire: h.base_hire_gold, dps: h.base_dps,
    passives: h.passives.map(p => Object.assign({ lv: p.level, name: p.name }, Object.fromEntries(Object.entries(p.effect).filter(([k]) => k !== 'stack')))) }));
  PZ.HERO_BY_ID = Object.fromEntries(PZ.HEROES.map(h => [h.id, h]));
  return PZ;
};
