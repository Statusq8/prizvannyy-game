// 0.96: ядро разделено на модули src/core/*.js — каждый файл в ORDER, ничего лишнего и ничего забытого.
const test = require('node:test'), assert = require('node:assert'), fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '../src/core');
test('src/core/ORDER перечисляет все модули ядра ровно по разу', () => {
  const order = fs.readFileSync(path.join(dir, 'ORDER'), 'utf8').split('\n').map(x => x.trim()).filter(Boolean);
  const files = fs.readdirSync(dir).filter(f => /^\d\d[a-z]?_.*\.js$/.test(f)).sort();
  assert.deepStrictEqual([...order].sort(), files);
  assert.strictEqual(new Set(order).size, order.length);
  assert.deepStrictEqual(order, [...order].sort(), 'порядок модулей = порядок номеров в именах');
});
test('ядро собирается и отдаёт API', () => {
  const C = require('../src/core.js');
  for (const k of ['CONFIG', 'newState', 'serialize', 'deserialize', 'tap', 'shopBuy']) assert.ok(k in C, k);
});
