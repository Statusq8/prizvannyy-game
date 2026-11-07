  // ===================== 0.158: 2.5D и простые анимации интерфейса (решение 07.11, без нового арта) =====================
  // Кнопки — «толщина» снизу и проседание при нажатии; страницы — въезд с лёгким наклоном; карточки — появление по очереди;
  // готовые награды — мягкое свечение; иконки Лагеря — лёгкое «дыхание». Отключается системной настройкой «меньше движения».
  (function () {
    const css = `
  body.clean button:not(:disabled), body.clean .mCard, body.clean .pveCard, body.clean .shopCard, body.clean .mkCard, body.clean .hCard {
    transition: transform .09s ease-out, filter .09s ease-out; }
  /* 2.5D: у кнопок есть «толщина» (тень снизу); при нажатии кнопка садится и тень пропадает */
  body.clean .upBtn:not(:disabled), body.clean .pullBtn:not(:disabled), body.clean .sysBtn, body.clean .hBtn:not(:disabled),
  body.clean .claimAll:not(:disabled), body.clean .backBtn, body.clean .sacBtn:not(:disabled), body.clean .pBtn:not(:disabled) {
    filter: drop-shadow(0 3px 0 #000b) drop-shadow(0 5px 6px #0007); }
  body.clean button:not(:disabled):active { transform: translateY(3px) scale(.97) !important; filter: brightness(1.3) drop-shadow(0 0 0 #0000) !important; }
  body.clean .mCard:active, body.clean .pveCard:active, body.clean .shopCard:active, body.clean .mkCard:active, body.clean .hCard:active {
    transform: translateY(2px) scale(.98); }
  /* страницы: въезд из глубины с наклоном */
  body.clean .pg.show { animation: mPgIn .24s cubic-bezier(.2, .9, .3, 1.1); }
  @keyframes mPgIn { from { opacity: 0; transform: translateY(14px) scale(.97); filter: brightness(1.8) saturate(1.5); } to { opacity: 1; transform: none; filter: none; } }
  /* карточки появляются по очереди, «встают» из наклона */
  body.clean .pg.mIn :is(.mCard, .pveCard, .shopCard, .mkCard, .hCard, .dcCard, .sfCard, .hRow) { animation: mCardIn .32s cubic-bezier(.2, .9, .3, 1.15) backwards; transform-origin: 50% 100%; }
  body.clean .pg.mIn :is(.mCard, .pveCard, .shopCard, .mkCard, .hCard, .dcCard, .sfCard, .hRow):nth-child(2) { animation-delay: .04s; }
  body.clean .pg.mIn :is(.mCard, .pveCard, .shopCard, .mkCard, .hCard, .dcCard, .sfCard, .hRow):nth-child(3) { animation-delay: .08s; }
  body.clean .pg.mIn :is(.mCard, .pveCard, .shopCard, .mkCard, .hCard, .dcCard, .sfCard, .hRow):nth-child(4) { animation-delay: .12s; }
  body.clean .pg.mIn :is(.mCard, .pveCard, .shopCard, .mkCard, .hCard, .dcCard, .sfCard, .hRow):nth-child(5) { animation-delay: .16s; }
  body.clean .pg.mIn :is(.mCard, .pveCard, .shopCard, .mkCard, .hCard, .dcCard, .sfCard, .hRow):nth-child(6) { animation-delay: .20s; }
  body.clean .pg.mIn :is(.mCard, .pveCard, .shopCard, .mkCard, .hCard, .dcCard, .sfCard, .hRow):nth-child(n+7) { animation-delay: .24s; }
  @keyframes mCardIn { from { opacity: 0; transform: perspective(600px) translateY(16px) rotateX(28deg) scale(.96); } 70% { opacity: 1; } to { opacity: 1; transform: none; } }
  /* готовая награда: мягкое свечение кнопки «Забрать всё» */
  body.clean .claimAll:not(:disabled) { animation: mReady 1.8s ease-in-out infinite; }
  @keyframes mReady { 0%, 100% { filter: drop-shadow(0 3px 0 #000b) drop-shadow(0 0 0 #ffd76a00); } 50% { filter: drop-shadow(0 3px 0 #000b) drop-shadow(0 0 9px #ffd76acc); } }
  /* иконки Лагеря: лёгкое «дыхание», у каждой — свой сдвиг по времени */
  body.clean .cBtn svg { animation: mBreath 3.2s ease-in-out infinite; }
  body.clean .cBtn:nth-child(2n) svg { animation-delay: -.8s; }
  body.clean .cBtn:nth-child(3n) svg { animation-delay: -1.6s; }
  body.clean .cBtn:nth-child(5n) svg { animation-delay: -2.4s; }
  @keyframes mBreath { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
  body.clean .cBtn:active svg { animation: none; }
  @media (prefers-reduced-motion: reduce) {
    body.clean .pg.show, body.clean .pg.mIn *, body.clean .claimAll, body.clean .cBtn svg { animation: none !important; }
  }`;
    const st = document.createElement('style'); st.id = 'motionCss'; st.textContent = css; document.head.appendChild(st);
    // карточки «встают» только в первые 0,7 с после открытия страницы — перерисовка списка потом не мигает
    const mo = new MutationObserver(L => { for (const m of L) { const g = m.target, on = g.classList.contains('show');
      if (on && !g._mOn) { g._mOn = 1; g.classList.add('mIn'); clearTimeout(g._mT); g._mT = setTimeout(() => g.classList.remove('mIn'), 700); }
      else if (!on && g._mOn) { g._mOn = 0; if (g.classList.contains('mIn')) g.classList.remove('mIn'); } } });   // без лишних записей класса — иначе наблюдатель зациклится
    document.querySelectorAll('.pg').forEach(g => mo.observe(g, { attributes: true, attributeFilter: ['class'] }));
  })();
