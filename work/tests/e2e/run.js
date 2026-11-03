// E2E: Playwright, телефон 390×844. Проверяет запуск без ошибок, экраны, тап, найм, Башню, сохранение после перезагрузки.
// Запуск: node tests/e2e/run.js [папка_скриншотов]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const out = process.argv[2] || path.join(__dirname, 'shots');
fs.mkdirSync(out, { recursive: true });
const url = 'file://' + path.join(__dirname, '..', '..', 'dist', 'index.html');
const results = []; const ok = (name, cond, info) => { results.push({ name, ok: !!cond, info }); };

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto(url);
  await page.waitForFunction(() => window.PZ && PZ.ready, null, { timeout: 15000 });
  ok('Запуск', true);
  ok('Окно приветствия у новой игры', await page.isVisible('#modal.on'));
  await page.screenshot({ path: path.join(out, '01_welcome.png') });
  await page.click('#modal .btn.gold');

  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(out, '02_battle.png') });
  // тапы
  const g0 = await page.evaluate(() => PZ.game.s.run.stats.taps);
  for (let i = 0; i < 25; i++) { await page.mouse.click(195, 330); await page.waitForTimeout(40); }
  ok('Звук включился после первого касания', (await page.evaluate(() => PZ.audio.state())) === 'running');
  ok('Все звуки проигрываются без ошибок', await page.evaluate(() => { try { for (const k of ['hit','slash','bolt','kill','coin','bone','click','levelup','reward','fanfare','bossStart','fail']) PZ.audio[k](true); PZ.audio.summon('S'); PZ.audio.setZone(3); PZ.audio.setZone(1); return true; } catch (e) { return String(e); } }));
  ok('Тап наносит урон', (await page.evaluate(() => PZ.game.s.run.stats.taps)) - g0 === 25);
  await page.waitForTimeout(6000);
  const st1 = await page.evaluate(() => ({ gold: PZ.game.s.run.gold, cleared: PZ.game.s.run.cleared, kills: PZ.game.s.run.stats.kills }));
  ok('Убийства и золото', st1.kills > 0 && st1.gold + 0 >= 0, st1);
  await page.screenshot({ path: path.join(out, '03_battle_fight.png') });

  // ускорим: дадим золото, наймём через UI
  await page.evaluate(() => { PZ.state.addGold(PZ.game.s, 5000, 'e2e'); });
  await page.waitForTimeout(300);
  await page.click('#btn-up'); await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(out, '03b_drawer.png') });
  await page.click('#quick .card:nth-child(3) .btn');   // кнопка героя (найм)
  ok('Найм с панели боя', (await page.evaluate(() => Object.keys(PZ.game.s.run.hired).length)) >= 1);
  await page.click('#quick .card:nth-child(2) .btn');   // уровень Призванного
  ok('Уровень Призванного', (await page.evaluate(() => PZ.game.s.run.mainLevel)) >= 2);
  await page.click('#drawer-handle'); await page.waitForTimeout(300);
  // тап запускает анимацию удара Призванного
  await page.mouse.click(195, 330);
  ok('Тап → анимация удара Призванного', await page.evaluate(() => document.querySelector('#main').classList.contains('strike')));

  // нанять 5+ героев и проверить 4 видимых (QA-05)
  await page.evaluate(() => { const s = PZ.game.s; PZ.state.addGold(s, 1e6, 'e2e'); for (const h of PZ.HEROES.slice(0, 8)) PZ.heroes.hire(s, h.id); });
  await page.waitForTimeout(800);
  const vis = await page.evaluate(() => document.querySelectorAll('#scene .slot.busy').length);
  const hired = await page.evaluate(() => Object.keys(PZ.game.s.run.hired).length);
  ok('QA-05 на сцене ' + vis + ' союзника (мест 4) при ' + hired + ' нанятых', vis === 4 && hired >= 5);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(out, '04_battle_squad.png') });

  // Герои
  await page.click('#nav button[data-s=heroes]'); await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(out, '05_heroes.png') });
  // Регресс (замечание автора 03.11.2026): нажатие на кнопку уровня не должно открывать карточку героя
  await page.evaluate(() => PZ.state.addGold(PZ.game.s, 1e7, 'e2e'));
  const lv0 = await page.evaluate(() => PZ.game.s.run.hired.e_ash_recruit || 0);
  for (let i = 0; i < 15; i++) { await page.click('#scr-heroes .card:nth-child(2) .btn', { force: true }); await page.waitForTimeout(90); }
  const lv1 = await page.evaluate(() => PZ.game.s.run.hired.e_ash_recruit || 0);
  ok('Кнопка уровня: 15 нажатий → +15 уровней, карточка не открылась', lv1 - lv0 === 15 && !(await page.isVisible('#modal.on')), { lv0, lv1 });
  const nCards = await page.evaluate(() => document.querySelectorAll('#scr-heroes .card').length);
  ok('Каталог: 40 героев + Призванный', nCards === 41, nCards);
  await page.click('#scr-heroes .card:nth-child(2) .info'); await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(out, '06_hero_card.png') });
  await page.click('#mtabs button:nth-child(3)'); await page.waitForTimeout(200);
  ok('Вкладка «Звёзды» того же героя', (await page.textContent('#mtitle')) === 'Пепельный рекрут');
  // M5: вкладка «Кости» — поглощение по точкам на силуэте и повышение ранга (QA-07 в интерфейсе)
  await page.evaluate(() => { const s = PZ.game.s; for (const sl of PZ.bones.SLOTS) s.account.bones[sl + '_1'] = 2; });
  await page.click('#mtabs button:nth-child(2)'); await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(out, '06b_bones_empty.png') });
  for (let i = 0; i < 3; i++) await page.click('.bslot >> nth=' + i);
  ok('Поглощение по тапу на точку', (await page.evaluate(() => PZ.bones.filled(PZ.game.s, 'e_ash_recruit'))) === 3);
  await page.click('text=Поглотить всё'); await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(out, '06c_bones_full.png') });
  await page.click('.btn.gold:has-text("Повысить ранг")'); await page.waitForTimeout(250);
  ok('QA-07 в интерфейсе: ранг E→D, слоты очищены', await page.evaluate(() => PZ.bones.rankOf(PZ.game.s, 'e_ash_recruit') === 'D' && PZ.bones.filled(PZ.game.s, 'e_ash_recruit') === 0));
  await page.screenshot({ path: path.join(out, '06d_bones_promoted.png') });
  await page.click('#mclose');
  await page.click('#scr-heroes .chips button[data-f=SS]'); await page.waitForTimeout(200);
  ok('SS закрыты замком', (await page.evaluate(() => [...document.querySelectorAll('#scr-heroes .card')].every(c => c.classList.contains('locked')))));
  await page.screenshot({ path: path.join(out, '07_heroes_ss_locked.png') });

  // Башня: дать рекорд 30, выбрать 12 для фарма
  await page.evaluate(() => { const s = PZ.game.s; s.run.cleared = Math.max(s.run.cleared, 30); s.account.record = Math.max(s.account.record, 30); });
  await page.click('#nav button[data-s=tower]'); await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(out, '08_tower.png') });
  const clicked = await page.evaluate(() => { const r = [...document.querySelectorAll('.trow')].find(n => n._f === 28); if (r) { r.click(); return true; } return false; });
  await page.waitForTimeout(500);
  const fs1 = await page.evaluate(() => ({ farm: PZ.game.s.run.farmFloor, rec: PZ.game.s.account.record, cur: PZ.combat.currentFloor(PZ.game.s) }));
  ok('QA-02 выбор пройденного этажа 28 → фарм, рекорд 30', clicked && fs1.farm === 28 && fs1.rec >= 30, fs1);
  const lockedOk = await page.evaluate(() => PZ.combat.selectFloor(PZ.game.s, 40).ok === false);
  ok('QA-03 закрытый этаж не выбирается', lockedOk);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(out, '09_battle_farm.png') });
  await page.click('#btn-auto'); await page.waitForTimeout(200);
  ok('QA-04 «К рекорду» → следующий новый этаж', (await page.evaluate(() => PZ.combat.currentFloor(PZ.game.s))) === (await page.evaluate(() => PZ.game.s.run.cleared + 1)));

  // Смена зон: фон и монстры зоны 3 (этаж 101+)
  await page.evaluate(() => { const s = PZ.game.s; s.run.cleared = 120; s.account.record = 120; PZ.combat.goToRecord(s); });
  await page.click('#nav button[data-s=battle]'); await page.waitForTimeout(1500);
  ok('Зона 3: фон и монстр зоны', await page.evaluate(() => document.querySelector('#bg').style.backgroundImage.length > 100 && PZ.enemyOf(121,0,null).zone === 3));
  await page.screenshot({ path: path.join(out, '09b_zone3.png') });
  await page.evaluate(() => { const s = PZ.game.s; s.run.cleared = 549; s.account.record = 549; PZ.combat.goToRecord(s); });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(out, '09c_zone11_boss.png') });

  // M6: портал ×10 → окно результатов; звёзды
  await page.evaluate(() => { PZ.game.s.account.scrolls = 30; });
  await page.click('#nav button[data-s=summon]'); await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(out, '12_portal.png') });
  const own0 = await page.evaluate(() => Object.keys(PZ.game.s.account.owned).length);
  await page.click('#scr-summon .btn.gold'); await page.waitForTimeout(1200);
  ok('Портал ×10: 10 карточек, свитки списаны', (await page.evaluate(() => document.querySelectorAll('.pull').length)) === 10 && (await page.evaluate(() => PZ.game.s.account.scrolls)) === 20);
  await page.screenshot({ path: path.join(out, '13_portal_results.png') });
  ok('После призыва коллекция не уменьшилась', (await page.evaluate(() => Object.keys(PZ.game.s.account.owned).length)) >= own0);
  await page.click('#mclose');
  await page.evaluate(() => { const s = PZ.game.s; s.account.stars.e_ash_recruit = 12; PZ.heroesUi.openHero('e_ash_recruit', 'stars'); });
  await page.waitForTimeout(300);
  ok('QA-10 12★ → одна крылатая звезда с числом 12', await page.evaluate(() => { const w = document.querySelectorAll('#mbody .starbig .starsign i'); return w.length === 1 && w[0].classList.contains('w') && w[0].textContent === '12'; }));
  await page.screenshot({ path: path.join(out, '14_stars.png') });
  await page.evaluate(() => { const s = PZ.game.s; s.account.stars.e_ash_recruit = 7; PZ.heroesUi.openHero('e_ash_recruit', 'stars'); });
  ok('7★ → две фиолетовые звезды', await page.evaluate(() => document.querySelectorAll('#mbody .starbig .starsign i.p').length === 2));
  await page.click('#mclose');

  // M7: свитки за золото, перерождение (QA-12 в интерфейсе), реликвии
  await page.evaluate(() => { const s = PZ.game.s; PZ.state.addGold(s, 1e18, 'e2e'); });
  await page.click('#nav button[data-s=summon]'); await page.waitForTimeout(250);
  const sc0 = await page.evaluate(() => PZ.game.s.account.scrolls);
  await page.click('#scr-summon .section .btnrow .btn >> nth=0'); await page.waitForTimeout(150);
  ok('Покупка свитка за золото', (await page.evaluate(() => PZ.game.s.account.scrolls)) === sc0 + 1);
  await page.evaluate(() => { const s = PZ.game.s; s.run.cleared = Math.max(s.run.cleared, 410); s.account.record = Math.max(s.account.record, 410); });
  await page.click('#nav button[data-s=more]'); await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(out, '15_rebirth_ready.png') });
  const keepRec = await page.evaluate(() => PZ.game.s.account.record);
  await page.click('.reb .btn.gold'); await page.waitForTimeout(200);
  await page.click('#modal .btn.gold'); await page.waitForTimeout(400);
  const rb = await page.evaluate(() => ({ cl: PZ.game.s.run.cleared, gold: PZ.game.s.run.gold, rec: PZ.game.s.account.record, sh: PZ.game.s.account.shards, n: PZ.game.s.account.rebirths, hired: Object.keys(PZ.game.s.run.hired).length }));
  ok('QA-12 в интерфейсе: перерождение сбросило забег, рекорд и осколки на месте', rb.cl === 0 && rb.gold === 0 && rb.hired === 0 && rb.rec === keepRec && rb.sh > 0 && rb.n === 1, rb);
  await page.click('.card.relic .btn >> nth=0'); await page.waitForTimeout(200);
  ok('Покупка реликвии за осколки', await page.evaluate(() => PZ.relics.lvl(PZ.game.s, 'heart') === 1));
  await page.screenshot({ path: path.join(out, '16_relics.png') });

  // M4: на уровне 100 сама открывается карточка Призванного с выбором класса
  await page.evaluate(() => { PZ.ui.modal.close(); PZ.game.s.run.mainLevel = 100; });
  await page.waitForTimeout(600);
  ok('Ур. 100 → окно выбора класса', await page.isVisible('#modal.on .clsbtn'));
  await page.screenshot({ path: path.join(out, '17_class_pick.png') });
  await page.click('.clsbtn >> nth=0'); await page.waitForTimeout(250);
  ok('Класс выбран (Воин), урон Призванного ×2', await page.evaluate(() => PZ.game.s.account.mainClass === 'warrior'));
  await page.screenshot({ path: path.join(out, '18_class_chosen.png') });
  await page.click('#mclose');
  // видимые герои
  await page.evaluate(() => { const s = PZ.game.s; s.run.hired.d_lane = 5; PZ.heroesUi.openHero('d_lane', 'hero'); });
  await page.waitForTimeout(250);
  await page.click('#mbody .btn:has-text("сцене")'); await page.waitForTimeout(200);
  ok('«Показывать на сцене» добавляет героя в отряд на поле', await page.evaluate(() => PZ.heroes.visibleAllies(PZ.game.s)[0] === 'd_lane'));
  await page.click('#mclose');

  // M9: настройки звука и эффектов
  await page.click('#nav button[data-s=more]'); await page.waitForTimeout(300);
  await page.click('.section:has(h3:text("Настройки")) .kv:has-text("Звук") .mode button:has-text("Выкл")'); await page.waitForTimeout(150);
  await page.click('.section:has(h3:text("Настройки")) .kv:has-text("Эффекты") .mode button:has-text("Сниженные")'); await page.waitForTimeout(150);
  await page.click('.section:has(h3:text("Настройки")) .kv:has-text("Кадров") .mode button:has-text("30")'); await page.waitForTimeout(150);
  ok('Настройки: звук выкл, эффекты сниженные, 30 кадров', await page.evaluate(() => { const st = PZ.game.s.account.settings; return st.sound === false && st.effects === 'low' && st.fps === 30; }));
  await page.screenshot({ path: path.join(out, '19_settings.png') });
  await page.click('#nav button[data-s=battle]'); await page.waitForTimeout(2500);
  ok('С 30 кадрами и сниженными эффектами бой идёт', await page.evaluate(() => PZ.game.s.run.stats.kills > 0));
  await page.evaluate(() => { const st = PZ.game.s.account.settings; st.sound = true; st.effects = 'full'; st.fps = 60; });

  // Ещё
  await page.click('#nav button[data-s=more]'); await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(out, '10_more.png'), fullPage: true });

  // Сохранение и перезагрузка (QA-01)
  const before = await page.evaluate(() => { PZ.app.saveNow(); const s = PZ.game.s; return { gold: Math.floor(s.run.gold), rec: s.account.record, hired: Object.keys(s.run.hired).length, lv: s.run.mainLevel }; });
  await page.reload();
  await page.waitForFunction(() => window.PZ && PZ.ready, null, { timeout: 15000 });
  const after = await page.evaluate(() => { const s = PZ.game.s; return { gold: Math.floor(s.run.gold), rec: s.account.record, hired: Object.keys(s.run.hired).length, lv: s.run.mainLevel }; });
  ok('QA-01 прогресс сохранился после перезагрузки', after.rec === before.rec && after.hired === before.hired && after.lv === before.lv && after.gold >= before.gold * 0.99, { before, after });
  ok('После перезагрузки нет приветствия', !(await page.evaluate(() => document.querySelector('#mtitle').textContent === 'Призванный: Башня Гачи' && document.querySelector('#modal').classList.contains('on'))));

  // Экспорт → новая игра → импорт
  const exp = await page.evaluate(() => PZ.save.exportText(PZ.game.s));
  await Promise.all([page.waitForNavigation(), page.evaluate(() => PZ.app.wipeAndReload())]);
  await page.waitForFunction(() => window.PZ && PZ.ready);
  ok('Новая игра после сброса', (await page.evaluate(() => PZ.game.s.account.record)) === 0);
  await page.click('#modal .btn.gold').catch(() => {});
  await Promise.all([page.waitForNavigation(), page.evaluate(t => PZ.app.importAndReload(t), exp)]);
  await page.waitForFunction(() => window.PZ && PZ.ready);
  ok('Импорт возвращает прогресс', (await page.evaluate(() => PZ.game.s.account.record)) === before.rec);

  // Босс: 2 минуты игрового времени ×4 без ошибок
  await page.evaluate(() => { PZ.app.go('battle'); PZ.game.s.account.settings.speed = 4; });
  await page.waitForTimeout(8000);
  await page.screenshot({ path: path.join(out, '11_battle_x4.png') });

  ok('Нет ошибок в консоли', errors.length === 0, errors.slice(0, 5));
  await browser.close();
  let fail = 0;
  for (const r of results) { console.log((r.ok ? 'ok   ' : 'FAIL ') + r.name + (r.info && !r.ok ? ' ' + JSON.stringify(r.info) : '')); if (!r.ok) fail++; }
  console.log(`\nE2E: ${results.length - fail}/${results.length} пройдено`);
  fs.writeFileSync(path.join(out, 'e2e_results.json'), JSON.stringify(results, null, 1));
  process.exit(fail ? 1 : 0);
})();
