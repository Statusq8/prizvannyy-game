# Кузница (островок лагеря, этаж 50)

## Решения пользователя (6 ноября)
1. **Всё ремесло вкладками** — Артефакты, Руны, Алтарь, Кости. Вкладка появляется, только когда её функция открыта (артефакты 50, руны 150, алтарь — с ритуалом 200, кости 2000). На 50 этаже видна одна вкладка — «Артефакты».
2. **Валюта артефактов — души.** Души падают с мега-боссов (каждые 50 этажей) ещё до Ритуала; Ритуал потом даёт их много. (В ядре уже есть: CONFIG.megaSouls, первый мега-босс дарит первый артефакт.)
3. ~~Случайная ковка~~ → **«как у них» (Крушители), 0.92:** витрина из 3 случайных ненайденных артефактов. Купленный слот пустеет; «Обновить» — новые предложения за треть цены следующей покупки; пустая витрина заполняется сама. Цена покупки растёт с каждым найденным (CONFIG.artifactFind / CONFIG.artShop).
4. **Две ветки, как души/сердца в Крушителях:** артефакты душ (👻) и **кровавые артефакты** за осколки Башни (🔹 — у нас сердца слиты в осколки). У каждой ветки своя витрина и своя цена; покупки одной не дорожают другую. Кровавые: катар, перчатка, котёл, топор, кукла. Найденные качаются в своей валюте, все действуют сразу.

## Шаг 1 — макет экрана (референс)
```
Mobile game forge screen, vertical 9:16 portrait, dark fantasy manhwa style, in the layout of Dungeon Crusher artifacts screen. Background: a dark stone blacksmith hall inside a floating islet, huge anvil with glowing orange runes, forge fire and sparks, chains, violet crystals, dark mood. Top: a thin dark strip for currencies (souls icon with a number on the right). Under it a back button, a title plate and a row of 4 square tab buttons (artifacts, runes, altar, bones), the first selected and glowing. Upper half: a grid of owned artifacts as square ornate cells (4 per row) — each cell holds an artifact (dagger, eye, fang, grail, war banner, titan gauntlet, phoenix feather, hourglass, bloody katar, bloody doll) with a small level plate. Bottom half: a "shop counter" on the anvil — a row of 3 tall offer cards (ornate dark frames with an artifact icon, empty name plate and an orange-gold "buy" button with a price), a smaller round "refresh" button with a circular arrow next to it, and two small switch plates above the counter: a ghostly blue-violet soul branch and a blood-red branch. Readable at phone size, uncluttered.
```

## Шаг 2 — лист деталей (после утверждения макета)
Будет дан после того, как пользователь пришлёт макет.
