import { useMemo, useState } from 'react';
import { AppHeader } from './components/AppHeader';
import { BottomNav, type TabId } from './components/BottomNav';
import { ConjugationMatrix } from './components/ConjugationMatrix';
import { ExampleSentences } from './components/ExampleSentences';
import { GrammarTip } from './components/GrammarTip';
import { PrefixVerbs } from './components/PrefixVerbs';
import { SearchBar } from './components/SearchBar';
import { WordCard } from './components/WordCard';
import { WordFamily } from './components/WordFamily';
import { BookIcon, CardsIcon, ChartIcon } from './components/Icons';
import { findEntry, SUGGESTIONS } from './data/dictionary';
import './styles/app.css';

const PLACEHOLDERS: Record<Exclude<TabId, 'dictionary'>, { Icon: typeof BookIcon; title: string; text: string }> = {
  deck: {
    Icon: CardsIcon,
    title: 'Your Anki deck',
    text: 'Words you save from the dictionary will queue up here for spaced repetition.',
  },
  grammar: {
    Icon: BookIcon,
    title: 'Grammar',
    text: 'Cases, articles, verb tenses and word order — explained in English, drilled in German.',
  },
  progress: {
    Icon: ChartIcon,
    title: 'Progress',
    text: 'Streaks, words learned and CEFR level growth will show up here.',
  },
};

export default function App() {
  const [tab, setTab] = useState<TabId>('dictionary');
  const [query, setQuery] = useState('die Entscheidung');
  const [saved, setSaved] = useState<string[]>([]);

  const entry = useMemo(() => findEntry(query), [query]);

  const toggleSave = (id: string) =>
    setSaved((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));

  const placeholder = tab === 'dictionary' ? null : PLACEHOLDERS[tab];

  return (
    <div className="phone-frame">
      <div className="phone">
        <AppHeader streak={4} />

        {placeholder ? (
          <div className="screen">
            <div className="placeholder">
              <div className="placeholder-icon">
                <placeholder.Icon size={28} />
              </div>
              <h3>{placeholder.title}</h3>
              <p>{placeholder.text}</p>
            </div>
          </div>
        ) : (
          <div className="screen">
            <SearchBar value={query} onChange={setQuery} />

            {entry ? (
              <>
                <WordCard
                  key={entry.id}
                  entry={entry}
                  saved={saved.includes(entry.id)}
                  onToggleSave={() => toggleSave(entry.id)}
                />
                <ExampleSentences examples={entry.examples} />
                {entry.conjugation && (
                  <ConjugationMatrix key={`${entry.id}-conj`} conjugation={entry.conjugation} />
                )}
                {entry.family && <WordFamily key={`${entry.id}-family`} family={entry.family} />}
                {entry.prefixVerbs && (
                  <PrefixVerbs key={`${entry.id}-prefix`} data={entry.prefixVerbs} />
                )}
                {entry.tip && <GrammarTip title={entry.tip.title} text={entry.tip.text} />}
              </>
            ) : (
              <div className="card noresult">
                <h3>No entry yet</h3>
                <p>
                  {query.trim()
                    ? `Nothing found for “${query.trim()}”.`
                    : 'Type a German word to look it up.'}
                </p>
                <div className="suggestions">
                  {SUGGESTIONS.map((word) => (
                    <button
                      type="button"
                      className="suggestion"
                      key={word}
                      onClick={() => setQuery(word)}
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <BottomNav active={tab} onChange={setTab} />
      </div>
    </div>
  );
}
