'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  adminListDocumentos,
  adminAprovarDocumento,
  adminRejeitarDocumento,
  adminAbrirArquivoDocumento,
  mensagemDeErro,
} from '../../../lib/services';
import { useAsync } from '../../../lib/useAsync';
import type { AdminDocumento, DocumentoStatus } from '../../../data/types';
import { Icon } from '../../../lib/icons';
import { Loading, LoadError } from '../../../components/AsyncState';
import { Modal } from '../../../components/Modal';

const STATUS_LABEL: Record<DocumentoStatus, string> = {
  rascunho: 'Rascunho',
  em_analise: 'Em análise',
  aprovado: 'Verificado',
  rejeitado: 'Rejeitado',
};

const fmtDate = (iso: string) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

export default function AdminDocumentosPage() {
  const { data, loading, error } = useAsync(() => adminListDocumentos(), []);
  const [rows, setRows] = useState<AdminDocumento[] | null>(null);
  useEffect(() => { if (data) setRows(data); }, [data]);

  const [statusFiltro, setStatusFiltro] = useState<'' | DocumentoStatus>('em_analise');
  const [carregando, setCarregando] = useState<string | null>(null);
  const [erroAcao, setErroAcao] = useState('');
  const [alvoRejeitar, setAlvoRejeitar] = useState<AdminDocumento | null>(null);
  const [motivo, setMotivo] = useState('');

  const lista = rows ?? [];

  const stats = useMemo(() => ({
    emAnalise: lista.filter((d) => d.status === 'em_analise').length,
    aprovados: lista.filter((d) => d.status === 'aprovado').length,
    rejeitados: lista.filter((d) => d.status === 'rejeitado').length,
  }), [lista]);

  const filtrados = useMemo(
    () => (statusFiltro ? lista.filter((d) => d.status === statusFiltro) : lista),
    [lista, statusFiltro]
  );

  const aprovar = async (doc: AdminDocumento) => {
    setErroAcao('');
    setCarregando(doc.id);
    try {
      await adminAprovarDocumento(doc.id);
      setRows((prev) => (prev ? prev.map((x) => (x.id === doc.id ? { ...x, status: 'aprovado' } : x)) : prev));
    } catch (e) {
      setErroAcao(mensagemDeErro(e, 'Não foi possível aprovar o documento.'));
    } finally {
      setCarregando(null);
    }
  };

  const confirmarRejeicao = async () => {
    if (!alvoRejeitar) return;
    setErroAcao('');
    setCarregando(alvoRejeitar.id);
    try {
      await adminRejeitarDocumento(alvoRejeitar.id, motivo);
      setRows((prev) =>
        prev ? prev.map((x) => (x.id === alvoRejeitar.id ? { ...x, status: 'rejeitado', motivoRejeicao: motivo } : x)) : prev
      );
      setAlvoRejeitar(null);
      setMotivo('');
    } catch (e) {
      setErroAcao(mensagemDeErro(e, 'Não foi possível rejeitar o documento.'));
    } finally {
      setCarregando(null);
    }
  };

  const abrirArquivo = async (arquivoId: string) => {
    try {
      await adminAbrirArquivoDocumento(arquivoId);
    } catch (e) {
      setErroAcao(mensagemDeErro(e, 'Não foi possível abrir o arquivo.'));
    }
  };

  return (
    <>
      <header className="portal-head">
        <div>
          <h1>Documentos para verificação</h1>
          <p className="muted">Certificações e licenças enviadas pelos fornecedores. Só o que for aprovado aqui aparece na página pública da empresa.</p>
        </div>
      </header>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-ico tone-amber"><Icon name="signal" size={20} /></span>
          <div><div className="stat-num">{stats.emAnalise}</div><div className="stat-lbl">Em análise</div></div>
        </div>
        <div className="stat-card">
          <span className="stat-ico tone-green"><Icon name="check" size={20} /></span>
          <div><div className="stat-num">{stats.aprovados}</div><div className="stat-lbl">Verificados</div></div>
        </div>
        <div className="stat-card">
          <span className="stat-ico tone-blue"><Icon name="close" size={20} /></span>
          <div><div className="stat-num">{stats.rejeitados}</div><div className="stat-lbl">Rejeitados</div></div>
        </div>
      </div>

      <div className="portal-filters">
        <div className="pf-select">
          <span>Status</span>
          <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value as '' | DocumentoStatus)}>
            <option value="">Todos</option>
            <option value="em_analise">Em análise</option>
            <option value="aprovado">Verificados</option>
            <option value="rejeitado">Rejeitados</option>
          </select>
        </div>
      </div>

      {erroAcao && <div className="sol-terminal-banner warn">{erroAcao}</div>}

      {loading ? (
        <Loading label="Carregando documentos…" />
      ) : error ? (
        <LoadError message={error} />
      ) : (
        <div className="table-wrap">
          <table className="req-table">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Tipo / Certificação</th>
                <th>Número</th>
                <th>Validade</th>
                <th>Anexos</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((doc) => (
                <tr key={doc.id}>
                  <td className="td-name">
                    <div className="cell-strong">{doc.empresaNome}</div>
                  </td>
                  <td className="cell-muted">{doc.tipo || '—'}</td>
                  <td className="cell-sub">{doc.numero || '—'}</td>
                  <td className="cell-sub">{fmtDate(doc.validade)}</td>
                  <td>
                    <div className="doc-file-list view" style={{ padding: 0 }}>
                      {doc.arquivos.length === 0 ? (
                        <span className="doc-attach-empty">—</span>
                      ) : doc.arquivos.map((a) => (
                        <button key={a.id} type="button" className="doc-file-chip link" onClick={() => abrirArquivo(a.id)} title="Abrir arquivo">
                          <Icon name="file" size={12} />
                          <span className="doc-file-name">{a.nome}</span>
                        </button>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={'doc-verif-badge ' + doc.status} title={doc.status === 'rejeitado' ? doc.motivoRejeicao : undefined}>
                      {STATUS_LABEL[doc.status]}
                    </span>
                  </td>
                  <td>
                    {doc.status === 'em_analise' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-primary sm" disabled={carregando === doc.id} onClick={() => aprovar(doc)}>
                          <Icon name="check" size={13} stroke={2.6} /> Aprovar
                        </button>
                        <button className="btn-ghost sm" disabled={carregando === doc.id} onClick={() => { setAlvoRejeitar(doc); setMotivo(''); }}>
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
              <h3>Nenhum documento aqui</h3>
              <p>Ajuste o filtro para ver outros status.</p>
            </div>
          )}
        </div>
      )}

      {alvoRejeitar && (
        <Modal title="Rejeitar documento?" icon="close" tone="warn" onClose={() => setAlvoRejeitar(null)}>
          <p className="sol-modal-desc">
            <strong>{alvoRejeitar.empresaNome}</strong> vai ver que o documento <strong>{alvoRejeitar.tipo || 'enviado'}</strong> foi
            rejeitado e poderá corrigir e reenviar.
          </p>
          <div className="sol-modal-field">
            <label className="sol-modal-label">Motivo (aparece para o fornecedor)</label>
            <textarea
              className="sol-modal-textarea"
              rows={3}
              placeholder="Ex: Número do registro não confere com o documento anexado."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          </div>
          <div className="sol-modal-actions">
            <button className="btn-ghost" onClick={() => setAlvoRejeitar(null)} disabled={carregando === alvoRejeitar.id}>
              Cancelar
            </button>
            <button className="btn-danger" onClick={confirmarRejeicao} disabled={carregando === alvoRejeitar.id}>
              {carregando === alvoRejeitar.id ? 'Rejeitando…' : 'Rejeitar documento'}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
