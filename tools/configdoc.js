// Генерирует docs/CONFIG_VALUES.md — текущие числа игры из CONFIG (src/core/00*_config_*.js). Руками не править: npm run docs
const fs = require('fs'), path = require('path');
const { CONFIG } = require('../src/core.js');
const SKIP = new Set(['allies', 'biomes', 'artifacts', 'achievements', 'quests', 'presets', 'diary', 'factions', 'bonds', 'halls', 'trophies', 'pets', 'bones', 'events', 'season', 'secret', 'curse', 'echo']);
const short = v => { const s = JSON.stringify(v); return s.length > 160 ? s.slice(0, 157) + '…' : s; };
function render() {
  let out = '# Текущие числа игры (CONFIG)\n\nСгенерировано `npm run docs` из `src/core/00*_config_*.js`. **Не править вручную** — меняйте CONFIG и перегенерируйте.\n';
  out += 'Это единственный источник чисел; GDD ссылается на ключи (`CONFIG.ritual.floor`).\n\n| Ключ | Значение |\n|---|---|\n';
  for (const [k, v] of Object.entries(CONFIG)) {
    if (SKIP.has(k)) { out += '| `' + k + '` | список, ' + (Array.isArray(v) ? v.length + ' шт.' : Object.keys(v).length + ' ключей') + ' — см. src/core.js |\n'; continue; }
    if (v && typeof v === 'object' && !Array.isArray(v)) for (const [k2, v2] of Object.entries(v)) out += '| `' + k + '.' + k2 + '` | `' + short(v2).replace(/\|/g, '\\|') + '` |\n';
    else out += '| `' + k + '` | `' + short(v).replace(/\|/g, '\\|') + '` |\n';
  }
  return out;
}
module.exports = { render };
if (require.main === module) { fs.writeFileSync(path.join(__dirname, '../docs/CONFIG_VALUES.md'), render()); console.log('docs/CONFIG_VALUES.md обновлён'); }
