// 360 Hospitalar — Painel de Gestão: módulos
const { useState: useStateM, useMemo: useMemoM } = React;
const M = window.ADMIN_DATA;

/* ---------- helpers de UI ---------- */
function PageHead({ title, sub, children }) {
  return (
    <div className="adm-page-head">
      <div><h1>{title}</h1>{sub && <p className="muted">{sub}</p>}</div>
      {children && <div className="adm-page-actions">{children}</div>}
    </div>
  );
}
function RoleBadge({ role }) {
  return <span className={"role-badge rb-" + roleTone(role)}>{roleLabel(role)}</span>;
}
const ORG_STATUS = { ativa: "ok", pendente: "wip", suspensa: "new" };
const USER_STATUS = { ativo: "ok", inativo: "done", pendente: "wip", suspenso: "new" };
function OrgStatus({ s }) { return <span className={"st-pill st-" + (ORG_STATUS[s] || "done")}>{s}</span>; }
function UserStatus({ s }) { return <span className={"st-pill st-" + (USER_STATUS[s] || "done")}>{s}</span>; }

function KpiCard({ icon, tone, num, label }) {
  return (
    <div className="kpi-card">
      <span className={"stat-ico tone-" + tone}><Icon name={icon} size={20} /></span>
      <div><div className="kpi-num">{num}</div><div className="kpi-lbl">{label}</div></div>
    </div>
  );
}

