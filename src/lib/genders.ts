import type { Entry, Gender } from '../data/dictionary';

export type Article = Exclude<Gender, 'none'>;

export type NounRow = {
  word: string;
  article: Article;
  gloss: string;
  /** The word to search for when this row is tapped. */
  openWord: string;
  /** True when the noun has a full dictionary entry of its own. */
  isEntry: boolean;
};

/**
 * Every noun the app knows: the head words plus the nouns listed in each
 * entry's word family. Deduplicated, head words win.
 */
export function collectNouns(entries: Entry[]): NounRow[] {
  const rows = new Map<string, NounRow>();

  for (const entry of entries) {
    if (entry.gender !== 'none') {
      rows.set(entry.word, {
        word: entry.word,
        article: entry.gender,
        gloss: entry.primaryMeaning,
        openWord: entry.word,
        isEntry: true,
      });
    }
  }

  for (const entry of entries) {
    for (const relative of entry.family?.relatives ?? []) {
      if (!relative.article || rows.has(relative.word)) continue;
      rows.set(relative.word, {
        word: relative.word,
        article: relative.article,
        gloss: relative.gloss,
        openWord: entry.word,
        isEntry: false,
      });
    }
  }

  return [...rows.values()].sort((a, b) => a.word.localeCompare(b.word, 'de'));
}

export const ARTICLE_LABEL: Record<Article, string> = {
  der: 'Masculine',
  die: 'Feminine',
  das: 'Neuter',
};

/* ------------------------------------------------------------------------ */
/* Ending rules — checked against the real word list, not just asserted.     */
/* ------------------------------------------------------------------------ */

export type EndingRule = {
  suffix: string;
  article: Article;
  /** "always" rules have no common exceptions; "usually" ones do. */
  strength: 'always' | 'usually';
  note: string;
};

const RULES: EndingRule[] = [
  { suffix: '-ung', article: 'die', strength: 'always', note: 'Built from verbs: hoffen → die Hoffnung.' },
  { suffix: '-heit', article: 'die', strength: 'always', note: 'Turns adjectives into abstract nouns.' },
  { suffix: '-keit', article: 'die', strength: 'always', note: 'The -heit ending after -ig, -lich, -bar.' },
  { suffix: '-schaft', article: 'die', strength: 'always', note: 'Groups and relationships.' },
  { suffix: '-ion', article: 'die', strength: 'always', note: 'Usually a Latin loan word.' },
  { suffix: '-nis', article: 'das', strength: 'usually', note: 'A handful are feminine, e.g. die Erlaubnis.' },
  { suffix: '-chen', article: 'das', strength: 'always', note: 'Diminutives are neuter, whatever the root was.' },
  { suffix: '-lein', article: 'das', strength: 'always', note: 'The other diminutive ending.' },
  { suffix: '-um', article: 'das', strength: 'usually', note: 'Latin neuters: das Museum, das Datum.' },
  { suffix: '-er', article: 'der', strength: 'usually', note: 'Doers and tools — but die Mutter, die Butter.' },
  { suffix: '-ling', article: 'der', strength: 'always', note: 'Always masculine.' },
  { suffix: '-ismus', article: 'der', strength: 'always', note: 'Always masculine.' },
];

export type RuleMatch = EndingRule & {
  /** Words in the list that follow the rule. */
  matches: NounRow[];
  /** Words that end the same way but take a different article. */
  exceptions: NounRow[];
};

/** Only returns rules that actually have a word in this dictionary. */
export function matchRules(nouns: NounRow[]): RuleMatch[] {
  return RULES.map((rule) => {
    const ending = rule.suffix.slice(1);
    const hits = nouns.filter((noun) => noun.word.toLowerCase().endsWith(ending));
    return {
      ...rule,
      matches: hits.filter((noun) => noun.article === rule.article),
      exceptions: hits.filter((noun) => noun.article !== rule.article),
    };
  })
    .filter((rule) => rule.matches.length + rule.exceptions.length > 0)
    .sort((a, b) => b.matches.length - a.matches.length);
}

export function countByArticle(nouns: NounRow[]): Record<Article, number> {
  const counts: Record<Article, number> = { der: 0, die: 0, das: 0 };
  for (const noun of nouns) counts[noun.article] += 1;
  return counts;
}
