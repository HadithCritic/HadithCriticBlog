# English text number-prefix audit

The local `text_en` column sometimes begins with a number, but that number is not consistently the row's Arabic `hadith_num`. These prefixes remain part of the English text; they must not be parsed as edition references or copied into Arabic number fields.

| Compilation | Rows | English texts with leading number | Prefix equals local `hadith_num` | Exceptions |
|---|---:|---:|---:|---:|
| Musannaf Ibn Abī Shaybah (local compilation 1) | 39,096 | 923 | 920 | 3 |
| Musannaf ʿAbd al-Razzāq (local compilation 5) | 21,109 | 672 | 671 | 1 |

The mismatches found by the read-only audit are:

| Compilation | Report ID | Arabic `hadith_num` | Leading number in `text_en` |
|---|---:|---:|---:|
| Ibn Abī Shaybah | 244771 | 6815 | 570 |
| Ibn Abī Shaybah | 248714 | 10313 | 50 |
| Ibn Abī Shaybah | 277227 | 34899 | 34900 |
| ʿAbd al-Razzāq | 213683 | blank | 223 |

The ʿAbd al-Razzāq case is especially clear: the English prefix `223` differs from neighboring Arabic numbers `232` and `233`. The source JSON has no leading report number in the Arabic full text for this row. The prefix may come from a separate numbering source or editing process; its provenance is not recorded in the current schema. Do not infer which explanation applies without edition/source evidence.

The counts are recorded as `english_text_leading_number_*`, and the exception list is `english_number_prefix_mismatches` in each generated read-only audit report under `dist-db/alignment/`. They do not indicate text parity failures: the Arabic number field still exactly matches the raw source, and the English text is audited separately.
