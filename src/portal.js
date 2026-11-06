  // ===================== 0.86: Портал по макету пользователя (docs/ui/PORTAL.md; детали — tools/portalcut.py → assets/portal) =====================
  (function () {
    const A = /*__PORTAL__*/{};
    if (!A.bg) return;
    window.PT_ART = A;
    const u = n => 'url("' + A[n] + '")';
    const head = document.querySelector('#pgX .pgHead');
    const q = document.createElement('button'); q.id = 'ptQ'; q.setAttribute('aria-label', 'Справка'); head.appendChild(q);
    q.addEventListener('click', () => { window.U2.click(); window.U3.sys({ title: 'ПОРТАЛ', text: 'Билеты дают случайного героя: билеты — за первое прохождение этажей. ×10 — десять призывов сразу. Полоса — гарантия S и выше. Внизу стрелками меняется баннер. Рецепты особых героев падают с мега-боссов (каждые 50 этажей).' }); });
    const css = document.createElement('style');
    css.textContent = `
      #pgX.ptl { background: #120a24 ${u('bg')} center top / cover no-repeat !important; }
      #pgX.ptl .tower::before, #pgX.ptl .tower::after { display: none !important; }
      #ptQ { display: none; }
      #pgX.ptl #ptQ { display: block; flex: none; width: 40px; height: 40px; border: none; background: ${u('q')} center / contain no-repeat; }
      #pgX.ptl #xTop { justify-content: flex-end; padding: calc(env(safe-area-inset-top) + 6px) 8px 0 !important; min-height: 0 !important; }
      #pgX.ptl #xTop .cur { display: none; }
      #pgX.ptl .ptTk { height: 36px; min-width: 120px; padding: 0 14px 0 52px; display: flex; align-items: center; justify-content: flex-end; background: ${u('pill')} center / 100% 100% no-repeat; font: 800 18px Georgia, 'Times New Roman', serif; color: #ffe6a0; text-shadow: 0 1px 2px #000; box-sizing: border-box; }
      #pgX.ptl .pgHead { display: flex; align-items: center; gap: 6px; padding: 4px 8px 4px !important; }
      #pgX.ptl .pgHead .backBtn { flex: none; width: 58px; height: 42px; clip-path: none; border: none !important; box-shadow: none !important; background: ${u('back')} center / contain no-repeat !important; font-size: 0 !important; color: transparent !important; }
      #pgX.ptl #xTitle { flex: 1; height: 46px; line-height: 46px; padding: 0 !important; display: grid !important; place-items: center; margin: 0 !important; border: none !important; box-shadow: none !important; clip-path: none !important; background: ${u('title')} center / contain no-repeat !important; font: 800 17px Georgia, 'Times New Roman', serif !important; color: #f6e6c4 !important; text-shadow: 0 1px 2px #000, 0 0 8px #b14dff !important; }
      #pgX.ptl #xTitle::before, #pgX.ptl #xTitle::after { display: none !important; }
      #pgX.ptl #xAux { flex: none; width: 96px; height: 38px; padding: 0 8px 0 34px; border: none !important; box-shadow: none !important; border-radius: 0; background: ${u('hist')} center / 100% 100% no-repeat !important; font: 700 12px Georgia, serif !important; color: #e8dcf6 !important; }
      #pgX.ptl #xAux::first-letter { font-size: 0; }
      #pgX.ptl #xBody { display: flex; flex-direction: column; padding: 0 8px calc(env(safe-area-inset-bottom) + 8px) !important; position: relative; }
      .ptTabs { display: flex; justify-content: center; gap: 6px; }
      .ptTabs button { width: 130px; height: 44px; border: none; background: ${u('tab')} center / 100% 100% no-repeat; font: 800 15px Georgia, 'Times New Roman', serif; color: #cbbbe0; text-shadow: 0 1px 2px #000; }
      .ptTabs button.on { background-image: ${u('tab_on')}; color: #ffe6a0; }
      .ptOdds { position: absolute; right: 6px; top: 56px; width: 138px; padding: 26px 14px 24px; background: ${u('panel')} center / 100% 100% no-repeat; box-sizing: border-box; }
      .ptOdds h4 { margin: 0 0 6px; text-align: center; font: 700 11px Georgia, serif; white-space: nowrap; color: #f3dcb0; }
      .ptOdds .r { display: flex; align-items: center; justify-content: space-between; height: 20px; font: 700 12px system-ui; color: #fff; text-shadow: 0 1px 2px #000; }
      .ptOdds .r.off { opacity: .45; }
      .ptOdds .r i { font-style: normal; min-width: 30px; text-align: center; padding: 0 3px; border-radius: 4px; font: 800 11px Georgia, serif; color: var(--rc, #fff); border: 1px solid var(--rc, #888); background: #0a060ecc; }
      .ptLow { margin-top: auto; }
      .ptPT { text-align: center; font: 700 15px Georgia, 'Times New Roman', serif; color: #f6e6c4; text-shadow: 0 1px 3px #000; }
      .ptPT b { font-size: 22px; color: #ffd36b; }
      .ptPity { display: flex; align-items: center; gap: 4px; margin: 2px 0 8px; }
      .ptInfo { flex: none; width: 32px; height: 32px; border: none; background: ${u('info')} center / contain no-repeat; }
      .ptBar { position: relative; flex: 1; height: 34px; background: ${u('bar')} center / 100% 100% no-repeat; }
      .ptBar i { position: absolute; left: 6%; top: 33%; bottom: 33%; max-width: 88%; background: ${u('fill')} left center / 100% 100% no-repeat; }
      .ptBar i { width: calc(var(--w) * .88); }
      .ptBar b { position: absolute; inset: 0; display: grid; place-items: center; font: 800 14px Georgia, serif; color: #fff; text-shadow: 0 1px 2px #000, 0 0 4px #000; }
      .ptMedal { flex: none; width: 52px; height: 46px; display: grid; place-items: center; background: ${u('medal')} center / contain no-repeat; font: 900 22px Georgia, serif; color: #ffd36b; text-shadow: 0 1px 2px #000; }
      .ptPull { display: flex; gap: 6px; }
      .ptBtn { flex: 1; height: 76px; border: none; padding: 10px 0 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; background: center / 100% 100% no-repeat; }
      .ptBtn.blue { background-image: ${u('btn_blue')}; } .ptBtn.gold { background-image: ${u('btn_gold')}; }
      .ptBtn b { font: 800 17px Georgia, 'Times New Roman', serif; color: #f6e6c4; text-shadow: 0 1px 2px #000; }
      .ptBtn span { display: flex; align-items: center; gap: 4px; padding: 1px 12px; border-radius: 6px; background: #0a060ecc; font: 800 15px Georgia, serif; color: #fff; }
      .ptBtn span img { width: 22px; }
      .ptBtn:disabled { filter: grayscale(.7) brightness(.7); }
      .ptBtn:not(:disabled):active { transform: scale(.95); }
      .ptNo { margin: 6px auto 0; width: fit-content; padding: 4px 16px; border-radius: 8px; border: 1px solid #6a4a8a; background: #0a060ecc; font: 600 13px Georgia, serif; color: #e8dcf6; display: flex; align-items: center; gap: 8px; }
      .ptNo i { font-style: normal; width: 18px; height: 18px; border-radius: 50%; display: grid; place-items: center; background: #e8dcf6; color: #2a1446; font: 900 12px system-ui; }
      .ptNo.hid { visibility: hidden; }
      .ptBan { position: relative; display: flex; align-items: center; margin-top: 8px; height: 100px; background: ${u('banner')} center / 100% 100% no-repeat; }
      .ptArr { flex: none; width: 30px; height: 46px; border: none; background: center / contain no-repeat; margin: 0 4px; }
      .ptArr.l { background-image: ${u('arr_l')}; } .ptArr.r { background-image: ${u('arr_r')}; }
      .ptBanIn { flex: 1; min-width: 0; text-align: center; }
      .ptBanIn b { display: block; font: italic 800 17px Georgia, 'Times New Roman', serif; color: #ffd86a; text-shadow: 0 1px 2px #000, 0 0 8px #b14dff; }
      .ptBanIn span { display: block; margin-top: 2px; font: 600 11px system-ui; color: #d8c8ec; line-height: 1.25; }
      .ptDots { display: flex; justify-content: center; gap: 6px; margin-top: 4px; }
      .ptDots i { width: 7px; height: 7px; transform: rotate(45deg); border: 1px solid #c9a0ff; }
      .ptDots i.on { background: #ffd86a; border-color: #ffd86a; }
      .ptRec { margin-top: 30vh; padding: 16px; border-radius: 10px; background: #0a060ed8; border: 1px solid #6a4a8a; text-align: center; color: #e8dcf6; font: 500 14px/1.4 system-ui; }
      .ptRec b { font: 800 17px Georgia, serif; color: #ffe6a0; }
      .ptRec .soon { color: #ffd36b; font-weight: 800; }
    `;
    document.head.appendChild(css);
  })();
