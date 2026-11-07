  // ===================== 0.128: Путешествие во времени и отчёт «Пока вас не было» по макету пользователя (docs/ui/TIME_TRAVEL.md, references/time_travel_mockup_v1.png 1024×1536) =====================
  // Кнопка-песочные часы на экране боя (красная точка — бесплатное путешествие), окно путешествия и окно отчёта (заменяет старое #away для офлайна).
  (function () {
    const A = /*__TIMETRAVEL__*/{};
    if (!A.win) return;
    window.TT_ART = A;
    const DY = window.DY_ART || {}, PF = window.PF_ART || {}, MK = window.MK_ART || {}, RG = window.RG_ART || {}, HS = window.HS_ART || {};
    const u = n => 'url("' + A[n] + '")';
    const hb = (n, s, H, h, s2) => `height: ${h}cqw; box-sizing: border-box; border-style: solid; border-width: 0 ${(s2 || s) * h / H}cqw 0 ${s * h / H}cqw; border-image: ${u(n)} 0 ${s2 || s} 0 ${s} fill stretch; background: none;`;
    const css = document.createElement('style');
    css.textContent = `
      #ttBtn { position: absolute; z-index: 9; left: 8px; top: calc(env(safe-area-inset-top) + 190px); width: 54px; height: 51px; border: none; padding: 0; background: ${u('bbtn')} center / contain no-repeat; }
      #ttBtn i { position: absolute; right: 2px; top: 2px; width: 12px; height: 12px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #ff9a9a, #e01020 55%, #700); box-shadow: 0 0 0 2px #c89a5a; display: none; }
      #ttBtn.dot i { display: block; }
      body.clean.pageOpen #ttBtn, body.photo #ttBtn { visibility: hidden; }
      #ttOv { position: fixed; inset: 0; z-index: 400; display: none; background: #05030dcc; container-type: inline-size; font-family: Georgia, 'Times New Roman', serif; color: #f3ead8; text-shadow: 0 1px 2px #000; }
      #ttOv.show { display: block; }
      #ttOv button { font-family: inherit; padding: 0; color: inherit; border: none; background: none; }
      #ttOv .tW { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); box-sizing: border-box; width: 64.5cqw; max-width: 420px; border: 4.4cqw solid transparent; border-image: ${u('win')} 45 fill stretch;
        background: linear-gradient(#24103c, #160a26) padding-box; padding: 6.4cqw 1.6cqw 3cqw; display: flex; flex-direction: column; align-items: center; }
      #ttOv .tW.rep { width: 66cqw; }
      #ttOv .tTi { position: absolute; left: 50%; top: -8.6cqw; transform: translateX(-50%); ${hb('title', 70, 161, 9.8)} min-width: 47.9cqw; padding: 1.6cqw 1cqw 0 !important; display: grid; place-items: center; font-size: 3.5cqw; font-weight: 800; color: #f6d690; white-space: nowrap; }
      #ttOv .tX { position: absolute; right: -6.4cqw; top: -6.6cqw; width: 6.4cqw; height: 6.4cqw; background: ${HS.close ? 'url("' + HS.close + '")' : 'none'} center / contain no-repeat; }
      #ttOv .tHg { width: 47cqw; height: 24.4cqw; background: ${u('hg')} center / contain no-repeat; margin-top: -1.4cqw; }
      #ttOv .tTx { ${hb('tplate', 40, 102, 5.7)} padding: 0 0.6cqw !important; display: grid; place-items: center; font-size: 2.8cqw; white-space: nowrap; margin-top: 0.6cqw; }
      #ttOv .tCnt { margin-top: 2.4cqw; font-size: 2.35cqw; color: #e8dcf4; }
      #ttOv .tCnt b { color: #fff; }
      #ttOv .tBts { display: flex; gap: 3.9cqw; margin-top: 1.8cqw; }
      #ttOv .tB { ${hb('gbtn', 40, 129, 7.3)} width: 26.2cqw; display: flex; align-items: center; justify-content: center; gap: 1.6cqw; font-size: 3.2cqw; font-weight: 800; color: #3a1e00; text-shadow: 0 1px 0 #ffe7a0; }
      #ttOv .tB.v { border-image-source: ${u('vbtn')}; width: 24.4cqw; color: #fff; text-shadow: 0 1px 2px #000; }
      #ttOv .tB img { width: 5cqw; height: 4cqw; object-fit: contain; }
      #ttOv .tB:disabled { filter: grayscale(.7) brightness(.65); }
      #ttOv .tB:not(:disabled):active { transform: scale(.96); }
      #ttOv .tNo { margin-top: 1.6cqw; font-size: 2.3cqw; color: #ffb0a0; text-align: center; }
      #ttOv .tTime { ${hb('time', 40, 85, 4.9)} padding: 0 0.6cqw !important; display: flex; align-items: center; justify-content: center; gap: 1.2cqw; font-size: 2.9cqw; font-weight: 700; color: #f6d690; white-space: nowrap; margin-top: -2.4cqw; }
      #ttOv .tTime img { width: 3.4cqw; height: 3.4cqw; }
      #ttOv .tPg { align-self: stretch; margin-top: -0.4cqw; box-sizing: border-box; border: 3.4cqw solid transparent; border-image: ${DY.page ? 'url("' + DY.page + '")' : 'none'} 40 fill stretch; padding: 0.4cqw 0 1.4cqw; display: flex; flex-direction: column; align-items: center; }
      #ttOv .tL { align-self: stretch; margin: 0 0.6cqw; background: linear-gradient(#1c0c30, #26123c); border: 0.25cqw solid #c89a5a; border-radius: 0.8cqw; }
      #ttOv .tR { display: flex; align-items: center; min-height: 6.35cqw; padding: 0.6cqw 0; border-bottom: 0.2cqw solid; border-image: linear-gradient(90deg, #0000, #b08050 15%, #b08050 85%, #0000) 1; }
      #ttOv .tR:last-child { border-bottom: none; border-image: none; }
      #ttOv .tR img { flex: none; width: 5.9cqw; height: 5cqw; object-fit: contain; margin: 0 2.2cqw 0 3.4cqw; }
      #ttOv .tR span { font-size: 2.8cqw; color: #f3eee8; line-height: 1.2; }
      #ttOv .tR span small { display: block; font-size: 2cqw; color: #cbb8e8; }
      #ttOv .tOk { margin-top: 2.6cqw; ${hb('gbtn', 40, 129, 8.3)} width: 32.7cqw; display: grid; place-items: center; font-size: 4cqw; font-weight: 800; color: #3a1e00; text-shadow: 0 1px 0 #ffe7a0; }
    `;
    document.head.appendChild(css);
    const ov = document.createElement('div'); ov.id = 'ttOv'; document.body.appendChild(ov);
    const btn = document.createElement('button'); btn.id = 'ttBtn'; btn.setAttribute('aria-label', 'Путешествие во времени'); btn.innerHTML = '<i></i>';
    const host = document.getElementById('cbMenu') && document.getElementById('cbMenu').parentNode; if (host) host.appendChild(btn);
    const dk = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
    const im = (src, cls) => src ? '<img src="' + src + '" alt=""' + (cls ? ' class="' + cls + '"' : '') + '>' : '';
    function travelWin() {
      const T = CFG.timeTravel, k = dk(), tc = C.travelCost(s, k), cc = C.travelCrystalCost(s, k), cn = (T.crystalCosts || []).length, cu = s.travel && s.travel.day === k ? (s.travel.cr | 0) : 0, used = s.travel && s.travel.day === k ? s.travel.used : 0, can = B.gt(C.offlineDps(s), 0);
      ov.innerHTML = '<div class="tW"><div class="tTi">Путешествие во времени</div><button class="tX" data-tt="x"></button><div class="tHg"></div>' +
        '<div class="tTx">Получить ' + T.hours + ' ч прогресса сразу</div>' +
        '<div class="tCnt">Бесплатно: <b>' + Math.max(0, T.freePerDay - used) + '/' + T.freePerDay + '</b> · За билеты: <b>' + Math.max(0, Math.min(T.paidPerDay, T.paidPerDay - (used - T.freePerDay))) + '/' + T.paidPerDay + '</b> · За 💎: <b>' + (cn - cu) + '/' + cn + '</b></div>' +
        '<div class="tBts"><button class="tB" data-tt="go"' + (can && tc === 0 ? '' : ' disabled') + '>Бесплатно</button><button class="tB v" data-tt="go"' + (can && tc > 0 && s.tickets >= tc ? '' : ' disabled') + '>' + im(MK.i_ticket) + (tc > 0 ? tc : T.ticketCost) + '</button>' +
          (cn ? '<button class="tB v" data-tt="cr"' + (can && cc != null && (s.crystals | 0) >= cc ? '' : ' disabled') + '>💎' + (cc != null ? cc : T.crystalCosts[cn - 1]) + '</button>' : '') + '</div>' +
        (can ? (tc == null && cc == null ? '<div class="tNo">На сегодня путешествия закончились — завтра снова</div>' : '') : '<div class="tNo">Наймите героев — без них офлайн-прогресса нет</div>') + '</div>';
      ov.classList.add('show');
    }
    function report(r, title) {
      const rows = [], M = CFG.materials;
      if (B.gt(C.offlineDps(s), 0)) {
        rows.push([PF.p_tower, r.floorsCleared ? 'Этажей: ' + r.floorsCleared + ' (' + r.fromFloor + ' → ' + (r.wallFloor || r.toFloor) + ')' : 'Новых этажей нет', r.wallFloor ? 'босс ' + r.wallFloor + ' не по силам — фарм ' + r.farmFloor : '']);
        rows.push([PF.p_coins, '+' + fmt(r.gold)]);
        rows.push([PF.p_skull, 'Врагов: ' + fmt(r.kills)]);
        if (r.shard) rows.push([MK.i_shard, '+' + fmt(r.shard)]);
        if (r.tickets) rows.push([MK.i_ticket, '+' + r.tickets]);
        if (r.crystals) rows.push([RG.i_crystal, '+' + r.crystals]);
      } else rows.push([PF.p_lock, 'Герои не наняты — офлайн-дохода нет']);
      const h = Math.floor(r.seconds / 3600), m = Math.floor(r.seconds % 3600 / 60);
      ov.innerHTML = '<div class="tW rep"><div class="tTi">' + title + '</div><button class="tX" data-tt="x"></button><div class="tTime">' + im(A.clock) + (h ? h + ' ч ' : '') + m + ' мин' + (r.capped ? ' (макс.)' : '') + '</div>' +
        '<div class="tPg"><div class="tL">' + rows.map(([ic, t, sub]) => '<div class="tR">' + im(ic) + '<span>' + t + (sub ? '<small>' + sub + '</small>' : '') + '</span></div>').join('') + '</div><button class="tOk" data-tt="x">Забрать</button></div></div>';
      ov.classList.add('show');
    }
    window.TT_REPORT = report;
    ov.addEventListener('click', e => {
      const b = e.target.closest('[data-tt]');
      if (!b) { if (e.target === ov) ov.classList.remove('show'); return; }
      if (b.disabled) return;
      if (b.dataset.tt === 'x') { ov.classList.remove('show'); return; }
      if (s.mode) { toast('Сначала выйдите из режима'); return; }
      const r = b.dataset.tt === 'cr' ? C.timeTravelCrystals(s, dk()) : C.timeTravel(s, dk()); if (!r) return;
      ov.classList.remove('show'); report(r, 'Путешествие во времени'); save(); render();
    });
    btn.addEventListener('click', e => { e.stopPropagation(); travelWin(); });
    setInterval(() => { const tc = C.travelCost(s, dk()); btn.classList.toggle('dot', tc === 0 && B.gt(C.offlineDps(s), 0)); }, 1000);
  })();
