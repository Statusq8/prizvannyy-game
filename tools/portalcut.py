# Портал: листы деталей пользователя (зелёный фон, 3 ряда) → assets/portal/*.webp, фон → assets/portal/bg.webp
import sys
import numpy as np
from PIL import Image
from scipy import ndimage
sys.path.insert(0, 'tools')
from enemycut import key

A = ['btn_blue', 'btn_gold', 'pill', 'bar', 'fill', 'medal', 'panel', 'title', 'ticket']
B = ['back', 'hist', 'q', 'info', 'tab', 'tab_on', 'banner', 'arr_l', 'arr_r']
W = {'btn_blue': 420, 'btn_gold': 420, 'pill': 260, 'bar': 520, 'fill': 480, 'medal': 160, 'panel': 300, 'title': 560, 'ticket': 90,
     'back': 130, 'hist': 260, 'q': 100, 'info': 70, 'tab': 300, 'tab_on': 300, 'banner': 720, 'arr_l': 60, 'arr_r': 60}


def cut(src, names):
    rgba = key(np.array(Image.open(src).convert('RGB')))
    H = rgba.shape[0]; m = rgba[..., 3] > 24
    lab, n = ndimage.label(ndimage.binary_dilation(m, iterations=6))
    objs = [(k, sl) for k, sl in enumerate(ndimage.find_objects(lab), 1) if (sl[0].stop - sl[0].start) * (sl[1].stop - sl[1].start) > 900]
    objs.sort(key=lambda o: (int(((o[1][0].start + o[1][0].stop) / 2) // (H / 3)), o[1][1].start))
    assert len(objs) == len(names), (src, len(objs))
    for nm, (k, sl) in zip(names, objs):
        a = rgba[sl].copy(); a[..., 3] = np.where((lab[sl] == k) & m[sl], a[..., 3], 0)
        im = Image.fromarray(a, 'RGBA'); w = W[nm]
        if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        im.save('assets/portal/' + nm + '.webp', 'WEBP', quality=88, method=6); print(nm, im.size)


cut('docs/reference/portal/sheet_a.png', A)
cut('docs/reference/portal/sheet_b.png', B)
bg = Image.open('docs/reference/portal/bg.png').convert('RGB'); bg.resize((720, round(bg.height * 720 / bg.width)), Image.LANCZOS).save('assets/portal/bg.webp', 'WEBP', quality=80, method=6)
