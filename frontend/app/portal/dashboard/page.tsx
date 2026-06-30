'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useAppStore } from '../../../lib/store';
import { Icon } from '../../../lib/icons';
import { PortalNav } from '../../../components/PortalNav';
import {
  getDadosTemporal, getKPIs, getStatusDist, getSegmentosDist,
  PERIODOS, type Periodo,
} from '../../../data/dashboard-mock';

const PRIMARY = '#2259C1';
const ACCENT  = '#38A882';
const AMBER   = '#C89C30';
const VIOLET  = '#7C5CBF';

type KPICardProps = {
  label: string; value: string | number; sub?: string;
  icon: string; tone: string; delta?: number;
};

function KPICard({ label, value, sub, icon, tone, delta }: KPICardProps) {
  return (
    <div className="dash-kpi">
      <div className={'stat-ico ' + tone} style={{ width: 44, height: 44, borderRadius: 12 }}>
        <Icon name={icon} size={20} />
      </div>
      <div className="dash-kpi-body">
        <div className="dash-kpi-val">{value}</div>
        <div className="dash-kpi-label">{label}</div>
        {sub && <div className="dash-kpi-sub">{sub}</div>}
      </div>
      {delta !== undefined && (
        <div className={'dash-kpi-delta ' + (delta >= 0 ? 'up' : 'down')}>
          <Icon name={delta >= 0 ? 'signal' : 'back'} size={12} stroke={2.4} />
          {Math.abs(delta)}%
        </div>
      )}
    </div>
  );
}

