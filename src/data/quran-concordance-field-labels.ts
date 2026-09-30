/**
 * Presentation labels for Corpus Coranicum concordance TEI field types.
 *
 * Mappings are grounded in the Corpus Coranicum website English locale and
 * its TEI export mapping at the pinned website repository commit below. The
 * source-native type is always shown alongside a mapped label. Missing keys
 * fall back to the exact native type without interpretation.
 */
export const concordanceLabelSource = {
  repository: "https://github.com/telota/corpus-coranicum-website",
  commit: "27a4fb359218a8c23bbca92b12d76b8516749bb4",
  englishLocalePath: "frontend/src/i18n/database/en.json",
  teiExportPath: "backend/app/Console/Commands/TeiExportConcordanceCommand.php",
  license: "GPL-3.0"
} as const;

export const concordanceFieldLabels: Readonly<Record<string, string>> = Object.freeze({
  sura: "Surah",
  verse: "Verse",
  word_rafi_talmon: "word",
  word_corpus_coranicum: "Corpus Coranicum transcription",
  base_rafi_talmon: "Word in transcription of Rafael-Talmon-Concordance",
  base_corpus_coranicum: "Corpus-Coranicum-transcription, without morphological endings",
  root_rafi_talmon: "Root (in transcription of Rafael-Talmon-Concordance)",
  root_corpus_coranicum: "root in transcription of Corpus Coranicum",
  analyse_prefix1: "prefix1",
  analyse_prefix1_part_of_speech: "prefix1 — part of speech",
  analyse_prefix1_semantic: "prefix 1 — semantic",
  analyse_prefix2: "prefix 2",
  analyse_prefix2_part_of_speech: "prefix 2 — part of speech",
  analyse_prefix2_semantic: "prefix 2 — semantic",
  analyse_prefix3_part_of_speech: "prefix 3 — part of speech",
  analyse_prefix3_semantic: "prefix 3 — semantic",
  analyse_part_of_speech: "part of speech",
  analyse_subcategory: "Subcategory",
  analyse_semantic: "semantic",
  analyse_semantic2: "semantic 2",
  analyse_pattern: "Morphological type (according to Rafael-Talmon-Concordance)",
  analyse_aspect: "aspect",
  analyse_actpass: "voice",
  analyse_mortality: "modality",
  analyse_mood: "mood",
  analyse_prefix: "prefix",
  analyse_gender: "gender",
  analyse_number: "number",
  analyse_casefld: "case",
  analyse_person: "grammatical person",
  analyse_dependent_pron: "pronominal suffix",
  analyse_dependent_person: "grammatical person of the pronominal suffix",
  analyse_dependent_number: "number of the pronominal suffix",
  analyse_dependent_gender: "gender of the pronominal suffix",
  analyse_definite: "determination",
  analyse_diptotic: "inflection",
  analyse_full_analyse: "Full Analysis"
});

export function concordanceFieldDisplayLabel(sourceType: string): string {
  const label = concordanceFieldLabels[sourceType];
  return label ? `${label} (${sourceType})` : sourceType;
}
