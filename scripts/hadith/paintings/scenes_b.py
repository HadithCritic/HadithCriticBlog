"""Scenes 13-33."""

import numpy as np

from kit import (C, mix, wheat_bundle, pointed_arch, dome, palm, crescent, star, lantern, vessel, bowl,
                 cast_shadow, interior, calm_floor)


def tadbir(g):
    g.base(g.vgrad([(0, "dark_umber"), (0.5, "umber"), (1, "dark_umber")]))
    g.texture(np.ones_like(g.X), 0.14, 26)
    door = g.poly(pointed_arch(0.5, 0.12, 0.2, 0.30, 0.74), 0.6)
    g.fill(door, g.vgrad([(0, (1.0, 0.95, 0.82)), (0.7, "pale_gold"), (1, "amber")], 0.12, 0.74))
    g.glow(0.5, 0.45, 0.5, "amber", 0.45, 2)
    jamb = np.clip(g.poly(pointed_arch(0.5, 0.08, 0.25, 0.30, 0.74), 0.6) - door, 0, 1)
    g.fill(jamb, mix("ochre", "umber", 0.45))
    g.shade(jamb, (0.5, 0.4), 0.35, 0.4)
    floor = g.poly([(0, 0.74), (1, 0.74), (1, 1), (0, 1)], 0.8)
    g.fill(floor, mix("umber", "ochre", 0.25))
    g.texture(floor, 0.18, 22)
    g.fill(g.poly([(0.30, 0.74), (0.70, 0.74), (0.95, 1), (0.05, 1)], 4), "pale_gold", 0.35)
    # loosened chain: a row of small open links
    for i in range(14):
        t = i / 13
        x = 0.30 + t * 0.42
        y = 0.86 + 0.03 * np.sin(t * 5)
        ring = np.clip(g.ellipse(x, y, 0.016, 0.009, (i % 2) * 70, 0.3) - g.ellipse(x, y, 0.009, 0.004, (i % 2) * 70, 0.3), 0, 1)
        g.fill(ring, mix("umber", "night", 0.4))
        g.fill(ring * (g.Y < y), "ochre", 0.5)
    calm_floor(g, 0.9, 0.25)


def oaths(g):
    interior(g, (0.66, 0.30), 0.70, warm=0.4)
    # rahl: two crossed boards, the closed book resting in the V
    g.fill(g.poly([(0.30, 0.74), (0.36, 0.74), (0.62, 0.48), (0.56, 0.47)], 0.5), mix("umber", "vermilion", 0.3))
    g.fill(g.poly([(0.64, 0.74), (0.70, 0.74), (0.44, 0.48), (0.38, 0.47)], 0.5), mix("umber", "ochre", 0.3))
    book = g.poly([(0.30, 0.50), (0.50, 0.555), (0.70, 0.50), (0.70, 0.44), (0.50, 0.495), (0.30, 0.44)], 0.4)
    g.fill(book, mix("deep_teal", "indigo", 0.3))
    g.shade(book, (0.62, 0.35), 0.45, 0.45)
    g.fill(g.line([(0.30, 0.44), (0.50, 0.495), (0.70, 0.44)], 0.006, 0.3), "gold")
    g.fill(g.line([(0.30, 0.50), (0.50, 0.555), (0.70, 0.50)], 0.004, 0.3), mix("ivory", "ochre", 0.3))
    g.fill(g.ellipse(0.40, 0.48, 0.03, 0.022, -15, 0.4), "gold", 0.7)
    g.fill(g.ellipse(0.60, 0.48, 0.03, 0.022, 15, 0.4), "gold", 0.7)
    # candle
    g.fill(g.rect(0.78, 0.50, 0.81, 0.70, 0.4), "ivory")
    g.shade(g.rect(0.78, 0.50, 0.81, 0.70, 0.4), (0.80, 0.45), 0.25, 0.4)
    g.fill(g.ellipse(0.795, 0.70, 0.04, 0.008, 0, 0.4), "gold")
    g.glow(0.795, 0.46, 0.45, "amber", 0.5, 2)
    g.fill(g.ellipse(0.795, 0.47, 0.007, 0.022, 0, 0.5), "pale_gold")
    g.glow(0.795, 0.465, 0.03, "ivory", 0.8, 2)
    calm_floor(g, 0.78)


def hudud(g):
    g.base(g.vgrad([(0, "night"), (0.4, mix("indigo", "umber", 0.4)), (1, "dark_umber")]))
    stone = g.rect(0.12, 0.10, 0.88, 0.80, 0.8)
    g.fill(stone, mix("umber", "ivory", 0.18))
    for r in range(12):
        y = 0.10 + r * 0.058
        g.fill(g.rect(0.12, y, 0.88, y + 0.004, 0.4), "dark_umber", 0.5)
        off = 0.06 if r % 2 else 0
        for c in range(7):
            x = 0.12 + off + c * 0.12
            g.fill(g.rect(x, y, x + 0.004, y + 0.058, 0.4), "dark_umber", 0.4)
    g.texture(stone, 0.2, 40)
    opening = g.poly(pointed_arch(0.5, 0.18, 0.22, 0.34, 0.80), 0.5)
    g.fill(opening, mix("umber", "vermilion", 0.18))
    g.texture(opening, 0.15, 60)
    for k in range(4):
        g.fill(g.rect(0.29 + k * 0.14, 0.24, 0.30 + k * 0.14, 0.80, 0.4), "dark_umber", 0.6)
    for r in range(6):
        for c in range(5):
            m = g.ellipse(0.31 + c * 0.095, 0.38 + r * 0.075, 0.009, 0.009, 0, 0.3)
            g.fill(m, "gold")
            g.shade(m, (0.3 + c * 0.095, 0.37 + r * 0.075), 0.02, 0.7)
    g.shade(np.maximum(stone, opening), (0.85, 0.05), 1.1, 0.6)
    ground = g.rect(0, 0.80, 1, 1, 0.6)
    g.fill(ground, mix("umber", "night", 0.4))
    g.fill(g.poly([(0.80, 0.0), (0.90, 0.0), (0.62, 0.86), (0.42, 0.88)], 5), "pale_gold", 0.28)
    g.fill(g.ellipse(0.52, 0.84, 0.16, 0.025, 0, 2), "pale_gold", 0.5)
    calm_floor(g, 0.88, 0.3)


