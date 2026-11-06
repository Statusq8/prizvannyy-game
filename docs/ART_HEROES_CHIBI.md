# Герои — чиби 2.5D (решения 06–07.11)

Новый состав (07.11): только гуманоидные расы, без зверей, пауков и драконов; каждый уникален, без повторов; от E (простые люди) до GOD (боги) — от простого к мифическому. Стиль — чиби как в Idle Heroes, но **2.5D: объёмная полу-3D светотень**.

Нарезка: `python3 tools/chibicut.py <картинка> <id> [cx y0 size]` → assets/game/hero_<id>_side.webp и _avatar.webp (голова — верхние 58%; широким — рамка вручную).
Референсы стиля — docs/reference/chibi/ (скрины Idle Heroes): прикладывай 1–2 к каждому промпту. Присылай с подписью «номер. имя» или архивом hero_NN.png в этом порядке.
Лор (раса, цитата, история) — src/core/01_hero_info.js; имена, роли, ульты — src/core/00e_config_heroes.js. Источник состава — этот файл.

## 1. Тиль · E · Человек (полутень) · `shorokh`

Карманник с живой тенью. «Это не я. Это она.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: simple worn gear, no magic glow, humble look. Character: scrawny street urchin boy about 12, messy black hair, patched hooded cloak, bare feet, holding a stolen brass key, his own living shadow rising behind him with glowing purple eyes and long fingers, mischievous grin, purple and charcoal palette.
```

## 2. Гаррет · E · Нежить (поднятый) · `kostik`

Восставший ополченец. «Строй держать! Хоть кто-нибудь… держите строй…»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: simple worn gear, no magic glow, humble look. Character: risen undead militiaman, skeletal face with a few leftover tufts of hair, rusty dented kettle helmet, cracked leather cuirass over ribs, holding a bent farm pitchfork like a spear, torn red militia sash, faint green soul light in eye sockets, stubborn soldier stance, rust, bone and dull crimson palette.
```

## 3. Пип · E · Гоблин · `shmyg`

Гоблин-подмастерье. «Это не взорвётся! …Наверное.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: simple worn gear, no magic glow, humble look. Character: small cheerful goblin tinkerer, big ears, oversized brass goggles on forehead, leather apron with pockets full of tools, giant homemade slingshot loaded with a smoking round bomb, sack of ticking gadgets on his back, green skin, brass, brown and orange palette.
```

## 4. Лиана · E · Человек · `lumi`

Послушница храма. «Я не боюсь темноты. Я просто иду с фонарём.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: simple worn gear, no magic glow, humble look. Character: young novice priestess girl about 14, short blonde bob, simple white and cream novice robe with a rope belt, holding up a big brass lantern with a warm golden flame, small wooden holy symbol necklace, brave hopeful smile, cream, gold and soft blue palette.
```

## 5. Мира · E · Полуэльфийка · `irene`

Деревенская охотница. «Одна стрела — один ужин. Здесь — один враг.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: simple worn gear, no magic glow, humble look. Character: half-elf village huntress, freckles, auburn braid, pointed ears, green hooded short cloak, leather bracers, simple yew shortbow drawn, wicker quiver, fur-trimmed boots, focused look, forest green, brown and muted violet palette.
```

## 6. Кайл · D · Человек · `zlatokryl`

Оруженосец бури. «Рыцари грома не бегут. Они ждут молнию.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: decent practical gear, small accents. Character: teenage storm squire, spiky light hair crackling with static, light blue and white tabard over chainmail, small winged steel helmet, short warhammer with a copper lightning rod tip sparking, round shield with a lightning sigil, eager grin, white, sky blue and gold palette.
```

## 7. Мэгги · D · Нежить (зомби) · `morgul`

Могильщица-зомби. «Не толкайтесь. Место найдётся всем.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: decent practical gear, small accents. Character: undead zombie gravedigger woman, pale grey-green skin with stitches, messy dark hair in a bandana, patched work dress and long leather apron, big iron shovel over her shoulder, lantern on her belt, deadpan half smile, grave dirt, sickly green and dark red palette.
```

## 8. Дурза · D · Орк · `krag`

Орчиха-новобранец. «Мама говорила: бей первой.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: decent practical gear, small accents. Character: young female orc recruit, green skin, small tusks, black braids with bone beads, simple iron shoulder plate and fur skirt, oversized square wooden tower shield with a red handprint, short iron axe, determined fierce face, green, rust red and iron palette.
```

