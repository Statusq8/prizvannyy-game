# Паки картинок «Призванный: Башня Гачи»

Генерируй по одному паку и присылай мне в чат целиком — я разложу файлы, вставлю в игру и дам тестовую ссылку.

## Как присылать

1. Пиши в сообщении **«Пак N»** и прикладывай картинки **по порядку номеров** этого пака (1, 2, 3…). Имена файлов можно не менять — я сопоставлю по номеру.
2. Если какой-то номер не получился — так и напиши: «Пак 2, без №5». Пришлёшь позже отдельно.
3. **Прозрачный фон** для героев, врагов, иконок и эффектов. Не умеет генератор — проси `on a plain flat green background`, я сам уберу зелёный фон.
4. **Общий стиль** — вставляй в начало каждого промпта (у фонов и интерфейса тоже):

```
2.5D dark fantasy, Korean manhwa style, clean bold lineart, cel shading with soft gradients, rich saturated colors on dark tones, dramatic rim light, high detail, game asset
```

| Что | Размер | Формат |
|---|---|---|
| Герои, питомцы, враги | 1024×1024, весь силуэт, ноги у нижнего края | PNG, прозрачный фон |
| Фоны | 1080×1920 (вертикально) | JPG/WebP |
| Иконки, эффекты | 512×512 | PNG, прозрачный фон |
| Интерфейс | размер указан у пункта | PNG, прозрачный фон |

Если какие-то картинки уже сделаны (например, враги с твоего листа `zones_sheet.png`) — пропусти их и скажи, какие.

## Список паков

| Пак | Что | Картинок |
|---|---|---|
| 1 | Эталон: главный герой + удары | 7 |
| 2 | Стартовый отряд | 12 |
| 3 | Навигация как в «Крушителях» | 28 |
| 4 | Иконки меню и ресурсов | 23 |
| 5 | Биом 1: Гнилые катакомбы + редкие враги | 11 |
| 6 | Герои E–B из портала | 12 |
| 7 | Герои A–GOD, тайные и сезонные | 21 |
| 8 | Питомцы и эффекты | 8 |
| 9 | Биомы 2–3: Пепельные шахты + Лес теней | 16 |
| 10 | Биомы 4–5: Ледяная цитадель + Затопленный храм | 16 |
| 11 | Биомы 6–7: Кровавая арена + Пустотные врата | 16 |
| 12 | Биомы 8–9: Престол Башни + Ржавые механизмы | 16 |
| 13 | Биомы 10–11: Небесный сад + Склеп королей | 16 |
| 14 | Биомы 12–13: Грибные гроты + Обсидиановая кузня | 16 |
| 15 | Биомы 14–15: Зеркальный лабиринт + Чумные палаты | 16 |
| 16 | Биомы 16–17: Песчаный некрополь + Грозовой шпиль | 16 |
| 17 | Биомы 18–19: Сады плоти + Звёздная обсерватория | 16 |
| 18 | Биом 20: Сердце Башни | 8 |
| 19 | Иконки систем | 33 |
| 20 | Тотемы биомов | 20 |
| 21 | Логотип | 1 |

**Всего: 328 картинок.**

## Пак 1 — Эталон: главный герой + удары

Сделать первым. Остальные паки генерируй, прикладывая выбранного героя как референс стиля.

