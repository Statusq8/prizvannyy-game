  // ===================== 0.84: Штаб (прокачка героев) — пакет пользователя Upgrade_UI_Final_v3 (docs/ui/HQ.md, tools/hqprep.py → assets/hq) =====================
  (function () {
    const A = /*__HQ__*/{};
    if (!A.card) return;
    window.HQ_ART = A;
    const u = n => 'url("' + A[n] + '")';
    document.body.classList.add('hqV1');
    const css = document.createElement('style');
    css.textContent = `
      body.hqV1 #pgSec .tower { background: ${u('bg')} center / cover no-repeat !important; filter: brightness(.75); }
      body.hqV1 #pgSec .tower::before, body.hqV1 #pgSec .tower::after { display: none !important; }
      /* верх как в Крушителях (референс пользователя 6 ноября): валюты полосой, «назад» + вкладки, полоса материалов, «Герои» + ×1 справа */
      body.hqV1 #sTop { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 4px; padding: calc(env(safe-area-inset-top) + 4px) 4px 0 !important; min-height: 0 !important; }
      body.hqV1 #sTop .cur { position: relative; flex: 1; min-width: 0; height: 28px; padding: 0 8px 0 32px; border: none !important; border-radius: 4px; box-shadow: none !important; justify-content: flex-end;
        background: #0a060ecc !important; font: 800 17px system-ui; color: #ffb43a; text-shadow: 0 1px 2px #000; }
      body.hqV1 #sTop .cur i { position: absolute; left: 3px; top: 50%; transform: translateY(-50%); width: 26px; height: 26px; border: none !important; border-radius: 0; background: center / contain no-repeat !important; }
      body.hqV1 #sTop .cur.d i { background-image: url("${(window.HUD_ART || {}).ic_dps || ''}") !important; }
      body.hqV1 #sTop .cur.f i::before { content: "✊"; font-size: 19px; line-height: 26px; }
      body.hqV1 #sTop .cur.g i { background-image: url("${(window.HUD_ART || {}).ic_coin || ''}") !important; }
      body.hqV1 #sTop .cur .plus { display: none !important; }
      body.hqV1 .hqMat { display: none !important; }
      body.hqV1 .hqNav { display: none !important; }
      body.hqV1 .hqMatX { flex-basis: 100%; order: 9; display: flex; height: 22px; margin-top: 64px; background: #0a060ecc; border-radius: 3px; }
      body.hqV1 .hqMat span { flex: 1; display: flex; align-items: center; gap: 4px; padding: 0 8px; font: 700 13px system-ui; color: #fff; border-right: 1px solid #2a2232; }
      body.hqV1 .hqMat i { font-style: normal; }
      .hqNav { position: absolute; left: 6px; right: 6px; top: calc(env(safe-area-inset-top) + 42px); height: 60px; display: flex; gap: 6px; align-items: center; z-index: 5; overflow: visible; }
      body.hqV1 #pgSec .hqNav .backBtn { flex: none; width: 76px; height: 60px; clip-path: none; border: none !important; box-shadow: none !important; background: ${u('nav_back')} center / contain no-repeat !important; font-size: 0 !important; color: transparent !important; }
      body.hqV1 #sTabs { flex: 1; display: flex !important; gap: 4px; padding: 0 !important; overflow: visible !important; height: 60px; }
      body.hqV1 #sTabs button { position: relative; flex: 0 0 62px !important; height: 58px !important; border-radius: 6px; border: 2px solid #5a5468 !important; box-shadow: 0 0 0 2px #0a060e, inset 0 0 12px #000 !important;
        background: linear-gradient(#3a3446, #1c1824) !important; overflow: visible; }
      body.hqV1 #sTabs button.on { border-color: #e0b04a !important; box-shadow: 0 0 0 2px #0a060e, 0 0 12px #d6a64099, inset 0 0 14px #7a3aff66 !important; background: linear-gradient(#5a2a8a, #2a1446) !important; }
      body.hqV1 #sTabs button > b { display: none !important; }
      body.hqV1 #sTabs button { font-size: 0 !important; color: transparent !important; }
      body.hqV1 #sTabs button::before { content: ""; position: absolute; inset: 8%; background: center / contain no-repeat; filter: grayscale(.6) brightness(.7); }
      body.hqV1 #sTabs button.on::before { filter: drop-shadow(0 0 6px #ffcf6a); }
      body.hqV1 #sTabs button[data-st="up"]::before { background-image: ${u('ti_upgrade')}; }
      body.hqV1 #sTabs button[data-st="art"]::before { background-image: ${u('ti_artifacts')}; }
      body.hqV1 #sTabs button[data-st="bag"]::before { background-image: ${u('ti_bag')}; }
      body.hqV1 #sTabs button[data-st="pets"]::before { background-image: ${u('ti_pets')}; }
      body.hqV1 #sTabs .hqBang { position: absolute; right: 3px; top: 1px; display: block !important; width: auto !important; height: auto !important; background: none !important; font: 900 24px/1 Georgia, serif !important; font-style: normal; color: #ffc23a; text-shadow: 0 0 6px #ff8a00, 0 2px 2px #000; animation: hqBang 1s ease-in-out infinite; z-index: 2; }
      @keyframes hqBang { 50% { transform: translateY(-3px); } }
      body.hqV1 #pgSec .pgHead { display: grid !important; grid-template-columns: 64px 1fr 64px; align-items: center; gap: 4px; padding: 4px 4px 4px !important; min-height: 0 !important; }
      body.hqV1 #pgSec .pgHead .backBtn { grid-column: 1; grid-row: 1; width: 56px; height: 34px; clip-path: none; border: none !important; box-shadow: none !important; background: ${u('nav_back')} center / contain no-repeat !important; font-size: 0 !important; color: transparent !important; }
      body.hqV1 #pgSec #sTitle { grid-column: 2; grid-row: 1; height: 34px; border: none !important; box-shadow: none !important; clip-path: none !important; background: ${u('nav_title')} center / contain no-repeat !important; color: transparent !important; text-shadow: none !important; }
      body.hqV1 #pgSec #sTitle::before, body.hqV1 #pgSec #sTitle::after { display: none !important; }
      body.hqV1 #pgSec #secHelp { display: none; }
      #hqMult { grid-column: 3; grid-row: 1; height: 32px; display: flex; align-items: stretch; padding: 0; border-radius: 6px; overflow: hidden; border: 2px solid #e0b04a; box-shadow: 0 0 0 2px #0a060e, 0 0 10px #d6a64077; background: linear-gradient(#ffe08a, #c98a1a); }
      #hqMult b { color: #2a1404 !important; text-shadow: 0 1px 0 #fff6 !important; font-size: 16px !important; }
      #hqMult b { flex: 1; display: grid; place-items: center; font: 800 16px Georgia, 'Times New Roman', serif; color: #ffd86a; text-shadow: 0 1px 2px #000; }
      #hqMult i { width: 22px; display: grid; place-items: center; font-style: normal; font-size: 11px; color: #2a1a04; background: linear-gradient(#ffe08a, #c98a1a); }
      #hqMult:active { transform: scale(.94); }
      /* карточки */
      body.hqV1 #pgSec #sBody { padding-left: 0 !important; padding-right: 0 !important; padding-top: 0 !important; }
      body.hqV1 #sBody .hqCard { width: 100%; margin-bottom: 2px; grid-template-columns: 104px 1fr 132px; min-height: 120px; padding: 12px 14px 12px 16px; }
      .hqCard { position: relative; display: grid; grid-template-columns: 96px 1fr 128px; align-items: center; gap: 8px; min-height: 112px; margin-bottom: 10px; padding: 10px 12px 10px 14px; box-sizing: border-box;
        background: ${u('card')} center / 100% 100% no-repeat; }
      .hqPt { position: relative; width: 96px; height: 82px; }
      .hqPt .fg { position: absolute; left: 9%; right: 9%; top: 10%; bottom: 10%; overflow: hidden; background: #1a1222; display: grid; place-items: center; font-size: 38px; }
      .hqPt .fg img, .hqPt .fg svg { width: 100%; height: 100%; object-fit: cover; }
      .hqCard.off .hqPt .fg img, .hqCard.off .hqPt .fg svg { filter: grayscale(1) brightness(.8); }
      .hqPt .hqFr { position: absolute; left: -6%; top: -8%; width: 112%; height: 116%; pointer-events: none; z-index: 2; }
      .hqPt .plus { position: absolute; left: -8px; top: -8px; z-index: 4; width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; font: 900 18px system-ui; font-style: normal; color: #2a1a04; background: radial-gradient(#d8ff5a, #7aa810); border: 2px solid #1a1a1c; }
      .hqSt { position: absolute; left: 50%; bottom: -12px; transform: translateX(-50%); display: flex; z-index: 3; }
      .hqSt img { width: 17px; height: 17px; margin: 0 -1px; filter: drop-shadow(0 1px 1px #000); }
      .hqInf { min-width: 0; }
      .hqInf .nm { display: flex; align-items: center; gap: 5px; font: 800 17px Georgia, 'Times New Roman', serif; color: #f6e6c4; text-shadow: 0 1px 2px #000; white-space: nowrap; }
      .hqInf .nm span { overflow: hidden; text-overflow: ellipsis; }
      .hqInf .nm img { width: 22px; height: 22px; flex: none; }
      .hqInf .ln { margin-top: 4px; display: flex; align-items: center; gap: 5px; font: 600 14px system-ui; color: #d8c8ec; text-shadow: 0 1px 2px #000; }
      .hqInf .ln b { color: #fff; font-weight: 800; }
      .hqInf .ln .ic { width: 22px; height: 13px; object-fit: contain; }
      .hqInf .ln .dcI { font-style: normal; }
      .hqBtn { position: relative; width: 128px; height: 46px; padding: 0; background: none; border: none; display: flex; flex-direction: column; align-items: center; justify-content: center; }
      .hqBtn img { position: absolute; inset: 0; width: 100%; height: 100%; }
      .hqBtn b, .hqBtn span { position: relative; z-index: 1; text-shadow: 0 1px 2px #000; white-space: nowrap; }
      .hqBtn b { font: 800 13px Georgia, 'Times New Roman', serif; color: #ffe6a0; line-height: 1.1; }
      .hqBtn b small { font: 700 10px system-ui; color: #fff; }
      .hqBtn span { font: 800 12px system-ui; color: #fff; line-height: 1.2; }
      .hqBtn.off b { color: #cfcfcf; } .hqBtn.off span { color: #bbb; }
      .hqBtn:not(.off):active { transform: scale(.94); }
      /* 0.115: тоньше рамки (как в «Крушителях»): рамка карточки и портрета — border-image, края вдвое тоньше, узоры не искажаются */
      body.hqV1 #sBody .hqCard, .hqCard { background: none !important; border-style: solid; border-width: 9px 10px; border-image: ${u('card')} 33 40 fill stretch; padding: 4px 6px 4px 6px !important; min-height: 104px !important; }
      .hqPt .hqFr { display: none; }
      .hqPt::after { content: ""; position: absolute; inset: -3% -3%; z-index: 2; pointer-events: none; border-style: solid; border-width: 12px; border-image: var(--fr) 62 fill stretch; background: none; }
      .hqPt::after { border-image-slice: 62; border-image-outset: 0; }
      .hqPt .fg { left: 6%; right: 6%; top: 6%; bottom: 6%; }
      .hqMs { display: inline-flex; align-items: center; gap: 4px; margin-top: 4px; height: 20px; padding: 0 8px 0 4px; border-radius: 4px; background: #0a060ecc; border: 1px solid #5a4a6a;
        font: 800 12px system-ui; color: #fff; text-shadow: 0 1px 2px #000; }
      .hqMs i { font-style: normal; font-size: 12px; }
      .hqBtn.hire img { filter: hue-rotate(-80deg) saturate(1.15); }
      .hqRk { position: absolute; right: -6px; top: -6px; z-index: 3; min-width: 22px; height: 22px; padding: 0 3px; box-sizing: border-box; display: grid; place-items: center;
        clip-path: polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%); background: linear-gradient(#2a1c36, #0e0814); outline: none;
        font: 800 12px Georgia, serif; color: var(--rc, #fff); text-shadow: 0 0 4px var(--rc, #fff), 0 1px 2px #000; box-shadow: inset 0 0 0 2px var(--rc, #888); }
      .hqBtn.off.hire img { filter: none; }
    `;
    document.head.appendChild(css);
    // «назад» — в одну строку с вкладками (как в Крушителях)
    const pg = $('pgSec'), nav = document.createElement('div'); nav.className = 'hqNav';
    nav.appendChild($('sTabs')); pg.appendChild(nav);    // 0.84.4: вкладки сверху убраны (пользователь), «назад» — в строке «Герои»
  })();
