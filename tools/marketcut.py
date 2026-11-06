# Рынок: листы пользователя (зелёный фон) → assets/market/*.webp, фон → assets/market/bg.webp (docs/ui/MARKET.md)
import sys
import numpy as np
from PIL import Image
from scipy import ndimage
sys.path.insert(0, 'tools')
from enemycut import key

R, OUT = 'docs/reference/market/', 'assets/market/'


def save(a, nm, w):
    ys, xs = np.where(a[..., 3] > 16); a = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    im = Image.fromarray(a, 'RGBA')
    if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(OUT + nm + '.webp', 'WEBP', quality=88, method=6); print(nm, im.size)


# Лист A — 12 отдельных пятен, по строкам (y) и слева направо
A = [('card', 260), ('card_sold', 260), ('ribbon', 300), ('btn_gold', 300), ('btn_blue', 300), ('btn_grey', 300),
     ('title', 520), ('timer', 420), ('back', 260), ('pill', 300), ('refresh', 480), ('icon_fr', 160)]
rgba = key(np.array(Image.open(R + 'sheet_a.png').convert('RGB'))); m = rgba[..., 3] > 24
lab, n = ndimage.label(ndimage.binary_dilation(m, iterations=6))
objs = [(k, sl) for k, sl in enumerate(ndimage.find_objects(lab), 1) if (sl[0].stop - sl[0].start) * (sl[1].stop - sl[1].start) > 900]
H = rgba.shape[0]; objs.sort(key=lambda o: (int(((o[1][0].start + o[1][0].stop) / 2) // (H / 3)), o[1][1].start))
assert len(objs) == len(A), len(objs)
for (nm, w), (k, sl) in zip(A, objs):
    a = rgba[sl].copy(); a[..., 3] = np.where(lab[sl] == k, a[..., 3], 0); save(a, nm, w)

# Лист B — сетка 4×2 по ячейкам (у души много мелких языков пламени)
B = ['i_ticket', 'i_tickets5', 'i_shard', 'i_soul', 'i_crystal', 'i_coin', 'i_hourglass', 'i_hero']
rgba = key(np.array(Image.open(R + 'sheet_b.png').convert('RGB'))); H, W = rgba.shape[:2]
for i, nm in enumerate(B):
    r, c = divmod(i, 4)
    save(rgba[round(r * H / 2):round((r + 1) * H / 2), round(c * W / 4):round((c + 1) * W / 4)].copy(), nm, 200)

bg = Image.open(R + 'bg.png').convert('RGB'); bg.resize((720, round(bg.height * 720 / bg.width)), Image.LANCZOS).save(OUT + 'bg.webp', 'WEBP', quality=80, method=6)