/* ====================== DASHBOARD ====================== */
function ModDashboard({ ctx }) {
  const { role, org, areas, isForn } = ctx;
  const orgUsers = M.USERS.filter((u) => u.orgId === org.id);
  const kpis = role === "super"
    ? [
        { icon: "building", tone: "blue", num: M.ORGS.length, label: "Organizações" },
        { icon: "users", tone: "violet", num: M.USERS.length, label: "Usuários na plataforma" },
        { icon: "clock", tone: "teal", num: M.ACCESS_LOGS.length, label: "Acessos registrados" },
        { icon: "bell", tone: "amber", num: M.ORGS.filter((o) => o.status !== "ativa").length, label: "Organizações p/ revisar" },
      ]
    : role === "usuario"
    ? [
        { icon: "list", tone: "blue", num: 5, label: "Minhas atividades" },
        { icon: "check", tone: "green", num: 3, label: "Concluídas no mês" },
        { icon: "clock", tone: "amber", num: 2, label: "Pendentes" },
        { icon: "file", tone: "violet", num: 8, label: "Documentos acessíveis" },
      ]
    : [
        { icon: "users", tone: "blue", num: orgUsers.length, label: "Usuários da organização" },
        { icon: "check", tone: "green", num: orgUsers.filter((u) => u.status === "ativo").length, label: "Usuários ativos" },
        { icon: "bell", tone: "amber", num: 4, label: "Aprovações pendentes" },
        { icon: "clock", tone: "teal", num: 12, label: "Acessos hoje" },
      ];

  return (
    <div>
      <PageHead title={"Olá, " + M.SESSION_USER.nome.split(" ")[0] + " 👋"} sub={"Você está em " + org.fantasia + " como " + roleLabel(role) + "."} />

      <div className="side-banner">
        <span className="side-banner-ico"><Icon name="trend" size={22} /></span>
        <div className="side-banner-text">
          <div className="side-banner-top">
            <strong>Atuação no marketplace</strong>
            <span className="type-tag">{orgTypeLabel(org.tipo)}</span>
          </div>
          <p>Toda organização pode <strong>contratar</strong> serviços. Empresas fornecedoras também <strong>recebem demandas</strong> — hospitais, clínicas e órgãos podem ativar o papel de fornecedor nas Configurações.</p>
          <div className="area-chips">
            <span className="area-chip on"><Icon name="home" size={14} /> Compra serviços</span>
            <span className={"area-chip" + (isForn ? " on forn" : "")}><Icon name="building" size={14} /> Fornece serviços{isForn ? "" : " · inativo"}</span>
          </div>
        </div>
      </div>

      <div className="kpi-grid">{kpis.map((k, i) => <KpiCard key={i} {...k} />)}</div>

      <div className="adm-cols">
        <section className="adm-card">
          <div className="adm-card-head"><h3>Atividade recente</h3></div>
          <ul className="feed">
            {M.ACCESS_LOGS.slice(0, 5).map((l) => (
              <li key={l.id} className="feed-item">
                <span className={"feed-dot" + (l.warn ? " warn" : "")} />
                <div><div className="feed-main">{l.acao}</div><div className="feed-sub">{l.usuario} · {orgById(l.orgId)?.fantasia} · {l.quando}</div></div>
              </li>
            ))}
          </ul>
        </section>
        <section className="adm-card">
          <div className="adm-card-head"><h3>Seu perfil de acesso</h3></div>
          <div className="role-panel">
            <RoleBadge role={role} />
            <p>{M.ROLES.find((r) => r.id === role)?.desc}</p>
            <div className="role-orgs">
              <span className="role-orgs-label">Suas organizações</span>
              {M.SESSION_USER.vinculos.map((v) => (
                <div key={v.orgId} className="role-org-row">
                  <Logo name={orgById(v.orgId)?.fantasia || ""} size={26} radius="7px" />
                  <span className="role-org-name">{orgById(v.orgId)?.fantasia}</span>
                  <RoleBadge role={v.perfil} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ====================== ORGANIZAÇÕES ====================== */
function ModOrganizacoes({ ctx }) {
  const { role, org } = ctx;
  const [q, setQ] = useStateM("");
  const list = (role === "super" ? M.ORGS : M.ORGS.filter((o) => o.id === org.id))
    .filter((o) => !q || (o.fantasia + o.razao + o.cnpj).toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <PageHead title="Organizações" sub={role === "super" ? "Todas as organizações da plataforma." : "Dados da sua organização."}>
        {role === "super" && <button className="btn-primary sm"><Icon name="plus" size={15} /> Nova organização</button>}
      </PageHead>
      {role === "super" && (
        <div className="pf-search adm-search">
          <Icon name="search" size={17} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome ou CNPJ…" />
        </div>
      )}
      <div className="table-wrap">
        <table className="req-table">
          <thead><tr><th>Organização</th><th>Tipo</th><th>CNPJ</th><th>Usuários</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {list.map((o) => (
              <tr key={o.id}>
                <td><div className="cell-org"><Logo name={o.fantasia} size={34} radius="8px" /><div><div className="cell-strong">{o.fantasia}</div><div className="cell-sub">{o.razao}</div></div></div></td>
                <td><span className="type-tag">{orgTypeLabel(o.tipo)}</span></td>
                <td className="cell-muted">{o.cnpj}</td>
                <td>{o.usuarios}</td>
                <td><OrgStatus s={o.status} /></td>
                <td><button className="row-toggle"><Icon name="dots" size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ====================== USUÁRIOS ====================== */
function ModUsuarios({ ctx }) {
  const { role, org } = ctx;
  const [q, setQ] = useStateM("");
  const [perfil, setPerfil] = useStateM("");
  const base = role === "super" ? M.USERS : M.USERS.filter((u) => u.orgId === org.id);
  const list = base.filter((u) =>
    (!q || (u.nome + u.email).toLowerCase().includes(q.toLowerCase())) && (!perfil || u.perfil === perfil));
  return (
    <div>
      <PageHead title="Usuários" sub={role === "super" ? "Usuários de todas as organizações." : "Usuários de " + org.fantasia + "."}>
        <button className="btn-primary sm"><Icon name="plus" size={15} /> Convidar usuário</button>
      </PageHead>
      <div className="adm-filters">
        <div className="pf-search adm-search">
          <Icon name="search" size={17} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome ou e-mail…" />
        </div>
        <div className="pf-select"><span>Perfil</span>
          <select value={perfil} onChange={(e) => setPerfil(e.target.value)}>
            <option value="">Todos</option>
            {M.ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </div>
      </div>
      <div className="table-wrap">
        <table className="req-table">
          <thead><tr><th>Usuário</th>{role === "super" && <th>Organização</th>}<th>Perfil</th><th>Status</th><th>Último acesso</th><th></th></tr></thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.id + u.orgId}>
                <td><div className="cell-org"><span className="avatar">{u.nome.split(" ").map((p) => p[0]).slice(0, 2).join("")}</span><div><div className="cell-strong">{u.nome}</div><div className="cell-sub">{u.email}</div></div></div></td>
                {role === "super" && <td className="cell-muted">{orgById(u.orgId)?.fantasia}</td>}
                <td><RoleBadge role={u.perfil} /></td>
                <td><UserStatus s={u.status} /></td>
                <td className="cell-muted">{u.ultimo}</td>
                <td><div className="row-actions"><button className="ico-btn" title="Editar"><Icon name="edit" size={15} /></button><button className="ico-btn danger" title="Remover"><Icon name="trash" size={15} /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ====================== PERFIS & PERMISSÕES ====================== */
function ModPerfis() {
  const roles = M.ROLES.filter((r) => r.id === "super" || r.id === "usuario");
  const basic = M.CAPABILITIES.filter((c) =>
    ["cap-users", "cap-self", "cap-operate", "cap-org-own", "cap-global"].includes(c.id));
  return (
    <div>
      <PageHead title="Perfis & Permissões" sub="Controle de acesso básico — o que cada perfil pode fazer." />
      <div className="table-wrap perm-wrap">
        <table className="req-table perm-table">
          <thead><tr><th>Permissão</th>{roles.map((r) => <th key={r.id} className="perm-col">{r.label}</th>)}</tr></thead>
          <tbody>
            {basic.map((c) => (
              <tr key={c.id}>
                <td className="cell-strong">{c.label}</td>
                {roles.map((r) => (
                  <td key={r.id} className="perm-cell">
                    {c.roles[r.id]
                      ? <span className="perm-yes"><Icon name="check" size={14} stroke={3} /></span>
                      : <span className="perm-no"><Icon name="close" size={12} stroke={2.4} /></span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ====================== APROVAÇÕES ====================== */
function ModAprovacoes({ ctx }) {
  const items = [
    { id: "AP-118", titulo: "Compra de reagentes — lote 0934", quem: "Bruno Carvalho", quando: "há 1 h", valor: "R$ 14.200" },
    { id: "AP-117", titulo: "Novo usuário: Carla Dias (Usuário)", quem: "RH", quando: "há 3 h", valor: "—" },
    { id: "AP-115", titulo: "Contrato de manutenção preventiva", quem: "Fábio Lima", quando: "ontem", valor: "R$ 8.900/mês" },
    { id: "AP-112", titulo: "Acesso ao módulo de relatórios", quem: "Gabriela Nunes", quando: "ontem", valor: "—" },
  ];
  const [acted, setActed] = useStateM({});
  return (
    <div>
      <PageHead title="Aprovações" sub="Solicitações internas aguardando sua decisão." />
      <div className="appr-list">
        {items.map((it) => (
          <div key={it.id} className="appr-card">
            <div className="appr-main">
              <span className="req-detail-id">{it.id}</span>
              <div className="appr-title">{it.titulo}</div>
              <div className="cell-sub">{it.quem} · {it.quando}{it.valor !== "—" ? " · " + it.valor : ""}</div>
            </div>
            {acted[it.id]
              ? <span className={"appr-done " + acted[it.id]}>{acted[it.id] === "ok" ? "Aprovado" : "Recusado"}</span>
              : <div className="appr-actions">
                  <button className="btn-ghost sm" onClick={() => setActed((a) => ({ ...a, [it.id]: "no" }))}>Recusar</button>
                  <button className="btn-primary sm" onClick={() => setActed((a) => ({ ...a, [it.id]: "ok" }))}><Icon name="check" size={14} stroke={2.4} /> Aprovar</button>
                </div>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ====================== RELATÓRIOS ====================== */
function ModRelatorios({ ctx }) {
  const bars = [
    { l: "Jan", v: 62 }, { l: "Fev", v: 78 }, { l: "Mar", v: 71 }, { l: "Abr", v: 90 }, { l: "Mai", v: 84 }, { l: "Jun", v: 96 },
  ];
  const max = Math.max(...bars.map((b) => b.v));
  return (
    <div>
      <PageHead title="Relatórios" sub="Indicadores e desempenho da organização." >
        <button className="btn-ghost sm"><Icon name="file" size={15} /> Exportar</button>
      </PageHead>
      <div className="kpi-grid">
        <KpiCard icon="trend" tone="blue" num="+18%" label="Acessos vs. mês anterior" />
        <KpiCard icon="check" tone="green" num="92%" label="Solicitações respondidas" />
        <KpiCard icon="clock" tone="amber" num="2,4 h" label="Tempo médio de resposta" />
        <KpiCard icon="users" tone="violet" num="86%" label="Usuários ativos" />
      </div>
      <section className="adm-card">
        <div className="adm-card-head"><h3>Acessos por mês</h3></div>
        <div className="bar-chart">
          {bars.map((b) => (
            <div key={b.l} className="bar-col">
              <div className="bar-track"><div className="bar-fill" style={{ height: (b.v / max * 100) + "%" }} /></div>
              <span className="bar-lbl">{b.l}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ====================== MINHAS ATIVIDADES ====================== */
function ModAtividades() {
  const acts = [
    { t: "Atualizou dados cadastrais", w: "há 20 min", s: "ok" },
    { t: "Enviou documento — Proposta 0934", w: "há 2 h", s: "ok" },
    { t: "Solicitou acesso ao módulo de relatórios", w: "ontem", s: "wip" },
    { t: "Concluiu treinamento de segurança", w: "há 3 dias", s: "ok" },
    { t: "Aguardando aprovação de compra", w: "há 4 dias", s: "wip" },
  ];
  return (
    <div>
      <PageHead title="Minhas atividades" sub="Histórico das ações relacionadas à sua função." />
      <section className="adm-card">
        <ul className="feed">
          {acts.map((a, i) => (
            <li key={i} className="feed-item">
              <span className={"feed-dot " + (a.s === "ok" ? "ok" : "wip")} />
              <div><div className="feed-main">{a.t}</div><div className="feed-sub">{a.w}</div></div>
              <span className={"st-pill st-" + a.s}>{a.s === "ok" ? "Concluída" : "Em andamento"}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/* ====================== LOGS DE ACESSO ====================== */
function ModLogs({ ctx }) {
  const { role, org } = ctx;
  const logs = role === "super" ? M.ACCESS_LOGS : M.ACCESS_LOGS.filter((l) => l.orgId === org.id);
  return (
    <div>
      <PageHead title="Logs de Acesso" sub="Registro de acessos e ações — com IP e dispositivo." />
      <div className="table-wrap">
        <table className="req-table">
          <thead><tr><th>Usuário</th>{role === "super" && <th>Organização</th>}<th>Ação</th><th>IP</th><th>Dispositivo</th><th>Quando</th></tr></thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td className="cell-strong">{l.usuario}</td>
                {role === "super" && <td className="cell-muted">{orgById(l.orgId)?.fantasia}</td>}
                <td>{l.warn ? <span className="log-warn"><Icon name="lock" size={13} /> {l.acao}</span> : l.acao}</td>
                <td className="cell-muted mono">{l.ip}</td>
                <td className="cell-muted">{l.agent}</td>
                <td className="cell-sub">{l.quando}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ====================== AUDITORIA ====================== */
function ModAuditoria() {
  return (
    <div>
      <PageHead title="Auditoria" sub="Trilha de alterações sensíveis na plataforma (somente Super Administrador)." />
      <div className="table-wrap">
        <table className="req-table">
          <thead><tr><th>Ator</th><th>Ação</th><th>Recurso</th><th>De</th><th>Para</th><th>Quando</th></tr></thead>
          <tbody>
            {M.AUDIT.map((a) => (
              <tr key={a.id}>
                <td className="cell-strong">{a.ator}</td>
                <td><span className="type-tag">{a.acao}</span></td>
                <td>{a.recurso}</td>
                <td className="cell-muted">{a.de}</td>
                <td className="cell-strong">{a.para}</td>
                <td className="cell-sub">{a.quando}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ====================== CONFIGURAÇÕES ====================== */
function ModConfiguracoes({ ctx }) {
  const { role, org, isForn, setFornecedor } = ctx;
  const [toggles, setToggles] = useStateM({ mfa: true, iplock: false, notif: true, global: role === "super" });
  const t = (k) => setToggles((s) => ({ ...s, [k]: !s[k] }));
  const Toggle = ({ k, label, hint }) => (
    <div className="cfg-row">
      <div><div className="cfg-label">{label}</div><div className="cfg-hint">{hint}</div></div>
      <button className={"switch" + (toggles[k] ? " on" : "")} onClick={() => t(k)} aria-pressed={toggles[k]}><span /></button>
    </div>
  );
  const empresaLock = org.tipo === "empresa";
  return (
    <div>
      <PageHead title="Configurações" sub={role === "super" ? "Configurações globais da plataforma." : "Configurações de " + org.fantasia + "."} />
      <div className="adm-cols">
        <section className="adm-card">
          <div className="adm-card-head"><h3>Atuação no marketplace</h3></div>
          <div className="cfg-row">
            <div>
              <div className="cfg-label">Comprar serviços</div>
              <div className="cfg-hint">Buscar fornecedores e enviar cotações — sempre ativo para toda organização.</div>
            </div>
            <button className="switch on" disabled aria-pressed="true"><span /></button>
          </div>
          <div className="cfg-row">
            <div>
              <div className="cfg-label">Atua como fornecedor</div>
              <div className="cfg-hint">{empresaLock ? "Empresas são fornecedoras por natureza — sempre ativo." : "Ative para receber solicitações, publicar catálogo e aparecer na busca."}</div>
            </div>
            <button className={"switch" + (isForn ? " on" : "")} disabled={empresaLock}
              onClick={() => setFornecedor(org.id, !isForn)} aria-pressed={isForn}><span /></button>
          </div>
        </section>
        <section className="adm-card">
          <div className="adm-card-head"><h3>Segurança</h3></div>
          <Toggle k="mfa" label="Autenticação em dois fatores (MFA)" hint="Exigir verificação adicional no login." />
          <Toggle k="iplock" label="Restrição por IP" hint="Permitir acesso apenas de IPs autorizados." />
          <Toggle k="notif" label="Alertas de acesso suspeito" hint="Notificar tentativas de login incomuns." />
          {role === "super" && <Toggle k="global" label="Modo de manutenção global" hint="Suspende o acesso de todas as organizações." />}
        </section>
        <section className="adm-card span-2">
          <div className="adm-card-head"><h3>{role === "super" ? "Plataforma" : "Organização"}</h3></div>
          <div className="prof-grid-2">
            <div className="prof-row"><span className="prof-label">Nome</span><span className="prof-value">{org.fantasia}</span></div>
            <div className="prof-row"><span className="prof-label">Tipo</span><span className="prof-value">{orgTypeLabel(org.tipo)}</span></div>
            <div className="prof-row"><span className="prof-label">CNPJ</span><span className="prof-value">{org.cnpj}</span></div>
            <div className="prof-row"><span className="prof-label">E-mail</span><span className="prof-value">{org.email}</span></div>
          </div>
          <button className="btn-ghost sm" style={{ marginTop: 14 }}><Icon name="edit" size={14} /> Editar dados</button>
        </section>
      </div>
    </div>
  );
}

/* ====================== MEU PERFIL ====================== */
function ModPerfil({ ctx }) {
  const { org, user, areas } = ctx;

  const [edit, setEdit] = useStateM(false);
  const [form, setForm] = useStateM({
    nome: user.nome,
    email: user.email,
    telefone: "(11) 9 8765-4321",
    cargo: "Administradora de Plataforma",
  });
  const [formSnap, setFormSnap] = useStateM(null);
  const [pw, setPw] = useStateM({ atual: "", nova: "", conf: "" });
  const [showPw, setShowPw] = useStateM({ atual: false, nova: false, conf: false });
  const [mfa, setMfa] = useStateM(true);
  const [saved, setSaved] = useStateM(false);
  const [pwSaved, setPwSaved] = useStateM(false);

  const userLogs = [
    { id: 1, acao: "Login bem-sucedido",                     ip: "187.45.12.9",  agent: "Chrome · macOS", quando: "Hoje, 09:42" },
    { id: 2, acao: "Criou usuário: João Vieira (Usuário)",   ip: "187.45.12.9",  agent: "Chrome · macOS", quando: "Hoje, 09:50" },
    { id: 3, acao: "Alterou dados pessoais",                 ip: "187.45.12.9",  agent: "Chrome · macOS", quando: "Ontem, 16:15" },
    { id: 4, acao: "Encerrou sessão em outro dispositivo",   ip: "177.91.20.4",  agent: "Safari · iPhone", quando: "Ontem, 10:08" },
    { id: 5, acao: "Login bem-sucedido",                     ip: "187.45.12.9",  agent: "Chrome · macOS", quando: "20/06/2026, 08:30" },
  ];

  const initials = user.nome.split(" ").map((p) => p[0]).slice(0, 2).join("");

  const handleEdit = () => { setFormSnap({ ...form }); setEdit(true); };
  const handleCancel = () => { if (formSnap) setForm({ ...formSnap }); setEdit(false); };
  const handleSave = () => { setSaved(true); setEdit(false); setTimeout(() => setSaved(false), 3500); };
  const handlePwSave = () => {
    if (!pw.nova || pw.nova !== pw.conf) return;
    setPwSaved(true);
    setPw({ atual: "", nova: "", conf: "" });
    setTimeout(() => setPwSaved(false), 3500);
  };

  const PwField = ({ k, label }) => (
    <div className="pfx-field">
      <label className="pfx-label">{label}</label>
      <div className="pfx-pw-wrap">
        <input
          type={showPw[k] ? "text" : "password"}
          value={pw[k]}
          onChange={(e) => setPw((s) => ({ ...s, [k]: e.target.value }))}
          placeholder="••••••••"
        />
        <button className="pfx-pw-eye" type="button" onClick={() => setShowPw((s) => ({ ...s, [k]: !s[k] }))}>
          {showPw[k] ? "Ocultar" : "Mostrar"}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <PageHead title="Meu perfil" sub="Seus dados, acessos e permissões na plataforma.">
        {!edit ? (
          <button className="btn-primary sm" onClick={handleEdit}>
            <Icon name="edit" size={14} /> Editar perfil
          </button>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-ghost sm" onClick={handleCancel}>Cancelar</button>
            <button className="btn-primary sm" onClick={handleSave}>
              <Icon name="check" size={14} stroke={2.5} /> Salvar alterações
            </button>
          </div>
        )}
      </PageHead>

      {saved && (
        <div className="pfx-saved">
          <Icon name="check" size={15} stroke={2.5} /> Alterações salvas com sucesso.
        </div>
      )}

      {/* ── Hero ── */}
      <section className="adm-card prof-hero">
        <span className="avatar lg prof-hero-av">{initials}</span>
        <div className="prof-hero-body">
          <div className="prof-hero-top">
            <div>
              <div className="prof-hero-name">{form.nome}</div>
              <div className="prof-hero-email">{form.email}</div>
            </div>
            <div className="prof-hero-badges">
              <RoleBadge role="super" />
              {areas.map((a) => (
                <span key={a} className={"area-chip on" + (a === "fornecer" ? " forn" : "")}>
                  <Icon name={a === "fornecer" ? "building" : "home"} size={12} />
                  {areaLabel(a)}
                </span>
              ))}
            </div>
          </div>
          <div className="prof-hero-meta">
            <span className="prof-meta-item">
              <Icon name="clock" size={13} /> Último acesso: Hoje, 09:42
            </span>
            <span className="prof-meta-sep">·</span>
            <span className="st-pill st-ok">ativo</span>
            <span className="prof-meta-sep">·</span>
            <span className="prof-meta-item pfx-verified">
              <Icon name="check" size={13} stroke={2.8} /> E-mail verificado
            </span>
          </div>
        </div>
      </section>

      {/* ── Dados pessoais + Segurança ── */}
      <div className="adm-cols pfx-top-cols">

        {/* Dados pessoais */}
        <section className="adm-card">
          <div className="adm-card-head"><h3>Dados pessoais</h3></div>
          {edit ? (
            <div className="pfx-form">
              {[
                { k: "nome",     label: "Nome completo",  type: "text" },
                { k: "email",    label: "E-mail",          type: "email" },
                { k: "telefone", label: "Telefone",        type: "tel" },
                { k: "cargo",    label: "Cargo / Função",  type: "text" },
              ].map(({ k, label, type }) => (
                <div key={k} className="pfx-field">
                  <label className="pfx-label">{label}</label>
                  <input
                    type={type}
                    value={form[k]}
                    onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="prof-grid-2">
              {[
                { label: "Nome completo", val: form.nome },
                { label: "E-mail",        val: form.email },
                { label: "Telefone",      val: form.telefone },
                { label: "Cargo / Função",val: form.cargo },
              ].map(({ label, val }) => (
                <div key={label} className="prof-row">
                  <span className="prof-label">{label}</span>
                  <span className="prof-value">{val}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Segurança */}
        <section className="adm-card">
          <div className="adm-card-head"><h3>Segurança</h3></div>

          <div className="pfx-sec-group">
            <div className="pfx-sec-title">Trocar senha</div>
            <div className="pfx-form">
              <PwField k="atual" label="Senha atual" />
              <PwField k="nova"  label="Nova senha" />
              <PwField k="conf"  label="Confirmar nova senha" />
            </div>
            {pwSaved && (
              <div className="pfx-saved sm">
                <Icon name="check" size={14} stroke={2.5} /> Senha alterada com sucesso.
              </div>
            )}
            <button className="btn-primary sm" style={{ marginTop: 14 }} onClick={handlePwSave}>
              <Icon name="lock" size={14} /> Alterar senha
            </button>
          </div>

          <div className="cfg-row">
            <div>
              <div className="cfg-label">Autenticação em dois fatores</div>
              <div className="cfg-hint">Exige código de verificação adicional no login.</div>
            </div>
            <button className={"switch" + (mfa ? " on" : "")} onClick={() => setMfa((v) => !v)} aria-pressed={mfa}>
              <span />
            </button>
          </div>

          <div style={{ marginTop: 16 }}>
            <button className="btn-ghost sm"><Icon name="logout" size={14} /> Encerrar outras sessões</button>
            <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 6, lineHeight: 1.4 }}>
              Desconecta todos os outros dispositivos onde sua conta está ativa.
            </p>
          </div>
        </section>
      </div>

      {/* ── Organizações e perfis ── */}
      <section className="adm-card pfx-wide-card">
        <div className="adm-card-head"><h3>Minhas organizações e perfis</h3></div>
        <p className="muted" style={{ fontSize: 13, marginBottom: 18, lineHeight: 1.5 }}>
          O perfil de acesso é atribuído por vínculo — você pode ter papéis diferentes em cada organização da qual faz parte.
        </p>
        <div className="pfx-org-list">
          {user.vinculos.map((v) => {
            const o = orgById(v.orgId);
            const active = v.orgId === org.id;
            return (
              <div key={v.orgId} className={"pfx-org-row" + (active ? " active" : "")}>
                <Logo name={o.fantasia} size={38} radius="9px" />
                <div className="pfx-org-info">
                  <span className="pfx-org-name">{o.fantasia}</span>
                  <span className="pfx-org-type">{orgTypeLabel(o.tipo)}</span>
                </div>
                <RoleBadge role={v.perfil} />
                {active && <span className="pfx-org-active">Em uso</span>}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Permissões do perfil ── */}
      <section className="adm-card pfx-wide-card">
        <div className="adm-card-head"><h3>Permissões do perfil Super Administrador</h3></div>
        <p className="muted" style={{ fontSize: 13, marginBottom: 20, lineHeight: 1.6, maxWidth: "70ch" }}>
          {M.ROLES.find((r) => r.id === "super").desc}{" "}
          As permissões são derivadas pelo back-end com base no perfil do vínculo ativo — somente leitura nesta tela.
        </p>
        <div className="pfx-cap-grid">
          {M.CAPABILITIES.map((c) => (
            <div key={c.id} className={"pfx-cap-item" + (c.roles.super ? " on" : "")}>
              <span className="pfx-cap-ico">
                {c.roles.super
                  ? <Icon name="check" size={14} stroke={3} />
                  : <Icon name="close" size={12} stroke={2.4} />}
              </span>
              <span className="pfx-cap-label">{c.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Atividade recente ── */}
      <section className="adm-card pfx-wide-card">
        <div className="adm-card-head"><h3>Atividade recente da minha conta</h3></div>
        <div className="table-wrap">
          <table className="req-table">
            <thead>
              <tr><th>Ação</th><th>IP</th><th>Dispositivo</th><th>Quando</th></tr>
            </thead>
            <tbody>
              {userLogs.map((l) => (
                <tr key={l.id}>
                  <td className="cell-strong">{l.acao}</td>
                  <td className="cell-muted mono">{l.ip}</td>
                  <td className="cell-muted">{l.agent}</td>
                  <td className="cell-sub">{l.quando}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

const MOD_COMPONENTS = {
  dashboard: ModDashboard, organizacoes: ModOrganizacoes, usuarios: ModUsuarios,
  perfis: ModPerfis, aprovacoes: ModAprovacoes, relatorios: ModRelatorios,
  atividades: ModAtividades, logs: ModLogs, auditoria: ModAuditoria,
  configuracoes: ModConfiguracoes, perfil: ModPerfil,
};

Object.assign(window, { MOD_COMPONENTS, RoleBadge, PageHead, KpiCard });
