import type { Entry } from '../data/dictionary';

/** Why a term pointed at an entry — shown as a tag on the suggestion row. */
export type TermKind = 'word' | 'plural' | 'form' | 'prefix' | 'related' | 'english' | 'hindi';

export type SearchResult = {
  entry: Entry;
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

type Term = { text: string; norm: string; kind: TermKind; entry: Entry };

function termsOf(entry: Entry): Term[] {
  const terms: Term[] = [];
  const push = (text: string | undefined, kind: TermKind) => {
    if (!text) return;
    const norm = normalise(text);
    if (norm) terms.push({ text, norm, kind, entry });
  };

  push(entry.word, 'word');
  push(entry.plural, 'plural');
  for (const meaning of splitMeaning(entry.primaryMeaning)) push(meaning, 'english');
  for (const hi of (entry.hindi ?? '').split(',')) push(hi.trim(), 'hindi');
  for (const hi of (entry.hindiRoman ?? '').split(',')) push(hi.trim(), 'hindi');

  for (const tense of entry.conjugation?.tenses ?? []) {
    for (const cell of tense.forms) push(cell.form.replace('|', ''), 'form');
  }
  for (const stem of entry.family?.stemForms ?? []) push(stem, 'form');
  if (entry.family) {
    push(entry.family.root, 'related');
    for (const relative of entry.family.relatives) push(relative.word, 'related');
  }
  for (const verb of entry.prefixVerbs?.verbs ?? []) push(verb.verb, 'prefix');

  return terms;
}

const KIND_WEIGHT: Record<TermKind, number> = {
  word: 0,
  plural: 1,
  form: 2,
  prefix: 3,
  related: 4,
  english: 5,
  hindi: 6,
};

const allowsSubstring = (kind: TermKind) =>
  kind === 'word' || kind === 'plural' || kind === 'form';

/** Searches the words already on this device. Instant, works offline. */
export function searchCached(entries: Entry[], query: string, limit = 6): SearchResult[] {
  const q = normalise(query);
  if (!q) return [];

  const scored: { result: SearchResult; score: number }[] = [];

  for (const entry of entries) {
    for (const term of termsOf(entry)) {
      let position: number;
      if (term.norm === q) position = 0;
      else if (term.norm.startsWith(q)) position = 1;
      else if (allowsSubstring(term.kind) && term.norm.includes(q)) position = 2;
      else continue;

      const score = position * 100 + KIND_WEIGHT[term.kind] * 10 + Math.min(9, term.norm.length / 8);
      scored.push({ result: { entry, matched: term.text, kind: term.kind }, score });
    }
  }

  scored.sort((a, b) => a.score - b.score);

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

export const KIND_LABEL: Record<TermKind, string> = {
  word: '',
  plural: 'plural',
  form: 'verb form',
  prefix: 'prefix verb',
  related: 'word family',
  english: 'English',
  hindi: 'हिन्दी',
};
