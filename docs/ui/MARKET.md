# Рынок (островок лагеря, этаж 100)

## Решения пользователя (6 ноября)
1. **Как в Idle Heroes:** 8 случайных товаров (`CONFIG.market.slots`), сами обновляются раз в 3 часа (`refreshSec`), обновить сразу — за 💎 (`refreshCost`). Купленный товар — «Куплено» до обновления.
2. **Товары:** билеты призыва, копии героев (E–B за золото, A — за 💎), осколки Башни, души (`CONFIG.market.goods`). Копия: новый герой открывается, известный даёт копию на звёзды.
3. **Валюта как в Idle Heroes:** часть за золото (цена растёт с рекордом этажа: price × золото за врага рекордного этажа), часть за 💎 (цена постоянная).
4. **💎 Кристаллы — донат-валюта.** Бесплатно немного: за первое прохождение мега-босса (`CONFIG.crystals.megaFirst`), позже — задания и вход. Покупка за деньги — в версии для телефона (Google Play), сейчас не делаем.
5. Открывается на `CONFIG.unlocks.shop` (100).

## Шаг 1 — макет экрана (референс)
```
Mobile game marketplace screen, vertical 9:16 portrait, dark fantasy manhwa style, in the layout of the Idle Heroes marketplace. Background: a dark night market on a floating rock islet — merchant tents with violet cloth, hanging lanterns, crates and potions, mist. Top: a thin dark strip for two currencies on the right (gold coin, blue crystal) each with a plus button. Under it a back button and an ornate title plate. Then a small timer plate with an hourglass icon. Middle: a grid of 8 item cards in 2 rows of 4 — each card: dark ornate frame, item icon in the middle (summon ticket, hero portrait, blue shard, ghost soul), amount line, and a price button at the bottom (orange-gold for gold, blue-cyan for crystals). One card greyed out as sold. Bottom: a wide refresh button with circular arrows and a crystal price, and a merchant character silhouette on the side. Readable at phone size, uncluttered.
```

## Макет пользователя — references/market_mockup_v1.png (принят как основа, 6 ноября)
Сверху справа золото и 💎 с «+»; «Назад», плашка «Рынок» с весами, плашка таймера с песочными часами. Сетка 2×4 карточек: название сверху, иконка, «×N», кнопка цены (золотая — золото, синяя — 💎). Проданное — серая карточка с лентой «Продано». Внизу торговец в капюшоне за прилавком и большая кнопка «Обновить» с ценой в 💎.
Правки при сборке: товары и цены — из игры (билеты, копии героев с портретом, осколки, души); цена обновления — `CONFIG.market.refreshCost`.

## Шаг 2 — лист A (интерфейс)
```
Game UI asset sheet, dark fantasy manhwa style matching a night-market screen with gold-and-violet ornaments, flat solid pure green (#00FF00) background, 4x3 grid with wide spacing, each item separate, NO TEXT anywhere: 1) tall item card frame, dark navy inside, thin gold ornate border, a thin divider line near the top for a title (empty); 2) the same card frame greyed out (sold); 3) diagonal silver ribbon plate (empty) for a "sold" label; 4) wide orange-gold price button (empty); 5) wide blue-cyan price button (empty); 6) wide grey disabled price button (empty); 7) wide ornate title plate with gold scales emblem on top (empty); 8) long timer plate with a gold hourglass icon on the left (empty right part); 9) dark back button with gold left arrow (empty right part); 10) dark currency pill with a gold plus button on the right (empty); 11) wide glowing cyan refresh button with white circular arrows icon on the left (empty right part); 12) small square dark icon frame with gold corners (empty).
```

## Лист B — иконки
```
Game icon sheet, dark fantasy manhwa style, flat solid pure green (#00FF00) background, 4x2 grid with wide spacing, each icon separate, square, no frames, no text: 1) golden summon ticket with a dark star emblem; 2) stack of five golden summon tickets; 3) glowing blue crystal shards cluster (tower shards); 4) violet ghost soul flame with a face; 5) blue faceted crystal gem (premium currency); 6) gold coin with a star; 7) gold hourglass; 8) hero silhouette card with a glowing violet border and a question mark.
```

## Фон Рынка (без интерфейса)
```
Vertical 9:16 mobile game background, dark fantasy manhwa style: a night market on a floating rock islet — merchant stalls with violet tents, hanging lanterns, crates, potions and scrolls; in the distance floating islands with rope bridges and a dark castle under a full moon. At the bottom left a hooded smiling merchant leaning on a wooden counter with coins, scrolls and a potion bottle. The middle area calmer and darker for an item grid. No text, no UI.
```

## Собрано — 0.103
Листы нарезаны (tools/marketcut.py → assets/market), стили — src/market.js, разметка — marketHtml в src/ui2.js. Портрет героя в рамке icon_fr; если портрета нет — силуэт «?».
