const fs = require('fs');

let content = fs.readFileSync('21-hadith-the-prophet-was-bewitched-by-a-jew.mdx', 'utf-8');

// 1. Table 1
const table1Raw = `**Narration**

**Arabic Matn**

**English Translation**

**Differences/Omissions/Additions**

**Context/Location**

**Ahmad 24237 (Yahya)**

حَدَّثَنَا يَحْيَى حَدَّثَنَا هِشَامٌ قَالَ حَدَّثَنِي أَبِي عَنْ عَائِشَةَ قَالَتْ سُحِرَ النَّبِيُّ ﷺ فَيُخَيَّلُ إِلَيْهِ أَنَّهُ قَدْ صَنَعَ شَيْئًا وَلَمْ يَصْنَعْهُ

**Yahya** narrated to us, **Hisham** narrated, he said: My father narrated to me from Aisha, who said: "The Prophet ﷺ was bewitched, and it was imagined to him that he had done something when he had not done it."

This narration is concise and does not include the extended story about the two men or the discovery of the magical materials in the well.

Shortest of the three narrations, reflecting an early concise form of the report.

**Ahmad 24348 (Hammad ibn Usama)**

حَدَّثَنَا حَمَّادُ بْنُ أُسَامَةَ قَالَ أَخْبَرَنَا هِشَامٌ عَنْ أَبِيهِ عَنْ عَائِشَةَ قَالَتْ سُحِرَ رَسُولُ اللهِ ﷺ حَتَّى أَنَّهُ لَيُخَيَّلُ لَهُ أَنَّهُ يَفْعَلُ الشَّيْءَ وَمَا يَفْعَلُهُ... \\[Full narration provided earlier\\]

**Hammad ibn Usama** narrated to us, **Hisham** narrated from his father from Aisha, who said: "The Messenger of Allah ﷺ was bewitched to the extent that it was imagined to him that he was doing something when he was not doing it... (extended narrative follows)."

Adds an elaborate narrative, including the two men, their conversation, the identification of Labid ibn al-A’sam, the location of the well, the Prophet’s visit to it, and the description of the water and palm trees.

Provides a detailed account, showing progression and embellishment compared to 24237.

**Ahmad 24300 (Ibn Numayr)**

حَدَّثَنَا ابْنُ نُمَيْرٍ حَدَّثَنَا هِشَامٌ عَنْ أَبِيهِ عَنْ عَائِشَةَ قَالَتْ سَحَرَ رَسُولَ اللهِ ﷺ يَهُودِيٌّ مِنْ يَهُودِ بَنِي زُرَيْقٍ يُقَالُ لَهُ لَبِيدُ بْنُ الْأَعْصَمِ... \\[Full narration provided earlier\\]

**Ibn Numayr** narrated to us, **Hisham** narrated from his father from Aisha, who said: "A Jew from the Jews of Banu Zurayq, named Labid ibn al-A’sam, bewitched the Messenger of Allah ﷺ... (extended narrative follows)."

Similar to 24348 but includes slight variations in wording (e.g., specifying Labid as "a Jew from Banu Zurayq"). Adds final detail about the well being buried on the Prophet’s orders.

minor linguistic differences and additional details compared to 24348.`;

