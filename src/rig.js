  // ===================== 0.70: «кости» — чиби-герои на 2D-скелете (как Idle Heroes) =====================
  // Один скелет и один набор движений на всех героев. Части героя — картинки rig_<id>_<часть>.webp (лист частей, режет tools/rigcut.py);
  // пока частей нет — рисуется заглушка-чиби кодом (цвета героя). Движения процедурные: дыхание, 3 удара комбо, урон, ульта, след клинка.
  (function () {
    const RIG_ART = /*__RIG_ART__*/{};          // { hero: { head: dataURL, ... , _piv: {...} } }
    const PARTS = ['legL', 'legR', 'armLu', 'armLl', 'torso', 'cape', 'head', 'armRu', 'armRl', 'sword'];
    // скелет (вид 3/4 со спины, смотрит вверх-вправо): точки крепления относительно родителя, в пикселях холста 200×240
    const BONES = {
      root:  { p: null,    x: 100, y: 178 },
      legL:  { p: 'root',  x: -11, y: 0 },   legR: { p: 'root', x: 11, y: 0 },
      torso: { p: 'root',  x: 0,   y: 0 },
      cape:  { p: 'torso', x: 0,   y: -40 },
      head:  { p: 'torso', x: 0,   y: -44 },
      armLu: { p: 'torso', x: -20, y: -38 }, armLl: { p: 'armLu', x: 0, y: 18 },
      armRu: { p: 'torso', x: 20,  y: -38 }, armRl: { p: 'armRu', x: 0, y: 18 },
      sword: { p: 'armRl', x: 0,   y: 16 },
    };
    const lerp = (a, b, k) => a + (b - a) * k, ease = k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, out = k => 1 - Math.pow(1 - k, 3);
    // ---------- заглушка-чиби: части рисуются кодом ----------
    function drawStub(c, part, pal) {
      const A = pal.armor, E = pal.edge, G = pal.glow;
      c.lineJoin = 'round'; c.lineWidth = 2.2; c.strokeStyle = '#07050a';
      const shape = (f, fill) => { c.beginPath(); f(); c.fillStyle = fill; c.fill(); c.stroke(); };
      switch (part) {
        case 'legL': case 'legR':
          shape(() => c.roundRect(-8, -2, 16, 34, 6), A); shape(() => c.roundRect(-10, 26, 21, 12, 5), '#0e0b12');
          c.fillStyle = E; c.fillRect(-6, 8, 12, 3); break;
        case 'torso':
          shape(() => { c.moveTo(-24, -44); c.quadraticCurveTo(0, -52, 24, -44); c.lineTo(17, 2); c.quadraticCurveTo(0, 8, -17, 2); c.closePath(); }, A);
          c.fillStyle = E; c.fillRect(-18, -8, 36, 5); c.fillStyle = G; c.fillRect(-3, -9, 6, 7);
          c.strokeStyle = E; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -42); c.lineTo(0, -12); c.stroke(); break;
        case 'cape':
          shape(() => { c.moveTo(-24, 0); c.lineTo(24, 0); c.lineTo(30, 52); c.lineTo(18, 46); c.lineTo(10, 58); c.lineTo(0, 48); c.lineTo(-10, 58); c.lineTo(-18, 46); c.lineTo(-30, 52); c.closePath(); }, pal.cape);
          c.strokeStyle = G; c.globalAlpha = .7; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-22, 4); c.lineTo(22, 4); c.stroke(); c.globalAlpha = 1; break;
        case 'head':
          shape(() => c.arc(0, -30, 32, 0, 6.28), pal.hair);
          for (let i = 0; i < 7; i++) { const a = -2.6 + i * .52; shape(() => { c.moveTo(Math.cos(a - .25) * 28, -30 + Math.sin(a - .25) * 28); c.lineTo(Math.cos(a) * 46, -30 + Math.sin(a) * 46); c.lineTo(Math.cos(a + .25) * 28, -30 + Math.sin(a + .25) * 28); }, pal.hair); }
          c.fillStyle = '#e8c8b0'; c.beginPath(); c.ellipse(26, -22, 6, 9, .3, 0, 6.28); c.fill(); c.stroke();             // ухо — видно в 3/4
          c.fillStyle = G; c.globalAlpha = .9; c.beginPath(); c.ellipse(30, -26, 2.2, 3.5, .3, 0, 6.28); c.fill(); c.globalAlpha = 1; break;
        case 'armLu': case 'armRu': shape(() => c.roundRect(-7, -4, 14, 24, 6), A); c.fillStyle = E; shape(() => c.arc(0, 0, 8, 0, 6.28), E); break;
        case 'armLl': case 'armRl': shape(() => c.roundRect(-6, -2, 12, 20, 5), A); shape(() => c.arc(0, 19, 6, 0, 6.28), '#2a2430'); break;
        case 'sword':
          c.save(); c.shadowColor = G; c.shadowBlur = 12;
          shape(() => { c.moveTo(-4, -4); c.lineTo(4, -4); c.lineTo(3, -70); c.lineTo(0, -80); c.lineTo(-3, -70); c.closePath(); }, pal.blade); c.restore();
          shape(() => c.roundRect(-11, -6, 22, 5, 2), E); shape(() => c.roundRect(-3, -1, 6, 12, 2), '#2a1a20'); break;
      }
    }
    // ---------- поза: процедурные движения ----------
    function pose(R, t) {
      const P = {}; for (const b in BONES) P[b] = { r: 0, x: 0, y: 0, sx: 1, sy: 1 };
      const br = Math.sin(t * 2.4);
      P.torso.sy = 1 + br * .025; P.torso.r = br * .02; P.head.r = Math.sin(t * 2.4 - .6) * .04; P.head.y = br * .8;
      P.armLu.r = .25 + br * .06; P.armLl.r = -.3; P.armRu.r = -.35 + br * .05; P.armRl.r = -.9; P.sword.r = .55;
      P.root.y = 0; P.legL.r = .03; P.legR.r = -.03;
      if (R.rest) for (const b in R.rest) P[b].r += R.rest[b];
      const A = R.anim;
      if (A) {
        const k = Math.min(1, (t - A.t0) / A.dur);
        if (A.kind === 'atk') {
          const w = k < .35 ? ease(k / .35) : 1, s = k < .35 ? 0 : k < .6 ? out((k - .35) / .25) : 1, back = k < .6 ? 0 : ease((k - .6) / .4);
          const v = A.v, m = 1 - back;
          if (v === 0) {          // сверху вниз
            P.torso.r += (-.25 * w + .45 * s) * m; P.armRu.r += (-2.3 * w + 3.1 * s) * m; P.armRl.r += (.6 * w - .3 * s) * m; P.root.y += (-4 * w + 6 * s) * m; P.root.x += 10 * s * m;
          } else if (v === 1) {   // наотмашь
            P.torso.r += (.35 * w - .7 * s) * m; P.armRu.r += (-1.4 * w + 2.6 * s) * m; P.armRl.r += (1 * w - 1.2 * s) * m; P.root.x += (-6 * w + 16 * s) * m; P.sword.r += -.6 * s * m;
          } else {                // выпад
            P.torso.r += (-.15 * w + .25 * s) * m; P.armRu.r += (-.6 * w - .9 * s) * m; P.armRl.r += (.8 * w + .7 * s) * m; P.root.x += (-8 * w + 24 * s) * m; P.root.y += -8 * s * m; P.sword.r += .8 * s * m;
          }
          P.armLu.r += (-.5 * s) * m; P.head.r += .15 * s * m;
          R.swing = k > .3 && k < .75;
        } else if (A.kind === 'hurt') {
          const h = Math.sin(k * Math.PI); P.torso.r -= .3 * h; P.root.x -= 8 * h; P.head.r -= .25 * h; R.tint = h;
        }
        if (k >= 1) { R.anim = null; R.swing = false; R.tint = 0; }
      }
      if (R.ult) {                // ульта: серия быстрых ударов с прыжками
        const u = (t * 8) % 1, sd = Math.floor(t * 8) % 2 ? 1 : -1;
        P.root.y += -10 - Math.abs(Math.sin(t * 8 * Math.PI)) * 8; P.root.x += sd * 10 * Math.sin(u * Math.PI);
        P.torso.r += sd * .4 * Math.sin(u * Math.PI); P.armRu.r += -1.6 + 3 * out(u); P.armRl.r += -.4; R.swing = true;
      }
      // плащ отстаёт — пружина от движения корпуса
      const target = -(P.root.x - (R.px || 0)) * .08 - P.torso.r * .8 + Math.sin(t * 1.8) * .06;
      R.capeV = (R.capeV || 0) + ((target - (R.ca || 0)) * 60 - (R.capeV || 0) * 9) * R.dt; R.ca = (R.ca || 0) + R.capeV * R.dt; R.px = P.root.x;
      P.cape.r = R.ca; P.cape.sy = 1 + Math.abs(R.ca) * .15;
      return P;
    }
    // ---------- сборка кадра ----------
    function render(R, t) {
      const c = R.ctx, P = pose(R, t), M = {};
      c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, R.cv.width, R.cv.height);
      const S = R.cv.width / 200; c.setTransform(S, 0, 0, S, 0, 0);
      // тень
      c.fillStyle = 'rgba(0,0,0,.45)'; c.beginPath(); c.ellipse(100 + P.root.x * .6, R.bones.root.y + 44, 40, 9, 0, 0, 6.28); c.fill();
      const world = b => {
        if (M[b]) return M[b];
        const d = R.bones[b], q = P[b], m = new DOMMatrix();
        const base = d.p ? world(d.p) : m;
        const r = base.translate(d.x + q.x, d.y + q.y).rotate(q.r * 57.2958).scale(q.sx, q.sy);
        return (M[b] = r);
      };
      const ART = RIG_ART[R.id];
      for (const part of R.order) {
        const m = world(part); c.save(); c.setTransform(S * m.a, S * m.b, S * m.c, S * m.d, S * m.e, S * m.f);
        if (ART && ART[part] && R.img[part].complete) { const im = R.img[part], pv = (ART._piv || {})[part] || [im.width / 4, 0, .5], k = pv[2] || 1; c.drawImage(im, -pv[0], -pv[1], im.width * k, im.height * k); }
        else drawStub(c, part, R.pal);
        c.restore();
      }
      // след клинка
      const sm = world('sword'), tip = sm.transformPoint(new DOMPoint(0, -78));
      R.trail.push([tip.x, tip.y, R.swing ? 1 : 0]); if (R.trail.length > 9) R.trail.shift();
      if (R.trail.some(p => p[2]) && setg.fx !== 'off') {
        c.setTransform(S, 0, 0, S, 0, 0); c.save(); c.globalCompositeOperation = 'lighter';
        for (let i = 1; i < R.trail.length; i++) { const [x0, y0, a0] = R.trail[i - 1], [x1, y1, a1] = R.trail[i]; if (!a0 || !a1) continue;
          c.globalAlpha = i / R.trail.length * .9; c.strokeStyle = R.pal.glow; c.lineWidth = 1.5 + i * .9; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
        c.restore();
      }
      if (R.tint) { c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-atop'; c.fillStyle = 'rgba(255,60,60,' + (R.tint * .45) + ')'; c.fillRect(0, 0, R.cv.width, R.cv.height); c.globalCompositeOperation = 'source-over'; }
    }
    // ---------- риги на арене ----------
    const rigs = [];
    function makeRig(host, id, pal, scale) {
      const cv = document.createElement('canvas'); cv.className = 'rigCv'; host.appendChild(cv);
      const R = { id, host, cv, ctx: cv.getContext('2d'), pal, anim: null, trail: [], img: {}, order: ['legL', 'legR', 'armLu', 'armLl', 'torso', 'cape', 'head', 'armRu', 'armRl', 'sword'], dt: .016, scale: scale || 1, ph: Math.random() * 6 };
      const ART = RIG_ART[id]; if (ART) for (const p of PARTS) if (ART[p]) { const im = new Image(); im.src = ART[p]; R.img[p] = im; }
      const pv = ART && ART._piv || {};
      R.bones = {}; for (const b in BONES) R.bones[b] = Object.assign({}, BONES[b], (pv._bones || {})[b] || {});
      if (pv._order) R.order = pv._order.slice(); if (pv._rest) R.rest = pv._rest;
      rigs.push(R); return R;
    }
    function play(R, kind, v) { R.anim = { kind, v: v | 0, t0: performance.now() / 1000 + R.ph, dur: kind === 'atk' ? .3 : .35 }; }
    const PAL_HERO = { armor: '#1c1922', edge: '#8d8597', glow: '#c06bff', cape: '#241433', hair: '#14101a', blade: '#e3b6ff' };
    const palFor = col => ({ armor: '#2a2430', edge: '#a8a0b2', glow: col, cape: col + '88', hair: '#1a141e', blade: '#f0e8ff' });
    let heroRig = null;
    function enabled() { return setg.rig === 'on'; }
    function sync() {
      const on = enabled();
      document.body.classList.toggle('rigOn', on);
      if (!on) return;
      if (!heroRig) {
        heroRig = makeRig(heroEl, 'hero', PAL_HERO, 1);
        new MutationObserver(() => { if (heroEl.classList.contains('attack')) play(heroRig, 'atk', +(heroEl.dataset.combo || 0)); }).observe(heroEl, { attributes: true, attributeFilter: ['class'] });
      }
      for (const a of CFG.allies) {
        const u = allyUi[a.id]; if (!u || u.rig) continue;
        u.rig = makeRig(u.sprite, a.id, palFor(u.color), .8);
        if (!u.rig.rest) u.rig.order = ['legL', 'legR', 'cape', 'armLu', 'armLl', 'torso', 'head', 'armRu', 'armRl', 'sword'];
        let n = 0; new MutationObserver(() => { if (u.sprite.classList.contains('attack')) play(u.rig, 'atk', n++ % 3); }).observe(u.sprite, { attributes: true, attributeFilter: ['class'] });
      }
    }
    let last = performance.now();
    function frame(now) {
      requestAnimationFrame(frame);
      if (!enabled() || document.body.classList.contains('pageOpen')) { last = now; return; }
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      if (setg.fps === 30 && (frame.n = (frame.n | 0) + 1) & 1) return;
      const t = now / 1000;
      if (heroRig) heroRig.ult = s.abilities.flurry.active > 0;
      for (const R of rigs) {
        if (!R.host.isConnected || !R.cv.clientWidth) continue;
        const w = Math.round(R.cv.clientWidth * Math.min(2, devicePixelRatio || 1)); if (!w) continue;
        if (R.cv.width !== w) { R.cv.width = w; R.cv.height = Math.round(w * 1.2); }
        R.dt = dt; try { render(R, t + R.ph); } catch (e) { if (!R.err) { R.err = 1; console.error('rig', e && e.stack); } }
      }
    }
    // урон по герою (пока враги не бьют — дрожь при провале босса)
    const h0 = handle; handle = function (ev, x, y) { h0(ev, x, y); for (const e of ev) if (e.type === 'bossFail' && heroRig) play(heroRig, 'hurt'); };
    window.__rig = { rigs, pose };
    sync(); setInterval(sync, 1000);
    // отладка: адрес с #rigdebug — крупный герой на сером фоне (подгонка частей)
    if (/rigdebug/.test(location.hash)) {
      const box = document.createElement('div'); box.style.cssText = 'position:fixed;left:0;top:0;width:360px;height:432px;z-index:9999;background:#556;';
      document.body.appendChild(box); const R = makeRig(box, 'hero', PAL_HERO, 1); R.cv.style.cssText = 'display:block;position:absolute;left:0;top:0;width:360px;transform:none';
      window.__rig.dbg = R;
    }
    requestAnimationFrame(frame);
    window.U3 = window.U3 || {}; window.U3.rigPlay = (k, v) => heroRig && play(heroRig, k, v);
  })();
