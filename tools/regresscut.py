# Регрессия (ритуал): листы пользователя → assets/regress/*.webp, фон → bg.webp (docs/ui/RITUAL.md)
import sys
import numpy as np
from PIL import Image
from scipy import ndimage
sys.path.insert(0, 'tools')
from enemycut import key

R, OUT = 'docs/reference/ritual/', 'assets/regress/'


def save(a, nm, w):
    ys, xs = np.where(a[..., 3] > 16); a = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    im = Image.fromarray(a, 'RGBA')
    if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(OUT + nm + '.webp', 'WEBP', quality=88, method=6); print(nm, im.size)


# Лист A — 12 пятен; строки определяются по близости центров по высоте
A = [('back', 140), ('pill', 300), ('title', 620), ('hdr', 420), ('panel', 760), ('hdr_red', 460), ('hdr_green', 460),
     ('panel_red', 520), ('panel_green', 520), ('btn_dark', 480), ('btn_light', 480), ('badge', 160)]
rgba = key(np.array(Image.open(R + 'sheet_a.png').convert('RGB'))); m = rgba[..., 3] > 24
lab, n = ndimage.label(ndimage.binary_dilation(m, iterations=6))
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
B = ['i_soul', 'i_crystal', 'i_gold', 'i_hex', 'i_stairs', 'i_heroes', 'i_star', 'i_ring', 'i_x', 'i_check']
rgba = key(np.array(Image.open(R + 'sheet_b.png').convert('RGB'))); H, W = rgba.shape[:2]
for i, nm in enumerate(B):
    r, c = divmod(i, 5)
    save(rgba[round(r * H / 2):round((r + 1) * H / 2), round(c * W / 5):round((c + 1) * W / 5)].copy(), nm, 160)

bg = Image.open(R + 'bg.png').convert('RGB'); bg.resize((720, round(bg.height * 720 / bg.width)), Image.LANCZOS).save(OUT + 'bg.webp', 'WEBP', quality=80, method=6)