def jihad(g):
    g.base(g.vgrad([(0, (0.10, 0.11, 0.17)), (0.35, (0.28, 0.30, 0.38)), (0.55, mix("amber", "indigo", 0.5)), (1, "umber")]))
    clouds = g.noise(4, 4)
    g.fill(np.clip((clouds - 0.4) * 2.5, 0, 1) * (g.Y < 0.45), (0.12, 0.13, 0.19), 0.85)
    g.glow(0.70, 0.36, 0.25, "pale_gold", 0.45, 2)
    xs = np.linspace(0, 1, 40)
    left = [(x, 0.55 - 0.30 * np.exp(-((x - 0.12) / 0.2) ** 2) - 0.05 * np.sin(x * 23)) for x in xs if x < 0.48]
    g.fill(g.poly(left + [(0.47, 0.75), (0, 1)], 1), mix("indigo", "umber", 0.55))
    right = [(x, 0.50 - 0.28 * np.exp(-((x - 0.88) / 0.18) ** 2) - 0.04 * np.sin(x * 19)) for x in xs if x > 0.52]
    g.fill(g.poly(right + [(1, 1), (0.53, 0.75)], 1), mix("indigo", "umber", 0.45))
    g.shade(g.poly(right + [(1, 1), (0.53, 0.75)], 1), (0.6, 0.4), 0.7, 0.5)
    road = g.poly([(0.49, 0.58), (0.52, 0.58), (0.68, 1), (0.36, 1)], 0.8)
    g.fill(road, mix("ochre", "umber", 0.35))
    g.shade(road, (0.5, 0.55), 0.5, 0.5)
    # plain banner on the ridge
    g.fill(g.line([(0.86, 0.26), (0.86, 0.13)], 0.004, 0.3), "dark_umber")
    flag = g.poly([(0.862, 0.13), (0.93, 0.14), (0.925, 0.175), (0.862, 0.17)], 0.4)
    g.fill(flag, mix("ivory", "ochre", 0.35))
    g.shade(flag, (0.86, 0.13), 0.08, 0.4)
    calm_floor(g, 0.78)


def sales(g):
    interior(g, (0.5, 0.18), 0.66, warm=0.35)
    g.glow(0.5, 0.25, 0.5, "amber", 0.25, 2)
    # balance scale
    g.fill(g.rect(0.495, 0.14, 0.505, 0.52, 0.4), "gold")
    g.fill(g.line([(0.24, 0.20), (0.76, 0.20)], 0.008, 0.4), "gold")
    g.fill(g.ellipse(0.5, 0.15, 0.02, 0.02, 0, 0.3), "gold")
    for x in (0.26, 0.74):
        for dx in (-0.06, 0.06):
            g.fill(g.line([(x, 0.20), (x + dx, 0.42)], 0.002, 0.3), "ochre", 0.8)
        bowl(g, x, 0.42, 0.15, 0.035, "gold", mix("gold", "umber", 0.4), (0.4, 0.2))
    g.fill(g.ellipse(0.5, 0.53, 0.07, 0.012, 0, 0.4), mix("gold", "umber", 0.3))
    # spice bowls
    spices = [(0.18, "amber"), (0.38, "vermilion"), (0.60, (0.92, 0.70, 0.16)), (0.82, "olive")]
    for x, c in spices:
        heap = g.ellipse(x, 0.70, 0.075, 0.035, 0, 0.5)
        bowl(g, x, 0.72, 0.17, 0.06, mix("umber", "ivory", 0.35), mix("umber", "night", 0.2), (0.5, 0.5))
        g.fill(heap * (g.Y < 0.725), c)
        g.shade(heap, (x - 0.02, 0.67), 0.08, 0.5)
        g.texture(heap, 0.25, 120)
    calm_floor(g, 0.82)


