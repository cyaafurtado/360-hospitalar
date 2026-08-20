'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '../../../../lib/store';
import { typeLabel, segmentLabel } from '../../../../data/reference';
import { EXEMPLOS_PAINEL } from '../../../../data/exemplos-painel';
import type { RequestStatus } from '../../../../data/types';
import { Icon, ICON_PATHS } from '../../../../lib/icons';
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

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;
  return (
    <div className="sol-star-picker" role="radiogroup" aria-label="Avaliação de satisfação, de 1 a 5 estrelas">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} de 5 estrelas`}
          className={'sol-star-btn' + (n <= display ? ' filled' : '')}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
        >
          <svg width={26} height={26} viewBox="0 0 24 24" fill={n <= display ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5}>
            <path d={ICON_PATHS.star} />
          </svg>
        </button>
      ))}
    </div>
  );
}

function StarsReadOnly({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="sol-stars-readonly" aria-label={`${value} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width={size} height={size} viewBox="0 0 24 24" fill={n <= value ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.4}>
          <path d={ICON_PATHS.star} />
        </svg>
      ))}
    </span>
  );
}

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
  const [avaliacao, setAvaliacao] = useState(0);
  const [encerrando, setEncerrando] = useState(false);
  const [cancelarModal, setCancelarModal] = useState(false);
  const [cancelResultado, setCancelResultado] = useState<'positivo' | 'negativo' | null>(null);
  const [cancelMotivo, setCancelMotivo] = useState('');

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

  const fecharModalCancelar = () => {
    if (cancelando) return;
    setCancelarModal(false);
    setCancelResultado(null);
    setCancelMotivo('');
  };

  const confirmarCancelamento = () => {
    if (cancelando || cancelResultado === null || !cancelMotivo.trim()) return;
    setCancelando(true);
    setTimeout(() => {
      setSol((prev) => prev ? {
        ...prev,
        status: 'cancelada',
        cancelResultado,
        cancelMotivo: cancelMotivo.trim(),
        canceladoEm: new Date().toLocaleDateString('pt-BR'),
      } : prev);
      setCancelando(false);
      setCancelado(true);
      setCancelarModal(false);
    }, 600);
  };

  const fecharModalEncerrar = () => {
    if (encerrando) return;
    setEncerrarModal(false);
    setAprovada(null);
    setAvaliacao(0);
  };

  const confirmarEncerramento = () => {
    if (aprovada === null || avaliacao === 0 || encerrando) return;
    setEncerrando(true);
    setTimeout(() => {
      setSol((prev) => prev ? {
        ...prev,
        status: 'fechada',
        resultado: aprovada ? 'aprovada' : 'nao-aprovada',
        avaliacaoPrestador: avaliacao,
        encerradaEm: new Date().toLocaleDateString('pt-BR'),
      } : prev);
      setEncerrando(false);
      setEncerrarModal(false);
      setAprovada(null);
      setAvaliacao(0);
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
            <div className="sol-banner-main">
              <div className="sol-banner-row">
                <Icon name="close" size={16} stroke={2.4} />
                <span>
                  Esta solicitação foi <strong>cancelada</strong>
                  {sol.cancelResultado === 'positivo' && ' — atendimento concluído de forma positiva'}
                  {sol.cancelResultado === 'negativo' && ' — atendimento concluído de forma negativa'}
                  {sol.canceladoEm ? ` em ${sol.canceladoEm}` : ''}.
                </span>
              </div>
              {sol.cancelMotivo && (
                <div className="sol-banner-obs">
                  <span className="sol-banner-obs-label">Motivo informado:</span> {sol.cancelMotivo}
                </div>
              )}
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
            <div className="sol-banner-main">
              <div className="sol-banner-row">
                <Icon name="check" size={16} stroke={2.4} />
                <span>
                  Cotação encerrada — proposta <strong>aprovada</strong> e venda concluída
                  {sol.encerradaEm ? ` em ${sol.encerradaEm}` : ''}.
                </span>
              </div>
              {!!sol.avaliacaoPrestador && (
                <div className="sol-banner-obs">
                  <span className="sol-banner-obs-label">Sua avaliação do fornecedor:</span>{' '}
                  <StarsReadOnly value={sol.avaliacaoPrestador} /> ({sol.avaliacaoPrestador}/5)
                </div>
              )}
            </div>
          </div>
        )}
        {sol.status === 'fechada' && sol.resultado === 'nao-aprovada' && (
          <div className="sol-terminal-banner warn">
            <div className="sol-banner-main">
              <div className="sol-banner-row">
                <Icon name="close" size={16} stroke={2.4} />
                <span>
                  Cotação encerrada — proposta <strong>não aprovada</strong>, sem venda concluída
                  {sol.encerradaEm ? ` em ${sol.encerradaEm}` : ''}.
                </span>
              </div>
              {!!sol.avaliacaoPrestador && (
                <div className="sol-banner-obs">
                  <span className="sol-banner-obs-label">Sua avaliação do fornecedor:</span>{' '}
                  <StarsReadOnly value={sol.avaliacaoPrestador} /> ({sol.avaliacaoPrestador}/5)
                </div>
              )}
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
                    onClick={() => setCancelarModal(true)}
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
            <div className="sol-modal-field">
              <label className="sol-modal-label">
                Como você avalia o atendimento do fornecedor? <span className="sol-modal-opt">(satisfação)</span>
              </label>
              <StarPicker value={avaliacao} onChange={setAvaliacao} />
            </div>
            <div className="sol-modal-actions">
              <button className="btn-ghost" onClick={fecharModalEncerrar} disabled={encerrando}>
                Voltar
              </button>
              <button
                className="btn-primary"
                onClick={confirmarEncerramento}
                disabled={encerrando || aprovada === null || avaliacao === 0}
              >
                {encerrando ? 'Encerrando…' : 'Confirmar encerramento'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de cancelamento da solicitação */}
      {cancelarModal && (
        <div className="sol-modal-overlay" onClick={fecharModalCancelar}>
          <div className="sol-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sol-modal-icon warn">
              <Icon name="close" size={24} stroke={2.4} />
            </div>
            <h2 className="sol-modal-title">Cancelar solicitação</h2>
            <p className="sol-modal-desc">
              Antes de cancelar, conte como ficou o atendimento com <strong>{sol.prestador}</strong> —
              isso ajuda a manter o histórico da plataforma.
            </p>
            <div className="sol-modal-field">
              <label className="sol-modal-label">O serviço foi concluído de forma positiva ou negativa?</label>
              <div className="sol-status-btns">
                <button
                  type="button"
                  className={'sol-status-btn' + (cancelResultado === 'positivo' ? ' active' : '')}
                  onClick={() => setCancelResultado('positivo')}
                >
                  {cancelResultado === 'positivo' && <Icon name="check" size={13} stroke={3} />}
                  Positivo — foi resolvido de outra forma
                </button>
                <button
                  type="button"
                  className={'sol-status-btn danger' + (cancelResultado === 'negativo' ? ' active' : '')}
                  onClick={() => setCancelResultado('negativo')}
                >
                  {cancelResultado === 'negativo' && <Icon name="check" size={13} stroke={3} />}
                  Negativo — não foi resolvido
                </button>
              </div>
            </div>
            <div className="sol-modal-field">
              <label className="sol-modal-label">Motivo do encerramento</label>
              <textarea
                className="sol-modal-textarea"
                rows={3}
                value={cancelMotivo}
                onChange={(e) => setCancelMotivo(e.target.value)}
                placeholder="Explique por que está encerrando esta solicitação na plataforma…"
              />
            </div>
            <div className="sol-modal-actions">
              <button className="btn-ghost" onClick={fecharModalCancelar} disabled={cancelando}>
                Voltar
              </button>
              <button
                className="btn-danger"
                onClick={confirmarCancelamento}
                disabled={cancelando || cancelResultado === null || !cancelMotivo.trim()}
              >
                {cancelando ? 'Cancelando…' : 'Confirmar cancelamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
