// 0.98: темп начала игры (решение пользователя 06.11): Портал ~10 мин, Кузница ~30 мин, первый этаж — сразу.
// Бот tools/balance.js, 6 тапов/с. Широкие рамки — тест ловит поломку баланса, а не шум удачи.
const test = require('node:test'), assert = require('node:assert');
const { bot } = require('../tools/balance.js');
test('баланс: первые 40 минут идут в целевом темпе', () => {
  const b = bot({ tps: 6, fps: 10, seed: 7 }); let t2, t25, t50;
  while (b.st.t < 40 * 60) { b.play(15); const m = b.s.maxFloor;
    if (t2 == null && m >= 2) t2 = b.st.t; if (t25 == null && m >= 25) t25 = b.st.t; if (t50 == null && m >= 50) t50 = b.st.t; }
  assert.ok(t2 != null && t2 < 60, 'первый этаж проходится за минуту: ' + t2);
  assert.ok(t25 != null && t25 > 3 * 60 && t25 < 15 * 60, 'Портал (этаж 25) — 3–15 мин: ' + (t25 / 60).toFixed(1));
  assert.ok(t50 != null && t50 > 15 * 60 && t50 < 40 * 60, 'Кузница (этаж 50) — 15–40 мин: ' + (t50 && (t50 / 60).toFixed(1)));
  assert.ok(b.st.fails > 0, 'боссы иногда побеждают — таймер имеет смысл');
});
