/**
 * Art direction for the 23 section covers in Musnad Ibrāhīm ibn Adham.
 * Region tags are editorial visual cues based on a narrator's recorded nisba,
 * home city or best-attested scholarly milieu. The source chapter headings
 * and their wording remain untouched.
 */
export interface IbrahimChapterCover {
  n: number;
  region: string;
  title: string;
  alt: string;
}

export const IBRAHIM_CHAPTER_COVERS: IbrahimChapterCover[] = [
  { n: 1, region: 'merv', title: 'Opening', alt: 'An unmarked manuscript, reed pen and lamp at dawn, with no people.' },
  { n: 2, region: 'medina', title: 'Abū Jaʿfar al-Bāqir', alt: 'Illustrative oil-painted portrait of Abū Jaʿfar Muḥammad al-Bāqir; not a verified likeness.' },
  { n: 3, region: 'medina', title: 'Muḥammad b. Ziyād al-Jumaḥī', alt: 'Illustrative oil-painted portrait of Muḥammad ibn Ziyād al-Jumaḥī al-Madanī; not a verified likeness.' },
  { n: 4, region: 'medina', title: 'Yaḥyā b. Saʿīd al-Anṣārī', alt: 'Illustrative oil-painted portrait of Yaḥyā ibn Saʿīd al-Anṣārī; not a verified likeness.' },
  { n: 5, region: 'medina', title: 'ʿUbayd Allāh b. ʿUmar al-ʿUmarī', alt: 'Illustrative oil-painted portrait of ʿUbayd Allāh ibn ʿUmar al-ʿUmarī; not a verified likeness.' },
  { n: 6, region: 'medina', title: 'ʿUbayd Allāh & Mūsā b. ʿUqba', alt: 'Illustrative paired oil-painted portraits of ʿUbayd Allāh ibn ʿUmar and Mūsā ibn ʿUqba; not verified likenesses.' },
  { n: 7, region: 'kufa', title: 'Abū Isḥāq al-Sabīʿī', alt: 'Illustrative oil-painted portrait of Abū Isḥāq al-Sabīʿī; not a verified likeness.' },
  { n: 8, region: 'kufa', title: 'Manṣūr b. al-Muʿtamir & al-Aʿmash', alt: 'Illustrative paired oil-painted portraits of Manṣūr ibn al-Muʿtamir and al-Aʿmash; not verified likenesses.' },
  { n: 9, region: 'kufa', title: 'Sufyān al-Thawrī', alt: 'Illustrative oil-painted portrait of Sufyān al-Thawrī; not a verified likeness.' },
  { n: 10, region: 'basra', title: 'Mālik b. Dīnār', alt: 'Illustrative oil-painted portrait of Mālik ibn Dīnār; not a verified likeness.' },
  { n: 11, region: 'basra', title: 'Shuʿba b. al-Ḥajjāj', alt: 'Illustrative oil-painted portrait of Shuʿba ibn al-Ḥajjāj; not a verified likeness.' },
  { n: 12, region: 'basra', title: 'Hishām b. Ḥassān', alt: 'Illustrative oil-painted portrait of Hishām ibn Ḥassān; not a verified likeness.' },
  { n: 13, region: 'unidentified', title: 'Mūsā b. Yazīd al-Naḍrī', alt: 'Illustrative generic portrait for Mūsā ibn Yazīd al-Naḍrī; the likeness and regional identification are uncertain.' },
  { n: 14, region: 'basra', title: 'Abān b. Abī ʿAyyāsh', alt: 'Illustrative oil-painted portrait of Abān ibn Abī ʿAyyāsh; not a verified likeness.' },
  { n: 15, region: 'merv', title: 'Muqātil b. Ḥayyān al-Balkhī', alt: 'Illustrative oil-painted portrait of Muqātil ibn Ḥayyān of Balkh; not a verified likeness.' },
  { n: 16, region: 'mixed-kufa', title: 'Nuʿaym & Aʿyan', alt: 'Illustrative paired portraits of Nuʿaym ibn Abī Hind and the unidentified Aʿyan; neither is a verified likeness.' },
  { n: 17, region: 'damascus', title: 'ʿAbd al-Raḥmān al-Awzāʿī', alt: 'Illustrative oil-painted portrait of ʿAbd al-Raḥmān al-Awzāʿī of Syria; not a verified likeness.' },
  { n: 18, region: 'mixed-medina-basra', title: 'Muḥammad & ʿAṭāʾ b. ʿAjlān', alt: 'Illustrative oil-painted triptych of Muḥammad ibn ʿAjlān, ʿAṭāʾ ibn ʿAjlān and an unnamed intermediary; not verified likenesses.' },
  { n: 19, region: 'mixed-khurasan', title: 'Abū ʿAbd Allāh & Abū Bakr b. Asmāʾ', alt: 'Illustrative paired portraits of Abū ʿAbd Allāh al-Khurāsānī and Abū Bakr ibn Asmāʾ; not verified likenesses.' },
  { n: 20, region: 'mixed-syria-kufa', title: 'Arṭāʾa b. al-Mundhir & al-Fazārī', alt: 'Illustrative paired oil-painted portraits of Arṭāʾa ibn al-Mundhir and Abū Isḥāq al-Fazārī; not verified likenesses.' },
  { n: 21, region: 'kufa', title: 'Abū Ḥanīfa', alt: 'Illustrative oil-painted portrait of Abū Ḥanīfa; not a verified likeness.' },
  { n: 22, region: 'unidentified', title: 'Abū Jaʿfar · unidentified', alt: 'Illustrative generic portrait for the unspecified Abū Jaʿfar; no particular historical identity is implied.' },
  { n: 23, region: 'merv', title: 'Ibrāhīm ibn Adham · repentance', alt: 'Illustrative oil-painted portrait of Ibrāhīm ibn Adham as an ascetic; not a verified likeness.' },
];

