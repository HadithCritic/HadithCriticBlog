"""Drawing kit for painting guides.

A guide is a loose, soft-edged colour study of a scene. Coordinates are
normalised (0..1 across, 0..1 down) so one scene can be drawn at any size.
The painter repaints the guide with strokes, so guides stay simple: flat or
graded shapes, glows and soft shadows.
"""

from __future__ import annotations

import numpy as np
import cv2

PALETTE = {
    "indigo": (0.10, 0.12, 0.27),
    "night": (0.05, 0.06, 0.13),
    "umber": (0.22, 0.14, 0.08),
    "dark_umber": (0.09, 0.06, 0.04),
    "ochre": (0.78, 0.56, 0.25),
    "gold": (0.88, 0.69, 0.36),
    "pale_gold": (0.98, 0.86, 0.58),
    "vermilion": (0.72, 0.22, 0.12),
    "teal": (0.13, 0.42, 0.42),
    "deep_teal": (0.05, 0.20, 0.22),
    "ivory": (0.93, 0.88, 0.76),
    "amber": (0.95, 0.62, 0.24),
    "olive": (0.33, 0.36, 0.18),
    "sage": (0.45, 0.52, 0.36),
}


def C(name_or_rgb):
    if isinstance(name_or_rgb, str):
        return np.array(PALETTE[name_or_rgb], np.float32)
    return np.array(name_or_rgb, np.float32)


def mix(a, b, t):
    return C(a) * (1 - t) + C(b) * t


class Guide:
    def __init__(self, w: int, h: int, seed: int = 0):
        self.w, self.h = w, h
        self.rng = np.random.default_rng(seed)
        self.img = np.zeros((h, w, 3), np.float32)
        yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
        self.X = xx / w
        self.Y = yy / h

    # ---- fields -------------------------------------------------------
    def noise(self, cells: int = 6, octaves: int = 3) -> np.ndarray:
        out = np.zeros((self.h, self.w), np.float32)
        amp, total = 1.0, 0.0
        for o in range(octaves):
            c = cells * (2 ** o)
            small = self.rng.standard_normal((c, max(2, int(c * self.w / self.h)))).astype(np.float32)
            out += amp * cv2.resize(small, (self.w, self.h), interpolation=cv2.INTER_CUBIC)
            total += amp
            amp *= 0.5
        out /= total
        return np.clip(out * 0.5 + 0.5, 0, 1)

    def vgrad(self, stops, y0: float = 0.0, y1: float = 1.0) -> np.ndarray:
        """stops: list of (t, colour). Returns HxWx3 graded top to bottom."""
        t = np.clip((self.Y - y0) / max(1e-6, (y1 - y0)), 0, 1)
        ts = [s[0] for s in stops]
        cols = np.array([C(s[1]) for s in stops])
        out = np.empty((self.h, self.w, 3), np.float32)
        for ch in range(3):
            out[..., ch] = np.interp(t, ts, cols[:, ch])
        return out

    def lgrad(self, p0, p1, c0, c1) -> np.ndarray:
        dx, dy = p1[0] - p0[0], (p1[1] - p0[1]) * self.h / self.w
        L2 = dx * dx + dy * dy + 1e-9
        t = ((self.X - p0[0]) * dx + (self.Y - p0[1]) * self.h / self.w * dy) / L2
        t = np.clip(t, 0, 1)[..., None]
        return C(c0) * (1 - t) + C(c1) * t

    def radial(self, cx: float, cy: float, r: float) -> np.ndarray:
        """1 at the centre falling to 0 at r (radius in widths)."""
        d = np.sqrt((self.X - cx) ** 2 + ((self.Y - cy) * self.h / self.w) ** 2)
        return np.clip(1 - d / r, 0, 1)

    # ---- masks --------------------------------------------------------
    def _px(self, pts):
        return np.array([[p[0] * self.w, p[1] * self.h] for p in pts], np.float32)

    def poly(self, pts, blur: float = 1.0) -> np.ndarray:
        m = np.zeros((self.h, self.w), np.uint8)
        cv2.fillPoly(m, [np.round(self._px(pts) * 16).astype(np.int32)], 255, cv2.LINE_AA, 4)
        return self._soft(m, blur)

    def ellipse(self, cx, cy, rx, ry, angle: float = 0, blur: float = 1.0) -> np.ndarray:
        m = np.zeros((self.h, self.w), np.uint8)
        cv2.ellipse(m, (int(cx * self.w * 16), int(cy * self.h * 16)),
                    (max(1, int(rx * self.w * 16)), max(1, int(ry * self.w * 16))),
                    angle, 0, 360, 255, -1, cv2.LINE_AA, 4)
        return self._soft(m, blur)

    def rect(self, x0, y0, x1, y1, blur: float = 1.0) -> np.ndarray:
        return self.poly([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], blur)

    def line(self, pts, width: float, blur: float = 1.0) -> np.ndarray:
        m = np.zeros((self.h, self.w), np.uint8)
        cv2.polylines(m, [np.round(self._px(pts) * 16).astype(np.int32)], False, 255,
                      max(1, int(width * self.w)), cv2.LINE_AA, 4)
        return self._soft(m, blur)

    def _soft(self, m, blur):
        f = m.astype(np.float32) / 255.0
        if blur > 0:
            f = cv2.GaussianBlur(f, (0, 0), blur * self.w / 440)
        return f

    # ---- painting -----------------------------------------------------
    def fill(self, mask, colour, alpha: float = 1.0):
        col = colour if isinstance(colour, np.ndarray) and colour.ndim == 3 else C(colour)
        a = (mask * alpha)[..., None]
        self.img = self.img * (1 - a) + col * a
        return self

    def base(self, field):
        self.img = field.astype(np.float32).copy()
        return self

    def glow(self, cx, cy, r, colour, strength: float = 1.0, power: float = 2.0):
        g = self.radial(cx, cy, r) ** power * strength
        self.img = self.img + C(colour) * g[..., None]
        return self

    def darken(self, mask, amount: float):
        self.img = self.img * (1 - mask * amount)[..., None]
        return self

    def texture(self, mask, amount: float = 0.08, cells: int = 30):
        n = self.noise(cells, 2) - 0.5
        self.img = self.img * (1 + n * amount * 2 * mask)[..., None]
        return self

    def shade(self, mask, light_xy, falloff: float, dark: float = 0.6):
        """Darken a shape away from a light point (soft modelling)."""
        d = np.sqrt((self.X - light_xy[0]) ** 2 + ((self.Y - light_xy[1]) * self.h / self.w) ** 2)
        k = np.clip(d / falloff, 0, 1) * dark
        self.img = self.img * (1 - mask * k)[..., None]
        return self

    def result(self) -> np.ndarray:
        return np.clip(self.img, 0, 1)


