# Промпты для картинок игры

Готовые промпты для генерации всех картинок «Призванный: Башня Гачи». Промпты на английском — генераторы понимают его лучше.

## Как пользоваться

1. **Начни с эталона** (GDD §13): сгенерируй главного героя «Призванный» (раздел 1), выбери лучший вариант и залей. Остальных героев генерируй в том же стиле — прикладывай эталон как референс (image reference / «в стиле этой картинки»).
2. К каждому промпту добавляй **общий стиль** (ниже) — тогда всё будет в одном стиле.
3. Готовые файлы клади в репозиторий в папку **`assets/incoming/`** с **именем из таблицы**, затем скажи «забери картинки».
4. **Прозрачный фон.** Если генератор не умеет прозрачность, проси `on a plain flat green background` и потом убери фон (remove.bg, Photoshop, «Удалить фон» в редакторе). Фон должен быть именно прозрачным, без пола и тени.

| Что | Размер | Формат |
|---|---|---|
| Герои, питомцы | 1024×1024, ноги у нижнего края, весь силуэт | PNG, прозрачный фон |
| Враги и боссы | 1024×1024 | PNG, прозрачный фон |
| Фоны залов | 1080×1920 (вертикальный) | JPG или WebP |
| Иконки | 512×512 | PNG, прозрачный фон |
| Эффекты | 512×512 | PNG, прозрачный фон |

**Общий стиль** (вставлять в начало каждого промпта):

```
2.5D dark fantasy, Korean manhwa style, clean bold lineart, cel shading with soft gradients, rich saturated colors on dark tones, dramatic rim light, high detail, game asset
```

Названия папок и имена файлов — латиницей, маленькими буквами, как в таблицах.

## 1. Главный герой — эталон (сделать первым)

Вид **со спины / три четверти со спины** — камера стоит за героем (GDD §13). Остальные герои — анфас или три четверти, лицом к зрителю.

**У тебя уже есть образ Призванного** — `docs/reference/art/heroes/summoned/` (капюшон, рваный фиолетовый плащ, меч, вид со спины). Прикладывай его как референс, промпт ниже описывает этот же образ. Там же лежит Каэрон (`kaeron/`) и эффекты удара и крита (`vfx/`). Сейчас эти листы на сером фоне и одним листом 4×4 — для игры нужны **отдельные кадры с прозрачным фоном**.

