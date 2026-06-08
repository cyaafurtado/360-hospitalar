// 360 Hospitalar — Portal do parceiro: solicitações de cotação e contato
const { useState: useStateP, useMemo: useMemoP } = React;
const PORTAL_DATA = window.SAUTEK_DATA;

function PortalNav({ active, go }) {
  return (
    <div className="portal-subnav">
      <div className="portal-subnav-inner">
        <div className="portal-tabs">
          <button className={"portal-tab" + (active === "portal" ? " on" : "")} onClick={() => go("portal")}>
            <Icon name="list" size={16} /> Solicitações
          </button>
          <button className={"portal-tab" + (active === "supplier" ? " on" : "")} onClick={() => go("supplier")}>
            <Icon name="shield2" size={16} /> Meu perfil
          </button>
        </div>
        <button className="portal-exit" onClick={() => go("home")}><Icon name="back" size={15} /> Sair do portal</button>
      </div>
    </div>
  );
}

const STATUS_TONE = { nova: "new", andamento: "wip", respondida: "ok", fechada: "done" };

function StatusPill({ status }) {
  return <span className={"st-pill st-" + (STATUS_TONE[status] || "new")}>{statusLabel(status)}</span>;
}
function TypePill({ tipo }) {
  return <span className={"ty-pill ty-" + tipo}>{typeLabel(tipo)}</span>;
}

const CHAT_LIMIT = 160;

function RequestPanel({ r, status, doc, chat, onSend, onAttach, onStatus }) {
  const [draft, setDraft] = React.useState("");
  const scrollRef = React.useRef(null);
  const left = CHAT_LIMIT - draft.length;

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chat.length]);

  const send = () => { if (draft.trim()) { onSend(draft); setDraft(""); } };
  const onKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  const mailHref = "mailto:" + r.email
    + "?subject=" + encodeURIComponent("360 Hospitalar — Resposta à solicitação " + r.id)
    + "&body=" + encodeURIComponent(
        "Prezado(a) " + r.solicitante + ",\n\n"
        + "Agradecemos o contato referente à solicitação " + r.id + " (" + typeLabel(r.tipo) + ").\n\n"
        + "Segue nossa proposta para análise. Permanecemos à disposição.\n\n"
        + "Atenciosamente,\nEquipe 360 Hospitalar");

  const locked = !doc; // só libera mudança de status após documento aprovado

  return (
    <div className="req-panel">
      {/* coluna esquerda — resumo + chat interno */}
      <div className="rp-left">
        <div className="rp-head">
          <span className="req-detail-id">{r.id}</span>
          <span className="rp-org">{r.organizacao} · {r.cidade}/{r.uf}</span>
        </div>
        <p className="rp-resumo">{r.resumo}</p>

        <div className="rp-chat">
          <div className="rp-chat-title"><Icon name="users" size={14} /> Chat interno <span className="rp-chat-hint">mensagens curtas</span></div>
          <div className="rp-chat-log" ref={scrollRef}>
            <div className="chat-msg them">
              <span className="chat-from">{r.solicitante}</span>
              <span className="chat-bubble">{r.resumo}</span>
              <span className="chat-when">{r.quando}</span>
            </div>
            {chat.map((m, i) => (
              <div key={i} className={"chat-msg " + (m.from === "me" ? "me" : "them")}>
                {m.from !== "me" && <span className="chat-from">{r.solicitante}</span>}
                <span className="chat-bubble">{m.text}</span>
                <span className="chat-when">{m.when}</span>
              </div>
            ))}
          </div>
          <div className="rp-chat-input">
            <input
              value={draft}
              maxLength={CHAT_LIMIT}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKey}
              placeholder="Escreva uma mensagem curta…" />
            <span className={"rp-count" + (left <= 20 ? " low" : "")}>{left}</span>
            <button className="rp-send" onClick={send} disabled={!draft.trim()} aria-label="Enviar"><Icon name="arrow" size={16} /></button>
          </div>
        </div>
      </div>

      {/* coluna direita — ações */}
      <div className="rp-right">
        <a className="btn-primary sm block" href={mailHref}><Icon name="globe" size={14} /> Formalizar e-mail</a>

        <div className="rp-doc">
          <div className="rp-doc-title">Documento aprovado</div>
          {doc ? (
            <div className="rp-doc-file">
              <span className="rp-doc-ico"><Icon name="check" size={14} stroke={2.6} /></span>
              <span className="rp-doc-name">{doc}</span>
              <button className="rp-doc-redo" onClick={onAttach} aria-label="Trocar documento"><Icon name="sliders" size={13} /></button>
            </div>
          ) : (
            <button className="rp-doc-attach" onClick={onAttach}>
              <Icon name="shield2" size={15} /> Anexar documento aprovado
            </button>
          )}
          <p className="rp-doc-hint">{doc ? "Documento anexado — alteração de status liberada." : "Anexe o documento aprovado para liberar a mudança de status."}</p>
        </div>

        <div className="rp-status">
          <span className="rp-status-label">Alterar status</span>
          <div className="rp-status-btns">
            <button className={"rp-st-btn" + (status === "andamento" ? " on" : "")}
              disabled={locked} title={locked ? "Anexe o documento aprovado primeiro" : ""}
              onClick={() => onStatus("andamento")}>Em andamento</button>
            <button className={"rp-st-btn ok" + (status === "fechada" ? " on" : "")}
              disabled={locked} title={locked ? "Anexe o documento aprovado primeiro" : ""}
              onClick={() => onStatus("fechada")}>Finalizar / Fechada</button>
          </div>
          {locked && <span className="rp-lock"><Icon name="shield2" size={12} /> Bloqueado até anexar o documento</span>}
        </div>
      </div>
    </div>
  );
}

