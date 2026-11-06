  // ===================== 0.81: экран боя по макету 3 (docs/ui/BATTLE_HUD.md, детали — tools/hudcut.py → assets/hud) =====================
  (function () {
    const H = /*__HUD__*/{};
    if (!Object.keys(H).length) return;
    const u = n => 'url("' + H[n] + '")';
    const game = $('game');
    // рамка аватара поверх портрета, знак уровня — в шестиугольнике рамки
    const prof = $('tbProf');
    if (prof && !prof.querySelector('.hudAv')) prof.insertAdjacentHTML('beforeend', '<img class="hudAv" src="' + H.avatar + '" alt="">');
    // шкала ульты — по низу экрана, кристалл в центре
    const hu = $('heroUlt');
    if (hu) { game.appendChild(hu); hu.insertAdjacentHTML('beforeend', '<span class="hudUltF"></span><span class="hudUltC"></span>'); }
    // значок у имени врага: маска / череп босса
    const nr = $('nameRow');
    if (nr && !nr.querySelector('.hudIco')) nr.insertAdjacentHTML('afterbegin', '<span class="hudIco"></span>');
    const lv = $('tbLv');
    if (lv) { const fix = () => { const d = lv.textContent.replace(/\D+/g, ''); if (lv.textContent !== d) lv.textContent = d; }; new MutationObserver(fix).observe(lv, { childList: true, characterData: true, subtree: true }); fix(); }
    document.body.classList.add('hudV3');
    const css = document.createElement('style');
    css.textContent = `
      /* профиль */
      body.hudV3 #tbProf { width: 52px !important; height: 52px !important; left: 15px !important; top: calc(env(safe-area-inset-top) + 13px) !important; background: none !important; padding: 9px !important; overflow: visible !important; }
      body.hudV3 #tbProf::after, body.hudV3 #tbProf::before { display: none !important; }
      body.hudV3 #tbProf > *:not(img):not(#tbLv) { display: none !important; }
      body.hudV3 #tbProf img:not(.hudAv) { border-radius: 50%; border: none !important; }
      body.hudV3 #tbProf .hudAv { position: absolute; left: -11px; top: -13px; width: 74px; height: 72px; pointer-events: none; z-index: 2; }
      body.hudV3 #tbLv { z-index: 3; left: 50% !important; top: auto !important; bottom: -7px !important; transform: translateX(-50%); width: 20px !important; height: 15px !important;
        background: none !important; border: none !important; box-shadow: none !important; display: flex; align-items: center; justify-content: center; font: 900 10px system-ui !important; color: #ffe8a8 !important; text-shadow: 0 1px 2px #000; }
      body.hudV3 #tbWho { left: 3px !important; top: calc(env(safe-area-inset-top) + 72px) !important; width: 78px !important; height: 21px; background: ${u('pl_name')} center / 100% 100% no-repeat; text-align: center; padding-top: 4px; box-sizing: border-box; }
      body.hudV3 #tbWho b { font: 700 10.5px system-ui !important; }
      body.hudV3 #tbWho small { display: none; }
      /* этаж и волны */
      body.hudV3 #floorRow { width: 118px !important; height: 37px !important; background: ${u('pl_floor')} center / 100% 100% no-repeat !important; border: none !important; box-shadow: none !important; clip-path: none !important; display: flex; align-items: center; justify-content: center; padding: 6px 0 0 !important; margin-top: -4px; }
      body.hudV3 #floorRow::before, body.hudV3 #floorRow::after { display: none !important; }
      body.hudV3 #floorLabel { font: 800 14px Georgia, 'Times New Roman', serif !important; color: #fff !important; text-shadow: 0 0 8px #b14dff, 0 2px 0 #000 !important; letter-spacing: .5px; }
      body.hudV3 #waveLbl { display: none !important; }
      body.hudV3 #dots { gap: 2px !important; margin-top: 2px; }
      body.hudV3 .dot { width: 9.5px !important; height: 11px !important; background: ${u('wave_empty')} center / contain no-repeat !important; border: none !important; box-shadow: none !important; transform: none !important; border-radius: 0 !important; }
      body.hudV3 .dot.done, body.hudV3 .dot.cur { background-image: ${u('wave_on')} !important; }
      body.hudV3 .dot.cur { filter: drop-shadow(0 0 4px #e3b6ff) brightness(1.25); }
      body.hudV3 .dot.boss { width: 13px !important; height: 15px !important; background-image: ${u('wave_boss')} !important; }
      /* имя врага */
      body.hudV3 #nameRow { width: 150px; height: 34px; background: ${u('pl_enemy')} center / 100% 100% no-repeat; margin-top: 2px !important; padding-left: 34px; box-sizing: border-box; }
      body.hudV3 #nameRow .hudIco { position: absolute; left: 16px; top: 50%; width: 23px; height: 23px; z-index: 1; transform: translateY(-50%); background: ${u('ic_mask')} center / contain no-repeat; }
      body.hudV3 #nameRow.boss .hudIco { background-image: ${u('ic_skull')}; }
      body.hudV3 #nameRow .bIco { display: none !important; }
      body.hudV3 #enemyName { background: none !important; border: none !important; box-shadow: none !important; clip-path: none !important; font: 700 11.5px Georgia, 'Times New Roman', serif !important; color: #fff !important; text-transform: none !important; letter-spacing: 0 !important; padding: 0 8px !important; width: auto !important; min-width: 0 !important; }
      body.hudV3 #enemyName::before, body.hudV3 #enemyName::after { display: none !important; }
      /* полоса здоровья: тёмная подложка → заливка → рамка сверху */
      body.hudV3 #hpRow { margin-top: 2px !important; background: none !important; border: none !important; box-shadow: none !important; width: auto !important; }
      body.hudV3 #hpBar { width: 196px !important; height: 38px !important; background: none !important; border: none !important; box-shadow: none !important; border-radius: 0 !important; overflow: visible !important; clip-path: none !important; }
      body.hudV3 #hpBar::before { content: "" !important; display: block !important; position: absolute; left: 6% !important; right: 6% !important; top: 34% !important; bottom: 42% !important; width: auto !important; height: auto !important; margin: 0 !important; transform: none !important; border: none !important; background: #1a0610 !important; z-index: 0; }
      body.hudV3 #hpBar::after { content: ""; position: absolute; inset: 0 !important; width: auto !important; height: auto !important; margin: 0 !important; transform: none !important; border: none !important; top: 0 !important; bottom: 0 !important; left: 0 !important; right: 0 !important; background: ${u('hp_frame')} center / 100% 100% no-repeat; pointer-events: none; z-index: 3; }
      body.hudV3 #hpFill, body.hudV3 #hpTrail { position: absolute !important; top: 34% !important; bottom: 42% !important; height: auto !important; left: 6% !important; transform: scaleX(.88); transform-origin: 0 50%; border-radius: 0 !important; z-index: 1; }
      body.hudV3 #hpFill { background: ${u('fill_hp')} left center / 172px 100% no-repeat !important; box-shadow: none !important; }
      body.hudV3 #hpTrail { background: #ffd8d8aa !important; }
      body.hudV3 #hpText { z-index: 4; top: 0 !important; bottom: 0 !important; display: flex; align-items: center; justify-content: center; font: 800 9.5px system-ui !important; color: #fff !important; text-shadow: 0 1px 2px #000, 0 0 3px #000 !important; }
      /* валюты справа */
      body.hudV3 #topBar .tb { position: relative !important; width: 96px !important; height: 29px !important; background: ${u('cur_plate')} center / 100% 100% no-repeat !important; padding-left: 31px !important; padding-right: 22px !important; box-sizing: border-box; }
      body.hudV3 #topBar .tbR { right: 4px !important; width: 96px !important; gap: 2px; }
      body.hudV3 #topBar .tb i, body.hudV3 #topBar .tb i[data-ua] { position: absolute !important; left: 3px !important; top: 50% !important; transform: translateY(-50%); width: 24px !important; height: 24px !important; background: ${u('ic_coin')} center / contain no-repeat !important; }
      body.hudV3 #topBar .tb:not(.g) i, body.hudV3 #topBar .tb:not(.g) i[data-ua] { background-image: ${u('ic_dps')} !important; }
      body.hudV3 #topBar .tb i img { display: none !important; }
      body.hudV3 #topBar .tb b { font: 800 11px system-ui !important; color: #fff !important; text-align: center; width: 100%; }
      /* кнопки ⚔ и ⚙ */
      body.hudV3 #cbMenu, body.hudV3 #cbSet { background: ${u('btn_sq')} center / 100% 100% no-repeat !important; }
      body.hudV3 #cbMenu img.uiA, body.hudV3 #cbSet img.uiA { display: none !important; }
      body.hudV3 #cbMenu::after, body.hudV3 #cbSet::after { content: ""; position: absolute; inset: 14%; background: ${u('ic_menu')} center / contain no-repeat; pointer-events: none; filter: drop-shadow(0 0 4px #b14dff); }
      body.hudV3 #cbSet::after { background-image: ${u('ic_gear')}; }
      body.hudV3 #cbMenu, body.hudV3 #cbSet { width: 52px !important; height: 52px !important; }
      body.hudV3 #cbMenu { left: 10px !important; } body.hudV3 #cbSet { right: 10px !important; }
      /* «Бей босса» — под полосой здоровья, не на ней */
      body.hudV3 #farmBar { top: calc(env(safe-area-inset-top) + 138px) !important; }
      body.hudV3 #farmBar .plate { display: none; }
      body.hudV3 #cbMenu:active, body.hudV3 #cbSet:active { transform: scale(.92); }
      /* шкала ульты по низу экрана */
      body.hudV3 #heroUlt { position: absolute !important; left: 50% !important; bottom: calc(env(safe-area-inset-bottom) + 6px) !important; top: auto !important; width: min(80%, 320px) !important; height: 40px !important; margin: 0 !important; transform: translateX(-50%);
        background: ${u('ult_frame')} center / 100% 100% no-repeat !important; border: none !important; box-shadow: none !important; z-index: 6; overflow: visible !important; }
      body.hudV3 #heroUlt::before { content: ""; position: absolute; left: 11%; right: 11%; top: 41%; bottom: 37%; background: #12081c; box-shadow: inset 0 0 6px #000; }
      body.hudV3 #heroUlt i { left: 11% !important; right: auto; top: 41% !important; bottom: 37% !important; transform: scaleX(.78); transform-origin: 0 50%; background: ${u('fill_ult')} left center / 100% 100% no-repeat !important; box-shadow: none !important; border-radius: 3px; }
      body.hudV3 #heroUlt .hudUltC { position: absolute; left: 50%; top: 50%; width: 33px; height: 42px; transform: translate(-50%, -50%); background: ${u('ic_ult')} center / contain no-repeat; filter: grayscale(.6) brightness(.7); transition: filter .3s; }
      body.hudV3 #heroUlt.full .hudUltC, body.hudV3 #heroUlt.active .hudUltC { filter: drop-shadow(0 0 10px #d07aff); animation: hudUlt 1s ease-in-out infinite; }
      @keyframes hudUlt { 50% { transform: translate(-50%, -50%) scale(1.12); } }
      body.hudV3 #heroUlt b { position: absolute; left: 0; right: 0; top: -14px; text-align: center; font: 700 10px system-ui; color: #d8c8f0; text-shadow: 0 1px 2px #000; }
      body.hudV3 #heroUlt .ring3 { display: none; }
      body.clean.hudV3 #hero { bottom: calc(env(safe-area-inset-bottom) + 54px) !important; }
    `;
    document.head.appendChild(css);
    // значок босса у имени
    setInterval(() => { if (nr) nr.classList.toggle('boss', !!s.enemy.isBoss); }, 400);
  })();
