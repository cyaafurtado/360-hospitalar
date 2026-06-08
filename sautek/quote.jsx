// 360 Hospitalar — Solicitar orçamento ao fornecedor
const { useState: useStateQ } = React;
const Q_DATA = window.SAUTEK_DATA;

const Q_TYPES = [
  { id: "cotacao", label: "Cotação de preço", icon: "file" },
  { id: "contato", label: "Falar com consultor", icon: "phone" },
  { id: "parceria", label: "Proposta de parceria", icon: "users" },
];
const Q_PRAZOS = ["Imediato", "Até 15 dias", "Até 30 dias", "Sem urgência"];

function maskPhoneQ(v) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  return d.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}

function QField({ label, children, hint, required }) {
  return (
    <label className="reg-field">
      <span className="reg-label">{label}{required && <i className="req">*</i>}</span>
      {children}
      {hint && <span className="reg-hint">{hint}</span>}
    </label>
  );
}

function QuoteRequest({ c, go }) {
  const initialType = "cotacao";
  const [tipo, setTipo] = useStateQ(initialType);
  const [prazo, setPrazo] = useStateQ("Até 30 dias");
  const [done, setDone] = useStateQ(false);
  const [proto, setProto] = useStateQ("");
  const [f, setF] = useStateQ({
    nome: "", organizacao: "", cargo: "", email: "", telefone: "",
    uf: c.uf, cidade: "", servico: c.services[0] || "", detalhes: "",
  });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const valid =
    f.nome.trim() && f.organizacao.trim() && /\S+@\S+\.\S+/.test(f.email) &&
    f.telefone.replace(/\D/g, "").length >= 10 && f.detalhes.trim().length >= 8;

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    setProto("SOL-" + Math.floor(2050 + Math.random() * 900));
    setDone(true);
    window.scrollTo({ top: 0 });
  };

  if (done) {
    return (
      <div className="screen register" data-screen-label="Orçamento enviado">
        <div className="reg-success">
          <div className="success-mark"><Icon name="check" size={34} stroke={2.6} /></div>
          <h1>Solicitação enviada!</h1>
          <p>Seu pedido de <strong>{typeLabel(tipo)}</strong> foi encaminhado para <strong>{c.name}</strong> sob o protocolo <strong>{proto}</strong>. O fornecedor responde diretamente em <strong>{f.email}</strong> — normalmente em até 2 dias úteis.</p>
          <div className="quote-recap">
            <div className="qr-row"><span>Fornecedor</span><strong>{c.name}</strong></div>
            <div className="qr-row"><span>Tipo</span><strong>{typeLabel(tipo)}</strong></div>
            <div className="qr-row"><span>Serviço</span><strong>{f.servico}</strong></div>
            <div className="qr-row"><span>Prazo desejado</span><strong>{prazo}</strong></div>
          </div>
          <div className="success-actions">
            <button className="btn-primary" onClick={() => go("detail", c)}>Voltar ao fornecedor</button>
            <button className="btn-ghost" onClick={() => go("results")}>Ver outros fornecedores</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen register" data-screen-label="Solicitar orçamento">
      <button className="back-link" onClick={() => go("detail", c)}><Icon name="back" size={16} /> Voltar ao fornecedor</button>

      <header className="reg-hero">
        <div className="hero-eyebrow">Solicitar orçamento</div>
        <h1>Peça um orçamento a <em>{c.name}</em></h1>
        <p>Conte o que sua organização precisa. O fornecedor recebe a solicitação e responde diretamente para você, sem intermediários.</p>
      </header>

      <div className="reg-body quote-body">
        <form className="reg-form-col" onSubmit={submit}>
          <div className="reg-card">
            <h3 className="reg-section-title"><Icon name="file" size={16} /> Tipo de solicitação</h3>
            <div className="qtype-grid">
              {Q_TYPES.map((t) => (
                <button type="button" key={t.id} className={"qtype" + (tipo === t.id ? " on" : "")} onClick={() => setTipo(t.id)}>
                  <Icon name={t.icon} size={18} />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            <h3 className="reg-section-title mt"><Icon name="users" size={16} /> Seus dados</h3>
            <div className="reg-grid">
              <div className="reg-row2">
                <QField label="Nome completo" required>
                  <input value={f.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Seu nome" />
                </QField>
                <QField label="Cargo">
                  <input value={f.cargo} onChange={(e) => set("cargo", e.target.value)} placeholder="Ex: Coordenador de Compras" />
                </QField>
              </div>
              <QField label="Organização" required>
                <input value={f.organizacao} onChange={(e) => set("organizacao", e.target.value)} placeholder="Hospital, clínica ou empresa" />
              </QField>
              <div className="reg-row2">
                <QField label="E-mail" required>
                  <input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="voce@organizacao.com.br" />
                </QField>
                <QField label="Telefone" required>
                  <input value={f.telefone} onChange={(e) => set("telefone", maskPhoneQ(e.target.value))} placeholder="(00) 00000-0000" inputMode="numeric" />
                </QField>
              </div>
              <div className="reg-row2">
                <QField label="Estado">
                  <div className="reg-select">
                    <Icon name="pin" size={16} />
                    <select value={f.uf} onChange={(e) => set("uf", e.target.value)}>
                      {Q_DATA.STATES.map((s) => <option key={s.uf} value={s.uf}>{s.name} ({s.uf})</option>)}
                    </select>
                  </div>
                </QField>
                <QField label="Cidade">
                  <input value={f.cidade} onChange={(e) => set("cidade", e.target.value)} placeholder="Sua cidade" />
                </QField>
              </div>
            </div>

            <h3 className="reg-section-title mt"><Icon name="list" size={16} /> Sobre o que você precisa</h3>
            <div className="reg-grid">
              <div className="reg-row2">
                <QField label="Serviço de interesse">
                  <div className="reg-select">
                    <Icon name="check" size={16} />
                    <select value={f.servico} onChange={(e) => set("servico", e.target.value)}>
                      {c.services.map((s) => <option key={s} value={s}>{s}</option>)}
                      <option value="Outro">Outro / não listado</option>
                    </select>
                  </div>
                </QField>
                <QField label="Prazo desejado">
                  <div className="qprazo">
                    {Q_PRAZOS.map((p) => (
                      <button type="button" key={p} className={"reg-pick" + (prazo === p ? " on" : "")} onClick={() => setPrazo(p)}>{p}</button>
                    ))}
                  </div>
                </QField>
              </div>
              <QField label="Detalhes da solicitação" required hint="Quantidades, contexto, requisitos técnicos — quanto mais claro, melhor o orçamento.">
                <textarea rows={5} value={f.detalhes} onChange={(e) => set("detalhes", e.target.value)} placeholder="Ex: Precisamos de apoio laboratorial 24h para uma nova unidade com volume estimado de 12 mil exames/mês…" />
              </QField>
            </div>

            <div className="reg-nav">
              <button type="button" className="btn-ghost" onClick={() => go("detail", c)}><Icon name="back" size={15} /> Cancelar</button>
              <button type="submit" className="btn-primary" disabled={!valid}>Enviar solicitação <Icon name="arrow" size={15} /></button>
            </div>
          </div>
        </form>

        <aside className="reg-aside">
          <div className="reg-aside-block">
            <span className="reg-aside-title">Fornecedor selecionado</span>
            <div className="quote-supplier">
              <Logo name={c.name} size={48} />
              <div>
                <div className="qs-name">{c.name}{c.verified && <VerifiedTag small />}</div>
                <div className="qs-seg">{segmentLabel(c.segment)}</div>
                <div className="qs-meta"><Icon name="pin" size={13} /> {c.city} · {c.uf}</div>
              </div>
            </div>
            <div className="quote-rate"><RatingLine rating={c.rating} reviews={c.reviews} /></div>
          </div>
          <div className="reg-aside-block benefits">
            <div className="bnf"><Icon name="shield2" size={20} /><div><strong>Sem custo e sem compromisso</strong><span>Solicitar orçamento é gratuito.</span></div></div>
            <div className="bnf"><Icon name="phone" size={20} /><div><strong>Resposta direta</strong><span>O fornecedor fala com você sem intermediários.</span></div></div>
            <div className="bnf"><Icon name="check" size={20} /><div><strong>Fornecedor verificado</strong><span>Documentos e certificações auditados.</span></div></div>
          </div>
        </aside>
      </div>
    </div>
  );
}

Object.assign(window, { QuoteRequest });
