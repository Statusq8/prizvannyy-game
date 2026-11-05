#!/usr/bin/env python3
"""Нарезка листа частей чиби-героя для «костей» (src/rig.js).

Запуск:  python3 tools/rigcut.py <лист.png> <id героя> [--order head,cape,torso,...]
Лист: части на чисто-зелёном фоне (#00FF00), раскладка по промту — 3 ряда:
  1) голова | плащ | туловище
  2) левое плечо | левое предплечье | правое плечо | правое предплечье
  3) левая нога | правая нога | меч
Результат: assets/game/rig_<id>_<часть>.webp (прозрачный фон, масштаб под скелет 200×240)
и assets/rig/<id>.json — опорные точки частей. Потом: npm run build.
"""
import sys, json, os
from PIL import Image
import numpy as np
from collections import deque

ORDER = ['head', 'cape', 'torso', 'armLu', 'armLl', 'armRu', 'armRl', 'legL', 'legR', 'sword']
# желаемая высота части в единицах скелета (холст 200×240) — по ней считается общий масштаб от туловища
UNIT_H = {'torso': 52}
# опорная точка: доля ширины, доля высоты (где часть крепится к родителю)
PIVOT = {'head': (.5, .92), 'cape': (.5, .04), 'torso': (.5, .96), 'armLu': (.5, .12), 'armLl': (.5, .08), 'armRu': (.5, .12), 'armRl': (.5, .08),
         'legL': (.5, .06), 'legR': (.5, .06), 'sword': (.5, .9)}

def key_green(arr):
    r, g, b = arr[..., 0].astype(int), arr[..., 1].astype(int), arr[..., 2].astype(int)
    green = (g > 120) & (g > r * 1.35) & (g > b * 1.35)
    a = np.where(green, 0, 255).astype(np.uint8)
    # подавление зелёной каймы
    spill = (g > r) & (g > b) & ~green
    arr[..., 1] = np.where(spill, np.maximum(r, b), g).astype(np.uint8)
    return a

def components(mask, min_px):
    h, w = mask.shape
    seen = np.zeros_like(mask, bool); out = []
    small = mask[::2, ::2]; sh, sw = small.shape; seen = np.zeros((sh, sw), bool)
    for y in range(sh):
        for x in range(sw):
            if small[y, x] and not seen[y, x]:
                q = deque([(y, x)]); seen[y, x] = True; ys = [y]; xs = [x]; n = 0
                while q:
                    cy, cx = q.popleft(); n += 1
                    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (-1, -1), (1, -1), (-1, 1)):
                        ny, nx = cy + dy, cx + dx
                        if 0 <= ny < sh and 0 <= nx < sw and small[ny, nx] and not seen[ny, nx]:
                            seen[ny, nx] = True; q.append((ny, nx)); ys.append(ny); xs.append(nx)
                if n * 4 >= min_px:
                    out.append((min(xs) * 2, min(ys) * 2, max(xs) * 2 + 2, max(ys) * 2 + 2, n))
    return out

def main():
    src, hid = sys.argv[1], sys.argv[2]
    order = ORDER
    if '--order' in sys.argv: order = sys.argv[sys.argv.index('--order') + 1].split(',')
    im = Image.open(src).convert('RGBA'); arr = np.array(im)
    alpha = key_green(arr); arr[..., 3] = alpha
    H, W = alpha.shape
    comps = components(alpha > 0, (W * H) // 900)
    comps.sort(key=lambda c: -c[4]); comps = comps[:len(order)]
    if len(comps) < len(order): print('найдено частей:', len(comps), 'нужно', len(order), '— проверьте лист');
    # ряды: группируем по центру по Y, внутри ряда — слева направо
    comps.sort(key=lambda c: (c[1] + c[3]) / 2)
    rows, cur = [], []
    for c in comps:
        if cur and (c[1] + c[3]) / 2 - (cur[-1][1] + cur[-1][3]) / 2 > H * .12: rows.append(cur); cur = []
        cur.append(c)
    if cur: rows.append(cur)
    flat = [c for r in rows for c in sorted(r, key=lambda c: c[0])]
    parts = dict(zip(order, flat))
    t = parts.get('torso'); scale = UNIT_H['torso'] / max(1, (t[3] - t[1])) if t else .25
    os.makedirs('assets/game', exist_ok=True); os.makedirs('assets/rig', exist_ok=True)
    piv = {}
    full = Image.fromarray(arr)
    rot = {}
    if '--rot' in sys.argv:
        for kv in sys.argv[sys.argv.index('--rot') + 1].split(','): k, v = kv.split('='); rot[k] = float(v)
    mul = {}
    if '--mul' in sys.argv:
        for kv in sys.argv[sys.argv.index('--mul') + 1].split(','): k, v = kv.split('='); mul[k] = float(v)
    for name, (x0, y0, x1, y1, n) in parts.items():
        crop = full.crop((x0, y0, x1, y1))
        if name in rot: crop = crop.rotate(rot[name], expand=True, resample=Image.BICUBIC); crop = crop.crop(crop.getbbox())
        k = scale * mul.get(name, 1)
        w, h = max(1, round(crop.width * k * 2)), max(1, round(crop.height * k * 2))     # ×2 — чёткость на экранах с плотностью 2
        crop = crop.resize((w, h), Image.LANCZOS)
        crop.save('assets/game/rig_%s_%s.webp' % (hid, name), 'WEBP', quality=90)
        px, py = PIVOT.get(name, (.5, .5))
        piv[name] = [round(w * px / 2, 1), round(h * py / 2, 1), 0.5]        # третье число — масштаб отрисовки (картинка ×2)
        print(name, (x1 - x0, y1 - y0), '->', (w, h))
    json.dump(piv, open('assets/rig/%s.json' % hid, 'w'), ensure_ascii=False, indent=1)
    print('готово: assets/rig/%s.json' % hid)

if __name__ == '__main__':
    main()
