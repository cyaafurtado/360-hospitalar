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
  status?: CompanyStatus;
  catalogo?: CatalogoServico[];
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

export type CredentialStatus = 'valida' | 'vigente' | 'vencida';

export type Review = {
  author: string;
  stars: number;
  viaPlatform?: boolean;
  text: string;
};

export type Supplier = {
  id: string;
  name: string;
  category: string;
  city: string;
  verified: boolean;
  marketSince: number;
  platformSince: string;
  rating: number;
  reviewsCount: number;
  avgResponseHours: number;
  contractsCompleted: number;
  institutionsServed: number;
  onTimeRate: number;
  specialties?: string[];
  credentials?: Array<{ name: string; detail: string; status: CredentialStatus }>;
  portfolio?: Array<{ title: string; description: string; imageUrl?: string }>;
  reviews?: Review[];
};

export type CompanyStatus = 'pre_cadastro' | 'completo';

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
  badges?: string[];
  rating: number;
  reviews: number;
  verified: boolean;
  status?: CompanyStatus;
  plan?: Plan;
  documentos?: DocumentoVerificacao[];
  fotos?: string[];
  catalogo?: CatalogoServico[];
};

/* ---------- Sessão (auth real) ---------- */

export type UsuarioTipo = 'fornecedor' | 'contratante' | 'admin';

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  tipo: UsuarioTipo;
  companyId: string | null;
  organizacao: string;
  telefone: string;
};

/* ---------- Painel de administração ---------- */

export type AdminFornecedor = Company & {
  plano: Plan;
  usuarioId: string | null;
  donoNome: string | null;
  donoEmail: string | null;
  createdAt: string;
};

export type AdminUsuario = {
  id: string;
  nome: string;
  email: string;
  tipo: UsuarioTipo;
  companyId: string | null;
  organizacao: string;
  telefone: string;
  ativo: boolean;
  ultimoLogin: string | null;
  createdAt: string;
};

/* ---------- Consulta de CNPJ ---------- */

export type EmpresaConsultada = {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  nome: string;
  uf: string;
  cidade: string;
  telefone: string;
  atividade: string;
  situacao: string;
  ativa: boolean;
  fundacao: number | null;
};