function Portal({ go }) {
  const { REQUESTS, REQUEST_TYPES, REQUEST_STATUS } = PORTAL_DATA;
  const [tipo, setTipo] = useStateP("");
  const [status, setStatus] = useStateP("");
  const [q, setQ] = useStateP("");
  const [openId, setOpenId] = useStateP(null);

  // estado por solicitação (protótipo — persiste durante a sessão)
  const [statuses, setStatuses] = useStateP({});   // { [id]: status }
  const [docs, setDocs] = useStateP({});            // { [id]: "arquivo.pdf" }
  const [chats, setChats] = useStateP({});          // { [id]: [{from,text,when}] }

  const effStatus = (r) => statuses[r.id] || r.status;
  const setReqStatus = (id, s) => setStatuses((m) => ({ ...m, [id]: s }));
  const attachDoc = (id) => {
    const names = ["Proposta-comercial-assinada.pdf", "Contrato-aprovado.pdf", "Orcamento-aprovado.pdf"];
    setDocs((m) => ({ ...m, [id]: names[Math.floor(Math.random() * names.length)] }));
  };
  const sendChat = (id, text) => {
    const t = text.trim().slice(0, CHAT_LIMIT);
    if (!t) return;
    setChats((m) => ({ ...m, [id]: [...(m[id] || []), { from: "me", text: t, when: "agora" }] }));
  };

  const stats = useMemoP(() => ({
    total: REQUESTS.length,
    nova: REQUESTS.filter((r) => effStatus(r) === "nova").length,
    andamento: REQUESTS.filter((r) => effStatus(r) === "andamento").length,
    respondida: REQUESTS.filter((r) => effStatus(r) === "respondida").length,
  }), [statuses]);

  const rows = useMemoP(() => REQUESTS.filter((r) => {
    if (tipo && r.tipo !== tipo) return false;
    if (status && effStatus(r) !== status) return false;
    if (q.trim()) {
      const h = (r.solicitante + " " + r.organizacao + " " + r.prestador + " " + r.id).toLowerCase();
      if (!h.includes(q.toLowerCase())) return false;
    }
    return true;
  }), [tipo, status, q, statuses]);

  return (
    <div className="portal-screen" data-screen-label="Portal — Solicitações">
      <PortalNav active="portal" go={go} />
      <div className="portal-body">
        <header className="portal-head">
          <div>
            <h1>Solicitações recebidas</h1>
            <p className="muted">Acompanhe e gerencie pedidos de cotação e contato dos compradores.</p>
          </div>
        </header>

        <div className="stat-grid">
          <div className="stat-card">
            <span className="stat-ico tone-blue"><Icon name="list" size={20} /></span>
            <div><div className="stat-num">{stats.total}</div><div className="stat-lbl">Total de solicitações</div></div>
          </div>
          <div className="stat-card">
            <span className="stat-ico tone-amber"><Icon name="star" size={20} stroke={2} /></span>
            <div><div className="stat-num">{stats.nova}</div><div className="stat-lbl">Novas (aguardando)</div></div>
          </div>
          <div className="stat-card">
            <span className="stat-ico tone-violet"><Icon name="signal" size={20} /></span>
            <div><div className="stat-num">{stats.andamento}</div><div className="stat-lbl">Em andamento</div></div>
          </div>
          <div className="stat-card">
            <span className="stat-ico tone-green"><Icon name="check" size={20} stroke={2.4} /></span>
            <div><div className="stat-num">{stats.respondida}</div><div className="stat-lbl">Respondidas</div></div>
          </div>
        </div>

        <div className="portal-filters">
          <div className="pf-search">
            <Icon name="search" size={17} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por solicitante, organização ou nº…" />
          </div>
          <div className="pf-select">
            <span>Tipo</span>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="">Todos</option>
              {REQUEST_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <div className="pf-select">
            <span>Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Todos</option>
              {REQUEST_STATUS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          {(tipo || status || q) && <button className="pf-clear" onClick={() => { setTipo(""); setStatus(""); setQ(""); }}>Limpar</button>}
        </div>

        <div className="table-wrap">
          <table className="req-table">
            <thead>
              <tr>
                <th>Solicitante</th>
                <th>Organização</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Prestador</th>
                <th>Estado</th>
                <th>Contato</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <React.Fragment key={r.id}>
                  <tr className={openId === r.id ? "row-open" : ""} onClick={() => setOpenId(openId === r.id ? null : r.id)}>
                    <td>
                      <div className="cell-strong">{r.solicitante}</div>
                      <div className="cell-sub">{r.cargo} · {r.quando}</div>
                    </td>
                    <td>{r.organizacao}</td>
                    <td><TypePill tipo={r.tipo} /></td>
                    <td><StatusPill status={effStatus(r)} /></td>
                    <td className="cell-muted">{r.prestador}</td>
                    <td><span className="uf-tag">{r.uf}</span> <span className="cell-sub">{r.cidade}</span></td>
                    <td>
                      <div className="cell-contact"><Icon name="phone" size={13} /> {r.phone}</div>
                      <div className="cell-contact cell-sub">{r.email}</div>
                    </td>
                    <td><button className="row-toggle" aria-label="Detalhes"><Icon name={openId === r.id ? "close" : "arrow"} size={15} /></button></td>
                  </tr>
                  {openId === r.id && (
                    <tr className="detail-row">
                      <td colSpan={8}>
                        <RequestPanel
                          r={r}
                          status={effStatus(r)}
                          doc={docs[r.id]}
                          chat={chats[r.id] || []}
                          onSend={(t) => sendChat(r.id, t)}
                          onAttach={() => attachDoc(r.id)}
                          onStatus={(s) => setReqStatus(r.id, s)}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="empty"><Icon name="search" size={32} /><h3>Nenhuma solicitação encontrada</h3><p>Ajuste os filtros para ver mais resultados.</p></div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Portal, PortalNav });