**1. `hero_idle.png`** — Призванный · idle
```
hooded warrior summoned from another world, hood up, face hidden, black leather and dark steel armor, long tattered dark violet cloak flowing behind, single straight sword in the right hand, faint violet glow on the blade, idle stance, slight breathing pose, seen from behind three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**2. `hero_attack.png`** — Призванный · attack
```
hooded warrior summoned from another world, hood up, face hidden, black leather and dark steel armor, long tattered dark violet cloak flowing behind, single straight sword in the right hand, faint violet glow on the blade, attack pose, mid sword swing forward, seen from behind three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**3. `hero_ult.png`** — Призванный · ult
```
hooded warrior summoned from another world, hood up, face hidden, black leather and dark steel armor, long tattered dark violet cloak flowing behind, single straight sword in the right hand, faint violet glow on the blade, ultimate pose, sword raised overhead with glowing energy, seen from behind three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**4. `hero_avatar.png`** — Призванный · avatar
```
hooded warrior summoned from another world, hood up, face hidden, black leather and dark steel armor, long tattered dark violet cloak flowing behind, single straight sword in the right hand, faint violet glow on the blade, head and shoulders portrait, three-quarter front view, face in the shadow of the hood, glowing violet eyes, plain dark background
```
**5. `vfx_hit.png`** — Попадание
```
white-gold impact spark burst, magic effect only, no character, transparent background, no text
```
**6. `vfx_crit.png`** — Крит
```
big yellow-orange star burst flash, magic effect only, no character, transparent background, no text
```
**7. `vfx_slash.png`** — Удар героя
```
curved sword slash arc, magic effect only, no character, transparent background, no text
```

## Пак 2 — Стартовый отряд

Ирэн, Борг, Лиа, Каэль — они на арене с первой минуты.

**1. `ally_irene_idle.png`** — Ирэн · E · стоит
```
shadow elf archer girl, long silver hair, dark teal hooded leather armor, black longbow, glowing cyan eyes, idle battle stance, three-quarter view facing the viewer, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**2. `ally_irene_attack.png`** — Ирэн · E · атака
```
shadow elf archer girl, long silver hair, dark teal hooded leather armor, black longbow, glowing cyan eyes, dynamic attack pose, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**3. `ally_irene_avatar.png`** — Ирэн · E · портрет
```
shadow elf archer girl, long silver hair, dark teal hooded leather armor, black longbow, glowing cyan eyes, head and shoulders portrait, front view, plain dark background
```
**4. `ally_borg_idle.png`** — Борг · D · стоит
```
huge orc berserker, green-grey skin, war paint, fur and leather, giant double-headed battle axe, idle battle stance, three-quarter view facing the viewer, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**5. `ally_borg_attack.png`** — Борг · D · атака
```
huge orc berserker, green-grey skin, war paint, fur and leather, giant double-headed battle axe, dynamic attack pose, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**6. `ally_borg_avatar.png`** — Борг · D · портрет
```
huge orc berserker, green-grey skin, war paint, fur and leather, giant double-headed battle axe, head and shoulders portrait, front view, plain dark background
```
**7. `ally_lia_idle.png`** — Лиа · C · стоит
```
human pyromancer girl, red-orange hair, crimson and gold robe, staff topped with a burning orb, small flames around hands, idle battle stance, three-quarter view facing the viewer, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**8. `ally_lia_attack.png`** — Лиа · C · атака
```
human pyromancer girl, red-orange hair, crimson and gold robe, staff topped with a burning orb, small flames around hands, dynamic attack pose, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**9. `ally_lia_avatar.png`** — Лиа · C · портрет
```
human pyromancer girl, red-orange hair, crimson and gold robe, staff topped with a burning orb, small flames around hands, head and shoulders portrait, front view, plain dark background
```
**10. `ally_kael_idle.png`** — Каэль · B · стоит
```
half-demon assassin, small black horns, violet eyes, dark purple tight armor, two curved glowing violet daggers, idle battle stance, three-quarter view facing the viewer, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**11. `ally_kael_attack.png`** — Каэль · B · атака
```
half-demon assassin, small black horns, violet eyes, dark purple tight armor, two curved glowing violet daggers, dynamic attack pose, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**12. `ally_kael_avatar.png`** — Каэль · B · портрет
```
half-demon assassin, small black horns, violet eyes, dark purple tight armor, two curved glowing violet daggers, head and shoulders portrait, front view, plain dark background
```

## Пак 3 — Навигация как в «Крушителях»

Новые кнопки углов и колонки слева, рамки, кнопки, окна, рамки редкостей (включая SS и SSS).

**1. `icon_nav_heroes.png`** — Угол ↖ «Герои»
```
bronze horned knight helmet, front view, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**2. `icon_nav_bag.png`** — Угол ↗ «Сумка»
```
worn leather adventurer supply bag with brass buckles, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**3. `icon_nav_pve.png`** — Угол ↙ «PvE»
```
old leather spell card with a glowing lightning rune, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**4. `icon_nav_map.png`** — Угол ↘ «Карта»
```
ornate brass compass with red needle, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**5. `icon_nav_book.png`** — Слева «Книга»
```
closed leather tome with a blue gem clasp and metal corners, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**6. `icon_nav_events.png`** — Слева «События»
```
large gold coin with a red silk ribbon, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**7. `icon_nav_quests.png`** — Слева «Задания»
```
open old book with a feather quill, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**8. `icon_nav_travel.png`** — Круглая кнопка ⏳
```
round stone medallion with a glowing violet hourglass inside, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**9. `ui_frame_corner.png`** — Рамка угловой кнопки 256×256
```
square button frame, red lacquered center, bronze and gold beveled border with rivets, empty center, dark fantasy mobile game UI element, ornate, clean edges, transparent background, no text, no watermark
```
**10. `ui_btn_back.png`** — Красная стрелка «назад» 256×256
```
red crystal arrow pointing left on a dark steel plate, dark fantasy mobile game UI element, ornate, clean edges, transparent background, no text, no watermark
```
**11. `ui_btn_blue.png`** — Синяя кнопка «Назад» 512×128
```
wide horizontal blue enamel button with thin gold border, empty, dark fantasy mobile game UI element, ornate, clean edges, transparent background, no text, no watermark
```
**12. `ui_btn_red.png`** — Красная кнопка «Улучшить» 512×160
```
wide horizontal red enamel button with dark steel border and bolts, empty, dark fantasy mobile game UI element, ornate, clean edges, transparent background, no text, no watermark
```
**13. `ui_btn_violet.png`** — Фиолетовая кнопка «Нанять» 512×160
```
wide horizontal violet enamel button with dark steel border and bolts, empty, dark fantasy mobile game UI element, ornate, clean edges, transparent background, no text, no watermark
```
**14. `ui_popup_parchment.png`** — Окно-свиток 1024×1536
```
vertical parchment panel with worn burnt edges, empty center, subtle ornament at top and bottom, dark fantasy mobile game UI element, ornate, clean edges, transparent background, no text, no watermark
```
**15. `ui_card_parchment.png`** — Карточка героя 1024×256
```
horizontal parchment card with dark iron corners, empty, dark fantasy mobile game UI element, ornate, clean edges, transparent background, no text, no watermark
```
**16. `ui_tab.png`** — Вкладка группы 256×256
```
dark steel tab frame with rounded top corners, empty center, dark fantasy mobile game UI element, ornate, clean edges, transparent background, no text, no watermark
```
**17. `ui_tab_on.png`** — Вкладка активная 256×256
```
dark steel tab frame with glowing gold border, rounded top corners, empty center, dark fantasy mobile game UI element, ornate, clean edges, transparent background, no text, no watermark
```
**18. `ui_hpbar.png`** — Рамка полосы HP 1024×128
```
horizontal steel health bar frame with round metal caps on both ends, empty dark inside, dark fantasy mobile game UI element, ornate, clean edges, transparent background, no text, no watermark
```
**19. `ui_resbar.png`** — Плашка ресурса 512×96
```
dark horizontal resource capsule with thin bronze edge, empty, dark fantasy mobile game UI element, ornate, clean edges, transparent background, no text, no watermark
```
**20. `ui_frame_rarity_e.png`** — Рамка портрета · E · 256×256
```
square portrait frame made of grey stone, empty transparent center, dark fantasy mobile game UI element, ornate, clean edges, transparent background, no text, no watermark
```
**21. `ui_frame_rarity_d.png`** — Рамка портрета · D · 256×256
```
square portrait frame made of green jade, empty transparent center, dark fantasy mobile game UI element, ornate, clean edges, transparent background, no text, no watermark
```
**22. `ui_frame_rarity_c.png`** — Рамка портрета · C · 256×256
```
square portrait frame made of blue steel, empty transparent center, dark fantasy mobile game UI element, ornate, clean edges, transparent background, no text, no watermark
```
**23. `ui_frame_rarity_b.png`** — Рамка портрета · B · 256×256
```
square portrait frame made of violet amethyst, empty transparent center, dark fantasy mobile game UI element, ornate, clean edges, transparent background, no text, no watermark
```
**24. `ui_frame_rarity_a.png`** — Рамка портрета · A · 256×256
```
square portrait frame made of orange bronze, empty transparent center, dark fantasy mobile game UI element, ornate, clean edges, transparent background, no text, no watermark
```
**25. `ui_frame_rarity_s.png`** — Рамка портрета · S · 256×256
```
square portrait frame made of red ruby, empty transparent center, dark fantasy mobile game UI element, ornate, clean edges, transparent background, no text, no watermark
```
**26. `ui_frame_rarity_ss.png`** — Рамка портрета · SS · 256×256
```
square portrait frame made of gold with small gems, empty transparent center, dark fantasy mobile game UI element, ornate, clean edges, transparent background, no text, no watermark
```
**27. `ui_frame_rarity_sss.png`** — Рамка портрета · SSS · 256×256
```
square portrait frame made of gold and white platinum with glowing gems, empty transparent center, dark fantasy mobile game UI element, ornate, clean edges, transparent background, no text, no watermark
```
**28. `ui_frame_rarity_god.png`** — Рамка портрета · GOD · 256×256
```
square portrait frame made of radiant rainbow prismatic gold with divine glow, empty transparent center, dark fantasy mobile game UI element, ornate, clean edges, transparent background, no text, no watermark
```

## Пак 4 — Иконки меню и ресурсов

Иконки разделов внутри групп и ресурсы в верхней строке.

**1. `icon_menu_heroes.png`** — Герои
```
knight helmet, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**2. `icon_menu_portal.png`** — Портал
```
swirling violet summoning portal, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**3. `icon_menu_altar.png`** — Алтарь
```
stone altar with candles, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**4. `icon_menu_quests.png`** — Задания
```
rolled parchment scroll with wax seal, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**5. `icon_menu_season.png`** — Сезон
```
carnival theater mask, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**6. `icon_menu_up.png`** — Прокачка
```
crossed swords, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**7. `icon_menu_souls.png`** — Души
```
glowing blue ghost soul, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**8. `icon_menu_runes.png`** — Руны
```
stone with a glowing rune, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**9. `icon_menu_pve.png`** — PvE
```
compass, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**10. `icon_menu_events.png`** — События
```
red paper lantern, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**11. `icon_menu_bones.png`** — Кости
```
crossed monster bones, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**12. `icon_menu_inbox.png`** — Награды
```
gift box with ribbon, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**13. `icon_menu_settings.png`** — Настройки
```
iron gear, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**14. `icon_menu_map.png`** — Карта Башни
```
tower map scroll, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**15. `icon_res_gold.png`** — Золото
```
gold coin with a tower emblem, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**16. `icon_res_ticket.png`** — Билет призыва
```
violet summoning ticket, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**17. `icon_res_shard.png`** — Осколок Башни
```
blue crystal shard, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**18. `icon_res_heart.png`** — Сердце стража
```
burning red crystal heart, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**19. `icon_res_soul.png`** — Душа
```
blue soul flame, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**20. `icon_res_essence.png`** — Эссенция
```
small glowing white-gold star, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**21. `icon_res_dust.png`** — Костяная пыль
```
pile of bone dust, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**22. `icon_res_lantern.png`** — Фонарь
```
red festival lantern, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**23. `icon_res_token.png`** — Жетон сезона
```
carnival token coin, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```

## Пак 5 — Биом 1: Гнилые катакомбы + редкие враги

Фон и все враги первых 50 этажей, плюс редкие (золотой гоблин, ёж, сундук).

**1. `bg_crypt.jpg`** — фон · Гнилые катакомбы
```
rotten catacombs, bone walls, green candles, damp stone, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**2. `enemy_crypt_1.png`** — враг
```
bone guardian skeleton warrior, theme: rotten catacombs, bone walls, green candles, damp stone, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**3. `enemy_crypt_2.png`** — враг
```
scavenger goblin with a sack of bones, theme: rotten catacombs, bone walls, green candles, damp stone, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**4. `enemy_crypt_3.png`** — враг
```
blind cultist in a stitched hood, theme: rotten catacombs, bone walls, green candles, damp stone, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**5. `enemy_crypt_4.png`** — враг
```
swamp ghoul, theme: rotten catacombs, bone walls, green candles, damp stone, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**6. `boss_crypt_1.png`** — босс
```
gravedigger with a giant shovel, boss monster, imposing, theme: rotten catacombs, bone walls, green candles, damp stone, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**7. `boss_crypt_2.png`** — босс
```
queen of worms, giant pale larva with a crown, boss monster, imposing, theme: rotten catacombs, bone walls, green candles, damp stone, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**8. `final_crypt.png`** — финальный босс
```
Gate Keeper, colossal armored skeleton with a key-shaped halberd, final boss, epic, very detailed, theme: rotten catacombs, bone walls, green candles, damp stone, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**9. `rare_gold.png`** — Золотой гоблин
```
golden goblin carrying a huge sack of gold coins, sparkling, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**10. `rare_crystal.png`** — Кристальный ёж
```
crystal hedgehog with blue crystal spikes, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**11. `rare_chest.png`** — Сундук Башни
```
living treasure chest mimic with gold coins spilling out, golden glow, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```

## Пак 6 — Герои E–B из портала

**1. `ally_garret_idle.png`** — Гаррет · E · стоит
```
middle-aged human militiaman, simple chainmail, tabard, round wooden shield with iron rim, short sword, stubble, idle battle stance, three-quarter view facing the viewer, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**2. `ally_garret_attack.png`** — Гаррет · E · атака
```
middle-aged human militiaman, simple chainmail, tabard, round wooden shield with iron rim, short sword, stubble, dynamic attack pose, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**3. `ally_garret_avatar.png`** — Гаррет · E · портрет
```
middle-aged human militiaman, simple chainmail, tabard, round wooden shield with iron rim, short sword, stubble, head and shoulders portrait, front view, plain dark background
```
**4. `ally_saya_idle.png`** — Сая · D · стоит
```
half-elf knife thrower girl, short green hair, light green and black outfit, belts full of throwing knives, idle battle stance, three-quarter view facing the viewer, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**5. `ally_saya_attack.png`** — Сая · D · атака
```
half-elf knife thrower girl, short green hair, light green and black outfit, belts full of throwing knives, dynamic attack pose, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**6. `ally_saya_avatar.png`** — Сая · D · портрет
```
half-elf knife thrower girl, short green hair, light green and black outfit, belts full of throwing knives, head and shoulders portrait, front view, plain dark background
```
**7. `ally_drake_idle.png`** — Дрейк · C · стоит
```
dragonborn spearman, blue scales, horns, blue steel armor, long spear with a dragon-shaped head, idle battle stance, three-quarter view facing the viewer, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**8. `ally_drake_attack.png`** — Дрейк · C · атака
```
dragonborn spearman, blue scales, horns, blue steel armor, long spear with a dragon-shaped head, dynamic attack pose, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**9. `ally_drake_avatar.png`** — Дрейк · C · портрет
```
dragonborn spearman, blue scales, horns, blue steel armor, long spear with a dragon-shaped head, head and shoulders portrait, front view, plain dark background
```
**10. `ally_noa_idle.png`** — Ноа · B · стоит
```
human storm mage boy, white hair, dark blue coat with silver runes, lightning crackling around a short staff, idle battle stance, three-quarter view facing the viewer, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**11. `ally_noa_attack.png`** — Ноа · B · атака
```
human storm mage boy, white hair, dark blue coat with silver runes, lightning crackling around a short staff, dynamic attack pose, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**12. `ally_noa_avatar.png`** — Ноа · B · портрет
```
human storm mage boy, white hair, dark blue coat with silver runes, lightning crackling around a short staff, head and shoulders portrait, front view, plain dark background
```

## Пак 7 — Герои A–GOD, тайные и сезонные

**1. `ally_velma_idle.png`** — Вельма · A · стоит
```
undead necromancer woman, pale grey skin, green glowing eyes, tattered dark green robes, staff with a skull, green soul wisps, idle battle stance, three-quarter view facing the viewer, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**2. `ally_velma_attack.png`** — Вельма · A · атака
```
undead necromancer woman, pale grey skin, green glowing eyes, tattered dark green robes, staff with a skull, green soul wisps, dynamic attack pose, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**3. `ally_velma_avatar.png`** — Вельма · A · портрет
```
undead necromancer woman, pale grey skin, green glowing eyes, tattered dark green robes, staff with a skull, green soul wisps, head and shoulders portrait, front view, plain dark background
```
**4. `ally_ragnar_idle.png`** — Рагнар · A · стоит
```
fallen death knight, heavy black and dark magenta plate armor, horned helmet with glowing pink eyes, huge greatsword, torn banner on the back, idle battle stance, three-quarter view facing the viewer, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**5. `ally_ragnar_attack.png`** — Рагнар · A · атака
```
fallen death knight, heavy black and dark magenta plate armor, horned helmet with glowing pink eyes, huge greatsword, torn banner on the back, dynamic attack pose, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**6. `ally_ragnar_avatar.png`** — Рагнар · A · портрет
```
fallen death knight, heavy black and dark magenta plate armor, horned helmet with glowing pink eyes, huge greatsword, torn banner on the back, head and shoulders portrait, front view, plain dark background
```
**7. `ally_seiren_idle.png`** — Сэйрен · S · стоит
```
siren storm queen, long flowing aqua hair, pearl and silver dress, floating slightly, wind swirls and small lightning, idle battle stance, three-quarter view facing the viewer, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**8. `ally_seiren_attack.png`** — Сэйрен · S · атака
```
siren storm queen, long flowing aqua hair, pearl and silver dress, floating slightly, wind swirls and small lightning, dynamic attack pose, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**9. `ally_seiren_avatar.png`** — Сэйрен · S · портрет
```
siren storm queen, long flowing aqua hair, pearl and silver dress, floating slightly, wind swirls and small lightning, head and shoulders portrait, front view, plain dark background
```
**10. `ally_azrael_idle.png`** — Азраэль · GOD · стоит
```
ash angel, six grey-white wings with ember edges, white and gold armor, halo of embers, flaming sword, serene merciless face, idle battle stance, three-quarter view facing the viewer, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**11. `ally_azrael_attack.png`** — Азраэль · GOD · атака
```
ash angel, six grey-white wings with ember edges, white and gold armor, halo of embers, flaming sword, serene merciless face, dynamic attack pose, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**12. `ally_azrael_avatar.png`** — Азраэль · GOD · портрет
```
ash angel, six grey-white wings with ember edges, white and gold armor, halo of embers, flaming sword, serene merciless face, head and shoulders portrait, front view, plain dark background
```
**13. `ally_morra_idle.png`** — Морра · A · стоит
```
altar keeper priestess, hooded black and gold robes, veil, ritual dagger and candle lantern, glowing runes on hands, idle battle stance, three-quarter view facing the viewer, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**14. `ally_morra_attack.png`** — Морра · A · атака
```
altar keeper priestess, hooded black and gold robes, veil, ritual dagger and candle lantern, glowing runes on hands, dynamic attack pose, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**15. `ally_morra_avatar.png`** — Морра · A · портрет
```
altar keeper priestess, hooded black and gold robes, veil, ritual dagger and candle lantern, glowing runes on hands, head and shoulders portrait, front view, plain dark background
```
**16. `ally_carna_idle.png`** — Карна · S · стоит
```
carnival fairy illusionist, half-face masquerade mask, harlequin outfit in red and gold, small wings, fireworks sparks in hands, idle battle stance, three-quarter view facing the viewer, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**17. `ally_carna_attack.png`** — Карна · S · атака
```
carnival fairy illusionist, half-face masquerade mask, harlequin outfit in red and gold, small wings, fireworks sparks in hands, dynamic attack pose, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**18. `ally_carna_avatar.png`** — Карна · S · портрет
```
carnival fairy illusionist, half-face masquerade mask, harlequin outfit in red and gold, small wings, fireworks sparks in hands, head and shoulders portrait, front view, plain dark background
```
**19. `ally_yuki_idle.png`** — Юки · S · стоит
```
snow spirit priestess, white hair, pale blue kimono-like robes, ice crystal ornaments, floating snowflakes, idle battle stance, three-quarter view facing the viewer, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**20. `ally_yuki_attack.png`** — Юки · S · атака
```
snow spirit priestess, white hair, pale blue kimono-like robes, ice crystal ornaments, floating snowflakes, dynamic attack pose, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**21. `ally_yuki_avatar.png`** — Юки · S · портрет
```
snow spirit priestess, white hair, pale blue kimono-like robes, ice crystal ornaments, floating snowflakes, head and shoulders portrait, front view, plain dark background
```

## Пак 8 — Питомцы и эффекты

**1. `pet_wolf.png`** — Теневой волк
```
shadow wolf made of black smoke, glowing violet eyes, small companion creature, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**2. `pet_golem.png`** — Каменный голем
```
small sturdy stone golem with glowing orange runes, small companion creature, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**3. `pet_phoenix.png`** — Пепельный феникс
```
phoenix of ash and embers, grey feathers with burning orange edges, wings spread, small companion creature, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**4. `pet_drake.png`** — Костяной дракончик
```
small bone dragon skeleton with green ghost fire inside the ribs, small companion creature, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**5. `vfx_arrow.png`** — Стрела Ирэн
```
cyan shadow arrow, magic effect only, no character, transparent background, no text
```
**6. `vfx_fireball.png`** — Огонь Лии
```
fireball, magic effect only, no character, transparent background, no text
```
**7. `vfx_lightning.png`** — Молния
```
chain lightning bolt, magic effect only, no character, transparent background, no text
```
**8. `vfx_evo_glow.png`** — Облик I
```
soft golden aura, magic effect only, no character, transparent background, no text
```

## Пак 9 — Биомы 2–3: Пепельные шахты + Лес теней

**1. `bg_ash.jpg`** — фон · Пепельные шахты
```
ash mines, glowing lava cracks, rails and mine carts, smoke, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**2. `enemy_ash_1.png`** — враг
```
ash wolf with smoldering fur, theme: ash mines, glowing lava cracks, rails and mine carts, smoke, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**3. `enemy_ash_2.png`** — враг
```
rusty mining automaton, theme: ash mines, glowing lava cracks, rails and mine carts, smoke, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**4. `enemy_ash_3.png`** — враг
```
stone golem, theme: ash mines, glowing lava cracks, rails and mine carts, smoke, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**5. `enemy_ash_4.png`** — враг
```
coal imp, theme: ash mines, glowing lava cracks, rails and mine carts, smoke, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**6. `boss_ash_1.png`** — босс
```
smelting master with a molten ladle, boss monster, imposing, theme: ash mines, glowing lava cracks, rails and mine carts, smoke, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**7. `boss_ash_2.png`** — босс
```
iron tyrant in massive armor, boss monster, imposing, theme: ash mines, glowing lava cracks, rails and mine carts, smoke, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**8. `final_ash.png`** — финальный босс
```
Lord of Ash, burning giant made of coal and embers, final boss, epic, very detailed, theme: ash mines, glowing lava cracks, rails and mine carts, smoke, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**9. `bg_shade.jpg`** — фон · Лес теней
```
shadow forest inside the tower, black trees, violet fog, floating spores, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**10. `enemy_shade_1.png`** — враг
```
living shadow with white eyes, theme: shadow forest inside the tower, black trees, violet fog, floating spores, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**11. `enemy_shade_2.png`** — враг
```
whispering treant, theme: shadow forest inside the tower, black trees, violet fog, floating spores, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**12. `enemy_shade_3.png`** — враг
```
ghost lynx, theme: shadow forest inside the tower, black trees, violet fog, floating spores, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**13. `enemy_shade_4.png`** — враг
```
witch's doll, theme: shadow forest inside the tower, black trees, violet fog, floating spores, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**14. `boss_shade_1.png`** — босс
```
grove elder treant with a lantern, boss monster, imposing, theme: shadow forest inside the tower, black trees, violet fog, floating spores, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**15. `boss_shade_2.png`** — босс
```
faceless hunter with a bow, boss monster, imposing, theme: shadow forest inside the tower, black trees, violet fog, floating spores, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**16. `final_shade.png`** — финальный босс
```
Queen of Shadows, tall dark queen with a crown of thorns, final boss, epic, very detailed, theme: shadow forest inside the tower, black trees, violet fog, floating spores, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```

