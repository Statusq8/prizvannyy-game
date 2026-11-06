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
    `;
    document.head.appendChild(css);
  })();
