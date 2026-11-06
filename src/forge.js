  // ===================== 0.93: Кузница по макету пользователя (docs/ui/FORGE.md, references/forge_mockup_v1.png; детали — tools/forgecut.py → assets/forge) =====================
  (function () {
    const A = /*__FORGE__*/{};
    if (!A.bg) return;
    window.FG_ART = A;
    const u = n => 'url("' + A[n] + '")';
    const P = window.PT_ART || {};
    const css = document.createElement('style');
    css.textContent = `
      #pgX.fgl { background: #12081c ${u('bg')} center bottom / cover no-repeat !important; }
      #pgX.fgl .tower { display: none !important; }
      #pgX.fgl #xTop { justify-content: flex-end; padding: calc(env(safe-area-inset-top) + 6px) 8px 0 !important; min-height: 0 !important; }
      #pgX.fgl #xTop .cur { display: none; }
      .fgCur { height: 34px; min-width: 120px; padding: 0 14px 0 40px; position: relative; display: flex; align-items: center; justify-content: flex-end; border-radius: 8px;
        background: linear-gradient(#2a1838, #120a1a); border: 1.5px solid #8a5ac0; box-shadow: 0 0 10px #8a3cff66; font: 800 18px Georgia, 'Times New Roman', serif; color: #ffe6a0; text-shadow: 0 1px 2px #000; }
      .fgCur i { position: absolute; left: 8px; top: 50%; transform: translateY(-50%); font-style: normal; font-size: 20px; }
      #pgX.fgl .pgHead { display: flex; align-items: center; gap: 6px; padding: 2px 8px 2px !important; }
      #pgX.fgl .pgHead .backBtn { flex: none; width: 58px; height: 42px; clip-path: none; border: none !important; box-shadow: none !important; font-size: 0 !important;
        background: ${P.back ? 'url("' + P.back + '")' : 'none'} center / contain no-repeat !important; }
      #pgX.fgl #xTitle { flex: 1; height: 56px; line-height: 56px; padding: 0 !important; display: grid !important; place-items: center; margin: 0 58px 0 0 !important; border: none !important; box-shadow: none !important;
        background: ${u('title')} center / 100% 100% no-repeat !important; font: 800 22px Georgia, 'Times New Roman', serif !important; color: #ffe0f6 !important; text-shadow: 0 0 10px #c04cff, 0 2px 3px #000 !important; }
      #pgX.fgl #xTitle::before, #pgX.fgl #xTitle::after { display: none !important; }
      #pgX.fgl #xBody { display: flex; flex-direction: column; padding: 0 8px calc(env(safe-area-inset-bottom) + 6px) !important; overflow: hidden !important; }
      .fgTabs { flex: none; display: flex; justify-content: center; gap: 6px; margin: 2px 0 6px; }
      .fgTabs button { flex: 0 0 23%; height: 52px; border: none; padding: 0; background: ${u('tab')} center / 100% 100% no-repeat; color: #e8dcf6; font: 700 12px Georgia, serif; text-shadow: 0 1px 2px #000; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; }
      .fgTabs button.on { background-image: ${u('tab_on')}; color: #fff3c8; }
      .fgTabs button b { font-size: 18px; line-height: 1; }
      .fgTabs button img { width: 26px; height: 26px; object-fit: contain; }
      .fgGrid { flex: 1; min-height: 0; overflow-y: auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px 6px; align-content: start; padding: 2px 4px 6px; }
      .fgCell { position: relative; aspect-ratio: 200 / 209; border: none; padding: 0; background: ${u('cell')} center / 100% 100% no-repeat; }
      .fgCell img { position: absolute; left: 14%; top: 10%; width: 72%; height: 72%; object-fit: contain; }
      .fgCell .lv { position: absolute; left: 14%; right: 14%; bottom: 3%; height: 24%; display: grid; place-items: center; background: ${u('lvl')} center / 100% 100% no-repeat; font: 800 12px Georgia, serif; color: #fff; text-shadow: 0 1px 2px #000; }
      .fgCell .bang2 { position: absolute; top: -2px; right: -2px; }
      .fgEmpty { grid-column: 1 / -1; text-align: center; padding: 20px 10px; color: #cbbbe0; font: 600 13px/1.4 system-ui; }
      .fgLow { flex: none; padding-bottom: 4px; }
      .fgBr { display: flex; justify-content: center; gap: 4px; margin-bottom: 6px; }
      .fgBr button { flex: 0 0 48%; height: 40px; border: none; padding: 0 0 0 30px; background: center / 100% 100% no-repeat; font: 800 15px Georgia, serif; color: #e8dcf6; text-shadow: 0 1px 2px #000; filter: brightness(.6) saturate(.6); }
      .fgBr button.on { filter: none; color: #fff; }
      .fgBr .s { background-image: ${u('br_soul')}; } .fgBr .b { background-image: ${u('br_blood')}; }
      .fgOff { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 0 4px; }
      .fgCard { position: relative; aspect-ratio: 262 / 380; background: ${u('card')} center / 100% 100% no-repeat; display: flex; flex-direction: column; align-items: center; padding: 10% 8% 8%; box-sizing: border-box; }
      .fgCard img { width: 60%; aspect-ratio: 1; object-fit: contain; }
      .fgCard .nm { width: 100%; height: 22px; margin-top: 2px; display: grid; place-items: center; background: ${u('name')} center / 100% 100% no-repeat; font: 800 10.5px Georgia, serif; color: #ffe6a0; white-space: nowrap; overflow: hidden; text-shadow: 0 1px 2px #000; }
      .fgCard .ds { flex: 1; margin: 3px 0; font: 600 9.5px/1.2 system-ui; color: #d8c8ec; text-align: center; overflow: hidden; }
      .fgCard .buy { width: 100%; height: 34px; border: none; background: ${u('buy')} center / 100% 100% no-repeat; font: 800 14px Georgia, serif; color: #fff; text-shadow: 0 1px 2px #000; }
      .fgCard .buy:disabled { background-image: ${u('buy_off')}; color: #ddd; }
      .fgCard .buy:not(:disabled):active, .fgRef:not(:disabled):active, .fgBr button:active { transform: scale(.95); }
      .fgCard.sold { justify-content: center; } .fgCard.sold b { font: 800 14px Georgia, serif; color: #9a8aa8; }
      .fgRef { display: block; margin: 10px auto 0; width: 62%; height: 46px; border: none; padding: 0 0 0 46px; background: ${u('refresh')} center / 100% 100% no-repeat; font: 800 16px Georgia, serif; color: #fff; text-shadow: 0 1px 2px #000; }
      .fgRef:disabled { filter: grayscale(.7) brightness(.7); }
      .fgAll { text-align: center; padding: 26px 0; font: 700 14px Georgia, serif; color: #ffe6a0; text-shadow: 0 1px 3px #000; }
      /* окно улучшения артефакта */
      .fgPop { position: absolute; inset: 0; z-index: 5; display: grid; place-items: center; background: #05020acc; }
      .fgPop .box { width: 84%; position: relative; padding: 18px 16px 16px; border-radius: 12px; background: linear-gradient(#24162f, #0e0814); border: 1.5px solid #9a6ad0; box-shadow: 0 0 24px #8a3cff88; text-align: center; color: #e8dcf6; }
      .fgPop .box.blood { border-color: #d04050; box-shadow: 0 0 24px #ff304088; }
      .fgPop img { width: 120px; height: 120px; object-fit: contain; }
      .fgPop h3 { margin: 4px 0 2px; font: 800 19px Georgia, serif; color: #ffe6a0; }
      .fgPop .lvl { font: 700 13px system-ui; color: #cbbbe0; }
      .fgPop p { margin: 8px 0 12px; font: 600 13px/1.35 system-ui; }
      .fgPop .row { display: flex; gap: 8px; justify-content: center; }
      .fgPop .row button { flex: 1; height: 44px; border: none; background: ${u('buy')} center / 100% 100% no-repeat; font: 800 13px Georgia, serif; color: #fff; text-shadow: 0 1px 2px #000; }
      .fgPop .row button:disabled { background-image: ${u('buy_off')}; color: #ddd; }
      .fgPop .x { position: absolute; right: 8px; top: 6px; border: none; background: none; font-size: 22px; color: #cbbbe0; }
    `;
    document.head.appendChild(css);
  })();
