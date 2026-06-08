// Camada de dados isolada: o front fala só com a API (axios). Trocar a base é só env.
import api from './api';
import type {
  Company,
  SolicitacaoRequest,
  RequestStatus,
  SupplierProfileData,
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

export async function getRequests(): Promise<SolicitacaoRequest[]> {
  const { data } = await api.get<SolicitacaoRequest[]>('/requests');
  return data;
}

export async function getMyProfile(): Promise<SupplierProfileData> {
  const { data } = await api.get<SupplierProfileData>('/profile');
  return data;
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
  status: RequestStatus
): Promise<SolicitacaoRequest> {
  const { data } = await api.patch<SolicitacaoRequest>(`/requests/${id}/status`, { status });
  return data;
}
