# Промпты картинок — 52 героя (первая пачка)

По `docs/HEROES.md`. Стандарт из концепта: у каждого героя **3 картинки** — аватар для коллекции, полный рост **сбоку** для меню героя, полный рост **со спины** для боя. Кадры атаки, ульты и эффекты — следующим этапом, после утверждения обликов.

## Как генерировать

1. Генерируй по паку (H1–H4 — по стороне) и присылай в чат: **«Пак H1»** + картинки по порядку номеров. Не вышел номер — «Пак H1, без №5».
2. **Сначала эталон:** Каэрон (№ H4-22…24) — у него уже есть утверждённый облик (`docs/reference/art/heroes/kaeron/`). Прикладывай его как референс стиля ко всем остальным.
3. В начало каждого промпта вставляй **общий стиль** (одинаковый для всех; конец промпта уже готов):

```
2.5D dark fantasy, Korean manhwa style, clean bold lineart, cel shading with soft gradients, rich saturated colors on dark tones, dramatic rim light, high detail, game asset
```

4. Прозрачный фон: не умеет генератор — проси `on a plain flat green background`, фон уберу сам. У аватара фон тёмный, это нормально.
5. Имена файлов: `hero_<id>_avatar.png`, `hero_<id>_side.png`, `hero_<id>_back.png` (id — латиницей в заголовке героя).

| Пак | Сторона | Героев | Картинок |
|---|---|---|---|
| Пак H1 | ☀ Свет | 13 | 39 |
| Пак H2 | 🜏 Тьма | 13 | 39 |
| Пак H3 | 🐾 Дикие | 13 | 39 |
| Пак H4 | 👁 Тени | 13 | 39 |


## Пак H1 — ☀ Свет

Палитра стороны (уже вставлена в промпты): `gold, white and sky-blue palette, holy radiant light`

