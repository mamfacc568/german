import { useSyncExternalStore } from 'react';
import type { Entry } from '../data/dictionary';
import { fetchEntry, translateToHindi } from './wiktionary';

/**
 * Every word the device has ever looked up, kept in localStorage.
 * This is what makes the app work offline: once a word has been seen,
 * it never needs the network again — and anything in the Anki deck is
 * by definition already here.
 */

const KEY = 'wortschatz.words.v1';

type WordMap = Record<string, Entry>;

function load(): WordMap {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as WordMap;
  } catch {
    /* blocked storage — run from memory for this session */
  }
  return {};
}

let words: WordMap = load();
const listeners = new Set<() => void>();

function commit(next: WordMap) {
  words = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(words));
  } catch {
    /* over quota or blocked; the session still works */
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useWords(): WordMap {
  return useSyncExternalStore(
    subscribe,
    () => words,
    () => words,
  );
}

export const getWords = (): WordMap => words;
export const allWords = (): Entry[] => Object.values(words);
export const getWord = (id: string): Entry | undefined => words[id];

export function saveWord(entry: Entry) {
  commit({ ...words, [entry.id]: entry });
}

export function forgetWord(id: string) {
  if (!words[id]) return;
  const next = { ...words };
  delete next[id];
  commit(next);
}

const normaliseId = (word: string) =>
  word.trim().replace(/^(der|die|das)\s+/i, '').toLowerCase();

/**
 * Cache first, network second. Returns null when Wiktionary has no German
 * entry for the word — the caller shows "not found" rather than an error.
 */
export async function lookupWord(word: string, signal?: AbortSignal): Promise<Entry | null> {
  const id = normaliseId(word);
  if (!id) return null;

  const cached = words[id];
  if (cached) return cached;

  const entry = await fetchEntry(word, signal);
  if (!entry) return null;

  saveWord(entry);

  // Hindi is a nice-to-have: fetch it after the entry is already on screen.
  void enrichHindi(entry, signal);

  return entry;
}

async function enrichHindi(entry: Entry, signal?: AbortSignal) {
  if (entry.hindi) return;
  const first = entry.primaryMeaning.split(',')[0]?.trim();
  if (!first) return;
  const hindi = await translateToHindi(first, signal);
  if (!hindi) return;
  const current = words[entry.id];
  if (!current || current.hindi) return;
  commit({ ...words, [entry.id]: { ...current, hindi } });
}
