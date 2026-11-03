// Проверка моста Android (PZNative) без телефона: имитация файла приложения в sessionStorage-подобном объекте окна.
const { chromium } = require('playwright'); const path = require('path');
const url = 'file://' + path.join(__dirname, '..', '..', 'dist', 'index.html');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  // «файл приложения» переживает очистку localStorage (как настоящий файл в /data/data/...)
  await ctx.addInitScript(() => {
    const k = '__native_file__';
    window.PZNative = { platform: () => 'android', version: () => 'test', backup: t => { window.name = JSON.stringify({ [k]: t }); },
      restore: () => { try { return JSON.parse(window.name || '{}')[k] || ''; } catch (e) { return ''; } }, shareText: (a, t) => { window.__shared = t.length; } };
  });
  await page.goto(url); await page.waitForFunction(() => window.PZ && PZ.ready);
  await page.evaluate(() => { const s = PZ.game.s; s.run.cleared = 77; s.account.record = 77; PZ.app.saveNow(); });
  const hasBackup = await page.evaluate(() => PZNative.restore().length > 100);
  await page.evaluate(() => localStorage.clear());   // WebView потерял хранилище
  await page.reload(); await page.waitForFunction(() => window.PZ && PZ.ready);
  const rec = await page.evaluate(() => PZ.game.s.account.record);
  await page.evaluate(() => { PZ.app.go('more'); }); await page.waitForTimeout(200);
  await page.click('text=Файл'); const shared = await page.evaluate(() => window.__shared || 0);
  const r = [['Копия сохранения в файл приложения', hasBackup], ['Восстановление из копии после очистки хранилища', rec === 77], ['Экспорт через «Поделиться»', shared > 100], ['Без ошибок', errs.length === 0]];
  for (const [n, o] of r) console.log((o ? 'ok   ' : 'FAIL ') + n);
  await b.close(); process.exit(r.every(x => x[1]) ? 0 : 1);
})();
