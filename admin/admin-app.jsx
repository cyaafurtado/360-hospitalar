// 360 Hospitalar — Painel de Gestão: shell + roteamento
const { useState: useStateApp, useEffect: useEffectApp } = React;
const APP = window.ADMIN_DATA;

function Sidebar({ role, areas, active, onPick, collapsed }) {
  const allowed = APP.MODULES.filter((m) => m.roles.includes(role) && (!m.area || areas.includes(m.area)));
  const groups = ["Comprar", "Fornecer", "Operação", "Gestão", "Segurança"];
  return (
    <aside className={"adm-sidebar" + (collapsed ? " collapsed" : "")}>
      <div className="adm-logo">
        <OrbitGlyphA size={30} ring="var(--primary)" plus="var(--accent)" node="var(--primary)" />
        <BrandWord />
      </div>
      <nav className="adm-nav">
        {groups.map((g) => {
          const items = allowed.filter((m) => m.group === g);
          if (!items.length) return null;
          return (
            <div key={g} className={"adm-nav-group" + (g === "Comprar" ? " grp-comprar" : g === "Fornecer" ? " grp-fornecer" : "")}>
              <span className="adm-nav-title">{g}</span>
              {items.map((m) => (
                <button key={m.id} className={"adm-nav-item" + (active === m.id ? " on" : "")} onClick={() => onPick(m.id)}>
                  <Icon name={m.icon} size={18} /> <span>{m.label}</span>
                </button>
              ))}
            </div>
          );
        })}
      </nav>
      <div className="adm-side-foot">
        <div className="area-tags">
          {areas.map((a) => (
            <span key={a} className={"side-tag side-" + a}>
              <Icon name={a === "fornecer" ? "building" : "home"} size={12} />
              {areaLabel(a)}
            </span>
          ))}
        </div>
        <RoleBadge role={role} />
      </div>
    </aside>
  );
}

