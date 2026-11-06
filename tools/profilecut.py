# Профиль: листы пользователя → assets/profile/*.webp, фон → bg_top/bg_bot (docs/ui/PROFILE.md)
import sys
import numpy as np
from PIL import Image
from scipy import ndimage
sys.path.insert(0, 'tools')
from enemycut import key

R, OUT = 'docs/reference/profile/', 'assets/profile/'


def save(a, nm, w):
    ys, xs = np.where(a[..., 3] > 16); a = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    im = Image.fromarray(a, 'RGBA')
    if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(OUT + nm + '.webp', 'WEBP', quality=88, method=6); print(nm, im.size)


# Лист A — 12 пятен; строки определяются по близости центров по высоте
A = [('panel', 760), ('ring', 360), ('ribbon', 560), ('pencil', 100), ('btn', 360), ('hdr', 560), ('stat', 480), ('list', 520),
     ('sep', 600), ('tab', 260), ('tab_on', 280), ('hdr2', 460)]
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
B = ['p_person', 'p_laurel', 'p_shirt', 'p_bars', 'p_book', 'p_pencil', 'p_pic', 'p_tower', 'p_hour', 'p_skull', 'p_tap', 'p_boss',
     'p_vortex', 'p_starl', 'p_scroll', 'p_swords', 'p_claws', 'p_cross', 'p_burst', 'p_coins', 'p_soul', 'p_fast', 'p_lock', 'p_check']
rgba = key(np.array(Image.open(R + 'sheet_b.png').convert('RGB'))); H, W = rgba.shape[:2]
for i, nm in enumerate(B):
    r, c = divmod(i, 6)
    save(rgba[round(r * H / 4):round((r + 1) * H / 4), round(c * W / 6):round((c + 1) * W / 6)].copy(), nm, 140)

# фон: верх (доска) и низ (пол) отдельно, между ними — ровный тёмный цвет
from PIL import ImageDraw
full = Image.open(R + 'bg.png').convert('RGB'); FW, FH = full.size
top = full.crop((0, 0, FW, 560)); bot = full.crop((0, 1260, FW, FH))
def fade(im, down):
    a = Image.new('L', im.size, 255); d = ImageDraw.Draw(a); h = im.size[1]
    for i in range(80):
        y = h - 80 + i if down else 79 - i
        d.line([(0, y), (im.size[0], y)], fill=int(255 * (1 - i / 80)))
    out = im.convert('RGBA'); out.putalpha(a); return out
fade(top, True).resize((720, round(560 * 720 / FW)), Image.LANCZOS).save(OUT + 'bg_top.webp', 'WEBP', quality=82, method=6)
fade(bot, False).resize((720, round((FH - 1260) * 720 / FW)), Image.LANCZOS).save(OUT + 'bg_bot.webp', 'WEBP', quality=82, method=6)
print('mid color', full.getpixel((FW // 2, 950)), FW, FH)
