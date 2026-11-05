# Оформление: листы картинок для Nano Banana (без экрана боя)

Решение пользователя (2026-11-05): **бой (экран боя, анимации) — на паузе, в конец**. Сейчас оформляем всё остальное: меню, разделы, иконки, рамки, окна.

## Как генерировать
- К каждому листу **прикладывать образец стиля**: макет пользователя `docs/reference/reference_battle_layout_2026-11-05.png` (тёмное серебро с узорами, фиолетовый неон, кристаллы).
- Один лист = много предметов в сетке на **чисто-зелёном фоне #00FF00** (кроме фонов и баннеров). Claude режет лист сам: `python3 tools/iconsheet.py <лист.png> <номер листа>` → `assets/ui/…`.
- Предметы — **ровно в указанном порядке**, по сетке, с промежутками, без текста.
- Если предмет вышел плохо — перегенерировать весь лист (так стиль совпадёт).

**Начало каждого промта (общая часть стиля) — вставлять перед текстом листа:**
```
Mobile gacha game UI asset sheet in the exact style of the attached reference: dark tarnished silver metal with ornate gothic filigree and sharp spikes, deep purple neon glow, small magenta crystals, dark fantasy, crisp clean edges, high detail, front view, no perspective.
```

Итого: **18 листов ≈ 175 картинок.**

---

## Лист 1 — Рамки и кнопки (12) · сетка 4×3
```
Layout: 4 columns x 3 rows, each item centered in its own cell with wide gaps. Items in order:
1) wide page title plate (long horizontal, pointed ends, empty center);
2) back button (arrow-shaped plate pointing left, no arrow symbol inside);
3) square tab button, normal state; 4) same tab button, active state with gold glow;
5) wide menu card frame (horizontal rectangle, empty dark center);
6) wide hero card frame (horizontal rectangle with a square portrait slot on the left);
7) square item cell frame, normal; 8) square item cell frame with strong purple rare glow;
9) red action button (wide, empty); 10) gold action button (wide, empty);
11) small dark chip button (pill shape); 12) round close button frame (empty).
All empty inside, no text, no symbols. Solid pure green background #00FF00.
```

## Лист 2 — Окна и полосы (12) · сетка 4×3
```
Layout: 4 columns x 3 rows, wide gaps. Items in order:
1) large "System window" frame: black glassy panel with thin glowing purple border and corner ornaments (tall rectangle, empty);
2) small popup frame (square, empty);
3) toggle switch OFF; 4) toggle switch ON (glowing purple);
5) long progress bar frame (empty); 6) purple glowing bar fill; 7) gold bar fill;
8) currency plate (small horizontal pill with round icon slot on the left, empty);
9) green plus button (small square); 10) red notification badge (small circle, empty);
11) checkbox empty; 12) checkbox checked (purple tick).
No text. Solid pure green background #00FF00.
```

## Лист 3 — Иконки меню, часть 1 (12) · сетка 4×3
```
Layout: 4 columns x 3 rows of square icons, same size, wide gaps. Each icon: bold glowing symbol on a dark rounded-square metal tile with silver filigree border. In order:
1) crossed swords (Upgrade); 2) glowing ancient relic gem (Artifacts); 3) leather bag (Bag); 4) small dragon head (Pets);
5) swirling purple portal (Portal); 6) knight helmet with banner (Heroes & squad); 7) open old book (Diary);
8) ghost soul flame (Souls & ritual); 9) constellation of stars connected by lines (Skill tree); 10) altar with candles (Altar);
11) rune stone (Runes); 12) monster bone (Bones).
No text. Solid pure green background #00FF00.
```

## Лист 4 — Иконки меню, часть 2 (12) · сетка 4×3
```
Same style as before: 4 columns x 3 rows of square icons on dark metal tiles. In order:
1) scroll with seal (Quests); 2) envelope with wax seal (Mail); 3) calendar page (Daily login); 4) medal ribbon (Season pass);
5) paper lantern (Events); 6) treasure chest with coins (Shop); 7) hooded figure portrait (Profile); 8) gear with crystal (Settings);
9) camera (Photo mode); 10) floppy save crystal (Backups); 11) tall dark tower (Tower map); 12) golden trophy cup (PvE).
No text. Solid pure green background #00FF00.
```

## Лист 5 — Валюты и материалы (12) · сетка 4×3
```
4 columns x 3 rows of glossy game resource icons, no tiles, same lighting. In order:
1) gold coin with tower emblem; 2) purple summon ticket; 3) ghostly soul wisp; 4) white-violet essence star;
5) blue tower shard crystal; 6) small pile of bone dust; 7) glowing red event lantern; 8) guardian heart (dark red crystal heart);
9) experience crystal (purple); 10) gold star; 11) crown; 12) padlock.
No text. Solid pure green background #00FF00.
```

## Лист 6 — Артефакты (10) · сетка 5×2
```
5 columns x 2 rows of ancient glowing relic icons, each on its own subtle round glow, same style. In order:
1) Blade of the First Summon — sword with purple runes; 2) Hunter's Eye — glowing eye amulet; 3) Abyss Fang — black fang with violet aura;
4) Blood Grail — red goblet; 5) Squad Banner — torn war banner; 6) Titan Gauntlet — huge armored glove;
7) Phoenix Feather — burning feather; 8) Hourglass — ornate sand clock; 9) Tower Crown — dark crown with crystal; 10) Gate of Ascension — small glowing portal arch.
No text. Solid pure green background #00FF00.
```

