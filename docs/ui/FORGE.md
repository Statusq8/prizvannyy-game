# Кузница (островок лагеря, этаж 50)

## Решения пользователя (6 ноября)
1. **Всё ремесло вкладками** — Артефакты, Руны, Алтарь, Кости. Вкладка появляется, только когда её функция открыта (артефакты 50, руны 150, алтарь — с ритуалом 200, кости 2000). На 50 этаже видна одна вкладка — «Артефакты».
2. **Валюта артефактов — души.** Души падают с мега-боссов (каждые 50 этажей) ещё до Ритуала; Ритуал потом даёт их много. (В ядре уже есть: CONFIG.megaSouls, первый мега-босс дарит первый артефакт.)
3. **Новый артефакт — случайная ковка**, как в Крушителях: кнопка «Выковать» даёт случайный ещё не найденный артефакт, цена растёт с каждым (CONFIG.artifactFind). Найденные качаются за души, все действуют сразу, без слотов.

## Шаг 1 — макет экрана (референс)
```
Mobile game forge screen, vertical 9:16 portrait, dark fantasy manhwa style, in the layout of Dungeon Crusher artifacts screen. Background: a dark stone blacksmith hall inside a floating islet, huge anvil with glowing orange runes, forge fire and sparks, chains, violet crystals, dark mood. Top: a thin dark strip for currencies (souls icon with a number on the right). Under it a back button, a title plate and a row of 4 square tab buttons (artifacts, runes, altar, bones), the first selected and glowing. Middle: a vertical scroll list of wide dark artifact cards — each card has a square ornate icon frame with an artifact (dagger, eye, fang, bloody grail, war banner, titan gauntlet, phoenix feather, hourglass), name plate, level, short bonus line and an orange-gold upgrade button on the right with a soul icon and price. Bottom: a big glowing anvil plate with a wide gold button "forge" and a soul price, small text space for "found 3 / 10". Readable at phone size, uncluttered.
```

## Шаг 2 — лист деталей (после утверждения макета)
Будет дан после того, как пользователь пришлёт макет.
