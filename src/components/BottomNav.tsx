import { BookIcon, CardsIcon, ChartIcon, SearchIcon } from './Icons';

export type TabId = 'dictionary' | 'deck' | 'grammar' | 'progress';

const TABS: { id: TabId; label: string; Icon: typeof SearchIcon }[] = [
  { id: 'dictionary', label: 'Dictionary', Icon: SearchIcon },
  { id: 'deck', label: 'Anki Deck', Icon: CardsIcon },
  { id: 'grammar', label: 'Grammar', Icon: BookIcon },
  { id: 'progress', label: 'Progress', Icon: ChartIcon },
];

type Props = {
  active: TabId;
  onChange: (tab: TabId) => void;
};

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className={`nav-item${active === id ? ' is-active' : ''}`}
          onClick={() => onChange(id)}
          aria-current={active === id ? 'page' : undefined}
        >
          <Icon size={22} strokeWidth={active === id ? 2.4 : 2} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