const table1New = `| Narration | Arabic Matn | English Translation | Differences/Omissions/Additions | Context/Location |
|---|---|---|---|---|
| **Ahmad 24237 (Yahya)** | حَدَّثَنَا يَحْيَى حَدَّثَنَا هِشَامٌ قَالَ حَدَّثَنِي أَبِي عَنْ عَائِشَةَ قَالَتْ سُحِرَ النَّبِيُّ ﷺ فَيُخَيَّلُ إِلَيْهِ أَنَّهُ قَدْ صَنَعَ شَيْئًا وَلَمْ يَصْنَعْهُ | **Yahya** narrated to us, **Hisham** narrated, he said: My father narrated to me from Aisha, who said: "The Prophet ﷺ was bewitched, and it was imagined to him that he had done something when he had not done it." | This narration is concise and does not include the extended story about the two men or the discovery of the magical materials in the well. | Shortest of the three narrations, reflecting an early concise form of the report. |
| **Ahmad 24348 (Hammad ibn Usama)** | حَدَّثَنَا حَمَّادُ بْنُ أُسَامَةَ قَالَ أَخْبَرَنَا هِشَامٌ عَنْ أَبِيهِ عَنْ عَائِشَةَ قَالَتْ سُحِرَ رَسُولُ اللهِ ﷺ حَتَّى أَنَّهُ لَيُخَيَّلُ لَهُ أَنَّهُ يَفْعَلُ الشَّيْءَ وَمَا يَفْعَلُهُ... \\[Full narration provided earlier\\] | **Hammad ibn Usama** narrated to us, **Hisham** narrated from his father from Aisha, who said: "The Messenger of Allah ﷺ was bewitched to the extent that it was imagined to him that he was doing something when he was not doing it... (extended narrative follows)." | Adds an elaborate narrative, including the two men, their conversation, the identification of Labid ibn al-A’sam, the location of the well, the Prophet’s visit to it, and the description of the water and palm trees. | Provides a detailed account, showing progression and embellishment compared to 24237. |
| **Ahmad 24300 (Ibn Numayr)** | حَدَّثَنَا ابْنُ نُمَيْرٍ حَدَّثَنَا هِشَامٌ عَنْ أَبِيهِ عَنْ عَائِشَةَ قَالَتْ سَحَرَ رَسُولَ اللهِ ﷺ يَهُودِيٌّ مِنْ يَهُودِ بَنِي زُرَيْقٍ يُقَالُ لَهُ لَبِيدُ بْنُ الْأَعْصَمِ... \\[Full narration provided earlier\\] | **Ibn Numayr** narrated to us, **Hisham** narrated from his father from Aisha, who said: "A Jew from the Jews of Banu Zurayq, named Labid ibn al-A’sam, bewitched the Messenger of Allah ﷺ... (extended narrative follows)." | Similar to 24348 but includes slight variations in wording (e.g., specifying Labid as "a Jew from Banu Zurayq"). Adds final detail about the well being buried on the Prophet’s orders. | minor linguistic differences and additional details compared to 24348. |`;

content = content.replace(table1Raw, table1New);

// 2. Table 2
const table2Raw = `**Critic**

**Criticism**

**Source**

Malik ibn Anas

Did not approve of Hisham, especially his narrations for the people of Iraq. Criticized him for changing the way he narrated reports over his three visits to Kufa.

_Tahdhib al-Tahdhib_ (4/275)

Ya'qub ibn Shaybah

Reliable and trustworthy, but after moving to Iraq, he expanded his narrations from his father, which was denounced by the people of his region. His leniency was in transmitting from his father reports he had heard from others about his father.

_Tahdhib al-Tahdhib_ (4/275)

Ibn Kharrash

Stated that Malik did not approve of Hisham’s narrations for the people of Iraq. Highlighted changes in Hisham's transmission style over his three visits to Kufa, evolving from "my father told me" to "from my father, from Aisha."

_Tahdhib al-Tahdhib_ (4/275)

Malik ibn Anas (expanded)

Criticized him specifically for narrating to the Iraqis in ways that were not consistent with his usual standards when in Medina.

_Tahdhib al-Tahdhib_ (4/275)\\*`;

const table2New = `| Critic | Criticism | Source |
|---|---|---|
| Malik ibn Anas | Did not approve of Hisham, especially his narrations for the people of Iraq. Criticized him for changing the way he narrated reports over his three visits to Kufa. | _Tahdhib al-Tahdhib_ (4/275) |
| Ya'qub ibn Shaybah | Reliable and trustworthy, but after moving to Iraq, he expanded his narrations from his father, which was denounced by the people of his region. His leniency was in transmitting from his father reports he had heard from others about his father. | _Tahdhib al-Tahdhib_ (4/275) |
| Ibn Kharrash | Stated that Malik did not approve of Hisham’s narrations for the people of Iraq. Highlighted changes in Hisham's transmission style over his three visits to Kufa, evolving from "my father told me" to "from my father, from Aisha." | _Tahdhib al-Tahdhib_ (4/275) |
| Malik ibn Anas (expanded) | Criticized him specifically for narrating to the Iraqis in ways that were not consistent with his usual standards when in Medina. | _Tahdhib al-Tahdhib_ (4/275)\\* |`;

content = content.replace(table2Raw, table2New);