def interior(g: Guide, light, table_y, wall=("umber", "dark_umber"), table="umber", warm=0.35):
    """Dark wall, lit from one point, with a table top from table_y down."""
    g.base(g.vgrad([(0, mix(wall[1], "night", 0.3)), (0.6, wall[0]), (1, wall[1])]))
    g.texture(np.ones_like(g.X), 0.08, 30)
    g.glow(light[0], light[1], 0.7, "amber", warm, 2)
    top = g.rect(0, table_y, 1, 1, 0.8)
    g.fill(top, mix(table, "vermilion", 0.12))
    g.texture(top, 0.12, 50)
    g.shade(top, (light[0], table_y), 0.9, 0.7)
    return top


def calm_floor(g: Guide, start: float = 0.78, amount: float = 0.42):
    g.darken(np.clip((g.Y - start) / (1 - start), 0, 1), amount)


# ---- reusable motifs ----------------------------------------------------

def pointed_arch(cx, top, half_w, spring, bottom, n: int = 24):
    """Closed polygon of a pointed (two-centred) arch opening."""
    d = half_w * 0.85
    R = half_w + d
    rise = np.sqrt(R * R - d * d)
    yscale = (spring - top) / rise
    sweep = np.arccos(d / R)
    pts = []
    for i in range(n + 1):
        a = np.pi - sweep * i / n
        x = cx + d + R * np.cos(a)
        y = spring - R * np.sin(a) * yscale
        pts.append((x, y))
    right = [(2 * cx - x, y) for (x, y) in reversed(pts)]
    return [(cx - half_w, bottom)] + pts + right[1:] + [(cx + half_w, bottom)]


def dome(cx, base_y, half_w, height, n: int = 24):
    pts = [(cx - half_w, base_y)]
    for i in range(n + 1):
        a = np.pi * i / n
        x = cx - half_w * np.cos(a)
        bulge = np.sin(a) ** 0.8
        y = base_y - height * bulge - height * 0.25 * max(0, np.sin(a) - 0.92) * 10
        pts.append((x, y))
    pts.append((cx + half_w, base_y))
    return pts


