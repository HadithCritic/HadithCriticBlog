# newtexts folder: what was in it and what happened to each file

Reviewed 2026-09-29 for `Desktop\newtexts` (76 PDFs). Every file was opened and identified from its own first pages. All were renamed to the library's `Surname_Initials_-_Title.pdf` pattern. The old-to-new mapping is in `Desktop\newtexts\_rename_log.csv`, so any rename can be reversed.

Verdicts:

- **Added** means the work is now in the atlas at `/research/`. The atlas reads it from `Desktop\newtexts` (set `HADITH_NEWTEXTS_DIR` if the folder moves). Move it into the library folder if you want it kept there.
- **Duplicate** means the same file or the same work is already in the library or elsewhere in this folder. Files with a `_duplicate` suffix are safe to delete after you have read this table.
- **Needs OCR** means the PDF is a scan or its text layer is unusable, so the atlas cannot read it yet.
- **Out of scope** means it is not about ḥadīth criticism, sīra sources or rijāl (mostly Qur'ān, Bible and law).

## Added (28 works, including two volumes)

| File | What it is |
|---|---|
| Brown_J_A_C_-_Did_the_Prophet_Say_It_or_Not | Brown, JAOS 129.2 (2009). Year and venue are from memory, marked unconfirmed. |
| Brown_J_A_C_-_Even_If_Its_Not_True_Its_True... | Brown, *Islamic Law and Society* 18.1 (2011) |
| Dickinson_E_-_Ibn_al-Salah_al-Shahrazuri_and_the_Isnad | Dickinson, JAOS 122.3 (2002) |
| Little_J_J_-_Beyond_the_Common_Link... | Little, *Comparative Islamic Studies* 16.1 (2020) |
| Pavlovitch_P_-_The_Stoning_of_a_Pregnant_Adulteress_from_Juhayna | Pavlovitch, *ILS* 17.1 (2010) |
| Pavlovitch_P_-_Early_Development_of_the_Tradition_of_the_Self-Confessed_Adulterer_in_Islam | Pavlovitch, *Al-Qanṭara* 31.2 (2010) |
| Pavlovitch_P_-_Some_Sunni_Hadith_on_the_Quranic_Term_Kalala | Pavlovitch, *ILS* 19 (2012) |
| Syed_M_U_-_The_Construction_of_Historical_Memory_in_the_Exegesis_of_Kor_16_106 | Syed, *Arabica* 62 (2015), on the ʿAmmār b. Yāsir reports |
| Su_I_-_The_Early_Shii_Kufan_Traditionists_Perspective... | Su, JAOS 141.1 (2021) |
| Powers_D_S_-_The_Will_of_Sad_b_Abi_Waqqas_A_Reassessment | Powers, *Studia Islamica* 58 (1983) |
| Hallaq_W_B_-_On_Dating_Maliks_Muwatta | Hallaq, *UCLA J. Islamic and Near Eastern Law* 1 (2001-2002) |
| El_Shamsy_A_-_The_Ur-Muwatta_and_Its_Recensions | El Shamsy, *ILS* 28.4 (2021) |
| Ehteshami_A_-_The_Four_Books_of_Shii_Hadith... | Ehteshami, *ILS* 29.3 (Crossref dates it 2021) |
| Al-Rahawan_M_S_M_I_-_Detecting_Textual_Additions_of_Reliable_Hadith_Transmitters | Al-Rahawan, *Islamic Studies* 49.3 (2010) |
| Topgul_M_E_-_Dont_You_Ever_Say_a_Word_About_Him... | Topgül, *İslam Tetkikleri Dergisi* 14.2 (2024) |
| Cimen_F_-_Istikamet_Hadisinin_Isnad_ve_Metin_Analizi | Çimen, *Hadis Tetkikleri Dergisi* 15.1 (2017), Turkish |
| Wazna_R_and_Ilyas_H_-_The_Logic_Probability_on_Hadith... | Wazna and Ilyas, *Jurnal Ushuluddin* 27.2 (2019) |
| Ali_F_B_-_Al-Hudaybiya_An_Alternative_Version | F. B. Ali, *The Muslim World* 71.1 (1981) |
| Rubin_U_-_The_Constitution_of_Medina_Some_Notes | Rubin, *Studia Islamica* 62 (1985) |
| Rippin_A_-_Review_of_The_Transmission_and_Dynamics... | Rippin's review of the Motzki festschrift, linked to it as a review |
| Musa_A_Y_-_Hadith_as_Scripture | Musa (2008), full book |
| Abbott_N_-_Studies_in_Arabic_Literary_Papyri_II | Abbott, Oriental Institute Publications 76 (1967), full book |
| Duri_A_A_-_The_Rise_of_Historical_Writing_among_the_Arabs | Duri, trans. Conrad (Princeton, 1983), full book |
| Lowry_J_E_-_Early_Islamic_Legal_Theory... | Lowry (Brill, 2007), full book |
| Schoeler_G_-_Charakter_und_Authentie... | Schoeler (1996), full book, German |
| Scheiner_J_J_-_Die_Eroberung_von_Damaskus... | Scheiner (Brill, 2010), full book, German |
| Sijpesteijn_P_M_and_Adang_C_eds_-_Islam_at_250... | The volume is in the library (identical file) and is now decomposed into 13 studies |
| (library) Berg_H_ed_-_Method_and_Theory_in.pdf | Berg's volume, added as requested and decomposed into 12 studies |

## Needs OCR (not added yet)

| File | Problem |
|---|---|
| Lucas_S_C_-_Constructive_Critics_Hadith_Literature_and_the_Articulation_of_Sunni_Islam | Six scanned chunks (`a`, `a-1` to `a-5`) had no text layer. They were merged in reading order into one 231-page PDF (title page to index, two printed pages per PDF page). The six originals are in `_merged_parts`. |
| Motzki_H_-_The_Prophet_and_the_Cat... | Rotated scan, 27 MB, the embedded text is garbage |
| Hallaq_W_B_-_Was_al-Shafii_the_Master_Architect... | The text layer is a character-shifted encoding and reads as nonsense |

## Held back

| File | Reason |
|---|---|
| Lowry_J_E_trans_-_al-Shafii_The_Epistle_on_Legal_Theory | A primary-source translation, not a study. Held until the atlas has a classical-source node type. |
| Gorke_A_and_Schoeler_G_-_..._ch8_excerpt_pp164-190, ..._front_matter_and_contents (2 files) | Partial copies of *The Earliest Writings on the Life of Muḥammad*. The library already holds a full copy of the book, which is still to be added. |
| Schoeler_G_-_Foundations_for_a_New_Biography_of_Muhammad_Persian_translation | A Persian translation of a chapter in Berg's volume, which is now in the atlas |
| Hallaq_W_B_-_On_Dating_Maliks_Muwatta_Arabic_translation_in_journal_issue | An Arabic translation printed in a journal issue |

## Duplicates

| File | Duplicate of |
|---|---|
| Cook_M_-_The_Opponents_of_the_Writing_of_Tradition_in_Early_Islam_duplicate (2 files) | Identical to the library copy |
| Su_I_-_The_Martyrs_on_the_Mountain_duplicate | Identical to the library copy |
| Su_I_-_The_Companions_in_Heaven_preprint_duplicate | Identical to the library copy |
| Anthony_S_W_-_The_Arabs_and_the_Ummah_of_Muhammad_duplicate | Identical to the library copy |
| Dawood_J_M_-_Beyond_the_Uthmanic_Codex_duplicate (2 files) | Identical to the library copy |
| Zellentin_H_-_Jesus_Miracles..._preprint_duplicate (2 files) | Identical to the library copy |
| Sijpesteijn_P_M_and_Adang_C_eds_-_Islam_at_250..._duplicate | Identical to the library copy |
| Pavlovitch_P_-_Early_Development..._Adulterer_..._duplicate | The same file twice in this folder |
| Gorke_A_and_Schoeler_G_-_..._front_matter_and_contents_duplicate | The same file twice in this folder |
| Kara_S_-_Review_of_Haider_The_Origins_of_the_Shia_duplicate | The same file twice in this folder |
| Syed_M_U_-_..._Kor_16_106_duplicate | A second copy of the same article (a different file) |
| Pavlovitch_P_and_Powers_D_S_-_A_Bequest_May_Not_Exceed_One_Third_offprint_duplicate | Same work as the library's 44-page copy |
| Motzki_H_-_Abraham_Hagar_and_Ishmael_at_Mecca_preprint_duplicate | Same work as the library's 27-page copy |
| Melchert_C_-_Al-Shafii_Against_the_Kufan_School_duplicate | Same work as the library's 24-page copy |
| Boekhoff-van_der_Voort_N_-_The_Concept_of_Sunna_preprint_duplicate | A preprint of a study already listed inside Duderija's volume |
| van_Putten_M_-_The_Ark_of_the_Covenants_Spelling_Controversy_duplicate | Same work as the library's 8-page copy |
| Anthony_S_W_-_Two_Lost_Suras_of_the_Quran_al-Khal_and_al-Hafd_duplicate | Same work as the library's 46-page copy |
| Freijat_S_A_and_Hawamdeh_M_F_-_..._duplicate (2 files) | The same file twice in this folder |

Note: `Ceulemans_R_and_Verhasselt_G_-_Fragments_of_the_Wisdom_of_Solomon_from_Khirbet_Mird.pdf` is byte-identical to the library file `Ceulemans_R_and_Verhasselt_A_-_Greek_Scholia.pdf`. The library file name looks wrong for its content.

## Out of scope

Qurʾān and Semitic studies: Khalil (Q 2:54), Al-Jallad and Al-Manaser (ʿsy inscription, garbled text layer), Cole (islām as paradosis), Freijat and Hawamdeh (disjointed letters), Dawood (Uthmanic codex), van Putten (Ark spelling), Anthony (two lost sūras), Elouazzani (Neuwirth's philological method, Arabic), Graves (Wansbrough and biblical form criticism; adjacent, worth revisiting if the atlas takes in Wansbrough's method).

Bible and late antiquity: Zellentin, Matusova, Ceulemans and Verhasselt, Wevers (a review of the Peshitta Old Testament), North (Cædmon and Muḥammad).

Law and other: Hendrickson (Mālikī fatwās on the ḥajj), Morrissey (music in Islamic law), Alshanqiti and Mizan (Makdisi on legal theory), D. Cook (Mongol-era apocalyptic), D. Cook (excerpt of the *Book of Tribulations*), Kara (a review of Haider's *Origins of the Shīʿa*; adjacent, touches ḥadīth reliability).