// 3. Table 3
const table3Raw = `**Hadith Source**

**Text**

**Omissions/Changes/Notes**

**Ahmad 24300**

حَدَّثَنَا ابْنُ نُمَيْرٍ حَدَّثَنَا هِشَامٌ عَنْ أَبِيهِ عَنْ عَائِشَةَ قَالَتْ سَحَرَ رَسُولَ اللهِ ﷺ يَهُودِيٌّ مِنْ يَهُودِ بَنِي زُرَيْقٍ يُقَالُ لَهُ لَبِيدُ بْنُ الْأَعْصَمِ حَتَّى كَانَ رَسُولُ اللهِ ﷺ يُخَيَّلُ إِلَيْهِ أَنْ يَفْعَلَ الشَّيْءَ وَمَا يَفْعَلُهُ...فَأَمَرَ بِهَا فَدُفِنَتْ

Detailed account of the Prophet being affected by magic, including the identity of the Jewish man, the supernatural visions experienced by the Prophet, the location of the magic (in a well), and the instructions to bury the magical object. Also includes Prophet's reluctance to publicize the source of his affliction.

**Abu Muawiyah (Tabarani 5016)**

حَدَّثَنَا عُبَيْدُ بْنُ غَنَّامٍ ثنا أَبُو بَكْرِ بْنُ أَبِي شَيْبَةَ ثنا أَبُو مُعَاوِيَةَ عَنِ الْأَعْمَشِ عَنْ يَزِيدِ بْنِ حَيَّانَ عَنْ زَيْدِ بْنِ أَرْقَمَ قَالَ سَحَرَ النَّبِيَّ ﷺ رَجُلٌ مِنَ الْيَهُودِ فَاشْتَكَى لِذَلِكَ أَيَّامًا فَأَتَاهُ جِبْرِيلُ ﷺ فَقَالَ إِنَّ رَجُلًا مِنَ الْيَهُودِ سَحَرَكَ...

Brief version of the story, stating the Prophet was affected by magic, **but without specific mention of the name of the magician or the location of the magic.** The healing process is more focused on the effect of the untying of knots. **No mention of the Prophet's internal visions or the magical object being buried.** **_Gabriel & Ali are mentioned as being apart of helping the prophet which is mentioned nowhere else but these Abu Muawiyah variants._**

**Abu Muawiyah (Nasa'i 4080)**

أَخْبَرَنَا هَنَّادُ بْنُ السَّرِيِّ عَنْ أَبِي مُعَاوِيَةَ عَنِ الْأَعْمَشِ عَنْ يَزِيدِ بْنِ حَيَّانَ عَنْ زَيْدِ بْنِ أَرْقَمَ قَالَ سَحَرَ النَّبِيَّ ﷺ رَجُلٌ مِنْ الْيَهُودِ فَاشْتَكَى لِذَلِكَ أَيَّامًا فَأَتَاهُ جِبْرِيلُ عَلَيْهِ السَّلَامُ فَقَالَ إِنَّ رَجُلًا مِنَ الْيَهُودِ سَحَرَكَ عَقَدَ لَكَ عُقَدًا فِي بِئْرِ كَذَا وَكَذَا...فَمَا ذَكَرَ ذَلِكَ لِذَلِكَ الْيَهُودِيِّ وَلاَ رَآهُ فِي وَجْهِهِ قَطُّ

Similar to the Tabarani version, this one is also brief and **lacks the detailed specifics of the magic ritual.** It includes the Prophet being affected and the healing process, but **omits specifics about the object used and the Prophet’s internal experiences. The Jewish magician’s name and the specific location are not mentioned.** **_Gabriel & Ali are mentioned as being apart of helping the prophet which is mentioned nowhere else but these Abu Muawiyah variants._**

**Abu Muawiyah (Nasai Al-Kubra 3529)**

Similar to the previous Nasa'i version in style and content. The magic is acknowledged, and Gabriel’s role is highlighted, but it lacks specific details regarding the type of magic, the object used, and the emotional and psychological impact on the Prophet. The incident is again recounted in a more concise manner without the lengthy narrative of the burial of the magical object.

**This version omits details about the Prophet’s specific visions and the instructions to bury the object.** The only focus is on the recovery process after Gabriel’s intervention, with less emphasis on the Prophet’s internal suffering or any details that could implicate the Jewish magician or the cause of the affliction in-depth. **_Gabriel & Ali are mentioned as being apart of helping the prophet which is mentioned nowhere else but these Abu Muawiyah variants._**`;

