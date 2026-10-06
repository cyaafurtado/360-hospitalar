'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  adminListInstituicoes,
  adminAprovarInstituicao,
  adminRejeitarInstituicao,
  mensagemDeErro,
} from '../../../lib/services';
import { useAsync } from '../../../lib/useAsync';
import type { AdminInstituicao, InstituicaoStatus, TipoInstituicao } from '../../../data/types';
import { Icon } from '../../../lib/icons';
import { Loading, LoadError } from '../../../components/AsyncState';
import { Modal } from '../../../components/Modal';

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
  const { data, loading, error } = useAsync(() => adminListInstituicoes(), []);
  const [rows, setRows] = useState<AdminInstituicao[] | null>(null);
  useEffect(() => { if (data) setRows(data); }, [data]);

  const [statusFiltro, setStatusFiltro] = useState<'' | InstituicaoStatus>('em_analise');
  const [carregando, setCarregando] = useState<string | null>(null);
  const [erroAcao, setErroAcao] = useState('');
  const [alvoRejeitar, setAlvoRejeitar] = useState<AdminInstituicao | null>(null);
  const [motivo, setMotivo] = useState('');

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

  const aprovar = async (inst: AdminInstituicao) => {
    setErroAcao('');
    setCarregando(inst.id);
    try {
      await adminAprovarInstituicao(inst.id);
      setRows((prev) => (prev ? prev.map((x) => (x.id === inst.id ? { ...x, status: 'aprovado' } : x)) : prev));
    } catch (e) {
      setErroAcao(mensagemDeErro(e, 'Não foi possível aprovar a instituição.'));
    } finally {
      setCarregando(null);
    }
  };

  const confirmarRejeicao = async () => {
    if (!alvoRejeitar) return;
    setErroAcao('');
    setCarregando(alvoRejeitar.id);
    try {
      await adminRejeitarInstituicao(alvoRejeitar.id, motivo);
      setRows((prev) =>
        prev ? prev.map((x) => (x.id === alvoRejeitar.id ? { ...x, status: 'rejeitado', motivoRejeicao: motivo } : x)) : prev
      );
      setAlvoRejeitar(null);
      setMotivo('');
    } catch (e) {
      setErroAcao(mensagemDeErro(e, 'Não foi possível rejeitar a instituição.'));
    } finally {
      setCarregando(null);
    }
  };

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

      {erroAcao && <div className="sol-terminal-banner warn">{erroAcao}</div>}

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
                <tr key={inst.id}>
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
                    {inst.status === 'em_analise' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-primary sm" disabled={carregando === inst.id} onClick={() => aprovar(inst)}>
                          <Icon name="check" size={13} stroke={2.6} /> Aprovar
                        </button>
                        <button className="btn-ghost sm" disabled={carregando === inst.id} onClick={() => { setAlvoRejeitar(inst); setMotivo(''); }}>
                          Rejeitar
                        </button>
                      </div>
                    )}
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

      {alvoRejeitar && (
        <Modal title="Marcar como não confirmada?" icon="close" tone="warn" onClose={() => setAlvoRejeitar(null)}>
          <p className="sol-modal-desc">
            A conta de <strong>{alvoRejeitar.name}</strong> continua funcionando normalmente — isto só marca que
            o CNPJ/CNES informado não pôde ser confirmado.
          </p>
          <div className="sol-modal-field">
            <label className="sol-modal-label">Motivo (aparece para a instituição)</label>
            <textarea
              className="sol-modal-textarea"
              rows={3}
              placeholder="Ex: CNES informado não corresponde a este CNPJ na base do Ministério da Saúde."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          </div>
          <div className="sol-modal-actions">
            <button className="btn-ghost" onClick={() => setAlvoRejeitar(null)} disabled={carregando === alvoRejeitar.id}>
              Cancelar
            </button>
            <button className="btn-danger" onClick={confirmarRejeicao} disabled={carregando === alvoRejeitar.id}>
              {carregando === alvoRejeitar.id ? 'Salvando…' : 'Marcar como não confirmada'}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
