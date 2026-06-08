'use client';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getRequests, updateRequestStatus } from '../../lib/services';
import { useAsync } from '../../lib/useAsync';
import { useAppStore } from '../../lib/store';
import { REQUEST_STATUS, REQUEST_TYPES } from '../../data/reference';
import type { RequestStatus, RequestType, SolicitacaoRequest } from '../../data/types';
import { Icon } from '../../lib/icons';
import { PortalNav } from '../../components/PortalNav';
import { StatusPill, TypePill } from '../../components/Pills';
import { Loading, LoadError } from '../../components/AsyncState';

export default function PortalPage() {
  const router = useRouter();
  const authEmail = useAppStore((s) => s.authEmail);
  useEffect(() => {
    if (!authEmail) router.replace('/entrar');
  }, [authEmail, router]);

  const { data, loading, error } = useAsync(() => getRequests(), []);
  const [rowsState, setRowsState] = useState<SolicitacaoRequest[] | null>(null);
  useEffect(() => {
    if (data) setRowsState(data);
  }, [data]);

  const [tipo, setTipo] = useState<'' | RequestType>('');
  const [status, setStatus] = useState<'' | RequestStatus>('');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const requests = rowsState ?? [];

  const stats = useMemo(
    () => ({
      total: requests.length,
      nova: requests.filter((r) => r.status === 'nova').length,
      andamento: requests.filter((r) => r.status === 'andamento').length,
      respondida: requests.filter((r) => r.status === 'respondida').length,
    }),
    [requests]
  );

  const rows = useMemo(
    () =>
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

  const marcarRespondida = async (id: string) => {
    try {
      const updated = await updateRequestStatus(id, 'respondida');
      setRowsState((prev) => (prev ? prev.map((r) => (r.id === id ? updated : r)) : prev));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="portal-screen">
      <PortalNav />
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
                  <Fragment key={r.id}>
                    <tr className={openId === r.id ? 'row-open' : ''} onClick={() => setOpenId(openId === r.id ? null : r.id)}>
                      <td>
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
                        <td colSpan={8}>
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
                                onClick={() => marcarRespondida(r.id)}
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
            {rows.length === 0 && (
              <div className="empty">
                <Icon name="search" size={32} />
                <h3>Nenhuma solicitação encontrada</h3>
                <p>Ajuste os filtros para ver mais resultados.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
