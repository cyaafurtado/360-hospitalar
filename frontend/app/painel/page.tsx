'use client';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../../lib/store';
import { Icon } from '../../lib/icons';
import { PainelNav } from '../../components/PainelNav';
import { StatusPill, TypePill } from '../../components/Pills';
import { segmentLabel } from '../../data/reference';
import type { RequestStatus, RequestType } from '../../data/types';

type SolEnviada = {
  id: string;
  prestador: string;
  segmento: string;
  tipo: RequestType;
  status: RequestStatus;
  servico: string;
  quando: string;
  resumo: string;
  contato?: string;
};

const EXEMPLOS: SolEnviada[] = [
  {
    id: 'SOL-0041',
    prestador: 'MedSafe Esterilização Ltda',
    segmento: 'esteril',
    tipo: 'cotacao',
    status: 'respondida',
    servico: 'Esterilização de instrumentais cirúrgicos',
    quando: 'há 2 dias',
    resumo: 'Cotação para esterilização semanal de 800 instrumentais cirúrgicos. Interesse em contrato anual com coleta e entrega.',
    contato: '(11) 3344-5566',
  },
  {
    id: 'SOL-0039',
    prestador: 'AirMed Gases Medicinais',
    segmento: 'gases',
    tipo: 'cotacao',
    status: 'andamento',
    servico: 'Fornecimento de oxigênio medicinal',
    quando: 'há 4 dias',
    resumo: 'Fornecimento contínuo de O₂ medicinal para 12 leitos de UTI. Necessidade de monitoramento remoto e atendimento 24h.',
    contato: '(11) 2255-8800',
  },
  {
    id: 'SOL-0037',
    prestador: 'MedSys Tecnologia em Saúde',
    segmento: 'ti',
    tipo: 'contato',
    status: 'nova',
    servico: 'Software de gestão hospitalar',
    quando: 'há 5 dias',
    resumo: 'Interesse em conhecer a solução de prontuário eletrônico com agendamento integrado e módulo de faturamento TISS.',
    contato: '(11) 4002-8922',
  },
  {
    id: 'SOL-0034',
    prestador: 'DiagPro Equipamentos Médicos',
    segmento: 'equip',
    tipo: 'cotacao',
    status: 'respondida',
    servico: 'Equipamentos de diagnóstico por imagem',
    quando: 'há 8 dias',
    resumo: 'Cotação de 2 ultrassônicos portáteis modelo institucional e contrato de manutenção preventiva anual.',
    contato: '(21) 3322-1100',
  },
  {
    id: 'SOL-0031',
    prestador: 'LavClean Hospitalar',
    segmento: 'lavanderia',
    tipo: 'parceria',
    status: 'fechada',
    servico: 'Lavanderia hospitalar terceirizada',
    quando: 'há 12 dias',
    resumo: 'Terceirização completa de lavanderia — enxoval (500 kg/dia), uniformes e roupas cirúrgicas. Contrato de 24 meses assinado.',
    contato: '(11) 3377-4400',
  },
  {
    id: 'SOL-0028',
    prestador: 'ProClean Higiene Hospitalar',
    segmento: 'limpeza',
    tipo: 'cotacao',
    status: 'nova',
    servico: 'Saneantes e materiais de higiene',
    quando: 'há 14 dias',
    resumo: 'Fornecimento mensal de saneantes, desinfetantes ANVISA e materiais de limpeza para 3 andares e centro cirúrgico.',
    contato: '(11) 3300-5500',
  },
  {
    id: 'SOL-0025',
    prestador: 'CapacitaSaúde Treinamentos',
    segmento: 'treinamento',
    tipo: 'contato',
    status: 'andamento',
    servico: 'Treinamento em biossegurança NR-32',
    quando: 'há 18 dias',
    resumo: 'Capacitação de 45 colaboradores em NR-32, biossegurança hospitalar e gestão de resíduos de serviços de saúde (RSS).',
    contato: '(11) 4003-7800',
  },
];

