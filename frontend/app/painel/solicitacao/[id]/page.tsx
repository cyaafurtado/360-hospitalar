'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '../../../../lib/store';
import { typeLabel, segmentLabel } from '../../../../data/reference';
import { EXEMPLOS_PAINEL } from '../../../../data/exemplos-painel';
import type { RequestStatus } from '../../../../data/types';
import { Icon } from '../../../../lib/icons';
import { PainelNav } from '../../../../components/PainelNav';
import { StatusPill, TypePill } from '../../../../components/Pills';

const STATUS_STEPS: { id: RequestStatus; label: string; desc: string }[] = [
  { id: 'nova', label: 'Enviada', desc: 'Solicitação recebida pelo fornecedor.' },
  { id: 'andamento', label: 'Em análise', desc: 'O fornecedor está avaliando sua solicitação.' },
  { id: 'respondida', label: 'Respondida', desc: 'O fornecedor retornou com uma proposta ou resposta.' },
  { id: 'fechada', label: 'Encerrada', desc: 'Solicitação concluída.' },
];

const STATUS_ORDER: Record<RequestStatus, number> = {
  nova: 0, andamento: 1, respondida: 2, fechada: 3, cancelada: -1, declinada: -1,
};

export default function AcompanharSolicitacaoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const authEmail = useAppStore((s) => s.authEmail);

  useEffect(() => {
    if (!authEmail) router.replace('/entrar');
  }, [authEmail, router]);

  const original = EXEMPLOS_PAINEL.find((r) => r.id === id) ?? null;
  const [sol, setSol] = useState(original);
  const [cancelando, setCancelando] = useState(false);
  const [cancelado, setCancelado] = useState(false);
  const [encerrarModal, setEncerrarModal] = useState(false);
  const [aprovada, setAprovada] = useState<boolean | null>(null);
  const [encerrando, setEncerrando] = useState(false);

  if (!sol) return (
    <div className="portal-screen">
      <PainelNav />
      <div className="portal-body">
        <div className="empty">
          <Icon name="search" size={32} />
          <h3>Solicitação não encontrada</h3>
          <p>Verifique o número ou volte para o painel.</p>
        </div>
        <button className="back-link" onClick={() => router.push('/painel')}>
          <Icon name="back" size={15} /> Voltar ao painel
        </button>
      </div>
    </div>
  );

  const currentStep = STATUS_ORDER[sol.status];
  const isTerminal = sol.status === 'cancelada' || sol.status === 'declinada' || sol.status === 'fechada';

  const cancelar = () => {
    setCancelando(true);
    setTimeout(() => {
      setSol((prev) => prev ? { ...prev, status: 'cancelada' } : prev);
      setCancelando(false);
      setCancelado(true);
    }, 600);
  };

  const fecharModalEncerrar = () => {
    if (encerrando) return;
    setEncerrarModal(false);
    setAprovada(null);
  };

  const confirmarEncerramento = () => {
    if (aprovada === null || encerrando) return;
    setEncerrando(true);
    setTimeout(() => {
      setSol((prev) => prev ? {
        ...prev,
        status: 'fechada',
        resultado: aprovada ? 'aprovada' : 'nao-aprovada',
        encerradaEm: new Date().toLocaleDateString('pt-BR'),
      } : prev);
      setEncerrando(false);
      setEncerrarModal(false);
      setAprovada(null);
    }, 600);
  };

  return (
    <div className="portal-screen">
      <PainelNav />
      <div className="portal-body">

        <button className="back-link" onClick={() => router.push('/painel')}>
          <Icon name="back" size={16} /> Voltar às solicitações
        </button>

        <header className="portal-head sol-head">
          <div>
            <div className="sol-id-row">
              <span className="sol-id">{sol.id}</span>
              <TypePill tipo={sol.tipo} />
              <StatusPill status={sol.status} />
            </div>
            <h1>{typeLabel(sol.tipo)} — {sol.servico}</h1>
            <p className="muted">Enviada {sol.quando} · {segmentLabel(sol.segmento)}</p>
          </div>
          {sol.status === 'respondida' && (
            <a className="btn-primary sm" href={'mailto:' + sol.prestadorEmail}>
              <Icon name="mail" size={14} /> Responder proposta
            </a>
          )}
        </header>

        {sol.status === 'cancelada' && (
          <div className="sol-terminal-banner canceled">
            <div className="sol-banner-row">
              <Icon name="close" size={16} stroke={2.4} />
              <span>Esta solicitação foi <strong>cancelada</strong>.</span>
            </div>
          </div>
        )}
        {sol.status === 'declinada' && (
          <div className="sol-terminal-banner pending">
            <div className="sol-banner-row">
              <Icon name="signal" size={16} stroke={2} />
              <span>O fornecedor <strong>declineu</strong> esta solicitação. Você pode buscar outros fornecedores.</span>
            </div>
          </div>
        )}
        {sol.status === 'fechada' && sol.resultado === 'aprovada' && (
          <div className="sol-terminal-banner approved">
            <div className="sol-banner-row">
              <Icon name="check" size={16} stroke={2.4} />
              <span>
                Cotação encerrada — proposta <strong>aprovada</strong> e venda concluída
                {sol.encerradaEm ? ` em ${sol.encerradaEm}` : ''}.
              </span>
            </div>
          </div>
        )}
        {sol.status === 'fechada' && sol.resultado === 'nao-aprovada' && (
          <div className="sol-terminal-banner warn">
            <div className="sol-banner-row">
              <Icon name="close" size={16} stroke={2.4} />
              <span>
                Cotação encerrada — proposta <strong>não aprovada</strong>, sem venda concluída
                {sol.encerradaEm ? ` em ${sol.encerradaEm}` : ''}.
              </span>
            </div>
          </div>
        )}

        {/* Stepper de acompanhamento */}
        <div className={'sol-stepper' + (sol.status === 'cancelada' || sol.status === 'declinada' ? ' dimmed' : '')}>
          {STATUS_STEPS.map((step, i) => {
            const done = currentStep > i;
            const active = sol.status === step.id;
            return (
              <div key={step.id} className={'sol-step' + (active ? ' active' : '') + (done ? ' done' : '')}>
                <span className="sol-step-dot">
                  {done ? <Icon name="check" size={13} stroke={3} /> : i + 1}
                </span>
                <span className="sol-step-label">{step.label}</span>
                {i < STATUS_STEPS.length - 1 && <span className="sol-step-line" />}
              </div>
            );
          })}
        </div>

        <div className="sol-grid">
          <div className="sol-main">

            {/* Dados da solicitação */}
            <div className="sol-card">
              <h3 className="sol-card-title">
                <Icon name="file" size={16} /> Minha solicitação
              </h3>
              <div className="sol-info-grid">
                <div className="sol-info-item">
                  <span className="sol-info-label">Serviço solicitado</span>
                  <span className="sol-info-val">{sol.servico}</span>
                </div>
                <div className="sol-info-item">
                  <span className="sol-info-label">Tipo</span>
                  <span className="sol-info-val">{typeLabel(sol.tipo)}</span>
                </div>
                {sol.prazo && (
                  <div className="sol-info-item">
                    <span className="sol-info-label">Prazo desejado</span>
                    <span className="sol-info-val">{sol.prazo}</span>
                  </div>
                )}
                <div className="sol-info-item">
                  <span className="sol-info-label">Enviada</span>
                  <span className="sol-info-val">{sol.quando}</span>
                </div>
              </div>
              <div className="sol-resumo">
                <span className="sol-info-label">Descrição</span>
                <p>{sol.resumo}</p>
              </div>
            </div>

            {/* Resposta do fornecedor */}
            {sol.resposta && (
              <div className="sol-card">
                <h3 className="sol-card-title">
                  <Icon name="mail" size={16} /> Resposta do fornecedor
                </h3>
                <div className="sol-resposta-box">
                  <p>{sol.resposta.texto}</p>
                  <div className="sol-resposta-meta">
                    <Icon name="check" size={12} stroke={2.5} />
                    <span>{sol.resposta.autor ?? sol.prestador} · {sol.resposta.quando}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Dados do fornecedor */}
            <div className="sol-card">
              <h3 className="sol-card-title">
                <Icon name="users" size={16} /> Fornecedor
              </h3>
              <div className="sol-info-grid">
                <div className="sol-info-item">
                  <span className="sol-info-label">Empresa</span>
                  <span className="sol-info-val">{sol.prestador}</span>
                </div>
                <div className="sol-info-item">
                  <span className="sol-info-label">Segmento</span>
                  <span className="sol-info-val">{segmentLabel(sol.segmento)}</span>
                </div>
                <div className="sol-info-item">
                  <span className="sol-info-label">Telefone</span>
                  <a className="sol-info-val link" href={'tel:' + sol.prestadorContato.replace(/\D/g, '')}>
                    {sol.prestadorContato}
                  </a>
                </div>
                <div className="sol-info-item">
                  <span className="sol-info-label">E-mail</span>
                  <a className="sol-info-val link" href={'mailto:' + sol.prestadorEmail}>
                    {sol.prestadorEmail}
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <aside className="sol-side">
            <div className="sol-card">
              <h3 className="sol-card-title">
                <Icon name="signal" size={16} /> Status atual
              </h3>
              <div className="sol-status-summary">
                <StatusPill status={sol.status} />
                <p className="sol-status-desc">
                  {STATUS_STEPS.find((s) => s.id === sol.status)?.desc
                    ?? (sol.status === 'cancelada' ? 'Solicitação cancelada por você.'
                      : 'O fornecedor declineu esta solicitação.')}
                </p>
              </div>

              {!isTerminal && (
                <>
                  <div className="sol-status-sep" />
                  <button
                    className="sol-status-btn"
                    onClick={() => setEncerrarModal(true)}
                  >
                    <Icon name="check" size={13} stroke={2.6} /> Encerrar cotação
                  </button>
                  <button
                    className="sol-status-btn danger"
                    onClick={cancelar}
                    disabled={cancelando}
                  >
                    {cancelando ? 'Cancelando…' : 'Cancelar solicitação'}
                  </button>
                </>
              )}
              {cancelado && (
                <p className="sol-cancel-ok">
                  <Icon name="check" size={13} stroke={2.5} /> Solicitação cancelada.
                </p>
              )}
            </div>

            <div className="sol-card">
              <h3 className="sol-card-title">
                <Icon name="search" size={16} /> Mais opções
              </h3>
              <div className="sol-status-btns">
                <button
                  className="sol-status-btn"
                  onClick={() => router.push('/buscar')}
                >
                  <Icon name="search" size={14} /> Buscar fornecedores similares
                </button>
                <a className="sol-status-btn" href={'mailto:' + sol.prestadorEmail}>
                  <Icon name="mail" size={14} /> Enviar e-mail ao fornecedor
                </a>
              </div>
            </div>
          </aside>
        </div>

      </div>

      {/* Modal de encerramento da cotação */}
      {encerrarModal && (
        <div className="sol-modal-overlay" onClick={fecharModalEncerrar}>
          <div className="sol-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sol-modal-icon success">
              <Icon name="check" size={24} stroke={2.4} />
            </div>
            <h2 className="sol-modal-title">Encerrar cotação</h2>
            <p className="sol-modal-desc">
              Confirme que a cotação com <strong>{sol.prestador}</strong> foi totalmente finalizada.
            </p>
            <div className="sol-modal-field">
              <label className="sol-modal-label">A proposta foi aprovada e a venda foi concluída?</label>
              <div className="sol-status-btns">
                <button
                  type="button"
                  className={'sol-status-btn' + (aprovada === true ? ' active' : '')}
                  onClick={() => setAprovada(true)}
                >
                  {aprovada === true && <Icon name="check" size={13} stroke={3} />}
                  Sim, aprovada — venda concluída
                </button>
                <button
                  type="button"
                  className={'sol-status-btn warn' + (aprovada === false ? ' active' : '')}
                  onClick={() => setAprovada(false)}
                >
                  {aprovada === false && <Icon name="check" size={13} stroke={3} />}
                  Não foi aprovada / sem venda
                </button>
              </div>
            </div>
            <div className="sol-modal-actions">
              <button className="btn-ghost" onClick={fecharModalEncerrar} disabled={encerrando}>
                Voltar
              </button>
              <button className="btn-primary" onClick={confirmarEncerramento} disabled={encerrando || aprovada === null}>
                {encerrando ? 'Encerrando…' : 'Confirmar encerramento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
