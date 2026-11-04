// Сборка: вставляет src/core.js в src/template.html → index.html (один файл, работает без интернета)
const fs = require('fs'), path = require('path');
const dir = __dirname;
const core = fs.readFileSync(path.join(dir, 'src/core.js'), 'utf8');
const tpl = fs.readFileSync(path.join(dir, 'src/template.html'), 'utf8');
if (!tpl.includes('/*__CORE__*/')) throw new Error('В шаблоне нет метки /*__CORE__*/');
// фон-зал встраивается в файл (игра работает без интернета)
const bg = 'data:image/webp;base64,' + fs.readFileSync(path.join(dir, 'assets/bg-hall.webp')).toString('base64');
if (!tpl.includes('__BG_HALL__')) throw new Error('В шаблоне нет метки __BG_HALL__');
fs.writeFileSync(path.join(dir, 'index.html'), tpl.replace('/*__CORE__*/', () => core).replace('__BG_HALL__', () => bg));
console.log('index.html собран');
