  // ===================== 0.127: Дневник призванного точь-в-точь по макету пользователя (docs/ui/DIARY.md, references/diary_mockup_v1.png 1024×1536) =====================
  // Вкладки, ряд медальонов биомов, пергаментная страница (карточки врагов листаются внутри), внизу — книга на столе (фон).
  (function () {
    const A = /*__DIARY__*/{};
    if (!A.bg_top) return;
    window.DY_ART = A;
    const Q = window.QS_ART || {};
    const u = n => 'url("' + (A[n] || Q[n] || (window.RG_ART || {})[n]) + '")';
    const hb = (n, s, H, h, s2) => `height: ${h}cqw; box-sizing: border-box; border-style: solid; border-width: 0 ${(s2 || s) * h / H}cqw 0 ${s * h / H}cqw; border-image: ${u(n)} 0 ${s2 || s} 0 ${s} fill stretch; background: none;`;
    const css = document.createElement('style');
    css.textContent = `
      #pgX.dyl { container-type: inline-size; background: #1f013f url("${A.bg_top}") center top / 100% auto no-repeat !important; }
      #pgX.dyl::before { display: none !important; }
      #pgX.dyl::after { content: ""; display: block !important; position: absolute; left: 0; right: 0; bottom: 0; height: 34.8cqw; background: url("${A.bg_bot}") center bottom / 100% auto no-repeat; pointer-events: none; z-index: 0; }
      #pgX.dyl .tower { display: none !important; }
      #pgX.dyl #xTitle { background: ${u('title')} center / 100% 100% no-repeat !important; border: none !important; box-shadow: none !important;
        font: 800 clamp(17px, 5.6vw, 24px) Georgia, 'Times New Roman', serif !important; color: #f6dfa6 !important; text-shadow: 0 2px 3px #000, 0 0 10px #a050ff !important; }
      #pgX.dyl #xTitle::before, #pgX.dyl #xTitle::after { display: none !important; }
      #pgX.dyl #xBody { position: absolute !important; left: 0; right: 0; bottom: 0; top: calc(env(safe-area-inset-top) + max(104px, 25cqw)) !important; z-index: 1; padding: 0 !important; overflow: hidden !important; }
      .dy { position: absolute; inset: 0; display: flex; flex-direction: column; color: #f3ead8; font-family: Georgia, 'Times New Roman', serif; text-shadow: 0 1px 2px #000; padding-bottom: calc(env(safe-area-inset-bottom) + 21cqw); box-sizing: border-box; }
      .dy button { font-family: inherit; padding: 0; color: inherit; border: none; background: none; }
      /* вкладки: 118–498, 525–898 × 155–232 */
      .dy .dTabs { flex: none; display: grid; grid-template-columns: 1fr 1fr; gap: 2.6cqw; margin: 0 9.9cqw 0 11.5cqw; }
      .dy .dTab { ${hb('tab', 40, 89, 7.5)} display: flex; align-items: center; justify-content: center; gap: 1.6cqw; font-size: 3.3cqw; font-weight: 800; color: #f0dfc0; }
      .dy .dTab.on { ${hb('tab_on', 40, 111, 8.4)} color: #ffe9a0; }
      .dy .dTab img { width: 4.6cqw; height: 4.6cqw; object-fit: contain; }
      /* медальоны: центры шагом 13.2cqw, стрелки по краям */
      .dy .dMed { flex: none; position: relative; height: 13cqw; margin-top: 1.6cqw; display: flex; align-items: center; justify-content: center; gap: 2cqw; }
      .dy .dAr { position: absolute; top: 50%; width: 3.4cqw; height: 6.5cqw; margin-top: -3.25cqw; background: ${u('arrow')} center / contain no-repeat; }
      .dy .dAr.l { left: 4.9cqw; } .dy .dAr.r { right: 4.9cqw; transform: scaleX(-1); }
      .dy .dM { position: relative; flex: none; width: 11cqw; height: 11cqw; }
      .dy .dM.on { width: 12.7cqw; height: 12.7cqw; }
      .dy .dM i { position: absolute; inset: 14%; border-radius: 50%; background-size: cover; background-position: center 60%; }
      .dy .dM.lk i { filter: grayscale(1) brightness(.35) !important; }
      .dy .dM b { position: absolute; inset: 0; background: ${u('med')} center / contain no-repeat; }
      .dy .dM.on b { background-image: ${u('med_on')}; }
      .dy .dM .ok { position: absolute; right: -0.4cqw; bottom: -0.2cqw; width: 4cqw; height: 4cqw; object-fit: contain; }
      /* страница: 30–1000 × 385–1300 */
      .dy .dPage { flex: 1; min-height: 0; margin: 0.8cqw 2.3cqw 0 2.9cqw; box-sizing: border-box; border: 4cqw solid transparent; border-image: ${u('page')} 40 fill stretch; padding: 0 0.4cqw 1cqw; display: flex; flex-direction: column; }
      .dy .dHd { flex: none; align-self: center; margin-top: -1.4cqw; ${hb('hdr', 60, 97, 6.4)} padding: 0 1cqw !important; display: grid; place-items: center; font-size: 3.3cqw; font-weight: 800; color: #f6dfa6; white-space: nowrap; min-width: 40cqw; }
      .dy .dPan { flex: none; position: relative; margin-top: 1.4cqw; height: 11.2cqw; box-sizing: border-box; border: 2.8cqw solid transparent; border-image: ${u('panel')} 36 fill stretch; display: flex; align-items: center; }
      .dy .dPan > img { flex: none; width: 10cqw; height: 9.4cqw; object-fit: contain; margin: 0 1cqw 0 -1.6cqw; }
      .dy .dPr { flex: 1; min-width: 0; }
      .dy .dPr small { display: block; font-size: 2.6cqw; color: #f6dfa6; }
      .dy .dBar { position: relative; margin-top: 0.8cqw; ${hb('bar', 20, 40, 2.6)} }
      .dy .dBar i { position: absolute; left: -1.3cqw; top: 0; bottom: 0; ${hb('bar_fill', 20, 43, 2.6)} min-width: 3cqw; }
      .dy .dRw { flex: none; margin-left: 1.6cqw; ${hb('rplate', 30, 90, 7)} display: flex; align-items: center; gap: 1cqw; padding: 0 0.4cqw !important; font-size: 2.7cqw; font-weight: 700; white-space: nowrap; }
      .dy .dRw img { width: 3.8cqw; height: 3.8cqw; object-fit: contain; }
      .dy .dRw em { font-style: normal; margin-left: 0.6cqw; ${hb('gbtn', 30, 101, 5.4)} padding: 0 0.6cqw !important; display: grid; place-items: center; font-size: 2.2cqw; color: #3a1e00; min-width: 15cqw; text-shadow: 0 1px 0 #ffe7a0; }
      .dy .dRw em.got { filter: grayscale(.5) brightness(.9); }
      .dy .dGrid { flex: 1; min-height: 0; overflow-y: auto; margin-top: 1.8cqw; padding: 2.4cqw 1cqw 1cqw; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); column-gap: 3cqw; row-gap: 2.6cqw; align-content: start; }
      /* карточка: 265×300 */
      .dy .dC { position: relative; aspect-ratio: 265 / 300; }
      .dy .dC .pic { position: absolute; left: 6%; right: 6%; top: 5%; bottom: 5%; border-radius: 0.6cqw; background: radial-gradient(#3a2058, #120820) ; overflow: hidden; }
      .dy .dC .pic i { position: absolute; left: 50%; bottom: 26%; width: 120%; height: 120%; transform: translateX(-50%); background-repeat: no-repeat; }
      .dy .dC .pic img { position: absolute; left: 50%; top: 38%; width: 72%; height: 60%; transform: translate(-50%, -50%); object-fit: contain; }
      .dy .dC .fr { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
      .dy .dC .nm { position: absolute; left: 4%; right: 4%; bottom: 19%; height: 4cqw; background: ${u('nplate')} center / 100% 100% no-repeat; display: grid; place-items: center; font-size: 2.15cqw; font-weight: 700; color: #f3e6d0; white-space: nowrap; overflow: hidden; padding: 0 1cqw; box-sizing: border-box; }
      .dy .dC .ct { position: absolute; left: 0; right: 0; bottom: 6%; line-height: 1; display: flex; align-items: center; justify-content: center; gap: 0.8cqw; font-size: 2.3cqw; font-weight: 700; }
      .dy .dC .ct img { width: 2.6cqw; height: 2.8cqw; object-fit: contain; }
      .dy .dC .rb { position: absolute; right: -2.6cqw; top: -1.2cqw; width: 14cqw; height: 9.6cqw; background: ${u('ribbon')} center / contain no-repeat; transform: rotate(18deg); display: grid; place-items: center; padding-bottom: 1.8cqw; box-sizing: border-box;
        font-size: 2.2cqw; font-weight: 800; color: #3a1e00; text-shadow: 0 1px 0 #ffe7a0; }
      .dy .dC .cr { position: absolute; left: 50%; top: -4.6cqw; width: 9.4cqw; height: 6.6cqw; margin-left: -4.7cqw; background: ${u('crown')} center / contain no-repeat; }
      .dy .dC.lk .pic img { filter: none; }
      .dy .dC.boss .nm { color: #ffe29a; }
      /* вкладка «Герои» */
      .dy .dH { display: flex; gap: 2.4cqw; align-items: flex-start; grid-column: 1 / -1; padding-bottom: 1.6cqw; border-bottom: 0.2cqw solid #7a5a3a80; }
      .dy .dH .dC { flex: none; width: 19cqw; }
      .dy .dH .tx { flex: 1; min-width: 0; color: #2a1a10; text-shadow: none; }
      .dy .dH .tx b { display: block; font-size: 3.1cqw; color: #4a1a6a; }
      .dy .dH .tx small { display: block; font-size: 2.2cqw; color: #5a4030; margin: 0.4cqw 0 0.8cqw; }
      .dy .dH .tx q { display: block; font-style: italic; font-size: 2.4cqw; color: #3a2416; }
      .dy .dH .tx p { margin: 0.8cqw 0 0; font-size: 2.2cqw; line-height: 1.25; color: #2a1a10; }
      .dy .dNote { grid-column: 1 / -1; text-align: center; font-size: 2.5cqw; color: #3a2416; text-shadow: none; }
    `;
    document.head.appendChild(css);
  })();
