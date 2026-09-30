import type Sura from "../data/qiraat/sura-001.json";
import names from "../data/quran-sura-names.json";
import { splitParts, type PartSpan } from "./qiraat-parts";

/* Every sura with a data file, in sura order. Data is built by scripts/quran/qiraat/build-qiraat.py. */
export type SuraData = typeof Sura;

export interface SuraName {
  n: number;
  ar: string;
  latin: string;
  verses: number;
}

export interface SuraNeighbour {
  n: number;
  latin: string;
}

export interface SuraEntry {
  n: number;
  data: SuraData;
  name: SuraName;
  prev: SuraNeighbour | null;
  next: SuraNeighbour | null;
  parts: PartSpan[];
}

export function loadSuras(): SuraEntry[] {
  const files = import.meta.glob("../data/qiraat/sura-*.json", { eager: true, import: "default" });
  const suras = Object.entries(files)
    .map(([path, data]) => ({ n: Number(path.match(/sura-(\d+)\.json$/)![1]), data: data as SuraData }))
    .sort((a, b) => a.n - b.n);
  const link = (entry?: { n: number }): SuraNeighbour | null => (entry ? { n: entry.n, latin: names[entry.n - 1].latin } : null);

  return suras.map((sura, index) => ({
    n: sura.n,
    data: sura.data,
    name: names[sura.n - 1],
    prev: link(suras[index - 1]),
    next: link(suras[index + 1]),
    parts: splitParts(sura.data.features),
  }));
}
