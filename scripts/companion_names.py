"""English names for musnad sections, from the Rijal register.

A musnad groups its narrations by Companion under headings such as
"مسند أبي بكر الصديق" or "أحاديث عمر بن الخطاب رضي الله عنه". The name in the
heading is looked up in the register's alias table (narrator_alias, whose
surface_norm folds the hamza seats and drops marks), and the register's
English name is used. A heading whose name does not resolve to a single
register entry gets no English name from here.
"""

from __future__ import annotations

import re
import sqlite3

MARKS = re.compile("[ً-ْٰـ]")
PREFIX = re.compile(
    r"^(?:و?من\s+)?(?:و?مسند|حديث|أحاديث|ما روى|ما أسند|رواية|زيادات|تابع مسند|بقية مسند|أول مسند|وممن)\s+"
)
HONORIFICS = [
    r"رضي الله عنهما", r"رضي الله عنهم أجمعين", r"رضي الله عنهم", r"رضي الله عنهن", r"رضي الله عنها", r"رضي الله عنه",
    r"رضوان الله عليهم أجمعين", r"عن رسول الله صلى الله عليه وسلم", r"عن النبي صلى الله عليه وسلم",
    r"صلى الله عليه وسلم", r"خليفة رسول الله", r"أمير المؤمنين", r"أيضا",
]


def norm(text: str) -> str:
    """The register's surface_norm folding."""
    t = MARKS.sub("", text or "")
    t = t.replace("أ", "ا").replace("إ", "ا").replace("آ", "ا").replace("ى", "ي")
    t = re.sub(r"[^ء-ي\s]", " ", t)
    return re.sub(r"\s+", " ", t).strip()


def heading_name(title_ar: str) -> str:
    """The person a musnad heading names, with its formula and honorifics removed."""
    t = MARKS.sub("", title_ar or "")
    t = re.sub(r"[\[\]().:،,\-–]", " ", t)
    t = re.sub(r"\s+", " ", t).strip()
    t = PREFIX.sub("", t)
    for honorific in HONORIFICS:
        t = t.replace(honorific, " ")
    return re.sub(r"\s+", " ", t).strip()


def candidates(name: str) -> list[str]:
    """Forms of a heading's name to try, fullest first: as written, with the
    genitive kunya read as nominative ("أبي بكر" as "أبو بكر"), without a
    leading kunya ("أبي حفص عمر بن الخطاب" as "عمر بن الخطاب"), and with the
    lineage shortened a generation at a time down to "X بن Y"."""
    words = name.split()
    forms = [name]
    if words and words[0] == "ابي":
        forms.append(" ".join(["ابو"] + words[1:]))
        # A kunya is two words; what follows it is the name proper.
        if len(words) > 3:
            forms.append(" ".join(words[2:]))
    expanded = []
    for form in forms:
        parts = form.split()
        expanded.append(form)
        while len(parts) > 3 and "بن" in parts[1:]:
            last = len(parts) - 1 - parts[::-1].index("بن")
            if last <= 1:
                break
            parts = parts[:last]
            expanded.append(" ".join(parts))
    return list(dict.fromkeys(f for f in expanded if len(f) >= 3))


class Register:
    def __init__(self, db: sqlite3.Connection):
        self.db = db
        self.cache: dict[str, tuple[int, str] | None] = {}
        # The register's own Arabic names, folded the same way.
        self.by_name: dict[str, list[tuple[int, str, int]]] = {}
        for narrator_id, name_ar, name_en, count in db.execute(
            "SELECT id, name_ar, name_en, hadith_count FROM narrator WHERE name_en IS NOT NULL AND name_en != ''"
        ):
            self.by_name.setdefault(norm(name_ar), []).append((narrator_id, name_en, count or 0))

    def _lookup(self, form: str) -> tuple[int, str] | None:
        rows = self.db.execute(
            """SELECT n.id, n.name_en, sum(a.n_mentions) AS m FROM narrator_alias a JOIN narrator n ON n.id = a.narrator_id
                WHERE a.surface_norm = ? AND n.name_en IS NOT NULL AND n.name_en != ''
                GROUP BY n.id ORDER BY m DESC""",
            (form,),
        ).fetchall()
        if not rows:
            rows = sorted(self.by_name.get(form, []), key=lambda r: -r[2])
        # One register entry, or one that carries nearly all the mentions.
        if rows and (len(rows) == 1 or rows[0][2] >= 10 * (rows[1][2] or 1)):
            return rows[0][0], rows[0][1]
        return None

    def find(self, title_ar: str) -> tuple[int, str] | None:
        """The register entry a musnad heading names: (narrator id, English name)."""
        name = norm(heading_name(title_ar))
        if len(name) < 3:
            return None
        if name not in self.cache:
            self.cache[name] = next((hit for form in candidates(name) if (hit := self._lookup(form))), None)
        return self.cache[name]

    def english(self, title_ar: str) -> str | None:
        hit = self.find(title_ar)
        return hit[1] if hit else None
