import { FlameIcon, LogoIcon } from './Icons';

export function AppHeader({ streak = 4 }: { streak?: number }) {
  return (
    <header className="app-header">
      <div className="brand-mark">
        <LogoIcon />
      </div>
      <div className="brand-text">
        <h1 className="brand-name">
          Wort<em>Schatz</em>
        </h1>
        <p className="brand-sub">Dictionary</p>
      </div>
      <div className="header-spacer" />
      <div className="header-chip" title="Current study streak">
        <FlameIcon />
        {streak} days
      </div>
    </header>
  );
}
