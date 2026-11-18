# Third-century collections: image prompts

Image prompts for giving the 3rd-century hadith collections the painted front page that al-Shamāʾil al-Muḥammadiyya has (`/hadith/collection/al-shama-il-al-muhammadiyah/`): one wide hero and one painted plate per chapter. Every prompt below is complete on its own, so it can be pasted into an image model as it stands.

991 chapter plates and 16 heroes.

## The style, taken from al-Shamāʾil

The al-Shamāʾil plates (`public/images/hadith/chapter-covers/al-shama-il-al-muhammadiyah/`) share a few rules, and every prompt here repeats them:

- **Medium:** oil paint with thick impasto and loose, visible strokes. The chapter plates are looser and chunkier; the hero is finer and more detailed.
- **Light:** warm, low, golden light with soft shadows, often sun through a lattice or an arch.
- **Subject:** a quiet still life or an empty place that stands for the chapter: an object, a room, a courtyard, a landscape. No people anywhere, no faces or hands, and no text of any kind.
- **Period:** objects and buildings of the early Islamic world (7th to 9th century): mudbrick, palm wood, reed mats, brass, clay, linen and wool.
- **Format:** chapter plates are portrait 5:6 and saved at 880 x 1056. The hero is 16:9 and saved at 1400 x 788, with the left 40 percent left in near-black shadow so the title can sit on it.

Each collection keeps the warm al-Shamāʾil base and adds a **light key** of its own (an accent color taken from its palette in `src/data/hadith/collection-identities.ts`), so the works read as one family without looking identical.

## Negative prompt

For models that take one, use this with every prompt:

```text
people, person, figure, man, woman, child, face, hands, crowd, silhouette, text, letters, writing, calligraphy, inscription, signature, watermark, logo, modern objects, plastic, glass windows with frames, electric light, photograph, 3D render, cartoon, anime, flat vector
```

## Files

| Image | Path | Size |
| --- | --- | --- |
| Hero | `public/images/hadith/covers/<slug>.webp` | 1400 x 788 |
| Chapter plate | `public/images/hadith/chapter-covers/<slug>/NN.webp` | 880 x 1056 |

`NN` is the chapter number padded to two digits (`01`, `09`, `10`, `186`). Generate at any larger size with the same ratio and scale down. Several of these collections already have a card cover at the hero path; the new hero replaces it, as it did for al-Shamāʾil, so check the card crop in `src/lib/hadith-art.ts` once it is in.

## Notes

- Musnad al-Ḥumaydī has no chapter 49 in its index (it goes from 48 to 50), so there is no plate 49.
- The musnads arranged by Companion (al-Ḥumaydī, Ibn Abī Shayba, Khalīfa ibn Khayyāṭ, al-Anṣārī, Saʿd) take each plate from that person's life or from the report the chapter holds, never from a portrait.
- Ḥadīth Abī al-Yamān, Kitāb al-Fitan and Kitāb al-Zuhd are single-page readers with no chapters, so they get a hero only.

## Contents

