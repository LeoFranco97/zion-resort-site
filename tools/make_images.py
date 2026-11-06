# Paints every picture on the site from scratch (no photos). Run once: python3 tools/make_images.py
import cv2, numpy as np, os, math, random
OUT = 'public/img'
os.makedirs(OUT, exist_ok=True)

def rng(seed): return np.random.default_rng(seed)

def noise2(w, h, cells, seed):
    r = rng(seed)
    g = r.random((max(2, int(cells * h / w)) + 1, cells + 1)).astype(np.float32)
    return cv2.resize(g, (w, h), interpolation=cv2.INTER_CUBIC)

def fbm(w, h, cells, seed, oct=5):
    t = np.zeros((h, w), np.float32); a = 1; s = 0
    for i in range(oct):
        t += a * noise2(w, h, cells * 2 ** i, seed + i); s += a; a *= .5
    return t / s

def noise1(n, cells, seed, oct=6):
    t = np.zeros(n); a = 1; s = 0; r = rng(seed)
    for i in range(oct):
        k = cells * 2 ** i + 2
        p = r.random(k)
        t += a * np.interp(np.linspace(0, k - 1, n), np.arange(k), p); s += a; a *= .5
    return t / s

def col(h): h = h.lstrip('#'); return np.array([int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)], np.float32)

def vgrad(h, w, stops):
    ys = np.linspace(0, 1, h)
    c = np.stack([np.interp(ys, [s[0] for s in stops], [col(s[1])[i] for s in stops]) for i in range(3)], 1).astype(np.float32)
    return np.repeat(c[:, None, :], w, 1)

def sky(w, h, stops, sun=None, seed=1, clouds=.55, cloudcol='#f2dcc8'):
    im = vgrad(h, w, stops)
    if sun:
        yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
        d = np.sqrt((xx - sun[0] * w) ** 2 + (yy - sun[1] * h) ** 2) / w
        g = np.exp(-d * 5.5)[..., None]; core = np.exp(-(d * 34) ** 2)[..., None]
        im = im + g * col('#ffb56b') * .5 + core * col('#fff2d8')
    c = fbm(w, h, 5, seed, 6)
    c = np.clip((c - (.62 - clouds * .2)) * 5, 0, 1)
    c = cv2.GaussianBlur(c, (0, 0), 3)
    fade = np.clip(1.1 - np.linspace(0, 1, h) * 1.3, 0, 1)[:, None]
    a = (c * fade)[..., None] * .75
    return im * (1 - a) + col(cloudcol) * a

def ridge(im, base, amp, c, seed, cells=4, fog=None, fogh=.14):
    h, w, _ = im.shape
    n = noise1(w, cells, seed)
    y = (base + (n - .5) * 2 * amp) * h
    yy = np.arange(h, dtype=np.float32)[:, None]
    m = np.clip(yy - y[None, :].astype(np.float32), 0, 1.5) / 1.5
    d = np.clip((yy - y[None, :]) / (fogh * h), 0, 1).astype(np.float32)
    tex = fbm(w, h, 60, seed + 5, 4)[..., None]
    base_c = col(c) * (.82 + tex * .36)
    if fog is not None:
        t = (d ** .8)[..., None]
        base_c = base_c * (1 - t) + col(fog) * t
    a = m[..., None]
    return im * (1 - a) + base_c * a, y

def pine_pts(x, y, ht, r):
    w = ht * (.2 + r.random() * .06); pts = []; tiers = int(9 + r.random() * 4)
    L = [(x, y - ht)]; R = []
    for i in range(1, tiers + 1):
        t = i / tiers
        wi = w * t * (1 + .25 * r.random()); yi = y - ht + ht * t
        L.append((x - wi, yi)); L.append((x - wi * .55, yi - ht * .012))
        R.append((x + wi * .55, yi - ht * .012)); R.append((x + wi, yi))
    return np.array(L + [(x, y)] + R[::-1], np.int32)

