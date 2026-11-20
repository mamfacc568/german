import { DICTIONARY, type Entry, type Example } from '../data/dictionary';
import { bucketOf, type Bucket, type DeckState, type ReviewEvent } from './deck';
import type { Article } from './genders';

const DAY = 24 * 60 * 60 * 1000;
const byId = new Map(DICTIONARY.map((entry) => [entry.id, entry]));

/** Local calendar day key, so "today" means the user's today. */
export function dayKey(t: number): string {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const startOfDay = (t: number) => {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

/**
 * Consecutive days with at least one review, counting back from today.
 * A day studied yesterday but not yet today still keeps the streak alive.
 */
export function studyStreak(log: ReviewEvent[], now = Date.now()): number {
  if (log.length === 0) return 0;
  const days = new Set(log.map((event) => dayKey(event.t)));

  let cursor = startOfDay(now);
  if (!days.has(dayKey(cursor))) {
    cursor -= DAY;
    if (!days.has(dayKey(cursor))) return 0;
  }

  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor -= DAY;
  }
  return streak;
}

export type DayBar = { key: string; label: string; count: number };

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Reviews per day for the last `days` days, oldest first. */
export function activity(log: ReviewEvent[], days = 14, now = Date.now()): DayBar[] {
  const counts = new Map<string, number>();
  for (const event of log) {
    const key = dayKey(event.t);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const out: DayBar[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const t = startOfDay(now) - i * DAY;
    const key = dayKey(t);
    out.push({
      key,
      label: i === 0 ? 'Today' : WEEKDAY[new Date(t).getDay()],
      count: counts.get(key) ?? 0,
    });
  }
  return out;
}

/** How many cards fall due on each of the next `days` days. */
export function forecast(deck: DeckState, days = 7, now = Date.now()): DayBar[] {
  const today = startOfDay(now);
  const out: DayBar[] = [];

  for (let i = 0; i < days; i += 1) {
    const dayStart = today + i * DAY;
    const dayEnd = dayStart + DAY;
    const count = Object.values(deck).filter((card) =>
      // Anything already overdue counts against today.
      i === 0 ? card.due < dayEnd : card.due >= dayStart && card.due < dayEnd,
    ).length;
    out.push({
      key: dayKey(dayStart),
      label: i === 0 ? 'Today' : WEEKDAY[new Date(dayStart).getDay()],
      count,
    });
  }
  return out;
}

export type Mix = { id: string; label: string; count: number };

/** New / Learning / Review, the same three buckets the deck screen counts. */
export function deckMix(deck: DeckState): Mix[] {
  const counts: Record<Bucket, number> = { new: 0, learning: 0, review: 0 };
  for (const card of Object.values(deck)) counts[bucketOf(card)] += 1;
  return [
    { id: 'new', label: 'New', count: counts.new },
    { id: 'learning', label: 'Learning', count: counts.learning },
    { id: 'review', label: 'Review', count: counts.review },
  ];
}

/** Cards whose interval has grown past three weeks — properly known words. */
export function matureCount(deck: DeckState): number {
  return Object.values(deck).filter((card) => card.interval >= 21).length;
}

export function genderMix(deck: DeckState): { article: Article; count: number }[] {
  const counts: Record<Article, number> = { der: 0, die: 0, das: 0 };
  for (const id of Object.keys(deck)) {
    const entry = byId.get(id);
    if (entry && entry.gender !== 'none') counts[entry.gender] += 1;
  }
  return (['der', 'die', 'das'] as Article[]).map((article) => ({ article, count: counts[article] }));
}

const LEVELS: Example['level'][] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export function levelMix(deck: DeckState): Mix[] {
  const counts = new Map<string, number>();
  for (const id of Object.keys(deck)) {
    const level = byId.get(id)?.examples[0]?.level;
    if (level) counts.set(level, (counts.get(level) ?? 0) + 1);
  }
  return LEVELS.filter((level) => counts.has(level)).map((level) => ({
    id: level,
    label: level,
    count: counts.get(level) ?? 0,
  }));
}

export type TypeRow = {
  id: 'noun' | 'verb';
  label: string;
  /** Cards of this type in the deck. */
  total: number;
  /** How many of them have been reviewed at least once. */
  studied: number;
};

/** Nouns versus verbs — how many are in the deck and how many you have worked on. */
export function wordTypes(deck: DeckState): TypeRow[] {
  const tally = {
    noun: { total: 0, studied: 0 },
    verb: { total: 0, studied: 0 },
  };

  for (const [id, card] of Object.entries(deck)) {
    const entry = byId.get(id);
    if (!entry) continue;
    const slot = entry.gender === 'none' ? tally.verb : tally.noun;
    slot.total += 1;
    if (card.reps > 0) slot.studied += 1;
  }

  return [
    { id: 'noun', label: 'Nouns', ...tally.noun },
    { id: 'verb', label: 'Verbs', ...tally.verb },
  ];
}

export function accuracy(log: ReviewEvent[]) {
  if (log.length === 0) return { reviews: 0, recalled: 0, percent: null as number | null };
  const recalled = log.filter((event) => event.rating !== 'again').length;
  return { reviews: log.length, recalled, percent: Math.round((recalled / log.length) * 100) };
}

/** The words with the most lapses — what to work on next. */
export function troubleWords(deck: DeckState, limit = 3): { entry: Entry; lapses: number }[] {
  return Object.values(deck)
    .filter((card) => card.lapses > 0)
    .sort((a, b) => b.lapses - a.lapses)
    .slice(0, limit)
    .map((card) => ({ entry: byId.get(card.entryId)!, lapses: card.lapses }))
    .filter((row) => row.entry);
}
