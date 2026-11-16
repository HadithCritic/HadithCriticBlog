"""All scenes in book order, and the default stroke flow (radians) for each."""

from scenes_a import SCENES_A, hero
from scenes_b import SCENES_B

ORDER = [
    "faith", "knowledge", "purification", "prayer", "zakah", "fasting", "hajj", "marriage",
    "istibra", "nursing", "divorce", "expenditures", "tadbir", "oaths", "hudud", "jihad",
    "sales", "pledge", "preemption", "sharecropping", "virtues", "community", "foods",
    "clothing", "medicine", "etiquette", "riqaq", "crimes", "judgments", "trials", "tafsir",
    "bequests", "paradise",
]

SCENES = {**SCENES_A, **SCENES_B}
SCENES = {name: SCENES[name] for name in ORDER}
HERO = hero

FLOW = {"trials": 0.0, "community": 0.0, "riqaq": 0.0}