| Collection | Compiler | Chapters |
| --- | --- | --- |
| [Kitāb al-Kharāj of Yaḥyā ibn Ādam](#kitab-al-kharaj-of-yahya-ibn-adam) | Yaḥyā ibn Ādam (d. 203 AH), Kufa | 21 |
| [Musnad al-Shāfiʿī](#musnad-al-shafii) | al-Shāfiʿī (d. 204 AH), Fusṭāṭ; transmitted by al-Rabīʿ ibn Sulaymān | 68 |
| [Ḥadīth Muḥammad ibn ʿAbd Allāh al-Anṣārī](#hadith-muhammad-ibn-abd-allah-al-ansari) | Muḥammad ibn ʿAbd Allāh al-Anṣārī (d. 215 AH), Basra | 27 |
| [Kitāb al-Ṣalāh of Abū Nuʿaym](#kitab-al-salah-of-abu-nuaym) | Abū Nuʿaym al-Faḍl ibn Dukayn (d. 219 AH), Kufa | 66 |
| [Musnad al-Ḥumaydī](#musnad-al-humaydi) | al-Ḥumaydī (d. 219 AH), Mecca | 186 |
| [Ḥadīth of Abū al-Yamān](#hadith-of-abu-al-yaman) | Abū al-Yamān al-Ḥakam ibn Nāfiʿ (d. 222 AH), Ḥimṣ | hero only |
| [Musnad Ibn Abī Shayba](#musnad-ibn-abi-shayba) | Abū Bakr ibn Abī Shayba (d. 235 AH), Kufa | 281 |
| [Musnad Khalīfa ibn Khayyāṭ](#musnad-khalifa-ibn-khayyat) | Khalīfa ibn Khayyāṭ (d. 240 AH), Basra | 47 |
| [Kitāb al-Īmān of Ibn Abī ʿUmar al-ʿAdanī](#kitab-al-iman-of-ibn-abi-umar-al-adani) | Ibn Abī ʿUmar al-ʿAdanī (d. 243 AH), Aden and Mecca | 56 |
| [Qirāʾāt al-Nabī of al-Dūrī](#qiraat-al-nabi-of-al-duri) | Abū ʿUmar al-Dūrī (d. 246 AH), Baghdad and Samarra | 49 |
| [Musnad Saʿd ibn Abī Waqqāṣ](#musnad-sad-ibn-abi-waqqas) | al-Dawraqī (d. 246 AH), Baghdad; reports of Saʿd ibn Abī Waqqāṣ | 9 |
| [Birr al-Wālidayn](#birr-al-walidayn) | al-Bukhārī (d. 256 AH) | 45 |
| [Sunan al-Athram](#sunan-al-athram) | al-Athram (d. 273 AH), Baghdad | 22 |
| [Kitāb al-Fitan of Ḥanbal ibn Isḥāq](#kitab-al-fitan-of-hanbal-ibn-ishaq) | Ḥanbal ibn Isḥāq (d. 273 AH), Baghdad | hero only |
| [al-Marāsīl of Abū Dāwūd](#al-marasil-of-abu-dawud) | Abū Dāwūd al-Sijistānī (d. 275 AH), Basra | 114 |
| [Kitāb al-Zuhd of Abū Ḥātim al-Rāzī](#kitab-al-zuhd-of-abu-hatim-al-razi) | Abū Ḥātim al-Rāzī (d. 277 AH), Rayy | hero only |

<a id="kitab-al-kharaj-of-yahya-ibn-adam"></a>

## Kitāb al-Kharāj of Yaḥyā ibn Ādam

- Slug: `kitab-al-kharaj-yahya-ibn-adam`
- Compiler: Yaḥyā ibn Ādam (d. 203 AH), Kufa
- Chapters: 21
- Light key: olive green and ripe wheat-gold accents in harvest light

### Hero

Save as `public/images/hadith/covers/kitab-al-kharaj-yahya-ibn-adam.webp` at 1400 x 788.

```text
A mudbrick tax office in Kufa at golden hour. Through a wide arched opening on the right, irrigated fields of the Sawad of Iraq stretch to the Euphrates, cut by straight canals and lines of date palms. On a low wooden table in the right foreground: a closed ledger bound in leather, a brass balance scale, a wooden ṣāʿ measure heaped with wheat, a coiled surveyor's rope and a small oil lamp. Detailed oil painting with fine brushwork on softly aged canvas, warm lamp and window light against deep umber shadow. The left 40 percent of the frame falls into soft, nearly black shadow with no detail, leaving clean space for a title; every object and all of the light sit in the right 60 percent. No people or human figures, no writing, letters, calligraphy or inscriptions, no modern objects. Wide landscape composition, 16:9 aspect ratio.
```

### Chapter plates

Save each as `public/images/hadith/chapter-covers/kitab-al-kharaj-yahya-ibn-adam/NN.webp` at 880 x 1056.

#### 1. In the name of God, the Most Merciful, the Most Compassionate. Chapter on the ghanīma (booty) and the fayʾ.

File: `01.webp`

```text
Spoils laid out on a reed mat inside a campaign tent: a bronze tray of silver coins, a folded banner, a sheathed sword and bales of striped cloth, sunlight slanting through the open tent flap. Setting: the farmland of the Sawad around Kufa, with plastered mudbrick, palm wood and woven reed. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with olive green and ripe wheat-gold accents in harvest light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 2. Chapter: As for the Jizya and the Kharāj (بَابٌ: وَأَمَّا الْجِزْيَةُ وَالْخَرَاجُ)

File: `02.webp`

```text
A tax collector's table in a mudbrick office: small heaps of silver dirhams, a brass balance scale, a clay tally tag on a cord and a closed ledger, a window opening onto green fields. Setting: the farmland of the Sawad around Kufa, with plastered mudbrick, palm wood and woven reed. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with olive green and ripe wheat-gold accents in harvest light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 3. Chapter on Land Grants (Qaṭāʾiʿ) (بَابُ الْقَطَائِعِ)

File: `03.webp`

```text
A blank parchment deed weighted at its corners with small stones on a low table, and through the window a parcel of irrigated land marked out by whitewashed boundary stones. Setting: the farmland of the Sawad around Kufa, with plastered mudbrick, palm wood and woven reed. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with olive green and ripe wheat-gold accents in harvest light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 4. Chapter on Planting Palm Trees and Cultivation (بَابُ غَرْسِ النَّخْلِ وَالزَّرْعِ)

File: `04.webp`

```text
Rows of young date-palm offshoots freshly planted in dark, wet earth, a wooden digging tool and a clay water jar resting beside them in early morning light. Setting: the farmland of the Sawad around Kufa, with plastered mudbrick, palm wood and woven reed. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with olive green and ripe wheat-gold accents in harvest light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 5. Chapter on Whoever Revives Dead Land (بَابُ مَنْ أَحْيَا أَرْضًا مَيْتَةً)

File: `05.webp`

```text
Cracked desert ground turning green: a newly dug channel carries water to the first shoots, a hoe leaning against a stone at the channel's head. Setting: the farmland of the Sawad around Kufa, with plastered mudbrick, palm wood and woven reed. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with olive green and ripe wheat-gold accents in harvest light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 6. Chapter on Taḥjīr (Staking a Claim) (بَابُ التَّحْجِيرِ)

File: `06.webp`

```text
A rough line of stones laid across open, untilled ground to mark a claim, a small cairn at the corner, long shadows at late afternoon. Setting: the farmland of the Sawad around Kufa, with plastered mudbrick, palm wood and woven reed. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with olive green and ripe wheat-gold accents in harvest light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 7. Chapter on Whoever Builds or Plants in the Land of a People Without Their Permission

File: `07.webp`

```text
A half-built mudbrick wall abandoned at the edge of someone else's orchard, a basket of unused bricks and an uprooted sapling lying in the dust. Setting: the farmland of the Sawad around Kufa, with plastered mudbrick, palm wood and woven reed. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with olive green and ripe wheat-gold accents in harvest light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 8. Chapter on Springs and Rivers, and What Is Mentioned About the Sale of Surplus Water (بَابُ الْعُيُونِ وَالْأَنْهَارِ وَمَا ذُكِرَ فِي بَيْعِ فَضْلِ الْمَاءِ)

File: `08.webp`

```text
A spring welling into a stone basin, its overflow split into two small field channels, a clay jar on the rim and palms beyond. Setting: the farmland of the Sawad around Kufa, with plastered mudbrick, palm wood and woven reed. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with olive green and ripe wheat-gold accents in harvest light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 9. Chapter on Zakāt on Land, Crops, and Fruits (بَابُ الزَّكَاةِ فِي الْأَرْضِ وَالزَّرْعِ وَالثِّمَارِ)

File: `09.webp`

```text
Baskets of wheat, barley and dates set side by side on a stamped-earth threshing floor, a wooden measuring vessel resting on top. Setting: the farmland of the Sawad around Kufa, with plastered mudbrick, palm wood and woven reed. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with olive green and ripe wheat-gold accents in harvest light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 10. Chapter on What the Sky Waters, or What Is Watered by the Bucket (Gharb) (بَابُ مَا سَقَتِ السَّمَاءُ ، أَوْ سُقِيَ بِغَرْبٍ)

File: `10.webp`

```text
A leather well bucket hanging from a wooden frame over a well, while rain clouds break over the rain-fed fields beyond. Setting: the farmland of the Sawad around Kufa, with plastered mudbrick, palm wood and woven reed. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with olive green and ripe wheat-gold accents in harvest light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 11. Chapter on His Saying: {And give its due on the day of its harvest} [al-Anʿām 6:141] (بَابُ قَوْلِهِ: {وَآتُوا حَقَّهُ يَوْمَ حَصَادِهِ} [ الأنعام: 141])

File: `11.webp`

```text
A freshly cut sheaf of wheat set apart from the main harvest stack, a sickle on the stubble and a small bowl of grain beside it in golden harvest light. Setting: the farmland of the Sawad around Kufa, with plastered mudbrick, palm wood and woven reed. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with olive green and ripe wheat-gold accents in harvest light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 12. Chapter on Picking and Harvesting at Night, and the Prohibition of It (بَابُ الْجَذَاذِ وَالْحَصَادِ بِاللَّيْلِ ، وَالنَّهْيِ عَنْهُ)

File: `12.webp`

```text
A palm grove at night under a thin crescent moon, ladders and empty harvest baskets left untouched at the foot of the trees until morning. Setting: the farmland of the Sawad around Kufa, with plastered mudbrick, palm wood and woven reed. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with olive green and ripe wheat-gold accents in harvest light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 13. Chapter on the Excellence of Trade, Farming, and Palms (بَابُ فَضْلِ التِّجَارَةِ وَالزَّرْعِ وَالنَّخْلِ)

File: `13.webp`

```text
A stall at the edge of a palm grove: bolts of cloth, open sacks of grain, a basket of dates and a set of scales, trade and farming side by side. Setting: the farmland of the Sawad around Kufa, with plastered mudbrick, palm wood and woven reed. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with olive green and ripe wheat-gold accents in harvest light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 14. Chapter on What Is Disliked to Be Given as Ṣadaqa (بَابُ مَا يُكْرَهُ أَنْ يُعْطَى فِي الصَّدَقَةِ)

File: `14.webp`

```text
A basket of withered, inferior dates set beside a basket of glossy ripe dates on a stone ledge, the good basket in full light. Setting: the farmland of the Sawad around Kufa, with plastered mudbrick, palm wood and woven reed. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with olive green and ripe wheat-gold accents in harvest light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 15. Chapter on the Awsāq and What Requires Zakāt (بَابُ الْأَوْسَاقِ ، وَمَا يَجِبُ فِيهِ الزَّكَاةُ)

File: `15.webp`

```text
Five large loads of dates in woven sacks stacked against a mudbrick wall, a wooden ṣāʿ measure resting on the top sack. Setting: the farmland of the Sawad around Kufa, with plastered mudbrick, palm wood and woven reed. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with olive green and ripe wheat-gold accents in harvest light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 16. Chapter: The Amount of the Wasq in Ṣāʿs, and Its Quantity (بَابٌ: مَبْلَغُ كَيْلِ الْوَسْقِ صَاعًا وَمِقْدَارُهُ)

File: `16.webp`

```text
A row of identical wooden ṣāʿ measures lined up along a plank, each filled level with grain, beside a large heap of dates. Setting: the farmland of the Sawad around Kufa, with plastered mudbrick, palm wood and woven reed. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with olive green and ripe wheat-gold accents in harvest light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 17. Chapter on the Measure of the Ṣāʿ (بَابُ مِقْدَارِ الصَّاعِ)

File: `17.webp`

```text
A close still life of a single wooden ṣāʿ measure and a smaller mudd measure, both full of barley, on a clean linen cloth. Setting: the farmland of the Sawad around Kufa, with plastered mudbrick, palm wood and woven reed. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with olive green and ripe wheat-gold accents in harvest light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 18. Chapter on Whoever Said: In What the Earth Brings Forth, Little or Much, There Is Ṣadaqa; Among Them Ibrāhīm and Others; and They Differed Regarding Ibrāhīm on It, and Regarding ʿAṭāʾ (بَابُ مَنْ قَالَ: فِيمَا أَخْرَجَتِ الْأَرْضُ قَلِيلٌ أَوْكَثِيرٌ الصَّدَقَةُ فَمِنْهُمْ إِبْرَاهِيمُ وَغَيْرُهُ، وَاخْتَلَفُوا عَنْ إِبْرَاهِيمَ فِيهِ، وَعَنْ عَطَاءٍ)

File: `18.webp`

```text
Produce of every size spread on a reed mat: a single cucumber, a handful of lentils, bundles of greens, onions and a heap of melons. Setting: the farmland of the Sawad around Kufa, with plastered mudbrick, palm wood and woven reed. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with olive green and ripe wheat-gold accents in harvest light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 19. Chapter: Whoever Said: Ṣadaqa Is Due Only on Wheat, Barley, Dates and Raisins Specifically, and There Is No Ṣadaqa in… (بَابٌ: مَنْ قَالَ: الصَّدَقَةُ فِي الْحِنْطَةِ وَالشَّعِيرِ وَالتَّمْرِ وَالزَّبِيبِ خَاصَّةً ، وَلَيْسَ فِي صَدَقَةٍ)

File: `19.webp`

```text
Four bowls in a neat row holding wheat, barley, dates and raisins, while vegetables and greens are pushed to the side of the mat. Setting: the farmland of the Sawad around Kufa, with plastered mudbrick, palm wood and woven reed. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with olive green and ripe wheat-gold accents in harvest light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 20. Chapter: Whoever Said That What Does Not Last in People’s Hands for the Year, of Measured Grain and the Like, Is Not Subject to Zakāt (بَابٌ: مَنْ قَالَ مَا يَحِيلُ فِي أَيْدِي النَّاسِ مِمَّا يُكَالُ مِنَ الْحَبِّ وَنَحْوِهِ)

File: `20.webp`

```text
Tall storage jars of grain lined against the cool wall of a storeroom, one jar opened with a measuring bowl in front of it. Setting: the farmland of the Sawad around Kufa, with plastered mudbrick, palm wood and woven reed. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with olive green and ripe wheat-gold accents in harvest light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 21. Chapter (بَابٌ)

File: `21.webp`

```text
A wooden water wheel turning beside an irrigation canal at sunset, sacks of grain stacked at its foot. Setting: the farmland of the Sawad around Kufa, with plastered mudbrick, palm wood and woven reed. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with olive green and ripe wheat-gold accents in harvest light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```


<a id="musnad-al-shafii"></a>

## Musnad al-Shāfiʿī

- Slug: `musnad-al-shafii`
- Compiler: al-Shāfiʿī (d. 204 AH), Fusṭāṭ; transmitted by al-Rabīʿ ibn Sulaymān
- Chapters: 68
- Light key: soft Nile light of Fustat and muted green accents in cloth and leaves

### Hero

Save as `public/images/hadith/covers/musnad-al-shafii.webp` at 1400 x 788.

```text
A scholar's upper room in Fusṭāṭ overlooking the Nile in afternoon light. Through a wide window on the right, the river with boats under lateen sails and palms on the far bank. In the right foreground on a low desk: a stack of bound books tied with cord, a reed pen and inkwell, a brass lamp and a folded green cloth, with a dictation cushion beside the desk. Detailed oil painting with fine brushwork on softly aged canvas, warm lamp and window light against deep umber shadow. The left 40 percent of the frame falls into soft, nearly black shadow with no detail, leaving clean space for a title; every object and all of the light sit in the right 60 percent. No people or human figures, no writing, letters, calligraphy or inscriptions, no modern objects. Wide landscape composition, 16:9 aspect ratio.
```

### Chapter plates

Save each as `public/images/hadith/chapter-covers/musnad-al-shafii/NN.webp` at 880 x 1056.

#### 1. Reports extracted from the Book of Ablution (بَابُ مَا خَرَّجَ مِنْ كِتَابِ الْوُضُوءِ)

File: `01.webp`

```text
A brass ewer and basin in a shaded courtyard of Fustat. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 2. Chapter: From the Book of Facing the Qibla in Prayer (بَابٌ: وَمِنْ كِتَابِ اسْتِقْبَالِ الْقِبْلَةِ فِي الصَّلَاةِ)

File: `02.webp`

```text
A plain prayer niche in a mosque wall with light falling into it. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 3. From the Book of Dictations (Amālī) on Prayer (وَمِنْ كِتَابِ الْأَمَالِي فِي الصَّلَاةِ)

File: `03.webp`

```text
A teacher's dictation cushion with stacked notebooks at its foot. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 4. From the Book of Leading Prayer (Imāma) (وَمِنْ كِتَابِ الْإِمَامَةِ)

File: `04.webp`

```text
A prayer niche with a single cushion set before empty rows. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 5. From the Book on the Obligation of Friday Prayer (وَمِنْ كِتَابِ إِيجَابِ الْجُمُعَةِ)

File: `05.webp`

```text
The columned hall of an old mosque in Fustat at noon. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 6. Book of the Two Eid Festivals (كِتَابُ الْعِيدَيْنِ)

File: `06.webp`

```text
An open prayer ground outside the city at sunrise with a short spear planted upright. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 7. From the Book of Fasting, Prayer, the Eids, Rain Prayer, and Other Subjects (وَمِنْ كِتَابِ الصَّوْمِ وَالصَّلَاةِ وَالْعِيدَيْنِ وَالِاسْتِسْقَاءِ وَغَيْرِهَا)

File: `07.webp`

```text
Rain falling over the Nile, a prayer mat on a riverside terrace. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 8. From the Book of Zakāh, from its beginning, excluding repeated material (وَمِنْ كِتَابِ الزَّكَاةِ مِنْ أَوَّلِهِ إِلَّا مَا كَانَ مُعَادًا)

File: `08.webp`

```text
A purse of coins, a sheep and a grain measure on a courtyard floor. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 9. From the Book of the Permissibility of Divorce (وَمِنْ كِتَابِ إِبَاحَةِ الطَّلَاقِ)

File: `09.webp`

```text
A single folded document and a ring on a table. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 10. From the Greater Book of Fasting (وَمِنْ كِتَابِ الصِّيَامِ الْكَبِيرِ)

File: `10.webp`

```text
Dates and water at sunset beneath a crescent moon. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 11. From the Book of Pilgrimage Rites (وَمِنْ كِتَابِ الْمَنَاسِكِ)

File: `11.webp`

```text
White pilgrim cloths and a small bag of pebbles at Mina. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 12. From the Book of Sales (وَمِنْ كِتَابِ الْبُيُوعِ)

File: `12.webp`

```text
A market stall of Fustat with scales and goods. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 13. From the Book of Pledges (Rahn) (وَمِنْ كِتَابِ الرَّهْنِ)

File: `13.webp`

```text
A coat of mail folded beside a sack of barley. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 14. From the Book of the Oath alongside One Witness (وَمِنْ كِتَابِ الْيَمِينِ مَعَ الشَّاهِدِ الْوَاحِدِ)

File: `14.webp`

```text
A judge's bench with a single cushion for a witness. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 15. From the Book of Divergent Hadith (Ikhtilāf al-Ḥadīth), excluding repeats (وَمِنْ كِتَابِ اخْتِلَافِ الْحَدِيثِ وَتَرْكِ الْمُعَادِ مِنْهَا)

File: `15.webp`

```text
Two scrolls opened side by side on a desk, held flat by stones. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 16. From the Book of Divorce (وَمِنْ كِتَابِ الطَّلَاقِ)

File: `16.webp`

```text
A doorway with a woman's belongings packed beside it. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 17. From the Book of Manumission (وَمِنْ كِتَابِ الْعِتْقِ)

File: `17.webp`

```text
An opened shackle and a gift of new clothes. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 18. From the Book of Intentional Injuries (وَمِنْ كِتَابِ جِرَاحِ الْعَمْدِ)

File: `18.webp`

```text
A sword and a balance scale for compensation. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 19. From the Book of Contractual Manumission (Mukātab) (وَمِنْ كِتَابِ الْمُكَاتَبِ)

File: `19.webp`

```text
A small purse of coins resting on a folded contract. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 20. From the Book of Jizya (وَمِنْ كِتَابِ الْجِزْيَةِ)

File: `20.webp`

```text
Coins counted on a cloth beside a register. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 21. From the Book of Disagreement between Mālik and al-Shāfiʿī (وَمِنْ كِتَابِ اخْتِلَافِ مَالِكٍ وَالشَّافِعِيِّ رضي الله عنهما)

File: `21.webp`

```text
Two different inkwells and two open notebooks facing each other on a desk, the Nile beyond. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 22. From al-Risāla, excluding repeated material (وَمِنْ كِتَابِ الرِّسَالَةِ إِلَّا مَا كَانَ مُعَادًا)

File: `22.webp`

```text
A single bound book on a lectern, the Nile visible through the window. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 23. From the Book of Dowry and Īlāʾ (وَمِنْ كِتَابِ الصَّدَاقِ وَالْإِيلَاءِ)

File: `23.webp`

```text
A small chest of silver beside a bed that has been turned away. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 24. From the Book of Currency Exchange (Ṣarf) (وَمِنْ كِتَابِ الصَّرْفِ)

File: `24.webp`

```text
Gold and silver coins on a moneychanger's scale. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 25. From the Book of Pledges and Leases (وَمِنْ كِتَابِ الرُّهُونِ وَالْإِجَارَاتِ)

File: `25.webp`

```text
A house key hanging on a cord. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 26. From the Book of Shighār Marriage (وَمِنْ كِتَابِ الشِّغَارِ)

File: `26.webp`

```text
Two bridal canopies side by side. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 27. From the Book of Ẓihār and Liʿān (وَمِنْ كِتَابِ الظِّهَارِ وَاللِّعَانِ)

File: `27.webp`

```text
A mosque courtyard with a pulpit where an oath would be sworn. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 28. From the Book of Khulʿ and Nushūz (وَمِنْ كِتَابِ الْخُلْعِ وَالنُّشُوزِ)

File: `28.webp`

```text
A walled garden gate with its keys laid on top of the wall. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 29. From the Book of Invalidating Istiḥsān (وَمِنْ كِتَابِ إِبْطَالِ الِاسْتِحْسَانِ)

File: `29.webp`

```text
A set of measuring weights and a plumb line on a desk. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 30. From the Book of Qurʾānic Rulings (Aḥkām al-Qurʾān) (وَمِنْ كِتَابِ أَحْكَامِ الْقُرْآنِ)

File: `30.webp`

```text
A closed codex on a stand beside a jurist's notebooks. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 31. From the Book of Beverages, Virtues of Quraysh, and Other Subjects (وَمِنْ كِتَابِ الْأَشْرِبَةِ وَفَضَائِلِ قُرَيْشٍ وَغَيْرِهِ)

File: `31.webp`

```text
A drinking cup on a ledge with a view of Meccan hills. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 32. From the Book of Beverages (وَمِنْ كِتَابِ الْأَشْرِبَةِ)

File: `32.webp`

```text
Clay jugs and leather skins of water on a stone shelf. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 33. From the Book of Relations with Women (وَمِنْ كِتَابِ عِشْرَةِ النِّسَاءِ)

File: `33.webp`

```text
A curtained chamber with two cushions. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 34. From the Book of Indirect Marriage Proposals (وَمِنْ كِتَابِ التَّعْرِيضِ بِالْخُطْبَةِ)

File: `34.webp`

```text
A gift of perfume left on the doorstep of a widow's house. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 35. From the Book of Divorce and Reconciliation (Rajʿa) (وَمِنْ كِتَابِ الطَّلَاقِ وَالرَّجْعَةِ)

File: `35.webp`

```text
A door half open, light returning into the room. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 36. From the Book of Waiting Periods (ʿIdad), excluding repeated material (وَمِنْ كِتَابِ الْعَدَدِ إِلَّا مَا كَانَ مِنْهُ مُعَادًا)

File: `36.webp`

```text
A window showing a crescent moon, a spindle lying idle. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 37. From the Book of Drawing Lots and Maintenance of Relatives (وَمِنْ كِتَابِ الْقُرْعَةِ وَالنَّفَقَةِ عَلَى الْأَقَارِبِ)

File: `37.webp`

```text
Wooden lots in a bowl beside loaves of bread. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 38. From the Book of Breastfeeding (وَمِنْ كِتَابِ الرَّضَاعِ)

File: `38.webp`

```text
An infant's cradle with a small cup of milk. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 39. From the Book of Remembering God without Ablution and of Menstruating Women (وَمِنْ كِتَابِ ذِكْرِ اللَّهِ تَعَالَى عَلَى غَيْرِ وُضُوءٍ، وَالْحُيَّضِ)

File: `39.webp`

```text
A quiet room with a cushion, a lamp and a folded cloth. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 40. From the Book of Fighting Rebels (وَمِنْ كِتَابِ قِتَالِ أَهْلِ الْبَغْيِ)

File: `40.webp`

```text
A broken spear lying beside a white truce banner. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 41. From the Book of Fighting Polytheists (وَمِنْ كِتَابِ قِتَالِ الْمُشْرِكِينَ)

File: `41.webp`

```text
A fortified hill with spears planted in the sand at its foot. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 42. From the Book of Captives, Misappropriation of Spoils, and Other Subjects (وَمِنْ كِتَابِ الْأُسَارَى وَالْغُلُولِ وَغَيْرِهِ)

File: `42.webp`

```text
Loosened rope bindings and spoils laid out in a tent. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 43. From the Book of Distribution of Fayʾ (وَمِنْ كِتَابِ قَسَمِ الْفَيْءِ)

File: `43.webp`

```text
Heaps of goods divided into five portions. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 44. From the Book of the Prophet’s Prohibitions and the Book of Posthumous Manumission (وَمِنْ كِتَابِ صِفَةِ نَهْيِ النَّبِيِّ صلى الله عليه وسلم، وَكِتَابِ الْمُدَبَّرِ)

File: `44.webp`

```text
A sealed will beside an opened shackle. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 45. From the Book of Insolvency (وَمِنْ كِتَابِ التَّفْلِيسِ)

File: `45.webp`

```text
An empty purse in front of a shuttered shop. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 46. From the Book of Claims and Evidence (وَمِنْ كِتَابِ الدَّعْوَى وَالْبَيِّنَاتِ)

File: `46.webp`

```text
A judge's bench with two empty cushions facing it. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 47. From the Book of the Prophet’s Commands, Minor Walāʾ, Medical Error, etc. (وَمِنْ كِتَابِ صِفَةِ أَمْرِ النَّبِيِّ صلى الله عليه وسلم وَالْوَلَاءِ الصَّغِيرِ وَخَطَأِ الطَّبِيبِ وَغَيْرِهِ)

File: `47.webp`

```text
A physician's kit of small knives and ointment jars. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 48. From the Book of Sharecropping and Land Rental (وَمِنْ كِتَابِ الْمُزَارَعَةِ وَكِرَاءِ الْأَرَضِينَ)

File: `48.webp`

```text
A field divided by furrows, a shared harvest basket at its edge. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 49. From the Book of the Theft Penalty and Numerous Other Chapters (وَمِنْ كِتَابِ الْقَطْعِ فِي السَّرِقَةِ، وَأَبْوَابٍ كَثِيرَةٍ)

File: `49.webp`

```text
A broken lock on a storeroom door. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 50. From the Book of Baḥīra and Sāʾiba (وَمِنْ كِتَابِ الْبَحِيرَةِ وَالسَّائِبَةِ)

File: `50.webp`

```text
A she-camel with a slit ear roaming free in the desert. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 51. From the Book of Hunting and Slaughter (وَمِنْ كِتَابِ الصَّيْدِ وَالذَّبَائِحِ)

File: `51.webp`

```text
A falcon's perch and a hunting bow. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 52. From the Book of Blood Money and Retaliation (وَمِنْ كِتَابِ الدِّيَاتِ وَالْقِصَاصِ)

File: `52.webp`

```text
A herd of camels at a well. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 53. From the Book of Accidental Injuries (وَمِنْ كِتَابِ جِرَاحِ الْخَطَإِ)

File: `53.webp`

```text
A thrown stone lying beside a broken pot. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 54. From the Book of Racing, Qasāma, Archery, and the Eclipse (وَمِنْ كِتَابِ السَّبَقِ وَالْقَسَامَةِ وَالرَّمْيِ وَالْكُسُوفِ)

File: `54.webp`

```text
A desert racecourse with arrows in a target and the sun partly eclipsed. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 55. From the Book of the Eclipse (وَمِنْ كِتَابِ الْكُسُوفِ)

File: `55.webp`

```text
A solar eclipse darkening the sky over the Nile. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 56. From the Book of Expiations, Vows, and Oaths (وَمِنْ كِتَابِ الْكَفَّارَاتِ وَالنُّذُورِ وَالْأَيْمَانِ)

File: `56.webp`

```text
Bowls of food for the poor and a folded garment. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 57. From the Book of Siyar, responding to al-Wāqidī’s Siyar (وَمِنْ كِتَابِ السِّيَرِ عَلَى سِيَرِ الْوَاقِدِيِّ)

File: `57.webp`

```text
A commander's tent with a staff and furled banners. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 58. From the Book of the Compendium of Knowledge (Jimāʿ al-ʿIlm) (وَمِنْ كِتَابِ جِمَاعِ الْعِلْمِ)

File: `58.webp`

```text
A library shelf with stacked quires. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 59. From the Book of Funerals and Prescribed Punishments (وَمِنْ كِتَابِ الْجَنَائِزِ وَالْحُدُودِ)

File: `59.webp`

```text
An empty bier with a white cloth, a whip hanging on the wall beyond. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 60. From the Book of Pilgrimage in the Amālī (al-Rabīʿ states that al-Shāfiʿī narrated this material) (وَمِنْ كِتَابِ الْحَجِّ مِنَ الْأَمَالِي يَقُولُ الرَّبِيعُ فِي جَمِيعِ ذَلِكَ: حَدَّثَنَا الشَّافِعِيُّ)

File: `60.webp`

```text
A dictation cushion beside a pilgrim's provisions. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 61. From the Abridgment of the Greater Book of Pilgrimage; from here al-Rabīʿ says: al-Shāfiʿī informed us (وَمِنْ كِتَابِ مُخْتَصَرِ الْحَجِّ الْكَبِيرِ مِنْ هُنَا يَقُولُ الرَّبِيعُ: أَخْبَرَنَا الشَّافِعِيُّ رضي الله عنه)

File: `61.webp`

```text
The plain of ʿArafāt at noon. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 62. From the Book of Marriage from Dictation (Imlāʾ) (وَمِنْ كِتَابِ النِّكَاحِ مِنَ الْإِمْلَاءِ)

File: `62.webp`

```text
A wedding canopy with lamps. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 63. From the Book of Marriage from Dictation (repeated heading) (وَمِنْ كِتَابِ النِّكَاحِ مِنَ الْإِمْلَاءِ)

File: `63.webp`

```text
A dish of henna and a bridal veil. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 64. From the Book of Wills, material not directly heard from its author (وَمِنْ كِتَابِ الْوَصَايَا الَّذِي لَمْ يُسْمِعْ مِنْهُ)

File: `64.webp`

```text
A sealed will beneath a lamp. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 65. From the Book of Judicial Conduct (وَمِنْ كِتَابِ أَدَبِ الْقَاضِي)

File: `65.webp`

```text
A judge's seat beside a mosque column. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 66. From the Book of Food, Drink, and Cultivation of Lands; material al-Rabīʿ did not directly hear from al-Shāfiʿī (وَمِنْ كِتَابِ الطَّعَامِ وَالشَّرَابِ وَعِمَارَةِ الْأَرَضِينَ مِمَّا لَمْ يَسْمَعِ الرَّبِيعُ مِنَ الشَّافِعِيِّ وَقَالَ: أَعْلَمُ أَنَّ ذَا مِنْ قَوْلِهِ، وَبَعْضَ كَلَامِهِ هَذَا سَمِعْتُهُ فِي كِتَابِهِ الْكَبِيرِ الْمَبْسُوطِ)

File: `66.webp`

```text
A plowed field by the Nile with a clay jug. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 67. From the Book of Wills not heard from al-Shāfiʿī (وَمِنْ كِتَابِ الْوَصَايَا الَّذِي لَمْ يُسْمَعْ مِنَ الشَّافِعِيِّ رضي الله عنه)

File: `67.webp`

```text
A folded will tied with a cord beside a reed pen. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 68. From the Book of Disagreement of ʿAlī and ʿAbd Allāh, material al-Rabīʿ did not hear from al-Shāfiʿī (وَمِنْ كِتَابِ اخْتِلَافِ عَلِيٍّ وَعَبْدِ اللَّهِ مِمَّا لَمْ يَسْمَعِ الرَّبِيعُ مِنَ الشَّافِعِيِّ)

File: `68.webp`

```text
Two walking staffs side by side in a Kufan mosque. Setting: Fusṭāṭ beside the Nile and the Hijaz, with plaster, stone, palm wood and linen. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with soft Nile light of Fustat and muted green accents in cloth and leaves. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```


<a id="hadith-muhammad-ibn-abd-allah-al-ansari"></a>

## Ḥadīth Muḥammad ibn ʿAbd Allāh al-Anṣārī

- Slug: `hadith-muhammad-ibn-abd-allah-al-ansari`
- Compiler: Muḥammad ibn ʿAbd Allāh al-Anṣārī (d. 215 AH), Basra
- Chapters: 27
- Light key: cool Basran morning light and indigo blue in the shadows

### Hero

Save as `public/images/hadith/covers/hadith-muhammad-ibn-abd-allah-al-ansari.webp` at 1400 x 788.

```text
A scholar's room in Basra in early morning. Through a tall window on the right, palm groves and the glinting canals of the Shatt stretch toward the horizon. On a reed mat in the right foreground: a slim fascicle of quires tied with a cord, a reed pen and inkwell, a small clay lamp just extinguished with a thread of smoke, and a folded indigo cloth. Detailed oil painting with fine brushwork on softly aged canvas, warm lamp and window light against deep umber shadow. The left 40 percent of the frame falls into soft, nearly black shadow with no detail, leaving clean space for a title; every object and all of the light sit in the right 60 percent. No people or human figures, no writing, letters, calligraphy or inscriptions, no modern objects. Wide landscape composition, 16:9 aspect ratio.
```

### Chapter plates

Save each as `public/images/hadith/chapter-covers/hadith-muhammad-ibn-abd-allah-al-ansari/NN.webp` at 880 x 1056.

#### 1. The Ḥadīth of Muḥammad b. ʿAbd Allāh al-Anṣārī from Abū al-Muʿtamir Sulaymān al-Taymī, from Anas b. Mālik (حَدِيثُ مُحَمَّدِ بْنِ عَبْدِ اللَّهِ الْأَنْصَارِيِّ عَنْ أَبِي الْمُعْتَمِرِ سُلَيْمَانَ التَّيْمِيِّ، عَنْ أَنَسِ بْنِ مَالِكٍ)

File: `01.webp`

```text
Two cushions facing each other across a shared low tray with two cups, as if set for a reconciliation, in a quiet Basran room. Setting: Basra and the early Hijaz, with plastered mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with cool Basran morning light and indigo blue in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 2. The Ḥadīth of Sulaymān al-Taymī from Abū ʿUthmān al-Nahdī, who is ʿAbd al-Raḥmān b. Mull (حَدِيثُ سُلَيْمَانَ التَّيْمِيِّ عَنْ أَبِي عُثْمَانَ النَّهْدِيِّ، هُوَ عَبْدُ الرَّحْمَنِ بْنُ مُلٍّ)

File: `02.webp`

```text
A rocky mountain path climbing to a high pass at dawn, a waterskin resting on a stone at the bend. Setting: Basra and the early Hijaz, with plastered mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with cool Basran morning light and indigo blue in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 3. The Ḥadīth of Sulaymān al-Taymī from Abū Naḍra al-ʿAbdī (حَدِيثُ سُلَيْمَانَ التَّيْمِيِّ عَنْ أَبِي نَضْرَةَ الْعَبْدِيِّ)

File: `03.webp`

```text
An earthenware jar beside two separate bowls, one of unripe yellow dates and one of ripe brown dates, kept apart on a wooden tray. Setting: Basra and the early Hijaz, with plastered mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with cool Basran morning light and indigo blue in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 4. The Ḥadīth of Sulaymān al-Taymī from Abū Bakr Muḥammad b. Sīrīn (حَدِيثُ سُلَيْمَانَ التَّيْمِيِّ عَنْ أَبِي بَكْرٍ مُحَمَّدِ بْنِ سِيرِينَ)

File: `04.webp`

```text
A long shift, a headscarf and a waist-wrapper folded neatly in a stack on a carved chest. Setting: Basra and the early Hijaz, with plastered mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with cool Basran morning light and indigo blue in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 5. The Ḥadīth of al-Taymī from Abū Ṣāliḥ (حَدِيثُ التَّيْمِيِّ عَنْ أَبِي صَالِحٍ)

File: `05.webp`

```text
Afternoon light at the ʿaṣr hour falling across an empty prayer mat, the long shadow of a column stretching beside it. Setting: Basra and the early Hijaz, with plastered mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with cool Basran morning light and indigo blue in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 6. The Ḥadīth of al-Taymī from Qatāda b. Diʿāma (حَدِيثُ التَّيْمِيِّ عَنْ قَتَادَةَ بْنِ دِعَامَةَ)

File: `06.webp`

```text
The shadow of a wooden post stretched to its own length across a sandy courtyard at mid-afternoon, an ewer beside a prayer mat. Setting: Basra and the early Hijaz, with plastered mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with cool Basran morning light and indigo blue in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 7. The Ḥadīth of al-Taymī from Umm Khidāsh (حَدِيثُ التَّيْمِيِّ عَنْ أُمِّ خِدَاشٍ)

File: `07.webp`

```text
A red two-piece garment draped over a low wooden couch in a shaded room. Setting: Basra and the early Hijaz, with plastered mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with cool Basran morning light and indigo blue in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 8. The Ḥadīth of al-Taymī from Ḥanash (حَدِيثُ التَّيْمِيِّ عَنْ حَنَشٍ)

File: `08.webp`

```text
The skyline of a new mudbrick garrison city at evening, and on a ledge in the foreground a wooden clapper board set aside, silent. Setting: Basra and the early Hijaz, with plastered mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with cool Basran morning light and indigo blue in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 9. The Ḥadīth of al-Anṣārī from Abū ʿUbayda b. Tīrawayh al-Ṭawīl (حَدِيثُ الْأَنْصَارِيِّ عَنْ أَبِي عُبَيْدَةَ بْنِ تِيرَوَيْهِ الطَّوِيلِ)

File: `09.webp`

```text
Two walking staffs leaning together against a wall, one steadying the other. Setting: Basra and the early Hijaz, with plastered mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with cool Basran morning light and indigo blue in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 10. The Ḥadīth of al-Anṣārī from Bahz b. Ḥakīm b. Muʿāwiya b. Ḥayda (حَدِيثُ الْأَنْصَارِيِّ عَنْ بَهْزِ بْنِ حَكِيمِ بْنِ مُعَاوِيَةَ بْنِ حَيْدَةَ)

File: `10.webp`

```text
A mother's spindle and basket of wool on a cushion, beside a bowl of warm food set out for her. Setting: Basra and the early Hijaz, with plastered mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with cool Basran morning light and indigo blue in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 11. The Ḥadīth of al-Anṣārī from Abū ʿAwn ʿAbd Allāh b. ʿAwn b. Arṭabān (حَدِيثُ الْأَنْصَارِيِّ عَنْ أَبِي عَوْنٍ عَبْدِ اللَّهِ بْنِ عَوْنِ بْنِ أَرْطُبَانَ)

File: `11.webp`

```text
A protected pasture behind a low stone boundary, the grass lush on one side, a shepherd's staff resting on the wall. Setting: Basra and the early Hijaz, with plastered mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with cool Basran morning light and indigo blue in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 12. The Ḥadīth of al-Anṣārī from Abū Hāniʾ Ashʿath b. ʿAbd al-Malik (حَدِيثُ الْأَنْصَارِيِّ عَنْ أَبِي هَانِئٍ أَشْعَثَ بْنِ عَبْدِ الْمَلِكِ)

File: `12.webp`

```text
First light of dawn over the flat rooftops of Basra, a lamp just put out on a windowsill with a thin line of smoke rising. Setting: Basra and the early Hijaz, with plastered mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with cool Basran morning light and indigo blue in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 13. The Ḥadīth of Hishām b. Ḥassān (حَدِيثُ هِشَامِ بْنِ حَسَّانَ)

File: `13.webp`

```text
Inside a campaign tent: rolls of linen bandages, a cooking pot over embers and a full waterskin. Setting: Basra and the early Hijaz, with plastered mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with cool Basran morning light and indigo blue in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 14. The Ḥadīth of ʿAwf b. Abī Jamīla al-Aʿrābī (حَدِيثُ عَوْفِ بْنِ أَبِي جَمِيلَةَ الْأَعْرَابِيِّ)

File: `14.webp`

```text
An empty bier draped with a plain folded white cloth beneath a vast evening sky full of stars. Setting: Basra and the early Hijaz, with plastered mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with cool Basran morning light and indigo blue in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 15. The Ḥadīth of ʿAbd Allāh b. al-Muthannā b. Anas (حَدِيثُ عَبْدِ اللَّهِ بْنِ الْمُثَنَّى بْنِ أَنَسٍ)

File: `15.webp`

```text
A folded document closed with a blank wax seal, a silver signet ring resting beside it. Setting: Basra and the early Hijaz, with plastered mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with cool Basran morning light and indigo blue in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 16. The Ḥadīth of ʿUmar b. al-Walīd al-Shannī (حَدِيثُ عُمَرَ بْنِ الْوَلِيدِ الشَّنِّيِّ)

File: `16.webp`

```text
Pilgrims' tents pitched across the plain of ʿArafāt at noon, the low hill of Mercy in the distance. Setting: Basra and the early Hijaz, with plastered mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with cool Basran morning light and indigo blue in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 17. The Ḥadīth of ʿAbd al-Aʿlā b. Abī al-Musāwir (حَدِيثُ عَبْدِ الْأَعْلَى بْنِ أَبِي الْمُسَاوِرِ)

File: `17.webp`

```text
A large tent with its door flap closed, a walking staff planted by the entrance. Setting: Basra and the early Hijaz, with plastered mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with cool Basran morning light and indigo blue in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 18. The Ḥadīth of Abū al-Naḍr Saʿīd b. Abī ʿArūba and Abū al-Ashhab Jaʿfar b. Ḥayyān al-ʿUṭāridī (حَدِيثُ أَبِي النَّضْرِ سَعِيدِ بْنِ أَبِي عَرُوبَةَ، وَأَبِي الْأَشْهَبِ جَعْفَرِ بْنِ حَيَّانَ الْعُطَارِدِيِّ)

File: `18.webp`

```text
A doorway with its curtain let down, a small chest of dowry silver set on the threshold. Setting: Basra and the early Hijaz, with plastered mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with cool Basran morning light and indigo blue in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 19. The Ḥadīth of Ismāʿīl b. Muslim al-Makkī (حَدِيثُ إِسْمَاعِيلَ بْنِ مُسْلِمٍ الْمَكِّيِّ)

File: `19.webp`

```text
A single clay oil lamp burning with a forked double flame in a dark room. Setting: Basra and the early Hijaz, with plastered mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with cool Basran morning light and indigo blue in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 20. The Ḥadīth of al-Akhḍar b. ʿAjlān (حَدِيثُ الْأَخْضَرِ بْنِ عَجْلَانَ)

File: `20.webp`

```text
A saddle blanket and a wooden cup set out on a mat for sale, two silver dirhams beside them. Setting: Basra and the early Hijaz, with plastered mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with cool Basran morning light and indigo blue in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 21. The Ḥadīth of Ṣāliḥ b. Rustam Abū ʿĀmir al-Khazzāz (حَدِيثُ صَالِحِ بْنِ رُسْتُمَ أَبِي عَامِرٍ الْخَزَّازِ)

File: `21.webp`

```text
A bridal chamber made ready: a cloth canopy, embroidered cushions and a dish of henna. Setting: Basra and the early Hijaz, with plastered mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with cool Basran morning light and indigo blue in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 22. The Ḥadīth of Abū Bisṭām Shuʿba b. al-Ḥajjāj and Abū Yūnus Ḥātim b. Abī Ṣaghīra (حَدِيثُ أَبِي بِسْطَامٍ شُعْبَةَ بْنِ الْحَجَّاجِ، وَأَبِي يُونُسَ حَاتِمِ بْنِ أَبِي صَغِيرَةَ)

File: `22.webp`

```text
A mosque interior with a carved wooden enclosure at the front and the first row of reed mats laid beside it. Setting: Basra and the early Hijaz, with plastered mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with cool Basran morning light and indigo blue in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 23. The Ḥadīth of Thābit b. ʿUmāra, Abū al-Walīd ʿAbd al-Malik b. Jurayj, and al-Jurayrī (حَدِيثُ ثَابِتِ بْنِ عُمَارَةَ، وَأَبَى الْوَلِيدِ عَبْدِ الْمَلِكِ بْنِ جُرَيْجٍ، وَالْجُرَيْرِيِّ)

File: `23.webp`

```text
A carved wooden lattice screen half veiling a window, a small perfume vial on the sill. Setting: Basra and the early Hijaz, with plastered mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with cool Basran morning light and indigo blue in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 24. The Ḥadīth of Abū Muḥammad Ḥabīb b. al-Shahīd and Muḥammad b. Fuḍāʾ (حَدِيثُ أَبِي مُحَمَّدٍ حَبِيبِ بْنِ الشَّهِيدِ، وَمُحَمَّدِ بْنِ فَضَاءٍ)

File: `24.webp`

```text
Cupping vessels and folded white unstitched pilgrim cloth laid together on a tray. Setting: Basra and the early Hijaz, with plastered mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with cool Basran morning light and indigo blue in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 25. The Ḥadīth of al-Anṣārī from the Shaykhs (حَدِيثُ الْأَنْصَارِيِّ عَنِ الشِّيُوخِ)

File: `25.webp`

```text
A swarm of locusts rising over a green field at dusk. Setting: Basra and the early Hijaz, with plastered mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with cool Basran morning light and indigo blue in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 26. Questions Put to al-Anṣārī (Masāʾil al-Anṣārī) (مَسَائِلُ الْأَنْصَارِيِّ)

File: `26.webp`

```text
An empty prayer mat in the open with a staff set upright in front of it as a barrier, a footpath crossing before it. Setting: Basra and the early Hijaz, with plastered mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with cool Basran morning light and indigo blue in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 27. The Ḥadīth of Ṣāliḥ b. Abī al-Akhḍar (حَدِيثُ صَالِحِ بْنِ أَبِي الْأَخْضَرِ)

File: `27.webp`

```text
A basket of fruit with a folded cloth on top, left as a return gift at a doorstep. Setting: Basra and the early Hijaz, with plastered mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with cool Basran morning light and indigo blue in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```


<a id="kitab-al-salah-of-abu-nuaym"></a>

## Kitāb al-Ṣalāh of Abū Nuʿaym

- Slug: `kitab-al-salah-abu-nuaym`
- Compiler: Abū Nuʿaym al-Faḍl ibn Dukayn (d. 219 AH), Kufa
- Chapters: 66
- Light key: pale dawn light and soft rose and red accents

### Hero

Save as `public/images/hadith/covers/kitab-al-salah-abu-nuaym.webp` at 1400 x 788.

```text
The prayer hall of an early mosque in Kufa just before dawn. On the right, rows of palm-trunk columns under a reed roof recede into soft rose light from an open arch. In the right foreground: a woven prayer mat, a brass ewer and basin for ablution, a pair of sandals and a small clay lamp still burning, with a rose-colored cloth folded beside them. Detailed oil painting with fine brushwork on softly aged canvas, warm lamp and window light against deep umber shadow. The left 40 percent of the frame falls into soft, nearly black shadow with no detail, leaving clean space for a title; every object and all of the light sit in the right 60 percent. No people or human figures, no writing, letters, calligraphy or inscriptions, no modern objects. Wide landscape composition, 16:9 aspect ratio.
```

### Chapter plates

Save each as `public/images/hadith/chapter-covers/kitab-al-salah-abu-nuaym/NN.webp` at 880 x 1056.

#### 1. Chapter on the Consecration of the Prayer (taḥrīm al-ṣalāh) (بَابُ تَحْرِيمِ الصَّلَاةِ)

File: `01.webp`

```text
An empty prayer mat in the first light of morning beneath a plain mosque arch. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 2. Chapter on the Man Who Has Intercourse with His Wife While She Is Menstruating (بَابُ الرَّجُلِ يُجَامِعُ امْرَأَتَهُ وَهِيَ حَائِضٌ)

File: `02.webp`

```text
A low bed with a folded wool blanket and a curtain half drawn, a lamp burning low. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 3. Chapter on What a Man May Have of His Wife While She Is Menstruating (بَابُ مَا لِلرَّجُلِ مِنِ امْرَأَتِهِ وَهِيَ حَائِضٌ)

File: `03.webp`

```text
A folded waist-wrapper on a cushion beside a single shared cup. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 4. Chapter on the Woman Who Becomes Ritually Impure (junub) and Then Menstruates (بَابُ الْمَرْأَةِ تُجْنِبُ ثُمَّ تَحِيضُ)

File: `04.webp`

```text
A full water jar and an unused bathing basin beside a folded robe. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 5. Chapter on the Menstruating Woman Who Sees Blood (بَابُ الْحَائِضِ تَرَى الدَّمَ)

File: `05.webp`

```text
A few small wads of white cotton in a dish beside clean folded linen. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 6. Chapter on What Makes the Full Ablution Obligatory (بَابُ مَا يُوجِبُ الْغُسْلَ)

File: `06.webp`

```text
A large bathing basin filled with water, steam rising, a towel folded beside it. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 7. Chapter on the Man Who Has Intercourse and Then Repeats (بَابُ الرَّجُلِ يُجَامِعُ ثُمَّ يَعُودُ)

File: `07.webp`

```text
An ewer and a cup on a tray by a bedside at night. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 8. Chapter on the Man Who Sleeps While in a State of Major Impurity (junub) (بَابُ الرَّجُلِ يَنَامُ وَهُوَ جُنُبٌ)

File: `08.webp`

```text
A bed at night with an ewer set near the pillow. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 9. Chapter on Those Who Said: He Performs His Ablution for the Prayer (بَابُ مَنْ قَالَ: يَتَوَضَّأُ وضُوءَهُ لِلصَّلَاةِ)

File: `09.webp`

```text
An ewer pouring into a basin beside a bed in lamplight. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 10. Chapter on the Person in Janāba Who Eats (بَابٌ فِي الْجُنُبِ يَأْكُلُ)

File: `10.webp`

```text
A small meal of bread set beside an ewer under a night lamp. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 11. Chapter on Those Who Said: He Performs Ablution (بَابُ مَنْ قَالَ يَتَوَضَّأُ)

File: `11.webp`

```text
A wet stone step beside a basin, light catching the water. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 12. Chapter on What Suffices of the Full Ablution (بَابُ مَا يَكْفِي مِنَ الْغُسْلِ)

File: `12.webp`

```text
A ṣāʿ measure of water set beside a large basin. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 13. Chapter on What Suffices for Washing the Head (بَابُ مَا يَكْفِي غَسْلَ الرَّأْسِ)

File: `13.webp`

```text
A basin of water and a wooden comb on a stand. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 14. Chapter on the Person in Janāba Who Washes His Head with Marshmallow (khiṭmī) (بَابُ الْجُنُبِ يَغْسِلُ رَأْسَهُ بِالْخِطْمِيِّ)

File: `14.webp`

```text
A bowl of marshmallow paste with pale mallow flowers beside a basin. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 15. Chapter on the Full Ablution from Janāba (بَابُ الْغُسْلِ مِنَ الْجَنَابَةِ)

File: `15.webp`

```text
Light falling into a small bathing room, water spread across the stone floor. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 16. Chapter on Rinsing the Mouth and Sniffing Water into the Nose (بَابُ الْمَضْمَضَةُ وَالِاسْتِنْشَاقُ)

File: `16.webp`

```text
A cup set beside a full basin, bright drops on the rim. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 17. Chapter on the Full Ablution of the Man and the Woman (بَابُ غُسْلِ الرَّجُلِ وَالْمَرْأَةِ)

File: `17.webp`

```text
A copper tub with two drying cloths hanging on pegs above it. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 18. Chapter: Immersing in Water (بَابٌ: يَرْتَمِسُ الْمَاءَ)

File: `18.webp`

```text
A clear pool in a stream within a palm grove. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 19. Chapter on the Towel after the Full Ablution (بَابُ الْمِنْدِيلِ بَعْدَ الْغُسْلِ)

File: `19.webp`

```text
A rough towel hanging over the rim of a basin. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 20. Chapter on the Man Who Has His Wife with Him (بَابُ الرَّجُلِ يَكُونُ مَعَهُ امْرَأَتُهُ)

File: `20.webp`

```text
A blanket folded on a bed, an ewer standing by the door. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 21. Chapter on the Man Who Dreams of Having Intercourse and Does Not Ejaculate (بَابُ الرَّجُلِ يُجَامِعُ فِي النَّوْمِ وَلَمْ يُنْزِلْ)

File: `21.webp`

```text
A moonlit bedchamber with a rumpled blanket and an ewer standing dry. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 22. Chapter on the Man Who Wakes Up and Finds Moisture (بَابُ الرَّجُلِ يَسْتَيْقِظُ وَهُوَ يَجِدُ بَلَلًا)

File: `22.webp`

```text
Dew on a window ledge at dawn beside a bed. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 23. Chapter on the Woman Who Sees in Her Sleep What a Man Sees (بَابُ الْمَرْأَةِ تَرَى فِي النَّوْمِ مَا يَرَى الرَّجُلُ)

File: `23.webp`

```text
A woman's chamber at dawn, a headscarf on the pillow and a basin waiting. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 24. Chapter on How Long the Woman in Postpartum Bleeding (nufasāʾ) Sits Out [from Prayer] (بَابُ كَمْ تَقْعُدُ النُّفَسَاءُ)

File: `24.webp`

```text
Forty small pebbles counted in a dish beside an infant's cradle. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 25. Chapter on the Person in Janāba Who Recites the Qurʾān (بَابُ الْجُنُبِ يَقْرَأُ الْقُرْآنَ)

File: `25.webp`

```text
A closed codex on a wooden stand, wrapped in cloth and untouched. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 26. Chapter on the Person in Janāba Who Writes: “In the name of God, the Most Gracious, the Most Merciful” [Q. 1:1] (بَابُ الْجُنُبِ يَكْتُبُ: {بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ} [ الفاتحة: 1])

File: `26.webp`

```text
A reed pen and inkwell beside a blank sheet of parchment, untouched. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 27. Chapter on Tayammum with Clean Earth (ṣaʿīd) (بَابُ التَّيَمُّمِ بِالصَّعِيدِ)

File: `27.webp`

```text
Clean, fine earth in a shallow dish set on a desert rock. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 28. Chapter on Those Who Did Not Hold Tayammum [to Be Valid] (بَابٌ فِي مَنْ لَمْ يَرَ التَّيَمُّمَ)

File: `28.webp`

```text
A dry well with a rope and bucket in the desert. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 29. Chapter on the Time [Limit] for Tayammum (بَابُ الْوَقْتِ فِي التَّيَمُّمِ)

File: `29.webp`

```text
Sand drifting slowly across a flat stone at dusk. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 30. Chapter on Tayammum Being Two Strikes (بَابُ التَّيَمُّمِ ضَرْبَتَانِ)

File: `30.webp`

```text
Two shallow impressions pressed into fine dust on a flat stone. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 31. Chapter on One Who Performed Tayammum and Then Found Water (بَابُ مَنْ تَيَمَّمَ ثُمَّ وَجَدَ الْمَاءَ)

File: `31.webp`

```text
A spring found among desert rocks, dust still lying on a stone nearby. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 32. Chapter on Eating Without Ablution (بَابُ الْأَكْلِ عَلَى غَيْرِ وُضُوءٍ)

File: `32.webp`

```text
Bread and meat on a tray with no ewer in sight. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 33. Chapter on Recitation Without Ablution (بَابُ الْقِرَاءَةِ عَلَى غَيْرِ وُضُوءٍ)

File: `33.webp`

```text
A lamp and a wooden recitation stand in a dim room. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 34. Chapter on One Who Prays While Holding Back the Two Foul Things (al-akhbathayn): Excrement and Urine (بَابٌ فِي مَنْ صَلَّى وَهُوَ يُدَافِعُ الْأَخْبَثَيْنِ: الْغَائِطَ وَالْبَوْلَ)

File: `34.webp`

```text
A prayer mat waiting by a doorway, a lane leading away behind the house. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 35. Chapter on the Beginning of the Adhān (بَابُ بَدْءِ الْأذَانِ)

File: `35.webp`

```text
A rooftop at dawn with a ladder leaning against it, a horn and a bell set aside. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 36. Chapter on the Merit of the Adhān (بَابُ فَضْلِ الْأَذَانِ)

File: `36.webp`

```text
A high rooftop above the houses of Medina at first light. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 37. Chapter on What Is Said When the Mu’adhdhin Gives the Adhān (بَابُ مَا يُقَالُ إِذَا أَذَّنَ الْمُؤَذِّنُ)

File: `37.webp`

```text
An open window facing a rooftop at dawn, a cup paused on a tray. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 38. Chapter on Taking Payment for the Adhān (بَابُ أَخْذِ الْأُجْرَةِ عَلَى الْأَذَانِ)

File: `38.webp`

```text
A few silver coins left untouched on a rooftop parapet. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 39. Chapter on the Adhān of the Blind Man, and Those Who Disliked It and Those Who Permitted It (بَابُ أَذَانِ الْأَعْمَى وَمَنْ كَرِهَهُ وَمَنْ رَخَّصَ فِيهِ)

File: `39.webp`

```text
A walking staff leaning against a rooftop wall at dawn. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 40. Chapter on the Adhān Without Ablution (بَابُ الْأَذَانِ عَلَى غَيْرِ وُضُوءٍ)

File: `40.webp`

```text
An ewer at the foot of a rooftop stair. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 41. Chapter on One Who Does Not Speak During His Adhān (بَابُ مَنْ لَا يَتَكَلَّمُ فِي أَذَانِهِ)

File: `41.webp`

```text
A quiet rooftop in still air, a single bird perched on the parapet. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 42. Chapter: The Mu’adhdhin Puts His Two Fingers in His Ears (بَابٌ: فِي الْمُؤَذِّنِ يَجْعَلُ إِصْبَعَيْهِ فِي أُذُنَيْهِ)

File: `42.webp`

```text
A wide open sky above a rooftop, palm groves stretching to the horizon. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 43. Chapter on Measured Delivery (tarassul) in the Adhān (بَابُ التَّرَسُّلِ فِي الْأَذَانِ)

File: `43.webp`

```text
A slow sunrise casting long, evenly spaced shadows through a colonnade. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 44. Chapter on Those Who Used to Rush the Iqāma (yaḥdhim) (بَابُ مَنْ كَانَ يَحْذِمُ الْإِقَامَةَ)

File: `44.webp`

```text
A mosque door open, rows of mats quickly filling with light. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 45. Chapter on Those Who Used to Double the Adhān (yuthannī) (بَابٌ فِي مَنْ كَانَ يُثَنِّي الْأَذَانَ)

File: `45.webp`

```text
Two lamps burning on either side of a mosque door. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 46. Chapter on One Whose Adhān Ended with “There Is No God but God” (بَابُ مَنْ كَانَ آخِرُ أَذَانِهِ لَا إِلَهَ إِلَّا اللَّهُ)

File: `46.webp`

```text
A single lamp glowing in a niche. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 47. Chapter on One Whose Adhān Ended with “God Is Greatest” (بَابُ مَنْ كَانَ آخِرُ أَذَانِهِ اللَّهُ أَكْبَرُ)

File: `47.webp`

```text
A high mountain peak catching the first rays of sunrise. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 48. Chapter on “Prayer Is Better Than Sleep”: Those Who Used to Say It in the Dawn Prayer (بَابٌ فِي: الصَّلَاةُ خَيْرٌ مِنَ النَّوْمِ، مَنْ كَانَ يَقُولُ فِي صَلَاةِ الْفَجْرِ)

File: `48.webp`

```text
A pillow pushed aside at dawn, light coming through a window. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 49. Chapter on One Who Used to Make the Tathwīb in the Dawn [Prayer] (بَابُ مَنْ كَانَ يُثَوِّبُ فِي الْفَجْرِ)

File: `49.webp`

```text
A doorway at dawn with a lamp set on the threshold. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 50. Chapter on One Who Is Present in the Mosque [When the Adhān Is Called] (بَابٌ فِي مَنْ يَحْضُرُ الْمَسْجِدَ)

File: `50.webp`

```text
A mosque column with a cushion resting at its base. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 51. Chapter on the Man Who Comes to the Mosque After They Have Prayed (بَابُ الرَّجُلِ يَأْتِي الْمَسْجِدَ وَقَدْ صَلُّوا)

File: `51.webp`

```text
A mosque emptied after prayer, the mats still bright with light. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 52. Chapter: When You Go Out into a Desolate Tract of Land (qiyy) (بَابٌ: إِذَا خَرَجْتَ فِي قِيٍّ مِنَ الْأَرْضِ)

File: `52.webp`

```text
A vast, empty desert plain under open sky with a single prayer mat. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 53. Chapter on Those Who Said: He Repeats (بَابُ مَنْ قَالَ يُعِيدُ)

File: `53.webp`

```text
Two prayer mats side by side, one rolled up. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 54. Chapter on One Who Prayed in His House (بَابٌ فِي مَنْ صَلَّى فِي بَيْتِهِ)

File: `54.webp`

```text
A prayer mat on the flat roof of a house. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 55. Chapter: The Mu’adhdhin Has More Right to the Adhān and the Imām Has More Right to the Iqāma (بَابُ الْمُؤَذِّنِ أَمْلَكُ بِالْأَذَانِ وَالْإِمَامُ أَمْلَكُ بِالْإِقَامَةِ)

File: `55.webp`

```text
A rooftop stair and a mosque prayer niche visible together. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 56. Chapter on People Waiting for the Imām Standing (بَابٌ فِي الْقَوْمِ يَنْتَظِرُونَ الْإِمَامَ قِيَامًا)

File: `56.webp`

```text
Empty prayer rows lit by sun, the door at the front still closed. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 57. Chapter on One Who Gave the Adhān and [Then] Led the Prayer (بَابٌ فِي مَنْ أَذَّنَ وَأَمَّ)

File: `57.webp`

```text
A rooftop and a prayer niche connected by a narrow stair. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 58. Chapter on One Who Gave the Adhān on His Mount (بَابٌ فِي مَنْ أَذَّنَ عَلَى رَاحِلَتِهِ)

File: `58.webp`

```text
A saddled camel kneeling at dawn in the desert. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 59. Chapter on Those Who Said: There Is No Adhān and No Iqāma for Women (بَابٌ: فِي مَنْ قَالَ لَيْسَ عَلَى النِّسَاءِ أَذَانٌ وَلَا إِقَامَةٌ)

File: `59.webp`

```text
A women's prayer space behind a curtain, quiet and lit softly. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 60. Chapter on Those Who Said: The Mu’adhdhin Sits Between the Adhān and the Iqāma (بَابٌ: فِي مَنْ قَالَ: يَقْعُدُ الْمُؤَذِّنُ بَيْنَ الْأذَانِ وَالْإِقَامَةِ)

File: `60.webp`

```text
A low stool against a mosque wall. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 61. Chapter: Supplication Is Not Rejected Between the Adhān and the Iqāma (بَابٌ: لَا يُرَدُّ الدُّعَاءُ فِي مَا بَيْنَ الْأَذَانِ وَالْإِقَامَةِ)

File: `61.webp`

```text
Rays breaking between clouds over a mosque courtyard. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 62. Chapter: When It Is Cloudy, What Does One Do? (بَابٌ: إِذَا كَانَ الْغَيْمُ كَيْفَ يَصْنَعُ)

File: `62.webp`

```text
An overcast sky over palm groves, the ground without shadows. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 63. Chapter on Praying the Dawn Prayer in the Light of Dawn (isfār) (بَابُ الْإِسْفَارِ بِالْفَجْرِ)

File: `63.webp`

```text
A brightening dawn sky over a mosque. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 64. Chapter on Praying the Dawn Prayer in Darkness (taghlīs) (بَابٌ: فِي التَّغْلِيسِ بِالْفَجْرِ)

File: `64.webp`

```text
Deep blue pre-dawn darkness with lamps lit inside a mosque. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 65. Chapter on One Who Prays at Times in the Light and at Times in Darkness (بَابُ مَنْ يُنَوِّرُ وَيُغَلِّسُ)

File: `65.webp`

```text
A sky half dark and half brightening over a courtyard. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 66. Chapter on Hastening al-Ẓuhr (بَابٌ: فِي تَعْجِيلِ الظُّهْرِ)

File: `66.webp`

```text
The midday sun overhead, short shadows in a mosque courtyard. Setting: early Kufa, with plastered mudbrick, palm-trunk columns and reed roofs. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with pale dawn light and soft rose and red accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```


<a id="musnad-al-humaydi"></a>

## Musnad al-Ḥumaydī

- Slug: `musnad-al-humaydi`
- Compiler: al-Ḥumaydī (d. 219 AH), Mecca
- Chapters: 186
- Light key: Meccan afternoon gold, deep shadow and pale gold highlights

### Hero

Save as `public/images/hadith/covers/musnad-al-humaydi.webp` at 1400 x 788.

```text
A stone room in Mecca in late afternoon. Through a tall window on the right, the ring of bare granite mountains around the valley glows gold. In the right foreground: a stack of notebooks tied with cord, a reed pen and inkwell, a brass lamp, a leather waterskin and a folded pale gold cloth on a woven mat. Detailed oil painting with fine brushwork on softly aged canvas, warm lamp and window light against deep umber shadow. The left 40 percent of the frame falls into soft, nearly black shadow with no detail, leaving clean space for a title; every object and all of the light sit in the right 60 percent. No people or human figures, no writing, letters, calligraphy or inscriptions, no modern objects. Wide landscape composition, 16:9 aspect ratio.
```

### Chapter plates

Save each as `public/images/hadith/chapter-covers/musnad-al-humaydi/NN.webp` at 880 x 1056.

#### 1. Hadiths of Abu Bakr al-Siddiq, may God be pleased with him, from the Messenger of God (ﷺ) (أَحَادِيثُ أَبِي بَكْرٍ الصِّدِّيقِ رضي الله عنه عَنْ رَسُولِ اللَّهِ صلى الله عليه وسلم)

File: `01.webp`

```text
The narrow mouth of the cave of Thawr at night, half covered by a spider's web, stars over the mountains of Mecca. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 2. Hadiths of ʿUmar ibn al-Khattab, may God be pleased with him, from the Messenger of God (ﷺ) (أَحَادِيثُ عُمَرَ بْنِ الْخَطَّابِ رضي الله عنه عَنْ رَسُولِ اللَّهِ صلى الله عليه وسلم)

File: `02.webp`

```text
A plain patched cloak and a short leather whip on a simple mat in a bare room in Medina. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 3. Hadiths of ʿUthman ibn ʿAffan, may God be pleased with him (أَحَادِيثُ عُثْمَانَ بْنِ عَفَّانَ رضي الله عنه)

File: `03.webp`

```text
A well in Medina with a stone rim and a leather bucket, palms around it. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 4. Hadiths of ʿAli ibn Abi Talib, may God be pleased with him (أَحَادِيثُ عَلِيِّ بْنِ أَبِي طَالِبٍ رضي الله عنه)

File: `04.webp`

```text
A plain sword and a small sack of barley on a reed mat in a modest Kufan house. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 5. Hadiths of al-Zubayr ibn al-ʿAwwam, may God be pleased with him (أَحَادِيثُ الزُّبَيْرِ بْنِ الْعَوَّامِ رضي الله عنه)

File: `05.webp`

```text
A spear and a coat of mail leaning against the wall of a house in Medina. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 6. Hadiths of ʿAbd al-Rahman ibn ʿAwf, may God be pleased with him (أَحَادِيثُ عَبْدِ الرَّحْمَنِ بْنِ عَوْفٍ رضي الله عنه)

File: `06.webp`

```text
A small fire temple across a plain in the distance, a pouch of coins and a sealed receipt in the foreground. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 7. Hadiths of Saʿd ibn Abi Waqqas, may God be pleased with him (أَحَادِيثُ سَعْدِ بْنِ أَبِي وَقَّاصِ رضي الله عنه)

File: `07.webp`

```text
A bow and a quiver of arrows on a stone wall overlooking the ʿAqīq valley. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 8. Hadiths of Saʿid ibn Zayd ibn ʿAmr ibn Nufayl al-ʿAdawi, may God be pleased with him (أَحَادِيثُ سَعِيدِ بْنِ زَيْدِ بْنِ عَمْرِو بْنِ نُفَيْلٍ الْعَدَوِيِّ رضي الله عنه)

File: `08.webp`

```text
A small walled plot of land with a well at its center. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 9. Hadiths of Abu ʿUbayda ibn al-Jarrah, may God be pleased with him (أَحَادِيثُ أَبِي عُبَيْدَةَ بْنِ الْجَرَّاحِ رضي الله عنه)

File: `09.webp`

```text
A dusty road leading north out of the Hijaz at dawn, a commander's spear planted at the roadside. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 10. Hadiths of ʿAbd Allah ibn Masʿud, may God be pleased with him (أَحَادِيثُ عَبْدِ اللَّهِ بْنِ مَسْعُودٍ رضي الله عنه)

File: `10.webp`

```text
A pair of sandals, a siwāk and an ewer kept ready beside a door. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 11. Hadiths of Abu Dharr al-Ghifari, may God be pleased with him (أَحَادِيثُ أَبِي ذَرٍّ الْغِفَارِيِّ رضي الله عنه)

File: `11.webp`

```text
A lone tent at al-Rabadha in the empty desert under a wide sky. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 12. Hadiths of ʿAmir ibn Rabiʿa, may God be pleased with him (أَحَادِيثُ عَامِرِ بْنِ رَبِيعَةَ رضي الله عنه)

File: `12.webp`

```text
A siwāk stick resting beside a cup turned upside down. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 13. Hadiths of ʿAmmar ibn Yasir, may God be pleased with him (أَحَادِيثُ عَمَّارِ بْنِ يَاسِرٍ رضي الله عنه)

File: `13.webp`

```text
Mudbricks stacked two by two beside the half-built walls of a mosque. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 14. Hadith of Suhayb, may God be pleased with him, from the Messenger of God (ﷺ) (حَدِيثُ صُهَيْبٍ رضي الله عنه عَنْ رَسُولِ اللَّهِ صلى الله عليه وسلم)

File: `14.webp`

```text
The small mosque of Qubāʾ among palms in morning light. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 15. Hadiths of Bilal ibn Rabah, may God be pleased with him, the muezzin of the Messenger of God (ﷺ) (أَحَادِيثُ بِلَالِ بْنِ رَبَاحٍ رضي الله عنه مُؤَذِّنِ رَسُولِ اللَّهِ صلى الله عليه وسلم)

File: `15.webp`

```text
Two wooden pillars in a dim stone sanctuary, a beam of light falling between them. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 16. Hadiths of Khabbab ibn al-Aratt, may God be pleased with him (أَحَادِيثُ خَبَّابِ بْنِ الْأَرَتِّ رضي الله عنه)

File: `16.webp`

```text
A smith's forge with glowing coals, tongs and a half-finished blade. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 17. Hadiths of ʿA’isha, Mother of the Believers, may God be pleased with her, from the Messenger of God (ﷺ) (أَحَادِيثُ عَائِشَةَ أُمِّ الْمُؤْمِنِينَ رضي الله عنها عَنْ رَسُولِ اللَّهِ صلى الله عليه وسلم)

File: `17.webp`

```text
A small room beside the mosque with a palm-fiber mattress, a lamp and a water jug. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 18. Hadiths of Hafsa bint ʿUmar ibn al-Khattab, may God be pleased with her (أَحَادِيثُ حَفْصَةَ بِنْتِ عُمَرَ بْنِ الْخَطَّابِ رضي الله عنها)

File: `18.webp`

```text
A wooden chest wrapped in cloth in a quiet room, the desert visible through the window. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 19. Hadiths of Umm Salama, wife of the Prophet (ﷺ), whose name is Hind bint Abi Umayya al-Makhzumi, may God be pleased with her (أَحَادِيثُ أُمِّ سَلَمَةَ زَوْجَةِ النَّبِيِّ صلى الله عليه وسلم وَاسْمُهَا هِنْدُ بِنْتُ أَبِي أُمَيَّةَ الْمَخْزُومِيِّ رضي الله عنها)

File: `19.webp`

```text
A tent at Ḥudaybiya with a sacrificial camel kneeling outside. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 20. Hadiths of Umm Habiba bint Abi Sufyan, wife of the Prophet (ﷺ), may God be pleased with her (أَحَادِيثُ أُمِّ حَبِيبَةَ بِنْتِ أَبِي سُفْيَانَ زَوْجِ النَّبِيِّ صلى الله عليه وسلم رضي الله عنها)

File: `20.webp`

```text
Lanterns leaving Muzdalifa before dawn, the valley still in darkness. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 21. Hadith of Zaynab bint Jahsh al-Asadiyya, may God be pleased with her (حَدِيثُ زَيْنَبَ بِنْتِ جَحْشٍ الْأَسَدِيَّةِ رضي الله عنها)

File: `21.webp`

```text
A massive barrier of iron and copper between two mountains, with a small ring-shaped gap in it. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 22. Hadiths of Maymuna bint al-Harith, wife of the Prophet (ﷺ), may God be pleased with her (أَحَادِيثُ مَيْمُونَةَ بِنْتِ الْحَارِثِ زَوْجِ النَّبِيِّ صلى الله عليه وسلم رضي الله عنها)

File: `22.webp`

```text
A jar of clarified butter with a ladle inside a tent. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 23. Hadith of Juwayriya bint al-Harith, may God be pleased with her (حَدِيثُ جُوَيْرِيَةَ بِنْتِ الْحَارِثِ رضي الله عنها)

File: `23.webp`

```text
A prayer place lit by the forenoon sun, a small heap of date stones for counting. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 24. Hadiths of Asma bint Abi Bakr al-Siddiq, may God be pleased with her (أَحَادِيثُ أَسْمَاءَ بِنْتِ أَبِي بَكْرٍ الصِّدِّيقِ رضي الله عنها)

File: `24.webp`

```text
A woman's waistband torn into two halves, one tied around a provision bag and one around a waterskin. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 25. Hadiths of Umm Kulthum bint ʿUqba ibn Abi Muʿayt, may God be pleased with her (أَحَادِيثُ أُمِّ كُلْثُومٍ بِنْتِ عُقْبَةَ بْنِ أَبِي مَعِيطٍ رضي الله عنها)

File: `25.webp`

```text
A bowl of food set at the door of a closed house. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 26. Hadith of Asma bint ʿUmays, may God be pleased with her (حَدِيثُ أَسْمَاءَ بِنْتِ عُمَيْسٍ رضي الله عنها)

File: `26.webp`

```text
A small cup of water with a sprig of herbs, three children's caps beside it. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 27. Hadiths of Umm Hani’ bint Abi Talib, may God be pleased with her (أَحَادِيثُ أُمَّ هَانِئٍ بِنْتِ أَبِي طَالِبٍ رضي الله عنها)

File: `27.webp`

```text
A courtyard in Mecca with a curtain screening a doorway and a bathing basin. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 28. Hadiths of Khawla bint Hakim, wife of ʿUthman ibn Mazʿun, may God be pleased with her (أَحَادِيثُ خَوْلَةَ بِنْتِ حَكِيمٍ امْرَأَةِ عُثْمَانَ بْنِ مَظْعُونٍ رضي الله عنها)

File: `28.webp`

```text
A child's small shawl folded on a cushion beside a sprig of sweet basil. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 29. Hadiths of Umm Khalid bint Khalid ibn Saʿid ibn al-ʿAs, may God be pleased with her (أَحَادِيثُ أُمِّ خَالِدٍ بِنْتِ خَالِدِ بْنِ سَعِيدِ بْنِ الْعَاصِ رضي الله عنها)

File: `29.webp`

```text
A small black garment embroidered with green and red designs on a cushion. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 30. Hadith of Umm al-Fadl bint al-Harith, may God be pleased with her (حَدِيثُ أُمِّ الْفَضْلِ بِنْتِ الْحَارِثِ رضي الله عنها)

File: `30.webp`

```text
Dusk light falling across a prayer mat. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 31. Hadiths of Umm Ayyub, may God be pleased with her (أَحَادِيثُ أُمِّ أَيُّوبَ رضي الله عنها)

File: `31.webp`

```text
Onions and garlic in a dish beside a cooking pot in a house of Medina. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 32. Hadith of Umayma bint Ruqayqa, kinswoman of Khadija, may God be pleased with her (حَدِيثُ أُمَيْمَةَ بِنْتِ رَقِيقَةَ نَسِيبَةِ خَدِيجَةَ رضي الله عنها)

File: `32.webp`

```text
A row of folded veils on a bench in a sunlit room. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 33. Hadith of al-Rubayyiʿ bint Muʿawwidh ibn ʿAfra’, may God be pleased with her (حَدِيثُ الرُّبَيِّعِ بِنْتِ مُعَوِّذِ ابْنِ عَفْرَاءَ رضي الله عنها)

File: `33.webp`

```text
A small brass water vessel and an ewer on a step. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 34. Hadiths of Umm Qays bint Mihsan al-Asadiyya, of Asad Khuzayma, may God be pleased with her (أَحَادِيثُ أُمِّ قَيْسٍ بِنْتِ مُحْصَنٍ الْأَسَدِيَّةِ أَسَدِ خُزَيْمَةَ رضي الله عنها)

File: `34.webp`

```text
An infant's swaddling cloth and a cup of water. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 35. Hadiths of Umm Kurz al-Khuzaʿiyya, may God be pleased with her (أَحَادِيثُ أُمِّ كُرْزٍ الْخُزَاعِيَّةِ رضي الله عنها)

File: `35.webp`

```text
Two sheep and one sheep tethered separately in a yard. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 36. Hadiths of Umm Haram, may God be pleased with her (أَحَادِيثُ أُمِّ حرَامٍ رضي الله عنها)

File: `36.webp`

```text
A sail on a blue sea off a distant island, a mule's saddle on the shore. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 37. Hadith of Umm Sharik, may God be pleased with her (حَدِيثُ أُمِّ شَرِيكٍ رضي الله عنها)

File: `37.webp`

```text
A gecko on a sun-warmed stone wall. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 38. Hadith of Baqira, may God be pleased with her (حَدِيثُ بَقِيرَةَ رضي الله عنها)

File: `38.webp`

```text
A woman's doorway in Medina with a lamp beside it. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 39. Hadith of Busra bint Safwan, may God be pleased with her (حَدِيثُ بُسْرَةَ بِنْتِ صَفْوَانَ رضي الله عنها)

File: `39.webp`

```text
An ewer beside a doorway in Medina. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 40. Hadith of Khawla bint Qays, wife of Hamza ibn ʿAbd al-Muttalib, may God be pleased with her (حَدِيثُ خَوْلَةَ بِنْتِ قَيْسٍ امْرَأَةِ حَمْزَةَ بْنِ عَبْدِ الْمُطَّلِبِ رضي الله عنها)

File: `40.webp`

```text
A green garden heavy with sweet fruit. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 41. Hadith of Kabsha, may God be pleased with her (حَدِيثُ كَبْشَةَ رضي الله عنها)

File: `41.webp`

```text
A leather waterskin hanging from a peg, its mouth cut away and kept. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 42. Hadith of the paternal aunt of Husayn ibn Mihsan, may God the Exalted have mercy on her (حَدِيثُ عَمَّةِ حُصَيْنِ بْنِ مُحْصَنٍ رَحِمَهَا اللَّهُ تَعَالَى)

File: `42.webp`

```text
A household doorway with a pair of sandals before it. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 43. Hadiths of Umm Maʿbad, may God be pleased with her (أَحَادِيثُ أُمِّ مَعْبَدٍ رضي الله عنها)

File: `43.webp`

```text
A Bedouin tent beside the road with a lean goat and a milk bowl. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 44. Hadith of the mother of Sulayman ibn ʿAmr ibn al-Ahwas, may God be pleased with her (حَدِيثُ أُمِّ سُلَيْمَانَ بْنِ عَمْرِو بْنِ الْأَحْوَصِ رضي الله عنها)

File: `44.webp`

```text
The valley at Mina beside the pillar of stoning, pebbles on the ground. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 45. Hadith of Umm Husayn, may God be pleased with her (حَدِيثُ أُمِّ حُصَيْنٍ رضي الله عنها)

File: `45.webp`

```text
A cloak draped over a camel saddle on a pilgrimage plain. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 46. Hadiths of Umm ʿAtiyya al-Ansariyya, may God be pleased with her (أَحَادِيثُ أُمِّ عَطِيَّةَ الْأَنْصَارِيَّةِ رضي الله عنها)

File: `46.webp`

```text
A basin of water with lote leaves and a cake of camphor. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 47. Hadiths of Fatima bint Qays al-Fihriyya, may God be pleased with her (أَحَادِيثُ فَاطِمَةَ بِنْتِ قَيْسٍ الْفِهْرِيَّةِ رضي الله عنها)

File: `47.webp`

```text
An island in a stormy sea with a lone stone building on its shore. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 48. Hadiths of Asma bint Yazid ibn Sakan al-Ashhaliyya, may God be pleased with her (أَحَادِيثُ أَسْمَاءَ بِنْتِ يَزِيدَ بْنِ سَكَنٍ الْأَشْهَلِيَّةِ رضي الله عنها)

File: `48.webp`

```text
A woman's tent with its flap lifted, light falling inside. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 50. Hadith of Muʿadh ibn Jabal, may God be pleased with him (حَدِيثُ مُعَاذِ بْنِ جَبَلٍ رضي الله عنه)

File: `50.webp`

```text
A road to Yemen through mountains, a sealed letter resting on a stone. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 51. Hadiths of Ubayy ibn Kaʿb, may God be pleased with him (أَحَادِيثُ أُبَيِّ بْنِ كَعْبٍ رضي الله عنه)

File: `51.webp`

```text
A codex on a stand in a reciter's room at dawn. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 52. Hadiths of Abu Ayyub al-Ansari, may God be pleased with him (أَحَادِيثُ أَبِي أَيُّوبَ الْأَنْصَارِيِّ رضي الله عنه)

File: `52.webp`

```text
A two-story house in Medina with a lamp in its upper room. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 53. Hadiths of ʿUbada ibn al-Samit, may God be pleased with him (أَحَادِيثُ عُبَادَةَ بْنِ الصَّامِتِ رضي الله عنه)

File: `53.webp`

```text
A rocky ravine at night under starlight. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 54. Hadiths of Abu al-Darda’, may God be pleased with him (أَحَادِيثُ أَبِي الدَّرْدَاءِ رضي الله عنه)

File: `54.webp`

```text
A garden in Damascus with an old olive tree. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 55. Hadiths of Zayd ibn Thabit al-Ansari, may God be pleased with him (أَحَادِيثُ زَيْدِ بْنِ ثَابِتٍ الْأَنْصَارِيِّ رضي الله عنه)

File: `55.webp`

```text
Sheets of parchment, palm stalks and flat white stones gathered on a table. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 56. Hadiths of Sahl ibn Abi Hathma, may God be pleased with him (أَحَادِيثُ سَهْلِ بْنِ أَبِي حَثْمَةَ رضي الله عنه)

File: `56.webp`

```text
A palm grove at harvest with heavy clusters hanging ready for estimation. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 57. Hadith of Sahl ibn Hunayf al-Ansari, may God be pleased with him (حَدِيثُ سَهْلِ بْنِ حُنَيْفٍ الْأَنْصَارِيِّ رضي الله عنه)

File: `57.webp`

```text
The plain of Ṣiffīn by the Euphrates with lances planted in rows. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 58. Hadiths of Rafiʿ ibn Khadij al-Ansari, may God be pleased with him (أَحَادِيثُ رَافِعِ بْنِ خَدِيجٍ الْأَنْصَارِيِّ رضي الله عنه)

File: `58.webp`

```text
Farmland by a stream, a plow at rest. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 59. Hadiths of ʿAbd Allah ibn Zayd al-Ansari, may God be pleased with him, who was shown the call to prayer [in a dream] (أَحَادِيثُ عَبْدِ اللَّهِ بْنِ زَيْدٍ الْأَنْصَارِيِّ رضي الله عنه الَّذِي أُرِيَ النِّدَاءَ)

File: `59.webp`

```text
A rooftop at night, a wooden clapper set aside on the parapet. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 60. Hadiths of Abu Qatada al-Ansari, may God be pleased with him (أَحَادِيثُ أَبِي قَتَادَةَ الْأَنْصَارِيِّ رضي الله عنه)

File: `60.webp`

```text
A wild donkey in the desert, a bow laid down nearby. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 61. Hadith of Abu Talha al-Ansari, may God be pleased with him (حَدِيثُ أَبِي طَلْحَةَ الْأَنْصَارِيِّ رضي الله عنه)

File: `61.webp`

```text
A plain doorway in Medina with a simple curtain. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 62. Hadiths of Khuzayma ibn Thabit al-Ansari, may God be pleased with him (أَحَادِيثُ خُزَيْمَةَ بْنِ ثَابِتٍ الْأَنْصَارِيِّ رضي الله عنه)

File: `62.webp`

```text
A horse tethered at a gate. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 63. Narration of Suwayd ibn al-Nuʿman, may God be pleased with him (حَدِيثُ سُوَيْدِ بْنِ النُّعْمَانِ رضي الله عنه)

File: `63.webp`

```text
A bowl of barley gruel set out at a desert stopping place. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 64. Narration of Qays ibn Abi Gharaza, may God be pleased with him (حَدِيثُ قَيْسِ بْنِ أَبِي غَرْزَةَ رضي الله عنه)

File: `64.webp`

```text
A market of Medina with bolts of cloth and scales. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 65. Narration of ʿUbayd Allah ibn Mihsan al-Ansari, may God be pleased with him (حَدِيثُ عُبَيْدِ اللَّهِ بْنِ مُحْصَنٍ الْأَنْصَارِيِّ رضي الله عنه)

File: `65.webp`

```text
A modest home with bread and water on a cloth. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 66. Narrations of Hudhayfa ibn al-Yaman, may God be pleased with him (أَحَادِيثُ حُذَيْفَةَ بْنِ الْيَمَانِ رضي الله عنه)

File: `66.webp`

```text
A cold battlefield at night beside a trench, a cloak beside the ashes of a campfire. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 67. Narrations of Abu Masʿud al-Ansari, may God be pleased with him (أَحَادِيثُ أَبِي مَسْعُودٍ الْأَنْصَارِيِّ رضي الله عنه)

File: `67.webp`

```text
A small Kufan mosque of mudbrick in morning light. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 68. Narrations of al-ʿAbbas ibn ʿAbd al-Muttalib, may God be pleased with him (أَحَادِيثُ الْعَبَّاسِ بْنِ عَبْدِ الْمُطَّلِبِ رضي الله عنه)

File: `68.webp`

```text
Leather buckets beside the well of Zamzam. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 69. Narration of al-Fadl ibn ʿAbbas, may God be pleased with him (حَدِيثُ الْفَضْلِ بْنِ عَبَّاسٍ رضي الله عنه)

File: `69.webp`

```text
A two-seat camel saddle on the road from Muzdalifa at dawn. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 70. Narrations of Ibn ʿAbbas, may God be pleased with him, in which he said “I heard the Messenger of God ﷺ” and “I saw the Messenger of God ﷺ” (أَحَادِيثُ ابْنُ عَبَّاسٍ رضي الله عنه الَّتِي قَالَ فِيهَا سَمِعْتُ رَسُولَ اللَّهِ صلى الله عليه وسلم وَرَأَيْتُ رَسُولَ اللَّهِ صلى الله عليه وسلم)

File: `70.webp`

```text
A scholar's corner with stacked tablets lit by a window. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 71. Further narrations of Ibn ʿAbbas, may God be pleased with him (أَحَادِيثُ ابْنُ عَبَّاسٍ رضي الله عنه أَيْضًا)

File: `71.webp`

```text
Orchards on the hillsides of Ṭāʾif. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 72. On Hajj (فِي الْحَجِّ)

File: `72.webp`

```text
The plain of ʿArafāt at noon with tents. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 73. Narrations of ʿAbd Allah ibn Jaʿfar, may God be pleased with him (أَحَادِيثُ عَبْدِ اللَّهِ بْنِ جَعْفَرٍ رضي الله عنه)

File: `73.webp`

```text
Platters of food set out generously in a courtyard. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 74. Narrations of Usama ibn Zayd, may God be pleased with him (أَحَادِيثُ أُسَامَةَ بْنِ زَيْدٍ رضي الله عنه)

File: `74.webp`

```text
A banner furled on a spear at an army camp. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 75. Narrations of Abu Rafiʿ, may God be pleased with him, freedman of the Messenger of God ﷺ (أَحَادِيثُ أَبِي رَافِعٍ رضي الله عنه مَوْلَى رَسُولِ اللَّهِ صلى الله عليه وسلم)

File: `75.webp`

```text
A freedman's house with a tent and a cooking fire. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 76. Narrations of Hakim ibn Hizam, may God be pleased with him (أَحَادِيثُ حَكِيمِ بْنِ حِزَامٍ رضي الله عنه)

File: `76.webp`

```text
Three purses of coins on a cloth, the last left untouched. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 77. Narrations of Jubayr ibn Mutʿim, may God be pleased with him (أَحَادِيثُ جُبَيْرِ بْنِ مُطْعَمٍ رضي الله عنه)

File: `77.webp`

```text
The mountain of Sinai at dusk. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 78. Narration of Khalid ibn al-Walid, may God be pleased with him (حَدِيثُ خَالِدِ بْنِ الْوَلِيدِ رضي الله عنه)

File: `78.webp`

```text
A sword and helmet on a camp table in Syria. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 79. Narration of ʿAbd al-Rahman ibn Abi Bakr, may God be pleased with him (حَدِيثُ عَبْدِ الرَّحْمَنِ بْنِ أَبِي بَكْرٍ رضي الله عنه)

File: `79.webp`

```text
The boundary at al-Tanʿīm outside Mecca, a camel with two saddles. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 80. Narration of Safwan ibn Umayya, may God be pleased with him (حَدِيثُ صَفْوَانَ بْنِ أُمَيَّةَ رضي الله عنه)

File: `80.webp`

```text
A cloak folded as a pillow in the mosque. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 81. Narration of ʿUthman ibn Talha al-Hajabi, may God be pleased with him (حَدِيثُ عُثْمَانَ بْنِ طَلْحَةَ الْحَجَبِيِّ رضي الله عنه)

File: `81.webp`

```text
A large iron key on a cord on a stone ledge. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 82. Two narrations of ʿAmr ibn Huraith, may God be pleased with him (حَدِيثَا عَمْرِو بْنِ حُرَيْثٍ رضي الله عنه)

File: `82.webp`

```text
A black turban folded on a wooden stand. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 83. Narration of Mutiʿ ibn al-Aswad, may God be pleased with him (حَدِيثُ مُطِيعِ بْنِ الْأَسْوَدِ رضي الله عنه)

File: `83.webp`

```text
Quiet Meccan lanes at dawn after the conquest. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 84. Narration of ʿAbd Allah ibn Zamʿa, may God be pleased with him (حَدِيثُ عَبْدِ اللَّهِ بْنِ زَمْعَةَ رضي الله عنه)

File: `84.webp`

```text
Rock-cut tombs of al-Ḥijr, the tracks of a she-camel in the sand. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 85. Two narrations of ʿUmar ibn Abi Salama, may God be pleased with him (حَدِيثَا عُمَرَ بْنِ أَبِي سَلَمَةَ رضي الله عنه)

File: `85.webp`

```text
A shared dish of food eaten only from its near side. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 86. Two narrations of al-Harith ibn Malik ibn al-Barsa', may God be pleased with him (حَدِيثَا الْحَارِثِ بْنِ مَالِكِ ابْنِ الْبَرْصَاءِ رضي الله عنه)

File: `86.webp`

```text
The valley of Mecca ringed by mountains in clear light. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 87. Narration of Kurz ibn ʿAlqama al-Khuzaʿi, may God be pleased with him (حَدِيثُ كُرْزِ بْنِ عَلْقَمَةَ الْخُزَاعِيِّ رضي الله عنه)

File: `87.webp`

```text
Darkening clouds over a city like layered shadows. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 88. Two narrations of Abu Shurayh al-Kaʿbi al-Khuzaʿi, may God be pleased with him (حَدِيثَا أَبِي شُرَيْحٍ الْكَعْبِيِّ ثُمَّ الْخُزَاعِيِّ رضي الله عنه)

File: `88.webp`

```text
A guest's place set with bread and a lamp. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 89. Narration of Ibn Mirbaʿ al-Ansari, may God be pleased with him (حَدِيثُ ابْنِ مِرْبَعٍ الْأَنْصَارِيِّ رضي الله عنه)

File: `89.webp`

```text
The plain of ʿArafa with stations marked by flags. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 90. Narration of al-Muttalib ibn Abi Wadaʿa, may God be pleased with him (حَدِيثُ الْمُطَّلِبِ بْنِ أَبِي وَدَاعَةَ رضي الله عنه)

File: `90.webp`

```text
A gateway of the Meccan sanctuary with footprints passing in front. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 91. Narration of ʿUqba ibn al-Harith al-Nawfali, may God be pleased with him (حَدِيثُ عُقْبَةَ بْنِ الْحَارِثِ النَّوْفَلِيِّ رضي الله عنه)

File: `91.webp`

```text
A bridal chamber with a nursing cup left on the step. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 92. Narrations of ʿAbd Allah ibn ʿAmr ibn al-ʿAs, may God be pleased with him (أَحَادِيثُ عَبْدِ اللَّهِ بْنِ عَمْرِو بْنِ الْعَاصِ رضي الله عنه)

File: `92.webp`

```text
A bound notebook on a desk with a reed pen. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 93. Reports of Muʿāwiya ibn Abī Sufyān (may God be pleased with him) (أَحَادِيثُ مُعَاوِيَةَ بْنِ أَبِي سُفْيَانَ رضي الله عنه)

File: `93.webp`

```text
A pulpit in Damascus with a curtain drawn back. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 94. Reports of ʿAbd Allāh ibn ʿUmar ibn al-Khaṭṭāb (may God be pleased with him) (أَحَادِيثُ عَبْدِ اللَّهِ بْنِ عُمَرَ بْنِ الْخَطَّابِ رضي الله عنه)

File: `94.webp`

```text
A walking staff and sandals set on a stone where earlier footsteps fell. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 95. Reports of Kaʿb ibn ʿUjra (may God be pleased with him) (أَحَادِيثُ كَعْبِ بْنِ عُجْرَةَ رضي الله عنه)

File: `95.webp`

```text
A cooking pot at Ḥudaybiya with a razor on a cloth. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 96. Reports of ʿAbd Allāh ibn Abī Awfā (may God be pleased with him) (أَحَادِيثُ عَبْدِ اللَّهِ بْنِ أَبِي أَوْفَى رضي الله عنه)

File: `96.webp`

```text
A bowl of roasted locusts beside a campaign tent. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 97. Reports of al-Barāʾ ibn ʿĀzib (may God Almighty be pleased with him) (أَحَادِيثُ الْبَرَاءِ بْنِ عَازِبٍ رَضِيَ اللَّهُ تَعَالَى عَنْهُ)

File: `97.webp`

```text
The valley of Ḥunayn at dawn. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 98. Reports of Abū Saʿīd al-Khudrī (may God be pleased with him) (أَحَادِيثُ أَبِي سَعِيدٍ الْخُدْرِيِّ رضي الله عنه)

File: `98.webp`

```text
A basket of dates measured out by the ṣāʿ. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 99. Narrations of al-Mughīra ibn Shuʿba, may God be pleased with him (أَحَادِيثُ الْمُغِيرَةِ بْنِ شُعْبَةَ رضي الله عنه)

File: `99.webp`

```text
Leather socks and an ewer beside a desert campfire. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 100. Narrations of Abū Mūsā al-Ashʿarī, may God be pleased with him (أَحَادِيثُ أَبِي مُوسَى الْأَشْعَرِيِّ رضي الله عنه)

File: `100.webp`

```text
A reed pipe laid beside a lamp in a quiet room. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 101. Narrations of Jundub ibn ʿAbd Allāh al-Bajalī, may God be pleased with him (أَحَادِيثُ جُنْدُبِ بْنِ عَبْدِ اللَّهِ الْبَجَلِيِّ رضي الله عنه)

File: `101.webp`

```text
A Kufan house of reed and mudbrick with a cup on its step. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 102. Narrations of al-Ṣaʿb ibn Jaththāma, may God be pleased with him (أَحَادِيثُ الصَّعْبِ بْنِ جَثَّامَةَ رضي الله عنه)

File: `102.webp`

```text
A wild ass grazing in the desert, a hunting bow set aside. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 103. Narrations of Yaʿlā ibn Umayya, may God be pleased with him (أَحَادِيثُ يَعْلَى بْنِ أُمَيَّةَ رضي الله عنه)

File: `103.webp`

```text
A perfumed robe beside a basin at al-Jiʿrāna. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 104. Two narrations of Abū Bakra, may God be pleased with him (حَدِيثَا أَبِي بَكْرَةَ رضي الله عنه)

File: `104.webp`

```text
A judge's cushion with a cup of cool water. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 105. Narrations of Jarīr ibn ʿAbd Allāh al-Bajalī, may God be pleased with him (أَحَادِيثُ جَرِيرِ بْنِ عَبْدِ اللَّهِ الْبَجَلِيِّ رضي الله عنه)

File: `105.webp`

```text
A full moon over a desert under a clear sky. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 106. Two narrations of al-Sharīd ibn Suwayd, may God be pleased with him (حَدِيثَا الشَّرِيدِ بْنِ سُوَيْدٍ رضي الله عنه)

File: `106.webp`

```text
A two-seat camel saddle on a road at dusk. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 107. Narrations of Zayd ibn Khālid al-Juhanī, may God be pleased with him (أَحَادِيثُ زَيْدِ بْنِ خَالِدٍ الْجُهَنِيِّ رضي الله عنه)

File: `107.webp`

```text
A stray waterskin and a camel at a watering place. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 108. Narration of Qabīṣa ibn Mukhāriq al-Hilālī, may God be pleased with him (حَدِيثُ قَبِيصَةَ بْنِ مُخَارِقٍ الْهِلَالِيِّ رضي الله عنه)

File: `108.webp`

```text
A purse of coins on a ledger. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 109. Narration of ʿIṣām al-Muzanī, may God be pleased with him (حَدِيثُ عِصَامٍ الْمُزَنِيِّ رضي الله عنه)

File: `109.webp`

```text
A small village mosque seen from a road. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 110. Narration of ʿAbd Allāh ibn al-Sāʾib, may God be pleased with him (حَدِيثُ عَبْدِ اللَّهِ بْنِ السَّائِبِ رضي الله عنه)

File: `110.webp`

```text
The Meccan sanctuary at dawn. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 111. Narration of Yaʿlā ibn Murra, may God be pleased with him (حَدِيثُ يَعْلَى بْنِ مُرَّةَ رضي الله عنه)

File: `111.webp`

```text
A saffron-yellow perfumed robe beside a basin. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 112. Narration of Salmān ibn ʿĀmir, may God be pleased with him (حَدِيثُ سَلْمَانُ بْنُ عَامِرٍ رضي الله عنه)

File: `112.webp`

```text
A tethered ram beside a newborn's shawl. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 113. Narration of Usāma ibn Sharīk al-ʿĀmirī, may God be pleased with him (حَدِيثُ أُسَامَةَ بْنِ شَرِيكٍ الْعَامِرِيِّ رضي الله عنه)

File: `113.webp`

```text
Bedouin tents with camel saddles and a cup of medicine. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 114. Narration of Quṭba ibn Mālik, may God be pleased with him (حَدِيثُ قُطْبَةَ بْنِ مَالِكٍ رضي الله عنه)

File: `114.webp`

```text
Tall palm trees with layered clusters of dates. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 115. Two narrations of Abū Surayḥa Ḥudhayfa ibn Usayd al-Ghifārī, may God be pleased with him (حَدِيثَا أَبِي سُرَيْحَةَ حُذَيْفَةَ بْنِ أُسَيْدٍ الْغِفَارِيِّ رضي الله عنه)

File: `115.webp`

```text
A seed in the soil beginning to sprout. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 116. Narration of Mujammiʿ al-Anṣārī, may God be pleased with him (حَدِيثُ مُجَمِّعٍ الْأَنْصَارِيِّ رضي الله عنه)

File: `116.webp`

```text
The gate of a stone town at dawn. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 117. Narrations of ʿImrān ibn Ḥuṣayn, may God be pleased with him (أَحَادِيثُ عِمْرَانَ بْنِ حُصَيْنٍ رضي الله عنه)

File: `117.webp`

```text
A Basran mosque at noon. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 118. Narration of Tamīm al-Dārī, may God be pleased with him (حَدِيثُ تَمِيمٍ الدَّارِيِّ رضي الله عنه)

File: `118.webp`

```text
Oil lamps hanging in a mosque of palm trunks. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 119. Two narrations of Murra al-Fihrī, may God be pleased with him (حَدِيثَا مُرَّةَ الْفِهْرِيِّ رضي الله عنه)

File: `119.webp`

```text
A child's bowl and cushion beside an adult's. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 120. Narration of Abū Ḥumayd al-Sāʿidī, may God be pleased with him (حَدِيثُ أَبِي حُمَيْدٍ السَّاعِدِيِّ رضي الله عنه)

File: `120.webp`

```text
Gifts heaped beside collected alms. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 121. Narrations of ʿUrwa ibn Abī al-Jaʿd al-Bāriqī, may God be pleased with him (أَحَادِيثُ عُرْوَةَ بْنِ أَبِي الْجَعْدِ الْبَارِقِيِّ رضي الله عنه)

File: `121.webp`

```text
A horse's forelock braided, the horse standing in light. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 122. Narration of al-ʿAlāʾ ibn al-Ḥaḍramī, may God be pleased with him (حَدِيثُ الْعَلَاءِ بْنِ الْحَضْرَمِيِّ رضي الله عنه)

File: `122.webp`

```text
Three nights of lamps outside a Meccan house. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 123. Two narrations of Sabra ibn Maʿbad al-Juhanī, may God be pleased with him (حَدِيثَا سَبْرَةَ بْنِ مَعْبَدٍ الْجُهَنِيِّ رضي الله عنه)

File: `123.webp`

```text
A cloak folded on a bench in Mecca. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 124. Two narrations of Abū Wāqid al-Laythī, may God be pleased with him (حَدِيثَا أَبِي وَاقِدٍ اللَّيْثِيِّ رضي الله عنه)

File: `124.webp`

```text
A large lone tree with weapons hanging from its branches. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 125. Report of Thābit ibn al-Ḍaḥḥāk ؓ (حَدِيثُ ثَابِتِ بْنِ الضَّحَّاكِ رضي الله عنه)

File: `125.webp`

```text
The acacia tree of the pledge at Ḥudaybiya. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 126. Report of ʿUqba ibn ʿĀmir al-Juhanī ؓ (حَدِيثُ عُقْبَةَ بْنِ عَامِرٍ الْجُهَنِيِّ رضي الله عنه)

File: `126.webp`

```text
A steep mountain pass descending at dusk. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 127. Report of Muʿādh al-Taymī, or Ibn Muʿādh ؓ (حَدِيثُ مُعَاذٍ التَّيْمِيِّ أَوِ ابْنِ مُعَاذٍ رضي الله عنه)

File: `127.webp`

```text
Tents at Mina arranged in rows. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 128. Report of al-Sāʾib ibn Khallād al-Anṣārī ؓ (حَدِيثُ السَّائِبِ بْنِ خَلَّادٍ الْأَنْصَارِيِّ رضي الله عنه)

File: `128.webp`

```text
A wide valley with white pilgrim cloths drying in the wind. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 129. Report of Abū al-Baddāḥ, from his father ؓ (حَدِيثُ أَبِي الْبَدَّاحِ عَنْ أَبِيهِ رضي الله عنه)

File: `129.webp`

```text
Shepherds' staffs resting near Mina, sheep grazing. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 130. Report of al-Mustawrid al-Fihrī ؓ (حَدِيثُ مُسْتَوْرِدٍ الْفِهْرِيِّ رضي الله عنه)

File: `130.webp`

```text
A vast sea with a single drop of water on a stone. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 131. Report of Salama ibn Qays al-Ashjaʿī ؓ (حَدِيثُ سَلِمَةَ بْنِ قَيْسٍ الْأَشْجَعِيِّ رضي الله عنه)

File: `131.webp`

```text
A few odd-numbered stones beside an ewer. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 132. Two reports of Jarhad al-Aslamī ؓ (حَدِيثَا جَرْهَدٍ الْأَسْلَمِيِّ رضي الله عنه)

File: `132.webp`

```text
A cloak folded properly on a mosque bench. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 133. Report of al-Ḥakam ibn ʿAmr al-Ghifārī ؓ (حَدِيثُ الْحَكَمْ بْنِ عَمْرٍو الْغِفَارِيِّ رضي الله عنه)

File: `133.webp`

```text
A cooking pot overturned beside a donkey's tether. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 134. Report of Jābir al-Aḥmasī ؓ (حَدِيثُ جَابِرٍ الْأَحْمَسِيِّ رضي الله عنه)

File: `134.webp`

```text
A gourd hanging on a vine. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 135. Two reports of ʿUmāra ibn Ruwayba al-Thaqafī ؓ (حَدِيثَا عُمَارَةَ بْنِ رُوَيْبَةَ الثَّقَفِيِّ رضي الله عنه)

File: `135.webp`

```text
A courtyard at sunrise beside its mirror at sunset. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 136. Report of Muḥarrish al-Kaʿbī ؓ (حَدِيثُ مُحَرِّشٍ الْكَعْبِيِّ رضي الله عنه)

File: `136.webp`

```text
The camp at al-Jiʿrāna at night under moonlight. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 137. Report of Kaʿb ibn ʿĀṣim al-Ashʿarī ؓ (حَدِيثُ كَعْبِ بْنِ عَاصِمٍ الْأَشْعَرِيِّ رضي الله عنه)

File: `137.webp`

```text
A traveler's waterskin and cup in midday heat. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 138. Report of Sufyān ibn Abī Zuhayr al-Muzanī ؓ (حَدِيثُ سُفْيَانَ بْنِ أَبِي زُهَيْرٍ الْمُزَنِيِّ رضي الله عنه)

File: `138.webp`

```text
Caravans leaving Medina loaded with household goods. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 139. Report of Abū Rimtha ؓ (حَدِيثُ أَبِي رَمْثَةَ رضي الله عنه)

File: `139.webp`

```text
A physician's pouch of herbs on a cloth. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 140. Report of ʿAbd Allāh ibn Sarjis ؓ (حَدِيثُ عَبْدِ اللَّهِ بْنِ سَرْجِسَ رضي الله عنه)

File: `140.webp`

```text
A smooth rounded stone in light. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 141. Report of Qays ؓ (حَدِيثُ قَيْسٍ رضي الله عنه)

File: `141.webp`

```text
A prayer mat just after dawn, the sun barely up. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 142. Two reports of Yūsuf ibn ʿAbd Allāh ibn Salām ؓ (حَدِيثَا يُوسُفَ بْنِ عَبْدِ اللَّهِ بْنِ سَلَامٍ رضي الله عنه)

File: `142.webp`

```text
A child's embroidered cap and a small bowl of dates. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 143. Report of Ḥabīb ibn Maslama al-Fihrī ؓ (حَدِيثُ حَبِيبِ بْنِ مَسْلَمَةَ الْفِهْرِيِّ رضي الله عنه)

File: `143.webp`

```text
A heap of spoils divided into shares. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 144. Report of Kaʿb ibn Mālik al-Anṣārī ؓ (حَدِيثُ كَعْبِ بْنِ مَالِكٍ الْأَنْصَارِيِّ رضي الله عنه)

File: `144.webp`

```text
Green birds among the trees of a garden. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 145. Report of the uncle of Ibn Kaʿb ibn Mālik ؓ (حَدِيثُ عَمِّ ابْنِ كَعْبِ بْنِ مَالِكٍ رضي الله عنه)

File: `145.webp`

```text
A fortress of Khaybar at night with a door ajar. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 146. Report of Abū Thaʿlaba al-Khushanī ؓ (حَدِيثُ أَبِي ثَعْلَبَةَ الْخُشَنِيِّ رضي الله عنه)

File: `146.webp`

```text
A wolf's tracks in sand near a cooking fire. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 147. Report of Iyās ibn ʿAbd Allāh ibn Abī Dhubāb ؓ (حَدِيثُ إِيَاسِ بْنِ عَبْدِ اللَّهِ بْنِ أَبِي ذُبَابٍ رضي الله عنه)

File: `147.webp`

```text
A woman's spindle and a broken stick set aside. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 148. Report of Ḥajjāj al-Aslamī ؓ (حَدِيثُ حَجَّاجٍ الْأَسْلَمِيِّ رضي الله عنه)

File: `148.webp`

```text
A nursing cup beside an opened shackle. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 149. Report of Saʿda ibn Muḥayyiṣa ibn Masʿūd al-Anṣārī ؓ (حَدِيثُ سَعْدَةَ بْنِ مُحَيِّصَةَ بْنِ مَسْعُودٍ الْأَنْصَارِيِّ رضي الله عنه)

File: `149.webp`

```text
Cupping vessels beside a camel's fodder bag. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 150. Report of ʿAbd Allāh ibn al-Zubayr ؓ (حَدِيثُ عَبْدِ اللَّهِ بْنِ الزُّبَيْرِ رضي الله عنه)

File: `150.webp`

```text
A courtyard of the Meccan sanctuary. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 151. Report of Nājiya al-Khuzāʿī ؓ, keeper of the Messenger of God’s ﷺ sacrificial camels (حَدِيثُ نَاجِيَةَ الْخُزَاعِيِّ رضي الله عنه صَاحِبِ بُدْنِ رَسُولِ اللَّهِ صلى الله عليه وسلم)

File: `151.webp`

```text
Garlanded sacrificial camels resting on the road. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 152. Report of Ṣafwān ibn ʿAssāl al-Murādī ؓ (حَدِيثُ صَفْوَانَ بْنِ عَسَّالٍ الْمُرَادِيِّ رضي الله عنه)

File: `152.webp`

```text
Leather socks beside a student's notebooks. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 153. Report of ʿAbd al-Raḥmān ibn Ḥasana ؓ (حَدِيثُ عَبْدِ الرَّحْمَنِ ابْنِ حَسَنَةَ رضي الله عنه)

File: `153.webp`

```text
A leather shield set upright on the sand. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 154. Report of Mālik al-Jushamī ؓ (حَدِيثُ مَالِكٍ الْجُشْمِيِّ رضي الله عنه)

File: `154.webp`

```text
A herd of camels and a flock of sheep at a well. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 155. Report of Wābiṣa ibn Maʿbad ؓ (حَدِيثُ وَابِصَةَ بْنِ مَعْبَدٍ رضي الله عنه)

File: `155.webp`

```text
A traveler's staff on the bank of the Euphrates at al-Raqqa. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 156. Two reports of Wāʾil ibn Ḥujr al-Ḥaḍramī ؓ (حَدِيثَا وَائِلِ بْنِ حُجْرٍ الْحَضْرَمِيِّ رضي الله عنه)

File: `156.webp`

```text
A Ḥaḍramī tower house in Yemen. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 157. Report of ʿAbd Allāh ibn Mughaffal ؓ (حَدِيثُ عَبْدِ اللَّهِ بْنِ مُغَفَّلٍ رضي الله عنه)

File: `157.webp`

```text
Small pebbles scattered on a stone floor. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 158. Report of ʿAṭiyya al-Quraẓī ؓ (حَدِيثُ عَطِيَّةَ الْقُرَظِيِّ رضي الله عنه)

File: `158.webp`

```text
A fortress among date palms. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 159. Reports of Abū Juḥayfa Wahb al-Suwāʾī ؓ (أَحَادِيثُ أَبِي جُحَيْفَةَ وَهْبٍ السُّوَائِيِّ رضي الله عنه)

File: `159.webp`

```text
A red tent at al-Abṭaḥ with a short spear planted before it. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 160. Report of Dukayn ibn Saʿīd al-Muzanī ؓ (حَدِيثُ دُكَيْنِ بْنِ سَعِيدٍ الْمُزَنِيِّ رضي الله عنه)

File: `160.webp`

```text
A storeroom with a heap of dates. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 161. Two reports of ʿAdī ibn ʿUmayra al-Kindī ؓ (حَدِيثَا عَدِيِّ بْنِ عُمَيْرَةَ الْكِنْدِيِّ رضي الله عنه)

File: `161.webp`

```text
A needle on a heap of spoils. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 162. Report of Jābir ibn Samura al-Suwāʾī ؓ (حَدِيثُ جَابِرِ بْنِ سَمُرَةَ السُّوَائِيِّ رضي الله عنه)

File: `162.webp`

```text
Restive horses' tails flicking in a stable. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 163. Report of ʿAbd al-Raḥmān ibn Azhar ؓ (حَدِيثُ عَبْدِ الرَّحْمَنِ بْنِ أَزْهَرَ رضي الله عنه)

File: `163.webp`

```text
A commander's tent at Ḥunayn with bandages. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 164. Report of ʿAbd al-Raḥmān ibn Yaʿmar al-Dīlī ؓ (حَدِيثُ عَبْدِ الرَّحْمَنِ بْنِ يَعْمَرَ الدِّيلِيِّ رضي الله عنه)

File: `164.webp`

```text
The plain of ʿArafa at sunset. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 165. Report of ʿUrwa ibn Muḍarris ؓ (حَدِيثُ عُرْوَةَ بْنِ مُضَرِّسٍ رضي الله عنه)

File: `165.webp`

```text
Muzdalifa at dawn, distant mountains beyond. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 166. Report of Surāqa ibn Mālik ؓ (حَدِيثُ سُرَاقَةَ بْنِ مَالِكٍ رضي الله عنه)

File: `166.webp`

```text
A horse's hooves sunk in desert sand, a dust trail behind. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 167. Report of Ibn Buḥayna ؓ (حَدِيثُ ابْنِ بُحَيْنَةَ رضي الله عنه)

File: `167.webp`

```text
Empty prayer rows after the afternoon prayer. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 168. Two reports of ʿUthmān ibn Abī al-ʿĀṣ ؓ (حَدِيثَا عُثْمَانَ بْنِ أَبِي الْعَاصِ رضي الله عنه)

File: `168.webp`

```text
The mountain town of Ṭāʾif with a small mosque. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 169. Report of Burayda al-Aslamī ؓ (حَدِيثُ بُرَيْدَةَ الْأَسْلَمِيِّ رضي الله عنه)

File: `169.webp`

```text
A household door with a sword hanging and a lamp kept lit. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 170. Reports of Abū Umāma al-Bāhilī ؓ (أَحَادِيثُ أَبِي أُمَامَةَ الْبَاهِلِيِّ رضي الله عنه)

File: `170.webp`

```text
The steps of the Damascus mosque at dusk. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 171. Report of Bilāl ibn al-Ḥārith al-Muzanī ؓ (حَدِيثُ بِلَالِ بْنِ حَارِثٍ الْمُزَنِيِّ رضي الله عنه)

File: `171.webp`

```text
A single lamp in a dark room. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 172. Report of Iyās ibn ʿAbd al-Muzanī ؓ (حَدِيثُ إِيَاسِ بْنِ عَبْدٍ الْمُزَنِيِّ رضي الله عنه)

File: `172.webp`

```text
A well with water flowing freely from it. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 173. Report of ʿAdī ibn Ḥātim al-Ṭāʾī ؓ (حَدِيثُ عَدِيِّ بْنِ حَاتِمِ الطَّائِيِّ رضي الله عنه)

File: `173.webp`

```text
A cooking pot over a fire in a Ṭayyiʾ tent. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 174. Reports of al-Nuʿmān ibn Bashīr ؓ (أَحَادِيثُ النُّعْمَانِ بْنِ بَشِيرٍ رضي الله عنه)

File: `174.webp`

```text
A protected pasture with a low boundary, flocks at its edge. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 175. Report of ʿAbd Allāh ibn Aqram al-Khuzāʿī ؓ (حَدِيثُ عَبْدِ اللَّهِ بْنِ أَقْرَمَ الْخُزَاعِيِّ رضي الله عنه)

File: `175.webp`

```text
The plain of Namira at noon. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 176. Reports of Sahl ibn Saʿd al-Sāʿidī ؓ (أَحَادِيثُ سَهْلِ بْنِ سَعْدٍ السَّاعِدِيِّ رضي الله عنه)

File: `176.webp`

```text
An iron ring on a cloth. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 177. Report of Qārib al-Thaqafī ؓ (حَدِيثُ قَارِبٍ الثَّقَفِيِّ رضي الله عنه)

File: `177.webp`

```text
A razor and shorn locks in a basin at Mina. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 178. Reports of Ibn Khanbash ؓ (أَحَادِيثُ ابْنِ خَنْبَشٍ رضي الله عنه)

File: `178.webp`

```text
The crescent of Ramaḍān above Mecca. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 179. Reports of Abū Hurayra ؓ (أَحَادِيثُ أَبِي هُرَيْرَةَ رضي الله عنه)

File: `179.webp`

```text
A small kitten curled in the folds of a cloak beside a bowl of milk. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 180. Chapter on Funerals (بَابُ الْجَنَائِزِ)

File: `180.webp`

```text
An empty bier with a white cloth. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 181. Chapter on Sales (بَابُ الْبُيُوعِ)

File: `181.webp`

```text
A market scale with goods. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 182. Miscellaneous Narrations of Abū Hurayra (جَامِعُ أَبِي هُرَيْرَةَ)

File: `182.webp`

```text
A finished building with a single brick missing in its corner. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 183. Chapter on Judicial Decisions (بَابٌ فِي الْأَقْضِيَةِ)

File: `183.webp`

```text
A judge's bench beside a well. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 184. Chapter on Jihad (بَابُ الْجِهَادِ)

File: `184.webp`

```text
A traveler's bag and a sword beside a door. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 185. General Chapter of Reports from Abū Hurayra (بَابٌ جَامِعٌ عَنْ أَبِي هُرَيْرَةَ)

File: `185.webp`

```text
The shaded bench of the Prophet's mosque with cushions. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 186. Hadiths of Anas ibn Mālik, may God be pleased with him (أَحَادِيثُ أَنَسِ بْنِ مَالِكٍ رضي الله عنه)

File: `186.webp`

```text
A water jug and a small basket of dates in a household. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 187. Hadiths of Jābir ibn ʿAbd Allāh al-Anṣārī, may God be pleased with him (أَحَادِيثُ جَابِرِ بْنِ عَبْدِ اللَّهِ الْأَنْصَارِيِّ رضي الله عنه)

File: `187.webp`

```text
A weary camel resting by a road at dusk. Setting: Mecca, Medina and the first Islamic century, with dark granite, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Meccan afternoon gold, deep shadow and pale gold highlights. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```


<a id="hadith-of-abu-al-yaman"></a>

## Ḥadīth of Abū al-Yamān

- Slug: `hadith-abi-al-yaman`
- Compiler: Abū al-Yamān al-Ḥakam ibn Nāfiʿ (d. 222 AH), Ḥimṣ
- Chapters: none (single-page reader). Hero only.

### Hero

Save as `public/images/hadith/covers/hadith-abi-al-yaman.webp` at 1400 x 788.

```text
A basalt-walled room in Ḥimṣ in early morning. Through an arched window on the right, the Orontes valley with orchards and a distant citadel mound. In the right foreground on a woven rug: a single slim fascicle tied with cord, a reed pen and inkwell, a small brass lamp and a folded Syrian cloth. Detailed oil painting with fine brushwork on softly aged canvas, warm lamp and window light against deep umber shadow. The left 40 percent of the frame falls into soft, nearly black shadow with no detail, leaving clean space for a title; every object and all of the light sit in the right 60 percent. No people or human figures, no writing, letters, calligraphy or inscriptions, no modern objects. Wide landscape composition, 16:9 aspect ratio.
```


<a id="musnad-ibn-abi-shayba"></a>

## Musnad Ibn Abī Shayba

- Slug: `musnad-ibn-abi-shayba`
- Compiler: Abū Bakr ibn Abī Shayba (d. 235 AH), Kufa
- Chapters: 281
- Light key: Kufan late-afternoon light and terracotta and burnt orange accents

### Hero

Save as `public/images/hadith/covers/musnad-ibn-abi-shayba.webp` at 1400 x 788.

```text
A scholar's study in Kufa in late afternoon. Through an arched window on the right, the Euphrates and palm groves under a burnt orange sky. In the right foreground: tall stacks of notebooks bound with cord, a reed pen and inkwell, a brass lamp, a clay water jug and a terracotta cloth on a reed mat. Detailed oil painting with fine brushwork on softly aged canvas, warm lamp and window light against deep umber shadow. The left 40 percent of the frame falls into soft, nearly black shadow with no detail, leaving clean space for a title; every object and all of the light sit in the right 60 percent. No people or human figures, no writing, letters, calligraphy or inscriptions, no modern objects. Wide landscape composition, 16:9 aspect ratio.
```

### Chapter plates

Save each as `public/images/hadith/chapter-covers/musnad-ibn-abi-shayba/NN.webp` at 880 x 1056.

#### 1. Abū Ayyūb Khālid b. Zayd (أَبُو أَيُّوبَ خَالِدُ بْنُ زَيْدٍ)

File: `01.webp`

```text
Massive city walls by the sea under evening light. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 2. The Musnad of Khuzayma b. Thābit (مُسْنَدُ خُزَيْمَةَ بْنِ ثَابِتٍ)

File: `02.webp`

```text
A horse tethered at a gate. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 3. What Abū al-Dardāʾ ؓ narrated from the Prophet ﷺ (مَا رَوَاهُ أَبُو الدَّرْدَاءِ رضي الله عنه عَنِ النَّبِيِّ صلى الله عليه وسلم)

File: `03.webp`

```text
A courtyard in Damascus with an olive tree. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 4. What Sahl b. Ḥunayf ؓ narrated from the Prophet ﷺ (مَا رَوَاهُ سَهْلُ بْنُ حُنَيْفٍ رضي الله عنه عَنِ النَّبِيِّ صلى الله عليه وسلم)

File: `04.webp`

```text
A stream with a cloak lying on a rock beside it. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 5. What Rāfiʿ b. Khadīj ؓ narrated from the Prophet ﷺ (مَا رَوَاهُ رَافِعُ بْنُ خَدِيجٍ رضي الله عنه، عَنِ النَّبِيِّ صلى الله عليه وسلم)

File: `05.webp`

```text
A plowed field near Medina, a plow at rest. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 6. What Sahl b. Saʿd al-Sāʿidī ؓ narrated from the Prophet ﷺ (مَا رَوَاهُ سَهْلُ بْنُ سَعْدٍ السَّاعِدِيُّ رضي الله عنه، عَنِ النَّبِيِّ صلى الله عليه وسلم)

File: `06.webp`

```text
A pulpit of tamarisk wood in a simple mosque. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 7. What Zayd b. Thābit ؓ narrated from the Prophet ﷺ (مَا رَوَاهُ زَيْدُ بْنُ ثَابِتٍ رضي الله عنه، عَنِ النَّبِيِّ صلى الله عليه وسلم)

File: `07.webp`

```text
Palm stalks, flat stones and pieces of parchment gathered on a table. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 8. What Usāma b. Zayd ؓ narrated from the Prophet ﷺ (مَا رَوَاهُ أُسَامَةُ بْنُ زَيْدٍ رضي الله عنه، عَنِ النَّبِيِّ صلى الله عليه وسلم)

File: `08.webp`

```text
A Syrian frontier road at dawn, a furled banner on a spear. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 9. What was narrated by ʿAbd Allāh ibn Masʿūd from the Prophet ﷺ (مَا رَوَاهُ عَبْدُ اللَّهِ بْنُ مَسْعُودٍ، عَنِ النَّبِيِّ صلى الله عليه وسلم)

File: `09.webp`

```text
A Kufan house with a wooden recitation stand and a lamp. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 10. What ʿAmmār b. Yāsir ؓ narrated from the Prophet ﷺ (مَا رَوَاهُ عَمَّارُ بْنُ يَاسِرٍ رضي الله عنه عَنِ النَّبِيِّ صلى الله عليه وسلم)

File: `10.webp`

```text
A bowl of milk diluted with water on the plain of Ṣiffīn. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 11. Reports of Salmān al-Fārisī ؓ (حَدِيثُ سَلْمَانَ الْفَارِسِيِّ رضي الله عنه)

File: `11.webp`

```text
Baskets woven of palm fronds beside a freshly dug trench. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 12. Reports of Khabbāb b. al-Aratt from the Messenger of God ﷺ (حَدِيثُ خَبَّابِ بْنِ الْأَرَتِّ، عَنْ رَسُولِ اللَّهِ صلى الله عليه وسلم)

File: `12.webp`

```text
A smith's forge with glowing coals. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 13. What Ṣuhayb ؓ narrated from the Prophet ﷺ (حَدِيثُ صُهَيْبٍ رضي الله عنه عَنِ النَّبِيِّ صلى الله عليه وسلم)

File: `13.webp`

```text
A buried purse beneath a doorway in Mecca. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 14. What al-Miqdād b. ʿAmr ؓ narrated from the Prophet ﷺ (حَدِيثُ الْمِقْدَادِ بْنِ عَمْرٍو رضي الله عنه، عَنِ النَّبِيِّ صلى الله عليه وسلم)

File: `14.webp`

```text
A horse standing near the wells of Badr. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 15. Reports of Kaʿb b. Mālik ؓ (حَدِيثُ كَعْبِ بْنِ مَالِكٍ رضي الله عنه)

File: `15.webp`

```text
A tent pitched alone on a mountain slope. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 16. Reports of Kaʿb b. ʿUjra from the Prophet ﷺ (حَدِيثُ كَعْبِ بْنِ عُجْرَةَ، عَنِ النَّبِيِّ صلى الله عليه وسلم)

File: `16.webp`

```text
A cooking pot at Ḥudaybiya. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 17. Reports of Zayd b. Arqam from the Prophet ﷺ (حَدِيثُ زَيْدِ بْنِ أَرْقَمَ، عَنِ النَّبِيِّ صلى الله عليه وسلم)

File: `17.webp`

```text
A boy's sandals near a doorway of a Kufan house. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 18. Reports of Nubayṭ b. Sharīṭ (حَدِيثُ نُبَيْطِ بْنِ شَرِيطٍ)

File: `18.webp`

```text
A red camel saddle on a kneeling camel at ʿArafa. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 19. Reports of al-Mukhāriq (حَدِيثُ الْمُخَارِقِ)

File: `19.webp`

```text
A fenced storeroom with a sword hanging on its wall. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 20. Reports of ʿAṭiyya al-Quraẓī (حَدِيثُ عَطِيَّةَ الْقُرَظِيِّ)

File: `20.webp`

```text
A fortress among date palms. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 21. Reports of Salama b. Nuʿaym (حَدِيثُ سَلَمَةَ بْنِ نُعَيْمٍ)

File: `21.webp`

```text
A single lamp burning in the dark. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 22. Reports of Yazīd b. Shajara (حَدِيثُ يَزِيدَ بْنِ شَجَرَةَ)

File: `22.webp`

```text
An army camp at dusk with banners. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 23. Reports of ʿĀmir b. Shahr (حَدِيثُ عَامِرِ بْنِ شَهْرٍ)

File: `23.webp`

```text
A royal hall in Aksum with a hanging curtain. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 24. Reports of al-Hirmās (حَدِيثُ الْهِرْمَاسِ)

File: `24.webp`

```text
A two-seat camel saddle at Mina. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 25. Reports of Abū Khubayb (حَدِيثُ أَبِي خُبَيْبٍ)

File: `25.webp`

```text
A road out of Medina at dawn. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 26. Reports of Ṭāriq (حَدِيثُ طَارِقٍ)

File: `26.webp`

```text
A row of worn sandals beside a battered shield. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 27. Reports of al-Ḥārith b. Mālik b. al-Barṣāʾ (حَدِيثُ الْحَارِثِ بْنِ مَالِكِ بْنِ الْبَرْصَاءِ)

File: `27.webp`

```text
The valley of Mecca in clear light. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 28. Reports of Muṭīʿ b. al-Aswad (حَدِيثُ مُطِيعِ بْنِ الْأَسْوَدِ)

File: `28.webp`

```text
Meccan lanes at dawn. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 29. Reports of ʿUrwa b. Muḍarris (حَدِيثُ عُرْوَةَ بْنِ مُضَرِّسٍ)

File: `29.webp`

```text
Muzdalifa at dawn. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 30. Reports of Yazīd b. Rukāna (حَدِيثُ يَزِيدَ بْنِ رُكَانَةَ)

File: `30.webp`

```text
A single folded document on a table. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 31. Reports of al-Ḍaḥḥāk b. Sufyān (حَدِيثُ الضَّحَّاكِ بْنِ سُفْيَانَ)

File: `31.webp`

```text
A herd of camels beside a woman's chest. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 32. Reports of the uncle of Ibn Abī ʿAmra (حَدِيثُ عَمِّ ابْنِ أَبِي عَمْرَةَ)

File: `32.webp`

```text
A newborn's cradle with a small silver bell. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 33. Reports of Nāfiʿ b. ʿUtba (حَدِيثُ نَافِعِ بْنِ عُتْبَةَ)

File: `33.webp`

```text
A view across mountains to distant kingdoms under clouds. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 34. Reports of Aws b. Ḥudhayfa (حَدِيثُ أَوْسِ بْنِ حُذَيْفَةَ)

File: `34.webp`

```text
A tent pitched in Medina for a visiting delegation. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 35. Reports of Murra al-Bahzī (حَدِيثُ مُرَّةَ الْبَهْزِيِّ)

File: `35.webp`

```text
A mountain fortress. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 36. Reports of Abū Saʿd al-Anṣārī (حَدِيثُ أَبِي سَعْدٍ الْأَنْصَارِيِّ)

File: `36.webp`

```text
A seed falling to earth. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 37. Reports of the uncle of Ḥasnāʾ (حَدِيثٌ عَمِّ حَسْنَاءَ)

File: `37.webp`

```text
A newborn's cradle beside a garden. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 38. Reports of Abū ʿAzza (حَدِيثُ أَبِي عَزَّةَ)

File: `38.webp`

```text
A traveler's road toward a distant land. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 39. Reports of ʿUbayd b. Khālid (حَدِيثُ عُبَيْدِ بْنِ خَالِدٍ)

File: `39.webp`

```text
Two cups, one turned upside down. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 40. Reports of Abū ʿUqba (حَدِيثُ أَبِي عُقْبَةَ)

File: `40.webp`

```text
The slope of Uḥud at noon. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 41. Reports of Ṣafwān al-Zuhrī (حَدِيثُ صَفْوَانَ الزُّهْرِيِّ)

File: `41.webp`

```text
Midday heat shimmering over a courtyard, a shaded colonnade beside it. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 42. Reports of Abū al-Ward (حَدِيثُ أَبِي الْوَرْدِ)

File: `42.webp`

```text
A dust trail on the horizon. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 43. Reports of ʿAbd Allāh b. Badr (حَدِيثُ عَبْدِ اللَّهِ بْنِ بَدْرٍ)

File: `43.webp`

```text
A broken votive lamp. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 44. Reports of the Prophet’s zakāt collector (حَدِيثُ مُصَدِّقِ النَّبِيِّ صلى الله عليه وسلم)

File: `44.webp`

```text
A tally stick beside a flock of sheep. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 45. Reports of the Bahzī man (حَدِيثُ الْبَهْزِيِّ)

File: `45.webp`

```text
A wild ass lying in a valley. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 46. Reports of Abū al-Jaʿd al-Ḍamrī (حَدِيثُ أَبِي الْجَعْدِ الضَّمْرِيِّ)

File: `46.webp`

```text
An empty gap in a row of sandals outside a mosque. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 47. Reports of Bilāl b. al-Ḥārith (حَدِيثُ بِلَالِ بْنِ الْحَارِثِ)

File: `47.webp`

```text
A gift set at a relative's door. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 48. Reports of Nuʿaym al-Naḥḥām (حَدِيثُ نُعَيْمٍ النَّحَّامِ)

File: `48.webp`

```text
A wool cloak on a bed on a cold dawn, frost on the window. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 49. Reports of Numayr al-Khuzāʿī (حَدِيثُ نُمَيْرٍ الْخُزَاعِيِّ)

File: `49.webp`

```text
A prayer mat with a single shaft of light. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 50. Reports of Nuʿaym b. Hammār (نُعَيْمُ بْنُ هَمَّارٍ)

File: `50.webp`

```text
The morning sun climbing over a courtyard. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 51. Reports of ʿUbayd Allāh b. Muʿayya (عُبَيْدُ اللَّهِ بْنُ مُعَيَّةَ)

File: `51.webp`

```text
The walls of Ṭāʾif on its mountain. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 52. Reports of al-Numayrī (النُّمَيْرِيُّ)

File: `52.webp`

```text
A doorway in Basra. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 53. Reports of Ibn ʿĀbis al-Juhanī (ابْنُ عَابِسٍ الْجُهَنِيُّ)

File: `53.webp`

```text
A lamp against the darkness at dawn. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 54. Reports of Dhū al-Jawshan (ذُو الْجَوْشَنِ)

File: `54.webp`

```text
A young colt tethered. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 55. Reports of the uncle of Khubayb (حَدِيثٌ عَمِّ خُبَيْبٍ)

File: `55.webp`

```text
Water drops on a stone after a bath. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 56. Reports of ʿAmr b. al-Aḥwaṣ (حَدِيثُ عَمْرِو بْنِ الْأَحْوَصِ)

File: `56.webp`

```text
Mina on the Day of Sacrifice. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 57. Reports of Ṭalḥa b. Muʿāwiya (حَدِيثُ طَلْحَةَ بْنِ مُعَاوِيَةَ)

File: `57.webp`

```text
A sword beside a mother's cushion. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 58. Reports of ʿUtba b. Ghazwān (حَدِيثُ عُتْبَةَ بْنِ غَزْوَانَ)

File: `58.webp`

```text
Tree leaves gathered in a bowl, the new reed huts of Basra beyond. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 59. Reports of ʿAbbād b. Shuraḥbīl (حَدِيثُ عَبَّادِ بْنِ شُرَحْبِيلَ)

File: `59.webp`

```text
Ears of grain in an orchard. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 60. Reports of Anas b. Mālik of Banū ʿAbd al-Ashhal (حَدِيثُ أَنَسِ بْنِ مَالِكٍ مِنْ بَنِي عَبْدِ الْأَشْهَلِ)

File: `60.webp`

```text
A meal laid out at a camp. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 61. Reports of ʿItbān b. Mālik (حَدِيثُ عِتْبَانَ بْنِ مَالِكٍ)

File: `61.webp`

```text
Floodwater flowing through a valley between a house and a mosque. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 62. Reports of Surraq (حَدِيثُ سُرَّقٍ)

File: `62.webp`

```text
Two cushions facing a judge's seat. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 63. Reports of Suwayd b. Ḥanẓala (سُوَيْدُ بْنُ حَنْظَلَةَ)

File: `63.webp`

```text
A loosened rope on a road. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 64. Reports of Mihrān, the Prophet’s freedman (حَدِيثُ مِهْرَانَ مَوْلَى رَسُولِ اللَّهِ صلى الله عليه وسلم)

File: `64.webp`

```text
A charity basket refused at a doorway. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 65. Reports of ʿAbd Allāh b. Abī al-Jadʿāʾ (عَبْدُ اللَّهِ بْنُ أَبِي الْجَدْعَاءِ)

File: `65.webp`

```text
Tents of Banū Tamīm stretching across the desert. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 66. Reports of Abū Mujība al-Bāhilī (أَبُو مُجِيبَةَ الْبَاهِلِيُّ)

File: `66.webp`

```text
A traveler's staff and a bowl of food. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 67. Reports of Daylam al-Ḥimyarī (دَيْلَمُ الْحِمْيَرِيُّ)

File: `67.webp`

```text
A jar of wheat drink in a cold mountain land. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 68. Reports of ʿAbd Allāh b. Juhaym (عَبْدُ اللَّهِ بْنُ جُهَيْمٍ)

File: `68.webp`

```text
A prayer mat with a path crossing in front of it. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 69. Reports of al-Ḥārith b. Aws (الْحَارِثُ بْنُ أَوْسٍ)

File: `69.webp`

```text
The courtyard of the sanctuary at dusk. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 70. Reports of Abū ʿAbd al-Raḥmān al-Fihrī (أَبُو عَبْدِ الرَّحْمَنِ الْفِهْرِيُّ)

File: `70.webp`

```text
The shade of acacia trees on a scorching day. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 71. Reports of the grandfather of Abū ʿAbd Allāh al-Ḥunaynī (الْحُنَيْنِيُّ جَدُّ أَبِي عَبْدِ اللَّهِ الْحُنَيْنِيِّ)

File: `71.webp`

```text
A small closed box of keepsakes. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 72. Reports of Qudāma (قُدَامَةُ)

File: `72.webp`

```text
A reddish she-camel at the pillar of stoning. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 73. Reports of Abū Ghādiya (أَبُو غَادِيَةَ)

File: `73.webp`

```text
The ravine of ʿAqaba at Mina. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 74. Reports of Abū Salām (أَبُو سَلَامٍ)

File: `74.webp`

```text
A morning sky and an evening sky side by side. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 75. Reports of Shakal b. Ḥumayd (شَكَلُ بْنُ حُمَيْدٍ)

File: `75.webp`

```text
A lamp guarding a doorway. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 76. Reports of Abū Muwayhiba (أَبُو مُوَيْهِبَةَ)

File: `76.webp`

```text
The graves of al-Baqīʿ at night. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 77. Reports of ʿAbd Allāh b. Rawāḥa (عَبْدُ اللَّهِ بْنُ رَوَاحَةَ)

File: `77.webp`

```text
A doorway at night with a lamp lit and curtains drawn. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 78. Reports of Abū ʿAqīl (أَبُو عَقِيلٍ)

File: `78.webp`

```text
Two ṣāʿ of dates beside a coil of rope. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 79. Reports of al-Ḥakam b. Sufyān al-Thaqafī (الْحَكَمُ بْنُ سُفْيَانَ الثَّقَفِيُّ)

File: `79.webp`

```text
Sprinkled water on a folded garment. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 80. Reports of the grandfather of ʿAdī b. Ḥātim (جَدُّ عَدِيِّ بْنِ حَاتِمٍ)

File: `80.webp`

```text
A village at dusk under heavy clouds. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 81. Reports of Bishr b. ʿĀṣim (بِشْرُ بْنُ عَاصِمٍ)

File: `81.webp`

```text
A rolled letter of appointment on a governor's seat. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 82. Reports of Rāfiʿ b. ʿAmr (حَدِيثُ رَافِعِ بْنِ عَمْرٍو)

File: `82.webp`

```text
A child's small sandals on the pilgrim road. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 83. Reports of the grandfather of a man of Banū Tamīm (جَدُّ رَجُلٍ مِنْ بَنِي تَمِيمٍ)

File: `83.webp`

```text
Raw silver ore from a mine on a cloth. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 84. Reports of Abū Mālik (أَبُو مَالِكٍ)

File: `84.webp`

```text
Two old cushions. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 85. Reports of ʿAṭiyya al-Saʿdī (عَطِيَّةُ السَّعْدِيُّ)

File: `85.webp`

```text
A path that turns aside from a thorn bush. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 86. Reports of Abū Arwā (أَبُو أَرْوَى)

File: `86.webp`

```text
The trees of Dhū al-Ḥulayfa in late afternoon. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 87. Reports of Ḥujayr b. Bayān (حُجَيْرُ بْنُ بَيَانٍ)

File: `87.webp`

```text
A coiled serpent beside a locked chest. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 88. Reports of Munqidh b. ʿAmr (مُنْقِذُ بْنُ عَمْرٍو)

File: `88.webp`

```text
A market stall with three pebbles set out on the counter. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 89. Reports of Yaʿlā b. Siyāba (يَعْلَى بْنُ سِيَابَةَ)

File: `89.webp`

```text
A fresh palm stalk split and planted on a grave. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 90. Reports of Miḥjan b. al-Adraʿ (مِحْجَنُ بْنُ الْأَدْرَعِ)

File: `90.webp`

```text
A mosque door ajar. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 91. Reports of Ibn al-Adraʿ al-Aslamī (ابْنُ الْأَدْرَعِ الْأَسْلَمِيُّ)

File: `91.webp`

```text
A bow, arrows and bare footprints in sand. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 92. Reports of al-Adraʿ al-Aslamī (الْأَدْرَعُ الْأَسْلَمِيُّ)

File: `92.webp`

```text
A night watch fire beside a tent. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 93. Reports of Wahbān b. Ṣayfī (وَهْبَانُ بْنُ صَيْفِيٍّ)

File: `93.webp`

```text
A wooden sword hanging on a wall. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 94. Reports of Buhaysa, from her father (بُهَيْسَةُ عَنْ أَبِيهَا)

File: `94.webp`

```text
Water, salt and fire set out on a stone. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 95. Reports of ʿAbd Allāh b. al-Ḥārith (عَبْدُ اللَّهِ بْنُ الْحَارِثِ)

File: `95.webp`

```text
An outdoor screen of palm fronds in the desert. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 96. Reports of Sinān b. Sunna (سِنَانُ بْنُ سَنَّةَ)

File: `96.webp`

```text
The plain of ʿArafa with a camel. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 97. Reports of Abū Zuhayr (أَبُو زُهَيْرٍ)

File: `97.webp`

```text
The hills near Ṭāʾif. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 98. Reports of Aḥmar, freedman of the Messenger of God (أَحْمَرُ مَوْلَى رَسُولِ اللَّهِ صلى الله عليه وسلم)

File: `98.webp`

```text
A prayer mat with long shadows. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 99. Reports of Jahjāh al-Ghifārī (جَهْجَاهٌ الْغِفَارِيُّ)

File: `99.webp`

```text
Seven milk bowls on a mat, one drained. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 100. Reports of Abū al-ʿUsharāʾ, from his father (أَبُو الْعُشَرَاءِ عَنْ أَبِيهِ)

File: `100.webp`

```text
A knife and rope beside a well. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 101. Reports of Qays b. Ṭikhfa (قَيْسُ بْنُ طِخْفَةَ)

File: `101.webp`

```text
Guests' sleeping mats on a mosque bench. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 102. Reports of an unnamed man, from his father (رَجُلٌ عَنْ أَبِيهِ)

File: `102.webp`

```text
Tents of a small detachment. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 103. Reports of al-Fujayʿ al-ʿĀmirī (الْفُجَيْعُ الْعَامِرِيُّ)

File: `103.webp`

```text
A desert cooking fire with scant food. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 104. Reports of ʿAbd Allāh b. Aqram al-Khuzāʿī (عَبْدُ اللَّهِ بْنُ أَقْرَمَ الْخُزَاعِيُّ)

File: `104.webp`

```text
The plain of Namira with a halted caravan. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 105. Reports of Asmāʾ b. Ḥāritha (أَسْمَاءُ بْنُ حَارِثَةَ)

File: `105.webp`

```text
The lanes of Medina on the morning of ʿĀshūrāʾ. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 106. Reports of ʿAbd al-Raḥmān b. ʿAlqama (عَبْدُ الرَّحْمَنِ بْنُ عَلْقَمَةَ)

File: `106.webp`

```text
A gift tray of fruit. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 107. Reports of the grandfather of Ismāʿīl b. Ibrāhīm (جَدُّ إِسْمَاعِيلَ بْنِ إِبْرَاهِيمَ)

File: `107.webp`

```text
Stacked purses of coins. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 108. Reports of Kaʿb b. Murra (كَعْبُ بْنُ مُرَّةَ)

File: `108.webp`

```text
A road to Syria. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 109. Reports of Suhayl b. Ḥanẓala al-Anṣārī (حَدِيثُ سُهَيْلِ بْنِ حَنْظَلَةَ الْأَنْصَارِيِّ)

File: `109.webp`

```text
A prayer mat close to a column. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 110. Reports of Abū Manṣūr (حَدِيثُ أَبِي مَنْصُورٍ)

File: `110.webp`

```text
A hearth fire being calmed with water. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 111. Reports of Ḥassān b. Thābit (حَدِيثُ حَسَّانَ بْنِ ثَابِتٍ)

File: `111.webp`

```text
A pulpit set in a mosque for a poet. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 112. Reports of the grandfather of ʿAbd al-Raḥmān (حَدِيثُ جَدِّ عَبْدِ الرَّحْمَنِ)

File: `112.webp`

```text
A gold nose-piece on a cloth. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 113. Reports of Saʿd b. al-Aṭwal (سَعْدُ بْنُ الْأَطْوَلِ)

File: `113.webp`

```text
A purse of three hundred dirhams beside a debt ledger. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 114. Reports of Abū Rifāʿa (أَبُو رِفَاعَةَ)

File: `114.webp`

```text
A chair with iron legs in a courtyard. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 115. Reports of Ṣakhr b. al-ʿAyla (صَخْرُ بْنُ الْعَيْلَةِ)

File: `115.webp`

```text
A tent of a returned captive. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 116. Reports of Abū Salama (أَبُو سَلَمَةَ)

File: `116.webp`

```text
An empty bowl beside a bowl filled anew. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 117. Reports of Abū Burda b. Qays (أَبُو بُرْدَةَ بْنُ قَيْسٍ)

File: `117.webp`

```text
Spears in a stand beside a sickroom. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 118. Reports of Sālim b. ʿUbayd (سَالِمُ بْنُ عُبَيْدٍ)

File: `118.webp`

```text
A traveling army camp. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 119. Reports of Wahb b. Ḥudhayfa (وَهْبُ بْنُ حُذَيْفَةَ)

File: `119.webp`

```text
A cushion kept in its place in a gathering. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 120. Reports of al-Ḥakam b. ʿAmr al-Ghifārī (الْحَكَمُ بْنُ عَمْرٍو الْغِفَارِيُّ)

File: `120.webp`

```text
A distant road to Khurāsān through mountains. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 121. Reports of Salama b. Ṣakhr al-Bayāḍī (سَلَمَةُ بْنُ صَخْرٍ الْبَيَاضِيُّ)

File: `121.webp`

```text
Sixty portions of dates on a mat. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 122. Reports of Abū ʿUthmān al-Nahdī (أَبُو عُثْمَانَ النَّهْدِيُّ)

File: `122.webp`

```text
An old man's staff in a Kufan house. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 123. Reports of al-Qaʿqāʿ, from Abū Ḥadrad al-Aslamī (الْقَعْقَاعُ عَنْ أَبِي حَدْرَدٍ الْأَسْلَمِيِّ)

File: `123.webp`

```text
Targets and arrows in the sand. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 124. Reports of the father of the grandmother of Abū Sufyān b. Ḥuwayṭib (وَالِدُ جَدَّةِ أَبِي سُفْيَانَ بْنِ حُوَيْطِبٍ)

File: `124.webp`

```text
A Meccan courtyard. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 125. Reports of Khārija b. al-Ṣalt (خَارِجَةُ بْنُ الصَّلْتِ)

File: `125.webp`

```text
Iron chains loosened on a floor. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 126. Reports of Muḥammad b. Ṣafwān (مُحَمَّدُ بْنُ صَفْوَانَ)

File: `126.webp`

```text
Two hares hanging from a cord. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 127. Reports of Thaʿlaba b. Zahdam (ثَعْلَبَةُ بْنُ زَهْدَمٍ)

File: `127.webp`

```text
Two bowls set at different heights. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 128. Reports of Ḥibbān b. Buḥḥ al-Ṣudāʾī (حِبَّانُ بْنُ بُحٍّ الصُّدَائِيُّ)

File: `128.webp`

```text
A Yemeni highland town. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 129. Reports of Rushayd b. Mālik (رُشَيْدُ بْنُ مَالِكٍ)

File: `129.webp`

```text
A tray of dates. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 130. Reports of Abū Shaykh (حَدِيثُ أَبِي شَيْخٍ)

File: `130.webp`

```text
Milk bowls set aside, declined. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 131. Reports of Abū Fāṭima (أَبُو فَاطِمَةَ)

File: `131.webp`

```text
A well-worn prayer mat. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 132. Reports of Iyās b. Sahl, from his father (إِيَاسُ بْنُ سَهْلٍ عَنْ أَبِيهِ)

File: `132.webp`

```text
A shaded portico where a clan gathers. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 133. Reports of Nuqāda al-Asadī (نُقَادَةُ الْأَسَدِيُّ)

File: `133.webp`

```text
A she-camel beside a tent. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 134. Reports of Abū ʿUbayd (أَبُو عُبَيْدٍ)

File: `134.webp`

```text
A cooking pot with forelegs of meat. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 135. Reports of ʿAbd al-Raḥmān b. Abī ʿAqīl (عَبْدُ الرَّحْمَنِ بْنُ أَبِي عَقِيلٍ)

File: `135.webp`

```text
Mounts halted at a door. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 136. Reports of Majzaʾa b. Zāhir (مَجْزَأَةُ بْنُ زَاهِرٍ)

File: `136.webp`

```text
Cooking pots overturned, broth spilling. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 137. Reports of Salama and Yaʿlā, sons of Umayya (سَلَمَةُ، وَيَعْلَى ابْنا أُمَيَّةَ)

File: `137.webp`

```text
The road to Tabūk. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 138. Reports of the husband of Abū Lahab’s daughter (زَوْجُ ابْنَةِ أَبِي لَهَبٍ)

File: `138.webp`

```text
A wedding frame drum with lamps. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 139. Reports of Ibn Sīlān (ابْنُ سِيلَانَ)

File: `139.webp`

```text
A storm gathering. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 140. Reports of Nuʿaym b. Hazzāl (نُعَيْمُ بْنُ هَزَّالٍ)

File: `140.webp`

```text
A stone wall at the edge of a field at dusk. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 141. Reports of the uncle of Jabr b. ʿAtīk (عَمُّ جَبْرِ بْنِ عَتِيكٍ)

File: `141.webp`

```text
A house of mourning with a covered lamp. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 142. Reports of al-Ḍaḥḥāk b. Qays (الضَّحَّاكُ بْنُ قَيْسٍ)

File: `142.webp`

```text
A sealed letter on a governor's table. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 143. Reports of Ṭāriq b. Suwayd (طَارِقُ بْنُ سُوَيْدٍ)

File: `143.webp`

```text
Grapes beside a sealed wine jar pushed aside. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 144. Reports of Ṭufayl b. Sakhbara (طُفَيْلُ بْنُ سَخْبَرَةَ)

File: `144.webp`

```text
A dreamlike night landscape in mist. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 145. Reports of ʿUqba b. Mālik (عُقْبَةُ بْنُ مَالِكٍ)

File: `145.webp`

```text
A Basran lane. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 146. Reports of Thābit b. Rufayʿ (ثَابِتُ بْنُ رُفَيْعٍ)

File: `146.webp`

```text
A heap of spoils. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 147. Reports of Maʿmar b. ʿAbd Allāh b. Naḍla (مَعْمَرُ بْنُ عَبْدِ اللَّهِ بْنِ نَضْلَةَ)

File: `147.webp`

```text
A storeroom full of hoarded grain. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 148. Reports of a man of Banū Murra (رَجُلٌ مِنْ بَنِي مُرَّةَ)

File: `148.webp`

```text
Donkeys in a pen. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 149. Reports of al-Ḥārith (الْحَارِثُ)

File: `149.webp`

```text
A she-camel with a notched ear. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 150. Reports of al-Ḥārith b. Ḥassān (الْحَارِثُ بْنُ حَسَّانَ)

File: `150.webp`

```text
A sword resting before a pulpit. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 151. Reports of the uncle of Umm ʿAmr, daughter of ʿAbs (عَمُّ أُمِّ عَمْرٍو ابْنَةِ عَبْسٍ)

File: `151.webp`

```text
A she-camel kneeling heavily on a road at night. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 152. Reports of Zayd b. Ḥāritha (زَيْدُ بْنُ حَارِثَةَ)

File: `152.webp`

```text
An ewer on a mountainside at dawn. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 153. Reports of ʿUbayd, freedman of the Prophet (عُبَيْدٌ مَوْلَى النَّبِيِّ صلى الله عليه وسلم)

File: `153.webp`

```text
Two bowls. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 154. Reports of ʿUthmān b. Ḥunayf (عُثْمَانُ بْنُ حُنَيْفٍ)

File: `154.webp`

```text
A surveyor's rope stretched across the fields of Iraq. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 155. Reports of ʿIyāḍ al-Ashʿarī (عِيَاضٌ الْأَشْعَرِيُّ)

File: `155.webp`

```text
Terraced fields in the mountains of Yemen. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 156. Reports of Saʿīd b. Ḥurayth (سَعِيدُ بْنُ حُرَيْثٍ)

File: `156.webp`

```text
A sold house with coins on its step. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 157. Reports of Abū Baṣra al-Ghifārī (أَبُو بَصْرَةَ الْغِفَارِيُّ)

File: `157.webp`

```text
A road toward the oasis of Khaybar. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 158. Reports of the grandfather of an Anṣārī man (جَدُّ رَجُلٍ مِنَ الْأَنْصَارِ)

File: `158.webp`

```text
A prayer mat with a single beam of light. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 159. Reports of Mālik b. Rabīʿa (مَالِكُ بْنُ رَبِيعَةَ)

File: `159.webp`

```text
A razor and basin. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 160. Reports of al-Muhājir b. Qunfudh (الْمُهَاجِرُ بْنُ قُنْفُذٍ)

File: `160.webp`

```text
An ewer beside a wall. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 161. Reports of Dukayn b. Saʿīd al-Muzanī (دُكَيْنُ بْنُ سَعِيدٍ الْمُزَنِيُّ)

File: `161.webp`

```text
A storeroom of dates. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 162. Reports of Zinbāʿ (زِنْبَاعٌ)

File: `162.webp`

```text
An opened shackle. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 163. Reports of ʿAmr b. Ghaylān al-Thaqafī (عَمْرُو بْنُ غَيْلَانَ الثَّقَفِيُّ)

File: `163.webp`

```text
A modest house with few belongings. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 164. Reports of ʿAttāb b. Shumayr (عَتَّابُ بْنُ شُمَيْرٍ)

File: `164.webp`

```text
An old father's cushion with brothers' sandals beside it. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 165. Reports of ʿAmr b. Murra (عَمْرُو بْنُ مُرَّةَ)

File: `165.webp`

```text
A governor's door shut, a petitioner's staff outside. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 166. Reports of Qabīṣa b. Mukhāriq and Zuhayr b. ʿAmr (قَبِيصَةُ بْنُ مُخَارِقٍ، وَزُهَيْرُ بْنُ عَمْرٍو)

File: `166.webp`

```text
A mountaintop at dawn. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 167. Reports of ʿAbd Allāh b. ʿAdī (عَبْدُ اللَّهِ بْنُ عَدِيٍّ)

File: `167.webp`

```text
Mecca seen from a market hill. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 168. Reports of Sufyān b. ʿAbd Allāh (سُفْيَانُ بْنُ عَبْدِ اللَّهِ)

File: `168.webp`

```text
A straight road across the desert. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 169. Reports of al-Minhāl (الْمِنْهَالُ)

File: `169.webp`

```text
The full moon over three nights. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 170. Reports of Rabāḥ b. al-Rabīʿ (رِيَاحُ بْنُ الرَّبِيعِ)

File: `170.webp`

```text
The edge of a battlefield with a dropped veil. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 171. Reports of the grandfather of ʿAbd Allāh b. al-Sāʾib (جَدُّ عَبْدِ اللَّهِ بْنِ السَّائِبِ)

File: `171.webp`

```text
A staff taken in jest. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 172. Reports of al-Khashkhāsh al-ʿAnbarī (الْخَشْخَاشُ الْعَنْبَرِيُّ)

File: `172.webp`

```text
A father's and a son's sandals. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 173. Reports of al-Ḥārith b. Hishām (الْحَارِثُ بْنُ هِشَامٍ)

File: `173.webp`

```text
A bridal chamber. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 174. Reports of Mālik b. al-Tayyihān (مَالِكُ بْنُ التَّيِّهَانِ)

File: `174.webp`

```text
A grove of Medina. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 175. Reports of ʿUbayd Allāh al-Qurashī (عُبَيْدُ اللَّهِ الْقُرَشِيُّ)

File: `175.webp`

```text
A water cup at sunset. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 176. Reports of Rabīʿa b. Mālik (رَبِيعَةُ بْنُ مَالِكٍ)

File: `176.webp`

```text
An ewer beside a doorway at night. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 177. Reports of ʿAbd Allāh b. Jubayr al-Khuzāʿī (عَبْدُ اللَّهِ بْنُ جُبَيْرٍ الْخُزَاعِيُّ)

File: `177.webp`

```text
A cloth shade over a road. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 178. Reports of Yūsuf b. ʿAbd Allāh b. Salām (يُوسُفُ بْنُ عَبْدِ اللَّهِ بْنِ سَلَامٍ)

File: `178.webp`

```text
A child's cap and dates. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 179. Reports of Muḥammad b. ʿAbd Allāh b. Salām (مُحَمَّدُ بْنُ عَبْدِ اللَّهِ بْنِ سَلَامٍ)

File: `179.webp`

```text
The spring at Qubāʾ with water jars. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 180. Reports of Kulthūm (كُلْثُومٌ)

File: `180.webp`

```text
A neighbor's doorway with a lamp. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 181. Reports of ʿAbd Allāh b. Hilāl (عَبْدُ اللَّهِ بْنُ هِلَالٍ)

File: `181.webp`

```text
A young she-goat. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 182. Reports of ʿAbd al-Raḥmān b. al-Azhar (عَبْدُ الرَّحْمَنِ بْنُ الْأَزْهَرِ)

File: `182.webp`

```text
Meccan lanes with tents. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 183. Reports of Qays b. al-Ḥārith al-Asadī (قَيْسُ بْنُ الْحَارِثِ الْأَسَدِّيُّ)

File: `183.webp`

```text
Four bridal veils on a bench. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 184. Reports of Shaddād (شَدَّادٌ)

File: `184.webp`

```text
A child's small sandals beside a prayer mat. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 185. Reports of al-Firāsī (الْفِرَاسِيُّ)

File: `185.webp`

```text
A beggar's bowl at a righteous man's door. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 186. Reports of Abū Baṣra al-Ghifārī (أَبُو بَصْرَةَ الْغِفَارِيُّ)

File: `186.webp`

```text
A desert valley at the afternoon prayer. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 187. Reports of Ābī al-Laḥm (آبِي اللَّحْمِ)

File: `187.webp`

```text
The black lava stones of Aḥjār al-Zayt near Medina. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 188. Reports of Suhayl b. al-Bayḍāʾ (سَهْلُ ابْنُ بَيْضَاءَ)

File: `188.webp`

```text
A two-seat camel saddle. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 189. Reports of Muḥayyiṣa (مُحَيِّصَةُ)

File: `189.webp`

```text
Cupping vessels beside a camel's fodder. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 190. Reports of al-Saʿdī (السَّعْدِيُّ)

File: `190.webp`

```text
Rock-cut tombs of al-Ḥijr at noon. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 191. Reports of al-Aqraʿ b. Ḥābis (الْأَقْرَعُ بْنُ حَابِسٍ)

File: `191.webp`

```text
A row of chambers with closed doors. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 192. Reports of ʿUrwa al-Bāriqī (عُرْوَةُ الْبَارِقِيُّ، وَهُوَ أَوَّلُ مُسْنِدٍ الْحَدِيثَيْنِ وَالثَّلَاثَةَ)

File: `192.webp`

```text
Two sheep and a gold coin. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 193. Reports of Yazīd b. Thābit (يَزِيدُ بْنُ ثَابِتٍ)

File: `193.webp`

```text
A new grave at al-Baqīʿ. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 194. Reports of Salama b. Qays (سَلَمَةُ بْنُ قَيْسٍ)

File: `194.webp`

```text
Four small lamps. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 195. Reports of Muḥammad b. Ṣayfī (مُحَمَّدُ بْنُ صَيْفِيٍّ)

File: `195.webp`

```text
Cups turned over on a fasting day. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 196. Reports of Farwa b. Musayk (فَرْوَةُ بْنُ مُسَيْكٍ)

File: `196.webp`

```text
The dam of Maʾrib. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 197. Reports of ʿUthmān b. Ṭalḥa (عُثْمَانُ بْنُ طَلْحَةَ)

File: `197.webp`

```text
An iron key on a cord. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 198. Reports of The report of the man unable to walk (حَدِيثُ الْمُقْعَدِ)

File: `198.webp`

```text
A crutch on the road to Tabūk. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 199. Reports of ʿAmmār b. Mudrik b. ʿUmāra (عَمَّارُ بْنُ مُدْرِكِ بْنِ عُمَارَةَ)

File: `199.webp`

```text
Mecca's mountains with tents at dawn. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 200. Reports of Report of an Anṣārī man (حَدِيثُ الْأَنْصَارِيِّ)

File: `200.webp`

```text
A desert scene with a low wall. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 201. Reports of Abū al-Ḥamrāʾ (حَدِيثُ أَبِي الْحَمْرَاءِ)

File: `201.webp`

```text
A door of a house in Medina at dawn with a lamp. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 202. Reports of Abū Ḥabba al-Badrī (حَدِيثُ أَبِي حَبَّةَ الْبَدْرِيِّ)

File: `202.webp`

```text
A codex on a stand. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 203. Reports of Saʿd, a Companion of the Prophet (حَدِيثُ سَعْدٍ، رَجُلٌ مِنْ أَصْحَابِ النَّبِيِّ صلى الله عليه وسلم)

File: `203.webp`

```text
Three generations of sandals by a door. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 204. Reports of Muʿayqīb (حَدِيثُ مُعَيْقِيبٍ)

File: `204.webp`

```text
Pebbles on a mosque floor smoothed once. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 205. Reports of Ṣafwān b. ʿAbd al-Raḥmān (حَدِيثُ صَفْوَانَ بْنِ عَبْدِ الرَّحْمَنِ)

File: `205.webp`

```text
A tall wooden door raised above the ground on a stone base, morning light. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 206. Reports of Abū ʿAbd al-Raḥmān al-Juhanī (أَبُو عَبْدِ الرَّحْمَنِ الْجُهَنِيُّ)

File: `206.webp`

```text
The fortress of Khaybar on its rocky height. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 207. Reports of ʿAbd al-Raḥmān b. Yaʿmur (عَبْدُ الرَّحْمَنِ بْنُ يَعْمَرَ)

File: `207.webp`

```text
The plain of ʿArafa. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 208. Reports of Abū Rayḥāna (حَدِيثُ أَبِي رَيْحَانَةَ)

File: `208.webp`

```text
A sentry's fire on a hill on a cold night. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 209. Reports of Ruwayfiʿ b. Thābit (رُوَيْفِعُ بْنُ ثَابِتٍ)

File: `209.webp`

```text
A town on an island by the sea. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 210. Reports of ʿAbd al-Raḥmān b. Ḥasana (حَدِيثُ عَبْدِ الرَّحْمَنِ ابْنِ حَسَنَةَ)

File: `210.webp`

```text
Cooking pots over desert fires, a lizard on a rock. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 211. Reports of Ṣuḥār (حَدِيثُ صُحَارٍ)

File: `211.webp`

```text
A sinkhole in the desert. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 212. Reports of Nāfiʿ b. ʿAbd al-Ḥārith (نَافِعُ بْنُ عَبْدِ الْحَارِثِ)

File: `212.webp`

```text
A well-saddled riding camel. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 213. Reports of Khuraym b. Fātik (خُرَيْمُ بْنُ فَاتِكٍ رضي الله عنه عَنِ النَّبِيِّ صلى الله عليه وسلم)

File: `213.webp`

```text
Four lamps at different brightness. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 214. Reports of Maʿqil b. Sinān al-Ashjaʿī (مَا رَوَاهُ مَعْقِلُ بْنُ سِنَانٍ الْأَشْجَعِيُّ عَنِ النَّبِيِّ صلى الله عليه وسلم)

File: `214.webp`

```text
A widow's chest with a dowry purse. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 215. Reports of ʿAmr b. Taghlib (مَا رَوَاهُ عَمْرُو بْنُ تَغْلِبَ رضي الله عنه عَنِ النَّبِيِّ صلى الله عليه وسلم)

File: `215.webp`

```text
Goods divided, some left aside. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 216. Reports of Wābiṣa b. Maʿbad (مَا رَوَاهُ وَابِصَةُ بْنُ مَعْبَدٍ رضي الله عنه عَنِ النَّبِيِّ صلى الله عليه وسلم)

File: `216.webp`

```text
The Euphrates at al-Raqqa. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 217. Reports of ʿAmr b. ʿAbasa (مَا رَوَاهُ عَمْرُو بْنُ عَبَسَةَ رضي الله عنه عَنِ النَّبِيِّ صلى الله عليه وسلم)

File: `217.webp`

```text
A rocky valley at Mecca with a lone hut. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 218. Reports of Salama b. al-Muḥabbiq (سَلَمَةُ بْنُ الْمُحَبِّقِ)

File: `218.webp`

```text
A household door. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 219. Reports of Nubaysha, freedman of the Prophet (حَدِيثُ نُبَيْشَةَ مَوْلَى النَّبِيِّ صلى الله عليه وسلم)

File: `219.webp`

```text
A sheep tethered in spring pasture. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 220. Reports of Jaʿda, a man who saw the Prophet (جَعْدَةُ رَجُلٌ رَأَى النَّبِيَّ صلى الله عليه وسلم)

File: `220.webp`

```text
A dish piled with food. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 221. Reports of Muḥammad b. ʿAbd al-Raḥmān b. Saʿd b. Zurāra (مُحَمَّدُ بْنُ عَبْدِ الرَّحْمَنِ بْنِ سَعْدِ بْنِ زُرَارَةَ)

File: `221.webp`

```text
A cautery iron heated in coals. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 222. Reports of Ḥamza al-Aslamī (حَمْزَةُ الْأَسْلَمِيُّ)

File: `222.webp`

```text
Mina with cooking fires. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 223. Reports of Paternal uncles of Abū ʿUmayr b. Anas (عُمُومَةُ أَبِي عُمَيْرِ بْنِ أَنَسٍ)

File: `223.webp`

```text
A thin crescent at dusk over the desert. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 224. Reports of Maʿqil b. Abī Maʿqil (مَعْقِلُ بْنُ أَبِي مَعْقِلٍ)

File: `224.webp`

```text
A camel prepared for pilgrimage, left tethered. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 225. Reports of ʿAdī b. ʿUmayra (عَدِيُّ بْنُ عَمِيرَةَ)

File: `225.webp`

```text
A small needle and thread on a fine cloak. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 226. Reports of Sufyān b. Abī Zuhayr (سُفْيَانُ بْنُ أَبِي زُهَيْرٍ)

File: `226.webp`

```text
Caravans leaving Medina toward Syria. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 227. Reports of al-Mustawrid (الْمُسْتَوْرِدُ)

File: `227.webp`

```text
A shoreline with a single wet stone. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 228. Reports of ʿUmayr, freedman of Ābī al-Laḥm (مَا رَوَاهُ عُمَيْرٌ مَوْلَى أَبِي اللَّحْمِ رضي الله عنه عَنِ النَّبِيِّ صلى الله عليه وسلم)

File: `228.webp`

```text
A short sword too long for a boy. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 229. Reports of Usāma b. Sharīk (أُسَامَةُ بْنُ شَرِيكٍ)

File: `229.webp`

```text
An herb seller's basket of remedies. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 230. Reports of ʿAbd Allāh b. ʿUkaym (عَبْدُ اللَّهِ بْنُ عُكَيْمٍ)

File: `230.webp`

```text
A tanned hide stretched on a frame. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 231. Reports of al-Ḥasan b. ʿAlī (حَدِيثُ الْحَسَنِ بْنِ عَلِيٍّ رضي الله عنهما)

File: `231.webp`

```text
A lamp in a niche at night. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 232. Reports of al-Ḥusayn b. ʿAlī (الْحُسَيْنُ بْنُ عَلِيٍّ رضي الله عنهما)

File: `232.webp`

```text
A horse tethered at a door. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 233. Reports of Abū Jarī al-Hujaymī (أَبُو جُرَيٍّ الْهَجْمِيُّ)

File: `233.webp`

```text
A path between graves at dusk. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 234. Reports of ʿAbd al-Raḥmān b. Abī Bakr (عَبْدُ الرَّحْمَنِ بْنُ أَبِي بَكْرٍ الصِّدِّيقُ رضي الله عنهما)

File: `234.webp`

```text
The boundary at al-Tanʿīm. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 235. Reports of ʿAbd Allāh b. Abī Ḥabība (عَبْدُ اللَّهِ بْنُ أَبِي حَبِيبَةَ)

File: `235.webp`

```text
A cloak draped in a small mosque. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 236. Reports of Grandfather of ʿAdī b. Thābit (حَدِيثُ جَدِّ عَدِيِّ بْنِ ثَابِتٍ)

File: `236.webp`

```text
Linen and a basin. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 237. Reports of Abū Rimtha (أَبُو رِمْثَةَ)

File: `237.webp`

```text
A dish of henna. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 238. Reports of Abū Kaysān (حَدِيثُ أَبِي كَيْسَانَ)

File: `238.webp`

```text
A single wrap garment. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 239. Reports of Untitled report (حَدِيثٌ)

File: `239.webp`

```text
A bed laced with palm fiber and a hanging waterskin in a small room. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 240. Reports of Thābit b. al-Ḍaḥḥāk (حَدِيثُ ثَابِتِ بْنِ الضَّحَّاكِ)

File: `240.webp`

```text
Sharecropped fields. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 241. Reports of Yaʿlā al-ʿĀmirī (يَعْلَى الْعَامِرِيُّ)

File: `241.webp`

```text
Two small children's sandals on a path. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 242. Reports of Ibn Umm Maktūm (ابْنُ أُمِّ مَكْتُومٍ)

File: `242.webp`

```text
A walking staff beside a long path to a mosque. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 243. Reports of ʿUmar b. Abī Salama (عُمَرُ بْنُ أَبِي سَلَمَةَ)

File: `243.webp`

```text
A shared bowl with a spoon at its near edge. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 244. Reports of Abū Lubāba (حَدِيثُ أَبِي لُبَابَةَ رضي الله عنه)

File: `244.webp`

```text
A snake in a doorway. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 245. Reports of Abū ʿAyyāsh al-Zuraqī (حَدِيثُ أَبِي عَيَّاشٍ الزُّرَقِيِّ رضي الله عنه)

File: `245.webp`

```text
The plain of ʿUsfān. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 246. Reports of Ḥudhayfa b. Asīd (حُذَيْفَةُ بْنُ أُسَيْدٍ)

File: `246.webp`

```text
A view from an upper room at dusk. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 247. Reports of Tamīm al-Dārī (تَمِيمٌ الدَّارِيُّ رضي الله عنه)

File: `247.webp`

```text
Oil lamps hung in a mosque. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 248. Reports of Ṭāriq b. ʿAbd Allāh al-Muḥāribī (طَارِقُ بْنُ عَبْدِ اللَّهِ الْمُحَارِبِيُّ)

File: `248.webp`

```text
A prayer mat on sand with a cloth to its left. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 249. Reports of Saʿd b. ʿUbāda (سَعْدُ بْنُ عُبَادَةَ)

File: `249.webp`

```text
Iron shackles lying on a governor's seat. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 250. Reports of Muʿāwiya b. al-Ḥakam al-Sulamī (مُعَاوِيَةُ بْنُ الْحَكَمِ السُّلَمِيُّ)

File: `250.webp`

```text
Sheep grazing near Uḥud, a wolf at the edge of the flock. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 251. Reports of Abū Maḥdhūra (أَبُو مَحْذُورَةَ)

File: `251.webp`

```text
A rooftop in Mecca at dawn. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 252. Reports of Maʿn b. Yazīd (مَعْنُ بْنُ يَزِيدَ)

File: `252.webp`

```text
A red clay jar spilling gold dinars. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 253. Reports of Ḥanẓala the scribe (حَنْظَلَةُ الْكَاتِبُ)

File: `253.webp`

```text
A scribe's inkwell and reed pens. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 254. Reports of al-Nuʿmān b. Muqarrin (النُّعْمَانُ بْنُ مُقَرِّنٍ)

File: `254.webp`

```text
An afternoon wind blowing banners. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 255. Reports of Ibn Buḥayna (مَا رَوَاهُ ابْنُ بُحَيْنَةَ عَنِ النَّبِيِّ صلى الله عليه وسلم)

File: `255.webp`

```text
Prayer rows at the afternoon prayer. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 256. Reports of Ḥubshī b. Junāda (مَا رَوَاهُ حُبْشِيُّ بْنُ جُنَادَةَ رضي الله عنه عَنِ النَّبِيِّ صلى الله عليه وسلم)

File: `256.webp`

```text
Two lamps lit from one flame. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 257. Reports of Salmān b. ʿĀmir al-Ḍabbī (مَا رَوَاهُ سَلْمَانُ بْنُ عَامِرٍ الضَّبِّيُّ رضي الله عنه عَنِ النَّبِيِّ صلى الله عليه وسلم)

File: `257.webp`

```text
Dates and water at sunset. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 258. Reports of ʿAbd Allāh b. Unays al-Juhanī (عَبْدُ اللَّهِ بْنُ أُنَيْسٍ الْجُهَنِيُّ)

File: `258.webp`

```text
A dark cloud over three stones. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 259. Reports of al-Sāʾib (حَدِيثُ السَّائِبِ)

File: `259.webp`

```text
White pilgrim cloths flapping in the wind. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 260. Reports of Abū Zayd ʿAmr b. Akhṭab (حَدِيثُ أَبِي زَيْدٍ عَمْرِو بْنِ أَخْطَبَ)

File: `260.webp`

```text
A cup of water with a single hair in it. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 261. Reports of Hulb (حَدِيثُ هُلْبٍ)

File: `261.webp`

```text
A bowl of food from a monastery kitchen. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 262. Reports of ʿAmr b. al-Ḥamiq (عَمْرُو بْنُ الْحَمِقِ)

File: `262.webp`

```text
A honeycomb. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 263. Reports of Sulaymān b. Ṣurad (سُلَيْمَانُ بْنُ صُرَدٍ)

File: `263.webp`

```text
A water basin for cooling anger. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 264. Reports of Khālid b. ʿUrfuṭa (خَالِدُ بْنُ عُرْفُطَةَ)

File: `264.webp`

```text
Kufa under storm clouds. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 265. Reports of al-Ashʿath b. Qays (الْأَشْعَثُ بْنُ قَيْسٍ)

File: `265.webp`

```text
A well in a disputed field. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 266. Reports of ʿAbd Allāh b. al-Sāʾib (عَبْدُ اللَّهِ بْنُ السَّائِبِ)

File: `266.webp`

```text
The corner of a stone sanctuary wall at night. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 267. Reports of Ṣafwān b. ʿAssāl al-Murādī (حَدِيثُ صَفْوَانَ بْنِ عَسَّالٍ الْمُرَادِيِّ رضي الله عنه)

File: `267.webp`

```text
White feathers drifting over a student's notebooks. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 268. Reports of Qabīṣa b. al-Mukhāriq (قَبِيصَةُ بْنُ الْمُخَارِقِ رضي الله عنه)

File: `268.webp`

```text
Lines drawn in sand, a bird flying away. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 269. Reports of ʿAbd al-Raḥmān b. Samura (عَبْدُ الرَّحْمَنِ بْنُ سَمُرَةَ رضي الله عنه)

File: `269.webp`

```text
Arrows on the ground beneath an eclipsed sun. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 270. Reports of al-ʿIrbāḍ b. Sāriya (الْعِرْبَاضُ بْنُ سَارِيَةَ)

File: `270.webp`

```text
A cup of water offered on a tray. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 271. Reports of Jābir b. ʿAtīk al-Anṣārī (جَابِرُ بْنُ عَتِيكٍ الْأَنْصَارِيُّ رضي الله عنه)

File: `271.webp`

```text
A proud warhorse in battle dress. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 272. Reports of Abū al-Malīḥ b. Usāma (حَدِيثُ أَبِي الْمَلِيحِ بْنِ أُسَامَةَ رضي الله عنه)

File: `272.webp`

```text
Rain falling on tents at Ḥudaybiya. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 273. Reports of ʿAmr b. Umayya al-Ḍamrī (عَمْرُو بْنُ أُمَيَّةَ الضَّمْرِيُّ رضي الله عنه)

File: `273.webp`

```text
Leather socks and a turban. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 274. Reports of ʿUqba b. al-Ḥārith (عُقْبَةُ بْنُ الْحَارِثِ رضي الله عنه)

File: `274.webp`

```text
A bridal chamber with a step outside. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 275. Reports of al-Sharīd b. Suwayd (الشَّرِيدُ بْنُ سُوَيْدٍ رضي الله عنه)

File: `275.webp`

```text
A distant tent with a staff planted outside it. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 276. Reports of Mujammiʿ b. Jāriya (مُجَمِّعِ بْنِ جَارِيَةُ رضي الله عنه)

File: `276.webp`

```text
Camels gathered at Kurāʿ al-Ghamīm. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 277. Reports of ʿAbd al-Muṭṭalib b. Rabīʿa b. al-Ḥārith (عَبْدُ الْمُطَّلِبِ بْنُ رَبِيعَةَ بْنِ الْحَارِثِ رضي الله عنه)

File: `277.webp`

```text
Two cousins' cushions. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 278. Reports of ʿĀʾidh b. ʿAmr al-Muzanī (عَائِذُ بْنُ عَمْرٍو الْمُزَنِيُّ رضي الله عنه)

File: `278.webp`

```text
Green glazed jars, gourds and pitched jars. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 279. Reports of al-Miqdām b. Maʿdīkarib (مِقْدَامُ بْنُ مَعْدِي كَرِبَ)

File: `279.webp`

```text
A guest's tent. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 280. Reports of Usayd b. Ḥuḍayr (حَدِيثُ أُسَيْدِ بْنِ الْحُضَيْرِ رضي الله عنه)

File: `280.webp`

```text
A cloud lit from within by lamplike lights above a tethered horse at night. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 281. Reports of Unnamed Companions and authorities (مَنْ رَوَى عَنِ النَّبِيِّ صلى الله عليه وسلم مِمَّنْ لَمْ يُسَمَّ بِاسْمِهِ)

File: `281.webp`

```text
A doorway with many pairs of sandals before it. Setting: Medina, Mecca, Kufa and the first Islamic century, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Kufan late-afternoon light and terracotta and burnt orange accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```


<a id="musnad-khalifa-ibn-khayyat"></a>

## Musnad Khalīfa ibn Khayyāṭ

- Slug: `musnad-khalifa-ibn-khayyat`
- Compiler: Khalīfa ibn Khayyāṭ (d. 240 AH), Basra
- Chapters: 47
- Light key: Basran evening light and slate blue accents in the shadows

### Hero

Save as `public/images/hadith/covers/musnad-khalifa-ibn-khayyat.webp` at 1400 x 788.

```text
A historian's study in Basra at evening. Through a window on the right, the harbor with ships at anchor under a slate blue sky. In the right foreground: rolled scrolls and stacked quires of annals on a desk, a reed pen and inkwell, a brass lamp and a slate blue cloth over a chest. Detailed oil painting with fine brushwork on softly aged canvas, warm lamp and window light against deep umber shadow. The left 40 percent of the frame falls into soft, nearly black shadow with no detail, leaving clean space for a title; every object and all of the light sit in the right 60 percent. No people or human figures, no writing, letters, calligraphy or inscriptions, no modern objects. Wide landscape composition, 16:9 aspect ratio.
```

### Chapter plates

Save each as `public/images/hadith/chapter-covers/musnad-khalifa-ibn-khayyat/NN.webp` at 880 x 1056.

#### 1. Anas b. Malik (أَنَسُ بْنُ مَالِكٍ)

File: `01.webp`

```text
Rain pouring from the roof spouts of Medina into its lanes, while clouds part around the town. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 2. Khubayb b. Asaf al-Ansari (خُبَيْبُ بْنُ أَسَافٍ الأَنْصَارِيُّ)

File: `02.webp`

```text
A modest house among the palms of al-Sunḥ on the edge of Medina. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 3. Khawwat b. Jubayr (خَوَّاتُ بْنُ جُبَيْرٍ)

File: `03.webp`

```text
A small cup beside a large jar. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 4. Abu Khayra al-Sabbahi (أَبُو خَيْرَةَ الصَّبَّاحِيُّ)

File: `04.webp`

```text
A bundle of arāk twigs tied with a cord. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 5. Abu l-Darda' (أَبُو الدَّرْدَاءِ)

File: `05.webp`

```text
A prayer mat facing a niche, a distraction glimpsed through a window. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 6. Dhu l-Lihya al-Kilabi (ذُو اللِّحْيَةِ الْكِلابِيُّ)

File: `06.webp`

```text
A blank tablet and a reed pen. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 7. Sa'd b. Abi Waqqas (سَعْدُ بْنُ أَبِي وَقَّاصٍ)

File: `07.webp`

```text
A doorway with light coming in and going out. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 8. Abu Sa'id al-Khudri (أَبُو سَعِيدٍ الْخُدْرِيُّ)

File: `08.webp`

```text
Ashes scattered on the wind over a sea. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 9. Sa'id b. Zayd (سَعِيدُ بْنُ زَيْدٍ)

File: `09.webp`

```text
Ten palm trees standing in a row in a garden. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 10. Sahl b. Sa'd al-Sa'idi (سَهْلُ بْنُ سَعْدٍ السَّاعِدِيُّ)

File: `10.webp`

```text
A covered water jar and a fastened belt on a peg. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 11. Abu Talha al-Ansari (أَبُو طَلْحَةَ الأَنْصَارِيُّ)

File: `11.webp`

```text
A sword lying on the sand at Mount Uḥud in hazy afternoon light. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 12. 'A'idh b. 'Amr al-Muzani (عَائِذُ بْنُ عَمْرٍو الْمُزَنِيُّ)

File: `12.webp`

```text
Mecca's mountains at dawn with the campfires of a great army on the hills. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 13. al-'Abbas b. 'Abd al-Muttalib (الْعَبَّاسُ بْنُ عَبْدِ الْمُطَّلِبِ)

File: `13.webp`

```text
Siwāk sticks in a cup beside water. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 14. 'Abd al-Rahman b. Khabbab al-Sulami (عَبْدُ الرَّحْمَنِ بْنُ خَبَّابٍ السُّلَمِيُّ)

File: `14.webp`

```text
Camels loaded with saddles and sacks lined up in the heat on the road to Tabūk. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 15. 'Abd al-Rahman b. 'Awf (عَبْدُ الرَّحْمَنِ بْنُ عَوْفٍ)

File: `15.webp`

```text
A bowl of tharīd, bread soaked in broth. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 16. 'Abd Allah b. Salam (عَبْدُ اللَّهِ بْنُ سَلامٍ)

File: `16.webp`

```text
The door of the mosque of Medina with light streaming in. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 17. 'Abd Allah b. 'Abbas b. 'Abd al-Muttalib (عَبْدُ اللَّهِ بْنُ عَبَّاسِ بْنِ عَبْدِ الْمُطَّلِبِ)

File: `17.webp`

```text
The mosque of al-Khayf at Mina among the hills. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 18. 'Abd Allah b. 'Umar b. al-Khattab (عَبْدُ اللَّهِ بْنُ عُمَرَ بْنِ الْخَطَّابِ)

File: `18.webp`

```text
A siwāk beside a pillow at dawn. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 19. 'Abd Allah b. 'Amr b. al-'As (عَبْدُ اللَّهِ بْنُ عَمْرِو بْنِ الْعَاصِ)

File: `19.webp`

```text
Gold coins and silver coins in the two pans of a balance. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 20. 'Abd Allah b. Mas'ud (عَبْدُ اللَّهِ بْنُ مَسْعُودٍ)

File: `20.webp`

```text
A desert camp at sunrise with cold ashes. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 21. 'Abd Allah b. Mu'arrid al-Bahili (عَبْدُ اللَّهِ بْنُ مُعَرِّضٍ الْبَاهِلِيُّ)

File: `21.webp`

```text
A she-camel standing with her herd. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 22. 'Abd Allah b. Mughaffal (عَبْدُ اللَّهِ بْنُ مُغَفَّلٍ)

File: `22.webp`

```text
A sheathed sword laid down between two cushions. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 23. 'Itban b. Malik al-Ansari (عِتْبَانُ بْنُ مَالِكٍ الأَنْصَارِيُّ)

File: `23.webp`

```text
A prayer spot in a house, a parchment and reed pen beside it. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 24. 'Adi b. Hatim (عَدِيُّ بْنُ حَاتِمٍ)

File: `24.webp`

```text
A chieftain's tent of Ṭayyiʾ with a cloak hanging at its entrance. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 25. Abu 'Uzayz b. 'Umayr b. Hashim (أَبُو عُزَيْزِ بْنُ عُمَيْرِ بْنِ هَاشِمٍ)

File: `25.webp`

```text
Bread and dates beside loosened ropes near the wells of Badr. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 26. 'Alqama b. al-Huwayrith al-Ghifari (عَلْقَمَةُ بْنُ الْحُوَيْرِثِ الْغِفَارِيُّ)

File: `26.webp`

```text
A lattice screen and a lowered curtain. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 27. 'Ali b. Abi Talib (عَلِيُّ بْنُ أَبِي طَالِبٍ)

File: `27.webp`

```text
A circle of cushions arranged for consultation. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 28. 'Imran b. Husayn (عِمْرَانُ بْنُ حُصَيْنٍ)

File: `28.webp`

```text
A night lamp beside an open window. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 29. Qutba b. Qatada al-Sadusi (قُطْبَةُ بْنُ قَتَادَةَ السَّدُوسِيُّ)

File: `29.webp`

```text
A small girl's anklet beside a folded cloak. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 30. Abu l-Qayn al-Aslami (أَبُو الْقَيْنِ الأَسْلَمِيُّ)

File: `30.webp`

```text
A basket of dates with a cloth drawn over it. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 31. Mas'ud (slave of Farwa) (مَسْعُودٌ (غُلامُ فَرْوَةَ))

File: `31.webp`

```text
A saddled camel waiting at night on a desert path, a guide's staff beside it. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 32. Mu'awiya b. Abi Sufyan (مُعَاوِيَةُ بْنُ أَبِي سُفْيَانَ)

File: `32.webp`

```text
A path along a cliff edge at dusk. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 33. Abu Muwayhiba (freedman of the Messenger of God ﷺ) (أَبُو مُوَيْهِبَةَ (مَوْلَى رَسُولِ اللَّهِ ﷺ))

File: `33.webp`

```text
The graves of al-Baqīʿ under moonlight. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 34. Maymun b. Sinbadh (مَيْمُونُ بْنُ سِنْبَاذَ)

File: `34.webp`

```text
A door in Basra with a bench beside it. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 35. Abu Hurayra (أَبُو هُرَيْرَةَ)

File: `35.webp`

```text
A sealed book on a high shelf with light streaming onto it. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 36. Abu Waqid al-Laythi (أَبُو وَاقِدٍ اللَّيْثِيُّ)

File: `36.webp`

```text
The gorge of the Yarmūk at dusk. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 37. Habib b. Abi Thabit (d. 119 AH) (حَبِيبُ بْنُ أَبِي ثَابِتٍ (ت 119 هـ))

File: `37.webp`

```text
A waterskin on the ground at the Yarmūk with three cups untouched beside it. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 38. al-Hasan al-Basri (الْحَسَنُ الْبَصْرِيُّ)

File: `38.webp`

```text
The furrows of a tilled field. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 39. Hammad (حَمَّادٌ)

File: `39.webp`

```text
Three crescent moons over three nights. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 40. al-Zuhri (الزُّهْرِيُّ)

File: `40.webp`

```text
The phases of the moon seen through a window. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 41. Sa'id b. al-Musayyab (سَعِيدُ بْنُ الْمُسَيِّبِ)

File: `41.webp`

```text
A field with a plow resting in it. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 42. 'Ikrima (freedman of Ibn 'Abbas) (عِكْرِمَةُ (مَوْلَى ابْنِ عَبَّاسٍ))

File: `42.webp`

```text
Linen cloth and a basin. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 43. Mujahid (مُجَاهِدٌ)

File: `43.webp`

```text
A basin of water and a clean cloth. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 44. Mudarib b. Hazn (مُضَارِبُ بْنُ حَزْنٍ)

File: `44.webp`

```text
Tents of Bakr ibn Wāʾil in the desert. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 45. Abu Musa al-Hakami Salih b. al-Hakam (أَبُو مُوسَى الْحَكَمِيُّ صَالِحُ بْنُ الْحَكَمِ)

File: `45.webp`

```text
A pen and tablet beneath the stars. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 46. Yazid b. 'Abd Allah b. al-Asamm (يَزِيدُ بْنُ عَبْدِ اللَّهِ بْنِ الأَصَمِّ)

File: `46.webp`

```text
Two staffs, one taller than the other. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 47. 'Abd Allah b. Sinan b. Nubayshah al-Muzani (عَبْدُ اللَّهِ بْنُ سِنَانِ بْنِ نُبَيْشَةَ الْمُزَنِيُّ)

File: `47.webp`

```text
An opened shackle with coins beside it. Setting: Medina, Mecca, Syria and Basra in the first Islamic century, with stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with Basran evening light and slate blue accents in the shadows. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```


<a id="kitab-al-iman-of-ibn-abi-umar-al-adani"></a>

## Kitāb al-Īmān of Ibn Abī ʿUmar al-ʿAdanī

- Slug: `kitab-al-iman-al-adani`
- Compiler: Ibn Abī ʿUmar al-ʿAdanī (d. 243 AH), Aden and Mecca
- Chapters: 56
- Light key: clear coastal light and teal and turquoise accents

### Hero

Save as `public/images/hadith/covers/kitab-al-iman-al-adani.webp` at 1400 x 788.

```text
A whitewashed room above the harbor of Aden at morning. On the right, through an open arch, the volcanic crags of the crater and the turquoise sea with a moored dhow. In the right foreground: a closed book resting on a carved wooden stand, a reed pen, a brass lamp and a teal cloth over a low chest. Detailed oil painting with fine brushwork on softly aged canvas, warm lamp and window light against deep umber shadow. The left 40 percent of the frame falls into soft, nearly black shadow with no detail, leaving clean space for a title; every object and all of the light sit in the right 60 percent. No people or human figures, no writing, letters, calligraphy or inscriptions, no modern objects. Wide landscape composition, 16:9 aspect ratio.
```

### Chapter plates

Save each as `public/images/hadith/chapter-covers/kitab-al-iman-al-adani/NN.webp` at 880 x 1056.

#### 1. Chapter on fighting over each pillar of the pillars of Islam (بَابٌ فِي الْقِتَالِ عَلَى كُلِّ رُكْنٍ مِنْ أَرْكانِ الْإِسْلَامِ)

File: `01.webp`

```text
Five plain stone columns holding up a roof, one of them lit by a shaft of sun. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 2. Chapter: Prayer is part of faith (بَابٌ الصَّلَاةُ مِنَ الْإِيمَانِ)

File: `02.webp`

```text
A prayer mat in a quiet mosque facing a plain prayer niche. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 3. Chapter: Severity regarding staying away from the Friday prayer (بَابٌ التَّشْديدُ فِي التَّخَلُّفِ عَنِ الْجُمُعَةِ)

File: `03.webp`

```text
An empty mosque courtyard at noon on a Friday, a single pair of sandals left outside. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 4. Chapter on abandoning disputation (al-mirāʾ) (بَابٌ فِي تَرْكِ الْمِرَاءِ)

File: `04.webp`

```text
Two scrolls rolled shut and set apart on a table, a cup of water between them. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 5. Chapter on that upon which Islam is built (بَابٌ فِيمَا بُنِيَ عَلَيْهِ الْإِسْلَامُ)

File: `05.webp`

```text
Five stone foundation blocks laid for a new building, a builder's plumb line hanging over them. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 6. Chapter on the attributes of the hypocrites (بَابٌ فِي صِفَاتِ الْمُنَافِقِينَ)

File: `06.webp`

```text
A beautifully painted vessel cracked open to show it is hollow inside. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 7. Chapter on the conditions for the perfection of faith (بَابٌ فِي شُرُوطِ كَمَالِ الْإِيمَانِ)

File: `07.webp`

```text
A fully lit oil lamp with its wick neatly trimmed. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 8. Chapter: The obligations of Islam and its shares (sihām) (بَابٌ فَرَائِضُ الْإِسْلَامِ وَسِهَامُهُ)

File: `08.webp`

```text
A quiver of eight arrows standing in a row. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 9. Chapter: The application of the term ‘disbelief’ to one who abandons prayer (بَابٌ إِطْلَاقُ الْكُفْرِ عَلَى مَنْ تَرَكَ الصَّلَاةَ)

File: `09.webp`

```text
A neglected prayer mat, dusty and rolled in a corner. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 10. Chapter: The inseparability of works from faith (بَابٌ مُلَازَمَةُ الْعَمَلِ لِلْإِيمَانِ)

File: `10.webp`

```text
A seed and a sprouting plant side by side in a clay dish. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 11. Chapter on divine decree (al-qadar) (بَابٌ فِي الْقَدَرِ)

File: `11.webp`

```text
A reed pen resting on a blank tablet beneath a sky of stars. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 12. Continuation of the chapter on the obligations of Islam and its shares (تَابِعْ بَابَ فَرَائِضِ الْإِسْلَامِ وَسِهَامِهِ)

File: `12.webp`

```text
A brass balance scale with a set of weights beside it. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 13. Chapter: Maintaining ablution is part of faith (بَابٌ الْمُحافَظَةُ عَلَى الْوُضُوءِ مِنَ الْإِيمَانِ)

File: `13.webp`

```text
A brass ewer kept full beside a doorway. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 14. Chapter on the speech of God, mighty and majestic, and the seeing of Him on the Day of Resurrection (بَابٌ فِي كَلَامِ اللَّهِ عز وجل وَرُؤْيَتِهِ يَوْمَ الْقِيَامَةِ)

File: `14.webp`

```text
A full moon high over a clear desert night. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 15. Chapter: Congregational prayer is among the ways of guidance (sunan al-hudā) (بَابٌ صَلَاةُ الْجَمَاعَةِ مِنْ سُنَنِ الْهُدَى)

File: `15.webp`

```text
Rows of empty prayer mats aligned in a mosque. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 16. Continuation of the chapter on the application of the term ‘disbelief’ to one who abandons prayer (تَابِعُ بَابِ إِطْلَاقِ الْكُفْرِ عَلَى مَنْ تَرَكَ الصَّلَاةَ)

File: `16.webp`

```text
A mosque door standing open at the call to prayer, its threshold empty. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 17. Chapter: The inviolability of the blood and property of the believer (بَابٌ حُرْمَةُ دَمِ الْمُؤْمِنِ وَمَالِهِ)

File: `17.webp`

```text
A sealed chest of coins and a sheathed sword set aside, untouched. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 18. Chapter on the increase and decrease of faith (بَابٌ فِي زِيَادَةِ الْإِيمَانِ وَنُقْصَانِهِ)

File: `18.webp`

```text
Two lamps side by side, one with its oil reservoir full, one half empty. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 19. Chapter: The statements of the Murjiʾa and the Jahmiyya on faith (بَابٌ أَقْوَالُ الْمُرْجِئَةِ وَالْجَهْمِيَّةِ فِي الْإِيمَانِ)

File: `19.webp`

```text
Two paths diverging across a desert at dusk. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 20. Chapter: The obligation of calm (ṭumaʾnīna) in prayer, and that it is part of faith (بَابٌ وُجُوبُ الطُّمَأْنِينَةِ فِي الصَّلَاةِ وَأَنَّهَا مِنَ الْإِيمَانِ)

File: `20.webp`

```text
A still pool reflecting a mosque arch. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 21. Chapter: The concern of the early generations (salaf) for performing prayer (بَابٌ حِرْصُ السَّلَفِ عَلَى أَدَاءِ الصَّلَاةِ)

File: `21.webp`

```text
A lamp burning before dawn beside a prayer mat. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 22. Chapter: Fighting over abandoning the pilgrimage (بَابٌ الْمُجَاهَدَةُ عَلَى تَرْكِ الْحَجِّ)

File: `22.webp`

```text
A pilgrim's provisions packed beside a door, a camel saddle on top. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 23. Chapter: The decrease of faith through the decrease of acts of obedience (بَابٌ نُقْصَانُ الْإِيمَانِ بِنُقْصَانِ الطَّاعَاتِ)

File: `23.webp`

```text
A fading lamp with its wick smoking. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 24. Continuation of the chapter on faith in divine decree (al-qadar) (تَابِعٌ لِبَابِ الْإِيمَانِ بِالْقَدَرِ)

File: `24.webp`

```text
A scroll closed with a blank seal, a reed pen beside it. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 25. Continuation of the chapter on fighting over abandoning the pilgrimage (تَابِعُ بَابِ الْمُجَاهَدَةِ عَلَى تَرْكِ الْحَجِّ)

File: `25.webp`

```text
The road to Mecca winding through mountain passes. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 26. Chapter on the lifting of trust and faith from some hearts (بَابٌ فِي رَفْعِ الْأَمَانَةِ وَالْإِيمَانِ مِنْ بَعْضِ الْقُلُوبِ)

File: `26.webp`

```text
An ember fading to ash on a stone hearth. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 27. Chapter: The departure of faith upon committing acts of disobedience (بَابٌ فِي زَوَالِ الْإِيمَانِ عِنْدَ ارْتِكَابِ الْمَعَاصِي)

File: `27.webp`

```text
A canopy of cloth lifted above an empty space, sky showing through. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 28. Chapter: Righteous work raises the good word (بَابٌ الْعَمَلُ الصَّالِحُ يَرْفَعُ الْكَلَامَ الطَّيِّبَ)

File: `28.webp`

```text
A thin line of incense smoke rising upward through a beam of light. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 29. Chapter: Modesty (ḥayāʾ) is part of faith (بَابٌ الْحَيَاءُ مِنَ الْإِيمَانِ)

File: `29.webp`

```text
A curtain lowered across a doorway, soft light glowing behind it. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 30. Chapter: Restraining the tongue in times of tribulation (fitna) (بَابٌ كَفُّ اللِّسَانِ فِي الْفِتْنَةِ)

File: `30.webp`

```text
A sealed jar with its stopper in place, smoke from distant fires on the horizon. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 31. Chapter: Simplicity of dress (al-badhādha) is part of faith (بَابٌ الْبَذَاذَةُ مِنَ الْإِيمَانِ)

File: `31.webp`

```text
A plain patched wool garment hanging on a peg. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 32. Chapter: False praise is incompatible with faith (بَابٌ الْمَدْحُ الْكَاذِبُ يُنَافِي الْإِيمَانَ)

File: `32.webp`

```text
A handful of dust on a table beside a gilded cup. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 33. Chapter: The command to obey the one in authority (walī al-amr) and to be sincere in works for God (بَابٌ فِي الْأَمْرِ بِطَاعَةِ وَلِيِّ الْأَمْرِ وَإِخْلَاصِ الْعَمَلِ للَّهِ)

File: `33.webp`

```text
A ruler's staff leaning beside a lit lamp. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 34. Chapter on partisanship (al-ʿaṣabiyya) (بَابٌ فِي الْعَصَبِيَّةِ)

File: `34.webp`

```text
Tribal banners furled and laid down on the ground. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 35. Chapter on following the Sunna (بَابٌ فِي اتِّبَاعِ السُّنَّةِ)

File: `35.webp`

```text
A well-worn path through desert stones. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 36. Chapter: The pillars of faith (daʿāʾim al-īmān) (بَابٌ دَعَائِمُ الْإِيمَانِ)

File: `36.webp`

```text
A tent held up by its central pole and taut ropes. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 37. Chapter: The prohibition of plunder (al-nuhba) (بَابٌ النَّهْيُ عَنِ النُّهْبَةِ)

File: `37.webp`

```text
A cooking pot overturned, its contents spilled on the ground. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 38. Chapter: Lying is incompatible with faith (بَابٌ مُجَانَبَةُ الْكَذِبِ لِلْإِيمَانِ)

File: `38.webp`

```text
A broken pair of scales on a market bench. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 39. Chapter: Ablution is half of faith (بَابٌ الْوُضُوءُ نِصْفُ الْإِيمَانِ)

File: `39.webp`

```text
Two ewers side by side, one full and one empty. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 40. Continuation of the chapter on the application of the term ‘disbelief’ to one who abandons prayer (تَابِعْ بَابَ إِطْلَاقِ الْكُفْرِ عَلَى مَنْ تَرَكَ الصَّلَاةَ)

File: `40.webp`

```text
A rooftop at dusk with the sky turning violet. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 41. Chapter: Warning against harming the neighbor, and that it diminishes faith (بَابٌ التَّرْهِيبُ مِنْ أَذَى الْجَارِ وَأَنَّهُ يُنْقِصُ الْإِيمَانَ)

File: `41.webp`

```text
Two houses sharing a wall, a bowl of broth set on top of the wall between them. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 42. Chapter: The obligation of loyalty for God’s sake and enmity for God’s sake (بَابٌ وُجُوبُ الْمُوالَاةِ فِي اللَّهِ وَالْبُغْضِ فِي اللَّهِ)

File: `42.webp`

```text
Two lamps, one lit and one dark. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 43. Chapter: The passing away of knowledge (بَابٌ ذَهَابُ الْعِلْمِ)

File: `43.webp`

```text
Books on a shelf covered in dust. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 44. Chapter: Legal obligations (al-takālīf al-sharʿiyya) are part of faith (بَابٌ التَّكَالِيفُ الشَّرْعِيَّةِ مِنَ الْإِيمَانِ)

File: `44.webp`

```text
A measure, an ewer, a prayer mat and a coin purse set out together. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 45. Chapter: The description of the Muslim (بَابٌ صِفَةُ الْمُسْلِمِ)

File: `45.webp`

```text
A peaceful open door with bread and water set out on the step. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 46. Chapter: Religion is sincere advice (naṣīḥa) (بَابٌ الدِّينُ النَّصِيحَةُ)

File: `46.webp`

```text
A clear spring with a cup resting on its stone rim. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 47. Chapter: The most excellent of people in faith are the most excellent of them in knowledge (maʿrifa) (بَابٌ أفْضَلُ النَّاسِ إِيمَانًا أفْضَلُهُمْ مَعْرِفَةً)

File: `47.webp`

```text
A lamp burning on top of a stack of books. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 48. Chapter: The sin of one who withholds zakāt (بَابٌ إِثْمُ مَانِعِ الزَّكَاةِ)

File: `48.webp`

```text
A locked chest with a coiled serpent resting on its lid. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 49. Chapter: Mention of the Khawārij and their attributes (بَابٌ ذِكْرُ الْخَوَارِجِ وَصِفَاتِهِمْ)

File: `49.webp`

```text
An arrow lying beyond the target it has passed straight through, its shaft clean. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 50. Chapter: Which Islam is best? (بَابٌ أيُّ الْإِسْلَامِ أفْضَلُ)

File: `50.webp`

```text
A bowl of food set out for travelers beside a road. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 51. Chapter: The call to the two testimonies and the laws (sharāʾiʿ) of Islam (بَابٌ الدُّعَاءُ إِلَى الشَّهَادَتَيْنِ وَشَرَائِعِ الْإِسْلَامِ)

File: `51.webp`

```text
A sealed letter ready for dispatch and a desert road leading south toward Yemen. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 52. Continuation of the chapter on the departure of faith upon committing acts of disobedience (تَابِعْ بَابَ زَوَالِ الْإِيمَانِ عِنْدَ ارْتِكَابِ الْمَعَاصِي)

File: `52.webp`

```text
A cloud's shadow moving away from a sunlit field. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 53. Continuation of the chapter on the call to the two testimonies and the laws of Islam (تَابِعْ بَابَ الدُّعَاءِ إِلَى الشَّهَادَتَيْنِ وَشَرَائِعِ الْإِسْلَامِ)

File: `53.webp`

```text
A traveler's staff and a sealed letter resting together on a bench. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 54. Chapter: The dislike of assuming leadership (imāra) (بَابٌ كَرَاهِيَةُ تَوَلِّي الْإِمَارَةِ)

File: `54.webp`

```text
An empty seat of governance with a cloak draped over it, beside a window. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 55. Continuation of the chapter on following the Sunna (تَابِعُ بَابِ اتِّبَاعِ السُّنَّةِ)

File: `55.webp`

```text
Fresh footprints in sand following an older path. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 56. Chapter: A believer does not commit treacherous assassination (fatk) (بَابٌ لَا يَفْتِكُ مُؤْمِنٌ)

File: `56.webp`

```text
A sheathed dagger left untouched on a table beside an open door. Setting: Aden and Mecca, with whitewashed stone, palm wood and woven mats. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear coastal light and teal and turquoise accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```


<a id="qiraat-al-nabi-of-al-duri"></a>

## Qirāʾāt al-Nabī of al-Dūrī

- Slug: `qiraat-al-nabi-al-duri`
- Compiler: Abū ʿUmar al-Dūrī (d. 246 AH), Baghdad and Samarra
- Chapters: 49
- Light key: deep indigo blue in the shadows against warm gold light

### Hero

Save as `public/images/hadith/covers/qiraat-al-nabi-al-duri.webp` at 1400 x 788.

```text
A reciter's room at night in Baghdad. Through a window on the right, the Tigris under a deep indigo sky with a crescent moon. In the right foreground: a closed codex wrapped in cloth on a carved wooden recitation stand, a brass lamp casting warm light, a small dish of oil and a folded indigo cloth on a reed mat. Detailed oil painting with fine brushwork on softly aged canvas, warm lamp and window light against deep umber shadow. The left 40 percent of the frame falls into soft, nearly black shadow with no detail, leaving clean space for a title; every object and all of the light sit in the right 60 percent. No people or human figures, no writing, letters, calligraphy or inscriptions, no modern objects. Wide landscape composition, 16:9 aspect ratio.
```

### Chapter plates

Save each as `public/images/hadith/chapter-covers/qiraat-al-nabi-al-duri/NN.webp` at 880 x 1056.

#### 1. From Surat Umm al-Kitab (Al-Fatiha) (مِنْ سُورَةِ أُمِّ الْكِتَابِ)

File: `01.webp`

```text
A doorway opening onto bright morning light, a lamp burning in the niche beside it. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 2. And from Surat al-Baqarah (وَمِنْ سُورَةِ الْبَقَرَةِ)

File: `02.webp`

```text
A single golden heifer standing in a green field. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 3. And from Surat Aal 'Imran (وَمِنْ سُورَةِ آلِ عِمْرَانَ)

File: `03.webp`

```text
Fruit out of season, grapes and pomegranates, resting in a stone sanctuary niche. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 4. And from Surat An-Nisa' (وَمِنْ سُورَةِ النِّسَاءِ)

File: `04.webp`

```text
A woman's chamber with a spindle and a folded veil on a cushion. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 5. And from Surat Al-Ma'idah (وَمِنْ سُورَةِ الْمَائِدَةِ)

File: `05.webp`

```text
A table spread with loaves and fish beneath a radiant sky. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 6. From Surat Al-An'am (مِنْ سُورَةِ الْأَنْعَامِ)

File: `06.webp`

```text
Sheep and camels grazing on an open pasture. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 7. And from Surat Al-A'raf (وَمِنْ سُورَةِ الْأَعْرَافِ)

File: `07.webp`

```text
A high ridge with a wall along its crest, standing between two valleys. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 8. And from Surat Al-Anfal (وَمِنْ سُورَةِ الْأَنْفَالِ)

File: `08.webp`

```text
A shield, spears and coins lying on the sand near the wells of Badr. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 9. And from Surat Bara'a (At-Tawbah) (وَمِنْ سُورَةِ بَرَاءَةِ)

File: `09.webp`

```text
A cave mouth among dark rocks with a spider's web stretched across it. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 10. And from Surat Yunus (وَمَنْ سُورَةِ يُونُسَ)

File: `10.webp`

```text
A gourd vine growing over a bare shore with the sea beyond. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 11. And from Surat Hud (وَمِنْ سُورَةِ هُودٍ)

File: `11.webp`

```text
A great wooden ark resting on a mountain after the flood, the waters receding. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 12. And from Surat Yusuf (وَمِنْ سُورَةِ يُوسُفَ)

File: `12.webp`

```text
A well in the desert with a bucket rope, a shirt lying on its rim, a caravan's trail in the distance. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 13. And from Surat Ar-Ra'd (وَمِنْ سُورَةِ الرَّعْدِ)

File: `13.webp`

```text
Thunderclouds and lightning over palm groves. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 14. And from Surat Ibrahim (وَمِنْ سُورَةِ إِبْرَاهِيمَ)

File: `14.webp`

```text
A good tree with deep roots and branches reaching into the sky. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 15. And from Surat Bani Isra'il (Al-Isra') (وَمِنْ سُورَةِ بَنِي إِسْرَائِيلَ)

File: `15.webp`

```text
A starlit night over a distant walled city on a hill. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 16. And from Surat Al-Kahf (وَمِنْ سُورَةِ الْكَهْفِ)

File: `16.webp`

```text
A cave entrance among rocks with sunlight slanting in, a dog asleep at the threshold. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 17. And from Surat Maryam (وَمِنْ سُورَةِ مَرْيَمَ)

File: `17.webp`

```text
A date palm heavy with ripe dates beside a small stream. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 18. And from Surat Ta-Ha (وَمِنْ سُورَةِ طه)

File: `18.webp`

```text
A fire burning on a dark mountainside at night. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 19. And from Surat Al-Hajj (وَمِنْ سُورَةِ الْحَجِّ)

File: `19.webp`

```text
Lean camels converging along distant mountain roads. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 20. And from Surat Al-Mu'minun (وَمِنْ سُورَةِ الْمُؤْمِنِينَ)

File: `20.webp`

```text
An olive tree on the rocky slopes of Mount Sinai. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 21. And from Surat An-Nur (وَمِنْ سُورَةِ النُّورِ)

File: `21.webp`

```text
A lamp in a niche, its glass shining like a star, a jar of olive oil beside it. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 22. And from Surat Al-Furqan (وَمِنْ سُورَةِ الْفُرْقَانِ)

File: `22.webp`

```text
Two seas meeting with a visible line between them. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 23. And from Surat Al-'Ankabut (وَمِنْ سُورَةِ الْعَنْكَبُوتِ)

File: `23.webp`

```text
A spider's web glistening in a dark corner. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 24. And from Surat Ar-Rum (وَمِنْ سُورَةِ الرُّومِ)

File: `24.webp`

```text
Ruined columns on a hillside at sunset. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 25. And from Surat Al-Ahzab (وَمِنْ سُورَةِ الْأَحْزَابِ)

File: `25.webp`

```text
A trench dug in front of a city, its earthworks fresh. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 26. And from Surat Saba' (وَمِنْ سُورَةِ سَبَإٍ)

File: `26.webp`

```text
A broken stone dam with flood waters pouring through, tamarisks beyond. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 27. And from Surat Ya-Sin (وَمِنْ سُورَةِ يس)

File: `27.webp`

```text
A thin crescent moon curved like an old palm stalk above the desert. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 28. And from Surat Az-Zumar (وَمِنْ سُورَةِ الزُّمَرِ)

File: `28.webp`

```text
Rain falling into springs in the earth, crops of many colors. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 29. And from Surat Az-Zukhruf (وَمِنْ سُورَةِ الزُّخْرُفِ)

File: `29.webp`

```text
Gold bracelets and silver vessels laid on a cloth. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 30. And from Surat Al-Ahqaf (وَمِنْ سُورَةِ الْأَحْقَافِ)

File: `30.webp`

```text
Wind-swept curving sand dunes. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 31. And from Surat Muhammad (وَمِنْ سُورَةِ مُحَمَّدٍ)

File: `31.webp`

```text
A garden with streams of clear water, milk and honey. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 32. And from Surat Al-Hujurat (وَمِنْ سُورَةِ الْحُجُرَاتِ)

File: `32.webp`

```text
A row of small private chambers around a courtyard, their doors closed. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 33. And from Surat Qaf (وَمِنْ سُورَةِ ق)

File: `33.webp`

```text
Tall palm trees with layered clusters of dates. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 34. And from Surat Adh-Dhariyat (وَمِنْ سُورَةِ الذَّارِيَاتِ)

File: `34.webp`

```text
Wind scattering dust beneath clouds heavy with rain. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 35. And from Surat An-Najm (وَمِنْ سُورَةِ النَّجْمِ)

File: `35.webp`

```text
A single bright star setting at dawn. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 36. And from Surat As-Sa'ah (Al-Qamar) (وَمِنْ سُورَةِ السَّاعَةِ)

File: `36.webp`

```text
A full moon hanging low over a mountain ridge at night. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 37. And from Surat Ar-Rahman (وَمِنْ سُورَةِ الرَّحْمَنِ عز وجل)

File: `37.webp`

```text
Pearls and red coral on a sandy shore. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 38. And from Surat Al-Waqi'ah (وَمِنْ سُورَةِ الْوَاقِعَةِ)

File: `38.webp`

```text
Lote trees without thorns, layered acacias and flowing water in extended shade. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 39. And from Surat At-Talaq (وَمِنْ سُورَةِ الطَّلَاقِ)

File: `39.webp`

```text
A woman's chest of belongings resting beside the doorway of her home. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 40. And from Surat Al-Haqqah (وَمِنْ سُورَةِ الْحَاقَّةِ)

File: `40.webp`

```text
Hollow palm trunks felled by a windstorm. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 41. And from Surat Al-Jinn (وَمِنْ سُورَةِ الْجِنِّ)

File: `41.webp`

```text
A night desert under stars with shooting stars streaking across. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 42. And from Surat Al-Muddaththir (وَمِنْ سُورَةِ الْمُدَّثِّرِ)

File: `42.webp`

```text
A wool cloak lying folded beside a lamp. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 43. And from Surat Idha sh-Shamsu Kuwwirat (At-Takwir) (وَمِنْ سُورَةِ إِذَا الشَّمْسُ كُوِّرَتْ)

File: `43.webp`

```text
Pregnant she-camels left grazing untended beneath a darkening sun. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 44. And from Surat Idha s-Sama'u nfatarat (Al-Infitar) (وَمِنْ سُورَةِ إِذَا السَّمَاءُ انْفَطَرَتْ)

File: `44.webp`

```text
Stars scattered across a dark sky over a black sea. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 45. And from Surat Al-Fajr (وَمِنْ سُورَةِ الْفَجْرِ)

File: `45.webp`

```text
Dawn breaking over the desert, ruined columns in the distance. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 46. And from Surat Al-Balad (وَمِنْ سُورَةِ الْبَلَدِ)

File: `46.webp`

```text
A steep mountain pass above a city in a valley. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 47. And from Surat Wa sh-Shams (وَمِنْ سُورَةِ وَالشَّمْسِ)

File: `47.webp`

```text
The bright sun with the moon following in a clear sky. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 48. And from Surat Wa l-Layl (وَمِنْ سُورَةِ وَاللَّيْلِ)

File: `48.webp`

```text
Night giving way to day, half the sky dark and half bright. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 49. And from Surat Quraysh (وَمِنْ سُورَةِ قُرَيْشٍ)

File: `49.webp`

```text
A caravan route stretching across the desert in winter and summer light. Setting: the landscapes and objects named in the Qurʾān as an early Muslim reader would picture them. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with deep indigo blue in the shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```


<a id="musnad-sad-ibn-abi-waqqas"></a>

## Musnad Saʿd ibn Abī Waqqāṣ

- Slug: `musnad-sad-ibn-abi-waqqas`
- Compiler: al-Dawraqī (d. 246 AH), Baghdad; reports of Saʿd ibn Abī Waqqāṣ
- Chapters: 9
- Light key: sunlit Hijazi ochre, warm sand and amber tones

### Hero

Save as `public/images/hadith/covers/musnad-sad-ibn-abi-waqqas.webp` at 1400 x 788.

```text
A stone house on the edge of the ʿAqīq valley outside Medina in late afternoon. Through an open arch on the right, the valley with its tamarisks and black lava ridges. In the right foreground against the wall: a hunting bow and a quiver of fletched arrows, a folded cloak, a small chest and a brass lamp, gathered on a woven rug. Detailed oil painting with fine brushwork on softly aged canvas, warm lamp and window light against deep umber shadow. The left 40 percent of the frame falls into soft, nearly black shadow with no detail, leaving clean space for a title; every object and all of the light sit in the right 60 percent. No people or human figures, no writing, letters, calligraphy or inscriptions, no modern objects. Wide landscape composition, 16:9 aspect ratio.
```

### Chapter plates

Save each as `public/images/hadith/chapter-covers/musnad-sad-ibn-abi-waqqas/NN.webp` at 880 x 1056.

#### 1. Jabir b. Samura, from Sa'd ﵄ (جَابِرُ بْنُ سَمُرَةَ، عَنْ سَعْدٍ ﵄)

File: `01.webp`

```text
The early mosque of Kufa, its roof of reeds held up on rows of palm-trunk columns, light falling between them in long bands. Setting: Medina, Mecca and early Kufa, with rough stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with sunlit Hijazi ochre, warm sand and amber tones. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 2. Ibn 'Abbas, from Sa'd (ابْنُ عَبَّاسٍ عَنْ سَعْدٍ)

File: `02.webp`

```text
A quiet estate house at al-ʿAqīq, a sheathed sword hanging unused on a whitewashed wall. Setting: Medina, Mecca and early Kufa, with rough stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with sunlit Hijazi ochre, warm sand and amber tones. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 3. 'Amir b. Sa'd, from his father (عَامِرُ بْنُ سَعْدٍ عَنْ أَبِيهِ)

File: `03.webp`

```text
A sickroom in Mecca with a low bed, and on a chest beside it a pile of coins divided into three portions. Setting: Medina, Mecca and early Kufa, with rough stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with sunlit Hijazi ochre, warm sand and amber tones. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 4. What Mus'ab b. Sa'd narrated from his father (مَا رَوَى مُصْعَبُ بْنُ سَعْدٍ عَنْ أَبِيهِ)

File: `04.webp`

```text
A dark, rain-soaked stone rising out of a storm, a single lamp still burning in a niche beside it. Setting: Medina, Mecca and early Kufa, with rough stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with sunlit Hijazi ochre, warm sand and amber tones. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 5. 'Umar b. Sa'd, from his father (عُمَرُ بْنُ سَعْدٍ عَنْ أَبِيهِ)

File: `05.webp`

```text
Two bowls on a cloth at sunset, one of golden honey and one of bitter herbs. Setting: Medina, Mecca and early Kufa, with rough stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with sunlit Hijazi ochre, warm sand and amber tones. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 6. Ibrahim b. Sa'd, from his father (إِبْرَاهِيمُ بْنُ سَعْدٍ عَنْ أَبِيهِ)

File: `06.webp`

```text
Two staffs leaning together in a doorway, one taller than the other. Setting: Medina, Mecca and early Kufa, with rough stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with sunlit Hijazi ochre, warm sand and amber tones. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 7. Muhammad b. Sa'd, from his father (مُحَمَّدُ بْنُ سَعْدٍ عَنْ أَبِيهِ)

File: `07.webp`

```text
A rolled poet's scroll tied shut and pushed to the edge of a table, a plain bowl of water standing in the light. Setting: Medina, Mecca and early Kufa, with rough stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with sunlit Hijazi ochre, warm sand and amber tones. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 8. Yahya b. Sa'd, from his father (يَحْيَى بْنُ سَعْدٍ عَنْ أَبِيهِ)

File: `08.webp`

```text
A city gate closed at dusk, an empty road outside and a lantern hanging from the gatepost. Setting: Medina, Mecca and early Kufa, with rough stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with sunlit Hijazi ochre, warm sand and amber tones. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 9. 'A'isha bint Sa'd (عَائِشَةُ بِنْتُ سَعْدٍ)

File: `09.webp`

```text
A woman's room in Saʿd's house at al-ʿAqīq, a bow and quiver of arrows hanging on the wall above a cushion and a spindle. Setting: Medina, Mecca and early Kufa, with rough stone, mudbrick and palm wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with sunlit Hijazi ochre, warm sand and amber tones. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```


<a id="birr-al-walidayn"></a>

## Birr al-Wālidayn

- Slug: `birr-al-walidayn`
- Compiler: al-Bukhārī (d. 256 AH)
- Chapters: 45
- Light key: tender late-afternoon light, rose and warm coral accents

### Hero

Save as `public/images/hadith/covers/birr-al-walidayn.webp` at 1400 x 788.

```text
A family room in a house of Bukhara at dusk. Through a window on the right, a domed brick skyline and poplars. In the right foreground: two low cushions set side by side for an elderly couple, a bowl of milk and a plate of dates set before them, a folded wool shawl and a softly glowing clay lamp. Detailed oil painting with fine brushwork on softly aged canvas, warm lamp and window light against deep umber shadow. The left 40 percent of the frame falls into soft, nearly black shadow with no detail, leaving clean space for a title; every object and all of the light sit in the right 60 percent. No people or human figures, no writing, letters, calligraphy or inscriptions, no modern objects. Wide landscape composition, 16:9 aspect ratio.
```

### Chapter plates

Save each as `public/images/hadith/chapter-covers/birr-al-walidayn/NN.webp` at 880 x 1056.

#### 1. What Has Come Regarding the Virtue of Kindness to Parents (بَابُ مَا جَاءَ فِي فَضْلِ بِرِّ الوَالِدَيْنِ)

File: `01.webp`

```text
Two cushions side by side for an elderly couple, a bowl of milk and a plate of dates set before them, warm lamplight. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 2. Kindness to Parents Even If They Are Polytheists (بَابُ بِرِّ الوَالِدَيْنِ وَإِنْ كَانَا مُشْرِكيْنِ)

File: `02.webp`

```text
A traveler's gift basket of dates and a folded cloth left at the door of an old stone house in Mecca. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 3. Parents Are the Most Entitled to Companionship (بَابُ الوَالِدَيْنِ أَحَقُّ النَّاسِ بِالصُّحْبَةِ)

File: `03.webp`

```text
A mother's shawl and walking staff beside a single place laid for a meal. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 4. Jihad with the Permission of Muslim Parents (بَابُ الجِهَادِ بِإِذْنِ الأَبَوَيْنِ المُسْلِمَيْنِ)

File: `04.webp`

```text
A sword and shield hanging on the wall of a family home, above an old man's cushion. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 5. The Greatest Bond Is Kindness to Parents (بَابُ أَعْظَمِ الصِّلَةِ، صِلَةُ الوَالِدَيْنِ)

File: `05.webp`

```text
Two cups poured from the same jug, set close together on a tray. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 6. The Supplication of Parents Is Answered (بَابُ دَعْوَةِ الوَالِدَيْنِ مُسْتَجَابَةٌ)

File: `06.webp`

```text
An empty prayer mat at night beneath an open window full of stars, a pair of old sandals beside it. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 7. Disobedience to Parents Nullifies Deeds (بَابُ عُقُوقِ الوَالِدَيْنِ يُحْبِطُ العَمَلَ)

File: `07.webp`

```text
A jar of grain spilled across a floor beside a cracked water jug. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 8. The Recompense for Parents (بَابُ جَزَاءِ الوَالِدَيْنِ)

File: `08.webp`

```text
An opened iron shackle lying on a cloth before a door flung open to bright light. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 9. Disobedience to Parents Is Among the Major Sins (بَابُ عُقُوقِ الوَالِدَيْنِ مِنَ الكَبَائِرِ)

File: `09.webp`

```text
Storm clouds gathering low over a darkened house. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 10. Whoever Finds His Parents Yet Does Not Enter Paradise (بَابُ مَنْ أَدْرَكَ وَالِدَيْهِ فَلَمْ يَدْخُلِ الجَنَّةَ)

File: `10.webp`

```text
A garden gate shut at the end of a path, two worn cushions waiting in the foreground. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 11. A Parent’s Gaze at Their Child (بَابُ نَظَرِ الوَالِدِ لِوَلَدِهِ)

File: `11.webp`

```text
A small wooden cradle in lamplight, a mother's shawl draped over its edge. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 12. Kindness to Those Whom One's Father Used to Maintain Ties With (بَابُ بِرِّ مِنْ كَانَ يَصِلُهُ أَبُوهُ)

File: `12.webp`

```text
A donkey's saddle cloth and a folded turban set out as a gift beside a desert road. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 13. What Has Come Regarding the Sin of Severing Kinship Ties (بَابُ مَا جَاءَ فِي إِثْمِ قَاطِعِ الرَّحِمِ)

File: `13.webp`

```text
A rope frayed and snapped in the middle, its two ends lying apart on stone. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 14. Whoever Is Blessed in Their Lifespan and Provision Due to Maintaining Kinship Ties (بَابُ مَنْ بُورِكَ لَهُ فِي عُمُرِهِ وَرِزْقِهِ لِصِلَةِ رَحِمِهِ)

File: `14.webp`

```text
A storage jar overflowing with wheat beside an old, healthy olive tree. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 15. Mention of Kinship Complaining to God ﷻ (بَابُ ذِكْرِ تَشَكِّي الرَّحِمِ إِلَى اللَّهِ ﷻ)

File: `15.webp`

```text
A grapevine clinging to a high wall, reaching upward toward the light. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 16. The Reward of Disobedience and Severing Kinship Ties (بَابُ جَزَاءِ العُقُوقِ وَقَطِيعَةِ الرَّحِمِ)

File: `16.webp`

```text
A withered branch cut from a tree, lying on dry ground. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 17. The One Who Maintains Ties Is Not the One Who Merely Repays (بَابُ لَيْسَ الوَاصِلُ بِالمُكَافِئِ)

File: `17.webp`

```text
A basket of bread left at a neighbor's closed door, with nothing returned. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 18. The Reward of Maintaining Kinship Ties and the Sin of Severing Them (بَابُ ثَوَاب صِلَةِ الرَّحِمِ وَإِثْمِ مَنْ قَطَعَهَا)

File: `18.webp`

```text
A tree with one green, flowering branch and one cut, bare branch. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 19. Mercy Does Not Descend Upon a People Among Whom Is One Who Severs Kinship Ties (بَابُ لَا تَنْزِلُ الرَّحْمَةُ عَلَى قَوْمٍ فِيهِمْ قَاطِعُ رَحِمٍ)

File: `19.webp`

```text
Rain clouds passing over a small village that remains dry. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 20. The Humiliation That Befalls the One Who Severs Kinship Ties in the Hereafter (بَابُ مَا يَلْحَقُ قَاطِعَ الرَّحِمِ مِنَ الخِزْي فِي الآخِرَةِ)

File: `20.webp`

```text
A dark, empty plain at dusk with a broken pot lying in the dust. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 21. Whoever Maintains Their Kinship Ties, God ﷻ, Will Maintain Ties with Them (بَابُ مَنْ وَصَلَ رَحِمَهُ وَصَلَهُ اللهُ ﷻ)

File: `21.webp`

```text
A woven rope binding two tent poles firmly together. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 22. Admonishing the Soul to Be Dutiful to Parents and Maintain Kinship Ties (بَابُ عِظَةِ النَّفْسِ بِبِرِّ الوَالِدَيْنِ وَصِلَةِ الأَرْحَامِ)

File: `22.webp`

```text
A polished bronze mirror reflecting lamplight on a bare table. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 23. Compelling the Soul to Adhere to Goodness and Maintaining Ties (بَابُ حَمْلِ النَّفْسِ عَلَى مُلَازَمَةِ البِرِّ وَالصِّلَةِ)

File: `23.webp`

```text
A full waterskin resting at the foot of a path that climbs steeply uphill. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 24. The Call of Parents Takes Precedence Over Voluntary Prayer (بَابُ نِدَاءِ الوَالِدَيْنِ مُقَدَّمٌ عَلَى صَلَاةِ النَّافِلَةِ)

File: `24.webp`

```text
A hermit's stone cell with its door left ajar, a lamp glowing inside. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 25. One Should Not Show Anger Toward Their Parents (بَابُ لَا يُظْهِرُ غَضَبَهُ لِوَالِدَيْهِ)

File: `25.webp`

```text
A cup of water on an untouched tray, its surface perfectly still. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 26. Kind Words with Parents (بَابُ الكَلِمِ الطَّيِّبِ مَعَ الوَالِدَيْنِ)

File: `26.webp`

```text
Two cups of warm milk sending up steam between cushions. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 27. The Safety of Parents from Their Child (بَابُ سَلَامَةِ الوَالِدَيْنِ مِنَ الوَلَدِ)

File: `27.webp`

```text
A child's small sandals placed neatly beside a pair of large, old sandals. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 28. The Matter of Parents: Kindness Toward Them (بَابُ شَأْنِ الوَالِدَيْنِ الإِحْسَانُ إِلَيْهِمَا)

File: `28.webp`

```text
A basin, ewer and towel made ready for washing an old man's feet. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 29. What Has Come Regarding Informing Parents of Love for Them (بَابُ مَا جَاءَ فِي إِعْلَامِ الحُبِّ لِلوَالِدَيْنِ)

File: `29.webp`

```text
A small bunch of jasmine left on an old woman's cushion. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 30. The Ugliness of Backbiting Parents (بَابُ قُبْحِ غِيبَةِ الوَالِدَيْنِ)

File: `30.webp`

```text
A shuttered window with light leaking through its slats onto an empty bench. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 31. Mercy Toward Parents (بَابُ الرَّحْمَةِ بِالوَالِدَيْنِ)

File: `31.webp`

```text
An old wool blanket warming beside a brazier, two cushions close to it. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 32. From the Perfection of Kindness: Good Character with Parents (بَابُ مِنْ تَمَامِ البِرِّ حُسْنُ الخُلُقِ مَعَ الوَالِدَيْنِ)

File: `32.webp`

```text
A pot of food shared between two bowls with two spoons. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 33. Among the Trials of the Last Days: Disobedience and Severing Ties of Kinship (بَابُ مِنْ فِتَنِ آخِرِ الزَّمَانِ، العُقُوقُ وَقَطْعُ الرَّحِمِ)

File: `33.webp`

```text
A darkened city skyline under a red evening sky, a cracked jar in the foreground. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 34. The Swift Punishment in This World for the One Who Cuts Off Kinship Ties (بَابُ تَعْجِيلِ عُقُوبَةِ قَاطِعِ الرَّحِمِ فِي الدُّنْيَا)

File: `34.webp`

```text
Lightning striking near a desert fort under a black sky. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 35. The One Who Maintains Ties of Kinship Will Always Have Support from God ﷻ (بَابُ لَا يَزَالُ للوَاصِلِ ظَهِيرٌ مِنَ اللَّهِ ﷻ)

File: `35.webp`

```text
A sturdy palm propped by a wooden beam against a strong wind. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 36. Knowing Who Truly Maintains Ties (بَابُ مَعْرِفَةِ الوَاصِلِ)

File: `36.webp`

```text
A rope rejoined with a firm knot. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 37. The Virtue of One Who Maintains Ties with an Oppressive Relative (بَابُ فَضْلِ مَنْ يَصِلُ ذَا الرَّحِمِ الظَّالِمِ)

File: `37.webp`

```text
A bowl of food set at the threshold of a grand but cold, shuttered house. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 38. Whoever Embraces Islam Retains the Reward of His Past Good Deeds and Maintaining Ties of Kinship (بَابُ مَنْ أَسْلَمَ عَلَى مَا سَلَفَ لَهُ مِنَ البِرِّ وَصِلَةِ الرَّحِمِ)

File: `38.webp`

```text
A stone house with heaps of dates and cloth set out for the poor in morning light. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 39. The Virtue of Spending and Charity on Relatives, Spouses, Children, and Parents (بَابُ فَضْلِ النَّفَقَةِ وَالصَّدَقَةِ عَلَى الأَقْرَبِينَ وَالزَّوْجِ وَالأَوْلَادِ وَالوَالِدَيْنِ)

File: `39.webp`

```text
Coins divided into small piles on a cloth, a bowl of food set beside each pile. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 40. The Kinship Seeks Refuge in the Creator, Glorified and Exalted, from Being Severed (بَابُ تَعَوُّذِ الرَّحِمِ بِالبَارِي جل جلاله مِنَ القَطِيعَةِ)

File: `40.webp`

```text
A vine clinging to a strong trellis in the wind. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 41. Righteousness and Maintaining Ties Are a Cause of Safety (بَابُ البِرِّ وَالصِّلَةِ سَبَبٌ لِلسَّلَامَةِ)

File: `41.webp`

```text
A walled garden enclosing and protecting a well. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 42. Righteousness Toward the Closest Relatives First (بَابُ بِرِّ الأَقْرَبِ فَالأَقْرَبِ)

File: `42.webp`

```text
A bowl at the center of a mat with smaller bowls ringed around it. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 43. The Manifestation of Severing Kinship Ties in the Latter Days (بَابُ ظُهُورِ قَطْعِ الأَرْحَامِ فِي آخِرِ الزَّمَانِ)

File: `43.webp`

```text
A village of closed doors and empty lanes at dusk. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 44. Kinship Is Kept Moist with Its Moisture (بَابُ تُبَلُّ الرَّحِمُ بِبَلَالِهَا)

File: `44.webp`

```text
A thirsty plant watered from a small jar, droplets on its leaves. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 45. Caution Against a Man Prioritizing His Wife Over His Parents (بَابُ الحَذَرِ مِنْ أَنْ يُقَدِّمَ الرَّجُلُ زَوْجَتَهُ عَلَى وَالِدَيْهِ)

File: `45.webp`

```text
Two cushions side by side, one new and embroidered, one old and worn, given equal place. Setting: a modest family home of the early Islamic world, with plaster walls, wool and wood. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with tender late-afternoon light, rose and warm coral accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```


<a id="sunan-al-athram"></a>

## Sunan al-Athram

- Slug: `sunan-al-athram`
- Compiler: al-Athram (d. 273 AH), Baghdad
- Chapters: 22
- Light key: clear Baghdad morning light and sage green accents

### Hero

Save as `public/images/hadith/covers/sunan-al-athram.webp` at 1400 x 788.

```text
A student's room in Baghdad overlooking the Tigris in morning light. On the right, through a wide window, the river and the brick walls of the city. In the right foreground on a low desk: a stack of notebooks of questions and answers bound with cord, a reed pen in a brass holder, a small ewer and basin for ablution, and a sage green cloth. Detailed oil painting with fine brushwork on softly aged canvas, warm lamp and window light against deep umber shadow. The left 40 percent of the frame falls into soft, nearly black shadow with no detail, leaving clean space for a title; every object and all of the light sit in the right 60 percent. No people or human figures, no writing, letters, calligraphy or inscriptions, no modern objects. Wide landscape composition, 16:9 aspect ratio.
```

### Chapter plates

Save each as `public/images/hadith/chapter-covers/sunan-al-athram/NN.webp` at 880 x 1056.

#### 1. Chapter: On wiping the head: how many times it is done ([باب في مسح الرأس كم مرة هو])

File: `01.webp`

```text
A brass ewer and basin on a stone ledge with a single damp cloth, a few drops of water catching the sun. Setting: a household of early Abbasid Baghdad, with fired brick, plaster, copper and brass. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear Baghdad morning light and sage green accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 2. Chapter: On wiping the head: how it is done (بَابُ مَسْحِ الرَّأْسِ كَيْفَ هُوَ)

File: `02.webp`

```text
A shallow basin with rippling water and a folded headcloth beside it, morning light across stone. Setting: a household of early Abbasid Baghdad, with fired brick, plaster, copper and brass. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear Baghdad morning light and sage green accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 3. Chapter: On the two ears: are they part of the head? (بَابٌ فِي الأُذُنَيْنِ أَمِنَ الرَّأْسِ هُمَا)

File: `03.webp`

```text
A brass ewer pouring a thin stream into a basin, a few bright drops scattered on a folded headcloth. Setting: a household of early Abbasid Baghdad, with fired brick, plaster, copper and brass. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear Baghdad morning light and sage green accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 4. Chapter: On wiping over the turban (بَابٌ فِي الْمَسْحِ عَلَى الْعِمَامَةِ)

File: `04.webp`

```text
A wound turban resting on a stone ledge beside a water basin, droplets glistening on its folds. Setting: a household of early Abbasid Baghdad, with fired brick, plaster, copper and brass. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear Baghdad morning light and sage green accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 5. Chapter: On one who forgets rinsing the mouth and sniffing water into the nose in his ablution (بَابُ فِيمَنْ نَسِيَ الْمَضْمَضَةَ وَالاسْتِنْشَاقَ فِي وُضُوئِهِ)

File: `05.webp`

```text
A small drinking cup left beside a full ewer at the edge of a basin, water still trembling. Setting: a household of early Abbasid Baghdad, with fired brick, plaster, copper and brass. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear Baghdad morning light and sage green accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 6. Chapter: On rinsing the mouth and sniffing water with a single scoop (باب في المضمضة والاستنشاق بغرفة واحدة)

File: `06.webp`

```text
A wooden scoop dipped in a full basin, clear water spilling over its lip. Setting: a household of early Abbasid Baghdad, with fired brick, plaster, copper and brass. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear Baghdad morning light and sage green accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 7. Chapter: On moving the ring in ablution (بَابُ تَحْرِيكِ الْخَاتَمِ في الوُضُوءِ)

File: `07.webp`

```text
A silver ring lying in a shallow pool of water at the bottom of a copper basin. Setting: a household of early Abbasid Baghdad, with fired brick, plaster, copper and brass. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear Baghdad morning light and sage green accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 8. Chapter: [On the man who performs ablution and sloshes his feet in the water] (باب [في الرجل يتوضأ فيخضخض رجليه في الماء])

File: `08.webp`

```text
A shallow stone footbath in a courtyard with water lapping at its rim, a pair of sandals beside it. Setting: a household of early Abbasid Baghdad, with fired brick, plaster, copper and brass. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear Baghdad morning light and sage green accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 9. Chapters on Waters. Chapter: What renders water impure and what does not (أَبْوَابُ الْمِيَاهِ)

File: `09.webp`

```text
A stone cistern of clear water with a single fallen leaf floating on its surface. Setting: a household of early Abbasid Baghdad, with fired brick, plaster, copper and brass. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear Baghdad morning light and sage green accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 10. Chapter: [On ablution with still water] (باب [في الوضوء من الماء الراكد])

File: `10.webp`

```text
A perfectly still pond in a courtyard, unrippled, reflecting the surrounding arches. Setting: a household of early Abbasid Baghdad, with fired brick, plaster, copper and brass. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear Baghdad morning light and sage green accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 11. Chapter: The water of the bathhouse (باب ماء الحمام)

File: `11.webp`

```text
The steamy interior of a domed bathhouse, shafts of light falling through star-shaped skylights onto stone basins. Setting: a household of early Abbasid Baghdad, with fired brick, plaster, copper and brass. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear Baghdad morning light and sage green accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 12. Chapter: On the man and the woman bathing with one water (باب [باب في الرجل والمرأة يغتسلان بماء واحد])

File: `12.webp`

```text
A single large copper basin with two wooden ladles resting on its rim. Setting: a household of early Abbasid Baghdad, with fired brick, plaster, copper and brass. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear Baghdad morning light and sage green accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 13. Chapter: [On ablution with the leftover of a woman] (باب [في الضوء بفضل المرأة])

File: `13.webp`

```text
A half-full water vessel beside a folded headscarf on a wooden bench. Setting: a household of early Abbasid Baghdad, with fired brick, plaster, copper and brass. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear Baghdad morning light and sage green accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 14. Chapter: [He should not put his hand into the vessel until he has washed it] (باب [لا يدخل يده الإناء حتى يغسلها])

File: `14.webp`

```text
A lidded water jar beside a small ewer ready for washing the hands, in the first light after waking. Setting: a household of early Abbasid Baghdad, with fired brick, plaster, copper and brass. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear Baghdad morning light and sage green accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 15. Chapter: What suffices of water in [ablution and ghusl] (باب ما يجزىء من الماء في [الوضوء والغسل])

File: `15.webp`

```text
A small mudd measure of water set beside a larger ṣāʿ vessel on a stone step. Setting: a household of early Abbasid Baghdad, with fired brick, plaster, copper and brass. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear Baghdad morning light and sage green accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 16. Chapter: The towel [after ablution and ghusl] (باب المنديل [بعد الوضوء والغسل])

File: `16.webp`

```text
A folded linen towel hanging on a wooden peg above a basin. Setting: a household of early Abbasid Baghdad, with fired brick, plaster, copper and brass. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear Baghdad morning light and sage green accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 17. Chapters on what one performs ablution for. Chapter: Ablution from vomiting (أبواب ما يتوضأ منه)

File: `17.webp`

```text
A dim sickroom with a pillow on a low bed, an ewer and basin waiting at its side. Setting: a household of early Abbasid Baghdad, with fired brick, plaster, copper and brass. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear Baghdad morning light and sage green accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 18. Chapter: Ablution from cupping (باب الوضوء من الحجامة)

File: `18.webp`

```text
Horn cupping vessels and clean linen on a tray, an ewer standing behind them. Setting: a household of early Abbasid Baghdad, with fired brick, plaster, copper and brass. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear Baghdad morning light and sage green accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 19. Chapter: What makes ablution obligatory because of sleep (باب ما يوجب الوضوء من النوم)

File: `19.webp`

```text
A cushion still pressed with the shape of sleep, an ewer waiting beside it and a lamp guttering. Setting: a household of early Abbasid Baghdad, with fired brick, plaster, copper and brass. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear Baghdad morning light and sage green accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 20. Chapter: Ablution from kissing and touching (باب الوضوء من القبلة واللمس)

File: `20.webp`

```text
Two cups set side by side on a tray, a sprig of jasmine between them. Setting: a household of early Abbasid Baghdad, with fired brick, plaster, copper and brass. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear Baghdad morning light and sage green accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 21. Section: [On kissing a child] (فصل [في قبلة الصبي])

File: `21.webp`

```text
A small embroidered child's cap and a wooden spinning top resting on a cushion. Setting: a household of early Abbasid Baghdad, with fired brick, plaster, copper and brass. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear Baghdad morning light and sage green accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 22. Chapter: [On ablution from what fire has touched] (باب [في الوضوء مما مست النار])

File: `22.webp`

```text
A cooking pot over embers and a plate of cooked meat, an ewer waiting in the background. Setting: a household of early Abbasid Baghdad, with fired brick, plaster, copper and brass. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with clear Baghdad morning light and sage green accents. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```


<a id="kitab-al-fitan-of-hanbal-ibn-ishaq"></a>

## Kitāb al-Fitan of Ḥanbal ibn Isḥāq

- Slug: `kitab-al-fitan-hanbal-ibn-ishaq`
- Compiler: Ḥanbal ibn Isḥāq (d. 273 AH), Baghdad
- Chapters: none (single-page reader). Hero only.

### Hero

Save as `public/images/hadith/covers/kitab-al-fitan-hanbal-ibn-ishaq.webp` at 1400 x 788.

```text
A rooftop room in Baghdad at dusk as a storm gathers. Through a wide opening on the right, the round city and the Tigris under heavy, darkening clouds lit by a red sunset. In the right foreground: a closed notebook tied with cord, a lamp whose flame bends in the wind, a sheathed sword laid aside and a small ewer. Detailed oil painting with fine brushwork on softly aged canvas, warm lamp and window light against deep umber shadow. The left 40 percent of the frame falls into soft, nearly black shadow with no detail, leaving clean space for a title; every object and all of the light sit in the right 60 percent. No people or human figures, no writing, letters, calligraphy or inscriptions, no modern objects. Wide landscape composition, 16:9 aspect ratio.
```


<a id="al-marasil-of-abu-dawud"></a>

## al-Marāsīl of Abū Dāwūd

- Slug: `al-marasil-abi-dawud`
- Compiler: Abū Dāwūd al-Sijistānī (d. 275 AH), Basra
- Chapters: 114
- Light key: dusky violet shadows against warm gold light

### Hero

Save as `public/images/hadith/covers/al-marasil-abi-dawud.webp` at 1400 x 788.

```text
A scholar's room in Basra at dusk. Through an arched window on the right, the palm groves and canals under a violet sky. In the right foreground on a low desk: an open notebook of reports beside a short iron chain with one link broken open, a reed pen and inkwell, a brass lamp and a folded violet cloth. Detailed oil painting with fine brushwork on softly aged canvas, warm lamp and window light against deep umber shadow. The left 40 percent of the frame falls into soft, nearly black shadow with no detail, leaving clean space for a title; every object and all of the light sit in the right 60 percent. No people or human figures, no writing, letters, calligraphy or inscriptions, no modern objects. Wide landscape composition, 16:9 aspect ratio.
```

### Chapter plates

Save each as `public/images/hadith/chapter-covers/al-marasil-abi-dawud/NN.webp` at 880 x 1056.

#### 1. Purification (ṭahāra) (كتاب الطهارة)

File: `01.webp`

```text
A stone basin brimming with clear water. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 2. Ablution (wuḍūʾ) (ما جاء في الوضوء)

File: `02.webp`

```text
A brass ewer and basin on a ledge. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 3. Prayer (من الصلاة)

File: `03.webp`

```text
A prayer mat in a quiet mosque. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 4. The call to prayer (adhān) (ما جاء فِي الأذان)

File: `04.webp`

```text
A rooftop at dawn above a sleeping town. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 5. Congregational prayer (ما جاء فِي الجماعة)

File: `05.webp`

```text
Rows of prayer mats aligned in a mosque. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 6. Clothing (ما جاء فِي الثياب)

File: `06.webp`

```text
A long wrap garment hanging on a peg beside a prayer mat. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 7. The prayer barrier (sutra) in prayer (باب ما جاء في السترة في الصلاة)

File: `07.webp`

```text
A spear planted upright in front of a prayer mat in the open. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 8. The opening supplication (istiftāḥ) (باب ما جاء فِي الاستفتاح)

File: `08.webp`

```text
First light coming through a doorway onto a prayer mat. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 9. Reciting the basmala aloud (باب ما جاء فِي الجهر ببسم الله الرحمن الرحيم)

File: `09.webp`

```text
A lamp burning before a closed codex. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 10. Shortening the prayer (باب ما جاء فِي التخفيف بالصلاة)

File: `10.webp`

```text
Travel provisions beside a prayer mat on a roadside. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 11. Recitation (باب في القراءة)

File: `11.webp`

```text
A wooden stand holding a closed codex at dawn. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 12. Friday prayer (ما جاء في الجمعة)

File: `12.webp`

```text
A mosque at noon, sandals lined up outside. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 13. The Friday sermon (ما جاء فِي الخطبة يوم الجمعة)

File: `13.webp`

```text
A wooden pulpit with three steps. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 14. The two festivals (ʿīdayn) (ما جاء فِي العيدين)

File: `14.webp`

```text
An open prayer ground outside the city at sunrise. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 15. Prayer for rain (istisqāʾ) (ما جاء في الاستسقاء)

File: `15.webp`

```text
Clouds gathering over dry fields, a cloak lying turned inside out on the ground. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 16. Prayer while traveling (باب صلاة السفر)

File: `16.webp`

```text
A prayer mat laid beside a kneeling camel. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 17. Voluntary prayer (صلاة التطوع)

File: `17.webp`

```text
A prayer mat in a dark house at night. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 18. Prostration (ما جاء في السجود)

File: `18.webp`

```text
A small mat of woven palm fiber on a mosque floor. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 19. The Night of Power (laylat al-qadr) (ما جاء في ليلة القدر)

File: `19.webp`

```text
A calm night sky of quiet stars, a lamp in a mosque. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 20. Supplication (ما جاء في الدعاء)

File: `20.webp`

```text
An open sky with light breaking through after rain. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 21. One who sleeps through the prayer (باب فيمن نام عن الصلاة)

File: `21.webp`

```text
The sun risen over a sleeping camp's cold embers. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 22. Miscellaneous matters of prayer (جامع الصلاة)

File: `22.webp`

```text
Mosque columns with sandals scattered between them. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 23. Fasting (ما جاء في الصوم)

File: `23.webp`

```text
Dates and water at sunset. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 24. The fasting person who has relations with his wife (ما جاء في الصائم يصيب أهله)

File: `24.webp`

```text
A basket of dates set out as an expiation. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 25. Almsgiving (zakāt) (باب في الزكاة)

File: `25.webp`

```text
A purse of coins on a ledger. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 26. Zakāt on grazing livestock (ما جاء في صدقة السائمة في الزكاة)

File: `26.webp`

```text
Sheep and camels gathered at a well to be counted. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 27. Zakāt al-fiṭr (باب في زكاة الفطر)

File: `27.webp`

```text
A ṣāʿ of dates and barley in a bowl. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 28. Miscellaneous matters of charity (باب في جامع الصدقة)

File: `28.webp`

```text
Bread wrapped for the poor at a doorstep. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 29. Pilgrimage (ḥajj) (باب في الحج)

File: `29.webp`

```text
Tents at Mina and small piles of pebbles. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 30. Trade (باب التجارة)

File: `30.webp`

```text
A market scale with goods. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 31. The insolvent debtor (فِي المفلس)

File: `31.webp`

```text
An empty shop with a single unsold item on the counter. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 32. Pledges (rahn) (ما جاء في الرهن)

File: `32.webp`

```text
A coat of mail folded beside a sack of barley. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 33. A man who finds his property with another (فِي الرجل يجد ماله عند غيره)

File: `33.webp`

```text
A familiar saddle resting on someone else's camel. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 34. Gifts (hiba) (ما جاء فِي الهبة)

File: `34.webp`

```text
A wrapped gift on a doorstep. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 35. Manumission (ʿitq) (باب ما جاء في العتق)

File: `35.webp`

```text
An opened shackle on a floor. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 36. Transfer of a purchase at cost (tawliya) (باب ما جاء في التولية)

File: `36.webp`

```text
A bale of cloth with the exact coins of its price beside it. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 37. Marriage (باب في النكاح)

File: `37.webp`

```text
A wedding canopy with lamps. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 38. Bridal gift (mahr) (باب في المهر)

File: `38.webp`

```text
An iron ring on a cloth. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 39. Looking at the woman at the time of betrothal (باب النظر عند التزويج)

File: `39.webp`

```text
A lattice window with light streaming through. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 40. Marriage between equals (kafāʾa) (باب ما جاء في تزويج الأكفاء)

File: `40.webp`

```text
Two identical bridal cushions. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 41. Divorce (ṭalāq) (في الطلاق)

File: `41.webp`

```text
A packed chest beside a door. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 42. Sacred things (ḥarām) (باب الحرام)

File: `42.webp`

```text
A boundary pillar marking a sacred precinct. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 43. Legal penalties (ḥudūd) (باب الحدود)

File: `43.webp`

```text
A whip hanging on the wall of a judge's court. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 44. Blood money: a Muslim killed for killing an unbeliever (باب الديات في المسلم يقاد بالكافر إذا قتله)

File: `44.webp`

```text
A sheathed sword beside a balance scale. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 45. When retaliation for wounds is carried out (باب متى يقتص من الجراح)

File: `45.webp`

```text
Bandages and a jar of healing salve. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 46. Amount of blood money (diya) (باب كم الدية)

File: `46.webp`

```text
A hundred camels filling a valley. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 47. Blood money for the protected non-Muslim (dhimmī) (باب دية الذمي)

File: `47.webp`

```text
A small village church door beside a set of scales. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 48. Collective oath in homicide cases (qasāma) (باب فِي القسامة)

File: `48.webp`

```text
Fifty small stones set in rows on a mat. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 49. Jihād (في الجهاد)

File: `49.webp`

```text
Swords and shields hanging on a wall. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 50. Horses and riding animals (باب في الخيل والدواب)

File: `50.webp`

```text
A horse standing in a stable. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 51. Misappropriation of spoils (ghulūl) (باب فِي الغلول)

File: `51.webp`

```text
A striped cloak smoldering on the ground. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 52. The condition of severed heads (في حال الرؤوس)

File: `52.webp`

```text
A battlefield at dusk, spears planted in the sand and empty helmets. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 53. Crucifixion (ما جاء في الصلب)

File: `53.webp`

```text
A bare wooden post on a hill at dusk. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 54. Animals (ما جاء فِي الدواب)

File: `54.webp`

```text
Camels and sheep at a trough. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 55. Merit of jihād (باب في فضل الجهاد)

File: `55.webp`

```text
A frontier fortress on a coast at dawn. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 56. Ransom with minors and one who finds his property among the spoils (باب ما جاء فِي الفداء بالصغار وفيمن وجد ماله فِي المغنم)

File: `56.webp`

```text
Small sandals among recovered goods. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 57. What a man embraced Islam upon (ما جاء فيما أسلم عليه الرجل)

File: `57.webp`

```text
A house with its old possessions kept in place. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 58. Speed in marching (باب ما جاء في سرعة السير)

File: `58.webp`

```text
A dust trail on a road at dawn. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 59. What is said upon conquest (باب ما جاء فيما يقال عند الفتح)

File: `59.webp`

```text
A city gate open at sunrise. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 60. Settling dependents on the coasts and frontier posts (باب ما جاء في إنزال الذرية السواحل والثغور)

File: `60.webp`

```text
A frontier fort by the sea. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 61. Granting favor to dependents (باب ما جاء في المن على الذرية)

File: `61.webp`

```text
A meal laid out for a household. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 62. Cutting down trees (باب فِي قطع الشجر)

File: `62.webp`

```text
Felled palm trunks lying beside standing palms. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 63. Bequests (waṣāyā) (ما جاء في الوصايا)

File: `63.webp`

```text
A sealed will. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 64. The mudabbar (slave freed upon his master's death) (المدبر)

File: `64.webp`

```text
A written document beside an opened fetter. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 65. Inheritance shares (farāʾiḍ) (ما جاء في الفرائض)

File: `65.webp`

```text
Coins divided into heaps on a cloth. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 66. Clientage (walāʾ) (باب ما جاء فِي الولاء)

File: `66.webp`

```text
A freedman's robe on a peg beside a patron's cushion. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 67. Distant heirs (kalāla) (باب فِي الكلالة)

File: `67.webp`

```text
A lone house with a single lamp in the window. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 68. Fayʾ and leadership (imāra) (ما جاء في الفيء والإمارة)

File: `68.webp`

```text
A governor's seat beside a treasury chest. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 69. Division of the fifth (khums) (ما جاء فِي قسمة الخمس)

File: `69.webp`

```text
Goods divided into five heaps. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 70. Sacrificial animals and slaughter (ما جاء في الضحايا والذبائح)

File: `70.webp`

```text
A ram tethered for sacrifice. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 71. The ʿaqīqa (باب في العقيقة)

File: `71.webp`

```text
Two sheep tethered beside a newborn's cradle. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 72. Hunting (فِي الصيد)

File: `72.webp`

```text
A bow and arrows, a gazelle in the distance. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 73. Expiations (kaffārāt) (ما جاء فِي الكفارات)

File: `73.webp`

```text
Bowls of food set out for the poor. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 74. Judgment (qaḍāʾ) (ما جاء في القضاء)

File: `74.webp`

```text
A judge's bench. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 75. Testimony (باب ما جاء في الشهادات)

File: `75.webp`

```text
Two cushions for witnesses. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 76. Oaths (باب الأيمان)

File: `76.webp`

```text
The pulpit in Medina where oaths are sworn. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 77. Vouching for witnesses (taʿdīl) (باب ما جاء في التعديل)

File: `77.webp`

```text
A notebook of names with a reed pen. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 78. Protected zones (ḥarīm) (باب ما جاء في الحريم)

File: `78.webp`

```text
A well surrounded by a marked ring of stones. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 79. Imprisonment (باب ما جاء في الحبس)

File: `79.webp`

```text
A barred door of a small cell. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 80. Causing harm (باب الإضرار)

File: `80.webp`

```text
A palm tree leaning over a neighbor's garden wall. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 81. Funerals (باب ما جاء في الجنائز)

File: `81.webp`

```text
An empty bier with a white cloth. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 82. Washing the dead (باب ما جاء فِي غسل الميت)

File: `82.webp`

```text
A basin with lote leaves and camphor. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 83. Burial (ما جاء فِي الدفن)

File: `83.webp`

```text
A fresh grave with a palm stalk planted on it. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 84. Prayer over the martyr (باب الصلاة على الشهيد)

File: `84.webp`

```text
The slopes of Mount Uḥud at dusk. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 85. Prayer over children (ما جاء فِي الصلاة على الجنائز الأطفال)

File: `85.webp`

```text
A small bier with a little white cloth. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 86. Prayer over the martyrs (ما جاء في الصلاة على الشهداء)

File: `86.webp`

```text
Graves at the foot of Uḥud. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 87. Clothing (ما جاء فِي اللباس)

File: `87.webp`

```text
Folded garments on a chest. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 88. Combing the hair (في الترجل)

File: `88.webp`

```text
A comb and a small jar of oil. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 89. Medicine (في الطب)

File: `89.webp`

```text
Herbs, black seed and honey on a tray. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 90. Knowledge (باب ما جاء فِي العلم)

File: `90.webp`

```text
Books beside a burning lamp. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 91. Foods (باب ما جاء في الأطعمة)

File: `91.webp`

```text
Bread, gourd and meat on a mat. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 92. Drinks (باب ما جاء في الأشربة)

File: `92.webp`

```text
Clay cups on a tray. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 93. Depilatory lime (nūra) (ما جاء في النورة)

File: `93.webp`

```text
A bowl of lime paste in a bathhouse. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 94. Covering oneself during the ritual bath (ما جاء في التستر عند الغسل)

File: `94.webp`

```text
A bathing cloth hanging on a screen. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 95. Etiquette (الأدب)

File: `95.webp`

```text
Sandals left at a doorway. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 96. First fruits (ما جاء في الباكورة)

File: `96.webp`

```text
The first ripe fruits of the season in a basket. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 97. One who passes by a leaning wall (ما جاء في من مر بحائط مائل)

File: `97.webp`

```text
A cracked, leaning wall over a narrow lane. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 98. What one says when told "labbayk" (ما جاء ما يقول إذا قيل له لبيك)

File: `98.webp`

```text
An open door with light and a waiting guest cushion. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 99. Blue eyes (ما جاء في الزرقة)

File: `99.webp`

```text
A blue glass vessel catching the light. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 100. Tribal partisanship and learning genealogy (ما جاء في العصبية وتعلم النسب)

File: `100.webp`

```text
A rolled genealogy scroll beside furled tribal banners. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 101. Consultation (ما جاء في المشورة)

File: `101.webp`

```text
A circle of cushions around a lamp. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 102. Kindness to parents (ما جاء في بر الوالدين)

File: `102.webp`

```text
Two old cushions with a bowl of milk. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 103. Asking permission to enter (ما جاء في الاستئذان)

File: `103.webp`

```text
A door with a curtain and an iron knocker. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 104. Supplication for the protected non-Muslim (dhimmī) (باب ما جاء في الدعاء للذمي)

File: `104.webp`

```text
A neighbor's lamp glowing through a window across a lane. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 105. Building (باب ما جاء في البناء)

File: `105.webp`

```text
A half-built mudbrick wall with tools. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 106. A document found lying in the road (باب في الكتاب ملقى في الطريق)

File: `106.webp`

```text
A folded paper lying lost on a dusty road. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 107. Basil (ما جاء في الريحان)

File: `107.webp`

```text
A sprig of sweet basil on a cloth. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 108. Reviling the world (ما جاء في سب الدنيا)

File: `108.webp`

```text
A gilded cup lying in the dust. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 109. Etiquette (باب الأدب)

File: `109.webp`

```text
A guest's place set with bread. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 110. Eschatological battles (malāḥim) (باب في الملاحم)

File: `110.webp`

```text
Banners on a distant plain under dark clouds. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 111. Rain (ما جاء في المطر)

File: `111.webp`

```text
Rain falling on a courtyard, puddles forming. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 112. A man who sees something that pleases him (باب الرجل يرى ما يعجبه)

File: `112.webp`

```text
A rose bush in full bloom in a garden. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 113. Innovations (bidaʿ) (باب في البدع)

File: `113.webp`

```text
A new path branching away from an old road. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```

#### 114. Omens (ṭiyara) (ما جاء في الطيرة)

File: `114.webp`

```text
A bird flying off over the desert. Setting: Basra and the early Hijaz, with mudbrick, palm wood and reed matting. Painted in rich oils with thick impasto and loose, visible brushstrokes, warm golden light and soft shadow, an earthy palette of ochre, umber and cream with dusky violet shadows against warm gold light. A quiet, text-free still life from the early Islamic world of the 7th to 9th century. No people or human figures, no faces or hands, no writing, letters, calligraphy or inscriptions, no modern objects. Portrait composition, 5:6 aspect ratio.
```


<a id="kitab-al-zuhd-of-abu-hatim-al-razi"></a>

## Kitāb al-Zuhd of Abū Ḥātim al-Rāzī

- Slug: `kitab-al-zuhd-abu-hatim-al-razi`
- Compiler: Abū Ḥātim al-Rāzī (d. 277 AH), Rayy
- Chapters: none (single-page reader). Hero only.

### Hero

Save as `public/images/hadith/covers/kitab-al-zuhd-abu-hatim-al-razi.webp` at 1400 x 788.

```text
An ascetic's bare room in Rayy at dawn. Through a small window on the right, snow-capped mountains and the distant cone of Damāvand. In the right foreground on a worn reed mat: a single clay water jug, a piece of dry bread on a cloth, a plain wool cloak, a closed notebook and a small lamp. Detailed oil painting with fine brushwork on softly aged canvas, warm lamp and window light against deep umber shadow. The left 40 percent of the frame falls into soft, nearly black shadow with no detail, leaving clean space for a title; every object and all of the light sit in the right 60 percent. No people or human figures, no writing, letters, calligraphy or inscriptions, no modern objects. Wide landscape composition, 16:9 aspect ratio.
```

