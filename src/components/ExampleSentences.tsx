import type { Example } from '../data/dictionary';
import { renderMarked, speakGerman } from '../lib/markup';
import { QuoteIcon, SpeakerIcon } from './Icons';

export function ExampleSentences({ examples }: { examples: Example[] }) {
  return (
    <section aria-label="Example sentences">
      <div className="section-head">
        <QuoteIcon />
        <h2>Example sentences</h2>
        <span className="meta">
          {examples.length} {examples.length === 1 ? 'match' : 'matches'}
        </span>
      </div>

      <ul className="examples">
        {examples.map((example) => (
          <li className="card example" key={example.de}>
            <div className="example-row">
              <p className="example-de">
                “{renderMarked(example.de, (part, key) => <mark key={key}>{part}</mark>)}”
              </p>
              {example.level && (
                <span className="level-pill" data-band={example.level[0].toLowerCase()}>
                  {example.level}
                </span>
              )}
              <button
                type="button"
                className="icon-btn is-accent"
                onClick={() => speakGerman(example.de)}
                aria-label="Hear this sentence"
              >
                <SpeakerIcon size={16} />
              </button>
            </div>
            <p className="example-en">
              “{renderMarked(example.en, (part, key) => <b key={key}>{part}</b>)}”
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
