// Consulta de CNPJ em dados públicos da Receita Federal, sem chave de API.
//
// Dois provedores em cascata. A CNPJá vem primeiro porque devolve o nome da
// cidade acentuado ("São Paulo"); a BrasilAPI devolve "SAO PAULO" e o acento
// não dá para adivinhar. Se a primeira falhar, a segunda assume.
//
// Ambas limitam por IP. Aqui todas as consultas saem do mesmo IP do servidor,
// então esta rota é a rede de segurança: o caminho normal é o navegador
// consultar direto (ver frontend/lib/cnpj.ts), gastando a cota de cada um.

const TIMEOUT_MS = 8000;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

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
export class CnpjLimiteExcedido extends Error {}
export class CnpjIndisponivel extends Error {
  // Guarda o que cada provedor respondeu: sem isto, produção só diz
  // "indisponível" e não dá para saber se é rede, runtime ou bloqueio de IP.
  constructor(message: string, readonly detalhe: string) {
    super(message);
  }
}

const cache = new Map<string, { em: number; dados: EmpresaConsultada }>();

export function apenasDigitos(v: string): string {
  return (v ?? '').replace(/\D/g, '');
}

// Confere os dígitos verificadores antes de gastar chamada externa.
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
  const t = (texto ?? '').trim();
  if (!t) return '';
  // Já veio em caixa mista (a CNPJá devolve assim): preserva como está.
  if (t !== t.toUpperCase()) return t;
  return t
    .toLowerCase()
    .split(/\s+/)
    .map((p, i) => (i > 0 && MINUSCULAS.has(p) ? p : p[0].toUpperCase() + p.slice(1)))
    .join(' ');
}

function telefoneFormatado(bruto: string): string {
  const n = apenasDigitos(bruto);
  if (n.length === 11) return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
  if (n.length === 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
  return '';
}

function montar(p: Partial<EmpresaConsultada> & { cnpj: string }): EmpresaConsultada {
  const razaoSocial = capitalizar(p.razaoSocial ?? '');
  const nomeFantasia = capitalizar(p.nomeFantasia ?? '');
  return {
    cnpj: p.cnpj,
    razaoSocial,
    nomeFantasia,
    nome: nomeFantasia || razaoSocial,
    uf: (p.uf ?? '').toUpperCase(),
    cidade: p.cidade ?? '',
    telefone: p.telefone ?? '',
    atividade: p.atividade ?? '',
    situacao: p.situacao ?? '',
    ativa: p.ativa ?? false,
    fundacao: p.fundacao ?? null,
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Provedor {
  nome: string;
  url: (cnpj: string) => string;
  normalizar: (d: any, cnpj: string) => EmpresaConsultada;
}

const PROVEDORES: Provedor[] = [
  {
    nome: 'cnpja',
    url: (cnpj) => `https://open.cnpja.com/office/${cnpj}`,
    normalizar: (d, cnpj) => {
      const tel = d.phones?.[0];
      return montar({
        cnpj,
        razaoSocial: d.company?.name ?? '',
        nomeFantasia: d.alias ?? '',
        uf: d.address?.state ?? '',
        cidade: d.address?.city ?? '',
        telefone: tel ? telefoneFormatado(`${tel.area ?? ''}${tel.number ?? ''}`) : '',
        atividade: d.mainActivity?.text ?? '',
        situacao: d.status?.text ?? '',
        ativa: d.status?.id === 2,
        fundacao: d.founded ? Number(String(d.founded).slice(0, 4)) : null,
      });
    },
  },
  {
    nome: 'brasilapi',
    url: (cnpj) => `https://brasilapi.com.br/api/cnpj/v1/${cnpj}`,
    normalizar: (d, cnpj) =>
      montar({
        cnpj,
        razaoSocial: d.razao_social ?? '',
        nomeFantasia: d.nome_fantasia ?? '',
        uf: d.uf ?? '',
        cidade: capitalizar(d.municipio ?? ''),
        telefone: telefoneFormatado(d.ddd_telefone_1 ?? ''),
        atividade: d.cnae_fiscal_descricao ?? '',
        situacao: d.descricao_situacao_cadastral ?? '',
        ativa: String(d.descricao_situacao_cadastral ?? '').toUpperCase() === 'ATIVA',
        fundacao: d.data_inicio_atividade ? Number(String(d.data_inicio_atividade).slice(0, 4)) : null,
      }),
  },
];

async function tentar(p: Provedor, cnpj: string): Promise<EmpresaConsultada> {
  const controle = new AbortController();
  const relogio = setTimeout(() => controle.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(p.url(cnpj), {
      signal: controle.signal,
      headers: { Accept: 'application/json', 'User-Agent': '360hospitalar/1.0' },
    });
    if (r.status === 404) throw new CnpjNaoEncontrado('CNPJ não encontrado na Receita Federal.');
    if (r.status === 429) throw new CnpjLimiteExcedido(`${p.nome}: limite de consultas`);
    if (!r.ok) throw new CnpjIndisponivel('upstream', `${p.nome}: HTTP ${r.status}`);
    return p.normalizar(await r.json(), cnpj);
  } finally {
    clearTimeout(relogio);
  }
}

export async function consultarCnpj(cnpjBruto: string): Promise<EmpresaConsultada> {
  const cnpj = apenasDigitos(cnpjBruto);

  const guardado = cache.get(cnpj);
  if (guardado && Date.now() - guardado.em < CACHE_TTL_MS) return guardado.dados;

  const problemas: string[] = [];

  for (const provedor of PROVEDORES) {
    try {
      const empresa = await tentar(provedor, cnpj);
      cache.set(cnpj, { em: Date.now(), dados: empresa });
      return empresa;
    } catch (err) {
      // "Não existe" é resposta definitiva: os provedores leem a mesma base.
      if (err instanceof CnpjNaoEncontrado) throw err;
      problemas.push(
        err instanceof CnpjIndisponivel
          ? err.detalhe
          : `${provedor.nome}: ${err instanceof Error ? `${err.name} ${err.message}` : 'falha'}`
      );
    }
  }

  const detalhe = problemas.join(' | ');
  console.error('[cnpj] todos os provedores falharam ->', detalhe);

  if (problemas.every((p) => p.includes('limite'))) {
    throw new CnpjLimiteExcedido('A consulta pública atingiu o limite. Tente em instantes ou preencha à mão.');
  }
  throw new CnpjIndisponivel('A consulta de CNPJ está indisponível no momento.', detalhe);
}
