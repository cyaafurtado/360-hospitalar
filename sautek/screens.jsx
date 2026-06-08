// Sautek — telas (Home, Resultados, Detalhe)
const { COMPANIES: ALL, SEGMENTS: SEGS, STATES: UFS } = window.SAUTEK_DATA;

/* ============ HOME ============ */
function Home({ go, query, setQuery, uf, setUf, onSearch, onSegment }) {
  const featured = [...ALL].sort((a, b) => b.rating - a.rating).slice(0, 6);
  return (
    <div className="screen home" data-screen-label="Home">
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow">Diretório B2B do setor de saúde</div>
          <h1 className="hero-title">
            Encontre fornecedores e parceiros<br />
            <em>confiáveis</em> para sua operação de saúde.
          </h1>
          <p className="hero-sub">
            Clínicas, hospitais e prestadores privados conectam-se a fornecedores
            verificados — de laboratórios e equipamentos a esterilização e gestão de resíduos.
          </p>
          <div className="hero-search">
            <SearchBar value={query} onChange={setQuery} onSubmit={onSearch}
              segment={uf} onSegment={setUf} big placeholder="Ex: esterilização, equipamentos, software…" />
          </div>
          <div className="hero-stats">
            <div><strong>2.400+</strong><span>fornecedores cadastrados</span></div>
            <div className="div" />
            <div><strong>12</strong><span>segmentos de saúde</span></div>
            <div className="div" />
            <div><strong>98%</strong><span>verificados e auditados</span></div>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="band-head">
          <h2>Explore por segmento</h2>
          <p className="muted">Categorias mais buscadas por gestores de saúde</p>
        </div>
        <SegmentChips onPick={onSegment} />
      </section>

      <section className="band">
        <div className="band-head row">
          <div>
            <h2>Fornecedores em destaque</h2>
            <p className="muted">Empresas com melhor avaliação dos compradores</p>
          </div>
          <button className="btn-ghost" onClick={() => onSearch()}>Ver todos <Icon name="arrow" size={15} /></button>
        </div>
        <div className="card-grid">
          {featured.map((c) => <CompanyCard key={c.id} c={c} layout="grid" onOpen={(co) => go("detail", co)} />)}
        </div>
      </section>

      <section className="trust-band">
        <div className="trust-item"><Icon name="shield2" size={26} /><div><strong>Verificação documental</strong><span>CNPJ, licenças e certificações auditadas.</span></div></div>
        <div className="trust-item"><Icon name="star" size={26} /><div><strong>Avaliações reais</strong><span>Notas de compradores do setor de saúde.</span></div></div>
        <div className="trust-item"><Icon name="users" size={26} /><div><strong>Contato direto</strong><span>Fale com o fornecedor sem intermediários.</span></div></div>
      </section>
    </div>
  );
}