### Люми · E · Свет · `lumi`
**H1-1. `hero_lumi_avatar.png`** — аватар коллекции, 512×512
```
tiny flying firefly spirit with a softly glowing round body, big curious eyes, transparent dragonfly wings, golden light trails, gold, white and sky-blue palette, holy radiant light, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H1-2. `hero_lumi_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
tiny flying firefly spirit with a softly glowing round body, big curious eyes, transparent dragonfly wings, golden light trails, gold, white and sky-blue palette, holy radiant light, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H1-3. `hero_lumi_back.png`** — бой, вид со спины, 1024×1024
```
tiny flying firefly spirit with a softly glowing round body, big curious eyes, transparent dragonfly wings, golden light trails, gold, white and sky-blue palette, holy radiant light, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Златокрыл · D · Буря · `zlatokryl`
**H1-4. `hero_zlatokryl_avatar.png`** — аватар коллекции, 512×512
```
young griffin with golden feathers, white fur, massive talons, eager proud stance, small storm sparks in the feathers, gold, white and sky-blue palette, holy radiant light, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H1-5. `hero_zlatokryl_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
young griffin with golden feathers, white fur, massive talons, eager proud stance, small storm sparks in the feathers, gold, white and sky-blue palette, holy radiant light, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H1-6. `hero_zlatokryl_back.png`** — бой, вид со спины, 1024×1024
```
young griffin with golden feathers, white fur, massive talons, eager proud stance, small storm sparks in the feathers, gold, white and sky-blue palette, holy radiant light, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Аурон · C · Свет · `auron`
**H1-7. `hero_auron_avatar.png`** — аватар коллекции, 512×512
```
animated empty knight armor, ornate white-gold plates with glowing light seams, hollow inside, long holy spear, gold, white and sky-blue palette, holy radiant light, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H1-8. `hero_auron_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
animated empty knight armor, ornate white-gold plates with glowing light seams, hollow inside, long holy spear, gold, white and sky-blue palette, holy radiant light, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H1-9. `hero_auron_back.png`** — бой, вид со спины, 1024×1024
```
animated empty knight armor, ornate white-gold plates with glowing light seams, hollow inside, long holy spear, gold, white and sky-blue palette, holy radiant light, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Серафим · B · Свет · `seraphim`
**H1-10. `hero_seraphim_avatar.png`** — аватар коллекции, 512×512
```
four-winged angel warrior in silver-gold plate armor, curved holy sword, calm stern face, halo, gold, white and sky-blue palette, holy radiant light, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H1-11. `hero_seraphim_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
four-winged angel warrior in silver-gold plate armor, curved holy sword, calm stern face, halo, gold, white and sky-blue palette, holy radiant light, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H1-12. `hero_seraphim_back.png`** — бой, вид со спины, 1024×1024
```
four-winged angel warrior in silver-gold plate armor, curved holy sword, calm stern face, halo, gold, white and sky-blue palette, holy radiant light, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Кристалис · B · Лёд · `kristalis`
**H1-13. `hero_kristalis_avatar.png`** — аватар коллекции, 512×512
```
massive golem made of clear ice-blue crystals held by golden fittings, light refracting inside its body, gold, white and sky-blue palette, holy radiant light, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H1-14. `hero_kristalis_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
massive golem made of clear ice-blue crystals held by golden fittings, light refracting inside its body, gold, white and sky-blue palette, holy radiant light, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H1-15. `hero_kristalis_back.png`** — бой, вид со спины, 1024×1024
```
massive golem made of clear ice-blue crystals held by golden fittings, light refracting inside its body, gold, white and sky-blue palette, holy radiant light, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Элирия · A · Свет · `eliria`
**H1-16. `hero_eliria_avatar.png`** — аватар коллекции, 512×512
```
celestial priestess with a radiant halo, long flowing white and gold robes, floating golden magic seals around her hands, gold, white and sky-blue palette, holy radiant light, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H1-17. `hero_eliria_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
celestial priestess with a radiant halo, long flowing white and gold robes, floating golden magic seals around her hands, gold, white and sky-blue palette, holy radiant light, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H1-18. `hero_eliria_back.png`** — бой, вид со спины, 1024×1024
```
celestial priestess with a radiant halo, long flowing white and gold robes, floating golden magic seals around her hands, gold, white and sky-blue palette, holy radiant light, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Соларион · A · Свет · `solarion`
**H1-19. `hero_solarion_avatar.png`** — аватар коллекции, 512×512
```
huge golden lion with a mane of living fire, sun patterns on its fur, ornate golden armor on its paws, gold, white and sky-blue palette, holy radiant light, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H1-20. `hero_solarion_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
huge golden lion with a mane of living fire, sun patterns on its fur, ornate golden armor on its paws, gold, white and sky-blue palette, holy radiant light, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H1-21. `hero_solarion_back.png`** — бой, вид со спины, 1024×1024
```
huge golden lion with a mane of living fire, sun patterns on its fur, ornate golden armor on its paws, gold, white and sky-blue palette, holy radiant light, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Юки · S · Лёд · `yuki`
**H1-22. `hero_yuki_avatar.png`** — аватар коллекции, 512×512
```
spirit of the first snow, pale maiden in layered white and ice-blue kimono-like robes, snowflakes orbiting her, frost crown, gold, white and sky-blue palette, holy radiant light, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H1-23. `hero_yuki_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
spirit of the first snow, pale maiden in layered white and ice-blue kimono-like robes, snowflakes orbiting her, frost crown, gold, white and sky-blue palette, holy radiant light, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H1-24. `hero_yuki_back.png`** — бой, вид со спины, 1024×1024
```
spirit of the first snow, pale maiden in layered white and ice-blue kimono-like robes, snowflakes orbiting her, frost crown, gold, white and sky-blue palette, holy radiant light, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Сэйрен · S · Буря · `seiren`
**H1-25. `hero_seiren_avatar.png`** — аватар коллекции, 512×512
```
storm siren, sea-blue hair whipping like waves, scaled ocean armor, staff crowned with a lightning pearl, sky storm around her, gold, white and sky-blue palette, holy radiant light, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H1-26. `hero_seiren_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
storm siren, sea-blue hair whipping like waves, scaled ocean armor, staff crowned with a lightning pearl, sky storm around her, gold, white and sky-blue palette, holy radiant light, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H1-27. `hero_seiren_back.png`** — бой, вид со спины, 1024×1024
```
storm siren, sea-blue hair whipping like waves, scaled ocean armor, staff crowned with a lightning pearl, sky storm around her, gold, white and sky-blue palette, holy radiant light, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Вальтар · S · Свет · `valtar`
**H1-28. `hero_valtar_avatar.png`** — аватар коллекции, 512×512
```
punisher angel in heavy white-gold armor, wings of sharp metal feathers, huge halberd, helmet with a narrow visor, gold, white and sky-blue palette, holy radiant light, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H1-29. `hero_valtar_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
punisher angel in heavy white-gold armor, wings of sharp metal feathers, huge halberd, helmet with a narrow visor, gold, white and sky-blue palette, holy radiant light, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H1-30. `hero_valtar_back.png`** — бой, вид со спины, 1024×1024
```
punisher angel in heavy white-gold armor, wings of sharp metal feathers, huge halberd, helmet with a narrow visor, gold, white and sky-blue palette, holy radiant light, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Астраэль · SS · Буря · `astrael`
**H1-31. `hero_astrael_avatar.png`** — аватар коллекции, 512×512
```
six-winged celestial guardian, crown of stars, shining greatsword, floating armor plates around a body of starlight, gold, white and sky-blue palette, holy radiant light, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H1-32. `hero_astrael_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
six-winged celestial guardian, crown of stars, shining greatsword, floating armor plates around a body of starlight, gold, white and sky-blue palette, holy radiant light, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H1-33. `hero_astrael_back.png`** — бой, вид со спины, 1024×1024
```
six-winged celestial guardian, crown of stars, shining greatsword, floating armor plates around a body of starlight, gold, white and sky-blue palette, holy radiant light, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Эон · GOD · Свет · `eon`
**H1-34. `hero_eon_avatar.png`** — аватар коллекции, 512×512
```
primordial phoenix of white-gold flame, enormous wings, long tail of solar energy, eyes like twin suns, gold, white and sky-blue palette, holy radiant light, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H1-35. `hero_eon_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
primordial phoenix of white-gold flame, enormous wings, long tail of solar energy, eyes like twin suns, gold, white and sky-blue palette, holy radiant light, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H1-36. `hero_eon_back.png`** — бой, вид со спины, 1024×1024
```
primordial phoenix of white-gold flame, enormous wings, long tail of solar energy, eyes like twin suns, gold, white and sky-blue palette, holy radiant light, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Азраэль · GOD · Свет · `azrael`
**H1-37. `hero_azrael_avatar.png`** — аватар коллекции, 512×512
```
fallen angel of ash, burnt grey-gold wings shedding embers, cracked white armor, flaming judgment sword, gold, white and sky-blue palette, holy radiant light, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H1-38. `hero_azrael_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
fallen angel of ash, burnt grey-gold wings shedding embers, cracked white armor, flaming judgment sword, gold, white and sky-blue palette, holy radiant light, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H1-39. `hero_azrael_back.png`** — бой, вид со спины, 1024×1024
```
fallen angel of ash, burnt grey-gold wings shedding embers, cracked white armor, flaming judgment sword, gold, white and sky-blue palette, holy radiant light, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```


