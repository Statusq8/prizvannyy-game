  // ===================== 0.122: экран «Герои» точь-в-точь по макетам пользователя (docs/ui/HEROES_SCREEN.md, references/heroes_mockup_v1.png, hero_window_mockup_v1.png 1024×1536) =====================
  // Размеры — доли ширины (1 px макета = 0.0977cqw). Плашки тянутся только по ширине (border-image), концы — в родных пропорциях.
  // Панель и фильтры стоят на месте, сетка листается внутри; окно героя — поверх всего экрана.
  (function () {
    const A = /*__HEROES_UI__*/{};
    if (!A.bg_top) return;
    window.HS_ART = A;
    const u = n => 'url("' + A[n] + '")';
    const hb = (n, s, H, h, s2) => `height: ${h}cqw; box-sizing: border-box; border-style: solid; border-width: 0 ${(s2 || s) * h / H}cqw 0 ${s * h / H}cqw; border-image: ${u(n)} 0 ${s2 || s} 0 ${s} fill stretch; background: none;`;
    const css = document.createElement('style');
    css.textContent = `
      #pgX.hsl { container-type: inline-size; background: #08061a url("${A.bg_top}") center top / 100% auto no-repeat !important; }
      #pgX.hsl::before { display: none !important; }
      #pgX.hsl::after { content: ""; display: block !important; position: absolute; left: 0; right: 0; bottom: 0; height: 35cqw; background: url("${A.bg_bot}") center bottom / 100% auto no-repeat; pointer-events: none; z-index: 0; }
      #pgX.hsl .tower { display: none !important; }
      #pgX.hsl #xTitle { background: ${window.RG_ART ? 'url("' + window.RG_ART.title + '")' : 'none'} center / 100% 100% no-repeat !important; border: none !important; box-shadow: none !important;
        font: 800 clamp(17px, 5.6vw, 24px) Georgia, 'Times New Roman', serif !important; color: #f6dfa6 !important; text-shadow: 0 2px 3px #000, 0 0 10px #a050ff !important; }
      #pgX.hsl #xTitle::before, #pgX.hsl #xTitle::after { display: none !important; }
      #pgX.hsl #xBody { position: absolute !important; left: 0; right: 0; bottom: 0; top: calc(env(safe-area-inset-top) + max(100px, 21cqw)) !important; z-index: 1;
        padding: 0 !important; overflow: visible !important; }
      #pgX.hsl.hsw #xBody { z-index: 9; }
      .hs { position: absolute; inset: 0; display: flex; flex-direction: column; color: #f3ead8; font-family: Georgia, 'Times New Roman', serif; text-shadow: 0 1px 2px #000; }
      .hs button { font-family: inherit; padding: 0; color: inherit; border: none; background: none; }
      /* панель: 80–945 × 218–305 */
      .hs .hPan { position: relative; flex: none; margin: 0 5.4cqw 0 7.8cqw; ${hb('panel', 45, 157, 8.5)} display: flex; align-items: center; }
      .hs .hPan .hDmg { flex: 1; display: flex; align-items: center; justify-content: center; gap: 1.6cqw; font-size: 4.2cqw; font-weight: 700; color: #f6e3b0; }
      .hs .hPan img { width: 5.9cqw; height: 5cqw; object-fit: contain; }
      .hs .hPan .hDv { width: 0.2cqw; height: 4.5cqw; background: linear-gradient(#0000, #c89a5a 25%, #c89a5a 75%, #0000); }
      .hs .hPan .hCnt { flex: 1; display: flex; align-items: center; justify-content: center; gap: 1.2cqw; font-size: 3.3cqw; color: #e8d8f8; }
      /* фильтры: центры 87…575 | 693…940, диаметр ≈ 62–75 px */
      .hs .hFlt { flex: none; display: flex; align-items: center; margin: 1.3cqw 2.4cqw 0 4.6cqw; gap: 1.6cqw; }
      .hs .hFb { flex: none; width: 6.3cqw; height: 6.3cqw; display: grid; place-items: center; background: ${u('flt')} center / contain no-repeat; font-size: 3.2cqw; font-weight: 800; }
      .hs .hFb.hOn { width: 7.4cqw; height: 7.4cqw; background-image: ${u('flt_on')}; color: #fff; }
      .hs .hFb.hSd { width: 6.6cqw; height: 6.6cqw; background-size: contain; }
      .hs .hFb.hSd.hOn { filter: drop-shadow(0 0 1.2cqw #d080ff) brightness(1.2); }
      .hs .hFb.hSd:not(.hOn) { opacity: .8; }
      .hs .hSep { flex: none; width: 0.2cqw; height: 5.5cqw; background: #8a6aa0; margin: 0 0.4cqw; }
      .hs .hGrid { flex: 1; min-height: 0; overflow-y: auto; margin-top: 1.6cqw; padding: 1cqw 2.5cqw calc(env(safe-area-inset-bottom) + 4cqw) 3.4cqw;
        display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); column-gap: 1.9cqw; row-gap: 1.3cqw; align-content: start; }
      /* карточка: 175×180 */
      .hs .hsCard { position: relative; aspect-ratio: 175 / 180; }
      .hs .hsCard .hPt { position: absolute; inset: 7%; overflow: hidden; border-radius: 0.6cqw; background: #1a1230 center / cover no-repeat; display: grid; place-items: center; font-size: 8cqw; }
      .hs .hsCard .hPt img { width: 100%; height: 100%; object-fit: cover; object-position: center 12%; }
      .hs .hsCard .hPt::after { content: ""; position: absolute; inset: 0; background: linear-gradient(#0000 55%, #000c); }
      .hs .hsCard.hLock .hPt > * { filter: brightness(0) drop-shadow(0 0 2px #c8a0ff60); opacity: .9; }
      .hs .hsCard.hLock .hPt { background: radial-gradient(#3a2850, #120a1c); }
      .hs .hsCard .hFr { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
      .hs .hsCard .hRk { position: absolute; left: 4%; top: 0; font: italic 800 3.9cqw Georgia, serif; color: var(--rc); text-shadow: 0 0 3px #000, 0 2px 2px #000; }
      .hs .hsCard .hLv { position: absolute; right: 9%; bottom: 21%; font-size: 2.6cqw; font-weight: 700; color: #fff; }
      .hs .hsCard .hSt { position: absolute; left: 0; right: 0; bottom: 7%; display: flex; justify-content: center; align-items: center; gap: 0.1cqw; font-size: 2.2cqw; font-weight: 700; color: #ffd75a; }
      .hs .hsCard .hSt img { width: 2.15cqw; height: 2.15cqw; object-fit: contain; }
      .hs .hsCard .hLk { position: absolute; left: 50%; bottom: 14%; width: 4.4cqw; height: 4.4cqw; margin-left: -2.2cqw; object-fit: contain; filter: grayscale(.4) brightness(.9); }
      .hs .hsCard .hDot { position: absolute; right: -0.8cqw; top: -0.8cqw; width: 3cqw; height: 3cqw; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #ff9a9a, #e01020 55%, #700); box-shadow: 0 0 0 0.3cqw #c89a5a, 0 0 4px #000; }
      .hs .hNone { grid-column: 1 / -1; text-align: center; padding: 6cqw 0; color: #cbb8e8; font-size: 3cqw; }
      /* окно героя: 42–985 × 165–1365, по центру экрана */
      .hs .hWrap { position: absolute; left: 0; right: 0; bottom: calc(-1 * env(safe-area-inset-bottom)); top: calc(-1 * (env(safe-area-inset-top) + max(100px, 21cqw))); background: #05030dcc; z-index: 5; }
      .hs .hWin { position: absolute; left: 4.1cqw; width: 92.1cqw; height: 117.2cqw; top: 50%; transform: translateY(-50%); box-sizing: border-box;
        border-style: solid; border-width: 4.4cqw 2.8cqw 2.8cqw; border-image: ${u('win')} 50 30 30 fill stretch; }
      .hs .hWin .hArt { position: absolute; left: 14%; right: 14%; top: 10.5cqw; bottom: 17cqw; display: flex; align-items: flex-end; justify-content: center; }
      .hs .hWin .hRune { position: absolute; left: 50%; bottom: 14.5cqw; width: 52cqw; margin-left: -26cqw; opacity: .95; }
      .hs .hWin .hArt img { position: relative; max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0 0 2cqw #8030ff80); }
      .hs .hWin .hArt .hEmo { position: relative; font-size: 30cqw; line-height: 1; margin-bottom: 8cqw; }
      .hs .hWin .hNm { position: absolute; left: 15.6cqw; width: 52.2cqw; top: -4.4cqw; height: 8.8cqw; background: ${u('name')} center / 100% 100% no-repeat; display: grid; place-items: center;
        font-size: 4.7cqw; font-weight: 800; color: #f6dfa6; text-shadow: 0 2px 3px #000, 0 0 8px #a050ff; }
      .hs .hWin .hShR, .hs .hWin .hShF { position: absolute; top: -3.3cqw; width: 9.3cqw; height: 10cqw; display: grid; place-items: center; background: center / contain no-repeat; }
      .hs .hWin .hShR { left: 19.6cqw; background-image: ${u('sh_gold')}; font: italic 900 5.4cqw Georgia, serif; color: var(--rc); text-shadow: 0 0 3px #000, 0 2px 2px #000; padding-bottom: 1cqw; box-sizing: border-box; }
      .hs .hWin .hShF { left: 58.2cqw; background-image: ${u('sh_violet')}; }
      .hs .hWin .hShF img { width: 5.6cqw; height: 5.6cqw; border-radius: 50%; margin-bottom: 1cqw; }
      .hs .hWin .hX { position: absolute; right: -1.9cqw; top: -2.4cqw; width: 6.9cqw; height: 6.9cqw; background: ${u('close')} center / contain no-repeat; }
      .hs .hWin .hStars { position: absolute; left: 16.2cqw; width: 53.7cqw; top: 6.6cqw; height: 4.4cqw; background: ${u('stars')} center / 100% 100% no-repeat; display: flex; align-items: center; justify-content: center; gap: 0.15cqw; }
      .hs .hWin .hStars img { width: 2.9cqw; height: 2.9cqw; object-fit: contain; }
      .hs .hWin .hStl { position: absolute; left: 1.4cqw; top: 17.2cqw; display: flex; flex-direction: column; gap: 1.5cqw; z-index: 1; }
      .hs .hWin .hSp { position: relative; width: 21.5cqw; height: 7.8cqw; box-sizing: border-box; padding-left: 7.6cqw; display: flex; flex-direction: column; justify-content: center; background: ${u('stat')} center / 100% 100% no-repeat; }
      .hs .hWin .hSp img, .hs .hWin .hSp .hRkb { position: absolute; left: 1.4cqw; top: 50%; width: 5.4cqw; height: 5.4cqw; transform: translateY(-50%); object-fit: contain; }
      .hs .hWin .hSp .hRkb { display: grid; place-items: center; background: ${u('i_rank')} center / contain no-repeat; font: 800 2.7cqw Georgia, serif; color: #f6dfa6; padding-bottom: 0.5cqw; box-sizing: border-box; }
      .hs .hWin .hSp small { font-size: 2.2cqw; color: #f0e4d0; }
      .hs .hWin .hSp b { font-size: 2.8cqw; color: #f6c860; white-space: nowrap; }
      .hs .hWin .hSp b i { font-style: normal; font-size: 2.1cqw; color: #d8c8a8; }
      .hs .hWin .hBio { position: absolute; right: 0.4cqw; top: 17cqw; width: 22.3cqw; height: 42.7cqw; box-sizing: border-box; padding: 2.4cqw 2cqw; background: ${u('bio')} center / 100% 100% no-repeat; z-index: 1;
        display: flex; flex-direction: column; overflow: hidden; }
      .hs .hWin .hPas { margin: 0 0 1.4cqw; padding: 1cqw 1.2cqw; border-radius: 1.2cqw; background: rgba(255, 200, 90, .12); border: 1px solid rgba(255, 210, 120, .35); font-size: 2.1cqw; line-height: 1.3; color: #f3e6c4; }
      .hs .hWin .hPas b { color: #ffd36b; } .hs .hWin .hPas small { display: block; margin-top: .4cqw; font-size: 1.7cqw; color: #bfae8a; }
      .hs .hWin .hBio h4 { margin: 0 0 1.4cqw; text-align: center; font-size: 2.6cqw; color: #f6dfa6; }
      .hs .hWin .hBio p { margin: 0; font-size: 1.95cqw; line-height: 1.22; color: #eadff4; overflow: hidden; }
      .hs .hWin .hBio q { display: block; margin-top: auto; padding-top: 1.2cqw; text-align: center; font-style: italic; font-size: 1.95cqw; color: #f0d8a0; }
      .hs .hWin .hAr { position: absolute; top: 59cqw; width: 6.8cqw; height: 8.4cqw; background: ${u('arrow')} center / contain no-repeat; z-index: 2; }
      .hs .hWin .hArL { left: -5.3cqw; } .hs .hWin .hArR { right: -5.3cqw; transform: scaleX(-1); }
      .hs .hWin .hBts { position: absolute; left: 0.2cqw; right: 0.2cqw; bottom: 1.2cqw; height: 14.5cqw; display: grid; grid-template-columns: 27.1fr 28.3fr 26.7fr; gap: 1.8cqw; }
      .hs .hWin .hBt { position: relative; ${hb('btn_gold', 40, 210, 14.5)} display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding-top: 2.3cqw !important; gap: 2.3cqw; font-size: 2.85cqw; font-weight: 700; color: #f6dfa6; }
      .hs .hWin .hBt.hV { border-image-source: ${u('btn_violet')}; color: #f3e6ff; }
      .hs .hWin .hBt.hGv { border-image-source: ${u('btn_gv')}; }
      .hs .hWin .hBt span { display: flex; align-items: center; gap: 1cqw; font-size: 2.9cqw; color: #fff; }
      .hs .hWin .hBt span img { width: 4.2cqw; height: 4.2cqw; object-fit: contain; border-radius: 0.6cqw; }
      .hs .hWin .hBt span em { font-style: normal; color: #ff5a5a; } .hs .hWin .hBt span em.ok { color: #7dff6a; }
      .hs .hWin .hBt small { position: absolute; left: 0; right: 0; bottom: -3.4cqw; text-align: center; font-size: 2cqw; color: #cbb8e8; font-weight: 400; }
      .hs .hWin .hBt:disabled { filter: grayscale(.55) brightness(.75); }
      .hs .hWin .hBt:not(:disabled):active { transform: scale(.96); }
      .hs .hWin .hBt .hRd { position: absolute; right: -0.6cqw; top: -0.6cqw; width: 2.8cqw; height: 2.8cqw; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #ff9a9a, #e01020 55%, #700); box-shadow: 0 0 0 0.3cqw #c89a5a; }
    `;
    document.head.appendChild(css);
  })();