def skyline(g: Guide, horizon: float, colour, seed_shift: float = 0.0, scale: float = 1.0,
            x_range=(0.0, 1.0)):
    """Domes, flat roofs and minarets along a horizon. Returns the mask."""
    rng = np.random.default_rng(int(seed_shift * 1000) + 7)
    mask = g.rect(x_range[0], horizon - 0.02 * scale, x_range[1], horizon + 0.004, 0.6)
    x = x_range[0]
    while x < x_range[1]:
        w = rng.uniform(0.04, 0.09) * scale
        h = rng.uniform(0.02, 0.05) * scale
        mask = np.maximum(mask, g.rect(x, horizon - h, x + w, horizon + 0.004, 0.6))
        r = rng.random()
        if r < 0.35:
            mask = np.maximum(mask, g.poly(dome(x + w / 2, horizon - h, w * 0.4, w * 0.45), 0.6))
        elif r < 0.55:
            mw = 0.0095 * scale
            mh = rng.uniform(0.09, 0.16) * scale
            mx = x + w * 0.5
            mask = np.maximum(mask, g.rect(mx - mw, horizon - mh, mx + mw, horizon, 0.5))
            mask = np.maximum(mask, g.rect(mx - mw * 1.8, horizon - mh * 0.72, mx + mw * 1.8,
                                           horizon - mh * 0.69, 0.5))
            mask = np.maximum(mask, g.poly([(mx - mw * 1.2, horizon - mh), (mx, horizon - mh - 0.03 * scale),
                                            (mx + mw * 1.2, horizon - mh)], 0.5))
        x += w * rng.uniform(0.7, 1.05)
    g.fill(mask, colour)
    return mask


def palm(g: Guide, x, base_y, height, lean, colour, fronds: int = 9, frond_len: float = 0.11,
         seed: int = 0):
    rng = np.random.default_rng(seed)
    top = (x + lean, base_y - height)
    trunk = []
    for i in range(12):
        t = i / 11
        trunk.append((x + lean * t ** 1.6, base_y - height * t))
    mask = g.line(trunk, 0.011, 0.5)
    for i in range(fronds):
        a = np.pi * (i / (fronds - 1)) * 1.15 - np.pi * 1.07 + rng.uniform(-0.12, 0.12)
        L = frond_len * rng.uniform(0.75, 1.15)
        pts = []
        for j in range(10):
            t = j / 9
            px = top[0] + np.cos(a) * L * t
            py = top[1] + np.sin(a) * L * t * (g.w / g.h) + (L * 0.45 * t * t) * (g.w / g.h)
            pts.append((px, py))
        mask = np.maximum(mask, g.line(pts, 0.010, 0.5))
        # leaflets
        for j in range(2, 10):
            px, py = pts[j - 1]
            for side in (-1, 1):
                ang = a + side * 1.1 + np.pi * 0.25
                l2 = 0.022 * (1 - j / 12)
                q = (px + np.cos(ang) * l2, py + np.sin(ang) * l2 * g.w / g.h + 0.008)
                mask = np.maximum(mask, g.line([(px, py), q], 0.004, 0.4))
    g.fill(mask, colour)
    return mask


def crescent(g: Guide, cx, cy, r, colour, phase: float = 0.35, tilt: float = -0.4):
    outer = g.ellipse(cx, cy, r, r, 0, 0.4)
    ox = cx + np.cos(tilt) * r * phase * 1.4
    oy = cy + np.sin(tilt) * r * phase * 1.4 * g.w / g.h
    inner = g.ellipse(ox, oy, r * 0.92, r * 0.92, 0, 0.4)
    m = np.clip(outer - inner, 0, 1)
    g.fill(m, colour)
    return m


def star(g: Guide, cx, cy, r, colour, strength: float = 1.0):
    g.glow(cx, cy, r * 6, colour, 0.35 * strength, 3)
    g.fill(g.ellipse(cx, cy, r, r, 0, 0.3), colour)


