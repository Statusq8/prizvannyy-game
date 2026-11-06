# Путешествие во времени и отчёт «Пока вас не было» (окна поверх боя)

## Правила (CONFIG.timeTravel, CONFIG.offline)
Сразу получить `CONFIG.timeTravel.hours` ч офлайн-прогресса: раз в день бесплатно, ещё `paidPerDay` раза за `ticketCost` билетов. Офлайн копится до `CONFIG.offline.maxSec`. Отчёт: время, пройдено этажей (откуда → куда), стена босса, золото, враги, осколки, билеты.

## Решения пользователя (6 ноября)
- Вход — кнопка-песочные часы на экране боя, красная точка, когда есть бесплатное путешествие (раньше было в Почте, а Почта выключена).

## Шаг 1 — макет (референс)
```
Mobile game popup windows, vertical 9:16 portrait, dark fantasy manhwa style, same style as the other Tower screens (violet and gold ornaments), two windows shown one above the other over a darkened battle screen. Top window "Time Travel": an ornate violet-gold window with a title plate, a big glowing golden hourglass with violet sand and swirling clock runes in the center, a text plate "Get 4 hours of progress instantly", a row of 3 small reward plates with icons (gold coins, tower floors, shards) and "≈" numbers, a counter "Free: 1/1 · For tickets: 0/2", a big gold button "Free" and a smaller violet button with a ticket icon and price "3", and a close X. Bottom window "While you were away": an ornate window with a title plate, the time "2 h 9 min" under it, a scroll-like list of result rows with icons: tower "Floors: 12 (48 → 60)", gold coins "+3.22K", skull "Enemies: 340", blue shards "+15", tickets "+2", and a big gold "Claim" button. Readable at phone size.
```
