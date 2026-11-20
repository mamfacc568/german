export type Gender = 'der' | 'die' | 'das' | 'none';

export type Example = {
  /** German sentence. Wrap the target word in [[ ]] to underline it. */
  de: string;
  /** English translation. Wrap the matching word in [[ ]] to emphasise it. */
  en: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
};

export type Relative = {
  word: string;
  /** Article for nouns; omit for adjectives, adverbs and verbs. */
  article?: Exclude<Gender, 'none'>;
  gloss: string;
};

/** A single person/number cell. Text after the "|" is the highlighted ending. */
export type ConjugationForm = { pronoun: string; form: string };

export type Tense = {
  id: string;
  /** German grammar term, e.g. "Präteritum". */
  label: string;
  /** English name shown under it, e.g. "Simple past". */
  english: string;
  forms: ConjugationForm[];
};

export type Conjugation = {
  /** The infinitive being conjugated — may differ from the head word. */
  verb: string;
  /** Mood badge, e.g. "Indikativ". */
  mood: string;
  tenses: Tense[];
  /** Optional caution note. Wrap emphasis in || ||. */
  note?: string;
};

export type PrefixVerb = {
  verb: string;
  /** The prefix itself, highlighted inside the infinitive. */
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
  /** Part of speech shown next to the gender, e.g. "Feminine noun". */
  partOfSpeech: string;
  plural?: string;
  ipa: string;
  respelling: string;
  primaryMeaning: string;
  /** Meaning in Hindi, in Devanagari. */
  hindi: string;
  /** The same Hindi, written in Latin letters. */
  hindiRoman: string;
  examples: Example[];
  conjugation?: Conjugation;
  family?: {
    rootKind: string;
    root: string;
    rootGloss: string;
    stemForms: string[];
    relatives: Relative[];
  };
  /** Verbs built from the same stem with a prefix. */
  prefixVerbs?: {
    /** The bare stem they are all built on, e.g. "stehen". */
    stem: string;
    verbs: PrefixVerb[];
  };
  tip?: { title: string; text: string };
};

const PRONOUNS = ['ich', 'du', 'er / sie / es', 'wir', 'ihr', 'sie / Sie'];

/** Pairs the six standard pronouns with six forms written as "stem|ending". */
const conjugate = (forms: string[]): ConjugationForm[] =>
  PRONOUNS.map((pronoun, index) => ({ pronoun, form: forms[index] }));

/* -------------------------------------------------------------------------
   Shared verb data
   ------------------------------------------------------------------------- */

const ENTSCHEIDEN_CONJUGATION: Conjugation = {
  verb: 'entscheiden',
  mood: 'Indikativ',
  tenses: [
    {
      id: 'praesens',
      label: 'Präsens',
      english: 'Present',
      forms: conjugate([
        'entscheid|e',
        'entscheid|est',
        'entscheid|et',
        'entscheid|en',
        'entscheid|et',
        'entscheid|en',
      ]),
    },
    {
      id: 'praeteritum',
      label: 'Präteritum',
      english: 'Simple past',
      forms: conjugate([
        'entschied|',
        'entschied|st',
        'entschied|',
        'entschied|en',
        'entschied|et',
        'entschied|en',
      ]),
    },
    {
      id: 'perfekt',
      label: 'Perfekt',
      english: 'Present perfect',
      forms: conjugate([
        'habe |entschieden',
        'hast |entschieden',
        'hat |entschieden',
        'haben |entschieden',
        'habt |entschieden',
        'haben |entschieden',
      ]),
    },
  ],
  note: 'Because the stem ends in **-d**, the present tense slips in an extra **e**: ||du entscheidest, er entscheidet|| — never “entscheidst”.',
};

