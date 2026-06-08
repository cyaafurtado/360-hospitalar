// Sautek — app principal
const { useState, useEffect, useRef } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "trust",
  "accent": "oklch(0.48 0.13 255)",
  "density": "regular"
}/*EDITMODE-END*/;

function Header({ go }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="brand" onClick={() => go("home")}>
          <svg className="brand-shield" width="38" height="38" viewBox="0 0 100 100" fill="none" aria-label="360 Hospitalar">
            <ellipse cx="50" cy="50" rx="40" ry="18" fill="none" stroke="oklch(0.56 0.16 248)" strokeWidth="5" transform="rotate(-30 50 50)" />
            <rect x="44.5" y="33" width="11" height="34" rx="5.5" fill="oklch(0.68 0.15 165)" />
            <rect x="33" y="44.5" width="34" height="11" rx="5.5" fill="oklch(0.68 0.15 165)" />
            <circle cx="86" cy="34" r="5" fill="oklch(0.56 0.16 248)" />
          </svg>
          <span className="brand-lockup">
            <span className="brand-name">360 <span>Hospitalar</span></span>
            <span className="brand-tagline">REDE DE PRESTADORES</span>
          </span>
        </div>
        <nav className="nav">
          <a onClick={() => go("home")}>Segmentos</a>
          <a onClick={() => go("results")}>Buscar</a>
          <a onClick={() => go("register")}>Para fornecedores</a>
          <a className="header-login" onClick={() => go("login")}>Entrar</a>
          <button className="btn-primary" onClick={() => go("register")}>Cadastrar empresa</button>
        </nav>
      </div>
    </header>
  );
}

function Footer({ go }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="muted">© 2026 360 Hospitalar · Diretório B2B do setor de saúde</div>
        <div className="footer-links">
          <a>Sobre</a><a>Como verificamos</a><a onClick={() => go("register")}>Para fornecedores</a><a>Contato</a>
        </div>
      </div>
    </footer>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const [view, setView] = useState("home");
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [uf, setUf] = useState("");
  const [filters, setFilters] = useState({ segments: [], uf: "", minRating: 0 });
  const [sort, setSort] = useState("rating");
  const [layout, setLayout] = useState("grid");

  const go = (v, payload) => {
    if ((v === "detail" || v === "quote") && payload) setSelected(payload);
    if (v === "results") { /* keep filters */ }
    setView(v);
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  };

  const runSearch = () => {
    setFilters((f) => ({ ...f, uf: uf || f.uf }));
    go("results");
  };

  const pickSegment = (segId) => {
    setFilters({ segments: [segId], uf: uf || "", minRating: 0 });
    go("results");
  };

  return (
    <div className="app" data-theme={t.theme} data-density={t.density} style={{ "--primary": t.accent }}>
      <Header go={go} />

      {view === "home" && (
        <Home go={go} query={query} setQuery={setQuery} uf={uf} setUf={setUf}
          onSearch={runSearch} onSegment={pickSegment} />
      )}
      {view === "results" && (
        <Results go={go} query={query} setQuery={setQuery} uf={uf} setUf={setUf}
          onSearch={runSearch} filters={filters} setFilters={setFilters}
          layout={layout} setLayout={setLayout} sort={sort} setSort={setSort} />
      )}
      {view === "detail" && selected && <Detail c={selected} go={go} />}
      {view === "quote" && selected && <QuoteRequest c={selected} go={go} />}
      {view === "register" && <Register go={go} />}
      {view === "login" && <Login go={go} />}
      {view === "portal" && <Portal go={go} />}
      {view === "supplier" && <SupplierProfile go={go} />}

      {view !== "login" && view !== "portal" && view !== "supplier" && <Footer go={go} />}

      <TweaksPanel>
        <TweakSection label="Direção visual" />
        <TweakRadio label="Tema" value={t.theme}
          options={[
            { value: "trust", label: "Confiança" },
            { value: "clinic", label: "Clínico" },
            { value: "editorial", label: "Editorial" },
          ]}
          onChange={(v) => setTweak("theme", v)} />
        <TweakColor label="Cor de destaque" value={t.accent}
          options={[
            "oklch(0.48 0.13 255)",
            "oklch(0.52 0.10 200)",
            "oklch(0.50 0.11 162)",
            "oklch(0.45 0.14 282)",
          ]}
          onChange={(v) => setTweak("accent", v)} />
        <TweakSection label="Layout" />
        <TweakRadio label="Densidade" value={t.density}
          options={["compact", "regular", "comfy"]}
          onChange={(v) => setTweak("density", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
