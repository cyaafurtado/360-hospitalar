// Consulta de CNPJ na BrasilAPI (dados públicos da Receita Federal, sem chave).
// Passa pelo nosso backend em vez de ir direto do navegador: assim controlamos
// timeout, normalizamos o formato e não dependemos do CORS de terceiro.

const ENDPOINT = 'https://brasilapi.com.br/api/cnpj/v1';
const TIMEOUT_MS = 8000;

export interface EmpresaConsultada {
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
}

export class CnpjNaoEncontrado extends Error {}
export class CnpjIndisponivel extends Error {}
export class CnpjLimiteExcedido extends Error {}

// A BrasilAPI limita consultas por IP e aqui todas saem do mesmo IP do servidor.
// O cache evita queimar a cota com o mesmo CNPJ repetido.
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, { em: number; dados: EmpresaConsultada }>();

export function apenasDigitos(v: string): string {
  return (v ?? '').replace(/\D/g, '');
}

// Valida os dois dígitos verificadores — evita gastar chamada externa com número inventado.
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

// "SAO PAULO" -> "São Paulo" não dá para adivinhar acento, mas ALL CAPS num
// campo de formulário fica feio; ao menos normalizamos a caixa.
const MINUSCULAS = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);
function capitalizar(texto: string): string {
  return (texto ?? '')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((palavra, i) => (i > 0 && MINUSCULAS.has(palavra) ? palavra : palavra[0].toUpperCase() + palavra.slice(1)))
    .join(' ');
}

function telefoneFormatado(bruto: string): string {
  const n = apenasDigitos(bruto);
  if (n.length === 11) return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
  if (n.length === 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
  return '';
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function consultarCnpj(cnpjBruto: string): Promise<EmpresaConsultada> {
  const cnpj = apenasDigitos(cnpjBruto);

  const guardado = cache.get(cnpj);
  if (guardado && Date.now() - guardado.em < CACHE_TTL_MS) return guardado.dados;

  const controle = new AbortController();
  const relogio = setTimeout(() => controle.abort(), TIMEOUT_MS);

  let resposta: Response;
  try {
    resposta = await fetch(`${ENDPOINT}/${cnpj}`, { signal: controle.signal });
  } catch {
    throw new CnpjIndisponivel('A consulta de CNPJ não respondeu a tempo.');
  } finally {
    clearTimeout(relogio);
  }

  if (resposta.status === 404) throw new CnpjNaoEncontrado('CNPJ não encontrado na Receita Federal.');
  if (resposta.status === 429) {
    throw new CnpjLimiteExcedido('A consulta pública atingiu o limite. Tente em instantes ou preencha à mão.');
  }
  if (!resposta.ok) throw new CnpjIndisponivel('A consulta de CNPJ está indisponível no momento.');

  const d: any = await resposta.json();
  const razaoSocial = capitalizar(d.razao_social ?? '');
  const nomeFantasia = capitalizar(d.nome_fantasia ?? '');
  const situacao = String(d.descricao_situacao_cadastral ?? '');

  const empresa: EmpresaConsultada = {
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

  cache.set(cnpj, { em: Date.now(), dados: empresa });
  return empresa;
}