def lantern(g: Guide, cx, top, w, h, metal, light):
    chain = g.line([(cx, 0.0), (cx, top)], 0.003, 0.3)
    g.fill(chain, metal)
    body = g.poly([(cx - w * 0.5, top + h * 0.22), (cx + w * 0.5, top + h * 0.22),
                   (cx + w * 0.35, top + h * 0.85), (cx - w * 0.35, top + h * 0.85)], 0.6)
    g.fill(body, light)
    cap = g.poly([(cx - w * 0.15, top), (cx + w * 0.15, top), (cx + w * 0.58, top + h * 0.24),
                  (cx - w * 0.58, top + h * 0.24)], 0.5)
    g.fill(cap, metal)
    g.fill(g.rect(cx - w * 0.4, top + h * 0.83, cx + w * 0.4, top + h * 0.92, 0.5), metal)
    g.fill(g.line([(cx - w * 0.15, top + h * 0.25), (cx - w * 0.12, top + h * 0.83)], 0.004, 0.3), metal, 0.6)
    g.fill(g.line([(cx + w * 0.15, top + h * 0.25), (cx + w * 0.12, top + h * 0.83)], 0.004, 0.3), metal, 0.6)
    return body


def vessel(g: Guide, cx, base_y, w, h, colour, light_xy, neck: float = 0.35, lip: float = 0.4,
           belly: float = 0.55):
    """A round-bellied jug or jar outline, shaded from a light point."""
    pts = []
    n = 20
    for i in range(n + 1):
        t = i / n  # 0 bottom .. 1 top
        y = base_y - h * t
        if t < belly:
            k = np.sin(np.pi * 0.5 * (0.35 + 0.65 * t / belly))
        elif t < 0.85:
            k = neck + (1 - neck) * (1 - (t - belly) / (0.85 - belly)) ** 1.4
        else:
            k = neck + (lip - neck) * (t - 0.85) / 0.15
        pts.append((cx + w * 0.5 * k, y))
    poly = pts + [(2 * cx - x, y) for (x, y) in reversed(pts)]
    m = g.poly(poly, 0.6)
    g.fill(m, colour)
    g.shade(m, light_xy, w * 1.4, 0.7)
    return m


def bowl(g: Guide, cx, y, w, h, colour, inner, light_xy):
    rim = g.ellipse(cx, y, w / 2, h * 0.18, 0, 0.5)
    body = g.poly([(cx - w / 2, y), (cx + w / 2, y), (cx + w * 0.3, y + h), (cx - w * 0.3, y + h)], 0.5)
    body = np.maximum(body, g.ellipse(cx, y + h * 0.55, w * 0.42, h * 0.45 * g.h / g.w, 0, 0.6) * (g.Y > y))
    g.fill(body, colour)
    g.shade(body, light_xy, w * 1.2, 0.65)
    g.fill(rim, inner)
    return body


def wheat_sheaf(g: Guide, cx, base_y, top_y, spread, stalk, head, n: int = 40, tie: float = 0.55):
    """A standing sheaf: stalks fan out above and below a tie, heads on top."""
    tie_y = base_y + (top_y - base_y) * tie
    for i in range(n):
        u = (i / (n - 1) - 0.5) * 2 + g.rng.uniform(-0.08, 0.08)
        foot = (cx + u * spread * 0.35, base_y)
        waist = (cx + u * spread * 0.06, tie_y)
        tip = (cx + u * spread, top_y + abs(u) * (base_y - top_y) * 0.12 + g.rng.uniform(-0.02, 0.02))
        g.fill(g.line([foot, waist, tip], 0.0035, 0.3), stalk, 0.9)
        ang = np.degrees(np.arctan2(tip[1] - waist[1], (tip[0] - waist[0]) * g.w / g.h)) + 90
        g.fill(g.ellipse(tip[0], tip[1], 0.006, 0.026, ang, 0.3), head)
    g.fill(g.rect(cx - spread * 0.09, tie_y - 0.008, cx + spread * 0.09, tie_y + 0.008, 0.3), "umber")


def wheat_bundle(g: Guide, x0, x1, y, stalk, head, n: int = 22):
    """A bundle lying on its side, heads to the right."""
    for i in range(n):
        dy = (i / (n - 1) - 0.5) * 0.04 + g.rng.uniform(-0.003, 0.003)
        end = x1 + g.rng.uniform(-0.02, 0.02)
        g.fill(g.line([(x0, y + dy * 0.6), ((x0 + end) / 2, y + dy * 0.3), (end, y + dy * 1.3)], 0.003, 0.3), stalk)
        g.fill(g.ellipse(end + 0.02, y + dy * 1.4, 0.024, 0.006, np.degrees(dy * 3), 0.3), head)
    g.fill(g.rect((x0 + x1) / 2 - 0.01, y - 0.02, (x0 + x1) / 2 + 0.01, y + 0.02, 0.3), "umber")


def cast_shadow(g: Guide, cx, y, w, h, amount: float = 0.55):
    g.darken(g.ellipse(cx, y, w, h, 0, 3.0), amount)
