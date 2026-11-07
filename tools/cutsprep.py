# Кат-сцены функций: картинки пользователя cut_<сцена>_<N>.png/jpg → assets/cuts/*.webp (ширина ≤ 1080).
# Запуск: python3 tools/cutsprep.py <папка или файлы>
import sys, os, glob
from PIL import Image
files = []
for a in sys.argv[1:]: files += sorted(glob.glob(os.path.join(a, '*'))) if os.path.isdir(a) else [a]
for f in files:
    n = os.path.splitext(os.path.basename(f))[0].lower()
    if not n.startswith('cut_'): continue
    im = Image.open(f).convert('RGB')
    if im.width > 1080: im = im.resize((1080, round(im.height * 1080 / im.width)), Image.LANCZOS)
    im.save('assets/cuts/' + n + '.webp', 'WEBP', quality=82, method=6); print(n, im.size)