**`hero_idle.png`**
```
hooded warrior summoned from another world, hood up, face hidden, black leather and dark steel armor, long tattered dark violet cloak flowing behind, single straight sword in the right hand, faint violet glow on the blade, idle stance, slight breathing pose, seen from behind three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**`hero_attack.png`**
```
hooded warrior summoned from another world, hood up, face hidden, black leather and dark steel armor, long tattered dark violet cloak flowing behind, single straight sword in the right hand, faint violet glow on the blade, attack pose, mid sword swing forward, seen from behind three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**`hero_ult.png`**
```
hooded warrior summoned from another world, hood up, face hidden, black leather and dark steel armor, long tattered dark violet cloak flowing behind, single straight sword in the right hand, faint violet glow on the blade, ultimate pose, sword raised overhead with glowing energy, seen from behind three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**`hero_avatar.png`** — портрет для меню
```
hooded warrior summoned from another world, hood up, face hidden, black leather and dark steel armor, long tattered dark violet cloak flowing behind, single straight sword in the right hand, faint violet glow on the blade, head and shoulders portrait, three-quarter front view, face in the shadow of the hood, glowing violet eyes, plain dark background
```

Если генератор умеет делать **анимацию кадрами**: атаку можно залить как `hero_attack_1.png` … `hero_attack_6.png` — одинаковый холст и одинаковое положение ног во всех кадрах.

## 2. Союзники

Для каждого — 3 файла: `_idle` (стоит в бою), `_attack` (атака), `_avatar` (портрет для карточек). Позже — облики эволюции I–III (раздел 2.1).

### Ирэн · E · `irene`
**`ally_irene_idle.png`**
```
shadow elf archer girl, long silver hair, dark teal hooded leather armor, black longbow, glowing cyan eyes, idle battle stance, three-quarter view facing the viewer, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**`ally_irene_attack.png`**
```
shadow elf archer girl, long silver hair, dark teal hooded leather armor, black longbow, glowing cyan eyes, dynamic attack pose, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**`ally_irene_avatar.png`**
```
shadow elf archer girl, long silver hair, dark teal hooded leather armor, black longbow, glowing cyan eyes, head and shoulders portrait, front view, plain dark background
```

### Борг · D · `borg`
**`ally_borg_idle.png`**
```
huge orc berserker, green-grey skin, war paint, fur and leather, giant double-headed battle axe, idle battle stance, three-quarter view facing the viewer, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**`ally_borg_attack.png`**
```
huge orc berserker, green-grey skin, war paint, fur and leather, giant double-headed battle axe, dynamic attack pose, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**`ally_borg_avatar.png`**
```
huge orc berserker, green-grey skin, war paint, fur and leather, giant double-headed battle axe, head and shoulders portrait, front view, plain dark background
```

### Лиа · C · `lia`
**`ally_lia_idle.png`**
```
human pyromancer girl, red-orange hair, crimson and gold robe, staff topped with a burning orb, small flames around hands, idle battle stance, three-quarter view facing the viewer, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**`ally_lia_attack.png`**
```
human pyromancer girl, red-orange hair, crimson and gold robe, staff topped with a burning orb, small flames around hands, dynamic attack pose, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**`ally_lia_avatar.png`**
```
human pyromancer girl, red-orange hair, crimson and gold robe, staff topped with a burning orb, small flames around hands, head and shoulders portrait, front view, plain dark background
```

### Каэль · B · `kael`
**`ally_kael_idle.png`**
```
half-demon assassin, small black horns, violet eyes, dark purple tight armor, two curved glowing violet daggers, idle battle stance, three-quarter view facing the viewer, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**`ally_kael_attack.png`**
```
half-demon assassin, small black horns, violet eyes, dark purple tight armor, two curved glowing violet daggers, dynamic attack pose, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**`ally_kael_avatar.png`**
```
half-demon assassin, small black horns, violet eyes, dark purple tight armor, two curved glowing violet daggers, head and shoulders portrait, front view, plain dark background
```

### Гаррет · E · `garret`
**`ally_garret_idle.png`**
```
middle-aged human militiaman, simple chainmail, tabard, round wooden shield with iron rim, short sword, stubble, idle battle stance, three-quarter view facing the viewer, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**`ally_garret_attack.png`**
```
middle-aged human militiaman, simple chainmail, tabard, round wooden shield with iron rim, short sword, stubble, dynamic attack pose, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**`ally_garret_avatar.png`**
```
middle-aged human militiaman, simple chainmail, tabard, round wooden shield with iron rim, short sword, stubble, head and shoulders portrait, front view, plain dark background
```

### Сая · D · `saya`
**`ally_saya_idle.png`**
```
half-elf knife thrower girl, short green hair, light green and black outfit, belts full of throwing knives, idle battle stance, three-quarter view facing the viewer, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**`ally_saya_attack.png`**
```
half-elf knife thrower girl, short green hair, light green and black outfit, belts full of throwing knives, dynamic attack pose, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**`ally_saya_avatar.png`**
```
half-elf knife thrower girl, short green hair, light green and black outfit, belts full of throwing knives, head and shoulders portrait, front view, plain dark background
```

### Дрейк · C · `drake`
**`ally_drake_idle.png`**
```
dragonborn spearman, blue scales, horns, blue steel armor, long spear with a dragon-shaped head, idle battle stance, three-quarter view facing the viewer, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**`ally_drake_attack.png`**
```
dragonborn spearman, blue scales, horns, blue steel armor, long spear with a dragon-shaped head, dynamic attack pose, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**`ally_drake_avatar.png`**
```
dragonborn spearman, blue scales, horns, blue steel armor, long spear with a dragon-shaped head, head and shoulders portrait, front view, plain dark background
```

### Ноа · B · `noa`
**`ally_noa_idle.png`**
```
human storm mage boy, white hair, dark blue coat with silver runes, lightning crackling around a short staff, idle battle stance, three-quarter view facing the viewer, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**`ally_noa_attack.png`**
```
human storm mage boy, white hair, dark blue coat with silver runes, lightning crackling around a short staff, dynamic attack pose, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**`ally_noa_avatar.png`**
```
human storm mage boy, white hair, dark blue coat with silver runes, lightning crackling around a short staff, head and shoulders portrait, front view, plain dark background
```

### Вельма · A · `velma`
**`ally_velma_idle.png`**
```
undead necromancer woman, pale grey skin, green glowing eyes, tattered dark green robes, staff with a skull, green soul wisps, idle battle stance, three-quarter view facing the viewer, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**`ally_velma_attack.png`**
```
undead necromancer woman, pale grey skin, green glowing eyes, tattered dark green robes, staff with a skull, green soul wisps, dynamic attack pose, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**`ally_velma_avatar.png`**
```
undead necromancer woman, pale grey skin, green glowing eyes, tattered dark green robes, staff with a skull, green soul wisps, head and shoulders portrait, front view, plain dark background
```

### Рагнар · A · `ragnar`
**`ally_ragnar_idle.png`**
```
fallen death knight, heavy black and dark magenta plate armor, horned helmet with glowing pink eyes, huge greatsword, torn banner on the back, idle battle stance, three-quarter view facing the viewer, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**`ally_ragnar_attack.png`**
```
fallen death knight, heavy black and dark magenta plate armor, horned helmet with glowing pink eyes, huge greatsword, torn banner on the back, dynamic attack pose, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**`ally_ragnar_avatar.png`**
```
fallen death knight, heavy black and dark magenta plate armor, horned helmet with glowing pink eyes, huge greatsword, torn banner on the back, head and shoulders portrait, front view, plain dark background
```

### Сэйрен · S · `seiren`
**`ally_seiren_idle.png`**
```
siren storm queen, long flowing aqua hair, pearl and silver dress, floating slightly, wind swirls and small lightning, idle battle stance, three-quarter view facing the viewer, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**`ally_seiren_attack.png`**
```
siren storm queen, long flowing aqua hair, pearl and silver dress, floating slightly, wind swirls and small lightning, dynamic attack pose, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**`ally_seiren_avatar.png`**
```
siren storm queen, long flowing aqua hair, pearl and silver dress, floating slightly, wind swirls and small lightning, head and shoulders portrait, front view, plain dark background
```

### Азраэль · GOD · `azrael`
**`ally_azrael_idle.png`**
```
ash angel, six grey-white wings with ember edges, white and gold armor, halo of embers, flaming sword, serene merciless face, idle battle stance, three-quarter view facing the viewer, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**`ally_azrael_attack.png`**
```
ash angel, six grey-white wings with ember edges, white and gold armor, halo of embers, flaming sword, serene merciless face, dynamic attack pose, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**`ally_azrael_avatar.png`**
```
ash angel, six grey-white wings with ember edges, white and gold armor, halo of embers, flaming sword, serene merciless face, head and shoulders portrait, front view, plain dark background
```

### Морра · A · `morra`
**`ally_morra_idle.png`**
```
altar keeper priestess, hooded black and gold robes, veil, ritual dagger and candle lantern, glowing runes on hands, idle battle stance, three-quarter view facing the viewer, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**`ally_morra_attack.png`**
```
altar keeper priestess, hooded black and gold robes, veil, ritual dagger and candle lantern, glowing runes on hands, dynamic attack pose, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**`ally_morra_avatar.png`**
```
altar keeper priestess, hooded black and gold robes, veil, ritual dagger and candle lantern, glowing runes on hands, head and shoulders portrait, front view, plain dark background
```

### Карна · S · `carna`
**`ally_carna_idle.png`**
```
carnival fairy illusionist, half-face masquerade mask, harlequin outfit in red and gold, small wings, fireworks sparks in hands, idle battle stance, three-quarter view facing the viewer, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**`ally_carna_attack.png`**
```
carnival fairy illusionist, half-face masquerade mask, harlequin outfit in red and gold, small wings, fireworks sparks in hands, dynamic attack pose, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**`ally_carna_avatar.png`**
```
carnival fairy illusionist, half-face masquerade mask, harlequin outfit in red and gold, small wings, fireworks sparks in hands, head and shoulders portrait, front view, plain dark background
```

### Юки · S · `yuki`
**`ally_yuki_idle.png`**
```
snow spirit priestess, white hair, pale blue kimono-like robes, ice crystal ornaments, floating snowflakes, idle battle stance, three-quarter view facing the viewer, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**`ally_yuki_attack.png`**
```
snow spirit priestess, white hair, pale blue kimono-like robes, ice crystal ornaments, floating snowflakes, dynamic attack pose, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**`ally_yuki_avatar.png`**
```
snow spirit priestess, white hair, pale blue kimono-like robes, ice crystal ornaments, floating snowflakes, head and shoulders portrait, front view, plain dark background
```

### 2.1. Облики эволюции (позже)

Тот же герой с тем же холстом и позой `idle`, добавлять к описанию героя:

- **`ally_<id>_evo1.png`** — I «Пробуждение»: `same character, faint golden aura around the body`
- **`ally_<id>_evo2.png`** — II «Возвышение»: `same character, upgraded armor with ornate shoulder plates and a flowing cape, stronger aura`
- **`ally_<id>_evo3.png`** — III «Истинный облик»: `same character in true form, crown or halo, radiant aura, most ornate armor`

## 3. Призванные существа (питомцы)

**`pet_wolf.png`** — Теневой волк
```
shadow wolf made of black smoke, glowing violet eyes, small companion creature, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**`pet_golem.png`** — Каменный голем
```
small sturdy stone golem with glowing orange runes, small companion creature, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**`pet_phoenix.png`** — Пепельный феникс
```
phoenix of ash and embers, grey feathers with burning orange edges, wings spread, small companion creature, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```
**`pet_drake.png`** — Костяной дракончик
```
small bone dragon skeleton with green ghost fire inside the ribs, small companion creature, three-quarter view, single character, full body from head to feet, nothing cropped, centered, standing on an invisible ground line at the bottom of the canvas, transparent background, no floor, no shadow, no frame, no text, no watermark, same scale and camera as the reference hero
```

## 4. Фоны залов (20 биомов)

Один фон на биом — **`bg_<биом>.jpg`**. Пять залов биома (Преддверие, Галерея, Залы стражи, Святилище, Чертог владыки) пока делаются из одного фона; если захочешь отдельные — имена `bg_<биом>_1.jpg` … `bg_<биом>_5.jpg`.

**`bg_crypt.jpg`** — Гнилые катакомбы
```
rotten catacombs, bone walls, green candles, damp stone, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**`bg_ash.jpg`** — Пепельные шахты
```
ash mines, glowing lava cracks, rails and mine carts, smoke, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**`bg_shade.jpg`** — Лес теней
```
shadow forest inside the tower, black trees, violet fog, floating spores, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**`bg_frost.jpg`** — Ледяная цитадель
```
frozen citadel, ice pillars, blue light, frost on stone, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**`bg_tide.jpg`** — Затопленный храм
```
flooded temple, water on the floor, seaweed, teal light from above, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**`bg_blood.jpg`** — Кровавая арена
```
blood arena, sand with red stains, chains, torches, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**`bg_void.jpg`** — Пустотные врата
```
void gates, broken space, stars and purple rifts, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**`bg_throne.jpg`** — Престол Башни
```
throne hall of the tower, gold and black marble, banners, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**`bg_rust.jpg`** — Ржавые механизмы
```
rusty clockwork halls, gears, pipes, steam, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**`bg_garden.jpg`** — Небесный сад
```
sky garden, flowers, sunlight through glass dome, vines, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**`bg_kings.jpg`** — Склеп королей
```
crypt of kings, golden sarcophagi, dusty treasures, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**`bg_fungus.jpg`** — Грибные гроты
```
mushroom grottos, glowing giant mushrooms, spores, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**`bg_forge.jpg`** — Обсидиановая кузня
```
obsidian forge, anvils, lava rivers, black glass, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**`bg_mirror.jpg`** — Зеркальный лабиринт
```
mirror labyrinth, shards, reflections, silver light, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**`bg_plague.jpg`** — Чумные палаты
```
plague wards, sick beds, green mist, rats, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**`bg_sand.jpg`** — Песчаный некрополь
```
sand necropolis, sandstone, golden light, dunes inside, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**`bg_storm.jpg`** — Грозовой шпиль
```
storm spire, open windows to thunder clouds, lightning, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**`bg_flesh.jpg`** — Сады плоти
```
gardens of flesh, organic walls, veins, red light (not gory), vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**`bg_stars.jpg`** — Звёздная обсерватория
```
star observatory, telescopes, star maps, cosmic light, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```
**`bg_heart.jpg`** — Сердце Башни
```
heart of the tower, living stone, glowing red core, pulsing veins, vertical 9:16 game background, interior hall of a giant dark tower, symmetric composition, empty floor in the lower middle for characters, darker top and bottom edges for UI, no characters, no text, no frame
```

## 5. Враги и боссы

В каждом биоме 4 обычных врага, 2 босса и финальный босс. Боссы — крупнее и богаче деталями, финальный — самый внушительный.

### Гнилые катакомбы · `crypt`
- **`enemy_crypt_1.png`**
  ```
  bone guardian skeleton warrior, theme: rotten catacombs, bone walls, green candles, damp stone, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_crypt_2.png`**
  ```
  scavenger goblin with a sack of bones, theme: rotten catacombs, bone walls, green candles, damp stone, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_crypt_3.png`**
  ```
  blind cultist in a stitched hood, theme: rotten catacombs, bone walls, green candles, damp stone, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_crypt_4.png`**
  ```
  swamp ghoul, theme: rotten catacombs, bone walls, green candles, damp stone, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_crypt_1.png`** (босс)
  ```
  gravedigger with a giant shovel, boss monster, imposing, theme: rotten catacombs, bone walls, green candles, damp stone, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_crypt_2.png`** (босс)
  ```
  queen of worms, giant pale larva with a crown, boss monster, imposing, theme: rotten catacombs, bone walls, green candles, damp stone, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`final_crypt.png`** (финальный босс)
  ```
  Gate Keeper, colossal armored skeleton with a key-shaped halberd, final boss, epic, very detailed, theme: rotten catacombs, bone walls, green candles, damp stone, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```

