'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  adminListUsuarios,
  adminResetarSenha,
  adminSetAtivo,
  adminDeleteUsuario,
  mensagemDeErro,
} from '../../../lib/services';
import { useAsync } from '../../../lib/useAsync';
import type { AdminUsuario, UsuarioTipo } from '../../../data/types';
import { Icon } from '../../../lib/icons';
import { Loading, LoadError } from '../../../components/AsyncState';
import { Modal } from '../../../components/Modal';
import { useAppStore } from '../../../lib/store';

const TIPO_LABEL: Record<UsuarioTipo, string> = {
  fornecedor: 'Fornecedor',
  contratante: 'Contratante',
  admin: 'Administrador',
};

export default function AdminUsuariosPage() {
  const meuId = useAppStore((s) => s.usuario?.id);
  const { data, loading, error } = useAsync(() => adminListUsuarios(), []);
  const [rows, setRows] = useState<AdminUsuario[] | null>(null);
  useEffect(() => { if (data) setRows(data); }, [data]);

  const [q, setQ] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<'' | UsuarioTipo>('');
  const [alvoExcluir, setAlvoExcluir] = useState<AdminUsuario | null>(null);
  const [alvoResetar, setAlvoResetar] = useState<AdminUsuario | null>(null);
  const [senhaGerada, setSenhaGerada] = useState('');
  const [carregando, setCarregando] = useState<string | null>(null);
  const [erroAcao, setErroAcao] = useState('');

  const lista = rows ?? [];

  const stats = useMemo(() => ({
    total: lista.length,
    fornecedores: lista.filter((u) => u.tipo === 'fornecedor').length,
    contratantes: lista.filter((u) => u.tipo === 'contratante').length,
    inativos: lista.filter((u) => !u.ativo).length,
  }), [lista]);

  const filtrados = useMemo(() => {
    const termo = q.trim().toLowerCase();
    return lista.filter((u) => {
      if (tipoFiltro && u.tipo !== tipoFiltro) return false;
      if (termo && !(u.nome + ' ' + u.email + ' ' + u.organizacao).toLowerCase().includes(termo)) return false;
      return true;
    });
  }, [lista, q, tipoFiltro]);

  const alternarAtivo = async (u: AdminUsuario) => {
    setErroAcao('');
    setCarregando(u.id);
    try {
      await adminSetAtivo(u.id, !u.ativo);
      setRows((prev) => (prev ? prev.map((x) => (x.id === u.id ? { ...x, ativo: !u.ativo } : x)) : prev));
    } catch (e) {
      setErroAcao(mensagemDeErro(e, 'Não foi possível alterar o status desta conta.'));
    } finally {
      setCarregando(null);
    }
  };

  const confirmarReset = async () => {
    if (!alvoResetar) return;
    setCarregando(alvoResetar.id);
    setErroAcao('');
    try {
      const senha = await adminResetarSenha(alvoResetar.id);
      setSenhaGerada(senha);
    } catch (e) {
      setErroAcao(mensagemDeErro(e, 'Não foi possível gerar uma senha nova.'));
      setAlvoResetar(null);
    } finally {
      setCarregando(null);
    }
  };

  const fecharReset = () => {
    setAlvoResetar(null);
    setSenhaGerada('');
  };

  const copiarSenha = async () => {
    try {
      await navigator.clipboard.writeText(senhaGerada);
    } catch {
      // Sem permissão de clipboard: a pessoa copia manualmente o texto selecionado.
    }
  };

  const confirmarExclusao = async () => {
    if (!alvoExcluir) return;
    setCarregando(alvoExcluir.id);
    setErroAcao('');
    try {
      await adminDeleteUsuario(alvoExcluir.id);
      setRows((prev) => (prev ? prev.filter((u) => u.id !== alvoExcluir.id) : prev));
      setAlvoExcluir(null);
    } catch (e) {
      setErroAcao(mensagemDeErro(e, 'Não foi possível excluir esta conta.'));
    } finally {
      setCarregando(null);
    }
  };

  return (
    <>
      <header className="portal-head">
        <div>
          <h1>Usuários</h1>
          <p className="muted">Todas as contas da plataforma. Senhas ficam só em hash — o reset gera uma nova.</p>
        </div>
      </header>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-ico tone-blue"><Icon name="users" size={20} /></span>
          <div><div className="stat-num">{stats.total}</div><div className="stat-lbl">Contas</div></div>
        </div>
        <div className="stat-card">
          <span className="stat-ico tone-green"><Icon name="clipboard" size={20} /></span>
          <div><div className="stat-num">{stats.fornecedores}</div><div className="stat-lbl">Fornecedores</div></div>
        </div>
        <div className="stat-card">
          <span className="stat-ico tone-violet"><Icon name="signal" size={20} /></span>
          <div><div className="stat-num">{stats.contratantes}</div><div className="stat-lbl">Contratantes</div></div>
        </div>
        <div className="stat-card">
          <span className="stat-ico tone-amber"><Icon name="close" size={20} /></span>
          <div><div className="stat-num">{stats.inativos}</div><div className="stat-lbl">Inativos</div></div>
        </div>
      </div>

      <div className="portal-filters">
        <div className="pf-search">
          <Icon name="search" size={17} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, e-mail ou organização…" />
        </div>
        <div className="pf-select">
          <span>Tipo</span>
          <select value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value as '' | UsuarioTipo)}>
            <option value="">Todos</option>
            <option value="fornecedor">Fornecedor</option>
            <option value="contratante">Contratante</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        {(q || tipoFiltro) && (
          <button className="pf-clear" onClick={() => { setQ(''); setTipoFiltro(''); }}>Limpar</button>
        )}
      </div>

      {erroAcao && <div className="sol-terminal-banner warn">{erroAcao}</div>}

      {loading ? (
        <Loading label="Carregando usuários…" />
      ) : error ? (
        <LoadError message={error} />
      ) : (
        <div className="table-wrap">
          <table className="req-table">
            <thead>
              <tr>
                <th>Conta</th>
                <th>Tipo</th>
                <th>Organização</th>
                <th>Ativa</th>
                <th>Último login</th>
                <th>Criada em</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((u) => (
                <tr key={u.id}>
                  <td className="td-name">
                    <div className="cell-strong">{u.nome || '—'}</div>
                    <div className="cell-sub">{u.email}</div>
                  </td>
                  <td className="cell-muted">{TIPO_LABEL[u.tipo]}</td>
                  <td className="cell-sub">{u.organizacao || '—'}</td>
                  <td>
                    <button
                      className={u.ativo ? 'btn-primary sm' : 'btn-ghost sm'}
                      onClick={() => alternarAtivo(u)}
                      disabled={carregando === u.id || u.id === meuId}
                    >
                      <Icon name={u.ativo ? 'check' : 'close'} size={13} stroke={2.4} />
                      {u.ativo ? 'Ativa' : 'Inativa'}
                    </button>
                  </td>
                  <td className="cell-sub">{u.ultimoLogin ? new Date(u.ultimoLogin).toLocaleString('pt-BR') : 'Nunca'}</td>
                  <td className="cell-sub">{new Date(u.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="row-toggle"
                        aria-label="Resetar senha"
                        onClick={() => setAlvoResetar(u)}
                        disabled={carregando === u.id}
                      >
                        <Icon name="key" size={15} />
                      </button>
                      <button
                        className="row-toggle"
                        aria-label="Excluir"
                        onClick={() => setAlvoExcluir(u)}
                        disabled={u.id === meuId}
                      >
                        <Icon name="trash" size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtrados.length === 0 && (
            <div className="empty">
              <Icon name="search" size={32} />
              <h3>Nenhum usuário encontrado</h3>
              <p>Ajuste os filtros para ver mais resultados.</p>
            </div>
          )}
        </div>
      )}

      {alvoExcluir && (
        <Modal title="Excluir conta?" icon="trash" tone="warn" onClose={() => setAlvoExcluir(null)}>
          <p className="sol-modal-desc">
            Tem certeza que deseja excluir a conta de <strong>{alvoExcluir.email}</strong>? Essa ação não pode ser
            desfeita. Se ela administrar uma empresa, a empresa fica sem dono (não é apagada).
          </p>
          <div className="sol-modal-actions">
            <button className="btn-ghost" onClick={() => setAlvoExcluir(null)} disabled={carregando === alvoExcluir.id}>
              Cancelar
            </button>
            <button className="btn-danger" onClick={confirmarExclusao} disabled={carregando === alvoExcluir.id}>
              {carregando === alvoExcluir.id ? 'Excluindo…' : 'Excluir definitivamente'}
            </button>
          </div>
        </Modal>
      )}

      {alvoResetar && !senhaGerada && (
        <Modal title="Gerar nova senha?" icon="key" tone="warn" onClose={fecharReset}>
          <p className="sol-modal-desc">
            Uma senha nova será criada para <strong>{alvoResetar.email}</strong> e a senha atual deixa de funcionar.
            Todas as sessões abertas desta conta serão encerradas.
          </p>
          <div className="sol-modal-actions">
            <button className="btn-ghost" onClick={fecharReset} disabled={carregando === alvoResetar.id}>Cancelar</button>
            <button className="btn-primary" onClick={confirmarReset} disabled={carregando === alvoResetar.id}>
              {carregando === alvoResetar.id ? 'Gerando…' : 'Gerar senha nova'}
            </button>
          </div>
        </Modal>
      )}

      {alvoResetar && senhaGerada && (
        <Modal title="Senha gerada" icon="key" tone="success" onClose={fecharReset}>
          <p className="sol-modal-desc">
            Copie e repasse para <strong>{alvoResetar.email}</strong> agora — ela não será mostrada de novo.
          </p>
          <div className="sol-modal-field">
            <label className="sol-modal-label">Senha temporária</label>
            <input
              className="sol-modal-textarea"
              readOnly
              value={senhaGerada}
              onFocus={(e) => e.currentTarget.select()}
            />
          </div>
          <div className="sol-modal-actions">
            <button className="btn-ghost" onClick={copiarSenha}>Copiar</button>
            <button className="btn-primary" onClick={fecharReset}>Concluído</button>
          </div>
        </Modal>
      )}
    </>
  );
}
