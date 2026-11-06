  // ===================== 0.130: сюжетный свиток на экране боя по макету пользователя (docs/ui/STORY_SCROLL.md, references/story_scroll_mockup_v1.png) =====================
  // Перекрывает старые стили #questPanel (ui3.css); разметка — renderQuest в ui4.js.
  (function () {
    const A = /*__SCROLL__*/{};
    if (!A.scroll) return;
    const Q = window.QS_ART || {}, T = window.TT_ART || {};
    const css = document.createElement('style');
    css.textContent = `
      #questPanel { width: 108px !important; right: 2px !important; top: calc(env(safe-area-inset-top) + 92px) !important; }
      #questPanel .qBox { position: relative; width: 108px; min-height: 140px; box-sizing: border-box; padding: 24px 15px 42px 17px !important; border: none !important; border-radius: 0 !important; box-shadow: none !important;
        background: url("${A.scroll}") center top / 100% 100% no-repeat !important; font-family: Georgia, 'Times New Roman', serif; }
      #questPanel .qT { position: absolute; left: 24px; top: 18px; width: 54px; height: 16px; display: grid; place-items: center; background: url("${A.hdr}") center / 100% 100% no-repeat;
        font: 800 9px Georgia, serif !important; letter-spacing: 0 !important; color: #f6d690 !important; text-shadow: 0 1px 2px #000; }
      #questPanel .qMin { left: auto !important; right: 9px !important; top: 18px !important; width: 16px !important; height: 16px !important; background: url("${A.minus}") center / contain no-repeat !important; font-size: 0 !important; color: transparent !important; z-index: 2; }
      #questPanel .qTxt { margin: 14px 0 4px !important; text-align: center; font: 700 9.5px/1.15 Georgia, serif !important; color: #2a1608 !important; text-shadow: none; }
      #questPanel .qR { text-align: center; font: 600 8px Georgia, serif !important; color: #5a3a1a !important; }
      #questPanel .qClaim { width: 100% !important; height: 22px !important; border: none !important; border-radius: 0 !important; background: url("${T.gbtn || ''}") center / 100% 100% no-repeat !important;
        font: 800 9px Georgia, serif !important; color: #3a1e00 !important; text-shadow: 0 1px 0 #ffe7a0; }
      #questPanel .qNext { margin-top: 4px !important; padding-top: 3px !important; border-top: 1px solid #7a5a3a !important; text-align: center; font: 700 8px/1.15 Georgia, serif !important; color: #3a2416 !important; }
      #questPanel .qFold { width: 32px !important; height: 60px !important; background: url("${A.rolled}") center / contain no-repeat !important; }
      #questPanel .qFold img { display: none; }
      #questPanel .qDot { right: -2px !important; top: 2px !important; background: radial-gradient(circle at 35% 30%, #ff9a9a, #e01020 55%, #700) !important; box-shadow: 0 0 0 2px #c89a5a; }
    `;
    document.head.appendChild(css);
  })();
