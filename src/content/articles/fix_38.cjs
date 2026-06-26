const fs = require('fs');

let content = fs.readFileSync('38-ṣaḥiḥ-al-yahud-the-parable-of-the-believer-the-citron.mdx', 'utf-8');

// 1. Ahmad Hadith
const ahmadRaw = `> **ahmad:19664** – Yaḥyá b. Saʿīd > Shuʿbah > Qatādah > Anasʿ> Abū Mūsá - The Prophet said:
> 
> "The likeness of the believer who recites the Qur'an is that of **a citron, the taste and smell of which are good.**
> 
> The likeness of a believer who does not read the Qur'an is that of **a date, the taste of which is good but it has no smell.**
> 
> The likeness of a hypocrite who reads the Qur'an is that of **a sweet basil, the smell of which is good but its taste is bitter.**
> 
> And the likeness of a hypocrite who does not read the Qur'an is that of **a colocynth (bitter apple), the taste of which is bitter and it has no smell.'**"`;

const ahmadNew = `<HadithBlock
  source="Ahmad 19664"
  isnad="Yaḥyá b. Saʿīd > Shuʿbah > Qatādah > Anasʿ> Abū Mūsá - The Prophet said:"
  translation="The likeness of the believer who recites the Qur'an is that of **a citron, the taste and smell of which are good.**

The likeness of a believer who does not read the Qur'an is that of **a date, the taste of which is good but it has no smell.**

The likeness of a hypocrite who reads the Qur'an is that of **a sweet basil, the smell of which is good but its taste is bitter.**

And the likeness of a hypocrite who does not read the Qur'an is that of **a colocynth (bitter apple), the taste of which is bitter and it has no smell.'**"
/>`;

content = content.replace(ahmadRaw, ahmadNew);

// 2. Vayikra Rabbah Quote
const vayikraRaw = `> Another matter: “The fruit of a pleasant \\[_hadar_\\] tree” – this is Israel; **just as the citron has taste and has fragrance, so Israel has people among them who have Torah and have good deeds.**
> 
> “Branches of date palms” – this is Israel; **just as the date palm has taste but has no fragrance, so Israel has people among them who have Torah but do not have good deeds.**
> 
> “A bough of a leafy tree” – this is Israel; **just as the myrtle has fragrance but has no taste, so Israel has people among them who have good deeds but do not have Torah.**
> 
> “Willows of the brook” – this is Israel; **just as the willow has no taste and has no fragrance, so Israel has people among them who do not have Torah and do not have good deeds.**`;

const vayikraNew = `<QuoteBlock author="Vayikra Rabbah 30:12">

Another matter: “The fruit of a pleasant [_hadar_] tree” – this is Israel; **just as the citron has taste and has fragrance, so Israel has people among them who have Torah and have good deeds.**

“Branches of date palms” – this is Israel; **just as the date palm has taste but has no fragrance, so Israel has people among them who have Torah but do not have good deeds.**

“A bough of a leafy tree” – this is Israel; **just as the myrtle has fragrance but has no taste, so Israel has people among them who have good deeds but do not have Torah.**

“Willows of the brook” – this is Israel; **just as the willow has no taste and has no fragrance, so Israel has people among them who do not have Torah and do not have good deeds.**

</QuoteBlock>`;

content = content.replace(vayikraRaw, vayikraNew);

// 3. Tabarani Hadith
const tabaraniRaw = `> **[tabarani:8670](https://hadithunlocked.com/tabarani:8670)** –ʿAlī b. ʿAbd al-ʿAzīz > Abū Nuʿaym > al-Masʿūdī > al-Qāsim
> 
> Abdullah said, "The example of one who recites the Qur'an but does not act upon it is like that of a fragrant flower with no taste.
> 
> And the example of one who acts upon the Qur'an but does not recite it is like that of a date with a pleasant taste but no fragrance.
> 
> And the example of one who learns the Qur'an and teaches it is like that of a fragrant and tasty citrus fruit.
> 
> And the example of one who neither recites the Qur'an nor acts upon it is like that of a bitter gourd with a foul taste and smell."`;

const tabaraniNew = `<HadithBlock
  source="al-Ṭabarānī 8670"
  isnad="ʿAlī b. ʿAbd al-ʿAzīz > Abū Nuʿaym > al-Masʿūdī > al-Qāsim"
  translation="Abdullah said, 'The example of one who recites the Qur'an but does not act upon it is like that of a fragrant flower with no taste.

And the example of one who acts upon the Qur'an but does not recite it is like that of a date with a pleasant taste but no fragrance.

And the example of one who learns the Qur'an and teaches it is like that of a fragrant and tasty citrus fruit.

And the example of one who neither recites the Qur'an nor acts upon it is like that of a bitter gourd with a foul taste and smell.'"
  url="https://hadithunlocked.com/tabarani:8670"
/>`;

content = content.replace(tabaraniRaw, tabaraniNew);

fs.writeFileSync('38-ṣaḥiḥ-al-yahud-the-parable-of-the-believer-the-citron.mdx', content, 'utf-8');
console.log('Fixed quotes in 38');
