import { ClearIcon, MicIcon, SearchIcon } from './Icons';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchBar({ value, onChange }: Props) {
  return (
    <div className="search">
      <SearchIcon />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search a German word…"
        aria-label="Search a German word"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="search"
      />
      {value && (
        <button type="button" className="icon-btn" onClick={() => onChange('')} aria-label="Clear search">
          <ClearIcon />
        </button>
      )}
      <button type="button" className="icon-btn is-accent" aria-label="Search by voice">
        <MicIcon />
      </button>
    </div>
  );
}