export default function PainelPage() {
  const router = useRouter();
  const authEmail = useAppStore((s) => s.authEmail);
  const [openId, setOpenId] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<'' | RequestStatus>('');
  const [q, setQ] = useState('');

  useEffect(() => {
    if (!authEmail) router.replace('/entrar');
  }, [authEmail, router]);

  const rows = useMemo(
    () =>
      EXEMPLOS.filter((r) => {
        if (filtroStatus && r.status !== filtroStatus) return false;
        if (q.trim()) {
          const h = (r.prestador + ' ' + r.servico + ' ' + r.id).toLowerCase();
          if (!h.includes(q.toLowerCase())) return false;
        }
        return true;
      }),
    [filtroStatus, q]
  );

  const stats = useMemo(
    () => ({
      total: EXEMPLOS.length,
      aguardando: EXEMPLOS.filter((r) => r.status === 'nova' || r.status === 'andamento').length,
      respondidas: EXEMPLOS.filter((r) => r.status === 'respondida').length,
      fornecedores: new Set(EXEMPLOS.map((r) => r.prestador)).size,
    }),
    []
  );

  return (
    <div className="portal-screen">
      <PainelNav />
      <div className="portal-body">
        <header className="portal-head">
          <div>
            <h1>Minhas solicitações</h1>
            <p className="muted">Acompanhe os pedidos de cotação e contato enviados a fornecedores.</p>
          </div>
          <button className="btn-primary" onClick={() => router.push('/buscar')}>
            <Icon name="search" size={16} /> Buscar fornecedores
          </button>
        </header>

        <div className="stat-grid">
          <div className="stat-card">
            <span className="stat-ico tone-blue"><Icon name="file" size={20} /></span>
            <div><div className="stat-num">{stats.total}</div><div className="stat-lbl">Solicitações enviadas</div></div>
          </div>
          <div className="stat-card">
            <span className="stat-ico tone-amber"><Icon name="clock" size={20} /></span>
            <div><div className="stat-num">{stats.aguardando}</div><div className="stat-lbl">Aguardando resposta</div></div>
          </div>
          <div className="stat-card">
            <span className="stat-ico tone-green"><Icon name="check" size={20} stroke={2.4} /></span>
            <div><div className="stat-num">{stats.respondidas}</div><div className="stat-lbl">Respondidas</div></div>
          </div>
          <div className="stat-card">
            <span className="stat-ico tone-violet"><Icon name="users" size={20} /></span>
            <div><div className="stat-num">{stats.fornecedores}</div><div className="stat-lbl">Fornecedores contatados</div></div>
          </div>
        </div>

        <div className="portal-filters">
          <div className="pf-search">
            <Icon name="search" size={17} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por fornecedor, serviço ou nº…"
            />
          </div>
          <div className="pf-select">
            <span>Status</span>
            <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value as '' | RequestStatus)}>
              <option value="">Todos</option>
              <option value="nova">Nova</option>
              <option value="andamento">Em andamento</option>
              <option value="respondida">Respondida</option>
              <option value="fechada">Fechada</option>
            </select>
          </div>
          {(filtroStatus || q) && (
            <button className="pf-clear" onClick={() => { setFiltroStatus(''); setQ(''); }}>
              Limpar
            </button>
          )}
        </div>

        <div className="table-wrap">
          <table className="req-table">
            <thead>
              <tr>
                <th>Fornecedor</th>
                <th>Segmento</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Serviço</th>
                <th>Data</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <Fragment key={r.id}>
                  <tr
                    className={openId === r.id ? 'row-open' : ''}
                    onClick={() => setOpenId(openId === r.id ? null : r.id)}
                  >
                    <td>
                      <div className="cell-strong">{r.prestador}</div>
                      <div className="cell-sub">{r.id}</div>
                    </td>
                    <td className="cell-muted">{segmentLabel(r.segmento)}</td>
                    <td><TypePill tipo={r.tipo} /></td>
                    <td><StatusPill status={r.status} /></td>
                    <td>{r.servico}</td>
                    <td className="cell-sub">{r.quando}</td>
                    <td>
                      <button className="row-toggle" aria-label="Detalhes">
                        <Icon name={openId === r.id ? 'close' : 'arrow'} size={15} />
                      </button>
                    </td>
                  </tr>
                  {openId === r.id && (
                    <tr className="detail-row">
                      <td colSpan={7}>
                        <div className="req-detail">
                          <div className="req-detail-main">
                            <span className="req-detail-id">{r.id}</span>
                            <p>{r.resumo}</p>
                          </div>
                          <div className="req-detail-actions">
                            {r.contato && (
                              <a className="btn-primary sm" href={'tel:' + r.contato.replace(/\D/g, '')}>
                                <Icon name="phone" size={14} /> {r.contato}
                              </a>
                            )}
                            <button
                              className="btn-ghost sm"
                              onClick={() => router.push('/buscar')}
                            >
                              <Icon name="search" size={14} /> Ver fornecedores similares
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="empty">
              <Icon name="search" size={32} />
              <h3>Nenhuma solicitação encontrada</h3>
              <p>Ajuste os filtros para ver mais resultados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