## 9. Бронн · D · Гном · `borg`

Гном-кузнец. «Сломалось? Дай сюда. Теперь не сломается.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: decent practical gear, small accents. Character: stout dwarf blacksmith, huge braided ginger beard tied with metal rings, soot-covered face, heavy leather apron over bare muscular arms, thick gloves, large glowing hot forge hammer, small anvil charm on his belt, grumpy proud look, ember orange, leather brown and steel palette.
```

## 10. Векс · D · Тёмный эльф · `nokt`

Ученик ассасинов. «Учитель сказал: не попадайся. Я и не попадаюсь.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: decent practical gear, small accents. Character: young dark elf assassin apprentice, grey-lilac skin, white undercut hair, long pointed ears, black and violet light leather armor with many straps, half-face mask pulled down, twin curved daggers in reverse grip, crouching ready pose, violet, black and silver palette.
```

## 11. Рин · D · Человек · `saya`

Бродячая куноити. «Ты видел меня? Значит, я этого хотела.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: decent practical gear, small accents. Character: agile female ninja, black high ponytail with a red ribbon, dark navy kunoichi outfit with crimson scarf trailing, metal forearm guards, fan of shuriken in one hand, kunai in the other, small smoke puff at her feet, confident smirk, navy, crimson and steel palette.
```

## 12. Тобиас · C · Человек · `auron`

Монах-кулачник. «Свет — это не огонь. Свет — это дисциплина.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: quality gear with light magical accents. Character: bald muscular warrior monk with a short beard, glowing golden prayer tattoos, orange and white monk robe tied at the waist, prayer bead necklace, fists wrapped in glowing golden scripture cloth, martial arts stance, calm intense eyes, saffron, white and gold palette.
```

## 13. Мортимер · C · Человек · `grim`

Некромант-недоучка. «Я почти сдал экзамен. Почти.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: quality gear with light magical accents. Character: lanky young necromancer student, pale face, dark circles under eyes, messy black hair, oversized tattered black and purple academy robe with a crooked collar, chained spellbook, staff topped with a small skull, skeletal hands rising from green glowing ground around his feet, nervous crooked smile, black, purple and toxic green palette.
```

## 14. Тала · C · Лесная эльфийка · `gnar`

Лесная друидесса. «Лес помнит всё. И всех.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: quality gear with light magical accents. Character: wood elf druid woman, tan skin with leaf-shaped markings, long green hair woven with flowers and twigs, robe of layered leaves and bark, wooden staff of living twisted roots with a glowing seed, vines curling around her arms, serene strong expression, moss green, bark brown and amber palette.
```

## 15. Хальвар · C · Человек · `drake`

Северный варвар. «Скальды споют о Башне. Если я им расскажу.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: quality gear with light magical accents. Character: huge northern barbarian, long blond braided beard and hair, horned iron helmet, wolf-fur-free thick wool cloak with bronze clasps, bare scarred arms with blue war paint, massive two-handed bearded axe with frost on the blade, roaring battle cry, steel, frost blue and bronze palette.
```

## 16. Сильвер · C · Вампир · `morrak`

Вампир-дуэлянт. «К барьеру. Обещаю, будет почти не больно.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: quality gear with light magical accents. Character: elegant vampire duelist, pale skin, slicked silver hair, red eyes, small fangs in a smirk, black high-collar coat with crimson lining and silver embroidery, lace cravat, thin silver rapier en garde, wine glass in other hand, black, crimson and silver palette.
```

## 17. Ариэль · B · Ангел · `seraphim`

Ангел-страж. «Я стою там, где должен стоять свет.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: elite detailed gear, clear magic effects. Character: young angel guardian woman, short silver hair, small halo, one pair of white feathered wings, polished white and gold plate armor with blue cloth, kite shield with a sun emblem, winged spear, solemn determined face, white, gold and sky blue palette.
```

## 18. Ингрид · B · Человек (валькирия) · `kristalis`

Ледяная валькирия. «Холод — это честность.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: elite detailed gear, clear magic effects. Character: ice valkyrie woman, long white braided hair, winged silver helmet, frost blue scale armor with fur trim, pale blue cape, glowing ice crystal spear, small ice shards orbiting her, cold proud gaze, ice blue, silver and white palette.
```