const SCHEIDEN_PREFIX_VERBS: Entry['prefixVerbs'] = {
  stem: 'scheiden',
  verbs: [
    {
      verb: 'entscheiden',
      prefix: 'ent',
      ipa: '/ɛntˈʃaɪ̯dn̩/',
      separable: false,
      auxiliary: 'HABEN',
      gloss: 'to decide, to determine',
      example: {
        de: 'Wir [[entscheiden]] das erst morgen.',
        en: 'We will not [[decide]] that until tomorrow.',
        level: 'B1',
      },
    },
    {
      verb: 'unterscheiden',
      prefix: 'unter',
      ipa: '/ʊntɐˈʃaɪ̯dn̩/',
      separable: false,
      auxiliary: 'HABEN',
      gloss: 'to distinguish, to tell apart',
      example: {
        de: 'Man muss beide Fälle genau [[unterscheiden]].',
        en: 'You have to [[tell]] the two cases [[apart]] precisely.',
        level: 'B2',
      },
    },
    {
      verb: 'ausscheiden',
      prefix: 'aus',
      ipa: '/ˈaʊ̯sˌʃaɪ̯dn̩/',
      separable: true,
      auxiliary: 'SEIN',
      gloss: 'to drop out, to be eliminated',
      example: {
        de: 'Das Team [[scheidet]] heute leider [[aus]].',
        en: 'The team is [[knocked out]] today, unfortunately.',
        level: 'B2',
      },
    },
  ],
};

const HOFFEN_CONJUGATION: Conjugation = {
  verb: 'hoffen',
  mood: 'Indikativ',
  tenses: [
    {
      id: 'praesens',
      label: 'Präsens',
      english: 'Present',
      forms: conjugate(['hoff|e', 'hoff|st', 'hoff|t', 'hoff|en', 'hoff|t', 'hoff|en']),
    },
    {
      id: 'praeteritum',
      label: 'Präteritum',
      english: 'Simple past',
      forms: conjugate([
        'hoff|te',
        'hoff|test',
        'hoff|te',
        'hoff|ten',
        'hoff|tet',
        'hoff|ten',
      ]),
    },
    {
      id: 'perfekt',
      label: 'Perfekt',
      english: 'Present perfect',
      forms: conjugate([
        'habe |gehofft',
        'hast |gehofft',
        'hat |gehofft',
        'haben |gehofft',
        'habt |gehofft',
        'haben |gehofft',
      ]),
    },
  ],
  note: 'A regular (weak) verb: the Präteritum just bolts **-te-** onto the stem — ||hoffte, hofftest, hoffte||. No vowel change anywhere.',
};

/* -------------------------------------------------------------------------
   Entries
   ------------------------------------------------------------------------- */

