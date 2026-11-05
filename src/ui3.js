  // ===================== UI 3 (0.69) — по опросу docs/ui/ANSWERS_UI.md =====================
  // Экран боя, профиль, настройки, окна Системы, меню, прокачка, портал, сумка. Работает поверх ui2 (window.U2).
  (function () {
    const U = window.U2;
    const RC3 = { E: '#9a96a6', D: '#c8783a', C: '#2fd07a', B: '#3a8cff', A: '#b04dff', S: '#ffb52e', SS: '#ff3a4a', SSS: '#9fe6ff', GOD: '#fff2a0' };
    const RANK3 = CFG.rarities;
    const mk = (tag, id, cls, html, parent) => { const n = document.createElement(tag); if (id) n.id = id; if (cls) n.className = cls; if (html != null) n.innerHTML = html; if (parent) parent.appendChild(n); return n; };
    const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const vib = ms => { if (navigator.vibrate && setg.vibro === 'on') try { navigator.vibrate(ms); } catch (e) {} };

    // ---------- профиль игрока (имя, аватар) — отдельно от сохранения ядра ----------
    const PROF_KEY = 'prizvannyy_profile';
    const prof = { name: '', changes: 0, avatar: '', seenNew: {} };
    try { Object.assign(prof, JSON.parse(localStorage.getItem(PROF_KEY) || '{}')); } catch (e) {}
    const saveProf = () => { try { localStorage.setItem(PROF_KEY, JSON.stringify(prof)); } catch (e) {} };
    const NAME_COST = 20;   // смена имени со второго раза — 🎟 билеты портала (TBD)

    // ---------- окно Системы (ответы 149, 150): текст печатается по буквам, иногда глитч ----------
    const ov = mk('div', 'sysOv', '', '<div class="sysWin"></div>', document.body);
    const win = ov.firstChild;
    let twTimer = 0;
    function sys(o) {
      clearInterval(twTimer);
      win.className = 'sysWin' + (Math.random() < 0.35 || o.glitch ? ' glitch' : '');
      win.innerHTML = (o.title ? '<h3>' + o.title + '</h3>' : '') + (o.text ? '<p class="tw"></p>' : '') + (o.html || '') +
        '<div class="btns">' + (o.btns || [{ t: 'OK' }]).map((b, i) => '<button class="sysBtn' + (b.red ? ' red' : '') + '" data-i="' + i + '"' + (b.dis ? ' disabled' : '') + '>' + b.t + '</button>').join('') + '</div>';
      ov.classList.add('show'); void win.offsetWidth;
      const tw = win.querySelector('.tw');
      if (tw) { let i = 0; const T = o.text; twTimer = setInterval(() => { i += 2; tw.textContent = T.slice(0, i); if (i >= T.length) { clearInterval(twTimer); tw.classList.add('done'); } }, 18); }
      win.onclick = e => {
        const b = e.target.closest('[data-i]'); if (!b) { if (tw && !tw.classList.contains('done')) { clearInterval(twTimer); tw.textContent = o.text; tw.classList.add('done'); } return; }
        const fn = (o.btns || [{}])[+b.dataset.i].fn;
        if (fn && fn(win) === false) return;
        ov.classList.remove('show'); U.click();
      };
      if (o.onShow) o.onShow(win);
    }
    window.U3 = { sys };
    // старые окна подтверждения и отчёта — в стиле Системы
    ['ask', 'away'].forEach(id => { const b = $(id) && $(id).querySelector('.box, .askBox, div'); if (b) b.classList.add('sysWin'); });

    // ==================================================================
    // ЭКРАН БОЯ
    // ==================================================================
    const game = $('game'), arena = el.arena, tb = $('topBar');
    // профиль: заменяем старый обработчик (ui2 открывал «Прокачку»)
    const oldProf = $('tbProf'), profBtn = oldProf.cloneNode(true); oldProf.replaceWith(profBtn);
    profBtn.addEventListener('click', e => { e.stopPropagation(); U.press(profBtn); openProfile('me'); });
    const who = mk('div', 'tbWho', '', '<b></b><small></small>', game);
    const mail = mk('button', 'tbMail', '', '✉<i></i>', tb); mail.setAttribute('aria-label', 'Почта и награды');
    mail.addEventListener('click', e => { e.stopPropagation(); U.press(mail); U.home(); U.openOld('inbox'); });
    const buffBox = mk('div', 'tbBuffs', '', '', tb.querySelector('.tbR'));
    // плашка этажа → карта (стрелки убраны)
    $('floorRow').addEventListener('click', e => { if (s.mode) return; U.press($('floorRow')); U.home(); U.open('map'); });
    // имя врага + значок + круглый таймер
    const nameRow = mk('div', 'nameRow', '', '<span class="bIco">💀</span>');
    el.enemyName.parentNode.insertBefore(nameRow, el.enemyName); nameRow.appendChild(el.enemyName);
    const ring = mk('div', 'bossRing', '', '<svg viewBox="0 0 36 36"><circle class="bg" cx="18" cy="18" r="14"/><circle class="fg" cx="18" cy="18" r="14" stroke-dasharray="87.96" stroke-dashoffset="0"/></svg><b></b>', nameRow);
    const ringFg = ring.querySelector('.fg'), ringT = ring.querySelector('b');
    // белый след HP
    const trail = mk('div', 'hpTrail'); $('hpBar').insertBefore(trail, el.hpFill);
    el.bossBtn.textContent = 'Вызвать босса';
    const plate = mk('div', 'bigPlate', '', '', arena);
    const cut = mk('div', 'ultCut', '', '', arena);
    // ульта главного героя — полоса под ним
    const hu = mk('div', 'heroUlt', '', '<i></i><b></b>', heroEl);
    const huFill = hu.querySelector('i'), huTxt = hu.querySelector('b');
    mk('div', '', 'ring3', '', heroEl).style.setProperty('--rc', '#b14dff');
    // маленькие боковые кнопки: портал (справа), событие (слева)
    function smBtn(id, ico, label) {
      const b = mk('button', id, 'cBtn sm', '<span class="fr"></span><i class="gem a"></i><i class="gem b"></i><i class="gem c"></i><i class="gem d"></i><span class="ico">' + ico + '</span><i class="bang"></i>');
      b.setAttribute('aria-label', label); $('cbMenu').parentNode.appendChild(b); return b;
    }
    const pBtn = smBtn('cbPortal', '🌀', 'Портал призыва');
    pBtn.addEventListener('click', e => { e.stopPropagation(); U.press(pBtn); U.home(); U.openX('portal'); });
    const evBtn = smBtn('cbEvent', '🏮', 'Событие недели'); mk('small', '', '', '', evBtn);
    evBtn.addEventListener('click', e => { e.stopPropagation(); U.press(evBtn); U.home(); U.openOld('events'); });

    // союзники: ромбики ульт и круги по редкости
    function decorAllies() {
      for (const a of CFG.allies) {
        const u = allyUi[a.id]; if (!u || u.dia) continue;
        u.dia = mk('div', '', 'ultDia', '<b></b><b></b><b></b><b></b>', u.sprite);
        u.dia.style.setProperty('--uc', u.color);
        mk('div', '', 'ring3', '', u.sprite).style.setProperty('--rc', RC3[a.rarity] || '#b14dff');
      }
    }
    decorAllies();

    // ---------- крупные плашки ----------
    let plateT = 0;
    function bigPlate(t, sub, color, opt) {
      opt = opt || {};
      plate.className = (opt.small ? 'small' : '') + (opt.full ? ' full' : '');
      plate.style.setProperty('--pc', color || '#b14dff'); plate.style.setProperty('--pd', (opt.dur || 1.4) + 's');
      plate.innerHTML = '<div class="t">' + t + '</div>' + (sub ? '<small>' + sub + '</small>' : '');
      void plate.offsetWidth; plate.classList.add('show');
      clearTimeout(plateT); plateT = setTimeout(() => plate.classList.remove('show'), (opt.dur || 1.4) * 1000);
    }
    // ---------- ульта союзника: арт, затемнение ----------
    let lastCut = 0;
    function ultCut(id) {
      if (setg.fx === 'off' || performance.now() - lastCut < 4000) return; lastCut = performance.now();
      const A = HERO_ART[id], u = allyUi[id];
      const src = A && (A.side || A.back || A.avatar);
      cut.style.setProperty('--uc', u ? u.color : '#b14dff');
      cut.innerHTML = '<div class="stripe"></div>' + (src ? '<img src="' + src + '" alt="">' : '');
      cut.classList.remove('show'); void cut.offsetWidth; cut.classList.add('show');
      setTimeout(() => cut.classList.remove('show'), 1100);
    }
    // ---------- монеты летят к счётчику ----------
    function coins() {
      if (setg.fx === 'off' || document.body.classList.contains('pageOpen')) return;
      const q = el.enemy.getBoundingClientRect(), g = $('tbGold').getBoundingClientRect();
      const n = setg.fx === 'less' ? 3 : 6, tx = g.left + 12, ty = g.top + g.height / 2;
      for (let i = 0; i < n; i++) {
        const c = mk('div', '', 'flyCoin', '', document.body);
        const x = q.left + q.width / 2 + Math.random() * 70 - 35, y = q.top + q.height * 0.65 + Math.random() * 30 - 15;
        c.style.left = x + 'px'; c.style.top = y + 'px';
        c.style.transitionDelay = (i * 45) + 'ms, ' + (480 + i * 45) + 'ms';
        requestAnimationFrame(() => requestAnimationFrame(() => { c.style.transform = 'translate(' + (tx - x) + 'px,' + (ty - y) + 'px) scale(.7)'; c.style.opacity = '0'; }));
        setTimeout(() => c.remove(), 800 + i * 45);
      }
      setTimeout(() => { const t = $('tbGold').parentNode; t.classList.remove('pop'); void t.offsetWidth; t.classList.add('pop'); }, 560);
    }

    // ---------- обёртка обработчика событий ядра ----------
    const handle0 = handle;
    let combo = 0;
    handle = function (events, x, y) {
      if (x == null) {   // удары «Шквала» и автоудары идут без точки касания — бьём по телу врага
        const r = arena.getBoundingClientRect(), q = el.enemy.getBoundingClientRect();
        x = q.left - r.left + q.width * (0.3 + Math.random() * 0.4); y = q.top - r.top + q.height * (0.35 + Math.random() * 0.3);
      }
      for (const e of events) if (e.type === 'hit' && e.source === 'tap') { combo = (combo + 1) % 3; heroEl.dataset.combo = combo; }
      handle0(events, x, y);
      const r = arena.getBoundingClientRect();
      for (const e of events) {
        if (e.type === 'hit' && !e.blocked) {
          if (e.crit) { el.enemy.classList.add('flash'); clearTimeout(el.enemy._ft); el.enemy._ft = setTimeout(() => el.enemy.classList.remove('flash'), 90); if (e.source === 'tap') vib(20); }
          const u = allyUi[e.source];
          if (u && setg.fx === 'full') {   // у каждого союзника — свой цвет стихии
            const q = el.enemy.getBoundingClientRect(), d = mk('div', '', 'elemHit', '', arena);
            d.style.left = (q.left - r.left + q.width * (0.25 + Math.random() * 0.5)) + 'px'; d.style.top = (q.top - r.top + q.height * (0.3 + Math.random() * 0.4)) + 'px';
            d.style.setProperty('--ec', u.color); setTimeout(() => d.remove(), 360);
          }
        } else if (e.type === 'kill' && !e.mode) coins();
        else if (e.type === 'spawn' && s.enemy.isBoss && !s.mode) {
          if (s.enemy.final) bigPlate('МЕГА-БОСС', s.enemy.name, '#ffd36b', { full: true, dur: 1.8 });
          else bigPlate('СТРАЖ', s.enemy.name, '#ff4a4a', { full: true, dur: 1.2 });
        } else if (e.type === 'bossFail') { bigPlate('ВРЕМЯ ВЫШЛО', 'Усилься и вызови босса снова', '#ff3a3a', { dur: 1.8 }); vib(60); }
        else if (e.type === 'ult') ultCut(e.id);
      }
    };

    // ---------- ульта главного героя: заряд от быстрых тапов (память: только быстрые тапы, при паузе убывает) ----------
    const ULT = { per: 0.034, idle: 0.6, decay: 0.35 };
    let charge = 0, lastTap = 0;
    arena.addEventListener('pointerdown', e => {
      if (e.target.closest('#farmBar') || e.target.closest('#modeBar')) return;
      if (s.abilities.flurry.active > 0) return;
      lastTap = performance.now(); charge = Math.min(1, charge + ULT.per);
    }, true);

    // ---------- живое обновление (каждые 50 мс) ----------
    let lastFloor = s.floor, lastPct = 1, lastT = performance.now(), buffHtml = '';
    function live() {
      const now = performance.now(), dt = Math.min(0.2, (now - lastT) / 1000); lastT = now;
      const en = s.enemy, fl = s.abilities.flurry, flDef = CFG.abilities.find(a => a.id === 'flurry');
      // ульта: «Шквал ударов» запускается только зарядом; «Клеймо охотника» — само
      fl.auto = false; if (s.abilities.hunt) s.abilities.hunt.auto = true;
      const unlocked = C.abilityUnlocked(s, 'flurry');
      if (fl.active > 0) { huFill.style.width = (fl.active / flDef.duration * 100) + '%'; charge = 0; }
      else {
        if (now - lastTap > ULT.idle * 1000) charge = Math.max(0, charge - ULT.decay * dt);
        if (charge >= 1 && unlocked && en.alive) { fl.cd = 0; const ev = C.useAbility(s, 'flurry'); if (ev.length) { handle(ev); charge = 0; vib(40); } }
        huFill.style.width = (charge * 100) + '%';
      }
      hu.classList.toggle('active', fl.active > 0); hu.classList.toggle('full', charge >= 0.98);
      huTxt.textContent = unlocked ? (fl.active > 0 ? flDef.name.toUpperCase() + '!' : '') : 'ульта с ' + flDef.unlockFloor + ' этажа';
      arena.classList.toggle('ultOn', fl.active > 0);
      // HP: белый след
      const pct = en && B.gt(en.maxHp, 0) ? Math.max(0, B.toNum(B.div(en.hp, en.maxHp))) : 0;
      if (pct > lastPct + 0.001) { trail.classList.add('snap'); trail.style.width = pct * 100 + '%'; void trail.offsetWidth; trail.classList.remove('snap'); }
      else trail.style.width = pct * 100 + '%';
      lastPct = pct; el.hpFill.style.width = pct * 100 + '%';
      // круглый таймер босса
      const timed = s.mode ? (s.mode.kind !== 'endless' || en.isBoss) : en.isBoss;
      ring.classList.toggle('on', !!timed);
      if (timed) {
        const p = Math.max(0, Math.min(1, s.bossTimeLeft / (s.mode ? s.mode.timeMax : C.bossTime(s))));
        ringFg.setAttribute('stroke-dashoffset', (87.96 * (1 - p)).toFixed(1)); ringT.textContent = Math.ceil(Math.max(0, s.bossTimeLeft));
        ring.classList.toggle('low', s.bossTimeLeft < 5);
      }
      // ромбики ульт отряда
      for (const a of CFG.allies) {
        const u = allyUi[a.id]; if (!u || !u.dia) continue;
        const st = s.allies[a.id], p = st.level > 0 ? Math.min(1, st.ult / a.ult.charge) : 0, n = Math.floor(p * 4 + 1e-6);
        const k = n + (p >= 1 ? 'r' : '');
        if (u.dia._k !== k) { u.dia._k = k; [...u.dia.children].forEach((b, i) => b.classList.toggle('on', i < n)); }
      }
      // новый этаж — короткая плашка
      if (s.floor !== lastFloor) { if (!s.mode && !(en.isBoss)) bigPlate('ЭТАЖ ' + s.floor, null, '#b14dff', { small: true, dur: 1.1 }); lastFloor = s.floor; }
      // баффы под золотом
      const parts = [];
      for (const b of BUFF_UI) { const left = s.buffs[b.key]; if (left > 0) parts.push('<span style="color:' + b.color + '">⚡' + Math.ceil(left) + 'с</span>'); }
      if (s.abilities.hunt && s.abilities.hunt.active > 0) parts.push('<span style="color:#ffb36b">🎯' + Math.ceil(s.abilities.hunt.active) + 'с</span>');
      for (const p of CFG.alchemy.potions) if (s.potions[p.id] > 0) parts.push('<span>' + p.icon + Math.ceil(s.potions[p.id] / 60) + 'м</span>');
      const bh = parts.join('');
      if (bh !== buffHtml) { buffBox.innerHTML = bh; buffHtml = bh; }
    }
    setInterval(live, 50);

    // ---------- обновление после render() ----------
    let syncN = 0;
    function sync() {
      const en = s.enemy;
      nameRow.classList.toggle('boss', !!en.isBoss);
      nameRow.querySelector('.bIco').textContent = en.final ? '👑' : '💀';
      if (en.isBoss && !(s.mode && s.mode.kind === 'trial')) el.enemyName.textContent = en.name;
      $('hud').classList.toggle('mega', !!(en.isBoss && en.final));
      // профиль: имя, титул, кольцо опыта, рамка, аватар
      const L = C.prestigeLevel(s), a = C.prestigeNeed(L), b = C.prestigeNeed(L + 1), xp = C.prestigeXp(s);
      profBtn.style.setProperty('--xp', Math.max(0, Math.min(1, (xp - a) / Math.max(1, b - a))).toFixed(3));
      const fi = s.frame ? CFG.prestige.frames.indexOf(s.frame) : -1;
      profBtn.classList.toggle('fr1', fi >= 0 && fi < 4); profBtn.classList.toggle('fr2', fi >= 4 && fi < 8); profBtn.classList.toggle('fr3', fi >= 8);
      who.firstChild.textContent = prof.name || 'Призванный';
      who.lastChild.textContent = s.title ? '«' + s.title + '»' : '';
      const img = profBtn.querySelector('img'), av = avatarSrc();
      if (img.getAttribute('src') !== av) img.setAttribute('src', av);
      const inb = +($('inboxCnt').textContent || 0); const mi = mail.querySelector('i'); mi.textContent = inb; mi.classList.toggle('on', inb > 0);
      // событие недели — значок с таймером до конца недели
      const ce = C.currentEvent(s); evBtn.style.display = ce ? '' : 'none';
      if (ce && !(syncN++ % 20)) { evBtn.querySelector('.ico').textContent = ce.icon || '🏮'; evBtn.querySelector('small').textContent = weekLeft(); }
      // кнопки открываются постепенно (ответ 163): портал — после первого героя-союзника, событие — с 10 этажа, PvE — с 15
      evBtn.style.display = 'none';   // 0.74: события — в книге
      decorAllies();
    }
    function weekLeft() {
      const d = new Date(), end = new Date(d); end.setHours(24, 0, 0, 0); end.setDate(end.getDate() + ((8 - end.getDay()) % 7));
      const h = Math.max(0, Math.round((end - d) / 3600000));
      return h >= 24 ? Math.floor(h / 24) + 'д ' + (h % 24) + 'ч' : h + 'ч';
    }
    function avatarSrc() {
      const A = prof.avatar && HERO_ART[prof.avatar];
      return (A && A.avatar) || (document.querySelector('#cards .cardIcon img') || {}).src || '';
    }
    const render0 = render;
    render = function () { render0(); sync(); };

    // ==================================================================
    // ПРОФИЛЬ (ответы 25–40): Игрок · Титулы и рамки · Облики · Статистика · Хроника
    // ==================================================================
    const pg = mk('div', 'pgProf', 'pg', '<div class="tower"></div><div class="pgHead" style="padding-top:calc(env(safe-area-inset-top) + 8px)"><button class="backBtn" aria-label="Назад">←</button><div class="titlePl">Профиль</div></div>' +
      '<div class="pgTabs" id="pfTabs" style="grid-template-columns:repeat(5,1fr)"></div><div class="pgBody" id="pfBody"></div>', $('cbMenu').parentNode);
    let pTab = 'me';
    const PT = [['me', '👤', 'Игрок'], ['tit', '🎖', 'Титулы'], ['skin', '🎭', 'Облики'], ['st', '📊', 'Статистика'], ['chr', '📖', 'Хроника']];
    pg.querySelector('.backBtn').addEventListener('click', () => { U.click(); U.show(null); });
    function openProfile(t) { pTab = t || pTab; U.home(); U.show('pgProf'); renderProf(); $('pfBody').scrollTop = 0; }
    // хроника — сцены из docs/CUTSCENES.md (первый цикл); открываются рекордом этажа
    const CHR = [[0, 'Пролог — «Приглашение»'], [1, 'Гнилые катакомбы — «Голодная»'], [50, 'Хранитель Врат'], [51, 'Пепельные шахты — «Пепел миров»'], [101, 'Лес теней — «Тот, кто не ушёл»'],
      [151, 'Ледяная цитадель — «Спасение»'], [201, 'Затопленный храм — «Молитва»'], [251, 'Кровавая арена — «Другие призванные»'], [301, 'Пустотные врата — «Трещина»'],
      [351, 'Престол Башни — «Трон»'], [400, 'Первый Призыватель'], [-1, 'Первый ритуал — «Жертва»'], [401, 'Ржавые механизмы — «Часовщик»'], [451, 'Небесный сад — «Рай»'],
      [501, 'Склеп королей — «Мой король»'], [551, 'Грибные гроты — «Корни»'], [601, 'Обсидиановая кузня — «Союз»'], [651, 'Зеркальный лабиринт — «Двойник»'],
      [701, 'Чумные палаты — «Переваривание»'], [751, 'Песчаный некрополь — «Доеденный мир»'], [801, 'Грозовой шпиль — «Столкновение»'], [851, 'Сады плоти — «Новое тело»'],
      [901, 'Звёздная обсерватория — «Карта»'], [951, 'Сердце Башни — «Пульс»']];
    function renderProf() {
      $('pfTabs').innerHTML = PT.map(([id, ic, nm]) => '<button data-pt="' + id + '" class="' + (id === pTab ? 'on' : '') + '"><b>' + ic + '</b>' + nm + '</button>').join('');
      const L = C.prestigeLevel(s), a = C.prestigeNeed(L), b = C.prestigeNeed(L + 1), xp = C.prestigeXp(s), p = Math.max(0, Math.min(1, (xp - a) / Math.max(1, b - a)));
      let h = '';
      if (pTab === 'me') {
        const un = L - s.prestigeClaimed, st = s.stats;
        h += '<div class="pfHead"><div class="pfAva" style="--xp:' + p.toFixed(3) + '"><img src="' + avatarSrc() + '" alt=""><i>Ур. ' + L + '</i></div><div style="flex:1;min-width:0">' +
          '<div class="pfName">' + esc(prof.name || 'Призванный') + '</div><div class="pfTitle">' + (s.title ? '«' + s.title + '»' : 'без титула') + (s.frame ? ' · рамка: ' + s.frame : '') + '</div>' +
          '<div class="pfXp"><i style="width:' + (p * 100).toFixed(1) + '%"></i></div><div class="pfXpT">опыт ' + fmt(xp) + ' / ' + fmt(b) + '</div></div></div>';
        h += '<div class="rowList">' + (un > 0 ? '<button data-pa="prest" class="on"><span>🎁 Награды престижа<small>' + un + ' ур. не забрано</small></span><b>Забрать</b></button>' : '') +
          '<button data-pa="name"><span>✏ Сменить имя<small>' + (prof.changes ? 'стоимость 🎟 ' + NAME_COST : 'первый раз бесплатно') + '</small></span><b>›</b></button>' +
          '<button data-pa="ava"><span>🖼 Сменить портрет<small>любой открытый герой</small></span><b>›</b></button></div>';
        h += '<div class="grpT">РЕКОРДЫ</div><div class="statGrid">' +
          [['Рекорд этажа', fmt(s.bestFloor)], ['Время в игре', playTimeTxt(st.playTime)], ['Врагов побеждено', fmt(st.kills)], ['Тапов', fmt(st.taps)],
           ['Боссов побеждено', fmt(st.bossKills)], ['Ритуалов', fmt(s.rituals)], ['Трофеев боссов', s.trophies.length + ' / ' + C.allTrophies().length], ['Титулов', s.titles.length + ' / ' + C.allTitles().length]]
            .map(c => '<div>' + c[0] + '<b>' + c[1] + '</b></div>').join('') + '</div>';
        if (s.trophies.length) h += '<div class="grpT">ТРОФЕИ БОССОВ</div><div class="rowList">' + s.trophies.slice(-12).reverse().map(k => '<div><span>' + (k.endsWith(':f') ? '👑 ' : '🏆 ') + C.trophyName(k) + '</span></div>').join('') + '</div>';
      } else if (pTab === 'tit') {
        h += '<div class="grpT">ТИТУЛ' + (s.title ? ' · «' + s.title + '»' : '') + '</div><div class="hint3">Бонусы всех полученных титулов действуют всегда. Выбранный виден у портрета.</div><div class="rowList">';
        for (const m of C.allTitles()) {
          const own = s.titles.includes(m.title), cur = s.title === m.title;
          h += own ? '<button data-ti="' + esc(m.title) + '" class="' + (cur ? 'on' : '') + '"><span>' + (cur ? '✦ ' : '') + m.title + '<small>' + titleBonusTxt(m) + '</small></span><b>' + (cur ? 'выбран' : 'выбрать') + '</b></button>'
            : '<div class="lock"><span>🔒 ' + m.title + '<small>' + titleBonusTxt(m) + ' · ' + (m.src === 'ritual' ? 'ритуал №' + m.n : 'достижение «' + m.ach.name + '»') + '</small></span></div>';
        }
        const fr = C.prestigeFrames(s);
        h += '</div><div class="grpT">РАМКИ ПОРТРЕТА</div><div class="hint3">Новая рамка — каждые ' + CFG.prestige.frameEvery + ' уровней престижа.</div><div class="rowList">' +
          '<button data-fr="" class="' + (!s.frame ? 'on' : '') + '"><span>Без рамки</span></button>' +
          CFG.prestige.frames.map(f => fr.includes(f) ? '<button data-fr="' + f + '" class="' + (s.frame === f ? 'on' : '') + '"><span style="color:' + (FRAME_COL[f] || '#fff') + '">◆ ' + f + '</span><b>' + (s.frame === f ? 'выбрана' : 'выбрать') + '</b></button>'
            : '<div class="lock"><span>🔒 ' + f + '</span></div>').join('') + '</div>';
      } else if (pTab === 'skin') {
        h += '<div class="hint3">Облик главного героя меняется с прогрессом сам. Открытые облики можно посмотреть здесь.</div><div class="rowList">' +
          '<div class="on"><span>⚔ Призванный · тёмная сталь<small>начальный облик</small></span><b>сейчас</b></div>' +
          (s.skins.includes('eternal') ? '<div><span>✦ Вечный призванный<small>открыт ритуалами</small></span><b>открыт</b></div>' : '<div class="lock"><span>🔒 Вечный призванный<small>награда за ритуалы</small></span></div>') +
          '<div class="lock"><span>🔒 Новые облики<small>появятся вместе с артом героя</small></span></div></div>';
      } else if (pTab === 'st') {
        renderStats(); const g = $('statsTab').querySelector('.stGrid');
        h += '<div class="statGrid">' + (g ? [...g.children].map(c => '<div>' + c.firstChild.textContent + '<b>' + c.lastChild.textContent + '</b></div>').join('') : '') + '</div>';
      } else {
        const best = s.bestFloor;
        h += '<div class="hint3">Пересмотр катсцен. Картинки появятся после генерации арта — пока текст сцены.</div><div class="rowList">' +
          CHR.map(([f, nm], i) => { const open = f === -1 ? s.rituals > 0 : best >= Math.max(1, f);
            return open ? '<button data-chr="' + i + '"><span>▶ ' + nm + '</span><b>смотреть</b></button>' : '<div class="lock"><span>🔒 ' + nm + '<small>' + (f === -1 ? 'после первого ритуала' : 'этаж ' + f) + '</small></span></div>'; }).join('') + '</div>';
      }
      $('pfBody').innerHTML = h;
    }
    pg.addEventListener('click', e => {
      const t = e.target.closest('[data-pt]'); if (t) { U.click(); pTab = t.dataset.pt; renderProf(); return; }
      const b = e.target.closest('button'); if (!b) return;
      const d = b.dataset;
      if (d.pa === 'prest') { const r = C.claimPrestige(s); if (r) { sys({ title: 'УРОВЕНЬ ПОВЫШЕН', text: 'Престиж +' + r.levels + '. Получено: ' + rewardLine(r.reward) + '.' }); save(); } }
      else if (d.pa === 'name') askName(false);
      else if (d.pa === 'ava') pickAvatar();
      else if (d.ti !== undefined) { if (C.setTitle(s, d.ti)) save(); }
      else if (d.fr !== undefined) { if (C.setFrame(s, d.fr || null)) save(); }
      else if (d.chr !== undefined) { const c = CHR[+d.chr]; sys({ title: c[1], text: 'Сцена из Хроники. Комикс-панели появятся, когда будет готов арт катсцен (docs/CUTSCENES.md).' }); }
      else return;
      U.click(); render(); renderProf();
    });
    function askName(first) {
      const paid = !first && prof.changes > 0;
      sys({ title: first ? 'ВАШЕ ИМЯ' : 'СМЕНА ИМЕНИ', text: first ? 'Башня зарегистрировала нового игрока. Назовите себя, Призванный.' : (paid ? 'Смена имени стоит 🎟 ' + NAME_COST + '.' : 'Первая смена — бесплатно.'),
        html: '<input class="sysIn" maxlength="16" placeholder="Имя (2–16 символов)" value="' + esc(prof.name || '') + '">',
        btns: [...(first ? [] : [{ t: 'Отмена' }]), { t: 'Готово', fn: w => {
          const v = w.querySelector('input').value.trim().replace(/\s+/g, ' ');
          if (v.length < 2) { w.querySelector('input').style.borderColor = '#ff4a4a'; return false; }
          if (v === prof.name) return;
          if (paid) { if (s.tickets < NAME_COST) { toast('Не хватает билетов<small>нужно 🎟 ' + NAME_COST + '</small>'); return false; } s.tickets -= NAME_COST; save(); }
          if (!first) prof.changes++;
          prof.name = v; saveProf(); render(); if (pg.classList.contains('show')) renderProf();
          if (first) setTimeout(() => { tutorial(false); }, 400);
        } }],
        onShow: w => setTimeout(() => { const i = w.querySelector('input'); if (i) i.focus(); }, 300) });
    }
    function pickAvatar() {
      const ids = CFG.allies.filter(a => s.heroes[a.id] && s.heroes[a.id].unlocked && HERO_ART[a.id] && HERO_ART[a.id].avatar).map(a => a.id);
      const def = (document.querySelector('#cards .cardIcon img') || {}).src || '';
      sys({ title: 'ПОРТРЕТ', html: '<div class="pickGrid" style="margin-top:8px"><button data-av="" class="' + (!prof.avatar ? 'on' : '') + '"><img src="' + def + '"></button>' +
        ids.map(id => '<button data-av="' + id + '" class="' + (prof.avatar === id ? 'on' : '') + '"><img src="' + HERO_ART[id].avatar + '"></button>').join('') + '</div>' +
        (ids.length ? '' : '<p class="hint3">Портреты откроются вместе с героями, у которых уже есть арт.</p>'),
        btns: [{ t: 'Закрыть' }],
        onShow: w => w.querySelector('.pickGrid').addEventListener('click', e => { const b = e.target.closest('[data-av]'); if (!b) return; prof.avatar = b.dataset.av; saveProf(); U.click();
          w.querySelectorAll('[data-av]').forEach(x => x.classList.toggle('on', x === b)); render(); if (pg.classList.contains('show')) renderProf(); }) });
    }
    // первый запуск — имя (ответ лора: имя даёт игрок)
    if (!prof.name) setTimeout(() => askName(true), 1500); else setTimeout(() => window.U3.tutorial && window.U3.tutorial(false), 1200);
    // повышение уровня аккаунта — окно Системы (ответы 39, 40)
    let lastL = C.prestigeLevel(s);
    setInterval(() => { const L = C.prestigeLevel(s); if (L > lastL) { lastL = L; sys({ title: 'УРОВЕНЬ ПОВЫШЕН', text: 'Уровень аккаунта: ' + L + '. Награды престижа ждут в профиле.', btns: [{ t: 'Забрать', fn: () => { const r = C.claimPrestige(s); if (r) { toast('Престиж +' + r.levels + '<small>' + rewardLine(r.reward) + '</small>'); save(); render(); } } }, { t: 'Позже' }] }); } }, 2000);


    // ==================================================================
    // СТРАНИЦА ГЕРОЯ (ответы 63–79): большой арт, свайп между героями, 4 вкладки
    // ==================================================================
    const hp = mk('div', 'pgHero', 'pg', '<div class="tower"></div><div class="pgHead" style="padding-top:calc(env(safe-area-inset-top) + 8px)"><button class="backBtn" aria-label="Назад">←</button><div class="titlePl">Герой</div></div><div class="pgBody" id="hvBody"></div>', $('cbMenu').parentNode);
    let hvId = null, hvTab = 'lv';
    const HVT = () => [['lv', 'Уровень'], ['st', 'Звёзды'], ...(C.unlockedAt(s, 'bones') ? [['bn', 'Кости']] : []), ['sk', 'Умения']];
    hp.querySelector('.backBtn').addEventListener('click', () => { U.click(); hp.classList.remove('show'); U.sec('up'); });
    function hvList() { return CFG.allies.filter(a => s.heroes[a.id].unlocked).map(a => a.id); }
    function openHero(id) { hvId = id; U.show('pgHero'); renderHero(); $('hvBody').scrollTop = 0; }
    function renderHero() {
      const a = CFG.allies.find(x => x.id === hvId); if (!a) return;
      const h = s.heroes[a.id], st = s.allies[a.id], A = HERO_ART[a.id], v = ALLY_VIS[a.id] || {}, rc = RC3[a.rarity];
      let o = '<div class="hvArt" style="--rc:' + rc + '">' + (A && (A.side || A.back) ? '<img src="' + (A.side || A.back) + '" alt="">' : '<div class="big">' + (v.icon || '✦') + '</div>') +
        '<button class="nav l" data-hn="-1">‹</button><button class="nav r" data-hn="1">›</button></div>' +
        '<div class="hvName" style="--rc:' + rc + '">' + a.name + '</div><div class="hvSub"><b style="color:' + rc + '">' + a.rarity + '</b> · ★' + h.stars + ' · ' + a.side + ' / ' + a.faction + ' · ' + C.roleOf(a) + (C.inSquad(s, a.id) ? ' · в отряде' : '') + '</div>' +
        '<div class="hvTabs">' + HVT().map(([k, n]) => '<button data-ht="' + k + '" class="' + (k === hvTab ? 'on' : '') + '">' + n + '</button>').join('') + '</div>';
      if (hvTab === 'lv') {
        const lv = st.level, cap = C.allyCap(s, a.id), u = allyUi[a.id];
        o += '<div class="statGrid"><div>Уровень<b>' + fmt(lv) + ' / ' + fmt(cap) + '</b></div><div>DPS<b>' + (lv ? fmt(B.mul(C.allyDps(s, a.id), C.permMult(s, 'ally'))) : '—') + '</b></div>' +
          '<div>Удар раз в<b>' + a.attackInterval + ' с</b></div><div>Ранг<b>' + C.rankLabel(h.rank).rank + '</b></div></div>' +
          '<div style="display:flex;gap:8px;justify-content:center;margin:10px 0"><button class="upBtn" data-hbuy' + (u.btn.disabled ? ' disabled' : '') + ' style="width:auto;padding:4px 18px">' + u.btn.innerHTML + '</button>' +
          '</div>';
        const nx = C.nextMilestone(lv), ms = []; let m = nx; for (let i = 0; i < 4; i++) { ms.push(m); m = C.nextMilestone(m); }
        o += '<div class="grpT">ВЕХИ УРОВНЯ · ×' + CFG.milestoneMult + ' УРОНА</div><div class="rowList">' + ms.map((m, i) => '<div class="' + (i ? 'lock' : 'on') + '"><span>Ур. ' + fmt(m) + '<small>' + (i ? '' : 'осталось ' + fmt(m - lv) + ' ур.') + '</small></span><b>×' + CFG.milestoneMult + '</b></div>').join('') + '</div>';
      } else if (hvTab === 'st') {
        const sc = C.starCost(s, a.id), ec = C.evoCost(s, a.id);
        o += '<div class="statGrid"><div>Звёзды<b>★ ' + h.stars + ' / ' + CFG.maxStars + '</b></div><div>Копий<b>' + h.copies + (sc != null ? ' / ' + sc : '') + '</b></div></div>' +
          '<div style="text-align:center;margin:10px 0"><button class="upBtn" data-hstar' + (sc != null && h.copies >= sc ? '' : ' disabled') + ' style="width:auto;padding:4px 18px">' + (sc == null ? 'Максимум звёзд' : 'Повысить звезду<span>копий ' + sc + '</span>') + '</button></div>' +
          '';   // 0.74: пробуждение убрано (ответ 43)
      } else if (hvTab === 'bn') {
        const SL = CFG.bones.slots, POS = { head: [50, 8], chest: [50, 40], armR: [16, 40], armL: [84, 40], legR: [32, 84], legL: [68, 84] };
        o += '<div class="skel"><div class="sil">💀</div>' + SL.map(sl => { const b = s.bones.find(q => q.on === a.id && q.slot === sl.id);
          return '<button data-bslot="' + sl.id + '" class="' + (b ? 'has' : '') + '" style="left:' + POS[sl.id][0] + '%;top:' + POS[sl.id][1] + '%;' + (b ? '--rc:' + RC3[RANK3[b.tier]] : '') + '">' + sl.icon + '<small>' + (b ? RANK3[b.tier] + ' ур.' + b.lvl : sl.name) + '</small></button>'; }).join('') + '</div>' +
          '<div style="text-align:center;margin:18px 0 8px"><button class="upBtn" data-hbest style="width:auto;padding:4px 18px">Надеть лучшее</button></div>' +
          '<div class="grpT">САМОЦВЕТЫ</div><div class="rowList"><div class="lock"><span>🔒 10 гнёзд самоцветов<small>система на паузе — появится в следующих версиях</small></span></div></div>';
      } else {
        const ut = { nuke: 'мощный удар по врагу', teamBuff: 'усиление всего отряда', mark: 'метка: враг получает больше урона', tapBuff: 'усиление тапов героя' }[a.ult.kind] || a.ult.kind;
        o += '<div class="rowList"><button data-skill="ult"><span>⚡ ' + a.ult.name + '<small>ульта · заряд ' + a.ult.charge + ' ударов</small></span><b>i</b></button>' +
          '<button data-skill="atk"><span>⚔ Обычная атака<small>раз в ' + a.attackInterval + ' с</small></span><b>i</b></button>' +
          C.bondsOf(a.id).map(b => '<button data-skill="bond:' + b.id + '"><span>🔗 ' + b.name + '<small>связь</small></span><b>i</b></button>').join('') + '</div>';
        hp._ut = ut;
      }
      $('hvBody').innerHTML = o;
    }
    hp.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b || b.disabled) return;
      const d = b.dataset, a = CFG.allies.find(x => x.id === hvId);
      if (d.ht) hvTab = d.ht;
      else if (d.hn) { const L = hvList(), i = L.indexOf(hvId); hvId = L[(i + +d.hn + L.length) % L.length]; }
      else if (d.hbuy !== undefined) allyUi[hvId].btn.click();
      else if (d.hsq !== undefined) { if (C.inSquad(s, hvId)) C.squadRemove(s, hvId); else if (!C.squadAdd(s, hvId)) { toast('Отряд полон'); return; } save(); }
      else if (d.hstar !== undefined) { if (C.starUp(s, hvId)) { save(); toast('★ ' + s.heroes[hvId].stars + '<small>' + a.name + '</small>'); } }
      else if (d.hevo !== undefined) { const ec = C.evoCost(s, hvId); if (C.evolve(s, hvId)) { save(); sys({ title: ec.name.toUpperCase(), glitch: true, text: a.name + ' пробуждается. Сила героя ×' + ec.mult + '.' }); } }
      else if (d.hbest !== undefined) { bestBonesFor(hvId); save(); }
      else if (d.bslot) { pickBone(d.bslot); return; }
      else if (d.skill) {
        if (d.skill === 'ult') sys({ title: a.ult.name, text: 'Ульта: ' + hp._ut + '. Заряжается от ударов героя (' + a.ult.charge + '), срабатывает сама.' });
        else if (d.skill === 'atk') sys({ title: 'Обычная атака', text: a.name + ' бьёт врага раз в ' + a.attackInterval + ' с. Эффект удара — по стихии героя.' });
        else { const bd = C.bondsOf(a.id).find(x => 'bond:' + x.id === d.skill); if (bd) sys({ title: bd.name, text: (bd.desc || '') + (bd.heroes ? ' Герои: ' + bd.heroes.map(id => (CFG.allies.find(q => q.id === id) || {}).name).join(', ') + '.' : '') + (C.bondActive && C.bondActive(s, bd) ? ' Связь активна.' : '') }); }
        return;
      }
      else return;
      U.click(); render(); renderHero();
    });
    // свайп по арту — следующий / предыдущий герой (ответ 66)
    let hsx = null;
    hp.addEventListener('touchstart', e => { if (e.target.closest('.hvArt')) hsx = e.touches[0].clientX; }, { passive: true });
    hp.addEventListener('touchend', e => { if (hsx == null) return; const dx = e.changedTouches[0].clientX - hsx; hsx = null; if (Math.abs(dx) < 50) return;
      const L = hvList(), i = L.indexOf(hvId); hvId = L[(i + (dx < 0 ? 1 : -1) + L.length) % L.length]; U.click(); renderHero(); });
    function bestBonesFor(id) {
      for (const sl of CFG.bones.slots) {
        const cur = s.bones.find(q => q.on === id && q.slot === sl.id);
        const free = s.bones.filter(q => q.slot === sl.id && !q.on).sort((x, y) => C.boneValue(y) - C.boneValue(x))[0];
        if (free && (!cur || C.boneValue(free) > C.boneValue(cur))) C.equipBone(s, free.id, id);
      }
    }
    function pickBone(slot) {
      const sl = C.boneSlot(slot), cur = s.bones.find(q => q.on === hvId && q.slot === slot), cv = cur ? C.boneValue(cur) : 0;
      const list = s.bones.filter(q => q.slot === slot && q !== cur).sort((x, y) => C.boneValue(y) - C.boneValue(x)).slice(0, 12);
      const pct = v => (v * 100).toFixed(1) + '%';
      sys({ title: sl.icon + ' ' + sl.name, html: '<p class="hint3">' + (cur ? 'Надета: ' + RANK3[cur.tier] + ' ур.' + cur.lvl + ' · ' + pct(cv) : 'Слот пуст') + '</p><div class="rowList">' +
        (list.length ? list.map(q => { const dv = C.boneValue(q) - cv; return '<button data-pb="' + q.id + '"><span><b style="color:' + RC3[RANK3[q.tier]] + '">' + RANK3[q.tier] + '</b> ур.' + q.lvl + (q.on ? ' · на ' + ((CFG.allies.find(x => x.id === q.on) || {}).name || 'герое') : '') +
          '<small>' + pct(C.boneValue(q)) + '</small></span><b class="' + (dv >= 0 ? 'cmpUp' : 'cmpDn') + '">' + (dv >= 0 ? '▲ ' : '▼ ') + pct(Math.abs(dv)) + '</b></button>'; }).join('') : '<div class="lock"><span>Нет костей для этого слота</span></div>') + '</div>',
        btns: [...(cur ? [{ t: 'Снять', fn: () => { C.unequipBone(s, cur.id); save(); render(); renderHero(); } }] : []), { t: 'Закрыть' }],
        onShow: w => w.querySelector('.rowList').addEventListener('click', e => { const b = e.target.closest('[data-pb]'); if (!b) return; C.equipBone(s, +b.dataset.pb, hvId); save(); U.click(); ov.classList.remove('show'); render(); renderHero(); }) });
    }
    window.U3.openHero = openHero;

    // веха уровня — всплывающая плашка «×3 УРОНА!» (ответ 71)
    const msSeen = {};
    function msCheck() {
      const chk = (k, lv) => { const n = C.milestonesReached(lv); if (msSeen[k] != null && n > msSeen[k] && !document.body.classList.contains('pageOpen')) { const d = mk('div', '', 'msPop', '×' + CFG.milestoneMult + ' УРОНА!', game); setTimeout(() => d.remove(), 1200); vib(30); } msSeen[k] = n; };
      chk('hero', s.tapLevel); for (const a of CFG.allies) chk(a.id, s.allies[a.id].level);
    }
    msCheck(); setInterval(msCheck, 300);

    // ==================================================================
    // НАСТРОЙКИ — полноэкранная страница (ответы 137–148)
    // ==================================================================
    const SDEF = { rig: 'off', snd: 'on', mus: 'on', bsnd: 'on', uisnd: 'on', allyNum: 'on', pushChest: 'on', pushPve: 'on', pushEvent: 'on', qsum: 'off' };
    for (const k in SDEF) if (setg[k] == null) setg[k] = SDEF[k];
    if (setg.rigV !== 2) { setg.rig = 'off'; setg.rigV = 2; }   // чиби-пробник не понравился — выключен у всех
    const sp = mk('div', 'pgSet', 'pg', '<div class="tower"></div><div class="pgHead" style="padding-top:calc(env(safe-area-inset-top) + 8px)"><button class="backBtn" aria-label="Назад">←</button><div class="titlePl">Настройки</div></div><div class="pgBody" id="setBody"></div>', $('cbMenu').parentNode);
    sp.querySelector('.backBtn').addEventListener('click', () => { U.click(); U.show(null); });
    const oldSet = $('cbSet'), setBtn = oldSet.cloneNode(true); oldSet.replaceWith(setBtn);
    setBtn.addEventListener('click', e => { e.stopPropagation(); U.press(setBtn); openSettings(); });
    function openSettings() { U.home(); U.show('pgSet'); renderSet(); }
    const tg = (k, nm, sub) => '<div><span>' + nm + (sub ? '<small>' + sub + '</small>' : '') + '</span><button class="tgl' + (setg[k] === 'on' ? ' on' : '') + '" data-tg="' + k + '" aria-label="' + nm + '"></button></div>';
    const sg = (k, nm, opts, sub) => '<div><span>' + nm + (sub ? '<small>' + sub + '</small>' : '') + '</span><span class="segm">' + opts.map(([v, t]) => '<button data-sg="' + k + ':' + v + '" class="' + (String(setg[k]) === String(v) ? 'on' : '') + '">' + t + '</button>').join('') + '</span></div>';
    function renderSet() {
      $('setBody').innerHTML =
        '<div class="grpT">ЗВУК</div><div class="rowList">' + tg('snd', 'Весь звук') + tg('mus', 'Музыка', 'своя для каждой локации — с артом') + tg('bsnd', 'Звуки боя') + tg('uisnd', 'Звуки интерфейса') + tg('vibro', 'Вибрация') + '</div>' +
        '<div class="grpT">ГРАФИКА</div><div class="rowList">' + tg('rig', 'Анимированные чиби-герои', 'пробник: пока заглушки, потом ваш арт') + tg('eco', 'Экономия батареи', 'слабый телефон: 30 кадров, без эффектов') + tg('shake', 'Тряска экрана') + tg('hitstop', 'Замирание при ударе') +
          sg('fx', 'Эффекты', [['full', 'Все'], ['less', 'Меньше'], ['off', 'Выкл']]) + sg('fps', 'Частота кадров', [[30, '30'], [60, '60']]) + '</div>' +
        '<div class="grpT">ЧИСЛА</div><div class="rowList">' + tg('allyNum', 'Числа урона отряда') + sg('num', 'Запись чисел', [['short', '1.5aa'], ['sci', '1.5e18']]) + '</div>' +
        '<div class="grpT">ЯЗЫК</div><div class="rowList"><div><span>Русский<small>другие языки — позже</small></span><b>✓</b></div></div>' +
        '<div class="grpT">УВЕДОМЛЕНИЯ</div><div class="rowList">' + tg('pushChest', 'Офлайн-сундук заполнен', 'в Android-версии') + tg('pushPve', 'Попытки PvE обновились') + tg('pushEvent', 'Началось событие') + '</div>' +
        '<div class="grpT">СОХРАНЕНИЕ</div><div class="rowList"><button data-sa="exp"><span>📤 Экспорт кодом<small>скопировать сохранение</small></span><b>›</b></button><button data-sa="imp"><span>📥 Импорт кода</span><b>›</b></button>' +
          '<button data-sa="bak"><span>💾 Резервные копии</span><b>›</b></button><div class="lock"><span>☁ Облако<small>с сервером и аккаунтом</small></span></div>' +
          '<button data-sa="reset" style="border-color:#7a2a34"><span style="color:#ff8a8a">🗑 Сбросить прогресс<small>нужно ввести слово УДАЛИТЬ</small></span><b>›</b></button></div>' +
        '<div class="grpT">ПРОЧЕЕ</div><div class="rowList"><button data-sa="photo"><span>📷 Фоторежим</span><b>›</b></button><button data-sa="tut"><span>🎓 Повторить обучение</span><b>›</b></button>' +
          '<button data-sa="help"><span>✉ Поддержка</span><b>›</b></button><button data-sa="ver"><span>ℹ Версия и что нового<small>' + VERSION + '</small></span><b>›</b></button></div>';
    }
    const VERSION = '0.74';
    sp.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      const d = b.dataset;
      if (d.tg) { setg[d.tg] = setg[d.tg] === 'on' ? 'off' : 'on'; if (d.tg === 'eco' && setg.eco === 'on') Object.assign(setg, ECO); }
      else if (d.sg) { const [k, v] = d.sg.split(':'); setg[k] = k === 'fps' ? +v : v; }
      else if (d.sa === 'exp') { const code = btoa(unescape(encodeURIComponent(C.serialize(s))));
        sys({ title: 'ЭКСПОРТ', html: '<textarea class="sysIn" style="height:110px;font-size:11px" readonly>' + code + '</textarea>', btns: [{ t: 'Копировать', fn: w => { try { navigator.clipboard.writeText(code); toast('Скопировано'); } catch (er) { w.querySelector('textarea').select(); } return false; } }, { t: 'Закрыть' }] }); return; }
      else if (d.sa === 'imp') { sys({ title: 'ИМПОРТ', text: 'Вставьте код сохранения. Текущий прогресс заменится.', html: '<textarea class="sysIn" style="height:110px;font-size:11px"></textarea>',
          btns: [{ t: 'Отмена' }, { t: 'Загрузить', red: true, fn: w => { let raw = ''; try { raw = decodeURIComponent(escape(atob(w.querySelector('textarea').value.trim()))); } catch (er) {}
            const st = raw && C.deserialize(raw); if (!st) { toast('Код не подходит'); return false; } try { localStorage.setItem(SAVE_KEY, raw); } catch (er) {} location.reload(); } }] }); return; }
      else if (d.sa === 'bak') { U.popBackups(); return; }
      else if (d.sa === 'reset') { sys({ title: 'СБРОС ПРОГРЕССА', glitch: true, text: 'Весь прогресс будет удалён без возврата. Введите слово УДАЛИТЬ.', html: '<input class="sysIn" placeholder="УДАЛИТЬ">',
          btns: [{ t: 'Отмена' }, { t: 'Удалить', red: true, fn: w => { if (w.querySelector('input').value.trim().toUpperCase() !== 'УДАЛИТЬ') { w.querySelector('input').style.borderColor = '#ff4a4a'; return false; }
            try { localStorage.removeItem(SAVE_KEY); localStorage.removeItem(PROF_KEY); } catch (er) {} blockSave = true; location.reload(); } }] }); return; }
      else if (d.sa === 'photo') { U.show(null); photoMode(true); return; }
      else if (d.sa === 'tut') { U.show(null); tutorial(true); return; }
      else if (d.sa === 'help') { sys({ title: 'ПОДДЕРЖКА', text: 'Нашли ошибку или есть идея? Напишите автору игры — контакты появятся в Android-версии.' }); return; }
      else if (d.sa === 'ver') { sys({ title: 'ВЕРСИЯ ' + VERSION, text: 'Новое: экран боя и все меню по опросу интерфейса — профиль, настройки, страница героя, портал с картами, сумка, окна Системы.' }); return; }
      else return;
      U.click(); applySettings(); renderSet();
    });

    // ==================================================================
    // ОБУЧЕНИЕ (ответы 161–164): рука-указатель + затемнение вокруг, можно пропустить
    // ==================================================================
    const TUT_KEY = 'prizvannyy_tut';
    const tut = mk('div', 'tutOv', '', '<div class="hole"></div><div class="hand">👆</div><div class="msg"></div><button class="skip">Пропустить</button>', game);
    let tutStep = -1;
    const TUT = [
      { at: () => el.enemy, text: 'Тапайте по врагу — каждый тап это удар героя.' },
      { at: () => hu, text: 'Быстрые тапы заряжают ульту — «Шквал ударов» (с 5 этажа).' },
      { at: () => $('cbMenu'), text: 'Здесь прокачка героя и отряда, артефакты, сумка и питомцы.' },
      { at: () => profBtn, text: 'Профиль: имя, титулы, рамки, статистика и Хроника.' },
    ];
    function tutorial(force) {
      if (!force) { try { if (localStorage.getItem(TUT_KEY)) return; } catch (e) {} }
      tutStep = 0; tutShow();
    }
    function tutShow() {
      const st = TUT[tutStep]; if (!st) { tut.classList.remove('show'); try { localStorage.setItem(TUT_KEY, '1'); } catch (e) {} return; }
      const r = st.at().getBoundingClientRect(), g = game.getBoundingClientRect();
      const x = r.left - g.left + r.width / 2, y = r.top - g.top + r.height / 2, rad = Math.max(r.width, r.height) / 2 + 14;
      tut.style.setProperty('--hx', x + 'px'); tut.style.setProperty('--hy', y + 'px'); tut.style.setProperty('--hr', rad + 'px');
      tut.querySelector('.msg').textContent = st.text; tut.querySelector('.msg').style.top = (y + rad + 40 > g.height - 120 ? y - rad - 90 : y + rad + 40) + 'px';
      tut.classList.add('show');
    }
    tut.addEventListener('click', e => { if (e.target.closest('.skip')) tutStep = 99; else tutStep++; U.click(); tutShow(); });
    window.U3.tutorial = tutorial;

    // ==================================================================
    // МЕНЮ: действия «@…» (магазин, профиль, настройки, вход 7/30), Android «назад», свайпы вкладок
    // ==================================================================
    window.U3.menuAct = k => {
      if (k === 'shop') sys({ title: 'МАГАЗИН', text: 'Лавка Башни откроется позже: наборы за игровую валюту и покупки — вместе с Android-версией. Реклама — только по желанию.' });
      else if (k === 'prof') openProfile('me');
      else if (k === 'set') openSettings();
      else if (k === 'login') loginWin(true);
    };
    $('shadowTw').addEventListener('click', () => { U.click(); toast('Теневая башня<small>логово хранителей питомцев</small>'); U.sec('pets'); });
    function loginWin(force) {
      const can = C.loginAvailable(s, dayKey()), idx = C.loginDayIndex(s), D = CFG.login.days;
      if (!can && !force) return;
      const ic = r => r.tickets ? '🎟' : r.shard ? CFG.materials.shard.icon : r.essence ? '✦' : '🎁';
      const week = Math.floor(idx / 7) * 7, days = D.slice(week, week + 7);
      sys({ title: 'НАГРАДА ЗА ВХОД', text: can ? 'День ' + (idx + 1) + ' из ' + D.length + '. Заходите каждый день — к 30-му награды больше.' : 'Сегодняшняя награда уже получена. Завтра — день ' + (idx + 1) + '.',
        html: '<div class="sysGrid">' + days.map((r, i) => { const n = week + i; return '<div style="' + (n < idx ? 'opacity:.4' : n === idx && can ? 'border-color:#e3b6ff;box-shadow:0 0 8px #b14dff' : '') + '"><b>' + (n < idx ? '✓' : ic(r)) + '</b>день ' + (n + 1) + '<br>' + rewardLine(r) + '</div>'; }).join('') + '</div>',
        btns: can ? [{ t: 'Забрать', fn: () => { const r = C.claimLogin(s, dayKey()); if (r) { toast('Бонус за вход · день ' + r.day + '<small>' + rewardLine(r.reward) + '</small>'); save(); render(); } } }] : [{ t: 'OK' }] });
    }
    if (prof.name) setTimeout(() => { if (C.unlockedAt(s, 'login')) loginWin(false); }, 2200);
    // свайпы между вкладками раздела (ответ 52)
    let tsx = null;
    $('sBody').addEventListener('touchstart', e => { tsx = e.touches[0].clientX; }, { passive: true });
    $('sBody').addEventListener('touchend', e => { if (tsx == null) return; const dx = e.changedTouches[0].clientX - tsx; tsx = null; if (Math.abs(dx) < 70) return;
      const tabs = [...document.querySelectorAll('#sTabs button')], i = tabs.findIndex(b => b.classList.contains('on')); const nb = tabs[i + (dx < 0 ? 1 : -1)]; if (nb) nb.click(); });
    // Android «назад»: на странице — закрыть её, в бою — «Выйти?» (ответ 51)
    try { history.pushState({ g: 1 }, ''); } catch (e) {}
    window.addEventListener('popstate', () => {
      try { history.pushState({ g: 1 }, ''); } catch (e) {}
      if (ov.classList.contains('show')) { ov.classList.remove('show'); return; }
      const open = document.querySelector('.pg.show');
      if (open) { const bb = open.querySelector('.backBtn'); if (bb) bb.click(); return; }
      sys({ title: 'ВЫЙТИ?', text: 'Прогресс сохранён. Отряд продолжит бой, пока вас нет.', btns: [{ t: 'Остаться' }, { t: 'Выйти', red: true, fn: () => { save(); try { history.go(-2); } catch (e) {} } }] });
    });
    // PvE: «Сдаться», таймер до сброса попыток (ответы 131, 133)
    $('leaveBtn').textContent = 'Сдаться';
    window.U3.openProfile = openProfile;
    // отладка и автопроверка (скриншоты): доступ к состоянию из консоли
    window.__game = { get s() { return s; }, C, render: () => render(), handle: (e, x, y) => handle(e, x, y), save: () => save() };
    window.U3.bigPlate = bigPlate;
    sync();
  })();
