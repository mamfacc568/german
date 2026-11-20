/**
 * Shapes only. There is no bundled dictionary any more — entries are fetched
 * live from Wiktionary (src/lib/wiktionary.ts) and cached on the device
 * (src/lib/words.ts), so anything you have looked up once works offline.
 *
 * Most fields are optional because an online source does not supply all of
 * them. Every screen renders a section only when its data is present.
 */

export type Gender = 'der' | 'die' | 'das' | 'none';

export type Example = {
  /** German sentence. Wrap the target word in [[ ]] to underline it. */
  de: string;
  /** English translation. Wrap the matching word in [[ ]] to emphasise it. */
  en: string;
  /** CEFR band, when known. Online lookups do not carry one. */
  level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
};

export type Relative = {
  word: string;
  article?: Exclude<Gender, 'none'>;
  gloss: string;
};

export type ConjugationForm = { pronoun: string; form: string };

export type Tense = {
  id: string;
  label: string;
  english: string;
  forms: ConjugationForm[];
};

export type Conjugation = {
  verb: string;
  mood: string;
  tenses: Tense[];
  note?: string;
};

export type PrefixVerb = {
  verb: string;
  prefix: string;
  ipa: string;
  separable: boolean;
  auxiliary: 'SEIN' | 'HABEN';
  gloss: string;
  example: Example;
};

export type Entry = {
  id: string;
  word: string;
  gender: Gender;
  partOfSpeech: string;
  plural?: string;
  ipa?: string;
  /** Plain-English respelling. Hand-written only; never from the API. */
  respelling?: string;
  primaryMeaning: string;
  /** Meaning in Devanagari, fetched best-effort. */
  hindi?: string;
  hindiRoman?: string;
  examples: Example[];
  conjugation?: Conjugation;
  family?: {
    rootKind: string;
    root: string;
    rootGloss: string;
    stemForms: string[];
    relatives: Relative[];
  };
  prefixVerbs?: {
    stem: string;
    verbs: PrefixVerb[];
  };
  tip?: { title: string; text: string };
  /** Where the entry came from, so the UI can be honest about it. */
  source?: 'wiktionary';
};
