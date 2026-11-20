import { useMemo } from 'react';
import { deckStats, useDeck, useReviewLog } from '../lib/deck';
import { ARTICLE_LABEL, collectNouns } from '../lib/genders';
import {
  accuracy,
  activity,
  deckMix,
  forecast,
  genderMix,
  levelMix,
  matureCount,
  studyStreak,
  troubleWords,
  wordTypes,
  type DayBar,
} from '../lib/progress';
import { BadgeCheckIcon, ChartIcon, FlameIcon, InboxIcon, TagIcon } from './Icons';

/**
 * Vertical bars. Labels are selective: on a dense chart the columns are
 * narrower than the text, so only every third one and the last are drawn,
 * and the value is written on the tallest bar and today's bar only.
 */
function BarChart({ data, label, dense = false }: { data: DayBar[]; label: string; dense?: boolean }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const empty = data.every((d) => d.count === 0);
  const last = data.length - 1;
  const peak = data.findIndex((d) => d.count === max);

  return (
    <div className="chart" role="img" aria-label={label}>
      <div className="chart-bars">
        {data.map((day, index) => {
          const showLabel = !dense || index % 3 === 0 || index === last;
          const showValue = day.count > 0 && (!dense || index === peak || index === last);
          return (
          <div className="chart-col" key={day.key} title={`${day.label}: ${day.count}`}>
            <span className="chart-value">{showValue ? day.count : ''}</span>
            <div className="chart-track">
              <div
                className="chart-bar"
                style={{ height: day.count > 0 ? `${(day.count / max) * 100}%` : '2px' }}
                data-zero={day.count === 0}
              />
            </div>
            <span className="chart-label">{showLabel ? day.label : ''}</span>
          </div>
          );
        })}
      </div>
      {empty && <p className="chart-empty">Nothing yet</p>}
    </div>
  );
}

