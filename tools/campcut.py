# Лагерь: лист островков (зелёный фон, 2 сверху + 3 снизу) → assets/camp/<id>.webp; небо → assets/camp/sky.webp
# Запуск: python3 tools/campcut.py docs/reference/camp/islets.png docs/reference/camp/sky.png
import sys
import numpy as np
from PIL import Image
from scipy import ndimage
sys.path.insert(0, 'tools')
from enemycut import key

ORDER = ['hq', 'gates', 'portal', 'forge', 'market']   # сверху слева направо, потом снизу


def main(sheet, sky):
    rgba = key(np.array(Image.open(sheet).convert('RGB')))
    m = rgba[..., 3] > 24
    lab, n = ndimage.label(ndimage.binary_dilation(m, iterations=8))
    objs = ndimage.find_objects(lab)
    big = sorted(range(1, n + 1), key=lambda k: -(objs[k - 1][0].stop - objs[k - 1][0].start) * (objs[k - 1][1].stop - objs[k - 1][1].start))[:5]
    H = rgba.shape[0]
    big.sort(key=lambda k: (int((objs[k - 1][0].start + objs[k - 1][0].stop) / 2 > H / 2), objs[k - 1][1].start))
    for nm, k in zip(ORDER, big):
        a = rgba.copy(); a[..., 3] = np.where((lab == k) & m, a[..., 3], 0)
        ys, xs = np.where(a[..., 3] > 24)
        a = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
        im = Image.fromarray(a, 'RGBA'); w = 560 if nm == 'hq' else 440
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        im.save('assets/camp/' + nm + '.webp', 'WEBP', quality=88, method=6); print(nm, im.size)
    s = Image.open(sky).convert('RGB'); s = s.resize((720, round(s.height * 720 / s.width)), Image.LANCZOS)
    s.save('assets/camp/sky.webp', 'WEBP', quality=80, method=6); print('sky', s.size)


main(*sys.argv[1:3])
