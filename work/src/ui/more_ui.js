/* «Ещё»: статистика, сохранения (экспорт/импорт/резерв/сброс), настройки. «Призыв» — заглушка до M6. */
(function (PZ) {
  const { $, fmt, h, img, modal, toast } = PZ.ui;
  const A = PZ.A;
  let root;

  function init() {
    root = $('#scr-more');
  }

  function build() {
    const s = PZ.game.s;
    root.innerHTML = '';
    const st = s.run.stats;
    const kv = (k, v) => h('div', { class: 'kv' }, h('span', null, k), h('span', null, v));
    const exportBox = h('textarea', { readonly: true, placeholder: 'Нажмите «Экспорт»' });
    const importBox = h('textarea', { placeholder: 'Вставьте сюда текст сохранения и нажмите «Импорт»' });
    const file = h('input', { type: 'file', accept: '.json,.txt,application/json', style: 'display:none' });
    file.addEventListener('change', async () => { const f = file.files[0]; if (f) { importBox.value = await f.text(); doImport(importBox.value); } file.value = ''; });
    root.append(h('div', { class: 'scroll' },
      h('div', { class: 'hdr' }, h('h2', null, 'Ещё')),
      PZ.metaUi.rebirthBlock(), PZ.metaUi.relicsBlock(),
      h('div', { class: 'section' }, h('h3', null, 'Забег'),
        kv('Рекорд (все забеги)', s.account.record), kv('Пройдено в этом забеге', s.run.cleared), kv('Убито врагов', fmt(st.kills)),
        kv('Золото заработано', fmt(st.goldEarned)), kv('Неудач на боссах', st.bossFails), kv('Время в игре', Math.floor(st.playSeconds / 60) + ' мин'),
        kv('Перерождений', s.account.rebirths || 0), kv('Осколки', s.account.shards || 0)),
      settingsBlock(s),
      h('div', { class: 'section' }, h('h3', null, 'Склад костей'), PZ.bonesUi.inventory(s)),
      h('div', { class: 'section' }, h('h3', null, 'Сохранение'),
        h('div', { class: 'sub', style: 'margin-bottom:8px' }, 'Автосохранение каждые 10 с и при сворачивании. Хранится основная копия и резервная. Экспорт — ваша личная копия на случай очистки браузера.'),
        h('div', { class: 'btnrow' },
          h('button', { class: 'btn', onclick: () => { PZ.app.saveNow(); toast('Сохранено'); } }, 'Сохранить'),
          h('button', { class: 'btn', onclick: () => { exportBox.value = PZ.save.exportText(s); exportBox.select(); try { navigator.clipboard.writeText(exportBox.value); toast('Скопировано'); } catch (e) {} } }, 'Экспорт'),
          h('button', { class: 'btn', onclick: () => downloadSave(s) }, 'Файл')),
        h('div', { style: 'margin:8px 0' }, exportBox),
        importBox,
        h('div', { class: 'btnrow', style: 'margin-top:8px' },
          h('button', { class: 'btn gold', onclick: () => doImport(importBox.value) }, 'Импорт'),
          h('button', { class: 'btn ghost', onclick: () => file.click() }, 'Из файла'),
          h('button', { class: 'btn ghost', onclick: restoreBackup }, 'Из резерва'))),
      h('div', { class: 'section' }, h('h3', null, 'Сброс'),
        h('div', { class: 'sub', style: 'margin-bottom:8px' }, 'Начать игру заново. Текущая копия уйдёт в резерв — её можно вернуть кнопкой «Из резерва».'),
        h('button', { class: 'btn ghost', style: 'border-color:var(--bad)', onclick: confirmWipe }, 'Новая игра')),
      h('div', { class: 'section' }, h('h3', null, 'О сборке'),
        kv('Версия', PZ.VERSION), kv('Баланс', PZ.B.id + ' (тестовый)'), kv('Версия сохранения', PZ.SAVE_VERSION), kv('Собрано', (PZ.BUILT || '').slice(0, 16).replace('T', ' ')))));
  }

  function settingsBlock(s) {
    const st = s.account.settings;
    const seg = (key, opts) => h('div', { class: 'mode' }, ...opts.map(([v, t]) => h('button', { class: (st[key] === undefined ? opts[0][0] : st[key]) === v ? 'on' : '', onclick: () => { st[key] = v; if (PZ.audio) PZ.audio.apply(); PZ.app.saveNow(); build(); } }, t)));
    const vol = h('input', { type: 'range', min: 0, max: 100, value: Math.round((st.volume === undefined ? 0.7 : st.volume) * 100), style: 'flex:1' });
    vol.addEventListener('input', () => { st.volume = vol.value / 100; if (PZ.audio) { PZ.audio.apply(); PZ.audio.coin(); } });
    vol.addEventListener('change', () => PZ.app.saveNow());
    const row = (t, c) => h('div', { class: 'kv', style: 'align-items:center;gap:10px' }, h('span', null, t), c);
    return h('div', { class: 'section' }, h('h3', null, 'Настройки'),
      row('Звук', seg('sound', [[true, 'Вкл'], [false, 'Выкл']])),
      row('Музыка', seg('music', [[true, 'Вкл'], [false, 'Выкл']])),
      h('div', { class: 'kv', style: 'align-items:center;gap:10px' }, h('span', null, 'Громкость'), vol),
      row('Эффекты', seg('effects', [['full', 'Полные'], ['low', 'Сниженные']])),
      row('Кадров в секунду', seg('fps', [[60, '60'], [30, '30']])),
      h('div', { class: 'sub', style: 'margin-top:6px' }, 'Звук включается после первого касания экрана. «Сниженные» эффекты и 30 кадров экономят батарею на слабых телефонах.'));
  }

  function downloadSave(s) {
    if (window.PZNative) { window.PZNative.shareText('Сохранение «Призванный»', PZ.save.exportText(s)); return; }
    const blob = new Blob([PZ.save.exportText(s)], { type: 'application/json' });
    const a = h('a', { href: URL.createObjectURL(blob), download: 'prizvannyy_save_' + new Date().toISOString().slice(0, 10) + '.json' });
    document.body.append(a); a.click(); a.remove();
  }
  function doImport(text) {
    if (!text || !text.trim()) { toast('Пусто'); return; }
    try { PZ.app.importAndReload(text.trim()); }
    catch (e) { toast('Ошибка: ' + e.message); }
  }
  function restoreBackup() {
    const b = PZ.app.storage.getItem(PZ.save.BACKUP);
    if (!b) { toast('Резервной копии нет'); return; }
    confirm2('Вернуть резервную копию?', 'Текущий прогресс заменится последней резервной копией.', () => {
      try { PZ.app.importAndReload(b, 'Восстановлено из резерва'); } catch (e) { toast('Ошибка: ' + e.message); }
    });
  }
  function confirmWipe() {
    confirm2('Начать заново?', 'Весь прогресс будет сброшен. Текущая копия сохранится в резерве.', () => {
      PZ.app.wipeAndReload();
    });
  }
  function confirm2(title, text, ok) {
    modal.open(title, h('div', null, h('p', null, text), h('div', { class: 'btnrow' },
      h('button', { class: 'btn gold', onclick: () => { modal.close(); ok(); } }, 'Да'),
      h('button', { class: 'btn ghost', onclick: () => modal.close() }, 'Отмена'))));
  }

  PZ.moreUi = { init, build, confirm2 };
})(globalThis.PZ);