/* ============ RESULTADOS ============ */
function Results({ go, query, setQuery, uf, setUf, onSearch, filters, setFilters, layout, setLayout, sort, setSort }) {
  const counts = useMemo(() => {
    const bySeg = {};
    ALL.forEach((c) => { bySeg[c.segment] = (bySeg[c.segment] || 0) + 1; });
    return { bySeg };
  }, []);

  const results = useMemo(() => {
    let list = ALL.filter((c) => {
      if (filters.segments.length && !filters.segments.includes(c.segment)) return false;
      if (filters.uf && c.uf !== filters.uf) return false;
      if (filters.minRating && c.rating < filters.minRating) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const hay = (c.name + " " + c.tagline + " " + segmentLabel(c.segment) + " " + c.services.join(" ")).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === "reviews") list = [...list].sort((a, b) => b.reviews - a.reviews);
    if (sort === "az") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [filters, query, sort]);

  return (
    <div className="screen results" data-screen-label="Resultados">
      <div className="results-searchrow">
        <SearchBar value={query} onChange={setQuery} onSubmit={onSearch}
          segment={uf} onSegment={setUf} big placeholder="Buscar fornecedor ou serviço…" />
      </div>
      <div className="results-body">
        <FilterRail filters={filters} setFilters={setFilters} counts={counts} />
        <div className="results-main">
          <div className="results-bar">
            <div className="rb-count">
              <strong>{results.length}</strong> fornecedor{results.length === 1 ? "" : "es"}
              {filters.uf && <> em <em>{UFS.find((s) => s.uf === filters.uf)?.name}</em></>}
            </div>
            <div className="rb-right">
              <div className="rb-sort">
                <label>Ordenar</label>
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="rating">Melhor avaliados</option>
                  <option value="reviews">Mais avaliações</option>
                  <option value="az">Nome (A–Z)</option>
                </select>
              </div>
              <div className="layout-toggle">
                <button className={layout === "grid" ? "on" : ""} onClick={() => setLayout("grid")} title="Grade"><Icon name="grid" size={16} /></button>
                <button className={layout === "list" ? "on" : ""} onClick={() => setLayout("list")} title="Lista"><Icon name="list" size={16} /></button>
              </div>
            </div>
          </div>

          {/* chips de filtros ativos */}
          {(filters.segments.length || filters.uf || filters.minRating > 0) ? (
            <div className="active-chips">
              {filters.segments.map((s) => (
                <span key={s} className="active-chip" onClick={() => setFilters({ ...filters, segments: filters.segments.filter((x) => x !== s) })}>
                  {segmentLabel(s)} <Icon name="close" size={12} />
                </span>
              ))}
              {filters.uf && <span className="active-chip" onClick={() => setFilters({ ...filters, uf: "" })}>{filters.uf} <Icon name="close" size={12} /></span>}
              {filters.minRating > 0 && <span className="active-chip" onClick={() => setFilters({ ...filters, minRating: 0 })}>{filters.minRating}+ <Icon name="close" size={12} /></span>}
            </div>
          ) : null}

          {results.length === 0 ? (
            <div className="empty">
              <Icon name="search" size={34} />
              <h3>Nenhum fornecedor encontrado</h3>
              <p>Tente ampliar os filtros ou mudar os termos de busca.</p>
              <button className="btn-primary" onClick={() => { setFilters({ segments: [], uf: "", minRating: 0 }); setQuery(""); }}>Limpar busca</button>
            </div>
          ) : (
            <div className={layout === "list" ? "card-list" : "card-grid results-grid"}>
              {results.map((c) => <CompanyCard key={c.id} c={c} layout={layout} onOpen={(co) => go("detail", co)} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============ DETALHE ============ */
function Detail({ c, go }) {
  const similar = ALL.filter((x) => x.segment === c.segment && x.id !== c.id).slice(0, 3);
  const dist = { 5: 0.62, 4: 0.26, 3: 0.08, 2: 0.03, 1: 0.01 };
  return (
    <div className="screen detail" data-screen-label="Detalhe da empresa">
      <button className="back-link" onClick={() => go("results")}><Icon name="back" size={16} /> Voltar aos resultados</button>

      <header className="detail-hero">
        <Logo name={c.name} size={88} radius="var(--logo-radius-lg)" />
        <div className="dh-main">
          <div className="dh-toprow">
            <h1>{c.name}</h1>
            {c.verified && <VerifiedTag />}
          </div>
          <div className="dh-seg">{segmentLabel(c.segment)}</div>
          <p className="dh-tag">{c.tagline}</p>
          <div className="dh-meta">
            <span><Icon name="pin" size={15} /> {c.city} · {c.uf}</span>
            <span><Icon name="users" size={15} /> {c.employees} func.</span>
            <span><Icon name="cal" size={15} /> Desde {c.founded}</span>
          </div>
        </div>
        <div className="dh-rate">
          <div className="dh-score">{c.rating.toFixed(1)}</div>
          <Stars value={c.rating} size={16} />
          <div className="muted">{c.reviews} avaliações</div>
          <button className="btn-primary dh-cta" onClick={() => go("quote", c)}><Icon name="phone" size={15} /> Solicitar contato</button>
          <button className="btn-ghost dh-cta2"><Icon name="globe" size={15} /> {c.site}</button>
        </div>
      </header>

      <div className="detail-grid">
        <main className="detail-col">
          <section className="d-block">
            <h2>Sobre a empresa</h2>
            <p>{c.about}</p>
          </section>

          <section className="d-block">
            <h2>Serviços e soluções</h2>
            <div className="svc-grid">
              {c.services.map((s) => (
                <div key={s} className="svc-item"><span className="svc-dot"><Icon name="check" size={13} stroke={3} /></span>{s}</div>
              ))}
            </div>
          </section>

          <section className="d-block">
            <h2>Avaliações dos compradores</h2>
            <div className="rev-summary">
              <div className="rev-big">
                <div className="rev-num">{c.rating.toFixed(1)}</div>
                <Stars value={c.rating} size={18} />
                <div className="muted">{c.reviews} avaliações</div>
              </div>
              <div className="rev-bars">
                {[5, 4, 3, 2, 1].map((n) => (
                  <div key={n} className="rev-bar-row">
                    <span className="rev-bar-n">{n} <Icon name="star" size={11} /></span>
                    <div className="rev-bar"><div className="rev-bar-fill" style={{ width: `${dist[n] * 100}%` }} /></div>
                    <span className="rev-bar-pct">{Math.round(dist[n] * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rev-list">
              <article className="rev-item">
                <div className="rev-head"><strong>Hospital Santa Lúcia</strong><Stars value={5} size={13} /></div>
                <p>Atendimento técnico ágil e equipe muito bem treinada. Renovamos o contrato sem hesitar.</p>
                <span className="rev-when">há 2 semanas · compra verificada</span>
              </article>
              <article className="rev-item">
                <div className="rev-head"><strong>Clínica Vida Plena</strong><Stars value={4} size={13} /></div>
                <p>Boa relação custo-benefício. Logística pontual; documentação de conformidade impecável.</p>
                <span className="rev-when">há 1 mês · compra verificada</span>
              </article>
            </div>
          </section>
        </main>

        <aside className="detail-side">
          <div className="side-card">
            <h3>Certificações</h3>
            <div className="cert-list">
              {c.badges.map((b) => <span key={b} className="cert"><Icon name="shield2" size={13} /> {b}</span>)}
            </div>
          </div>
          <div className="side-card">
            <h3>Contato</h3>
            <div className="contact-row"><Icon name="phone" size={15} /> {c.phone}</div>
            <div className="contact-row"><Icon name="globe" size={15} /> {c.site}</div>
            <div className="contact-row"><Icon name="pin" size={15} /> {c.city} · {c.uf}</div>
            <button className="btn-primary block" onClick={() => go("quote", c)}>Solicitar orçamento</button>
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="band similar">
          <h2>Fornecedores similares</h2>
          <div className="card-grid">
            {similar.map((s) => <CompanyCard key={s.id} c={s} layout="grid" onOpen={(co) => go("detail", co)} />)}
          </div>
        </section>
      )}
    </div>
  );
}

Object.assign(window, { Home, Results, Detail });
