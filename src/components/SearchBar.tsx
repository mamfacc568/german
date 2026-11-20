import { useEffect, useRef, useState } from 'react';
import type { Entry } from '../data/dictionary';
import { KIND_LABEL, type SearchResult } from '../lib/search';
import { ClearIcon, GlobeIcon, MicIcon, SearchIcon } from './Icons';

type Props = {
  value: string;
  onChange: (value: string) => void;
  /** Words already on this device — instant, offline. */
  results: SearchResult[];
  /** Titles Wiktionary suggests for what is typed. */
  remote: string[];
  busy: boolean;
  onPick: (entry: Entry) => void;
  onPickWord: (word: string) => void;
};

export function SearchBar({ value, onChange, results, remote, busy, onPick, onPickWord }: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  // A suggestion list for a word already on screen is just noise.
  const suggestions =
    results.length === 1 && results[0].kind === 'word' && results[0].entry.word === value.trim()
      ? []
      : results;
  // Online titles we do not already have saved.
  const have = new Set(suggestions.map((r) => r.entry.word.toLowerCase()));
  const online = remote.filter((word) => !have.has(word.toLowerCase())).slice(0, 6);
  const showList = open && value.trim().length > 0 && (suggestions.length > 0 || online.length > 0 || busy);

  useEffect(() => setActive(0), [value]);

  useEffect(() => {
    if (!showList) return;
    const onDocDown = (event: MouseEvent) => {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, [showList]);

  const pick = (result: SearchResult) => {
    onPick(result.entry);
    setOpen(false);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (!showList) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (suggestions[active]) pick(suggestions[active]);
      else if (value.trim()) {
        onPickWord(value.trim());
        setOpen(false);
      }
    }
  };

  return (
    <div className="search-box" ref={boxRef}>
      <div className="search">
        <SearchIcon />
        <input
          type="search"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search German or English…"
          aria-label="Search in German, English or Hindi"
          aria-expanded={showList}
          aria-autocomplete="list"
          role="combobox"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
        />
        {value && (
          <button
            type="button"
            className="icon-btn"
            onClick={() => {
              onChange('');
              setOpen(false);
            }}
            aria-label="Clear search"
          >
            <ClearIcon />
          </button>
        )}
        <button type="button" className="icon-btn is-accent" aria-label="Search by voice">
          <MicIcon />
        </button>
      </div>

      {showList && (
        <ul className="suggest" role="listbox" aria-label="Suggestions">
          {suggestions.map((result, index) => {
            const { entry, kind, matched } = result;
            const article = entry.gender === 'none' ? '' : entry.gender;
            return (
              <li key={entry.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={index === active}
                  className={`suggest-row${index === active ? ' is-active' : ''}`}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => pick(result)}
                >
                  <span className="dot" data-gender={entry.gender} />
                  <span className="suggest-main">
                    <span className="suggest-word">
                      {article && <i>{article} </i>}
                      {entry.word}
                    </span>
                    <span className="suggest-gloss">{entry.primaryMeaning}</span>
                    {kind !== 'word' && (
                      <span className="suggest-tag" data-kind={kind}>
                        matched <b>{matched}</b> · {KIND_LABEL[kind]}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}

          {online.length > 0 && (
            <li className="suggest-divider">
              <span>From Wiktionary</span>
            </li>
          )}
          {online.map((word) => (
            <li key={`online-${word}`}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                className="suggest-row suggest-row-online"
                onClick={() => {
                  onPickWord(word);
                  setOpen(false);
                }}
              >
                <GlobeIcon size={14} />
                <span className="suggest-main">
                  <span className="suggest-word">{word}</span>
                  <span className="suggest-gloss">Look it up online</span>
                </span>
              </button>
            </li>
          ))}

          {busy && online.length === 0 && suggestions.length === 0 && (
            <li className="suggest-busy">Searching…</li>
          )}
        </ul>
      )}
    </div>
  );
}
