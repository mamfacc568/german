import { DICTIONARY, type Entry } from '../data/dictionary';

/** Why a term pointed at an entry — shown as a tag on the suggestion row. */
export type TermKind = 'word' | 'plural' | 'form' | 'prefix' | 'related' | 'english' | 'hindi';

type Term = { text: string; norm: string; kind: TermKind; entry: Entry };

export type SearchResult = {
  entry: Entry;
  /** The text that actually matched. */
  matched: string;
  kind: TermKind;
};

/** Lower-case, drop the article, fold umlauts and punctuation. */
export function normalise(value: string): string {
  return value
    .toLowerCase()
    .replace(/^(der|die|das)\s+/, '')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ß/g, 'ss')
    .replace(/[.,!?"„“”()/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** "Decision, Choice" -> ["decision", "choice"]; "To stand" also yields "stand". */
function splitMeaning(value: string): string[] {
  const out: string[] = [];
  for (const raw of value.split(/[,;/]/)) {
    const part = raw.trim();
    if (!part) continue;
    out.push(part);
    const stripped = part.replace(/^to\s+/i, '');
    if (stripped !== part) out.push(stripped);
  }
  return out;
}

function buildIndex(): Term[] {
  const terms: Term[] = [];
  const push = (text: string, kind: TermKind, entry: Entry) => {
    const norm = normalise(text);
    if (norm) terms.push({ text, norm, kind, entry });
  };

  for (const entry of DICTIONARY) {
    push(entry.word, 'word', entry);
    if (entry.plural) push(entry.plural, 'plural', entry);

    for (const meaning of splitMeaning(entry.primaryMeaning)) push(meaning, 'english', entry);
    for (const hi of entry.hindi.split(',')) push(hi, 'hindi', entry);
    for (const hi of entry.hindiRoman.split(',')) push(hi, 'hindi', entry);

    // Every conjugated form, so "steht" and "entschied" find their verb.
    for (const tense of entry.conjugation?.tenses ?? []) {
      for (const cell of tense.forms) push(cell.form.replace('|', ''), 'form', entry);
    }
    for (const stem of entry.family?.stemForms ?? []) push(stem, 'form', entry);

    if (entry.family) {
      push(entry.family.root, 'related', entry);
      for (const relative of entry.family.relatives) push(relative.word, 'related', entry);
    }
    for (const verb of entry.prefixVerbs?.verbs ?? []) push(verb.verb, 'prefix', entry);
  }

  return terms;
}

const INDEX = buildIndex();

/** Lower is better. Headword beats a form beats a translation. */
const KIND_WEIGHT: Record<TermKind, number> = {
  word: 0,
  plural: 1,
  form: 2,
  prefix: 3,
  related: 4,
  english: 5,
  hindi: 6,
};

export function searchEntries(query: string, limit = 7): SearchResult[] {
  const q = normalise(query);
  if (!q) return [];

  const scored: { result: SearchResult; score: number }[] = [];

  // Mid-word hits are only useful on the word itself and its own forms.
  // Allowing them on family members turns "ent" into a match for "hoffentlich".
  const allowsSubstring = (kind: TermKind) =>
    kind === 'word' || kind === 'plural' || kind === 'form';

  for (const term of INDEX) {
    let position: number;
    if (term.norm === q) position = 0;
    else if (term.norm.startsWith(q)) position = 1;
    else if (allowsSubstring(term.kind) && term.norm.includes(q)) position = 2;
    else continue;

    // Match quality dominates; the kind of field breaks the tie.
    const score = position * 100 + KIND_WEIGHT[term.kind] * 10 + Math.min(9, term.norm.length / 8);
    scored.push({ result: { entry: term.entry, matched: term.text, kind: term.kind }, score });
  }

  scored.sort((a, b) => a.score - b.score);

  // One row per entry, keeping its best match.
  const seen = new Set<string>();
  const out: SearchResult[] = [];
  for (const { result } of scored) {
    if (seen.has(result.entry.id)) continue;
    seen.add(result.entry.id);
    out.push(result);
    if (out.length >= limit) break;
  }
  return out;
}

/** The single entry the main screen should display for this query. */
export function bestEntry(query: string): Entry | undefined {
  return searchEntries(query, 1)[0]?.entry;
}

export const KIND_LABEL: Record<TermKind, string> = {
  word: '',
  plural: 'plural',
  form: 'verb form',
  prefix: 'prefix verb',
  related: 'word family',
  english: 'English',
  hindi: 'हिन्दी',
};
