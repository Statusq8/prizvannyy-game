  // ===================== 0.94: кнопка «Назад» Android и звук при сворачивании (мост MainActivity → window.PZ) =====================
  (function () {
    const PZ = window.PZ = window.PZ || {};
    const vis = el => !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
    const q = sel => document.querySelector(sel);
    // Сверху вниз: что закрывается первым. true — окно закрыто, false — закрывать нечего (приложение свернётся).
    const STEPS = [
      () => { const o = q('.sysOv.show'); if (!o) return false; o.classList.remove('show'); return true; },
      () => { const o = q('.proOv.show'); if (!o) return false; o.classList.remove('show'); return true; },
      () => { const b = q('.fgPop [data-fgx]'); if (!vis(b)) return false; b.click(); return true; },
      () => { const o = q('#ui2Pop.show'); if (!o) return false; o.classList.remove('show'); return true; },
      () => { const o = q('#sumFx.show #sfSkip'); if (!vis(o)) return false; o.click(); return true; },
      () => { const o = q('#campMore.show'); if (!o) return false; o.classList.remove('show'); return true; },
      () => { if (!document.body.classList.contains('oldOpen')) return false; const b = q('#oldBack'); if (b) b.click(); return true; },
      () => { const b = [...document.querySelectorAll('.pg.show [data-back]')].find(vis); if (!b) return false; b.click(); return true; },
      () => { const c = q('#camp.show'); if (!c) return false; const b = q('#campBack'); if (b) b.click(); return true; },
    ];
    PZ.ui = { modal: {
      get isOpen() { return !!(q('.sysOv.show') || q('.proOv.show') || q('#ui2Pop.show') || q('#campMore.show') || q('#camp.show') || document.body.classList.contains('oldOpen') || q('.pg.show')); },
      close() { for (const f of STEPS) { try { if (f()) return true; } catch (e) {} } return false; },
    } };
    PZ.audio = {
      suspend() { try { document.querySelectorAll('audio').forEach(a => { if (!a.paused) { a.dataset.pzWas = '1'; a.pause(); } }); } catch (e) {} },
      resume() { try { document.querySelectorAll('audio[data-pz-was]').forEach(a => { delete a.dataset.pzWas; a.play().catch(() => {}); }); } catch (e) {} },
    };
  })();
