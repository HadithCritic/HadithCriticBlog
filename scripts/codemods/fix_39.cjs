const fs = require('fs');

let content = fs.readFileSync('39-hisham-ibn-urwa-the-man-who-stopped-menstruating-women-from-praying.mdx', 'utf-8');

// 1. Jonathan Brown Quote
const brownRaw = `According to the book “_Hadith Muhammad’s Legacy in the Medieval and Modern World,_” by Jonathan Brown, it states:

> The version of the Muwatta that became famous in North Africa and Andalusia contains 1,720 reports. Of these, however, only 527 are Prophetic hadiths; 613 are statements of the Companions, 285 are from Successors, and the rest are Malik’s own opinions.`;

const brownNew = `According to the book “_Hadith Muhammad’s Legacy in the Medieval and Modern World,_” by Jonathan Brown, it states:

<QuoteBlock author="Jonathan Brown">

The version of the Muwatta that became famous in North Africa and Andalusia contains 1,720 reports. Of these, however, only 527 are Prophetic hadiths; 613 are statements of the Companions, 285 are from Successors, and the rest are Malik’s own opinions.

</QuoteBlock>`;
content = content.replace(brownRaw, brownNew);

// 2. Muwatta Hadith 106 (Hisham's Narration)
const muwatta106Raw = `> Yahya related to me from Malik from **Hisham ibn Urwa** from his father that A'isha, the wife of the Prophet, may Allah bless him and grant him peace, said,
> 
> "Fatima bint Abu Hubaysh said, 'Messenger of Allah, **I never become pure - am I permitted to pray?**' The Messenger of Allah, may Allah bless him and grant him peace, said, 'That is a vein, not menstruation. **So when your period approaches, leave off from the prayer,** and when its grip leaves, wash the blood from yourself and pray.' "
> 
> **(Muwatta, Book 2, Hadith 106)**`;

const muwatta106New = `<HadithBlock
  source="Muwatta, Book 2, Hadith 106"
  isnad="Yahya related to me from Malik from **Hisham ibn Urwa** from his father that A'isha, the wife of the Prophet, may Allah bless him and grant him peace, said,"
  translation="Fatima bint Abu Hubaysh said, 'Messenger of Allah, **I never become pure - am I permitted to pray?**' The Messenger of Allah, may Allah bless him and grant him peace, said, 'That is a vein, not menstruation. **So when your period approaches, leave off from the prayer,** and when its grip leaves, wash the blood from yourself and pray.'"
/>`;
content = content.replace(muwatta106Raw, muwatta106New);

// 3. Muwatta Hadith 107 (Nafi's Narration)
const muwatta107Raw = `> Yahya related to me from Malik from **Nafi** from Sulayman ibn Yasar from Umm Salama, the wife of the Prophet, may Allah bless him and grant him peace, that
> 
> a certain woman in the time of the Messenger of Allah, may Allah bless him and grant him peace, used to bleed profusely, so Umm Salama consulted the Messenger of Allah, may Allah bless him and grant him peace, for her, and he said, "**She should calculate the number of nights and days a month that she used to menstruate before it started happening, and she should leave off from prayerfor that much of the month**. When she has completed that she should do ghusl, bind her private parts with a cloth, and then pray."
> 
> **(Muwatta, Book 2, Hadith 107)**`;

const muwatta107New = `<HadithBlock
  source="Muwatta, Book 2, Hadith 107"
  isnad="Yahya related to me from Malik from **Nafi** from Sulayman ibn Yasar from Umm Salama, the wife of the Prophet, may Allah bless him and grant him peace, that"
  translation="a certain woman in the time of the Messenger of Allah, may Allah bless him and grant him peace, used to bleed profusely, so Umm Salama consulted the Messenger of Allah, may Allah bless him and grant him peace, for her, and he said, '**She should calculate the number of nights and days a month that she used to menstruate before it started happening, and she should leave off from prayer for that much of the month**. When she has completed that she should do ghusl, bind her private parts with a cloth, and then pray.'"
/>`;
content = content.replace(muwatta107Raw, muwatta107New);

// 4. Muwatta Hadith 102
const muwatta102Raw = `> Yahya related to me from **Malik** that he had heard that **A'isha**, the wife of the Prophet, may Allah bless him and grant him peace, said
> 
> that a pregnant woman who noticed bleeding left off from prayer.
> 
> **(Muwatta, Book 2, Hadith 102)**`;

