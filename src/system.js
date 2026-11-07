  // ===================== 0.129: системные окна («Голос Башни») и тосты по макету пользователя (docs/ui/SYSTEM.md, references/system_mockup_v1.png 1024×1536) =====================
  // Перекрывает старые стили #sysOv/.sysWin/.sysBtn/.sysIn/#toast (ui3.css). Размеры — доли ширины экрана (vw), окно фиксировано по экрану.
  (function () {
    const A = /*__SYSTEM__*/{};
    if (!A.win) return;
    window.SY_ART = A;
    const T = window.TT_ART || {};
    const u = (n, src) => 'url("' + (src || A)[n] + '")';
    const css = document.createElement('style');
    css.textContent = `
      #sysOv { padding: 0 !important; background: #05030dcc !important; }
      #sysOv .sysWin { position: relative; width: min(80vw, 420px) !important; max-height: none !important; overflow: visible !important; box-sizing: border-box; margin-top: 15vw;
        padding: 9vw 5vw 4.6vw !important; border: 5.5vw solid transparent !important; border-image: ${u('win')} 60 stretch !important; border-radius: 0 !important; box-shadow: none !important;
        background: url("${A.tower}") center bottom 13.5vw / 74% auto no-repeat, linear-gradient(#2a1240, #170a28) !important; background-clip: padding-box !important; background-origin: padding-box !important;
        color: #f3eee8 !important; font-family: Georgia, 'Times New Roman', serif; text-shadow: 0 1px 2px #000; }
      #sysOv .sysWin > * { position: relative; }
      /* глаз и плашка «СИСТЕМА» над окном */
      #sysOv .sysWin::before { content: "СИСТЕМА"; position: absolute; left: 50%; top: -14.5vw; transform: translateX(-50%); width: 48vw; height: 15.5vw; margin: 0 !important; padding: 0 0 0.6vw !important; border: none !important; box-sizing: border-box;
        background: ${u('title')} center / 100% 100% no-repeat; display: grid; place-items: center; font: 800 5.2vw Georgia, 'Times New Roman', serif !important; letter-spacing: 0.3vw !important; color: #f6d690 !important;
        text-shadow: 0 2px 3px #000, 0 0 10px #a050ff !important; z-index: 2; }
      #sysOv .sysWin::after { content: ""; position: absolute; left: 50%; top: -29vw; width: 26vw; height: 25vw; margin-left: -13vw; background: ${u('eye')} center / contain no-repeat; z-index: 1; pointer-events: none; }
      #sysOv .sysWin.glitch { animation: sysIn .28s steps(4, end), glitch .25s steps(2) .3s 2; }
      #sysOv h3 { display: flex; align-items: center; gap: 2vw; margin: 0.6vw 0 2.4vw !important; font: 700 3.1vw Georgia, 'Times New Roman', serif !important; color: #f6d690 !important; text-shadow: 0 1px 2px #000 !important; letter-spacing: 0.1vw; }
      #sysOv h3::before, #sysOv h3::after { content: ""; flex: 1; height: 0.25vw; background: linear-gradient(90deg, #0000, #c8a060); }
      #sysOv h3::after { background: linear-gradient(90deg, #c8a060, #0000); }
      #sysOv p { font-size: 3.6vw !important; line-height: 1.3 !important; color: #f3eee8; margin: 1vw 0 !important; }
      #sysOv .sysIn { height: 10vw !important; margin-top: 3vw !important; box-sizing: border-box; border: 2.2vw solid transparent !important; border-image: ${u('input')} 30 fill stretch !important; background: none !important;
        border-radius: 0 !important; color: #fff !important; font: 600 4vw Georgia, serif !important; outline: none; }
      #sysOv textarea.sysIn { height: 30vw !important; }
      #sysOv .btns { gap: 4vw !important; margin-top: 20vw !important; flex-wrap: nowrap !important; }
      #sysOv .sysBtn { flex: 1; min-width: 0 !important; max-width: 34vw; height: 11vw !important; padding: 0 2.6vw !important; box-sizing: border-box; border-radius: 0 !important; border: none !important; box-shadow: none !important;
        background: ${T.vbtn ? 'url("' + T.vbtn + '")' : 'none'} center / 100% 100% no-repeat !important; font: 800 4.6vw Georgia, 'Times New Roman', serif !important; color: #f3e6d0 !important; text-shadow: 0 1px 2px #000 !important; }
      #sysOv .sysBtn:last-child:not(.red) { background-image: ${T.gbtn ? 'url("' + T.gbtn + '")' : 'none'} !important; color: #3a1e00 !important; text-shadow: 0 1px 0 #ffe7a0 !important; }
      #sysOv .sysBtn:only-child { max-width: 44vw; }
      #sysOv .sysBtn.red { background-image: ${u('red')} !important; color: #fff !important; }
      #sysOv .sysBtn:not(:disabled):active { transform: scale(.96); }
      /* 0.136: обычные всплывающие окна — та же рамка «Системы», но без глаза и плашки (решение 07.11: окна в одном стиле) */
      #ui2Pop .box, #modalBox, .askWrap .askBox { position: relative; width: min(84vw, 440px) !important; max-width: none !important; max-height: 86vh; overflow-y: auto; box-sizing: border-box;
        padding: 4vw 4.4vw 4.4vw !important; border: 5.5vw solid transparent !important; border-image: ${u('win')} 60 fill stretch !important; border-radius: 0 !important; box-shadow: none !important;
        background: none !important; color: #f3eee8 !important; font-family: Georgia, 'Times New Roman', serif; text-shadow: 0 1px 2px #000; text-align: center; }
      .askWrap .askBox::before, .askWrap .askBox::after { content: none !important; display: none !important; }
      #ui2Pop .box .big { width: 21vw; height: 21vw; margin: 0 auto 1vw; display: grid; place-items: center; font-size: 12vw !important; line-height: 1; border-radius: 50%;
        background: radial-gradient(circle, var(--rg, #b14dff66) 0%, #0000 68%); }
      #ui2Pop .box .big img { max-width: 100%; max-height: 100%; }
      #ui2Pop h3, #modalBox h3, .askWrap .askBox #awayTitle { display: flex; align-items: center; justify-content: center; gap: 2vw; margin: 0.6vw 0 2.4vw !important; font: 700 4.4vw Georgia, 'Times New Roman', serif !important; color: #f6d690 !important; text-shadow: 0 1px 2px #000 !important; }
      #ui2Pop h3::before, #ui2Pop h3::after, #modalBox h3::before, #modalBox h3::after { content: ""; flex: 1; max-width: 16vw; height: 0.25vw; background: linear-gradient(90deg, #0000, #c8a060); }
      #ui2Pop h3::after, #modalBox h3::after { background: linear-gradient(90deg, #c8a060, #0000); }
      #ui2Pop p, #modalBox p, .askWrap .askBox p { font: 400 3.6vw/1.3 Georgia, 'Times New Roman', serif !important; color: #f3eee8 !important; margin: 1vw 0 2.6vw !important; }
      #ui2Pop .row, .askWrap .askBtns { display: flex; gap: 3vw !important; justify-content: center; flex-wrap: wrap; margin-top: 3vw; }
      #ui2Pop .row .upBtn, #modalBox .mBtn, .askWrap .mBtn { flex: 1 1 30%; width: auto !important; min-width: 0; max-width: 36vw; height: 11vw !important; min-height: 0 !important; margin: 0 !important; padding: 0 2vw !important;
        border: none !important; border-radius: 0 !important; box-shadow: none !important; background: ${T.vbtn ? 'url("' + T.vbtn + '")' : 'linear-gradient(#5a3a8a, #2a1a4a)'} center / 100% 100% no-repeat !important;
        font: 800 3.8vw Georgia, 'Times New Roman', serif !important; color: #f3e6d0 !important; text-shadow: 0 1px 2px #000 !important; }
      #modalBox .mBtn { max-width: none; margin-top: 2vw !important; width: 100% !important; }
      #ui2Pop .row .upBtn:not(.alt), .askWrap #awayOk { background-image: ${T.gbtn ? 'url("' + T.gbtn + '")' : 'none'} !important; color: #3a1e00 !important; text-shadow: 0 1px 0 #ffe7a0 !important; }
      .askWrap #awayOk { width: 60% !important; max-width: none; margin-top: 3vw !important; }
      #ui2Pop .row .upBtn.red, #modalBox .mBtn.danger, .askWrap .mBtn.danger { background-image: ${u('red')} !important; color: #fff !important; text-shadow: 0 1px 2px #000 !important; }
      #ui2Pop .row .upBtn:active, #modalBox .mBtn:active, .askWrap .mBtn:active { transform: scale(.96); }
      #ui2Pop .bakRow { margin: 2vw 0; padding: 2.4vw; border: 1px solid #c8a06055; background: #0006; text-align: left; }
      #ui2Pop .bakRow b { font: 700 3.4vw Georgia, serif; color: #f6d690; }
      #ui2Pop .bakRow p { margin: 0.6vw 0 1.6vw !important; font-size: 3.2vw !important; }
      #ui2Pop .bakRow .upBtn { height: 9vw !important; max-width: none !important; background-image: ${T.gbtn ? 'url("' + T.gbtn + '")' : 'none'} !important; color: #3a1e00 !important; text-shadow: 0 1px 0 #ffe7a0 !important; font: 800 3.4vw Georgia, 'Times New Roman', serif !important; }
      #ui2Pop .row .upBtn[data-pclose] { background-image: ${T.vbtn ? 'url("' + T.vbtn + '")' : 'none'} !important; color: #f3e6d0 !important; text-shadow: 0 1px 2px #000 !important; }
      #ui2Pop.show .box, .askWrap.show .askBox { animation: uWinIn .22s ease-out; }
      @keyframes uWinIn { from { transform: scale(.9); opacity: 0; } to { transform: none; opacity: 1; } }
      /* тост: круглая иконка слева, золотой заголовок, строка ниже */
      body.clean #toast { top: calc(env(safe-area-inset-top) + 58px) !important; width: min(62vw, 340px); min-height: 14vw; max-width: none !important; box-sizing: border-box; padding: 2vw 3vw 2vw 15.5vw !important;
        border: none !important; border-radius: 0 !important; box-shadow: none !important; background: url("${A.chest}") 3.6vw center / 8vw auto no-repeat, url("${A.toast}") center / 100% 100% no-repeat !important;
        display: flex; flex-direction: column; justify-content: center; text-align: left !important; font: 800 3.6vw Georgia, 'Times New Roman', serif !important; color: #f6d690 !important; text-shadow: 0 1px 2px #000 !important; }
      body.clean #toast small { margin-top: 0.6vw !important; font: 400 3vw Georgia, serif !important; color: #f3eee8 !important; }
    `;
    document.head.appendChild(css);

    // 0.137: страницы без своего макета (PvE, Древо душ, Карта Башни) — в стиле Настроек (решение 07.11): фон, «Назад», плашка заголовка, шапки разделов, карточки в рамке, кнопки-картинки
    const S = window.ST_ART, PF = window.PF_ART || {}, RG = window.RG_ART || {};
    if (S) {
      const v = n => 'url("' + (S[n] || PF[n] || RG[n] || A[n]) + '")';
      const pm = $id => { const e = document.getElementById($id); if (e) e.classList.add('uni'); };
      pm('pgMap');
      const c2 = document.createElement('style');
      c2.textContent = `
        .pg.uni { background: #1c033d ${S.bg_top ? 'url("' + S.bg_top + '") center top / 100% auto no-repeat' : ''} !important; }
        .pg.uni::before { display: none !important; }
        .pg.uni::after { content: ""; display: block !important; position: absolute; left: 0; right: 0; bottom: 0; height: 24vw; background: ${v('bg_bot')} center bottom / 100% auto no-repeat; pointer-events: none; z-index: 0; }
        .pg.uni > * { position: relative; z-index: 1; }
        .pg.uni .tower { display: none !important; }
        .pg.uni .pgHead { background: none !important; border: none !important; box-shadow: none !important; min-height: 56px; }
        .pg.uni .pgHead .backBtn { width: 42px !important; height: 40px !important; padding: 0 !important; border: none !important; box-shadow: none !important; clip-path: none !important;
          background: ${v('back')} center / contain no-repeat !important; font-size: 0 !important; color: transparent !important; }
        .pg.uni .pgHead .backBtn::after, .pg.uni .pgHead .titlePl::before, .pg.uni .pgHead .titlePl::after { display: none !important; content: none !important; }
        .pg.uni .pgHead .titlePl { flex: 0 1 min(64vw, 280px); margin: 0 auto; height: 50px; line-height: 50px; padding: 0 18px; box-sizing: border-box; background: ${v('title')} center / 100% 100% no-repeat !important; border: none !important; box-shadow: none !important; clip-path: none !important;
          font: 800 clamp(16px, 5.2vw, 22px)/50px Georgia, 'Times New Roman', serif !important; color: #f6dfa6 !important; text-shadow: 0 2px 3px #000, 0 0 10px #a050ff !important; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pg.uni .pgHead .chip { font-family: Georgia, serif; }
        .pg.uni .pgHead::after { content: ""; flex: none; width: 42px; }
        .pg.uni .pgHead:has(.chip:not([style*="none"]))::after { display: none; }
        /* шапки разделов — как «Звук», «Графика» в Настройках */
        .pg.uni .secT { display: flex; align-items: center; gap: 2.4vw; margin: 3.4vw 0 1.8vw; padding: 0; font: 700 3.3vw Georgia, 'Times New Roman', serif; letter-spacing: 0; text-transform: none; color: #f6d690; text-shadow: 0 1px 2px #000, 0 0 8px #a050ff; text-align: center; }
        .pg.uni .secT::before, .pg.uni .secT::after { content: ""; flex: 1 1 6vw; min-width: 4vw; height: 0.3vw; background: linear-gradient(90deg, #0000, #b070ff 40%, #e0b0ff); }
        .pg.uni .secT::after { background: linear-gradient(90deg, #e0b0ff, #b070ff 60%, #0000); }
        /* карточки — в рамке длинной панели Настроек */
        .pg.uni .pveCard { border: 3vw solid transparent !important; border-image: ${v('list')} 45 fill stretch !important; border-radius: 0 !important; background: none !important; box-shadow: none !important; padding: 0.6vw 1vw !important; margin-bottom: 1.4vw !important; }
        .pg.uni .pveCard .ic { border-radius: 50% !important; border: 0.5vw solid #c8a060 !important; background: radial-gradient(circle at 40% 35%, #5a2a8a, #12061f) !important; box-shadow: 0 0 8px #a050ff88; }
        .pg.uni .pveCard b { font: 700 3.5vw Georgia, 'Times New Roman', serif !important; color: #f6d690 !important; text-shadow: 0 1px 2px #000; }
        .pg.uni .pveCard p { font: 400 2.9vw/1.3 Georgia, 'Times New Roman', serif !important; color: #f3eee8 !important; }
        /* Карта Башни: этажи — карточки в той же рамке, оттенок биома поверх */
        .pg.uni .fRoom { margin: 0 1.6vw 1.2vw; border: 3.6vw solid transparent !important; border-image: ${v('list')} 45 fill stretch !important; padding: 0 1.6vw 1vw !important; background: none !important; box-shadow: none !important; }
        .pg.uni .fRoom::before { left: 0; right: 0; top: 0; bottom: 0; background: linear-gradient(hsla(var(--bh, 270), 50%, 30%, .28), hsla(var(--bh, 270), 50%, 10%, .1)); }
        .pg.uni .fRoom.cur { box-shadow: 0 0 0 0.4vw #ffd36b, 0 0 18px #d6a640aa !important; }
        .pg.uni .fRoom .no { font: 700 4.2vw Georgia, 'Times New Roman', serif !important; color: #f3eee8; }
        .pg.uni .fRoom.cur .no { color: #f6d690; }
        .pg.uni .fRoom.done .no { color: #b9a8cc; }
        .pg.uni .fRoom .st { font: 400 2.8vw Georgia, serif !important; color: #e0d4ee; }
        .pg.uni .fRoom .zone { font: 700 3.2vw Georgia, serif !important; color: #f6d690 !important; }
        .pg.uni .mapInfo { font: 700 3.6vw Georgia, 'Times New Roman', serif !important; color: #f6d690 !important; }
        /* старые вкладки (Награды, События, Сезон, Статистика…) — та же кожа */
        body.clean.oldOpen #pgOld { height: calc(env(safe-area-inset-top) + 62px) !important; background: #1c033d ${S.bg_top ? 'url("' + S.bg_top + '") center top / 100% auto no-repeat' : ''} !important; box-shadow: 0 2px 10px #000a !important; }
        body.clean.oldOpen #pgOld .pgHead { background: none !important; border: none !important; box-shadow: none !important; }
        body.clean.oldOpen #pgOld .backBtn { width: 42px !important; height: 40px !important; padding: 0 !important; border: none !important; box-shadow: none !important; clip-path: none !important;
          background: ${v('back')} center / contain no-repeat !important; font-size: 0 !important; color: transparent !important; }
        body.clean.oldOpen #pgOld .backBtn::after, body.clean.oldOpen #pgOld .titlePl::before, body.clean.oldOpen #pgOld .titlePl::after { display: none !important; content: none !important; }
        body.clean.oldOpen #pgOld .pgHead::after { content: ""; flex: none; width: 42px; }
        body.clean.oldOpen #pgOld .titlePl { flex: 0 1 min(64vw, 280px); margin: 0 auto; height: 50px; line-height: 50px; padding: 0 18px; box-sizing: border-box; background: ${v('title')} center / 100% 100% no-repeat !important; border: none !important; box-shadow: none !important; clip-path: none !important;
          font: 800 clamp(15px, 5vw, 21px)/50px Georgia, 'Times New Roman', serif !important; color: #f6dfa6 !important; text-shadow: 0 2px 3px #000, 0 0 10px #a050ff !important; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        body.clean.oldOpen #panel { top: calc(env(safe-area-inset-top) + 62px) !important; background: ${v('bg_bot')} center bottom / 100% auto no-repeat, linear-gradient(#1c033d, #12022a) !important; font-family: Georgia, 'Times New Roman', serif; }
        body.clean.oldOpen #panel .secTitle { display: flex; align-items: center; gap: 2.4vw; margin: 3.4vw 0 1.8vw !important; font: 700 3.3vw Georgia, 'Times New Roman', serif !important; letter-spacing: 0 !important; text-transform: none !important; color: #f6d690 !important; text-shadow: 0 1px 2px #000, 0 0 8px #a050ff !important; }
        body.clean.oldOpen #panel .secTitle::before, body.clean.oldOpen #panel .secTitle::after { content: ""; flex: 1 1 6vw; min-width: 4vw; height: 0.3vw; background: linear-gradient(90deg, #0000, #b070ff 40%, #e0b0ff); }
        body.clean.oldOpen #panel .secTitle::after { background: linear-gradient(90deg, #e0b0ff, #b070ff 60%, #0000); }
        body.clean.oldOpen #panel .hRow { border: 2.6vw solid transparent !important; border-image: ${v('list')} 45 fill stretch !important; border-radius: 0 !important; background: none !important; box-shadow: none !important; padding: 0.4vw 1vw !important; }
        body.clean.oldOpen #panel .hRow + .hRow { margin-top: 1vw !important; }
        body.clean.oldOpen #panel .hName { font-family: Georgia, 'Times New Roman', serif; color: #f6d690 !important; text-shadow: 0 1px 2px #000 !important; }
        body.clean.oldOpen #panel .hSub, body.clean.oldOpen #panel .hint2, body.clean.oldOpen #panel .hint3 { font-family: Georgia, 'Times New Roman', serif; color: #e6dcf2 !important; }
        body.clean.oldOpen #panel .hBtn, body.clean.oldOpen #panel .pBtn { border: none !important; border-radius: 0 !important; box-shadow: none !important; background: ${T.vbtn ? 'url("' + T.vbtn + '")' : 'none'} center / 100% 100% no-repeat !important; font-family: Georgia, 'Times New Roman', serif !important; color: #f3e6d0 !important; text-shadow: 0 1px 2px #000 !important; }
        body.clean.oldOpen #panel .hBtn.go { background-image: ${A.red ? 'url("' + A.red + '")' : 'none'} !important; color: #fff !important; }
        body.clean.oldOpen #panel .claimAll { border: none !important; border-radius: 0 !important; box-shadow: none !important; background: ${T.gbtn ? 'url("' + T.gbtn + '")' : 'none'} center / 100% 100% no-repeat !important; font: 800 4.2vw Georgia, 'Times New Roman', serif !important; color: #3a1e00 !important; text-shadow: 0 1px 0 #ffe7a0 !important; }
        body.clean.oldOpen #panel .claimAll:disabled { filter: grayscale(.9) brightness(.6); }
        .pg.uni .upBtn { border: none !important; border-radius: 0 !important; box-shadow: none !important; clip-path: none !important; background: ${A.red ? 'url("' + A.red + '")' : 'none'} center / 100% 100% no-repeat !important;
          font: 800 3.6vw Georgia, 'Times New Roman', serif !important; color: #fff !important; text-shadow: 0 1px 2px #000 !important; }
        .pg.uni .upBtn.alt { background-image: ${T.vbtn ? 'url("' + T.vbtn + '")' : 'none'} !important; color: #f3e6d0 !important; }
        .pg.uni .upBtn:disabled { filter: grayscale(.8) brightness(.7); }
        .pg.uni .upBtn:not(:disabled):active { transform: scale(.95); }
      `;
      document.head.appendChild(c2);
    }
  })();
