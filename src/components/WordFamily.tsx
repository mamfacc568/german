import { useState } from 'react';
import type { Entry } from '../data/dictionary';
import { CheckIcon, NetworkIcon, PlusIcon } from './Icons';

type Family = NonNullable<Entry['family']>;

export function WordFamily({ family }: { family: Family }) {
  const [expanded, setExpanded] = useState(false);
  const [added, setAdded] = useState<string[]>([]);

  const toggle = (word: string) =>
    setAdded((current) =>
      current.includes(word) ? current.filter((w) => w !== word) : [...current, word],
    );

  const visible = expanded ? family.relatives : family.relatives.slice(0, 4);

  return (
    <section aria-label="Word family and stem forms">
      <div className="section-head">
        <NetworkIcon />
        <h2>Word family &amp; stem forms</h2>
        <button type="button" className="link" onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      <div className="card family">
        <div className="root-card">
          <div className="root-top">
            <span className="root-kind">{family.rootKind}</span>
            <span className="root-word">{family.root}</span>
            <button
              type="button"
              className={`add-btn${added.includes(family.root) ? ' is-added' : ''}`}
              onClick={() => toggle(family.root)}
              aria-label={`Add ${family.root} to deck`}
            >
              {added.includes(family.root) ? <CheckIcon size={13} /> : <PlusIcon size={13} />}
            </button>
          </div>
          <p className="root-meta">
            {family.rootGloss} · Stem forms: <b>{family.stemForms.join(' · ')}</b>
          </p>
        </div>

        <ul className="relatives">
          {visible.map((relative) => (
            <li className="relative" key={relative.word}>
              <span className="dot" data-gender={relative.article ?? 'none'} />
              <p className="relative-text">
                {relative.article && <i>{relative.article} </i>}
                <b>{relative.word}</b> <span>({relative.gloss})</span>
              </p>
              <button
                type="button"
                className={`add-btn${added.includes(relative.word) ? ' is-added' : ''}`}
                onClick={() => toggle(relative.word)}
                aria-label={`Add ${relative.word} to deck`}
              >
                {added.includes(relative.word) ? <CheckIcon size={13} /> : <PlusIcon size={13} />}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
