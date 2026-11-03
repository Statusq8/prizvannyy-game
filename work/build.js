// Сборка: src (core + ui) + ассеты → dist/index.html (один файл, работает офлайн на телефоне).
// Запуск: node build.js [--version 0.3.0]
const fs = require('fs'), path = require('path');
const ROOT = __dirname;
const ORDER = require('./src/order.json');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'version.json'), 'utf8'));
const version = (process.argv.includes('--version') && process.argv[process.argv.indexOf('--version') + 1]) || pkg.version;

const read = f => fs.readFileSync(path.join(ROOT, 'src', f), 'utf8');
const js = [...ORDER.core, ...ORDER.ui].map(f => `/* ==== ${f} ==== */\n${read(f)}`).join('\n');

// Ассеты: только те, что реально упомянуты в UI-коде (A.<id>), чтобы не раздувать файл.
const expDir = path.join(ROOT, 'assets', 'export');
const uiCode = ORDER.ui.map(read).join('\n');
const used = new Set([...uiCode.matchAll(/\bA\.([a-zA-Z0-9_]+)/g)].map(m => m[1]));
const assets = {};
for (const id of used) {
  const p = path.join(expDir, id + '.webp');
  if (fs.existsSync(p)) assets[id] = 'data:image/webp;base64,' + fs.readFileSync(p).toString('base64');
  else console.warn('нет ассета', id);
}
// Зоны: все кадры из assets/zones (ключи строятся в коде динамически: z{N}_m{M}_{кадр}, z{N}_bg)
const zDir = path.join(ROOT, 'assets', 'zones');
if (fs.existsSync(zDir)) for (const f of fs.readdirSync(zDir).filter(f => f.endsWith('.webp')))
  assets[f.replace('.webp', '')] = 'data:image/webp;base64,' + fs.readFileSync(path.join(zDir, f)).toString('base64');
const css = fs.existsSync(path.join(ROOT, 'src/ui/styles.css')) ? read('ui/styles.css') : '';
const shell = fs.existsSync(path.join(ROOT, 'src/ui/shell.html')) ? read('ui/shell.html') : '<div id="app"></div>';

const html = `<!doctype html>
<html lang="ru"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">
<meta name="theme-color" content="#0d0a16">
<title>Призванный: Башня Гачи</title>
<style>${css}</style></head>
<body>${shell}
<script>globalThis.PZ={};PZ.VERSION=${JSON.stringify(version)};PZ.BUILT=${JSON.stringify(new Date().toISOString())};
const A=${JSON.stringify(assets)};PZ.A=A;</script>
<script>
${js}
</script></body></html>`;
fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
// Вариант для публикации ссылкой (claude.ai Artifact): без своего doctype/head, высота от контейнера.
const art = `<title>Призванный: Башня Гачи</title>
<style>:root{color-scheme:dark}html,body{height:100%;background:#000}#app{height:100%!important}${css}</style>
${shell}
<script>globalThis.PZ={};PZ.VERSION=${JSON.stringify(version)};PZ.BUILT=${JSON.stringify(new Date().toISOString())};PZ.HOSTED=true;
const A=${JSON.stringify(assets)};PZ.A=A;</script>
<script>
${js}
</script>`;
fs.writeFileSync(path.join(ROOT, 'dist', 'artifact.html'), art);
fs.writeFileSync(path.join(ROOT, 'dist', 'index.html'), html);
console.log(`dist/index.html v${version}: ${(html.length / 1024).toFixed(0)} КБ, ассетов ${Object.keys(assets).length}`);
