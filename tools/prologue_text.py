# Текст пролога, «нарисованный» в кадрах: прозрачные слои того же размера, что кадр.
# p2t.webp — «ПОБЕДА» по центру золотой плашки; p3t.webp — «Ты достоин. / Поднимись.» в перспективе окна Системы.
# Запуск: python3 tools/prologue_text.py  (из корня репозитория)
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageChops

SERIF = '/usr/share/fonts/truetype/dejavu/DejaVuSerifCondensed-Bold.ttf'
SANS = '/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf'
REF = 'docs/reference/prologue/'


def text_mask(size, lines, font_path, px, gap, track=0):
    """Маска текста по центру холста: lines — список строк, px — размер шрифта (или список)."""
    W, H = size
    m = Image.new('L', size, 0)
    d = ImageDraw.Draw(m)
    sizes = px if isinstance(px, list) else [px] * len(lines)
    fonts = [ImageFont.truetype(font_path, s) for s in sizes]
    rows = []
    for ln, f in zip(lines, fonts):
        widths = [d.textlength(ch, font=f) for ch in ln]
        w = sum(widths) + track * (len(ln) - 1)
        a, b = f.getbbox('ПЫД')[1], f.getbbox('ПЫД')[3]
        rows.append((ln, f, widths, w, a, b))
    total = sum(r[5] - r[4] for r in rows) + gap * (len(rows) - 1)
    y = (H - total) / 2
    for ln, f, widths, w, a, b in rows:
        x = (W - w) / 2
        for ch, cw in zip(ln, widths):
            d.text((x, y - a), ch, font=f, fill=255)
            x += cw + track
        y += (b - a) + gap
    return m


def colorize(mask, top, bottom):
    W, H = mask.size
    g = np.linspace(0, 1, H)[:, None, None]
    c = (np.array(top)[None, None, :] * (1 - g) + np.array(bottom)[None, None, :] * g)
    rgb = Image.fromarray(np.repeat(c, W, axis=1).astype('uint8'), 'RGB')
    out = rgb.convert('RGBA'); out.putalpha(mask)
    return out


def glow(mask, color, radius, strength=1.0):
    a = mask.filter(ImageFilter.GaussianBlur(radius)).point(lambda v: min(255, int(v * strength)))
    out = Image.new('RGBA', mask.size, color + (0,)); out.putalpha(a)
    return out


def outline(mask, r):
    return mask.filter(ImageFilter.MaxFilter(r * 2 + 1))


def persp_coeffs(dst_quad, src_size):
    """Коэффициенты PIL PERSPECTIVE: точка выхода → точка источника (прямоугольник src_size)."""
    W, H = src_size
    src = [(0, 0), (W, 0), (W, H), (0, H)]
    A, B = [], []
    for (x, y), (u, v) in zip(dst_quad, src):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); B.append(u)
        A.append([0, 0, 0, x, y, 1, -v * x, -v * y]); B.append(v)
    return np.linalg.solve(np.array(A, float), np.array(B, float)).tolist()


def victory():
    base = Image.open(REF + 'frame2.png')
    W, H = base.size
    # внутренняя тёмная часть плашки: x 370…795, y 672…752 (центр 582, 712)
    box = (425, 80); cx, cy = 582, 711
    S = 4   # рисуем крупно и уменьшаем — ровные края
    m = text_mask((box[0] * S, box[1] * S), ['ПОБЕДА'], SERIF, 50 * S, 0, track=7 * S)
    body = colorize(m, (255, 249, 220), (214, 140, 30))
    hi = colorize(m.filter(ImageFilter.GaussianBlur(S)).point(lambda v: 255 if v > 200 else 0), (255, 255, 255), (255, 230, 150))
    ol = outline(m, 2 * S)
    dark = Image.new('RGBA', m.size, (40, 18, 0, 0)); dark.putalpha(ol)
    shadow = Image.new('RGBA', m.size, (0, 0, 0, 0)); shadow.paste(dark, (0, 2 * S), dark)
    layer = Image.new('RGBA', m.size, (0, 0, 0, 0))
    for part in (glow(m, (255, 170, 40), 10 * S, 1.6), shadow, dark, body):
        layer = Image.alpha_composite(layer, part)
    hi.putalpha(ImageChops.multiply(hi.getchannel('A'), Image.new('L', m.size, 70)))
    layer = Image.alpha_composite(layer, hi)
    layer = layer.resize(box, Image.LANCZOS)
    out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    out.paste(layer, (cx - box[0] // 2, cy - box[1] // 2), layer)
    return out


def system():
    base = Image.open(REF + 'frame3.png')
    W, H = base.size
    # внутренность окна Системы (перспектива): TL, TR, BR, BL
    quad = [(272, 442), (843, 358), (843, 683), (257, 718)]
    S = 3; fw, fh = 600 * S, 330 * S
    m = text_mask((fw, fh), ['Ты достоин.', 'Поднимись.'], SANS, [58 * S, 76 * S], 26 * S, track=2 * S)
    body = colorize(m, (255, 246, 255), (214, 170, 255))
    layer = Image.new('RGBA', (fw, fh), (0, 0, 0, 0))
    for part in (glow(m, (150, 40, 255), 22 * S, 2.2), glow(m, (205, 120, 255), 6 * S, 1.6), body):
        layer = Image.alpha_composite(layer, part)
    # строки развёртки, как у экрана Системы
    sl = np.ones((fh, fw), float); sl[::4 * S, :] = 0.72; sl[1::4 * S, :] = 0.82
    a = np.array(layer.getchannel('A'), float) * sl
    layer.putalpha(Image.fromarray(a.clip(0, 255).astype('uint8')))
    q = [(x * S, y * S) for x, y in quad]
    big = layer.transform((W * S, H * S), Image.PERSPECTIVE, persp_coeffs(q, (fw, fh)), Image.BICUBIC)
    return big.resize((W, H), Image.LANCZOS)


if __name__ == '__main__':
    for name, fn in (('p2t', victory), ('p3t', system)):
        im = fn()
        im.save('assets/prologue/' + name + '.webp', 'WEBP', quality=90)
        prev = Image.alpha_composite(Image.open(REF + ('frame2.png' if name == 'p2t' else 'frame3.png')).convert('RGBA'), im)
        prev.save('/tmp/' + name + '_prev.png')
        print(name, im.size)
