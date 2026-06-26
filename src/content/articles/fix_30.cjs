const fs = require('fs');

let content = fs.readFileSync('30-imam-abu-hanifa-false-attributions.mdx', 'utf-8');

// 1. Al-Albani Quote
const albaniRaw = `> First: He \\[Abu Hanifa\\] did not have a recorded creed.  
> Second: There is a book attributed to him called _Fiqh Al-Akbar_. Considering his early period (d. 150 AH), **he did not leave behind any books**, but he left behind students. The book attributed to him represents the views of those **_affiliated_ with Abu Hanifa.**
> 
> “Al-Fiqh al-Akbar is often attributed to Imam Abu Hanifa (may God have mercy on him), **but this attribution is not correct**."
> 
> _Al-Huda wa Al-Nur_ tape 52 & Jami' Turath al-Allama al-Albani fi al- 'Aqidah al-Nu'man Center Edition`;

const albaniNew = `<QuoteBlock author="Al-Albani">

First: He [Abu Hanifa] did not have a recorded creed.
Second: There is a book attributed to him called _Fiqh Al-Akbar_. Considering his early period (d. 150 AH), **he did not leave behind any books**, but he left behind students. The book attributed to him represents the views of those **_affiliated_ with Abu Hanifa.**

"Al-Fiqh al-Akbar is often attributed to Imam Abu Hanifa (may God have mercy on him), **but this attribution is not correct**."

_Al-Huda wa Al-Nur_ tape 52 & Jami' Turath al-Allama al-Albani fi al- 'Aqidah al-Nu'man Center Edition

</QuoteBlock>`;

content = content.replace(albaniRaw, albaniNew);

// 2. Kashmiri Quote
const kashmiriRaw = `"Know that the discussion of increase and decrease is not from the writings of the Great Imam (Abu Hanifa), **but it was later added to it.** This is because no authentic narration has been found from him stating it explicitly. As for what is attributed to him in _Fiqh al-Akbar_ and other writings, it is not from his own authorship but rather from the works of his students. Some of them expressed it in a way that suggests it was dictated by the Imam, while others merely attributed it to him. **However, its attribution to him is not accurate.**

**I have seen several copies of _Fiqh al-Akbar_, all differing in wording and content.** Likewise, the works **_Al-‘Alim wal-Muta‘allim_** and **_Ar-Risalah_,** both shorter and longer versions, contain various differences. Thus, **they cannot be definitively attributed to the Imam, but the correct view is that they are not his own writings.**"`;

const kashmiriNew = `<QuoteBlock author="Anwar Shāh Kashmīrī">

"Know that the discussion of increase and decrease is not from the writings of the Great Imam (Abu Hanifa), **but it was later added to it.** This is because no authentic narration has been found from him stating it explicitly. As for what is attributed to him in _Fiqh al-Akbar_ and other writings, it is not from his own authorship but rather from the works of his students. Some of them expressed it in a way that suggests it was dictated by the Imam, while others merely attributed it to him. **However, its attribution to him is not accurate.**

**I have seen several copies of _Fiqh al-Akbar_, all differing in wording and content.** Likewise, the works **_Al-‘Alim wal-Muta‘allim_** and **_Ar-Risalah_,** both shorter and longer versions, contain various differences. Thus, **they cannot be definitively attributed to the Imam, but the correct view is that they are not his own writings.**"

</QuoteBlock>`;

content = content.replace(kashmiriRaw, kashmiriNew);

// 3. Fix Imam Ahmad Quote block that contains commentary
const ahmadBlockRaw = `<QuoteBlock author="Imam Ahmad">

Imam Ahmad said in his letter to the people of Naysabur: **“Whoever claims the letters of the Arabic alphabet are created is a disbeliever** since he has taken the path of the people of innovation.”

[](https://x.com/sayfullahhhh/status/1882543782815769077/photo/1)

On the other hand, Imam Abu Hanifa, whose teachings are foundational to the Hanafi school, supported the belief in God's timeless actions and uncreated Speech (assuming Fiqh Al-Akbar is legitimately his). This sharp disagreement between the two imams forces their madhab followers into the difficult position of having to choose between them, especially if they consider _**al-Fiqh al-Akbar**_ to be an authentic reflection of Imam Abu Hanifa's theology:

</QuoteBlock>`;

const ahmadBlockNew = `<QuoteBlock author="Imam Ahmad">

Imam Ahmad said in his letter to the people of Naysabur: **“Whoever claims the letters of the Arabic alphabet are created is a disbeliever** since he has taken the path of the people of innovation.”

</QuoteBlock>

On the other hand, Imam Abu Hanifa, whose teachings are foundational to the Hanafi school, supported the belief in God's timeless actions and uncreated Speech (assuming Fiqh Al-Akbar is legitimately his). This sharp disagreement between the two imams forces their madhab followers into the difficult position of having to choose between them, especially if they consider _**al-Fiqh al-Akbar**_ to be an authentic reflection of Imam Abu Hanifa's theology:`;

content = content.replace(ahmadBlockRaw, ahmadBlockNew);

// 4. Hasan b Ziyad quote
const hasanRaw = `> It is narrated from al-Ḥasan b. Ziyād, may God have mercy on him, that he said: **Ḥammād b. Abī Ḥanīfa** and I went to Dāwūd al-Ṭāʾī and something was mentioned, such that Dāwūd said to Ḥammād,
> 
> “O Abū Ismāʿīl, whenever a theologian (mutakallim) speaks about something, he hopes that he will be safe from it. Be warned against speaking about the Quran, except that which God, Most High, has said \\[in it\\]. **I heard your father—that is, Abū Ḥanīfa—say, ‘God has let us know that it is his speech, so whoever takes from what God has informed him has grasped the firmest hand-hold (fa-qad istamsaka bi-l-ʿurwa al-wuthq). Is there, after grasping the firmest hand-hold, anything but falling into perdition?’”** Ḥammād then said, **“May God reward you friend, how well you speak!”**
> 
> Al-Ustawāʾī, Kitb al-Iʿtiqd, 167.`;

