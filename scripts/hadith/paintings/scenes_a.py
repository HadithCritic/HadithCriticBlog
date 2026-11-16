"""Scenes 01-11 and the hero. Each takes a Guide and draws on it."""

import numpy as np

from kit import (C, mix, wheat_sheaf, pointed_arch, dome, skyline, palm, crescent, star, lantern,
                 vessel, bowl, cast_shadow)


def hero(g):
    """Dawn over the Euphrates at Kufa."""
    hz = 0.62
    sky = g.vgrad([(0, "night"), (0.38, "indigo"), (0.70, (0.40, 0.28, 0.34)),
                   (0.90, "amber"), (1.0, "pale_gold")], 0, hz)
    g.base(sky)
    clouds = np.clip((g.noise(4, 3) - 0.5) * 2.2, 0, 1) * np.clip((hz * 0.85 - g.Y) / 0.2, 0, 1)
    g.fill(clouds, mix("indigo", (0.50, 0.34, 0.40), 0.55), 0.55)
    g.glow(0.58, hz, 0.38, "amber", 0.5, 2.2)
    g.glow(0.58, hz, 0.07, "pale_gold", 0.8, 2)
    haze = mix("indigo", (0.50, 0.36, 0.40), 0.55)
    skyline(g, hz, haze, 0.21, 1.15, (0.0, 1.0))
    # a great mosque just right of the sun, the clearest form on the skyline
    m = g.poly(dome(0.70, hz - 0.045, 0.045, 0.075), 0.5)
    m = np.maximum(m, g.rect(0.64, hz - 0.05, 0.76, hz + 0.004, 0.5))
    for mx in (0.625, 0.775):
        m = np.maximum(m, g.rect(mx - 0.0065, hz - 0.20, mx + 0.0065, hz, 0.4))
        m = np.maximum(m, g.poly([(mx - 0.008, hz - 0.20), (mx, hz - 0.24), (mx + 0.008, hz - 0.20)], 0.4))
        m = np.maximum(m, g.rect(mx - 0.011, hz - 0.15, mx + 0.011, hz - 0.142, 0.4))
    g.fill(m, mix(haze, "night", 0.35))
    near = mix("night", "indigo", 0.35)
    skyline(g, hz + 0.004, near, 0.64, 1.0, (0.0, 0.30))
    skyline(g, hz + 0.004, near, 0.37, 0.9, (0.84, 1.0))
    # river: the sky mirrored, darkened and broken by ripples
    rows = np.arange(g.h)
    src = np.clip((2 * hz * g.h - rows).astype(int), 0, g.h - 1)
    refl = g.img[src]
    ripple = np.sin(g.Y * 260 + g.noise(30, 2) * 8) * 0.012
    shift = (ripple * g.w).astype(int)
    cols = np.clip(np.arange(g.w)[None, :] + shift, 0, g.w - 1)
    refl = refl[rows[:, None], cols]
    depth = np.clip((g.Y - hz) / (1 - hz), 0, 1)[..., None]
    water = refl * (0.62 - 0.35 * depth) + C("night") * (0.25 + 0.5 * depth)
    g.fill((g.Y > hz + 0.003).astype(np.float32), water)
    for i in range(60):
        y = hz + 0.01 + (i / 60) ** 1.4 * 0.3
        x = 0.58 + g.rng.uniform(-0.04, 0.04) * (1 + (y - hz) * 5)
        L = g.rng.uniform(0.01, 0.05) * (1 - (y - hz) * 1.5)
        g.fill(g.line([(x - L, y), (x + L, y)], 0.0025, 0.5), "pale_gold", 0.45 * (1 - (y - hz) * 2))
    # banks and date palms in silhouette
    xs = np.linspace(0, 0.34, 20)
    g.fill(g.poly([(x, 0.80 - 0.07 * np.clip(np.sin(np.pi * x / 0.34), 0, 1) ** 0.6 + 0.02 * x) for x in xs] + [(0.34, 1), (0, 1)], 1.2), "night")
    xs = np.linspace(0.78, 1.0, 14)
    g.fill(g.poly([(x, 0.81 - 0.08 * np.clip(np.sin(np.pi * (x - 0.78) / 0.44), 0, 1) ** 0.6) for x in xs] + [(1, 1), (0.78, 1)], 1.2), "night")
    pc = mix("night", "dark_umber", 0.4)
    palm(g, 0.05, 0.78, 0.50, 0.03, pc, 12, 0.06, 1)
    palm(g, 0.13, 0.76, 0.40, -0.02, pc, 11, 0.05, 2)
    palm(g, 0.22, 0.75, 0.30, 0.015, pc, 10, 0.042, 3)
    palm(g, 0.89, 0.76, 0.46, -0.025, pc, 12, 0.058, 4)
    palm(g, 0.97, 0.77, 0.36, 0.01, pc, 10, 0.048, 5)
    g.darken(np.clip((g.Y - 0.82) / 0.18, 0, 1), 0.5)


