  // ===================== 0.83: Лагерь — летающие островки, как город Idle Heroes (docs/ui/CAMP.md) =====================
  // Карта высотой 2 экрана: листается вверх-вниз, влево-вправо слегка сдвигается. Одна функция = один островок.
  // Закрытые островки полностью спрятаны; открылся — островок поднимается из облаков.
  (function () {
    const A = /*__CAMP__*/{};
    if (!A.sky) return;
    const U = window.U2, on = k => C.unlockedAt(s, k);
    const SK = 'prizvannyy_camp';
    let seen = {}, all = false; try { seen = JSON.parse(localStorage.getItem(SK) || '{}'); } catch (e) {}
    const saveSeen = () => { try { localStorage.setItem(SK, JSON.stringify(seen)); } catch (e) {} };
    // x, y — центр островка в % карты (карта = 2 экрана; нижний экран — y 50–100), w — ширина в % карты
    const ISL = [
      { id: 'hq', name: 'Штаб', x: 50, y: 88, w: 48, open: () => true, go: () => U.sec('up') },
      { id: 'gates', name: 'Врата Башни', x: 70, y: 74, w: 33, open: () => true, go: () => close() },
      { id: 'portal', name: 'Портал', x: 30, y: 74, w: 33, open: () => on('portal'), go: () => U.openX('portal') },
      { id: 'forge', name: 'Кузница', x: 30, y: 60, w: 33, open: () => on('artifacts') || on('forge'), go: () => { const f = $('cbForge'); if (f) f.click(); } },
      { id: 'market', name: 'Рынок', x: 70, y: 60, w: 33, open: () => on('shop'), go: () => window.U3.menuAct('shop') },
    ];
    const ov = document.createElement('div'); ov.id = 'camp';
    ov.innerHTML = '<div id="campSc"><div id="campMap">' + ISL.map((o, i) =>
      '<button class="cIsl" data-id="' + o.id + '" style="left:' + o.x + '%;top:' + o.y + '%;width:' + o.w + '%;--d:' + (-i * 0.9) + 's"><img src="' + A[o.id] + '" alt="" draggable="false"><span>' + o.name + '</span></button>').join('') +
      '</div></div><button id="campBack" aria-label="В бой">←</button><button id="campAll" title="тест: показать все острова">все</button>';
    document.body.appendChild(ov);
    const sc = $('campSc'), map = $('campMap');
    const css = document.createElement('style');
    css.textContent = `
      #camp { position: fixed; inset: 0; z-index: 900; background: #120a24; display: none; }
      #camp.show { display: block; animation: campIn .25s ease-out; }
      @keyframes campIn { from { opacity: 0; } }
      #campSc { position: absolute; inset: 0; overflow: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; touch-action: pan-x pan-y; }
      #campSc::-webkit-scrollbar { display: none; }
      #campMap { position: relative; background: url("${A.sky}") center / cover no-repeat; }
      .cIsl { position: absolute; transform: translate(-50%, -50%); background: none; border: none; padding: 0; cursor: pointer; display: none; -webkit-tap-highlight-color: transparent; }
      .cIsl.on { display: block; }
      .cIsl img { width: 100%; display: block; pointer-events: none; animation: cBob 4.5s ease-in-out infinite; animation-delay: var(--d); filter: drop-shadow(0 10px 14px #0008); }
      @keyframes cBob { 50% { transform: translateY(-6px); } }
      .cIsl span { position: absolute; left: 50%; bottom: -6px; transform: translateX(-50%); white-space: nowrap; padding: 3px 12px; border-radius: 6px; background: #12081ce0; border: 1px solid #d6a640;
        font: 800 13px Georgia, 'Times New Roman', serif; color: #f3dcb0; text-shadow: 0 1px 2px #000; box-shadow: 0 0 10px #8a3dff55; pointer-events: none; }
      .cIsl:active img, .cIsl.press img { filter: brightness(1.25) drop-shadow(0 0 14px #b14dff); }
      .cIsl.rise { animation: cRise 1.8s cubic-bezier(.2,.8,.3,1) both; }
      .cIsl.rise img { filter: drop-shadow(0 0 22px #c27aff); }
      @keyframes cRise { from { transform: translate(-50%, 30%) scale(.6); opacity: 0; filter: blur(6px); } 60% { opacity: 1; filter: none; } }
      #campBack { position: absolute; left: 8px; top: calc(env(safe-area-inset-top) + 8px); width: 44px; height: 44px; border-radius: 10px; border: 1px solid #d6a640; background: #12081ce0; color: #f3dcb0; font: 800 22px system-ui; z-index: 2; }
      #campAll { position: absolute; right: 8px; top: calc(env(safe-area-inset-top) + 8px); padding: 4px 8px; border-radius: 8px; border: 1px dashed #8a6ab0; background: #12081c99; color: #a890c8; font: 600 11px system-ui; z-index: 2; opacity: .6; }
      #campAll.on { opacity: 1; color: #ffe2a0; }
      #cbCamp::after { content: ""; position: absolute; inset: 14% 12%; background: url("${A.hq}") center / contain no-repeat; pointer-events: none; filter: drop-shadow(0 0 4px #b14dff); }
      #cbCamp img, #cbCamp > * { display: none !important; }
    `;
    document.head.appendChild(css);
    // размер карты: 2 экрана в высоту, 1.3 экрана в ширину (лёгкий сдвиг влево-вправо)
    function size() { map.style.width = Math.round(sc.clientWidth * 1.3) + 'px'; map.style.height = Math.round(sc.clientHeight * 2) + 'px'; }
    function refresh() {
      for (const o of ISL) {
        const el = map.querySelector('[data-id="' + o.id + '"]'), op = all || o.open();
        el.classList.toggle('on', op);
        if (op && !all && !seen[o.id]) {
          seen[o.id] = 1; saveSeen();
          if (o.id !== 'hq' && o.id !== 'gates' && ov.classList.contains('show')) { el.classList.add('rise'); setTimeout(() => el.classList.remove('rise'), 1900); toast('Новый остров<small>' + o.name + '</small>'); }
        }
      }
    }
    function open() {
      ov.classList.add('show'); size(); refresh();
      sc.scrollTop = sc.scrollHeight; sc.scrollLeft = (sc.scrollWidth - sc.clientWidth) / 2;
    }
    function close() { ov.classList.remove('show'); }
    window.U3.camp = open;
    addEventListener('resize', () => { if (ov.classList.contains('show')) size(); });
    // мышью — перетаскивание (на телефоне листается пальцем само)
    let drag = null, moved = false;
    sc.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; drag = { x: e.clientX, y: e.clientY, l: sc.scrollLeft, t: sc.scrollTop }; moved = false; });
    addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 6) moved = true; sc.scrollLeft = drag.l - dx; sc.scrollTop = drag.t - dy; });
    addEventListener('pointerup', () => { drag = null; });
    map.addEventListener('click', e => {
      const b = e.target.closest('.cIsl'); if (!b || moved) { moved = false; return; }
      const o = ISL.find(x => x.id === b.dataset.id); U.press(b);
      setTimeout(() => { if (o.id !== 'gates') close(); o.go(); }, 120);
    });
    $('campBack').addEventListener('click', () => { U.click(); close(); });
    $('campAll').addEventListener('click', e => { U.click(); all = !all; e.currentTarget.classList.toggle('on', all); refresh(); });
    // кнопка «Лагерь» — ↙, «Улучшить» ⚔ — над ней
    const menuBtn = $('cbMenu'), btn = menuBtn.cloneNode(false);
    btn.id = 'cbCamp'; btn.className = menuBtn.className; btn.setAttribute('aria-label', 'Лагерь'); btn.removeAttribute('style');
    menuBtn.parentNode.appendChild(btn);
    const bs = getComputedStyle(menuBtn);
    Object.assign(btn.style, { position: 'absolute', left: '8px', bottom: 'calc(env(safe-area-inset-bottom) + 10px)', width: bs.width, height: bs.height, backgroundImage: window.HUD_ART && HUD_ART.btn_sq ? 'url("' + HUD_ART.btn_sq + '")' : bs.backgroundImage, backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundColor: 'transparent', border: 'none', boxShadow: 'none', zIndex: 6 });
    const up = document.createElement('style');
    up.textContent = 'body.hudV3 #cbMenu { bottom: calc(env(safe-area-inset-bottom) + 82px) !important; }' + (window.HUD_ART && HUD_ART.btn_sq ? ' body #cbCamp { background: url("' + HUD_ART.btn_sq + '") center / 100% 100% no-repeat !important; border: none !important; box-shadow: none !important; } #cbCamp:active { transform: scale(.92); }' : '');
    document.head.appendChild(up);
    btn.addEventListener('click', e => { e.stopPropagation(); U.press(btn); open(); });
    setInterval(() => { btn.style.display = s.stats.kills >= 1 ? '' : 'none'; if (ov.classList.contains('show')) refresh(); else for (const o of ISL) if (o.open() && !seen[o.id] && (o.id === 'hq' || o.id === 'gates')) { seen[o.id] = 1; saveSeen(); } }, 500);
  })();
