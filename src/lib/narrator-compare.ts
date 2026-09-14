/**
 * The transmitter comparison table, built from the static corpus.
 *
 * The selection is in the query string, so the page itself is the same static
 * document for every comparison and only this differs. Order follows the order
 * the researcher picked them in, not the order the database returns them.
 *
 * No field here grades anyone. `Verdict` prints the classical classification
 * the register records verbatim, and jarḥ/taʿdīl are counts of attributed
 * statements. Nothing is summed into a score, and no cell is coloured by what
 * it says.
 */

import { CorpusUnavailableError, getNarratorsByIds, type NarratorRecord } from './corpus-client';
import { escapeHtml } from './snippet';

interface Field {
  label: string;
  arabic?: boolean;
  get: (record: NarratorRecord) => string;
}

const FIELDS: Field[] = [
  { label: 'Arabic', arabic: true, get: (r) => r.name_ar || ', ' },
  { label: 'Generation', get: (r) => r.generation || ', ' },
  { label: 'Verdict', get: (r) => r.grade || 'Unrated' },
  { label: 'Tabaqa', get: (r) => (r.tabaqa_number ? String(r.tabaqa_number) : ', ') },
  {
    label: 'Died',
    get: (r) => (r.death_hijri ? `${r.death_hijri} AH / ${r.death_gregorian} CE` : 'not recorded')
  },
  { label: 'Place', get: (r) => r.death_place || r.places_en?.[0] || ', ' },
  { label: 'Hadith', get: (r) => r.hadith_count.toLocaleString() },
  { label: 'Teachers', get: (r) => String(r.teacher_count) },
  { label: 'Students', get: (r) => String(r.student_count) },
  { label: 'Critics', get: (r) => String(r.critic_count) },
  { label: 'Statements', get: (r) => String(r.statement_count) },
  { label: "Jarh / Ta'dil", get: (r) => `${r.jarh_count} / ${r.tadil_count}` }
];

const emptyMarkup = (max: number) => `
  <p class="compare-empty">
    No transmitters selected. Open the <a href="/narrators">register</a> and add up to ${max} with
    the <strong>+</strong> control on each row.
  </p>`;

function tableMarkup(records: NarratorRecord[]): string {
  const head = records
    .map(
      (r) => `
      <th scope="col">
        <a href="/narrators/${r.id}">${escapeHtml(r.name_en || r.name_ar)}</a>
        <span class="compare-id">#${r.id}</span>
      </th>`
    )
    .join('');

  const body = FIELDS.map((field) => {
    const cells = records
      .map((r) => {
        const attrs = field.arabic ? ' lang="ar" dir="rtl"' : '';
        return `<td${attrs}>${escapeHtml(field.get(r))}</td>`;
      })
      .join('');
    return `<tr><th scope="row">${escapeHtml(field.label)}</th>${cells}</tr>`;
  }).join('');

  return `
    <div class="compare-scroll">
      <table class="compare-table">
        <caption class="sr-only">Comparison of ${records.length} transmitters</caption>
        <thead><tr><th scope="col">Field</th>${head}</tr></thead>
        <tbody>${body}</tbody>
      </table>
    </div>`;
}

export async function initNarratorCompare(): Promise<void> {
  const mount = document.querySelector('[data-compare-mount]') as HTMLElement | null;
  if (!mount) return;

  const max = Number(mount.dataset.max) || 6;
  const ids = (new URLSearchParams(location.search).get('ids') || '')
    .split(',')
    .map((part) => parseInt(part.trim(), 10))
    .filter((n) => Number.isFinite(n) && n >= 0)
    .slice(0, max);

  if (!ids.length) {
    mount.innerHTML = emptyMarkup(max);
    return;
  }

  try {
    const records = await getNarratorsByIds(ids);
    mount.innerHTML = records.length ? tableMarkup(records) : emptyMarkup(max);
  } catch (error) {
    mount.innerHTML = `
      <p class="compare-empty">
        ${
          error instanceof CorpusUnavailableError
            ? 'The corpus could not be loaded, so this comparison cannot be assembled right now.'
            : 'The comparison could not be loaded.'
        }
        Each transmitter still has their own page in the <a href="/narrators">register</a>.
      </p>`;
  }
}
