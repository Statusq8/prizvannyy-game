  // ===================== 0.130: сюжетный свиток на экране боя по макету пользователя (docs/ui/STORY_SCROLL.md, references/story_scroll_mockup_v1.png) =====================
  // Перекрывает старые стили #questPanel (ui3.css); разметка — renderQuest в ui4.js.
  (function () {
    const A = /*__SCROLL__*/{};
    if (!A.scroll) return;
    const Q = window.QS_ART || {}, T = window.TT_ART || {};
    const css = document.createElement('style');
    css.textContent = `
      #questPanel { width: 150px !important; right: 4px !important; }
      #questPanel .qBox { position: relative; width: 150px; min-height: 210px; box-sizing: border-box; padding: 34px 22px 62px 24px !important; border: none !important; border-radius: 0 !important; box-shadow: none !important;
        background: url("${A.scroll}") center top / 100% 100% no-repeat !important; font-family: Georgia, 'Times New Roman', serif; }
      #questPanel .qT { position: absolute; left: 36px; top: 26px; width: 74px; height: 22px; display: grid; place-items: center; background: url("${A.hdr}") center / 100% 100% no-repeat;
        font: 800 12px Georgia, serif !important; letter-spacing: 0 !important; color: #f6d690 !important; text-shadow: 0 1px 2px #000; }
      #questPanel .qMin { left: auto !important; right: 14px !important; top: 26px !important; width: 22px !important; height: 22px !important; background: url("${A.minus}") center / contain no-repeat !important; font-size: 0 !important; color: transparent !important; z-index: 2; }
      #questPanel .qTxt { margin: 22px 0 6px !important; text-align: center; font: 700 12px/1.2 Georgia, serif !important; color: #2a1608 !important; text-shadow: none; }
      #questPanel .qR { text-align: center; font: 600 10px Georgia, serif !important; color: #5a3a1a !important; }
      #questPanel .qClaim { width: 100% !important; height: 30px !important; border: none !important; border-radius: 0 !important; background: url("${T.gbtn || ''}") center / 100% 100% no-repeat !important;
        font: 800 11px Georgia, serif !important; color: #3a1e00 !important; text-shadow: 0 1px 0 #ffe7a0; }
      #questPanel .qNext { margin-top: 7px !important; padding-top: 5px !important; border-top: 1px solid #7a5a3a !important; text-align: center; font: 700 10px/1.2 Georgia, serif !important; color: #3a2416 !important; }
      #questPanel .qFold { width: 44px !important; height: 82px !important; background: url("${A.rolled}") center / contain no-repeat !important; }
      #questPanel .qFold img { display: none; }
      #questPanel .qDot { right: -2px !important; top: 2px !important; background: radial-gradient(circle at 35% 30%, #ff9a9a, #e01020 55%, #700) !important; box-shadow: 0 0 0 2px #c89a5a; }
    `;
    document.head.appendChild(css);
  })();
