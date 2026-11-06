# Герои: листы пользователя → assets/heroes_ui/*.webp, фон → bg_top/bg_bot (docs/ui/HEROES_SCREEN.md)
import sys
import numpy as np
from PIL import Image
from scipy import ndimage
sys.path.insert(0, 'tools')
from enemycut import key

R, OUT = 'docs/reference/heroes/', 'assets/heroes_ui/'


def save(a, nm, w):
    ys, xs = np.where(a[..., 3] > 16); a = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    im = Image.fromarray(a, 'RGBA')
    if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(OUT + nm + '.webp', 'WEBP', quality=88, method=6); print(nm, im.size)


# Лист A — 12 пятен; строки определяются по близости центров по высоте
A = [('panel', 760), ('flt', 120), ('flt_on', 130), ('s_light', 120), ('s_dark', 120), ('s_wild', 120), ('s_shadow', 120), ('win', 640),
     ('name', 640), ('sh_gold', 150), ('sh_violet', 150), ('stars', 640), ('stat', 320), ('bio', 320), ('arrow', 120), ('close', 120)]
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
B = ['btn_gold', 'btn_violet', 'btn_gv', 'i_dmg', 'i_heroes', 'i_level', 'i_rank', 'i_evo', 'i_lock', 'star', 'star_off', 'rune']
rgba = key(np.array(Image.open(R + 'sheet_b.png').convert('RGB'))); H, W = rgba.shape[:2]
for i, nm in enumerate(B):
    r, c = divmod(i, 4); X = [0, 388, 754, 1124, 1449] if r == 0 else [round(k * W / 4) for k in range(5)]
    save(rgba[round(r * H / 3):round((r + 1) * H / 3), X[c]:X[c + 1]].copy(), nm, 360 if i < 3 or i == 11 else 160)

# Лист C — рамки редкостей 5×2; тёмно-зелёная «шахматка» внутри — прозрачная
C = ['fr_E', 'fr_D', 'fr_C', 'fr_B', 'fr_A', 'fr_S', 'fr_SS', 'fr_SSS', 'fr_GOD', 'fr_lock']
RAW = np.array(Image.open(R + 'sheet_c.png').convert('RGB')); rgba = key(RAW); H, W = rgba.shape[:2]
# зелёная рамка (C) общий ключ съедает — для неё ключ только по чистому фону (0,250,5)
d = np.sqrt(((RAW.astype(int) - [2, 250, 5]) ** 2).sum(2)); soft = np.dstack([RAW, np.clip((d - 25) * 6, 0, 255).astype(np.uint8)])
for i, nm in enumerate(C):
    r, c = divmod(i, 5)
    a = (soft if nm == 'fr_C' else rgba)[round(r * H / 2):round((r + 1) * H / 2), round(c * W / 5):round((c + 1) * W / 5)].copy()
    ys, xs = np.where(a[..., 3] > 16); a = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    h, w = a.shape[:2]; px = a[..., :3].astype(int); dark = px.max(2) < 95
    inner = np.zeros((h, w), bool); inner[int(h * .07):int(h * .93), int(w * .07):int(w * .93)] = True
    keep = ndimage.binary_dilation(~dark & inner, iterations=1) if nm == 'fr_lock' else np.zeros((h, w), bool)
    a[..., 3] = np.where(inner & dark & ~keep, 0, a[..., 3]); save(a, nm, 240)

# фон: верх (доска) и низ (пол) отдельно, между ними — ровный тёмный цвет
from PIL import ImageDraw
full = Image.open(R + 'bg.png').convert('RGB'); FW, FH = full.size
top = full.crop((0, 0, FW, 640)); bot = full.crop((0, 1180, FW, FH))
def fade(im, down):
    a = Image.new('L', im.size, 255); d = ImageDraw.Draw(a); h = im.size[1]
    for i in range(80):
        y = h - 80 + i if down else 79 - i
        d.line([(0, y), (im.size[0], y)], fill=int(255 * (1 - i / 80)))
    out = im.convert('RGBA'); out.putalpha(a); return out
fade(top, True).resize((720, round(640 * 720 / FW)), Image.LANCZOS).save(OUT + 'bg_top.webp', 'WEBP', quality=82, method=6)
fade(bot, False).resize((720, round((FH - 1180) * 720 / FW)), Image.LANCZOS).save(OUT + 'bg_bot.webp', 'WEBP', quality=82, method=6)
print('mid color', full.getpixel((FW // 2, 950)), FW, FH)