def faith(g):
    hz = 0.58
    g.base(g.vgrad([(0, "night"), (0.45, "indigo"), (0.8, (0.50, 0.36, 0.38)), (1, "amber")], 0, hz))
    g.glow(0.5, hz, 0.45, "amber", 0.35, 2)
    crescent(g, 0.62, 0.22, 0.075, "pale_gold", 0.42, -0.6)
    g.glow(0.62, 0.22, 0.22, "pale_gold", 0.18, 2.5)
    star(g, 0.36, 0.17, 0.008, "ivory")
    for i in range(18):
        x, y = g.rng.uniform(0.05, 0.95), g.rng.uniform(0.04, 0.35)
        g.fill(g.ellipse(x, y, 0.0025, 0.0025, 0, 0.2), "ivory", g.rng.uniform(0.3, 0.7))
    # distant minaret
    mx = 0.30
    g.fill(g.rect(mx - 0.008, hz - 0.13, mx + 0.008, hz, 0.4), mix("indigo", "night", 0.4))
    g.fill(g.poly([(mx - 0.01, hz - 0.13), (mx, hz - 0.165), (mx + 0.01, hz - 0.13)], 0.4), mix("indigo", "night", 0.4))
    g.fill(g.rect(mx - 0.015, hz - 0.1, mx + 0.015, hz - 0.095, 0.4), mix("indigo", "night", 0.4))
    # dunes
    for k, (y0, c, amp) in enumerate([(hz, mix("umber", "amber", 0.45), 0.03),
                                       (hz + 0.08, mix("umber", "ochre", 0.3), 0.05),
                                       (hz + 0.2, mix("dark_umber", "umber", 0.6), 0.06)]):
        xs = np.linspace(0, 1, 30)
        ys = y0 - amp * np.sin(xs * np.pi * (1.3 + k * 0.4) + k * 1.7) ** 2
        pts = list(zip(xs, ys)) + [(1, 1), (0, 1)]
        m = g.poly(pts, 1.2)
        g.fill(m, c)
        g.shade(m, (0.55, y0 - 0.1), 0.7, 0.5)
    g.darken(np.clip((g.Y - 0.72) / 0.28, 0, 1), 0.35)


