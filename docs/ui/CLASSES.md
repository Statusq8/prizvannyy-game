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

## Макет пользователя — references/classes_mockup_v1.png (1024×1536, принят)
4 класса сверху (выбранный — золотой), большая эмблема класса с лаврами, линии к 3 навыкам (3/10 + плашка имени), под каждым — закрытый навык 2-го яруса с замком; внизу панель выбранного навыка: иконка, имя, эффект, «Текущий бонус», «Улучшить (очки)», «Сменить класс · 1 раз в сутки». Сверху справа — очки.
Решения: **2-й ярус добавить** (по 3 навыка на класс, открываются при 10/10 навыка над ним); цена — **1 очко за уровень**.

## 2-й ярус — предложение (виды бонусов, которые уже работают в коде)
- Мастер клинка: Клинок бури (+50% урона героя), Палач (+20% по боссам), Второе дыхание (−2% перезарядки).
- Призыватель: Единство (+50% урона союзников), Казна призывателя (+20% золота), Вечный дозор (+20% урона офлайн).
- Охотник: Смертельная стрела (+30% по боссам), Терпение (+1 с таймера босса, до 5), Трофейщик (+10% осколков).
- Алхимик: Золотой дождь (+40% золота), Кристальная жила (+15% осколков), Сосуд душ (+5% душ за регрессию).

## Лист A — интерфейс
```
Use the attached mockup as the exact style reference — same ornaments, colors and shapes. Game UI asset sheet, dark fantasy manhwa style, flat solid pure green (#00FF00) background, 4x3 grid with wide spacing, each item separate, NO TEXT anywhere, all round frames have an empty transparent center: 1) round ornate gold frame with small spikes and violet gems, glowing gold (selected class); 2) same round frame in dark violet-gold, not glowing (class); 3) big round ornate gold frame with laurel branches and a violet gem on top and bottom (main class emblem); 4) round skill node frame, gold-violet with spikes and a gem on top; 5) same skill node frame in dark grey iron (locked); 6) small dark name plate with gold-violet border and pointed ends (empty); 7) small level badge plate (empty); 8) wide dark info panel with ornate gold-violet border and gems (empty); 9) big gold button with an inner dark plate in the lower half (empty); 10) wide dark button with gold-violet border (empty); 11) violet eight-pointed star crystal (skill point icon); 12) silver padlock.
```

## Лист B — иконки классов и навыков (7×4, по порядку)
```
Use the attached mockup as the exact style reference. Game icon sheet, dark fantasy manhwa style, flat solid pure green (#00FF00) background, 7x4 grid with wide spacing, each icon separate, square, no frames, no text: 1) two crossed gold swords; 2) violet swirling portal; 3) gold bow with an arrow and a target; 4) glass flask with violet potion; 5) glowing violet sword blade; 6) executioner axe with red glow; 7) hourglass with violet lightning; 8) sword wrapped in a lightning storm; 9) skull split by a blade; 10) violet wind swirl around a running figure; 11) two glowing hands bound by violet chains; 12) stream of violet energy; 13) crescent moon with a shield; 14) three linked glowing rings; 15) small gold treasure chest; 16) violet eye inside a crescent moon; 17) red target mark; 18) hourglass with sand; 19) wolf paw print with green glow; 20) arrow piercing a skull; 21) clock face with a bow; 22) gold trophy goblin head; 23) red philosopher stone; 24) crushed blue crystal shards; 25) violet ether vial with mist; 26) rain of gold coins; 27) glowing crystal vein in rock; 28) glass jar full of violet souls.
```

## Фон (без интерфейса)
```
Vertical 2:3 mobile game background, dark fantasy manhwa style: a dark stone hall inside the Tower with pillars, hanging chains and violet banners, violet flames in braziers on both sides, a giant glowing violet rune circle on the floor in the lower third, floating runes, dark mood. Top and middle calmer for UI. No text, no UI.
```
