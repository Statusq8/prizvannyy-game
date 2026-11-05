  // ===================== 0.70: живой фон боя — частицы, туман, лучи, молнии по биому =====================
  // Слой canvas #amb поверх фона зала, под персонажами. Набор эффектов — по биому этажа (AMB[id]).
  // Учитывает настройки: «Эффекты» Выкл — слой выключен, «Меньше» — половина частиц; экономия — выключен.
  (function () {
    const arena = el.arena;
    const cv = document.createElement('canvas'); cv.id = 'amb';
    arena.insertBefore(cv, arena.firstChild);
    const fg = document.createElement('canvas'); fg.id = 'ambFg';      // передний план: крупные листья/искры у края экрана
    arena.appendChild(fg);
    const flash = document.createElement('div'); flash.id = 'ambFlash'; $('game').appendChild(flash);
    const ctx = cv.getContext('2d'), fctx = fg.getContext('2d');
    // набор на биом: частицы [тип, количество], туман, лучи, молнии, свечение снизу, цвет
    const AMB = {
      crypt:  { p: [['dust', 40], ['sparkle', 10]], fog: '#3a2a5a', glow: '#b14dff' },   // 0.79.3: Зал призыва — без зелёных огоньков
      ash:    { p: [['ash', 60], ['ember', 25]], fog: '#4a4040', glow: '#ff6a2a' },
      shade:  { p: [['leaf', 26], ['firefly', 22], ['dust', 20]], fog: '#2a3a4a', rays: '#c8b0ff', front: 'leaf' },
      frost:  { p: [['snow', 90]], fog: '#8aa8c8', rays: '#cfe8ff', front: 'snow' },
      tide:   { p: [['bubble', 30], ['dust', 20]], fog: '#1a4a5a', rays: '#8ff0ff' },
      blood:  { p: [['ember', 40], ['dust', 25]], fog: '#4a1018', glow: '#ff2a3a' },
      void:   { p: [['star', 50], ['wisp', 10]], fog: '#3a1a5a', glow: '#b14dff' },
      throne: { p: [['gold', 40], ['dust', 20]], fog: '#3a2a1a', rays: '#ffe08a' },
      rust:   { p: [['spark', 18], ['dust', 30]], fog: '#3a2a1a' },
      garden: { p: [['petal', 28], ['firefly', 14]], fog: '#3a4a5a', rays: '#fff0c0', front: 'petal' },
      kings:  { p: [['dust', 45], ['wisp', 6]], fog: '#2a2a3a', rays: '#d8c8a0' },
      fungus: { p: [['spore', 45], ['firefly', 12]], fog: '#1a3a3a', glow: '#3affd0' },
      forge:  { p: [['ember', 55], ['spark', 10]], fog: '#3a1a10', glow: '#ff7a1a', lava: 1 },
      mirror: { p: [['sparkle', 40], ['dust', 20]], fog: '#3a3a5a', rays: '#e0e8ff' },
      plague: { p: [['spore', 40], ['dust', 20]], fog: '#3a5a1a', glow: '#9aff3a' },
      sand:   { p: [['sand', 90]], fog: '#6a5a3a', rays: '#ffe0a0' },
      storm:  { p: [['rain', 140]], fog: '#2a3040', bolt: 1, front: 'rain' },
      flesh:  { p: [['spore', 35], ['ember', 15]], fog: '#5a1a2a', glow: '#ff3a6a' },
      stars:  { p: [['star', 70], ['sparkle', 15]], fog: '#1a1a4a', rays: '#a0b8ff' },
      heart:  { p: [['ember', 45], ['wisp', 8]], fog: '#4a0a3a', glow: '#ff3ab0', pulse: 1 },
    };
    let W = 0, H = 0, dpr = 1, ps = [], fps = [], fogs = [], cur = null, curId = '', t0 = performance.now(), boltT = 2, bolt = null;
    function size() {
      const r = arena.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      for (const c of [cv, fg]) { c.width = W * dpr; c.height = H * dpr; c.style.width = W + 'px'; c.style.height = H + 'px'; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener('resize', size); size();
    const R = (a, b) => a + Math.random() * (b - a);
    function spawn(type, init) {
      const p = { type, x: R(0, W), y: init ? R(0, H) : -20, vx: 0, vy: 0, r: 2, a: 1, rot: R(0, 6.28), vr: R(-2, 2), ph: R(0, 6.28), life: 1 };
      switch (type) {
        case 'leaf': case 'petal': p.r = R(5, 9); p.vy = R(18, 34); p.vx = R(-12, 12); p.a = R(.55, .9); p.hue = type === 'leaf' ? R(90, 140) : R(320, 350); break;
        case 'snow': p.r = R(1, 3); p.vy = R(20, 45); p.vx = R(-8, 8); p.a = R(.4, .9); break;
        case 'ash': p.r = R(1, 2.6); p.vy = R(10, 22); p.vx = R(-6, 6); p.a = R(.3, .7); break;
        case 'rain': p.r = R(10, 18); p.vy = R(520, 700); p.vx = -90; p.a = R(.2, .45); break;
        case 'sand': p.r = R(.8, 1.8); p.x = init ? R(0, W) : -10; p.y = R(H * .2, H); p.vx = R(60, 140); p.vy = R(-6, 6); p.a = R(.3, .7); break;
        case 'ember': case 'spark': case 'gold': p.y = init ? R(0, H) : H + 10; p.r = type === 'spark' ? R(1, 1.8) : R(1.2, 2.8); p.vy = -R(25, 70) * (type === 'spark' ? 2 : 1); p.vx = R(-15, 15); p.a = R(.5, 1); break;
        case 'bubble': p.y = init ? R(0, H) : H + 10; p.r = R(2, 6); p.vy = -R(18, 40); p.a = R(.25, .6); break;
        case 'spore': p.y = init ? R(0, H) : H + 10; p.r = R(1.5, 3.5); p.vy = -R(6, 16); p.vx = R(-6, 6); p.a = R(.35, .8); break;
        case 'firefly': case 'wisp': p.y = R(H * .25, H * .95); p.x = R(0, W); p.r = type === 'wisp' ? R(4, 7) : R(1.5, 2.6); p.vx = R(-14, 14); p.vy = R(-10, 10); p.a = 0; break;
        case 'dust': case 'sparkle': p.x = R(0, W); p.y = R(0, H); p.r = R(.7, 1.6); p.vx = R(-4, 4); p.vy = R(-3, 5); p.a = 0; break;
        case 'star': p.x = R(0, W); p.y = R(0, H * .7); p.r = R(.6, 1.8); p.a = 0; break;
      }
      return p;
    }
    function setBiome(id) {
      curId = id; cur = AMB[id] || AMB.crypt;
      const k = setg.fx === 'less' ? 0.35 : 1;
      ps = []; for (const [type, n] of cur.p) if (setg.fx === 'full' || !/wisp|firefly/.test(type)) for (let i = 0; i < Math.round(n * k); i++) ps.push(spawn(type, true));
      fps = []; if (cur.front && setg.fx === 'full') for (let i = 0; i < (cur.front === 'rain' ? 14 : 5); i++) { const p = spawn(cur.front, true); p.r *= cur.front === 'rain' ? 2.2 : 3.2; p.vy *= 1.8; p.front = 1; fps.push(p); }
      fogs = []; for (let i = 0; i < 5; i++) fogs.push({ x: R(-W * .3, W), y: R(H * .35, H * .95), w: R(W * .5, W * 1.1), h: R(60, 140), v: R(4, 12) * (Math.random() < .5 ? -1 : 1), a: R(.05, .13) });
      document.body.dataset.biome = id;
    }
    function step(p, dt, t) {
      p.ph += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      switch (p.type) {
        case 'leaf': case 'petal': p.x += Math.sin(p.ph * 1.6) * 22 * dt; break;
        case 'snow': case 'ash': p.x += Math.sin(p.ph) * 10 * dt; break;
        case 'firefly': case 'wisp': p.vx += R(-20, 20) * dt; p.vy += R(-20, 20) * dt; p.vx *= .99; p.vy *= .99; p.a = Math.min(1, p.a + dt * .5); break;
        case 'dust': case 'sparkle': p.a = Math.min(1, p.a + dt * .3); break;
        case 'star': p.a = Math.min(1, p.a + dt * .3); break;
      }
      const out = p.y > H + 30 || p.y < -40 || p.x < -40 || p.x > W + 40;
      if (out) Object.assign(p, spawn(p.type, false), p.front ? { r: p.r, front: 1 } : {});
      if ((p.type === 'firefly' || p.type === 'wisp' || p.type === 'dust' || p.type === 'sparkle') && out) { p.x = R(0, W); p.y = R(H * .2, H); }
    }
    function draw(c, p, t) {
      const tw = .55 + .45 * Math.sin(p.ph * 3 + p.rot);
      switch (p.type) {
        case 'leaf': case 'petal': {
          c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.scale(1, Math.abs(Math.sin(p.ph * 2)) * .7 + .3);
          c.globalAlpha = p.a * (p.front ? .8 : 1);
          c.fillStyle = 'hsl(' + p.hue + ',' + (p.type === 'leaf' ? 35 : 70) + '%,' + (p.type === 'leaf' ? 28 : 70) + '%)';
          c.beginPath(); c.ellipse(0, 0, p.r, p.r * .45, 0, 0, 6.28); c.fill();
          c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = .8; c.beginPath(); c.moveTo(-p.r, 0); c.lineTo(p.r, 0); c.stroke(); c.restore(); break; }
        case 'rain': c.globalAlpha = p.a; c.strokeStyle = '#b8c8e8'; c.lineWidth = p.front ? 2 : 1; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x + p.vx * .03, p.y - p.r); c.stroke(); break;
        case 'snow': case 'ash': case 'sand': case 'dust':
          c.globalAlpha = p.a * (p.type === 'dust' ? .5 * tw : 1); c.fillStyle = p.type === 'snow' ? '#eef6ff' : p.type === 'ash' ? '#9a9090' : p.type === 'sand' ? '#e8c890' : '#d8c8ff';
          c.beginPath(); c.arc(p.x, p.y, p.r * (p.front ? 1.4 : 1), 0, 6.28); c.fill(); break;
        case 'bubble': c.globalAlpha = p.a; c.strokeStyle = '#bff4ff'; c.lineWidth = 1; c.beginPath(); c.arc(p.x + Math.sin(p.ph * 2) * 4, p.y, p.r, 0, 6.28); c.stroke(); break;
        default: {   // светящиеся: искры, светлячки, огоньки, споры, звёзды
          const col = { ember: '#ff8a3a', spark: '#ffe08a', gold: '#ffd36b', spore: (cur && cur.glow) || '#9aff3a', firefly: '#d8ff7a', wisp: (cur && cur.glow) || '#b14dff', sparkle: '#ffffff', star: '#ffffff' }[p.type] || '#fff';
          const a = p.a * (p.type === 'firefly' || p.type === 'star' || p.type === 'sparkle' ? tw : p.type === 'ember' ? Math.min(1, (p.y / H) * 1.4) : 1);
          c.globalAlpha = a * .35; c.fillStyle = col; c.beginPath(); c.arc(p.x, p.y, p.r * 3.2, 0, 6.28); c.fill();
          c.globalAlpha = a; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 6.28); c.fill();
        }
      }
    }
    function makeBolt() {
      const pts = [[R(W * .15, W * .85), -10]]; let [x, y] = pts[0];
      while (y < H * R(.45, .7)) { x += R(-35, 35); y += R(25, 50); pts.push([x, y]); }
      return { pts, life: .35 };
    }
    let last = performance.now(), on = true;
    function frame(now) {
      requestAnimationFrame(frame);
      const want = setg.fx !== 'off' && setg.eco !== 'on' && !document.body.classList.contains('pageOpen');
      if (!want) { if (on) { ctx.clearRect(0, 0, W, H); fctx.clearRect(0, 0, W, H); on = false; } last = now; return; }
      on = true;
      const dt = Math.min(.05, (now - last) / 1000); last = now; const t = (now - t0) / 1000;
      const id = s.mode ? curId || 'crypt' : C.biomeOf(s.floor).id;
      if (id !== curId) setBiome(id);
      if (cv.width !== Math.round(arena.getBoundingClientRect().width * dpr)) size();
      ctx.clearRect(0, 0, W, H); fctx.clearRect(0, 0, W, H);
      // лучи света сверху, медленно качаются
      if (cur.rays) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 4; i++) {
          const x = W * (.15 + i * .25) + Math.sin(t * .25 + i * 2) * 30, a = .05 + .035 * Math.sin(t * .6 + i * 1.7);
          const g = ctx.createLinearGradient(x, 0, x + 80, H * .8); g.addColorStop(0, cur.rays); g.addColorStop(1, 'transparent');
          ctx.globalAlpha = Math.max(0, a); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 25, 0); ctx.lineTo(x + 25, 0); ctx.lineTo(x + 150, H * .8); ctx.lineTo(x + 50, H * .8); ctx.fill();
        }
        ctx.restore();
      }
      // свечение снизу (лава, магия), у Сердца — пульс
      if (cur.glow) {
        const pa = cur.lava ? .22 + .08 * Math.sin(t * 1.3) : cur.pulse ? .12 + .12 * Math.max(0, Math.sin(t * 2.2)) : .1 + .04 * Math.sin(t * .8);
        const g = ctx.createRadialGradient(W / 2, H * 1.05, 10, W / 2, H * 1.05, H * .7); g.addColorStop(0, cur.glow); g.addColorStop(1, 'transparent');
        ctx.globalAlpha = pa; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        if (cur.lava) {   // текущие лавовые жилы по нижнему краю
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          for (let i = 0; i < 3; i++) { const y = H * (.86 + i * .05); ctx.globalAlpha = .25; ctx.strokeStyle = i ? '#ff5a1a' : '#ffb04a'; ctx.lineWidth = 3 - i;
            ctx.beginPath(); for (let x = -10; x <= W + 10; x += 12) ctx.lineTo(x, y + Math.sin(x * .04 + t * (1.2 + i * .4) + i) * 5); ctx.stroke(); }
          ctx.restore();
        }
      }
      // туман — большие мягкие пятна, плывут по горизонтали
      ctx.save();
      for (const f of fogs) {
        f.x += f.v * dt; if (f.x > W + f.w * .5) f.x = -f.w; if (f.x < -f.w * 1.2) f.x = W;
        const g = ctx.createRadialGradient(f.x + f.w / 2, f.y, 5, f.x + f.w / 2, f.y, f.w / 2); g.addColorStop(0, cur.fog); g.addColorStop(1, 'transparent');
        ctx.globalAlpha = f.a; ctx.fillStyle = g; ctx.fillRect(f.x, f.y - f.h, f.w, f.h * 2);
      }
      ctx.restore();
      ctx.save(); for (const p of ps) { step(p, dt, t); draw(ctx, p, t); } ctx.restore();
      fctx.save(); for (const p of fps) { step(p, dt, t); draw(fctx, p, t); } fctx.restore();
      // молнии: вспышка на весь экран + ломаная
      if (cur.bolt) {
        boltT -= dt;
        if (boltT <= 0) { bolt = makeBolt(); boltT = R(2.5, 6); if (setg.flash !== 'off') { flash.classList.remove('on'); void flash.offsetWidth; flash.classList.add('on'); } }
        if (bolt) {
          bolt.life -= dt;
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.max(0, bolt.life / .35);
          for (const [w, c] of [[7, 'rgba(160,190,255,.35)'], [2.5, '#e8f0ff']]) { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); bolt.pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); }
          ctx.restore(); if (bolt.life <= 0) bolt = null;
        }
      }
      ctx.globalAlpha = 1; fctx.globalAlpha = 1;
    }
    requestAnimationFrame(frame);
  })();
