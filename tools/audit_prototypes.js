const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const dir = process.argv[2], out = process.argv[3];
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const rows = [];
  for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.html')).sort()) {
    const p = await b.newPage({ viewport: { width: 390, height: 844 } });
    const errs = [];
    p.on('pageerror', e => errs.push(e.message.slice(0, 120)));
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 120)); });
    try { await p.goto('file://' + path.join(dir, f), { timeout: 30000 }); await p.waitForTimeout(2500); } catch (e) { errs.push('load:' + e.message.slice(0, 80)); }
    const info = await p.evaluate(() => ({ title: document.title, buttons: document.querySelectorAll('button').length, canvas: document.querySelectorAll('canvas').length, imgs: document.querySelectorAll('img').length, text: document.body.innerText.slice(0, 160).replace(/\s+/g, ' ') })).catch(() => ({}));
    await p.screenshot({ path: path.join(out, f.replace('.html', '.png')) }).catch(() => {});
    rows.push({ file: f, kb: Math.round(fs.statSync(path.join(dir, f)).size / 1024), ...info, errors: errs.slice(0, 3) });
    await p.close();
  }
  await b.close();
  fs.writeFileSync(path.join(out, 'audit.json'), JSON.stringify(rows, null, 1));
  for (const r of rows) console.log(JSON.stringify(r));
})();