def pledge(g):
    interior(g, (0.3, 0.25), 0.66, warm=0.45)
    g.glow(0.15, 0.30, 0.25, "amber", 0.6, 2)
    lantern(g, 0.15, 0.18, 0.07, 0.11, mix("gold", "dark_umber", 0.5), "pale_gold")
    cloth = g.poly([(0.22, 0.70), (0.86, 0.68), (0.92, 0.78), (0.16, 0.80)], 0.8)
    g.fill(cloth, mix("indigo", "teal", 0.35))
    g.texture(cloth, 0.15, 30)
    chest = g.rect(0.30, 0.44, 0.78, 0.70, 0.5)
    g.fill(chest, mix("umber", "vermilion", 0.25))
    g.texture(chest, 0.18, 60)
    lid = g.poly([(0.29, 0.44), (0.79, 0.44), (0.76, 0.36), (0.32, 0.36)], 0.5)
    g.fill(lid, mix("umber", "vermilion", 0.3))
    g.shade(np.maximum(chest, lid), (0.3, 0.3), 0.6, 0.55)
    for x in (0.34, 0.54, 0.74):
        g.fill(g.rect(x - 0.012, 0.36, x + 0.012, 0.70, 0.4), "gold", 0.85)
    g.fill(g.rect(0.29, 0.44, 0.79, 0.455, 0.4), "gold", 0.85)
    g.fill(g.rect(0.52, 0.47, 0.56, 0.53, 0.4), "gold")
    g.fill(g.ellipse(0.54, 0.495, 0.006, 0.006, 0, 0.3), "dark_umber")
    # key on the cloth
    g.fill(np.clip(g.ellipse(0.30, 0.75, 0.022, 0.022, 0, 0.3) - g.ellipse(0.30, 0.75, 0.011, 0.011, 0, 0.3), 0, 1), "gold")
    g.fill(g.line([(0.32, 0.752), (0.44, 0.765)], 0.007, 0.3), "gold")
    g.fill(g.rect(0.42, 0.765, 0.43, 0.785, 0.3), "gold")
    g.shade(chest, (0.3, 0.3), 0.6, 0.0)
    calm_floor(g, 0.82)


def preemption(g):
    hz = 0.45
    g.base(g.vgrad([(0, (0.40, 0.52, 0.62)), (0.7, (0.85, 0.78, 0.60)), (1, "pale_gold")], 0, hz))
    g.glow(0.85, 0.15, 0.4, "pale_gold", 0.4, 2)
    # trees behind walls
    for x, r, c in [(0.18, 0.13, "olive"), (0.35, 0.10, "sage"), (0.68, 0.12, "olive"), (0.86, 0.11, "sage")]:
        m = g.ellipse(x, 0.36, r, r * 0.9, 0, 1.5)
        g.fill(m, mix(c, "deep_teal", 0.3))
        g.texture(m, 0.25, 40)
        g.shade(m, (x + 0.05, 0.28), r * 1.8, 0.6)
    g.fill(g.rect(0, hz, 1, 1, 0.5), mix("ochre", "olive", 0.35))
    wall_col = mix("ochre", "ivory", 0.35)
    lw = g.poly([(0, 0.40), (0.42, 0.44), (0.42, 0.70), (0, 0.76)], 0.5)
    rw = g.poly([(0.58, 0.44), (1, 0.40), (1, 0.76), (0.58, 0.70)], 0.5)
    g.fill(lw, wall_col)
    g.fill(rw, mix(wall_col, "umber", 0.25))
    g.texture(np.maximum(lw, rw), 0.18, 40)
    gate = g.poly(pointed_arch(0.5, 0.40, 0.08, 0.50, 0.70), 0.5)
    g.fill(np.clip(g.poly(pointed_arch(0.5, 0.36, 0.11, 0.50, 0.70), 0.5) - gate, 0, 1), mix(wall_col, "umber", 0.15))
    g.fill(gate, mix("teal", "umber", 0.35))
    g.fill(g.rect(0.497, 0.42, 0.503, 0.70, 0.3), "dark_umber", 0.7)
    # well in front
    g.fill(g.rect(0, 0.70, 1, 1, 0.6), mix("ochre", "umber", 0.45))
    well = g.rect(0.36, 0.74, 0.64, 0.86, 0.5)
    g.fill(well, mix("ivory", "umber", 0.35))
    g.texture(well, 0.25, 40)
    g.shade(well, (0.4, 0.7), 0.3, 0.5)
    g.fill(g.ellipse(0.5, 0.74, 0.14, 0.022, 0, 0.5), mix("ivory", "umber", 0.25))
    g.fill(g.ellipse(0.5, 0.742, 0.11, 0.014, 0, 0.5), "night")
    cast_shadow(g, 0.55, 0.875, 0.16, 0.015, 0.4)
    calm_floor(g, 0.86, 0.3)


def sharecropping(g):
    hz = 0.40
    g.base(g.vgrad([(0, (0.55, 0.48, 0.52)), (0.6, "amber"), (1, "pale_gold")], 0, hz))
    g.glow(0.3, hz, 0.35, "pale_gold", 0.6, 2)
    g.fill(g.rect(0, hz - 0.02, 1, hz + 0.01, 0.8), mix("olive", "indigo", 0.4))
    for x in (0.70, 0.78, 0.86):
        palm(g, x, hz + 0.005, 0.12, 0.005, mix("olive", "night", 0.6), 8, 0.035, int(x * 100))
    field = g.vgrad([(0, mix("ochre", "olive", 0.3)), (1, mix("umber", "dark_umber", 0.3))], hz, 1)
    g.fill(g.rect(0, hz, 1, 1, 0.5), field)
    for i in range(26):
        x1 = -0.6 + i * 0.09
        g.fill(g.line([(0.3, hz), (x1, 1.05)], 0.006, 0.6), "dark_umber", 0.35)
        g.fill(g.line([(0.3, hz), (x1 + 0.03, 1.05)], 0.004, 0.6), "pale_gold", 0.25)
    chan = g.poly([(0.29, hz), (0.31, hz), (0.95, 1.0), (0.78, 1.0)], 0.6)
    g.fill(chan, g.vgrad([(0, "pale_gold"), (1, mix("teal", "amber", 0.4))], hz, 1))
    # plough
    g.fill(g.line([(0.14, 0.73), (0.40, 0.62)], 0.009, 0.4), mix("umber", "night", 0.3))
    g.fill(g.poly([(0.12, 0.74), (0.20, 0.72), (0.18, 0.78), (0.10, 0.78)], 0.4), mix("umber", "night", 0.4))
    g.fill(g.line([(0.17, 0.72), (0.15, 0.62)], 0.007, 0.4), mix("umber", "night", 0.3))
    calm_floor(g, 0.82)


