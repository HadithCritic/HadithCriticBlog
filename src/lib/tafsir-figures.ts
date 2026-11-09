export interface TafsirFigure {
  name: string;
  region: string;
  src: string;
}

const normalize = (value: string) => value
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[ʿʾʻʼ‘’']/g, '')
  .replace(/[^a-z0-9 ]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const FIGURES: { match: string[]; name: string; region: string; src: string }[] = [
  { match: ['ibn abbas', 'abdullah bin abbas', 'abd allah bin abbas'], name: 'Ibn ʿAbbās', region: 'mecca', src: '/images/tafsir/figures/ibn-abbas.webp' },
  { match: ['mujahid'], name: 'Mujāhid ibn Jabr', region: 'mecca', src: '/images/tafsir/figures/mujahid.webp' },
  { match: ['kab', 'kaab', 'kaab al ahbar'], name: 'Kaʿb', region: 'yemen', src: '/images/tafsir/figures/kab-al-ahbar.webp' },
  { match: ['said ibn jubayr', 'saeed ibn jubayr', 'said bin jubayr', 'saeed bin jubair', 'saeed bin jubayr'], name: 'Saʿīd ibn Jubayr', region: 'kufa', src: '/images/tafsir/figures/said-ibn-jubayr.webp' },
  { match: ['abu al aliyah', 'abu al aliya', 'abu al aaliyah', 'abu al aaliya', 'fayruz ibn mihran'], name: 'Abū al-ʿĀliya', region: 'basra', src: '/images/tafsir/figures/abu-al-aliya.webp' },
  { match: ['ibn jurayj', 'abd al malik ibn abd al aziz ibn jurayj'], name: 'Ibn Jurayj', region: 'mecca', src: '/images/tafsir/figures/ibn-jurayj.webp' },
  { match: ['ali ibn abi talib', 'ali b abi talib'], name: 'ʿAlī ibn Abī Ṭālib', region: 'mecca', src: '/images/tafsir/figures/ali-ibn-abi-talib.webp' },
  { match: ['jabir ibn abd allah', 'jabir bin abdullah', 'jabir b abd allah', 'jabir al ansari'], name: 'Jābir ibn ʿAbd Allāh', region: 'medina', src: '/images/tafsir/figures/jabir-ibn-abd-allah.webp' },
  { match: ['muhammad ibn al hanafiyya', 'muhammad bin al hanafiyya', 'ibn al hanafiyya'], name: 'Muḥammad ibn al-Ḥanafiyya', region: 'medina', src: '/images/tafsir/figures/muhammad-ibn-al-hanafiyya.webp' },
  { match: ['abd al rahman b zayd b aslam', 'abd al rahman ibn zayd ibn aslam', 'abdur rahman bin zayd bin aslam'], name: 'ʿAbd al-Raḥmān ibn Zayd ibn Aslam', region: 'medina', src: '/images/tafsir/figures/abd-al-rahman-ibn-zayd.webp' },
  { match: ['zayd ibn aslam', 'zayd bin aslam', 'zayd b aslam'], name: 'Zayd ibn Aslam', region: 'medina', src: '/images/tafsir/figures/zayd-ibn-aslam.webp' },
  { match: ['al rabi ibn anas', 'rabi ibn anas', 'rabi bin anas'], name: 'al-Rabīʿ ibn Anas', region: 'basra', src: '/images/tafsir/figures/rabi-ibn-anas.webp' },
  { match: ['waki ibn al jarrah', 'waki bin al jarrah', 'waki b al jarrah'], name: 'Wakīʿ ibn al-Jarrāḥ', region: 'kufa', src: '/images/tafsir/figures/waki-ibn-al-jarrah.webp' },
  { match: ['abu hurayra', 'abu huraira'], name: 'Abū Hurayra', region: 'yemen', src: '/images/tafsir/figures/abu-hurayra.webp' },
  { match: ['bishr bin amara', 'bishr bin ammarah', 'bishr ibn amara', 'bishr ibn ammarah', 'bish bin amara'], name: 'Bishr ibn ʿAmāra', region: 'kufa', src: '/images/tafsir/figures/bishr-bin-amara.webp' },
  { match: ['ibrahim bin al ala bin al dahhak', 'ibrahim ibn al ala ibn al dahhak', 'ibrahim bin al ala'], name: 'Ibrāhīm ibn al-ʿAlāʾ', region: 'damascus', src: '/images/tafsir/figures/ibrahim-al-ala.webp' },
  { match: ['sufyan bin wakee', 'sufyan ibn wakee', 'sufyan bin waki'], name: 'Sufyān ibn Wakīʿ', region: 'kufa', src: '/images/tafsir/figures/sufyan-bin-wakee.webp' },
  { match: ['al arzami', 'arzami'], name: 'al-ʿArzamī', region: 'kufa', src: '/images/tafsir/figures/al-arzami.webp' },
  { match: ['ata al khurasani', 'ata khurasani', 'ata ibn abi muslim al khurasani'], name: 'ʿAṭāʾ al-Khurāsānī', region: 'khurasan', src: '/images/tafsir/figures/ata-khurasani.webp' },
  { match: ['abu said', 'abu saeed'], name: 'Abū Saʿīd', region: 'unidentified', src: '/images/tafsir/figures/abu-said.webp' },
  { match: ['uthman bin zafar', 'uthman ibn zafar'], name: 'ʿUthmān ibn Ẓafar', region: 'unidentified', src: '/images/tafsir/figures/uthman-bin-zafar.webp' },
  { match: ['al hasan', 'hasan al basri'], name: 'al-Ḥasan al-Baṣrī', region: 'basra', src: '/images/tafsir/figures/hasan-al-basri.webp' },
  { match: ['qatada', 'qutada'], name: 'Qatāda', region: 'basra', src: '/images/tafsir/figures/basran-scholar.webp' },
];

const REGIONS: { match: string[]; region: string }[] = [
  { match: ['ibn abbas', 'abdullah bin abbas', 'abd allah bin abbas', 'mujahid', 'ibn jurayj'], region: 'mecca' },
  { match: ['ali ibn abi talib', 'ali b abi talib'], region: 'mecca' },
  { match: ['qatada', 'qutada', 'al hasan', 'hasan al basri', 'abu al aliyah', 'abu al aliya', 'abu al aaliyah', 'abu al aaliya', 'al aswad bin sari', 'al rabi ibn anas', 'rabi ibn anas', 'rabi bin anas'], region: 'basra' },
  { match: ['ibn zayd', 'abdul rahman bin zayd', 'abd al rahman bin zayd'], region: 'medina' },
  { match: ['jabir ibn abd allah', 'jabir bin abdullah', 'jabir b abd allah', 'jabir al ansari', 'muhammad ibn al hanafiyya', 'muhammad bin al hanafiyya', 'ibn al hanafiyya', 'abd al rahman b zayd b aslam', 'abd al rahman ibn zayd ibn aslam', 'abdur rahman bin zayd bin aslam', 'zayd ibn aslam', 'zayd bin aslam', 'zayd b aslam'], region: 'medina' },
  { match: ['bishr bin amara', 'bishr bin ammarah', 'bishr ibn amara', 'bishr ibn ammarah', 'bish bin amara', 'saeed bin jubair', 'said bin jubayr', 'said ibn jubayr', 'saeed ibn jubayr', 'waki', 'sufyan', 'ibn al hanafiyyah'], region: 'kufa' },
  { match: ['waki ibn al jarrah', 'waki bin al jarrah', 'waki b al jarrah'], region: 'kufa' },
  { match: ['al arzami', 'arzami'], region: 'kufa' },
  { match: ['ata al khurasani', 'ata khurasani', 'ata ibn abi muslim al khurasani'], region: 'khurasan' },
  { match: ['ibrahim bin al ala bin al dahhak', 'ibrahim ibn al ala ibn al dahhak', 'ibrahim bin al ala'], region: 'damascus' },
  { match: ['kab', 'kaab'], region: 'yemen' },
  { match: ['abu hurayra', 'abu huraira'], region: 'yemen' },
  { match: ['tabari'], region: 'tabaristan' },
];

const matchingGroup = <T extends { match: string[] }>(value: string, groups: T[]): T | undefined => {
  const key = normalize(value);
  return groups.find((group) => group.match.some((alias) => key === normalize(alias) || key.includes(normalize(alias))));
};

export function tafsirFigure(name: string): TafsirFigure | null {
  const figure = matchingGroup(name, FIGURES);
  return figure ? { name: figure.name, region: figure.region, src: figure.src } : null;
}

export function tafsirFigureForCommentator(name: string): TafsirFigure | null {
  if (normalize(name).includes('tabari')) {
    return { name: 'al-Ṭabarī', region: 'tabaristan', src: '/images/tafsir/figures/tabari.webp' };
  }
  return null;
}

export function tafsirRegionForName(name: string): string | null {
  return matchingGroup(name, REGIONS)?.region ?? null;
}
