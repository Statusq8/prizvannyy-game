# Свиток сюжета: лист пользователя → assets/scroll/*.webp (docs/ui/STORY_SCROLL.md)
import sys
import numpy as np
from PIL import Image
from scipy import ndimage
sys.path.insert(0, 'tools')
from enemycut import key

R, OUT = 'docs/reference/scroll/', 'assets/scroll/'


def save(a, nm, w):
    ys, xs = np.where(a[..., 3] > 16); a = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    im = Image.fromarray(a, 'RGBA')
    if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(OUT + nm + '.webp', 'WEBP', quality=88, method=6); print(nm, im.size)


# Лист A — 12 пятен; строки определяются по близости центров по высоте
A = [('hdr', 260), ('scroll', 320), ('minus', 80), ('rolled', 120)]
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

