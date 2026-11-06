# Профиль и статистика (экран; сейчас — старый pgProf из ui3.js)

## Решения пользователя (6 ноября)
- Вкладки: Игрок, Титулы, Облики, Статистика, Хроника — все остаются.
- Уровень престижа и трофеи выключены — из профиля убрать.

## Шаг 1 — макет вкладки «Игрок» (референс)
```
Mobile game player profile screen, vertical 9:16 portrait, dark fantasy manhwa style, same style as the other Tower screens (violet and gold ornaments). Background: a dark stone study room inside the Tower with bookshelves, a large violet stained glass window and candles, dark mood. Top: a thin dark strip with a square back button on the left, an ornate title plate "Profile" in the center, crystal and ticket currencies with "+" on the right. Under it a row of 5 ornate tabs: Player, Titles, Skins, Stats, Chronicle (Player active). Below a big ornate panel: on the left a large round hero portrait in a gold-violet ornate ring frame, on the right the player name in big gold letters with a small pencil edit button, under it the active title on a small ribbon plate, and two small buttons "Change name" and "Change portrait". Below a section header plate "Records" and a 2-column grid of 8 small stat plates, each with an icon on the left (tower floor, hourglass, skull, finger tap, demon boss, violet swirl regression, gold medal titles, scroll quests), a label and a big number. Readable at phone size, uncluttered.
```

## Шаг 2 — макет вкладки «Статистика» (референс)
```
Same style, same top, tabs with Stats active: a long ornate panel with a vertical list of stat rows, each row with a small icon, a label on the left and a big gold number on the right (total DPS, tap damage, auto DPS, crit chance, crit damage, gold per minute, souls, taps per second, enemies, bosses, best floor, play time), thin gold separators between rows, two small section header plates "Battle" and "Progress" splitting the list. Readable at phone size.
```

## Макеты пользователя — references/profile_mockup_v1.png и profile_stats_mockup_v1.png (1024×1536, приняты)
Игрок: назад, 💎 и билеты, плашка «Профиль», 5 вкладок с иконками; панель: портрет в круглой рамке, имя + ✏, титул на ленте с лаврами, «Сменить имя», «Сменить аватар»; «Рекорды» — 8 плашек 2×4. Статы: длинная панель, шапки «Бой» и «Прогресс», строки иконка–название–число с линиями.
Правки при сборке: числа из игры; «Скины» = Облики; рекорд «Трофеи» не показываем.

## Лист A — интерфейс
```
Use the attached mockup as the exact style reference — same ornaments, colors and shapes. Game UI asset sheet, dark fantasy manhwa style, flat solid pure green (#00FF00) background, 4x3 grid with wide spacing, each item separate, NO TEXT anywhere: 1) big wide dark panel with ornate gold-violet border and small glowing gems in the middle of the top and bottom edges (empty); 2) round ornate gold portrait ring frame with violet gems on top and bottom and small spikes, empty transparent center; 3) title ribbon plate with gold laurel branches on both ends and a small gold crown on top (empty); 4) small square dark button with a gold pencil; 5) small wide dark button with gold-violet border (empty); 6) section header plate with spiky violet-gold ends (empty); 7) dark stat plate with gold-violet border and chamfered corners (empty); 8) tall long dark list panel with ornate gold-violet border (empty); 9) thin glowing gold-violet separator line; 10) tab button, dark with gold-violet ornate frame (empty); 11) same tab button active, glowing violet (empty); 12) small header plate with spiky ends and violet glow (empty).
```

## Лист B — иконки
```
Use the attached mockup as the exact style reference. Game icon sheet, dark fantasy manhwa style, flat solid pure green (#00FF00) background, 6x4 grid with wide spacing, each icon separate, square, no frames, no text: 1) gold person silhouette; 2) gold laurel wreath; 3) gold shirt; 4) gold bar chart; 5) gold open book; 6) gold pencil; 7) gold picture frame icon; 8) dark tower with violet glow; 9) gold hourglass with violet sand; 10) white skull; 11) finger tapping a violet circle; 12) horned demon helmet with violet eyes; 13) violet swirling vortex; 14) gold star in a laurel wreath; 15) parchment scroll with a check mark; 16) two crossed gold swords; 17) three gold claw slashes; 18) gold crosshair; 19) gold-orange explosion burst; 20) stack of gold coins; 21) violet soul flame; 22) finger tap with speed lines; 23) silver padlock; 24) gold check mark.
```

## Фон (без интерфейса)
```
Vertical 2:3 mobile game background, dark fantasy manhwa style: a dark stone study room inside the Tower, tall bookshelves on both sides, a large violet stained glass window at the top center, candles and an open book on the left, an astrolabe globe with a violet orb on the right, banners, cracked stone floor at the bottom. Top part detailed, the middle calm and dark for UI panels. No text, no UI.
```
