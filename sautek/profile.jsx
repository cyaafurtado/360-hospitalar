// 360 Hospitalar — Perfil do fornecedor logado (visualizar / editar)
const { useState: useStateS } = React;
const SUP_DATA = window.SAUTEK_DATA;

function SupplierProfile({ go }) {
  const base = SUP_DATA.COMPANIES.find((c) => c.id === "medlab") || SUP_DATA.COMPANIES[0];
  const [edit, setEdit] = useStateS(false);
  const [saved, setSaved] = useStateS(false);
  const [form, setForm] = useStateS({
    name: base.name, tagline: base.tagline, about: base.about,
    segment: base.segment, uf: base.uf, city: base.city,
    email: "contato@" + base.site, phone: base.phone, site: base.site,
    employees: base.employees, atendeUfs: [base.uf, "RJ", "MG", "PR"],
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleUf = (u) => setForm((f) => ({ ...f, atendeUfs: f.atendeUfs.includes(u) ? f.atendeUfs.filter((x) => x !== u) : [...f.atendeUfs, u] }));

  const save = () => { setEdit(false); setSaved(true); setTimeout(() => setSaved(false), 2600); };

  const Row = ({ label, value, k, type }) => (
    <div className="prof-row">
      <span className="prof-label">{label}</span>
      {edit
        ? (type === "area"
            ? <textarea className="prof-input" rows={3} value={form[k]} onChange={(e) => set(k, e.target.value)} />
            : <input className="prof-input" value={form[k]} onChange={(e) => set(k, e.target.value)} />)
        : <span className="prof-value">{value}</span>}
    </div>
  );

  return (
    <div className="portal-screen" data-screen-label="Portal — Meu perfil">
      <PortalNav active="supplier" go={go} />
      <div className="portal-body">
        <header className="portal-head row">
          <div>
            <h1>Meu perfil</h1>
            <p className="muted">Dados que aparecem para clínicas e hospitais na busca.</p>
          </div>
          <div className="portal-head-actions">
            {saved && <span className="prof-saved"><Icon name="check" size={14} stroke={2.6} /> Alterações salvas</span>}
            {edit
              ? <><button className="btn-ghost" onClick={() => setEdit(false)}>Cancelar</button><button className="btn-primary" onClick={save}><Icon name="check" size={15} stroke={2.4} /> Salvar</button></>
              : <button className="btn-primary" onClick={() => setEdit(true)}><Icon name="sliders" size={15} /> Editar perfil</button>}
          </div>
        </header>

        <div className="prof-hero">
          <Logo name={form.name} size={72} radius="var(--logo-radius-lg)" />
          <div className="prof-hero-main">
            <div className="prof-hero-top">
              <h2>{form.name}</h2>
              {base.verified && <VerifiedTag />}
            </div>
            <div className="prof-hero-seg">{segmentLabel(form.segment)}</div>
            <p className="prof-hero-tag">{form.tagline}</p>
          </div>
          <div className="prof-rate">
            <div className="prof-rate-num">{base.rating.toFixed(1)}</div>
            <Stars value={base.rating} size={14} />
            <span className="muted">{base.reviews} avaliações</span>
          </div>
        </div>

        <div className="prof-grid">
          <section className="prof-card">
            <h3>Dados da empresa</h3>
            <Row label="Nome" value={form.name} k="name" />
            <Row label="Frase de destaque" value={form.tagline} k="tagline" />
            <Row label="Sobre" value={form.about} k="about" type="area" />
            <Row label="Site" value={form.site} k="site" />
            <Row label="Porte" value={form.employees + " func."} k="employees" />
          </section>

          <section className="prof-card">
            <h3>Contato</h3>
            <Row label="E-mail" value={form.email} k="email" />
            <Row label="Telefone" value={form.phone} k="phone" />
            <div className="prof-row">
              <span className="prof-label">Cidade / Estado</span>
              {edit
                ? <div className="prof-2col">
                    <input className="prof-input" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Cidade" />
                    <select className="prof-input" value={form.uf} onChange={(e) => set("uf", e.target.value)}>
                      {SUP_DATA.STATES.map((s) => <option key={s.uf} value={s.uf}>{s.uf}</option>)}
                    </select>
                  </div>
                : <span className="prof-value">{form.city} · {form.uf}</span>}
            </div>
          </section>

          <section className="prof-card span-2">
            <h3>Área de atuação — estados onde atende</h3>
            {edit
              ? <div className="uf-grid">
                  {SUP_DATA.STATES.map((s) => (
                    <button key={s.uf} type="button" title={s.name}
                      className={"uf-chip" + (form.atendeUfs.includes(s.uf) ? " on" : "")}
                      onClick={() => toggleUf(s.uf)}>{s.uf}</button>
                  ))}
                </div>
              : <div className="prof-uf-list">
                  {form.atendeUfs.length === 0
                    ? <span className="muted">Nenhum estado informado.</span>
                    : form.atendeUfs.map((u) => <span key={u} className="uf-tag big">{u} <span className="cell-sub">{stateName(u)}</span></span>)}
                </div>}
          </section>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SupplierProfile });