def pines(im, baseline, hr, n, c, seed, light=None):
    h, w, _ = im.shape; r = rng(seed)
    a = np.zeros((h, w), np.float32); cc = np.zeros((h, w), np.float32)
    xs = r.random(n) * w
    order = np.argsort([baseline[min(w - 1, int(x))] for x in xs])
    for i in order:
        x = xs[i]; by = baseline[min(w - 1, int(x))] + r.random() * .02 * h
        ht = (hr[0] + r.random() * (hr[1] - hr[0])) * h
        p = pine_pts(x, by, ht, r)
        v = .75 + r.random() * .5
        cv2.fillPoly(cc, [p], float(v), lineType=cv2.LINE_AA)
        cv2.fillPoly(a, [p], 1., lineType=cv2.LINE_AA)
    ca = np.clip(a, 0, 1)[..., None]
    tone = col(c) * cc[..., None]
    t = fbm(w, h, 120, seed + 3, 3)[..., None]
    tone = tone * (.7 + t * .6)
    if light is not None:
        yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
        g = np.clip(1 - np.abs(xx / w - light) * 1.4, 0, 1)[..., None]
        tone = tone + g * col('#6b4a22') * .22
    return im * (1 - ca) + tone * ca

def block(im, x, y, w, h_, fl, bays, seed, wood='#3a2c20', lit=.45, fins=True):
    """One wing of the building: slatted timber face, glazed bays with warm light."""
    H, W, _ = im.shape; r = rng(seed)
    x, y, w, h_ = int(x), int(y), int(w), int(h_)
    x1 = min(W, x + w); y1 = min(H, y + h_)
    if x >= x1 or y >= y1 or x1 <= 0: return im
    x = max(0, x)
    face = col(wood)
    im[y:y1, x:x1] = face * (.72 + .28 * (np.linspace(.3, 1, x1 - x)[None, :, None]))
    fh = (y1 - y) / fl; bw = (x1 - x) / bays
    for f in range(fl):
        for b in range(bays):
            bx = int(x + b * bw + bw * .14); by = int(y + f * fh + fh * .16)
            bx2 = int(x + (b + 1) * bw - bw * .14); by2 = int(y + (f + 1) * fh - fh * .1)
            on = r.random() < lit
            glow = col('#f2b366') * (.65 + .35 * r.random()) if on else col('#1a1c20') + col('#3e4a54') * r.random() * .35
            im[by:by2, bx:bx2] = glow
            if on:
                im[by + (by2 - by) // 2:by2, bx:bx2] *= .75
            cv2.rectangle(im, (bx, by), (bx2, by2), tuple(float(v) for v in face * .5), max(1, int(bw * .02)))
            mid = (bx + bx2) // 2
            cv2.line(im, (mid, by), (mid, by2), tuple(float(v) for v in face * .5), max(1, int(bw * .018)))
            # balcony arc: the building's signature curved rail
            cv2.ellipse(im, (mid, by2), (int((bx2 - bx) * .52), int(fh * .3)), 0, 0, 180, tuple(float(v) for v in face * 1.25), max(1, int(fh * .06)), cv2.LINE_AA)
        sy = int(y + f * fh)
        im[sy:sy + max(2, int(fh * .07)), x:x1] = face * 1.6
    if fins:
        step = max(4, int(bw / 7))
        for fx in range(x, x1, step):
            im[y:y1, fx:fx + max(1, step // 3)] = im[y:y1, fx:fx + max(1, step // 3)] * .55 + face * .9 * .45
    return im

def foliage(im, x, y, w, h_, seed, c='#4a5a2e'):
    H, W, _ = im.shape; r = rng(seed)
    for i in range(int(w * max(h_, 12) / 60) + 4):
        px = int(x + r.random() * w); py = int(y + r.random() * h_)
        rad = int(2 + r.random() * min(h_ * .55, 13))
        if rad < 1: continue
        cv2.circle(im, (px, py), rad, tuple(float(v) for v in col(c) * (.6 + r.random() * .7)), -1, cv2.LINE_AA)
    return im

def stone_base(im, x, y, w, h_, n, seed):
    H, W, _ = im.shape; r = rng(seed)
    x, y, w, h_ = int(x), int(y), int(w), int(h_)
    x1 = min(W, x + w); y1 = min(H, y + h_)
    t = fbm(W, H, 90, seed, 3)
    im[y:y1, x:x1] = (col('#4b453d') * (.6 + .7 * t[y:y1, x:x1, None]))
    for i in range(n):
        cx = int(x + (i + .5) * w / n); aw = int(w / n * .3); top = int(y + h_ * .22)
        cv2.rectangle(im, (cx - aw, top + aw), (cx + aw, y1), tuple(float(v) for v in col('#e9a95c')), -1)
        cv2.ellipse(im, (cx, top + aw), (aw, aw), 0, 180, 360, tuple(float(v) for v in col('#f4c07b')), -1, cv2.LINE_AA)
        cv2.line(im, (cx, top), (cx, y1), tuple(float(v) for v in col('#3a2c20')), 2)
    return im

def finish(im, grain=.018, vign=.3, blur=.7, seed=9):
    h, w, _ = im.shape
    im = cv2.GaussianBlur(np.clip(im, 0, 1.5).astype(np.float32), (0, 0), blur)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    d = np.sqrt(((xx - w / 2) / w) ** 2 + ((yy - h / 2) / h) ** 2)
    im = im * (1 - np.clip(d - .3, 0, 1)[..., None] * vign)
    im = im + rng(seed).normal(0, grain, (h, w, 1)).astype(np.float32)
    return np.clip(im, 0, 1)

def save(name, im, q=80):
    if im.shape[2] == 4:
        b = np.concatenate([im[..., 2::-1], im[..., 3:]], 2)
    else:
        b = im[..., ::-1]
    cv2.imwrite(f'{OUT}/{name}.webp', (np.clip(b, 0, 1) * 255).astype(np.uint8), [cv2.IMWRITE_WEBP_QUALITY, q])

def landscape(w, h, seed, sun=(.82, .46), base=.5, stops=None, autumn=False, trees=True):
    im = sky(w, h, stops or [(0, '#7f93ad'), (.35, '#c3c6cf'), (.52, '#f0d6bb'), (.68, '#e8ae80')], sun=sun, seed=seed)
    im = im.astype(np.float32)
    im, _ = ridge(im, base + .04, .09, '#8a8fa0', seed + 1, 3, fog='#e6c8ae')
    im, _ = ridge(im, base + .1, .1, '#5e6a70', seed + 2, 4, fog='#d7c0ad')
    im, y3 = ridge(im, base + .16, .1, '#3d4a42', seed + 3, 5, fog='#a9a79a')
    if trees:
        im = pines(im, y3 + .05 * h, (.04, .08), int(w / 7), '#26332a', seed + 4)
    im, y4 = ridge(im, base + .26, .06, '#222c23', seed + 5, 5, fog='#5a6250', fogh=.1)
    if trees:
        im = pines(im, y4 + .05 * h, (.08, .15), int(w / 16), '#1c2720' if not autumn else '#5d3f1c', seed + 6, light=sun[0])
        for k, dy in enumerate((.12, .2, .3, .42)):
            b = y4 + dy * h
            if b.min() > h * 1.2: break
            im[int(b.mean() + .02 * h):] = im[int(b.mean() + .02 * h):] * .0 + col('#141b16')
            im = pines(im, b + .05 * h, (.1 + k * .03, .17 + k * .04), int(w / (18 + k * 8)), '#1a2419', seed + 8 + k, light=sun[0])
    return im

def hero(w, h, aerial=False):
    im = landscape(w, h, 11 if not aerial else 21, base=.42 if not aerial else .3, sun=(.86, .47) if not aerial else (.92, .2))
    s = w / 1920
    if not aerial:
        # left wing, stepping down to the right, and an offset terraced wing
        bl = 760 * s
        stone_base(im, 130 * s, 960 * s, 1100 * s, 110 * s, 13, 3)
        for x, top, wd, fl, b in [(165, 450, 400, 9, 3), (565, 545, 190, 8, 2), (755, 660, 90, 7, 1), (845, 660, 170, 6, 2), (1015, 755, 170, 5, 2)]:
            block(im, x * s, top * s, wd * s, (960 - top) * s, fl, b, int(x))
            foliage(im, x * s, (top - 8) * s, wd * s, 12 * s, int(x) + 1)
        stone_base(im, 1200 * s, 855 * s, 500 * s, 140 * s, 5, 4)
        for x, top, wd, fl, b in [(1180, 545, 170, 6, 2), (1270, 545, 180, 6, 2), (1450, 595, 130, 5, 1), (1520, 670, 170, 4, 2)]:
            block(im, x * s, top * s, wd * s, (855 - top) * s, fl, b, int(x) + 7, wood='#4a3a2b')
            foliage(im, x * s, (top - 8) * s, wd * s, 12 * s, int(x) + 2)
        # pool and terrace
        cv2.fillPoly(im, [np.array([[1140 * s, 970 * s], [1380 * s, 970 * s], [1400 * s, 1012 * s], [1120 * s, 1012 * s]], np.int32)], tuple(float(v) for v in col('#4a8fd0')), cv2.LINE_AA)
        im[int(1012 * s):, :] *= 1
    else:
        for x, top, wd, fl, b, wood in [(230, 300, 330, 11, 4, '#3a2c20'), (560, 430, 220, 10, 3, '#34281e'), (780, 560, 260, 8, 4, '#3f3024'), (1040, 340, 300, 9, 4, '#463729'), (1340, 470, 230, 8, 3, '#3a2c20')]:
            block(im, x * s, top * s, wd * s, (1110 - top) * s, fl, b, x + 3, lit=.35)
            foliage(im, x * s, (top - 14) * s, wd * s, 18 * s, x + 4)
        cv2.fillPoly(im, [np.array([[1180 * s, 1120 * s], [1330 * s, 1100 * s], [1420 * s, 1190 * s], [1250 * s, 1200 * s]], np.int32)], tuple(float(v) for v in col('#4d7ea8')), cv2.LINE_AA)
    # foreground pines framing, dark forest at the foot
    base = np.full(w, h * 1.03) - noise1(w, 4, 5) * h * .05
    im = pines(im, base, (.14, .26), 26, '#141a15', 77, light=.8)
    g = np.clip((np.linspace(0, 1, h) - .72) / .28, 0, 1)[:, None, None]
    im = im * (1 - g * .92)
    return finish(im, blur=1.0 * s)

def aerial_cutout(w, h):
    """Terraced roofs seen from above, with a clear sky so the page colour shows behind."""
    im = np.zeros((h, w, 3), np.float32) + col('#23221d')
    a = np.zeros((h, w), np.float32)
    def mass(pts): cv2.fillPoly(a, [np.array(pts, np.int32)], 1., cv2.LINE_AA)
    s = w / 1920
    L = [(0, 200), (280, 190), (330, 280), (610, 290), (660, 420), (820, 560), (980, 590), (1120, 500), (1240, 420), (1520, 330), (1660, 240), (1920, 215), (1920, 1100), (0, 1100)]
    mass([(x * s, y * s) for x, y in L])
    r = rng(5)
    for i, (x, y, wd, ht) in enumerate([(0, 210, 320, 150), (0, 360, 420, 140), (0, 500, 560, 170), (120, 660, 640, 180), (360, 300, 280, 120), (1660, 240, 260, 120), (1460, 340, 460, 150), (1280, 470, 640, 170), (1080, 620, 840, 200), (740, 610, 340, 240)]):
        block(im, x * s, y * s, wd * s, ht * s, 3, 5 + i % 3, 40 + i, wood='#3b3a33', lit=.22, fins=i % 2 == 1)
        im[int(y * s):int((y + 12) * s), int(x * s):int((x + wd) * s)] = col('#77736a')
        foliage(im, x * s, (y - 10) * s, wd * s, 24 * s, 80 + i, '#5d6f35')
    foliage(im, 40 * s, 860 * s, 1840 * s, 200 * s, 3, '#3f4f2a')
    im = cv2.GaussianBlur(im, (0, 0), 1.1)
    t = fbm(w, h, 200, 8, 3)[..., None]; im = im * (.75 + .5 * t)
    out = np.concatenate([np.clip(im, 0, 1), cv2.GaussianBlur(a, (0, 0), 1)[..., None]], 2)
    return out

def river(w, h):
    im = sky(w, h, [(0, '#6e9ad0'), (.4, '#cfd8ea')], seed=33, clouds=.8, cloudcol='#ffffff').astype(np.float32)
    im, y = ridge(im, .5, .06, '#3f6a3a', 34, 4)
    base = np.linspace(.46, .68, w) * h
    im = pines(im, base + .02 * h, (.2, .34), 40, '#46682e', 35, light=.3)
    r = rng(36)
    for i in range(70):
        x, yy = r.random() * w, h * (.38 + r.random() * .22)
        cv2.circle(im, (int(x), int(yy)), int(r.random() * w * .05 + 6), tuple(float(v) for v in col(['#c47f24', '#d9a032', '#7f8a2c'][i % 3]) * (.7 + r.random() * .5)), -1, cv2.LINE_AA)
    wy = int(h * .6); im[wy:] = col('#47696a')
    t = fbm(w, h - wy, 16, 37, 5)
    im[wy:] = im[wy:] * .6 + (np.clip(t, 0, 1)[..., None] * col('#f4f7f4')) * .55
    for i in range(46):
        x, yy = r.random() * w, h * (.66 + r.random() * .36)
        ax, ay = int(r.random() * w * .16 + 20), int(r.random() * h * .05 + 12)
        cv2.ellipse(im, (int(x), int(yy)), (ax, ay), r.random() * 30 - 15, 0, 360, tuple(float(v) for v in col('#6a6058') * (.65 + r.random() * .6)), -1, cv2.LINE_AA)
    return finish(im, blur=1)

def room(w, h, seed, wall='#d9c6ad', floor='#6e5238', arch=True, accent='#b5642f', mood=1.0, window=.5):
    r = rng(seed)
    im = vgrad(h, w, [(0, wall), (1, '#8b7458')]) * mood
    fy = int(h * .74)
    im[fy:] = vgrad(h - fy, w, [(0, floor), (1, '#2a2118')])
    # a tall window onto the forest
    ww, wh = int(w * .52), int(h * .56)
    wx = int(w * window - ww / 2); wy = fy - wh
    scene = landscape(ww, wh + ww // 2, seed + 50, sun=(.3, .35), base=.2, stops=[(0, '#dfe4dc'), (1, '#f3ead6')])
    mask = np.zeros((wh + ww // 2, ww), np.float32)
    if arch:
        cv2.rectangle(mask, (0, ww // 2), (ww, wh + ww // 2), 1., -1)
        cv2.ellipse(mask, (ww // 2, ww // 2), (ww // 2, ww // 2), 0, 180, 360, 1., -1, cv2.LINE_AA)
        top = wy - ww // 2
    else:
        mask[ww // 2:] = 1; top = wy - ww // 2
    y0 = max(0, top); sc = scene[y0 - top:]; mk = mask[y0 - top:]
    hh = min(sc.shape[0], fy - y0); sc = sc[:hh]; mk = mk[:hh, ..., None]
    im[y0:y0 + hh, wx:wx + ww] = im[y0:y0 + hh, wx:wx + ww] * (1 - mk) + sc * mk
    for i in range(1, 4):
        lx = wx + ww * i // 4; im[y0:fy, lx - 2:lx + 2] = im[y0:fy, lx - 2:lx + 2] * .2
    im[fy - 8:fy] = col('#2c2118')
    # furniture
    sx, sy = int(w * .08), int(fy - h * .02)
    cv2.rectangle(im, (sx, sy), (int(w * .62), int(h * .9)), tuple(float(v) for v in col('#d8ccb8') * mood), -1)
    cv2.rectangle(im, (sx, int(sy + h * .05)), (int(w * .62), int(h * .9)), tuple(float(v) for v in col('#b9ab96') * mood), -1)
    cv2.circle(im, (int(w * .76), int(h * .84)), int(w * .1), tuple(float(v) for v in col(accent)), -1, cv2.LINE_AA)
    cv2.rectangle(im, (int(w * .7), int(h * .84)), (int(w * .82), int(h * .99)), tuple(float(v) for v in col(accent) * .7), -1)
    # warm cove light
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    g = np.exp(-(((yy / h - .2) / .35) ** 2))[..., None]
    return finish(im + g * col('#ffcf8f') * .08, blur=1.2, seed=seed)

def fire(w, h):
    im = vgrad(h, w, [(0, '#07090f'), (.8, '#18110a'), (1, '#4a2d12')])
    r = rng(44)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    n = fbm(w, h, 8, 45, 5)
    shape = np.exp(-(((xx / w - .5) * (2.6 + (1 - yy / h) * 7)) ** 2)) * np.clip((yy / h - .22) * 1.8, 0, 1)
    f = np.clip(shape * (n * 2.2) - .35, 0, 1)[..., None]
    im = im + f * (col('#ff9a2e') + f * col('#ffe8b0'))
    for i in range(900):
        x = w * (.5 + r.normal() * .16); y = h * r.random() * .7
        cv2.circle(im, (int(x), int(y)), 1, tuple(float(v) for v in col('#ffb257') * r.random()), -1)
    return finish(im, blur=.9)

def rocks(w, h):
    im = landscape(w, h, 61, sun=(.2, .2), base=.1, stops=[(0, '#c3d4b6'), (1, '#eaf0d6')])
    r = rng(62)
    for i in range(60):
        x, y = r.random() * w, h * (.45 + r.random() * .6)
        c = col('#7e786e') * (.55 + r.random() * .7)
        cv2.ellipse(im, (int(x), int(y)), (int(w * (.08 + r.random() * .14)), int(h * (.04 + r.random() * .08))), r.random() * 60 - 30, 0, 360, tuple(float(v) for v in c), -1, cv2.LINE_AA)
    return finish(im, blur=1.1)

def field(w, h):
    im = vgrad(h, w, [(0, '#e4e7d8'), (.5, '#a6ba6e'), (1, '#2f3e1c')])
    n = fbm(w, h, 6, 71, 4)[..., None]
    im = cv2.GaussianBlur(im * (.7 + n * .6), (0, 0), 14)
    cv2.rectangle(im, (int(w * .34), int(h * .28)), (int(w * .96), int(h * .78)), (.25, .35, .14), -1)
    return finish(cv2.GaussianBlur(im, (0, 0), 7), blur=2)

def brand_card(w, h):
    im = vgrad(h, w, [(0, '#0d2a5c'), (.55, '#123f8c'), (1, '#071a3c')])
    import json
    return finish(im, grain=.03, blur=.6)

def courtyard(w, h):
    im = sky(w, h, [(0, '#c7ccc9'), (.5, '#ecebe2')], seed=81, clouds=.4, cloudcol='#ffffff').astype(np.float32)
    s = w / 1920
    block(im, 0, 0, 520 * s, 780 * s, 6, 3, 82, wood='#2a2620', lit=.1, fins=False)
    block(im, 1360 * s, 0, 560 * s, 860 * s, 6, 3, 83, wood='#2f2a22', lit=.3, fins=False)
    stone_base(im, 0, 780 * s, 520 * s, 240 * s, 3, 84)
    stone_base(im, 1360 * s, 860 * s, 560 * s, 240 * s, 4, 85)
    block(im, 380 * s, 400 * s, 1100 * s, 200 * s, 1, 16, 86, wood='#3a2c20', lit=.05)
    im[600 * int(s) if s >= 1 else int(600 * s):int(640 * s), int(380 * s):int(1480 * s)] = col('#1b1812')
    ground = int(1000 * s)
    im[ground:] = vgrad(h - ground, w, [(0, '#4f5d2c'), (1, '#1c2212')])
    foliage(im, 560 * s, 640 * s, 760 * s, 300 * s, 87, '#2d3a1f')
    return finish(im, blur=1)

def stripes_transition(w, h, seed, flip=False):
    """Fading comb edge between a dark and a light band, drawn fresh for this site."""
    im = np.zeros((h, w, 4), np.float32)
    n = noise1(w, 3, seed, 3); r = rng(seed + 1)
    step = 19
    im[..., :3] = col('#2c2824')
    for x in range(0, w, step):
        b = .2 + n[min(w - 1, x)] * .32
        L = int(h * (b + .3 + .12 * r.random()))
        w0 = 7.0
        top = int(h * b)
        im[:top, x:x + step, 3] = 1
        for y in range(top, L):
            t = (y - top) / max(1, L - top)
            hw = w0 * (1 - t) ** .75
            x0 = x + step / 2 - hw; x1 = x + step / 2 + hw
            xa, xb = int(max(0, x0)), int(min(w, x1 + 1))
            im[y, xa:xb, 3] = 1
        im[:int(h * .12), :, 3] = 1
    if flip: im = im[::-1]
    return im

if __name__ == '__main__':
    import sys
    only = set(sys.argv[1:])
    def want(n): return not only or n in only
    if want('hero'):
        save('hero-a', hero(1920, 1200)); save('hero-b', hero(1920, 1200, aerial=True))
        a = hero(1920, 1200)
        c = cv2.resize(a[:, 120:1020], (1100, 1467), interpolation=cv2.INTER_CUBIC)
        top = sky(1100, 2300, [(0, '#7f93ad'), (.4, '#c3c6cf'), (.62, '#f0d6bb')], sun=None, seed=12).astype(np.float32)
        t = np.clip(np.linspace(-.1, 1.1, 300), 0, 1)[:, None, None]
        y0 = 833
        top[y0:y0 + 300] = top[y0:y0 + 300] * (1 - t) + c[:300] * t
        top[y0 + 300:] = c[300:]
        save('hero-m', finish(top, blur=.8))
    if want('aerial'): save('aerial', aerial_cutout(1920, 1100), 82)
    if want('river'): save('river', river(800, 1066))
    if want('rooms'):
        ps = [dict(wall='#d9cdb6', floor='#7d6547', accent='#a87f50'), dict(wall='#c9b394', floor='#6b4d33', accent='#7d4b2b', arch=False, window=.55),
              dict(wall='#bfa98a', floor='#59432f', accent='#8d5f33', mood=.85, window=.42), dict(wall='#dcd2c0', floor='#8a7051', accent='#b5642f', arch=False),
              dict(wall='#a88f6e', floor='#4b3626', accent='#6a4a2d', mood=.8), dict(wall='#e3d9c9', floor='#93795a', accent='#c17a3e', window=.6)]
        for i, p in enumerate(ps): save(f'room-{i + 1}', room(960, 1200, 100 + i, **p))
    if want('misc'):
        save('fire', fire(800, 1066)); save('rocks', rocks(800, 1066)); save('field', field(800, 1066)); save('brand', brand_card(800, 1066))
        save('court', courtyard(1920, 1200))
        save('land-1', finish(landscape(1400, 900, 201, sun=(.2, .35), base=.3), blur=1))
        save('land-2', finish(landscape(1400, 900, 202, sun=(.5, .3), base=.34, stops=[(0, '#5d7a9c'), (.6, '#e3c9a4')]), blur=1))
        save('land-3', finish(landscape(1400, 900, 203, sun=(.8, .4), base=.38, stops=[(0, '#9bb0c4'), (.6, '#f2e6d2')]), blur=1))
        save('forest', finish(landscape(1600, 1500, 204, sun=(.35, .35), base=.5, stops=[(0, '#ccd2cc'), (.6, '#f4efe4')]), blur=1.2))
    if want('stripes'):
        for i, f in [(1, False), (2, True), (3, True), (4, False), (5, True)]:
            save(f'comb-{i}', stripes_transition(1920, 330, 300 + i, f), 90)