def virtues(g):
    g.base(g.vgrad([(0, (0.82, 0.55, 0.42)), (0.5, (0.96, 0.74, 0.52)), (1, mix("ochre", "umber", 0.3))]))
    g.glow(0.6, 0.3, 0.6, "pale_gold", 0.4, 2)
    branch = [(0.0, 0.62), (0.2, 0.55), (0.42, 0.42), (0.62, 0.34), (0.85, 0.22), (1.0, 0.18)]
    twigs = [[(0.2, 0.55), (0.3, 0.38), (0.36, 0.24)], [(0.42, 0.42), (0.52, 0.56), (0.62, 0.62)],
             [(0.62, 0.34), (0.66, 0.18), (0.70, 0.10)], [(0.85, 0.22), (0.90, 0.36)]]
    bark = mix("umber", "night", 0.35)
    g.fill(g.line(branch, 0.016, 0.6), bark)
    for t in twigs:
        g.fill(g.line(t, 0.007, 0.5), bark)
    for path in [branch] + twigs:
        for j in range(len(path) - 1):
            for k in range(6):
                f = g.rng.uniform(0, 1)
                x = path[j][0] + (path[j + 1][0] - path[j][0]) * f + g.rng.uniform(-0.03, 0.03)
                y = path[j][1] + (path[j + 1][1] - path[j][1]) * f + g.rng.uniform(-0.03, 0.03)
                r = g.rng.uniform(0.012, 0.022)
                m = g.ellipse(x, y, r, r, 0, 0.4)
                g.fill(m, mix("ivory", (0.98, 0.80, 0.82), g.rng.uniform(0.2, 0.7)))
                g.shade(m, (x - 0.01, y - 0.01), r * 2, 0.35)
                g.fill(g.ellipse(x, y, r * 0.3, r * 0.3, 0, 0.3), mix("vermilion", "umber", 0.3), 0.7)
    calm_floor(g, 0.78, 0.35)


def community(g):
    hz = 0.48
    g.base(g.vgrad([(0, "night"), (0.7, "indigo"), (1, mix("indigo", "umber", 0.4))], 0, hz))
    for i in range(160):
        x, y = g.rng.uniform(0, 1), g.rng.uniform(0, hz - 0.03) ** 1.2
        r = g.rng.uniform(0.0015, 0.004)
        g.fill(g.ellipse(x, y, r, r, 0, 0.2), "ivory", g.rng.uniform(0.4, 1))
    milky = np.exp(-((g.Y - 0.05 - g.X * 0.3) / 0.08) ** 2) * (g.Y < hz)
    g.fill(milky * g.noise(12, 2), (0.6, 0.62, 0.75), 0.3)
    g.fill(g.rect(0, hz, 1, 1, 0.5), g.vgrad([(0, mix("night", "indigo", 0.4)), (1, "night")], hz, 1))
    g.glow(0.5, hz + 0.05, 0.6, "amber", 0.18, 2)
    for i in range(900):
        d = g.rng.uniform(0, 1) ** 1.8
        y = hz + 0.005 + d * 0.30
        x = g.rng.uniform(-0.1, 1.1)
        r = 0.0015 + d * 0.006
        g.fill(g.ellipse(x, y, r, r, 0, 0.2), mix("pale_gold", "amber", g.rng.uniform(0, 1)), 0.9)
    g.glow(0.5, 0.62, 0.5, "amber", 0.2, 2)
    calm_floor(g, 0.8, 0.5)


def foods(g):
    interior(g, (0.25, 0.15), 0.62, warm=0.4)
    g.glow(0.2, 0.2, 0.5, "amber", 0.3, 2)
    vessel(g, 0.70, 0.66, 0.20, 0.36, mix("vermilion", "ochre", 0.35), (0.62, 0.38), 0.45, 0.6, 0.5)
    g.fill(g.line([(0.79, 0.40), (0.85, 0.44), (0.83, 0.55), (0.79, 0.57)], 0.009, 0.4), mix("vermilion", "umber", 0.5))
    g.glow(0.64, 0.45, 0.03, "pale_gold", 0.6, 2)
    bread = g.ellipse(0.32, 0.66, 0.17, 0.05, -4, 0.6)
    g.fill(bread, mix("ochre", "pale_gold", 0.25))
    g.texture(bread, 0.25, 60)
    g.shade(bread, (0.25, 0.6), 0.22, 0.5)
    bowl(g, 0.50, 0.72, 0.14, 0.05, mix("teal", "ivory", 0.25), mix("olive", "night", 0.4), (0.4, 0.6))
    for i in range(6):
        g.fill(g.ellipse(0.46 + i * 0.016, 0.715, 0.009, 0.006, 0, 0.3), mix("olive", "night", 0.25))
    for x, y in [(0.18, 0.75), (0.24, 0.77), (0.85, 0.74)]:
        m = g.ellipse(x, y, 0.03, 0.028, 0, 0.4)
        g.fill(m, mix("vermilion", "indigo", 0.5))
        g.shade(m, (x - 0.015, y - 0.02), 0.05, 0.6)
    for x in (0.90, 0.10):
        c = g.rect(x - 0.035, 0.62, x + 0.035, 0.68, 0.4)
        g.fill(c, mix("ivory", "teal", 0.2))
        g.shade(c, (0.2, 0.5), 0.5, 0.6)
    calm_floor(g, 0.84)