## Пак 10 — Биомы 4–5: Ледяная цитадель + Затопленный храм

**1. `bg_frost.jpg`** — фон · Ледяная цитадель
```
frozen citadel, ice pillars, blue light, frost on stone, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**2. `enemy_frost_1.png`** — враг
```
ice knight, theme: frozen citadel, ice pillars, blue light, frost on stone, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**3. `enemy_frost_2.png`** — враг
```
crystal spider, theme: frozen citadel, ice pillars, blue light, frost on stone, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**4. `enemy_frost_3.png`** — враг
```
snow golem, theme: frozen citadel, ice pillars, blue light, frost on stone, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**5. `enemy_frost_4.png`** — враг
```
frost spirit, theme: frozen citadel, ice pillars, blue light, frost on stone, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**6. `boss_frost_1.png`** — босс
```
commander of cold with an ice spear, boss monster, imposing, theme: frozen citadel, ice pillars, blue light, frost on stone, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**7. `boss_frost_2.png`** — босс
```
white baby dragon, boss monster, imposing, theme: frozen citadel, ice pillars, blue light, frost on stone, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**8. `final_frost.png`** — финальный босс
```
King of Eternal Winter, ice giant on a frozen throne, final boss, epic, very detailed, theme: frozen citadel, ice pillars, blue light, frost on stone, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**9. `bg_tide.jpg`** — фон · Затопленный храм
```
flooded temple, water on the floor, seaweed, teal light from above, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**10. `enemy_tide_1.png`** — враг
```
drowned man, theme: flooded temple, water on the floor, seaweed, teal light from above, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**11. `enemy_tide_2.png`** — враг
```
blood slime, theme: flooded temple, water on the floor, seaweed, teal light from above, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**12. `enemy_tide_3.png`** — враг
```
deep sea priest, theme: flooded temple, water on the floor, seaweed, teal light from above, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**13. `enemy_tide_4.png`** — враг
```
sea serpent, theme: flooded temple, water on the floor, seaweed, teal light from above, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**14. `boss_tide_1.png`** — босс
```
voice of the tide, siren priest, boss monster, imposing, theme: flooded temple, water on the floor, seaweed, teal light from above, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**15. `boss_tide_2.png`** — босс
```
mistress of shells, crab queen, boss monster, imposing, theme: flooded temple, water on the floor, seaweed, teal light from above, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**16. `final_tide.png`** — финальный босс
```
Leviathan, huge sea serpent rising from water, final boss, epic, very detailed, theme: flooded temple, water on the floor, seaweed, teal light from above, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```

## Пак 11 — Биомы 6–7: Кровавая арена + Пустотные врата

**1. `bg_blood.jpg`** — фон · Кровавая арена
```
blood arena, sand with red stains, chains, torches, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**2. `enemy_blood_1.png`** — враг
```
gladiator, theme: blood arena, sand with red stains, chains, torches, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**3. `enemy_blood_2.png`** — враг
```
arena berserker, theme: blood arena, sand with red stains, chains, torches, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**4. `enemy_blood_3.png`** — враг
```
blood hound, theme: blood arena, sand with red stains, chains, torches, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**5. `enemy_blood_4.png`** — враг
```
ghost knight, theme: blood arena, sand with red stains, chains, torches, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**6. `boss_blood_1.png`** — босс
```
arena champion with trophies, boss monster, imposing, theme: blood arena, sand with red stains, chains, torches, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**7. `boss_blood_2.png`** — босс
```
executioner with a huge axe, boss monster, imposing, theme: blood arena, sand with red stains, chains, torches, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**8. `final_blood.png`** — финальный босс
```
Soul Eater, demonic gladiator with glowing soul chains, final boss, epic, very detailed, theme: blood arena, sand with red stains, chains, torches, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**9. `bg_void.jpg`** — фон · Пустотные врата
```
void gates, broken space, stars and purple rifts, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**10. `enemy_void_1.png`** — враг
```
void imp, theme: void gates, broken space, stars and purple rifts, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**11. `enemy_void_2.png`** — враг
```
star eye floating eyeball, theme: void gates, broken space, stars and purple rifts, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**12. `enemy_void_3.png`** — враг
```
distorted mage, theme: void gates, broken space, stars and purple rifts, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**13. `enemy_void_4.png`** — враг
```
light eater shadow beast, theme: void gates, broken space, stars and purple rifts, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**14. `boss_void_1.png`** — босс
```
gatekeeper with keys of light, boss monster, imposing, theme: void gates, broken space, stars and purple rifts, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**15. `boss_void_2.png`** — босс
```
being stitched from stars, boss monster, imposing, theme: void gates, broken space, stars and purple rifts, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**16. `final_void.png`** — финальный босс
```
Eye of the Abyss, gigantic eye with tentacles of darkness, final boss, epic, very detailed, theme: void gates, broken space, stars and purple rifts, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```

