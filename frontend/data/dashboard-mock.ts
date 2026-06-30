export type Periodo = '7d' | '30d' | '90d' | '12m';

export type PontoTemporal = {
  label: string;
  total: number;
  cotacao: number;
  contato: number;
  parceria: number;
};

export type KPIs = {
  total: number;
  respondidas: number;
  emAndamento: number;
  taxaResposta: number;
  tempoMedioH: number;
  novas: number;
};

export type DistStatus = { name: string; value: number; color: string };
export type DistSegmento = { segmento: string; total: number };

// Dados mensais: Jul/25 → Jun/26
const MENSAL: PontoTemporal[] = [
  { label: 'Jul', total: 8,  cotacao: 5,  contato: 2, parceria: 1 },
  { label: 'Ago', total: 12, cotacao: 7,  contato: 3, parceria: 2 },
  { label: 'Set', total: 9,  cotacao: 5,  contato: 3, parceria: 1 },
  { label: 'Out', total: 15, cotacao: 9,  contato: 4, parceria: 2 },
  { label: 'Nov', total: 11, cotacao: 7,  contato: 3, parceria: 1 },
  { label: 'Dez', total: 18, cotacao: 11, contato: 5, parceria: 2 },
  { label: 'Jan', total: 14, cotacao: 8,  contato: 4, parceria: 2 },
  { label: 'Fev', total: 22, cotacao: 13, contato: 6, parceria: 3 },
  { label: 'Mar', total: 19, cotacao: 12, contato: 5, parceria: 2 },
  { label: 'Abr', total: 25, cotacao: 15, contato: 7, parceria: 3 },
  { label: 'Mai', total: 21, cotacao: 13, contato: 6, parceria: 2 },
  { label: 'Jun', total: 28, cotacao: 17, contato: 8, parceria: 3 },
];

const SEMANAL: PontoTemporal[] = [
  { label: 'Sem 1', total: 5,  cotacao: 3, contato: 1, parceria: 1 },
  { label: 'Sem 2', total: 7,  cotacao: 4, contato: 2, parceria: 1 },
  { label: 'Sem 3', total: 9,  cotacao: 6, contato: 2, parceria: 1 },
  { label: 'Sem 4', total: 7,  cotacao: 4, contato: 2, parceria: 1 },
];

const DIARIO: PontoTemporal[] = [
  { label: 'Seg', total: 3, cotacao: 2, contato: 1, parceria: 0 },
  { label: 'Ter', total: 5, cotacao: 3, contato: 1, parceria: 1 },
  { label: 'Qua', total: 4, cotacao: 2, contato: 2, parceria: 0 },
  { label: 'Qui', total: 7, cotacao: 4, contato: 2, parceria: 1 },
  { label: 'Sex', total: 6, cotacao: 4, contato: 1, parceria: 1 },
  { label: 'Sáb', total: 2, cotacao: 1, contato: 1, parceria: 0 },
  { label: 'Dom', total: 1, cotacao: 1, contato: 0, parceria: 0 },
];

const KPIS_POR_PERIODO: Record<Periodo, KPIs> = {
  '7d':  { total: 28, respondidas: 18, emAndamento: 6,  taxaResposta: 82, tempoMedioH: 14, novas: 4 },
  '30d': { total: 28, respondidas: 19, emAndamento: 5,  taxaResposta: 84, tempoMedioH: 17, novas: 4 },
  '90d': { total: 68, respondidas: 52, emAndamento: 8,  taxaResposta: 85, tempoMedioH: 19, novas: 8 },
  '12m': { total: 202, respondidas: 159, emAndamento: 22, taxaResposta: 87, tempoMedioH: 22, novas: 21 },
};

const STATUS_DIST: Record<Periodo, DistStatus[]> = {
  '7d':  [
    { name: 'Respondida', value: 18, color: '#38A882' },
    { name: 'Em andamento', value: 6, color: '#2259C1' },
    { name: 'Nova', value: 4, color: '#C89C30' },
  ],
  '30d': [
    { name: 'Respondida', value: 19, color: '#38A882' },
    { name: 'Em andamento', value: 5, color: '#2259C1' },
    { name: 'Nova', value: 4, color: '#C89C30' },
  ],
  '90d': [
    { name: 'Respondida', value: 52, color: '#38A882' },
    { name: 'Em andamento', value: 8, color: '#2259C1' },
    { name: 'Fechada', value: 5, color: '#7C5CBF' },
    { name: 'Nova', value: 3, color: '#C89C30' },
  ],
  '12m': [
    { name: 'Respondida', value: 159, color: '#38A882' },
    { name: 'Fechada', value: 22, color: '#7C5CBF' },
    { name: 'Em andamento', value: 13, color: '#2259C1' },
    { name: 'Nova', value: 8, color: '#C89C30' },
  ],
};

const SEGMENTOS_DIST: Record<Periodo, DistSegmento[]> = {
  '7d':  [
    { segmento: 'Equipamentos Médicos', total: 8 },
    { segmento: 'Esterilização', total: 6 },
    { segmento: 'Diagnóstico & Lab', total: 5 },
    { segmento: 'Software & Gestão', total: 5 },
    { segmento: 'Gases Medicinais', total: 4 },
  ],
  '30d': [
    { segmento: 'Equipamentos Médicos', total: 9 },
    { segmento: 'Esterilização', total: 7 },
    { segmento: 'Software & Gestão', total: 6 },
    { segmento: 'Diagnóstico & Lab', total: 4 },
    { segmento: 'Gases Medicinais', total: 2 },
  ],
  '90d': [
    { segmento: 'Equipamentos Médicos', total: 22 },
    { segmento: 'Software & Gestão', total: 16 },
    { segmento: 'Esterilização', total: 14 },
    { segmento: 'Diagnóstico & Lab', total: 10 },
    { segmento: 'Gases Medicinais', total: 6 },
  ],
  '12m': [
    { segmento: 'Equipamentos Médicos', total: 58 },
    { segmento: 'Software & Gestão', total: 44 },
    { segmento: 'Esterilização', total: 38 },
    { segmento: 'Diagnóstico & Lab', total: 32 },
    { segmento: 'Gases Medicinais', total: 18 },
    { segmento: 'Telemedicina', total: 12 },
  ],
};

export function getDadosTemporal(periodo: Periodo): PontoTemporal[] {
  if (periodo === '7d')  return DIARIO;
  if (periodo === '30d') return SEMANAL;
  if (periodo === '90d') return MENSAL.slice(-3);
  return MENSAL;
}

export function getKPIs(periodo: Periodo): KPIs { return KPIS_POR_PERIODO[periodo]; }
export function getStatusDist(periodo: Periodo): DistStatus[] { return STATUS_DIST[periodo]; }
export function getSegmentosDist(periodo: Periodo): DistSegmento[] { return SEGMENTOS_DIST[periodo]; }

export const PERIODOS: { id: Periodo; label: string }[] = [
  { id: '7d', label: '7 dias' },
  { id: '30d', label: '30 dias' },
  { id: '90d', label: '90 dias' },
  { id: '12m', label: '12 meses' },
];
