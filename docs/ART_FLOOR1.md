# Промты: Зал призыва (этажи 1–50) и враги этажей 1–10

## Фон боя — Зал призыва
Vertical 9:16 battle background for a mobile idle game, inside a huge ancient stone hall of a magic tower: worn stone floor with one large glowing violet summoning circle and runes in the lower middle, smaller dim circles around, tall dark pillars and broken arches on the sides, hanging tattered banners, faint violet light rays from above, floating dust, a hooded stone statue far in the background; the center of the image is open and calm (space for one monster in the middle and the hero standing at the bottom), darker edges, low contrast, not distracting; manhwa style, detailed 2D game art, dark purple neon palette, no characters, no text.

## Враги — листы анимации (каждый монстр — один лист)
Лист 4 столбца × 3 ряда = 12 кадров, все ячейки одинаковые, монстр в каждой ячейке одного размера и на одном месте (ноги/низ тела на одной линии), сплошной ярко-зелёный фон #00FF00, без сетки, без текста.
- Ряд 1 — покой (дыхание/покачивание, кадр 4 плавно переходит в кадр 1).
- Ряд 2 — получает удар (вздрагивает, отлетает назад, возвращается).
- Ряд 3 — смерть (падает/лопается/рассыпается в фиолетовые искры, последний кадр почти пустой).

Шаблон (подставить описание монстра в [...]):
```
Sprite sheet for 2D game animation, 4 columns x 3 rows grid of 12 equal frames, the same monster in every frame, same size and same position in each cell, bottom of the body aligned on one line. Row 1: idle loop, gentle breathing and swaying, frame 4 loops back to frame 1. Row 2: hit reaction, flinches and recoils back then returns. Row 3: death, collapses and dissolves into violet sparks, last frame almost empty. Monster: [...]. Facing the viewer, slightly from above. Solid bright green background (#00FF00) in every cell, no grid lines, no ground shadow, no text. Manhwa style, detailed 2D game art, dark purple neon palette, consistent design across all frames.
```

Монстры:
1. **Слайм призыва** — a small violet translucent slime with glowing rune fragments floating inside its jelly body, two glowing eyes, dripping.
2. **Рунная крыса** — a large mangy tower rat the size of a dog, dark fur, glowing violet runes burned into its back, long yellow teeth, red eyes.
3. **Пещерная летучая мышь** — a big bat with torn leathery wings, violet glowing veins on the wings, fangs, hovering (idle = wing flaps).
4. **Каменный жук** — a beetle with a cracked stone shell carved with summoning-circle patterns, glowing violet cracks, strong mandibles.
5. **Страж 10 этажа — Король слаймов** — a huge violet slime king, a broken golden crown sunk into its jelly, half-digested sword and armor of fallen adventurers visible inside, glowing eyes, threatening.

Фон зала — одна картинка: частицы, пыль, мерцание рун и свет делает игра (живой фон), отдельные кадры не нужны.

## Этажи 11–50 (тот же шаблон листа 4×3)
Враги (вместе с первыми четырьмя будут чередоваться):
6. **Павший призванный** — a skeleton of a fallen novice adventurer in torn 1-star leather gear, rusty short sword, violet glow in the eye sockets, broken summoning mark on the chest.
7. **Каменная горгулья** — a small stone gargoyle with cracked wings, violet runes glowing in the cracks, crouching, claws and horns.
8. **Рунный бес** — a small mischievous imp with dark purple skin, glowing rune tattoos, bat ears, a long tail, holding a violet fireball.
9. **Теневой волк** — a lean shadow wolf made of black smoke and fur, violet eyes, wisps of smoke trailing from the body.

Стражи:
10. **Каменный страж** (этажи 20 и 40) — a big stone golem guardian of the summoning hall, carved runes and a glowing violet summoning circle on its chest, heavy fists, moss and cracks.
11. **Хранитель Врат** (мега-босс, этаж 50) — a giant armored knight-warden with a horned helmet and a huge halberd, a glowing violet gate/portal behind his back, chains around his arms, cape, imposing and very large.