## Пак 12 — Биомы 8–9: Престол Башни + Ржавые механизмы

**1. `bg_throne.jpg`** — фон · Престол Башни
```
throne hall of the tower, gold and black marble, banners, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**2. `enemy_throne_1.png`** — враг
```
golden guardian, theme: throne hall of the tower, gold and black marble, banners, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**3. `enemy_throne_2.png`** — враг
```
fallen angel, theme: throne hall of the tower, gold and black marble, banners, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**4. `enemy_throne_3.png`** — враг
```
keeper of scrolls, theme: throne hall of the tower, gold and black marble, banners, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**5. `enemy_throne_4.png`** — враг
```
living face of the tower, stone mask, theme: throne hall of the tower, gold and black marble, banners, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**6. `boss_throne_1.png`** — босс
```
right hand of the throne, gold knight, boss monster, imposing, theme: throne hall of the tower, gold and black marble, banners, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**7. `boss_throne_2.png`** — босс
```
left hand of the throne, dark mage, boss monster, imposing, theme: throne hall of the tower, gold and black marble, banners, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**8. `final_throne.png`** — финальный босс
```
First Summoner, ancient sorcerer king on a floating throne, final boss, epic, very detailed, theme: throne hall of the tower, gold and black marble, banners, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**9. `bg_rust.jpg`** — фон · Ржавые механизмы
```
rusty clockwork halls, gears, pipes, steam, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**10. `enemy_rust_1.png`** — враг
```
gear hound, theme: rusty clockwork halls, gears, pipes, steam, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**11. `enemy_rust_2.png`** — враг
```
steam guardian, theme: rusty clockwork halls, gears, pipes, steam, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**12. `enemy_rust_3.png`** — враг
```
clockwork soldier, theme: rusty clockwork halls, gears, pipes, steam, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**13. `enemy_rust_4.png`** — враг
```
oil slime, theme: rusty clockwork halls, gears, pipes, steam, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**14. `boss_rust_1.png`** — босс
```
chief engineer in a mech suit, boss monster, imposing, theme: rusty clockwork halls, gears, pipes, steam, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**15. `boss_rust_2.png`** — босс
```
giant boiler golem, boss monster, imposing, theme: rusty clockwork halls, gears, pipes, steam, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**16. `final_rust.png`** — финальный босс
```
Tower Clockmaker, huge clockwork titan with a clock face, final boss, epic, very detailed, theme: rusty clockwork halls, gears, pipes, steam, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```

## Пак 13 — Биомы 10–11: Небесный сад + Склеп королей

**1. `bg_garden.jpg`** — фон · Небесный сад
```
sky garden, flowers, sunlight through glass dome, vines, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**2. `enemy_garden_1.png`** — враг
```
flower fairy, theme: sky garden, flowers, sunlight through glass dome, vines, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**3. `enemy_garden_2.png`** — враг
```
strangling vine, theme: sky garden, flowers, sunlight through glass dome, vines, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**4. `enemy_garden_3.png`** — враг
```
garden golem, theme: sky garden, flowers, sunlight through glass dome, vines, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**5. `enemy_garden_4.png`** — враг
```
pollen swarm, theme: sky garden, flowers, sunlight through glass dome, vines, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**6. `boss_garden_1.png`** — босс
```
keeper of buds, boss monster, imposing, theme: sky garden, flowers, sunlight through glass dome, vines, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**7. `boss_garden_2.png`** — босс
```
thorn knight, boss monster, imposing, theme: sky garden, flowers, sunlight through glass dome, vines, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**8. `final_garden.png`** — финальный босс
```
Summit Tree, giant ancient tree spirit, final boss, epic, very detailed, theme: sky garden, flowers, sunlight through glass dome, vines, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**9. `bg_kings.jpg`** — фон · Склеп королей
```
crypt of kings, golden sarcophagi, dusty treasures, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**10. `enemy_kings_1.png`** — враг
```
royal undead, theme: crypt of kings, golden sarcophagi, dusty treasures, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**11. `enemy_kings_2.png`** — враг
```
gilded skeleton, theme: crypt of kings, golden sarcophagi, dusty treasures, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**12. `enemy_kings_3.png`** — враг
```
tomb guard, theme: crypt of kings, golden sarcophagi, dusty treasures, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**13. `enemy_kings_4.png`** — враг
```
scarab beetle, theme: crypt of kings, golden sarcophagi, dusty treasures, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**14. `boss_kings_1.png`** — босс
```
headless prince, boss monster, imposing, theme: crypt of kings, golden sarcophagi, dusty treasures, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**15. `boss_kings_2.png`** — босс
```
mummy queen, boss monster, imposing, theme: crypt of kings, golden sarcophagi, dusty treasures, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**16. `final_kings.png`** — финальный босс
```
King under the Barrow, giant crowned lich, final boss, epic, very detailed, theme: crypt of kings, golden sarcophagi, dusty treasures, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```

