// Сборка: вставляет src/core.js в src/template.html → index.html (один файл, работает без интернета)
const fs = require('fs'), path = require('path');
const dir = __dirname;
const core = fs.readFileSync(path.join(dir, 'src/core.js'), 'utf8');
const tpl = fs.readFileSync(path.join(dir, 'src/template.html'), 'utf8');
if (!tpl.includes('/*__CORE__*/')) throw new Error('В шаблоне нет метки /*__CORE__*/');
// фон-зал встраивается в файл (игра работает без интернета)
const bg = 'data:image/webp;base64,' + fs.readFileSync(path.join(dir, 'assets/bg-hall.webp')).toString('base64');
if (!tpl.includes('__BG_HALL__')) throw new Error('В шаблоне нет метки __BG_HALL__');
// картинки игры: метки __ART_<имя>__ → WebP из assets/game/ (готовит tools/art.py); нет файла — пустая строка
const artDir = path.join(dir, 'assets/game');
const art = name => { const f = path.join(artDir, name + '.webp'); return fs.existsSync(f) ? 'data:image/webp;base64,' + fs.readFileSync(f).toString('base64') : ''; };
// новый интерфейс (0.40): отдельные файлы src/ui2.css, src/ui2.html, src/ui2.js
// 0.67: картинки героев hero_<id>_<avatar|side|back>.webp → карта HERO_ART (метка /*__HERO_ART__*/{} в шаблоне)
const heroArt = {};
for (const f of fs.existsSync(artDir) ? fs.readdirSync(artDir) : []) {
  const m = /^hero_([a-z0-9]+)_(avatar|side|back)\.webp$/.exec(f); if (!m) continue;
  (heroArt[m[1]] = heroArt[m[1]] || {})[m[2]] = 'data:image/webp;base64,' + fs.readFileSync(path.join(artDir, f)).toString('base64');
}
const ui2 = n => fs.readFileSync(path.join(dir, 'src/ui2.' + n), 'utf8');
fs.writeFileSync(path.join(dir, 'index.html'), tpl.replace('/*__CORE__*/', () => core).replace('/*__UI2_CSS__*/', () => ui2('css')).replace('<!--__UI2_HTML__-->', () => ui2('html')).replace('/*__UI2_JS__*/', () => ui2('js')).replace('__BG_HALL__', () => bg).replace('/*__HERO_ART__*/{}', () => JSON.stringify(heroArt))
  .replace(/__ART_([a-z0-9_]+)__/g, (m, n) => art(n)));
console.log('index.html собран');
