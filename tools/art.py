# Готовит картинки для игры: оригиналы PNG из assets/art/** → уменьшенные WebP в assets/game/
# (оригиналы не трогаем, GDD §13). Запуск: python3 tools/art.py
import os, sys
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SIZE = {'hero': 512, 'ally': 512, 'pet': 384, 'enemy': 512, 'boss': 512, 'final': 640, 'vfx': 256, 'icon': 160, 'ui': 384, 'bg': 1080}
out = os.path.join(ROOT, 'assets', 'game'); os.makedirs(out, exist_ok=True)
for dp, _, fs in os.walk(os.path.join(ROOT, 'assets', 'art')):
    for f in sorted(fs):
        if not f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')): continue
        name = os.path.splitext(f)[0]; kind = name.split('_')[0]
        im = Image.open(os.path.join(dp, f)); im.load()
        side = SIZE.get(kind, 512)
        if kind == 'bg': im = im.convert('RGB'); im.thumbnail((side, side * 2))
        else: im = im.convert('RGBA'); im = im.resize((side, side * im.height // im.width), Image.LANCZOS)
        im.save(os.path.join(out, name + '.webp'), 'WEBP', quality=86, method=6)
        print(name, im.size, os.path.getsize(os.path.join(out, name + '.webp')) // 1024, 'KB')