## 19. Каздар · B · Демон · `vorgat`

Демон-палач. «Приговор вынесен. Я лишь исполняю.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: elite detailed gear, clear magic effects. Character: muscular red-skinned demon executioner, two curved black horns, black leather executioner hood with eye slits, chains across bare chest, heavy spiked bracers, giant glowing molten cleaver axe, embers floating, menacing calm, crimson, black and lava orange palette.
```

## 20. Сельма · B · Призрак (банши) · `nekris`

Банши-плакальщица. «Я плачу заранее. По тебе.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: elite detailed gear, clear magic effects. Character: ghostly banshee woman, translucent pale blue-white body fading into wisps at the legs, long floating white hair, tattered black mourning dress and veil, crying glowing tears, mouth open in a haunting wail with sound ripples, floating pose, pale cyan, black and ghost white palette.
```

## 21. Гхара · B · Тролль · `brum`

Троллиха-шаманка. «Болото всё переварит. И тебя тоже.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: elite detailed gear, clear magic effects. Character: tall hunched swamp troll shaman woman, mossy blue-green skin, long nose, small tusks, wild dreadlocks with feathers and bones, tribal paint, necklace of teeth and charms, staff with a bubbling gourd of green brew, swamp mist around her feet, sly grin, teal, bone and swamp green palette.
```

## 22. Кира · B · Полуорк · `skrit`

Полуорчиха-охотница за головами. «Награда за твою голову скромная. Но я не привередлива.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: elite detailed gear, clear magic effects. Character: half-orc bounty hunter woman, grey-green skin, small tusks, shaved side haircut, scarred face, brown leather duster coat with wanted posters stuck to the belt, harpoon launcher with a long chain, hunting knife, smug confident pose, leather brown, olive and gunmetal palette.
```

## 23. Мираж · B · Двойник (доппельгангер) · `veil`

Безликий мим. «…»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: elite detailed gear, clear magic effects. Character: mysterious faceless doppelganger performer, smooth white porcelain mask with no features, slim body in a black and violet harlequin suit with diamond patterns, long flowing scarf, two shimmering mirror copies of himself fading beside him, thin blade hidden in a cane, theatrical bow pose, black, violet and pearl white palette.
```

## 24. Нерисса · B · Тёмная эльфийка · `zerik`

Жрица Бездны. «Бездна смотрит. Я лишь открываю ей глаза.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: elite detailed gear, clear magic effects. Character: dark elf abyss priestess, deep purple skin, long white hair, glowing violet eyes, black and deep violet ritual robes with gold trim, ornate ceremonial daggers with eye motifs, shadow tendrils rising behind her, floating rune circle, cold ecstatic smile, deep violet, black and gold palette.
```

## 25. Селестина · A · Человек (святая) · `eliria`

Верховная жрица Солнца. «Пока я молюсь, вы не упадёте.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: legendary hero gear, rich ornaments, strong aura. Character: radiant high priestess woman, long golden hair under an ornate sun crown, flowing white and gold layered robes, tall golden staff with a blazing sun disc, floating holy scripture pages, warm divine glow, gentle commanding face, white, gold and warm orange palette.
```

## 26. Леон · A · Человек · `solarion`

Король-паладин. «Корона — это обещание. Я его держу.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: legendary hero gear, rich ornaments, strong aura. Character: noble paladin king, short golden hair and beard, ornate gold and white full plate armor with a lion-shaped pauldron, red royal cape, small crown, greatsword blazing with sunfire, sun halo behind him, majestic heroic pose, gold, white and royal red palette.
```

## 27. Азалия · A · Демон (суккуб) · `malgora`

