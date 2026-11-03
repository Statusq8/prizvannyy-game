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
