# Экран боя — интерфейс (5–6 ноября 2026)

Решение: экран боя первым; путь — макет экрана целиком → пользователь выбирает → лист деталей на зелёном фоне → нарезка и сборка.

## Что есть на экране (по прошлым ответам)
- Слева сверху — профиль: круглый аватар с уровнем, имя под ним.
- По центру сверху — плашка «Этаж N», под ней «Волна x/10» и 10 ромбиков (последний — босс), ниже — плашка с именем врага и полоса HP с цифрами.
- Справа сверху — золото, под ним урон в секунду (DPS).
- Слева под профилем — кнопка ⚔ (прокачка), справа — ⚙ (настройки).
- Внизу — главный герой со спины, под ним тонкая шкала ульты. Нижнего меню нет.

## Шаг 1 — промт макета
```
Mobile game UI mockup, vertical 9:16 portrait phone screen, dark fantasy idle tapper battle screen inside a purple-lit stone summoning hall. Top-left: a round ornate avatar frame with a hooded hero portrait and a small level badge under it, player name below. Top-center: an ornate dark-metal title plate reading floor number, under it a row of 10 small diamond wave markers (last one red for the boss), under that a dark banner plate with the monster name and a long red HP bar with a thin gold frame. Top-right: two stacked currency bars with round icons — a gold coin bar and a crossed-swords damage-per-second bar. Left side under the avatar: a square ornate button with crossed swords; right side: a square ornate button with a gear. Center: one big monster standing on a glowing violet summoning circle. Bottom center: the hero seen from behind, small, with a thin glowing ult charge bar under his feet. No bottom menu. UI style: dark gunmetal and black iron frames with violet glowing gems and fine silver filigree, consistent set, clean and readable, manhwa-style detailed 2D game art, dark purple neon palette, no real logos.
```
Пришли 2–4 варианта макета — выберешь один, по нему сделаю промт листа деталей (рамки, плашки, кнопки, полосы, иконки отдельно).
