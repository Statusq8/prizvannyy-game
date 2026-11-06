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
      /* валюты сверху */
      body.hqV1 #sTop { justify-content: center; gap: 8px; }
      body.hqV1 #sTop .cur { width: 150px; height: 34px; padding: 0 12px 0 40px; border: none !important; border-radius: 0; box-shadow: none !important; justify-content: flex-end;
        background: ${u('res_crystal')} center / 100% 100% no-repeat !important; font: 800 15px system-ui; color: #fff; text-shadow: 0 1px 2px #000; }
      body.hqV1 #sTop .cur.g { background-image: ${u('res_gold')} !important; color: #ffe2a0; }
      body.hqV1 #sTop .cur i, body.hqV1 #sTop .cur .plus { display: none !important; }
      /* вкладки — картинки пакета */
      body.hqV1 #sTabs { justify-content: center; }
      body.hqV1 #sTabs button { flex: 0 0 84px !important; height: 66px !important; border: none !important; box-shadow: none !important; background: center / contain no-repeat !important; border-radius: 0; }
      body.hqV1 #sTabs button > * { display: none !important; }
      body.hqV1 #sTabs button[data-st="up"] { background-image: ${u('tab_upgrade_normal')} !important; } body.hqV1 #sTabs button[data-st="up"].on { background-image: ${u('tab_upgrade_selected')} !important; }
      body.hqV1 #sTabs button[data-st="art"] { background-image: ${u('tab_artifacts_normal')} !important; } body.hqV1 #sTabs button[data-st="art"].on { background-image: ${u('tab_artifacts_selected')} !important; }
      body.hqV1 #sTabs button[data-st="bag"] { background-image: ${u('tab_bag_normal')} !important; } body.hqV1 #sTabs button[data-st="bag"].on { background-image: ${u('tab_bag_selected')} !important; }
      body.hqV1 #sTabs button[data-st="pets"] { background-image: ${u('tab_pets_normal')} !important; } body.hqV1 #sTabs button[data-st="pets"].on { background-image: ${u('tab_pets_selected')} !important; }
      /* назад и заголовок */
      body.hqV1 #pgSec .pgHead { align-items: center; gap: 6px; padding: 2px 8px 6px; }
      body.hqV1 #pgSec .backBtn { width: 56px; height: 34px; clip-path: none; border: none !important; box-shadow: none !important; background: ${u('nav_back')} center / contain no-repeat !important; font-size: 0 !important; color: transparent !important; }
      body.hqV1 #pgSec #sTitle { height: 40px; line-height: 38px; border: none !important; box-shadow: none !important; clip-path: none !important; background: ${u('nav_title')} center / contain no-repeat !important; color: transparent !important; text-shadow: none !important; }
      body.hqV1 #pgSec #sTitle::before, body.hqV1 #pgSec #sTitle::after { display: none !important; }
      body.hqV1 #pgSec #secHelp { display: none; }
      /* ×1 ×10 ×100 MAX */
      .hqQty { position: relative; width: 210px; margin: 0 0 8px auto; }
      .hqQty img { width: 100%; display: block; }
      .hqQty button { position: absolute; top: 8%; bottom: 8%; width: 23.5%; background: none; border: none; border-radius: 4px; padding: 0; }
      .hqQty button.on { box-shadow: inset 0 0 0 2px #ffe08a, 0 0 10px #ffd04a; background: #ffd04a22; }
      /* карточки */
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
    `;
    document.head.appendChild(css);
  })();
