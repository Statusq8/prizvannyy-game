  // ===================== UI 2 (0.40) — по docs/ui/UI_MASTER_v2.md =====================
  // Новые экраны поверх старой логики: 4 угловые кнопки, главное меню, Прокачка, Артефакты, Сумка, Питомцы, Карта Башни.
  // Остальные разделы пока открываются старыми вкладками внутри полноэкранной страницы (TODO: свой дизайн).
  var ui2Refresh = null;
  (function () {
    const RC = { E: '#8d8d96', D: '#4cbf5a', C: '#3a8fe0', B: '#a050e0', A: '#e04848', S: '#ffb030', SS: '#ff7a20', SSS: '#ff40c0', GOD: '#fff2a0' };
    const rvar = r => '--rc:' + (RC[r] || '#6e6678') + ';--rg:' + (RC[r] || '#6e6678') + '88';
    const SECS = [['up', '⚔', 'Прокачка', '#d6a640'], ['art', '💎', 'Артефакты', '#b14dff'], ['bag', '🎒', 'Сумка', '#3a8fe0'], ['pets', '🐉', 'Питомцы', '#4cbf5a']];
    const MORE = [['portal', '🌀', 'Портал'], ['heroes', '🪖', 'Герои и отряд'], ['souls', '👻', 'Души и ритуал'], ['altar', '🕯', 'Алтарь'], ['quests', '📜', 'Задания'],
      ['season', '🎖', 'Сезон'], ['events', '🏮', 'События'], ['inbox', '📬', 'Награды'], ['runes', 'ᚦ', 'Руны'], ['bones', '🦴', 'Кости'], ['stats', '📊', 'Статистика']];
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
      lastHtml = {}; show(page === 'menu' ? 'pgMenu' : page === 'sec' ? 'pgSec' : 'pgMap'); refresh();
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
    $('cbPve').addEventListener('click', e => { e.stopPropagation(); press(e.currentTarget); openOld('pve'); });
    $('cbMap').addEventListener('click', e => { e.stopPropagation(); press(e.currentTarget); stack.length = 0; page = null; open('map'); });

    // ---------- главное меню ----------
    function renderMenu() {
      setHtml('mTop', cur('◆', fmt(s.gold), true) + cur('🎟', fmt(s.tickets)) + cur('👻', fmt(s.souls)));
      const sub = { up: 'Главный герой и союзники', art: 'Все найденные действуют сразу', bag: 'Материалы, билеты, руны, кости', pets: 'Призванное существо в бою' };
      const bang = { up: navBang.up, art: navBang.souls, bag: false, pets: CFG.pets.list.some(p => !C.petLevel(s, p.id) && C.petCanUnlock(s, p.id)) };
      let h = SECS.map(([id, ic, nm, c]) => '<button class="mCard" data-sec="' + id + '" style="--tc:' + c + '"><span class="ic">' + ic + '</span><span><span class="nm">' + nm + '</span><small>' + sub[id] + '</small></span>' +
        (bang[id] ? '<i class="bang2">!</i>' : '') + '</button>').join('');
      h += '<div class="secT">Другие разделы · временно в старом виде</div><div class="mMore">' +
        MORE.map(([id, ic, nm]) => '<button data-old="' + id + '"><b>' + ic + '</b>' + nm + (navBang[id] ? '<i class="bang2">!</i>' : '') + '</button>').join('') + '</div>';
      setHtml('mBody', h);
    }
    $('mBody').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.sec) { click(); sec = b.dataset.sec; artSel = null; open('sec'); }
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
    $('ui2Pop').addEventListener('click', e => {
      const b = e.target.closest('button');
      if (e.target.id === 'ui2Pop' || (b && b.dataset.pclose !== undefined)) { click(); $('ui2Pop').classList.remove('show'); return; }
      if (b && b.dataset.pgo) { $('ui2Pop').classList.remove('show'); openOld(b.dataset.pgo); }
    });

    // Питомцы: один большой выбранный сверху, остальные ниже; 1 активное + 1 пассивное умение
    function petsHtml() {
      const P = CFG.pets, list = P.list;
      if (!petSel || !C.petDef(petSel)) petSel = s.pets.active || (list.find(p => C.petLevel(s, p.id)) || list[0]).id;
      const p = C.petDef(petSel), lv = C.petLevel(s, p.id), act = s.pets.active === p.id, up = C.petUpCost(s, p.id), canUp = up && s.materials.shard >= up, canGet = !lv && C.petCanUnlock(s, p.id);
      const u = p.unlock, cond = u.floor ? 'этаж ' + u.floor : u.rituals ? u.rituals + ' ритуал' : u.totems + ' тотемов';
      let h = '<div class="petTop" style="' + rvar(act ? 'S' : 'B') + '"><div class="pic"' + (lv ? '' : ' style="filter:brightness(0) drop-shadow(0 0 2px #6e6678)"') + '>' + p.icon + '</div>' +
        '<div><div class="nm">' + p.name + '</div>' + (lv ? '<div class="ln">Ур. <b>' + lv + '</b> / ' + P.maxLevel + '</div><div class="ln">⚔ <b>' + Math.round(C.petShare(s, p.id) * 100) + '%</b> DPS отряда</div>' +
        (act ? '<div class="ln" style="color:#ffd36b">● в бою</div>' : '') : '<div class="ln">🔒 Откроется: ' + cond + '</div>') + '</div></div>';
      h += '<div class="petBtns">' +
        (lv ? (act ? '<button class="upBtn alt" data-pact="off">Отозвать</button>' : '<button class="upBtn gold" data-pact="on">Призвать</button>')
            : '<button class="upBtn gold" data-pget' + (canGet ? '' : ' disabled') + '>Получить</button>') +
        '<button class="upBtn" data-pup' + (canUp ? '' : ' disabled') + '>' + (up ? 'Улучшить<span>' + M.shard.icon + ' ' + fmt(up) + '</span>' : lv ? 'Максимум' : 'Улучшить') + '</button>' +
        '<button class="upBtn alt" disabled>Эволюция<span>скоро</span></button></div>';
      const pas = p.boss ? '+' + Math.round(p.boss * 100) + '% урона по боссам' : p.vuln ? '+' + Math.round(p.vuln * 100) + '% урона по уязвимому боссу' : 'Бонусы артефактов действуют на питомца';
      h += '<div class="abil"><div class="ico">⚡</div><div><b><i>Активная</i>Удар</b><p>Раз в ' + p.interval + ' с бьёт на долю DPS отряда (' + Math.round(C.petShare(s, p.id) * 100) + '%) — ' + p.desc + '.</p></div></div>' +
           '<div class="abil pas"><div class="ico">✦</div><div><b><i>Пассивная</i>Аура</b><p>' + pas + '.</p></div></div>';
      h += '<div class="secT">Все питомцы · в бою один</div><div class="grid4">' + list.map(q => {
        const ql = C.petLevel(s, q.id);
        return '<button class="aCell' + (ql ? '' : ' lock') + '" data-psel="' + q.id + '" style="' + rvar(s.pets.active === q.id ? 'S' : q.id === petSel ? 'A' : 'B') + '">' +
          (ql ? '<span class="lv">Ур. ' + ql + '</span>' : '') + '<span class="ai">' + q.icon + '</span><span class="an">' + q.name + '</span>' +
          (!ql && C.petCanUnlock(s, q.id) ? '<i class="bang2" style="top:-4px;right:-4px">!</i>' : '') + '</button>';
      }).join('') + '</div><div class="secT" style="text-align:center">Новая система питомцев (27 шт., 3 формы) — после интерфейса</div>';
      return h;
    }

    $('sBody').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b || b.disabled) return;
      const d = b.dataset;
      if (d.ub) { click(); (d.ub === 'hero' ? el.buyTap : allyUi[d.ub].btn).click(); }
      else if (d.free) { openOld('portal'); return; }
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
      else if (d.pact) { click(); if (d.pact === 'on') C.setPet(s, petSel); else { s.pets.active = null; s.petAcc = 0; } save(); }
      else if (d.pup !== undefined) { click(); if (C.upgradePet(s, petSel)) save(); }
      else if (d.pget !== undefined) { click(); if (C.unlockPet(s, petSel)) { toast('Призванное существо!<small>' + C.petDef(petSel).icon + ' ' + C.petDef(petSel).name + '</small>'); save(); } }
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
    }
    ui2Refresh = refresh;
    refresh();
  })();
