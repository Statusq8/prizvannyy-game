# Задания (экран; вкладки: Ежедневные · Недельные · Достижения · Вход)

## Решения пользователя (6 ноября)
- Включены: ежедневные, недельные, сюжет (свиток на экране боя), достижения, календарь входа на 30 дней.
- Награды — только билеты и немного 💎. Сундуки за число выполненных ежедневных: 1/2/4 (`CONFIG.questChests`).

## Шаг 1 — макет экрана (референс)
```
Mobile game quests screen, vertical 9:16 portrait, dark fantasy manhwa style, same style as the other Tower screens. Background: a dark stone hall inside the Tower with a large quest board of old wood and iron, pinned parchment scrolls, violet candles and soft violet magic glow, dark mood. Top: a thin dark strip with a square back button on the left, an ornate title plate "Quests" in the center, crystal and ticket currencies with "+" on the right. Under it a row of 4 ornate tabs: Daily, Weekly, Achievements, Login (Daily active, small red dots on tabs with ready rewards). Below the tabs a progress bar of activity points with 3 treasure chests on it (wooden, silver, gold), the first chest glowing as ready. Middle: a vertical list of 5 quest cards — each card is a dark stone-and-gold plate with a square quest icon on the left (sword, skull boss, finger tap, summon portal, star), the quest name and a thin progress bar "3/5" in the middle, a reward icon (summon ticket or violet crystal with a number) and a button on the right: green-gold "Claim", grey "Go", or a gold check mark "Done". Bottom: a timer "resets in 05:12:30". Readable at phone size, uncluttered, no extra text.
```
Плюс отдельно (вкладка «Вход»): сетка 30 дней — 5×6 маленьких плашек с номером дня и наградой, забранные — с галочкой, сегодняшняя светится.

## Макеты пользователя — references/quests_mockup_v1.png и quests_login_mockup_v1.png (1024×1536, приняты)
Ежедневные: «Назад», 💎 и билеты с «+», плашка «Quests», 4 вкладки с красными точками, доска заданий, панель «Активность 30/100» с 3 сундуками (30/60/100), 5 карточек (иконка в рамке, название, полоса 3/5, награда, кнопка Claim/Go/Done), таймер сброса. Вход: сетка 5×6 «День N», забранные с ✓, сегодняшний светится, большая кнопка «Забрать».
Правки при сборке: тексты по-русски; числа и награды из игры (на макете 💎 завышены — в игре немного); сундуки — `CONFIG.questChests`.
Уже есть и берём из других экранов: назад, плашка валюты, плашка заголовка, 💎, билет, песочные часы, таймер.

## Лист A — интерфейс
```
Game UI asset sheet, dark fantasy manhwa style matching a violet quests screen with gold-violet ornaments, flat solid pure green (#00FF00) background, 4x4 grid with wide spacing, each item separate, NO TEXT anywhere: 1) tab button, dark with gold-violet ornate frame (empty); 2) same tab button but active, glowing violet (empty); 3) wide dark panel with gold-violet ornate border and a small rolled parchment scroll emblem on the left (empty); 4) thin dark progress bar frame with gold edges (empty); 5) thin glowing violet progress bar fill; 6) small violet diamond marker; 7) wide quest card plate, dark stone with gold-violet ornate border and a thin vertical divider near the right third (empty); 8) square dark icon frame with gold-violet ornate border (empty); 9) glowing green-gold button (empty); 10) grey-silver stone button (empty); 11) dark gold button with a gold check mark (no text); 12) square day plate, dark violet with gold ornate frame and a small header strip on top (empty); 13) same day plate dimmed brown with gold laurels at the bottom (claimed, empty); 14) same day plate glowing violet-gold (today, empty); 15) big glowing green button with spiky violet-gold ends (empty); 16) small red round dot with gold rim.
```

## Лист B — иконки
```
Game icon sheet, dark fantasy manhwa style, flat solid pure green (#00FF00) background, 4x3 grid with wide spacing, each icon separate, square, no frames, no text: 1) two crossed swords with violet glow; 2) horned demon skull with glowing violet eyes; 3) finger tapping a glowing violet circle; 4) dark stone summon portal with violet swirl; 5) gold five-pointed star; 6) closed wooden treasure chest with gold trim; 7) silver-iron treasure chest; 8) gold treasure chest with a violet gem; 9) open gold chest glowing with light; 10) gold trophy cup; 11) calendar page with a gold check mark; 12) rolled parchment scroll with a red wax seal.
```

## Фон (без интерфейса)
```
Vertical 2:3 mobile game background, dark fantasy manhwa style: a dark stone hall inside the Tower with gothic arched violet windows and hanging chains, in the upper third a large quest board of old dark wood and iron with pinned parchment scrolls and a violet banner, violet candles, a quill and old books on the sides, violet flames in braziers on the left and right edges, cracked stone floor at the bottom. Top and the area under the board calmer and darker for UI panels. No text, no UI.
```
