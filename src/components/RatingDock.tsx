import type { Card, Rating } from '../lib/deck';
import { previewIntervals } from '../lib/deck';

const BUTTONS: { rating: Rating; label: string }[] = [
  { rating: 'again', label: 'Again' },
  { rating: 'hard', label: 'Hard' },
  { rating: 'good', label: 'Good' },
  { rating: 'easy', label: 'Easy' },
];

type Props = {
  card: Card;
  /** Ratings are only meaningful once the answer has been seen. */
  enabled: boolean;
  onRate: (rating: Rating) => void;
};

export function RatingDock({ card, enabled, onRate }: Props) {
  const intervals = previewIntervals(card);

  return (
    <section className="dock" aria-label="Rate your recall">
      <div className="dock-head">
        <span className="field-label">How well did you recall it?</span>
        <span className="mono-meta">next interval</span>
      </div>
      <div className="dock-row">
        {BUTTONS.map(({ rating, label }) => (
          <button
            key={rating}
            type="button"
            className="rate-btn"
            data-rating={rating}
            disabled={!enabled}
            onClick={() => onRate(rating)}
          >
            <span className="rate-label">{label}</span>
            <span className="rate-interval">{intervals[rating]}</span>
          </button>
        ))}
      </div>
      {!enabled && <p className="dock-hint">Flip the card first, then rate how it went.</p>}
    </section>
  );
}