### Пепельные шахты · `ash`
- **`enemy_ash_1.png`**
  ```
  ash wolf with smoldering fur, theme: ash mines, glowing lava cracks, rails and mine carts, smoke, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_ash_2.png`**
  ```
  rusty mining automaton, theme: ash mines, glowing lava cracks, rails and mine carts, smoke, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_ash_3.png`**
  ```
  stone golem, theme: ash mines, glowing lava cracks, rails and mine carts, smoke, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_ash_4.png`**
  ```
  coal imp, theme: ash mines, glowing lava cracks, rails and mine carts, smoke, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_ash_1.png`** (босс)
  ```
  smelting master with a molten ladle, boss monster, imposing, theme: ash mines, glowing lava cracks, rails and mine carts, smoke, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_ash_2.png`** (босс)
  ```
  iron tyrant in massive armor, boss monster, imposing, theme: ash mines, glowing lava cracks, rails and mine carts, smoke, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`final_ash.png`** (финальный босс)
  ```
  Lord of Ash, burning giant made of coal and embers, final boss, epic, very detailed, theme: ash mines, glowing lava cracks, rails and mine carts, smoke, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```

### Лес теней · `shade`
- **`enemy_shade_1.png`**
  ```
  living shadow with white eyes, theme: shadow forest inside the tower, black trees, violet fog, floating spores, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_shade_2.png`**
  ```
  whispering treant, theme: shadow forest inside the tower, black trees, violet fog, floating spores, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_shade_3.png`**
  ```
  ghost lynx, theme: shadow forest inside the tower, black trees, violet fog, floating spores, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_shade_4.png`**
  ```
  witch's doll, theme: shadow forest inside the tower, black trees, violet fog, floating spores, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_shade_1.png`** (босс)
  ```
  grove elder treant with a lantern, boss monster, imposing, theme: shadow forest inside the tower, black trees, violet fog, floating spores, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_shade_2.png`** (босс)
  ```
  faceless hunter with a bow, boss monster, imposing, theme: shadow forest inside the tower, black trees, violet fog, floating spores, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`final_shade.png`** (финальный босс)
  ```
  Queen of Shadows, tall dark queen with a crown of thorns, final boss, epic, very detailed, theme: shadow forest inside the tower, black trees, violet fog, floating spores, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```

### Ледяная цитадель · `frost`
- **`enemy_frost_1.png`**
  ```
  ice knight, theme: frozen citadel, ice pillars, blue light, frost on stone, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_frost_2.png`**
  ```
  crystal spider, theme: frozen citadel, ice pillars, blue light, frost on stone, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_frost_3.png`**
  ```
  snow golem, theme: frozen citadel, ice pillars, blue light, frost on stone, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_frost_4.png`**
  ```
  frost spirit, theme: frozen citadel, ice pillars, blue light, frost on stone, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_frost_1.png`** (босс)
  ```
  commander of cold with an ice spear, boss monster, imposing, theme: frozen citadel, ice pillars, blue light, frost on stone, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_frost_2.png`** (босс)
  ```
  white baby dragon, boss monster, imposing, theme: frozen citadel, ice pillars, blue light, frost on stone, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`final_frost.png`** (финальный босс)
  ```
  King of Eternal Winter, ice giant on a frozen throne, final boss, epic, very detailed, theme: frozen citadel, ice pillars, blue light, frost on stone, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```

