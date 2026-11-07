  // ===================== 0.74: лесенка открытий, книга, регрессию, кузница, квест справа (опрос docs/ui/ANSWERS_UNLOCKS.md) =====================
  (function () {
    const U = window.U2, sys = window.U3.sys, UA = window.UI_ART || {};
    const on = k => C.unlockedAt(s, k), best = () => Math.max(s.bestFloor | 0, s.maxFloor | 0);
    const img = n => UA[n] ? '<img class="uiA" src="' + UA[n] + '" alt="">' : '';
    const mk = (tag, id, cls, html, parent) => { const n = document.createElement(tag); if (id) n.id = id; if (cls) n.className = cls; if (html != null) n.innerHTML = html; if (parent) parent.appendChild(n); return n; };
    const host = $('cbMenu').parentNode;
    // ---------- мечи → сразу «Прокачка» (вкладки сверху, ответ 32) ----------
    const om = $('cbMenu'), menuBtn = om.cloneNode(true); om.replaceWith(menuBtn);
    menuBtn.addEventListener('click', e => { e.stopPropagation(); U.press(menuBtn); U.sec('up'); });
    // ---------- маленькие кнопки: книга (слева), регрессию и кузница (слева), портал (справа) ----------
    function sm(id, ico, art, label) {
      const b = mk('button', id, 'cBtn sm cbA', img(art) || '<span class="ico">' + ico + '</span>', host); b.setAttribute('aria-label', label); b.dataset.ua = 1; return b;
    }
    const book = sm('cbBook', '📕', 'st_book', 'Книга: задания, почта, события, магазин, дневник');
    const rit = sm('cbRitual', '👻', 'md_ritual', 'Регрессия');
    const forge = sm('cbForge', '⚒', 'fg_anvil', 'Кузница');
    const list = mk('div', 'bookList', '', '', host);
    const BOOK = [['quests', 'ic_quests', 'Задания', 'quests'], ['inbox', 'q_gift', 'Почта', null], ['events', 'q_event', 'События', 'events'], ['season', 'pr_medal', 'Сезон', 'season'], ['@shop', 'sh_cart', 'Магазин', 'shop'], ['diary', 'st_book', 'Дневник', null]];
    function renderBook() {
      list.innerHTML = BOOK.filter(x => !x[3] || on(x[3])).map(([k, a, n]) => '<button data-bk="' + k + '">' + img(a) + '<span>' + n + '</span></button>').join('');
    }
    book.addEventListener('click', e => { e.stopPropagation(); U.press(book); renderBook(); list.classList.toggle('show'); });
    list.addEventListener('click', e => { const b = e.target.closest('[data-bk]'); if (!b) return; e.stopPropagation(); list.classList.remove('show'); U.click(); U.home();
      if (b.dataset.bk === '@shop') window.U3.menuAct('shop'); else U.openOld(b.dataset.bk); });
    document.addEventListener('pointerdown', e => { if (!e.target.closest('#bookList, #cbBook')) list.classList.remove('show'); }, true);
    rit.addEventListener('click', e => { e.stopPropagation(); U.press(rit); U.home(); U.openX('souls'); });
    forge.addEventListener('click', e => { e.stopPropagation(); U.press(forge);
      const F = [['runes', 'runes', 'fg_anvil', 'Руны'], ['altar', 'altar', 'md_altar', 'Алтарь'], ['altar', 'alchemy', 'potion_red', 'Алхимия'], ['bones', 'bones', 'ac_armor', 'Кости']].filter(x => on(x[1]));
      sys({ title: 'КУЗНИЦА', html: '<div class="rowList">' + F.map(([t, k, a, n]) => '<button data-fg="' + t + '"><span style="display:flex;align-items:center;gap:8px"><i style="width:36px;height:36px;display:inline-block">' + img(a) + '</i>' + n + '</span><b>›</b></button>').join('') + '</div>',
        btns: [{ t: 'Закрыть' }], onShow: w => w.querySelector('.rowList').addEventListener('click', ev => { const b = ev.target.closest('[data-fg]'); if (!b) return; $('sysOv').classList.remove('show'); U.home(); U.openOld(b.dataset.fg); }) }); });
    // ---------- «?» в разделах (ответ 52) ----------
    const HELP = { up: 'Прокачка: золотом повышайте уровень главного героя и союзников. Каждые несколько уровней — веха ×3 урона. Ранг (потолок уровня) — за осколки Башни. Звёзды — слиянием копий героя и «корма».',
      art: 'Артефакты: вечные бонусы, переживают регрессию. Покупаются и улучшаются душами. Первый артефакт — за мега-босса 50 этажа.',
      bag: 'Сумка: все предметы. Нажмите на предмет — описание, «Использовать», «Продать», «Где добыть». Кости можно продавать пачкой.',
      pets: 'Питомцы: сильно усиливают урон (×5 и больше с эволюцией). Уровень — за золото, эволюция — за фрагменты из Теневой башни.' };
    const qBtn = mk('button', 'secHelp', 'iBtn', '?'); $('sTitle').parentNode.appendChild(qBtn);
    qBtn.addEventListener('click', () => { const t = document.querySelector('#sTabs button.on'); const k = t ? t.dataset.st : 'up'; sys({ title: 'СПРАВКА', text: HELP[k] || '' }); });
    // ---------- видимость кнопок по лесенке (ответы 1–19, до открытия — скрыта) ----------
    function gate() {
      const vis = (el, k) => { if (el) el.style.display = on(k) ? '' : 'none'; };
      vis($('cbPortal'), 'portal'); vis($('cbPve'), 'pve'); vis(rit, 'ritual'); vis(forge, 'forge');
      book.style.display = on('quests') ? '' : 'none';
      vis($('tbMail'), 'mail'); vis($('cbMap'), 'map'); vis($('shadowTw'), 'pets');   // 0.153: «Теневая башня» = Логово питомцев — часть питомцев vis($('questPanel'), 'quests');
      menuBtn.style.display = s.stats.kills >= 1 ? '' : 'none';   // ответ 7: «Улучшить» — после первого врага
    }
    // ---------- квест справа: задача с наградой + следующая функция (ответы 35–38) ----------
    const QK = 'prizvannyy_story';
    let st = { i: 0, fold: true }; try { Object.assign(st, JSON.parse(localStorage.getItem(QK) || '{}')); } catch (e) {}
    if (st.fv !== 1) { st.fv = 1; st.fold = true; }   // 0.130: по умолчанию свиток свёрнут (решение пользователя)
    const saveQ = () => { try { localStorage.setItem(QK, JSON.stringify(st)); } catch (e) {} };
    const hired = id => s.allies[id] && s.allies[id].level > 0;
    const STARTERS = CFG.allies.filter(a => a.starter).map(a => a.id);
    const unlockedHeroes = () => CFG.allies.filter(a => s.heroes[a.id].unlocked).length;
    const STORY = [
      { t: 'Найми первого союзника', p: () => [STARTERS.some(hired) ? 1 : 0, 1], ok: () => STARTERS.some(hired), r: { tickets: 1 }, go: 'up' },
      { t: 'Подними главного героя до 10 ур.', p: () => [s.tapLevel, 10], ok: () => s.tapLevel >= 10, r: { tickets: 1 }, go: 'up' },
      { t: 'Дойди до 5 этажа', p: () => [best(), 5], ok: () => best() >= 5, r: { tickets: 1 }, go: 'battle' },
      { t: 'Найми всех четырёх союзников', p: () => [STARTERS.filter(hired).length, STARTERS.length], ok: () => STARTERS.every(hired), r: { crystals: 10 }, go: 'up' },
      { t: 'Победи первого стража (10 этаж)', p: () => [best(), 11], ok: () => best() >= 11, r: { tickets: 2 }, go: 'battle' },
      { t: 'Дойди до 25 этажа', p: () => [best(), 25], ok: () => best() >= 25, r: { tickets: 5 }, go: 'battle' },
      { t: 'Призови героя в портале', p: () => [unlockedHeroes() > STARTERS.length ? 1 : 0, 1], ok: () => unlockedHeroes() > STARTERS.length, r: { tickets: 3 }, go: 'portal' },
      { t: 'Победи мега-босса (50 этаж)', p: () => [best(), 51], ok: () => best() >= 51, r: { tickets: 5 }, go: 'battle' },
      { t: 'Улучши артефакт', p: () => [CFG.artifacts.some(a => C.artLevel(s, a.id) >= 2) ? 1 : 0, 1], ok: () => CFG.artifacts.some(a => C.artLevel(s, a.id) >= 2), r: { tickets: 3 }, go: 'art' },
      { t: 'Дойди до 100 этажа', p: () => [best(), 100], ok: () => best() >= 100, r: { tickets: 10 }, go: 'battle' },
      { t: 'Дойди до 150 этажа', p: () => [best(), 150], ok: () => best() >= 150, r: { tickets: 10, crystals: 20 }, go: 'battle' },
      { t: 'Проведи первую регрессию', p: () => [Math.min(1, s.rituals), 1], ok: () => s.rituals > 0, r: { tickets: 15, crystals: 30 }, go: 'ritual' },
    ];
    const NAMES = { ult: 'ульта героя', quests: 'задания', login: 'награда за вход', portal: 'портал призыва', shop: 'магазин', artifacts: 'артефакты', pve: 'PvE', runes: 'руны', forge: 'кузница',
      ritual: 'регрессия', tree: 'дерево навыков', events: 'события', season: 'сезон', altar: 'алтарь', alchemy: 'алхимия', echo: 'Эхо Башни', curse: 'проклятые этажи', secret: 'скрытые комнаты', totems: 'тотемы', pets: 'питомцы', shadow: 'Теневая башня', bones: 'кости монстров' };
    function nextUnlock() {
      const b = best(); let f = Infinity; for (const k in CFG.unlocks) if (CFG.unlocks[k] > b) f = Math.min(f, CFG.unlocks[k]);
      if (f === Infinity) return null;
      const names = []; for (const k in CFG.unlocks) if (CFG.unlocks[k] === f) names.push(NAMES[k] || k);
      return { f, names: [...new Set(names)] };
    }
    const rTxt = r => r.gold ? '◆ ' + fmt(r.gold) : r.tickets ? '🎟 ' + r.tickets + (r.crystals ? ' · 💎 ' + r.crystals : '') : r.crystals ? '💎 ' + r.crystals : r.shard ? CFG.materials.shard.icon + ' ' + r.shard : '';
    const qp = mk('div', 'questPanel', '', '', host);
    let qHtml = '';
    function renderQuest() {
      const q = STORY[st.i], nu = nextUnlock();
      let h;
      if (st.fold) h = '<button class="qFold" data-q="unfold">' + img('scroll_quest') + (q && q.ok() ? '<i class="qDot"></i>' : '') + '</button>';
      else {
        h = '<div class="qBox"><button class="qMin" data-q="fold" aria-label="Свернуть">–</button>';
        if (q) { const done = q.ok(); h += '<div class="qT" data-q="go">КВЕСТ</div><div class="qTxt" data-q="go">' + q.t + '</div>' + (q.p ? (() => { const [a, b] = q.p(), v = Math.min(a, b); return '<div class="qBar"><i style="width:' + (v / b * 100).toFixed(1) + '%"></i><span>' + v + '/' + b + '</span></div>'; })() : '') + '<div class="qR">' + (done ? '<button class="qClaim" data-q="claim">Забрать ' + rTxt(q.r) + '</button>' : 'Награда: ' + rTxt(q.r)) + '</div>'; }
        if (nu) h += '<div class="qNext">' + nu.f + ' этаж: ' + nu.names.join(', ') + '</div>';
        h += '</div>';
      }
      if (h !== qHtml) { qp.innerHTML = h; qHtml = h; }
    }
    qp.addEventListener('click', e => {
      const b = e.target.closest('[data-q]'); if (!b) return; e.stopPropagation(); U.click();
      const k = b.dataset.q, q = STORY[st.i];
      if (k === 'fold') st.fold = true; else if (k === 'unfold') st.fold = false;
      else if (k === 'claim' && q && q.ok()) {
        if (q.r.gold) s.gold = B.add(s.gold, q.r.gold); if (q.r.tickets) s.tickets += q.r.tickets; if (q.r.crystals) s.crystals = (s.crystals | 0) + q.r.crystals; if (q.r.shard) s.materials.shard += q.r.shard;
        toast('Квест выполнен<small>' + rTxt(q.r) + '</small>'); st.i++; st.fold = true; save(); render();
      } else if (k === 'go' && q) {
        U.home();
        if (q.go === 'up' || q.go === 'art') U.sec(q.go); else if (q.go === 'portal') U.openX('portal'); else if (q.go === 'ritual') U.openX(window.RG_ART ? 'regress' : 'souls'); else U.show(null);
      }
      saveQ(); qHtml = ''; renderQuest();
    });
    setInterval(() => { gate(); renderQuest(); }, 500); gate(); renderQuest();
  })();
