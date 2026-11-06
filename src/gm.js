  // ===================== 0.87: ГМ-панель для тестовой версии (просьба пользователя 6 ноября) =====================
  // Кнопка «GM» слева на экране боя. Всё, что делает панель, сохраняется обычным сохранением игры.
  // Флаги (бесконечные ресурсы, все функции) — в localStorage 'prizvannyy_gm', живут после перезагрузки.
  (function () {
    const GK = 'prizvannyy_gm';
    let g = { inf: false, infT: false, all: false }; try { Object.assign(g, JSON.parse(localStorage.getItem(GK) || '{}')); } catch (e) {}
    const saveG = () => { try { localStorage.setItem(GK, JSON.stringify(g)); } catch (e) {} };
    const DIS0 = CFG.disabled ? CFG.disabled.slice() : [];
    const applyAll = () => { if (!CFG.disabled) return; CFG.disabled.length = 0; CFG.disabled.push(...(g.all ? DIS0.filter(k => k === 'tutorial') : DIS0)); };   // старое обучение не включаем — перекрывает экран
    applyAll();
    const btn = document.createElement('button'); btn.id = 'gmBtn'; btn.textContent = 'GM'; document.body.appendChild(btn);
    const pn = document.createElement('div'); pn.id = 'gmPn'; document.body.appendChild(pn);
    const css = document.createElement('style');
    css.textContent = `
      #gmBtn { position: fixed; left: 0; top: 46%; z-index: 2000; width: 34px; height: 34px; border-radius: 0 8px 8px 0; border: 1px solid #ffd36b; border-left: none; background: #2a0a3acc; color: #ffd36b; font: 900 12px system-ui; }
      #gmPn { position: fixed; inset: 0; z-index: 2001; display: none; background: #000a; padding: calc(env(safe-area-inset-top) + 10px) 10px 10px; overflow: auto; }
      #gmPn.show { display: block; }
      #gmPn .box { max-width: 420px; margin: 0 auto; background: #160c24; border: 1px solid #ffd36b; border-radius: 10px; padding: 10px 12px 14px; color: #eee; font: 500 14px system-ui; }
      #gmPn h3 { margin: 0 0 6px; display: flex; justify-content: space-between; align-items: center; color: #ffd36b; font: 900 16px system-ui; }
      #gmPn h4 { margin: 12px 0 6px; color: #c9a0ff; font: 800 12px system-ui; text-transform: uppercase; letter-spacing: .5px; }
      #gmPn .row { display: flex; flex-wrap: wrap; gap: 6px; }
      #gmPn button { padding: 8px 10px; border-radius: 6px; border: 1px solid #6a4a8a; background: #2a1a40; color: #fff; font: 700 13px system-ui; }
      #gmPn button.on { background: #5a2a8a; border-color: #ffd36b; color: #ffd36b; }
      #gmPn input { width: 90px; padding: 7px; border-radius: 6px; border: 1px solid #6a4a8a; background: #0a060e; color: #fff; font: 700 14px system-ui; }
      #gmPn .st { margin-top: 4px; color: #aaa; font-size: 12px; }
    `;
    document.head.appendChild(css);
    const best = () => Math.max(s.bestFloor | 0, s.maxFloor | 0);
    function draw() {
      const t = (k, n) => '<button data-g="' + k + '" class="' + (g[k] ? 'on' : '') + '">' + n + (g[k] ? ' ✓' : '') + '</button>';
      pn.innerHTML = '<div class="box"><h3>ГМ-панель (тест)<button data-g="x">✕</button></h3>' +
        '<div class="st">Этаж ' + s.floor + ' · рекорд ' + best() + ' · золото ' + fmt(s.gold) + ' · билеты ' + fmt(s.tickets) + '</div>' +
        '<h4>Ресурсы</h4><div class="row">' + t('inf', '∞ Золото') + t('infT', '∞ Билеты') +
        '<button data-g="gold">+1M золота</button><button data-g="goldx">Золото ×1000</button><button data-g="tk">+100 билетов</button><button data-g="cr">+1000 💎</button>' +
        '<button data-g="sh">+1000 осколков</button><button data-g="so">+1000 душ</button><button data-g="es">+1000 эссенции</button><button data-g="ht">+100 сердец</button></div>' +
        '<h4>Этаж</h4><div class="row"><input id="gmFl" type="number" min="1" value="' + Math.max(25, best()) + '"><button data-g="fl">Перейти</button>' +
        [25, 50, 100, 200, 500, 1250, 2000].map(f => '<button data-g="f' + f + '">' + f + '</button>').join('') + '</div>' +
        '<h4>Открыть</h4><div class="row">' + t('all', 'Все выключенные функции') + '<button data-g="heroes">Всех героев</button><button data-g="lv">Отряд +50 ур.</button><button data-g="isl">Все острова лагеря</button></div>' +
        '<div class="st">«Все выключенные функции» включает то, что пока отложено (задания, магазин, руны, питомцы…). Многие из них ещё в старом виде. Нужен рекорд этажа — перейди на нужный этаж.</div>' +
        '<h4>Разное</h4><div class="row"><button data-g="pro">Показать пролог</button><button data-g="save">Сохранить сейчас</button></div></div>';
    }
    function goFloor(n) {
      n = Math.max(1, Math.floor(n) || 1);
      s.maxFloor = Math.max(s.maxFloor | 0, n); s.bestFloor = Math.max(s.bestFloor | 0, n); s.highestCleared = Math.max(s.highestCleared | 0, n - 1);
      if (s.bestCleared != null) s.bestCleared = Math.max(s.bestCleared | 0, n - 1);
      if (s.floor !== n) C.goToFloor(s, n);
      if (n > 3) { s.cageFreed = true; if (s.allies.shorokh && !(s.allies.shorokh.level > 0)) s.allies.shorokh.level = 1; }   // клетку пропустили — Шорох в отряде
      toast('Этаж ' + n);
    }
    pn.addEventListener('click', e => {
      if (e.target === pn) { pn.classList.remove('show'); return; }
      const b = e.target.closest('[data-g]'); if (!b) return; const k = b.dataset.g;
      if (k === 'x') { pn.classList.remove('show'); return; }
      if (k === 'inf' || k === 'infT') { g[k] = !g[k]; saveG(); }
      else if (k === 'all') { g.all = !g.all; saveG(); applyAll(); toast(g.all ? 'Все функции включены' : 'Отложенные функции снова выключены'); }
      else if (k === 'gold') s.gold = B.add(s.gold, 1e6);
      else if (k === 'goldx') s.gold = B.mul(B.add(s.gold, 1), 1000);
      else if (k === 'tk') s.tickets += 100;
      else if (k === 'cr') { s.crystals = (s.crystals | 0) + 1000; toast('+1000 💎'); }
      else if (k === 'sh') s.materials.shard += 1000;
      else if (k === 'so') s.souls = B.add(s.souls, 1000);
      else if (k === 'es') s.essence = (s.essence || 0) + 1000;
      else if (k === 'ht') s.materials.heart += 100;
      else if (k === 'fl') goFloor(+$('gmFl').value);
      else if (k[0] === 'f') goFloor(+k.slice(1));
      else if (k === 'heroes') { for (const a of CFG.allies) if (s.heroes[a.id]) s.heroes[a.id].unlocked = true; s.cageFreed = true; toast('Все герои открыты'); }
      else if (k === 'lv') { for (const a of CFG.allies) if (s.heroes[a.id] && s.heroes[a.id].unlocked && s.allies[a.id]) s.allies[a.id].level = (s.allies[a.id].level | 0) + 50; s.tapLevel += 50; toast('Отряд +50 уровней'); }
      else if (k === 'isl') { const a = $('campAll'); if (a && !a.classList.contains('on')) a.click(); pn.classList.remove('show'); window.U3.camp && window.U3.camp(); return; }
      else if (k === 'pro') { pn.classList.remove('show'); window.U3.prologue && window.U3.prologue(() => {}); return; }
      else if (k === 'save') toast('Сохранено');
      save(); render(); draw();
    });
    btn.addEventListener('click', e => { e.stopPropagation(); draw(); pn.classList.add('show'); });
    setInterval(() => {
      if (g.inf && B.lt(s.gold, 1e15)) s.gold = B.add(s.gold, 1e15);
      if (g.infT && s.tickets < 1000) s.tickets = 1000;
    }, 500);
  })();
