'use client';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../../lib/store';
import { Icon } from '../../lib/icons';
import { PainelNav } from '../../components/PainelNav';
import { StatusPill, TypePill } from '../../components/Pills';
import { segmentLabel, REQUEST_STATUS, REQUEST_TYPES } from '../../data/reference';
import { EXEMPLOS_PAINEL } from '../../data/exemplos-painel';
import type { RequestStatus, RequestType } from '../../data/types';

export default function PainelPage() {
  const router = useRouter();
  const authEmail = useAppStore((s) => s.authEmail);
  const [openId, setOpenId] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<'' | RequestStatus>('');
  const [filtroTipo, setFiltroTipo] = useState<'' | RequestType>('');
  const [q, setQ] = useState('');

  useEffect(() => {
    if (!authEmail) router.replace('/entrar');
  }, [authEmail, router]);

  const rows = useMemo(
    () =>
      EXEMPLOS_PAINEL.filter((r) => {
        if (filtroStatus && r.status !== filtroStatus) return false;
        if (filtroTipo && r.tipo !== filtroTipo) return false;
        if (q.trim()) {
          const h = (r.prestador + ' ' + r.servico + ' ' + r.id).toLowerCase();
          if (!h.includes(q.toLowerCase())) return false;
        }
        return true;
      }),
    [filtroStatus, filtroTipo, q]
  );

  const stats = useMemo(
    () => ({
      total: EXEMPLOS_PAINEL.length,
      aguardando: EXEMPLOS_PAINEL.filter((r) => r.status === 'nova' || r.status === 'andamento').length,
      respondidas: EXEMPLOS_PAINEL.filter((r) => r.status === 'respondida').length,
      fornecedores: new Set(EXEMPLOS_PAINEL.map((r) => r.prestador)).size,
    }),
    []
  );

  return (
    <div className="portal-screen">
      <PainelNav />
      <div className="portal-body">
        <header className="portal-head">
          <div>
            <h1>Minhas solicitações</h1>
            <p className="muted">Acompanhe os pedidos de cotação e contato enviados a fornecedores.</p>
          </div>
          <button className="btn-primary" onClick={() => router.push('/buscar')}>
            <Icon name="search" size={16} /> Buscar fornecedores
          </button>
        </header>

        <div className="stat-grid">
          <div className="stat-card">
            <span className="stat-ico tone-blue"><Icon name="file" size={20} /></span>
            <div><div className="stat-num">{stats.total}</div><div className="stat-lbl">Solicitações enviadas</div></div>
          </div>
          <div className="stat-card">
            <span className="stat-ico tone-amber"><Icon name="clock" size={20} /></span>
            <div><div className="stat-num">{stats.aguardando}</div><div className="stat-lbl">Aguardando resposta</div></div>
          </div>
          <div className="stat-card">
            <span className="stat-ico tone-green"><Icon name="check" size={20} stroke={2.4} /></span>
            <div><div className="stat-num">{stats.respondidas}</div><div className="stat-lbl">Respondidas</div></div>
          </div>
          <div className="stat-card">
            <span className="stat-ico tone-violet"><Icon name="users" size={20} /></span>
            <div><div className="stat-num">{stats.fornecedores}</div><div className="stat-lbl">Fornecedores contatados</div></div>
          </div>
        </div>

        <div className="portal-filters">
          <div className="pf-search">
            <Icon name="search" size={17} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por fornecedor, serviço ou nº…"
            />
          </div>
          <div className="pf-select">
            <span>Tipo</span>
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value as '' | RequestType)}>
              <option value="">Todos</option>
              {REQUEST_TYPES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="pf-select">
            <span>Status</span>
            <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value as '' | RequestStatus)}>
              <option value="">Todos</option>
              {REQUEST_STATUS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
          {(filtroTipo || filtroStatus || q) && (
            <button className="pf-clear" onClick={() => { setFiltroTipo(''); setFiltroStatus(''); setQ(''); }}>
              Limpar
            </button>
          )}
        </div>

        <div className="table-wrap">
          <table className="req-table">
            <thead>
              <tr>
                <th>Nº Pedido</th>
                <th>Fornecedor</th>
                <th>Segmento</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Serviço</th>
                <th>Data</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <Fragment key={r.id}>
                  <tr
                    className={openId === r.id ? 'row-open' : ''}
                    onClick={() => setOpenId(openId === r.id ? null : r.id)}
                  >
                    <td><span className="col-id">{r.id}</span></td>
                    <td className="td-name">
                      <div className="cell-strong">{r.prestador}</div>
                    </td>
                    <td className="cell-muted">{segmentLabel(r.segmento)}</td>
                    <td><TypePill tipo={r.tipo} /></td>
                    <td><StatusPill status={r.status} /></td>
                    <td>{r.servico}</td>
                    <td className="cell-sub">{r.quando}</td>
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
                            <button
                              className="btn-primary sm"
                              onClick={() => router.push(`/painel/solicitacao/${r.id}`)}
                            >
                              <Icon name="signal" size={14} /> Acompanhar
                            </button>
                            <button
                              className="btn-ghost sm"
                              onClick={() => router.push('/buscar')}
                            >
                              <Icon name="search" size={14} /> Ver fornecedores similares
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
      </div>
    </div>
  );
}
