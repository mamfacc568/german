import { useMemo, useState } from 'react';
import type { Entry } from '../data/dictionary';
import { getWords } from '../lib/words';
import { dueQueue, deckStats, rateCard, useDeck, type Rating } from '../lib/deck';
import { speakGerman } from '../lib/markup';
import { Flashcard } from './Flashcard';
import { RatingDock } from './RatingDock';
import {
  BadgeCheckIcon,
  CardsIcon,
  CheckIcon,
  ChevronRightIcon,
  InboxIcon,
  SlidersIcon,
} from './Icons';

const LEVEL_NAME: Record<string, string> = {
  A1: 'Beginner',
  A2: 'Elementary',
  B1: 'Intermediate',
  B2: 'Upper intermediate',
  C1: 'Advanced',
  C2: 'Mastery',
};

const byId = { get: (id: string): Entry | undefined => getWords()[id] };

const AUDIO_KEY = 'wortschatz.autoAudio';
const readAutoAudio = () => {
  try {
    return localStorage.getItem(AUDIO_KEY) !== 'off';
  } catch {
    return true;
  }
};

export function DeckScreen() {
  const deck = useDeck();
  const stats = useMemo(() => deckStats(deck), [deck]);

  // The session queue is fixed when the screen opens, like a real Anki session.
  const [queue, setQueue] = useState<string[]>(() => dueQueue(deck).map((card) => card.entryId));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [autoAudio, setAutoAudio] = useState(readAutoAudio);

  const deckLevel = useMemo(() => {
    const levels = Object.keys(deck)
      .map((id) => byId.get(id)?.examples[0]?.level)
      .filter(Boolean) as string[];
    return levels.sort().at(-1) ?? 'B1';
  }, [deck]);

  const currentId = queue[index];
  const entry: Entry | undefined = currentId ? byId.get(currentId) : undefined;
  const card = currentId ? deck[currentId] : undefined;

  const toggleAudio = () => {
    setAutoAudio((on) => {
      try {
        localStorage.setItem(AUDIO_KEY, on ? 'off' : 'on');
      } catch {
        /* ignore */
      }
      return !on;
    });
  };

  const flip = () => {
    setFlipped((wasFlipped) => {
      if (!wasFlipped && autoAudio && entry) speakGerman(entry.word);
      return !wasFlipped;
    });
  };

  const handleRate = (rating: Rating) => {
    if (!currentId) return;
    rateCard(currentId, rating);
    setFlipped(false);
    if (rating === 'again') {
      // Put it back at the end of the session, the way Anki does.
      setQueue((current) => [...current.slice(0, index), ...current.slice(index + 1), currentId]);
    } else {
      setIndex((i) => i + 1);
    }
  };

  const restart = () => {
    setQueue(dueQueue(deck).map((c) => c.entryId));
    setIndex(0);
    setFlipped(false);
  };

  /* ------------------------------------------------------------- states --- */

  if (stats.size === 0) {
    return (
      <div className="screen">
        <div className="placeholder">
          <div className="placeholder-icon">
            <CardsIcon size={28} />
          </div>
          <h3>Your deck is empty</h3>
          <p>Look a word up in the Dictionary and tap “Add to Anki deck” to start studying it.</p>
        </div>
      </div>
    );
  }

  const total = queue.length;
  const position = Math.min(index + 1, total);
  const percent = total > 0 ? Math.round((index / total) * 100) : 100;

  return (
    <div className="screen">
      <header className="deck-head">
        <div className="deck-head-row">
          <div>
            <h1 className="deck-title">Daily review</h1>
            <p className="deck-sub">
              <span className="live-dot" />
              {stats.dueCount} {stats.dueCount === 1 ? 'word' : 'words'} due today
            </p>
          </div>
          <span className="level-chip">
            {deckLevel} · {LEVEL_NAME[deckLevel] ?? 'Intermediate'}
          </span>
        </div>

        <div className="counters">
          <div className="counter" data-bucket="new">
            <span>New</span>
            <b>{stats.counts.new}</b>
          </div>
          <div className="counter" data-bucket="learning">
            <span>Learning</span>
            <b>{stats.counts.learning}</b>
          </div>
          <div className="counter" data-bucket="review">
            <span>Review</span>
            <b>{stats.counts.review}</b>
          </div>
        </div>

        <div className="progress">
          <div className="progress-labels">
            <span>
              Card {position} of {total}
            </span>
            <span className="progress-pct">{percent}% done</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </header>

      {entry && card ? (
        <>
          <Flashcard
            key={`${entry.id}-${index}`}
            entry={entry}
            card={card}
            flipped={flipped}
            onFlip={flip}
            deckName={`Deck: Vocabulary ${deckLevel}`}
          />
          <RatingDock card={card} enabled={flipped} onRate={handleRate} />
        </>
      ) : (
        <div className="card session-done">
          <div className="placeholder-icon">
            <CheckIcon size={26} />
          </div>
          <h3>Session complete</h3>
          <p>
            Nothing else is due right now. {stats.size} {stats.size === 1 ? 'card' : 'cards'} in the
            deck — the next one comes back when its interval is up.
          </p>
          <button type="button" className="btn btn-secondary" onClick={restart}>
            Check for more
          </button>
        </div>
      )}

      <div className="card strip">
        <div className="strip-item">
          <div className="strip-icon">
            <BadgeCheckIcon size={17} />
          </div>
          <div>
            <span className="field-label">Retention</span>
            <p className="strip-value">{stats.retention}% correct</p>
          </div>
        </div>
        <div className="strip-divider" />
        <div className="strip-item strip-end">
          <div>
            <span className="field-label">Retained</span>
            <p className="strip-value strip-value-accent">{stats.retained} words</p>
          </div>
        </div>
      </div>

      <div className="card settings-bar">
        <div className="settings-left">
          <SlidersIcon size={18} />
          <span>Auto-audio</span>
        </div>
        <div className="settings-right">
          <button
            type="button"
            role="switch"
            aria-checked={autoAudio}
            aria-label="Play the word automatically when the card flips"
            className={`toggle${autoAudio ? ' is-on' : ''}`}
            onClick={toggleAudio}
          >
            <span className="toggle-knob" />
          </button>
          <div className="settings-divider" />
          <button type="button" className="settings-link">
            Options
            <ChevronRightIcon size={14} />
          </button>
        </div>
      </div>

      {stats.dueCount === 0 && stats.size > 0 && (
        <p className="deck-footnote">
          <InboxIcon size={15} /> All caught up — come back when the intervals are up.
        </p>
      )}
    </div>
  );
}

