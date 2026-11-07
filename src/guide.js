  // ===================== 0.139: обучение при открытии функций (решение 07.11) =====================
  // Новая кнопка появилась → экран темнеет, подсвечена кнопка и рука, Голос Башни говорит, что открылось.
  // Тап по кнопке открывает функцию, внутри — 2–3 подсказки на главные элементы. Обязательное (без «Пропустить»).
  // Пройденное — localStorage 'prizvannyy_guide'. Функции, открытые до этой версии, считаются пройденными.
  (function () {
    const GK = 'prizvannyy_guide';
    const on = k => C.unlockedAt(s, k);
    // Путь к функции в HUD v3: кнопка «Лагерь» → островок или «Ещё» → кнопка; затем 1–3 подсказки внутри.
    // Шаг: [селектор, текст, нужноНажать]. Шаги с нажатием — только тап по подсвеченному (обязательное обучение).
    const CAMP = ['#cbCamp', 'Новое ждёт в Лагере. Тапни по кнопке Лагеря.', 1];
    const isl = (id, nm) => ['.cIsl[data-id="' + id + '"]', 'Над облаками поднялся новый остров — ' + nm + '. Тапни по нему.', 1];
    const more = (i, nm) => [['#campMoreB', 'Тапни «Ещё» — здесь функции без своего острова.', 1], ['#campMore [data-more="' + i + '"]', 'Новая кнопка — ' + nm + '. Тапни.', 1]];
    const GUIDES = [
      ['quests', 'Открыты Задания: простые цели за билеты и кристаллы.', [CAMP, ...more(0, 'Задания'),
        ['^#pgX .tab', 'Ежедневные и недельные цели, достижения и награда за вход.', 0]]],
      ['portal', 'Открыт Портал призыва. Здесь Башня отдаёт тебе новых героев.', [CAMP, isl('portal', 'Портал'),
        ['[data-pull="1"]', 'Один призыв — за билеты 🎟. Билеты дают задания, боссы и награды за вход.', 0],
        ['[data-pull="10"]', 'Десять призывов сразу. Удобнее, когда билетов много.', 0],
        ['.ptBar, .pity', 'Шкала гаранта: если долго не везёт, редкий герой выпадет наверняка.', 0]]],
      ['forge', 'Открыта Кузница: артефакты делают весь отряд сильнее.', [CAMP, isl('forge', 'Кузница'),
        ['.fgBr', 'Две ветви: артефакты за души 👻 и за осколки 🔹.', 0],
        ['[data-fgu="1"]', 'Улучшай артефакт — бонус действует всегда, даже после регрессии.', 0]]],
      ['shop', 'Открыт Рынок.', [CAMP, isl('market', 'Рынок'),
        ['#xBody', 'Здесь меняют души и кристаллы на полезные товары. Ассортимент обновляется.', 0]]],
      ['pve', 'Открыты Испытания: подземелья вне Башни.', [CAMP, ...more(3, 'Испытания'),
        ['.pveCard', 'Ежедневные подземелья: несколько попыток в день, награда — золото, осколки и руны.', 0],
        ['.pveCard .upBtn', 'Жми «Войти» — бой на время, успей победить всех врагов.', 0]]],
      ['ritual', 'Открыта Регрессия: начать путь заново — сильнее.', [CAMP, ...more(5, 'Регрессия'),
        ['[data-rit]', 'Тёмная регрессия: вернёшься на 1 этаж, но получишь души 👻 для вечных улучшений.', 0]]],
      ['map', 'Открыта Карта Башни: все этажи, стражи и боссы.', [CAMP, ...more(4, 'Карта'),
        ['.fRoom.cur', 'Здесь ты сейчас. Пройденные этажи можно фармить — награды там меньше.', 0]]],
      ['events', 'Открыты События: временные задачи с особыми наградами.', [CAMP, ...more(2, 'События')]],
      ['mail', 'Открыта Почта: сюда приходят награды.', [CAMP, ...more(1, 'Почта')]],
    ];
    let g = null; try { g = JSON.parse(localStorage.getItem(GK) || 'null'); } catch (e) {}
    if (!g) { g = { seen: {} }; GUIDES.forEach(([k]) => { if (on(k)) g.seen[k] = 1; }); }
    const saveG = () => { try { localStorage.setItem(GK, JSON.stringify(g)); } catch (e) {} };
    saveG();

    const A = window.SY_ART || {};
    const css = document.createElement('style');
    css.textContent = `
      #gdOv { position: fixed; inset: 0; z-index: 1500; display: none; }
      #gdOv.show { display: block; }
      #gdOv .hole { position: absolute; border-radius: 12px; box-shadow: 0 0 0 200vmax #000000c4, 0 0 0 3px #f6d690, 0 0 22px 6px #b070ff; transition: left .25s, top .25s, width .25s, height .25s; pointer-events: none; }
      #gdOv .hole::after { content: ""; position: absolute; inset: -3px; border-radius: 14px; border: 2px solid #fff6; animation: gdPulse 1.2s ease-out infinite; }
      @keyframes gdPulse { from { transform: scale(1); opacity: 1; } to { transform: scale(1.25); opacity: 0; } }
      #gdOv .hand { position: absolute; font-size: 40px; pointer-events: none; filter: drop-shadow(0 0 8px #b14dff); animation: gdTap 1s ease-in-out infinite; }
      @keyframes gdTap { 50% { transform: translate(-6px, -8px) scale(.9); } }
      #gdOv .msg { position: absolute; left: 6vw; right: 6vw; box-sizing: border-box; padding: 2vw 3vw 2.4vw; border: 4.4vw solid transparent;
        border-image: ${A.win ? 'url("' + A.win + '") 60 fill stretch' : 'none'}; background: ${A.win ? 'none' : '#1c033df0'};
        color: #f3eee8; font: 400 3.8vw/1.35 Georgia, 'Times New Roman', serif; text-align: center; text-shadow: 0 1px 2px #000; animation: uWinIn .22s ease-out; }
      #gdOv .msg b { display: block; margin-bottom: 1vw; font: 700 3.2vw Georgia, serif; letter-spacing: 0.3vw; color: #f6d690; }
      #gdOv .msg small { display: block; margin-top: 1.4vw; font-size: 2.9vw; color: #c8b8dc; }
    `;
    document.head.appendChild(css);
    const ov = document.createElement('div'); ov.id = 'gdOv';
    ov.innerHTML = '<div class="hole"></div><div class="hand">👆</div><div class="msg"></div>';
    document.body.appendChild(ov);
    const hole = ov.querySelector('.hole'), hand = ov.querySelector('.hand'), msg = ov.querySelector('.msg');

    let cur = null;   // { k, steps, i }
    const vis = el => { if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'; };
    const pick = sel => { const up = sel[0] === '^', e = [...document.querySelectorAll(up ? sel.slice(1) : sel)].find(vis) || null; return up && e ? e.parentElement : e; };   // «^» — родитель (вся строка вкладок)
    function spot(el, text, title, hint) {
      if (el.closest('#campSc')) { const sc = $('campSc'), r0 = el.getBoundingClientRect(); sc.scrollTop += r0.top + r0.height / 2 - innerHeight / 2; sc.scrollLeft += r0.left + r0.width / 2 - innerWidth / 2; }
      else el.scrollIntoView && el.scrollIntoView({ block: 'nearest' });
      const r = el.getBoundingClientRect(), pad = 6, H = innerHeight;
      Object.assign(hole.style, { left: r.left - pad + 'px', top: r.top - pad + 'px', width: r.width + pad * 2 + 'px', height: r.height + pad * 2 + 'px' });
      hand.style.display = cur.tap ? '' : 'none';
      hand.style.left = Math.min(innerWidth - 50, r.left + r.width / 2) + 'px'; hand.style.top = (r.bottom + 50 > H ? r.top - 48 : r.bottom - 4) + 'px';
      msg.innerHTML = '<b>' + title + '</b>' + text + (hint ? '<small>' + hint + '</small>' : '');
      msg.style.animation = 'none'; void msg.offsetWidth; msg.style.animation = '';
      const below = r.top + r.height / 2 < H * 0.5;
      msg.style.top = below ? Math.min(H - 220, r.bottom + 60) + 'px' : ''; msg.style.bottom = below ? '' : Math.min(H - 220, H - r.top + 60) + 'px';
      ov.classList.add('show');
    }
    let tries = 0;
    function step() {
      const st = cur.steps[cur.i];
      if (!st) return finish();
      const [sel, text, tap] = st, el = pick(sel);
      if (!el) {   // ждём, пока появится (анимация открытия); подсказку, которой нет, пропускаем
        if (++tries < 8) { ov.classList.remove('show'); return setTimeout(step, 250); }
        tries = 0; cur.i++; return step();
      }
      tries = 0; cur.el = el; cur.tap = !!tap;
      const info = cur.steps.slice(cur.i).length;
      spot(el, cur.i === 0 ? cur.intro + '<br>' + text : text, cur.i === 0 ? 'НОВАЯ ФУНКЦИЯ' : 'ГОЛОС БАШНИ', tap ? 'Тапни по подсвеченному' : 'Тапни, чтобы продолжить' + (info > 1 ? ' · ещё ' + (info - 1) : ''));
    }
    function finish() { g.seen[cur.k] = 1; saveG(); cur = null; ov.classList.remove('show'); }
    ov.addEventListener('click', e => {
      e.stopPropagation(); e.preventDefault();
      if (!cur || !ov.classList.contains('show')) return;
      if (cur.tap) {
        const r = cur.el.getBoundingClientRect(), p = 10;
        if (e.clientX < r.left - p || e.clientX > r.right + p || e.clientY < r.top - p || e.clientY > r.bottom + p) return;   // обязательное: только по подсвеченному
        ov.classList.remove('show'); cur.i++; cur.el.click(); setTimeout(step, 450);
      } else { if (window.U2 && U2.click) U2.click(); cur.i++; step(); }
    }, true);
    ov.addEventListener('pointerdown', e => e.stopPropagation(), true);

    const busy = () => document.querySelector('.pg.show, #camp.show, #sysOv.show, #ui2Pop.show, .askWrap.show, #tutOv.show, #proOv, #sumFx.show, #gmPn.show') || document.body.classList.contains('oldOpen');
    setInterval(() => {
      if (cur || busy() || !vis($('cbCamp'))) return;
      for (const [k, intro, steps] of GUIDES) {
        if (g.seen[k] || !on(k)) continue;
        cur = { k, intro, steps, i: 0 };
        if (window.U2 && U2.click) U2.click();
        step(); return;
      }
    }, 800);
    window.GUIDE = { reset: () => { g.seen = {}; saveG(); } };
  })();
