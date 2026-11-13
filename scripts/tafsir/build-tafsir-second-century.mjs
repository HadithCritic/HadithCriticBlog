import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const sourceDir = process.argv[2] ?? "C:/Users/Jonathan/Desktop/tafsir/dated tafsir/02 century AH";
const catalogPath = path.join(sourceDir, "Early_Tafsir_Surah_by_Surah_Catalog.json");
const outputDir = path.resolve("src/data/tafsir");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const arabicDir = path.join(sourceDir, "arabic");
const workBySource = {
  sufyan_al_thawri: "thawri",
  ibn_wahb: "ibn_wahb",
  ibn_mujahid: "mujahid",
  yahya_ibn_sallam: "yahya_ibn_sallam",
  muqatil_ibn_sulayman: "muqatil",
};
/* The source catalog has a few boundary and numbering errors in Thawrī. These corrections
   preserve the text and citation while using the placement supported by the quoted verse. */
const thawriVerseCorrections = new Map([
  ...[["entry-0696", 63], ["entry-0697", 64], ["entry-0698", 67], ["entry-0699", 67],
    ["entry-0700", 69], ["entry-0701", 71], ["entry-0702", 72], ["entry-0703", 96],
    ["entry-0704", 104], ["entry-0705", 106]].map(([id, verse]) => [id, { sura: 23, verse }]),
  ...[["entry-0742", 89], ["entry-0743", 119], ["entry-0744", 149], ["entry-0745", 200],
    ["entry-0746", 219], ["entry-0749", 224], ["entry-0750", 227]].map(([id, verse]) => [id, { sura: 26, verse }]),
  ["entry-0854", { sura: 41, verse: 10 }],
  ["entry-0787", { sura: 35, placement: "surah" }],
]);
const rawRecords = new Map();
for (const source of catalog.sources) {
  const bookId = source.original_metadata?.book_id;
  const fileName = fs.readdirSync(arabicDir).find((name) => name.includes(`book ${bookId} —`));
  if (!fileName) continue;
  const sourceFile = JSON.parse(fs.readFileSync(path.join(arabicDir, fileName), "utf8"));
  rawRecords.set(source.source_id, new Map(sourceFile.records.map((item) => [String(item.serial_number), item.text])));
}

/* The supplied Muqātil translation is transcribed by Shamela physical-record serial.
   Page records can contain several verse-placed catalog reports. Align those reports
   to the translated verse markers, and keep any unlocated tail with its surah material. */
