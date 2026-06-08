// 360 Hospitalar — Orbit Plus logo system
const RS = {
  primary: "oklch(0.56 0.16 248)",
  primaryLight: "oklch(0.66 0.15 248)",
  dark: "oklch(0.34 0.15 268)",
  accent: "oklch(0.68 0.15 165)",
  ink: "oklch(0.22 0.05 270)",
  muted: "oklch(0.54 0.04 270)",
  paper: "oklch(0.98 0.006 260)",
  darkTagline: "oklch(0.74 0.03 262)",
};

// The orbit-plus mark. viewBox 0 0 100 100.
// ring = orbit color, plus = core "+" color, node = satellite color.
function OrbitMark({ size = 100, ring = RS.primary, plus = RS.accent, node = RS.primary }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="360 Hospitalar">
      <ellipse cx="50" cy="50" rx="40" ry="18" fill="none" stroke={ring} strokeWidth="5" transform="rotate(-30 50 50)" />
      <rect x="44.5" y="33" width="11" height="34" rx="5.5" fill={plus} />
      <rect x="33" y="44.5" width="34" height="11" rx="5.5" fill={plus} />
      <circle cx="86" cy="34" r="5" fill={node} />
    </svg>
  );
}

// Wordmark "360 Hospitalar" — single line.
function Wordmark({ size = 34, ink = RS.ink, primary = RS.primary }) {
  return (
    <span className="rs-wordmark" style={{ fontSize: size, color: ink }}>
      360 <span style={{ color: primary }}>Hospitalar</span>
    </span>
  );
}

function Tagline({ color = RS.muted, size = 9.5 }) {
  return <span className="rs-tagline" style={{ color, fontSize: size }}>SERVIÇOS HOSPITALARES</span>;
}

// 1. Vertical lockup — light / dark
function LockupVertical({ dark = false }) {
  return (
    <div className={"rs-lockup vert" + (dark ? " dark" : "")}>
      <OrbitMark size={104}
        ring={dark ? RS.primaryLight : RS.primary}
        plus={RS.accent}
        node={dark ? RS.primaryLight : RS.primary} />
      <div className="rs-names">
        <Wordmark size={38} ink={dark ? RS.paper : RS.ink} primary={dark ? RS.primaryLight : RS.primary} />
        <Tagline color={dark ? RS.darkTagline : RS.muted} size={10.5} />
      </div>
    </div>
  );
}

// 3. Horizontal lockup
function LockupHorizontal({ dark = false }) {
  return (
    <div className={"rs-lockup horiz" + (dark ? " dark" : "")}>
      <OrbitMark size={64}
        ring={dark ? RS.primaryLight : RS.primary}
        plus={RS.accent}
        node={dark ? RS.primaryLight : RS.primary} />
      <div className="rs-names left">
        <Wordmark size={30} ink={dark ? RS.paper : RS.ink} primary={dark ? RS.primaryLight : RS.primary} />
        <Tagline color={dark ? RS.darkTagline : RS.muted} size={9} />
      </div>
    </div>
  );
}

// 4. App icon — mark in squircle
function AppIcon({ size = 132 }) {
  const r = size * 0.26;
  return (
    <div className="rs-appicon" style={{ width: size, height: size, borderRadius: r, background: RS.primary }}>
      <OrbitMark size={size * 0.66} ring={RS.paper} plus={RS.accent} node={RS.paper} />
    </div>
  );
}

Object.assign(window, { RS, OrbitMark, Wordmark, Tagline, LockupVertical, LockupHorizontal, AppIcon });
