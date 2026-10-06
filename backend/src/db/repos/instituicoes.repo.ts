import { query } from '../connection';
import { novoId } from '../../services/auth.service';

export interface Instituicao {
  id: string;
  usuarioId: string;
  tipo: string;
  name: string;
  cnpj: string;
  cnes: string;
  uf: string;
  city: string;
  about: string;
  email: string;
  phone: string;
}

export interface InstituicaoInput {
  tipo: string;
  name: string;
  cnpj: string;
  cnes: string;
  uf: string;
  city: string;
  about: string;
  email: string;
  phone: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToInstituicao(r: any): Instituicao {
  return {
    id: r.id,
    usuarioId: r.usuario_id,
    tipo: r.tipo,
    name: r.name,
    cnpj: r.cnpj,
    cnes: r.cnes,
    uf: r.uf,
    city: r.city,
    about: r.about,
    email: r.email,
    phone: r.phone,
  };
}

export const InstituicoesRepo = {
  async getByUsuario(usuarioId: string): Promise<Instituicao | null> {
    const { rows } = await query('SELECT * FROM instituicoes WHERE usuario_id = $1', [usuarioId]);
    return rows[0] ? rowToInstituicao(rows[0]) : null;
  },

  // O assistente de cadastro só chama isso uma vez, no fim — mas faz upsert
  // (não só insert) pra não quebrar se a pessoa reenviar o formulário.
  async upsert(usuarioId: string, d: InstituicaoInput): Promise<Instituicao> {
    const { rows: existentes } = await query('SELECT id FROM instituicoes WHERE usuario_id = $1', [usuarioId]);

    if (existentes[0]) {
      const { rows } = await query(
        `UPDATE instituicoes SET
           tipo = $2, name = $3, cnpj = $4, cnes = $5, uf = $6, city = $7, about = $8, email = $9, phone = $10
         WHERE usuario_id = $1 RETURNING *`,
        [usuarioId, d.tipo, d.name, d.cnpj, d.cnes, d.uf, d.city, d.about, d.email, d.phone]
      );
      return rowToInstituicao(rows[0]);
    }

    const id = novoId('inst');
    const { rows } = await query(
      `INSERT INTO instituicoes (id, usuario_id, tipo, name, cnpj, cnes, uf, city, about, email, phone)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [id, usuarioId, d.tipo, d.name, d.cnpj, d.cnes, d.uf, d.city, d.about, d.email, d.phone]
    );
    return rowToInstituicao(rows[0]);
  },
};
