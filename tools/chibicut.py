# Чиби-герой (docs/ART_HEROES_CHIBI.md): картинка на зелёном → assets/game/hero_<id>_side.webp (полный рост) и hero_<id>_avatar.webp (голова)
# python3 tools/chibicut.py <картинка> <id> [cx y0 size] — для широких (звери): центр головы по X, верх и сторона рамки аватара в долях ширины/высоты
import sys, shutil, numpy as np
from PIL import Image
sys.path.insert(0, 'tools')
from enemycut import key
src, hid = sys.argv[1], sys.argv[2]
shutil.copy(src, 'docs/reference/chibi/hero_' + hid + '.png')
a = key(np.array(Image.open(src).convert('RGB')))
ys, xs = np.where(a[..., 3] > 24); a = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
im = Image.fromarray(a, 'RGBA'); W, H = im.size
side = im.copy(); side.thumbnail((640, 640), Image.LANCZOS)
side.save('assets/game/hero_' + hid + '_side.webp', 'WEBP', quality=90, method=6)
# голова — верхние ~58% роста; центр по горизонтали — по «массе» верхней трети
top = a[:H // 3, :, 3] > 24; cols = np.where(top.any(0))[0]; cx = int((cols.min() + cols.max()) / 2) if len(cols) else W // 2
s = int(H * 0.58); y0 = 0
if len(sys.argv) > 5: cx, y0, s = int(W * float(sys.argv[3])), int(H * float(sys.argv[4])), int(H * float(sys.argv[5]))
x0 = max(0, min(W - s, cx - s // 2)) if s < W else 0
ava = Image.new('RGBA', (max(s, W) if s > W else s, s), (0, 0, 0, 0)); ava.paste(im.crop((x0, y0, x0 + min(s, W), y0 + s)), ((s - min(s, W)) // 2 if s > W else 0, 0))
ava = ava.resize((320, 320), Image.LANCZOS); ava.save('assets/game/hero_' + hid + '_avatar.webp', 'WEBP', quality=90, method=6)
print(hid, 'side', side.size, 'avatar', ava.size)
