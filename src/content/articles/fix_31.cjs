const fs = require('fs');

let content = fs.readFileSync('31-the-double-life-of-ʿabbad-ibn-yaʿqub-the-sunni-12er.mdx', 'utf-8');

// Add import for QuranVerse
content = content.replace(/import QuoteBlock from '\.\.\/\.\.\/components\/article\/QuoteBlock\.astro';/, `import QuoteBlock from '../../components/article/QuoteBlock.astro';\nimport QuranVerse from '../../components/article/QuranVerse.astro';`);

// 1. The Glorified Imams
const quote1Raw = `**‘Abbad from ‘Amr from Abu Hamzah:**

He said: I heard ‘Ali bin al-Husayn (peace be upon him) say:

_"Indeed, God created Muhammad, ‘Ali, and eleven of his descendants from the light of His greatness. He established them as ethereal beings in the radiance of His light, worshipping Him before the creation was made. **They glorified and sanctified _God_, and they are the Imams from the lineage of the Messenger of _God_.**"_`;

const quote1New = `<HadithBlock
  source="Al-Uṣūl al-Sittah ʿAshar, Vol 1, p. 15-19"
  isnad="‘Abbad from ‘Amr from Abu Hamzah:"
  translation="He said: I heard ‘Ali bin al-Husayn (peace be upon him) say: 'Indeed, God created Muhammad, ‘Ali, and eleven of his descendants from the light of His greatness. He established them as ethereal beings in the radiance of His light, worshipping Him before the creation was made. **They glorified and sanctified God, and they are the Imams from the lineage of the Messenger of God.**'"
/>`;
content = content.replace(quote1Raw, quote1New);

// 2. Prophecy of an Imamate
const quote2Raw = `**‘Abbad, raising it to Abu Ja‘far (peace be upon him), who said:**

The Messenger of God (peace and blessings be upon him) said:

_"**From my progeny, there will be eleven noble leaders**, enlightened guides. The last of them is the one who will rise with the truth. He will fill the earth with justice as it had been filled with oppression and tyranny."_`;

const quote2New = `<HadithBlock
  source="Al-Uṣūl al-Sittah ʿAshar, Vol 1, p. 15"
  isnad="‘Abbad, raising it to Abu Ja‘far (peace be upon him), who said:"
  translation="The Messenger of God (peace and blessings be upon him) said: '**From my progeny, there will be eleven noble leaders**, enlightened guides. The last of them is the one who will rise with the truth. He will fill the earth with justice as it had been filled with oppression and tyranny.'"
/>`;
content = content.replace(quote2Raw, quote2New);

// 3. The Stars of Guidance
const quote3Raw = `**'Abbad narrated from Amr ibn Thabit, from Abu Ja‘far, from his father, from his forefathers, who said:  
**The Messenger of God (ﷺ) said:  
"The stars in the sky are a source of security for the inhabitants of the heavens. When the stars disappear, the people of the heavens will face what they dislike. **Similarly, the stars from my household—eleven stars from my progeny—are a source of security on the earth for its inhabitants, preventing it from sinking with them.** But when the stars of my household disappear from the earth, the people of the earth will face what they dislike."`;

const quote3New = `<HadithBlock
  source="Al-Uṣūl al-Sittah ʿAshar, Vol 1, p. 15"
  isnad="'Abbad narrated from Amr ibn Thabit, from Abu Ja‘far, from his father, from his forefathers, who said:"
  translation="The Messenger of God (ﷺ) said: 'The stars in the sky are a source of security for the inhabitants of the heavens. When the stars disappear, the people of the heavens will face what they dislike. **Similarly, the stars from my household—eleven stars from my progeny—are a source of security on the earth for its inhabitants, preventing it from sinking with them.** But when the stars of my household disappear from the earth, the people of the earth will face what they dislike.'"
/>`;
content = content.replace(quote3Raw, quote3New);

// 4. The Imams as Pillars of the Earth
const quote4Raw = `**'Abbad** **narrated from Amr, from Abu al-Jarud, from Abu Ja‘far (ع), who said:**The Messenger of God (ﷺ) said:  
"**I, along with eleven of my descendants, and you, O Ali, are the pegs (pillars) of the earth—its stabilizers, its mountains.** God has anchored the earth with you so that it does not sink with its inhabitants. But when the eleven from my progeny depart, the earth will sink with its people, and they will not be given respite."`;

const quote4New = `<HadithBlock
  source="Al-Uṣūl al-Sittah ʿAshar, Vol 1, p. 16"
  isnad="'Abbad narrated from Amr, from Abu al-Jarud, from Abu Ja‘far (ع), who said:"
  translation="The Messenger of God (ﷺ) said: '**I, along with eleven of my descendants, and you, O Ali, are the pegs (pillars) of the earth—its stabilizers, its mountains.** God has anchored the earth with you so that it does not sink with its inhabitants. But when the eleven from my progeny depart, the earth will sink with its people, and they will not be given respite.'"
/>`;
content = content.replace(quote4Raw, quote4New);

