// 360 Hospitalar — Painel de Gestão: Cadastro de Organização
const { useState: useStateOR } = React;
const OR_DATA = window.ADMIN_DATA;

function maskCNPJ_(v) {
  const d = v.replace(/\D/g, "").slice(0, 14);
  return d.replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2");
}
function maskCPF_(v) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d.replace(/^(\d{3})(\d)/, "$1.$2").replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1-$2");
}
function maskPhone_(v) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  return d.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}

function FieldA({ label, children, hint, required }) {
  return (
    <label className="reg-field">
      <span className="reg-label">{label}{required && <i className="req">*</i>}</span>
      {children}
      {hint && <span className="reg-hint">{hint}</span>}
    </label>
  );
}

function OrgRegister({ go, onAuth }) {
  const { ORG_TYPES } = OR_DATA;
  const [done, setDone] = useStateOR(false);
  const [f, setF] = useStateOR({
    razao: "", fantasia: "", cnpj: "", tipo: "", email: "", telefone: "", endereco: "",
    responsavel: "", cpf: "", senha: "",
  });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const digits = (s) => (s || "").replace(/\D/g, "");
  const valid =
    f.razao.trim() && f.fantasia.trim() && digits(f.cnpj).length === 14 && f.tipo &&
    /\S+@\S+\.\S+/.test(f.email) && digits(f.telefone).length >= 10 && f.endereco.trim() &&
    f.responsavel.trim() && digits(f.cpf).length === 11 && f.senha.length >= 6;

  if (done) {
    return (
      <div className="screen register adm-register" data-screen-label="Cadastro de organização — sucesso">
        <div className="reg-success">
          <div className="success-mark"><Icon name="check" size={34} stroke={2.6} /></div>
          <h1>Organização cadastrada!</h1>
          <p>A organização <strong>{f.fantasia}</strong> foi criada e está <strong>pendente de verificação</strong>. Enviamos um e-mail de confirmação para <strong>{f.email}</strong>. O responsável <strong>{f.responsavel}</strong> já pode acessar como Administrador.</p>
          <div className="success-actions">
            <button className="btn-primary" onClick={onAuth}>Acessar o painel</button>
            <button className="btn-ghost" onClick={() => go("login")}>Ir para o login</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen register adm-register" data-screen-label="Cadastro de organização">
      <button className="back-link" onClick={() => go("login")}><Icon name="back" size={16} /> Voltar ao login</button>
      <header className="reg-hero">
        <div className="hero-eyebrow">Cadastro de organização</div>
        <h1>Cadastre sua organização</h1>
        <p>Empresa, clínica, hospital público ou privado, ou órgão público — todos usam o mesmo sistema, com acesso unificado e perfis de permissão.</p>
      </header>

      <div className="reg-card adm-reg-card">
        <h3 className="reg-section-title"><Icon name="building" size={16} /> Dados da organização</h3>
        <div className="reg-grid">
          <div className="reg-row2">
            <FieldA label="Razão Social" required>
              <input value={f.razao} onChange={(e) => set("razao", e.target.value)} placeholder="Razão social completa" />
            </FieldA>
            <FieldA label="Nome Fantasia" required>
              <input value={f.fantasia} onChange={(e) => set("fantasia", e.target.value)} placeholder="Nome de exibição" />
            </FieldA>
          </div>
          <div className="reg-row2">
            <FieldA label="CNPJ" required hint="14 dígitos — validado no cadastro.">
              <input value={f.cnpj} onChange={(e) => set("cnpj", maskCNPJ_(e.target.value))} placeholder="00.000.000/0000-00" inputMode="numeric" />
            </FieldA>
            <FieldA label="Tipo da Organização" required>
              <div className="reg-select">
                <Icon name="building" size={16} />
                <select value={f.tipo} onChange={(e) => set("tipo", e.target.value)}>
                  <option value="">Selecione o tipo</option>
                  {ORG_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
            </FieldA>
          </div>
          <div className="reg-row2">
            <FieldA label="E-mail Principal" required>
              <input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="contato@organizacao.com.br" />
            </FieldA>
            <FieldA label="Telefone" required>
              <input value={f.telefone} onChange={(e) => set("telefone", maskPhone_(e.target.value))} placeholder="(00) 0000-0000" inputMode="numeric" />
            </FieldA>
          </div>
          <FieldA label="Endereço Completo" required>
            <input value={f.endereco} onChange={(e) => set("endereco", e.target.value)} placeholder="Rua, número, bairro, cidade/UF" />
          </FieldA>
        </div>

        <h3 className="reg-section-title mt"><Icon name="users" size={16} /> Responsável legal</h3>
        <div className="reg-grid">
          <div className="reg-row2">
            <FieldA label="Responsável Legal" required>
              <input value={f.responsavel} onChange={(e) => set("responsavel", e.target.value)} placeholder="Nome completo" />
            </FieldA>
            <FieldA label="CPF do Responsável" required hint="11 dígitos — validado no cadastro.">
              <input value={f.cpf} onChange={(e) => set("cpf", maskCPF_(e.target.value))} placeholder="000.000.000-00" inputMode="numeric" />
            </FieldA>
          </div>
          <FieldA label="Senha de Acesso" required hint="Mínimo 6 caracteres. O responsável entra como Administrador da organização.">
            <input type="password" value={f.senha} onChange={(e) => set("senha", e.target.value)} placeholder="••••••••" />
          </FieldA>
        </div>

        <div className="reg-nav">
          <span />
          <button className="btn-primary" disabled={!valid} onClick={() => { setDone(true); window.scrollTo({ top: 0 }); }}>
            Criar organização <Icon name="check" size={15} stroke={2.4} />
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { OrgRegister });