### Затопленный храм · `tide`
- **`enemy_tide_1.png`**
  ```
  drowned man, theme: flooded temple, water on the floor, seaweed, teal light from above, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_tide_2.png`**
  ```
  blood slime, theme: flooded temple, water on the floor, seaweed, teal light from above, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_tide_3.png`**
  ```
  deep sea priest, theme: flooded temple, water on the floor, seaweed, teal light from above, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_tide_4.png`**
  ```
  sea serpent, theme: flooded temple, water on the floor, seaweed, teal light from above, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_tide_1.png`** (босс)
  ```
  voice of the tide, siren priest, boss monster, imposing, theme: flooded temple, water on the floor, seaweed, teal light from above, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_tide_2.png`** (босс)
  ```
  mistress of shells, crab queen, boss monster, imposing, theme: flooded temple, water on the floor, seaweed, teal light from above, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`final_tide.png`** (финальный босс)
  ```
  Leviathan, huge sea serpent rising from water, final boss, epic, very detailed, theme: flooded temple, water on the floor, seaweed, teal light from above, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```

### Кровавая арена · `blood`
- **`enemy_blood_1.png`**
  ```
  gladiator, theme: blood arena, sand with red stains, chains, torches, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_blood_2.png`**
  ```
  arena berserker, theme: blood arena, sand with red stains, chains, torches, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_blood_3.png`**
  ```
  blood hound, theme: blood arena, sand with red stains, chains, torches, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_blood_4.png`**
  ```
  ghost knight, theme: blood arena, sand with red stains, chains, torches, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_blood_1.png`** (босс)
  ```
  arena champion with trophies, boss monster, imposing, theme: blood arena, sand with red stains, chains, torches, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_blood_2.png`** (босс)
  ```
  executioner with a huge axe, boss monster, imposing, theme: blood arena, sand with red stains, chains, torches, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`final_blood.png`** (финальный босс)
  ```
  Soul Eater, demonic gladiator with glowing soul chains, final boss, epic, very detailed, theme: blood arena, sand with red stains, chains, torches, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```

