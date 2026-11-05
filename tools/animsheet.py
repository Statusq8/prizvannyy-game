#!/usr/bin/env python3
"""Листы анимации (сетка кадров на зелёном фоне) → атлас кадров для игры.

Запуск:  python3 tools/animsheet.py <имя> <лист1.png> [<лист2.png> ...] [--grid 4x4] [--h 300] [--no-key]
Пример:  python3 tools/animsheet.py hero_idle docs/reference/art/hero_anim/idle_1.png docs/reference/art/hero_anim/idle_2.png
Что делает: режет сетку, убирает зелёный фон (--no-key — для полноэкранных кадров ульты), выравнивает героя
по ногам и центру корпуса, приводит к одной высоте, кладёт кадры в полосу assets/game/anim_<имя>.webp
и пишет assets/anim/<имя>.json (размер кадра, число кадров, опорная точка — середина ног).
"""
import sys, os, json
import numpy as np
from PIL import Image

def key(arr):
    r, g, b = arr[..., 0].astype(int), arr[..., 1].astype(int), arr[..., 2].astype(int)
    green = (g > 110) & (g > r * 1.3) & (g > b * 1.3)
    near = (g > r * 1.08) & (g > b * 1.08) & ~green          # кайма — полупрозрачная, без зелени
    a = np.full(r.shape, 255, np.uint8); a[green] = 0
    a[near] = np.clip(255 - (g[near] - np.maximum(r[near], b[near])) * 4, 40, 255).astype(np.uint8)
    arr[..., 1] = np.where(near | green, np.minimum(g, np.maximum(r, b)), g).astype(np.uint8)
    white = (r > 225) & (g > 225) & (b > 225)                 # линии сетки
    a[white & (a > 0) & False] = 0
    arr[..., 3] = a
    return arr

def main():
    args = [a for a in sys.argv[1:]]
    grid = (4, 4); H = 300; dokey = True
    if '--grid' in args: i = args.index('--grid'); grid = tuple(int(x) for x in args[i + 1].split('x')); del args[i:i + 2]
    if '--h' in args: i = args.index('--h'); H = int(args[i + 1]); del args[i:i + 2]
    if '--no-key' in args: args.remove('--no-key'); dokey = False
    name, sheets = args[0], args[1:]
    frames = []
    for sh in sheets:
        im = np.array(Image.open(sh).convert('RGBA'))
        h, w = im.shape[:2]; cw, ch = w / grid[0], h / grid[1]
        for row in range(grid[1]):
            for col in range(grid[0]):
                x0, y0 = int(col * cw) + 4, int(row * ch) + 4
                cell = im[y0:int((row + 1) * ch) - 4, x0:int((col + 1) * cw) - 4].copy()
                frames.append(key(cell) if dokey else cell)
    if not dokey:
        out = [Image.fromarray(f).resize((int(f.shape[1] * H / f.shape[0]), H), Image.LANCZOS) for f in frames]
        fw, fh = out[0].size; anchor = [fw / 2, fh]
    else:
        # габариты героя в каждом кадре: низ ног, центр корпуса (верхние 60% фигуры), высота
        info = []
        for f in frames:
            a = f[..., 3] > 128
            ys, xs = np.where(a)
            top, bot = ys.min(), ys.max()
            body = a[top:top + int((bot - top) * .6)]
            by, bx = np.where(body)
            info.append((top, bot, bx.mean()))
        heights = [b - t for t, b, _ in info]; med = float(np.median(heights))
        k = H / med
        out = []; pad = 1.6        # запас по ширине под плащ и меч
        fw, fh = int(H * pad), int(H * 1.12)
        anchor = [fw / 2, fh - int(H * .05)]
        for f, (t, b, cx) in zip(frames, info):
            im = Image.fromarray(f); s = k * (med / max(1, b - t)) if abs((b - t) / med - 1) > .04 else k
            im = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.LANCZOS)
            canvas = Image.new('RGBA', (fw, fh), (0, 0, 0, 0))
            canvas.paste(im, (int(anchor[0] - cx * s), int(anchor[1] - b * s)), im)
            out.append(canvas)
    atlas = Image.new('RGBA', (fw * len(out), fh), (0, 0, 0, 0))
    for i, f in enumerate(out): atlas.paste(f, (i * fw, 0))
    os.makedirs('assets/game', exist_ok=True); os.makedirs('assets/anim', exist_ok=True)
    atlas.save('assets/game/anim_%s.webp' % name, 'WEBP', quality=86, method=6)
    meta = {'w': fw, 'h': fh, 'n': len(out), 'anchor': anchor, 'keyed': dokey}
    json.dump(meta, open('assets/anim/%s.json' % name, 'w'))
    print(name, meta, os.path.getsize('assets/game/anim_%s.webp' % name) // 1024, 'КБ')

if __name__ == '__main__':
    main()