def clothing(g):
    interior(g, (0.4, 0.15), 0.62, warm=0.35)
    bolts = [((0.18, 0.62, 0.56, 0.70), "indigo"), ((0.20, 0.54, 0.54, 0.62), (0.90, 0.62, 0.18)),
             ((0.22, 0.46, 0.52, 0.54), "ivory")]
    for (x0, y0, x1, y1), c in bolts:
        m = g.rect(x0, y0, x1, y1, 0.4)
        g.fill(m, c)
        g.shade(m, (x0, y0), 0.5, 0.45)
        g.fill(g.ellipse(x1, (y0 + y1) / 2, 0.02, 0.032, 0, 0.4), mix(c, "night", 0.3))
        for k in range(3):
            g.fill(g.rect(x0, y0 + (y1 - y0) * (0.3 + 0.2 * k), x1, y0 + (y1 - y0) * (0.32 + 0.2 * k), 0.3), mix(c, "night", 0.25), 0.5)
    # draped end of the indigo cloth
    g.fill(g.poly([(0.56, 0.66), (0.66, 0.70), (0.70, 0.80), (0.52, 0.82), (0.50, 0.70)], 0.8), mix("indigo", "teal", 0.15))
    # spindle
    g.fill(g.line([(0.66, 0.40), (0.80, 0.66)], 0.006, 0.4), "ochre")
    sp = g.ellipse(0.75, 0.57, 0.035, 0.05, -28, 0.5)
    g.fill(sp, mix("ivory", "ochre", 0.3))
    g.texture(sp, 0.25, 90)
    g.fill(g.ellipse(0.79, 0.645, 0.025, 0.008, 0, 0.3), "umber")
    ring = np.clip(g.ellipse(0.82, 0.73, 0.022, 0.011, 0, 0.3) - g.ellipse(0.82, 0.73, 0.016, 0.006, 0, 0.3), 0, 1)
    g.fill(ring, (0.82, 0.84, 0.86))
    g.glow(0.81, 0.725, 0.02, "ivory", 0.6, 2)
    calm_floor(g, 0.84)


def medicine(g):
    interior(g, (0.7, 0.2), 0.64, warm=0.35)
    g.fill(g.rect(0, 0.30, 1, 0.32, 0.4), mix("umber", "night", 0.3))
    for x, c, h in [(0.14, "teal", 0.14), (0.30, mix("ochre", "umber", 0.2), 0.11), (0.86, "indigo", 0.13)]:
        vessel(g, x, 0.30, 0.10, h, c, (x - 0.03, 0.2), 0.6, 0.65, 0.6)
    jar = vessel(g, 0.28, 0.66, 0.16, 0.24, mix("teal", "ivory", 0.2), (0.22, 0.5), 0.55, 0.6, 0.6)
    g.fill(g.rect(0.21, 0.42, 0.35, 0.44, 0.3), "umber")
    honey = vessel(g, 0.50, 0.66, 0.14, 0.17, "amber", (0.46, 0.55), 0.65, 0.7, 0.55)
    g.glow(0.48, 0.58, 0.05, "pale_gold", 0.5, 2)
    g.fill(g.ellipse(0.50, 0.49, 0.05, 0.01, 0, 0.3), "ivory", 0.5)
    mortar = bowl(g, 0.74, 0.60, 0.17, 0.07, "gold", mix("gold", "dark_umber", 0.5), (0.68, 0.5))
    g.fill(g.line([(0.77, 0.60), (0.86, 0.44)], 0.018, 0.4), mix("gold", "umber", 0.2))
    bowl(g, 0.60, 0.74, 0.12, 0.035, mix("ivory", "ochre", 0.35), (0.10, 0.08, 0.07), (0.55, 0.6))
    seeds = g.ellipse(0.60, 0.737, 0.05, 0.012, 0, 0.6)
    g.fill(seeds, (0.08, 0.07, 0.07))
    for i in range(5):
        g.fill(g.line([(0.08 + i * 0.03, 0.76), (0.20 + i * 0.02, 0.70)], 0.004, 0.4), "sage")
    calm_floor(g, 0.82)