def knowledge(g):
    g.base(g.vgrad([(0, (0.07, 0.05, 0.05)), (0.6, "umber"), (1, "dark_umber")]))
    g.glow(0.62, 0.38, 0.55, "amber", 0.35, 2)
    desk = g.poly([(0, 0.6), (1, 0.55), (1, 1), (0, 1)], 1)
    g.fill(desk, mix("umber", "vermilion", 0.15))
    g.texture(desk, 0.12, 50)
    g.shade(desk, (0.6, 0.55), 0.9, 0.7)
    # open manuscript
    left = g.poly([(0.15, 0.62), (0.47, 0.585), (0.48, 0.70), (0.13, 0.74)], 0.8)
    right = g.poly([(0.48, 0.585), (0.80, 0.60), (0.83, 0.72), (0.48, 0.70)], 0.8)
    g.fill(left, mix("ivory", "ochre", 0.25))
    g.fill(right, mix("ivory", "ochre", 0.15))
    g.shade(np.maximum(left, right), (0.62, 0.5), 0.8, 0.45)
    g.fill(g.line([(0.48, 0.585), (0.48, 0.70)], 0.006, 0.8), "umber", 0.5)
    for i in range(7):  # unreadable ruled marks, no lettering
        y = 0.615 + i * 0.012
        g.fill(g.line([(0.53, y), (0.77, y + 0.004)], 0.003, 1.2), "umber", 0.18)
    # inkwell
    vessel(g, 0.25, 0.60, 0.07, 0.07, mix("night", "teal", 0.4), (0.3, 0.5), 0.6, 0.65, 0.5)
    g.fill(g.line([(0.26, 0.54), (0.33, 0.40)], 0.006, 0.5), "ochre")
    # lamp
    lamp = g.poly([(0.62, 0.53), (0.78, 0.53), (0.84, 0.50), (0.74, 0.47), (0.64, 0.48)], 0.6)
    g.fill(lamp, "gold")
    g.shade(lamp, (0.66, 0.45), 0.2, 0.6)
    g.fill(g.ellipse(0.85, 0.465, 0.012, 0.03, 0, 0.6), "pale_gold")
    g.glow(0.85, 0.45, 0.2, "amber", 0.6, 2)
    g.glow(0.85, 0.46, 0.04, "pale_gold", 0.8, 2)
    g.darken(np.clip((g.Y - 0.76) / 0.24, 0, 1), 0.45)


def purifications(g):
    g.base(g.vgrad([(0, "deep_teal"), (0.5, "teal"), (1, "umber")]))
    tiles = g.noise(60, 1)
    wall = np.ones_like(g.X)
    g.texture(wall, 0.12, 60)
    opening = g.poly(pointed_arch(0.5, 0.14, 0.27, 0.32, 0.95), 0.8)
    g.fill(opening, g.vgrad([(0, (0.85, 0.82, 0.70)), (0.6, "ochre"), (1, "umber")], 0.14, 0.95))
    g.fill(g.ellipse(0.5, 0.55, 0.12, 0.12, 0, 6), "pale_gold", 0.4)
    # light shafts
    for x in (0.38, 0.48, 0.58):
        g.fill(g.poly([(x, 0.15), (x + 0.04, 0.15), (x + 0.12, 0.9), (x + 0.05, 0.9)], 6), "ivory", 0.18)
    # arch border tiles
    border = np.clip(g.poly(pointed_arch(0.5, 0.11, 0.31, 0.32, 0.95), 0.6) - opening, 0, 1)
    g.fill(border, mix("teal", "ivory", 0.25))
    g.texture(border, 0.3, 80)
    # basin and fountain
    floor = g.poly([(0, 0.8), (1, 0.8), (1, 1), (0, 1)], 1)
    g.fill(floor, mix("ivory", "umber", 0.45))
    g.shade(floor, (0.5, 0.75), 0.7, 0.6)
    g.fill(g.ellipse(0.5, 0.8, 0.24, 0.05, 0, 0.8), mix("ivory", "ochre", 0.3))
    g.fill(g.ellipse(0.5, 0.79, 0.20, 0.035, 0, 0.8), mix("teal", "ivory", 0.3))
    g.fill(g.rect(0.485, 0.62, 0.515, 0.79, 0.5), mix("ivory", "ochre", 0.3))
    g.fill(g.ellipse(0.5, 0.62, 0.07, 0.015, 0, 0.5), mix("ivory", "ochre", 0.2))
    for i in range(16):
        a = np.pi * (0.15 + 0.7 * i / 15)
        pts = [(0.5 + np.cos(a) * 0.08 * t, 0.6 - np.sin(a) * 0.08 * t * 1.3 + 0.12 * t * t) for t in np.linspace(0, 1, 8)]
        g.fill(g.line(pts, 0.004, 0.8), "ivory", 0.55)
    g.glow(0.5, 0.58, 0.15, "ivory", 0.25, 2)
    g.darken(np.clip((g.Y - 0.8) / 0.2, 0, 1), 0.35)


