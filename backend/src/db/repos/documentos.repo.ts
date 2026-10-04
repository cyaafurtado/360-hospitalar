import { query } from '../connection';
import { novoId } from '../../services/auth.service';

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
  arquivos: ArquivoDocumento[];
}

export interface ArquivoComConteudo extends ArquivoDocumento {
  documentoId: string;
  conteudo: Buffer;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToArquivo(r: any): ArquivoDocumento {
  return { id: r.id, nome: r.nome, tipoMime: r.tipo_mime, tamanhoBytes: r.tamanho_bytes };
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
      validade: d.validade ? new Date(d.validade).toISOString().slice(0, 10) : '',
      arquivos: arquivos.filter((a) => a.documento_id === d.id).map(rowToArquivo),
    }));
  },

  // Só id + empresa — o suficiente pra conferir posse antes de qualquer ação.
  async getOne(id: string): Promise<{ id: string; companyId: string } | null> {
    const { rows } = await query('SELECT id, company_id FROM documentos_fornecedor WHERE id = $1', [id]);
    return rows[0] ? { id: rows[0].id, companyId: rows[0].company_id } : null;
  },

  async create(companyId: string, tipo: string, numero: string, validade: string): Promise<Documento> {
    const id = novoId('doc');
    await query(
      'INSERT INTO documentos_fornecedor (id, company_id, tipo, numero, validade) VALUES ($1,$2,$3,$4,$5)',
      [id, companyId, tipo, numero, validade || null]
    );
    return { id, companyId, tipo, numero, validade, arquivos: [] };
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
