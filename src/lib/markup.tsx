import { Fragment, type ReactNode } from 'react';

/**
 * Splits a string on a [[marker]] and renders the marked parts with `wrap`.
 * Used for underlining the head word inside example sentences.
 */
export function renderMarked(
  text: string,
  wrap: (part: string, key: number) => ReactNode,
  pattern: RegExp = /\[\[(.+?)\]\]/g,
): ReactNode[] {
  const out: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  pattern.lastIndex = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      out.push(<Fragment key={`t${key}`}>{text.slice(lastIndex, match.index)}</Fragment>);
    }
    out.push(wrap(match[1], key));
    lastIndex = match.index + match[0].length;
    key += 1;
  }
  if (lastIndex < text.length) {
    out.push(<Fragment key={`t${key}`}>{text.slice(lastIndex)}</Fragment>);
  }
  return out;
}

/**
 * Renders the two emphasis markers used in notes and tips:
 *   **text** -> bold   (an English term being stressed)
 *   ||text|| -> italic (a German form being quoted)
 */
export function renderRich(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern = /\*\*(.+?)\*\*|\|\|(.+?)\|\|/g;
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      out.push(<Fragment key={`t${key}`}>{text.slice(lastIndex, match.index)}</Fragment>);
    }
    out.push(
      match[1] !== undefined ? (
        <b key={`m${key}`}>{match[1]}</b>
      ) : (
        <i key={`m${key}`}>{match[2]}</i>
      ),
    );
    lastIndex = match.index + match[0].length;
    key += 1;
  }
  if (lastIndex < text.length) {
    out.push(<Fragment key={`t${key}`}>{text.slice(lastIndex)}</Fragment>);
  }
  return out;
}

/** Speaks German text with the browser's built-in voices, if one is available. */
export function speakGerman(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const clean = text.replace(/\[\[|\]\]/g, '');
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = 'de-DE';
  utterance.rate = 0.92;
  const german = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith('de'));
  if (german) utterance.voice = german;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
