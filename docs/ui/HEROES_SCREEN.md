# Герои и отряд (экран; сейчас — старая вкладка heroes)

## Решения пользователя (6 ноября)
- Список — сетка портретов, как в Idle Heroes (ранг, звёзды); тап — окно героя.
- **Отряда нет** (GDD §2: все нанятые бьют невидимо, ульта только у главного героя) — без слотов отряда, пресетов и кнопки «В отряд». Остатки отряда в коде (`s.squad`) на экране не показываем.
- Окно героя — большой арт в рост: урон, звёзды, ранг, эволюция, копии; кнопки ★ и Эволюция.
- **Связей нет** (не в GDD) — выключены: `CONFIG.disabled` += 'bonds' (0.119).
- Фильтры по редкости и стороне — ряд кнопок над сеткой.

## Шаг 1 — макет экрана списка (референс)
```
Mobile game heroes collection screen, vertical 9:16 portrait, dark fantasy manhwa style, same style as the other Tower screens (violet and gold ornaments). Background: a dark stone barracks hall inside the Tower with weapon racks, banners and violet torches, dark mood. Top: a thin dark strip with a square back button on the left, an ornate title plate "Heroes" in the center, shards and crystal currencies with "+" on the right. Under it a wide ornate panel with the total heroes damage number and "Heroes 24/52" collection counter. Below a row of small round filter buttons: All, E, D, C, B, A, S and four faction emblems (light, dark, wild, shadow). Middle: a scrollable grid of hero portrait cards, 5 per row, 5 rows: each card is a square portrait in a frame colored by rarity (grey, bronze, green, blue, violet, gold) with a rarity letter badge in the top left corner, a row of small stars at the bottom and a level number; some have a small red dot (can upgrade); the last row has darkened locked silhouettes with a lock. Readable at phone size, uncluttered.
```

## Шаг 2 — макет окна героя (референс)
```
Same style, hero detail window over the heroes screen: a big full-body anime fantasy hero art in the center on a violet glowing rune circle, name plate with the rarity badge and faction emblem on top, a row of 15 small stars (some gold, some empty) under the name, on the left a column of small stat plates (damage, rank, evolution stage, copies), on the right a short biography plate with a quote, and at the bottom two big buttons: "Star up" with a shard price and "Evolve" with a material price. Left and right arrows on the sides to switch heroes. Readable at phone size.
```

## Макеты пользователя — references/heroes_mockup_v1.png и hero_window_mockup_v1.png (1024×1536, приняты)
Список: назад, валюты, плашка «Герои», панель «урон | Герои 24/52», ряд круглых фильтров (Все, E–S | 4 стороны), сетка 5 в ряд — портрет в рамке цвета редкости, буква редкости, Lv, звёзды, красная точка; закрытые — силуэт с замком.
Окно: щит редкости, имя, щит стороны, ✕; полоса 15 звёзд; слева плашки Урон / Уровень / Ранг / Эволюция; справа «Биография» с цитатой; арт в рост на рунном круге; стрелки ‹ ›; кнопки «Повысить ★ (копии 3/5)», «Повысить ранг (осколки)», «Эволюция (осколки)».
Правки при сборке: числа из игры; ранг — осколки (на макете 💎); эволюция — 3 ступени (на макете 3/5); арт в рост — пока side/аватар из assets/art/heroes (есть у 13 героев), у остальных — силуэт.

## Лист A — интерфейс
```
Game UI asset sheet, dark fantasy manhwa style matching a violet heroes screen with gold-violet ornaments, flat solid pure green (#00FF00) background, 4x4 grid with wide spacing, each item separate, NO TEXT anywhere: 1) wide dark panel with gold-violet ornate border (empty, no divider); 2) small round dark filter button with gold rim (empty); 3) same round button glowing violet (active, empty); 4) round emblem: gold radiant star on dark (light side); 5) round emblem: violet trident on dark (dark side); 6) round emblem: green leaf on dark (wild side); 7) round emblem: violet eye on dark (shadow side); 8) big tall window frame, dark violet with ornate gold-violet border and a spiky crown ornament on top center (empty); 9) wide ornate name plate (empty); 10) gold shield badge (empty); 11) violet shield badge (empty); 12) long thin plate for a row of stars (empty); 13) small dark stat plate with gold-violet border (empty); 14) tall dark parchment-violet plate with ornate border for text (empty); 15) square gold arrow button pointing left; 16) square red close button with a gold X.
```

## Лист B — кнопки и иконки
```
Game UI asset sheet, same style, flat solid pure green (#00FF00) background, 4x3 grid with wide spacing, each item separate, NO TEXT: 1) big ornate gold button with an inner dark plate in the lower half (empty); 2) big ornate violet button with an inner dark plate in the lower half (empty); 3) big ornate gold-violet button with an inner dark plate in the lower half (empty); 4) two crossed gold swords icon; 5) group of three violet hero silhouettes icon; 6) gold rising bars level icon; 7) gold laurel wreath badge (empty center, for a rank letter); 8) violet swirling vortex evolution icon; 9) gold padlock; 10) big gold five-pointed star; 11) empty grey star; 12) glowing violet magic rune circle seen in perspective from above (flat ellipse).
```

## Лист C — рамки редкостей
```
Game UI asset sheet, same style, flat solid pure green (#00FF00) background, 5x2 grid with wide spacing, each item separate, NO TEXT, all the same size and shape: square hero portrait frames with an ornate metal border and an empty dark transparent center: 1) grey steel (E); 2) bronze-orange (D); 3) emerald green (C); 4) sapphire blue (B); 5) amethyst violet (A); 6) gold (S); 7) ruby red (SS); 8) white platinum with light blue glow (SSS); 9) rainbow spectral (GOD); 10) dark iron frame with dim glow (locked).
```

## Фон (без интерфейса)
```
Vertical 2:3 mobile game background, dark fantasy manhwa style: a dark stone barracks hall inside the Tower with gothic arches and hanging chains, weapon racks with spears and swords on the left, a dark knight armor stand on the right, violet banners with a trident emblem, violet flames in braziers on both sides, cracked stone floor at the bottom. Top part detailed, the middle calmer and darker for a grid of cards. No text, no UI.
```
