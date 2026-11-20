import type { Entry } from '../data/dictionary';
import { renderMarked, speakGerman } from '../lib/markup';
import { PrefixIcon, SpeakerIcon } from './Icons';

type PrefixData = NonNullable<Entry['prefixVerbs']>;

export function PrefixVerbs({ data }: { data: PrefixData }) {
  const count = data.verbs.length;

  return (
    <section aria-label={`Verbs built on ${data.stem}`}>
      <div className="section-head">
        <PrefixIcon />
        <h2>Prefix verbs</h2>
        <span className="mono-meta">
          {count} from “{data.stem}”
        </span>
      </div>

      <ul className="prefix-list">
        {data.verbs.map((item) => {
          const rest = item.verb.startsWith(item.prefix)
            ? item.verb.slice(item.prefix.length)
            : item.verb;
          return (
            <li className="card prefix" key={item.verb}>
              <div className="prefix-head">
                <button
                  type="button"
                  className="prefix-verb"
                  onClick={() => speakGerman(item.verb)}
                  aria-label={`Hear ${item.verb}`}
                >
                  <em>{item.prefix}</em>
                  {rest}
                </button>
                <span className="prefix-ipa">{item.ipa}</span>
              </div>

              <div className="prefix-tags">
                  <span
                    className="tag"
                    data-sep={item.separable ? 'yes' : 'no'}
                    title={
                      item.separable
                        ? `The prefix “${item.prefix}” splits off and moves to the end of the clause`
                        : `The prefix “${item.prefix}” never splits off`
                    }
                  >
                    {item.prefix} | {item.separable ? 'trennbar' : 'untrennbar'}
                  </span>
                  <span
                    className="tag tag-aux"
                    data-aux={item.auxiliary}
                    title={`Builds the Perfekt with ${item.auxiliary.toLowerCase()}`}
                  >
                    {item.auxiliary}
                  </span>
              </div>

              <p className="prefix-gloss">{item.gloss}</p>

              <div className="prefix-example">
                <div className="prefix-example-row">
                  <p className="prefix-example-de">
                    “{renderMarked(item.example.de, (part, key) => <mark key={key}>{part}</mark>)}”
                  </p>
                  <button
                    type="button"
                    className="icon-btn is-accent"
                    onClick={() => speakGerman(item.example.de)}
                    aria-label="Hear this sentence"
                  >
                    <SpeakerIcon size={15} />
                  </button>
                </div>
                <p className="prefix-example-en">
                  “{renderMarked(item.example.en, (part, key) => <b key={key}>{part}</b>)}”
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