const muqatilTranslationPath = path.join(outputDir, "source", "muqatil-80-114-en.json");
const muqatilTranslation = JSON.parse(fs.readFileSync(muqatilTranslationPath, "utf8"));
const muqatilSegments = new Map();
function addMuqatilSegment(report, kind, verse = null) {
  if (report.source_id !== "muqatil_ibn_sulayman" || !report.source_record_serial) return;
  const serial = String(report.source_record_serial);
  const segments = muqatilSegments.get(serial) ?? [];
  segments.push({ kind, verse, sequence: report.sequence_position, entryId: report.entry_id });
  muqatilSegments.set(serial, segments);
}
for (const sura of catalog.surahs) {
  for (const verse of sura.verses ?? []) {
    for (const report of verse.reports ?? []) addMuqatilSegment(report, "verse", verse.verse);
  }
  for (const report of sura.surah_level_material ?? []) addMuqatilSegment(report, "surah");
}
const muqatilEnglish = new Map();
const muqatilFootnotesEnglish = new Map();
const translatedSerials = new Set();
for (const sura of muqatilTranslation.surahs) {
  for (const record of sura.records) {
    const serial = String(record.serial_number);
    if (translatedSerials.has(serial)) throw new Error(`Muqātil translation repeats source serial ${serial}`);
    translatedSerials.add(serial);
    const segments = [...(muqatilSegments.get(serial) ?? [])].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
    if (!segments.length) throw new Error(`Muqātil translation serial ${serial} has no catalog placement`);
    if (record.foot_note_en) muqatilFootnotesEnglish.set(serial, record.foot_note_en);
    const verseSegments = segments.filter((segment) => segment.kind === "verse");
    const surahSegments = segments.filter((segment) => segment.kind === "surah");
    if (surahSegments.length > 1) throw new Error(`Muqātil serial ${serial} has multiple unlocated segments; translation alignment needs review`);

    if (!verseSegments.length) {
      if (surahSegments.length !== 1) throw new Error(`Muqātil serial ${serial} has no safe translation target`);
      muqatilEnglish.set(`${serial}:surah`, record.text_en);
      continue;
    }

    let cursor = 0;
    for (const segment of verseSegments) {
      const matches = [...record.text_en.slice(cursor).matchAll(/\((\d{1,3})\)/g)];
      const marker = matches.find((match) => Number(match[1]) === segment.verse);
      if (!marker) throw new Error(`Muqātil translation ${serial} is missing verse marker ${segment.verse} (${segment.entryId})`);
      const end = cursor + (marker.index ?? 0) + marker[0].length;
      const text = record.text_en.slice(cursor, end).trim();
      if (!text) throw new Error(`Muqātil translation ${serial} has empty text at verse ${segment.verse}`);
      const key = `${serial}:${segment.verse}`;
      if (muqatilEnglish.has(key)) throw new Error(`Muqātil translation ${serial} duplicates verse ${segment.verse}`);
      muqatilEnglish.set(key, text);
      cursor = end;
    }

    const tail = record.text_en.slice(cursor).trim();
    if (surahSegments.length === 1) {
      if (tail) muqatilEnglish.set(`${serial}:surah`, tail);
    } else if (tail) {
      const lastVerse = verseSegments.at(-1).verse;
      muqatilEnglish.set(`${serial}:${lastVerse}`, `${muqatilEnglish.get(`${serial}:${lastVerse}`)}${tail}`);
    }
  }
}
if (translatedSerials.size !== muqatilTranslation.metadata.record_count) {
  throw new Error(`Muqātil translation metadata says ${muqatilTranslation.metadata.record_count} records but found ${translatedSerials.size}`);
}
for (const serial of translatedSerials) {
  if (!muqatilSegments.has(serial)) throw new Error(`Muqātil translation serial ${serial} is not represented in the catalog`);
}

function suppliedMuqatilEnglish(report, verseNo) {
  if (report.source_id !== "muqatil_ibn_sulayman" || !report.source_record_serial) return null;
  const key = verseNo === null ? `${report.source_record_serial}:surah` : `${report.source_record_serial}:${verseNo}`;
  return muqatilEnglish.get(key) ?? null;
}

function originalArabic(report) {
  if (report.text_ar) return report.text_ar;
  const raw = rawRecords.get(report.source_id)?.get(String(report.source_record_serial));
  const label = report.printed_label;
  if (!raw || !label) return null;
  const escaped = String(label).replace(/[.: -]+$/, "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s*");
  const matches = [...raw.matchAll(new RegExp(escaped, "g"))];
  if (matches.length !== 1) return null;
  const start = matches[0].index ?? 0;
  const next = [...raw.slice(start + matches[0][0].length).matchAll(/\s+\d+\s*:\s*\d+(?:\s*[-.])?/g)][0];
  const end = next ? start + matches[0][0].length + (next.index ?? 0) : raw.length;
  return raw.slice(start, end).trim() || null;
}

const files = Array.from({ length: 114 }, (_, i) => ({
  schemaVersion: "tafsir-entries/0.2.0",
  sura: i + 1,
  entries: [],
  silent: {},
  surahMaterial: [],
}));
const counts = Object.fromEntries(Object.values(workBySource).map((id) => [id, { versePlacements: 0, surahMaterial: 0, suras: new Set(), sourceIds: new Set() }]));

