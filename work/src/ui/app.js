/* Запуск: загрузка сейва, офлайн-награда, главный цикл, навигация, автосохранение. */
(function (PZ) {
  const { $, fmt, h, img, modal, toast } = PZ.ui;
  const A = PZ.A;

  function safeStorage() {
    try { const k = '__pz'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return localStorage; }
    catch (e) { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), memory: true }; }
  }
  const storage = safeStorage();
  let cur = 'battle', last = 0, autosaveId = 0, saveAcc = 0;

  const game = { s: null, mode: 1 };
  PZ.game = game;

  function boot() {
    // В приложении Android: если хранилище WebView пустое, восстановить из копии в файле приложения
    try { if (window.PZNative && !storage.getItem(PZ.save.KEY)) { const t = window.PZNative.restore(); if (t) PZ.save.importText(storage, t); } } catch (e) { console.error(e); }
    const r = PZ.save.load(storage);
    game.s = r.state;
    const off = PZ.offline.apply(game.s, Date.now());
    // иконки
    $('#ico-gold').src = A.ico_gold; $('#ico-scr').src = A.ico_crystal; $('#ico-close').src = A.ico_close;
    $('#nav-battle').src = A.ico_battle; $('#nav-tower').src = A.ico_tower; $('#nav-heroes').src = A.ico_heroes;
    $('#nav-summon').src = A.ico_portal; $('#nav-more').src = A.ico_relic;
    document.querySelectorAll('#nav button').forEach(b => b.addEventListener('click', () => go(b.dataset.s)));
    document.addEventListener('click', e => { const b = e.target.closest('button'); if (b && !b.disabled && PZ.audio) PZ.audio.click(); }, true);
    $('#mclose').addEventListener('click', () => modal.close());
    $('#modal').addEventListener('click', e => { if (e.target.id === 'modal') modal.close(); });
    PZ.battleUi.init(); PZ.towerUi.init(); PZ.heroesUi.init(); PZ.moreUi.init(); PZ.summonUi.init();
    PZ.heroesUi.build();
    if (r.problems.length) toast('Основное сохранение повреждено — загружен резерв');
    if (storage.memory) toast('Браузер не даёт сохранять — используйте экспорт');
    if (off.gold > 0) showOffline(off);
    else if (r.from === 'new') showWelcome();
    startAutosave();
    document.addEventListener('visibilitychange', () => { if (document.hidden) saveNow(); else { const o = PZ.offline.apply(game.s, Date.now()); if (o.gold > 0) showOffline(o); } });
    window.addEventListener('pagehide', saveNow);
    last = performance.now();
    requestAnimationFrame(loop);
    PZ.ready = true;
  }

  function showOffline(o) {
    const hrs = Math.floor(o.seconds / 3600), min = Math.floor(o.seconds % 3600 / 60);
    modal.open('Пока вас не было', h('div', { style: 'text-align:center' },
      img(A.ico_goldbag), h('p', null, 'Отряд фармил этаж ' + o.floor + ' — ' + (hrs ? hrs + ' ч ' : '') + min + ' мин (не больше 8 ч, 50% скорости).'),
      h('div', { style: 'font-size:24px;font-weight:900;color:var(--gold);margin:6px 0 12px' }, '+' + fmt(o.gold) + ' золота'),
      h('button', { class: 'btn gold', onclick: () => modal.close() }, 'Забрать')));
  }
  function showWelcome() {
    modal.open('Призванный: Башня Гачи', h('div', null,
      h('div', { style: 'text-align:center' }, img(A.logo, '')),
      h('p', null, 'Отряд сражается сам. Тапайте по врагу — это удар Призванного. Золото тратьте на уровень Призванного и найм героев.'),
      h('p', { class: 'sub' }, 'Каждый 10-й этаж — босс с таймером 30 с. Не успели — отряд вернётся фармить прошлый этаж без потерь. Пройденные этажи можно выбрать во вкладке «Башня».'),
      h('button', { class: 'btn gold', style: 'width:100%', onclick: () => modal.close() }, 'В бой')));
    $('#mbody img').style.width = '80%';
  }

  function go(name) {
    cur = name;
    document.querySelectorAll('.screen').forEach(n => n.classList.toggle('on', n.id === 'scr-' + name));
    document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('on', b.dataset.s === name));
    if (name === 'tower') PZ.towerUi.show();
    if (name === 'heroes') PZ.heroesUi.build();
    if (name === 'more') PZ.moreUi.build();
    if (name === 'summon') PZ.summonUi.render();
  }

  let topT = 0, lastGold = -1, frame = 0;
  function loop(now) {
    frame++;
    const fps30 = game.s && game.s.account.settings.fps === 30;
    if (fps30 && frame % 2) { requestAnimationFrame(loop); return; }
    const dt = Math.min(0.25, Math.max(0, (now - last) / 1000)); last = now;
    const s = game.s;
    try {
      const speed = s.account.settings.speed || 1;
      PZ.combat.tick(s, dt * speed);
      s.meta.lastTick = Date.now();
      if (cur === 'battle') PZ.battleUi.render(dt);
      else { PZ.combat.events.length = 0; }
      if (cur === 'heroes') PZ.heroesUi.update();
      if (now - topT > 150) {
        topT = now;
        if (s.run.gold !== lastGold) { $('#gold').textContent = fmt(s.run.gold); lastGold = s.run.gold; }
        $('#record').textContent = s.account.record;
        $('#scrolls').textContent = s.account.scrolls || 0;
        $('#zone').textContent = PZ.B.zoneName(PZ.combat.currentFloor(s));
        PZ.heroesUi.checkClassPrompt();
        const sug = PZ.heroesUi.suggestion(s, 1), bd = $('#badge-heroes');
        const bm = $('#badge-more'); if (bm) bm.hidden = !(PZ.meta.canRebirth(s) || PZ.relics.RELICS.some(r => PZ.relics.lvl(s, r.id) < 10 && (s.account.shards || 0) >= PZ.relics.relicCost(r.id, PZ.relics.lvl(s, r.id))));
        bd.hidden = !((sug && sug.hire && s.run.gold >= sug.cost) || PZ.bonesUi.anyAction(s)); bd.textContent = '!';
      }
    } catch (e) { console.error(e); }
    requestAnimationFrame(loop);
  }

  let blocked = false;   // после сброса/импорта нельзя сохранять старый стейт (pagehide сработает при перезагрузке)
  function saveNow() {
    if (blocked) return;
    try { PZ.save.save(storage, game.s); if (window.PZNative) window.PZNative.backup(storage.getItem(PZ.save.KEY)); }
    catch (e) { console.error('save failed', e); }
  }
  function wipeAndReload() { blocked = true; stopAutosave(); PZ.save.wipe(storage); reload('Новая игра'); }
  function importAndReload(text, msg) { const r = PZ.save.importText(storage, text); blocked = true; stopAutosave(); reload(msg || 'Сохранение загружено'); return r; }
  function startAutosave() { autosaveId = setInterval(saveNow, 10000); }
  function stopAutosave() { clearInterval(autosaveId); }
  function reload(msg) { stopAutosave(); if (msg) sessionStorage && sessionStorage.setItem('pz.msg', msg); location.reload(); }

  PZ.app = { boot, go, saveNow, stopAutosave, reload, storage, wipeAndReload, importAndReload };
  if (typeof document !== 'undefined') {
    const go1 = () => { boot(); try { const m = sessionStorage.getItem('pz.msg'); if (m) { toast(m); sessionStorage.removeItem('pz.msg'); } } catch (e) {} };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go1); else go1();
  }
})(globalThis.PZ);