const muwatta102New = `<HadithBlock
  source="Muwatta, Book 2, Hadith 102"
  isnad="Yahya related to me from **Malik** that he had heard that **A'isha**, the wife of the Prophet, may Allah bless him and grant him peace, said"
  translation="that a pregnant woman who noticed bleeding left off from prayer."
/>`;
content = content.replace(muwatta102Raw, muwatta102New);

// 5. Malik's Position
const malikRaw = `> Yahya related to me from Malik from **Hisham ibn Urwa** that his father said, "A woman who bleeds as if menstruating only has to do one ghusl, and then after that she does wudu for each prayer."
> 
> Yahya said that Malik said, "**The position with us is that when a woman who bleeds as if menstruating starts to do the prayer again,** her husband can have sexual intercourse with her. Similarly, if a woman who has given birth sees blood after she has reached the fullest extent that bleeding normally restrains women, her husband can have sexual intercourse with her and she is in the same position as a woman who bleeds as if menstruating."
> 
> Yahya said that Malik said, "**The position with us concerning a woman who bleeds as if menstruating is founded on the hadith of Hisham ibn Urwa from his father, and it is what I prefer the most of what I have heard about the matter.**"`;

const malikNew = `<QuoteBlock author="Imam Malik (Muwatta)">

Yahya related to me from Malik from **Hisham ibn Urwa** that his father said, "A woman who bleeds as if menstruating only has to do one ghusl, and then after that she does wudu for each prayer."

Yahya said that Malik said, "**The position with us is that when a woman who bleeds as if menstruating starts to do the prayer again,** her husband can have sexual intercourse with her. Similarly, if a woman who has given birth sees blood after she has reached the fullest extent that bleeding normally restrains women, her husband can have sexual intercourse with her and she is in the same position as a woman who bleeds as if menstruating."

Yahya said that Malik said, "**The position with us concerning a woman who bleeds as if menstruating is founded on the hadith of Hisham ibn Urwa from his father, and it is what I prefer the most of what I have heard about the matter.**"

</QuoteBlock>`;
content = content.replace(malikRaw, malikNew);

// 6. Bayhaqi
const bayhaqiRaw = `> Al-Bayhaqī (1576) – Abū Zakariyyā ibn Abī Isḥāq and Abū Bakr ibn al-Ḥasan both narrated to us, saying: Abū al-‘Abbās Muḥammad ibn Ya‘qūb narrated to us, saying: Muḥammad ibn ‘Abd Allāh ibn al-Ḥakam informed us, saying: Ibn Wahb narrated from Mālik.
> 
> Additionally, Abū Muḥammad ‘Abd Allāh ibn Yūsuf dictated to us, saying: Abū al-‘Abbās Muḥammad ibn Ya‘qūb narrated to us, saying: al-Rabī‘ ibn Sulaymān informed us, saying: **al-Shāfi‘ī narrated to us**, saying: Mālik narrated from Nāfi‘, the freed slave of Ibn ‘Umar, from Sulaymān ibn Yasār, from Umm Salama, the wife of the Prophet ﷺ, who said:
> 
> **"A woman used to have continuous bleeding during the time of the Messenger of Allah ﷺ, so Umm Salama sought a ruling for her from the Messenger of Allah ﷺ. He said: ‘She should determine the number of nights and days she used to menstruate each month before this condition affected her, and she should refrain from prayer for that period. After that time has passed, she should perform ghusl, wrap herself with a cloth, and then pray.’"**
> 
> The wording of **al-Shāfi‘ī’s** narration is: **"This is a well-known ḥadīth, which Mālik ibn Anas included in his _Muwaṭṭaʾ_ and which Abū Dāwūd recorded in his _Sunan_. However, Sulaymān ibn Yasār did not hear it directly from Umm Salama."**`;

const bayhaqiNew = `<HadithBlock
  source="Al-Bayhaqī (1576)"
  isnad="Abū Zakariyyā ibn Abī Isḥāq and Abū Bakr ibn al-Ḥasan both narrated to us, saying: Abū al-‘Abbās Muḥammad ibn Ya‘qūb narrated to us, saying: Muḥammad ibn ‘Abd Allāh ibn al-Ḥakam informed us, saying: Ibn Wahb narrated from Mālik. Additionally, Abū Muḥammad ‘Abd Allāh ibn Yūsuf dictated to us, saying: Abū al-‘Abbās Muḥammad ibn Ya‘qūb narrated to us, saying: al-Rabī‘ ibn Sulaymān informed us, saying: **al-Shāfi‘ī narrated to us**, saying: Mālik narrated from Nāfi‘, the freed slave of Ibn ‘Umar, from Sulaymān ibn Yasār, from Umm Salama, the wife of the Prophet ﷺ, who said:"
  translation="**'A woman used to have continuous bleeding during the time of the Messenger of Allah ﷺ, so Umm Salama sought a ruling for her from the Messenger of Allah ﷺ. He said: “She should determine the number of nights and days she used to menstruate each month before this condition affected her, and she should refrain from prayer for that period. After that time has passed, she should perform ghusl, wrap herself with a cloth, and then pray.”'**

The wording of **al-Shāfi‘ī’s** narration is: **'This is a well-known ḥadīth, which Mālik ibn Anas included in his Muwaṭṭaʾ and which Abū Dāwūd recorded in his Sunan. However, Sulaymān ibn Yasār did not hear it directly from Umm Salama.'**"
/>`;
content = content.replace(bayhaqiRaw, bayhaqiNew);