function OrgSwitcher({ user, activeOrgId, onSwitch }) {
  const [open, setOpen] = useStateApp(false);
  const active = orgById(activeOrgId);
  const activeVinc = user.vinculos.find((v) => v.orgId === activeOrgId);
  return (
    <div className="org-switch">
      <button className="org-switch-btn" onClick={() => setOpen((o) => !o)}>
        <Logo name={active.fantasia} size={32} radius="8px" />
        <div className="org-switch-info">
          <span className="org-switch-name">{active.fantasia}</span>
          <span className="org-switch-role">{roleLabel(activeVinc.perfil)}</span>
        </div>
        <Icon name="chevron" size={16} className="org-switch-caret" />
      </button>
      {open && (
        <>
          <div className="org-switch-scrim" onClick={() => setOpen(false)} />
          <div className="org-switch-menu">
            <div className="org-switch-menu-title">Trocar de organização</div>
            {user.vinculos.map((v) => {
              const o = orgById(v.orgId);
              return (
                <button key={v.orgId} className={"org-switch-opt" + (v.orgId === activeOrgId ? " on" : "")}
                  onClick={() => { onSwitch(v.orgId); setOpen(false); }}>
                  <Logo name={o.fantasia} size={30} radius="7px" />
                  <div className="org-switch-info">
                    <span className="org-switch-name">{o.fantasia}</span>
                    <span className="org-switch-role">{orgTypeLabel(o.tipo)} · {roleLabel(v.perfil)}</span>
                  </div>
                  {v.orgId === activeOrgId && <Icon name="check" size={15} stroke={2.6} className="org-switch-check" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function Topbar({ user, activeOrgId, onSwitch, onLogout, onMenu, onProfile }) {
  const [umenu, setUmenu] = useStateApp(false);
  return (
    <header className="adm-topbar">
      <button className="adm-burger" onClick={onMenu} aria-label="Menu"><Icon name="menu" size={20} /></button>
      <OrgSwitcher user={user} activeOrgId={activeOrgId} onSwitch={onSwitch} />
      <div className="adm-top-right">
        <button className="adm-icon-btn" aria-label="Notificações"><Icon name="bell" size={19} /><span className="adm-badge-dot" /></button>
        <div className="adm-user">
          <button className="adm-user-btn" onClick={() => setUmenu((o) => !o)}>
            <span className="avatar">{user.nome.split(" ").map((p) => p[0]).slice(0, 2).join("")}</span>
            <span className="adm-user-name">{user.nome}</span>
            <Icon name="chevron" size={15} />
          </button>
          {umenu && (
            <>
              <div className="org-switch-scrim" onClick={() => setUmenu(false)} />
              <div className="adm-user-menu">
                <div className="adm-user-head"><span className="avatar lg">{user.nome.split(" ").map((p) => p[0]).slice(0, 2).join("")}</span><div><div className="cell-strong">{user.nome}</div><div className="cell-sub">{user.email}</div></div></div>
                <button className="adm-user-item" onClick={() => { onProfile(); setUmenu(false); }}><Icon name="users" size={16} /> Meu perfil</button>
                <button className="adm-user-item"><Icon name="gear" size={16} /> Preferências</button>
                <button className="adm-user-item danger" onClick={onLogout}><Icon name="logout" size={16} /> Sair</button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function AdminApp() {
  const [view, setView] = useStateApp("login"); // login | register | recover | app
  const [activeOrgId, setActiveOrgId] = useStateApp(APP.SESSION_USER.vinculos[0].orgId);
  const [module, setModule] = useStateApp("dashboard");
  const [sideOpen, setSideOpen] = useStateApp(false);
  const [fornMap, setFornMap] = useStateApp({}); // override "Atua como fornecedor" por org

  const user = APP.SESSION_USER;
  const vinc = user.vinculos.find((v) => v.orgId === activeOrgId);
  const role = vinc ? vinc.perfil : "usuario";
  const org = orgById(activeOrgId);
  const isForn = org.tipo === "empresa" ? true : (fornMap[activeOrgId] !== undefined ? fornMap[activeOrgId] : !!org.fornecedor);
  const areas = isForn ? ["comprar", "fornecer"] : ["comprar"];
  const setFornecedor = (id, val) => setFornMap((m) => ({ ...m, [id]: val }));

  // ao trocar de org/perfil/área, garante que o módulo ativo é permitido
  useEffectApp(() => {
    const allowed = APP.MODULES.filter((m) => m.roles.includes(role) && (!m.area || areas.includes(m.area))).map((m) => m.id);
    if (!allowed.includes(module)) setModule("dashboard");
  }, [role, isForn]);

  const auth = () => { setView("app"); setModule("dashboard"); window.scrollTo({ top: 0 }); };
  const go = (v) => { setView(v); window.scrollTo({ top: 0 }); };

  if (view === "login") return <AdminLogin go={go} onAuth={auth} />;
  if (view === "register") return <OrgRegister go={go} onAuth={auth} />;
  if (view === "recover") return <RecoverPass go={go} />;

  const ModComp = MOD_COMPONENTS[module] || MOD_COMPONENTS.dashboard;
  return (
    <div className={"adm-shell" + (sideOpen ? " side-open" : "")}>
      <Sidebar role={role} areas={areas} active={module} onPick={(m) => { setModule(m); setSideOpen(false); }} />
      {sideOpen && <div className="adm-side-scrim" onClick={() => setSideOpen(false)} />}
      <div className="adm-main">
        <Topbar user={user} activeOrgId={activeOrgId} onSwitch={setActiveOrgId} onLogout={() => go("login")} onMenu={() => setSideOpen(true)} onProfile={() => setModule("perfil")} />
        <main className="adm-content" key={module + activeOrgId} data-screen-label={"Painel — " + module}>
          <ModComp ctx={{ role, org, user, areas, isForn, setFornecedor }} />
        </main>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<AdminApp />);
