  // ===================== 0.103: Рынок по макету пользователя (docs/ui/MARKET.md, references/market_mockup_v1.png; детали — tools/marketcut.py → assets/market) =====================
  (function () {
    const A = /*__MARKET__*/{};
    if (!A.bg) return;
    window.MK_ART = A;
    const u = n => 'url("' + A[n] + '")';
    const css = document.createElement('style');
    css.textContent = `
      #pgX.mkl { background: #0e0c22 ${u('bg')} center top / cover no-repeat !important; }
      #pgX.mkl .tower { display: none !important; }
      #pgX.mkl #xTop { justify-content: flex-end; gap: 6px; padding: calc(env(safe-area-inset-top) + 6px) 8px 0 !important; min-height: 0 !important; }
      #pgX.mkl #xTop .cur { display: none; }
      .mkPill { position: relative; height: 30px; min-width: 112px; padding: 0 34px 0 34px; display: flex; align-items: center; justify-content: flex-end; box-sizing: border-box;
        background: ${u('pill')} center / 100% 100% no-repeat; font: 800 15px Georgia, 'Times New Roman', serif; color: #fff3d8; text-shadow: 0 1px 2px #000; }
      .mkPill img { position: absolute; left: -2px; top: 50%; transform: translateY(-50%); width: 32px; height: 32px; object-fit: contain; }
      #pgX.mkl .pgHead { display: flex; align-items: center; gap: 6px; padding: 2px 8px 0 !important; }
      #pgX.mkl .pgHead .backBtn { flex: none; width: 92px; height: 36px; clip-path: none; border: none !important; box-shadow: none !important; padding-left: 26px;
        background: ${u('back')} center / contain no-repeat !important; font-size: 0 !important; }
      #pgX.mkl .pgHead .backBtn::after { content: "Назад"; font: 700 14px Georgia, serif; color: #f3e6c8; }
      #pgX.mkl #xTitle { flex: 1; height: 62px; padding: 18px 0 0 !important; display: grid !important; place-items: center; margin: 0 98px 0 0 !important; border: none !important; box-shadow: none !important;
        background: ${u('title')} center / contain no-repeat !important; font: 800 24px Georgia, 'Times New Roman', serif !important; color: #ffd98a !important; text-shadow: 0 2px 3px #000, 0 0 10px #c08020 !important; box-sizing: border-box; }
      #pgX.mkl #xTitle::before, #pgX.mkl #xTitle::after { display: none !important; }
      #pgX.mkl #xBody { display: flex; flex-direction: column; padding: 0 8px calc(env(safe-area-inset-bottom) + 10px) !important; }
      #pgX.mkl .mkTime { flex: none; width: 88%; height: 34px; margin: 6px auto 10px; padding-left: 38px; white-space: nowrap; box-sizing: border-box; display: flex; align-items: center; justify-content: center; gap: 6px;
        background: ${u('timer')} center / 100% 100% no-repeat; font: 700 13px Georgia, serif; color: #e8dcf6; }
      #pgX.mkl .mkTime b { color: #fff; }
      #pgX.mkl .mkGrid { flex: none; gap: 6px; }
      #pgX.mkl .mkCard { aspect-ratio: 260 / 351; min-height: 0; padding: 6% 7% 7%; border: none; border-radius: 0; box-shadow: none !important; box-sizing: border-box;
        background: ${u('card')} center / 100% 100% no-repeat; gap: 0; }
      #pgX.mkl .mkCard.sold { opacity: 1; background-image: ${u('card_sold')}; filter: grayscale(1) brightness(.85); }
      #pgX.mkl .mkNm { order: -1; min-height: 0; height: 18%; font: 700 10.5px Georgia, serif; color: #f3e6c8; white-space: nowrap; overflow: hidden; }
      #pgX.mkl .mkIc { width: 70%; height: auto; aspect-ratio: 1; background: none; border: none; overflow: visible; margin-top: 2%; }
      #pgX.mkl .mkIc > img { width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 2px 4px #000); }
      #pgX.mkl .mkIc.hero { background: ${u('icon_fr')} center / 100% 100% no-repeat; padding: 9%; box-sizing: border-box; }
      #pgX.mkl .mkIc.hero > img, #pgX.mkl .mkIc.hero > svg { border-radius: 4px; object-fit: cover; }
      #pgX.mkl .mkN { flex: 1; display: grid; place-items: center; font: 700 13px Georgia, serif; color: #fff; text-shadow: 0 1px 2px #000; }
      #pgX.mkl .mkBuy { height: 19%; padding: 0 4px 0 22px; position: relative; border-radius: 0; background: ${u('btn_gold')} center / 100% 100% no-repeat; font: 800 12px Georgia, serif; }
      #pgX.mkl .mkCard.cr .mkBuy { background-image: ${u('btn_blue')}; }
      #pgX.mkl .mkBuy:disabled { filter: none; background-image: ${u('btn_grey')} !important; color: #ddd; }
      #pgX.mkl .mkBuy img { position: absolute; left: 6%; top: 50%; transform: translateY(-50%); width: 22px; height: 22px; object-fit: contain; }
      #pgX.mkl .mkSold { position: absolute; left: -6%; right: -6%; top: 46%; height: 17%; display: grid; place-items: center; transform: rotate(-8deg);
        background: ${u('ribbon')} center / 100% 100% no-repeat; font: 800 13px Georgia, serif; color: #e8e8e8; text-shadow: 0 1px 2px #000; padding: 0; }
      #pgX.mkl .mkRef { flex: none; width: 60%; height: 64px; margin: auto 2% 0 auto; padding: 0 0 0 54px; border: none; border-radius: 0; background: ${u('refresh')} center / 100% 100% no-repeat;
        font: 800 18px Georgia, serif; color: #fff; text-shadow: 0 1px 3px #000; display: flex; align-items: center; justify-content: center; gap: 6px; }
      #pgX.mkl .mkRef img { width: 24px; height: 24px; object-fit: contain; }
      #pgX.mkl .mkRef:disabled { filter: grayscale(.6) brightness(.7); opacity: 1; }
      #pgX.mkl .mkNote { flex: none; margin: 6px 2% 0 auto; width: 60%; text-align: center; font: 600 11px system-ui; color: #b8a8d0; }

      /* 0.104: «точь-в-точь как макет» (references/market_mockup_v1.png, 1055×1491): все размеры — доли ширины экрана (1 px макета = 1/1055 ширины).
         Экран выше макета: верх фона прижат к верху, торговец и «Обновить» — к низу, лишняя высота — тёмная середина. */
      #pgX.mkl { container-type: inline-size; background: #16203b url("${A.bg_top}") center top / 100% auto no-repeat !important; }
      #pgX.mkl::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 57.91cqw; background: url("${A.bg_bot}") center bottom / 100% auto no-repeat; pointer-events: none; z-index: 0; }
      #pgX.mkl .tower { display: none !important; }
      #pgX.mkl #xTop { position: absolute; z-index: 2; top: calc(env(safe-area-inset-top) + 0.76cqw); right: 1.33cqw; left: auto; display: flex; gap: 2.46cqw; padding: 0 !important; min-height: 0 !important; }
      #pgX.mkl #xTop .cur { display: none; }
      #pgX.mkl .mkPill { height: 4.93cqw; min-width: 0; padding: 0 5.88cqw 0 6.07cqw; font-size: 2.84cqw; }
      #pgX.mkl .mkPill:first-child { width: 22.37cqw; } #pgX.mkl .mkPill:last-child { width: 19.53cqw; }
      #pgX.mkl .mkPill img { width: 5.12cqw; height: 5.12cqw; left: -0.38cqw; }
      #pgX.mkl .pgHead { position: absolute; z-index: 2; left: 0; right: 0; top: calc(env(safe-area-inset-top) + 5.50cqw); height: 15.17cqw; padding: 0 !important; display: block !important; }
      #pgX.mkl .pgHead .backBtn { position: absolute; left: 2.37cqw; top: 4.45cqw; width: 16.30cqw; height: 6.45cqw; padding: 0 0 0 6.64cqw; }
      #pgX.mkl .pgHead .backBtn::after { font-size: 2.84cqw; }
      #pgX.mkl #xTitle { position: absolute; left: 24.83cqw; width: 50.24cqw; top: 0; height: 14.98cqw; margin: 0 !important; padding: 4.36cqw 0 0 !important;
        font-size: 5.31cqw !important; letter-spacing: .5px; }
      #pgX.mkl #xAux { display: none !important; }
      #pgX.mkl #xBody { position: absolute; z-index: 1; left: 0; right: 0; top: calc(env(safe-area-inset-top) + 21.61cqw); bottom: 0; display: block; padding: 0 !important; overflow: hidden auto; }
      #pgX.mkl .mkTime { width: 45.88cqw; height: 6.07cqw; margin: 0 0 0 27.30cqw; padding: 0 0 0 5.69cqw; font-size: 2.65cqw; gap: 1.14cqw; }
      #pgX.mkl .mkGrid { margin: 7.58cqw 3.13cqw 0; gap: 1.99cqw 1.71cqw; }
      #pgX.mkl .mkCard { aspect-ratio: 234 / 340; padding: 1.33cqw 1.14cqw 1.33cqw; }
      #pgX.mkl .mkNm { height: 4.17cqw; font-size: 2.18cqw; font-weight: 600; }
      #pgX.mkl .mkIc { width: 16.11cqw; margin-top: 1.33cqw; }
      #pgX.mkl .mkN { font-size: 2.65cqw; font-weight: 500; }
      #pgX.mkl .mkBuy { width: 19.91cqw; height: 6.45cqw; flex: none; padding: 0 0 0 4.36cqw; font-size: 2.65cqw; font-weight: 600; }
      #pgX.mkl .mkBuy img { width: 3.79cqw; height: 3.79cqw; left: 1.52cqw; }
      #pgX.mkl .mkSold { font-size: 2.84cqw; }
      #pgX.mkl .mkRefWrap { position: absolute; z-index: 2; left: 40.76cqw; width: 51.75cqw; bottom: calc(env(safe-area-inset-bottom) + 21.71cqw); height: 9.86cqw; }
      #pgX.mkl .mkRefWrap .mkRef { position: static; width: 100%; height: 100%; margin: 0; padding: 0 0 0 10.43cqw; font-size: 3.79cqw; gap: 2.09cqw; }
      #pgX.mkl .mkRefWrap .mkRef img { width: 4.36cqw; height: 4.36cqw; }
      #pgX.mkl .mkNote { display: none; }

      /* 0.104: края плашек не растягиваются (border-image) — иконки часов, стрелок и «+» как на макете */
      #pgX.mkl .mkTime { background: none; border-style: solid; border-width: 0 2.18cqw 0 6.82cqw; border-image: url("${A.timer}") 0 30 0 92 fill stretch; padding: 0; justify-content: center; }
      #pgX.mkl .mkRefWrap .mkRef { background: none; border-style: solid; border-width: 0 3.03cqw 0 11.56cqw; border-image: url("${A.refresh}") 0 40 0 150 fill stretch; padding: 0; }
      #pgX.mkl .mkPill { background: none; border-style: solid; border-width: 0 4.55cqw 0 1.33cqw; border-image: url("${A.pill}") 0 75 0 22 fill stretch; padding: 0 0.95cqw 0 4.55cqw; justify-content: flex-end; }
      #pgX.mkl .mkPill img { left: -1.71cqw; }
      #pgX.mkl .pgHead .backBtn { display: flex !important; align-items: center; justify-content: center; padding: 0 0 0 5.31cqw !important; background-size: 100% 100% !important; }
      #pgX.mkl #xTitle { left: 27.68cqw; width: 44.55cqw; top: -0.76cqw; height: 18.20cqw; padding: 6.64cqw 0 0 !important; background-size: contain !important; background-position: center !important; }
      #pgX.mkl #xTitle { display: block !important; line-height: 1 !important; overflow: visible !important; text-align: center; padding: 8.34cqw 0 0 !important; white-space: nowrap; }
      #pgX.mkl #xTitle { position: absolute !important; left: 27.68cqw !important; width: 44.55cqw !important; top: -0.76cqw !important; height: 18.20cqw !important; min-height: 0 !important; max-height: none !important; }
      #pgX.mkl .mkIc .rk, #pgX.mkl .mkIc i { display: none !important; }   /* на макете у карточек нет значков ранга — ранг в строке под иконкой */
      /* 0.107: 4 ряда по 4 без растягивания (решение пользователя): карточки в пропорциях макета, ряды распределены
         по высоте между таймером и «Обновить»; рамка карточки — border-image (узоры не искажаются) */
      #pgX.mkl #xBody { overflow: hidden !important; }
      #pgX.mkl .mkGrid { position: absolute; left: 3.13cqw; right: 3.13cqw; top: 8.91cqw; bottom: calc(env(safe-area-inset-bottom) + 33.84cqw);
        margin: 0; grid-auto-rows: max-content; align-content: space-evenly; gap: 1.33cqw 1.71cqw; }
      #pgX.mkl .mkCard { aspect-ratio: 234 / 340; height: auto; background: none !important; border-style: solid !important; border-width: 5.88cqw 1.52cqw 1.71cqw !important;
        border-image: url("${A.card}") 84 22 24 fill stretch; padding: 0 0 0.38cqw; justify-content: space-between; }
      #pgX.mkl .mkCard.sold { border-image-source: url("${A.card_sold}"); }
      #pgX.mkl .mkNm { position: absolute; top: -5.31cqw; left: 0; right: 0; height: 4.55cqw; }
      #pgX.mkl .mkIc { flex: 1 1 auto; width: auto; max-width: 16.11cqw; aspect-ratio: 1; min-height: 0; margin: 0.57cqw auto 0; }
      #pgX.mkl .mkN { flex: none; height: 3.41cqw; font-size: 2.27cqw; white-space: nowrap; overflow: hidden; }
      #pgX.mkl .mkBuy { align-self: center; }
      #pgX.mkl .mkSold { top: 38%; }
      #pgX.mkl .mkPot { font-size: 10.43cqw; line-height: 1; filter: drop-shadow(0 0 0.95cqw #b060ff); }
      #pgX.mkl .mkIc { overflow: hidden; } #pgX.mkl .mkIc > img { max-height: 100%; } #pgX.mkl .mkIc > img.mkPotI { width: 78%; height: 78%; margin: 11%; }
    `;
    document.head.appendChild(css);
  })();
