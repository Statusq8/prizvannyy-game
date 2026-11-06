  // ===================== 0.113: экран Регрессии (ритуала) точь-в-точь по макету пользователя (docs/ui/RITUAL.md, references/ritual_mockup_v1.png 1024×1536) =====================
  // Размеры — доли ширины (1 px макета = 1/1024 ширины). Верх (плашки, «Вы получите», алтарь на фоне) прижат к верху,
  // панели «Будет сброшено / Сохранится» и кнопки — к низу; лишняя высота телефона — тёмный пол между ними.
  (function () {
    const A = /*__REGRESS__*/{};
    if (!A.bg) return;
    window.RG_ART = A;
    const u = n => 'url("' + A[n] + '")';
    const css = document.createElement('style');
    css.textContent = `
      #pgX.rgl { container-type: inline-size; background: #140a20 !important; }
      #pgX.rgl::before, #pgX.rgl::after { display: none !important; }
      /* алтарь (≈510 px от верха фона) — посередине между «Вы получите» (низ 407) и панелями (верх: низ экрана − 656) */
      .rg .rgBg { position: absolute; left: 0; width: 100%; height: 150.00cqw; top: calc((39.75cqw + 100% - 64.06cqw) / 2 - 49.80cqw); background: ${u('bg')} center top / 100% auto no-repeat; }
      #pgX.rgl .tower, #pgX.rgl #xTop, #pgX.rgl .pgHead { display: none !important; }
      #pgX.rgl #xBody { position: absolute; inset: 0; padding: 0 !important; overflow: hidden !important; }
      .rg { position: absolute; inset: 0; color: #f3e6ff; font-family: Georgia, 'Times New Roman', serif; }
      .rg .top { position: absolute; left: 0; right: 0; top: env(safe-area-inset-top); }
      .rg .bot { position: absolute; left: 0; right: 0; bottom: env(safe-area-inset-bottom); height: 66.02cqw; }
      .rg .abs { position: absolute; box-sizing: border-box; }
      .rg .img { background: center / 100% 100% no-repeat; }
      .rg .back { left: 1.17cqw; top: 1.17cqw; width: 10.35cqw; height: 6.64cqw; border: none; background-image: ${u('back')}; }
      .rg .pill { top: 1.76cqw; height: 4.49cqw; display: flex; align-items: center; justify-content: flex-end; padding-right: 5.66cqw; font-size: 2.93cqw; font-weight: 700; color: #fff;
        border-style: solid; border-width: 0 4.69cqw 0 1.17cqw; border-image: ${u('pill')} 0 75 0 20 fill stretch; text-shadow: 0 1px 2px #000; }
      .rg .pill img { position: absolute; left: -2.93cqw; top: 50%; transform: translateY(-50%); width: 4.49cqw; height: 4.49cqw; object-fit: contain; }
      .rg .p1 { left: 54.69cqw; width: 20.02cqw; } .rg .p2 { left: 78.71cqw; width: 19.53cqw; }
      .rg .title { left: 16.11cqw; top: 7.62cqw; width: 67.87cqw; height: 13.67cqw; display: grid; place-items: center; padding-top: 0.78cqw; background-image: ${u('title')};
        font-size: 4.49cqw; font-weight: 700; color: #f6dfa6; text-shadow: 0 2px 3px #000, 0 0 10px #a050ff; }
      .rg .panel { left: 7.03cqw; top: 23.93cqw; width: 85.94cqw; height: 15.82cqw; background-image: ${u('panel')}; }
      .rg .hdr { left: 28.32cqw; top: 21.29cqw; width: 43.46cqw; height: 5.66cqw; display: grid; place-items: center; background-image: ${u('hdr')}; font-size: 3.32cqw; font-weight: 700; color: #f3e6c8; text-shadow: 0 1px 2px #000; }
      .rg .gain { left: 11.72cqw; top: 27.54cqw; height: 9.77cqw; display: flex; align-items: center; gap: 1.17cqw; }
      .rg .gain img { width: 8.59cqw; height: 9.77cqw; object-fit: contain; }
      .rg .gain b { font-size: 5.66cqw; color: #fff; text-shadow: 0 2px 3px #000; } .rg .gain span { font-size: 3.12cqw; align-self: flex-end; margin-bottom: 1.76cqw; }
      .rg .sep { left: 55.86cqw; top: 29.10cqw; width: 0.20cqw; height: 7.62cqw; background: #6a4a88; }
      .rg .bon { left: 57.42cqw; top: 27.54cqw; width: 32.23cqw; text-align: center; }
      .rg .bon .t { font-size: 2.73cqw; margin-top: 0.39cqw; } .rg .bon .v { font-size: 3.91cqw; font-weight: 700; margin-top: 0.98cqw; white-space: nowrap; }
      .rg .bon .v i { font-style: normal; color: #9aa0ff; margin: 0 0.98cqw; } .rg .bon .v em { font-style: normal; color: #7dff6a; }
      .rg .box { background-image: var(--fr); }
      .rg .boxR { left: 5.08cqw; top: 1.95cqw; width: 43.75cqw; height: 33.20cqw; --fr: ${u('panel_red')}; }
      .rg .boxG { left: 50.98cqw; top: 1.95cqw; width: 43.95cqw; height: 33.20cqw; --fr: ${u('panel_green')}; }
      .rg .hR, .rg .hG { top: 0.39cqw; height: 5.47cqw; display: grid; place-items: center; font-size: 3.12cqw; font-weight: 700; text-shadow: 0 1px 2px #000; }
      .rg .hR { left: 9.28cqw; width: 37.11cqw; background-image: ${u('hdr_red')}; color: #ffb0a0; }
      .rg .hG { left: 54.69cqw; width: 36.62cqw; background-image: ${u('hdr_green')}; color: #d8ffc8; }
      .rg .rows { display: flex; flex-direction: column; }
      .rg .rowsR { left: 7.62cqw; top: 7.62cqw; width: 39.06cqw; } .rg .rowsG { left: 53.52cqw; top: 6.84cqw; width: 39.45cqw; }
      .rg .row { display: flex; align-items: center; border-bottom: 1px solid #ffffff14; }
      .rg .rowsR .row { height: 8.20cqw; } .rg .rowsG .row { height: 6.45cqw; } .rg .row:last-child { border-bottom: none; }
      .rg .row .ic { flex: none; width: 8.20cqw; height: 5.86cqw; display: grid; place-items: center; position: relative; }
      .rg .row .ic img { max-width: 100%; max-height: 100%; object-fit: contain; }
      .rg .row .ic b { position: absolute; font-size: 2.15cqw; color: #f6dfa6; }
      .rg .row .tx { flex: 1; padding-left: 1.76cqw; font-size: 2.73cqw; line-height: 1.1; } .rg .rowsG .row .tx { font-size: 2.44cqw; }
      .rg .row .tx small { display: block; font-size: 1.95cqw; color: #cbbbe0; }
      .rg .row .mk { flex: none; width: 4.10cqw; height: 4.10cqw; object-fit: contain; margin-right: 1.37cqw; }
      .rg .btn { top: 38.57cqw; height: 19.04cqw; border: none; padding: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.39cqw;
        color: #fff; text-shadow: 0 2px 3px #000; }
      .rg .btn b { font-size: 3.71cqw; } .rg .btn span { font-size: 2.93cqw; display: flex; align-items: center; gap: 0.78cqw; } .rg .btn span img { width: 3.91cqw; height: 3.91cqw; object-fit: contain; }
      .rg .bD { left: 5.37cqw; width: 43.46cqw; background-image: ${u('btn_dark')}; }
      .rg .bL { left: 50.78cqw; width: 44.43cqw; background-image: ${u('btn_light')}; }
      .rg .bL b, .rg .bL span { color: #fff8e0; text-shadow: 0 2px 3px #5a3000, 0 0 6px #000; }
      .rg .btn:disabled { filter: grayscale(.75) brightness(.7); }
      .rg .btn:not(:disabled):active { transform: scale(.97); }
      .rg .badge { left: 85.74cqw; top: 37.70cqw; width: 10.55cqw; height: 8.20cqw; display: grid; place-items: center; background-image: ${u('badge')}; font-size: 4.10cqw; font-weight: 700; color: #fff3c8; text-shadow: 0 2px 2px #600; pointer-events: none; }
    `;
    document.head.appendChild(css);
  })();