const table3New = `| Hadith Source | Text | Omissions/Changes/Notes |
|---|---|---|
| **Ahmad 24300** | حَدَّثَنَا ابْنُ نُمَيْرٍ حَدَّثَنَا هِشَامٌ عَنْ أَبِيهِ عَنْ عَائِشَةَ قَالَتْ سَحَرَ رَسُولَ اللهِ ﷺ يَهُودِيٌّ مِنْ يَهُودِ بَنِي زُرَيْقٍ يُقَالُ لَهُ لَبِيدُ بْنُ الْأَعْصَمِ حَتَّى كَانَ رَسُولُ اللهِ ﷺ يُخَيَّلُ إِلَيْهِ أَنْ يَفْعَلَ الشَّيْءَ وَمَا يَفْعَلُهُ...فَأَمَرَ بِهَا فَدُفِنَتْ | Detailed account of the Prophet being affected by magic, including the identity of the Jewish man, the supernatural visions experienced by the Prophet, the location of the magic (in a well), and the instructions to bury the magical object. Also includes Prophet's reluctance to publicize the source of his affliction. |
| **Abu Muawiyah (Tabarani 5016)** | حَدَّثَنَا عُبَيْدُ بْنُ غَنَّامٍ ثنا أَبُو بَكْرِ بْنُ أَبِي شَيْبَةَ ثنا أَبُو مُعَاوِيَةَ عَنِ الْأَعْمَشِ عَنْ يَزِيدِ بْنِ حَيَّانَ عَنْ زَيْدِ بْنِ أَرْقَمَ قَالَ سَحَرَ النَّبِيَّ ﷺ رَجُلٌ مِنَ الْيَهُودِ فَاشْتَكَى لِذَلِكَ أَيَّامًا فَأَتَاهُ جِبْرِيلُ ﷺ فَقَالَ إِنَّ رَجُلًا مِنَ الْيَهُودِ سَحَرَكَ... | Brief version of the story, stating the Prophet was affected by magic, **but without specific mention of the name of the magician or the location of the magic.** The healing process is more focused on the effect of the untying of knots. **No mention of the Prophet's internal visions or the magical object being buried.** **_Gabriel & Ali are mentioned as being apart of helping the prophet which is mentioned nowhere else but these Abu Muawiyah variants._** |
| **Abu Muawiyah (Nasa'i 4080)** | أَخْبَرَنَا هَنَّادُ بْنُ السَّرِيِّ عَنْ أَبِي مُعَاوِيَةَ عَنِ الْأَعْمَشِ عَنْ يَزِيدِ بْنِ حَيَّانَ عَنْ زَيْدِ بْنِ أَرْقَمَ قَالَ سَحَرَ النَّبِيَّ ﷺ رَجُلٌ مِنْ الْيَهُودِ فَاشْتَكَى لِذَلِكَ أَيَّامًا فَأَتَاهُ جِبْرِيلُ عَلَيْهِ السَّلَامُ فَقَالَ إِنَّ رَجُلًا مِنَ الْيَهُودِ سَحَرَكَ عَقَدَ لَكَ عُقَدًا فِي بِئْرِ كَذَا وَكَذَا...فَمَا ذَكَرَ ذَلِكَ لِذَلِكَ الْيَهُودِيِّ وَلاَ رَآهُ فِي وَجْهِهِ قَطُّ | Similar to the Tabarani version, this one is also brief and **lacks the detailed specifics of the magic ritual.** It includes the Prophet being affected and the healing process, but **omits specifics about the object used and the Prophet’s internal experiences. The Jewish magician’s name and the specific location are not mentioned.** **_Gabriel & Ali are mentioned as being apart of helping the prophet which is mentioned nowhere else but these Abu Muawiyah variants._** |
| **Abu Muawiyah (Nasai Al-Kubra 3529)** | Similar to the previous Nasa'i version in style and content. The magic is acknowledged, and Gabriel’s role is highlighted, but it lacks specific details regarding the type of magic, the object used, and the emotional and psychological impact on the Prophet. The incident is again recounted in a more concise manner without the lengthy narrative of the burial of the magical object. | **This version omits details about the Prophet’s specific visions and the instructions to bury the object.** The only focus is on the recovery process after Gabriel’s intervention, with less emphasis on the Prophet’s internal suffering or any details that could implicate the Jewish magician or the cause of the affliction in-depth. **_Gabriel & Ali are mentioned as being apart of helping the prophet which is mentioned nowhere else but these Abu Muawiyah variants._** |`;

content = content.replace(table3Raw, table3New);

