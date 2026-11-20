import { useMemo, useState } from 'react';
import { AppHeader } from './components/AppHeader';
import { BottomNav, type TabId } from './components/BottomNav';
import { ConjugationMatrix } from './components/ConjugationMatrix';
import { DeckScreen } from './components/DeckScreen';
import { ExampleSentences } from './components/ExampleSentences';
import { GenderScreen } from './components/GenderScreen';
import { GrammarTip } from './components/GrammarTip';
import { ProgressScreen } from './components/ProgressScreen';
import { PrefixVerbs } from './components/PrefixVerbs';
import { SearchBar } from './components/SearchBar';
import { WordCard } from './components/WordCard';
import { WordFamily } from './components/WordFamily';
import { SUGGESTIONS } from './data/dictionary';
import { searchEntries } from './lib/search';
import { addToDeck, removeFromDeck, useDeck, useReviewLog } from './lib/deck';
import { studyStreak } from './lib/progress';
import './styles/app.css';

const HEADER_SUBTITLE: Record<TabId, string> = {
  dictionary: 'Dictionary',
  deck: 'Anki Deck',
  grammar: 'Vocabulary',
  progress: 'Progress',
};

export default function App() {
  const [tab, setTab] = useState<TabId>('dictionary');
  const [query, setQuery] = useState('die Entscheidung');
  const deck = useDeck();
  const log = useReviewLog();
  const streak = useMemo(() => studyStreak(log), [log]);

  const results = useMemo(() => searchEntries(query), [query]);
  const entry = results[0]?.entry;

  const toggleSave = (id: string) => (deck[id] ? removeFromDeck(id) : addToDeck(id));

  return (
    <div className="phone-frame">
      <div className="phone">
        <AppHeader subtitle={HEADER_SUBTITLE[tab]} streak={streak} />

        {tab === 'deck' && <DeckScreen />}

        {tab === 'grammar' && (
          <GenderScreen
            onOpenWord={(word) => {
              setQuery(word);
              setTab('dictionary');
            }}
          />
        )}

        {tab === 'progress' && <ProgressScreen />}

        {tab === 'dictionary' && (
          <div className="screen">
            <SearchBar
              value={query}
              onChange={setQuery}
              results={results}
              onPick={(picked) => setQuery(picked.word)}
            />

            {entry ? (
              <>
                <WordCard
                  key={entry.id}
                  entry={entry}
                  saved={Boolean(deck[entry.id])}
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