### Пустотные врата · `void`
- **`enemy_void_1.png`**
  ```
  void imp, theme: void gates, broken space, stars and purple rifts, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_void_2.png`**
  ```
  star eye floating eyeball, theme: void gates, broken space, stars and purple rifts, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_void_3.png`**
  ```
  distorted mage, theme: void gates, broken space, stars and purple rifts, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_void_4.png`**
  ```
  light eater shadow beast, theme: void gates, broken space, stars and purple rifts, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_void_1.png`** (босс)
  ```
  gatekeeper with keys of light, boss monster, imposing, theme: void gates, broken space, stars and purple rifts, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_void_2.png`** (босс)
  ```
  being stitched from stars, boss monster, imposing, theme: void gates, broken space, stars and purple rifts, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`final_void.png`** (финальный босс)
  ```
  Eye of the Abyss, gigantic eye with tentacles of darkness, final boss, epic, very detailed, theme: void gates, broken space, stars and purple rifts, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```

### Престол Башни · `throne`
- **`enemy_throne_1.png`**
  ```
  golden guardian, theme: throne hall of the tower, gold and black marble, banners, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_throne_2.png`**
  ```
  fallen angel, theme: throne hall of the tower, gold and black marble, banners, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_throne_3.png`**
  ```
  keeper of scrolls, theme: throne hall of the tower, gold and black marble, banners, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_throne_4.png`**
  ```
  living face of the tower, stone mask, theme: throne hall of the tower, gold and black marble, banners, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_throne_1.png`** (босс)
  ```
  right hand of the throne, gold knight, boss monster, imposing, theme: throne hall of the tower, gold and black marble, banners, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_throne_2.png`** (босс)
  ```
  left hand of the throne, dark mage, boss monster, imposing, theme: throne hall of the tower, gold and black marble, banners, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`final_throne.png`** (финальный босс)
  ```
  First Summoner, ancient sorcerer king on a floating throne, final boss, epic, very detailed, theme: throne hall of the tower, gold and black marble, banners, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```

### Ржавые механизмы · `rust`
- **`enemy_rust_1.png`**
  ```
  gear hound, theme: rusty clockwork halls, gears, pipes, steam, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_rust_2.png`**
  ```
  steam guardian, theme: rusty clockwork halls, gears, pipes, steam, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_rust_3.png`**
  ```
  clockwork soldier, theme: rusty clockwork halls, gears, pipes, steam, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_rust_4.png`**
  ```
  oil slime, theme: rusty clockwork halls, gears, pipes, steam, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_rust_1.png`** (босс)
  ```
  chief engineer in a mech suit, boss monster, imposing, theme: rusty clockwork halls, gears, pipes, steam, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_rust_2.png`** (босс)
  ```
  giant boiler golem, boss monster, imposing, theme: rusty clockwork halls, gears, pipes, steam, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`final_rust.png`** (финальный босс)
  ```
  Tower Clockmaker, huge clockwork titan with a clock face, final boss, epic, very detailed, theme: rusty clockwork halls, gears, pipes, steam, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```

### Небесный сад · `garden`
- **`enemy_garden_1.png`**
  ```
  flower fairy, theme: sky garden, flowers, sunlight through glass dome, vines, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_garden_2.png`**
  ```
  strangling vine, theme: sky garden, flowers, sunlight through glass dome, vines, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_garden_3.png`**
  ```
  garden golem, theme: sky garden, flowers, sunlight through glass dome, vines, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_garden_4.png`**
  ```
  pollen swarm, theme: sky garden, flowers, sunlight through glass dome, vines, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_garden_1.png`** (босс)
  ```
  keeper of buds, boss monster, imposing, theme: sky garden, flowers, sunlight through glass dome, vines, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_garden_2.png`** (босс)
  ```
  thorn knight, boss monster, imposing, theme: sky garden, flowers, sunlight through glass dome, vines, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`final_garden.png`** (финальный босс)
  ```
  Summit Tree, giant ancient tree spirit, final boss, epic, very detailed, theme: sky garden, flowers, sunlight through glass dome, vines, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```

