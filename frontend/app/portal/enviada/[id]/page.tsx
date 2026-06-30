'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '../../../../lib/store';
import { typeLabel, segmentLabel } from '../../../../data/reference';
import { EXEMPLOS_ENVIADAS } from '../../../../data/exemplos-portal-enviadas';
import type { RequestStatus } from '../../../../data/types';
import { Icon } from '../../../../lib/icons';
import { PortalNav } from '../../../../components/PortalNav';
import { StatusPill, TypePill } from '../../../../components/Pills';

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

  useEffect(() => {
    if (!authEmail) router.replace('/entrar');
  }, [authEmail, router]);

  const original = EXEMPLOS_ENVIADAS.find((r) => r.id === id) ?? null;
  const [sol, setSol] = useState(original);
  const [cancelando, setCancelando] = useState(false);

  if (!sol) return (
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
  const isTerminal = sol.status === 'cancelada' || sol.status === 'declinada' || sol.status === 'fechada';

  const cancelar = () => {
    setCancelando(true);
    setTimeout(() => {
      setSol((prev) => prev ? { ...prev, status: 'cancelada' } : prev);
      setCancelando(false);
    }, 600);
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
            <h1>{typeLabel(sol.tipo)} — {sol.servico}</h1>
            <p className="muted">Enviada {sol.quando} · {segmentLabel(sol.segmento)}</p>
          </div>
          {sol.status === 'respondida' && (
            <a className="btn-primary sm" href={'mailto:' + sol.destinatarioEmail}>
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
              <span>O parceiro <strong>declineu</strong> esta solicitação.</span>
            </div>
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

            <div className="sol-card">
              <h3 className="sol-card-title">
                <Icon name="users" size={16} /> Parceiro / Destinatário
              </h3>
              <div className="sol-info-grid">
                <div className="sol-info-item">
                  <span className="sol-info-label">Empresa</span>
                  <span className="sol-info-val">{sol.destinatario}</span>
                </div>
                <div className="sol-info-item">
                  <span className="sol-info-label">Segmento</span>
                  <span className="sol-info-val">{segmentLabel(sol.segmento)}</span>
                </div>
                <div className="sol-info-item">
                  <span className="sol-info-label">Telefone</span>
                  <a className="sol-info-val link" href={'tel:' + sol.destinatarioContato.replace(/\D/g, '')}>
                    {sol.destinatarioContato}
                  </a>
                </div>
                <div className="sol-info-item">
                  <span className="sol-info-label">E-mail</span>
                  <a className="sol-info-val link" href={'mailto:' + sol.destinatarioEmail}>
                    {sol.destinatarioEmail}
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
              {!isTerminal && (
                <>
                  <div className="sol-status-sep" />
                  <button
                    className="sol-status-btn danger"
                    onClick={cancelar}
                    disabled={cancelando}
                  >
                    {cancelando ? 'Cancelando…' : 'Cancelar solicitação'}
                  </button>
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
                <a className="sol-status-btn" href={'mailto:' + sol.destinatarioEmail}>
                  <Icon name="mail" size={14} /> Enviar e-mail ao parceiro
                </a>
              </div>
            </div>
          </aside>
        </div>

      </div>
    </div>
  );
}
