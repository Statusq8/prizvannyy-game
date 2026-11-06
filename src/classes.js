  // ===================== 0.124: Классы главного героя — дерево навыков точь-в-точь по макету (docs/ui/CLASSES.md, references/classes_mockup_v1.png 1024×1536) =====================
  // Размеры — доли ширины (1 px макета = 0.0977cqw). Ряд классов прижат к верху, дерево и панель навыка — к низу (под деревом — рунный круг фона).
  (function () {
    const A = /*__CLASSES__*/{};
    if (!A.bg) return;
    window.CL_ART = A;
    const u = n => 'url("' + A[n] + '")';
    const css = document.createElement('style');
    css.textContent = `
      #pgX.cll { container-type: inline-size; background: linear-gradient(#1a0b30 calc(100% - 150cqw), #1a0b3000 calc(100% - 128cqw)), url("${A.bg}") center bottom / 100% auto no-repeat, #1a0b30 !important; }
      #pgX.cll::before, #pgX.cll::after { display: none !important; }
      #pgX.cll .tower { display: none !important; }
      #pgX.cll #xTitle { background: ${window.RG_ART ? 'url("' + window.RG_ART.title + '")' : 'none'} center / 100% 100% no-repeat !important; border: none !important; box-shadow: none !important;
        font: 800 clamp(17px, 5.6vw, 24px) Georgia, 'Times New Roman', serif !important; color: #f6dfa6 !important; text-shadow: 0 2px 3px #000, 0 0 10px #a050ff !important; }
      #pgX.cll #xTitle::before, #pgX.cll #xTitle::after { display: none !important; }
      #pgX.cll #xBody { position: absolute !important; left: 0; right: 0; bottom: 0; top: calc(env(safe-area-inset-top) + max(104px, 25cqw)) !important; z-index: 1; padding: 0 !important; overflow: hidden !important; }
      .cl { position: absolute; inset: 0; display: flex; flex-direction: column; color: #f3ead8; font-family: Georgia, 'Times New Roman', serif; text-shadow: 0 1px 2px #000; }
      .cl button { font-family: inherit; padding: 0; color: inherit; border: none; background: none; }
      .cl .abs { position: absolute; box-sizing: border-box; }
      /* ряд классов: центры 193/418/632/848 */
      .cl .cRow { position: relative; flex: none; height: 20.5cqw; }
      .cl .cRow::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 0.3cqw; background: linear-gradient(90deg, #0000, #c8a060 25%, #e0b0ff 50%, #c8a060 75%, #0000); }
      .cl .cK { top: 0; width: 22cqw; height: 18.6cqw; margin-left: -11cqw; }
      .cl .cK .rg { position: absolute; left: 50%; top: 7.6cqw; width: 15cqw; height: 15cqw; transform: translate(-50%, -50%); background: ${u('ring')} center / contain no-repeat; display: grid; place-items: center; }
      .cl .cK.on .rg { width: 18cqw; height: 18cqw; background-image: ${u('ring_on')}; }
      .cl .cK .rg img { width: 52%; height: 52%; object-fit: contain; }
      .cl .cK.view:not(.on) .rg { filter: drop-shadow(0 0 1.4cqw #c070ff) brightness(1.15); }
      .cl .cK .pl { position: absolute; left: 0.5cqw; right: 0.5cqw; top: 13.7cqw; height: 4.4cqw; background: ${u('nplate')} center / 100% 100% no-repeat; display: grid; place-items: center; font-size: 2.3cqw; font-weight: 700; color: #f0e4d0; white-space: nowrap; }
      .cl .cK.on .pl { color: #ffe29a; filter: drop-shadow(0 0 1cqw #ffb030); }
      /* дерево: коробка 73.7cqw (y 350–1105 макета) */
      .cl .tree { position: relative; flex: 1; min-height: 73.7cqw; }
      .cl .tBox { position: absolute; left: 0; right: 0; bottom: 0; top: 0; max-height: 110cqw; margin-top: auto; }
      .cl .tBox svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
      .cl .tBox path { fill: none; stroke: #6a3a9a; stroke-width: 5; stroke-linecap: round; }
      .cl .tBox path.lit { stroke: #e0a0ff; filter: drop-shadow(0 0 6px #b040ff); }
      .cl .big { left: 38.8cqw; top: 0; width: 22.5cqw; height: 23.9cqw; background: ${u('ring_big')} center / contain no-repeat; display: grid; place-items: center; }
      .cl .big img { width: 46%; height: 46%; object-fit: contain; margin-top: -1cqw; }
      .cl .nd { width: 18.6cqw; height: 18.6cqw; margin: -9.3cqw 0 0 -9.3cqw; background: ${u('node')} center / contain no-repeat; display: grid; place-items: center; }
      .cl .nd img.ic { width: 56%; height: 56%; object-fit: contain; margin-top: 1cqw; }
      .cl .nd.t2 { width: 18cqw; height: 18cqw; margin: -9cqw 0 0 -9cqw; }
      .cl .nd.lk { background-image: ${u('node_lock')}; }
      .cl .nd.lk img.ic { filter: grayscale(1) brightness(.55); }
      .cl .nd .lkI { position: absolute; left: 50%; bottom: 8%; width: 4.4cqw; height: 5.2cqw; margin-left: -2.2cqw; object-fit: contain; }
      .cl .nd.sel { filter: drop-shadow(0 0 1.6cqw #ffcf5a); }
      .cl .nd .lv { position: absolute; left: 50%; top: 14.6cqw; width: 10.7cqw; height: 3.4cqw; margin-left: -5.35cqw; background: ${u('lvl')} center / 100% 100% no-repeat; display: grid; place-items: center; font-size: 2.4cqw; font-weight: 700; color: #fff; }
      .cl .nd .lv.mx { color: #ffe29a; }
      .cl .nd .np { position: absolute; left: 50%; top: 17.9cqw; width: 23cqw; height: 4.4cqw; margin-left: -11.5cqw; background: ${u('nplate')} center / 100% 100% no-repeat; display: grid; place-items: center; font-size: 2.35cqw; font-weight: 700; color: #f3e6d0; white-space: nowrap; }
      .cl .nd .rd { position: absolute; right: 8%; top: 8%; width: 2.8cqw; height: 2.8cqw; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #ff9a9a, #e01020 55%, #700); box-shadow: 0 0 0 0.3cqw #c89a5a; }
      /* панель навыка: 18–1005 × 1112–1475 */
      .cl .inf { position: relative; flex: none; margin: 0.7cqw 1.9cqw calc(env(safe-area-inset-bottom) + 1.5cqw) 1.8cqw; height: 35.4cqw; box-sizing: border-box; border: 4cqw solid transparent; border-image: ${u('info')} 50 fill stretch; }
      .cl .iRg { left: -0.9cqw; top: -0.3cqw; width: 19cqw; height: 19cqw; background: ${u('node')} center / contain no-repeat; display: grid; place-items: center; }
      .cl .iRg.lk { background-image: ${u('node_lock')}; }
      .cl .iRg img { width: 56%; height: 56%; object-fit: contain; margin-top: 1cqw; }
      .cl .iDv { left: 19.3cqw; top: 0.2cqw; width: 0.2cqw; height: 17cqw; background: linear-gradient(#0000, #c8a060 20%, #c8a060 80%, #0000); }
      .cl .iNm { left: 21.1cqw; top: 0.4cqw; width: 39cqw; font-size: 3.4cqw; font-weight: 800; color: #f6d690; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .cl .iDs { left: 21.1cqw; top: 5.6cqw; width: 39.5cqw; font-size: 2.55cqw; line-height: 1.2; color: #f3eee8; }
      .cl .iBn { left: 21.1cqw; top: 13.3cqw; width: 39.5cqw; font-size: 2.65cqw; color: #f6d690; white-space: nowrap; }
      .cl .iBn b { color: #ffe9a0; font-size: 3.1cqw; margin-left: 1cqw; }
      .cl .iUp { left: 61.6cqw; top: 2.6cqw; width: 27.5cqw; height: 13.7cqw; box-sizing: border-box; border-style: solid; border-width: 0 ${40 * 13.7 / 211}cqw; border-image: ${u('btn_gold')} 0 40 fill stretch;
        display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding-top: 1.8cqw !important; gap: 2cqw; font-size: 3.2cqw; font-weight: 800; color: #3a1e00; text-shadow: 0 1px 0 #ffe7a0; }
      .cl .iUp span { display: flex; align-items: center; gap: 1cqw; font-size: 3.4cqw; color: #fff; text-shadow: 0 1px 2px #000; }
      .cl .iUp span img { width: 4.4cqw; height: 4.4cqw; object-fit: contain; }
      .cl .iUp:disabled { filter: grayscale(.6) brightness(.7); }
      .cl .iUp:not(:disabled):active, .cl .iCh:not(:disabled):active { transform: scale(.96); }
      .cl .iSp { left: 2cqw; right: 2cqw; top: 19.7cqw; height: 0.25cqw; background: linear-gradient(90deg, #0000, #b070ff 25%, #e0b0ff 50%, #b070ff 75%, #0000); }
      .cl .iCh { left: 17.2cqw; top: 21.7cqw; width: 35.6cqw; height: 7.1cqw; box-sizing: border-box; border-style: solid; border-width: 0 ${40 * 7.1 / 150}cqw; border-image: ${u('btn')} 0 40 fill stretch;
        display: flex; align-items: center; justify-content: center; gap: 1.2cqw; font-size: 3.1cqw; font-weight: 700; color: #f3e6d0; white-space: nowrap; }
      .cl .iCh:disabled { filter: grayscale(.5) brightness(.65); }
      .cl .iNt { left: 58.2cqw; top: 22.4cqw; height: 5.6cqw; padding-left: 2.4cqw; border-left: 0.2cqw solid #8a6aa0; display: flex; align-items: center; font-size: 2.4cqw; font-style: italic; color: #e8dcf4; white-space: nowrap; }
      .cl .lockMsg { position: absolute; inset: 0; display: grid; place-items: center; text-align: center; padding: 0 8cqw; font-size: 3.4cqw; color: #f0e4d0; }
    `;
    document.head.appendChild(css);
  })();