def etiquette(g):
    g.base(g.vgrad([(0, "dark_umber"), (1, "umber")]))
    g.texture(np.ones_like(g.X), 0.1, 26)
    door = g.rect(0.56, 0.12, 0.86, 0.66, 0.5)
    g.fill(door, g.vgrad([(0, (0.42, 0.40, 0.58)), (0.6, (0.88, 0.60, 0.40)), (1, "amber")], 0.12, 0.66))
    palm(g, 0.76, 0.66, 0.30, 0.02, mix("night", "indigo", 0.4), 9, 0.07, 5)
    g.fill(np.clip(g.rect(0.54, 0.10, 0.88, 0.66, 0.5) - door, 0, 1), mix("umber", "ochre", 0.3))
    g.glow(0.71, 0.5, 0.5, "amber", 0.3, 2)
    g.fill(g.rect(0, 0.66, 1, 1, 0.5), mix("umber", "vermilion", 0.2))
    g.texture(g.rect(0, 0.66, 1, 1, 0.5), 0.2, 60)
    for x0, x1, c in [(0.02, 0.24, "vermilion"), (0.80, 0.98, "teal")]:
        m = g.poly([(x0, 0.70), (x1, 0.70), (x1 + 0.01, 0.82), (x0 - 0.01, 0.82)], 0.8)
        g.fill(m, mix(c, "umber", 0.25))
        g.shade(m, (0.6, 0.6), 0.6, 0.5)
    table = g.ellipse(0.48, 0.72, 0.22, 0.04, 0, 0.5)
    g.fill(table, mix("umber", "ochre", 0.3))
    g.fill(g.rect(0.30, 0.72, 0.66, 0.79, 0.5), mix("umber", "night", 0.3))
    # dallah
    d = vessel(g, 0.44, 0.70, 0.11, 0.17, "gold", (0.50, 0.55), 0.38, 0.55, 0.42)
    g.fill(g.poly([(0.44, 0.535), (0.47, 0.515), (0.44, 0.50), (0.41, 0.515)], 0.3), "gold")
    g.fill(g.line([(0.39, 0.62), (0.33, 0.57), (0.31, 0.555)], 0.008, 0.3), "gold")
    g.fill(g.line([(0.49, 0.56), (0.53, 0.60), (0.49, 0.66)], 0.006, 0.3), mix("gold", "umber", 0.3))
    for x in (0.56, 0.61):
        bowl(g, x, 0.695, 0.035, 0.02, mix("ivory", "teal", 0.15), "umber", (0.6, 0.6))
    calm_floor(g, 0.84)


def riqaq(g):
    hz = 0.68
    g.base(g.vgrad([(0, (0.16, 0.16, 0.30)), (0.6, (0.48, 0.38, 0.48)), (0.9, (0.90, 0.60, 0.42)), (1, "pale_gold")], 0, hz))
    cloud = g.ellipse(0.72, 0.18, 0.15, 0.05, 0, 3)
    cloud = np.maximum(cloud, g.ellipse(0.66, 0.20, 0.09, 0.05, 0, 3))
    g.fill(cloud, (0.30, 0.28, 0.40), 0.9)
    for i in range(14):
        x = 0.62 + i * 0.016
        g.fill(g.line([(x, 0.23), (x - 0.03, 0.42)], 0.002, 0.8), (0.45, 0.42, 0.55), 0.4)
    g.fill(g.rect(0, hz, 1, 1, 0.6), g.vgrad([(0, mix("umber", "indigo", 0.4)), (1, "dark_umber")], hz, 1))
    trunk = g.poly([(0.33, hz + 0.01), (0.37, hz + 0.01), (0.36, 0.48), (0.345, 0.48)], 0.4)
    bark = mix("night", "umber", 0.3)
    g.fill(trunk, bark)
    for a, L in [(-0.9, 0.12), (-0.4, 0.15), (-1.4, 0.10), (-2.3, 0.13), (-2.8, 0.10)]:
        g.fill(g.line([(0.35, 0.50), (0.35 + np.cos(a) * L, 0.50 + np.sin(a) * L * 0.83)], 0.006, 0.4), bark)
    crown = g.ellipse(0.35, 0.40, 0.16, 0.10, 0, 1.5)
    g.fill(crown * g.noise(18, 2) ** 0.5, mix("olive", "night", 0.55), 0.9)
    leaf = g.ellipse(0.55, 0.60, 0.012, 0.006, 35, 0.3)
    g.fill(leaf, "amber")
    g.glow(0.5, hz, 0.5, "amber", 0.15, 2)
    calm_floor(g, 0.8, 0.4)


def crimes(g):
    hz = 0.60
    g.base(g.vgrad([(0, (0.10, 0.10, 0.15)), (0.6, (0.28, 0.26, 0.32)), (1, mix("ochre", "indigo", 0.5))], 0, hz))
    clouds = g.noise(4, 4)
    g.fill(np.clip((clouds - 0.35) * 2.2, 0, 1) * (g.Y < hz), (0.08, 0.08, 0.12), 0.9)
    g.glow(0.25, hz - 0.05, 0.2, "pale_gold", 0.25, 2)
    g.fill(g.rect(0, hz, 1, 1, 0.6), g.vgrad([(0, mix("ochre", "umber", 0.5)), (1, "dark_umber")], hz, 1))
    g.texture(g.rect(0, hz, 1, 1, 0.6), 0.2, 40)
    well = g.rect(0.36, 0.56, 0.64, 0.74, 0.5)
    g.fill(well, mix("umber", "ivory", 0.25))
    for r in range(4):
        g.fill(g.rect(0.36, 0.56 + r * 0.045, 0.64, 0.563 + r * 0.045, 0.3), "dark_umber", 0.6)
    g.texture(well, 0.25, 40)
    g.shade(well, (0.3, 0.5), 0.35, 0.55)
    g.fill(g.ellipse(0.5, 0.56, 0.14, 0.02, 0, 0.5), mix("umber", "ivory", 0.2))
    g.fill(g.ellipse(0.5, 0.562, 0.11, 0.012, 0, 0.5), "night")
    bw = g.poly([(0.70, 0.78), (0.80, 0.78), (0.82, 0.74), (0.68, 0.74)], 0.5)
    g.fill(bw, mix("umber", "vermilion", 0.25))
    g.shade(bw, (0.7, 0.72), 0.12, 0.5)
    cast_shadow(g, 0.75, 0.785, 0.07, 0.008, 0.5)
    calm_floor(g, 0.8, 0.45)


