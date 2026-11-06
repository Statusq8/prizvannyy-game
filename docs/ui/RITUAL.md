# Регрессия (в коде — ritual; экран, без островка — из меню ☰ лагеря)

## Решения пользователя (6 ноября)
- Два ритуала, как в «Крушителях»: **тёмный** — бесплатно; **светлый** — за 💎 (`CONFIG.ritual.light`), души ×2.
- Ритуал — главный источник душ; открывается на `CONFIG.unlocks.ritual` (150).
- Своего островка нет.

## Шаг 1 — макет экрана (референс)
```
Mobile game prestige/rebirth screen, vertical 9:16 portrait, dark fantasy manhwa style. Background: a dark stone sanctuary inside the Tower, a large ritual altar in the center with a black stone bowl full of swirling violet souls, a glowing rune circle on the floor around it, violet flames in braziers, chains, ghostly souls flying up into the bowl, dark mood. Top: a thin dark strip with souls and crystal currencies on the right, a back button on the left and an ornate title plate. Under the title a panel "you will get": a big souls number with a ghost-soul icon and the damage bonus change. Middle: two columns of small plates — "will reset" (gold, hero levels, floor) with red marks, and "will stay" (heroes, stars, artifacts, souls) with green marks. Bottom: two big buttons side by side — a dark violet "Dark ritual" button (free) and a glowing white-gold "Light ritual" button with a crystal price and a "x2" badge. Readable at phone size, uncluttered.
```

## Макет пользователя — references/ritual_mockup_v1.png (1024×1536, принят как основа)
«Назад», души и 💎 с «+», плашка «Ритуал Перерождения»; панель «Вы получите»: +N душ и «Бонус к урону: X → Y»; алтарь с чашей душ; «Будет сброшено» (золото, уровни героев, этаж) с красными ✕ и «Сохранится» (герои, звёзды, артефакты, души) с зелёными ✓; кнопки «Тёмный ритуал — Бесплатно» и «Светлый ритуал — 💎 цена» с плашкой ×2.
Правки при сборке: **название «Регрессия»** — «Тёмная регрессия» / «Светлая регрессия», плашка — «Регрессия»; числа из игры; цена светлого — `CONFIG.ritual.light.crystals` (в игре 100, на макете 1500).

## Лист A — интерфейс
```
Game UI asset sheet, dark fantasy manhwa style matching a violet ritual screen with silver-violet ornaments, flat solid pure green (#00FF00) background, 4x3 grid with wide spacing, each item separate, NO TEXT anywhere: 1) square dark back button with a gold left chevron; 2) dark currency pill with a gold plus button on the right (empty); 3) wide ornate title plate with violet glow and spiky silver ends (empty); 4) small header plate with violet ornaments (empty); 5) wide dark panel frame with violet border (empty); 6) red header plate with dark ornaments (empty); 7) green header plate with dark ornaments (empty); 8) tall dark panel frame with red border (empty); 9) tall dark panel frame with green border (empty); 10) big ornate dark violet glowing button (empty); 11) big ornate white-gold glowing button (empty); 12) round red badge with gold rim (empty).
```

## Лист B — иконки
```
Game icon sheet, dark fantasy manhwa style, flat solid pure green (#00FF00) background, 5x2 grid with wide spacing, each icon separate, square, no frames, no text: 1) violet ghost soul flame with a skull face; 2) violet faceted crystal gem; 3) stack of gold coins; 4) gold hexagon badge with a dark center (empty, for a level label); 5) stone stairs going up; 6) group of three dark hooded hero silhouettes; 7) gold five-pointed star; 8) silver ring with a violet gem; 9) red X mark; 10) green check mark.
```

## Фон (без интерфейса)
```
Vertical 2:3 mobile game background, dark fantasy manhwa style: a dark stone sanctuary inside the Tower with pillars and hanging chains and violet banners, in the middle a large ritual altar — a black jagged stone bowl full of swirling violet souls with glowing rune, a glowing rune circle on the floor around it, violet flames in braziers on both sides, ghostly souls flying up from the bowl. Top fifth and bottom half calmer and darker for UI panels. No text, no UI.
```

## Собрано — 0.113
Листы → tools/regresscut.py → assets/regress; стили — src/regress.js (замеры макета 1024×1536 в cqw, фон-алтарь посередине между «Вы получите» и панелями); разметка — regressHtml в src/ui2.js (openX('regress'), из меню ☰ лагеря). Цена светлой — подобрать позже.
