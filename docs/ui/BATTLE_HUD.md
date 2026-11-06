# Экран боя — интерфейс (5–6 ноября 2026)

Решение: экран боя первым; путь — макет экрана целиком → пользователь выбирает → лист деталей на зелёном фоне → нарезка и сборка.

## Что есть на экране (по прошлым ответам)
- Слева сверху — профиль: круглый аватар с уровнем, имя под ним.
- По центру сверху — плашка «Этаж N», под ней «Волна x/10» и 10 ромбиков (последний — босс), ниже — плашка с именем врага и полоса HP с цифрами.
- Справа сверху — золото, под ним урон в секунду (DPS).
- Слева под профилем — кнопка ⚔ (прокачка), справа — ⚙ (настройки).
- Внизу — главный герой со спины, под ним тонкая шкала ульты. Нижнего меню нет.

## Шаг 1 — промт макета
```
Mobile game UI mockup, vertical 9:16 portrait phone screen, dark fantasy idle tapper battle screen inside a purple-lit stone summoning hall. Top-left: a round ornate avatar frame with a hooded hero portrait and a small level badge under it, player name below. Top-center: an ornate dark-metal title plate reading floor number, under it a row of 10 small diamond wave markers (last one red for the boss), under that a dark banner plate with the monster name and a long red HP bar with a thin gold frame. Top-right: two stacked currency bars with round icons — a gold coin bar and a crossed-swords damage-per-second bar. Left side under the avatar: a square ornate button with crossed swords; right side: a square ornate button with a gear. Center: one big monster standing on a glowing violet summoning circle. Bottom center: the hero seen from behind, small, with a thin glowing ult charge bar under his feet. No bottom menu. UI style: dark gunmetal and black iron frames with violet glowing gems and fine silver filigree, consistent set, clean and readable, manhwa-style detailed 2D game art, dark purple neon palette, no real logos.
```
Пришли 2–4 варианта макета — выберешь один, по нему сделаю промт листа деталей (рамки, плашки, кнопки, полосы, иконки отдельно).

## Выбор (6 ноября)
- Макет: **вариант 3** — золото + детали (иконка монстра у имени, «+» у валют). docs/reference/ui_mockups/battle_v2/v3.png
- Шкала ульты: без предпочтения → **как на макете** (широкая рамка по низу, кристалл в центре).

## Шаг 2 — листы деталей (2 листа, детали пустые — текст и цифры ставит игра)
Общее: сплошной ярко-зелёный фон #00FF00, каждая деталь отдельно с большим отступом, вид строго спереди, без перспективы, без теней, без текста и цифр.

Лист A — рамки и плашки (сетка 3 × 3):
1) круглая рамка аватара (золотые шипы, фиолетовый кристалл сверху), внутри пусто, снизу маленький шестиугольный значок уровня (пустой);
2) плашка имени игрока (узкая, пустая);
3) большая плашка заголовка «Этаж» (пустая);
4) плашка имени монстра с круглым гнездом для иконки слева (пустая);
5) рамка полосы здоровья (длинная, пустая внутри);
6) квадратная рамка кнопки (пустая);
7) плашка валюты с круглым гнездом иконки слева и кнопкой «+» справа (пустая);
8) рамка шкалы ульты (широкая, с ромбовым кристаллом в центре, пустая внутри);
9) ромбик волны: пустой, заполненный, красный с черепом — три в ряд.

Лист B — иконки и заливки (сетка 3 × 3):
1) золотая монета со звездой; 2) скрещённые мечи (урон/сек); 3) скрещённые мечи для кнопки (светлые, фиолетовое свечение); 4) шестерёнка (светлая, фиолетовое свечение); 5) красная заливка полосы здоровья (одна полоса); 6) фиолетовая светящаяся заливка шкалы ульты (одна полоса); 7) рогатая маска монстра (иконка у имени); 8) череп босса (иконка); 9) кристалл ульты отдельно (ромб с фиолетовым пламенем).