## Пак H2 — 🜏 Тьма

Палитра стороны (уже вставлена в промпты): `black, crimson and toxic green palette, ominous glow`

### Костик · E · Нежить · `kostik`
**H2-1. `hero_kostik_avatar.png`** — аватар коллекции, 512×512
```
short skeleton with an oversized skull, rusty dented helmet, bone club, goofy determined grin, black, crimson and toxic green palette, ominous glow, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H2-2. `hero_kostik_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
short skeleton with an oversized skull, rusty dented helmet, bone club, goofy determined grin, black, crimson and toxic green palette, ominous glow, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H2-3. `hero_kostik_back.png`** — бой, вид со спины, 1024×1024
```
short skeleton with an oversized skull, rusty dented helmet, bone club, goofy determined grin, black, crimson and toxic green palette, ominous glow, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Моргул · D · Нежить · `morgul`
**H2-4. `hero_morgul_avatar.png`** — аватар коллекции, 512×512
```
hunched ghoul with long claws, torn ears, rotting grey-green skin, hungry glowing eyes, black, crimson and toxic green palette, ominous glow, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H2-5. `hero_morgul_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
hunched ghoul with long claws, torn ears, rotting grey-green skin, hungry glowing eyes, black, crimson and toxic green palette, ominous glow, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H2-6. `hero_morgul_back.png`** — бой, вид со спины, 1024×1024
```
hunched ghoul with long claws, torn ears, rotting grey-green skin, hungry glowing eyes, black, crimson and toxic green palette, ominous glow, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Грим · C · Нежить · `grim`
**H2-7. `hero_grim_avatar.png`** — аватар коллекции, 512×512
```
floating skull sorcerer with burning green eyes, small bone crown, wisps of black smoke instead of a body, black, crimson and toxic green palette, ominous glow, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H2-8. `hero_grim_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
floating skull sorcerer with burning green eyes, small bone crown, wisps of black smoke instead of a body, black, crimson and toxic green palette, ominous glow, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H2-9. `hero_grim_back.png`** — бой, вид со спины, 1024×1024
```
floating skull sorcerer with burning green eyes, small bone crown, wisps of black smoke instead of a body, black, crimson and toxic green palette, ominous glow, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Воргат · B · Пламя · `vorgat`
**H2-10. `hero_vorgat_avatar.png`** — аватар коллекции, 512×512
```
horned demon executioner, huge axe, molten glowing cracks across dark red skin, blood contract scroll on his belt, black, crimson and toxic green palette, ominous glow, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H2-11. `hero_vorgat_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
horned demon executioner, huge axe, molten glowing cracks across dark red skin, blood contract scroll on his belt, black, crimson and toxic green palette, ominous glow, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H2-12. `hero_vorgat_back.png`** — бой, вид со спины, 1024×1024
```
horned demon executioner, huge axe, molten glowing cracks across dark red skin, blood contract scroll on his belt, black, crimson and toxic green palette, ominous glow, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Некрис · B · Нежить · `nekris`
**H2-13. `hero_nekris_avatar.png`** — аватар коллекции, 512×512
```
bone spider with eight long jointed bone legs, spikes along the back, green soul fire in the ribcage, black, crimson and toxic green palette, ominous glow, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H2-14. `hero_nekris_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
bone spider with eight long jointed bone legs, spikes along the back, green soul fire in the ribcage, black, crimson and toxic green palette, ominous glow, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H2-15. `hero_nekris_back.png`** — бой, вид со спины, 1024×1024
```
bone spider with eight long jointed bone legs, spikes along the back, green soul fire in the ribcage, black, crimson and toxic green palette, ominous glow, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Малгора · A · Пламя · `malgora`
**H2-16. `hero_malgora_avatar.png`** — аватар коллекции, 512×512
```
demoness general with four horns, armored blade-tipped tail, long claws, black and crimson armor, smug smile, black, crimson and toxic green palette, ominous glow, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H2-17. `hero_malgora_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
demoness general with four horns, armored blade-tipped tail, long claws, black and crimson armor, smug smile, black, crimson and toxic green palette, ominous glow, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H2-18. `hero_malgora_back.png`** — бой, вид со спины, 1024×1024
```
demoness general with four horns, armored blade-tipped tail, long claws, black and crimson armor, smug smile, black, crimson and toxic green palette, ominous glow, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Ротгар · A · Нежить · `rotgar`
**H2-19. `hero_rotgar_avatar.png`** — аватар коллекции, 512×512
```
death knight in broken black plate armor, black greatsword, glowing red eyes inside the helmet, tattered banner, black, crimson and toxic green palette, ominous glow, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H2-20. `hero_rotgar_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
death knight in broken black plate armor, black greatsword, glowing red eyes inside the helmet, tattered banner, black, crimson and toxic green palette, ominous glow, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H2-21. `hero_rotgar_back.png`** — бой, вид со спины, 1024×1024
```
death knight in broken black plate armor, black greatsword, glowing red eyes inside the helmet, tattered banner, black, crimson and toxic green palette, ominous glow, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Вельма · A · Нежить · `velma`
**H2-22. `hero_velma_avatar.png`** — аватар коллекции, 512×512
```
undead necromancer woman, pale skin, black and toxic-green robes, staff with a skull lantern, ghostly hands around her, black, crimson and toxic green palette, ominous glow, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H2-23. `hero_velma_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
undead necromancer woman, pale skin, black and toxic-green robes, staff with a skull lantern, ghostly hands around her, black, crimson and toxic green palette, ominous glow, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H2-24. `hero_velma_back.png`** — бой, вид со спины, 1024×1024
```
undead necromancer woman, pale skin, black and toxic-green robes, staff with a skull lantern, ghostly hands around her, black, crimson and toxic green palette, ominous glow, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Морра · A · Кровь · `morra`
**H2-25. `hero_morra_avatar.png`** — аватар коллекции, 512×512
```
ancient altar keeper priestess, crimson veil, ritual daggers on chains, blood runes glowing on her arms, black, crimson and toxic green palette, ominous glow, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H2-26. `hero_morra_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
ancient altar keeper priestess, crimson veil, ritual daggers on chains, blood runes glowing on her arms, black, crimson and toxic green palette, ominous glow, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H2-27. `hero_morra_back.png`** — бой, вид со спины, 1024×1024
```
ancient altar keeper priestess, crimson veil, ritual daggers on chains, blood runes glowing on her arms, black, crimson and toxic green palette, ominous glow, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Белтракс · S · Кровь · `beltraks`
**H2-28. `hero_beltraks_avatar.png`** — аватар коллекции, 512×512
```
four-armed arena demon champion with paired curved blades in each pair of hands, curved horns, crimson veins, black, crimson and toxic green palette, ominous glow, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H2-29. `hero_beltraks_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
four-armed arena demon champion with paired curved blades in each pair of hands, curved horns, crimson veins, black, crimson and toxic green palette, ominous glow, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H2-30. `hero_beltraks_back.png`** — бой, вид со спины, 1024×1024
```
four-armed arena demon champion with paired curved blades in each pair of hands, curved horns, crimson veins, black, crimson and toxic green palette, ominous glow, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Кассиан · SS · Кровь · `kassian`
**H2-31. `hero_kassian_avatar.png`** — аватар коллекции, 512×512
```
fallen paladin in blackened holy armor, extinguished halo, blood contract runes across the armor, greatsword and shield, black, crimson and toxic green palette, ominous glow, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H2-32. `hero_kassian_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
fallen paladin in blackened holy armor, extinguished halo, blood contract runes across the armor, greatsword and shield, black, crimson and toxic green palette, ominous glow, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H2-33. `hero_kassian_back.png`** — бой, вид со спины, 1024×1024
```
fallen paladin in blackened holy armor, extinguished halo, blood contract runes across the armor, greatsword and shield, black, crimson and toxic green palette, ominous glow, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Азрагор · SS · Нежить · `azragor`
**H2-34. `hero_azragor_avatar.png`** — аватар коллекции, 512×512
```
ancient lich king wearing a crown of skulls, floating bone hands around him, royal tattered robes, green soul flames, black, crimson and toxic green palette, ominous glow, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H2-35. `hero_azragor_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
ancient lich king wearing a crown of skulls, floating bone hands around him, royal tattered robes, green soul flames, black, crimson and toxic green palette, ominous glow, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H2-36. `hero_azragor_back.png`** — бой, вид со спины, 1024×1024
```
ancient lich king wearing a crown of skulls, floating bone hands around him, royal tattered robes, green soul flames, black, crimson and toxic green palette, ominous glow, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Абадрон · GOD · Пламя · `abadron`
**H2-37. `hero_abadron_avatar.png`** — аватар коллекции, 512×512
```
colossal lord of hell with six horns, a burning infernal heart visible in his chest, obsidian armor, molten cracks, black, crimson and toxic green palette, ominous glow, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H2-38. `hero_abadron_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
colossal lord of hell with six horns, a burning infernal heart visible in his chest, obsidian armor, molten cracks, black, crimson and toxic green palette, ominous glow, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H2-39. `hero_abadron_back.png`** — бой, вид со спины, 1024×1024
```
colossal lord of hell with six horns, a burning infernal heart visible in his chest, obsidian armor, molten cracks, black, crimson and toxic green palette, ominous glow, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```


