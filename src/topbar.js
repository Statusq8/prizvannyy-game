  // ===================== 0.115: единая верхняя полоса для Портала, Кузницы, Рынка и Регрессии =====================
  // Одна кнопка «назад» (квадрат), одинаковые плашки ресурсов справа сверху, заголовок по центру экрана и всегда
  // помещается в свою плашку. Подключается последним — перекрывает размеры из portal/forge/market/regress.js.
  (function () {
    const M = window.MK_ART || {}, R = window.RG_ART || {}, P = window.PT_ART || {};
    const back = R.back || P.back, pill = M.pill;
    if (!back || !pill) return;
    const X = s => ['ptl', 'fgl', 'mkl', 'rgl', 'qsl', 'hsl', 'cll', 'dyl'].map(k => '#pgX.' + k + ' ' + s).join(', ');
    const css = document.createElement('style');
    css.textContent = `
      ${X('#xTop')} { position: absolute !important; z-index: 6; top: calc(env(safe-area-inset-top) + 8px) !important; right: 8px !important; left: auto !important;
        display: flex !important; gap: 8px; padding: 0 !important; min-height: 0 !important; height: 32px; }
      .resPill { position: relative; height: 32px; width: 112px; box-sizing: border-box; display: flex; align-items: center; justify-content: flex-end;
        border-style: solid; border-width: 0 30px 0 10px; border-image: url("${pill}") 0 75 0 22 fill stretch; padding: 0 6px 0 22px;
        font: 800 15px Georgia, 'Times New Roman', serif; color: #fff3d8; text-shadow: 0 1px 2px #000; white-space: nowrap; }
      .resPill img, .resPill i { position: absolute; left: -16px; top: 50%; transform: translateY(-50%); width: 30px; height: 30px; object-fit: contain; font-style: normal; font-size: 20px; text-align: center; line-height: 30px; }
      .resPill b { overflow: hidden; text-overflow: ellipsis; }
      ${X('.pgHead')} { position: absolute !important; z-index: 6; top: calc(env(safe-area-inset-top) + 4px) !important; left: 8px !important; right: auto !important;
        height: 40px; display: flex !important; align-items: center; gap: 6px; padding: 0 !important; margin: 0 !important; background: none !important; }
      ${X('.pgHead .backBtn')} { flex: none; width: 42px !important; height: 40px !important; padding: 0 !important; clip-path: none; border: none !important; box-shadow: none !important;
        background: url("${back}") center / contain no-repeat !important; font-size: 0 !important; color: transparent !important; }
      ${X('.pgHead .backBtn::after')} { content: none !important; display: none !important; }
      ${X('#xTitle')} { position: fixed !important; left: 50% !important; transform: translateX(-50%); top: calc(env(safe-area-inset-top) + 46px) !important;
        width: min(72vw, 300px) !important; height: 52px !important; max-height: none !important; margin: 0 !important; padding: 0 18px !important; box-sizing: border-box;
        display: grid !important; place-items: center; line-height: 1 !important; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        background-size: 100% 100% !important; background-position: center !important; font-size: clamp(15px, 5vw, 21px) !important; }
      #pgX.rgl #xTitle { display: none !important; }
      #pgX.mkl #xTitle { height: 66px !important; padding-top: 18px !important; top: calc(env(safe-area-inset-top) + 38px) !important; }
      #pgX.ptl #xAux { width: 44px !important; height: 38px !important; padding: 0 !important; font-size: 0 !important; color: transparent !important; background-size: auto 100% !important; background-position: left center !important; overflow: hidden; border-radius: 6px; }
      #pgX.ptl #ptQ { width: 36px !important; height: 36px !important; }
      #pgX.ptl #xBody, #pgX.fgl #xBody { padding-top: calc(env(safe-area-inset-top) + 102px) !important; }
      #pgX.ptl .ptOdds { top: calc(env(safe-area-inset-top) + 106px); }
      #pgX.mkl #xBody { top: calc(env(safe-area-inset-top) + 100px) !important; }
      #pgX.rgl .rg .top { top: calc(env(safe-area-inset-top) + 8px); }
      /* Кузница: «Обновить» в родных пропорциях картинки */
      #pgX.fgl .fgRef { width: 58%; height: auto; aspect-ratio: 414 / 134; padding-left: 17%; font-size: 15px; }
    `;
    document.head.appendChild(css);
  })();
