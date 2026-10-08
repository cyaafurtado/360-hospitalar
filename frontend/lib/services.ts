// Camada de dados isolada: o front fala só com a API (axios). Trocar a base é só env.
import api, { API_URL } from './api';
import type {
  Company,
  SolicitacaoRequest,
  RequestStatus,
  ContratoInfo,
  SupplierProfileData,
  Usuario,
  UsuarioTipo,
  AdminFornecedor,
  AdminUsuario,
  Plan,
  DocumentoVerificacao,
  ArquivoDocumento,
  AdminDocumento,
  FotoEmpresa,
  Instituicao,
  InstituicaoInput,
  AdminInstituicao,
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

export function codigoDoErro(err: unknown): string | undefined {
  return (err as { response?: { data?: { code?: string } } })?.response?.data?.code;
}

export async function updateMyProfile(profile: SupplierProfileData): Promise<SupplierProfileData> {
  const { data } = await api.put<SupplierProfileData>('/profile', profile);
  return data;
}

/* ---------- Fotos da empresa ---------- */
/* Sem aprovação — aparecem no site assim que o fornecedor envia. */

export async function enviarFoto(file: File): Promise<FotoEmpresa> {
  const formData = new FormData();
  formData.append('foto', file);
  // Mesmo motivo do upload de documento: deixar o navegador gerar o
  // Content-Type com boundary em vez do default 'application/json' da instância.
  const { data } = await api.post<FotoEmpresa>('/profile/fotos', formData, {
    headers: { 'Content-Type': undefined },
  });
  return data;
}

export async function removerFoto(id: string): Promise<void> {
  await api.delete(`/profile/fotos/${id}`);
}

// Rota pública (sem token) — usável direto num <img src>.
export function urlFoto(id: string): string {
  return `${API_URL}/api/companies/fotos/${id}`;
}

/* ---------- Instituição de saúde (contratante) ---------- */

// null = conta contratante que ainda não finalizou o cadastro da instituição
// (não é erro de carga — é só a lista de "falta terminar").
export async function getMinhaInstituicao(): Promise<Instituicao | null> {
  try {
    const { data } = await api.get<Instituicao>('/profile/instituicao');
    return data;
  } catch (err) {
    if (codigoDoErro(err) === 'SEM_INSTITUICAO') return null;
    throw err;
  }
}

export async function criarInstituicao(input: InstituicaoInput): Promise<Instituicao> {
  const { data } = await api.post<Instituicao>('/profile/instituicao', input);
  return data;
}

/* ---------- Painel de administração: instituições ---------- */

export async function adminListInstituicoes(): Promise<AdminInstituicao[]> {
  const { data } = await api.get<AdminInstituicao[]>('/admin/instituicoes');
  return data;
}

export async function adminGetInstituicao(id: string): Promise<AdminInstituicao> {
  const { data } = await api.get<AdminInstituicao>(`/admin/instituicoes/${id}`);
  return data;
}

export async function adminAprovarInstituicao(id: string): Promise<void> {
  await api.patch(`/admin/instituicoes/${id}/aprovar`);
}

export async function adminRejeitarInstituicao(id: string, motivo: string): Promise<void> {
  await api.patch(`/admin/instituicoes/${id}/rejeitar`, { motivo });
}

/* ---------- Documentação de verificação ---------- */
/* Cada ação salva na hora — arquivo não dá pra deixar "pendente" só no
   navegador esperando o botão Salvar geral do perfil. */

export type DocumentoInput = { tipo: string; numero: string; validade: string };

export async function criarDocumento(input: DocumentoInput): Promise<DocumentoVerificacao> {
  const { data } = await api.post<DocumentoVerificacao>('/profile/documentos', input);
  return data;
}

export async function atualizarDocumento(id: string, input: DocumentoInput): Promise<void> {
  await api.put(`/profile/documentos/${id}`, input);
}

export async function removerDocumento(id: string): Promise<void> {
  await api.delete(`/profile/documentos/${id}`);
}

export async function enviarArquivoDocumento(documentoId: string, file: File): Promise<ArquivoDocumento> {
  const formData = new FormData();
  formData.append('arquivo', file);
  // O 'Content-Type: multipart/form-data' da instância do axios não tem o
  // boundary que o multer precisa pra separar os campos — forçar esse valor
  // aqui quebraria o upload. 'undefined' remove o header da instância e
  // deixa o navegador gerar o Content-Type certo (com boundary) sozinho.
  const { data } = await api.post<ArquivoDocumento>(`/profile/documentos/${documentoId}/arquivos`, formData, {
    headers: { 'Content-Type': undefined },
  });
  return data;
}

export async function removerArquivoDocumento(documentoId: string, arquivoId: string): Promise<void> {
  await api.delete(`/profile/documentos/${documentoId}/arquivos/${arquivoId}`);
}

// O link precisa do token de autenticação (a rota é privada), então não dá
// pra usar um <a href> direto — busca o arquivo autenticado e abre localmente.
export async function abrirArquivoDocumento(documentoId: string, arquivoId: string): Promise<void> {
  const { data } = await api.get(`/profile/documentos/${documentoId}/arquivos/${arquivoId}`, {
    responseType: 'blob',
  });
  const url = URL.createObjectURL(data as Blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

// Manda o documento (já com arquivo anexado) pra fila de revisão do admin.
export async function enviarDocumentoParaAnalise(documentoId: string): Promise<void> {
  await api.post(`/profile/documentos/${documentoId}/enviar`);
}

// Desiste do envio enquanto ainda está em análise — volta a ser editável.
export async function cancelarEnvioDocumento(documentoId: string): Promise<void> {
  await api.post(`/profile/documentos/${documentoId}/cancelar`);
}

/* ---------- Painel de administração: documentos ---------- */

export async function adminListDocumentos(): Promise<AdminDocumento[]> {
  const { data } = await api.get<AdminDocumento[]>('/admin/documentos');
  return data;
}

export async function adminAprovarDocumento(id: string): Promise<void> {
  await api.patch(`/admin/documentos/${id}/aprovar`);
}

export async function adminRejeitarDocumento(id: string, motivo: string): Promise<void> {
  await api.patch(`/admin/documentos/${id}/rejeitar`, { motivo });
}

export async function adminAbrirArquivoDocumento(arquivoId: string): Promise<void> {
  const { data } = await api.get(`/admin/documentos/arquivos/${arquivoId}`, { responseType: 'blob' });
  const url = URL.createObjectURL(data as Blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

// Pré-cadastro: cria a empresa só com o essencial (etapa 1 do assistente).
// O restante do perfil é preenchido depois via updateMyProfile, que é o que
// promove a empresa para status 'completo' e a torna elegível a orçamento.
export type PreCadastroInput = {
  name: string;
  segment: string;
  city: string;
  uf: string;
};

export async function preCadastrarEmpresa(input: PreCadastroInput): Promise<Company> {
  const { data } = await api.post<Company>('/companies', input);
  return data;
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
type RespostaCadastro = { pendingVerification: true; email: string };

export async function login(cred: CredenciaisLogin): Promise<RespostaSessao> {
  const { data } = await api.post<RespostaSessao>('/auth/login', cred);
  return data;
}

// Não faz login: a conta só é liberada depois de confirmar o e-mail.
export async function registrar(input: NovaContaInput): Promise<RespostaCadastro> {
  const { data } = await api.post<RespostaCadastro>('/auth/register', input);
  return data;
}

export async function confirmarEmail(token: string): Promise<RespostaSessao> {
  const { data } = await api.post<RespostaSessao>('/auth/verify-email', { token });
  return data;
}

export async function reenviarConfirmacao(email: string): Promise<void> {
  await api.post('/auth/resend-verification', { email });
}

export async function esqueciSenha(email: string): Promise<void> {
  await api.post('/auth/forgot-password', { email });
}

export async function redefinirSenha(token: string, novaSenha: string): Promise<void> {
  await api.post('/auth/reset-password', { token, novaSenha });
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

/* ---------- Painel de administração ---------- */

export async function adminListFornecedores(): Promise<AdminFornecedor[]> {
  const { data } = await api.get<AdminFornecedor[]>('/admin/fornecedores');
  return data;
}

export async function adminUpdateFornecedor(
  id: string,
  patch: { verified?: boolean; plano?: Plan }
): Promise<AdminFornecedor> {
  const { data } = await api.patch<AdminFornecedor>(`/admin/fornecedores/${id}`, patch);
  return data;
}

export async function adminDeleteFornecedor(id: string): Promise<void> {
  await api.delete(`/admin/fornecedores/${id}`);
}

export async function adminListUsuarios(): Promise<AdminUsuario[]> {
  const { data } = await api.get<AdminUsuario[]>('/admin/usuarios');
  return data;
}

// Devolve a senha nova em texto puro — só aparece nesta resposta, uma vez.
export async function adminResetarSenha(id: string): Promise<string> {
  const { data } = await api.post<{ senha: string }>(`/admin/usuarios/${id}/resetar-senha`);
  return data.senha;
}

export async function adminSetAtivo(id: string, ativo: boolean): Promise<void> {
  await api.patch(`/admin/usuarios/${id}/ativo`, { ativo });
}

export async function adminDeleteUsuario(id: string): Promise<void> {
  await api.delete(`/admin/usuarios/${id}`);
}

export async function adminListSolicitacoes(): Promise<SolicitacaoRequest[]> {
  const { data } = await api.get<SolicitacaoRequest[]>('/admin/solicitacoes');
  return data;
}