## Лист 7 — Руны и кости (12) · сетка 4×3
```
4 columns x 3 rows. Row 1-2 first six: carved glowing rune stones, each a different color and rune: power (red), squad (green), strike (orange), hunt (yellow), wealth (gold), stone (grey-blue).
Last six: monster bone armor pieces: skull helmet, rib chest plate, right bone arm, left bone arm, right bone leg, left bone leg.
No text. Solid pure green background #00FF00.
```

## Лист 8 — Зелья, подземелья, события, способности (12) · сетка 4×3
```
4 columns x 3 rows of icons. In order:
1) potion of greed (gold liquid flask); 2) potion of fury (red flask); 3) potion of harvest (blue flask);
4) treasury dungeon (vault door with gold); 5) shard mine (crystal cave entrance); 6) rune forge (anvil with rune);
7) event gold rush (coins burst); 8) event rare invasion (sparkling monster eye); 9) event boss hunt (horned skull); 10) event blood moon (red moon);
11) ability storm of blows (sword with motion lines); 12) ability hunter's mark (crosshair mark).
No text. Solid pure green background #00FF00.
```

## Лист 9 — Рамки профиля (10) · сетка 5×2
```
5 columns x 2 rows of ornate ROUND portrait frames (rings), empty transparent-looking center, increasing grandeur: 1) bronze; 2) silver; 3) gold; 4) platinum; 5) emerald; 6) diamond; 7) blood red; 8) shadow purple; 9) starry; 10) divine white-gold with halo.
No text. Solid pure green background #00FF00.
```

## Лист 10 — Редкость и звёзды (12) · сетка 4×3
```
4 columns x 3 rows of small badge icons. First nine: shield-shaped rarity badges with metal letter plates, colors: grey, green, blue, purple, red, orange-gold, deep orange, magenta, white-gold divine (leave the plate empty, no letters).
Last three: gold star, crimson star, violet star.
No text. Solid pure green background #00FF00.
```

## Лист 11 — Портал призыва (4) · сетка 2×2
```
2 columns x 2 rows, large items. In order:
1) huge gothic stone summoning gate arch with an empty dark opening (portal glow will be added in game);
2) summon card BACK (tall card, purple ornate pattern, crystal in center);
3) summon card FRONT frame (tall card frame, empty center for a hero portrait, silver filigree);
4) swirling purple vortex texture (round, for the portal opening).
No text. Solid pure green background #00FF00.
```

## Лист 12 — Карта Башни (6) · сетка 3×2
```
3 columns x 2 rows. In order:
1) tower floor room tile (wide horizontal stone hall slice with arches, normal);
2) same room tile, current floor (warm gold glow);
3) same room tile, locked (dark, chains);
4) zone banner plate (long horizontal ribbon-plate for a location name, empty);
5) small shadow-tower portal button (dark round button with black-violet vortex);
6) boss crown marker and skull marker side by side.
No text. Solid pure green background #00FF00.
```

## Лист 13 — Страница героя (6) · сетка 3×2
```
3 columns x 2 rows. In order:
1) dark skeleton silhouette (full body, front, faint purple outline) for bone slots;
2) bone slot frame (square with skull corners);
3) gem socket (empty round socket);
4) stat panel background (wide dark plate);
5) level milestone badge "x3" plate without text (small gold plaque);
6) bond chain icon (two linked chains).
No text. Solid pure green background #00FF00.
```

## Лист 14 — Фоны разделов (4 отдельные картинки, 9:16)
Генерировать **по одному**, вертикально 9:16, без зелёного фона:
```
Vertical 9:16 mobile game menu background, dark fantasy: interior of an endless dark tower, tall gothic pillars fading into darkness, a faint purple glow from far above, floating dust, very dark and low detail in the center so menus stay readable. No characters, no text, no UI.
```
Варианты (заменить первую фразу): **меню**, **портал** — «ritual chamber with a giant summoning circle on the floor», **профиль** — «quiet hall of trophies and banners», **карта** — «view up the inside of a spiral tower shaft».

## Лист 15 — Баннеры PvE (8) · сетка 2×4, с фоном
```
2 columns x 4 rows of wide horizontal banner illustrations (3:1), each a small scene, dark fantasy, purple accents, no text:
1) treasury vault full of gold; 2) shard mine with blue crystals; 3) rune forge with glowing anvil; 4) endless dungeon stairs going down;
5) trial tower with a single guardian; 6) personal boss lair with a huge silhouette; 7) secret hidden room with a key; 8) echo of the tower — ghostly copy of a hall.
Thin dark gaps between banners.
```

## Лист 16 — Логотип и значок
```
Game logo for "Призванный: Башня Гачи" — gothic metal letters with purple neon glow and a small tower emblem, dark fantasy, on solid pure green background #00FF00.
```
```
Square app icon: a dark armored swordsman silhouette in front of a glowing purple tower, bold, readable at small size, rounded square.
```

## Лист 17 — Экран загрузки (9:16)
```
Vertical 9:16 loading screen art: the dark swordsman seen from behind looking up at an enormous endless tower piercing purple clouds, dramatic, epic scale, empty space at the bottom for a loading bar. No text.
```

## Лист 18 — Задания и награды (8) · сетка 4×2
```
4 columns x 2 rows. In order: 1) quest window header ornament (wide, "QUEST" style frame without text); 2) daily login calendar cell (square plate); 3) claimed check stamp; 4) reward chest closed;
5) reward chest open with light; 6) mail letter; 7) title ribbon banner (empty); 8) trophy plaque.
No text. Solid pure green background #00FF00.
```

---
## Порядок
1. Листы 1–2 (рамки, кнопки, окна) — меняют вид всех экранов сразу.
2. Листы 3–5 (иконки меню и валюты).
3. Листы 6–13 (разделы).
4. Листы 14–18 (фоны, баннеры, логотип).

Бой (HUD, враги, анимации героев и ульта) — потом, отдельно.
