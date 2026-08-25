'use client';
import { useMemo, useState } from 'react';
import { adminListSolicitacoes } from '../../../lib/services';
import { useAsync } from '../../../lib/useAsync';
import type { RequestStatus } from '../../../data/types';
import { Icon } from '../../../lib/icons';
import { Loading, LoadError } from '../../../components/AsyncState';
import { StatusPill, TypePill } from '../../../components/Pills';

export default function AdminContratosPage() {
  const { data, loading, error } = useAsync(() => adminListSolicitacoes(), []);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'' | RequestStatus>('');
  const [somenteContrato, setSomenteContrato] = useState(false);

  const solicitacoes = data ?? [];

  const stats = useMemo(() => ({
    total: solicitacoes.length,
    comContrato: solicitacoes.filter((r) => r.contrato?.assinado).length,
    andamento: solicitacoes.filter((r) => r.status === 'andamento').length,
    fechadas: solicitacoes.filter((r) => r.status === 'fechada').length,
  }), [solicitacoes]);

  const filtradas = useMemo(() =>
    solicitacoes.filter((r) => {
      if (somenteContrato && !r.contrato?.assinado) return false;
      if (status && r.status !== status) return false;
      const termo = q.trim().toLowerCase();
      if (termo && !(r.organizacao + ' ' + r.prestador + ' ' + r.id).toLowerCase().includes(termo)) return false;
      return true;
    }),
    [solicitacoes, q, status, somenteContrato]
  );

  return (
    <>
      <header className="portal-head">
        <div>
          <h1>Contratos e solicitações</h1>
          <p className="muted">Toda solicitação de cotação, contato e parceria da plataforma, com os contratos firmados.</p>
        </div>
      </header>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-ico tone-blue"><Icon name="list" size={20} /></span>
          <div><div className="stat-num">{stats.total}</div><div className="stat-lbl">Solicitações</div></div>
        </div>
        <div className="stat-card">
          <span className="stat-ico tone-green"><Icon name="file" size={20} /></span>
          <div><div className="stat-num">{stats.comContrato}</div><div className="stat-lbl">Contratos firmados</div></div>
        </div>
        <div className="stat-card">
          <span className="stat-ico tone-violet"><Icon name="signal" size={20} /></span>
          <div><div className="stat-num">{stats.andamento}</div><div className="stat-lbl">Em andamento</div></div>
        </div>
        <div className="stat-card">
          <span className="stat-ico tone-amber"><Icon name="check" size={20} stroke={2.4} /></span>
          <div><div className="stat-num">{stats.fechadas}</div><div className="stat-lbl">Fechadas</div></div>
        </div>
      </div>

      <div className="portal-filters">
        <div className="pf-search">
          <Icon name="search" size={17} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por organização, prestador ou nº…" />
        </div>
        <div className="pf-select">
          <span>Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as '' | RequestStatus)}>
            <option value="">Todos</option>
            <option value="nova">Nova</option>
            <option value="andamento">Em andamento</option>
            <option value="respondida">Respondida</option>
            <option value="fechada">Fechada</option>
          </select>
        </div>
        <button
          className={somenteContrato ? 'btn-primary sm' : 'btn-ghost sm'}
          onClick={() => setSomenteContrato((v) => !v)}
        >
          <Icon name="file" size={14} /> Só com contrato firmado
        </button>
        {(q || status || somenteContrato) && (
          <button className="pf-clear" onClick={() => { setQ(''); setStatus(''); setSomenteContrato(false); }}>
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
                <th>Organização (compradora)</th>
                <th>Prestador</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Contrato</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((r) => (
                <tr key={r.id}>
                  <td><span className="col-id">{r.id}</span></td>
                  <td className="td-name">
                    <div className="cell-strong">{r.organizacao}</div>
                    <div className="cell-sub">{r.solicitante}</div>
                  </td>
                  <td className="cell-muted">{r.prestador}</td>
                  <td><TypePill tipo={r.tipo} /></td>
                  <td><StatusPill status={r.status} /></td>
                  <td>
                    {r.contrato?.assinado ? (
                      <>
                        <div className="cell-strong">{r.contrato.numero || 'Assinado'}</div>
                        <div className="cell-sub">
                          {r.contrato.valor}{r.contrato.validade ? ` · até ${r.contrato.validade}` : ''}
                        </div>
                      </>
                    ) : (
                      <span className="cell-sub">Sem contrato</span>
                    )}
                  </td>
                  <td className="cell-sub">{r.quando}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtradas.length === 0 && (
            <div className="empty">
              <Icon name="search" size={32} />
              <h3>Nenhuma solicitação encontrada</h3>
              <p>Ajuste os filtros para ver mais resultados.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