// 5. The Necessity of an Imam
const quote5Raw = `**Abbad narrated from Amr, from his father, from Abu Ja‘far (ع), who said:  
**I heard him say:  
"**If the earth were to remain for a single day without an Imam from us, it would sink with its inhabitants, and God would punish them with the severest of punishments.** This is because God has made us His proof (حجة) on His earth and a source of security for its people. As long as we remain among them, they will be safe from calamities and destruction. But when God decides to annihilate them without delay, He will remove us from among them and raise us to Him. Then, He will deal with them as He pleases and desires."`;

const quote5New = `<HadithBlock
  source="Al-Uṣūl al-Sittah ʿAshar, Vol 1, p. 16"
  isnad="Abbad narrated from Amr, from his father, from Abu Ja‘far (ع), who said:"
  translation="I heard him say: '**If the earth were to remain for a single day without an Imam from us, it would sink with its inhabitants, and God would punish them with the severest of punishments.** This is because God has made us His proof (حجة) on His earth and a source of security for its people. As long as we remain among them, they will be safe from calamities and destruction. But when God decides to annihilate them without delay, He will remove us from among them and raise us to Him. Then, He will deal with them as He pleases and desires.'"
/>`;
content = content.replace(quote5Raw, quote5New);

// 6. Superiority of Karbala
const quote6Raw = `**'Abbad narrated from Amr ibn Bayya‘ al-Sabiri, from Ja‘far ibn Muhammad (ع), who said:  
The land of the Kaaba once said: "Who is like me? The House of God has been built upon me! People from all over the world come to me. I have been made a sacred and safe sanctuary."** God then revealed to it: "Stop and be still! **By My might, the virtue you have been given over what I have granted to the land of Karbala is no more than the amount of water a needle holds when dipped into the sea.** Had it not been for the soil of Karbala, you would have had no virtue. Had it not been for the one whom the land of Karbala contains, I would not have created you, nor would I have created the House (Kaaba) upon which you boast. So, remain humble, modest, and lowly before the land of Karbala. Otherwise, I will cast you down into the fire of Hell."`;

const quote6New = `<HadithBlock
  source="Al-Uṣūl al-Sittah ʿAshar, Vol 1, p. 16"
  isnad="'Abbad narrated from Amr ibn Bayya‘ al-Sabiri, from Ja‘far ibn Muhammad (ع), who said:"
  translation="The land of the Kaaba once said: 'Who is like me? The House of God has been built upon me! People from all over the world come to me. I have been made a sacred and safe sanctuary.' God then revealed to it: 'Stop and be still! **By My might, the virtue you have been given over what I have granted to the land of Karbala is no more than the amount of water a needle holds when dipped into the sea.** Had it not been for the soil of Karbala, you would have had no virtue. Had it not been for the one whom the land of Karbala contains, I would not have created you, nor would I have created the House (Kaaba) upon which you boast. So, remain humble, modest, and lowly before the land of Karbala. Otherwise, I will cast you down into the fire of Hell.'"
/>`;
content = content.replace(quote6Raw, quote6New);

// 7. Sacredness of Karbala
const quote7Raw = `**'Abbad narrated from Amr, from his father, from Abu Ja‘far (ع):**

**God created the land of Karbala 24,000 years before creating the land of the Kaaba**. He sanctified and blessed it, and from the very beginning of creation, it has remained holy and blessed. It will continue to be so until God makes it the best land in Paradise, the most superior residence where He will house His chosen ones in Jannah.`;

const quote7New = `<HadithBlock
  source="Al-Uṣūl al-Sittah ʿAshar, Vol 1, p. 17"
  isnad="'Abbad narrated from Amr, from his father, from Abu Ja‘far (ع):"
  translation="**God created the land of Karbala 24,000 years before creating the land of the Kaaba**. He sanctified and blessed it, and from the very beginning of creation, it has remained holy and blessed. It will continue to be so until God makes it the best land in Paradise, the most superior residence where He will house His chosen ones in Jannah."
/>`;
content = content.replace(quote7Raw, quote7New);

// 8. Karbala as a Sacred Sanctuary
const quote8Raw = `**'Abbad narrated from a man, from Abu al-Jarud, who said: Ali ibn al-Husayn (ع) said:**

"God designated the land of Karbala as a sacred, safe, and blessed sanctuary 24,000 years before He created the land of the Kaaba. **When God transforms the earth (on the Day of Judgment), He will elevate Karbala as it is—pure and luminous— placing it in the finest garden of Paradise. It will become the most superior dwelling in Jannah, inhabited only by the Prophets, the Messengers, or the most resolute among them (أولو العزم من الرسل).** Indeed, it will shine among the gardens of Paradise, just as a radiant star glows among the stars for the people of the earth. Its light will be so great that it will illuminate the sight of all the people in Jannah. It will proclaim: 'I am the sacred land of God and the blessed soil, that embraced the master of martyrs and the youth of Paradise.'"`;

