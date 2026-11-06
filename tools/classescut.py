# Классы: листы пользователя → assets/classes/*.webp, фон → bg.webp (docs/ui/CLASSES.md)
import sys
import numpy as np
from PIL import Image
from scipy import ndimage
sys.path.insert(0, 'tools')
from enemycut import key

R, OUT = 'docs/reference/classes/', 'assets/classes/'


def save(a, nm, w):
    ys, xs = np.where(a[..., 3] > 16); a = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    im = Image.fromarray(a, 'RGBA')
    if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(OUT + nm + '.webp', 'WEBP', quality=88, method=6); print(nm, im.size)


# Лист A — 12 пятен; строки определяются по близости центров по высоте
A = [('ring_on', 260), ('ring', 240), ('ring_big', 320), ('node', 260), ('node_lock', 260), ('nplate', 340), ('lvl', 180), ('info', 760),
     ('btn_gold', 360), ('btn', 380), ('pt', 100), ('lock', 90)]
rgba = key(np.array(Image.open(R + 'sheet_a.png').convert('RGB'))); m = rgba[..., 3] > 24
lab, n = ndimage.label(ndimage.binary_dilation(m, iterations=2))
objs = [(k, sl) for k, sl in enumerate(ndimage.find_objects(lab), 1) if (sl[0].stop - sl[0].start) * (sl[1].stop - sl[1].start) > 900]
objs.sort(key=lambda o: (o[1][0].start + o[1][0].stop) / 2)
rows, cur = [], []
for o in objs:
    cy = (o[1][0].start + o[1][0].stop) / 2
    if cur and cy - (cur[0][1][0].start + cur[0][1][0].stop) / 2 > 60: rows.append(cur); cur = []
    cur.append(o)
rows.append(cur)
objs = [o for r in rows for o in sorted(r, key=lambda o: o[1][1].start)]
assert len(objs) == len(A), [(o[1][0].start, o[1][1].start) for o in objs]
for (nm, w), (k, sl) in zip(A, objs):
    a = rgba[sl].copy(); a[..., 3] = np.where(lab[sl] == k, a[..., 3], 0); save(a, nm, w)

# Лист B — сетка 5×2
B = ['c_blade', 'c_caller', 'c_hunter', 'c_alch', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6',
     'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6']
rgba = key(np.array(Image.open(R + 'sheet_b.png').convert('RGB'))); H, W = rgba.shape[:2]
for i, nm in enumerate(B):
    r, c = divmod(i, 7)
    save(rgba[round(r * H / 4):round((r + 1) * H / 4), round(c * W / 7):round((c + 1) * W / 7)].copy(), nm, 160)

bg = Image.open(R + 'bg.png').convert('RGB'); bg.resize((720, round(bg.height * 720 / bg.width)), Image.LANCZOS).save(OUT + 'bg.webp', 'WEBP', quality=80, method=6)
print('mid', bg.getpixel((512, 200)))
