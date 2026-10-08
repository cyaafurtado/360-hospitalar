'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminListInstituicoes } from '../../../lib/services';
import { useAsync } from '../../../lib/useAsync';
import type { AdminInstituicao, InstituicaoStatus, TipoInstituicao } from '../../../data/types';
import { Icon } from '../../../lib/icons';
import { Loading, LoadError } from '../../../components/AsyncState';

const STATUS_LABEL: Record<InstituicaoStatus, string> = {
  em_analise: 'Em análise',
  aprovado: 'Verificado',
  rejeitado: 'Não confirmado',
};

const TIPO_LABEL: Record<TipoInstituicao, string> = {
  clinica: 'Clínica',
  hosp_priv: 'Hospital Privado',
  hosp_pub: 'Hospital Público',
  orgao_pub: 'Órgão Público',
};

export default function AdminInstituicoesPage() {
  const router = useRouter();
  const { data, loading, error } = useAsync(() => adminListInstituicoes(), []);
  const [rows, setRows] = useState<AdminInstituicao[] | null>(null);
  useEffect(() => { if (data) setRows(data); }, [data]);

  const [statusFiltro, setStatusFiltro] = useState<'' | InstituicaoStatus>('em_analise');

  const lista = rows ?? [];

  const stats = useMemo(() => ({
    emAnalise: lista.filter((i) => i.status === 'em_analise').length,
    aprovados: lista.filter((i) => i.status === 'aprovado').length,
    rejeitados: lista.filter((i) => i.status === 'rejeitado').length,
  }), [lista]);

  const filtrados = useMemo(
    () => (statusFiltro ? lista.filter((i) => i.status === statusFiltro) : lista),
    [lista, statusFiltro]
  );

  return (
    <>
      <header className="portal-head">
        <div>
          <h1>Instituições para verificar</h1>
          <p className="muted">Confira se o CNPJ e o CNES informados no cadastro realmente correspondem à instituição. A conta já funciona normalmente enquanto isso é revisado.</p>
        </div>
      </header>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-ico tone-amber"><Icon name="signal" size={20} /></span>
          <div><div className="stat-num">{stats.emAnalise}</div><div className="stat-lbl">Em análise</div></div>
        </div>
        <div className="stat-card">
          <span className="stat-ico tone-green"><Icon name="check" size={20} /></span>
          <div><div className="stat-num">{stats.aprovados}</div><div className="stat-lbl">Verificadas</div></div>
        </div>
        <div className="stat-card">
          <span className="stat-ico tone-blue"><Icon name="close" size={20} /></span>
          <div><div className="stat-num">{stats.rejeitados}</div><div className="stat-lbl">Não confirmadas</div></div>
        </div>
      </div>

      <div className="portal-filters">
        <div className="pf-select">
          <span>Status</span>
          <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value as '' | InstituicaoStatus)}>
            <option value="">Todos</option>
            <option value="em_analise">Em análise</option>
            <option value="aprovado">Verificadas</option>
            <option value="rejeitado">Não confirmadas</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loading label="Carregando instituições…" />
      ) : error ? (
        <LoadError message={error} />
      ) : (
        <div className="table-wrap">
          <table className="req-table">
            <thead>
              <tr>
                <th>Instituição</th>
                <th>Tipo</th>
                <th>CNPJ</th>
                <th>CNES</th>
                <th>Conta</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((inst) => (
                <tr key={inst.id} onClick={() => router.push(`/admin/instituicoes/${inst.id}`)}>
                  <td className="td-name">
                    <div className="cell-strong">{inst.name}</div>
                    <div className="cell-muted">{inst.city} · {inst.uf}</div>
                  </td>
                  <td className="cell-muted">{TIPO_LABEL[inst.tipo]}</td>
                  <td className="cell-sub">{inst.cnpj || '—'}</td>
                  <td className="cell-sub">{inst.cnes || '—'}</td>
                  <td>
                    <div className="cell-strong">{inst.donoNome || '—'}</div>
                    <div className="cell-muted">{inst.donoEmail}</div>
                  </td>
                  <td>
                    <span className={'doc-verif-badge ' + inst.status} title={inst.status === 'rejeitado' ? inst.motivoRejeicao : undefined}>
                      {STATUS_LABEL[inst.status]}
                    </span>
                  </td>
                  <td>
                    <button className="btn-ghost sm" onClick={(e) => { e.stopPropagation(); router.push(`/admin/instituicoes/${inst.id}`); }}>
                      {inst.status === 'em_analise' ? 'Analisar' : 'Ver'} <Icon name="arrow" size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtrados.length === 0 && (
            <div className="empty">
              <Icon name="clipboard" size={32} />
              <h3>Nenhuma instituição aqui</h3>
              <p>Ajuste o filtro para ver outros status.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
