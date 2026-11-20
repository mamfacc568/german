import { useEffect, useRef, useState } from 'react';
import type { Entry } from '../data/dictionary';
import { KIND_LABEL, type SearchResult } from '../lib/search';
import { ClearIcon, MicIcon, SearchIcon } from './Icons';

type Props = {
  value: string;
  onChange: (value: string) => void;
  results: SearchResult[];
  onPick: (entry: Entry) => void;
};

export function SearchBar({ value, onChange, results, onPick }: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  // A suggestion list for a word already on screen is just noise.
  const suggestions =
    results.length === 1 && results[0].kind === 'word' && results[0].entry.word === value.trim()
      ? []
      : results;
  const showList = open && value.trim().length > 0 && suggestions.length > 0;

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
      pick(suggestions[active]);
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
        </ul>
      )}
    </div>
  );
}