### Склеп королей · `kings`
- **`enemy_kings_1.png`**
  ```
  royal undead, theme: crypt of kings, golden sarcophagi, dusty treasures, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_kings_2.png`**
  ```
  gilded skeleton, theme: crypt of kings, golden sarcophagi, dusty treasures, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_kings_3.png`**
  ```
  tomb guard, theme: crypt of kings, golden sarcophagi, dusty treasures, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_kings_4.png`**
  ```
  scarab beetle, theme: crypt of kings, golden sarcophagi, dusty treasures, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_kings_1.png`** (босс)
  ```
  headless prince, boss monster, imposing, theme: crypt of kings, golden sarcophagi, dusty treasures, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_kings_2.png`** (босс)
  ```
  mummy queen, boss monster, imposing, theme: crypt of kings, golden sarcophagi, dusty treasures, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`final_kings.png`** (финальный босс)
  ```
  King under the Barrow, giant crowned lich, final boss, epic, very detailed, theme: crypt of kings, golden sarcophagi, dusty treasures, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```

### Грибные гроты · `fungus`
- **`enemy_fungus_1.png`**
  ```
  sporeling, theme: mushroom grottos, glowing giant mushrooms, spores, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_fungus_2.png`**
  ```
  mushroom troll, theme: mushroom grottos, glowing giant mushrooms, spores, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_fungus_3.png`**
  ```
  glowing slime, theme: mushroom grottos, glowing giant mushrooms, spores, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_fungus_4.png`**
  ```
  mycelium spirit, theme: mushroom grottos, glowing giant mushrooms, spores, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_fungus_1.png`** (босс)
  ```
  spore mother, boss monster, imposing, theme: mushroom grottos, glowing giant mushrooms, spores, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_fungus_2.png`** (босс)
  ```
  giant mushroom cap colossus, boss monster, imposing, theme: mushroom grottos, glowing giant mushrooms, spores, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`final_fungus.png`** (финальный босс)
  ```
  Great Mycelium, huge mass of mushrooms with a face, final boss, epic, very detailed, theme: mushroom grottos, glowing giant mushrooms, spores, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```

### Обсидиановая кузня · `forge`
- **`enemy_forge_1.png`**
  ```
  lava elemental, theme: obsidian forge, anvils, lava rivers, black glass, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_forge_2.png`**
  ```
  hammer smith brute, theme: obsidian forge, anvils, lava rivers, black glass, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_forge_3.png`**
  ```
  obsidian golem, theme: obsidian forge, anvils, lava rivers, black glass, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_forge_4.png`**
  ```
  spark imp, theme: obsidian forge, anvils, lava rivers, black glass, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_forge_1.png`** (босс)
  ```
  anvil master, boss monster, imposing, theme: obsidian forge, anvils, lava rivers, black glass, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_forge_2.png`** (босс)
  ```
  fire smith, boss monster, imposing, theme: obsidian forge, anvils, lava rivers, black glass, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`final_forge.png`** (финальный босс)
  ```
  Lord of the Crucible, molten titan with hammers, final boss, epic, very detailed, theme: obsidian forge, anvils, lava rivers, black glass, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```

### Зеркальный лабиринт · `mirror`
- **`enemy_mirror_1.png`**
  ```
  reflection doppel, theme: mirror labyrinth, shards, reflections, silver light, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_mirror_2.png`**
  ```
  shard knight, theme: mirror labyrinth, shards, reflections, silver light, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_mirror_3.png`**
  ```
  twin copy, theme: mirror labyrinth, shards, reflections, silver light, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_mirror_4.png`**
  ```
  mirror moth, theme: mirror labyrinth, shards, reflections, silver light, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_mirror_1.png`** (босс)
  ```
  crooked mirror creature, boss monster, imposing, theme: mirror labyrinth, shards, reflections, silver light, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_mirror_2.png`** (босс)
  ```
  thousand-faced one, boss monster, imposing, theme: mirror labyrinth, shards, reflections, silver light, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`final_mirror.png`** (финальный босс)
  ```
  The One Who Looks Back, mirror-faced giant, final boss, epic, very detailed, theme: mirror labyrinth, shards, reflections, silver light, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```

### Чумные палаты · `plague`
- **`enemy_plague_1.png`**
  ```
  plague doctor, theme: plague wards, sick beds, green mist, rats, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_plague_2.png`**
  ```
  rotten rat, theme: plague wards, sick beds, green mist, rats, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_plague_3.png`**
  ```
  infected man, theme: plague wards, sick beds, green mist, rats, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_plague_4.png`**
  ```
  fly swarm, theme: plague wards, sick beds, green mist, rats, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_plague_1.png`** (босс)
  ```
  chief healer with bone saw, boss monster, imposing, theme: plague wards, sick beds, green mist, rats, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_plague_2.png`** (босс)
  ```
  plague matron, boss monster, imposing, theme: plague wards, sick beds, green mist, rats, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`final_plague.png`** (финальный босс)
  ```
  Father of Pestilence, bloated plague giant, final boss, epic, very detailed, theme: plague wards, sick beds, green mist, rats, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```

### Песчаный некрополь · `sand`
- **`enemy_sand_1.png`**
  ```
  sand scorpion, theme: sand necropolis, sandstone, golden light, dunes inside, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_sand_2.png`**
  ```
  desert mummy, theme: sand necropolis, sandstone, golden light, dunes inside, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_sand_3.png`**
  ```
  sun priest, theme: sand necropolis, sandstone, golden light, dunes inside, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_sand_4.png`**
  ```
  dune worm, theme: sand necropolis, sandstone, golden light, dunes inside, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_sand_1.png`** (босс)
  ```
  ghost pharaoh, boss monster, imposing, theme: sand necropolis, sandstone, golden light, dunes inside, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_sand_2.png`** (босс)
  ```
  sphinx, boss monster, imposing, theme: sand necropolis, sandstone, golden light, dunes inside, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`final_sand.png`** (финальный босс)
  ```
  King of Empty Sands, sand titan with a golden mask, final boss, epic, very detailed, theme: sand necropolis, sandstone, golden light, dunes inside, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```