const quote8New = `<HadithBlock
  source="Al-Uṣūl al-Sittah ʿAshar, Vol 1, p. 17"
  isnad="'Abbad narrated from a man, from Abu al-Jarud, who said: Ali ibn al-Husayn (ع) said:"
  translation="God designated the land of Karbala as a sacred, safe, and blessed sanctuary 24,000 years before He created the land of the Kaaba. **When God transforms the earth (on the Day of Judgment), He will elevate Karbala as it is—pure and luminous— placing it in the finest garden of Paradise. It will become the most superior dwelling in Jannah, inhabited only by the Prophets, the Messengers, or the most resolute among them (أولو العزم من الرسل).** Indeed, it will shine among the gardens of Paradise, just as a radiant star glows among the stars for the people of the earth. Its light will be so great that it will illuminate the sight of all the people in Jannah. It will proclaim: 'I am the sacred land of God and the blessed soil, that embraced the master of martyrs and the youth of Paradise.'"
/>`;
content = content.replace(quote8Raw, quote8New);

// 9. Umar ibn al-Khattab’s Orders
const quote9Raw = `**'Abbad narrated from Safeer al-Hariri (or Sufyan), from his father, from Ja‘far al-Sadiq (ع):**

Umar ibn al-Khattab sent a decree to his governor, Qudamah, **ordering that no non-Arab (Mawali) should be allowed to cross a certain boundary— if they did, they were to be executed.** A messenger came while a man from the Mawali of al-Azd, a plasterer, was present with Qudamah. **So, Qudamah brought him forward and beheaded him.**`;

const quote9New = `<HadithBlock
  source="Al-Uṣūl al-Sittah ʿAshar, Vol 1, p. 17"
  isnad="'Abbad narrated from Safeer al-Hariri (or Sufyan), from his father, from Ja‘far al-Sadiq (ع):"
  translation="Umar ibn al-Khattab sent a decree to his governor, Qudamah, **ordering that no non-Arab (Mawali) should be allowed to cross a certain boundary— if they did, they were to be executed.** A messenger came while a man from the Mawali of al-Azd, a plasterer, was present with Qudamah. **So, Qudamah brought him forward and beheaded him.**"
/>`;
content = content.replace(quote9Raw, quote9New);

// 10. Abu Bakr’s Order to Kill Imam Ali
const quote10Raw = `**‘Abbad Abu Sa‘id narrated from ‘Amr ibn Thabit, from Abu Ishaq, from Sa‘id ibn Jubayr, from Ibn Abbas:**

**Abu Bakr commanded Khalid ibn al-Walid, saying: "If I survive, strike the neck of Ali."** However, Abu Bakr changed his mind, and called out: **"O Khalid, do not do anything I ordered you!"** Imam Ali (ع) turned to Khalid, cursing him: "O Khalid! Would you really have done it?" Khalid replied: "Yes, by God!" Imam Ali (ع) responded: "My killer is far more wretched than you, and his noose is far tighter than yours."`;

const quote10New = `<HadithBlock
  source="Al-Uṣūl al-Sittah ʿAshar, Vol 1, p. 18"
  isnad="‘Abbad Abu Sa‘id narrated from ‘Amr ibn Thabit, from Abu Ishaq, from Sa‘id ibn Jubayr, from Ibn Abbas:"
  translation="**Abu Bakr commanded Khalid ibn al-Walid, saying: 'If I survive, strike the neck of Ali.'** However, Abu Bakr changed his mind, and called out: **'O Khalid, do not do anything I ordered you!'** Imam Ali (ع) turned to Khalid, cursing him: 'O Khalid! Would you really have done it?' Khalid replied: 'Yes, by God!' Imam Ali (ع) responded: 'My killer is far more wretched than you, and his noose is far tighter than yours.'"
/>`;
content = content.replace(quote10Raw, quote10New);

// 11. Quran Verse at the end
const quranRaw = `**\\[6:112\\]** We have permitted the enemies of every prophet—human and jinn devils—to inspire in each other fancy words, in order to deceive. Had your Lord willed, they would not have done it. You shall disregard them and their fabrications.`;
const quranNew = `<QuranVerse reference="6:112">
We have permitted the enemies of every prophet—human and jinn devils—to inspire in each other fancy words, in order to deceive. Had your Lord willed, they would not have done it. You shall disregard them and their fabrications.
</QuranVerse>`;
content = content.replace(quranRaw, quranNew);

fs.writeFileSync('31-the-double-life-of-ʿabbad-ibn-yaʿqub-the-sunni-12er.mdx', content, 'utf-8');
console.log('Fixed quotes in 31');