// 4. Standalone Hadiths
const hadithBlockRaw = `**Ahmad: 19267 –** Abu Muawiyah narrated to us, from al-A’mash, from Yazid ibn Hayan, from Zayd ibn Arqam, who said:

\\["A man from the Jews bewitched the Prophet ﷺ. He complained about this for several days. **Then, Jibril (Gabriel) came to him and said: 'A man from the Jews has bewitched you. He tied knots for you in such and such a well.'** So, the Prophet ﷺ sent someone to retrieve the knots. **The Messenger of Allah ﷺ sent Ali,** who extracted them, and brought them back. He untied them, and the Prophet ﷺ stood up as though he had been released from bonds. He never mentioned the Jewish man nor saw him again until he passed away."\\](https://hadithunlocked.com/ahmad:19267)

\\---

\\[Ahmad: 24300 – **Ibn Numayr - Hisham ibn Urwa**\\](https://hadithunlocked.com/ahmad:24300)

"**A Jewish man from the Banu Zurayq, named Labid ibn al-A’sam, bewitched the Messenger of Allah ﷺ**. So much so that the Messenger of Allah ﷺ would imagine that he had done something, but he had not. A day or night came when the Messenger of Allah ﷺ called me, and then he called again, and said: 'O Aisha, I feel that Allah has answered my request regarding what I sought His judgment on. **Two men came to me and one sat at my head and the other at my feet. The one by my head said to the one by my feet, "What is wrong with the man?" He replied, "He is bewitched." "Who has bewitched him?" "Labid ibn al-A’sam." "What did he use?" "A comb and some hair, and the pollen of a male date palm." "Where is it?" "In the well of Arwan."'** Aisha said: 'The Messenger of Allah ﷺ went to the well with some of his companions, then came back and said: "O Aisha, the water looks like the liquid of henna, and its date palms look like the heads of devils." I asked: "O Messenger of Allah, why didn’t you burn it?" He replied: "I have been healed by Allah, and I did not want to stir up evil among the people." Then he ordered it to be buried.'"`;

const hadithBlockNew = `<HadithBlock
  source="Ahmad: 19267"
  isnad="Abu Muawiyah narrated to us, from al-A’mash, from Yazid ibn Hayan, from Zayd ibn Arqam, who said:"
  translation="A man from the Jews bewitched the Prophet ﷺ. He complained about this for several days. **Then, Jibril (Gabriel) came to him and said: 'A man from the Jews has bewitched you. He tied knots for you in such and such a well.'** So, the Prophet ﷺ sent someone to retrieve the knots. **The Messenger of Allah ﷺ sent Ali,** who extracted them, and brought them back. He untied them, and the Prophet ﷺ stood up as though he had been released from bonds. He never mentioned the Jewish man nor saw him again until he passed away."
  url="https://hadithunlocked.com/ahmad:19267"
/>

<HadithBlock
  source="Ahmad: 24300"
  isnad="Ibn Numayr - Hisham ibn Urwa"
  translation="**A Jewish man from the Banu Zurayq, named Labid ibn al-A’sam, bewitched the Messenger of Allah ﷺ**. So much so that the Messenger of Allah ﷺ would imagine that he had done something, but he had not. A day or night came when the Messenger of Allah ﷺ called me, and then he called again, and said: 'O Aisha, I feel that Allah has answered my request regarding what I sought His judgment on. **Two men came to me and one sat at my head and the other at my feet. The one by my head said to the one by my feet, \\"What is wrong with the man?\\" He replied, \\"He is bewitched.\\" \\"Who has bewitched him?\\" \\"Labid ibn al-A’sam.\\" \\"What did he use?\\" \\"A comb and some hair, and the pollen of a male date palm.\\" \\"Where is it?\\" \\"In the well of Arwan.\\"'** Aisha said: 'The Messenger of Allah ﷺ went to the well with some of his companions, then came back and said: \\"O Aisha, the water looks like the liquid of henna, and its date palms look like the heads of devils.\\" I asked: \\"O Messenger of Allah, why didn’t you burn it?\\" He replied: \\"I have been healed by Allah, and I did not want to stir up evil among the people.\\" Then he ordered it to be buried.'"
  url="https://hadithunlocked.com/ahmad:24300"
/>`;

content = content.replace(hadithBlockRaw, hadithBlockNew);

fs.writeFileSync('21-hadith-the-prophet-was-bewitched-by-a-jew.mdx', content, 'utf-8');
console.log('Fixed everything');
