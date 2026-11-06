# Нарезка листов интерфейса экрана боя (3×3 на зелёном фоне) → assets/hud/*.webp
# Лист A — рамки и плашки, лист B — иконки и заливки (docs/ui/BATTLE_HUD.md).
import sys
import numpy as np
from PIL import Image
sys.path.insert(0, 'tools')
from enemycut import key

A = ['avatar', 'pl_name', 'pl_floor', 'pl_enemy', 'hp_frame', 'btn_sq', 'cur_plate', 'ult_frame', 'waves']
B = ['ic_coin', 'ic_dps', 'ic_menu', 'ic_gear', 'fill_hp', 'fill_ult', 'ic_mask', 'ic_skull', 'ic_ult']


def trim(a, pad=2):
    m = a[..., 3] > 24
    ys, xs = np.where(m)
    return a[max(0, ys.min() - pad):ys.max() + pad + 1, max(0, xs.min() - pad):xs.max() + pad + 1]


def save(a, name):
    Image.fromarray(a, 'RGBA').save('assets/hud/' + name + '.webp', 'WEBP', quality=92, method=6)
    print(name, a.shape[1], 'x', a.shape[0])


def cut(src, names):
    """Детали ищем как связные пятна (с расширением, чтобы свечение и шипы не отрывались), а не по сетке:
    у генератора детали заходят в соседние ячейки. Пятно относим к ячейке 3×3 по его центру."""
    from scipy import ndimage
    rgba = key(np.array(Image.open(src).convert('RGB')))
    H, W = rgba.shape[:2]
    m = rgba[..., 3] > 24
    lab, n = ndimage.label(ndimage.binary_dilation(m, iterations=6))
    cells = {i: [] for i in range(9)}
    for k, sl in enumerate(ndimage.find_objects(lab), 1):
        ys, xs = sl
        if (ys.stop - ys.start) * (xs.stop - xs.start) < 400: continue      # крошки
        cy, cx = (ys.start + ys.stop) / 2, (xs.start + xs.stop) / 2
        cells[min(2, int(cy / (H / 3))) * 3 + min(2, int(cx / (W / 3)))].append(k)
    for i, nm in enumerate(names):
        ks = cells[i]
        if not ks: print('нет детали', nm); continue
        mask = np.isin(lab, ks) & m
        a = rgba.copy(); a[..., 3] = np.where(mask, a[..., 3], 0)
        if nm == 'waves':
            parts = sorted(ks, key=lambda k: ndimage.find_objects(lab)[k - 1][1].start)
            if len(parts) == 3:
                for kn, k in zip(['wave_empty', 'wave_on', 'wave_boss'], parts):
                    b = rgba.copy(); b[..., 3] = np.where((lab == k) & m, b[..., 3], 0); save(trim(b), kn)
                continue
            a2 = trim(a); w = a2.shape[1] / 3     # ромбы слиплись — делим поровну
            for j, kn in enumerate(['wave_empty', 'wave_on', 'wave_boss']):
                save(trim(a2[:, int(j * w):int((j + 1) * w)].copy()), kn)
            continue
        a = trim(a)
        if nm == 'hp_frame':   # красная заливка внутри рамки — прозрачная, заливку рисует игра
            f = a.astype(int); red = (f[..., 0] > 120) & (f[..., 1] < 90) & (f[..., 2] < 90)
            a[red, 3] = 0
        if nm == 'ult_frame':  # шипы кристалла сверху/снизу срезаем — кристалл рисует игра отдельно, рамка становится плоской (без растяжения)
            h = a.shape[0]; a = a[int(h * .24):int(h * .80)].copy()
        if nm == 'avatar':     # середина рамки — прозрачная, под ней портрет игрока
            ys, xs = np.where(a[..., 3] > 24); cy = (ys.min() + ys.max()) * 0.47; cx = (xs.min() + xs.max()) / 2
            yy, xx = np.mgrid[:a.shape[0], :a.shape[1]]
            r = np.hypot(yy - cy, xx - cx); inner = a.shape[1] * 0.3
            dark = a[..., :3].max(2) < 70
            a[(r < inner) & dark, 3] = 0
            a[(r < inner * 0.92), 3] = 0
        save(a, nm)


cut('docs/reference/ui_sheets/hud/sheetA_frames.png', A)
cut('docs/reference/ui_sheets/hud/sheetB_icons.png', B)
