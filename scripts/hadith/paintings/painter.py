"""Stroke-based oil painter.

Takes a guide image (a loose, soft-edged drawing of a scene) and repaints it
with layered bristle strokes that follow the local edge direction, coarse to
fine. Every stroke is also drawn into a height map, which is lit at the end
for impasto relief. A linen weave, fine craquelure, a warm glaze and a
vignette finish the surface.
"""

import numpy as np
import cv2
from scipy.spatial import cKDTree

LIGHT = np.array([-0.55, -0.7, 1.0], np.float32)
LIGHT /= np.linalg.norm(LIGHT)


def _orientation(guide, flow_angle, rng):
    """Stroke angle per pixel: along edges where the guide has structure,
    the scene's default flow (plus a slow wobble) where it is flat."""
    lum = cv2.cvtColor(guide, cv2.COLOR_RGB2GRAY)
    lum = cv2.GaussianBlur(lum, (0, 0), 2.0)
    gx = cv2.Sobel(lum, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(lum, cv2.CV_32F, 0, 1, ksize=3)
    s = 6.0
    jxx = cv2.GaussianBlur(gx * gx, (0, 0), s)
    jyy = cv2.GaussianBlur(gy * gy, (0, 0), s)
    jxy = cv2.GaussianBlur(gx * gy, (0, 0), s)
    grad_angle = 0.5 * np.arctan2(2 * jxy, jxx - jyy)
    edge_angle = grad_angle + np.pi / 2
    strength = np.sqrt((jxx - jyy) ** 2 + 4 * jxy ** 2)
    weight = np.clip(strength / (np.percentile(strength, 90) + 1e-6), 0, 1) ** 0.7

    h, w = lum.shape
    wobble = _smooth_noise(h, w, 5, rng) * 0.45
    default = flow_angle + wobble
    # Blend doubled-angle vectors so opposite directions agree.
    vx = weight * np.cos(2 * edge_angle) + (1 - weight) * np.cos(2 * default)
    vy = weight * np.sin(2 * edge_angle) + (1 - weight) * np.sin(2 * default)
    return 0.5 * np.arctan2(vy, vx)


def _smooth_noise(h, w, cells, rng):
    small = rng.standard_normal((cells, max(2, int(cells * w / h)))).astype(np.float32)
    return cv2.resize(small, (w, h), interpolation=cv2.INTER_CUBIC)


def _stroke_path(start, angle_map, guide, color, length, step, tol):
    h, w = angle_map.shape
    pts = [start]
    for direction in (1, -1):
        x, y = start
        prev = None
        travelled = 0.0
        while travelled < length / 2:
            xi, yi = int(x), int(y)
            if not (0 <= xi < w and 0 <= yi < h):
                break
            a = angle_map[yi, xi]
            dx, dy = np.cos(a), np.sin(a)
            if prev is not None and dx * prev[0] + dy * prev[1] < 0:
                dx, dy = -dx, -dy
            if prev is None and direction < 0:
                dx, dy = -dx, -dy
            prev = (dx, dy)
            x, y = x + dx * step, y + dy * step
            xi, yi = int(x), int(y)
            if not (0 <= xi < w and 0 <= yi < h):
                break
            if np.abs(guide[yi, xi] - color).sum() > tol:
                break
            travelled += step
            if direction > 0:
                pts.append((x, y))
            else:
                pts.insert(0, (x, y))
    return np.array(pts, np.float32)


def _draw_stroke(canvas, height, pts, color, radius, rng, impasto):
    shift = 4
    scale = 1 << shift
    width = max(1, int(round(radius * 2)))
    c = tuple(int(v) for v in np.clip(color * 255, 0, 255))
    poly = [np.round(pts * scale).astype(np.int32)]
    if len(pts) < 2:
        cv2.circle(canvas, tuple(poly[0][0]), int(radius * scale), c, -1, cv2.LINE_AA, shift)
        base = int(100 + 70 * impasto * rng.uniform(0.6, 1.0))
        cv2.circle(height, tuple(poly[0][0]), int(radius * scale), base, -1, cv2.LINE_AA, shift)
        return
    cv2.polylines(canvas, poly, False, c, width, cv2.LINE_AA, shift)
    base = int(100 + 70 * impasto * rng.uniform(0.6, 1.0))
    cv2.polylines(height, poly, False, base, width, cv2.LINE_AA, shift)

    # Bristle streaks: thin parallel lines in slightly lighter/darker paint.
    d = np.diff(pts, axis=0)
    seg = np.linalg.norm(d, axis=1, keepdims=True) + 1e-6
    normals = np.concatenate([-d[:, 1:2], d[:, 0:1]], axis=1) / seg
    normals = np.vstack([normals, normals[-1:]])
    n_bristles = int(np.clip(radius * 0.7, 2, 9))
    for _ in range(n_bristles):
        off = rng.uniform(-0.85, 0.85) * radius
        tint = 1 + rng.uniform(-0.13, 0.13)
        bc = tuple(int(v) for v in np.clip(color * tint * 255, 0, 255))
        bpts = pts + normals * off
        cut = rng.uniform(0.0, 0.25)
        n = len(bpts)
        a, b = int(n * cut * rng.uniform(0, 1)), n - int(n * cut * rng.uniform(0, 1))
        if b - a < 2:
            continue
        bpoly = [np.round(bpts[a:b] * scale).astype(np.int32)]
        bw = max(1, int(radius * rng.uniform(0.12, 0.3)))
        cv2.polylines(canvas, bpoly, False, bc, bw, cv2.LINE_AA, shift)
        ridge = int(np.clip(base + rng.uniform(-22, 22), 0, 255))
        cv2.polylines(height, bpoly, False, ridge, bw, cv2.LINE_AA, shift)


def _layer(canvas, height, guide, angle, radius, rng, threshold, coverage, tol, length_k):
    h, w = angle.shape
    blurred = cv2.GaussianBlur(guide, (0, 0), max(0.6, radius * 0.35))
    current = canvas.astype(np.float32) / 255.0
    diff = np.abs(current - blurred).sum(axis=2)
    grid = max(2, int(radius * 1.2 / coverage))
    gh, gw = h // grid, w // grid
    blocks = diff[:gh * grid, :gw * grid].reshape(gh, grid, gw, grid).transpose(0, 2, 1, 3)
    blocks = blocks.reshape(gh, gw, grid * grid)
    means = blocks.mean(axis=2)
    arg = blocks.argmax(axis=2)
    if threshold is None:
        keep = np.ones_like(means, bool)
    else:
        fine = cv2.GaussianBlur(guide, (0, 0), max(0.6, radius * 0.5))
        broad = cv2.GaussianBlur(guide, (0, 0), radius * 2.5)
        detail = np.abs(fine - broad).sum(axis=2)
        dblocks = detail[:gh * grid, :gw * grid].reshape(gh, grid, gw, grid).max(axis=(1, 3))
        keep = (means >= threshold) & (dblocks >= 0.05)
    by, bx = np.nonzero(keep)
    iy, ix = np.divmod(arg[by, bx], grid)
    xs = bx * grid + ix + rng.uniform(-0.5, 0.5, len(bx)) * grid
    ys = by * grid + iy + rng.uniform(-0.5, 0.5, len(by)) * grid
    starts = list(zip(np.clip(xs, 0, w - 1), np.clip(ys, 0, h - 1)))
    order = rng.permutation(len(starts))
    for i in order:
        x, y = starts[i]
        col = blurred[int(y), int(x)].copy()
        col = col * (1 + rng.uniform(-0.07, 0.07)) + rng.uniform(-0.025, 0.025, 3)
        length = radius * length_k * rng.uniform(0.6, 1.4)
        pts = _stroke_path((x, y), angle, blurred, col, length, max(1.0, radius * 0.5), tol)
        lum = float(col @ np.array([0.3, 0.59, 0.11]))
        _draw_stroke(canvas, height, pts, col, radius * rng.uniform(0.8, 1.15), rng, 0.35 + 0.65 * lum)


def _weave(h, w, rng, period=5.2):
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    jitter = _smooth_noise(h, w, 40, rng) * 0.8
    tx = np.sin(2 * np.pi * x / period + jitter)
    ty = np.sin(2 * np.pi * y / period - jitter)
    checker = ((np.floor(x / period) + np.floor(y / period)) % 2).astype(np.float32)
    return checker * tx + (1 - checker) * ty


def _craquelure(h, w, rng, cells=900):
    sh, sw = h // 2, w // 2
    pts = np.column_stack([rng.uniform(0, sw, cells), rng.uniform(0, sh, cells)])
    tree = cKDTree(pts)
    y, x = np.mgrid[0:sh, 0:sw].astype(np.float32)
    warp = 6.0
    xq = x + _smooth_noise(sh, sw, 24, rng) * warp
    yq = y + _smooth_noise(sh, sw, 24, rng) * warp
    d, _ = tree.query(np.column_stack([xq.ravel(), yq.ravel()]), k=2)
    edge = (d[:, 1] - d[:, 0]).reshape(sh, sw)
    crack = np.exp(-(edge / 0.9) ** 2).astype(np.float32)
    crack *= np.clip(_smooth_noise(sh, sw, 8, rng) * 0.8 + 0.5, 0, 1)
    return cv2.resize(crack, (w, h), interpolation=cv2.INTER_LINEAR)


def _finish(canvas, height, rng, glaze, vignette):
    img = canvas.astype(np.float32) / 255.0
    h, w = height.shape
    lum = img @ np.array([0.3, 0.59, 0.11], np.float32)

    hm = height.astype(np.float32) / 255.0
    hm = cv2.GaussianBlur(hm, (0, 0), 0.9)
    weave = _weave(h, w, rng)
    # Linen shows most where the paint is thin (darks and mid-tones).
    thin = 1.0 - np.clip(hm, 0, 1) * 0.6
    hm = hm * 1.5 + weave * 0.035 * thin
    crack = _craquelure(h, w, rng)
    hm -= crack * 0.10

    gx = cv2.Sobel(hm, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(hm, cv2.CV_32F, 0, 1, ksize=3)
    nz = np.ones_like(gx)
    norm = np.sqrt(gx * gx + gy * gy + nz)
    ndotl = (-gx * LIGHT[0] - gy * LIGHT[1] + nz * LIGHT[2]) / norm
    flat = LIGHT[2]
    shade = ndotl / flat
    img *= (1 + 0.42 * (shade - 1))[..., None]
    half = LIGHT + np.array([0, 0, 1], np.float32)
    half /= np.linalg.norm(half)
    ndoth = np.clip((-gx * half[0] - gy * half[1] + nz * half[2]) / norm, 0, 1)
    spec = (ndoth ** 40) * np.clip(lum - 0.35, 0, 1) * 0.22
    img += spec[..., None] * np.array([1.0, 0.95, 0.85], np.float32)

    img *= (1 - crack * 0.07)[..., None]

    # Warm glaze: amber over everything, umber pooling in the shadows.
    tint = np.array(glaze, np.float32)
    img = img * tint
    umber = np.array([0.085, 0.06, 0.045], np.float32)
    shadow = np.clip(1 - lum * 1.8, 0, 1)[..., None] * 0.18
    img = img * (1 - shadow) + umber * shadow

    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    r = np.sqrt(((x - w / 2) / (w / 2)) ** 2 + ((y - h / 2) / (h / 2)) ** 2)
    img *= (1 - vignette * np.clip(r - 0.55, 0, 1) ** 1.6)[..., None]
    return np.clip(img, 0, 1)


def _prepare(g, rng, unit=1.0):
    """Hand-drawn wobble on the edges and broken colour across the surface."""
    h, w = g.shape[:2]
    amp = 5.5 * unit
    dx = _smooth_noise(h, w, 30, rng) * amp
    dy = _smooth_noise(h, w, 30, rng) * amp
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    g = cv2.remap(g, x + dx, y + dy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    for ch in range(3):
        n = _smooth_noise(h, w, 14, rng) * 0.6 + _smooth_noise(h, w, 45, rng) * 0.4
        g[..., ch] *= 1 + 0.07 * n
    return g


def paint(guide, size, seed=0, flow=0.0, glaze=(1.02, 0.97, 0.86), vignette=0.55,
          detail=1.0, unit=None):
    """guide: float32 HxWx3 in 0..1 at any resolution. size: (w, h)."""
    rng = np.random.default_rng(seed)
    w, h = size
    g = cv2.resize(guide, (w, h), interpolation=cv2.INTER_CUBIC).astype(np.float32)
    g = np.clip(_prepare(g, rng, unit or w / 1760.0), 0, 1)
    angle = _orientation(g, flow, rng)

    base = cv2.GaussianBlur(g, (0, 0), 18)
    canvas = (np.clip(base * 0.85, 0, 1) * 255).astype(np.uint8)
    height = np.full((h, w), 70, np.uint8)
    unit = unit or w / 1760.0
    layers = [
        (34, None, 1.1, 0.55, 5.5),
        (18, None, 1.0, 0.42, 5.0),
        (9, 0.05, 1.3, 0.32, 3.4),
        (4.5, 0.07 / detail, 1.3, 0.26, 3.0),
        (2.4, 0.11 / detail, 1.2, 0.22, 2.6),
    ]
    for radius, threshold, coverage, tol, length_k in layers:
        _layer(canvas, height, g, angle, radius * unit, rng, threshold, coverage, tol, length_k)
    return _finish(canvas, height, rng, glaze, vignette)


def save_jpeg(img, path, max_bytes=400_000, quality=88):
    """Write a JPEG at the given quality, stepping down only if it would
    exceed max_bytes. Returns the quality used."""
    from PIL import Image
    pil = Image.fromarray((np.clip(img, 0, 1) * 255 + 0.5).astype(np.uint8))
    q = quality
    while True:
        pil.save(path, "JPEG", quality=q, optimize=True, progressive=True, subsampling=2)
        import os
        if os.path.getsize(path) <= max_bytes or q <= 50:
            return q
        q -= 2
