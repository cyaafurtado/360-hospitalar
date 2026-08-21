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
  founded: number;
  employees: string;
  services: string[];
  badges: string[];
  about: string;
  phone: string;
  site: string;
  email: string | null;
  atendeUfs: string[];
}

export type RequestType = 'cotacao' | 'contato' | 'parceria';
export type RequestStatus = 'nova' | 'andamento' | 'respondida' | 'fechada';

export interface ContratoInfo {
  assinado: boolean;
  numero?: string;
  valor?: string;
  aprovadoEm?: string;
  inicio?: string;
  validade?: string;
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
  rating: number;
  reviews: number;
  verified: boolean;
}

/* ---------- Auth (usuários e sessões) ---------- */

export type UsuarioTipo = 'fornecedor' | 'contratante';

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
