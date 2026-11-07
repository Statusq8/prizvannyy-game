  // ===================== 0.83: Лагерь — летающие островки, как город Idle Heroes (docs/ui/CAMP.md) =====================
  // Карта высотой 2 экрана: листается вверх-вниз, влево-вправо слегка сдвигается. Одна функция = один островок.
  // Закрытые островки полностью спрятаны; открылся — островок поднимается из облаков.
  (function () {
    const A = /*__CAMP__*/{};
    if (!A.sky) return;
    const U = window.U2, on = k => k === 'classes' ? C.classUnlocked(s) : C.unlockedAt(s, k);
    const SK = 'prizvannyy_camp';
    let seen = {}, all = false; try { seen = JSON.parse(localStorage.getItem(SK) || '{}'); } catch (e) {}
    const saveSeen = () => { try { localStorage.setItem(SK, JSON.stringify(seen)); } catch (e) {} };
    // x, y — центр островка в % карты (карта = 2 экрана; нижний экран — y 50–100), w — ширина в % карты
    const ISL = [
      { id: 'hq', name: 'Штаб', x: 50, y: 88, w: 48, open: () => true, go: () => U.sec('up') },
      { id: 'portal', name: 'Портал', x: 28, y: 73, w: 33, open: () => on('portal'), go: () => U.openX('portal') },
      { id: 'forge', name: 'Кузница', x: 72, y: 73, w: 33, open: () => on('forge'), go: () => U.openX('forge') },
      { id: 'market', name: 'Рынок', x: 50, y: 59, w: 33, open: () => on('shop'), go: () => U.openX('market') },
    ];
    const ov = document.createElement('div'); ov.id = 'camp';
    ov.innerHTML = '<div id="campSc"><div id="campMap">' + ISL.map((o, i) =>
      '<button class="cIsl" data-id="' + o.id + '" style="left:' + o.x + '%;top:' + o.y + '%;width:' + o.w + '%;--d:' + (-i * 0.9) + 's"><img src="' + A[o.id] + '" alt="" draggable="false"><span>' + o.name + '</span></button>').join('') +
      '</div></div><button id="campProf" aria-label="Профиль"></button><button id="campSet" aria-label="Настройки"></button><button id="campMoreB" aria-label="Ещё">☰</button><div id="campMore"></div><button id="campBack" aria-label="В бой">В БОЙ</button><button id="campAll" title="тест: показать все острова">все</button>';
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
      #campBack { position: absolute; left: 50%; transform: translateX(-50%); bottom: calc(env(safe-area-inset-bottom) + 14px); padding: 0 28px; height: 46px; border-radius: 10px; border: 2px solid #e0b04a; box-shadow: 0 0 0 2px #0a060e, 0 0 14px #b14dff99;
        background: linear-gradient(#6a2aa8, #2a1046); color: #ffe6a0; font: 800 18px Georgia, 'Times New Roman', serif; letter-spacing: 1px; text-shadow: 0 1px 2px #000; z-index: 2; }
      #campBack:active { transform: translateX(-50%) scale(.94); }
      #campProf, #campSet { position: absolute; top: calc(env(safe-area-inset-top) + 8px); width: 58px; height: 64px; border: none; padding: 0; background: center / 100% 100% no-repeat; z-index: 2; }
      #campProf { left: 8px; } #campSet { right: 8px; }
      #campProf img { position: absolute; left: 12%; right: 12%; top: 12%; bottom: 14%; width: 76%; height: 74%; object-fit: cover; border-radius: 4px; }
      #campSet::after { content: ""; position: absolute; inset: 18%; background: center / contain no-repeat; background-image: var(--gear); filter: drop-shadow(0 0 4px #b14dff); }
      #campProf:active, #campSet:active { transform: scale(.92); }
      #campAll { position: absolute; right: 8px; bottom: calc(env(safe-area-inset-bottom) + 22px); padding: 4px 8px; border-radius: 8px; border: 1px dashed #8a6ab0; background: #12081c99; color: #a890c8; font: 600 11px system-ui; z-index: 2; opacity: .6; }
      #campAll.on { opacity: 1; color: #ffe2a0; }
      /* 0.88: «слишком много кнопок» — боковые кнопки старых функций убраны с экрана боя; пока у функции нет своего островка — маленькая кнопка в лагере */
      body.hudV3 #cbPve, body.hudV3 #cbMap, body.hudV3 #cbPortal, body.hudV3 #cbBook, body.hudV3 #cbRitual, body.hudV3 #cbForge, body.hudV3 #cbEvent, body.hudV3 #bookList, body.hudV3 #tbMail { display: none !important; }
      #campMoreB { position: absolute; left: 12px; bottom: calc(env(safe-area-inset-bottom) + 14px); width: 46px; height: 46px; border-radius: 10px; border: 2px solid #8a6ab0; background: #12081ce0; color: #e8dcf6; font: 800 22px system-ui; z-index: 2; display: none; }
      #campMoreB.has { display: block; }
      #campMore { position: absolute; left: 12px; bottom: calc(env(safe-area-inset-bottom) + 68px); display: none; flex-direction: column; gap: 6px; z-index: 3; }
      #campMore.show { display: flex; }
      #campMore button { display: flex; align-items: center; gap: 6px; min-width: 140px; padding: 8px 12px; border-radius: 8px; border: 1px solid #8a6ab0; background: #12081cf0; color: #e8dcf6; font: 700 14px system-ui; box-shadow: 0 0 10px #000a; }
      #campMore button:active { transform: scale(.95); }
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
          if (o.id !== 'hq' && ov.classList.contains('show')) { el.classList.add('rise'); setTimeout(() => el.classList.remove('rise'), 1900); toast('Новый остров<small>' + o.name + '</small>'); }
        }
      }
    }
    function open() {
      ov.classList.add('show'); pImg(); size(); refresh(); renderMore();
      sc.scrollTop = sc.scrollHeight; sc.scrollLeft = (sc.scrollWidth - sc.clientWidth) / 2;
    }
    function close() { ov.classList.remove('show'); }
    // пришли в раздел из лагеря — «назад» возвращает в лагерь (как в Idle Heroes)
    let fromCamp = false;
    document.addEventListener('click', e => { if (fromCamp && e.target.closest('.pg [data-back], .pg .backBtn, #oldBack')) { fromCamp = false; setTimeout(open, 0); } }, true);
    window.U3.camp = open;
    // функции без своего островка — маленькие кнопки внизу лагеря (видны, только когда функция открыта)
    const MORE = [
      ['quests', '📜', 'Задания', () => U.openOld('quests')], ['mail', '✉', 'Почта', () => U.openOld('inbox')], ['events', '🏮', 'События', () => U.openOld('events')],
      ['pve', '⚔', 'Испытания', () => U.openX('pve')], ['map', '🗼', 'Карта', () => U.open('map')], ['ritual', '👻', 'Регрессия', () => U.openX(window.RG_ART ? 'regress' : 'souls')], ['classes', '⚔', 'Классы', () => U.openX('classes')], ['quests', '🏆', 'Достижения', () => U.openX('ach')], ['expedition', '🧭', 'Экспедиции', () => U.openX('exp')], ['tree', '✴', 'Искры Башни', () => U.openX('tree')], ['season', '🎭', 'Сезон', () => U.openOld('season')], ['altar', '🕯', 'Алтарь', () => U.openOld('altar')],
    ];
    function renderMore() {
      const h = MORE.filter(m => on(m[0])).map((m, i) => '<button data-more="' + MORE.indexOf(m) + '">' + m[1] + ' ' + m[2] + '</button>').join('');
      if ($('campMore').innerHTML !== h) $('campMore').innerHTML = h;
      $('campMoreB').classList.toggle('has', !!h); if (!h) $('campMore').classList.remove('show');
    }
    $('campMoreB').addEventListener('click', () => { U.click(); $('campMore').classList.toggle('show'); });
    $('campMore').addEventListener('click', e => { const b = e.target.closest('[data-more]'); if (!b) return; U.press(b); $('campMore').classList.remove('show'); close(); fromCamp = true; U.home(); MORE[+b.dataset.more][3](); });
    addEventListener('resize', () => { if (ov.classList.contains('show')) size(); });
    // мышью — перетаскивание (на телефоне листается пальцем само)
    let drag = null, moved = false;
    sc.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; drag = { x: e.clientX, y: e.clientY, l: sc.scrollLeft, t: sc.scrollTop }; moved = false; });
    addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 6) moved = true; sc.scrollLeft = drag.l - dx; sc.scrollTop = drag.t - dy; });
    addEventListener('pointerup', () => { drag = null; });
    map.addEventListener('click', e => {
      const b = e.target.closest('.cIsl'); if (!b || moved) { moved = false; return; }
      const o = ISL.find(x => x.id === b.dataset.id); U.press(b);
      setTimeout(() => { close(); fromCamp = true; o.go(); }, 120);
    });
    $('campBack').addEventListener('click', () => { U.click(); close(); });
    // 0.85: профиль и настройки — в лагере (на экране боя их больше нет)
    const H = window.HUD_ART || {};
    if (H.btn_sq) { $('campProf').style.backgroundImage = $('campSet').style.backgroundImage = 'url("' + H.btn_sq + '")'; $('campSet').style.setProperty('--gear', 'url("' + H.ic_gear + '")'); }
    const pImg = () => { const i = document.querySelector('#tbProf img:not(.hudAv)'); $('campProf').innerHTML = i && i.src ? '<img src="' + i.src + '" alt="">' : ''; };
    $('campProf').addEventListener('click', () => { U.press($('campProf')); close(); fromCamp = true; window.U3.menuAct('prof'); });
    $('campSet').addEventListener('click', () => { U.press($('campSet')); close(); fromCamp = true; window.U3.menuAct('set'); });
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
    setInterval(() => { btn.style.display = s.stats.kills >= 1 ? '' : 'none'; if (ov.classList.contains('show')) refresh(); else for (const o of ISL) if (o.open() && !seen[o.id] && o.id === 'hq') { seen[o.id] = 1; saveSeen(); } }, 500);
  })();
