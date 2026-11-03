"""Нарезка листов 4×4 (2048×2048) в кадры игры.
Персонажи на сером фоне → прозрачность; одна общая рамка обрезки на весь лист, чтобы кадры не «прыгали».
Эффекты на чёрном фоне → остаются на чёрном (в игре накладываются режимом «экран», чёрное исчезает).
Запуск из корня проекта: python3 tools/cut_sheets.py
Вход: assets_src/heroes/<id>/<id>_{battle,menu,avatar,vfx}.png, assets_src/vfx/<id>/*.png
Выход: work/assets/heroes/<id>/{battle,menu,vfx,hit,crit}_NN.webp, avatar.webp"""
import os, glob, json
import numpy as np
from PIL import Image
from scipy import ndimage

SRC, OUT = 'assets_src', 'work/assets/heroes'

def cells(img, n=4):
    W, H = img.size
    return [img.crop((c * W // n, r * H // n, (c + 1) * W // n, (r + 1) * H // n)) for r in range(n) for c in range(n)]

def key_grey(cell):
    a = np.asarray(cell.convert('RGB')).astype(np.float32)
    h, w, _ = a.shape
    border = np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
    bg = np.median(border, axis=0)
    d = np.sqrt(((a - bg) ** 2).sum(-1))
    lab, _ = ndimage.label(d < 14)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bgm = np.isin(lab, list(edge))
    near = ndimage.binary_dilation(bgm, iterations=3) & ~bgm
    alpha = np.full((h, w), 255, np.float32); alpha[bgm] = 0
    alpha[near] = np.clip((d[near] - 8) / 36, 0, 1) * 255
    # тень на полу: серая, без цвета, чуть темнее фона, в нижней части кадра → полупрозрачная чёрная тень
    lum = a.mean(-1); chroma = a.max(-1) - a.min(-1); bgl = bg.mean()
    rows = np.arange(h)[:, None] * np.ones((1, w))
    sh = (~bgm) & (chroma < 12) & (lum > 62) & (lum < bgl + 4) & (rows > h * 0.55)
    sh = ndimage.binary_opening(sh, iterations=1)
    alpha[sh] = np.clip((bgl - lum[sh]) / bgl * 255 * 1.6, 0, 150)
    a[sh] = 0
    t = (alpha / 255)[..., None]
    rgb = np.where(t > 0.02, (a - bg * (1 - t)) / np.maximum(t, 0.02), 0)
    return Image.fromarray(np.dstack([np.clip(rgb, 0, 255), alpha]).astype(np.uint8), 'RGBA')

def union_bbox(frames, thr=24):
    box = None
    for f in frames:
        b = f.getchannel('A').point(lambda v: 255 if v > thr else 0).getbbox()
        if b: box = b if box is None else (min(box[0], b[0]), min(box[1], b[1]), max(box[2], b[2]), max(box[3], b[3]))
    return box

def black_bbox(frames, thr=18):
    box = None
    for f in frames:
        g = f.convert('L').point(lambda v: 255 if v > thr else 0).getbbox()
        if g: box = g if box is None else (min(box[0], g[0]), min(box[1], g[1]), max(box[2], g[2]), max(box[3], g[3]))
    return box

def save_frames(frames, outdir, name, height, q, pad=6):
    os.makedirs(outdir, exist_ok=True)
    size = 0; meta = None
    for i, f in enumerate(frames):
        s = height / f.height
        g = f.resize((max(1, round(f.width * s)), height), Image.LANCZOS)
        p = f'{outdir}/{name}_{i:02d}.webp'; g.save(p, 'WEBP', quality=q, method=6); size += os.path.getsize(p); meta = g.size
    return size, meta

report = {}
for d in sorted(glob.glob(f'{SRC}/heroes/*')):
    hid = os.path.basename(d); out = f'{OUT}/{hid}'; os.makedirs(out, exist_ok=True); report[hid] = {}
    for f in sorted(glob.glob(f'{d}/*.png')):
        kind = os.path.basename(f)[len(hid) + 1:-4]          # kaeron_battle.png → battle; summoned_base_battle → base_battle
        kind = kind.replace('base_', '')
        img = Image.open(f)
        if kind == 'avatar':
            a = img.convert('RGB'); a.thumbnail((320, 320), Image.LANCZOS)
            a.save(f'{out}/avatar.webp', 'WEBP', quality=78, method=6); report[hid]['avatar'] = os.path.getsize(f'{out}/avatar.webp'); continue
        cs = cells(img)
        if kind == 'vfx':
            box = black_bbox(cs); fr = [c.convert('RGB').crop(box) for c in cs]
            report[hid][kind] = save_frames(fr, out, 'vfx', 240, 62)
        else:
            ks = [key_grey(c) for c in cs]; box = union_bbox(ks)
            box = (max(0, box[0] - 6), max(0, box[1] - 6), box[2] + 6, box[3] + 6)
            fr = [k.crop(box) for k in ks]
            report[hid][kind] = save_frames(fr, out, kind, 420 if kind == 'battle' else 400, 74)
for d in sorted(glob.glob(f'{SRC}/vfx/*')):
    hid = os.path.basename(d); out = f'{OUT}/{hid}'
    for f in sorted(glob.glob(f'{d}/*.png')):
        kind = 'crit' if 'crit' in f else 'hit'
        cs = cells(Image.open(f)); box = black_bbox(cs)
        report.setdefault(hid, {})[kind] = save_frames([c.convert('RGB').crop(box) for c in cs], out, kind, 220, 60)
print(json.dumps(report, indent=1))
tot = sum(os.path.getsize(p) for p in glob.glob(f'{OUT}/*/*.webp')); print('ИТОГО КБ', tot // 1024)