function record(report, work, suraNo, verseNo, occurrence = 0) {
  const refs = report.verse_references ?? [];
  const sameSuraRefs = refs.filter((ref) => ref.surah_number === suraNo);
  const refStarts = sameSuraRefs.map((ref) => ref.verse_start ?? ref.verse_number).filter(Number.isFinite);
  const refEnds = sameSuraRefs.map((ref) => ref.verse_end ?? ref.verse_number).filter(Number.isFinite);
  const from = verseNo ?? (refStarts.length ? Math.min(...refStarts) : null);
  const to = verseNo ?? (refEnds.length ? Math.max(...refEnds) : null);
  const textAr = originalArabic(report);
  const suppliedEnglish = suppliedMuqatilEnglish(report, verseNo);
  const textEn = report.text ?? suppliedEnglish;
  const citationPage = report.source_page ?? report.citation?.page ?? "Unpaginated";
  const citationVolume = report.source_volume == null ? null : String(report.source_volume);
  return {
    id: `${report.entry_id ?? `${work}-${suraNo}-${from}`}-at-${from}-${occurrence}`.replace(/[^a-zA-Z0-9_-]/g, "-"),
    work,
    verses: from === null || to === null ? null : { from, to },
    lemma: null,
    reading: [],
    text: textAr ?? textEn ?? "",
    text_ar: textAr,
    text_en: textEn,
    translation_status: suppliedEnglish ? "AI translation attributed to Claude in the supplied source; not independently reviewed" : report.translation_status ?? (textEn ? "English text supplied in catalog" : "no translation supplied"),
    locator_status: report.locator_status ?? "explicit verse locator in source catalogue",
    content_tags: report.content_tags ?? [],
    cross_references: report.cross_references ?? [],
    verse_references: report.verse_references ?? [],
    printed_label: report.printed_label ?? null,
    citation: { volume: citationVolume, page: String(citationPage) },
    source_record_serial: report.source_record_serial ?? null,
    source_entry_id: report.entry_id ?? null,
    sequence_position: report.sequence_position ?? null,
    foot_note_ar: report.foot_note_ar && report.foot_note_ar !== "None" ? report.foot_note_ar : null,
    foot_note_en: work === "muqatil" ? muqatilFootnotesEnglish.get(String(report.source_record_serial)) ?? null : null,
    review_state: "proposed",
  };
}

for (const sura of catalog.surahs) {
  const target = files[sura.surah_number - 1];
  for (const verse of sura.verses ?? []) {
    const occurrenceById = new Map();
    for (const report of verse.reports ?? []) {
      const work = workBySource[report.source_id];
      if (!work) continue;
      const correction = report.source_id === "sufyan_al_thawri" ? thawriVerseCorrections.get(report.entry_id) : undefined;
      const targetSura = correction?.sura ?? sura.surah_number;
      const targetVerse = correction?.verse ?? verse.verse;
      const occurrence = occurrenceById.get(report.entry_id) ?? 0;
      occurrenceById.set(report.entry_id, occurrence + 1);
      if (correction?.placement === "surah") {
        const placed = record(report, work, targetSura, null, occurrence);
        placed.verses = null;
        placed.placement = "surah";
        placed.verse_references = report.verse_references ?? [];
        placed.cross_references = [{ surah_number: 56, verse_start: 7, verse_end: 11, reference_text: "al-Wāqiʿah 7–11" }];
        placed.locator_status = "kept at surah level; the verse reference is to al-Wāqiʿah and no local Fāṭir verse is identified";
        files[targetSura - 1].surahMaterial.push(placed);
        counts[work].surahMaterial += 1;
        counts[work].suras.add(targetSura);
        if (report.entry_id) counts[work].sourceIds.add(report.entry_id);
        continue;
      }
      const placed = record(report, work, targetSura, targetVerse, occurrence);
      if (correction) placed.locator_status = "catalog placement corrected after checking the source wording and its Qurʾānic verse reference";
      files[targetSura - 1].entries.push(placed);
      counts[work].versePlacements += 1;
      counts[work].suras.add(targetSura);
      if (report.entry_id) counts[work].sourceIds.add(report.entry_id);
    }
  }
  for (const report of sura.surah_level_material ?? []) {
    const work = workBySource[report.source_id];
    if (!work) continue;
    target.surahMaterial.push({
      ...record(report, work, sura.surah_number, null),
      id: `${report.entry_id ?? `${work}-${sura.surah_number}`}-surah` .replace(/[^a-zA-Z0-9_-]/g, "-"),
      placement: "surah",
      text: report.text_ar ?? report.text ?? "",
      locator_status: report.locator_status ?? "surah-section placement; no safe verse locator",
      verse_references: report.verse_references ?? [],
    });
    counts[work].surahMaterial += 1;
    counts[work].suras.add(sura.surah_number);
    if (report.entry_id) counts[work].sourceIds.add(report.entry_id);
  }
}

