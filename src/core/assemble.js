// Склейка ядра из модулей src/core/ в один текст (порядок — src/core/ORDER).
// Модули — части одной функции-обёртки (общая область видимости), поэтому порядок важен и не переставляется.
const fs = require('fs'), path = require('path');
module.exports = function assemble() {
  const order = fs.readFileSync(path.join(__dirname, 'ORDER'), 'utf8').split('\n').map(x => x.trim()).filter(Boolean);
  return order.map(f => fs.readFileSync(path.join(__dirname, f), 'utf8')).join('');
};
