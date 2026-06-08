import type { CSSProperties } from 'react';

export const ICON_PATHS: Record<string, string> = {
  flask: 'M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3M7.5 14h9',
  pulse: 'M3 12h4l2-6 4 12 2-6h6',
  spray: 'M9 3h4M11 3v3M9 9h4a2 2 0 0 1 2 2v9a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-9a2 2 0 0 1 2-2zM17 6h.01M19 8h.01M17 10h.01',
  leaf: 'M5 19c0-8 6-13 14-14 1 9-4 15-14 14zM5 19c2-4 5-6 9-7',
  shield: 'M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z M9 12l2 2 4-4',
  chip: 'M6 6h12v12H6zM9 9h6v6H9zM3 9h3M3 14h3M18 9h3M18 14h3M9 3v3M14 3v3M9 18v3M14 18v3',
  signal: 'M4 18a8 8 0 0 1 16 0M7 18a5 5 0 0 1 10 0M12 18a1 1 0 0 0 0 0z M12 17.5a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1z',
  drop: 'M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z',
  wrench: 'M21 4a5 5 0 0 1-6.5 6.5L6 19a2 2 0 0 1-3-3l8.5-8.5A5 5 0 0 1 18 1l-3 3 2 2 3-3',
  vest: 'M8 3l4 3 4-3 4 3-2 4v10H6V10L4 6l4-3zM12 6v15',
  bowl: 'M3 11h18a9 9 0 0 1-18 0zM12 3v3M9 4v2M15 4v2M5 21h14',
  pill: 'M10.5 13.5l3-3M7 17l7-7a3.5 3.5 0 0 0-5-5l-7 7a3.5 3.5 0 0 0 5 5z',
  search: 'M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM20 20l-3.5-3.5',
  pin: 'M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11zM12 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
  star: 'M12 3l2.6 5.6 6.1.8-4.5 4.2 1.2 6L12 16.9 6.6 19.6l1.2-6L3.3 9.4l6.1-.8z',
  check: 'M5 12l4 4 10-10',
  arrow: 'M5 12h14M13 5l7 7-7 7',
  back: 'M19 12H5M11 19l-7-7 7-7',
  phone: 'M4 5c0 8 7 15 15 15l1-4-5-2-2 2a13 13 0 0 1-5-5l2-2-2-5z',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18',
  shield2: 'M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z',
  users: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20a6 6 0 0 1 12 0M17 11a3 3 0 1 0-1-5.8M21 20a6 6 0 0 0-5-5.9',
  cal: 'M5 5h14v15H5zM5 9h14M9 3v4M15 3v4',
  close: 'M6 6l12 12M18 6L6 18',
  filter: 'M3 5h18M7 12h10M10 19h4',
  sliders: 'M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0M14 4v4M6 10v4M16 16v4',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
  file: 'M14 3v5h5M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z',
};

type IconProps = {
  name: string;
  size?: number;
  stroke?: number;
  className?: string;
  style?: CSSProperties;
};

export function Icon({ name, size = 20, stroke = 1.6, className, style }: IconProps) {
  const d = ICON_PATHS[name] || ICON_PATHS.search;
  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {d.split('M').filter(Boolean).map((seg, i) => (
        <path key={i} d={'M' + seg} />
      ))}
    </svg>
  );
}
