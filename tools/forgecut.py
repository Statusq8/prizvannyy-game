# Кузница: листы пользователя (зелёный фон) → assets/forge/*.webp, фон → assets/forge/bg.webp (docs/ui/FORGE.md)
import sys
import numpy as np
from PIL import Image
from scipy import ndimage
sys.path.insert(0, 'tools')
from enemycut import key

R = 'docs/reference/forge/'
OUT = 'assets/forge/'


def save(a, nm, w):
    ys, xs = np.where(a[..., 3] > 16); a = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    im = Image.fromarray(a, 'RGBA')
    if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(OUT + nm + '.webp', 'WEBP', quality=88, method=6); print(nm, im.size)


# Лист A — рамка ячейки и карточка слиплись, поэтому вручную по прямоугольникам (y0, y1, x0, x1)
A = {'cell': (10, 290, 60, 360, 200), 'card': (290, 690, 60, 360, 300), 'lvl': (115, 220, 400, 690, 200),
     'tab': (70, 260, 720, 1050, 200), 'tab_on': (60, 265, 1060, 1400, 200), 'name': (425, 535, 385, 720, 280),
     'buy': (410, 570, 718, 1075, 300), 'buy_off': (415, 570, 1072, 1420, 300), 'br_soul': (685, 840, 25, 490, 420),
     'br_blood': (695, 835, 492, 952, 420), 'refresh': (685, 850, 975, 1418, 420), 'title': (830, 1080, 220, 1228, 640)}
rgba = key(np.array(Image.open(R + 'sheet_a.png').convert('RGB')))
for nm, (y0, y1, x0, x1, w) in A.items(): save(rgba[y0:y1, x0:x1].copy(), nm, w)


def icons(src, names, w=200):
    rgba = key(np.array(Image.open(src).convert('RGB')))
    m = rgba[..., 3] > 24
    lab, n = ndimage.label(ndimage.binary_dilation(m, iterations=6))
    objs = [(k, sl) for k, sl in enumerate(ndimage.find_objects(lab), 1) if (sl[0].stop - sl[0].start) * (sl[1].stop - sl[1].start) > 900]
    H = rgba.shape[0]; rows = round(H / (objs[0][1][0].stop - objs[0][1][0].start + 40))
    objs.sort(key=lambda o: (int(((o[1][0].start + o[1][0].stop) / 2) // (H / rows)), o[1][1].start))
    for nm, (k, sl) in zip(names, objs):
        if not nm: continue
        a = rgba[sl].copy(); a[..., 3] = np.where(lab[sl] == k, a[..., 3], 0); save(a, 'i_' + nm, w)


icons(R + 'sheet_b1.png', ['blade', 'eye', 'fang', 'grail', 'banner', 'gaunt', 'feather', 'sand', 'crown', 'gate', 'ring', 'book'])
icons(R + 'sheet_b2.png', ['bkatar', 'bglove', 'bpot', 'baxe', 'bdoll', None])
bg = Image.open(R + 'bg.png').convert('RGB'); bg.resize((720, round(bg.height * 720 / bg.width)), Image.LANCZOS).save(OUT + 'bg.webp', 'WEBP', quality=80, method=6)
