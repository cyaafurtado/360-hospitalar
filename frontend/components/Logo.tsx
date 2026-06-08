import { monogram, tintFor } from '../data/reference';

export function Logo({
  name,
  size = 48,
  radius,
}: {
  name: string;
  size?: number;
  radius?: number | string;
}) {
  return (
    <span
      className="mono-logo"
      style={{
        width: size,
        height: size,
        background: tintFor(name),
        borderRadius: radius != null ? radius : 'var(--logo-radius)',
        fontSize: size * 0.38,
      }}
    >
      {monogram(name)}
    </span>
  );
}