Огненная демонесса-колдунья. «Сгорают не враги. Сгорают сомнения.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: legendary hero gear, rich ornaments, strong aura. Character: elegant fire demoness sorceress, crimson skin, four curved black horns with gold rings, long flaming red hair, glowing amber eyes, ornate black and gold gown with high slit and armored corset, bat-like small wings, fire orbs swirling in her hands, proud smirk, crimson, black and fire gold palette.
```

## 28. Морвен · A · Нежить (рыцарь смерти) · `rotgar`

Рыцарь смерти. «Я служил трём королям. Теперь служу смерти.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: legendary hero gear, rich ornaments, strong aura. Character: death knight in heavy spiked black plate armor, horned helmet with glowing red eye slits, tattered dark red cape and banner with a skull, massive runic greatsword dripping spectral energy, ghostly soldiers faintly behind him, grim imposing stance, black, blood red and spectral green palette.
```

## 29. Катарина · A · Вампир (графиня) · `velma`

Графиня-некромантка. «Бал начинается, когда гости перестают дышать.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: legendary hero gear, rich ornaments, strong aura. Character: aristocratic vampire countess necromancer, pale skin, long wavy black hair with a silver tiara, blood red eyes, elegant black and crimson ball gown with bone corset details, lace gloves, ornate fan, floating blood droplets and small skeletal dancers, haughty smile, black, crimson and bone ivory palette.
```

## 30. Морра · A · Человек (жрица крови) · `morra`

Хранительница Алтаря. «Всё имеет цену. Я лишь веду учёт.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: legendary hero gear, rich ornaments, strong aura. Character: mysterious blood priestess woman, long dark red hair, pale skin, veiled headdress with gold coins, dark crimson robes with ritual sigils, holding a golden ritual chalice and a curved sacrificial dagger, floating blood runes, calm knowing look, dark crimson, gold and black palette.
```

## 31. Токк · A · Орк · `urgash`

Вождь орков. «Сильный ведёт. Остальные — догоняют.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: legendary hero gear, rich ornaments, strong aura. Character: massive orc warlord, dark green skin, big tusks with gold caps, mohawk and long braided beard, heavy spiked iron and bone armor with clan banners on his back, war paint, giant double-bladed battle axe, roaring commanding pose, dark green, iron and blood red palette.
```

## 32. Бренна · A · Полувеликан · `taurok`

Полувеликанша-гладиатор. «Арена — мой дом. Башня — просто большая арена.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: legendary hero gear, rich ornaments, strong aura. Character: towering half-giant gladiator woman, tan muscular build, short red mohawk, scarred face, bronze gladiator helmet with crest, one huge bronze pauldron, leather and chain gladiator gear, massive round bronze shield and a short gladius, champion belt, fierce grin, bronze, crimson and leather palette.
```

## 33. Дариус · A · Человек (проклятый рыцарь) · `kaeron`

Клинок Бездны. «Я поклялся защищать. Клятва не уточняла кого.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: legendary hero gear, rich ornaments, strong aura. Character: tragic shadow knight, dark armor with violet glowing cracks slowly consuming him, black hair over one eye, torn royal guard cape, longsword made of living shadow, half of his face covered by creeping dark crystal, melancholic resolute pose, black, deep violet and silver palette.
```

## 34. Вэйн · A · Человек · `noktar`

Слепой маг Бездны. «Я не вижу. Мне показывают.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: legendary hero gear, rich ornaments, strong aura. Character: blind abyss mage, long dark hair, eyes covered by a glowing rune blindfold, deep indigo star-patterned robes, several floating open grimoires orbiting him, hands casting a swirling void star sphere, calm unsettling smile, indigo, black and starlight silver palette.
```

## 35. Юкиэ · S · Юки-онна (дух зимы) · `yuki`

Снежная принцесса. «Холод не жесток. Он просто помнит тишину.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: legendary demigod look, ornate gear, particle effects. Character: beautiful snow spirit princess, long flowing white hair with ice crystal ornaments, pale blue skin glow, elegant layered white and ice blue kimono with snowflake patterns, ornate frost fan, snowflakes and ice petals swirling, serene sad smile, ice blue, white and silver palette, legendary aura.
```

## 36. Айрис · S · Полубогиня бури · `seiren`

Громовая лучница. «Гром — это просто моё сердце, которое бьётся громче твоего.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: legendary demigod look, ornate gear, particle effects. Character: demigoddess storm archer, long windswept platinum hair with lightning streaks, glowing electric blue eyes, white and gold armored dress with storm cloud cape, ornate golden bow made of lightning, arrow of pure lightning drawn, storm clouds and sparks around her, epic pose, electric blue, white and gold palette, legendary aura.
```

