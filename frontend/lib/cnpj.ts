import api from './api';
import type { EmpresaConsultada } from '../data/types';

// A consulta pública é limitada por IP. Por isso ela sai do navegador: cada
// pessoa gasta a própria cota. Se falhar (rede corporativa, CORS bloqueado, ou
// o IP já no limite), caímos para a nossa API, que tem cota e cache próprios.

const BRASIL_API = 'https://brasilapi.com.br/api/cnpj/v1';
const TIMEOUT_MS = 8000;

export class CnpjErro extends Error {
  constructor(message: string, readonly naoEncontrado = false) {
    super(message);
  }
}

export function apenasDigitos(v: string): string {
  return (v ?? '').replace(/\D/g, '');
}

export function cnpjValido(cnpj: string): boolean {
  const n = apenasDigitos(cnpj);
  if (n.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(n)) return false;

  const digito = (base: string): number => {
    let peso = base.length - 7;
    let soma = 0;
    for (let i = 0; i < base.length; i++) {
      soma += Number(base[i]) * peso;
      peso = peso - 1 < 2 ? 9 : peso - 1;
    }
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  return digito(n.slice(0, 12)) === Number(n[12]) && digito(n.slice(0, 13)) === Number(n[13]);
}

const MINUSCULAS = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);
function capitalizar(texto: string): string {
  return (texto ?? '')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((p, i) => (i > 0 && MINUSCULAS.has(p) ? p : p[0].toUpperCase() + p.slice(1)))
    .join(' ');
}

function telefoneFormatado(bruto: string): string {
  const n = apenasDigitos(bruto);
  if (n.length === 11) return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
  if (n.length === 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
  return '';
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function normalizar(d: any, cnpj: string): EmpresaConsultada {
  const razaoSocial = capitalizar(d.razao_social ?? '');
  const nomeFantasia = capitalizar(d.nome_fantasia ?? '');
  const situacao = String(d.descricao_situacao_cadastral ?? '');
  return {
    cnpj,
    razaoSocial,
    nomeFantasia,
    nome: nomeFantasia || razaoSocial,
    uf: String(d.uf ?? '').toUpperCase(),
    cidade: capitalizar(d.municipio ?? ''),
    telefone: telefoneFormatado(d.ddd_telefone_1 ?? ''),
    atividade: d.cnae_fiscal_descricao ?? '',
    situacao,
    ativa: situacao.toUpperCase() === 'ATIVA',
    fundacao: d.data_inicio_atividade ? Number(String(d.data_inicio_atividade).slice(0, 4)) : null,
  };
}

async function consultaDireta(cnpj: string): Promise<EmpresaConsultada> {
  const controle = new AbortController();
  const relogio = setTimeout(() => controle.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(`${BRASIL_API}/${cnpj}`, { signal: controle.signal });
    if (r.status === 404) throw new CnpjErro('CNPJ não encontrado na Receita Federal.', true);
    if (!r.ok) throw new CnpjErro('consulta direta indisponível');
    return normalizar(await r.json(), cnpj);
  } finally {
    clearTimeout(relogio);
  }
}

async function consultaPelaNossaApi(cnpj: string): Promise<EmpresaConsultada> {
  try {
    const { data } = await api.get<EmpresaConsultada>(`/cnpj/${cnpj}`);
    return data;
  } catch (err) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
    throw new CnpjErro(
      msg ?? 'Não foi possível consultar o CNPJ agora. Preencha os dados à mão.',
      status === 404
    );
  }
}

export async function consultarCnpj(cnpjBruto: string): Promise<EmpresaConsultada> {
  const cnpj = apenasDigitos(cnpjBruto);
  if (!cnpjValido(cnpj)) throw new CnpjErro('CNPJ inválido. Confira os números digitados.');

  try {
    return await consultaDireta(cnpj);
  } catch (err) {
    // "Não existe" é resposta definitiva: não adianta perguntar de novo pela API.
    if (err instanceof CnpjErro && err.naoEncontrado) throw err;
    return consultaPelaNossaApi(cnpj);
  }
}
