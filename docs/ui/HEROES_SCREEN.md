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
