'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getRequests, updateRequestStatus, updateRequestContract } from '../../../../lib/services';
import { useAsync } from '../../../../lib/useAsync';
import { useAppStore } from '../../../../lib/store';
import { typeLabel } from '../../../../data/reference';
import type { RequestStatus, ContratoInfo } from '../../../../data/types';
import { Icon } from '../../../../lib/icons';
import { PortalNav } from '../../../../components/PortalNav';
import { StatusPill, TypePill } from '../../../../components/Pills';
import { Loading, LoadError } from '../../../../components/AsyncState';

const STATUS_STEPS: { id: RequestStatus; label: string }[] = [
  { id: 'nova', label: 'Nova' },
  { id: 'andamento', label: 'Em andamento' },
  { id: 'respondida', label: 'Respondida' },
  { id: 'fechada', label: 'Fechada' },
];

const TERMINAL_NEGATIVE: RequestStatus[] = ['cancelada', 'declinada'];

const STATUS_ORDER: Record<RequestStatus, number> = {
  nova: 0, andamento: 1, respondida: 2, fechada: 3, cancelada: -1, declinada: -1,
};

const EMPTY_CONTRATO: ContratoInfo = { assinado: false, numero: '', valor: '', inicio: '', validade: '' };

export default function SolicitacaoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const authEmail = useAppStore((s) => s.authEmail);

  useEffect(() => {
    if (!authEmail) router.replace('/entrar');
  }, [authEmail, router]);

  const { data: all, loading, error } = useAsync(() => getRequests(), []);
  const [req, setReq] = useState(all?.find((r) => r.id === id) ?? null);

  useEffect(() => {
    if (all) {
      const found = all.find((r) => r.id === id) ?? null;
      setReq(found);
      if (found?.contrato) setContrato({ ...EMPTY_CONTRATO, ...found.contrato });
    }
  }, [all, id]);

  const [changingStatus, setChangingStatus] = useState(false);
  const [contrato, setContrato] = useState<ContratoInfo>({ ...EMPTY_CONTRATO });
  const [savingContrato, setSavingContrato] = useState(false);
  const [contratoSaved, setContratoSaved] = useState(false);
  const [declinaModal, setDeclinaModal] = useState(false);
  const [declinaObs, setDeclinaObs] = useState('');

  const setC = (k: keyof ContratoInfo, v: string | boolean) =>
    setContrato((prev) => ({ ...prev, [k]: v }));

  const changeStatus = async (s: RequestStatus, obs?: string) => {
    if (!req || changingStatus) return;
    setChangingStatus(true);
    try {
      const updated = await updateRequestStatus(req.id, s, obs);
      setReq(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setChangingStatus(false);
    }
  };

  const confirmarDeclinar = async () => {
    const obs = declinaObs.trim() || undefined;
    setDeclinaModal(false);
    setChangingStatus(true);
    try {
      const updated = await updateRequestStatus(req!.id, 'declinada', obs);
      setReq({ ...updated, declinaObs: obs, declinadoEm: new Date().toLocaleDateString('pt-BR') });
    } catch (e) {
      console.error(e);
      setReq((prev) => prev ? { ...prev, status: 'declinada', declinaObs: obs, declinadoEm: new Date().toLocaleDateString('pt-BR') } : prev);
    } finally {
      setChangingStatus(false);
      setDeclinaObs('');
    }
  };

  const saveContrato = async () => {
    if (!req || savingContrato) return;
    setSavingContrato(true);
    try {
      const updated = await updateRequestContract(req.id, contrato);
      setReq(updated);
    } catch {
      setReq((prev) => prev ? { ...prev, contrato } : prev);
    } finally {
      setSavingContrato(false);
      setContratoSaved(true);
      setTimeout(() => setContratoSaved(false), 2500);
    }
  };

  if (loading) return (
    <div className="portal-screen">
      <PortalNav />
      <div className="portal-body"><Loading label="Carregando solicitação…" /></div>
    </div>
  );

  if (error || !req) return (
    <div className="portal-screen">
      <PortalNav />
      <div className="portal-body">
        <LoadError message={error ?? 'Solicitação não encontrada.'} />
        <button className="btn-ghost" onClick={() => router.push('/portal')}>
          <Icon name="back" size={15} /> Voltar
        </button>
      </div>
    </div>
  );

  const currentStep = STATUS_ORDER[req.status];

  return (
    <div className="portal-screen">
      <PortalNav />
      <div className="portal-body">

        <button className="back-link" onClick={() => router.push('/portal')}>
          <Icon name="back" size={16} /> Voltar às solicitações
        </button>

        <header className="portal-head sol-head">
          <div>
            <div className="sol-id-row">
              <span className="sol-id">{req.id}</span>
              <TypePill tipo={req.tipo} />
              <StatusPill status={req.status} />
            </div>
            <h1>{typeLabel(req.tipo)} de {req.organizacao}</h1>
            <p className="muted">Recebida em {req.quando} · {req.prestador}</p>
          </div>
          <a className="btn-primary sm" href={'mailto:' + req.email}>
            <Icon name="phone" size={14} /> Responder por e-mail
          </a>
        </header>

        {/* Banner para status terminais negativos */}
        {req.status === 'cancelada' && (
          <div className="sol-terminal-banner canceled">
            <div className="sol-banner-row">
              <Icon name="close" size={16} stroke={2.4} />
              <span>Esta solicitação foi <strong>cancelada</strong>. Você ainda pode reabri-la alterando o status.</span>
            </div>
          </div>
        )}
        {req.status === 'declinada' && (
          <div className="sol-terminal-banner pending">
            <div className="sol-banner-main">
              <div className="sol-banner-row">
                <Icon name="signal" size={16} stroke={2} />
                <span>
                  Declínio enviado — aguardando confirmação de{' '}
                  <strong>{req.organizacao}</strong> para aceitar.
                  {req.declinadoEm && <span className="sol-banner-when"> · {req.declinadoEm}</span>}
                </span>
              </div>
              {req.declinaObs && (
                <div className="sol-banner-obs">
                  <span className="sol-banner-obs-label">Motivo informado:</span> {req.declinaObs}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status stepper */}
        <div className={'sol-stepper' + (TERMINAL_NEGATIVE.includes(req.status) ? ' dimmed' : '')}>
          {STATUS_STEPS.map((step, i) => {
            const done = STATUS_ORDER[req.status] > i;
            const active = req.status === step.id;
            const reachable = i <= currentStep + 1 && !done && !active;
            return (
              <button
                key={step.id}
                className={'sol-step' + (active ? ' active' : '') + (done ? ' done' : '')}
                onClick={() => reachable || active ? undefined : changeStatus(step.id)}
                disabled={changingStatus || done || active}
                title={done || active ? undefined : `Marcar como ${step.label}`}
              >
                <span className="sol-step-dot">
                  {done ? <Icon name="check" size={13} stroke={3} /> : i + 1}
                </span>
                <span className="sol-step-label">{step.label}</span>
                {i < STATUS_STEPS.length - 1 && <span className="sol-step-line" />}
              </button>
            );
          })}
        </div>

        <div className="sol-grid">
          <div className="sol-main">

            {/* Dados do solicitante */}
            <div className="sol-card">
              <h3 className="sol-card-title">
                <Icon name="users" size={16} /> Solicitante
              </h3>
              <div className="sol-info-grid">
                <div className="sol-info-item">
                  <span className="sol-info-label">Nome</span>
                  <span className="sol-info-val">{req.solicitante}</span>
                </div>
                <div className="sol-info-item">
                  <span className="sol-info-label">Cargo</span>
                  <span className="sol-info-val">{req.cargo || '—'}</span>
                </div>
                <div className="sol-info-item">
                  <span className="sol-info-label">Organização</span>
                  <span className="sol-info-val">{req.organizacao}</span>
                </div>
                <div className="sol-info-item">
                  <span className="sol-info-label">Localização</span>
                  <span className="sol-info-val">{req.cidade} · {req.uf}</span>
                </div>
                <div className="sol-info-item">
                  <span className="sol-info-label">E-mail</span>
                  <a className="sol-info-val link" href={'mailto:' + req.email}>{req.email}</a>
                </div>
                <div className="sol-info-item">
                  <span className="sol-info-label">Telefone</span>
                  <span className="sol-info-val">{req.phone}</span>
                </div>
              </div>
            </div>

            {/* Detalhes da solicitação */}
            <div className="sol-card">
              <h3 className="sol-card-title">
                <Icon name="file" size={16} /> Detalhes da solicitação
              </h3>
              <div className="sol-info-grid">
                {req.servico && (
                  <div className="sol-info-item">
                    <span className="sol-info-label">Serviço</span>
                    <span className="sol-info-val">{req.servico}</span>
                  </div>
                )}
                {req.prazo && (
                  <div className="sol-info-item">
                    <span className="sol-info-label">Prazo desejado</span>
                    <span className="sol-info-val">{req.prazo}</span>
                  </div>
                )}
              </div>
              <div className="sol-resumo">
                <span className="sol-info-label">Descrição</span>
                <p>{req.resumo}</p>
              </div>
            </div>

          </div>

          {/* Sidebar: contrato */}
          <aside className="sol-side">
            <div className="sol-card">
              <h3 className="sol-card-title">
                <Icon name="shield2" size={16} /> Contrato
              </h3>

              <label className={'sol-toggle' + (contrato.assinado ? ' on' : '')}>
                <input
                  type="checkbox"
                  checked={contrato.assinado}
                  onChange={(e) => setC('assinado', e.target.checked)}
                />
                <span className="sol-toggle-track">
                  <span className="sol-toggle-thumb" />
                </span>
                <span className="sol-toggle-label">
                  {contrato.assinado ? 'Contrato assinado' : 'Contrato não assinado'}
                </span>
              </label>

              {contrato.assinado && (
                <div className="sol-contrato-fields">
                  <div className="reg-field">
                    <span className="reg-label">Nº do contrato</span>
                    <input
                      value={contrato.numero ?? ''}
                      onChange={(e) => setC('numero', e.target.value)}
                      placeholder="Ex: CTR-2026-0042"
                    />
                  </div>
                  <div className="reg-field">
                    <span className="reg-label">Valor</span>
                    <input
                      value={contrato.valor ?? ''}
                      onChange={(e) => setC('valor', e.target.value)}
                      placeholder="Ex: R$ 12.500,00"
                    />
                  </div>
                  <div className="reg-row2">
                    <div className="reg-field">
                      <span className="reg-label">Início</span>
                      <input
                        type="date"
                        value={contrato.inicio ?? ''}
                        onChange={(e) => setC('inicio', e.target.value)}
                      />
                    </div>
                    <div className="reg-field">
                      <span className="reg-label">Validade</span>
                      <input
                        type="date"
                        value={contrato.validade ?? ''}
                        onChange={(e) => setC('validade', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                className={'btn-primary block mt' + (contratoSaved ? ' saved' : '')}
                onClick={saveContrato}
                disabled={savingContrato}
              >
                {contratoSaved
                  ? <><Icon name="check" size={15} stroke={2.5} /> Salvo</>
                  : savingContrato
                  ? 'Salvando…'
                  : 'Salvar contrato'}
              </button>
            </div>

            <div className="sol-card">
              <h3 className="sol-card-title">
                <Icon name="signal" size={16} /> Alterar status
              </h3>
              {req.status === 'fechada' ? (
                <div className="sol-finalizado">
                  <Icon name="check" size={18} stroke={2.6} />
                  <div>
                    <strong>Finalizado</strong>
                    <span>Esta solicitação foi encerrada.</span>
                  </div>
                </div>
              ) : (
                <div className="sol-status-btns">
                  {STATUS_STEPS.map((step) => (
                    <button
                      key={step.id}
                      className={'sol-status-btn' + (req.status === step.id ? ' active' : '')}
                      onClick={() => changeStatus(step.id)}
                      disabled={changingStatus || req.status === step.id}
                    >
                      {req.status === step.id && <Icon name="check" size={13} stroke={3} />}
                      {step.label}
                    </button>
                  ))}
                  <div className="sol-status-sep" />
                  <button
                    className={'sol-status-btn warn' + (req.status === 'declinada' ? ' active' : '')}
                    onClick={() => req.status !== 'declinada' && setDeclinaModal(true)}
                    disabled={changingStatus || req.status === 'declinada'}
                  >
                    {req.status === 'declinada' && <Icon name="check" size={13} stroke={3} />}
                    Declinar
                  </button>
                  <button
                    className={'sol-status-btn danger' + (req.status === 'cancelada' ? ' active' : '')}
                    onClick={() => changeStatus('cancelada')}
                    disabled={changingStatus || req.status === 'cancelada'}
                  >
                    {req.status === 'cancelada' && <Icon name="check" size={13} stroke={3} />}
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Modal de confirmação de declínio */}
      {declinaModal && (
        <div className="sol-modal-overlay" onClick={() => setDeclinaModal(false)}>
          <div className="sol-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sol-modal-icon warn">
              <Icon name="close" size={24} stroke={2.4} />
            </div>
            <h2 className="sol-modal-title">Declinar solicitação?</h2>
            <p className="sol-modal-desc">
              Tem certeza que deseja declinar a solicitação de{' '}
              <strong>{req.organizacao}</strong>? O solicitante será notificado sobre o declínio.
            </p>
            <div className="sol-modal-field">
              <label className="sol-modal-label">Observação <span className="sol-modal-opt">(opcional)</span></label>
              <textarea
                className="sol-modal-textarea"
                rows={3}
                value={declinaObs}
                onChange={(e) => setDeclinaObs(e.target.value)}
                placeholder="Informe o motivo do declínio ou orientações ao solicitante…"
              />
            </div>
            <div className="sol-modal-actions">
              <button className="btn-ghost" onClick={() => setDeclinaModal(false)}>
                Voltar
              </button>
              <button className="btn-danger" onClick={confirmarDeclinar} disabled={changingStatus}>
                {changingStatus ? 'Declinando…' : 'Confirmar declínio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
