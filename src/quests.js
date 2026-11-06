  // ===================== 0.118: экран Заданий точь-в-точь по макету пользователя (docs/ui/QUESTS.md, references/quests_mockup_v1.png, quests_login_mockup_v1.png 1024×1536) =====================
  // Размеры — доли ширины (1 px макета = 1/1024 ширины = 0.0977cqw). Плашки тянутся только по ширине через border-image
  // (концы в родных пропорциях). Фон: доска сверху, пол снизу, между ними — ровный тёмный цвет.
  (function () {
    const A = /*__QUESTS__*/{};
    if (!A.bg_top) return;
    window.QS_ART = A;
    const R = window.RG_ART || {}, M = window.MK_ART || {};
    const u = n => 'url("' + (A[n] || M[n] || R[n]) + '")';
    // плашка высотой h (cqw), картинка W×H, по бокам нетянущиеся куски шириной s px картинки
    const hb = (n, s, H, h, s2) => `height: ${h}cqw; box-sizing: border-box; border-style: solid; border-width: 0 ${(s2 || s) * h / H}cqw 0 ${s * h / H}cqw; border-image: ${u(n)} 0 ${s2 || s} 0 ${s} fill stretch; background: none;`;
    const css = document.createElement('style');
    css.textContent = `
      #pgX.qsl { container-type: inline-size; background: #17142c url("${A.bg_top}") center top / 100% auto no-repeat !important; }
      #pgX.qsl::before { display: none !important; }
      #pgX.qsl::after { content: ""; display: block !important; position: absolute; left: 0; right: 0; bottom: 0; height: 27.93cqw; background: url("${A.bg_bot}") center bottom / 100% auto no-repeat; pointer-events: none; z-index: 0; }
      #pgX.qsl .tower { display: none !important; }
      #pgX.qsl #xTitle { background: ${u('title')} center / 100% 100% no-repeat !important; border: none !important; box-shadow: none !important;
        font: 800 clamp(17px, 5.6vw, 24px) Georgia, 'Times New Roman', serif !important; color: #f6dfa6 !important; text-shadow: 0 2px 3px #000, 0 0 10px #a050ff !important; }
      #pgX.qsl #xTitle::before, #pgX.qsl #xTitle::after { display: none !important; }
      #pgX.qsl #xBody { position: absolute !important; left: 0; right: 0; bottom: 0; top: calc(env(safe-area-inset-top) + max(110px, 26cqw)) !important; z-index: 1;
        padding: 0 !important; overflow-y: auto !important; overflow-x: hidden; }
      .qs { min-height: 100%; box-sizing: border-box; display: flex; flex-direction: column; padding: 0 0 calc(env(safe-area-inset-bottom) + 2.5cqw);
        color: #f3ead8; font-family: Georgia, 'Times New Roman', serif; text-shadow: 0 1px 2px #000; }
      .qs button { font-family: inherit; padding: 0; color: inherit; }
      /* вкладки: 45–275, 287–510, 522–755, 765–985 по x; 232–303 по y */
      .qs .tabs { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1.17cqw; margin: 0.8cqw 3.8cqw 0 4.4cqw; align-items: center; }
      .qs .tab { position: relative; ${hb('tab', 40, 104, 6.93)} font-size: 3.2cqw; font-weight: 700; color: #f0dfc0; white-space: nowrap; }
      .qs .tab.on { ${hb('tab_on', 40, 123, 7.9)} color: #fff; text-shadow: 0 0 6px #c070ff, 0 1px 2px #000; }
      .qs .tab.long { font-size: 2.6cqw; }
      .qs .dot { position: absolute; right: -1.8cqw; top: -1.4cqw; width: 3cqw; height: 3cqw; background: ${u('dot')} center / contain no-repeat; pointer-events: none; }
      .qs .board { flex: none; height: 19.9cqw; }
      /* панель «Выполнено»: 25–1000 × 515–640 */
      .qs .act { position: relative; flex: none; margin: 0 2.4cqw 0 2.4cqw; ${hb('act', 140, 151, 12.2, 30)} }
      .qs .act .lb { position: absolute; left: 3.5cqw; top: 2.6cqw; font-size: 2.5cqw; }
      .qs .act .lb b { display: block; font-size: 2.9cqw; margin-top: 0.6cqw; }
      .qs .act .bar { position: absolute; left: 15.2cqw; right: 1.2cqw; top: 6.1cqw; ${hb('bar', 20, 40, 2.15)} }
      .qs .act .fill { position: absolute; left: 15.2cqw; top: 6.1cqw; ${hb('bar_fill', 20, 43, 2.15)} min-width: 4cqw; }
      .qs .act .mk { position: absolute; top: 5.55cqw; width: 2.6cqw; height: 3.2cqw; margin-left: -1.3cqw; background: ${u('mark')} center / contain no-repeat; }
      .qs .act .n { position: absolute; top: 8.7cqw; width: 8cqw; margin-left: -4cqw; text-align: center; font-size: 2.7cqw; font-weight: 700; }
      .qs .act .ch { position: absolute; top: -1.6cqw; width: 11cqw; height: 7.6cqw; margin-left: -5.5cqw; border: none; background: center bottom / contain no-repeat; }
      .qs .act .ch.ready { filter: drop-shadow(0 0 1.2cqw #ffcc40); animation: qsPulse 1.2s ease-in-out infinite alternate; }
      .qs .act .ch.open { opacity: .75; }
      @keyframes qsPulse { to { filter: drop-shadow(0 0 2.2cqw #ffe080) brightness(1.15); } }
      .qs .sec { margin: 2.2cqw 4.4cqw 0.4cqw; font-size: 2.6cqw; color: #d9c4ff; letter-spacing: .03em; }
      .qs .list { display: flex; flex-direction: column; gap: 0.9cqw; margin: 2.9cqw 2.4cqw 0; }
      .qs .sec + .list { margin-top: 0.6cqw; }
      /* карточка: 25–1000, высота 128 */
      .qs .card { position: relative; flex: none; ${hb('card', 40, 131, 12.5)} }
      .qs .card.got { filter: brightness(.7) saturate(.8); }
      .qs .card .fr { position: absolute; left: -0.8cqw; top: 1.2cqw; width: 12.5cqw; height: 10.45cqw; display: grid; place-items: center; background: ${u('icon_fr')} center / 100% 100% no-repeat; }
      .qs .card .fr img { width: 82%; height: 88%; object-fit: contain; }
      .qs .card .nm { position: absolute; left: 14.3cqw; top: 2.1cqw; width: 39cqw; font-size: 2.9cqw; line-height: 1.05; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .qs .card .nm small { font-size: 2.2cqw; color: #cbb8e8; }
      .qs .card .pb { position: absolute; left: 14.3cqw; top: 6.5cqw; width: 33.7cqw; ${hb('bar', 20, 40, 2.64)} }
      .qs .card .pf { position: absolute; left: 14.3cqw; top: 6.5cqw; ${hb('bar_fill', 20, 43, 2.64)} min-width: 3cqw; }
      .qs .card .pt { position: absolute; left: 14.3cqw; top: 6.5cqw; width: 33.7cqw; height: 2.64cqw; line-height: 2.64cqw; text-align: center; font-size: 2.3cqw; font-weight: 700; color: #fff; }
      .qs .card .dv { position: absolute; left: 50.6cqw; top: 1.4cqw; width: 0.2cqw; height: 9cqw; background: linear-gradient(#0000, #c89a5a 20%, #c89a5a 80%, #0000); }
      .qs .card .rw { position: absolute; left: 51.4cqw; top: 1.4cqw; width: 17.4cqw; height: 9.6cqw; display: flex; align-items: center; justify-content: center; gap: 0.6cqw; }
      .qs .rwi { position: relative; display: block; width: 9cqw; height: 8cqw; }
      .qs .rwi img { width: 100%; height: 100%; object-fit: contain; }
      .qs .rwi b { position: absolute; right: -1.2cqw; bottom: -0.6cqw; font-size: 2.9cqw; color: #fff; text-shadow: 0 1px 2px #000, 0 0 3px #000; }
      .qs .rw.two .rwi { width: 6.4cqw; height: 6.4cqw; } .qs .rw.two .rwi b { font-size: 2.5cqw; right: -0.8cqw; }
      .qs .card .bt { position: absolute; left: 69cqw; top: 2.9cqw; width: 20.3cqw; font-size: 3.2cqw; font-weight: 700; color: #fff; }
      .qs .bt.claim { ${hb('btn_claim', 45, 113, 6.8)} color: #fff4c0; text-shadow: 0 1px 2px #144000, 0 0 4px #000; }
      .qs .bt.go { ${hb('btn_go', 45, 105, 6.8)} }
      .qs .bt.done { ${hb('btn_done', 45, 105, 6.8, 45)} padding-left: 4.4cqw !important; color: #f6d27a; font-size: 3cqw; }
      .qs .bt.go:disabled { opacity: .55; }
      .qs .bt:not(:disabled):active { transform: scale(.96); }
      .qs .grow { flex: 1 0 2cqw; }
      /* таймер сброса: 265–755 × 1390–1460 */
      .qs .timer { align-self: center; flex: none; margin-top: 3cqw; ${hb('timer', 60, 82, 6.84)} min-width: 47.9cqw; display: flex; align-items: center; justify-content: center; gap: 1.2cqw; font-size: 3.1cqw; }
      .qs .timer img { width: 2.6cqw; height: 3.6cqw; object-fit: contain; }
      /* календарь: колонки 75–238 … 792–955, строки по 162 px */
      .qs .days { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); column-gap: 1.66cqw; row-gap: 1.4cqw; margin: 3.3cqw 6.7cqw 0 7.3cqw; }
      .qs .day { position: relative; aspect-ratio: 163 / 150; background: ${u('day')} center / 100% 100% no-repeat; }
      .qs .day.got { background-image: ${u('day_got')}; }
      .qs .day.now { background-image: ${u('day_now')}; background-size: 112% 112%; }
      .qs .day .h { position: absolute; left: 0; right: 0; top: 4%; text-align: center; font-size: 2.45cqw; font-weight: 700; color: #f0dfc0; }
      .qs .day.got .h { color: #c8b48a; }
      .qs .day .rwi { position: absolute; left: 14%; top: 36%; width: 7.4cqw; height: 6.2cqw; }
      .qs .day .rwi img { width: auto; max-width: 100%; }
      .qs .day .rwi b { right: auto; left: 7.4cqw; bottom: 0.4cqw; font-size: 2.8cqw; }
      .qs .day .ok { position: absolute; left: 50%; bottom: 5%; transform: translateX(-50%); font-size: 4.6cqw; font-weight: 900; color: #ffd24a; text-shadow: 0 1px 2px #000; }
      .qs .big { align-self: center; flex: none; margin-top: 3cqw; width: 51.8cqw; ${hb('btn_big', 150, 145, 10.3)} font-size: 5cqw; font-weight: 800; color: #fff0b0; text-shadow: 0 2px 3px #134000, 0 0 6px #000; }
      .qs .big:disabled { filter: grayscale(.8) brightness(.7); }
      .qs .note { text-align: center; margin-top: 1.6cqw; font-size: 2.6cqw; color: #cbb8e8; }
    `;
    document.head.appendChild(css);
  })();
