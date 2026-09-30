# Quran Platform Display Asset Rights

This register covers typography used by the site that displays the Quran
modules. These are presentation assets, not Quran source records or data-release
assets. No font binaries are included in the Quran JSON or SQLite releases.

| Asset | How the site uses it | Rights evidence | Scope / reproducibility note |
|---|---|---|---|
| Quran variant illustration v2 (`public/images/quran-variants-art-v2.webp`) | Decorative image on the homepage and Projects directory; its empty alt text and `aria-hidden` keep it out of the evidence layer. | Generated for this project with the built-in image generation tool on 2026-09-29. SHA-256: `78e3324dd431c74b412e7dc392519da013f1825c058f1cdea71414bb700450b9`. The art contains only geometric comparison bars and lines; no source manuscript or source text was supplied. | Local preview asset. Tool-use and redistribution terms are not audited in this repository; keep external publication `needs_review`. The prior image with pseudo-script is archived at ignored `scratch/quran/retired-quran-variants-art-with-pseudotext.webp` and is excluded from the production build. Neither image is a manuscript or source text. |
| Glacial Indifference | Self-hosted UI font at `public/fonts/glacial-indifference-regular.woff2` and `public/fonts/glacial-indifference-bold.woff2` | The adjacent `public/fonts/GlacialIndifference-OFL.txt` carries the SIL Open Font License 1.1 text and copyright notice. | Font files and license are site assets. Their rights do not change the Quran data license. |
| Poppins | Google Fonts stylesheet requested by `src/layouts/BaseLayout.astro` | Google Fonts family metadata records `license: "OFL"` and identifies the Poppins source repository and source commit `738d9d691b66f1ad917123c58df104d16c74e1a7`: [Google Fonts Poppins metadata](https://github.com/google/fonts/blob/main/ofl/poppins/METADATA.pb). | The site references Google Fonts at runtime; the returned stylesheet and font files are not bundled or hashed in a Quran release. |
| Gentium Plus | Google Fonts stylesheet requested by `src/layouts/BaseLayout.astro` | Google Fonts family metadata records `license: "OFL"`; the upstream source is SIL International commit `7ac5e5ca61b776c5b8df4522c04b9707573ffd42`: [Google Fonts Gentium Plus metadata](https://github.com/google/fonts/blob/main/ofl/gentiumplus/METADATA.pb). | The site references Google Fonts at runtime; the returned stylesheet and font files are not bundled or hashed in a Quran release. |
| Amiri | Google Fonts stylesheet requested by `src/layouts/BaseLayout.astro` | Google Fonts family metadata records `license: "OFL"`; the upstream source is Amiri commit `04d40ee68cc6b8cb6870eca81a8a7451165aa95a`: [Google Fonts Amiri metadata](https://github.com/google/fonts/blob/main/ofl/amiri/METADATA.pb). | The site references Google Fonts at runtime; the returned stylesheet and font files are not bundled or hashed in a Quran release. |
| Amiri Quran | Google Fonts stylesheet requested by `src/layouts/BaseLayout.astro` | Google Fonts family metadata records `license: "OFL"`; the upstream source is Amiri commit `480bb746e99ea700bb0d6b4dbf96302d58192103`: [Google Fonts Amiri Quran metadata](https://github.com/google/fonts/blob/main/ofl/amiriquran/METADATA.pb). | The site references Google Fonts at runtime; the returned stylesheet and font files are not bundled or hashed in a Quran release. |

## Boundary

The pinned Quran dataset license applies to the Corpus Coranicum-derived data
only. Font licensing is tracked here, separately from source-text and
manuscript-image rights. Google Fonts family metadata was checked on
2026-09-28; the Google Fonts API reference in the site is not a pinned font
binary release. A future requirement for byte-identical rendering must pin and
hash the exact served font files before treating them as reproducible build
inputs. This does not affect source-string fidelity or the current local data
release.
