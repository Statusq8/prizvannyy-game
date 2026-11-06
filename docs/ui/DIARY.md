# Дневник призванного (экран; сейчас — старая вкладка diary)

## Правила (CONFIG.diary)
Бестиарий: первая победа над видом — запись; все враги и боссы биома — страница заполнена (награда `CONFIG.diary.page`); `CONFIG.diary.master` побед над видом — «знаток» (`masterReward`). Герои: цитата и история открываются звёздами (`loreStars`).
0.126: награды дневника — билеты и 💎 (эссенция бесполезна — PvE выключено).

## Шаг 1 — макет (референс)
```
Mobile game bestiary journal screen, vertical 9:16 portrait, dark fantasy manhwa style, same style as the other Tower screens (violet and gold ornaments). Background: a dark stone library inside the Tower, a big open ancient book lying on a desk, candles, violet magic dust, dark mood. Top: a thin dark strip with a square back button on the left, an ornate title plate "Diary" in the center, tickets and crystals with "+" on the right. Under it 2 ornate tabs: Bestiary, Heroes (Bestiary active). Below a horizontal row of small round biome medallions with a left/right arrow (current biome highlighted). Then a big parchment-like dark page panel with the biome name on a header plate, a progress bar "4/6 entries" and a small reward plate (ticket and crystal icons) with a "Claim" button. Inside the page a 3-column grid of enemy cards: each card is a dark ornate frame with a monster portrait (skeleton, ghoul, giant rat, bone knight, boss with a crown badge), the monster name under it and a kill counter with a skull icon; one card has a gold "Expert" ribbon; undiscovered cards show a dark silhouette with "???". Readable at phone size, uncluttered.
```

## Макет пользователя — references/diary_mockup_v1.png (1024×1536, принят)
Вкладки Бестиарий / Герои; ряд медальонов биомов со стрелками; пергаментная страница: шапка с названием биома, «Записи 4/6» с полосой, награда (билеты, 💎) с «Забрать»; сетка 3×2 карточек врагов (портрет, имя, череп и счётчик N/знаток), «Эксперт», корона у босса, ??? у неоткрытых; внизу — раскрытая книга на столе.
Правки при сборке: награда страницы выдаётся сама при заполнении — на плашке «Получено» / «Заполните страницу»; счётчик — до «знатока» (`CONFIG.diary.master`); портреты — первый кадр спрайта врага, у кого есть (12 видов), остальные — силуэт; медальоны — фон зала биома в его оттенке.

## Лист A — интерфейс
```
Use the attached mockup as the exact style reference — same ornaments, colors and shapes. Game UI asset sheet, dark fantasy manhwa style, flat solid pure green (#00FF00) background, 4x4 grid with wide spacing, each item separate, NO TEXT anywhere, frames have an empty transparent center: 1) wide dark tab button with gold-violet ornate border (empty); 2) same wide tab glowing gold (active, empty); 3) round medallion frame, violet-gold with small spikes; 4) same round medallion frame glowing gold (selected); 5) gold chevron arrow pointing left; 6) big torn old parchment page with a dark violet ornate border (empty); 7) wide header plate with spiky violet-gold ends (empty); 8) wide dark panel with gold-violet border (empty); 9) small dark reward plate with gold border (empty); 10) small gold button (empty); 11) tall dark card frame with violet-gold ornate border, empty transparent center; 12) same tall card frame in glowing gold (boss); 13) gold diagonal corner ribbon (empty); 14) small gold crown; 15) small dark name plate with violet-gold border (empty); 16) small white skull icon.
```

## Лист B — иконки
```
Use the attached mockup as the exact style reference. Game icon sheet, dark fantasy manhwa style, flat solid pure green (#00FF00) background, 4x2 grid with wide spacing, each icon separate, square, no frames, no text: 1) gold horned skull; 2) gold spartan knight helmet; 3) small stone gate with a violet portal; 4) quill pen; 5) closed old book with a gold lock; 6) magnifying glass; 7) gold check mark; 8) dark monster silhouette with glowing violet eyes.
```

## Фон (без интерфейса)
```
Vertical 2:3 mobile game background, dark fantasy manhwa style: a dark stone library inside the Tower, tall bookshelves on both sides with candles at the top, the middle calm and dark for a big page panel, at the bottom a wooden desk with a big open ancient glowing book in the center, candles on the left, a quill in a violet inkwell on the right. No text, no UI.
```