## Пак 14 — Биомы 12–13: Грибные гроты + Обсидиановая кузня

**1. `bg_fungus.jpg`** — фон · Грибные гроты
```
mushroom grottos, glowing giant mushrooms, spores, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**2. `enemy_fungus_1.png`** — враг
```
sporeling, theme: mushroom grottos, glowing giant mushrooms, spores, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**3. `enemy_fungus_2.png`** — враг
```
mushroom troll, theme: mushroom grottos, glowing giant mushrooms, spores, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**4. `enemy_fungus_3.png`** — враг
```
glowing slime, theme: mushroom grottos, glowing giant mushrooms, spores, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**5. `enemy_fungus_4.png`** — враг
```
mycelium spirit, theme: mushroom grottos, glowing giant mushrooms, spores, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**6. `boss_fungus_1.png`** — босс
```
spore mother, boss monster, imposing, theme: mushroom grottos, glowing giant mushrooms, spores, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**7. `boss_fungus_2.png`** — босс
```
giant mushroom cap colossus, boss monster, imposing, theme: mushroom grottos, glowing giant mushrooms, spores, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**8. `final_fungus.png`** — финальный босс
```
Great Mycelium, huge mass of mushrooms with a face, final boss, epic, very detailed, theme: mushroom grottos, glowing giant mushrooms, spores, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**9. `bg_forge.jpg`** — фон · Обсидиановая кузня
```
obsidian forge, anvils, lava rivers, black glass, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**10. `enemy_forge_1.png`** — враг
```
lava elemental, theme: obsidian forge, anvils, lava rivers, black glass, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**11. `enemy_forge_2.png`** — враг
```
hammer smith brute, theme: obsidian forge, anvils, lava rivers, black glass, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**12. `enemy_forge_3.png`** — враг
```
obsidian golem, theme: obsidian forge, anvils, lava rivers, black glass, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**13. `enemy_forge_4.png`** — враг
```
spark imp, theme: obsidian forge, anvils, lava rivers, black glass, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**14. `boss_forge_1.png`** — босс
```
anvil master, boss monster, imposing, theme: obsidian forge, anvils, lava rivers, black glass, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**15. `boss_forge_2.png`** — босс
```
fire smith, boss monster, imposing, theme: obsidian forge, anvils, lava rivers, black glass, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**16. `final_forge.png`** — финальный босс
```
Lord of the Crucible, molten titan with hammers, final boss, epic, very detailed, theme: obsidian forge, anvils, lava rivers, black glass, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```

## Пак 15 — Биомы 14–15: Зеркальный лабиринт + Чумные палаты

**1. `bg_mirror.jpg`** — фон · Зеркальный лабиринт
```
mirror labyrinth, shards, reflections, silver light, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**2. `enemy_mirror_1.png`** — враг
```
reflection doppel, theme: mirror labyrinth, shards, reflections, silver light, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**3. `enemy_mirror_2.png`** — враг
```
shard knight, theme: mirror labyrinth, shards, reflections, silver light, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**4. `enemy_mirror_3.png`** — враг
```
twin copy, theme: mirror labyrinth, shards, reflections, silver light, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**5. `enemy_mirror_4.png`** — враг
```
mirror moth, theme: mirror labyrinth, shards, reflections, silver light, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**6. `boss_mirror_1.png`** — босс
```
crooked mirror creature, boss monster, imposing, theme: mirror labyrinth, shards, reflections, silver light, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**7. `boss_mirror_2.png`** — босс
```
thousand-faced one, boss monster, imposing, theme: mirror labyrinth, shards, reflections, silver light, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**8. `final_mirror.png`** — финальный босс
```
The One Who Looks Back, mirror-faced giant, final boss, epic, very detailed, theme: mirror labyrinth, shards, reflections, silver light, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**9. `bg_plague.jpg`** — фон · Чумные палаты
```
plague wards, sick beds, green mist, rats, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**10. `enemy_plague_1.png`** — враг
```
plague doctor, theme: plague wards, sick beds, green mist, rats, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**11. `enemy_plague_2.png`** — враг
```
rotten rat, theme: plague wards, sick beds, green mist, rats, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**12. `enemy_plague_3.png`** — враг
```
infected man, theme: plague wards, sick beds, green mist, rats, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**13. `enemy_plague_4.png`** — враг
```
fly swarm, theme: plague wards, sick beds, green mist, rats, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**14. `boss_plague_1.png`** — босс
```
chief healer with bone saw, boss monster, imposing, theme: plague wards, sick beds, green mist, rats, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**15. `boss_plague_2.png`** — босс
```
plague matron, boss monster, imposing, theme: plague wards, sick beds, green mist, rats, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**16. `final_plague.png`** — финальный босс
```
Father of Pestilence, bloated plague giant, final boss, epic, very detailed, theme: plague wards, sick beds, green mist, rats, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```

