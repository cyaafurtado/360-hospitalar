import { query } from '../connection';
import { novoId } from '../../services/auth.service';

export interface Foto {
  id: string;
  companyId: string;
  nome: string;
  tipoMime: string;
  tamanhoBytes: number;
}

export interface FotoComConteudo extends Foto {
  conteudo: Buffer;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToFoto(r: any): Foto {
  return { id: r.id, companyId: r.company_id, nome: r.nome, tipoMime: r.tipo_mime, tamanhoBytes: r.tamanho_bytes };
}

export const FotosRepo = {
  async listByCompany(companyId: string): Promise<Foto[]> {
    const { rows } = await query(
      'SELECT id, company_id, nome, tipo_mime, tamanho_bytes FROM fotos_fornecedor WHERE company_id = $1 ORDER BY created_at',
      [companyId]
    );
    return rows.map(rowToFoto);
  },

  // Pra montar a lista de várias empresas (diretório público) numa só ida ao banco.
  async listByCompanies(companyIds: string[]): Promise<Record<string, Foto[]>> {
    if (companyIds.length === 0) return {};
    const { rows } = await query(
      'SELECT id, company_id, nome, tipo_mime, tamanho_bytes FROM fotos_fornecedor WHERE company_id = ANY($1) ORDER BY created_at',
      [companyIds]
    );
    const out: Record<string, Foto[]> = {};
    for (const r of rows) {
      const lista = out[r.company_id] ?? (out[r.company_id] = []);
      lista.push(rowToFoto(r));
    }
    return out;
  },

  async countByCompany(companyId: string): Promise<number> {
    const { rows } = await query('SELECT COUNT(*) AS total FROM fotos_fornecedor WHERE company_id = $1', [companyId]);
    return parseInt(rows[0].total, 10);
  },

  async add(companyId: string, nome: string, tipoMime: string, conteudo: Buffer): Promise<Foto> {
    const id = novoId('foto');
    await query(
      `INSERT INTO fotos_fornecedor (id, company_id, nome, tipo_mime, tamanho_bytes, conteudo)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [id, companyId, nome, tipoMime, conteudo.length, conteudo]
    );
    return { id, companyId, nome, tipoMime, tamanhoBytes: conteudo.length };
  },

  async getOne(id: string): Promise<FotoComConteudo | null> {
    const { rows } = await query('SELECT * FROM fotos_fornecedor WHERE id = $1', [id]);
    if (!rows[0]) return null;
    return { ...rowToFoto(rows[0]), conteudo: rows[0].conteudo };
  },

  async remove(id: string): Promise<boolean> {
    const { rowCount } = await query('DELETE FROM fotos_fornecedor WHERE id = $1', [id]);
    return !!rowCount;
  },
};
