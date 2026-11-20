import { useState } from 'react';
import type { Entry } from '../data/dictionary';
import { speakGerman } from '../lib/markup';
import { CardsIcon, CheckIcon, SpeakerIcon } from './Icons';

const GENDER_LABEL: Record<Entry['gender'], string> = {
  die: 'Die · Feminine',
  der: 'Der · Masculine',
  das: 'Das · Neuter',
  none: 'Verb',
};

type Props = {
  entry: Entry;
  saved: boolean;
  onToggleSave: () => void;
};

export function WordCard({ entry, saved, onToggleSave }: Props) {
  const [playing, setPlaying] = useState(false);

  const speak = () => {
    speakGerman(entry.word);
    setPlaying(true);
    window.setTimeout(() => setPlaying(false), 900);
  };

  return (
    <section className="card entry animate-in" aria-label={`Entry for ${entry.word}`}>
      <div className="entry-top">
        <div className="entry-top-left">
          <span className="gender-pill" data-gender={entry.gender}>
            {entry.gender === 'none' ? entry.partOfSpeech : GENDER_LABEL[entry.gender]}
          </span>
          {entry.plural && (
            <p className="entry-plural">
              Plural: <b>{entry.plural}</b>
            </p>
          )}
        </div>
        <button
          type="button"
          className={`speak-btn${playing ? ' is-playing' : ''}`}
          onClick={speak}
          aria-label={`Hear ${entry.word} pronounced`}
        >
          <SpeakerIcon />
        </button>
      </div>

      <div>
        <h2 className="entry-word">{entry.word}</h2>
        <p className="entry-phonetic">
          {entry.ipa} · say it like <b>{entry.respelling}</b>
        </p>
      </div>

      <div className="field">
        <p className="field-label">Primary meaning</p>
        <p className="field-primary">{entry.primaryMeaning}</p>
      </div>

      {entry.contextMeaning && (
        <div className="field">
          <p className="field-label">Context / nuance</p>
          <p className="field-value">
            {entry.contextMeaning} <span>({entry.contextDomain})</span>
          </p>
        </div>
      )}

      <button
        type="button"
        className={`btn btn-block ${saved ? 'btn-success' : 'btn-primary'}`}
        onClick={onToggleSave}
      >
        {saved ? <CheckIcon size={17} /> : <CardsIcon size={17} />}
        {saved ? 'Saved to Anki deck' : '+ Add to Anki deck'}
      </button>
    </section>
  );
}
