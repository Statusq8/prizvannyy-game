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
    // 0.82: «слишком загромождено — мы за визуал и комфорт» + референс Крушителей: центр свободен,
    // валюты — тонкой полосой сверху, кнопки — по углам, имя и HP врага — внизу над героем
    const tapBox = document.createElement('div'); tapBox.className = 'tb tap'; tapBox.innerHTML = '<i></i><b id="tbTap">0</b>';
    const tbr = document.querySelector('#topBar .tbR'); if (tbr) tbr.insertBefore(tapBox, tbr.children[1] || null);
    setInterval(() => { const e = $('tbTap'); if (e) e.textContent = fmt(C.tapHit(s)); }, 500);
    const css = document.createElement('style');
    css.textContent = `
      /* полоса валют во всю ширину */
      body.hudV3 #topBar .tbR { position: absolute !important; left: 0 !important; right: 0 !important; top: 0 !important; width: auto !important; display: flex !important; flex-direction: row !important; justify-content: space-between; gap: 6px !important;
        padding: calc(env(safe-area-inset-top) + 6px) 8px 0 !important; pointer-events: none; }
      body.hudV3 #topBar .tb { position: relative !important; flex: 1; width: auto !important; height: 26px !important; background: linear-gradient(90deg, #0a060ec0, #0a060e80) !important; border: none !important; box-shadow: none !important; border-radius: 6px !important;
        padding: 0 8px 0 30px !important; display: flex; align-items: center; justify-content: flex-end; box-sizing: border-box; }
      body.hudV3 #topBar .tb i, body.hudV3 #topBar .tb i[data-ua] { position: absolute !important; left: 2px !important; top: 50% !important; transform: translateY(-50%); width: 24px !important; height: 24px !important; background: ${u('ic_coin')} center / contain no-repeat !important; border: none !important; box-shadow: none !important; }
      body.hudV3 #topBar .tb:not(.g):not(.tap) i, body.hudV3 #topBar .tb:not(.g):not(.tap) i[data-ua] { background-image: ${u('ic_dps')} !important; }
      body.hudV3 #topBar .tb.tap i { background: none !important; font-style: normal; font-size: 17px; line-height: 24px; text-align: center; }
      body.hudV3 #topBar .tb.tap i::before { content: "✊"; }
      body.hudV3 #topBar .tb.g { order: 3; } body.hudV3 #topBar .tb.tap { order: 2; } body.hudV3 #topBar .tb:not(.g):not(.tap) { order: 1; }
      body.hudV3 #topBar .tb i img { display: none !important; }
      body.hudV3 #topBar .tb b { font: 800 14px system-ui !important; color: #ffe2a0 !important; text-shadow: 0 1px 2px #000 !important; width: auto !important; }
      body.hudV3 #tbBuffs, body.hudV3 #tbMail { display: none !important; }
      /* углы: профиль ↖, настройки ↗, прокачка ↙ */
      body.hudV3 #tbProf { width: 58px !important; height: 64px !important; left: 8px !important; top: calc(env(safe-area-inset-top) + 40px) !important; background: ${u('btn_sq')} center / 100% 100% no-repeat !important; padding: 8px 7px 9px !important; border-radius: 0 !important; overflow: visible !important; box-sizing: border-box; }
      body.hudV3 #tbProf::after, body.hudV3 #tbProf::before { display: none !important; }
      body.hudV3 #tbProf > *:not(img):not(#tbLv) { display: none !important; }
      body.hudV3 #tbProf .hudAv { display: none; }
      body.hudV3 #tbProf img:not(.hudAv) { width: 100%; height: 100%; object-fit: cover; border-radius: 4px; border: none !important; }
      body.hudV3 #tbLv { z-index: 3; left: 50% !important; top: auto !important; bottom: -9px !important; transform: translateX(-50%); min-width: 22px; height: 16px !important; width: auto !important; padding: 0 4px; box-sizing: border-box;
        background: #12081c !important; border: 1px solid #d6a640 !important; border-radius: 8px !important; box-shadow: none !important; display: flex; align-items: center; justify-content: center; font: 900 10px system-ui !important; color: #ffe8a8 !important; }
      body.hudV3 #tbWho { display: none !important; }
      body.hudV3 #cbMenu, body.hudV3 #cbSet { width: 58px !important; height: 64px !important; background: ${u('btn_sq')} center / 100% 100% no-repeat !important; }
      body.hudV3 #cbSet { right: 8px !important; left: auto !important; top: calc(env(safe-area-inset-top) + 40px) !important; }
      body.hudV3 #cbMenu { left: 8px !important; right: auto !important; top: auto !important; bottom: calc(env(safe-area-inset-bottom) + 10px) !important; }
      body.hudV3 #cbMenu img.uiA, body.hudV3 #cbSet img.uiA { display: none !important; }
      body.hudV3 #cbMenu::after, body.hudV3 #cbSet::after { content: ""; position: absolute; inset: 16%; background: ${u('ic_menu')} center / contain no-repeat; pointer-events: none; filter: drop-shadow(0 0 4px #b14dff); }
      body.hudV3 #cbSet::after { background-image: ${u('ic_gear')}; }
      body.hudV3 #cbMenu:active, body.hudV3 #cbSet:active, body.hudV3 #tbProf:active { transform: scale(.92); }
      /* этаж и волна — две маленькие плашки по центру сверху */
      body.hudV3 #hud { position: absolute !important; inset: 0 !important; padding: 0 !important; display: block !important; pointer-events: none; }
      body.hudV3 #floorRow { position: absolute !important; left: 50% !important; transform: translateX(-50%); top: calc(env(safe-area-inset-top) + 42px) !important; width: auto !important; height: 26px !important; padding: 0 16px !important; margin: 0 !important;
        background: #0a060eb0 !important; border: none !important; border-radius: 6px !important; box-shadow: none !important; clip-path: none !important; display: flex; align-items: center; }
      body.hudV3 #floorRow::before, body.hudV3 #floorRow::after { display: none !important; }
      body.hudV3 #floorLabel { font: 800 15px system-ui !important; color: #ffe2a0 !important; text-shadow: 0 1px 2px #000 !important; letter-spacing: 0; }
      body.hudV3 #dots { display: none !important; }
      body.hudV3 #waveLbl { display: flex !important; position: absolute !important; left: 50% !important; transform: translateX(-50%); top: calc(env(safe-area-inset-top) + 72px) !important; height: 24px; padding: 0 14px 0 34px; margin: 0 !important; align-items: center;
        background: #0a060eb0 ${u('ic_skull')} 8px center / 20px 20px no-repeat !important; border-radius: 6px; font: 800 14px system-ui !important; color: #fff !important; text-shadow: 0 1px 2px #000; white-space: nowrap; }
      /* имя и HP врага — внизу, над героем */
      body.hudV3 #nameRow { position: absolute !important; left: 50% !important; transform: translateX(-50%); bottom: calc(env(safe-area-inset-bottom) + 50px) !important; top: auto !important; width: auto !important; height: auto !important; background: none !important; padding: 0 !important; margin: 0 !important; }
      body.hudV3 #nameRow .hudIco, body.hudV3 #nameRow .bIco { display: none !important; }
      body.hudV3 #enemyName { background: none !important; border: none !important; box-shadow: none !important; clip-path: none !important; font: 800 19px Georgia, 'Times New Roman', serif !important; color: #f3dcb0 !important; text-transform: none !important; letter-spacing: .3px !important;
        text-shadow: 0 2px 0 #2a1408, 0 0 8px #000, 0 0 2px #000 !important; padding: 0 !important; width: auto !important; white-space: nowrap; }
      body.hudV3 #enemyName::before, body.hudV3 #enemyName::after { display: none !important; }
      body.hudV3 #nameRow.boss #enemyName { color: #ff9a8a !important; }
      body.hudV3 #nameRow .bossRing { right: -40px !important; }
      body.hudV3 #hpRow { position: absolute !important; left: 50% !important; transform: translateX(-50%); bottom: calc(env(safe-area-inset-bottom) + 8px) !important; top: auto !important; margin: 0 !important; background: none !important; border: none !important; box-shadow: none !important; width: auto !important; }
      body.hudV3 #hpBar { width: 196px !important; height: 47px !important; background: none !important; border: none !important; box-shadow: none !important; border-radius: 0 !important; overflow: visible !important; clip-path: none !important; }
      body.hudV3 #hpBar::before { content: "" !important; display: block !important; position: absolute; left: 6% !important; right: 6% !important; top: 34% !important; bottom: 42% !important; width: auto !important; height: auto !important; margin: 0 !important; transform: none !important; border: none !important; background: #1a0610 !important; z-index: 0; }
      body.hudV3 #hpBar::after { content: ""; position: absolute; inset: 0 !important; width: auto !important; height: auto !important; margin: 0 !important; transform: none !important; border: none !important; top: 0 !important; bottom: 0 !important; left: 0 !important; right: 0 !important; background: ${u('hp_frame')} center / 100% 100% no-repeat; pointer-events: none; z-index: 3; }
      body.hudV3 #hpFill, body.hudV3 #hpTrail { position: absolute !important; top: 34% !important; bottom: 42% !important; height: auto !important; left: 6% !important; transform: scaleX(.88); transform-origin: 0 50%; border-radius: 0 !important; z-index: 1; }
      body.hudV3 #hpFill { background: ${u('fill_hp')} left center / 173px 100% no-repeat !important; box-shadow: none !important; }
      body.hudV3 #hpTrail { background: #ffd8d8aa !important; }
      body.hudV3 #hpText { z-index: 4; top: 26% !important; bottom: 34% !important; display: flex; align-items: center; justify-content: center; font: 800 11px system-ui !important; color: #fff !important; text-shadow: 0 1px 2px #000, 0 0 3px #000 !important; }
      body.hudV3 #hud.mega #hpBar { border: none !important; box-shadow: none !important; }
      /* ульта — кристалл ↘ (в углу, как кнопка), заполняется снизу вверх */
      body.hudV3 #heroUlt { position: absolute !important; left: auto !important; right: 8px !important; bottom: calc(env(safe-area-inset-bottom) + 10px) !important; top: auto !important; width: 58px !important; height: 64px !important; margin: 0 !important; transform: none;
        background: ${u('btn_sq')} center / 100% 100% no-repeat !important; border: none !important; box-shadow: none !important; z-index: 6; overflow: visible !important; }
      body.hudV3 #heroUlt::before { display: none; }
      body.hudV3 #heroUlt i { display: none !important; }
      body.hudV3 #heroUlt .hudUltF { position: absolute; left: 50%; top: 50%; width: 36px; height: 44px; transform: translate(-50%, -50%); background: ${u('ic_ult')} center / contain no-repeat; filter: grayscale(1) brightness(.45); }
      body.hudV3 #heroUlt .hudUltC { position: absolute; left: 50%; top: 50%; width: 36px; height: 44px; transform: translate(-50%, -50%); background: ${u('ic_ult')} center / contain no-repeat; clip-path: inset(calc(100% - var(--uc, 0%)) 0 0 0); }
      body.hudV3 #heroUlt.full .hudUltC, body.hudV3 #heroUlt.active .hudUltC { filter: drop-shadow(0 0 10px #d07aff); animation: hudUlt 1s ease-in-out infinite; }
      @keyframes hudUlt { 50% { transform: translate(-50%, -50%) scale(1.12); } }
      body.hudV3 #heroUlt b { display: none; position: absolute; left: -30px; right: -30px; top: -15px; text-align: center; font: 700 10px system-ui; color: #d8c8f0; text-shadow: 0 1px 2px #000; white-space: nowrap; }
      body.hudV3 #heroUlt .ring3 { display: none; }
      /* герой — над именем врага; враг — выше по центру */
      body.clean.hudV3 #hero { bottom: calc(env(safe-area-inset-bottom) + 84px) !important; height: min(25%, 170px) !important; }
      body.hudV3 #farmBar { top: calc(env(safe-area-inset-top) + 102px) !important; }
      body.hudV3 #farmBar .plate { display: none; }
    `;
    document.head.appendChild(css);
    // значок босса у имени; заряд ульты → высота заливки кристалла
    setInterval(() => { const h = $('heroUlt'); if (!h) return; const w = parseFloat((h.querySelector('i') || {}).style ? h.querySelector('i').style.width : 0) || 0; h.style.setProperty('--uc', w + '%'); }, 150);
    setInterval(() => { if (nr) nr.classList.toggle('boss', !!s.enemy.isBoss); }, 400);
  })();
