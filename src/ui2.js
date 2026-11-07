  // ===================== UI 2 (0.40) — по docs/ui/UI_MASTER_v2.md =====================
  // Новые экраны поверх старой логики: 4 угловые кнопки, главное меню, Прокачка, Артефакты, Сумка, Питомцы, Карта Башни.
  // Остальные разделы пока открываются старыми вкладками внутри полноэкранной страницы (TODO: свой дизайн).
  var ui2Refresh = null;
  (function () {
    const RC = { E: '#9a96a6', D: '#c8783a', C: '#2fd07a', B: '#3a8cff', A: '#b04dff', S: '#ffb52e', SS: '#ff3a4a', SSS: '#9fe6ff', GOD: '#fff2a0' };  // 0.73: цвета рангов по референсу пользователя (сталь, бронза, изумруд, сапфир, аметист, золото, рубин, платина, спектр)
    const rvar = r => '--rc:' + (RC[r] || '#6e6678') + ';--rg:' + (RC[r] || '#6e6678') + '88';
    const SECS = [['up', '⚔', 'Прокачка', '#d6a640'], ['art', '💎', 'Артефакты', '#b14dff'], ['bag', '🎒', 'Сумка', '#3a8fe0'], ['pets', '🐉', 'Питомцы', '#4cbf5a']];
    const MORE = [['@portal', '🌀', 'Портал'], ['heroes', '🪖', 'Герои и отряд'], ['@souls', '👻', 'Души и регрессия'], ['altar', '🕯', 'Алтарь'], ['quests', '📜', 'Задания'],
      ['season', '🎖', 'Сезон'], ['events', '🏮', 'События'], ['inbox', '📬', 'Награды'], ['runes', 'ᚦ', 'Руны'], ['bones', '🦴', 'Кости'], ['stats', '📊', 'Статистика'], ['diary', '📖', 'Дневник'], ['@backup', '💾', 'Резервные копии']];
    let page = null, sec = 'up', artTab = 'got', artSel = null, artN = 1, bagCat = 'all', bagSort = 'rar', bagQ = '', petSel = null, lastHtml = {};
    const stack = [];
    const heroImg = (document.querySelector('#cards .cardIcon img') || {}).src || '';

    // короткий звук нажатия (WebAudio, без файлов)
    let actx = null;
    function click() {
      if (setg.snd === 'off' || setg.uisnd === 'off') return;
      try {
        actx = actx || new (window.AudioContext || window.webkitAudioContext)();
        const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime;
        o.type = 'triangle'; o.frequency.setValueAtTime(520, t); o.frequency.exponentialRampToValueAtTime(260, t + 0.07);
        g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
        o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + 0.1);
      } catch (e) {}
    }
    function setHtml(id, html) { if (lastHtml[id] !== html) { $(id).innerHTML = html; lastHtml[id] = html; } }
    function cur(icon, val, gold) { return '<div class="cur' + (gold ? ' g' : '') + '"><i>' + icon + '</i>' + val + '<b class="plus" data-shop>+</b></div>'; }
    document.addEventListener('click', e => { if (e.target.closest('.pgTop [data-shop]') && window.U3 && window.U3.menuAct) { click(); window.U3.menuAct('shop'); } });
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
      if (t === 'quests' && window.QS_ART) { openQuests(); return; }
      if (t === 'diary' && window.DY_ART) { stack.length = 0; page = null; openX('diary'); return; }   // 0.127: новый Дневник
      if (t === 'heroes' && window.HS_ART) { stack.length = 0; page = null; hsSel = null; openX('heroes'); return; }   // 0.122: новый экран Героев   // 0.118: новый экран Заданий
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
    // 0.66: пока экран профиля (этап 11) не согласован — кнопка открывает прежние настройки (экономия, запись чисел, фоторежим…)
    $('cbSet').addEventListener('click', e => { e.stopPropagation(); press(e.currentTarget); $('settingsBtn').click(); });
    $('cbPve').addEventListener('click', e => { e.stopPropagation(); press(e.currentTarget); stack.length = 0; page = null; openX('pve'); });
    // 0.68: профиль (левый верхний угол) — статы и прокачка героя
    $('tbProf').addEventListener('click', e => { e.stopPropagation(); press(e.currentTarget); stack.length = 0; page = null; sec = 'up'; artSel = null; open('sec'); });
    $('cbMap').addEventListener('click', e => { e.stopPropagation(); press(e.currentTarget); stack.length = 0; page = null; open('map'); });

    // ---------- главное меню ----------
    function renderMenu() {
      setHtml('mTop', cur('◆', fmt(s.gold), true) + cur('🎟', fmt(s.tickets)) + cur('👻', fmt(s.souls)));
      const sub = { up: 'Главный герой и союзники', art: 'Все найденные действуют сразу', bag: 'Материалы, билеты, руны, кости', pets: 'Призванное существо в бою' };
      const bang = { up: navBang.up, art: navBang.souls, bag: false, pets: CFG.pets.list.some(p => C.canEvolvePet(s, p.id)) };
      let h = SECS.map(([id, ic, nm, c]) => '<button class="mCard" data-sec="' + id + '" style="--tc:' + c + '"><span class="ic">' + ic + '</span><span><span class="nm">' + nm + '</span><small>' + sub[id] + '</small></span>' +
        (bang[id] ? '<i class="bang2">!</i>' : '') + '</button>').join('');
      // 0.69: «Другие разделы» по группам
      const GR = [['Герои', [['@portal', '🌀', 'Портал'], ['heroes', '🪖', 'Герои и отряд'], ['diary', '📖', 'Дневник']]],
        ['Сила', [['@souls', '👻', 'Души и регрессия'], ['@tree', '✴', 'Дерево навыков'], ['altar', '🕯', 'Алтарь'], ['runes', 'ᚦ', 'Руны'], ['bones', '🦴', 'Кости']]],
        ['Награды', [['quests', '📜', 'Задания'], ['inbox', '📬', 'Почта'], ['@login', '📅', 'Вход 7/30'], ['season', '🎖', 'Сезон'], ['events', '🏮', 'События']]],
        ['Прочее', [['@shop', '🛒', 'Магазин'], ['@prof', '👤', 'Профиль'], ['@set', '⚙', 'Настройки'], ['@backup', '💾', 'Копии']]]];
      for (const [g, list] of GR) h += '<div class="grpT">' + g.toUpperCase() + '</div><div class="mMore">' +
        list.map(([id, ic, nm]) => '<button data-old="' + id + '"><b>' + ic + '</b>' + nm + (navBang[id.replace('@', '')] ? '<i class="bang2">!</i>' : '') + '</button>').join('') + '</div>';
      setHtml('mBody', h);
    }
    $('mBody').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.sec) { click(); sec = b.dataset.sec; artSel = null; open('sec'); }
      else if (b.dataset.old === '@backup') { click(); popBackups(); }
      else if (b.dataset.old === '@photo') { click(); stack.length = 0; page = null; show(null); photoMode(true); }
      else if (b.dataset.old === '@portal' || b.dataset.old === '@souls') { click(); openX(b.dataset.old.slice(1)); }
      else if (b.dataset.old === '@tree') { click(); openX('souls'); setTimeout(() => { const t = document.querySelector('#xBody .secT:nth-of-type(2), #xBody [data-tree]'); if (t) t.scrollIntoView({ block: 'start' }); }, 60); }
      else if (b.dataset.old && b.dataset.old.startsWith('@') && window.U3 && window.U3.menuAct) { click(); window.U3.menuAct(b.dataset.old.slice(1)); }
      else if (b.dataset.old) openOld(b.dataset.old);
    });

    // ---------- разделы с вкладками ----------
    function renderSec() {
      const SECS_ON = SECS.filter(([id]) => id === 'art' ? C.unlockedAt(s, 'artifacts') : id === 'pets' ? C.unlockedAt(s, 'pets') : id === 'bag' ? C.unlockedAt(s, 'bag') : true);
      if (!SECS_ON.some(x => x[0] === sec)) sec = 'up';
      const TB = { up: !el.buyTap.disabled || CFG.allies.some(a => s.allies[a.id].level > 0 && allyUi[a.id] && !allyUi[a.id].btn.disabled), art: navBang.souls, pets: CFG.pets.list.some(p => C.canEvolvePet(s, p.id)) };
      setHtml('sTabs', SECS_ON.map(([id, ic, nm, c]) => '<button data-st="' + id + '" class="' + (id === sec ? 'on' : '') + '" style="--tc:' + c + '"><b>' + ic + '</b>' + nm + (window.HQ_ART && TB[id] ? '<i class="hqBang">!</i>' : '') + '</button>').join(''));
      const top = sec === 'up' && window.HQ_ART ? '<div class="cur d"><i></i>' + (($('tbDps') || {}).textContent || '0') + '</div><div class="cur f"><i></i>' + fmt(C.tapHit(s)) + '</div><div class="cur g"><i></i>' + fmt(s.gold) + '</div>' +
          '<div class="hqMat"><span><i>' + M.shard.icon + '</i>' + fmt(s.materials.shard) + '</span><span><i>🎟</i>' + fmt(s.tickets) + '</span></div>'
        : sec === 'up' ? cur(M.shard.icon, fmt(s.materials.shard)) + cur('◆', fmt(s.gold), true)
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
    // 0.69 (ответ 70): звёзды — число + одна звезда, цвет по ступени (1–5 золото, 6–10 алые, 11–15 фиолетовые)
    function stars(n) {
      const tier = n ? Math.floor((n - 1) / 5) : 0;
      return '<div class="stars" style="--sc:' + STAR_C[tier] + '">' + (n ? '<b>★</b>' + n : '★0') + '</div>';
    }
    // веха уровня: сколько осталось до следующего ×3 и полоска от прошлой вехи
    function msLine(lv) {
      const nx = C.nextMilestone(lv); let pv = 0; for (const m of CFG.milestones) if (m <= lv) pv = m;
      if (lv >= (CFG.milestones[CFG.milestones.length - 1] || 0)) pv = nx - CFG.milestoneEvery;
      const p = Math.max(0, Math.min(1, (lv - pv) / Math.max(1, nx - pv)));
      return '<div class="ln" style="font-size:11px;color:#c9b8dd">до ×' + CFG.milestoneMult + ': ' + fmt(nx - lv) + ' ур.</div><div class="msBar"><i style="width:' + (p * 100).toFixed(0) + '%"></i></div>';
    }
    const gainOf = html => { const m = /→ <b>([^<]+)<\/b>/.exec(html || ''); return m ? m[1] : ''; };
    // 0.84: Штаб — карточки по пакету пользователя (docs/reference/hq_pack, assets/hq, src/hq.js): рамка ранга поверх портрета, звёзды картинками, кнопка с ценой
    const HQ_FR = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'GOD'];
    const HQ_FA = { 'Свет': 'light', 'Буря': 'elements', 'Лёд': 'elements', 'Пламя': 'elements', 'Нежить': 'undead', 'Кровь': 'demons', 'Война': 'machines', 'Дикий лес': 'nature', 'Тени': 'shadow', 'Бездна': 'void' };
    const HQ_ST = ['gold', 'red', 'purple', 'rainbow'];
    function hqStars(n) {
      if (!n) return '';
      const A = window.HQ_ART, t = Math.min(3, Math.floor((n - 1) / 5)), k = n - t * 5, base = t ? HQ_ST[t - 1] : 'unlit';
      let h = '<div class="hqSt">'; for (let i = 0; i < 5; i++) h += '<img src="' + A['st_' + (i < k ? HQ_ST[t] : base)] + '" alt="">'; return h + '</div>';
    }
    // 0.115: значок следующей вехи уровня, как в «Крушителях» (иконка + уровень, на котором урон ×milestoneMult)
    function hqMs(lv, ic) { return '<div class="hqMs" title="на этом уровне урон ×' + CFG.milestoneMult + '"><i>' + ic + '</i>' + fmt(C.nextMilestone(lv)) + '</div>'; }
    function hqHtml() {
      const A = window.HQ_ART, RNr = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
      const QM = [[1, '×1'], [10, '×10'], [100, '×100'], ['max', 'MAX']];
      let h = '';
      let mb = $('hqMult'); if (!mb) { mb = document.createElement('button'); mb.id = 'hqMult'; $('sTitle').parentNode.appendChild(mb);
        mb.addEventListener('click', () => { click(); $('multCycle').click(); lastHtml = {}; refresh(); }); }
      mb.innerHTML = '<b>' + ((MULTS.find(x => x[0] === mult) || MULTS[0])[1]).replace('×', 'x') + '</b>'; mb.style.display = sec === 'up' ? '' : 'none';
      const btn = (key, src) => {
        const t = src.innerHTML, m = /^(.*?)<span>(.*)<\/span>$/.exec(t) || [0, t, ''];
        return '<button class="hqBtn' + (src.disabled ? ' off' : '') + (/Нанять/.test(t) ? ' hire' : '') + '" data-ub="' + key + '"' + (src.disabled ? ' disabled' : '') + '><img src="' + A[src.disabled ? 'btn_off' : 'btn_up'] + '" alt=""><b>' + m[1] + '</b><span>' + m[2] + '</span></button>';
      };
      const card = (fr, pt, attrs, name, fa, lines, stars, b, off) => '<div class="hqCard' + (off ? ' off' : '') + '"><div class="hqPt"' + attrs + ' style="--fr:url(&quot;' + A['fr_' + fr] + '&quot;)"><div class="fg">' + pt + '</div><img class="hqFr" src="' + A['fr_' + fr] + '" alt=""><span class="hqRk" style="' + rvar(fr) + '">' + fr + '</span>' + stars + '</div>' +
        '<div class="hqInf"><div class="nm">' + (fa && A['fa_' + fa] ? '<img src="' + A['fa_' + fa] + '" alt="">' : '') + '<span>' + name + '</span></div>' + lines + '</div>' + b + '</div>';
      const r = C.rankLabel(s.heroRank);
      h += card(HQ_FR[Math.min(8, Math.max(0, (r.rank || 1) - 1))], heroImg ? '<img src="' + heroImg + '" alt="">' : '🗡', '', 'Призванный', null,
        '<div class="ln">Ур. <b>' + fmt(s.tapLevel) + '</b> · ранг ' + RNr[r.rank || 1] + '</div><div class="ln"><i class="dcI">✊</i><b>' + fmt(C.tapHit(s)) + '</b></div>' + hqMs(s.tapLevel, '✊'), '', btn('hero', el.buyTap));
      // 0.101 (решение пользователя 06.11): список по возрастанию урона, как в «Крушителях» — сверху слабые, внизу сильные,
      // ниже всех — «Новый герой» из цепочки. Порядок по силе героя (урон на 1 уровне со звёздами и эволюцией), поэтому
      // карточки не прыгают при прокачке; после регрессии все открытые на своих местах — листаешь вниз к сильнейшим.
      const pw = id => B.log10(B.max(B.mul(C.allyDpsAt(id, 1), C.starMult(s, id) * C.evoMult(s, id)), 1e-300));
      const list = CFG.allies.slice().sort((a, b) => pw(a.id) - pw(b.id));
      for (const a of list) {
        const hh = s.heroes[a.id], lv = s.allies[a.id].level, u = allyUi[a.id];
        // 0.87.1: призванные в портале видны сразу (с кнопкой «Нанять»); стартовые без найма — только если пришли из портала (ответ 7)
        if (!hh.unlocked) continue;
        if (CFG.cage && !(lv > 0) && a.starter && !C.chainOwned(s, a.id)) continue;   // 0.99: стартовые — после покупки в цепочке
        const dps = lv ? B.mul(C.allyDps(s, a.id), C.permMult(s, 'ally')) : C.allyDpsAt(a.id, 1);
        const fig = ALLY_VIS[a.id].avatarImg || allySvg(ALLY_VIS[a.id], hh.evo);
        h += card(a.rarity, fig + (C.canStar(s, a.id) ? '<i class="plus">+</i>' : ''), ' data-hv="' + a.id + '"', a.name, HQ_FA[a.faction],
          '<div class="ln">Ур. <b>' + fmt(lv) + '</b></div><div class="ln"><img class="ic" src="' + A.ic_attack + '" alt=""><b>' + fmt(dps) + '</b></div>' + hqMs(lv, '🗡'), hqStars(hh.stars), btn(a.id, u.btn), !lv);
      }
      // 0.99: следующий герой цепочки за золото (как в «Крушителях»): один, по возрастанию цены; A+ — только Портал
      const nx = C.chainNext(s);
      if (nx) {
        const a = CFG.allies.find(x => x.id === nx), cost = a.hireCost, can = B.gte(s.gold, cost);
        const fig = ALLY_VIS[a.id].avatarImg || allySvg(ALLY_VIS[a.id], 0);
        h += card(a.rarity, fig, '', a.name, HQ_FA[a.faction],
          '<div class="ln">Новый герой</div><div class="ln"><img class="ic" src="' + A.ic_attack + '" alt=""><b>' + fmt(C.allyDpsAt(a.id, 1)) + '</b></div>', '',
          '<button class="hqBtn hire' + (can ? '' : ' off') + '" data-chain="1"' + (can ? '' : ' disabled') + '><img src="' + A[can ? 'btn_up' : 'btn_off'] + '" alt=""><b>Нанять</b><span>' + fmt(cost) + '</span></button>', true);
      }
      return h;
    }
    function upHtml() {
      if (window.HQ_ART) return hqHtml();
      // 0.75: карточки «как в Крушителях» (docs/reference/dungeon-crusher/upgrade_card_user.jpg)
      const mlab = (MULTS.find(x => x[0] === mult) || [0, '×1'])[1];
      let h = '<div class="dcTop"><span class="dcTtl">Герои</span><button class="dcMult" data-mc>' + mlab + '</button></div>';
      const r = C.rankLabel(s.heroRank), RN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
      const ms = lv => '<span class="dcMs" title="следующая веха ×' + CFG.milestoneMult + '">✦ ' + fmt(C.nextMilestone(lv)) + '</span>';
      const btn = (key, src) => '<button class="upBtn dc' + (src.classList.contains('hire') ? ' hire' : '') + '" data-ub="' + key + '"' + (src.disabled ? ' disabled' : '') + '>' + src.innerHTML + '</button>';
      h += '<div class="dcCard pin"><div class="pt">' + (heroImg ? '<img src="' + heroImg + '" alt="">' : '🗡') + '<span class="rk">' + RN[r.rank || 1] + '</span></div>' +
        '<div class="inf"><div class="nm">Призванный</div><div class="ln">ур.: <b>' + fmt(s.tapLevel) + '</b></div>' +
        '<div class="ln"><i class="dcI">✊</i><b>' + fmt(C.tapHit(s)) + '</b></div>' + ms(s.tapLevel) + '</div>' + btn('hero', el.buyTap) + '</div>';
      const list = CFG.allies.slice().sort((a, b) => {
        const ua = s.heroes[a.id].unlocked, ub = s.heroes[b.id].unlocked;
        if (ua !== ub) return ua ? -1 : 1;
        const sa = C.inSquad(s, a.id), sb = C.inSquad(s, b.id);
        if (sa !== sb) return sa ? -1 : 1;
        return RANKS.indexOf(b.rarity) - RANKS.indexOf(a.rarity);
      });
      for (const a of list) {
        const hh = s.heroes[a.id], lv = s.allies[a.id].level, u = allyUi[a.id];
        if (CFG.cage && !(lv > 0)) continue;   // 0.80: в списке только те, кто уже в отряде (Шорох — после клетки); остальных приведёт портал
        const fig = '<div class="fg">' + (ALLY_VIS[a.id].avatarImg || allySvg(ALLY_VIS[a.id], hh.evo)) + '</div>';
        if (!hh.unlocked) {
          // ответ 72: чёрный силуэт с замком; отдельная тёмная карточка
          h += '<div class="dcCard lock"><div class="pt">' + fig + '<i class="lk">🔒</i></div>' +
            '<div class="inf"><div class="nm">' + a.name + '</div><button class="dcFree" data-free="' + a.id + '">Освободить героя</button></div></div>';
          continue;
        }
        const plus = C.canStar(s, a.id);
        const dps = lv ? B.mul(C.allyDps(s, a.id), C.permMult(s, 'ally')) : C.allyDpsAt(a.id, 1);
        const crown = RANKS.indexOf(a.rarity) >= RANKS.indexOf('S');
        h += '<div class="dcCard' + (lv ? '' : ' off') + '" style="' + rvar(a.rarity) + '"><div class="pt" data-hv="' + a.id + '">' + fig +
          (plus ? '<i class="plus">+</i>' : '') + (crown ? '<i class="crown">👑</i>' : '') + '<span class="rk">' + a.rarity + '</span>' + stars(hh.stars) + '</div>' +
          '<div class="inf"><div class="nm">' + a.name + '</div><div class="ln">ур.: <b>' + fmt(lv) + '</b></div>' +
          '<div class="ln"><i class="dcI">🗡</i><b>' + fmt(dps) + '</b></div>' + ms(lv) + '</div>' + btn(a.id, u.btn) + '</div>';
      }
      return h;
    }

    function artCan(a, c) { return a.blood ? s.materials.shard >= c : B.gte(s.souls, c); }
    // Артефакты: сетка 4 в ряд, отдельная страница улучшения (×1/×10/×100/MAX)
    function artHtml() {
      if (artSel) {
        const a = CFG.artifacts.find(x => x.id === artSel), lv = C.artLevel(s, a.id), c = C.upgradeArtCost(s, a.id);
        const prev = c != null ? C.previewSpend(s, 'upgrade', a.id, TPS_PREVIEW) : null;
        return '<div class="multRow">' + [[1, '×1'], [10, '×10'], [100, '×100'], ['max', 'MAX']].map(([v, t]) => '<button class="chip' + (artN === v ? ' on' : '') + '" data-an="' + v + '">' + t + '</button>').join('') + '</div>' +
          '<div class="detBox" style="' + rvar(lv >= (a.max || 1e9) ? 'S' : 'B') + '"><div class="big">' + a.icon + '</div><h3>' + a.name + '</h3>' +
          '<div class="cmp">Ур. ' + lv + (a.max ? ' / ' + a.max : '') + '</div><p>' + a.desc + '</p>' + (prev ? dpsChange(prev) : '') +
          (c == null ? '<button class="upBtn" disabled style="width:70%;margin-top:10px">Максимум</button>'
                     : '<button class="upBtn" data-aup="' + a.id + '" style="width:70%;margin-top:10px"' + (artCan(a, c) ? '' : ' disabled') + '>Улучшить' +
                       (artN !== 1 ? ' ' + (artN === 'max' ? 'MAX' : '×' + artN) : '') + '<span>' + (a.blood ? '🔹 ' : '👻 ') + fmt(c) + (artN !== 1 ? ' за ур.' : '') + '</span></button>') + '</div>';
      }
      const KORD = a => (a.kind || '').replace(/^(all|tap|ally|hero)/, m => ({ all: '0', tap: '1', ally: '2', hero: '3' }[m] || m));
      const got = CFG.artifacts.filter(a => C.artLevel(s, a.id) > 0).sort((x, y) => (x.blood ? 1 : 0) - (y.blood ? 1 : 0) || KORD(x).localeCompare(KORD(y)));
      // 0.92: витрина как в Крушителях — «Души» и «Кровь» (за осколки)
      let h = '<div class="multRow"><button class="chip' + (artTab === 'got' ? ' on' : '') + '" data-at="got">Полученные (' + got.length + ')</button>' +
        '<button class="chip' + (artTab === 'not' ? ' on' : '') + '" data-at="not">⚒ Витрина</button></div>';
      if (artTab === 'not') {
        for (const br of ['soul', 'blood']) {
          const cur = br === 'blood' ? '🔹' : '👻', have = br === 'blood' ? s.materials.shard : s.souls;
          const bc = C.shopBuyCost(s, br), rc = C.shopRefreshCost(s, br), off = C.shopOffers(s, br);
          h += '<div class="shopBr"><div class="shopHd"><b>' + (br === 'blood' ? '🩸 Кровавые артефакты' : '👻 Артефакты душ') + '</b><span>' + cur + ' ' + fmt(have) + '</span></div>';
          if (bc == null) { h += '<p class="hint3" style="text-align:center">Все найдены</p></div>'; continue; }
          h += '<div class="shopRow">' + off.map((id, i) => {
            if (!id) return '<div class="shopCard sold"><span class="ai">✔</span><span class="an">Куплено</span></div>';
            const a = CFG.artifacts.find(x => x.id === id), can = B.gte(have, bc);
            return '<div class="shopCard"><span class="ai">' + a.icon + '</span><span class="an">' + a.name + '</span><small>' + a.desc + '</small>' +
              '<button class="upBtn" data-sbuy="' + br + ':' + i + '"' + (can ? '' : ' disabled') + '>Купить<span>' + cur + ' ' + fmt(bc) + '</span></button></div>';
          }).join('') + '</div>';
          h += '<div style="text-align:center;margin:6px 0 12px"><button class="upBtn" data-sref="' + br + '" style="width:auto;padding:4px 16px"' + (B.gte(have, rc) ? '' : ' disabled') + '>⟳ Обновить<span>' + cur + ' ' + fmt(rc) + '</span></button></div></div>';
        }
        return h;
      }
      h += '<div class="grid4">' + got.map(a => {
        const lv = C.artLevel(s, a.id), c = C.upgradeArtCost(s, a.id), can = c != null && artCan(a, c);
        return '<button class="aCell" data-art="' + a.id + '" style="' + rvar(a.max && lv >= a.max ? 'S' : a.blood ? 'SS' : 'B') + '">' +
          '<span class="lv">Ур. ' + lv + '</span><span class="ai">' + a.icon + '</span><span class="an">' + a.name + '</span>' +
          (can ? '<i class="bang2" style="top:-4px;right:-4px">!</i>' : '') + '</button>';
      }).join('') + '</div>';
      return h;
    }

    // Сумка: 5 в ряд, категории, поиск, сортировка, окно предмета
    function bagItems() {
      const it = [];
      const add = (o) => { if (o.n > 0 || o.always) it.push(o); };
      add({ id: 'shard', cat: 'shard', icon: M.shard.icon, name: M.shard.name, n: s.materials.shard, r: 2, desc: 'Падают с боссов. Ранги героев и улучшение питомцев.' });
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
      const seen = bagSeen(), canSel = x => x.id[0] === 'b' && x.id !== 'b';
      h += '<div class="sortRow" style="justify-content:space-between"><span>Кости: ' + s.bones.length + ' / ' + BAG_CAP + '</span>' +
        (bagSel ? '<span><button class="chip" data-bsel="off">Отмена</button> <button class="upBtn" data-bsell style="width:auto;min-height:30px;padding:0 10px"' + (bagSel.size ? '' : ' disabled') + '>Продать ' + bagSel.size + '</button></span>'
                : '<button class="chip" data-bsel="on">☑ Выбрать</button>') + '</div>';
      const cells = list.map(x => '<button class="iCell' + (bagSel && bagSel.has(x.id) ? ' sel' : '') + (bagSel && !canSel(x) ? ' dim' : '') + '" data-item="' + x.id + '" style="position:relative;' + rvar(RAR_BY_N[Math.min(RAR_BY_N.length - 1, x.r)]) + (bagSel && !canSel(x) ? ';opacity:.35' : '') + '">' +
        (/^(b|r|pf_)/.test(x.id) && !seen[x.id] ? '<span class="newDot">NEW</span>' : '') + x.icon + (x.n > 1 ? '<span class="q">' + fmt(x.n) + '</span>' : '') + '</button>');
      const total = Math.max(30, Math.ceil(cells.length / 5) * 5 + 5);
      for (let i = cells.length; i < total; i++) cells.push('<div class="iCell empty">✦</div>');
      return h + '<div class="grid5 bagGrid">' + cells.join('') + '</div>';
    }
    const BAG_CAP = 200, SEEN_KEY = 'prizvannyy_bagseen';
    let bagSel = null;
    function bagSeen() {
      let m = null; try { m = JSON.parse(localStorage.getItem(SEEN_KEY) || 'null'); } catch (e) {}
      if (!m) { m = {}; for (const x of bagItems()) m[x.id] = 1; try { localStorage.setItem(SEEN_KEY, JSON.stringify(m)); } catch (e) {} }
      return m;
    }
    function markSeen(id) { const m = bagSeen(); if (!m[id]) { m[id] = 1; try { localStorage.setItem(SEEN_KEY, JSON.stringify(m)); } catch (e) {} } }
    function popItem(id) {
      if (bagSel) { if (id[0] === 'b') { const bo = s.bones.find(q => 'b' + q.id === id); if (bo && (bo.lock || bo.on)) { toast('Нельзя продать<small>' + (bo.on ? 'кость надета' : 'кость под защитой') + '</small>'); return; } bagSel.has(id) ? bagSel.delete(id) : bagSel.add(id); lastHtml.sBody = null; refresh(); } return; }
      markSeen(id); lastHtml.sBody = null;
      const x = bagItems().find(i => i.id === id); if (!x) return;
      $('ui2PopBox').style.cssText = rvar(RAR_BY_N[Math.min(RAR_BY_N.length - 1, x.r)]);
      $('ui2PopBox').innerHTML = '<div class="big">' + x.icon + '</div><h3>' + x.name + '</h3><div class="ln" style="font:400 15px Russo One,system-ui">× ' + fmt(x.n) + '</div><p>' + (x.desc || '') + '</p>' +
        '<div class="row">' + (x.go ? '<button class="upBtn alt" data-pgo="' + x.go + '">Использовать</button>' : '') + (id[0] === 'b' && id !== 'b' ? '<button class="upBtn alt" data-psell="' + id + '">Продать</button>' : '') +
        '<button class="upBtn alt" data-pwhere="' + id + '">Где добыть</button><button class="upBtn" data-pclose>Закрыть</button></div>';
      $('ui2Pop').classList.add('show');
    }
    // Резервные копии: только прошедшие проверку; откат — с подтверждением, текущее состояние тоже сохраняется
    function popBackups() {
      const list = backupList();
      const row = c => '<div class="bakRow"><b>' + (c.kind === 'ritual' ? '🕯 Перед регрессией' : '💾 Автокопия') + ' · ' + new Date(c.t).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) + '</b>' +
        '<p>Этаж ' + c.st.floor + ' (рекорд ' + c.st.bestFloor + ') · ◆ ' + fmt(c.st.gold) + ' · 👻 ' + fmt(c.st.souls) + '</p>' +
        '<button class="upBtn alt" style="width:100%;min-height:34px" data-rest="' + c.key + '">Вернуть эту копию</button></div>';
      $('ui2PopBox').style.cssText = '';
      $('ui2PopBox').innerHTML = '<div class="big">💾</div><h3>Резервные копии</h3><p>Три копии обновляются по кругу раз в 5 минут, ещё одна делается перед каждой регрессией. Если сохранение повредится, игра сама поднимется из последней целой копии.</p>' +
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
      if (b && b.dataset.pwhere) { const w = WHERE[b.dataset.pwhere[0] === 'b' ? 'bone' : b.dataset.pwhere[0] === 'r' && b.dataset.pwhere !== 'r' ? 'rune' : b.dataset.pwhere.startsWith('pf_') ? 'pf' : b.dataset.pwhere] || 'Источник появится позже.'; toast('Где добыть<small>' + w + '</small>'); }
      if (b && b.dataset.psell) { const bid = +b.dataset.psell.slice(1); $('ui2Pop').classList.remove('show'); sellBones([bid]); }
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

    function bestSquad() {
      const pw = id => s.allies[id].level > 0 ? B.log10(B.max(C.allyDps(s, id), 1e-300)) : -1e9;
      const ids = CFG.allies.filter(a => s.heroes[a.id].unlocked).map(a => a.id).sort((x, y) => pw(y) - pw(x)).slice(0, CFG.squadSize);
      for (const id of [...s.squad]) C.squadRemove(s, id);
      for (const id of ids) C.squadAdd(s, id);
    }
    const WHERE = { shard: 'Боссы этажей, подземелье «Осколки», задания', dust: 'Продажа (переработка) костей', tickets: 'Боссы каждого 5-го этажа, задания, вехи', lanterns: 'Задания события недели',
      essence: 'Подземелья, задания, бесконечный режим', bone: 'Падают с монстров и боссов', rune: 'Подземелье рун', pf: 'Хранитель питомца в подземелье' };
    function sellBones(ids) {
      const list = ids.map(i => s.bones.find(q => q.id === i)).filter(Boolean);
      if (!list.length) return;
      ask('<b>Продать ' + list.length + ' кост' + (list.length === 1 ? 'ь' : list.length < 5 ? 'и' : 'ей') + '?</b><span class="askList">Они исчезнут навсегда, взамен — костяная пыль ⚱. Надетые и защищённые не продаются.</span>', 'Продать', () => {
        const r = C.recycleBones(s, list.map(q => q.id)); bagSel = null; lastHtml = {};
        if (r) { toast('Продано: ' + r.count + '<small>+' + fmt(r.dust) + ' ⚱ пыли</small>'); save(); } refresh(); });
    }
    $('sBody').addEventListener('click', e => {
      const bs = e.target.closest('[data-bsel]'); if (bs) { click(); bagSel = bs.dataset.bsel === 'on' ? new Set() : null; lastHtml.sBody = null; refresh(); return; }
      if (e.target.closest('[data-bsell]')) { click(); sellBones([...bagSel].map(i => +i.slice(1))); return; }
      const hv = e.target.closest('[data-hv]'); if (hv && window.U3 && window.U3.openHero) { click(); window.U3.openHero(hv.dataset.hv); return; }
      const b = e.target.closest('button'); if (!b || b.disabled) return;
      const d = b.dataset;
      if (d.ub) { click(); (d.ub === 'hero' ? el.buyTap : allyUi[d.ub].btn).click(); }
      else if (d.mc !== undefined) { click(); $('multCycle').click(); }
      else if (d.ms) { click(); mult = d.ms === 'max' ? 'max' : +d.ms; const m = MULTS.find(x => x[0] === mult); if (m) $('multCycle').textContent = m[1]; }
      else if (d.sq) { click(); if (C.inSquad(s, d.sq)) C.squadRemove(s, d.sq); else if (!C.squadAdd(s, d.sq)) { toast('Отряд полон<small>в отряде ' + CFG.squadSize + ' героя — уберите одного</small>'); return; } save(); }
      else if (d.bestsq !== undefined) { click(); bestSquad(); save(); toast('Лучший отряд собран<small>самые сильные по DPS</small>'); }
      else if (d.free) { click(); openX('portal'); return; }
      else if (d.chain) { const id = C.buyChainHero(s); if (id) { click(); toast('Новый герой!<small>' + CFG.allies.find(a => a.id === id).name + '</small>'); save(); } }
      else if (d.at) { click(); artTab = d.at; }
      else if (d.art) { click(); artSel = d.art; artN = 1; }
      else if (d.an) { click(); artN = d.an === 'max' ? 'max' : +d.an; }
      else if (d.aup) {
        click(); const n = artN === 'max' ? 1e4 : artN; let k = 0;
        while (k < n && C.upgradeArtifact(s, d.aup)) k++;
        if (k) { save(); toast('Артефакт улучшен<small>+' + k + ' ур.</small>'); }
      }
      else if (d.sbuy) { const [br, i] = d.sbuy.split(':'); const id = C.shopBuy(s, br, +i); if (id) { click(); const a = CFG.artifacts.find(x => x.id === id); toast('Артефакт куплен!<small>' + a.icon + ' ' + a.name + '</small>'); save(); } }
      else if (d.sref) { if (C.shopRefresh(s, d.sref)) { click(); save(); } }
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
    const MS_AT = {}; for (const m of CFG.towerMs.list) MS_AT[m.at] = 1;
    function renderMap2() {
      const TOP = Infinity, curF = s.floor;
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
          '<span class="st">' + (isCur ? 'вы здесь' : shut ? 'закрыт' : done ? 'пройден · награды меньше' : 'открыт') + (key ? '<br>👑 мега-босс' : '<br>💀 страж') +
          (C.isSecretFloor(f) && f <= s.bestFloor ? '<br>🗝 скрытая комната' : '') + (s.curse && s.curse.floor === f ? '<br>☠ проклятие' : '') + (MS_AT[f] ? '<br>🎁 веха Башни' : '') + '</span></div>';
      }
      if (mapLo > 1) h += '<div style="text-align:center;padding:8px"><button class="chip" data-mm="down">▼ Ниже</button></div>';
      setHtml('mapList', h);
    }
    $('mapList').addEventListener('click', e => {
      const b = e.target.closest('[data-mm]');
      if (b) { click(); if (b.dataset.mm === 'up') mapHi = mapHi + 40; else mapLo = Math.max(1, mapLo - 40); lastHtml.mapList = null; renderMap2(); return; }
      const r = e.target.closest('.fRoom'); if (!r) return;
      const f = +r.dataset.f;
      if (f > s.maxFloor) { toast('Этаж ещё закрыт<small>сначала пройдите этаж ' + s.maxFloor + '</small>'); return; }
      if (s.mode) { toast('Сначала выйдите из режима'); return; }
      click(); handle(C.goToFloor(s, f)); save(); back(); render();
    });


    // ===================== 0.45: Портал, Души и регрессия, PvE — новые страницы =====================
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
    // 0.115: единая плашка ресурса для Портала, Кузницы, Рынка и Регрессии (одинаковый размер, иконка, «+»)
    function resPills(list) {
      const I = Object.assign({}, window.MK_ART || {}, window.RG_ART || {}), P = window.PT_ART || {};
      const src = { soul: I.i_soul, crystal: I.i_crystal, shard: I.i_shard, ticket: P.ticket };
      return list.map(([k, v]) => '<div class="resPill">' + (src[k] ? '<img src="' + src[k] + '" alt="">' : '<i>' + ({ lantern: '🏮', soul: '👻', crystal: '💎', shard: '🔹', ticket: '🎟' }[k] || '') + '</i>') + '<b>' + v + '</b></div>').join('');
    }
    function renderX() {
      const aux = $('xAux');
      $('pgX').classList.toggle('ptl', !!window.PT_ART && xKind === 'portal' && !showHist);
      $('pgX').classList.toggle('fgl', !!window.FG_ART && xKind === 'forge');
      $('pgX').classList.toggle('mkl', !!window.MK_ART && xKind === 'market');
      $('pgX').classList.toggle('rgl', !!window.RG_ART && xKind === 'regress');
      $('pgX').classList.toggle('qsl', !!window.QS_ART && xKind === 'quests');
      $('pgX').classList.toggle('hsl', !!window.HS_ART && xKind === 'heroes');
      $('pgX').classList.toggle('cll', !!window.CL_ART && xKind === 'classes');
      $('pgX').classList.toggle('dyl', !!window.DY_ART && xKind === 'diary');
      $('pgX').classList.toggle('uni', !!window.ST_ART && (xKind === 'pve' || xKind === 'souls' || xKind === 'ach' || xKind === 'exp'));   // 0.137: страницы без своего макета — в стиле Настроек
      if (xKind === 'exp') { aux.style.display = 'none'; $('xTitle').textContent = 'Экспедиции'; setHtml('xTop', resPills([['shard', fmt(s.materials.shard)], ['ticket', fmt(s.tickets)]])); setHtml('xBody', expHtml()); return; }
      if (xKind === 'ach') { aux.style.display = 'none'; $('xTitle').textContent = 'Достижения'; setHtml('xTop', resPills([['ticket', fmt(s.tickets)], ['crystal', fmt(s.crystals | 0)]])); setHtml('xBody', achHtml()); return; }
      if (xKind === 'diary') { aux.style.display = 'none'; $('xTitle').textContent = 'Дневник'; setHtml('xTop', resPills([['ticket', fmt(s.tickets)], ['crystal', fmt(s.crystals | 0)]])); setHtml('xBody', diaryHtml()); return; }
      if (xKind === 'classes') { aux.style.display = 'none'; $('xTitle').textContent = 'Классы'; const CA = window.CL_ART || {}; setHtml('xTop', '<div class="resPill"><img src="' + CA.pt + '" alt=""><b>' + C.classFree(s) + ' / ' + C.classPoints(s) + '</b></div>'); setHtml('xBody', classesHtml()); return; }
      $('pgX').classList.toggle('hsw', !!window.HS_ART && xKind === 'heroes' && !!hsSel);
      if (xKind === 'heroes') { aux.style.display = 'none'; $('xTitle').textContent = 'Герои'; setHtml('xTop', resPills([['shard', fmt(s.materials.shard)], ['crystal', fmt(s.crystals | 0)]])); hsRender(); return; }
      if (xKind === 'quests') { aux.style.display = 'none'; $('xTitle').textContent = 'Задания'; setHtml('xTop', resPills([['crystal', fmt(s.crystals | 0)], ['ticket', fmt(s.tickets)]])); setHtml('xBody', questsHtml()); return; }
      if (xKind === 'regress') { aux.style.display = 'none'; $('xTitle').textContent = ''; setHtml('xTop', resPills([['soul', fmt(s.souls)], ['crystal', fmt(s.crystals | 0)]])); setHtml('xBody', regressHtml()); return; }
      if (xKind === 'market') {
        $('xTitle').textContent = 'Рынок'; aux.style.display = 'none';
        const MA = window.MK_ART;
        setHtml('xTop', resPills([['soul', fmt(s.souls)], ['crystal', fmt(s.crystals | 0)]]));
        setHtml('xBody', marketHtml());
        return;
      }
      if (xKind === 'forge') {
        $('xTitle').textContent = 'Кузница'; aux.style.display = 'none';
        setHtml('xTop', resPills([fgBr === 'blood' ? ['shard', fmt(s.materials.shard)] : ['soul', fmt(s.souls)]]));
        setHtml('xBody', forgeHtml());
        return;
      }
      if (xKind === 'portal') {
        $('xTitle').textContent = showHist ? 'История призывов' : 'Портал призыва';
        aux.style.display = showHist ? 'none' : ''; aux.textContent = '📜 История';
        if (window.PT_ART) setHtml('xTop', resPills((ban === 'event' ? [['lantern', fmt(s.event.lanterns)]] : []).concat([['ticket', fmt(s.tickets)]])));
        else setHtml('xTop', (ban === 'event' ? cur('🏮', fmt(s.event.lanterns)) : '') + cur('🎟', fmt(s.tickets)));
        setHtml('xBody', showHist ? histHtml() : portalHtml());
      } else if (xKind === 'souls') {
        $('xTitle').textContent = 'Души и регрессия'; aux.style.display = 'none';
        setHtml('xTop', cur('👻', fmt(s.souls)));
        setHtml('xBody', soulsHtml2());
      } else {
        $('xTitle').textContent = 'PvE'; aux.style.display = 'none';
        setHtml('xTop', cur('✦', fmt(s.essence)) + cur('🎟', fmt(s.tickets)));
        setHtml('xBody', pveHtml2());
      }
    }
    $('xAux').addEventListener('click', () => { click(); showHist = true; lastHtml = {}; refresh(); });

    // ---------- 0.127: Дневник по макету; стили и картинки — src/diary.js ----------
    let dyTab = 'beasts', dyB = 0, dyHall = null;
    function diaryHtml() {
      const A = window.DY_ART, M = window.MK_ART || {}, R = window.RG_ART || {}, D = CFG.diary, BS = CFG.biomes;
      if (dyHall == null) { const e = document.querySelector('#bgHall .img'); dyHall = e ? getComputedStyle(e).backgroundImage.replace(/"/g, "'") : 'none'; }
      dyB = Math.max(0, Math.min(BS.length - 1, dyB));
      let h = '<div class="dy"><div class="dTabs"><button class="dTab' + (dyTab === 'beasts' ? ' on' : '') + '" data-dyt="beasts"><img src="' + A.i_beast + '" alt="">Бестиарий</button><button class="dTab' + (dyTab === 'heroes' ? ' on' : '') + '" data-dyt="heroes"><img src="' + A.i_helm + '" alt="">Герои</button></div>';
      if (dyTab === 'beasts') {
        const st = Math.max(0, Math.min(BS.length - 6, dyB - 2));
        h += '<div class="dMed"><button class="dAr l" data-dyb="' + (dyB - 1) + '"></button>' + BS.slice(st, st + 6).map((b, j) => { const i = st + j, seen = C.diaryNames(b).some(n => s.bestiary[n]);
          return '<button class="dM' + (i === dyB ? ' on' : '') + (seen ? '' : ' lk') + '" data-dyb="' + i + '"><i style="background-image:' + dyHall + ';filter:hue-rotate(' + (b.hue || 0) + 'deg) saturate(1.2)"></i><b></b>' + (s.diaryPages.includes(b.id) ? '<img class="ok" src="' + A.i_check + '" alt="">' : '') + '</button>'; }).join('') +
          '<button class="dAr r" data-dyb="' + (dyB + 1) + '"></button></div>';
        const b = BS[dyB], names = C.diaryNames(b), got = names.filter(n => s.bestiary[n]).length, done = s.diaryPages.includes(b.id);
        h += '<div class="dPage"><div class="dHd">' + (got ? b.name : '???') + '</div><div class="dPan"><img src="' + A.i_gate + '" alt=""><div class="dPr"><small>Записи: ' + got + '/' + names.length + '</small><div class="dBar"><i style="width:calc(' + (got / names.length * 100).toFixed(1) + '% + 1.3cqw)"></i></div></div>' +
          '<div class="dRw"><img src="' + M.i_ticket + '" alt="">' + D.page.tickets + '<img src="' + R.i_crystal + '" alt="">' + D.page.crystals + '<em class="' + (done ? 'got' : '') + '">' + (done ? 'Получено' : 'Заполните') + '</em></div></div><div class="dGrid">' +
          names.map((n, i) => { const k = s.bestiary[n] | 0, boss = i >= b.enemies.length, fin = n === b.final, S = window.ENEMY_SPR && window.ENEMY_BY_NAME && window.ENEMY_SPR[window.ENEMY_BY_NAME[n]];
            const pic = k && S ? '<i style="left:0;width:100%;transform:none;bottom:22%;height:auto;aspect-ratio:' + S.w + '/' + S.h + ';background-image:url(' + S.src + ');background-size:' + S.n * 100 + '% 100%;background-position:0 0"></i>' : '<img src="' + A.i_shadow + '" alt="" style="' + (k ? 'filter:hue-rotate(' + ((b.hue || 0) + i * 40) + 'deg) brightness(1.4)' : '') + '">';
            return '<div class="dC' + (boss ? ' boss' : '') + (k ? '' : ' lk') + '"><div class="pic">' + pic + '</div><img class="fr" src="' + (boss ? A.card_g : A.card) + '" alt="">' + (fin ? '<i class="cr"></i>' : '') +
              '<div class="nm">' + (k ? n : '???') + '</div><div class="ct"><img src="' + A.skull + '" alt="">' + fmt(Math.min(k, D.master)) + ' / ' + fmt(D.master) + '</div>' + (k >= D.master ? '<span class="rb">Знаток</span>' : '') + '</div>'; }).join('') + '</div></div>';
      } else {
        h += '<div class="dPage" style="margin-top:2.4cqw"><div class="dHd">Герои Башни</div><div class="dGrid"><div class="dNote">Цитата открывается с ★' + D.loreStars[1] + ', полная история — с ★' + D.loreStars[2] + '.</div>' +
          CFG.allies.filter(a => !a.hidden || s.heroes[a.id].unlocked).map(a => { const lv = C.loreLevel(s, a.id), Ar = HERO_ART[a.id] || {}, v = ALLY_VIS[a.id] || {};
            const pic = lv >= 0 && Ar.avatar ? '<img src="' + Ar.avatar + '" alt="" style="width:100%;height:100%;top:50%;object-fit:cover">' : lv >= 0 ? '<img src="" alt="" style="display:none"><span style="position:absolute;inset:0;display:grid;place-items:center;font-size:8cqw">' + (v.icon || '❔') + '</span>' : '<img src="' + A.i_shadow + '" alt="">';
            return '<div class="dH"><div class="dC' + (lv < 0 ? ' lk' : '') + '"><div class="pic">' + pic + '</div><img class="fr" src="' + A.card + '" alt=""></div><div class="tx"><b>' + (lv < 0 ? '???' : a.name) + '</b><small>' + (lv < 0 ? 'Герой ещё не открыт' : a.race + ' · ' + a.side + ' / ' + a.faction) + '</small>' +
              (lv >= 1 ? '<q>' + a.quote + '</q>' : lv === 0 ? '<q>Цитата — с ★' + D.loreStars[1] + '</q>' : '') + (lv >= 2 ? '<p>' + String(a.story || '').split(/\s*Ульта:/)[0] + '</p>' : '') + '</div></div>'; }).join('') + '</div></div>';
      }
      return h + '</div>';
    }
    // ---------- 0.124: Классы — дерево навыков по макету; стили и картинки — src/classes.js ----------
    let clView = null, clSel = null;
    const CL_POS = [[21, 28.8], [50, 40], [79.3, 28.8], [21, 55.2], [50, 63.5], [79.3, 55.2]];   // b1 b2 b3 / b4 b5 b6 (центры в cqw внутри коробки дерева)
    function classesHtml() {
      const A = window.CL_ART, K = CFG.classes, dk = dayKey();
      if (!C.classUnlocked(s)) return '<div class="cl"><div class="lockMsg">Классы откроются на ' + K.unlockFloor + '-м этаже (рекорд).</div></div>';
      const view = C.classDef(clView) ? clView : (s.cls.id || K.list[0].id), k = C.classDef(view), mine = s.cls.id === view;
      if (!k.nodes.some(n => n.id === clSel)) clSel = k.nodes[0].id;
      const lv = n => mine ? (s.cls.spent[n.id] | 0) : 0, open = n => !n.req || (mine && lv(k.nodes.find(x => x.id === n.req)) >= k.nodes.find(x => x.id === n.req).max);
      const free = C.classFree(s);
      let h = '<div class="cl"><div class="cRow">' + K.list.map((c, i) => '<button class="abs cK' + (s.cls.id === c.id ? ' on' : '') + (view === c.id ? ' view' : '') + '" style="left:' + [18.8, 40.8, 61.7, 82.8][i] + 'cqw" data-clv="' + c.id + '"><div class="rg"><img src="' + A['c_' + c.id] + '" alt=""></div><div class="pl">' + c.name + '</div></button>').join('') + '</div>';
      // линии дерева (координаты макета: коробка 1024×755)
      const P = ['M425,175 L300,225 L238,262', 'M512,232 L512,312', 'M599,175 L724,225 L786,262', 'M215,402 L215,470', 'M512,520 L512,555', 'M812,402 L812,470'];
      h += '<div class="tree"><div class="tBox"><svg viewBox="0 0 1024 755" preserveAspectRatio="none">' + k.nodes.map((n, i) => '<path class="' + (open(n) && (i < 3 ? mine : lv(n) > 0 || open(n)) ? 'lit' : '') + '" d="' + P[i] + '"/>').join('') + '</svg>' +
        '<div class="abs big" style="top:calc(' + (11.7 / 73.7 * 100).toFixed(2) + '% - 11.95cqw)"><img src="' + A['c_' + k.id] + '" alt=""></div>' +
        k.nodes.map((n, i) => { const [x, y] = CL_POS[i], o = open(n), l = lv(n), t2 = i >= 3, can = mine && o && free > 0 && l < n.max;
          return '<button class="abs nd' + (t2 ? ' t2' : '') + (o ? '' : ' lk') + (clSel === n.id ? ' sel' : '') + '" style="left:' + x + 'cqw;top:' + (y / 73.7 * 100).toFixed(2) + '%" data-cln="' + n.id + '"><img class="ic" src="' + A[n.id] + '" alt="">' +
            (o ? '<span class="lv' + (l >= n.max ? ' mx' : '') + '">' + l + '/' + n.max + '</span>' + (t2 ? '' : '<span class="np">' + n.name + '</span>') : '<img class="lkI" src="' + A.lock + '" alt="">') + (can ? '<i class="rd"></i>' : '') + '</button>'; }).join('') + '</div></div>';
      const n = k.nodes.find(x => x.id === clSel), o = open(n), l = lv(n), par = n.req && k.nodes.find(x => x.id === n.req);
      const bonus = n.kind === 'bossTime' ? '+' + l * n.per + ' с' : (n.kind === 'abilityCd' ? '−' : '+') + Math.round(l * n.per * 100) + '%';
      const can = mine && o && free > 0 && l < n.max;
      const chOk = !mine && C.canChangeClass(s, dk);
      h += '<div class="inf"><div class="abs iRg' + (o ? '' : ' lk') + '"><img src="' + A[n.id] + '" alt=""></div><i class="abs iDv"></i><div class="abs iNm">' + n.name + '</div>' +
        '<div class="abs iDs">' + n.desc + ' за каждый уровень' + (o ? '' : '. Откроется, когда «' + par.name + '» будет ' + par.max + '/' + par.max) + '.</div>' +
        '<div class="abs iBn">Текущий бонус:<b>' + bonus + '</b></div>' +
        '<button class="abs iUp" data-clup' + (can ? '' : ' disabled') + '>' + (l >= n.max ? 'Максимум' : 'Улучшить') + '<span><img src="' + A.pt + '" alt="">1</span></button><i class="abs iSp"></i>' +
        '<button class="abs iCh" data-clch' + (chOk ? '' : ' disabled') + '>⟳ ' + (s.cls.id ? (mine ? 'Ваш класс' : 'Сменить класс') : 'Выбрать класс') + '</button>' +
        '<div class="abs iNt">' + (!s.cls.id ? 'первый выбор бесплатно' : mine ? 'смена — 1 раз в сутки' : C.canChangeClass(s, dk) ? 'очки вернутся' : 'завтра') + '</div></div></div>';
      return h;
    }
    // ---------- 0.122: экран «Герои» по макетам пользователя — разметка; стили и картинки — src/heroes.js ----------
    let hsSel = null; const hsF = {};
    const HS_RC = { E: '#c8c8d8', D: '#e09050', C: '#5ae07a', B: '#5aa8ff', A: '#c070ff', S: '#ffc840', SS: '#ff5a5a', SSS: '#cfeaff', GOD: '#fff2a0' };
    const HS_SIDE = { 'Свет': 's_light', 'Тьма': 's_dark', 'Дикие': 's_wild', 'Тени': 's_shadow' };
    function hsIds() { return C.heroList(s, { rarity: hsF.rarity, side: hsF.side }); }
    function hsReady(id) { return C.canStar(s, id) || C.canRankUp(s, id) || C.canEvolve(s, id); }
    function hsRender() {
      // сетка листается сама — перерисовываем только содержимое, не трогая прокрутку
      const body = $('xBody');
      let root = body.querySelector('.hs');
      if (!root) { body.innerHTML = '<div class="hs"><div class="hPan"></div><div class="hFlt"></div><div class="hGrid"></div><div class="hwH"></div></div>'; root = body.querySelector('.hs'); lastHtml.xBody = null; }
      const H = window.HS_ART, set = (sel, h) => { const e = root.querySelector(sel); if (e.__h !== h) { e.innerHTML = h; e.__h = h; } };
      const all = CFG.allies.filter(a => !a.hidden || s.heroes[a.id].unlocked), own = all.filter(a => s.heroes[a.id].unlocked).length;
      set('.hPan', '<div class="hDmg"><img src="' + H.i_dmg + '" alt="">' + fmt(C.autoDps(s)) + '</div><i class="hDv"></i><div class="hCnt"><img src="' + H.i_heroes + '" alt="">Герои ' + own + '/' + all.length + '</div>');
      set('.hFlt', '<button class="hFb' + (!hsF.rarity && !hsF.side ? ' hOn' : '') + '" data-hf="all">Все</button>' +
        ['E', 'D', 'C', 'B', 'A', 'S'].map(r => '<button class="hFb' + (hsF.rarity === r ? ' hOn' : '') + '" data-hf="r:' + r + '" style="color:' + HS_RC[r] + '">' + r + '</button>').join('') + '<i class="hSep"></i>' +
        Object.keys(HS_SIDE).map(sd => '<button class="hFb hSd' + (hsF.side === sd ? ' hOn' : '') + '" data-hf="s:' + sd + '" style="background-image:url(' + H[HS_SIDE[sd]] + ')" title="' + sd + '"></button>').join(''));
      const ids = hsIds();
      set('.hGrid', ids.length ? ids.map(id => {
        const a = CFG.allies.find(x => x.id === id), h = s.heroes[id], Ar = HERO_ART[id] || {}, v = ALLY_VIS[id] || {}, lk = !h.unlocked, lv = s.allies[id].level;
        const pic = Ar.avatar ? '<img src="' + Ar.avatar + '" alt="">' : '<span>' + (v.icon || '❔') + '</span>';
        const st = lk || !h.stars ? '' : h.stars <= 5 ? '<img src="' + H.star + '" alt="">'.repeat(h.stars) : '<img src="' + H.star + '" alt="">' + h.stars;
        return '<button class="hsCard' + (lk ? ' hLock' : '') + '" data-hh="' + id + '" style="--rc:' + (HS_RC[C.heroRarity(s, id)] || '#fff') + '"><div class="hPt" style="' + (Ar.avatar || lk ? '' : 'background:' + (v.iconBg || '#1a1230')) + '">' + pic + '</div>' +
          '<img class="hFr" src="' + (H['fr_' + C.heroRarity(s, id)] || H.fr_lock) + '" alt=""><b class="hRk">' + C.heroRarity(s, id) + '</b>' +
          (lk ? '<img class="hLk" src="' + H.i_lock + '" alt="">' : (lv ? '<span class="hLv">Lv.' + lv + '</span>' : '') + '<div class="hSt">' + st + '</div>' + (hsReady(id) ? '<i class="hDot"></i>' : '')) + '</button>';
      }).join('') : '<div class="hNone">Нет героев под этот фильтр</div>');
      set('.hwH', hsSel ? hsWin(hsSel) : '');
    }
    // 0.134: пассивка героя — на всю команду, растёт от звёзд и уровня
    function hsPassive(id) {
      const p = C.heroPassive(s, id); if (!p) return '';
      const P = CFG.passives, val = x => p.kind === 'bossTime' ? '+' + x.toFixed(1) + ' с' : '+' + (x * 100).toFixed(p.kind === 'critChance' ? 2 : 0) + '%';
      const one = P.base[p.kind] * (P.rarity[CFG.allies.find(a => a.id === id).rarity] || 1);
      return '<div class="hPas"><b>✦ ' + p.name + '</b> — ' + (p.tier ? val(p.value) : val(one)) + ' ' + P.names[p.kind] + ' всей команде' +
        '<small>' + (p.tier ? 'растёт от звёзд и каждые ' + P.levelStep + ' уровней' : 'откроется, когда получишь героя') + '</small>' + hsAscend(id) + '</div>';
    }
    // 0.135: возвышение — ранг выше, до GOD
    function hsAscend(id) {
      const h = s.heroes[id], c = h.unlocked && C.ascendCost(s, id); if (!c) return h.unlocked ? '<small class="hAsc">Ранг GOD — вершина возвышения</small>' : '';
      const ok = C.canAscend(s, id), m = (have, want) => '<em class="' + (have >= want ? 'ok' : '') + '">' + fmt(have) + '/' + fmt(want) + '</em>';
      return '<button class="hAscB" data-hs="asc"' + (ok ? '' : ' disabled') + '>Возвысить → ' + c.to + '</button>' +
        '<small class="hAsc">★' + m(h.stars, c.stars) + ' · копии ' + m(h.copies, c.copies) + ' · осколки ' + m(s.materials.shard, c.shards) + '</small>';
    }
    function hsWin(id) {
      const H = window.HS_ART, M = window.MK_ART || {}, a = CFG.allies.find(x => x.id === id), h = s.heroes[id], Ar = HERO_ART[id] || {}, v = ALLY_VIS[id] || {};
      const lv = s.allies[id].level, rl = C.rankLabel(h.rank), RNn = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'], E = CFG.evolution.stages;
      const art = Ar.side || Ar.avatar ? '<img src="' + (Ar.side || Ar.avatar) + '" alt="">' : '<span class="hEmo">' + (v.icon || '❔') + '</span>';
      const story = String(a.story || '').split(/\s*Ульта:/)[0];
      const need = C.starCost(s, id), fod = C.starFodder ? C.starFodder(s, id) : 0, rc = C.rankCost(s, id), ec = C.evoCost(s, id);
      const shard = M.i_shard ? '<img src="' + M.i_shard + '" alt="">' : '🔹';
      const num = (have, want) => '<em class="' + (have >= want ? 'ok' : '') + '">' + fmt(have) + '</em>/' + fmt(want);
      const bStar = need == null ? '<button class="hBt" disabled>Звёзды<span>Макс.</span></button>'
        : '<button class="hBt" data-hs="star"' + (C.canStar(s, id) ? '' : ' disabled') + '>Повысить ★<span>' + (Ar.avatar ? '<img src="' + Ar.avatar + '" alt="">' : '') + num(h.copies, need) + '</span>' + (fod ? '<small>+ корм: ' + fod + ' копий других</small>' : '') + (C.canStar(s, id) ? '<i class="hRd"></i>' : '') + '</button>';
      const bRank = !rc ? '<button class="hBt hV" disabled>Ранг<span>Макс.</span></button>'
        : '<button class="hBt hV" data-hs="rank"' + (C.canRankUp(s, id) ? '' : ' disabled') + '>Повысить ранг<span>' + shard + fmt(rc.shards) + '</span>' + (rc.needEvo && h.evo < rc.needEvo ? '<small>нужна эволюция ' + RNn[rc.needEvo] + '</small>' : '') + (C.canRankUp(s, id) ? '<i class="hRd"></i>' : '') + '</button>';
      const bEvo = !ec ? '<button class="hBt hGv" disabled>Эволюция<span>Макс.</span></button>'
        : '<button class="hBt hGv" data-hs="evo"' + (C.canEvolve(s, id) ? '' : ' disabled') + '>Эволюция<span>' + shard + fmt(ec.shards) + '</span>' + (h.stars < ec.stars ? '<small>нужно ★' + ec.stars + '</small>' : '') + (C.canEvolve(s, id) ? '<i class="hRd"></i>' : '') + '</button>';
      let stars = ''; for (let i = 0; i < CFG.maxStars; i++) stars += '<img src="' + (i < h.stars ? H.star : H.star_off) + '" alt="">';
      return '<div class="hWrap" data-hs="bg"><div class="hWin" style="--rc:' + (HS_RC[C.heroRarity(s, id)] || '#fff') + '">' +
        '<div class="hArt"><img class="hRune" src="' + H.rune + '" alt="">' + art + '</div>' +
        '<div class="hNm">' + a.name + '</div><div class="hShR">' + C.heroRarity(s, id) + '</div><div class="hShF"><img src="' + H[HS_SIDE[a.side]] + '" alt=""></div><button class="hX" data-hs="close"></button>' +
        '<div class="hStars">' + stars + '</div>' +
        '<div class="hStl"><div class="hSp"><img src="' + H.i_dmg + '" alt=""><small>Урон</small><b>' + fmt(C.allyDps(s, id)) + '</b></div>' +
        '<div class="hSp"><img src="' + H.i_level + '" alt=""><small>Уровень</small><b>Lv.' + lv + '<i>/' + fmt(C.allyCap(s, id)) + '</i></b></div>' +
        '<div class="hSp"><span class="hRkb">' + RNn[rl.rank] + '</span><small>Ранг</small><b>' + RNn[rl.rank] + (rl.max ? ' макс.' : ' · ' + rl.sub + '/' + CFG.ranks.subs) + '</b></div>' +
        '<div class="hSp"><img src="' + H.i_evo + '" alt=""><small>Эволюция</small><b>' + (h.evo ? E[h.evo - 1].name : 'Этап ' + h.evo + '/' + E.length) + '</b></div></div>' +
        '<div class="hBio">' + hsPassive(id) + '<h4>Биография</h4><p>' + story + '</p>' + (a.quote ? '<q>' + a.quote + '</q>' : '') + '</div>' +
        '<button class="hAr hArL" data-hs="prev"></button><button class="hAr hArR" data-hs="next"></button>' +
        '<div class="hBts">' + bStar + bRank + bEvo + '</div></div></div>';
    }
    // ---------- 0.118: экран Заданий по макету пользователя — разметка; стили и картинки — src/quests.js ----------
    let qsTab = 'daily';
    function openQuests(t) { if (t) qsTab = t; stack.length = 0; page = null; openX('quests'); }
    // ---------- 0.142: экран Экспедиций (решение 07.11): доска походов с условиями, отряды в пути, выбор героев ----------
    let expSel = null, expPick = [];
    const EXP_RC = { E: '#9aa0a8', D: '#6fbf73', C: '#4fb3e8', B: '#5a7cff', A: '#b070ff', S: '#ffb020', SS: '#ff5a3a', SSS: '#ff3ad0', GOD: '#fff3a0' };
    const expTime = ms => { const t = Math.max(0, Math.ceil(ms / 1000)), h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), sec = t % 60; return h ? h + ' ч ' + String(m).padStart(2, '0') + ' мин' : m + ':' + String(sec).padStart(2, '0'); };
    const expReqTxt = q => q.k === 'side' ? q.n + ' × фракция «' + q.side + '»' : q.k === 'maxRank' ? 'все не выше ранга ' + q.r : q.k === 'stars' ? 'сумма звёзд ≥ ' + q.n : q.n + ' разные фракции';
    const expAva = id => { const v = ALLY_VIS[id]; return '<div class="exA" style="--rc:' + EXP_RC[C.heroRarity(s, id)] + '">' + (v && v.avatarImg || (v ? allySvg(v, 0) : '')) + '</div>'; };
    const expRw = r => [r.shard ? '🔹 ' + fmt(r.shard) : '', r.tickets ? '🎟 ' + r.tickets : '', r.crystals ? '💎 ' + r.crystals : '', r.copies ? '🃏 копии ×' + r.copies : ''].filter(Boolean).join(' · ');
    function expAuto(o) {   // слабейшие подходящие: перебор по возрастанию силы, жадно под условия
      const L = CFG.expeditions.lengths[o.len], R = CFG.rarities;
      const pool = CFG.allies.filter(a => s.heroes[a.id].unlocked && !C.expBusy(s, a.id)).sort((a, b) => R.indexOf(C.heroRarity(s, a.id)) - R.indexOf(C.heroRarity(s, b.id)) || (s.heroes[b.id].stars | 0) - (s.heroes[a.id].stars | 0));
      for (let t = 0; t < 600; t++) {
        const team = [], need = o.req.find(q => q.k === 'side');
        if (need) for (const a of pool) if (team.length < need.n && a.side === need.side) team.push(a.id);
        const rest = t ? pool.slice().sort(() => Math.random() - 0.5) : pool;
        for (const a of rest) { if (team.length >= L.team) break; if (!team.includes(a.id)) team.push(a.id); }
        if (team.length === L.team && C.expCheck(s, o.uid, team).ok) return team;
      }
      return null;
    }
    function expHtml() {
      const E = CFG.expeditions, now = Date.now(), offers = C.expRefresh(s, dayKey());
      let h = '<div class="secT">Отряды в пути · ' + s.exp.runs.length + ' / ' + E.slots + '</div>';
      h += s.exp.runs.length ? s.exp.runs.map(r => { const done = now >= r.end, L = E.lengths[r.len];
        return '<div class="exRun' + (done ? ' done' : '') + '"><div class="exH"><b>' + r.name + '</b><span>' + L.h + ' ч</span></div><div class="exTeam">' + r.heroes.map(expAva).join('') + '</div>' +
          '<div class="achBar"><i style="width:' + Math.min(100, (now - r.start) / (r.end - r.start) * 100).toFixed(1) + '%"></i><b>' + (done ? 'вернулись!' : 'осталось ' + expTime(r.end - now)) + '</b></div>' +
          '<div class="exF"><span>' + expRw(C.expReward(s, r)) + '</span>' + (done ? '<button class="upBtn" data-exclaim="' + r.uid + '">Забрать</button>' : '') + '</div></div>'; }).join('')
        : '<div class="exEmpty">Никого нет в пути. Выбери поход ниже — герои продолжат драться в Башне.</div>';
      h += '<div class="secT">Доска походов · обновится завтра</div>';
      h += offers.map(o => { const L = E.lengths[o.len], open = expSel === o.uid, chk = open ? C.expCheck(s, o.uid, expPick) : null;
        const reqH = o.req.map(q => '<li class="' + (open ? (C.expReqOk(s, q, expPick) ? 'ok' : 'no') : '') + '">' + expReqTxt(q) + '</li>').join('');
        let c = '<div class="exOf' + (open ? ' open' : '') + '"><div class="exH"><b>' + o.name + '</b><span>' + L.h + ' ч · ' + L.team + ' героя' + (L.team > 4 ? 'ев' : '') + '</span></div><ul class="exReq">' + reqH + '</ul>' +
          '<div class="exF"><span>' + expRw(C.expReward(s, { len: o.len })) + '</span>' + (open ? '' : '<button class="upBtn alt" data-exrr="' + o.uid + '" title="Сменить за билет">🎟 Сменить</button><button class="upBtn" data-exsel="' + o.uid + '"' + (s.exp.runs.length >= E.slots ? ' disabled' : '') + '>Собрать</button>') + '</div>';
        if (open) {
          const pool = CFG.allies.filter(a => s.heroes[a.id].unlocked).sort((a, b) => CFG.rarities.indexOf(C.heroRarity(s, a.id)) - CFG.rarities.indexOf(C.heroRarity(s, b.id)));
          c += '<div class="exPick">' + pool.map(a => { const busy = C.expBusy(s, a.id), on = expPick.includes(a.id);
            return '<button class="exP' + (on ? ' on' : '') + (busy ? ' busy' : '') + '" data-expick="' + a.id + '"' + (busy ? ' disabled' : '') + '>' + expAva(a.id) + '<i>' + C.heroRarity(s, a.id) + '</i><small>' + a.name + '<br>' + a.side + ' · ★' + (s.heroes[a.id].stars | 0) + '</small></button>'; }).join('') + '</div>' +
            '<div class="exF"><span>' + expPick.length + ' / ' + L.team + (chk && !chk.ok && expPick.length === L.team ? ' · ' + chk.why : '') + '</span><button class="upBtn alt" data-exauto="' + o.uid + '">Авто</button><button class="upBtn alt" data-excancel>Отмена</button><button class="upBtn" data-exgo="' + o.uid + '"' + (chk && chk.ok ? '' : ' disabled') + '>В путь</button></div>';
        }
        return c + '</div>'; }).join('');
      return h;
    }
    // ---------- 0.141: экран Достижений (решение 07.11, «как в Крушителях»): разделы, ступени, свой бонус у каждого ----------
    let achCat = 'all';
    const ACH_KN = { allDmg: 'урон', tapDmg: 'урон тапа', allyDmg: 'урон союзников', gold: 'золото', critChance: 'шанс крита', critMult: 'сила крита', bossDmg: 'урон по боссам', bossTime: 'время на босса', shards: 'осколки' };
    const achB = (k, v) => k === 'critChance' ? '+' + (v * 100).toFixed(1) + '%' : k === 'bossTime' ? '+' + (+v.toFixed(1)) + ' с' : '+' + Math.round(v * 100) + '%';
    const ROM = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'];
    function achHtml() {
      const AC = CFG.achievements, L = AC.list.filter(a => C.achVisible(a));
      const can = a => C.achClaimable(s, a.id), any = L.some(can);
      let pts = 0, tot = 0; L.forEach(a => { pts += C.achTier(s, a.id); tot += a.goals.length; });
      const kinds = Object.keys(ACH_KN).map(k => [k, C.achPower(s, k)]).filter(x => x[1] > 0);
      let h = '<div class="achSum"><div class="achPts"><b>' + pts + '</b> / ' + tot + '<small>ступеней</small></div><div class="achBon">' +
        (kinds.length ? kinds.map(([k, v]) => '<span>' + ACH_KN[k] + ' <b>' + achB(k, v) + '</b></span>').join('') : '<span>Забирай ступени — каждая даёт бонус навсегда</span>') + '</div>' +
        (any ? '<button class="upBtn" data-qaall>Забрать всё</button>' : '') + '</div>';
      const cats = AC.cats.filter(([c]) => L.some(a => a.cat === c));
      h += '<div class="achCats"><button class="' + (achCat === 'all' ? 'on' : '') + '" data-acat="all">Все' + (any ? '<i></i>' : '') + '</button>' +
        cats.map(([c, n]) => '<button class="' + (achCat === c ? 'on' : '') + '" data-acat="' + c + '">' + n + (L.some(a => a.cat === c && can(a)) ? '<i></i>' : '') + '</button>').join('') + '</div>';
      const order = a => can(a) ? 0 : C.achTier(s, a.id) >= a.goals.length ? 2 : 1;
      const list = L.filter(a => achCat === 'all' || a.cat === achCat).sort((x, y) => order(x) - order(y));
      const vf = (a, v) => a.log ? '10^' + v : fmt(v);
      h += '<div class="achList">' + list.map(a => {
        const t = C.achTier(s, a.id), n = a.goals.length, max = t >= n, goal = a.goals[Math.min(t, n - 1)], v = C.achValue(s, a), c = can(a);
        const pr = max ? 1 : Math.min(1, v / goal), cur = a.bonus ? a.bonus.per * t : 0;
        const rw = Object.keys(a.reward).filter(k => a.reward[k]).map(k => (k === 'tickets' ? '🎟 ' : k === 'crystals' ? '💎 ' : '') + a.reward[k]).join(' · ');
        return '<div class="achC' + (c ? ' can' : max ? ' max' : '') + '"><div class="achI">' + a.icon + '</div><div class="achM">' +
          '<div class="achN">' + a.name + ' <em>' + (max ? 'MAX' : ROM[t] || t + 1) + '</em><small>' + Math.min(t, n) + '/' + n + '</small></div>' +
          '<div class="achBar"><i style="width:' + (pr * 100).toFixed(1) + '%"></i><b>' + (max ? 'всё выполнено' : vf(a, Math.min(v, goal)) + ' / ' + vf(a, goal)) + '</b></div>' +
          (a.bonus ? '<div class="achL">За ступень: ' + ACH_KN[a.bonus.kind] + ' ' + achB(a.bonus.kind, a.bonus.per) + (t ? ' · сейчас <b>' + achB(a.bonus.kind, cur) + '</b>' : '') + '</div>' : '') +
          (a.title ? '<div class="achL t">Последняя ступень — титул «' + a.title.name + '»</div>' : '') + '</div>' +
          '<div class="achR">' + (max ? '<span class="achDone">✓</span>' : '<div class="achRw">' + rw + '</div>' + (c ? '<button class="upBtn" data-qa="' + a.id + '">Забрать</button>' : '<button class="upBtn alt" disabled>Идёт</button>')) + '</div></div>';
      }).join('') + '</div>';
      return h;
    }
    function questsHtml() {
      const A = window.QS_ART || {}, M = window.MK_ART || {}, R = window.RG_ART || {}, Q = CFG.quests, today = dayKey();
      const IC = { kill: A.i_battle, boss: A.i_boss, tap: A.i_tap, summon: A.i_summon, allDaily: A.i_star, star: A.i_star, rare: A.i_boss, ritual: R.i_soul || A.i_scroll,
        floor: R.i_stairs || A.i_battle, runFloor: R.i_stairs || A.i_battle, hired: R.i_heroes || A.i_scroll, runHire: R.i_heroes || A.i_scroll };
      const rwi = (k, n) => '<span class="rwi">' + (k === 'tickets' ? '<img src="' + M.i_ticket + '" alt="">' : k === 'crystals' ? '<img src="' + (R.i_crystal || M.i_crystal) + '" alt="">' : '') + '<b>' + fmt(n) + '</b></span>';
      const rw = r => { const L = Object.keys(r).filter(k => r[k]); return '<div class="rw' + (L.length > 1 ? ' two' : '') + '">' + L.map(k => rwi(k, r[k])).join('') + '</div>'; };
      const ready = q => C.questProgress(s, q.id) >= q.goal && !s.quests.claimed[q.id];
      const card = (ic, name, pr, goal, r, btn, got) => '<div class="card' + (got ? ' got' : '') + '"><div class="fr"><img src="' + ic + '" alt=""></div><div class="nm">' + name + '</div>' +
        '<div class="pb"></div><div class="pf" style="width:' + (33.7 * Math.min(1, pr / goal)).toFixed(2) + 'cqw"></div><div class="pt">' + fmt(Math.min(pr, goal)) + '/' + fmt(goal) + '</div><div class="dv"></div>' + rw(r) + btn + '</div>';
      const qCard = q => { const pr = C.questProgress(s, q.id), got = !!s.quests.claimed[q.id], done = pr >= q.goal;
        const btn = got ? '<button class="bt done" disabled>Готово</button>' : done ? '<button class="bt claim" data-qc="' + q.id + '">Забрать</button>' : '<button class="bt go" ' + (q.go ? 'data-qgo="' + q.go + '"' : 'disabled') + '>' + (q.go ? 'Перейти' : 'Идёт') + '</button>';
        return card(IC[q.key || q.value] || A.i_scroll, q.name, pr, q.goal, q.reward, btn, got); };
      const AL = CFG.achievements.list, achReady = AL.some(a => C.achClaimable(s, a.id));
      const QC = CFG.questChests, chestReady = QC.some((c, i) => C.questChestReady(s, i)), canLogin = C.loginAvailable(s, today);
      const dots = { daily: Q.daily.some(ready) || chestReady, weekly: Q.weekly.some(ready) || Q.ritual.some(ready), ach: achReady || Q.intro.some(ready), login: canLogin };
      const T = [['daily', 'Ежедневные'], ['weekly', 'Недельные'], ['ach', 'Достижения'], ['login', 'Вход']];
      let h = '<div class="qs"><div class="tabs">' + T.map(([k, t]) => '<button class="tab' + (k === qsTab ? ' on' : '') + (t.length > 8 ? ' long' : '') + '" data-qt="' + k + '">' + t + (dots[k] ? '<i class="dot"></i>' : '') + '</button>').join('') + '</div>';
      const left = sec => { const t = Math.max(0, Math.floor(sec)), p = n => String(n).padStart(2, '0'); return (t >= 86400 ? Math.floor(t / 86400) + ' д ' : '') + p(Math.floor(t % 86400 / 3600)) + ':' + p(Math.floor(t % 3600 / 60)) + ':' + p(t % 60); };
      const now = new Date(), mid = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1), mon = new Date(now.getFullYear(), now.getMonth(), now.getDate() + ((8 - now.getDay()) % 7 || 7));
      const timer = d => '<div class="grow"></div><div class="timer"><img src="' + M.i_hourglass + '" alt="">Обновятся через ' + left((d - now) / 1000) + '</div>';
      if (qsTab === 'daily') {
        const dc = C.dailyClaimedCount(s), n = QC.length, pos = i => 20 + i * 65 / (n - 1);
        let f = 0; for (let i = 0; i < n; i++) { const lo = i ? QC[i - 1].need : 0; if (dc >= QC[i].need) f = pos(i); else { f = (i ? pos(i - 1) : 0) + (pos(i) - (i ? pos(i - 1) : 0)) * Math.max(0, dc - lo) / (QC[i].need - lo); break; } }
        const bw = 'calc(100% - 15.2cqw - 1.2cqw)';
        h += '<div class="board"></div><div class="act"><div class="lb">Выполнено<b>' + dc + '/' + QC[n - 1].need + '</b></div><div class="bar"></div><div class="fill" style="width:calc(' + bw + ' * ' + (f / 100).toFixed(3) + ')"></div>' +
          QC.map((c, i) => { const o = s.quests.chests[i], r = C.questChestReady(s, i), x = 'calc(15.2cqw + ' + bw + ' * ' + (pos(i) / 100).toFixed(3) + ')';
            return '<button class="ch' + (o ? ' open' : r ? ' ready' : '') + '" style="left:' + x + ';background-image:url(' + (o ? A.chest_open : A['chest' + Math.min(3, i + 1)]) + ')" data-qch="' + i + '"' + (r ? '' : ' disabled') + '></button><i class="mk" style="left:' + x + '"></i><div class="n" style="left:' + x + '">' + c.need + '</div>'; }).join('') + '</div>';
        h += '<div class="list">' + Q.daily.map(qCard).join('') + '</div>' + timer(mid);
      } else if (qsTab === 'weekly') {
        h += '<div class="board"></div><div class="list">' + Q.weekly.map(qCard).join('') + '</div><div class="sec">Задания регрессии · обновятся после регрессии</div><div class="list">' + Q.ritual.map(qCard).join('') + '</div>' + timer(mon);
      } else if (qsTab === 'ach') {
        const intro = Q.intro.filter(q => !s.quests.claimed[q.id]), pts = C.achPoints(s);
        if (intro.length) h += '<div class="sec">Первые шаги</div><div class="list">' + intro.map(qCard).join('') + '</div>';
        h += '<div class="sec">Достижения: ' + pts + ' ступеней · ' + AL.filter(a => C.achClaimable(s, a.id)).length + ' можно забрать</div><button class="big" data-qgo="ach">Открыть достижения ›</button><div class="grow"></div>';   // 0.141: отдельный экран
      } else {
        const D = CFG.login.days, idx = C.loginDayIndex(s);
        h += '<div class="days">' + D.map((r, n) => { const got = n < idx, nw = n === idx && canLogin, k = r.tickets ? 'tickets' : r.crystals ? 'crystals' : Object.keys(r)[0];
          return '<div class="day' + (got ? ' got' : nw ? ' now' : '') + '"><div class="h">День ' + (n + 1) + '</div>' + rwi(k, r[k]) + (got ? '<i class="ok">✓</i>' : '') + '</div>'; }).join('') + '</div>';
        h += '<div class="grow"></div><button class="big" data-qlog' + (canLogin ? '' : ' disabled') + '>Забрать</button>' + (canLogin ? '' : '<div class="note">Сегодняшняя награда получена — завтра день ' + Math.min(idx + 1, D.length) + '</div>');
      }
      return h + '</div>';
    }
    // ---------- 0.113: экран Регрессии (ритуала) по макету пользователя — разметка; стили и картинки — src/regress.js ----------
    function regressHtml() {
      const A = window.RG_ART, R = CFG.ritual, ready = C.canRitual(s), souls = ready ? C.ritualSouls(s) : 0, after = { ...s, souls: B.add(s.souls, souls) };
      const im = n => '<img src="' + A[n] + '" alt="">', row = (ic, t, sub, mk) => '<div class="row"><div class="ic">' + ic + '</div><div class="tx">' + t + (sub ? '<small>' + sub + '</small>' : '') + '</div><img class="mk" src="' + A[mk] + '" alt=""></div>';
      const lightOk = ready && (s.crystals | 0) >= R.light.crystals;
      return '<div class="rg"><div class="rgBg"></div><div class="top">' +
        '<div class="abs img title">Регрессия</div>' +
        '<div class="abs img panel"></div><div class="abs img hdr">Вы получите:</div>' +
        '<div class="abs gain">' + im('i_soul') + '<b>+' + fmt(souls) + '</b><span>душ</span></div><div class="abs sep"></div>' +
        '<div class="abs bon"><div class="t">Бонус к урону:</div><div class="v">' + pctUp(C.soulMult(s)) + '<i>→</i><em>' + pctUp(C.soulMult(after)) + '</em></div></div></div>' +
        '<div class="bot"><div class="abs img box boxR"></div><div class="abs img box boxG"></div><div class="abs img hR">Будет сброшено:</div><div class="abs img hG">Сохранится:</div>' +
        '<div class="abs rows rowsR">' + row(im('i_gold'), 'Золото', '', 'i_x') + row(im('i_hex') + '<b>EXP</b>', 'Уровни героев', '', 'i_x') + row(im('i_stairs'), 'Этаж Башни', '', 'i_x') + '</div>' +
        '<div class="abs rows rowsG">' + row(im('i_heroes'), 'Герои', '(разблокировка)', 'i_check') + row(im('i_star'), 'Звёзды', '(1–15)', 'i_check') +
          row(im('i_ring'), 'Артефакты', '(уровень и прогресс)', 'i_check') + row(im('i_soul'), 'Души', '(валюта и улучшения)', 'i_check') + '</div>' +
        '<button class="abs img btn bD" data-rit' + (ready ? '' : ' disabled') + '><b>Тёмная регрессия</b><span>' + (ready ? 'Бесплатно' : 'Нужен этаж ' + R.floor) + '</span></button>' +
        '<button class="abs img btn bL" data-ritl' + (lightOk ? '' : ' disabled') + '><b>Светлая регрессия</b><span>' + im('i_crystal') + fmt(R.light.crystals) + '</span></button>' +
        '<div class="abs img badge">x' + R.light.mult + '</div></div></div>';
    }

    // ---------- 0.102: Рынок как в Idle Heroes (временный вид до макета пользователя) ----------
    const MK_IC = { tickets: '🎟', copy: '🧝', shard: '🔹', souls: '👻' };
    setInterval(() => { if (page === 'x' && xKind === 'market' && !document.hidden) refresh(); }, 1000);   // таймер обновления идёт сам
    function marketHtml() {
      const left = C.marketSync(s, Date.now()), hh = Math.floor(left / 3600000), mm = Math.floor(left / 60000) % 60, ss = Math.floor(left / 1000) % 60;
      const MA = window.MK_ART, MKI = { tickets: 'i_ticket', shard: 'i_shard', souls: 'i_soul' };
      const curI = g => MA ? '<img src="' + MA[g.cur === 'souls' ? 'i_soul' : 'i_crystal'] + '" alt="">' : (g.cur === 'souls' ? '👻 ' : '💎 ');
      let h = '<div class="mkTime">' + (MA ? 'Обновление через: ' : 'Новые товары через ') + '<b>' + hh + ':' + String(mm).padStart(2, '0') + ':' + String(ss).padStart(2, '0') + '</b></div><div class="mkGrid">';
      s.market.items.forEach((it, i) => {
        const g = C.marketGood(it.g), a = it.hero ? CFG.allies.find(x => x.id === it.hero) : null, price = C.marketPrice(s, g);
        const pd = it.p ? CFG.alchemy.potions.find(x => x.id === it.p) : null;
        const can = !it.sold && (g.cur === 'souls' ? B.gte(s.souls, price) : (s.crystals | 0) >= price) && !(pd && (s.potions[pd.id] || 0) + pd.sec > CFG.alchemy.maxSec);
        const art = MA && (g.kind === 'tickets' ? (g.n > 1 ? 'i_tickets5' : 'i_ticket') : MKI[g.kind]);
        const ic = a ? (ALLY_VIS[a.id].avatarImg || (MA ? '<img src="' + MA.i_hero + '" alt="">' : allySvg(ALLY_VIS[a.id], 0))) : pd ? (MA && MA['p_' + pd.id] ? '<img class="mkPotI" src="' + MA['p_' + pd.id] + '" alt="">' : '<b class="mkPot">' + pd.icon + '</b>') : art ? '<img src="' + MA[art] + '" alt="">' : '<b>' + MK_IC[g.kind] + '</b>';
        h += '<div class="mkCard' + (it.sold ? ' sold' : '') + (g.cur === 'crystal' ? ' cr' : '') + '" style="' + (a ? rvar(a.rarity) : '') + '"><div class="mkIc' + (a ? ' hero' : '') + '">' + ic + (a ? '<span class="rk">' + a.rarity + '</span>' : '') + '</div>' +
          '<div class="mkNm">' + (a ? a.name : pd ? pd.name : g.name) + '</div><div class="mkN">' + (pd ? pd.desc + ' · ' + Math.round(pd.sec / 60) + ' мин' : a ? a.rarity + ' · ' + (s.heroes[a.id].unlocked ? 'копия' : 'новый') : '×' + fmt(C.marketAmount(s, g))) + '</div>' +
          (it.sold ? '<div class="mkSold">' + (MA ? 'Продано' : 'Куплено') + '</div>' : '<button class="mkBuy" data-mkb="' + i + '"' + (can ? '' : ' disabled') + '>' + curI(g) + fmt(price) + '</button>') + '</div>';
      });
      h += '</div>' + (MA ? '<div class="mkRefWrap">' : '') + '<button class="mkRef" data-mkr' + ((s.crystals | 0) >= CFG.market.refreshCost ? '' : ' disabled') + '>' + (MA ? 'Обновить ' + curI({ cur: 'crystal' }) + CFG.market.refreshCost : '⟳ Обновить сейчас  💎 ' + CFG.market.refreshCost) + '</button>' + (MA ? '</div>' : '');
      h += '<p class="' + (MA ? 'mkNote' : 'hint3') + '" style="text-align:center">💎 — за первое прохождение мега-боссов; покупка за деньги — в версии для телефона.</p>';
      return h;
    }

    // ---------- 0.93: Кузница по макету (docs/ui/FORGE.md): вкладки, сетка полученных артефактов, витрина «Души / Кровь» ----------
    let fgBr = 'soul', fgSel = null;
    function forgeHtml() {
      const FA = window.FG_ART || {}, ic = a => FA['i_' + a.id] ? '<img src="' + FA['i_' + a.id] + '" alt="">' : '<b style="font-size:34px">' + a.icon + '</b>';
      const TABS = [['art', 'artifacts', FA.i_crown ? '<img src="' + FA.i_crown + '" alt="">' : '<b>⚒</b>', 'Артефакты'], ['runes', 'runes', '<b>ᚦ</b>', 'Руны'], ['altar', 'altar', '<b>🕯</b>', 'Алтарь'], ['bones', 'bones', '<b>🦴</b>', 'Кости']];
      let h = '<div class="fgTabs">' + TABS.filter(x => C.unlockedAt(s, x[1])).map(([id, , i, nm]) => '<button data-fgt="' + id + '" class="' + (id === 'art' ? 'on' : '') + '">' + i + nm + '</button>').join('') + '</div>';
      const got = CFG.artifacts.filter(a => C.artLevel(s, a.id) > 0).sort((x, y) => (x.blood ? 1 : 0) - (y.blood ? 1 : 0) || (y.special ? 1 : 0) - (x.special ? 1 : 0));
      h += '<div class="fgGrid">' + (got.length ? got.map(a => { const c = C.upgradeArtCost(s, a.id);
        return '<button class="fgCell" data-fgs="' + a.id + '">' + ic(a) + '<span class="lv">Ур. ' + C.artLevel(s, a.id) + '</span>' + (c != null && artCan(a, c) ? '<i class="bang2">!</i>' : '') + '</button>'; }).join('')
        : '<div class="fgEmpty">Пока ни одного артефакта. Купи первый на витрине ниже — за души с мега-боссов.</div>') + '</div>';
      const cur = fgBr === 'blood' ? '🔹' : '👻', have = fgBr === 'blood' ? s.materials.shard : s.souls;
      const bc = C.shopBuyCost(s, fgBr), rc = C.shopRefreshCost(s, fgBr);
      h += '<div class="fgLow"><div class="fgBr"><button class="s' + (fgBr === 'soul' ? ' on' : '') + '" data-fgb="soul">Ветвь Душ</button><button class="b' + (fgBr === 'blood' ? ' on' : '') + '" data-fgb="blood">Ветвь Крови</button></div>';
      if (bc == null) h += '<div class="fgAll">Все артефакты этой ветви найдены</div>';
      else {
        h += '<div class="fgOff">' + C.shopOffers(s, fgBr).map((id, i) => {
          if (!id) return '<div class="fgCard sold"><b>Куплено</b></div>';
          const a = CFG.artifacts.find(x => x.id === id);
          return '<div class="fgCard">' + ic(a) + '<div class="nm">' + a.name + '</div><div class="ds">' + a.desc + '</div><button class="buy" data-sbuy="' + fgBr + ':' + i + '"' + (B.gte(have, bc) ? '' : ' disabled') + '>' + cur + ' ' + fmt(bc) + '</button></div>';
        }).join('') + '</div>';
        h += '<button class="fgRef" data-sref="' + fgBr + '"' + (B.gte(have, rc) ? '' : ' disabled') + '>Обновить  ' + cur + ' ' + fmt(rc) + '</button>';
      }
      h += '</div>';
      if (fgSel) {
        const a = CFG.artifacts.find(x => x.id === fgSel), lv = C.artLevel(s, a.id), c = C.upgradeArtCost(s, a.id), ok = c != null && artCan(a, c);
        h += '<div class="fgPop"><div class="box' + (a.blood ? ' blood' : '') + '"><button class="x" data-fgx>✕</button>' + ic(a) + '<h3>' + a.name + '</h3><div class="lvl">Ур. ' + lv + (a.max ? ' / ' + a.max : '') + '</div><p>' + a.desc + '</p>' +
          (c == null ? '<div class="row"><button disabled>Максимум</button></div>'
            : '<div class="row"><button data-fgu="1"' + (ok ? '' : ' disabled') + '>Улучшить<br>' + (a.blood ? '🔹 ' : '👻 ') + fmt(c) + '</button><button data-fgu="max"' + (ok ? '' : ' disabled') + '>MAX</button></div>') + '</div></div>';
      }
      return h;
    }

    // ---------- Портал (этап 8): один общий портал, ×1 и ×10, шансы, история, шкала гарантии ----------
    const HIST_KEY = 'prizvannyy_v2_hist';
    function histGet() { try { return JSON.parse(localStorage.getItem(HIST_KEY) || '[]'); } catch (e) { return []; } }
    function histAdd(list) { try { localStorage.setItem(HIST_KEY, JSON.stringify(list.concat(histGet()).slice(0, 100))); } catch (e) {} }
    let oddsHtml = '';
    function portalHtml() {
      if (window.PT_ART) return portalHtml3();
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
      oddsHtml = '<table class="oddsTbl">' + RANKS.slice(base).map(r => {
        const on = open.includes(r), g = CFG.rarityGates[r];
        return '<tr style="' + (on ? '' : 'opacity:.4') + '"><td><b style="color:' + (RC[r] || '#888') + '">' + r + '</b></td><td style="text-align:right">' + (on ? (P.odds[r] / tot * 100).toFixed(2) + '%' : (g && !C.rarityOpen(s, r) ? 'с ' + g + ' эт.' : '—')) + '</td></tr>';
      }).join('') + '</table><p class="hint3">После ' + P.softS + ' призывов без S шанс S растёт с каждым. Гарантии у баннеров раздельные. SS/SSS/GOD открываются рекордом этажа.</p>';
      h += '<label class="qk"><input type="checkbox" data-qk' + (setg.qsum === 'on' ? ' checked' : '') + '> Быстрый призыв</label>';
      h += '<div style="text-align:center"><button class="iBtn" data-odds>?</button> <span class="hint3">шансы призыва</span></div>';
      return h;
    }
    // 0.86: Портал по макету пользователя (docs/ui/PORTAL.md, references/portal_mockup_v1.png; детали — tools/portalcut.py → assets/portal, стили — src/portal.js)
    function portalHtml3() {
      const A = window.PT_ART, P = CFG.portal, b = C.bannerDef(ban), pity = C.bannerPity(s, ban), pS = b.pityS || P.pityS;
      const base = b.minRarity ? RANKS.indexOf(b.minRarity) : 0;
      const open = RANKS.filter((r, i) => i >= base && C.rarityOpen(s, r) && CFG.allies.some(a => a.rarity === r && !a.hidden && !a.seasonal));
      const tot = open.reduce((x, r) => x + P.odds[r], 0);
      let h = '';   // 0.91: рецепты убраны — вкладок нет, только призыв
      oddsHtml = '<table class="oddsTbl">' + RANKS.slice(base).map(r => { const on = open.includes(r), g = CFG.rarityGates[r];
        return '<tr style="' + (on ? '' : 'opacity:.4') + '"><td><b style="color:' + (RC[r] || '#888') + '">' + r + '</b></td><td style="text-align:right">' + (on ? (P.odds[r] / tot * 100).toFixed(2) + '%' : (g && !C.rarityOpen(s, r) ? 'с ' + g + ' эт.' : '—')) + '</td></tr>'; }).join('') +
        '</table><p class="hint3">Гарантия: A и выше за ' + (b.pityA || P.pityA) + ' призывов, S и выше за ' + pS + '. После ' + P.softS + ' призывов без S шанс S растёт. Гарантии у баннеров раздельные. SS/SSS/GOD открываются рекордом этажа.</p>';
      h += '<div class="ptOdds"><h4>Шансы призыва</h4>' + RANKS.slice(base).map(r => { const on = open.includes(r);
        return '<div class="r' + (on ? '' : ' off') + '"><i style="' + rvar(r) + '">' + r + '</i><span>' + (on ? (P.odds[r] / tot * 100).toFixed(2) + '%' : '🔒') + '</span></div>'; }).join('') + '</div>';
      h += '<div class="ptLow">';
      h += '<div class="ptPT">Гарантированный ранг: <b>S</b> и выше</div>';
      h += '<div class="ptPity"><button class="ptInfo" data-odds aria-label="Шансы"></button><div class="ptBar"><i style="--w:' + Math.min(100, pity.s / pS * 100) + '%"></i><b>' + pity.s + ' / ' + pS + '</b></div><div class="ptMedal">S</div></div>';
      const c1 = C.canSummon(s, ban, 1), c10 = C.canSummon(s, ban, 10), cost = n => { const c = C.bannerCost(ban, n); return c.lanterns ? '🏮 ' + c.lanterns : '<img src="' + A.ticket + '" alt="">' + c.tickets; };
      h += '<div class="ptPull"><button class="ptBtn blue" data-pull="1"' + (c1 ? '' : ' disabled') + '><b>Призвать ×1</b><span>' + cost(1) + '</span></button>' +
        '<button class="ptBtn gold" data-pull="10"' + (c10 ? '' : ' disabled') + '><b>Призвать ×10</b><span>' + cost(10) + '</span></button></div>';
      h += '<div class="ptNo' + (c1 ? ' hid' : '') + '"><i>!</i>Недостаточно ' + (ban === 'event' ? 'фонарей' : 'билетов') + '</div>';
      const feat = b.featured ? C.featuredHeroes(s).map(id => CFG.allies.find(a => a.id === id)) : [];
      const L = P.banners.filter(x => x.id !== 'event' || C.currentEvent(s));
      h += '<div class="ptBan"><button class="ptArr l" data-banp="-1" aria-label="Назад"></button><div class="ptBanIn"><b>' + b.icon + ' ' + b.name + '</b><span>' + b.desc + (feat.length ? '. Герои недели: ' + feat.map(a => a.name + ' (' + a.rarity + ')').join(', ') : '') + '</span>' +
        '<div class="ptDots">' + L.map(x => '<i class="' + (x.id === ban ? 'on' : '') + '"></i>').join('') + '</div></div><button class="ptArr r" data-banp="1" aria-label="Вперёд"></button></div>';
      return h + '</div>';
    }
    function histHtml() {
      const L = histGet();
      if (!L.length) return '<div class="hint3" style="text-align:center;margin-top:20px">Пока пусто — здесь будут последние 100 призывов.</div>';
      return '<div class="hist">' + L.map(x => { const a = CFG.allies.find(h => h.id === x.id) || { name: x.id };
        return '<div><span><b style="color:' + (RC[x.r] || '#fff') + '">' + x.r + '</b> ' + a.name + (x.n ? ' · <span style="color:#6be37a">новый</span>' : '') + '</span><span>' + new Date(x.t).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) + '</span></div>'; }).join('') + '</div>';
    }
    // 0.69 (ответы 84–95): карты вылетают рубашкой вверх и переворачиваются по тапу; S+ дрожит заранее;
    // дубликат рассыпается в осколки; катсцена — только для нового героя S и выше; «Ещё раз» / «Готово»; «Быстрый призыв» — сразу открыты
    let fxAll = [], lastN = 1;
    function pull2(n) {
      const r = C.summon(s, n, ban); if (!r) return;
      lastN = n;
      histAdd(r.map(x => ({ id: x.id, r: x.rarity, n: x.isNew ? 1 : 0, t: Date.now(), b: ban })));
      save(); render();
      fxAll = r;
      const best = r.reduce((m, x) => RANKS.indexOf(x.rarity) > RANKS.indexOf(m.rarity) ? x : m, r[0]);
      $('sumFx').style.setProperty('--fx', RC[best.rarity] || '#b14dff');
      $('sumFx').classList.add('show'); $('sfSkip').classList.remove('on');
      const quick = setg.qsum === 'on', hiS = RANKS.indexOf('S');
      $('sfStage').innerHTML = '<div style="width:100%"><div class="flipGrid' + (r.length === 1 ? ' one' : '') + '">' + r.map((x, i) => {
        const a = CFG.allies.find(h => h.id === x.id), A = HERO_ART[x.id], v = ALLY_VIS[x.id] || {};
        const ri = RANKS.indexOf(x.rarity), tier = ri >= RANKS.indexOf('SS') ? ' tH' : ri >= hiS ? ' tS' : '';
        return '<div class="flip' + (ri >= hiS ? ' rareS' : '') + tier + (x.isNew ? ' isNew' : ' dup') + (quick ? ' open' : '') + '" data-fl="' + i + '" style="' + rvar(x.rarity) + ';animation-delay:' + (i * 70) + 'ms">' +
          '<div class="back">✦</div><div class="front"><span class="fxBurst"></span><span class="fxShards"></span>' + (A && A.avatar ? '<img src="' + A.avatar + '" alt="">' : '<b>' + (v.icon || '✦') + '</b>') + '<i>' + x.rarity + '</i><span class="nm">' + a.name + '</span>' +
          (x.isNew ? '<em class="nRib">НОВЫЙ</em>' : '') + '<span class="tag" style="color:' + (x.isNew ? '#6be37a' : '#b9b1c3') + '">' + (x.isNew ? 'НОВЫЙ' : 'дубликат') + '</span></div></div>'; }).join('') + '</div>' +
        '<div class="hint3" style="text-align:center;margin-top:10px" id="flipHint">' + (quick || window.PT_AUTO ? '' : 'Нажимайте на карты, чтобы открыть') + '</div>' +
        '<div class="sfDone" style="display:flex;gap:8px;justify-content:center;margin-top:10px"><button class="upBtn alt" id="sfAgain" style="width:130px">Ещё раз ×' + n + '</button><button class="upBtn gold" id="sfOk" style="width:130px">Готово</button></div></div>';
      $('sumFx').classList.toggle('ptv', !!window.PT_ART);
      // 0.90.1: карты открываются по очереди сами; новые и редкие (S+) — с показом как в Raid (src/portal.js PT_AUTO), дубликаты — простой переворот
      if (window.PT_AUTO && !quick) window.PT_AUTO(r.map(x => { const a = CFG.allies.find(h => h.id === x.id) || {}, A = HERO_ART[x.id] || {}, v = ALLY_VIS[x.id] || {};
        return { rarity: x.rarity, isNew: x.isNew, name: a.name || x.id, role: a.role || '', faction: a.faction || '', art: A.side || A.avatar || A.back || '', artHtml: v.avatarImg || '', icon: v.icon || '✦', rc: RC[x.rarity] || '#b14dff' }; }),
        () => { $('sfStage').querySelectorAll('.flip').forEach(f => f.classList.add('open')); const h = $('flipHint'); if (h) h.textContent = ''; });
      click();
    }
    function flipOpen(card) {
      if (card.classList.contains('open')) return;
      card.classList.add('open'); click();
      const x = fxAll[+card.dataset.fl];
      if (x && x.isNew && RANKS.indexOf(x.rarity) >= RANKS.indexOf('S') && window.U3) {
        const a = CFG.allies.find(h => h.id === x.id);
        setTimeout(() => window.U3.sys({ title: 'НОВЫЙ ГЕРОЙ', glitch: true, text: a.name + ' (' + x.rarity + ') отвечает на ваш зов. ' + (a.quote ? '«' + a.quote + '»' : '') }), 500);
      }
      if (!$('sfStage').querySelector('.flip:not(.open)')) { const h = $('flipHint'); if (h) h.textContent = ''; }
    }
    $('sfSkip').addEventListener('click', () => { click(); $('sfStage').querySelectorAll('.flip').forEach(flipOpen); });
    $('sfStage').addEventListener('click', e => {
      const f = e.target.closest('.flip'); if (f) { flipOpen(f); return; }
      if (e.target.id === 'sfOk') { click(); $('sumFx').classList.remove('show'); lastHtml = {}; refresh(); }
      if (e.target.id === 'sfAgain') { if (!C.canSummon(s, ban, lastN)) { toast('Не хватает билетов'); return; } pull2(lastN); }
    });
    $('xBody').addEventListener('change', e => { if (e.target.matches('[data-qk]')) { setg.qsum = e.target.checked ? 'on' : 'off'; applySettings(); } });
    // свайп портала — смена баннера
    let swX = null;
    $('xBody').addEventListener('touchstart', e => { if (e.target.closest('.gate')) swX = e.touches[0].clientX; }, { passive: true });
    $('xBody').addEventListener('touchend', e => {
      if (swX == null) return; const dx = e.changedTouches[0].clientX - swX; swX = null;
      if (Math.abs(dx) < 50 || xKind !== 'portal') return;
      const L = CFG.portal.banners.filter(x => x.id !== 'event' || C.currentEvent(s)).map(x => x.id), i = L.indexOf(ban);
      ban = L[(i + (dx < 0 ? 1 : -1) + L.length) % L.length]; click(); lastHtml = {}; refresh();
    });

    // ---------- Души и регрессия ----------
    function soulsHtml2() {
      const R = CFG.ritual, ready = C.canRitual(s);
      let h = '<div class="soulBig"><div class="n">👻 ' + fmt(s.souls) + '</div><p>Неизрасходованные души: ' + pctUp(C.soulMult(s)) + ' всего урона (+' + Math.round(CFG.souls.dpsPerSoul * 100) + '% за душу). Траты на артефакты и дерево уменьшают этот бонус — сравнивайте DPS до и после.</p></div>';
      h += '<div class="ritual' + (ready ? ' ready' : '') + '"><h3>🕯 Регрессия</h3>' +
        (ready ? '<p>Сейчас: <b style="color:#8fe6ff">+' + fmt(C.ritualSouls(s)) + ' душ</b>, новый забег с этажа ' + C.ritualStartFloor(s) + '. Чем выше этаж, тем больше душ. Перед регрессией делается резервная копия.</p>'
               : '<p>Откроется на этаже ' + R.floor + '. Сейчас этаж ' + s.maxFloor + ', рекорд ' + s.bestFloor + (s.rituals ? ', регрессий: ' + s.rituals : '') + '.</p>') +
        '<button class="upBtn" data-rit style="width:70%"' + (ready ? '' : ' disabled') + '>' + (ready ? 'Тёмная регрессия' : 'Нужен этаж ' + R.floor) + '<span>бесплатно · 👻 ' + fmt(C.ritualSouls(s)) + '</span></button>' +
        (ready ? '<button class="upBtn" data-ritl style="width:70%;margin-top:6px;background:linear-gradient(#4ad0ff,#1a6ab0)"' + ((s.crystals | 0) >= R.light.crystals ? '' : ' disabled') + '>Светлая регрессия<span>💎 ' + R.light.crystals + ' · 👻 ' + fmt(B.floor(B.mul(C.ritualSouls(s), R.light.mult))) + ' (×' + R.light.mult + ')</span></button>' : '') + '</div>';
      h += '<div class="secT">Артефакты — в Меню → Артефакты</div>';
      for (const b of CFG.soulTree) {
        const opn = C.branchOpen(s, b);
        h += '<div class="brH">' + b.name + (opn ? '' : '<small>🔒 после ' + b.rituals + ' ' + (b.rituals === 1 ? 'регрессии' : 'регрессий') + '</small>') + '</div>';
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
    function doRitual(kind) {
      if (!C.canRitual(s)) return;
      const light = kind === 'light';
      if (light && (s.crystals | 0) < CFG.ritual.light.crystals) return;
      const souls = light ? B.floor(B.mul(C.ritualSouls(s), CFG.ritual.light.mult)) : C.ritualSouls(s), start = C.ritualStartFloor(s), after = { ...s, souls: B.add(s.souls, souls) };
      ask('<b>' + (light ? 'Светлая регрессия · 💎 ' + CFG.ritual.light.crystals : 'Тёмная регрессия') + '</b><span class="askList"><b>Получите:</b> +' + fmt(souls) + ' душ (бонус урона ' + pctUp(C.soulMult(s)) + ' → ' + pctUp(C.soulMult(after)) + ')<br>' +
        '<b>Сбросится:</b> золото, уровни удара и героев, найм, этаж — новый забег с этажа ' + start + (C.ritualStartGold(s) ? ' и ◆ ' + fmt(C.ritualStartGold(s)) + ' золота' : '') + '<br>' +
        '<b>Сохранится:</b> дерево душ, герои, звёзды, эволюции, питомцы, материалы, отряд, билеты, эссенция, артефакты, души, рекорды</span>', 'Провести регрессию', () => {
        writeCopy(PRE_RIT);
        const r = C.ritual(s, light ? 'light' : 'dark'); if (!r) return;
        dmgLog.length = 0; restartAnim('spawn');
        toast('Регрессия проведена<small>+' + fmt(r.souls) + ' 👻 · старт с этажа ' + r.start + '</small>');
        if (r.milestone) setTimeout(() => toast('Новый титул: «' + r.milestone.title + '»<small>+' + Math.round(r.milestone.bonus.per * 100) + '% ' + (r.milestone.bonus.kind === 'gold' ? 'золота' : 'урона') + ' навсегда · награды — в центре наград 📬</small>'), 2500);
        save(); render();
      });
    }

    // ---------- PvE ----------
    const tier2 = {};
    function pveHtml2() {
      const P = CFG.pve, busy = !!s.mode, maxT = C.maxDungeonTier(s);
      const mid = new Date(); mid.setHours(24, 0, 0, 0); const left = Math.max(0, mid - Date.now()), lh = Math.floor(left / 3600000), lm = Math.floor(left % 3600000 / 60000);
      let h = (busy ? '<div class="noMoney" style="color:#ffd36b">Сейчас идёт «' + s.mode.name + '». Сдаться — кнопкой на арене.</div>' : '') +
        '<div class="hint3" style="text-align:right">⏳ Попытки обновятся через ' + lh + ' ч ' + lm + ' мин</div>';
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
      const pc = C.personalBuyCost(s);
      h += '<div class="secT">Личные боссы · ' + pl + ' попыт. · ' + P.personal.time + ' с</div>' + (pl ? '' : '<div class="pveCard"><div class="ic">💎</div><div><b>Попытки закончились</b><p>' + P.personal.attempts + ' бесплатно в день' + (pc != null ? ', ещё можно купить: ' + (P.personal.buyMax - (s.pve.used.personalBuy | 0)) : ', куплено максимум — завтра снова') + '</p></div>' + (pc != null ? '<button class="upBtn" data-pbuy' + ((s.crystals | 0) >= pc ? '' : ' disabled') + '>Купить<br>💎 ' + pc + '</button>' : '') + '</div>');
      if (!bosses.length) h += '<div class="pveCard"><div class="ic">?</div><div><b>Пока нет</b><p>Победите финального босса биома (этаж 50) — он станет личным боссом.</p></div></div>';
      for (const b of bosses) h += '<div class="pveCard" style="' + rvar('A') + '"><div class="ic">👹</div><div><b>' + b.name + '</b><p>' + b.biome + ' · этаж ' + b.floor + '</p></div><div></div><div class="diffRow">' +
        P.personal.diffs.map(D => '<button class="upBtn" data-pb2="' + b.id + ':' + D.id + '"' + (!busy && pl ? '' : ' disabled') + '>' + D.name + '<small>' + rewardText(C.personalReward(s, b.floor, D.id)) + '</small></button>').join('') + '</div></div>';
      h += '<div class="secT">Рейтинги и мировой босс</div><div class="pveCard"><div class="ic">🌍</div><div><b>Скоро</b><p>Рейтинги игроков и общий мировой босс появятся вместе с сервером и аккаунтами.</p></div></div>';
      return h;
    }
    function goMode(kind, opts) { const before = s.mode; startMode(kind, opts); if (!before && s.mode) { stack.length = 0; page = null; show(null); } }

    $('xBody').addEventListener('click', e => {
      if (e.target.classList && e.target.classList.contains('hWrap')) { click(); hsSel = null; render(); return; }   // тап мимо окна героя — закрыть
      const b = e.target.closest('button'); if (!b || b.disabled) return;
      const d = b.dataset;
      if (d.ban) { click(); ban = d.ban; }
      else if (d.banp) { click(); const L = CFG.portal.banners.filter(x => x.id !== 'event' || C.currentEvent(s)).map(x => x.id), i = L.indexOf(ban); ban = L[(i + +d.banp + L.length) % L.length]; }
      else if (d.odds !== undefined) { click(); if (window.U3) window.U3.sys({ title: 'ШАНСЫ ПРИЗЫВА', html: oddsHtml }); return; }
      else if (d.pull) { click(); pull2(+d.pull); }
      else if (d.mkb) { const r = C.marketBuy(s, +d.mkb); if (!r) return; click(); const g = C.marketGood(r.g), a = r.hero && CFG.allies.find(x => x.id === r.hero), pd = r.p && CFG.alchemy.potions.find(x => x.id === r.p);
        toast('Куплено!<small>' + (a ? a.name + (r.isNew ? ' — новый герой' : ' — копия') : pd ? pd.name + ' — ' + pd.desc + ' на ' + Math.round(pd.sec / 60) + ' мин' : g.name + ' ×' + fmt(r.n)) + '</small>'); save(); }
      else if (d.rgback !== undefined) { xBack.click(); return; }
      else if (d.dyt) { click(); dyTab = d.dyt; }
      else if (d.dyb !== undefined) { click(); dyB = Math.max(0, Math.min(CFG.biomes.length - 1, +d.dyb)); }
      else if (d.clv) { click(); clView = d.clv; clSel = null; }
      else if (d.cln) { click(); clSel = d.cln; }
      else if (d.clup !== undefined) { if (!C.buyClassNode(s, clSel)) return; click(); save(); }
      else if (d.clch !== undefined) { const id = C.classDef(clView) ? clView : null; if (!id) return; const first = !s.cls.id;
        const go = () => { if (C.chooseClass(s, id, dayKey())) { click(); toast((first ? 'Класс выбран' : 'Класс сменён') + '<small>' + C.classDef(id).name + '</small>'); save(); render(); } };
        if (first || !window.U3) go(); else window.U3.sys({ title: 'СМЕНИТЬ КЛАСС?', text: 'Все очки вернутся, сменить снова можно будет только завтра.', btns: [{ t: 'Отмена' }, { t: 'Сменить', fn: go }] }); return; }
      else if (d.hf) { click(); if (d.hf === 'all') { delete hsF.rarity; delete hsF.side; } else { const [k, v] = d.hf.split(':'), f = k === 'r' ? 'rarity' : 'side'; hsF[f] = hsF[f] === v ? undefined : v; } }
      else if (d.hh) { if (!s.heroes[d.hh].unlocked) { const a = CFG.allies.find(x => x.id === d.hh); toast('Герой не открыт<small>' + (CFG.rarities.indexOf(a.rarity) <= CFG.rarities.indexOf(CFG.goldHire.maxRarity) ? 'Купите в Штабе за золото' : 'Выпадает в Портале') + '</small>'); return; } click(); hsSel = d.hh; }
      else if (d.hs) { const k = d.hs;
        if (k === 'bg') { if (e.target === b) { click(); hsSel = null; } else return; }
        else if (k === 'close') { click(); hsSel = null; }
        else if (k === 'prev' || k === 'next') { const L = hsIds().filter(id => s.heroes[id].unlocked), i = L.indexOf(hsSel); if (L.length) { click(); hsSel = L[(i + (k === 'next' ? 1 : -1) + L.length) % L.length]; } }
        else if (k === 'star') { if (!C.starUp(s, hsSel)) return; click(); toast('Звезда!<small>' + CFG.allies.find(x => x.id === hsSel).name + ' ★' + s.heroes[hsSel].stars + '</small>'); save(); }
        else if (k === 'rank') { if (!C.rankUp(s, hsSel)) return; click(); save(); }
        else if (k === 'asc') { if (!C.ascend(s, hsSel)) return; click(); toast('Возвышение!<small>' + CFG.allies.find(x => x.id === hsSel).name + ' — теперь ранг ' + C.heroRarity(s, hsSel) + '</small>'); save(); }
        else if (k === 'evo') { if (!C.evolve(s, hsSel)) return; click(); toast('Эволюция!<small>' + CFG.allies.find(x => x.id === hsSel).name + '</small>'); save(); } }
      else if (d.qt) { click(); qsTab = d.qt; $('xBody').scrollTop = 0; }
      else if (d.qc) { const r = C.claimQuest(s, d.qc); if (!r) return; click(); toast('Задание выполнено<small>' + rewardLine(r) + '</small>'); save(); }
      else if (d.qa) { const r = C.claimAch(s, d.qa); if (!r) return; click(); toast('Ступень получена<small>' + rewardLine(r) + '</small>'); save(); }
      else if (d.qaall !== undefined) { const r = C.claimAllAch(s); if (!r) return; click(); toast('Забрано ступеней: ' + r.count + '<small>' + rewardLine(r.reward) + '</small>'); save(); }
      else if (d.exsel) { click(); expSel = +d.exsel; expPick = []; }
      else if (d.excancel !== undefined) { click(); expSel = null; expPick = []; }
      else if (d.expick) { const id = d.expick, i = expPick.indexOf(id), o = s.exp.offers.find(x => x.uid === expSel); if (!o) return; click();
        if (i >= 0) expPick.splice(i, 1); else if (expPick.length < CFG.expeditions.lengths[o.len].team) expPick.push(id); else toast('Отряд полный<small>сними героя, чтобы взять другого</small>'); }
      else if (d.exauto) { const o = s.exp.offers.find(x => x.uid === +d.exauto); const t = o && expAuto(o); if (!t) { toast('Не получается собрать<small>не хватает подходящих героев — смени поход</small>'); return; } click(); expPick = t; }
      else if (d.exgo) { if (!C.expStart(s, +d.exgo, expPick, Date.now())) return; click(); toast('Отряд ушёл в поход<small>герои продолжают драться в Башне</small>'); expSel = null; expPick = []; save(); }
      else if (d.exrr) { if (!C.expReroll(s, +d.exrr)) { toast('Нужен билет 🎟'); return; } click(); save(); }
      else if (d.exclaim) { const r = C.expClaim(s, +d.exclaim, Date.now()); if (!r) return; click();
        toast('Отряд вернулся<small>' + expRw({ shard: r.shard, tickets: r.tickets, crystals: r.crystals }) + (r.copies.length ? ' · копии: ' + r.copies.map(id => CFG.allies.find(a => a.id === id).name).join(', ') : '') + '</small>'); save(); }
      else if (d.acat) { click(); achCat = d.acat; $('xBody').scrollTop = 0; }
      else if (d.qch) { const r = C.openQuestChest(s, +d.qch); if (!r) return; click(); toast('Сундук открыт<small>' + rewardLine(r) + '</small>'); save(); }
      else if (d.qlog !== undefined) { const r = C.claimLogin(s, dayKey()); if (!r) return; click(); toast('Награда за вход · день ' + r.day + '<small>' + rewardLine(r.reward) + '</small>'); save(); }
      else if (d.qgo) { click(); const g = d.qgo;
        if (g === 'ach') { openX('ach'); return; }
        if (g === 'arena') { stack.length = 0; page = null; show(null); return; }
        if (g === 'portal' || g === 'souls') { openX(g === 'souls' ? 'regress' : g); return; }
        stack.length = 0; page = null; show(null); if (g === 'up') open('up'); else openOld(g); return; }
      else if (d.mkr !== undefined) { if (!C.marketRefresh(s)) return; click(); save(); }
      else if (d.fgb) { click(); fgBr = d.fgb; }
      else if (d.fgs) { click(); fgSel = d.fgs; }
      else if (d.fgx !== undefined) { click(); fgSel = null; }
      else if (d.fgu) { let k = 0; const n = d.fgu === 'max' ? 1e4 : 1; while (k < n && C.upgradeArtifact(s, fgSel)) k++; if (k) { click(); save(); } }
      else if (d.fgt) { click(); if (d.fgt !== 'art') { openOld(d.fgt); return; } }
      else if (d.sbuy) { const [br, i] = d.sbuy.split(':'); const id = C.shopBuy(s, br, +i); if (!id) return; click(); const a = CFG.artifacts.find(x => x.id === id); toast('Артефакт куплен!<small>' + a.icon + ' ' + a.name + '</small>'); save(); }
      else if (d.sref) { if (!C.shopRefresh(s, d.sref)) return; click(); save(); }
      else if (d.rit !== undefined) { click(); doRitual('dark'); return; }
      else if (d.ritl !== undefined) { click(); doRitual('light'); return; }
      else if (d.tree) { click(); if (C.buyTreeNode(s, d.tree)) save(); }
      else if (d.t2) { click(); const [id, dl] = d.t2.split(':'); tier2[id] = (tier2[id] || 1) + +dl; }
      else if (d.dun2) { click(); goMode('dungeon', { id: d.dun2, tier: tier2[d.dun2] }); }
      else if (d.m2) { click(); goMode(d.m2, {}); }
      else if (d.pbuy !== undefined) { if (!C.buyPersonal(s)) { toast('Не хватает 💎'); return; } click(); toast('Попытка куплена<small>личный босс ждёт</small>'); save(); }
      else if (d.pb2) { click(); const [id, diff] = d.pb2.split(':'); goMode('personal', { id, diff }); }
      else return;
      render();
    });

    // ---------- обновление ----------
    function refresh() {
      // волна и % HP на экране боя
      if (!s.mode) $('waveLbl').textContent = 'Волна ' + Math.min(s.enemyIndex, CFG.enemiesPerFloor) + '/' + CFG.enemiesPerFloor; else $('waveLbl').textContent = '';
      const en = s.enemy; if (en && B.gt(en.maxHp, 0)) el.hpText.textContent = fmt(en.hp) + ' / ' + fmt(en.maxHp) + ' (' + Math.ceil(B.toNum(B.div(en.hp, en.maxHp)) * 100) + '%)';
      $('tbLv').textContent = 'Ур. ' + C.prestigeLevel(s);
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
    // 0.69: доступ для слоя ui3 (экран боя, профиль, настройки)
    window.U2 = { open, openX, openOld, openQuests, back, show, click, refresh, press, popBackups, bestSquad,
      sec: v => { stack.length = 0; page = null; sec = v; artSel = null; open('sec'); },
      home: () => { stack.length = 0; page = null; },
      get page() { return page; } };
    refresh();
  })();
