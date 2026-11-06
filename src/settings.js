  // ===================== 0.125: Настройки точь-в-точь по макету пользователя (docs/ui/SETTINGS.md, references/settings_mockup_v1.png 1024×1536) =====================
  // Длинная панель — та же, что в Профиле (PF_ART.list); шапки разделов с лучами, переключатели и сегменты — assets/settings. Разметка — renderSet в ui3.js (ветка ST_ART).
  (function () {
    const A = /*__SETTINGS__*/{};
    if (!A.bg_top) return;
    window.ST_ART = A;
    const R = window.RG_ART || {}, P = window.PF_ART || {};
    const u = n => 'url("' + (A[n] || P[n] || R[n]) + '")';
    const css = document.createElement('style');
    css.textContent = `
      #pgSet.stl { container-type: inline-size; background: #1c033d url("${A.bg_top}") center top / 100% auto no-repeat !important; }
      #pgSet.stl::before { display: none !important; }
      #pgSet.stl::after { content: ""; display: block !important; position: absolute; left: 0; right: 0; bottom: 0; height: 24cqw; background: url("${A.bg_bot}") center bottom / 100% auto no-repeat; pointer-events: none; z-index: 0; }
      #pgSet.stl .tower { display: none !important; }
      #pgSet.stl .pgHead { position: absolute !important; z-index: 6; left: 0; right: 0; top: 0; height: calc(env(safe-area-inset-top) + 100px); padding: 0 !important; margin: 0 !important; background: none !important; border: none !important; box-shadow: none !important; }
      #pgSet.stl .pgHead .backBtn { position: absolute; left: 8px; top: calc(env(safe-area-inset-top) + 4px); width: 42px !important; height: 40px !important; padding: 0 !important; border: none !important; box-shadow: none !important; clip-path: none;
        background: ${u('back')} center / contain no-repeat !important; font-size: 0 !important; color: transparent !important; }
      #pgSet.stl .pgHead .backBtn::after { content: none !important; }
      #pgSet.stl .pgHead .titlePl { position: absolute; left: 50%; transform: translateX(-50%); top: calc(env(safe-area-inset-top) + 46px); width: min(72vw, 300px); height: 52px; box-sizing: border-box; margin: 0; padding: 0 18px;
        display: grid; place-items: center; background: ${u('title')} center / 100% 100% no-repeat !important; border: none !important; box-shadow: none !important; clip-path: none !important;
        font: 800 clamp(17px, 5.6vw, 24px) Georgia, 'Times New Roman', serif !important; color: #f6dfa6 !important; text-shadow: 0 2px 3px #000, 0 0 10px #a050ff !important; }
      #pgSet.stl .pgHead .titlePl::before, #pgSet.stl .pgHead .titlePl::after { display: none !important; }
      #pgSet.stl #setBody { position: absolute !important; left: 0; right: 0; bottom: 0; top: calc(env(safe-area-inset-top) + max(104px, 25cqw)) !important; z-index: 1; padding: 0 0 calc(env(safe-area-inset-bottom) + 3cqw) !important; overflow-y: auto !important; overflow-x: hidden; }
      .st { min-height: 100%; display: flex; flex-direction: column; color: #f3ead8; font-family: Georgia, 'Times New Roman', serif; text-shadow: 0 1px 2px #000; }
      .st button { font-family: inherit; padding: 0; color: inherit; border: none; background: none; }
      /* панель: 18–1005 × 258–1365 */
      .st .sPan { flex: 1; margin: 0 1.9cqw 0 1.8cqw; box-sizing: border-box; border: 4.4cqw solid transparent; border-image: ${u('list')} 45 fill stretch; padding: 0 2.6cqw 1cqw; display: flex; flex-direction: column; }
      .st .sH { position: relative; flex: none; height: 8.6cqw; display: grid; place-items: center; margin: 0.4cqw 0; }
      .st .sH::before { content: ""; position: absolute; left: 0; right: 0; top: 50%; height: 0.25cqw; background: linear-gradient(90deg, #0000, #b070ff 25%, #e0b0ff 50%, #b070ff 75%, #0000); }
      .st .sH span { position: relative; width: 41.8cqw; height: 8.6cqw; background: ${u('hdr')} center / 100% 100% no-repeat; display: flex; align-items: center; justify-content: center; gap: 1.2cqw; font-size: 3.5cqw; font-weight: 800; color: #f6d690; }
      .st .sH img { width: 4.2cqw; height: 4cqw; object-fit: contain; }
      .st .sR { width: 100%; display: flex; align-items: center; flex: 1 0 5.4cqw; max-height: 8cqw; border-bottom: 0.2cqw solid; border-image: linear-gradient(90deg, #0000, #b08050 12%, #b08050 88%, #0000) 1; }
      .st .sR > img { flex: none; width: 5.2cqw; height: 4.6cqw; object-fit: contain; margin: 0 3.3cqw 0 2.4cqw; }
      .st .sR > span { flex: 1; min-width: 0; text-align: left; font-size: 2.9cqw; color: #f3eee8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .st .sR > span small { display: block; font-size: 1.9cqw; color: #c8b8dc; }
      .st .sTg { flex: none; width: 10.7cqw; height: 5.4cqw; margin-right: 1cqw; background: ${u('tg_off')} center / contain no-repeat; }
      .st .sTg.on { background-image: ${u('tg_on')}; }
      .st .sSeg { flex: none; display: flex; gap: 0.8cqw; }
      .st .sSeg button { width: 13.2cqw; height: 4.6cqw; background: ${u('seg')} center / 100% 100% no-repeat; font-size: 2.1cqw; font-weight: 700; color: #f0e4d0; white-space: nowrap; }
      .st .sSeg button.on { background-image: ${u('seg_on')}; color: #fff; text-shadow: 0 0 6px #c070ff, 0 1px 2px #000; }
      .st .sR.go { cursor: pointer; }
      .st .sR .ar { flex: none; width: 2.4cqw; height: 3.4cqw; margin-right: 2.4cqw; background: ${u('arrow')} center / contain no-repeat; }
      .st .sR.lk { opacity: .5; }
      .st .sR.dg { background: ${u('danger')} center / 100% 100% no-repeat; border-bottom-color: transparent; }
      .st .sR.dg > span { color: #ff9a8a; }
      .st .sVer { flex: none; align-self: center; margin-top: 2.4cqw; width: 23cqw; height: 6.2cqw; background: ${u('ver')} center / 100% 100% no-repeat; display: grid; place-items: center; font-size: 2.9cqw; font-weight: 800; color: #f6d690; }
    `;
    document.head.appendChild(css);
  })();
