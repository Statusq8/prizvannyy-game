  // ===================== 0.123: Профиль точь-в-точь по макетам пользователя (docs/ui/PROFILE.md, references/profile_mockup_v1.png, profile_stats_mockup_v1.png 1024×1536) =====================
  // Размеры — доли ширины (1 px макета = 0.0977cqw). Плашки — border-image (не искажаются). Разметка — renderProf в ui3.js (ветка PF_ART).
  (function () {
    const A = /*__PROFILE__*/{};
    if (!A.bg_top) return;
    window.PF_ART = A;
    const R = window.RG_ART || {}, M = window.MK_ART || {};
    const u = n => 'url("' + (A[n] || R[n] || M[n]) + '")';
    const hb = (n, s, H, h, s2) => `height: ${h}cqw; box-sizing: border-box; border-style: solid; border-width: 0 ${(s2 || s) * h / H}cqw 0 ${s * h / H}cqw; border-image: ${u(n)} 0 ${s2 || s} 0 ${s} fill stretch; background: none;`;
    const css = document.createElement('style');
    css.textContent = `
      #pgProf.pfl { container-type: inline-size; background: #1e0e37 url("${A.bg_top}") center top / 100% auto no-repeat !important; }
      #pgProf.pfl::before { display: none !important; }
      #pgProf.pfl::after { content: ""; display: block !important; position: absolute; left: 0; right: 0; bottom: 0; height: 26cqw; background: url("${A.bg_bot}") center bottom / 100% auto no-repeat; pointer-events: none; z-index: 0; }
      #pgProf.pfl .tower, #pgProf.pfl #pfTabs { display: none !important; }
      #pgProf.pfl .pgHead { position: absolute !important; z-index: 6; left: 0; right: 0; top: 0; height: calc(env(safe-area-inset-top) + 100px); padding: 0 !important; margin: 0 !important; background: none !important; border: none !important; box-shadow: none !important; }
      #pgProf.pfl .pgHead .backBtn { position: absolute; left: 8px; top: calc(env(safe-area-inset-top) + 4px); width: 42px !important; height: 40px !important; padding: 0 !important; border: none !important; box-shadow: none !important; clip-path: none;
        background: ${u('back')} center / contain no-repeat !important; font-size: 0 !important; color: transparent !important; }
      #pgProf.pfl .pgHead .backBtn::after { content: none !important; }
      #pgProf.pfl .pgHead .titlePl { position: absolute; left: 50%; transform: translateX(-50%); top: calc(env(safe-area-inset-top) + 46px); width: min(72vw, 300px); height: 52px; box-sizing: border-box; margin: 0; padding: 0 18px;
        display: grid; place-items: center; background: ${u('title')} center / 100% 100% no-repeat !important; border: none !important; box-shadow: none !important; clip-path: none !important;
        font: 800 clamp(17px, 5.6vw, 24px) Georgia, 'Times New Roman', serif !important; color: #f6dfa6 !important; text-shadow: 0 2px 3px #000, 0 0 10px #a050ff !important; }
      #pgProf.pfl .pgHead .titlePl::before, #pgProf.pfl .pgHead .titlePl::after { display: none !important; }
      #pgProf.pfl #pfRes { position: absolute; right: 8px; top: calc(env(safe-area-inset-top) + 8px); display: flex; gap: 8px; height: 32px; }
      #pfRes { display: none; }
      #pgProf.pfl #pfBody { position: absolute !important; left: 0; right: 0; bottom: 0; top: calc(env(safe-area-inset-top) + max(108px, 26cqw)) !important; z-index: 1; padding: 0 0 calc(env(safe-area-inset-bottom) + 4cqw) !important; overflow-y: auto !important; overflow-x: hidden; }
      .pf { min-height: 100%; display: flex; flex-direction: column; color: #f3ead8; font-family: Georgia, 'Times New Roman', serif; text-shadow: 0 1px 2px #000; }
      .pf button { font-family: inherit; padding: 0; color: inherit; border: none; background: none; }
      .pf .abs { position: absolute; box-sizing: border-box; }
      /* вкладки: 35–988 × 280–375 */
      .pf .pTabs { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 1.5cqw; margin: 0 3.5cqw 0 3.4cqw; align-items: center; }
      .pf .pTab { ${hb('tab', 40, 118, 9.3)} display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.3cqw; font-size: 2.5cqw; font-weight: 700; color: #f0dfc0; white-space: nowrap; }
      .pf .pTab img { width: 3.9cqw; height: 3.9cqw; object-fit: contain; }
      .pf .pTab.pOn { ${hb('tab_on', 40, 141, 10.2)} color: #fff; text-shadow: 0 0 6px #c070ff, 0 1px 2px #000; }
      /* карточка игрока: 20–1005 × 395–775 */
      .pf .pCard { position: relative; margin: 2cqw 1.9cqw 0 2cqw; height: 37.1cqw; box-sizing: border-box; border: 4.9cqw solid transparent; border-image: ${u('panel')} 50 fill stretch; }
      .pf .pRing { position: absolute; left: -0.9cqw; top: -4.9cqw; width: 37.1cqw; height: 37.1cqw; }
      .pf .pRing .ava { position: absolute; left: 6.1cqw; top: 6.1cqw; width: 24.9cqw; height: 24.9cqw; border-radius: 50%; overflow: hidden; background: #241238; }
      .pf .pRing .ava img { width: 100%; height: 100%; object-fit: cover; }
      .pf .pRing .rg { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
      .pf .pName { left: 37.1cqw; top: 1.1cqw; width: 37.1cqw; height: 6.8cqw; display: flex; align-items: center; justify-content: center; font-size: 5.3cqw; font-weight: 800; color: #f6d690; white-space: nowrap; overflow: hidden; }
      .pf .pPen { left: 77.1cqw; top: 1.6cqw; width: 6.3cqw; height: 5.7cqw; background: ${u('pencil')} center / contain no-repeat; }
      .pf .pSep { left: 36cqw; top: 8.8cqw; width: 51.8cqw; height: 0.25cqw; background: linear-gradient(90deg, #0000, #c8a060 30%, #c8a060 70%, #0000); }
      .pf .pRib { left: 38.6cqw; top: 10.2cqw; width: 45cqw; height: 9.3cqw; background: ${u('ribbon')} center / 100% 100% no-repeat; display: grid; place-items: center; padding-top: 1.8cqw;
        font-size: 2.9cqw; font-weight: 700; color: #f6dfa6; white-space: nowrap; }
      .pf .pB { top: 22cqw; ${hb('btn', 40, 109, 6.3)} display: flex; align-items: center; justify-content: center; gap: 1cqw; font-size: 2.35cqw; font-weight: 700; color: #f3e6d0; white-space: nowrap; }
      .pf .pB img { width: 3.6cqw; height: 3.6cqw; object-fit: contain; }
      .pf .pB1 { left: 34.6cqw; width: 24.4cqw; } .pf .pB2 { left: 60.8cqw; width: 26.1cqw; }
      /* «Рекорды»: заголовок 290–735 × 795–865, панель 20–1005 × 825–1400 */
      .pf .pRec { position: relative; margin: 4.9cqw 1.9cqw 0 2cqw; box-sizing: border-box; border: 4.4cqw solid transparent; border-image: ${u('list')} 45 fill stretch; padding: 1.5cqw 0 1.4cqw; flex: 1; display: flex; flex-direction: column; }
      .pf .pHdr { position: absolute; left: 22cqw; top: -7.3cqw; width: 43.5cqw; height: 6.8cqw; background: ${u('hdr')} center / 100% 100% no-repeat; display: grid; place-items: center; font-size: 3.9cqw; font-weight: 800; color: #f6d690; }
      .pf .pGrid { flex: 1; display: grid; grid-template-columns: 1fr 1fr; column-gap: 2.4cqw; row-gap: 1.9cqw; align-content: space-evenly; }
      .pf .pSt { position: relative; ${hb('stat', 35, 126, 10.9)} display: flex; flex-direction: column; align-items: center; justify-content: center; padding-left: 7.4cqw !important; }
      .pf .pSt img { position: absolute; left: -1.4cqw; top: 50%; transform: translateY(-50%); width: 9.8cqw; height: 9.4cqw; object-fit: contain; }
      .pf .pSt small { font-size: 2.3cqw; color: #f0e4d0; white-space: nowrap; }
      .pf .pSt b { font-size: 4cqw; color: #f6d690; white-space: nowrap; }
      /* «Статы»: панель 20–1005 × 395–1355, строки по 59 px */
      .pf .pList { position: relative; margin: 2cqw 1.9cqw 0 2cqw; box-sizing: border-box; border: 4.4cqw solid transparent; border-image: ${u('list')} 45 fill stretch; padding: 0 2.6cqw 1.5cqw; flex: 1; display: flex; flex-direction: column; }
      .pf .pH2 { position: relative; height: 7.4cqw; display: flex; align-items: center; justify-content: center; margin: 0.6cqw 0 0.4cqw; }
      .pf .pH2::before { content: ""; position: absolute; left: 0; right: 0; top: 50%; height: 0.25cqw; background: linear-gradient(90deg, #0000, #b070ff 30%, #b070ff 70%, #0000); }
      .pf .pH2 span { position: relative; width: 30.3cqw; height: 6.4cqw; background: ${u('hdr2')} center / 100% 100% no-repeat; display: flex; align-items: center; justify-content: center; gap: 1cqw; font-size: 3.4cqw; font-weight: 800; color: #f6d690; }
      .pf .pH2 img { width: 3.6cqw; height: 3.6cqw; object-fit: contain; }
      .pf .pRow { display: flex; align-items: center; flex: 1 0 5.8cqw; max-height: 9cqw; border-bottom: 0.2cqw solid; border-image: linear-gradient(90deg, #0000, #b08050 15%, #b08050 85%, #0000) 1; }
      .pf .pRow img { flex: none; width: 4.9cqw; height: 4.4cqw; object-fit: contain; margin: 0 3.3cqw 0 2.4cqw; }
      .pf .pRow span { flex: 1; font-size: 2.9cqw; color: #f0e4d0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .pf .pRow b { font-size: 3.6cqw; color: #f6d690; white-space: nowrap; padding-right: 1cqw; }
      /* Титулы, Облики, Хроника — те же плашки во всю ширину */
      .pf .pNote { margin: 2.4cqw 5cqw 0; font-size: 2.5cqw; color: #d8c8ee; text-align: center; }
      .pf .pItems { flex: 1; display: flex; flex-direction: column; gap: 1.4cqw; margin: 2cqw 2.6cqw 0; }
      .pf .pIt { position: relative; ${hb('stat', 35, 126, 10.9)} display: flex; align-items: center; gap: 1.6cqw; padding-left: 8.6cqw !important; }
      .pf .pIt > img { position: absolute; left: -0.6cqw; top: 50%; transform: translateY(-50%); width: 8.6cqw; height: 8cqw; object-fit: contain; }
      .pf .pIt div { flex: 1; min-width: 0; display: flex; flex-direction: column; }
      .pf .pIt div b { font-size: 3.1cqw; color: #f6d690; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .pf .pIt div small { font-size: 2.2cqw; color: #d8c8ee; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .pf .pIt.lk { filter: grayscale(.6) brightness(.7); }
      .pf .pIt .pGo { flex: none; ${hb('btn', 40, 109, 6.3)} min-width: 19cqw; font-size: 2.5cqw; font-weight: 700; color: #f3e6d0; display: grid; place-items: center; }
      .pf .pIt .pGo.on { color: #ffe9a0; filter: drop-shadow(0 0 1cqw #b060ff); }
    `;
    document.head.appendChild(css);
  })();
