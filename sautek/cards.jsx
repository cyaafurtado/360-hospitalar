// Sautek — busca, filtros e cards
const { SEGMENTS, STATES } = window.SAUTEK_DATA;

/* ---------- Barra de busca ---------- */
function SearchBar({ value, onChange, onSubmit, segment, onSegment, big, placeholder }) {
  return (
    <form className={"searchbar" + (big ? " big" : "")} onSubmit={(e) => { e.preventDefault(); onSubmit && onSubmit(); }}>
      <div className="sb-field">
        <Icon name="search" size={big ? 22 : 18} className="sb-icon" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Buscar fornecedor, serviço ou segmento…"}
        />
      </div>
      {big && (
        <div className="sb-seg">
          <Icon name="pin" size={18} className="sb-icon" />
          <select value={segment || ""} onChange={(e) => onSegment(e.target.value)}>
            <option value="">Todo o Brasil</option>
            {STATES.map((s) => <option key={s.uf} value={s.uf}>{s.name}</option>)}
          </select>
        </div>
      )}
      <button type="submit" className="btn-primary sb-btn">
        Buscar{big ? "" : ""}
      </button>
    </form>
  );
}

/* ---------- Chips de segmento ---------- */
function SegmentChips({ onPick, active }) {
  return (
    <div className="seg-chips">
      {SEGMENTS.map((s) => (
        <button key={s.id} className={"seg-chip" + (active === s.id ? " on" : "")} onClick={() => onPick(s.id)}>
          <span className="seg-chip-ico"><Icon name={s.icon} size={18} /></span>
          {s.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Painel de filtros ---------- */
function FilterRail({ filters, setFilters, counts }) {
  const toggleSeg = (id) => {
    const next = new Set(filters.segments);
    next.has(id) ? next.delete(id) : next.add(id);
    setFilters({ ...filters, segments: [...next] });
  };
  return (
    <aside className="filter-rail">
      <div className="fr-head">
        <Icon name="filter" size={17} />
        <span>Filtros</span>
        {(filters.segments.length || filters.uf || filters.minRating > 0) ? (
          <button className="fr-clear" onClick={() => setFilters({ segments: [], uf: "", minRating: 0 })}>Limpar</button>
        ) : null}
      </div>

      <div className="fr-block">
        <h4>Segmento</h4>
        <div className="fr-segs">
          {SEGMENTS.map((s) => (
            <label key={s.id} className={"fr-check" + (filters.segments.includes(s.id) ? " on" : "")}>
              <input type="checkbox" checked={filters.segments.includes(s.id)} onChange={() => toggleSeg(s.id)} />
              <span className="fr-box"><Icon name="check" size={12} stroke={3} /></span>
              <span className="fr-label">{s.label}</span>
              {counts && <span className="fr-count">{counts.bySeg[s.id] || 0}</span>}
            </label>
          ))}
        </div>
      </div>

      <div className="fr-block">
        <h4>Localização</h4>
        <div className="fr-select">
          <Icon name="pin" size={16} />
          <select value={filters.uf} onChange={(e) => setFilters({ ...filters, uf: e.target.value })}>
            <option value="">Todos os estados</option>
            {STATES.map((s) => <option key={s.uf} value={s.uf}>{s.name} ({s.uf})</option>)}
          </select>
        </div>
      </div>

      <div className="fr-block">
        <h4>Avaliação mínima</h4>
        <div className="fr-ratings">
          {[0, 4, 4.5].map((r) => (
            <button key={r} className={"fr-rate" + (filters.minRating === r ? " on" : "")}
              onClick={() => setFilters({ ...filters, minRating: r })}>
              {r === 0 ? "Todas" : <><Stars value={5} size={12} /> {r.toFixed(1)}+</>}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

/* ---------- Card de empresa ---------- */
function CompanyCard({ c, layout, onOpen }) {
  if (layout === "list") {
    return (
      <article className="company-card list" onClick={() => onOpen(c)}>
        <Logo name={c.name} size={64} />
        <div className="cc-main">
          <div className="cc-toprow">
            <h3>{c.name}</h3>
            {c.verified && <VerifiedTag small />}
          </div>
          <div className="cc-seg">{segmentLabel(c.segment)}</div>
          <p className="cc-tag">{c.tagline}</p>
          <div className="cc-meta">
            <span className="cc-loc"><Icon name="pin" size={13} /> {c.city} · {c.uf}</span>
          </div>
        </div>
        <div className="cc-aside">
          <RatingLine rating={c.rating} reviews={c.reviews} />
          <button className="btn-ghost cc-cta">Ver perfil <Icon name="arrow" size={15} /></button>
        </div>
      </article>
    );
  }
  return (
    <article className="company-card grid" onClick={() => onOpen(c)}>
      <div className="cc-head">
        <Logo name={c.name} size={52} />
        {c.verified && <VerifiedTag small />}
      </div>
      <h3>{c.name}</h3>
      <div className="cc-seg">{segmentLabel(c.segment)}</div>
      <p className="cc-tag">{c.tagline}</p>
      <div className="cc-foot">
        <RatingLine rating={c.rating} reviews={c.reviews} size={13} />
        <span className="cc-loc"><Icon name="pin" size={13} /> {c.uf}</span>
      </div>
    </article>
  );
}

Object.assign(window, { SearchBar, SegmentChips, FilterRail, CompanyCard });