fs.mkdirSync(outputDir, { recursive: true });
for (const file of files) {
  file.entries.sort((a, b) => (a.sequence_position ?? 0) - (b.sequence_position ?? 0));
  file.surahMaterial.sort((a, b) => (a.sequence_position ?? 0) - (b.sequence_position ?? 0));
  const dest = path.join(outputDir, `sura-${String(file.sura).padStart(3, "0")}.json`);
  fs.writeFileSync(dest, `${JSON.stringify(file)}\n`);
}

const registryPath = path.join(outputDir, "works.json");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
for (const item of catalog.sources) {
  const work = workBySource[item.source_id];
  if (!work) continue;
  const entry = registry.works.find((candidate) => candidate.id === work);
  if (entry) entry.extent = { status: "measured", suras: [...counts[work].suras].sort((a, b) => a - b) };
}
fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);

const summary = Object.fromEntries(Object.entries(counts).map(([id, value]) => [id, {
  versePlacements: value.versePlacements,
  surahMaterial: value.surahMaterial,
  suras: [...value.suras].sort((a, b) => a - b).length,
  sourceUnits: value.sourceIds.size,
}]));
fs.writeFileSync(path.join(outputDir, "second-century-source.json"), `${JSON.stringify({
  source: catalog.metadata.title,
  description: catalog.metadata.description,
  organization: catalog.organization,
  readerCoverage: {
    locatedSourceUnits: Object.values(summary).reduce((sum, item) => sum + item.sourceUnits, 0),
    sourceUnitsWithoutSafeSurahLocator: catalog.organization.ibn_wahb_reports_without_safe_locator,
  },
  placementAdjustments: [
    { source: "sufyan_al_thawri", source_record_serials: ["371456", "371457"], from_sura: 22, to_sura: 23,
      source_entry_ids: [...thawriVerseCorrections.entries()].filter(([, fix]) => fix.sura === 23).map(([id]) => id),
      reason: "The source export carries passages from al-Muʾminūn under its preceding al-Ḥajj section heading; the quoted verse wording identifies the correct sura." },
    { source: "sufyan_al_thawri", from_sura: 25, to_sura: 26,
      source_entry_ids: [...thawriVerseCorrections.entries()].filter(([, fix]) => fix.sura === 26).map(([id]) => id),
      reason: "These verse numbers exceed al-Furqān's 77 verses; the quoted passages belong to the following sura, ash-Shuʿarāʾ." },
    { source: "sufyan_al_thawri", from_sura: 41, to_sura: 41, source_entry_ids: ["entry-0854"],
      reason: "The catalog marks verse 910 as a sic and identifies the intended verse as 10." },
    { source: "sufyan_al_thawri", from_sura: 35, to_sura: 35, source_entry_ids: ["entry-0787"],
      reason: "The cited 7–11 range is explicitly from al-Wāqiʿah, not Fāṭir; without a local verse locator the passage stays at surah level." },
  ],
  works: catalog.sources.map(({ source_id, title, author, editor, edition, publisher, volume_count, report_count }) => ({
    id: workBySource[source_id], source_id, title, author, editor: editor ?? null, edition: edition ?? null,
    publisher: publisher ?? null, volume_count: volume_count ?? null, report_count: report_count ?? null,
  })),
  summary,
}, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
