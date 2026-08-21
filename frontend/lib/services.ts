// Camada de dados isolada: o front fala só com a API (axios). Trocar a base é só env.
import api from './api';
import type {
  Company,
  SolicitacaoRequest,
  RequestStatus,
  ContratoInfo,
  SupplierProfileData,
  Usuario,
  UsuarioTipo,
} from '../data/types';

export async function getCompanies(): Promise<Company[]> {
  const { data } = await api.get<Company[]>('/companies');
  return data;
}

export async function getCompany(id: string): Promise<Company | null> {
  try {
    const { data } = await api.get<Company>(`/companies/${id}`);
    return data;
  } catch {
    return null;
  }
}

// 'recebidas' = caixa de entrada do fornecedor; 'enviadas' = o que a conta pediu.
export async function getRequests(caixa: 'recebidas' | 'enviadas' = 'recebidas'): Promise<SolicitacaoRequest[]> {
  const { data } = await api.get<SolicitacaoRequest[]>('/requests', { params: { caixa } });
  return data;
}

export async function getRequest(id: string): Promise<SolicitacaoRequest> {
  const { data } = await api.get<SolicitacaoRequest>(`/requests/${id}`);
  return data;
}

export async function updateRequestContract(id: string, contrato: ContratoInfo): Promise<SolicitacaoRequest> {
  const { data } = await api.patch<SolicitacaoRequest>(`/requests/${id}/contract`, { contrato });
  return data;
}

// null = a conta existe mas ainda não cadastrou empresa (não é erro de carga).
export async function getMyProfile(): Promise<SupplierProfileData | null> {
  try {
    const { data } = await api.get<SupplierProfileData>('/profile');
    return data;
  } catch (err) {
    if (codigoDoErro(err) === 'SEM_EMPRESA') return null;
    throw err;
  }
}

function codigoDoErro(err: unknown): string | undefined {
  return (err as { response?: { data?: { code?: string } } })?.response?.data?.code;
}

export async function updateMyProfile(profile: SupplierProfileData): Promise<SupplierProfileData> {
  const { data } = await api.put<SupplierProfileData>('/profile', profile);
  return data;
}

export type NewCompanyInput = {
  name: string;
  segment: string;
  tagline: string;
  city: string;
  uf: string;
  atendeUfs: string[];
  employees: string;
  badges: string[];
  about: string;
  phone: string;
  site: string;
  email: string;
};

export async function createCompany(input: NewCompanyInput): Promise<void> {
  await api.post('/companies', input);
}

export type NewQuoteInput = {
  prestadorId: string;
  prestador: string;
  tipo: string;
  nome: string;
  cargo: string;
  organizacao: string;
  email: string;
  telefone: string;
  uf: string;
  cidade: string;
  servico: string;
  detalhes: string;
};

export async function createQuote(input: NewQuoteInput): Promise<{ id: string }> {
  const { data } = await api.post<{ id: string }>('/requests', input);
  return data;
}

export async function updateRequestStatus(
  id: string,
  status: RequestStatus,
  obs?: string
): Promise<SolicitacaoRequest> {
  const { data } = await api.patch<SolicitacaoRequest>(`/requests/${id}/status`, { status, obs });
  return data;
}

/* ---------- Sessão ---------- */

export type CredenciaisLogin = { email: string; senha: string };

export type NovaContaInput = {
  nome: string;
  email: string;
  senha: string;
  tipo: UsuarioTipo;
  organizacao?: string;
  telefone?: string;
  companyId?: string;
};

type RespostaSessao = { token: string; usuario: Usuario };

export async function login(cred: CredenciaisLogin): Promise<RespostaSessao> {
  const { data } = await api.post<RespostaSessao>('/auth/login', cred);
  return data;
}

export async function registrar(input: NovaContaInput): Promise<RespostaSessao> {
  const { data } = await api.post<RespostaSessao>('/auth/register', input);
  return data;
}

export async function getUsuarioLogado(): Promise<Usuario> {
  const { data } = await api.get<{ usuario: Usuario }>('/auth/me');
  return data.usuario;
}

export async function logoutApi(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } catch {
    // Servidor fora do ar não pode impedir o usuário de sair localmente.
  }
}

// Traduz o erro do axios na frase que a tela mostra.
export function mensagemDeErro(err: unknown, padrao: string): string {
  const resposta = (err as { response?: { data?: { error?: string } } })?.response;
  return resposta?.data?.error ?? padrao;
}

export async function renovarSessao(): Promise<RespostaSessao> {
  const { data } = await api.post<RespostaSessao>('/auth/refresh');
  return data;
}