### Грозовой шпиль · `storm`
- **`enemy_storm_1.png`**
  ```
  storm eagle, theme: storm spire, open windows to thunder clouds, lightning, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_storm_2.png`**
  ```
  thunder golem, theme: storm spire, open windows to thunder clouds, lightning, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_storm_3.png`**
  ```
  whirlwind spirit, theme: storm spire, open windows to thunder clouds, lightning, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_storm_4.png`**
  ```
  wandering spark, theme: storm spire, open windows to thunder clouds, lightning, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_storm_1.png`** (босс)
  ```
  lord of clouds, boss monster, imposing, theme: storm spire, open windows to thunder clouds, lightning, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_storm_2.png`** (босс)
  ```
  lightning knight, boss monster, imposing, theme: storm spire, open windows to thunder clouds, lightning, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`final_storm.png`** (финальный босс)
  ```
  Eye of the Storm, living thunderstorm with an eye, final boss, epic, very detailed, theme: storm spire, open windows to thunder clouds, lightning, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```

### Сады плоти · `flesh`
- **`enemy_flesh_1.png`**
  ```
  pulsing growth, theme: gardens of flesh, organic walls, veins, red light (not gory), single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_flesh_2.png`**
  ```
  stitched hound, theme: gardens of flesh, organic walls, veins, red light (not gory), single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_flesh_3.png`**
  ```
  meat golem, theme: gardens of flesh, organic walls, veins, red light (not gory), single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_flesh_4.png`**
  ```
  blood flower, theme: gardens of flesh, organic walls, veins, red light (not gory), single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_flesh_1.png`** (босс)
  ```
  flesh gardener, boss monster, imposing, theme: gardens of flesh, organic walls, veins, red light (not gory), single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_flesh_2.png`** (босс)
  ```
  many-armed creature, boss monster, imposing, theme: gardens of flesh, organic walls, veins, red light (not gory), single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`final_flesh.png`** (финальный босс)
  ```
  Mother of the Tumor, huge organic queen (stylized, not gory), final boss, epic, very detailed, theme: gardens of flesh, organic walls, veins, red light (not gory), single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```

### Звёздная обсерватория · `stars`
- **`enemy_stars_1.png`**
  ```
  astrologer, theme: star observatory, telescopes, star maps, cosmic light, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_stars_2.png`**
  ```
  meteor golem, theme: star observatory, telescopes, star maps, cosmic light, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_stars_3.png`**
  ```
  constellation beast, theme: star observatory, telescopes, star maps, cosmic light, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_stars_4.png`**
  ```
  comet spirit, theme: star observatory, telescopes, star maps, cosmic light, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_stars_1.png`** (босс)
  ```
  stargazer, boss monster, imposing, theme: star observatory, telescopes, star maps, cosmic light, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_stars_2.png`** (босс)
  ```
  fallen star, boss monster, imposing, theme: star observatory, telescopes, star maps, cosmic light, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`final_stars.png`** (финальный босс)
  ```
  Devourer of Constellations, cosmic beast, final boss, epic, very detailed, theme: star observatory, telescopes, star maps, cosmic light, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```

### Сердце Башни · `heart`
- **`enemy_heart_1.png`**
  ```
  heart guardian, theme: heart of the tower, living stone, glowing red core, pulsing veins, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_heart_2.png`**
  ```
  living masonry, theme: heart of the tower, living stone, glowing red core, pulsing veins, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_heart_3.png`**
  ```
  blood of the tower, theme: heart of the tower, living stone, glowing red core, pulsing veins, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`enemy_heart_4.png`**
  ```
  pulse spirit, theme: heart of the tower, living stone, glowing red core, pulsing veins, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_heart_1.png`** (босс)
  ```
  left atrium guardian, boss monster, imposing, theme: heart of the tower, living stone, glowing red core, pulsing veins, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`boss_heart_2.png`** (босс)
  ```
  right atrium guardian, boss monster, imposing, theme: heart of the tower, living stone, glowing red core, pulsing veins, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```
- **`final_heart.png`** (финальный босс)
  ```
  Heart of the Tower, giant glowing crystal heart with a body of stone, final boss, epic, very detailed, theme: heart of the tower, living stone, glowing red core, pulsing veins, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
  ```

### Редкие враги

**`rare_gold.png`** — Золотой гоблин
```
golden goblin carrying a huge sack of gold coins, sparkling, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**`rare_crystal.png`** — Кристальный ёж
```
crystal hedgehog with blue crystal spikes, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```
**`rare_chest.png`** — Сундук Башни
```
living treasure chest mimic with gold coins spilling out, golden glow, single monster facing the viewer, full body, nothing cropped, centered, transparent background, no floor, no frame, no text, no watermark
```

## 6. Иконки

### Кнопки меню (в рамку игра вставит сама)

- **`icon_menu_heroes.png`** — Герои: `knight helmet, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_menu_portal.png`** — Портал: `swirling violet summoning portal, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_menu_altar.png`** — Алтарь: `stone altar with candles, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_menu_quests.png`** — Задания: `rolled parchment scroll with wax seal, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_menu_season.png`** — Сезон: `carnival theater mask, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_menu_up.png`** — Прокачка: `crossed swords, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_menu_souls.png`** — Души: `glowing blue ghost soul, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_menu_runes.png`** — Руны: `stone with a glowing rune, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_menu_pve.png`** — PvE: `compass, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_menu_events.png`** — События: `red paper lantern, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_menu_bones.png`** — Кости: `crossed monster bones, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_menu_inbox.png`** — Награды: `gift box with ribbon, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_menu_settings.png`** — Настройки: `iron gear, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_menu_map.png`** — Карта Башни: `tower map scroll, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`

### Ресурсы

