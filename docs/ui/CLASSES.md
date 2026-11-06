# Классы главного героя (экран; вход — меню ☰ лагеря)

## Правила (GDD §6, CONFIG.classes)
С `CONFIG.classes.unlockFloor` этажа; очки — за этажи (`pointsPerFloors`) и регрессии (`pointsPerRitual`). Один класс из 4 (Мастер клинка, Призыватель, Охотник, Алхимик), смена раз в день — очки возвращаются. У класса 3 навыка по 10 уровней.

## Решения пользователя (6 ноября)
- Вход — пункт «Классы» в меню ☰ лагеря (старое место в вкладке героев убрано вместе с ней).
- Вид — дерево навыков.

## Шаг 1 — макет (референс)
```
Mobile game hero class talent tree screen, vertical 9:16 portrait, dark fantasy manhwa style, same style as the other Tower screens (violet and gold ornaments). Background: a dark stone hall inside the Tower with a giant glowing violet rune circle on the floor and floating runes, dark mood. Top: a thin dark strip with a square back button on the left, an ornate title plate "Classes" in the center, a skill points counter on the right. Under it a row of 4 round class emblems in ornate frames with names below: Blade Master (crossed swords), Summoner (violet portal), Hunter (bow and target), Alchemist (flask) — the selected one glowing gold. Middle: a talent tree for the selected class: a big round class emblem at the top, from it three glowing violet lines going down to three big round skill nodes in ornate frames (one in the center lower, two on the sides), each node with a skill icon, a level badge "3/10" and a name plate under it; locked nodes darker. Bottom: an ornate info panel for the selected skill with its icon, name, effect text "+25% hero damage per level" and current bonus, a big gold "Upgrade" button with a point cost, and a small dark "Change class" button with a note "once a day". Readable at phone size, uncluttered.
```
