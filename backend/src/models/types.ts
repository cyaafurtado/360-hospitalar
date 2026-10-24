export type CompanyStatus = 'pre_cadastro' | 'completo';
export type PlanoEmpresa = 'free' | 'verified' | 'premium';

export interface CatalogoServico {
  id: string;
  nome: string;
  descricao: string;
  preco?: string;
  prazo?: string;
  destaque: boolean;
}

export interface Company {
  id: string;
  name: string;
  segment: string;
  tagline: string;
  city: string;
  uf: string;
  rating: number;
  reviews: number;
  verified: boolean;
  founded: number | null;
  employees: string;
  services: string[];
  badges: string[];
  about: string;
  phone: string;
  site: string;
  email: string | null;
  atendeUfs: string[];
  status: CompanyStatus;
  plano: PlanoEmpresa;
  catalogo: CatalogoServico[];
}

export type RequestType = 'cotacao' | 'contato' | 'parceria';
export type RequestStatus = 'nova' | 'andamento' | 'respondida' | 'fechada' | 'cancelada';

export interface ContratoInfo {
  assinado: boolean;
  numero?: string;
  valor?: string;
  aprovadoEm?: string;
  inicio?: string;
  validade?: string;
}

// Quem pediu o cancelamento e se ele já valeu ou ainda espera a outra parte.
export type CancelamentoStatus = 'pendente' | 'aceito' | 'recusado';
export type CancelamentoSolicitante = 'fornecedor' | 'contratante';

export interface CancelamentoInfo {
  motivo: string;
  solicitadoPor: CancelamentoSolicitante;
  em: string;
  status: CancelamentoStatus;
}

export interface SolicitacaoRequest {
  id: string;
  solicitante: string;
  cargo: string;
  organizacao: string;
  tipo: RequestType;
  status: RequestStatus;
  prestador: string;
  uf: string;
  cidade: string;
  email: string;
  phone: string;
  quando: string;
  resumo: string;
  servico?: string;
  prazo?: string;
  contrato?: ContratoInfo;
  cancelamento?: CancelamentoInfo;
}

// Perfil editável do fornecedor logado (deriva de Company)
export interface SupplierProfile {
  name: string;
  tagline: string;
  about: string;
  segment: string;
  uf: string;
  city: string;
  email: string;
  phone: string;
  site: string;
  employees: string;
  atendeUfs: string[];
  badges: string[];
  rating: number;
  reviews: number;
  verified: boolean;
  status: CompanyStatus;
}

/* ---------- Auth (usuários e sessões) ---------- */

export type UsuarioTipo = 'fornecedor' | 'contratante' | 'admin';

// Usuário como o front enxerga — nunca inclui senha_hash
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipo: UsuarioTipo;
  companyId: string | null;
  organizacao: string;
  telefone: string;
}

// O que viaja dentro do access token
export interface AuthTokenPayload {
  sub: string;
  email: string;
  tipo: UsuarioTipo;
  companyId: string | null;
}