## 37. Михаэль · S · Архангел · `valtar`

Архангел-каратель. «Милосердие — для тех, кто успел раскаяться.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: legendary demigod look, ornate gear, particle effects. Character: mighty archangel warrior, long golden hair, two pairs of large white and gold wings, radiant golden full armor with blue gems, flaming holy greatsword raised, scales of justice charm on his belt, glowing halo, stern righteous face, gold, white and sapphire palette, legendary holy aura.
```

## 38. Велиар · S · Демон · `beltraks`

Четырёхрукий демон-гладиатор. «Две руки — для слабых.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: legendary demigod look, ornate gear, particle effects. Character: four-armed demon gladiator, dark crimson skin, ram horns, long black hair, muscular body with glowing rune scars, black and gold gladiator armor, each of four hands holding a different curved blade, blood-red aura, savage grin, crimson, black and gold palette, legendary aura.
```

## 39. Титания · S · Фея (королева) · `carna`

Королева фей. «Танцуй со мной — или не танцуй никогда.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: legendary demigod look, ornate gear, particle effects. Character: fairy queen, tall graceful humanoid with long iridescent butterfly-like wings, long flowing pink and gold hair with a crown of flowers and thorns, elegant gown of petals and gossamer, ornate scepter with a glowing gem, swirling glowing pollen and petals, mischievous regal smile, rose pink, emerald and gold palette, legendary aura.
```

## 40. Хельга · S · Дриада · `fenra`

Древняя дриада. «Я старше ваших королевств. Я переживу и вашу Башню.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: legendary demigod look, ornate gear, particle effects. Character: ancient dryad woman, skin like smooth bark with glowing green veins, long hair of hanging vines and leaves, antler-like branch crown with blossoms, robe of moss and roots, staff grown from a living tree branch, small trees sprouting at her feet, wise wrathful gaze, deep green, bark brown and gold palette, legendary aura.
```

## 41. Арес · S · Человек (генерал теней) · `vargos`

Теневой генерал. «Армия не нужна, когда тени подчиняются.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: legendary demigod look, ornate gear, particle effects. Character: shadow general in imposing black and violet plate armor with a commanding cape, crowned helmet with glowing violet eyes, long black war banner, saber of shadow, legion of shadow soldiers silhouettes behind him, authoritative pose, black, violet and silver palette, legendary dark aura.
```

## 42. Рафаэлла · SS · Серафим · `astrael`

Серафима бури. «Небо не смотрит вниз. Я смотрю.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: mythic being, huge aura, dramatic effects. Character: majestic six-winged seraph woman, three pairs of huge white wings crackling with lightning, long silver-blue hair, glowing white eyes, celestial white and gold armor with storm-blue cloth, twin halos, holding a spear of lightning, storm vortex behind her, divine mythic aura, white, gold and storm blue palette.
```

## 43. Люциан · SS · Падший ангел · `kassian`

Падший паладин. «Я пал не потому, что был слаб. А потому, что был прав.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: mythic being, huge aura, dramatic effects. Character: fallen angel paladin, one black feathered wing and one burnt skeletal wing, long dark hair, cracked black and gold holy armor, broken dark halo, greatsword burning with black flame, blood red cape, sorrowful defiant expression, black, gold and blood red palette, mythic dark aura.
```

## 44. Кел-Мор · SS · Нежить (лич) · `azragor`

Король-лич. «Смерть — это не конец. Это повышение.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: mythic being, huge aura, dramatic effects. Character: ancient lich king, skeletal face with glowing blue-green flames in eye sockets, tall jagged ice crown, ornate dark purple and gold royal robes with frost, skeletal hands, tall staff with a floating phylactery gem, swirling souls and frost around him, regal terrifying pose, purple, ice cyan and gold palette, mythic death aura.
```

## 45. Имир · SS · Титан · `gromtar`

