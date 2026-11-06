  // ===================== 0.79: враги-спрайты (листы пользователя 4×3: покой / удар / смерть) =====================
  // Ленты кадров — assets/enemies/<id>.webp (tools/enemycut.py). Враг без ленты остаётся прежней заглушкой.
  (function () {
    const SPR = /*__ENEMY_SPR__*/{};
    const BY_NAME = { 'Слайм призыва': 'slime', 'Рунная крыса': 'rat', 'Летучая мышь': 'bat', 'Каменный жук': 'beetle', 'Король слаймов': 'slime_king',
      'Павший призванный': 'fallen', 'Каменная горгулья': 'gargoyle', 'Рунный бес': 'imp', 'Теневой волк': 'wolf', 'Каменный страж': 'stone_guard', 'Хранитель Врат': 'warden', 'Клетка с Тилем': 'cage' };
    window.ENEMY_SPR = SPR; window.ENEMY_BY_NAME = BY_NAME;   // 0.127: портреты в Дневнике
    const ROW = { idle: [0, 1, 2, 3], hit: [4, 5, 6, 7], die: [8, 9, 10, 11] };
    const FPS = { idle: 6, hit: 20, die: 13 };
    const box = document.createElement('div'); box.className = 'eSpr'; el.enemy.appendChild(box);
    let cur = '', anim = 'idle', f = 0, acc = 0, last = performance.now(), wasAlive = true, shown = -1;
    function use(id) {
      cur = id; anim = 'idle'; f = 0; acc = 0; shown = -1; box.classList.remove('fade');
      el.enemy.classList.toggle('spr', !!id);
      if (!id) { box.style.backgroundImage = ''; return; }
      const S = SPR[id];
      box.style.backgroundImage = 'url(' + S.src + ')';
      box.style.aspectRatio = S.w + ' / ' + S.h;
      box.style.backgroundSize = (S.n * 100) + '% 100%';
    }
    function play(a) { anim = a; f = 0; acc = 0; }
    function draw() {
      if (!cur) return;
      const S = SPR[cur];
      let i = ROW[anim][Math.min(f, ROW[anim].length - 1)];
      if (S.progress && anim !== 'die') {           // клетка: трещин тем больше, чем меньше прочность
        const en = s.enemy, p = 1 - Math.max(0, Math.min(1, B.toNum(B.div(en.hp, en.maxHp))));
        if (p > 0.001) i = 4 + Math.min(3, Math.floor(p * 4));
      }
      if (i !== shown) { shown = i; box.style.backgroundPosition = (i / (S.n - 1) * 100) + '% 0'; }
    }
    // подсказка для нового игрока: пока не было ни одного тапа
    const hint = document.createElement('div'); hint.className = 'tapHint'; hint.innerHTML = '<i>👆</i>Тапай по врагу'; el.arena.appendChild(hint);
    function loop(now) {
      hint.classList.toggle('show', !(s.stats.taps > 0) && !document.getElementById('proOv') && !document.querySelector('#sysOv.show'));
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      const en = s.enemy, id = BY_NAME[en.name] || '';
      if (en.alive && (!wasAlive || id !== cur)) use(id);   // новый враг
      wasAlive = en.alive;
      if (cur) {
        acc += dt * FPS[anim];
        while (acc >= 1) {
          acc -= 1; f++;
          if (anim === 'idle') f %= 4;
          else if (anim === 'hit' && f >= 4) play('idle');
          else if (anim === 'die' && f >= 4) f = 3;   // последний кадр держим до следующего врага
        }
        draw();
      }
      requestAnimationFrame(loop);
    }
    const h0 = handle;
    handle = function (events, x, y) {
      h0(events, x, y);
      if (!cur) return;
      for (const e of events) {
        if (e.type === 'freed') freed(e.id);
        if (e.type === 'kill') { if (SPR[cur].dieFade) { play('hit'); box.classList.add('fade'); } else play('die'); }
        else if (e.type === 'hit' && !e.blocked && anim !== 'die' && (anim !== 'hit' || f >= 2)) play('hit');
      }
    };
    // клетка разбита: кадры освобождения поверх (бой уже идёт дальше), затем окно Системы
    function freed(id) {
      const S = SPR.cage, fx = document.createElement('div');
      fx.className = 'eSpr freeFx'; fx.style.cssText = box.style.cssText; fx.style.backgroundImage = 'url(' + S.src + ')';
      el.enemy.appendChild(fx); box.style.opacity = 0;   // новый враг появится, когда Шорох «выпрыгнет»
      let k = 8; const step = () => { fx.style.backgroundPosition = (k / (S.n - 1) * 100) + '% 0'; if (k++ < 11) setTimeout(step, 170); else setTimeout(() => { fx.classList.add('fade'); box.style.opacity = ''; setTimeout(() => fx.remove(), 400); }, 900); };
      step();
      setTimeout(() => window.U3 && U3.sys({ title: 'СОЮЗНИК ОСВОБОЖДЁН', text: ((CFG.allies.find(a => a.id === id)) || { name: id }).name + ' присоединился к отряду. Теперь он бьёт врагов сам — даже когда ты не тапаешь. Прокачивай его в меню ⚔.', btns: [{ t: 'Отлично' }] }), 1500);
    }
    use(BY_NAME[s.enemy.name] || '');
    requestAnimationFrame(loop);
    window.__spr = { use, play, get cur() { return cur; }, get anim() { return anim; } };
  })();
