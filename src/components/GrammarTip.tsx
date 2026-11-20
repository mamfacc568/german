import { renderRich } from '../lib/markup';
import { BulbIcon } from './Icons';

type Props = { title: string; text: string };

export function GrammarTip({ title, text }: Props) {
  return (
    <aside className="tip" aria-label="Grammar tip">
      <div className="tip-icon">
        <BulbIcon />
      </div>
      <div className="tip-body">
        <p className="tip-title">{title}</p>
        <p className="tip-text">{renderRich(text)}</p>
      </div>
    </aside>
  );
}