function ChartCard({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="dash-chart-card">
      <div className="dash-chart-head">
        <div className="dash-chart-title">{title}</div>
        {sub && <div className="dash-chart-sub">{sub}</div>}
      </div>
      {children}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="dash-tooltip">
      <div className="dash-tt-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="dash-tt-row">
          <span className="dash-tt-dot" style={{ background: p.color }} />
          <span>{p.name}: <strong>{p.value}</strong></span>
        </div>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const authEmail = useAppStore((s) => s.authEmail);

  useEffect(() => {
    if (!authEmail) router.replace('/entrar');
  }, [authEmail, router]);

  const [periodo, setPeriodo] = useState<Periodo>('30d');

  const temporal  = useMemo(() => getDadosTemporal(periodo), [periodo]);
  const kpis      = useMemo(() => getKPIs(periodo), [periodo]);
  const statusDist = useMemo(() => getStatusDist(periodo), [periodo]);
  const segmentos  = useMemo(() => getSegmentosDist(periodo), [periodo]);

  const maxSeg = segmentos[0]?.total ?? 1;

  return (
    <div className="portal-screen">
      <PortalNav />
      <div className="portal-body">

        <header className="portal-head">
          <div>
            <h1>Dashboard</h1>
            <p className="muted">Visão consolidada do desempenho e histórico de solicitações.</p>
          </div>
          <div className="dash-period-tabs">
            {PERIODOS.map((p) => (
              <button
                key={p.id}
                className={'dash-period-btn' + (periodo === p.id ? ' on' : '')}
                onClick={() => setPeriodo(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </header>

        {/* KPIs */}
        <div className="dash-kpi-grid">
          <KPICard label="Total recebidas"   value={kpis.total}        icon="list"    tone="tone-blue"   delta={12} />
          <KPICard label="Respondidas"       value={kpis.respondidas}  icon="check"   tone="tone-green"  delta={8}  sub={`${Math.round(kpis.respondidas / kpis.total * 100)}% do total`} />
          <KPICard label="Taxa de resposta"  value={kpis.taxaResposta + '%'} icon="signal" tone="tone-violet" delta={3} />
          <KPICard label="Em andamento"      value={kpis.emAndamento}  icon="clock"   tone="tone-amber"  />
        </div>

        {/* Linha 1: temporal + status */}
        <div className="dash-row">
          <ChartCard
            title="Evolução de solicitações"
            sub={`Por tipo · últimos ${periodo === '7d' ? '7 dias' : periodo === '30d' ? '30 dias' : periodo === '90d' ? '90 dias' : '12 meses'}`}
          >
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={temporal} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="total"    name="Total"    stroke={PRIMARY} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="cotacao"  name="Cotação"  stroke={ACCENT}  strokeWidth={2}   dot={{ r: 2 }} strokeDasharray="0" />
                <Line type="monotone" dataKey="contato"  name="Contato"  stroke={AMBER}   strokeWidth={2}   dot={{ r: 2 }} strokeDasharray="4 2" />
                <Line type="monotone" dataKey="parceria" name="Parceria" stroke={VIOLET}  strokeWidth={2}   dot={{ r: 2 }} strokeDasharray="2 2" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Distribuição por status" sub="Proporção do período">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={statusDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusDist.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [v, 'solicitações']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="dash-legend">
              {statusDist.map((d, i) => (
                <div key={i} className="dash-legend-item">
                  <span className="dash-legend-dot" style={{ background: d.color }} />
                  <span className="dash-legend-name">{d.name}</span>
                  <span className="dash-legend-val">{d.value}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Linha 2: tipo + segmento */}
        <div className="dash-row">
          <ChartCard title="Solicitações por tipo" sub="Cotação · Contato · Parceria">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={temporal} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="cotacao"  name="Cotação"  fill={PRIMARY} radius={[4,4,0,0]} />
                <Bar dataKey="contato"  name="Contato"  fill={ACCENT}  radius={[4,4,0,0]} />
                <Bar dataKey="parceria" name="Parceria" fill={VIOLET}  radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Top segmentos" sub="Maior volume de solicitações recebidas">
            <div className="dash-seg-list">
              {segmentos.map((s, i) => (
                <div key={i} className="dash-seg-item">
                  <div className="dash-seg-label">
                    <span>{s.segmento}</span>
                    <strong>{s.total}</strong>
                  </div>
                  <div className="dash-seg-bar-wrap">
                    <div
                      className="dash-seg-bar"
                      style={{ width: `${Math.round(s.total / maxSeg * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Linha 3: métricas complementares */}
        <div className="dash-row dash-row-3">
          <ChartCard title="Resumo do período" sub="Indicadores consolidados">
            <div className="dash-metrics">
              <div className="dash-metric-item">
                <span className="dash-metric-label">Novas este período</span>
                <span className="dash-metric-val" style={{ color: AMBER }}>{kpis.novas}</span>
              </div>
              <div className="dash-metric-sep" />
              <div className="dash-metric-item">
                <span className="dash-metric-label">Tempo médio de 1ª resposta</span>
                <span className="dash-metric-val" style={{ color: PRIMARY }}>{kpis.tempoMedioH}h</span>
              </div>
              <div className="dash-metric-sep" />
              <div className="dash-metric-item">
                <span className="dash-metric-label">Taxa de resposta</span>
                <span className="dash-metric-val" style={{ color: ACCENT }}>{kpis.taxaResposta}%</span>
              </div>
              <div className="dash-metric-sep" />
              <div className="dash-metric-item">
                <span className="dash-metric-label">Em andamento agora</span>
                <span className="dash-metric-val" style={{ color: VIOLET }}>{kpis.emAndamento}</span>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Acesso rápido" sub="Atalhos para ações frequentes">
            <div className="dash-shortcuts">
              <button className="dash-shortcut" onClick={() => router.push('/portal')}>
                <span className="stat-ico tone-blue" style={{ width: 36, height: 36, borderRadius: 10 }}>
                  <Icon name="list" size={17} />
                </span>
                <div>
                  <div className="dash-sc-title">Solicitações recebidas</div>
                  <div className="dash-sc-sub">{kpis.novas} novas aguardando</div>
                </div>
                <Icon name="arrow" size={15} className="dash-sc-arrow" />
              </button>
              <button className="dash-shortcut" onClick={() => router.push('/portal/perfil')}>
                <span className="stat-ico tone-green" style={{ width: 36, height: 36, borderRadius: 10 }}>
                  <Icon name="shield2" size={17} />
                </span>
                <div>
                  <div className="dash-sc-title">Meu perfil</div>
                  <div className="dash-sc-sub">Editar dados e serviços</div>
                </div>
                <Icon name="arrow" size={15} className="dash-sc-arrow" />
              </button>
              <button className="dash-shortcut" onClick={() => router.push('/buscar')}>
                <span className="stat-ico tone-violet" style={{ width: 36, height: 36, borderRadius: 10 }}>
                  <Icon name="search" size={17} />
                </span>
                <div>
                  <div className="dash-sc-title">Buscar parceiros</div>
                  <div className="dash-sc-sub">Diretório de fornecedores</div>
                </div>
                <Icon name="arrow" size={15} className="dash-sc-arrow" />
              </button>
            </div>
          </ChartCard>
        </div>

      </div>
    </div>
  );
}
