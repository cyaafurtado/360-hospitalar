// 360 Hospitalar — Painel de Gestão: módulos por LADO da plataforma
// Prestador (empresa fornecedora) × Contratante (hospital/clínica/órgão)
const { useState: useStateSD } = React;
const SD = window.SAUTEK_DATA;

const SD_STATUS = { nova: "new", andamento: "wip", respondida: "ok", fechada: "done" };
function SdStatus({ s }) { return <span className={"st-pill st-" + (SD_STATUS[s] || "done")}>{statusLabel(s)}</span>; }
function SdType({ t }) { return <span className={"ty-pill ty-" + t}>{typeLabel(t)}</span>; }

/* ============ PRESTADOR — Solicitações recebidas ============ */
function ModSolicitacoes() {
  const reqs = SD.REQUESTS;
  const [tipo, setTipo] = useStateSD("");
  const [status, setStatus] = useStateSD("");
  const list = reqs.filter((r) => (!tipo || r.tipo === tipo) && (!status || r.status === status));
  const k = {
    total: reqs.length,
    nova: reqs.filter((r) => r.status === "nova").length,
    andamento: reqs.filter((r) => r.status === "andamento").length,
    respondida: reqs.filter((r) => r.status === "respondida").length,
  };
  return (
    <div>
      <PageHead title="Solicitações recebidas" sub="Cotações e contatos enviados pelos contratantes da rede." />
      <div className="kpi-grid">
        <KpiCard icon="list" tone="blue" num={k.total} label="Total" />
        <KpiCard icon="star" tone="amber" num={k.nova} label="Novas" />
        <KpiCard icon="signal" tone="violet" num={k.andamento} label="Em andamento" />
        <KpiCard icon="check" tone="green" num={k.respondida} label="Respondidas" />
      </div>
      <div className="adm-filters">
        <div className="pf-select"><span>Tipo</span>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Todos</option>
            {SD.REQUEST_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
        <div className="pf-select"><span>Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todos</option>
            {SD.REQUEST_STATUS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
      </div>
      <div className="table-wrap">
        <table className="req-table">
          <thead><tr><th>Solicitante</th><th>Organização</th><th>Tipo</th><th>Status</th><th>Estado</th><th>Quando</th></tr></thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id}>
                <td><div className="cell-strong">{r.solicitante}</div><div className="cell-sub">{r.cargo}</div></td>
                <td>{r.organizacao}</td>
                <td><SdType t={r.tipo} /></td>
                <td><SdStatus s={r.status} /></td>
                <td><span className="uf-tag">{r.uf}</span> <span className="cell-sub">{r.cidade}</span></td>
                <td className="cell-sub">{r.quando}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============ PRESTADOR — Catálogo de serviços ============ */
function ModCatalogo({ ctx }) {
  const base = SD.COMPANIES.find((c) => c.id === "medlab") || SD.COMPANIES[0];
  const [items, setItems] = useStateSD(base.services.map((s, i) => ({ name: s, ativo: i !== base.services.length - 1 })));
  const toggle = (i) => setItems((arr) => arr.map((it, j) => j === i ? { ...it, ativo: !it.ativo } : it));
  return (
    <div>
      <PageHead title="Meu catálogo de serviços" sub="Serviços ofertados que aparecem para os contratantes na busca.">
        <button className="btn-primary sm"><Icon name="plus" size={15} /> Adicionar serviço</button>
      </PageHead>
      <div className="svc-cards">
        {items.map((it, i) => (
          <div key={i} className={"svc-card" + (it.ativo ? "" : " off")}>
            <span className="svc-card-ico"><Icon name="check" size={16} stroke={2.6} /></span>
            <div className="svc-card-main">
              <div className="svc-card-name">{it.name}</div>
              <div className="svc-card-seg">{segmentLabel(base.segment)}</div>
            </div>
            <button className={"switch" + (it.ativo ? " on" : "")} onClick={() => toggle(i)} aria-pressed={it.ativo}><span /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ PRESTADOR — Avaliações recebidas ============ */
function ModAvaliacoes() {
  const base = SD.COMPANIES.find((c) => c.id === "medlab") || SD.COMPANIES[0];
  const dist = { 5: 0.62, 4: 0.26, 3: 0.08, 2: 0.03, 1: 0.01 };
  return (
    <div>
      <PageHead title="Avaliações recebidas" sub="O que os contratantes dizem sobre seus serviços." />
      <div className="adm-cols">
        <section className="adm-card">
          <div className="rev-summary" style={{ boxShadow: "none", border: "none", padding: 0 }}>
            <div className="rev-big">
              <div className="rev-num">{base.rating.toFixed(1)}</div>
              <Stars value={base.rating} size={18} />
              <div className="muted">{base.reviews} avaliações</div>
            </div>
            <div className="rev-bars">
              {[5, 4, 3, 2, 1].map((n) => (
                <div key={n} className="rev-bar-row">
                  <span className="rev-bar-n">{n} <Icon name="star" size={11} /></span>
                  <div className="rev-bar"><div className="rev-bar-fill" style={{ width: (dist[n] * 100) + "%" }} /></div>
                  <span className="rev-bar-pct">{Math.round(dist[n] * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="adm-card">
          <div className="adm-card-head"><h3>Comentários recentes</h3></div>
          <div className="rev-list">
            <article className="rev-item">
              <div className="rev-head"><strong>Hospital Santa Lúcia</strong><Stars value={5} size={13} /></div>
              <p>Atendimento técnico ágil e equipe muito bem treinada.</p>
              <span className="rev-when">há 2 semanas · compra verificada</span>
            </article>
            <article className="rev-item">
              <div className="rev-head"><strong>Clínica Vida Plena</strong><Stars value={4} size={13} /></div>
              <p>Boa relação custo-benefício e documentação impecável.</p>
              <span className="rev-when">há 1 mês · compra verificada</span>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ============ CONTRATANTE — Buscar fornecedores ============ */
function ModBuscar() {
  const [q, setQ] = useStateSD("");
  const list = [...SD.COMPANIES].sort((a, b) => b.rating - a.rating)
    .filter((c) => !q || (c.name + " " + segmentLabel(c.segment)).toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <PageHead title="Buscar fornecedores" sub="Encontre prestadores verificados para sua organização." />
      <div className="pf-search adm-search" style={{ maxWidth: 460 }}>
        <Icon name="search" size={17} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por serviço, segmento ou nome…" />
      </div>
      <div className="sup-list">
        {list.map((c) => (
          <div key={c.id} className="sup-item">
            <Logo name={c.name} size={44} radius="10px" />
            <div className="sup-main">
              <div className="sup-top">
                <span className="cell-strong">{c.name}</span>
                {c.verified && <span className="verified sm"><Icon name="check" size={11} stroke={2.4} /> Verificada</span>}
              </div>
              <div className="sup-seg">{segmentLabel(c.segment)} · {c.city}/{c.uf}</div>
            </div>
            <div className="sup-rate"><span className="stars" style={{ color: "var(--star)" }}><Stars value={c.rating} size={13} /></span> <strong>{c.rating.toFixed(1)}</strong></div>
            <button className="btn-primary sm"><Icon name="file" size={14} /> Solicitar cotação</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ CONTRATANTE — Minhas cotações ============ */
function ModCotacoes() {
  const cot = [
    { id: "COT-3012", prestador: "MedLab Diagnósticos", seg: "lab", status: "respondida", valor: "R$ 24.500", quando: "há 1 dia" },
    { id: "COT-3008", prestador: "SterilPro Centro de Materiais", seg: "esteril", status: "andamento", valor: "—", quando: "há 2 dias" },
    { id: "COT-3001", prestador: "OxiVida Gases Medicinais", seg: "gases", status: "fechada", valor: "R$ 8.900/mês", quando: "há 1 semana" },
    { id: "COT-2994", prestador: "BioResíduos Ambiental", seg: "residuos", status: "nova", valor: "—", quando: "há 2 semanas" },
  ];
  return (
    <div>
      <PageHead title="Minhas cotações" sub="Solicitações de cotação enviadas a fornecedores." >
        <button className="btn-primary sm"><Icon name="plus" size={15} /> Nova cotação</button>
      </PageHead>
      <div className="table-wrap">
        <table className="req-table">
          <thead><tr><th>Nº</th><th>Fornecedor</th><th>Segmento</th><th>Status</th><th>Valor</th><th>Enviada</th></tr></thead>
          <tbody>
            {cot.map((c) => (
              <tr key={c.id}>
                <td className="req-detail-id">{c.id}</td>
                <td className="cell-strong">{c.prestador}</td>
                <td><span className="type-tag">{segmentLabel(c.seg)}</span></td>
                <td><SdStatus s={c.status} /></td>
                <td className="cell-muted">{c.valor}</td>
                <td className="cell-sub">{c.quando}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============ CONTRATANTE — Fornecedores contratados ============ */
function ModContratados() {
  const ids = ["medlab", "sterilpro", "oxivida"];
  const list = ids.map((id) => SD.COMPANIES.find((c) => c.id === id)).filter(Boolean);
  return (
    <div>
      <PageHead title="Fornecedores contratados" sub="Prestadores com contrato ativo na sua organização." />
      <div className="sup-list">
        {list.map((c) => (
          <div key={c.id} className="sup-item">
            <Logo name={c.name} size={44} radius="10px" />
            <div className="sup-main">
              <div className="sup-top"><span className="cell-strong">{c.name}</span><span className="st-pill st-ok">contrato ativo</span></div>
              <div className="sup-seg">{segmentLabel(c.segment)} · {c.city}/{c.uf}</div>
            </div>
            <div className="sup-rate"><span style={{ color: "var(--star)" }}><Stars value={c.rating} size={13} /></span> <strong>{c.rating.toFixed(1)}</strong></div>
            <button className="btn-ghost sm"><Icon name="file" size={14} /> Ver contrato</button>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window.MOD_COMPONENTS, {
  solicitacoes: ModSolicitacoes, catalogo: ModCatalogo, avaliacoes: ModAvaliacoes,
  buscar: ModBuscar, cotacoes: ModCotacoes, contratados: ModContratados,
});
