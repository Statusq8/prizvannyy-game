  // ===================== 0.71: покадровая анимация героя (листы кадров → атлас, tools/animsheet.py) =====================
  // Кадры идут с мягкой сменой (кроссфейд соседних кадров) — 32 нарисованных кадра выглядят как плавные 30+ fps.
  // Пока нет листов удара/ульты: удар — рывок вперёд с наклоном (3 варианта по комбо), ульта — свечение и тряска.
  (function () {
    const ANIM = /*__ANIM__*/{};
    const idle = ANIM.hero_idle; if (!idle) return;
    const img = new Image(); img.src = idle.src;
    const cv = document.createElement('canvas'); cv.id = 'heroAnim'; heroEl.appendChild(cv);
    const ctx = cv.getContext('2d');
    document.body.classList.add('animOn');
    const M = idle.meta, FPS = 11;
    let atk = null, combo = 0;
    new MutationObserver(() => { if (heroEl.classList.contains('attack')) atk = { t0: performance.now(), v: +(heroEl.dataset.combo || 0) }; })
      .observe(heroEl, { attributes: true, attributeFilter: ['class'] });
    function frame(now) {
      requestAnimationFrame(frame);
      if (!img.complete || document.body.classList.contains('pageOpen')) return;
      const dpr = Math.min(2, devicePixelRatio || 1), w = Math.round(cv.clientWidth * dpr); if (!w) return;
      const h = Math.round(w * M.h / M.w); if (cv.width !== w) { cv.width = w; cv.height = h; }
      const t = now / 1000 * FPS, i = Math.floor(t) % M.n, j = (i + 1) % M.n, f = t - Math.floor(t);
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, w, h);
      const k = w / M.w, ax = M.anchor[0] * k, ay = M.anchor[1] * k;
      // удар: рывок к врагу (вверх по экрану), наклон, лёгкое растяжение
      let dx = 0, dy = 0, rot = 0, sx = 1, sy = 1;
      if (atk) {
        const p = (now - atk.t0) / 190; if (p >= 1) atk = null;
        else { const e = p < .35 ? p / .35 : 1 - (p - .35) / .65, s = Math.sin(e * Math.PI / 2);
          const V = [[0, -16, -.06], [-10, -12, .08], [10, -20, -.1]][atk.v % 3];
          dx = V[0] * s * k * 2; dy = V[1] * s * k * 2; rot = V[2] * s; sx = 1 + .05 * s; sy = 1 - .03 * s; }
      }
      const ult = s.abilities.flurry.active > 0;
      if (ult) { dx += Math.sin(now / 23) * 3 * k * 2; dy += -6 * k * 2 + Math.cos(now / 31) * 2; }
      ctx.translate(ax + dx, ay + dy); ctx.rotate(rot); ctx.scale(sx, sy); ctx.translate(-ax, -ay);
      if (ult) { ctx.shadowColor = '#c06bff'; ctx.shadowBlur = 24 * k * 2; }
      ctx.globalAlpha = 1; ctx.drawImage(img, i * M.w, 0, M.w, M.h, 0, 0, w, h);
      ctx.globalAlpha = f; ctx.drawImage(img, j * M.w, 0, M.w, M.h, 0, 0, w, h);
      ctx.globalAlpha = 1;
    }
    requestAnimationFrame(frame);
  })();
