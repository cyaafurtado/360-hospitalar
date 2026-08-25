'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  adminListFornecedores,
  adminUpdateFornecedor,
  adminDeleteFornecedor,
  mensagemDeErro,
} from '../../lib/services';
import { useAsync } from '../../lib/useAsync';
import { segmentLabel, stateName } from '../../data/reference';
import type { AdminFornecedor, Plan } from '../../data/types';
import { Icon } from '../../lib/icons';
import { Loading, LoadError } from '../../components/AsyncState';
import { Modal } from '../../components/Modal';

const PLANO_LABEL: Record<Plan, string> = { free: 'Básico', verified: 'Verificada', premium: 'Premium' };
const STATUS_LABEL: Record<string, string> = { completo: 'Completo', pre_cadastro: 'Pré-cadastro' };

export default function AdminFornecedoresPage() {
  const { data, loading, error } = useAsync(() => adminListFornecedores(), []);
  const [rows, setRows] = useState<AdminFornecedor[] | null>(null);
  useEffect(() => { if (data) setRows(data); }, [data]);

  const [q, setQ] = useState('');
  const [alvoExcluir, setAlvoExcluir] = useState<AdminFornecedor | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroAcao, setErroAcao] = useState('');

  const lista = rows ?? [];

  const stats = useMemo(() => ({
    total: lista.length,
    completos: lista.filter((c) => c.status === 'completo').length,
    preCadastro: lista.filter((c) => c.status === 'pre_cadastro').length,
    verificados: lista.filter((c) => c.verified).length,
  }), [lista]);

  const filtradas = useMemo(() => {
    const termo = q.trim().toLowerCase();
    if (!termo) return lista;
    return lista.filter((c) =>
      (c.name + ' ' + c.city + ' ' + c.uf + ' ' + segmentLabel(c.segment) + ' ' + (c.donoEmail ?? ''))
        .toLowerCase()
        .includes(termo)
    );
  }, [lista, q]);

  const alterar = async (id: string, patch: { verified?: boolean; plano?: Plan }) => {
    setErroAcao('');
    try {
      const atualizado = await adminUpdateFornecedor(id, patch);
      setRows((prev) => (prev ? prev.map((c) => (c.id === id ? atualizado : c)) : prev));
    } catch (e) {
      setErroAcao(mensagemDeErro(e, 'Não foi possível salvar a alteração.'));
    }
  };

  const confirmarExclusao = async () => {
    if (!alvoExcluir) return;
    setExcluindo(true);
    setErroAcao('');
    try {
      await adminDeleteFornecedor(alvoExcluir.id);
      setRows((prev) => (prev ? prev.filter((c) => c.id !== alvoExcluir.id) : prev));
      setAlvoExcluir(null);
    } catch (e) {
      setErroAcao(mensagemDeErro(e, 'Não foi possível excluir esta empresa.'));
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <>
      <header className="portal-head">
        <div>
          <h1>Fornecedores</h1>
          <p className="muted">Todas as empresas cadastradas na plataforma — completas e em pré-cadastro.</p>
        </div>
      </header>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-ico tone-blue"><Icon name="clipboard" size={20} /></span>
          <div><div className="stat-num">{stats.total}</div><div className="stat-lbl">Fornecedores</div></div>
        </div>
        <div className="stat-card">
          <span className="stat-ico tone-green"><Icon name="check" size={20} stroke={2.4} /></span>
          <div><div className="stat-num">{stats.completos}</div><div className="stat-lbl">Cadastro completo</div></div>
        </div>
        <div className="stat-card">
          <span className="stat-ico tone-amber"><Icon name="clock" size={20} /></span>
          <div><div className="stat-num">{stats.preCadastro}</div><div className="stat-lbl">Pré-cadastro</div></div>
        </div>
        <div className="stat-card">
          <span className="stat-ico tone-violet"><Icon name="shield2" size={20} /></span>
          <div><div className="stat-num">{stats.verificados}</div><div className="stat-lbl">Verificados</div></div>
        </div>
      </div>

      <div className="portal-filters">
        <div className="pf-search">
          <Icon name="search" size={17} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, cidade, segmento ou e-mail do dono…" />
        </div>
        {q && (
          <button className="pf-clear" onClick={() => setQ('')}>Limpar</button>
        )}
      </div>

      {erroAcao && <div className="sol-terminal-banner warn">{erroAcao}</div>}

      {loading ? (
        <Loading label="Carregando fornecedores…" />
      ) : error ? (
        <LoadError message={error} />
      ) : (
        <div className="table-wrap">
          <table className="req-table">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Local</th>
                <th>Status</th>
                <th>Verificada</th>
                <th>Plano</th>
                <th>Dono da conta</th>
                <th>Cadastrada em</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((c) => (
                <tr key={c.id}>
                  <td className="td-name">
                    <div className="cell-strong">{c.name}</div>
                    <div className="cell-sub">{segmentLabel(c.segment)}</div>
                  </td>
                  <td>
                    <span className="uf-tag">{c.uf}</span> <span className="cell-sub">{c.city || stateName(c.uf)}</span>
                  </td>
                  <td className="cell-muted">{(c.status && STATUS_LABEL[c.status]) ?? c.status ?? '—'}</td>
                  <td>
                    <button
                      className={c.verified ? 'btn-primary sm' : 'btn-ghost sm'}
                      onClick={() => alterar(c.id, { verified: !c.verified })}
                    >
                      <Icon name={c.verified ? 'check' : 'close'} size={13} stroke={2.4} />
                      {c.verified ? 'Verificada' : 'Não verificada'}
                    </button>
                  </td>
                  <td>
                    <div className="pf-select">
                      <select
                        value={c.plano}
                        onChange={(e) => alterar(c.id, { plano: e.target.value as Plan })}
                      >
                        <option value="free">{PLANO_LABEL.free}</option>
                        <option value="verified">{PLANO_LABEL.verified}</option>
                        <option value="premium">{PLANO_LABEL.premium}</option>
                      </select>
                    </div>
                  </td>
                  <td>
                    {c.donoEmail ? (
                      <>
                        <div className="cell-strong">{c.donoNome || '—'}</div>
                        <div className="cell-sub">{c.donoEmail}</div>
                      </>
                    ) : (
                      <span className="cell-sub">Sem conta vinculada</span>
                    )}
                  </td>
                  <td className="cell-sub">{new Date(c.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <button className="row-toggle" aria-label="Excluir" onClick={() => setAlvoExcluir(c)}>
                      <Icon name="trash" size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtradas.length === 0 && (
            <div className="empty">
              <Icon name="search" size={32} />
              <h3>Nenhum fornecedor encontrado</h3>
              <p>Ajuste a busca para ver mais resultados.</p>
            </div>
          )}
        </div>
      )}

      {alvoExcluir && (
        <Modal title="Excluir fornecedor?" icon="trash" tone="warn" onClose={() => setAlvoExcluir(null)}>
          <p className="sol-modal-desc">
            Tem certeza que deseja excluir <strong>{alvoExcluir.name}</strong>? Isso também apaga as solicitações
            recebidas por ela. Essa ação não pode ser desfeita.
          </p>
          <div className="sol-modal-actions">
            <button className="btn-ghost" onClick={() => setAlvoExcluir(null)} disabled={excluindo}>Cancelar</button>
            <button className="btn-danger" onClick={confirmarExclusao} disabled={excluindo}>
              {excluindo ? 'Excluindo…' : 'Excluir definitivamente'}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
