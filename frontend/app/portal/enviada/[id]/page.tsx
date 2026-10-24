'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '../../../../lib/store';
import { typeLabel } from '../../../../data/reference';
import { getRequest, solicitarCancelamento, responderCancelamento } from '../../../../lib/services';
import { useAsync } from '../../../../lib/useAsync';
import type { RequestStatus, SolicitacaoRequest } from '../../../../data/types';
import { Icon } from '../../../../lib/icons';
import { PortalNav } from '../../../../components/PortalNav';
import { StatusPill, TypePill } from '../../../../components/Pills';
import { gerarPdfSolicitacao } from '../../../../lib/pdf';
import { gerarExcelSolicitacao } from '../../../../lib/excel';

const STATUS_STEPS: { id: RequestStatus; label: string; desc: string }[] = [
  { id: 'nova', label: 'Enviada', desc: 'Solicitação recebida pelo parceiro.' },
  { id: 'andamento', label: 'Em análise', desc: 'O parceiro está avaliando sua solicitação.' },
  { id: 'respondida', label: 'Respondida', desc: 'O parceiro retornou com uma proposta ou resposta.' },
  { id: 'fechada', label: 'Encerrada', desc: 'Solicitação concluída.' },
];

const STATUS_ORDER: Record<RequestStatus, number> = {
  nova: 0, andamento: 1, respondida: 2, fechada: 3, cancelada: -1, declinada: -1,
};