export function ProgressScreen() {
  const deck = useDeck();
  const log = useReviewLog();

  const stats = useMemo(() => deckStats(deck), [deck]);
  const streak = useMemo(() => studyStreak(log), [log]);
  const acc = useMemo(() => accuracy(log), [log]);
  const days = useMemo(() => activity(log, 14), [log]);
  const due = useMemo(() => forecast(deck, 7), [deck]);
  const mix = useMemo(() => deckMix(deck), [deck]);
  const mature = useMemo(() => matureCount(deck), [deck]);
  const genders = useMemo(() => genderMix(deck), [deck]);
  const levels = useMemo(() => levelMix(deck), [deck]);
  const trouble = useMemo(() => troubleWords(deck), [deck]);
  const types = useMemo(() => wordTypes(deck), [deck]);
  const allNouns = useMemo(() => collectNouns().length, []);

  const totalCards = stats.size;
  const mixTotal = mix.reduce((sum, m) => sum + m.count, 0) || 1;
  const genderTotal = Math.max(1, ...genders.map((g) => g.count));
  const levelTotal = Math.max(1, ...levels.map((l) => l.count));

  return (
    <div className="screen">
      <header className="deck-head">
        <div className="deck-head-row">
          <div>
            <h1 className="deck-title">Your progress</h1>
            <p className="deck-sub deck-sub-plain">
              Everything here is counted from your own reviews
            </p>
          </div>
        </div>

        {/* Each tile says what it counts — the number alone is not self-explaining. */}
        <div className="hero-tiles">
          <div className="hero-tile">
            <TagIcon size={14} />
            <b>{totalCards}</b>
            <span>Words in deck</span>
            <em>saved to study</em>
          </div>
          <div className="hero-tile" data-accent="streak">
            <FlameIcon size={14} />
            <b>{streak}</b>
            <span>Day streak</span>
            <em>days in a row</em>
          </div>
          <div className="hero-tile" data-accent="good">
            <BadgeCheckIcon size={14} />
            <b>{acc.percent === null ? '—' : `${acc.percent}%`}</b>
            <span>Recalled</span>
            <em>without “Again”</em>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------ word types */}
      <section aria-label="Nouns and verbs">
        <div className="section-head">
          <TagIcon size={15} />
          <h2>Nouns &amp; verbs</h2>
          <span className="mono-meta">studied / in deck</span>
        </div>
        <div className="card chart-card">
          <ul className="type-list">
            {types.map((row) => (
              <li key={row.id}>
                <span className="type-name">{row.label}</span>
                <span className="type-track">
                  <span
                    className="type-bar"
                    data-type={row.id}
                    style={{
                      width: row.total > 0 ? `${(row.studied / row.total) * 100}%` : '0%',
                    }}
                  />
                </span>
                <span className="type-count">
                  <b>{row.studied}</b> / {row.total}
                </span>
              </li>
            ))}
          </ul>
          <p className="chart-note">
            Studied means you have reviewed it at least once. The Vocabulary tab lists{' '}
            <b>{allNouns}</b> nouns in all — the ones above are only what is in your deck.
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------- due forecast */}
      <section aria-label="Upcoming reviews">
        <div className="section-head">
          <InboxIcon size={16} />
          <h2>Coming up</h2>
          <span className="mono-meta">next 7 days</span>
        </div>
        <div className="card chart-card">
          <BarChart data={due} label="Cards due on each of the next seven days" />
        </div>
      </section>

      {/* ------------------------------------------------------- deck mix */}
      <section aria-label="Deck make-up">
        <div className="section-head">
          <ChartIcon size={16} />
          <h2>Deck make-up</h2>
          <span className="mono-meta">{totalCards} cards</span>
        </div>
        <div className="card chart-card">
          <div className="stack-bar">
            {mix.map((segment) =>
              segment.count === 0 ? null : (
                <div
                  key={segment.id}
                  className="stack-seg"
                  data-bucket={segment.id}
                  style={{ width: `${(segment.count / mixTotal) * 100}%` }}
                  title={`${segment.label}: ${segment.count}`}
                />
              ),
            )}
          </div>
          <ul className="legend">
            {mix.map((segment) => (
              <li key={segment.id}>
                <span className="legend-dot" data-bucket={segment.id} />
                <span className="legend-name">{segment.label}</span>
                <span className="legend-count">{segment.count}</span>
              </li>
            ))}
          </ul>
          <p className="chart-note">
            <b>{mature}</b> of them are mature — the interval has grown past three weeks.
          </p>
        </div>
      </section>

      {/* -------------------------------------------------------- activity */}
      <section aria-label="Study activity">
        <div className="section-head">
          <FlameIcon size={15} />
          <h2>Last two weeks</h2>
          <span className="mono-meta">
            {acc.reviews} {acc.reviews === 1 ? 'review' : 'reviews'}
          </span>
        </div>
        <div className="card chart-card">
          <BarChart data={days} label="Reviews done on each of the last fourteen days" dense />
        </div>
      </section>

      {/* ---------------------------------------------------------- gender */}
      <section aria-label="Gender balance">
        <div className="section-head">
          <span className="dot" data-gender="die" />
          <h2>Gender balance</h2>
          <span className="mono-meta">nouns studied</span>
        </div>
        <div className="card chart-card">
          <ul className="row-chart">
            {genders.map(({ article, count }) => (
              <li key={article}>
                <span className="row-key" data-gender={article}>
                  {article}
                </span>
                <span className="row-track">
                  <span
                    className="row-bar"
                    data-gender={article}
                    style={{ width: count > 0 ? `${(count / genderTotal) * 100}%` : '3px' }}
                  />
                </span>
                <span className="row-count">{count}</span>
                <span className="row-name">{ARTICLE_LABEL[article]}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ----------------------------------------------------------- level */}
      {levels.length > 0 && (
        <section aria-label="Level mix">
          <div className="section-head">
            <ChartIcon size={16} />
            <h2>Level mix</h2>
            <span className="mono-meta">CEFR</span>
          </div>
          <div className="card chart-card">
            <ul className="row-chart">
              {levels.map((level, index) => (
                <li key={level.id}>
                  <span className="row-key row-key-level">{level.label}</span>
                  <span className="row-track">
                    <span
                      className="row-bar row-bar-seq"
                      style={{
                        width: `${(level.count / levelTotal) * 100}%`,
                        // A single hue, stepping darker as the level rises.
                        opacity: 0.45 + (index / Math.max(1, levels.length - 1)) * 0.55,
                      }}
                    />
                  </span>
                  <span className="row-count">{level.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* --------------------------------------------------------- trouble */}
      {trouble.length > 0 && (
        <section aria-label="Words to work on">
          <div className="section-head">
            <BadgeCheckIcon size={16} />
            <h2>Worth another look</h2>
            <span className="mono-meta">most forgotten</span>
          </div>
          <ul className="noun-list">
            {trouble.map(({ entry, lapses }) => (
              <li className="card noun-row" key={entry.id}>
                <span className="dot" data-gender={entry.gender} />
                <span className="noun-main">
                  <span className="noun-word">
                    {entry.gender !== 'none' && <i>{entry.gender}</i>} {entry.word}
                  </span>
                  <span className="noun-gloss">{entry.primaryMeaning}</span>
                </span>
                <span className="lapse-chip">
                  {lapses}× forgotten
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {acc.reviews === 0 && (
        <p className="deck-footnote">
          <InboxIcon size={15} /> Study a card in the Anki Deck to start your streak.
        </p>
      )}
    </div>
  );
}
