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
  })();
