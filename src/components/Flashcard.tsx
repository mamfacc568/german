import { useState } from 'react';
import type { Entry } from '../data/dictionary';
import type { Card } from '../lib/deck';
import { formatInterval } from '../lib/deck';
import { ARTICLE_LABEL, type Article } from '../lib/genders';
import { renderMarked, speakGerman } from '../lib/markup';
import {
  BookmarkIcon,
  BulbIcon,
  CheckIcon,
  ClearIcon,
  FlipIcon,
  ReplayIcon,
  SpeakerIcon,
  TagIcon,
  TranslateIcon,
} from './Icons';

const ARTICLES: Article[] = ['der', 'die', 'das'];

const GENDER_WORD: Record<Exclude<Entry['gender'], 'none'>, string> = {
  die: 'feminine',
  der: 'masculine',
  das: 'neuter',
};

type Props = {
  entry: Entry;
  card: Card;
  flipped: boolean;
  onFlip: () => void;
  deckName: string;
};

export function Flashcard({ entry, card, flipped, onFlip, deckName }: Props) {
  const [hintOpen, setHintOpen] = useState(false);
  const [guess, setGuess] = useState<Article | null>(null);
  const example = entry.examples[0];
  const isNoun = entry.gender !== 'none';
  const answer = entry.gender as Article;
  const correct = guess !== null && guess === answer;

  return (
    <div className="flashcard-stage">
      <div className={`flashcard${flipped ? ' is-flipped' : ''}`}>
        {/* ---------------------------------------------------------- front */}
        <div className="face face-front" aria-hidden={flipped}>
          <div className="face-top">
            <span className="chip chip-quiet">
              <TagIcon size={13} />
              {entry.gender === 'none' ? 'Verb' : 'Noun'}
            </span>
            <div className="face-top-right">
              <button type="button" className="round-btn" aria-label="Bookmark this card">
                <BookmarkIcon size={16} />
              </button>
              <span className="chip chip-deck">{deckName}</span>
            </div>
          </div>

          <div className="face-body">
            <div className="prompt-badge">
              <TranslateIcon size={26} />
            </div>
            <h2 className="prompt-word">{entry.word}</h2>
            <p className="prompt-ask">
              {isNoun ? 'Which article is correct?' : 'Do you know the meaning?'}
            </p>

            {isNoun && (
              <div className="article-quiz">
                <p className="quiz-label">Tap your guess</p>
                <div className="quiz-row">
                  {ARTICLES.map((article) => {
                    const answered = guess !== null;
                    const state = !answered
                      ? undefined
                      : article === answer
                        ? 'correct'
                        : article === guess
                          ? 'wrong'
                          : 'dim';
                    return (
                      <button
                        key={article}
                        type="button"
                        className="quiz-btn"
                        data-gender={article}
                        data-state={state}
                        disabled={answered}
                        onClick={() => {
                          setGuess(article);
                          speakGerman(`${article} ${entry.word}`);
                        }}
                      >
                        <span className="quiz-article">
                          <span className="dot" data-gender={article} />
                          {article}
                        </span>
                        <span className="quiz-name">{ARTICLE_LABEL[article]}</span>
                      </button>
                    );
                  })}
                </div>

                {guess !== null && (
                  <p className="quiz-result" data-ok={correct}>
                    {correct ? <CheckIcon size={14} /> : <ClearIcon size={14} />}
                    {correct ? 'Correct! ' : 'Not quite — it is '}
                    <b>
                      {answer} {entry.word}
                    </b>{' '}
                    ({ARTICLE_LABEL[answer]})
                  </p>
                )}
              </div>
            )}

            {example && (
              <div className="cloze">
                <p>
                  “{renderMarked(example.de, (_, key) => <span className="blank" key={key} />)}”
                </p>
              </div>
            )}

            <button
              type="button"
              className="hint-btn"
              onClick={() => setHintOpen((open) => !open)}
              aria-expanded={hintOpen}
            >
              <BulbIcon size={14} />
              {hintOpen ? 'Hide hint' : 'Show hint'}
            </button>
            {hintOpen && entry.tip && <p className="hint-box">{entry.tip.text.replace(/\|\||\*\*/g, '')}</p>}
          </div>

          <button type="button" className="flip-btn" onClick={onFlip}>
            <FlipIcon size={18} />
            Tap to flip
          </button>
        </div>

        {/* ----------------------------------------------------------- back */}
        <div className="face face-back" aria-hidden={!flipped}>
          <div className="face-top">
            <span className="article-pill" data-gender={entry.gender}>
              <span className="dot" data-gender={entry.gender} />
              {entry.gender === 'none'
                ? entry.partOfSpeech
                : `${entry.gender} (${GENDER_WORD[entry.gender]})`}
            </span>
            <div className="face-top-right">
              <button
                type="button"
                className="audio-btn"
                onClick={() => speakGerman(entry.word)}
                aria-label={`Hear ${entry.word}`}
              >
                <SpeakerIcon size={16} />
                Audio
              </button>
              <button type="button" className="round-btn" onClick={onFlip} aria-label="Flip back">
                <ReplayIcon size={16} />
              </button>
            </div>
          </div>

          <div className="back-body">
            <p className="back-word">
              {entry.gender !== 'none' && <span className="back-article">{entry.gender}</span>}
              {entry.word}
            </p>
            <p className="back-ipa">{entry.ipa}</p>

            <div className="back-meaning">
              <span className="field-label">Meaning</span>
              <p>{entry.primaryMeaning}</p>
            </div>

            {entry.plural && (
              <p className="back-plural">
                <TagIcon size={14} />
                Plural: <b>{entry.plural}</b>
              </p>
            )}

            {example && (
              <div className="back-example">
                <p className="back-example-de">
                  “{renderMarked(example.de, (part, key) => <mark key={key}>{part}</mark>)}”
                </p>
                <p className="back-example-en">
                  “{renderMarked(example.en, (part, key) => <b key={key}>{part}</b>)}”
                </p>
              </div>
            )}

            {entry.family && (
              <div className="back-family">
                <span className="field-label">Word family</span>
                <span className="chip chip-quiet">
                  {entry.family.rootKind}: {entry.family.root}
                </span>
                {entry.family.relatives.slice(0, 1).map((relative) => (
                  <span className="chip chip-quiet" key={relative.word}>
                    {relative.article ? `${relative.article} ` : ''}
                    {relative.word}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="back-foot">
            <span>
              Level {Math.max(1, card.stage)} ·{' '}
              {card.interval > 0 ? `seen every ${formatInterval(card.interval)}` : 'still learning'}
            </span>
            <span className="back-foot-reps">
              {card.reps} {card.reps === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
