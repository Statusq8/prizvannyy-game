// Ядро игры (логика без интерфейса) — собирается из модулей src/core/*.js в порядке src/core/ORDER.
// Node (тесты, симуляции): require('./src/core.js'). Браузер: build.js вставляет склеенный текст в index.html.
// Править код — в src/core/<модуль>.js, не здесь.
const vm = require('vm');
const src = require('./core/assemble.js')();
const mod = { exports: {} };
vm.runInThisContext('(function (module) {\n' + src + '\n})', { filename: 'src/core (собрано из src/core/*.js)' }).call(globalThis, mod);
module.exports = mod.exports;