def prayer(g):
    g.base(g.vgrad([(0, (0.10, 0.07, 0.05)), (0.5, "umber"), (1, "dark_umber")]))
    g.texture(np.ones_like(g.X), 0.1, 40)
    niche = g.poly(pointed_arch(0.5, 0.12, 0.22, 0.30, 0.66), 0.8)
    g.fill(niche, g.vgrad([(0, "ochre"), (0.5, mix("umber", "amber", 0.6)), (1, "umber")], 0.12, 0.66))
    frame = np.clip(g.poly(pointed_arch(0.5, 0.08, 0.27, 0.30, 0.66), 0.6) - niche, 0, 1)
    g.fill(frame, mix("teal", "umber", 0.5))
    g.texture(frame, 0.35, 90)
    g.shade(niche, (0.5, 0.3), 0.3, 0.5)
    g.glow(0.5, 0.31, 0.35, "amber", 0.6, 2)
    lantern(g, 0.5, 0.22, 0.08, 0.13, mix("gold", "dark_umber", 0.55), "pale_gold")
    g.glow(0.5, 0.30, 0.03, "ivory", 0.5, 2)
    # rug in perspective
    rug = g.poly([(0.36, 0.66), (0.64, 0.66), (0.92, 1.0), (0.08, 1.0)], 0.6)
    g.fill(rug, "vermilion")
    inner = g.poly([(0.39, 0.68), (0.61, 0.68), (0.84, 0.98), (0.16, 0.98)], 0.6)
    g.fill(np.clip(rug - inner, 0, 1), mix("gold", "umber", 0.3))
    g.fill(g.poly(pointed_arch(0.5, 0.70, 0.07, 0.75, 0.86), 0.8), mix("vermilion", "night", 0.45))
    g.texture(rug, 0.2, 70)
    g.shade(rug, (0.5, 0.6), 0.5, 0.55)
    floor = np.clip(g.rect(0, 0.66, 1, 1, 0.6) - rug, 0, 1)
    g.fill(floor, mix("umber", "dark_umber", 0.5))


def zakah(g):
    g.base(g.vgrad([(0, mix("amber", "umber", 0.3)), (0.55, "ochre"), (1, "umber")]))
    g.glow(0.75, 0.15, 0.6, "pale_gold", 0.45, 2)
    for cx in (0.18, 0.34):
        wheat_sheaf(g, cx, 0.72, 0.28, 0.16, mix("ochre", "umber", 0.25), "gold", 44)
    wheat_sheaf(g, 0.86, 0.72, 0.32, 0.14, mix("ochre", "umber", 0.3), "gold", 36)
    table = g.poly([(0, 0.70), (1, 0.68), (1, 1), (0, 1)], 1)
    g.fill(table, mix("umber", "dark_umber", 0.3))
    g.texture(table, 0.12, 50)
    # scale pan with coins
    g.fill(g.rect(0.672, 0.30, 0.682, 0.70, 0.4), "umber")
    g.fill(g.line([(0.58, 0.32), (0.69, 0.32)], 0.007, 0.4), "umber")
    g.fill(g.ellipse(0.677, 0.70, 0.04, 0.008, 0, 0.4), "umber")
    for dx in (-0.05, 0.05):
        g.fill(g.line([(0.58, 0.32), (0.58 + dx, 0.58)], 0.002, 0.4), "umber", 0.8)
    bowl(g, 0.58, 0.60, 0.16, 0.04, "gold", mix("gold", "umber", 0.3), (0.5, 0.5))
    for i in range(7):
        g.fill(g.ellipse(0.53 + i * 0.016, 0.598 - (i % 2) * 0.005, 0.012, 0.004, 0, 0.3), "pale_gold")
    # cloth purse
    purse = g.poly([(0.40, 0.74), (0.52, 0.74), (0.55, 0.70), (0.50, 0.64), (0.46, 0.62), (0.42, 0.64), (0.37, 0.70)], 0.8)
    g.fill(purse, mix("vermilion", "umber", 0.4))
    g.shade(purse, (0.45, 0.6), 0.15, 0.6)
    for i in range(5):
        g.fill(g.ellipse(0.58 + i * 0.03, 0.745 + (i % 2) * 0.006, 0.012, 0.004, 0, 0.3), "gold")
    g.darken(np.clip((g.Y - 0.78) / 0.22, 0, 1), 0.4)


