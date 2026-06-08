// 360 Hospitalar — Painel de Gestão: telas de autenticação
const { useState: useStateA } = React;

function OrbitGlyphA({ size = 44, ring = "#fff", plus = "oklch(0.68 0.15 165)", node = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <ellipse cx="50" cy="50" rx="40" ry="18" fill="none" stroke={ring} strokeWidth="5" transform="rotate(-30 50 50)" />
      <rect x="44.5" y="33" width="11" height="34" rx="5.5" fill={plus} />
      <rect x="33" y="44.5" width="34" height="11" rx="5.5" fill={plus} />
      <circle cx="86" cy="34" r="5" fill={node} />
    </svg>
  );
}

function BrandWord({ dark }) {
  return (
    <span className="adm-brand-word" style={{ color: dark ? "#fff" : "var(--ink, oklch(0.22 0.05 270))" }}>
      360 <span style={{ color: dark ? "oklch(0.78 0.12 248)" : "var(--primary)" }}>Hospitalar</span>
    </span>
  );
}

/* ====================== LOGIN UNIFICADO ====================== */
function AdminLogin({ go, onAuth }) {
  const [email, setEmail] = useStateA("");
  const [pass, setPass] = useStateA("");
  const [show, setShow] = useStateA(false);
  const [remember, setRemember] = useStateA(true);
  const [error, setError] = useStateA("");
  const [loading, setLoading] = useStateA(false);
  const valid = /\S+@\S+\.\S+/.test(email) && pass.length >= 4;

  const submit = (e) => {
    e.preventDefault();
    if (!valid) { setError("Informe um e-mail válido e a senha (mín. 4 caracteres)."); return; }
    setError(""); setLoading(true);
    setTimeout(() => { setLoading(false); onAuth(); }, 850);
  };

  return (
    <div className="login-screen adm-auth" data-screen-label="Login unificado">
      <aside className="login-brand">
        <div className="login-brand-inner">
          <OrbitGlyphA size={54} />
          <h2>Painel de Gestão<br />360 Hospitalar</h2>
          <p>Acesso unificado para todas as organizações — empresas, clínicas, hospitais e órgãos públicos. O sistema identifica automaticamente sua organização e perfil.</p>
          <ul className="login-perks">
            <li><Icon name="building" size={15} /> Multi-organização (multi-tenant)</li>
            <li><Icon name="key" size={15} /> Perfis e permissões (RBAC)</li>
            <li><Icon name="lock" size={15} /> Acesso seguro e auditado</li>
          </ul>
        </div>
        <div className="login-brand-foot">Plataforma corporativa · ambiente seguro</div>
      </aside>

      <main className="login-main">
        <div className="login-card">
          <div className="login-head">
            <h1>Entrar</h1>
            <p>Use seu e-mail corporativo. Não é preciso informar a organização.</p>
          </div>
          <form className="login-form" onSubmit={submit}>
            <label className="reg-field">
              <span className="reg-label">E-mail</span>
              <div className="login-input">
                <Icon name="mail" size={17} />
                <input type="email" value={email} autoComplete="username"
                  onChange={(e) => { setEmail(e.target.value); setError(""); }} placeholder="voce@organizacao.com.br" />
              </div>
            </label>
            <label className="reg-field">
              <span className="reg-label">Senha</span>
              <div className="login-input">
                <Icon name="lock" size={17} />
                <input type={show ? "text" : "password"} value={pass} autoComplete="current-password"
                  onChange={(e) => { setPass(e.target.value); setError(""); }} placeholder="••••••••" />
                <button type="button" className="login-eye" onClick={() => setShow((s) => !s)}>{show ? "Ocultar" : "Mostrar"}</button>
              </div>
            </label>
            {error && <div className="login-error"><Icon name="close" size={14} stroke={2.4} /> {error}</div>}
            <div className="login-row">
              <label className="login-remember">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                <span className="fr-box"><Icon name="check" size={12} stroke={3} /></span>
                Lembrar acesso
              </label>
              <a className="login-link" onClick={(e) => { e.preventDefault(); go("recover"); }}>Esqueci minha senha</a>
            </div>
            <button type="submit" className="btn-primary login-submit" disabled={loading}>
              {loading ? "Entrando…" : <>Entrar <Icon name="arrow" size={16} /></>}
            </button>
          </form>
          <div className="login-divider"><span>ou</span></div>
          <div className="login-foot">
            Sua organização ainda não tem conta?
            <a className="login-link" onClick={() => go("register")}> Cadastrar organização</a>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ====================== RECUPERAÇÃO DE SENHA ====================== */
function RecoverPass({ go }) {
  const [email, setEmail] = useStateA("");
  const [sent, setSent] = useStateA(false);
  const valid = /\S+@\S+\.\S+/.test(email);

  return (
    <div className="login-screen adm-auth" data-screen-label="Recuperar senha">
      <aside className="login-brand">
        <div className="login-brand-inner">
          <OrbitGlyphA size={54} />
          <h2>Recuperação<br />de senha</h2>
          <p>Enviaremos um link seguro de redefinição para o seu e-mail. O link expira em 30 minutos.</p>
        </div>
        <div className="login-brand-foot">Plataforma corporativa · ambiente seguro</div>
      </aside>
      <main className="login-main">
        <div className="login-card">
          {sent ? (
            <div className="recover-sent">
              <div className="success-mark"><Icon name="mail" size={30} /></div>
              <h1>Verifique seu e-mail</h1>
              <p>Se houver uma conta para <strong>{email}</strong>, enviamos um link de redefinição. Confira também a caixa de spam.</p>
              <button className="btn-primary block" onClick={() => go("login")}>Voltar ao login</button>
            </div>
          ) : (
            <>
              <button className="back-link" onClick={() => go("login")}><Icon name="back" size={16} /> Voltar ao login</button>
              <div className="login-head">
                <h1>Esqueci minha senha</h1>
                <p>Informe o e-mail cadastrado para receber o link de redefinição.</p>
              </div>
              <form className="login-form" onSubmit={(e) => { e.preventDefault(); if (valid) setSent(true); }}>
                <label className="reg-field">
                  <span className="reg-label">E-mail</span>
                  <div className="login-input">
                    <Icon name="mail" size={17} />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@organizacao.com.br" />
                  </div>
                </label>
                <button type="submit" className="btn-primary login-submit" disabled={!valid}>Enviar link de redefinição</button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

Object.assign(window, { AdminLogin, RecoverPass, OrbitGlyphA, BrandWord });
