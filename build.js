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
// 0.69: слой ui3 — экран боя, профиль, настройки по опросу docs/ui/ANSWERS_UI.md
const ui3 = n => fs.readFileSync(path.join(dir, 'src/ui3.' + n), 'utf8');
// 0.70: живой фон (src/ambient.js) и «кости» героев (src/rig.js); части героев — assets/game/rig_<id>_<часть>.webp, опорные точки — assets/rig/<id>.json
const rigArt = {};
for (const f of fs.existsSync(artDir) ? fs.readdirSync(artDir) : []) {
  const m = /^rig_([a-z0-9]+)_([a-zA-Z]+)\.webp$/.exec(f); if (!m) continue;
  (rigArt[m[1]] = rigArt[m[1]] || {})[m[2]] = 'data:image/webp;base64,' + fs.readFileSync(path.join(artDir, f)).toString('base64');
}
for (const id in rigArt) { const j = path.join(dir, 'assets/rig', id + '.json'); if (fs.existsSync(j)) rigArt[id]._piv = JSON.parse(fs.readFileSync(j, 'utf8')); }
const anims = {};
if (fs.existsSync(path.join(dir, 'assets/anim'))) for (const f of fs.readdirSync(path.join(dir, 'assets/anim'))) {
  const n = f.replace(/\.json$/, ''), img = path.join(artDir, 'anim_' + n + '.webp'); if (!f.endsWith('.json') || !fs.existsSync(img)) continue;
  anims[n] = { meta: JSON.parse(fs.readFileSync(path.join(dir, 'assets/anim', f), 'utf8')), src: 'data:image/webp;base64,' + fs.readFileSync(img).toString('base64') };
}
const uiArt = {}, uiDir = path.join(dir, 'assets/ui');
if (fs.existsSync(uiDir)) for (const f of fs.readdirSync(uiDir)) if (f.endsWith('.webp')) uiArt[f.slice(0, -5)] = 'data:image/webp;base64,' + fs.readFileSync(path.join(uiDir, f)).toString('base64');
uiArt._bg_menu = 'data:image/webp;base64,' + fs.readFileSync(path.join(dir, 'assets/ui_bg_menu.webp')).toString('base64');
const extra = () => fs.readFileSync(path.join(dir, 'src/uiart.js'), 'utf8').replace('/*__UI_ART__*/{}', () => JSON.stringify(uiArt)) + '\n' + fs.readFileSync(path.join(dir, 'src/anim.js'), 'utf8').replace('/*__ANIM__*/{}', () => JSON.stringify(anims)) + '\n' + fs.readFileSync(path.join(dir, 'src/ambient.js'), 'utf8') + '\n' + fs.readFileSync(path.join(dir, 'src/rig.js'), 'utf8').replace('/*__RIG_ART__*/{}', () => JSON.stringify(rigArt));
const ui2 = n => fs.readFileSync(path.join(dir, 'src/ui2.' + n), 'utf8');
fs.writeFileSync(path.join(dir, 'index.html'), tpl.replace('/*__CORE__*/', () => core).replace('/*__UI2_CSS__*/', () => ui2('css')).replace('<!--__UI2_HTML__-->', () => ui2('html')).replace('/*__UI2_JS__*/', () => ui2('js')).replace('/*__UI3_CSS__*/', () => ui3('css')).replace('/*__UI3_JS__*/', () => ui3('js') + '\n' + extra() + '\n' + fs.readFileSync(path.join(dir, 'src/ui4.js'), 'utf8')).replace('/*__PROLOGUE_T__*/[]', () => JSON.stringify(['', 'p2t', 'p3t', ''].map(n => n && 'data:image/webp;base64,' + fs.readFileSync(path.join(dir, 'assets/prologue/' + n + '.webp')).toString('base64')))).replace('/*__PROLOGUE__*/[]', () => JSON.stringify([1, 2, 3, 4].map(n => 'data:image/webp;base64,' + fs.readFileSync(path.join(dir, 'assets/prologue/p' + n + '.webp')).toString('base64')))).replace('__BG_HALL__', () => bg).replace('/*__HERO_ART__*/{}', () => JSON.stringify(heroArt))
  .replace(/__ART_([a-z0-9_]+)__/g, (m, n) => art(n)));
console.log('index.html собран');
