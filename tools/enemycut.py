# Нарезка листов анимации врагов (4 × 3 кадра на зелёном фоне) в ленты кадров.
# Ряд 1 — покой, ряд 2 — удар, ряд 3 — смерть. Зелёный фон → прозрачность (мягкий край + подавление зелёного ореола).
# Общая рамка на все 12 кадров листа: монстр не «прыгает» между кадрами.
# Запуск: python3 tools/enemycut.py <лист.png> <id> [высота кадра]
import json, sys
import numpy as np
from PIL import Image

COLS, ROWS = 4, 3


def key(rgb):
    a = rgb.astype(float)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    green = g - np.maximum(r, b)
    alpha = np.clip(1 - (green - 25) / 70, 0, 1)
    alpha[(g < 60)] = np.maximum(alpha[(g < 60)], 1)
    a[..., 1] = np.minimum(g, np.maximum(r, b) + 8)     # ореол: зелёный не выше соседних каналов
    return np.dstack([a, alpha * 255]).clip(0, 255).astype('uint8')


def main(src, eid, fh=320):
    im = np.array(Image.open(src).convert('RGB'))
    H, W = im.shape[:2]
    cw, ch = W / COLS, H / ROWS
    rgba = key(im)
    cells = []
    for r in range(ROWS):
        for c in range(COLS):
            x0, y0 = round(c * cw), round(r * ch)
            cells.append(rgba[y0:y0 + round(ch), x0:x0 + round(cw)])
    mh = min(x.shape[0] for x in cells); mw = min(x.shape[1] for x in cells)
    cells = [x[:mh, :mw] for x in cells]
    # убрать крошки у краёв ячеек (соседние кадры) — оставляем только то, что видно
    union = np.zeros((mh, mw), bool)
    for x in cells: union |= x[..., 3] > 40
    ys, xs = np.where(union)
    pad = 6
    y0, y1 = max(0, ys.min() - pad), min(mh, ys.max() + pad)
    x0, x1 = max(0, xs.min() - pad), min(mw, xs.max() + pad)
    frames = [Image.fromarray(x[y0:y1, x0:x1], 'RGBA') for x in cells]
    k = fh / frames[0].height
    fw = round(frames[0].width * k)
    frames = [f.resize((fw, fh), Image.LANCZOS) for f in frames]
    strip = Image.new('RGBA', (fw * len(frames), fh), (0, 0, 0, 0))
    for i, f in enumerate(frames): strip.paste(f, (i * fw, 0))
    strip.save('assets/enemies/' + eid + '.webp', 'WEBP', quality=88, method=6)
    # низ тела в покое (кадр 1): по нему ставим монстра на пол
    a = np.array(frames[0])[..., 3] > 60
    feet = int(np.where(a.any(1))[0].max()) if a.any() else fh
    meta = {'w': fw, 'h': fh, 'n': len(frames), 'feet': round(feet / fh, 3)}
    json.dump(meta, open('assets/enemies/' + eid + '.json', 'w'))
    print(eid, meta)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 320)
