import { useMemo, useState } from 'react';
import {
  ARTICLE_LABEL,
  collectNouns,
  countByArticle,
  matchRules,
  type Article,
} from '../lib/genders';
import { speakGerman } from '../lib/markup';
import { useWords } from '../lib/words';
import { BulbIcon, ChevronRightIcon, SearchIcon, SpeakerIcon } from './Icons';

type Filter = 'all' | Article;

const ORDER: Article[] = ['der', 'die', 'das'];

export function GenderScreen({ onOpenWord }: { onOpenWord: (word: string) => void }) {
  const words = useWords();
  const nouns = useMemo(() => collectNouns(Object.values(words)), [words]);
  const counts = useMemo(() => countByArticle(nouns), [nouns]);
  const rules = useMemo(() => matchRules(nouns), [nouns]);
  const [filter, setFilter] = useState<Filter>('all');

  const total = nouns.length;
  const visible = filter === 'all' ? nouns : nouns.filter((noun) => noun.article === filter);

  const groups: { article: Article; rows: typeof nouns }[] =
    filter === 'all'
      ? ORDER.map((article) => ({
          article,
          rows: nouns.filter((noun) => noun.article === article),
        }))
      : [{ article: filter, rows: visible }];

  return (
    <div className="screen">
      <header className="deck-head">
        <div className="deck-head-row">
          <div>
            <h1 className="deck-title">Articles &amp; gender</h1>
            <p className="deck-sub deck-sub-plain">
              Every noun in the app, sorted by <b>der</b> / <b>die</b> / <b>das</b>
            </p>
          </div>
          <span className="level-chip">{total} {total === 1 ? 'noun' : 'nouns'}</span>
        </div>

        <div className="gender-stats">
          {ORDER.map((article) => {
            const count = counts[article];
            const percent = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <button
                key={article}
                type="button"
                className={`gender-stat${filter === article ? ' is-active' : ''}`}
                data-gender={article}
                onClick={() => setFilter(filter === article ? 'all' : article)}
                aria-pressed={filter === article}
              >
                <span className="gender-stat-article">{article}</span>
                <span className="gender-stat-count">{count}</span>
                <span className="gender-stat-name">{ARTICLE_LABEL[article]}</span>
                <span className="gender-stat-bar">
                  <span style={{ width: `${percent}%` }} />
                </span>
                <span className="gender-stat-pct">{percent}%</span>
              </button>
            );
          })}
        </div>

        <div className="segmented gender-filter">
          {(['all', ...ORDER] as Filter[]).map((option) => (
            <button
              key={option}
              type="button"
              className={`segment${filter === option ? ' is-active' : ''}`}
              onClick={() => setFilter(option)}
            >
              <b>{option === 'all' ? 'All' : option}</b>
              <i>{option === 'all' ? String(total) : String(counts[option])}</i>
            </button>
          ))}
        </div>
      </header>

      {groups.map(({ article, rows }) =>
        rows.length === 0 ? null : (
          <section key={article} aria-label={`${article} nouns`}>
            <div className="section-head">
              <span className="dot" data-gender={article} />
              <h2>
                {article} <span className="gender-head-name">· {ARTICLE_LABEL[article]}</span>
              </h2>
              <span className="meta">{rows.length}</span>
            </div>

            <ul className="noun-list">
              {rows.map((noun) => (
                <li className="card noun-row" key={noun.word}>
                  <span className="dot" data-gender={noun.article} />
                  <button
                    type="button"
                    className="noun-main"
                    onClick={() => onOpenWord(noun.openWord)}
                  >
                    <span className="noun-word">
                      <i>{noun.article}</i> {noun.word}
                    </span>
                    <span className="noun-gloss">{noun.gloss}</span>
                  </button>
                  <button
                    type="button"
                    className="icon-btn is-accent"
                    onClick={() => speakGerman(`${noun.article} ${noun.word}`)}
                    aria-label={`Hear ${noun.article} ${noun.word}`}
                  >
                    <SpeakerIcon size={15} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => onOpenWord(noun.openWord)}
                    aria-label={
                      noun.isEntry ? `Open ${noun.word}` : `Open ${noun.openWord}, which lists ${noun.word}`
                    }
                  >
                    <ChevronRightIcon size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ),
      )}

      <section aria-label="Endings that give the gender away">
        <div className="section-head">
          <BulbIcon size={16} />
          <h2>Endings that give it away</h2>
          <span className="mono-meta">{rules.length} patterns</span>
        </div>

        <ul className="rule-list">
          {rules.map((rule) => (
            <li className="card rule" key={rule.suffix}>
              <div className="rule-head">
                <span className="rule-suffix" data-gender={rule.article}>
                  {rule.suffix}
                </span>
                <span className="rule-arrow">→</span>
                <span className="rule-article" data-gender={rule.article}>
                  {rule.article}
                </span>
                <span className="tag" data-strength={rule.strength}>
                  {rule.strength}
                </span>
              </div>
              <p className="rule-note">{rule.note}</p>
              <div className="rule-words">
                {rule.matches.map((noun) => (
                  <button
                    type="button"
                    className="rule-word"
                    key={noun.word}
                    onClick={() => onOpenWord(noun.openWord)}
                  >
                    {noun.article} {noun.word}
                  </button>
                ))}
                {rule.exceptions.map((noun) => (
                  <button
                    type="button"
                    className="rule-word is-exception"
                    key={noun.word}
                    onClick={() => onOpenWord(noun.openWord)}
                    title="Breaks this rule"
                  >
                    {noun.article} {noun.word}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <p className="deck-footnote">
        <SearchIcon size={14} /> Tap any word to open it in the Dictionary.
      </p>
    </div>
  );
}
