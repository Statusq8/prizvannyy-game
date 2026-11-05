  // ===================== 0.72: картинки оформления пользователя (assets/ui, нарезка tools/uicut.py) =====================
  // Подменяет значки-эмодзи на арт: кнопки экрана боя, меню, вкладки, валюты, значки редкости. Работает и после перерисовок.
  (function () {
    const UI = /*__UI_ART__*/{};
    if (!Object.keys(UI).length) return;
    window.UI_ART = UI;
    const img = (n, cls) => UI[n] ? '<img class="uiA' + (cls ? ' ' + cls : '') + '" src="' + UI[n] + '" alt="" draggable="false">' : '';
    // эмодзи → картинка
    const EM = { '⚔': 'ic_battle', '💎': 'ic_art', '🎒': 'ic_bag', '🐉': 'ic_pets', '🌀': 'ic_portal', '🪖': 'ic_heroes', '📖': 'st_book', '👻': 'st_soul',
      '✴': 'fg_shrine', '🕯': 'md_altar', 'ᚦ': 'fg_anvil', '🦴': 'ac_armor', '📜': 'ic_quests', '📬': 'q_gift', '📅': 'q_login', '🎖': 'pr_medal', '🏮': 'q_event',
      '🛒': 'sh_cart', '👤': 'pr_person', '⚙': 'ic_settings', '📷': 'tl_grid', '💾': 'set_save', '◆': 'sh_coins', '🎟': 'ticket_purple', '✦': 'star_purple',
      '🔹': 'cry_purple', '🎭': 'pr_hero', '📊': 'pr_stats', '🗼': 'md_tower', '∞': 'md_endless', '👹': 'md_boss', '🧪': 'potion_red', '⚗': 'potion_red', '🫙': 'potion_blue',
      '🧰': 'chest_purple', '🔒': 'tl_lock', '★': 'q_star', '🏆': 'ach_trophy', '👑': 'ach_crown', '🎁': 'sh_gift', '🗝': 'key_gold', '🧩': 'hero_shard', '⚱': 'crystal' };
    const RAR = new Set(CFG.rarities);
    const SEL = '.mCard .ic, .mMore b, .pgTabs b, .cur > i, .pveCard .ic, .detBox .big, .soulBig .n, .iCell, .grpT';
    function swap(root) {
      root.querySelectorAll(SEL).forEach(e => {
        if (e.dataset.ua) return;
        if (e.classList.contains('iCell')) {
          if (e.classList.contains('empty')) { e.textContent = ''; e.dataset.ua = 1; return; }         // ячейки сумки: эмодзи перед числом
          const t = e.firstChild; if (t && t.nodeType === 3 && EM[t.textContent.trim()]) { const s = document.createElement('span'); s.innerHTML = img(EM[t.textContent.trim()], 'cellI'); e.replaceChild(s.firstChild, t); }
          e.dataset.ua = 1; return;
        }
        const t = e.textContent.trim(); const n = EM[t];
        if (n && UI[n]) { e.innerHTML = img(n); e.dataset.ua = 1; e.classList.add('hasUA'); }
      });
      root.querySelectorAll('.rk').forEach(e => { const t = e.textContent.trim(); if (RAR.has(t) && UI['rar_' + t] && !e.dataset.ua) { e.innerHTML = img('rar_' + t); e.dataset.ua = 1; e.classList.add('rkA'); } });
    }
    let pend = false;
    const mo = new MutationObserver(() => { if (pend) return; pend = true; requestAnimationFrame(() => { pend = false; swap(document.body); }); });
    mo.observe(document.body, { childList: true, subtree: true });
    swap(document.body);
    // кнопки экрана боя
    const CB = { cbMenu: 'ic_battle', cbSet: 'ic_settings', cbPve: 'ic_pve', cbMap: 'ic_map', cbPortal: 'ic_portal', cbEvent: 'q_event' };
    function corners() {
      for (const id in CB) { const b = $(id); if (!b || b.dataset.ua) continue; b.dataset.ua = 1; b.classList.add('cbA');
        b.querySelectorAll('svg, .ico, .fr, .gem').forEach(x => x.remove()); b.insertAdjacentHTML('afterbegin', img(CB[id])); }
      const m = $('tbMail'); if (m && !m.dataset.ua) { m.dataset.ua = 1; m.classList.add('cbA'); m.firstChild.textContent = ''; m.insertAdjacentHTML('afterbegin', img('q_gift')); }
      const tb = document.querySelectorAll('#topBar .tb i'); if (tb[0] && !tb[0].dataset.ua) { tb[0].innerHTML = img('sh_coins'); tb[0].dataset.ua = 1; }
      if (tb[1] && !tb[1].dataset.ua) { tb[1].innerHTML = img('st_atk'); tb[1].dataset.ua = 1; }
    }
    corners(); setInterval(corners, 1500);
    // рамки: страницы, плашки заголовков, кнопка «назад», окна Системы
    const css = document.createElement('style');
    const u = n => UI[n] ? 'url("' + UI[n] + '")' : 'none';
    css.textContent = `
      img.uiA { width: 100%; height: 100%; object-fit: contain; display: block; pointer-events: none; }
      .hasUA { background: none !important; border: none !important; box-shadow: none !important; }
      .mCard .ic.hasUA { width: 64px; height: 64px; }
      .mMore b.hasUA { width: 44px; height: 44px; margin: 2px auto 0; }
      .mMore button { font-size: 10px !important; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding-top: 6px; text-shadow: 0 1px 0 #000, 0 0 3px #000; }
      .pgTabs b.hasUA { width: 32px; height: 32px; filter: none; }
      .cur > i.hasUA, #topBar .tb i[data-ua] { background: none !important; border: none !important; box-shadow: none !important; }
      .rk.rkA { background: none !important; border: none !important; box-shadow: none !important; width: 40px; height: 30px; right: -12px; top: -12px; padding: 0; }
      .grpT.hasUA { display: none; }
      img.cellI { width: 78%; height: 78%; margin: auto; }
      .cBtn.cbA { background: none !important; }
      .cBtn.cbA img.uiA { position: absolute; inset: -4px; width: calc(100% + 8px); height: calc(100% + 8px); filter: drop-shadow(0 3px 4px #000c); transition: transform .08s; }
      .cBtn.cbA:active img.uiA, .cBtn.cbA.press img.uiA { transform: scale(.9); filter: drop-shadow(0 0 10px #b14dff) brightness(1.2); }
      #tbMail.cbA { background: none !important; border: none !important; box-shadow: none !important; width: 38px; height: 38px; top: calc(env(safe-area-inset-top) + 2px); }
      .backBtn { background: ${u('back_btn')} center / contain no-repeat !important; clip-path: none !important; color: transparent !important; width: 52px !important; height: 40px !important; }
      .titlePl { background: ${u('title_plate')} center / 100% 100% no-repeat !important; border: none !important; box-shadow: none !important; clip-path: none !important; height: 44px !important; line-height: 42px !important; }
      .pgTabs button { background: ${u('tab')} center / 100% 100% no-repeat !important; border: none !important; box-shadow: none !important; }
      .pgTabs button.on { background-image: ${u('tab_on')} !important; }
      .mCard { background: ${u('card_wide')} center / 100% 100% no-repeat !important; border: none !important; box-shadow: none !important; height: 92px !important; }
      .mMore button { background: ${u('cell')} center / 100% 100% no-repeat !important; border: none !important; height: 74px !important; }
      .iCell { background: ${u('cell')} center / 100% 100% no-repeat !important; border: none !important; }
      .iCell.empty { opacity: .45; }
      .aCell { background: ${u('cell')} center / 100% 100% no-repeat !important; border: none !important; }
      .pgTop .cur { background: ${u('cur_plate')} left center / 100% 100% no-repeat !important; border: none !important; box-shadow: none !important; padding-left: 4px !important; height: 32px !important; }
      #topBar .tb { background: ${u('cur_plate')} center / 100% 100% no-repeat !important; border: none !important; box-shadow: none !important; height: 34px; }
      #sysOv .sysWin { background: ${u('popup')} center / 100% 100% no-repeat, #05030a !important; border: none !important; padding: 26px 26px 24px !important; }
      .chip { background: ${u('fr_plate_1')} center / 100% 100% no-repeat !important; border: none !important; }
      .chip.on { background-image: ${u('fr_plate_3')} !important; color: #fff !important; }
    `;
    document.head.appendChild(css);
  })();
