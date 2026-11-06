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