## Пак H3 — 🐾 Дикие

Палитра стороны (уже вставлена в промпты): `green, earthy brown and orange palette, primal energy`

### Шмыг · E · Дикий лес · `shmyg`
**H3-1. `hero_shmyg_avatar.png`** — аватар коллекции, 512×512
```
small big-eared goblin thief with an oversized dagger, cunning grin, patched leather hood, pouches of stolen trinkets, green, earthy brown and orange palette, primal energy, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H3-2. `hero_shmyg_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
small big-eared goblin thief with an oversized dagger, cunning grin, patched leather hood, pouches of stolen trinkets, green, earthy brown and orange palette, primal energy, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H3-3. `hero_shmyg_back.png`** — бой, вид со спины, 1024×1024
```
small big-eared goblin thief with an oversized dagger, cunning grin, patched leather hood, pouches of stolen trinkets, green, earthy brown and orange palette, primal energy, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Краг · D · Война · `krag`
**H3-4. `hero_krag_avatar.png`** — аватар коллекции, 512×512
```
stocky orc warrior with lower tusks, big wooden club, armor of furs and hides, war paint, green, earthy brown and orange palette, primal energy, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H3-5. `hero_krag_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
stocky orc warrior with lower tusks, big wooden club, armor of furs and hides, war paint, green, earthy brown and orange palette, primal energy, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H3-6. `hero_krag_back.png`** — бой, вид со спины, 1024×1024
```
stocky orc warrior with lower tusks, big wooden club, armor of furs and hides, war paint, green, earthy brown and orange palette, primal energy, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Борг · D · Война · `borg`
**H3-7. `hero_borg_avatar.png`** — аватар коллекции, 512×512
```
orc berserker chieftain without a tribe, massive two-handed axe, scarred green skin, broken tribal necklace, green, earthy brown and orange palette, primal energy, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H3-8. `hero_borg_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
orc berserker chieftain without a tribe, massive two-handed axe, scarred green skin, broken tribal necklace, green, earthy brown and orange palette, primal energy, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H3-9. `hero_borg_back.png`** — бой, вид со спины, 1024×1024
```
orc berserker chieftain without a tribe, massive two-handed axe, scarred green skin, broken tribal necklace, green, earthy brown and orange palette, primal energy, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Гнар · C · Дикий лес · `gnar`
**H3-10. `hero_gnar_avatar.png`** — аватар коллекции, 512×512
```
cave wolf with powerful paws and bone growths along the spine, amber eyes, feral snarl, green, earthy brown and orange palette, primal energy, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H3-11. `hero_gnar_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
cave wolf with powerful paws and bone growths along the spine, amber eyes, feral snarl, green, earthy brown and orange palette, primal energy, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H3-12. `hero_gnar_back.png`** — бой, вид со спины, 1024×1024
```
cave wolf with powerful paws and bone growths along the spine, amber eyes, feral snarl, green, earthy brown and orange palette, primal energy, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Дрейк · C · Война · `drake`
**H3-13. `hero_drake_avatar.png`** — аватар коллекции, 512×512
```
dragonborn spearman with orange-red scales, long spear made from a dragon scale, tribal armor, green, earthy brown and orange palette, primal energy, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H3-14. `hero_drake_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
dragonborn spearman with orange-red scales, long spear made from a dragon scale, tribal armor, green, earthy brown and orange palette, primal energy, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H3-15. `hero_drake_back.png`** — бой, вид со спины, 1024×1024
```
dragonborn spearman with orange-red scales, long spear made from a dragon scale, tribal armor, green, earthy brown and orange palette, primal energy, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Брум · B · Дикий лес · `brum`
**H3-16. `hero_brum_avatar.png`** — аватар коллекции, 512×512
```
swamp troll with a mossy back, massive fists, mushrooms growing on his shoulders, sleepy kind face, green, earthy brown and orange palette, primal energy, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H3-17. `hero_brum_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
swamp troll with a mossy back, massive fists, mushrooms growing on his shoulders, sleepy kind face, green, earthy brown and orange palette, primal energy, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H3-18. `hero_brum_back.png`** — бой, вид со спины, 1024×1024
```
swamp troll with a mossy back, massive fists, mushrooms growing on his shoulders, sleepy kind face, green, earthy brown and orange palette, primal energy, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Скрит · B · Дикий лес · `skrit`
**H3-19. `hero_skrit_avatar.png`** — аватар коллекции, 512×512
```
old goblin shaman with a carved wooden mask, bone staff, small totems hanging from his belt, spirit smoke, green, earthy brown and orange palette, primal energy, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H3-20. `hero_skrit_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
old goblin shaman with a carved wooden mask, bone staff, small totems hanging from his belt, spirit smoke, green, earthy brown and orange palette, primal energy, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H3-21. `hero_skrit_back.png`** — бой, вид со спины, 1024×1024
```
old goblin shaman with a carved wooden mask, bone staff, small totems hanging from his belt, spirit smoke, green, earthy brown and orange palette, primal energy, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Ургаш · A · Война · `urgash`
**H3-22. `hero_urgash_avatar.png`** — аватар коллекции, 512×512
```
orc berserker with red battle paint, serrated greataxe, wild hair, muscular scarred body, green, earthy brown and orange palette, primal energy, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H3-23. `hero_urgash_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
orc berserker with red battle paint, serrated greataxe, wild hair, muscular scarred body, green, earthy brown and orange palette, primal energy, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H3-24. `hero_urgash_back.png`** — бой, вид со спины, 1024×1024
```
orc berserker with red battle paint, serrated greataxe, wild hair, muscular scarred body, green, earthy brown and orange palette, primal energy, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Таурок · A · Война · `taurok`
**H3-25. `hero_taurok_avatar.png`** — аватар коллекции, 512×512
```
minotaur warrior with rings on his horns, massive hooves, heavy bronze armor, huge two-handed hammer, green, earthy brown and orange palette, primal energy, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H3-26. `hero_taurok_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
minotaur warrior with rings on his horns, massive hooves, heavy bronze armor, huge two-handed hammer, green, earthy brown and orange palette, primal energy, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H3-27. `hero_taurok_back.png`** — бой, вид со спины, 1024×1024
```
minotaur warrior with rings on his horns, massive hooves, heavy bronze armor, huge two-handed hammer, green, earthy brown and orange palette, primal energy, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Карна · S · Дикий лес · `karna`
**H3-28. `hero_karna_avatar.png`** — аватар коллекции, 512×512
```
carnival fairy illusionist, colorful harlequin dress, butterfly wings, mask on a stick, playing cards floating around, green, earthy brown and orange palette, primal energy, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H3-29. `hero_karna_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
carnival fairy illusionist, colorful harlequin dress, butterfly wings, mask on a stick, playing cards floating around, green, earthy brown and orange palette, primal energy, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H3-30. `hero_karna_back.png`** — бой, вид со спины, 1024×1024
```
carnival fairy illusionist, colorful harlequin dress, butterfly wings, mask on a stick, playing cards floating around, green, earthy brown and orange palette, primal energy, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Фенра · S · Дикий лес · `fenra`
**H3-31. `hero_fenra_avatar.png`** — аватар коллекции, 512×512
```
ancient giant she-wolf with silver fur and glowing moon patterns, crescent moon mark on her forehead, green, earthy brown and orange palette, primal energy, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H3-32. `hero_fenra_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
ancient giant she-wolf with silver fur and glowing moon patterns, crescent moon mark on her forehead, green, earthy brown and orange palette, primal energy, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H3-33. `hero_fenra_back.png`** — бой, вид со спины, 1024×1024
```
ancient giant she-wolf with silver fur and glowing moon patterns, crescent moon mark on her forehead, green, earthy brown and orange palette, primal energy, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Громтар · SS · Дикий лес · `gromtar`
**H3-34. `hero_gromtar_avatar.png`** — аватар коллекции, 512×512
```
stone giant with tree roots instead of tendons, glowing green runes carved in the rock, moss and small trees on his shoulders, green, earthy brown and orange palette, primal energy, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H3-35. `hero_gromtar_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
stone giant with tree roots instead of tendons, glowing green runes carved in the rock, moss and small trees on his shoulders, green, earthy brown and orange palette, primal energy, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H3-36. `hero_gromtar_back.png`** — бой, вид со спины, 1024×1024
```
stone giant with tree roots instead of tendons, glowing green runes carved in the rock, moss and small trees on his shoulders, green, earthy brown and orange palette, primal energy, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Игнисар · GOD · Война · `ignisar`
**H3-37. `hero_ignisar_avatar.png`** — аватар коллекции, 512×512
```
primordial dragon with volcanic black scales, glowing magma between the scales, red-hot horns, smoke from the nostrils, green, earthy brown and orange palette, primal energy, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H3-38. `hero_ignisar_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
primordial dragon with volcanic black scales, glowing magma between the scales, red-hot horns, smoke from the nostrils, green, earthy brown and orange palette, primal energy, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H3-39. `hero_ignisar_back.png`** — бой, вид со спины, 1024×1024
```
primordial dragon with volcanic black scales, glowing magma between the scales, red-hot horns, smoke from the nostrils, green, earthy brown and orange palette, primal energy, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```


