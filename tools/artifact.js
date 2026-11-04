// Готовит копию index.html для публикации тестовой ссылки (артефакт claude.ai):
// убирает doctype/html/head/body — площадка добавляет их сама. Запуск: node tools/artifact.js <выходной файл>
const fs = require('fs'), path = require('path');
const out = process.argv[2] || path.join(__dirname, '..', 'artifact.html');
let h = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
h = h.replace(/<!DOCTYPE html>\s*/i, '').replace(/<html[^>]*>\s*/i, '').replace(/<head>\s*/i, '')
  .replace(/<\/head>\s*<body>/i, '').replace(/<\/body>\s*<\/html>\s*$/i, '')
  .replace(/<meta charset[^>]*>\s*/i, '').replace(/<meta name="viewport"[^>]*>\s*/i, '')
  .replace(':root {', ':root { color-scheme: dark;');
fs.writeFileSync(out, h);
console.log('копия для тестовой ссылки:', out);
