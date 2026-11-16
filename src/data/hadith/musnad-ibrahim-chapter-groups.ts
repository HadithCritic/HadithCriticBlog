import type { BookGroup } from './musnad-abu-hanifa-groups';

/** Region filters for the teacher-led sections; ambiguous chains stay explicit. */
export const MUSNAD_IBRAHIM_REGIONS: readonly BookGroup[] = [
  { id: 'medina', label: 'Medina', books: [2, 3, 4, 5, 6] },
  { id: 'basra', label: 'Basra', books: [10, 11, 12, 14] },
  { id: 'kufa', label: 'Kufa', books: [7, 8, 9, 21] },
  { id: 'khurasan', label: 'Khurasan', books: [1, 15, 23] },
  { id: 'syria', label: 'Syria', books: [17] },
  { id: 'uncertain', label: 'Uncertain or mixed', books: [13, 16, 18, 19, 20, 22] },
];
