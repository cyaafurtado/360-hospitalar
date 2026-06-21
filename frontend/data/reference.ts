// Dados de referência estáticos usados pela UI (segmentos, 27 UFs, helpers de label/cor).
// Empresas e solicitações vêm da API (lib/services.ts).
import type { Segment, State } from './types';

export const SEGMENTS: Segment[] = [
  { id: 'lab', label: 'Diagnóstico & Laboratório', icon: 'flask' },
  { id: 'equip', label: 'Equipamentos Médicos', icon: 'pulse' },
  { id: 'limpeza', label: 'Higiene & Limpeza Hospitalar', icon: 'spray' },
  { id: 'residuos', label: 'Gestão de Resíduos', icon: 'leaf' },
  { id: 'esteril', label: 'Esterilização', icon: 'shield' },
  { id: 'ti', label: 'Software & Gestão', icon: 'chip' },
  { id: 'tele', label: 'Telemedicina', icon: 'signal' },
  { id: 'gases', label: 'Gases Medicinais', icon: 'drop' },
  { id: 'manut', label: 'Manutenção de Equipamentos', icon: 'wrench' },
  { id: 'epi', label: 'Uniformes & EPI', icon: 'vest' },
  { id: 'nutri', label: 'Nutrição Hospitalar', icon: 'bowl' },
  { id: 'farma', label: 'Distribuição Farmacêutica', icon: 'pill' },
  { id: 'transporte', label: 'Transporte de Pacientes & Ambulâncias', icon: 'truck' },
  { id: 'construcao', label: 'Construção & Arquitetura Hospitalar', icon: 'hardhat' },
  { id: 'infra', label: 'Infraestrutura Predial', icon: 'bolt' },
  { id: 'lavanderia', label: 'Lavanderia Hospitalar', icon: 'tshirt' },
  { id: 'engclinica', label: 'Engenharia Clínica & Calibração', icon: 'gauge' },
  { id: 'mobiliario', label: 'Mobiliário Hospitalar', icon: 'armchair' },
  { id: 'consultoria', label: 'Consultoria & Compliance', icon: 'clipboard' },
  { id: 'treinamento', label: 'Treinamento & Capacitação', icon: 'mortarboard' },
];

export const STATES: State[] = [
  { uf: 'AC', name: 'Acre' },
  { uf: 'AL', name: 'Alagoas' },
  { uf: 'AP', name: 'Amapá' },
  { uf: 'AM', name: 'Amazonas' },
  { uf: 'BA', name: 'Bahia' },
  { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' },
  { uf: 'ES', name: 'Espírito Santo' },
  { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' },
  { uf: 'MT', name: 'Mato Grosso' },
  { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MG', name: 'Minas Gerais' },
  { uf: 'PA', name: 'Pará' },
  { uf: 'PB', name: 'Paraíba' },
  { uf: 'PR', name: 'Paraná' },
  { uf: 'PE', name: 'Pernambuco' },
  { uf: 'PI', name: 'Piauí' },
  { uf: 'RJ', name: 'Rio de Janeiro' },
  { uf: 'RN', name: 'Rio Grande do Norte' },
  { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'RO', name: 'Rondônia' },
  { uf: 'RR', name: 'Roraima' },
  { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'São Paulo' },
  { uf: 'SE', name: 'Sergipe' },
  { uf: 'TO', name: 'Tocantins' },
];

export const REQUEST_TYPES = [
  { id: 'cotacao', label: 'Cotação' },
  { id: 'contato', label: 'Contato' },
  { id: 'parceria', label: 'Parceria' },
] as const;

export const REQUEST_STATUS = [
  { id: 'nova', label: 'Nova' },
  { id: 'andamento', label: 'Em andamento' },
  { id: 'respondida', label: 'Respondida' },
  { id: 'fechada', label: 'Fechada' },
  { id: 'cancelada', label: 'Cancelada' },
  { id: 'declinada', label: 'Declinada' },
] as const;

const LOGO_TINTS = [
  'oklch(0.55 0.11 250)',
  'oklch(0.55 0.09 200)',
  'oklch(0.55 0.10 165)',
  'oklch(0.55 0.10 285)',
  'oklch(0.56 0.08 230)',
  'oklch(0.55 0.09 145)',
];

export function tintFor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return LOGO_TINTS[h % LOGO_TINTS.length];
}

export function monogram(name: string): string {
  const clean = name.replace(/[^A-Za-zÀ-ÿ ]/g, '').trim().split(/\s+/);
  if (clean.length === 1) return clean[0].slice(0, 2).toUpperCase();
  return (clean[0][0] + clean[1][0]).toUpperCase();
}

export function segmentLabel(id: string): string {
  return SEGMENTS.find((x) => x.id === id)?.label ?? id;
}
export function stateName(uf: string): string {
  return STATES.find((x) => x.uf === uf)?.name ?? uf;
}
export function typeLabel(id: string): string {
  return REQUEST_TYPES.find((x) => x.id === id)?.label ?? id;
}
export function statusLabel(id: string): string {
  return REQUEST_STATUS.find((x) => x.id === id)?.label ?? id;
}
