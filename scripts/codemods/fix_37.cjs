const fs = require('fs');

let content = fs.readFileSync('37-fallible-transmitters-transmitting-infallible-text-the-quran.mdx', 'utf-8');

// 1. Dr. Nasr Quote
const nasrRaw = `> "Did Qirāʾāt scholars perform isnād criticism on the chains of transmissions of the Eponymous Readings, and did they carry out a sophisticated and engaged process of _jarḥ_ and _taʿdīl_ with regards to the _rāwīs_ and readers of the Qurʾān? **The short answer is no**. A survey of _ṭabaqāt_ dictionaries of both disciplines, Ḥadīth and Qirāʾāt, gives us a clear indication that the processes of _taʿdīl_ and _tazkiya_, of deeming readers to be reliable or not, did not take place as methodically in Qirāʾāt as it did in Ḥadīth. This is evident through the sheer number of biographical compilations we have on the _muḥaddithūn_ as compared to the scanty number of books we have on the _qurrāʾ_. Besides the two major extant works on the _Qurrāʾ_ by al-Dhahabī and Ibn al-Jazarī, bibliographic sources list a few more titles which are now lost."`;

const nasrNew = `<QuoteBlock author="Dr. Shady Nasser">

"Did Qirāʾāt scholars perform isnād criticism on the chains of transmissions of the Eponymous Readings, and did they carry out a sophisticated and engaged process of _jarḥ_ and _taʿdīl_ with regards to the _rāwīs_ and readers of the Qurʾān? **The short answer is no**. A survey of _ṭabaqāt_ dictionaries of both disciplines, Ḥadīth and Qirāʾāt, gives us a clear indication that the processes of _taʿdīl_ and _tazkiya_, of deeming readers to be reliable or not, did not take place as methodically in Qirāʾāt as it did in Ḥadīth. This is evident through the sheer number of biographical compilations we have on the _muḥaddithūn_ as compared to the scanty number of books we have on the _qurrāʾ_. Besides the two major extant works on the _Qurrāʾ_ by al-Dhahabī and Ibn al-Jazarī, bibliographic sources list a few more titles which are now lost."

</QuoteBlock>`;

content = content.replace(nasrRaw, nasrNew);

// 2. Tabari Quote
const tabariRaw = `> al- ̇'Tabar ̄ı dismisses Qur' ̄anic readings attributed to the seven Readers as well, or to be more accurate to those who became known as the seven Readers roughly fifteen years after he died... Al- ̇ Tabar ̄ı states that **the genitive reading is not eloquent** and that the only reading he authorizes is the accusative wa-l-ar ̇ h ̄ama. **Al- ̇ Tabar ̄ı openly dismisses the reading by ̇ Hamzah and considers it to be simply wrong**. Again, this grammatically awkward reading by ̇ Hamzah was canonized later on by Ibn Muj ̄ahid and **was acknowledged by the community of the Qur" ̄an readers**.
> 
> **In (Q. 6:137) al- ̇ Tabar ̄ı dismisses the reading by the canonical Reader Ibn Amir and considers it to be repulsive and inarticulate**. He adds that ̄ **this reading cannot be well founded for it contradicts the consensus of the readers.** He also **rejects Ibn Kath ̄ır’s reading of (Q. 2:37) for the same reasons.** Similarly, all these readings openly rejected by al- ̇ Tabar ̄ı were canonized later on and **they enjoyed the status of being absolutely valid and divine.**
> 
> *   _The Transmission of the Variant Readings of the Quran - Shady Nasser_ (p. 41-42)`;

const tabariNew = `<QuoteBlock author="Dr. Shady Nasser (The Transmission of the Variant Readings of the Quran, p. 41-42)">

al-Tabarī dismisses Qur'anic readings attributed to the seven Readers as well, or to be more accurate to those who became known as the seven Readers roughly fifteen years after he died... Al-Tabarī states that **the genitive reading is not eloquent** and that the only reading he authorizes is the accusative wa-l-arhāma. **Al-Tabarī openly dismisses the reading by Hamzah and considers it to be simply wrong**. Again, this grammatically awkward reading by Hamzah was canonized later on by Ibn Mujāhid and **was acknowledged by the community of the Qur'an readers**.

**In (Q. 6:137) al-Tabarī dismisses the reading by the canonical Reader Ibn Amir and considers it to be repulsive and inarticulate**. He adds that **this reading cannot be well founded for it contradicts the consensus of the readers.** He also **rejects Ibn Kathīr’s reading of (Q. 2:37) for the same reasons.** Similarly, all these readings openly rejected by al-Tabarī were canonized later on and **they enjoyed the status of being absolutely valid and divine.**

</QuoteBlock>`;

content = content.replace(tabariRaw, tabariNew);

// 3. Aisha Hadith
const aishaRaw = `ʿUrwah questions: ʿĀʾishah about a number of verses:

4:162  
_lākin al-rāsikhūna fīʾl-ʿilm minhum  
waʾl-muʾminūna yuʾminūna bi-mā unzila ilaika  
wa mā unzila min qablik waʾl-muqīmīna  
al-Ṣalāt waʾl-muʾtūna al-zakāt waʾl-muʾminūna  
biʾllāhi waʾl-yawmʾl-ākhir ulāʾika sanuʾtīhim  
ajran ʿaẓīman._

5:69  
_inna ʾlladhīna āmanū waʾlladhīna hādū  
waʾl-ṣābiʾūna ..._

**20:63  
_qālū: inna hādhāni la-sāḥirāni_**

ʿĀʾishah replied: ‘**That was the doing of the scribes. They wrote it out wrongly.**’

(_**Abdel Haleem,**“Grammatical Shift for Rhetorical Purposes,” 424._)`;

const aishaNew = `<QuoteBlock author="Abdel Haleem, “Grammatical Shift for Rhetorical Purposes,” 424">

ʿUrwah questions: ʿĀʾishah about a number of verses:

4:162
_lākin al-rāsikhūna fīʾl-ʿilm minhum_
_waʾl-muʾminūna yuʾminūna bi-mā unzila ilaika_
_wa mā unzila min qablik waʾl-muqīmīna_
_al-Ṣalāt waʾl-muʾtūna al-zakāt waʾl-muʾminūna_
_biʾllāhi waʾl-yawmʾl-ākhir ulāʾika sanuʾtīhim_
_ajran ʿaẓīman._

5:69
_inna ʾlladhīna āmanū waʾlladhīna hādū_
_waʾl-ṣābiʾūna ..._

**20:63**
_**qālū: inna hādhāni la-sāḥirāni**_

ʿĀʾishah replied: '**That was the doing of the scribes. They wrote it out wrongly.**'

</QuoteBlock>`;

content = content.replace(aishaRaw, aishaNew);

fs.writeFileSync('37-fallible-transmitters-transmitting-infallible-text-the-quran.mdx', content, 'utf-8');
console.log('Fixed quotes in 37');