// 7. Ahmad Hadith
const ahmadRaw = `> **[ahmad:24538](https://hadithunlocked.com/ahmad:24538)** – Abū al-Mughīrah > al-Awzāʿī > **al-Zuhrī** > **ʿUrwah** \\> ʿAmrah b. ʿAbd al-Raḥman b. Saʿd b. Zurārah
> 
> 'Aishah the wife of the Prophet said: "**Umm Habibah Jahsh experienced prolonged non-menstrual bleeding for seven years** when she was married to 'Abdur-Rahman bin 'Awf. She complained about that to the Prophet and **the Prophet said: 'That is not menstruation, rather it is a vein, so when the time of your period comes, leave the prayer, and when it is over, take a bath and perform prayer.'"** 'Aishah said: "She used to bathe for every prayer and then perform the prayer. She used to sit in a washtub belonging to her sister Zainab bint Jahsh and the blood would turn the water red."`;

const ahmadNew = `<HadithBlock
  source="Ahmad 24538"
  isnad="Abū al-Mughīrah > al-Awzāʿī > **al-Zuhrī** > **ʿUrwah** > ʿAmrah b. ʿAbd al-Raḥman b. Saʿd b. Zurārah"
  translation="'Aishah the wife of the Prophet said: '**Umm Habibah Jahsh experienced prolonged non-menstrual bleeding for seven years** when she was married to 'Abdur-Rahman bin 'Awf. She complained about that to the Prophet and **the Prophet said: “That is not menstruation, rather it is a vein, so when the time of your period comes, leave the prayer, and when it is over, take a bath and perform prayer.”**' 'Aishah said: 'She used to bathe for every prayer and then perform the prayer. She used to sit in a washtub belonging to her sister Zainab bint Jahsh and the blood would turn the water red.'"
  url="https://hadithunlocked.com/ahmad:24538"
/>`;
content = content.replace(ahmadRaw, ahmadNew);

// 8. Darimi Hadith
const darimiRaw = `> **[darimi:806](https://hadithunlocked.com/darimi:806)** – Ḥajjāj b. Minhāl > Ḥammād b. Salamah > **Hishām b. ʿUrwah** from **his father** > ʿĀʾishah > Fāṭimah b. Abū Ḥubaysh
> 
> "O Messenger of Allah, **I \\[Fatima b. Abu Hubaysh\\] am a woman who experiences istihadah (continuous abnormal bleeding)**, should I stop praying?" **He said: "No, this is just a vein and not menstruation. So when your period comes, then leave prayers. And when the period has ended, wash away the blood from yourself, perform ablution, and pray."** Hisham said: "My father used to say that she should first perform the initial washing, and then whatever comes after that, she is considered pure and can pray."`;

const darimiNew = `<HadithBlock
  source="Darimi 806"
  isnad="Ḥajjāj b. Minhāl > Ḥammād b. Salamah > **Hishām b. ʿUrwah** from **his father** > ʿĀʾishah > Fāṭimah b. Abū Ḥubaysh"
  translation="'O Messenger of Allah, **I [Fatima b. Abu Hubaysh] am a woman who experiences istihadah (continuous abnormal bleeding)**, should I stop praying?' **He said: “No, this is just a vein and not menstruation. So when your period comes, then leave prayers. And when the period has ended, wash away the blood from yourself, perform ablution, and pray.”** Hisham said: 'My father used to say that she should first perform the initial washing, and then whatever comes after that, she is considered pure and can pray.'"
  url="https://hadithunlocked.com/darimi:806"
/>`;
content = content.replace(darimiRaw, darimiNew);

fs.writeFileSync('39-hisham-ibn-urwa-the-man-who-stopped-menstruating-women-from-praying.mdx', content, 'utf-8');
console.log('Fixed quotes in 39');
