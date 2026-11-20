import type { Entry, Example, Gender } from '../data/dictionary';

/**
 * Live German lookup from the English Wiktionary.
 *
 * Why this source: no API key, no rate-limit sign-up, CORS is open so the
 * browser can call it directly, and the German entries carry their meanings
 * in English — which is exactly what this app needs.
 *
 * Two requests per word: the clean definition JSON, and the raw wikitext for
 * gender, IPA, verb parts and usage examples.
 */

const API = 'https://en.wiktionary.org/w/api.php';
const REST = 'https://en.wiktionary.org/api/rest_v1/page/definition';

const json = async (url: string, signal?: AbortSignal) => {
  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`${response.status}`);
  return response.json();
};

/* ------------------------------------------------------------ suggest --- */

/** Prefix autocomplete across Wiktionary's titles. */
export async function suggestWords(prefix: string, signal?: AbortSignal): Promise<string[]> {
  const q = prefix.trim();
  if (q.length < 2) return [];
  const url = `${API}?action=opensearch&search=${encodeURIComponent(q)}&limit=10&namespace=0&format=json&origin=*`;
  const data = (await json(url, signal)) as [string, string[]];
  return Array.isArray(data?.[1]) ? data[1] : [];
}

/* -------------------------------------------------------------- parse --- */

/** Everything between ==German== and the next language heading. */
function germanSection(wikitext: string): string {
  const match = wikitext.match(/(^|\n)==\s*German\s*==\n([\s\S]*?)(?=\n----|\n==[^=]|$)/);
  return match ? match[2] : '';
}

/** Strips wiki markup from a fragment of a line. */
function clean(text: string): string {
  return text
    .replace(/\{\{(?:l|m|w)\|de\|([^|}]+)[^}]*\}\}/g, '$1')
    .replace(/\{\{[^}]*\}\}/g, '')
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/'''?/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseGender(section: string): Gender {
  // {{de-noun|f}}, {{de-noun|m|...}}, {{de-noun|n|...}}
  const noun = section.match(/\{\{de-noun\|([^|}]+)/);
  if (noun) {
    const g = noun[1].trim().toLowerCase();
    if (g.startsWith('f')) return 'die';
    if (g.startsWith('m')) return 'der';
    if (g.startsWith('n')) return 'das';
  }
  return 'none';
}

function parseIpa(section: string): string {
  const match = section.match(/\{\{IPA\|de\|([^|}]+)/);
  return match ? `[${match[1].replace(/^\/|\/$/g, '')}]` : '';
}

function parsePlural(section: string): string | undefined {
  // {{de-noun|f|Entscheidungen}} — the plural is the second positional arg.
  const match = section.match(/\{\{de-noun\|[fmn][^|}]*\|([A-Za-zÄÖÜäöüß-]+)/);
  return match ? `die ${match[1]}` : undefined;
}

/** {{de-verb|stehen<stand,gestanden,…haben,sein>}} -> the principal parts. */
function parseVerbParts(section: string): { past?: string; participle?: string; aux?: string } {
  const match = section.match(/\{\{de-verb\|[^<}]*<([^>]*)>/);
  if (!match) return {};
  const inside = match[1];
  const [forms, auxPart] = inside.split('.');
  const [past, participle] = forms.split(',');
  const aux = auxPart?.split(',')[0]?.trim();
  return {
    past: past?.split(':')[0]?.trim() || undefined,
    participle: participle?.split(':')[0]?.trim() || undefined,
    aux: aux === 'sein' || aux === 'haben' ? aux : undefined,
  };
}

/** {{ux|de|Sentence.|Translation.}} — a real example with its English. */
function parseExamples(section: string): Example[] {
  const out: Example[] = [];
  const re = /\{\{ux[i]?\|de\|([^|}]+)\|([^|}]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(section)) !== null && out.length < 3) {
    const de = clean(m[1]);
    const en = clean(m[2]);
    if (de && en) out.push({ de, en });
  }
  return out;
}

function partOfSpeech(section: string): string {
  const heading = section.match(/\n=+\s*(Noun|Verb|Adjective|Adverb|Pronoun|Preposition|Conjunction|Interjection|Numeral|Proper noun)\s*=+/);
  return heading ? heading[1] : 'Word';
}

/* -------------------------------------------------------------- fetch --- */

type RestDefinition = {
  partOfSpeech?: string;
  language?: string;
  definitions?: { definition?: string }[];
};

async function fetchMeanings(word: string, signal?: AbortSignal): Promise<string[]> {
  try {
    const data = (await json(`${REST}/${encodeURIComponent(word)}`, signal)) as Record<
      string,
      RestDefinition[]
    >;
    const german = data.de ?? [];
    const out: string[] = [];
    for (const block of german) {
      for (const def of block.definitions ?? []) {
        const text = clean(def.definition ?? '');
        if (text) out.push(text);
      }
    }
    return out;
  } catch {
    return [];
  }
}

/** Best-effort Hindi. Never blocks the entry — failure just means no Hindi. */
export async function translateToHindi(english: string, signal?: AbortSignal): Promise<string> {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(english)}&langpair=en%7Chi`;
    const data = (await json(url, signal)) as { responseData?: { translatedText?: string } };
    const text = data.responseData?.translatedText?.trim() ?? '';
    // The service echoes the input back when it has no translation.
    return text && text.toLowerCase() !== english.toLowerCase() ? text : '';
  } catch {
    return '';
  }
}

const titleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/**
 * Looks a German word up and maps it onto the app's Entry shape.
 * Returns null when Wiktionary has no German section for it.
 */
export async function fetchEntry(word: string, signal?: AbortSignal): Promise<Entry | null> {
  const title = word.trim().replace(/^(der|die|das)\s+/i, '');
  if (!title) return null;

  const url = `${API}?action=parse&page=${encodeURIComponent(title)}&prop=wikitext&format=json&formatversion=2&origin=*`;

  let wikitext = '';
  try {
    const data = (await json(url, signal)) as { parse?: { wikitext?: string } };
    wikitext = data.parse?.wikitext ?? '';
  } catch {
    return null;
  }

  const section = germanSection(wikitext);
  if (!section) return null;

  const meanings = await fetchMeanings(title, signal);
  if (meanings.length === 0) return null;

  const gender = parseGender(section);
  const verb = parseVerbParts(section);
  const pos = partOfSpeech(section);

  // Wiktionary glosses carry long parentheticals; the headline wants the sense,
  // not the footnote. Strip them, drop duplicates, keep the first three.
  const short: string[] = [];
  for (const meaning of meanings) {
    const trimmed = meaning.replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (short.some((m) => m.toLowerCase() === key)) continue;
    short.push(trimmed);
    if (short.length === 3) break;
  }
  const primaryMeaning = short.map(titleCase).join(', ');

  const entry: Entry = {
    id: title.toLowerCase(),
    word: title,
    gender,
    partOfSpeech: gender === 'none' ? pos : `${pos} · ${gender}`,
    plural: parsePlural(section),
    ipa: parseIpa(section),
    primaryMeaning,
    examples: parseExamples(section),
    source: 'wiktionary',
  };

  if (verb.past && verb.participle) {
    entry.family = {
      rootKind: 'Principal parts',
      root: title,
      rootGloss: short[0] ?? '',
      stemForms: [verb.past, `${verb.aux === 'sein' ? 'ist' : 'hat'} ${verb.participle}`],
      relatives: [],
    };
  }

  return entry;
}