def judgments(g):
    g.base(g.vgrad([(0, "night"), (0.5, mix("umber", "indigo", 0.3)), (1, "dark_umber")]))
    for x in (0.16, 0.5, 0.84):
        g.fill(g.poly(pointed_arch(x, 0.02, 0.18, 0.16, 0.30), 1.5), mix("umber", "indigo", 0.2), 0.6)
    for x in (0.08, 0.92):
        g.fill(g.rect(x - 0.035, 0.12, x + 0.035, 0.72, 0.5), mix("umber", "ivory", 0.15))
    win = g.poly(pointed_arch(0.5, 0.16, 0.12, 0.26, 0.48), 0.5)
    g.fill(win, g.vgrad([(0, (0.62, 0.72, 0.82)), (1, (0.80, 0.84, 0.86))], 0.16, 0.48))
    g.fill(g.rect(0.497, 0.16, 0.503, 0.48, 0.3), mix("umber", "night", 0.4))
    g.fill(g.poly([(0.38, 0.48), (0.62, 0.48), (0.80, 0.80), (0.20, 0.80)], 5), (0.70, 0.78, 0.86), 0.18)
    g.fill(g.rect(0, 0.62, 1, 1, 0.5), mix("umber", "night", 0.25))
    dais = g.rect(0.22, 0.62, 0.78, 0.68, 0.4)
    g.fill(dais, mix("umber", "ivory", 0.2))
    cush = g.poly([(0.30, 0.62), (0.70, 0.62), (0.68, 0.56), (0.32, 0.56)], 0.6)
    g.fill(cush, mix("vermilion", "umber", 0.3))
    back = g.ellipse(0.5, 0.53, 0.12, 0.05, 0, 0.6)
    g.fill(back, mix("vermilion", "umber", 0.4))
    g.shade(np.maximum(cush, back), (0.5, 0.45), 0.3, 0.5)
    g.glow(0.84, 0.56, 0.25, "amber", 0.5, 2)
    g.fill(g.rect(0.83, 0.56, 0.85, 0.62, 0.3), "gold")
    g.fill(g.ellipse(0.84, 0.545, 0.006, 0.016, 0, 0.3), "pale_gold")
    for k in range(3):
        m = g.ellipse(0.16 + k * 0.025, 0.66 - k * 0.012, 0.05, 0.012, 0, 0.3)
        g.fill(m, mix("ivory", "ochre", 0.3))
    calm_floor(g, 0.8)


def trials(g):
    hz = 0.50
    g.base(g.vgrad([(0, (0.05, 0.06, 0.10)), (1, (0.12, 0.14, 0.22))], 0, hz))
    moon = g.ellipse(0.62, 0.18, 0.05, 0.05, 0, 0.6)
    g.fill(moon, (0.80, 0.82, 0.84))
    g.glow(0.62, 0.18, 0.35, (0.4, 0.45, 0.6), 0.3, 2)
    clouds = g.noise(5, 4)
    g.fill(np.clip((clouds - 0.42) * 2.4, 0, 1) * (g.Y < hz), (0.08, 0.09, 0.14), 0.85)
    g.fill(g.rect(0, hz, 1, 1, 0.5), g.vgrad([(0, (0.10, 0.13, 0.20)), (1, (0.03, 0.05, 0.08))], hz, 1))
    for i in range(12):
        y = hz + 0.02 + (i / 12) ** 1.4 * 0.45
        amp = 0.006 + 0.04 * (i / 12) ** 1.4
        xs = np.linspace(-0.05, 1.05, 30)
        ph = g.rng.uniform(0, 6)
        crest = [(x, y - amp * (0.5 + 0.5 * np.sin(x * (14 - i * 0.6) + ph))) for x in xs]
        g.fill(g.poly(crest + [(1.05, y + amp * 1.5), (-0.05, y + amp * 1.5)], 0.6), mix("deep_teal", "night", 0.4 + i * 0.03))
        g.fill(g.line(crest, 0.003, 0.6), (0.40, 0.46, 0.56), 0.5)
    g.fill(g.line([(0.56, hz + 0.03), (0.68, hz + 0.18)], 0.04, 3), (0.6, 0.65, 0.75), 0.25)
    g.fill(g.poly([(0.135, hz), (0.165, hz), (0.157, hz - 0.08), (0.143, hz - 0.08)], 0.3), (0.22, 0.22, 0.27))
    g.glow(0.15, hz - 0.085, 0.06, "pale_gold", 0.8, 2)
    calm_floor(g, 0.78, 0.4)


