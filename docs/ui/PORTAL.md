# Портал — 6 ноября 2026

Открывается на 25 этаже, свой островок в лагере.

**0.91 (6 ноября): рецепты убраны по решению пользователя.** Призыв — только билетами (и фонарями на событийном баннере). Пункты про рецепты ниже — история, не в работе.

Решения пользователя:

1. **Два способа призыва.**
   - **Билеты** (как сейчас): билет за первое прохождение этажей, 1 билет = 1 случайный герой. Гарантия — как сейчас + выбор героя после N призывов (ответ 37).
   - **Рецепты:** рецепт выпадает **только с мега-боссов** (каждые 50 этажей). Рецепт = конкретный **особый** герой — таких героев **нет в билетах**, только по рецепту.
2. **Добыча для рецепта:** несколько **частей монстров** (у каждого моба своя часть, рецепт просит части из разных локаций) + **эссенция**. Собрал всё — герой выходит из портала.
3. **Показ призыва:** карты рубашкой вверх → переворот; у редких перед переворотом свечение цветом ранга (E сталь … GOD спектр).
4. **Кнопки:** ×1 и ×10.

Открыто: сколько особых героев, какие части и сколько, шанс/гарантия рецепта с мега-босса (сейчас — гарантированно?), цена в эссенции.

## Макет экрана Портала
```
Mobile game summon screen, vertical 9:16 portrait, dark fantasy manhwa style, in the layout of Idle Heroes summon screen. Center: a huge stone arch portal with a swirling violet vortex and glowing runes, floating on a small dark rock islet in a night sky with violet clouds. Top area: a thin dark strip for currencies. Under it two tabs side by side: "Summon" and "Recipes" style empty tab plates. Bottom area: two big ornate buttons side by side (one silver-violet, one gold), each with a small ticket icon and empty space for text; above them a thin progress bar for a guarantee counter. Dark stone, violet crystals, lanterns, mist. No text, no characters.
```

## Макет переворота карт (×10)
```
Mobile game summon result screen, vertical 9:16 portrait, dark fantasy manhwa style. Dark violet background with a glowing portal vortex behind. Ten tall cards in two rows of five, face down, ornate dark card backs with a violet tower emblem; two of the cards glow strongly (one gold, one rainbow) before flipping. Bottom: two empty ornate buttons. No text, no characters.
```

## Макет пользователя — references/portal_mockup_v1.png (принят как основа)
Сверху: «назад», «Портал призыва», «История», «?», билеты. Портал в центре, справа «Шансы призыва». Полоса гарантии (S и выше, 78/100). Кнопки «Призвать ×1» (синяя) и «×10» (золотая) с ценой в билетах. Внизу — лента баннеров.
Правки при сборке: шансы и гарантия — из игры (там есть и SSS); лента внизу = переключение баннеров (обычный, редкий, тематический, событийный); добавить вкладки «Призыв / Рецепты» под заголовком.

## Лист деталей Портала A
```
Game UI asset sheet, dark fantasy manhwa style, flat solid pure green (#00FF00) background, 3x3 grid with wide spacing, each item separate, NO TEXT anywhere: 1) big ornate blue-violet button with glowing frame (empty, wide); 2) big ornate gold-magenta button with glowing frame (empty, wide); 3) small dark pill plate with a violet summon ticket icon on the left (empty right part); 4) long dark progress bar frame with gold-violet ornate ends (empty inside); 5) violet glowing bar fill strip; 6) round gold spiked medallion with an empty dark center; 7) tall dark panel frame with violet glowing border (empty); 8) wide ornate title plate with violet glow and spiky metal ends (empty); 9) violet summon ticket icon alone.
```

## Лист деталей Портала B
```
Game UI asset sheet, dark fantasy manhwa style, flat solid pure green (#00FF00) background, 3x3 grid with wide spacing, each item separate, NO TEXT anywhere: 1) square back button with a left arrow, violet-metal frame; 2) small dark plate with a scroll icon on the left (empty right part); 3) round button with a question mark; 4) round small info button with letter i; 5) wide dark tab plate normal; 6) the same tab plate selected, glowing gold-violet; 7) wide banner frame for a hero carousel, ornate violet border, empty dark inside; 8) gold left arrow; 9) gold right arrow.
```

## Фон Портала (без интерфейса)
```
Vertical 9:16 mobile game background, dark fantasy manhwa style: a huge stone arch portal with a swirling violet vortex at the top of wide stone stairs, a dark gothic tower behind it with a glowing halo, two hooded chained statues at the sides holding violet crystals, banners, chains, violet lightning, night sky with violet clouds. Bottom third calmer and darker for buttons. No text, no UI, no characters except the statues.
```
