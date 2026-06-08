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
