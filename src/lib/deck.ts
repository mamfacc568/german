import { useSyncExternalStore } from 'react';

export type Rating = 'again' | 'hard' | 'good' | 'easy';

export type Card = {
  entryId: string;
  /** How many times it has been answered. 0 = brand new. */
  reps: number;
  /** How many times it has been forgotten. */
  lapses: number;
  /** SM-2 ease factor. */
  ease: number;
  /** Current interval in days. 0 means it is still in learning. */
  interval: number;
  /** When it is next due, epoch ms. */
  due: number;
  /** Shown as "Level N" on the card back. */
  stage: number;
};

export type DeckState = Record<string, Card>;

const STORAGE_KEY = 'wortschatz.deck.v1';
const MINUTE = 1 / (24 * 60);
const MAX_INTERVAL = 365 * 2;

const EASE_DELTA: Record<Rating, number> = {
  again: -0.2,
  hard: -0.15,
  good: 0,
  easy: 0.15,
};

/** Intervals a card gets the first time it graduates, in days. */
const GRADUATING: Record<Exclude<Rating, 'again'>, number> = {
  hard: 0.5, // 12 hours
  good: 1, // 1 day
  easy: 4, // 4 days
};

export function newCard(entryId: string, now = Date.now()): Card {
  return { entryId, reps: 0, lapses: 0, ease: 2.5, interval: 0, due: now, stage: 0 };
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** A simplified SM-2 step. Returns the card as it would be after this rating. */
export function schedule(card: Card, rating: Rating, now = Date.now()): Card {
  const ease = clamp(card.ease + EASE_DELTA[rating], 1.3, 3);

  let interval: number;
  if (rating === 'again') {
    interval = MINUTE;
  } else if (card.reps === 0 || card.interval === 0) {
    interval = GRADUATING[rating];
  } else if (rating === 'hard') {
    interval = card.interval * 1.2;
  } else if (rating === 'good') {
    interval = card.interval * ease;
  } else {
    interval = card.interval * ease * 1.35;
  }
  interval = Math.min(interval, MAX_INTERVAL);

  return {
    ...card,
    ease,
    interval,
    due: now + interval * 24 * 60 * 60 * 1000,
    reps: card.reps + 1,
    lapses: card.lapses + (rating === 'again' ? 1 : 0),
    stage: rating === 'again' ? 1 : card.stage + 1,
  };
}

/** The interval each button would give, for the labels under them. */
export function previewIntervals(card: Card): Record<Rating, string> {
  const ratings: Rating[] = ['again', 'hard', 'good', 'easy'];
  const out = {} as Record<Rating, string>;
  for (const rating of ratings) {
    out[rating] = formatInterval(schedule(card, rating).interval);
  }
  return out;
}

export function formatInterval(days: number): string {
  const minutes = days * 24 * 60;
  if (minutes < 2) return '<1 min';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = days * 24;
  if (hours < 24) return `${Math.round(hours)} hr`;
  if (days < 30) return `${Math.round(days)} ${Math.round(days) === 1 ? 'day' : 'days'}`;
  if (days < 365) return `${(days / 30).toFixed(days / 30 < 10 ? 1 : 0)} mo`;
  return `${(days / 365).toFixed(1)} yr`;
}

export type Bucket = 'new' | 'learning' | 'review';

export function bucketOf(card: Card): Bucket {
  if (card.reps === 0) return 'new';
  if (card.interval < 1) return 'learning';
  return 'review';
}

/* ---------------------------------------------------------------- store --- */

function load(): DeckState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as DeckState;
  } catch {
    /* private mode, blocked storage — fall through to a seeded deck */
  }
  return {};
}

let state: DeckState = load();
const listeners = new Set<() => void>();

function commit(next: DeckState) {
  state = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* not persisting is fine; the session still works */
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useDeck(): DeckState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );
}

export function addToDeck(entryId: string) {
  if (state[entryId]) return;
  commit({ ...state, [entryId]: newCard(entryId) });
}

export function removeFromDeck(entryId: string) {
  if (!state[entryId]) return;
  const next = { ...state };
  delete next[entryId];
  commit(next);
}

export function rateCard(entryId: string, rating: Rating) {
  const card = state[entryId];
  if (!card) return;
  commit({ ...state, [entryId]: schedule(card, rating) });
  appendReview({ t: Date.now(), entryId, rating });
}

/* ----------------------------------------------------------- review log --- */

export type ReviewEvent = { t: number; entryId: string; rating: Rating };

const LOG_KEY = 'wortschatz.log.v1';
const LOG_LIMIT = 2000;

function loadLog(): ReviewEvent[] {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    if (raw) return JSON.parse(raw) as ReviewEvent[];
  } catch {
    /* ignore */
  }
  return [];
}

let reviewLog: ReviewEvent[] = loadLog();
const logListeners = new Set<() => void>();

function appendReview(event: ReviewEvent) {
  reviewLog = [...reviewLog, event].slice(-LOG_LIMIT);
  try {
    localStorage.setItem(LOG_KEY, JSON.stringify(reviewLog));
  } catch {
    /* ignore */
  }
  logListeners.forEach((listener) => listener());
}

function subscribeLog(listener: () => void) {
  logListeners.add(listener);
  return () => logListeners.delete(listener);
}

export function useReviewLog(): ReviewEvent[] {
  return useSyncExternalStore(
    subscribeLog,
    () => reviewLog,
    () => reviewLog,
  );
}

/** Cards that are due now, hardest buckets first: learning, then new, then review. */
export function dueQueue(deck: DeckState, now = Date.now()): Card[] {
  const order: Record<Bucket, number> = { learning: 0, new: 1, review: 2 };
  return Object.values(deck)
    .filter((card) => card.due <= now)
    .sort((a, b) => order[bucketOf(a)] - order[bucketOf(b)] || a.due - b.due);
}

export function deckStats(deck: DeckState, now = Date.now()) {
  const due = dueQueue(deck, now);
  const counts = { new: 0, learning: 0, review: 0 };
  for (const card of due) counts[bucketOf(card)] += 1;

  const all = Object.values(deck);
  const mature = all.filter((card) => card.interval >= 1);
  const reviewed = all.filter((card) => card.reps > 0);
  const totalReps = reviewed.reduce((sum, card) => sum + card.reps, 0);
  const totalLapses = reviewed.reduce((sum, card) => sum + card.lapses, 0);
  const retention = totalReps > 0 ? Math.round(((totalReps - totalLapses) / totalReps) * 100) : 100;

  return { due, counts, dueCount: due.length, retention, retained: mature.length, size: all.length };
}
