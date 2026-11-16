"""Render guides (and optionally paintings) for a few scenes into a folder,
plus a contact sheet. Usage: python preview.py <out dir> [--paint] [names...]"""

import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))
from kit import Guide  # noqa: E402
from painter import paint  # noqa: E402
from catalog import SCENES, FLOW  # noqa: E402


def main() -> None:
    out = Path(sys.argv[1])
    out.mkdir(parents=True, exist_ok=True)
    do_paint = "--paint" in sys.argv
    names = [a for a in sys.argv[2:] if not a.startswith("--")] or list(SCENES)
    thumbs = []
    for i, name in enumerate(names):
        g = Guide(440, 528, seed=i + 3)
        SCENES[name](g)
        img = g.result()
        if do_paint:
            img = paint(img, (880, 1056), seed=i, flow=FLOW.get(name, 0.0))
        pil = Image.fromarray((img * 255).astype(np.uint8))
        pil.save(out / f"{name}.jpg", quality=85)
        thumbs.append(pil.resize((220, 264)))
        print(name, flush=True)
    cols = 6
    rows = (len(thumbs) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * 224, rows * 268), (20, 17, 14))
    for k, t in enumerate(thumbs):
        sheet.paste(t, ((k % cols) * 224 + 2, (k // cols) * 268 + 2))
    sheet.save(out / "_sheet.jpg", quality=85)


if __name__ == "__main__":
    main()
