import { useState } from 'react';
import type { Conjugation } from '../data/dictionary';
import { renderRich, speakGerman } from '../lib/markup';
import { BulbIcon, MatrixIcon, SpeakerIcon } from './Icons';

/** Splits "steh|e" into the stem and the ending that gets highlighted. */
function splitForm(form: string): [string, string] {
  const pipe = form.indexOf('|');
  if (pipe === -1) return [form, ''];
  return [form.slice(0, pipe), form.slice(pipe + 1)];
}

export function ConjugationMatrix({ conjugation }: { conjugation: Conjugation }) {
  const [tenseId, setTenseId] = useState(conjugation.tenses[0].id);
  const tense = conjugation.tenses.find((t) => t.id === tenseId) ?? conjugation.tenses[0];

  return (
    <section aria-label={`Conjugation of ${conjugation.verb}`}>
      <div className="section-head">
        <MatrixIcon />
        <h2>Conjugation matrix</h2>
        <span className="mood-badge">{conjugation.mood}</span>
      </div>

      <div className="card conj">
        <div className="segmented" role="tablist" aria-label="Tense">
          {conjugation.tenses.map((option) => (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={option.id === tense.id}
              className={`segment${option.id === tense.id ? ' is-active' : ''}`}
              onClick={() => setTenseId(option.id)}
            >
              <b>{option.label}</b>
              <i>{option.english}</i>
            </button>
          ))}
        </div>

        <ul className="conj-rows">
          {tense.forms.map(({ pronoun, form }) => {
            const [stem, ending] = splitForm(form);
            return (
              <li className="conj-row" key={pronoun}>
                <span className="conj-pronoun">{pronoun}</span>
                <button
                  type="button"
                  className="conj-form"
                  onClick={() => speakGerman(`${pronoun.split(' / ')[0]} ${stem}${ending}`)}
                  aria-label={`Hear ${pronoun} ${stem}${ending}`}
                >
                  <span className="conj-word">
                    {stem}
                    {ending && <em>{ending}</em>}
                  </span>
                  <SpeakerIcon size={13} strokeWidth={2.2} />
                </button>
              </li>
            );
          })}
        </ul>

        {conjugation.note && (
          <div className="note">
            <BulbIcon size={15} />
            <p>
              <b>Watch out:</b> {renderRich(conjugation.note)}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