export default function EnviadaDetalhe() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const authEmail = useAppStore((s) => s.authEmail);
  const hydrated = useAppStore((s) => s.hydrated);

  useEffect(() => {
    if (hydrated && !authEmail) router.replace('/entrar');
  }, [hydrated, authEmail, router]);

  const { data: solApi, loading, error } = useAsync(() => getRequest(id), [id]);
  const [sol, setSol] = useState<SolicitacaoRequest | null>(null);
  useEffect(() => { if (solApi) setSol(solApi); }, [solApi]);

  const [cancelando, setCancelando] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelMotivo, setCancelMotivo] = useState('');
  const [respondendoCancel, setRespondendoCancel] = useState(false);

  if (loading) return (
    <div className="portal-screen">
      <PortalNav />
      <div className="portal-body">
        <div className="empty">
          <Icon name="signal" size={32} />
          <h3>Carregando…</h3>
        </div>
      </div>
    </div>
  );

  if (error || !sol) return (
    <div className="portal-screen">
      <PortalNav />
      <div className="portal-body">
        <div className="empty">
          <Icon name="search" size={32} />
          <h3>Solicitação não encontrada</h3>
          <p>Verifique o número ou volte ao portal.</p>
        </div>
        <button className="back-link" onClick={() => router.push('/portal')}>
          <Icon name="back" size={15} /> Voltar ao portal
        </button>
      </div>
    </div>
  );

  const currentStep = STATUS_ORDER[sol.status];

  const baixarPdf = async () => {
    setPdfLoading(true);
    try { await gerarPdfSolicitacao(sol); } finally { setPdfLoading(false); }
  };

  const confirmarCancelamento = async () => {
    if (cancelando || !cancelMotivo.trim()) return;
    setCancelando(true);
    try {
      const updated = await solicitarCancelamento(sol.id, cancelMotivo.trim());
      setSol(updated);
      setCancelModal(false);
      setCancelMotivo('');
    } catch (e) {
      console.error(e);
    } finally {
      setCancelando(false);
    }
  };

  const responderPedidoCancelamento = async (aceitar: boolean) => {
    if (respondendoCancel) return;
    setRespondendoCancel(true);
    try {
      const updated = await responderCancelamento(sol.id, aceitar);
      setSol(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setRespondendoCancel(false);
    }
  };

  return (
    <div className="portal-screen">
      <PortalNav />
      <div className="portal-body">

        <button className="back-link" onClick={() => router.push('/portal')}>
          <Icon name="back" size={16} /> Voltar ao portal
        </button>

        <header className="portal-head sol-head">
          <div>
            <div className="sol-id-row">
              <span className="sol-id">{sol.id}</span>
              <TypePill tipo={sol.tipo} />
              <StatusPill status={sol.status} />
            </div>
            <h1>{typeLabel(sol.tipo)}</h1>
            <p className="muted">Enviada {sol.quando}</p>
          </div>
          <div className="portal-head-actions">
            <button className="btn-ghost sm" onClick={baixarPdf} disabled={pdfLoading}>
              <Icon name="file" size={14} /> {pdfLoading ? 'Gerando…' : 'Exportar PDF'}
            </button>
            <button className="btn-ghost sm" onClick={() => gerarExcelSolicitacao(sol)}>
              <Icon name="list" size={14} /> Exportar Excel
            </button>
            {sol.status === 'respondida' && (
              <a className="btn-primary sm" href={'mailto:' + sol.email}>
                <Icon name="mail" size={14} /> Responder proposta
              </a>
            )}
          </div>
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
              <span>O parceiro <strong>declineu</strong> esta solicitação.</span>
            </div>
          </div>
        )}

        {/* Pedido de cancelamento pendente — quem pediu só acompanha; a
            outra parte decide aceitar ou manter a solicitação. */}
        {sol.cancelamento?.status === 'pendente' && (
          <div className="sol-terminal-banner pending">
            <div className="sol-banner-main">
              <div className="sol-banner-row">
                <Icon name="signal" size={16} stroke={2} />
                <span>
                  {sol.cancelamento.solicitadoPor === 'contratante' ? (
                    <>Você solicitou o cancelamento. Aguardando confirmação de <strong>{sol.prestador}</strong>.</>
                  ) : (
                    <><strong>{sol.prestador}</strong> pediu para cancelar esta solicitação.</>
                  )}
                  <span className="sol-banner-when"> · {sol.cancelamento.em}</span>
                </span>
              </div>
              <div className="sol-banner-obs">
                <span className="sol-banner-obs-label">Motivo informado:</span> {sol.cancelamento.motivo}
              </div>
            </div>
            {sol.cancelamento.solicitadoPor !== 'contratante' && (
              <div className="sol-banner-actions">
                <button
                  className="btn-ghost sm"
                  disabled={respondendoCancel}
                  onClick={() => responderPedidoCancelamento(false)}
                >
                  Manter solicitação
                </button>
                <button
                  className="btn-primary sm"
                  disabled={respondendoCancel}
                  onClick={() => responderPedidoCancelamento(true)}
                >
                  {respondendoCancel ? 'Enviando…' : 'Aceitar cancelamento'}
                </button>
              </div>
            )}
          </div>
        )}

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

            <div className="sol-card">
              <h3 className="sol-card-title">
                <Icon name="file" size={16} /> Minha solicitação
              </h3>
              <div className="sol-info-grid">
                <div className="sol-info-item">
                  <span className="sol-info-label">Tipo</span>
                  <span className="sol-info-val">{typeLabel(sol.tipo)}</span>
                </div>
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

            <div className="sol-card">
              <h3 className="sol-card-title">
                <Icon name="users" size={16} /> Contato
              </h3>
              <div className="sol-info-grid">
                <div className="sol-info-item">
                  <span className="sol-info-label">E-mail</span>
                  <a className="sol-info-val link" href={'mailto:' + sol.email}>
                    {sol.email}
                  </a>
                </div>
                <div className="sol-info-item">
                  <span className="sol-info-label">Telefone</span>
                  <a className="sol-info-val link" href={'tel:' + sol.phone.replace(/\D/g, '')}>
                    {sol.phone}
                  </a>
                </div>
              </div>
            </div>

          </div>

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
                      : 'O parceiro declineu esta solicitação.')}
                </p>
              </div>
              {/* Cancelamento: disponível mesmo com a solicitação já
                  respondida/fechada — só que aí precisa da confirmação do
                  parceiro. */}
              {sol.status !== 'cancelada' && sol.status !== 'declinada' && (
                <>
                  <div className="sol-status-sep" />
                  {sol.cancelamento?.status === 'pendente' ? (
                    <p className="sol-status-desc">Pedido de cancelamento em análise.</p>
                  ) : (
                    <button
                      className="sol-status-btn danger"
                      onClick={() => setCancelModal(true)}
                      disabled={cancelando}
                    >
                      {cancelando ? 'Enviando…' : 'Cancelar solicitação'}
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="sol-card">
              <h3 className="sol-card-title">
                <Icon name="search" size={16} /> Mais opções
              </h3>
              <div className="sol-status-btns">
                <button className="sol-status-btn" onClick={() => router.push('/buscar')}>
                  <Icon name="search" size={14} /> Buscar parceiros similares
                </button>
                <a className="sol-status-btn" href={'mailto:' + sol.email}>
                  <Icon name="mail" size={14} /> Enviar e-mail ao parceiro
                </a>
              </div>
            </div>
          </aside>
        </div>

      </div>

      {/* Modal de pedido de cancelamento */}
      {cancelModal && (
        <div className="sol-modal-overlay" onClick={() => !cancelando && setCancelModal(false)}>
          <div className="sol-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sol-modal-icon warn">
              <Icon name="close" size={24} stroke={2.4} />
            </div>
            <h2 className="sol-modal-title">Cancelar solicitação</h2>
            <p className="sol-modal-desc">
              {sol.status === 'respondida' || sol.status === 'fechada' ? (
                <>Como <strong>{sol.prestador}</strong> já respondeu, o cancelamento fica pendente até o
                  parceiro confirmar.</>
              ) : (
                <>O parceiro ainda não respondeu, então o cancelamento é efetivado na hora.</>
              )}
            </p>
            <div className="sol-modal-field">
              <label className="sol-modal-label">Motivo do cancelamento</label>
              <textarea
                className="sol-modal-textarea"
                rows={3}
                value={cancelMotivo}
                onChange={(e) => setCancelMotivo(e.target.value)}
                placeholder="Explique por que está cancelando esta solicitação…"
              />
            </div>
            <div className="sol-modal-actions">
              <button className="btn-ghost" onClick={() => setCancelModal(false)} disabled={cancelando}>
                Voltar
              </button>
              <button
                className="btn-danger"
                onClick={confirmarCancelamento}
                disabled={cancelando || !cancelMotivo.trim()}
              >
                {cancelando ? 'Enviando…' : 'Confirmar cancelamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