- **`icon_res_gold.png`** — Золото: `gold coin with a tower emblem, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_res_ticket.png`** — Билет призыва: `violet summoning ticket, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_res_shard.png`** — Осколок Башни: `blue crystal shard, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_res_heart.png`** — Сердце стража: `burning red crystal heart, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_res_soul.png`** — Душа: `blue soul flame, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_res_essence.png`** — Эссенция: `small glowing white-gold star, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_res_dust.png`** — Костяная пыль: `pile of bone dust, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_res_lantern.png`** — Фонарь: `red festival lantern, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_res_token.png`** — Жетон сезона: `carnival token coin, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`

### Артефакты

- **`icon_art_blade.png`** — Клинок первого призыва: `ancient summoner sword with runes, legendary artifact, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_art_eye.png`** — Око охотника: `glowing hunter eye amulet, legendary artifact, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_art_fang.png`** — Клык бездны: `dark purple fang, legendary artifact, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_art_grail.png`** — Кровавый грааль: `golden grail with blood, legendary artifact, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_art_banner.png`** — Знамя отряда: `war banner, legendary artifact, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_art_gaunt.png`** — Перчатка титана: `giant steel gauntlet, legendary artifact, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_art_feather.png`** — Перо феникса: `burning phoenix feather, legendary artifact, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_art_sand.png`** — Песочные часы: `ornate hourglass, legendary artifact, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_art_gate.png`** — Врата восхождения: `small glowing stone gate, legendary artifact, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`

### Руны

- **`icon_rune_might.png`** — Руна мощи: `carved stone rune with a glowing red symbol, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_rune_host.png`** — Руна отряда: `carved stone rune with a glowing blue symbol, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_rune_strike.png`** — Руна удара: `carved stone rune with a glowing orange symbol, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_rune_hunt.png`** — Руна охоты: `carved stone rune with a glowing purple symbol, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_rune_wealth.png`** — Руна богатства: `carved stone rune with a glowing gold symbol, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_rune_stone.png`** — Руна камня: `carved stone rune with a glowing cyan symbol, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`

### Кости монстров (слоты)

- **`icon_bone_head.png`** — Голова: `monster skull helmet, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_bone_chest.png`** — Нагрудник: `ribcage chest armor, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_bone_armR.png`** — Правая рука: `bone arm guard, right, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_bone_armL.png`** — Левая рука: `bone arm guard, left, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_bone_legR.png`** — Правая нога: `bone leg guard, right, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_bone_legL.png`** — Левая нога: `bone leg guard, left, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`

### Тотемы биомов

- **`icon_totem_<биом>.png`** (20 штук, `<биом>` — как у фонов): `small carved totem in the theme of <тема биома из раздела 4>, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`

### Способности, классы, подземелья, сундуки

- **`icon_ability_flurry.png`** — Шквал ударов: `flurry of sword slashes, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_ability_hunt.png`** — Клеймо охотника: `glowing target mark, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_class_blade.png`** — Мастер клинка: `sword, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_class_caller.png`** — Призыватель: `summoning circle, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_class_hunter.png`** — Охотник: `bow and arrow, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_class_alch.png`** — Алхимик: `alchemy flask, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_dungeon_vault.png`** — Сокровищница: `treasure vault door, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_dungeon_mine.png`** — Шахта осколков: `mine entrance with blue crystals, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_dungeon_forge.png`** — Рунная кузня: `anvil with rune, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_dungeon_endless.png`** — Бесконечное подземелье: `endless spiral staircase, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_chest_quest.png`** — Сундук заданий: `wooden treasure chest, closed, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`
- **`icon_chest_quest_open.png`** — Сундук заданий открыт: `open empty treasure chest, game icon, single object centered, bold readable silhouette, glowing accents, transparent background, no text, no frame, no watermark`

## 7. Эффекты

Отдельно от персонажей, на прозрачном фоне (GDD §13).

- **`vfx_hit.png`** — Попадание: `white-gold impact spark burst, magic effect only, no character, transparent background, no text`
- **`vfx_crit.png`** — Крит: `big yellow-orange star burst flash, magic effect only, no character, transparent background, no text`
- **`vfx_slash.png`** — Удар героя: `curved sword slash arc, magic effect only, no character, transparent background, no text`
- **`vfx_arrow.png`** — Стрела Ирэн: `cyan shadow arrow, magic effect only, no character, transparent background, no text`
- **`vfx_fireball.png`** — Огонь Лии: `fireball, magic effect only, no character, transparent background, no text`
- **`vfx_lightning.png`** — Молния: `chain lightning bolt, magic effect only, no character, transparent background, no text`
- **`vfx_ult_nuke.png`** — Ульт: удар: `huge explosion burst, magic effect only, no character, transparent background, no text`
- **`vfx_ult_buff.png`** — Ульт: усиление: `red rage aura ring, magic effect only, no character, transparent background, no text`
- **`vfx_ult_mark.png`** — Ульт: метка: `burning target mark on the ground, magic effect only, no character, transparent background, no text`
- **`vfx_evo_glow.png`** — Облик I: `soft golden aura, magic effect only, no character, transparent background, no text`

## 8. Интерфейс (позже, когда будет финальный вид)

- **`ui_frame_button.png`** 256×256 — `square ornate frame for a game button, red and gold, dark fantasy, empty center, transparent background`
- **`ui_card_parchment.png`** 1024×256 — `horizontal parchment card for game UI, worn edges, empty, no text`
- **`ui_logo.png`** 1024×512 — `game logo, Russian title «Призванный: Башня Гачи», dark fantasy tower and summoning circle, gold letters, transparent background` (надписи генераторы часто портят — может понадобиться правка)

## Порядок (что важнее всего)

1. `hero_idle`, `hero_attack` — эталон, проверить в игре.
2. Стартовый отряд: Ирэн, Борг, Лиа, Каэль (`idle`, `attack`, `avatar`).
3. Фон и враги первого биома (`crypt`).
4. Иконки меню и ресурсов.
5. Остальные герои, биомы, иконки, эффекты.
