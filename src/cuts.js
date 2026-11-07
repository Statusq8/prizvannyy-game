  // ===================== 0.140: кат-сцены манга-панелями к каждой новой функции (решение 07.11) =====================
  // Страница манхвы: 3–4 панели, тап — следующая панель (выезжает), реплики в пузырях, слова Башни — в системной рамке.
  // Картинка панели — assets/cuts/cut_<сцена>_<N>.webp (промпты — docs/CUTS_FUNCTIONS.md); пока её нет — заглушка: тёмная панель с описанием кадра.
  // Порядок: функция открылась → кат-сцена → обучение (guide.js ждёт, пока сцена идёт). Просмотренное — 'prizvannyy_cuts'. Пересмотр — CUTS.play(id).
  (function () {
    const IMG = /*__CUTS__*/{};
    const CK = 'prizvannyy_cuts';
    const on = k => C.unlockedAt(s, k);
    // панель: [вид, описание кадра (для заглушки и промпта), реплики: [кто, текст] — кто: 'sys' окно Башни, 'me' Призванный, имя — союзник, '' — мысль/титр]
    // вид: 'w' — во всю ширину, 'l'/'r' — половина слева/справа (идут парой), 't' — высокая
    const SCENES = {
      quests: { t: 'Список дел', k: 'quests', p: [
        ['w', 'Призванный сидит на ступенях, считает царапины на мече', [['me', 'Пять этажей. А я всё ещё не понимаю правил.']]],
        ['l', 'Перед лицом вспыхивает синее окно со списком', [['sys', 'ЗАДАНИЯ ДНЯ: 3. Награда: билеты.']]],
        ['r', 'Крупно: ухмылка героя', [['me', 'Дейлики. Серьёзно?']]],
        ['w', 'Он встаёт, за спиной — бесконечная лестница вверх', [['', 'В игре он закрывал их за пять минут. Здесь за них платят жизнью.']]]] },
      portal: { t: 'Врата призыва', k: 'portal', p: [
        ['t', 'Каменная арка, внутри крутится фиолетовая воронка', [['sys', 'ОТКРЫТ: ПОРТАЛ ПРИЗЫВА']]],
        ['l', 'Рука героя тянется к воронке, на ладони светится печать', [['me', 'Гача… даже здесь.']]],
        ['r', 'Из воронки — силуэт с горящими глазами', [['', '…Кто-то отвечает.']]],
        ['w', 'Силуэт делает шаг, свет бьёт в лицо героя', [['?', 'Ты звал — я пришёл. Не трать меня зря.']]]] },
      forge: { t: 'Горн', k: 'forge', p: [
        ['w', 'Заброшенная кузня, в горне вдруг вспыхивает огонь', [['sys', 'ОТКРЫТА: КУЗНИЦА']]],
        ['l', 'На наковальне сам собой появляется ржавый клинок', [['me', 'Он… ждал меня?']]],
        ['r', 'Удар молота, искры летят веером', [['', 'Каждый удар — сила всего отряда.']]],
        ['w', 'Клинок светится; за спиной героя кивают союзники', [['Шорох', 'Теперь бьём вместе.']]]] },
      shop: { t: 'Торговец без лица', k: 'shop', p: [
        ['w', 'Палатка на краю облачного острова, внутри — фигура в капюшоне без лица', [['?', 'Души. Кристаллы. Всё имеет цену.']]],
        ['l', 'Крупно: прилавок с мерцающими флаконами и свитками', [['me', 'А что ты берёшь?']]],
        ['r', 'Пустой капюшон слегка наклоняется', [['?', 'То, что Башня тебе уже дала.']]],
        ['w', 'Окно поверх палатки', [['sys', 'ОТКРЫТ: РЫНОК. Товары обновляются.']]]] },
      pve: { t: 'Боковые двери', k: 'pve', p: [
        ['w', 'Коридор Башни, в стене трескается и открывается тайная дверь', [['sys', 'ОТКРЫТЫ: ИСПЫТАНИЯ']]],
        ['l', 'За дверью — сундуки золота и толпа врагов', [['me', 'Ловушка.']]],
        ['r', 'Песочные часы над дверью начинают сыпаться', [['sys', 'Время ограничено.']]],
        ['w', 'Герой с отрядом врывается внутрь', [['me', 'Значит, быстро.']]]] },
      ritual: { t: 'Жертва', k: 'ritual', p: [
        ['t', 'Круг из чёрных свечей, в центре — герой на коленях', [['sys', 'ДОСТУПНА: ТЁМНАЯ РЕГРЕССИЯ']]],
        ['l', 'Окно со сбоем, буквы плывут', [['sys', 'Отдай путь — получи души.']]],
        ['r', 'Глаза героя: в них отражаются сотни пройденных этажей', [['me', 'Начать сначала… сильнее.']]],
        ['w', 'Свечи гаснут разом, вокруг вспыхивают призрачные огни душ', [['', 'Башня забирает этажи. Но не забирает его.']]]] },
      map: { t: 'Карта', k: 'map', p: [
        ['w', 'Герой разворачивает светящийся свиток', [['sys', 'ОТКРЫТА: КАРТА БАШНИ']]],
        ['t', 'На свитке — башня в разрезе, этажи уходят за край', [['me', 'Сколько же их…']]],
        ['w', 'Крупно: на самой вершине — пятно, стёртое чьей-то рукой', [['', 'Кто-то не хотел, чтобы видели верх.']]]] },
      events: { t: 'Праздник в Башне', k: 'events', p: [
        ['w', 'Этаж вдруг украшен фонарями, гремит музыка', [['sys', 'НАЧАЛОСЬ СОБЫТИЕ']]],
        ['l', 'Союзники в смешных шапках', [['Шорох', 'Не спрашивай.']]],
        ['r', 'Герой с подозрением смотрит на фонарь', [['me', 'Праздник. В тюрьме.']]]] },
      tree: { t: 'Искры', k: 'tree', p: [
        ['w', 'После регрессии герой стоит в пустом зале, вокруг кружат искры-души', [['sys', 'ОТКРЫТО: ДРЕВО «ИСКРЫ БАШНИ»']]],
        ['t', 'Искры собираются в светящееся дерево из чистого света, ветви уходят вверх', [['', 'Всё, что Башня забрала, проросло здесь.']]],
        ['w', 'Герой касается первой ветви, она вспыхивает', [['me', 'В этот раз я начну сильнее.']]]] },
      altar: { t: 'Цена', k: 'altar', p: [
        ['w', 'Каменный алтарь в багровом свете, на нём лежат светящиеся карточки-копии героев', [['sys', 'ОТКРЫТ: АЛТАРЬ']]],
        ['l', 'Карточки сгорают, превращаясь в сверкающую эссенцию', [['me', 'Лишнее — в силу.']]],
        ['r', 'Из эссенции складывается силуэт знакомого героя', [['sys', 'Обмен принят.']]]] },
      alchemy: { t: 'Котёл', k: 'alchemy', p: [
        ['w', 'Рядом с алтарём закипает котёл, над ним клубится разноцветный пар', [['sys', 'ОТКРЫТА: АЛХИМИЯ']]],
        ['l', 'Шорох нюхает флакон и морщится', [['Шорох', 'Пахнет как победа. И немного как носки.']]],
        ['r', 'Герой залпом выпивает зелье, глаза вспыхивают золотом', [['me', 'Час двойной силы. Погнали.']]]] },
      totems: { t: 'Голоса павших', k: 'totems', p: [
        ['w', 'Зал, где из пола поднимаются каменные идолы с лицами боссов биомов', [['sys', 'ОТКРЫТЫ: ТОТЕМЫ']]],
        ['l', 'Каменное лицо Хранителя Врат открывает светящиеся глаза', [['?', 'Ты победил нас. Теперь мы служим.']]],
        ['r', 'Герой касается идола, по руке бегут руны', [['me', 'Сила побеждённых… моя.']]],
        ['w', 'Ряд тотемов уходит вдаль, многие ещё тёмные', [['', 'Каждый новый биом — новый голос.']]]] },
      expedition: { t: 'В путь', k: 'expedition', p: [
        ['w', 'У выхода из лагеря стоит доска, утыканная записками и картами', [['sys', 'ОТКРЫТЫ: ЭКСПЕДИЦИИ']]],
        ['l', 'Тиль-Шорох срывает записку с доски', [['Шорох', 'Сюда сильные не ходят. Значит, пойду я.']]],
        ['r', 'Герой улыбается и кивает', [['me', 'Возвращайся с добычей.']]],
        ['w', 'Маленький отряд уходит по туманной тропе между островами', [['', 'Даже самые слабые находят дорогу.']]]] },
      season: { t: 'Карнавал', k: 'season', p: [
        ['w', 'Этаж Башни превращается в мрачный карнавал: маски, огни, шатры', [['sys', 'НАЧАЛСЯ СЕЗОН']]],
        ['l', 'Девушка-фея в маске сидит на шатре и машет герою', [['?', 'Пройдёшь мою тропу — пойду с тобой.']]],
        ['r', 'Герой поправляет меч, усмехается', [['me', 'Боевой пропуск. Я дома.']]]] },
      mail: { t: 'Письмо', k: 'mail', p: [
        ['w', 'Чёрный ворон садится на плечо героя, в клюве — конверт с печатью Башни', [['sys', 'ОТКРЫТА: ПОЧТА']]],
        ['w', 'Герой ломает печать, внутри — сияющий билет', [['me', 'Хоть кто-то здесь вежлив.']]]] },
    };
    let seen = null; try { seen = JSON.parse(localStorage.getItem(CK) || 'null'); } catch (e) {}
    if (!seen) { seen = {}; for (const id in SCENES) if (on(SCENES[id].k)) seen[id] = 1; }   // открытое до 0.140 — без сцен
    const saveS = () => { try { localStorage.setItem(CK, JSON.stringify(seen)); } catch (e) {} };
    saveS();

    const SY = window.SY_ART || {};
    const css = document.createElement('style');
    css.textContent = `
      #cutOv { position: fixed; inset: 0; z-index: 1400; display: none; background: #0b0614; overflow: hidden; }
      #cutOv.show { display: block; }
      #cutOv .cPage { position: absolute; inset: calc(env(safe-area-inset-top) + 12vw) 3vw calc(env(safe-area-inset-bottom) + 16vw); display: grid; grid-template-columns: 1fr 1fr; grid-auto-rows: 1fr; gap: 2.4vw; align-content: stretch; }
      #cutOv .cTitle { position: absolute; left: 0; right: 0; top: calc(env(safe-area-inset-top) + 2.5vw); text-align: center; font: 800 5vw Georgia, 'Times New Roman', serif; color: #f6d690; text-shadow: 0 2px 3px #000, 0 0 10px #a050ff; letter-spacing: 0.3vw; }
      #cutOv .cP { position: relative; grid-column: span 2; overflow: hidden; background: #1a0f2a; border: 0.8vw solid #f3eee8; box-shadow: 0 0 0 0.5vw #000, 0 1vw 3vw #000c; opacity: 0; transform: translateY(6vw) scale(.96); transition: opacity .35s, transform .45s cubic-bezier(.2,.9,.3,1.2); }
      #cutOv .cP.l, #cutOv .cP.r { grid-column: span 1; }
      #cutOv .cP.t { grid-row: span 2; }
      #cutOv .cP.l { clip-path: polygon(0 0, 100% 0, 92% 100%, 0 100%); }
      #cutOv .cP.r { clip-path: polygon(8% 0, 100% 0, 100% 100%, 0 100%); margin-left: -4vw; }
      #cutOv .cP.on { opacity: 1; transform: none; }
      #cutOv .cP > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; animation: cutPan 7s ease-out both; }
      @keyframes cutPan { from { transform: scale(1.12); } to { transform: scale(1); } }
      /* заглушка без картинки: штриховка манги + описание кадра */
      #cutOv .cP .ph { position: absolute; inset: 0; display: grid; place-items: center; padding: 4vw; text-align: center; font: italic 400 3.2vw/1.35 Georgia, serif; color: #b8a6d4;
        background: repeating-linear-gradient(-45deg, #0000 0 1.2vw, #ffffff08 1.2vw 1.5vw), radial-gradient(circle at 50% 40%, #4a2370, #120820 75%); }
      #cutOv .cP .ph::before { content: "🖼"; display: block; font-style: normal; font-size: 7vw; opacity: .35; margin-bottom: 1vw; }
      #cutOv .bub { position: absolute; z-index: 2; max-width: 78%; padding: 1.8vw 3vw; font: 700 3.5vw/1.3 Georgia, 'Times New Roman', serif; opacity: 0; transform: scale(.6); transition: opacity .25s .25s, transform .3s .25s cubic-bezier(.2,1.4,.4,1); }
      #cutOv .cP.on .bub { opacity: 1; transform: none; }
      #cutOv .bub.say { background: #fff; color: #120a1a; border-radius: 50%/45%; border: 0.5vw solid #000; padding: 2.4vw 4vw; }
      #cutOv .bub.say::after { content: ""; position: absolute; left: 22%; bottom: -2.4vw; border: 1.6vw solid transparent; border-top: 2.6vw solid #000; border-bottom: 0; }
      #cutOv .bub.say i { display: block; font: 800 2.5vw Georgia, serif; font-style: normal; color: #7a2ab0; margin-bottom: 0.3vw; }
      #cutOv .bub.cap { background: #f6efe0; color: #1a1020; border: 0.4vw solid #000; font-weight: 400; font-style: italic; }
      #cutOv .bub.sys { border: 3vw solid transparent; border-image: ${SY.win ? 'url("' + SY.win + '") 60 fill stretch' : 'none'}; background: ${SY.win ? 'none' : '#1c033dee'}; color: #f6d690; padding: 0.6vw 1.6vw; text-align: center; letter-spacing: 0.15vw; text-shadow: 0 1px 2px #000; font-size: 3.2vw; }
      #cutOv .p0 { left: 3vw; top: 3vw; } #cutOv .p1 { right: 3vw; bottom: 3vw; } #cutOv .p2 { left: 3vw; bottom: 3vw; }
      #cutOv .bub.sys.p0 { left: 50%; transform: translateX(-50%) scale(.6); } #cutOv .cP.on .bub.sys.p0 { transform: translateX(-50%); }
      #cutOv .cHint { position: absolute; left: 0; right: 0; bottom: calc(env(safe-area-inset-bottom) + 5vw); text-align: center; font: 400 3vw Georgia, serif; color: #c8b8dc; animation: cutBlink 1.4s ease-in-out infinite; }
      @keyframes cutBlink { 50% { opacity: .35; } }
      #cutOv .cSkip { position: absolute; right: 3vw; bottom: calc(env(safe-area-inset-bottom) + 3vw); height: 9vw; padding: 0 3.6vw; border: 0.3vw solid #c8a06099; border-radius: 1vw; background: #1c033dcc; color: #f3e6d0; font: 700 3.2vw Georgia, serif; }
      #cutOv.out { opacity: 0; transition: opacity .4s; }
    `;
    document.head.appendChild(css);
    const ov = document.createElement('div'); ov.id = 'cutOv'; document.body.appendChild(ov);
    const esc = t => String(t).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    let cur = null;
    function bubbles(lines) {
      return lines.map(([who, txt], i) => {
        const pos = ' p' + Math.min(i, 2);
        if (who === 'sys') return '<div class="bub sys' + pos + '">' + esc(txt) + '</div>';
        if (!who) return '<div class="bub cap' + pos + '">' + esc(txt) + '</div>';
        return '<div class="bub say' + pos + '">' + (who === 'me' ? '' : '<i>' + esc(who) + '</i>') + esc(txt) + '</div>';
      }).join('');
    }
    function play(id, done) {
      const sc = SCENES[id]; if (!sc) { if (done) done(); return; }
      cur = { id, i: -1, done };
      ov.className = ''; ov.classList.add('show');
      ov.innerHTML = '<div class="cTitle">' + esc(sc.t) + '</div><div class="cPage">' + sc.p.map(([kind, desc, lines], n) => {
        const src = IMG['cut_' + id + '_' + (n + 1)];
        return '<div class="cP ' + kind + '">' + (src ? '<img src="' + src + '" alt="">' : '<div class="ph">' + esc(desc) + '</div>') + bubbles(lines) + '</div>';
      }).join('') + '</div><div class="cHint">тапни, чтобы продолжить</div><button class="cSkip">Пропустить ›</button>';
      next();
    }
    let lock = false;
    function next() {
      if (!cur || lock) return;
      const ps = ov.querySelectorAll('.cP');
      if (++cur.i >= ps.length) return end();
      lock = true; setTimeout(() => lock = false, 350);
      ps[cur.i].classList.add('on');
      if (window.U2 && U2.click) U2.click();
    }
    function end() {
      if (!cur) return;
      const c = cur; cur = null; seen[c.id] = 1; saveS();
      ov.classList.add('out'); setTimeout(() => { ov.className = ''; ov.innerHTML = ''; if (c.done) c.done(); }, 400);
    }
    ov.addEventListener('click', e => { e.stopPropagation(); if (e.target.closest('.cSkip')) end(); else next(); }, true);
    ov.addEventListener('pointerdown', e => e.stopPropagation(), true);

    // сцена при открытии функции — до обучения, только на экране боя
    const vis = el => { if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const busy = () => document.querySelector('.pg.show, #camp.show, #sysOv.show, #ui2Pop.show, .askWrap.show, #tutOv.show, #proOv, #sumFx.show, #gdOv.show') || document.body.classList.contains('oldOpen');
    setInterval(() => {
      if (cur || busy() || !vis($('cbCamp'))) return;
      for (const id in SCENES) if (!seen[id] && on(SCENES[id].k)) { play(id); return; }
    }, 700);
    window.CUTS = { play, playing: () => !!cur, pending: k => { for (const id in SCENES) if (SCENES[id].k === k && !seen[id]) return true; return false; }, reset: () => { seen = {}; saveS(); }, SCENES };
  })();
