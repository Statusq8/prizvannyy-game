  // ===================== UI 2 (0.40) — по docs/ui/UI_MASTER_v2.md =====================
  // Новые экраны поверх старой логики: 4 угловые кнопки, главное меню, Прокачка, Артефакты, Сумка, Питомцы, Карта Башни.
  // Остальные разделы пока открываются старыми вкладками внутри полноэкранной страницы (TODO: свой дизайн).
  var ui2Refresh = null;
  (function () {
    const RC = { E: '#8d8d96', D: '#4cbf5a', C: '#3a8fe0', B: '#a050e0', A: '#e04848', S: '#ffb030', SS: '#ff7a20', SSS: '#ff40c0', GOD: '#fff2a0' };
    const rvar = r => '--rc:' + (RC[r] || '#6e6678') + ';--rg:' + (RC[r] || '#6e6678') + '88';
    const SECS = [['up', '⚔', 'Прокачка', '#d6a640'], ['art', '💎', 'Артефакты', '#b14dff'], ['bag', '🎒', 'Сумка', '#3a8fe0'], ['pets', '🐉', 'Питомцы', '#4cbf5a']];
    const MORE = [['@portal', '🌀', 'Портал'], ['heroes', '🪖', 'Герои и отряд'], ['@souls', '👻', 'Души и ритуал'], ['altar', '🕯', 'Алтарь'], ['quests', '📜', 'Задания'],
      ['season', '🎖', 'Сезон'], ['events', '🏮', 'События'], ['inbox', '📬', 'Награды'], ['runes', 'ᚦ', 'Руны'], ['bones', '🦴', 'Кости'], ['stats', '📊', 'Статистика'], ['@backup', '💾', 'Резервные копии']];
    let page = null, sec = 'up', artTab = 'got', artSel = null, artN = 1, bagCat = 'all', bagSort = 'rar', bagQ = '', petSel = null, lastHtml = {};
    const stack = [];
    const heroImg = (document.querySelector('#cards .cardIcon img') || {}).src || '';

    // короткий звук нажатия (WebAudio, без файлов)
    let actx = null;
    function click() {
      try {
        actx = actx || new (window.AudioContext || window.webkitAudioContext)();
        const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime;
        o.type = 'triangle'; o.frequency.setValueAtTime(520, t); o.frequency.exponentialRampToValueAtTime(260, t + 0.07);
        g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
        o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + 0.1);
      } catch (e) {}
    }
    function setHtml(id, html) { if (lastHtml[id] !== html) { $(id).innerHTML = html; lastHtml[id] = html; } }
    function cur(icon, val, gold) { return '<div class="cur' + (gold ? ' g' : '') + '"><i>' + icon + '</i>' + val + '</div>'; }
    const M = CFG.materials;

    // ---------- открытие / закрытие страниц ----------
    function show(id) {
      document.querySelectorAll('.pg').forEach(p => p.classList.toggle('show', p.id === id));
      document.body.classList.toggle('pageOpen', !!id);
    }
    function open(p, opt) {
      if (page && page !== p) stack.push(page);
      page = p; if (opt) Object.assign(state, opt);
      lastHtml = {};
      if (p === 'menu') show('pgMenu');
      else if (p === 'x') show('pgX');
      else if (p === 'sec') show('pgSec');
      else if (p === 'map') show('pgMap');
      refresh();
      if (p === 'map') setTimeout(() => { const c = document.querySelector('.fRoom.cur'); if (c) c.scrollIntoView({ block: 'center' }); }, 0);
    }
    const state = {};
    function back() {
      click();
      if (page === 'sec' && artSel) { artSel = null; lastHtml = {}; refresh(); return; }
      page = stack.pop() || null;
      if (!page) { show(null); return; }
      lastHtml = {}; show(page === 'menu' ? 'pgMenu' : page === 'sec' ? 'pgSec' : page === 'x' ? 'pgX' : 'pgMap'); refresh();
    }
    document.querySelectorAll('.pg [data-back]').forEach(b => b.addEventListener('click', back));

    // старые вкладки — внутри полноэкранной страницы
    function openOld(t) {
      click();
      tab = t; setCollapsed(false);
      document.body.classList.add('oldOpen');
      $('oldTitle').textContent = TAB_NAMES[t] || '';
      render();
    }
    function closeOld() { document.body.classList.remove('oldOpen'); setCollapsed(true); render(); }
    $('oldBack').addEventListener('click', () => { click(); closeOld(); });

    // ---------- 4 угловые кнопки ----------
    const press = b => { b.classList.add('press'); setTimeout(() => b.classList.remove('press'), 120); click(); if (navigator.vibrate && setg.vibro === 'on') try { navigator.vibrate(8); } catch (e) {} };
    $('cbMenu').addEventListener('click', e => { e.stopPropagation(); press(e.currentTarget); stack.length = 0; page = null; open('menu'); });
    $('cbSet').addEventListener('click', e => { e.stopPropagation(); press(e.currentTarget); });          // этап 11 на паузе — экран не согласован
    $('cbPve').addEventListener('click', e => { e.stopPropagation(); press(e.currentTarget); stack.length = 0; page = null; openX('pve'); });
    $('cbMap').addEventListener('click', e => { e.stopPropagation(); press(e.currentTarget); stack.length = 0; page = null; open('map'); });

    // ---------- главное меню ----------
    function renderMenu() {
      setHtml('mTop', cur('◆', fmt(s.gold), true) + cur('🎟', fmt(s.tickets)) + cur('👻', fmt(s.souls)));
      const sub = { up: 'Главный герой и союзники', art: 'Все найденные действуют сразу', bag: 'Материалы, билеты, руны, кости', pets: 'Призванное существо в бою' };
      const bang = { up: navBang.up, art: navBang.souls, bag: false, pets: CFG.pets.list.some(p => C.canEvolvePet(s, p.id)) };
      let h = SECS.map(([id, ic, nm, c]) => '<button class="mCard" data-sec="' + id + '" style="--tc:' + c + '"><span class="ic">' + ic + '</span><span><span class="nm">' + nm + '</span><small>' + sub[id] + '</small></span>' +
        (bang[id] ? '<i class="bang2">!</i>' : '') + '</button>').join('');
      h += '<div class="secT">Другие разделы · временно в старом виде</div><div class="mMore">' +
        MORE.map(([id, ic, nm]) => '<button data-old="' + id + '"><b>' + ic + '</b>' + nm + (navBang[id] ? '<i class="bang2">!</i>' : '') + '</button>').join('') + '</div>';
      setHtml('mBody', h);
    }
    $('mBody').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.sec) { click(); sec = b.dataset.sec; artSel = null; open('sec'); }
      else if (b.dataset.old === '@backup') { click(); popBackups(); }
      else if (b.dataset.old === '@portal' || b.dataset.old === '@souls') { click(); openX(b.dataset.old.slice(1)); }
      else if (b.dataset.old) openOld(b.dataset.old);
    });

    // ---------- разделы с вкладками ----------
    function renderSec() {
      setHtml('sTabs', SECS.map(([id, ic, nm, c]) => '<button data-st="' + id + '" class="' + (id === sec ? 'on' : '') + '" style="--tc:' + c + '"><b>' + ic + '</b>' + nm + '</button>').join(''));
      const top = sec === 'up' ? cur(M.shard.icon, fmt(s.materials.shard)) + cur(M.heart.icon, fmt(s.materials.heart)) + cur('◆', fmt(s.gold), true)
        : sec === 'art' ? cur('👻', fmt(s.souls)) : sec === 'bag' ? cur('🎟', fmt(s.tickets)) + cur('◆', fmt(s.gold), true) : cur(M.shard.icon, fmt(s.materials.shard));
      setHtml('sTop', top);
      $('sTitle').textContent = sec === 'up' ? 'Герои' : sec === 'art' ? (artSel ? 'Улучшение' : 'Артефакты') : sec === 'bag' ? 'Сумка' : 'Питомцы';
      setHtml('sBody', sec === 'up' ? upHtml() : sec === 'art' ? artHtml() : sec === 'bag' ? bagHtml() : petsHtml());
    }
    $('sTabs').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; click(); sec = b.dataset.st; artSel = null; lastHtml = {}; refresh(); $('sBody').scrollTop = 0; });

    // Прокачка: крупные карточки; кнопка — та же покупка, что в старой панели (ранг, найм, ×N)
    const MSEL = [[1, '×1'], [10, '×10'], [100, '×100'], ['max', 'MAX']];
    // 15 звёзд (GDD 1.2) показываются 5 ячейками: 1–5 — золотые, 6–10 — алые, 11–15 — фиолетовые
    const STAR_C = ['#ffd36b', '#ff5a3a', '#d070ff'];
    function stars(n) {
      const tier = n ? Math.floor((n - 1) / 5) : 0, k = n ? ((n - 1) % 5) + 1 : 0;
      let t = ''; for (let i = 0; i < 5; i++) t += i < k ? '<b>★</b>' : '★';
      return '<div class="stars" style="--sc:' + STAR_C[tier] + '">' + t + '</div>';
    }
    function upHtml() {
      let h = '<div class="upTool"><select id="u2mult">' + MSEL.map(([v, t]) => '<option value="' + v + '"' + (v === mult ? ' selected' : '') + '>' + t + '</option>').join('') + '</select></div>';
      const r = C.rankLabel(s.heroRank), RN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
      h += '<div class="hCard" style="' + rvar('S') + '"><div class="pt">' + (heroImg ? '<img src="' + heroImg + '" alt="">' : '🗡') + '<span class="rk">' + RN[r.rank || 1] + '</span></div>' +
        '<div class="inf"><div class="nm">Призванный</div><div class="ln">Ур. <b>' + fmt(s.tapLevel) + '</b> / ' + fmt(C.tapCap(s)) + '</div>' +
        '<div class="ln">⚔ <b>' + fmt(C.tapHit(s)) + '</b> за тап</div><span class="fac">Главный герой</span></div>' +
        '<button class="upBtn" data-ub="hero"' + (el.buyTap.disabled ? ' disabled' : '') + '>' + el.buyTap.innerHTML + '</button></div>';
      const list = CFG.allies.slice().sort((a, b) => {
        const ua = s.heroes[a.id].unlocked, ub = s.heroes[b.id].unlocked;
        if (ua !== ub) return ua ? -1 : 1;
        const sa = C.inSquad(s, a.id), sb = C.inSquad(s, b.id);
        if (sa !== sb) return sa ? -1 : 1;
        return RANKS.indexOf(b.rarity) - RANKS.indexOf(a.rarity);
      });
      for (const a of list) {
        const hh = s.heroes[a.id], lv = s.allies[a.id].level, u = allyUi[a.id];
        const fig = '<div style="width:100%;height:100%">' + allySvg(ALLY_VIS[a.id], hh.evo) + '</div>';
        if (!hh.unlocked) {
          h += '<div class="hCard lock" style="' + rvar(a.rarity) + '"><div class="pt">' + fig + '<span class="rk">' + a.rarity + '</span>' + stars(0) + '</div>' +
            '<div class="inf"><div class="nm">' + a.name + '</div><div class="ln">Ур. --</div><span class="fac">' + a.role + '</span></div>' +
            '<button class="upBtn alt" data-free="' + a.id + '">🔒 Освободить героя</button></div>';
          continue;
        }
        const dps = lv ? fmt(B.mul(C.allyDps(s, a.id), C.permMult(s, 'ally'))) : '—';
        h += '<div class="hCard" style="' + rvar(a.rarity) + '"><div class="pt">' + fig + '<span class="rk">' + a.rarity + '</span>' + stars(hh.stars) + '</div>' +
          '<div class="inf"><div class="nm">' + a.name + '</div><div class="ln">Ур. <b>' + (lv ? fmt(lv) : '--') + '</b>' + (lv ? ' / ' + fmt(C.allyCap(s, a.id)) : '') + '</div>' +
          '<div class="ln">⚔ <b>' + dps + '</b> DPS</div><span class="fac">' + a.role + (C.inSquad(s, a.id) ? ' · в отряде' : ' · резерв') + '</span></div>' +
          '<button class="upBtn" data-ub="' + a.id + '"' + (u.btn.disabled ? ' disabled' : '') + '>' + u.btn.innerHTML + '</button></div>';
      }
      return h;
    }

    // Артефакты: сетка 4 в ряд, отдельная страница улучшения (×1/×10/×100/MAX)
    function artHtml() {
      if (artSel) {
        const a = CFG.artifacts.find(x => x.id === artSel), lv = C.artLevel(s, a.id), c = C.upgradeArtCost(s, a.id);
        const prev = c != null ? C.previewSpend(s, 'upgrade', a.id, TPS_PREVIEW) : null;
        return '<div class="multRow">' + [[1, '×1'], [10, '×10'], [100, '×100'], ['max', 'MAX']].map(([v, t]) => '<button class="chip' + (artN === v ? ' on' : '') + '" data-an="' + v + '">' + t + '</button>').join('') + '</div>' +
          '<div class="detBox" style="' + rvar(lv >= (a.max || 1e9) ? 'S' : 'B') + '"><div class="big">' + a.icon + '</div><h3>' + a.name + '</h3>' +
          '<div class="cmp">Ур. ' + lv + (a.max ? ' / ' + a.max : '') + '</div><p>' + a.desc + '</p>' + (prev ? dpsChange(prev) : '') +
          (c == null ? '<button class="upBtn" disabled style="width:70%;margin-top:10px">Максимум</button>'
                     : '<button class="upBtn" data-aup="' + a.id + '" style="width:70%;margin-top:10px"' + (B.gte(s.souls, c) ? '' : ' disabled') + '>Улучшить' +
                       (artN !== 1 ? ' ' + (artN === 'max' ? 'MAX' : '×' + artN) : '') + '<span>👻 ' + fmt(c) + (artN !== 1 ? ' за ур.' : '') + '</span></button>') + '</div>';
      }
      const got = CFG.artifacts.filter(a => C.artLevel(s, a.id) > 0), not = CFG.artifacts.filter(a => !C.artLevel(s, a.id));
      let h = '<div class="multRow"><button class="chip' + (artTab === 'got' ? ' on' : '') + '" data-at="got">Полученные (' + got.length + ')</button>' +
        '<button class="chip' + (artTab === 'not' ? ' on' : '') + '" data-at="not">🔒 Не полученные (' + not.length + ')</button></div>';
      const fc = C.findCost(s);
      if (artTab === 'not' && fc != null) h += '<div style="text-align:center;margin-bottom:8px"><button class="upBtn" data-find style="width:auto;padding:4px 16px"' + (B.gte(s.souls, fc) ? '' : ' disabled') + '>Найти артефакт<span>👻 ' + fmt(fc) + '</span></button></div>';
      h += '<div class="grid4">' + (artTab === 'got' ? got : not).map(a => {
        const lv = C.artLevel(s, a.id), c = C.upgradeArtCost(s, a.id), can = c != null && B.gte(s.souls, c);
        return '<button class="aCell' + (lv ? '' : ' lock') + '" data-art="' + (lv ? a.id : '') + '" style="' + rvar(lv && a.max && lv >= a.max ? 'S' : 'B') + '">' +
          (lv ? '<span class="lv">Ур. ' + lv + '</span>' : '') + '<span class="ai">' + a.icon + '</span><span class="an">' + (lv ? a.name : '???') + '</span>' +
          (can ? '<i class="bang2" style="top:-4px;right:-4px">!</i>' : '') + '</button>';
      }).join('') + '</div>';
      return h;
    }

    // Сумка: 5 в ряд, категории, поиск, сортировка, окно предмета
    function bagItems() {
      const it = [];
      const add = (o) => { if (o.n > 0 || o.always) it.push(o); };
      add({ id: 'shard', cat: 'shard', icon: M.shard.icon, name: M.shard.name, n: s.materials.shard, r: 2, desc: 'Падают с боссов. Ранги героев и улучшение питомцев.' });
      add({ id: 'heart', cat: 'mat', icon: M.heart.icon, name: M.heart.name, n: s.materials.heart, r: 4, desc: 'За первое прохождение особых боссов. Эволюция и ранги героев.' });
      add({ id: 'dust', cat: 'mat', icon: '⚱', name: 'Костяная пыль', n: s.materials.dust | 0, r: 1, desc: 'Получается при переработке костей.' });
      add({ id: 'tickets', cat: 'tick', icon: '🎟', name: 'Билет призыва', n: s.tickets, r: 3, desc: 'Призыв героев в портале.', go: 'portal' });
      add({ id: 'lanterns', cat: 'tick', icon: '🏮', name: 'Фонарь события', n: (s.event && s.event.lanterns) | 0, r: 4, desc: 'Валюта события недели: событийный призыв и лавка.', go: 'events' });
      add({ id: 'essence', cat: 'spec', icon: '✦', name: 'Эссенция', n: s.essence, r: 3, desc: 'Награда заданий и подземелий.' });
      for (const pd of CFG.pets.list) { const n = C.petFrags(s, pd.id); if (n) it.push({ id: 'pf_' + pd.id, cat: 'shard', icon: '🧩', name: 'Фрагменты: ' + pd.name, n, r: CFG.rarities.indexOf(pd.rank), desc: 'Для эволюции питомца ' + pd.icon + ' ' + pd.name + '. Роняет его «Хранитель».' }); }
      for (const ru of s.runes) { const k = CFG.runes.kinds.find(x => x.id === (ru.type || ru.kind)) || {}; it.push({ id: 'r' + ru.id, cat: 'spec', icon: k.icon || 'ᚦ', name: (k.name || 'Руна') + ' · ур. ' + (ru.lvl | 0), n: 1, r: ru.tier | 0, desc: k.desc ? '+% ' + k.desc : '', go: 'runes' }); }
      for (const bo of s.bones) { const k = CFG.bones.slots.find(x => x.id === bo.slot) || {}; it.push({ id: 'b' + bo.id, cat: 'spec', icon: k.icon || '🦴', name: 'Кость: ' + (k.name || '') + ' · ур. ' + (bo.lvl | 0), n: 1, r: bo.tier | 0, desc: k.desc ? '+% ' + k.desc + (bo.on ? ' · надета' : '') : '', go: 'bones' }); }
      return it;
    }
    const RAR_BY_N = CFG.rarities;
    function bagHtml() {
      const cats = [['all', 'Все'], ['mat', 'Материалы'], ['shard', 'Осколки'], ['cons', 'Расходники'], ['tick', 'Билеты'], ['spec', 'Особые']];
      let list = bagItems().filter(x => (bagCat === 'all' || x.cat === bagCat) && (!bagQ || x.name.toLowerCase().includes(bagQ)));
      list.sort(bagSort === 'type' ? (a, b) => a.cat.localeCompare(b.cat) : bagSort === 'new' ? (a, b) => 0 : (a, b) => b.r - a.r);
      let h = '<div class="bagTool"><input id="bagQ" placeholder="🔍 Поиск предметов…" value="' + bagQ.replace(/"/g, '') + '"><select id="bagCat">' + cats.map(([v, t]) => '<option value="' + v + '"' + (v === bagCat ? ' selected' : '') + '>' + t + '</option>').join('') + '</select></div>' +
        '<div class="sortRow">Сортировка: ' + [['rar', 'Редкость'], ['type', 'Тип'], ['new', 'Новые']].map(([v, t]) => '<button class="chip' + (bagSort === v ? ' on' : '') + '" data-bs="' + v + '">' + t + '</button>').join('') + '</div>';
      const cells = list.map(x => '<button class="iCell" data-item="' + x.id + '" style="' + rvar(RAR_BY_N[Math.min(RAR_BY_N.length - 1, x.r)]) + '">' + x.icon + (x.n > 1 ? '<span class="q">' + fmt(x.n) + '</span>' : '') + '</button>');
      const total = Math.max(25, Math.ceil(cells.length / 5) * 5 + 5);
      for (let i = cells.length; i < total; i++) cells.push('<div class="iCell empty">✦</div>');
      return h + '<div class="grid5">' + cells.join('') + '</div>';
    }
    function popItem(id) {
      const x = bagItems().find(i => i.id === id); if (!x) return;
      $('ui2PopBox').style.cssText = rvar(RAR_BY_N[Math.min(RAR_BY_N.length - 1, x.r)]);
      $('ui2PopBox').innerHTML = '<div class="big">' + x.icon + '</div><h3>' + x.name + '</h3><div class="ln" style="font:400 15px Russo One,system-ui">× ' + fmt(x.n) + '</div><p>' + (x.desc || '') + '</p>' +
        '<div class="row">' + (x.go ? '<button class="upBtn alt" data-pgo="' + x.go + '">Подробнее</button>' : '') + '<button class="upBtn" data-pclose>Закрыть</button></div>';
      $('ui2Pop').classList.add('show');
    }
    // Резервные копии: только прошедшие проверку; откат — с подтверждением, текущее состояние тоже сохраняется
    function popBackups() {
      const list = backupList();
      const row = c => '<div class="bakRow"><b>' + (c.kind === 'ritual' ? '🕯 Перед ритуалом' : '💾 Автокопия') + ' · ' + new Date(c.t).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) + '</b>' +
        '<p>Этаж ' + c.st.floor + ' (рекорд ' + c.st.bestFloor + ') · ◆ ' + fmt(c.st.gold) + ' · 👻 ' + fmt(c.st.souls) + '</p>' +
        '<button class="upBtn alt" style="width:100%;min-height:34px" data-rest="' + c.key + '">Вернуть эту копию</button></div>';
      $('ui2PopBox').style.cssText = '';
      $('ui2PopBox').innerHTML = '<div class="big">💾</div><h3>Резервные копии</h3><p>Три копии обновляются по кругу раз в 5 минут, ещё одна делается перед каждым ритуалом. Если сохранение повредится, игра сама поднимется из последней целой копии.</p>' +
        (list.length ? list.map(row).join('') : '<p>Копий пока нет — первая появится в течение 5 минут игры.</p>') +
        '<div class="row" style="margin-top:12px"><button class="upBtn" data-pclose>Закрыть</button></div>';
      $('ui2Pop').classList.add('show');
    }
    $('ui2Pop').addEventListener('click', e => {
      const b = e.target.closest('button');
      if (b && b.dataset.rest) {
        const c = backupList().find(x => x.key === b.dataset.rest); if (!c) return;
        $('ui2Pop').classList.remove('show');
        ask('<b>Вернуть копию?</b><span class="askList">Игра вернётся к состоянию от ' + new Date(c.t).toLocaleString('ru-RU') + ': этаж ' + c.st.floor + ', рекорд ' + c.st.bestFloor +
          '.<br>Текущий прогресс тоже сохранится отдельной копией.</span>', 'Вернуть', () => restoreCopy(c.key));
        return;
      }
      if (e.target.id === 'ui2Pop' || (b && b.dataset.pclose !== undefined)) { click(); $('ui2Pop').classList.remove('show'); return; }
      if (b && b.dataset.pgo) { $('ui2Pop').classList.remove('show'); openOld(b.dataset.pgo); }
    });

    // Питомцы 2.0: один большой выбранный сверху, остальные ниже; 1 активное + 1 пассивное умение; звёзды — только после эволюции
    let petSort = 'rar';
    function petsHtml() {
      const P = CFG.pets, R = CFG.rarities;
      if (!petSel || !C.petDef(petSel)) petSel = s.pets.active || (P.list.find(p => C.petForm(s, p.id)) || P.list[0]).id;
      const p = C.petDef(petSel), f = C.petForm(s, p.id), act = s.pets.active === p.id, pw = C.petPower(p, f || 1);
      const ec = C.petEvoCost(s, p.id), frags = C.petFrags(s, p.id), canEvo = C.canEvolvePet(s, p.id);
      const pct = x => Math.round(x * 100) + '%';
      const where = p.floor ? 'первая победа над боссом этажа ' + p.floor : 'событие «Логово» (неделя ранга ' + p.rank + ')';
      const bio = (CFG.biomes.find(b => b.id === p.biome) || {}).name || '';
      let h = '<div class="petTop" style="' + rvar(p.rank) + '"><div class="pic"' + (f ? '' : ' style="filter:brightness(0) drop-shadow(0 0 2px #6e6678)"') + '>' + p.icon + '<span class="rk">' + p.rank + '</span>' +
        (f > 1 ? '<div class="stars" style="bottom:4px">' + '<b>★</b>'.repeat(f - 1) + '</div>' : '') + '</div>' +
        '<div><div class="nm">' + p.name + '</div><div class="ln">' + (f ? P.forms[f - 1] : '🔒 не получен') + '</div>' +
        '<div class="ln">⚔ <b>' + pct(pw.share) + '</b> DPS отряда</div><div class="ln">✦ <b>+' + pct(pw.bonus) + '</b> ' + P.typeName[p.type] + '</div>' +
        (act ? '<div class="ln" style="color:#ffd36b">● в бою</div>' : '') + (f ? '' : '<div class="ln">Где взять: ' + where + '</div>') + '</div></div>';
      h += '<div class="petBtns" style="grid-template-columns:1fr 1fr">' +
        (f ? (act ? '<button class="upBtn alt" data-pact="off">Отозвать</button>' : '<button class="upBtn gold" data-pact="on">Призвать</button>')
           : '<button class="upBtn gold" disabled>Не получен</button>') +
        (ec != null ? '<button class="upBtn" data-pevo' + (canEvo ? '' : ' disabled') + '>Эволюция<span>🧩 ' + frags + ' / ' + ec + '</span></button>'
                    : '<button class="upBtn alt" disabled>' + (f ? 'Пиковая форма' : 'Эволюция') + '<span>🧩 ' + frags + '</span></button>') + '</div>';
      h += '<div class="pAbil"><div class="ico">⚡</div><div><b><i>Активная</i>Удар</b><p>Раз в ' + p.interval + ' с бьёт сам: ' + pct(pw.share) + ' DPS отряда в секунду.</p></div></div>' +
           '<div class="pAbil pas"><div class="ico">✦</div><div><b><i>Пассивная</i>' + P.typeName[p.type][0].toUpperCase() + P.typeName[p.type].slice(1) + '</b><p>Пока питомец в бою: +' + pct(pw.bonus) + ' ' + P.typeName[p.type] + '.</p></div></div>' +
           '<div class="pAbil"><div class="ico">🧩</div><div><b>Фрагменты</b><p>Роняет «Хранитель» в биоме «' + bio + '» на этажах от ' + (p.floor || P.floors[p.rank][1]) + ' (≈1 из 50 врагов, офлайн не падают). Эволюция усиливает удар и бонус.</p></div></div>';
      const lr = C.lairRank(s), lp = C.lairPet(s);
      h += '<div class="secT">Логово недели: ранг ' + lr + ' · Хранители этого ранга дают ×' + P.lairFrags + ' фрагментов' + (lp && !C.petForm(s, lp.id) ? ' · ' + (s.pets.lair.week === ((s.event && s.event.week) || '') ? s.pets.lair.kills : 0) + '/' + P.lairKeepers + ' → ' + lp.icon + ' ' + lp.name : '') + '</div>';
      h += '<div class="sortRow">Сортировка: ' + [['rar', 'Редкость'], ['pow', 'Сила'], ['new', 'Новые']].map(([v, tx]) => '<button class="chip' + (petSort === v ? ' on' : '') + '" data-psort="' + v + '">' + tx + '</button>').join('') + '</div>';
      const list = P.list.slice().sort((a, b) => {
        const fa = C.petForm(s, a.id), fb = C.petForm(s, b.id);
        if (!!fa !== !!fb) return fa ? -1 : 1;
        if (petSort === 'pow') return C.petPower(b, fb || 1).share - C.petPower(a, fa || 1).share;
        if (petSort === 'new') return P.list.indexOf(b) - P.list.indexOf(a);
        return R.indexOf(b.rank) - R.indexOf(a.rank);
      });
      h += '<div class="grid4">' + list.map(q => {
        const qf = C.petForm(s, q.id);
        return '<button class="aCell' + (qf ? '' : ' lock') + '" data-psel="' + q.id + '" style="' + rvar(q.rank) + (q.id === petSel ? ';outline:2px solid #fff' : '') + '">' +
          '<span class="lv">' + q.rank + (qf > 1 ? ' ' + '★'.repeat(qf - 1) : '') + '</span><span class="ai">' + q.icon + '</span><span class="an">' + q.name + '</span>' +
          (s.pets.active === q.id ? '<i class="bang2" style="top:-4px;right:-4px;background:#d6a640">●</i>' : C.canEvolvePet(s, q.id) ? '<i class="bang2" style="top:-4px;right:-4px">!</i>' : '') + '</button>';
      }).join('') + '</div>';
      return h;
    }

    $('sBody').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b || b.disabled) return;
      const d = b.dataset;
      if (d.ub) { click(); (d.ub === 'hero' ? el.buyTap : allyUi[d.ub].btn).click(); }
      else if (d.free) { click(); openX('portal'); return; }
      else if (d.at) { click(); artTab = d.at; }
      else if (d.art) { click(); artSel = d.art; artN = 1; }
      else if (d.an) { click(); artN = d.an === 'max' ? 'max' : +d.an; }
      else if (d.aup) {
        click(); const n = artN === 'max' ? 1e4 : artN; let k = 0;
        while (k < n && C.upgradeArtifact(s, d.aup)) k++;
        if (k) { save(); toast('Артефакт улучшен<small>+' + k + ' ур.</small>'); }
      }
      else if (d.find !== undefined) { const id = C.findArtifact(s); if (id) { const a = CFG.artifacts.find(x => x.id === id); toast('Найден артефакт!<small>' + a.icon + ' ' + a.name + '</small>'); save(); } }
      else if (d.item) { click(); popItem(d.item); return; }
      else if (d.bs) { click(); bagSort = d.bs; }
      else if (d.psel) { click(); petSel = d.psel; }
      else if (d.pact) { click(); if (d.pact === 'on') C.setPet(s, petSel); else C.recallPet(s); save(); }
      else if (d.psort) { click(); petSort = d.psort; }
      else if (d.pevo !== undefined) { click(); if (C.evolvePet(s, petSel)) { const pd = C.petDef(petSel); toast('Эволюция!<small>' + pd.icon + ' ' + pd.name + ' · ' + CFG.pets.forms[C.petForm(s, petSel) - 1] + '</small>'); save(); } }
      else return;
      render();
    });
    $('sBody').addEventListener('change', e => {
      if (e.target.id === 'u2mult') { const v = e.target.value; mult = v === 'max' ? 'max' : +v; const m = MULTS.find(x => x[0] === mult); if (m) $('multCycle').textContent = m[1]; render(); }
      if (e.target.id === 'bagCat') { bagCat = e.target.value; refresh(); }
    });
    $('sBody').addEventListener('input', e => {
      if (e.target.id === 'bagQ') { bagQ = e.target.value.toLowerCase(); const pos = e.target.selectionStart; lastHtml.sBody = null; refresh(); const q = $('bagQ'); if (q) { q.focus(); try { q.setSelectionRange(pos, pos); } catch (er) {} } }
    });

    // ---------- Карта Башни: ровно 5 этажей на экране, прокрутка, открывается на текущем ----------
    let mapLo = 0, mapHi = 0;
    function renderMap2() {
      const TOP = 100000, curF = s.floor;
      if (!mapHi || curF > mapHi - 5 || curF < mapLo + 5) { mapLo = Math.max(1, curF - 40); mapHi = Math.min(TOP, Math.max(curF, s.maxFloor) + 15); }
      $('mapInfo').textContent = 'Этаж ' + curF + ' / Рекорд ' + s.maxFloor;
      let h = mapHi < TOP ? '<div style="text-align:center;padding:8px"><button class="chip" data-mm="up">▲ Выше</button></div>' : '';
      for (let f = mapHi; f >= mapLo; f--) {
        const done = f < s.maxFloor || (f === s.maxFloor && f !== curF && false), isCur = f === curF, shut = f > s.maxFloor, key = C.isFinalBoss(f);
        const hue = (C.biomeOf(f).hue + 270) % 360;
        const who = isCur ? '🗡👹' : shut ? (key ? '💀' : '') : f === s.maxFloor ? '👹' : key ? '👑' : '';
        h += '<div class="fRoom' + (isCur ? ' cur' : done ? ' done' : '') + (shut ? ' shut' : '') + (key ? ' key' : '') + '" data-f="' + f + '" style="--bh:' + hue + '">' +
          (C.isBiomeStart(f) ? '<span class="zone">' + C.biomeName(f) + '</span>' : '') +
          '<span class="no">' + (key ? '👑 ' : '') + 'Этаж ' + f + '</span><span class="who">' + who + '</span>' +
          '<span class="st">' + (isCur ? 'вы здесь' : shut ? 'закрыт' : done ? 'пройден · награды меньше' : 'открыт') + (key ? '<br>ключевой босс' : '') + '</span></div>';
      }
      if (mapLo > 1) h += '<div style="text-align:center;padding:8px"><button class="chip" data-mm="down">▼ Ниже</button></div>';
      setHtml('mapList', h);
    }
    $('mapList').addEventListener('click', e => {
      const b = e.target.closest('[data-mm]');
      if (b) { click(); if (b.dataset.mm === 'up') mapHi = Math.min(100000, mapHi + 40); else mapLo = Math.max(1, mapLo - 40); lastHtml.mapList = null; renderMap2(); return; }
      const r = e.target.closest('.fRoom'); if (!r) return;
      const f = +r.dataset.f;
      if (f > s.maxFloor) { toast('Этаж ещё закрыт<small>сначала пройдите этаж ' + s.maxFloor + '</small>'); return; }
      if (s.mode) { toast('Сначала выйдите из режима'); return; }
      click(); handle(C.goToFloor(s, f)); save(); back(); render();
    });


    // ===================== 0.45: Портал, Души и ритуал, PvE — новые страницы =====================
    let xKind = 'portal', ban = 'normal', showHist = false;
    const xStack = [];
    function openX(k) { if (page === 'x' && xKind !== k) xStack.push(xKind); xKind = k; showHist = false; open('x'); $('xBody').scrollTop = 0; }
    // «Назад» на странице X: сначала история → портал, затем предыдущая страница X
    const xBack = document.querySelector('#pgX [data-back]');
    xBack.removeEventListener('click', back);
    xBack.addEventListener('click', () => {
      if (xKind === 'portal' && showHist) { click(); showHist = false; lastHtml = {}; refresh(); return; }
      if (xStack.length) { click(); xKind = xStack.pop(); lastHtml = {}; refresh(); return; }
      back();
    });
    function renderX() {
      const aux = $('xAux');
      if (xKind === 'portal') {
        $('xTitle').textContent = showHist ? 'История призывов' : 'Портал призыва';
        aux.style.display = showHist ? 'none' : ''; aux.textContent = '📜 История';
        setHtml('xTop', (ban === 'event' ? cur('🏮', fmt(s.event.lanterns)) : '') + cur('🎟', fmt(s.tickets)));
        setHtml('xBody', showHist ? histHtml() : portalHtml());
      } else if (xKind === 'souls') {
        $('xTitle').textContent = 'Души и ритуал'; aux.style.display = 'none';
        setHtml('xTop', cur('👻', fmt(s.souls)));
        setHtml('xBody', soulsHtml2());
      } else {
        $('xTitle').textContent = 'PvE'; aux.style.display = 'none';
        setHtml('xTop', cur('✦', fmt(s.essence)) + cur('🎟', fmt(s.tickets)));
        setHtml('xBody', pveHtml2());
      }
    }
    $('xAux').addEventListener('click', () => { click(); showHist = true; lastHtml = {}; refresh(); });

    // ---------- Портал (этап 8): один общий портал, ×1 и ×10, шансы, история, шкала гарантии ----------
    const HIST_KEY = 'prizvannyy_v2_hist';
    function histGet() { try { return JSON.parse(localStorage.getItem(HIST_KEY) || '[]'); } catch (e) { return []; } }
    function histAdd(list) { try { localStorage.setItem(HIST_KEY, JSON.stringify(list.concat(histGet()).slice(0, 100))); } catch (e) {} }
    function portalHtml() {
      const P = CFG.portal, b = C.bannerDef(ban), pity = C.bannerPity(s, ban), pS = b.pityS || P.pityS, pA = b.pityA || P.pityA;
      const base = b.minRarity ? RANKS.indexOf(b.minRarity) : 0;
      const open = RANKS.filter((r, i) => i >= base && C.rarityOpen(s, r) && CFG.allies.some(a => a.rarity === r && !a.hidden && !a.seasonal));
      const tot = open.reduce((x, r) => x + P.odds[r], 0);
      const feat = b.featured ? C.featuredHeroes(s).map(id => CFG.allies.find(a => a.id === id)) : [];
      const c1 = C.canSummon(s, ban, 1), c10 = C.canSummon(s, ban, 10), cost = n => { const c = C.bannerCost(ban, n); return c.lanterns ? '🏮 ' + c.lanterns : '🎟 ' + c.tickets; };
      let h = '<div class="gate"><div class="arch"></div><div class="rift"></div><div class="keyst"></div></div>';
      h += '<div class="banRow">' + P.banners.map(x => '<button class="chip' + (x.id === ban ? ' on' : '') + '" data-ban="' + x.id + '"' + (x.id === 'event' && !C.currentEvent(s) ? ' disabled' : '') + '>' + x.icon + ' ' + x.name + '</button>').join('') + '</div>';
      h += '<div class="hint3">' + b.desc + (feat.length ? '. Герои недели: <b style="color:#ffe8a8">' + feat.map(a => a.name + ' (' + a.rarity + ')').join(', ') + '</b>' : '') + '</div>';
      h += '<div class="pity">S+<div class="bar"><i style="width:' + Math.min(100, pity.s / pS * 100) + '%"></i><b>' + pity.s + ' / ' + pS + '</b></div><span class="rk" style="position:static;' + rvar('S') + '">S</span></div>';
      h += '<div class="pity">A+<div class="bar"><i style="width:' + Math.min(100, pity.a / pA * 100) + '%;background:linear-gradient(90deg,#a03a1a,#ffa64a)"></i><b>' + pity.a + ' / ' + pA + '</b></div><span class="rk" style="position:static;' + rvar('A') + '">A</span></div>';
      if (pity.s > P.softS) h += '<div class="hint3" style="color:#ffd36b">Шанс S повышен!</div>';
      h += '<div class="pullRow"><button class="pullBtn" data-pull="1"' + (c1 ? '' : ' disabled') + '>Призвать ×1<span>' + cost(1) + '</span></button>' +
        '<button class="pullBtn x10" data-pull="10"' + (c10 ? '' : ' disabled') + '>Призвать ×10<span>' + cost(10) + '</span></button></div>';
      if (!c1) h += '<div class="noMoney">⚠ Недостаточно ' + (ban === 'event' ? 'фонарей' : 'билетов') + '</div>';
      h += '<div class="secT">Шансы призыва</div><div class="odds">' + RANKS.slice(base).map(r => {
        const on = open.includes(r), g = CFG.rarityGates[r];
        return '<span class="' + (on ? '' : 'off') + '"><b style="background:' + (RC[r] || '#888') + '">' + r + '</b>' + (on ? (P.odds[r] / tot * 100).toFixed(2) + '%' : (g && !C.rarityOpen(s, r) ? 'с ' + g + ' эт.' : '—')) + '</span>';
      }).join('') + '</div>';
      h += '<div class="hint3">После ' + P.softS + ' призывов без S шанс S растёт с каждым. Гарантии у баннеров раздельные. Билеты — за первое прохождение босса каждого 5-го этажа, на 10-м больше. SS/SSS/GOD открываются рекордом этажа.</div>';
      return h;
    }
    function histHtml() {
      const L = histGet();
      if (!L.length) return '<div class="hint3" style="text-align:center;margin-top:20px">Пока пусто — здесь будут последние 100 призывов.</div>';
      return '<div class="hist">' + L.map(x => { const a = CFG.allies.find(h => h.id === x.id) || { name: x.id };
        return '<div><span><b style="color:' + (RC[x.r] || '#fff') + '">' + x.r + '</b> ' + a.name + (x.n ? ' · <span style="color:#6be37a">новый</span>' : '') + '</span><span>' + new Date(x.t).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) + '</span></div>'; }).join('') + '</div>';
    }
    // анимация: приближение к порталу → по одному (цвет ранга) → общий экран для ×10; «Пропустить» через 1 с
    let fxQ = [], fxAll = [], fxTimer = null;
    function pull2(n) {
      const r = C.summon(s, n, ban); if (!r) return;
      histAdd(r.map(x => ({ id: x.id, r: x.rarity, n: x.isNew ? 1 : 0, t: Date.now(), b: ban })));
      save(); render();
      fxAll = r; fxQ = r.slice();
      const best = r.reduce((m, x) => RANKS.indexOf(x.rarity) > RANKS.indexOf(m.rarity) ? x : m, r[0]);
      $('sumFx').style.setProperty('--fx', RC[best.rarity] || '#b14dff');
      $('sumFx').classList.add('show'); $('sfStage').innerHTML = ''; $('sfSkip').classList.remove('on');
      setTimeout(() => $('sfSkip').classList.add('on'), 1000);
      clearTimeout(fxTimer); fxTimer = setTimeout(fxNext, 600);
    }
    function fxCard(x) {
      const a = CFG.allies.find(h => h.id === x.id), v = ALLY_VIS[x.id] || {}, h = s.heroes[x.id];
      const cut = x.isNew && RANKS.indexOf(x.rarity) >= RANKS.indexOf('A');       // первое получение редкого — короткая кат-сцена
      $('sumFx').style.setProperty('--fx', RC[x.rarity] || '#b14dff');
      $('sfStage').innerHTML = '<div class="sfCard' + (cut ? ' cut' : '') + '" style="' + rvar(x.rarity) + '"><div class="big">' + (v.icon || '✦') + '</div><span class="rk">' + x.rarity + '</span><h3>' + a.name + '</h3>' +
        '<p>' + (x.isNew ? (cut ? '✦ Новый герой призван! ✦' : 'Новый герой') : 'Дубликат · копий: ' + h.copies) + '</p><div class="hint3">' + a.role + '</div></div>';
      click();
      return cut ? 1600 : 900;
    }
    function fxNext() {
      if (fxQ.length) { const d = fxCard(fxQ.shift()); fxTimer = setTimeout(fxNext, d); return; }
      fxSummary();
    }
    function fxSummary() {
      clearTimeout(fxTimer); fxQ = [];
      if (fxAll.length === 1) { $('sfStage').insertAdjacentHTML('beforeend', ''); }
      const grid = fxAll.length > 1 ? '<div class="sfGrid">' + fxAll.map(x => { const a = CFG.allies.find(h => h.id === x.id), v = ALLY_VIS[x.id] || {};
        return '<div style="' + rvar(x.rarity) + '"><b>' + (v.icon || '✦') + '</b><i>' + x.rarity + '</i>' + a.name + '<span style="color:' + (x.isNew ? '#6be37a' : '#b9b1c3') + '">' + (x.isNew ? 'новый' : 'дубликат') + '</span></div>'; }).join('') + '</div>' : $('sfStage').innerHTML;
      $('sfStage').innerHTML = '<div>' + grid + '<div class="sfDone"><button class="upBtn gold" id="sfOk" style="width:160px">Готово</button></div></div>';
      $('sfSkip').classList.remove('on');
    }
    $('sfSkip').addEventListener('click', () => { click(); fxSummary(); });
    $('sfStage').addEventListener('click', e => { if (e.target.id === 'sfOk') { click(); $('sumFx').classList.remove('show'); lastHtml = {}; refresh(); } });

    // ---------- Души и ритуал ----------
    function soulsHtml2() {
      const R = CFG.ritual, ready = C.canRitual(s);
      let h = '<div class="soulBig"><div class="n">👻 ' + fmt(s.souls) + '</div><p>Неизрасходованные души: ' + pctUp(C.soulMult(s)) + ' всего урона (+' + Math.round(CFG.souls.dpsPerSoul * 100) + '% за душу). Траты на артефакты и дерево уменьшают этот бонус — сравнивайте DPS до и после.</p></div>';
      h += '<div class="ritual' + (ready ? ' ready' : '') + '"><h3>🕯 Ритуал</h3>' +
        (ready ? '<p>Сейчас: <b style="color:#8fe6ff">+' + fmt(C.ritualSouls(s)) + ' душ</b>, новый забег с этажа ' + C.ritualStartFloor(s) + '. Чем выше этаж, тем больше душ. Перед ритуалом делается резервная копия.</p>'
               : '<p>Откроется на этаже ' + R.floor + '. Сейчас этаж ' + s.maxFloor + ', рекорд ' + s.bestFloor + (s.rituals ? ', ритуалов: ' + s.rituals : '') + '.</p>') +
        '<button class="upBtn" data-rit style="width:70%"' + (ready ? '' : ' disabled') + '>' + (ready ? 'Провести ритуал' : 'Нужен этаж ' + R.floor) + '</button></div>';
      h += '<div class="secT">Артефакты — в Меню → Артефакты</div>';
      for (const b of CFG.soulTree) {
        const opn = C.branchOpen(s, b);
        h += '<div class="brH">' + b.name + (opn ? '' : '<small>🔒 после ' + b.rituals + ' ритуал' + (b.rituals === 1 ? 'а' : 'ов') + '</small>') + '</div>';
        b.nodes.forEach((n, i) => {
          const lv = C.treeLevel(s, n.id), no = C.treeNodeOpen(s, n.id), c = C.treeCost(s, n.id), can = opn && no && c != null && B.gte(s.souls, c);
          const prev = c != null && no && opn ? C.previewSpend(s, 'tree', n.id, TPS_PREVIEW) : null;
          h += '<div class="tNode' + (opn && (no || lv) ? '' : ' lock') + '"><div class="ic">' + (opn ? n.icon : '?') + '</div><div><b>' + n.name + ' · ' + lv + '/' + n.max + '</b><p>' + n.desc + ' за уровень' +
            (opn && !no ? '. Сначала «' + b.nodes[i - 1].name + '»' : '') + '</p>' + (prev ? dpsChange(prev) : '') + '</div>' +
            (c == null ? '<button class="upBtn" disabled>Макс.</button>' : '<button class="upBtn" data-tree="' + n.id + '"' + (can ? '' : ' disabled') + '>Улучшить<span>👻 ' + fmt(c) + '</span></button>') + '</div>';
        });
      }
      return h;
    }
    function doRitual() {
      if (!C.canRitual(s)) return;
      const souls = C.ritualSouls(s), start = C.ritualStartFloor(s), after = { ...s, souls: B.add(s.souls, souls) };
      ask('<b>Ритуал</b><span class="askList"><b>Получите:</b> +' + fmt(souls) + ' душ (бонус урона ' + pctUp(C.soulMult(s)) + ' → ' + pctUp(C.soulMult(after)) + ')<br>' +
        '<b>Сбросится:</b> золото, уровни удара и героев, найм, этаж — новый забег с этажа ' + start + (C.ritualStartGold(s) ? ' и ◆ ' + fmt(C.ritualStartGold(s)) + ' золота' : '') + '<br>' +
        '<b>Сохранится:</b> дерево душ, герои, звёзды, эволюции, питомцы, материалы, отряд, билеты, эссенция, артефакты, души, рекорды</span>', 'Провести ритуал', () => {
        writeCopy(PRE_RIT);
        const r = C.ritual(s); if (!r) return;
        dmgLog.length = 0; restartAnim('spawn');
        toast('Ритуал проведён<small>+' + fmt(r.souls) + ' 👻 · старт с этажа ' + r.start + '</small>');
        save(); render();
      });
    }

    // ---------- PvE ----------
    const tier2 = {};
    function pveHtml2() {
      const P = CFG.pve, busy = !!s.mode, maxT = C.maxDungeonTier(s);
      let h = busy ? '<div class="noMoney" style="color:#ffd36b">Сейчас идёт «' + s.mode.name + '». Выйти — кнопкой на арене.</div>' : '';
      h += '<div class="secT">Ежедневные подземелья · ' + P.dungeonEnemies + ' врагов за ' + P.dungeonTime + ' с</div>';
      for (const d of P.dungeons) {
        const tt = tier2[d.id] = Math.min(maxT, Math.max(1, tier2[d.id] || maxT)), left = C.attemptsLeft(s, d.id), can = !busy && left > 0;
        h += '<div class="pveCard" style="' + rvar('C') + '"><div class="ic">' + d.icon + '</div><div><b>' + d.name + ' · ' + left + '/' + P.dailyAttempts + '</b><p>' + d.desc + '</p>' +
          '<p>Награда: <em>' + rewardText(C.dungeonReward(s, d.id, tt)) + '</em> · как этаж ' + tt * P.tierFloors + '</p>' +
          '<div class="tier"><button data-t2="' + d.id + ':-1"' + (tt > 1 ? '' : ' disabled') + '>−</button>ур. ' + tt + '<button data-t2="' + d.id + ':1"' + (tt < maxT ? '' : ' disabled') + '>+</button></div></div>' +
          '<button class="upBtn" data-dun2="' + d.id + '"' + (can ? '' : ' disabled') + '>Войти</button></div>';
      }
      const el2 = C.attemptsLeft(s, 'endless'), T = P.trial; C.trialSync(s); const tl = C.attemptsLeft(s, 'trial');
      h += '<div class="secT">Испытания</div>';
      h += '<div class="pveCard" style="' + rvar('B') + '"><div class="ic">∞</div><div><b>Бесконечное подземелье · ' + el2 + '/' + P.endless.attempts + '</b><p>Рекорд: <em>' + s.pve.endlessBest + ' волн</em>. Каждые ' + P.endless.bossEvery + ' — контрольный босс на ' + P.endless.bossTime + ' с; за босса ✦, за новый рубеж 🎟.</p></div>' +
        '<button class="upBtn" data-m2="endless"' + (!busy && el2 ? '' : ' disabled') + '>Войти</button></div>';
      h += '<div class="pveCard" style="' + rvar('S') + '"><div class="ic">🗼</div><div><b>Испытательная башня · ' + tl + '/' + T.attempts + '</b><p>Равные условия: только тапы одной силы, ' + T.time + ' с на стража. Рекорд недели <em>' + s.trial.weekBest + '</em>, за всё время <em>' + s.trial.best + '</em>.</p></div>' +
        '<button class="upBtn" data-m2="trial"' + (!busy && tl ? '' : ' disabled') + '>Войти</button></div>';
      const bosses = C.personalBosses(s), pl = C.attemptsLeft(s, 'personal');
      h += '<div class="secT">Личные боссы · ' + pl + '/' + P.personal.attempts + ' в день · ' + P.personal.time + ' с</div>';
      if (!bosses.length) h += '<div class="pveCard"><div class="ic">?</div><div><b>Пока нет</b><p>Победите финального босса биома (этаж 50) — он станет личным боссом.</p></div></div>';
      for (const b of bosses) h += '<div class="pveCard" style="' + rvar('A') + '"><div class="ic">👹</div><div><b>' + b.name + '</b><p>' + b.biome + ' · этаж ' + b.floor + '</p></div><div></div><div class="diffRow">' +
        P.personal.diffs.map(D => '<button class="upBtn" data-pb2="' + b.id + ':' + D.id + '"' + (!busy && pl ? '' : ' disabled') + '>' + D.name + '<small>' + rewardText(C.personalReward(s, b.floor, D.id)) + '</small></button>').join('') + '</div></div>';
      h += '<div class="secT">Рейтинги и мировой босс</div><div class="pveCard"><div class="ic">🌍</div><div><b>Скоро</b><p>Рейтинги игроков и общий мировой босс появятся вместе с сервером и аккаунтами.</p></div></div>';
      return h;
    }
    function goMode(kind, opts) { const before = s.mode; startMode(kind, opts); if (!before && s.mode) { stack.length = 0; page = null; show(null); } }

    $('xBody').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b || b.disabled) return;
      const d = b.dataset;
      if (d.ban) { click(); ban = d.ban; }
      else if (d.pull) { click(); pull2(+d.pull); }
      else if (d.rit !== undefined) { click(); doRitual(); return; }
      else if (d.tree) { click(); if (C.buyTreeNode(s, d.tree)) save(); }
      else if (d.t2) { click(); const [id, dl] = d.t2.split(':'); tier2[id] = (tier2[id] || 1) + +dl; }
      else if (d.dun2) { click(); goMode('dungeon', { id: d.dun2, tier: tier2[d.dun2] }); }
      else if (d.m2) { click(); goMode(d.m2, {}); }
      else if (d.pb2) { click(); const [id, diff] = d.pb2.split(':'); goMode('personal', { id, diff }); }
      else return;
      render();
    });

    // ---------- обновление ----------
    function refresh() {
      // волна и % HP на экране боя
      if (!s.mode) $('waveLbl').textContent = 'Волна ' + Math.min(s.enemyIndex, CFG.enemiesPerFloor) + '/' + CFG.enemiesPerFloor; else $('waveLbl').textContent = '';
      const en = s.enemy; if (en && B.gt(en.maxHp, 0)) el.hpText.textContent = fmt(en.hp) + ' / ' + fmt(en.maxHp) + ' (' + Math.ceil(B.toNum(B.div(en.hp, en.maxHp)) * 100) + '%)';
      $('cbMenuBang').classList.toggle('on', !!(navBang.up || navBang.heroes || navBang.souls));
      $('cbPveBang').classList.toggle('on', !!navBang.pve);
      // старая вкладка закрылась сама (например, старт режима PvE) — снять полноэкранную обёртку
      if (document.body.classList.contains('oldOpen') && $('panel').classList.contains('collapsed')) document.body.classList.remove('oldOpen');
      if (page === 'menu') renderMenu();
      else if (page === 'sec') renderSec();
      else if (page === 'map') renderMap2();
      else if (page === 'x') renderX();
    }
    ui2Refresh = refresh;
    refresh();
  })();
