export type Segment = { id: string; label: string; icon: string };
export type State = { uf: string; name: string };

export type Company = {
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
  email?: string | null;
  atendeUfs?: string[];
};

export type RequestType = 'cotacao' | 'contato' | 'parceria';
export type RequestStatus = 'nova' | 'andamento' | 'respondida' | 'fechada' | 'cancelada' | 'declinada';

export type ContratoInfo = {
  assinado: boolean;
  numero?: string;
  valor?: string;
  aprovadoEm?: string;  // data em que a solicitação foi fechada/aprovada
  inicio?: string;      // início da vigência do contrato/serviço
  validade?: string;    // fim da vigência (prazo de validade)
};

export type SolicitacaoRequest = {
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
  declinaObs?: string;
  declinadoEm?: string;
};

export type Plan = 'free' | 'verified' | 'premium';

export type CatalogoServico = {
  id: string;
  nome: string;
  descricao: string;
  preco?: string;
  prazo?: string;
  destaque: boolean;
};

export type DocumentoVerificacao = {
  id: string;
  tipo: string;
  numero: string;
  validade: string; // YYYY-MM-DD
  arquivos?: string[]; // nomes dos arquivos anexados
};

export type SupplierProfileData = {
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
  documentos?: DocumentoVerificacao[];
  fotos?: string[];
  catalogo?: CatalogoServico[];
};
