import { ICON_PATHS } from '../lib/icons';

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  const full = Math.round(value);
  return (
    <span className="stars" aria-label={`${value} de 5`} style={{ display: 'inline-flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i <= full ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.4"
        >
          <path d={ICON_PATHS.star} />
        </svg>
      ))}
    </span>
  );
}

export function RatingLine({ rating, reviews, size = 14 }: { rating: number; reviews: number; size?: number }) {
  return (
    <span className="rating-line">
      <span className="rating-stars" style={{ display: 'inline-flex' }}>
        <Stars value={rating} size={size} />
      </span>
      <strong>{rating.toFixed(1)}</strong>
      <span className="muted">({reviews})</span>
    </span>
  );
}
