"""Paint the Musnad Abi Hanifa covers and hero at full size.

Usage (from the repo root):
  python scripts/hadith/paintings/render.py [name ...]

Writes public/images/hadith/musnad-abu-hanifa/NN-<name>.jpg (1760x2112) and an
880px-wide copy (NN-<name>-880.jpg) for each book, and hero.jpg (2400x1300)
with hero-1200.jpg. With no names it paints everything, including the hero.
Each painting is seeded by its book number, so a rerun repaints it the same.
"""

import os
import sys
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from kit import Guide  # noqa: E402
from painter import paint, save_jpeg  # noqa: E402
from catalog import ORDER, SCENES, FLOW, HERO  # noqa: E402

ROOT = HERE.parents[2]
OUT = ROOT / "public" / "images" / "hadith" / "musnad-abu-hanifa"
COVER = (1760, 2112)
HERO_SIZE = (2400, 1300)


def _write(img: np.ndarray, stem: str, small_w: int) -> str:
    full = OUT / f"{stem}.jpg"
    q = save_jpeg(img, full)
    pil = Image.open(full)
    w, h = pil.size
    small = pil.resize((small_w, round(h * small_w / w)), Image.LANCZOS)
    small.save(OUT / f"{stem}-{small_w}.jpg", "JPEG", quality=82, optimize=True, progressive=True)
    return f"{stem}: q{q} {full.stat().st_size // 1024} KB"


def render_cover(name: str) -> str:
    n = ORDER.index(name) + 1
    g = Guide(880, 1056, seed=n * 11)
    SCENES[name](g)
    img = paint(g.result(), COVER, seed=n, flow=FLOW.get(name, 0.0))
    return _write(img, f"{n:02d}-{name}", 880)


def render_hero() -> str:
    g = Guide(1200, 650, seed=5)
    HERO(g)
    img = paint(g.result(), HERO_SIZE, seed=99, flow=0.0, vignette=0.4, unit=0.6)
    return _write(img, "hero", 1200)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    names = sys.argv[1:] or ["hero"] + ORDER
    jobs = int(os.environ.get("PAINT_JOBS", "3"))
    with ProcessPoolExecutor(max_workers=jobs) as pool:
        futures = [pool.submit(render_hero) if n == "hero" else pool.submit(render_cover, n) for n in names]
        for f in futures:
            print(f.result(), flush=True)


if __name__ == "__main__":
    main()
