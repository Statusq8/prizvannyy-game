/* M9 Звук: всё синтезируется WebAudio (без файлов). Запуск — после первого касания (правило браузеров).
   Музыка: тихий генеративный эмбиент, своя тональность у каждой зоны. Ограничение частоты звуков, чтобы не было «каши». */
(function (PZ) {
  let ctx = null, master = null, sfxBus = null, musBus = null, noiseBuf = null, started = false;
  const last = {};
  const st = () => PZ.game && PZ.game.s.account.settings;

  function init() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.connect(ctx.destination);
    sfxBus = ctx.createGain(); sfxBus.connect(master);
    musBus = ctx.createGain(); musBus.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    apply();
  }
  function apply() {
    if (!ctx) return;
    const s = st() || {};
    const vol = s.volume === undefined ? 0.7 : s.volume;
    master.gain.value = s.sound === false ? 0 : vol;
    musBus.gain.value = s.music === false ? 0 : 0.35;
    sfxBus.gain.value = 0.9;
  }
  function unlock() {
    init(); if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    if (!started) { started = true; music.start(); }
  }
  function ok(name, gapMs) {
    if (!ctx || ctx.state !== 'running') return false;
    const s = st(); if (s && s.sound === false) return false;
    const t = performance.now(); if (last[name] && t - last[name] < gapMs) return false;
    last[name] = t; return true;
  }
  function tone(freq, dur, type, vol, slideTo, delay) {
    const t0 = ctx.currentTime + (delay || 0), o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(sfxBus); o.start(t0); o.stop(t0 + dur + 0.02);
  }
  function noise(dur, vol, f1, f2, q, delay) {
    const t0 = ctx.currentTime + (delay || 0), src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noiseBuf; bp.type = 'bandpass'; bp.Q.value = q || 1;
    bp.frequency.setValueAtTime(f1, t0); if (f2) bp.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(bp); bp.connect(g); g.connect(sfxBus); src.start(t0); src.stop(t0 + dur + 0.02);
  }
  const R = () => 0.92 + Math.random() * 0.16;   // лёгкий разброс высоты, чтобы повторы не резали слух

  const sfx = {
    hit() { if (!ok('hit', 55)) return; noise(0.07, 0.35, 1800 * R(), 600, 0.8); tone(140 * R(), 0.07, 'triangle', 0.18, 70); },
    slash() { if (!ok('slash', 120)) return; noise(0.18, 0.22, 600, 4200 * R(), 2.5); },
    bolt() { if (!ok('bolt', 140)) return; tone(900 * R(), 0.1, 'sine', 0.06, 1500); },
    kill(boss) { if (!ok('kill', 90)) return; tone(boss ? 70 : 110, boss ? 0.6 : 0.28, 'sine', 0.35, boss ? 35 : 55); noise(boss ? 0.5 : 0.22, 0.25, 400, 120, 0.7); },
    coin() { if (!ok('coin', 110)) return; tone(1320 * R(), 0.08, 'square', 0.04); tone(1980 * R(), 0.12, 'square', 0.035, null, 0.06); },
    bone() { if (!ok('bone', 200)) return; [660, 880, 990].forEach((f, i) => tone(f, 0.14, 'triangle', 0.08, null, i * 0.06)); },
    click() { if (!ok('click', 40)) return; tone(520, 0.05, 'triangle', 0.08, 760); },
    levelup() { if (!ok('lvl', 80)) return; tone(523, 0.09, 'triangle', 0.09); tone(784, 0.14, 'triangle', 0.09, null, 0.06); },
    reward() { if (!ok('rew', 300)) return; [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'sine', 0.1, null, i * 0.07)); },
    fanfare() { if (!ok('fan', 400)) return; [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, 0.32, 'sawtooth', 0.05, null, i * 0.09)); tone(131, 0.9, 'sine', 0.2, null, 0.1); },
    bossStart() { if (!ok('boss', 1500)) return; [0, 0.18, 0.36].forEach(d => { tone(55, 0.3, 'sine', 0.4, 40, d); noise(0.15, 0.2, 200, 80, 0.7, d); }); },
    fail() { if (!ok('fail', 1500)) return; tone(330, 0.3, 'triangle', 0.12, 220); tone(247, 0.5, 'triangle', 0.12, 160, 0.25); },
    summon(rank) {
      if (!ok('summon', 300)) return;
      const hi = ['A', 'S', 'SS', 'БОГ'].includes(rank);
      noise(0.9, 0.12, 300, 3000, 1.5);
      [440, 554, 659, 880, hi ? 1109 : 0, hi ? 1319 : 0].filter(Boolean).forEach((f, i) => tone(f, 0.25, 'sine', 0.09, null, 0.2 + i * 0.08));
    },
  };

  // --- Музыка: дрон + аккорды по кругу, тональность зоны ---
  const ZONE_ROOT = [110, 98, 123.5, 87.3, 103.8, 92.5, 116.5, 82.4, 130.8, 146.8, 77.8, 73.4];
  const PROG = [[0, 3, 7], [-4, 0, 3], [-2, 2, 5], [-5, -2, 2]];   // минорный круг: i–VI–VII–v
  const music = {
    voices: [], zone: 1, step: 0, timer: 0,
    start() {
      if (!ctx || music.voices.length) return;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.connect(musBus);
      const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 400; lfo.connect(lg); lg.connect(lp.frequency); lfo.start();
      for (let i = 0; i < 4; i++) {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = i === 0 ? 'sine' : 'triangle'; g.gain.value = i === 0 ? 0.05 : 0.025;
        o.connect(g); g.connect(lp); o.start(); music.voices.push(o);
      }
      music.chord(); music.timer = setInterval(music.chord, 7000);
    },
    chord() {
      if (!ctx || !music.voices.length) return;
      const root = ZONE_ROOT[(music.zone - 1) % ZONE_ROOT.length], ch = PROG[music.step++ % PROG.length], t = ctx.currentTime;
      music.voices[0].frequency.setTargetAtTime(root / 2, t, 1.5);
      ch.forEach((semi, i) => music.voices[i + 1].frequency.setTargetAtTime(root * Math.pow(2, semi / 12) * 2, t, 1.2));
    },
    setZone(z) { if (z !== music.zone) { music.zone = z; music.step = 0; music.chord(); } },
  };

  // Свернули игру / ушли на другую вкладку — звук и музыка замолкают; вернулись — продолжаются.
  let hiddenPaused = false;
  function suspend() { if (ctx && ctx.state === 'running') { ctx.suspend(); hiddenPaused = true; } }
  function resume() { if (ctx && hiddenPaused && !document.hidden) { ctx.resume(); hiddenPaused = false; } }
  if (typeof document !== 'undefined') {
    ['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, unlock, { capture: true }));
    document.addEventListener('visibilitychange', () => { if (document.hidden) suspend(); else resume(); });
    window.addEventListener('pagehide', suspend);
    window.addEventListener('blur', () => { if (document.hidden) suspend(); });
  }
  PZ.audio = Object.assign({ unlock, apply, suspend, resume, setZone: z => music.setZone(z), state: () => ctx ? ctx.state : 'none' }, sfx);
})(globalThis.PZ);
