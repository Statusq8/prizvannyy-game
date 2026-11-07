// Тестовая ссылка принимает файлы до 20 МБ, а index.html больше. Эта утилита раскладывает сборку на части:
// картинки (строки "data:image/...;base64,...") выносятся в dist/a0.js, a1.js… (window.__PZA[i] = "…"),
// а в коде остаются ссылки __PZA[i]. Код игры не меняется. Запуск: node tools/splitbuild.js [папка]
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const out = process.argv[2] || path.join(root, 'dist');
const LIMIT = 15 * 1048576;
let h = fs.readFileSync(path.join(root, 'index.html'), 'utf8').replace(':root {', ':root { color-scheme: dark;');
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
const data = [];
const chunks = []; let cur = [], curLen = 0;
h = h.replace(/<script([^>]*)>([\s\S]*?)<\/script>/g, (all, attrs, body) => {
  if (body.length < LIMIT) return all;
  body = body.replace(/([:\[,])("data:image\/[a-z+]+;base64,[A-Za-z0-9+\/=]+")/g, (m, p, str) => {
    const i = data.length; data.push(str);
    if (curLen + str.length > LIMIT && cur.length) { chunks.push(cur); cur = []; curLen = 0; }
    cur.push(i); curLen += str.length;
    return p + '__PZA[' + i + ']';
  });
  if (cur.length) { chunks.push(cur); cur = []; curLen = 0; }
  if (body.length > LIMIT) throw new Error('скрипт всё ещё больше лимита: ' + body.length);
  const loaders = chunks.splice(0).map((ids, n) => {
    const name = 'a' + (fs.readdirSync(out).length) + '.js';
    fs.writeFileSync(path.join(out, name), 'window.__PZA=window.__PZA||[];\n' + ids.map(i => '__PZA[' + i + ']=' + data[i] + ';').join('\n') + '\n');
    return '<script src="' + name + '"></script>';
  }).join('\n');
  return loaders + '\n<script' + attrs + '>' + body + '</script>';
});
fs.writeFileSync(path.join(out, 'index.html'), h);
for (const f of fs.readdirSync(out)) console.log(f, (fs.statSync(path.join(out, f)).size / 1048576).toFixed(1) + ' МБ');
