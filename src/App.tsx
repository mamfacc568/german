import { useEffect, useMemo, useRef, useState } from 'react';
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
import type { Entry } from './data/dictionary';
import { addToDeck, removeFromDeck, useDeck, useReviewLog } from './lib/deck';
import { studyStreak } from './lib/progress';
import { searchCached } from './lib/search';
import { lookupWord, useWords } from './lib/words';
import { suggestWords } from './lib/wiktionary';
import './styles/app.css';

const HEADER_SUBTITLE: Record<TabId, string> = {
  dictionary: 'Dictionary',
  deck: 'Anki Deck',
  grammar: 'Vocabulary',
  progress: 'Progress',
};

const STARTERS = ['Entscheidung', 'Hoffnung', 'stehen', 'Haus', 'Weg'];

export default function App() {
  const [tab, setTab] = useState<TabId>('dictionary');
  const [query, setQuery] = useState('');
  const [active, setActive] = useState('');
  const [entry, setEntry] = useState<Entry | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'notfound'>('idle');
  const [remote, setRemote] = useState<string[]>([]);
  const [suggesting, setSuggesting] = useState(false);

  const words = useWords();
  const deck = useDeck();
  const log = useReviewLog();
  const streak = useMemo(() => studyStreak(log), [log]);

  const cached = useMemo(() => searchCached(Object.values(words), query), [words, query]);

  // Online autocomplete, debounced so typing does not hammer the API.
  const suggestRef = useRef<AbortController>(null);
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setRemote([]);
      return;
    }
    const timer = setTimeout(async () => {
      suggestRef.current?.abort();
      const controller = new AbortController();
      suggestRef.current = controller;
      setSuggesting(true);
      try {
        setRemote(await suggestWords(q, controller.signal));
      } catch {
        setRemote([]);
      } finally {
        setSuggesting(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch (or read from cache) whichever word is open.
  const lookupRef = useRef<AbortController>(null);
  useEffect(() => {
    const word = active.trim();
    if (!word) {
      setEntry(null);
      setStatus('idle');
      return;
    }
    lookupRef.current?.abort();
    const controller = new AbortController();
    lookupRef.current = controller;
    setStatus('loading');
    lookupWord(word, controller.signal)
      .then((found) => {
        if (controller.signal.aborted) return;
        setEntry(found);
        setStatus(found ? 'idle' : 'notfound');
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus('notfound');
      });
    return () => controller.abort();
  }, [active]);

  // Keep the open entry fresh when its Hindi arrives a moment later.
  useEffect(() => {
    if (entry && words[entry.id] && words[entry.id] !== entry) setEntry(words[entry.id]);
  }, [words, entry]);

  const open = (word: string) => {
    setQuery(word);
    setActive(word);
  };

  const toggleSave = (id: string) => (deck[id] ? removeFromDeck(id) : addToDeck(id));

  return (
    <div className="phone-frame">
      <div className="phone">
        <AppHeader subtitle={HEADER_SUBTITLE[tab]} streak={streak} />

        {tab === 'deck' && <DeckScreen />}
        {tab === 'grammar' && <GenderScreen onOpenWord={(word) => { open(word); setTab('dictionary'); }} />}
        {tab === 'progress' && <ProgressScreen />}

        {tab === 'dictionary' && (
          <div className="screen">
            <SearchBar
              value={query}
              onChange={setQuery}
              results={cached}
              remote={remote}
              busy={suggesting}
              onPick={(picked) => open(picked.word)}
              onPickWord={open}
            />

            {status === 'loading' && (
              <div className="card lookup-state">
                <span className="spinner" />
                <p>Looking up “{active.trim()}” …</p>
              </div>
            )}

            {status === 'notfound' && (
              <div className="card noresult">
                <h3>No German entry</h3>
                <p>Wiktionary has no German word called “{active.trim()}”.</p>
              </div>
            )}

            {status === 'idle' && entry && (
              <>
                <WordCard
                  key={entry.id}
                  entry={entry}
                  saved={Boolean(deck[entry.id])}
                  onToggleSave={() => toggleSave(entry.id)}
                />
                {entry.examples.length > 0 && <ExampleSentences examples={entry.examples} />}
                {entry.conjugation && (
                  <ConjugationMatrix key={`${entry.id}-conj`} conjugation={entry.conjugation} />
                )}
                {entry.family && <WordFamily key={`${entry.id}-family`} family={entry.family} />}
                {entry.prefixVerbs && (
                  <PrefixVerbs key={`${entry.id}-prefix`} data={entry.prefixVerbs} />
                )}
                {entry.tip && <GrammarTip title={entry.tip.title} text={entry.tip.text} />}
              </>
            )}

            {status === 'idle' && !entry && (
              <div className="card noresult">
                <h3>Look up a German word</h3>
                <p>
                  Type in German or English. Words you open are saved on this device, so they
                  work offline afterwards.
                </p>
                <div className="suggestions">
                  {STARTERS.map((word) => (
                    <button type="button" className="suggestion" key={word} onClick={() => open(word)}>
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
