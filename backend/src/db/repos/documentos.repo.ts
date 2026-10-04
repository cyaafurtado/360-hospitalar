import { query } from '../connection';
import { novoId } from '../../services/auth.service';

export type DocumentoStatus = 'rascunho' | 'em_analise' | 'aprovado' | 'rejeitado';

export interface ArquivoDocumento {
  id: string;
  nome: string;
  tipoMime: string;
  tamanhoBytes: number;
}

export interface Documento {
  id: string;
  companyId: string;
  tipo: string;
  numero: string;
  validade: string; // YYYY-MM-DD, ou '' sem validade
  status: DocumentoStatus;
  motivoRejeicao: string;
  arquivos: ArquivoDocumento[];
}

export interface ArquivoComConteudo extends ArquivoDocumento {
  documentoId: string;
  conteudo: Buffer;
}

export interface DocumentoParaAdmin extends Documento {
  empresaId: string;
  empresaNome: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToArquivo(r: any): ArquivoDocumento {
  return { id: r.id, nome: r.nome, tipoMime: r.tipo_mime, tamanhoBytes: r.tamanho_bytes };
}

function fmtValidade(v: any): string {
  return v ? new Date(v).toISOString().slice(0, 10) : '';
}

export const DocumentosRepo = {
  async listByCompany(companyId: string): Promise<Documento[]> {
    const { rows: docs } = await query(
      'SELECT * FROM documentos_fornecedor WHERE company_id = $1 ORDER BY created_at',
      [companyId]
    );
    if (docs.length === 0) return [];

    const { rows: arquivos } = await query(
      `SELECT id, documento_id, nome, tipo_mime, tamanho_bytes FROM documento_arquivos
        WHERE documento_id = ANY($1) ORDER BY created_at`,
      [docs.map((d) => d.id)]
    );

    return docs.map((d) => ({
      id: d.id,
      companyId: d.company_id,
      tipo: d.tipo,
      numero: d.numero,
      validade: fmtValidade(d.validade),
      status: d.status as DocumentoStatus,
      motivoRejeicao: d.motivo_rejeicao,
      arquivos: arquivos.filter((a) => a.documento_id === d.id).map(rowToArquivo),
    }));
  },

  // O suficiente pra conferir posse e status antes de qualquer ação — sem
  // arquivos, que quem chama busca à parte só quando precisa.
  async getOne(id: string): Promise<(Omit<Documento, 'arquivos'>) | null> {
    const { rows } = await query('SELECT * FROM documentos_fornecedor WHERE id = $1', [id]);
    if (!rows[0]) return null;
    const d = rows[0];
    return {
      id: d.id,
      companyId: d.company_id,
      tipo: d.tipo,
      numero: d.numero,
      validade: fmtValidade(d.validade),
      status: d.status as DocumentoStatus,
      motivoRejeicao: d.motivo_rejeicao,
    };
  },

  async hasArquivo(documentoId: string): Promise<boolean> {
    const { rows } = await query('SELECT 1 FROM documento_arquivos WHERE documento_id = $1 LIMIT 1', [documentoId]);
    return rows.length > 0;
  },

  async create(companyId: string, tipo: string, numero: string, validade: string): Promise<Documento> {
    const id = novoId('doc');
    await query(
      'INSERT INTO documentos_fornecedor (id, company_id, tipo, numero, validade) VALUES ($1,$2,$3,$4,$5)',
      [id, companyId, tipo, numero, validade || null]
    );
    return { id, companyId, tipo, numero, validade, status: 'rascunho', motivoRejeicao: '', arquivos: [] };
  },

  async update(id: string, tipo: string, numero: string, validade: string): Promise<void> {
    await query(
      'UPDATE documentos_fornecedor SET tipo = $2, numero = $3, validade = $4 WHERE id = $1',
      [id, tipo, numero, validade || null]
    );
  },

  async remove(id: string): Promise<boolean> {
    const { rowCount } = await query('DELETE FROM documentos_fornecedor WHERE id = $1', [id]);
    return !!rowCount;
  },

  // Volta pro rascunho ao reenviar — se tinha sido rejeitado antes, o
  // motivo antigo não faz mais sentido depois de uma nova análise.
  async enviarParaAnalise(id: string): Promise<void> {
    await query(
      "UPDATE documentos_fornecedor SET status = 'em_analise', enviado_em = NOW(), motivo_rejeicao = '' WHERE id = $1",
      [id]
    );
  },

  async cancelarEnvio(id: string): Promise<boolean> {
    const { rowCount } = await query(
      "UPDATE documentos_fornecedor SET status = 'rascunho' WHERE id = $1 AND status = 'em_analise'",
      [id]
    );
    return !!rowCount;
  },

  async aprovar(id: string): Promise<boolean> {
    const { rowCount } = await query(
      "UPDATE documentos_fornecedor SET status = 'aprovado', revisado_em = NOW() WHERE id = $1",
      [id]
    );
    return !!rowCount;
  },

  async rejeitar(id: string, motivo: string): Promise<boolean> {
    const { rowCount } = await query(
      "UPDATE documentos_fornecedor SET status = 'rejeitado', revisado_em = NOW(), motivo_rejeicao = $2 WHERE id = $1",
      [id, motivo]
    );
    return !!rowCount;
  },

  // Fila do admin: tudo que já foi enviado pra análise alguma vez (em
  // análise primeiro, depois o histórico de aprovados/rejeitados).
  async listPendentes(): Promise<DocumentoParaAdmin[]> {
    const { rows: docs } = await query(
      `SELECT d.*, c.id AS empresa_id, c.name AS empresa_nome
         FROM documentos_fornecedor d
         JOIN companies c ON c.id = d.company_id
        WHERE d.status IN ('em_analise', 'aprovado', 'rejeitado')
        ORDER BY (d.status = 'em_analise') DESC, d.enviado_em DESC`
    );
    if (docs.length === 0) return [];

    const { rows: arquivos } = await query(
      `SELECT id, documento_id, nome, tipo_mime, tamanho_bytes FROM documento_arquivos
        WHERE documento_id = ANY($1) ORDER BY created_at`,
      [docs.map((d) => d.id)]
    );

    return docs.map((d) => ({
      id: d.id,
      companyId: d.company_id,
      empresaId: d.empresa_id,
      empresaNome: d.empresa_nome,
      tipo: d.tipo,
      numero: d.numero,
      validade: fmtValidade(d.validade),
      status: d.status as DocumentoStatus,
      motivoRejeicao: d.motivo_rejeicao,
      arquivos: arquivos.filter((a) => a.documento_id === d.id).map(rowToArquivo),
    }));
  },

  // Pra página pública: só o que já foi aprovado, agrupado por empresa —
  // nunca expõe o arquivo em si, só o que foi verificado (tipo/número/validade).
  async listAprovadosPorEmpresas(
    companyIds: string[]
  ): Promise<Record<string, { tipo: string; numero: string; validade: string }[]>> {
    if (companyIds.length === 0) return {};
    const { rows } = await query(
      `SELECT company_id, tipo, numero, validade FROM documentos_fornecedor
        WHERE company_id = ANY($1) AND status = 'aprovado' ORDER BY tipo`,
      [companyIds]
    );
    const out: Record<string, { tipo: string; numero: string; validade: string }[]> = {};
    for (const r of rows) {
      const lista = out[r.company_id] ?? (out[r.company_id] = []);
      lista.push({ tipo: r.tipo, numero: r.numero, validade: fmtValidade(r.validade) });
    }
    return out;
  },

  async addArquivo(documentoId: string, nome: string, tipoMime: string, conteudo: Buffer): Promise<ArquivoDocumento> {
    const id = novoId('arq');
    await query(
      `INSERT INTO documento_arquivos (id, documento_id, nome, tipo_mime, tamanho_bytes, conteudo)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [id, documentoId, nome, tipoMime, conteudo.length, conteudo]
    );
    return { id, nome, tipoMime, tamanhoBytes: conteudo.length };
  },

  async getArquivo(id: string): Promise<ArquivoComConteudo | null> {
    const { rows } = await query('SELECT * FROM documento_arquivos WHERE id = $1', [id]);
    if (!rows[0]) return null;
    return {
      id: rows[0].id,
      documentoId: rows[0].documento_id,
      nome: rows[0].nome,
      tipoMime: rows[0].tipo_mime,
      tamanhoBytes: rows[0].tamanho_bytes,
      conteudo: rows[0].conteudo,
    };
  },

  async removeArquivo(id: string): Promise<boolean> {
    const { rowCount } = await query('DELETE FROM documento_arquivos WHERE id = $1', [id]);
    return !!rowCount;
  },
};
