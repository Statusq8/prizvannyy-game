# Штаб (прокачка): пакет пользователя docs/reference/hq_pack (Upgrade_UI_Final_v3) → assets/hq/*.webp
# - рамки портретов, фракции, переключатель: оставляем самое большое пятно (в листе были куски соседей и подписи)
# - кнопка «Улучшить»: стираем вшитый текст и кристалл (подпись и цену рисует игра) — заливаем по горизонтали между чистыми столбцами
import numpy as np
from PIL import Image
from scipy import ndimage
SRC, OUT = 'docs/reference/hq_pack/', 'assets/hq/'


def load(n): return np.array(Image.open(SRC + n + '.png').convert('RGBA'))


def big(a, it=3, thr=20):
    m = a[..., 3] > thr
    lab, n = ndimage.label(ndimage.binary_dilation(m, iterations=it) if it else m)
    if n > 1:
        sz = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1)); k = 1 + int(np.argmax(sz))
        a = a.copy(); a[..., 3] = np.where(lab == k, a[..., 3], 0)
    return a


def trim(a):
    ys, xs = np.where(a[..., 3] > 10)
    return a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


def save(a, name, w=None):
    im = Image.fromarray(trim(a), 'RGBA')
    if w and im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(OUT + name + '.webp', 'WEBP', quality=88, method=6); print(name, im.size)


def blank(a, x0, x1, y0, y1, cl, cr):
    a = a.copy().astype(float)
    L, R = a[y0:y1, cl].copy(), a[y0:y1, cr].copy()
    for x in range(x0, x1):
        t = (x - cl) / (cr - cl); a[y0:y1, x] = L * (1 - t) + R * t
    return a.clip(0, 255).astype('uint8')


def cutfoot(a, r):
    # снизу у рамок прилипли куски соседних рамок из листа (другого цвета): в нижней трети убираем пиксели чужого оттенка
    a = trim(a).copy(); h = a.shape[0]
    rgb = a[..., :3].astype(float) / 255; mx, mn = rgb.max(-1), rgb.min(-1); sat = (mx - mn) / (mx + 1e-6)
    hsv = np.array(Image.fromarray(a[..., :3]).convert('HSV')).astype(float); hue = hsv[..., 0]
    top = (a[:h // 2, :, 3] > 120) & (sat[:h // 2] > .35)
    y0 = int(h * .68); bad = np.zeros(a.shape[:2], bool)
    if r == 'E': bad[y0:] = sat[y0:] > .45
    elif r in ('GOD',): return a
    else:
        dom = np.median(hue[:h // 2][top]); d = np.abs(hue - dom); d = np.minimum(d, 256 - d)
        bad[y0:] = (d[y0:] > 28) & (sat[y0:] > .3)
    a[..., 3] = np.where(bad, 0, a[..., 3])
    a = trim(big(a, 0, 60)); h = a.shape[0]
    cov = (a[..., 3] > 60).sum(1).astype(float); lo = int(h * .8)
    y = lo + int(np.argmin(cov[lo:]))      # остатки бликов соседа ниже самой пустой строки — срезаем
    if cov[y] < 0.25 * cov[lo] and y < h - 3: a = a[:y]
    return trim(a)


for r in ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'GOD']: save(cutfoot(big(load('portrait_frame_' + r), 0, 60), r), 'fr_' + r, 260)
for f in ['demons', 'elements', 'light', 'machines', 'nature', 'shadow', 'undead', 'void']:
    a = trim(big(load('faction_' + f), 0, 60)); a = a[:a.shape[1]]; save(a, 'fa_' + f, 96)
for c in ['gold', 'red', 'purple', 'rainbow', 'unlit']: save(load('star_' + c + '_1'), 'st_' + c, 48)
for t in ['upgrade', 'artifacts', 'bag', 'pets']:
    for st in ['normal', 'selected']: save(big(load('tab_' + t + '_' + st)), 'tab_' + t + '_' + st, 240)
for r in ['gold', 'crystal', 'fist']: save(load('resource_' + r), 'res_' + r, 360)
save(load('nav_back'), 'nav_back', 160); save(load('nav_heroes_title'), 'nav_title', 520)
save(big(load('nav_quantity_expanded')), 'nav_qty', 420)
save(load('hero_card_universal'), 'card', 900)
save(load('stat_attack'), 'ic_attack', 64)
save(blank(load('upgrade_normal'), 192, 792, 70, 236, 186, 798), 'btn_up', 360)
save(blank(load('upgrade_disabled'), 110, 715, 58, 208, 92, 726), 'btn_off', 360)
Image.open(SRC + 'upgrade_tower_background_9x16.png').convert('RGB').resize((720, 1279), Image.LANCZOS).save(OUT + 'bg.webp', 'WEBP', quality=80, method=6)
