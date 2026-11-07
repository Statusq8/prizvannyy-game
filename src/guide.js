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
      ['events', 'Открыты События: каждую неделю — новое, с усилением на всю Башню.', [CAMP, ...more(2, 'События'),
        ['#panel .secTitle', 'Очки события — за врагов и боссов; на вехах награды приходят сами. Фонари 🏮 — из подземелья события, их меняют в лавке.', 0]]],
      ['season', 'Начался Сезон: тропа заданий, боевой пропуск и сезонный герой.', [CAMP, ...more(10, 'Сезон'),
        ['#panel .secTitle', 'Задания тропы и опыт пропуска дают награды. Премиум-дорожка — за 💎 на весь сезон. Жетоны — на сезонного героя.', 0]]],
      ['mail', 'Открыта Почта: сюда приходят награды.', [CAMP, ...more(1, 'Почта')]],
      ['tree', 'Открыто древо «Искры Башни»: вечные улучшения за души.', [CAMP, ...more(9, 'Искры Башни'),
        ['.brH', 'Три ветви: Боевая, Достатка и Тайная. Каждая открывается после новой регрессии.', 0],
        ['.tNode .upBtn', 'Узлы покупаются за души 👻 и остаются навсегда, даже после регрессии.', 0]]],
      ['totems', 'Открыты Тотемы: каждый пройденный биом оставил тебе тотем — его сила навсегда.', [CAMP, ['.cIsl[data-id="forge"]', 'Тапни по острову Кузницы.', 1],
        ['[data-fgt="runes"]', 'Тотемы лежат во вкладке «Руны». Тапни.', 1],
        ['.totT', 'Тотем — за босса каждого биома. Каждый уровень: +10% всего урона. За 5, 10, 15 и 20 тотемов — ещё ×1,25.', 0]]],
      ['expedition', 'Открыты Экспедиции: отправляй героев в походы за осколками, билетами и копиями.', [CAMP, ...more(8, 'Экспедиции'),
        ['.exOf', 'У каждого похода есть условия: фракция, ранг не выше, звёзды. Слабые герои тоже пригодятся!', 0],
        ['.exOf [data-exsel]', 'Жми «Собрать» и выбери героев. Они продолжат драться в Башне, пока идут в походе.', 0]]],
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
      if (window.CUTS && CUTS.playing()) return;
      for (const [k, intro, steps] of GUIDES) {
        if (g.seen[k] || !on(k)) continue;
        if (window.CUTS && CUTS.pending(k)) return;   // 0.140: сначала кат-сцена этой функции
        cur = { k, intro, steps, i: 0 };
        if (window.U2 && U2.click) U2.click();
        step(); return;
      }
    }, 800);
    window.GUIDE = { reset: () => { g.seen = {}; saveG(); }, state: () => cur && { k: cur.k, i: cur.i, tap: cur.tap } };
  })();

  // ===================== 0.141: всплывающая плашка «Достижение!» (как в Крушителях) =====================
  // Ступень выполнена → сверху выезжает плашка с медалью; тап — экран Достижений. Уже готовые на момент запуска — без плашки.
  (function () {
    const ROM = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'];
    const L = () => CFG.achievements.list.filter(a => C.achVisible(a));
    const noted = {}; for (const a of L()) noted[a.id] = C.achClaimable(s, a.id) ? C.achTier(s, a.id) + 1 : C.achTier(s, a.id);
    const A = window.SY_ART || {};
    const css = document.createElement('style');
    css.textContent = `
      #achPop { position: fixed; left: 50%; top: calc(env(safe-area-inset-top) + 2vw); z-index: 1300; width: min(84vw, 420px); transform: translate(-50%, -140%); transition: transform .45s cubic-bezier(.2,1.3,.4,1);
        display: grid; grid-template-columns: 12vw 1fr; gap: 2.4vw; align-items: center; box-sizing: border-box; padding: 0.6vw 2vw; border: 3.4vw solid transparent;
        border-image: ${A.win ? 'url("' + A.win + '") 60 fill stretch' : 'none'}; background: ${A.win ? 'none' : '#1c033df0'}; cursor: pointer; }
      #achPop.show { transform: translate(-50%, 0); }
      #achPop .md { width: 12vw; height: 12vw; display: grid; place-items: center; font-size: 6.4vw; border-radius: 50%; background: radial-gradient(circle at 40% 35%, #ffe08a, #b8741a 60%, #4a2a08); box-shadow: 0 0 12px #ffd36b; animation: achSpin 1.2s ease-out; }
      @keyframes achSpin { from { transform: rotateY(540deg) scale(.4); } to { transform: none; } }
      #achPop b { display: block; font: 800 3vw Georgia, serif; letter-spacing: 0.4vw; color: #f6d690; text-shadow: 0 0 8px #a050ff; }
      #achPop span { display: block; font: 700 3.6vw Georgia, 'Times New Roman', serif; color: #f3eee8; text-shadow: 0 1px 2px #000; }
      #achPop small { display: block; font: 400 2.7vw Georgia, serif; color: #8df09a; }
    `;
    document.head.appendChild(css);
    const pop = document.createElement('div'); pop.id = 'achPop'; document.body.appendChild(pop);
    const q = []; let t = 0;
    pop.addEventListener('click', e => { e.stopPropagation(); pop.classList.remove('show'); clearTimeout(t); if (window.U2) { U2.click(); if (window.CUTS && CUTS.playing()) return; U2.home && U2.home(); U2.openX(pop.dataset.go || 'ach'); } });
    function showNext() {
      if (pop.classList.contains('show') || !q.length) return;
      if (document.querySelector('#cutOv.show, #gdOv.show, #proOv')) return;
      const x = q.length > 3 ? { many: q.splice(0).length } : q.shift();
      pop.innerHTML = '<div class="md">🏅</div><div><b>ДОСТИЖЕНИЕ!</b>' + (x.many ? '<span>Выполнено ступеней: ' + x.many + '</span><small>тапни, чтобы забрать награды</small>'
        : '<span>' + x.a.icon + ' ' + x.a.name + (x.t >= 0 ? ' ' + (ROM[x.t] || x.t + 1) : '') + '</span><small>' + (x.t >= 0 ? 'тапни — забрать награду и бонус' : 'тапни — забрать добычу') + '</small>') + '</div>';
      pop.dataset.go = x.t === -1 ? 'exp' : 'ach'; pop.querySelector('b').textContent = x.t === -1 ? 'ЭКСПЕДИЦИЯ' : 'ДОСТИЖЕНИЕ!';
      pop.classList.add('show');
      if (window.U2 && U2.click) U2.click();
      t = setTimeout(() => { pop.classList.remove('show'); setTimeout(showNext, 600); }, 3200);
    }
    const back = {}; for (const r of s.exp.runs) if (Date.now() >= r.end) back[r.uid] = 1;
    setInterval(() => {
      for (const r of s.exp.runs) if (!back[r.uid] && Date.now() >= r.end) { back[r.uid] = 1; q.push({ a: { icon: '🧭', name: 'Отряд вернулся: ' + r.name }, t: -1 }); }
      for (const a of L()) {
        const tier = C.achTier(s, a.id), ready = C.achClaimable(s, a.id) ? tier + 1 : tier;
        if (ready > (noted[a.id] | 0)) { noted[a.id] = ready; if (ready > tier) q.push({ a, t: tier }); }
        else if (ready < (noted[a.id] | 0)) noted[a.id] = ready;
      }
      showNext();
    }, 1000);
  })();
