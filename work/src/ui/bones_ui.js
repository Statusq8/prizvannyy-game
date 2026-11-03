/* Вкладка «Кости» в карточке героя: силуэт с 6 точками (не горизонтальные карточки — MASTER 1.5), поглощение, повышение ранга.
   Плюс склад костей (экран «Ещё») и подсказки. */
(function (PZ) {
  const { h, img, fmt, gem, toast } = PZ.ui;
  const A = PZ.A;
  const QGEM = ['E', 'D', 'C', 'B', 'A', 'S', 'SS'];             // цвет редкости кости = цвет ранга
  const qGem = q => gem(QGEM[q - 1]);
  const POS = { head: [50, 9], back: [50, 33], left_arm: [17, 43], right_arm: [83, 43], left_leg: [36, 84], right_leg: [64, 84] };

  function render(heroId) {
    const s = PZ.game.s, Bn = PZ.bones;
    const wrap = h('div');
    const draw = () => {
      wrap.innerHTML = '';
      const st = Bn.peekSet(s, heroId), q = Bn.requiredQuality(st.rank), next = Bn.nextRank(st.rank);
      const head = h('div', { class: 'bonehead' },
        h('div', null, h('div', { class: 'sub' }, 'Ранг'), h('div', { class: 'rankline' }, img(gem(st.rank), 'rg'), h('b', null, st.rank), next ? h('span', { class: 'sub' }, ' → ') : '', next ? img(gem(next), 'rg') : '', next ? h('b', null, next) : '')),
        q ? h('div', { style: 'text-align:right' }, h('div', { class: 'sub' }, 'Нужны кости'), h('div', { class: 'qname q' + q }, img(qGem(q), 'rg'), Bn.QUALITY[q - 1])) : h('b', null, 'Максимальный ранг'));
      wrap.append(head);
      if (!q) { wrap.append(h('div', { class: 'note' }, 'Герой достиг ранга БОГ.')); return; }
      const body = h('div', { class: 'body' }, img(A.hero_main_front, 'bodysil'));
      for (const sl of Bn.SLOTS) {
        const have = Bn.count(s, sl, q), on = st.slots[sl] === q;
        const b = h('button', { class: 'bslot' + (on ? ' on' : have ? ' can' : ''), title: Bn.SLOT_NAME[sl] },
          on ? img(qGem(q), 'g') : h('span', { class: 'plus' }, have ? '+' : ''),
          h('span', { class: 'lbl' }, Bn.SLOT_NAME[sl]), !on ? h('span', { class: 'cnt' }, '×' + have) : '');
        b.style.left = POS[sl][0] + '%'; b.style.top = POS[sl][1] + '%';
        b.addEventListener('click', () => {
          if (on) return toast(Bn.SLOT_NAME[sl] + ': уже поглощена');
          const r = Bn.absorb(s, heroId, sl);
          if (!r.ok) return toast(r.err);
          toast('Поглощено: ' + Bn.SLOT_NAME[sl].toLowerCase()); if (PZ.audio) PZ.audio.bone(); draw();
        });
        body.append(b);
      }
      wrap.append(body);
      const n = Bn.filled(s, heroId), cp = Bn.canPromote(s, heroId);
      const prog = h('div', { class: 'boneprog' }, h('i', { style: `width:${n / 6 * 100}%` }));
      wrap.append(h('div', { class: 'sub', style: 'text-align:center;margin:6px 0 4px' }, 'Поглощено ' + n + ' из 6'), prog);
      const btns = h('div', { class: 'btnrow', style: 'margin-top:10px;justify-content:center' },
        h('button', { class: 'btn', disabled: n === 6 || !Bn.SLOTS.some(sl => !st.slots[sl] && Bn.count(s, sl, q) > 0), onclick: () => { const k = Bn.absorbAll(s, heroId); toast('Поглощено костей: ' + k); draw(); } }, 'Поглотить всё'),
        h('button', { class: 'btn gold', disabled: !cp.ok, onclick: () => { const r = Bn.promote(s, heroId); if (!r.ok) return toast(r.err); toast('Новый ранг: ' + r.rank + '! Урон героя ×' + PZ.B.bones.rankDpsMult); if (PZ.audio) PZ.audio.fanfare(); PZ.app.saveNow(); draw(); } }, 'Повысить ранг', h('small', null, next ? st.rank + ' → ' + next : '')));
      wrap.append(btns);
      if (!cp.ok && cp.gate) wrap.append(h('div', { class: 'note' }, '🔒 ' + cp.err + '. Ограничение действует всегда — его не обходят ни портал, ни события.'));
      wrap.append(h('div', { class: 'note' }, 'Кости выпадают за победу на этаже, в том числе при фарме. Слот кости зависит от этажа (меняется каждые 5 этажей), редкость растёт с высотой: необычные с 51, редкие с 151, эпические с 301 этажа. Ранг сохраняется навсегда.'));
    };
    draw();
    return wrap;
  }

  // Склад: таблица слот × редкость (только непустые редкости)
  function inventory(s) {
    const Bn = PZ.bones, inv = s.account.bones || {};
    const qs = [1, 2, 3, 4, 5, 6, 7].filter(q => Bn.SLOTS.some(sl => inv[sl + '_' + q]));
    if (!qs.length) return h('div', { class: 'sub' }, 'Костей пока нет — они выпадают за победы на этажах.');
    const t = h('table', { class: 'btable' });
    t.append(h('tr', null, h('th', null, ''), ...qs.map(q => h('th', null, img(qGem(q), 'rg')))));
    for (const sl of Bn.SLOTS) t.append(h('tr', null, h('td', null, Bn.SLOT_NAME[sl]), ...qs.map(q => h('td', null, inv[sl + '_' + q] || '·'))));
    return h('div', { style: 'overflow-x:auto' }, t);
  }

  // Можно ли что-то сделать с костями у нанятых/полученных героев (для красной точки)
  function anyAction(s) {
    const Bn = PZ.bones;
    for (const id of Object.keys(s.account.owned)) {
      if (Bn.canPromote(s, id).ok) return true;
    }
    return false;
  }

  PZ.bonesUi = { render, inventory, anyAction, qGem };
})(globalThis.PZ);
