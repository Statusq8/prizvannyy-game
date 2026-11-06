# Аватар героя (docs/ART_HEROES_CHIBI.md, промпт «Аватар»): картинка на зелёном → assets/game/hero_<id>_avatar.webp (320×320)
# python3 tools/avatarcut.py <картинка> <id>
import sys, shutil, numpy as np
from PIL import Image
sys.path.insert(0, 'tools')
from enemycut import key
src, hid = sys.argv[1], sys.argv[2]
shutil.copy(src, 'docs/reference/chibi/hero_' + hid + '_ava.png')
a = key(np.array(Image.open(src).convert('RGB')))
ys, xs = np.where(a[..., 3] > 24); a = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
im = Image.fromarray(a, 'RGBA'); W, H = im.size; S = max(W, H)
sq = Image.new('RGBA', (S, S), (0, 0, 0, 0)); sq.paste(im, ((S - W) // 2, S - H))   # по центру, низ (плечи) у нижнего края
sq.resize((320, 320), Image.LANCZOS).save('assets/game/hero_' + hid + '_avatar.webp', 'WEBP', quality=90, method=6)
print(hid, 'avatar 320x320')
