/**
 * The painted covers of Musnad Abī Ḥanīfa's 33 books, in book order.
 *
 * The files are public/images/hadith/musnad-abu-hanifa/<NN>-<stem>.jpg
 * (1760x2112) with an 880px copy beside each, painted by
 * scripts/hadith/paintings/render.py; `stem` is the scene's name there.
 * Titles and entry counts come from the collection's chapter-index.json, not
 * from here. The alt text says what each painting shows.
 */

export const COVER_ROOT = '/images/hadith/musnad-abu-hanifa';

export interface BookCover {
  stem: string;
  alt: string;
}

export const MUSNAD_ABU_HANIFA_COVERS: readonly BookCover[] = [
  { stem: 'faith', alt: 'A crescent moon and one bright star over desert dunes at first light, a distant minaret on the horizon.' },
  { stem: 'knowledge', alt: 'An open manuscript, an inkwell with a reed pen and a lit brass oil lamp on a dark wooden desk.' },
  { stem: 'purification', alt: 'A marble courtyard fountain under a pointed arch of teal tilework, with shafts of light and rising spray.' },
  { stem: 'prayer', alt: 'A lamp-lit mihrab niche with a hanging lantern above a deep red prayer rug seen in perspective.' },
  { stem: 'zakah', alt: 'Sheaves of wheat, a small brass scale pan holding coins and a cloth purse in golden harvest light.' },
  { stem: 'fasting', alt: 'A thin crescent at dusk over date palms, with a bowl of dates and a glass of water in the foreground.' },
  { stem: 'hajj', alt: 'A long pilgrim road across a plain of white tents toward mountains at sunrise.' },
  { stem: 'marriage', alt: 'Crossed branches of flowering jasmine and olive below a pair of lanterns, with a pomegranate in warm light.' },
  { stem: 'istibra', alt: 'A still, moonlit courtyard under a waxing moon, with an hourglass on a stone ledge.' },
  { stem: 'nursing', alt: 'A clay jug and a small bowl of milk on a windowsill in soft dawn light.' },
  { stem: 'divorce', alt: 'A quiet road forking in two directions at dusk, with long shadows and a single lamp at the fork.' },
  { stem: 'expenditures', alt: 'A woven basket of bread, figs and dates beside a small coin purse on a table.' },
  { stem: 'tadbir', alt: 'An open arched doorway leading into bright light, with a loosened chain lying on the stone floor.' },
  { stem: 'oaths', alt: 'A closed book on a carved wooden stand beside a single lit candle.' },
  { stem: 'hudud', alt: 'A stern stone gateway with a heavy studded door and one shaft of light falling on the threshold.' },
  { stem: 'jihad', alt: 'A road through a mountain pass under storm light, with a plain, unmarked banner on a ridge.' },
  { stem: 'sales', alt: 'A brass balance scale above bowls of saffron, paprika, turmeric and herbs on a market table.' },
  { stem: 'pledge', alt: 'A brass-bound wooden chest with a key on a folded cloth, in lamplight.' },
  { stem: 'preemption', alt: 'Two adjoining garden walls with a shared gate and a stone well in front.' },
  { stem: 'sharecropping', alt: 'Furrowed fields and an irrigation channel at golden hour, with a wooden plough left in the earth.' },
  { stem: 'virtues', alt: 'A blossoming almond branch against a luminous apricot sky.' },
  { stem: 'community', alt: 'A vast plain at night glowing with thousands of tiny lamps under a star-filled sky.' },
  { stem: 'foods', alt: 'A still life of flatbread, olives, figs, a copper pitcher and ceramic cups in low, warm light.' },
  { stem: 'clothing', alt: 'Folded bolts of indigo, saffron and white cloth beside a spindle and a silver ring on a table.' },
  { stem: 'medicine', alt: 'Apothecary jars, a jar of honey, black seed and dried herbs beside a brass mortar and pestle.' },
  { stem: 'etiquette', alt: 'A low table with a coffee pot and small cups between cushions, an open courtyard door at dusk behind.' },
  { stem: 'riqaq', alt: 'One lone tree on a vast empty plain at twilight, a single falling leaf and a lone rain cloud.' },
  { stem: 'crimes', alt: 'A brooding stormy sky over a dry stone well and an overturned bowl.' },
  { stem: 'judgments', alt: "An empty judge's cushion in a vaulted hall, with a lamp, scrolls and a window of cool light." },
  { stem: 'trials', alt: 'A night sea of dark swelling waves under a clouded moon, with a faint lighthouse in the distance.' },
  { stem: 'tafsir', alt: 'Sunrise through a carved lattice window falling on an illuminated page with gold margins and abstract ornament.' },
  { stem: 'bequests', alt: 'Wheat portioned into equal bundles on a cloth beside an old wooden coffer.' },
  { stem: 'paradise', alt: 'A radiant garden of fruit trees with turquoise rivers running through terraces under golden light.' }
];

export const HERO_ALT =
  'Dawn over the Euphrates at Kufa: an indigo sky warming to amber at the horizon, date palms in silhouette and a hazy skyline of domes and minarets reflected in the river.';
