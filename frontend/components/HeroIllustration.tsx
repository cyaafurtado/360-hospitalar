export function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 480 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="hero-ill"
    >
      <defs>
        <linearGradient id="hi-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eff6ff" />
          <stop offset="100%" stopColor="#dbeafe" />
        </linearGradient>
        <linearGradient id="hi-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dbeafe" />
          <stop offset="100%" stopColor="#bfdbfe" />
        </linearGradient>
        <linearGradient id="hi-desk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <linearGradient id="hi-coat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e8edf3" />
        </linearGradient>
        <filter id="hi-card-shadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#1e40af" floodOpacity="0.09" />
        </filter>
        <filter id="hi-mon-glow" x="-5%" y="-5%" width="110%" height="115%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#3b82f6" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* ── Background ── */}
      <rect width="480" height="360" fill="url(#hi-bg)" rx="20" />
      <rect x="0" y="268" width="480" height="92" fill="url(#hi-floor)" />
      <line x1="0" y1="268" x2="480" y2="268" stroke="#bfdbfe" strokeWidth="1" />

      {/* ── Desk surface ── */}
      <rect x="20" y="262" width="440" height="22" fill="url(#hi-desk)" rx="4" />
      <rect x="20" y="274" width="440" height="10" fill="#94a3b8" rx="0" />

      {/* ── LARGE MONITOR (right) ── */}
      <rect x="286" y="240" width="52" height="8" fill="#94a3b8" rx="4" />
      <rect x="308" y="202" width="8" height="40" fill="#94a3b8" rx="3" />
      {/* Frame */}
      <rect x="242" y="78" width="184" height="146" fill="#1e293b" rx="10" filter="url(#hi-mon-glow)" />
      {/* Screen */}
      <rect x="252" y="88" width="164" height="126" fill="#071525" rx="5" />
      {/* Top bar */}
      <rect x="252" y="88" width="164" height="17" fill="rgba(15,23,42,0.95)" rx="5" />
      <circle cx="263" cy="96" r="3.5" fill="#ef4444" opacity="0.85" />
      <circle cx="274" cy="96" r="3.5" fill="#f59e0b" opacity="0.85" />
      <circle cx="285" cy="96" r="3.5" fill="#22c55e" opacity="0.85" />
      <rect x="302" y="93" width="64" height="5" fill="rgba(99,102,241,0.45)" rx="2" />
      {/* X-ray - left lung */}
      <ellipse cx="298" cy="158" rx="25" ry="34"
        fill="rgba(100,116,139,0.12)" stroke="rgba(148,163,184,0.75)" strokeWidth="1.5" />
      {/* X-ray - right lung */}
      <ellipse cx="356" cy="158" rx="25" ry="34"
        fill="rgba(100,116,139,0.12)" stroke="rgba(148,163,184,0.75)" strokeWidth="1.5" />
      {/* Spine */}
      <line x1="328" y1="124" x2="328" y2="192" stroke="rgba(203,213,225,0.95)" strokeWidth="2.5" />
      {/* Heart shadow */}
      <ellipse cx="320" cy="162" rx="12" ry="15"
        fill="rgba(148,163,184,0.2)" stroke="rgba(148,163,184,0.45)" strokeWidth="1" />
      {/* Ribs left */}
      <path d="M323 136 Q295 141 289 152" stroke="rgba(148,163,184,0.55)" strokeWidth="1" fill="none" />
      <path d="M323 147 Q293 153 287 164" stroke="rgba(148,163,184,0.55)" strokeWidth="1" fill="none" />
      <path d="M323 158 Q292 165 289 176" stroke="rgba(148,163,184,0.5)"  strokeWidth="1" fill="none" />
      <path d="M323 168 Q294 176 292 185" stroke="rgba(148,163,184,0.4)"  strokeWidth="1" fill="none" />
      {/* Ribs right */}
      <path d="M333 136 Q361 141 367 152" stroke="rgba(148,163,184,0.55)" strokeWidth="1" fill="none" />
      <path d="M333 147 Q363 153 369 164" stroke="rgba(148,163,184,0.55)" strokeWidth="1" fill="none" />
      <path d="M333 158 Q364 165 367 176" stroke="rgba(148,163,184,0.5)"  strokeWidth="1" fill="none" />
      <path d="M333 168 Q362 176 360 185" stroke="rgba(148,163,184,0.4)"  strokeWidth="1" fill="none" />
      {/* Region of interest (blue box) */}
      <rect x="308" y="144" width="42" height="32"
        fill="rgba(59,130,246,0.1)" stroke="rgba(59,130,246,0.5)"
        strokeWidth="1.2" strokeDasharray="4,2" rx="3" />
      {/* Callout line + dot */}
      <line x1="350" y1="160" x2="374" y2="160" stroke="rgba(59,130,246,0.6)" strokeWidth="1" strokeDasharray="3,2" />
      <circle cx="375" cy="160" r="3" fill="rgba(59,130,246,0.7)" />
      {/* Patient data panel (right edge of screen) */}
      <rect x="380" y="110" width="32" height="96" fill="rgba(7,21,37,0.7)" rx="4" />
      <rect x="384" y="115" width="24" height="4"  fill="rgba(99,102,241,0.7)" rx="2" />
      <rect x="384" y="122" width="20" height="3"  fill="rgba(148,163,184,0.4)" rx="1" />
      <rect x="384" y="128" width="22" height="3"  fill="rgba(148,163,184,0.4)" rx="1" />
      <rect x="384" y="134" width="16" height="3"  fill="rgba(148,163,184,0.4)" rx="1" />
      <line x1="384" y1="142" x2="408" y2="142" stroke="rgba(99,102,241,0.2)" strokeWidth="1" />
      <rect x="384" y="147" width="24" height="4"  fill="rgba(16,185,129,0.6)" rx="2" />
      <rect x="384" y="155" width="20" height="3"  fill="rgba(148,163,184,0.4)" rx="1" />
      <rect x="384" y="161" width="18" height="3"  fill="rgba(148,163,184,0.4)" rx="1" />
      <line x1="384" y1="169" x2="408" y2="169" stroke="rgba(99,102,241,0.2)" strokeWidth="1" />
      <rect x="384" y="174" width="24" height="10" fill="rgba(16,185,129,0.2)" rx="3" />
      <rect x="387" y="177" width="18" height="4"  fill="rgba(16,185,129,0.7)" rx="2" />
      {/* Measurement ruler */}
      <line x1="256" y1="122" x2="256" y2="192" stroke="rgba(99,102,241,0.35)" strokeWidth="1" strokeDasharray="3,2" />
      <line x1="253" y1="122" x2="259" y2="122" stroke="rgba(99,102,241,0.5)" strokeWidth="1" />
      <line x1="253" y1="192" x2="259" y2="192" stroke="rgba(99,102,241,0.5)" strokeWidth="1" />

      {/* ── SMALL MONITOR (left) ── */}
      <rect x="36" y="134" width="136" height="104" fill="#1e293b" rx="8" filter="url(#hi-mon-glow)" />
      <rect x="44" y="142" width="120" height="88" fill="#071525" rx="4" />
      {/* Grid lines */}
      <line x1="44" y1="182" x2="164" y2="182" stroke="rgba(99,102,241,0.12)" strokeWidth="1" />
      <line x1="44" y1="198" x2="164" y2="198" stroke="rgba(99,102,241,0.12)" strokeWidth="1" />
      <line x1="44" y1="214" x2="164" y2="214" stroke="rgba(99,102,241,0.12)" strokeWidth="1" />
      {/* EKG / vital signs */}
      <polyline
        points="46,214 54,214 57,183 61,214 65,214 69,172 73,214 76,214 80,198 84,208 88,208 92,184 96,208 100,208 104,195 108,205 112,205 116,190 120,205 124,205 128,200 132,205 136,205 140,196 144,205 148,205 156,205 164,205"
        stroke="#10b981" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Area fill */}
      <path
        d="M46,214 L54,214 L57,183 L61,214 L65,214 L69,172 L73,214 L164,214 L164,228 L46,228 Z"
        fill="rgba(16,185,129,0.07)" />
      {/* Labels */}
      <rect x="48" y="146" width="38" height="5" fill="rgba(148,163,184,0.5)" rx="2" />
      <rect x="126" y="144" width="34" height="14" fill="rgba(16,185,129,0.15)" rx="4" />
      <rect x="129" y="148" width="28" height="5"  fill="rgba(16,185,129,0.7)" rx="2" />
      <rect x="129" y="155" width="20" height="3"  fill="rgba(16,185,129,0.4)" rx="1" />

      {/* ── KEYBOARD ── */}
      <rect x="158" y="254" width="106" height="14" fill="#e2e8f0" rx="3" />
      {[160,170,180,190,200,210,220,230,240].map((x, i) => (
        <rect key={i} x={x} y={257} width="6" height="4" fill="white" rx="1" opacity="0.75" />
      ))}
      <rect x="166" y="263" width="28" height="3" fill="white" rx="1" opacity="0.75" />
      <rect x="200" y="263" width="28" height="3" fill="white" rx="1" opacity="0.75" />

      {/* ── CLIPBOARD ── */}
      <rect x="56" y="212" width="58" height="60" fill="white" rx="4" filter="url(#hi-card-shadow)" />
      <rect x="56" y="212" width="58" height="14" fill="#3b82f6" rx="4" />
      <rect x="74" y="205" width="22" height="12" fill="#94a3b8" rx="3" />
      <rect x="61" y="232" width="48" height="3"  fill="#e2e8f0" rx="1" />
      <rect x="61" y="239" width="38" height="3"  fill="#e2e8f0" rx="1" />
      <rect x="61" y="246" width="44" height="3"  fill="#e2e8f0" rx="1" />
      {/* Mini scan on clipboard */}
      <rect x="61" y="253" width="48" height="14" fill="#dbeafe" rx="2" />
      <ellipse cx="75"  cy="260" rx="9" ry="6" stroke="#93c5fd" strokeWidth="1" fill="none" />
      <ellipse cx="92"  cy="260" rx="9" ry="6" stroke="#93c5fd" strokeWidth="1" fill="none" />
      <line x1="84" y1="254" x2="84" y2="266" stroke="#93c5fd" strokeWidth="1.5" />

      {/* ── PERSON SILHOUETTE (from behind) ── */}
      {/* Head */}
      <ellipse cx="174" cy="138" rx="27" ry="29" fill="#292524" />
      {/* Hair detail - bun/tied back */}
      <ellipse cx="174" cy="113" rx="10" ry="8" fill="#1c1917" />
      {/* Neck */}
      <rect x="166" y="164" width="16" height="18" fill="#c8956c" rx="3" />
      {/* Lab coat body */}
      <path d="M134 182 L140 174 L166 182 L182 182 L208 174 L214 182 L220 264 L128 264 Z"
        fill="url(#hi-coat)" stroke="#dde3ec" strokeWidth="1.5" />
      {/* Coat collar V */}
      <path d="M166 182 L174 198 L182 182" stroke="#c8d0dc" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Left arm (toward left monitor) */}
      <path d="M134 182 L100 236 L110 242 L148 194 Z"
        fill="url(#hi-coat)" stroke="#dde3ec" strokeWidth="1.5" />
      <ellipse cx="105" cy="239" rx="8" ry="5.5" fill="#c8956c" transform="rotate(-20 105 239)" />
      {/* Right arm (toward keyboard) */}
      <path d="M214 182 L236 248 L226 254 L208 194 Z"
        fill="url(#hi-coat)" stroke="#dde3ec" strokeWidth="1.5" />
      <ellipse cx="231" cy="251" rx="8" ry="5.5" fill="#c8956c" transform="rotate(15 231 251)" />
      {/* Stethoscope */}
      <path d="M161 193 Q148 212 148 230 Q148 243 157 244"
        stroke="#475569" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="157" cy="246" r="5" fill="#475569" />
      <path d="M187 193 Q200 212 200 230 Q200 243 191 244"
        stroke="#475569" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Pockets */}
      <rect x="143" y="224" width="28" height="24" fill="rgba(220,228,238,0.85)" rx="3" stroke="#c8d0dc" strokeWidth="1" />
      <rect x="183" y="224" width="28" height="24" fill="rgba(220,228,238,0.85)" rx="3" stroke="#c8d0dc" strokeWidth="1" />
      {/* Pen in left pocket */}
      <rect x="149" y="224" width="3" height="18" fill="#3b82f6" rx="1.5" />
      <rect x="153" y="224" width="3" height="18" fill="#10b981" rx="1.5" />

      {/* ── FLOATING CARD top-left ── */}
      <rect x="16" y="30" width="94" height="70" fill="white" rx="10" filter="url(#hi-card-shadow)" />
      <rect x="24" y="39" width="78" height="5"  fill="#3b82f6" rx="2" />
      <rect x="24" y="48" width="58" height="4"  fill="#e2e8f0" rx="2" />
      {/* Bar chart */}
      <rect x="24" y="66" width="8"  height="22" fill="rgba(59,130,246,0.25)" rx="2" />
      <rect x="36" y="59" width="8"  height="29" fill="rgba(59,130,246,0.45)" rx="2" />
      <rect x="48" y="62" width="8"  height="26" fill="rgba(59,130,246,0.35)" rx="2" />
      <rect x="60" y="55" width="8"  height="33" fill="rgba(59,130,246,0.6)"  rx="2" />
      <rect x="72" y="57" width="8"  height="31" fill="rgba(59,130,246,0.5)"  rx="2" />
      <rect x="84" y="61" width="8"  height="27" fill="rgba(59,130,246,0.4)"  rx="2" />

      {/* ── FLOATING CARD top-right ── */}
      <rect x="380" y="24" width="86" height="66" fill="white" rx="10" filter="url(#hi-card-shadow)" />
      <polyline
        points="388,54 395,54 398,42 402,66 406,40 410,66 414,54 422,54 426,54"
        stroke="#10b981" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="388" y="70" width="30" height="4" fill="#e2e8f0" rx="2" />
      <rect x="388" y="77" width="22" height="4" fill="#e2e8f0" rx="2" />
      <rect x="424" y="38" width="34" height="18" fill="rgba(16,185,129,0.12)" rx="4" />
      <rect x="427" y="42" width="28" height="5" fill="rgba(16,185,129,0.65)" rx="2" />
      <rect x="427" y="50" width="20" height="4" fill="rgba(16,185,129,0.4)"  rx="2" />

      {/* ── VERIFIED BADGE floating bottom-right ── */}
      <rect x="400" y="190" width="70" height="60" fill="rgba(16,185,129,0.1)" rx="10"
        stroke="rgba(16,185,129,0.35)" strokeWidth="1.5" filter="url(#hi-card-shadow)" />
      <circle cx="422" cy="213" r="12" fill="#10b981" />
      <polyline points="416,213 421,218 429,207"
        stroke="white" strokeWidth="2.2" fill="none"
        strokeLinecap="round" strokeLinejoin="round" />
      <rect x="438" y="207" width="24" height="5" fill="rgba(16,185,129,0.7)" rx="2" />
      <rect x="438" y="215" width="18" height="4" fill="rgba(16,185,129,0.5)" rx="2" />
      <rect x="408" y="232" width="54" height="5" fill="rgba(16,185,129,0.15)" rx="2" />
      <rect x="413" y="239" width="42" height="4" fill="rgba(16,185,129,0.3)"  rx="2" />
    </svg>
  );
}