def tafsir(g):
    g.base(g.vgrad([(0, "dark_umber"), (1, "umber")]))
    win = g.rect(0.18, 0.06, 0.82, 0.50, 0.5)
    g.fill(win, g.vgrad([(0, (0.95, 0.82, 0.60)), (1, "amber")], 0.06, 0.5))
    g.glow(0.5, 0.30, 0.3, "pale_gold", 0.6, 2)
    lattice = np.zeros_like(g.X)
    for i in range(-10, 12):
        lattice = np.maximum(lattice, g.line([(0.18 + i * 0.06, 0.06), (0.18 + i * 0.06 + 0.44, 0.50)], 0.008, 0.3))
        lattice = np.maximum(lattice, g.line([(0.82 - i * 0.06, 0.06), (0.82 - i * 0.06 - 0.44, 0.50)], 0.008, 0.3))
    g.fill(lattice * win, mix("umber", "night", 0.3))
    g.fill(np.clip(g.rect(0.15, 0.03, 0.85, 0.53, 0.4) - win, 0, 1), mix("umber", "ochre", 0.2))
    desk = g.rect(0, 0.56, 1, 1, 0.6)
    g.fill(desk, mix("umber", "night", 0.2))
    page = g.poly([(0.20, 0.60), (0.80, 0.59), (0.86, 0.84), (0.14, 0.86)], 0.5)
    g.fill(page, mix("ivory", "ochre", 0.15))
    margin = np.clip(page - g.poly([(0.25, 0.625), (0.75, 0.615), (0.79, 0.81), (0.21, 0.83)], 0.5), 0, 1)
    g.fill(margin, "gold", 0.85)
    for i in range(8):
        x = 0.27 + i * 0.065
        g.fill(g.ellipse(x, 0.72, 0.022, 0.022, 0, 0.3), "teal", 0.55)
        g.fill(g.ellipse(x, 0.72, 0.010, 0.010, 0, 0.3), "gold", 0.9)
    # lattice light pattern falling across the page
    pat = (np.sin((g.X + g.Y) * 120) > 0.6) | (np.sin((g.X - g.Y) * 120) > 0.6)
    g.darken(pat.astype(np.float32) * page * 0.6, 0.35)
    g.glow(0.5, 0.7, 0.3, "pale_gold", 0.2, 2)
    calm_floor(g, 0.86, 0.35)


def bequests(g):
    interior(g, (0.75, 0.2), 0.60, warm=0.4)
    cloth = g.poly([(0.06, 0.66), (0.70, 0.64), (0.76, 0.84), (0.02, 0.86)], 0.6)
    g.fill(cloth, mix("ivory", "ochre", 0.3))
    g.texture(cloth, 0.12, 30)
    g.shade(cloth, (0.7, 0.5), 0.8, 0.5)
    for y in (0.69, 0.745, 0.80):
        wheat_bundle(g, 0.10, 0.50, y, mix("ochre", "umber", 0.2), "gold", 22)
    coffer = g.rect(0.70, 0.48, 0.94, 0.70, 0.5)
    g.fill(coffer, mix("umber", "vermilion", 0.2))
    g.texture(coffer, 0.2, 60)
    g.fill(g.poly([(0.69, 0.48), (0.95, 0.48), (0.93, 0.43), (0.71, 0.43)], 0.4), mix("umber", "vermilion", 0.25))
    g.shade(coffer, (0.8, 0.3), 0.35, 0.4)
    g.fill(g.rect(0.80, 0.50, 0.84, 0.55, 0.3), "gold", 0.8)
    calm_floor(g, 0.84)


def paradise(g):
    g.base(g.vgrad([(0, (0.95, 0.82, 0.55)), (0.5, (0.98, 0.90, 0.68)), (1, mix("sage", "ochre", 0.4))]))
    g.glow(0.5, 0.12, 0.6, "pale_gold", 0.5, 2)
    for k, (y, c) in enumerate([(0.38, mix("sage", "pale_gold", 0.4)), (0.52, "sage"), (0.68, mix("olive", "sage", 0.4))]):
        xs = np.linspace(0, 1, 30)
        edge = [(x, y + 0.02 * np.sin(x * 7 + k)) for x in xs]
        m = g.poly(edge + [(1, 1), (0, 1)], 0.8)
        g.fill(m, c)
        g.texture(m, 0.15, 40)
    for y0, y1, w0, w1 in [(0.36, 0.52, 0.04, 0.08), (0.52, 0.70, 0.08, 0.14), (0.70, 1.0, 0.14, 0.26)]:
        riv = g.poly([(0.5 - w0, y0), (0.5 + w0, y0), (0.5 + w1, y1), (0.5 - w1, y1)], 0.6)
        g.fill(riv, mix("teal", (0.45, 0.85, 0.85), 0.55))
        g.fill(riv * (np.sin(g.Y * 140) > 0.7), "ivory", 0.35)
    for x, y, r in [(0.15, 0.36, 0.08), (0.86, 0.36, 0.08), (0.12, 0.52, 0.11), (0.88, 0.50, 0.11), (0.22, 0.30, 0.06), (0.78, 0.30, 0.06)]:
        g.fill(g.rect(x - 0.008, y, x + 0.008, y + r * 1.4, 0.4), mix("umber", "olive", 0.3))
        crown = g.ellipse(x, y, r, r * 0.8, 0, 1.2)
        g.fill(crown, mix("olive", "teal", 0.25))
        g.shade(crown, (x - r * 0.4, y - r * 0.6), r * 2, 0.5)
        for i in range(6):
            fx, fy = x + g.rng.uniform(-r, r) * 0.7, y + g.rng.uniform(-r, r) * 0.5
            g.fill(g.ellipse(fx, fy, 0.008, 0.008, 0, 0.3), g.rng.choice(["vermilion", "amber", "gold"]))
    g.glow(0.5, 0.28, 0.25, "pale_gold", 0.35, 2)
    calm_floor(g, 0.84, 0.3)


SCENES_B = {
    "tadbir": tadbir, "oaths": oaths, "hudud": hudud, "jihad": jihad, "sales": sales,
    "pledge": pledge, "preemption": preemption, "sharecropping": sharecropping,
    "virtues": virtues, "community": community, "foods": foods, "clothing": clothing,
    "medicine": medicine, "etiquette": etiquette, "riqaq": riqaq, "crimes": crimes,
    "judgments": judgments, "trials": trials, "tafsir": tafsir, "bequests": bequests,
    "paradise": paradise,
}