## Пак H4 — 👁 Тени

Палитра стороны (уже вставлена в промпты): `black, deep violet and cold blue palette, smoky shadow aura`

### Шорох · E · Тени · `shorokh`
**H4-1. `hero_shorokh_avatar.png`** — аватар коллекции, 512×512
```
tiny shapeless shadow creature with two big glowing violet eyes and smoking little paws, cute, black, deep violet and cold blue palette, smoky shadow aura, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H4-2. `hero_shorokh_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
tiny shapeless shadow creature with two big glowing violet eyes and smoking little paws, cute, black, deep violet and cold blue palette, smoky shadow aura, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H4-3. `hero_shorokh_back.png`** — бой, вид со спины, 1024×1024
```
tiny shapeless shadow creature with two big glowing violet eyes and smoking little paws, cute, black, deep violet and cold blue palette, smoky shadow aura, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Ирэн · E · Тени · `irene`
**H4-4. `hero_irene_avatar.png`** — аватар коллекции, 512×512
```
shadow elf archer, dark hooded cloak, black longbow with violet string, pale skin, determined eyes, black, deep violet and cold blue palette, smoky shadow aura, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H4-5. `hero_irene_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
shadow elf archer, dark hooded cloak, black longbow with violet string, pale skin, determined eyes, black, deep violet and cold blue palette, smoky shadow aura, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H4-6. `hero_irene_back.png`** — бой, вид со спины, 1024×1024
```
shadow elf archer, dark hooded cloak, black longbow with violet string, pale skin, determined eyes, black, deep violet and cold blue palette, smoky shadow aura, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Нокт · D · Тени · `nokt`
**H4-7. `hero_nokt_avatar.png`** — аватар коллекции, 512×512
```
shadow goblin with long ears, twin daggers, semi-transparent smoky limbs, mischievous grin, black, deep violet and cold blue palette, smoky shadow aura, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H4-8. `hero_nokt_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
shadow goblin with long ears, twin daggers, semi-transparent smoky limbs, mischievous grin, black, deep violet and cold blue palette, smoky shadow aura, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H4-9. `hero_nokt_back.png`** — бой, вид со спины, 1024×1024
```
shadow goblin with long ears, twin daggers, semi-transparent smoky limbs, mischievous grin, black, deep violet and cold blue palette, smoky shadow aura, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Сая · D · Тени · `saya`
**H4-10. `hero_saya_avatar.png`** — аватар коллекции, 512×512
```
half-elf knife thrower, dark leather outfit, bandolier of throwing knives, short silver hair, calm face, black, deep violet and cold blue palette, smoky shadow aura, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H4-11. `hero_saya_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
half-elf knife thrower, dark leather outfit, bandolier of throwing knives, short silver hair, calm face, black, deep violet and cold blue palette, smoky shadow aura, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H4-12. `hero_saya_back.png`** — бой, вид со спины, 1024×1024
```
half-elf knife thrower, dark leather outfit, bandolier of throwing knives, short silver hair, calm face, black, deep violet and cold blue palette, smoky shadow aura, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Моррак · C · Тени · `morrak`
**H4-13. `hero_morrak_avatar.png`** — аватар коллекции, 512×512
```
ghost wolf with smoky dark fur and a glowing violet maw, semi-transparent body, black, deep violet and cold blue palette, smoky shadow aura, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H4-14. `hero_morrak_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
ghost wolf with smoky dark fur and a glowing violet maw, semi-transparent body, black, deep violet and cold blue palette, smoky shadow aura, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H4-15. `hero_morrak_back.png`** — бой, вид со спины, 1024×1024
```
ghost wolf with smoky dark fur and a glowing violet maw, semi-transparent body, black, deep violet and cold blue palette, smoky shadow aura, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Вейл · B · Тени · `veil`
**H4-16. `hero_veil_avatar.png`** — аватар коллекции, 512×512
```
faceless archer in a torn black cloak, shadow bow made of darkness, empty hood with no face, black, deep violet and cold blue palette, smoky shadow aura, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H4-17. `hero_veil_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
faceless archer in a torn black cloak, shadow bow made of darkness, empty hood with no face, black, deep violet and cold blue palette, smoky shadow aura, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H4-18. `hero_veil_back.png`** — бой, вид со спины, 1024×1024
```
faceless archer in a torn black cloak, shadow bow made of darkness, empty hood with no face, black, deep violet and cold blue palette, smoky shadow aura, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Зерик · B · Бездна · `zerik`
**H4-19. `hero_zerik_avatar.png`** — аватар коллекции, 512×512
```
shadow spider with a translucent dark body and a glowing violet core in its abdomen, black, deep violet and cold blue palette, smoky shadow aura, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H4-20. `hero_zerik_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
shadow spider with a translucent dark body and a glowing violet core in its abdomen, black, deep violet and cold blue palette, smoky shadow aura, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H4-21. `hero_zerik_back.png`** — бой, вид со спины, 1024×1024
```
shadow spider with a translucent dark body and a glowing violet core in its abdomen, black, deep violet and cold blue palette, smoky shadow aura, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Каэрон · A · Тени · `kaeron`
**H4-22. `hero_kaeron_avatar.png`** — аватар коллекции, 512×512
```
shadow knight in black armor with glowing violet eyes, long dark cloak, two-handed greatsword with violet glow, black, deep violet and cold blue palette, smoky shadow aura, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H4-23. `hero_kaeron_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
shadow knight in black armor with glowing violet eyes, long dark cloak, two-handed greatsword with violet glow, black, deep violet and cold blue palette, smoky shadow aura, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H4-24. `hero_kaeron_back.png`** — бой, вид со спины, 1024×1024
```
shadow knight in black armor with glowing violet eyes, long dark cloak, two-handed greatsword with violet glow, black, deep violet and cold blue palette, smoky shadow aura, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Ноктар · A · Бездна · `noktar`
**H4-25. `hero_noktar_avatar.png`** — аватар коллекции, 512×512
```
shadow mage with six glowing energy eyes, floating magic rings around him, dark violet robes, black, deep violet and cold blue palette, smoky shadow aura, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H4-26. `hero_noktar_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
shadow mage with six glowing energy eyes, floating magic rings around him, dark violet robes, black, deep violet and cold blue palette, smoky shadow aura, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H4-27. `hero_noktar_back.png`** — бой, вид со спины, 1024×1024
```
shadow mage with six glowing energy eyes, floating magic rings around him, dark violet robes, black, deep violet and cold blue palette, smoky shadow aura, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Варгос · S · Тени · `vargos`
**H4-28. `hero_vargos_avatar.png`** — аватар коллекции, 512×512
```
shadow general in horned black armor, halberd, smoky cloak trailing into ghostly soldiers, black, deep violet and cold blue palette, smoky shadow aura, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H4-29. `hero_vargos_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
shadow general in horned black armor, halberd, smoky cloak trailing into ghostly soldiers, black, deep violet and cold blue palette, smoky shadow aura, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H4-30. `hero_vargos_back.png`** — бой, вид со спины, 1024×1024
```
shadow general in horned black armor, halberd, smoky cloak trailing into ghostly soldiers, black, deep violet and cold blue palette, smoky shadow aura, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Умбрагор · SS · Бездна · `umbragor`
**H4-31. `hero_umbragor_avatar.png`** — аватар коллекции, 512×512
```
shadow dragon with translucent dark wings and violet fire, smoky body, glowing eyes, black, deep violet and cold blue palette, smoky shadow aura, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H4-32. `hero_umbragor_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
shadow dragon with translucent dark wings and violet fire, smoky body, glowing eyes, black, deep violet and cold blue palette, smoky shadow aura, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H4-33. `hero_umbragor_back.png`** — бой, вид со спины, 1024×1024
```
shadow dragon with translucent dark wings and violet fire, smoky body, glowing eyes, black, deep violet and cold blue palette, smoky shadow aura, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Никс · SSS · Тени · `nyx`
**H4-34. `hero_nyx_avatar.png`** — аватар коллекции, 512×512
```
queen of night, long black hair full of fading stars, dark crown, flowing night-sky gown, cold blue eyes, black, deep violet and cold blue palette, smoky shadow aura, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H4-35. `hero_nyx_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
queen of night, long black hair full of fading stars, dark crown, flowing night-sky gown, cold blue eyes, black, deep violet and cold blue palette, smoky shadow aura, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H4-36. `hero_nyx_back.png`** — бой, вид со спины, 1024×1024
```
queen of night, long black hair full of fading stars, dark crown, flowing night-sky gown, cold blue eyes, black, deep violet and cold blue palette, smoky shadow aura, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```

### Эребор · GOD · Бездна · `erebor`
**H4-37. `hero_erebor_avatar.png`** — аватар коллекции, 512×512
```
primordial shadow, towering silhouette with a glowing core in its chest, shadow crown, many ghostly hands, black, deep violet and cold blue palette, smoky shadow aura, bust portrait, head and shoulders, three-quarter front view, expressive face, plain dark background, single character, no text, no watermark
```
**H4-38. `hero_erebor_side.png`** — меню героя, полный рост сбоку, 1024×1024
```
primordial shadow, towering silhouette with a glowing core in its chest, shadow crown, many ghostly hands, black, deep violet and cold blue palette, smoky shadow aura, full body from head to feet, side view facing right, idle stance with weapon ready, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
**H4-39. `hero_erebor_back.png`** — бой, вид со спины, 1024×1024
```
primordial shadow, towering silhouette with a glowing core in its chest, shadow crown, many ghostly hands, black, deep violet and cold blue palette, smoky shadow aura, full body from head to feet, seen from behind three-quarter view, facing away from the viewer toward an enemy, idle combat stance, standing on an invisible ground line at the bottom of the canvas, single character, nothing cropped, centered, transparent background, no floor, no shadow, no frame, no text, no watermark
```