## Пак 16 — Биомы 16–17: Песчаный некрополь + Грозовой шпиль

**1. `bg_sand.jpg`** — фон · Песчаный некрополь
```
sand necropolis, sandstone, golden light, dunes inside, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**2. `enemy_sand_1.png`** — враг
```
sand scorpion, theme: sand necropolis, sandstone, golden light, dunes inside, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**3. `enemy_sand_2.png`** — враг
```
desert mummy, theme: sand necropolis, sandstone, golden light, dunes inside, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**4. `enemy_sand_3.png`** — враг
```
sun priest, theme: sand necropolis, sandstone, golden light, dunes inside, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**5. `enemy_sand_4.png`** — враг
```
dune worm, theme: sand necropolis, sandstone, golden light, dunes inside, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**6. `boss_sand_1.png`** — босс
```
ghost pharaoh, boss monster, imposing, theme: sand necropolis, sandstone, golden light, dunes inside, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**7. `boss_sand_2.png`** — босс
```
sphinx, boss monster, imposing, theme: sand necropolis, sandstone, golden light, dunes inside, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**8. `final_sand.png`** — финальный босс
```
King of Empty Sands, sand titan with a golden mask, final boss, epic, very detailed, theme: sand necropolis, sandstone, golden light, dunes inside, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**9. `bg_storm.jpg`** — фон · Грозовой шпиль
```
storm spire, open windows to thunder clouds, lightning, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**10. `enemy_storm_1.png`** — враг
```
storm eagle, theme: storm spire, open windows to thunder clouds, lightning, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**11. `enemy_storm_2.png`** — враг
```
thunder golem, theme: storm spire, open windows to thunder clouds, lightning, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**12. `enemy_storm_3.png`** — враг
```
whirlwind spirit, theme: storm spire, open windows to thunder clouds, lightning, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**13. `enemy_storm_4.png`** — враг
```
wandering spark, theme: storm spire, open windows to thunder clouds, lightning, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**14. `boss_storm_1.png`** — босс
```
lord of clouds, boss monster, imposing, theme: storm spire, open windows to thunder clouds, lightning, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**15. `boss_storm_2.png`** — босс
```
lightning knight, boss monster, imposing, theme: storm spire, open windows to thunder clouds, lightning, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**16. `final_storm.png`** — финальный босс
```
Eye of the Storm, living thunderstorm with an eye, final boss, epic, very detailed, theme: storm spire, open windows to thunder clouds, lightning, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```

## Пак 17 — Биомы 18–19: Сады плоти + Звёздная обсерватория

**1. `bg_flesh.jpg`** — фон · Сады плоти
```
gardens of flesh, organic walls, veins, red light (not gory), vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**2. `enemy_flesh_1.png`** — враг
```
pulsing growth, theme: gardens of flesh, organic walls, veins, red light (not gory), single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**3. `enemy_flesh_2.png`** — враг
```
stitched hound, theme: gardens of flesh, organic walls, veins, red light (not gory), single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**4. `enemy_flesh_3.png`** — враг
```
meat golem, theme: gardens of flesh, organic walls, veins, red light (not gory), single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**5. `enemy_flesh_4.png`** — враг
```
blood flower, theme: gardens of flesh, organic walls, veins, red light (not gory), single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**6. `boss_flesh_1.png`** — босс
```
flesh gardener, boss monster, imposing, theme: gardens of flesh, organic walls, veins, red light (not gory), single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**7. `boss_flesh_2.png`** — босс
```
many-armed creature, boss monster, imposing, theme: gardens of flesh, organic walls, veins, red light (not gory), single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**8. `final_flesh.png`** — финальный босс
```
Mother of the Tumor, huge organic queen (stylized, not gory), final boss, epic, very detailed, theme: gardens of flesh, organic walls, veins, red light (not gory), single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**9. `bg_stars.jpg`** — фон · Звёздная обсерватория
```
star observatory, telescopes, star maps, cosmic light, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**10. `enemy_stars_1.png`** — враг
```
astrologer, theme: star observatory, telescopes, star maps, cosmic light, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**11. `enemy_stars_2.png`** — враг
```
meteor golem, theme: star observatory, telescopes, star maps, cosmic light, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**12. `enemy_stars_3.png`** — враг
```
constellation beast, theme: star observatory, telescopes, star maps, cosmic light, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**13. `enemy_stars_4.png`** — враг
```
comet spirit, theme: star observatory, telescopes, star maps, cosmic light, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**14. `boss_stars_1.png`** — босс
```
stargazer, boss monster, imposing, theme: star observatory, telescopes, star maps, cosmic light, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**15. `boss_stars_2.png`** — босс
```
fallen star, boss monster, imposing, theme: star observatory, telescopes, star maps, cosmic light, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**16. `final_stars.png`** — финальный босс
```
Devourer of Constellations, cosmic beast, final boss, epic, very detailed, theme: star observatory, telescopes, star maps, cosmic light, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```

