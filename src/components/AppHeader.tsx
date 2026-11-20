import { FlameIcon, LogoIcon } from './Icons';

export function AppHeader({
  streak = 4,
  subtitle = 'Dictionary',
}: {
  streak?: number;
  subtitle?: string;
}) {
  return (
    <header className="app-header">
      <div className="brand-mark">
        <LogoIcon />
      </div>
      <div className="brand-text">
        <h1 className="brand-name">
          Wort<em>Schatz</em>
        </h1>
        <p className="brand-sub">{subtitle}</p>
      </div>
      <div className="header-spacer" />
      <div className="header-chip" data-cold={streak === 0} title="Current study streak">
        <FlameIcon />
        {streak === 0 ? 'Start today' : `${streak} ${streak === 1 ? 'day' : 'days'}`}
      </div>
    </header>
  );
}
