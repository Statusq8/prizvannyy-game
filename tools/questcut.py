# Задания: листы пользователя → assets/quests/*.webp, фон → bg.webp (docs/ui/QUESTS.md)
import sys
import numpy as np
from PIL import Image
from scipy import ndimage
sys.path.insert(0, 'tools')
from enemycut import key

R, OUT = 'docs/reference/quests/', 'assets/quests/'


def save(a, nm, w):
    ys, xs = np.where(a[..., 3] > 16); a = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    im = Image.fromarray(a, 'RGBA')
    if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(OUT + nm + '.webp', 'WEBP', quality=88, method=6); print(nm, im.size)


# Лист A — 12 пятен; строки определяются по близости центров по высоте
A = [('tab', 300), ('tab_on', 300), ('act', 760), ('bar', 460), ('bar_fill', 460), ('mark', 60), ('card', 760), ('icon_fr', 180),
     ('btn_claim', 300), ('btn_go', 300), ('btn_done', 300), ('day', 200), ('day_got', 200), ('day_now', 220), ('btn_big', 520), ('dot', 48)]
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
B = ['i_battle', 'i_boss', 'i_tap', 'i_summon', 'i_star', 'chest1', 'chest2', 'chest3', 'chest_open', 'i_cup', 'i_cal', 'i_scroll']
rgba = key(np.array(Image.open(R + 'sheet_b.png').convert('RGB'))); H, W = rgba.shape[:2]
for i, nm in enumerate(B):
    r, c = divmod(i, 4)
    save(rgba[round(r * H / 3):round((r + 1) * H / 3), round(c * W / 4):round((c + 1) * W / 4)].copy(), nm, 180)


# карточка: убрать нарисованный разделитель (рисуется CSS в нужном месте — плашка тянется по ширине)
c = np.array(Image.open(OUT + 'card.webp').convert('RGBA')); h, w = c.shape[:2]
mid = c[int(h * .3):int(h * .7), int(w * .5):int(w * .85), :3].astype(int).sum(2).mean(0)
x = int(w * .5) + int(mid.argmax())
c[:, x - 4:x + 5] = c[:, x - 16:x - 7]
Image.fromarray(c, 'RGBA').save(OUT + 'card.webp', 'WEBP', quality=88, method=6); print('card divider at', x)

# фон: верх (доска) и низ (пол) отдельно, между ними — ровный тёмный цвет
from PIL import ImageDraw
full = Image.open(R + 'bg.png').convert('RGB'); FW, FH = full.size
top = full.crop((0, 0, FW, 720)); bot = full.crop((0, 1240, FW, FH))
def fade(im, down):
    a = Image.new('L', im.size, 255); d = ImageDraw.Draw(a); h = im.size[1]
    for i in range(80):
        y = h - 80 + i if down else 79 - i
        d.line([(0, y), (im.size[0], y)], fill=int(255 * (1 - i / 80)))
    out = im.convert('RGBA'); out.putalpha(a); return out
fade(top, True).resize((720, round(720 * 720 / FW)), Image.LANCZOS).save(OUT + 'bg_top.webp', 'WEBP', quality=82, method=6)
fade(bot, False).resize((720, round((FH - 1240) * 720 / FW)), Image.LANCZOS).save(OUT + 'bg_bot.webp', 'WEBP', quality=82, method=6)
print('mid color', full.getpixel((FW // 2, 950)), FW, FH)
