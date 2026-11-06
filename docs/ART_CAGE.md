# Промт: клетка с Шорохом (этаж 3, первый союзник)

По ответам 7, 8, 11, 12 (docs/START.md): на 3 этаже вместо врага — клетка; игрок разбивает цепи тапами; внутри Шорох.
Лист 4 × 3 = 12 кадров, как у врагов (нарезка tools/enemycut.py).
- Ряд 1 — клетка целая, Шорох внутри испуганно шевелится (покой, по кругу).
- Ряд 2 — удар по клетке: искры, цепи звенят, появляются трещины (кадры 5→8 — трещин всё больше).
- Ряд 3 — клетка разлетается, цепи рвутся, Шорох свободен и радостно подпрыгивает (последний кадр — Шорох без клетки).

```
Sprite sheet for 2D game animation, 4 columns x 3 rows grid of 12 equal frames, the same object in every frame, same size and same position in each cell, bottom aligned on one line. Subject: an old iron cage wrapped in heavy chains with glowing violet rune locks, standing on the stone floor; inside the cage sits Shorokh — a tiny shapeless shadow creature with two big glowing violet eyes and smoking little paws, cute, black, deep violet and cold blue palette, smoky shadow aura. Row 1: idle loop, the cage is intact, the creature inside nervously shifts and blinks, frame 4 loops back to frame 1. Row 2: the cage is being hit, sparks fly from the chains, the bars bend and more and more cracks appear frame by frame, the rune locks flicker. Row 3: the cage bursts apart, chains snap and fly away, rune locks shatter into violet sparks, the freed shadow creature jumps up happily, last frame shows only the creature standing free with no cage. Facing the viewer, slightly from above. Solid bright green background (#00FF00) in every cell, no grid lines, no ground shadow, no text. Manhwa style, detailed 2D game art, dark purple neon palette, consistent design across all frames.
```
