export function OrbitMark({
  size = 38,
  ring = 'oklch(0.56 0.16 248)',
  plus = 'oklch(0.68 0.15 165)',
  node = 'oklch(0.56 0.16 248)',
}: {
  size?: number;
  ring?: string;
  plus?: string;
  node?: string;
}) {
  return (
    <svg className="brand-shield" width={size} height={size} viewBox="0 0 100 100" fill="none" aria-label="360 Hospitalar">
      <ellipse cx="50" cy="50" rx="40" ry="18" fill="none" stroke={ring} strokeWidth="5" transform="rotate(-30 50 50)" />
      <rect x="44.5" y="33" width="11" height="34" rx="5.5" fill={plus} />
      <rect x="33" y="44.5" width="34" height="11" rx="5.5" fill={plus} />
      <circle cx="86" cy="34" r="5" fill={node} />
    </svg>
  );
}
