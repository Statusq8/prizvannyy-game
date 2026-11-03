/* M7: блоки «Перерождение» и «Реликвии» (экран «Ещё») и магазин свитков (экран «Призыв»). */
(function (PZ) {
  const { fmt, h, img, toast, modal, setBtn } = PZ.ui;
  const A = PZ.A;
  let branch = 'Разрушение';

  function rebirthBlock() {
    const s = PZ.game.s, can = PZ.meta.canRebirth(s), sh = PZ.meta.shardsPreview(s), need = PZ.B.meta.rebirthFloor;
    const box = h('div', { class: 'section reb' + (can ? ' ready' : '') },
      h('h3', null, 'Перерождение'),
      h('div', { class: 'sub' }, can ? 'Доступно. Награда сейчас: ' + sh + ' осколков.' : 'Откроется после этажа ' + need + ' (пройдено ' + s.run.cleared + ').'),
      h('div', { class: 'cols2' },
        h('div', null, h('b', { class: 'bad' }, 'Сбросится'), h('ul', null, h('li', null, 'этажи забега'), h('li', null, 'золото'), h('li', null, 'наём и уровни героев'), h('li', null, 'уровень Призванного'))),
        h('div', null, h('b', { class: 'good' }, 'Останется'), h('ul', null, h('li', null, 'рекорд ' + s.account.record), h('li', null, 'коллекция и звёзды'), h('li', null, 'ранги и кости'), h('li', null, 'реликвии, свитки, материалы')))),
      h('button', { class: 'btn gold', style: 'width:100%;margin-top:8px', disabled: !can, onclick: () => confirmRebirth() }, 'Переродиться', h('small', null, can ? '+' + sh + ' осколков' : 'этаж ' + need)));
    return box;
  }
  function confirmRebirth() {
    const s = PZ.game.s, sh = PZ.meta.shardsPreview(s);
    modal.open('Переродиться?', h('div', null,
      h('p', null, 'Вы начнёте с этажа 1 и получите ' + sh + ' осколков для реликвий. Коллекция, звёзды, ранги, кости, реликвии и рекорд сохранятся.'),
      h('div', { class: 'btnrow' },
        h('button', { class: 'btn gold', onclick: () => { const r = PZ.meta.rebirth(s); modal.close(); if (!r.ok) return toast(r.err); PZ.app.saveNow(); toast('Перерождение! +' + r.shards + ' осколков'); PZ.app.go('more'); } }, 'Да, переродиться'),
        h('button', { class: 'btn ghost', onclick: () => modal.close() }, 'Отмена'))));
  }

  function relicsBlock() {
    const s = PZ.game.s, R = PZ.relics;
    const wrap = h('div', { class: 'section' });
    const draw = () => {
      wrap.innerHTML = '';
      const branches = [...new Set(R.RELICS.map(r => r.branch))];
      const chips = h('div', { class: 'chips', style: 'padding:6px 0' }, ...branches.map(b => h('button', { class: b === branch ? 'on' : '', onclick: () => { branch = b; draw(); } }, b)));
      wrap.append(h('div', { class: 'row' }, h('h3', { style: 'flex:1;margin:0' }, 'Реликвии'), h('div', { class: 'res' }, img(A.ico_relic), h('b', null, s.account.shards || 0))), chips);
      for (const r of R.RELICS.filter(x => x.branch === branch)) {
        const l = R.lvl(s, r.id), max = l >= PZ.B.meta.maxRelicLevel, cost = R.relicCost(r.id, l);
        const b = h('button', { class: 'btn', disabled: max || (s.account.shards || 0) < cost, onclick: () => { const x = R.buyRelic(s, r.id); if (!x.ok) return toast(x.err); toast(r.name + ': ур. ' + x.level); PZ.app.saveNow(); draw(); } });
        setBtn(b, max ? 'Макс.' : l ? 'Ур. +1' : 'Купить', max ? '' : '◆ ' + cost);
        wrap.append(h('div', { class: 'card relic' },
          h('div', { class: 'info' }, h('div', { class: 't' }, r.name + (l ? ' · ур. ' + l : '')),
            h('div', { class: 's' }, l ? 'Сейчас: ' + R.effectText(r, l) + (max ? '' : ' · далее ' + R.effectText(r, l + 1).replace(/^.*?(×|−|\+)/, '$1')) : 'Ур. 1: ' + R.effectText(r, 1))), b));
      }
      wrap.append(h('div', { class: 'sub', style: 'margin-top:6px' }, 'Реликвии навсегда. Цена удваивается с каждым уровнем, максимум 10. Числа — тестовые (GDD 9.3).'));
    };
    draw();
    return wrap;
  }

  // Магазин свитков для экрана «Призыв»
  function shopBlock() {
    const b1 = h('button', { class: 'btn' }), b10 = h('button', { class: 'btn' });
    const box = h('div', { class: 'section' }, h('h3', null, 'Свитки за золото'),
      h('div', { class: 'sub', style: 'margin-bottom:8px' }, 'Цена зависит от этажа и растёт с каждой покупкой в забеге (сбрасывается при перерождении).'),
      h('div', { class: 'btnrow' }, b1, b10));
    const buy = n => { const r = PZ.meta.buyScrolls(PZ.game.s, n); if (!r.ok) return toast(r.err); toast('+' + n + ' свитк.'); PZ.summonUi.render(); };
    b1.addEventListener('click', e => { e.stopPropagation(); buy(1); });
    b10.addEventListener('click', e => { e.stopPropagation(); buy(10); });
    box.update = () => {
      const s = PZ.game.s, p1 = PZ.meta.scrollPrice(s, 1), p10 = PZ.meta.scrollPrice(s, 10);
      setBtn(b1, 'Купить 1', '🪙 ' + fmt(p1), s.run.gold < p1); setBtn(b10, 'Купить 10', '🪙 ' + fmt(p10), s.run.gold < p10);
    };
    return box;
  }

  PZ.metaUi = { rebirthBlock, relicsBlock, shopBlock };
})(globalThis.PZ);
