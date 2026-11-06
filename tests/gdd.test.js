// GDD 2.0: один источник правды. Числа — только в CONFIG; GDD ссылается на ключи; таблица чисел не устарела.
const test = require('node:test'), assert = require('node:assert'), fs = require('fs'), path = require('path');
const { CONFIG } = require('../src/core.js');
const { render } = require('../tools/configdoc.js');
const gdd = fs.readFileSync(path.join(__dirname, '../docs/GDD.md'), 'utf8');

test('GDD: каждая ссылка CONFIG.x.y существует в коде', () => {
  const refs = [...new Set([...gdd.matchAll(/CONFIG((?:\.[A-Za-z_][A-Za-z0-9_]*)+)/g)].map(m => m[1].slice(1)))];
  assert.ok(refs.length > 20, 'в GDD должны быть ссылки на CONFIG');
  const missing = refs.filter(r => { let o = CONFIG; for (const k of r.split('.')) { if (o == null || !(k in o)) return true; o = o[k]; } return false; });
  assert.deepStrictEqual(missing, [], 'GDD ссылается на несуществующие ключи — поправьте GDD или CONFIG');
});

test('docs/CONFIG_VALUES.md совпадает с CONFIG (иначе: npm run docs)', () => {
  const cur = fs.readFileSync(path.join(__dirname, '../docs/CONFIG_VALUES.md'), 'utf8');
  assert.strictEqual(cur, render());
});
