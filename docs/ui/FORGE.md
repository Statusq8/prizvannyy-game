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

## Макет пользователя — references/forge_mockup_v1.png (принят как основа, 6 ноября)
Сверху: «назад», «Кузница», души справа. 4 вкладки-плитки (Артефакты/Руны/Алтарь/Кости). Сетка полученных артефактов 4 в ряд с плашкой «Ур.». Над наковальней переключатель «Ветвь Душ / Ветвь Крови» — витрина показывает одну ветку за раз. 3 карточки предложений (иконка, плашка имени, золотая кнопка с ценой), кнопка «Обновить» с ценой внизу на наковальне.
Правки при сборке: валюта сверху — души или осколки по выбранной ветке; имя и бонус артефакта пишет игра; вкладки закрытых функций скрыты.
Из макета вырезать нельзя: в иконках впечатаны «Ур.» и углы рамок, в кнопках — текст. Нужны листы A, B (две половины иконок) и фон.

## Шаг 2 — лист деталей A (интерфейс)
```
Game UI asset sheet, dark fantasy manhwa style matching a violet-and-gold forge screen, flat solid pure green (#00FF00) background, 4x3 grid with wide spacing, each item separate, NO TEXT anywhere: 1) square ornate gold-violet artifact cell frame with an empty transparent-looking dark center; 2) small dark level plate with gold edges (empty); 3) square tab tile, dark violet, empty; 4) the same tab tile selected, glowing orange-gold; 5) tall offer card frame, dark with violet glowing border, empty; 6) thin empty name plate with violet border; 7) wide orange-gold glowing buy button (empty); 8) the same button greyed out; 9) branch switch plate, blue-violet glowing (empty, with a violet soul flame icon on the left); 10) branch switch plate, dark red (empty, with a red blood drop icon on the left); 11) wide dark refresh button with gold circular arrows icon on the left (empty right part); 12) wide ornate title plate with violet glow (empty).
```

## Лист B1 — иконки артефактов (души)
```
Game icon sheet, dark fantasy manhwa style, flat solid pure green (#00FF00) background, 4x3 grid with wide spacing, each icon separate, square, no frames, no text, glowing violet magic aura behind each: 1) violet glowing ornate dagger; 2) violet slit-pupil eye in a thorny gold setting; 3) bloody beast fang in a dark metal claw mount; 4) gold grail overflowing with blood; 5) torn crimson war banner on a spear; 6) dark steel titan gauntlet with violet crystals; 7) flaming orange phoenix feather; 8) gold hourglass with violet sand; 9) dark crown of spikes with a violet gem (crown of the Tower); 10) small stone arch portal with a violet vortex and an upward arrow; 11) spiked dark ring with a violet gem; 12) dark spell book with a glowing violet rune.
```

## Лист B2 — иконки артефактов (кровь)
```
Game icon sheet, dark fantasy manhwa style, flat solid pure green (#00FF00) background, 3x2 grid with wide spacing, each icon separate, square, no frames, no text, glowing deep red aura behind each: 1) blood-red curved katar blade dripping blood with a chain; 2) blood-soaked spiked leather glove; 3) black iron cauldron bubbling with blood and gold coins; 4) heavy bloody battle axe; 5) voodoo doll with red button eye and pins; 6) empty slot.
```

## Фон Кузницы (без интерфейса)
```
Vertical 9:16 mobile game background, dark fantasy manhwa style: a dark gothic blacksmith hall, chains hanging from the ceiling, violet crystals at the sides, a stone furnace with roaring orange fire in the middle right, at the bottom a huge dark anvil glowing with orange cracks and runes, sparks and embers in the air. Upper two thirds calmer and darker for an icon grid. No text, no UI, no characters.
```