export const DICTIONARY: Entry[] = [
  {
    id: 'entscheidung',
    word: 'Entscheidung',
    gender: 'die',
    partOfSpeech: 'Feminine noun',
    plural: 'die Entscheidungen',
    ipa: '[ɛntˈʃaɪ̯dʊŋ]',
    respelling: 'ent-SHY-doong',
    primaryMeaning: 'Decision, Choice, Resolution',
    hindi: 'निर्णय, फैसला',
    hindiRoman: 'nirnay, faisla',
    examples: [
      {
        de: 'Es war eine schwere [[Entscheidung]] für uns.',
        en: 'It was a tough [[decision]] for us.',
        level: 'B1',
      },
      {
        de: 'Er traf die richtige [[Entscheidung]] zur rechten Zeit.',
        en: 'He made the right [[decision]] at the right time.',
        level: 'B2',
      },
    ],
    conjugation: ENTSCHEIDEN_CONJUGATION,
    family: {
      rootKind: 'Verb root',
      root: 'entscheiden',
      rootGloss: 'to decide / to determine',
      stemForms: ['entscheidet', 'entschied', 'hat entschieden'],
      relatives: [
        { word: 'entscheidend', gloss: 'decisive, crucial' },
        { word: 'Unentschlossenheit', article: 'die', gloss: 'indecision' },
        { word: 'Entscheidungsprozess', article: 'der', gloss: 'decision-making process' },
        { word: 'Entscheidungsfindung', article: 'die', gloss: 'reaching a decision' },
      ],
    },
    prefixVerbs: SCHEIDEN_PREFIX_VERBS,
    tip: {
      title: 'Grammar memory hook',
      text: 'Nouns that end in “-ung” are almost always feminine in German: ||die Entscheidung, die Hoffnung, die Übung||!',
    },
  },
  {
    id: 'stehen',
    word: 'stehen',
    gender: 'none',
    partOfSpeech: 'Verb · irregular',
    ipa: '[ˈʃteːən]',
    respelling: 'SHTAY-uhn',
    primaryMeaning: 'To stand, To be located',
    hindi: 'खड़ा होना, स्थित होना',
    hindiRoman: 'khada hona, sthit hona',
    examples: [
      {
        de: 'Das Auto [[steht]] vor der Tür.',
        en: 'The car is [[standing]] outside the door.',
        level: 'A2',
      },
      {
        de: 'Was [[steht]] in der Zeitung?',
        en: 'What does it [[say]] in the newspaper?',
        level: 'B1',
      },
    ],
    conjugation: {
      verb: 'stehen',
      mood: 'Indikativ',
      tenses: [
        {
          id: 'praesens',
          label: 'Präsens',
          english: 'Present',
          forms: conjugate(['steh|e', 'steh|st', 'steh|t', 'steh|en', 'steh|t', 'steh|en']),
        },
        {
          id: 'praeteritum',
          label: 'Präteritum',
          english: 'Simple past',
          forms: conjugate(['stand|', 'stand|st', 'stand|', 'stand|en', 'stand|et', 'stand|en']),
        },
        {
          id: 'perfekt',
          label: 'Perfekt',
          english: 'Present perfect',
          forms: conjugate([
            'habe |gestanden',
            'hast |gestanden',
            'hat |gestanden',
            'haben |gestanden',
            'habt |gestanden',
            'haben |gestanden',
          ]),
        },
      ],
      note: 'The 1st and 3rd person singular take **no ending at all** in the Präteritum: ||ich stand, er stand||.',
    },
    family: {
      rootKind: 'Verb root',
      root: 'stehen',
      rootGloss: 'to stand, to be located',
      stemForms: ['steht', 'stand', 'hat gestanden'],
      relatives: [
        { word: 'Stand', article: 'der', gloss: 'state, stall, score' },
        { word: 'ständig', gloss: 'constant, permanent' },
        { word: 'Verständnis', article: 'das', gloss: 'understanding' },
        { word: 'Umstand', article: 'der', gloss: 'circumstance' },
      ],
    },
    prefixVerbs: {
      stem: 'stehen',
      verbs: [
        {
          verb: 'aufstehen',
          prefix: 'auf',
          ipa: '/ˈaʊ̯fˌʃteːən/',
          separable: true,
          auxiliary: 'SEIN',
          gloss: 'to get up, to rise',
          example: {
            de: 'Ich [[stehe]] morgens um 7 Uhr [[auf]].',
            en: 'I [[get up]] at 7 in the morning.',
            level: 'A2',
          },
        },
        {
          verb: 'verstehen',
          prefix: 'ver',
          ipa: '/fɛɐ̯ˈʃteːən/',
          separable: false,
          auxiliary: 'HABEN',
          gloss: 'to understand, to comprehend',
          example: {
            de: 'Ich [[verstehe]] die Grammatikregel nun genau.',
            en: 'I [[understand]] the grammar rule exactly now.',
            level: 'B1',
          },
        },
        {
          verb: 'entstehen',
          prefix: 'ent',
          ipa: '/ɛntˈʃteːən/',
          separable: false,
          auxiliary: 'SEIN',
          gloss: 'to arise, to originate, to emerge',
          example: {
            de: 'Hier [[entsteht]] ein modernes Sprachlabor.',
            en: 'A modern language lab is [[taking shape]] here.',
            level: 'B2',
          },
        },
      ],
    },
    tip: {
      title: 'Grammar memory hook',
      text: 'A separable prefix jumps to the end of the clause: ||Ich stehe um 7 Uhr auf||. An inseparable one never moves: ||Ich verstehe das||.',
    },
  },
  {
    id: 'hoffnung',
    word: 'Hoffnung',
    gender: 'die',
    partOfSpeech: 'Feminine noun',
    plural: 'die Hoffnungen',
    ipa: '[ˈhɔfnʊŋ]',
    respelling: 'HOF-noong',
    primaryMeaning: 'Hope, Expectation',
    hindi: 'आशा, उम्मीद',
    hindiRoman: 'aasha, ummeed',
    examples: [
      {
        de: 'Ich habe die [[Hoffnung]] noch nicht aufgegeben.',
        en: 'I have not given up [[hope]] yet.',
        level: 'B1',
      },
      {
        de: 'Es besteht [[Hoffnung]] auf eine schnelle Lösung.',
        en: 'There is [[hope]] for a quick solution.',
        level: 'B2',
      },
    ],
    conjugation: HOFFEN_CONJUGATION,
    family: {
      rootKind: 'Verb root',
      root: 'hoffen',
      rootGloss: 'to hope',
      stemForms: ['hofft', 'hoffte', 'hat gehofft'],
      relatives: [
        { word: 'hoffentlich', gloss: 'hopefully' },
        { word: 'hoffnungsvoll', gloss: 'hopeful' },
        { word: 'Hoffnungslosigkeit', article: 'die', gloss: 'hopelessness' },
        { word: 'Hoffnungsschimmer', article: 'der', gloss: 'glimmer of hope' },
      ],
    },
    prefixVerbs: {
      stem: 'hoffen',
      verbs: [
        {
          verb: 'erhoffen',
          prefix: 'er',
          ipa: '/ɛɐ̯ˈhɔfn̩/',
          separable: false,
          auxiliary: 'HABEN',
          gloss: 'to hope for, to look forward to',
          example: {
            de: 'Wir [[erhoffen]] uns eine schnelle Antwort.',
            en: 'We are [[hoping for]] a quick answer.',
            level: 'B2',
          },
        },
      ],
    },
    tip: {
      title: 'Grammar memory hook',
      text: 'Another “-ung” noun, so it is feminine too: ||die Hoffnung||. The verb behind it, ||hoffen||, is fully regular.',
    },
  },
  {
    id: 'entscheiden',
    word: 'entscheiden',
    gender: 'none',
    partOfSpeech: 'Verb · irregular',
    ipa: '[ɛntˈʃaɪ̯dn̩]',
    respelling: 'ent-SHY-den',
    primaryMeaning: 'To decide, To determine',
    hindi: 'निर्णय लेना, तय करना',
    hindiRoman: 'nirnay lena, tay karna',
    examples: [
      {
        de: 'Du musst selbst [[entscheiden]], was richtig ist.',
        en: 'You have to [[decide]] for yourself what is right.',
        level: 'B1',
      },
      {
        de: 'Das Gericht wird morgen [[entscheiden]].',
        en: 'The court will [[rule]] tomorrow.',
        level: 'C1',
      },
    ],
    conjugation: ENTSCHEIDEN_CONJUGATION,
    family: {
      rootKind: 'Verb root',
      root: 'scheiden',
      rootGloss: 'to separate / to part',
      stemForms: ['entscheidet', 'entschied', 'hat entschieden'],
      relatives: [
        { word: 'Entscheidung', article: 'die', gloss: 'decision' },
        { word: 'entscheidend', gloss: 'decisive' },
        { word: 'Scheidung', article: 'die', gloss: 'divorce' },
        { word: 'Unterschied', article: 'der', gloss: 'difference' },
      ],
    },
    prefixVerbs: SCHEIDEN_PREFIX_VERBS,
    tip: {
      title: 'Grammar memory hook',
      text: 'Reflexive use changes the sense: ||sich entscheiden|| means “to make up your mind”, while plain ||entscheiden|| decides a matter.',
    },
  },
  {
    id: 'weg',
    word: 'Weg',
    gender: 'der',
    partOfSpeech: 'Masculine noun',
    plural: 'die Wege',
    ipa: '[veːk]',
    respelling: 'vayk',
    primaryMeaning: 'Way, Path, Route',
    hindi: 'रास्ता, मार्ग',
    hindiRoman: 'raasta, maarg',
    examples: [
      {
        de: 'Wir suchen einen anderen [[Weg]] zum Ziel.',
        en: 'We are looking for another [[way]] to the goal.',
        level: 'A2',
      },
      {
        de: 'Der [[Weg]] durch den Wald ist kürzer.',
        en: 'The [[path]] through the forest is shorter.',
        level: 'A2',
      },
    ],
    family: {
      rootKind: 'Noun root',
      root: 'Weg',
      rootGloss: 'way, path',
      stemForms: ['der Weg', 'des Weges', 'die Wege'],
      relatives: [
        { word: 'unterwegs', gloss: 'on the way, en route' },
        { word: 'Autobahn', article: 'die', gloss: 'motorway' },
        { word: 'Wegweiser', article: 'der', gloss: 'signpost' },
        { word: 'bewegen', gloss: 'to move' },
      ],
    },
    tip: {
      title: 'Grammar memory hook',
      text: 'Careful with stress: ||der Wég|| (the path) is a noun, but ||wég|| as an adverb means “away, gone”.',
    },
  },
  {
    id: 'haus',
    word: 'Haus',
    gender: 'das',
    partOfSpeech: 'Neuter noun',
    plural: 'die Häuser',
    ipa: '[haʊ̯s]',
    respelling: 'howss',
    primaryMeaning: 'House, Home, Building',
    hindi: 'घर, मकान',
    hindiRoman: 'ghar, makaan',
    examples: [
      {
        de: 'Das [[Haus]] meiner Großeltern steht am See.',
        en: 'My grandparents’ [[house]] stands by the lake.',
        level: 'A1',
      },
      {
        de: 'Sie geht heute früher nach [[Hause]].',
        en: 'She is going [[home]] earlier today.',
        level: 'A2',
      },
    ],
    family: {
      rootKind: 'Noun root',
      root: 'Haus',
      rootGloss: 'house, home',
      stemForms: ['das Haus', 'des Hauses', 'die Häuser'],
      relatives: [
        { word: 'Hausaufgabe', article: 'die', gloss: 'homework' },
        { word: 'Haushalt', article: 'der', gloss: 'household' },
        { word: 'häuslich', gloss: 'domestic' },
        { word: 'Gehäuse', article: 'das', gloss: 'casing, shell' },
      ],
    },
    tip: {
      title: 'Grammar memory hook',
      text: 'Direction versus place: ||nach Hause|| means going home, ||zu Hause|| means being at home.',
    },
  },
];

const normalise = (value: string) =>
  value
    .toLowerCase()
    .replace(/^(der|die|das)\s+/, '')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ß/g, 'ss')
    .trim();

export function findEntry(query: string): Entry | undefined {
  const q = normalise(query);
  if (!q) return undefined;
  return (
    DICTIONARY.find((entry) => normalise(entry.word) === q) ??
    DICTIONARY.find((entry) => normalise(entry.word).startsWith(q)) ??
    DICTIONARY.find((entry) => normalise(entry.primaryMeaning).includes(q))
  );
}

export const SUGGESTIONS = ['die Entscheidung', 'stehen', 'die Hoffnung', 'der Weg', 'das Haus'];