## Пак 18 — Биом 20: Сердце Башни

**1. `bg_heart.jpg`** — фон · Сердце Башни
```
heart of the tower, living stone, glowing red core, pulsing veins, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**2. `enemy_heart_1.png`** — враг
```
heart guardian, theme: heart of the tower, living stone, glowing red core, pulsing veins, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**3. `enemy_heart_2.png`** — враг
```
living masonry, theme: heart of the tower, living stone, glowing red core, pulsing veins, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**4. `enemy_heart_3.png`** — враг
```
blood of the tower, theme: heart of the tower, living stone, glowing red core, pulsing veins, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**5. `enemy_heart_4.png`** — враг
```
pulse spirit, theme: heart of the tower, living stone, glowing red core, pulsing veins, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**6. `boss_heart_1.png`** — босс
```
left atrium guardian, boss monster, imposing, theme: heart of the tower, living stone, glowing red core, pulsing veins, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**7. `boss_heart_2.png`** — босс
```
right atrium guardian, boss monster, imposing, theme: heart of the tower, living stone, glowing red core, pulsing veins, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**8. `final_heart.png`** — финальный босс
```
Heart of the Tower, giant glowing crystal heart with a body of stone, final boss, epic, very detailed, theme: heart of the tower, living stone, glowing red core, pulsing veins, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```

## Пак 19 — Иконки систем

Артефакты, руны, кости, способности, классы, подземелья, сундуки.

**1. `icon_art_blade.png`** — Клинок первого призыва
```
ancient summoner sword with runes, legendary artifact, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**2. `icon_art_eye.png`** — Око охотника
```
glowing hunter eye amulet, legendary artifact, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**3. `icon_art_fang.png`** — Клык бездны
```
dark purple fang, legendary artifact, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**4. `icon_art_grail.png`** — Кровавый грааль
```
golden grail with blood, legendary artifact, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**5. `icon_art_banner.png`** — Знамя отряда
```
war banner, legendary artifact, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**6. `icon_art_gaunt.png`** — Перчатка титана
```
giant steel gauntlet, legendary artifact, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**7. `icon_art_feather.png`** — Перо феникса
```
burning phoenix feather, legendary artifact, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**8. `icon_art_sand.png`** — Песочные часы
```
ornate hourglass, legendary artifact, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**9. `icon_art_gate.png`** — Врата восхождения
```
small glowing stone gate, legendary artifact, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**10. `icon_rune_might.png`** — Руна мощи
```
carved stone rune with a glowing red symbol, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**11. `icon_rune_host.png`** — Руна отряда
```
carved stone rune with a glowing blue symbol, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**12. `icon_rune_strike.png`** — Руна удара
```
carved stone rune with a glowing orange symbol, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**13. `icon_rune_hunt.png`** — Руна охоты
```
carved stone rune with a glowing purple symbol, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**14. `icon_rune_wealth.png`** — Руна богатства
```
carved stone rune with a glowing gold symbol, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**15. `icon_rune_stone.png`** — Руна камня
```
carved stone rune with a glowing cyan symbol, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**16. `icon_bone_head.png`** — Голова
```
monster skull helmet, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**17. `icon_bone_chest.png`** — Нагрудник
```
ribcage chest armor, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**18. `icon_bone_armR.png`** — Правая рука
```
bone arm guard, right, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**19. `icon_bone_armL.png`** — Левая рука
```
bone arm guard, left, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**20. `icon_bone_legR.png`** — Правая нога
```
bone leg guard, right, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**21. `icon_bone_legL.png`** — Левая нога
```
bone leg guard, left, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**22. `icon_ability_flurry.png`** — Шквал ударов
```
flurry of sword slashes, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**23. `icon_ability_hunt.png`** — Клеймо охотника
```
glowing target mark, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**24. `icon_class_blade.png`** — Мастер клинка
```
sword, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**25. `icon_class_caller.png`** — Призыватель
```
summoning circle, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**26. `icon_class_hunter.png`** — Охотник
```
bow and arrow, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**27. `icon_class_alch.png`** — Алхимик
```
alchemy flask, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**28. `icon_dungeon_vault.png`** — Сокровищница
```
treasure vault door, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**29. `icon_dungeon_mine.png`** — Шахта осколков
```
mine entrance with blue crystals, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**30. `icon_dungeon_forge.png`** — Рунная кузня
```
anvil with rune, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**31. `icon_dungeon_endless.png`** — Бесконечное подземелье
```
endless spiral staircase, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**32. `icon_chest_quest.png`** — Сундук заданий
```
wooden treasure chest, closed, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**33. `icon_chest_quest_open.png`** — Сундук заданий открыт
```
open empty treasure chest, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```

## Пак 20 — Тотемы биомов

Один тотем на биом.

**1. `icon_totem_crypt.png`** — Тотем · Гнилые катакомбы
```
small carved totem in the theme of rotten catacombs, bone walls, green candles, damp stone, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**2. `icon_totem_ash.png`** — Тотем · Пепельные шахты
```
small carved totem in the theme of ash mines, glowing lava cracks, rails and mine carts, smoke, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**3. `icon_totem_shade.png`** — Тотем · Лес теней
```
small carved totem in the theme of shadow forest inside the tower, black trees, violet fog, floating spores, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**4. `icon_totem_frost.png`** — Тотем · Ледяная цитадель
```
small carved totem in the theme of frozen citadel, ice pillars, blue light, frost on stone, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**5. `icon_totem_tide.png`** — Тотем · Затопленный храм
```
small carved totem in the theme of flooded temple, water on the floor, seaweed, teal light from above, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**6. `icon_totem_blood.png`** — Тотем · Кровавая арена
```
small carved totem in the theme of blood arena, sand with red stains, chains, torches, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**7. `icon_totem_void.png`** — Тотем · Пустотные врата
```
small carved totem in the theme of void gates, broken space, stars and purple rifts, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**8. `icon_totem_throne.png`** — Тотем · Престол Башни
```
small carved totem in the theme of throne hall of the tower, gold and black marble, banners, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**9. `icon_totem_rust.png`** — Тотем · Ржавые механизмы
```
small carved totem in the theme of rusty clockwork halls, gears, pipes, steam, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**10. `icon_totem_garden.png`** — Тотем · Небесный сад
```
small carved totem in the theme of sky garden, flowers, sunlight through glass dome, vines, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**11. `icon_totem_kings.png`** — Тотем · Склеп королей
```
small carved totem in the theme of crypt of kings, golden sarcophagi, dusty treasures, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**12. `icon_totem_fungus.png`** — Тотем · Грибные гроты
```
small carved totem in the theme of mushroom grottos, glowing giant mushrooms, spores, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**13. `icon_totem_forge.png`** — Тотем · Обсидиановая кузня
```
small carved totem in the theme of obsidian forge, anvils, lava rivers, black glass, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**14. `icon_totem_mirror.png`** — Тотем · Зеркальный лабиринт
```
small carved totem in the theme of mirror labyrinth, shards, reflections, silver light, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**15. `icon_totem_plague.png`** — Тотем · Чумные палаты
```
small carved totem in the theme of plague wards, sick beds, green mist, rats, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**16. `icon_totem_sand.png`** — Тотем · Песчаный некрополь
```
small carved totem in the theme of sand necropolis, sandstone, golden light, dunes inside, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**17. `icon_totem_storm.png`** — Тотем · Грозовой шпиль
```
small carved totem in the theme of storm spire, open windows to thunder clouds, lightning, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**18. `icon_totem_flesh.png`** — Тотем · Сады плоти
```
small carved totem in the theme of gardens of flesh, organic walls, veins, red light (not gory), game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**19. `icon_totem_stars.png`** — Тотем · Звёздная обсерватория
```
small carved totem in the theme of star observatory, telescopes, star maps, cosmic light, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```
**20. `icon_totem_heart.png`** — Тотем · Сердце Башни
```
small carved totem in the theme of heart of the tower, living stone, glowing red core, pulsing veins, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark
```

## Пак 21 — Логотип

Надписи генераторы часто портят — может понадобиться правка.

**1. `ui_logo.png`** — Логотип 1024×512
```
game logo, Russian title «Призванный: Башня Гачи», dark fantasy tower and summoning circle, gold letters, transparent background
```

## Позже (не генерировать сейчас)

- **Облики эволюции** I–III для каждого героя (`ally_<id>_evo1…3.png`) — когда утвердим первых героев в игре. Описание — в `docs/ART_PROMPTS.md`, раздел 2.1.
- **Герои редкостей SS и SSS** — их пока нет в игре; сначала придумаем героев, потом промпты.
- Анимация по кадрам (несколько кадров удара) — после того как эталонный герой встанет в игру.