Титан гор. «Я — гора. Горы не отступают.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: mythic being, huge aura, dramatic effects. Character: colossal humanoid mountain titan, body of living granite with glowing magma cracks, long beard of moss and stone, crown of rock spires, simple ancient bronze armor pieces, giant stone hammer, small pebbles floating from the ground around him, stoic ancient face, granite grey, magma orange and moss green palette, mythic aura.
```

## 46. Нихиль · SS · Князь Бездны · `umbragor`

Князь Бездны. «Я съел свой мир. Твой будет десертом.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: mythic being, huge aura, dramatic effects. Character: abyss prince in human form, pale youth with long black hair floating like ink, multiple glowing violet eyes subtly on his face and cloak, black cloak containing a starry void galaxy, dark crown of floating shards, hands absorbing a star, cosmic void tendrils, eerie gentle smile, black, cosmic violet and starlight palette, mythic abyss aura.
```

## 47. Селена · SSS · Богиня ночи · `nyx`

Королева Вечной Ночи. «Спи. Ночь позаботится о тебе.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: supreme celestial being, breathtaking effects. Character: night goddess queen, long flowing midnight hair full of stars, glowing silver crescent moon crown, pale luminous skin, elegant dark blue and black gown with constellations, flowing starry cape, crescent moon scythe, floating moon behind her, regal serene expression, midnight blue, silver and violet palette, supreme celestial aura.
```

## 48. Гелиос · GOD · Бог · `eon`

Бог Солнца. «Я горел до того, как появилось слово «свет».»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: true god, overwhelming divine presence, cosmic effects. Character: sun god, tall radiant young god with long fiery golden hair burning like flames, golden skin glow, ornate solar golden armor with phoenix-flame cape made of fire, blazing sun disc halo, spear of sunlight, flame wings of pure fire, overwhelming divine light, gold, white and fire orange palette, godlike aura.
```

## 49. Серафиэль · GOD · Первый ангел · `azrael`

Первый Свет. «До меня была тьма. После меня — выбор.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: true god, overwhelming divine presence, cosmic effects. Character: primordial first angel, androgynous ethereal figure with long white hair, eyes of pure light, eight luminous wings of light and white feathers, flowing white and pearl robes with golden geometric patterns, multiple halos forming a cosmic wheel, holding a sword of pure light, divine light rays, white, pearl and gold palette, godlike aura.
```

## 50. Мефистар · GOD · Бог-демон · `abadron`

Владыка Преисподней. «Каждая сделка честная. Просто ты читал невнимательно.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: true god, overwhelming divine presence, cosmic effects. Character: demon overlord god, towering figure with enormous curved black horns crowned in fire, dark crimson skin with glowing lava veins, burning eyes, ornate black and gold infernal armor with skull motifs, massive cape of flames, giant flaming scepter, contract scroll burning in his hand, hellfire around him, terrifying majestic pose, black, crimson and hellfire gold palette, godlike aura.
```

## 51. Арек · GOD · Бог · `ignisar`

Бог Войны. «Войны кончаются. Я — нет.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: true god, overwhelming divine presence, cosmic effects. Character: god of war, massive armored warrior god, crimson and gold ornate battle armor covered in trophies of a thousand wars, crested war helmet with glowing eyes, long red battle cape, divine spear and huge round shield, weapons of fallen armies floating around him, battle fire, unstoppable pose, crimson, gold and steel palette, godlike aura.
```

## 52. Эреб · GOD · Первородный бог · `erebor`

Первородная Тьма. «Я — то, что было до.»

```
Use the attached Idle Heroes screenshots as the exact style reference. Mobile game hero art, 2.5D chibi style: cute but cool chibi proportions (big head about one third of the height, short sturdy body, oversized weapon), semi-3D volumetric shading with soft ambient occlusion, rim light and glossy highlights (looks like a polished 3D render painted in 2D), thick clean dark outline, high detail, dark fantasy mood. Full body, three-quarter front view facing right, heroic idle pose, standing on an invisible ground line at the bottom, centered, nothing cropped, single humanoid character, flat solid pure green (#00FF00) background, no floor, no shadow, no pedestal, no text, no watermark. Rank look: true god, overwhelming divine presence, cosmic effects. Character: primordial god of darkness, tall humanoid silhouette made of living void with a pale ancient mask-like face, long robes dissolving into infinite darkness, crown of black shards and dim violet light, eyes like dying stars, shadow hands reaching from the void, galaxy-dark aura, overwhelming ancient presence, black, deep violet and faint silver palette, godlike aura.
```