const hasanNew = `<QuoteBlock author="al-Ḥasan b. Ziyād (Al-Ustawāʾī)">

It is narrated from al-Ḥasan b. Ziyād, may God have mercy on him, that he said: **Ḥammād b. Abī Ḥanīfa** and I went to Dāwūd al-Ṭāʾī and something was mentioned, such that Dāwūd said to Ḥammād,

“O Abū Ismāʿīl, whenever a theologian (mutakallim) speaks about something, he hopes that he will be safe from it. Be warned against speaking about the Quran, except that which God, Most High, has said [in it]. **I heard your father—that is, Abū Ḥanīfa—say, ‘God has let us know that it is his speech, so whoever takes from what God has informed him has grasped the firmest hand-hold (fa-qad istamsaka bi-l-ʿurwa al-wuthq). Is there, after grasping the firmest hand-hold, anything but falling into perdition?’”** Ḥammād then said, **“May God reward you friend, how well you speak!”**

Al-Ustawāʾī, Kitb al-Iʿtiqd, 167.

</QuoteBlock>`;

content = content.replace(hasanRaw, hasanNew);

// 5. Harvey quote
const harveyRaw = `> The span between the **sixth/twelfth** and early **eighth/fourteenth** centuries was pivotal for the consolidation of the distinctive tradition of Hanafi theology in Transoxiana that was later known as the Maturidi school. In this section I argue that though Abū Ḥanifa is acknowledged as a key figure in the genealogy of the school and his written theological legacy is cited to varying degrees by its major proponents, **the creed al-Fiqh al-akbar II does not make an appearance until it is quoted by ʿAbd al-ʿAzīz al-Bukhārī (§4), as part of an emerging genre of Hanafi uṣl al-fiqh commentaries**.
> 
> Mistaken Identity: An Investigation into Abū Ḥanīfa’s  
> al-Fiqh al-akbar (page 9)`;

const harveyNew = `<QuoteBlock author="Dr. Ramon Harvey">

The span between the **sixth/twelfth** and early **eighth/fourteenth** centuries was pivotal for the consolidation of the distinctive tradition of Hanafi theology in Transoxiana that was later known as the Maturidi school. In this section I argue that though Abū Ḥanifa is acknowledged as a key figure in the genealogy of the school and his written theological legacy is cited to varying degrees by its major proponents, **the creed al-Fiqh al-akbar II does not make an appearance until it is quoted by ʿAbd al-ʿAzīz al-Bukhārī (§4), as part of an emerging genre of Hanafi uṣl al-fiqh commentaries**.

Mistaken Identity: An Investigation into Abū Ḥanīfa’s
al-Fiqh al-akbar (page 9)

</QuoteBlock>`;

content = content.replace(harveyRaw, harveyNew);

// 6. Dhahabi quote
const dhahabiRaw = `"ألّف مسندًا للإمام أبي حنيفة وبذل فيه جهدًا كبيرًا، ولكنّه يحتوي على أوابد لم يتفوه بها الإمام، ونُسبت إليه خطأ من قبل أبي محمد. كما كتب كتابًا بعنوان "وهم الطبقة الظلمة على أبي حنيفة"، ولكنني لم أره. وكان يُعتبر شيخ المذهب الحنفي فيما وراء النهر." **"Siyar A‘lam al-Nubala’"** by **al-Dhahabi (Shams al-Din Muhammad ibn Ahmad ibn ‘Uthman al-Dhahabi)**, **volume 15, page 424**.

**Translation:** "He authored a Musnad of Imam Abu Hanifa and put great effort into it. **However, it contains peculiarities (awābid) that were not actually said by the Imam, which were mistakenly attributed to him by Abu Muhammad.** He also wrote a book titled “The Errors of the Oppressive Class Against Abu Hanifa,” though I have not seen it. He was considered the Sheikh of the Hanafi school in Transoxiana (Ma Wara’ al-Nahr)."`;

const dhahabiNew = `<QuoteBlock author="al-Dhahabi (Siyar A‘lam al-Nubala’)">

"ألّف مسندًا للإمام أبي حنيفة وبذل فيه جهدًا كبيرًا، ولكنّه يحتوي على أوابد لم يتفوه بها الإمام، ونُسبت إليه خطأ من قبل أبي محمد. كما كتب كتابًا بعنوان "وهم الطبقة الظلمة على أبي حنيفة"، ولكنني لم أره. وكان يُعتبر شيخ المذهب الحنفي فيما وراء النهر."

**Siyar A‘lam al-Nubala’**, volume 15, page 424.

**Translation:** "He authored a Musnad of Imam Abu Hanifa and put great effort into it. **However, it contains peculiarities (awābid) that were not actually said by the Imam, which were mistakenly attributed to him by Abu Muhammad.** He also wrote a book titled “The Errors of the Oppressive Class Against Abu Hanifa,” though I have not seen it. He was considered the Sheikh of the Hanafi school in Transoxiana (Ma Wara’ al-Nahr)."

</QuoteBlock>`;

content = content.replace(dhahabiRaw, dhahabiNew);

fs.writeFileSync('30-imam-abu-hanifa-false-attributions.mdx', content, 'utf-8');
console.log('Fixed quotes in 30');
