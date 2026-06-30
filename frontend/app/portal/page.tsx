'use client';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getRequests, updateRequestStatus } from '../../lib/services';
import { useAsync } from '../../lib/useAsync';
import { useAppStore } from '../../lib/store';
import { REQUEST_STATUS, REQUEST_TYPES, segmentLabel } from '../../data/reference';
import type { RequestStatus, RequestType, SolicitacaoRequest } from '../../data/types';
import { EXEMPLOS_ENVIADAS } from '../../data/exemplos-portal-enviadas';
import { Icon } from '../../lib/icons';
import { PortalNav } from '../../components/PortalNav';
import { StatusPill, TypePill } from '../../components/Pills';
import { Loading, LoadError } from '../../components/AsyncState';
import { gerarPdfSolicitacao } from '../../lib/pdf';

type Tab = 'recebidas' | 'enviadas';

export default function PortalPage() {
  const router = useRouter();
  const authEmail = useAppStore((s) => s.authEmail);
  useEffect(() => {
    if (!authEmail) router.replace('/entrar');
  }, [authEmail, router]);

  const [tab, setTab] = useState<Tab>('recebidas');

  // --- recebidas ---
  const { data, loading, error } = useAsync(() => getRequests(), []);
  const [rowsState, setRowsState] = useState<SolicitacaoRequest[] | null>(null);
  useEffect(() => { if (data) setRowsState(data); }, [data]);

  const [tipo, setTipo] = useState<'' | RequestType>('');
  const [status, setStatus] = useState<'' | RequestStatus>('');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);

  const baixarPdf = async (r: SolicitacaoRequest) => {
    setPdfLoading(r.id);
    try { await gerarPdfSolicitacao(r); } finally { setPdfLoading(null); }
  };

  const requests = rowsState ?? [];

  const statsRecebidas = useMemo(() => ({
    total: requests.length,
    nova: requests.filter((r) => r.status === 'nova').length,
    andamento: requests.filter((r) => r.status === 'andamento').length,
    respondida: requests.filter((r) => r.status === 'respondida').length,
  }), [requests]);

  const rowsRecebidas = useMemo(() =>
    requests.filter((r) => {
      if (tipo && r.tipo !== tipo) return false;
      if (status && r.status !== status) return false;
      if (q.trim()) {
        const h = (r.solicitante + ' ' + r.organizacao + ' ' + r.prestador + ' ' + r.id).toLowerCase();
        if (!h.includes(q.toLowerCase())) return false;
      }
      return true;
    }),
    [requests, tipo, status, q]
  );

  const marcarStatus = async (id: string, s: RequestStatus) => {
    try {
      const updated = await updateRequestStatus(id, s);
      setRowsState((prev) => (prev ? prev.map((r) => (r.id === id ? updated : r)) : prev));
    } catch (e) {
      console.error(e);
    }
  };

  // --- enviadas ---
  const [qEnv, setQEnv] = useState('');
  const [statusEnv, setStatusEnv] = useState<'' | RequestStatus>('');
  const [openEnvId, setOpenEnvId] = useState<string | null>(null);

  const statsEnviadas = useMemo(() => ({
    total: EXEMPLOS_ENVIADAS.length,
    aguardando: EXEMPLOS_ENVIADAS.filter((r) => r.status === 'nova' || r.status === 'andamento').length,
    respondida: EXEMPLOS_ENVIADAS.filter((r) => r.status === 'respondida').length,
    parceiros: new Set(EXEMPLOS_ENVIADAS.map((r) => r.destinatario)).size,
  }), []);

  const rowsEnviadas = useMemo(() =>
    EXEMPLOS_ENVIADAS.filter((r) => {
      if (statusEnv && r.status !== statusEnv) return false;
      if (qEnv.trim()) {
        const h = (r.destinatario + ' ' + r.servico + ' ' + r.id).toLowerCase();
        if (!h.includes(qEnv.toLowerCase())) return false;
      }
      return true;
    }),
    [qEnv, statusEnv]
  );

  return (
    <div className="portal-screen">
      <PortalNav />
      <div className="portal-body">
        <header className="portal-head">
          <div>
            <h1>{tab === 'recebidas' ? 'Solicitações recebidas' : 'Solicitações enviadas'}</h1>
            <p className="muted">
              {tab === 'recebidas'
                ? 'Acompanhe e gerencie pedidos de cotação e contato dos compradores.'
                : 'Pedidos de cotação e parceria enviados a outros fornecedores.'}
            </p>
          </div>
          {tab === 'enviadas' && (
            <button className="btn-primary" onClick={() => router.push('/buscar')}>
              <Icon name="search" size={16} /> Buscar parceiros
            </button>
          )}
        </header>

        {/* Tabs */}
        <div className="portal-body-tabs">
          <button
            className={'pbt-tab' + (tab === 'recebidas' ? ' on' : '')}
            onClick={() => { setTab('recebidas'); setOpenId(null); }}
          >
            <Icon name="arrow" size={15} style={{ transform: 'rotate(180deg)' }} />
            Recebidas
            {statsRecebidas.nova > 0 && (
              <span className="pbt-badge">{statsRecebidas.nova}</span>
            )}
          </button>
          <button
            className={'pbt-tab' + (tab === 'enviadas' ? ' on' : '')}
            onClick={() => { setTab('enviadas'); setOpenEnvId(null); }}
          >
            <Icon name="arrow" size={15} />
            Enviadas
          </button>
        </div>

        {/* ===== RECEBIDAS ===== */}
        {tab === 'recebidas' && (
          <>
            <div className="stat-grid">
              <div className="stat-card">
                <span className="stat-ico tone-blue"><Icon name="list" size={20} /></span>
                <div><div className="stat-num">{statsRecebidas.total}</div><div className="stat-lbl">Total de solicitações</div></div>
              </div>
              <div className="stat-card">
                <span className="stat-ico tone-amber"><Icon name="star" size={20} stroke={2} /></span>
                <div><div className="stat-num">{statsRecebidas.nova}</div><div className="stat-lbl">Novas (aguardando)</div></div>
              </div>
              <div className="stat-card">
                <span className="stat-ico tone-violet"><Icon name="signal" size={20} /></span>
                <div><div className="stat-num">{statsRecebidas.andamento}</div><div className="stat-lbl">Em andamento</div></div>
              </div>
              <div className="stat-card">
                <span className="stat-ico tone-green"><Icon name="check" size={20} stroke={2.4} /></span>
                <div><div className="stat-num">{statsRecebidas.respondida}</div><div className="stat-lbl">Respondidas</div></div>
              </div>
            </div>

            <div className="portal-filters">
              <div className="pf-search">
                <Icon name="search" size={17} />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por solicitante, organização ou nº…" />
              </div>
              <div className="pf-select">
                <span>Tipo</span>
                <select value={tipo} onChange={(e) => setTipo(e.target.value as '' | RequestType)}>
                  <option value="">Todos</option>
                  {REQUEST_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="pf-select">
                <span>Status</span>
                <select value={status} onChange={(e) => setStatus(e.target.value as '' | RequestStatus)}>
                  <option value="">Todos</option>
                  {REQUEST_STATUS.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
              {(tipo || status || q) && (
                <button className="pf-clear" onClick={() => { setTipo(''); setStatus(''); setQ(''); }}>
                  Limpar
                </button>
              )}
            </div>

            {loading ? (
              <Loading label="Carregando solicitações…" />
            ) : error ? (
              <LoadError message={error} />
            ) : (
              <div className="table-wrap">
                <table className="req-table">
                  <thead>
                    <tr>
                      <th>Nº Pedido</th>
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
                    {rowsRecebidas.map((r) => (
                      <Fragment key={r.id}>
                        <tr className={openId === r.id ? 'row-open' : ''} onClick={() => setOpenId(openId === r.id ? null : r.id)}>
                          <td><span className="col-id">{r.id}</span></td>
                          <td className="td-name">
                            <div className="cell-strong">{r.solicitante}</div>
                            <div className="cell-sub">{r.cargo} · {r.quando}</div>
                          </td>
                          <td>{r.organizacao}</td>
                          <td><TypePill tipo={r.tipo} /></td>
                          <td><StatusPill status={r.status} /></td>
                          <td className="cell-muted">{r.prestador}</td>
                          <td>
                            <span className="uf-tag">{r.uf}</span> <span className="cell-sub">{r.cidade}</span>
                          </td>
                          <td>
                            <div className="cell-contact"><Icon name="phone" size={13} /> {r.phone}</div>
                            <div className="cell-contact cell-sub">{r.email}</div>
                          </td>
                          <td>
                            <button className="row-toggle" aria-label="Detalhes">
                              <Icon name={openId === r.id ? 'close' : 'arrow'} size={15} />
                            </button>
                          </td>
                        </tr>
                        {openId === r.id && (
                          <tr className="detail-row">
                            <td colSpan={9}>
                              <div className="req-detail">
                                <div className="req-detail-main">
                                  <span className="req-detail-id">{r.id}</span>
                                  <p>{r.resumo}</p>
                                </div>
                                <div className="req-detail-actions">
                                  <a className="btn-primary sm" href={'mailto:' + r.email}>
                                    <Icon name="phone" size={14} /> Responder
                                  </a>
                                  <button
                                    className="btn-ghost sm"
                                    onClick={() => router.push(`/portal/solicitacao/${r.id}`)}
                                  >
                                    <Icon name="signal" size={14} /> Acompanhar
                                  </button>
                                  <button
                                    className="btn-ghost sm"
                                    onClick={() => baixarPdf(r)}
                                    disabled={pdfLoading === r.id}
                                  >
                                    <Icon name="file" size={14} />
                                    {pdfLoading === r.id ? 'Gerando…' : 'Gerar PDF'}
                                  </button>
                                  <button
                                    className="btn-ghost sm"
                                    onClick={() => marcarStatus(r.id, 'respondida')}
                                    disabled={r.status === 'respondida'}
                                  >
                                    Marcar como respondida
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
                {rowsRecebidas.length === 0 && (
                  <div className="empty">
                    <Icon name="search" size={32} />
                    <h3>Nenhuma solicitação encontrada</h3>
                    <p>Ajuste os filtros para ver mais resultados.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ===== ENVIADAS ===== */}
        {tab === 'enviadas' && (
          <>
            <div className="stat-grid">
              <div className="stat-card">
                <span className="stat-ico tone-blue"><Icon name="file" size={20} /></span>
                <div><div className="stat-num">{statsEnviadas.total}</div><div className="stat-lbl">Solicitações enviadas</div></div>
              </div>
              <div className="stat-card">
                <span className="stat-ico tone-amber"><Icon name="clock" size={20} /></span>
                <div><div className="stat-num">{statsEnviadas.aguardando}</div><div className="stat-lbl">Aguardando resposta</div></div>
              </div>
              <div className="stat-card">
                <span className="stat-ico tone-green"><Icon name="check" size={20} stroke={2.4} /></span>
                <div><div className="stat-num">{statsEnviadas.respondida}</div><div className="stat-lbl">Respondidas</div></div>
              </div>
              <div className="stat-card">
                <span className="stat-ico tone-violet"><Icon name="users" size={20} /></span>
                <div><div className="stat-num">{statsEnviadas.parceiros}</div><div className="stat-lbl">Parceiros contatados</div></div>
              </div>
            </div>

            <div className="portal-filters">
              <div className="pf-search">
                <Icon name="search" size={17} />
                <input value={qEnv} onChange={(e) => setQEnv(e.target.value)} placeholder="Buscar por parceiro, serviço ou nº…" />
              </div>
              <div className="pf-select">
                <span>Status</span>
                <select value={statusEnv} onChange={(e) => setStatusEnv(e.target.value as '' | RequestStatus)}>
                  <option value="">Todos</option>
                  <option value="nova">Nova</option>
                  <option value="andamento">Em andamento</option>
                  <option value="respondida">Respondida</option>
                  <option value="fechada">Fechada</option>
                </select>
              </div>
              {(statusEnv || qEnv) && (
                <button className="pf-clear" onClick={() => { setStatusEnv(''); setQEnv(''); }}>
                  Limpar
                </button>
              )}
            </div>

            <div className="table-wrap">
              <table className="req-table">
                <thead>
                  <tr>
                    <th>Nº Pedido</th>
                    <th>Parceiro / Fornecedor</th>
                    <th>Segmento</th>
                    <th>Tipo</th>
                    <th>Status</th>
                    <th>Serviço</th>
                    <th>Data</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rowsEnviadas.map((r) => (
                    <Fragment key={r.id}>
                      <tr
                        className={openEnvId === r.id ? 'row-open' : ''}
                        onClick={() => setOpenEnvId(openEnvId === r.id ? null : r.id)}
                      >
                        <td><span className="col-id">{r.id}</span></td>
                        <td className="td-name">
                          <div className="cell-strong">{r.destinatario}</div>
                        </td>
                        <td className="cell-muted">{segmentLabel(r.segmento)}</td>
                        <td><TypePill tipo={r.tipo} /></td>
                        <td><StatusPill status={r.status} /></td>
                        <td>{r.servico}</td>
                        <td className="cell-sub">{r.quando}</td>
                        <td>
                          <button className="row-toggle" aria-label="Detalhes">
                            <Icon name={openEnvId === r.id ? 'close' : 'arrow'} size={15} />
                          </button>
                        </td>
                      </tr>
                      {openEnvId === r.id && (
                        <tr className="detail-row">
                          <td colSpan={8}>
                            <div className="req-detail">
                              <div className="req-detail-main">
                                <span className="req-detail-id">{r.id}</span>
                                <p>{r.resumo}</p>
                              </div>
                              <div className="req-detail-actions">
                                <button
                                  className="btn-primary sm"
                                  onClick={() => router.push(`/portal/enviada/${r.id}`)}
                                >
                                  <Icon name="signal" size={14} /> Acompanhar
                                </button>
                                <button
                                  className="btn-ghost sm"
                                  onClick={() => router.push('/buscar')}
                                >
                                  <Icon name="search" size={14} /> Buscar similares
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
              {rowsEnviadas.length === 0 && (
                <div className="empty">
                  <Icon name="search" size={32} />
                  <h3>Nenhuma solicitação encontrada</h3>
                  <p>Ajuste os filtros ou busque novos parceiros.</p>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