def fasting(g):
    hz = 0.55
    g.base(g.vgrad([(0, "night"), (0.4, "indigo"), (0.8, (0.62, 0.38, 0.32)), (1, "amber")], 0, hz))
    crescent(g, 0.66, 0.2, 0.05, "pale_gold", 0.18, -0.9)
    g.glow(0.66, 0.2, 0.15, "pale_gold", 0.12, 2)
    star(g, 0.30, 0.13, 0.006, "ivory")
    ground = g.rect(0, hz - 0.01, 1, 1, 1)
    g.fill(ground, mix("night", "umber", 0.4))
    pc = mix("night", "dark_umber", 0.3)
    for i, (x, h, lean) in enumerate([(0.12, 0.30, 0.02), (0.24, 0.24, -0.02), (0.82, 0.32, -0.03), (0.93, 0.22, 0.01)]):
        palm(g, x, hz, h, lean, pc, 10, 0.07, 10 + i)
    # sill with dates and water
    sill = g.poly([(0, 0.70), (1, 0.70), (1, 1), (0, 1)], 0.8)
    g.fill(sill, mix("umber", "dark_umber", 0.2))
    g.texture(sill, 0.15, 50)
    g.glow(0.45, 0.70, 0.35, "amber", 0.18, 2)
    bowl(g, 0.40, 0.72, 0.26, 0.07, mix("umber", "ochre", 0.3), mix("umber", "night", 0.4), (0.35, 0.6))
    for i in range(14):
        x = 0.30 + (i % 7) * 0.03 + g.rng.uniform(-0.005, 0.005)
        y = 0.715 - (i // 7) * 0.012
        g.fill(g.ellipse(x, y, 0.013, 0.008, g.rng.uniform(-30, 30), 0.3), mix("vermilion", "umber", 0.55))
        g.fill(g.ellipse(x - 0.004, y - 0.003, 0.004, 0.002, 0, 0.3), "amber", 0.5)
    glass = g.poly([(0.64, 0.58), (0.72, 0.58), (0.715, 0.73), (0.645, 0.73)], 0.5)
    g.fill(glass, mix("teal", "ivory", 0.35), 0.45)
    g.fill(g.line([(0.648, 0.60), (0.652, 0.72)], 0.004, 0.3), "ivory", 0.7)
    g.fill(g.ellipse(0.68, 0.62, 0.035, 0.006, 0, 0.4), "ivory", 0.4)
    g.darken(np.clip((g.Y - 0.8) / 0.2, 0, 1), 0.4)


def hajj(g):
    hz = 0.48
    g.base(g.vgrad([(0, mix("indigo", "night", 0.2)), (0.5, (0.55, 0.40, 0.45)), (0.85, "amber"), (1, "pale_gold")], 0, hz))
    g.glow(0.55, hz, 0.4, "amber", 0.45, 2)
    g.glow(0.55, hz - 0.01, 0.06, "pale_gold", 0.9, 2)
    for k, (amp, c) in enumerate([(0.12, mix("indigo", (0.55, 0.40, 0.45), 0.6)), (0.07, mix("indigo", "umber", 0.5))]):
        xs = np.linspace(0, 1, 40)
        ys = hz + 0.005 * k - amp * (0.5 + 0.5 * np.sin(xs * 9 + k * 2.3) * np.cos(xs * 3.1)) ** 2
        g.fill(g.poly(list(zip(xs, ys)) + [(1, 1), (0, 1)], 1.0), c)
    plain = g.vgrad([(0, mix("ochre", "umber", 0.3)), (1, "umber")], hz, 1)
    g.fill(g.rect(0, hz, 1, 1, 0.8), plain)
    # road converging to the sun
    road = g.poly([(0.53, hz + 0.005), (0.57, hz + 0.005), (0.80, 1), (0.30, 1)], 0.8)
    g.fill(road, mix("ochre", "pale_gold", 0.35))
    g.shade(road, (0.55, hz), 0.6, 0.5)
    # tents: rows of small white pyramids receding
    for row in range(10):
        y = hz + 0.02 + (row / 10) ** 1.6 * 0.38
        s = 0.006 + 0.03 * (row / 10) ** 1.6
        x = 0.0
        while x < 1.0:
            if abs(x - (0.55 + (y - hz) * 0.25 * (1 if x > 0.55 else -1) * 2)) > s * 2 and not (0.3 + (1 - (y - hz) / 0.52) * 0.23 < x < 0.8 - (1 - (y - hz) / 0.52) * 0.23):
                tent = g.poly([(x, y), (x + s, y - s * 0.9 * g.w / g.h), (x + 2 * s, y)], 0.4)
                g.fill(tent, mix("ivory", "ochre", 0.25))
                g.fill(g.poly([(x + s, y - s * 0.9 * g.w / g.h), (x + 2 * s, y), (x + s, y)], 0.4), mix("ochre", "umber", 0.4), 0.6)
            x += 2 * s * g.rng.uniform(1.15, 1.6)
    g.darken(np.clip((g.Y - 0.8) / 0.2, 0, 1), 0.4)


def marriage(g):
    g.base(g.vgrad([(0, mix("umber", "night", 0.3)), (0.6, "umber"), (1, "dark_umber")]))
    g.glow(0.5, 0.35, 0.6, "amber", 0.3, 2)
    for side, lx in ((-1, 0.25), (1, 0.75)):
        g.glow(lx, 0.17, 0.25, "amber", 0.5, 2)
        lantern(g, lx, 0.10, 0.07, 0.11, mix("gold", "dark_umber", 0.5), "pale_gold")
    # two branches crossing
    jas = [(0.10, 0.85), (0.3, 0.6), (0.5, 0.45), (0.72, 0.30), (0.9, 0.25)]
    oli = [(0.90, 0.85), (0.7, 0.62), (0.5, 0.47), (0.30, 0.33), (0.12, 0.28)]
    g.fill(g.line(jas, 0.012, 0.6), mix("umber", "olive", 0.4))
    g.fill(g.line(oli, 0.012, 0.6), mix("umber", "olive", 0.6))
    for i in range(1, 30):
        t = i / 30
        for path, kind in ((jas, "j"), (oli, "o")):
            idx = t * (len(path) - 1)
            a, b = path[int(idx)], path[min(len(path) - 1, int(idx) + 1)]
            f = idx - int(idx)
            x, y = a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f
            off = g.rng.uniform(-0.05, 0.05)
            if kind == "o":
                g.fill(g.ellipse(x + off, y + g.rng.uniform(-0.03, 0.03), 0.028, 0.008, g.rng.uniform(0, 180), 0.4), "sage")
            else:
                g.fill(g.ellipse(x + off, y + g.rng.uniform(-0.03, 0.03), 0.02, 0.01, g.rng.uniform(0, 180), 0.4), "olive")
                if i % 2 == 0:
                    g.fill(g.ellipse(x + off * 0.5, y - 0.02, 0.009, 0.009, 0, 0.3), "ivory")
    # pomegranate
    pm = g.ellipse(0.5, 0.66, 0.09, 0.09, 0, 0.6)
    g.fill(pm, "vermilion")
    g.shade(pm, (0.46, 0.60), 0.16, 0.7)
    g.fill(g.poly([(0.48, 0.585), (0.5, 0.56), (0.52, 0.585)], 0.4), mix("vermilion", "umber", 0.4))
    g.glow(0.47, 0.62, 0.04, "pale_gold", 0.3, 2)
    cast_shadow(g, 0.52, 0.745, 0.12, 0.012, 0.5)
    g.darken(np.clip((g.Y - 0.78) / 0.22, 0, 1), 0.4)


def istibra(g):
    g.base(g.vgrad([(0, "night"), (0.5, "indigo"), (1, mix("indigo", "umber", 0.5))]))
    moon = g.ellipse(0.5, 0.2, 0.07, 0.07, 0, 0.5)
    g.fill(moon, "ivory")
    g.darken(g.ellipse(0.47, 0.2, 0.065, 0.075, 0, 1.5) * moon, 0.65)  # waxing gibbous shadow
    g.glow(0.5, 0.2, 0.3, (0.6, 0.65, 0.8), 0.18, 2)
    # courtyard walls in moonlight
    g.fill(g.poly([(0, 0.32), (0.18, 0.36), (0.18, 0.75), (0, 0.85)], 0.6), mix("indigo", "night", 0.3))
    g.fill(g.poly([(1, 0.32), (0.82, 0.36), (0.82, 0.75), (1, 0.85)], 0.6), mix("indigo", "night", 0.3))
    back = g.rect(0.18, 0.36, 0.82, 0.62, 0.6)
    g.fill(back, mix("indigo", (0.5, 0.52, 0.62), 0.25))
    for x in (0.3, 0.5, 0.7):
        g.fill(g.poly(pointed_arch(x, 0.42, 0.06, 0.48, 0.62), 0.6), mix("night", "indigo", 0.4))
    floor = g.poly([(0.18, 0.62), (0.82, 0.62), (1, 0.85), (1, 1), (0, 1), (0, 0.85)], 0.8)
    g.fill(floor, mix("indigo", (0.45, 0.48, 0.58), 0.3))
    g.shade(floor, (0.5, 0.6), 0.6, 0.6)
    # ledge with hourglass
    g.fill(g.rect(0.3, 0.70, 0.7, 0.76, 0.5), mix("indigo", "ivory", 0.25))
    hg = g.poly([(0.46, 0.54), (0.54, 0.54), (0.505, 0.62), (0.54, 0.70), (0.46, 0.70), (0.495, 0.62)], 0.4)
    g.fill(hg, mix("ivory", "teal", 0.25), 0.5)
    g.fill(g.poly([(0.47, 0.70), (0.53, 0.70), (0.5, 0.66)], 0.4), "ochre")
    g.fill(g.poly([(0.475, 0.56), (0.525, 0.56), (0.5, 0.605)], 0.4), "ochre")
    g.fill(g.rect(0.445, 0.535, 0.555, 0.545, 0.4), "umber")
    g.fill(g.rect(0.445, 0.70, 0.555, 0.71, 0.4), "umber")
    g.glow(0.5, 0.62, 0.15, (0.6, 0.65, 0.8), 0.15, 2)
    g.darken(np.clip((g.Y - 0.8) / 0.2, 0, 1), 0.4)


def nursing(g):
    g.base(g.vgrad([(0, mix("umber", "indigo", 0.4)), (1, "dark_umber")]))
    win = g.rect(0.18, 0.08, 0.82, 0.60, 0.8)
    g.fill(win, g.vgrad([(0, (0.55, 0.58, 0.70)), (0.6, (0.92, 0.78, 0.60)), (1, "amber")], 0.08, 0.6))
    g.fill(g.ellipse(0.62, 0.48, 0.10, 0.10, 0, 4), "pale_gold", 0.6)
    for x in (0.5,):
        g.fill(g.rect(x - 0.008, 0.08, x + 0.008, 0.6, 0.4), mix("umber", "night", 0.3))
    g.fill(g.rect(0.18, 0.33, 0.82, 0.345, 0.4), mix("umber", "night", 0.3))
    sill = g.poly([(0.08, 0.60), (0.92, 0.60), (1, 0.70), (0, 0.70)], 0.6)
    g.fill(sill, mix("ivory", "umber", 0.4))
    g.fill(g.rect(0, 0.70, 1, 1, 0.6), mix("umber", "dark_umber", 0.4))
    g.glow(0.6, 0.6, 0.4, "amber", 0.2, 2)
    vessel(g, 0.38, 0.655, 0.16, 0.22, mix("vermilion", "ochre", 0.45), (0.5, 0.5), 0.45, 0.55, 0.55)
    g.fill(g.line([(0.46, 0.50), (0.49, 0.53), (0.48, 0.59), (0.455, 0.60)], 0.007, 0.4), mix("vermilion", "umber", 0.5))
    bowl(g, 0.63, 0.635, 0.13, 0.03, mix("ivory", "ochre", 0.3), (0.96, 0.94, 0.88), (0.65, 0.5))
    cast_shadow(g, 0.34, 0.66, 0.1, 0.01, 0.4)
    g.darken(np.clip((g.Y - 0.74) / 0.26, 0, 1), 0.4)


def divorce(g):
    hz = 0.42
    g.base(g.vgrad([(0, mix("indigo", "night", 0.3)), (0.6, (0.55, 0.36, 0.36)), (1, "amber")], 0, hz))
    g.glow(0.5, hz, 0.4, "amber", 0.35, 2)
    land = g.vgrad([(0, mix("umber", "olive", 0.3)), (1, "dark_umber")], hz, 1)
    g.fill(g.rect(0, hz, 1, 1, 0.8), land)
    # two diverging roads
    g.fill(g.poly([(0.47, 1), (0.60, 1), (0.53, 0.66), (0.51, 0.66)], 0.6), mix("ochre", "umber", 0.3))
    g.fill(g.poly([(0.51, 0.67), (0.53, 0.67), (0.30, hz + 0.01), (0.29, hz + 0.01)], 0.6), mix("ochre", "umber", 0.25))
    g.fill(g.poly([(0.51, 0.67), (0.53, 0.67), (0.78, hz + 0.01), (0.765, hz + 0.01)], 0.6), mix("ochre", "umber", 0.25))
    # lamp post at the fork
    g.fill(g.line([(0.555, 0.70), (0.555, 0.46)], 0.006, 0.4), "night")
    g.fill(g.rect(0.545, 0.44, 0.565, 0.47, 0.3), "pale_gold")
    g.glow(0.555, 0.455, 0.2, "amber", 0.55, 2)
    # long shadows
    g.darken(g.poly([(0.555, 0.70), (0.565, 0.70), (0.25, 0.95), (0.22, 0.95)], 1.5), 0.4)
    g.darken(np.clip((g.Y - 0.78) / 0.22, 0, 1), 0.45)


def expenditures(g):
    g.base(g.vgrad([(0, (0.12, 0.08, 0.06)), (0.55, "umber"), (1, "dark_umber")]))
    g.glow(0.35, 0.25, 0.6, "amber", 0.35, 2)
    table = g.rect(0, 0.62, 1, 1, 0.8)
    g.fill(table, mix("umber", "vermilion", 0.15))
    g.texture(table, 0.12, 50)
    basket = g.poly([(0.18, 0.50), (0.72, 0.50), (0.66, 0.72), (0.24, 0.72)], 0.6)
    g.fill(basket, mix("ochre", "umber", 0.35))
    g.texture(basket, 0.3, 90)
    g.shade(basket, (0.3, 0.45), 0.6, 0.6)
    for (x, y, rx, c) in [(0.33, 0.47, 0.11, mix("ochre", "pale_gold", 0.3)), (0.52, 0.47, 0.10, "ochre")]:
        m = g.ellipse(x, y, rx, 0.045, -8, 0.5)
        g.fill(m, c)
        g.shade(m, (0.3, 0.4), 0.25, 0.5)
    for i in range(6):
        m = g.ellipse(0.40 + i * 0.045, 0.505 - (i % 2) * 0.01, 0.022, 0.022, 0, 0.4)
        g.fill(m, mix("vermilion", "indigo", 0.45) if i % 2 else mix("olive", "umber", 0.3))
        g.shade(m, (0.38, 0.47), 0.06, 0.6)
    for i in range(4):
        g.fill(g.ellipse(0.30 + i * 0.03, 0.51, 0.012, 0.008, 20, 0.3), mix("vermilion", "umber", 0.55))
    purse = g.poly([(0.76, 0.70), (0.86, 0.70), (0.88, 0.66), (0.83, 0.61), (0.79, 0.61), (0.74, 0.66)], 0.6)
    g.fill(purse, mix("vermilion", "umber", 0.45))
    g.shade(purse, (0.78, 0.6), 0.1, 0.6)
    g.darken(np.clip((g.Y - 0.76) / 0.24, 0, 1), 0.45)


SCENES_A = {
    "faith": faith, "knowledge": knowledge, "purification": purifications, "prayer": prayer,
    "zakah": zakah, "fasting": fasting, "hajj": hajj, "marriage": marriage, "istibra": istibra,
    "nursing": nursing, "divorce": divorce, "expenditures": expenditures,
}
