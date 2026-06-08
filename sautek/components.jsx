// Sautek — átomos e componentes de UI
const { useState, useMemo } = React;

/* ---------- Ícones (line icons simples, 24x24) ---------- */
const ICON_PATHS = {
  flask: "M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3M7.5 14h9",
  pulse: "M3 12h4l2-6 4 12 2-6h6",
  spray: "M9 3h4M11 3v3M9 9h4a2 2 0 0 1 2 2v9a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-9a2 2 0 0 1 2-2zM17 6h.01M19 8h.01M17 10h.01",
  leaf: "M5 19c0-8 6-13 14-14 1 9-4 15-14 14zM5 19c2-4 5-6 9-7",
  shield: "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z M9 12l2 2 4-4",
  chip: "M6 6h12v12H6zM9 9h6v6H9zM3 9h3M3 14h3M18 9h3M18 14h3M9 3v3M14 3v3M9 18v3M14 18v3",
  signal: "M4 18a8 8 0 0 1 16 0M7 18a5 5 0 0 1 10 0M12 18a1 1 0 0 0 0 0z M12 17.5a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1z",
  drop: "M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z",
  wrench: "M21 4a5 5 0 0 1-6.5 6.5L6 19a2 2 0 0 1-3-3l8.5-8.5A5 5 0 0 1 18 1l-3 3 2 2 3-3",
  vest: "M8 3l4 3 4-3 4 3-2 4v10H6V10L4 6l4-3zM12 6v15",
  bowl: "M3 11h18a9 9 0 0 1-18 0zM12 3v3M9 4v2M15 4v2M5 21h14",
  pill: "M10.5 13.5l3-3M7 17l7-7a3.5 3.5 0 0 0-5-5l-7 7a3.5 3.5 0 0 0 5 5z",
  search: "M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM20 20l-3.5-3.5",
  pin: "M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11zM12 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
  star: "M12 3l2.6 5.6 6.1.8-4.5 4.2 1.2 6L12 16.9 6.6 19.6l1.2-6L3.3 9.4l6.1-.8z",
  check: "M5 12l4 4 10-10",
  arrow: "M5 12h14M13 5l7 7-7 7",
  back: "M19 12H5M11 19l-7-7 7-7",
  phone: "M4 5c0 8 7 15 15 15l1-4-5-2-2 2a13 13 0 0 1-5-5l2-2-2-5z",
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18",
  shield2: "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z",
  users: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20a6 6 0 0 1 12 0M17 11a3 3 0 1 0-1-5.8M21 20a6 6 0 0 0-5-5.9",
  cal: "M5 5h14v15H5zM5 9h14M9 3v4M15 3v4",
  close: "M6 6l12 12M18 6L6 18",
  filter: "M3 5h18M7 12h10M10 19h4",
  sliders: "M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0M14 4v4M6 10v4M16 16v4",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  list: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01",
  home: "M3 11l9-8 9 8M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9",
  building: "M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 9h4a1 1 0 0 1 1 1v11M3 21h18M7 8h3M7 12h3M7 16h3",
  gear: "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 0 1-4 0v-.2a1.7 1.7 0 0 0-2.9-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.1-2.9H3a2 2 0 0 1 0-4h.2a1.7 1.7 0 0 0 1.1-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.2a1.7 1.7 0 0 0 2.9 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9H21a2 2 0 0 1 0 4h-.2a1.7 1.7 0 0 0-1.4 1z",
  chart: "M4 20V10M10 20V4M16 20v-7M21 20H3",
  file: "M14 3v5h5M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z",
  logout: "M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3M10 17l-5-5 5-5M5 12h12",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  chevron: "M6 9l6 6 6-6",
  plus: "M12 5v14M5 12h14",
  edit: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z",
  trash: "M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6M10 11v6M14 11v6",
  key: "M15.5 7.5a3.5 3.5 0 1 0-3.4 3.5L9 14H7v2H5v2H2v-3l7.1-7.1A3.5 3.5 0 0 0 15.5 7.5zM16 7h.01",
  lock: "M5 11h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1zM8 11V7a4 4 0 0 1 8 0v4",
  menu: "M3 6h18M3 12h18M3 18h18",
  dots: "M12 5h.01M12 12h.01M12 19h.01",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2",
  mail: "M3 6h18v12H3zM3 7l9 6 9-6",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  trend: "M3 17l6-6 4 4 8-8M15 7h6v6",
};

function Icon({ name, size = 20, stroke = 1.6, className, style }) {
  const d = ICON_PATHS[name] || ICON_PATHS.search;
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {d.split("M").filter(Boolean).map((seg, i) => <path key={i} d={"M" + seg} />)}
    </svg>
  );
}

/* ---------- Estrelas de avaliação ---------- */
function Stars({ value, size = 14 }) {
  const full = Math.round(value);
  return (
    <span className="stars" aria-label={`${value} de 5`} style={{ display: "inline-flex", gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i <= full ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.4">
          <path d={ICON_PATHS.star} />
        </svg>
      ))}
    </span>
  );
}

function RatingLine({ rating, reviews, size = 14 }) {
  return (
    <span className="rating-line">
      <span className="rating-stars" style={{ display: "inline-flex" }}><Stars value={rating} size={size} /></span>
      <strong>{rating.toFixed(1)}</strong>
      <span className="muted">({reviews})</span>
    </span>
  );
}

/* ---------- Logo monograma ---------- */
function Logo({ name, size = 48, radius }) {
  const tint = tintFor(name);
  return (
    <span className="mono-logo" style={{
      width: size, height: size, background: tint,
      borderRadius: radius != null ? radius : "var(--logo-radius)",
      fontSize: size * 0.38,
    }}>
      {monogram(name)}
    </span>
  );
}

/* ---------- Badge de verificado ---------- */
function VerifiedTag({ small }) {
  return (
    <span className={"verified" + (small ? " sm" : "")}>
      <Icon name="check" size={small ? 11 : 13} stroke={2.4} />
      Verificada
    </span>
  );
}

Object.assign(window, { Icon, Stars, RatingLine, Logo, VerifiedTag, ICON_PATHS });
