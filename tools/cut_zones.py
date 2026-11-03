"""Нарезка 12 зон из референсов: фон + 4 листа 2×2 (3 моба + босс) → кадры idle/attack/hurt/death с прозрачностью.
Фон листа однотонный (~50,47,54): удаляем по расстоянию цвета + связность с краем кадра, мягкий край.
Запуск: python3 tools/cut_zones.py <папка_референсов> <выход>"""
import sys, os, json
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

SRC, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
# зона: (фон, [моб1, моб2, моб3, босс]) — номера файлов 10000763xx/4xx, определены по контакт-листам
Z = [
 ('1000076334', ['1000076333', '1000076352', '1000076353', '1000076354']),   # 1 Древний лес
 ('1000076389', ['1000076390', '1000076391', '1000076392', '1000076393']),   # 2 Пепельная пустыня
 ('1000076394', ['1000076395', '1000076396', '1000076397', '1000076398']),   # 3 Ледяные залы
 ('1000076399', ['1000076400', '1000076401', '1000076402', '1000076403']),   # 4 Огненная кузница
 ('1000076404', ['1000076405', '1000076406', '1000076407', '1000076408']),   # 5 Грозовой пик
 ('1000076409', ['1000076410', '1000076411', '1000076412', '1000076413']),   # 6 Ядовитое болото
 ('1000076414', ['1000076415', '1000076416', '1000076418', '1000076419']),   # 7 Затопленный храм
 ('1000076420', ['1000076421', '1000076422', '1000076423', '1000076424']),   # 8 Царство смерти
 ('1000076425', ['1000076426', '1000076427', '1000076428', '1000076429']),   # 9 Кристальные пещеры
 ('1000076430', ['1000076431', '1000076432', '1000076433', '1000076434']),   # 10 Священная цитадель
 ('1000076435', ['1000076436', '1000076437', '1000076438', '1000076439']),   # 11 Теневая крепость
 ('1000076440', ['1000076441', '1000076442', '1000076443', '1000076444']),   # 12 Бездна
]
FR = ['idle', 'attack', 'hurt', 'death']

def key(im):
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    h, w, _ = a.shape
    border = np.concatenate([a[:4].reshape(-1, 3), a[-4:].reshape(-1, 3), a[:, :4].reshape(-1, 3), a[:, -4:].reshape(-1, 3)])
    bg = np.median(border, axis=0)
    d = np.sqrt(((a - bg) ** 2).sum(-1))
    cand = d < 16
    lab, n = ndimage.label(cand)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bgmask = np.isin(lab, list(edge))
    # мягкий край: пиксели рядом с фоном получают альфу по расстоянию цвета
    near = ndimage.binary_dilation(bgmask, iterations=3) & ~bgmask
    alpha = np.full((h, w), 255, np.float32)
    alpha[bgmask] = 0
    alpha[near] = np.clip((d[near] - 10) / 40, 0, 1) * 255
    # снять серый «ореол»: в полупрозрачных пикселях вычитаем цвет фона
    t = (alpha / 255)[..., None]
    rgb = np.where(t > 0.02, (a - bg * (1 - t)) / np.maximum(t, 0.02), 0)
    rgba = np.dstack([np.clip(rgb, 0, 255), alpha]).astype(np.uint8)
    out = Image.fromarray(rgba, 'RGBA')
    # убрать мелкий мусор: компоненты < 0.2% площади
    m = alpha > 40
    lab2, n2 = ndimage.label(m)
    if n2:
        sizes = ndimage.sum(m, lab2, range(1, n2 + 1))
        small = np.isin(lab2, [i + 1 for i, s in enumerate(sizes) if s < 0.002 * h * w])
        arr = np.asarray(out).copy(); arr[small, 3] = (arr[small, 3] * 0.5).astype(np.uint8); out = Image.fromarray(arr, 'RGBA')
    return out

meta = {}
total = 0
for zi, (bgf, sheets) in enumerate(Z, 1):
    bg = Image.open(f'{SRC}/{bgf}.jpg').convert('RGB')
    bg.thumbnail((640, 1138), Image.LANCZOS)
    p = f'{OUT}/z{zi}_bg.webp'; bg.save(p, 'WEBP', quality=66, method=5); total += os.path.getsize(p)
    for mi, sf in enumerate(sheets, 1):
        sh = Image.open(f'{SRC}/{sf}.jpg').convert('RGB')
        W, H = sh.size
        for fi, (x, y) in enumerate([(0, 0), (1, 0), (0, 1), (1, 1)]):
            fr = sh.crop((x * W // 2, y * H // 2, (x + 1) * W // 2, (y + 1) * H // 2))
            cut = key(fr)
            bb = cut.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
            if bb: cut = cut.crop(bb)
            cut.thumbnail((360, 360), Image.LANCZOS)
            name = f'z{zi}_m{mi}_{FR[fi]}'
            p = f'{OUT}/{name}.webp'; cut.save(p, 'WEBP', quality=70, method=4); total += os.path.getsize(p)
            meta[name] = cut.size
json.dump(meta, open(f'{OUT}/frames.json', 'w'), indent=0)
print('zones', len(Z), 'frames', len(meta), 'KB', total // 1024)
